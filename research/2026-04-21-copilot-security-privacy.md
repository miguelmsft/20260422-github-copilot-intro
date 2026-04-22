# Research Report: GitHub Copilot Data Security and Privacy

**Date:** 2026-04-21
**Researcher:** Copilot Web Researcher Agent
**Topic slug:** copilot-security-privacy
**Sources consulted:** 14 web pages (docs.github.com authoritative documentation), 0 GitHub repositories

---

## Executive Summary

GitHub Copilot's data-handling model is split along plan lines. **Copilot Business and Copilot Enterprise** customer prompts, code context, and completions are covered by the GitHub Data Protection Agreement (DPA) and are **not used to train models** ([Managing GitHub Copilot policies as an individual subscriber](https://docs.github.com/en/copilot/how-tos/manage-your-account/manage-policies)). **Copilot Free, Pro, and Pro+** data **may be used for training starting April 24, 2026**, unless the user opts out in personal settings ([same page](https://docs.github.com/en/copilot/how-tos/manage-your-account/manage-policies)). Regardless of plan, admins can (a) block suggestions that match ~150 characters of public code ([same page](https://docs.github.com/en/copilot/how-tos/manage-your-account/manage-policies)), (b) apply content-exclusion rules that hide files from Copilot (Business/Enterprise only) ([Content exclusion for GitHub Copilot](https://docs.github.com/en/copilot/concepts/content-exclusion)), and (c) on Enterprise Cloud with data residency, restrict the product to FedRAMP-Moderate–certified models at a **10% premium-request multiplier surcharge** ([FedRAMP-compliant models](https://docs.github.com/en/copilot/concepts/fedramp-models)).

BYOK (Bring Your Own Key) changes the data path significantly: in Copilot Chat the prompt still passes GitHub for safety filtering (not retained beyond the session) ([Responsible use of GitHub Copilot Chat in your IDE](https://docs.github.com/en/copilot/responsible-use/chat-in-your-ide)); in Copilot CLI the prompt is sent **directly to the user's chosen provider** and does not transit GitHub at all — and setting `COPILOT_OFFLINE=true` additionally disables GitHub telemetry ([Responsible use of GitHub Copilot CLI](https://docs.github.com/en/copilot/responsible-use/copilot-cli)). The CLI is the main client with the fewest governance hooks: enterprise **content exclusions, MCP policies, and IDE policies do not apply to Copilot CLI**, and public-code "Block" mode is not enforced the same way it is for IDE inline suggestions ([Administering Copilot CLI for your enterprise](https://docs.github.com/en/copilot/how-tos/copilot-cli/administer-copilot-cli-for-your-enterprise); [Responsible use of GitHub Copilot CLI](https://docs.github.com/en/copilot/responsible-use/copilot-cli)).

This is a beginner-oriented summary, not an exhaustive legal document; see the Research Limitations section for what was not verified.

---

## Table of Contents

1. Overview
2. How Copilot Handles Prompts, Completions, and Code
3. Duplication / Public-Code Matching Filter
4. Data Residency and FedRAMP / GovCloud
5. Content Exclusion Policies
6. Telemetry Controls
7. Plan Differences: Individual vs Business vs Enterprise
8. Third-Party Model BYOK Data Paths
9. CLI vs VS Code: Differences in Data Handling
10. Research Limitations
11. Complete Reference List

---

## 1. Overview

### What It Is
GitHub Copilot is an AI coding assistant (inline suggestions, Chat, CLI, cloud agent, code review) whose data-handling is governed by a mix of per-plan terms, admin policies, and client-specific behaviors. This report covers only the privacy/security surface.

### Why It Matters
Enterprises adopting Copilot typically need to answer: where does code go, who can train on it, what admin controls exist, and what differs when developers use BYOK or the CLI? The answers are not uniform across plans or clients.

### Key Areas Covered
- Data retention & training opt-outs
- Public-code duplication filter
- Regional data residency + FedRAMP path
- Repo-level content exclusions
- Telemetry
- Per-plan data handling
- BYOK data paths
- CLI vs IDE behavioral gaps

---

## 2. How Copilot Handles Prompts, Completions, and Code

Copilot's inline-suggestion pipeline pre-processes the code around the cursor, bundles it with editor context, and sends a prompt to a large language model:

> "The surrounding code from the user's cursor is pre-processed by the Copilot inline suggestion system, combined with contextual information (such as code snippets from open tabs in the editor) and sent to a large language model in the form of a prompt. For information about data retention, see the GitHub Copilot Trust Center."
> — Source: [Responsible use of GitHub Copilot inline suggestions](https://docs.github.com/en/copilot/responsible-use/copilot-code-completion)

For Chat, the prompt is similarly bundled with repo/file context and optionally with `.github/copilot-instructions.md`:

> "The input prompt from the user is pre-processed by the Copilot Chat system, combined with contextual information (for example, the name of the repository the user is currently viewing and the files the user has open), and sent to a large language model."
> — Source: [Responsible use of GitHub Copilot Chat in your IDE](https://docs.github.com/en/copilot/responsible-use/chat-in-your-ide)

**Training opt-outs (April 24, 2026 change).** The authoritative statement on who trains on what:

> "GitHub does not use Copilot Business or Copilot Enterprise customer data to train AI models. Copilot Business and Copilot Enterprise customers' data is protected under GitHub's Data Protection Agreement, which prohibits such use without customer authorization."
> — Source: [Managing GitHub Copilot policies as an individual subscriber](https://docs.github.com/en/copilot/how-tos/manage-your-account/manage-policies)

For Free / Pro / Pro+ plans, the same page states that starting April 24, 2026 GitHub may use user interactions — inputs, outputs, code snippets, and associated context — to train and improve AI models, and that users can opt out from allowing their data to be used for training in the personal GitHub Copilot settings ([Managing GitHub Copilot policies as an individual subscriber](https://docs.github.com/en/copilot/how-tos/manage-your-account/manage-policies)).

The opt-out control lives at *Copilot settings → "Allow GitHub to use my data for AI model training" → Disabled* and is **hidden for Business/Enterprise seats** because the DPA already forbids such use ([Managing GitHub Copilot policies as an individual subscriber](https://docs.github.com/en/copilot/how-tos/manage-your-account/manage-policies)).

**Retention.** Specific retention windows are not published in docs.github.com; the docs consistently defer to the GitHub Copilot Trust Center FAQ for durations. See Research Limitations.

---

## 3. Duplication / Public-Code Matching Filter

Copilot ships a filter that compares a candidate suggestion against an index of all public GitHub repos:

> "If you choose to block suggestions matching public code, in most GitHub Copilot products, GitHub Copilot checks code suggestions with their surrounding code of about 150 characters against public code on GitHub. If there is a match, or a near match, the suggestion is not shown to you."
> — Source: [Managing GitHub Copilot policies as an individual subscriber](https://docs.github.com/en/copilot/how-tos/manage-your-account/manage-policies)

When "Allow" is configured, matches are surfaced as **code references** (URL + license), not suppressed:

> "When you accept a Copilot inline suggestion that matches code in a public GitHub repository, information about the matching code is logged. The log entry includes the URLs of files containing matching code, and the name of the license that applies to that code, if any was found."
> — Source: [GitHub Copilot code referencing](https://docs.github.com/en/copilot/concepts/completions/code-referencing)

> "Typically, matches to public code occur in less than one percent of Copilot suggestions."
> — Source: [GitHub Copilot code referencing](https://docs.github.com/en/copilot/concepts/completions/code-referencing)

Scope caveats from the same page: the index covers only **public GitHub repos** ("Code in private GitHub repositories, or code outside of GitHub, is not included"), and it is **refreshed every few months**, so very new or recently-deleted code may not be represented.

---

## 4. Data Residency and FedRAMP / GovCloud

**Data residency (GHE.com).** GitHub Enterprise Cloud with data residency hosts the tenant on a dedicated subdomain of GHE.com and stores data in a chosen region:

> "The available regions are:
> * EU (includes EFTA countries, Norway and Switzerland, as of May 1, 2026)
> * Australia
> * US"
> — Source: [About GitHub Enterprise Cloud with data residency](https://docs.github.com/en/enterprise-cloud@latest/admin/data-residency/about-github-enterprise-cloud-with-data-residency)

Copilot is available on GHE.com via Business or Enterprise SKUs; managed user accounts cannot purchase Copilot Individual/Pro, and some features are still unavailable on GHE.com (consult the feature overview for data residency) ([About GitHub Enterprise Cloud with data residency](https://docs.github.com/en/enterprise-cloud@latest/admin/data-residency/about-github-enterprise-cloud-with-data-residency); [Plans for GitHub Copilot](https://docs.github.com/en/copilot/get-started/plans)).

**FedRAMP-Moderate models.** FedRAMP enforcement is a *policy toggle* on Enterprise Cloud with data residency in the US:

> "If your enterprise uses GitHub Enterprise Cloud with data residency in the US, you can enable a policy to ensure that users on your Copilot plan can only use models with **FedRAMP Moderate** certification."
> — Source: [FedRAMP-compliant models for GitHub Copilot](https://docs.github.com/en/copilot/concepts/fedramp-models)

> "Copilot requests processed with this enforcement in place include a 10% model multiplier increase. This reflects the additional infrastructure costs that model providers charge for regional and compliance-certified endpoints."
> — Source: [FedRAMP-compliant models for GitHub Copilot](https://docs.github.com/en/copilot/concepts/fedramp-models)

The allowed model list (as of April 2026) includes GPT-4o/4.1/5.2/5.3-Codex variants and Claude Haiku 4.5, Sonnet 4/4.5/4.6, and Opus 4.5/4.6. The policy is **disabled by default** and is configured under *AI controls → Copilot → "Restrict Copilot to FedRAMP models"* in enterprise settings ([FedRAMP-compliant models for GitHub Copilot](https://docs.github.com/en/copilot/concepts/fedramp-models)).

Note: the docs do not currently describe a separate Azure Government / GovCloud SKU for Copilot distinct from this FedRAMP-Moderate policy; see Research Limitations.

---

## 5. Content Exclusion Policies

Content exclusion is a **Business/Enterprise-only** feature that prevents Copilot from reading specified files:

> "When you exclude content from Copilot:
> * Inline suggestions will not be available in the affected files.
> * The content in affected files will not inform inline suggestions in other files.
> * The content in affected files will not inform GitHub Copilot Chat's responses.
> * Affected files will not be reviewed in a Copilot code review."
> — Source: [Content exclusion for GitHub Copilot](https://docs.github.com/en/copilot/concepts/content-exclusion)

Important limits (same page): Per the docs, Copilot may still use semantic information from an excluded file if the IDE provides it indirectly — examples cited include type information, hover-over definitions for symbols used in code, and general project properties such as build configuration information ([Content exclusion for GitHub Copilot](https://docs.github.com/en/copilot/concepts/content-exclusion)).

> "Currently, content exclusions do not apply to symbolic links (symlinks) and repositories located on remote filesystems."
> — Source: [Content exclusion for GitHub Copilot](https://docs.github.com/en/copilot/concepts/content-exclusion)

Exclusions are configured by repo admins or org owners, not individuals. Coverage is broad across IDEs for inline + chat, but **Edit/Agent modes in VS Code are not yet covered**, and web/mobile support is in public preview ([Content exclusion for GitHub Copilot](https://docs.github.com/en/copilot/concepts/content-exclusion)).

---

## 6. Telemetry Controls

Copilot telemetry is an IDE-extension setting and feeds admin reporting:

> "If their recent Copilot usage is still not reflected in their `last_activity_at` date, have the user check that telemetry is enabled in their IDE settings."
> — Source: [Reviewing user activity data for GitHub Copilot in your organization](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-organization/review-activity/review-user-activity-data)

For the CLI, telemetry can be fully turned off:

> "When you use your own model provider without offline mode, Copilot CLI continues to send telemetry to GitHub as usual. This telemetry does not include your prompts or code, but it does include usage metadata.
>
> If you enable offline mode by setting the `COPILOT_OFFLINE` environment variable to `true`, all telemetry is disabled. In offline mode, Copilot CLI only makes network requests to your configured model provider."
> — Source: [Responsible use of GitHub Copilot CLI](https://docs.github.com/en/copilot/responsible-use/copilot-cli)

```bash
# Disable all Copilot CLI telemetry and web tooling — only your BYOK provider is contacted.
# Source: https://docs.github.com/en/copilot/responsible-use/copilot-cli
export COPILOT_OFFLINE=true
copilot
```
> — Source: [Responsible use of GitHub Copilot CLI](https://docs.github.com/en/copilot/responsible-use/copilot-cli) | Provenance: adapted

---

## 7. Plan Differences: Individual vs Business vs Enterprise

| Data-handling behavior | Free / Pro / Pro+ | Business | Enterprise |
|---|---|---|---|
| Prompts/completions used to train GitHub models | Yes by default from 2026-04-24; user opt-out available [[1]](https://docs.github.com/en/copilot/how-tos/manage-your-account/manage-policies) | **No** (DPA) [[1]](https://docs.github.com/en/copilot/how-tos/manage-your-account/manage-policies) | **No** (DPA) [[1]](https://docs.github.com/en/copilot/how-tos/manage-your-account/manage-policies) |
| Personal training-opt-out UI visible | Yes [[1]](https://docs.github.com/en/copilot/how-tos/manage-your-account/manage-policies) | Hidden (N/A) [[1]](https://docs.github.com/en/copilot/how-tos/manage-your-account/manage-policies) | Hidden (N/A) [[1]](https://docs.github.com/en/copilot/how-tos/manage-your-account/manage-policies) |
| Public-code "Block" policy configurable by user | Yes (personal) [[1]](https://docs.github.com/en/copilot/how-tos/manage-your-account/manage-policies) | Inherited from org/enterprise [[2]](https://docs.github.com/en/copilot/concepts/policies) | Inherited from org/enterprise [[2]](https://docs.github.com/en/copilot/concepts/policies) |
| Content exclusion | **Not available** [[3]](https://docs.github.com/en/copilot/concepts/content-exclusion) | Yes (repo + org) [[3]](https://docs.github.com/en/copilot/concepts/content-exclusion) | Yes (repo + org + enterprise) [[3]](https://docs.github.com/en/copilot/concepts/content-exclusion) |
| Enterprise-wide AI-controls policies, audit log | No [[4]](https://docs.github.com/en/copilot/get-started/plans) | Partial (org policies) [[2]](https://docs.github.com/en/copilot/concepts/policies) | Yes (full enterprise policies) [[5]](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-enterprise-policies) |
| Data residency (GHE.com), FedRAMP-Moderate policy | No [[6]](https://docs.github.com/en/enterprise-cloud@latest/admin/data-residency/about-github-enterprise-cloud-with-data-residency) | Available on GHE.com [[6]](https://docs.github.com/en/enterprise-cloud@latest/admin/data-residency/about-github-enterprise-cloud-with-data-residency) | Available on GHE.com [[6]](https://docs.github.com/en/enterprise-cloud@latest/admin/data-residency/about-github-enterprise-cloud-with-data-residency) |

Per-plan sources:
- [1] Training/DPA distinction and opt-out: [Managing GitHub Copilot policies as an individual subscriber](https://docs.github.com/en/copilot/how-tos/manage-your-account/manage-policies)
- [2] Policy hierarchy: [GitHub Copilot policies to control availability of features and models](https://docs.github.com/en/copilot/concepts/policies)
- [3] Content exclusion availability: [Content exclusion for GitHub Copilot](https://docs.github.com/en/copilot/concepts/content-exclusion) ("Organizations with a Copilot Business or Copilot Enterprise plan.")
- [4] Plan feature matrix: [Plans for GitHub Copilot](https://docs.github.com/en/copilot/get-started/plans)
- [5] Enterprise policy surface: [Managing policies and features for GitHub Copilot in your enterprise](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-enterprise-policies)
- [6] Data residency regions & Copilot availability: [About GitHub Enterprise Cloud with data residency](https://docs.github.com/en/enterprise-cloud@latest/admin/data-residency/about-github-enterprise-cloud-with-data-residency)
- Terms framing: [Resources for getting approval of GitHub Copilot](https://docs.github.com/en/copilot/get-started/resources-for-approval) — notes that Business/Enterprise are governed by the [GitHub Generative AI Services Terms](https://github.com/customer-terms/github-generative-ai-services-terms) and the [GitHub DPA](https://gh.io/dpa).

---

## 8. Third-Party Model BYOK Data Paths

BYOK in **Copilot Chat (IDE/web)** — prompt passes GitHub briefly for safety filtering, then goes to the chosen provider:

> "When using BYOK, your prompts and responses are transmitted to your selected provider and may be subject to that provider's data retention and privacy policies. GitHub temporarily processes this data for safety filtering but does not retain BYOK conversation content beyond session duration."
> — Source: [Responsible use of GitHub Copilot Chat in your IDE](https://docs.github.com/en/copilot/responsible-use/chat-in-your-ide)

> "Regardless of which provider is active, responses still pass through GitHub's safety systems, including content filtering, before results are shown to you."
> — Source: [Responsible use of GitHub Copilot Chat in your IDE](https://docs.github.com/en/copilot/responsible-use/chat-in-your-ide)

Supported providers listed in that doc: Anthropic, AWS Bedrock, Google AI Studio, Microsoft Foundry, OpenAI, OpenAI-compatible, xAI ([Responsible use of GitHub Copilot Chat in your IDE](https://docs.github.com/en/copilot/responsible-use/chat-in-your-ide)). In Agent mode, auxiliary tool calls may still hit GitHub-hosted models regardless of BYOK ([same page](https://docs.github.com/en/copilot/responsible-use/chat-in-your-ide)).

BYOK in **Copilot CLI** — the opposite model: prompts bypass GitHub entirely.

> "When you configure Copilot CLI to use your own model provider, your prompts, code context, and generated responses are sent directly to the provider you configure. They are not routed through GitHub."
> — Source: [Responsible use of GitHub Copilot CLI](https://docs.github.com/en/copilot/responsible-use/copilot-cli)

> "GitHub authentication is not required when using your own model provider (BYOK)."
> — Source: [Responsible use of GitHub Copilot CLI](https://docs.github.com/en/copilot/responsible-use/copilot-cli)

Without GitHub authentication, the same page notes that features dependent on GitHub — including `/delegate`, the GitHub MCP server, and GitHub Code Search — are unavailable ([Responsible use of GitHub Copilot CLI](https://docs.github.com/en/copilot/responsible-use/copilot-cli)).

**Enterprise implication:** CLI BYOK is configured at the user level and **cannot be controlled by enterprise policy**:

> "User-configured model providers (BYOK): Users can configure Copilot CLI to use their own model providers via environment variables. This is configured at the *user level* and cannot be controlled by enterprise policies."
> — Source: [Administering Copilot CLI for your enterprise](https://docs.github.com/en/copilot/how-tos/copilot-cli/administer-copilot-cli-for-your-enterprise)

---

## 9. CLI vs VS Code: Differences in Data Handling

| Behavior | VS Code / IDE Copilot | Copilot CLI |
|---|---|---|
| Prompt/context leaves local machine to | GitHub (then model) [[A]](https://docs.github.com/en/copilot/responsible-use/copilot-code-completion) | GitHub (then model) — *or* directly to BYOK provider [[B]](https://docs.github.com/en/copilot/responsible-use/copilot-cli) |
| BYOK safety filtering by GitHub | Yes (session-only) [[C]](https://docs.github.com/en/copilot/responsible-use/chat-in-your-ide) | No (direct to provider) [[B]](https://docs.github.com/en/copilot/responsible-use/copilot-cli) |
| Content exclusion policy enforced | Yes (inline + chat) [[D]](https://docs.github.com/en/copilot/concepts/content-exclusion) | **Not enforced** [[E]](https://docs.github.com/en/copilot/how-tos/copilot-cli/administer-copilot-cli-for-your-enterprise) |
| MCP server enterprise policy | Yes [[E]](https://docs.github.com/en/copilot/how-tos/copilot-cli/administer-copilot-cli-for-your-enterprise) | **Not enforced** [[E]](https://docs.github.com/en/copilot/how-tos/copilot-cli/administer-copilot-cli-for-your-enterprise) |
| IDE-specific enterprise policies | Yes [[E]](https://docs.github.com/en/copilot/how-tos/copilot-cli/administer-copilot-cli-for-your-enterprise) | N/A [[E]](https://docs.github.com/en/copilot/how-tos/copilot-cli/administer-copilot-cli-for-your-enterprise) |
| Public-code "Block" policy reliably enforced | Yes (inline suggestions) [[F]](https://docs.github.com/en/copilot/how-tos/manage-your-account/manage-policies) | **Partial** — may still emit matches [[B]](https://docs.github.com/en/copilot/responsible-use/copilot-cli) |
| Telemetry disable switch | IDE extension setting [[G]](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-organization/review-activity/review-user-activity-data) | `COPILOT_OFFLINE=true` (also disables web tools) [[B]](https://docs.github.com/en/copilot/responsible-use/copilot-cli) |
| Authentication required | Yes | Yes **unless** using BYOK [[B]](https://docs.github.com/en/copilot/responsible-use/copilot-cli) |

Legend: [A] inline suggestions, [B] CLI responsible-use, [C] Chat responsible-use, [D] content-exclusion, [E] CLI enterprise admin, [F] individual policies, [G] activity data.

Source for the non-applicable policies list: [Administering Copilot CLI for your enterprise](https://docs.github.com/en/copilot/how-tos/copilot-cli/administer-copilot-cli-for-your-enterprise). That page states that other enterprise controls do not affect Copilot CLI, and specifically calls out Model Context Protocol (MCP) server policies, IDE-specific policies, file-path-based content exclusions, and user-configured model providers (BYOK) as controls that do not apply to the CLI ([Administering Copilot CLI for your enterprise](https://docs.github.com/en/copilot/how-tos/copilot-cli/administer-copilot-cli-for-your-enterprise)).

Public-code caveat specific to CLI:

> "GitHub Copilot CLI may generate code that is a match or near match of publicly available code, even if the 'Suggestions matching public code' policy is set to 'Block.'"
> — Source: [Responsible use of GitHub Copilot CLI](https://docs.github.com/en/copilot/responsible-use/copilot-cli)

Also relevant: CLI runs commands in the user's shell and requests permission before writing files or executing risky commands (or bypasses prompts via `--allow-all-tools` / `--allow-all` / autopilot mode) — that is a *local-security* consideration distinct from data-privacy, but worth flagging for approval reviews ([Responsible use of GitHub Copilot CLI](https://docs.github.com/en/copilot/responsible-use/copilot-cli)).

---

## 10. Research Limitations

- **Retention durations are not in docs.github.com.** Exact retention windows for prompts, completions, and telemetry (e.g., how long chat transcripts persist, how long BYOK safety-filter processing retains bytes) are consistently deferred to the GitHub Copilot Trust Center FAQ (`https://copilot.github.trust.page/faq`), which is a JavaScript-rendered SPA and was not fetchable as static HTML during this research. Anyone relying on this for compliance signoff should pull current figures directly from the Trust Center UI.
- **GovCloud / Azure Government.** Copilot docs describe FedRAMP-Moderate *model enforcement* on GHE.com (US) with a 10% multiplier surcharge, but do not currently describe a separate GovCloud-hosted Copilot product. If a GovCloud offering exists, it was not documented at the URLs consulted.
- **DPA-covered previews.** The set of preview features that are DPA-covered versus not is maintained at `gh.io/dpa-previews` and changes over time; treat the list as dynamic.
- **Trust Center and github.blog pages** were not successfully retrieved (SPA / redirects / 404s in April 2026 URL structure). Every claim in this report is therefore drawn from docs.github.com primary documentation.
- **BYOK Chat auxiliary tool calls**: the exact list of built-in GitHub-hosted models that still run during Agent mode (code apply, etc.) is not enumerated in the consulted docs — only that they exist.
- **CLI content-exclusion gap** is stated as current behavior; GitHub may close this gap in a future release.

---

## 11. Complete Reference List

### Documentation & Articles (docs.github.com)
- [Responsible use of GitHub Copilot inline suggestions](https://docs.github.com/en/copilot/responsible-use/copilot-code-completion) — How prompts are assembled and sent; defers retention to Trust Center.
- [Responsible use of GitHub Copilot Chat in your IDE](https://docs.github.com/en/copilot/responsible-use/chat-in-your-ide) — Chat input processing; BYOK data-handling section.
- [Responsible use of GitHub Copilot CLI](https://docs.github.com/en/copilot/responsible-use/copilot-cli) — CLI BYOK direct-to-provider path, `COPILOT_OFFLINE`, public-code Block caveat.
- [GitHub Copilot code referencing](https://docs.github.com/en/copilot/concepts/completions/code-referencing) — ~150-char match window, <1% match rate, index refresh cadence.
- [Managing GitHub Copilot policies as an individual subscriber](https://docs.github.com/en/copilot/how-tos/manage-your-account/manage-policies) — Training opt-out starting 2026-04-24, DPA carve-out for Business/Enterprise, public-code toggle.
- [Content exclusion for GitHub Copilot](https://docs.github.com/en/copilot/concepts/content-exclusion) — Business/Enterprise-only file-hiding, IDE coverage, known limits.
- [FedRAMP-compliant models for GitHub Copilot](https://docs.github.com/en/copilot/concepts/fedramp-models) — FedRAMP-Moderate policy, 10% multiplier, allowed models.
- [About GitHub Enterprise Cloud with data residency](https://docs.github.com/en/enterprise-cloud@latest/admin/data-residency/about-github-enterprise-cloud-with-data-residency) — EU / Australia / US regions, Copilot availability on GHE.com.
- [GitHub Copilot policies to control availability of features and models](https://docs.github.com/en/copilot/concepts/policies) — Org vs enterprise policy hierarchy, privacy policies.
- [Managing policies and features for GitHub Copilot in your enterprise](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-enterprise-policies) — AI controls navigation.
- [Administering Copilot CLI for your enterprise](https://docs.github.com/en/copilot/how-tos/copilot-cli/administer-copilot-cli-for-your-enterprise) — Enumerates which enterprise controls do NOT apply to CLI (content exclusions, MCP, IDE, BYOK).
- [Plans for GitHub Copilot](https://docs.github.com/en/copilot/get-started/plans) — Feature matrix across Free/Pro/Pro+/Business/Enterprise.
- [Resources for getting approval of GitHub Copilot](https://docs.github.com/en/copilot/get-started/resources-for-approval) — Links to GitHub Generative AI Services Terms, Microsoft Product Terms, DPA, Trust Center.
- [Reviewing user activity data for GitHub Copilot in your organization](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-organization/review-activity/review-user-activity-data) — IDE telemetry required for `last_activity_at`.

### External references (cited but not deep-read due to SPA/redirect issues)
- [GitHub Copilot Trust Center](https://copilot.github.trust.page/) — Referenced by docs.github.com for retention specifics.
- [GitHub Copilot Trust Center — FAQ](https://copilot.github.trust.page/faq) — Specific FAQ path cited in §10 for retention durations (JavaScript SPA; not statically fetchable).
- [GitHub Data Protection Agreement](https://gh.io/dpa) — Binding contract for Business/Enterprise data handling.
- [GitHub Generative AI Services Terms](https://github.com/customer-terms/github-generative-ai-services-terms) — Commercial terms when purchasing directly from GitHub.

### GitHub Repositories
- None consulted — topic is policy/documentation-oriented.

---

## Revision History

**Revision Round 2 — 2026-04-21.** Addressed web-research-reviewer Round 1 findings: (1) Replaced four ellipsized "verbatim" blockquotes in §2, §5, §8, and §9 with either exact-excerpt verbatim quotes or paraphrased prose with citation. (2) Added inline citations to the Executive Summary for plan-based training, BYOK data paths, CLI governance gaps, and the FedRAMP 10% surcharge. (3) Added inline citations to synthesis claims in §2 (opt-out UI location), §4 (GHE.com availability, FedRAMP defaults), §5 (Edit/Agent mode coverage), §7 (plan-differences table, now row-level cited), §8 (supported BYOK providers), and §9 (CLI-vs-IDE table now row-level cited; autopilot/permission caveat). (4) Fixed §11 reference-list URL mismatch by adding the exact `copilot.github.trust.page/faq` entry alongside the root Trust Center URL. (5) Reconciled the previously orphaned *Plans for GitHub Copilot* reference by citing it in §4 and in the §7 table sources.

**Revision Round 3 — 2026-04-21.** Addressed remaining Round 2 🟡 Important finding: rewrote the §5 `It's possible that Copilot may use semantic information...` blockquote as paraphrased prose with an inline citation, eliminating the ellipsis/truncation while preserving substance (type information, hover-over definitions for symbols used in code, and general project properties such as build configuration information).
