# literature-course-concept-website — folder index

A worked example of a **course-concept website built around a three-demo pedagogical arc**: each demo tries to capture *voice* by a different mechanism (trait scoring, full-source stuffing, voice cloning), and each fails in a precise, instructive way. Drawn from the pre-workshop site for **CompLit 126x: *Love Songs at the Learning Lab* — Unit II: Voice, Style, and Form** at Harvard (Prof. Moira Weigel). Start with [summary.md](summary.md); everything else is here for browsing.

## Top-level

- [summary.md](summary.md) — what this project is, the three-failure-modes pedagogical arc, how it was built, what you can translate it to. **Live site + source repo linked at the top.**
- [CLAUDE.md](CLAUDE.md) — project-level instructions loaded by Claude Code on session start.
- [index.md](index.md) / [index.html](index.html) — this file.

## inputs/

The substantive course content the demos operate on plus the workshop's framing readings.

- [inputs/workshop-overview.md](inputs/workshop-overview.md) — the pre-workshop framing: *"voice isn't one dimension of a poem; it's the whole operation."*
- [inputs/default-traits.json](inputs/default-traits.json) — the five default trait rubrics shipped with the Spider Chart (Melancholy, Romanticism, Nature Imagery, Mortality, Optimism)
- [inputs/sample-sonnets.md](inputs/sample-sonnets.md) — Shakespeare's Sonnets 18, 29, 55 — the worked-example inputs to both Demo 1 and Demo 2
- [inputs/prompt-chaining-guide.md](inputs/prompt-chaining-guide.md) — workshop content on prompt chaining as the underlying technique
- [inputs/intro-to-context-engineering.md](inputs/intro-to-context-engineering.md) — the framing reading the workshop is built on

## operations/

Five documents — the four endpoints' substance plus the arc-level document tying them together.

- [operations/pedagogical-arc.md](operations/pedagogical-arc.md) — **read this first.** The connective tissue. Three demos, three failure modes, why they only make sense as a sequence
- [operations/analyze-prompt.md](operations/analyze-prompt.md) — Demo 1, step 1. Trait scoring with `zodResponseFormat` structured output
- [operations/generate-from-scores-prompt.md](operations/generate-from-scores-prompt.md) — Demo 1, step 2. **The centerpiece.** The complete prompt the model sees: averaged scores + form constraint, nothing else
- [operations/stuffing-the-prompt.md](operations/stuffing-the-prompt.md) — Demo 2. Three Shakespeare sonnets pasted into the model's context; the opposite mechanism
- [operations/voice-cloning-step.md](operations/voice-cloning-step.md) — Demo 3. ElevenLabs TTS proxy with the cloned voice of Prof. Weigel; includes the consent / cloning trust contract

## outputs/

Standalone documentation of the running site + walkthroughs of what the demos produce.

- [outputs/_source-snapshot.md](outputs/_source-snapshot.md) — the Next.js app architecture, the relevant slice of the repo layout, the deployment story, what the site deliberately does *not* do
- [outputs/example-spider-chart-session.md](outputs/example-spider-chart-session.md) — a walkthrough of a student analyzing Sonnets 18, 29, 55 with the default trait rubrics. Per-poem scores, reasoning paragraphs, the averaged result, the generated sonnet
- [outputs/example-three-demos-compared.md](outputs/example-three-demos-compared.md) — what Demo 1 (scores-only), Demo 2 (stuffed source), and Demo 3 (voice-cloned synthesized text) each produce, side by side. The contrast as the lesson

---

*To translate the pattern to another course: design three demos that each try to operationalize the unit's central question by a different mechanism (abstraction, mimicry, multimodal-synthesis). Arrange them in a fixed sequence. Show the complete prompt for each. Resist combining them. The pedagogical work happens in the contrasts between the demos, not in any one of them. See the closing section of [summary.md](summary.md) for adjacent applications.*
