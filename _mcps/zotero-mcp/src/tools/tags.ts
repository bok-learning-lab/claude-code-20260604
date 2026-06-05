import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ResponseFormat } from "../constants.js";
import { ZoteroClient, handleApiError } from "../services/zoteroClient.js";

interface ZoteroTag {
  tag: string;
  meta?: { type?: number; numItems?: number };
}

export function registerTagTools(server: McpServer, client: ZoteroClient): void {

  // ── zotero_list_tags ───────────────────────────────────────────────────────
  server.registerTool(
    "zotero_list_tags",
    {
      title: "List Zotero Tags",
      description: `List tags in your Zotero library with optional search.

Args:
  - q (string, optional): Search tags by name
  - item_key (string, optional): List tags for a specific item
  - collection_key (string, optional): List tags within a collection
  - limit (number): Max results (default: 50, max: 100)
  - start (number): Pagination offset
  - response_format ('markdown'|'json')

Returns: List of tags with item counts.`,
      inputSchema: z.object({
        q: z.string().optional().describe("Search tags by name"),
        item_key: z.string().regex(/^[A-Z0-9]{8}$/i).optional().describe("List tags for a specific item"),
        collection_key: z.string().regex(/^[A-Z0-9]{8}$/i).optional().describe("List tags within a collection"),
        limit: z.number().int().min(1).max(100).default(50),
        start: z.number().int().min(0).default(0),
        response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params) => {
      try {
        let path: string;
        if (params.item_key) {
          path = `${client.userPrefix}/items/${params.item_key}/tags`;
        } else if (params.collection_key) {
          path = `${client.userPrefix}/collections/${params.collection_key}/tags`;
        } else {
          path = `${client.userPrefix}/tags`;
        }

        const queryParams: Record<string, unknown> = { limit: params.limit, start: params.start };
        if (params.q) queryParams["q"] = params.q;

        const result = await client.getPaginated<ZoteroTag>(path, queryParams);

        if (result.items.length === 0) {
          return { content: [{ type: "text", text: "No tags found." }] };
        }

        const output = {
          total: result.totalResults,
          count: result.items.length,
          has_more: result.hasMore,
          next_start: result.nextStart,
          tags: result.items.map((t) => ({ tag: t.tag, numItems: t.meta?.numItems })),
        };

        let text: string;
        if (params.response_format === ResponseFormat.MARKDOWN) {
          const lines = [`# Tags (${result.items.length} of ${result.totalResults})`, ""];
          for (const t of result.items) {
            const count = t.meta?.numItems !== undefined ? ` (${t.meta.numItems} items)` : "";
            lines.push(`- **${t.tag}**${count}`);
          }
          if (result.hasMore) lines.push(`\n*More tags — use start=${result.nextStart}*`);
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
}
