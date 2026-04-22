# Research Report: GitHub Copilot Advanced Agentic Workflows

**Date:** 2026-04-21
**Researcher:** Copilot Web Researcher Agent
**Topic slug:** copilot-advanced-agents
**Sources consulted:** 27 unique URLs across GitHub Docs (18), code.visualstudio.com (1), github.blog (4), and the `github/gh-aw` repository plus 3 raw/hosted repo files. (The §11 "Code Samples" subsection re-cites 5 of these URLs to map them to specific sample files, so the total link-entry count there is higher than the unique-URL count.)

**Revision Round 2 (2026-04-21):** Addressed `🟡 Important` reference-integrity findings (added missing `Configure agent runners` citation, removed two orphaned repo-file references, reconciled header source count), converted §2.5 attribution to the post-block format, and added inline citations to framing sentences in §1 and §8.3.

**Revision Round 3 (2026-04-21):** Reconciled header category counts to match §11 exactly (GitHub Docs: 18; repo files: 2; total unique URLs: 26) and reformatted the §2.5 ASCII-topology attribution to the standard `> — Source: … | Provenance: synthesized` post-block form.

---

## Executive Summary

GitHub's agentic surface in 2026 centers on three execution environments — the **VS Code chat runtime**, the **GitHub Copilot CLI** (terminal), and the **Copilot cloud agent** (formerly "coding agent") running in GitHub Actions-powered sandboxes — all of which consume a common **`.agent.md` custom-agent profile** stored under `.github/agents/` in a repo, or in a `.github-private` repo for org/enterprise scope ([GitHub Docs — About custom agents (cloud)](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-custom-agents); [GitHub Docs — About custom agents (CLI)](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-custom-agents); [VS Code — Custom agents](https://code.visualstudio.com/docs/copilot/customization/custom-chat-modes)). At GitHub Universe 2025 (October 28, 2025), GitHub announced **Agent HQ**, an open ecosystem that surfaces Copilot, Anthropic Claude, and OpenAI Codex (and later Google, Cognition, xAI) as peer coding agents under a paid Copilot subscription, with a cross-surface **mission control** for assigning, steering, and tracking them ([GitHub Blog — Agent HQ](https://github.blog/news-insights/company-news/welcome-home-agents/); [GitHub Blog — Pick your agent](https://github.blog/news-insights/company-news/pick-your-agent-use-claude-and-codex-on-agent-hq/)).

The cloud agent is invoked by assigning an issue to Copilot, mentioning `@copilot` / `@claude` / `@codex` in PR comments, or posting from the Agents tab / VS Code / Mobile; work runs asynchronously in an ephemeral GitHub Actions runner and ends in a draft PR ([GitHub Docs — About cloud agent](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent); [GitHub Docs — About third-party agents](https://docs.github.com/en/copilot/concepts/agents/about-third-party-agents)). The CLI adds **subagents**, a **`/fleet`** orchestrator that parallelizes subtasks, **autopilot** mode, **hooks**, **ACP** (Agent Client Protocol) exposure, and first-class integration with **GitHub Actions** via `npm i -g @github/copilot` + `copilot -p` ([GitHub Docs — Automate with Actions](https://docs.github.com/en/copilot/how-tos/copilot-cli/automate-copilot-cli/automate-with-actions); [GitHub Docs — /fleet](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/fleet); [GitHub Docs — Autopilot](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/autopilot)).

For repo-level orchestration beyond the coding agent, GitHub Next's **`github/gh-aw` (GitHub Agentic Workflows)** lets you author markdown-with-YAML-frontmatter workflows that compile to `.lock.yml` Actions files and run Copilot/Claude/Codex/Gemini engines with sandboxed "safe outputs" and an Agent Workflow Firewall ([github/gh-aw README](https://github.com/github/gh-aw); [gh-aw — How They Work](https://github.github.com/gh-aw/introduction/how-they-work/)). The net picture: a single profile format (`.agent.md` / `AGENTS.md`) drives specialized personas, while three runtimes (IDE, CLI, cloud) and an Actions-native DSL (gh-aw) give you interactive, terminal, and autonomous execution with shared governance primitives.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Key Concepts](#2-key-concepts)
3. [Getting Started](#3-getting-started)
4. [Custom Agents in VS Code vs Copilot CLI](#4-custom-agents-in-vs-code-vs-copilot-cli)
5. [The Copilot Cloud Agent (Issues, PRs, `@copilot`)](#5-the-copilot-cloud-agent-issues-prs-copilot)
6. [Orchestrating via GitHub Actions (gh-aw and CLI-in-Actions)](#6-orchestrating-via-github-actions-gh-aw-and-cli-in-actions)
7. [Agent HQ and Mission Control](#7-agent-hq-and-mission-control)
8. [Third-Party / Subagent Patterns (Codex, Claude)](#8-third-party--subagent-patterns-codex-claude)
9. [Configuration & Best Practices](#9-configuration--best-practices)
10. [Research Limitations](#10-research-limitations)
11. [Complete Reference List](#11-complete-reference-list)

---

## 1. Overview

### What It Is

"Advanced agentic workflows" on GitHub Copilot refers to the collection of features that let a developer delegate multi-step coding work to one or more AI agents, configure their persona/tools/scope with version-controlled files, and run them interactively (IDE, CLI) or asynchronously (cloud, Actions) ([GitHub Docs — About cloud agent](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent); [GitHub Docs — About Copilot CLI](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-copilot-cli); [VS Code — Custom agents](https://code.visualstudio.com/docs/copilot/customization/custom-chat-modes)). The three runtimes share a common profile format and MCP tool protocol ([GitHub Docs — About custom agents (cloud)](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-custom-agents); [GitHub Docs — MCP and cloud agent](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/mcp-and-cloud-agent)); Agent HQ (rolling out through 2026) layers cross-agent orchestration on top ([GitHub Blog — Agent HQ](https://github.blog/news-insights/company-news/welcome-home-agents/)).

### Why It Matters

> "With Copilot cloud agent, GitHub Copilot can work independently in the background to complete tasks, just like a human developer."
> — Source: [About GitHub Copilot cloud agent — GitHub Docs](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent)

> "With Agent HQ what's not changing is just as important as what is. You're still working with the primitives you know—Git, pull requests, issues—and using your preferred compute, whether that's GitHub Actions or self-hosted runners."
> — Source: [Agent HQ: Any agent, any way you work — GitHub Blog](https://github.blog/news-insights/company-news/welcome-home-agents/)

The value is parallelism (fan out many specialized agents), reproducibility (profiles and prompts live in the repo), and governance (everything becomes a commit, PR, or audit-log event) ([GitHub Docs — About cloud agent](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent)).

### Key Features

- **Custom agents** defined in `.agent.md` Markdown + YAML frontmatter — shared across VS Code, CLI, cloud ([VS Code docs](https://code.visualstudio.com/docs/copilot/customization/custom-chat-modes); [GitHub Docs — About custom agents (cloud)](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-custom-agents)).
- **Subagents** and **handoffs** for multi-step orchestration in VS Code ([VS Code — Custom agents](https://code.visualstudio.com/docs/copilot/customization/custom-chat-modes)).
- **`/fleet`** parallel subagent execution in Copilot CLI ([GitHub Docs — /fleet](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/fleet)).
- **Autopilot** autonomous mode in CLI ([GitHub Docs — Autopilot](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/autopilot)).
- **Cloud agent** triggered from Issues (assignee = Copilot), PR `@copilot` mentions, Agents tab, VS Code, or Mobile ([GitHub Docs — About cloud agent](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent)).
- **Hooks** (JSON at `.github/hooks/*.json`) for session / tool / prompt lifecycle events ([GitHub Docs — About hooks](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-hooks)).
- **`@github/copilot` npm package** runnable in CI with `copilot -p "…"` ([GitHub Docs — Automate with Actions](https://docs.github.com/en/copilot/how-tos/copilot-cli/automate-copilot-cli/automate-with-actions)).
- **`gh-aw`** — GitHub Next's markdown-native agentic workflow DSL that compiles to Actions `lock.yml` ([github/gh-aw README](https://github.com/github/gh-aw)).
- **Agent HQ / Mission Control** — single UI for Copilot + Claude + Codex across GitHub, VS Code, Mobile ([GitHub Blog — Agent HQ](https://github.blog/news-insights/company-news/welcome-home-agents/)).

---

## 2. Key Concepts

### 2.1 Agent profile (`.agent.md`)

Agent profiles are Markdown files with YAML frontmatter. They specify a persona, tool allowlist, MCP servers, target runtime, handoffs, and hooks. The same file format is read by VS Code chat, Copilot cloud agent, and Copilot CLI; environment-specific fields (e.g., `model`, `handoffs`, `hooks`) may be ignored outside the runtime that supports them ([GitHub Docs — About custom agents (cloud)](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-custom-agents); [VS Code — Custom agents](https://code.visualstudio.com/docs/copilot/customization/custom-chat-modes)).

> "Agent profiles are Markdown files with YAML frontmatter. In their simplest form, they include: Name (optional)… Description… Prompt… Tools (optional)."
> — Source: [About custom agents — GitHub Docs (cloud)](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-custom-agents)

### 2.2 Agent scopes (where profiles live)

| Scope | Location | Availability |
|---|---|---|
| User | `~/.copilot/agents/` | All local CLI/VS Code sessions |
| Workspace / Repository | `.github/agents/NAME.agent.md` | That repo (cloud + CLI + VS Code) |
| Workspace (Claude format) | `.claude/agents/NAME.md` | VS Code (read) and Claude Code |
| Organization / Enterprise | `/agents/NAME.agent.md` in a `.github-private` repo | All repos under that org/enterprise |

Source: [GitHub Docs — Invoking custom agents (CLI)](https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli-agents/invoke-custom-agents); [GitHub Docs — About custom agents (cloud)](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-custom-agents); [VS Code — Custom agents](https://code.visualstudio.com/docs/copilot/customization/custom-chat-modes).

> "In the case of naming conflicts, a system-level agent overrides a repository-level agent, and the repository-level agent would override an organization-level agent."
> — Source: [Invoking custom agents — GitHub Docs](https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli-agents/invoke-custom-agents)

### 2.3 Subagents, handoffs, fleet

- **Subagent** — a temporary agent with its own context window spun up by the main agent; built-in subagents in CLI are `explore`, `task`, `general-purpose`, `code-review`, and `research` ([GitHub Docs — About custom agents (CLI)](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-custom-agents)).
- **Handoff** (VS Code only) — a button rendered after an assistant turn that transitions the user to another agent with a pre-filled prompt ([VS Code — Custom agents](https://code.visualstudio.com/docs/copilot/customization/custom-chat-modes)).
- **`/fleet`** (CLI) — the main agent acts as orchestrator, decomposing a plan into parallelizable subtasks run as subagents ([GitHub Docs — /fleet](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/fleet)).

### 2.4 MCP and tools

Copilot across runtimes speaks the Model Context Protocol (MCP). The GitHub MCP server is pre-wired in the CLI and cloud agent; additional servers are declared in the agent profile's `mcp-servers` property, in `~/.copilot/mcp-config.json`, or via `/mcp add` ([GitHub Docs — MCP and cloud agent](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/mcp-and-cloud-agent); [GitHub Docs — Invoking custom agents](https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli-agents/invoke-custom-agents)).

### 2.5 Runtime topology (ASCII)

```
┌──────────────────────────────────────────────────────────────────────┐
│                       Shared profile: .agent.md                      │
│   Repo: .github/agents/*.agent.md   Org: .github-private/agents/*    │
└───────────┬──────────────────┬────────────────────┬─────────────────┘
            │                  │                    │
      ┌─────▼─────┐      ┌─────▼─────┐      ┌───────▼────────┐
      │  VS Code  │      │ Copilot   │      │ Copilot Cloud  │
      │  Chat /   │      │   CLI     │      │  Agent (GHA    │
      │  Agent    │      │ (term.)   │      │  runner)       │
      │  Sessions │      │ /fleet    │      │  Issues / PR   │
      │ handoffs  │      │ autopilot │      │  @copilot      │
      └─────┬─────┘      └─────┬─────┘      └────────┬───────┘
            └────── Agent HQ / Mission Control ──────┘
                   (github.com, VS Code, Mobile)
```
> — Source: [GitHub Blog — Agent HQ: Any agent, any way you work](https://github.blog/news-insights/company-news/welcome-home-agents/); [GitHub Blog — How to orchestrate agents using Mission Control](https://github.blog/ai-and-ml/github-copilot/how-to-orchestrate-agents-using-mission-control/) | Provenance: synthesized

---

## 3. Getting Started

### Prerequisites

- A GitHub Copilot plan. Copilot cloud agent and third-party agents require **Copilot Pro, Pro+, Business, or Enterprise**; CLI is available on **all Copilot plans** ([GitHub Docs — About cloud agent](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent); [GitHub Docs — About Copilot CLI](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-copilot-cli)).
- For CLI: Linux / macOS / Windows via PowerShell or WSL; Node.js for `npm install -g @github/copilot` ([GitHub Docs — About Copilot CLI](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-copilot-cli)).
- For cloud agent with third-party agents: Claude / Codex must be **explicitly enabled** in individual or org Copilot policies ([GitHub Docs — About third-party agents](https://docs.github.com/en/copilot/concepts/agents/about-third-party-agents)).

### Installation

```bash
# Install Copilot CLI
npm install -g @github/copilot

# Start an interactive session (authentication prompt on first run)
copilot

# Or run a one-shot programmatic prompt
copilot -p "List my open PRs"
```
> — Source: [About Copilot CLI — GitHub Docs](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-copilot-cli) | Provenance: verbatim command fragments recombined into a canonical install sequence.

```bash
# Install the gh-aw GitHub CLI extension
curl -sL https://raw.githubusercontent.com/github/gh-aw/main/install-gh-aw.sh | bash

# Verify
gh aw version

# Create a new workflow and compile
gh aw new my-workflow
gh aw compile
```
> — Source: [github/gh-aw — create.md](https://raw.githubusercontent.com/github/gh-aw/main/create.md) | Provenance: verbatim.

### First `.agent.md`

Drop this at `.github/agents/readme-creator.agent.md`:

```markdown
---
name: readme-creator
description: Agent specializing in creating and improving README files
---

You are a documentation specialist focused on README files. Your scope is limited to README files or other related documentation files only - do not modify or analyze code files.

Focus on the following instructions:
- Create and update README.md files with clear project descriptions
- Structure README sections logically: overview, installation, usage, contributing
- Write scannable content with proper headings and formatting
- Add appropriate badges, links, and navigation elements
- Use relative links (e.g., `docs/CONTRIBUTING.md`) instead of absolute URLs for files within the repository
- Make links descriptive and add alt text to images
```
> — Source: [About custom agents — GitHub Docs (cloud)](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-custom-agents) | Provenance: verbatim.

---

## 4. Custom Agents in VS Code vs Copilot CLI

Custom agents share the `.agent.md` format, but the two runtimes diverge meaningfully.

### 4.1 VS Code — what's unique

The VS Code Custom agents page describes a richer frontmatter surface tailored to the interactive editor:

> "Custom agents enable you to configure the AI to adopt different personas tailored to specific development roles and tasks… You can also use handoffs to create guided workflows between agents."
> — Source: [Custom agents in VS Code — code.visualstudio.com](https://code.visualstudio.com/docs/copilot/customization/custom-chat-modes)

Unique VS Code-only frontmatter fields:

- **`handoffs:`** — list of buttons displayed after a turn that switch to another agent and pre-fill a prompt. Fields: `label`, `agent`, `prompt`, `send` (auto-submit), `model` ([VS Code — Custom agents](https://code.visualstudio.com/docs/copilot/customization/custom-chat-modes)).
- **`agents:`** — declares which agents this one may invoke as subagents (`*` for all, `[]` to disallow). Requires the `agent` tool in `tools:` ([VS Code — Custom agents](https://code.visualstudio.com/docs/copilot/customization/custom-chat-modes)).
- **`user-invocable:`** / **`disable-model-invocation:`** — split the deprecated `infer` flag into "show in picker" vs "callable as subagent" ([VS Code — Custom agents](https://code.visualstudio.com/docs/copilot/customization/custom-chat-modes)).
- **`hooks:` (Preview)** — scoped hook commands only active when this agent runs ([VS Code — Custom agents](https://code.visualstudio.com/docs/copilot/customization/custom-chat-modes)).
- **`target:` (`vscode` | `github-copilot`)** — lets a profile be restricted to one runtime ([GitHub Docs — Create custom agents (cloud)](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/create-custom-agents)).
- **Claude format** — VS Code also reads `.claude/agents/*.md` with `name`, `description`, `tools` (comma-separated), and `disallowedTools` so the same file works in Claude Code:

> "VS Code also detects .md files in the .claude/agents folder, following the Claude sub-agents format. This enables you to use the same agent definitions across VS Code and Claude Code."
> — Source: [Custom agents in VS Code — code.visualstudio.com](https://code.visualstudio.com/docs/copilot/customization/custom-chat-modes)

Example handoff frontmatter:

```yaml
---
description: Generate an implementation plan
tools: ['search', 'web']
handoffs:
  - label: Start Implementation
    agent: implementation
    prompt: Now implement the plan outlined above.
    send: false
    model: GPT-5.2 (copilot)
---
```
> — Source: [Custom agents in VS Code — code.visualstudio.com](https://code.visualstudio.com/docs/copilot/customization/custom-chat-modes) | Provenance: verbatim.

**Agent-orchestrator pattern (Feature Builder)** — a coordinator with read-only researcher and edit-scoped implementer:

```yaml
# .github/agents/feature-builder.agent.md
---
name: Feature Builder
description: Build features by researching first, then implementing
tools: ['agent']
agents: ['Researcher', 'Implementer']
---
You are a feature builder. For each task:
1. Use the Researcher agent to gather context and find relevant patterns in the codebase
2. Use the Implementer agent to make the actual code changes based on research findings
```
> — Source: [Custom agents in VS Code — code.visualstudio.com](https://code.visualstudio.com/docs/copilot/customization/custom-chat-modes) | Provenance: verbatim.

VS Code also exposes the **Chat Customizations editor** (`Chat: Open Chat Customizations`) and a `/create-agent` slash command that generates an `.agent.md` from a description ([VS Code — Custom agents](https://code.visualstudio.com/docs/copilot/customization/custom-chat-modes)). Org-level discovery requires `github.copilot.chat.organizationCustomAgents.enabled: true` ([VS Code — Custom agents](https://code.visualstudio.com/docs/copilot/customization/custom-chat-modes)).

### 4.2 Copilot CLI — what's unique

The CLI adds lifecycle, parallelism, and headless execution controls that VS Code does not:

- **Built-in subagents**: `explore` (read-only codebase Q&A), `task` (runs tests/builds, returns brief summaries), `general-purpose`, `code-review`, and `research` (invoked only via `/research`) ([GitHub Docs — About custom agents (CLI)](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-custom-agents)).
- **`/fleet` orchestrator** for parallel subagent execution:

> "When you use the /fleet command, the main Copilot agent analyzes the prompt and determines whether it can be divided into smaller subtasks… Where possible, the orchestrator agent will run the subagents in parallel."
> — Source: [Running tasks in parallel with the /fleet command — GitHub Docs](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/fleet)

- **Autopilot mode** (toggle with Shift + Tab): "Copilot CLI works through each step autonomously until it determines the task is complete… The maximum continuation limit is reached (if set)." — [GitHub Docs — Autopilot](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/autopilot).
- **Plan mode** (another Shift+Tab mode) that builds a structured implementation plan before writing code ([GitHub Docs — About Copilot CLI](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-copilot-cli)).
- **Programmatic mode**: `copilot -p "PROMPT"` with `--allow-tool`, `--deny-tool`, `--allow-all-tools`, `--no-ask-user`, and `--agent NAME` ([GitHub Docs — About Copilot CLI](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-copilot-cli)).
- **`.agent.md` filename** convention enforced by the CLI (e.g. `security-expert.agent.md`); invocation by CLI flag uses the filename minus `.agent.md`:

```bash
copilot --agent security-auditor --prompt "Check /src/app/validator.go"
```
> — Source: [Creating and using custom agents for GitHub Copilot CLI — GitHub Docs](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/create-custom-agents-for-cli) | Provenance: verbatim.

- **ACP (Agent Client Protocol)** — open standard that exposes Copilot CLI as a pluggable agent to third-party tools/IDEs ([GitHub Docs — About Copilot CLI](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-copilot-cli)).
- **`/chronicle`** slash command for standup/tips/improve reports derived from session history stored in `~/.copilot/session-state/` ([GitHub Docs — Chronicle](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/chronicle)).
- **BYO model** via `COPILOT_PROVIDER_TYPE` (`openai` | `azure` | `anthropic`), `COPILOT_PROVIDER_BASE_URL`, `COPILOT_PROVIDER_API_KEY`, `COPILOT_MODEL`; model must support tool calling + streaming ([GitHub Docs — About Copilot CLI](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-copilot-cli)).
- **VS Code bridge**: starting the CLI in a directory matching an open trusted workspace auto-connects; the `/ide` slash command lets you re-bind. When connected, the CLI shows selection as implicit context, renders edit diffs in a VS Code tab, and surfaces live diagnostics ([GitHub Docs — Connecting Copilot CLI to VS Code](https://docs.github.com/en/copilot/how-tos/copilot-cli/connecting-vs-code)).

> "If Copilot CLI successfully connects to VS Code, the environment message that's displayed at startup will include either 'Visual Studio Code connected' or 'Visual Studio Code - Insiders connected.'"
> — Source: [Connecting GitHub Copilot CLI to VS Code — GitHub Docs](https://docs.github.com/en/copilot/how-tos/copilot-cli/connecting-vs-code)

### 4.3 Side-by-side summary

| Capability | VS Code | Copilot CLI |
|---|---|---|
| Profile format | `.agent.md` (YAML + MD) + `.claude/agents/*.md` | `.agent.md` (YAML + MD) |
| Default profile locations | `.github/agents/`, `~/.copilot/agents/` | `.github/agents/`, `~/.copilot/agents/` |
| Handoffs (buttons) | ✅ | ❌ |
| Subagents | ✅ (`agents:` frontmatter) | ✅ (built-in + custom, `/fleet`) |
| Parallel orchestration | Via subagents | `/fleet` (explicit) |
| Autopilot / autonomous loop | N/A (agent mode is similar but synchronous) | ✅ (Shift+Tab) |
| Invoke from CI | Via background/cloud agent | `npm i -g @github/copilot` then `copilot -p` |
| Third-party IDE embedding | Native editor | ACP server |
| BYO model | (Model picker / copilot-hosted) | ✅ env vars |
| Hooks | ✅ Preview (agent-scoped) | ✅ `.github/hooks/*.json` |

Sources in this table: [GitHub Docs — About Copilot CLI](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-copilot-cli); [VS Code — Custom agents](https://code.visualstudio.com/docs/copilot/customization/custom-chat-modes); [GitHub Docs — /fleet](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/fleet); [GitHub Docs — Autopilot](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/autopilot); [GitHub Docs — About hooks](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-hooks).

---

## 5. The Copilot Cloud Agent (Issues, PRs, `@copilot`)

The cloud agent — previously branded "Copilot coding agent" — is the asynchronous runtime that takes an issue or prompt, runs inside a GitHub Actions-powered ephemeral VM, and returns a pull request.

> "Deep research, planning, and iterating on code changes before creating a pull request are only available with Copilot cloud agent on GitHub.com. Cloud agent integrations (such as Azure Boards, JIRA, Linear, Slack, or Teams) only support creating a pull request directly."
> — Source: [About GitHub Copilot cloud agent — GitHub Docs](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent)

### 5.1 Entry points

- **Agents tab / panel** at `https://github.com/copilot/agents` — pick repo, pick agent, enter prompt; research + plan + iterate before PR ([GitHub Docs — About cloud agent](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent)).
- **Assign an Issue to "Copilot"** (or to Claude / Codex if enabled) — PR opens automatically ([GitHub Docs — About third-party agents](https://docs.github.com/en/copilot/concepts/agents/about-third-party-agents)).
- **`@copilot` / `@claude` / `@codex` in PR comments** — ask the agent to iterate on an existing PR ([GitHub Docs — About third-party agents](https://docs.github.com/en/copilot/concepts/agents/about-third-party-agents)).
- **Security campaigns** — assign security alerts directly to Copilot ([GitHub Docs — About cloud agent](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent)).
- **VS Code Agent Sessions view** (1.109+) — "Cloud" session type ([GitHub Blog — Pick your agent](https://github.blog/news-insights/company-news/pick-your-agent-use-claude-and-codex-on-agent-hq/)).
- **GitHub Mobile** Home view ([GitHub Docs — About third-party agents](https://docs.github.com/en/copilot/concepts/agents/about-third-party-agents)).

### 5.2 Execution sandbox

> "While working on a coding task, Copilot cloud agent has access to its own ephemeral development environment, powered by GitHub Actions, where it can explore your code, make changes, execute automated tests and linters and more."
> — Source: [About GitHub Copilot cloud agent — GitHub Docs](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent)

Costs: "Copilot cloud agent uses GitHub Actions minutes and Copilot premium requests." Each third-party session also "consumes one premium request" ([GitHub Docs — About third-party agents](https://docs.github.com/en/copilot/concepts/agents/about-third-party-agents)).

### 5.3 Limitations

Key constraints surfaced in the docs:

- Single-repo only per run; no cross-repo changes.
- One branch / one PR per task.
- Does **not** honor **content exclusions** — "Copilot will not ignore these files, and will be able to see and update them" ([GitHub Docs — About cloud agent](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent)).
- Branch-protection rules that forbid bot authors can block the agent unless Copilot is added as a bypass actor ([GitHub Docs — About cloud agent](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent)).

### 5.4 Custom agents for the cloud

Create a profile via the Agents tab (`Create an agent`) — this drops a templated `my-agent.agent.md` under `.github/agents/`. Frontmatter supports `name`, `description`, `tools`, `mcp-servers`, `model` (IDE only), and `target` (`vscode` or `github-copilot`). Prompt body is capped at 30,000 characters ([GitHub Docs — Create custom agents (cloud)](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/create-custom-agents)).

```yaml
---
name: test-specialist
description: Focuses on test coverage, quality, and testing best practices without modifying production code
---

You are a testing specialist focused on improving code quality through comprehensive testing. Your responsibilities:

- Analyze existing tests and identify coverage gaps
- Write unit tests, integration tests, and end-to-end tests following best practices
- Review test quality and suggest improvements for maintainability
- Ensure tests are isolated, deterministic, and well-documented
- Focus only on test files and avoid modifying production code unless specifically requested

Always include clear test descriptions and use appropriate testing patterns for the language and framework.
```
> — Source: [Creating custom agents for Copilot cloud agent — GitHub Docs](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/create-custom-agents) | Provenance: verbatim.

---

## 6. Orchestrating via GitHub Actions (gh-aw and CLI-in-Actions)

There are two sanctioned ways to drive Copilot agents from GitHub Actions today.

### 6.1 Running Copilot CLI in an Actions workflow

The CLI is an ordinary npm package, so any workflow can install and run it programmatically. The canonical pattern (summarize daily repo activity on a schedule):

```yaml
name: Daily summary
on:
  workflow_dispatch:
  schedule:
    - cron: '30 17 * * *'
permissions:
  contents: read
jobs:
  daily-summary:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v6
        with:
          fetch-depth: 0

      - name: Set up Node.js environment
        uses: actions/setup-node@v4

      - name: Install Copilot CLI
        run: npm install -g @github/copilot

      - name: Run Copilot CLI
        env:
          COPILOT_GITHUB_TOKEN: ${{ secrets.PERSONAL_ACCESS_TOKEN }}
        run: |
          copilot -p "Review the git log for this repository and write a bullet point summary of all code changes that were made today, with links to the relevant commit on GitHub. Above the bullet list give a description (max 100 words) summarizing the changes made. Write the details to summary.md" --allow-tool='shell(git:*)' --allow-tool=write --no-ask-user
          cat summary.md >> "$GITHUB_STEP_SUMMARY"
```
> — Source: [Automating tasks with Copilot CLI and GitHub Actions — GitHub Docs](https://docs.github.com/en/copilot/how-tos/copilot-cli/automate-copilot-cli/automate-with-actions) | Provenance: verbatim.

Critical auth detail: use a fine-grained PAT with the **"Copilot Requests"** permission stored in a secret, exposed as the `COPILOT_GITHUB_TOKEN` env var — not the built-in `GITHUB_TOKEN` — so that Copilot billing attributes to a licensed seat ([GitHub Docs — Automate with Actions](https://docs.github.com/en/copilot/how-tos/copilot-cli/automate-copilot-cli/automate-with-actions)). `--no-ask-user` prevents the CLI from stalling on approval prompts in CI.

### 6.2 `@copilot` mentions and issue-assignment triggers

The cloud agent is *itself* the bridge between an issue/PR event and an Actions run — users never author a workflow for it. Assigning an issue to Copilot or mentioning `@copilot` in a PR comment invokes the cloud agent pipeline ([GitHub Docs — About cloud agent](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent)). For repo admins, the Actions runner used by the cloud agent is configured under `Settings → Copilot → Coding agent` (["Configure agent runners"](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-organization/configure-runner-for-coding-agent)).

### 6.3 `github/gh-aw` — GitHub Agentic Workflows

`github/gh-aw` (originally announced under GitHub Next, now under the `github` org) is a **GitHub CLI extension + DSL** for writing agentic workflows as markdown with YAML frontmatter that compiles to normal GitHub Actions YAML.

> "GitHub Agentic Workflows hosts coding agents in GitHub Actions, to perform complex, multi-step tasks automatically. This enables Continuous AI - systematic, automated application of AI to software collaboration."
> — Source: [gh-aw — How They Work](https://github.github.com/gh-aw/introduction/how-they-work/)

Compilation flow:

> "`.github/workflows/example.md` → `.github/workflows/example.lock.yml` — Include dependencies are resolved and merged — Tool configurations are processed — GitHub Actions syntax is generated."
> — Source: [gh-aw reference — github-agentic-workflows.md](https://raw.githubusercontent.com/github/gh-aw/main/.github/aw/github-agentic-workflows.md)

Engines supported today: **Copilot (default), Claude, Codex, Gemini, and `opencode` (experimental)** ([gh-aw reference](https://raw.githubusercontent.com/github/gh-aw/main/.github/aw/github-agentic-workflows.md)).

Engine frontmatter example:

```yaml
engine:
  id: copilot                       # copilot | claude | codex | gemini | opencode
  version: beta
  model: gpt-5
  agent: technical-doc-writer       # references .github/agents/{agent}.agent.md (Copilot only)
  max-turns: 5
  max-continuations: 3               # >1 enables --autopilot
  concurrency: "gh-aw-${{ github.workflow }}"
  env:
    DEBUG_MODE: "true"
  args: ["--verbose"]
```
> — Source: [gh-aw reference — github-agentic-workflows.md](https://raw.githubusercontent.com/github/gh-aw/main/.github/aw/github-agentic-workflows.md) | Provenance: verbatim.

Core safety primitives:

- **Read-only by default** — "Workflows run with read-only permissions by default, with write operations only allowed through sanitized `safe-outputs`." — [github/gh-aw README](https://github.com/github/gh-aw).
- **Safe outputs** — pre-approved GitHub actions such as `create-issue`, `create-discussion`, `add-comment`, declared in frontmatter and enforced post-run ([gh-aw reference](https://raw.githubusercontent.com/github/gh-aw/main/.github/aw/github-agentic-workflows.md)).
- **Network controls** — `network: defaults` (curated allowlist), `network: {}` (none), or a custom allow/block list; the Copilot engine additionally supports the Agent Workflow Firewall (`network.firewall: true`) ([gh-aw reference](https://raw.githubusercontent.com/github/gh-aw/main/.github/aw/github-agentic-workflows.md)).
- **SHA-pinned dependencies**, `skip-roles`, `skip-bots`, **manual-approval** gates, and **`stop-after`** deadlines ([gh-aw reference](https://raw.githubusercontent.com/github/gh-aw/main/.github/aw/github-agentic-workflows.md)).

Minimal agentic workflow:

```markdown
---
on:
  issues:
    types: [opened]
permissions:
  issues: read
timeout-minutes: 10
safe-outputs:
  create-issue:        # allowed for bug/feature follow-ups
  create-discussion:   # allowed for audit/report posts
engine: copilot
---

# Triage Helper

Read the incoming issue ${{ github.event.issue.number }} and:
1. Identify whether it is a bug, feature request, or question.
2. Summarize the key signal in 3 bullets.
3. Post a discussion in the `Triage` category with your analysis.
```
> — Source: [gh-aw reference — github-agentic-workflows.md](https://raw.githubusercontent.com/github/gh-aw/main/.github/aw/github-agentic-workflows.md) | Provenance: adapted — combines the reference's stock frontmatter example with a realistic body for illustration.

Compile and publish:

```bash
gh aw compile             # all workflows
gh aw compile my-workflow # a specific one
gh aw compile --actionlint --zizmor --poutine --runner-guard  # strict scanners
gh aw logs my-workflow    # inspect run output
gh aw run my-workflow     # dispatch a run
```
> — Source: [gh-aw reference — github-agentic-workflows.md](https://raw.githubusercontent.com/github/gh-aw/main/.github/aw/github-agentic-workflows.md) | Provenance: verbatim.

`gh aw` also supports **slash-command triggers** (`on: slash_command:`) so a comment like `/summary` in an issue invokes the workflow, plus `reaction:` and `status-comment:` for user feedback during long runs ([gh-aw reference](https://raw.githubusercontent.com/github/gh-aw/main/.github/aw/github-agentic-workflows.md)).

---

## 7. Agent HQ and Mission Control

Announced October 28, 2025 at GitHub Universe (see [GitHub Blog — Agent HQ](https://github.blog/news-insights/company-news/welcome-home-agents/)), Agent HQ reframes GitHub as a multi-agent host.

> "At GitHub Universe, we're announcing Agent HQ, GitHub's vision for the next evolution of our platform. Agents shouldn't be bolted on. They should work the way you already work."
> — Source: [Agent HQ: Any agent, any way you work — GitHub Blog](https://github.blog/news-insights/company-news/welcome-home-agents/)

Key elements:

1. **Open agent ecosystem** under one paid Copilot subscription. Day-one partners: **Anthropic Claude** and **OpenAI Codex**; coming: Google, Cognition, xAI ([GitHub Blog — Agent HQ](https://github.blog/news-insights/company-news/welcome-home-agents/); [GitHub Blog — Pick your agent](https://github.blog/news-insights/company-news/pick-your-agent-use-claude-and-codex-on-agent-hq/)).
2. **Mission control** — a unified view across github.com, VS Code, Mobile, and (per the Universe post) CLI "coming soon":

   > "Mission control: Your command center, wherever you build… a consistent interface across GitHub, VS Code, mobile, and the CLI that lets you direct, monitor, and manage every AI-driven task."
   > — Source: [Agent HQ — GitHub Blog](https://github.blog/news-insights/company-news/welcome-home-agents/)

3. **Plan Mode in VS Code** — "works with Copilot, and asks you clarifying questions along the way, to help you to build a step-by-step approach for your task" ([GitHub Blog — Agent HQ](https://github.blog/news-insights/company-news/welcome-home-agents/)).
4. **AGENTS.md files** — the marketing surface name for `.agent.md` / custom-agent profiles:

   > "For even finer control, you can now create custom agents in VS Code with AGENTS.md files, source-controlled documents that let you set clear rules and guardrails such as 'prefer this logger' or 'use table-driven tests for all handlers.'"
   > — Source: [Agent HQ — GitHub Blog](https://github.blog/news-insights/company-news/welcome-home-agents/)

5. **Control plane** — enterprise governance layer: which agents are allowed, MCP access, policies, audit, Copilot metrics dashboard ([GitHub Blog — Agent HQ](https://github.blog/news-insights/company-news/welcome-home-agents/)).
6. **One-click merge-conflict resolution, branch controls for CI gating on agent-authored code, identity features per agent, new Slack/Linear integrations** ([GitHub Blog — Agent HQ](https://github.blog/news-insights/company-news/welcome-home-agents/)).

Operational guidance from the December 2025 follow-up post:

> "We recently shipped Agent HQ's mission control, a unified interface for managing GitHub Copilot coding agent tasks. Now, you can now assign tasks to Copilot across repos, pick a custom agent, watch real-time session logs, steer mid-run (pause, refine, or restart), and jump straight into the resulting pull requests—all in one place."
> — Source: [How to orchestrate agents using Mission Control — GitHub Blog](https://github.blog/ai-and-ml/github-copilot/how-to-orchestrate-agents-using-mission-control/)

> "Mission control lets you select custom agents that use agents.md files from your selected repo. These files give your agent a persona and pre-written context, removing the burden of constantly providing the same examples or instructions."
> — Source: [How to orchestrate agents using Mission Control — GitHub Blog](https://github.blog/ai-and-ml/github-copilot/how-to-orchestrate-agents-using-mission-control/)

---

## 8. Third-Party / Subagent Patterns (Codex, Claude)

Third-party agents on GitHub are **not** extensions — they are peer coding agents hosted inside Copilot's sandbox, billed through your Copilot subscription.

> "Copilot Pro+ and Copilot Enterprise users can now run multiple coding agents directly inside GitHub, GitHub Mobile, and Visual Studio Code (with Copilot CLI support coming soon). That means you can use agents like GitHub Copilot, Claude by Anthropic, and OpenAI Codex (both in public preview) today."
> — Source: [Pick your agent: Use Claude and Codex on Agent HQ — GitHub Blog](https://github.blog/news-insights/company-news/pick-your-agent-use-claude-and-codex-on-agent-hq/)

### 8.1 Where they plug in

- **Agents tab / Issue assignment / PR mentions** (`@Copilot`, `@Claude`, `@Codex`) — identical ergonomics to the native cloud agent ([GitHub Blog — Pick your agent](https://github.blog/news-insights/company-news/pick-your-agent-use-claude-and-codex-on-agent-hq/); [GitHub Docs — About third-party agents](https://docs.github.com/en/copilot/concepts/agents/about-third-party-agents)).
- **VS Code Agent Sessions view** — choose session type (Local / Cloud / Background) and agent ([GitHub Blog — Pick your agent](https://github.blog/news-insights/company-news/pick-your-agent-use-claude-and-codex-on-agent-hq/)).
- **OpenAI Codex VS Code extension** — "Sign in with Copilot" available to Copilot Pro+ subscribers; usage respects GitHub rate limits and billing ([GitHub Docs — OpenAI Codex](https://docs.github.com/en/copilot/concepts/agents/openai-codex)).

### 8.2 Models available

Per the docs as of this research date:

- **OpenAI Codex**: Auto, GPT-5.2-Codex, GPT-5.3-Codex, GPT-5.4, GPT-5.4 nano ([GitHub Docs — OpenAI Codex](https://docs.github.com/en/copilot/concepts/agents/openai-codex)).
- **Anthropic Claude**: Auto, Claude Opus 4.5/4.6/4.7, Claude Sonnet 4.5/4.6 ([GitHub Docs — Anthropic Claude](https://docs.github.com/en/copilot/concepts/agents/anthropic-claude)).

Both integrations are labeled "currently in public preview" ([GitHub Docs — OpenAI Codex](https://docs.github.com/en/copilot/concepts/agents/openai-codex); [GitHub Docs — Anthropic Claude](https://docs.github.com/en/copilot/concepts/agents/anthropic-claude)).

### 8.3 Claude Code interop

VS Code reads the Claude `.claude/agents/*.md` sub-agent format alongside the native `.agent.md` format, mapping Claude tool names to VS Code tools ([VS Code — Custom agents](https://code.visualstudio.com/docs/copilot/customization/custom-chat-modes)). That interop means a single persona definition can drive Claude Code, the Anthropic cloud agent under Agent HQ, and VS Code chat ([VS Code — Custom agents](https://code.visualstudio.com/docs/copilot/customization/custom-chat-modes); [GitHub Docs — Anthropic Claude](https://docs.github.com/en/copilot/concepts/agents/anthropic-claude); [GitHub Blog — Pick your agent](https://github.blog/news-insights/company-news/pick-your-agent-use-claude-and-codex-on-agent-hq/)).

### 8.4 Multi-agent review pattern

The Agent HQ launch calls out running multiple agents on the same task to triangulate decisions:

> "Architectural guardrails: Ask one or more agents to evaluate modularity and coupling… Logical pressure testing: Use another agent to hunt for edge cases, async pitfalls, or scale assumptions… Pragmatic implementation: Have a separate agent propose the smallest, backward-compatible change to keep the blast radius of a refactor low."
> — Source: [Pick your agent — GitHub Blog](https://github.blog/news-insights/company-news/pick-your-agent-use-claude-and-codex-on-agent-hq/)

---

## 9. Configuration & Best Practices

### 9.1 Scope discipline

Put least-privilege tool allowlists in every profile. The docs' own `implementation-planner` example scopes tools to just `read`, `search`, `edit` ([GitHub Docs — Create custom agents (cloud)](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/create-custom-agents)). In VS Code, restrict `agents:` to the specific personas a coordinator may delegate to ([VS Code — Custom agents](https://code.visualstudio.com/docs/copilot/customization/custom-chat-modes)).

### 9.2 Writing good AGENTS.md / `.agent.md`

GitHub's analysis of 2,500+ `agents.md` files identifies a clear success pattern:

> "The successful agents aren't just vague helpers; they are specialists… Put commands early… Code examples over explanations… Set clear boundaries… Be specific about your stack… Cover six core areas: commands, testing, project structure, code style, git workflow, and boundaries."
> — Source: [How to write a great agents.md — GitHub Blog](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/)

> "'You are a helpful coding assistant' doesn't work. 'You are a test engineer who writes tests for React components, follows these examples, and never modifies source code' does."
> — Source: [How to write a great agents.md — GitHub Blog](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/)

### 9.3 Hooks for guardrails

Use hooks for approvals, secret scanning, and audit trails:

> "preToolUse: Executed before the agent uses any tool (such as bash, edit, view). This is the most powerful hook as it can approve or deny tool executions. Use this hook to block dangerous commands, enforce security policies and coding standards, require approval for sensitive operations, or log tool usage for compliance."
> — Source: [About hooks — GitHub Docs](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-hooks)

Lifecycle hooks available: `sessionStart`, `sessionEnd`, `userPromptSubmitted`, `preToolUse`, `postToolUse`, `agentStop`, `subagentStop`, `errorOccurred`. Configured at `.github/hooks/*.json` with `version: 1` and per-type arrays ([GitHub Docs — About hooks](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-hooks)).

### 9.4 Partitioning parallel work

When you fan out via `/fleet` or Mission Control, avoid merge conflicts:

> "Agents working in parallel can create merge conflicts if they touch the same files. Be thoughtful about partitioning work."
> — Source: [How to orchestrate agents using Mission Control — GitHub Blog](https://github.blog/ai-and-ml/github-copilot/how-to-orchestrate-agents-using-mission-control/)

Good parallel candidates: "Research work (finding feature flags, configuration options), Analysis (log analysis, performance profiling), Documentation generation, Security reviews, Work in different modules or components" — [GitHub Blog — Mission Control](https://github.blog/ai-and-ml/github-copilot/how-to-orchestrate-agents-using-mission-control/).

### 9.5 CLI automatic-approval traps

In CLI CI usage, tools bypass manual approval once `--allow-all-tools`, `--allow-tool=shell`, or `/yolo` is used. The docs are explicit:

> "If Copilot asks you to allow it to run the command rm ./this-file.txt, and you choose option 2, then Copilot can run any rm command (for example, rm -rf ./*) during the current run of this session, without asking for your approval."
> — Source: [About GitHub Copilot CLI — GitHub Docs](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-copilot-cli)

Mitigations: run in a container, prefer fine-grained `--allow-tool='shell(git:*)'`, always pair `--allow-all-tools` with `--deny-tool='shell(rm)' --deny-tool='shell(git push)'` ([GitHub Docs — About Copilot CLI](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-copilot-cli)).

### 9.6 Compatibility caveats for the cloud agent

- Content-exclusion policies **are ignored** by the cloud agent ([GitHub Docs — About cloud agent](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent)).
- Organization policies controlling **MCP servers in Copilot** and **MCP registry URL** are not enforced in Copilot CLI yet ([GitHub Docs — About Copilot CLI](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-copilot-cli)).

---

## 10. Research Limitations

- **CLI page IDs churn quickly.** Several URLs documented in GitHub's own left-nav (for example `/en/copilot/how-tos/use-copilot-agents/copilot-cli/...`) 404ed, while the actually-live paths use different slugs (`/en/copilot/how-tos/copilot-cli/...`). Deep-linking in this report uses the live slugs discovered on 2026-04-21; they may move again.
- **Agent HQ is mid-rollout.** The original Universe announcement says Mission Control comes to CLI "soon"; the December follow-up shows Mission Control shipped across GitHub/VS Code/Mobile but does not explicitly confirm CLI presence. I could not find an authoritative statement that CLI Mission Control has GA'd as of 2026-04-21.
- **Model lists change almost monthly.** The Codex/Claude model inventories cited here are snapshots from 2026-04-21 GitHub Docs; treat them as illustrative, not canonical.
- **`gh-aw` lineage.** The gh-aw README's install/setup URLs point alternately at `githubnext/gh-aw` and `github/gh-aw`; the repo appears to have moved orgs. I cited `github/gh-aw` (where the raw README currently returns 200).
- **Out of scope.** I did not cover: the Copilot SDK (custom host apps), Copilot Spark, Copilot Spaces, Copilot Memory internals, agent skills authoring, or enterprise control-plane/audit-log schema — each is a substantial topic on its own and not part of the user's brief.
- **Single-source claims flagged.** The 2,500-repo AGENTS.md analysis is a single GitHub-authored blog post; its underlying data set is not public, so treat the pattern guidance as informed opinion rather than peer-reviewed evidence.
- **No community/forum sources were used.** Per the user's instruction, only github.blog, docs.github.com, code.visualstudio.com, and official GitHub repositories were consulted.

---

## 11. Complete Reference List

### Documentation & Articles — GitHub Docs

- [About GitHub Copilot cloud agent](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent) — Concept page for the cloud (a.k.a. coding) agent, including entry points, limitations, and customization hooks.
- [About GitHub Copilot CLI](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-copilot-cli) — Canonical CLI overview: modes, approval model, BYO-model provider env vars, ACP.
- [About custom agents (cloud)](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-custom-agents) — `.agent.md` profile format shared across IDE/CLI/cloud.
- [About custom agents (CLI)](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-custom-agents) — Built-in CLI subagents (`explore`, `task`, `general-purpose`, `code-review`, `research`) and subagent scope rules.
- [Creating custom agents for Copilot cloud agent](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/create-custom-agents) — Repo-level, org-level profile creation via the Agents tab; `model`/`target` fields.
- [Creating and using custom agents for GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/create-custom-agents-for-cli) — `/agent` flow, `--agent NAME --prompt`, `.agent.md` filename convention.
- [Invoking custom agents (CLI)](https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli-agents/invoke-custom-agents) — Slash command, inferred, explicit, and programmatic invocation; scope precedence rules.
- [Automating tasks with Copilot CLI and GitHub Actions](https://docs.github.com/en/copilot/how-tos/copilot-cli/automate-copilot-cli/automate-with-actions) — Full `@github/copilot` in Actions recipe with `COPILOT_GITHUB_TOKEN`.
- [Running tasks in parallel with the /fleet command](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/fleet) — `/fleet` orchestrator semantics, custom-agent `@` syntax, cost considerations.
- [Allowing GitHub Copilot CLI to work autonomously (Autopilot)](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/autopilot) — Autopilot triggers, stopping conditions, `--max-autopilot-continues`.
- [About GitHub Copilot CLI session data (Chronicle)](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/chronicle) — `~/.copilot/session-state/`, `/chronicle standup|tips|improve|reindex`.
- [Connecting GitHub Copilot CLI to VS Code](https://docs.github.com/en/copilot/how-tos/copilot-cli/connecting-vs-code) — Auto-connect semantics, `/ide`, diff review, session resume.
- [About hooks](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-hooks) — Eight hook types, `.github/hooks/*.json` schema.
- [MCP and the cloud agent](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/mcp-and-cloud-agent) — How MCP servers are wired into cloud agent execution.
- [About third-party agents](https://docs.github.com/en/copilot/concepts/agents/about-third-party-agents) — Entry points, supported agents, model matrices, billing.
- [OpenAI Codex](https://docs.github.com/en/copilot/concepts/agents/openai-codex) — Codex coding agent + VS Code extension, supported GPT-5.x models.
- [Anthropic Claude](https://docs.github.com/en/copilot/concepts/agents/anthropic-claude) — Claude coding agent, supported Opus/Sonnet models.
- [Configure agent runners (coding agent)](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-organization/configure-runner-for-coding-agent) — How repo/org admins configure the GitHub Actions runner used by the cloud agent (referenced from §6.2).

### Documentation & Articles — Visual Studio Code

- [Custom agents in VS Code](https://code.visualstudio.com/docs/copilot/customization/custom-chat-modes) — Authoritative reference for VS Code-specific `.agent.md` frontmatter (handoffs, `agents:`, `user-invocable`, scoped hooks, Claude format).

### Documentation & Articles — GitHub Blog

- [Agent HQ: Any agent, any way you work](https://github.blog/news-insights/company-news/welcome-home-agents/) — Universe 2025 launch of Agent HQ, Mission Control, VS Code Plan Mode, AGENTS.md, control plane.
- [Pick your agent: Use Claude and Codex on Agent HQ](https://github.blog/news-insights/company-news/pick-your-agent-use-claude-and-codex-on-agent-hq/) — Multi-agent entry points across GitHub/Mobile/VS Code; multi-agent review patterns.
- [How to orchestrate agents using Mission Control](https://github.blog/ai-and-ml/github-copilot/how-to-orchestrate-agents-using-mission-control/) — Practical guide to parallel task assignment, signals to intervene, sequential vs parallel trade-offs.
- [How to write a great agents.md: Lessons from over 2,500 repositories](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/) — Pattern guide for AGENTS.md; six-area coverage checklist.

### GitHub Repositories

- [github/gh-aw — GitHub Agentic Workflows](https://github.com/github/gh-aw) — CLI extension + DSL for authoring markdown-native agentic workflows that compile to GitHub Actions `.lock.yml`.

### GitHub Repository files

- [gh-aw create.md (raw)](https://raw.githubusercontent.com/github/gh-aw/main/create.md) — Install script, `gh aw compile`, workflow file layout.
- [gh-aw reference — github-agentic-workflows.md (raw)](https://raw.githubusercontent.com/github/gh-aw/main/.github/aw/github-agentic-workflows.md) — Full frontmatter schema including `engine:`, `safe-outputs:`, `network:`, triggers, skip rules.
- [gh-aw — How They Work](https://github.github.com/gh-aw/introduction/how-they-work/) — Conceptual overview: Continuous AI, traditional vs agentic, security architecture diagram.

### Code Samples (from official docs)

- `readme-creator.agent.md` — [About custom agents — GitHub Docs](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-custom-agents) — Minimal documentation-only profile.
- `test-specialist.agent.md` — [Create custom agents (cloud)](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/create-custom-agents) — Full-tool testing agent.
- `implementation-planner.agent.md` — [Create custom agents (cloud)](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/create-custom-agents) — Tool-restricted planner (`tools: ["read", "search", "edit"]`).
- `Feature Builder` / `Researcher` / `Implementer` — [VS Code — Custom agents](https://code.visualstudio.com/docs/copilot/customization/custom-chat-modes) — Three-profile orchestration sample.
- Daily-summary Actions workflow — [Automate with Actions](https://docs.github.com/en/copilot/how-tos/copilot-cli/automate-copilot-cli/automate-with-actions) — Copilot CLI in `ubuntu-latest` with `COPILOT_GITHUB_TOKEN`.
