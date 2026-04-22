# Research Report: GitHub Copilot CLI — Deep Dive (April 2026)

**Date:** 2026-04-21
**Researcher:** Copilot Web Researcher Agent
**Topic slug:** copilot-cli
**Sources consulted:** 8 documentation/article pages and 3 GitHub URLs (2 repositories + 1 raw changelog file) — 11 unique URLs total, enumerated in §9

---

## Executive Summary

GitHub Copilot CLI is a **terminal-native, agentic coding assistant** that you install as a standalone binary (`copilot`) and launch from any folder to work with your code using natural language ([About GitHub Copilot CLI](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli)). It is powered by the same agentic harness as GitHub's Copilot cloud agent, ships with the GitHub MCP server pre-configured, and supports the full GitHub workflow — reading files, running shell commands, editing code, creating pull requests, reviewing PRs, and merging — all from the command line ([copilot-cli README](https://github.com/github/copilot-cli); [Using GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli)). It entered public preview on **September 25, 2025** ([public preview changelog](https://github.blog/changelog/2025-09-25-github-copilot-cli-is-now-in-public-preview/)), and by April 2026 has matured into a weekly-updated tool (see [copilot-cli changelog](https://raw.githubusercontent.com/github/copilot-cli/main/changelog.md) for versions 1.0.23–1.0.34 landing between April 10 and April 20, 2026) with plan mode, autopilot mode, custom agents, MCP extensibility, remote control from web/mobile, ACP server support ([About GitHub Copilot CLI](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli)), and an "auto" model selector that went GA on April 17, 2026 ([auto model GA changelog](https://github.blog/changelog/2026-04-17-github-copilot-cli-now-supports-copilot-auto-model-selection/)).

Two points confuse beginners and deserve up-front clarity:

1. **This is not `gh copilot`.** The older `gh copilot suggest` / `gh copilot explain` extension (installed via `gh extension install github/gh-copilot`) was **deprecated on October 25, 2025** in favor of this new, far more capable CLI ([gh-copilot README](https://github.com/github/gh-copilot)). The two are distinct products; install the new one with `npm install -g @github/copilot`, `brew install copilot-cli`, `winget install GitHub.Copilot`, or the install script ([Installing GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli)).
2. **The CLI's model lineup differs from VS Code's.** Both charge premium requests per prompt × multiplier ([Requests in GitHub Copilot](https://docs.github.com/en/copilot/concepts/billing/copilot-requests)), but the CLI runs longer, more autonomous agent turns, defaults to **Claude Sonnet 4.5** ([About GitHub Copilot CLI — Model usage](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli)), and now supports `auto` with a 10% multiplier discount on paid plans ([auto model GA changelog](https://github.blog/changelog/2026-04-17-github-copilot-cli-now-supports-copilot-auto-model-selection/)). It does **not** expose every experimental model that appears in VS Code's chat model picker ([VS Code Chat overview](https://code.visualstudio.com/docs/copilot/chat/chat-modes)) — see Section 7's comparison table.

This report is a deep, practical reference: install, auth, interactive vs programmatic modes, the permission model, sessions, custom agents, MCP, model selection, BYO-model, typical workflows, and a side-by-side comparison with VS Code agent mode.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Key Concepts](#2-key-concepts)
3. [Getting Started](#3-getting-started)
4. [Core Usage](#4-core-usage)
5. [Configuration & Best Practices](#5-configuration--best-practices)
6. [Advanced Topics](#6-advanced-topics)
7. [Ecosystem, Alternatives & VS Code Comparison](#7-ecosystem-alternatives--vs-code-comparison)
8. [Research Limitations](#8-research-limitations)
9. [Complete Reference List](#9-complete-reference-list)

---

## 1. Overview

### What It Is

GitHub Copilot CLI is a standalone command-line program, distributed as `@github/copilot` on npm (and as native binaries via Homebrew, WinGet, and a curl install script), that launches an **interactive agentic session** in your terminal. You run it with the command `copilot` inside a project folder and converse with the agent, which can read and edit files, run shell commands (with your approval), call MCP tools, delegate to sub-agents, and interact with GitHub.com on your behalf.

> "The command-line interface (CLI) for GitHub Copilot allows you to use Copilot directly from your terminal. You can use it to answer questions, write and debug code, and interact with GitHub.com. For example, you can ask Copilot to make some changes to a project and create a pull request."
> — Source: [About GitHub Copilot CLI (GitHub Docs)](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli)

> "GitHub Copilot CLI brings AI-powered coding assistance directly to your command line, enabling you to build, debug, and understand code through natural language conversations. Powered by the same agentic harness as GitHub's Copilot coding agent, it provides intelligent assistance while staying deeply integrated with your GitHub workflow."
> — Source: [github/copilot-cli README](https://github.com/github/copilot-cli)

### Why It Matters

- **No context switch.** You stay in the terminal where you already run `git`, `npm`, `make`, `kubectl`, etc. The agent runs the same commands you would, in the same shell environment ([About GitHub Copilot CLI](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli)).
- **Real agentic workflows, not autocomplete.** The CLI can plan multi-step work, execute commands, observe output, and iterate — "fix this failing test suite" is a realistic single prompt ([Using GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli)).
- **GitHub-native.** Because the GitHub MCP server ships pre-configured, natural-language requests like "list my open PRs" or "merge PR #123 in octo-org/octo-repo" work out of the box ([About GitHub Copilot CLI — use cases](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli)).
- **Scriptable.** The `-p` / `--prompt` flag plus `--allow-all-tools` lets you embed Copilot CLI in CI pipelines, pre-commit hooks, or one-shot scripts ([About GitHub Copilot CLI — Programmatic interface](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli)).

### Key Features (as of April 2026)

Sourced from [About GitHub Copilot CLI](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli), [Using GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli), and the [copilot-cli changelog](https://raw.githubusercontent.com/github/copilot-cli/main/changelog.md):

- Interactive REPL with **ask/execute mode** and **plan mode** (toggle with `Shift+Tab`).
- **Autopilot** mode for long-running autonomous tasks.
- **Programmatic mode** via `-p "prompt"` that runs once and exits.
- **Granular permission model**: `--allow-tool`, `--deny-tool`, `--allow-all-tools` / `--yolo`.
- **Sessions**: `--continue` (resume last), `--resume` (pick from list), auto-compaction at 95% context.
- **Custom agents** (user / repo / org scope) plus four built-in sub-agents: Explore, Task, General-purpose, Code-review.
- **MCP integration**: GitHub MCP pre-installed; install more from the MCP registry with `/mcp add` (see changelog 1.0.25).
- **LSP support** for richer code intelligence.
- **Auto model selection** went GA in the CLI on April 17, 2026 ([changelog post](https://github.blog/changelog/2026-04-17-github-copilot-cli-now-supports-copilot-auto-model-selection/)), plus a `/model` picker including Claude Sonnet 4.5/4.6, GPT-5.4, Opus 4.7, Haiku 4.5, Gemini 3.1 Pro, and more.
- **Bring-your-own-model** via OpenAI-compatible / Azure OpenAI / Anthropic / Ollama.
- **ACP server** (Agent Client Protocol) to expose the CLI agent to third-party IDEs.
- **Remote control** of CLI sessions from web and mobile (public preview, April 13, 2026 — see changelog 1.0.25).

---

## 2. Key Concepts

### 2.1 Two user interfaces: interactive and programmatic

> "GitHub Copilot CLI has two user interfaces: interactive and programmatic."
> — Source: [About GitHub Copilot CLI](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli)

- **Interactive**: launch with `copilot` — a persistent REPL with slash commands, plan mode, tool-approval prompts, and auto-compaction.
- **Programmatic**: `copilot -p "…"` runs one prompt and exits. Intended for scripts, CI, and piping config into the CLI. Pair with `--allow-tool` or `--allow-all-tools` so the agent isn't blocked waiting for a human approval.

### 2.2 Trusted directories and the permission model

When you start Copilot CLI in a folder, it asks you to confirm that you trust those files. You can accept for the session, remember the folder, or exit.

> "During this GitHub Copilot CLI session, Copilot may attempt to read, modify, and execute files in and below this folder. You should only proceed if you trust the files in this location."
> — Source: [Using GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli)

Inside a session, whenever the agent wants to invoke a tool that can modify or execute files, it prompts you with three choices:

```
1. Yes
2. Yes, and approve TOOL for the rest of the running session
3. No, and tell Copilot what to do differently (Esc)
```
> — Source: [About GitHub Copilot CLI — Permission model](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli) | Provenance: adapted (paraphrased from the docs' three-option approval description)

Option 2 is session-scoped and broad — "approving `rm`" means the agent can run *any* `rm` during the session without asking again. Use it deliberately.

You can pre-declare approvals with CLI flags (precedence: `--deny-tool` > `--allow-tool` > `--allow-all-tools`):

| Flag | Effect |
| --- | --- |
| `--allow-all-tools` (alias `--yolo`) | Skip all approval prompts |
| `--allow-tool 'shell(git)'` | Auto-allow any `git` subcommand |
| `--allow-tool 'shell(git push)'` | Auto-allow only `git push` |
| `--allow-tool 'write'` | Auto-allow non-shell file writes |
| `--allow-tool 'My-MCP-Server(tool_name)'` | Auto-allow one MCP tool |
| `--deny-tool 'shell(rm)'` | Always block `rm` |

> "To prevent Copilot from using the `rm` and `git push` commands, but automatically allow all other tools, use:
> `copilot --allow-all-tools --deny-tool='shell(rm)' --deny-tool='shell(git push)'`"
> — Source: [About GitHub Copilot CLI — Combining approval options](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli)

### 2.3 Plan mode vs. ask/execute mode vs. autopilot

- **Ask/execute (default):** single-turn reply plus tool calls for the current request.
- **Plan mode:** toggled with `Shift+Tab`. The agent asks clarifying questions and produces a structured implementation plan *before* writing code. Great for complex multi-step work.
- **Autopilot (experimental):** another `Shift+Tab` cycle. The agent keeps working until the task is done without stopping for permission between steps (still subject to your `--allow-tool` / `--deny-tool` policy).

The changelog adds explicit flags for starting in a specific mode:

> "Add `--mode`, `--autopilot`, and `--plan` flags to start the CLI directly in a specific agent mode"
> — Source: [copilot-cli changelog 1.0.23 (2026-04-10)](https://raw.githubusercontent.com/github/copilot-cli/main/changelog.md)

### 2.4 Sessions and context

Sessions are persisted. You can resume them either locally or, with `--remote`, pick up a cloud-agent session that was kicked off on github.com.

- `copilot --continue` — resume the most recent local session.
- `copilot --resume` — pick from a list of past sessions (short 7+ hex prefixes accepted since 1.0.32).
- `copilot --connect <id>` — directly attach to a specific remote session.
- `/compact` inside a session — manually compress history.
- `/context` — visual token-usage breakdown.
- `/usage` — premium requests used, session duration, LOC edited, per-model token breakdown.

> "Copilot CLI automatically compresses your history in the background when your conversation approaches 95% of the token limit, without interrupting your workflow."
> — Source: [Using GitHub Copilot CLI — Context management](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli)

### 2.5 Built-in sub-agents

The main agent can delegate work to four built-in specialized agents ([About GitHub Copilot CLI — Built-in sub-agents](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli)):

| Agent | Description |
| --- | --- |
| **Explore** | Quick codebase analysis / Q&A without adding to main context |
| **Task** | Run commands like tests/builds; terse on success, full output on failure |
| **General-purpose** | Complex multi-step tasks in a separate context |
| **Code-review** | Surfaces genuine issues, minimizes noise |

You can also define your own custom agents (see Section 6.2).

### 2.6 The old `gh copilot` is a different product

Do not confuse Copilot CLI with the legacy `gh` extension. The legacy extension's README states it was deprecated on October 25, 2025 in favor of GitHub Copilot CLI, and recommends users install the new agentic assistant instead ([github/gh-copilot README](https://github.com/github/gh-copilot)).

| Old: `gh copilot` extension | New: Copilot CLI |
| --- | --- |
| Install: `gh extension install github/gh-copilot` | Install: `npm i -g @github/copilot` (or brew/winget/script) |
| Commands: `gh copilot suggest`, `gh copilot explain` | Command: `copilot` (interactive) or `copilot -p "…"` |
| Scope: suggest/explain one-liner shell commands | Scope: full agentic coding assistant with file edits, MCP, PRs, etc. |
| Status: deprecated (Oct 25, 2025) | Status: active, weekly releases |

---

## 3. Getting Started

### Prerequisites

- Active GitHub Copilot subscription (Free/Pro/Pro+/Business/Enterprise). If you're on an org plan, the **Copilot CLI policy must be enabled** in org settings.
- On Windows: **PowerShell v6 or higher** (plain `cmd.exe` is not supported — WSL also works).
- If installing via npm: **Node.js 22 or later**.

### Installation & Setup

#### Terminal Commands

```bash
# npm (all platforms). Requires Node 22+.
npm install -g @github/copilot

# Prerelease channel (if you want latest features / potentially unstable)
npm install -g @github/copilot@prerelease

# Homebrew (macOS and Linux)
brew install copilot-cli

# WinGet (Windows)
winget install GitHub.Copilot

# Install script (macOS / Linux)
curl -fsSL https://gh.io/copilot-install | bash
# Or pin a version and custom prefix:
curl -fsSL https://gh.io/copilot-install | VERSION="v0.0.369" PREFIX="$HOME/custom" bash
```
> — Source: [Installing GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | Provenance: verbatim from docs

The install docs note that if your `~/.npmrc` has `ignore-scripts=true`, the global npm install command will not run the CLI's install scripts, and you must re-run it with `npm_config_ignore_scripts=false` set for that invocation ([Installing GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli)).

#### First launch and authentication

```bash
# cd into the project you want to work with — not your home directory.
cd ~/code/my-project

# Launch the interactive CLI
copilot
```
> — Source: [Installing GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | Provenance: synthesized (standard shell invocation pattern from the install docs)

On first run you'll:

1. Confirm the folder is trusted ("Yes, proceed" / "remember this folder" / "exit").
2. If not logged in, run `/login` inside the prompt and follow the device-code flow.

**PAT-based auth** (for CI / servers):

The docs describe authenticating with a fine-grained personal access token that has the "Copilot Requests" permission enabled. The CLI reads the token from one of three environment variables, in precedence order: `COPILOT_GITHUB_TOKEN`, then `GH_TOKEN`, then `GITHUB_TOKEN` ([Installing GitHub Copilot CLI — Authenticating with a personal access token](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli)).

```bash
# Create a fine-grained PAT with "Copilot Requests" permission, then:
export COPILOT_GITHUB_TOKEN="github_pat_..."
copilot -p "Summarize README.md" --allow-tool=write
```
> — Source: [Installing GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | Provenance: adapted (env-var name verbatim from docs; shell syntax synthesized)

---

## 4. Core Usage

### 4.1 Interactive session basics

Inside the REPL:

- Type a natural-language prompt and press Enter.
- Approve tool calls as they come up (or pre-authorize with flags).
- Press **Esc** to stop a running operation.
- Press **Shift+Tab** to cycle modes (ask → plan → autopilot, when enabled).
- Press **Ctrl+T** to toggle reasoning visibility (persists across sessions).
- Prefix input with **`!`** to run a shell command directly without hitting the model, e.g. `!git status`.
- Reference files with **`@path/to/file`** to attach them as context (with Tab-completion).
- Enter **`?`** for the in-session help overlay.

### 4.2 Key slash commands

```text
/login               Start OAuth sign-in
/logout              Sign out of OAuth session
/model               Pick a model (Sonnet 4.5, GPT-5.4, Opus 4.7, auto, …)
/agent               Pick a custom agent for the next turn
/mcp                 List configured MCP servers; /mcp add opens the add-server form
/usage               Premium requests used, tokens per model, session length
/context             Visual breakdown of current context usage
/compact             Manually compact history
/add-dir <path>      Add another trusted directory to the session
/cwd <path>          Change working directory without restarting
/resume              Pick a past session to resume
/plan                Enter plan mode
/ask                 Ask a one-off question that doesn't enter conversation history
/diff                Show pending file changes
/undo                Rewind to an earlier checkpoint
/share               Export conversation as markdown or HTML
/statusline          Configure what the status bar shows (dir, branch, context, quota, …)
/feedback            Submit a bug/feature/survey
/env                 Show loaded instructions, MCP servers, skills, agents, plugins
/experimental        Toggle experimental features
/help  or  ?         Full help
```
> — Source: composite from [Using GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli) and [copilot-cli changelog](https://raw.githubusercontent.com/github/copilot-cli/main/changelog.md) | Provenance: synthesized

### 4.3 Programmatic / scripted mode

```bash
# Single-prompt run with a tightly scoped permission
copilot -p "Show me this week's commits and summarize them" \
        --allow-tool='shell(git)'

# Full headless: fix failing tests, let the agent do anything
copilot -p "Run the test suite and fix any failing tests" \
        --allow-all-tools \
        --deny-tool='shell(rm)' \
        --deny-tool='shell(git push)'

# Pipe a generated config into copilot
./generate-prompt.sh | copilot
```
> — Source: [About GitHub Copilot CLI — Programmatic interface](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli) | Provenance: verbatim + adapted

### 4.4 Useful real-world prompts

From the official "use cases" section:

- `Change the background-color of H1 headings to dark blue`
- `Show me the last 5 changes made to the CHANGELOG.md file. Who changed the file, when, and give a brief summary of the changes they made`
- `Commit the changes to this repo`
- `Revert the last commit, leaving the changes unstaged`
- `List my open PRs`
- `I've been assigned this issue: https://github.com/octo-org/octo-repo/issues/1234. Start working on this for me in a suitably named branch.`
- `In the root of this repo, add a Node script called user-info.js that outputs information about the user who ran the script. Create a pull request to add this file to the repo on GitHub.`
- `Check the changes made in PR https://github.com/octo-org/octo-repo/pull/57575. Report any serious errors you find in these changes.`
- `Merge all of the open PRs that I've created in octo-org/octo-repo`
- `Use the GitHub MCP server to find good first issues for a new team member to work on from octo-org/octo-repo`
- `Branch off from main and create a GitHub Actions workflow that will run on pull requests… Push the new branch and create a pull request.`

> — Source: [About GitHub Copilot CLI — Use cases](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli) | Provenance: verbatim

### 4.5 Typical workflows

**"Fix this repo" in one shot (CI-safe pattern):**

```bash
copilot -p "Run 'npm test'. If any tests fail, fix the underlying code and re-run until green. Do not modify tests." \
        --allow-tool='shell(npm)' \
        --allow-tool='shell(git diff)' \
        --allow-tool='write'
```
> — Source: [About GitHub Copilot CLI — Programmatic interface & permission flags](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli) | Provenance: synthesized (author-composed example using flags documented on the cited page)

**Resuming a conversation later:**

```bash
# Jump back into the last session
copilot --continue

# Or pick from the list (short 7+ hex prefix works)
copilot --resume
```
> — Source: [copilot-cli changelog 1.0.32](https://raw.githubusercontent.com/github/copilot-cli/main/changelog.md) and [Using GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli) | Provenance: adapted

**Kick off on the web, continue locally:**
Start a Copilot cloud agent session on github.com, then bring it to your terminal with `copilot --resume --remote` and attach with `--connect <id>` (per changelog 1.0.32).

---

## 5. Configuration & Best Practices

### 5.1 The `~/.copilot` configuration directory

By default, Copilot CLI reads and writes config to `~/.copilot` (override via `COPILOT_HOME`). Typical files:

| File / dir | Purpose |
| --- | --- |
| `config.json` | General settings (model, UI prefs, experimental flags) |
| `mcp-config.json` | Configured MCP servers |
| `lsp-config.json` | LSP servers for code intelligence |
| `agents/` | Your user-level custom agents (markdown profiles) |

Repo-level overrides live in the repo itself:

| Location | Purpose |
| --- | --- |
| `.github/copilot-instructions.md` | Repo-wide custom instructions (always injected) |
| `.github/instructions/**/*.instructions.md` | Path-scoped instructions (via `applyTo`) |
| `AGENTS.md` | Agent-file format also honored |
| `.github/agents/` | Repo-level custom agents |
| `.github/lsp.json` | Repo-level LSP config |

> "Details of your configured MCP servers are stored in the `mcp-config.json` file, which is located, by default, in the `~/.copilot` directory. This location can be changed by setting the `COPILOT_HOME` environment variable."
> — Source: [Using GitHub Copilot CLI — Add an MCP server](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli)

### 5.2 Environment variables you should know

Run `copilot help environment` for the authoritative list. Commonly-used ones, cross-referenced from [Installing GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli), [Using GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli), and [About GitHub Copilot CLI — Using your own model provider](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli):

| Variable | Purpose |
| --- | --- |
| `COPILOT_HOME` | Override config directory (default `~/.copilot`) |
| `COPILOT_GITHUB_TOKEN` / `GH_TOKEN` / `GITHUB_TOKEN` | Auth token (precedence in that order) |
| `COPILOT_PROVIDER_BASE_URL` | BYOM: base URL of model endpoint |
| `COPILOT_PROVIDER_TYPE` | BYOM: `openai` \| `azure` \| `anthropic` |
| `COPILOT_PROVIDER_API_KEY` | BYOM: provider API key |
| `COPILOT_MODEL` | BYOM: model name (also settable via `--model`) |
| `COPILOT_DISABLE_TERMINAL_TITLE` | Don't rewrite the terminal title |
| `COPILOT_AGENT_SESSION_ID` | Exposed to shell commands & MCP servers for correlation |

### 5.3 Best practices

- **Don't launch `copilot` from `$HOME`.** Launch it from the specific project you want the agent to work on. The CLI uses the launch directory as its trust boundary.
  > "Typically, you should not launch Copilot CLI from your home directory."
  > — Source: [About GitHub Copilot CLI — Trusted directories](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli)
- **Use plan mode for anything non-trivial.** Catch misunderstandings before any code is written.
- **Layer permissions instead of using `--yolo` alone.** Combine `--allow-all-tools` with targeted `--deny-tool` for the destructive commands you never want auto-approved (`rm`, `git push`, `kubectl delete`, etc.).
- **Put project-specific rules in `.github/copilot-instructions.md`.** These are auto-injected, so you don't re-explain the build command or test runner each session.
- **Pin a version for CI.** Use the install script with `VERSION=` or `npm install -g @github/copilot@<ver>` so a surprise release doesn't break your pipeline.
- **Run the CLI in a sandbox when using `--allow-all-tools`** — a container, VM, or restricted user account:
  > "You can mitigate the risks associated with using the automatic approval options by running Copilot CLI in a restricted environment—such as a virtual machine, container, or dedicated system—with tightly controlled permissions and network access."
  > — Source: [About GitHub Copilot CLI — Risk mitigation](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli)

### 5.4 Common pitfalls

Cross-referenced from [About GitHub Copilot CLI](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli), [Requests in GitHub Copilot](https://docs.github.com/en/copilot/concepts/billing/copilot-requests), and [gh-copilot README](https://github.com/github/gh-copilot):

- **Confusing this with `gh copilot`.** The old extension still exists (`gh copilot suggest`) but is deprecated and covers a far narrower use case.
- **Forgetting `--allow-tool` in programmatic mode.** The CLI will block waiting for an approval that never comes, then timeout.
- **Running out of premium requests mid-session.** Each prompt is billed at 1× multiplier; on Opus 4.7 that's **7.5× per prompt** ([model multiplier table](https://docs.github.com/en/copilot/concepts/billing/copilot-requests)). Use `/usage` frequently and consider `auto` for day-to-day work.
- **Letting the agent push broken code.** Add `--deny-tool='shell(git push)'` to your default alias and push yourself after reviewing.
- **Org policy surprises.** If your org disabled the "Copilot CLI policy," the tool simply won't work even though install succeeds ([Installing GitHub Copilot CLI — Prerequisites](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli)).

---

## 6. Advanced Topics

### 6.1 Model selection and premium requests

The CLI's default model is **Claude Sonnet 4.5**. Switch models with `/model` interactively or `--model <name>` on the command line.

Per the docs, Claude Sonnet 4.5 is the default model and GitHub reserves the right to change it. Each prompt submitted in interactive or programmatic mode draws down your monthly Copilot premium request quota by one, multiplied by the multiplier shown in parentheses next to the model name in the model list ([About GitHub Copilot CLI — Model usage](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli)).

**Auto model selection** went GA in the CLI on April 17, 2026. Per the changelog post, `auto` is now generally available across all Copilot plans, routes to models such as GPT-5.4, GPT-5.3-Codex, Sonnet 4.6, and Haiku 4.5 based on the user's plan and policies, and gives all paid subscribers a 10% discount on the model multiplier — so a 1× model used via `auto` draws down 0.9 premium requests instead of 1 ([GitHub Copilot CLI now supports Copilot auto model selection, 2026-04-17](https://github.blog/changelog/2026-04-17-github-copilot-cli-now-supports-copilot-auto-model-selection/)).

**Current model multipliers on paid plans** (selected; full list in the docs):

| Model | Multiplier |
| --- | --- |
| GPT-4.1 / GPT-4o / GPT-5 mini | 0 (included) |
| Claude Haiku 4.5 | 0.33 |
| GPT-5.4 mini | 0.33 |
| Gemini 3 Flash | 0.33 |
| Claude Sonnet 4 / 4.5 / 4.6 | 1 |
| GPT-5.2 / 5.3-Codex / 5.4 | 1 |
| Gemini 2.5 Pro / 3.1 Pro | 1 |
| Claude Opus 4.5 / 4.6 | 3 |
| Claude Opus 4.7 | 7.5 |
| Claude Opus 4.6 (fast mode, preview) | 30 |

> — Source: [Requests in GitHub Copilot — Model multipliers](https://docs.github.com/en/copilot/concepts/billing/copilot-requests)

**Important billing note for the CLI specifically:**

Per the billing docs, each prompt to Copilot CLI uses one premium request when on the default model, and other models multiply that by the model's rate. For agentic features, only the prompts the user sends count as premium requests — the autonomous tool calls Copilot makes while completing the task do not. For example, invoking `/plan` counts as one premium request, and any follow-up prompt counts as another ([Requests in GitHub Copilot — Copilot CLI](https://docs.github.com/en/copilot/concepts/billing/copilot-requests)).

### 6.2 Custom agents

Custom agents are markdown files with frontmatter that define a specialized persona, toolset, and instructions. Three scopes:

| Scope | Location | Applies to |
| --- | --- | --- |
| User | `~/.copilot/agents/` | All your projects |
| Repository | `.github/agents/` (in the repo) | Current project |
| Org/Enterprise | `/agents/` in the org's `.github-private` repo | All projects in that org |

Precedence (highest first): user → repo → org.

Invoke a custom agent three ways:

```bash
# 1. Slash command in an interactive session
/agent

# 2. Natural language — the model picks one that fits
# e.g. prompt: "Use the refactoring agent to refactor this code block"

# 3. Command-line flag for programmatic use
copilot --agent=refactor-agent --prompt "Refactor this code block"
```
> — Source: [Using GitHub Copilot CLI — Use custom agents](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli) | Provenance: verbatim

### 6.3 MCP integration

The **GitHub MCP server ships configured** — that's how prompts like "list my open PRs" work. To add more:

```text
# In an interactive session:
/mcp add
# Fill fields (Tab moves between them), Ctrl+S to save.
```
> — Source: [Using GitHub Copilot CLI — Add an MCP server](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli) | Provenance: adapted (paraphrased from the docs' add-server workflow)

Since changelog **1.0.25**, you can also install MCP servers from the registry with guided configuration directly in the CLI:

> "Install MCP servers from the registry with guided configuration directly in the CLI"
> — Source: [copilot-cli changelog 1.0.25 (2026-04-13)](https://raw.githubusercontent.com/github/copilot-cli/main/changelog.md)

For one-off / CI usage, scope per-server permissions:

```bash
# Auto-allow everything from My-MCP-Server except one tool
copilot --allow-tool='My-MCP-Server' \
        --deny-tool='My-MCP-Server(dangerous_tool)'
```
> — Source: [About GitHub Copilot CLI — Permission model](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli) | Provenance: synthesized (example composed from the documented `--allow-tool` / `--deny-tool` syntax)

**Known org-policy limitations** (as of April 2026): the docs note that Copilot CLI cannot currently honor two organization-level MCP policy types — the "MCP servers in Copilot" policy and the "MCP Registry URL" policy ([About GitHub Copilot CLI — Known MCP server policy limitations](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli)).

### 6.4 Bring your own model (BYOM)

You can point Copilot CLI at an OpenAI-compatible endpoint, Azure OpenAI, Anthropic, or a local model via Ollama/vLLM.

```bash
# Example: local Ollama
export COPILOT_PROVIDER_BASE_URL="http://localhost:11434/v1"
export COPILOT_PROVIDER_TYPE="openai"   # OpenAI-compatible
# COPILOT_PROVIDER_API_KEY not required for Ollama
export COPILOT_MODEL="llama3.1:70b"
copilot
```
> — Source: [About GitHub Copilot CLI — Using your own model provider](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli) | Provenance: synthesized (env-var names taken verbatim from the docs; Ollama endpoint is a standard local-server URL)

> "Models used with Copilot CLI must support tool calling (function calling) and streaming. If the model does not support these capabilities, Copilot CLI will return an error. For best results, the model should have a context window of at least 128k tokens."
> — Source: [About GitHub Copilot CLI — Using your own model provider](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli)

### 6.5 Hooks, skills, memory

- **Hooks** let you run shell commands at agent lifecycle events (preToolUse, postToolUse, notification) for validation/logging/security scanning. Hooks can modify args and inject `additionalContext` — see [copilot-cli changelog 1.0.24](https://raw.githubusercontent.com/github/copilot-cli/main/changelog.md).
- **Skills** package instructions + scripts + resources for specialized tasks. Skills can be managed with the `gh` CLI as of April 16, 2026 ([copilot-cli changelog](https://raw.githubusercontent.com/github/copilot-cli/main/changelog.md)).
- **Copilot Memory** persists learned repo conventions across sessions so you don't re-explain context ([Using GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli)).

### 6.6 ACP (Agent Client Protocol) server

Per the docs, ACP is an open standard for interacting with AI agents that lets any third-party tool, IDE, or automation system supporting the protocol use Copilot CLI as its agent ([About GitHub Copilot CLI — Use Copilot CLI via ACP](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli)).

Per [copilot-cli changelog 1.0.26](https://raw.githubusercontent.com/github/copilot-cli/main/changelog.md), the ACP server binds to localhost only for safety.

### 6.7 Remote control from web/mobile

Released to public preview on April 13, 2026 (see [copilot-cli changelog 1.0.25](https://raw.githubusercontent.com/github/copilot-cli/main/changelog.md)). Launch with `--remote` or toggle with `/remote` and you can steer the local CLI session from github.com's web and mobile UI — useful for checking in on long-running autonomous tasks.

### 6.8 Debugging

Cross-referenced from [copilot-cli changelog](https://raw.githubusercontent.com/github/copilot-cli/main/changelog.md) and [Using GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli):

- `copilot --print-debug-info` — dumps version, terminal capabilities, and env (added in changelog 1.0.32).
- `copilot help logging` — list of log levels.
- `/env` inside a session — see which instruction files, MCP servers, skills, and plugins actually loaded.
- `/feedback` — bundles logs into a private feedback submission.

---

## 7. Ecosystem, Alternatives & VS Code Comparison

### 7.1 CLI vs VS Code agent mode — at-a-glance comparison

Both products are "Copilot in agent mode" but they live in different places, with different UIs, defaults, and rough edges. This is the single biggest source of confusion for beginners.

| Dimension | **Copilot CLI** | **Copilot in VS Code (agent mode)** |
| --- | --- | --- |
| Surface | Terminal REPL (`copilot`) | VS Code Chat view / inline / quick chat |
| Install | `npm i -g @github/copilot` (or brew/winget/script) | Bundled with the GitHub Copilot VS Code extension |
| Primary target audience | Power users, scripts, CI, SSH/remote shells | IDE-centric developers who want visual diffs & editor integration |
| Default model (Apr 2026) | **Claude Sonnet 4.5** | Varies by account; picker includes GPT-5.x, Sonnet, Gemini, Opus, etc. |
| "auto" model selector | Yes — GA Apr 17, 2026 (10% discount on paid plans) | Yes — available in VS Code Chat with 10% multiplier discount |
| Available models | Narrower, curated list in `/model` (Sonnet 4.5/4.6, GPT-5.4, Opus 4.7, Haiku 4.5, Gemini 3.1 Pro, auto, …). Some experimental VS Code models are not exposed on the CLI. | Broader picker including preview models and vendor-specific variants |
| BYO model (OpenAI-compatible / Azure / Anthropic / Ollama) | Yes, via env vars | Limited; configured per-extension, not as first-class as CLI |
| Agent modes | Ask/execute, Plan, Autopilot (experimental), delegates to sub-agents | Agent, Plan, Ask — plus Local / Background / Cloud session targets |
| Permission model | Per-tool CLI flags (`--allow-tool`, `--deny-tool`, `--yolo`) + in-session prompts; approvals are session-scoped | Permission-level setting in UI (Ask / Approve-and-run / Autopilot); editor-scoped approvals |
| Diff review | Text diff in terminal (`/diff`) | Rich inline diffs, checkpoints, stage-to-accept in Source Control |
| Checkpoints / undo | `/undo` rewinds to checkpoints (git-based) | Automatic snapshots with checkpoint UI |
| Context attachment | `@file` paths; `/add-dir`, `/cwd`, attach documents | `#file`, `#codebase`, `#terminalSelection`, `@vscode`, `@terminal`, image paste, browser elements (exp.) |
| MCP servers | Pre-configured GitHub MCP; `/mcp add`; `mcp-config.json` | Configured via VS Code `.mcp.json` / extension settings |
| Custom agents | User / repo / org markdown profiles; invoke with `/agent` or `--agent=` | `.agent.md` files; `/create-agent` can generate one from a conversation |
| Sessions | Local + remote resume (`--continue`, `--resume`, `--connect`) | Chat sessions are persisted in VS Code; Cloud sessions run as cloud agents |
| Remote control from web/mobile | Yes (public preview Apr 13, 2026) via `--remote` | Cloud agent sessions steerable from github.com |
| Scripting / CI | First-class (`-p`, `--allow-all-tools`, pipes, exit codes) | Limited — VS Code not designed for unattended use |
| ACP server | Yes — exposes the agent to any ACP-compatible host | Acts as ACP client for external agents |
| Premium request billing | 1 request per prompt × model multiplier (tool calls don't count) | Same formula; same SKU ("Copilot premium requests") |
| Org policy support for disabling | Yes (specific "Copilot CLI" policy toggle) | Yes (general Copilot Chat policy) |
| Windows support | PowerShell v6+ or WSL | Any supported VS Code platform |

> Sources (composite): [About GitHub Copilot CLI](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli), [Using GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli), [VS Code Chat overview](https://code.visualstudio.com/docs/copilot/chat/chat-modes), [copilot-cli changelog](https://raw.githubusercontent.com/github/copilot-cli/main/changelog.md), [Requests in GitHub Copilot](https://docs.github.com/en/copilot/concepts/billing/copilot-requests).

### 7.2 When to pick which

- **Pick the CLI when:** you live in the terminal; you're on an SSH box, a devcontainer, or CI; you want to script agent runs; you want the most direct control over which shell commands execute; you want to expose the agent via ACP to another tool.
- **Pick VS Code agent mode when:** you're actively editing code in VS Code; you value rich diff review, checkpoints, and image/browser context; your workflow is visual rather than scriptable.
- **Use both.** They share your Copilot subscription and premium-request pool, and sessions started in one surface (e.g. a cloud agent kicked off from github.com) can be steered from the other.

### 7.3 Related tools

- **`gh copilot` (legacy gh-extension):** narrower `suggest`/`explain` tool, deprecated October 25, 2025; use Copilot CLI instead.
- **Copilot cloud agent:** runs the same agentic harness on github.com infrastructure, spawned by assigning an issue/PR to Copilot; the CLI can resume and steer these sessions with `--remote` / `--resume`.
- **Aider, Claude Code, Cursor CLI, Codex CLI:** third-party terminal agents with similar goals. Copilot CLI's differentiators are the pre-configured GitHub MCP integration, unified billing with the rest of your Copilot plan, and org/enterprise policy controls.

---

## 8. Research Limitations

- **Fast-moving product.** The CLI is on a weekly release cadence (`1.0.23` → `1.0.34` all landed between April 10 and April 20, 2026). Flags, slash commands, and defaults noted here may shift; always cross-check with `copilot help` and the current changelog.
- **Model lineup is not exhaustive.** The model multiplier table in Section 6.1 is the April 2026 snapshot from the billing docs and GitHub explicitly reserves the right to change it. Some models (e.g. GPT-5.2-Codex) appear in the billing table but may not be exposed in the `/model` picker for every plan.
- **Some docs pages could not be fetched** during research (e.g. `copilot-cli-command-reference`, `authenticating-copilot-cli`, `best-practices` at their guessed URLs returned 404). The `/help` overlay and `copilot help <topic>` in the installed CLI are the authoritative command reference.
- **Autopilot mode is still gated as experimental** per the repo README — behavior may change when it reaches GA.
- **Enterprise-specific configuration** (GHE hosts, data residency, FedRAMP) is touched on but not exhaustively documented here; see the linked enterprise policy pages.
- **Third-party comparisons** in Section 7.3 are deliberately brief; this report focuses on Copilot CLI itself.

---

## 9. Complete Reference List

### Documentation & Articles

- [About GitHub Copilot CLI (GitHub Docs)](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli) — Conceptual overview: modes, use cases, permission model, security, model usage, ACP, known limitations.
- [Using GitHub Copilot CLI (GitHub Docs)](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli) — Practical how-to: launch, prompts, slash commands, custom agents, MCP, context management.
- [Installing GitHub Copilot CLI (GitHub Docs)](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) — Install instructions for npm / brew / winget / script, plus PAT auth.
- [Requests in GitHub Copilot (GitHub Docs)](https://docs.github.com/en/copilot/concepts/billing/copilot-requests) — Premium request accounting; how CLI prompts are billed; full model multiplier table.
- [GitHub Copilot CLI is now in public preview (GitHub Changelog, 2025-09-25)](https://github.blog/changelog/2025-09-25-github-copilot-cli-is-now-in-public-preview/) — Original preview announcement (cited for the Sept 25, 2025 public-preview date in the Executive Summary).
- [GitHub Copilot CLI now supports Copilot auto model selection (GitHub Changelog, 2026-04-17)](https://github.blog/changelog/2026-04-17-github-copilot-cli-now-supports-copilot-auto-model-selection/) — Auto model GA, 10% discount details.
- [Chat overview — Visual Studio Code docs](https://code.visualstudio.com/docs/copilot/chat/chat-modes) — VS Code Chat & agent mode overview used for the comparison table.
- [Install script (`gh.io/copilot-install`)](https://gh.io/copilot-install) — Canonical Bash install script for macOS/Linux.

### GitHub Repositories

- [github/copilot-cli](https://github.com/github/copilot-cli) — Canonical source for the modern Copilot CLI (README, release binaries, issue tracker).
- [github/copilot-cli — changelog.md](https://raw.githubusercontent.com/github/copilot-cli/main/changelog.md) — Week-by-week release notes (versions 1.0.23–1.0.34, April 2026); richest source of newly added flags and slash commands.
- [github/gh-copilot](https://github.com/github/gh-copilot) — Legacy `gh copilot suggest/explain` extension (deprecated Oct 25, 2025); cited to distinguish from the new CLI.

**Reference inventory reconciliation:** 8 documentation/article URLs + 3 GitHub URLs (the `github/copilot-cli` repo, its `changelog.md` raw file, and the `github/gh-copilot` repo) = **11 unique URLs** consulted, matching both the header count and the enumerated entries above. A previous draft double-counted some items under a separate "Code Samples" subsection and included an orphaned `?label=copilot-cli` changelog-index URL with no in-body citation; both have been removed so the inventory is auditable.

---

*Revision Round 3 — 2026-04-21: reconciled source-inventory counts across header, §9 list, and reconciliation note (11 unique URLs); removed internal remediation log (tracking now lives only in the review file).*
