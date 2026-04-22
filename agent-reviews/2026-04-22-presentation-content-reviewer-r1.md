---
reviewer: presentation-content-reviewer
round: 1
review_date: 2026-04-22
target_file: presentation-content.md
verdict: APPROVED WITH EDITS
critical_count: 1
important_count: 7
minor_count: 2
---

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
