# Literature course concept website — three demos, three failure modes

A worked example of a **course-concept website built around a three-demo pedagogical arc**: each demo tries to capture *voice* by a different mechanism (trait scoring, full-source stuffing, voice cloning), and each fails in a precise, instructive way. Drawn from the pre-workshop site for **CompLit 126x: *Love Songs at the Learning Lab* — Unit II: Voice, Style, and Form** at Harvard, taught by **Prof. Moira Weigel**.

> **Live site:** <https://complit126x-lovesongs.vercel.app/> — work through the three demos in order. Demo 1 is the Spider Chart at [`/analyzer`](https://complit126x-lovesongs.vercel.app/analyzer); Demo 2 is at [`/demo-sonnet`](https://complit126x-lovesongs.vercel.app/demo-sonnet); Demo 3 is at [`/demo-voice`](https://complit126x-lovesongs.vercel.app/demo-voice).
>
> **Source repo:** <https://github.com/bok-learning-lab/complit126x-lovesongs-draft> — the production Next.js app, deployed to Vercel.

This is the fifth deployed-webapp example in the gallery and the second course-website example, structurally different from [`film-course-concepts-website`](../film-course-concepts-website/). Where the film site's center of gravity is *interactive concept demos anchored to canonical course material*, this site's center of gravity is **a deliberate sequence of three demos that each fail differently** — the *contrast* between them is the lesson.

---

## What it is

A single Next.js app with three top-level demo routes plus a documentation layer:

- **`/analyzer`** — **Demo 1: The Spider Chart.** Student-defined trait rubrics + LLM scoring + radar visualization (via `recharts`) + sonnet generated *from averaged scores alone, no poem text*. See [`operations/analyze-prompt.md`](operations/analyze-prompt.md) and the centerpiece [`operations/generate-from-scores-prompt.md`](operations/generate-from-scores-prompt.md).
- **`/demo-sonnet`** — **Demo 2: Stuffing the Prompt.** Three actual Shakespeare sonnets pasted into the model's context, asked for a fourth in his style. The opposite mechanism. See [`operations/stuffing-the-prompt.md`](operations/stuffing-the-prompt.md).
- **`/demo-voice`** — **Demo 3: Is Voice Textual — or Multimodal?** Demo 1's pipeline run on a 2006 Harvard Crimson article by Prof. Weigel herself; the resulting sonnet is read aloud in her cloned voice via ElevenLabs. See [`operations/voice-cloning-step.md`](operations/voice-cloning-step.md).

Plus [`/reading/[[...slug]]`](https://complit126x-lovesongs.vercel.app/reading/) — a dynamic content engine for the workshop's supporting documentation, using the same pattern documented in [`film-course-concepts-website`'s dynamic-content-routing operation](../film-course-concepts-website/operations/dynamic-content-routing.md).

The three demos form a single pedagogical sequence. See [`operations/pedagogical-arc.md`](operations/pedagogical-arc.md) for the connective tissue — *why* the three demos work together as a single move, and what the contrast teaches that any individual demo cannot.

The substance the example reproduces in this folder:

- [inputs/workshop-overview.md](inputs/workshop-overview.md) — the pre-workshop framing: *"voice isn't one dimension of a poem; it's the whole operation."*
- [inputs/default-traits.json](inputs/default-traits.json) — the five default trait rubrics (Melancholy, Romanticism, Nature Imagery, Mortality, Optimism) shipped with the Spider Chart.
- [inputs/sample-sonnets.md](inputs/sample-sonnets.md) — Shakespeare's Sonnets 18, 29, 55 — the worked-example inputs to both Demo 1 and Demo 2.
- [inputs/prompt-chaining-guide.md](inputs/prompt-chaining-guide.md) — workshop content on prompt chaining as the underlying technique.
- [inputs/intro-to-context-engineering.md](inputs/intro-to-context-engineering.md) — the framing reading the workshop is built on.
- [operations/](operations/) — five documents: the four endpoints' substance (analyze, generate-from-scores, stuffing, voice-cloning) plus the pedagogical-arc that ties them together.
- [outputs/_source-snapshot.md](outputs/_source-snapshot.md) — the Next.js app architecture.
- [outputs/example-spider-chart-session.md](outputs/example-spider-chart-session.md) — a walkthrough of a single Demo 1 session, analyzing Sonnets 18, 29, 55 with full reasoning paragraphs.
- [outputs/example-three-demos-compared.md](outputs/example-three-demos-compared.md) — what each demo produces, side by side, with the contrasts called out.

---

## The moves worth noticing

**Three moves, each architecturally different, anchored by a single pedagogical conceit.**

### Move 1 — The three-failure-modes arc

The defining structural move of the workshop. The unit asks *what is voice?* — and the answer the unit's readings suggest is *it cannot be fully operationalized*. Rather than asserting that, the site **builds three operationalizations and shows the student each one failing in a different way.** The differences between the failures *are* the lesson. See [`operations/pedagogical-arc.md`](operations/pedagogical-arc.md).

- Demo 1 (trait scores) loses the specifics.
- Demo 2 (stuffed source) loses the originality.
- Demo 3 (voice clone on synthesized text) keeps the acoustic correct but the words are alien.

No demo is presented as *the* answer. The student leaves the workshop able to articulate the question more precisely — and able to name what each mechanism cannot capture.

This is the same posture as [`oral-exam-practice-bot`'s no-grading constitution](../oral-exam-practice-bot/operations/coachs-note-prompt.md) and [`image-API-widget`'s rules-in-UI conceit](../image-API-widget/inputs/kluge-rules.md): **make the limit structurally legible in the artifact, not hidden in a footnote.** Here the limit is the *gap between mechanism and meaning*, surfaced by running three mechanisms in sequence.

### Move 2 — The "complete prompt" transparency

Every demo shows the student exactly what the model sees. Demo 1's UI renders the averaged-scores prompt verbatim in a monospace code block, with the heading *"The complete prompt sent to the model"* — *and the trait rubrics are deliberately not in the prompt*, even though they were used to compute the scores upstream. The student can see what's been hidden from the model.

Demo 2's prompt is similarly inspectable. Demo 3 shows the trait scores, the generation prompt, and the speaker's name explicitly.

This transparency is non-negotiable. **If the prompts were obscured behind a polished UI, the demos would teach the wrong lesson — that AI does a creditable job of replicating voice.** With the prompts visible, the failures are legible, and the legibility is the point.

### Move 3 — The recursive instructor in Demo 3

Demo 3 is built around an unusual move: the instructor (Prof. Weigel) clones *her own voice*, scores *her own published article*, and lets the LLM generate a sonnet from her own trait scores — *which is then read aloud in her cloned voice.* Every layer of the apparatus points back to her. The artifact at the end is something she did not write, in a voice that is precisely hers.

The pedagogical justification: **the instructor goes first**, with the full apparatus turned on her, before students are asked to subject themselves to the same procedure. The risk of voice-cloning as a pedagogical tool is borne by the teacher, with her consent, in service of the lesson the workshop will then ask students to encounter.

This is the kind of move that requires the right instructor and the right course context. It does not generalize *as a default*. See [`operations/voice-cloning-step.md`](operations/voice-cloning-step.md) for the trust contract.

---

## How we built it

**Phase 1 — The unit's question.** The workshop is the third meeting of Unit II of CompLit 126x; the unit has been reading Whitman, Dickinson, and Lerner on what makes a poet's voice distinctive. The reading list left a question on the table: *can voice be operationalized?* The workshop's design move was to *operationalize the question itself* — build three attempts and read their failures.

**Phase 2 — Demo 1.** The Spider Chart came first. Trait rubrics + structured-output scoring + a radar chart + a generate-from-scores prompt. The radar chart was deliberately chosen over hand-rolled SVG — `recharts` handles the polygon-overlap visual cleanly and the chart's aesthetic is *not* the pedagogical point. The pedagogical point is the prompt at the bottom of the page: *"Write a sonnet with the following trait scores… [no other context]."* Many iterations on that prompt; the final version is deliberately minimal. The output is meant to be *almost good*, which is the worst possible kind of output for pedagogy — because *almost good* is what the student has to learn to recognize and name.

**Phase 3 — Demo 2.** Added second to provide the contrast. The decision *not* to use a system prompt was important — the demo is supposed to be a stripped-down "give the model the source, ask for imitation" baseline. The instruction *"Do not copy lines"* was added after early outputs lifted lines verbatim; even with the instruction, the source-bias of the context is heavy and pastiche persists in a way the demo deliberately surfaces.

**Phase 4 — Demo 3.** The voice cloning was the riskiest design decision. The pedagogical commitment that *the instructor goes first* — that Prof. Weigel's own voice and own article would be the subjects — resolved the ethical posture. Her consent was explicit; the cloned voice ID is server-side configuration; the deployed UI cannot be repurposed to clone other voices. The generated sonnet was captured from one representative run of Demo 1's pipeline on her Crimson article and hardcoded into the page (rather than re-generated on every visit) so the artifact is stable for the workshop's discussion.

**Phase 5 — The reading layer.** The supporting workshop content (intro to context engineering, prompt-chaining guide, etc.) was added via a dynamic `/reading/[[...slug]]` route reading from `_content/*.md`. The same pattern documented in [`film-course-concepts-website`'s dynamic-content-routing](../film-course-concepts-website/operations/dynamic-content-routing.md) — drop MDX into a folder, get a sidebar-navigated site.

**Phase 6 — Landing page and navigation.** A landing page renders the workshop overview from `_content/overview.md` and CTA's to Demo 1. Each demo page ends with a CTA to the next. The reading order is fixed; the student is meant to work through Demos 1, 2, 3 in sequence.

**Phase 7 — Deploy.** Vercel, single-project. `OPENAI_API_KEY`, `ELEVENLABS_API_KEY`, and `ELEVENLABS_VOICE_ID` in env vars. The cloned voice is configured per-deployment, not per-user.

### Things this approach taught us

The contrast between demos teaches more than any individual demo. Several iterations of the site shipped *one* of the three demos and got far weaker workshop discussion than the full triad. The pedagogical work happens *between* the artifacts.

Showing the complete prompt makes the difference between a demo that obscures its mechanism and one that exposes it. Workshops where the model's prompt was hidden behind a polished UI taught a more impressive version of *AI can simulate voice*; workshops where the prompt was visible taught the precise version of *here is what the prompt sent, here is what came back, here is what's missing*. Only the second version supports the unit's intellectual question.

Hardcoding Demo 3's sonnet was the right call. Earlier versions re-generated the sonnet on each visit. The pedagogical discussion about *that specific text* on *that specific voice* gets fragmented across runs. Pinning the artifact stabilizes the seminar.

The voice cloning is more powerful than expected. Students who have only encountered Demo 1's flat sonnet and Demo 2's pastiche are taken aback when Demo 3 plays the audio. The acoustic dimension is *much* more affectively present than the textual dimension. That affective gap is itself a teaching moment — voice has a phenomenology beyond its measurable features.

Resist the impulse to ship a Demo 4. Combining the mechanisms doesn't teach anything additional; it muddies the lesson. The unit's reading suggests voice cannot be fully operationalized; the demos *enact* that by failing differently, and a combined fourth demo would suggest the limit can be engineered around. It can't.

---

## What you can translate this to

The pattern is **a course-content website built around a three-demo sequence where each demo tries to operationalize the unit's question by a different mechanism, and each fails in a different instructive way**. The mechanisms generalize beyond literary voice. See [`operations/pedagogical-arc.md`](operations/pedagogical-arc.md) for adjacent applications, but in brief:

- **Any course unit whose central question resists single-mechanism operationalization.** Genre, in any medium. Authorial intention. Pedagogical voice. Disciplinary register. Style as such.
- **History-of-science courses on what a "fact" is.** Three attempts to operationalize *what counts as evidence* — one by counting citations, one by examining experimental conditions in detail, one by replicating an experiment. Three different failure modes.
- **Philosophy courses on ethical questions.** Three attempts to operationalize an ethical concept (justice, autonomy, dignity) — one by counting outcomes (utilitarian), one by examining the actual reasoning (Kantian), one by inhabiting the role (virtue-ethics simulation). Same arc structure.
- **Composition / writing courses.** Three attempts to capture good writing — one by rubric scoring, one by example-stuffing, one by listening to the writer read aloud. The three-failure-modes arc generalizes verbatim.

Candidate operations a workshop attendee could add against the same architecture:

- **`/api/critique-output`** — a Claude call after Demo 1's generation that *names what the compression lost* in the generated sonnet. Could be the workshop's discussion-warmup tool.
- **A `/own-voice` demo** — a careful, opt-in version of Demo 3 where students (with explicit consent and in-class supervision) clone their own voice and hear a sonnet generated from scores derived from their own writing.
- **A `/compare-three` page** — runs all three demos on the same source and presents the outputs side by side. (Note: this risks teaching the wrong lesson if it implies the three together are "more complete" — design carefully.)
- **A `/student-traits` page** — students propose their own five trait rubrics (instead of the defaults) and discuss in section what their choice of dimensions reveals about *what they think matters in a poem*.

The pattern in all of these is the same: three mechanisms, three failure modes, the contrast as the lesson, the prompts visible, the limit structurally legible.

---

## Alignment constraints (the hard ones)

These come from the production project and survive translation:

- **The pedagogical move is the *contrast* between demos.** Build at least three; arrange them in a fixed sequence; don't ship one in isolation.
- **Show the complete prompt** the model receives, for every LLM-driven demo. Transparency about what the model sees is what enables the student's analytical work.
- **No combined "best-of" demo.** Resist the temptation to engineer around the limit by stacking mechanisms.
- **The instructor goes first** in the riskiest demo (voice cloning, in this case). The pedagogical risk is borne by the teacher before being asked of students.
- **Voice cloning is curatorial, not user-driven.** Server-side env-var configuration only. Don't expose runtime cloning to students through the deployed UI.
- **Failure modes are part of the artifact.** Don't post-process. Don't retry. Don't paper over with refinement passes.
- **AI as foil, not instrument.** The model is being used to *make the question more precise*, not to *answer it*.
- **Server-side API keys.** Both `OPENAI_API_KEY` and `ELEVENLABS_API_KEY` stay in `process.env`. Never client-side.
