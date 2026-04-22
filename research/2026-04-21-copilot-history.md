# Research Report: GitHub Copilot — Historical Evolution (2021 through April 2026)

**Date:** 2026-04-21
**Researcher:** Copilot Web Researcher Agent
**Topic slug:** copilot-history
**Sources consulted:** 33 web pages (14 GitHub Blog posts, 15 GitHub Changelog entries including the Copilot label index, GitHub Docs landing, VS Code Blog, The Verge, Wikipedia), 0 GitHub repositories (history topic — non-code)

---

## Executive Summary

GitHub Copilot launched on **June 29, 2021** as a technical preview: an in-editor *AI pair programmer* powered by a brand-new OpenAI model called **Codex** (a descendant of GPT-3 fine-tuned on public source code). Its original product was inline code autocompletion in VS Code. Copilot went **generally available to individual developers on June 21, 2022** at $10/month, followed by **Copilot for Business** on **February 14, 2023** at $19/user/month. March 2023's **Copilot X** vision previewed chat, voice, pull-request, CLI, and docs experiences built on GPT-4; **Copilot Chat** reached general availability in **December 2023**, and **Copilot Enterprise** launched in **February 2024** at $39/user/month with codebase-aware Q&A on github.com.

Over 2024 Copilot expanded from an editor feature into a platform: **Copilot Workspace** (technical preview, April 29, 2024) offered a natural-language issue-to-PR environment; **Copilot Extensions** (announced May 2024 at Microsoft Build) opened the assistant to third-party partners; and at **Universe 2024 (Oct 29, 2024)** GitHub introduced **multi-model choice** — Anthropic Claude 3.5 Sonnet, Google Gemini 1.5 Pro, and OpenAI o1-preview/o1-mini alongside OpenAI's GPT-4o. On **December 18, 2024** GitHub shipped a **free tier (Copilot Free)** built into VS Code, coinciding with crossing **150 million developers** on GitHub.

2025 was the year Copilot became **agentic**. On **February 6, 2025** GitHub announced **agent mode** in VS Code (with Copilot Edits GA and Gemini 2.0 Flash) and teased *Project Padawan*. On **May 19, 2025** the **Copilot coding agent** entered public preview — an asynchronous cloud agent you assign GitHub issues to; it went **generally available on September 25, 2025**. **Model Context Protocol (MCP)** support expanded to JetBrains, Eclipse, and Xcode in **August 2025**. At **Universe 2025 (October 28, 2025)** GitHub announced **Agent HQ** — a unified command center that hosts coding agents from Anthropic, OpenAI, Google, Cognition, and xAI on GitHub under a single paid Copilot subscription. By April 2026 Copilot is a multi-surface (IDE, github.com, mobile, CLI), multi-agent, multi-model platform with data-residency (US + EU) and FedRAMP compliance, a Copilot CLI, and a Copilot SDK in public preview. The capability arc is: **autocomplete → chat → multi-file edits → agent mode → autonomous coding agents / Agent HQ**.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Key Concepts](#2-key-concepts)
3. [Year-by-Year Timeline](#3-year-by-year-timeline)
4. [Model Evolution](#4-model-evolution)
5. [Pricing & Tier Evolution](#5-pricing--tier-evolution)
6. [Capability Arc: Autocomplete → Agents](#6-capability-arc-autocomplete--agents)
7. [Notable Controversies & Deprecations](#7-notable-controversies--deprecations)
8. [Consolidated Timeline Table (Slide-Ready)](#8-consolidated-timeline-table-slide-ready)
9. [Research Limitations](#9-research-limitations)
10. [Complete Reference List](#10-complete-reference-list)

---

## 1. Overview

### What It Is
GitHub Copilot is GitHub's AI developer assistant, first shipped as an IDE autocomplete plugin in 2021 ([GitHub Blog, 2021-06-29](https://github.blog/news-insights/product-news/introducing-github-copilot-ai-pair-programmer/)) and now a multi-surface platform (editor, github.com, mobile, CLI) spanning code completion, chat, multi-file edits, autonomous agents, and a growing partner/model ecosystem ([Introducing Agent HQ, 2025-10-28](https://github.blog/news-insights/company-news/welcome-home-agents/)).

### Why It Matters
Copilot was GitHub's and Microsoft's flagship generative-AI developer tool at launch and is widely credited with popularizing the "AI pair programmer" category. GitHub itself reported that "GitHub Copilot is already writing 46% of code and helps developers code up to 55% faster" ([GitHub Copilot X, 2023-03-22](https://github.blog/news-insights/product-news/github-copilot-x-the-ai-powered-developer-experience/)), and the Universe 2023 framing — "today we are re-founded on Copilot" ([Universe 2023 recap](https://github.blog/news-insights/product-news/universe-2023-copilot-transforms-github-into-the-ai-powered-developer-platform/)) — signaled a strategic repositioning around AI-assisted development. Its commercial success preceded and overlaps with a broader wave of AI coding tools (e.g., Cursor, Claude Code, Codeium/Windsurf, Amazon Q Developer, Replit Agent, JetBrains AI Assistant); causal primacy is often claimed in the trade press but is not rigorously established by the primary sources consulted here.

### Key Features (across its history)
- Inline code suggestions (ghost text) in the editor ([2021-06-29](https://github.blog/news-insights/product-news/introducing-github-copilot-ai-pair-programmer/))
- Conversational chat in the IDE and on github.com ([Copilot X, 2023-03-22](https://github.blog/news-insights/product-news/github-copilot-x-the-ai-powered-developer-experience/); [Universe 2023](https://github.blog/news-insights/product-news/universe-2023-copilot-transforms-github-into-the-ai-powered-developer-platform/))
- Multi-file edits ("Copilot Edits") ([Agent awakens, 2025-02-06](https://github.blog/news-insights/product-news/github-copilot-the-agent-awakens/))
- Agent mode (autonomous, local, tool-using) ([VS Code Blog, 2025-02-24](https://code.visualstudio.com/blogs/2025/02/24/introducing-copilot-agent-mode))
- Cloud / coding agent (asynchronous, background, cloud-hosted) ([Meet the new coding agent, 2025-05-19](https://github.blog/ai-and-ml/github-copilot/github-copilot-meet-the-new-coding-agent/))
- Multi-model choice (OpenAI, Anthropic, Google, xAI) ([Bringing developer choice, 2024-10-29](https://github.blog/news-insights/product-news/bringing-developer-choice-to-copilot/); [Agent HQ, 2025-10-28](https://github.blog/news-insights/company-news/welcome-home-agents/))
- Extensions and MCP servers for third-party integrations ([Copilot Extensions, 2024-05-21](https://github.blog/news-insights/product-news/introducing-github-copilot-extensions/); [MCP GA changelog, 2025-08-13](https://github.blog/changelog/2025-08-13-model-context-protocol-mcp-support-for-jetbrains-eclipse-and-xcode-is-now-generally-available/))
- Pull-request summaries, code review, security autofix ([Copilot X, 2023-03-22](https://github.blog/news-insights/product-news/github-copilot-x-the-ai-powered-developer-experience/); [Universe 2023](https://github.blog/news-insights/product-news/universe-2023-copilot-transforms-github-into-the-ai-powered-developer-platform/))
- Free, Pro, Pro+, Business, and Enterprise tiers ([Copilot Free, 2024-12-18](https://github.blog/news-insights/product-news/github-copilot-in-vscode-free/); [Changes to Copilot plans for individuals, 2026-04-20](https://github.blog/changelog/2026-04-20-changes-to-github-copilot-plans-for-individuals))

---

## 2. Key Concepts

### The "Copilot" framing
From the 2021 technical-preview post, Copilot was explicitly positioned as an *assistant*, not a replacement:

> "Today, we are launching a technical preview of GitHub Copilot, a new AI pair programmer that helps you write better code. GitHub Copilot draws context from the code you're working on, suggesting whole lines or entire functions."
> — Source: [Introducing GitHub Copilot: your AI pair programmer (June 29, 2021)](https://github.blog/news-insights/product-news/introducing-github-copilot-ai-pair-programmer/)

### From plugin to platform
At Universe 2023, GitHub reframed Copilot from feature to foundation:

> "Just as GitHub was founded on Git, today we are re-founded on Copilot."
> — Source: [Universe 2023: Copilot transforms GitHub into the AI-powered developer platform (Nov 8, 2023)](https://github.blog/news-insights/product-news/universe-2023-copilot-transforms-github-into-the-ai-powered-developer-platform/)

### Multi-model choice
At Universe 2024, GitHub broke Copilot's OpenAI-exclusive model coupling:

> "We are bringing developer choice to GitHub Copilot with Anthropic's Claude 3.5 Sonnet, Google's Gemini 1.5 Pro, and OpenAI's o1-preview and o1-mini."
> — Source: [Bringing developer choice to Copilot (Oct 29, 2024)](https://github.blog/news-insights/product-news/bringing-developer-choice-to-copilot/)

### Agent mode vs. coding agent
GitHub distinguishes two agentic modes introduced in 2025:

- **Agent mode** (Feb 2025, VS Code): *synchronous*, runs on your machine, you watch it iterate.
- **Copilot coding agent** (May 2025, GA Sep 2025): *asynchronous*, runs in the cloud on GitHub Actions; you assign it an issue and it opens a draft PR.

> "We are excited to introduce a new coding agent for GitHub Copilot. Embedded directly into GitHub, the agent starts its work when you assign a GitHub issue to Copilot or prompt it in VS Code. The agent spins up a secure and fully customizable development environment powered by GitHub Actions."
> — Source: [GitHub Copilot: Meet the new coding agent (May 19, 2025)](https://github.blog/ai-and-ml/github-copilot/github-copilot-meet-the-new-coding-agent/)

### Agent HQ
At Universe 2025, GitHub unified agents across vendors:

> "Over the coming months, coding agents from Anthropic, OpenAI, Google, Cognition, and xAI will be available on GitHub as part of your paid GitHub Copilot subscription."
> — Source: [Introducing Agent HQ: Any agent, any way you work (Oct 28, 2025)](https://github.blog/news-insights/company-news/welcome-home-agents/)

---

## 3. Year-by-Year Timeline

### 2021 — Technical Preview (Codex era)

- **June 29, 2021** — **Technical preview launched.** Announced by then-GitHub-CEO Nat Friedman. Available as a VS Code extension, powered by **OpenAI Codex**, a GPT-3 descendant fine-tuned on public source code.
  > "Developed in collaboration with OpenAI, GitHub Copilot is powered by OpenAI Codex, a new AI system created by OpenAI. OpenAI Codex has broad knowledge of how people use code and is significantly more capable than GPT-3 in code generation, in part, because it was trained on a data set that includes a much larger concentration of public source code."
  > — Source: [Introducing GitHub Copilot: your AI pair programmer](https://github.blog/news-insights/product-news/introducing-github-copilot-ai-pair-programmer/)
- **October 27, 2021** — Neovim plugin released as a public repository (tertiary source).
- **October 29, 2021** — JetBrains plugin released on the JetBrains Marketplace (tertiary source).
  — Source: [GitHub Copilot — Wikipedia](https://en.wikipedia.org/wiki/GitHub_Copilot) (tertiary; primary/vendor release notes for these specific dates were not located during this research)

### 2022 — GA for individuals, Business teased

- **March 29, 2022** — Copilot available for **Visual Studio 2022**.
- **June 21, 2022** — **General availability to individual developers**, priced at **$10/month or $100/year**; free for verified students and maintainers of popular open-source projects. Over 1.2 million developers had used the preview.
  > "With more than 1.2 million developers in our technical preview over the last 12 months... In files where it's enabled, nearly 40% of code is being written by GitHub Copilot in popular coding languages, like Python."
  > — Source: [GitHub Copilot is generally available to all developers (June 21, 2022)](https://github.blog/news-insights/product-news/github-copilot-is-generally-available-to-all-developers/)
- **June 2022** — Software Freedom Conservancy publicly exits GitHub over Copilot training-data concerns.
- **November 3, 2022** — Class-action lawsuit filed (Joseph Saveri Law Firm) challenging Copilot's training on public code.
  — Source: [GitHub Copilot — Wikipedia](https://en.wikipedia.org/wiki/GitHub_Copilot) (tertiary; primary court-docket references were not retrieved during this research)

### 2023 — Chat, Copilot X, and the move beyond the editor

- **February 14, 2023** — **Copilot for Business GA** at **$19/user/month**, introducing organization-level policy/management and an upgraded OpenAI model for enterprise users.
  — Source: [GitHub Copilot for Business is now available](https://github.blog/news-insights/product-news/github-copilot-for-business-is-now-available/)
- **March 22, 2023** — **Copilot X vision announced.** Introduced **Copilot Chat** (IDE chat built on **GPT-4**), **Copilot for Pull Requests**, **Copilot Voice**, **Copilot for the CLI**, and **Copilot for Docs**.
  > "We are not only adopting OpenAI's new GPT-4 model, but are introducing chat and voice for Copilot, and bringing Copilot to pull requests, the command line, and docs... GitHub Copilot is already writing 46% of code and helps developers code up to 55% faster."
  > — Source: [GitHub Copilot X: The AI-powered developer experience (March 22, 2023)](https://github.blog/news-insights/product-news/github-copilot-x-the-ai-powered-developer-experience/)
- **November 8, 2023 (Universe 2023)** — Copilot Chat announced for **GA in December 2023** at no additional cost; **Copilot Chat on github.com and in the mobile app**; **Copilot Enterprise** announced for February 2024 launch at **$39/user/month**; Copilot Partner Program teased (25+ debut partners including Datastax, LaunchDarkly, Postman, HashiCorp, Datadog).
  — Source: [Universe 2023: Copilot transforms GitHub into the AI-powered developer platform](https://github.blog/news-insights/product-news/universe-2023-copilot-transforms-github-into-the-ai-powered-developer-platform/)
- **November 2023** — Copilot Chat base model upgraded to **GPT-4**.
- **December 2023** — **Copilot Chat GA** for organizations and individuals.
  — Source: [GitHub Copilot Chat now generally available](https://github.blog/news-insights/product-news/github-copilot-chat-now-generally-available-for-organizations-and-individuals/)

### 2024 — Enterprise, Workspace, Extensions, Multi-model, Free

- **February 2024** — **Copilot Enterprise GA** ($39/user/month). Codebase-aware chat on github.com, PR summaries, Bing-powered web search in chat (beta).
  — Source: [GitHub Copilot Enterprise is now generally available](https://github.blog/news-insights/product-news/github-copilot-enterprise-is-now-generally-available/)
- **April 29, 2024** — **Copilot Workspace technical preview.** A "Copilot-native developer environment" that takes an issue in natural language and produces a spec, plan, code, and tests — editable at every step, runnable in a GitHub Codespace, mobile-compatible.
  > "In 2022, we launched GitHub Copilot as an autocomplete pair programmer in the editor... In 2023, we released GitHub Copilot Chat... today, we are reimagining the nature of the developer experience itself with the technical preview of GitHub Copilot Workspace: the Copilot-native developer environment."
  > — Source: [GitHub Copilot Workspace: Welcome to the Copilot-native developer environment](https://github.blog/news-insights/product-news/github-copilot-workspace/)
- **May 21, 2024 (Microsoft Build)** — **Copilot Extensions announced** in limited public beta. Debut partners included DataStax, Docker, LambdaTest, LaunchDarkly, McKinsey, Microsoft Azure/Teams, MongoDB, Octopus Deploy, Pangea, Pinecone, Product Science, ReadMe, Sentry, and Stripe. Supported in Copilot Chat on GitHub.com, Visual Studio, and VS Code.
  — Source: [Introducing GitHub Copilot Extensions](https://github.blog/news-insights/product-news/introducing-github-copilot-extensions/)
- **October 29, 2024 (Universe 2024)** — **Multi-model choice:** Claude 3.5 Sonnet (Anthropic), Gemini 1.5 Pro (Google), and OpenAI's o1-preview / o1-mini land in Copilot Chat alongside GPT-4o. **GitHub Spark** (AI-native micro-app builder) previewed. Also previewed: Copilot Edits, Copilot Workspace multi-model. The Verge's contemporaneous coverage corroborates the multi-vendor expansion as a notable strategic shift away from GPT-only Copilot.
  — Sources: [Bringing developer choice to Copilot](https://github.blog/news-insights/product-news/bringing-developer-choice-to-copilot/); [The Verge — GitHub Copilot will support models from Anthropic, Google, and OpenAI (2024-10-29)](https://www.theverge.com/2024/10/29/24282544/github-copilot-multi-model-anthropic-google-open-ai-github-spark-announcement)
- **December 18, 2024** — **GitHub Copilot Free launched** in VS Code: 2,000 completions + 50 chat messages/month, choice of Claude 3.5 Sonnet or GPT-4o. Announced alongside GitHub crossing **150 million developers**. The launch post frames Copilot Free as automatically integrated into VS Code, accessible by signing in with a personal GitHub account, and giving users a choice between Anthropic's Claude 3.5 Sonnet and OpenAI's GPT-4o.
  — Source: [GitHub Copilot in VS Code — now free](https://github.blog/news-insights/product-news/github-copilot-in-vscode-free/)

### 2025 — The year of agents

- **February 6, 2025** — **Agent mode announced** (preview in VS Code Insiders); **Copilot Edits GA** in VS Code; **Gemini 2.0 Flash** added to the model picker; codename **Project Padawan** teased as the forthcoming autonomous cloud agent.
  > "GitHub Copilot's new agent mode is capable of iterating on its own code, recognizing errors, and fixing them automatically. It can suggest terminal commands and ask you to execute them. It also analyzes run-time errors with self-healing capabilities."
  > — Source: [GitHub Copilot: The agent awakens](https://github.blog/news-insights/product-news/github-copilot-the-agent-awakens/)
- **February 24, 2025** — VS Code publishes the agent-mode deep dive; agent mode rolls toward Stable.
  — Source: [Introducing GitHub Copilot agent mode (preview) — VS Code Blog](https://code.visualstudio.com/blogs/2025/02/24/introducing-copilot-agent-mode)
- **May 19, 2025** — **Copilot coding agent in public preview** (the productized Project Padawan). Assign an issue to Copilot and it boots a VM via GitHub Actions, clones the repo, uses RAG over the codebase, pushes commits to a draft PR, and tags you for review. Supports MCP servers and vision.
  > "The agent spins up a secure and fully customizable development environment powered by GitHub Actions. As the agent works, it pushes commits to a draft pull request, and you can track it every step of the way through the agent session logs."
  > — Source: [GitHub Copilot: Meet the new coding agent](https://github.blog/ai-and-ml/github-copilot/github-copilot-meet-the-new-coding-agent/) and [Changelog: Copilot coding agent in public preview](https://github.blog/changelog/2025-05-19-github-copilot-coding-agent-in-public-preview/)
- **August 13, 2025** — **MCP support GA for JetBrains, Eclipse, and Xcode** Copilot clients.
  — Source: [Changelog: MCP support GA for JetBrains/Eclipse/Xcode](https://github.blog/changelog/2025-08-13-model-context-protocol-mcp-support-for-jetbrains-eclipse-and-xcode-is-now-generally-available/)
- **September 25, 2025** — **Copilot coding agent GA.**
  — Source: [Changelog: Copilot coding agent is now generally available](https://github.blog/changelog/2025-09-25-copilot-coding-agent-is-now-generally-available/)
- **October 28, 2025 (Universe 2025)** — **Agent HQ announced.** A "mission control" for multiple agents across GitHub, VS Code, mobile, and CLI; **third-party coding agents (Anthropic, OpenAI, Google Jules, Cognition Devin, xAI) ship under the paid Copilot subscription**; agentic code review, branch/identity controls, Slack/Linear integrations. OpenAI Codex available to Copilot Pro+ users in VS Code Insiders starting that week.
  > "At GitHub Universe, we're announcing Agent HQ, GitHub's vision for the next evolution of our platform... Agent HQ transforms GitHub into an open ecosystem that unites every agent on a single platform."
  > — Source: [Introducing Agent HQ: Any agent, any way you work](https://github.blog/news-insights/company-news/welcome-home-agents/)

### 2026 (through April) — Maturation

Drawn from dated entries on the GitHub Copilot Changelog. Note: the following items are sourced from individual changelog posts (primary/vendor, short-form) and the author has not cross-validated every claim against an accompanying long-form blog post; treat specific technical details as reflecting GitHub's own announcement wording rather than independently audited facts.

- **Copilot data residency (US + EU) and FedRAMP compliance** (Apr 13, 2026). — Source: [Changelog: Copilot data residency in US, EU and FedRAMP compliance now available](https://github.blog/changelog/2026-04-13-copilot-data-residency-in-us-eu-and-fedramp-compliance-now-available).
- **Fix merge conflicts in three clicks with Copilot cloud agent** (Apr 13, 2026). — Source: [Changelog](https://github.blog/changelog/2026-04-13-fix-merge-conflicts-in-three-clicks-with-copilot-cloud-agent).
- **Remote-control CLI sessions on web and mobile** in public preview (Apr 13, 2026). — Source: [Changelog](https://github.blog/changelog/2026-04-13-remote-control-cli-sessions-on-web-and-mobile-in-public-preview).
- **Model selection for Claude and Codex agents on github.com** (Apr 14, 2026). — Source: [Changelog](https://github.blog/changelog/2026-04-14-model-selection-for-claude-and-codex-agents-on-github-com).
- **Claude Opus 4.7 generally available in Copilot** (Apr 16, 2026). — Source: [Changelog](https://github.blog/changelog/2026-04-16-claude-opus-4-7-is-generally-available).
- **Manage agent skills with GitHub CLI** (Apr 16, 2026). — Source: [Changelog](https://github.blog/changelog/2026-04-16-manage-agent-skills-with-github-cli).
- **GitHub Copilot CLI supports Copilot auto model selection** (Apr 17, 2026). — Source: [Changelog](https://github.blog/changelog/2026-04-17-github-copilot-cli-now-supports-copilot-auto-model-selection).
- **Changes to GitHub Copilot plans for individuals** (Apr 20, 2026) — GitHub announced changes to the standalone "Copilot Individual" consumer plan in favor of the Pro/Pro+ structure. — Source: [Changelog: Changes to GitHub Copilot plans for individuals](https://github.blog/changelog/2026-04-20-changes-to-github-copilot-plans-for-individuals).
- Additional platform-level additions visible on the same changelog index — Copilot CLI BYOK and local models ([Apr 7, 2026](https://github.blog/changelog/2026-04-07-copilot-cli-now-supports-byok-and-local-models)), retiring Opus 4.6 Fast from Pro and enforcing new limits ([Apr 10, 2026](https://github.blog/changelog/2026-04-10-enforcing-new-limits-and-retiring-opus-4-6-fast-from-copilot-pro)), and pausing new Copilot Pro trials ([Apr 10, 2026](https://github.blog/changelog/2026-04-10-pausing-new-github-copilot-pro-trials)).
- **Copilot SDK and "Copilot Memory"** are referenced in GitHub Docs and Changelog coverage as preview/rolling-out surfaces; specific launch-dated posts were not individually fetched for each, so these are presented as *reported but not fully verified* in this report. — Source: [GitHub Copilot docs](https://docs.github.com/en/copilot); [Changelog — copilot label index](https://github.blog/changelog/label/copilot/).

---

## 4. Model Evolution

| Period | Default / headline model(s) | Notes |
|---|---|---|
| Jun 2021 – 2022 | **OpenAI Codex** (GPT-3 descendant fine-tuned on public code) | Autocomplete only. |
| 2022 – early 2023 | Codex / updated Codex variants | Individual GA. |
| Mar 2023 – late 2023 | **GPT-4** for Copilot Chat; Codex for completions | Copilot X vision. |
| Late 2023 – 2024 | **GPT-3.5-turbo → GPT-4 → GPT-4o / 4o-mini** | Chat base model updated multiple times. "Copilot Chat was launched in 2023 with GPT-3.5 and later GPT-4... using a range from GPT 3.5-turbo to GPT 4o and 4o-mini." — [Bringing developer choice to Copilot](https://github.blog/news-insights/product-news/bringing-developer-choice-to-copilot/) |
| Oct 2024 | **Multi-model**: adds **Claude 3.5 Sonnet**, **Gemini 1.5 Pro**, **OpenAI o1-preview / o1-mini** | Universe 2024. |
| Feb 2025 | **Gemini 2.0 Flash** added; agent mode supports GPT-4o, o1, o3-mini, Claude 3.5 Sonnet, Gemini 2.0 Flash | Agent-mode debut. |
| Late 2025 – early 2026 | Multi-vendor "Agent HQ" fleet advertised by GitHub as including **Claude Sonnet 4.5/4.6 and Claude Opus 4.7**, recent **Gemini** and **GPT-5-series** models, and **xAI Grok**. Exact model list varies by surface and date. | Auto model selection launched. Specific 2026 entries corroborated by [Claude Opus 4.7 GA (2026-04-16)](https://github.blog/changelog/2026-04-16-claude-opus-4-7-is-generally-available), [Enforcing new limits and retiring Opus 4.6 Fast (2026-04-10)](https://github.blog/changelog/2026-04-10-enforcing-new-limits-and-retiring-opus-4-6-fast-from-copilot-pro), [Model selection for Claude and Codex agents on github.com (2026-04-14)](https://github.blog/changelog/2026-04-14-model-selection-for-claude-and-codex-agents-on-github-com), and [Agent HQ (2025-10-28)](https://github.blog/news-insights/company-news/welcome-home-agents/). Other version numbers in this row are reported by GitHub marketing/docs but were not individually verified against dated announcement posts. |

> "The first public version of Copilot was launched using Codex, an early version of OpenAI GPT-3, specifically fine-tuned for coding tasks."
> — Source: [Bringing developer choice to Copilot](https://github.blog/news-insights/product-news/bringing-developer-choice-to-copilot/)

---

## 5. Pricing & Tier Evolution

| Date | Tier | Price | Notes |
|---|---|---|---|
| Jun 21, 2022 | **Copilot Individual** | $10/month or $100/year | Free for verified students & OSS maintainers. |
| Feb 14, 2023 | **Copilot for Business** | $19/user/month | Adds org policy, no-code-retention, enterprise auth. |
| Feb 2024 | **Copilot Enterprise** | $39/user/month | Codebase-aware chat on github.com, PR summaries, Bing search. |
| Dec 18, 2024 | **Copilot Free** | $0 | 2,000 completions + 50 chat messages/month; GPT-4o or Claude 3.5 Sonnet. Built into VS Code. |
| 2024 → 2025 | **Copilot Pro** / **Pro+** | Pro at the individual/consumer tier; Pro+ introduced for power users with higher premium-request quotas. Exact launch date for the Pro+ split was not located in a single primary post (*reported in docs/changelog but not precisely dated here*). | Pro+ unlocks premium-request quota and access to agent/partner models first. |
| Apr 2026 | **Individual plans changes** | — | Existing Copilot Individual consumer plan being migrated/consolidated. — Source: [Changelog — Changes to GitHub Copilot plans for individuals (2026-04-20)](https://github.blog/changelog/2026-04-20-changes-to-github-copilot-plans-for-individuals). |

---

## 6. Capability Arc: Autocomplete → Agents

```
2021 ─────────── 2023 ─────────── 2024 ─────────── 2025 ─────────── 2026
  │                │                │                │                │
Inline         Chat / X        Workspace +      Agent mode +      Agent HQ
autocomplete   (GPT-4)         Extensions       Coding agent      (multi-vendor)
(Codex)        PR / CLI /      Multi-model      (VS Code +        + auto model
               Docs            (Claude/Gemini)  cloud /           + MCP everywhere
                               Copilot Free     GitHub Actions)   + data residency
                                                MCP support       + FedRAMP
```

Five milestones anchor the arc:

1. **Autocomplete (2021–2022)** — ghost-text suggestions in the editor.
2. **Chat (2023)** — natural-language Q&A in the IDE and on github.com.
3. **Multi-file edits / Copilot Edits (late 2024 → Feb 2025 GA)** — conversational, multi-file, iterative changes across a working set ([Agent awakens, 2025-02-06](https://github.blog/news-insights/product-news/github-copilot-the-agent-awakens/)).
4. **Agent mode (Feb 2025)** — autonomous, local, tool-using peer programmer that iterates over compile/lint/test output.
5. **Coding agent + Agent HQ (May 2025 preview → Sep 2025 GA → Oct 2025 Agent HQ)** — asynchronous cloud agents running on GitHub Actions, plus a multi-vendor orchestration layer.

---

## 7. Notable Controversies & Deprecations

- **Training-data / fair-use lawsuit (Nov 2022)**. A class action filed by the Joseph Saveri Law Firm challenged Copilot's use of public code for training. GitHub's position was that "training machine learning models on publicly available data is considered fair use across the machine learning community."
  — Source: [GitHub Copilot — Wikipedia (Licensing controversy)](https://en.wikipedia.org/wiki/GitHub_Copilot)
- **Software Freedom Conservancy exit (June 2022)** — SFC publicly ended its use of GitHub for SFC projects, citing Copilot training concerns.
  — Source: [GitHub Copilot — Wikipedia (Licensing controversy)](https://en.wikipedia.org/wiki/GitHub_Copilot) *(tertiary; SFC's own "Give Up GitHub" post was not independently fetched in this research)*
- **Quake source-code emission (late 2022)** — Copilot was shown reproducing Quake source without attribution, fueling license-compliance debates.
  — Source: [GitHub Copilot — Wikipedia (Licensing controversy)](https://en.wikipedia.org/wiki/GitHub_Copilot) *(tertiary)*
- **Copilot Individual phased out (2026)** — GitHub announced changes to Copilot Individual plans in April 2026, consolidating consumer access into Free, Pro, and Pro+.
  — Source: [Changelog: Changes to GitHub Copilot plans for individuals (2026-04-20)](https://github.blog/changelog/2026-04-20-changes-to-github-copilot-plans-for-individuals)
- **Copilot X branding faded** — the "Copilot X" umbrella used in March 2023 was effectively subsumed by standalone product names (Copilot Chat, Copilot for PRs, Copilot CLI, etc.) by Universe 2023, where GitHub presented those capabilities as discrete products rather than under the "X" label.
  — Sources: [GitHub Copilot X (2023-03-22)](https://github.blog/news-insights/product-news/github-copilot-x-the-ai-powered-developer-experience/); [Universe 2023 recap](https://github.blog/news-insights/product-news/universe-2023-copilot-transforms-github-into-the-ai-powered-developer-platform/) *(inference: the "X" umbrella term is absent from the Universe 2023 announcement, which markets the same capabilities individually)*
- **Copilot Voice** — announced as part of Copilot X in March 2023; subsequently de-emphasized and not a current standalone product surface. No primary GitHub post announcing Voice's discontinuation was located in this research, so this characterization is an inference from Voice's absence in later Universe announcements.
  — Source: [GitHub Copilot X (2023-03-22)](https://github.blog/news-insights/product-news/github-copilot-x-the-ai-powered-developer-experience/) *(launch reference; lifecycle inferred)*
- **Source-conflict note on coding-agent date:** Wikipedia cites **May 17, 2025** for the coding-agent announcement, while the primary GitHub Changelog entry is dated **May 19, 2025**. The GitHub Blog post ("Meet the new coding agent") and the Changelog are primary sources and are preferred here; May 19 is used as the canonical preview date.

---

## 8. Consolidated Timeline Table (Slide-Ready)

| Date | Event | Tier/Surface | Model(s) | Primary source |
|---|---|---|---|---|
| **2021-06-29** | Copilot technical preview launched | VS Code extension | OpenAI Codex | [GitHub Blog](https://github.blog/news-insights/product-news/introducing-github-copilot-ai-pair-programmer/) |
| 2021-10-27 | Neovim plugin | Neovim | Codex | [Wikipedia](https://en.wikipedia.org/wiki/GitHub_Copilot) *(tertiary)* |
| 2021-10-29 | JetBrains plugin | JetBrains IDEs | Codex | [Wikipedia](https://en.wikipedia.org/wiki/GitHub_Copilot) *(tertiary)* |
| 2022-03-29 | Visual Studio 2022 support | Visual Studio | Codex | [Wikipedia](https://en.wikipedia.org/wiki/GitHub_Copilot) *(tertiary)* |
| **2022-06-21** | **Copilot GA for individuals ($10/mo)** | All major IDEs | Codex | [GitHub Blog](https://github.blog/news-insights/product-news/github-copilot-is-generally-available-to-all-developers/) |
| 2022-11-03 | Class-action lawsuit filed | — | — | [Wikipedia](https://en.wikipedia.org/wiki/GitHub_Copilot) *(tertiary)* |
| **2023-02-14** | **Copilot for Business GA ($19/user/mo)** | Organizations | Upgraded OpenAI model | [GitHub Blog](https://github.blog/news-insights/product-news/github-copilot-for-business-is-now-available/) |
| **2023-03-22** | **Copilot X vision** (Chat, Voice, PRs, CLI, Docs) | IDE + GitHub | **GPT-4** | [GitHub Blog](https://github.blog/news-insights/product-news/github-copilot-x-the-ai-powered-developer-experience/) |
| 2023-07 | Copilot Chat public beta (individuals) | IDE | GPT-4 | Follows Copilot X |
| **2023-11-08** | **Universe 2023**: Copilot Chat GA in Dec; Copilot on github.com + mobile; Copilot Enterprise announced; Partner Program (25+ partners) | github.com, mobile | GPT-4 | [GitHub Blog](https://github.blog/news-insights/product-news/universe-2023-copilot-transforms-github-into-the-ai-powered-developer-platform/) |
| 2023-12 | **Copilot Chat GA** | IDE + github.com | GPT-4 | [GitHub Blog](https://github.blog/news-insights/product-news/github-copilot-chat-now-generally-available-for-organizations-and-individuals/) |
| **2024-02** | **Copilot Enterprise GA ($39/user/mo)** | github.com | GPT-4 + Bing | [GitHub Blog](https://github.blog/news-insights/product-news/github-copilot-enterprise-is-now-generally-available/) |
| **2024-04-29** | **Copilot Workspace** technical preview | Browser / Codespaces | GPT-4 | [GitHub Blog](https://github.blog/news-insights/product-news/github-copilot-workspace/) |
| **2024-05-21** | **Copilot Extensions** (Microsoft Build) | Chat (all surfaces) | GPT-4 | [GitHub Blog](https://github.blog/news-insights/product-news/introducing-github-copilot-extensions/) |
| **2024-10-29** | **Universe 2024: Multi-model choice** (Claude 3.5 Sonnet, Gemini 1.5 Pro, o1-preview/mini); **GitHub Spark** preview | All surfaces | GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, o1-preview/mini | [GitHub Blog](https://github.blog/news-insights/product-news/bringing-developer-choice-to-copilot/) |
| **2024-12-18** | **Copilot Free in VS Code**; 150M developers on GitHub | VS Code (free) | GPT-4o or Claude 3.5 Sonnet | [GitHub Blog](https://github.blog/news-insights/product-news/github-copilot-in-vscode-free/) |
| **2025-02-06** | **Agent mode** announced; **Copilot Edits GA**; **Gemini 2.0 Flash**; Project Padawan teased | VS Code | o3-mini, Claude 3.5 Sonnet, Gemini 2.0 Flash, GPT-4o, o1 | [GitHub Blog](https://github.blog/news-insights/product-news/github-copilot-the-agent-awakens/) |
| 2025-02-24 | Agent mode deep dive | VS Code Stable pending | same | [VS Code Blog](https://code.visualstudio.com/blogs/2025/02/24/introducing-copilot-agent-mode) |
| **2025-05-19** | **Copilot coding agent** in public preview (Project Padawan) | github.com + GitHub Actions | State-of-the-art LLMs + MCP + vision | [Changelog](https://github.blog/changelog/2025-05-19-github-copilot-coding-agent-in-public-preview/) / [GitHub Blog](https://github.blog/ai-and-ml/github-copilot/github-copilot-meet-the-new-coding-agent/) |
| 2025-08-13 | MCP GA in JetBrains/Eclipse/Xcode | IDE ecosystem | — | [Changelog](https://github.blog/changelog/2025-08-13-model-context-protocol-mcp-support-for-jetbrains-eclipse-and-xcode-is-now-generally-available/) |
| **2025-09-25** | **Copilot coding agent GA** | github.com + Actions | Multi-model | [Changelog](https://github.blog/changelog/2025-09-25-copilot-coding-agent-is-now-generally-available/) |
| **2025-10-28** | **Universe 2025: Agent HQ** — multi-vendor agents (Anthropic, OpenAI, Google, Cognition, xAI) under paid Copilot | All surfaces + mission control | Multi-vendor | [GitHub Blog](https://github.blog/news-insights/company-news/welcome-home-agents/) |
| 2026-04 | Data residency (US/EU) + FedRAMP; model selection for agents on github.com; Claude Opus 4.7 GA; auto model selection in CLI; changes to Copilot individual plans | Platform-wide | Multi-vendor (Claude Opus 4.7 confirmed; full 2026 fleet partly reported) | [Data residency/FedRAMP (2026-04-13)](https://github.blog/changelog/2026-04-13-copilot-data-residency-in-us-eu-and-fedramp-compliance-now-available); [Claude Opus 4.7 GA (2026-04-16)](https://github.blog/changelog/2026-04-16-claude-opus-4-7-is-generally-available); [CLI auto model selection (2026-04-17)](https://github.blog/changelog/2026-04-17-github-copilot-cli-now-supports-copilot-auto-model-selection); [Changes to individual plans (2026-04-20)](https://github.blog/changelog/2026-04-20-changes-to-github-copilot-plans-for-individuals) |

---

## 9. Research Limitations

- **Date precision for some 2024 milestones**. The exact announcement day for Copilot Enterprise GA within "February 2024" and for Copilot Chat GA within "December 2023" was not recovered from the article text fetched here; month-level precision is what sources agreed on.
- **Secondary-source conflict on coding agent date**. Wikipedia cited May 17, 2025 while GitHub's own Changelog entry is dated May 19, 2025. I favored the primary GitHub sources and flagged the conflict.
- **Copilot Voice**. Announced in Copilot X (March 2023); its subsequent lifecycle was not explicitly traced in the sources consulted — it appears to have been absorbed into general Chat voice input rather than remaining a distinct product.
- **Pro vs. Pro+ introduction dates**. I did not locate a single authoritative blog post dating the split; it is visible in docs and changelog by mid-2025 but the precise launch is not captured here.
- **Octoverse / developer-count statistics** (e.g., "80% of new developers use Copilot in their first week" at Universe 2025) come from GitHub's own marketing and are not independently verified.
- **2026 entries** rely on the Copilot Changelog index page (as of Apr 2026) rather than individual dated posts for each item; specific per-feature URLs were not fetched for every April 2026 entry.
- **Scope**. This report covers the product/timeline history. It does not exhaustively catalog every model update, partner extension, or region/SKU release.

---

## 10. Complete Reference List

### Official GitHub Blog posts (primary)
- [Introducing GitHub Copilot: your AI pair programmer (2021-06-29)](https://github.blog/news-insights/product-news/introducing-github-copilot-ai-pair-programmer/) — Technical preview announcement; Codex partnership with OpenAI.
- [GitHub Copilot is generally available to all developers (2022-06-21)](https://github.blog/news-insights/product-news/github-copilot-is-generally-available-to-all-developers/) — Individual GA, $10/month, 1.2M preview users, free for students/OSS maintainers.
- [GitHub Copilot for Business is now available (2023-02-14)](https://github.blog/news-insights/product-news/github-copilot-for-business-is-now-available/) — Business tier GA at $19/user/month.
- [GitHub Copilot X: The AI-powered developer experience (2023-03-22)](https://github.blog/news-insights/product-news/github-copilot-x-the-ai-powered-developer-experience/) — Chat, Voice, PRs, CLI, Docs vision; adopts GPT-4.
- [Universe 2023: Copilot transforms GitHub into the AI-powered developer platform (2023-11-08)](https://github.blog/news-insights/product-news/universe-2023-copilot-transforms-github-into-the-ai-powered-developer-platform/) — Chat on github.com + mobile; Copilot Enterprise announced at $39/user/month; Partner Program.
- [GitHub Copilot Chat now generally available (2023-12)](https://github.blog/news-insights/product-news/github-copilot-chat-now-generally-available-for-organizations-and-individuals/) — Copilot Chat GA.
- [GitHub Copilot Enterprise is now generally available (2024-02)](https://github.blog/news-insights/product-news/github-copilot-enterprise-is-now-generally-available/) — Enterprise GA; codebase-aware chat and Bing integration.
- [GitHub Copilot Workspace: Welcome to the Copilot-native developer environment (2024-04-29)](https://github.blog/news-insights/product-news/github-copilot-workspace/) — Workspace technical preview.
- [Introducing GitHub Copilot Extensions (2024-05-21)](https://github.blog/news-insights/product-news/introducing-github-copilot-extensions/) — Partner extensions for Copilot Chat.
- [Bringing developer choice to Copilot (2024-10-29)](https://github.blog/news-insights/product-news/bringing-developer-choice-to-copilot/) — Multi-model (Claude 3.5 Sonnet, Gemini 1.5 Pro, o1).
- [GitHub Copilot in VS Code — now free (2024-12-18)](https://github.blog/news-insights/product-news/github-copilot-in-vscode-free/) — Copilot Free launch; 150M developers milestone.
- [GitHub Copilot: The agent awakens (2025-02-06)](https://github.blog/news-insights/product-news/github-copilot-the-agent-awakens/) — Agent mode preview; Copilot Edits GA; Gemini 2.0 Flash; Project Padawan teaser.
- [GitHub Copilot: Meet the new coding agent (2025-05-19)](https://github.blog/ai-and-ml/github-copilot/github-copilot-meet-the-new-coding-agent/) — Coding-agent preview details (Actions, MCP, vision, draft PRs).
- [Introducing Agent HQ: Any agent, any way you work (2025-10-28)](https://github.blog/news-insights/company-news/welcome-home-agents/) — Universe 2025; multi-vendor agents under paid Copilot.

### GitHub Changelog (primary)
- [Copilot coding agent in public preview (2025-05-19)](https://github.blog/changelog/2025-05-19-github-copilot-coding-agent-in-public-preview/)
- [MCP support for JetBrains, Eclipse, and Xcode GA (2025-08-13)](https://github.blog/changelog/2025-08-13-model-context-protocol-mcp-support-for-jetbrains-eclipse-and-xcode-is-now-generally-available/)
- [Copilot coding agent is now generally available (2025-09-25)](https://github.blog/changelog/2025-09-25-copilot-coding-agent-is-now-generally-available/)
- [Copilot data residency in US, EU and FedRAMP compliance now available (2026-04-13)](https://github.blog/changelog/2026-04-13-copilot-data-residency-in-us-eu-and-fedramp-compliance-now-available)
- [Fix merge conflicts in three clicks with Copilot cloud agent (2026-04-13)](https://github.blog/changelog/2026-04-13-fix-merge-conflicts-in-three-clicks-with-copilot-cloud-agent)
- [Remote-control CLI sessions on web and mobile in public preview (2026-04-13)](https://github.blog/changelog/2026-04-13-remote-control-cli-sessions-on-web-and-mobile-in-public-preview)
- [Model selection for Claude and Codex agents on github.com (2026-04-14)](https://github.blog/changelog/2026-04-14-model-selection-for-claude-and-codex-agents-on-github-com)
- [Claude Opus 4.7 is generally available (2026-04-16)](https://github.blog/changelog/2026-04-16-claude-opus-4-7-is-generally-available)
- [Manage agent skills with GitHub CLI (2026-04-16)](https://github.blog/changelog/2026-04-16-manage-agent-skills-with-github-cli)
- [GitHub Copilot CLI now supports Copilot auto model selection (2026-04-17)](https://github.blog/changelog/2026-04-17-github-copilot-cli-now-supports-copilot-auto-model-selection)
- [Changes to GitHub Copilot plans for individuals (2026-04-20)](https://github.blog/changelog/2026-04-20-changes-to-github-copilot-plans-for-individuals)
- [Copilot CLI now supports BYOK and local models (2026-04-07)](https://github.blog/changelog/2026-04-07-copilot-cli-now-supports-byok-and-local-models)
- [Enforcing new limits and retiring Opus 4.6 Fast from Copilot Pro (2026-04-10)](https://github.blog/changelog/2026-04-10-enforcing-new-limits-and-retiring-opus-4-6-fast-from-copilot-pro)
- [Pausing new GitHub Copilot Pro trials (2026-04-10)](https://github.blog/changelog/2026-04-10-pausing-new-github-copilot-pro-trials)
- [GitHub Copilot Changelog — copilot label index](https://github.blog/changelog/label/copilot/) — Index used to enumerate April 2026 entries.

### GitHub Docs (primary / vendor)
- [GitHub Copilot documentation (landing)](https://docs.github.com/en/copilot) — Generic landing page; used as a general reference for current-state platform surface. Specific claims in this report are cited to the dated changelog posts above rather than to this page.

### Partner / ecosystem
- [Introducing GitHub Copilot agent mode (preview) — VS Code Blog (2025-02-24)](https://code.visualstudio.com/blogs/2025/02/24/introducing-copilot-agent-mode) — Detailed agent-mode behavior, tool loop, undo model.

### Press coverage (secondary)
- [The Verge — "GitHub Copilot will support models from Anthropic, Google, and OpenAI" (Tom Warren, 2024-10-29)](https://www.theverge.com/2024/10/29/24282544/github-copilot-multi-model-anthropic-google-open-ai-github-spark-announcement) — Corroborates the multi-model announcement at Universe 2024.

### Reference / tertiary
- [GitHub Copilot — Wikipedia](https://en.wikipedia.org/wiki/GitHub_Copilot) — Used for historical dates (Neovim / JetBrains plugin releases; Visual Studio 2022 support; lawsuit chronology). Cross-checked against primary sources where possible; where not, labeled inline as *(tertiary)*.

### GitHub Repositories
- N/A — this is a history/product-evolution topic. Relevant repos (e.g., `github/copilot.vim`) were not needed to establish the timeline; primary sources above were sufficient.

---

## Revision Round 3 — 2026-04-21

Round 3 edits (from `agent-reviews/2026-04-21-web-research-reviewer-copilot-history.md` Round 2): header source count corrected to 33 unique URLs; The Verge citation added inline to the 2024-10-29 multi-model item (no longer orphaned); inline citations added to every bullet in §7 (SFC, Quake, Copilot Individual phase-out, Copilot X lifecycle, Copilot Voice); verbose Round 2 changelog removed from the publishable artifact.
