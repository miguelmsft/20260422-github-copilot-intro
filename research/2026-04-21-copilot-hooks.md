# Research Report: GitHub Copilot Hooks (April 2026)

**Date:** 2026-04-21
**Researcher:** Copilot Web Researcher Agent
**Topic slug:** copilot-hooks
**Sources consulted:** 12 web pages (all primary GitHub Docs), 0 GitHub repositories

---

## Executive Summary

**GitHub Copilot Hooks** are a real, officially documented feature as of April 2026. They are user- or repository-defined shell commands that the Copilot agent runtime executes at specific **lifecycle events** during an agent session — for example, when a session starts, when the user submits a prompt, or immediately before/after the agent uses a tool such as `bash`, `edit`, or `create` ([About hooks](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-hooks)). The runtime pipes a JSON event payload to the hook on stdin, and the hook can emit a JSON response on stdout to (among other things) **deny a tool call** before it runs ([Hooks configuration](https://docs.github.com/en/copilot/reference/hooks-configuration)).

Hooks are supported on two Copilot surfaces: **GitHub Copilot CLI** (the terminal agent, `copilot` command) and **Copilot cloud agent** (the GitHub-hosted agent that creates pull requests) — the About hooks page explicitly enumerates both surfaces and no others ([About hooks](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-hooks)). The Copilot extension inside VS Code (inline completions / native Chat / editor-native agent mode) is **not listed** as a hook-supporting surface in the April 2026 docs; the documented path to get hook behavior while working inside VS Code is to run Copilot CLI and connect it to VS Code ([Connecting GitHub Copilot CLI to VS Code](https://docs.github.com/en/copilot/how-tos/copilot-cli/connecting-vs-code)), in which case the CLI's own hooks are what run (see §6.4 for the full nuance and what the docs do *not* say). Hooks are configured declaratively via a versioned JSON file (`version: 1`, a `hooks` object keyed by event name) stored in `.github/hooks/*.json` in a repository, in `~/.copilot/hooks/` for user-level hooks, or inline under `hooks` in `~/.copilot/config.json` ([About hooks](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-hooks); [GitHub Copilot CLI configuration directory](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-config-dir-reference)).

The headline use cases are **guardrails** (block `rm -rf /`, restrict edits to `src/` and `test/`), **audit logging / compliance** (append every prompt and tool call to a JSONL file or forward to SIEM), **cost and telemetry tracking**, and **policy banners** ([Hooks configuration](https://docs.github.com/en/copilot/reference/hooks-configuration)). Hooks run synchronously, can block the agent, and execute arbitrary shell code — so they are powerful and must be treated as security-sensitive configuration ([About hooks — Security considerations](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-hooks)).

---

## Table of Contents

1. [Overview](#1-overview)
2. [Key Concepts](#2-key-concepts)
3. [Getting Started](#3-getting-started)
4. [Core Usage](#4-core-usage)
5. [Configuration & Best Practices](#5-configuration--best-practices)
6. [Advanced Topics](#6-advanced-topics)
7. [Ecosystem & Alternatives](#7-ecosystem--alternatives)
8. [Research Limitations](#8-research-limitations)
9. [Complete Reference List](#9-complete-reference-list)

---

## 1. Overview

### What It Is

Copilot Hooks are **declarative JSON bindings** from an agent lifecycle event (e.g. `preToolUse`) to a **shell command or script** on the user's machine (or on the cloud-agent runner). The runtime invokes the script synchronously, passes a JSON object describing the event on stdin, and — for `preToolUse` hooks — may honor a JSON permission decision on stdout.

> "Hooks enable you to execute custom shell commands at strategic points in an agent's workflow, such as when an agent session starts or ends, or before and after a prompt is entered or a tool is called."
> — Source: [About hooks (GitHub Docs)](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-hooks)

### Why It Matters

Unlike **custom instructions** (which *ask* the model to behave a certain way) or **skills** (which *guide* the model with prompts), hooks run deterministic code outside the model. That means they can **enforce** policy rather than merely suggest it.

> "Hooks are useful when you need more control than skills or custom instructions can provide. While skills and instructions guide Copilot's behavior through prompts, hooks ensure that operations you have defined will be performed at specific moments—for example, to block a tool from running, or to log activity when a session ends."
> — Source: [Comparing GitHub Copilot CLI customization features](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/comparing-cli-features)

Concretely, hooks solve:
- **Guardrails** — block `rm -rf /`, `sudo`, `curl | bash`, edits outside `src/`.
- **Audit & compliance** — structured logs of every prompt and tool call.
- **Cost & usage tracking** — CSV/JSONL per-tool metering.
- **Policy banners** — print a message at session start.
- **Subagent validation** — validate a subagent's output before it returns to the parent.

### Key Features

- **Event-driven** — eight documented lifecycle events (see §2).
- **Declarative JSON config** — `version: 1` + `hooks` object.
- **Cross-platform** — separate `bash` and `powershell` keys per hook.
- **Synchronous & blocking** — can fail/deny an action before it happens.
- **Multi-layer scope** — repository (`.github/hooks/*.json`), user (`~/.copilot/hooks/` or inline in `config.json`), project cwd.
- **Multiple hooks per event** — arrays execute in order.
- **Global disable switch** — `disableAllHooks: true` in `config.json`.

---

## 2. Key Concepts

### 2.1 Lifecycle events (the eight hook types)

The canonical list, consolidated from the `About hooks`, `Hooks configuration`, and `Comparing CLI features` pages:

| Event key             | When it fires                                                                 | Can block? |
|-----------------------|------------------------------------------------------------------------------|------------|
| `sessionStart`        | New agent session begins, or an existing session is resumed                  | No         |
| `sessionEnd`          | Session completes or is terminated                                           | No         |
| `userPromptSubmitted` | User submits a prompt to the agent                                           | No (output ignored) |
| `preToolUse`          | **Before** the agent invokes any tool (`bash`, `edit`, `view`, `create`, …)  | **Yes** (emit `permissionDecision: "deny"`) |
| `postToolUse`         | After a tool completes (success, failure, or denied)                         | No         |
| `errorOccurred`       | An error occurs during agent execution                                       | No         |
| `agentStop`           | Main agent has finished responding to the prompt (no error)                  | No         |
| `subagentStop`        | A subagent completes, **before** results return to the parent agent          | No         |

> "preToolUse: Executed before the agent uses any tool (such as bash, edit, view). This is the most powerful hook as it can approve or deny tool executions."
> — Source: [About hooks](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-hooks)

Note: The same page explicitly lists `agentStop` and `subagentStop` alongside the six events that appear in the starter template (`sessionStart`, `sessionEnd`, `userPromptSubmitted`, `preToolUse`, `postToolUse`, `errorOccurred`).

### 2.2 Configuration file shape

Every hook file begins with `version: 1` and a `hooks` object whose keys are event names and whose values are **arrays** of hook definitions:

```json
{
  "version": 1,
  "hooks": {
    "sessionStart":        [ /* hook definitions */ ],
    "sessionEnd":          [ /* ... */ ],
    "userPromptSubmitted": [ /* ... */ ],
    "preToolUse":          [ /* ... */ ],
    "postToolUse":         [ /* ... */ ],
    "errorOccurred":       [ /* ... */ ]
  }
}
```
> — Source: [Using hooks with GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/use-hooks) | Provenance: verbatim

Each **hook definition** supports these keys:

| Property     | Required                 | Description                                                          |
|--------------|--------------------------|----------------------------------------------------------------------|
| `type`       | Yes                      | Must be `"command"`                                                  |
| `bash`       | Yes (on Unix systems)    | Bash command string or path to a bash script                         |
| `powershell` | Yes (on Windows)         | PowerShell command or path to a `.ps1` script                        |
| `cwd`        | No                       | Working directory for the script (relative to repo root)             |
| `env`        | No                       | Extra environment variables merged with the existing environment     |
| `timeoutSec` | No                       | Max execution time in seconds (default: **30**)                      |

> — Source: [About hooks](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-hooks) | Provenance: verbatim

### 2.3 Discovery / scope (where hooks live)

```
┌─────────────────────────────────────────────────────────────────┐
│ Copilot CLI                                                      │
│                                                                  │
│   User-level  →  ~/.copilot/hooks/             (all sessions)    │
│   User-level  →  ~/.copilot/config.json "hooks" key (inline)     │
│   Project     →  .github/hooks/*.json           (cwd based)      │
│                                                                  │
│ Copilot cloud agent (GitHub-hosted)                              │
│                                                                  │
│   Repo only   →  .github/hooks/*.json on default branch          │
└─────────────────────────────────────────────────────────────────┘
```

> "Copilot agents support hooks stored in JSON files in your repository at `.github/hooks/*.json`."
> — Source: [About hooks](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-hooks)

> "The hooks configuration file must be present on your repository's default branch to be used by Copilot cloud agent. For GitHub Copilot CLI, hooks are loaded from your current working directory."
> — Source: [Using hooks with GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/use-hooks)

> "Store user-level hook scripts here. These hooks apply to all your sessions. You can also define hooks inline in `config.json` using the `hooks` key. Repository-level hooks (in `.github/hooks/`) are loaded alongside user-level hooks."
> — Source: [GitHub Copilot CLI configuration directory](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-config-dir-reference)

### 2.4 Event payload shapes (stdin JSON)

Each hook type receives a different JSON object on stdin. Below are the exact shapes from the `Hooks configuration` reference.

**sessionStart:**
```json
{ "timestamp": 1704614400000, "cwd": "/path/to/project", "source": "new", "initialPrompt": "Create a new feature" }
```
> — Source: [Hooks configuration](https://docs.github.com/en/copilot/reference/hooks-configuration) | Provenance: verbatim

`source` is one of `"new"`, `"resume"`, or `"startup"`.

**sessionEnd:**
```json
{ "timestamp": 1704618000000, "cwd": "/path/to/project", "reason": "complete" }
```
> — Source: [Hooks configuration](https://docs.github.com/en/copilot/reference/hooks-configuration) | Provenance: verbatim

`reason` is one of `"complete"`, `"error"`, `"abort"`, `"timeout"`, `"user_exit"`.

**userPromptSubmitted:**
```json
{ "timestamp": 1704614500000, "cwd": "/path/to/project", "prompt": "Fix the authentication bug" }
```
> — Source: [Hooks configuration](https://docs.github.com/en/copilot/reference/hooks-configuration) | Provenance: verbatim

**preToolUse:**
```json
{
  "timestamp": 1704614600000,
  "cwd": "/path/to/project",
  "toolName": "bash",
  "toolArgs": "{\"command\":\"rm -rf dist\",\"description\":\"Clean build directory\"}"
}
```
> — Source: [Hooks configuration](https://docs.github.com/en/copilot/reference/hooks-configuration) | Provenance: verbatim

Note: `toolArgs` is a **JSON-encoded string**, not an object — you must parse it again inside your script.

**postToolUse:** adds a `toolResult` object:
```json
{
  "timestamp": 1704614700000,
  "cwd": "/path/to/project",
  "toolName": "bash",
  "toolArgs": "{\"command\":\"npm test\"}",
  "toolResult": {
    "resultType": "success",
    "textResultForLlm": "All tests passed (15/15)"
  }
}
```
> — Source: [Hooks configuration](https://docs.github.com/en/copilot/reference/hooks-configuration) | Provenance: verbatim

`resultType` is one of `"success"`, `"failure"`, `"denied"`.

**errorOccurred:**
```json
{
  "timestamp": 1704614800000,
  "cwd": "/path/to/project",
  "error": { "message": "Network timeout", "name": "TimeoutError", "stack": "TimeoutError: Network timeout\n at ..." }
}
```
> — Source: [Hooks configuration](https://docs.github.com/en/copilot/reference/hooks-configuration) | Provenance: verbatim

### 2.5 Hook output (stdout JSON)

For **almost every** event, the runtime **ignores** the hook's stdout. The one exception is `preToolUse`, where stdout can carry a decision:

```json
{ "permissionDecision": "deny", "permissionDecisionReason": "Destructive operations require approval" }
```
> — Source: [Hooks configuration](https://docs.github.com/en/copilot/reference/hooks-configuration) | Provenance: verbatim

> "permissionDecision: Either \"allow\", \"deny\", or \"ask\" (only \"deny\" is currently processed)"
> — Source: [Hooks configuration](https://docs.github.com/en/copilot/reference/hooks-configuration)

So in practice: emit `"deny"` with a reason to block, or emit nothing / exit 0 to allow. `userPromptSubmitted` cannot modify the prompt today:

> "Output: Ignored (prompt modification not currently supported in customer hooks)"
> — Source: [Hooks configuration](https://docs.github.com/en/copilot/reference/hooks-configuration)

---

## 3. Getting Started

### Prerequisites

- A Copilot plan that includes the surface you target. The About hooks page documents plan availability for the **cloud-agent** surface only:
  > "Copilot cloud agent is available with the GitHub Copilot Pro, GitHub Copilot Pro+, GitHub Copilot Business and GitHub Copilot Enterprise plans."
  > — Source: [About hooks](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-hooks)

  Plan availability for the **Copilot CLI** surface is not stated on the hooks pages and was not independently verified in this research — consult your organization's Copilot plan page before assuming CLI access on a given plan.
- Copilot CLI installed locally for CLI hooks (`copilot` command on PATH).
- **Bash + `jq`** on Unix, or **PowerShell 5.1+** on Windows.
- A repo you can edit if you want repo-scoped hooks.

### Installation & Setup

#### Terminal commands — create the directory and stub file

```bash
# Repository-scoped layout (works for both Copilot CLI and Copilot cloud agent)
mkdir -p .github/hooks/scripts
mkdir -p .github/hooks/logs
echo ".github/hooks/logs/" >> .gitignore
```
> — Source: [Using hooks with Copilot CLI for predictable, policy-compliant execution](https://docs.github.com/en/copilot/tutorials/copilot-cli-hooks) | Provenance: verbatim

Create `.github/hooks/copilot-cli-policy.json`:

```json
{
  "version": 1,
  "hooks": {
    "sessionStart": [
      {
        "type": "command",
        "bash": "echo \"Session started: $(date)\" >> logs/session.log",
        "powershell": "Add-Content -Path logs/session.log -Value \"Session started: $(Get-Date)\"",
        "cwd": ".",
        "timeoutSec": 10
      }
    ]
  }
}
```
> — Source: [About hooks](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-hooks) | Provenance: verbatim

Commit to the default branch for cloud agent; for Copilot CLI the file just needs to exist under `.github/hooks/` in your working directory.

#### Python setup

N/A — hooks are shell-based. Python is not a supported hook runner; you can of course have the `bash` command invoke a Python script (`"bash": "python3 ./scripts/my_hook.py"`) but the top-level hook contract is shell.

---

## 4. Core Usage

### 4.1 A minimal beginner hook — session-start banner

Create `.github/hooks/scripts/session-banner.sh`:

```bash
#!/bin/bash
# Source: https://docs.github.com/en/copilot/tutorials/copilot-cli-hooks
# Prints a short policy banner on every Copilot CLI session start.
set -e
INPUT=$(cat)  # consume stdin even if we don't use it

echo "────────────────────────────────────────"
echo "  Copilot CLI — corporate policy active"
echo "  Destructive commands will be blocked."
echo "────────────────────────────────────────"

exit 0
```
> — Source: [Using hooks with Copilot CLI for predictable, policy-compliant execution](https://docs.github.com/en/copilot/tutorials/copilot-cli-hooks) | Provenance: adapted

Make it executable (standard POSIX file-mode change; no GitHub-specific source — this is plain shell practice required because hooks are invoked as executables):

```bash
chmod +x .github/hooks/scripts/session-banner.sh
```
> — Source: general POSIX `chmod` conventions (no Copilot-docs-specific URL); the need for executable hook scripts is implied by [Using hooks with GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/use-hooks) | Provenance: synthesized

> **Shell-prerequisite reminder for §§4.2–4.5:** the Bash examples below assume a Unix-like shell with `jq` on `PATH` (install via `apt install jq` / `brew install jq` / `choco install jq`). They also assume the working directory is your repo root and that a writable `logs/` directory exists (`mkdir -p logs`). The PowerShell example assumes PowerShell 5.1 or later.

### 4.2 A `preToolUse` hook that **denies dangerous commands**

```bash
#!/bin/bash
# Source: https://docs.github.com/en/copilot/reference/hooks-configuration
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.toolName')
TOOL_ARGS=$(echo "$INPUT" | jq -r '.toolArgs')

# Log every tool use
echo "$(date): Tool=$TOOL_NAME Args=$TOOL_ARGS" >> tool-usage.log

# Block destructive patterns
if echo "$TOOL_ARGS" | grep -qE "rm -rf /|format|DROP TABLE"; then
  echo '{"permissionDecision":"deny","permissionDecisionReason":"Dangerous command detected"}'
  exit 0
fi

# Allow by default (an empty / non-deny response == allow)
echo '{"permissionDecision":"allow"}'
```
> — Source: [Hooks configuration](https://docs.github.com/en/copilot/reference/hooks-configuration) | Provenance: verbatim

### 4.3 Restrict edits to specific directories

```bash
#!/bin/bash
# Source: https://docs.github.com/en/copilot/reference/hooks-configuration
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.toolName')

if [ "$TOOL_NAME" = "edit" ]; then
  PATH_ARG=$(echo "$INPUT" | jq -r '.toolArgs' | jq -r '.path')
  if [[ ! "$PATH_ARG" =~ ^(src/|test/) ]]; then
    echo '{"permissionDecision":"deny","permissionDecisionReason":"Can only edit files in src/ or test/ directories"}'
    exit 0
  fi
fi
# Allow all other tools
```
> — Source: [Hooks configuration](https://docs.github.com/en/copilot/reference/hooks-configuration) | Provenance: verbatim

### 4.4 Structured audit log (`postToolUse`)

```bash
#!/bin/bash
# Source: https://docs.github.com/en/copilot/reference/hooks-configuration
INPUT=$(cat)
TIMESTAMP=$(echo "$INPUT" | jq -r '.timestamp')
TOOL_NAME=$(echo "$INPUT" | jq -r '.toolName')
RESULT_TYPE=$(echo "$INPUT" | jq -r '.toolResult.resultType')

jq -n \
  --arg ts "$TIMESTAMP" \
  --arg tool "$TOOL_NAME" \
  --arg result "$RESULT_TYPE" \
  '{timestamp: $ts, tool: $tool, result: $result}' >> logs/audit.jsonl
```
> — Source: [Hooks configuration](https://docs.github.com/en/copilot/reference/hooks-configuration) | Provenance: verbatim

### 4.5 PowerShell hook (Windows)

```powershell
# Source: https://docs.github.com/en/copilot/reference/hooks-configuration
$ErrorActionPreference = "Stop"
try {
    $input = [Console]::In.ReadToEnd() | ConvertFrom-Json
    # $input.toolName, $input.toolArgs, $input.timestamp, $input.cwd

    if ($input.toolName -eq "bash") {
        $args = $input.toolArgs | ConvertFrom-Json
        if ($args.command -match "rm -rf|sudo|mkfs") {
            @{
                permissionDecision = "deny"
                permissionDecisionReason = "Dangerous system command"
            } | ConvertTo-Json -Compress
        }
    }
    exit 0
} catch {
    Write-Error $_.Exception.Message
    exit 1
}
```
> — Source: [Hooks configuration](https://docs.github.com/en/copilot/reference/hooks-configuration) | Provenance: adapted

### 4.6 Terminal / CLI commands for testing a hook locally

```bash
# Pipe a synthetic event into your script and inspect exit code + output
echo '{"timestamp":1704614400000,"cwd":"/tmp","toolName":"bash","toolArgs":"{\"command\":\"ls\"}"}' \
  | ./my-hook.sh

echo $?                 # non-zero means the runtime will treat the hook as failed
./my-hook.sh | jq .     # confirm stdout is valid JSON
```
> — Source: [Using hooks with GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/use-hooks) | Provenance: verbatim

---

## 5. Configuration & Best Practices

### 5.1 Recommended configuration knobs

- **`timeoutSec`** — default is 30 s. Raise for slow validators; lower (e.g. 5 s) for trivial logging hooks.
- **`env`** — inject per-hook env vars (e.g. `LOG_LEVEL`, webhook URLs).
- **`cwd`** — anchor relative script paths (the cloud agent runs from the repo root; CLI runs from your working dir).
- **`disableAllHooks: true`** in `~/.copilot/config.json` — kill-switch when debugging.
- **`hooks` key in `config.json`** — user-level inline hooks without touching any repo.

> "disableAllHooks — boolean — Disable all hooks (default: false)"
> "hooks — object — Inline user-level hook definitions"
> — Source: [GitHub Copilot CLI configuration directory](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-config-dir-reference)

### 5.2 Best practices (official)

From [About hooks → Performance considerations](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-hooks):

- **Keep hook execution under 5 seconds** — hooks are synchronous and block the agent.
- **Prefer async-style logging** — `echo >> file.log`, not remote HTTP per call.
- **Move expensive work to the background** — fire-and-forget or a separate processor.
- **Cache results** — don't recompute on every tool call.

Security guidance from the same page:

- Validate & sanitize input — "Untrusted input could lead to unexpected behavior."
- Use **proper shell escaping** to avoid command injection.
- Never log secrets (tokens, passwords).
- Be careful with external HTTP — latency, failures, exfiltration risk.
- Set **appropriate timeouts**.

### 5.3 Common pitfalls & anti-patterns

| Pitfall | Fix |
|---|---|
| Hooks "don't run" | File must be under `.github/hooks/` **on the default branch** for cloud agent; for CLI, the cwd must contain `.github/hooks/`. Verify `version: 1` is present. |
| `Permission denied` when running script | `chmod +x script.sh` and add `#!/bin/bash` shebang. |
| Hooks time out | Raise `timeoutSec`; default is 30 s. |
| Invalid JSON output causing allow-by-default when you expected deny | Output **one line** of valid JSON; use `jq -c` (bash) or `ConvertTo-Json -Compress` (PowerShell). |
| `toolArgs` treated as object and failing to parse | It is a **JSON-encoded string**. Re-parse: `echo "$INPUT" \| jq -r '.toolArgs' \| jq -r '.command'`. |
| Hook loops on itself (hook runs `git …` which triggers another tool) | Short-circuit on `toolName` to only validate bash/edit/create, not `view`/`grep`. |
| Leaking secrets into audit logs | Redact before writing. |

> — Source (pitfalls): [Using hooks with GitHub Copilot CLI → Troubleshooting](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/use-hooks)

---

## 6. Advanced Topics

### 6.1 Multiple hooks per event

Arrays execute in order. Useful for layering: security check → audit log → metrics.

```json
{
  "version": 1,
  "hooks": {
    "preToolUse": [
      { "type": "command", "bash": "./scripts/security-check.sh", "comment": "Runs first"  },
      { "type": "command", "bash": "./scripts/audit-log.sh",      "comment": "Runs second" },
      { "type": "command", "bash": "./scripts/metrics.sh",        "comment": "Runs third"  }
    ]
  }
}
```
> — Source: [Hooks configuration](https://docs.github.com/en/copilot/reference/hooks-configuration) | Provenance: verbatim

### 6.2 Integrating with external systems

The reference shows a Slack webhook on error:

```bash
#!/bin/bash
INPUT=$(cat)
ERROR_MSG=$(echo "$INPUT" | jq -r '.error.message')
WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
curl -X POST "$WEBHOOK_URL" -H 'Content-Type: application/json' \
  -d "{\"text\":\"Agent Error: $ERROR_MSG\"}"
```
> — Source: [Hooks configuration](https://docs.github.com/en/copilot/reference/hooks-configuration) | Provenance: verbatim

### 6.3 A full compliance config

```json
{
  "version": 1,
  "hooks": {
    "sessionStart":        [{ "type": "command", "bash": "./audit/log-session-start.sh" }],
    "userPromptSubmitted": [{ "type": "command", "bash": "./audit/log-prompt.sh" }],
    "preToolUse":          [{ "type": "command", "bash": "./audit/log-tool-use.sh" }],
    "postToolUse":         [{ "type": "command", "bash": "./audit/log-tool-result.sh" }],
    "sessionEnd":          [{ "type": "command", "bash": "./audit/log-session-end.sh" }]
  }
}
```
> — Source: [Hooks configuration](https://docs.github.com/en/copilot/reference/hooks-configuration) | Provenance: verbatim

### 6.4 Surface differences — CLI vs. cloud agent vs. VS Code (the critical cross-surface nuance)

The About hooks page is explicit that hooks are a feature of exactly two Copilot surfaces — Copilot CLI and Copilot cloud agent:

> "Hooks are available for use with: Copilot cloud agent on GitHub; GitHub Copilot CLI in the terminal."
> — Source: [About hooks](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-hooks)

| Aspect                       | Copilot CLI                                                     | Copilot cloud agent                                     | Copilot in VS Code (native extension) |
|------------------------------|-----------------------------------------------------------------|---------------------------------------------------------|---------------------------------------|
| Hooks documented as supported? | ✅ Yes ([About hooks](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-hooks))                                                          | ✅ Yes ([About hooks](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-hooks))                                                  | ❌ Not listed on the About hooks surfaces list ([About hooks](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-hooks))     |
| Config file location         | `.github/hooks/*.json` (project) **or** `~/.copilot/hooks/` **or** inline `hooks` key in `~/.copilot/config.json` ([CLI config dir](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-config-dir-reference)) | `.github/hooks/*.json` on **default branch only** ([Using hooks with Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/use-hooks)) | — |
| User-level hooks             | ✅ ([CLI config dir](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-config-dir-reference))                                                              | ❌ (repo-scoped only; no user-level mechanism documented)                                  | —                                     |
| Repository hooks             | ✅                                                              | ✅                                                     | —                                     |
| `disableAllHooks` switch     | ✅ (CLI `config.json`) ([CLI config dir](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-config-dir-reference))                                          | Not documented                                       | —                                     |
| Hooks can block a tool call? | ✅ via `preToolUse` ([Hooks configuration](https://docs.github.com/en/copilot/reference/hooks-configuration))                                             | ✅ via `preToolUse` ([Hooks configuration](https://docs.github.com/en/copilot/reference/hooks-configuration))                                     | —                                     |

#### What the docs actually say (and don't say) about VS Code

This is the single most common point of confusion, so it is worth being precise:

1. **The native Copilot extension in VS Code** (inline completions, editor Chat panel, editor-integrated agent mode) is **not listed** in the About hooks page's surface list, which explicitly names only "Copilot cloud agent on GitHub" and "GitHub Copilot CLI in the terminal" ([About hooks](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-hooks)). As of April 2026 the VS Code extension pages searched for this report also do not describe a `hooks.json`-style mechanism. **This is an absence-of-evidence conclusion, not a positively documented "no."** If GitHub ships VS-Code-native hooks later, this conclusion will need to be revisited.
2. **Copilot CLI can be connected to VS Code** — that integration is documented on the [Connecting GitHub Copilot CLI to VS Code](https://docs.github.com/en/copilot/how-tos/copilot-cli/connecting-vs-code) page. That page describes editor-selection context, diff review, live diagnostics, and session resume across tools; it does **not** explicitly discuss hooks. Nothing on that page says "hooks apply / do not apply when CLI is connected to VS Code."
3. **Implied (not directly stated) behavior:** when you run `copilot` in a terminal — including VS Code's built-in terminal — and the CLI connects to VS Code, the agent doing the work is still Copilot CLI, and so CLI-level hooks (`.github/hooks/*.json`, `~/.copilot/hooks/`, inline `hooks` in `~/.copilot/config.json`) apply to that session by the normal CLI loading rules ([CLI config dir](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-config-dir-reference); [Using hooks with Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/use-hooks)). The docs do not carve out an exception for the VS Code-connected case. This is the reasoned interpretation rather than a directly quoted rule — treat it as such.
4. **Operational boundary to remember:** hooks are a property of the *agent runtime* (CLI or cloud agent), not of the *editor*. Opening VS Code by itself does not enable hooks; invoking native VS Code Copilot features does not trigger hooks; only a Copilot CLI session (standalone or VS-Code-connected) or a cloud-agent run on GitHub will.

#### Copilot SDK — related but separate

GitHub Docs also exposes a Copilot SDK with a "Working with hooks" subtree that lists pre-tool use, post-tool use, user prompt submitted, session lifecycle, and error handling as programmatic extension points ([Connecting GitHub Copilot CLI to VS Code](https://docs.github.com/en/copilot/how-tos/copilot-cli/connecting-vs-code) sidebar). That is a **developer-facing API** for building agents on the SDK, not the user-facing `hooks.json` feature this report focuses on. The two share terminology and event names, but they are configured in different ways and targeted at different audiences. The SDK hooks pages were not deep-read in this round — see §8.

### 6.5 Security implications

Hooks execute **arbitrary commands** as the agent runtime's process. The About hooks page explicitly calls this out as "Security considerations" — "Hook scripts run with the permissions of the user executing Copilot" on CLI, and on the cloud agent runner for the cloud-agent surface ([About hooks — Security considerations](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-hooks)). Practical consequences:

- **Untrusted repos are a supply-chain risk.** A repository-scoped hook under `.github/hooks/*.json` is loaded by Copilot CLI when you run it in that working directory ([Using hooks with GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/use-hooks)), so a malicious repo can ship a hook that executes on your machine under your user account. Review `.github/hooks/*.json` before first run, the same way you would review `package.json` `scripts` or `.husky/*` hooks. *(The specific "runs as soon as you start CLI in that directory" framing is a logical implication of the documented `.github/hooks/*.json` discovery behavior; the docs state the discovery rule, not the attack framing.)*
- **Cloud agent runners are not a get-out-of-jail-free card.** The cloud agent executes hooks on GitHub-hosted infrastructure rather than your laptop, but the hook code still comes from the repository's default branch and can exfiltrate secrets accessible to the runner. GitHub Docs does not publish runner-isolation guarantees on the hooks pages; do not assume "cloud = safe."
- **`env` blocks can leak credentials** if secrets are committed into the hook config. Store secrets in GitHub Actions-style secret stores, not in `env`.
- **`preToolUse` must fail closed.** Because the runtime only processes `permissionDecision: "deny"` and treats everything else as allow ([Hooks configuration](https://docs.github.com/en/copilot/reference/hooks-configuration)), a hook that crashes, times out, or emits malformed JSON will **allow** the tool call. Always design the deny path as the default on error.
- **Sanitize input.** The About hooks page explicitly warns: "Untrusted input could lead to unexpected behavior" ([About hooks — Security considerations](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-hooks)). `toolArgs` contents come from model output and must be treated as untrusted.

---

## 7. Ecosystem & Alternatives

Where Hooks fit relative to other Copilot customization primitives:

| Mechanism            | What it does                                                                                    | When to prefer                                        |
|----------------------|--------------------------------------------------------------------------------------------------|-------------------------------------------------------|
| **Custom instructions** | Persistent guidance loaded at session start (`AGENTS.md`, `.github/copilot-instructions.md`). | Style, coding standards, communication preferences.   |
| **Skills**           | Markdown + optional scripts, invoked by slash command or auto-detect.                            | Task-specific playbooks (release notes, reviews).     |
| **Tools**            | Abilities (read/edit/run). Built-in or added via MCP.                                            | Not user-configured directly — agent picks.           |
| **MCP servers**      | Collections of external tools (APIs, DBs, SaaS).                                                | New *capabilities* the agent doesn't have.            |
| **Hooks**            | Deterministic shell commands at lifecycle events.                                                | Hard guardrails, audit, telemetry, policy enforcement.|
| **Subagents / custom agents** | Delegated specialist agents with their own context.                                     | Specialist roles (security reviewer, test generator). |
| **Plugins**          | Packaged bundles of the above.                                                                   | Redistributing a preset policy / toolkit.             |

> — Source: [Comparing GitHub Copilot CLI customization features](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/comparing-cli-features) | Provenance: synthesized

**Decision guide:**

1. Need to **enforce** (block / audit)? → **Hooks**.
2. Need to **guide** the model's style? → **Custom instructions**.
3. Need a **repeatable task playbook**? → **Skill**.
4. Need **new capabilities** (an API the agent can call)? → **MCP server**.
5. Need a **specialist persona**? → **Custom agent**.
6. Need to ship multiple of the above as one unit? → **Plugin**.

Hooks and MCP / skills are complementary — many real setups combine a `preToolUse` hook (policy) with an MCP server (capability) and a skill (task pattern).

---

## 8. Research Limitations

- **Single source authority**: All substantive findings come from **docs.github.com** (GitHub's own documentation). I did not find independent third-party write-ups, GitHub Blog posts, or Changelog entries specifically covering Copilot Hooks at their current (April 2026) shape — this is the primary source, but cross-source corroboration is weak. If the docs contain errors, this report will inherit them.
- **No GitHub Blog / Changelog citation**: I could not locate a specific "Hooks GA" announcement. The feature is documented as available on the CLI and cloud-agent surfaces, but the exact release date / GA status is not captured here.
- **Payload edge cases**: The reference documents `permissionDecision: "allow" | "deny" | "ask"` but explicitly notes "only 'deny' is currently processed." The behaviour of `"ask"` in future versions is not specified.
- **`agentStop` / `subagentStop`**: These events are listed by name in the concept pages and in the feature-comparison page, but the **Hooks configuration reference** enumerates payloads only for the six "starter template" events (sessionStart, sessionEnd, userPromptSubmitted, preToolUse, postToolUse, errorOccurred). The exact input/output schema for `agentStop`/`subagentStop` is not documented in the pages I read.
- **VS Code extension (not CLI-in-VS-Code)**: The conclusion that hooks are not a feature of the VS Code Copilot extension rests on (a) the About hooks page enumerating only Copilot CLI and cloud agent on its surface list, and (b) the [Connecting GitHub Copilot CLI to VS Code](https://docs.github.com/en/copilot/how-tos/copilot-cli/connecting-vs-code) page not mentioning hooks in its body content. Both are absence-of-evidence signals, not positive documentation of "not supported." The body of §6.4 has been written to reflect that uncertainty explicitly rather than assert it as fact. A stronger claim would require exhaustively reading every VS Code Copilot doc page.
- **CLI-to-VS-Code hook applicability is inferred, not quoted**: The statement that CLI hooks apply when Copilot CLI is connected to VS Code is a logical consequence of (a) CLI-level hook loading rules and (b) the fact that the VS-Code-connected session is still a CLI session — neither the About hooks page nor the Connecting-to-VS-Code page states this explicitly. It is flagged as an implication in §6.4 rather than a verbatim rule.
- **Scope excluded**: Copilot SDK "Working with hooks" is noted but not deep-read — it's a developer API, not the user-facing `hooks.json` feature this report focuses on.

---

## 9. Complete Reference List

### Documentation & Articles (all docs.github.com, retrieved 2026-04-21)

**Body-cited (directly supports claims in this report):**

- [About hooks](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-hooks) — Conceptual overview; canonical surface list; canonical list of 8 hook types; config schema table; performance & security considerations.
- [Hooks configuration](https://docs.github.com/en/copilot/reference/hooks-configuration) — Reference for input/output JSON per hook type, scripting best practices, advanced patterns, example use cases.
- [Using hooks with GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/use-hooks) — How-to for creating a hook; default-branch vs. cwd loading rule; troubleshooting and debugging.
- [Using hooks with Copilot CLI for predictable, policy-compliant execution](https://docs.github.com/en/copilot/tutorials/copilot-cli-hooks) — Tutorial: end-to-end policy rollout with `.github/hooks/` layout, banner, prompt logging, preToolUse policy.
- [GitHub Copilot CLI configuration directory](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-config-dir-reference) — `~/.copilot/hooks/`, `disableAllHooks`, inline `hooks` key in `config.json`.
- [Comparing GitHub Copilot CLI customization features](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/comparing-cli-features) — Positions hooks vs. instructions / skills / MCP / subagents / plugins; decision guide.
- [Connecting GitHub Copilot CLI to VS Code](https://docs.github.com/en/copilot/how-tos/copilot-cli/connecting-vs-code) — Documents the CLI↔VS Code integration used in §6.4; confirms by absence that this page does not itself discuss hooks.

**Consulted background (informs context but not individually quoted in body):**

- [Customize agent workflows with hooks (cloud agent)](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/use-hooks) — Cloud-agent-flavored version of the how-to.
- [About GitHub Copilot CLI](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-copilot-cli) — Baseline CLI concept page.
- [GitHub Copilot CLI command reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference) — CLI commands/flags (context for `--config-dir`, `/session`, etc.).
- [Overview of customizing GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/overview) — Customization entry point.
- [Responsible use of GitHub Copilot CLI](https://docs.github.com/en/copilot/responsible-use/copilot-cli) — Context for the security posture around running arbitrary hooks.

### GitHub Repositories

None consulted — no third-party or official sample repositories were cited in the primary docs, and public repos were not needed to answer the scope.

### Code Samples

All code samples in this report are drawn verbatim or adapted from the pages listed above (primarily the [Hooks configuration](https://docs.github.com/en/copilot/reference/hooks-configuration) reference and the [Copilot CLI hooks tutorial](https://docs.github.com/en/copilot/tutorials/copilot-cli-hooks)) — Bash and PowerShell, demonstrating: session banner, preToolUse deny, path allow-list, structured JSONL audit logging, Slack webhook integration, and local hook testing via piped JSON.

---

## Revision Round 2 — 2026-04-21

Findings from `agent-reviews/2026-04-21-web-research-reviewer-copilot-hooks.md` Review Round 1 addressed in this revision:

- 🟡 Important — **§6.4 missing URL for "Connecting GitHub Copilot CLI to VS Code":** ✅ fixed. Located and verified the canonical URL (`https://docs.github.com/en/copilot/how-tos/copilot-cli/connecting-vs-code`); cited inline in Executive Summary, §6.4, §8, and added to the reference list under "Body-cited."
- 🟡 Important — **Executive Summary lacked inline citations for high-stakes claims:** ✅ fixed. Added per-claim inline citations covering lifecycle-event / stdin-payload / deny-tool-call behavior, the surface list (CLI + cloud agent), the VS Code nuance, config-file locations, and the security-sensitive-configuration characterization.
- 🟡 Important — **§3 "Copilot CLI works on all Copilot plans" partially sourced:** ✅ fixed. Removed the unsourced CLI-plan claim; kept only the cloud-agent plan quote (which is directly supported) and added an explicit caveat that CLI plan availability was not verified here.
- 🟡 Important — **§6.4 / §6.5 unsourced consequential claims (VS Code extension has no hooks, CLI-to-VS-Code is the documented path, SDK exposes hook-like surfaces, cloud runner is "sandboxed," malicious-repo hook timing):** ✅ fixed. Rewrote both sections: the VS Code claim is now framed as absence-of-evidence with inline citations to the About hooks surface list and the Connecting-to-VS-Code page; the SDK mention now cites the connecting-vs-code sidebar as the observed source; the "sandboxed runner" phrasing was removed in favor of the verifiable "runs on GitHub-hosted infrastructure, no runner-isolation guarantees published on the hooks pages"; the malicious-repo timing claim is now labeled as a logical implication of the documented `.github/hooks/*.json` discovery rule with that rule explicitly cited.
- 🟡 Important — **§6.4 body and §8 limitations disagreed on confidence for VS Code claim:** ✅ fixed. §6.4 now explicitly says "This is an absence-of-evidence conclusion, not a positively documented 'no,'" matching §8's hedged language, and §8 was expanded to enumerate which specific signals support the negative claim.
- 🟡 Important — **Missing post-block attribution on §2.4 payload blocks, §2.5 output JSON, and §4.1 `chmod`:** ✅ fixed. Added per-block `> — Source: … | Provenance: …` lines to each payload example (a per-block line plus a consolidating line after the first group), to the stdout decision JSON in §2.5, and to the `chmod` block (with a synthesized-provenance note since `chmod` is generic POSIX, not a GitHub-docs-specific example).
- 🟡 Important — **§6.4 CLI-vs-VS-Code operational boundary under-defined:** ✅ fixed. Added an enumerated "What the docs actually say (and don't say) about VS Code" subsection that distinguishes (1) VS Code native extension — not listed, (2) Copilot CLI connected to VS Code — documented connection, no explicit hook statement, (3) the reasoned implication that CLI hooks apply in VS-Code-connected CLI sessions, and (4) that hooks live on the agent runtime, not the editor.
- 🟡 Important — **Reference list missing the connecting-vs-code URL:** ✅ fixed. Added to §9 and split the list into "Body-cited" vs. "Consulted background" subsections (which also addresses the 🟢 Minor traceability suggestion).
- 🟢 Minor — **§4.2–§4.5 missing one-line setup reminder (`jq`, directories):** ✅ fixed. Added a single shell-prerequisite reminder block above §4.2 covering `jq` installation, repo-root cwd assumption, `logs/` directory, and PowerShell version.
- 🟢 Minor — **Split reference list by cited vs. background:** ✅ fixed (see above).

No findings were skipped or disputed in this round.

## Revision Round 3 — 2026-04-21

🟡 Important — **§2.4 payload blocks still shared one aggregate attribution line:** ✅ fixed. Each of the `sessionStart`, `sessionEnd`, `userPromptSubmitted`, `preToolUse`, and `postToolUse` JSON blocks now carries its own immediate post-block `> — Source: [Hooks configuration](https://docs.github.com/en/copilot/reference/hooks-configuration) | Provenance: verbatim` line; consistency pass confirmed all other code/JSON blocks in the report already follow the same pattern.
