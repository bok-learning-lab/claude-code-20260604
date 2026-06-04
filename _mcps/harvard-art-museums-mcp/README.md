# Harvard Art Museums MCP Server

An [MCP](https://modelcontextprotocol.io) server that lets an LLM explore the
[Harvard Art Museums](https://www.harvardartmuseums.org) collection through the
[public API](https://github.com/harvardartmuseums/api-docs): search 260,000+
objects, inspect individual works, browse the controlled vocabularies and color
palette, and build IIIF image/manifest URLs.

## Tools

| Tool | What it does |
| --- | --- |
| `ham_search_objects` | Search/filter the collection by keyword, title, classification, worktype, medium, technique, culture, century, person, color (hex), hue, year made, gallery, exhibition, and image availability. Supports sorting and paging. |
| `ham_get_object` | Fetch the full catalogue record for one object by `objectid`, or just one subsection (`colors`, `exhibitions`, `images`, `people`, `publications`, `videos`). |
| `ham_list_terms` | Browse the controlled vocabularies — `classification`, `worktype`, `medium`, `technique` — with object counts, to discover valid filter values. |
| `ham_list_colors` | List the ~147 named colors (with hex values) used to describe images, to feed the `color`/`hue` filters. |
| `ham_get_image_url` | Construct IIIF Image API URLs (crop/scale/rotate) and presentation manifest URLs. Pure string building — no network call, no API key. |

Every data tool supports `response_format: "markdown"` (default, human-readable)
or `"json"` (full structured records), respects a `size`/`page` pagination
model, and truncates large responses with guidance to narrow the query.

A typical workflow: `ham_list_terms` → find a classification → `ham_search_objects`
→ pick an `objectid` → `ham_get_object` → `ham_get_image_url` to view an image.

## Setup

Requires **Node.js ≥ 18** and **[pnpm](https://pnpm.io)**. From this folder:

```bash
pnpm install   # fetch dependencies
pnpm build     # compile src/ -> dist/ (what .mcp.json launches)
```

The repo's `_mcps/setup.sh` runs both of these for you automatically. During
development you can skip the build and run straight from TypeScript with
`pnpm dev` (tsx watch).

### Don't have Node or pnpm?

If the commands above fail with something like `command not found: pnpm` or
`node: command not found`, install the toolchain and re-run them:

- **Node.js** (includes `npm`):
  - macOS: `brew install node` — or download from <https://nodejs.org/>
  - Windows: `winget install OpenJS.NodeJS.LTS` — or the installer at <https://nodejs.org/>
  - Linux: your package manager (e.g. `apt install nodejs`) — or <https://nodejs.org/>
  - Check: `node --version` should print `v18` or higher.
- **pnpm** (ships with Node via Corepack):
  - `corepack enable pnpm`  (works with Node 16.9+)
  - or, if that's unavailable: `npm install -g pnpm`
  - Check: `pnpm --version`.

Then run `pnpm install && pnpm build` again.

### API key

The API requires a free key (request one
[here](https://docs.google.com/forms/d/1Fe1H4nOhFkrLpaeBpLAnSrIMYvcAxnYWm0IU9a6IkFA/viewform)).
The key is supplied through the parent project's `.mcp.json` (`env.HAM_API_KEY`)
— see that file's `harvard-art-museums` entry. Alternatively, copy the example
env file and add your key there:

```bash
cp .env.example .env
# then edit .env and set HAM_API_KEY=...
```

`.env` lives in the project root (next to `package.json`) and is git-ignored.
The server loads it relative to its own location, so it works no matter which
directory the server is started from.

> Courtesy rate limit: 2,500 requests/day. Prefer larger `size` over repeated paging.

## Running

This server is registered in the parent project's `.mcp.json` and is launched
automatically by Claude Code when you work in that project — you don't normally
run it by hand. Its entry looks like:

```json
"harvard-art-museums": {
  "type": "stdio",
  "command": "node",
  "args": ["_mcps/harvard-art-museums-mcp/dist/index.js"],
  "env": { "HAM_API_KEY": "..." }
}
```

`node` + a compiled `dist/index.js` is used (rather than `tsx`) because it runs
identically on macOS and Windows. The path is relative to the project root, which
is the working directory Claude Code uses when starting project MCP servers.
Requires `pnpm build` to have produced `dist/` first (setup.sh does this).

To run it directly for debugging:

```bash
pnpm start      # node dist/index.js (needs a prior `pnpm build`)
pnpm dev        # tsx watch src/index.ts (auto-reload, no build needed)
```

The server speaks MCP over **stdio** and is meant to be launched by an MCP
client, not run interactively.

## Project layout

```
src/
  index.ts            # entry point: loads .env, registers tools, stdio transport
  constants.ts        # API URLs, page sizes, character limit, rate limit
  types.ts            # API response interfaces
  services/
    client.ts         # HTTP client + actionable error handling (401/404/429/timeout)
    format.ts         # response formats, pagination meta, truncation helpers
  tools/
    objects.ts        # ham_search_objects, ham_get_object
    terms.ts          # ham_list_terms
    colors.ts         # ham_list_colors
    images.ts         # ham_get_image_url
```

## Notes & limitations

- Images for rights-restricted works (many 20th/21st-century pieces) may not
  resolve for most API keys.
- The `hue` filter and `query` substring matching are implemented via
  Elasticsearch query-string syntax and are best-effort.
- Per the API terms of use, content is non-commercial and should not be cached
  for more than two weeks; display the API's image URLs rather than copies.

## Scope

This server focuses on **objects/images** and **classification/color**. The API
also exposes person, culture, period, exhibition, gallery, publication, and more
— straightforward to add following the same patterns in `src/tools/`.

A vendored copy of the upstream API documentation is kept in [`docs/`](./docs)
for offline reference and future development — see [`docs/README.md`](./docs/README.md)
for an endpoint-coverage map.
