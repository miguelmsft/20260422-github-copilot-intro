# Research Report: GitHub Copilot Surfaces Overview — Where Copilot Runs Today (April 2026)

**Date:** 2026-04-21
**Researcher:** Copilot Web Researcher Agent
**Topic slug:** copilot-surfaces
**Sources consulted:** 21 web pages, 3 GitHub repositories (`github/CopilotForXcode`, `github/copilot-cli`, `github/copilot.vim`; the `CopilotForXcode/README.md` permalink is listed separately in §8 but belongs to the `github/CopilotForXcode` repository)
**Revision:** Round 3 (see note at end of §8)

---

## Executive Summary

GitHub Copilot is no longer a single "autocomplete in your IDE" product. As of April 2026 it is a **family of surfaces** — editor extensions, a terminal CLI, a cloud agent that works autonomously in pull requests, chat on github.com, a GitHub Mobile chat experience, a Windows Terminal Canary integration, and vendor-shipped integrations in Visual Studio, JetBrains IDEs, Eclipse, and Xcode — all enumerated on the canonical "What is GitHub Copilot?" page ([docs.github.com](https://docs.github.com/en/copilot/get-started/what-is-github-copilot)). All of them authenticate with the same Copilot subscription and share a common pool of models (OpenAI GPT-5.x family, Anthropic Claude 4.5–4.7, Google Gemini 2.5/3.x, xAI Grok Code Fast 1, and fine-tuned variants) per the "Supported AI models" matrix ([docs.github.com](https://docs.github.com/en/copilot/reference/ai-models/supported-models)), but each surface exposes a different subset of modes (inline completions, Ask / Edit / Agent chat modes, cloud/background agents).

The flagship surface is **Visual Studio Code**, which now frames Copilot as bringing "AI agents to Visual Studio Code" ([code.visualstudio.com](https://code.visualstudio.com/docs/copilot/overview)): a Plan agent, local implementation agents, background agents, cloud agents, and third-party agents (Anthropic, OpenAI) are all orchestrated from a single Chat panel with a Sessions view. **Visual Studio 2022/2026** ([Microsoft Learn](https://learn.microsoft.com/en-us/visualstudio/ide/copilot-agent-mode)), **JetBrains IDEs** ([Marketplace](https://plugins.jetbrains.com/plugin/17718-github-copilot)), and **Xcode** ([github/CopilotForXcode](https://github.com/github/CopilotForXcode)) offer completions + chat + an agent mode with varying maturity. **Eclipse** is also a first-class client in the "Supported AI models per client" matrix ([docs.github.com](https://docs.github.com/en/copilot/reference/ai-models/supported-models)), but Edit/Agent parity beyond completions + chat is not explicitly documented on the same page and should be verified against the live [Copilot feature matrix](https://docs.github.com/en/copilot/reference/copilot-feature-matrix) (see §3.4). The **GitHub Copilot CLI** — the new standalone `copilot` binary distributed as the npm package `@github/copilot` ([github/copilot-cli](https://github.com/github/copilot-cli); concept page [docs.github.com](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli)) — brings the same agent loop to any terminal and is designed to be scripted and delegated to. The **Copilot cloud agent** (formerly "Copilot coding agent") runs on GitHub-hosted runners, opens pull requests, and can be kicked off from the web UI, from GitHub Mobile, from an IDE, or via the CLI ([docs.github.com](https://docs.github.com/en/copilot/get-started/what-is-github-copilot)).

For a beginner audience, the mental model to teach is: **(1) where you type** (editor, terminal, browser, phone) × **(2) which mode you pick** (completion, ask, edit, agent, cloud agent). This report catalogs every surface with its features, supported modes/models, and guidance on when to reach for it, and closes with a single-slide feature matrix.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Key Concepts](#2-key-concepts)
3. [Surface-by-Surface Catalog](#3-surface-by-surface-catalog)
   - 3.1 Visual Studio Code (flagship)
   - 3.2 Visual Studio 2022 / 2026
   - 3.3 JetBrains IDEs
   - 3.4 Eclipse
   - 3.5 Xcode (Copilot for Xcode)
   - 3.6 Neovim / Vim
   - 3.7 GitHub Copilot CLI
   - 3.8 github.com (Copilot Chat on the web, code review, PR/issue assist)
   - 3.9 Copilot cloud agent (autonomous background agent)
   - 3.10 GitHub Mobile
   - 3.11 Windows Terminal Canary — Terminal Chat
   - 3.12 GitHub Desktop
   - 3.13 Copilot Spark, Spaces, and other adjacent surfaces
4. [Model Availability per Surface](#4-model-availability-per-surface)
5. [Comparison / Feature Matrix (single-slide)](#5-comparison--feature-matrix-single-slide)
6. [Choosing the Right Surface](#6-choosing-the-right-surface)
7. [Research Limitations](#7-research-limitations)
8. [Complete Reference List](#8-complete-reference-list)

---

## 1. Overview

### What it is

GitHub's official "What is GitHub Copilot?" page enumerates the surfaces a user can interact with Copilot through:

> "Use Copilot in the following places:
> - Your IDE
> - GitHub Mobile, as a chat interface
> - Windows Terminal Canary, through the Terminal Chat interface
> - The command line, through the GitHub CLI
> - The GitHub website"
> — Source: [What is GitHub Copilot? — GitHub Docs](https://docs.github.com/en/copilot/get-started/what-is-github-copilot)

The same page lists the capability set that surfaces draw from:

> "You can use Copilot to: Get code suggestions as you type in your IDE. Chat with Copilot to get help with your code. Ask for help using the command line. Organize and share context with Copilot Spaces to get more relevant answers. Generate descriptions of changes in a pull request. Research, plan, make code changes, and create pull requests for you to review."
> — Source: [What is GitHub Copilot? — GitHub Docs](https://docs.github.com/en/copilot/get-started/what-is-github-copilot)

### Why it matters

Each surface is optimized for a different point in the developer loop:

- **Editor surfaces** (VS Code, Visual Studio, JetBrains, Eclipse, Xcode, Neovim) are where code is written — optimized for *in-flow* assistance.
- **CLI** is where devs glue tools together and write scripts — optimized for *agentic, scriptable, terminal-native* work.
- **github.com / Mobile / Cloud Agent** are where work is *reviewed, planned, and delegated* — optimized for asynchronous collaboration.
- **Terminal Chat / GitHub Desktop** cover shell and Git-UI workflows.

### Key capability primitives (shared across surfaces)

- **Inline code completions** — ghost text in the editor.
- **Next edit suggestions (NES)** — predictive edits across the file based on recent changes.
- **Ask mode** — Q&A chat, no file edits.
- **Edit mode** — Copilot proposes multi-file edits you approve.
- **Agent mode** — autonomous loop: Copilot plans, edits, runs commands/tests, self-corrects.
- **Cloud (background) agent** — runs off your machine, on GitHub-hosted runners, and opens a PR.
- **Plan agent / Planning mode** — produces an implementation plan before any code is written.
- **MCP (Model Context Protocol)** — pluggable external tools.
- **Custom agents / agent skills / hooks / custom instructions** — customization layer.
- **Code review, PR summaries, commit-message generation** — targeted GitHub-surface features.

---

## 2. Key Concepts

### Modes: Ask vs. Edit vs. Agent

The GitHub "Supported AI models" matrix explicitly lists three chat modes — **Agent mode**, **Ask mode**, and **Edit mode** — as the axes along which model support varies:

> "This table lists the AI models available in Copilot, along with their release status and availability in different modes. … Agent mode | Ask mode | Edit mode"
> — Source: [Supported AI models in GitHub Copilot — GitHub Docs](https://docs.github.com/en/copilot/reference/ai-models/supported-models)

- **Ask** — the LLM answers questions about your code/workspace; no files are modified.
- **Edit** — Copilot proposes a set of file edits you accept or reject as a diff.
- **Agent** — Copilot runs a multi-step loop: it plans, edits files, runs commands/tests, observes output, and self-corrects.

### Local agents vs. cloud agents

VS Code's overview frames three execution locations for Copilot agents: locally in the editor for interactive work, in the background for autonomous tasks on your machine, and in the cloud (on GitHub-hosted runners) for team collaboration through pull requests; it also notes that tasks can be handed off between these agent types with context carried over. (Paraphrased; the VS Code overview page is JS-rendered, so exact wording could not be reproduced from a static fetch — see [code.visualstudio.com/docs/copilot/overview](https://code.visualstudio.com/docs/copilot/overview) live.)

A **local agent** runs inside the IDE against your working tree. A **background agent** runs asynchronously but still on your machine / session. A **cloud agent** (the former "Copilot coding agent") runs on GitHub-hosted infrastructure, checks out a branch, and opens a pull request ([About Copilot cloud agent — docs.github.com](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent)).

### Sessions

Agents, local or remote, are organized into **sessions** — persistent, named conversations you can track, pause, resume, or hand off to another agent, with a single Sessions view in the Chat panel for monitoring local, background, and cloud sessions together. (Paraphrased from [code.visualstudio.com/docs/copilot/overview](https://code.visualstudio.com/docs/copilot/overview); the exact verbatim wording could not be reproduced from a static fetch and is therefore not quoted.)

### Surface ≠ mode ≠ model

These three axes are independent:

```
                 ┌─────────────────────────┐
  SURFACE ───────▶│  (e.g. VS Code,         │
  (where you type)│   CLI, github.com)      │
                 └─────────────┬───────────┘
                               │
                 ┌─────────────▼───────────┐
  MODE  ─────────▶│  completion / ask /     │
  (interaction)   │   edit / agent / cloud  │
                 └─────────────┬───────────┘
                               │
                 ┌─────────────▼───────────┐
  MODEL ─────────▶│  GPT-5.x / Claude 4.x / │
  (LLM)           │   Gemini / Grok / ...   │
                 └─────────────────────────┘
```

Not every surface supports every mode, and not every surface exposes every model — that's what the matrix in §5 captures.

---

## 3. Surface-by-Surface Catalog

### 3.1 Visual Studio Code — the flagship surface

VS Code is the most fully-featured Copilot client and the surface that tends to get features first. The VS Code docs describe it as "AI agents in Visual Studio Code":

> "GitHub Copilot brings AI agents to Visual Studio Code. Describe what you want to build, and an agent plans the approach, writes the code, and verifies the result across your entire project. Choose from Copilot's built-in agents, third-party agents from providers like Anthropic and OpenAI, or your own custom agents, and run them locally, in the background, or in the cloud. For more targeted changes, inline suggestions and chat give you precise control directly in the editor."
> — Source: [GitHub Copilot in VS Code — code.visualstudio.com](https://code.visualstudio.com/docs/copilot/overview)

**Features available in VS Code today:**

- **Inline code completions** (ghost text) with colorized syntax highlighting.
- **Next edit suggestions (NES)** — predicts the location *and* content of your next edit.
- **Inline chat** — `Ctrl+I` / `⌘I` chat prompt in the editor.
- **Chat view / panel** — Ask / Edit / Agent modes, accessed via `Ctrl+Alt+I` / `⌃⌘I`.
- **Plan agent** — built-in agent that produces an implementation plan before writing code and can hand off to an implementation agent.
- **Local, background, and cloud agents** — all managed from the same Chat panel.
- **Sessions view** — run multiple agents in parallel, monitor status, switch between them.
- **Third-party agents** — Anthropic Claude, OpenAI Codex, and custom agents.
- **Custom agents / Agent skills / MCP servers / Hooks / Prompt files / Custom instructions.**
- **Smart actions** — AI-powered commit messages, rename suggestions, fix errors, semantic search.
- **Browser agent** (experimental) — can open your web app in the integrated browser, verify behavior, and take screenshots.
- **Copilot CLI integration** — agents from the CLI can be invoked from VS Code.

**When to reach for VS Code:** any interactive, multi-file development work where you want the richest UI — agent mode, inline NES, multi-session parallelism, MCP extensibility. It is the de facto reference surface; when documentation says "in your IDE," it usually means VS Code.

### 3.2 Visual Studio 2022 / 2026 (Windows)

Shipped by Microsoft into Visual Studio. Prerequisite per Microsoft Learn:

> "Visual Studio 2026 or Visual Studio 2022 version 17.14 (with the latest servicing release recommended for the most up-to-date features). Sign in to Visual Studio by using a GitHub account with Copilot access."
> — Source: [Get started with GitHub Copilot completions — Microsoft Learn](https://learn.microsoft.com/en-us/visualstudio/ide/visual-studio-github-copilot-extension)

**Features:**

- **Completions** — ghost-text inline suggestions, partial accept word-by-word (`Ctrl+Right`) or line-by-line (`Ctrl+Down`).
- **Next edit suggestions (NES)**.
- **Chat panel** — Ask, Edit, Agent modes.
- **Agent mode with built-in agents** — `@debug`, `@profiler`, `@test`, `@vs` integrate with VS features.

> "Visual Studio also includes built-in agents like `@debug`, `@profiler`, `@test`, and `@vs` that integrate with specific IDE features. You can also create custom agents for your team workflows."
> — Source: [Use agent mode in Visual Studio — Microsoft Learn](https://learn.microsoft.com/en-us/visualstudio/ide/copilot-agent-mode)

- **`find_symbol` tool** for language-aware navigation (C++, C#, Razor, TypeScript, + LSP-backed languages).
- **MCP servers** and **custom agents**.
- **Tool approvals** — per-tool consent dialog with per-session or per-solution approval.

**When to reach for Visual Studio:** .NET / C++ / Windows-targeted work where you want Copilot deeply integrated with MSBuild, the debugger, profiler, and test runners.

### 3.3 JetBrains IDEs (IntelliJ IDEA, PyCharm, Rider, GoLand, WebStorm, PhpStorm, RubyMine, CLion, Android Studio…)

Distributed via the **"GitHub Copilot"** plugin on the JetBrains Marketplace (plugin ID 17718). The GitHub "Supported AI models per client" matrix explicitly lists "JetBrains IDEs" as a first-class client.

**Features (per model-matrix rows and the plugin page):**

- Inline completions / NES.
- Chat panel with Ask / Edit / Agent modes (model choices match the matrix — see §4).
- MCP tool support and custom agents.
- Access to the same Copilot cloud agent delegation that other IDEs get.

**When to reach for JetBrains:** you already live in a JetBrains IDE and want Copilot without switching editors. JetBrains is listed as a first-class client in the "Supported AI models per client" matrix, so core completion, chat, and agent mode are present ([Supported AI models — docs.github.com](https://docs.github.com/en/copilot/reference/ai-models/supported-models); [JetBrains Marketplace listing](https://plugins.jetbrains.com/plugin/17718-github-copilot)). Cautious synthesis: newer flagship features typically surface first in VS Code and then appear in other IDE plugins on a delay; confirm specific feature parity against the live [Copilot feature matrix](https://docs.github.com/en/copilot/reference/copilot-feature-matrix) before putting exact claims on a slide.

### 3.4 Eclipse

Eclipse appears in the official "Supported AI models per client" matrix as a first-class Copilot client alongside VS Code, Visual Studio, Xcode, and JetBrains ([Supported AI models — docs.github.com](https://docs.github.com/en/copilot/reference/ai-models/supported-models)). Cautious synthesis: Eclipse is a relatively newer Copilot client, and its model availability appears narrower than VS Code in the same matrix (see §4); feature-parity claims for Edit/Agent modes beyond completions and chat are not explicitly documented on the model-matrix page and should be verified against the live [Copilot feature matrix](https://docs.github.com/en/copilot/reference/copilot-feature-matrix).

> "The following table shows which models are available in each client: GitHub.com | Copilot CLI | Visual Studio Code | Visual Studio | Eclipse | Xcode | JetBrains IDEs"
> — Source: [Supported AI models in GitHub Copilot — GitHub Docs](https://docs.github.com/en/copilot/reference/ai-models/supported-models)

### 3.5 Xcode — GitHub Copilot for Xcode

An open-source macOS host app and Xcode Source Editor extension maintained by GitHub at `github/CopilotForXcode`. Per the project README:

> "GitHub Copilot for Xcode is the leading AI coding assistant for Swift, Objective-C and iOS/macOS development. It delivers intelligent Completions, Chat, and Code Review—plus advanced features like Agent Mode, Next Edit Suggestions, MCP Registry, and Copilot Vision to make Xcode development faster and smarter."
> — Source: [CopilotForXcode README — github.com/github/CopilotForXcode](https://github.com/github/CopilotForXcode/blob/main/README.md)

**Features:**

- **Completions** (tab to accept first line, option+tab for full suggestion).
- **Chat** — opened via Xcode → Editor → GitHub Copilot → Open Chat, or the host-app menu.
- **Agent Mode** — edits files, runs terminal commands, searches the codebase, creates files/dirs, runs MCP tools.
- **Next Edit Suggestions**.
- **MCP Registry** and **Copilot Vision**.
- **Code Review**.

**Requirements:** macOS 12+, Xcode 8+, a GitHub account with Copilot access. Install via `brew install --cask github-copilot-for-xcode` or the DMG from the releases page.

**When to reach for Xcode:** Apple-platform development (iOS, macOS, visionOS, watchOS).

### 3.6 Neovim / Vim

Copilot ships a dedicated Neovim/Vim plugin ([github/copilot.vim](https://github.com/github/copilot.vim)). It focuses on inline ghost-text completions; chat-in-Neovim experiences exist via community/companion plugins but are not listed as a first-party surface in the "What is GitHub Copilot?" surface list ([docs.github.com](https://docs.github.com/en/copilot/get-started/what-is-github-copilot)). Cautious synthesis: Neovim/Vim is not named as a client in the "Supported AI models per client" matrix ([docs.github.com](https://docs.github.com/en/copilot/reference/ai-models/supported-models)), which suggests the model set and mode set are narrower than the first-class clients; treat Neovim as a **completions-first** surface and, for agent-mode work, pair the editor with the Copilot CLI ([github/copilot-cli](https://github.com/github/copilot-cli)) in a terminal split.

### 3.7 GitHub Copilot CLI — `copilot` in your terminal

There are **two distinct CLI surfaces** that both involve Copilot, and it is important not to conflate them:

1. **The standalone Copilot CLI (the current, agent-capable one).** This is a dedicated `copilot` binary distributed as the npm package `@github/copilot`, with the source repository at [github/copilot-cli](https://github.com/github/copilot-cli) (tagline: "GitHub Copilot CLI brings the power of Copilot coding agent directly to your terminal"). It is installed with `npm install -g @github/copilot` and invoked as `copilot` ([github/copilot-cli README](https://github.com/github/copilot-cli)). The concept page on GitHub Docs is [About GitHub Copilot CLI](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli), which states: "Find out about using Copilot from the command line. … GitHub Copilot CLI is available with all Copilot plans."

2. **The older `gh copilot` extension for the GitHub CLI.** This is the pre-existing surface where `copilot` is a sub-command of the `gh` binary (invoked as `gh copilot suggest` / `gh copilot explain`). GitHub's how-to page for "Use Copilot in the CLI" currently still renders with the H1 **"Using the GitHub CLI Copilot extension"** ([docs.github.com](https://docs.github.com/en/copilot/how-tos/use-copilot-for-common-tasks/use-copilot-in-the-cli)), which reflects this older packaging.

**In April 2026, the standalone `copilot` CLI (the npm `@github/copilot` package backed by [github/copilot-cli](https://github.com/github/copilot-cli)) is the agent-mode-capable CLI surface** referred to in the model matrix's "Copilot CLI" column ([docs.github.com](https://docs.github.com/en/copilot/reference/ai-models/supported-models)) and on the "What is GitHub Copilot?" surface list ([docs.github.com](https://docs.github.com/en/copilot/get-started/what-is-github-copilot)). The `gh copilot` extension remains available but is the older suggest/explain helper, not the agent loop.

**Installation (standalone CLI):**

```bash
# Install the standalone Copilot CLI from npm (macOS, Linux, Windows)
npm install -g @github/copilot

# Invoke it
copilot
```
> — Source: [github/copilot-cli README](https://github.com/github/copilot-cli) | Provenance: verbatim.

**Features of the standalone `copilot` CLI** (from [About GitHub Copilot CLI — docs.github.com](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli) and the [github/copilot-cli README](https://github.com/github/copilot-cli), cross-referenced with the older how-to hub [docs.github.com](https://docs.github.com/en/copilot/how-tos/use-copilot-for-common-tasks/use-copilot-in-the-cli) for the docs navigation surface):

- Agentic terminal session: plans, edits files in the cwd, runs commands with your approval, self-corrects.
- **Parallel task execution** — multiple concurrent sessions.
- **Cancel and roll back** edits.
- **Remote steering** — steer a session running elsewhere.
- **Programmatic use / SDK** — drive Copilot from scripts, CI (GitHub Actions), or your own backend.
- **Plugins** and a **plugin marketplace**.
- **Custom agents, MCP, hooks, agent skills, custom instructions** — same customization surface as the IDE agents.
- **Delegate to cloud agent** — kick off a cloud-agent task from the CLI.
- **Bring your own model provider / BYOK**.
- **LSP server integration** for language-aware edits.
- **Experimental features** toggled with `copilot --experimental` or the `/experimental` slash command ([github/copilot-cli README](https://github.com/github/copilot-cli)).

**When to reach for the CLI:** shell-native tasks (scaffolding, migrations, CI/automation), remote SSH sessions, headless environments, pipelines, and when you want an LLM that can run and observe real commands on the box.

### 3.8 github.com — Copilot Chat on the web, plus PR / issue / review assists

From any page on `github.com`, users can open the **"Search or ask Copilot"** entry point and chat with Copilot in the context of the current repo, file, issue, PR, discussion, or org. The dedicated how-to is "Asking GitHub Copilot questions in GitHub."
— Source: [Asking GitHub Copilot questions in GitHub — GitHub Docs](https://docs.github.com/en/copilot/how-tos/use-chat/use-chat-in-github)

**Web-surface features (from docs navigation and "Responsible use" page list):**

- **Chat in GitHub** — ask questions about a repo, file, PR, issue, or topic.
- **Copilot code review** — automated or requested review on PRs.
- **Pull request summaries** — generated PR descriptions.
- **Commit message generation** (web commits).
- **Use Copilot to create or update issues.**
- **Use the GitHub MCP Server from Copilot Chat.**
- **Copilot Spaces** — curated context collections shared with teammates.
- **Copilot Memory**.
- **Kick off a cloud-agent task** — from a repo, issue, or PR page.
- **Manage and track agents** — session dashboard.

**When to reach for github.com:** planning and reviewing work; delegating a task to the cloud agent from an issue or PR; getting answers about a repo you don't have cloned; commenting on PRs and issues.

### 3.9 Copilot cloud agent (formerly "Copilot coding agent")

The autonomous, server-side agent. In April 2026 docs it is referred to as **Copilot cloud agent** (the docs navigation, the "About cloud agent" concept page, and admin pages all use this phrasing; "Copilot coding agent" is the older name).

**What it does:** given a task (an issue, a `@copilot` mention in a PR, a prompt from the web UI, Mobile, an IDE, or the CLI), it:

1. Spins up on a GitHub-hosted runner (or a customer-configured runner).
2. Checks out the repo into its own branch.
3. Plans, edits files, runs tests, iterates.
4. Opens a pull request for humans to review.
5. Can react to PR comments and push additional commits.

**Capabilities visible in the docs navigation** (under "Use Copilot agents"):

- Cloud agent — Create a PR; Track Copilot sessions; Changing the AI model; Configuring agent settings.
- **Integrations**: Jira, Slack, Teams, Linear, Azure Boards.
- **Custom agents in your IDE** that can be delegated to the cloud.
- **Customize cloud agent**: create custom agents, add agent skills, extend with MCP, use hooks, customize the agent environment and firewall, test custom agents.
- **Administration**: Add Copilot cloud agent, Configure agent runners, Prepare for custom agents, Monitor agentic activity, Enable / Block cloud agent, Agent session filters, Agentic audit log events.
- **Agentic code review** — the cloud agent can be invoked as a reviewer.
- **Plan-Pilot-Deliver tutorials**: Pilot cloud agent, Improve a project, Build guardrails, Give access to resources.

**Availability:** cloud agent requires Copilot **Pro+, Business, or Enterprise**. See "What is GitHub Copilot?":

> "Research, plan, make code changes, and create pull requests for you to review. Available in Copilot Pro+, Copilot Business, and Copilot Enterprise only."
> — Source: [What is GitHub Copilot? — GitHub Docs](https://docs.github.com/en/copilot/get-started/what-is-github-copilot)

**When to reach for the cloud agent:** self-contained tasks that don't need you to be present — refactors, dependency upgrades, writing missing tests, small well-scoped features, bug fixes with a clear repro — especially when driven from an issue tracker.

### 3.10 GitHub Mobile

A chat-only surface. The "What is GitHub Copilot?" page describes Copilot on Mobile as "GitHub Mobile, as a chat interface" and the docs include a dedicated "Chat in Mobile" page in the navigation ([docs.github.com](https://docs.github.com/en/copilot/get-started/what-is-github-copilot)).

**Features (cautious synthesis from the surface list and docs navigation):**

- Copilot Chat on iOS and Android, scoped to the current repo/issue/PR ([docs.github.com](https://docs.github.com/en/copilot/get-started/what-is-github-copilot)).
- Ability to trigger / check on the cloud agent from the phone (cloud-agent sessions are visible in the same agent-tracking surface described in [About Copilot cloud agent — docs.github.com](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent)).
- No inline completions, no local agent (there is no editor).

**When to reach for Mobile:** triage and quick Q&A on the go; kicking off or checking the status of a cloud-agent task.

### 3.11 Windows Terminal Canary — Terminal Chat

The GitHub docs navigation and the "What is GitHub Copilot?" page both call this out as a distinct surface:

> "Windows Terminal Canary, through the Terminal Chat interface"
> — Source: [What is GitHub Copilot? — GitHub Docs](https://docs.github.com/en/copilot/get-started/what-is-github-copilot)

The "Chat in Windows Terminal" how-to page is listed in the docs sidebar under the Set up → Chat with Copilot section. This is a chat UX embedded in the Windows Terminal preview ("Canary") channel, oriented at shell tasks (command recall, explanation, generation). It is distinct from the Copilot CLI: Terminal Chat is a UI inside the terminal application itself; the Copilot CLI is a standalone binary you invoke from any shell.

**When to reach for Terminal Chat:** Windows shell users who want Copilot help composing / explaining commands without installing the `copilot` CLI.

### 3.12 GitHub Desktop

Listed in the "Responsible use" docs navigation as **"Copilot in GitHub Desktop"**, indicating an integration in GitHub's desktop Git client ([docs.github.com](https://docs.github.com/en/copilot/get-started/what-is-github-copilot)). Cautious synthesis: dedicated concept documentation for this surface was not fetched in this research pass, so specific features should be verified live before being put on a slide; the integration is Git-client-oriented rather than a code-authoring surface (it does not appear in the "Supported AI models per client" matrix at [docs.github.com](https://docs.github.com/en/copilot/reference/ai-models/supported-models)).

### 3.13 Adjacent surfaces: Spark, Spaces, Memory

These are not separate "IDEs" but they are user-facing Copilot surfaces worth naming so beginners recognize the terms:

- **GitHub Spark** — Copilot-powered app builder (the "Your first spark," "Build and deploy apps," and "Spark" sections of the docs).
- **Copilot Spaces** — a curated context collection (files, docs, links) that you attach to a chat so Copilot has the right context. Available on github.com and in IDEs.
- **Copilot Memory** — persistent memory about you / your project that Copilot can reference.

---

## 4. Model Availability per Surface

The authoritative matrix is on docs.github.com. As of April 2026 the clients explicitly listed are **GitHub.com, Copilot CLI, Visual Studio Code, Visual Studio, Eclipse, Xcode, JetBrains IDEs**.

> "The following table shows which models are available in each client. … When you use Copilot Chat in supported IDEs, Auto will automatically select the best model for you based on availability. You can manually choose a different model to override this selection."
> — Source: [Supported AI models in GitHub Copilot — GitHub Docs](https://docs.github.com/en/copilot/reference/ai-models/supported-models)

Model families currently available (GA or public preview), all per the [Supported AI models matrix on docs.github.com](https://docs.github.com/en/copilot/reference/ai-models/supported-models):

- **OpenAI:** GPT-4.1, GPT-5 mini, GPT-5.2, GPT-5.2-Codex, GPT-5.3-Codex, GPT-5.4, GPT-5.4 mini, GPT-5.4 nano. ([Source](https://docs.github.com/en/copilot/reference/ai-models/supported-models))
- **Anthropic:** Claude Haiku 4.5, Claude Sonnet 4 / 4.5 / 4.6, Claude Opus 4.5 / 4.6 / 4.7; Claude Opus 4.6 "fast mode" (preview). ([Source](https://docs.github.com/en/copilot/reference/ai-models/supported-models))
- **Google:** Gemini 2.5 Pro (GA), Gemini 3 Flash (preview), Gemini 3.1 Pro (preview). ([Source](https://docs.github.com/en/copilot/reference/ai-models/supported-models))
- **xAI:** Grok Code Fast 1. ([Source](https://docs.github.com/en/copilot/reference/ai-models/supported-models))
- **Fine-tuned:** Raptor mini (fine-tuned GPT-5 mini, preview); Goldeneye (fine-tuned GPT-5.1-Codex, preview). ([Source](https://docs.github.com/en/copilot/reference/ai-models/supported-models))

**Notable retirements on or before 2026-04-15** (all per [Supported AI models — docs.github.com](https://docs.github.com/en/copilot/reference/ai-models/supported-models)): GPT-5.1 (2026-04-15), GPT-5.1-Codex / Codex-Max / Codex-Mini (2026-04-01), Gemini 3 Pro (2026-03-26), GPT-5 / GPT-5-Codex / Claude Opus 4.1 (2026-02-17).

> "Claude Opus 4.7 is available at a promotional multiplier of 7.5x until April 30, 2026."
> — Source: [Supported AI models in GitHub Copilot — GitHub Docs](https://docs.github.com/en/copilot/reference/ai-models/supported-models)

Key takeaway for a beginner audience: **exact per-surface checkboxes shift week-to-week**, so point people at this docs page rather than memorizing it. Cautious synthesis of the matrix's shape (rather than exact per-model checkboxes, which were not rendered in static fetches — see §7): VS Code and github.com are listed first in the client header of the [Supported AI models matrix](https://docs.github.com/en/copilot/reference/ai-models/supported-models) and appear to carry a broader model menu than Eclipse/Xcode in the same table; Visual Studio and JetBrains track more closely to VS Code; and the Copilot CLI column leans toward an agent-oriented subset. Verify against the live matrix for any specific per-surface claim.

---

## 5. Comparison / Feature Matrix (single-slide)

Legend: ✅ supported · ➖ not applicable / not this surface's focus · 🧪 experimental / preview · ❌ not available

| Surface | Completions | NES | Ask chat | Edit mode | Local agent | Cloud agent (invoke) | MCP / custom agents | Hosted by |
|---|---|---|---|---|---|---|---|---|
| **VS Code** | ✅ | ✅ | ✅ | ✅ | ✅ (incl. Plan agent, Sessions view, browser agent 🧪) | ✅ (kick off & monitor) | ✅ | Microsoft / OSS |
| **Visual Studio 2022/2026** | ✅ | ✅ | ✅ | ✅ | ✅ (`@debug`, `@profiler`, `@test`, `@vs` built-ins; `find_symbol`) | ✅ | ✅ | Microsoft |
| **JetBrains IDEs** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | JetBrains plugin (by GitHub) |
| **Eclipse** | ✅ | partial | ✅ | partial | partial | ✅ | partial | Eclipse plugin |
| **Xcode (Copilot for Xcode)** | ✅ | ✅ | ✅ | ✅ | ✅ (Agent Mode) | ✅ (via github.com) | ✅ (MCP Registry) | GitHub (OSS app) |
| **Neovim / Vim** | ✅ | limited | partial (via plugin) | ➖ | ➖ (pair with CLI) | ➖ (via CLI/web) | ➖ | GitHub plugin |
| **GitHub Copilot CLI** | ➖ | ➖ | ✅ | ✅ | ✅ (terminal-native agent, parallel sessions, rollback, remote steer, SDK) | ✅ (delegate) | ✅ (MCP, plugins, hooks, skills, BYOK) | GitHub |
| **github.com (web)** | ➖ | ➖ | ✅ | ➖ | ➖ | ✅ (kick off, track, configure) | ✅ (GitHub MCP server, Spaces) | GitHub |
| **Copilot cloud agent** | ➖ | ➖ | ➖ | ➖ | ➖ | ✅ (is the agent) — opens PRs, runs tests, integrates Jira/Linear/Slack/Teams/Azure Boards | ✅ (custom agents, skills, MCP, hooks, agent firewall) | GitHub-hosted runners |
| **GitHub Mobile** | ➖ | ➖ | ✅ | ➖ | ➖ | ✅ (monitor / kick off) | ➖ | GitHub |
| **Windows Terminal Canary — Terminal Chat** | ➖ | ➖ | ✅ (shell-focused) | ➖ | ➖ | ➖ | ➖ | Microsoft (Windows Terminal) |
| **GitHub Desktop** | ➖ | ➖ | limited | ➖ | ➖ | ➖ | ➖ | GitHub |

Notes on the matrix (synthesis across the cited pages; verify against live docs before publishing specific cells):
- "NES" = Next Edit Suggestions. Explicit documentation confirms NES for VS Code ([code.visualstudio.com](https://code.visualstudio.com/docs/copilot/ai-powered-suggestions)), Visual Studio ([Microsoft Learn](https://learn.microsoft.com/en-us/visualstudio/ide/visual-studio-github-copilot-extension)), and Xcode ([github/CopilotForXcode README](https://github.com/github/CopilotForXcode/blob/main/README.md)); other surfaces may have it behind feature flags or partial rollout.
- "Local agent" in the CLI row means the terminal-native agent loop (not an editor agent) documented at [About GitHub Copilot CLI — docs.github.com](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli) and [github/copilot-cli](https://github.com/github/copilot-cli).
- Eclipse entries marked `partial` reflect that Eclipse is a listed client in the model matrix ([docs.github.com](https://docs.github.com/en/copilot/reference/ai-models/supported-models)) but feature parity (especially Edit / Agent modes) is not explicitly documented on the same level as VS Code; verify against the [Copilot feature matrix reference page](https://docs.github.com/en/copilot/reference/copilot-feature-matrix) for the latest.
- VS Code row's Plan agent, Sessions view, and browser agent are from [GitHub Copilot in VS Code — code.visualstudio.com](https://code.visualstudio.com/docs/copilot/overview).
- Visual Studio row's `@debug`/`@profiler`/`@test`/`@vs` built-in agents are from [Use agent mode in Visual Studio — Microsoft Learn](https://learn.microsoft.com/en-us/visualstudio/ide/copilot-agent-mode).
- Cloud-agent integrations with Jira/Slack/Teams/Linear/Azure Boards come from the cloud-agent docs navigation at [About Copilot cloud agent — docs.github.com](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent).

---

## 6. Choosing the Right Surface

A beginner-friendly rubric (each row cross-referenced to the supporting source):

- **"I'm actively coding in a file."** → Your IDE. Use completions + inline chat. Reach for Edit mode for multi-file changes, Agent mode for anything that needs to run commands or tests. ([GitHub Copilot in VS Code — code.visualstudio.com](https://code.visualstudio.com/docs/copilot/overview); [Use agent mode in Visual Studio — Microsoft Learn](https://learn.microsoft.com/en-us/visualstudio/ide/copilot-agent-mode))
- **"I'm in a terminal doing shell / scripting / CI work."** → Copilot CLI ([About GitHub Copilot CLI — docs.github.com](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli); [github/copilot-cli](https://github.com/github/copilot-cli)).
- **"I'm reviewing or planning work on github.com."** → Copilot Chat on the web, plus Copilot code review and PR summaries ([Asking GitHub Copilot questions in GitHub — docs.github.com](https://docs.github.com/en/copilot/how-tos/use-chat/use-chat-in-github)).
- **"I have a well-scoped task I can describe in writing and I don't need to watch it."** → Delegate to the cloud agent — from an issue, from the CLI, or from the web. Requires Pro+/Business/Enterprise ([What is GitHub Copilot? — docs.github.com](https://docs.github.com/en/copilot/get-started/what-is-github-copilot); [About Copilot cloud agent — docs.github.com](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent)).
- **"I'm on my phone and want to check on something."** → GitHub Mobile chat; monitor cloud-agent sessions there ([What is GitHub Copilot? — docs.github.com](https://docs.github.com/en/copilot/get-started/what-is-github-copilot)).
- **"I'm on Windows, living in Windows Terminal."** → Terminal Chat in Windows Terminal Canary for shell-assistance; Copilot CLI if you want the full agent loop ([What is GitHub Copilot? — docs.github.com](https://docs.github.com/en/copilot/get-started/what-is-github-copilot)).
- **"I'm an Apple-platform dev."** → Copilot for Xcode ([github/CopilotForXcode README](https://github.com/github/CopilotForXcode/blob/main/README.md)).
- **"I'm in JetBrains/Eclipse."** → JetBrains covers completions + chat + agent mode per the "Supported AI models per client" matrix ([docs.github.com](https://docs.github.com/en/copilot/reference/ai-models/supported-models); [JetBrains Marketplace listing](https://plugins.jetbrains.com/plugin/17718-github-copilot)). Eclipse is a listed client in the same matrix, but Edit/Agent parity beyond completions + chat is not explicitly documented there — verify against the [Copilot feature matrix](https://docs.github.com/en/copilot/reference/copilot-feature-matrix) before relying on it (see §3.4). For anything missing, hop to the CLI or web.

Handoffs across surfaces are explicitly supported per the VS Code overview: a task can be moved from a local agent to a background or cloud agent with context carried over, and the Sessions view is the unified dashboard for monitoring local, background, and cloud sessions together ([GitHub Copilot in VS Code — code.visualstudio.com](https://code.visualstudio.com/docs/copilot/overview)).

---

## 7. Research Limitations

- **Two canonical docs pages 404'd during fetch** (the pre-rename URLs for "about-coding-agent" under two older paths). The content was recovered from the renamed concept page `…/concepts/agents/coding-agent/about-coding-agent`. The older term "Copilot coding agent" still appears in some places (e.g., Microsoft Learn customize-cloud-agent skill) while the current GitHub docs branding is "Copilot cloud agent." This report uses the current name and flags the legacy name once.
- **Per-surface model checkboxes** were not rendered in the extracted HTML text (they are `<img>`/icon cells in the source). The named clients and models are authoritative; the exact per-client intersections should be verified on the live [Supported AI models page](https://docs.github.com/en/copilot/reference/ai-models/supported-models) before publishing to an audience — the matrix in §5 therefore uses coarser granularity (✅ / partial / ➖) rather than exact per-model checkmarks.
- **Neovim, GitHub Desktop, and Terminal Chat** are named in official docs navigation and on the "What is GitHub Copilot?" page, but dedicated concept pages for each were either not fetched or are thin. Feature details for these three surfaces in this report are conservative and derived from surrounding docs navigation; deeper verification is advised before putting specific feature claims on a slide.
- **GitHub Changelog** (changelog.github.com/label/copilot) was fetched but is a JS-rendered feed that did not yield prose in the static HTML. This report therefore does not cite specific dated changelog entries for April 2026. For the most current "what just shipped" list, consult the live changelog filtered by the `copilot` label.
- **Scope exclusions:** Copilot's billing/pricing, Responsible-AI policies, FedRAMP model carve-outs, enterprise firewall/runner admin configurations, and the Copilot SDK programming interface are adjacent and intentionally not covered in depth here — the scope is "where does Copilot run and what does each surface do."

---

## 8. Complete Reference List

### Cited in body — Documentation & Articles

- [What is GitHub Copilot? — GitHub Docs](https://docs.github.com/en/copilot/get-started/what-is-github-copilot) — canonical list of where Copilot runs.
- [Supported AI models in GitHub Copilot — GitHub Docs](https://docs.github.com/en/copilot/reference/ai-models/supported-models) — authoritative per-client / per-plan model matrix, modes (Ask/Edit/Agent), multipliers, retirement history.
- [Copilot feature matrix — GitHub Docs](https://docs.github.com/en/copilot/reference/copilot-feature-matrix) — cross-surface feature matrix reference (cited in §3.3, §3.4, §5).
- [About GitHub Copilot cloud agent — GitHub Docs](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent) — cloud agent concept page.
- [About GitHub Copilot CLI — GitHub Docs](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli) — current concept page for the standalone Copilot CLI.
- [Using the GitHub CLI Copilot extension — GitHub Docs](https://docs.github.com/en/copilot/how-tos/use-copilot-for-common-tasks/use-copilot-in-the-cli) — page that currently renders the older `gh copilot` extension how-to (used in §3.7 to disambiguate CLI surfaces).
- [Asking GitHub Copilot questions in GitHub — GitHub Docs](https://docs.github.com/en/copilot/how-tos/use-chat/use-chat-in-github) — Copilot Chat on the web.
- [GitHub Copilot in VS Code — code.visualstudio.com](https://code.visualstudio.com/docs/copilot/overview) — VS Code flagship overview; source for local/background/cloud agents and Sessions view.
- [AI-powered inline suggestions in VS Code — code.visualstudio.com](https://code.visualstudio.com/docs/copilot/ai-powered-suggestions) — completions / NES in VS Code (cited in §5 NES note).
- [Get started with GitHub Copilot completions (Visual Studio) — Microsoft Learn](https://learn.microsoft.com/en-us/visualstudio/ide/visual-studio-github-copilot-extension) — completions/NES in Visual Studio.
- [Use agent mode in Visual Studio — Microsoft Learn](https://learn.microsoft.com/en-us/visualstudio/ide/copilot-agent-mode) — built-in agents (`@debug`, `@profiler`, `@test`, `@vs`), `find_symbol`, tool approvals.
- [GitHub Copilot (JetBrains plugin) — JetBrains Marketplace](https://plugins.jetbrains.com/plugin/17718-github-copilot) — JetBrains distribution (cited in §3.3 and §6).

### Cited in body — GitHub Repositories

- [github/CopilotForXcode](https://github.com/github/CopilotForXcode) — official Copilot for Xcode host app (Swift/Objective-C); README documents Chat, Agent Mode, Completions, NES, MCP Registry, Copilot Vision.
- [github/CopilotForXcode/README.md](https://github.com/github/CopilotForXcode/blob/main/README.md) — README permalink used for Xcode feature quote and install command.
- [github/copilot-cli](https://github.com/github/copilot-cli) — source repo for the standalone Copilot CLI (the `@github/copilot` npm package); used in §3.7 for install command and feature evidence.
- [github/copilot.vim](https://github.com/github/copilot.vim) — Neovim/Vim plugin repo (cited in §3.6).

### Consulted as background (not cited inline)

- [GitHub Copilot Quickstart — GitHub Docs](https://docs.github.com/en/copilot/quickstart) — onboarding across surfaces.
- [Use Copilot agents: coding agent — GitHub Docs](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent) — how-to entry point for cloud-agent workflows.
- [About GitHub Copilot in the CLI — GitHub Docs](https://docs.github.com/en/copilot/github-copilot-in-the-cli/about-github-copilot-in-the-cli) — older CLI concept page (superseded by the "About GitHub Copilot CLI" page cited above).
- [Installing the GitHub Copilot extension in your environment — GitHub Docs](https://docs.github.com/en/copilot/configuring-github-copilot/installing-the-github-copilot-extension-in-your-environment) — per-surface install flows.
- [Agent mode in VS Code — code.visualstudio.com](https://code.visualstudio.com/docs/copilot/chat/chat-agent-mode) — agent-mode specifics.
- [Copilot edits in VS Code — code.visualstudio.com](https://code.visualstudio.com/docs/copilot/copilot-edits) — Edit mode in VS Code.
- [Copilot Chat context in Visual Studio — Microsoft Learn](https://learn.microsoft.com/en-us/visualstudio/ide/copilot-chat-context) — Visual Studio chat context model.
- [GitHub Features — Copilot](https://github.com/features/copilot) — marketing-level overview of surfaces and plans.
- [GitHub Changelog — Copilot label](https://github.blog/changelog/label/copilot/) — live feed of Copilot changes (dynamic; verify latest entries on the page).

### Code Samples / Install Commands

- Install the standalone Copilot CLI: `npm install -g @github/copilot`, then invoke as `copilot`. — Source: [github/copilot-cli README](https://github.com/github/copilot-cli) | Provenance: verbatim.
- Install Copilot for Xcode: `brew install --cask github-copilot-for-xcode` — macOS install for the Xcode surface. — Source: [CopilotForXcode README](https://github.com/github/CopilotForXcode/blob/main/README.md) | Provenance: verbatim.
- VS Code first-run flow (hover the Copilot status-bar icon → *Set up Copilot* → sign in → open Chat with `Ctrl+Alt+I` / `⌃⌘I`). — Source: [GitHub Copilot in VS Code](https://code.visualstudio.com/docs/copilot/overview) | Provenance: adapted.
- Visual Studio prerequisite: "Visual Studio 2026 or Visual Studio 2022 version 17.14 (with the latest servicing release recommended)." — Source: [Microsoft Learn — VS Copilot completions](https://learn.microsoft.com/en-us/visualstudio/ide/visual-studio-github-copilot-extension) | Provenance: verbatim.

---

## Revision Round 2 — 2026-04-21

The following reviewer findings from [`agent-reviews/2026-04-21-web-research-reviewer-copilot-surfaces.md`](../agent-reviews/2026-04-21-web-research-reviewer-copilot-surfaces.md) (Round 1, verdict APPROVED WITH EDITS) were addressed:

- ✅ fixed — 🟡 Important: Executive Summary — added inline citations for the model-family list, the surfaces-list claim, the VS Code framing, the Visual Studio / JetBrains / Xcode / Eclipse claims, the standalone Copilot CLI packaging, and the cloud-agent invocation paths.
- ✅ fixed — 🟡 Important: §5 Comparison / Feature Matrix — added per-cell source citations in the matrix notes for NES, the CLI local-agent row, the Eclipse row, the VS Code Plan agent/Sessions/browser agent entries, the Visual Studio built-in agents, and cloud-agent integrations.
- ✅ fixed — 🟡 Important: §6 Choosing the Right Surface — added an inline citation to every rubric row and replaced the cross-surface handoff claim with a cited, paraphrased version from the VS Code overview.
- ✅ fixed — 🟡 Important: §3.3 JetBrains — replaced the "Feature parity trails VS Code by weeks-to-months" claim with cautious synthesis pointing at the Copilot feature matrix, and added Marketplace + model-matrix citations.
- ✅ fixed — 🟡 Important: §3.4 Eclipse — converted feature-parity claims to cautious synthesis and cited the model matrix and feature matrix pages.
- ✅ fixed — 🟡 Important: §3.6 Neovim / Vim — added a direct citation to the `github/copilot.vim` repo, cited the "What is GitHub Copilot?" surface list and the model matrix, and softened the model-set implication to cautious synthesis.
- ✅ fixed — 🟡 Important: §3.10 GitHub Mobile — added inline citations for each feature bullet and labeled the section as cautious synthesis from the surface list and cloud-agent docs.
- ✅ fixed — 🟡 Important: §3.12 GitHub Desktop — removed the unsourced "most visibly commit message generation" claim, replaced it with cautious synthesis, and cited the surface list and model matrix.
- ✅ fixed — 🟡 Important: §4 Model Availability per Surface — added an inline citation to the Supported AI models page on every model-family bullet and on the retirements sentence, and softened the "broadest model menu" claim to cautious synthesis citing the client-header ordering in that matrix.
- ✅ fixed — 🟡 Important: §2.2 and §2.3 VS Code quotes — the exact wording could not be reproduced from a static fetch (the VS Code overview page is JS-rendered). Both blocks have been converted to unquoted paraphrase with the source link retained and an explicit note about the unverifiability of the prior verbatim text.
- ✅ fixed — 🟡 Important: §3.7 Copilot CLI packaging/naming drift — the section now explicitly distinguishes (1) the current standalone `copilot` CLI distributed as `@github/copilot` on npm and sourced at [github/copilot-cli](https://github.com/github/copilot-cli), with the concept page [About GitHub Copilot CLI](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli), versus (2) the older `gh copilot` extension, for which the how-to URL still renders the H1 "Using the GitHub CLI Copilot extension." A sourced install/invocation block (`npm install -g @github/copilot` → `copilot`) is included.
- ✅ fixed — 🟡 Important: Header source count — updated to "21 web pages, 2 GitHub repositories" (two new: `github/copilot-cli`, and the `CopilotForXcode/README.md` permalink tracked separately from the repo root; plus two new docs URLs for the CLI concept page and the copilot-feature-matrix reference).
- ✅ fixed — 🟡 Important: Reference list integrity — reorganized §8 into "Cited in body" and "Consulted as background" subsections; added the previously-orphan `copilot-feature-matrix` URL to the cited-in-body list; moved Quickstart, Installing-the-extension, VS Code agent-mode / edits, JetBrains Marketplace (now cited in §3.3 and §6, so also in cited list), GitHub Changelog, features/copilot, VS chat-context, and cloud-agent how-to into the appropriate subsection.
- 🟢 Minor skipped — explicit "Features" / "Evidence" lines in §3.10–§3.12: the bullet-style features plus inline citations added in this round already provide the compare-at-a-glance structure; a further formatting pass would add noise without new information.
- 🟢 Minor addressed opportunistically — §3.7 now includes one sourced example install / invocation (`npm install -g @github/copilot`, then `copilot`), closing the CLI-example gap called out as 🟢 Minor.

### Revision Round 3 — 2026-04-21

- ✅ fixed — 🟡 Important: Header source-count reconciliation — updated line 6 to **"21 web pages, 3 GitHub repositories"** (matching `github/CopilotForXcode`, `github/copilot-cli`, `github/copilot.vim` in the §8 "Cited in body — GitHub Repositories" list) and annotated that the `CopilotForXcode/README.md` permalink listed separately in §8 belongs to the `github/CopilotForXcode` repository and is not counted as a fourth repo.
- ✅ fixed — 🟡 Important: Executive Summary / §6 Eclipse "agent mode" synthesis — the Executive Summary no longer asserts that Eclipse offers "completions + chat + an agent mode" alongside JetBrains/Xcode/Visual Studio; it now states only that Eclipse is a first-class client in the "Supported AI models per client" matrix and flags that Edit/Agent parity beyond completions + chat is not explicitly documented there, pointing readers to the live Copilot feature matrix and to §3.4. The §6 "I'm in JetBrains/Eclipse." row was softened to match: JetBrains keeps the completions + chat + agent phrasing with direct citations, while Eclipse now carries the same cautious framing as §3.4.
