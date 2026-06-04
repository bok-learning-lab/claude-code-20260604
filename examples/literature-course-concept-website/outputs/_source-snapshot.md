# Source snapshot — the running site this example is drawn from

*This document stands in for copying the running Next.js app's source into the example folder. The live site is at <https://complit126x-lovesongs.vercel.app/>; the repo is [bok-learning-lab/complit126x-lovesongs-draft](https://github.com/bok-learning-lab/complit126x-lovesongs-draft). What follows is enough to read the site's shape without cloning it.*

---

## What the site is

A course website for **CompLit 126x: *Love Songs at the Learning Lab* — Unit II: Voice, Style, and Form** at Harvard (Prof. Moira Weigel). The site bundles **three pre-workshop demos** and a documentation system in one Next.js app. The demos are the substance of the example; the docs site is supporting infrastructure (and uses the same dynamic-folder-routing pattern as [`film-course-concepts-website`](../film-course-concepts-website/) — different course, same engine).

The three demos, each on its own top-level route:

- **`/analyzer`** — Demo 1: The Spider Chart. Student-defined trait rubrics + LLM scoring + radar visualization + generate-from-scores-only sonnet. See [`operations/analyze-prompt.md`](../operations/analyze-prompt.md) and [`operations/generate-from-scores-prompt.md`](../operations/generate-from-scores-prompt.md).
- **`/demo-sonnet`** — Demo 2: Stuffing the Prompt. Three Shakespeare sonnets pasted into context, LLM writes a fourth in his style. See [`operations/stuffing-the-prompt.md`](../operations/stuffing-the-prompt.md).
- **`/demo-voice`** — Demo 3: Is Voice Textual — or Multimodal? Demo 1's pipeline run on a 2006 Crimson article by Prof. Weigel; the resulting sonnet read aloud in her cloned voice via ElevenLabs. See [`operations/voice-cloning-step.md`](../operations/voice-cloning-step.md).

The three demos form a single pedagogical sequence — three attempts to capture **voice**, three failure modes, presented together. See [`operations/pedagogical-arc.md`](../operations/pedagogical-arc.md).

## What's at each route

| Route | Source | What it shows |
|---|---|---|
| `/` | `app/page.tsx` — renders `_content/overview.md` via MDX | Landing page: workshop overview + CTA to Demo 1 |
| `/analyzer` | `app/analyzer/page.tsx` (~420 lines) | The Spider Chart UI: poem input, trait editor, radar chart, averaged-scores prompt + generate button |
| `/demo-sonnet` | `app/demo-sonnet/page.tsx` | Demo 2: select sonnets, stuff into prompt, generate fourth |
| `/demo-voice` | `app/demo-voice/page.tsx` | Demo 3: hardcoded sonnet + scored Crimson article + play button for ElevenLabs audio |
| `/reading/[[...slug]]` | `app/reading/[[...slug]]/page.tsx` — renders MDX from `_content/` | Workshop docs (intro to context engineering, prompt-chaining guide, etc.) |

## API routes

| Route | Service | What it does |
|---|---|---|
| `/api/analyze` | OpenAI `gpt-4o-2024-08-06` | Score a poem on a set of traits; structured JSON response via `zodResponseFormat` |
| `/api/generate-lyrics` | OpenAI `gpt-4o` | Generate a sonnet from averaged trait scores; no poem text in prompt |
| `/api/demo-sonnet` | OpenAI `gpt-4o` | Generate a sonnet given three source sonnets stuffed into context |
| `/api/demo-voice-audio` | ElevenLabs `eleven_multilingual_v2` | TTS proxy with cloned voice ID |
| `/api/download-notebook` | (no LLM call) | Serve a downloadable Jupyter notebook for offline use |

## Repo layout

```
complit126x-lovesongs/                       (single Next.js app, NOT a workspace)
├── _content/
│   ├── overview.md                          ← landing-page content; copied to inputs/workshop-overview.md
│   ├── prompt-chaining-guide.md             ← copied to inputs/prompt-chaining-guide.md
│   ├── learning-lab-intro-to-context-engineering.md  ← copied to inputs/intro-to-context-engineering.md
│   ├── appendix-open-game.md
│   ├── next-steps.mdx
│   ├── workshop-overview.md
│   ├── README.md
│   └── _category_.json
├── _context/
│   ├── (Learning Lab background docs)
│   └── (workshop drafts, references)
├── app/
│   ├── page.tsx                             ← landing
│   ├── layout.tsx
│   ├── globals.css
│   ├── types.ts                             ← Trait, TraitScore, PoemAnalysis, etc.
│   ├── analyzer/
│   │   └── page.tsx                         ← Demo 1 — the Spider Chart UI
│   ├── demo-sonnet/
│   │   └── page.tsx                         ← Demo 2 — Stuffing the Prompt
│   ├── demo-voice/
│   │   └── page.tsx                         ← Demo 3 — Voice cloning + sonnet
│   ├── reading/
│   │   ├── [[...slug]]/page.tsx             ← dynamic content rendering (MDX)
│   │   ├── layout.tsx
│   │   └── styles.css
│   ├── api/
│   │   ├── analyze/route.ts                 ← Demo 1 step 1
│   │   ├── generate-lyrics/route.ts         ← Demo 1 step 2 (the centerpiece)
│   │   ├── demo-sonnet/route.ts             ← Demo 2
│   │   ├── demo-voice-audio/route.ts        ← Demo 3 TTS proxy
│   │   └── download-notebook/route.ts       ← Jupyter notebook download (no LLM)
│   └── components/
│       ├── PoemInput.tsx
│       ├── ResultsRadar.tsx                 ← recharts radar chart for Demo 1
│       └── TraitEditor.tsx                  ← in-place editor for trait rubrics
├── components/                              (additional shared components)
├── lib/
│   └── content.ts                           ← MDX content walker
├── public/
├── CLAUDE.md
├── README.md
├── package.json
├── next.config.ts
└── tsconfig.json
```

## Tech stack

- **Next.js 15** App Router. Single app — not a monorepo.
- **React 19**.
- **TypeScript 5**.
- **Tailwind CSS v4** (no shadcn here — components are bespoke).
- **`@mdx-js/mdx`** for inline MDX compilation (the dynamic content engine).
- **`recharts`** for the radar chart in Demo 1. The chart library choice is *opposite* to the gallery's `text-analysis-and-datavis` example (which hand-rolls SVG charts); here, recharts is used because the radar chart with overlaid polygons is genuinely complex and the page's pedagogical move is in the *prompt*, not the chart aesthetic.
- **`openai`** SDK for the three OpenAI endpoints, with `zodResponseFormat` for structured JSON.
- **`zod`** for the structured-output schema.
- **ElevenLabs REST API** via plain `fetch` (no SDK) for the voice-cloning step.
- **`gray-matter`** + **`remark-gfm`** for MDX frontmatter and GitHub-flavored markdown extensions.

## Where API keys live

`apps/.env` (or Vercel project environment variables in production):

```
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=...
ELEVENLABS_VOICE_ID=...
```

`OPENAI_API_KEY` is required for Demos 1 and 2. `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID` are required only for Demo 3; if missing, that endpoint returns 503 and the page falls back to text-only display (no synthetic voice substitute).

## Deployment

- **Vercel.** Single-project deployment from the repo root.
- Live at <https://complit126x-lovesongs.vercel.app/>.
- The `ELEVENLABS_VOICE_ID` environment variable is the cloned voice of the course instructor (Prof. Moira Weigel), set with her consent (see [`operations/voice-cloning-step.md`](../operations/voice-cloning-step.md) for the trust contract).

## What's *not* here (and why)

- **No persistence of student work.** All state lives in React component state. A page reload discards analyzed poems, traits, the generated sonnets. Each session starts fresh.
- **No user accounts.** Public URL; access by link. The page is pre-workshop reading.
- **No analytics.** (Vercel basic deployment metrics may be on.)
- **No combined demo.** Despite the three demos sharing infrastructure, no fourth route combines them. The pedagogical move is the *contrast* between them — combining would muddy the lesson. See [`operations/pedagogical-arc.md`](../operations/pedagogical-arc.md).
- **No save / share for student outputs.** No "share your generated sonnet" button. Workshop participants discuss their generations in section, not via the site.
- **No model picker.** The model choices (`gpt-4o-2024-08-06` for structured-output, `gpt-4o` for free-form, ElevenLabs `eleven_multilingual_v2`) are pinned. Trying out different models is out of scope for the pedagogy.
- **No safety filter on user-provided poems.** The audience is undergraduate humanities students working on lyric poetry in a graded course. The class context handles what a safety classifier would.

## How a faculty member would adapt this

The reusable pieces:

**The Spider Chart pattern.** Any course where the question is *what dimensions describe this kind of artifact?* — replace `default-traits.json` with your course's rubric proposal, run the same analyzer over your course's texts. The compression-loses-the-specifics lesson generalizes to any artifact rich enough to resist its own typology. See [`operations/analyze-prompt.md`](../operations/analyze-prompt.md) and [`operations/generate-from-scores-prompt.md`](../operations/generate-from-scores-prompt.md).

**The Stuffing-the-Prompt counterpart.** Any course where you want students to see the opposite mechanism — feed in the actual texts, ask for imitation. See [`operations/stuffing-the-prompt.md`](../operations/stuffing-the-prompt.md). Pair this with the trait-based demo and the contrast does the teaching.

**The voice-cloning epilogue.** Reserve this for courses where the multimodal question is in-scope and where consent can be properly handled. Don't bolt it onto a workshop where the instructor isn't game to be cloned. See [`operations/voice-cloning-step.md`](../operations/voice-cloning-step.md).

**The three-failure-modes pedagogical arc.** Use the move beyond literary voice — see [`operations/pedagogical-arc.md`](../operations/pedagogical-arc.md) for adjacent domains where the three-mechanism-three-failure-modes structure adapts.

The dynamic content engine for `/reading/*` is the same pattern documented in [`film-course-concepts-website`](../film-course-concepts-website/operations/dynamic-content-routing.md) — drop MDX into `_content/`, no code change needed.
