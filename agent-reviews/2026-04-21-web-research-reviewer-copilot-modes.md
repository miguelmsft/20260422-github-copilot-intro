---
reviewer: web-research-reviewer
subject: GitHub Copilot Modes — Ask, Edit, Agent, Plan, Autopilot
companion: web-researcher
date: 2026-04-21
verdict: APPROVED
---

## Review Round 1 — 2026-04-21

## Reference Validation

8 of 8 body-cited URLs checked (14 URLs total in the complete reference list).

- `https://code.visualstudio.com/docs/copilot/agents/overview` — reachable (200) and relevant. Supports the built-in Agent/Plan/Ask description and the Autopilot permission-level language used in §§1 and 5.
- `https://code.visualstudio.com/docs/copilot/agents/local-agents` — reachable (200) and relevant. Supports the Ask, Edit-deprecation, Agent, and Plan quotes used in §4.
- `https://code.visualstudio.com/docs/copilot/agents/planning` — reachable (200) and relevant. Supports the `/plan` workflow and `plan.md` session-memory quote in §§3 and 4.4.
- `https://code.visualstudio.com/docs/copilot/chat/copilot-chat` — reachable (200) and relevant. Supports the "session type / agent / permission level / language model" framing in §2.
- `https://code.visualstudio.com/docs/copilot/customization/custom-agents` — reachable (200) and relevant. Supports the custom-agent rename and handoff behavior used in §§2, 4.4, and 4.5.
- `https://code.visualstudio.com/docs/copilot/agents/cloud-agents` — reachable (200) and relevant. Supports the local-vs-cloud distinction in §§6-7.
- `https://docs.github.com/en/copilot/concepts/agents/coding-agent` — reachable (200) and relevant. Supports the PR-oriented cloud-agent description in §7.
- `https://docs.github.com/en/copilot/concepts/billing/copilot-requests` — reachable (200) and relevant. Supports the premium-request billing claims in §9.

No dead links, unrelated redirects, or signs of fabricated URLs in the checked sample.

## Claim Citation Coverage

- 🟡 Important (must-fix) **Location:** Executive Summary, paragraphs 1-3 (lines 12-16). **Issue:** The summary makes the report's highest-stakes framing claims - the three-dimensional model, Edit deprecation, Autopilot as a permission level rather than a separate mode, and IDE-vs-cloud billing distinctions - without inline citations. **Why it matters:** The executive summary is likely to be read in isolation; without citations, readers cannot quickly verify the report's core conclusions.
- 🟡 Important (must-fix) **Location:** §3 "Getting Started" - especially "Prerequisites" and "Slash shortcuts" (lines 95-123). **Issue:** Several time-sensitive or operational claims are uncited inline, including the April 20, 2026 sign-up pause/usage-limit note, the "VS Code 1.99+" requirement, and the bundled slash-command list. During audit I confirmed the commands are documented, but the report itself does not attach source links to these claims. **Why it matters:** Setup guidance and command surfaces change quickly; missing inline citations makes the most actionable section harder to trust and update.
- 🟢 Minor (nice-to-have) **Location:** §4 mode sub-sections and §8 tables. **Issue:** A few synthesized product-surface lists ("Surfaces", "Use it for", decision guidance) are lightly cited or uncited. **Why it matters:** These are lower-risk than the summary/setup sections, but adding one source link per synthesized cluster would improve traceability.

## Quote Verification

10 of 20 verbatim quotes spot-checked against the live pages.

- Verified on-page: built-in Agent/Plan/Ask quote (§1), chat-session dimensions quote (§2), custom-agent rename quote (§2), `/plan` quote (§3), Edit deprecation quote (§3/§4.2), plan-memory quote (§4.4), handoff-button quote (§4.4), Autopilot quote (§5), local-vs-cloud quote (§7), cloud-agent PR quote (§7), and billing quotes (§9).
- No checked quote appeared fabricated, materially altered, or misattributed.
- Quotes are embedded inline in relevant sections rather than collected into a separate end section.

No material issues.

## Source Authority Compliance

The report is strong here. Core claims rely primarily on official VS Code documentation and official GitHub Docs, which is the right authority mix for a product-surface explainer like this. Community/forum sources are not used to support core claims.

No material issues.

## Conflict & Uncertainty Disclosure

The report appropriately surfaces the key ambiguity: GitHub's older "mode" terminology versus VS Code's newer "agent" terminology, plus the distinction between in-IDE Agent and Copilot cloud agent. The Research Limitations section also acknowledges uncertainty around Autopilot's exact preview behavior and Edit mode's eventual retirement timing.

No material issues.

## Source Freshness & Currency

The report leans on current live docs pages, and the time-sensitive April 2026 terminology/billing changes are generally handled with up-to-date sources. I also independently confirmed the historical `docs.github.com/en/copilot/get-started/chat-modes` URL now returns 404, which supports the limitations note about doc migration.

- 🟢 Minor (nice-to-have) **Location:** §3 "Prerequisites" and §9 "Key billing facts". **Issue:** These sections contain the most time-sensitive details in the report, so they would benefit from tighter inline citations than the rest of the document. **Why it matters:** Freshness problems are most likely to appear first in signup, plan-availability, and pricing details.

## Topic Coverage Assessment

The report covers the major subtopics a beginner presentation on Copilot modes should include: terminology shift, built-in agents, permission levels, targets, cloud-vs-local distinction, decision guidance, and billing. Depth is proportionate, and the Executive Summary accurately reflects the body.

No material issues.

## Research Limitations Review

The section exists and is useful. It acknowledges terminology drift, missing first-party depth on Autopilot, the migrated/404 historical URL, uncertainty around Edit retirement timing, and explicit out-of-scope areas.

No material issues.

## Code & CLI Validation

This is not primarily a code-oriented report, so the absence of Python examples is appropriate. The included fenced blocks are diagrams, shortcuts, slash commands, YAML configuration, and a decision tree rather than runnable software examples.

- The YAML custom-agent example is syntactically plausible and has explicit post-block attribution.
- The slash commands listed in §3 (`/plan`, `/fork`, `/savePrompt`, `/agents`, `/create-agent`, `/delegate`) are all documented on the fetched Microsoft pages checked during audit.

No material issues.

## Reference List Integrity

- All 8 body-cited URLs appear in the reference list.
- The "Sources consulted: 14 web pages" header matches the 14 entries in "Documentation & Articles."
- References are organized under the expected categories: Documentation & Articles, GitHub Repositories, and Code Samples.

- 🟢 Minor (nice-to-have) **Location:** §11 Complete Reference List. **Issue:** Six documentation entries appear to be consulted-only rather than cited directly in the body (`Manage chat sessions`, `What is GitHub Copilot?`, `GitHub Copilot features`, `Use chat`, `Copilot Chat Cookbook`, `GitHub Changelog`). **Why it matters:** This is acceptable for a complete consulted-sources list, but tying them to specific claims would improve auditability.

## Report Structure & Readability

The report follows a clear template: executive summary, contents, core sections, limitations, and reference list. Ordering is logical, the ToC matches the section flow, and the writing is readable and internally consistent. Quotes are inline rather than separated into a detached quotes section.

No material issues.

## Suggested Improvements (Prioritized)

1. Add inline citations to the Executive Summary so the report's central conclusions can be verified without hunting through the body.
2. Add explicit inline citations in §3 for the April 2026 prerequisite note, the "VS Code 1.99+" requirement, and the slash-command list.
3. Where a section synthesizes several product-surface facts (for example "Surfaces" lists or the decision table), attach at least one nearby source link for the cluster.
4. Optionally tie the consulted-only references in §11 to specific claims in the body, or note that they were background-reading sources not directly cited.

## Readiness Verdict: APPROVED WITH EDITS

The report is substantially sound: the checked URLs are real and relevant, the sampled quotes verify cleanly, source authority is strong, and the overall framing is accurate and useful. The remaining blockers are citation-discipline issues rather than factual trust failures. To reach **APPROVED**, add inline citations for the Executive Summary's core claims and for the highest-risk setup/command claims in §3.

## Review Round 2 — 2026-04-21

### Fix Verification

- Executive Summary inline citations — ✅ fixed. Paragraphs 1-3 now cite the three-dimensional session model, Edit deprecation, Autopilot-as-permission-level framing, cloud-vs-IDE distinction, and billing claims with inline links to the relevant VS Code and GitHub Docs pages.
- §3 setup / prerequisites citations — ✅ fixed. The April 20, 2026 signup-pause / usage-limit note and the VS Code 1.99+ docs-baseline statement now have explicit inline citations in the Prerequisites bullets.
- §3 slash-command citations — ✅ fixed. The bundled command list now includes explicit source support for `/plan`, `/fork`, `/savePrompt`, `/agents`, `/create-agent`, and `/delegate`.
- §4 clustered citations — ✅ fixed. The Ask / Agent / Plan "Use it for" and "Surfaces" synthesis clusters now carry nearby source links instead of relying on distant context.
- §8 clustered citations — ✅ fixed. Sections 8.1 and 8.2 now include source-synthesis notes tying the comparison table and decision tree to the primary documentation pages used to derive them.
- §9 billing citations — ✅ fixed. Each "Key billing facts" bullet now includes inline citation support, including the plan-gating statement for Copilot cloud agent.

## Reference Validation

8 of 14 cited URLs checked in this re-review.

- `https://code.visualstudio.com/docs/copilot/agents/overview` — reachable and relevant. Supports the built-in agent / permission-level framing used in the Executive Summary, §§2, 5, 6, and 8.
- `https://code.visualstudio.com/docs/copilot/agents/local-agents` — reachable and relevant. Supports Edit deprecation plus the Ask / Agent / Plan descriptions used in §§1, 3, and 4.
- `https://code.visualstudio.com/docs/copilot/agents/planning` — reachable and relevant. Supports `/plan` and the `plan.md` session-memory details used in §§3 and 4.4.
- `https://code.visualstudio.com/docs/copilot/agents/cloud-agents` — reachable and relevant. Supports `/delegate`, remote-execution constraints, and the local-vs-cloud distinction used in §§6-7.
- `https://docs.github.com/en/copilot/concepts/billing/copilot-requests` — reachable and relevant. Supports the IDE-vs-cloud billing split and per-prompt / per-session accounting used in §9 and the Executive Summary.
- `https://code.visualstudio.com/docs/copilot/chat/chat-sessions` — reachable and relevant. Supports `/fork` and `/savePrompt` in §3.
- `https://code.visualstudio.com/docs/copilot/customization/custom-agents` — reachable and relevant. Supports `/agents`, `/create-agent`, and the custom-chat-mode rename used in §§2-4.
- `https://docs.github.com/en/copilot/get-started/what-is-github-copilot` — reachable and relevant. Supports the Pro+ / Business / Enterprise availability statement in §§7 and 9.

No dead links, unrelated redirects, or signs of fabricated URLs in the checked sample.

## Claim Citation Coverage

The Round 1 must-fix citation gaps are resolved. The Executive Summary, §3 setup/prerequisite guidance, §3 slash-command list, §4 synthesis clusters, §8 synthesized comparison material, and §9 billing bullets now have citation density appropriate to their importance.

No new `🔴 Critical` or `🟡 Important` citation gaps surfaced in this round.

## Quote Verification

6 of 20 body quotes re-checked in this round, focusing on the quotations most closely tied to the previously blocked citation issues.

- The Edit deprecation quote in §3/§4.2 remains supported by `local-agents`.
- The `/plan` quote and the `plan.md` session-memory quote remain supported by `planning`.
- The remote-infrastructure quote in §7 remains supported by `cloud-agents`.
- The billing quotations in §9 remain supported by `copilot-requests`.
- The custom-chat-mode rename quote in §2 remains supported by `custom-agents`.

No material quote issues.

## Source Authority Compliance

The report still relies primarily on official VS Code docs and official GitHub Docs for its core claims. The newly added citations strengthen that compliance rather than diluting it.

No material issues.

## Conflict & Uncertainty Disclosure

The report still handles the central terminology ambiguity well: historical "modes" language versus current VS Code "agents" terminology, plus the distinction between in-IDE Agent and Copilot cloud agent. Uncertainty around Autopilot behavior and Edit retirement timing remains appropriately bounded in §10.

No material issues.

## Source Freshness & Currency

The previously risky time-sensitive areas are now better anchored. The signup / usage-limit note, current command surface, and billing details all have current first-party citations attached directly where readers need them.

No material issues.

## Topic Coverage Assessment

Coverage remains proportionate and complete for a beginner-facing explainer: terminology shift, built-in agents, Autopilot, targets, cloud-vs-local distinction, decision guidance, and billing are all present at the right depth. The Executive Summary still accurately reflects the body.

No material issues.

## Research Limitations Review

The Research Limitations section remains honest and appropriately scoped. It acknowledges terminology drift, incomplete first-party depth on Autopilot, the historical 404, and explicit out-of-scope areas without becoming performative.

No material issues.

## Code & CLI Validation

This remains a non-code-heavy report, so the absence of runnable Python examples is appropriate. The CLI / slash-command content that does appear is now better sourced, and the one YAML example still has visible post-block attribution.

No material issues.

## Reference List Integrity

The reference list remains consistent with the body and the report header:

- The "Sources consulted: 14 web pages" count still matches the 14 documentation/article entries in §11.
- The newly cited pages are present in the reference list.
- References remain organized under the expected categories.

No material issues.

## Report Structure & Readability

- `🟢 Minor` (nice-to-have) **Location:** `## Revision Round 2 — 2026-04-21` section inside the research report. **Issue:** The report now embeds an internal revision changelog in the publication body. **Why it matters:** It mixes reviewer/researcher process notes into reader-facing research content, which is distracting and slightly weakens presentation polish. This is waived because it does not undermine the report's accuracy, sourcing, or trustworthiness.

## Suggested Improvements (Prioritized)

1. Remove the in-report `## Revision Round 2` changelog before publication so the deliverable stays audience-facing rather than process-facing.
2. Optionally attach a few more body citations to currently consulted-only background references in §11 if you want even tighter traceability, though this is no longer required for approval.

## Readiness Verdict (Round 2): APPROVED

All prior `🟡 Important` blockers are resolved. The revised report now meets the trustworthiness bar on citation coverage, source support, freshness handling, and reference integrity. The only remaining issue is a waived `🟢 Minor` structural cleanup item that does not block publication.
