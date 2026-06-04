/**
 * Tools for searching the collection and inspecting individual objects.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../constants.js";
import { hamRequest, handleApiError } from "../services/client.js";
import {
  ResponseFormat,
  bullet,
  fitToLimit,
  pageMeta,
  stripHtml,
  toolText,
  truncateText,
} from "../services/format.js";
import type { HamListResponse, ObjectPerson, ObjectRecord } from "../types.js";

/** Concise field set returned by default from object searches. */
const SEARCH_FIELDS =
  "objectid,objectnumber,title,dated,datebegin,dateend,century,culture," +
  "classification,medium,technique,people,primaryimageurl,imagecount,url";

/** Recognized hue names for the `hue` filter (mapped to the colors.hue field). */
const HUES = [
  "Red",
  "Orange",
  "Yellow",
  "Green",
  "Blue",
  "Violet",
  "Brown",
  "Grey",
  "Black",
  "White",
] as const;

const SEARCH_SECTIONS = [
  "colors",
  "exhibitions",
  "images",
  "people",
  "publications",
  "videos",
] as const;

const SearchObjectsSchema = z.object({
  keyword: z
    .string()
    .min(1)
    .max(200)
    .optional()
    .describe(
      "Free-text search across titles, artists, descriptions, classification, " +
        "culture, worktype, medium terms, provenance, and credit line. Best starting point.",
    ),
  title: z.string().min(1).max(200).optional().describe("Words that must appear in the title."),
  q: z
    .string()
    .min(1)
    .max(500)
    .optional()
    .describe(
      "Raw Elasticsearch query-string filter in FIELD:VALUE form, e.g. " +
        "'totalpageviews:0' or 'datebegin:[1900 TO 1950]'. For advanced use.",
    ),
  classification: z
    .string()
    .max(200)
    .optional()
    .describe(
      "Classification name or id (e.g. 'Prints' or '23'). Pipe-separate multiple, " +
        "or 'any'. Use ham_list_terms(type='classification') to discover values.",
    ),
  worktype: z
    .string()
    .max(200)
    .optional()
    .describe("Worktype name or id (e.g. 'vessel'). Pipe-separate multiple, or 'any'."),
  medium: z
    .string()
    .max(200)
    .optional()
    .describe("Medium name or id (e.g. 'Engraving'). Pipe-separate multiple, or 'any'."),
  technique: z
    .string()
    .max(200)
    .optional()
    .describe("Technique name or id. Pipe-separate multiple, or 'any'."),
  culture: z
    .string()
    .max(200)
    .optional()
    .describe("Culture name or id (e.g. 'Greek'). Pipe-separate multiple, or 'any'."),
  century: z
    .string()
    .max(200)
    .optional()
    .describe("Century name or id (e.g. '5th century BCE'). Pipe-separate multiple, or 'any'."),
  person: z
    .string()
    .max(200)
    .optional()
    .describe("Person name or id (e.g. 'Rubens' or '28402'). Pipe-separate multiple."),
  color: z
    .string()
    .regex(/^#?[0-9a-fA-F]{6}$/, "Color must be a 6-digit hex value, e.g. '#d2691e'.")
    .optional()
    .describe(
      "Hex color present in the object's primary image, e.g. '#d2691e'. Use " +
        "ham_list_colors to find valid palette colors.",
    ),
  hue: z
    .enum(HUES)
    .optional()
    .describe("Broad hue present in the primary image (added to the Elasticsearch query)."),
  yearmade: z
    .string()
    .regex(/^\d{1,4}(-\d{1,4})?$/, "Use a 4-digit year or a 'begin-end' range, e.g. '1900-1950'.")
    .optional()
    .describe("Year or dash-separated year range the object was made, e.g. '1900-1950'."),
  gallery: z
    .string()
    .max(50)
    .optional()
    .describe("Gallery number the object is currently displayed in, or 'any'/'none'."),
  exhibition: z
    .string()
    .max(200)
    .optional()
    .describe("Exhibition id or title the object appeared in, or 'any'/'none'."),
  hasimage: z
    .boolean()
    .optional()
    .describe("If true, only return objects that have at least one image."),
  sort: z
    .string()
    .max(50)
    .optional()
    .describe(
      "Field to sort by (e.g. 'rank', 'totalpageviews', 'datebegin'), or 'random', " +
        "or 'random:SEED' for a stable shuffle.",
    ),
  sortorder: z.enum(["asc", "desc"]).optional().describe("Sort direction (default: asc)."),
  fields: z
    .string()
    .max(500)
    .optional()
    .describe(`Comma-separated fields to return. Defaults to a concise set: ${SEARCH_FIELDS}`),
  size: z
    .number()
    .int()
    .min(1)
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE)
    .describe(`Records per page, 1-${MAX_PAGE_SIZE} (default ${DEFAULT_PAGE_SIZE}).`),
  page: z.number().int().min(1).default(1).describe("1-based page number (default 1)."),
  response_format: z
    .nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("'markdown' (human-readable, default) or 'json' (full structured records)."),
});

type SearchObjectsInput = z.infer<typeof SearchObjectsSchema>;

const GetObjectSchema = z.object({
  object_id: z
    .number()
    .int()
    .positive()
    .describe("The numeric object id (the 'objectid' field), e.g. 304069."),
  section: z
    .enum(SEARCH_SECTIONS)
    .optional()
    .describe(
      "Optionally fetch only one subsection of the object instead of the full record: " +
        "colors, exhibitions, images, people, publications, or videos.",
    ),
  fields: z
    .string()
    .max(500)
    .optional()
    .describe("Comma-separated fields to return (full-record requests only)."),
  response_format: z
    .nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("'markdown' (human-readable, default) or 'json' (full raw record)."),
});

type GetObjectInput = z.infer<typeof GetObjectSchema>;

/** Join the display names of an object's people for compact display. */
function makers(people: ObjectPerson[] | null | undefined): string | null {
  if (!people?.length) return null;
  const names = people
    .map((p) => p.displayname ?? p.name)
    .filter((n): n is string => Boolean(n));
  return names.length ? names.join("; ") : null;
}

/** Render one object as a compact markdown block for search results. */
function renderObjectSummary(record: ObjectRecord): string {
  const id = record.objectid ?? record.id;
  const lines: string[] = [`### ${record.title ?? "Untitled"} (objectid: ${id})`];
  const made = makers(record.people);
  const facts = [
    bullet("Maker(s)", made),
    bullet("Date", record.dated),
    bullet("Classification", record.classification),
    bullet("Culture", record.culture),
    bullet("Medium", record.medium),
    bullet("Technique", record.technique),
    bullet("Object number", record.objectnumber),
    bullet("Images", record.imagecount ? `${record.imagecount}` : null),
    bullet("Primary image", record.primaryimageurl),
    bullet("Web page", record.url),
  ].filter((l): l is string => l !== null);
  return [...lines, ...facts].join("\n");
}

/** Build the Elasticsearch `q` value, merging any user query with a hue filter. */
function buildQuery(params: SearchObjectsInput): string | undefined {
  const clauses: string[] = [];
  if (params.q) clauses.push(`(${params.q})`);
  if (params.hue) clauses.push(`colors.hue:${params.hue}`);
  return clauses.length ? clauses.join(" AND ") : undefined;
}

function registerSearchObjects(server: McpServer): void {
  server.registerTool(
    "ham_search_objects",
    {
      title: "Search Harvard Art Museums objects",
      description: `Search and filter the Harvard Art Museums collection (260,000+ objects).

Combine any of the filters below; they are ANDed together. Start with 'keyword' for
broad searches, then narrow with structured filters. Filter values accept names or
numeric ids and may be pipe-separated for OR matching (e.g. classification='Prints|Drawings').

Args:
  - keyword (string): broad free-text search across many fields
  - title (string): words in the title
  - q (string): raw Elasticsearch query string, FIELD:VALUE
  - classification, worktype, medium, technique, culture, century, person (string): name or id
  - color (string): 6-digit hex present in the primary image (e.g. '#d2691e')
  - hue ('Red'|'Orange'|'Yellow'|'Green'|'Blue'|'Violet'|'Brown'|'Grey'|'Black'|'White')
  - yearmade (string): '1900' or range '1900-1950'
  - gallery, exhibition (string)
  - hasimage (boolean): only objects with images
  - sort (string), sortorder ('asc'|'desc')
  - fields (string): override returned fields
  - size (number 1-${MAX_PAGE_SIZE}, default ${DEFAULT_PAGE_SIZE}), page (number, default 1)
  - response_format ('markdown'|'json', default 'markdown')

Returns:
  JSON format: { total, count, page, pages, has_more, next_page, records: [...] }
  where each record has objectid, title, dated, classification, culture, medium,
  technique, people, primaryimageurl, imagecount, url (or your custom 'fields').

Examples:
  - "Greek vessels with images" -> classification='Vessels', culture='Greek', hasimage=true
  - "prints viewed exactly once" -> classification='Prints', q='totalpageviews:1'
  - "most-viewed paintings" -> classification='Paintings', sort='totalpageviews', sortorder='desc'
  - "objects made 2020-2026" -> yearmade='2020-2026'
  - Don't use to fetch one object's full detail -> use ham_get_object instead.

Errors:
  - "No objects found matching your filters." when the search is empty (broaden filters).
  - 400 errors usually mean a malformed 'q' query string.`,
      inputSchema: SearchObjectsSchema.shape,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: SearchObjectsInput) => {
      try {
        const data = await hamRequest<HamListResponse<ObjectRecord>>("object", {
          keyword: params.keyword,
          title: params.title,
          q: buildQuery(params),
          classification: params.classification,
          worktype: params.worktype,
          medium: params.medium,
          technique: params.technique,
          culture: params.culture,
          century: params.century,
          person: params.person,
          color: params.color ? (params.color.startsWith("#") ? params.color : `#${params.color}`) : undefined,
          yearmade: params.yearmade,
          gallery: params.gallery,
          exhibition: params.exhibition,
          hasimage: params.hasimage === undefined ? undefined : params.hasimage ? 1 : 0,
          sort: params.sort,
          sortorder: params.sortorder,
          fields: params.fields ?? SEARCH_FIELDS,
          size: params.size,
          page: params.page,
        });

        const records = data.records ?? [];
        const meta = pageMeta(data.info, params.page, records.length);

        if (!records.length) {
          return toolText("No objects found matching your filters. Try broadening or removing filters.");
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
                  ? {
                      truncated: true,
                      truncation_message: `Showing ${items.length} of ${records.length} fetched records due to size; request fewer 'fields' or a smaller 'size'.`,
                    }
                  : {}),
                records: items,
              },
              null,
              2,
            ),
          );
          return toolText(result);
        }

        const result = fitToLimit(records, (items, truncated) => {
          const header = [
            `# Object search — ${meta.total.toLocaleString()} total match(es)`,
            `Showing page ${meta.page} of ${meta.pages} (${items.length} record(s) on this page).`,
            meta.has_more ? `More available — request page ${meta.next_page}.` : "",
            truncated
              ? `_Note: trimmed to ${items.length} records to fit the response limit._`
              : "",
            "",
          ]
            .filter(Boolean)
            .join("\n");
          return [header, ...items.map(renderObjectSummary)].join("\n\n");
        });
        return toolText(result);
      } catch (error) {
        return toolText(handleApiError(error), true);
      }
    },
  );
}

/** Render a full object record as readable markdown, trimming verbose fields. */
function renderObjectFull(record: ObjectRecord): string {
  const id = record.objectid ?? record.id;
  const lines: string[] = [`# ${record.title ?? "Untitled"} (objectid: ${id})`, ""];

  const facts = [
    bullet("Object number", record.objectnumber),
    bullet("Maker(s)", makers(record.people)),
    bullet("Date", record.dated),
    bullet("Period/Century", record.century),
    bullet("Culture", record.culture),
    bullet("Classification", record.classification),
    bullet(
      "Worktype(s)",
      record.worktypes?.map((w) => w.worktype).filter(Boolean).join(", ") || null,
    ),
    bullet("Medium", record.medium),
    bullet("Technique", record.technique),
    bullet("Dimensions", record.dimensions),
    bullet("Department", record.department),
    bullet("Credit line", record.creditline),
    bullet("Web page", record.url),
    bullet("Primary image", record.primaryimageurl),
    bullet("Image count", record.imagecount),
  ].filter((l): l is string => l !== null);
  lines.push(...facts);

  const description = truncateText(stripHtml(record.description), 1000);
  if (description) lines.push("", "## Description", description);

  const provenance = truncateText(record.provenance, 800);
  if (provenance) lines.push("", "## Provenance", provenance);

  if (record.colors?.length) {
    lines.push("", "## Colors (extracted from primary image)");
    for (const c of record.colors.slice(0, 12)) {
      const pct = typeof c.percent === "number" ? `${(c.percent * 100).toFixed(1)}%` : "?";
      lines.push(`- ${c.hue ?? "?"} ${c.color ?? ""} (${pct})`);
    }
  }

  if (record.images?.length) {
    lines.push("", `## Images (${record.images.length})`);
    for (const img of record.images.slice(0, 10)) {
      const dims = img.width && img.height ? ` ${img.width}×${img.height}` : "";
      lines.push(`- imageid ${img.imageid}:${dims} ${img.baseimageurl ?? ""}`.trimEnd());
    }
  }

  return lines.join("\n");
}

function registerGetObject(server: McpServer): void {
  server.registerTool(
    "ham_get_object",
    {
      title: "Get a Harvard Art Museums object",
      description: `Fetch the full catalogue record for a single object by its numeric objectid,
or just one subsection of it.

Use this after ham_search_objects to get complete detail (description, provenance,
dimensions, full color list, all images, etc.). To retrieve only part of the record,
pass 'section'.

Args:
  - object_id (number, required): the numeric 'objectid', e.g. 304069
  - section ('colors'|'exhibitions'|'images'|'people'|'publications'|'videos', optional):
    return only this subsection (an array) instead of the full record
  - fields (string, optional): comma-separated fields to include (full-record requests only)
  - response_format ('markdown'|'json', default 'markdown')

Returns:
  Full record (markdown): title, maker(s), date, culture, classification, medium,
  technique, dimensions, credit line, description, provenance, extracted colors, images.
  JSON: the complete raw record (or the raw subsection array when 'section' is set).

Examples:
  - "Tell me about object 304069" -> object_id=304069
  - "What images does object 6772 have?" -> object_id=6772, section='images'
  - Don't use to search by keyword/filter -> use ham_search_objects.

Errors:
  - 404 means the object_id does not exist; find a valid id with ham_search_objects.`,
      inputSchema: GetObjectSchema.shape,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: GetObjectInput) => {
      try {
        if (params.section) {
          const endpoint = `object/${params.object_id}/${params.section}`;
          const section = await hamRequest<unknown[]>(endpoint, {});
          const items = Array.isArray(section) ? section : [];
          if (!items.length) {
            return toolText(`Object ${params.object_id} has no '${params.section}' entries.`);
          }
          const result = fitToLimit(items, (slice, truncated) =>
            JSON.stringify(
              {
                object_id: params.object_id,
                section: params.section,
                count: slice.length,
                ...(truncated
                  ? {
                      truncated: true,
                      truncation_message: `Showing ${slice.length} of ${items.length} entries due to size.`,
                    }
                  : {}),
                items: slice,
              },
              null,
              2,
            ),
          );
          return toolText(result);
        }

        const record = await hamRequest<ObjectRecord>(`object/${params.object_id}`, {
          fields: params.fields,
        });

        if (params.response_format === ResponseFormat.JSON) {
          let result = JSON.stringify(record, null, 2);
          if (result.length > 25_000) {
            result =
              JSON.stringify(
                {
                  note:
                    "Full record exceeds the response limit. Re-request with 'fields' to select " +
                    "specific fields, or use 'section' to fetch one part, or response_format='markdown'.",
                  objectid: record.objectid ?? record.id,
                  title: record.title,
                },
                null,
                2,
              );
          }
          return toolText(result);
        }

        return toolText(renderObjectFull(record));
      } catch (error) {
        return toolText(handleApiError(error), true);
      }
    },
  );
}

/** Register both object tools on the server. */
export function registerObjectTools(server: McpServer): void {
  registerSearchObjects(server);
  registerGetObject(server);
}
