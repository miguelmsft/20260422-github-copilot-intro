---
reviewer: web-research-reviewer
report: research/2026-04-23-agentic-foundations-refresh.md
date: 2026-04-23
current_verdict: APPROVED
current_round: 2
---

## Review Round 1 — 2026-04-23

### Reference Validation (7 of 11 URLs spot-checked)
- Willison Sep 18 2025 · Anthropic multi-agent · Claude Code best-practices · MCP intro · SWE-bench · HF Open Deep Research · Willison Claude Cowork — all reachable, quotes present.

### Quote Verification (5 of 26 spot-checked)
All verified against source; no fabrications.

### Source Freshness & Currency
- 14 total refs. 11 explicitly dated. **8/11 (73%) are 2025 or 2026**; 11/14 (79%) current including living docs.
- 🟡 **Dec 31 2024 smolagents post still carries primary support** for §1 definition framing, §2.1/2.2 agency ladder and canonical loop, §3 beginner setup, §4.3 "when not to use agents" rule. Should be demoted to historical/pedagogical context only.
- 🟡 ChatGPT Agent / Computer Use / Agents SDK mentions in §7 are uncited; needs 2025–2026 direct citations or narrower claims.

### Claim Citation Coverage
- 🟡 §2.3:110 and §7:358 — MCP "now supported by Claude, ChatGPT, VS Code, Cursor, and others" / "clear winner for tool interoperability in 2025" cited only to generic MCP intro page; needs vendor/product evidence.
- 🟡 §6.2:326 and §7:355–360 — unsourced "up to 60 points" scaffolding lift, framework launch timing, product-landscape assertions.

### Source Authority, Conflict Disclosure, Research Limitations
No material issues. Mix of primary vendor docs + reputable practitioner synthesis is appropriate. Limitations section is honest and specific.

### Code & CLI Validation
- Both Python blocks parse with `ast`. ✅
- 🟡 §3:177–189 bash block missing the required post-block `> — Source: … | Provenance: …` attribution line.

### Reference List Integrity
- 🟡 Header says "Sources consulted: 12 web pages" but reference list has 14 entries. Fix count.
- 🟢 3 orphaned references (Willison Jun 14 2025 summary, Sierra τ-Bench blog, τ-bench 2024 arXiv) — cite in-body or label as consulted-only.

### Topic Coverage
Strong on definition / loop / tools / memory / planning / context / safety / evals / ecosystem. 🟢 Could add one concrete end-to-end beginner walkthrough.

## Must-fix before approval
1. Demote smolagents Dec 2024 from primary-support role in core sections.
2. Add direct 2025–2026 citations for MCP mainstreaming and ChatGPT Agent / Computer Use / Agents SDK.
3. Fill missing inline citations in §6.2 and §7.
4. Add post-block attribution line after the bash snippet.
5. Fix source-count header/list mismatch (12 vs 14).

## Verdict: APPROVED WITH EDITS
Report is substantially sound and much fresher than the 2026-04-21 version (73% of dated refs from 2025/2026). Needs edits above before APPROVED.

## Review Round 2 — 2026-04-23

### Fix Verification
1. ✅ Smolagents Dec 2024 demoted across Exec Summary, §1, §2.1, §2.2, §3, §4.3 — labeled "historical/pedagogical"; 2025–2026 sources now carry core claims.
2. ✅ MCP mainstreaming: cites Anthropic Nov 25 2024 announcement + Willison Dec 9 2025 (Agentic AI Foundation / Linux Foundation).
3. ✅ §6.2 "up to 60 points" cites HF Feb 4 2025.
4. ✅ §3 bash block has post-block `> — Source: … | Provenance: …` line.
5. ✅ Header says 14 sources, matches list.
6. ✅ Orphaned refs moved to "Consulted but not cited in body" subsection.
7. ✅ §7 ChatGPT Agent / Agents SDK / Cowork / Deep Research all attributed to Willison Mar 11 2025, Sep 18 2025, Jan 12 2026 + HF Feb 4 2025.

### Reference Validation (6 URLs spot-checked)
Anthropic MCP announcement · Willison MCP tag · Willison Sep 18 2025 · Willison Mar 11 2025 · Willison Jan 12 2026 · HF Open Deep Research — all reachable, quotes verified.

### Quote Verification (2 of 2 new)
Anthropic MCP verbatim ✅ · Willison MCP tag support verified ✅.

### Source Freshness
Main Round 1 concern is resolved. Dec 2024 smolagents no longer carries primary weight; 2025–2026 sources anchor central framing, recommendations, ecosystem claims.

### Remaining suggestions (🟢 Minor, optional)
- §7 MCP ecosystem sentence could add direct per-product vendor links.
- Future revision could add one end-to-end beginner scenario.

## Verdict: APPROVED
All Round 1 must-fix items genuinely resolved.
