# film-course-concepts-website — folder index

A worked example of a **course website** that pairs traditional reference content (workshop overview, glossary, AI-tool resources) with **interactive concept demos** anchored to the course's canonical material — Kurosawa's *Rashomon* stills, scenes from course films — as parametrically explorable artifacts. Drawn from the production site for GENED 1049 *East Asian Cinema* at <https://gened-1049.vercel.app/> (repo: <https://github.com/bok-learning-lab/gened-1049>). Start with [summary.md](summary.md); everything else is here for browsing.

## Top-level

- [summary.md](summary.md) — what this project is, the two moves worth noticing (interactive demos anchored to canonical material; general content engine + specific course content), how it was built, what you can translate it to. **Live site + source repo are linked at the top.**
- [CLAUDE.md](CLAUDE.md) — project-level instructions loaded by Claude Code on session start
- [index.md](index.md) / [index.html](index.html) — this file

## inputs/

A representative slice of the course content the site presents.

- [inputs/workshop-overview.md](inputs/workshop-overview.md) — the workshop's three-station overview (lighting, dialogue shooting, AI tools for media production)
- [inputs/glossary-three-point-lighting.md](inputs/glossary-three-point-lighting.md) — a representative glossary entry, mirroring how the prose reference and the interactive demo reinforce each other
- [inputs/ai-resources-philosophy.md](inputs/ai-resources-philosophy.md) — the "AI as Lab Partner, Not Ghostwriter" framing for the AI-tool curriculum that ships alongside the course content
- [inputs/stills.ts](inputs/stills.ts) — the actual production data file for the three-point-lighting demo. Three *Rashomon* stills with their lighting configurations encoded as numeric fields plus prose readings
- [inputs/vibes-first-manifesto-excerpt.md](inputs/vibes-first-manifesto-excerpt.md) — the full text of the project's second book, included as the strongest available statement of the project's pedagogical posture (building before understanding; operational competence is real competence)

## operations/

Two reusable architectural patterns, documented as standalone operations. No API endpoints, no Claude prompts — the site has no LLM call.

- [operations/dynamic-content-routing.md](operations/dynamic-content-routing.md) — the pattern that turns any `_content/<folder>/` into a sidebar-navigated documentation site. Filename = slug, README is the folder index, MDX opt-in. New books are new folders, not new routes
- [operations/interactive-concept-demo.md](operations/interactive-concept-demo.md) — **the move worth most attention.** The data-file + rendering-component + narrative-sequence-page pattern, using three-point-lighting as the worked example. Anchors each demo to canonical course material; generalizes to any parametric film concept (180-degree rule, shot-reverse-shot, aspect ratio, color grading, editing rhythm)

## outputs/

The illustrative material — written descriptions of the running site's two interactive demos and a standalone document of the architecture.

- [outputs/_source-snapshot.md](outputs/_source-snapshot.md) — the Next.js architecture, repo layout, deployment, and what the site deliberately does *not* do. Read this if you want the site's shape without cloning the repo
- [outputs/example-three-point-lighting-demo.md](outputs/example-three-point-lighting-demo.md) — what the lighting-diagram demo at [`/three-point-lighting`](https://gened-1049.vercel.app/three-point-lighting) produces for the student: a top-down diagram of Miyagawa's key/fill/back configuration on each of three *Rashomon* stills, paired with the cinematographer's reading of each choice
- [outputs/example-video-essay.md](outputs/example-video-essay.md) — what the scroll-synced video essay at [`/video-essay/01`](https://gened-1049.vercel.app/video-essay/01) produces: a course scene that plays as the student scrolls, with editing overlays that fade in and out tied to scroll position

---

*To translate the pattern to another course: a new book of content goes in `_content/<your-course>/` as a folder of markdown files (no code change needed — see [`operations/dynamic-content-routing.md`](operations/dynamic-content-routing.md)). A new interactive concept demo follows the data-file + rendering-component + narrative-page shape (see [`operations/interactive-concept-demo.md`](operations/interactive-concept-demo.md)); anchor it to your course's actual canonical material — the scene the student already watched, the passage they already read.*
