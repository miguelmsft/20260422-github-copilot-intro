---
reviewer: web-research-reviewer
subject: GitHub Copilot Hooks
companion: web-researcher
date: 2026-04-21
verdict: APPROVED
---

## Review Round 1 — 2026-04-21

## Reference Validation

6 of 11 reference-list URLs were checked live.

1. **Verified** — `https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-hooks` is reachable and supports the core definitional claims in the report, including the opening quote in §1, the surface-availability statement in §6.4, the `preToolUse` description in §2.1, the plan-availability quote in §3, and the "keep hook execution time under 5 seconds" guidance in §5.2.
2. **Verified** — `https://docs.github.com/en/copilot/reference/hooks-configuration` is reachable and supports the stdin payload examples in §2.4, the `permissionDecision` output contract in §2.5, the "only `deny` is currently processed" wording, and the shell/Slack examples used in §4 and §6.
3. **Verified** — `https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/use-hooks` is reachable and supports the default-branch/current-working-directory distinction in §2.3 and the local hook-testing commands in §4.6.
4. **Verified** — `https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-config-dir-reference` is reachable and supports the user-level hooks location, inline `hooks` key, and `disableAllHooks` claims in §2.3 and §5.1.
5. **Verified** — `https://docs.github.com/en/copilot/concepts/agents/copilot-cli/comparing-cli-features` is reachable and supports the quote in §1 about hooks vs. skills/custom instructions.
6. **Verified** — `https://docs.github.com/en/copilot/tutorials/copilot-cli-hooks` is reachable and supports the repo layout / `.gitignore` commands in §3.

- 🟡 Important (must-fix) **Location:** §6.4, line 514. **Issue:** The report relies on a specific page title, "Connecting GitHub Copilot CLI to VS Code," to support the CLI-vs-VS Code nuance, but the URL is not cited anywhere in the body or reference list, so that part of the claim is currently `⚠️ unverifiable` from the artifact. **Why it matters:** This is the highest-risk nuance in the report and the user explicitly asked for it to be checked.

## Claim Citation Coverage

- 🟡 Important (must-fix) **Location:** Executive Summary (lines 12-16). **Issue:** The summary makes several high-stakes claims with no inline citation, including supported surfaces, configuration locations, the ability to deny tool calls, and the security-sensitive nature of hooks. **Why it matters:** Readers will likely reuse the summary more than the body; without inline attribution, the most important takeaways are not auditable.
- 🟡 Important (must-fix) **Location:** §3 "Prerequisites" (line 228). **Issue:** The sentence "Copilot CLI works on all Copilot plans" is not actually sourced by the adjacent quote, which only supports cloud-agent plan availability. **Why it matters:** Plan availability is time-sensitive product information and should not be left partially sourced.
- 🟡 Important (must-fix) **Location:** §6.4-§6.5 (lines 514-525). **Issue:** Several consequential claims are unsourced: that the VS Code extension has no direct hooks feature, that connecting Copilot CLI to VS Code is the documented path for hooks there, that the SDK exposes hook-like surfaces programmatically, that cloud-agent hooks run on a "sandboxed runner," and that a malicious repo hook could execute as soon as you start Copilot CLI in that directory. **Why it matters:** These are exactly the claims readers will use for security and product-boundary decisions.

## Quote Verification

9 of 11 verbatim quote blocks were spot-checked.

- **Verified:** §1 line 40 / About hooks.
- **Verified:** §1 line 47 / Comparing GitHub Copilot CLI customization features.
- **Verified:** §2.1 line 86 / About hooks.
- **Verified:** §2.3 line 139 / About hooks (formatting normalized from rendered HTML, but wording matches).
- **Verified:** §2.3 line 142 / Using hooks with GitHub Copilot CLI.
- **Verified:** §2.3 line 145 / GitHub Copilot CLI configuration directory.
- **Verified:** §2.5 line 214 / Hooks configuration.
- **Verified:** §2.5 line 219 / Hooks configuration.
- **Verified:** §6.4 line 511 / About hooks.

No material issues. The checked quotes reproduced correctly aside from harmless whitespace / code-format normalization, and the report keeps quotes inline rather than collecting them in a separate end section.

## Source Authority Compliance

No material issues. The report leans almost entirely on first-party GitHub Docs, which is the right source tier for a product-feature explainer like this one.

## Conflict & Uncertainty Disclosure

- 🟡 Important (must-fix) **Location:** §6.4 (lines 514-516) versus §8 "Research Limitations" (lines 564-565). **Issue:** The body states as fact that the VS Code extension "does not expose a 'hooks' feature of its own" and that the documented route is CLI-to-VS-Code integration, while the limitations section admits that the negative claim is based on non-exhaustive absence-of-evidence and that the connection page was not actually deep-read/cited. **Why it matters:** When the evidence is incomplete, the report should either add direct support or soften the body text to match the stated uncertainty.

## Source Freshness & Currency

No material issues. The checked sources are current April 2026 GitHub Docs pages, and the report appropriately treats release-timing / GA-status questions as uncertain rather than inventing dates.

## Topic Coverage Assessment

- 🟡 Important (must-fix) **Location:** §6.4 "Surface differences" (lines 500-516). **Issue:** The report does cover the CLI/cloud-agent/VS Code distinction, but it stops short of clearly defining the operational boundary inside VS Code: whether hooks apply only to CLI agent sessions connected to VS Code, versus native editor chat/completions/agent mode. **Why it matters:** This boundary is the main nuance readers need, and the user explicitly called it out.

## Research Limitations Review

No material issues. The section exists, acknowledges genuine evidence gaps (`agentStop` / `subagentStop`, VS Code negative evidence, lack of announcement material), and keeps scope boundaries clear.

## Code & CLI Validation

The topic is code-oriented, and the report appropriately includes CLI and shell/PowerShell examples. The examples are generally syntactically plausible and useful.

- 🟡 Important (must-fix) **Location:** §2.4 payload examples (lines 153-202), §2.5 output JSON example (lines 210-212), and §4.1 `chmod` command (lines 299-301). **Issue:** These code/JSON blocks do not have the required immediate post-block attribution line in the format `> — Source: [Page title](URL) | Provenance: ...`. The payload examples use one aggregated source line later at line 204, and the `chmod` block has no post-block attribution at all. **Why it matters:** The review spec requires per-block source visibility so readers can audit examples without hunting elsewhere in the section.
- 🟢 Minor (nice-to-have) **Location:** §4.2-§4.5. **Issue:** A few examples assume `jq`, existing directories, or shell environment details without a one-line setup reminder next to the block. **Why it matters:** The examples are still understandable, but a tiny bit more setup guidance would make them more copy-paste friendly.

## Reference List Integrity

- 🟡 Important (must-fix) **Location:** §6.4 line 514 and §9 Complete Reference List (lines 571-583). **Issue:** The report cites a page title ("Connecting GitHub Copilot CLI to VS Code") in prose but does not provide its URL anywhere, so the complete reference list is incomplete relative to the evidence the body claims to rely on. **Why it matters:** Readers cannot inspect or re-verify that source, which is especially problematic because it underpins the CLI-vs-VS Code distinction.
- 🟢 Minor (nice-to-have) **Location:** §9 Complete Reference List (lines 571-583). **Issue:** Several listed pages appear to be consulted background rather than body-cited evidence (`Customize agent workflows with hooks`, `About GitHub Copilot CLI`, `CLI command reference`, customization overview, responsible-use page). **Why it matters:** This is not wrong, but separating "cited" from "consulted background" would improve traceability.

## Report Structure & Readability

No material issues. The report follows the expected template, the table of contents matches the body, and quotes are embedded inline instead of being moved to a trailing quote dump.

## Suggested Improvements (Prioritized)

1. Add direct inline citations for the Executive Summary and the high-stakes claims in §3, §6.4, and §6.5, especially the CLI-vs-VS Code boundary and security-behavior claims.
2. Add the actual URL for the "Connecting GitHub Copilot CLI to VS Code" page if that page is being relied on, and either cite it directly in §6.4 or soften the claim to match the current evidence.
3. Rewrite the VS Code wording so the body and the limitations section agree on confidence level; if the evidence remains indirect, say that explicitly.
4. Fix code-block attribution so every example block has an immediate `> — Source: ... | Provenance: ...` line, including the payload JSON blocks and the standalone `chmod` command.
5. Clarify in one sourced paragraph whether hooks apply only to CLI sessions connected to VS Code or also to native VS Code Copilot experiences; if the docs do not answer that cleanly, say so plainly.

## Readiness Verdict: APPROVED WITH EDITS

The report is substantially grounded in strong first-party documentation and the checked quotes/references are real, but it is not publication-ready yet. The blockers are `🟡 Important` must-fix issues: incomplete sourcing for the most consequential claims, an under-supported CLI-vs-VS Code boundary, and systemic per-code-block attribution gaps. Once those are corrected, this should be close to `APPROVED`.

## Review Round 2 — 2026-04-21

### Fix Verification

1. `✅ fixed` **Missing URL for "Connecting GitHub Copilot CLI to VS Code"** — The report now cites `https://docs.github.com/en/copilot/how-tos/copilot-cli/connecting-vs-code` inline in the Executive Summary, §6.4, and §8, and lists it in §9 under body-cited references.
2. `✅ fixed` **Executive Summary lacked inline citations for high-stakes claims** — The summary now cites the hooks concept page, hooks configuration reference, CLI config-dir reference, and the connecting-to-VS-Code page for the claims previously called out.
3. `✅ fixed` **§3 plan-availability claim was over-stated** — The old "Copilot CLI works on all Copilot plans" wording is gone; §3 now keeps only the directly quoted cloud-agent plan statement and explicitly says CLI plan availability was not independently verified.
4. `✅ fixed` **§6.4 / §6.5 consequential claims lacked support or overreached** — The VS Code discussion is now explicitly framed as absence-of-evidence, the connecting-to-VS-Code page is cited directly, the "sandboxed runner" phrasing has been removed, and the repo-hook risk wording is now labeled as an inference from the documented discovery rule.
5. `✅ fixed` **§6.4 body and §8 limitations disagreed on confidence level** — Both sections now use the same hedged framing: not listed in the supported-surface docs, not explicitly documented on the VS Code integration page, and therefore an inference rather than a positive product statement.
6. `⚠️ partially fixed` **Per-code-block attribution gaps in §2.4 / §2.5 / §4.1** — §2.5's stdout JSON block and §4.1's `chmod` block now have immediate post-block source lines, and `errorOccurred` in §2.4 does too. But the `sessionStart`, `sessionEnd`, `userPromptSubmitted`, `preToolUse`, and `postToolUse` payload blocks in §2.4 still share one later aggregate citation instead of each having an immediate post-block `> — Source: ... | Provenance: ...` line.
7. `✅ fixed` **CLI-vs-VS Code operational boundary was under-defined** — §6.4 now has a dedicated four-point breakdown separating native VS Code, CLI connected to VS Code, the inferred applicability of CLI hooks, and the runtime-vs-editor boundary.
8. `✅ fixed` **Reference list was missing the connecting-to-VS-Code source** — §9 now includes the page and cleanly separates body-cited references from consulted background.

## Reference Validation

5 of 12 reference-list URLs were checked live.

1. **Verified** — `https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-hooks` is reachable and contains the supported-surface list used in §6.4 ("Copilot cloud agent on GitHub" and "GitHub Copilot CLI in the terminal"), the cloud-agent plan quote used in §3, and the security warning about untrusted input used in §6.5.
2. **Verified** — `https://docs.github.com/en/copilot/reference/hooks-configuration` is reachable and contains the `permissionDecision` contract and the note that only `"deny"` is currently processed, matching §2.5 and §6.5.
3. **Verified** — `https://docs.github.com/en/copilot/how-tos/copilot-cli/connecting-vs-code` is reachable and contains the VS Code integration material cited in §6.4 (for example, diff review, live diagnostics, and cross-tool session continuity). I did **not** find a direct statement there about hook applicability, which matches the report's revised "inferred, not directly stated" framing.
4. **Verified** — `https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-config-dir-reference` is reachable and supports the `~/.copilot/hooks/`, inline `hooks`, and `disableAllHooks` claims used in the Executive Summary and §6.4.
5. **Verified** — `https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/use-hooks` is reachable and supports the default-branch/current-working-directory distinction and local hook-testing guidance cited in §§2.3, 4.6, and 6.5.

No fabricated or unrelated URLs were found in this spot-check set.

## Claim Citation Coverage

No material issues. The Round 1 high-stakes unsourced claims have been either directly cited or rewritten to make the inference/uncertainty explicit.

## Quote Verification

3 of 3 revised high-stakes quote blocks were spot-checked.

1. **Verified** — §3 cloud-agent plan quote matches the About hooks page.
2. **Verified** — §6.4 supported-surfaces quote matches the About hooks page.
3. **Verified** — §2.5 `permissionDecision` quote matches the Hooks configuration reference.

No material issues.

## Source Authority Compliance

No material issues. The report still relies primarily on first-party GitHub Docs for core product-behavior claims, which is appropriate for this topic.

## Conflict & Uncertainty Disclosure

No material issues. The revised VS Code discussion now clearly distinguishes documented facts from reasoned interpretation, and §8 reflects the same confidence level.

## Source Freshness & Currency

No material issues. The checked sources are current GitHub Docs pages and the report avoids overstating time-sensitive product availability beyond what those pages support.

## Topic Coverage Assessment

No material issues. The previously weak CLI-vs-VS Code boundary is now covered clearly enough for a reader making surface/behavior decisions.

## Research Limitations Review

No material issues. The limitations section now more precisely explains the VS Code evidence boundary and still keeps scope exclusions honest.

## Code & CLI Validation

- 🟡 Important (must-fix) **Location:** §2.4 "Event payload shapes" (lines 152-194). **Issue:** The `sessionStart`, `sessionEnd`, `userPromptSubmitted`, `preToolUse`, and `postToolUse` JSON blocks still do not have an immediate post-block attribution line in the required `> — Source: [Page title](URL) | Provenance: ...` format. Instead, they share one aggregate source line after explanatory text at line 194. **Why it matters:** This was a specific Round 1 blocker. The review spec requires each code block to be individually auditable without scanning past intervening prose.

## Reference List Integrity

No material issues. The header count of 12 consulted web pages matches the 12 documentation references listed in §9, and the previously missing connecting-to-VS-Code page is now present.

## Report Structure & Readability

No material issues. The report structure remains coherent, and the revised §6.4 wording is materially clearer than Round 1.

## Suggested Improvements (Prioritized)

1. Add an immediate `> — Source: [Hooks configuration](https://docs.github.com/en/copilot/reference/hooks-configuration) | Provenance: verbatim` line after each of the first five payload blocks in §2.4, not one shared line after the group.
2. After fixing §2.4, do a final consistency pass to ensure every future code/JSON block in the report follows the same immediate post-block attribution pattern.

## Readiness Verdict (Round 2): APPROVED WITH EDITS

The report is much stronger than Round 1 and most must-fix findings are now resolved. One `🟡 Important` must-fix remains: §2.4 still does not meet the required per-code-block attribution format for five payload examples. Once those blocks each get their own immediate post-block source line, the report should be ready for `APPROVED`.

## Review Round 3 — 2026-04-21

### Fix Verification

1. `✅ fixed` **Per-code-block attribution gaps in §2.4** — The `sessionStart` block now has its own immediate attribution line at lines 156-156, `sessionEnd` at 164-164, `userPromptSubmitted` at 172-172, `preToolUse` at 183-183, and `postToolUse` at 200-200. Each block now follows the required `> — Source: [Hooks configuration](https://docs.github.com/en/copilot/reference/hooks-configuration) | Provenance: verbatim` pattern with no intervening prose.

## Reference Validation

No material issues. This Round 3 delta review was scoped to the last remaining formatting/compliance blocker in §2.4; Round 2's live URL checks remain sufficient, and the newly added attribution lines point to the same already-verified `Hooks configuration` source.

## Claim Citation Coverage

No material issues. The only open Round 2 concern was code-block attribution format, not missing support for substantive claims.

## Quote Verification

No material issues. No quote text changed in this round.

## Source Authority Compliance

No material issues. The corrected §2.4 attributions still point to first-party GitHub Docs.

## Conflict & Uncertainty Disclosure

No material issues. No changes in this round affected uncertainty handling.

## Source Freshness & Currency

No material issues. No new sources were introduced.

## Topic Coverage Assessment

No material issues. The report's coverage remains adequate, and the final §2.4 fix improves auditability without changing scope.

## Research Limitations Review

No material issues. The limitations section remains honest and appropriately scoped.

## Code & CLI Validation

No material issues. **Location:** §2.4 "Event payload shapes" (lines 152-200). **Issue previously raised:** each of `sessionStart`, `sessionEnd`, `userPromptSubmitted`, `preToolUse`, and `postToolUse` lacked its own immediate post-block attribution line. **Why it matters:** code examples must be individually auditable. **Round 3 assessment:** all five blocks now comply.

## Reference List Integrity

No material issues. The fix did not introduce any new body citations or uncataloged sources.

## Report Structure & Readability

No material issues. The section now reads more cleanly because each payload block is self-attributed where readers expect it.

## Suggested Improvements (Prioritized)

1. No further must-fix edits are required before publication.

## Readiness Verdict (Round 3)

**APPROVED** — All prior `🔴 Critical` and `🟡 Important` findings are now resolved. The remaining Round 2 blocker in §2.4 has been fully corrected, and the report is ready for use.
