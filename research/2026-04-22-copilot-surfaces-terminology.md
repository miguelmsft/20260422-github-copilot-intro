# Research Report: What does GitHub Officially Call the Places You Can Use Copilot?

**Date:** 2026-04-22
**Researcher:** Copilot Web Researcher Agent
**Topic slug:** copilot-surfaces-terminology
**Sources consulted:** 8 official GitHub pages (docs.github.com, github.com/features/copilot, github.blog)

---

## Executive Summary

A beginner presentation uses the word **"Copilot surfaces"** to describe the collection of places Copilot runs (VS Code, JetBrains, Xcode, Eclipse, CLI, GitHub.com, GitHub Mobile, cloud agent, Windows Terminal, etc.). After scanning the authoritative GitHub properties (`docs.github.com/copilot`, `github.com/features/copilot`, and the GitHub Blog/Changelog), **"surface" is not an official GitHub term** — it does not appear in any of the reviewed official pages.

GitHub itself does not use a single crisp noun for this collection. Instead it uses a cluster of phrases. The closest thing to an **official umbrella term** is **"(coding) environment"** — the install page is titled *"Installing the GitHub Copilot extension in your environment"* and tells readers to pick their *"preferred coding environment"*. Other frequently used phrases are **"supported IDEs"**, **"editors"**, **"Copilot integrations"**, and (in the Changelog taxonomy) **"client apps"**.

**Recommendation:** If you want a term GitHub itself uses, pick **"coding environment(s)"**. If you want the clearest beginner phrasing — not a verbatim GitHub term, but a synthesis of what the docs actually say — use **"supported IDEs and tools"**. Reserve "surface" as informal shorthand only, and flag it as non-official when used.

---

## Table of Contents

1. [Evidence from Official Sources](#1-evidence-from-official-sources)
2. [Candidate Terms Ranked by Prominence](#2-candidate-terms-ranked-by-prominence)
3. [Is "Surface" Official? — Verdict](#3-is-surface-official--verdict)
4. [Recommendation](#4-recommendation)
5. [Research Limitations](#5-research-limitations)
6. [Reference List](#6-reference-list)

---

## 1. Evidence from Official Sources

### On `github.com/features/copilot` (marketing page)

> "Copilot works where you do—in GitHub, your IDE, project tools, chat apps, and custom MCP servers."
> — Source: [GitHub Copilot · Your AI pair programmer](https://github.com/features/copilot)

> "GitHub Copilot integrates with leading editors, including Visual Studio Code, Visual Studio, JetBrains IDEs, and Neovim, and, unlike other AI coding assistants, is natively built into GitHub."
> — Source: [GitHub Copilot · Your AI pair programmer](https://github.com/features/copilot)

> "GitHub Copilot is also supported in terminals through GitHub CLI and as a chat integration in Windows Terminal Canary. … All plans are supported in GitHub Copilot in GitHub Mobile."
> — Source: [GitHub Copilot · Your AI pair programmer](https://github.com/features/copilot)

> "GitHub Copilot Business primarily features GitHub Copilot in the coding environment — that is the IDE, CLI and GitHub Mobile."
> — Source: [GitHub Copilot · Your AI pair programmer](https://github.com/features/copilot)

### On `docs.github.com/copilot`

> "GitHub Copilot Chat is available on the GitHub website, in GitHub Mobile, in supported IDEs, and in Windows Terminal."
> — Source: [GitHub Copilot features — GitHub Docs](https://docs.github.com/en/copilot/get-started/features)

> "Installing the GitHub Copilot extension in your environment. To use Copilot in your preferred coding environment, follow the steps for your chosen IDE."
> — Source: [Install the GitHub Copilot extension — GitHub Docs](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-extension)

> "To see instructions for other popular coding environments, use the tool switcher at the top of the page."
> — Source: [Install the GitHub Copilot extension — GitHub Docs](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-extension)

The docs left-nav uses the label **"About Copilot integrations"** under the *Tools / AI tools* group, and the install page uses the per-IDE picker label **"Tool navigation"** (Visual Studio Code, JetBrains IDEs, Visual Studio, Eclipse, Vim/Neovim, Azure Data Studio, Xcode).
— Source: [docs.github.com/en/copilot](https://docs.github.com/en/copilot) and [Install the GitHub Copilot extension](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-extension)

### On the GitHub Blog / Changelog

The GitHub Changelog classifies Copilot-delivery-surface announcements under a formal tag called **"Client apps"**. The excerpts below are drawn from different UI elements on the page (the tag list in the sidebar and individual entry labels) — treat them as a **synthesis of page elements**, not one contiguous passage:

- Sidebar tag list includes: *"Client apps"* alongside *"Collaboration tools"*, *"Enterprise management tools"*, *"Platform governance"*, etc.
- Entry: *"GitHub Mobile: Research and code with Copilot cloud agent anywhere"* — tagged `client apps`, `copilot`.
- Entry: *"Copilot CLI now supports BYOK and local models"* — tagged `client apps`, `copilot`.

— Source: [GitHub Changelog — Copilot label](https://github.blog/changelog/label/copilot/) | Provenance: synthesized from multiple on-page elements

On the Copilot agent announcement post, GitHub writes:

> "… it will allow you to directly assign issues to GitHub Copilot, using any of the GitHub clients, and have it produce fully tested pull requests."
> — Source: [GitHub Copilot: The agent awakens — The GitHub Blog](https://github.blog/news-insights/product-news/github-copilot-the-agent-awakens/) | Provenance: verbatim

> "Agent mode will change the way developers work in their editor; and as such, we will bring it to all IDEs that Copilot supports."
> — Source: [GitHub Copilot: The agent awakens — The GitHub Blog](https://github.blog/news-insights/product-news/github-copilot-the-agent-awakens/)

---

## 2. Candidate Terms Ranked by Prominence

Ranked by frequency and prominence in the official sources scanned above. All six are attested in at least one authoritative GitHub property; none is used as a single definitive umbrella term.

| Rank | Term | Where it appears | Scope covered | Representative quote |
|------|------|------------------|---------------|----------------------|
| 1 | **"supported IDEs"** / **"IDEs"** | Docs (Features page), marketing page, blog | IDE/editor plugins only (VS Code, Visual Studio, JetBrains, Neovim, Xcode, Eclipse…) | *"available on the GitHub website, in GitHub Mobile, in supported IDEs, and in Windows Terminal."* — [docs.github.com Features](https://docs.github.com/en/copilot/get-started/features) |
| 2 | **"editors"** | `github.com/features/copilot` (hero copy), blog | IDE/editor plugins | *"GitHub Copilot integrates with leading editors, including Visual Studio Code, Visual Studio, JetBrains IDEs, and Neovim…"* — [github.com/features/copilot](https://github.com/features/copilot) |
| 3 | **"(coding) environment" / "your environment"** | Docs install page (page title + body), features page | IDE + CLI + GitHub Mobile ("the coding environment — that is the IDE, CLI and GitHub Mobile") | *"Installing the GitHub Copilot extension in your environment … your preferred coding environment."* — [Install the GitHub Copilot extension](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-extension) |
| 4 | **"Copilot integrations"** | Docs left-nav ("About Copilot integrations"), marketing page ("chat integration in Windows Terminal") | Tends to mean third-party/extension points (Jira, Slack, Windows Terminal, MCP) more than IDEs | *"About Copilot integrations"* (nav) — [docs.github.com/en/copilot](https://docs.github.com/en/copilot); *"a chat integration in Windows Terminal Canary"* — [github.com/features/copilot](https://github.com/features/copilot) |
| 5 | **"client apps" / "GitHub clients"** | GitHub Changelog taxonomy, GitHub Blog | Broadest: mobile apps, desktop/CLI clients, IDE plugins | Tag *"Client apps"* on [GitHub Changelog](https://github.blog/changelog/label/copilot/); *"using any of the GitHub clients"* — [GitHub Blog](https://github.blog/news-insights/product-news/github-copilot-the-agent-awakens/) |
| 6 | **"tools"** (as in *"IDEs and tools"* / docs picker label **"Tool navigation"**) | Docs picker + left-nav *"AI tools"* group | Catch-all incl. CLI, editor extensions | *"Tool navigation: Visual Studio Code · JetBrains IDEs · Visual Studio · Eclipse · Vim/Neovim · Azure Data Studio · Xcode."* — [Install the GitHub Copilot extension](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-extension) |

Notably absent from every official page reviewed: **"surface"**, **"Copilot surfaces"**, **"endpoints"**, **"touchpoints"**, **"channels"**.

---

## 3. Is "Surface" Official? — Verdict

**No.** "Surface" / "Copilot surfaces" does **not** appear on any of the official GitHub pages reviewed:

- `docs.github.com/en/copilot` (landing + nav)
- `docs.github.com/en/copilot/get-started/what-is-github-copilot`
- `docs.github.com/en/copilot/get-started/features`
- `docs.github.com/en/copilot/get-started/plans`
- `docs.github.com/en/copilot/how-tos/set-up/install-copilot-extension`
- `github.com/features/copilot`
- `github.blog/changelog/label/copilot/` and the GA-agent blog post

"Surface" is commonly used as informal shorthand in developer-tools discussion, but **GitHub's own Copilot-branded documentation and marketing do not use it as a noun for the collection of entry points** in any of the pages reviewed here.

---

## 4. Recommendation

For a beginner presentation, prefer terminology the audience will see again when they read GitHub's own docs:

1. **Best overall (beginner-friendly, matches docs verbatim):**
   > *"Where you can use Copilot — supported IDEs and tools"*
   or simply *"IDEs and tools"*. This mirrors the docs "Tool navigation" picker and the Features-page sentence *"available on the GitHub website, in GitHub Mobile, in supported IDEs, and in Windows Terminal."*

2. **Best single-word umbrella that GitHub itself uses:**
   > *"coding environments"* (from the install-page headline *"Installing the GitHub Copilot extension in your environment"*). Works when the list includes IDE + CLI + Mobile.

3. **If you need to emphasize the agentic / third-party side** (cloud agent, Jira, Slack, Windows Terminal, MCP):
   > *"Copilot integrations"* — this is the literal docs nav label.

4. **If the list is truly everything — editors, CLI, mobile, web:**
   > *"GitHub clients"* or *"client apps"* — matches the Changelog taxonomy and the agent-GA blog post's "any of the GitHub clients" phrasing.

5. **Keep "surface" only as informal shorthand**, and flag it explicitly: *"we'll call these 'surfaces' for short — GitHub's docs call them 'supported IDEs and tools'."* That is honest with beginners and preserves the brevity "surface" gives you.

---

## 5. Research Limitations

- Scope was intentionally narrow: only the core Copilot landing pages, the Features page, the Plans page, the install page, the `features/copilot` marketing page, and the Copilot Changelog/blog. Deeper subpages (enterprise admin, Copilot for Business, each IDE-specific setup page) were not exhaustively scanned; minor additional phrasings may exist there.
- GitHub rewords these pages frequently. The quotes above were captured 2026‑04‑22; wording may drift.
- "Surface" could conceivably appear in less-prominent docs (e.g., REST/API reference pages, engineering blog posts, Universe session descriptions) that were not reviewed. The claim made here is specifically that **it is not used in the primary, public-facing Copilot-overview surface of docs.github.com, github.com/features/copilot, or the GitHub Blog/Changelog landing pages reviewed**.
- `github.com/features/copilot` is a marketing page; its prose is editorial, not canonical docs. Weight `docs.github.com` phrasings higher when in doubt.

---

## 6. Reference List

### Documentation (docs.github.com)
- [GitHub Copilot documentation — home](https://docs.github.com/en/copilot) — Left-nav includes "About Copilot integrations"; no use of "surface".
- [What is GitHub Copilot?](https://docs.github.com/en/copilot/get-started/what-is-github-copilot) — Copilot overview page; reviewed for terminology ("IDE", "editor", etc.).
- [GitHub Copilot features](https://docs.github.com/en/copilot/get-started/features) — Canonical list of Copilot capabilities across "supported IDEs", GitHub website, GitHub Mobile, Windows Terminal.
- [GitHub Copilot plans](https://docs.github.com/en/copilot/get-started/plans) — Reviewed for plan-scope terminology; did not contribute the "coding environment" phrasing (that appears on the features/copilot marketing page).
- [Install the GitHub Copilot extension in your environment](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-extension) — Uses "your environment" / "coding environment" / "Tool navigation" picker.

### Marketing (github.com)
- [GitHub Copilot · Your AI pair programmer](https://github.com/features/copilot) — Uses "editors", "where you do", "coding environment", "chat integration".

### GitHub Blog / Changelog
- [GitHub Changelog — Copilot label](https://github.blog/changelog/label/copilot/) — Uses the formal tag **"Client apps"** for announcements about Copilot in Mobile, CLI, IDEs.
- [GitHub Copilot: The agent awakens](https://github.blog/news-insights/product-news/github-copilot-the-agent-awakens/) — Uses "any of the GitHub clients" and "all IDEs that Copilot supports".
