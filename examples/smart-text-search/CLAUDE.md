# CLAUDE.md — Smart text search

Project-level instructions loaded when Claude Code starts in this folder.

## What this project is

A worked example of using Claude as a **close reader at scale**. The project hands Claude 538 Bob Dylan songs and asks: name every writer mentioned in any lyric — poets, novelists, playwrights, philosophers — quoting the line each name appears in. See [summary.md](summary.md) for the move worth noticing (close reading instead of grep), the corpus design, and what you can translate this to.

The point of the project is not the Dylan corpus specifically. It is the move: **close reading, at corpus scale, by an LLM that has been told to read like a close reader and refuse to grep.**

This folder is meant to be opened as a standalone Claude Code project — `cd` into it, run `claude`, and everything you need is here.

## If you just opened this folder

Read in this order:

1. [summary.md](summary.md) — what this is, how we built it, what you can translate it to.
2. [index.md](index.md) — a map of the folder.
3. [operations/find-writers-prompt.md](operations/find-writers-prompt.md) — the reusable batched close-reading prompt.
4. [outputs/writers-in-dylan.md](outputs/writers-in-dylan.md) — a validated example of what the prompt produces.

## How to work in this project

You are acting as a research assistant for a literary scholar. The corpus is large enough that you cannot hold it all in mind at once, so the prompt batches the work. Within each batch, you are doing the work a careful undergraduate research assistant would do — reading every line for sense, catching obliquely named writers, refusing to invent matches, and quoting the exact line as the receipt.

Two passes, in order:

1. **Run the prompt in batches.** Split the 538-song corpus into chunks small enough that a single Claude session can read every song fully (e.g. 50 songs per batch). Each batch writes one `outputs/batch_NN.json` file with its findings.
2. **Aggregate and write the prose.** Concatenate the per-batch JSONs into `outputs/_aggregated.json`. Then produce the prose writeup at `outputs/writers-in-dylan.md` — for each writer: the song, the surrounding verse, a stab at *why* the writer is being named. Ordered by release year.

## The pipeline

| Step | What | Output |
|---|---|---|
| 1 | Place corpus at `inputs/bob_dylan_lyrics_unique.json` (one record per song) | (input) |
| 2 | Invoke [operations/find-writers-prompt.md](operations/find-writers-prompt.md) with `{START}`/`{END}` indices, once per batch | `outputs/batch_NN.json` |
| 3 | Concatenate the per-batch JSONs into one master file | `outputs/_aggregated.json` |
| 4 | Write the prose writeup as a second pass | `outputs/writers-in-dylan.md` |

## Conventions

- **Source corpus in `inputs/` is read-only.** Don't modify it. Generated artifacts go in `outputs/`.
- **No emojis** in any file (workshop-wide convention).
- **Markdown link syntax** for file references — `[song](inputs/bob_dylan_lyrics_unique.json)`.
- **Stable shape across all batches** — each finding is `{"song", "index", "writers": [{"name", "quote"}]}`. Don't drift.

## Output contract (hard rules)

Every batch JSON must satisfy these properties:

- **One pass per song, fully read.** No grep, no regex. The instruction is in the prompt; honor it.
- **Verbatim quote on every entry.** The quote is the receipt. Without it, the finding is not auditable.
- **List every writer when a line names two or more** (the "Verlaine's and Rimbaud's" rule). Don't drop the second name.
- **Strict exclusions.** Actors, athletes, politicians (unless cited as authors), saints, fictional characters, place names, and common words that merely coincide with a surname (e.g. "frost," "pound," "swift") are not writers. The exclusion list is in the prompt.
- **No invented matches.** Only include names that actually appear in the text. The verbatim-quote requirement is the enforcement mechanism.
- **Empty list `[]` when a song names no writer.** Don't fabricate to fill space.

## Alignment constraints (the hard ones)

These survive translation to other "close-reading at scale" tasks:

- **Close reading, not pattern matching.** State the constraint explicitly in the prompt. *"Do not grep or use regex"* is the smallest instruction that changes the kind of work the model does.
- **Verbatim quoting is the receipt.** Every finding must include the exact line it appears in. The reader audits by visual match.
- **Strict exclusions.** Half the work is naming what *not* to count. Write the exclusion list before the inclusion list.
- **No invented matches.** Say it explicitly. The verbatim-quote requirement is the enforcement mechanism.
- **Batch and aggregate.** A corpus too large for a single pass is split into batches, each writing its own output, then concatenated.
