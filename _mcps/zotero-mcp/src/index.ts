#!/usr/bin/env node
/**
 * Zotero MCP Server
 *
 * Provides tools to interact with the Zotero Web API v3:
 * items (list, get, create, update, delete, export, cite),
 * collections (list, get, create, update, delete),
 * tags (list), and notes (create).
 *
 * Required environment variables:
 *   ZOTERO_API_KEY  - Your Zotero API key
 *   ZOTERO_USER_ID  - Your Zotero user ID
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ZoteroClient } from "./services/zoteroClient.js";
import { registerItemTools } from "./tools/items.js";
import { registerCollectionTools } from "./tools/collections.js";
import { registerTagTools } from "./tools/tags.js";

// ─── Validate environment ──────────────────────────────────────────────────────

const apiKey = process.env.ZOTERO_API_KEY;
const userId = process.env.ZOTERO_USER_ID;

if (!apiKey || !userId) {
  console.error(
    "ERROR: ZOTERO_API_KEY and ZOTERO_USER_ID environment variables are required.\n" +
    "Get your API key at: https://www.zotero.org/settings/keys/new\n" +
    "Find your user ID at: https://www.zotero.org/settings/keys"
  );
  process.exit(1);
}

// ─── Initialize server and client ─────────────────────────────────────────────

const server = new McpServer({
  name: "zotero-mcp-server",
  version: "1.0.0",
});

const client = new ZoteroClient({ apiKey, userId });

// ─── Register all tools ────────────────────────────────────────────────────────

registerItemTools(server, client);
registerCollectionTools(server, client);
registerTagTools(server, client);

// ─── Start server ──────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Zotero MCP server running via stdio");
}

main().catch((error: unknown) => {
  console.error("Server error:", error);
  process.exit(1);
});
