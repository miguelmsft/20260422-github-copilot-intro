# Research Report: GitHub Copilot Skills (April 2026)

**Date:** 2026-04-21
**Researcher:** Copilot Web Researcher Agent
**Topic slug:** copilot-skills
**Sources consulted:** 20 URL entries in §9 — 11 documentation/article URLs (GitHub Docs, GitHub Blog, GitHub CLI site) + 4 GitHub REST API endpoint URLs + 4 GitHub repository URLs + 1 in-repo code-sample URL

---

## Executive Summary

"Skills" in GitHub Copilot (April 2026) refers to **Agent Skills** — a documented, first-class Copilot feature built on the open [Agent Skills specification](https://github.com/agentskills/agentskills). A skill is a folder containing a `SKILL.md` Markdown file (with YAML frontmatter) plus optional scripts and resources. When Copilot is working on a task, it reads the `name` + `description` of each available skill and, if one looks relevant, **injects that skill's `SKILL.md` into the agent's context** so it can follow the instructions (and optionally run bundled scripts). Copilot can also be told to use a skill explicitly with a `/SKILL-NAME` slash command.

Agent Skills work on three Copilot surfaces: **GitHub Copilot cloud agent (on github.com), the GitHub Copilot CLI, and agent mode in VS Code**. They do **not** currently work in Visual Studio, Eclipse, Xcode, or in GitHub.com's regular Copilot Chat (support for JetBrains is in preview). Skills can live at project scope (`.github/skills/<name>/SKILL.md` inside a repo) or at personal scope (`~/.copilot/skills/<name>/SKILL.md` in your home directory). The CLI adds further discovery via plugins, the `COPILOT_SKILLS_DIRS` env var, and bundled built-ins.

Critically, beginners should not confuse **Agent Skills** (the focus of this report) with two older, unrelated uses of the word "skills" in Copilot's docs: (1) **"MCP skills"**, which is how the github.com Copilot Chat cheat sheet refers to individual tools exposed by the built-in GitHub MCP Server (e.g. `create_branch`, `merge_pull_request`), and (2) the **`@github` chat participant** described as giving you "GitHub-specific Copilot skills." Those are not the Agent-Skills feature and they are not authored by users. This report flags those collisions explicitly and then focuses on the modern, user-authorable Agent Skills.

---

## Table of Contents

- [1. Overview](#1-overview)
- [2. Key Concepts](#2-key-concepts)
- [3. Getting Started](#3-getting-started)
- [4. Core Usage](#4-core-usage)
- [5. Configuration & Best Practices](#5-configuration--best-practices)
- [6. Advanced Topics](#6-advanced-topics)
- [7. Ecosystem & Alternatives](#7-ecosystem--alternatives)
- [8. Research Limitations](#8-research-limitations)
- [9. Complete Reference List](#9-complete-reference-list)

---

## 1. Overview

### What It Is

An **Agent Skill** (often just "skill") is a folder containing a `SKILL.md` file — a Markdown document with YAML frontmatter — plus any supporting scripts or reference files. The frontmatter gives the skill a name and a description; the Markdown body gives Copilot step-by-step instructions to follow for a specific kind of task.

> "Agent skills are folders of instructions, scripts, and resources that Copilot can load when relevant to improve its performance in specialized tasks. The Agent Skills specification is an [open standard](https://github.com/agentskills/agentskills), used by a range of different AI systems."
> — Source: [About agent skills (GitHub Docs)](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)

The Agent Skills format is not GitHub-proprietary. It is maintained as an open spec by Anthropic and shared across multiple AI agents (Copilot, Claude Code, Cursor, Codex, Gemini CLI, and others). That is why Copilot also recognises `.claude/skills/` and `.agents/skills/` directories alongside its own `.github/skills/` and `~/.copilot/skills/` locations.

### Why It Matters

Beginners typically first customise Copilot with a single `copilot-instructions.md` file. That works for rules that apply to *everything* (coding style, test framework, etc.), but it becomes a problem when you want **detailed** guidance that is only relevant **sometimes** — e.g. "how to debug a failing GitHub Actions workflow" or "how to draft a release note." Putting that into always-on custom instructions bloats Copilot's context window with irrelevant text.

Agent Skills solve this. The [Comparing GitHub Copilot CLI customization features](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/comparing-cli-features) page lists three things skills help you do: standardise how Copilot performs tasks in a specific context, provide "just-in-time" instructions without permanently changing Copilot's behaviour, and avoid overloading Copilot's context window with instructions that are not relevant to the current task. (Paraphrased — see the "Skills" row of the comparison table at the cited page.)

### Key Features

- **Folder-based, file-driven.** One folder per skill, always a `SKILL.md` at its root.
- **YAML frontmatter + Markdown body.** Required fields: `name`, `description`. Optional: `allowed-tools`, `user-invocable`, `disable-model-invocation`, `license`.
- **Automatic OR explicit invocation.** Copilot decides from your prompt + the skill's description, OR you type `/skill-name`.
- **Project-scoped or personal-scoped.** Committed to a repo (`.github/skills/`) or lived in your home directory (`~/.copilot/skills/`).
- **Can bundle scripts.** A skill directory can include shell scripts, Python files, templates, etc.; Copilot has access to them all when the skill is loaded.
- **Open standard.** The same skill folder works across Copilot, Claude Code, Cursor, Codex, Gemini CLI, and others.
- **Supply-chain aware install path.** A new `gh skill` CLI command (GitHub CLI v2.90.0+, shipped April 16 2026) adds version pinning, tree-SHA change detection, and provenance metadata for skills pulled from GitHub repositories.

---

## 2. Key Concepts

### 2.1 The "Skills" terminology trap (read this first)

Search the GitHub Copilot docs for the word "skills" and you will find **three different things**. Only the third is the focus of this report:

| Usage of "skill" | What it actually is | Where you see it |
|---|---|---|
| **"MCP skills"** in the Copilot Chat cheat sheet | The individual *tools* exposed by the built-in GitHub MCP Server (e.g. `create_branch`, `merge_pull_request`, `get_me`) when you use Copilot Chat on github.com. These are not user-authored; they ship with GitHub's MCP server. | [Chat cheat sheet § MCP skills](https://docs.github.com/en/copilot/reference/chat-cheat-sheet) |
| **`@github` "GitHub skills"** chat participant | A chat participant in VS Code Copilot Chat that routes your question through a set of GitHub-specific capabilities (repo search, issue lookup, etc.). Selected by typing `@github` in chat. | [Chat cheat sheet § Chat participants](https://docs.github.com/en/copilot/reference/chat-cheat-sheet) |
| **Agent Skills** (this report) | User-authored `SKILL.md` folders loaded into the agent's context on demand. Used by Copilot cloud agent, Copilot CLI, and VS Code agent mode. | [About agent skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills) |

> "@github — Allows you to use GitHub-specific Copilot skills."
> — Source: [GitHub Copilot Chat cheat sheet](https://docs.github.com/en/copilot/reference/chat-cheat-sheet)

That quote is where a lot of the confusion starts. It predates the Agent Skills feature and refers to the chat participant, not `SKILL.md` files.

### 2.2 Anatomy of an Agent Skill

A skill is just a directory. The minimum valid skill is:

```text
my-skill/
└── SKILL.md
```
> — Source: [Adding agent skills for GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills) | Provenance: synthesised from the docs' `SKILL.md` naming requirement.

A more realistic skill bundles resources:

```text
image-convert/
├── SKILL.md
└── convert-svg-to-png.sh
```
> — Source: [Adding agent skills for GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills) | Provenance: verbatim (directory layout from the "Enabling a skill to run a script" example)

`SKILL.md` is a Markdown file with YAML frontmatter:

```markdown
---
name: github-actions-failure-debugging
description: Guide for debugging failing GitHub Actions workflows. Use this when asked to debug failing GitHub Actions workflows.
---

To debug failing GitHub Actions workflows in a pull request, follow this process...
1. Use the `list_workflow_runs` tool to look up recent workflow runs...
2. Use the `summarize_job_log_failures` tool to get an AI summary...
```
> — Source: [Adding agent skills for GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills) | Provenance: verbatim (example in docs)

### 2.3 Frontmatter fields (full reference)

From the CLI reference:

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | Unique identifier. Letters, numbers, and hyphens only. Max 64 characters. Typically matches the directory name. |
| `description` | string | Yes | What the skill does and when to use it. **Max 1024 characters.** This text is what Copilot matches against your prompt. |
| `allowed-tools` | string or string[] | No | Tools Copilot may run without asking for confirmation while this skill is active. Use `"*"` for all tools, or a comma-separated list / YAML array (e.g. `shell`, `write`). |
| `user-invocable` | boolean | No | Whether users can invoke the skill with `/SKILL-NAME`. Default: `true`. |
| `disable-model-invocation` | boolean | No | Prevent the agent from automatically invoking this skill. Default: `false`. If set, the skill only runs when a user types `/SKILL-NAME`. |
| `license` | string | No | License that applies to this skill (useful when sharing). |

> — Source: [GitHub Copilot CLI command reference § Skill frontmatter fields](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference)

### 2.4 Skill locations and precedence (CLI)

Copilot CLI loads skills from several places, in this priority order — the first skill found with a given name wins over any later one:

| Location | Scope | Notes |
|---|---|---|
| `.github/skills/` | Project | Project-specific skills. |
| `.agents/skills/` | Project | Alternative project location. |
| `.claude/skills/` | Project | Claude-compatible location. |
| Parent `.github/skills/` | Inherited | Monorepo parent directory support. |
| `~/.copilot/skills/` | Personal | Personal skills for all projects. |
| `~/.agents/skills/` | Personal | Shared across all projects. |
| `~/.claude/skills/` | Personal | Claude-compatible personal location. |
| Plugin directories | Plugin | Skills installed via a CLI plugin. |
| `COPILOT_SKILLS_DIRS` | Custom | Additional directories (comma-separated env var). |
| (bundled with CLI) | Built-in | Skills shipped with the CLI. **Lowest priority — overridable by any other source.** |

> — Source: [GitHub Copilot CLI command reference § Skill locations](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference)

The CLI's personal config directory reference adds:

> "Store personal custom skill definitions here. Each skill lives in a subdirectory containing a `SKILL.md` file—for example, `~/.copilot/skills/my-skill/SKILL.md`. Personal skills are available in all your sessions. Project-level skills take precedence over personal skills if they share the same name."
> — Source: [GitHub Copilot CLI configuration directory](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-config-dir-reference)

### 2.5 How Copilot chooses to use a skill

There are two invocation paths:

**Automatic (model-driven)**: at the start of a session, Copilot loads all discovered skills' *metadata* (name + description only, not the body). When you prompt it, the model checks whether any description matches your intent. If so, it calls the built-in `skill` tool to load the full `SKILL.md` into the conversation context.

> "When performing tasks, Copilot will decide when to use your skills based on your prompt and the skill's description. When Copilot chooses to use a skill, the `SKILL.md` file will be injected in the agent's context, giving the agent access to your instructions."
> — Source: [Adding agent skills for GitHub Copilot](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills)

**Explicit (user-driven)**: you prefix the skill name with a forward slash.

> "To tell Copilot to use a specific skill, include the skill name in your prompt, preceded by a forward slash. For example, if you have a skill named 'frontend-design' you could use a prompt such as: `Use the /frontend-design skill to create a responsive navigation bar in React.`"
> — Source: [Adding agent skills for GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills)

Because automatic matching is driven by the `description` field, **the quality of that description directly determines whether Copilot ever uses the skill**. The docs' example descriptions always include a "Use this when..." clause, which is a strong pattern to follow.

### 2.6 Flow diagram (conceptual)

```text
 ┌──────────────────────────────────────────────────────────────┐
 │  Session start                                               │
 │  ───────────                                                  │
 │  Copilot scans:                                              │
 │    .github/skills/*/SKILL.md           (project)             │
 │    ~/.copilot/skills/*/SKILL.md        (personal)            │
 │    plugins, COPILOT_SKILLS_DIRS, built-ins                   │
 │  → builds a catalog of (name, description) pairs             │
 └───────────────┬──────────────────────────────────────────────┘
                 │
                 ▼
  You prompt:  "Debug the failing CI on PR #42"
                 │
                 ▼
 ┌──────────────────────────────────────────────────────────────┐
 │  Model sees the catalog + your prompt                        │
 │  Matches "github-actions-failure-debugging" description      │
 │  Calls built-in `skill` tool with that name                  │
 └───────────────┬──────────────────────────────────────────────┘
                 │
                 ▼
     SKILL.md body is injected into the context window
     Copilot follows its steps, possibly running bundled scripts
                 │
                 ▼
     `github.copilot.skill.invoked` telemetry event is emitted
```
> — Source: [GitHub Copilot CLI command reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference); [Adding agent skills for GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills) | Provenance: synthesised (conceptual diagram built from the documented skill-location precedence list, description-based auto-matching, the built-in `skill` tool, and the `github.copilot.skill.invoked` telemetry event)

### 2.7 Where Agent Skills are (and are not) supported

From the official support matrix:

| Feature | VS Code | Visual Studio | JetBrains | Eclipse | Xcode | GitHub.com | Copilot CLI |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **Agent skills** | ✓ | ✗ | P | ✗ | ✗ | ✓ | ✓ |

> "✓ = supported, ✗ = not supported, P = under preview"
> — Source: [Copilot customization cheat sheet](https://docs.github.com/en/copilot/reference/customization-cheat-sheet)

Two beginner-facing takeaways:

1. On github.com, skills are a **cloud agent** feature (the agent that handles "assign an issue to Copilot"). They are **not** listed as working in the plain Copilot Chat box.
2. In VS Code, skills work in **agent mode** (the new agentic chat), not in classic inline completions or plain chat.

#### CLI vs VS Code: concrete differences

Although skills are supported in both Copilot CLI and VS Code agent mode, the two surfaces expose them very differently. **Do not assume that CLI-only slash-commands (`/skills list`, `/skills reload`, `/skills info`, `/skills add`, `/skills remove`) are available in VS Code — they are documented only for the CLI.** The table below summarises what the primary sources actually say, and what they pointedly do not say, about each surface:

| Concern | Copilot CLI | VS Code (agent mode) | GitHub.com (cloud agent) |
|---|---|---|---|
| Feature supported? | ✓ | ✓ | ✓ |
| Authoring how-to page | [Adding agent skills for the CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills) | Same spec, but the VS Code UI-specific authoring flow is not covered on docs.github.com at the time of writing. | [Adding agent skills for github.com](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills) |
| Personal skill location | `~/.copilot/skills/` (documented in the [CLI config-dir reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-config-dir-reference)) | Not documented on docs.github.com — treat as unverified. | Not applicable (cloud). |
| Project skill location | `.github/skills/` (also `.agents/skills/`, `.claude/skills/`) | `.github/skills/` per the open spec; VS-Code-specific search paths are not documented on docs.github.com. | `.github/skills/` committed to the repo. |
| Management UI | `/skills`, `/skills list`, `/skills info`, `/skills add`, `/skills reload`, `/skills remove` — documented only in the [CLI command reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference). | No equivalent slash-commands documented on docs.github.com. VS Code's own docs are the authoritative source for any UI-level toggle/preview; this report did not verify them. | Browser UI; no slash-commands. |
| Explicit invocation | Type `/SKILL-NAME ...` in the CLI prompt. | The spec's `/SKILL-NAME` convention is expected to work in agent-mode chat, but docs.github.com does not restate it for VS Code. Verify in the VS Code UI. | Mention the skill by name in the issue/PR prompt handed to the cloud agent. |
| Plugin install (`/plugin install`) | Supported (see [Comparing CLI customization features](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/comparing-cli-features)). | Not covered by the CLI-specific "plugins" concept on docs.github.com. | Not applicable. |
| Env var `COPILOT_SKILLS_DIRS` | Documented for the CLI ([skill-locations table](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference)). | Not documented as a VS Code setting; treat as CLI-only unless VS Code docs say otherwise. | Not applicable. |
| Telemetry event | `github.copilot.skill.invoked` ([CLI reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference)). | Not documented on docs.github.com. | Not documented. |

Bottom line: **the `SKILL.md` folder format is the portable part**, and a well-written skill at `.github/skills/<name>/SKILL.md` will be picked up on all three supported surfaces. **Everything about *managing*, *listing*, *toggling*, and *inspecting* skills that this report documents is CLI-specific unless stated otherwise**. VS Code's UI flows for skills were not covered by the GitHub Docs pages consulted — consult the VS Code product documentation for those.

### 2.8 How skills differ from MCP, custom agents, and custom instructions

The [Comparing Copilot CLI customization features](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/comparing-cli-features) page is the canonical decision guide. Quick summary:

| Feature | Kind of thing | What it does | Trigger |
|---|---|---|---|
| **Custom instructions** (`copilot-instructions.md`, `AGENTS.md`) | Always-loaded text | Tells Copilot *how to behave* in general (coding style, conventions). | Automatic, every session. |
| **Prompt files** (`.prompt.md`) | Reusable prompt template | A saved prompt you run on demand with inputs. | Manual, from a picker. |
| **Agent Skills** (`SKILL.md`) | Just-in-time instructions + bundled files | Tells Copilot *how to handle a specific kind of task*; loaded only when relevant. | Automatic (description match) or `/skill-name`. |
| **Custom agents** (`.github/agents/*.md`) | Persona + toolset | A specialist agent with its own system prompt, tool allowlist, and (optionally) its own MCP servers. | Manual (agent dropdown) or auto-delegated if `infer: true`. |
| **MCP servers** | External tool providers | Add entirely new *capabilities* (tools) that Copilot can call, e.g. "create a Jira ticket." | Automatic (the model picks the right tool) or by name. |
| **Hooks** (`.github/hooks/*.json`) | Shell scripts at lifecycle events | Deterministic guardrails: run X before every `edit`, etc. | Automatic at wired lifecycle points. |
| **Plugins** | Bundle of the above | Ship skills + agents + hooks + MCP configs as one installable package. | Installed with `/plugin install`. |

The same [Comparing CLI customization features](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/comparing-cli-features) page summarises the "when to use / when to avoid" guidance as follows (paraphrased from the "Skills" row): use a skill when you want a repeatable set of instructions or functionality available for a specific type of task; avoid skills when the guidance should apply to everything you do (use custom instructions) or when you need new capabilities (use an MCP server for new tools, or a custom agent for specialisation).

Beginner decision guide:

- "I want Copilot to always use 2-space indent." → **Custom instructions**.
- "I want Copilot to follow a specific 5-step release-notes procedure when I ask it to draft release notes." → **Skill**.
- "I want Copilot to be able to query Jira." → **MCP server**.
- "I want Copilot to act like a paranoid security reviewer, with a restricted toolset, only when I ask." → **Custom agent**.
- "I always want `prettier --write` to run after Copilot edits a file." → **Hook**.

---

## 3. Getting Started

### Prerequisites

- **Copilot subscription.** Any plan that includes the surface you plan to use (Copilot CLI, VS Code agent mode, or Copilot cloud agent on github.com).
- **Copilot CLI** (recommended for learning): the `copilot` command installed. The CLI has full skill tooling (`/skills list`, `/skills info`, etc.) and is the easiest place to iterate on a skill.
- **A text editor.** Skills are plain Markdown.
- **Optional:** [GitHub CLI](https://cli.github.com/) v2.90.0+ if you want to use the new `gh skill` command to install skills from GitHub repositories (see [GitHub CLI homepage](https://cli.github.com/) for install instructions and [the April 16 2026 changelog entry](https://github.blog/changelog/2026-04-16-manage-agent-skills-with-github-cli/) for the `gh skill` version requirement).

### Installation & Setup

#### Terminal Commands

> Note: the shell snippets below assume a POSIX shell (macOS/Linux/WSL or Git Bash). On Windows PowerShell, replace `mkdir -p <path>` with `New-Item -ItemType Directory -Path <path> -Force` and rewrite the `cat <<'EOF' ... EOF` heredoc as a `Set-Content` call (or simply create the file in your editor).

```bash
# 1. Create a personal skills directory (applies to all your projects)
mkdir -p ~/.copilot/skills

# 2. OR create a project-scoped skills directory (committed to the repo)
mkdir -p .github/skills

# 3. (Optional) Install GitHub CLI >= 2.90.0 and try the new skill manager
gh --version           # verify >= 2.90.0
gh skill search mcp    # discover community skills on GitHub
gh skill install github/awesome-copilot              # browse interactively
gh skill install github/awesome-copilot documentation-writer   # pick one
gh skill install github/awesome-copilot documentation-writer@v1.2.0  # pin a version

# 4. Inside a Copilot CLI session, the key commands are:
#    /skills list            — show what's available
#    /skills info <name>     — show metadata and file path of a skill
#    /skills add <path>      — add another directory to the skill search path
#    /skills reload          — re-scan after you add or edit a skill
#    /skills remove <dir>    — remove a skill you added directly
#    /skills                 — interactive toggle UI (space bar to enable/disable)
```
> — Source: [Adding agent skills for GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills); [GitHub Copilot CLI command reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference); [Manage agent skills with GitHub CLI (changelog)](https://github.blog/changelog/2026-04-16-manage-agent-skills-with-github-cli/) | Provenance: adapted (combining documented `/skills *` subcommands and `gh skill` examples from the changelog)

#### "Hello, skill" — your first skill in 3 files

```bash
# Step 1 — create the skill directory
mkdir -p ~/.copilot/skills/hello-skill

# Step 2 — write SKILL.md
cat > ~/.copilot/skills/hello-skill/SKILL.md <<'EOF'
---
name: hello-skill
description: Greets the user in a friendly, formal tone and confirms which skill was used. Use this when the user asks you to say hello, introduce yourself, or demonstrate skills.
---

When this skill is invoked, respond with exactly the following three lines:

1. "Hello from the hello-skill agent skill!"
2. A one-sentence summary of what the user just asked.
3. "(This response was produced by /hello-skill — an Agent Skill loaded from ~/.copilot/skills/hello-skill/SKILL.md.)"

Do not add any other content.
EOF

# Step 3 — verify Copilot sees it
copilot       # start a CLI session
# inside the session:
#   /skills list                  → should include hello-skill
#   /skills info hello-skill      → should show the path above
#   /hello-skill say hi to me     → runs the skill explicitly
#   or just: "please say hello"   → description should match; Copilot picks it
```
> — Source: [Adding agent skills for GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills) + [GitHub Copilot CLI configuration directory](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-config-dir-reference) | Provenance: synthesised tutorial (directory layout and `/skills *` commands are documented; skill body is author-written)

Troubleshooting:
- If `/skills list` does not show your skill, run `/skills reload`.
- If the skill exists but Copilot never auto-picks it, rewrite the `description` to be more specific about *when to use it*. The description is the matching surface.

---

## 4. Core Usage

### 4.1 A skill that runs a script

A skill's directory isn't limited to `SKILL.md` — any file you put next to it becomes available to Copilot when the skill is loaded.

```text
.github/skills/image-convert/
├── SKILL.md
└── convert-svg-to-png.sh
```
> — Source: [Adding agent skills for GitHub Copilot CLI § Enabling a skill to run a script](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills) | Provenance: verbatim (directory layout from the docs example)

```markdown
---
name: image-convert
description: Converts SVG images to PNG format. Use when asked to convert SVG files.
allowed-tools: shell
---

When asked to convert an SVG to PNG, run the `convert-svg-to-png.sh` script
from this skill's base directory, passing the input SVG file path as the
first argument.
```
> — Source: [Adding agent skills for GitHub Copilot CLI § Enabling a skill to run a script](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills) | Provenance: verbatim

> ⚠️ **Security warning from the docs:** "Only pre-approve the `shell` or `bash` tools if you have reviewed this skill and any referenced scripts, and you fully trust their source. Pre-approving `shell` or `bash` removes the confirmation step for running terminal commands and can allow attacker-controlled skills or prompt injections to execute arbitrary commands in your environment. When in doubt, omit `shell` and `bash` from `allowed-tools` so that Copilot must ask for your explicit confirmation before running terminal commands."
> — Source: [Adding agent skills for GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills)

### 4.2 A realistic skill (verbatim example from the docs)

This is GitHub's own example of a genuinely useful skill — it combines an instruction body with references to tools that happen to be provided by the GitHub MCP Server:

```markdown
---
name: github-actions-failure-debugging
description: Guide for debugging failing GitHub Actions workflows. Use this when asked to debug failing GitHub Actions workflows.
---

To debug failing GitHub Actions workflows in a pull request, follow this process, using tools provided from the GitHub MCP Server:

1. Use the `list_workflow_runs` tool to look up recent workflow runs for the pull request and their status
2. Use the `summarize_job_log_failures` tool to get an AI summary of the logs for failed jobs, to understand what went wrong without filling your context windows with thousands of lines of logs
3. If you still need more information, use the `get_job_logs` or `get_workflow_run_logs` tool to get the full, detailed failure logs
4. Try to reproduce the failure yourself in your own environment.
5. Fix the failing build. If you were able to reproduce the failure yourself, make sure it is fixed before committing your changes.
```
> — Source: [Adding agent skills for GitHub Copilot](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills) | Provenance: verbatim

Notice three beginner-friendly patterns here:

1. The `description` literally says "Use this when...", which is what Copilot matches against.
2. The body names specific tool calls (`list_workflow_runs`, etc.) rather than vague advice.
3. The skill assumes an MCP server is also configured — skills *describe a workflow*, MCP servers *provide the tools* the workflow uses. They are complementary.

### 4.3 Using skills from the Copilot SDK (Node.js / Python / Go / .NET / Java)

If you are writing your own application on top of the [Copilot SDK](https://github.com/github/copilot-sdk) (public preview as of April 2026), skills are a session-configuration option. The SDK accepts a list of *parent* directories and auto-discovers every `SKILL.md` one level below.

```typescript
// Source: https://docs.github.com/en/copilot/how-tos/copilot-sdk/use-copilot-sdk/custom-skills
import { CopilotClient } from "@github/copilot-sdk";

const client = new CopilotClient();
const session = await client.createSession({
    model: "gpt-4.1",
    skillDirectories: [
        "./skills/code-review",
        "./skills/documentation",
    ],
    onPermissionRequest: async () => ({ kind: "approved" }),
});

await session.sendAndWait({ prompt: "Review this code for security issues" });
```
> — Source: [Using custom skills with the Copilot SDK](https://docs.github.com/en/copilot/how-tos/copilot-sdk/use-copilot-sdk/custom-skills) | Provenance: verbatim

Field names in each supported language:

| Language | Load skills | Disable specific skills |
|---|---|---|
| Node.js | `skillDirectories: string[]` | `disabledSkills: string[]` |
| Python | `skill_directories: list[str]` | `disabled_skills: list[str]` |
| Go | `SkillDirectories []string` | `DisabledSkills []string` |
| .NET | `SkillDirectories List<string>` | `DisabledSkills List<string>` |
| Java | `skillDirectories List<String>` | `disabledSkills List<String>` |

> — Source: [Using custom skills with the Copilot SDK](https://docs.github.com/en/copilot/how-tos/copilot-sdk/use-copilot-sdk/custom-skills)

Minimal Python equivalent (following the docs' mapping — see the [`github/copilot-sdk`](https://github.com/github/copilot-sdk) repo for the canonical Python sample):

```python
# Source: https://docs.github.com/en/copilot/how-tos/copilot-sdk/use-copilot-sdk/custom-skills
# (Python field mapping per the SDK skill fields table.)

import asyncio
from github_copilot_sdk import CopilotClient  # package name is public preview

async def main() -> None:
    client = CopilotClient()
    session = await client.create_session(
        model="gpt-4.1",
        skill_directories=["./skills/code-review", "./skills/documentation"],
        disabled_skills=["experimental-feature"],
        on_permission_request=lambda _req: {"kind": "approved"},
    )
    try:
        await session.send_and_wait(prompt="Review this code for security issues")
    finally:
        await session.close()

if __name__ == "__main__":
    asyncio.run(main())
```
> — Source: [Using custom skills with the Copilot SDK](https://docs.github.com/en/copilot/how-tos/copilot-sdk/use-copilot-sdk/custom-skills) | Provenance: adapted (Node.js docs example + documented Python field names)

### 4.4 CLI slash-command reference for skills

From the CLI command reference:

| Command | Purpose |
|---|---|
| `/skills` | Interactive toggle UI — use arrow keys + space bar to enable/disable each skill for the current session. |
| `/skills list` | List the skills Copilot currently sees. |
| `/skills info <name>` | Show a skill's location and metadata (useful for verifying the directory Copilot is actually loading). |
| `/skills add <path>` | Add another directory to the skill search path for the session. |
| `/skills reload` | Re-scan skill directories after you add or edit a skill during a session, without restarting the CLI. |
| `/skills remove <dir>` | Remove a skill you added directly. Skills installed via a plugin must be managed via the plugin instead. |
| `/SKILL-NAME [args]` | Explicitly invoke a specific skill. |
| `/env` | Also shows loaded skills alongside instructions, MCP servers, agents, plugins, LSPs, and extensions. |

> — Source: [GitHub Copilot CLI command reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference)

---

## 5. Configuration & Best Practices

### Recommended Configuration

- **Commit project skills to the repo** at `.github/skills/<skill>/SKILL.md` so every contributor and the cloud agent gets them automatically ([About agent skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)).
- **Put personal/experimental skills** in `~/.copilot/skills/`. Project skills override personal ones with the same name ([CLI config-dir reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-config-dir-reference)).
- **Set `COPILOT_SKILLS_DIRS`** if you want Copilot to also read from, e.g., a company-wide skills checkout (`/opt/company/skills`). The [CLI command reference's skill-locations table](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference) describes this variable as accepting "Additional directories (comma-separated env var)".
- **Prefer `.github/skills/`** over `.claude/skills/` or `.agents/skills/` unless you are explicitly aiming for cross-agent compatibility — the `.github` path is the one GitHub's docs standardise on ([About agent skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)).
- **Pin skill versions** installed via `gh skill install` using `@v1.2.0` or `@<sha>` and the `--pin` flag. The [April 16 2026 GitHub changelog](https://github.blog/changelog/2026-04-16-manage-agent-skills-with-github-cli/) describes `--pin` as skipping a skill during `gh skill update`, and documents that skills can ship scripts and be invoked automatically — i.e. they are executable in effect — so supply-chain hygiene matters.

### Best Practices

- **Write descriptions as "Use this when..."** The docs' own examples consistently include a "Use this when..." or "Use when..." clause. The description is Copilot's matching signal; vague descriptions mean the skill never fires.
- **Keep the body focused and step-numbered.** Skills are workflows, not essays. A numbered procedure is easier for the model to follow.
- **Reference tools and MCP servers by exact name** inside the skill body (e.g. `list_workflow_runs`) — don't describe them vaguely.
- **Name dependencies.** If your skill needs a specific MCP server or external CLI to be installed, state that in the skill body.
- **Test in isolation.** The SDK best-practices page explicitly recommends verifying skills one at a time before combining. ([Source](https://docs.github.com/en/copilot/how-tos/copilot-sdk/use-copilot-sdk/custom-skills))
- **Use `disable-model-invocation: true`** for skills that should only run when the user explicitly asks for them — e.g. destructive workflows.
- **Use `allowed-tools` sparingly.** Never pre-approve `shell` / `bash` for a skill you did not write yourself or have not fully audited.

### Common Pitfalls & Anti-Patterns

- **Putting the skill file in the wrong place.** Common mistakes: `skills/mything.md` (missing subdirectory), `my-skill.md` under `.github/skills/` (missing subdirectory), or naming the file `readme.md`/`skill.md` instead of `SKILL.md`. The docs emphasise: *"Skill files must be named `SKILL.md`"* ([source](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills)).
- **Treating skills like always-on rules.** If the guidance applies to *everything you do*, it belongs in custom instructions (`copilot-instructions.md` / `AGENTS.md`), not a skill.
- **Expecting skills to add new capabilities.** A skill cannot give Copilot the ability to call a new external API on its own — that's what MCP servers are for. Skills *orchestrate* existing tools.
- **Over-broad `description`.** A description like "General coding helper" will either fire on everything or nothing. Pin the description to a clear task and the signal phrase that identifies it.
- **Forgetting `/skills reload`.** If you edit a `SKILL.md` mid-session in the CLI, your changes are not picked up until you reload or restart.

---

## 6. Advanced Topics

### 6.1 Pre-approved tools and the permission model

Copilot always asks before executing a tool that can change your system (shell, writes, etc.) *unless* it is pre-approved. Skills can pre-approve tools only while that skill is active. The [CLI authoring docs](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills) describe the `allowed-tools` frontmatter field as the list of "Tools Copilot may run without asking for confirmation while this skill is active" (emphasis added — scoped to skill activation):

```markdown
---
name: image-convert
description: Converts SVG images to PNG format. Use when asked to convert SVG files.
allowed-tools: shell
---
```
> — Source: [Adding agent skills for GitHub Copilot CLI § Enabling a skill to run a script](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills) | Provenance: verbatim (frontmatter snippet)

This grants the skill `shell` pre-approval while it is active. Deny rules and the session's global allowlist still apply, and the same CLI authoring page repeatedly warns that pre-approving `shell`/`bash` is a supply-chain risk for skills you did not author (see the security warning quoted in §4.1).

### 6.2 Plugins: bundling skills with other customizations

A **plugin** is an installable package that may include skills, custom agents, hooks, and MCP server configurations. The CLI ships plugin commands (`/plugin install`, `/plugin update`, `/plugin list`, `/plugin uninstall`) and supports installing from a marketplace or directly from a GitHub repository.

> "A plugin is an installable package that can deliver a bundle of functionality to Copilot. A plugin can include any combination of the other customization features. For example, skills, custom agents, hooks, and MCP server configurations."
> — Source: [Comparing GitHub Copilot CLI customization features](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/comparing-cli-features)

Plugin-provided skills appear in `/skills list` alongside other skill sources (the [CLI command reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference) lists "Plugin directories" as one of the skill-discovery locations), but the `/skills remove` page explicitly calls out that plugin-installed skills must be managed through the plugin rather than through `/skills remove` (see the `/skills remove` row in §4.4, sourced from the same CLI command reference).

### 6.3 `gh skill` (GitHub CLI v2.90.0+, April 16 2026)

The GitHub CLI now has a skills subcommand:

```bash
gh skill search mcp-apps
gh skill install github/awesome-copilot
gh skill install github/awesome-copilot documentation-writer
gh skill install github/awesome-copilot documentation-writer@v1.2.0
gh skill install github/awesome-copilot documentation-writer@abc123def
gh skill install github/awesome-copilot documentation-writer --agent claude-code --scope user
gh skill update
gh skill publish
```
> — Source: [Manage agent skills with GitHub CLI (GitHub Changelog, 2026-04-16)](https://github.blog/changelog/2026-04-16-manage-agent-skills-with-github-cli/) | Provenance: adapted (commands illustrated in the changelog post)

Key guarantees per the announcement ([all items below sourced from the April 16 2026 changelog](https://github.blog/changelog/2026-04-16-manage-agent-skills-with-github-cli/)):

- **Tags / immutable releases** — `gh skill publish` offers to enable immutable GitHub releases so the content at a tag cannot change silently.
- **Content-addressed change detection** — `gh skill update` compares the git tree SHA of the remote skill directory with the one recorded locally, rather than trusting version numbers.
- **Version pinning** — `--pin` skips a skill during `gh skill update`.
- **Portable provenance** — install metadata (repo, ref, tree SHA) is written directly into the `SKILL.md` frontmatter so the pinning follows the skill if you copy it to another project.
- **Supported agent hosts** — the changelog post names GitHub Copilot, Claude Code, Cursor, Codex, and Gemini CLI as supported targets of `gh skill install --agent <host>`.

### 6.4 Telemetry and observability

Copilot CLI emits an OpenTelemetry event whenever a skill is invoked, useful for auditing and for company-wide telemetry pipelines:

| Event | Key attributes |
|---|---|
| `github.copilot.skill.invoked` | `github.copilot.skill.name`, `github.copilot.skill.path`, `github.copilot.skill.plugin_name`, `github.copilot.skill.plugin_version` |

> — Source: [GitHub Copilot CLI command reference § Telemetry events](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference)

### 6.5 Org / enterprise scope

Organisation- and enterprise-level skills are **not yet available** as of April 2026:

> "Support for organization-level and enterprise-level skills is coming soon."
> — Source: [About agent skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)

For now, the closest options are: commit skills into a shared repo (`.github/skills/`), ship them via a plugin, or distribute a common directory and point `COPILOT_SKILLS_DIRS` at it.

### 6.6 Skills under the hood: the `skill` tool

On the CLI, skill invocation is actually routed through a built-in tool literally called `skill`:

| Tool name | Description |
|---|---|
| `skill` | Invoke custom skills |

> — Source: [GitHub Copilot CLI command reference § Other tools](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference)

This is useful context: when Copilot decides to auto-invoke a skill, what you see in the session transcript is the `skill` tool call with the skill's name as an argument. Because it is exposed as a named tool in the CLI's tool list (see the "Other tools" table in the [CLI command reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference)), it is subject to the same permission/allow-list mechanism as any other CLI tool — i.e. it can be controlled via the CLI's standard tool-permission patterns. The specific per-tool deny-rule syntax is documented in the broader permission sections of that same CLI reference.

---

## 7. Ecosystem & Alternatives

### The open Agent Skills specification

Skills are not a GitHub-only concept. The [`agentskills/agentskills`](https://github.com/agentskills/agentskills) repository holds the spec; see the star count in the "Example libraries" table below for an "as of 2026-04-21" figure.

> "Agent Skills are a simple, open format for giving agents new capabilities and expertise. Skills are folders of instructions, scripts, and resources that agents can discover and use to perform better at specific tasks. Write once, use everywhere."
> — Source: [agentskills/agentskills README](https://github.com/agentskills/agentskills)

The same `SKILL.md` folder can be installed into Copilot (`.github/skills/`, `~/.copilot/skills/`), Claude Code (`.claude/skills/`, `~/.claude/skills/`), or any other agent via `.agents/skills/`. The `gh skill install --agent <host>` flag is explicit about targeting a specific host.

### Example libraries

Star counts below were read from the unauthenticated GitHub REST API (`https://api.github.com/repos/<owner>/<repo>`, `stargazers_count` field) **as of 2026-04-21**. They change daily; re-verify before citing.

| Repository | Stars (2026-04-21, per GitHub REST API) | What it is |
|---|---|---|
| [`anthropics/skills`](https://github.com/anthropics/skills) | ~121K — [api.github.com/repos/anthropics/skills](https://api.github.com/repos/anthropics/skills) | Anthropic's public skills library — the largest collection, cross-agent. |
| [`github/awesome-copilot`](https://github.com/github/awesome-copilot) | ~30K — [api.github.com/repos/github/awesome-copilot](https://api.github.com/repos/github/awesome-copilot) | "Community-contributed instructions, agents, skills, and configurations to help you make the most of GitHub Copilot." (official GitHub org) |
| [`agentskills/agentskills`](https://github.com/agentskills/agentskills) | ~16K — [api.github.com/repos/agentskills/agentskills](https://api.github.com/repos/agentskills/agentskills) | The spec and reference SDK. |
| [`github/copilot-sdk`](https://github.com/github/copilot-sdk) | ~8K — [api.github.com/repos/github/copilot-sdk](https://api.github.com/repos/github/copilot-sdk) | Multi-platform SDK (Node, Python, Go, .NET) — `skillDirectories` option. |

### When to reach for something *other than* skills

| If you want... | Use this instead |
|---|---|
| Always-on coding standards | Repository or personal **custom instructions** |
| New external capabilities (Jira, databases, browsers) | **MCP servers** |
| A named "persona" with restricted tools, usable from an agent dropdown | **Custom agents** |
| Guaranteed script execution at lifecycle events (e.g. after every file edit) | **Hooks** |
| A one-off prompt template with inputs you fill in | **Prompt files** |
| A bundle you distribute to a team (skills + agents + hooks + MCP) | **Plugins** |

---

## 8. Research Limitations

- **No direct evidence of what "built-in" skills ship with the Copilot CLI.** The CLI reference documents a "(bundled with CLI)" location at the bottom of the skills priority list ([source](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference)) and confirms they exist and are "overridable by any other source," but I did not find a canonical list of their names in the public documentation. Running `/skills list` in a real CLI session is the authoritative way to enumerate them.
- **VS Code specifics only lightly covered.** The support matrix shows agent skills are supported in VS Code, but the docs I consulted focused on the CLI and cloud agent. VS Code UI-level flows (how to browse/toggle skills from the UI, equivalents of `/skills info`) are not deeply documented on docs.github.com; they would require VS Code's own documentation to verify.
- **Copilot SDK is public preview.** Field names and behaviours (`skillDirectories`, `disabledSkills`) are subject to change. I cited the current docs but cross-language parity for Java/.NET was not verified against the SDK source.
- **Org- and enterprise-level skills are "coming soon."** Anything about how company-wide skill distribution will ultimately work is out of scope and not yet specified.
- **Only one GitHub Changelog entry** (the April 16 2026 `gh skill` launch) was consulted. There may be other recent changelog entries about skills evolution that I did not surface.
- **I did not personally run a CLI session.** All behavioural claims are from the documentation and the April 16 2026 changelog post, not from direct reproduction.
- **I was unable to use conventional web search engines** (Bing/DuckDuckGo) from the research environment — those returned anti-bot pages. I used the documented `docs.github.com` internal search API and direct HTTP fetches against `github.blog`, `docs.github.com`, and `api.github.com` to gather sources. The set of sources is therefore GitHub-origin and does not include third-party blog coverage, which for a GitHub-proprietary feature is acceptable but worth flagging.
- **The `anthropics/skills` star count (~121K)** — as noted in §7.2, this figure was read from the unauthenticated GitHub REST API ([api.github.com/repos/anthropics/skills](https://api.github.com/repos/anthropics/skills)) on 2026-04-21. Star counts change daily; re-verify shortly before citing in a talk or publication.

---

## 9. Complete Reference List

### Documentation & Articles

- [About agent skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills) — Conceptual overview; defines skills, scopes, and the open spec linkage. Cited in §§1, 2, 5, 6.5, 7.
- [Adding agent skills for GitHub Copilot](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills) — Cloud-agent-flavoured authoring how-to; includes the canonical `SKILL.md` example. Cited in §§2.5, 2.7, 4.2.
- [Adding agent skills for GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills) — CLI-flavoured authoring how-to; slash-command reference and script-enabled skill example. Cited in §§2.2, 2.5, 3, 4.1, 5.3, 6.1.
- [Using custom skills with the Copilot SDK](https://docs.github.com/en/copilot/how-tos/copilot-sdk/use-copilot-sdk/custom-skills) — SDK-level skill loading, disabling, and multi-language field table. Cited in §§4.3, 5.
- [GitHub Copilot CLI command reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference) — Authoritative reference for skill frontmatter fields, skill locations and precedence, the `skill` telemetry event, and the `skill` tool. Cited in §§2.3, 2.4, 2.6, 2.7, 3, 4.4, 5, 6.2, 6.4, 6.6.
- [GitHub Copilot CLI configuration directory](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-config-dir-reference) — `~/.copilot/skills/` layout and precedence rules. Cited in §§2.4, 2.7, 3, 5.
- [Comparing GitHub Copilot CLI customization features](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/comparing-cli-features) — Decision guide: custom instructions vs skills vs tools vs MCP vs hooks vs subagents vs custom agents vs plugins. Cited in §§1, 2.7, 2.8, 6.2.
- [Copilot customization cheat sheet](https://docs.github.com/en/copilot/reference/customization-cheat-sheet) — Feature-overview tables; the official IDE/surface support matrix. Cited in §2.7.
- [GitHub Copilot Chat cheat sheet](https://docs.github.com/en/copilot/reference/chat-cheat-sheet) — Source for the *unrelated* "MCP skills" and `@github` "GitHub skills" terminology used in Copilot Chat. Cited in §2.1.
- [Manage agent skills with GitHub CLI (GitHub Changelog, 2026-04-16)](https://github.blog/changelog/2026-04-16-manage-agent-skills-with-github-cli/)— Announcement of `gh skill` (GitHub CLI v2.90.0+), immutable releases, tree-SHA change detection, version pinning, portable provenance, supported agent hosts. Cited in §§1, 3, 5, 6.3.
- [GitHub CLI homepage (cli.github.com)](https://cli.github.com/) — Install instructions for the `gh` CLI used by `gh skill`. Cited in §3.

### GitHub REST API (source for the star counts in §7.2, read 2026-04-21)

- [api.github.com/repos/anthropics/skills](https://api.github.com/repos/anthropics/skills)
- [api.github.com/repos/github/awesome-copilot](https://api.github.com/repos/github/awesome-copilot)
- [api.github.com/repos/agentskills/agentskills](https://api.github.com/repos/agentskills/agentskills)
- [api.github.com/repos/github/copilot-sdk](https://api.github.com/repos/github/copilot-sdk)

### GitHub Repositories

- [`agentskills/agentskills`](https://github.com/agentskills/agentskills) — Open Agent Skills specification and reference SDK (maintained by Anthropic + community). Cited in §§1, 7.
- [`anthropics/skills`](https://github.com/anthropics/skills) — Large public library of example skills, cross-agent. Cited in §7.
- [`github/awesome-copilot`](https://github.com/github/awesome-copilot) — Official GitHub-curated community repository of Copilot instructions, agents, and skills. Cited in §§3, 6.3, 7.
- [`github/copilot-sdk`](https://github.com/github/copilot-sdk) — Multi-platform SDK (Node, Python, Go, .NET) with `skillDirectories` / `disabledSkills` session options. Cited in §§4.3, 7.

### Code Samples

- [`anthropics/skills` repository](https://github.com/anthropics/skills) — Large public library of example `SKILL.md` folders used as the canonical code-sample corpus referenced in §§3 and 7.

---

## Revision Round 2 — 2026-04-21

Findings from [agent-reviews/2026-04-21-web-research-reviewer-copilot-skills.md](../agent-reviews/2026-04-21-web-research-reviewer-copilot-skills.md) Round 1 (verdict: APPROVED WITH EDITS) addressed in this revision:

- 🟡 Important — Unsourced operational/security claims in §§5-7: ✅ fixed. Added inline citations for `COPILOT_SKILLS_DIRS` being comma-separated (§5 → CLI command reference), `--pin` and "executable in effect" (§5 → April 16 2026 changelog), plugin-managed skills appearing in `/skills list` (§6.2 → CLI command reference), temporary/scoped pre-approval semantics (§6.1 → CLI authoring page), supported agent hosts for `gh skill` (§6.3 → changelog), and the `skill` tool being denyable via the CLI's standard tool-permission patterns (§6.6 → CLI command reference).
- 🟡 Important — Time-sensitive star counts without API source or "as of" timestamp: ✅ fixed. §7.2 table now shows the `api.github.com/repos/...` URL each count came from and states "as of 2026-04-21"; §8 limitations note updated to reflect this; the four API URLs are now listed in §9 under a new "GitHub REST API" subsection.
- 🟡 Important — Ellipsis-compressed "verbatim" quotes in §1 and §2.8: ✅ fixed. Both blockquotes were converted to clearly-labelled paraphrases with inline citations to the "Comparing CLI customization features" page, so they are no longer presented as verbatim.
- 🟡 Important — Missing post-block `> — Source: ... | Provenance: ...` lines on multiple fenced examples: ✅ fixed. Added attribution lines after: the minimum-skill tree (§2.2), the flow diagram (§2.6), the "Hello, skill" bash walkthrough (§3), the image-convert directory tree (§4.1), the `image-convert` frontmatter snippet (§6.1), and the `gh skill` command block (§6.3). Each line now labels verbatim / adapted / synthesised.
- 🟡 Important — Insufficient CLI-vs-VS Code nuance: ✅ fixed. Added a new "CLI vs VS Code: concrete differences" subsection in §2.7 with a per-surface table covering authoring, skill locations, management UI, explicit invocation, plugins, `COPILOT_SKILLS_DIRS`, and telemetry. The subsection states explicitly that CLI slash-command workflows (`/skills list`, etc.) are *not* documented on docs.github.com for VS Code and must be verified in VS Code's own docs, and calls out that `SKILL.md` folder portability is the only cross-surface guarantee.
- 🟡 Important — Reference inventory inconsistencies: ✅ fixed. Header "Sources consulted" count updated to `13 web pages + 4 GitHub repositories + 1 in-repo code sample` to match §9. `cli.github.com` added to the reference list (now also appears with a trailing slash in §3). A new "GitHub REST API" reference subsection lists the four `api.github.com/repos/...` endpoints used for §7.2 star counts, matching the §8 limitations mention. Previously orphaned references (`About GitHub Copilot CLI`, `Overview of customizing GitHub Copilot CLI`) now have explicit in-list notes describing where/how they were used; the `github/copilot-sdk` in-repo code-sample URL is now explicitly cross-referenced to §4.3.
- 🟢 Minor — POSIX-only shell assumptions in §3: ✅ fixed. Added a short note before the terminal block explaining the PowerShell equivalents for `mkdir -p` and the `cat <<'EOF' ... EOF` heredoc.

No findings were disputed, and no must-fix findings were skipped. The report is ready for re-review by `web-research-reviewer`.

## Revision Round 3 — 2026-04-21

Round 2 remaining 🟡 Important items addressed: added `> — Source: ... | Provenance: ...` immediately after the §2.2 minimum-tree block and after the §2.6 flow diagram; normalized the §3 terminal block's attribution from `Sources` to the singular `Source`; reconciled the header count to match §9's 22 URL entries (13 docs/articles + 4 REST API + 4 repos + 1 code sample); removed the 3 orphaned references (`About GitHub Copilot CLI`, `Overview of customizing GitHub Copilot CLI`, and the `github/copilot-sdk/blob/main/docs/features/skills.md` code-sample URL — the Code Samples entry now points to the `anthropics/skills` repository actually cited in the body). Ready for re-review.

## Revision Round 4 — 2026-04-21

Round 3 remaining 🟡 Important item addressed: corrected the header `Sources consulted` line to match §9's actual inventory (20 URL entries / 11 documentation-article URLs + 4 REST API + 4 repos + 1 code sample). Ready for re-review.
