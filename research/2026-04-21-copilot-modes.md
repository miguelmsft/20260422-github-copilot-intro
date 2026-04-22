# Research Report: GitHub Copilot Modes — Ask, Edit, Agent, Plan, Autopilot (April 2026)

**Date:** 2026-04-21
**Researcher:** Copilot Web Researcher Agent
**Topic slug:** copilot-modes
**Sources consulted:** 14 web pages (official VS Code docs + GitHub Docs), 0 GitHub repositories

---

## Executive Summary

GitHub Copilot's "modes" have evolved significantly by April 2026. What historically were called **chat modes** (Ask, Edit, Agent) in VS Code have been reorganized into a three-dimensional configuration for every chat session: **(1) Agent Target** — *where* the agent runs (Local, Copilot CLI, Cloud, Third-party); **(2) Agent** — *which persona/role* it uses (built-in: Agent, Plan, Ask; plus user-defined **custom agents**); and **(3) Permission level** — *how much autonomy* it has (Default Approvals, Bypass Approvals, or **Autopilot (Preview)**) ([Chat overview](https://code.visualstudio.com/docs/copilot/chat/copilot-chat); [Using agents in Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/overview)). The old "Edit mode" is explicitly **deprecated** — VS Code now routes multi-file edits through Agent ([Local agents in Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/local-agents)).

The everyday picture for a beginner is: choose **Ask** to ask questions without touching code, **Plan** to have Copilot research the task and produce a step-by-step plan before implementing, and **Agent** for autonomous multi-file edits with terminal/tool access — all three running *inside* your IDE interactively ([Using agents in Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/overview)). **Autopilot** is not a separate "mode" with different capabilities; it is a **permission level** on top of Agent that auto-approves tool calls and auto-answers clarifying questions so the agent can run uninterrupted ([Using agents in Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/overview)). **Copilot cloud agent** (formerly "Copilot coding agent") is a fundamentally different thing: it runs on GitHub-hosted infrastructure, is triggered from github.com or via issue assignment, and opens a pull request — **do not confuse it with the in-IDE Agent** ([Cloud agents in Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/cloud-agents); [Concepts for GitHub Copilot cloud agent](https://docs.github.com/en/copilot/concepts/agents/coding-agent)).

Billing-wise, every user prompt in Ask/Edit/Agent/Plan in an IDE consumes **one premium request × model multiplier**; tool calls the agent makes on its own do not add to the count ([Requests in GitHub Copilot](https://docs.github.com/en/copilot/concepts/billing/copilot-requests)). A Copilot cloud agent session is billed as **one premium request per session × model multiplier** (plus one per real-time steering comment), drawn from a separate *Copilot cloud agent premium requests* SKU ([Requests in GitHub Copilot](https://docs.github.com/en/copilot/concepts/billing/copilot-requests)).

---

## Table of Contents

1. [Overview](#1-overview)
2. [Key Concepts: The Three Dimensions of a Chat Session](#2-key-concepts-the-three-dimensions-of-a-chat-session)
3. [Getting Started](#3-getting-started)
4. [The Modes (Built-in Agents) in Depth](#4-the-modes-built-in-agents-in-depth)
5. [Permission Levels, Including Autopilot](#5-permission-levels-including-autopilot)
6. [Agent Targets: Local vs. CLI vs. Cloud vs. Third-Party](#6-agent-targets-local-vs-cli-vs-cloud-vs-third-party)
7. [In-IDE Agent vs. Copilot Cloud Agent — The Critical Distinction](#7-in-ide-agent-vs-copilot-cloud-agent--the-critical-distinction)
8. [Comparison Table & Decision Tree (Slide-Ready)](#8-comparison-table--decision-tree-slide-ready)
9. [Pricing & Premium Requests](#9-pricing--premium-requests)
10. [Research Limitations](#10-research-limitations)
11. [Complete Reference List](#11-complete-reference-list)

---

## 1. Overview

### What It Is

A Copilot "mode" is the combination of settings that determines *how* Copilot behaves during a chat session. As of April 2026, VS Code exposes this as **three independent choices** (session type, agent, permission level). The built-in agent personas — **Agent, Plan, Ask** — are what most people colloquially call "modes."

> "VS Code has three built-in agents: **Agent**: autonomously plans and implements changes across files, runs terminal commands, and invokes tools. **Plan**: creates a structured, step-by-step implementation plan before writing any code. Hands the plan off to an implementation agent when it looks right. **Ask**: answers questions about coding concepts, your codebase, or VS Code itself without making file changes."
> — Source: [Using agents in Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/overview)

### Why It Matters

Different tasks need different levels of autonomy, context, and oversight. Using Ask for a conceptual question is cheap and safe; using Agent with Autopilot for a routine refactor is fast but requires trust in the test suite; delegating the same refactor to the **Copilot cloud agent** frees up your IDE entirely and produces a pull request for review. Picking the right mode directly affects productivity, premium-request spend, and the blast radius of AI mistakes.

### Key Features (across all modes)

- Built-in personas: **Agent, Plan, Ask** (Edit is **deprecated**).
- User-defined **custom agents** via `.agent.md` files (formerly `.chatmode.md`).
- Independent **permission levels**: Default Approvals, Bypass Approvals, **Autopilot (Preview)**.
- Multiple **agent targets**: Local, Copilot CLI, Cloud, Third-party (Anthropic/OpenAI).
- **Handoffs** between agents (e.g., Plan → Agent; Local → Cloud).
- Unified sessions list, checkpoints, and "steer / queue / stop" mid-request controls.

---

## 2. Key Concepts: The Three Dimensions of a Chat Session

When you open Chat in VS Code, three dropdowns configure each session:

> "When you start a chat session, the following choices shape how the AI responds: **Session type**: determines where the agent runs (locally, in the background, or in the cloud). … **Agent**: determines the role or persona of the AI, such as Agent, Plan, or Ask. … **Permission level**: controls how much autonomy the agent has over tool approvals. … **Language model**: determines which AI model powers the conversation."
> — Source: [Chat overview](https://code.visualstudio.com/docs/copilot/chat/copilot-chat)

```
┌─────────────────────────────────────────────────────────────┐
│  A VS Code Chat Session = 3 independent choices             │
├─────────────────────────────────────────────────────────────┤
│  1. Agent Target (where it runs)                            │
│       Local  |  Copilot CLI  |  Cloud  |  Third-party       │
│                                                             │
│  2. Agent (persona / role)                                  │
│       Agent  |  Plan  |  Ask  |  <custom .agent.md>         │
│                                                             │
│  3. Permission Level (autonomy)                             │
│       Default Approvals  |  Bypass Approvals  |  Autopilot  │
│                                                             │
│  (+ Language model picker — orthogonal to all three)        │
└─────────────────────────────────────────────────────────────┘
```

> "Custom agents were previously known as **custom chat modes**. The functionality remains the same, but the terminology has been updated to better reflect their purpose in customizing AI behavior for specific tasks. If you have existing `.chatmode.md` files, rename them to `.agent.md` to convert them to the new custom agent format…"
> — Source: [Custom agents in VS Code](https://code.visualstudio.com/docs/copilot/customization/custom-agents)

This rename is the single biggest source of confusion in 2026: the **word "mode" is being phased out** in VS Code documentation in favor of "agent," though users, blog posts, and GitHub.com docs still use "mode" interchangeably (and the GitHub billing page still says *"This includes ask, edit, agent, and plan modes in Copilot Chat in an IDE"* — see §9).

---

## 3. Getting Started

### Prerequisites

- A GitHub Copilot plan (Free, Pro, Pro+, Business, or Enterprise). **Starting April 20, 2026, new sign-ups for Copilot Pro, Copilot Pro+, and student plans are temporarily paused** and weekly usage limits have been tightened (per the banner on the official VS Code Copilot docs; see [Using agents in Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/overview) and [Chat overview](https://code.visualstudio.com/docs/copilot/chat/copilot-chat)).
- VS Code (stable) or VS Code Insiders with the Copilot extension. Many features described here (built-in Agent/Plan/Ask, permission-level picker, `.agent.md` custom agents) are described in the VS Code 1.99+ (April 2026) docs set cited throughout this report — see [Using agents in Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/overview) and [Custom agents in VS Code](https://code.visualstudio.com/docs/copilot/customization/custom-agents).
- For Copilot cloud agent: a repository on GitHub where the agent is enabled by your org/enterprise policy ([Concepts for GitHub Copilot cloud agent](https://docs.github.com/en/copilot/concepts/agents/coding-agent)).

### Switching Modes in VS Code

#### Open the Chat view

```
Windows/Linux:  Ctrl+Alt+I
macOS:          ⌃⌘I
```

#### Pick Agent Target, Agent, and Permission Level

1. **Agent Target dropdown** → Local, Copilot CLI, Cloud, or Third-party.
2. **Agent dropdown** → Agent, Plan, Ask, or a custom agent.
3. **Permissions dropdown** → Default Approvals, Bypass Approvals, or Autopilot (Preview).

Sources for the three dropdowns: [Chat overview](https://code.visualstudio.com/docs/copilot/chat/copilot-chat) and [Using agents in Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/overview).

#### Slash shortcuts (fastest way)

```
/plan  <task description>     # Switch to Plan agent and start planning in one step
/fork                         # Fork the current session
/savePrompt                   # Save the session as a reusable .prompt.md
/agents                       # Open the Configure Custom Agents menu
/create-agent                 # (in Agent mode) AI-generate a new custom agent
/delegate <instructions>      # From a Copilot CLI session, hand off to Cloud
```

Sources for the slash commands: `/plan` is documented in [Planning with agents in VS Code](https://code.visualstudio.com/docs/copilot/agents/planning); `/fork` and `/savePrompt` in [Manage chat sessions](https://code.visualstudio.com/docs/copilot/chat/chat-sessions); `/agents` and `/create-agent` in [Custom agents in VS Code](https://code.visualstudio.com/docs/copilot/customization/custom-agents); `/delegate` in [Cloud agents in Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/cloud-agents).

> "To plan a task, use the built-in Plan agent in the Chat view, describe your task, and iterate on the generated plan. … Alternatively, type `/plan` followed by your task description to switch to the Plan agent and start planning in one step."
> — Source: [Planning with agents in VS Code](https://code.visualstudio.com/docs/copilot/agents/planning)

### Enabling Agent (if hidden)

> "Enable agents in your VS Code settings (`chat.agent.enabled`). … Your organization might also disable agents - contact your admin to enable this functionality."
> — Source: [Using agents in Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/overview)

### Restoring the (Deprecated) Edit Mode

> "**Edit mode (deprecated)** — Edit mode is deprecated. Use Agent mode for multi-file code edits instead. You can restore Edit mode by enabling the `chat.editMode.hidden` setting."
> — Source: [Local agents in Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/local-agents)

---

## 4. The Modes (Built-in Agents) in Depth

### 4.1 Ask

**What it does.** A conversational Q&A agent that does NOT edit files directly. It researches your codebase and returns answers, with code blocks you can *manually* "Apply in Editor."

> "The Ask feature works best for answering questions about your codebase, coding, and general technology concepts. Use Ask when you want to understand how something works, explore ideas, or get help with coding tasks. **Ask uses agentic capabilities to research your codebase and gather relevant context.** Responses can contain code blocks that you apply individually to your codebase. To apply a code block, hover over the code block and select the Apply in Editor button."
> — Source: [Local agents in Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/local-agents)

**Use it for:** explanations, concept questions, "where is X defined?", onboarding to a codebase, code review discussions, suggesting 2–3 approaches before committing to one ([Local agents in Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/local-agents)).

**Do NOT use for:** making actual multi-file changes (use Agent), or any task that needs to run a terminal command on your behalf.

**How to switch:** Chat view → **Agent dropdown → Ask**.

**Surfaces:** VS Code Chat view, Inline chat, Quick chat; Visual Studio; JetBrains; Xcode; GitHub.com ("Ask Copilot" search); GitHub Mobile (see the top-level surface taxonomy in [GitHub Copilot features](https://docs.github.com/en/copilot/get-started/features)).

**Permission model:** Ask cannot make file edits by itself, so permission prompting is minimal — the user explicitly chooses "Apply in Editor" per code block.

**Tool access:** Read-only research tools (codebase search, symbol lookup, web fetch if enabled). No edit, no terminal-run by default.

**Billing:** 1 premium request per user prompt × model multiplier.

---

### 4.2 Edit (Deprecated)

**Status:** **Deprecated** in VS Code as of early 2026. Functionality has been folded into Agent. Historically, Edit mode provided multi-file targeted edits with a diff preview and user approval, without the iterative tool-calling loop or terminal access that Agent has.

> "Edit mode is deprecated. Use Agent mode for multi-file code edits instead. You can restore Edit mode by enabling the `chat.editMode.hidden` setting."
> — Source: [Local agents in Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/local-agents)

**Practical takeaway for beginners:** treat "Edit" as a historical term. If you want human-in-the-loop multi-file edits *without* terminal access, either restore Edit via the hidden setting, or use Agent with **Default Approvals** (so every edit/tool call is gated), or create a **custom agent** whose tool list excludes `run-in-terminal`.

**Billing note:** GitHub Docs still enumerates "edit" as a billable mode: *"This includes ask, edit, agent, and plan modes in Copilot Chat in an IDE"* (see §9) — evidence Edit is still reachable for users who opt in.

---

### 4.3 Agent (in-IDE, interactive)

**What it does.** An autonomous agent that plans, edits multiple files, runs terminal commands, invokes tools (built-in, MCP, and extension-provided), and self-corrects based on tool results — all inside your open VS Code window.

> "Agent is optimized for complex coding tasks based on high-level requirements that might require running terminal commands and tools. The AI operates autonomously, determining the relevant context and files to edit, planning the work needed, and iterating to resolve problems as they arise. VS Code directly applies code changes in the editor, and the editor overlay controls enable you to navigate between the suggested edits and review them."
> — Source: [Local agents in Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/local-agents)

> "An agent is an AI assistant that works autonomously to complete a coding task. Give it a high-level goal, and it breaks the goal into steps, edits files across your project, runs commands, and self-corrects when something goes wrong. For example, instead of suggesting a fix for a failing test, an agent identifies the root cause across files, updates the code, reruns the tests, and commits the changes."
> — Source: [Using agents in Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/overview)

**Use it for:** implementing a new feature, refactoring, fixing a failing test where the root cause might span files, scaffolding (e.g., "Create a basic calculator app with HTML, CSS, and JavaScript"), CI/CD setup ([Using agents in Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/overview); [Local agents in Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/local-agents)).

**Do NOT use for:** pure conceptual Q&A (use Ask — it's cheaper in attention and avoids accidental edits), or tasks you want to run in the background while you keep coding (use Copilot CLI or Cloud) ([Cloud agents in Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/cloud-agents)).

**How to switch:** Chat view → **Agent dropdown → Agent**.

**Surfaces:** VS Code (primary), Visual Studio (as "Agent mode"), JetBrains, Xcode. *Does not run on github.com* — for that, use Copilot cloud agent (§7). See [GitHub Copilot features](https://docs.github.com/en/copilot/get-started/features) for the cross-IDE surface matrix.

**Permission model:** Governed by the **Permission level** dropdown. At Default Approvals, every terminal command and sensitive edit asks for confirmation. VS Code also has built-in guardrails:

> "VS Code helps you protect against inadvertent edits to sensitive files, such as workspace configuration settings or environment settings."
> — Source: [Local agents in Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/local-agents)

**Tool access:** Full — file read/write/create, terminal, tasks, browser automation (experimental), plus all MCP servers and extension-contributed tools.

**Billing:** 1 premium request **per user prompt** × model multiplier. Tool calls the agent makes on its own during the loop are **free**.

---

### 4.4 Plan

**What it does.** A planning-first agent: it researches the task, asks clarifying questions, and produces a structured implementation plan (overview, requirements, steps, verification). It does *not* make code changes itself — you hand the plan off to Agent (or to Copilot CLI / Cloud) for implementation.

> "The plan agent is optimized for creating a structured implementation plan for a coding task. Use the plan agent when you want to break down a complex feature or change into smaller, manageable steps before implementation. The plan agent generates a detailed plan outlining the steps needed and asks clarifying questions to ensure a comprehensive understanding of the task. You can then hand off the plan to an implementation agent or use it as a guide."
> — Source: [Local agents in Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/local-agents)

> "The Plan agent automatically saves its implementation plan to a session memory file (`/memories/session/plan.md`). To access this file, run the **Chat: Show Memory Files** command and select `plan.md` from the list. Session memory is cleared when the conversation ends, so the plan is not available in subsequent sessions."
> — Source: [Planning with agents in VS Code](https://code.visualstudio.com/docs/copilot/agents/planning)

**Use it for:** new features, large refactors, anything non-trivial where you want to review scope and approach *before* any file is touched. Especially valuable before handing off to a Cloud agent that will run unattended ([Planning with agents in VS Code](https://code.visualstudio.com/docs/copilot/agents/planning); [Cloud agents in Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/cloud-agents)).

**Do NOT use for:** tiny edits, questions (use Ask), or tasks where you already know the approach and just want execution.

**How to switch:** Chat view → **Agent dropdown → Plan**, or type `/plan <task>`.

**Surfaces:** VS Code (stable), VS Code Insiders. Available on GitHub.com-side workflows via the Copilot cloud agent "Research, plan, iterate" flow (different implementation; see §7 and [Concepts for GitHub Copilot cloud agent](https://docs.github.com/en/copilot/concepts/agents/coding-agent)).

**Permission model:** Plan is effectively read-only by design — it researches but does not edit. When the plan is finalized, it surfaces a **handoff button** (e.g., "Start Implementation" → Agent; "Continue in Cloud" → Copilot cloud agent):

> "When users see the handoff button and select it, they switch to the target agent with the prompt pre-filled."
> — Source: [Custom agents in VS Code](https://code.visualstudio.com/docs/copilot/customization/custom-agents)

**Tool access:** Research-only by default (codebase search, web fetch). Admins can extend via `github.copilot.chat.planAgent.additionalTools`.

**Billing:** 1 premium request per user prompt × model multiplier.

---

### 4.5 Custom Agents (formerly "custom chat modes")

**What they are.** User-authored `.agent.md` files (Markdown with YAML frontmatter) that define a persona, a restricted tool list, an optional model, and optional handoffs. Stored in `.github/agents/` (workspace), `.claude/agents/` (Claude format, also read), or `~/.copilot/agents` (user).

Example (from the VS Code docs):

```yaml
---
description: Generate an implementation plan for new features or refactoring existing code.
name: Planner
tools: ['web/fetch', 'search/codebase', 'search/usages']
model: ['Claude Opus 4.5', 'GPT-5.2']   # Tries models in order
handoffs:
  - label: Implement Plan
    agent: agent
    prompt: Implement the plan outlined above.
    send: false
---
# Planning instructions
You are in planning mode. Your task is to generate an implementation plan…
```
> — Source: [Custom agents in VS Code](https://code.visualstudio.com/docs/copilot/customization/custom-agents) | Provenance: verbatim

**Use for:** team-wide standardized personas (Security Reviewer, Architect, Test Writer, Cleanup Specialist), restricting tools for safety, enforcing a specific model, or orchestrating multi-step workflows via handoffs.

---

## 5. Permission Levels, Including Autopilot

The permission level is an **orthogonal dial** that applies on top of Agent (and custom agents). It is **where "Autopilot" lives** — Autopilot is *not* a separate mode with different capabilities; it's Agent running at maximum autonomy.

> "Agents perform tasks autonomously, but you can control how much autonomy they have for invoking tools and terminal commands. Giving agents more autonomy can increase efficiency but may reduce oversight. The permissions picker in the Chat view lets you choose a permission level for each session, from approving every tool call to letting the agent work fully on its own."
> — Source: [Using agents in Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/overview)

| Permission Level | What it does |
|---|---|
| **Default Approvals** | "Uses the approvals as specified in VS Code settings. By default, only read-only and safe tools don't require explicit approval." |
| **Bypass Approvals** | "Auto-approves all tool calls without confirmation dialogs. The agent might ask clarifying questions as it works." |
| **Autopilot (Preview)** | "Auto-approves all tool calls, auto-responds to questions, and the agent continues working autonomously until the task is complete." |

> — Source (all three rows, verbatim): [Using agents in Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/overview)

**When to use Autopilot:** long-running, well-defined tasks (test-generation sweeps, dependency upgrades, mechanical refactors) where a strong test suite or clear success criterion will catch mistakes. Combine with OS notifications (`chat.notifyWindowOnResponseReceived`) so you know when it's done.

**When NOT to use Autopilot:** exploratory work, security-sensitive edits, or in repos without good test coverage. Also avoid it on a first-time task where you can't yet predict the agent's behavior.

**Interaction with built-in agents:**
- **Ask + Autopilot** → irrelevant (Ask doesn't edit or invoke destructive tools).
- **Plan + Autopilot** → effectively "auto-answer clarifying questions and finalize the plan without interruption."
- **Agent + Autopilot** → the "hands-off coding agent" experience closest to how the Copilot cloud agent feels, but running locally in your IDE.

---

## 6. Agent Targets: Local vs. CLI vs. Cloud vs. Third-Party

> "Agents run in different environments depending on when you need results and how much oversight you want. The two key dimensions are **where the agent runs** (your machine or the cloud) and **how you interact with it** (interactively or autonomously in the background). **Local**: use the VS Code agent loop to run the agent interactively in the editor with full access to your workspace, tools, and models. **Copilot CLI**: use the Copilot CLI to run in the background on your machine, optionally using Git worktrees for isolation. **Cloud**: use GitHub Copilot to run remotely and integrate with GitHub pull requests for team collaboration. **Third-party**: use the third-party agent harness and SDK from Anthropic and OpenAI to run either locally on your machine or in the cloud."
> — Source: [Using agents in Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/overview)

| Target | Runs on | Interaction style | IDE context access | Typical use |
|---|---|---|---|---|
| **Local** | Your machine, inside VS Code | Interactive chat | Full (files, terminal, extensions, MCP) | Brainstorm, iterate, debug with editor context |
| **Copilot CLI** | Your machine, terminal/background | Background (CLI) | Limited; can use Git worktrees for isolation | Well-defined tasks you want running while you keep coding |
| **Cloud** (Copilot cloud agent) | GitHub infrastructure | Background; results via PR | None to your IDE; only repo + configured MCP servers | Team-reviewed PRs, large refactors, GitHub-issue-driven work |
| **Third-party** | Local or cloud (Anthropic / OpenAI) | Either | Varies | Opinionated use of Claude or Codex harnesses |

Handoff chain: `Plan (local) → Agent (local) → /delegate → Cloud (PR for team review)`.

---

## 7. In-IDE Agent vs. Copilot Cloud Agent — The Critical Distinction

This distinction trips up most beginners. They are **separate products** even though both use the word "agent":

| | **In-IDE Agent** (VS Code "Agent" target=Local) | **Copilot Cloud Agent** (target=Cloud) |
|---|---|---|
| **Where it runs** | Your machine, inside your open VS Code | GitHub-hosted runners (remote) |
| **How you start it** | VS Code Chat view, pick Agent | github.com (assign issue to `copilot`), VS Code "Cloud" target, or GitHub Pull Requests extension |
| **Interactivity** | Real-time chat, you approve/steer | Fire-and-forget; results come back as a **pull request** |
| **Context** | Full IDE context (selection, open files, terminal, extensions, MCP, BYOK models) | Repo contents + MCP servers **configured on the service**; no access to VS Code extensions or your local selection |
| **Output** | Direct edits in your workspace | A PR with diff, commits, and description |
| **Who sees it** | Just you | Your team (via the PR) |
| **Plans** | All paid Copilot plans (and Free with limits) | **Copilot Pro+, Copilot Business, Copilot Enterprise only** |
| **Billing SKU** | "Copilot premium requests" (per-prompt) | **"Copilot cloud agent premium requests"** (per-session + per steering comment), separate SKU since Nov 1, 2025 |

> "Unlike local and background agents that run on your local machine, cloud agents like Copilot cloud agent run on remote infrastructure. … Due to their remote execution environment, cloud agents can't directly access VS Code built-in tools and run-time context (like failed tests or text selections). They are limited to the MCP servers and language models that are configured in the cloud agent service."
> — Source: [Cloud agents in Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/cloud-agents)

> "Copilot can research a repository, create an implementation plan, and make code changes on a branch. You can review the diff, iterate, and create a pull request when you're ready."
> — Source: [Concepts for GitHub Copilot cloud agent](https://docs.github.com/en/copilot/concepts/agents/coding-agent)

**Naming note:** GitHub renamed "Copilot coding agent" → "**Copilot cloud agent**" in its docs; the term "coding agent" still appears in some URLs and older material. They are the same product.

---

## 8. Comparison Table & Decision Tree (Slide-Ready)

### 8.1 Quick comparison table (one slide)

Sources synthesizing this table: [Using agents in Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/overview), [Local agents in Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/local-agents), [Planning with agents in VS Code](https://code.visualstudio.com/docs/copilot/agents/planning), [Cloud agents in Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/cloud-agents), and [Concepts for GitHub Copilot cloud agent](https://docs.github.com/en/copilot/concepts/agents/coding-agent).

| Mode | Edits files? | Runs terminal? | Uses tools? | HITL default | Best for |
|---|---|---|---|---|---|
| **Ask** | ✗ (manual "Apply" only) | ✗ | Read-only | — | Q&A, explore, explain |
| **Edit** *(deprecated)* | ✓ multi-file | ✗ | Edit tools only | Approve each edit | Legacy multi-file edits |
| **Agent** | ✓ | ✓ | Full (MCP, extensions) | Per permission level | Autonomous in-IDE implementation |
| **Plan** | ✗ | ✗ | Research only | — | Planning before implementation |
| **Autopilot** | (Agent) ✓ | (Agent) ✓ | (Agent) Full | **Auto-approve all** | Long, well-defined tasks |
| **Copilot Cloud Agent** | ✓ (in a PR) | ✓ (in a sandbox) | MCP + runner tools | No IDE prompts; PR review is HITL | Team-review via PR, issue-driven work |

### 8.2 Decision tree

Decision-tree guidance synthesized from [Using agents in Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/overview) (permission-level picker), [Cloud agents in Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/cloud-agents) (Local/CLI/Cloud targets), and [Concepts for GitHub Copilot cloud agent](https://docs.github.com/en/copilot/concepts/agents/coding-agent) (issue-assignment flow).

```
Start: What do you want Copilot to do?
│
├── Just answer a question, explain code, or brainstorm
│      → Ask
│
├── Do actual work that edits files
│   │
│   ├── I want to approve a plan before any code is written
│   │      → Plan   (then hand off to Agent or Cloud)
│   │
│   ├── I want to watch and approve each step
│   │      → Agent + Default Approvals
│   │
│   ├── I want hands-off, but I'll stay near the keyboard
│   │      → Agent + Bypass Approvals
│   │
│   ├── I want fully unattended in my IDE
│   │      → Agent + Autopilot (Preview)
│   │
│   ├── I want it to run in the background while I keep coding
│   │      → Copilot CLI target
│   │
│   └── I want a pull request my team can review; task is well-scoped
│          → Copilot Cloud Agent (assign issue to copilot, or Cloud target)
│
└── I want a reusable persona (Security Reviewer, etc.)
       → Custom Agent (.agent.md)
```

---

## 9. Pricing & Premium Requests

> "A request is any interaction where you ask Copilot to do something for you… Each time you send a prompt in a chat window or trigger a response from Copilot, you're making a request. **For agentic features, only the prompts you send count as premium requests; actions Copilot takes autonomously to complete your task, such as tool calls, do not.** For example, using `/plan` in Copilot CLI counts as one premium request, and any follow-up prompt you send counts as another."
> — Source: [Requests in GitHub Copilot](https://docs.github.com/en/copilot/concepts/billing/copilot-requests)

> "**Copilot Chat** uses one premium request per user prompt, multiplied by the model's rate. This includes ask, edit, agent, and plan modes in Copilot Chat in an IDE. … **Copilot cloud agent** uses one premium request per session, multiplied by the model's rate. A session begins when you prompt Copilot to undertake a task. In addition, each real-time steering comment made during an active session uses one premium request per session, multiplied by the model's rate."
> — Source: [Requests in GitHub Copilot](https://docs.github.com/en/copilot/concepts/billing/copilot-requests)

**Key billing facts (April 2026):**

- IDE chat (Ask/Edit/Agent/Plan): **1 premium request × model multiplier per prompt**. Autopilot does not change the cost — the autonomous tool calls inside the agent loop are free; only your own prompts count ([Requests in GitHub Copilot](https://docs.github.com/en/copilot/concepts/billing/copilot-requests)).
- Copilot cloud agent: **1 premium request × multiplier per session**, plus 1 per steering comment. Drawn from a **separate SKU** ("Copilot cloud agent premium requests") since Nov 1, 2025 ([Requests in GitHub Copilot](https://docs.github.com/en/copilot/concepts/billing/copilot-requests)).
- **Included models** (GPT-5 mini, GPT-4.1, GPT-4o) cost **0** premium requests on paid plans ([Requests in GitHub Copilot](https://docs.github.com/en/copilot/concepts/billing/copilot-requests)).
- Sample multipliers: Claude Sonnet 4/4.5/4.6 = **1×**, Claude Opus 4.5/4.6 = **3×**, Claude Opus 4.7 = **7.5×**, GPT-5.2 = 1×, Gemini 3 Flash = 0.33×. **Auto model selection in VS Code gets a 10% discount** on paid plans ([Requests in GitHub Copilot](https://docs.github.com/en/copilot/concepts/billing/copilot-requests)).
- **Copilot Free:** 50 premium requests/month + 2,000 inline suggestions; all chat counts as premium ([Requests in GitHub Copilot](https://docs.github.com/en/copilot/concepts/billing/copilot-requests)).
- Copilot cloud agent is **Copilot Pro+, Business, or Enterprise only** ([What is GitHub Copilot?](https://docs.github.com/en/copilot/get-started/what-is-github-copilot); [Concepts for GitHub Copilot cloud agent](https://docs.github.com/en/copilot/concepts/agents/coding-agent)).

---

## 10. Research Limitations

- **Terminology is in flux.** VS Code docs now say "agents" where GitHub.com docs and billing pages still say "modes." This report harmonizes by calling the user-facing persona choices ("Ask/Edit/Agent/Plan") *modes* when that is what the audience will see on slides, and *built-in agents* when citing VS Code's current authoritative docs.
- **"Autopilot" is a VS Code feature**, labeled **Preview** as of April 2026. Its exact behavior (auto-answer to what kinds of questions? does it stop on destructive commands?) beyond what's on the overview page was not separately documented on pages I could fetch; I did not find a dedicated Autopilot doc page.
- **`docs.github.com/en/copilot/get-started/chat-modes`** (which historical tutorials linked to) **returns 404** as of 2026-04-21. The canonical location for mode guidance has migrated into the VS Code docs (chat-modes → custom-agents) and the GitHub "concepts/agents" tree. That migration is *evidence* of the mode→agent rename but limits direct GitHub-branded documentation of each mode.
- **Edit mode's current state** was verifiable (deprecated, hidden by default) but a definitive "retirement date" was not stated.
- **GitHub Changelog entry** for "Agent mode GA in VS Code" returned a fetch failure; the GA claim is supported indirectly by the stable-documentation status of Agent and the deprecation of Edit.
- No first-party **video or blog post from 2026 Q2** was fetched; the reference list relies on live docs pages dated 4/15/2026.
- This report does **not** cover: MCP server configuration, BYOK, enterprise policy matrices in depth, or non-VS-Code IDE specifics (Visual Studio, JetBrains, Xcode) — these were out of scope for a beginner presentation on modes.

---

## 11. Complete Reference List

### Documentation & Articles (Primary — VS Code & GitHub)

- [Using agents in Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/overview) — Canonical overview: agent types, built-in agents, permission levels, handoffs.
- [Local agents in Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/local-agents) — Definitions of Agent, Plan, Ask; Edit-mode deprecation notice.
- [Planning with agents in VS Code](https://code.visualstudio.com/docs/copilot/agents/planning) — Plan agent workflow, `/plan` command, session memory.
- [Cloud agents in Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/cloud-agents) — Cloud target, Copilot cloud agent, handoffs, third-party agents.
- [Custom agents in VS Code](https://code.visualstudio.com/docs/copilot/customization/custom-agents) — `.agent.md` format, mode→agent rename, handoffs, Claude format support.
- [Chat overview](https://code.visualstudio.com/docs/copilot/chat/copilot-chat) — Session type / Agent / Permission level / Language model dimensions.
- [Manage chat sessions](https://code.visualstudio.com/docs/copilot/chat/chat-sessions) — Unified sessions list, fork, steer/queue/stop, checkpoints.
- [Concepts for GitHub Copilot cloud agent](https://docs.github.com/en/copilot/concepts/agents/coding-agent) — Official cloud-agent (formerly "coding agent") concepts.
- [Requests in GitHub Copilot](https://docs.github.com/en/copilot/concepts/billing/copilot-requests) — Premium-request accounting for Ask/Edit/Agent/Plan and cloud agent; model multipliers.
- [What is GitHub Copilot?](https://docs.github.com/en/copilot/get-started/what-is-github-copilot) — Plan-level gating for cloud agent (Pro+, Business, Enterprise).
- [GitHub Copilot features](https://docs.github.com/en/copilot/get-started/features) — Top-level feature taxonomy.
- [GitHub Copilot how-tos: Use chat](https://docs.github.com/en/copilot/how-tos/use-chat) — Chat how-to index.
- [GitHub Copilot tutorials: Copilot Chat Cookbook](https://docs.github.com/en/copilot/tutorials/copilot-chat-cookbook) — Task-oriented examples.
- [GitHub Changelog — Copilot label](https://github.blog/changelog/label/copilot/) — Running list of Copilot feature updates.

### GitHub Repositories

- *(None consulted for this report — the topic is documentation- and product-surface-driven. The VS Code docs reference the community "Awesome Copilot repository" for custom-agent examples, but that repo was not separately deep-read for this round.)*

### Code Samples

- [Planner custom agent example](https://code.visualstudio.com/docs/copilot/customization/custom-agents) — YAML/Markdown, embedded in the Custom Agents doc; shows `tools`, `model`, `handoffs`.

---

## Revision Round 2 — 2026-04-21

Addressed findings from `agent-reviews/2026-04-21-web-research-reviewer-copilot-modes.md` (Round 1, verdict: APPROVED WITH EDITS):

- 🟡 Important ✅ fixed — Executive Summary paragraphs 1–3: added inline citations for the three-dimensional chat-session model ([Chat overview](https://code.visualstudio.com/docs/copilot/chat/copilot-chat); [Using agents in Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/overview)), Edit-mode deprecation ([Local agents in Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/local-agents)), Autopilot-as-permission-level framing ([Using agents in Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/overview)), and IDE-vs-cloud billing distinctions ([Requests in GitHub Copilot](https://docs.github.com/en/copilot/concepts/billing/copilot-requests); [Cloud agents in Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/cloud-agents); [Concepts for GitHub Copilot cloud agent](https://docs.github.com/en/copilot/concepts/agents/coding-agent)).
- 🟡 Important ✅ fixed — §3 Prerequisites: added inline citations for the April 20, 2026 sign-up pause / usage-limit banner and the VS Code 1.99+ (April 2026) docs baseline.
- 🟡 Important ✅ fixed — §3 Slash shortcuts: each bundled command (`/plan`, `/fork`, `/savePrompt`, `/agents`, `/create-agent`, `/delegate`) now has an explicit source link to the VS Code docs page documenting it.
- 🟢 Minor ✅ fixed — §4 mode subsections: attached source links to the "Use it for" and "Surfaces" clusters for Ask, Agent, and Plan.
- 🟢 Minor ✅ fixed — §8 Comparison table & decision tree: added a source-synthesis note under 8.1 and 8.2 tying the synthesized clusters to their primary VS Code and GitHub docs.
- 🟢 Minor ✅ fixed — §9 Key billing facts: each bullet now has an inline citation to the `copilot-requests` page (or plan-gating source for the cloud-agent availability bullet).
- 🟢 Minor (skipped) — §11 tying consulted-only references to specific claims: left as consulted-only per the reviewer's "nice-to-have" framing; several of those pages (`features`, `what-is-github-copilot`) are now cited inline in §3 and §9 as a side effect of the must-fix citation work, reducing the consulted-only list organically.

Per user directive, the CLI-vs-VS Code nuances for modes remain clearly delineated: §6 (agent-target table) and §7 (in-IDE Agent vs. Copilot cloud agent) were not altered beyond citation additions; the Copilot CLI row and its `/delegate`-to-Cloud handoff wording are preserved verbatim.
