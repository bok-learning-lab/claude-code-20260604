/**
 * Tool for browsing the museums' named color list. These named colors and their
 * hex values feed the `color` filter of ham_search_objects.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { MAX_PAGE_SIZE } from "../constants.js";
import { hamRequest, handleApiError } from "../services/client.js";
import { ResponseFormat, fitToLimit, pageMeta, toolText } from "../services/format.js";
import type { ColorRecord, HamListResponse } from "../types.js";

const ListColorsSchema = z.object({
  query: z
    .string()
    .min(1)
    .max(100)
    .optional()
    .describe("Case-insensitive substring to match within color names (e.g. 'blue')."),
  size: z
    .number()
    .int()
    .min(1)
    .max(MAX_PAGE_SIZE)
    .default(MAX_PAGE_SIZE)
    .describe(`Records per page, 1-${MAX_PAGE_SIZE} (default ${MAX_PAGE_SIZE}). ~147 colors exist.`),
  page: z.number().int().min(1).default(1).describe("1-based page number (default 1)."),
  response_format: z
    .nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("'markdown' (human-readable, default) or 'json' (structured records)."),
});

type ListColorsInput = z.infer<typeof ListColorsSchema>;

export function registerColorTools(server: McpServer): void {
  server.registerTool(
    "ham_list_colors",
    {
      title: "List Harvard Art Museums colors",
      description: `List the ~147 named colors (with hex values) that the museums use to describe
images. Use this to find a hex value to pass to ham_search_objects' 'color' filter, or
to look up the name of a color.

Args:
  - query (string, optional): case-insensitive substring match within color names
  - size (number 1-${MAX_PAGE_SIZE}, default ${MAX_PAGE_SIZE}), page (number, default 1)
  - response_format ('markdown'|'json', default 'markdown')

Returns:
  JSON format: { total, count, page, pages, has_more, next_page,
                 records: [{ id, name, hex }] }

Examples:
  - "List all colors" -> (no args)
  - "Find blue-ish colors" -> query='blue'
  - Then search objects by that hex -> ham_search_objects(color='#d2691e').

Errors:
  - "No matching colors found." when a 'query' matches nothing.`,
      inputSchema: ListColorsSchema.shape,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: ListColorsInput) => {
      try {
        const q = params.query ? `name:*${params.query.toLowerCase()}*` : undefined;

        const data = await hamRequest<HamListResponse<ColorRecord>>("color", {
          q,
          size: params.size,
          page: params.page,
        });

        const records = data.records ?? [];
        const meta = pageMeta(data.info, params.page, records.length);

        if (!records.length) {
          return toolText("No matching colors found. Try a shorter 'query' substring or drop it.");
        }

        if (params.response_format === ResponseFormat.JSON) {
          const result = fitToLimit(records, (items, truncated) =>
            JSON.stringify(
              {
                total: meta.total,
                count: items.length,
                page: meta.page,
                pages: meta.pages,
                has_more: meta.has_more,
                next_page: meta.next_page,
                ...(truncated
                  ? { truncated: true, truncation_message: `Showing ${items.length} of ${records.length}.` }
                  : {}),
                records: items.map((r) => ({ id: r.id ?? r.colorid, name: r.name, hex: r.hex })),
              },
              null,
              2,
            ),
          );
          return toolText(result);
        }

        const result = fitToLimit(records, (items, truncated) => {
          const header = [
            `# Colors — ${meta.total.toLocaleString()} total`,
            `Page ${meta.page} of ${meta.pages} (${items.length} shown).`,
            meta.has_more ? `Request page ${meta.next_page} for more.` : "",
            truncated ? `_Trimmed to ${items.length} to fit the response limit._` : "",
            "",
          ]
            .filter(Boolean)
            .join("\n");
          const rows = items.map((r) => `- **${r.name ?? "(unnamed)"}**: ${r.hex ?? "?"} (id: ${r.id ?? r.colorid})`);
          return [header, ...rows].join("\n");
        });
        return toolText(result);
      } catch (error) {
        return toolText(handleApiError(error), true);
      }
    },
  );
}
