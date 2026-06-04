# simple-art-history-lecture — folder index

A small project that turns a lecturer's plain-text notes into one self-contained, illustrated
web page — with every image and catalogue fact pulled live from the **Harvard Art Museums** via
a custom MCP server, not from the model's memory. This is the example that demonstrates the **MCP
move**. Start with [summary.md](summary.md); everything else is here for browsing.

## Top-level

- [summary.md](summary.md) — what this project is, how we built it, what you can translate it to
- [CLAUDE.md](CLAUDE.md) — project-level instructions loaded by Claude Code on session start
- [index.md](index.md) / [index.html](index.html) — this file

## inputs/

The lecturer's source material — plain text, no images.

- [inputs/lecture-notes.md](inputs/lecture-notes.md) — "The Broken Surface," an imagined one-hour
  lecture on late-19th-century French painting (c. 1872–1897). Five parts, twelve `SHOW:` markers
  naming works to illustrate, plus the lecturer's interpretive glosses.

## operations/

- [operations/harvard-art-museums-mcp.md](operations/harvard-art-museums-mcp.md) — how the Harvard
  Art Museums MCP works, how it was built, and the exact move we made with it (resolve every
  `SHOW:` against the real collection, then compose one self-contained page). The server itself
  lives at [`_mcps/harvard-art-museums-mcp/`](../../_mcps/harvard-art-museums-mcp/), wired in via
  the repo-root [`.mcp.json`](../../.mcp.json).

## outputs/

- [outputs/index.html](outputs/index.html) — the finished page: twelve captioned plates with
  correct titles, dates, media, accession numbers, and catalogue links, plus a thumbnail index.
  Images stream live from the museum's IIIF service; inline CSS, no external assets, fully portable.

---

*To regenerate: edit [inputs/lecture-notes.md](inputs/lecture-notes.md) (add, drop, or reword
`SHOW:` works), confirm the Harvard Art Museums MCP is connected (`/mcp`), then re-run the build
instruction in [operations/harvard-art-museums-mcp.md](operations/harvard-art-museums-mcp.md).
`outputs/index.html` is overwritten in place.*
