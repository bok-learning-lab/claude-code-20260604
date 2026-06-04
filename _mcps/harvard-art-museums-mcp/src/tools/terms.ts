/**
 * Tool for browsing the controlled vocabularies (classification, worktype,
 * medium, technique) that power the object-search filters. Each shares the same
 * { id, name, objectcount } shape, so a single tool serves all four.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { MAX_PAGE_SIZE } from "../constants.js";
import { hamRequest, handleApiError } from "../services/client.js";
import { ResponseFormat, fitToLimit, pageMeta, toolText } from "../services/format.js";
import type { HamListResponse, TermRecord } from "../types.js";

const TERM_TYPES = ["classification", "worktype", "medium", "technique"] as const;

const ListTermsSchema = z.object({
  type: z
    .enum(TERM_TYPES)
    .describe(
      "Which vocabulary to list: 'classification' (broad categories like Prints, " +
        "Sculpture), 'worktype' (specific forms like vessel, astrolabe), 'medium' " +
        "(materials), or 'technique' (methods).",
    ),
  query: z
    .string()
    .min(1)
    .max(100)
    .optional()
    .describe("Case-insensitive substring to match within term names (e.g. 'print')."),
  size: z
    .number()
    .int()
    .min(1)
    .max(MAX_PAGE_SIZE)
    .default(50)
    .describe(`Records per page, 1-${MAX_PAGE_SIZE} (default 50).`),
  page: z.number().int().min(1).default(1).describe("1-based page number (default 1)."),
  sort: z
    .string()
    .max(50)
    .default("objectcount")
    .describe("Field to sort by (default 'objectcount' so the most-used terms appear first)."),
  sortorder: z
    .enum(["asc", "desc"])
    .default("desc")
    .describe("Sort direction (default 'desc')."),
  response_format: z
    .nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("'markdown' (human-readable, default) or 'json' (structured records)."),
});

type ListTermsInput = z.infer<typeof ListTermsSchema>;

function renderTerm(record: TermRecord): string {
  const count =
    typeof record.objectcount === "number" ? ` — ${record.objectcount.toLocaleString()} objects` : "";
  return `- **${record.name ?? "(unnamed)"}** (id: ${record.id})${count}`;
}

export function registerTermTools(server: McpServer): void {
  server.registerTool(
    "ham_list_terms",
    {
      title: "List Harvard Art Museums vocabularies",
      description: `Browse the controlled vocabularies used to categorize objects: classifications,
worktypes, mediums, and techniques. Use this to discover valid filter values (and how
many objects use each) before calling ham_search_objects.

Args:
  - type ('classification'|'worktype'|'medium'|'technique', required): which vocabulary
  - query (string, optional): case-insensitive substring match within term names
  - size (number 1-${MAX_PAGE_SIZE}, default 50), page (number, default 1)
  - sort (string, default 'objectcount'), sortorder ('asc'|'desc', default 'desc')
  - response_format ('markdown'|'json', default 'markdown')

Returns:
  JSON format: { type, total, count, page, pages, has_more, next_page,
                 records: [{ id, name, objectcount }] }

Examples:
  - "What classifications exist?" -> type='classification'
  - "Find mediums containing 'engrav'" -> type='medium', query='engrav'
  - "Most common worktypes" -> type='worktype', sort='objectcount', sortorder='desc'
  - Then feed a name/id into ham_search_objects (e.g. classification='Prints').

Errors:
  - "No matching terms found." when a 'query' matches nothing (try a shorter substring).`,
      inputSchema: ListTermsSchema.shape,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: ListTermsInput) => {
      try {
        // Wildcard, lowercased substring match. Wildcard terms are not analyzed,
        // so lowercasing aligns with the analyzed (lowercased) name tokens.
        const q = params.query ? `name:*${params.query.toLowerCase()}*` : undefined;

        const data = await hamRequest<HamListResponse<TermRecord>>(params.type, {
          q,
          size: params.size,
          page: params.page,
          sort: params.sort,
          sortorder: params.sortorder,
        });

        const records = data.records ?? [];
        const meta = pageMeta(data.info, params.page, records.length);

        if (!records.length) {
          return toolText("No matching terms found. Try a shorter 'query' substring or drop it.");
        }

        if (params.response_format === ResponseFormat.JSON) {
          const result = fitToLimit(records, (items, truncated) =>
            JSON.stringify(
              {
                type: params.type,
                total: meta.total,
                count: items.length,
                page: meta.page,
                pages: meta.pages,
                has_more: meta.has_more,
                next_page: meta.next_page,
                ...(truncated
                  ? { truncated: true, truncation_message: `Showing ${items.length} of ${records.length}.` }
                  : {}),
                records: items.map((r) => ({ id: r.id, name: r.name, objectcount: r.objectcount })),
              },
              null,
              2,
            ),
          );
          return toolText(result);
        }

        const result = fitToLimit(records, (items, truncated) => {
          const header = [
            `# ${params.type} — ${meta.total.toLocaleString()} total term(s)`,
            `Page ${meta.page} of ${meta.pages} (${items.length} shown).`,
            meta.has_more ? `Request page ${meta.next_page} for more.` : "",
            truncated ? `_Trimmed to ${items.length} to fit the response limit._` : "",
            "",
          ]
            .filter(Boolean)
            .join("\n");
          return [header, ...items.map(renderTerm)].join("\n");
        });
        return toolText(result);
      } catch (error) {
        return toolText(handleApiError(error), true);
      }
    },
  );
}
