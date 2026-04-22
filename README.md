# GitHub Copilot — Foundations to Agents

A **2.5-hour beginner-friendly presentation** on GitHub Copilot, covering fundamentals through advanced agentic workflows.

🔗 **Live deck:** https://miguelmsft.github.io/20260422-github-copilot-intro/

---

## 1. What's in this presentation

**86 slides**, organized into these sections:

| Section | Slides | What it covers |
|---|---|---|
| **Opening** | 1–4 | Why Copilot matters in 2026; brief history from autocomplete to agents |
| **Agentic foundations** | 5–15 | Plain LLM vs chatbot vs agent; the Think → Act → Observe loop; common patterns; autonomy spectrum |
| **Surfaces & subscriptions** | 16–21 | IDE / Terminal / Web / Mobile / Cloud agent; plans & premium requests; in-IDE vs cloud agent |
| **Modes** | 22–24 | Ask / Plan / Agent / Autopilot; how modes differ between VS Code and CLI |
| **Models** | 25–28 | Opus, Sonnet, GPT-5.x, Gemini, Grok; premium-request multipliers; picking the right model |
| **CLI deep dive** | 29–36 | Install, auth, interactive essentials, key slash commands, built-in sub-agents, CLI vs VS Code |
| **Customization** | 37–44 | The 4 customization layers; `copilot-instructions.md`; prompt files; custom agents |
| **MCP** | 45–51 | Model Context Protocol; host/client/server; wiring MCP servers; safety |
| **Agent Skills** | 52–58 | What skills are; anatomy; how Copilot picks one; where they run |
| **Hooks** | 59–63 | Event-driven automation; policy enforcement examples |
| **Advanced agentic workflows** | 64–72 | Cloud agent; Agent HQ; third-party agents; agentic workflows on GitHub Actions |
| **Security & governance** | 73–82 | Data training/privacy split; enterprise admin controls |
| **Wrap-up** | 83–86 | Practical tips, references, demo, Q&A |

Plus **demo placeholder slides** at the end of each main section for the live demos.

**Source of truth:** [`presentation-content.md`](./presentation-content.md) (one key idea per slide + speaker notes + provenance).

---

## 2. How it was built — the agentic workflow

The entire deck was produced end-to-end by **sub-agents invoked through GitHub Copilot CLI**. The human (Miguel) acted as the orchestrator's user: confirming scope at each phase gate, providing feedback, and resolving ambiguity.

### Entry point: Copilot CLI

```bash
copilot
# then inside the CLI session:
/agent   # select the presentation-orchestrator agent
```

The `presentation-orchestrator` is the top-level coordinator. It delegates to specialist sub-agents and pauses at **4 human gates** (intake → post-research → post-content → final review).

### The workflow

```
┌─────────────────────────────────────────────────────────────────┐
│  USER in Copilot CLI ──→  presentation-orchestrator             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    PHASE 1           PHASE 2          PHASE 3
    Research         Content           Slides
           │               │               │
           ▼               ▼               ▼
 ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
 │ ms-docs-        │ │ presentation-   │ │ presentation-   │
 │   researcher    │ │ content-creator │ │ slide-builder   │
 │ web-researcher  │ │        ⇅ loop   │ │        ⇅ loop   │
 │        ⇅ loop   │ │ presentation-   │ │ presentation-   │
 │ ms-docs-        │ │ content-        │ │ slide-reviewer  │
 │ research-       │ │ reviewer        │ │ (Playwright MCP)│
 │ reviewer        │ │                 │ │                 │
 │ web-research-   │ │                 │ │                 │
 │ reviewer        │ │                 │ │                 │
 └─────────────────┘ └─────────────────┘ └─────────────────┘
           │               │               │
     13 research     presentation-    Vite + GSAP
       reports       content.md        slide app
           │               │               │
           └────── HUMAN GATE ──────────── HUMAN GATE
```

Every specialist pair is a **creator ↔ reviewer loop** that iterates until the reviewer returns `APPROVED` with zero Critical or Important issues.

### The sub-agents we used

All nine are in [`.github/agents/`](.github/agents/) as `*.agent.md` files (the GitHub-standard convention for repo-level custom agents):

| Agent | Role |
|---|---|
| `presentation-orchestrator` | Top-level coordinator across all 3 phases; owns human gates + `presentation-status.md` |
| `ms-docs-researcher` | Researches Microsoft Learn topics; produces structured `.md` research reports |
| `web-researcher` | Researches the open web (GitHub docs, blogs, specs); produces research reports |
| `ms-docs-research-reviewer` | Validates Microsoft-docs research for accuracy, coverage, verbatim quotes |
| `web-research-reviewer` | Validates web research reports; spot-checks URLs, verifies quotes, grades source authority |
| `presentation-content-creator` | Distills research into a slide-by-slide `presentation-content.md` draft |
| `presentation-content-reviewer` | Reviews the content draft across 10 dimensions; cross-references research for fidelity |
| `presentation-slide-builder` | Generates the Vite + GSAP slide app (85+ slides, 4 themes, admin panel) |
| `presentation-slide-reviewer` | Opens the running deck via Playwright MCP at 1920×1080; flags overflow, visual-fidelity issues |

### What this run looked like in practice

1. **Intake** → user described audience (beginners), duration (2.5 h), outline. Orchestrator confirmed 13 research topics.
2. **Research** → 13 `web-researcher` + `ms-docs-researcher` runs × their reviewer loops. Final pass: GPT-5.4 auditor (19 🔴 + 110 🟡 all resolved).
3. **Content** → `presentation-content-creator` drafted 104 slides; 3 rounds with `presentation-content-reviewer` tightened to 85 APPROVED slides.
4. **Slides** → `presentation-slide-builder` produced the Vite app; 2 rounds with `presentation-slide-reviewer` (Playwright-driven visual audit) to APPROVED.
5. **Post-approval revisions** (user feedback) → visual-first rebuild of conceptual slides (ASCII → real HTML components / SVG); content edits (slide 3, 16, 22, 23, 33); added slide 34 "Key slash commands".
6. **Deploy** → committed to this repo; GitHub Actions builds the Vite app and publishes to GitHub Pages on every push to `main`.

Full receipts are in [`agent-reviews/`](./agent-reviews/) (one consolidated file per reviewer, all rounds appended) and [`research/`](./research/) (13 approved reports).

---

## 3. Running locally

```bash
cd presentation/2026-04-22T1047-v1-github-copilot-foundations-to-agents
npm install
npm run dev
# → http://localhost:5173/
```

**Keyboard shortcuts**

- `→` / `Space` / `PgDn` — next slide
- `←` / `PgUp` — previous slide
- `N` — toggle speaker notes
- `A` — admin panel (theme switch, go-to-slide, PDF export)
- `F` — fullscreen

**Themes:** 4 built-in — GitHub Cosmos (dark, default), Warm, Corporate, Cyberpunk. Switch from the admin panel.

---

## 4. Deployment

GitHub Actions builds the Vite app and deploys it to GitHub Pages on every push to `main`. See [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml).

---

## 5. Try these agents yourself

To use the same orchestrator + specialist agents in your own Copilot CLI session:

```bash
# from this repo root, start Copilot CLI
copilot

# inside the CLI, the repo-level .github/agents/ folder is auto-detected
/agent                          # list + pick an agent
/env                            # confirm agents loaded
```

Or copy them to your user-level agents directory for global availability:

```bash
cp .github/agents/*.agent.md ~/.copilot/agents/
```

See the [GitHub docs on custom agents](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/create-custom-agents-for-cli) for the full spec.

---

## License

Content authored by Miguel Martinez. Research cites official Microsoft/GitHub documentation and reputable third-party sources — see individual research files for references.

