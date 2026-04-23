# Web Research Review — Agent HQ

**Research file reviewed**: `research/2026-04-22-agent-hq.md`

---

## Round 1 — 2026-04-22

### Readiness Verdict: APPROVED WITH EDITS

Report is substantially strong: official sources, current snapshotting, good scope control, and mostly accurate quotations. One 🔴 Critical blockquote issue and 🟡 Important citation coverage gaps must be fixed before publication.

### Reference Validation (5 of 9 URLs + 2 limitation URLs checked)

1. `https://github.blog/news-insights/company-news/welcome-home-agents/` — reachable (200), content matches Agent HQ launch claims.
2. `https://github.blog/news-insights/company-news/pick-your-agent-use-claude-and-codex-on-agent-hq/` — reachable (200), matches public-preview / tier-gating / billing claims.
3. `https://github.blog/ai-and-ml/github-copilot/how-to-orchestrate-agents-using-mission-control/` — reachable (200), matches mission-control claims.
4. `https://docs.github.com/en/copilot/concepts/agents/enterprise-management` — reachable (200), matches AI Controls / enterprise policy claims.
5. `https://github.blog/changelog/2026-02-04-claude-and-codex-are-now-available-in-public-preview-on-github` — reachable (200), matches Feb 4, 2026 launch-status claim.

Limitations-claimed 404s for `/copilot/concepts/agents/about-agent-hq` and `/copilot/how-tos/agents/agent-hq` confirmed accurate today.

No fabricated or unrelated URLs found.

### Findings by Severity

**🔴 Critical (must-fix)**:
1. Section 2.1 blockquote beginning "**The power of Agent HQ comes from mission control...**" could not be verified as verbatim on the cited `welcome-home-agents` page. The article wording found is closer to: *"This starts with a mission control, a single command center to assign, steer, and track the work of multiple agents from anywhere."* The second sentence ("It's not a single destination...") does match. Fix: either use exact source wording, or convert to paraphrase (no quotation marks).

**🟡 Important (must-fix)**:
2. Several substantive claims lack direct inline citations or post-list source lines:
   - Executive Summary: launch date, partner list, availability, preview status, premium-request billing
   - Section 5 bullets 2–4: synthesis-heavy but uncited
   - Section 7 availability table: no per-row citations or source note
   - Section 8 caveats 2–8: tier gating, premium request cost, admin enablement, "not a standalone SKU", announced-not-shipped partners — all uncited

**🟢 Minor (nice-to-have)**:
3. Reference List lines 316–317: `about-cloud-agent` and `about-agent-skills` appear but aren't clearly cited in body. Either cite in-body or label as consulted-only.

### Quote Verification (9 of 18 blocks spot-checked)

Verified verbatim (allowing typographic normalization):
- Overview "At GitHub Universe..."
- Overview "The current AI landscape..."
- Overview/Value "Context switching equals friction..."
- Mission control operational quote from Dec 1, 2025 post
- "Agent-generated changes show up as draft pull requests..."
- GitHub.com getting-started quote
- VS Code 1.109+ getting-started quote
- "Each coding agent session consumes one premium request."
- Enterprise-management docs quote beginning "The AI Controls view..."

Failed: the Section 2.1 blockquote noted above in 🔴 Critical.

### Other Dimensions
- **Source Authority**: No material issues — GitHub Blog, changelog, Docs (appropriate).
- **Conflict & Uncertainty Disclosure**: Good — distinguishes announced vision vs. shipped, preview vs. GA, announced vs. unreleased partners.
- **Source Freshness**: All sources current for April 2026 snapshot.
- **Topic Coverage**: More than sufficient for a 2-slide beginner scope.
- **Research Limitations**: Honest, explains GitHub-only source choice, flags Cursor uncertainty, documents failed docs paths.
- **Code & CLI Validation**: N/A.
- **Reference List Integrity**: Mostly good. One 🟢 ambiguity noted above.
- **Structure & Readability**: Clear, logically ordered, readable.

### Suggested Improvements (Prioritized)
1. Replace or reformat Section 2.1 "The power of Agent HQ comes from mission control..." blockquote — use exact source wording or convert to paraphrase without quotation marks.
2. Add direct citations to currently-sparse high-stakes sections: Executive Summary, Section 5 bullets, Section 7 table, Section 8 caveats.
3. Either cite `about-cloud-agent` and `about-agent-skills` in body or relabel as consulted-not-cited in reference list.

---

## Round 2 — 2026-04-22

### Fix Verification

1. 🔴 Critical — Section 2.1 "mission control" blockquote(s) `✅ fixed`
   - Re-fetched `welcome-home-agents` page and confirmed both blockquotes are verbatim.
   - First quote: "This starts with a mission control, a single command center to assign, steer, and track the work of multiple agents from anywhere."
   - Second quote: "It's not a single destination; it's a consistent interface across GitHub, VS Code, mobile, and the CLI that lets you direct, monitor, and manage every AI-driven task."

2. 🟡 Important — previously missing inline citations `✅ fixed`
   - Executive Summary (lines 12–16), Section 5 bullets 2–4, Section 7 source note, Section 8 caveats 2–8 all now carry inline citations that spot-check correctly.

3. 🟢 Minor — `about-cloud-agent` and `about-agent-skills` not cited in-body `✅ fixed`
   - Section 5 bullet 1 now cites `about-cloud-agent`; Section 7 source note now cites `about-agent-skills`.

### Reference Validation (6 of 9 re-checked)

All 6 reachable (200); supporting content confirmed:
1. `welcome-home-agents` — Section 2.1 blockquotes verbatim; also supports Exec Summary launch framing (Universe 2025, Kyle Daigle, October 28, 2025) and partner list ("Anthropic, OpenAI, Google, Cognition, xAI, and more").
2. `pick-your-agent` — supports Claude+Codex public preview, Pro+/Enterprise gating, one premium request per session, explicit-enable requirement, "can still make mistakes".
3. `how-to-orchestrate-agents-using-mission-control` — supports "a few minutes to an hour on a draft" and merge-conflict warning for parallel agents.
4. `enterprise-management` — supports AI Controls / enterprise-governance claims.
5. `about-cloud-agent` — supports Section 5 bullet 1 citation.
6. `about-agent-skills` — supports Section 7 source note citation.

No fabricated/dead/unrelated URLs.

### Other Dimensions
- **Claim Citation Coverage**: No material gaps remain in re-reviewed sections.
- **Quote Verification**: All 2 disputed blockquotes verified verbatim; additional spot-checked fragments all match.
- **Source Authority**: No material issues.
- **Conflict & Uncertainty**: Good — distinguishes announced vs shipped, preview vs broader availability.
- **Source Freshness**: Current for April 2026 snapshot.
- **Topic Coverage**: No regressions; added citations improve trustworthiness.
- **Research Limitations**: No material issues.
- **Code & CLI**: N/A.
- **Reference List Integrity**: Orphan ambiguity resolved.
- **Structure & Readability**: No regressions; citations improved readability.

### Remaining (non-blocking)
1. 🟢 (optional) Consider row-level citations inside the Section 7 availability table for faster auditing. Current "Sources for this table" paragraph is sufficient; does not block approval.

### Readiness Verdict: APPROVED

All prior must-fix findings resolved. Section 2.1 quotes verified verbatim, sparse sections now have adequate citation coverage, both docs references cited in-body. No new must-fix issues from the rewrite.
