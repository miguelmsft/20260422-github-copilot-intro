---
reviewer: presentation-content-reviewer
subject: GitHub Copilot — Foundations through Advanced Agentic Workflows
companion: presentation-content-creator
date: 2026-04-22
target_file: presentation-content.md
current_verdict: APPROVED
current_round: 5
round_history:
  - { round: 1, verdict: APPROVED WITH EDITS, critical: 1, important: 7, minor: 2 }
  - { round: 2, verdict: APPROVED WITH EDITS, critical: 0, important: 1, minor: 0 }
  - { round: 3, verdict: APPROVED, critical: 0, important: 0, minor: 0 }
---

# Presentation Content Review — all rounds
# Presentation Content Review — Round 1

## Summary table

| Dimension | Score (1-5) | Key Finding |
|-----------|-------------|-------------|
| 1. One-Idea-Per-Slide | 3/5 | Mostly disciplined, but several slides are too dense for beginners. |
| 2. Audience Calibration | 3/5 | Strong beginner intent, but too much unexplained jargon/acronym load in later sections. |
| 3. Progressive Learning Flow | 4/5 | Overall flow is logical and builds well from foundations to advanced use. |
| 4. Research Fidelity | 3/5 | Mostly well-grounded, but one material licensing inconsistency and a few provenance/overstatement issues. |
| 5. Coverage Completeness | 4/5 | Coverage matches the brief well and all 13 research files are represented. |
| 6. Example & Code Validity | 4/5 | Examples look technically sound and aligned with research. |
| 7. Pacing & Density | 2/5 | 104 slides is too many for ~75 minutes of delivery; several sections are overpacked. |
| 8. Visual Variety | 4/5 | Good mix of diagrams, comparisons, code, boxes, and demos. |
| 9. Storytelling Arc | 4/5 | Clear beginning-middle-end with a strong "why this matters" opening and useful close. |
| 10. Content Progression / Non-Redundancy | 4/5 | Story mostly advances slide by slide; some merge candidates, but little true redundancy. |
| **Overall** | **35/50** | |

## Issues summary

| # | Severity | Slide(s) | Issue | Suggested Fix |
|---|----------|----------|-------|---------------|
| 1 | 🔴 | 85 | Cloud-agent plan eligibility conflicts across source research (`Pro` vs `Pro+`) | Reconcile against current docs and use one consistent statement everywhere |
| 2 | 🟡 | 101, 103 | Research-backed synthesis is marked as `general knowledge` | Replace with composite citations to relevant research files |
| 3 | 🟡 | 78 | Hooks/VS Code workaround is stated more strongly than the source supports | Soften to documented/inferred wording |
| 4 | 🟡 | 47, 93 | BYOM/BYOK terminology is inconsistent | Standardize on one term and define it once |
| 5 | 🟡 | 42, 47, 97, 101, 102 | Several slides are too dense for beginners | Split, trim, or move detail into notes |
| 6 | 🟡 | Deck-wide | 104 slides is too many for ~75 min delivery | Cut/merge ~20–25 slides; fold some title slides into content slides |
| 7 | 🟡 | 91, 92, 98, 87 | Acronyms/jargon insufficiently explained for beginner audience | Add short glosses or parenthetical definitions |
| 8 | 🟢 | 20 notes | "One set of customization files" conflicts with later nuance | Reword to "shared concepts, different config locations/support" |
| 9 | 🟢 | 3, 6 notes | Unsupported rhetorical quantifiers | Soften/remove percentages and "roughly doubled" phrasing |

## Detailed findings

### 1. One-Idea-Per-Slide
- Slides 35, 42, 47, 97, 101, 102 are overloaded for a beginner audience.
- Merge candidates: 20+22, 50+51, and brief section-title slides with following content slides if slide count must come down.

### 2. Audience Calibration
- Jargon/acronym load becomes too high in later sections:
  - 37, 47, 93: BYOK/BYOM terminology not consistently introduced.
  - 91: DPA not expanded.
  - 92: FedRAMP not explained.
  - 98: EMU, SAML, OIDC, SCIM, SIEM too dense without glosses.
  - 87: `gh-aw`, "safe outputs," "Agent Workflow Firewall" need simpler framing.

### 3. Progressive Learning Flow
- Strong sequencing overall.
- CLI-vs-VS-Code nuance handled well on 30, 37, 54, 61, 70, 78, 84, 94.
- Slide 20 speaker notes say surfaces share "one set of customization files" — weakens later nuance.

### 4. Research Fidelity
- 🔴 **Slide 85** — plan eligibility for cloud agent inconsistent across research set.
  - Presentation says: "Requires Pro / Pro+ / Business / Enterprise."
  - `copilot-surfaces.md` says: Pro+ / Business / Enterprise only.
  - `copilot-advanced-agents.md` says: Pro / Pro+ / Business / Enterprise.
  - Must be reconciled against current docs and made consistent.
- 🟡 Slides 101, 103: `Sources: general knowledge` → should cite actual source files.
- 🟡 Slide 78: "Run Copilot CLI connected to VS Code — the CLI's hooks run." Hooks research framed this as inference, not fact.
- 🟢 Slide 3 ("missing ~80%") and slide 6 notes ("each jump roughly doubled...") are rhetorical, not sourced.

### 5. Coverage Completeness
- All 13 research files represented. CLI-vs-VS-Code coverage is a strength.

### 6. Example & Code Validity
- No material issues. Minor: slide 86 could recommend version pinning for `@github/copilot` in Actions.

### 7. Pacing & Density
- Biggest structural problem. 104 slides vs ~78 target; ~75 min delivery.
- Dense runs: 41–47 CLI, 50–55 customization, 75–79 hooks, 91–98 security/admin.
- Needs ~20–25 slides of reduction/merge.

### 8. Visual Variety
- Strong variety across slide types. No material issues.

### 9. Storytelling Arc
- Strong arc: why → how → where → operate → governance → tips → resources → Q&A.
- Slide 103 callback to slide 3 is good.

### 10. Content Progression / Non-Redundancy
- No fully redundant slides.
- Merge candidates: 20+22, 50+51.
- Repeated CLI-vs-VS-Code slides add nuance, not redundancy.

## Verdict: APPROVED WITH EDITS

### Required edits before approval
1. Reconcile and correct slide 85 licensing/availability (🔴 Critical).
2. Replace `general knowledge` synthesis provenance on 101, 103 with actual source citations.
3. Reduce slide count / density to fit ~75 min delivery (target ~75–80 slides).
4. Add beginner-friendly explanations for heaviest acronym/jargon slides (91, 92, 98, 87, 37, 47, 93).
5. Standardize BYOK/BYOM terminology across models/CLI/security slides.
6. Soften slide 78 hooks/VS Code claim to match research (inference, not fact).


---

## Review Round 2 — 2026-04-22

### Edit Verification
- ✅ **Round 1 #1 (🔴 slide 85 → now 69): fixed.** Slide 69 says cloud agent is available in **Pro+, Business, or Enterprise**. Spot-check matches `research/2026-04-21-copilot-surfaces.md` §3.9: *"Available in Copilot Pro+, Copilot Business, and Copilot Enterprise only."*
- ✅ **Round 1 #2 (slides 101, 103 → now 82, 84): fixed.** Composite research citations replace `general knowledge`.
- ✅ **Round 1 #3 (slide 78 → now 63): fixed.** Hooks/VS Code claim is now explicitly caveated as reasoned interpretation.
- ✅ **Round 1 #4 (BYOK/BYOM): fixed.** Standardized to BYOK on slides 26, 29, 37, 76.
- ✅ **Round 1 #5 (dense slides): fixed.** Slide 47 cut; others leaner.
- ✅ **Round 1 #6 (pacing 104→85): fixed.** Target met.
- ✅ **Round 1 #7 (glossary gaps): fixed.** DPA, FedRAMP, EMU/SAML/OIDC/SCIM/SIEM, `gh-aw`, safe outputs, BYOK all glossed.
- ✅ **Minor fixes:** Slide 15 notes, slide 3/4 softening, slide 70 pinning.

### Summary table

| Dimension | Score (1-5) | Key Finding |
|-----------|-------------|-------------|
| 1. One-Idea-Per-Slide | 4/5 | v2 is materially tighter. |
| 2. Audience Calibration | 4/5 | Beginner fit improved via glossary additions. |
| 3. Progressive Learning Flow | 4/5 | No stranded references after merges. |
| 4. Research Fidelity | 4/5 | R1 issues fixed; slide 29 has wrong CLI BYOK env-vars. |
| 5. Coverage Completeness | 4/5 | All 13 files represented. |
| 6. Example & Code Validity | 3/5 | Slide 29 env-var mismatch. |
| 7. Pacing & Density | 4/5 | 85 slides matches target. |
| 8. Visual Variety | 4/5 | Good mix preserved. |
| 9. Storytelling Arc | 4/5 | Callbacks intact. |
| 10. Content Progression / Non-Redundancy | 4/5 | Merges improved progression. |
| **Overall** | **39/50** | |

## Issues Summary

| # | Severity | Slide(s) | Issue | Suggested Fix |
|---|----------|----------|-------|---------------|
| 1 | 🟡 | 29 | CLI BYOK env-var names inaccurate: uses `COPILOT_PROVIDER_URL` instead of documented `COPILOT_PROVIDER_BASE_URL`; omits `COPILOT_PROVIDER_TYPE` | Update to `COPILOT_PROVIDER_TYPE`, `COPILOT_PROVIDER_BASE_URL`, `COPILOT_PROVIDER_API_KEY` (+ `COPILOT_MODEL` for model selection). Verified against `model-variety.md` line 218 and `copilot-cli.md` lines 372–373, 494–495. |

## Verdict: APPROVED WITH EDITS

All Round 1 Critical and Important findings resolved. One new 🟡 Important introduced on slide 29 (CLI BYOK env-var names). Must be fixed before finalization.


---

## Review Round 3 — 2026-04-22

### Edit Verification
- ✅ **Round 2 #1 (slide 29): fixed.** Slide 29 now uses documented CLI BYOK env vars:
  - `COPILOT_PROVIDER_TYPE`
  - `COPILOT_PROVIDER_BASE_URL`
  - `COPILOT_PROVIDER_API_KEY`
  - `COPILOT_MODEL`

Verified against `research/2026-04-21-model-variety.md` L218 and `research/2026-04-21-copilot-cli.md` L372–375, 494–497.

## Verification Summary

| Check | Slide(s) | Result | Evidence |
|---|---:|---|---|
| BYOK env-var fix | 29 | ✅ Match | `model-variety.md:218`; `copilot-cli.md:372–375, 494–497` |
| `/model` and `--model` | 29 | ✅ Match | `copilot-cli.md:252, 375, 408` |
| `COPILOT_GITHUB_TOKEN` | 35 | ✅ Match | `copilot-cli.md:221–225, 371` |
| `COPILOT_CUSTOM_INSTRUCTIONS_DIRS` | 43 | ✅ Match | `copilot-customization.md:81, 545, 561` |
| MCP config path + `/mcp add` | 48 | ✅ Match | `copilot-mcp.md:280–291`; `copilot-cli.md:466–468` |
| `COPILOT_OFFLINE=true` | 75–76 | ✅ Match | `copilot-security-privacy.md:157–163, 231` |

## Findings
- Slide 29 correction verified accurate and complete.
- All sampled identifiers matched research.
- No regressions, no new 🔴/🟡 issues.

## Issues Summary
None.

## Verdict: APPROVED

Content phase complete. Ready for Gate 3 and slides phase.


## Review Round 4 — 2026-04-22

### Edit Verification
- ✅ New slides exist: responsible/spec-driven flow (14), `plan.md` (21), approvals trio (23–25), Cloud Agent deep dive (75–76), Agent HQ (79–80), appendix divider + cost slides (94–96).
- ✅ No slide is missing speaker notes or a `Sources:` line.
- ✅ Demo slides themselves no longer contain "Presenter fills this in live."
- ✅ Cloud Agent model list on slide 76 matches the approved deep-dive research.
- ✅ Bypass slide correctly distinguishes `preToolUse` vs `permissionRequest`.
- ✅ VS Code wording is softer than CLI on sandboxing.
- ⚠️ "Appendix-only" cost/premium-request move is not fully complete; cost/billing content remains in the main deck.
- ⚠️ "Surface" → "coding environments" replacement is not fully complete; slide 53 title still uses "surface."
- ⚠️ Cloud Agent plan availability on slide 74 conflicts with the approved `2026-04-22-cloud-agent-deep-dive.md` report.

## Presentation Review Summary

| Dimension | Score | Key Finding |
|-----------|-------|-------------|
| 1. One-Idea-Per-Slide | 3/5 | A few slides overloaded |
| 2. Audience Calibration | 4/5 | Beginner-friendly, minor abstraction |
| 3. Progressive Learning Flow | 4/5 | Minor Cloud Agent overlap |
| 4. Research Fidelity | 3/5 | Slide 74 source conflict |
| 5. Coverage Completeness | 4/5 | All approved research represented |
| 6. Example & Code Validity | 4/5 | No material issues |
| 7. Pacing & Density | 3/5 | 96 slides heavy for 75 min |
| 8. Visual Variety | 4/5 | Good mix |
| 9. Storytelling Arc | 4/5 | Strong arc |
| 10. Non-Redundancy | 3/5 | Cloud Agent + cost overlap |
| **Overall** | **36/50** | |

## Issues Summary

| # | Severity | Slide(s) | Issue | Fix |
|---|----------|----------|-------|-----|
| 1 | 🟡 | 25, 26, 31, 32 | Premium-request / cost in main deck despite appendix-only rule | Strip cost references; push to 94–96 |
| 2 | 🟡 | 53 | Title still uses "surface" | Rename to "Configure MCP — where each coding environment reads from" |
| 3 | 🟡 | 74 | Plan availability conflicts with approved deep-dive research | Reconcile or soften wording |
| 4 | 🟡 | 74–75, 32 vs 95 | Redundancy | Trim 74–75 overlap; remove cost duplication |
| 5 | 🟢 | 17 | "Three axes to pick every time" abstract for beginners | Rename "Pick three things each time: environment, mode, model" |
| 6 | 🟢 | 78 | `gh-aw` jargon-dense | Add plain-English subtitle |
| 7 | 🟢 | 80 | Value + status mixed | Split or mini status table |

## Verdict: APPROVED WITH EDITS
Regressions: main deck still has cost/premium-request material that was supposed to move entirely to appendix; slide 53 still violates terminology constraint; slide 74 has unresolved availability conflict.

## Review Round 5 — 2026-04-22

### Edit Verification
1. ✅ Slides 25, 26, 31, 32, 33 — premium-request / multiplier / quota content removed from main flow.
2. ✅ Slide 32 now shows model-family grid; no longer duplicates slide 95.
3. ✅ Slide 53 title: "Configure MCP — where each coding environment reads from."
4. ✅ Slide 74 is short section opener; trigger list gone.
5. ✅ Slides 74–76 split: 74 opener / 75 triggers / 76 models + guardrails.
6. ✅ Slide 17 retitled "Pick three things each time: environment, mode, model."
7. ✅ Slide 78 opens with plain-English framing before gh-aw details.
8. ✅ Slide 80: rollout/status in speaker notes; body stays on value.

### Judgment Calls
- Slide 83 FedRAMP +10%: **OK** (compliance caveat, not model-picking).
- Slide 86 plan pricing: **OK** (intentional admin-section content).
- Slide 74 availability "see docs for current list" softening: **Adequate.**

### Remaining cost mentions in 1–93 (intentional, not regressions)
- 26 notes pointer to appendix; 31/33 notes say cost out of scope here; 69 hooks example; 83 FedRAMP; 86 admin pricing table.

## Verdict: APPROVED
v5 lands the requested fixes cleanly. Prior regressions resolved; terminology cleanup complete at title level; Cloud Agent sequencing works; remaining cost references are intentional admin-context exceptions.
