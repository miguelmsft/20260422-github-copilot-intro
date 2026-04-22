---
reviewer: web-research-reviewer
subject: GitHub Copilot Skills
companion: web-researcher
date: 2026-04-21
verdict: APPROVED
---

## Review Round 1 — 2026-04-21

## Reference Validation

7 of 17 reference-list URLs checked via live fetch. All 7 were reachable and relevant; I found no fabricated or dead URLs.

1. **About agent skills** — reachable (200). Verified the report's core definition quote in §1 and the "Support for organization-level and enterprise-level skills is coming soon." quote in §6.5.
2. **Adding agent skills for GitHub Copilot CLI** — reachable (200). Verified the `SKILL.md` naming requirement, explicit `/SKILL-NAME` invocation guidance, and the shell/bash pre-approval warning cited in §§2, 4, and 5.
3. **Comparing GitHub Copilot CLI customization features** — reachable (200). Verified the "Skills help you..." support, the plugin definition quoted in §6.2, and the decision-guide language supporting the custom-instructions vs skills distinction in §§1 and 2.
4. **Using custom skills with the Copilot SDK** — reachable (200). Verified `skillDirectories` and `disabledSkills` support. The page is clearly relevant to §4.3.
5. **Copilot customization cheat sheet** — reachable (200). Verified that "Agent skills" appears in the support matrix and that JetBrains is marked preview.
6. **GitHub Copilot CLI command reference** — reachable (200). Verified `github.copilot.skill.invoked`, the built-in `skill` tool, and the "(bundled with CLI)" skill-location text used in §§2 and 6.
7. **GitHub Copilot Chat cheat sheet** — reachable (200). Verified the `@github` / "GitHub-specific Copilot skills" terminology and "MCP skills" references discussed in §2.1.

No dead links or unrelated redirects found in the sampled set.

## Claim Citation Coverage

- 🟡 Important (must-fix) **Location:** §§5.1-5.3 and §§6.1-6.6, especially lines 456-470, 486-496, 505, 524-528, 549, 561, and 574-583. **Issue:** many substantive claims and recommendations are presented without inline citations, despite the report requirement that every substantive claim be sourced. Examples include `COPILOT_SKILLS_DIRS` being comma-separated, version pinning guidance with `--pin`, "skills are executable in effect," plugin-managed skills appearing in `/skills list`, temporary pre-approval behavior, supported agent hosts for `gh skill`, the `skill` tool being denyable via permission patterns, and the ecosystem repository star counts. **Why it matters:** these are exactly the kinds of operational and security-relevant claims readers will rely on; without inline citations, the reader cannot distinguish researched facts from analyst inference.

- 🟡 Important (must-fix) **Location:** §7.2 lines 578-583 and §8 line 607. **Issue:** the repository star counts are time-sensitive factual claims in the body, but the body cites only repository homepages, not the GitHub API source or an "as of" timestamp. **Why it matters:** fast-changing metrics need explicit sourcing/currency so readers do not treat stale counts as stable facts.

## Quote Verification

9 of 11 verbatim quote blocks were spot-verified against their cited sources. Most checked quotes were present and attributable.

- 🟡 Important (must-fix) **Location:** §1 "Why It Matters" lines 51-52 and §2.8 lines 231-232. **Issue:** both blockquotes are presented as verbatim quotations, but they collapse multi-part source text with ellipses (`...`) rather than reproducing the original wording/structure exactly. The source pages support the underlying ideas, but these are not clean verbatim quotes as written. **Why it matters:** quote integrity is a trust issue; if wording is condensed, it should be rewritten as paraphrase with a citation, or requoted exactly.

No evidence of fabricated quotes, and the report correctly keeps quotes inline rather than collecting them in a separate end section.

## Source Authority Compliance

No material issues. The report leans heavily on GitHub Docs, the GitHub Blog changelog, and the upstream `agentskills` repository, which is appropriate for this topic. Lower-authority community sources are not being used to support core claims.

## Conflict & Uncertainty Disclosure

No material issues. The report clearly discloses terminology collisions around "skills," marks preview/status uncertainty, and has an appropriately candid limitations section.

## Source Freshness & Currency

No material issues overall. The report uses current April 2026 documentation and an April 16 2026 changelog entry for the new `gh skill` command. The main freshness concern is the unsourced body star counts already noted above.

## Topic Coverage Assessment

- 🟡 Important (must-fix) **Location:** Executive Summary lines 14-16; §2.7 lines 214-215; §3; §4; §8 lines 600-606. **Issue:** the report does mention that skills work in VS Code agent mode and not plain chat, but the rest of the report is overwhelmingly CLI-centric. Given the explicit review directive to cover CLI-vs-VS Code nuances, the treatment of VS Code remains too thin: there is no concrete explanation of how discovery, invocation, or management differs in VS Code versus the CLI, and the limitations section explicitly acknowledges that gap. **Why it matters:** a reader could overgeneralize CLI slash-command behavior (`/skills list`, `/skills reload`, `/skills info`) to VS Code even though the report itself says VS Code specifics were only lightly covered.

## Research Limitations Review

No material issues. This section is honest, specific, and usefully scoped; it acknowledges the lack of direct CLI reproduction, limited VS Code verification, and the reliance on GitHub-owned sources.

## Code & CLI Validation

- 🟡 Important (must-fix) **Location:** code/example blocks at lines 87-90, 172-199, 283-310, 324-328, 488-494, and 511-520. **Issue:** multiple fenced examples are missing the required post-block attribution line in the format `> — Source: [Page title](URL) | Provenance: ...` immediately after the closing fence. The clearest misses are the "Hello, skill" example, the `gh skill` command block, and the `allowed-tools: shell` frontmatter example. **Why it matters:** the review spec explicitly requires visible provenance for every code/example block so readers can judge whether it is verbatim, adapted, or synthesized without reading inside comments.

- 🟢 Minor (nice-to-have) **Location:** §3 lines 257-310. **Issue:** the getting-started shell examples assume a POSIX shell (`mkdir -p`, heredoc `cat <<'EOF'`) without saying so. **Why it matters:** beginners on Windows may try to copy-paste these commands into PowerShell and fail.

The Python example in §4.3 is syntactically plausible on static inspection and includes imports, setup, and cleanup.

## Reference List Integrity

- 🟡 Important (must-fix) **Location:** report header line 6 and §9. **Issue:** the header says "Sources consulted: 12 web pages (GitHub Docs + GitHub Blog), 4 GitHub repositories," but the reference list contains 17 URLs (12 documentation/articles, 4 repositories, 1 code-sample URL). **Why it matters:** mismatched counts weaken auditability and make the sourcing footprint unclear.

- 🟡 Important (must-fix) **Location:** body vs §9. **Issue:** `https://cli.github.com` is linked in §3 but does not appear in the Complete Reference List; meanwhile `About GitHub Copilot CLI`, `Overview of customizing GitHub Copilot CLI`, and `github/copilot-sdk/blob/main/docs/features/skills.md` appear in the reference list without body citations. **Why it matters:** the report should cleanly reconcile cited-vs-listed sources so reviewers can trace every reference.

- 🟡 Important (must-fix) **Location:** §8 line 606 and §9. **Issue:** the limitations section says `api.github.com` was consulted, but no GitHub API source is listed in the reference list even though API-derived star counts appear in the body. **Why it matters:** consulted sources that materially support body claims should be visible in the reference inventory.

## Report Structure & Readability

No material issues. The report follows the expected structure, keeps quotes inline, and is generally clear and easy to navigate.

## Suggested Improvements (Prioritized)

1. Add inline citations for the unsourced operational/security claims in §§5-7, especially the `COPILOT_SKILLS_DIRS`, `--pin`, plugin-management, permission-model, host-support, and star-count statements.
2. Fix quote integrity by converting the ellipsis-compressed blockquotes in §1 and §2.8 into either exact quotations or clear paraphrases with citations.
3. Add the required `> — Source: ... | Provenance: ...` line immediately after every fenced example block, including synthesized examples.
4. Strengthen the CLI-vs-VS Code section with concrete, sourced differences so readers do not mistake CLI-only slash-command workflows for VS Code behavior.
5. Reconcile the reference inventory: fix the header count, add missing cited sources (`cli.github.com`, any GitHub API URLs materially used), and remove or cite current orphaned references.

## Readiness Verdict: APPROVED WITH EDITS

The report is substantially sound and uses strong primary sources, but it is **not yet APPROVED** because several 🟡 Important (must-fix) issues remain: unsourced substantive claims, two quote-integrity problems, missing required post-block source attribution on multiple examples, insufficient CLI-vs-VS Code nuance for the stated scope, and reference-list/count inconsistencies. Once those are corrected, this should be close to publishable.

## Review Round 2 — 2026-04-21

### Fix Verification

1. 🟡 Important (must-fix) **Unsourced operational/security claims in §§5-7:** ✅ fixed. The previously unsourced claims now carry inline support, including `COPILOT_SKILLS_DIRS` in §5, `--pin` and supply-chain framing in §5, plugin-managed skill behavior in §6.2, scoped pre-approval semantics in §6.1, supported `gh skill` agent hosts in §6.3, and the `skill` tool / permission-model discussion in §6.6.
2. 🟡 Important (must-fix) **Time-sensitive star counts without API source or timestamp:** ✅ fixed. §7.2 now gives an API URL for each count and labels the counts "as of 2026-04-21"; §9 now includes a dedicated GitHub REST API subsection.
3. 🟡 Important (must-fix) **Ellipsis-compressed verbatim quotes in §1 and §2.8:** ✅ fixed. The problematic blocks were converted to paraphrase, so they are no longer presented as verbatim quotations.
4. 🟡 Important (must-fix) **Missing required post-block `> — Source: ... | Provenance: ...` lines:** ⚠️ partially fixed. Many blocks were corrected, but the minimum-tree block in §2.2 still does not have its attribution immediately after the closing fence, the flow diagram in §2.6 still has no post-block attribution line, and the terminal-commands block in §3 uses `> — Sources:` rather than the required `> — Source:` format.
5. 🟡 Important (must-fix) **Insufficient CLI-vs-VS Code nuance:** ✅ fixed. The new §2.7 comparison table materially closes this gap and clearly distinguishes portable `SKILL.md` behavior from CLI-only management affordances.
6. 🟡 Important (must-fix) **Reference inventory inconsistencies:** ⚠️ partially fixed. `cli.github.com` and the API endpoints are now accounted for, but the header count still does not match the reference inventory, and three references remain orphaned from the report body: `About GitHub Copilot CLI`, `Overview of customizing GitHub Copilot CLI`, and `github/copilot-sdk/blob/main/docs/features/skills.md`.

## Reference Validation

6 of 22 reference-list URLs checked via live fetch. All 6 were reachable and relevant; I found no fabricated links or unrelated redirects in the sampled set.

1. **About agent skills** — reachable (200). Verified the core definition quote in §1 and the org/enterprise "coming soon" quote in §6.5.
2. **Adding agent skills for GitHub Copilot CLI** — reachable (200). Verified the page remains the right authority for `SKILL.md` authoring and the shell/bash pre-approval warning cited in §§4.1 and 6.1.
3. **Comparing GitHub Copilot CLI customization features** — reachable (200). Verified the plugin definition cited in §6.2 and the decision-guide content behind the paraphrases in §§1 and 2.8.
4. **GitHub Copilot CLI command reference** — reachable (200). Verified `github.copilot.skill.invoked`, `Plugin directories`, and the built-in `skill` tool used in §§2.4, 6.2, 6.4, and 6.6.
5. **Manage agent skills with GitHub CLI** — reachable (200). Verified the `tree SHA`, `--pin`, and supported-host claims in §§5 and 6.3.
6. **GitHub REST API: `api.github.com/repos/anthropics/skills`** — reachable (200). Verified the `stargazers_count` field backing the §7.2 star-count methodology.

## Claim Citation Coverage

No material issues. The highest-stakes operational claims that were previously unsourced now have inline citations.

## Quote Verification

4 of 9 verbatim quote blocks re-checked. The sampled quotes in §§1, 2.1, 6.2, and 6.5 still align with their cited pages, and the prior ellipsis-compressed pseudo-verbatim blocks were removed in favor of paraphrase.

## Source Authority Compliance

No material issues. The report still relies primarily on GitHub Docs, GitHub Blog, the GitHub REST API, and upstream repositories for its core claims.

## Conflict & Uncertainty Disclosure

No material issues. The CLI-vs-VS Code uncertainty is now surfaced more clearly and in the right section.

## Source Freshness & Currency

No material issues. The report uses current April 2026 documentation and explicitly time-bounds the API-derived repository metrics.

## Topic Coverage Assessment

No material issues. The new CLI-vs-VS Code subsection brings the depth closer to the report's stated scope, and the executive summary now better matches the body.

## Research Limitations Review

No material issues. The limitations section remains candid and proportionate, and the note on API-derived star counts is appropriately scoped.

## Code & CLI Validation

- 🟡 Important (must-fix) **Location:** §2.2 lines 84-98, §2.6 lines 171-198, and §3 lines 275-297. **Issue:** the report still does not fully comply with the required post-block attribution pattern for every fenced example. The minimum-tree block's attribution is delayed until after intervening prose, the §2.6 flow diagram has no `> — Source: ... | Provenance: ...` line at all, and the §3 terminal block uses `> — Sources:` instead of the required singular `> — Source:` form. **Why it matters:** this requirement is part of the audit contract for example provenance; inconsistent formatting makes it harder for readers to judge whether a block is verbatim, adapted, or synthesized at a glance.

The static syntax/completeness review is otherwise fine; the code-oriented examples remain coherent and topic-appropriate.

## Reference List Integrity

- 🟡 Important (must-fix) **Location:** report header line 6 and §9 lines 635-667. **Issue:** the header says `13 web pages ... 4 GitHub repositories, 1 in-repo code sample`, but the reference list currently contains 22 URL entries: 13 documentation/article URLs, 4 GitHub REST API URLs, 4 repository URLs, and 1 code-sample URL. **Why it matters:** the top-level source-count summary is still not auditable against the actual inventory.

- 🟡 Important (must-fix) **Location:** §9 lines 646-647 and 667. **Issue:** three references remain orphaned from the report body: `About GitHub Copilot CLI`, `Overview of customizing GitHub Copilot CLI`, and `github/copilot-sdk/blob/main/docs/features/skills.md` are listed, but not actually cited in the report body. **Why it matters:** the review spec asks for clean cited-vs-listed traceability; discovery-only or background-reading links should either be cited where used or removed from the final reference inventory.

All body-cited URLs I checked do now appear in the reference list.

## Report Structure & Readability

No material issues. The report remains well organized, and the new §2.7 comparison table improves reader guidance materially.

## Suggested Improvements (Prioritized)

1. Fix the remaining fenced-block provenance issues: put a compliant `> — Source: ... | Provenance: ...` line immediately after the minimum-tree block in §2.2, add one after the §2.6 flow diagram, and normalize the §3 terminal block from `Sources` to `Source`.
2. Reconcile the source inventory completely: either change the header count to match the 22 URL entries in §9, or restructure the categories/counting scheme so it is mathematically consistent.
3. Remove or body-cite the three remaining orphaned references in §9 so the final reference list reflects actual report citations rather than background discovery notes.

## Readiness Verdict (Round 2): APPROVED WITH EDITS

The report is close, and most Round 1 must-fix items are now resolved. It is **not yet APPROVED** because two 🟡 Important (must-fix) areas remain open: the required post-block source/provenance formatting is still inconsistent across several fenced examples, and the reference inventory is still not fully reconciled (header count mismatch plus three orphaned references). No new trust-undermining accuracy problems surfaced in this round.

## Review Round 3 — 2026-04-21

### Fix Verification

1. 🟡 Important (must-fix) **Missing required post-block `> — Source: ... | Provenance: ...` lines:** ✅ fixed. The minimum-tree block in §2.2 now has an immediate attribution line at lines 84-88, the §2.6 flow diagram now has a compliant post-block attribution line at lines 170-198, and the §3 terminal block now uses the required singular `> — Source:` form at lines 275-297.
2. 🟡 Important (must-fix) **Three orphaned references in §9:** ✅ fixed. `About GitHub Copilot CLI`, `Overview of customizing GitHub Copilot CLI`, and `github/copilot-sdk/blob/main/docs/features/skills.md` no longer appear in the report's final reference inventory; the remaining Code Samples entry now points to `anthropics/skills`, which is cited in the body (§§3 and 7).
3. 🟡 Important (must-fix) **Header/reference-list count reconciliation:** ❌ not fixed. The header at line 6 says `22 URL entries ... 13 documentation/article URLs + 4 GitHub REST API endpoint URLs + 4 GitHub repository URLs + 1 in-repo code-sample URL`, but §9 currently lists 20 URL entries total: 11 documentation/article entries (lines 637-647), 4 REST API entries (651-654), 4 repository entries (658-661), and 1 code-sample entry (665). The source inventory is still not mathematically auditable.

## Reference Validation

0 of 20 URLs re-fetched in this scoped re-review. No material URL changes were part of the Round 3 fix set, so the prior live-validation results from Rounds 1-2 stand unchanged.

## Claim Citation Coverage

No material issues. This re-review was scoped to previously identified formatting and inventory fixes, and no new unsourced high-stakes claims were introduced in the edited sections.

## Quote Verification

No material issues. Round 3 did not alter the report's quote set.

## Source Authority Compliance

No material issues. The report still relies primarily on GitHub Docs, GitHub Blog, the GitHub REST API, and upstream repositories for core claims.

## Conflict & Uncertainty Disclosure

No material issues.

## Source Freshness & Currency

No material issues. The only remaining blocker is inventory accounting, not source recency.

## Topic Coverage Assessment

No material issues.

## Research Limitations Review

No material issues.

## Code & CLI Validation

No material issues. The three Round 2 formatting defects in §2.2, §2.6, and §3 are now corrected.

## Reference List Integrity

- 🟡 Important (must-fix) **Location:** report header line 6 and §9 lines 635-665. **Issue:** the source-inventory count is still inconsistent. The header claims 22 total URL entries and 13 documentation/article URLs, but the actual reference list contains 20 total URL entries and 11 documentation/article entries. **Why it matters:** the report's top-level sourcing summary is still not auditable against the inventory readers can inspect.

The three previously orphaned references are resolved.

## Report Structure & Readability

No material issues.

## Suggested Improvements (Prioritized)

1. Fix the header's `Sources consulted` math so it matches the actual §9 inventory exactly, or add the missing two documentation/article URLs if the 22-entry / 13-doc count is intended.

## Readiness Verdict (Round 3): APPROVED WITH EDITS

The report is **not yet APPROVED** because one 🟡 Important (must-fix) issue remains open: the source-inventory summary in the header still does not reconcile with the actual entries listed in §9. The Round 2 provenance-formatting defects are fixed, and the three prior orphaned references are resolved; once the header/reference-list math is corrected, this should be ready to approve.

## Review Round 4 — 2026-04-21

### Fix Verification

1. 🟡 Important (must-fix) **Header/reference-list count reconciliation:** ✅ fixed. The header at line 6 now reads `20 URL entries in §9 — 11 documentation/article URLs (GitHub Docs, GitHub Blog, GitHub CLI site) + 4 GitHub REST API endpoint URLs + 4 GitHub repository URLs + 1 in-repo code-sample URL`, and §9 lines 637-665 list exactly 20 URL entries: 11 under `Documentation & Articles`, 4 under `GitHub REST API`, 4 under `GitHub Repositories`, and 1 under `Code Samples`. The previously open inventory mismatch is resolved.

## Reference Validation

0 of 20 URLs re-fetched in this scoped re-review. No material URL changes were part of the Round 4 fix set, so prior spot-check results from earlier rounds stand unchanged.

## Claim Citation Coverage

No material issues. This round only changed the top-level source inventory summary.

## Quote Verification

No material issues. Round 4 did not alter any quotes.

## Source Authority Compliance

No material issues. The report continues to rely on high-authority GitHub documentation, changelog material, REST API responses, and upstream repositories for core claims.

## Conflict & Uncertainty Disclosure

No material issues.

## Source Freshness & Currency

No material issues.

## Topic Coverage Assessment

No material issues.

## Research Limitations Review

No material issues.

## Code & CLI Validation

No material issues. Round 4 did not change code or CLI examples.

## Reference List Integrity

No material issues. The header now reconciles exactly to §9's inventory: 20 total URL entries = 11 documentation/article URLs + 4 GitHub REST API URLs + 4 GitHub repository URLs + 1 code-sample URL.

## Report Structure & Readability

No material issues.

## Suggested Improvements (Prioritized)

1. No must-fix improvements remain. Any further edits would be optional polish only.

## Readiness Verdict (Round 4): APPROVED

All prior 🔴 Critical and 🟡 Important findings are resolved. The remaining Round 3 blocker—the header/§9 source-inventory mismatch—is now ✅ fixed, and no new must-fix issues were introduced. The report is ready for use.
