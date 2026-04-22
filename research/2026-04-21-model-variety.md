# Research Report: GitHub Copilot Model Variety & Selection (April 2026)

**Date:** 2026-04-21
**Researcher:** Copilot Web Researcher Agent
**Topic slug:** model-variety
**Sources consulted:** 12 web pages (GitHub Docs primary), 0 GitHub repositories

---

> **Revision Round 3 — 2026-04-21.** Addresses the Round 2 `APPROVED WITH EDITS` verdict. Change made:
> - 🟡 Executive Summary takeaway (3): added inline citations to [Supported AI models](https://docs.github.com/en/copilot/reference/ai-models/supported-models) (for the non‑zero premium multipliers claim) and [AI model comparison](https://docs.github.com/en/copilot/reference/ai-models/model-comparison) (for the deep‑reasoning positioning), so the recommendation is fully traceable without leaving the summary.
>
> **Revision Round 2 — 2026-04-21.** This version addresses the `web-research-reviewer` Round 1 verdict (`NEEDS REWORK`). Changes made:
> - 🔴 Fixed the Executive Summary recommendation so only actually-included (0×) models are named (removed Claude Sonnet 4.6, which is 1×).
> - 🔴 Corrected the premium-request billing start date in §9 from `2026-06-18` to the sourced `2025-06-18`.
> - 🔴 Removed the misattributed "verbatim" blockquotes in §3.4 and §7.3; replaced with unquoted prose paraphrase of the bullet lists on source.
> - 🟡 Added inline citations to the Executive Summary, §3.3, §3.6, the §4.2–§5 billing / Auto rules, and the §8.3 family heuristics.
> - 🟡 Labeled §8.3 comparative judgments explicitly as synthesis of the consulted sources.
> - 🟡 Added a post-block `> — Source: … | Provenance: …` line to the §3.5 CLI example.
> - 🟡 Reconciled the header `Sources consulted` count (now `12`) with the reference list, and cited the inline-completions doc in §3.2 so no references are orphaned.
> - 🟡 Expanded §10 to acknowledge that some §8.3 per-family bullets remain synthesis rather than directly documented by GitHub.
> - Per user directive: added **§3.7 CLI vs. VS Code Chat vs. Cloud Agent model-availability nuances** to make cross-surface differences explicit.

---

## Executive Summary

As of April 2026, GitHub Copilot is a **multi-model product**. Rather than being tied to a single LLM, Copilot lets developers pick from roughly two-dozen models spanning five providers — OpenAI (GPT‑4.1, GPT‑4o, GPT‑5 mini, GPT‑5.2/5.2‑Codex, GPT‑5.3‑Codex, GPT‑5.4/mini/nano), Anthropic (Claude Haiku 4.5, Sonnet 4 / 4.5 / 4.6, Opus 4.5 / 4.6 / 4.7), Google (Gemini 2.5 Pro, Gemini 3 Flash, Gemini 3.1 Pro), xAI (Grok Code Fast 1), plus GitHub‑fine‑tuned preview models (Raptor mini, Goldeneye) — per the GitHub Docs [Supported AI models](https://docs.github.com/en/copilot/reference/ai-models/supported-models) page. This variety matters because different tasks (fast completions vs. deep reasoning vs. agentic coding vs. multimodal visual input) are best served by different models, as documented in the [AI model comparison](https://docs.github.com/en/copilot/reference/ai-models/model-comparison) guide.

Cost is tracked through **premium requests**: every prompt consumes one request multiplied by a per‑model rate (e.g., Haiku 4.5 = 0.33×, Sonnet 4.6 = 1×, Opus 4.6 = 3×, Opus 4.6 "fast mode" preview = 30×) per [Supported AI models](https://docs.github.com/en/copilot/reference/ai-models/supported-models). Three models — **GPT‑4.1, GPT‑4o, GPT‑5 mini** — are "included" (0× multiplier) on every paid plan and do not deduct from the premium allowance, per [Requests in GitHub Copilot](https://docs.github.com/en/copilot/concepts/billing/copilot-requests). Monthly allowances scale with plan: Free 50, Student/Pro 300, Pro+ 1500, Business 300/user, Enterprise 1000/user, with `$0.04`/request overages, per [Plans for GitHub Copilot](https://docs.github.com/en/copilot/get-started/plans). An **Auto** mode picks a healthy model for you and grants a 10% multiplier discount on paid plans in Copilot Chat, per [About Copilot auto model selection](https://docs.github.com/en/copilot/concepts/auto-model-selection).

For a beginner audience, three takeaways cover most practical use: (1) **you can change the model** from a dropdown in VS Code Chat, the Copilot CLI, github.com, and the Cloud Agent ([Changing the AI model for Copilot Chat](https://docs.github.com/en/copilot/how-tos/use-ai-models/change-the-chat-model)); (2) **stick with Auto, or with one of the three included (0×) models — GPT‑5 mini, GPT‑4.1, or GPT‑4o** — for daily coding so you do not consume premium quota ([Requests in GitHub Copilot](https://docs.github.com/en/copilot/concepts/billing/copilot-requests)); (3) **reach for a premium reasoning model** (GPT‑5.4, Claude Sonnet 4.6, Claude Opus 4.7, Gemini 3.1 Pro) only when the default clearly isn't good enough — it will consume your monthly premium allowance faster, because these models carry non‑zero multipliers per [Supported AI models](https://docs.github.com/en/copilot/reference/ai-models/supported-models) and are positioned for deeper reasoning / agentic workloads in the [AI model comparison](https://docs.github.com/en/copilot/reference/ai-models/model-comparison) guide.

---

## Table of Contents

1. [Overview](#1-overview)
2. [The Model Lineup (April 2026)](#2-the-model-lineup-april-2026)
3. [How to Select a Model in Each Surface](#3-how-to-select-a-model-in-each-surface)
   - 3.7 [CLI vs. VS Code Chat vs. Cloud Agent — model-availability nuances](#37-cli-vs-vs-code-chat-vs-cloud-agent--model-availability-nuances)
4. [Premium Requests: Quota Math](#4-premium-requests-quota-math)
5. [Auto Model Selection](#5-auto-model-selection)
6. [Base & LTS Models (Fallback)](#6-base--lts-models-fallback)
7. [Bring Your Own Key (BYOK) & Custom Models](#7-bring-your-own-key-byok--custom-models)
8. [How to Choose: Decision Guide](#8-how-to-choose-decision-guide)
9. [Recent Additions & Retirements (2025–2026)](#9-recent-additions--retirements-20252026)
10. [Research Limitations](#10-research-limitations)
11. [Complete Reference List](#11-complete-reference-list)

---

## 1. Overview

### What It Is
GitHub Copilot is a multi-model AI developer tool. The same Copilot chat window, CLI, IDE extension, and cloud agent can be backed by different underlying LLMs — and users (or administrators) choose which one answers each prompt.

> "GitHub Copilot supports multiple models, each with different strengths. Some models prioritize speed and cost-efficiency, while others are optimized for accuracy, reasoning, or working with multimodal inputs (like images and code together). Depending on your Copilot plan and where you're using it—such as GitHub.com or an IDE—you may have access to different models."
> — Source: [Supported AI models in GitHub Copilot](https://docs.github.com/en/copilot/reference/ai-models/supported-models)

### Why It Matters
- **Right tool for the job.** Fast completions (Haiku 4.5, GPT‑5 mini, Raptor mini) feel snappy; deep reasoning (GPT‑5.4, Opus 4.7, Gemini 3.1 Pro) solves harder problems.
- **Cost control.** Higher‑capability models cost more premium requests; picking the smallest model that works saves quota.
- **Governance.** Enterprises can restrict which providers their developers use (e.g., FedRAMP, data residency, BYOK).
- **Resilience.** When a provider degrades, Auto routes around it, and an included base model always remains available.

### Key Features (of the model system)
- 22+ models from OpenAI, Anthropic, Google, xAI, and GitHub-tuned preview models
- Per-model **premium request multipliers** (0× to 30×)
- **Auto** mode with a 10% multiplier discount on paid plans
- **Base/LTS** model guarantees (currently GPT‑5.3‑Codex)
- **BYOK** via Copilot CLI env vars, Copilot SDK, and Enterprise "Custom models" picker
- Per-surface availability (GitHub.com, VS Code, Visual Studio, JetBrains, Eclipse, Xcode, Copilot CLI, Cloud Agent)

---

## 2. The Model Lineup (April 2026)

### 2.1 Full supported model list

All models below are available in Copilot Chat modes (Agent, Ask, Edit) unless noted. Release status as listed on the GitHub Docs "Supported models" page on 2026-04-21.

| Model | Provider | Release status | Paid multiplier | Free multiplier |
|---|---|---|---|---|
| GPT‑4.1 | OpenAI | GA | **0** | 1 |
| GPT‑4o | OpenAI | GA (included) | **0** | 1 |
| GPT‑5 mini | OpenAI | GA | **0** | 1 |
| GPT‑5.2 | OpenAI | GA | 1 | — |
| GPT‑5.2‑Codex | OpenAI | GA | 1 | — |
| GPT‑5.3‑Codex | OpenAI | GA (Base/LTS) | 1 | — |
| GPT‑5.4 | OpenAI | GA | 1 | — |
| GPT‑5.4 mini | OpenAI | GA | 0.33 | — |
| GPT‑5.4 nano | OpenAI | GA | 0.25 | — |
| Claude Haiku 4.5 | Anthropic | GA | 0.33 | 1 |
| Claude Sonnet 4 | Anthropic | GA | 1 | — |
| Claude Sonnet 4.5 | Anthropic | GA | 1 | — |
| Claude Sonnet 4.6 | Anthropic | GA | 1 | — |
| Claude Opus 4.5 | Anthropic | GA | 3 | — |
| Claude Opus 4.6 | Anthropic | GA | 3 | — |
| Claude Opus 4.6 (fast mode) | Anthropic | Public preview | **30** | — |
| Claude Opus 4.7 | Anthropic | GA | **7.5** (promo through 2026‑04‑30) | — |
| Gemini 2.5 Pro | Google | GA | 1 | — |
| Gemini 3 Flash | Google | Public preview | 0.33 | — |
| Gemini 3.1 Pro | Google | Public preview | 1 | — |
| Grok Code Fast 1 | xAI | GA | 0.25 | 1 |
| Raptor mini | GitHub (fine-tuned GPT‑5 mini) | Public preview | **0** | 1 |
| Goldeneye | GitHub (fine-tuned GPT‑5.1‑Codex) | Public preview | — | 1 |

> "Each model has a premium request multiplier, based on its complexity and resource usage. If you are on a paid Copilot plan, your premium request allowance is deducted according to this multiplier."
> — Source: [Supported AI models in GitHub Copilot](https://docs.github.com/en/copilot/reference/ai-models/supported-models)

> "Important: Claude Opus 4.7 is available at a promotional multiplier of 7.5x until April 30, 2026."
> — Source: [Supported AI models in GitHub Copilot](https://docs.github.com/en/copilot/reference/ai-models/supported-models)

### 2.2 "Included" models (0× multiplier)

> "GPT-5 mini, GPT-4.1 and GPT-4o are the included models, and do not consume any premium requests if you are on a paid plan."
> — Source: [Requests in GitHub Copilot](https://docs.github.com/en/copilot/concepts/billing/copilot-requests)

Raptor mini is also 0× on paid plans but is a public preview. These are the models to lean on when you want to burn zero quota.

### 2.3 Availability per client (high level)

The full matrix is published on the Supported Models page, but the headline is:

- **GitHub.com Chat, VS Code, Visual Studio, JetBrains IDEs** — the broadest coverage (nearly all GA models).
- **Copilot CLI** — most GA models + Auto.
- **Eclipse, Xcode** — narrower subset (primarily GPT‑4.1/5 mini, Sonnet 4.x, Gemini 2.5 Pro per the docs table).
- **Copilot Cloud Agent model picker** exposes only: **Auto, Claude Sonnet 4.5, Claude Opus 4.7, GPT‑5.2‑Codex** (see §3.4).

> "GPT-5-Codex is supported in Visual Studio Code v1.104.1 or higher."
> — Source: [Supported AI models in GitHub Copilot](https://docs.github.com/en/copilot/reference/ai-models/supported-models)

### 2.4 Availability per plan (headline)

| Plan | Included (0×) | Premium models |
|---|---|---|
| Copilot Free | Limited subset (GPT‑5 mini, GPT‑4.1, Haiku 4.5, Grok Code Fast 1, Raptor mini, Goldeneye) — each counts as 1 request | No multi-tier premium access; 50 premium requests/month total |
| Copilot Student | GPT‑4.1, GPT‑4o, GPT‑5 mini (0×) | Access to premium models; 300 premium requests/month |
| Copilot Pro | Same included | Access to premium models; 300 premium requests/month |
| Copilot Pro+ | Same included | **Full access to all available models**; 1500 premium requests/month |
| Copilot Business | Same included | Premium models subject to org policy; 300/user/month |
| Copilot Enterprise | Same included | Premium models subject to enterprise policy; 1000/user/month |

> "GitHub Copilot Pro+ offers the highest level of access for individual developers. In addition to everything in Copilot Pro, this plan includes a larger allowance of premium requests, and full access to all available models in Copilot Chat."
> — Source: [Plans for GitHub Copilot](https://docs.github.com/en/copilot/get-started/plans)

---

## 3. How to Select a Model in Each Surface

### 3.1 GitHub.com (web Copilot Chat)

1. Click the Copilot icon in the top right of any page on GitHub.
2. At the bottom of the chat panel, click the **current model dropdown**.
3. Pick a model. Optionally click the retry icon on any prior response to regenerate it with the new model while preserving context.

> "Optionally, after submitting a prompt, you can regenerate the same prompt using a different model by clicking the retry icon ( ) below the response. The new response will use your selected model and maintain the full context of the conversation."
> — Source: [Changing the AI model for GitHub Copilot Chat](https://docs.github.com/en/copilot/how-tos/use-ai-models/change-the-chat-model)

### 3.2 VS Code Chat (most common surface)

- Open Copilot Chat from the title bar icon.
- At the bottom of the chat view, click the current-model dropdown → choose a model (or **Auto**).
- To add external providers (Anthropic, Gemini, OpenAI, AI Toolkit models), open the dropdown → **Manage Models** → select provider → enter PAT/API key/model ID ([Changing the AI model for Copilot Chat](https://docs.github.com/en/copilot/how-tos/use-ai-models/change-the-chat-model)).

> "If you select Auto, Copilot auto model selection will select the best model based on availability and to help reduce rate limiting."
> — Source: [Changing the AI model for GitHub Copilot Chat](https://docs.github.com/en/copilot/how-tos/use-ai-models/change-the-chat-model)

**Inline completions model** (separate from chat, per the dedicated [Changing the AI model for Copilot inline suggestions](https://docs.github.com/en/copilot/how-tos/use-ai-models/change-the-completion-model) doc):
- `Ctrl+Shift+P` / `Cmd+Shift+P` → run **"GitHub Copilot: Change Completions Model"** and pick from the list.
- Verify via Settings → search `copilot completion` → read **"GitHub > Copilot: Selected Completion Model"**.

> "Changing the model used by Copilot Chat does not affect the model used for Copilot inline suggestions."
> — Source: [Changing the AI model for GitHub Copilot Chat](https://docs.github.com/en/copilot/how-tos/use-ai-models/change-the-chat-model)

### 3.3 Visual Studio / JetBrains / Eclipse / Xcode

All expose a model dropdown at the bottom of the Copilot Chat view. Visual Studio requires **17.12+** for multi-model chat; the completions model switcher requires **17.14 Preview 2+**. JetBrains exposes a separate "Model for completions" dropdown under Settings → Tools → GitHub Copilot → Completions. Per-IDE version prerequisites and per-IDE picker locations are enumerated on [Changing the AI model for Copilot Chat](https://docs.github.com/en/copilot/how-tos/use-ai-models/change-the-chat-model) and [Changing the AI model for Copilot inline suggestions](https://docs.github.com/en/copilot/how-tos/use-ai-models/change-the-completion-model).

### 3.4 Copilot Cloud Agent

Model selection for the Cloud Agent is available when (a) assigning an issue to Copilot on github.com, (b) mentioning `@copilot` in a PR comment, (c) starting a task from the agents tab/panel, GitHub Mobile, or Raycast.

According to [Changing the AI model for GitHub Copilot cloud agent](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/changing-the-ai-model), the currently available options are **Auto**, **Claude Sonnet 4.5**, **Claude Opus 4.7**, and **GPT‑5.2‑Codex** (the source presents these as a bulleted list; this report paraphrases rather than quotes the list).

### 3.5 Copilot CLI

The Copilot CLI accepts either a model chosen interactively or a `--model` flag / `COPILOT_MODEL` env var. The available list mirrors Chat + Auto. When using Auto, the model used for each response is printed in the terminal.

```bash
# Set a default model for this shell session
export COPILOT_MODEL=claude-sonnet-4.6
copilot

# Or pick per-invocation
copilot --model gpt-5.4 "Explain the error in my last test run"
```
> — Source: [About Copilot auto model selection](https://docs.github.com/en/copilot/concepts/auto-model-selection) and [Use BYOK models with Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/use-byok-models) | Provenance: adapted (the `--model` flag and `COPILOT_MODEL` env var are both documented on the BYOK CLI page; Auto behavior is documented on the auto-model-selection page)

> "When you select Auto from the list of available models in GitHub Copilot CLI, Auto model selection chooses from the supported models, subject to your policies and subscription type."
> — Source: [About Copilot auto model selection](https://docs.github.com/en/copilot/concepts/auto-model-selection)

### 3.6 Administrative control (Business / Enterprise)

Admins can restrict which models are enabled per organization or enterprise via **AI controls → Copilot → Configure allowed models**; a Business subscription user must be granted model-switching permission by their org before the dropdown unlocks. Per-plan access differences (e.g., Pro+'s "full access to all available models" vs. Business/Enterprise org-policy gating) are documented on [Plans for GitHub Copilot](https://docs.github.com/en/copilot/get-started/plans) and [Supported AI models](https://docs.github.com/en/copilot/reference/ai-models/supported-models).

### 3.7 CLI vs. VS Code Chat vs. Cloud Agent — model-availability nuances

Although all three surfaces let you change the model, they are **not equivalent** in what they expose. The differences below are drawn from [Supported AI models](https://docs.github.com/en/copilot/reference/ai-models/supported-models), [About Copilot auto model selection](https://docs.github.com/en/copilot/concepts/auto-model-selection), [Changing the AI model for Copilot cloud agent](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/changing-the-ai-model), and [Use BYOK models with Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/use-byok-models).

| Capability | VS Code Chat | Copilot CLI | Cloud Agent |
|---|---|---|---|
| Full catalog of GA GitHub-hosted models (GPT‑5.x, Sonnet 4.x, Opus 4.x, Gemini, Grok…) | ✅ broadest coverage per the Supported Models matrix | ✅ most GA chat models available | ❌ restricted to **Auto, Sonnet 4.5, Opus 4.7, GPT‑5.2‑Codex** per the Cloud Agent docs |
| **Auto** mode | ✅ GA | ✅ GA (prints the chosen model each response) | ✅ default option |
| Auto 10% multiplier discount | ✅ (Copilot Chat only, per auto-model-selection docs) | ❌ not listed as receiving the Chat-only discount | ❌ not listed as receiving the Chat-only discount |
| Preview models (Opus 4.6 fast mode, Gemini 3.x, Raptor mini, Goldeneye) | ✅ where the Supported Models matrix marks them available; may require org "Editor preview features" policy | ✅ subject to same policy gating | ❌ not listed in the Cloud Agent picker |
| **BYOK** to your own provider (OpenAI-compatible / Azure / Anthropic / Ollama / Foundry Local) | ✅ via **Manage Models** in the Chat dropdown (Anthropic, Gemini, OpenAI, AI Toolkit) | ✅ via `COPILOT_PROVIDER_TYPE` / `COPILOT_PROVIDER_BASE_URL` / `COPILOT_PROVIDER_API_KEY` env vars, incl. local Ollama + offline mode | ❌ no documented BYOK path for the hosted Cloud Agent picker (Enterprise-registered Custom Models appear in IDE/CLI pickers per §7.3) |
| Inline code completions model | ✅ separate switcher (`GitHub Copilot: Change Completions Model`) | ❌ N/A — CLI is prompt-based, not inline | ❌ N/A |
| Where the model is chosen | Dropdown at the bottom of the Chat view | Interactive picker, `--model` flag, or `COPILOT_MODEL` env var | Issue-assignment, `@copilot` PR mention, agents tab / Mobile / Raycast entrypoints |

**Practical implications:**
- If a teammate says "use Gemini 3.1 Pro on that PR," they can do it in VS Code Chat but **cannot** select it from the Cloud Agent picker today.
- The Auto discount is a **VS Code / Chat-only** benefit per the auto-model-selection doc; do not assume the same 10% savings in CLI or Cloud Agent billing math.
- Only the **Copilot CLI** has documented env-var-based BYOK; VS Code Chat exposes BYOK through a provider UI, and the hosted Cloud Agent does not expose personal BYOK at all (admins can surface custom models enterprise-wide via §7.3).

---

## 4. Premium Requests: Quota Math

### 4.1 What counts as a request

> "A request is any interaction where you ask Copilot to do something for you—whether it's generating code, answering a question, or helping you through an extension. ... For agentic features, only the prompts you send count as premium requests; actions Copilot takes autonomously to complete your task, such as tool calls, do not."
> — Source: [Requests in GitHub Copilot](https://docs.github.com/en/copilot/concepts/billing/copilot-requests)

Per feature:

| Feature | Charge |
|---|---|
| Copilot Chat (ask / edit / agent / plan) | 1 × multiplier per user prompt |
| Copilot CLI | 1 × multiplier per user prompt |
| Copilot code review (per PR or per IDE review) | 1 × multiplier |
| Copilot Cloud Agent | 1 × multiplier per session + 1 × multiplier per real-time steering comment |
| Copilot Spaces | 1 × multiplier per prompt |
| GitHub Spark | **Fixed 4 premium requests / prompt** |
| OpenAI Codex (VS Code, preview) | 1 × multiplier |
| Third-party coding agents (preview) | 1 premium request (flat) |

### 4.2 Monthly allowances by plan

| Plan | Monthly premium requests | Overage |
|---|---|---|
| Copilot Free | 50 | Not available — upgrade required |
| Copilot Student | 300 | $0.04/request if budget set |
| Copilot Pro | 300 | $0.04/request |
| Copilot Pro+ | 1,500 | $0.04/request |
| Copilot Business | 300 per user | $0.04/request (org budget) |
| Copilot Enterprise | 1,000 per user | $0.04/request (enterprise budget) |

> "Purchase additional premium requests at $0.04/request."
> — Source: [Plans for GitHub Copilot](https://docs.github.com/en/copilot/get-started/plans)

> "Premium request counters reset on the 1st of each month at 00:00:00 UTC."
> — Source: [Requests in GitHub Copilot](https://docs.github.com/en/copilot/concepts/billing/copilot-requests)

Unused quota does **not** roll over. Data residency / FedRAMP adds a **+10% multiplier surcharge** on top of the base per-model rate, per [Requests in GitHub Copilot](https://docs.github.com/en/copilot/concepts/billing/copilot-requests).

### 4.3 Worked examples

- **Pro user, 100 Chat prompts on Sonnet 4.6** (1×) → 100 requests used, 200 remaining of 300.
- **Pro user, 100 prompts on Claude Opus 4.6** (3×) → **300 requests consumed — full monthly quota gone.**
- **Pro user, 100 prompts on Claude Opus 4.6 fast-mode preview** (30×) → 3,000 requests — 10× over the monthly allowance; at $0.04 overage = **$108** if a budget is set.
- **Pro+ user on Opus 4.7** at the 7.5× promo multiplier → 1,500 / 7.5 = **200 Opus 4.7 prompts/month** inside allowance.
- **Business user, all prompts via Auto on Sonnet 4.6** (1× − 10% = 0.9×) → 300 / 0.9 = **~333 prompts/month** inside allowance.
- **Any paid user on GPT-5 mini / GPT-4.1 / GPT-4o** (0×) → effectively unlimited (subject to rate limits).

### 4.4 When the quota runs out

> "If you're on a paid plan and use all of your premium requests, you can still use Copilot with one of the included models for the rest of the month."
> — Source: [Requests in GitHub Copilot](https://docs.github.com/en/copilot/concepts/billing/copilot-requests)

---

## 5. Auto Model Selection

Auto is now the default recommended mode for most developers.

> "Experience less rate limiting and reduce the mental load of choosing a model by letting Copilot auto model selection choose the best available model on your behalf. Copilot auto model selection intelligently chooses models based on real time system health and model performance. You benefit from: Reduced rate limiting, Lower latency and errors, Discounted multipliers for paid plans (Copilot Chat only)."
> — Source: [About Copilot auto model selection](https://docs.github.com/en/copilot/concepts/auto-model-selection)

**Auto candidate pool (April 2026)**, per [About Copilot auto model selection](https://docs.github.com/en/copilot/concepts/auto-model-selection):

| Surface | Models Auto may choose |
|---|---|
| Copilot Chat / CLI / Cloud Agent | GPT‑4.1, GPT‑5 mini, GPT‑5.3‑Codex, GPT‑5.4, GPT‑5.4 mini, Claude Haiku 4.5, Claude Sonnet 4.5, Claude Sonnet 4.6, Grok Code Fast 1, Raptor mini |
| OpenAI Codex | GPT‑5.2‑Codex, GPT‑5.3‑Codex, GPT‑5.4, GPT‑5.4 nano |
| Anthropic Claude (third‑party agent) | Opus 4.5, Opus 4.6, Opus 4.7, Sonnet 4.5, Sonnet 4.6 |

Per the same doc, Auto explicitly **excludes** models with multiplier > 1 (e.g., Opus 4.5/4.6/4.7, Opus 4.6 fast mode) unless you pick them manually; it also excludes models disabled by admin policy and models not in your plan.

Availability: **GA in VS Code and JetBrains**; **public preview in Visual Studio, Eclipse, Xcode**. During preview on Business/Enterprise the org must enable the "Editor preview features" policy ([About Copilot auto model selection](https://docs.github.com/en/copilot/concepts/auto-model-selection)).

---

## 6. Base & LTS Models (Fallback)

GitHub designates a **base model** (the default when no admin choices have been made) and a **long‑term support (LTS) model** (a model guaranteed available for at least one year).

> "On March 18, 2026, GitHub designated GPT-5.3-Codex as the base model. Base models apply only to Copilot Business and Copilot Enterprise. ... A base model is the default AI model that GitHub Copilot uses when no other models are enabled. The base model is automatically enabled for all Copilot Business or Copilot Enterprise accounts within 60 days after the model is designated as a base model."
> — Source: [Fallback and LTS models](https://docs.github.com/en/copilot/concepts/fallback-and-lts-models)

> "GPT-5.3-Codex is available on paid plans with a 1x premium request multiplier, which means it consumes premium requests. To ensure continuous access to Copilot when premium requests are unavailable: Premium request quota exhausted: If a user has used their monthly premium request allowance, Copilot automatically falls back to GPT-4.1 (the former base model) at no additional cost to the user. Overage controls disabled: If an organization or enterprise has disabled premium request overages and a user reaches their limit, Copilot will fall back to GPT-4.1."
> — Source: [Fallback and LTS models](https://docs.github.com/en/copilot/concepts/fallback-and-lts-models)

**Bottom line:** You are never locked out of Copilot for lack of premium quota — GPT‑4.1 (0×) always remains.

---

## 7. Bring Your Own Key (BYOK) & Custom Models

BYOK is available in three places, each with a slightly different scope.

### 7.1 Copilot CLI BYOK (env vars)

> "You can configure Copilot CLI to use your own LLM provider, also called BYOK (Bring Your Own Key), instead of GitHub-hosted models. This lets you connect to OpenAI-compatible endpoints, Azure OpenAI, or Anthropic, including locally running models such as Ollama."
> — Source: [Use BYOK models with Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/use-byok-models)

Supported types: `openai` (OpenAI, Ollama, vLLM, Microsoft Foundry Local), `azure` (Azure OpenAI), `anthropic` (Claude). Models must support **tool calling and streaming**; 128k+ context recommended.

```bash
# Example: point Copilot CLI at Anthropic Claude directly
export COPILOT_PROVIDER_TYPE=anthropic
export COPILOT_PROVIDER_BASE_URL=https://api.anthropic.com
export COPILOT_PROVIDER_API_KEY=YOUR-ANTHROPIC-API-KEY
export COPILOT_MODEL=claude-opus-4-5
copilot
```
> — Source: [Use BYOK models with Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/use-byok-models) | Provenance: verbatim

```bash
# Example: local Ollama (no API key)
export COPILOT_PROVIDER_BASE_URL=http://localhost:11434
export COPILOT_MODEL=llama3.2
# Optional: full network isolation (local-only)
export COPILOT_OFFLINE=true
copilot
```
> — Source: [Use BYOK models with Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/use-byok-models) | Provenance: adapted

### 7.2 Copilot SDK BYOK (programmatic)

The Copilot SDK (public preview) supports the same three provider types plus explicit Azure AI Foundry and Foundry Local examples, with a `wireApi` field (`"completions"` default, `"responses"` for GPT‑5‑series).

```typescript
// Example: Azure AI Foundry via Copilot SDK (Node/TypeScript)
// Source: https://docs.github.com/en/copilot/how-tos/copilot-sdk/authenticate-copilot-sdk/bring-your-own-key
import { CopilotClient } from "@github/copilot-sdk";

const client = new CopilotClient();
const session = await client.createSession({
  model: "YOUR-DEPLOYMENT-NAME",
  provider: {
    type: "openai",
    baseUrl: "https://YOUR-RESOURCE.openai.azure.com/openai/v1/",
    wireApi: "responses",
    apiKey: process.env.FOUNDRY_API_KEY,
  },
});
session.on("assistant.message", (e) => console.log(e.data.content));
await session.sendAndWait({ prompt: "What is 2+2?" });
await client.stop();
```
> — Source: [Bring your own key (Copilot SDK)](https://docs.github.com/en/copilot/how-tos/copilot-sdk/authenticate-copilot-sdk/bring-your-own-key) | Provenance: verbatim

### 7.3 Enterprise Custom Models (admin-managed BYOK)

Enterprise owners can register API keys once and expose the resulting models to some or all orgs; those models then appear **at the bottom of the IDE/CLI model picker** under the enterprise name.

Per [Using your own API keys with GitHub Copilot (enterprise)](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/use-your-own-api-keys), supported providers are **Anthropic, AWS Bedrock, Google AI Studio, Microsoft Foundry, OpenAI, OpenAI‑compatible providers, and xAI**; fine-tuned models are also supported, though the doc notes that "functionality and quality of results can vary depending on the fine-tuning setup." (Source presents the provider names as a bulleted list; reproduced here as prose rather than as a verbatim sentence.)

This feature is in **public preview** as of April 2026 and is the main answer to "can we use our own LLM contract with Copilot?"

---

## 8. How to Choose: Decision Guide

### 8.1 Beginner heuristic (slide-friendly)

```
+-------------------------------------------------------------+
|                     "Which model should I pick?"            |
+-------------------------------------------------------------+
| 1. Don't know / don't care?  -->  Auto                       |
| 2. Just coding all day?      -->  GPT-5 mini  (0x, free)     |
| 3. Need real thinking?       -->  GPT-5.4 or Claude Sonnet 4.6|
| 4. Hardest problem, $$$ ok?  -->  Claude Opus 4.7 (7.5x)     |
| 5. Working from screenshots? -->  GPT-5 mini / Sonnet 4.6    |
|                                   / Gemini 3.1 Pro (multimodal)|
| 6. Cloud Agent long-running? -->  GPT-5.2-Codex or Opus 4.7  |
+-------------------------------------------------------------+
```

### 8.2 Task → recommended model (from GitHub Docs)

| Task | Primary recommendation | Good alternates |
|---|---|---|
| General coding & writing | GPT‑5.3‑Codex, GPT‑5 mini | Grok Code Fast 1, Raptor mini |
| Fast / repetitive edits | Claude Haiku 4.5 | Gemini 3 Flash, GPT‑5.4 nano |
| Deep reasoning & debugging | GPT‑5.4, Claude Sonnet 4.6 | Claude Opus 4.7, Gemini 3.1 Pro, Goldeneye |
| Agentic (long-horizon) coding | GPT‑5.2‑Codex, GPT‑5.3‑Codex | Claude Sonnet 4.6, GPT‑5.4 mini |
| Multimodal (diagrams, screenshots) | GPT‑5 mini | Claude Sonnet 4.6, Gemini 3.1 Pro |
| Cloud Agent task | Auto | Sonnet 4.5, Opus 4.7, GPT‑5.2‑Codex |

> "This guide helps you pick the best model based on your task, not just model names."
> — Source: [AI model comparison](https://docs.github.com/en/copilot/reference/ai-models/model-comparison)

### 8.3 Strengths & weaknesses by family

> **Note on provenance:** The bullets below are **synthesis by this report** that combine the per-model multipliers and task guidance in [Supported AI models](https://docs.github.com/en/copilot/reference/ai-models/supported-models) and [AI model comparison](https://docs.github.com/en/copilot/reference/ai-models/model-comparison) with widely repeated community characterizations of each family. They are not individually quoted from a single authoritative source; evaluative phrases like "community favorite" reflect researcher judgment, not documented GitHub guidance. Treat this section as opinion-flavored orientation, not normative fact.

- **OpenAI GPT‑5 family** _(synthesis)_ — broad coverage, multimodal, tightly integrated; GPT‑5.3‑Codex is the current base/LTS model per [Fallback and LTS models](https://docs.github.com/en/copilot/concepts/fallback-and-lts-models). GPT‑5.4 is the top-end reasoning pick in the OpenAI lineup per [AI model comparison](https://docs.github.com/en/copilot/reference/ai-models/model-comparison); GPT‑5.2‑Codex / 5.3‑Codex are called out for agentic coding; mini/nano variants are the cheapest per-token options (0.25×–0.33× multipliers per [Supported AI models](https://docs.github.com/en/copilot/reference/ai-models/supported-models)). Weakness _(researcher judgment)_: fewer options for very long context vs. Gemini — not documented by GitHub.
- **Anthropic Claude family** _(synthesis)_ — Sonnet 4.5/4.6 is widely used for agentic coding; Opus 4.6/4.7 is the highest-quality Claude tier but expensive (3× / 7.5× promo / preview 30× per [Supported AI models](https://docs.github.com/en/copilot/reference/ai-models/supported-models)). Haiku 4.5 is documented as the fast/cheap Claude option (0.33×). "Community favorite" is researcher characterization, not a GitHub claim.
- **Google Gemini family** _(synthesis)_ — Gemini 3.1 Pro is recommended for deep reasoning alongside GPT‑5.4 and Claude Sonnet 4.6 per [AI model comparison](https://docs.github.com/en/copilot/reference/ai-models/model-comparison); Gemini 3 Flash is the cheapest preview option (0.33×). Weakness: both 3.x variants are still in public preview as of April 2026 per [Supported AI models](https://docs.github.com/en/copilot/reference/ai-models/supported-models).
- **xAI Grok Code Fast 1** _(synthesis)_ — coding-specialized at 0.25× multiplier per [Supported AI models](https://docs.github.com/en/copilot/reference/ai-models/supported-models), making it the cheapest non-included premium model. "Narrower track record" is researcher judgment.
- **GitHub fine-tunes (Raptor mini, Goldeneye)** _(synthesis)_ — documented as tuned specifically for Copilot workflows per [Supported AI models](https://docs.github.com/en/copilot/reference/ai-models/supported-models); Raptor mini is 0× on paid plans. "Preview quality variability" is researcher inference from their public-preview status.

---

## 9. Recent Additions & Retirements (2025–2026)

From the **Model retirement history** on the Supported Models page:

| Retired model | Retirement date | Suggested alternative |
|---|---|---|
| GPT‑5.1 | 2026‑04‑15 | GPT‑5.3‑Codex |
| GPT‑5.1‑Codex / Max / Mini | 2026‑04‑01 | GPT‑5.3‑Codex |
| Gemini 3 Pro | 2026‑03‑26 | Gemini 3.1 Pro |
| Claude Opus 4.1 | 2026‑02‑17 | Claude Opus 4.6 |
| GPT‑5 | 2026‑02‑17 | GPT‑5.2 |
| GPT‑5‑Codex | 2026‑02‑17 | GPT‑5.2‑Codex |
| Claude Sonnet 3.5 | 2025‑11‑06 | Claude Haiku 4.5 |
| Claude Opus 4 | 2025‑10‑23 | Claude Opus 4.6 |
| Claude Sonnet 3.7 / 3.7 Thinking | 2025‑10‑23 | Claude Sonnet 4.6 |
| Gemini 2.0 Flash | 2025‑10‑23 | Gemini 2.5 Pro |
| o1‑mini | 2025‑10‑23 | GPT‑5 mini |
| o3 | 2025‑10‑23 | GPT‑5.2 |
| o3‑mini, o4‑mini | 2025‑10‑23 | GPT‑5 mini |

**Notable additions in the current window:** Claude Opus 4.7 (GA, promo multiplier through 2026‑04‑30), Claude Opus 4.6 "fast mode" (preview, 30× multiplier), Gemini 3.1 Pro (preview), Gemini 3 Flash (preview), GPT‑5.3‑Codex (Base/LTS since 2026‑03‑18), GPT‑5.4 / 5.4 mini / 5.4 nano, Goldeneye (fine-tuned GPT‑5.1‑Codex preview).

**Notable policy changes:** Premium request billing went live **2025‑06‑18** on github.com and **2025‑08‑01** on GHE.com (counters zeroed at launch), per [Requests in GitHub Copilot](https://docs.github.com/en/copilot/concepts/billing/copilot-requests). Spark and Cloud Agent moved to **dedicated premium-request SKUs on 2025‑11‑01**.

> "Premium requests for Spark and Copilot cloud agent are tracked in dedicated SKUs from November 1, 2025. This provides better cost visibility and budget control for each AI product."
> — Source: [Requests in GitHub Copilot](https://docs.github.com/en/copilot/concepts/billing/copilot-requests)

---

## 10. Research Limitations

- **Single source dominance.** This report relies primarily on GitHub Docs (an authoritative primary source) for model lists, multipliers, and quotas. Third-party announcements from Anthropic, OpenAI, and Google were not individually fetched in this round; GitHub's docs are the normative surface for Copilot integrations, but provider-side context (e.g., model benchmarks, release notes) is not cross-verified here.
- **§8.3 per-family bullets are synthesis, not direct quotation.** The "strengths & weaknesses by family" bullets combine documented multipliers and task guidance from [Supported AI models](https://docs.github.com/en/copilot/reference/ai-models/supported-models) and [AI model comparison](https://docs.github.com/en/copilot/reference/ai-models/model-comparison) with researcher characterizations (e.g., "community favorite," "narrower track record," "quality variability"). Those evaluative phrases are **not** direct GitHub guidance and should be treated as orientation only.
- **Preview volatility.** Several models (Claude Opus 4.6 fast mode, Gemini 3 Flash, Gemini 3.1 Pro, Raptor mini, Goldeneye) are in public preview, with availability/pricing explicitly marked subject to change. Any figures given may shift.
- **Promotional multipliers expire.** Claude Opus 4.7's 7.5× multiplier is promotional through **2026‑04‑30**; the post-promo multiplier is not published in the source and is not known.
- **Client matrix summarized.** Full per‑client availability is summarized rather than reproduced table-for-table; consult the Supported Models page for exact cell-by-cell coverage, especially for Eclipse / Xcode / JetBrains. The §3.7 CLI/VS Code/Cloud Agent nuance table is a curated subset drawn from multiple docs pages and may miss edge cases.
- **No GitHub repositories consulted.** This topic is a policy/feature topic rather than a code topic; no SDK repos were read for this round. The Copilot SDK example is from the SDK docs, not verified against source.
- **Excluded scope.** Detailed per-model benchmarks, latency numbers, context-window sizes, and token pricing are not published by GitHub per-model and were not imputed from provider pages.

---

## 11. Complete Reference List

### Documentation & Articles (all GitHub Docs, fetched 2026-04-21)

- [Supported AI models in GitHub Copilot](https://docs.github.com/en/copilot/reference/ai-models/supported-models) — Canonical list of models, statuses, per-client and per-plan matrices, multipliers, retirement history.
- [AI model comparison](https://docs.github.com/en/copilot/reference/ai-models/model-comparison) — Task-based recommendations ("general coding", "fast help", "deep reasoning", "visuals").
- [Requests in GitHub Copilot](https://docs.github.com/en/copilot/concepts/billing/copilot-requests) — What a request is, premium vs. included, multiplier table, feature-level billing.
- [Plans for GitHub Copilot](https://docs.github.com/en/copilot/get-started/plans) — Pricing, premium-request allowances, and feature availability per plan.
- [About Copilot auto model selection](https://docs.github.com/en/copilot/concepts/auto-model-selection) — Auto pool per surface, 10% multiplier discount, preview status.
- [Fallback and LTS models](https://docs.github.com/en/copilot/concepts/fallback-and-lts-models) — Base vs. LTS definitions, GPT‑5.3‑Codex designation, GPT‑4.1 fallback behavior.
- [Changing the AI model for GitHub Copilot Chat](https://docs.github.com/en/copilot/how-tos/use-ai-models/change-the-chat-model) — Step-by-step model picker instructions for GitHub.com, VS Code, Visual Studio, JetBrains, Eclipse, Xcode; how to add external providers.
- [Changing the AI model for GitHub Copilot inline suggestions](https://docs.github.com/en/copilot/how-tos/use-ai-models/change-the-completion-model) — Completions model switcher for VS Code, Visual Studio, JetBrains.
- [Changing the AI model for GitHub Copilot cloud agent](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/changing-the-ai-model) — Cloud Agent model picker (Auto, Sonnet 4.5, Opus 4.7, GPT‑5.2‑Codex) and entrypoint constraints.
- [Use BYOK models with Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/use-byok-models) — Env-var config for OpenAI-compatible / Azure / Anthropic providers, offline mode.
- [Bring your own key (Copilot SDK)](https://docs.github.com/en/copilot/how-tos/copilot-sdk/authenticate-copilot-sdk/bring-your-own-key) — Programmatic BYOK with provider config reference.
- [Using your own API keys with GitHub Copilot (enterprise)](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/use-your-own-api-keys) — Enterprise-admin BYOK for Anthropic, AWS Bedrock, Google AI Studio, Microsoft Foundry, OpenAI, OpenAI-compatible, xAI.

### GitHub Repositories
- *None consulted in this round.*

### Code Samples
- Anthropic BYOK Copilot CLI env-var example — Bash, demonstrates `COPILOT_PROVIDER_*` variables pointing the CLI at the Anthropic API.
- Azure AI Foundry BYOK Copilot SDK example — TypeScript/Node, demonstrates `CopilotClient.createSession` with `wireApi: "responses"` for GPT-5-series models.
