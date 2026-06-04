# Academic Search MCP

An MCP server that connects Claude to the [Semantic Scholar](https://www.semanticscholar.org/) academic paper database. Search for papers, look up details by DOI, and discover related work -- all from inside Claude.

## Two ways to engage with this

This workshop is about understanding what MCPs are and why they matter. You can engage with this example at whatever level feels right:

**Mostly code-free.** You never have to open `server.py`. Once setup is done (below), you just talk to Claude in plain English -- "find papers about X" -- and the MCP handles the rest. This is the user's experience of an MCP: you gain new capabilities without learning new syntax. If this is your level, skip straight to [What you can ask Claude](#what-you-can-ask-claude) after setup.

**Looking under the hood.** If you want to understand how this works, the MCP server is a single Python file (`server.py`, about 400 lines). The companion walkthrough [`how-to-build-an-mcp.md`](how-to-build-an-mcp.md) explains every design decision. The key insight: an MCP is just a program that (1) receives structured requests from Claude, (2) calls an external API, and (3) returns formatted results. No magic.

**Going deeper: the Semantic Scholar API.** This MCP wraps the [Semantic Scholar Academic Graph API](https://api.semanticscholar.org/api-docs/). Their documentation is a good introduction to how APIs and API keys work in general:

- [API overview and documentation](https://api.semanticscholar.org/api-docs/) -- describes every endpoint, with interactive examples you can run in the browser.
- [Getting an API key](https://www.semanticscholar.org/product/api#api-key-form) -- free, no credit card required. An API key is like a library card: it identifies you to the service so it can give you higher rate limits. Without one, you're limited to about 1 request every 5 seconds; with one, roughly 10 per second.
- [API tutorials and guides](https://api.semanticscholar.org/api-docs/graph#tag/Paper-Data) -- if you want to call the API directly (outside of Claude), these show you how.

The point of this example isn't just "Claude can search papers now." It's that **anyone can connect Claude to any web service that has an API** -- your library catalog, your LMS, a government data portal -- using this same pattern.

## Setup

1. **Add to your `.mcp.json`** at the repo root (create the file if it doesn't exist). Add this inside the `"mcpServers"` object:

   ```json
   "academic_search": {
     "command": "_mcps/academic_search/.venv/bin/python",
     "args": ["_mcps/academic_search/server.py"],
     "env": {
       "SEMANTIC_SCHOLAR_API_KEY": "PASTE_YOUR_KEY_HERE"
     }
   }
   ```

   If you're starting a fresh `.mcp.json`, wrap it in `{ "mcpServers": { ... } }`.

2. **Get a free API key** at https://www.semanticscholar.org/product/api#api-key-form

3. **Paste your key** into `.mcp.json`, replacing `PASTE_YOUR_KEY_HERE`.

4. **Run setup** (creates the Python environment and installs dependencies):
   ```
   bash _mcp/academic_search/setup.sh
   ```

5. **Restart Claude Code** (or type `/mcp reconnect`).

That's it. Claude now has three new tools: `academic_search`, `academic_get_paper`, and `academic_recommend`.

## What you can ask Claude

You don't need to know the tool names. Just ask naturally:

- "Find recent papers about active learning in STEM education"
- "Look up this paper: DOI:10.1234/example"
- "What papers are related to this one?"
- "Search for open-access papers on sleep and memory from 2020 onward"
- "Save these search results to a file"

## The three tools

| Tool | What it does |
|---|---|
| `academic_search` | Search by keywords, filter by year/field/open-access |
| `academic_get_paper` | Full details for one paper (by DOI, arXiv ID, etc.) |
| `academic_recommend` | Find related papers based on citation patterns |

## Files

- `server.py` -- the MCP server (Python/FastMCP)
- `requirements.txt` -- dependencies: mcp, httpx, pydantic
- `setup.sh` -- creates the virtual environment and installs dependencies
- `.env.example` -- documents the API key environment variable
- `how-to-build-an-mcp.md` -- walkthrough of how this was built (for the workshop)

## Troubleshooting

- **"Rate limited"**: the API key wasn't loaded. Check `.mcp.json` and run `/mcp reconnect`.
- **"Paper not found"**: DOIs need the `DOI:` prefix (e.g., `DOI:10.1038/s41586-024-07487-w`). arXiv IDs need `ARXIV:`.
- **Tools not appearing**: run `bash _mcp/academic_search/setup.sh` and restart Claude Code.
