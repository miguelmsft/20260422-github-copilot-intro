---
reviewer: web-research-reviewer
subject: GitHub Copilot customization
companion: web-researcher
date: 2026-04-21
verdict: APPROVED
---

## Review Round 1 — 2026-04-21

## Reference Validation

[12 of 14 cited URLs checked, plus the uncited cheat-sheet URL mentioned in Research Limitations.]

- Checked `https://docs.github.com/en/copilot/reference/custom-instructions-support` — reachable and relevant. It contains the live surface-support matrix used for the report's executive-summary and §6.1 claims.
- Checked `https://docs.github.com/en/copilot/customizing-copilot/about-customizing-github-copilot-chat-responses` — reachable and relevant. It contains the report's core overview, precedence, prompt-file, 4,000-character, and anti-pattern quotes.
- Checked `https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot` — reachable and relevant. It supports the repo-file setup flow, PR base-branch behavior, `excludeAgent`, and `AGENTS.md` guidance.
- Checked `https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-custom-instructions` — reachable and relevant. It supports CLI local instructions, `COPILOT_CUSTOM_INSTRUCTIONS_DIRS`, and the "`AGENTS.md` plus `.github/copilot-instructions.md`" claim.
- Checked `https://code.visualstudio.com/docs/copilot/customization/overview` — reachable and relevant. It supports `/init` and parent-repository discovery.
- Checked `https://code.visualstudio.com/docs/copilot/customization/custom-instructions` — reachable and relevant. It supports `/create-instruction`, `chat.useAgentsMdFile`, `chat.useClaudeMdFile`, and `chat.instructionsFilesLocations`.
- Checked `https://code.visualstudio.com/docs/copilot/customization/prompt-files` — reachable and relevant. It supports prompt-file manual invocation, input variables, `chat.promptFilesLocations`, `chat.promptFilesRecommendations`, and the prompt-file examples.
- Checked the GitHub Docs pages for personal and organization instructions — both reachable and relevant.
- Checked `https://github.com/github/awesome-copilot`, `https://github.com/agentsmd/agents.md`, and `https://github.com/copilot` — all reachable and relevant to the places they are cited.
- Checked the limitation-only URL `https://docs.github.com/en/copilot/tutorials/copilot-customization-cheat-sheet` — it currently returns `404`, so the limitation note is supported.

- **🟡 Important (must-fix)** — **Location:** §6.1 support matrix and §6.5 CLI-vs-VS-Code comparison. **Issue:** live source validation surfaced a material source conflict that the report does not disclose. The support-matrix page says VS Code Chat and Copilot CLI use agent instructions via `AGENTS.md`, while the CLI how-to additionally documents `CLAUDE.md` and `GEMINI.md`, and the VS Code custom-instructions page documents `CLAUDE.md` support in VS Code. **Why it matters:** readers cannot tell whether the table is a verified current fact, a synthesis across conflicting docs, or a likely docs inconsistency.

## Claim Citation Coverage

- **🟡 Important (must-fix)** — **Location:** Executive Summary, paragraph 2 (`personal instructions`, `organization instructions`, path-scoped `*.instructions.md`, and IDE prompt-file behavior). **Issue:** this paragraph makes several substantive support-scope and behavior claims with no inline citation at all. **Why it matters:** the Executive Summary is where high-level readers will stop; unsourced claims there are especially risky.
- **🟡 Important (must-fix)** — **Location:** §5.4 "Other beginner mistakes observed across the docs" (wrong path, wrong extension, conflicting layers, length/vagueness, task-specific rules). **Issue:** these are operational claims and recommendations presented without citations. **Why it matters:** several of them affect setup correctness, and the section currently reads as memory/synthesis rather than traceable research.
- **🟢 Minor (nice-to-have)** — **Location:** §6.2 "`AGENTS.md` is an emerging cross-tool convention (also used by Claude Code, Gemini CLI, etc.)". **Issue:** the cross-vendor statement is uncited at the point of use. **Why it matters:** it is plausible, but should either link the `agentsmd/agents.md` repo inline or be phrased more cautiously.

## Quote Verification

[24 of 24 report-body quotes checked against their cited pages. 23 matched verbatim with only whitespace/HTML-normalization differences; 1 is edited rather than verbatim.]

- Verified as present on source pages: the overview, non-determinism, precedence, prompt-file, `/init`, personal instructions, organization instructions, save-time pickup, 4,000-character limit, writing-guidance, anti-pattern, prompt-file availability, `AGENTS.md`, parent-repository discovery, `/create-instruction`, and prompt-file guidance quotes.
- **🟢 Minor (nice-to-have)** — **Location:** §6.5, quote beginning `Local instructions ...`. **Issue:** this is not verbatim; it inserts an ellipsis and stitches together heading/body text from the CLI page. **Why it matters:** the report spec requires verbatim quotes, so this should either become a true verbatim quote or be rewritten as a paraphrase without quote marks.

## Source Authority Compliance

- No material issues. The report leans primarily on GitHub Docs and VS Code Docs for core claims, which is the right authority mix for this topic.
- **🟢 Minor (nice-to-have)** — **Location:** §7 "Ecosystem & Alternatives". **Issue:** `github/awesome-copilot` and `agentsmd/agents.md` are appropriately supplemental, but `agentsmd/agents.md` is not clearly tracked in the reference list. **Why it matters:** the authority hierarchy is fine; the bookkeeping is not.

## Conflict & Uncertainty Disclosure

- **🟡 Important (must-fix)** — **Location:** §6.1 and §6.5. **Issue:** the report presents the agent-instructions support story as settled, but the fetched sources disagree in meaningful ways: the support-matrix page says VS Code Chat and Copilot CLI support agent instructions via `AGENTS.md`, while the VS Code custom-instructions page documents `CLAUDE.md` support and the CLI how-to documents `CLAUDE.md`/`GEMINI.md`. **Why it matters:** this is exactly the kind of source conflict the companion spec requires the report to surface and resolve, rather than silently merging.
- **🟡 Important (must-fix)** — **Location:** §8 Research Limitations. **Issue:** the limitations section acknowledges the unreachable cheat-sheet page, but not the more consequential docs disagreement above. **Why it matters:** the real trust risk in this report is not the 404; it is the unresolved surface-support inconsistency.

## Source Freshness & Currency

- No material issues. The checked sources are current GitHub/VS Code docs, and the report already flags the one known 404 limitation separately.

## Topic Coverage Assessment

- Coverage breadth is strong: repo-wide instructions, path-scoped instructions, personal/org instructions, prompt files, `AGENTS.md`, support matrices, and CLI specifics are all covered.
- **🟡 Important (must-fix)** — **Location:** Executive Summary, §2.1, and §6.5. **Issue:** the report does not clearly surface VS Code's user-profile instruction locations (`~/.copilot/instructions` / user-data instructions) as part of the beginner mental model, even though §5.6 includes the setting and the cited VS Code docs explicitly document that user scope. **Why it matters:** for a "customization" guide comparing GitHub.com, VS Code, and CLI behavior, readers are left with an incomplete per-user/per-local picture.
- **🟢 Minor (nice-to-have)** — **Location:** Executive Summary. **Issue:** the summary accurately captures most of the body, but it over-compresses the support story and would benefit from a one-line caveat that support varies by surface and that the `CLAUDE.md`/`GEMINI.md` story is docs-dependent. **Why it matters:** this would reduce overconfidence in the summary.

## Research Limitations Review

- The section exists and is generally honest.
- **🟡 Important (must-fix)** — **Location:** §8. **Issue:** it omits the most consequential research limitation: the live GitHub Docs and VS Code Docs do not line up cleanly on agent-instruction support details across VS Code Chat, VS Code cloud agent, and Copilot CLI. **Why it matters:** that unresolved inconsistency should be called out explicitly so readers know where the report is confident versus provisional.

## Code & CLI Validation

- Code/CLI examples are present, which is appropriate for this code-oriented topic.
- The copied Markdown/JSON examples are syntactically plausible on inspection.
- **🟡 Important (must-fix)** — **Location:** fenced blocks at lines 88-95, 112-118, 134-146, 487-494, and 502-504. **Issue:** these blocks are missing the required immediate post-block attribution line in the form `> — Source: ... | Provenance: ...`. One block has a plain `Source:` line instead, others have no post-block source at all, and one is followed by a quote rather than a block attribution. **Why it matters:** the report spec requires block-level source visibility for all code/CLI examples; without it, readers cannot tell which snippets are verbatim, adapted, or synthesized.
- **🟢 Minor (nice-to-have)** — **Location:** §3 "Terminal commands". **Issue:** the block is labeled generically as terminal commands but uses Bash-specific commands (`mkdir -p`, `touch`, `code`) without scoping the shell. **Why it matters:** beginners on Windows or PowerShell may assume the block is universally copy-pasteable.

## Reference List Integrity

- **🟡 Important (must-fix)** — **Location:** report header line 6 vs. §9 reference list. **Issue:** `Sources consulted: 10 web pages ... 1 GitHub repository` does not match the actual report contents. The reference list contains 11 documentation/article entries plus 1 GitHub repository, and the report body cites additional URLs beyond that count. **Why it matters:** the source-count header is a trust signal; it should reconcile with the actual bibliography.
- **🟡 Important (must-fix)** — **Location:** body-vs-reference-list comparison. **Issue:** the body cites `https://github.com/agentsmd/agents.md` and `https://github.com/copilot`, but neither appears in the complete reference list. **Why it matters:** the spec requires all body-cited sources to be listed.
- **🟡 Important (must-fix)** — **Location:** §9 reference list. **Issue:** `https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions` appears in the reference list but is not cited in the body. **Why it matters:** orphaned references make the bibliography harder to audit and inflate the apparent research footprint.

## Report Structure & Readability

- The overall template structure is strong: Executive Summary, TOC, core sections, Research Limitations, and Complete Reference List are all present and sensibly ordered.
- Quotes are correctly embedded inline in relevant sections rather than collected into a separate quotes appendix.
- **🟢 Minor (nice-to-have)** — **Location:** §6.1 and §6.5. **Issue:** the two support tables together create a slightly contradictory reading because one collapses agent-instruction support into a single column while the later table distinguishes `CLAUDE.md`/`GEMINI.md`. **Why it matters:** even if corrected, the current presentation makes the support story harder to follow.

## Suggested Improvements (Prioritized)

1. Resolve the `AGENTS.md` / `CLAUDE.md` / `GEMINI.md` support inconsistency across §6.1, §6.5, and §8 by either reconciling the live docs or explicitly documenting the conflict and stating which source is being favored for each surface.
2. Add citations to the Executive Summary's second paragraph and to §5.4's setup/pitfall claims so the highest-stakes operational guidance is fully traceable.
3. Fix bibliography integrity: reconcile the header count, add `agentsmd/agents.md` and `github.com/copilot` if they remain cited, and remove or cite the orphaned how-to URL.
4. Add the required post-block `> — Source: ... | Provenance: ...` attribution lines to every fenced block that currently lacks one, especially the precedence block, decision guide, terminal commands, `excludeAgent` example, and parent-repo setting snippet.
5. Surface VS Code's user-profile instruction scope more clearly in the mental model so the GitHub.com vs VS Code vs CLI comparison is complete for beginners.

## Readiness Verdict: APPROVED WITH EDITS

The report is substantially researched and mostly grounded in primary documentation, but it still has several **🟡 Important** must-fix issues: unsourced high-level claims, unresolved source conflicts around support surfaces, missing required code-block attributions, and bibliography/count mismatches. These do not look like fabricated research, so this is not `NEEDS REWORK`, but it is not yet trustworthy enough for publication without the required edits above.

## Review Round 2 — 2026-04-21

### Fix Verification

- **⚠️ partially fixed** — **Round 1: §6.1 support matrix and §6.5 CLI-vs-VS-Code comparison source conflict.** The report now discloses the conflict and cites tool-specific sources, but the disclosure is no longer fully accurate: the live support-matrix page now shows **VS Code cloud agent** supporting `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md`, while the remaining mismatch is primarily **VS Code Chat** and **Copilot CLI**. This leaves the conflict note in §6.1 and the limitation bullet in §8 slightly stale.
- **✅ fixed** — **Round 1: Executive Summary paragraph 2 missing inline citations.** The revised paragraph now cites personal instructions, organization instructions, path-scoped `*.instructions.md`, VS Code user-level instructions, CLI local instructions, and prompt files.
- **✅ fixed** — **Round 1: §5.4 unsourced beginner-mistake guidance.** Each synthesized pitfall now has inline support from the relevant GitHub Docs and/or VS Code Docs page.
- **⚠️ partially fixed** — **Round 1: §6.1 and §6.5 conflict & uncertainty disclosure.** The report now surfaces the disagreement and explains which source it favors, but it overstates the current matrix/tool-specific disagreement by still describing **VS Code cloud agent** as part of the unresolved conflict.
- **⚠️ partially fixed** — **Round 1: §8 Research Limitations omitted the key docs disagreement.** The limitation is now present and prominent, but it repeats the same outdated characterization of the conflict.
- **✅ fixed** — **Round 1: topic coverage omitted VS Code / CLI user-profile instruction scope.** §2.1 and §6.5 now cover `~/.copilot/instructions`, `chat.instructionsFilesLocations`, and `$HOME/.copilot/copilot-instructions.md`.
- **✅ fixed** — **Round 1: missing post-block source attribution lines for code/CLI blocks.** The previously flagged precedence, decision-guide, terminal, `excludeAgent`, and parent-repo snippets now have the required immediate `> — Source: ... | Provenance: ...` attribution lines.
- **✅ fixed** — **Round 1: reference-list header count mismatch.** The header now reconciles to `10 web pages` and `3 GitHub repositories`, matching the bibliography.
- **✅ fixed** — **Round 1: body-cited `agentsmd/agents.md` missing from references.** It now appears in the GitHub Repositories section.
- **✅ fixed** — **Round 1: body-cited `github.com/copilot` missing from references.** It now appears in the GitHub Repositories section.
- **✅ fixed** — **Round 1: orphaned reference `configure-custom-instructions/add-repository-instructions`.** It has been removed from the reference list.

## Reference Validation

[6 of 13 cited URLs checked this round.]

- Checked `https://docs.github.com/en/copilot/reference/custom-instructions-support` — reachable and relevant. It now shows **VS Code Chat** using `AGENTS.md`, **VS Code cloud agent** using `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md`, and **Copilot CLI** using `AGENTS.md`. This partially contradicts the report's current conflict summary in §6.1/§8.
- Checked `https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-custom-instructions` — reachable and relevant. It still supports the CLI-local file, `COPILOT_CUSTOM_INSTRUCTIONS_DIRS`, and CLI-specific `CLAUDE.md` / `GEMINI.md` guidance.
- Checked `https://code.visualstudio.com/docs/copilot/customization/custom-instructions` — reachable and relevant. It still documents `chat.useClaudeMdFile`, `chat.instructionsFilesLocations`, and `~/.copilot/instructions`.
- Checked `https://docs.github.com/en/copilot/customizing-copilot/about-customizing-github-copilot-chat-responses` — reachable and relevant. It still supports the precedence guidance, merged-instructions statement, and IDE-only prompt-file claim.
- Checked `https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot` — reachable and relevant. It still supports `excludeAgent`, the repo-file path, and base-branch behavior.
- Checked `https://github.com/agentsmd/agents.md` — reachable and relevant as the cited cross-vendor convention source.

- **🟡 Important (must-fix)** — **Location:** §6.1 conflict-disclosure block and §8 first limitation bullet. **Issue:** the revised report still says the support-matrix page collapses **VS Code cloud agent** into `AGENTS.md`-only support, but the live matrix now lists `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md` for that surface. **Why it matters:** the report is trying to reduce uncertainty; if the conflict summary itself is stale, readers cannot tell which surface-level guidance is actually current.

## Claim Citation Coverage

- No material issues. The Round 1 citation gaps in the Executive Summary and §5.4 are now resolved.

## Quote Verification

[5 key quotes spot-checked this round.]

- The checked quotes on precedence, merged instructions, prompt-file availability, CLI local instructions, and `AGENTS.md` usage all still match their cited sources with only formatting normalization differences.
- No material issues.

## Source Authority Compliance

- No material issues. Core claims still rely primarily on GitHub Docs and VS Code Docs, with GitHub repositories used only as supplemental evidence.

## Conflict & Uncertainty Disclosure

- **🟡 Important (must-fix)** — **Location:** §6.1 "Source conflict disclosure" and §6.5 comparison table note. **Issue:** the report now discloses uncertainty, but it does not reflect the current narrower shape of the disagreement: the live matrix aligns with tool-specific docs for **VS Code cloud agent**, while disagreement remains for **VS Code Chat** and **Copilot CLI**. **Why it matters:** a disclosure that overstates the conflict is still a trust problem; it can make the docs ecosystem look messier than it currently is.

## Source Freshness & Currency

- **🟡 Important (must-fix)** — **Location:** §6.1, §6.5, and §8. **Issue:** the revised draft incorporates Round 1's conflict finding, but the live support-matrix page has since changed enough that the wording is now partially outdated. **Why it matters:** this topic is highly time-sensitive, and the report explicitly positions itself as an April 2026 current-state guide.

## Topic Coverage Assessment

- No material issues. The user-profile scope gap from Round 1 is now covered appropriately in both the conceptual table and the VS Code vs CLI comparison.

## Research Limitations Review

- The section exists and is candid.
- **🟡 Important (must-fix)** — **Location:** §8 first bullet. **Issue:** the limitations section now flags the key docs inconsistency, but it repeats the stale claim that the matrix page reduces **VS Code cloud agent** to `AGENTS.md`-only support. **Why it matters:** the limitations section should sharpen uncertainty, not preserve an outdated version of it.

## Code & CLI Validation

- Code/CLI coverage remains appropriate for this topic.
- The previously flagged blocks now have visible post-block attribution.
- No material issues.

## Reference List Integrity

- No material issues. The source count, cited repositories, and removed orphaned reference now reconcile.

## Report Structure & Readability

- The Round 2 revision remains well structured and easy to audit.
- No material issues beyond the stale conflict wording described above.

## Suggested Improvements (Prioritized)

1. Update §6.1 and §8 to reflect the **current** live disagreement precisely: the support-matrix page now aligns with tool-specific docs for **VS Code cloud agent**, while the unresolved mismatch is chiefly **VS Code Chat** and **Copilot CLI**.
2. Tighten the §6.5 table note so it distinguishes "documented by the tool-specific page" from "also confirmed by the consolidated matrix" on a per-surface basis.
3. Add a brief "last re-checked against live docs on 2026-04-21" note near the conflict disclosure to make the time-sensitive reconciliation explicit.

## Readiness Verdict (Round 2): APPROVED WITH EDITS

Most Round 1 **🟡 Important** findings are now **✅ fixed**, and the report is materially stronger. One **🟡 Important (must-fix)** issue remains: the new conflict-disclosure language is itself partially outdated against the current live support-matrix page, especially for **VS Code cloud agent**. This is a targeted edit rather than a full rework, so the correct verdict remains `APPROVED WITH EDITS`.

## Review Round 3 — 2026-04-21

### Fix Verification

- **✅ fixed** — **Round 2: §6.1 conflict-disclosure block and §8 first limitation bullet.** The report now correctly states that **VS Code cloud agent** is aligned across sources, and that the remaining mismatch is limited to **VS Code Chat** and **Copilot CLI**. See §6.1 lines 487-493 and §8 line 613.
- **✅ fixed** — **Round 2: §6.5 comparison-table provenance note.** The note now distinguishes matrix-confirmed support from tool-specific-only support on a per-surface basis, and explicitly says the **VS Code cloud agent** row is no longer in conflict. See §6.5 line 564.
- **✅ fixed** — **Round 2: freshness issue across §6.1 / §6.5 / §8.** The conflict language is now stamped as re-checked on 2026-04-21 and matches the current live support-matrix page for the relevant rows.
- **✅ fixed** — **Round 1: Executive Summary paragraph 2 missing inline citations.** Still resolved; the citations added in Round 2 remain present.
- **✅ fixed** — **Round 1: §5.4 unsourced beginner-mistake guidance.** Still resolved; the section remains traceable to cited docs.
- **✅ fixed** — **Round 1: topic coverage omitted VS Code / CLI user-profile instruction scope.** Still resolved in §2.1 and §6.5.
- **✅ fixed** — **Round 1: missing post-block source attribution lines for code/CLI blocks.** Still resolved; the previously flagged blocks retain visible post-block attribution.
- **✅ fixed** — **Round 1: reference-list header count mismatch.** Still resolved.
- **✅ fixed** — **Round 1: body-cited `agentsmd/agents.md` missing from references.** Still resolved.
- **✅ fixed** — **Round 1: body-cited `github.com/copilot` missing from references.** Still resolved.
- **✅ fixed** — **Round 1: orphaned reference `configure-custom-instructions/add-repository-instructions`.** Still resolved.

## Reference Validation

[3 of 13 cited URLs checked this round.]

- Checked `https://docs.github.com/en/copilot/reference/custom-instructions-support` — reachable and relevant. The live page currently shows **VS Code Chat** using agent instructions via `AGENTS.md`, **VS Code cloud agent** using `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md`, and **Copilot CLI** using `AGENTS.md`.
- Checked `https://code.visualstudio.com/docs/copilot/customization/custom-instructions` — reachable and relevant. It still documents `CLAUDE.md` support in VS Code and the `chat.useClaudeMdFile` / `chat.instructionsFilesLocations` settings.
- Checked `https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-custom-instructions` — reachable and relevant. It still documents CLI support for `CLAUDE.md` and `GEMINI.md`, alongside `AGENTS.md` and `$HOME/.copilot/copilot-instructions.md`.

- No material issues.

## Claim Citation Coverage

- No material issues.

## Quote Verification

- No material issues. This round's targeted re-review was about source reconciliation in §6.1, §6.5, and §8 rather than new verbatim-quote coverage.

## Source Authority Compliance

- No material issues. The conflict analysis remains grounded in primary documentation from GitHub Docs and VS Code Docs.

## Conflict & Uncertainty Disclosure

- No material issues. §6.1, §6.5, and §8 now describe the narrower current disagreement accurately: **VS Code cloud agent** is aligned across sources, while the remaining mismatch is limited to **VS Code Chat** and **Copilot CLI**.

## Source Freshness & Currency

- No material issues. The support-matrix language was re-checked against the live page on 2026-04-21 and now reflects the current rows precisely.

## Topic Coverage Assessment

- No material issues. The revised conflict note and limitation language now match the report's own support tables and beginner guidance.

## Research Limitations Review

- No material issues. §8 now captures the real remaining uncertainty without preserving the stale **VS Code cloud agent** claim from the prior round.

## Code & CLI Validation

- No material issues. The code/CLI coverage remains appropriate, and this round did not surface any new syntax or attribution problems.

## Reference List Integrity

- No material issues identified in this round.

## Report Structure & Readability

- No material issues. The conflict disclosure, CLI comparison note, and Research Limitations section now tell a consistent story.

## Suggested Improvements (Prioritized)

1. Optional: if publication slips beyond 2026-04-21, re-check the live support-matrix page once more before release, because this specific surface-support matrix is changing quickly.
2. Optional: if the report is revised again, keep the per-surface provenance wording in §6.5 as explicit as it is now; that detail materially improves auditability.

## Readiness Verdict (Round 3)

**APPROVED** — All prior **🔴 Critical** and **🟡 Important** findings are now **✅ fixed**. In particular, §6.1, §6.5, and §8 now reflect the current live support-matrix page accurately: **VS Code cloud agent** is aligned across sources, and the remaining documented mismatch is limited to **VS Code Chat** and **Copilot CLI**. No new must-fix issues surfaced in this round.
