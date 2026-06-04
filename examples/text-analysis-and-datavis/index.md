# text-analysis-and-datavis — folder index

A worked example of **deterministic textual analysis + 2D semantic-embedding visualization** of a literary corpus, paired with a **draft composer** that runs the same analyses on a student's prose in real time. Built around Italo Calvino's *Six Memos for the Next Millennium*. Drawn from one page of the production repo at <https://github.com/bok-learning-lab/a-project-on-calvino> — the *Memos by the Numbers* page at <https://a-project-on-calvino-interface-3kqu.vercel.app/memos>. Start with [summary.md](summary.md); everything else is here for browsing.

## Top-level

- [summary.md](summary.md) — what this project is, the three moves worth noticing (two analyses side by side; offline corpus + live student projection; LLM-mediated OCR pipeline as substance), how it was built, what you can translate it to. **Live page + source repo are linked at the top.**
- [CLAUDE.md](CLAUDE.md) — project-level instructions loaded by Claude Code on session start.
- [index.md](index.md) / [index.html](index.html) — this file.

## inputs/

The cleaned literary corpus the page's analyses run on — the output of the upstream OCR pipeline. Five Calvino memos in cleaned markdown, page-range metadata, and two critic essays on the unwritten sixth memo.

- inputs/memos/
  - [1-lightness.md](inputs/memos/1-lightness.md) — *Lightness* (~8,140 words, ~56 minutes oral)
  - [2-quickness.md](inputs/memos/2-quickness.md) — *Quickness* (~6,838 words)
  - [3-exactitude.md](inputs/memos/3-exactitude.md) — *Exactitude* (~10,420 words — Calvino's longest)
  - [4-visibility.md](inputs/memos/4-visibility.md) — *Visibility* (~5,265 words — Calvino's shortest)
  - [5-multiplicity.md](inputs/memos/5-multiplicity.md) — *Multiplicity* (~7,531 words)
- [inputs/chapters.json](inputs/chapters.json) — page-range metadata from the Mondadori scan (frontmatter pp. 1–11, lightness 12–39, quickness 40–63, exactitude 64–89, visibility 90–109, multiplicity 110–134)
- inputs/critics/
  - [codrescu-on-consistency.md](inputs/critics/codrescu-on-consistency.md) — Andrei Codrescu's *Los Angeles Review of Books* essay on what Calvino's unwritten sixth memo (Consistency) might have been
  - [d0d1x-consistency-last-memo.md](inputs/critics/d0d1x-consistency-last-memo.md) — D0D1X's Medium essay reading Consistency as the last memo

## operations/

Three architectural documents + two production scripts copied verbatim. No Claude prompts (the page itself has no LLM call) — but the upstream OCR pipeline is *LLM-mediated*, and the embedding pipeline calls Gemini.

- [operations/ocr-pipeline.md](operations/ocr-pipeline.md) — the 10-step OCR pipeline that produced the cleaned markdown in `inputs/memos/`. Three OCR engines (Tesseract, Claude vision, Gemini vision) per page; per-token vote; Claude-vision judge on disagreements; Gemini sweep + human review. Same *cheap-vote / expensive-judge* posture as oral-exam-practice-bot's two-stage follow-up
- [operations/deterministic-text-analysis.md](operations/deterministic-text-analysis.md) — the seven core metrics computed live in the browser (word count, oral delivery time, lexical density, quoted-material ratio, title-word frequency, first-person density, avg sentence length) plus the sentence-length distribution histograms. Every formula documented, with the reasoning for each measurement and why hand-rolled SVG rather than a chart library
- [operations/embedding-map-explained.md](operations/embedding-map-explained.md) — the offline-once + live-projection architecture. Why Gemini (tunable dimensionality, SEMANTIC_SIMILARITY task type), why UMAP (deterministic with `random_state=42`, stable under small changes), why k-NN weighted centroid for live projection (UMAP doesn't have a transform; t-SNE is unstable)
- [operations/build-embeddings.py](operations/build-embeddings.py) — **copied verbatim from production** (127 lines). The Python script that produces `embeddings.json`. Reads the five cleaned memos, splits into paragraphs, embeds with `gemini-embedding-001` at 256 dims, UMAP-reduces to 2D, writes the JSON the page renders
- [operations/embed-api-proxy.js](operations/embed-api-proxy.js) — **copied verbatim** (51 lines). The Vercel serverless function that proxies live student-paragraph embedding to Gemini. Mirrored by a Vite dev middleware so the client can call `/api/embed` in both local dev and production with no code change

## outputs/

The illustrative material — a written architecture snapshot and two walkthroughs of what the page produces.

- [outputs/_source-snapshot.md](outputs/_source-snapshot.md) — the Vite app architecture, the relevant slice of the multi-app repo layout, the deployment story, what the app deliberately does *not* do. Includes the important note that this is **one page** of a larger messy repo, and the page lives in `apps/mw-project-002/` (a Vite app) rather than the repo's main Next.js interface
- [outputs/example-page-experience.md](outputs/example-page-experience.md) — what the student sees when they visit `/memos`: the header, the eight bar charts (with the actual Calvino numbers walked through), the embedding map's cluster shape, the composer, the three reader panels, the footer
- [outputs/example-draft-projection.md](outputs/example-draft-projection.md) — a worked 353-word student draft of the unwritten Consistency memo, run through both analyses. Every chart's numbers walked through; the four paragraphs' embedding-map landings explained; what the worked example demonstrates pedagogically

---

*To translate the pattern to another corpus: drop your cleaned author corpus into `inputs/memos/` (or the equivalent), run [`operations/build-embeddings.py`](operations/build-embeddings.py) to produce `embeddings.json`, port the seven metrics in [`operations/deterministic-text-analysis.md`](operations/deterministic-text-analysis.md) verbatim (most are author-agnostic), update the title-word frequency metric for your corpus's specific themes. If your corpus is a scanned PDF rather than digital text, run the OCR pipeline first — see [`operations/ocr-pipeline.md`](operations/ocr-pipeline.md). The hand-rolled SVG charts and the k-NN live-projection logic don't need any per-corpus tuning.*
