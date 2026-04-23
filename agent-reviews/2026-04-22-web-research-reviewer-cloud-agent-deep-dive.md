---
reviewer: web-research-reviewer
subject: GitHub Copilot Cloud Agent deep dive
companion: web-researcher
date: 2026-04-22
verdict: APPROVED
---

# Web Research Review — Cloud Agent Deep Dive

**Research file reviewed**: `research/2026-04-22-cloud-agent-deep-dive.md`

---

## Round 1 — 2026-04-22

### Readiness verdict: APPROVED

Report is substantially strong: source quality is high, key product mechanics mostly verified, quotes sample cleanly, structure is publication-ready. A few 🟡 Important trust issues remain to fix.

### Reference Validation (8 of 14 unique URLs checked)

All 8 reachable (200), content matches cited claims:
1. `docs.github.com/.../coding-agent/coding-agent` — current branding "GitHub Copilot cloud agent" confirmed; page includes "Overview of Copilot cloud agent (formerly Copilot coding agent)".
2. `docs.github.com/.../cloud-agent/create-a-pr` — entry points list confirmed (Issues, agents panel, dashboard, Copilot Chat, CLI, Mobile, MCP, Raycast, new repo form).
3. `docs.github.com/.../cloud-agent/changing-the-ai-model` — model lineup confirmed: **Auto, Claude Sonnet 4.5, Claude Opus 4.7, GPT-5.2-Codex**.
4. `docs.github.com/.../cloud-agent/troubleshoot-cloud-agent` — 1-hour timeout confirmed.
5. `docs.github.com/.../billing/copilot-requests` — one premium request per session confirmed.
6. `docs.github.com/.../use-copilot-cli-agents/delegate-tasks-to-cca` — `/delegate` sends work to Copilot cloud agent.
7. `docs.github.com/.../customize-cloud-agent/customize-the-agent-firewall` — firewall-limited internet + default allowlist confirmed.
8. `docs.github.com/.../cloud-agent/configuring-agent-settings` — Actions workflows don't auto-run on Copilot pushes.

No dead links or fabricated references.

### Findings by Severity

**🟡 Important (must-fix)**:
1. **Executive Summary** — contains many high-stakes claims without inline citations: rename claim, trigger methods, remote-vs-local distinction, model lineup, billing model, firewall behavior, `/delegate` equivalence. Add inline citations.
2. **Overview → Key Features** — bullet list largely unsourced (draft PR behavior, live logs, security controls, firewall posture, model selection, integrations, steering). Add source provenance.
3. **Section 3.5 (VS Code / JetBrains / Eclipse / Visual Studio 2026)** — sentence says Eclipse also requires `@github`, but cited troubleshooting quote only supports VS Code, Visual Studio, and JetBrains. Either cite Eclipse specifically or narrow the sentence.
4. **Rename timing claim ("late 2025")** — appears in title/summary/reference-list note, but the checked source only establishes current branding + "formerly Copilot coding agent", not the timing. Source it precisely or remove.
5. **Header "Sources consulted"** — says 11 Docs + 2 Blog/Changelog = 13, but body cites 12 Docs + 2 Blog/Changelog = 14. Reconcile.

**🟢 Minor (nice-to-have)**:
6. **Section 10 / Exec Summary guidance** on "low-to-medium complexity tasks" — relies partly on May 2025 preview changelog. Label as historical or pair with current doc.
7. **Section 6 YAML example** — ends with `# ...`, is an excerpt rather than complete. Label explicitly as excerpt or replace with minimal valid full example.

### Quote Verification (10 of 59 blocks spot-checked)

All 10 verified verbatim or with expected HTML-entity normalization:
- "Copilot can research a repository..."
- "With Copilot cloud agent, GitHub Copilot can work independently..."
- "Copilot cloud agent is distinct from the 'agent mode' feature..."
- "Deep research, planning, and iterating..."
- Entry-point list on create-a-pr page
- "If the session remains stuck, it will time out after an hour."
- `/delegate` description
- Firewall default behavior quote
- Actions auto-run warning quote
- Blog quotes about review tagging and VM boot/clone flow

No fabricated or misattributed quotes. Quotes correctly embedded inline.

### Other Dimensions
- **Source Authority**: No material issues — GitHub Docs + GitHub Blog/Changelog (appropriate).
- **Conflict & Uncertainty Disclosure**: Good — discloses preview-era vs current billing, lack of published concurrent-session caps, model-list volatility, scope boundaries.
- **Source Freshness**: Minor issue noted above.
- **Topic Coverage**: Good — covers all expected subtopics for a 2-slide deep dive.
- **Research Limitations**: Honest, bounds volatile areas.
- **Code & CLI Validation**: Minor YAML excerpt note above.
- **Reference List Integrity**: Count metadata off (noted above); otherwise body/list consistent.
- **Structure & Readability**: Well-organized, TOC aligned with body.

### Suggested Improvements (Prioritized)
1. Add inline citations to Executive Summary and Key Features bullets.
2. Fix rename claim — source exact timing or remove "late 2025" wording.
3. Fix Section 3.5 — either source Eclipse `@github` requirement or narrow to IDEs explicitly in source.
4. Correct Sources consulted count (13 → 14).
5. (Optional) Refresh / soften "low-to-medium complexity" guidance.
6. (Optional) Make YAML example explicitly an excerpt or replace with complete sample.

---

## Round 2 — 2026-04-22

### Fix Verification

1. **Exec Summary inline citations** — `✅ fixed`. Rebrand, trigger methods, cloud-vs-local, model lineup, billing, firewall, /delegate equivalence all cited.
2. **Overview Key Features bullets** — `✅ fixed`. Each bullet now has source links.
3. **Section 3.5 @github requirement** — `✅ fixed`. Now correctly limited to VS Code, Visual Studio, and JetBrains; Eclipse separately noted as entry point in create-a-pr doc.
4. **Rename timing "late 2025"** — `✅ fixed`. No remaining "late 2025" wording; now "formerly Copilot coding agent".
5. **Sources consulted count** — `❌ not fixed`. Header says "12 Docs + 2 Blog/Changelog (14 total)" but reference list §13 has **15 entries** (13 Docs + 2 Blog/Changelog).
6. **Low-to-medium complexity framing** — `✅ fixed`. Labeled as preview-era + paired with current concept-doc task categories.
7. **Section 6 YAML excerpt labeling** — `✅ fixed`. Marked as verbatim excerpt with lead-in + post-block provenance.

### Reference Validation (9 of 15 re-checked, all verified)

All 9 URLs reachable and content supports cited claims. Models (Auto, Claude Sonnet 4.5, Claude Opus 4.7, GPT-5.2-Codex), billing (one premium per session + per steering comment), firewall/default-allowlist, /delegate draft-PR behavior, troubleshooting @github requirement scope, ephemeral Actions env, live logs — all verified.

No fabricated/dead/unrelated URLs.

### Findings by Severity

**🟡 Important (must-fix)**:
1. Header "Sources consulted" count is still inaccurate. Header says 14 total (12 Docs + 2 Blog); §13 reference list has 15 total (13 Docs + 2 Blog). Reconcile.

### Other Dimensions
- **Claim Citation Coverage**: No new gaps; highest-stakes claims now sourced.
- **Quote Verification**: Re-verified quotes in §3.5 and Exec Summary billing section.
- **Source Authority**: No material issues.
- **Conflict & Uncertainty**: No material issues.
- **Source Freshness**: No material issues.
- **Topic Coverage**: Exec Summary now reflects sourced body content.
- **Research Limitations**: Honest and scoped.
- **Code & CLI Validation**: YAML excerpt labeled correctly; /delegate snippet has post-block attribution.
- **Reference List Integrity**: See 🟡 above re count.
- **Structure & Readability**: Clean, no awkward residue from rename timing removal.

### Suggested Improvements
1. Fix header count to: **13 GitHub Docs pages, 2 GitHub Blog/Changelog posts (15 total)**.
2. Check any derived materials for stale "14 total" count.

### Readiness verdict: APPROVED

Round 1 substantive issues resolved. Only remaining blocker is a 🟡 metadata/reference-integrity issue: the "Sources consulted" count. Once reconciled this report should be APPROVED.

---

## Round 3 — 2026-04-22

### Fix Verification

1. **Header "Sources consulted" count** — `✅ fixed`. Verified directly in the report file: header now reads "**13 GitHub Docs pages, 2 GitHub Blog/Changelog posts (15 total)**" matching the §13 reference list. No stale "14 total" occurrences elsewhere in the file.

### Readiness Verdict: APPROVED

Metadata issue resolved. All Round 1 and Round 2 must-fix findings are now closed. Report is ready for use.

