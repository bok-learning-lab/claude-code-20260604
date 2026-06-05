export const ZOTERO_API_BASE = "https://api.zotero.org";
export const ZOTERO_API_VERSION = "3";
export const CHARACTER_LIMIT = 25000;
export const DEFAULT_LIMIT = 25;
export const MAX_LIMIT = 100;

export enum ResponseFormat {
  MARKDOWN = "markdown",
  JSON = "json",
}

export const EXPORT_FORMATS = [
  "bibtex",
  "biblatex",
  "csljson",
  "ris",
  "mods",
  "rdf_zotero",
  "rdf_dc",
  "csv",
  "wikipedia",
] as const;

export type ExportFormat = (typeof EXPORT_FORMATS)[number];

export const SORT_FIELDS = [
  "dateAdded",
  "dateModified",
  "title",
  "creator",
  "itemType",
  "date",
  "publisher",
  "publicationTitle",
  "journalAbbreviation",
  "language",
  "accessDate",
  "libraryCatalog",
  "callNumber",
  "rights",
  "addedBy",
] as const;

export type SortField = (typeof SORT_FIELDS)[number];
