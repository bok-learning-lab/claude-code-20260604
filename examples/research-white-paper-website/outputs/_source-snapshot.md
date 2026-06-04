# Source snapshot — the running site this example is drawn from

*This document stands in for copying the full Next.js app source into the example folder. The live site is at <https://harvest-times.vercel.app/>; the repo is [ll-catacomb/harvest-times](https://github.com/ll-catacomb/harvest-times). What follows is enough to read the site's shape without cloning it.*

---

## What the site is

A **thin file-browser viewer** over a research-in-progress repository. ~150 lines of Next.js code render the repo's existing markdown / text / PDF files as a navigable site. The substance is the research (an investigation into whether Anglo-Saxon harvest-time instructions in the *Old English Herbarium* correlate with modern pharmacological evidence for peak bioactive compound concentration); the site is the *reading apparatus*.

The whole site:

- **Landing page** at `/` — renders the repo's `README.md` plus five navigation cards, one per top-level research section.
- **Browse page** at `/browse/<...path>` — a dynamic catch-all route that renders directories (sorted file listings with size) and files (markdown via `react-markdown`, plain text in `<pre>`, PDF in `<iframe>`, anything else as a download link).
- **File proxy** at `/api/file/<...path>` — a thin serverless route that returns raw bytes for PDFs (used by the iframe) and any other binary downloads.
- **Not-found page** at `/not-found.tsx` — standard 404.

That's it. Five files of substance, plus a `globals.css` for the academic-paper typography (warm cream, serif headings, narrow column).

## What's at each route

| Route | Source | What it renders |
|---|---|---|
| `/` | `app/page.tsx` (~30 lines) | The repo's `README.md` + five section cards |
| `/browse/<section>/<...>` | `app/browse/[...path]/page.tsx` (~110 lines) | Dynamic file or directory rendering, gated by `ensureSafe()` |
| `/api/file/<...>` | `app/api/file/[...path]/route.ts` | Raw byte response, gated by the same safe-prefix check |

## Repo layout

```
harvest-times/                          (single Next.js app, NOT a workspace)
├── README.md                            ← landing-page content (rendered on /)
├── package.json                         ← Next 15.1, React 19, react-markdown, remark-gfm, Tailwind v4
├── next.config.ts
├── tsconfig.json
├── app/
│   ├── page.tsx                        ← landing page
│   ├── layout.tsx                       ← root layout (typography, link to README)
│   ├── globals.css                      ← academic-paper styling
│   ├── not-found.tsx
│   ├── browse/[...path]/
│   │   └── page.tsx                    ← dynamic browse route (mirrored to operations/browse-page.tsx)
│   └── api/file/[...path]/
│       └── route.ts                    ← raw-bytes proxy (for PDFs / downloads)
├── lib/
│   └── content.ts                       ← SECTIONS array + ensureSafe + readers (mirrored to operations/lib-content.ts)
├── components/
│   └── Markdown.tsx                     ← MDX-less markdown renderer with relative-link rewriting (mirrored to operations/Markdown.tsx)
├── sources/                             ← Section 1: primary texts and PDFs
│   ├── old_english_herbarium.txt        ← Van Arsdall translation, plain-text extract (~228KB)
│   ├── review_of_scholarship.txt        ← Madeleine's Review of Scholarship (44KB)
│   ├── The Old English Herbarium_25_03_08_13_00_50.pdf  (~16MB)
│   └── Review of Scholarship.pdf        ← (360KB)
├── analysis/                            ← Section 2: the researcher's analytical work
│   ├── candidate_remedies.md            ← Tier 1: 14 candidates, 9 with strong pharmacology alignment
│   ├── expanded_candidates.md           ← Round 2: peony, navelwort, madder, etc.
│   ├── deep_research_findings.md        ← Extended: Pasquinelli, diurnal variation, lunar chronobiology, iron chemistry, Bald's Leechbook
│   ├── theoretical_framework.md
│   └── paper_arcs.md
├── drafts/                              ← Section 3: working paper drafts
│   ├── paper1_ethnopharmacology.md
│   ├── paper2_intellectual_history.md
│   ├── paper3_folklore.md
│   ├── sources_to_acquire.md
│   └── sources_split_books_articles.md
├── proposal/                            ← Section 4: the experimental proposal
│   └── experimental_proposal.md         ← 6 proposed experiments, methodology, framing
└── agent-output/                        ← Section 5: AI-generated artifacts (the firebreak)
    ├── read-through-2026-05-05.md       ← agent-generated read-through of the Herbarium
    └── van-arsdall-translator-choices.md ← agent-generated synthesis of translator choices
```

The five top-level folders (`sources/`, `analysis/`, `drafts/`, `proposal/`, `agent-output/`) are the **only paths the site can read**. The `ensureSafe()` guard in [`operations/lib-content.ts`](../operations/lib-content.ts) enforces it. Other repo-root files (`README.md`, `package.json`, `.git/`, etc.) are not reachable through the browse route.

## Tech stack

- **Next.js 15** App Router (the `next.config.ts` is essentially empty).
- **React 19**.
- **TypeScript 5**.
- **Tailwind CSS v4** for layout + the `--color-paper / --color-rule / --color-accent` CSS variables that drive the academic-paper look.
- **`react-markdown`** + **`remark-gfm`** for GitHub-flavored markdown rendering. No MDX — the markdown files are plain markdown, deliberately editor-friendly.
- **No CMS, no headless content layer, no Sanity, no Notion, no Contentful.** The filesystem IS the content store.
- **No env vars required.** The site is fully static at runtime; no API keys, no inference providers, no model calls.

## Deployment

- **Vercel.** Single-project deployment from the repo root.
- Live at <https://harvest-times.vercel.app/>.

## What's *not* here (and why)

- **No CMS.** Markdown files are the content. Edits happen in an editor, commits land via git, the site re-reads from disk on every request.
- **No search.** Five sections of medium markdown isn't a search problem. Readers navigate by section and skim within files. Add full-text search when the corpus grows past what skim-navigation handles.
- **No tags / categories / per-file metadata.** Filename and section ARE the metadata. Resisting frontmatter is part of the design.
- **No build-time static generation.** `generateStaticParams()` returns `[]`. Pages render at request time (and are cached by Next.js's default behavior). Adding static-export of popular paths is straightforward but unnecessary at this scale.
- **No accounts, no auth, no comments.** Public reading by URL. Public-facing annotation is a different feature.
- **No LLM call.** The site is purely static at runtime. Where AI was used in the research process, the outputs live in `agent-output/` as static files — see [`operations/agent-output-firebreak.md`](../operations/agent-output-firebreak.md).
- **No analytics.** (Vercel's default metrics may be on.)
- **No edit-in-browser surface.** The site is read-only. Edits flow editor → git → site.

## How a researcher would adapt this for their own work

The reusable shape:

1. **Decide your top-level sections.** Three to seven, named for what's in them. The pattern in this site is `{ sources, analysis, drafts, proposal, agent-output }`; an oral-history project might use `{ interviews, transcripts, fieldnotes, coding, analysis, drafts, agent-output }`; an archival study might use `{ archives, transcripts, annotations, drafts, manuscripts, agent-output }`. **Include an `agent-output/` section** if AI assisted the work — see [`operations/agent-output-firebreak.md`](../operations/agent-output-firebreak.md) for why.
2. **Edit the `SECTIONS` array** in [`operations/lib-content.ts`](../operations/lib-content.ts) with your sections.
3. **Make sure each section is a real folder** at the repo root, containing the markdown/text/PDF files of that section.
4. **Tune the typography** in `globals.css` to taste. The default is academic-cream.
5. **Deploy to Vercel.** No env vars required.

The 150 lines of Next.js code in [`operations/`](../operations/) port directly. The substance — your research — replaces this site's substance.
