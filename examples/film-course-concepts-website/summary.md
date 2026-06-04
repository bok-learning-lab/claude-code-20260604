# Film course concepts website

A worked example of a **course website** that does what most course websites don't: it pairs traditional reference content (a workshop overview, a cinematography glossary, AI-tool resources) with **interactive concept demos** built around *the course's actual canonical material* — Kurosawa's *Rashomon* stills, scenes from films on the syllabus — rendered as parametrically explorable artifacts. Drawn from the production site for **GENED 1049 *East Asian Cinema*** at Harvard.

> **Live site:** <https://gened-1049.vercel.app/> — black/orange cinematic landing page with two interactive demo cards and the two book-style documentation hubs.
>
> **Source repo:** <https://github.com/bok-learning-lab/gened-1049> — the production Next.js app, deployed to Vercel. This gallery example reproduces the *substance* (a content slice, the two architectural patterns, illustrative demo descriptions) without copying the full source.

This is the third deployed-webapp example in the gallery, alongside [`oral-exam-practice-bot`](../oral-exam-practice-bot/) and [`image-API-widget`](../image-API-widget/). It's the **first content-rich gallery example with no LLM call anywhere** — the site's intelligence is in the *content* and the *interactive design*, not in an inference call. (The AI-resources curriculum *teaches* about using AI tools, but the site itself doesn't call any model.) The pattern ports to any course where the instructor has *parametric* concepts they want students to be able to *explore*, not just read about.

---

## What it is

A single Next.js app serving three distinct functions:

- **A landing page** — cinematic styling (black background, gradient orange/amber title, editorial crop-marks behind the header) introducing the workshop and linking to the two demos.
- **Two interactive concept demos**:
  - **Three-point lighting** — a top-down lighting diagram showing Miyagawa's key/fill/back configuration for each of three *Rashomon* stills, with angles, elevations, intensities, and colors all encoded as data the student can read at a glance. See [`outputs/example-three-point-lighting-demo.md`](outputs/example-three-point-lighting-demo.md).
  - **Scroll-synced video essay** — a course scene that plays as the student scrolls, with editing overlays (title, summary, three or four staggered notes per shot) that fade in and out tied to scroll position. See [`outputs/example-video-essay.md`](outputs/example-video-essay.md).
- **A dynamic content engine** — any folder under `_content/` becomes a sidebar-navigated documentation site. Two books ship: `gened-1049/` (workshop overview, cinematography glossary of nine terms, an AI-resources curriculum for media production) and `why-vibes-first/` (a pedagogical manifesto plus seven analytical sections). See [`operations/dynamic-content-routing.md`](operations/dynamic-content-routing.md).

The substance the example reproduces in this folder:

- [inputs/workshop-overview.md](inputs/workshop-overview.md) — the workshop's three-station overview (lighting, dialogue shooting, AI tools for media production).
- [inputs/glossary-three-point-lighting.md](inputs/glossary-three-point-lighting.md) — a representative glossary entry, mirroring how the prose reference and the interactive demo reinforce each other.
- [inputs/ai-resources-philosophy.md](inputs/ai-resources-philosophy.md) — the "AI as Lab Partner, Not Ghostwriter" framing for the AI-tool curriculum that ships alongside the course content.
- [inputs/stills.ts](inputs/stills.ts) — the actual production data file for the three-point-lighting demo, mirrored verbatim. Three *Rashomon* stills with their lighting configurations encoded.
- [inputs/vibes-first-manifesto-excerpt.md](inputs/vibes-first-manifesto-excerpt.md) — the full text of the project's second book, included as the strongest available statement of the project's pedagogical posture (building before understanding; operational competence is real competence).
- [operations/dynamic-content-routing.md](operations/dynamic-content-routing.md) — the pattern that turns any `_content/<folder>/` into a navigable site.
- [operations/interactive-concept-demo.md](operations/interactive-concept-demo.md) — the data-file + rendering-component pattern, using three-point-lighting as the worked example.
- [outputs/_source-snapshot.md](outputs/_source-snapshot.md) — the Next.js architecture, repo layout, deployment, and what the site deliberately omits.
- [outputs/example-three-point-lighting-demo.md](outputs/example-three-point-lighting-demo.md) and [outputs/example-video-essay.md](outputs/example-video-essay.md) — written descriptions of what each demo is for a student walking into it.

---

## The moves worth noticing

**Two moves, both about turning inert syllabus content into something a student can *explore* rather than just read.**

### Move 1 — Interactive concept demos anchored to canonical course material

Most "interactive cinema education" tools teach concepts against generic illustrations: a diagram of a generic three-point lighting setup on a generic mannequin face. The student sees the abstract concept and is then asked to imagine how it would apply to a real film. The transfer is the student's problem.

This site does the opposite. The three-point-lighting demo teaches the concept on three *Rashomon* stills — the *same stills the student watched in section*. Miyagawa's actual choices (key light at 4 o'clock, hard, high, warm sunlight bounced off mirrors; minimal fill; soft warm back light through the canopy) are encoded as numbers, rendered as a top-down diagram, and paired with the cinematographer's reading of *why* he chose that. The student doesn't have to do the transfer — the demo *is* the transfer, performed for them on material they already know.

That requires three commitments:

- **The data file is the source of truth.** `stills.ts` encodes the lighting setup of each *Rashomon* still as numeric fields (angle, elevation, intensity, color) plus prose fields (label, description, shot description). A new still — from a different film, from a student's own footage — is a data edit, not a code edit.
- **The rendering component reads from the data, not from the page.** `LightingDiagram` is reusable across stills. The page composes it; the component doesn't know which still it's rendering.
- **The page is a narrative sequence.** Three stills, presented in order, with deliberate transitions. The teaching arc lives in the sequence. The page is not a gallery.

The pattern generalizes to any film concept with *parametric or spatial* structure: the 180-degree rule, shot-reverse-shot, aspect ratio, color grading, editing rhythm. See [`operations/interactive-concept-demo.md`](operations/interactive-concept-demo.md) for the table of candidates.

### Move 2 — A general content engine + specific course content

The site's documentation pages (workshop overview, glossary, AI resources, manifesto) all render through one dynamic route: `app/[folder]/[[...slug]]/page.tsx`. Drop a folder of markdown into `_content/`, and Next.js serves it as a sidebar-navigated docs site under `/<folder>/`. No code change. No CMS. No admin UI. Faculty edits markdown; the site changes.

The separation is the move:

- **The engine is general.** The routing, the sidebar, the print-all view, the MDX rendering — all of it works for any course's content. No course-specific logic in the routing layer.
- **The content is specific.** Two books today (`gened-1049/` and `why-vibes-first/`); a third or fourth needs only an MDX folder.

This is the antithesis of "we built a Notion workspace for the course" or "we hand-rolled per-page React components." It's the antithesis of WordPress-as-CMS or Sanity-as-CMS too. It's a flat-file static-ish content system where the source of truth is *the same markdown files the instructor uses for their own notes*, with no extraction step into a database.

See [`operations/dynamic-content-routing.md`](operations/dynamic-content-routing.md) for the conventions and constraints.

### The third commitment — AI as Lab Partner, Not Ghostwriter

A subsidiary move, but the one that makes this example land in our gallery alongside the others. The site's AI-resources curriculum (mirrored in `inputs/ai-resources-philosophy.md`) draws an explicit line:

- **Use AI to accelerate mechanical tasks**: downloading clips with `yt-dlp`, batch-processing files with `ffmpeg`, debugging TypeScript errors, scaffolding Next.js code.
- **Keep creative control**: film analysis, interpretive lens, argumentative voice are *not* AI's job.

It's the same workshop posture as [`oral-exam-practice-bot`](../oral-exam-practice-bot/)'s no-grading constitution and [`image-API-widget`](../image-API-widget/)'s rules-in-UI conceit: **structurally separate what AI is allowed to do from what stays human.** Here it shows up at the curriculum layer rather than the prompt layer.

---

## How we built it

**Phase 1 — The content engine.** First move was the dynamic `[folder]` route. A faculty member should be able to write a glossary entry as a markdown file and have it appear in a navigable sidebar without writing any code. Inspired by docs-site frameworks (Docusaurus, Nextra) but stripped of their build steps and config surface — the route reads from disk at request time and walks the folder tree for the sidebar. About 200 lines across the route, the file walker, and the layout. Done.

**Phase 2 — Filling the books.** With the engine running, the content arrived: the workshop overview, the glossary (nine cinematography terms, each as a separate `.md`), the AI-resources curriculum (five docs from installation through "building interactive video essays"), and the vibes-first manifesto with its seven analytical sections. The content writing was the project, not the engine.

**Phase 3 — The three-point-lighting demo.** This was where the project found its center of gravity. Building a glossary entry on "three-point lighting" produces a prose reference. Building an *interactive* three-point-lighting page that shows what Miyagawa did on actual *Rashomon* stills produces a *lesson*. The architecture fell out of the writing: each still is a data record, each light is a sub-record with numeric fields, the page walks the records as a sequence. The first version had two stills; the third had four (one was cut). The data file is the working artifact.

**Phase 4 — The video essay.** A second concept demo in a different mode. Where the lighting demo is static (a sequence of stills, scrollable but not time-bound), the video essay is *time-bound* (a scene plays as the student scrolls, with overlays whose timing is fractional to the shot). Built around a shared `ScrollVideo` component that ties video playback to scroll position, and per-page `EditingOverlay` instances that drive the fade timings. The two demos look different from the outside but share an underlying pattern: data + rendering component + narrative-sequence page.

**Phase 5 — The landing page.** Last to be built, deliberately. Cinematic styling — black background, gradient orange/amber title, editorial crop-marks — to signal that this site is *about cinema*, not about software. Three cards on the landing: one to each interactive demo, one to the workshop docs. The page is the front door; the books and the demos are the rooms.

**Phase 6 — Deploy.** Vercel, no environment variables required. The site is fully static at runtime (no API keys, no inference providers). Public URL; access by link.

### Things this approach taught us

The hard thing about a course website is not the technology — it's *deciding what to put in it*. The content engine made the second hard thing (page-by-page styling, navigation, print-friendliness) cheap, which forced the first hard thing (what's worth writing) into the foreground. The interactive demos earn their place by being the *one move* that a markdown glossary cannot do.

The data file is the working artifact for an interactive demo. Edits happen in `stills.ts`. The component and the page are touched rarely after they stabilize. This is the opposite of the temptation to build a per-demo styling system or per-still custom layouts — that path produces three different demos that share nothing. Keep the demos structurally similar; let the data carry the variation.

Pair every interactive demo with a glossary entry. The demo is the encounter; the glossary is the reference. Students arrive at one and click through to the other in both directions. Without the glossary, the demo is unmoored from the rest of the course's vocabulary; without the demo, the glossary is just words.

The vibes-first manifesto belongs in the same site as the workshop overview. It's not separate philosophy content; it's the *pedagogical commitment* that justifies the AI-resources curriculum (build first, understand when you need to, treat operational competence as real competence). Keep the rationale in the same artifact as the work it rationalizes.

The site does *not* need an LLM. The three previous gallery examples leaned on Claude or OpenAI for substance; this one's substance is human writing + interactive design. The absence is worth naming: there are course-website moves where adding AI would be additive (chat with a glossary, generate per-student feedback) and others where AI is a distraction. This is the latter.

---

## What you can translate this to

The pattern is **a course website with (1) a flat-file content engine for the syllabus material + (2) one or two interactive concept demos anchored to the course's canonical examples + (3) a pedagogical commitment about what stays human**. The substance survives translation. Specifically:

- **Any film studies course.** Pick a different cinematographer, a different concept, a different canonical film. The lighting demo's data shape ports verbatim.
- **Music theory courses.** Replace `stills.ts` with `passages.ts` — each passage encodes the harmonic move, the meter, the orchestrational choice, with an audio snippet for the canonical example. The "scroll-synced video essay" pattern adapts well to audio waveforms.
- **Architecture and design history.** Replace film stills with floor plans or building elevations; replace lighting angles with structural loads, programmatic adjacencies, circulation paths. The diagram-component-reads-data pattern generalizes.
- **Dance / movement studies.** Replace stills with frame-by-frame breakdowns of a sequence; encode the choreographic vocabulary as data (weight transfers, musical accent alignment, spatial pathways).
- **Art history / connoisseurship**. Replace stills with painting details; encode the brushwork, the underpainting layer, the pigment palette as data the student can read alongside the high-resolution image.
- **Foreign-language film study.** A scroll-synced video essay with annotation layers that go beyond translation — grammar notes, idiom callouts, sociolinguistic context tied to specific moments in the dialogue.

Candidate operations a workshop attendee could add to *this* site against the same architecture:

- **`/180-degree-rule`** — same pattern as three-point-lighting, but with a top-down floor plan and the camera-axis visualization. Data file encodes the position of two characters, the camera line, and the camera placements over a dialogue sequence.
- **`/aspect-ratio`** — same pattern, but with the frame's aspect ratio as the parametric variable and a single canonical still re-cropped into different ratios.
- **`/color-grading`** — same pattern, but with a before/after pair and the curve adjustments as the data.

The pattern in all of these is the same: a flat-file content engine for the syllabus reference material, interactive concept demos that take a *parametric* concept and render it spatially or temporally over the course's canonical material, a sequence of demos that walks the curriculum, a published static site that students can return to.

---

## Alignment constraints (the hard ones)

These come from the production project and survive translation:

- **Anchor concept demos to canonical course material.** Generic illustrations leave the student to do the transfer; canonical material does the transfer for them. Use the *Rashomon* stills the students watched in section. Pick the scenes already in the syllabus.
- **Data file = source of truth.** A new example is a data edit. Resist building admin UIs, content-management layers, per-demo styling systems.
- **The rendering component reads from the data, not from the page.** Reusable across all instances of the concept.
- **Pair the diagram with the instructor's reading.** A diagram alone is a chart; the instructor's prose argument about the cinematographer's choice is what makes it a lesson.
- **AI as Lab Partner, Not Ghostwriter.** AI accelerates the technical scaffolding (ffmpeg, code, debugging); criticism and teaching voice stay human. Surface this commitment explicitly in any AI-tool curriculum the site teaches.
- **The engine is general; the content is specific.** Course-specific logic does not belong in the routing layer.
- **Sequence matters.** The order of stills, the order of glossary entries, the order of manifesto sections — these are curriculum choices. Don't shuffle.
- **No emojis, no flourishes, no animations-for-animations'-sake.** The site is cinematic in *typography and palette*, not in motion. Restraint is part of the voice.
