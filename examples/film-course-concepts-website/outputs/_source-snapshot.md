# Source snapshot — the running site this example is drawn from

*This document stands in for copying the Next.js source code into the example folder. The live site is at [gened-1049.vercel.app](https://gened-1049.vercel.app/); the repo is [bok-learning-lab/gened-1049](https://github.com/bok-learning-lab/gened-1049). What follows is enough to read the site's shape without cloning it.*

---

## What the site is

A course website for **GENED 1049: East Asian Cinema** at Harvard (taught by, among others, the team behind the Bok Center video-production workshop). The site has two distinct functions, served from one Next.js app:

1. **A landing page** with cinematic styling (black background, orange/amber gradient title, editorial crop-marks behind the header) introducing the workshop and linking to two interactive demos.
2. **A content engine** at `app/[folder]/[[...slug]]/page.tsx` that renders any folder of MDX under `_content/` as a sidebar-navigated documentation site. Two top-level books ship today: `gened-1049/` (workshop overview, cinematography glossary, AI-for-media-production resources) and `why-vibes-first/` (the pedagogical manifesto and seven analytical sections).

Plus two hand-built interactive demos that live outside the content engine:

- `app/three-point-lighting/` — the lighting-diagram demo over *Rashomon* stills (see [`operations/interactive-concept-demo.md`](../operations/interactive-concept-demo.md) for the pattern).
- `app/video-essay/01/` — a scroll-synced video essay with editing overlays (see [`example-video-essay.md`](example-video-essay.md)).

## What's at each route

| Route | Source | What it shows |
|---|---|---|
| `/` | `app/page.tsx` | Landing page — gradient title, three cards linking to the demos |
| `/three-point-lighting` | `app/three-point-lighting/page.tsx` | The lighting-diagram demo (sequence of Rashomon stills) |
| `/three-point-lighting/[id]` | `app/three-point-lighting/[id]/page.tsx` | Single-still deep-dive (one still + its diagram + full description) |
| `/video-essay/01` | `app/video-essay/01/page.tsx` | The scroll-synced video essay with editing overlays |
| `/gened-1049` | `app/[folder]/[[...slug]]/page.tsx` (rendering `_content/gened-1049/README.md` or workshop-overview) | Course book index |
| `/gened-1049/glossary/three-point-lighting` | same engine | The glossary entry — markdown rendering of the definition |
| `/gened-1049/ai-resources/04-using-ai` | same engine | The AI-as-lab-partner doc |
| `/why-vibes-first` | same engine | The vibes-first book index |
| `/why-vibes-first/manifesto` | same engine | The manifesto |
| `/<folder>/print-all` | `app/[folder]/print-all/page.tsx` | A long printable page concatenating every file in the book |

## Repo layout

```
gened-1049/                              (single Next.js app — NOT a pnpm workspace)
├── _content/
│   ├── gened-1049/                      ← course book
│   │   ├── workshop-overview.md
│   │   ├── glossary/
│   │   │   ├── README.md
│   │   │   ├── three-point-lighting.md
│   │   │   ├── key-light.md / fill-light.md / back-light.md
│   │   │   ├── key-to-fill-ratio.md / practical-lighting.md
│   │   │   └── 180-degree-rule.md / shot-reverse-shot.md
│   │   └── ai-resources/
│   │       ├── README.md             ← the "AI as Lab Partner" framing
│   │       ├── 01-installation.md    ← ffmpeg + yt-dlp install
│   │       ├── 02-yt-dlp.md
│   │       ├── 03-ffmpeg.md
│   │       ├── 04-using-ai.md        ← how to prompt LLMs for technical help
│   │       └── 05-interactive-essays.md
│   └── why-vibes-first/                  ← pedagogical book
│       ├── 00-index.md
│       ├── 01-core-argument.md ... 07-the-future.md
│       └── manifesto.md
├── _context/                              ← internal dev notes (next-up, how-to, features)
│   ├── gened-1049/alina-notes.md
│   ├── gened-1145/vibe-coding-a-scrolling-multimodal-essay.md
│   └── how-to/{add-clerk, add-supabase, add-reactbits, shadcn-nextjs-tailwind4}.md
├── app/
│   ├── page.tsx                        ← landing page (cinematic black/orange)
│   ├── layout.tsx                       ← root layout with theme provider
│   ├── globals.css
│   ├── components/                       ← app-wide components (theme-provider, theme-toggle)
│   ├── three-point-lighting/             ← the interactive lighting demo
│   │   ├── page.tsx                     ← sequence of stills, hero, footer
│   │   ├── stills.ts                    ← the source-of-truth data
│   │   └── [id]/
│   │       ├── page.tsx                 ← per-still deep-dive
│   │       └── LightingDiagram.tsx      ← the top-down diagram component
│   ├── video-essay/01/
│   │   ├── page.tsx
│   │   └── EditingOverlay.tsx           ← scroll-synced overlay layer
│   └── [folder]/                         ← the dynamic content engine
│       ├── [[...slug]]/page.tsx         ← renders MDX from _content/<folder>/<slug>.md
│       ├── layout.tsx                   ← sidebar + content area
│       ├── print-all/page.tsx           ← concatenated-print view
│       ├── styles.css
│       ├── _lib/
│       │   ├── content.ts               ← file walker + frontmatter parser
│       │   ├── content-page.tsx
│       │   └── utils.ts
│       └── _components/
│           ├── docs-layout.tsx
│           ├── sidebar.tsx              ← auto-built from folder tree
│           ├── mdx-content.tsx          ← MDX rendering with custom components
│           ├── theme-script.tsx
│           └── theme-toggle.tsx
├── components/                            ← shared cross-app components (ScrollVideo, ui/, mdx/)
├── lib/                                   ← shared utilities
├── public/
│   ├── Rashomon_001.jpg, _002.jpg, _003.jpg    ← stills for the three-point-lighting demo
│   ├── to-live/                                ← stills for an additional / planned demo
│   ├── video/                                  ← video assets for the video essay
│   └── IMG_2693.jpg, IMG_2694.jpg, IMG_2695.jpg
├── CLAUDE.md
├── package.json                         ← Next.js 16, React, MDX, shadcn/ui
├── pnpm-lock.yaml
└── README.md
```

## Tech stack

- **Next.js 16** App Router. Single app — *not* a pnpm workspace like `oral-exam-practice-bot` or `image-API-widget`.
- **React 19** (Next 16 default).
- **TypeScript 5.**
- **Tailwind CSS v4** + **shadcn/ui** (New York style).
- **MDX** for content. Custom MDX components in `_components/mdx-content.tsx`.
- **`next-themes`** for class-based dark mode (default: dark; the landing page is black-and-orange by design).
- **Geist Sans + Geist Mono** via `next/font/google`.
- **Lucide React** for icons.
- **`pnpm`** as the required package manager (`CLAUDE.md` enforces it; npm/yarn are off-limits).

## Where assets live

- **Film stills** (`Rashomon_001.jpg` ... `_003.jpg`) live in `public/` and are served as static assets. The `stills.ts` data file references them by absolute path (`/Rashomon_001.jpg`).
- **Video** for the scroll-synced essay lives under `public/video/`.
- **No API keys.** The site is fully static at runtime — no LLM calls, no inference providers, no API routes for generation. Compare to `oral-exam-practice-bot` (multiple Claude routes) and `image-API-widget` (one provider-agnostic generation route). This site's intelligence is in the *content* and the *interactive design*, not in a model call.

## Deployment

- **Vercel.** Standard Next.js deployment. Live at <https://gened-1049.vercel.app/>.
- No environment variables required.

## What's *not* here (and why)

- **No CMS, no admin UI.** Content is markdown files in `_content/`. A faculty member edits the file directly and commits.
- **No comment threads, no annotations.** Out of scope.
- **No user accounts, no auth.** The site is published to the open web; access is by URL.
- **No analytics by default.** (Vercel's basic deployment analytics may be on.)
- **No build-time content generation.** Pages render at request time and are cached by Next.js's default behavior. Editing markdown produces an immediate change in `pnpm dev`.
- **No search.** Two books of two-dozen entries doesn't need an index. Add one if the corpus grows.
- **No LLM call.** This is the first content-rich gallery example with no API call to a model. The AI-resources docs *teach* about using AI tools as part of the workflow, but the site itself is static.

## How a faculty member would adapt this

The site has two reusable shapes you can adapt independently:

**To launch a new course book** — add a new folder under `_content/`:

1. `mkdir _content/<your-course>/` and `_content/<your-course>/README.md`.
2. Add markdown files. Numeric prefixes (`01-`, `02-`) order them in the sidebar.
3. Visit `/<your-course>/` in the running app. Done — no code change.
4. See [`operations/dynamic-content-routing.md`](../operations/dynamic-content-routing.md) for the conventions.

**To build a new interactive concept demo** — add a new top-level route folder under `app/`:

1. Author the concept's data as a TypeScript file (the `stills.ts` shape generalizes — see [`operations/interactive-concept-demo.md`](../operations/interactive-concept-demo.md) for the pattern).
2. Write the page (`page.tsx`) as a sequence: hero → cases (each case = data + diagram + reading) → footer.
3. Write the diagram component to read from the data.
4. Anchor the demo to canonical course material — stills, recordings, or readings the student already knows.

Both shapes can be ported to other courses without touching the routing engine, the content engine, or the styling. The engine generalizes; the content is the course.
