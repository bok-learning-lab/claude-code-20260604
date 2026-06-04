# Source snapshot — the running app this example is drawn from

*This document stands in for copying the running app's source code into the example folder. The live page is at <https://a-project-on-calvino-interface-3kqu.vercel.app/memos>; the repo is [bok-learning-lab/a-project-on-calvino](https://github.com/bok-learning-lab/a-project-on-calvino). What follows is enough to read the page's shape without cloning it.*

*An important detail: this example focuses on **one page** (`/memos`) of a **larger multi-app repo**. The repo also contains a Next.js documentation interface (`apps/interface/`), an OCR pipeline (`scripts/ocr/`), and several other in-progress apps. The memos page itself lives in a different app entirely (`apps/mw-project-002/`, a Vite + React app). The "messiness" the user flagged is real and load-bearing: this is one finished page inside a larger creative codebase, and the example deliberately extracts only the substance of that one page.*

---

## What the page does, end-to-end

1. **The student lands on `/memos`.** Stone-50 background, serif headings, Italian-academic typography. Header: *"Calvino · Six Memos for the Next Millennium"* in small-caps tracking, then *"The Memos, by the Numbers"* as the H1, then a single paragraph of framing:

> *"A clearer presentation of a deterministic textual analysis of the five lectures Calvino completed before his death (the sixth, never written, is yours to draft). Paste a draft of your own sixth memo below and see how it compares to Lightness, Quickness, Exactitude, Visibility, and Multiplicity."*

   Two outlined buttons under the framing: **"Corpus →"** (linking to a Google Drive folder with the source PDF, the critic essays, and Calvino-related background materials) and **"Operations →"** (linking to a HackMD workshop document).

2. **Eight hand-rolled SVG bar charts** render across the top of the page, two per row on desktop. One bar per memo (color-coded), with a dashed black bar for the student's draft when there is one. The eight charts cover word count, oral delivery time, lexical density, quoted-material ratio, title-word frequency, first-person density, average sentence length, plus a small-multiples view of sentence-length histograms. See [`operations/deterministic-text-analysis.md`](../operations/deterministic-text-analysis.md) for every formula.

3. **The 2D embedding map** renders below the charts as a single full-width SVG with ~600 colored circles (one per Calvino paragraph) plus user circles when the student is typing. See [`operations/embedding-map-explained.md`](../operations/embedding-map-explained.md).

4. **The draft composer** is below the map: a textarea, a "load sample" link (which inserts a four-sentence opener about the unwritten Consistency memo), and four live stats (word count, sentence count, avg sentence length, estimated oral runtime).

5. **Three extra panels** appear once the student starts typing: top keywords, top "I + verb" phrases, title-word echoes.

6. **A footer** with a quiet credit: *"All metrics are computed live from cleaned markdown of the five memos (see `_context/mw-memos/`). Oral-delivery time is estimated at 145 words per minute."*

## Repo layout (the relevant slice)

The Calvino repo is a pnpm workspace with two Next.js apps, a Vite app, an OCR pipeline, an embedding pipeline, and a lot of in-progress branches. The pieces this example draws on:

```
a-project-on-calvino/                      (pnpm workspace, monorepo)
├── _content/                              ← (related Next.js content; not used by /memos)
├── _context/
│   ├── mw-memos/                          ← the cleaned-markdown corpus (OCR output)
│   │   ├── 1-lightness/lightness.md       ← copied to inputs/memos/1-lightness.md
│   │   ├── 2-quickness/quickness.md
│   │   ├── 3-exactitude/exactitude.md
│   │   ├── 4-visibility/visibility.md
│   │   ├── 5-multiplicity/multiplicity.md
│   │   ├── chapters.json                  ← copied to inputs/chapters.json
│   │   ├── critics/                       ← critic essays on the unwritten 6th memo
│   │   │   ├── codrescu-on-consistency.md ← LARB essay
│   │   │   ├── d0d1x-consistency-last-memo.md
│   │   │   └── prencipe-sideri-grammar-of-innovation.md  (4100+ lines — full book; NOT copied)
│   │   ├── frontmatter/                   ← the book's preface as a separate file
│   │   ├── pages/                         ← per-page intermediate OCR output
│   │   └── review-needed.md               ← OCR sweep's manual-review queue
│   ├── jk-readings/                       ← reading-group materials (unrelated to /memos)
│   ├── sourcing-readings/                 ← duplicate snapshot of readings
│   ├── dd-readings-claude/                ← deeper Claude-assisted reading work
│   └── ultimate-readings/                 ← per-week organized reading set
├── _media/
│   └── m630_01.jpg ... m630_NN.jpg        ← the scanned 2-up book pages
├── apps/
│   ├── interface/                         ← Next.js documentation site (separate from /memos)
│   └── mw-project-002/                    ← THE MEMOS PAGE (Vite + React, not Next.js)
│       ├── api/
│       │   └── embed.js                   ← copied to operations/embed-api-proxy.js
│       ├── public/
│       │   └── memos/{lightness,quickness,exactitude,visibility,multiplicity}.md
│       │                                   (a per-app copy of the cleaned markdown,
│       │                                    fetched by the page at runtime)
│       ├── src/
│       │   ├── App.jsx
│       │   ├── components/
│       │   │   └── EmbeddingMap.jsx       ← the 2D scatter component
│       │   ├── data/
│       │   │   └── embeddings.json        ← built by build-embeddings.py (~5 MB)
│       │   ├── index.css
│       │   └── pages/
│       │       └── MemosPage.jsx          ← the page itself, ~450 lines
│       ├── .env.example                   ← GEMINI_API_KEY=…
│       ├── package.json
│       ├── vercel.json                    ← SPA rewrite so /memos doesn't 404
│       └── vite.config.js
├── scripts/
│   ├── embed/
│   │   └── build_embeddings.py            ← copied to operations/build-embeddings.py
│   └── ocr/                               ← the 10-script OCR pipeline; described in
│       ├── 01_extract_pages.py             operations/ocr-pipeline.md (not copied verbatim)
│       ├── 02_find_chapters.py
│       ├── 03_ocr_tesseract.py            (not on disk in this snapshot — referenced in README)
│       ├── 04_ocr_claude.py
│       ├── 05_ocr_gemini.py
│       ├── 06_reconcile.py
│       ├── 07_assemble.py
│       ├── 08_sweep.py
│       ├── 09_metrics.py
│       ├── 10_extract_critics.py
│       ├── lib.py
│       └── README.md
├── CLAUDE.md
├── README.md
├── package.json
└── pnpm-workspace.yaml
```

## Tech stack (memos page specifically)

- **Vite 6** with the React plugin. Vite (not Next.js) was chosen for this app because the page is mostly static SVG + one serverless function — Next's full machinery was overkill.
- **React 18** with hooks (`useState`, `useEffect`, `useMemo`).
- **Tailwind CSS** for layout and typography (stone-50 / stone-200 / stone-900 palette).
- **No chart library.** Every chart is hand-rolled SVG — `<rect>` for bars, `<text>` for labels, `<circle>` for the embedding map. See [`operations/deterministic-text-analysis.md`](../operations/deterministic-text-analysis.md) for why.
- **No router.** The app has one page; `vercel.json` does the SPA rewrite for direct `/memos` URL access.
- **`@google/genai`** (Python) for the offline embedding pipeline.
- **`umap-learn`** (Python) for the 2D projection.
- **No browser-side LLM call** for the deterministic stats. The embedding map *does* call Gemini at runtime via the proxy, but only for the student's own paragraphs — Calvino's are pre-embedded.

## Where API keys live

`apps/mw-project-002/.env` (server-side / build-time):

```
GEMINI_API_KEY=…
```

Used by:
- `scripts/embed/build_embeddings.py` at build time (offline embedding of Calvino's paragraphs).
- `apps/mw-project-002/api/embed.js` at runtime (Vercel serverless function proxying student-paragraph embedding).

The Vite dev middleware in `vite.config.js` mirrors the serverless function for local development — same `/api/embed` endpoint, same request shape, same response shape. The client code (`EmbeddingMap.jsx`) calls `/api/embed` in both dev and production with no environment-aware branching.

## Deployment

- **Vercel.** Project root at `apps/mw-project-002/`. `vite build` produces a static SPA, plus the serverless function at `api/embed.js`.
- **`vercel.json`** has a rewrite rule for `/memos` so direct navigation doesn't 404 (`fac43f6 fix: SPA rewrite so /memos and other client routes don't 404 on Vercel`).
- Live at <https://a-project-on-calvino-interface-3kqu.vercel.app/memos>.
- The hyphenated subdomain (`-interface-3kqu`) is Vercel's generated name; the app was originally part of an `apps/interface/` deployment.

## What's *not* here (and why)

- **No grade, no overall "Calvino-similarity score."** Each chart and the embedding map present one signal. The student looks at them all. Same posture as [`oral-exam-practice-bot`](../../oral-exam-practice-bot/) — no aggregate verdict.
- **No persistence of student drafts.** The textarea and the user dots live in component state. A page reload discards everything.
- **No accounts, no auth.** Public URL; access by link.
- **No analytics.** (Vercel basic deployment metrics may be on.)
- **No live re-OCR.** The cleaned markdown is the source of truth in the repo. Re-running the OCR pipeline requires the scanned PDF (not in the repo) and a few API keys.
- **No live UMAP.** The 2D map is built offline. Running UMAP per request is wrong (see [`operations/embedding-map-explained.md`](../operations/embedding-map-explained.md)).
- **No safety classifier on student input.** The page is for an adult classroom drafting literary prose; not for arbitrary public input.

## How a faculty member would adapt this

Three reusable shapes:

**The OCR pipeline** ([`operations/ocr-pipeline.md`](../operations/ocr-pipeline.md)) — for any scanned book that needs to become cleaned markdown:

1. Replace `_media/m630_*.jpg` with your scanned pages.
2. Adjust `02_find_chapters.py` to detect your book's chapter boundaries.
3. Run scripts in order. The reconcile + judge logic generalizes; the assembly step's regex for running heads / page numbers needs per-book tuning.

**The deterministic text analysis** ([`operations/deterministic-text-analysis.md`](../operations/deterministic-text-analysis.md)) — for any course where students write in a target author's register:

1. Drop your corpus into `public/memos/<name>.md`.
2. Update the `MEMO_DEFS` array in `MemosPage.jsx` with the corpus's names and colors.
3. The `analyse()` function ports verbatim. Some metrics (title-word frequency) need per-corpus configuration; the rest are author-agnostic.

**The embedding map** ([`operations/embedding-map-explained.md`](../operations/embedding-map-explained.md), [`operations/build-embeddings.py`](../operations/build-embeddings.py)) — for any corpus where a 2D semantic map is useful:

1. Point `build_embeddings.py` at your corpus directory.
2. Run it once. `embeddings.json` is produced.
3. `EmbeddingMap.jsx` reads it. The k-NN projection ports verbatim.

Each shape can be ported independently. They're combined here because Calvino's pedagogical case justifies the combination — students writing in the register of a specific author, with a corpus rich enough to embed meaningfully.
