# CLAUDE.md — Oral exam practice bot

Project-level instructions loaded when Claude Code starts in this folder.

## What this example is

A worked example of a **reflective-tutor webapp** — an oral-exam rehearsal bot built for *CL 126x / Hum 5: Literature and Artificial Intelligence* at Harvard. The student draws two specific questions and one big question, takes an optional 15-minute closed-book prep, records spoken answers to each, gets one Claude-generated follow-up per question, and at the end receives a structured **coach's note** that is engineered to be useful without ever being a grade.

This is the first example in the gallery drawn from a **deployed production webapp**. The live demo runs at <https://complit126-quizzer-interface.vercel.app/> and the production repo is [bok-learning-lab/complit126-quizzer](https://github.com/bok-learning-lab/complit126-quizzer). See [summary.md](summary.md) for the move worth noticing, what makes this an example of a *project* rather than a script, and what you can translate it to.

## If you just opened this folder

Read in this order:

1. [summary.md](summary.md) — what this is, the no-grading commitment, and what you can translate it to. The live demo and source repo are linked at the top.
2. [outputs/_source-snapshot.md](outputs/_source-snapshot.md) — the Next.js architecture in one document, so you can read the shape of the app without cloning it.
3. [operations/coachs-note-prompt.md](operations/coachs-note-prompt.md) — the centerpiece prompt. The whole project is built around making this prompt unforgeable.
4. [operations/follow-up-prompt.md](operations/follow-up-prompt.md) — the mid-session move (two-stage: generator + judge).
5. [outputs/example-session-transcript.md](outputs/example-session-transcript.md) and [outputs/example-coachs-note.md](outputs/example-coachs-note.md) — a synthetic but representative example of what the bot ingests and what it returns.

## How to work in this project

You are reading an example of a **course-specific reflective-tutor tool**. The substance to attend to is in the prompts, not in the UI scaffolding. The Next.js app is the *delivery mechanism*; the **two Claude prompts plus the Whisper handoff** are the actual move.

Two passes, in order:

1. **Read the prompts before you read the app.** [`operations/coachs-note-prompt.md`](operations/coachs-note-prompt.md) is the centerpiece — the no-grading constitution, the qualitative vocabulary list, the rubric-as-questions move, the prep-packet injection. Read [`operations/follow-up-prompt.md`](operations/follow-up-prompt.md) second for the two-stage generator/judge pattern. Read [`operations/transcribe-step.md`](operations/transcribe-step.md) third — Whisper is a feed, not a prompt.
2. **Then read the source snapshot** at [`outputs/_source-snapshot.md`](outputs/_source-snapshot.md). It will be clear from the prompts alone what the app is doing; the snapshot answers questions about how the React state machine chains the three operations.

## The pipeline

| Step | Operation | Input | Output |
|---|---|---|---|
| 1 | Question draw — `lib/quizzer/draw.ts` | [`inputs/questions.ts`](inputs/questions.ts) | Two specific Qs (from different units) + one big Q |
| 2 | Student records spoken answer (browser `MediaRecorder`) | Audio Blob | Audio Blob (WebM/M4A) |
| 3 | [`operations/transcribe-step.md`](operations/transcribe-step.md) — OpenAI Whisper | Audio Blob | Transcript string |
| 4 | [`operations/follow-up-prompt.md`](operations/follow-up-prompt.md) — Claude (two-stage) | Transcript + drawn question | One follow-up question |
| 5 | Student records response to follow-up (optional); back to step 3 | Audio Blob | Transcript string |
| 6 | At session end: [`operations/coachs-note-prompt.md`](operations/coachs-note-prompt.md) — Claude | All transcripts + drawn questions + prep packet | A structured coach's note |

## Conventions

- **`inputs/` is read-only source.** The faculty oral-exam packet (`cl126x-oral.docx`) and the structured exam content (`questions.ts`) — don't modify them in this example folder. The production repo's source-of-truth is at `_content/exam/questions.ts`.
- **`operations/` holds the substance.** Three markdown files: two Claude system prompts (`follow-up-prompt.md`, `coachs-note-prompt.md`) and one operation note (`transcribe-step.md`). These are the artifacts a faculty member translating the project to another course would edit.
- **`outputs/` holds the illustrative material.** A synthetic student session, the Claude responses it would produce, and the `_source-snapshot.md` standing in for the cloned source code.
- **No emojis** in any file (workshop-wide convention).
- **Markdown link syntax** for file references — `[questions.ts](inputs/questions.ts)`.

## Alignment constraints (the hard ones)

These come from the production project and apply to anything Claude does in this example:

- **No grading, ever.** Not "lighter grading" or "soft grading" — *no* numbers, marks, letters, percentages, ranges, fractions, "out of" estimates, or pass/fail implications. This is enforced by listing every grading-shaped artifact by name in the system prompt. See [`operations/coachs-note-prompt.md`](operations/coachs-note-prompt.md) for the full constitution.
- **The rubric is given in question form, weights stripped.** Examiners ask themselves rubric *questions* ("Did your evidence support your claims?"); the prompt encourages quoting those questions back to the student but forbids reproducing or inferring the original numeric weights.
- **Specific to what the student said.** Both prompts ask the model to read past disfluencies and quote specific things the student actually said, not summarize the whole transcript. Generic feedback is the failure mode.
- **Course material as active context.** The coach's-note prompt injects the full prep packet — works, sister questions per unit, big questions, the addendum — so feedback can name specific texts the student should revisit. Without that, feedback drifts into generic academic-prose nudges.
- **Plain-text structure with literal headings.** No markdown, no asterisks, no hash headings in the output. The shape of the artifact ("Overall", "Question one — Specific", "What to focus on") is part of the artifact, not decoration.
