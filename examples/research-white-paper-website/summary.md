# Research white paper website — a thin viewer over a research-in-progress folder

A worked example of **publishing research-in-progress with about 150 lines of Next.js code**. No CMS, no headless content layer, no rewriting research as web posts — the markdown files the researcher writes for themselves *are* the published content; the website is a friendly viewer over the file tree. Drawn from the production site at <https://harvest-times.vercel.app/>, the public research site for an investigation into Anglo-Saxon harvest-time pharmacology.

> **Live site:** <https://harvest-times.vercel.app/> — navigate by section card on the landing page, or click into any markdown / text / PDF in `sources/`, `analysis/`, `drafts/`, `proposal/`, `agent-output/`.
>
> **Source repo:** <https://github.com/ll-catacomb/harvest-times> — the production Next.js app, deployed to Vercel. The repo is the research; the site is the viewer.

This is the sixth deployed-webapp example in the gallery and the second research-content example (alongside [`film-course-concepts-website`](../film-course-concepts-website/)). It's the simplest deployed-webapp example by code surface — ~150 lines of Next.js for the entire viewer — and one of the most directly reusable. The whole architecture is in [`operations/research-site-architecture.md`](operations/research-site-architecture.md); the agent-output firebreak convention is in [`operations/agent-output-firebreak.md`](operations/agent-output-firebreak.md).

---

## What it is

A single Next.js app with three routes that together produce a navigable research site:

- **`/`** — landing page. Renders the repo's `README.md` plus five section cards (one per top-level research folder). See [`operations/app-page.tsx`](operations/app-page.tsx).
- **`/browse/[...path]`** — the dynamic catch-all route. Renders directories (sorted file listings) or files (markdown via `react-markdown`, plain text in `<pre>`, PDFs in `<iframe>`, anything else as a download link). Gated by `ensureSafe()` so the browse route can only read files under the five declared section roots. See [`operations/browse-page.tsx`](operations/browse-page.tsx).
- **`/api/file/[...path]`** — a thin serverless route returning raw bytes for PDFs and other binary downloads.

That's the whole architecture. The research itself lives in five folders at the repo root:

- **`sources/`** — primary texts and PDFs (Old English Herbarium translation, Review of Scholarship).
- **`analysis/`** — the researcher's analytical work (candidate remedies, expanded candidates, deep research findings, theoretical framework, paper arcs).
- **`drafts/`** — working paper drafts (ethnopharmacology, intellectual history, folklore).
- **`proposal/`** — the experimental proposal (6 proposed experiments).
- **`agent-output/`** — AI-generated drafts, syntheses, and bibliographies, kept structurally distinct.

The substance the example reproduces in this folder:

- [`inputs/sources/old_english_herbarium.txt`](inputs/sources/old_english_herbarium.txt) and [`inputs/sources/review_of_scholarship.txt`](inputs/sources/review_of_scholarship.txt) — the primary sources (plain text; the original PDFs aren't copied because of size).
- [`operations/lib-content.ts`](operations/lib-content.ts) — the `SECTIONS` array, the `ensureSafe()` guard, the file readers. Copied verbatim, ~95 lines.
- [`operations/app-page.tsx`](operations/app-page.tsx), [`operations/browse-page.tsx`](operations/browse-page.tsx), [`operations/Markdown.tsx`](operations/Markdown.tsx) — the page code, copied verbatim.
- [`operations/research-site-architecture.md`](operations/research-site-architecture.md) — the whole architecture documented.
- [`operations/agent-output-firebreak.md`](operations/agent-output-firebreak.md) — the human/AI authorship convention documented.
- [`outputs/candidate_remedies.md`](outputs/candidate_remedies.md), [`outputs/theoretical_framework.md`](outputs/theoretical_framework.md), [`outputs/experimental_proposal.md`](outputs/experimental_proposal.md) — a representative slice of the research substance.
- [`outputs/agent-output-sample-van-arsdall.md`](outputs/agent-output-sample-van-arsdall.md) — one agent-output file showing what lives behind the firebreak.
- [`outputs/_source-snapshot.md`](outputs/_source-snapshot.md) — the Next.js architecture in one document.
- [`outputs/worked-research-summary.md`](outputs/worked-research-summary.md) — a reader's guide to the research arc.

---

## The moves worth noticing

**Three moves that together make this work as a research-publishing pattern.**

### Move 1 — File tree as navigation, repo root as content root

Most research-publication tools rebuild research as web content — paste your paper into a CMS, copy your notes into a wiki, export to Substack. This site's commitment is the opposite: **the markdown files you wrote for yourself are the published content**.

That commitment shapes every design decision:

- **No `_content/` directory.** Section folders live at the repo root, where a researcher would put them if there were no website. Adding the site doesn't change where the files go.
- **No frontmatter required.** Markdown files don't need YAML headers. The site renders whatever's there.
- **Relative links work the same way in your editor and on the web.** A markdown file at `analysis/candidate_remedies.md` containing `[theoretical framework](theoretical_framework.md)` produces a link to `/browse/analysis/theoretical_framework.md`. The [`Markdown.tsx`](operations/Markdown.tsx) component's link rewriter handles this in ~15 lines.
- **No build step for content.** Edit a markdown file, push, refresh.

Compare to [`film-course-concepts-website`](../film-course-concepts-website/), which uses a `_content/<folder>/` convention. Both work; this site's choice — content folders at the repo root — is the right one for a *research-in-progress* use case where the researcher reads the same files as the reader. The film-course site is for prepared-then-published content; the harvest-times site is for working-in-the-open.

### Move 2 — Safe-prefix routing as the one piece of hard code

The `[...path]` route accepts an arbitrary path and reads from disk. The hard security constraint: **the request must not be able to read anything outside the declared sections.** That's enforced by `ensureSafe()` in [`operations/lib-content.ts`](operations/lib-content.ts):

```typescript
const SAFE_PREFIXES = SECTIONS.map((s) => s.slug);

function ensureSafe(parts: string[]): string {
  if (parts.length === 0) throw new Error("empty path");
  if (!SAFE_PREFIXES.includes(parts[0])) throw new Error("forbidden");
  const full = path.normalize(path.join(ROOT, ...parts));
  const sectionRoot = path.join(ROOT, parts[0]);
  if (!full.startsWith(sectionRoot)) throw new Error("traversal");
  return full;
}
```

Three checks (non-empty, first-part-is-a-section, post-normalization-stays-under-section-root), and every file-reading function routes through this guard. Get this wrong and the site exposes the whole filesystem; get this right and the site can serve anything under the declared sections without further security ceremony.

This is the *one* hard piece of code in the otherwise-thin viewer. The rest is short by design — five file-type branches in the browse route cover most research artifacts, the Markdown component is ~35 lines, the landing page is ~30 lines.

### Move 3 — The agent-output firebreak

The research repo dedicates **one top-level section** (`agent-output/`) to AI-generated artifacts, kept structurally distinct from human-authored research. The reader navigating the site can see, on the landing page, that there's a separate section for AI work — and can click in to see exactly what the AI was producing during the research process.

This is *one* of the structural moves the gallery has been collecting under the banner of *make AI's role legible in the artifact, not hidden in a footnote*:

- [`oral-exam-practice-bot`](../oral-exam-practice-bot/) — no-grading constitution (the model is structurally prevented from grading).
- [`image-API-widget`](../image-API-widget/) — rules-in-UI conceit (the critical framework is rendered in the sidebar, tied to specific controls).
- [`literature-course-concept-website`](../literature-course-concept-website/) — three-failure-modes pedagogical arc (three demos each fail differently; the contrast is the lesson).
- [`film-course-concepts-website`](../film-course-concepts-website/) — "AI as Lab Partner, Not Ghostwriter" framing (curriculum-layer commitment about what AI does and doesn't do).
- **This site** — the agent-output firebreak (AI-generated artifacts get their own top-level navigation section).

The common move: **structural visibility of AI's role**, not a footnote disclosure. See [`operations/agent-output-firebreak.md`](operations/agent-output-firebreak.md) for the convention in detail.

---

## How we built it

**Phase 1 — The research-as-folder commitment.** Before writing any website code, the question was: *can the research be published without re-authoring it?* The researcher already had markdown files for analysis, drafts, and a proposal; PDFs for primary sources; AI-generated drafts in an `agent-output/` folder. The answer: yes, if the website can read the file tree directly and render the markdown that's already there.

**Phase 2 — `ensureSafe()` first.** Before the routing, before the UI, the safe-prefix guard. The five section slugs were declared in `SECTIONS`; `ensureSafe()` was tested against directory traversal and disallowed prefixes; only after that worked did the routing get built on top.

**Phase 3 — The minimal browse route.** A single `[...path]` page that handles directory listings and four file-type renderings (markdown, text, PDF, fallback). Total: ~115 lines. The fallback is intentionally a "download" link — better to gracefully degrade than to invent a renderer for every possible file type.

**Phase 4 — Relative-link rewriting in markdown.** The single design move that makes editor-fidelity work. `[link](../analysis/candidate_remedies.md)` from `drafts/paper1_ethnopharmacology.md` resolves to `/browse/analysis/candidate_remedies.md` via ~15 lines of path arithmetic in [`Markdown.tsx`](operations/Markdown.tsx). External links (`http://`, `https://`, `mailto:`) and anchors (`#section`) pass through unchanged.

**Phase 5 — The academic-paper typography.** `globals.css` defines `--color-paper` (warm cream), `--color-rule` (faint gray), `--color-accent` (deep red), serif headings, narrow column. The site reads as an academic paper. No theme switcher — the typographic identity is part of the artifact.

**Phase 6 — The agent-output firebreak.** Adding `agent-output` to the `SECTIONS` array put it on equal footing with the four human-authored sections. The blurb plainly states "generated by AI agents." The reader sees, on the landing page, that there's a separate section for AI work.

**Phase 7 — Deploy.** Vercel, no env vars required. The site is purely static at runtime; no API keys, no inference providers, no model calls.

### Things this approach taught us

The repo IS the publication. Once you commit to reading the file tree directly, you stop thinking about "publishing" as a separate workflow. The researcher writes; the site reads; the reader navigates. There is no intermediate "publish" step.

Frontmatter is overhead at this scale. Smaller research projects don't benefit from a metadata schema; the filename and the section ARE the metadata. Adding YAML frontmatter would introduce an authoring tax for no reader benefit.

Relative-link rewriting is the load-bearing piece for editor-fidelity. Without it, the researcher would have to write `[link](/browse/analysis/x.md)` (a URL) in their markdown, which breaks in the editor. With it, they write `[link](../analysis/x.md)` (a relative path) and both contexts work. This is what makes the *"the markdown I edit is the markdown you read"* commitment real.

`ensureSafe()` is the only piece of code that needs to be defensive. Everything else can assume the path is already validated. Concentrating the security check at one boundary makes the rest of the code radically simpler.

The agent-output firebreak changes how a reader trusts the research. Without it, a polished paper hides AI provenance; with it, the AI's outputs are right there to inspect. The firebreak doesn't *prevent* AI from influencing the human-authored work — of course it does — but it makes the AI artifacts *available as a separate reference object*, which is what auditability actually requires.

Pages render at request time, not at build time, on purpose. `generateStaticParams()` returns `[]`. A researcher who pushes a new markdown file sees it live as soon as Vercel rebuilds the small Next.js code (which doesn't depend on content). Build-time static generation would require declaring all paths up front; with request-time rendering, new content just works.

---

## What you can translate this to

The pattern is **a thin Next.js viewer with five (or three, or seven) safe-prefix sections at the repo root, rendering markdown / text / PDF**. The 150 lines of Next.js code port nearly verbatim. The substance — your research — replaces this site's substance. Specifically:

- **Any working scholar with markdown-formatted research notes.** Drop your notes into section folders at the repo root, declare the slugs in `SECTIONS`, deploy to Vercel. ~30 minutes from clone to live.
- **Doctoral students preparing dissertations.** Section folders like `{ chapters, citations, drafts, archive, agent-output }`.
- **Lab notebooks for empirical research.** `{ protocols, raw-data-summaries, analyses, drafts, agent-output }` (point at the raw-data-summaries rather than the actual large data files).
- **Reading groups and seminar journals.** `{ readings, notes, discussion-summaries, drafts, agent-output }`.
- **Editorial projects with multiple contributors.** Each contributor owns a subdirectory under a section; the firebreak applies to whichever contributors used AI assistance.
- **Open peer review.** The reviewer reads the public research-in-progress site and submits notes via the repo's PR workflow; the site stays read-only and remains the canonical reference for the reviewed material.

Candidate operations a workshop attendee could add against the same architecture:

- **Per-section landing pages** — a custom `app/browse/<section>/page.tsx` that overrides the generic directory rendering with a curated entry point for that section (e.g., a TL;DR of `analysis/` before the file list).
- **A search index** — when the corpus grows past skim-navigation, add full-text search via Pagefind or a similar build-time indexer.
- **A static PDF export** — a `/print` route that concatenates all human-authored markdown into a printable single page (and optionally a separate `/print/agent-output` for the AI material).
- **A "diff" view between agent-output and downstream analysis** — for a given agent-generated document, show which paragraphs the researcher absorbed into the human-authored work and which they didn't. Would require running an embedding-similarity step at build time.
- **Citation extraction** — walk all markdown for `[author year](url)` style citations and produce a per-section bibliography.

---

## Alignment constraints (the hard ones)

These come from the production project and survive translation:

- **The repo root is the navigation root.** Section folders at the repo root, not in `_content/` or `content/` or anywhere hidden. The researcher reads and edits the same paths that get URLs.
- **Safe-prefix routing is non-negotiable.** Every file-read must go through `ensureSafe()`. Don't add a back-door reader function that skips the check.
- **No frontmatter required.** Markdown files render as-is. Don't introduce a YAML metadata system that breaks "open in editor and edit."
- **Relative links resolve the same in the editor and the browser.** The Markdown component's link rewriter is load-bearing.
- **Agent-output is a top-level section, not nested.** The firebreak only works if it's visible from the landing page next to the human-authored sections.
- **Agent-output is kept in original form.** Not polished after the fact; if you absorb parts, take them into `analysis/` or `drafts/` and leave the original intact.
- **Honest labels.** No euphemism. The `agent-output` section's blurb says "generated by AI agents."
- **Read-only by default.** No edit UI. The site reads; the researcher edits in their editor.
- **No LLM call at runtime.** The site is fully static. Where AI is used, the outputs live as static files in `agent-output/`.
