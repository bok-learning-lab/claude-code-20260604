# smart-text-search — folder index

A worked example of using Claude as a close reader at scale: read 538 Bob Dylan songs and name every writer mentioned, with the exact line each writer appears in. Start with [summary.md](summary.md); everything else is here for browsing.

## Top-level

- [summary.md](summary.md) — what this project is, how we built it, what you can translate it to
- [index.md](index.md) / [index.html](index.html) — this file

## inputs/

The Bob Dylan lyrics corpus, in two forms.

- [inputs/bob_dylan_lyrics.json](inputs/bob_dylan_lyrics.json) — all songs (538), including variant takes and duplicates
- [inputs/bob_dylan_lyrics_unique.json](inputs/bob_dylan_lyrics_unique.json) — deduplicated list, one record per song with `name`, `first_album`, `first_album_year`, `text`

## operations/

- [operations/find-writers-prompt.md](operations/find-writers-prompt.md) — the batched close-reading prompt. Takes `{START}` and `{END}` indices; reads each song fully; refuses to grep or invent matches; writes findings as JSON to `outputs/batch_NN.json` with verbatim quote on every entry

## outputs/

- [outputs/_aggregated.json](outputs/_aggregated.json) — every match across the corpus, song-by-song, with the exact line each writer was named in
- [outputs/writers-in-dylan.md](outputs/writers-in-dylan.md) — the prose writeup. For each writer: the song, the surrounding verse, a stab at why the writer is being named. Ordered by release year

---

*To run end-to-end: split the 538-song corpus into batches (e.g. 50 songs each), invoke the prompt with each batch's `{START}` and `{END}` indices, then concatenate the per-batch JSONs into `_aggregated.json` and write the prose writeup as a second pass.*
