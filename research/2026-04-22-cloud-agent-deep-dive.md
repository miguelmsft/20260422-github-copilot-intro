# Research Report: GitHub Copilot Cloud Agent (formerly "Copilot coding agent") — Deep Dive

**Date:** 2026-04-22
**Researcher:** Copilot Web Researcher Agent
**Topic slug:** cloud-agent-deep-dive
**Sources consulted:** 13 GitHub Docs pages, 2 GitHub Blog/Changelog posts (15 total)

---

## Executive Summary

GitHub Copilot **Cloud Agent** — which GitHub's concept documentation labels as "formerly Copilot coding agent" ([About GitHub Copilot cloud agent](https://docs.github.com/en/copilot/concepts/coding-agent/coding-agent)) — is an asynchronous, autonomous agent that runs **in GitHub's cloud on a GitHub Actions‑powered ephemeral development environment** and delivers its work as a **pull request** ([About GitHub Copilot cloud agent](https://docs.github.com/en/copilot/concepts/coding-agent/coding-agent); [Configure the development environment](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/customize-the-agent-environment)). You hand it a task — by assigning a GitHub Issue to `Copilot`, mentioning `@copilot` in a PR comment on an open pull request, starting a session from the agents panel on GitHub.com, delegating from Copilot CLI with `/delegate`, or invoking it from IDE Copilot Chat, GitHub Mobile, Raycast, or any MCP‑capable client — and it researches the repo, plans, edits code on its own branch, runs tests/linters in its sandbox, and opens a draft PR for human review ([Asking GitHub Copilot to create a pull request](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/create-a-pr); [Delegating tasks to GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli-agents/delegate-tasks-to-cca); [Troubleshooting GitHub Copilot cloud agent](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/troubleshoot-cloud-agent)).

For a beginner audience the two most important framings are: (1) **Cloud Agent ≠ IDE agent mode / Copilot CLI.** Cloud Agent works "autonomously in a GitHub Actions-powered environment" and communicates via PRs, whereas "agent mode in your IDE makes autonomous edits directly in your local development environment" ([About GitHub Copilot cloud agent](https://docs.github.com/en/copilot/concepts/coding-agent/coding-agent)). (2) **It is governed by normal GitHub controls.** Branch protections, required reviews, rulesets, organization policies, a per‑agent firewall (default deny with a recommended allowlist), and the rule that GitHub Actions workflows don't auto‑run on Copilot's pushes all still apply ([GitHub Copilot: Meet the new coding agent](https://github.blog/news-insights/product-news/github-copilot-meet-the-new-coding-agent/); [Customizing or disabling the firewall for GitHub Copilot cloud agent](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/customize-the-agent-firewall); [Configuring settings for GitHub Copilot cloud agent](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/configuring-agent-settings)). Model selection in supported entry points is currently **Auto, Claude Sonnet 4.5, Claude Opus 4.7, GPT‑5.2‑Codex** ([Changing the AI model for GitHub Copilot cloud agent](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/changing-the-ai-model)), and session cost is "one premium request per session, multiplied by the model's rate" plus one per steering comment, on top of GitHub Actions minutes, drawn from plan entitlements before overage ([About premium requests](https://docs.github.com/en/copilot/concepts/billing/copilot-requests); [About GitHub Copilot cloud agent](https://docs.github.com/en/copilot/concepts/coding-agent/coding-agent)).

Cloud Agent is best suited to **"low-to-medium complexity tasks in well-tested codebases"** — features, bug fixes, test extension, refactors, documentation ([GitHub Copilot coding agent in public preview](https://github.blog/changelog/2025-05-19-github-copilot-coding-agent-in-public-preview/); preview‑era guidance, still echoed in the current concept doc's list of tasks). The `/delegate` command in Copilot CLI is the same underlying cloud service — it "push[es] your current session to Copilot cloud agent on GitHub" and causes Cloud Agent to "open a draft pull request, make changes in the background, and request a review from you" ([Delegating tasks to GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli-agents/delegate-tasks-to-cca)).

---

## Table of Contents

1. [Overview](#1-overview)
2. [Key Concepts](#2-key-concepts)
3. [How to Trigger the Cloud Agent (Entry Points)](#3-how-to-trigger-the-cloud-agent-entry-points)
4. [The Execution Environment](#4-the-execution-environment)
5. [Model Choices](#5-model-choices)
6. [Customizing the Environment (`copilot-setup-steps.yml`)](#6-customizing-the-environment-copilot-setup-stepsyml)
7. [Permissions, Security, and Firewall](#7-permissions-security-and-firewall)
8. [Availability, Limits, and Timeouts](#8-availability-limits-and-timeouts)
9. [`/delegate` from Copilot CLI — Is It the Same Thing?](#9-delegate-from-copilot-cli--is-it-the-same-thing)
10. [Good Fits: Cloud vs. Local (CLI / VS Code)](#10-good-fits-cloud-vs-local-cli--vs-code)
11. [Cost / Premium Request Accounting (Appendix)](#11-cost--premium-request-accounting-appendix)
12. [Research Limitations](#12-research-limitations)
13. [Complete Reference List](#13-complete-reference-list)

---

## 1. Overview

### What It Is

Copilot Cloud Agent is an autonomous agent that runs in a GitHub‑hosted sandbox, completes coding tasks in the background, and returns work as a pull request.

> "Copilot can research a repository, create an implementation plan, and make code changes on a branch. You can review the diff, iterate, and create a pull request when you're ready."
> — Source: [About GitHub Copilot cloud agent](https://docs.github.com/en/copilot/concepts/coding-agent/coding-agent)

> "With Copilot cloud agent, GitHub Copilot can work independently in the background to complete tasks, just like a human developer."
> — Source: [About GitHub Copilot cloud agent](https://docs.github.com/en/copilot/concepts/coding-agent/coding-agent)

### How It Differs from IDE Agent Mode and Copilot CLI

> "Copilot cloud agent is distinct from the 'agent mode' feature available in your IDE. Copilot cloud agent works autonomously in a GitHub Actions-powered environment to complete development tasks assigned through GitHub issues or GitHub Copilot Chat prompts. It can research a repository, create a plan, make code changes on a branch, and optionally open a pull request. In contrast, agent mode in your IDE makes autonomous edits directly in your local development environment."
> — Source: [About GitHub Copilot cloud agent](https://docs.github.com/en/copilot/concepts/coding-agent/coding-agent)

| Dimension | Cloud Agent | IDE agent mode / Copilot CLI |
|---|---|---|
| Where it runs | GitHub Actions ephemeral VM in the cloud | Your local machine (IDE or terminal) |
| How you interact | Async — via Issue assignment, PR comments, agents panel | Sync — chat UI or REPL |
| Output | Draft pull request on a branch | Local file edits / commits |
| Runs tests | Inside the agent's sandbox | Uses your local toolchain |
| Best for | Backlog issues, parallel tasks, hand‑offs | Pair‑programming flow, tight iteration |

### Why It Matters

> "With Copilot cloud agent, all coding and iterating happens on GitHub. You can ask Copilot to research a repository, create a plan, and make code changes on a branch—all before opening a pull request. … Copilot automates branch creation, commit message writing, and pushing. Developers let the agents work in the background and then chooses to create a pull request when ready. Working on GitHub adds transparency, with every step happening in a commit and being viewable in logs, and opens up collaboration opportunities for the entire team."
> — Source: [About GitHub Copilot cloud agent](https://docs.github.com/en/copilot/concepts/coding-agent/coding-agent)

### Key Features

- Runs asynchronously in an ephemeral GitHub Actions environment ([Configure the development environment](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/customize-the-agent-environment)).
- Opens a **draft pull request** and pushes commits to it as it works ([GitHub Copilot: Meet the new coding agent](https://github.blog/news-insights/product-news/github-copilot-meet-the-new-coding-agent/); [Asking GitHub Copilot to create a pull request](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/create-a-pr)).
- Session logs stream live; every commit links back to the session log ([Tracking GitHub Copilot's sessions](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/track-copilot-sessions)).
- Respects branch protections, rulesets, required reviews, and repo/org policies ([GitHub Copilot: Meet the new coding agent](https://github.blog/news-insights/product-news/github-copilot-meet-the-new-coding-agent/); [About GitHub Copilot cloud agent](https://docs.github.com/en/copilot/concepts/coding-agent/coding-agent)).
- Configurable per‑repo via `.github/workflows/copilot-setup-steps.yml` ([Configure the development environment](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/customize-the-agent-environment)).
- Customizable firewall (default deny + recommended allowlist) ([Customizing or disabling the firewall for GitHub Copilot cloud agent](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/customize-the-agent-firewall)).
- Per‑task model selection in supported entry points (Auto, Claude Sonnet 4.5, Claude Opus 4.7, GPT‑5.2‑Codex) ([Changing the AI model for GitHub Copilot cloud agent](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/changing-the-ai-model)).
- Integrates with Jira, Azure Boards, Linear, Slack, Teams, Raycast, and any MCP‑capable client ([GitHub Copilot cloud agent how-tos index](https://docs.github.com/en/copilot/how-tos/agents/coding-agent); [Asking GitHub Copilot to create a pull request](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/create-a-pr)).
- Can be **steered** mid‑session via comments on the PR or via the agents panel ([Tracking GitHub Copilot's sessions](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/track-copilot-sessions); [Troubleshooting GitHub Copilot cloud agent](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/troubleshoot-cloud-agent)).

---

## 2. Key Concepts

### The Session

A "session" is one invocation of Cloud Agent on a task. It begins when you prompt Copilot (e.g., assign an Issue or mention `@copilot`) and ends when the agent finishes, times out, or is cancelled.

> "A session begins when you prompt Copilot to undertake a task. In addition, each real-time steering comment made during an active session uses one premium request per session, multiplied by the model's rate."
> — Source: [About premium requests](https://docs.github.com/en/copilot/concepts/billing/copilot-requests)

Every commit Cloud Agent makes is authored by Copilot with the human who started the task marked as co‑author; commit messages link back to the session log; commits are signed and marked "Verified."

> "Every commit is authored by Copilot, with the human who started the task marked as the co-author. Each commit message includes a link to the session logs for that commit, so you can understand why Copilot made a change during code review or trace it later for auditing purposes. Commits from Copilot cloud agent are signed and appear as 'Verified' on GitHub."
> — Source: [Tracking GitHub Copilot's sessions](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/track-copilot-sessions)

### The Draft PR as the Communication Surface

Cloud Agent opens a draft PR early and pushes incrementally. You review the diff, comment, and the agent picks up your feedback.

> "Once Copilot is done, it'll tag you for review and you can leave comments asking for it to make changes. It will pick those comments up automatically and propose code changes."
> — Source: [GitHub Copilot: Meet the new coding agent](https://github.blog/news-insights/product-news/github-copilot-meet-the-new-coding-agent/)

### Research / Plan / Iterate (GitHub.com only)

> "Deep research, planning, and iterating on code changes before creating a pull request are only available with Copilot cloud agent on GitHub.com. Cloud agent integrations (such as Azure Boards, JIRA, Linear, Slack, or Teams) only support creating a pull request directly."
> — Source: [About GitHub Copilot cloud agent](https://docs.github.com/en/copilot/concepts/coding-agent/coding-agent)

### Custom Agents, MCP, Hooks, Skills

Cloud Agent is extensible:

> "Custom instructions … Model Context Protocol (MCP) servers … Custom agents … Hooks allow you to execute custom shell commands at key points during agent execution … Skills allow you to enhance the ability of Copilot to perform specialized tasks with instructions, scripts, and resources."
> — Source: [About GitHub Copilot cloud agent](https://docs.github.com/en/copilot/concepts/coding-agent/coding-agent)

---

## 3. How to Trigger the Cloud Agent (Entry Points)

Official entry points (per the docs):

> "You can ask Copilot to create a new pull request from: GitHub Issues, by assigning an issue to Copilot. The agents tab or panel on GitHub. The dashboard on GitHub. Copilot Chat in Visual Studio Code, JetBrains IDEs, Eclipse and Visual Studio 2026. Copilot Chat on GitHub.com. The GitHub CLI. On GitHub Mobile. Your preferred IDE or agentic coding tool with Model Context Protocol (MCP) support. The Raycast launcher. The 'New repository' form on GitHub."
> — Source: [Asking GitHub Copilot to create a pull request](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/create-a-pr)

### 3.1 Assigning an Issue (the canonical flow)

Navigate to the Issue → **Assignees** → select **Copilot**. You can provide an optional prompt, choose the repo and base branch, pick a model (Pro/Pro+), and optionally pick a custom agent.

> "In the right side menu, click Assignees. Click Copilot from assignees list. … In the Optional prompt field you can add specific guidance for Copilot. … You can use the dropdown menus in the dialog to change the repository that Copilot will work in and the branch that it will branch off from."
> — Source: [Asking GitHub Copilot to create a pull request](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/create-a-pr)

Important: the issue title, description, and comments at the time of assignment are sent to the agent — but later comments on the *issue* are ignored.

> "After assigning the issue, Copilot will not be aware of, and therefore won't react to, any further comments that are added to the issue. If you have more information, or changes to the original requirement, add this as a comment in the pull request that Copilot raises."
> — Source: [Asking GitHub Copilot to create a pull request](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/create-a-pr)

### 3.2 Mentioning `@copilot` on an Existing PR

Mention `@copilot` in a comment on an *open* PR that is assigned to Copilot to request further changes. The agent adds an 👀 reaction to acknowledge.

> "Copilot only responds to comments from people who have write access to the repository. If you do have write access, and you mention @copilot on a pull request that is assigned to Copilot, the comment is passed to Copilot cloud agent. An eyes emoji (👀) is added to your comment to indicate that Copilot cloud agent has seen your comment. … Note that Copilot only responds to mentions in open pull requests. Once a pull request is merged or closed, Copilot cloud agent will not respond to new mentions or comments."
> — Source: [Troubleshooting GitHub Copilot cloud agent](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/troubleshoot-cloud-agent)

### 3.3 The agents panel / agents tab on GitHub.com

Clickable panel in the GitHub.com nav; lists running and past sessions, lets you kick off new ones, and supports **deep research, planning, and iteration** before the PR is created.

### 3.4 From Copilot CLI — `/delegate`

From an interactive Copilot CLI session, hand off the current task to Cloud Agent.

> "The delegate command lets you push your current session to Copilot cloud agent on GitHub. This lets you hand off work while preserving all the context Copilot needs to complete your task. You can delegate a task using the slash command, followed by a prompt: `/delegate complete the API integration tests and fix any failing edge cases`. Alternatively, prefix a prompt with `&` to delegate it: `& complete the API integration tests and fix any failing edge cases`. Copilot will ask to commit any of your unstaged changes as a checkpoint in a new branch it creates. Copilot cloud agent will open a draft pull request, make changes in the background, and request a review from you."
> — Source: [Delegating tasks to GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli-agents/delegate-tasks-to-cca)

### 3.5 From VS Code / JetBrains / Eclipse / Visual Studio 2026

Ask Copilot Chat to open a PR. Per the troubleshooting docs, in VS Code, Visual Studio, and JetBrains IDEs you must mention the `@github` chat participant in your prompt; on GitHub.com you can omit it. (The `create-a-pr` doc lists Eclipse as an entry point; the `@github` mention requirement is documented explicitly only for VS Code, Visual Studio, and JetBrains.)

> "In VS Code, Visual Studio, and JetBrains IDEs, you must mention the @github chat participant in your prompt. You can omit this in Copilot Chat on GitHub.com."
> — Source: [Troubleshooting GitHub Copilot cloud agent](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/troubleshoot-cloud-agent)

Example phrasing from GitHub's blog:

> "> @github Open a pull request to refactor this query generator into its own class"
> — Source: [GitHub Copilot: Meet the new coding agent](https://github.blog/news-insights/product-news/github-copilot-meet-the-new-coding-agent/)

### 3.6 From the GitHub CLI (`gh`)

Assign an Issue to Copilot via `gh issue edit`. Track sessions with `gh agent-task list` / `gh agent-task view` (preview, v2.80.0+).

> "The agent-task command set is only available in v2.80.0 or later of the GitHub CLI. This command set is a public preview and is subject to change. You can see a list of your running and past agent sessions from the GitHub CLI with the `gh agent-task list` command. … To see more information on a specific session, use the `gh agent-task view` command. … To view the session logs, add the `--log` option. Optionally, use the `--follow` option to stream live logs as the agent works."
> — Source: [Tracking GitHub Copilot's sessions](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/track-copilot-sessions)

### 3.7 Other entry points

GitHub Mobile, Raycast, third‑party tool integrations (Jira, Azure Boards, Linear, Slack, Teams), any MCP‑capable agent, the "New repository" form, and security‑campaign alert assignment.

---

## 4. The Execution Environment

### Ephemeral GitHub Actions Sandbox

> "While working on a task, Copilot has access to its own ephemeral development environment, powered by GitHub Actions, where it can explore your code, make changes, execute automated tests and linters and more."
> — Source: [Configure the development environment](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/customize-the-agent-environment)

Default OS is Ubuntu Linux on GitHub‑hosted runners; Windows and self‑hosted runners are opt‑in.

> "You can customize Copilot's development environment with a Copilot setup steps file. You can use a Copilot setup steps file to: Preinstall tools or dependencies in Copilot's environment. Upgrade from standard GitHub-hosted GitHub Actions runners to larger runners. Run on GitHub Actions self-hosted runners. Give Copilot a Windows development environment, instead of the default Ubuntu Linux environment. Enable Git Large File Storage (LFS)."
> — Source: [Configure the development environment](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/customize-the-agent-environment)

### What the Agent Does Inside the Sandbox

From the public‑preview announcement:

> "Once an issue is assigned to it, the agent adds an 👀 emoji reaction and starts its work in the background. It boots a virtual machine, clones the repository, configures the environment, and analyzes the codebase with advanced retrieval augmented generation (RAG) powered by GitHub code search. As the agent works, it regularly pushes its changes to a draft pull request as git commits and updates the pull request's description."
> — Source: [GitHub Copilot: Meet the new coding agent](https://github.blog/news-insights/product-news/github-copilot-meet-the-new-coding-agent/)

### Image / Screenshot Input

> "The maximum image size allowed by Copilot cloud agent is 3.00 MiB. Images larger than this will be removed from the request."
> — Source: [Troubleshooting GitHub Copilot cloud agent](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/troubleshoot-cloud-agent)

### Managed User Accounts

> "Copilot cloud agent is not available in personal repositories owned by managed user accounts. This is because Copilot cloud agent runs on GitHub-hosted runners, which are not available to personal repositories owned by managed user accounts."
> — Source: [Troubleshooting GitHub Copilot cloud agent](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/troubleshoot-cloud-agent)

---

## 5. Model Choices

### Supported Models

> "The following options are currently available: Auto, Claude Sonnet 4.5, Claude Opus 4.7, GPT-5.2-Codex. Note If you select Auto, Copilot auto model selection will select the best model based on availability and to help reduce rate limiting."
> — Source: [Changing the AI model for GitHub Copilot cloud agent](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/changing-the-ai-model)

### Where Model Selection Is Available

> "Model selection for Copilot cloud agent is only supported when assigning an issue to Copilot on GitHub.com, when mentioning @copilot in a pull request comment on GitHub.com, or when starting a task from the agents tab, agents panel, GitHub Mobile or the Raycast launcher. Where a model picker is not available, Auto will be used automatically."
> — Source: [Changing the AI model for GitHub Copilot cloud agent](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/changing-the-ai-model)

So model choice is **per run**, from supported entry points; all other entry points fall back to **Auto**. Pro/Pro+ users see the model dropdown when assigning an Issue; Business/Enterprise users in those entry points also get access, subject to org/enterprise model policies.

> "Optionally, if you are a GitHub Copilot Pro or GitHub Copilot Pro+ user, you can use the dropdown menu to select the model that Copilot will use."
> — Source: [Asking GitHub Copilot to create a pull request](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/create-a-pr)

### Per‑Repo / Per‑Org?

The docs do not expose a "pin a model for all Cloud Agent runs in this repo" setting. Model selection is per‑task in supported entry points; admins control *which* models are allowed at the org/enterprise level via standard Copilot model policies.

---

## 6. Customizing the Environment (`copilot-setup-steps.yml`)

Create `.github/workflows/copilot-setup-steps.yml` with a single job named `copilot-setup-steps`. Steps run *before* the agent starts.

> "You can customize Copilot's environment by creating a special GitHub Actions workflow file, located at `.github/workflows/copilot-setup-steps.yml` within your repository. A copilot-setup-steps.yml file looks like a normal GitHub Actions workflow file, but must contain a single `copilot-setup-steps` job. The steps in this job will be executed in GitHub Actions before Copilot starts working."
> — Source: [Configure the development environment](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/customize-the-agent-environment)

> "The copilot-setup-steps.yml workflow won't trigger unless it's present on your default branch."
> — Source: [Configure the development environment](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/customize-the-agent-environment)

### Allowed Fields

> "In your copilot-setup-steps.yml file, you can only customize the following settings of the copilot-setup-steps job. If you try to customize other settings, your changes will be ignored. steps (see above), permissions (see above), runs-on (see below), services, snapshot, timeout-minutes (maximum value: 59)."
> — Source: [Configure the development environment](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/customize-the-agent-environment)

Note: `fetch-depth` on `actions/checkout` is overridden:

> "Any value that is set for the fetch-depth option of the actions/checkout action will be overridden to allow the agent to rollback commits upon request, while mitigating security risks."
> — Source: [Configure the development environment](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/customize-the-agent-environment)

### Example (TypeScript / Node) — excerpt

The following is a verbatim excerpt from GitHub's docs. The final `steps:` block is truncated with `# ...` in the source to indicate that you insert your project‑specific steps there (e.g., `actions/setup-node@v4`, `npm ci`).

```yaml
# Source: https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/customize-the-agent-environment
name: "Copilot Setup Steps"

# Automatically run the setup steps when they are changed to allow for easy validation, and
# allow manual testing through the repository's "Actions" tab
on:
  workflow_dispatch:
  push:
    paths:
      - .github/workflows/copilot-setup-steps.yml
  pull_request:
    paths:
      - .github/workflows/copilot-setup-steps.yml

jobs:
  # The job MUST be called `copilot-setup-steps` or it will not be picked up by Copilot.
  copilot-setup-steps:
    runs-on: ubuntu-latest
    # Set the permissions to the lowest permissions possible needed for your steps.
    # Copilot will be given its own token for its operations.
    permissions:
      # If you want to clone the repository as part of your setup steps, for example to install dependencies,
      # you'll need the `contents: read` permission.
      # If you don't clone the repository in your setup steps, Copilot will do this for you automatically
      # after the steps complete.
      contents: read
    # You can define any steps you want, and they will run before the agent starts.
    # If you do not check out your code, Copilot will do this for you.
    steps:
      # ...  (insert your project-specific setup steps here — e.g., actions/setup-node, npm ci)
```
> — Source: [Configure the development environment](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/customize-the-agent-environment) | Provenance: verbatim excerpt (the final trailing comment is adapted to make the excerpt nature explicit)

### Other Environment Knobs

- Environment variables can be set for Copilot's environment.
- Organization owners can set the default runner type and whether repos may override it.

> "Organization owners can configure the default runner type for Copilot cloud agent across all repositories in their organization, and choose whether repositories are allowed to override this default."
> — Source: [Configure the development environment](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/customize-the-agent-environment)

---

## 7. Permissions, Security, and Firewall

### Default Security Posture (from the announcement)

> "The agent can only push to branches it created, keeping your default branch and the ones your team created safe and secure. The developer who asks the agent to open a pull request cannot be the one to approve it – so any 'required reviews' rule you have set up in your repository will be honored. The agent's internet access is tightly limited to a trusted list of destinations that you can customize. GitHub Actions workflows won't run without your approval, giving you the chance to spot-check the agent's code. Existing repository rulesets and organization policies are considered as well."
> — Source: [GitHub Copilot: Meet the new coding agent](https://github.blog/news-insights/product-news/github-copilot-meet-the-new-coding-agent/)

### Who Can Steer

> "Copilot only responds to comments from people who have write access to the repository."
> — Source: [Troubleshooting GitHub Copilot cloud agent](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/troubleshoot-cloud-agent)

### GitHub Actions on Copilot's Pushes

> "By default, GitHub Actions workflows will not run automatically when Copilot pushes changes to a pull request. GitHub Actions workflows can be privileged and have access to sensitive secrets. Inspect the proposed changes in the pull request and ensure that you are comfortable running your workflows on the pull request branch. You should be especially alert to any proposed changes in the .github/workflows/ directory that affect workflow files. To allow GitHub Actions workflows to run, click the Approve and run workflows button in the pull request's merge box."
> — Source: [Configuring settings for GitHub Copilot cloud agent](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/configuring-agent-settings)

You *can* flip this to auto‑run, with an explicit warning:

> "Warning: Allowing GitHub Actions workflows to run without approval may allow unreviewed code written by Copilot to gain write access to your repository or access your GitHub Actions secrets."
> — Source: [Configuring settings for GitHub Copilot cloud agent](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/configuring-agent-settings)

### Built‑in Code Quality & Security Validation

> "By default, Copilot cloud agent checks code it generates for security issues and gets a second opinion on its code with Copilot code review. It attempts to resolve issues identified prior to completing the pull request."
> — Source: [Configuring settings for GitHub Copilot cloud agent](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/configuring-agent-settings)

### The Firewall

> "By default, Copilot's access to the internet is limited by a firewall. Limiting internet access helps manage data exfiltration risks. Unexpected behavior from Copilot, or malicious instructions, could lead to code or other sensitive information being leaked to remote locations. The firewall always allows access to a number of hosts that Copilot uses to interact with GitHub. By default, a recommended allowlist is also enabled to allow the agent to download dependencies."
> — Source: [Customizing or disabling the firewall for GitHub Copilot cloud agent](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/customize-the-agent-firewall)

Recommended allowlist contents:

> "Common operating system package repositories (for example, Debian, Ubuntu, Red Hat). Common container registries (for example, Docker Hub, Azure Container Registry, AWS Elastic Container Registry). Packages registries used by popular programming languages (C#, Dart, Go, Haskell, Java, JavaScript, Perl, PHP, Python, Ruby, Rust, Swift). Common certificate authorities (to allow SSL certificates to be validated). Hosts used to download web browsers for the Playwright MCP server."
> — Source: [Customizing or disabling the firewall for GitHub Copilot cloud agent](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/customize-the-agent-firewall)

Firewall **limitations** (important caveat for security slides):

> "Only applies to processes started by the agent: The firewall only applies to processes started by the agent via its Bash tool. It does not apply to Model Context Protocol (MCP) servers or processes started in configured Copilot setup steps. Only applies within the GitHub Actions appliance: The firewall only operates within the GitHub Actions appliance environment. It does not apply to processes running outside of this environment. Bypass potential: Sophisticated attacks may bypass the firewall, potentially allowing unauthorized network access and data exfiltration."
> — Source: [Customizing or disabling the firewall for GitHub Copilot cloud agent](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/customize-the-agent-firewall)

When a request is blocked, the warning surfaces in the PR body or a comment:

> "If Copilot tries to make a request which is blocked by the firewall, a warning is added to the pull request body (for new pull requests) or to a comment (for existing pull requests). The warning shows the blocked address and the command that tried to make the request."
> — Source: [Customizing or disabling the firewall for GitHub Copilot cloud agent](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/customize-the-agent-firewall)

### Enable / Disable Controls

Enterprise owners / AI managers:

> "Copilot cloud agent and use of third-party MCP servers are disabled by default. You can enable these features for users who receive a Copilot license from your enterprise or organizations. … At the top of the page, click AI controls. In the left sidebar, click Agents. Under 'Available agents', click Copilot Cloud Agent. Select a global policy for Copilot cloud agent."
> — Source: [Enabling GitHub Copilot cloud agent in your enterprise](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-agents/enable-copilot-cloud-agent)

Organization owners:

> "By default, Copilot cloud agent is available in all repositories for users who have access to the agent, but you can block it from being used in some or all repositories owned by your organization."
> — Source: [Adding GitHub Copilot cloud agent to your organization](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-organization/add-copilot-cloud-agent)

### Incompatible Rules

> "Copilot isn't able to comply with certain rules that may be configured for your repository. If you have configured a ruleset or branch protection rule that isn't compatible with Copilot cloud agent, access to the agent will be blocked. For example, a rule that only allows specific commit authors can prevent Copilot cloud agent from creating or updating pull requests. If the rule is configured using rulesets, you can add Copilot as a bypass actor to enable access."
> — Source: [About GitHub Copilot cloud agent](https://docs.github.com/en/copilot/concepts/coding-agent/coding-agent)

### Content Exclusion Caveat

> "Copilot cloud agent doesn't account for content exclusions. Content exclusions allow administrators to configure Copilot to ignore certain files. When using Copilot cloud agent, Copilot will not ignore these files, and will be able to see and update them."
> — Source: [About GitHub Copilot cloud agent](https://docs.github.com/en/copilot/concepts/coding-agent/coding-agent)

---

## 8. Availability, Limits, and Timeouts

### Plan Availability

> "Copilot cloud agent is available with the GitHub Copilot Pro, GitHub Copilot Pro+, GitHub Copilot Business and GitHub Copilot Enterprise plans. The agent is available in all repositories stored on GitHub, except repositories owned by managed user accounts and where it has been explicitly disabled."
> — Source: [About GitHub Copilot cloud agent](https://docs.github.com/en/copilot/concepts/coding-agent/coding-agent)

(At initial public preview in May 2025 it was Pro+/Enterprise‑only; the docs now show it on Pro, Pro+, Business, and Enterprise — with admin opt‑in required for Business/Enterprise.)

### Session Timeout

> "Copilot can appear to be stuck for a while, and then get moving again. If the session remains stuck, it will time out after an hour."
> — Source: [Troubleshooting GitHub Copilot cloud agent](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/troubleshoot-cloud-agent)

### One PR per Task

> "Copilot can only work on one branch at a time and can open exactly one pull request to address each task it is assigned."
> — Source: [About GitHub Copilot cloud agent](https://docs.github.com/en/copilot/concepts/coding-agent/coding-agent)

### Parallelism

You can assign **multiple** issues at once — each spawns its own session:

> "You can even assign multiple issues to Copilot at the same time."
> — Source: [GitHub Copilot coding agent in public preview (changelog)](https://github.blog/changelog/2025-05-19-github-copilot-coding-agent-in-public-preview/)

A hard numeric concurrent‑session cap per user/org is not published in the docs I reviewed; Auto‑model selection is described as reducing rate limiting.

### Setup‑step timeout

The `timeout-minutes` in `copilot-setup-steps.yml` has a **maximum of 59**.

### Image size

Max 3.00 MiB per attached image (see §4).

### Scope Limits

> "Copilot can only make changes in the repository specified when you start a task. Copilot cannot make changes across multiple repositories in one run."
> — Source: [About GitHub Copilot cloud agent](https://docs.github.com/en/copilot/concepts/coding-agent/coding-agent)

> "Copilot cloud agent only works with repositories hosted on GitHub."
> — Source: [About GitHub Copilot cloud agent](https://docs.github.com/en/copilot/concepts/coding-agent/coding-agent)

---

## 9. `/delegate` from Copilot CLI — Is It the Same Thing?

**Yes — `/delegate` is a client‑side hand‑off into the same Cloud Agent service.** It packages your local CLI session (with its accumulated context) and ships it to Cloud Agent on GitHub, which then runs the rest of the work in the normal GitHub Actions sandbox and opens a draft PR.

> "The delegate command lets you push your current session to Copilot cloud agent on GitHub. This lets you hand off work while preserving all the context Copilot needs to complete your task. … Copilot cloud agent will open a draft pull request, make changes in the background, and request a review from you. Copilot will provide a link to the pull request and agent session on GitHub once the session begins."
> — Source: [Delegating tasks to GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli-agents/delegate-tasks-to-cca)

Two ways to invoke it in the CLI:

```text
/delegate complete the API integration tests and fix any failing edge cases
# or, equivalently:
& complete the API integration tests and fix any failing edge cases
```
> — Source: [Delegating tasks to GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli-agents/delegate-tasks-to-cca) | Provenance: verbatim

Mental model for beginners: think of `/delegate` as "send this task to the cloud version of me and I'll keep working on it as a PR."

---

## 10. Good Fits: Cloud vs. Local (CLI / VS Code)

### What Cloud Agent Is Good At

> "Copilot excels at low-to-medium complexity tasks in well-tested codebases, from adding features and fixing bugs to extending tests, refactoring, and improving documentation. You can even assign multiple issues to Copilot at the same time."
> — Source: [GitHub Copilot coding agent in public preview (changelog)](https://github.blog/changelog/2025-05-19-github-copilot-coding-agent-in-public-preview/)

> "Copilot cloud agent can: Research a repository. Create implementation plans. Fix bugs. Implement incremental new features. Improve test coverage. Update documentation. Address technical debt. Resolve merge conflicts."
> — Source: [About GitHub Copilot cloud agent](https://docs.github.com/en/copilot/concepts/coding-agent/coding-agent)

### Guidance for Choosing

| Task profile | Prefer Cloud Agent | Prefer local (CLI / IDE agent mode) |
|---|---|---|
| Small, well‑scoped backlog issue in a tested codebase | ✅ | |
| You want a PR, reviewers, and an audit trail automatically | ✅ | |
| Parallelize many independent tasks | ✅ | |
| You want to watch/intervene every step | | ✅ |
| Exploratory work with rapid local iteration | | ✅ |
| Cross‑repo refactor in one run | ❌ (single‑repo only) | ✅ (or split across runs) |
| Work requires tools/files blocked by content exclusions | ⚠️ (exclusions not enforced) | ✅ |

### Transparency & Traceability Benefits

Cloud Agent work is visible to the whole team by construction — every action shows up as a commit, and each commit links to its session log.

> "Working on GitHub adds transparency, with every step happening in a commit and being viewable in logs, and opens up collaboration opportunities for the entire team."
> — Source: [About GitHub Copilot cloud agent](https://docs.github.com/en/copilot/concepts/coding-agent/coding-agent)

---

## 11. Cost / Premium Request Accounting (Appendix)

### How Cloud Agent Consumes Your Entitlements

> "Copilot cloud agent uses GitHub Actions minutes and Copilot premium requests. Within your monthly usage allowance for GitHub Actions and premium requests, you can ask Copilot cloud agent to work on coding tasks without incurring any additional costs."
> — Source: [About GitHub Copilot cloud agent](https://docs.github.com/en/copilot/concepts/coding-agent/coding-agent)

### Per‑Session Accounting

> "Copilot cloud agent uses one premium request per session, multiplied by the model's rate. A session begins when you prompt Copilot to undertake a task. In addition, each real-time steering comment made during an active session uses one premium request per session, multiplied by the model's rate."
> — Source: [About premium requests](https://docs.github.com/en/copilot/concepts/billing/copilot-requests)

### Dedicated SKU (from Nov 1, 2025)

> "Premium requests for Spark and Copilot cloud agent are tracked in dedicated SKUs from November 1, 2025. This provides better cost visibility and budget control for each AI product."
> — Source: [About premium requests](https://docs.github.com/en/copilot/concepts/billing/copilot-requests)

### Historical Note (preview pricing)

> "Starting June 4th, Copilot coding agent will use one premium request per model request the agent makes. This is a preview feature, and may be changed in the future."
> — Source: [GitHub Copilot coding agent in public preview (changelog)](https://github.blog/changelog/2025-05-19-github-copilot-coding-agent-in-public-preview/)

Note the shift from "one premium request per *model request*" (preview) to "one premium request per *session*" (current docs) — the current concept doc is authoritative for billing behavior today.

---

## 12. Research Limitations

- **Concurrent‑session caps:** The docs describe that you can assign multiple issues simultaneously and that `Auto` model selection reduces rate limiting, but I did not find a publicly documented numeric cap on concurrent Cloud Agent sessions per user / org. Treat any specific number as unverified.
- **Per‑repo "pinned" model:** No documented mechanism to force a specific model for all Cloud Agent runs in a repo; model is selected per task in supported entry points, else Auto. Policy‑level model restrictions live at org/enterprise.
- **Rate limits:** Quantitative rate limits for Cloud Agent sessions are not spelled out in the pages I consulted; only references to model rate multipliers and Auto's role in mitigating rate limiting.
- **Pricing drift:** The billing rules have already changed once (preview per‑model‑request → current per‑session); verify against the live `copilot-requests` page before citing to customers.
- **Model list volatility:** Model availability changes frequently (Claude Sonnet 4.5, Claude Opus 4.7, and GPT‑5.2‑Codex were current at time of research). Confirm the list immediately before any presentation.
- **Entry‑point set:** New surfaces (e.g., Raycast, Mobile, MCP clients, integrations) continue to roll out; the list above reflects current docs but may grow.
- **Scope boundary:** This report does not deep‑dive custom agents, hooks, MCP extension patterns, third‑party agent integrations, or Jira/Slack/Teams UX — those are linked from the how‑tos index and are out of scope for the two slides being authored.

---

## 13. Complete Reference List

### GitHub Docs — Concepts
- [About GitHub Copilot cloud agent](https://docs.github.com/en/copilot/concepts/coding-agent/coding-agent) — Canonical overview, "versus agent mode," limitations, costs summary, rebrand note (labels the feature "formerly Copilot coding agent").
- [About premium requests](https://docs.github.com/en/copilot/concepts/billing/copilot-requests) — Session‑based premium request accounting for Cloud Agent; dedicated SKU since Nov 1, 2025.

### GitHub Docs — How‑tos (Use Cloud Agent)
- [GitHub Copilot cloud agent how-tos index](https://docs.github.com/en/copilot/how-tos/agents/coding-agent) — Landing page listing all how-to articles and integrations (Jira, Slack, Teams, Linear, Azure Boards).
- [Asking GitHub Copilot to create a pull request](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/create-a-pr) — All entry points (Issues, agents panel/tab, Chat, CLI, MCP, Mobile, Raycast, "New repo").
- [Changing the AI model for GitHub Copilot cloud agent](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/changing-the-ai-model) — Supported models (Auto, Claude Sonnet 4.5, Claude Opus 4.7, GPT‑5.2‑Codex) and where the picker is available.
- [Configuring settings for GitHub Copilot cloud agent](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/configuring-agent-settings) — Validation tools toggle; Actions workflow auto‑approval.
- [Tracking GitHub Copilot's sessions](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/track-copilot-sessions) — Agents tab, `gh agent-task` (v2.80.0+ preview), VS Code/JetBrains/Eclipse/Raycast/Mobile, session logs, signed commits.
- [Troubleshooting GitHub Copilot cloud agent](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/troubleshoot-cloud-agent) — 1‑hour timeout, write‑access rule, 3.00 MiB image cap, managed‑user caveat, firewall warnings.

### GitHub Docs — How‑tos (Customize Cloud Agent)
- [Configure the development environment](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/customize-the-agent-environment) — `copilot-setup-steps.yml` spec and example.
- [Customizing or disabling the firewall for GitHub Copilot cloud agent](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/customize-the-agent-firewall) — Default allowlist, limitations, org/repo configuration.

### GitHub Docs — How‑tos (Copilot CLI)
- [Delegating tasks to GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli-agents/delegate-tasks-to-cca) — `/delegate` slash command and `&` prefix; hand‑off to Cloud Agent.

### GitHub Docs — How‑tos (Administration)
- [Enabling GitHub Copilot cloud agent in your enterprise](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-agents/enable-copilot-cloud-agent) — Enterprise policy; MCP enablement.
- [Adding GitHub Copilot cloud agent to your organization](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-organization/add-copilot-cloud-agent) — Org‑level policy, repo access control, firewall mgmt.

### GitHub Blog / Changelog
- [GitHub Copilot: Meet the new coding agent](https://github.blog/news-insights/product-news/github-copilot-meet-the-new-coding-agent/) (Thomas Dohmke, May 19, 2025) — Original announcement; architecture and default security policies.
- [GitHub Copilot coding agent in public preview (changelog)](https://github.blog/changelog/2025-05-19-github-copilot-coding-agent-in-public-preview/) (May 19, 2025) — Preview launch, Pro+/Enterprise availability, premium request preview pricing.
