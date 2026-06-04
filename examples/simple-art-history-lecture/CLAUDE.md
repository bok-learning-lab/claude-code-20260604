# CLAUDE.md — Simple Art History Lecture

This project turns a lecturer's plain-text notes into a single, self-contained, illustrated
web page — where every image and every catalogue fact (title, date, medium, accession number,
link) is pulled live from the **Harvard Art Museums** through a custom MCP server, not from the
model's memory. Notes live in `inputs/`. The MCP write-up and the build move live in
`operations/`. The generated page goes in `outputs/`. See [summary.md](summary.md) for the full
overview.

## How to work in this project

You are building teaching slides-as-a-webpage for an undergraduate art history lecture. The
lecturer supplies prose and interpretive glosses in [inputs/lecture-notes.md](inputs/lecture-notes.md);
each `SHOW:` line names a work they want on screen. Your job is to make every one of those works
*real*: find it in the Harvard Art Museums collection via the
`mcp__harvard-art-museums__*` tools, confirm its canonical metadata, and embed the museum's own
image.

The loop for each `SHOW:` work:

1. `ham_search_objects` — find the work by artist + title.
2. `ham_get_object` — confirm the canonical **title, date, medium, accession number**, and that
   a usable image exists. If the notes' date or title differ from the museum record, the museum
   record wins — correct the caption.
3. `ham_get_image_url` — build the exact IIIF image URL to embed (a larger crop for full plates,
   a small crop for the thumbnail index).

Then compose one self-contained HTML file at `outputs/index.html` that preserves the lecturer's
text and glosses, presents each work as a captioned plate linked to its Harvard catalogue record,
and ends with a thumbnail index of every work.

## Constraints

- **Facts come from the tool, not from memory.** Never write a title, date, medium, or accession
  number you did not confirm via `ham_get_object`. Never invent an accession number. If the MCP
  can't find a work or has no image for it, say so in the build rather than fabricating one.
- **Live images only.** Embed the museum's IIIF image URLs (`https://nrs.harvard.edu/urn-3:HUAM:…`).
  Do not download, copy, or cache images — the API terms require displaying the museum's URLs.
- **Self-contained HTML.** Inline `<style>`, no CDNs, no external fonts or JS, so the page can be
  posted to a course site or emailed and still render.
- **Keep the lecturer's voice.** Preserve the prose and interpretive glosses from the notes; the
  tool corrects facts, not interpretation.
- **One page, regenerated in place.** `outputs/index.html` is the artifact; overwrite it rather
  than creating parallel copies.

The MCP server itself lives at [`_mcps/harvard-art-museums-mcp/`](../../_mcps/harvard-art-museums-mcp/)
and is wired in through the repo-root [`.mcp.json`](../../.mcp.json); run `/mcp` to confirm it is
connected before starting.
