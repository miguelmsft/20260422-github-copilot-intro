# Research Report: GitHub Copilot Approval Configuration & Bypass-Mode Guardrails

**Date:** 2026-04-22
**Researcher:** Copilot Web Researcher Agent
**Topic slug:** approvals-and-bypass
**Sources consulted:** 10 web pages (8 GitHub Docs + VS Code Docs pages deep-read, 1 referenced GitHub Blog changelog post, 1 VS Code agent-mode page reviewed but not directly cited), 0 GitHub repositories

---

## Executive Summary

GitHub Copilot's agentic surfaces — the **Copilot CLI** and **VS Code agent mode** — both use a **permission-based security model**. By default, read-only actions (viewing files, searching, listing) run automatically, while any action that could change your system (running shell commands, editing files, fetching URLs, invoking MCP tools) requires an **explicit approval prompt** each time. Users can loosen or tighten those defaults in three layers: (1) per-command/per-tool rules configured via flags, slash commands, or settings; (2) session-scoped "bypass" modes that skip approval prompts; and (3) enterprise device-management policies that can override individual choices.

For the CLI, approvals are configured through `--allow-tool`, `--deny-tool`, `--allow-url`, `--add-dir`, and path/URL flags, or interactively via slash commands like `/allow-all` (alias `/yolo`), `/reset-allowed-tools`, `/add-dir`, and `/list-dirs`. User-level configuration lives in `~/.copilot/config.json`, with repository overrides in `.github/copilot/settings.json` and personal overrides in `.github/copilot/settings.local.json`. For VS Code, approvals are configured in `settings.json` under the `chat.tools.*` and `chat.agent.*` namespaces — notably `chat.tools.terminal.autoApprove` (allow/deny regex rules for terminal commands), `chat.tools.edits.autoApprove` (protect sensitive files like `.env`), `chat.tools.global.autoApprove`, and `chat.permissions.default`. A Chat-view **permissions picker** exposes three session-level permission levels: **Default Approvals**, **Bypass Approvals**, and **Autopilot (Preview)**.

When per-step prompts are bypassed, several guardrails still apply: `--deny-tool` and `--deny-url` rules still take precedence over `--allow-all`; agent sandboxing (when enabled in VS Code) continues to enforce file-system and network boundaries at the kernel level; Workspace Trust still gates agent use in untrusted folders; CLI `preToolUse` hooks still run before every tool call and can deny execution; premium-request billing limits still apply; and enterprise policies such as `ChatToolsAutoApprove`, `ChatToolsTerminalEnableAutoApprove`, and `ChatAgentMode` can forcibly disable bypass modes at the organization level regardless of user choice. The CLI docs explicitly recommend using `--allow-all` / `--yolo` **only in an isolated environment**; VS Code's docs warn users to only enable Bypass Approvals or Autopilot if they understand the security implications, and to consider agent sandboxing or a container in high-risk or prompt-injection scenarios.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Key Concepts](#2-key-concepts)
3. [Part A — Configuring Approvals in the Copilot CLI](#3-part-a--configuring-approvals-in-the-copilot-cli)
4. [Part B — Configuring Approvals in VS Code](#4-part-b--configuring-approvals-in-vs-code)
5. [Part C — Bypass / Autopilot Mode & Guardrails That Remain](#5-part-c--bypass--autopilot-mode--guardrails-that-remain)
6. [Best-Practice Setup Checklist Before Enabling Autopilot](#6-best-practice-setup-checklist-before-enabling-autopilot)
7. [Enterprise / Admin Controls](#7-enterprise--admin-controls)
8. [Research Limitations](#8-research-limitations)
9. [Complete Reference List](#9-complete-reference-list)

---

## 1. Overview

### What It Is

Approvals are the consent prompts Copilot's agent surfaces show before they run a tool that could change your machine (shell command, file edit, URL fetch, MCP call). Both the CLI and VS Code let you pre-approve tools, pre-deny tools, or turn the per-step prompts off entirely with a "bypass" or "autopilot" mode.

### Why It Matters

> "a shell command can do anything your user account can do: install packages, delete files, push code, or make network requests."
> — Source: [Allowing and denying tool use — GitHub Docs](https://docs.github.com/en/copilot/how-tos/copilot-cli/allowing-tools)

Because the agent runs with your user privileges, the approval system is the main line of defense between a model's suggestion and changes landing on disk or over the network.

### Key Features (both surfaces)

- Read-only tools run without prompting; write/execute/fetch tools prompt.
- Allow-rules, deny-rules, and allowlist-only modes can be combined; **deny always wins**.
- Approvals can be scoped per-command, per-session, per-workspace, or "always".
- A single flag (`--allow-all` / `--yolo` in CLI; **Bypass Approvals** / **Autopilot** picker in VS Code) disables per-step prompts.
- Organization policies can override user-level choices.

---

## 2. Key Concepts

### 2.1 The two layers of control (CLI)

> "There are two layers of control you can use when specifying tool permissions in command-line options. You can: Restrict the choice of tools available to the AI model. Allow or deny permission for specific tools."
> — Source: [Allowing and denying tool use — GitHub Docs](https://docs.github.com/en/copilot/how-tos/copilot-cli/allowing-tools)

- `--available-tools` / `--excluded-tools` define **what the model is aware of**.
- `--allow-tool` / `--deny-tool` define **what runs without a prompt**.

### 2.2 Permission-pattern syntax (CLI)

Rules are written as `Kind(argument)`:

| Kind | Meaning | Example |
| --- | --- | --- |
| `shell` | Shell command execution | `shell(git push)`, `shell(git:*)`, `shell` |
| `write` | File creation or modification | `write`, `write(src/*.ts)` |
| `read` | File or directory reads | `read`, `read(.env)` |
| `SERVER-NAME` | MCP server tool invocation | `MyMCP(create_issue)`, `MyMCP` |
| `url` | URL access via web-fetch or shell | `url(github.com)`, `url(https://*.api.com)` |
| `memory` | Storing facts to agent memory | `memory` |

> "For `shell` rules, the `:*` suffix matches the command stem followed by a space, preventing partial matches. For example, `shell(git:*)` matches `git push` and `git pull` but does not match `gitea`."
> — Source: [GitHub Copilot CLI command reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference)

### 2.3 Deny always wins

> "Deny rules always take precedence over allow rules, even when `--allow-all` is set."
> — Source: [GitHub Copilot CLI command reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference)

### 2.4 Permission levels (VS Code picker)

| Level | Behavior |
| --- | --- |
| **Default Approvals** | "Uses your configured approval settings. Tools that require approval show a confirmation dialog before they run. The agent might ask clarifying questions if needed." |
| **Bypass Approvals** | "Auto-approves all tool calls without showing confirmation dialogs and automatically retries on errors. The agent might ask clarifying questions if needed." |
| **Autopilot (Preview)** | "Auto-approves all tool calls without showing confirmation dialogs and auto-responds to clarifying questions. The agent continues working autonomously until the task is completed." |

> — Source: [Use tools with agents — Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/agent-tools)

---

## 3. Part A — Configuring Approvals in the Copilot CLI

### 3.1 Interactive first-time prompt (3 choices)

When Copilot first needs a tool that can modify your system, it offers three choices:

> "1. Yes — Choose this option to allow Copilot to run this particular command, this time only. The next time it needs to use this tool, it will ask you again.
> 2. Yes, and approve TOOL for the rest of the running session — Choose this option to allow Copilot to use this tool for the duration of the currently running session. It will ask for your approval again in new sessions, or if you resume the current session in the future.
> 3. No, and tell Copilot what to do differently (Esc) — Choose this option to cancel the proposed command and instruct Copilot to try a different approach."
> — Source: [Configuring GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/configure-copilot-cli)

> "For example, if Copilot asks you to allow it to run the command `rm ./this-file.txt`, and you choose option 2, then Copilot can run any `rm` command (for example, `rm -rf ./*`) during the current run of this session, without asking for your approval."
> — Source: [Configuring GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/configure-copilot-cli)

### 3.2 Command-line flags — the cheat sheet

```bash
# Allow a single tool type (no more prompts for that tool family)
copilot --allow-tool='shell'

# Allow a specific command, deny another
copilot --allow-tool='shell(git:*)' --deny-tool='shell(git push)'

# Prevent rm in any form
copilot --deny-tool='shell(rm)'

# Allow all file writes (skip per-file edit prompts)
copilot --allow-tool='write'

# Allow only selected MCP server tools
copilot --allow-tool='MyMCP(create_issue), MyMCP(delete_issue)'

# Combine both control layers: allowlist of tools the model even sees,
# plus permission for git commands except push
copilot \
  --available-tools='bash,edit,view,grep,glob' \
  --allow-tool='shell(git:*)' \
  --deny-tool='shell(git push)'

# Blanket allow, but still block dangerous commands
copilot --allow-all-tools --deny-tool='shell(rm)' --deny-tool='shell(git push)'
```
> — Source: [Allowing and denying tool use — GitHub Docs](https://docs.github.com/en/copilot/how-tos/copilot-cli/allowing-tools) and [Configuring GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/configure-copilot-cli) | Provenance: verbatim/adapted

### 3.3 Slash commands that manage permissions

From the CLI command reference:

| Slash command | Effect |
| --- | --- |
| `/allow-all [on|off|show]` or `/yolo [on|off|show]` | "Enable all permissions (tools, paths, and URLs)." |
| `/reset-allowed-tools` | "Reset the list of allowed tools." |
| `/add-dir PATH` | "Add a directory to the allowed list for file access." |
| `/list-dirs` | "Display all of the directories for which file access has been allowed." |
| `/cwd`, `/cd [PATH]` | "Change the working directory or display the current directory." |
| `/mcp` | Manage MCP servers (see `mcp` sub-verbs). |

> — Source: [GitHub Copilot CLI command reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference)

> "Entering `/allow-all` and `/yolo` enables permissions for the current session. Entering these slash commands again does not disable permissions—in other words, these commands don't toggle permissions on and off."
> — Source: [Allowing GitHub Copilot CLI to work autonomously](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/autopilot)

> "The `/reset-allowed-tools` slash command revokes all permissions you granted during the current interactive session. This applies equally to permissions you gave by responding to prompts, and to the use of the `/allow-all` or `/yolo` slash commands."
> — Source: [Allowing and denying tool use — GitHub Docs](https://docs.github.com/en/copilot/how-tos/copilot-cli/allowing-tools)

### 3.4 Path (directory) permissions

> "By default, Copilot CLI can access the current working directory, its subdirectories, and the system temp directory. Path permissions apply to shell commands, file operations (create, edit, view), and search tools (such as grep and glob patterns)."
> — Source: [Configuring GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/configure-copilot-cli)

Relevant flags:

- `--add-dir=PATH` — add a directory to the allowed list (repeatable).
- `--allow-all-paths` — "Disable file path verification and allow access to any path."
- `--disallow-temp-dir` — "Prevent automatic access to the system temporary directory."

> — Source: [GitHub Copilot CLI command reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference)

Trusted folders persist in the user config:

> "Open the CLI's `config.json` file. By default, it's stored in a `.copilot` folder under your home directory: macOS/Linux: `~/.copilot/config.json`; Windows: `$HOME\.copilot\config.json` ... Edit the contents of the `trusted_folders` array."
> — Source: [Configuring GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/configure-copilot-cli)

### 3.5 URL (network) permissions

> "URL permissions control which external URLs Copilot can access. By default, all URLs require approval before access is granted."
> — Source: [Configuring GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/configure-copilot-cli)

```bash
# Pre-approve a single domain
copilot --allow-url=github.com

# Deny a domain (takes precedence over --allow-url)
copilot --deny-url=example.com

# Skip URL verification entirely (dangerous)
copilot --allow-all-urls
```
> — Source: [Configuring GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/configure-copilot-cli) | Provenance: adapted

Caveats flagged in the docs:

> "URLs in file contents, config files, or environment variables read by commands are not detected. Obfuscated URLs (such as split strings or escape sequences) may not be detected. HTTP and HTTPS are treated as different protocols and require separate approval."
> — Source: [Configuring GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/configure-copilot-cli)

### 3.6 CLI configuration file — location, scopes, format

Settings cascade from user → repository → local:

| Scope | Location | Purpose |
| --- | --- | --- |
| User | `~/.copilot/config.json` (override with `COPILOT_HOME`) | Global defaults for all repositories |
| Repository | `.github/copilot/settings.json` | Shared repository configuration (committed) |
| Local | `.github/copilot/settings.local.json` | Personal overrides (add to `.gitignore`) |

> "Command-line flags and environment variables always take the highest precedence."
> — Source: [GitHub Copilot CLI command reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference)

Permission-related user-config keys documented in the reference:

- `allowedUrls` — `string[]`, default `[]` — "URLs or domains allowed without prompting."
- `denied_urls` — `string[]`, default `[]` — "URLs or domains blocked (takes precedence over `allowed_urls`)."
- `trusted_folders` — array of directories permanently trusted for Copilot to operate in.
- `hooks` — inline user-level hook definitions (see below).
- `disableAllHooks` — `boolean`, default `false`.
- `storeTokenPlaintext` — `boolean`, default `false` — whether to fall back to plain-text token storage when no keychain is present.

> — Source: [GitHub Copilot CLI command reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference)

**Example `~/.copilot/config.json`** (illustrative, field names taken from the reference):

```jsonc
{
  "trusted_folders": [
    "/Users/alex/code/my-project",
    "/Users/alex/code/sandbox"
  ],
  "allowedUrls": ["github.com", "api.github.com", "registry.npmjs.org"],
  "denied_urls": ["example.com"],
  "model": "auto",
  "autoUpdate": true,
  "banner": "once",
  "logLevel": "default",
  "disableAllHooks": false
}
```
> — Source: [GitHub Copilot CLI command reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference) | Provenance: synthesized from the documented schema

**Note:** The reference table documents the existence and purpose of keys such as `allowedUrls`, `denied_urls`, and (on the trusted-folders page) `trusted_folders`, but does not show a full combined config example. The JSON above is a schema-accurate composition, not a verbatim quote.

### 3.7 Relevant environment variables

| Variable | Effect |
| --- | --- |
| `COPILOT_ALLOW_ALL` | "Set to `true` to allow all permissions automatically (equivalent to `--allow-all`)." |
| `COPILOT_HOME` | "Override the configuration and state directory. Default: `$HOME/.copilot`." |
| `COPILOT_GITHUB_TOKEN` / `GH_TOKEN` / `GITHUB_TOKEN` | Authentication tokens (in this precedence order). |
| `COPILOT_SUBAGENT_MAX_DEPTH` | "Maximum subagent nesting depth. Default: `6`. Range: `1`–`256`." |
| `COPILOT_SUBAGENT_MAX_CONCURRENT` | "Maximum concurrent subagents across the entire session tree. Default: `32`. Range: `1`–`256`." |

> — Source: [GitHub Copilot CLI command reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference)

### 3.8 Secret redaction

> "`--secret-env-vars=VAR ...` — Redact an environment variable from shell and MCP server environments (can be used multiple times). For multiple variables, use a quoted, comma-separated list. The values in the `GITHUB_TOKEN` and `COPILOT_GITHUB_TOKEN` environment variables are redacted from output by default."
> — Source: [GitHub Copilot CLI command reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference)

### 3.9 "Permissive" options summary

> "`--allow-all-tools` — Full access to the available tools. `--allow-all` or `--yolo` — Equivalent to using all of the `--allow-all-tools`, `--allow-all-paths`, and `--allow-all-urls` options when starting the CLI."
> — Source: [Allowing and denying tool use — GitHub Docs](https://docs.github.com/en/copilot/how-tos/copilot-cli/allowing-tools)

> "It is strongly recommended that you only use these options in an isolated environment. You should never use an alias to apply one of these options every time you start Copilot CLI, as doing so would allow Copilot to use any tool without your explicit permission every time you use the CLI, which could lead to unintended consequences."
> — Source: [Allowing and denying tool use — GitHub Docs](https://docs.github.com/en/copilot/how-tos/copilot-cli/allowing-tools)

---

## 4. Part B — Configuring Approvals in VS Code

### 4.1 The approval dialog and scoped approvals

> "When the agent wants to run a terminal command, it shows an approval dialog with the exact command it intends to run. Review it. If it looks right, approve it. If something looks off, select Skip and send a message to correct the direction."
> — Source: [Your first agent session — Visual Studio Code](https://code.visualstudio.com/learn/foundations/approvals-autonomy-and-context-budget)

The approval dropdown has two dimensions:

> "Specificity - how broadly the approval applies: Command prefix — approve any command that starts with a specific prefix. Exact command — approve only the precise command line. All commands — approve all terminal commands."
> "Scope - how long the approval lasts: This session — applies for the rest of the current conversation. This workspace — persists for the project. Always — applies across future sessions."
> — Source: [Your first agent session — Visual Studio Code](https://code.visualstudio.com/learn/foundations/approvals-autonomy-and-context-budget)

### 4.2 The permissions picker (session-level)

Three permission levels are selected from the picker in the Chat input area: **Default Approvals**, **Bypass Approvals**, and **Autopilot (Preview)** — full behavior quoted in §2.4 above.

> "By default, new chat sessions start with the Default Approvals level. To persist your preferred permission level across sessions, configure the `chat.permissions.default` [setting]."
> — Source: [Use tools with agents — Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/agent-tools)

> "Bypass Approvals and Autopilot bypass manual approval prompts, including for potentially destructive actions like file edits, terminal commands, and external tool calls. The first time you enable either level, a warning dialog asks you to confirm. Only use these levels if you understand the security implications."
> — Source: [Use tools with agents — Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/agent-tools)

### 4.3 Terminal command auto-approval rules

The setting `chat.tools.terminal.autoApprove` is the main VS Code analogue of `--allow-tool='shell(...)'`.

> "Set commands to `true` to automatically approve them. Set commands to `false` to always require approval. Use regular expressions by wrapping patterns in `/` characters."
> — Source: [Use tools with agents — Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/agent-tools)

Example `.vscode/settings.json` (workspace) or user `settings.json`:

```jsonc
{
  // Which terminal commands auto-approve (true) or always prompt (false)
  "chat.tools.terminal.autoApprove": {
    // Allow simple, safe commands
    "mkdir": true,
    "ls": true,
    "npm install": true,

    // Allow git status and any `git show ...`
    "/^git (status|show\\b.*)$/": true,

    // Block destructive or ambiguous commands even if a broader rule would allow them
    "del": false,
    "rm": false,
    "/dangerous/": false
  },

  // Protect sensitive files from silent edit auto-approval
  "chat.tools.edits.autoApprove": {
    "**/.env": false,
    "**/.env.*": false,
    "**/secrets.*": false
  },

  // URL/domain two-step auto-approval
  "chat.tools.urls.autoApprove": {
    "https://api.github.com": {
      "approveRequest": true,
      "approveResponse": false
    }
  },

  // Grant read-only access to an extra folder outside the workspace
  "chat.additionalReadAccessFolders": [
    "/Users/alex/reference-docs"
  ],

  // Start new sessions in "Default Approvals"
  "chat.permissions.default": "default"
}
```
> — Source: [Use tools with agents — Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/agent-tools) and [Security — Visual Studio Code](https://code.visualstudio.com/docs/copilot/security) | Provenance: synthesized from the documented schema (individual keys and their formats are documented; the combined example is composed)

Important matching rule:

> "By default, patterns match against individual subcommands. For a command to be auto-approved, all subcommands must match a `true` entry and must not match a `false` entry."
> — Source: [Use tools with agents — Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/agent-tools)

### 4.4 Related chat.tools.* / chat.agent.* settings

| Setting | Purpose |
| --- | --- |
| `chat.tools.terminal.autoApprove` | Per-command allow/deny rules for terminal execution. |
| `chat.tools.terminal.enableAutoApprove` | "permanently disable auto-approve functionality". Managed at org level. |
| `chat.tools.terminal.blockDetectedFileWrites` (experimental) | Extra guardrail against commands that write files. |
| `chat.tools.terminal.ignoreDefaultAutoApproveRules` (experimental) | "disable all default rules (both allow and block), giving full control over all rules." |
| `chat.tools.edits.autoApprove` | Glob map controlling which files skip edit review (set `false` to protect). |
| `chat.tools.global.autoApprove` | Global kill-switch for tool approval prompts; org-manageable. |
| `chat.tools.urls.autoApprove` | URL/domain rules for the `fetch` tool (pre- and post-approval). |
| `chat.tools.eligibleForAutoApproval` (Experimental) | Per-tool flag — "to always require manual approval for that tool." |
| `chat.permissions.default` | Default permission level (`default` / `bypass` / `autopilot`) for new sessions. |
| `chat.autopilot.enabled` | Whether Autopilot appears in the permissions picker. |
| `chat.agent.networkFilter` (org-managed) | "restrict which domains agent tools (fetch tool, integrated browser) and sandboxed terminal commands can access." |
| `chat.agent.sandbox.enabled` (org-managed) | Turns on OS-level agent sandboxing (Preview). |
| `chat.additionalReadAccessFolders` | Extra read-only folders beyond the workspace. |

> — Source: [Use tools with agents — Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/agent-tools) and [Security — Visual Studio Code](https://code.visualstudio.com/docs/copilot/security)

### 4.5 Chat-view slash commands for auto-approval

> "You can also toggle this [`chat.tools.global.autoApprove`] directly from chat by using the `/yolo` or `/autoApprove` [commands] or `/disableAutoApprove` to disable it. The first time you enable global auto-approval, a warning dialog asks you to confirm."
> — Source: [Use tools with agents — Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/agent-tools)

### 4.6 "Manage Tool Approval" — central UI

> "Use the Chat: Manage Tool Approval command from the Command Palette (⇧⌘P (Windows, Linux Ctrl+Shift+P)) to centrally review and configure tool approvals. The Quick Pick shows all tools grouped by their source, such as an MCP server or extension."
> — Source: [Use tools with agents — Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/agent-tools)

> "For each tool, you can configure two types of approvals: Pre-approval ('without approval'): skip the confirmation dialog before the tool runs. Post-approval ('without reviewing result'): skip reviewing the tool's output before it is added to the chat context. This is relevant for tools that return external data, where the content might contain prompt injection attempts."
> — Source: [Use tools with agents — Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/agent-tools)

To clear everything, use **Chat: Reset Tool Confirmations**.

### 4.7 Workspace vs user settings

Everything configurable here works in either scope. The VS Code security baseline specifically recommends keeping auto-approval scoped as narrowly as possible:

> "Keep auto-approval scoped to the session. Grant tool and terminal permissions at the session level rather than workspace or user level. This limits the duration of elevated trust."
> — Source: [Security — Visual Studio Code](https://code.visualstudio.com/docs/copilot/security)

### 4.8 Differences from the CLI

| Aspect | CLI | VS Code |
| --- | --- | --- |
| Per-command approval syntax | `--allow-tool='shell(git:*)'` (glob-like patterns) | `chat.tools.terminal.autoApprove` JSON map with regex via `/.../` |
| "Bypass per-step prompts" | `--allow-all` / `--yolo` / `/allow-all` / `/yolo` | Permission picker → **Bypass Approvals**; or `chat.tools.global.autoApprove`; or `/yolo` / `/autoApprove` |
| "Run without even pausing for clarifying questions" | Autopilot mode (`--autopilot` / Shift+Tab → Autopilot) combined with `--allow-all`; `--no-ask-user` is a separate, weaker option | **Autopilot (Preview)** permission level |
| File-scope permission | `--add-dir`, `trusted_folders` in `config.json` | Workspace Trust + `chat.additionalReadAccessFolders` |
| URL allow/deny | `--allow-url`, `--deny-url`, `allowedUrls`/`denied_urls` | `chat.tools.urls.autoApprove` + Trusted Domains |
| OS-level sandbox | N/A (relies on rules) | `chat.agent.sandbox.enabled` (macOS/Linux/WSL2, Preview) |
| Secret redaction | `--secret-env-vars` (`GITHUB_TOKEN` redacted by default) | VS Code secure credentials store for MCP secrets |
| Enterprise override | Via user/repo/local settings & MDM | VS Code device-management policies (see §7) |

---

## 5. Part C — Bypass / Autopilot Mode & Guardrails That Remain

### 5.1 What is bypass / autopilot?

**CLI `--allow-all` / `--yolo`:**

> "With `--allow-all`, you are still in the normal interactive flow. Copilot will still stop and ask you what you want it to do when it reaches a decision point. However, when Copilot CLI needs to do something that would normally require approval, such as using tools, paths, or URLs, it will go ahead without asking for permission."
> — Source: [Allowing GitHub Copilot CLI to work autonomously](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/autopilot)

**CLI autopilot mode:**

> "Autopilot mode allows Copilot CLI to work through a task without waiting for your input after each step. Once you give the initial instruction, Copilot CLI works through each step autonomously until it determines the task is complete."
> — Source: [Allowing GitHub Copilot CLI to work autonomously](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/autopilot)

> "In autopilot mode, Copilot keeps on going until one of these happens: The agent determines that the task is complete. A problem occurs that prevents further progress. You press Ctrl+C to stop the agent from continuing. The maximum continuation limit is reached (if set)."
> — Source: [Allowing GitHub Copilot CLI to work autonomously](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/autopilot)

**VS Code Bypass Approvals vs Autopilot:**

> "With Bypass Approvals, the agent still stops and waits if it has a blocking question that requires a decision. You've removed the security prompts, but you're still in the loop for judgment calls. Autopilot goes further than Bypass. It auto-approves tool calls, auto-retries on errors, and resolves blocking questions on its own until it decides the task is complete."
> — Source: [Your first agent session — Visual Studio Code](https://code.visualstudio.com/learn/foundations/approvals-autonomy-and-context-budget)

### 5.2 Guardrails that **remain** when per-step prompts are off

Even with `--allow-all` / `/yolo` / Bypass / Autopilot:

1. **Deny rules still fire.**
   > "Deny rules always take precedence over allow rules, even when `--allow-all` is set."
   > — Source: [GitHub Copilot CLI command reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference)

2. **Autopilot continuation limit** (CLI) prevents runaway loops:
   > "`--max-autopilot-continues=COUNT` — Maximum number of continuation messages in autopilot mode (default: unlimited). ... You can include the `--max-autopilot-continues` option to set a maximum continuation limit to prevent runaway loops. This is especially important in programmatic contexts where you won't be there to intervene if something goes wrong."
   > — Source: [Allowing GitHub Copilot CLI to work autonomously](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/autopilot)

3. **Secret redaction for default tokens** (CLI):
   > "The values in the `GITHUB_TOKEN` and `COPILOT_GITHUB_TOKEN` environment variables are redacted from output by default."
   > — Source: [GitHub Copilot CLI command reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference)

4. **Workspace Trust** (VS Code):
   > "Until you've reviewed a project for malicious content, rely on the Workspace Trust boundary. Restricted mode disables agents in that workspace."
   > — Source: [Security — Visual Studio Code](https://code.visualstudio.com/docs/copilot/security)

5. **Agent sandboxing (OS-level)** (VS Code, Preview) enforces file and network boundaries regardless of approvals:
   > "Agent sandboxing uses OS-level isolation to restrict what agent-executed processes can access on your machine. Rather than relying solely on approval prompts, sandboxing enforces strict file system and network boundaries at the kernel level, so commands cannot access resources outside the permitted scope, even if they are approved."
   > — Source: [Security — Visual Studio Code](https://code.visualstudio.com/docs/copilot/security)

   > "When sandboxing is enabled: Commands have read access to the entire file system. Commands have write access only to the current working directory and its subdirectories. Network access is blocked for all domains. Commands run without the user confirmation prompt."
   > — Source: [Use tools with agents — Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/agent-tools)

6. **Network-filter policy** (VS Code): `chat.agent.networkFilter` restricts which domains the fetch tool and sandboxed terminal commands can reach — independent of per-request approval.

7. **URL two-step approval flow is not skipped by Trusted Domains alone** (VS Code). Trusting a domain only pre-approves the request; the post-approval (response-review) step is governed separately. Note, however, that a user can still auto-approve responses by setting `approveResponse: true` in `chat.tools.urls.autoApprove`, and Bypass/Autopilot permission levels auto-approve all tool calls — so this guardrail holds against the Trusted Domains shortcut specifically, not against a fully configured auto-approve:
   > "The post-approval step is not linked to the 'Trusted Domains' feature and always requires your review. This is a security measure to prevent issues with untrusted content on a domain that you would otherwise trust."
   > — Source: [Use tools with agents — Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/agent-tools)

8. **Request limits**:
   > "Request limits: Built-in safeguards prevent runaway operations that consume excessive resources or perform unintended bulk actions on your codebase."
   > — Source: [Security — Visual Studio Code](https://code.visualstudio.com/docs/copilot/security)

9. **Premium-request billing applies** (and continues to meter usage in autopilot):
   > "Autopilot mode uses premium requests in the same way that these are used when you are working in the standard interactive interface. ... Each time the agent continues autonomously it will display a message in the CLI telling you how many premium requests have been used by that continuation step—taking account of the model multiplier—for example: `Continuing autonomously (3 premium requests)`."
   > — Source: [Allowing GitHub Copilot CLI to work autonomously](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/autopilot)

10. **`preToolUse` hooks still fire** on every tool call, before execution, and can allow/deny/modify the call — independent of `--allow-all`. The CLI reference lists `preToolUse` as: "Before each tool executes. ... can allow, deny, or modify." Note that `permissionRequest` is a **different, conditional** hook: per the CLI reference it runs "Before showing a permission dialog to the user, **after rule-based checks find no matching allow or deny rule**." That means once an allow rule matches (including via `--allow-all` / `/yolo`), `permissionRequest` does **not** fire — so only `preToolUse` is a reliable guardrail under bypass mode. VS Code describes the same general hook model: "Hooks can return `allow`, `deny`, or `ask` decisions to automatically approve safe operations or require confirmation for sensitive ones."
    > — Source: [GitHub Copilot CLI command reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference) and [Security — Visual Studio Code](https://code.visualstudio.com/docs/copilot/security)

11. **Enterprise policies override user choice** (VS Code) — see §7. E.g., `ChatToolsAutoApprove` "hide[s] the Bypass Approvals and Autopilot permission levels" organization-wide.

### 5.3 What **cannot** be assumed to be protected

The docs are clear that auto-approval is "best effort" and can be subverted:

> "Automatically approving terminal commands provides best effort protections and assumes the agent is not acting maliciously. It's important to protect yourself from prompt injection when you enable terminal auto approve, as it might be possible for some commands to slip through."
> — Source: [Use tools with agents — Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/agent-tools)

> "Subverting auto approval is possible through various techniques such as quote concatenation. For example `find -exec` is normally blocked, but `find -e\"x\"ec` is not, despite doing the same thing."
> — Source: [Use tools with agents — Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/agent-tools)

On CLI path heuristics:

> "Path detection for shell commands has limitations: Paths embedded in complex shell constructs may not be detected. Only a specific set of environment variables are expanded (`HOME`, `TMPDIR`, `PWD`, and similar). Custom variables like `$MY_PROJECT_DIR` are not expanded and may not be validated correctly. Symlinks are resolved for existing files, but not for files being created."
> — Source: [Configuring GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/configure-copilot-cli)

**Specifically not bypassed by `--allow-all` / bypass mode:**
- Explicit `--deny-tool` / `--deny-url` rules.
- Agent sandbox boundaries (VS Code).
- Workspace Trust (VS Code).
- Enterprise policies (VS Code).
- Premium-request billing / model quotas.
- Hooks (`preToolUse` specifically; `permissionRequest` only fires when no allow/deny rule matched, so it is **not** a reliable guardrail under `--allow-all`).

**Not a sandbox (what it is NOT):** Neither bypass mode nor `--allow-all` on the CLI provides OS-level sandboxing on their own. Commands still run with the user's privileges.

> "All development tasks operate with the same permissions as the user."
> — Source: [Security — Visual Studio Code](https://code.visualstudio.com/docs/copilot/security)

### 5.4 Explicit documentation warnings

- **CLI, on `--allow-all`/`--yolo`**: "It is strongly recommended that you only use these options in an isolated environment." ([Allowing and denying tool use](https://docs.github.com/en/copilot/how-tos/copilot-cli/allowing-tools))
- **CLI autopilot**: "This is equivalent to running Copilot CLI with the `--allow-all` option. You should be aware that this gives the CLI permission to make any changes it deems necessary to complete the task, including altering and deleting files." ([Autopilot](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/autopilot))
- **VS Code**: "The first time you enable Bypass approvals or Autopilot, VS Code shows a warning. Both modes skip manual confirmations for actions that can modify files and run commands." ([Your first agent session](https://code.visualstudio.com/learn/foundations/approvals-autonomy-and-context-budget))
- **VS Code Security**: "If prompt injection is a possibility or you're in a high-risk environment, consider enabling agent sandboxing or running VS Code within a container." ([Use tools with agents](https://code.visualstudio.com/docs/copilot/agents/agent-tools))

---

## 6. Best-Practice Setup Checklist Before Enabling Autopilot

Combining the "Recommended security baseline" section of the VS Code Security doc with the CLI best-practices doc:

1. **Work in an isolated environment** — a dev container, VM, or throwaway repo clone. The CLI docs explicitly recommend this for `--allow-all`. ([Allowing and denying tool use](https://docs.github.com/en/copilot/how-tos/copilot-cli/allowing-tools))
2. **Open untrusted projects in restricted mode** (VS Code). Restricted mode disables agents entirely. ([Security](https://code.visualstudio.com/docs/copilot/security))
3. **Enable agent sandboxing** (`chat.tools.terminal.sandbox.enabled` / `chat.agent.sandbox.enabled`, VS Code on macOS/Linux/WSL2) so that even auto-approved commands can't escape the workspace or reach the network.
4. **Configure deny-rules first** (they survive `--allow-all`):
   ```bash
   copilot --allow-all \
     --deny-tool='shell(rm)' \
     --deny-tool='shell(git push)' \
     --deny-tool='shell(git:*)' --allow-tool='shell(git commit), shell(git add)' \
     --deny-url=prod-api.example.com
   ```
   > — Source: [Allowing and denying tool use — GitHub Docs](https://docs.github.com/en/copilot/how-tos/copilot-cli/allowing-tools) and [Configuring GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/configure-copilot-cli) | Provenance: adapted
5. **Protect sensitive files** via `chat.tools.edits.autoApprove` with `"**/.env": false`, `"**/secrets.*": false`, etc. ([Security](https://code.visualstudio.com/docs/copilot/security))
6. **Set a continuation cap** in CLI autopilot: `--max-autopilot-continues 10`. ([Autopilot](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/autopilot))
7. **Redact secrets** from shell output: `--secret-env-vars='STRIPE_KEY,DATABASE_URL'`. ([CLI command reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference))
8. **Keep auto-approval scoped to the session**, not "Always". ([Security](https://code.visualstudio.com/docs/copilot/security))
9. **Never alias `copilot` to include `--allow-all`.** ([Allowing and denying tool use](https://docs.github.com/en/copilot/how-tos/copilot-cli/allowing-tools))
10. **Review MCP servers before trusting them.** ([Security](https://code.visualstudio.com/docs/copilot/security))
11. **Use `/reset-allowed-tools`** at the start of a sensitive task to clear ad-hoc approvals granted earlier. ([Allowing and denying tool use](https://docs.github.com/en/copilot/how-tos/copilot-cli/allowing-tools))

From the CLI best-practices doc:

> "Copilot CLI requires explicit approval for potentially destructive operations. Review all proposed changes before accepting. Use permission allowlists judiciously. Never commit secrets. Copilot is designed to avoid this, but always verify."
> — Source: [Best practices for GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/cli-best-practices)

---

## 7. Enterprise / Admin Controls

VS Code documents a set of device-management policies specifically aimed at agentic features. Admins can enforce these centrally; users cannot turn them off.

| Policy | What it does |
| --- | --- |
| `ChatAgentMode` | "Prevent the use of agent mode entirely." |
| `ChatAgentExtensionTools` | "Block extension-contributed tools while keeping built-in and MCP tools." |
| `ChatMCP` | "Restrict MCP servers to a curated registry (`registryOnly`) or disable MCP support completely (`off`)." |
| `McpGalleryServiceUrl` | Point VS Code at a private MCP registry. |
| `ChatToolsAutoApprove` | "Prevent developers from enabling global auto-approval and hide the Bypass Approvals and Autopilot permission levels." |
| `ChatToolsEligibleForAutoApproval` | Force manual approval for specific tools (e.g. `execute/runInTerminal`, `web/fetch`). |
| `ChatToolsTerminalEnableAutoApprove` | "Turn off the rule-based terminal auto-approval system." |

> — Source: [Security — Visual Studio Code](https://code.visualstudio.com/docs/copilot/security)

In the Security doc, settings that are org-managed are explicitly marked:

> "This setting is managed at the organization level. Contact your administrator to change it."
> — Source: [Security — Visual Studio Code](https://code.visualstudio.com/docs/copilot/security)

Settings affected by this note include `chat.agent.networkFilter`, `chat.tools.global.autoApprove`, `chat.tools.terminal.enableAutoApprove`, and `chat.agent.sandbox.enabled`.

**Implication for bypass mode:** Even if an end-user flips the permissions picker to **Bypass Approvals** or runs `/yolo`, if `ChatToolsAutoApprove` is enforced by MDM the option is hidden and the bypass does not apply.

On the CLI side, controls are less granular. The published reference does not document device-management policies specifically for the CLI, but:
- Repository-shared rules can be committed to `.github/copilot/settings.json`.
- Hook files in `.github/hooks/*.json` can programmatically deny tool calls via `preToolUse` hooks (which run "Before each tool executes" and can allow, deny, or modify). Note that `permissionRequest` hooks only fire when no allow/deny rule matched, so they are less useful under `--allow-all`. Hooks "run deterministically with guaranteed outcomes" and are suitable for "enforcing security policies" (VS Code Security doc language; the CLI uses the same hook model).

---

## 8. Research Limitations

- **VS Code fetch post-approval under Bypass/Autopilot:** The docs clearly state that Trusted Domains alone does not skip the response-review step, but they also document `chat.tools.urls.autoApprove` with an `approveResponse` flag and describe Bypass/Autopilot as auto-approving **all** tool calls. The consulted pages do not explicitly say whether, when a user has set `approveResponse: true` or is in Bypass/Autopilot, the post-approval dialog is suppressed. I treated post-approval as a guardrail **only against the Trusted Domains shortcut**, not as a general bypass-mode protection.
- **`permissionRequest` trigger condition:** The CLI reference defines `permissionRequest` as running only "after rule-based checks find no matching allow or deny rule." I inferred from this that `permissionRequest` does not fire under `--allow-all` (because an allow rule matches); the docs do not restate this implication explicitly.
- **CLI config schema completeness:** The CLI command reference lists many keys for `~/.copilot/config.json` but does not publish a single complete example. The combined example in §3.6 is synthesized from the documented schema; field names and types are verbatim, but their specific combination is illustrative.
- **Repository config key set:** At the repository scope (`.github/copilot/settings.json`) only a small allowlist of keys is honored. The reference says "Any other keys—including keys that are valid in the user configuration file—are silently ignored." This means you **cannot** push organization-wide CLI permission rules via repo config in the way you can via VS Code's policies.
- **Versioning:** VS Code's Autopilot mode is explicitly "currently in preview." Agent sandboxing is also Preview. Settings and policy names may change in future releases.
- **CLI device-management policies:** The docs consulted do not describe an MDM-style policy system for the CLI equivalent to VS Code's `ChatToolsAutoApprove`. Enterprise enforcement for the CLI appears to rely on hooks, shared repository settings, and the environment in which the CLI runs.
- **Dates:** The VS Code pages consulted were updated 2026-04-22 and the learn page 2026-03-30; the GitHub Docs pages show no visible "Last updated" date in the extracted text.
- **Out of scope:** I did not research GitHub's cloud-based **Copilot coding agent** (the one that runs in Actions) in depth — it has its own firewall/allowlist model ([github.blog/changelog/2025-07-15-configure-internet-access-for-copilot-coding-agent](https://github.blog/changelog/2025-07-15-configure-internet-access-for-copilot-coding-agent/)) which is conceptually similar but configured separately and was tangential to the beginner-audience brief focused on CLI + VS Code local agent mode.

---

## 9. Complete Reference List

### Documentation & Articles

- [Allowing and denying tool use — GitHub Docs](https://docs.github.com/en/copilot/how-tos/copilot-cli/allowing-tools) — CLI: two layers of control, `--allow-tool` / `--deny-tool` patterns, `/allow-all`, `/yolo`, `/reset-allowed-tools`.
- [Configuring GitHub Copilot CLI — GitHub Docs](https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/configure-copilot-cli) — Trusted directories, `trusted_folders`, path permissions, URL permissions, interactive approval prompt flow.
- [Allowing GitHub Copilot CLI to work autonomously — GitHub Docs](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/autopilot) — Autopilot mode, comparison of `--allow-all`, `--autopilot`, `--no-ask-user`, `--max-autopilot-continues`, premium-request accounting.
- [GitHub Copilot CLI command reference — GitHub Docs](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference) — Full flag list, slash-command list, permission-pattern grammar, env vars, `~/.copilot/config.json` schema, repository/local settings files, hooks reference.
- [Best practices for GitHub Copilot CLI — GitHub Docs](https://docs.github.com/en/copilot/how-tos/copilot-cli/cli-best-practices) — Security-considerations checklist and common permission patterns.
- [Use tools with agents — Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/agent-tools) — Permission levels picker, `chat.tools.terminal.autoApprove`, `chat.tools.urls.autoApprove`, `chat.tools.global.autoApprove`, Autopilot preview, Manage Tool Approval UI.
- [Security — Visual Studio Code](https://code.visualstudio.com/docs/copilot/security) — Security baseline, agent sandboxing, trust boundaries, enterprise policies (`ChatAgentMode`, `ChatToolsAutoApprove`, etc.), network filter, auto-approval tradeoffs.
- [Your first agent session — Visual Studio Code](https://code.visualstudio.com/learn/foundations/approvals-autonomy-and-context-budget) — Beginner-friendly explanation of scoped approvals, Default/Bypass/Autopilot permission levels.
- [Configure internet access for Copilot coding agent — GitHub Changelog (2025-07-15)](https://github.blog/changelog/2025-07-15-configure-internet-access-for-copilot-coding-agent/) — Referenced for completeness on cloud coding-agent network controls (out of primary scope).

### GitHub Repositories

- None consulted directly (official documentation covered the scope of the request).

### Code Samples

- `~/.copilot/config.json` example (§3.6) — JSON, illustrative CLI user-level configuration.
- `.vscode/settings.json` example (§4.3) — JSONC, VS Code auto-approve and sensitive-file protection.
- Terminal flag recipes (§3.2, §6) — Bash, CLI invocation patterns for allow/deny combinations and sandboxed autopilot.
