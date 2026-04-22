# Research Report: GitHub Copilot Customization — `copilot-instructions.md`, Custom Instructions, and Prompt Files (April 2026)

**Date:** 2026-04-21
**Researcher:** Copilot Web Researcher Agent
**Topic slug:** copilot-customization
**Sources consulted:** 10 web pages (GitHub Docs + VS Code Docs), 3 GitHub repositories (`github/awesome-copilot`, `agentsmd/agents.md`, `github.com/copilot`)

---

## Executive Summary

GitHub Copilot can be "taught" about a project, a person, or an organization through **custom instructions** — Markdown files and settings that Copilot automatically prepends to every chat request so you don't have to re-paste project context into every prompt. The most important file is `.github/copilot-instructions.md` at the root of a repository: it is the single, project-wide, always-on instruction file honored across GitHub.com Copilot Chat, Copilot cloud agent, Copilot code review, VS Code, Visual Studio, JetBrains, Eclipse, Xcode, and the Copilot CLI ([GitHub Docs — Support matrix](https://docs.github.com/en/copilot/reference/custom-instructions-support)).

Beyond that single file, Copilot recognizes several other customization surfaces a beginner should know: **personal instructions** (per-user, set in a popup on github.com/copilot — [GitHub Docs — Personal instructions](https://docs.github.com/en/copilot/customizing-copilot/adding-personal-custom-instructions-for-github-copilot)), **organization instructions** (set by org owners on Copilot Business/Enterprise plans, applied to every org member on supported GitHub.com surfaces — [GitHub Docs — Organization instructions](https://docs.github.com/en/copilot/customizing-copilot/adding-organization-custom-instructions-for-github-copilot)), **path-scoped `*.instructions.md` files** placed under `.github/instructions/` that use `applyTo:` glob frontmatter to target specific files ([VS Code Docs — Custom instructions](https://code.visualstudio.com/docs/copilot/customization/custom-instructions)), and **user-profile instruction locations** — `~/.copilot/instructions` in VS Code (via the `chat.instructionsFilesLocations` setting) and `$HOME/.copilot/copilot-instructions.md` in the Copilot CLI — which give a per-user, per-machine layer that follows you across every repo you open on that machine ([VS Code Docs — Custom instructions](https://code.visualstudio.com/docs/copilot/customization/custom-instructions), [GitHub Docs — CLI custom instructions](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-custom-instructions)). IDEs with a chat experience (VS Code, Visual Studio, JetBrains) additionally support **prompt files** (`*.prompt.md`) — reusable, *manually invoked* slash-commands for repeatable tasks like "scaffold a React form" or "review this API for security" ([VS Code Docs — Prompt files](https://code.visualstudio.com/docs/copilot/customization/prompt-files)).

The precedence, from highest to lowest, is: **Personal → Repository path-specific (`*.instructions.md`) → Repository-wide (`copilot-instructions.md`) → Agent instructions (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`) → Organization**. All applicable layers are merged and sent to the model, so conflicting rules across layers are the #1 beginner pitfall to avoid ([GitHub Docs — Response customization](https://docs.github.com/en/copilot/concepts/response-customization)).

**Caveat on surface support.** Support for each file type varies by surface (GitHub.com Chat vs. VS Code Chat vs. VS Code cloud agent vs. Copilot CLI vs. other IDEs), and the live GitHub/VS Code docs are not fully consistent on which non-`AGENTS.md` agent files (`CLAUDE.md`, `GEMINI.md`) are honored on each surface — see §6.1 and §8 for the disclosed source conflict and how this report resolves it.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Key Concepts](#2-key-concepts)
3. [Getting Started](#3-getting-started)
4. [Core Usage — Examples and Snippets](#4-core-usage--examples-and-snippets)
5. [Configuration & Best Practices](#5-configuration--best-practices)
6. [Advanced Topics — Path Scoping, Monorepos, `AGENTS.md`, CLI](#6-advanced-topics)
7. [Ecosystem & Alternatives](#7-ecosystem--alternatives)
8. [Research Limitations](#8-research-limitations)
9. [Complete Reference List](#9-complete-reference-list)

---

## 1. Overview

### What It Is

Copilot customization is the collection of files and settings that let you tell Copilot about *you*, *your project*, or *your organization* once, so those facts are injected into every chat message automatically. The three biggest beginner-facing pieces are:

- **`.github/copilot-instructions.md`** — a repository-wide Markdown file checked into the repo.
- **Personal instructions** — free-form text you save in a popup at github.com/copilot.
- **Prompt files** (`*.prompt.md`) — reusable slash commands you invoke manually in chat (IDEs only).

> "GitHub Copilot can provide responses that are tailored to your personal preferences, the way your team works, the tools you use, or the specifics of your project, if you provide it with enough context to do so. Instead of repeatedly adding this contextual detail to your prompts, you can create custom instructions that automatically add this information for you. The additional information is not displayed, but is available to Copilot to allow it to generate higher quality responses."
> — Source: [About customizing GitHub Copilot responses — GitHub Docs](https://docs.github.com/en/copilot/customizing-copilot/about-customizing-github-copilot-chat-responses)

### Why It Matters

- **Consistency** — every contributor (and every chat session) gets the same project context.
- **Less prompt typing** — you stop pasting "we use Vue 3, Tailwind, TypeScript" into every question.
- **Better PRs from Copilot cloud agent and Copilot code review** — they use `copilot-instructions.md` to avoid generating code that breaks your CI, style, or conventions.
- **Team alignment** — instructions live in Git, get code-reviewed like any other file, and evolve with the repo.

### Key Features

- Plain Markdown, no special DSL.
- Automatically picked up — no registration step.
- Works across surfaces: GitHub.com Chat, cloud agent, code review, VS Code, Visual Studio, JetBrains, Eclipse, Xcode, Copilot CLI (support varies — see §6).
- Path-scoped rules via `*.instructions.md` with `applyTo:` glob frontmatter.
- Per-IDE **prompt files** for reusable workflows.
- Personal and org-level layers that merge with repo layers.

> "Due to the non-deterministic nature of AI, Copilot may not always follow your custom instructions in exactly the same way every time they are used."
> — Source: [About customizing GitHub Copilot responses — GitHub Docs](https://docs.github.com/en/copilot/customizing-copilot/about-customizing-github-copilot-chat-responses)

---

## 2. Key Concepts

### 2.1 The four layers of custom instructions

| Layer | Where it lives | Who sets it | Scope |
|---|---|---|---|
| **Personal** | Popup at github.com/copilot → profile → *Personal instructions* | Each user, for themselves | All your Copilot Chat conversations on GitHub.com |
| **Repository-wide** | `.github/copilot-instructions.md` in the repo | Whoever can commit to the repo | Every Copilot request made in that repo's context |
| **Repository path-specific** | `.github/instructions/NAME.instructions.md` with `applyTo:` frontmatter | Committers | Only requests touching files matching the glob |
| **Organization** | Org settings → *Copilot* → *Custom instructions* | Org owners (Copilot Business/Enterprise only) | Every member of the org, everywhere the surface supports it |
| **User-profile (VS Code)** | `~/.copilot/instructions/*.instructions.md` (configurable via `chat.instructionsFilesLocations`) | Each user, for themselves, on their machine | Every VS Code Chat session on that machine, across every workspace |
| **User-profile (Copilot CLI)** | `$HOME/.copilot/copilot-instructions.md` (plus directories listed in `COPILOT_CUSTOM_INSTRUCTIONS_DIRS`) | Each user, for themselves, on their machine | Every Copilot CLI session on that machine |

Sources: [VS Code Docs — Custom instructions](https://code.visualstudio.com/docs/copilot/customization/custom-instructions) and [GitHub Docs — CLI custom instructions](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-custom-instructions).

Plus the newer **Agent instructions** files (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`) — a cross-tool standard shared with other AI coding agents (see [agentsmd/agents.md](https://github.com/agentsmd/agents.md) for the cross-vendor convention).

### 2.2 Precedence and merging

> "Multiple types of custom instructions can apply to a request sent to Copilot. Personal instructions take the highest priority. Repository instructions come next, and then organization instructions are prioritized last. However, all sets of relevant instructions are provided to Copilot."
> — Source: [About customizing GitHub Copilot responses — GitHub Docs](https://docs.github.com/en/copilot/customizing-copilot/about-customizing-github-copilot-chat-responses)

The complete order (higher = wins on conflict, but **all are still sent**):

```
1. Personal instructions
2. Repository custom instructions
   2a. Path-specific instructions (.github/instructions/**/*.instructions.md)
   2b. Repository-wide (.github/copilot-instructions.md)
3. Agent instructions (AGENTS.md / CLAUDE.md / GEMINI.md)
4. Organization custom instructions
```
> — Source: [About customizing GitHub Copilot responses — GitHub Docs](https://docs.github.com/en/copilot/customizing-copilot/about-customizing-github-copilot-chat-responses) | Provenance: synthesized ordered list derived from the docs' precedence prose

### 2.3 Instructions vs. Prompt files — the beginner's mental model

- **Custom instructions** are *automatic* and *always-on*. Copilot reads them on every turn; you never type their name.
- **Prompt files** are *manual*. You invoke them with a slash command (`/review-api`, `/scaffold-form`) when you want that specific task.

> "While custom instructions help to add codebase-wide context to each AI workflow, prompt files let you add instructions to a specific chat interaction."
> — Source: [About customizing GitHub Copilot responses — GitHub Docs](https://docs.github.com/en/copilot/customizing-copilot/about-customizing-github-copilot-chat-responses)

> "Unlike custom instructions that are applied automatically, you invoke prompt files manually in chat."
> — Source: [Use prompt files in VS Code — Visual Studio Code Docs](https://code.visualstudio.com/docs/copilot/customization/prompt-files)

### 2.4 Decision guide — which one should I use?

```
Is it about ME (how I like answers)?              → Personal instructions
Is it about THIS REPO (stack, conventions)?       → .github/copilot-instructions.md
Does it only apply to certain files/folders?      → .github/instructions/*.instructions.md  (applyTo glob)
Is it a repeatable task I want to trigger?        → *.prompt.md prompt file (IDE)
Does it apply to the WHOLE ORG?                   → Org settings → Copilot → Custom instructions
```
> — Source: [About customizing GitHub Copilot responses — GitHub Docs](https://docs.github.com/en/copilot/customizing-copilot/about-customizing-github-copilot-chat-responses) and [Support for different types of custom instructions — GitHub Docs](https://docs.github.com/en/copilot/reference/custom-instructions-support) | Provenance: synthesized decision guide

---

## 3. Getting Started

### Prerequisites

- A repository you can commit to (for `copilot-instructions.md` and `*.instructions.md`).
- A GitHub Copilot subscription (Free, Pro, Business, or Enterprise). Org instructions require Copilot Business or Enterprise.
- For IDE prompt files: VS Code, Visual Studio, or a JetBrains IDE with the Copilot extension installed.

### Create `.github/copilot-instructions.md` (the universal starting point)

#### Terminal commands (macOS / Linux / WSL — bash/zsh)

```bash
# From the repository root
mkdir -p .github
touch .github/copilot-instructions.md

# Open and edit
code .github/copilot-instructions.md

# Commit it like any other file
git add .github/copilot-instructions.md
git commit -m "Add Copilot repository instructions"
git push
```
> — Source: synthesized from the [Adding repository custom instructions — GitHub Docs](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot) instruction to "create a file named `copilot-instructions.md` in the `.github` directory of a repository" | Provenance: synthesized

#### Windows PowerShell equivalents

```powershell
# From the repository root
New-Item -ItemType Directory -Force -Path .github | Out-Null
New-Item -ItemType File -Force -Path .github\copilot-instructions.md | Out-Null

# Open and edit
code .github\copilot-instructions.md

# Commit it like any other file
git add .github/copilot-instructions.md
git commit -m "Add Copilot repository instructions"
git push
```
> — Source: synthesized from the same GitHub Docs page above | Provenance: synthesized (PowerShell equivalent for Windows users)

#### Let Copilot generate it for you

In VS Code (Chat view) or on github.com/copilot, type `/init` to have Copilot analyze your repo and draft a `.github/copilot-instructions.md` tailored to your codebase.

> "Initialize your project : type /init in chat to generate a .github/copilot-instructions.md file with coding standards tailored to your codebase."
> — Source: [Customize AI in Visual Studio Code — Visual Studio Code Docs](https://code.visualstudio.com/docs/copilot/customization/overview)

You can also ask Copilot cloud agent on github.com/copilot/agents to onboard the repo for you — GitHub publishes an official onboarding prompt for this ([Adding repository custom instructions — GitHub Docs](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot)).

### Add personal instructions (GitHub.com only)

1. Open [github.com/copilot](https://github.com/copilot).
2. Click your profile picture in the bottom-left corner of Copilot Chat.
3. Click **Personal instructions**.
4. Paste natural-language preferences. Click **Save**.

> "Personal custom instructions apply to every conversation you have on the GitHub website, so Copilot always responds in your preferred language, tone, and style."
> — Source: [Adding personal custom instructions — GitHub Docs](https://docs.github.com/en/copilot/customizing-copilot/adding-personal-custom-instructions-for-github-copilot)

### Add organization instructions (org owners only)

Organizations → (select org) → **Settings** → **Copilot** → **Custom instructions** → paste text → **Save changes** ([Adding organization custom instructions — GitHub Docs](https://docs.github.com/en/copilot/customizing-copilot/adding-organization-custom-instructions-for-github-copilot)).

> "Support: Organization custom instructions are currently only supported for Copilot Chat on GitHub.com, Copilot code review on GitHub.com and Copilot cloud agent on GitHub.com."
> — Source: [Adding organization custom instructions — GitHub Docs](https://docs.github.com/en/copilot/customizing-copilot/adding-organization-custom-instructions-for-github-copilot)

---

## 4. Core Usage — Examples and Snippets

### 4.1 A good `.github/copilot-instructions.md` (slide-ready example)

This is the canonical example published by GitHub as a model of the recommended structure (overview → folder structure → stack → coding standards → UI guidelines):

```markdown
# Project Overview

This project is a web application that allows users to manage their
tasks and to-do lists. It is built using React and Node.js, and uses
MongoDB for data storage.

## Folder Structure

- `/src`: Contains the source code for the frontend.
- `/server`: Contains the source code for the Node.js backend.
- `/docs`: Contains documentation for the project, including API
  specifications and user guides.

## Libraries and Frameworks

- React and Tailwind CSS for the frontend.
- Node.js and Express for the backend.
- MongoDB for data storage.

## Coding Standards

- Use semicolons at the end of each statement.
- Use single quotes for strings.
- Use function based components in React.
- Use arrow functions for callbacks.

## UI guidelines

- A toggle is provided to switch between light and dark mode.
- Application should have a modern and clean design.
```

> — Source: [About customizing GitHub Copilot responses — GitHub Docs](https://docs.github.com/en/copilot/customizing-copilot/about-customizing-github-copilot-chat-responses) | Provenance: verbatim example published by GitHub

### 4.2 A short, Xcode/Eclipse-style `copilot-instructions.md` (three rules)

```markdown
We use Bazel for managing our Java dependencies, not Maven, so when
talking about Java packages, always give me instructions and code
samples that use Bazel.

We always write JavaScript with double quotes and tabs for indentation,
so when your responses include JavaScript code, please follow those
conventions.

Our team uses Jira for tracking items of work.
```

> — Source: [About customizing GitHub Copilot responses — GitHub Docs](https://docs.github.com/en/copilot/customizing-copilot/about-customizing-github-copilot-chat-responses) | Provenance: verbatim

### 4.3 A path-scoped `*.instructions.md` file

Path: `.github/instructions/typescript.instructions.md`

```markdown
---
applyTo: "**/*.ts,**/*.tsx"
---

# Project coding standards for TypeScript and React

Apply the [general coding guidelines](./general-coding.instructions.md)
to all code.

## TypeScript Guidelines
- Use TypeScript for all new code
- Follow functional programming principles where possible
- Use interfaces for data structures and type definitions
- Prefer immutable data (const, readonly)
- Use optional chaining (?.) and nullish coalescing (??) operators

## React Guidelines
- Use functional components with hooks
- Follow the React hooks rules (no conditional hooks)
- Use React.FC type for components with children
- Keep components small and focused
- Use CSS modules for component styling
```

> — Source: [Use custom instructions in VS Code — Visual Studio Code Docs](https://code.visualstudio.com/docs/copilot/customization/custom-instructions) | Provenance: verbatim

**Glob patterns** recognized in `applyTo:` ([GitHub Docs — Add repository instructions](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot)):

| Pattern | Matches |
|---|---|
| `*` | All files in the current directory |
| `**` or `**/*` | All files in all directories |
| `*.py` | All `.py` files in the current directory |
| `**/*.py` | Recursively, all `.py` files |
| `src/*.py` | `.py` files directly in `src/` (e.g. `src/foo.py` — **not** `src/foo/bar.py`) |
| `src/**/*.py` | Recursively, all `.py` files under `src/` |
| `**/subdir/**/*.py` | Any `.py` at any depth inside any folder named `subdir` |

Separate multiple patterns with commas: `applyTo: "**/*.ts,**/*.tsx"`.

### 4.4 A prompt file (`*.prompt.md`) — VS Code

Path: `.github/prompts/new-react-form.prompt.md`

```markdown
---
agent: 'agent'
model: GPT-4o
tools: ['search/codebase', 'vscode/askQuestions']
description: 'Generate a new React form component'
---

Your goal is to generate a new React form component based on the
templates in the Github repo contoso/react-templates. Use the
#tool:vscode/askQuestions to ask for the form name and fields if not
provided.

Requirements for the form:
* Use form design system components: [design-system/Form.md](../docs/design-system/Form.md)
* Use `react-hook-form` for form state management:
  * Always define TypeScript types for your form data
  * Prefer *uncontrolled* components using register
  * Use `defaultValues` to prevent unnecessary rerenders
* Use `yup` for validation:
  * Create reusable validation schemas in separate files
  * Use TypeScript types to ensure type safety
  * Customize UX-friendly validation rules
```

> — Source: [Use prompt files in VS Code — Visual Studio Code Docs](https://code.visualstudio.com/docs/copilot/customization/prompt-files) | Provenance: verbatim

**Prompt-file frontmatter fields** ([VS Code Docs — Prompt files](https://code.visualstudio.com/docs/copilot/customization/prompt-files)):

| Field | Required | Purpose |
|---|---|---|
| `description` | No | Short description |
| `name` | No | Name used after typing `/` in chat (defaults to filename) |
| `argument-hint` | No | Hint text shown in chat input |
| `agent` | No | `ask`, `agent`, `plan`, or a custom agent name |
| `model` | No | Language model to use |
| `tools` | No | List of tools / tool sets / MCP tools available to the prompt |

**How to invoke a prompt file in VS Code:**
1. Type `/` in the chat input and choose the prompt (you can pass args: `/new-react-form formName=Signup`).
2. Or run **Chat: Run Prompt** from the Command Palette (`Ctrl+Shift+P`).
3. Or open the `.prompt.md` file and click the ▶ play button in the editor title bar.

### 4.5 Personal instruction examples (one-liners, slide-friendly)

From [Adding personal custom instructions — GitHub Docs](https://docs.github.com/en/copilot/customizing-copilot/adding-personal-custom-instructions-for-github-copilot):

- `Always respond in Spanish.`
- `Use a helpful, collegial tone.`
- `Keep explanations brief, but provide enough context to understand the code.`
- `Always provide examples in TypeScript.`

### 4.6 Organization instruction examples

From [About customizing GitHub Copilot responses — GitHub Docs](https://docs.github.com/en/copilot/customizing-copilot/about-customizing-github-copilot-chat-responses):

- `Always respond in Spanish.`
- `Do not generate code blocks in responses.`
- `For questions related to security, use the Security Docs Knowledge Base.`

---

## 5. Configuration & Best Practices

### 5.1 How Copilot picks up the files (no registration needed)

> "The instructions in the file(s) are available for use by Copilot as soon as you save the file(s). Instructions are automatically added to requests that you submit to Copilot."
> — Source: [Adding repository custom instructions for GitHub Copilot — GitHub Docs](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot)

In VS Code Chat, you can confirm they were used by expanding the **References** section above a response and checking that `.github/copilot-instructions.md` is listed.

For Copilot code review on a pull request, Copilot reads the instructions from the **base branch** (not the feature branch):

> "When reviewing a pull request, Copilot uses the custom instructions in the base branch of the pull request. For example, if your pull request seeks to merge my-feature-branch into main, Copilot will use the custom instructions in main."
> — Source: [Adding repository custom instructions for GitHub Copilot — GitHub Docs](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot)

### 5.2 Size and scope limits

- **Copilot code review** reads **only the first 4,000 characters** of any custom instruction file. Anything beyond is ignored for code review (but still used by Chat and cloud agent).

> "Copilot code review only reads the first 4,000 characters of any custom instruction file. Any instructions beyond this limit will not affect the reviews generated by Copilot code review. This limit does not apply to Copilot Chat or Copilot cloud agent."
> — Source: [About customizing GitHub Copilot responses — GitHub Docs](https://docs.github.com/en/copilot/customizing-copilot/about-customizing-github-copilot-chat-responses)

- GitHub's official cloud-agent onboarding prompt instructs the agent to produce files that are **no longer than 2 pages** and **not task-specific** ([GitHub Docs — Add repository instructions](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot)).

### 5.3 Writing effective instructions — official guidance

> "The instructions you add to your custom instruction file(s) should be short, self-contained statements that provide Copilot with relevant information to help it work in this repository. Because the instructions are sent with every chat message, they should be broadly applicable to most requests you will make in the context of the repository."
> — Source: [About customizing GitHub Copilot responses — GitHub Docs](https://docs.github.com/en/copilot/customizing-copilot/about-customizing-github-copilot-chat-responses)

A good starting structure:
1. Project overview — purpose, goals, background
2. Folder structure — key directories and what's in them
3. Coding standards — naming, formatting, patterns
4. Tools, libraries, frameworks — with version numbers where relevant

### 5.4 Common pitfalls and anti-patterns

GitHub explicitly warns these kinds of instructions **may not have the intended result**, especially in large repos:

> "Always conform to the coding styles defined in styleguide.md in repo my-org/my-repo when generating code."
> "Use @terminal when answering questions about Git."
> "Answer all questions in the style of a friendly colleague, using informal language."
> "Answer all questions in less than 1000 characters, and words of no more than 12 characters."
> — Source: [About customizing GitHub Copilot responses — GitHub Docs](https://docs.github.com/en/copilot/customizing-copilot/about-customizing-github-copilot-chat-responses)

The categories to avoid:

- Requests to refer to **external resources** when formulating a response.
- Instructions to answer in a particular **style**.
- Requests to always respond with a certain **level of detail**.

Other beginner mistakes synthesized from the official docs (each cross-referenced to its primary source):

- **Wrong file path.** The repository-wide file must be at `.github/copilot-instructions.md`; the docs specify creating "a file named `copilot-instructions.md` in the `.github` directory of a repository" ([Adding repository custom instructions — GitHub Docs](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot)).
- **Wrong extension for path-specific files.** The docs require the `.instructions.md` suffix: "create one or more `NAME.instructions.md` files" stored under `.github/instructions/` ([Adding repository custom instructions — GitHub Docs](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot); [VS Code Docs — Custom instructions](https://code.visualstudio.com/docs/copilot/customization/custom-instructions)).
- **Conflicting layers.** All applicable layers are sent to Copilot together — "all sets of relevant instructions are provided to Copilot" ([About customizing GitHub Copilot responses — GitHub Docs](https://docs.github.com/en/copilot/customizing-copilot/about-customizing-github-copilot-chat-responses)) — and because of non-determinism "Copilot may not always follow your custom instructions in exactly the same way every time" (same page). Directly contradictory rules across layers therefore produce inconsistent output.
- **Too long / too vague.** The docs explicitly call for instructions that are "short, self-contained statements" ([About customizing GitHub Copilot responses — GitHub Docs](https://docs.github.com/en/copilot/customizing-copilot/about-customizing-github-copilot-chat-responses)), and GitHub's own cloud-agent onboarding prompt caps generated files at roughly two pages ([Adding repository custom instructions — GitHub Docs](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot)).
- **Task-specific rules in the always-on file.** The docs distinguish always-on custom instructions from prompt files, which "let you add instructions to a specific chat interaction" ([About customizing GitHub Copilot responses — GitHub Docs](https://docs.github.com/en/copilot/customizing-copilot/about-customizing-github-copilot-chat-responses)); task-specific workflows belong in a `*.prompt.md` file, not in `copilot-instructions.md`.

### 5.5 Enabling / disabling at the repo level

Custom instructions for **Copilot code review** can be toggled per repo:
Repository → **Settings** → **Code & automation** → **Copilot** → **Code review** → toggle *"Use custom instructions when reviewing pull requests"* ([GitHub Docs — Add repository instructions](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot)).

### 5.6 VS Code settings reference

Key `settings.json` keys from the VS Code customization docs:

```jsonc
{
  // Discover customizations in the parent repo (monorepo subfolder case)
  "chat.useCustomizationsInParentRepositories": true,

  // Control AGENTS.md support
  "chat.useAgentsMdFile": true,
  "chat.useNestedAgentsMdFiles": false,   // experimental
  "chat.useClaudeMdFile": true,

  // Override default locations for instructions files
  "chat.instructionsFilesLocations": {
    ".github/instructions": true,
    ".claude/rules": true,
    "~/.copilot/instructions": false,
    "~/.claude/rules": false
  },

  // Override default locations for prompt files
  "chat.promptFilesLocations": { ".github/prompts": true },

  // Recommend prompt files in new chat sessions
  "chat.promptFilesRecommendations": true
}
```

> — Source: [Use custom instructions in VS Code — Visual Studio Code Docs](https://code.visualstudio.com/docs/copilot/customization/custom-instructions) and [Use prompt files in VS Code](https://code.visualstudio.com/docs/copilot/customization/prompt-files) | Provenance: verbatim keys

---

## 6. Advanced Topics

### 6.1 Support matrix — who reads what

The single most-asked question for beginners is "does my surface even read this file?" Here is the current support matrix (April 2026):

| Surface | Personal | `.github/copilot-instructions.md` | `.github/instructions/*.instructions.md` | `AGENTS.md` / `CLAUDE.md` / `GEMINI.md` | Organization |
|---|---|---|---|---|---|
| **GitHub.com — Copilot Chat** | ✅ | ✅ | ❌ | ❌ | ✅ |
| **GitHub.com — Copilot cloud agent** | — | ✅ | ✅ | ✅ | ✅ |
| **GitHub.com — Copilot code review** | — | ✅ (first 4 000 chars) | ✅ | ❌ | ✅ |
| **VS Code — Chat** | — | ✅ | ✅ | ✅ (`AGENTS.md` per matrix; `CLAUDE.md` per VS Code docs — see conflict note below) | — |
| **VS Code — cloud agent** | — | ✅ | ✅ | ✅ (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md` — matrix + tool-specific docs agree) | — |
| **VS Code — code review** | — | ✅ | ❌ | ❌ | — |
| **Visual Studio — Chat** | — | ✅ | ✅ | ❌ | — |
| **JetBrains — Chat** | — | ✅ | ✅ | ❌ | — |
| **Eclipse — Chat** | — | ✅ | ❌ | ❌ | — |
| **Xcode — Chat** | — | ✅ | ✅ | ❌ | — |
| **Copilot CLI** | — | ✅ | ✅ | ✅ (`AGENTS.md`; per the CLI how-to also `CLAUDE.md`/`GEMINI.md` — see conflict note below) | — |

Source: [Support for different types of custom instructions — GitHub Docs](https://docs.github.com/en/copilot/reference/custom-instructions-support).

**⚠️ Source conflict disclosure — agent instruction files across surfaces.** *(Last re-checked against the live support-matrix page on 2026-04-21.)* The live GitHub/VS Code docs are **mostly** consistent, but a narrower disagreement remains for two surfaces:

- **VS Code cloud agent — now aligned.** The [support-matrix page](https://docs.github.com/en/copilot/reference/custom-instructions-support) currently lists "Agent instructions (using `AGENTS.md`, `CLAUDE.md` or `GEMINI.md` files)" for VS Code cloud agent, matching the [VS Code custom-instructions docs](https://code.visualstudio.com/docs/copilot/customization/custom-instructions). No conflict here as of 2026-04-21.
- **VS Code Chat — still mismatched.** The support-matrix page lists only "Agent instructions (using an `AGENTS.md` file)" for VS Code Copilot Chat, while the [VS Code custom-instructions docs](https://code.visualstudio.com/docs/copilot/customization/custom-instructions) additionally document a `chat.useClaudeMdFile` setting, implying first-class `CLAUDE.md` support in VS Code Chat.
- **Copilot CLI — still mismatched.** The support-matrix page lists only "Agent instructions (using an `AGENTS.md` file)" for the Copilot CLI, while the [Copilot CLI how-to](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-custom-instructions) documents both `CLAUDE.md` and `GEMINI.md` as recognized agent files in the CLI, alongside `AGENTS.md`.

**How this report resolves the remaining conflict.** Because the tool-specific pages (VS Code custom-instructions and the CLI how-to) are closer to the implementation than the consolidated matrix page, this report treats them as the more authoritative source for VS Code Chat and Copilot CLI, and treats the matrix page as a simplified summary that lags tool-specific detail on those two rows only. Practically: assume `AGENTS.md` is broadly supported; assume `CLAUDE.md` is also honored in VS Code Chat and Copilot CLI; assume `GEMINI.md` is honored in Copilot CLI. For VS Code cloud agent the matrix and tool-specific docs now agree, so that row carries no open uncertainty. This is reiterated as a research limitation in §8.

**Takeaways for beginners:**
- `.github/copilot-instructions.md` is the one file that works **everywhere**.
- Personal instructions only work on **github.com/copilot Chat**.
- Organization instructions only work on **github.com** surfaces.
- Path-specific `*.instructions.md` files are **not** read by GitHub.com Copilot Chat, only by cloud agent / code review / IDEs.
- **Prompt files** (`*.prompt.md`) are IDE-only (VS Code, Visual Studio, JetBrains).

> "Prompt files are only available in VS Code, Visual Studio, and JetBrains IDEs."
> — Source: [About customizing GitHub Copilot responses — GitHub Docs](https://docs.github.com/en/copilot/customizing-copilot/about-customizing-github-copilot-chat-responses)

### 6.2 `AGENTS.md` — the cross-tool agent-instructions standard

> "Agent instructions are used by AI agents. You can create one or more AGENTS.md files, stored anywhere within the repository. When Copilot is working, the nearest AGENTS.md file in the directory tree will take precedence."
> — Source: [Adding repository custom instructions for GitHub Copilot — GitHub Docs](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot)

`AGENTS.md` is an emerging cross-tool convention published at [agentsmd/agents.md](https://github.com/agentsmd/agents.md) and adopted by multiple AI coding agents, so a repo can ship one set of instructions consumed by several tools. If both `AGENTS.md` (at repo root) and `.github/copilot-instructions.md` are present, **Copilot CLI uses both**:

> "If an AGENTS.md file and a .github/copilot-instructions.md file are both found at the root of the repository, the instructions in both files are used."
> — Source: [Adding custom instructions for GitHub Copilot CLI — GitHub Docs](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-custom-instructions)

### 6.3 Path-specific instructions: `excludeAgent`

You can exclude a `*.instructions.md` file from either cloud agent or code review:

```markdown
---
applyTo: "**"
excludeAgent: "code-review"
---

# These rules are only for Copilot cloud agent, not code review.
```
> — Source: [Adding repository custom instructions for GitHub Copilot — GitHub Docs](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot) | Provenance: synthesized (minimal illustrative example of the documented `excludeAgent` field)

Valid values are `"code-review"` and `"cloud-agent"` ([GitHub Docs — Add repository instructions](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot)).

### 6.4 Monorepos: parent-repo discovery in VS Code

By default, VS Code only discovers customization files under the currently opened workspace folder. For monorepos where you open a subfolder, enable:

```jsonc
"chat.useCustomizationsInParentRepositories": true
```
> — Source: [Customize AI in Visual Studio Code — Visual Studio Code Docs](https://code.visualstudio.com/docs/copilot/customization/overview) | Provenance: verbatim setting key

> "When this setting is enabled,VS Code walks up the folder hierarchy from each workspace folder until it finds a .git folder. If found, it collects customizations from all folders between the workspace folder and the repository root (inclusive). This applies to all customization types: always-on instructions (copilot-instructions.md, AGENTS.md, CLAUDE.md), file-based instructions, prompt files, custom agents, agent skills, and hooks."
> — Source: [Customize AI in Visual Studio Code — Visual Studio Code Docs](https://code.visualstudio.com/docs/copilot/customization/overview)

### 6.5 Copilot CLI specifics

The Copilot CLI reads a distinct set of locations, including a **per-user** local instructions file at `$HOME/.copilot/copilot-instructions.md` — which is the CLI's closest equivalent to "personal instructions." The CLI docs also document the `COPILOT_CUSTOM_INSTRUCTIONS_DIRS` environment variable, a comma-separated list of directories in which the CLI looks for `AGENTS.md` and `.github/instructions/**/*.instructions.md` files. VS Code has a parallel user-scope mechanism: the default `chat.instructionsFilesLocations` map includes `~/.copilot/instructions` and `~/.claude/rules` (both off by default), which users can enable to get a per-machine instruction layer that applies across every workspace.

> "You can specify instructions within your own home directory, by creating a file at `$HOME/.copilot/copilot-instructions.md`."
> — Source: [Adding custom instructions for GitHub Copilot CLI — GitHub Docs](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-custom-instructions)

**Scope differences between CLI and VS Code (a common beginner confusion):**

| Feature | VS Code Chat | Copilot CLI |
|---|---|---|
| `.github/copilot-instructions.md` | ✅ | ✅ |
| `.github/instructions/*.instructions.md` (`applyTo`) | ✅ | ✅ |
| `AGENTS.md` | ✅ | ✅ |
| `CLAUDE.md` | ✅ (documented by VS Code custom-instructions page via `chat.useClaudeMdFile`; ⚠️ not reflected in the consolidated matrix page) | ✅ (documented by CLI how-to; ⚠️ not reflected in the consolidated matrix page) |
| `GEMINI.md` | ❌ (not documented) | ✅ (documented by CLI how-to; ⚠️ not reflected in the consolidated matrix page) |
| Prompt files (`*.prompt.md`) | ✅ | ❌ (use custom agents / skills instead) |
| Personal instructions (github.com popup) | ❌ | ❌ |
| User-profile instructions | ✅ `~/.copilot/instructions` (off by default; enable via `chat.instructionsFilesLocations`) | ✅ `$HOME/.copilot/copilot-instructions.md` (plus `COPILOT_CUSTOM_INSTRUCTIONS_DIRS`) |
| Organization instructions | ❌ | ❌ |

Sources: [Support for different types of custom instructions — GitHub Docs](https://docs.github.com/en/copilot/reference/custom-instructions-support), [Use custom instructions in VS Code — VS Code Docs](https://code.visualstudio.com/docs/copilot/customization/custom-instructions), and [Adding custom instructions for GitHub Copilot CLI — GitHub Docs](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-custom-instructions). **Per-surface provenance for the `CLAUDE.md` / `GEMINI.md` rows (re-checked 2026-04-21):** for **VS Code Chat**, `CLAUDE.md` is documented by the tool-specific VS Code page only — the consolidated matrix still lists `AGENTS.md` only. For **Copilot CLI**, both `CLAUDE.md` and `GEMINI.md` are documented by the tool-specific CLI how-to only — the consolidated matrix still lists `AGENTS.md` only. For **VS Code cloud agent** (not shown in this table but relevant context), the consolidated matrix now lists `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md`, matching the tool-specific docs, so no conflict remains on that row. See the conflict-disclosure note in §6.1 for how these rows were resolved.

### 6.6 Generating instructions and prompts with AI (VS Code slash commands)

VS Code ships several `/create-*` commands that ask clarifying questions and write files for you:

- `/init` — generate a workspace `.github/copilot-instructions.md`.
- `/create-instruction` — generate a targeted `*.instructions.md` file with the right `applyTo`.
- `/create-prompt` — generate a `*.prompt.md` from a description.
- Also `/create-skill`, `/create-agent`, `/create-hook` (out of scope here).

> "/create-instruction generates targeted, on-demand instruction files. To generate workspace-wide always-on instructions, use the /init command instead."
> — Source: [Use custom instructions in VS Code — Visual Studio Code Docs](https://code.visualstudio.com/docs/copilot/customization/custom-instructions)

### 6.7 Using input variables in prompt files

Prompt files support interactive inputs:

> "If you want the user to provide additional information, you can use the vscode/askQuestion tool. You can also use a syntax like ${input:variableName}, ${input:variableName:placeholder}. Most language models understand this syntax and will prompt for these inputs."
> — Source: [Use prompt files in VS Code — Visual Studio Code Docs](https://code.visualstudio.com/docs/copilot/customization/prompt-files)

---

## 7. Ecosystem & Alternatives

- **Awesome Copilot repo** — `github/awesome-copilot` is GitHub's curated community collection of example `copilot-instructions.md`, `*.instructions.md`, and `*.prompt.md` files. The official docs point here for "community-contributed examples" ([`github/awesome-copilot`](https://github.com/github/awesome-copilot)).
- **`AGENTS.md` standard** — a cross-vendor convention, see the [agentsmd/agents.md repo](https://github.com/agentsmd/agents.md) referenced by GitHub Docs.
- **Copilot Spaces** — a separate GitHub.com feature that lets you curate documents, repos, and instructions for a task-focused chat. Complementary to `copilot-instructions.md`; out of scope here.
- **Custom agents, agent skills, hooks, MCP servers** — deeper customization (define personas, run shell hooks, connect external tools). Out of scope for beginner customization; covered separately in the VS Code customization hub ([overview](https://code.visualstudio.com/docs/copilot/customization/overview)).

**When do you pick which?**

| Goal | Use |
|---|---|
| Tell Copilot how you personally like answers (tone, language) | Personal instructions |
| Encode project stack/conventions for every contributor | `.github/copilot-instructions.md` |
| Different rules for frontend vs. backend in a monorepo | Multiple `*.instructions.md` files with `applyTo` |
| Reusable "generate component X" / "review API for Y" workflow | `*.prompt.md` in `.github/prompts/` (IDE) |
| Cross-tool agent instructions (Copilot + Claude + Gemini) | `AGENTS.md` |
| Apply across every repo in a company | Organization custom instructions (Business/Enterprise) |
| Persistent agent persona with tool restrictions | Custom agent (out of scope) |

> "Prompt files, agents, or skills? Use prompt files for lightweight, single-task prompts. Use custom agents when you need a persistent persona with its own tool restrictions and handoffs. Use agent skills when you need a portable, multi-file capability with scripts and resources."
> — Source: [Use prompt files in VS Code — Visual Studio Code Docs](https://code.visualstudio.com/docs/copilot/customization/prompt-files)

---

## 8. Research Limitations

- **Unresolved docs inconsistency on agent-instruction support for VS Code Chat and Copilot CLI (most consequential limitation; re-checked 2026-04-21).** The consolidated [support-matrix page](https://docs.github.com/en/copilot/reference/custom-instructions-support) currently lists only `AGENTS.md` as the agent-instruction file for **VS Code Copilot Chat** and for the **Copilot CLI**, while the tool-specific [VS Code custom-instructions docs](https://code.visualstudio.com/docs/copilot/customization/custom-instructions) separately document `CLAUDE.md` support in VS Code Chat (via `chat.useClaudeMdFile`), and the [Copilot CLI how-to](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-custom-instructions) separately documents both `CLAUDE.md` and `GEMINI.md` support in the CLI. For **VS Code cloud agent**, the matrix now lists `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md`, matching the tool-specific docs — so that row is no longer part of the conflict. This report favored the tool-specific pages over the matrix for VS Code Chat and Copilot CLI (see the conflict-disclosure note in §6.1); readers should re-check the specific page for their surface before relying on non-`AGENTS.md` agent files there.
- **Cheat sheet page unreachable.**The docs link for "Copilot customization cheat sheet" (`/en/copilot/tutorials/copilot-customization-cheat-sheet`) returned 404 at the time of research; references to it in other docs pages imply it exists under a different slug. Information in this report was cross-checked against the pages that *did* resolve.
- **GitHub Changelog was not crawled.** The user context mentioned GitHub Changelog as a primary source; this research relied on GitHub Docs and VS Code Docs (which are the canonical documentation) and did not sweep the blog/changelog. Any *very recent* (days-old) feature changes between 2026-04-15 (the VS Code docs' last-updated date) and 2026-04-21 may not be reflected.
- **Awesome Copilot repo** was identified but not deeply sampled — specific example files inside it were not read in this pass. Use it as a pointer for slide-ready examples, but verify each snippet against current docs.
- **Visual Studio and JetBrains**: details are inferred from the "About customizing" docs and the support matrix; IDE-specific UIs (menu paths) were not separately fetched and may differ slightly in the current release.
- **Non-determinism caveat.** All sources repeatedly emphasize that Copilot may not follow instructions identically each time. Treat custom instructions as *strong hints*, not contracts.
- **Prompt file availability.** On github.com itself, only prompt-file-like functionality is currently exposed through Copilot Spaces / custom agents, not via `*.prompt.md` files. Prompt files as described here are IDE-only.

---

## 9. Complete Reference List

### Documentation & Articles

- [About customizing GitHub Copilot responses — GitHub Docs](https://docs.github.com/en/copilot/customizing-copilot/about-customizing-github-copilot-chat-responses) — Canonical overview of all instruction types, precedence rules, and writing guidance across all IDEs.
- [Adding repository custom instructions for GitHub Copilot — GitHub Docs](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot) — How to create `copilot-instructions.md` and `*.instructions.md`, glob syntax, `excludeAgent`, and the cloud-agent onboarding prompt.
- [Adding personal custom instructions for GitHub Copilot — GitHub Docs](https://docs.github.com/en/copilot/customizing-copilot/adding-personal-custom-instructions-for-github-copilot) — Step-by-step for personal instructions on github.com/copilot.
- [Adding organization custom instructions for GitHub Copilot — GitHub Docs](https://docs.github.com/en/copilot/customizing-copilot/adding-organization-custom-instructions-for-github-copilot) — Org-owner procedure and supported surfaces.
- [Support for different types of custom instructions — GitHub Docs](https://docs.github.com/en/copilot/reference/custom-instructions-support) — Consolidated support matrix per IDE / feature (with known simplifications vs. tool-specific pages — see §6.1).
- [Response customization (Concepts) — GitHub Docs](https://docs.github.com/en/copilot/concepts/response-customization) — Concept overview (same canonical content, different navigation).
- [Adding custom instructions for GitHub Copilot CLI — GitHub Docs](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-custom-instructions) — CLI-specific locations including `$HOME/.copilot/copilot-instructions.md`, `COPILOT_CUSTOM_INSTRUCTIONS_DIRS`, and documented `AGENTS.md` / `CLAUDE.md` / `GEMINI.md` support.
- [Customize AI in Visual Studio Code — Visual Studio Code Docs](https://code.visualstudio.com/docs/copilot/customization/overview) — VS Code customization landing page; `/init`, `/create-*` commands, parent-repo discovery for monorepos.
- [Use custom instructions in VS Code — Visual Studio Code Docs](https://code.visualstudio.com/docs/copilot/customization/custom-instructions) — Definitive VS Code reference on always-on vs. file-based instructions, `applyTo`, settings keys, `AGENTS.md` / `CLAUDE.md`.
- [Use prompt files in VS Code — Visual Studio Code Docs](https://code.visualstudio.com/docs/copilot/customization/prompt-files) — Prompt file format, frontmatter, invocation, input variables, syncing.

### GitHub Repositories

- [github/awesome-copilot](https://github.com/github/awesome-copilot) — Curated community collection of `copilot-instructions.md`, `*.instructions.md`, and `*.prompt.md` examples. Referenced from the official docs.
- [agentsmd/agents.md](https://github.com/agentsmd/agents.md) — Cross-vendor `AGENTS.md` convention referenced from GitHub Docs and adopted by multiple AI coding agents.
- [github.com/copilot](https://github.com/copilot) — GitHub.com Copilot Chat entry point where personal instructions are configured via the profile popup.

### Code Samples (verbatim examples cited inline)

- "Project Overview (React + Node.js + MongoDB) `copilot-instructions.md` template" — Markdown, canonical repo-wide instructions example — inside [About customizing GitHub Copilot responses — GitHub Docs](https://docs.github.com/en/copilot/customizing-copilot/about-customizing-github-copilot-chat-responses).
- "Three-rule Bazel/JS/Jira example `copilot-instructions.md`" — Markdown, minimal instructions example — inside the Xcode tab of the same docs page above.
- "TypeScript + React path-scoped `*.instructions.md`" — Markdown with `applyTo` frontmatter — inside [Use custom instructions in VS Code — Visual Studio Code Docs](https://code.visualstudio.com/docs/copilot/customization/custom-instructions).
- "New React form `*.prompt.md` and REST API security review `*.prompt.md`" — Markdown with agent/model/tools frontmatter — inside [Use prompt files in VS Code — Visual Studio Code Docs](https://code.visualstudio.com/docs/copilot/customization/prompt-files).

---

## Revision Round 2 — 2026-04-21

Findings from `agent-reviews/2026-04-21-web-research-reviewer-copilot-customization.md` Review Round 1 addressed:

**🟡 Important (all ✅ fixed):**
- ✅ fixed — §6.1 + §6.5 + §8: Disclosed the source conflict between the consolidated support-matrix page (collapses agent instructions into `AGENTS.md`) and the tool-specific VS Code custom-instructions / CLI how-to pages (document `CLAUDE.md` and `GEMINI.md` support). Added an explicit conflict-disclosure block in §6.1, updated the §6.5 VS-Code-vs-CLI table to split `CLAUDE.md` and `GEMINI.md` rows with per-cell citations, and added the inconsistency as the lead bullet in §8.
- ✅ fixed — Executive Summary paragraph 2: Added inline citations for personal instructions, organization instructions, path-scoped `*.instructions.md`, user-profile instruction locations, and prompt files; added a caveat paragraph pointing to §6.1 / §8 for the support conflict.
- ✅ fixed — §5.4 "Other beginner mistakes": Rewrote each bullet with inline citations to the primary GitHub Docs pages that back the claim (wrong path, wrong extension, merged layers + non-determinism, length guidance + 2-page cap, task-specific rules belong in prompt files).
- ✅ fixed — Topic coverage (user-profile scope): Added two new rows to the §2.1 four-layers table for VS Code `~/.copilot/instructions` and Copilot CLI `$HOME/.copilot/copilot-instructions.md`; added a new user-profile instructions row to the §6.5 comparison table; expanded the Executive Summary to call out the user-profile scope explicitly.
- ✅ fixed — §8 Research Limitations: Added the docs-inconsistency limitation as the first and most consequential bullet, in addition to the existing 404 cheat-sheet note.
- ✅ fixed — Code-block attribution lines: Added the required `> — Source: ... | Provenance: ...` post-block attribution to the precedence block (§2.2), decision-guide block (§2.4), terminal-commands blocks (§3, both bash and new PowerShell), `excludeAgent` example (§6.3), and `chat.useCustomizationsInParentRepositories` setting snippet (§6.4).
- ✅ fixed — Reference list integrity: Removed the orphaned how-to URL (`configure-custom-instructions/add-repository-instructions`) that was not cited in the body; added `agentsmd/agents.md` and `github.com/copilot` to the GitHub Repositories section; updated the header count to `10 web pages, 3 GitHub repositories` to match the body + bibliography.

**🟢 Minor:**
- ✅ fixed — §6.5 quote beginning "Local instructions ...": Rewrote as two parts — a short paraphrase sentence (no quote marks) plus a verbatim quote of the `$HOME/.copilot/copilot-instructions.md` sentence. No more stitched-together ellipsis quote.
- ✅ fixed — §6.2 `AGENTS.md` cross-vendor claim: Replaced the parenthetical "(also used by Claude Code, Gemini CLI, etc.)" with an inline link to [agentsmd/agents.md](https://github.com/agentsmd/agents.md) as the cited cross-vendor convention.
- ✅ fixed — §3 terminal block shell scope: Re-labeled the existing block as "macOS / Linux / WSL — bash/zsh" and added a parallel Windows PowerShell block with equivalent commands.
- ✅ fixed — Executive Summary overconfidence: Added an explicit caveat paragraph noting that support varies by surface and that the `CLAUDE.md`/`GEMINI.md` story is docs-dependent.
- Skipped (noted as still-present tension) — Review's 🟢 Minor note that the §6.1 and §6.5 tables together can read as slightly contradictory. Rather than collapse the tables, this revision makes the §6.5 table more granular (separate `CLAUDE.md` and `GEMINI.md` rows) and anchors both tables to the §6.1 conflict-disclosure block so the different granularities are a feature, not a bug. This is called out explicitly in §6.1.

No reviewer findings were disputed; all 🟡 Important items were fully addressed.

---

## Revision Round 3 — 2026-04-21

Addressed Review Round 2 🟡 Important findings by re-fetching the live support-matrix page on 2026-04-21 and narrowing the disclosed conflict to VS Code Chat and Copilot CLI only (VS Code cloud agent now matches tool-specific docs); updated §6.1 disclosure block and table rows, §6.5 table note with per-surface provenance, and §8 limitations bullet to reflect the current live matrix; added a "last re-checked on 2026-04-21" stamp near the §6.1 disclosure.
