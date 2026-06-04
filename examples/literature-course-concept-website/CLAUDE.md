# CLAUDE.md — Literature course concept website

Project-level instructions loaded when Claude Code starts in this folder.

## What this example is

A worked example of a **course-concept website built around a three-demo pedagogical arc**: each demo tries to capture *voice* by a different mechanism (trait scoring; full-source stuffing; voice cloning), and each fails in a precise, instructive way. Drawn from the pre-workshop site for **CompLit 126x: *Love Songs at the Learning Lab* — Unit II: Voice, Style, and Form** at Harvard (Prof. Moira Weigel), live at <https://complit126x-lovesongs.vercel.app/>.

This is the fifth deployed-webapp example in the gallery, alongside [`oral-exam-practice-bot`](../oral-exam-practice-bot/), [`image-API-widget`](../image-API-widget/), [`film-course-concepts-website`](../film-course-concepts-website/), and [`text-analysis-and-datavis`](../text-analysis-and-datavis/). It's the second course-website example (after `film-course-concepts-website`), but it's structurally different: where the film site's center of gravity is *interactive concept demos anchored to canonical course material* (Rashomon stills + lighting diagrams), this site's center of gravity is **a deliberate sequence of three demos that each fail differently** — the *contrast* between them is the lesson.

See [summary.md](summary.md) for the moves worth noticing and what you can translate them to.

## If you just opened this folder

Read in this order:

1. [summary.md](summary.md) — what this is, the three-failure-modes pedagogical arc, how it was built, what you can translate it to. **Live site + source repo linked at the top.**
2. [operations/pedagogical-arc.md](operations/pedagogical-arc.md) — the connective tissue that ties the three demos together. Read this *before* the per-demo operations docs; it explains why they're sequenced and what they teach in combination.
3. [operations/analyze-prompt.md](operations/analyze-prompt.md) and [operations/generate-from-scores-prompt.md](operations/generate-from-scores-prompt.md) — Demo 1's two steps. The second one (scores-only generation) is the centerpiece of the entire workshop.
4. [operations/stuffing-the-prompt.md](operations/stuffing-the-prompt.md) — Demo 2, the opposite mechanism.
5. [operations/voice-cloning-step.md](operations/voice-cloning-step.md) — Demo 3, the multimodal epilogue. Includes the consent / cloning trust contract.
6. [outputs/_source-snapshot.md](outputs/_source-snapshot.md) — the Next.js app architecture.
7. [outputs/example-spider-chart-session.md](outputs/example-spider-chart-session.md) and [outputs/example-three-demos-compared.md](outputs/example-three-demos-compared.md) — a walkthrough of Demo 1, and a side-by-side of all three.

## How to work in this project

You are reading an example of **course-content website whose pedagogical work happens through a sequence of demonstrations**, not through standalone tools. The substance is in two places that must be understood together:

1. **The pedagogical arc** — three demos that fail differently. The arc is documented in [`operations/pedagogical-arc.md`](operations/pedagogical-arc.md). Each individual demo is *less than half* of what the site teaches; the lesson is in the *contrast*.
2. **The transparency commitment** — every demo shows the student the complete prompt the model receives. No hidden context. This is what lets the student do the analytical work; without it, the demos teach the wrong lesson (that AI is competent at replicating voice).

Two passes, in order:

1. **Read the pedagogical arc first.** Without it, the per-demo operations docs look like five disconnected prompts. With it, they're a sequence.
2. **Then read each demo's operation doc.** The two Demo 1 docs (`analyze-prompt.md` + `generate-from-scores-prompt.md`) form a pair — the scoring step and the generation step. Demo 2 (`stuffing-the-prompt.md`) is its counter-mechanism. Demo 3 (`voice-cloning-step.md`) is the multimodal layer.

## The pipeline

Three demos, each with its own pipeline:

**Demo 1 — The Spider Chart:**

| Step | What | Where |
|---|---|---|
| 1 | Student edits trait rubrics (or accepts defaults) | UI `TraitEditor` |
| 2 | Student pastes a poem | UI `PoemInput` |
| 3 | LLM scores poem on traits, returns structured JSON | [`operations/analyze-prompt.md`](operations/analyze-prompt.md) |
| 4 | Page renders radar chart with the per-poem polygon | UI `ResultsRadar` (recharts) |
| 5 | Repeat with multiple poems; polygons overlay | — |
| 6 | Page averages scores across all polygons | Client-side compute |
| 7 | LLM generates a sonnet **from the averaged scores alone** | [`operations/generate-from-scores-prompt.md`](operations/generate-from-scores-prompt.md) |

**Demo 2 — Stuffing the Prompt:**

| Step | What | Where |
|---|---|---|
| 1 | Student selects 1+ Shakespeare sonnets from a card list | UI |
| 2 | Page stuffs the full source text into the context | [`operations/stuffing-the-prompt.md`](operations/stuffing-the-prompt.md) |
| 3 | LLM generates a fourth sonnet in Shakespeare's style | — |

**Demo 3 — Voice cloning + scored prose:**

| Step | What | Where |
|---|---|---|
| 1 | (Pre-computed) Prof. Weigel's article scored on the five traits | Hardcoded in `app/demo-voice/page.tsx` |
| 2 | (Pre-computed) Sonnet generated via Demo 1's pipeline | Hardcoded |
| 3 | Page displays the prompt + the generated sonnet | UI |
| 4 | Student clicks Play → page POSTs sonnet text to TTS proxy | [`operations/voice-cloning-step.md`](operations/voice-cloning-step.md) |
| 5 | ElevenLabs returns audio in cloned voice | — |

## Conventions

- **`inputs/` holds the substantive course content.** The workshop overview, the prompt-chaining guide, the intro to context engineering reading, the default trait rubrics, the three Shakespeare sonnets. These are the source material the demos operate on.
- **`operations/` holds five docs.** Two per Demo 1 (the scoring prompt and the generation prompt). One per Demos 2 and 3. One arc-level document tying them together.
- **`outputs/` holds the illustrative material.** A source-snapshot of the Next.js app, plus two walkthroughs (a single Demo 1 session, and the three-demos side-by-side comparison).
- **No emojis** in any file (workshop-wide convention).
- **Markdown link syntax** for file references — `[file](path/to/file.md)`.

## Alignment constraints (the hard ones)

These come from the production project and survive translation:

- **The pedagogical move is the *contrast* between demos**, not any individual demo. A site that ships Demo 1 alone teaches a different lesson than the three-demo site. The sequence is load-bearing.
- **Transparency about prompts is non-negotiable.** Every demo shows the student exactly what the model sees. Hidden scaffolding would smuggle context the demos are deliberately withholding, and the lessons depend on the withholding.
- **No combined demo, no aggregation, no "best of the three."** The pedagogical posture is that voice cannot be captured by combining insufficient mechanisms. Don't add a Demo 4 that tries.
- **The instructor goes first in Demo 3.** Prof. Weigel's voice is the cloned voice; her article is the source. The pedagogical risk of cloning is borne by the instructor before students are asked to subject themselves to the same procedure. Don't add a UI that lets students clone *their* voices at runtime — that's a different feature with different consent requirements.
- **Voice cloning is server-side configuration, not user-driven.** `ELEVENLABS_VOICE_ID` is an env var. The cloning is curatorial; the deployed UI cannot be repurposed to clone arbitrary voices.
- **Failure modes are part of the artifact.** When the model produces mediocre output, that's the lesson — don't paper over it with retries or post-processing.
- **AI as foil, not instrument.** The model in this workshop is being used to *make the question more precise*, not to *answer it*. Same posture as the no-grading constitution in [`oral-exam-practice-bot`](../oral-exam-practice-bot/) and the rules-in-UI conceit in [`image-API-widget`](../image-API-widget/) — make the limit structurally legible in the artifact.
