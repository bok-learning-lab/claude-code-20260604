/**
 * TypeScript interfaces describing the subset of Harvard Art Museums API
 * responses that this server reads. The API returns many more fields than are
 * modeled here; unmodeled fields are simply ignored.
 */

/** The `info` block returned with every list response. */
export interface HamInfo {
  totalrecords?: number;
  totalrecordsperquery?: number;
  pages?: number;
  page?: number;
  next?: string;
  prev?: string;
  responsetime?: string;
}

/** Generic envelope for a list ("get many") response. */
export interface HamListResponse<T> {
  info?: HamInfo;
  records?: T[];
  aggregations?: Record<string, unknown>;
}

/** A person associated with an object (maker, sitter, etc.). */
export interface ObjectPerson {
  name?: string | null;
  displayname?: string | null;
  role?: string | null;
  personid?: number | null;
  culture?: string | null;
  displaydate?: string | null;
}

/** One programmatically extracted color from an object's primary image. */
export interface ObjectColor {
  percent?: number;
  color?: string;
  spectrum?: string;
  css3?: string;
  hue?: string;
}

/** One image attached to an object record. */
export interface ObjectImage {
  imageid?: number;
  baseimageurl?: string | null;
  renditionnumber?: string | null;
  displayorder?: number | null;
  width?: number | null;
  height?: number | null;
  format?: string | null;
  alttext?: string | null;
  description?: string | null;
  publiccaption?: string | null;
  copyright?: string | null;
}

/** An object record. Only commonly used fields are typed; the rest is open. */
export interface ObjectRecord {
  objectid?: number;
  id?: number;
  objectnumber?: string | null;
  title?: string | null;
  dated?: string | null;
  datebegin?: number | null;
  dateend?: number | null;
  century?: string | null;
  culture?: string | null;
  classification?: string | null;
  medium?: string | null;
  technique?: string | null;
  dimensions?: string | null;
  department?: string | null;
  division?: string | null;
  creditline?: string | null;
  description?: string | null;
  provenance?: string | null;
  commentary?: string | null;
  url?: string | null;
  primaryimageurl?: string | null;
  imagecount?: number | null;
  colorcount?: number | null;
  people?: ObjectPerson[] | null;
  colors?: ObjectColor[] | null;
  images?: ObjectImage[] | null;
  worktypes?: Array<{ worktypeid?: string; worktype?: string }> | null;
  // Catch-all for fields not explicitly modeled above.
  [key: string]: unknown;
}

/** A vocabulary term (classification, worktype, medium, technique). */
export interface TermRecord {
  id?: number | string;
  name?: string;
  objectcount?: number;
  [key: string]: unknown;
}

/** A named color in the museums' color list. */
export interface ColorRecord {
  colorid?: number;
  id?: number;
  name?: string;
  hex?: string;
}
