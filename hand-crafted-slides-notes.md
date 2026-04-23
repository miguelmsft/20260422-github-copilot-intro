# Hand-crafted visual slides — working notes

_Captured 2026-04-23. Working context for the next session: restoring hand-crafted visuals while keeping `presentation-content.md` as the single source of truth._

## Relevant git commits

| Tag | SHA | Date | Message |
|---|---|---|---|
| Original hand-crafted visuals | `f5c72fd` | 2026-04-22 12:12 | Rebuild 16 conceptual slides as real visuals (HTML components + SVG) |
| **v5** | `0d9b887` | 2026-04-22 22:03 | Presentation v5: Agent HQ, Cloud Agent deep dive, approvals, appendix (96 slides) |
| **v6** (current HEAD) | `ed911a2` | 2026-04-23 05:58 | Presentation v6: speaker-notes cleanup + slide 11 retitle |

Inspect any version: `git show <sha>:presentation/2026-04-22T1047-v1-github-copilot-foundations-to-agents/public/slides/slide-NNN.html`

---

## 1. Slides with hand-crafted visuals

These 17 slides were rebuilt as real HTML components (`.timeline-container`, `.tool-grid`, SVG decision trees, etc.) during the `f5c72fd` "Rebuild 16 conceptual slides as real visuals" work and the v5 slide-builder pass. They are the slides we want to keep looking hand-crafted.

| # | Section | Title |
|---|---|---|
| 4 | History | A brief history: the capability arc |
| 7 | Foundations | The agentic loop — Think · Act · Observe |
| 10 | Foundations | Common agent patterns |
| 11 | Foundations | What type of agentic approach should I use? |
| 13 | Foundations | The autonomy spectrum |
| 19 | Modes | Modes: a VS Code chat session = 3 independent choices |
| 20 | Modes | The three built-in personas |
| 32 | Models | Model variety — the families on offer |
| 33 | Models | Which model should I pick? |
| 41 | CLI | Built-in sub-agents |
| 44 | Customization | Customization: the four layers (higher = wins on conflict; all still sent) |
| 51 | MCP | Host · Client · Server |
| 59 | Skills | Anatomy of a skill |
| 60 | Skills | How Copilot picks a skill |
| 71 | Advanced | Advanced custom agents: one profile, three runtimes |
| 82 | Enterprise | Data security & privacy: the training split |
| 95 | Appendix | Premium requests — the basics |

---

## 2. Feedback given on v5

Main batch of changes requested after reviewing the v5 build:

- **Slide 5 (Agent HQ):** add a dedicated slide or two explaining what Agent HQ is and the value it brings.
- **Slide 8 / plan mode:** add a slide next to plan mode explaining the per-session `plan.md` that gets created for every session.
- **After slides 12–13:** add a slide on the best approach for working with autonomous agents — spec-driven development: do research, define task/objective, define plan, set up tests and guardrails, set up the validation and human-in-the-loop workflow.
- **Slide 15:** check whether "surface" is the word GitHub's official documentation actually uses.
- **Slide 16:** replace the title "the mental model to teach" with something more appropriate.
- **Slide 17:** same "surface" check — offer alternative terminology options.
- **After slide 19:** add one clear, simple slide on `/memories/session/plan.md` — the plan file every session creates.
- **After slide 20 (approvals):** add two slides on how approvals are configured — one for CLI, one for VS Code. Then one more slide on bypass-approvals — when there's no per-step prompt, what guardrails still apply and how they are set up.
- **Slide 20:** remove the sentence "Autopilot is not a fourth mode" (can be said verbally).
- **Cloud Agent:** kick off a web-researcher + reviewer pair for a deep-dive on GitHub Copilot cloud agent. Run through reviewer loops until APPROVED.
- **Slide 26:** keep the multi-model theme; remove premium-requests / billing references.
- **Appendix:** create a dedicated appendix at the end of the deck with a cover slide. For now, the appendix holds cost / premium-request content only. All billing content moves out of the main deck.
- **Slide 27:** move to appendix.
- **Replacement for slide 27:** a slide showcasing the different models / model families available in GitHub Copilot.
- **Slide 28:** keep the decision framing; move quota / premium-request detail to the appendix.
- **Slide 29:** confirm the model choices available for cloud agent.
- **Slide 31:** spell out "REPL".
- **Slide 34:** add the `/clear` command to the "context & sessions" coverage.

Process constraint: do not make changes manually — invoke the appropriate subagents and run the official creator ↔ reviewer back-and-forth until all issues are resolved.

---

## 3. Main changes shipped in v6

Surgical edits on top of the v5 deck (commit `ed911a2`):

- **Slide 3:** removed the speaker-notes meta-comment referencing the "~80%" figure softening.
- **Slide 4:** removed the speaker-notes meta-comment about vendor-framing / exact magnitude being hard to quantify.
- **Slide 5:** removed two speaker-notes meta-comments (vendor framing paraphrase note; April 20 2026 Pro/Pro+/Student pause banner note). Added the **GitHub Copilot Agent CLI (2025)** mention to the 2025 "year of agents" bullet.
- **Slide 6:** removed the speaker-notes meta-comment "We deliberately start vendor-neutral."
- **Slide 10:** under Orchestrator-Workers, added **"Custom subagents"** before "CLI `/fleet` command" so the bullet reads "Custom subagents. CLI `/fleet` command".
- **Slide 11:** retitled from "When should I use an agent?" to **"What type of agentic approach should I use?"**. Replaced the 2024-era "prompt chain" wording with **"agentic workflow"** (a specific set of steps described across a work of agents). On the runtime-decision branch, the Yes answer was simplified to just **"Single Agent"** (removed the "(ReAct / tool-calling loop)" qualifier).

---