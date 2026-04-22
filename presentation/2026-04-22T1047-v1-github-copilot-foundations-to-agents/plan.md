# Build Plan — GitHub Copilot: Foundations through Advanced Agentic Workflows

- **Content source:** `presentation-content.md` v3 (APPROVED — agent-reviews/2026-04-22-presentation-content-reviewer-r3.md)
- **Total slides:** 85
- **Target duration:** 150 min (≈75 delivery + 45 Q&A + 30 demos + 15 breaks)
- **Audience:** Beginner (visual clarity > density)
- **Theme:** GitHub Cosmos (default dark) — all 4 themes included & switchable

## Section breakdown

| # | Section | Slide range | Count |
|---|---|---|---|
| 1 | Opening | 1–3 | 3 |
| 2 | History | 4–5 | 2 |
| 3 | Agentic Foundations | 6–14 | 9 |
| 4 | Surfaces | 15–17 | 3 |
| 5 | Modes | 18–24 | 7 |
| 6 | ☕ Break 1 | 25 | 1 |
| 7 | Models | 26–30 | 5 |
| 8 | CLI | 31–38 | 8 |
| 9 | Customization | 39–44 | 6 |
| 10 | MCP | 45–51 | 7 |
| 11 | ☕ Break 2 | 52 | 1 |
| 12 | Skills | 53–58 | 6 |
| 13 | Hooks | 59–65 | 7 |
| 14 | Advanced Agents | 66–73 | 8 |
| 15 | Security | 74–77 | 4 |
| 16 | Admin | 78–81 | 4 |
| 17 | Closing | 82–85 | 4 |

## Special slides
- **Demo placeholders** (10 slides, 🎬): 14, 17, 24, 30, 38, 44, 51, 58, 65, 73, 81 — rendered with big pulsing LIVE DEMO badge
- **Break slides**: 25 (after Modes, ~60 min mark), 52 (after MCP, ~120 min mark) — rendered with coffee emoji & soft layout
- **Title slides**: 1, 85 — zoom transition
- **Diagrams (ASCII flow/tree)**: 4, 7, 13, 18, 46, 55, 66 — preserved as `<pre>` blocks with mono font
- **Decision trees** (ASCII): 11, 22, 28
- **Code examples**: 9, 29, 32, 34, 35, 40, 48, 54, 61, 62, 67, 70, 80 — syntax-highlighted `<pre><code>` blocks
- **Comparison tables**: 6, 20, 21, 29, 37, 41, 42, 56, 63, 68, 77, 78
- **Boxes (2×2 or multi)**: 10, 15, 19, 27, 36, 39, 74 — rendered via `.tool-grid` / `.slide-table`
- **Lists**: many — rendered with `.slide-list`

## Implementation notes
- Every slide renders its `Speaker Notes:` inside `<aside class="speaker-notes" hidden>`
- Dense ASCII diagrams (slide 4, 7, 13, 18, 46, 55, 66) use `data-type="diagram"` so padding/fonts shrink to fit
- CLI-vs-VS-Code comparison slides (23, 29, 37, 42, 48, 56, 63, 68, 77) use `data-type="comparison"` with the standard `.slide-table`
- Tables with >4 columns get smaller type to prevent horizontal overflow
- `text-align: center` default for titles; tables use `margin: 0 auto`
- No images in this build — `public/images/` exists but empty
