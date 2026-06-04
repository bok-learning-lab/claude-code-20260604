# How to build an MCP: academic paper search

A worked example: building a small Python MCP server that wraps the
Semantic Scholar API, following the same pattern as the Replicate image MCP
from the previous workshop iteration. This document walks through the actual
path and design decisions.

---

## What we built

Three MCP tools, all prefixed `academic_`:

- `academic_search` -- search for papers by keyword, phrase, or question
- `academic_get_paper` -- fetch full details for a specific paper (by DOI, arXiv ID, etc.)
- `academic_recommend` -- find papers related to a given paper

No API key is required for basic use. An optional free key raises the rate limits.

---

## Why this API

Semantic Scholar was chosen because:

1. **No auth barrier.** The API works without a key (though rate limits are tight).
   A free API key raises those limits. No credit card, no billing.
2. **Faculty-relevant.** Every academic searches for papers. This connects to
   actual daily work, not a toy demo.
3. **Clean, well-documented REST API.** Three endpoints cover the three workflows
   faculty actually want: search, look up, discover related work.
4. **Small surface area.** Three tools, not thirty. Easy to understand in a demo.

---

## The structure

```
_mcp/academic_search/
  server.py          # FastMCP server, 3 tools
  requirements.txt   # mcp, httpx, pydantic
  setup.sh           # idempotent installer (creates venv, installs deps)
  .env.example       # documents the optional API key env var
  how-to-build-an-mcp.md  # this file
```

External pieces:
- `/.mcp.json` -- project-level MCP registration (tells Claude Code where to find the server)
- `/CLAUDE.md` -- should have a bootstrap section (check for venv, run setup.sh if missing)

---

## The three tools and why each exists

| Tool | What a faculty member says | What the tool does |
|---|---|---|
| `academic_search` | "Find papers about active learning in STEM" | Keyword search, returns titles/authors/abstracts/citation counts |
| `academic_get_paper` | "Tell me about DOI:10.1234/example" | Full metadata for one paper, optionally with its citations and references |
| `academic_recommend` | "What else should I read if I liked this paper?" | Semantic Scholar's recommendation engine, seeded from one paper |

Design principle (from the `/mcp-builder` skill): build **workflow tools, not
endpoint wrappers**. The Semantic Scholar API has many endpoints. We only
wrapped the three that match what an LLM agent actually needs to do.

---

## Key design decisions

### No API key required (but recommended)

The server checks for `SEMANTIC_SCHOLAR_API_KEY` in the environment. If present,
it's sent as a header for higher rate limits. If absent, the API still works --
just slower (about 1 request per 5 seconds without a key, 10/sec with one).

For the workshop demo, **get a free key ahead of time** at:
https://www.semanticscholar.org/product/api#api-key-form

Add it to `.mcp.json`:

```json
{
  "mcpServers": {
    "academic_search": {
      "command": "_mcp/academic_search/.venv/bin/python",
      "args": ["_mcp/academic_search/server.py"],
      "env": {
        "SEMANTIC_SCHOLAR_API_KEY": "your-key-here"
      }
    }
  }
}
```

### httpx instead of requests

We use `httpx` (async HTTP client) instead of `requests` because the FastMCP
tools are async functions. `httpx.AsyncClient` works naturally with `async/await`.

### Markdown output, not JSON

The tools return markdown-formatted text, not raw JSON. This is deliberate:
Claude reads the results and synthesizes them for the user. Markdown with
headers, bold, and lists is easier for the model to parse and present than
nested JSON objects.

### save_results option on search

`academic_search` has an optional `save_results=True` flag that writes the
results to a markdown file in `output/`. This makes the results persist
beyond the conversation -- a faculty member can come back to them later.

---

## How to demo this in class

### Setup (before class)

1. Run `bash _mcp/academic_search/setup.sh`
2. Optionally add a Semantic Scholar API key to `.mcp.json`
3. Restart Claude Code (or `/mcp reconnect`)
4. Verify with a test query: "search for papers about active learning"

### Demo script (5-10 minutes)

1. **Search.** "Find recent papers about [topic relevant to audience]"
   -- Shows `academic_search` in action, returns formatted results.

2. **Deep dive.** Pick a paper from the results. "Tell me more about this paper"
   and paste its DOI.
   -- Shows `academic_get_paper` with full metadata.

3. **Discover.** "Find papers related to this one"
   -- Shows `academic_recommend`, the "rabbit hole" tool.

4. **Save.** "Search for papers about pedagogy and assessment, and save the results"
   -- Shows the `save_results` flag, file lands in `output/`.

5. **Combine with existing skills.** "Now take that paper and create teaching
   materials from it" (connects to the `paper-to-teaching-materials` example).

### The teaching point

The demo shows that an MCP is just a Python file that:
- Imports `FastMCP`
- Defines a few functions with type-annotated inputs
- Calls an HTTP API
- Returns formatted text

No magic. About 400 lines of Python, most of which is input validation and
formatting. The actual API calls are 3-4 lines each.

---

## Adapting this for another API

The recipe is the same as the Replicate MCP:

1. Type `/mcp-builder` in Claude Code.
2. Tell Claude the language (Python/FastMCP) and the target API.
3. Paste the API's quickstart docs.
4. Let Claude propose 3-5 workflow tools.
5. Iterate on error handling and output format.
6. Write `setup.sh`, register in `.mcp.json`, add bootstrap to `CLAUDE.md`.

Candidates that faculty have asked about:
- **Google Scholar** (via SerpAPI -- requires paid key)
- **ORCID** (free, lookup researcher profiles)
- **CrossRef** (free, DOI metadata and citation counts)
- **Canvas LMS API** (institutional, requires OAuth)
- **Zotero** (personal library access)
