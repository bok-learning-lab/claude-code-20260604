# Zotero MCP Server

An [MCP](https://modelcontextprotocol.io) server that connects Claude to your
[Zotero](https://www.zotero.org) library through the
[Zotero Web API v3](https://www.zotero.org/support/dev/web_api/v3/start):
search, read, add, edit, and organize items, collections, notes, and tags —
all from inside Claude.

## Tools

| Tool | What it does |
| --- | --- |
| `zotero_list_items` | Search and list library items with filters, sorting, and pagination |
| `zotero_get_item` | Fetch a single item by key |
| `zotero_get_item_children` | Get notes and attachments for an item |
| `zotero_get_citation` | Format a citation (APA, MLA, Chicago, etc.) |
| `zotero_export_items` | Export items as BibTeX, RIS, CSL JSON, CSV, etc. |
| `zotero_create_item` | Add a new item (article, book, webpage, etc.) |
| `zotero_update_item` | Edit item fields |
| `zotero_delete_item` | Delete an item |
| `zotero_create_note` | Create a note, optionally attached to an item |
| `zotero_list_collections` | List collections/folders |
| `zotero_get_collection` | Get a collection by key |
| `zotero_create_collection` | Create a new collection |
| `zotero_update_collection` | Rename or reparent a collection |
| `zotero_delete_collection` | Delete a collection (items are kept) |
| `zotero_list_tags` | List tags in the library |

## Setup

Unlike the other servers in this repo, Zotero connects to **your personal
library** — there is no shared workshop key. Each person needs to get their
own credentials before the server can start.

### Step 1: Get your Zotero credentials

You need two values from your Zotero account:

1. Sign in at <https://www.zotero.org> and go to
   **Settings > Security > API Keys > Create new private key**.
   Grant "Read/Write" access to your personal library and save the key.

2. On the same page (<https://www.zotero.org/settings/keys>), look for the
   line that reads "Your userID for use in API calls is XXXXXXX" — that
   number is your user ID.

### Step 2: Add your credentials to .mcp.json

Open `.mcp.json` at the repo root and fill in the `zotero` entry:

```json
"zotero": {
  "type": "stdio",
  "command": "node",
  "args": ["_mcps/zotero-mcp/dist/index.js"],
  "env": {
    "ZOTERO_API_KEY": "paste-your-key-here",
    "ZOTERO_USER_ID": "paste-your-user-id-here"
  }
}
```

### Step 3: Build and connect

Run the shared setup script from the repo root (builds all servers):

```bash
bash _mcps/setup.sh
```

Or build this server alone:

```bash
cd _mcps/zotero-mcp
npm install
npm run build
```

Then restart Claude Code (or run `/mcp reconnect`).

## What you can ask Claude

- "Search my Zotero library for papers about machine learning"
- "Show me everything in my 'Thesis Chapter 2' collection"
- "Export the items tagged 'to-read' as BibTeX"
- "Add a new journal article by Smith et al. 2024 about transformer models"
- "Get the APA citation for item ABCD1234"
- "Create a collection called 'Week 3 readings'"
- "What notes are attached to this item?"

## Project layout

```
src/
  index.ts             # entry point: validates env, registers tools, stdio transport
  constants.ts         # API base URL and shared config
  services/
    zoteroClient.ts    # HTTP client wrapping the Zotero Web API v3
  tools/
    items.ts           # item CRUD, citation, export
    collections.ts     # collection CRUD
    tags.ts            # tag listing
```

## Running directly

```bash
npm start    # node dist/index.js (needs a prior npm run build)
npm run dev  # tsx watch src/index.ts (auto-reload, no build needed)
```

The server speaks MCP over stdio and is meant to be launched by Claude Code
via `.mcp.json`, not run interactively.
