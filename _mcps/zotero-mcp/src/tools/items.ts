import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  CHARACTER_LIMIT,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  ResponseFormat,
  EXPORT_FORMATS,
  SORT_FIELDS,
} from "../constants.js";
import { ZoteroClient, handleApiError } from "../services/zoteroClient.js";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ZoteroCreator {
  creatorType: string;
  firstName?: string;
  lastName?: string;
  name?: string;
}

interface ZoteroItemData {
  key: string;
  version: number;
  itemType: string;
  title?: string;
  creators?: ZoteroCreator[];
  abstractNote?: string;
  date?: string;
  url?: string;
  DOI?: string;
  ISBN?: string;
  publicationTitle?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  place?: string;
  language?: string;
  tags?: Array<{ tag: string; type?: number }>;
  collections?: string[];
  relations?: Record<string, unknown>;
  [key: string]: unknown;
}

interface ZoteroItem {
  key: string;
  version: number;
  library?: unknown;
  links?: unknown;
  meta?: unknown;
  data: ZoteroItemData;
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatCreators(creators: ZoteroCreator[]): string {
  return creators
    .map((c) => (c.name ? c.name : `${c.lastName ?? ""}, ${c.firstName ?? ""}`.trim().replace(/^,\s*/, "")))
    .join("; ");
}

function formatItemMarkdown(item: ZoteroItem): string {
  const d = item.data;
  const lines: string[] = [`## ${d.title ?? "(no title)"} [${item.key}]`];
  lines.push(`- **Type**: ${d.itemType}`);
  if (d.creators?.length) lines.push(`- **Authors**: ${formatCreators(d.creators)}`);
  if (d.date) lines.push(`- **Date**: ${d.date}`);
  if (d.publicationTitle) lines.push(`- **Publication**: ${d.publicationTitle}`);
  if (d.publisher) lines.push(`- **Publisher**: ${d.publisher}`);
  if (d.DOI) lines.push(`- **DOI**: ${d.DOI}`);
  if (d.url) lines.push(`- **URL**: ${d.url}`);
  if (d.abstractNote) lines.push(`- **Abstract**: ${d.abstractNote.slice(0, 300)}${d.abstractNote.length > 300 ? "…" : ""}`);
  if (d.tags?.length) lines.push(`- **Tags**: ${d.tags.map((t) => t.tag).join(", ")}`);
  if (d.collections?.length) lines.push(`- **Collections**: ${d.collections.join(", ")}`);
  return lines.join("\n");
}

// ─── Register tools ───────────────────────────────────────────────────────────

export function registerItemTools(server: McpServer, client: ZoteroClient): void {

  // ── zotero_list_items ──────────────────────────────────────────────────────
  server.registerTool(
    "zotero_list_items",
    {
      title: "List Zotero Items",
      description: `List items in your Zotero library with optional search, filtering, sorting, and pagination.

Args:
  - q (string, optional): Quick search query — searches titles and creator fields. Use qmode='everything' to also search full text.
  - qmode ('titleCreatorYear' | 'everything'): Search mode (default: 'titleCreatorYear')
  - item_type (string, optional): Filter by item type, e.g. 'journalArticle', 'book'. Supports OR syntax: 'book || journalArticle'. Prefix with '-' to exclude.
  - tag (string, optional): Filter by tag. Supports AND (multiple tag params), OR ('foo || bar'), NOT ('-foo').
  - collection_key (string, optional): Restrict to items in a specific collection.
  - sort ('dateAdded'|'dateModified'|'title'|'creator'|'itemType'|'date'|'publisher'|...): Sort field.
  - direction ('asc'|'desc'): Sort direction.
  - limit (number, 1-100): Max results (default: 25).
  - start (number): Pagination offset (default: 0).
  - include_trash (boolean): Include trashed items (default: false).
  - response_format ('markdown'|'json'): Output format (default: 'markdown').

Returns: Paginated list of items with total count and pagination info.

Examples:
  - List recent items: {} (no params)
  - Search for papers: {q: "machine learning", item_type: "journalArticle"}
  - Items with tag: {tag: "AI"}
  - Items in collection: {collection_key: "ABCD1234"}`,
      inputSchema: z.object({
        q: z.string().optional().describe("Quick search query (titles and creator fields by default)"),
        qmode: z.enum(["titleCreatorYear", "everything"]).optional().default("titleCreatorYear").describe("Search mode"),
        item_type: z.string().optional().describe("Item type filter, e.g. 'journalArticle', 'book || journalArticle', '-attachment'"),
        tag: z.string().optional().describe("Tag filter, e.g. 'AI', 'foo || bar', '-foo'"),
        collection_key: z.string().regex(/^[A-Z0-9]{8}$/i).optional().describe("Restrict to items in this collection key"),
        sort: z.enum(SORT_FIELDS).optional().default("dateModified").describe("Sort field"),
        direction: z.enum(["asc", "desc"]).optional().describe("Sort direction"),
        limit: z.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT).describe("Max results (1-100)"),
        start: z.number().int().min(0).default(0).describe("Pagination offset"),
        include_trash: z.boolean().optional().default(false).describe("Include trashed items"),
        response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe("Output format"),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params) => {
      try {
        const queryParams: Record<string, unknown> = {
          limit: params.limit,
          start: params.start,
          sort: params.sort,
        };
        if (params.q) queryParams["q"] = params.q;
        if (params.qmode) queryParams["qmode"] = params.qmode;
        if (params.item_type) queryParams["itemType"] = params.item_type;
        if (params.tag) queryParams["tag"] = params.tag;
        if (params.direction) queryParams["direction"] = params.direction;
        if (params.include_trash) queryParams["includeTrashed"] = "1";

        const path = params.collection_key
          ? `${client.userPrefix}/collections/${params.collection_key}/items`
          : `${client.userPrefix}/items`;

        const result = await client.getPaginated<ZoteroItem>(path, queryParams);

        if (result.items.length === 0) {
          return { content: [{ type: "text", text: "No items found matching the specified criteria." }] };
        }

        const output = {
          total: result.totalResults,
          count: result.items.length,
          start: params.start,
          has_more: result.hasMore,
          next_start: result.nextStart,
          items: result.items.map((item) => item.data),
        };

        let text: string;
        if (params.response_format === ResponseFormat.MARKDOWN) {
          const lines = [
            `# Zotero Items (${result.items.length} of ${result.totalResults})`,
            "",
            ...result.items.map((item) => formatItemMarkdown(item) + "\n"),
          ];
          if (result.hasMore) lines.push(`\n*More results available — use start=${result.nextStart} to continue.*`);
          text = lines.join("\n");
        } else {
          text = JSON.stringify(output, null, 2);
        }

        if (text.length > CHARACTER_LIMIT) {
          text = text.slice(0, CHARACTER_LIMIT) + `\n\n[Response truncated. Use pagination (start parameter) to see more.]`;
        }

        return { content: [{ type: "text", text }], structuredContent: output };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  // ── zotero_get_item ────────────────────────────────────────────────────────
  server.registerTool(
    "zotero_get_item",
    {
      title: "Get Zotero Item",
      description: `Retrieve a single Zotero item by its key.

Args:
  - item_key (string): The 8-character Zotero item key (e.g. "ABCD1234")
  - response_format ('markdown'|'json'): Output format (default: 'markdown')

Returns: Full item data including all fields, creators, tags, and collections.

Examples:
  - {item_key: "ABCD1234"}`,
      inputSchema: z.object({
        item_key: z.string().length(8).regex(/^[A-Z0-9]{8}$/i).describe("The 8-character alphanumeric Zotero item key"),
        response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe("Output format"),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params) => {
      try {
        const { data: item } = await client.get<ZoteroItem>(
          `${client.userPrefix}/items/${params.item_key}`
        );

        let text: string;
        if (params.response_format === ResponseFormat.MARKDOWN) {
          text = formatItemMarkdown(item);
        } else {
          text = JSON.stringify(item.data, null, 2);
        }

        return { content: [{ type: "text", text }], structuredContent: item.data };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  // ── zotero_get_item_children ───────────────────────────────────────────────
  server.registerTool(
    "zotero_get_item_children",
    {
      title: "Get Zotero Item Children",
      description: `Get child items (notes and attachments) of a Zotero item.

Args:
  - item_key (string): The parent item's 8-character key
  - response_format ('markdown'|'json'): Output format (default: 'markdown')

Returns: List of child items (notes, attachments, etc.)`,
      inputSchema: z.object({
        item_key: z.string().length(8).regex(/^[A-Z0-9]{8}$/i).describe("Parent item key"),
        response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe("Output format"),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params) => {
      try {
        const result = await client.getPaginated<ZoteroItem>(
          `${client.userPrefix}/items/${params.item_key}/children`
        );

        if (result.items.length === 0) {
          return { content: [{ type: "text", text: `No child items found for item ${params.item_key}.` }] };
        }

        const output = {
          count: result.items.length,
          children: result.items.map((i) => i.data),
        };

        let text: string;
        if (params.response_format === ResponseFormat.MARKDOWN) {
          const lines = [`# Children of ${params.item_key}`, ""];
          for (const child of result.items) {
            const d = child.data;
            lines.push(`## [${d.itemType}] ${d.title ?? d.key}`);
            if (d.note) lines.push(`${String(d.note).slice(0, 500)}`);
            lines.push("");
          }
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

  // ── zotero_get_citation ────────────────────────────────────────────────────
  server.registerTool(
    "zotero_get_citation",
    {
      title: "Get Zotero Citation",
      description: `Get a formatted bibliography entry for one or more Zotero items.

Args:
  - item_keys (string[]): List of item keys (up to 50)
  - style (string): Citation style, e.g. 'apa', 'chicago-note-bibliography', 'mla', 'ieee' (default: 'chicago-note-bibliography')
  - locale (string): Bibliography locale, e.g. 'en-US', 'de-DE' (default: 'en-US')

Returns: Formatted bibliography HTML string.

Examples:
  - APA citation: {item_keys: ["ABCD1234"], style: "apa"}
  - Multiple items: {item_keys: ["ABCD1234", "EFGH5678"], style: "mla"}`,
      inputSchema: z.object({
        item_keys: z.array(z.string()).min(1).max(50).describe("Item keys to cite (max 50)"),
        style: z.string().default("chicago-note-bibliography").describe("Citation style name, e.g. 'apa', 'mla', 'chicago-note-bibliography'"),
        locale: z.string().default("en-US").describe("Bibliography locale, e.g. 'en-US'"),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params) => {
      try {
        const { data: bib } = await client.get<string>(
          `${client.userPrefix}/items`,
          {
            itemKey: params.item_keys.join(","),
            format: "bib",
            style: params.style,
            locale: params.locale,
          }
        );

        return { content: [{ type: "text", text: String(bib) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  // ── zotero_export_items ────────────────────────────────────────────────────
  server.registerTool(
    "zotero_export_items",
    {
      title: "Export Zotero Items",
      description: `Export Zotero items in a bibliographic format (BibTeX, RIS, CSL JSON, etc.).

Args:
  - item_keys (string[], optional): Specific item keys to export (up to 50). If omitted, exports from the whole library.
  - format ('bibtex'|'biblatex'|'csljson'|'ris'|'mods'|'rdf_zotero'|'rdf_dc'|'csv'|'wikipedia'): Export format (default: 'bibtex')
  - collection_key (string, optional): Export items from this collection
  - limit (number): Max items to export (default: 25, max: 100)
  - start (number): Pagination offset

Returns: Exported data in the requested format.

Examples:
  - Export as BibTeX: {item_keys: ["ABCD1234", "EFGH5678"], format: "bibtex"}
  - Export collection: {collection_key: "ABCD1234", format: "ris", limit: 50}`,
      inputSchema: z.object({
        item_keys: z.array(z.string()).max(50).optional().describe("Item keys to export (max 50). Omit to export from library."),
        format: z.enum(EXPORT_FORMATS).default("bibtex").describe("Export format"),
        collection_key: z.string().regex(/^[A-Z0-9]{8}$/i).optional().describe("Export items from this collection key"),
        limit: z.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT).describe("Max items to export"),
        start: z.number().int().min(0).default(0).describe("Pagination offset"),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params) => {
      try {
        const queryParams: Record<string, unknown> = {
          format: params.format,
          limit: params.limit,
          start: params.start,
        };
        if (params.item_keys?.length) queryParams["itemKey"] = params.item_keys.join(",");

        const path = params.collection_key
          ? `${client.userPrefix}/collections/${params.collection_key}/items`
          : `${client.userPrefix}/items`;

        const { data } = await client.get<string>(path, queryParams);
        return { content: [{ type: "text", text: String(data) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  // ── zotero_create_item ─────────────────────────────────────────────────────
  server.registerTool(
    "zotero_create_item",
    {
      title: "Create Zotero Item",
      description: `Create one or more new items in your Zotero library.

Args:
  - items (array): Array of item objects. Each item must have:
    - item_type (string): e.g. 'journalArticle', 'book', 'webpage', 'report', 'thesis', 'conferencePaper'
    - title (string, optional): Item title
    - creators (array, optional): [{creator_type: 'author', first_name: 'John', last_name: 'Doe'}]
    - abstract (string, optional): Abstract or note
    - date (string, optional): Publication date, e.g. '2023' or '2023-05-15'
    - url (string, optional): URL
    - doi (string, optional): DOI
    - publication_title (string, optional): Journal/book title
    - volume (string, optional)
    - issue (string, optional)
    - pages (string, optional)
    - publisher (string, optional)
    - place (string, optional)
    - isbn (string, optional)
    - language (string, optional)
    - tags (string[], optional): Tag names to apply
    - collection_keys (string[], optional): Collection keys to add item to
    - extra (string, optional): Extra field

Returns: Created item keys and any errors.

Examples:
  - Create journal article: {items: [{item_type: "journalArticle", title: "My Paper", creators: [{creator_type: "author", first_name: "Jane", last_name: "Smith"}], date: "2024", publication_title: "Nature"}]}
  - Create book: {items: [{item_type: "book", title: "My Book", tags: ["AI", "research"]}]}`,
      inputSchema: z.object({
        items: z.array(z.object({
          item_type: z.string().describe("Zotero item type, e.g. 'journalArticle', 'book', 'webpage', 'report'"),
          title: z.string().optional(),
          creators: z.array(z.object({
            creator_type: z.string().default("author").describe("e.g. 'author', 'editor', 'translator'"),
            first_name: z.string().optional(),
            last_name: z.string().optional(),
            name: z.string().optional().describe("Use for single-field names instead of first/last"),
          })).optional(),
          abstract: z.string().optional(),
          date: z.string().optional(),
          url: z.string().optional(),
          doi: z.string().optional(),
          publication_title: z.string().optional(),
          volume: z.string().optional(),
          issue: z.string().optional(),
          pages: z.string().optional(),
          publisher: z.string().optional(),
          place: z.string().optional(),
          isbn: z.string().optional(),
          language: z.string().optional(),
          tags: z.array(z.string()).optional(),
          collection_keys: z.array(z.string()).optional(),
          extra: z.string().optional(),
        })).min(1).max(50).describe("Items to create (max 50)"),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (params) => {
      try {
        const itemsPayload = params.items.map((item) => {
          const payload: Record<string, unknown> = { itemType: item.item_type };
          if (item.title !== undefined) payload["title"] = item.title;
          if (item.abstract !== undefined) payload["abstractNote"] = item.abstract;
          if (item.date !== undefined) payload["date"] = item.date;
          if (item.url !== undefined) payload["url"] = item.url;
          if (item.doi !== undefined) payload["DOI"] = item.doi;
          if (item.publication_title !== undefined) payload["publicationTitle"] = item.publication_title;
          if (item.volume !== undefined) payload["volume"] = item.volume;
          if (item.issue !== undefined) payload["issue"] = item.issue;
          if (item.pages !== undefined) payload["pages"] = item.pages;
          if (item.publisher !== undefined) payload["publisher"] = item.publisher;
          if (item.place !== undefined) payload["place"] = item.place;
          if (item.isbn !== undefined) payload["ISBN"] = item.isbn;
          if (item.language !== undefined) payload["language"] = item.language;
          if (item.extra !== undefined) payload["extra"] = item.extra;
          if (item.creators?.length) {
            payload["creators"] = item.creators.map((c) => {
              if (c.name) return { creatorType: c.creator_type, name: c.name };
              return { creatorType: c.creator_type, firstName: c.first_name ?? "", lastName: c.last_name ?? "" };
            });
          }
          if (item.tags?.length) payload["tags"] = item.tags.map((t) => ({ tag: t }));
          if (item.collection_keys?.length) payload["collections"] = item.collection_keys;
          return payload;
        });

        const result = await client.post<{
          successful: Record<string, ZoteroItem>;
          unchanged: Record<string, string>;
          failed: Record<string, { key?: string; code: number; message: string }>;
        }>(`${client.userPrefix}/items`, itemsPayload);

        const successCount = Object.keys(result.successful).length;
        const failCount = Object.keys(result.failed).length;

        const lines = [`Created ${successCount} item(s)${failCount > 0 ? `, ${failCount} failed` : ""}.`];
        for (const [, item] of Object.entries(result.successful)) {
          lines.push(`  ✓ ${item.data?.title ?? "Untitled"} [${item.key}]`);
        }
        for (const [idx, err] of Object.entries(result.failed)) {
          lines.push(`  ✗ Item ${idx}: ${err.message} (code ${err.code})`);
        }

        return {
          content: [{ type: "text", text: lines.join("\n") }],
          structuredContent: result,
        };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  // ── zotero_update_item ─────────────────────────────────────────────────────
  server.registerTool(
    "zotero_update_item",
    {
      title: "Update Zotero Item",
      description: `Update fields of an existing Zotero item using PATCH semantics (only provided fields are changed).

IMPORTANT: First call zotero_get_item to get the item's current version number, then include it here.

Args:
  - item_key (string): 8-character item key
  - version (number): Current version of the item (required to prevent conflicts)
  - title (string, optional): New title
  - creators (array, optional): Replaces all creators
  - abstract (string, optional)
  - date (string, optional)
  - url (string, optional)
  - doi (string, optional)
  - publication_title (string, optional)
  - volume (string, optional)
  - issue (string, optional)
  - pages (string, optional)
  - publisher (string, optional)
  - tags (string[], optional): Replaces all tags
  - collection_keys (string[], optional): Replaces all collections
  - extra (string, optional)

Returns: Confirmation of update.`,
      inputSchema: z.object({
        item_key: z.string().length(8).regex(/^[A-Z0-9]{8}$/i).describe("8-character alphanumeric item key"),
        version: z.number().int().describe("Current item version (from zotero_get_item)"),
        title: z.string().optional(),
        creators: z.array(z.object({
          creator_type: z.string().default("author"),
          first_name: z.string().optional(),
          last_name: z.string().optional(),
          name: z.string().optional(),
        })).optional(),
        abstract: z.string().optional(),
        date: z.string().optional(),
        url: z.string().optional(),
        doi: z.string().optional(),
        publication_title: z.string().optional(),
        volume: z.string().optional(),
        issue: z.string().optional(),
        pages: z.string().optional(),
        publisher: z.string().optional(),
        tags: z.array(z.string()).optional().describe("Replaces all existing tags"),
        collection_keys: z.array(z.string()).optional().describe("Replaces all existing collections"),
        extra: z.string().optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (params) => {
      try {
        const patch: Record<string, unknown> = {};
        if (params.title !== undefined) patch["title"] = params.title;
        if (params.abstract !== undefined) patch["abstractNote"] = params.abstract;
        if (params.date !== undefined) patch["date"] = params.date;
        if (params.url !== undefined) patch["url"] = params.url;
        if (params.doi !== undefined) patch["DOI"] = params.doi;
        if (params.publication_title !== undefined) patch["publicationTitle"] = params.publication_title;
        if (params.volume !== undefined) patch["volume"] = params.volume;
        if (params.issue !== undefined) patch["issue"] = params.issue;
        if (params.pages !== undefined) patch["pages"] = params.pages;
        if (params.publisher !== undefined) patch["publisher"] = params.publisher;
        if (params.extra !== undefined) patch["extra"] = params.extra;
        if (params.creators) {
          patch["creators"] = params.creators.map((c) =>
            c.name ? { creatorType: c.creator_type, name: c.name } : { creatorType: c.creator_type, firstName: c.first_name ?? "", lastName: c.last_name ?? "" }
          );
        }
        if (params.tags) patch["tags"] = params.tags.map((t) => ({ tag: t }));
        if (params.collection_keys) patch["collections"] = params.collection_keys;

        await client.patch(`${client.userPrefix}/items/${params.item_key}`, patch, params.version);
        return { content: [{ type: "text", text: `Item ${params.item_key} updated successfully.` }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  // ── zotero_delete_item ─────────────────────────────────────────────────────
  server.registerTool(
    "zotero_delete_item",
    {
      title: "Delete Zotero Item",
      description: `Delete an item from your Zotero library. This is permanent and cannot be undone via the API.

IMPORTANT: First call zotero_get_item to get the item's current version number.

Args:
  - item_key (string): 8-character item key
  - version (number): Current version of the item (required)

Returns: Confirmation of deletion.`,
      inputSchema: z.object({
        item_key: z.string().length(8).regex(/^[A-Z0-9]{8}$/i).describe("8-character alphanumeric item key"),
        version: z.number().int().describe("Current item version (from zotero_get_item)"),
      }),
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
    },
    async (params) => {
      try {
        await client.delete(`${client.userPrefix}/items/${params.item_key}`, params.version);
        return { content: [{ type: "text", text: `Item ${params.item_key} deleted successfully.` }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  // ── zotero_create_note ─────────────────────────────────────────────────────
  server.registerTool(
    "zotero_create_note",
    {
      title: "Create Zotero Note",
      description: `Create a note item in Zotero, optionally as a child of an existing item.

Args:
  - note (string): Note content (supports HTML)
  - parent_item_key (string, optional): Attach note as child of this item
  - tags (string[], optional): Tags to apply to the note
  - collection_keys (string[], optional): Collections to add note to (ignored if parent_item_key is set)

Returns: Created note key.`,
      inputSchema: z.object({
        // Note: HTML is forwarded as-is to the Zotero API and stored server-side.
        // It is not rendered by this server, so there is no XSS risk here.
        note: z.string().min(1).describe("Note content (HTML supported)"),
        parent_item_key: z.string().length(8).regex(/^[A-Z0-9]{8}$/i).optional().describe("Parent item key to attach note to"),
        tags: z.array(z.string()).optional(),
        collection_keys: z.array(z.string()).optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (params) => {
      try {
        const payload: Record<string, unknown> = {
          itemType: "note",
          note: params.note,
        };
        if (params.parent_item_key) payload["parentItem"] = params.parent_item_key;
        if (params.tags?.length) payload["tags"] = params.tags.map((t) => ({ tag: t }));
        if (params.collection_keys?.length && !params.parent_item_key) payload["collections"] = params.collection_keys;

        const result = await client.post<{
          successful: Record<string, ZoteroItem>;
          failed: Record<string, { message: string; code: number }>;
        }>(`${client.userPrefix}/items`, [payload]);

        const keys = Object.values(result.successful).map((i) => i.key);
        if (keys.length > 0) {
          return { content: [{ type: "text", text: `Note created with key: ${keys[0]}` }] };
        }
        const failures = Object.values(result.failed);
        return { content: [{ type: "text", text: `Failed to create note: ${failures[0]?.message ?? "unknown error"}` }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );
}
