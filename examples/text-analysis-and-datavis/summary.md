# Text analysis and datavis — Calvino's memos, by the numbers

A worked example of **deterministic textual analysis** + **2D semantic-embedding visualization** of a literary corpus, paired with a **draft composer** that runs the same analyses on a student's prose in real time. Drawn from one page of the Calvino-project repo: **"The Memos, by the Numbers"** — the page that turns Italo Calvino's five *Six Memos for the Next Millennium* (Lightness, Quickness, Exactitude, Visibility, Multiplicity) into a measurable set of objects, and invites students to draft the sixth (Consistency — Calvino died before writing it) and see their prose plotted in the same space.

> **Live page:** <https://a-project-on-calvino-interface-3kqu.vercel.app/memos> — try it: paste a draft into the composer at the bottom and watch the dashed bars appear in every chart, and the black dots populate the embedding map.
>
> **Source repo:** <https://github.com/bok-learning-lab/a-project-on-calvino> — the production multi-app monorepo. This example focuses on **one page of that repo** (the `/memos` page, which lives in `apps/mw-project-002/`), with the upstream OCR pipeline (in `scripts/ocr/`) and the embedding pipeline (`scripts/embed/build_embeddings.py`) included as part of the substance.
>
> **The unwritten sixth memo:** Calvino died in September 1985 while drafting the lecture on **Consistency**. The page treats this as a pedagogical opportunity — the student writes the sixth memo themselves, and the same measurements that characterize Calvino's five extant lectures characterize the student's draft, side by side.

This is the fourth deployed-webapp example in the gallery, alongside [`oral-exam-practice-bot`](../oral-exam-practice-bot/), [`image-API-widget`](../image-API-widget/), and [`film-course-concepts-website`](../film-course-concepts-website/). It's the most architecturally rich of the four — a full upstream OCR pipeline produces the corpus, an offline embedding pipeline produces the map, and a browser-side analysis layer renders everything live with hand-rolled SVG. No in-page Claude prompt, but an LLM-mediated OCR judge is part of the substance.

---

## What it is

A single page (a Vite + React app, despite the rest of the repo being Next.js) that does three distinct things in parallel:

- **Eight hand-rolled SVG bar charts** computed live in the browser from the cleaned memo markdown. Word count, oral delivery time, lexical density, quoted-material ratio, title-word frequency, first-person density, avg sentence length, plus a small-multiples view of sentence-length histograms. No chart library. See [`operations/deterministic-text-analysis.md`](operations/deterministic-text-analysis.md).
- **A 2D embedding map** — every paragraph of all five memos was embedded with `gemini-embedding-001` and UMAP-projected to 2D *offline*, by [`operations/build-embeddings.py`](operations/build-embeddings.py). The browser renders that as an SVG scatter. When the student writes paragraphs in the composer, their paragraphs are embedded *live* (via a server-side `/api/embed` Gemini proxy at [`operations/embed-api-proxy.js`](operations/embed-api-proxy.js)) and projected into the same 2D space via k-NN weighted centroid (so UMAP doesn't have to ship to the browser). See [`operations/embedding-map-explained.md`](operations/embedding-map-explained.md).
- **A draft composer** — a textarea, plus a "load sample" link, plus live stats, plus three reader panels (top keywords, top "I + verb" phrases, title-word echoes). The student writes their own sixth memo; the page measures it the same way it measures Calvino's.

Plus, upstream of all that: an **LLM-mediated OCR pipeline** in `scripts/ocr/` that produced the cleaned per-memo markdown from a scanned 2-up PDF of the Mondadori edition. Three OCR engines (Tesseract, Claude vision, Gemini vision) vote per token; a Claude-vision judge resolves disagreements with the image in hand; an assembly step stitches and cleans; a Gemini sweep flags suspect passages for human review. See [`operations/ocr-pipeline.md`](operations/ocr-pipeline.md).

The substance the example reproduces in this folder:

- [inputs/memos/](inputs/memos/) — the five cleaned per-memo markdown files (`1-lightness.md` through `5-multiplicity.md`), output of the OCR pipeline.
- [inputs/chapters.json](inputs/chapters.json) — the chapter page-range metadata from the original Mondadori scan (frontmatter pp. 1–11, lightness 12–39, etc.).
- [inputs/critics/](inputs/critics/) — two critic essays on what the unwritten sixth memo might have been: Andrei Codrescu's LARB piece and D0D1X's Medium essay. (The third critic — Prencipe & Sideri's 4123-line *Grammar of Innovation* — is deliberately not copied; too large for a gallery example.)
- [operations/build-embeddings.py](operations/build-embeddings.py) — the Python pipeline that produces `embeddings.json`, 127 lines, copied verbatim from production.
- [operations/embed-api-proxy.js](operations/embed-api-proxy.js) — the Vercel serverless function that proxies live student-paragraph embedding to Gemini, 51 lines, copied verbatim.
- [operations/ocr-pipeline.md](operations/ocr-pipeline.md) — the 10-step OCR pipeline documented (not copied verbatim — too many files), with the three-engines-plus-judge reasoning.
- [operations/deterministic-text-analysis.md](operations/deterministic-text-analysis.md) — every browser-side formula, with the reasoning for each measurement and why hand-rolled SVG rather than a chart library.
- [operations/embedding-map-explained.md](operations/embedding-map-explained.md) — the offline-once + live-projection asymmetry, why Gemini specifically, why UMAP not t-SNE, why k-NN weighted centroid instead of running UMAP in the browser.
- [outputs/_source-snapshot.md](outputs/_source-snapshot.md) — the Vite app architecture, the relevant slice of the repo layout, the deployment, what the app deliberately omits.
- [outputs/example-page-experience.md](outputs/example-page-experience.md) — what the page produces for a student walking into it.
- [outputs/example-draft-projection.md](outputs/example-draft-projection.md) — a worked 350-word student draft, run through both analyses with all the numbers walked through.

---

## The moves worth noticing

**Three moves, working in parallel, anchored by a pedagogical conceit (the unwritten sixth memo).**

### Move 1 — Two complementary analyses, side by side

The page runs *both* deterministic stats *and* semantic embedding on the same corpus. These answer different questions:

- The **deterministic stats** answer *do you sound like the genre Calvino was writing in?* Numerical, reproducible, length-sensitive. Word count, oral time, sentence length, lexical density, quoted-material ratio, first-person density. A student can verify any of these by hand.
- The **embedding map** answers *do you engage Calvino's actual themes?* Semantic, geometric, approximate. A draft about *crystals and clocks* lands in the *Exactitude* cluster; a draft about *transformations and many simultaneous stories* lands in *Multiplicity*. The map doesn't tell you *why* — it places a dot.

Either alone would be misleading. The deterministic stats can be gamed (write 8,000 words of slop with the right sentence-length distribution); the embedding map can be gamed (write a paragraph that sounds *like* Calvino-Exactitude but is incoherent). Both together is the discipline — a draft has to *sound right and mean something*. The student looks at both. No combined score.

The same posture as [`oral-exam-practice-bot`](../oral-exam-practice-bot/) — measurement without verdict.

### Move 2 — Offline corpus embedding, live student-draft projection

The architecturally interesting bit. Embedding Calvino's ~600 paragraphs at request time would burn 600 API calls per page load. Embedding *only* the student's paragraphs live is the asymmetry that makes the page possible:

- The Calvino corpus is embedded **once, offline**, by [`operations/build-embeddings.py`](operations/build-embeddings.py). The output (`embeddings.json`, ~5 MB) ships in the JS bundle. Both 2D coordinates *and* the original 256-dim vectors travel along — the vectors are needed for the live k-NN.
- The student's paragraphs are embedded **live, server-side**, one at a time, via [`operations/embed-api-proxy.js`](operations/embed-api-proxy.js). The API key stays in `process.env`; the browser never sees it.
- The student's vector is projected into the 2D space via **k-NN weighted centroid** over the Calvino points. UMAP doesn't have a deterministic `transform(new_point)`; k-NN is the right approximation. Ships in the browser. Fast.

The k-NN projection is honest about itself: a user dot lands roughly where UMAP would have placed it, weighted toward semantic neighbors. The map doesn't promise more than it can deliver.

### Move 3 — An LLM-mediated OCR pipeline as a first-class part of the substance

The cleaned markdown in [`inputs/memos/`](inputs/memos/) is not a found object — it was produced by a substantial pipeline. *Three* OCR engines (Tesseract for the baseline, Claude vision for Italian typography, Gemini vision for footnotes and headers) run on each scanned page. A reconciler aligns the three transcripts token by token; for every token where the engines disagree, a Claude-vision judge gets the image crop plus the three candidates and picks the right answer (or proposes a different one).

This is the **cheap-vote-where-possible, expensive-judge-where-needed** pattern — exactly the same posture as [`oral-exam-practice-bot`'s two-stage follow-up generator + judge](../oral-exam-practice-bot/operations/follow-up-prompt.md), applied here to OCR rather than to coaching.

The pipeline is **idempotent per page**: re-running skips pages already done. The OCR's outputs are reviewed by a human (`review-needed.md`) before final acceptance — the model is advisory, not authoritative. See [`operations/ocr-pipeline.md`](operations/ocr-pipeline.md).

This matters for the example because it shows that the *clean inputs* to a literary tool are not free. Getting from a scanned book to "the cleaned markdown of Calvino's five memos" is itself a substantial LLM-mediated operation — and it has its own pattern that ports to other scanned books.

---

## How we built it

**Phase 1 — The OCR pipeline.** First, the corpus. The Mondadori edition of *Lezioni americane* (the Italian title; English: *Six Memos for the Next Millennium*) was scanned in 2-up form. 134 page-spreads. The first instinct was a single OCR pass; the output had ~98% accuracy, which sounds good until you notice that the 2% errors were systematically the italicized book titles, the accented Italian, the long dashes that mark interpolations, the footnote markers. All the editorially-important stuff. So the pipeline grew to three independent OCR passes plus a vote, plus a Claude judge for disagreements, plus a Gemini sweep for QA. Eight numbered scripts plus a critic-extractor; ~3 weeks of evening work.

**Phase 2 — The reading + the measurements.** With the cleaned corpus in hand, the question became: *what is worth measuring about Calvino's lectures?* The first measurement was word count — obvious, useful as a calibration tool for student drafts. Then oral delivery time (because these are lectures, not paragraphs — Calvino was preparing the Norton Lectures at Harvard). Then sentence-length distribution (because that's the *shape* of Calvino's prose at a glance). Each measurement was chosen because *it would teach the student something specific about the genre when they saw their own bar next to Calvino's*. The first-person density chart, in particular, took several iterations to land — early versions normalized differently and obscured the signal.

**Phase 3 — The embedding map.** The map was the harder design problem. The first attempt rendered the embedding map at request time, which was unacceptable (~600 API calls). The second attempt embedded offline but tried to run UMAP in the browser for new points — UMAP doesn't support that. The third attempt — embed offline, project user points via k-NN weighted centroid client-side — is what shipped. The 256-dim `output_dimensionality` setting on Gemini was tuned to make `embeddings.json` shippable without measurable degradation of the 2D layout.

**Phase 4 — The hand-rolled SVG charts.** No chart library. Each chart is ~30 lines of JSX rendering `<rect>` for bars + `<text>` for labels. The decision to skip libraries was about *visual consistency with the embedding map* — the same SVG aesthetic carries through the page, the same dashed-black convention marks the student in every visualization. A chart library would have introduced its own opinions and broken that consistency.

**Phase 5 — The composer + the live re-analysis.** The textarea hooks into `useState`; every keystroke recomputes the analysis (debounced for the embedding API call only). The four-stat strip below the textarea (words, sentences, avg sentence, read-aloud time) gives instant feedback as the student types. The three extra panels appear on first non-empty input. The "load sample" link is a single-click way for a student to see what the page does without committing to writing anything.

**Phase 6 — Deploy.** Vercel, project root at `apps/mw-project-002/`. `GEMINI_API_KEY` in the project's environment variables. SPA rewrite rule in `vercel.json` so `/memos` doesn't 404 on direct navigation. The repo's other apps (`apps/interface/`) get their own deployments at different subdomains.

### Things this approach taught us

The two analyses are stronger together than either alone. A student who passes one but fails the other has learned something specific: *my prose has Calvino-shaped surface features but lands in the wrong corner of the semantic map* (or vice versa). The deterministic stats are reproducible by hand; the embedding map is approximate but semantic; the page invites the student to triangulate.

Hand-rolled SVG is the right call when the visual aesthetic is part of the artifact. The page reads as a piece of academic-print typography (stone-50 background, serif headings, narrow column width, no chrome). A chart library would have produced charts that *looked like a chart library*. Hand-rolling let the charts inherit the page's visual language.

The k-NN projection's *approximate* nature is itself pedagogical. The map doesn't say *"you are precisely here"* — it says *"here, approximately, based on these eight neighbors."* The honesty about approximation is part of why the map is useful as a learning tool. A student who treats the dot as gospel has misunderstood; a student who reads the placement as *one signal among several* has the right relationship.

The OCR pipeline's three-engines-plus-judge pattern generalized cleanly to two other contexts in the wider Calvino project: extracting clean text from critic PDFs (each PDF a different shape; the judge handles the format variance) and reconciling translation variants of Italian phrases (different translators disagree; the judge picks). Three-and-a-judge is the move; the engines vary by domain.

The OCR's `review-needed.md` queue is the project's honest disclosure. The model isn't authoritative on its own output; suspect passages are flagged, a human decides. That trust posture is what makes the cleaned corpus shippable as the *reading text*.

---

## What you can translate this to

The pattern is **a literary corpus + deterministic-stats analysis + offline-embedding 2D map + live-student-draft projection through both**, plus the upstream **LLM-mediated OCR pipeline** as a first-class part of the substance. Each piece is independently reusable; together they're a full "by-the-numbers" page for an author's corpus.

Domains where the pattern ports almost verbatim:

- **Any single-author corpus a course teaches deeply.** Joyce, Woolf, Borges, Sebald — corpora rich enough to embed meaningfully and stylistically distinctive enough that deterministic stats reveal voice. Replace [`inputs/memos/`](inputs/memos/) with the author's texts; run [`operations/build-embeddings.py`](operations/build-embeddings.py); update [`operations/deterministic-text-analysis.md`](operations/deterministic-text-analysis.md)'s formulas as needed (some authors have signature features that need their own metric).
- **A philosophical school's primary texts.** Wittgenstein's *Investigations* by remark, Heidegger's *Being and Time* by section, the Pre-Socratic fragments. Students write their own remark / section / fragment; the map shows where they land.
- **A journal or magazine's writing register.** *n+1*'s essays, the *London Review*, *Critical Inquiry*. Each periodical has measurable house-style features; students writing a submission can calibrate against the corpus.
- **A working scholar's own corpus.** A graduate student building their voice can embed their own published papers and see where their drafts land. Are they writing more like their early papers or their recent ones? Has their average sentence length crept up? The page becomes a self-audit tool.
- **A historical author's complete works for digital-humanities study.** Combined with the OCR pipeline, this is also a viable approach to corpora that exist only as scans (older critical editions, out-of-print books, pre-Unicode source texts in non-Roman scripts).

Candidate operations a workshop attendee could add against the same architecture:

- **`/api/critique-stats`** — a Claude call that reads the student's deterministic stats and writes a one-paragraph reading of where the draft is and isn't like Calvino. Brings the page back into LLM-prompt territory.
- **Per-memo deep-dive pages** — `/memos/lightness`, `/memos/quickness`, etc. Each one shows the chosen memo's deterministic stats in detail, with the paragraphs of that memo as a scrollable annotated reading.
- **A "drift" view** — given a student's draft revision history, plot how their dot moves through the embedding space over successive drafts. Pedagogically: *is your prose converging or wandering?*
- **A `/critics` page** — the same analyses but for the critic essays in [`inputs/critics/`](inputs/critics/), so the student can see how Codrescu and D0D1X write *about* Calvino, in addition to how Calvino writes.

The pattern in all of these is the same: a structured corpus produced by a defensible pipeline, multiple analyses that triangulate, a live student-draft option, hand-rolled visualizations that carry the page's aesthetic, no aggregate score.

---

## Alignment constraints (the hard ones)

These come from the production project and survive translation:

- **No grade, no overall score.** Every chart shows one dimension. The map shows another. The student looks at them all.
- **Two analyses, both necessary.** The deterministic stats are reproducible-by-hand; the embedding map is semantic-but-approximate. Either alone is gameable. Both together is the discipline.
- **Embed the canonical corpus offline; embed user inputs live.** The asymmetry is the architecture.
- **Same embedding model on both sides.** Same model, same task type, same dimensionality, same normalization. Without this, cosine distances are meaningless.
- **k-NN weighted centroid for live projection.** UMAP doesn't have a deterministic transform; running it per request is wrong; t-SNE is unstable. k-NN is the right approximation.
- **Hand-rolled SVG.** No chart library. The visual aesthetic of the page is part of the page.
- **The student's bar is dashed; the student's dots are dashed-outline black.** Consistent visual convention across all visualizations.
- **The OCR pipeline's review queue is the trust contract.** Re-OCR'd suspect passages get human review before acceptance. The model is advisory, not authoritative.
- **Three engines, one judge.** For OCR (and other reconciliation problems): cheap-vote-where-possible, expensive-judge-where-needed.
- **Server-side API keys.** `GEMINI_API_KEY` in `process.env`. The browser never sees it.
- **One dimension per chart.** Resist combining metrics. The student should leave the page able to name what each measurement counted.
