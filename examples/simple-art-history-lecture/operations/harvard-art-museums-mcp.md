# Operations — the Harvard Art Museums MCP, and what we did with it

This example has no clever prompt and no skill. The work is done by a small **custom MCP
server** that gives Claude Code live access to the Harvard Art Museums collection, plus one
plain instruction: *take my lecture notes and turn them into an illustrated web page, with
every image and every catalogue fact pulled from the real museum collection.*

Three things are worth documenting: how the MCP works, how it was built, and the exact move
we made with it here.

---

## 1. How the Harvard Art Museums MCP works

The server lives at [`_mcps/harvard-art-museums-mcp/`](../../../_mcps/harvard-art-museums-mcp/)
at the repo root and is wired into Claude Code through the project-scoped
[`.mcp.json`](../../../.mcp.json). When you start `claude` anywhere in this repo, the server
launches automatically and its tools appear with a `mcp__harvard-art-museums__` prefix. Run
`/mcp` to confirm it's connected.

It is a thin, well-behaved wrapper around the
[public Harvard Art Museums API](https://github.com/harvardartmuseums/api-docs) (260,000+
objects). It exposes five tools:

| Tool | What it does |
| --- | --- |
| `ham_search_objects` | Search/filter the collection — keyword, title, classification, worktype, medium, technique, culture, century, **person**, color (hex), hue, year made, gallery, exhibition, and *image availability*. Sortable and paged. |
| `ham_get_object` | Fetch the full catalogue record for one object by `objectid` — or just one slice of it (`colors`, `exhibitions`, `images`, `people`, `publications`, `videos`). |
| `ham_list_terms` | Browse the controlled vocabularies (`classification`, `worktype`, `medium`, `technique`) with object counts, to discover valid filter values. |
| `ham_list_colors` | List the ~147 named colors (with hex) used to describe images, to feed the `color`/`hue` filters. |
| `ham_get_image_url` | Build IIIF Image API URLs (crop/scale/rotate) and presentation-manifest URLs. Pure string building — no network call, no key. |

The typical loop is: `ham_search_objects` (find candidate works) → `ham_get_object` (confirm
the title, date, medium, accession number, and that an image exists) → `ham_get_image_url`
(construct the exact image URL to embed). Every data tool can return human-readable markdown
(default) or full structured `json`, and pages large result sets rather than dumping them.

**Why this matters for the artifact.** The images on the finished page are not uploaded or
copied — they are served live from the museum's IIIF endpoint
(`https://nrs.harvard.edu/urn-3:HUAM:...`), at the resolution we asked for, with a link back
to each object's catalogue record. The titles, dates, and accession numbers in the captions
came out of `ham_get_object`, so they match the museum's own records rather than the model's
memory. That is the entire point of using a tool instead of asking the model to "remember"
the collection: **the facts are sourced, and the model can't hallucinate an accession number.**

A few constraints inherited from the API (all spelled out in the server's
[README](../../../_mcps/harvard-art-museums-mcp/README.md)):

- A free API key is required; it's supplied via `.mcp.json` (`env.HAM_API_KEY`).
- Courtesy rate limit ~2,500 requests/day — prefer a larger `size` over repeated paging.
- Images for rights-restricted works (much 20th/21st-century material) may not resolve; the
  late-19th-century works in this lecture are in the clear.
- Per the API terms, display the API's image URLs rather than caching copies — which is
  exactly what the output page does.

## 2. How the MCP was built

It is a small TypeScript MCP server built with the official
[MCP SDK](https://modelcontextprotocol.io), following the same pattern the repo's
[`mcp-builder`](../../../_mcps/) skill encourages. The shape, for anyone who wants to build
their own against a different collection or API:

```
src/
  index.ts            # entry point: loads .env, registers the five tools, stdio transport
  constants.ts        # API base URLs, page sizes, character limit, rate limit
  types.ts            # TypeScript interfaces for the API's response shapes
  services/
    client.ts         # HTTP client + actionable error handling (401 / 404 / 429 / timeout)
    format.ts         # markdown vs json formatting, pagination meta, truncation helpers
  tools/
    objects.ts        # ham_search_objects, ham_get_object
    terms.ts          # ham_list_terms
    colors.ts         # ham_list_colors
    images.ts         # ham_get_image_url
```

The design choices that make it pleasant for an LLM to drive:

- **One tool per natural step**, named for the step (`search` → `get` → `image_url`), so the
  model can chain them without guessing.
- **Discovery tools** (`ham_list_terms`, `ham_list_colors`) so the model can *find the valid
  filter values* instead of inventing them — the controlled-vocabulary equivalent of letting
  it read the schema.
- **Markdown-by-default, json-on-request** responses, and **truncation with guidance** ("too
  many results — narrow with …") so a broad query educates the model rather than flooding it.
- **Actionable errors** — a 401 says "check your API key," a 429 says "rate limited, slow
  down" — so failures are self-correcting in conversation.

The companion server [`_mcps/replicate-image/`](../../../_mcps/replicate-image/) ships a
longer write-up, [`how-to-build-an-mcp.md`](../../../_mcps/replicate-image/how-to-build-an-mcp.md),
if you want a full from-scratch walkthrough of the same pattern.

## 3. What we did with it (this example's move)

The whole build was one short session:

1. **Brought in the notes.** The lecturer's plain-text script lives at
   [`inputs/lecture-notes.md`](../inputs/lecture-notes.md) — five parts, twelve `SHOW:` markers
   naming the work wanted on screen at each beat, plus interpretive glosses. No images, no
   accession numbers, no guarantee the works were even at Harvard.

2. **Resolved every `SHOW:` against the real collection.** For each named work, Claude called
   `ham_search_objects` (by artist + title), picked the matching `objectid`, then
   `ham_get_object` to confirm the canonical **title, date, medium, and accession number** and
   that a usable image existed — correcting the notes' dates/titles against the museum record
   where they differed. Then `ham_get_image_url` produced the exact IIIF URL to embed (a larger
   crop for the full plates, a 400px crop for the thumbnail index).

3. **Composed one self-contained page.** Claude wrote a single HTML file
   ([`outputs/index.html`](../outputs/index.html)) that keeps the lecturer's prose and glosses,
   sets each work as a captioned plate with a link back to its Harvard catalogue record, and
   closes with a twelve-thumbnail "plate index." Images stream live from the museum's IIIF
   service; nothing is downloaded. The page has inline CSS and no external assets, so it can be
   posted to a course site or emailed and still render.

The instruction that drove step 2–3 was essentially:

> Read `inputs/lecture-notes.md`. For every `SHOW:` line, use the Harvard Art Museums MCP to
> find the work in the collection, confirm its title/date/medium/accession number against the
> museum's record (fix my notes where they're wrong), and get an image URL. Then build one
> self-contained HTML page that preserves my text and glosses, shows each work as a captioned
> plate linked to its catalogue record, and ends with a thumbnail index of all twelve. Use the
> museum's live IIIF image URLs — don't download anything.

### Why this is the interesting move

A general-purpose model can write a perfectly fluent art-history lecture from memory — and
quietly attribute a painting to the wrong museum, invent an accession number, or cite a date
off by a decade. The MCP changes the epistemics: **every factual claim in the captions is
fetched from the institution that owns the object, and every image is the institution's own.**
The model still does what it's good at — the prose, the structure, the interpretation — while
the tool supplies the facts it would otherwise be tempted to fabricate.

To regenerate: edit `inputs/lecture-notes.md` (add, drop, or reword `SHOW:` works), then
re-run the instruction above. `outputs/index.html` is overwritten in place.
