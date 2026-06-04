# CLAUDE.md — Film course concepts website

Project-level instructions loaded when Claude Code starts in this folder.

## What this example is

A worked example of a **course-concepts website**: a Next.js site that pairs traditional course content (workshop overviews, glossary entries, AI-tool resources) with **interactive concept demos** that present canonical course material — *Rashomon* stills, scenes from course films — as **parametrically explorable artifacts**. Drawn from the production project at <https://gened-1049.vercel.app/>, the public site for GENED 1049 *East Asian Cinema* at Harvard.

This is the third deployed-webapp example in the gallery, alongside [`oral-exam-practice-bot`](../oral-exam-practice-bot/) and [`image-API-widget`](../image-API-widget/). It's the first content-rich gallery example with **no LLM call anywhere** — the site's intelligence is in the *content* and the *interactive design*, not in a model call. See [summary.md](summary.md) for the moves worth noticing and what you can translate them to.

## If you just opened this folder

Read in this order:

1. [summary.md](summary.md) — what this is, the "interactive concept demo paired with canonical course material" move, how the project was built, what you can translate it to. The live site and source repo are linked at the top.
2. [inputs/](inputs/) — a representative slice of the course content: the workshop overview, the glossary entry on three-point lighting, the AI-as-lab-partner philosophy doc, the three-point-lighting demo's data file (`stills.ts`), and an excerpt from the vibes-first manifesto.
3. [operations/dynamic-content-routing.md](operations/dynamic-content-routing.md) — the pattern that turns any `_content/<folder>/` into a sidebar-navigated site.
4. [operations/interactive-concept-demo.md](operations/interactive-concept-demo.md) — the pattern that pairs a data file with a React component to produce an interactive exploration. Three-point-lighting is the worked example.
5. [outputs/_source-snapshot.md](outputs/_source-snapshot.md) — the Next.js architecture in one document.
6. [outputs/example-three-point-lighting-demo.md](outputs/example-three-point-lighting-demo.md) and [outputs/example-video-essay.md](outputs/example-video-essay.md) — what the two interactive demos produce for the student.

## How to work in this project

You are reading an example of a **course-content website**, not a tool with an API endpoint. The substance is in two places:

1. **The content** — the actual writing in `_content/<book>/` (workshop overview, cinematography glossary, AI-resources docs, the manifesto). The site's pedagogy *is* this content. Edit the markdown; the site changes.
2. **The interactive demos** — `three-point-lighting/` and `video-essay/01/`. Two demos, two patterns, both shipped as data files + rendering components.

There is no LLM call in this project. The intelligence is in the writing, the data, and the design — not in an inference provider. If you find yourself reaching for a Claude or OpenAI prompt, you've slipped into a different example's mode. See the AI-resources docs in [inputs/ai-resources-philosophy.md](inputs/ai-resources-philosophy.md) for the project's "AI as Lab Partner, Not Ghostwriter" framing — AI helps with the technical scaffolding, not with the criticism or the teaching.

Two passes, in order:

1. **Read the content samples** in `inputs/`. The workshop overview, the glossary entry, and the AI-resources philosophy doc are short — they set the project's voice and pedagogical posture.
2. **Then read the two operations**. The content-routing pattern is general (any course can use it); the interactive-concept-demo pattern is the move worth most attention (it's how you turn an inert syllabus into an explorable one).

## The pipeline (such as it is)

The site has two distinct "pipelines" because it has two distinct content kinds:

**For documentation pages** (workshop overview, glossary entries, AI resources, manifesto):

| Step | What | Where |
|---|---|---|
| 1 | Faculty writes markdown | `_content/<book>/<file>.md` |
| 2 | Dynamic route reads file at request time | `app/[folder]/[[...slug]]/page.tsx` |
| 3 | Sidebar built by walking the folder tree | `_components/sidebar.tsx` |
| 4 | MDX rendered with custom components | `_components/mdx-content.tsx` |
| 5 | Student reads the page at `/<book>/<file>` | — |

**For interactive concept demos** (three-point-lighting, video-essay):

| Step | What | Where |
|---|---|---|
| 1 | Author the concept's data as a TS file | `app/three-point-lighting/stills.ts` (or equivalent) |
| 2 | Write a rendering component that reads the data | `app/three-point-lighting/[id]/LightingDiagram.tsx` |
| 3 | Compose a page that walks the data as a narrative sequence | `app/three-point-lighting/page.tsx` |
| 4 | Student arrives, scrolls through the sequence | — |

## Conventions

- **`inputs/` is the editable course content.** A representative slice — adapt to your own course's syllabus.
- **`operations/` documents the two reusable patterns.** Not API endpoints, not Claude prompts — *architectural patterns* that make the site work.
- **`outputs/` holds the illustrative material.** A source-snapshot and two written descriptions of the interactive demos as the student experiences them. The live site is the actual artifact; this folder describes its shape.
- **No emojis** in any file (workshop-wide convention).
- **Markdown link syntax** for file references.

## Alignment constraints (the hard ones)

These come from the production project and survive translation to other course websites:

- **Anchor every interactive demo to canonical course material.** Don't teach three-point lighting against a generic photograph — teach it on the *Rashomon* stills already on the syllabus. The match between the concept demo and the course's actual texts is what makes the demo earn its place.
- **The data file is the source of truth for a demo.** A new still, a new scene, a new variation is a *data edit*, not a code edit. The rendering component and the page are written once. Resist building admin UIs.
- **Pair the diagram with the instructor's *reading*.** A diagram alone is a chart; a diagram next to the instructor's prose argument (the `shotDescription` field in `stills.ts`) is a *lesson*. The reading is part of the artifact.
- **AI as Lab Partner, Not Ghostwriter.** From the AI-resources philosophy doc: AI accelerates the mechanical and technical work (ffmpeg invocations, scaffolding code, debugging) — the criticism, the argument, the teaching voice are the human's. The site itself contains no LLM call; the AI-resources curriculum teaches students how to use AI tools as patient technical assistants while the *reading* stays theirs.
- **The engine is general; the content is specific.** Resist adding course-specific logic into the routing engine. New courses are new `_content/<folder>/` directories, not new routes. Resist adding generic-concept logic into the demos. New concepts are new demos with their own data files.
- **Sequence matters.** The order of stills in a demo is a curriculum choice. Don't shuffle; don't add "random" modes. The teaching arc lives in the sequence.
