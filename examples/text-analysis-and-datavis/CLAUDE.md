# CLAUDE.md — Text analysis and datavis (Calvino memos)

Project-level instructions loaded when Claude Code starts in this folder.

## What this example is

A worked example of **deterministic textual analysis + 2D embedding visualization** of a literary corpus — Italo Calvino's *Six Memos for the Next Millennium* — paired with a **draft composer** that runs the same analyses on a student's prose in real time. Drawn from the production page at <https://a-project-on-calvino-interface-3kqu.vercel.app/memos>, *one page* of the larger Calvino project at <https://github.com/bok-learning-lab/a-project-on-calvino>.

Calvino died in 1985 while drafting the sixth of these lectures, which was to be about **Consistency**. The page invites the student to write that lecture themselves — and to see their draft measured, in the same units and the same embedding space, alongside Calvino's five completed memos. There is no grade. The measurement *is* the feedback.

This is the fourth deployed-webapp example in the gallery, alongside [`oral-exam-practice-bot`](../oral-exam-practice-bot/), [`image-API-widget`](../image-API-widget/), and [`film-course-concepts-website`](../film-course-concepts-website/). It's the second one with no in-page Claude prompt (after `film-course-concepts-website`), and the first one that wraps a **full upstream LLM-mediated OCR pipeline** as part of the example's substance. See [summary.md](summary.md) for the moves worth noticing and what you can translate them to.

## If you just opened this folder

Read in this order:

1. [summary.md](summary.md) — what this is, the three moves worth noticing (deterministic stats + UMAP-embedding map + live student-draft projection), how the project was built, what you can translate it to. **Live page + source repo are linked at the top.**
2. [inputs/](inputs/) — the cleaned Calvino corpus (five memos), the chapter-page-range metadata, two critic essays on the unwritten sixth memo.
3. [operations/ocr-pipeline.md](operations/ocr-pipeline.md) — the upstream OCR pipeline that produced the cleaned markdown. Three-engine vote + Claude-vision judge.
4. [operations/deterministic-text-analysis.md](operations/deterministic-text-analysis.md) — every browser-side formula, with the reasoning for each choice.
5. [operations/embedding-map-explained.md](operations/embedding-map-explained.md) — the offline-once + live-projection asymmetry, and why k-NN weighted centroid in place of running UMAP in the browser.
6. [operations/build-embeddings.py](operations/build-embeddings.py) — the actual Python script (127 lines, verbatim from production).
7. [operations/embed-api-proxy.js](operations/embed-api-proxy.js) — the Vercel serverless proxy (51 lines, verbatim).
8. [outputs/_source-snapshot.md](outputs/_source-snapshot.md) — the Vite app architecture in one document.
9. [outputs/example-page-experience.md](outputs/example-page-experience.md) and [outputs/example-draft-projection.md](outputs/example-draft-projection.md) — what the page produces for a student, and what a worked 350-word draft looks like through both analyses.

## How to work in this project

You are reading an example of a **measurement-rich page** for literary study. The substance is in three places, all of which need to be understood together:

1. **The corpus** in `inputs/memos/` — the cleaned markdown that all the analyses run on. The OCR pipeline produced these (see [`operations/ocr-pipeline.md`](operations/ocr-pipeline.md)); from the page's point of view, they're just plain markdown files fetched from `/memos/<name>.md`.
2. **Two analyses, in parallel.** The deterministic stats are JavaScript-over-text in the browser (no model call). The embedding map is offline-once + live-projection (Gemini embedding model + UMAP + k-NN). They answer different questions and complement each other.
3. **The student's draft, projected through both.** The page's pedagogical move is that the student is *one of the lecturers* — their bar lives in the same chart as Calvino's; their dot lives in the same 2D space.

Two passes, in order:

1. **Read the operations docs first.** [`operations/deterministic-text-analysis.md`](operations/deterministic-text-analysis.md) and [`operations/embedding-map-explained.md`](operations/embedding-map-explained.md) are the substance. Without them, the Python script and the JS file are uncommented code; with them, the architecture is legible.
2. **Then read the outputs.** [`outputs/example-page-experience.md`](outputs/example-page-experience.md) for the student-facing arc, [`outputs/example-draft-projection.md`](outputs/example-draft-projection.md) for what a worked draft looks like through both analyses.

## The pipeline (such as it is)

The page has *three* distinct pipelines that combine to produce what the student sees:

**Pipeline 1 — OCR (offline, weeks ago):**

| Step | What | Where |
|---|---|---|
| 1 | Scanned 2-up PDF of the Mondadori edition | `_media/m630_*.jpg` |
| 2 | Three independent OCR passes (Tesseract, Claude vision, Gemini 3 Pro vision) per page | `scripts/ocr/03_*.py`, `04_*.py`, `05_*.py` |
| 3 | Per-token majority vote; Claude-vision judge on disagreements | `scripts/ocr/06_reconcile.py` |
| 4 | Assembly + cleanup (strip running heads, page numbers, preserve italicization) | `scripts/ocr/07_assemble.py` |
| 5 | Final Gemini sweep + human review | `scripts/ocr/08_sweep.py`, `review-needed.md` |
| **→** | **Cleaned per-memo markdown** | **[`inputs/memos/`](inputs/memos/)** |

**Pipeline 2 — Embeddings (offline, on each corpus revision):**

| Step | What | Where |
|---|---|---|
| 1 | Split each memo into paragraphs (filter < 20 words) | [`operations/build-embeddings.py`](operations/build-embeddings.py) |
| 2 | Embed each paragraph with `gemini-embedding-001`, 256 dims, SEMANTIC_SIMILARITY task | same script |
| 3 | UMAP-reduce to 2D (n_neighbors=15, min_dist=0.15, cosine, random_state=42) | same script |
| 4 | Normalize x and y to [0, 1] | same script |
| 5 | Write all points (memo, text, x, y, vec) to JSON | `apps/mw-project-002/src/data/embeddings.json` |
| **→** | **The static map that ships in the JS bundle** | — |

**Pipeline 3 — Page render + live projection (every request):**

| Step | What | Where |
|---|---|---|
| 1 | Fetch the five cleaned memo markdown files | `MemosPage.jsx` `useEffect` |
| 2 | Compute deterministic stats live in JS for each memo | `analyse()` in `MemosPage.jsx` |
| 3 | Render eight SVG bar charts + small-multiples sentence histograms | `BarChart` / `SentenceLengthHistograms` |
| 4 | Render the embedding map from `embeddings.json` | `EmbeddingMap.jsx` |
| 5 | When the student types: re-run `analyse()` on their text → dashed bars appear | `useMemo` |
| 6 | When the student types: split into paragraphs → POST each to `/api/embed` → projectKNN → black dots appear on map | `EmbeddingMap.jsx` |

## Conventions

- **`inputs/` is the source corpus.** Five cleaned memo markdown files in `inputs/memos/`, the page-range metadata in `chapters.json`, two critic essays in `inputs/critics/`. The OCR pipeline output. The longest critic essay (the 4123-line Prencipe-Sideri book) is deliberately *not* copied — too large for a gallery example.
- **`operations/` holds the substance.** Two architectural docs (`ocr-pipeline.md` and `embedding-map-explained.md`), one method doc (`deterministic-text-analysis.md`), and two scripts copied verbatim from production (`build-embeddings.py` and `embed-api-proxy.js`).
- **`outputs/` holds the illustrative material.** A source-snapshot of the Vite app architecture, plus two written walkthroughs.
- **No emojis** in any file (workshop-wide convention).
- **Markdown link syntax** for file references — `[file](path/to/file.md)`.

## Alignment constraints (the hard ones)

These come from the production project and survive translation:

- **No grade, no overall score.** Every chart shows one signal. The map shows another. The student looks at them all. Same posture as [`oral-exam-practice-bot`](../oral-exam-practice-bot/CLAUDE.md).
- **The OCR pipeline's output is the source of truth.** Cleaned markdown in [`inputs/memos/`](inputs/memos/) is what the analyses run on; don't re-process at request time. Re-running the OCR is a *commitment*, not a default behavior.
- **Embed the canonical corpus offline; embed user inputs live.** The asymmetry is what makes the live-projection move possible. Don't re-embed Calvino on every request.
- **Project user vectors into 2D via k-NN, not by re-running UMAP.** UMAP doesn't have a deterministic `transform(new_point)`. k-NN weighted centroid is the right approximation. See [`operations/embedding-map-explained.md`](operations/embedding-map-explained.md).
- **Same embedding model on both sides.** Same model, same task type, same dimensionality. Without this, the cosine distances are meaningless.
- **Charts are hand-rolled SVG.** No chart library. Each chart is ~30 lines of JSX. This is what lets the page run any analysis without inheriting a library's chart-aesthetic.
- **The student's bar is dashed; the student's dots are black with a dashed outline.** Consistent visual convention across all the charts and the map. The student is *one of the lecturers* now.
- **Server-side API key.** The Gemini key is in `process.env` server-side. The browser never sees it.
- **One dimension per chart.** Resist combining metrics into a single score. The student should leave the page able to name what each measurement counted.
