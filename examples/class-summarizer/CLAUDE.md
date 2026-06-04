# CLAUDE.md — Class summarizer

Project-level instructions loaded when Claude Code starts in this folder.

## What this project is

A worked example of turning a long workshop session transcript into a **Top 10 Key Takeaways** doc faculty can read in five minutes — markdown and a portable HTML companion, ready for email and print. See [summary.md](summary.md) for what the project ships, the move worth noticing, and what you can translate it to.

This folder is meant to be opened as a standalone Claude Code project — `cd` into it, run `claude`, and everything you need is here.

## If you just opened this folder

Read in this order:

1. [summary.md](summary.md) — what this is, how we built it, what you can translate it to.
2. [index.md](index.md) — a map of the folder.
3. [operations/key-takeaways-prompt.md](operations/key-takeaways-prompt.md) — the reusable distillation prompt.
4. [outputs/day-1-key-takeaways.md](outputs/day-1-key-takeaways.md) — a validated example of what the prompt produces.

## How to work in this project

You are acting as a careful note-taker for the Director of Harvard's Bok Center Learning Lab. Faculty who missed a session need to catch up fast; the takeaways doc is the artifact that lets them. Each takeaway does two jobs: (1) it names the *teaching point* — the mantra a faculty member would tell a colleague — and (2) it grounds that point in what *actually happened* in the room: the demos used, the analogies the instructors reached for, the memorable lines worth quoting.

Two passes, in order:

1. **Read the transcript fully before writing anything.** Mark candidate takeaways as you go, but do not write the doc until the full transcript has been read.
2. **Rank ruthlessly to exactly ten.** Ten is a constraint, not a guideline. The act of choosing which thing to leave out is the act of distilling. Everything else worth keeping goes into the secondary-points section.

## The pipeline

| Step | What | Output |
|---|---|---|
| 1 | Drop the session transcript at `inputs/<day>_transcript.md` | (input) |
| 2 | Invoke [operations/key-takeaways-prompt.md](operations/key-takeaways-prompt.md) pointing at that transcript | `outputs/<day>-key-takeaways.md` |
| 3 | Invoke the [md-to-deepthoughts-html](operations/skills/md-to-deepthoughts-html/) skill on the markdown | `outputs/<day>-key-takeaways.html` |

## Conventions

- **Skills live in `operations/skills/<skill-name>/`** — project-scoped, so they travel with this folder.
- **Source transcripts in `inputs/` are read-only.** Don't modify them. Generated artifacts go in `outputs/`.
- **No emojis** in any file (workshop-wide convention).
- **Markdown link syntax** for file references — `[Day 1](inputs/day_1_transcript.md)`.
- **Speaker initials are stable** — `MW = Madeleine`, `MK = Marlon`, plus any faculty/guests named in the transcript. Preserve them in the provenance opening.

## Output contract (hard rules)

Every takeaways doc must satisfy these properties:

- **Title** in the shape `# <Day> — Top 10 Key Takeaways`.
- **One-line italic provenance note** as the opening: what was distilled from (linked), the chunk/time range, and the instructors present.
- **Exactly 10 numbered takeaways**, each led by a **bold one-sentence headline** (the mantra), then 1–3 sentences of grounded explanation.
- **Specific to the room.** Name the demos, analogies, turns of phrase. Quote memorable lines verbatim. Generic phrasing is the failure mode.
- **Secondary points** section at the end — bulleted, for the smaller details worth keeping that did not make the top 10.
- **Voice: tight, concrete, faculty-facing.** Favor the instructors' own language over generic AI-explainer prose. No preamble.
- **Portable HTML companion.** Inline CSS, no external assets — survives email, print, and offline reading.

## Alignment constraints (the hard ones)

These survive translation to other transcript-distillation tasks:

- **Forced count, not "key takeaways."** Ten is the constraint that forces ranking. Without it, the model produces a long list and nothing is distilled.
- **Provenance is part of the artifact.** The italic opening makes every claim auditable — a reader can trace a takeaway back to a named speaker in a named hour.
- **Quote verbatim.** Direct quotes are the receipts. They tell the reader the takeaway came from the room, not from the model's general knowledge of AI workshops.
- **Two-tier structure.** Top 10 stays tight; secondary points catches the rest.
