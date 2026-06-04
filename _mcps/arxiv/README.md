# arxiv-mcp

An [MCP](https://modelcontextprotocol.io) server that wraps the [arXiv API](https://info.arxiv.org/help/api/index.html) so an LLM can search arXiv and retrieve e-print metadata.

## Tools

| Tool | Purpose |
| --- | --- |
| `arxiv_search_papers` | Search arXiv by query (topic, author, category, date range) with sorting and paging. |
| `arxiv_get_paper` | Retrieve metadata for one or more papers when you already know their arXiv IDs. |
| `arxiv_get_full_text` | Retrieve the full body text of a single paper, paged by character. |

The two metadata tools return either human-readable **markdown** (default) or structured **JSON** (`response_format="json"`), and surface title, authors, abstract, categories, links, journal reference, DOI, and comments.

### Full text

`arxiv_get_full_text` fetches the body of a paper only when you ask for it (search/get return abstracts only). It tries, in order:

1. **arXiv native HTML** (`arxiv.org/html/{id}`) — cleanest, recent papers
2. **ar5iv HTML** (`ar5iv.labs.arxiv.org`) — LaTeX-converted HTML, covers older papers
3. **PDF** text extraction (`arxiv.org/pdf/{id}`) via `pypdf` — universal fallback

Force a source with `source="html"` or `source="pdf"` (default `"auto"`). Because papers are long, text is returned in slices: the response header reports the character range and the `start_char` to pass for the next chunk. Tune slice size with `max_chars`.

### Query syntax (for `arxiv_search_papers`)

- Plain words search all fields: `electron`
- Field prefixes: `ti:` (title), `au:` (author), `abs:` (abstract), `co:` (comment), `jr:` (journal ref), `cat:` (category, e.g. `cs.AI`), `rn:` (report number), `all:`
- Boolean operators: `AND`, `OR`, `ANDNOT`
- Grouping with parentheses; phrases in double quotes
- Date range: `submittedDate:[YYYYMMDDTTTT TO YYYYMMDDTTTT]` (GMT, 24h)

Examples:

```
au:del_maestro AND ti:checkerboard
cat:cs.LG AND abs:"language model"
cat:cs.AI AND submittedDate:[202301010000 TO 202302010000]
```

See [`ARXIV_API.md`](ARXIV_API.md) for the full API reference.

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
```

## Running

The server speaks MCP over stdio:

```bash
python server.py
```

### Use with Claude Code

```bash
claude mcp add arxiv -- /absolute/path/to/.venv/bin/python /absolute/path/to/server.py
```

Or use a project-scoped `.mcp.json` at the repo root — Claude Code loads it automatically for anyone working in this directory. Copy the template and fill in your absolute paths:

```bash
cp .mcp.json.example .mcp.json
```

`.mcp.json` is **gitignored** (it may hold API keys for other servers); the checked-in [`.mcp.json.example`](.mcp.json.example) is the shareable template. Claude Code expands `${ENV_VAR}` references in `.mcp.json` — keep secrets in environment variables rather than hardcoding them:

```json
{
  "mcpServers": {
    "arxiv": {
      "command": "/absolute/path/to/.venv/bin/python",
      "args": ["/absolute/path/to/server.py"]
    },
    "example-with-api-key": {
      "command": "npx",
      "args": ["-y", "some-mcp-server"],
      "env": { "API_KEY": "${SOME_API_KEY}" }
    }
  }
}
```

Note: Claude Code expands `${ENV_VAR}` references, but not editor tokens like `${workspaceFolder}` — use absolute paths.

Or add to an MCP client config (e.g. Claude Desktop `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "arxiv": {
      "command": "/absolute/path/to/.venv/bin/python",
      "args": ["/absolute/path/to/server.py"]
    }
  }
}
```

## Notes & courtesy

- Please review the [arXiv API Terms of Use](https://info.arxiv.org/help/api/tou.html).
- arXiv asks callers to be polite: this server enforces a ~3 second minimum interval between outgoing requests automatically.
- Search results only change once per day — cache where practical.
- A single call returns at most 2000 results; page through larger sets with `start`.
