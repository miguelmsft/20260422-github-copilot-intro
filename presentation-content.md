---
topic: GitHub Copilot — Foundations through Advanced Agentic Workflows
topic_slug: github-copilot-foundations-to-agents
audience: beginner
target_duration: 150 min (≈75 min delivery + 45 min Q&A + 30 min demos + 15 min breaks)
emphasis:
  - agentic foundations
  - modes (Ask / Plan / Agent / Autopilot)
  - Copilot CLI deep dive
  - MCP
  - Skills
  - Hooks
  - Customization (instructions, prompts, AGENTS.md)
  - Advanced custom agents + GitHub Actions orchestration
de_emphasis:
  - historical evolution (brief only)
  - data security & privacy (concise ~5 slides)
  - enterprise admin controls (concise ~5 slides)
structural_preferences:
  - open with title → agenda → why this matters
  - generic 🎬 demo placeholder slide at the end of each main section
  - insert 2 break slides (~60 min and ~120 min)
  - close with practical tips → resources → Q&A
  - NO hands-on exercises
  - explicit CLI-vs-VS-Code callouts on every relevant topic
source_files:
  - research/2026-04-21-agentic-foundations.md
  - research/2026-04-21-copilot-history.md
  - research/2026-04-21-copilot-surfaces.md
  - research/2026-04-21-copilot-modes.md
  - research/2026-04-21-model-variety.md
  - research/2026-04-21-copilot-cli.md
  - research/2026-04-21-copilot-customization.md
  - research/2026-04-21-copilot-mcp.md
  - research/2026-04-21-copilot-skills.md
  - research/2026-04-21-copilot-hooks.md
  - research/2026-04-21-copilot-advanced-agents.md
  - research/2026-04-21-copilot-security-privacy.md
  - research/2026-04-21-copilot-enterprise-admin.md
  - research/2026-04-22-copilot-surfaces-terminology.md
  - research/2026-04-22-agent-hq.md
  - research/2026-04-22-approvals-and-bypass.md
  - research/2026-04-22-cloud-agent-deep-dive.md
version: 5
created: 2026-04-21
revised: 2026-04-22
change_notes: |
  v5: Finished the appendix-only cost move — stripped premium-request /
  multiplier / quota wording from slides 25, 26, 31, 32, 33; slide 32 now
  carries the model-variety showcase only (prior content duplicated slide 95
  and has been removed from the main deck). Renamed slide 17 to
  "Pick three things each time: environment, mode, model". Renamed slide 53
  title to say "coding environment" instead of "surface". Slide 74 trimmed to
  a short section opener (trigger list lives only on slide 75); availability
  softened per the cloud-agent research (paid Copilot plans — see docs).
  Slide 78 gained a plain-English opener. Slide 80 split value proposition
  from rollout status (status moved to speaker notes).
---

# Presentation Outline

**Target: ~96 slides · 150 min (75 min delivery · 45 min Q&A · 30 min demos · 15 min breaks)**

1. **Opening** — Title, agenda, why this matters
2. **A brief history: autocomplete → agents**
3. **Agentic foundations** — The concepts behind *every* modern coding agent (includes: "working with autonomous agents responsibly")
4. **Copilot coding environments** — Where Copilot runs today (GitHub's term: *coding environments*; informal shorthand previously "surfaces")
5. **Modes: Ask, Plan, Agent, Autopilot** — Choosing autonomy; `plan.md`; configuring approvals (CLI + VS Code); bypass-mode guardrails
6. **☕ Break 1**
7. **Models** — Multi-model product; model variety showcase; picking a model (cost/billing pushed to the Appendix)
8. **Copilot CLI deep dive** — Terminal-native agentic coding
9. **Customization** — Instructions, prompts, AGENTS.md
10. **MCP — Model Context Protocol** — The USB-C port for AI tools
11. **☕ Break 2**
12. **Skills** — Just-in-time expertise via `SKILL.md`
13. **Hooks** — Deterministic guardrails
14. **Advanced custom agents + GitHub Actions** — Multi-agent orchestration; Cloud Agent deep dive; Agent HQ
15. **Data security & privacy** — Concise
16. **Enterprise admin controls** — Concise
17. **Closing** — Practical tips, resources, Q&A
18. **Appendix** — Premium requests basics, cost tips (reference only)

> v4 revision notes: (a) Replaced informal "surface"/"surfaces" terminology with **coding environments**, the term used on GitHub's own install page (per `2026-04-22-copilot-surfaces-terminology.md`). (b) Added "working with autonomous agents responsibly" (spec-driven flow) to Agentic Foundations. (c) Added a dedicated `/memories/session/plan.md` slide in Modes. (d) Added three approvals slides — CLI config, VS Code config, and bypass-mode guardrails — per `2026-04-22-approvals-and-bypass.md`. (e) Added two Cloud Agent deep-dive slides (trigger entry points + models/guardrails) and expanded Agent HQ to two slides (what it is + value/status) per `2026-04-22-cloud-agent-deep-dive.md` and `2026-04-22-agent-hq.md`. (f) Pulled **all premium-request / cost / billing content out of the main deck** into a new Appendix; the old premium-requests slide was replaced by a model-variety showcase. (g) Removed third-party (Anthropic) quote from Slide 11 decision-tree and speaker notes where it could be restated in our own words. (h) Demo placeholders no longer say "Presenter fills this in live" — they read as demo markers only, with suggestions in speaker notes. (i) Spelled out **REPL** on the CLI opener; added `/clear` to the CLI slash-command list.

---

<!-- Slide 1 | Section: Opening | Type: title-slide -->

# GitHub Copilot
## From Autocomplete to Autonomous Agents

*A beginner's deep dive — April 2026*

**Speaker Notes:**
Welcome. We have 2.5 hours together. This deck assumes you have heard of GitHub Copilot but have not used it seriously. By the end, you will understand every major Copilot feature — modes, CLI, MCP, Skills, Hooks, custom agents — and how to pick the right one for a task. Plan for two breaks, several demos, and extended Q&A.

Sources: general knowledge (presentation framing)

---

<!-- Slide 2 | Section: Opening | Type: list -->

# Agenda — 6 big themes

1. **How we got here** — 5 years of Copilot in 5 minutes
2. **Agentic foundations** — what an AI agent actually *is*
3. **Coding environments + modes** — where Copilot runs and how it behaves
4. **The CLI deep dive** — terminal-native agentic coding
5. **Customization: instructions, MCP, Skills, Hooks, custom agents**
6. **Governance** — security, privacy, enterprise admin

Two breaks. Demos at the end of each major section.

**Speaker Notes:**
Most of our time sits in themes 3–5 because that's where practitioners live. We will only spend about 5 minutes each on security/privacy and enterprise admin — enough to point you to the right docs. By the end of the day you should be able to answer "should I use Plan or Agent here?" and "where does an MCP server config live?" without looking it up.

Sources: general knowledge (agenda structure)

---

<!-- Slide 3 | Section: Opening | Type: single-point -->

# Why this matters in 2026

Copilot stopped being "autocomplete" years ago. It is now a **platform of agents** — in your editor, your terminal, and on GitHub itself.

If you only know the 2022 version, you are missing a large and growing share of what it can do.

**Speaker Notes:**
Set the stakes: a developer who has not looked at Copilot since the original Codex ghost-text days will be surprised at what "assigning an issue to Copilot" means today. That expansion — autocomplete → chat → multi-file edit → agent → cloud agent → Agent HQ — is literally the spine of this talk. (Previous draft quoted a "~80%" figure; that was rhetorical, not sourced, so we've softened it.)

Sources: research/2026-04-21-copilot-history.md

---

<!-- Slide 4 | Section: History | Type: diagram -->

# A brief history: the capability arc

```
  2021          2023          2025-Feb       2025-May       2025-Oct
    │             │               │              │               │
    ▼             ▼               ▼              ▼               ▼
 Autocomplete → Chat → Multi-file edits → Agent mode → Cloud agent → Agent HQ
 (Codex)      (GPT-4)  (Copilot Edits)   (local,     (async,       (multi-
                                          your box)   on GHA)       vendor)
```

**Speaker Notes:**
Short section — spend maybe 5 minutes total on history. This is the spine: every later section of today's talk is a point on this arc. Each jump meaningfully expanded what Copilot could do on your behalf (exact magnitude is hard to quantify; the history research flags vendor-framing claims as needing care, so paraphrase rather than quote).

Sources: research/2026-04-21-copilot-history.md

---

<!-- Slide 5 | Section: History | Type: list -->

# The four inflection points

- **2021** — Technical preview, OpenAI Codex, VS Code only, inline ghost text
- **2023** — Copilot Chat GA; Copilot for Business; GPT-4
- **2024** — Multi-model choice (Claude, Gemini, OpenAI); Copilot Free; Extensions
- **2025** — *The year of agents.* Agent mode (Feb), cloud coding agent (May, GA Sep), Agent HQ (Oct)

**Speaker Notes:**
Paraphrase vendor framing ("re-founded on Copilot", "agent awakens") rather than quoting verbatim. The key point: 2025 was when the product stopped being a sidecar and became a delegation target. One current context note: on April 20, 2026 GitHub paused new sign-ups for Pro/Pro+/Student plans and tightened weekly limits — we'll see that banner in docs throughout.

Sources: research/2026-04-21-copilot-history.md, research/2026-04-21-copilot-modes.md

---

<!-- Slide 6 | Section: Agentic Foundations | Type: comparison -->

# Agentic foundations: Plain LLM vs Chatbot vs Agent

| System | Loop? | Acts on the world? |
|---|---|---|
| **Plain LLM call** — one prompt → one completion | No | No |
| **Chatbot** — multi-turn, still prompt → text each turn | No (per-turn only) | No (unless tools) |
| **Agent** — takes a goal, plans, uses tools, iterates | **Yes** | **Yes, via tools** |

**Speaker Notes:**
We deliberately start vendor-neutral. Before we open VS Code, you need a mental model that explains why Copilot, Cursor, Claude Code, and Devin all look different but feel the same. This is the longest conceptual section — ~10 minutes. Everything Copilot does in "agent mode" or "cloud agent" lives in the bottom row; the top two rows are what Copilot was in 2022–2023.

Sources: research/2026-04-21-agentic-foundations.md

---

<!-- Slide 7 | Section: Agentic Foundations | Type: diagram -->

# The agentic loop — Think · Act · Observe

```
        ┌──────────────────────────────────────┐
        │                                      │
        ▼                                      │
  ┌──────────┐   ┌──────────┐   ┌──────────┐   │
  │ PERCEIVE │──▶│  REASON  │──▶│   ACT    │   │
  │  (goal,  │   │  (LLM    │   │  (call   │   │
  │  context)│   │  plans)  │   │  tool)   │   │
  └──────────┘   └──────────┘   └────┬─────┘   │
        ▲                             │         │
        │                             ▼         │
        │                      ┌──────────┐     │
        └──────────────────────│ OBSERVE  │─────┘
                               │ (result) │
                               └──────────┘
       (repeat until done, stopped, or max steps)
```

**Speaker Notes:**
Memorize this. Every agent you'll see today — Copilot agent mode, the CLI, the cloud agent, a custom agent, even GitHub Actions workflows — is some shape of this loop. The "tools" in Copilot's case are things like `read_file`, `run_in_terminal`, `edit`, MCP tools, and so on.

Sources: research/2026-04-21-agentic-foundations.md

---

<!-- Slide 8 | Section: Agentic Foundations | Type: list -->

# Five building blocks

1. **LLM** — the "brain" that decides what to do next
2. **Tools** — typed functions: read, write, run shell, call API
3. **Memory** — short-term (conversation) + long-term (retrieval, reflection)
4. **Planning** — decomposing goals into subgoals
5. **Reflection** — self-critique that improves the next attempt

**Speaker Notes:**
Every product in this space advertises these in some form. Copilot has all five: the model picker (LLM), built-in + MCP tools, `/memories/session/plan.md` and vector retrieval (memory), Plan agent (planning), and the `evaluator-optimizer` patterns we'll see in advanced agents (reflection).

Sources: research/2026-04-21-agentic-foundations.md

---

<!-- Slide 9 | Section: Agentic Foundations | Type: code-example -->

# What a tool call looks like (conceptually)

```python
# The LLM produces structured output, not free text:
{
  "tool": "run_in_terminal",
  "args": {"command": "npm test"}
}

# Your runtime executes it and feeds the result back in:
{
  "role": "tool",
  "tool_call_id": "...",
  "content": "15 passed, 2 failed. FAIL src/auth.test.ts..."
}
```

The LLM then reads the result and decides what to do next. That "feed the result back in" step is the **Observe** in Think→Act→Observe.

**Speaker Notes:**
This is the mechanical substrate. Under the hood, every "agent" is a `while (model_wants_to_call_tool): call_tool(); feed_result_back()` loop. When you add a Skill or an MCP server, you are adding entries to the tool catalog the model sees.

Sources: research/2026-04-21-agentic-foundations.md

---

<!-- Slide 10 | Section: Agentic Foundations | Type: boxes -->

# Common agent patterns

┌─────────────────────────┬─────────────────────────┐
│ **ReAct**               │ **Plan-and-Execute**    │
│ Interleave reasoning    │ Plan everything first,  │
│ and action, one step    │ then execute; re-plan   │
│ at a time               │ if reality drifts       │
├─────────────────────────┼─────────────────────────┤
│ **Reflexion**           │ **Orchestrator-Workers**│
│ Verbal self-critique    │ One agent delegates to  │
│ stored between trials   │ specialized sub-agents  │
└─────────────────────────┴─────────────────────────┘

**Speaker Notes:**
Map to Copilot: the default Agent is ReAct-ish. Plan mode is Plan-and-Execute. The CLI `/fleet` command is Orchestrator-Workers. Reflexion shows up when agents loop on test failures.

Sources: research/2026-04-21-agentic-foundations.md

---

<!-- Slide 11 | Section: Agentic Foundations | Type: decision-tree -->

# When should I use an agent?

```
Is the task one-shot & well-defined?
 ├─ Yes → Plain LLM call / autocomplete.  DONE.
 └─ No ↓

Can you enumerate the steps up front?
 ├─ Yes → Prompt chain / workflow.  DONE.
 └─ No ↓

Do steps depend on what you discover at runtime?
 ├─ Yes → **Single agent (ReAct / tool-calling loop).**
 └─ No  → Go back one box.

Does the task have parallel specialized pieces?
 └─ Yes → Multi-agent / orchestrator-workers.
```

Rule of thumb: reach for the simplest shape that fits, and add complexity only when the task demands it.

**Speaker Notes:**
This ladder is the single most important decision in practice. Most developers over-reach for "agent mode" on tasks that would be faster and cheaper as Ask + manual Apply.

Sources: research/2026-04-21-agentic-foundations.md

---

<!-- Slide 12 | Section: Agentic Foundations | Type: single-point -->

# The compound-error problem

If each step is 95% reliable, **10 steps → 60%, 100 steps → 0.6%.**

This is why agents need: strong per-step models · good tool design · reflection · stopping conditions · human checkpoints.

**Speaker Notes:**
Huyen's framing. Explains why "just let it run for 1,000 steps" is a terrible strategy and why autopilot still needs guardrails. It also motivates everything in our Hooks and customization sections later.

Sources: research/2026-04-21-agentic-foundations.md

---

<!-- Slide 13 | Section: Agentic Foundations | Type: diagram -->

# The autonomy spectrum

```
Suggest → Approve-each-step → Approve-at-checkpoints → Autonomous-in-sandbox → Fully autonomous
(ghost    (agent w/ Default    (agent w/ Autopilot     (cloud agent on         (rare; high-
 text)     Approvals)           in IDE)                  GitHub Actions)         trust CI)

    less autonomy ──────────────────────────────────────────────────► more autonomy
    less risk   ────────────────────────────────────────────────────► more risk
```

**Speaker Notes:**
Remember this diagram — we will literally revisit each point when we discuss modes. Copilot exposes knobs for every level. Beginners should start on the left and earn their way right.

Sources: research/2026-04-21-agentic-foundations.md

---

<!-- Slide 14 | Section: Agentic Foundations | Type: list -->

# Working with autonomous agents responsibly

Before you turn an agent loose, spend a few minutes on the basics.

1. **Research** — understand the codebase, the constraint, and what already exists.

2. **Define the task & objective** — what is "done"? What does success look like?

3. **Define the plan & approach** — break the work into steps the agent (and you) can verify.

4. **Set up tests & guardrails** — what proves the change is correct? What must never happen?

5. **Design the workflow** — where does a human review? Where is the agent on its own?

"Spec-driven" workflows turn an agent from a wish into a specification.

**Speaker Notes:**
The compound-error slide you just saw is exactly why this matters: the best way to beat 0.6% reliability at 100 steps is to make each step smaller, checkable, and bounded. Plan mode (coming up) is Copilot's built-in way to do step 3; Hooks (much later) are one way to enforce step 4. Beginner framing: an agent is a junior teammate — you wouldn't hand one a vague ticket with no acceptance criteria and walk away; don't do it to an agent either.

Sources: research/2026-04-21-agentic-foundations.md

---

<!-- Slide 15 | Section: Agentic Foundations | Type: demo-placeholder -->

# 🎬 Demo: Agentic Foundations

**Speaker Notes:**
Suggested demo: show a minimal Python ReAct loop, or walk the audience through a Copilot agent-mode session highlighting Think / Act / Observe in the trace.

Sources: research/2026-04-21-agentic-foundations.md

---

<!-- Slide 16 | Section: Coding Environments | Type: boxes -->

# Copilot coding environments — five families + where each shines

| Family | Coding environment(s) | Optimized for |
|---|---|---|
| **IDEs** | VS Code (flagship), Visual Studio, JetBrains, Xcode, Eclipse, Neovim | In-flow writing; richest agent features (VS Code) |
| **Terminal** | Copilot CLI (`copilot`), Windows Terminal Canary chat | Scriptable, CI-friendly, terminal-native |
| **Web** | github.com Chat, PR / issue assist, code review | Async review, planning, delegating |
| **Mobile** | GitHub Mobile chat | Read-mostly chat, approvals on the go |
| **Cloud Agent** | Runs on GitHub Actions, opens PRs | "Assign an issue, get a PR" |

**Speaker Notes:**
Terminology note: GitHub itself does not use "surface" in its official docs. The install page calls these *coding environments* ("Installing the GitHub Copilot extension in your environment … your preferred coding environment"); the Changelog taxonomy calls them *client apps*. We'll say **coding environments** throughout today. All five families share one subscription and one pool of models — but they expose **different subsets of modes** and different config locations. We unpack the mode subset next, and the config differences throughout the rest of the day. Per the customization/hooks research, these environments share *concepts* (instructions, MCP, skills, hooks) but not identical *config locations or support* — we'll be precise about those differences as they come up.

Sources: research/2026-04-21-copilot-surfaces.md, research/2026-04-22-copilot-surfaces-terminology.md

---

<!-- Slide 17 | Section: Coding Environments | Type: single-point -->

# Pick three things each time: environment, mode, model

**(1) Where you type** (editor · terminal · browser · phone)

**× (2) Which mode you pick** (completion · ask · plan · agent · cloud agent)

**× (3) Which model** (GPT-5.x · Claude · Gemini · Grok · …)

Three orthogonal choices. Confusing the first two is the #1 beginner mistake.

**Speaker Notes:**
"Agent mode in VS Code" ≠ "Copilot Cloud Agent" — they both run agents, but one is on your laptop and one is on a GHA runner. We'll dedicate a whole slide to that distinction later.

Sources: research/2026-04-21-copilot-surfaces.md, research/2026-04-21-copilot-modes.md

---

<!-- Slide 18 | Section: Coding Environments | Type: demo-placeholder -->

# 🎬 Demo: Coding Environments Tour

**Speaker Notes:**
Suggested demo: flip quickly between VS Code Chat, the `copilot` CLI, and github.com Copilot Chat to show "same subscription, same model picker, different UX."

Sources: research/2026-04-21-copilot-surfaces.md

---

<!-- Slide 19 | Section: Modes | Type: diagram -->

# Modes: a VS Code chat session = 3 independent choices

```
┌───────────────────────────────────────────────────────────┐
│  1. Agent Target  (WHERE it runs)                         │
│       Local │ Copilot CLI │ Cloud │ Third-party           │
│                                                           │
│  2. Agent  (WHICH persona)                                │
│       Agent │ Plan │ Ask │ <your .agent.md>               │
│                                                           │
│  3. Permission Level  (HOW MUCH autonomy)                 │
│       Default Approvals │ Bypass │ Autopilot (Preview)    │
│                                                           │
│  (+ Language model picker — orthogonal to all three)      │
└───────────────────────────────────────────────────────────┘
```

**Speaker Notes:**
This is the most confusing part of Copilot for new users because terminology changed in 2025/2026. The word "mode" is being phased out — VS Code now calls these **agents**, but docs and users still say "mode." Both are fine. The crucial insight is that these three dropdowns are *independent*; Autopilot is a permission level, not a different kind of agent. Budget ~12 minutes for this section.

Sources: research/2026-04-21-copilot-modes.md

---

<!-- Slide 20 | Section: Modes | Type: boxes -->

# The three built-in personas

┌────────────────────┬────────────────────┬────────────────────┐
│  **Ask**           │  **Plan**          │  **Agent**         │
│  Q&A, no edits.    │  Research & write  │  Autonomous: edits │
│  "Apply in Editor" │  a structured      │  files, runs cmds, │
│  is manual.        │  plan. Hands off.  │  self-corrects.    │
│                    │  No code changes.  │  Multi-file.       │
│  Cheapest, safest. │  `/plan <task>`    │  Default for work. │
└────────────────────┴────────────────────┴────────────────────┘

**Edit** mode is **deprecated** — its behavior folded into Agent. You can un-hide it with `chat.editMode.hidden`.

**Speaker Notes:**
Plan is the under-used hero. For anything touching more than one file, having Plan produce a checklist *before* Agent implements it drastically improves outcomes. The plan itself lives in a session file — next slide.

Sources: research/2026-04-21-copilot-modes.md

---

<!-- Slide 21 | Section: Modes | Type: single-point -->

# Plan mode's output — `/memories/session/plan.md`

When you enter Plan mode, Copilot creates a plan file inside a per-session folder.

That file — `plan.md` — is the living source of truth for the work: what was researched, what will change, in what order.

You review and edit it before handing off to Agent mode for execution; it persists through the session so the agent keeps referring back to it.

**Speaker Notes:**
The reason Plan → Agent beats going straight to Agent: the plan is *written down*. You can correct bad assumptions before any code is edited. Tell attendees: open it, read it, fix it, *then* hit Agent. The file lives under Copilot's session memory area (`/memories/session/`), which is also why re-entering Plan mode in the same session picks up where you left off.

Sources: research/2026-04-21-agentic-foundations.md, research/2026-04-21-copilot-modes.md

---

<!-- Slide 22 | Section: Modes | Type: comparison -->

# Permission levels

| Level | Behavior | Use when |
|---|---|---|
| **Default Approvals** | Asks before every terminal cmd & sensitive edit | Learning, unfamiliar repos, destructive tasks |
| **Bypass Approvals** | No per-step prompt; still respects guardrails | Trusted, well-tested workflows |
| **Autopilot (Preview)** | Agent runs uninterrupted; auto-answers clarifying Qs | Long routine jobs you'd otherwise babysit |

**Speaker Notes:**
Most beginners should live on Default Approvals for a month. Tie this back to the autonomy spectrum slide. Verbally: Autopilot is not a fourth "mode" — it's a permission tier, the same Agent persona with the per-step handbrake off.

Sources: research/2026-04-21-copilot-modes.md

---

<!-- Slide 23 | Section: Modes | Type: code-example -->

# Configuring approvals — Copilot CLI

Approve or deny individual tools, commands, paths, and URLs from flags, slash commands, or config files.

```bash
# Flags — precedence: --deny-tool > --allow-tool > --allow-all-tools
copilot --allow-tool='shell(git:*)' \
        --allow-tool='write' \
        --allow-tool='MyMCP(create_issue)' \
        --deny-tool='shell(rm)' \
        --deny-tool='shell(git push)'

# In-session slash commands
/allow-all              # or /yolo — enable all for this session (does not toggle off)
/reset-allowed-tools    # revoke everything granted this session
/add-dir /path/to/dir   # extend file-access scope
/list-dirs              # show trusted directories
```

Settings cascade: user `~/.copilot/config.json` → repo `.github/copilot/settings.json` → personal `.github/copilot/settings.local.json`.

**Speaker Notes:**
Pattern syntax is `Kind(argument)`: `shell(git:*)` matches `git push` / `git pull` but not `gitea`; `write`, `read`, `url(github.com)`, and `MyMCP(tool)` follow the same shape. Keep denies narrow and specific; rely on them to survive `--allow-all`. `/reset-allowed-tools` is the panic button at the start of a sensitive task.

Sources: research/2026-04-22-approvals-and-bypass.md

---

<!-- Slide 24 | Section: Modes | Type: code-example -->

# Configuring approvals — VS Code

Three permission tiers in the chat picker: **Default Approvals · Bypass Approvals · Autopilot (Preview)**.

```jsonc
// .vscode/settings.json or user settings
{
  // Which terminal commands auto-approve; false = always prompt
  "chat.tools.terminal.autoApprove": {
    "ls": true, "mkdir": true, "npm install": true,
    "/^git (status|show\\b.*)$/": true,
    "rm": false, "del": false
  },

  // Protect sensitive files from silent edits
  "chat.tools.edits.autoApprove": {
    "**/.env": false, "**/secrets.*": false
  },

  // Global kill-switch for approval prompts (org-manageable)
  "chat.tools.global.autoApprove": false,

  // Default permission level for new sessions
  "chat.permissions.default": "default"
}
```

**Speaker Notes:**
`Chat: Manage Tool Approval` in the Command Palette is the central UI. Patterns wrapped in `/.../` are regex. `Default` is the sane starting point; only flip to `bypass` or `autopilot` once you have the guardrails on the next slide in place. Keep auto-approvals session-scoped where possible, per GitHub's own security baseline.

Sources: research/2026-04-22-approvals-and-bypass.md

---

<!-- Slide 25 | Section: Modes | Type: list -->

# Bypass mode — what still protects you

Even with `--allow-all` / `/yolo` / Bypass Approvals / Autopilot, these guardrails still apply:

- **Deny rules win** — `--deny-tool` and `--deny-url` take precedence over any allow, including `--allow-all`.

- **Workspace Trust / Restricted mode** (VS Code) disables agents entirely in untrusted folders.

- **Agent sandboxing** (VS Code, Preview) enforces file and network boundaries at the OS level — independent of approvals.

- **CLI `preToolUse` hooks** fire on every tool call and can deny before execution. (`permissionRequest` hooks do **not** reliably fire under `--allow-all`, so `preToolUse` is the one to rely on.)

- **Enterprise policies** — `ChatToolsAutoApprove`, `ChatToolsTerminalEnableAutoApprove`, and `ChatAgentMode` can hide or disable bypass org-wide.

GitHub's own guidance:the CLI docs **strongly recommend only using `--allow-all` / `--yolo` in an isolated environment**; VS Code warns users to only enable Bypass or Autopilot if they understand the security implications, and to consider agent sandboxing or a container in high-risk / prompt-injection scenarios.

**Speaker Notes:**
This is the "what bypass is and isn't" reality check. Bypass removes the per-step prompt; it does not turn the machine into a sandbox — anything the agent runs still runs with your user privileges. If prompt injection is on the table (e.g., the agent browses untrusted web content), the VS Code docs are explicit: use sandboxing or a container. And remind attendees that auto-approval in VS Code is "best effort" — quote concatenation and similar tricks can subvert regex allowlists.

Sources: research/2026-04-22-approvals-and-bypass.md

---

<!-- Slide 26 | Section: Modes | Type: comparison -->

# In-IDE Agent vs Copilot Cloud Agent — do not confuse these

| | **In-IDE Agent** (VS Code) | **Cloud Agent** (github.com) |
|---|---|---|
| Runs on | Your laptop | GitHub-hosted Actions runner |
| You see it | Real-time, in chat panel | Async, as commits on a draft PR |
| Triggered by | You, in chat | Assign issue, `@copilot` mention, Agents tab, CLI `/delegate` |
| Output | Edits in your open workspace | A pull request |

**Speaker Notes:**
This slide alone will prevent half the confusion you will run into at work. Cloud agent is the former "Copilot coding agent" / Project Padawan. Billing differences (per-prompt vs per-session) live in the appendix.

Sources: research/2026-04-21-copilot-modes.md, research/2026-04-21-copilot-advanced-agents.md

---

<!-- Slide 27 | Section: Modes | Type: decision-tree -->

# Which mode should I pick?

```
Need to understand something, no edits?         → Ask
Want a plan before code changes?                → Plan → hand off to Agent
Multi-file implementation, you're watching?     → Agent (Default Approvals)
Routine, trusted job, want to walk away?        → Agent + Autopilot
Want it done while you work on something else?  → Copilot CLI (local)  OR
                                                  Cloud agent (on GHA, PR)
```

**Speaker Notes:**
Post this as a cheat sheet. The Plan → Agent handoff is the single best habit to build.

Sources: research/2026-04-21-copilot-modes.md

---

<!-- Slide 28 | Section: Modes | Type: single-point -->

# CLI vs VS Code — mode differences

**CLI** exposes the same conceptual modes with different names: **ask/execute** (default), **plan mode**, and **autopilot** — cycled with `Shift+Tab` or set via `--mode / --plan / --autopilot` flags.

Plan mode and Autopilot exist in both places. **Ask-style "no edits"** on the CLI is approximated with `/ask` (one-off) or by declining tool approvals.

**Speaker Notes:**
Emphasized per the cross-cutting directive: modes exist in both surfaces but the *UX* differs. CLI leans keyboard-driven and session-persistent; VS Code is dropdown-driven. We'll see concrete CLI ergonomics in the CLI deep-dive.

Sources: research/2026-04-21-copilot-cli.md, research/2026-04-21-copilot-modes.md

---

<!-- Slide 29 | Section: Modes | Type: demo-placeholder -->

# 🎬 Demo: Modes

**Speaker Notes:**
Suggested demo: take one task and show it in Ask → Plan → Agent successively; open the `plan.md` between Plan and Agent; then show the Autopilot toggle and a `/delegate` handoff to the Cloud Agent.

Sources: research/2026-04-21-copilot-modes.md

---

<!-- Slide 30 | Section: Break | Type: single-point -->

# ☕ Break 1 — 10 minutes

See you back here at [time].

Next up: models, the CLI deep-dive, and all the customization layers.

**Speaker Notes:**
We're roughly at the 60-minute mark. After the break the pace picks up: CLI + customization + MCP is where most of the practitioner value lives.

Sources: general knowledge (break slide)

---

<!-- Slide 31 | Section: Models | Type: single-point -->

# Copilot is a *multi-model* product

Around 22 models from **OpenAI · Anthropic · Google · xAI · GitHub-tuned**, plus **Auto** and **BYOK** (Bring Your Own Key — point Copilot at your own provider credentials).

You pick from a dropdown. Different models are optimized for speed, reasoning, coding, or multimodal input.

**Speaker Notes:**
~8 minutes on this section. Beginners don't need to memorize the lineup; they need a mental map of *families* and a rule of thumb for fit-for-task. Cost, quotas, and premium-request accounting are intentionally out of scope here — the appendix covers them. Name-dropping depth for the curious: GPT-4.1 / 4o / 5.x, Claude Haiku / Sonnet / Opus 4.x, Gemini 2.5 / 3.x, Grok Code Fast 1, plus GitHub's Raptor mini and Goldeneye previews. First definition of **BYOK** lands here; we'll revisit it in the CLI deep-dive and the data-path slide later.

Sources: research/2026-04-21-model-variety.md

---

<!-- Slide 32 | Section: Models | Type: boxes -->

# Model variety — the families on offer

┌────────────────────────────────────┬────────────────────────────────────┐
│ **OpenAI (GPT family)**            │ **Anthropic (Claude family)**      │
│ GPT-5.x · GPT-5.2-Codex            │ Claude Sonnet 4.5 / 4.6            │
│ GPT-5 mini · GPT-5.4 nano          │ Claude Opus 4.5 / 4.6 / 4.7        │
│ GPT-4.1 · GPT-4o                   │ Claude Haiku 4.5                   │
├────────────────────────────────────┼────────────────────────────────────┤
│ **Google (Gemini family)**         │ **xAI (Grok family)**              │
│ Gemini 2.5 · Gemini 3.1 Pro        │ Grok Code Fast 1                   │
├────────────────────────────────────┼────────────────────────────────────┤
│ **GitHub-tuned (previews)**        │ **Auto + BYOK**                    │
│ Raptor mini · Goldeneye            │ Auto = best-fit picker             │
│                                    │ BYOK = your own provider key       │
└────────────────────────────────────┴────────────────────────────────────┘

Flagships for agentic coding in 2026: **Claude Sonnet 4.5/4.6**, **Opus 4.7**, **GPT-5.x / GPT-5.2-Codex**, **Gemini 3.1 Pro**.

**Speaker Notes:**
The point of this slide is richness, not completeness. GitHub is deliberately multi-vendor — that's the unique structural choice of the product. Group by provider to give attendees a mental handle; almost every model name they'll encounter slots into one of these families. Lineup shifts weekly; don't commit the exact names to memory.

Sources: research/2026-04-21-model-variety.md, research/2026-04-22-cloud-agent-deep-dive.md

---

<!-- Slide 33 | Section: Models | Type: decision-tree -->

# Which model should I pick?

```
Default?                          ──►  Auto  (picks a healthy model for you)

Quick edits / autocomplete feel?  ──►  GPT-4.1, GPT-4o, GPT-5 mini, Haiku 4.5

Hard reasoning / agentic work?    ──►  GPT-5.x, Claude Sonnet 4.5/4.6,
                                       Claude Opus 4.7, Gemini 3.1 Pro

Speed above all else?             ──►  Haiku 4.5, Grok Code Fast 1,
                                       GPT-5.4 nano

Multimodal (images, screenshots)? ──►  GPT-4o, Claude Sonnet/Opus, Gemini
```

**Speaker Notes:**
"Auto for 80% of the work" is the beginner advice. The reasoning-vs-speed axis is the most useful distinction in day-to-day picking — it maps cleanly to "is this a debugging/architecting task, or a mechanical edit?" Cost considerations are deliberately out of this slide; they live in the Appendix so this decision stays about fit-for-task.

Sources: research/2026-04-21-model-variety.md

---

<!-- Slide 34 | Section: Models | Type: comparison -->

# CLI vs VS Code — model lineup nuances

| | **VS Code Chat** | **Copilot CLI** | **Cloud Agent** |
|---|---|---|---|
| Default | Auto | **Claude Sonnet 4.5** | Auto |
| Breadth | Broadest (all GA models) | Most GA models + Auto | **Only 4**: Auto, Sonnet 4.5, Opus 4.7, GPT-5.2-Codex |
| Select | Dropdown in chat | `/model` slash command or `--model` | Dropdown on agent launch |
| **BYOK** (Bring Your Own Key) | Manage Models → provider | Env vars: `COPILOT_PROVIDER_TYPE`, `COPILOT_PROVIDER_BASE_URL`, `COPILOT_PROVIDER_API_KEY`, `COPILOT_MODEL` | Enterprise "Custom models" only |

**Speaker Notes:**
Emphasized per directive. The cloud agent picker is deliberately narrow for reliability. CLI BYOK is env-var driven — great for local Ollama or Anthropic-direct use. (Terminology note: earlier drafts used "BYOM / Bring Your Own Model"; we've standardized on **BYOK = Bring Your Own Key** to match GitHub's docs, which emphasize the *key/credential* the customer brings.)

Concrete CLI BYOK example (local Ollama, OpenAI-compatible):

```bash
export COPILOT_PROVIDER_TYPE="openai"              # openai | azure | anthropic
export COPILOT_PROVIDER_BASE_URL="http://localhost:11434/v1"
export COPILOT_PROVIDER_API_KEY="not-needed-for-ollama"
export COPILOT_MODEL="llama3.1:70b"
copilot
```

Swap `TYPE=anthropic` + a real `API_KEY` to hit Anthropic directly; swap `TYPE=azure` + your Azure OpenAI resource URL for an enterprise endpoint. `COPILOT_MODEL` is also settable via `--model`.

Sources: research/2026-04-21-model-variety.md, research/2026-04-21-copilot-cli.md

---

<!-- Slide 35 | Section: Models | Type: demo-placeholder -->

# 🎬 Demo: Models

**Speaker Notes:**
Suggested demo: show the model picker in VS Code, `/model` in the CLI, and optionally point `COPILOT_MODEL` at a local Ollama via BYOK.

Sources: research/2026-04-21-model-variety.md

---

<!-- Slide 36 | Section: CLI | Type: single-point -->

# Copilot CLI — what it is (and isn't)

**`copilot`** — standalone agentic **REPL (Read-Eval-Print Loop)**, same agentic harness as the Cloud Agent, GitHub MCP pre-wired.

**Not `gh copilot`** — the old `gh copilot suggest/explain` extension was deprecated Oct 25, 2025. Different product.

**Speaker Notes:**
The meatiest product section — ~15 minutes. Public preview landed Sep 2025; by April 2026 it ships weekly and is production-ready for many workflows. The `gh copilot` naming collision is the #1 source of confusion. If someone types `gh copilot`, they're using the old thing.

Sources: research/2026-04-21-copilot-cli.md

---

<!-- Slide 37 | Section: CLI | Type: code-example -->

# Install & first launch

```bash
# Pick one installer (Node 22+ for npm):
npm install -g @github/copilot
brew install copilot-cli          # macOS/Linux
winget install GitHub.Copilot     # Windows

# cd into a project (not your home dir!), then:
cd ~/code/my-project
copilot                           # interactive REPL

# On first run:
#   1. "Trust this folder?"  → Yes
#   2. /login  → device-code OAuth
```

**Speaker Notes:**
Windows requires PowerShell 6+ (or WSL); plain cmd.exe is unsupported. On a dev box most people stick with npm.

Sources: research/2026-04-21-copilot-cli.md

---

<!-- Slide 38 | Section: CLI | Type: list -->

# Interactive essentials

- **Shift+Tab** — cycle modes (ask → plan → autopilot)
- **`!cmd`** — run shell directly (no model call)
- **`@path/to/file`** — attach file as context (Tab-completes)
- **`/model` · `/mcp` · `/usage` · `/resume` · `/clear`** — key slash commands (context & sessions)

**Speaker Notes:**
Live demo these. The `!` and `@` prefixes are what make the CLI feel native to a terminal power user. `/clear` wipes the current session's context (useful when you want to pivot to an unrelated task without starting a new process). Additional keys worth mentioning verbally but not putting on the slide: Enter sends a prompt; Esc stops a running operation; `/context` shows what's currently attached; `copilot --continue` resumes the last session; auto-compaction kicks in at 95% context with no user action required. Full slash-command list lives in `docs.github.com/en/copilot/reference/copilot-cli-reference`.

Sources: research/2026-04-21-copilot-cli.md

---

<!-- Slide 39 | Section: CLI | Type: code-example -->

# The permission model

When the agent wants a tool:
```
1. Yes
2. Yes, and approve TOOL for the rest of the session
3. No, and tell Copilot what to do differently  (Esc)
```

Pre-declare approvals on the command line:
```bash
copilot --allow-tool='shell(git)'            # allow any git
copilot --allow-tool='shell(git push)'       # allow only git push
copilot --allow-all-tools                    # aka --yolo
copilot --deny-tool='shell(rm)'              # block rm
```

**Precedence:** `--deny-tool` > `--allow-tool` > `--allow-all-tools`

**Speaker Notes:**
"Yolo mode" is literally an alias. Good hygiene: pair `--allow-all-tools` with explicit `--deny-tool` guards for the dangerous things.

Sources: research/2026-04-21-copilot-cli.md

---

<!-- Slide 40 | Section: CLI | Type: code-example -->

# Programmatic / scripted mode

```bash
# One-shot, tight permission scope
copilot -p "Show me this week's commits and summarize them" \
        --allow-tool='shell(git)'

# Full headless: fix failing tests, with guardrails
copilot -p "Run the test suite and fix any failing tests" \
        --allow-all-tools \
        --deny-tool='shell(rm)' \
        --deny-tool='shell(git push)'

# CI-friendly auth (fine-grained PAT w/ "Copilot Requests" permission)
export COPILOT_GITHUB_TOKEN="github_pat_..."
```

**Speaker Notes:**
This is how Copilot CLI ends up inside GitHub Actions jobs and pre-commit hooks. We'll see that pattern again in the advanced-agents section.

Sources: research/2026-04-21-copilot-cli.md, research/2026-04-21-copilot-advanced-agents.md

---

<!-- Slide 41 | Section: CLI | Type: boxes -->

# Built-in sub-agents

┌──────────────────┬──────────────────┐
│ **Explore**      │ **Task**         │
│ Quick codebase   │ Run tests/builds;│
│ Q&A w/o adding   │ terse on success,│
│ to main context  │ verbose on fail  │
├──────────────────┼──────────────────┤
│ **General-       │ **Code-review**  │
│  purpose**       │ Surfaces genuine │
│ Complex multi-   │ issues, minimizes│
│ step in its own  │ noise            │
│ context          │                  │
└──────────────────┴──────────────────┘

Plus **Research** (added in CLI 1.0.x) and any custom agents you define.

**Speaker Notes:**
The main agent delegates to these — you don't invoke them directly. `/fleet` parallelizes work across sub-agents; we'll cover that in the advanced section.

Sources: research/2026-04-21-copilot-cli.md, research/2026-04-21-copilot-advanced-agents.md

---

<!-- Slide 42 | Section: CLI | Type: comparison -->

# CLI vs VS Code — when to pick which

| Pick **CLI** when… | Pick **VS Code Agent** when… |
|---|---|
| You're already in the terminal | You want live diff review UI |
| Scripting / CI / cron | You want checkpoints & "undo turn" |
| You want long autonomous runs w/ autopilot | You need Plan → Agent handoff buttons |
| BYOK / local Ollama | You want the broadest model picker |
| Remote control from web/mobile | You want rich MCP-server management UI |

**Speaker Notes:**
Emphasized per directive. They're peers; most teams use both. The CLI is now the *closer* match to the cloud agent's runtime. (The BYOK row uses the standardized terminology from slide 26.)

Sources: research/2026-04-21-copilot-cli.md

---

<!-- Slide 43 | Section: CLI | Type: demo-placeholder -->

# 🎬 Demo: Copilot CLI

**Speaker Notes:**
Suggested demo: install + login + trusted folder, then one multi-step prompt (plan → autopilot); show `/usage`, `/context`, and `/clear`. Optionally pipe to a BYOK Ollama.

Sources: research/2026-04-21-copilot-cli.md

---

<!-- Slide 44 | Section: Customization | Type: boxes -->

# Customization: the four layers (higher = wins on conflict; all still sent)

┌─────────────────────┬─────────────────────┐
│ **1. Personal**     │ **2. Repository**   │
│ github.com/copilot  │ .github/copilot-    │
│ → Personal          │ instructions.md     │
│ instructions        │ + path-scoped       │
│                     │ .github/            │
│                     │ instructions/*      │
├─────────────────────┼─────────────────────┤
│ **3. Agent files**  │ **4. Org / Ent.**   │
│ AGENTS.md /         │ Org settings →      │
│ CLAUDE.md /         │ Copilot → Custom    │
│ GEMINI.md           │ instructions        │
│                     │ (Business/Ent.)     │
└─────────────────────┴─────────────────────┘

Plus **user-profile** layer (VS Code `~/.copilot/instructions/`, CLI `~/.copilot/copilot-instructions.md`). **All layers merge** — they are all sent to the model; numbering is the precedence order (1 > 2 > 3 > 4).

**Speaker Notes:**
~10 minutes on customization. All sets that apply *are* sent — nothing is dropped; the numbering only matters on direct conflict. Path-specific uses `applyTo:` glob frontmatter — powerful for monorepos. Conflicting rules across layers are the #1 beginner pitfall. This is the single slide to photograph.

Sources: research/2026-04-21-copilot-customization.md

---

<!-- Slide 45 | Section: Customization | Type: code-example -->

# A good `.github/copilot-instructions.md`

```markdown
# Project Overview
This is a TypeScript + React 18 app using Vite and Tailwind.

## Folder Structure
- `src/components/` — presentational React components (no state)
- `src/hooks/`      — custom hooks (one per file, named use*)
- `src/api/`        — fetch wrappers; always use `zod` for validation

## Coding Standards
- Prefer named exports; no default exports.
- All new code must include vitest tests next to the source file.
- Use `pnpm`, not `npm` or `yarn`.

## UI guidelines
- Use Tailwind utility classes; do not add new CSS files.
```

**Speaker Notes:**
Small, high-signal, stable. Large instruction files hurt more than they help. `/init` in VS Code Chat can bootstrap this from your codebase.

Sources: research/2026-04-21-copilot-customization.md

---

<!-- Slide 46 | Section: Customization | Type: comparison -->

# Instructions vs Prompt files

| | **Custom instructions** | **Prompt files (`*.prompt.md`)** |
|---|---|---|
| When used | *Automatic, always-on* | *Manual, on demand* |
| How invoked | Every chat turn | `/review-api`, `/scaffold-form`, … |
| Scope | "Rules about this repo/you/org" | "This specific reusable task" |
| Surface | All Copilot surfaces | IDEs only (VS Code, VS, JetBrains) |

**Speaker Notes:**
Rule of thumb: instructions = nouns ("this is Vue 3"), prompt files = verbs ("review this API for security issues").

Sources: research/2026-04-21-copilot-customization.md

---

<!-- Slide 47 | Section: Customization | Type: comparison -->

# CLI vs VS Code — customization nuances

| | **VS Code** | **Copilot CLI** |
|---|---|---|
| Repo instructions | `.github/copilot-instructions.md` ✓ | `.github/copilot-instructions.md` ✓ |
| User-level | `~/.copilot/instructions/*.instructions.md` (`chat.instructionsFilesLocations`) | `$HOME/.copilot/copilot-instructions.md` (+ `COPILOT_CUSTOM_INSTRUCTIONS_DIRS`) |
| Path-scoped | `.github/instructions/*.instructions.md` w/ `applyTo:` | Supported via same files |
| Prompt files | `*.prompt.md` (Chat view) | Not in CLI (use Skills instead) |
| Custom agents | `.github/agents/*.agent.md` + VS Code-only fields | `.github/agents/` + `~/.copilot/agents/` |

**Speaker Notes:**
Per directive. VS Code adds a prompt-file surface that CLI doesn't have; CLI has a broader env-var-driven customization search path. `AGENTS.md` works across both.

Sources: research/2026-04-21-copilot-customization.md

---

<!-- Slide 48 | Section: Customization | Type: single-point -->

# `AGENTS.md` — the cross-tool standard

A vendor-neutral `AGENTS.md` at the repo root (alongside `CLAUDE.md`, `GEMINI.md`) carries agent-style instructions recognized by Copilot, Claude Code, Codex, Gemini CLI, Cursor, and others.

**Use it when you want one instructions file to serve multiple AI coding tools.**

**Speaker Notes:**
New convention, rapidly standardizing. GitHub's precedence puts `AGENTS.md` below `copilot-instructions.md` but above org instructions — useful fallback content.

Sources: research/2026-04-21-copilot-customization.md

---

<!-- Slide 49 | Section: Customization | Type: demo-placeholder -->

# 🎬 Demo: Customization

**Speaker Notes:**
Suggested demo: run `/init` in VS Code, add a path-scoped `*.instructions.md`, show Copilot honoring it; contrast with `~/.copilot/copilot-instructions.md` in the CLI.

Sources: research/2026-04-21-copilot-customization.md

---

<!-- Slide 50 | Section: MCP | Type: single-point -->

# MCP — Model Context Protocol: why it exists

Before MCP: every AI app had its own plugin format → N × M integration pain.

After MCP: **one server works with every MCP-compatible client** — Copilot, Claude, Cursor, Windsurf, Zed, and more.

Analogy commonly used in the docs: MCP is a **USB-C port for AI applications** — one pluggable interface, many tools.

**Speaker Notes:**
~12 minutes on MCP. Open standard from Anthropic (Nov 2024), now Copilot's official way to add tools. This is the framing to remember: same cable, many devices.

Sources: research/2026-04-21-copilot-mcp.md

---

<!-- Slide 51 | Section: MCP | Type: diagram -->

# Host · Client · Server

```
┌──────────── Host (VS Code / CLI / Cloud Agent) ────────────┐
│                                                             │
│   ┌─ MCP Client A ─┐  ┌─ MCP Client B ─┐  ┌─ MCP Client C ─┐│
│   │ 1 per server;  │  │                 │  │                ││
│   │ negotiates     │  │                 │  │                ││
└───┤ capabilities   ├──┤                 ├──┤                ├┘
    │ (JSON-RPC 2.0) │  │                 │  │                │
    ▼                   ▼                    ▼
 stdio (local subprocess)  /  Streamable HTTP  (remote)
    │                   │                    │
    ▼                   ▼                    ▼
 Local MCP server   Remote MCP server    GitHub MCP server
 (Playwright,       (Sentry, Notion,     api.githubcopilot
  filesystem,…)      Atlassian,…)         .com/mcp/
```

**Speaker Notes:**
Key: the host has one client per server. Two transports — stdio for local, Streamable HTTP for remote. Capability negotiation happens at `initialize` time.

Sources: research/2026-04-21-copilot-mcp.md

---

<!-- Slide 52 | Section: MCP | Type: list -->

# What servers expose (3 primitives)

- **Tools** — executable functions the agent can call (file ops, API calls, DB queries)
- **Resources** — readable data sources (file contents, records, API responses)
- **Prompts** — reusable templates (system prompts, few-shots)

Discovery via `*/list`; retrieval via `tools/call`, `resources/read`, `prompts/get`.

⚠️ **In the Copilot cloud agent, only `tools` are supported.**

**Speaker Notes:**
VS Code and CLI support all three primitives; cloud agent is tools-only. That's an important cross-surface gotcha.

Sources: research/2026-04-21-copilot-mcp.md

---

<!-- Slide 53 | Section: MCP | Type: code-example -->

# Configure MCP — where each coding environment reads from

```jsonc
// VS Code — .vscode/mcp.json (workspace) or user settings
{
  "servers": {
    "playwright": { "command": "npx", "args": ["-y", "@playwright/mcp"] }
  }
}
```

```jsonc
// Copilot CLI — ~/.copilot/mcp-config.json
// (or /mcp add in-session, or --mcp-config flag)
{
  "mcpServers": {
    "sentry": { "url": "https://mcp.sentry.dev", "headers": {...} }
  }
}
```

```
# Cloud agent — repo Settings → Copilot → Coding agent → MCP configuration
# (stored as repository-scoped JSON, tools-only)
```

**Speaker Notes:**
Emphasized per directive. Three coding environments, three config locations — but the server definition shape is nearly identical. `/mcp add` in the CLI has an interactive form (Tab navigates, Ctrl+S saves).

Sources: research/2026-04-21-copilot-mcp.md

---

<!-- Slide 54 | Section: MCP | Type: single-point -->

# The built-in GitHub MCP server

Copilot ships pre-wired to `https://api.githubcopilot.com/mcp/` — exposing **GitHub Issues, PRs, repos, Actions, code security, code scanning** and more, grouped into *toolsets*.

"List my open PRs" · "Merge PR #123" just work out of the box.

**Speaker Notes:**
Toolsets let you widen/narrow what's callable. Dynamic toolsets let the model discover new tools mid-session.

Sources: research/2026-04-21-copilot-mcp.md

---

<!-- Slide 55 | Section: MCP | Type: list -->

# Permission model & the cloud-agent caveat

- **VS Code / CLI (interactive):** per-tool approval prompt; you can session-approve
- **Cloud agent (autonomous):** **no approval prompts** — GitHub *strongly recommends* allowlisting only read-only tools
- MCP servers run arbitrary code → treat them as **security-sensitive config** (see Hooks section for how to police this)
- Business/Enterprise: the "MCP servers in Copilot" policy must be enabled (disabled by default)

**Speaker Notes:**
This is the one slide security teams care about. The cloud agent's lack of approval prompts is by design — it's async — but it pushes the burden onto allowlists and hooks.

Sources: research/2026-04-21-copilot-mcp.md

---

<!-- Slide 56 | Section: MCP | Type: demo-placeholder -->

# 🎬 Demo: MCP

**Speaker Notes:**
Suggested demo: add the Playwright or Notion MCP server in VS Code, watch Copilot list its tools, then call one through agent mode; contrast with the CLI `/mcp add` flow.

Sources: research/2026-04-21-copilot-mcp.md

---

<!-- Slide 57 | Section: Break | Type: single-point -->

# ☕ Break 2 — 10 minutes

We'll come back to Skills, Hooks, and advanced multi-agent patterns.

**Speaker Notes:**
Roughly the 2-hour mark. After the break is the most advanced material of the day — it's where power users live.

Sources: general knowledge (break slide)

---

<!-- Slide 58 | Section: Skills | Type: single-point -->

# Skills — mind the terminology trap

The word "skills" in Copilot docs means **three different things**:

1. *"MCP skills"* — tools on the built-in GitHub MCP server (chat cheat sheet)
2. *`@github` "GitHub skills"* — a VS Code chat participant
3. **Agent Skills** ← **this is what we mean today** — folders with a `SKILL.md`

**Speaker Notes:**
~8 minutes. Open standard (Anthropic-led), shared with Claude Code/Codex/Cursor. Critical terminology note: when the audience googles "copilot skills" they will find all three. Only #3 is user-authorable `SKILL.md` folders.

Sources: research/2026-04-21-copilot-skills.md

---

<!-- Slide 59 | Section: Skills | Type: code-example -->

# Anatomy of a skill

```
my-skill/
├── SKILL.md              ← required
└── convert-svg-to-png.sh ← optional bundled scripts
```

```markdown
---
name: github-actions-failure-debugging
description: Guide for debugging failing GitHub Actions workflows.
             Use this when asked to debug failing GH Actions workflows.
---

To debug a failing workflow:
1. Use the `list_workflow_runs` tool to look up recent runs...
2. Use the `summarize_job_log_failures` tool to get an AI summary...
```

**Speaker Notes:**
The `description` is critical — it's what Copilot matches against the user's prompt. Always include a "Use this when…" clause.

Sources: research/2026-04-21-copilot-skills.md

---

<!-- Slide 60 | Section: Skills | Type: diagram -->

# How Copilot picks a skill

```
Session start
    │
    ▼
Scan: .github/skills/ · ~/.copilot/skills/ · plugins · COPILOT_SKILLS_DIRS · built-ins
    │
    ▼
Build catalog of (name, description) pairs   ← only metadata loaded
    │
You prompt: "debug the failing CI on PR #42"
    │
    ▼
Model matches "github-actions-failure-debugging" description
    │
    ▼
Built-in `skill` tool injects SKILL.md body into context
    │
    ▼
Copilot follows the steps (may run bundled scripts)
```

**Speaker Notes:**
Only descriptions load at session start; the body is injected on demand. That's how you can have dozens of skills without blowing context.

Sources: research/2026-04-21-copilot-skills.md

---

<!-- Slide 61 | Section: Skills | Type: comparison -->

# CLI vs VS Code — Skills support

| | **Copilot CLI** | **VS Code Agent** | **Cloud Agent** |
|---|---|---|---|
| Supported | ✅ full | ✅ (agent mode) | ✅ |
| Locations | `.github/skills/`, `~/.copilot/skills/`, `.claude/skills/`, `.agents/skills/`, plugins, `COPILOT_SKILLS_DIRS` | `.github/skills/` (+ related) | `.github/skills/` on default branch |
| Slash invoke | `/skill-name` ✅ | `/skill-name` ✅ | `/skill-name` in prompt |
| Slash mgmt | `/skills list / info / add / reload / remove` ✅ | via UI | — |

**Not supported:** Visual Studio, Eclipse, Xcode, regular GitHub.com chat. JetBrains: preview.

**Speaker Notes:**
Emphasized per directive. CLI has the richest management UX; VS Code handles it via the Chat agent-mode plumbing; other IDEs are not in scope yet.

Sources: research/2026-04-21-copilot-skills.md

---

<!-- Slide 62 | Section: Skills | Type: list -->

# Skills vs MCP vs custom agents vs instructions

- **Instructions** — *always-on rules.* "We use pnpm. Prefer named exports."
- **Prompt files** — *manual reusable tasks* (IDEs). "Scaffold me a React form."
- **Skills** — *just-in-time how-tos* loaded on relevance. "How to debug a failing GH Actions run."
- **MCP** — *new tools and data sources* the agent can call.
- **Custom agents** — *a persona* with its own tool allowlist, model, and prompt.

**Speaker Notes:**
This slide ties the customization surfaces together. Skills occupy the "specific expertise, load-on-demand, don't bloat context" niche.

Sources: research/2026-04-21-copilot-skills.md, research/2026-04-21-copilot-customization.md

---

<!-- Slide 63 | Section: Skills | Type: demo-placeholder -->

# 🎬 Demo: Skills

**Speaker Notes:**
Suggested demo: create a simple `~/.copilot/skills/release-notes/SKILL.md`, list via `/skills list`, invoke via `/release-notes`, then trigger automatically via a natural prompt.

Sources: research/2026-04-21-copilot-skills.md

---

<!-- Slide 64 | Section: Hooks | Type: single-point -->

# Hooks: Instructions *ask*. Skills *guide*. **Hooks *enforce*.**

A hook is a shell command the runtime runs at a lifecycle event. It can **block** an action before it happens — CLI-first, supported on CLI and cloud agent; **not** in the VS Code native extension.

**Speaker Notes:**
~8 minutes. Hooks are the single most powerful governance tool Copilot exposes to developers. The canonical positioning from GitHub's own docs. This matters to security and platform teams.

Sources: research/2026-04-21-copilot-hooks.md

---

<!-- Slide 65 | Section: Hooks | Type: table -->

# The 8 lifecycle events

| Event | When | Can block? |
|---|---|---|
| `sessionStart` | New session / resume | No |
| `sessionEnd` | Session completes | No |
| `userPromptSubmitted` | User submits a prompt | No |
| **`preToolUse`** | **Before** any tool call | **Yes** (emit `permissionDecision: "deny"`) |
| `postToolUse` | After a tool completes | No |
| `errorOccurred` | Error during execution | No |
| `agentStop` | Main agent finished | No |
| `subagentStop` | Subagent completes, before returning | No |

**Speaker Notes:**
`preToolUse` is the hero — the one that can actually deny a `rm -rf /`. Everything else is observability.

Sources: research/2026-04-21-copilot-hooks.md

---

<!-- Slide 66 | Section: Hooks | Type: code-example -->

# Shape of a hooks config

```jsonc
// .github/hooks/guardrails.json  (repo scope — works in CLI + cloud agent)
{
  "version": 1,
  "hooks": {
    "preToolUse": [
      {
        "type": "command",
        "bash": "./.github/hooks/block-rm.sh",
        "powershell": ".\\.github\\hooks\\block-rm.ps1",
        "timeoutSec": 10
      }
    ],
    "postToolUse": [
      { "type": "command", "bash": "./.github/hooks/audit.sh" }
    ]
  }
}
```

Runtime pipes a JSON event to stdin; hook can respond with JSON on stdout.

**Speaker Notes:**
Separate `bash` / `powershell` keys make hooks portable across OSes. Default timeout is 30s.

Sources: research/2026-04-21-copilot-hooks.md

---

<!-- Slide 67 | Section: Hooks | Type: code-example -->

# A `preToolUse` hook that blocks `rm -rf`

```bash
#!/usr/bin/env bash
# stdin: {"toolName":"bash","toolArgs":"{\"command\":\"rm -rf dist\", ...}"}
# toolArgs is a JSON-ENCODED STRING — parse again!

event=$(cat)
cmd=$(echo "$event" | jq -r '.toolArgs | fromjson | .command // ""')

case "$cmd" in
  *"rm -rf /"*|*"sudo rm "*|*"curl | bash"*)
    echo '{"permissionDecision":"deny","reason":"Destructive command blocked by policy"}'
    exit 0 ;;
esac
# empty output / exit 0 == allow
```

**Speaker Notes:**
Two gotchas: (1) `toolArgs` is a JSON *string* you must parse twice, (2) "empty response = allow" is the default. Keep hooks fast — they run synchronously and block the agent.

Sources: research/2026-04-21-copilot-hooks.md

---

<!-- Slide 68 | Section: Hooks | Type: comparison -->

# CLI vs VS Code vs Cloud — Hooks support

| | **Copilot CLI** | **Cloud agent** | **VS Code extension** |
|---|---|---|---|
| Supported | ✅ primary surface | ✅ (repo `.github/hooks/` on default branch) | ❌ **not listed** as a hook-supporting surface |
| Scopes | `~/.copilot/hooks/` + `.github/hooks/` | `.github/hooks/` only | — |
| Global disable | `disableAllHooks: true` in `~/.copilot/config.json` | — | — |
| Documented VS Code path | Run Copilot CLI **connected to VS Code**; the CLI's hooks then apply by normal CLI loading rules *(reasoned from the docs — not an explicit carve-out)* | | |

**Speaker Notes:**
Emphasized per directive. The VS Code extension's own agent does *not* evaluate hooks — this is an absence-of-evidence conclusion from the About hooks surface list and the Connecting-CLI-to-VS-Code page, which does not discuss hooks. The "CLI hooks apply when CLI is connected to VS Code" line is a reasoned interpretation in the hooks research (§6.4), not a directly quoted rule. Present it as "the documented path, with the caveat that GitHub hasn't explicitly carved this out in writing."

Sources: research/2026-04-21-copilot-hooks.md

---

<!-- Slide 69 | Section: Hooks | Type: list -->

# Real uses

- **Guardrails** — block `rm -rf /`, `sudo`, `curl | bash`, edits outside `src/`
- **Audit & compliance** — JSONL of every prompt + tool call, forwarded to SIEM
- **Cost & usage tracking** — per-tool metering CSVs
- **Policy banner** — "This repo is regulated; edits must pass review" at session start
- **Subagent validation** — test a subagent's output before it returns to the parent

**Speaker Notes:**
The guardrail + audit combo is what turns "my devs use Copilot" into "my security team signs off on Copilot."

Sources: research/2026-04-21-copilot-hooks.md

---

<!-- Slide 70 | Section: Hooks | Type: demo-placeholder -->

# 🎬 Demo: Hooks

**Speaker Notes:**
Suggested demo: drop a repo-scoped `preToolUse` hook that blocks `rm -rf`, show it denying an attempted deletion in a CLI session, then show a `postToolUse` audit log being written.

Sources: research/2026-04-21-copilot-hooks.md

---

<!-- Slide 71 | Section: Advanced Agents | Type: diagram -->

# Advanced custom agents: one profile, three runtimes

```
┌──────────────────────────────────────────────────────────────────┐
│                 Shared profile: .agent.md                        │
│   Repo: .github/agents/*.agent.md   Org: .github-private/agents/ │
└───────────┬──────────────────┬────────────────────┬─────────────┘
            │                  │                    │
      ┌─────▼─────┐      ┌─────▼─────┐      ┌───────▼────────┐
      │  VS Code  │      │ Copilot   │      │ Cloud Agent    │
      │  Chat /   │      │   CLI     │      │  (GH Actions   │
      │  Agent    │      │ /fleet    │      │   runner)      │
      │  handoffs │      │ autopilot │      │  Issues / PR   │
      └─────┬─────┘      └─────┬─────┘      └────────┬───────┘
            └────── Agent HQ / Mission Control ──────┘
                  (github.com, VS Code, Mobile)
```

**Speaker Notes:**
~12 minutes. Same `.agent.md` file, three behaviors. Environment-specific fields (e.g., `handoffs`, `hooks`) are ignored outside the runtime that supports them. This is the "how teams actually ship with Copilot in 2026" section.

Sources: research/2026-04-21-copilot-advanced-agents.md

---

<!-- Slide 72 | Section: Advanced Agents | Type: code-example -->

# `.agent.md` example

```markdown
---
name: readme-creator
description: Agent specializing in creating and improving README files
tools: [read, write, view, edit]
model: claude-sonnet-4.6
---

You are a documentation specialist focused on README files. Your scope
is limited to README files and related docs only — do not modify or
analyze code files.

Focus on:
- Clear project descriptions with logical sections
- Scannable headings and relative links to in-repo docs
- Appropriate badges and alt text on images
```

**Speaker Notes:**
Minimum: `name`, `description`, prompt body. Optional: `tools`, `model`, and (VS Code only) `handoffs:`, `agents:`, `hooks:`.

Sources: research/2026-04-21-copilot-advanced-agents.md

---

<!-- Slide 73 | Section: Advanced Agents | Type: comparison -->

# CLI vs VS Code — custom agent differences

| Feature | **VS Code** | **Copilot CLI** |
|---|---|---|
| Discover location | `.github/agents/` (+ user, workspace) | `.github/agents/` + `~/.copilot/agents/` |
| Invocation | Agent dropdown, `/agents`, `/create-agent` | `/agent`, `--agent` flag, or natural language |
| `handoffs:` buttons | ✅ VS Code-only | ❌ |
| `agents:` subagent declarations | ✅ | (uses built-in subagent model) |
| `/fleet` parallel orchestrator | ❌ | ✅ CLI-only |
| Scoped `hooks:` per agent (Preview) | ✅ | (repo-wide hooks instead) |

**Speaker Notes:**
Per directive. VS Code gets interactive UX (handoffs, buttons); CLI gets orchestration (`/fleet`) and raw power. Cloud agent consumes the same file but ignores UX-only fields.

Sources: research/2026-04-21-copilot-advanced-agents.md

---

<!-- Slide 74 | Section: Advanced Agents | Type: single-point -->

# The Cloud Agent — "assign an issue, get a PR"

An asynchronous agent that runs in a GitHub-hosted sandbox and delivers its work as a **draft pull request** for you to review.

**Availability:** paid Copilot plans — Pro, Pro+, Business, and Enterprise (see the Cloud Agent docs for the current per-plan list). Third-party agents (Claude, Codex) must be explicitly enabled per org.

**Speaker Notes:**
Short opener for this section — the trigger list lives on the next slide, and the guardrails slide after that. Historical note: this is Project Padawan / "Copilot coding agent" — GA since Sep 25, 2025. GitHub's current branding is **Cloud Agent**, which the concept docs now use consistently.

Sources: research/2026-04-21-copilot-surfaces.md, research/2026-04-21-copilot-advanced-agents.md, research/2026-04-22-cloud-agent-deep-dive.md

---

<!-- Slide 75 | Section: Advanced Agents | Type: list -->

# Cloud Agent deep dive — what it is + how to trigger

**Cloud Agent** (current branding; formerly "Copilot coding agent") is an async, PR-based agent that runs in an ephemeral GitHub Actions sandbox and delivers work as a **draft pull request**.

Trigger entry points, per the docs:

- **Issue assignment** — add `Copilot` as an assignee (the canonical flow).

- **`@copilot` mention** on an open pull request the agent already owns.

- **Agents panel / agents tab** on github.com (plus deep research + plan-then-iterate UI, github.com only).

- **Copilot CLI** — `/delegate <prompt>` or the `&` prefix shorthand.

- **IDE Copilot Chat** — VS Code, Visual Studio 2026, JetBrains, Eclipse (mention `@github` in the prompt).

- **GitHub Mobile, Raycast, `gh` CLI, any MCP-capable client**.

**Speaker Notes:**
The "session" is one invocation on a task; the draft PR is the communication surface. Every commit is authored by Copilot with the human who started the task as co-author, signed, and linked back to the session log. Once the PR is merged or closed, Copilot stops responding to mentions on it. Deep research / plan-then-iterate is github.com only — Jira / Linear / Slack integrations go straight to a PR with no planning pass.

Sources: research/2026-04-22-cloud-agent-deep-dive.md

---

<!-- Slide 76 | Section: Advanced Agents | Type: list -->

# Cloud Agent deep dive — models + guardrails

Model lineup where a picker is shown (Issue assignment, `@copilot` on a PR, agents panel, Mobile, Raycast):

- **Auto · Claude Sonnet 4.5 · Claude Opus 4.7 · GPT-5.2-Codex**

Where no picker is shown, Cloud Agent falls back to **Auto**.

Built-in guardrails:

- **Session timeout: 1 hour.** The ephemeral VM is torn down after.

- **Default-deny firewall** with a recommended allowlist (package registries, container registries, CA hosts). Blocked requests surface as warnings on the PR.

- **GitHub Actions do not auto-run** on Copilot's pushes by default — you click *Approve and run workflows*.

- **Permissions model** — Copilot can only push to branches it created; the user who kicked off the task cannot approve the resulting PR; existing rulesets, required reviews, and branch protections all apply.

**Speaker Notes:**
Two caveats worth calling out: (1) the firewall only covers processes started by the agent's Bash tool — it does **not** cover MCP servers or steps run in `copilot-setup-steps.yml`. (2) Image inputs are capped at 3 MiB. For governance teams: Cloud Agent is disabled by default at the enterprise level and must be turned on in AI Controls → Agents; third-party agents (Claude, Codex) are separately enabled per org.

Sources: research/2026-04-22-cloud-agent-deep-dive.md

---

<!-- Slide 77 | Section: Advanced Agents | Type: code-example -->

# Running Copilot CLI inside GitHub Actions

```yaml
# .github/workflows/copilot-triage.yml
name: Copilot Triage
on:
  issues:
    types: [opened]
jobs:
  triage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # Pin a known-good CLI version for reproducibility:
      - run: npm install -g @github/copilot@1.x    # or a specific x.y.z
      - run: |
          copilot -p "Read issue #${{ github.event.issue.number }},
                      add labels, and post a triage comment." \
                  --allow-tool='shell(gh)' \
                  --deny-tool='shell(rm)'
        env:
          COPILOT_GITHUB_TOKEN: ${{ secrets.COPILOT_TOKEN }}
```

**Speaker Notes:**
Same `copilot -p` pattern we saw in the CLI section, now in CI. **Version pinning recommendation:** pin `@github/copilot` to a major or specific version so CI jobs don't break on a weekly release. This is how teams build "AI teammates" around their repo.

Sources: research/2026-04-21-copilot-advanced-agents.md, research/2026-04-21-copilot-cli.md

---

<!-- Slide 78 | Section: Advanced Agents | Type: single-point -->

# `gh-aw` — GitHub Agentic Workflows

Write the workflow intent in Markdown; `gh-aw` compiles it into a safer GitHub Actions workflow for you.

A GitHub-Next extension (`gh-aw` = "gh agentic workflows") that lets you write agentic workflows as **Markdown + YAML frontmatter**, then compile them into regular GitHub Actions files.

Two features worth knowing by name:

- **Safe outputs** — sandboxed outputs the agent is allowed to emit (e.g., *"create an issue"*, *"post a comment"*) instead of arbitrary shell execution.

- **Agent Workflow Firewall** — a network allowlist for what the agent's runner can reach.

Pick your engine: Copilot · Claude · Codex · Gemini.

**Speaker Notes:**
Experimental but production-used at GitHub. The value prop: write the *intent* in Markdown, let `gh aw compile` produce a hardened Actions workflow with network + output restrictions baked in — so you don't have to hand-roll the security-sensitive parts.

Sources: research/2026-04-21-copilot-advanced-agents.md

---

<!-- Slide 79 | Section: Advanced Agents | Type: single-point -->

# What is Agent HQ

**Agent HQ** is GitHub's unified mission-control layer for orchestrating AI coding agents — Copilot plus third-party agents from **Anthropic, OpenAI, Google, Cognition, and xAI** — inside the normal GitHub flow.

Announced at **GitHub Universe 2025 (Oct 28, 2025)**. It's not a new SKU; it's a set of capabilities rolling out across the existing Copilot subscription.

> "Agent HQ transforms GitHub into an open ecosystem that unites every agent on a single platform."
> — GitHub Blog, *Introducing Agent HQ* (Kyle Daigle)

The user-facing surface is **mission control** — a consistent interface across **github.com, VS Code, GitHub Mobile, and Copilot CLI** for assigning, steering, and tracking agents.

**Speaker Notes:**
Mental model: mission control is to agents what pull requests are to code changes — the single place you review, steer, and merge their work. The agent still produces draft PRs, comments, and commits; Agent HQ doesn't invent a new artifact type. Beginners don't need to master this today; they need to know the direction of travel and where to look.

Sources: research/2026-04-22-agent-hq.md, research/2026-04-21-copilot-history.md

---

<!-- Slide 80 | Section: Advanced Agents | Type: list -->

# Why Agent HQ matters

- **Open ecosystem** — pick your agent per task (Copilot, Claude, Codex, …) without juggling separate subscriptions or dashboards.

- **Work on GitHub primitives** — agent output is draft PRs, issue comments, and commits; no new dashboard to learn.

- **Assign, steer, track from anywhere** — github.com, VS Code, GitHub Mobile, and Copilot CLI all speak the same mission control.

- **Enterprise governance** — AI Controls lets admins choose which agents and models are allowed, with audit logging.

**Speaker Notes:**
The friction Agent HQ targets is context-switching — the "different dashboard for each agent vendor" problem. The shift GitHub wants you to make is from babysitting one agent to orchestrating several in parallel: kicking off multiple tasks in minutes, reviewing drafts as they land.

**Current status (April 2026)** — share verbally as relevant:
- Mission control shipped Dec 2025.
- Claude (Anthropic) and Codex (OpenAI) are in public preview on Copilot Pro+ and Enterprise (Feb 4, 2026).
- Google, Cognition, and xAI were announced but not yet shipped at time of writing.
- Third-party agents are gated by subscription tier *and* by enterprise policy — flag this for any enterprise attendees.

Sources: research/2026-04-22-agent-hq.md

---

<!-- Slide 81 | Section: Advanced Agents | Type: demo-placeholder -->

# 🎬 Demo: Advanced Agents

**Speaker Notes:**
Suggested demo: drop a `.github/agents/reviewer.agent.md`, invoke it from VS Code with a handoff button, kick off a Cloud Agent session from an Issue, then show a `copilot -p` step running inside a GitHub Actions workflow.

Sources: research/2026-04-21-copilot-advanced-agents.md

---

<!-- Slide 82 | Section: Security | Type: boxes -->

# Data security & privacy: the training split

┌────────────────────────────┬────────────────────────────┐
│ **Business / Enterprise**  │ **Free / Pro / Pro+**      │
│ Prompts, context, outputs  │ Starting **April 24, 2026**│
│ are covered by the **DPA** │ data **may** be used for   │
│ (Data Processing Addendum) │ model training — **unless  │
│ and **never used for       │ you opt out** in personal  │
│ training**                 │ Copilot settings           │
└────────────────────────────┴────────────────────────────┘

**Speaker Notes:**
~5 slides, ~5 minutes in this section — purpose is to give you the vocabulary to find the right doc, not to be exhaustive. This is the single fact most enterprise buyers care about. The **DPA** (Data Processing Addendum) is the contract GitHub signs with business/enterprise customers that legally forbids training on their data; that's why the opt-out toggle is hidden on those seats — it's already baked into the contract.

Sources: research/2026-04-21-copilot-security-privacy.md

---

<!-- Slide 83 | Section: Security | Type: list -->

# Four governance levers (admin-side)

- **Public-code matching filter** — block suggestions matching ~150 chars of public code (or log them as code references)
- **Content exclusion** — Business/Enterprise: hide repos/paths from Copilot (inline + chat, not yet Edit/Agent)
- **Data residency** — GHE.com hosted in US, EU, or Australia; **FedRAMP-Moderate** (the US federal cloud-compliance framework) is available on a special policy with +10% multiplier for US gov workloads
- **Telemetry controls** — per-IDE; CLI supports `COPILOT_OFFLINE=true` to disable telemetry entirely

**Speaker Notes:**
Name them; don't drill. These are four separate switches in the admin console. FedRAMP-Moderate is the middle-tier US federal authorization level — relevant if you sell to US government agencies; most enterprises don't need it.

Sources: research/2026-04-21-copilot-security-privacy.md

---

<!-- Slide 84 | Section: Security | Type: single-point -->

# BYOK changes the data path

Reminder: **BYOK = Bring Your Own Key** — you supply credentials to a provider GitHub doesn't normally broker.

**Chat:** prompt still passes GitHub for safety filtering, not retained beyond session.
**CLI:** prompt goes **directly to your chosen provider** — does not transit GitHub. Set `COPILOT_OFFLINE=true` to also disable GitHub telemetry.

Your BYOK provider's privacy terms become the source of truth.

**Speaker Notes:**
Important for EU/regulated teams evaluating CLI + BYOK (e.g., local Ollama, Azure OpenAI, Anthropic direct) as a "no data leaves our network" path.

Sources: research/2026-04-21-copilot-security-privacy.md

---

<!-- Slide 85 | Section: Security | Type: comparison -->

# CLI vs VS Code — governance gaps to know

| Governance feature | VS Code | Copilot CLI |
|---|---|---|
| Content exclusion (repo-level) | ✅ inline + chat | ❌ **does not apply** |
| MCP policies | ✅ | ❌ **does not apply** |
| IDE policies | ✅ | ❌ |
| Public-code "Block" enforcement | ✅ inline suggestions | ⚠️ not enforced the same way |
| Hooks for enforcement | ❌ | ✅ primary surface |

**Speaker Notes:**
Emphasized per directive. The CLI is deliberately closer to the metal — governance on the CLI is done with Hooks + org policy (enable/disable the CLI entirely), not with content exclusion.

Sources: research/2026-04-21-copilot-security-privacy.md, research/2026-04-21-copilot-hooks.md

---

<!-- Slide 86 | Section: Admin | Type: table -->

# Enterprise admin: plans & consoles

| | **Business** | **Enterprise** |
|---|---|---|
| Price | $19 / seat / mo | $39 / seat / mo |
| Premium req / user / mo | 300 | 1,000 |
| Overage | $0.04 / request | $0.04 / request |
| Console | Org Settings → Copilot | Enterprise → **AI controls** tab |

AI controls has sub-pages for **Copilot · Models · Agents · MCP**. Audit logs live under *Settings → Audit log*; seats & spend under *Billing & licensing*.

**Speaker Notes:**
~5 slides, ~5 minutes in this section. Enterprise policies can pin a value so orgs can't override — helpful for rolling out regulated defaults.

Sources: research/2026-04-21-copilot-enterprise-admin.md

---

<!-- Slide 87 | Section: Admin | Type: list -->

# The six levers admins actually pull

1. **Feature policies** — Enable/Disable per surface (IDE, github.com, CLI, MCP, cloud agent…)
2. **Model allow-lists + BYOK** — pin providers; bring your own key to Anthropic/Bedrock/Google/OpenAI/xAI
3. **Content exclusion** — hide paths from Copilot
4. **Network** — Copilot endpoints + published allowlist
5. **Budgets** — premium-request caps per org/seat
6. **Cloud-agent approvals** — enable/block cloud agent and third-party agents

**Speaker Notes:**
Most rollouts start by disabling the cloud agent + MCP, proving value on IDE + CLI, then opening up. The Copilot endpoints in lever #4 are `*.business.githubcopilot.com` / `*.enterprise.githubcopilot.com`. "Feature policies" are tri-state: Enabled / Disabled / Unconfigured.

Sources: research/2026-04-21-copilot-enterprise-admin.md

---

<!-- Slide 88 | Section: Admin | Type: code-example -->

# Identity, seats, and audit

```text
# Identity — typically EMU* with SAML/OIDC + SCIM:
#   Entra ID ✓ SAML ✓ OIDC ✓ SCIM
#   Okta     ✓ SAML      ✓ SCIM
#   Ping     ✓ SAML      ✓ SCIM
# NOT supported: Okta + Entra combined for SSO+SCIM

# Audit-log queries (retention 180 days; stream to SIEM*):
action:copilot
action:copilot.cfb_seat_assignment_created
actor:Copilot action:pull_request.create
agent_session_id:<id>
```

**Glossary:** **EMU** = Enterprise Managed Users (GitHub accounts controlled by your IdP — users can't change email, 2FA, etc.). **SAML** / **OIDC** = SSO protocols (SAML is older/XML-based; OIDC is OAuth2-based). **SCIM** = automated user/group provisioning from your IdP to GitHub. **SIEM** = Security Information and Event Management (Splunk/Sentinel/etc.) — the system that ingests audit logs for alerting.

**Speaker Notes:**
The audit log does **not** include client-side prompts — only platform events (policy changes, seat grants, agent PR creates). For prompt-level audit you need the Hooks we covered earlier.

Sources: research/2026-04-21-copilot-enterprise-admin.md, research/2026-04-21-copilot-hooks.md

---

<!-- Slide 89 | Section: Admin | Type: demo-placeholder -->

# 🎬 Demo: Enterprise Admin

**Speaker Notes:**
Suggested demo: walk the AI controls tab, flip a feature policy, show an audit-log query, point to the Copilot usage metrics dashboard.

Sources: research/2026-04-21-copilot-enterprise-admin.md

---

<!-- Slide 90 | Section: Closing | Type: list -->

# Closing: 7 practical tips to leave with

1. **Default to Auto** — escalate models only on failure.
2. **Plan → Agent** for anything multi-file.
3. **Default Approvals** until you *earn* Autopilot.
4. **Commit `.github/copilot-instructions.md`** — highest-leverage file.
5. **One MCP server at a time** — read-only for cloud agent.
6. **CLI + VS Code are complements** — not substitutes.
7. **Hooks = your policy engine.** Enforcement belongs in `preToolUse`.

**Speaker Notes:**
About 10 minutes of content in the closing, then Q&A fills the remaining time. Walk these slowly; they're the whole day condensed. Call back each to the section where we covered it: #1 Models, #2–3 Modes, #4 Customization, #5 MCP, #6 CLI, #7 Hooks.

Sources: research/2026-04-21-model-variety.md, research/2026-04-21-copilot-modes.md, research/2026-04-21-copilot-customization.md, research/2026-04-21-copilot-mcp.md, research/2026-04-21-copilot-cli.md, research/2026-04-21-copilot-hooks.md

---

<!-- Slide 91 | Section: Closing | Type: list -->

# Resources

- **GitHub Docs — Copilot** → docs.github.com/en/copilot
- **VS Code Copilot docs** → code.visualstudio.com/docs/copilot
- **MCP** → modelcontextprotocol.io
- **Agent Skills spec** → github.com/agentskills/agentskills
- **`github/copilot-cli`** — README + weekly changelog
- **`github/gh-aw`** — Agentic Workflows for GitHub Actions
- **Anthropic — Building Effective Agents** — conceptual foundation
- **`github/awesome-copilot`** — community instruction/prompt/skill library

**Speaker Notes:**
Promise the slide deck (with live links) after the session; don't read this aloud. The canonical start points are the first two bullets — everything else is linked from there.

Sources: research/2026-04-21-copilot-advanced-agents.md, research/2026-04-21-copilot-mcp.md, research/2026-04-21-agentic-foundations.md, research/2026-04-21-copilot-skills.md, research/2026-04-21-copilot-cli.md

---

<!-- Slide 92 | Section: Closing | Type: single-point -->

# The one thing to remember

**Copilot is a platform of agents, not an autocomplete.**
Your job is to choose the right *coding environment*, *mode*, and *autonomy level* for each task — and to customize with instructions, MCP, Skills, Hooks, and custom agents.

Everything we did today is a knob on that platform.

**Speaker Notes:**
Close strong. This restates slide 3 ("why this matters") with the whole day of context behind it.

Sources: research/2026-04-21-copilot-history.md, research/2026-04-21-copilot-surfaces.md, research/2026-04-21-copilot-modes.md, research/2026-04-21-copilot-customization.md, research/2026-04-21-copilot-mcp.md, research/2026-04-21-copilot-skills.md, research/2026-04-21-copilot-hooks.md, research/2026-04-21-copilot-advanced-agents.md

---

<!-- Slide 93 | Section: Closing | Type: title-slide -->

# Questions?

**Speaker Notes:**
Budget ~45 minutes for Q&A. If the room is quiet, seed with: "What's the first thing you'd try on Monday morning?" or "Where is your team on the autonomy spectrum?"

Sources: general knowledge (Q&A slide)

---

<!-- Slide 94 | Section: Appendix | Type: title-slide -->

# Appendix

Reference material — premium requests and cost tips.

**Speaker Notes:**
Not covered in the main flow. Pull these up if someone asks about billing, quotas, or how to pick a cheaper model.

Sources: general knowledge (section divider)

---

<!-- Slide 95 | Section: Appendix | Type: boxes -->

# Premium requests — the basics

One **user prompt** = 1 request × the model's multiplier. Tool calls the agent makes on its own during that prompt are free.

┌─────────────────────────────┬─────────────────────────────┐
│ **Multiplier** — per model  │ **Allowance** — per plan    │
│ 0× included (GPT-4.1, 4o,   │ Free 50, Pro 300, Pro+ 1500,│
│ GPT-5 mini)                 │ Business 300/u, Ent. 1000/u │
│ 0.25–1× most paid models    │                             │
│ 3× Opus 4.5/4.6             │ Overage: $0.04 / request    │
│ 30× Opus 4.6 "fast mode"    │                             │
│ preview                     │ Auto mode = 10% discount    │
└─────────────────────────────┴─────────────────────────────┘

Cloud Agent is billed per **session** (plus one per real-time steering comment) from a separate SKU.

**Speaker Notes:**
Moved out of the main deck in v4. Reference only — pull up if someone asks about billing. Claude Opus 4.7 was on a 7.5× promotional multiplier through April 30, 2026; expect it to rise after.

Sources: research/2026-04-21-model-variety.md, research/2026-04-22-cloud-agent-deep-dive.md

---

<!-- Slide 96 | Section: Appendix | Type: list -->

# Cost tips

- **Default to Auto** — it picks a healthy model and gets a 10% discount on the multiplier.

- **Stay on 0× models** for everyday work — GPT-4.1, GPT-4o, GPT-5 mini are included with any paid plan.

- **Escalate on failure**, not by default — try a 0× model first; reach for Opus 4.x only when the task genuinely needs it.

- **Watch Opus multipliers** — Opus 4.5/4.6 is 3×; Opus 4.6 "fast mode" preview is 30×. Know before you click.

- **Cloud Agent is per-session** — long sessions are not proportionally more expensive per prompt; one session = one request × the model rate, plus one per steering comment.

- **Use `/usage`** in the CLI to see where your quota is going.

**Speaker Notes:**
These tips come out of the old slides 27–28. Keep them in the appendix — they matter, but they're not what a beginner coding-first presentation should lead with.

Sources: research/2026-04-21-model-variety.md
