# Operation — Dynamic content routing (any `_content/<folder>/` → a navigable site)

*A small but load-bearing piece of architecture: drop a folder of MDX files into `_content/`, and Next.js renders it as a sidebar-navigated documentation site at `/<folder>/`. No code change required. Lives in production as [`app/[folder]/[[...slug]]/page.tsx`](https://github.com/bok-learning-lab/gened-1049/blob/main/app/%5Bfolder%5D/%5B%5B...slug%5D%5D/page.tsx) and the helpers in [`app/[folder]/_lib/`](https://github.com/bok-learning-lab/gened-1049/blob/main/app/%5Bfolder%5D/_lib/) and [`app/[folder]/_components/`](https://github.com/bok-learning-lab/gened-1049/blob/main/app/%5Bfolder%5D/_components/).*

---

## What it does

The production site ships with two top-level "books":

- `_content/gened-1049/` → routes under `/gened-1049/*` — the course's workshop overview, cinematography glossary, and AI-for-media-production resources
- `_content/why-vibes-first/` → routes under `/why-vibes-first/*` — the pedagogical manifesto and seven analytical sections

A third or fourth book — `_content/<your-course>/` — needs only an MDX folder. The route, sidebar, navigation order, search-friendly URL structure, and rendering pipeline are inherited automatically.

## The directory contract

```
_content/
├── <folder-name>/                      ← becomes /<folder-name>/
│   ├── README.md                       ← the index page at /<folder-name>/
│   ├── 01-some-section.md              ← /<folder-name>/01-some-section
│   ├── 02-another.md                   ← /<folder-name>/02-another
│   └── subfolder/                      ← nested route /<folder-name>/subfolder/
│       ├── README.md
│       └── entry.md
```

Conventions:

- **Filename = URL slug.** `01-some-section.md` becomes `/<folder>/01-some-section`. Numeric prefixes (`01-`, `02-`) are kept in the URL — they're not stripped — so the sidebar order in the URL matches the order in `ls`.
- **`README.md` is the index.** Each folder's index page is its `README.md`. The route `/<folder>/` renders the folder's `README.md`.
- **Frontmatter is optional.** YAML frontmatter with `title`, `description`, `nav_title`, `sidebar_position` is read where present, but pages without frontmatter still render.
- **MDX is supported.** Files can import React components. (The production app uses this sparingly — most content is plain markdown.)

## The mechanics

The single dynamic route `app/[folder]/[[...slug]]/page.tsx` does the work. Catch-all params:

- `[folder]` — the top-level book name (e.g. `gened-1049`)
- `[[...slug]]` — the optional path inside the book (e.g. `glossary/three-point-lighting`)

At request time, the route reads `_content/<folder>/<slug>.md` (or `<slug>/README.md` for folder indexes), parses MDX, and renders inside a layout that includes the sidebar (built by walking the folder tree) and content-area styling.

A separate `/<folder>/print-all` route renders every file in the folder as one long printable page — useful for sharing a course book as a single PDF.

## Why this matters for a course website

Most course websites lock you into one of:

- **A heavy CMS** (WordPress, Notion-as-CMS, a custom admin UI). Faculty have to learn a tool.
- **A flat README-style site** (GitHub Pages with a single index). No sidebar, no structure.
- **Per-page hand-coded React.** Every new glossary entry requires editing a component.

The dynamic-folder pattern is **none of those.** A faculty member adds a glossary entry by writing a markdown file. The sidebar updates. The print-all view updates. The URL is sane. The MDX support means an interactive component can be embedded inside an otherwise-plain doc when needed.

## How to add a new book to the site

1. Create `_content/<new-book-name>/`.
2. Add a `README.md` for the index page.
3. Add `01-foo.md`, `02-bar.md`, etc. with whatever content.
4. Optional: add `_meta.json` (or rely on filename ordering for the sidebar).
5. Visit `/<new-book-name>/` in the running app. No code change.

## What this operation deliberately doesn't do

- **No multi-author auth.** This is a one-author (or small team) tool. Add Clerk/NextAuth if you need it; the routing engine doesn't assume anything about identity.
- **No comment thread, no annotation layer.** Out of scope. The content site is for *publishing* the course's concepts; discussion happens elsewhere.
- **No build-time generation.** Pages render at request time (or are cached by Next.js). A faculty member editing a markdown file sees the change on save, with `pnpm dev` running.
- **No search index.** Add one if the corpus grows; not needed at the current scale of two books.

## Hard constraints (these survive translation)

- **Filename = slug.** Don't strip prefixes, don't reorder, don't slugify away meaningful characters. The URL is the filename minus the extension.
- **`README.md` is the folder index.** Don't introduce a separate `index.md` convention or a special-name file; use what every developer already knows.
- **MDX is opt-in, not required.** A folder of plain `.md` files should work without any imports. The MDX pipeline is there when an embedded component is genuinely the right move, not as a default tax.
- **The engine is general; the content is specific.** Resist the temptation to add course-specific logic into the routing layer. New courses are new folders, not new routes.
