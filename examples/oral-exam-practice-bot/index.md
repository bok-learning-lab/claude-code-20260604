# oral-exam-practice-bot — folder index

A worked example of a deployed Claude-and-Whisper webapp that helps students rehearse a final oral exam *without* ever returning a grade. Drawn from the production app at <https://complit126-quizzer-interface.vercel.app/> (repo: <https://github.com/bok-learning-lab/complit126-quizzer>). Start with [summary.md](summary.md); everything else is here for browsing.

## Top-level

- [summary.md](summary.md) — what this project is, the no-grading commitment, how it was built, what you can translate it to. **Live demo + source repo are linked at the top.**
- [CLAUDE.md](CLAUDE.md) — project-level instructions loaded by Claude Code on session start
- [index.md](index.md) / [index.html](index.html) — this file

## inputs/

The faculty source material and the structured content the bot draws from.

- [inputs/cl126x-oral.docx](inputs/cl126x-oral.docx) — the instructor's original oral-exam packet (the source from which the structured data was extracted)
- [inputs/questions.ts](inputs/questions.ts) — the production app's source of truth: works, specific questions grouped by unit, big questions, the AI addendum, and the rubric in prose form with numeric weights stripped

## operations/

Three operations, extracted from the production Next.js API routes into standalone prompt/operation documents.

- [operations/follow-up-prompt.md](operations/follow-up-prompt.md) — the mid-session follow-up: **two-stage Claude prompt** (generate five candidates → judge picks the best). Returns one pointed follow-up question per recorded answer
- [operations/coachs-note-prompt.md](operations/coachs-note-prompt.md) — **the centerpiece.** The end-of-session structured prose feedback prompt, built around the no-grading constitution: every grading-shaped artifact forbidden by name, qualitative vocabulary given by example, rubric injected in question form with weights stripped, prep packet injected as active context
- [operations/transcribe-step.md](operations/transcribe-step.md) — the Whisper transcription step (server-side, audio stays on the server, transcript returned as text). The handoff between the audio recorder and the two Claude prompts

## outputs/

The illustrative material: a representative synthetic session, the Claude artifacts it would produce, and the standalone documentation of the running app.

- [outputs/_source-snapshot.md](outputs/_source-snapshot.md) — the Next.js architecture, repo layout, deployment, and what the app deliberately does *not* do. Read this if you want the app's shape without cloning the repo
- [outputs/example-session-transcript.md](outputs/example-session-transcript.md) — a synthetic student session (drawn questions, Whisper transcripts, follow-up questions, the student's responses). Clearly labeled illustrative
- [outputs/example-coachs-note.md](outputs/example-coachs-note.md) — what [`coachs-note-prompt.md`](operations/coachs-note-prompt.md) would return for that session. Note the literal section headings, the plain-text formatting, the em-dash bullets, and the complete absence of grading language

---

*To translate this pattern to another course or assessment format: rewrite [`inputs/questions.ts`](inputs/questions.ts) with the new course's content; adjust the opening paragraphs of the two prompts in [`operations/`](operations/) to name the new course; the no-grading constitution, qualitative-vocabulary list, and rubric-as-questions move all generalize verbatim. See the closing section of [summary.md](summary.md) for candidate operations and adjacent domains.*
