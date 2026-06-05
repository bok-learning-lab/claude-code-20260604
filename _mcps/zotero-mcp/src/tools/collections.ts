import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ResponseFormat } from "../constants.js";
import { ZoteroClient, handleApiError } from "../services/zoteroClient.js";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ZoteroCollectionData {
  key: string;
  version: number;
  name: string;
  parentCollection: string | false;
  relations?: Record<string, unknown>;
  [key: string]: unknown;
}

interface ZoteroCollection {
  key: string;
  version: number;
  data: ZoteroCollectionData;
  meta?: { numCollections?: number; numItems?: number };
}

// ─── Formatter ────────────────────────────────────────────────────────────────

function formatCollectionMarkdown(col: ZoteroCollection): string {
  const d = col.data;
  const meta = col.meta ?? {};
  const lines = [`## ${d.name} [${col.key}]`];
  if (d.parentCollection) lines.push(`- **Parent**: ${d.parentCollection}`);
  if (meta.numItems !== undefined) lines.push(`- **Items**: ${meta.numItems}`);
  if (meta.numCollections !== undefined) lines.push(`- **Subcollections**: ${meta.numCollections}`);
  return lines.join("\n");
}

// ─── Register tools ───────────────────────────────────────────────────────────

export function registerCollectionTools(server: McpServer, client: ZoteroClient): void {

  // ── zotero_list_collections ────────────────────────────────────────────────
  server.registerTool(
    "zotero_list_collections",
    {
      title: "List Zotero Collections",
      description: `List collections in your Zotero library.

Args:
  - parent_collection_key (string, optional): List subcollections of this collection. If omitted, lists top-level collections.
  - limit (number): Max results (default: 25, max: 100)
  - start (number): Pagination offset
  - response_format ('markdown'|'json'): Output format

Returns: List of collections with item counts.`,
      inputSchema: z.object({
        parent_collection_key: z.string().regex(/^[A-Z0-9]{8}$/i).optional().describe("List subcollections of this collection. Omit for top-level."),
        limit: z.number().int().min(1).max(100).default(25).describe("Max results"),
        start: z.number().int().min(0).default(0).describe("Pagination offset"),
        response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params) => {
      try {
        const path = params.parent_collection_key
          ? `${client.userPrefix}/collections/${params.parent_collection_key}/collections`
          : `${client.userPrefix}/collections`;

        const result = await client.getPaginated<ZoteroCollection>(path, {
          limit: params.limit,
          start: params.start,
        });

        if (result.items.length === 0) {
          return { content: [{ type: "text", text: "No collections found." }] };
        }

        const output = {
          total: result.totalResults,
          count: result.items.length,
          start: params.start,
          has_more: result.hasMore,
          next_start: result.nextStart,
          collections: result.items.map((c) => ({
            key: c.key,
            name: c.data.name,
            parentCollection: c.data.parentCollection,
            numItems: c.meta?.numItems,
            numCollections: c.meta?.numCollections,
          })),
        };

        let text: string;
        if (params.response_format === ResponseFormat.MARKDOWN) {
          const lines = [
            `# Zotero Collections (${result.items.length} of ${result.totalResults})`,
            "",
            ...result.items.map((c) => formatCollectionMarkdown(c) + "\n"),
          ];
          if (result.hasMore) lines.push(`\n*More results — use start=${result.nextStart}*`);
          text = lines.join("\n");
        } else {
          text = JSON.stringify(output, null, 2);
        }

        return { content: [{ type: "text", text }], structuredContent: output };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  // ── zotero_get_collection ──────────────────────────────────────────────────
  server.registerTool(
    "zotero_get_collection",
    {
      title: "Get Zotero Collection",
      description: `Get details of a specific Zotero collection by key.

Args:
  - collection_key (string): 8-character collection key
  - response_format ('markdown'|'json')`,
      inputSchema: z.object({
        collection_key: z.string().regex(/^[A-Z0-9]{8}$/i).describe("8-character alphanumeric collection key"),
        response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params) => {
      try {
        const { data: col } = await client.get<ZoteroCollection>(
          `${client.userPrefix}/collections/${params.collection_key}`
        );

        let text: string;
        if (params.response_format === ResponseFormat.MARKDOWN) {
          text = formatCollectionMarkdown(col);
        } else {
          text = JSON.stringify(col.data, null, 2);
        }

        return { content: [{ type: "text", text }], structuredContent: col.data };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  // ── zotero_create_collection ───────────────────────────────────────────────
  server.registerTool(
    "zotero_create_collection",
    {
      title: "Create Zotero Collection",
      description: `Create a new collection in your Zotero library.

Args:
  - name (string): Collection name
  - parent_collection_key (string, optional): Key of the parent collection. Omit to create top-level.

Returns: Created collection key.`,
      inputSchema: z.object({
        name: z.string().min(1).describe("Collection name"),
        parent_collection_key: z.string().regex(/^[A-Z0-9]{8}$/i).optional().describe("Parent collection key (omit for top-level)"),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (params) => {
      try {
        const payload: Record<string, unknown> = { name: params.name };
        if (params.parent_collection_key) payload["parentCollection"] = params.parent_collection_key;
        else payload["parentCollection"] = false;

        const result = await client.post<{
          successful: Record<string, ZoteroCollection>;
          failed: Record<string, { message: string; code: number }>;
        }>(`${client.userPrefix}/collections`, [payload]);

        const created = Object.values(result.successful);
        if (created.length > 0) {
          return { content: [{ type: "text", text: `Collection "${params.name}" created with key: ${created[0].key}` }] };
        }
        const failures = Object.values(result.failed);
        return { content: [{ type: "text", text: `Failed: ${failures[0]?.message ?? "unknown error"}` }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  // ── zotero_update_collection ───────────────────────────────────────────────
  server.registerTool(
    "zotero_update_collection",
    {
      title: "Update Zotero Collection",
      description: `Rename a collection or change its parent.

IMPORTANT: First call zotero_get_collection to get the current version.

Args:
  - collection_key (string): Collection key
  - version (number): Current version (from zotero_get_collection)
  - name (string): New name
  - parent_collection_key (string | false, optional): New parent key, or false to make top-level`,
      inputSchema: z.object({
        collection_key: z.string().describe("Collection key"),
        version: z.number().int().describe("Current version"),
        name: z.string().min(1).describe("New collection name"),
        parent_collection_key: z.union([z.string(), z.literal(false)]).optional().describe("New parent key, or false for top-level"),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (params) => {
      try {
        const payload: Record<string, unknown> = {
          key: params.collection_key,
          version: params.version,
          name: params.name,
          parentCollection: params.parent_collection_key ?? false,
        };

        await client.put(`${client.userPrefix}/collections/${params.collection_key}`, payload, params.version);
        return { content: [{ type: "text", text: `Collection ${params.collection_key} updated successfully.` }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  // ── zotero_delete_collection ───────────────────────────────────────────────
  server.registerTool(
    "zotero_delete_collection",
    {
      title: "Delete Zotero Collection",
      description: `Delete a collection from your Zotero library. Items in the collection are NOT deleted.

IMPORTANT: First call zotero_get_collection to get the current version.

Args:
  - collection_key (string): Collection key
  - version (number): Current version`,
      inputSchema: z.object({
        collection_key: z.string().describe("Collection key"),
        version: z.number().int().describe("Current version"),
      }),
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
    },
    async (params) => {
      try {
        await client.delete(`${client.userPrefix}/collections/${params.collection_key}`, params.version);
        return { content: [{ type: "text", text: `Collection ${params.collection_key} deleted. Items were not affected.` }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );
}
