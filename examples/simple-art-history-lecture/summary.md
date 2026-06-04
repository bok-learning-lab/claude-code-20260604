# Simple art history lecture

A small Claude Code project that turns a lecturer's plain-text notes into a single,
self-contained, illustrated web page — where every image and every catalogue fact is pulled
**live from the Harvard Art Museums** through a custom MCP server, not from the model's memory.
Notes in `inputs/`. A write-up of the MCP and the build move in `operations/`. One generated
page in `outputs/`.

This is the example that demonstrates the **MCP move**: most of the other examples teach Claude
a *discipline* through a prompt or a skill; this one gives Claude a *new sense* — live, sourced
access to an external collection — and lets that change what kind of artifact it can be trusted
to build.

---

## What it is

The input is [inputs/lecture-notes.md](inputs/lecture-notes.md): an imagined one-hour
undergraduate lecture on late nineteenth-century painting in France (c. 1872–1897), "The Broken
Surface." It is plain text — five parts, twelve `SHOW:` markers naming the work the lecturer wants
on screen at each beat, plus the lecturer's own interpretive glosses. There are no images, no
accession numbers, and no guarantee in the notes that the works are even at Harvard.

The output is [outputs/index.html](outputs/index.html): one self-contained web page that keeps the
lecturer's prose and glosses, presents each of the twelve works as a captioned plate — correct
title, date, medium, accession number, and a link back to its Harvard catalogue record — and
closes with a twelve-thumbnail "plate index." Every image streams live from the museum's IIIF
service; nothing is downloaded. Inline CSS, no external assets, so it survives being posted to a
course site or emailed.

In between sits the [Harvard Art Museums MCP server](../../_mcps/harvard-art-museums-mcp/), wired
into Claude Code through the repo-root [`.mcp.json`](../../.mcp.json). The full account of how it
works, how it was built, and the exact instruction we gave is in
[operations/harvard-art-museums-mcp.md](operations/harvard-art-museums-mcp.md).

## How we built it

One short session, three steps:

1. **Brought in the notes.** The plain-text script, with twelve `SHOW:` markers and no images.

2. **Resolved every `SHOW:` against the real collection.** For each named work, Claude called
   `ham_search_objects` (by artist + title), confirmed the match with `ham_get_object` — pulling
   the canonical **title, date, medium, and accession number** and verifying an image existed,
   correcting the notes where they differed — then `ham_get_image_url` to construct the exact IIIF
   URL to embed.

3. **Composed one self-contained page.** Claude wrote a single HTML file that preserves the
   lecturer's text and glosses, sets each work as a captioned plate linked to its catalogue record,
   and ends with the thumbnail index. Live IIIF images, inline CSS, no external assets.

The whole apparatus is one custom MCP plus one plain instruction. There is no skill and no clever
prompt here — the leverage is the tool.

### The thing this example is really about

A general-purpose model can write a fluent art-history lecture from memory — and quietly attribute
a painting to the wrong museum, invent an accession number, or get a date wrong by a decade. The
MCP changes the epistemics of the task: **every factual claim in the captions is fetched from the
institution that owns the object, and every image is the institution's own.** The model still does
what it is good at — the prose, the sequencing, the interpretation — while the tool supplies the
verifiable facts it would otherwise be tempted to fabricate. That division of labor is the lesson.

## What you can translate this to

The pattern is: **a body of human writing that references real-world objects, + an MCP that can
look those objects up in an authoritative source, → an artifact where the prose is the human's and
the facts are sourced.** It transfers to any domain with a queryable collection or API and a free
or institutional key:

- **Any museum or archive with an API.** The same shape against a different
  IIIF/collections endpoint — a literature syllabus illustrated from a manuscripts library, a
  history lecture from a photo archive, a science unit from a specimen database.
- **A reading list illustrated from a library catalogue.** `SHOW:` markers become "find this
  edition," and the MCP returns correct citations, call numbers, and cover images.
- **A research talk grounded in a dataset or repository.** Notes name results or papers; an
  arXiv/Zenodo/data-portal MCP confirms the citation, the version, the DOI, the figure.
- **A course site that must stay factually current.** Because the facts live in the tool, not the
  prose, regenerating the page re-checks every claim against the source of record.

In every case the move is the same as here: let the model write, and let the tool be the thing
that cannot be allowed to lie.

---

## Alignment constraints (the hard ones)

- **Facts from the tool, never from memory.** No title, date, medium, or accession number that
  was not confirmed via `ham_get_object`. Never invent an accession number. If a work can't be
  found or has no image, say so — don't fabricate.
- **Live images only.** Embed the museum's IIIF URLs; never download or cache copies. (Required by
  the API terms of use.)
- **Self-contained HTML.** Inline `<style>`, no external assets — portability is part of the
  contract.
- **Keep the lecturer's voice.** The tool corrects facts; it does not rewrite interpretation.
- **One page, overwritten in place** when regenerating.
