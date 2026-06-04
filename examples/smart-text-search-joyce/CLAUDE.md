# CLAUDE.md — Finding Finn (Joyce close-reading at scale)

Project-level instructions loaded when Claude Code starts in this folder.

## What this project is

A worked Claude Code example built to support **Prof. Natasha Sumner's** research on the Fenian tradition (*Heroes of the Gael: A History of Fionn and the Fianna*, Harvard, Feb. 2026). The research task: *where does Fionn mac Cumhaill actually appear in James Joyce's* Finnegans Wake*?* The answer is hard because the hero arrives in misspellings, puns, avatars, body-as-landscape, and mythic attributes with no letters in common with his name — so `grep` cannot find him. The project breaks the book into 48 chunks, points one Claude subagent at each as a close reader, and pools the structured findings. See [summary.md](summary.md) for the method, the coding scheme, and the takeaway for faculty.

The point of the project is not the Joyce corpus specifically. It is the move: **many close readers reading in parallel, each producing a small structured judgment with reasoning and confidence, pooled into a researchable scholarly apparatus.**

This folder is meant to be opened as a standalone Claude Code project — `cd` into it, run `claude`, and everything you need is here.

## If you just opened this folder

Read in this order:

1. [summary.md](summary.md) — the research question, the method (48 close-readers in parallel), and what it shows about literary work an LLM can and cannot do.
2. [index.md](index.md) — a map of the folder.
3. [operations/find-finn-prompt.md](operations/find-finn-prompt.md) — the reusable per-chunk close-reading prompt.
4. [outputs/finn_references_aggregated.json](outputs/finn_references_aggregated.json) — the merged master list of all references found.

## How to work in this project

You are acting as a research assistant for a literary scholar in the Fenian tradition. Each subagent gets a ~600-line slice of *Finnegans Wake* small enough that it can read every word, the way a graduate student would on a slow afternoon. The subagent's job is not to *answer* the research question but to *propose* candidates — with a category, a reading, and a confidence — that Prof. Sumner can then verify, prune, and extend. Claude does the tireless close reading at scale; the scholar does the authoritative judgment.

Two passes, in order:

1. **Read the chunk word-by-word.** No keyword search, no grep, no regex. The text resists those tools; that is the whole point. Use your knowledge of Joyce, the Fenian tradition, and Irish mythology to *judge* candidates.
2. **Write a structured finding per hit.** Every hit is `{global_line, matched_text, snippet, variant_type, reasoning, confidence}`. The structure is what makes the output researchable — `variant_type` is a coding scheme the scholar can argue with; `reasoning` puts the interpretation on the table; `confidence` separates the obvious from the speculative.

## The pipeline

| Step | What | Output |
|---|---|---|
| 1 | Source text at `inputs/finnegans_wake.md` (already chunked into `operations/chunks/chunk_00`–`chunk_47`) | (input) |
| 2 | Spawn one subagent per chunk; each invokes [operations/find-finn-prompt.md](operations/find-finn-prompt.md) on its slice | `outputs/finn_chunk_NN.json` |
| 3 | Aggregate the 48 files into one master list, sorted by `global_line` | `outputs/finn_references_aggregated.json` |

## The coding scheme (`variant_type` values)

Every finding must carry a `variant_type` from this fixed list — these are the categories Prof. Sumner's tradition has taught us to expect:

- `direct-spelling` — the name plainly written (e.g. *"Mister Finn"*, *"Finn MacCool"*).
- `pun` — wordplay on the name (e.g. *"Finnagain"*).
- `avatar-epithet` — a named avatar or epithet (Tim Finnegan the hod-carrier, *the flawhoolagh*, *Bygmester*).
- `giant-landscape` — the body-as-Dublin-landscape (Howth as head, the Liffey as body).
- `mythic-attribute` — Fenian mythology with no letters in common with Finn's name (Salmon of Knowledge, the Fianna, Diarmuid, the thumb of wisdom).
- `fall-resurrection` — the fall-and-rise structure (phoenix, the whiskey that revives the corpse).

If a passage genuinely fits two categories, pick the dominant one; the `reasoning` field can note the other.

## Conventions

- **Source text in `inputs/` is read-only.** Don't modify it. Generated artifacts go in `outputs/`.
- **Chunked text in `operations/chunks/` is read-only.** Re-chunking changes the line offsets and breaks aggregation.
- **`global_line` is the line number in the full source**, not the line within the chunk. Each chunk carries a known offset; honor it so findings map back.
- **Stable JSON shape across all chunks.** Don't drift — `{global_line, matched_text, snippet, variant_type, reasoning, confidence}`.
- **No emojis** in any file (workshop-wide convention).
- **Markdown link syntax** for file references.

## Output contract (hard rules)

Every chunk JSON must satisfy these properties:

- **Read every word.** No keyword search as a filter between the reader and the text.
- **`variant_type` is from the fixed list above.** Don't invent new categories; the categories are the coding scheme.
- **`confidence` is `high` / `medium` / `low`.** Be calibrated. The low ones are suggestive, not authoritative.
- **`reasoning` is in plain language.** A researcher should be able to read it and agree, disagree, or follow it up. The interpretation is on the table, not hidden.
- **Verbatim `matched_text` and `snippet`.** No paraphrase. The quote is the receipt.
- **No invented matches.** Only include passages that actually appear in the chunk.

## Alignment constraints (the hard ones)

These come from the research-collaboration register and apply to everything Claude does in this project. They also survive translation to other "close-reading at scale" tasks:

- **Close reading, not pattern matching.** State the constraint explicitly in the prompt. The whole point of the project is that grep cannot find Fionn.
- **A first-pass scholarly apparatus, not a final answer.** The output is something Prof. Sumner verifies, prunes, and extends. Frame Claude as augmenting the scholar; the scholar does the authoritative judgment.
- **Calibrated confidence.** The high- and medium-confidence direct and avatar references are solid; the low puns are suggestive. Don't oversell the low ones; don't undersell the high ones.
- **Verbatim quoting is the receipt.** Every finding includes its exact line. The reader audits by visual match.
- **Structured judgment, not just a location.** `variant_type` + `reasoning` + `confidence` is what turns a list of hits into a researchable apparatus.
- **Honest about the model's limits.** A smaller, faster model reading independently will catch the obvious and miss some oblique puns. Say so. A natural follow-up is a second pass with stronger models over the densest sections.
