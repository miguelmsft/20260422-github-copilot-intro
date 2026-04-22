# GitHub Copilot — Foundations to Agents

A 2.5-hour beginner-friendly presentation on GitHub Copilot, covering fundamentals through advanced agentic workflows.

**Live deck:** https://miguelmsft.github.io/20260422-github-copilot-intro/

## Contents

| Path | Description |
|---|---|
| `presentation/2026-04-22T1047-v1-github-copilot-foundations-to-agents/` | Vite + GSAP interactive slide deck (85 slides) |
| `presentation-content.md` | Source-of-truth slide content (one key idea per slide, speaker notes, provenance) |
| `presentation-status.md` | Orchestrator state across research → content → slides phases |
| `research/` | 13 approved research reports (all cited from official sources, audited for accuracy) |
| `agent-reviews/` | Full review history from the creator/reviewer loops |

## How it was built

Produced end-to-end by a multi-agent workflow:

1. **Research phase** — `web-researcher` × 13 topics, iterated with `web-research-reviewer` until all Critical/Important issues resolved. Independently audited by a GPT-5.4 auditor (PASS, 19/19 Critical + 110/110 Important resolved).
2. **Content phase** — `presentation-content-creator` produced `presentation-content.md`, looped with `presentation-content-reviewer` through 3 rounds until APPROVED.
3. **Slide phase** — `presentation-slide-builder` generated a Vite + GSAP single-page app with 4 themes, admin panel, and keyboard navigation.

## Running locally

```bash
cd presentation/2026-04-22T1047-v1-github-copilot-foundations-to-agents
npm install
npm run dev
# → http://localhost:5173/
```

## Deployment

GitHub Actions builds the Vite app and deploys to GitHub Pages on every push to `main`. See `.github/workflows/deploy.yml`.

## Keyboard shortcuts

- `→` / `Space` / `PgDn` — next slide
- `←` / `PgUp` — previous slide
- `N` — toggle speaker notes
- `A` — admin panel (theme switch, go-to-slide, PDF export)
- `F` — fullscreen

## Audience & session structure

- **Audience:** beginners new to GitHub Copilot
- **Duration:** 150 min (≈75 min slide delivery, ≈45 min Q&A, ≈30 min demos, ≈15 min breaks)
- **Emphasis:** agentic foundations, modes, CLI deep dive, MCP, Skills, Hooks, customization, advanced agents
- **Cross-cutting:** every section explicitly calls out CLI vs VS Code nuances

## License

Content authored by Miguel Martinez. Research cites official Microsoft/GitHub documentation and reputable third-party sources — see individual research files for references.
