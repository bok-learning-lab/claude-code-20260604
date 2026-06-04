/**
 * Tool for constructing IIIF image and presentation URLs from data already
 * returned by other tools. This is pure string construction: it makes no
 * network calls and needs no API key.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { IIIF_BASE_URL } from "../constants.js";
import { ResponseFormat, toolText } from "../services/format.js";

const GetImageUrlSchema = z.object({
    base_image_url: z
      .string()
      .url()
      .optional()
      .describe(
        "A 'baseimageurl' or 'primaryimageurl' from an object/image record, e.g. " +
          "'https://nrs.harvard.edu/urn-3:HUAM:799974'. Used to build a IIIF Image API URL.",
      ),
    object_id: z
      .number()
      .int()
      .positive()
      .optional()
      .describe("An object id. Used to build the object's IIIF presentation manifest URL."),
    region: z
      .string()
      .max(60)
      .default("full")
      .describe(
        "IIIF region: 'full', 'square', 'x,y,w,h' (pixels), or 'pct:x,y,w,h' (percentages).",
      ),
    size: z
      .string()
      .max(60)
      .default("full")
      .describe(
        "IIIF size: 'full', 'max', 'w,' (width), ',h' (height), 'w,h', '!w,h' (best fit), " +
          "or 'pct:n'. Example '256,' yields a 256px-wide thumbnail.",
      ),
    rotation: z
      .string()
      .regex(/^!?\d{1,3}(\.\d+)?$/, "Rotation must be 0-360, optionally prefixed with '!' to mirror.")
      .default("0")
      .describe("IIIF rotation in degrees (0-360), optionally prefixed with '!' to mirror first."),
    quality: z
      .enum(["default", "color", "gray", "bitonal"])
      .default("default")
      .describe("IIIF quality."),
    format: z
      .enum(["jpg", "png", "tif", "gif", "webp"])
      .default("jpg")
      .describe("IIIF output image format."),
    response_format: z
      .nativeEnum(ResponseFormat)
      .default(ResponseFormat.MARKDOWN)
      .describe("'markdown' (human-readable, default) or 'json' (structured)."),
  });

type GetImageUrlInput = z.infer<typeof GetImageUrlSchema>;

export function registerImageTools(server: McpServer): void {
  server.registerTool(
    "ham_get_image_url",
    {
      title: "Build a Harvard Art Museums IIIF URL",
      description: `Construct ready-to-use IIIF URLs from data returned by other tools. The IIIF
service is public and needs no API key. Two kinds of URL can be produced:

  1. Image API URL (when 'base_image_url' is given): a deep-zoom-capable image you can
     crop, scale, rotate, and re-format. Built as:
     {base_image_url}/{region}/{size}/{rotation}/{quality}.{format}
  2. Presentation manifest URL (when 'object_id' is given): loadable in IIIF viewers.

This tool only assembles strings; it does not fetch anything. Note that images for
rights-restricted works (many 20th/21st-century pieces) may not resolve for most keys.

Args:
  - base_image_url (string, optional): a 'baseimageurl'/'primaryimageurl' value
  - object_id (number, optional): an object id (for its manifest URL)
  - region (string, default 'full'): 'full' | 'square' | 'x,y,w,h' | 'pct:x,y,w,h'
  - size (string, default 'full'): 'full' | 'max' | 'w,' | ',h' | 'w,h' | '!w,h' | 'pct:n'
  - rotation (string, default '0'): 0-360, optional leading '!' to mirror
  - quality ('default'|'color'|'gray'|'bitonal', default 'default')
  - format ('jpg'|'png'|'tif'|'gif'|'webp', default 'jpg')
  - response_format ('markdown'|'json', default 'markdown')
  (At least one of base_image_url or object_id is required.)

Returns:
  JSON format: { image_url?: string, manifest_url?: string }

Examples:
  - "Full-resolution JPEG" -> base_image_url='https://nrs.harvard.edu/urn-3:HUAM:799974'
  - "256px-wide thumbnail" -> base_image_url=..., size='256,'
  - "Left half of the image" -> base_image_url=..., region='pct:0,0,50,100'
  - "Manifest for viewer" -> object_id=299843`,
      inputSchema: GetImageUrlSchema.shape,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params: GetImageUrlInput) => {
      try {
        if (params.base_image_url === undefined && params.object_id === undefined) {
          return toolText(
            "Error: Provide at least one of 'base_image_url' (to build an image URL) or " +
              "'object_id' (to build a manifest URL).",
            true,
          );
        }

        let imageUrl: string | undefined;
        if (params.base_image_url) {
          const base = params.base_image_url.replace(/\/+$/, "");
          imageUrl = `${base}/${params.region}/${params.size}/${params.rotation}/${params.quality}.${params.format}`;
        }

        const manifestUrl = params.object_id
          ? `${IIIF_BASE_URL}/manifests/object/${params.object_id}`
          : undefined;

        if (params.response_format === ResponseFormat.JSON) {
          return toolText(
            JSON.stringify(
              {
                ...(imageUrl ? { image_url: imageUrl } : {}),
                ...(manifestUrl ? { manifest_url: manifestUrl } : {}),
              },
              null,
              2,
            ),
          );
        }

        const lines: string[] = ["# IIIF URLs", ""];
        if (imageUrl) lines.push(`- **Image API URL**: ${imageUrl}`);
        if (manifestUrl) lines.push(`- **Presentation manifest**: ${manifestUrl}`);
        lines.push(
          "",
          "_Note: rights-restricted images may not resolve for most API keys._",
        );
        return toolText(lines.join("\n"));
      } catch (error) {
        return toolText(
          `Error: ${error instanceof Error ? error.message : String(error)}`,
          true,
        );
      }
    },
  );
}
