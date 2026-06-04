# CLAUDE.md — Research white paper website

Project-level instructions loaded when Claude Code starts in this folder.

## What this example is

A worked example of a **thin Next.js viewer over a research-in-progress folder** — about 150 lines of code that turn five top-level folders (`sources/`, `analysis/`, `drafts/`, `proposal/`, `agent-output/`) into a navigable static site. Drawn from the production project at <https://harvest-times.vercel.app/>, the public research site for an investigation into whether Anglo-Saxon harvest-time instructions correlate with modern pharmacological evidence for peak bioactive compound concentration (the *Old English Herbarium*, ~10th century). Key finding: **9 of 11 testable candidates (82%) show alignment.**

This is the sixth deployed-webapp example in the gallery and the second research-content example (after [`film-course-concepts-website`](../film-course-concepts-website/)). It's structurally simpler than the others — no LLM call anywhere, no complex client state, no interactive concept demos. Its substance is in three places: the *research itself* (in the file tree), the *thin viewer architecture* (in `operations/`), and the *agent-output firebreak convention* that makes AI-assisted work auditable next to human-authored research.

See [summary.md](summary.md) for the moves worth noticing and what you can translate them to.

## If you just opened this folder

Read in this order:

1. [summary.md](summary.md) — what this is, the three moves worth noticing (file-tree-as-navigation, safe-prefix routing, the agent-output firebreak), how it was built, what you can translate it to. **Live site + source repo linked at the top.**
2. [operations/research-site-architecture.md](operations/research-site-architecture.md) — the file-tree-as-navigation pattern, the safe-prefix routing, the relative-link rewriting. The site's whole architecture in one document.
3. [operations/agent-output-firebreak.md](operations/agent-output-firebreak.md) — the structural convention that keeps AI-generated artifacts in their own visible section, making the research auditable.
4. The four code files in [`operations/`](operations/) — the actual Next.js source, copied verbatim:
   - [operations/lib-content.ts](operations/lib-content.ts) — the `SECTIONS` array + `ensureSafe()` guard + readers (~95 lines)
   - [operations/app-page.tsx](operations/app-page.tsx) — the landing page (~30 lines)
   - [operations/browse-page.tsx](operations/browse-page.tsx) — the dynamic browse route (~115 lines)
   - [operations/Markdown.tsx](operations/Markdown.tsx) — the markdown renderer with relative-link rewriting (~35 lines)
5. [outputs/_source-snapshot.md](outputs/_source-snapshot.md) — the Next.js architecture in one document.
6. [outputs/worked-research-summary.md](outputs/worked-research-summary.md) — a reader's guide to the research substance, the four-tier reading arc, the file-by-file map.
7. The representative research files in [`outputs/`](outputs/) — `candidate_remedies.md`, `theoretical_framework.md`, `experimental_proposal.md`, `agent-output-sample-van-arsdall.md`.

## How to work in this project

You are reading an example of **a deliberately thin viewer over a researcher's working folder**. The substance is in two places that must be understood together:

1. **The research itself** — the markdown / text / PDF files in `sources/`, `analysis/`, `drafts/`, `proposal/`, and `agent-output/` (mirrored as representative slices in this example's `inputs/` and `outputs/`). This is *the work the site exposes*.
2. **The thin architecture** — `lib-content.ts` + `app-page.tsx` + `browse-page.tsx` + `Markdown.tsx` (mirrored as `operations/*` here). This is *how the site exposes the work* without re-authoring it.

Two passes, in order:

1. **Read the architecture docs first.** [`operations/research-site-architecture.md`](operations/research-site-architecture.md) explains the file-tree-as-navigation pattern; [`operations/agent-output-firebreak.md`](operations/agent-output-firebreak.md) explains the human/AI authorship convention. Without these, the four code files look like ordinary Next.js routes; with them, the architectural commitments are visible.
2. **Then look at the code.** The four files in [`operations/`](operations/) are short — together they fit in your head. The whole site is ~150 lines of substance.

## The pipeline

The site has *no* request-time pipeline beyond reading a file from disk:

| Step | What | Where |
|---|---|---|
| 1 | Researcher edits markdown in their editor | Local |
| 2 | Researcher commits + pushes | git → GitHub |
| 3 | Vercel rebuilds (no build step for content; rebuild is just the Next.js code) | Vercel |
| 4 | Reader visits a URL | Browser |
| 5 | Next.js reads `app/browse/[...path]/page.tsx` for the requested path | Server |
| 6 | `ensureSafe(parts)` verifies the path is under one of the five section roots | [`lib-content.ts`](operations/lib-content.ts) |
| 7 | `readText(parts)` (or `readBinary`, or `listDir`) returns the file/directory | [`lib-content.ts`](operations/lib-content.ts) |
| 8 | The browse page dispatches by file type (markdown → `Markdown` component; text → `<pre>`; PDF → `<iframe>`) | [`browse-page.tsx`](operations/browse-page.tsx) |
| 9 | The Markdown component rewrites relative links to `/browse/...` URLs | [`Markdown.tsx`](operations/Markdown.tsx) |
| 10 | Reader sees the rendered page | Browser |

That's the whole pipeline. No LLM call, no database, no headless CMS, no inference provider. The site is purely static at runtime.

## Conventions

- **`inputs/sources/` holds the primary research sources** the work is built on (Old English Herbarium, Review of Scholarship — both as plain text; the original PDFs aren't copied because of size).
- **`operations/` holds the site code copied verbatim** plus two architecture documents. Total: ~285 lines of substance.
- **`outputs/` holds a representative slice of the research substance** plus the source-snapshot and a research-summary reader's guide.
- **No emojis** in any file (workshop-wide convention).
- **Markdown link syntax** for file references — `[file](path/to/file.md)`.

## Alignment constraints (the hard ones)

These come from the production project and survive translation:

- **The repo root is the navigation root.** Section folders live at the repo root, not in `_content/`. The researcher reads and edits the same paths that get URLs. This is the difference between editor-first authoring and CMS-first authoring.
- **Safe-prefix routing is non-negotiable.** Every file-read must go through the `ensureSafe()` guard in [`operations/lib-content.ts`](operations/lib-content.ts). Five declared section slugs, no others; normalize the path; reject if it leaves the section root after normalization.
- **No frontmatter required.** Markdown files render as-is. Don't introduce a frontmatter requirement that breaks "open in editor and edit."
- **Relative links resolve the same in the editor and the browser.** The [`Markdown.tsx`](operations/Markdown.tsx) component's link rewriter is the load-bearing piece — `[link](../other.md)` works in both contexts.
- **Agent-output is a top-level section, not nested.** The firebreak only works if AI-generated artifacts are visible from the landing page next to human-authored research. See [`operations/agent-output-firebreak.md`](operations/agent-output-firebreak.md).
- **Agent-output is kept in original form.** Not polished after the fact. If parts of an agent's output are absorbed into the research, that absorbed work goes in `analysis/` or `drafts/` — the original agent-output stays where it was generated.
- **The label is honest.** The `agent-output` section's blurb says "generated by AI agents" — not "AI-assisted notes" or "research aids." Soft language defeats the audit.
- **Read-only by default.** The site doesn't edit. The researcher edits in their editor; the site reads.
- **No LLM call at runtime.** The site is fully static. Where AI was used, the outputs live as static files in `agent-output/`. Same posture as [`film-course-concepts-website`](../film-course-concepts-website/) — a content-rich site with no inference call.
