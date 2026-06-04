#!/usr/bin/env node
/**
 * MCP server for the Harvard Art Museums API.
 *
 * Provides tools to search the collection, inspect individual objects, browse
 * the controlled vocabularies (classification/worktype/medium/technique) and
 * the named color list, and build IIIF image/manifest URLs.
 *
 * Transport: stdio. Auth: HAM_API_KEY (read from a .env file in the project root).
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerObjectTools } from "./tools/objects.js";
import { registerTermTools } from "./tools/terms.js";
import { registerColorTools } from "./tools/colors.js";
import { registerImageTools } from "./tools/images.js";

// Load .env from the project root (one level above the compiled dist/ dir),
// regardless of the current working directory the server is launched from.
const moduleDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(moduleDir, "..", ".env") });

const server = new McpServer({
  name: "harvard-art-museums-mcp-server",
  version: "1.0.0",
});

registerObjectTools(server);
registerTermTools(server);
registerColorTools(server);
registerImageTools(server);

async function main(): Promise<void> {
  if (!process.env.HAM_API_KEY?.trim()) {
    // Logged to stderr so it does not corrupt the stdio JSON-RPC stream.
    console.error(
      "WARNING: HAM_API_KEY is not set. Add it to the .env file in the project root " +
        "(copy .env.example). API-backed tools will return an authentication error until it is set.",
    );
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("harvard-art-museums-mcp-server running on stdio");
}

main().catch((error) => {
  console.error("Fatal server error:", error);
  process.exit(1);
});
