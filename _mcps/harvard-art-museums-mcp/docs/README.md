# Harvard Art Museums API reference (vendored)

A local copy of the [official Harvard Art Museums API
docs](https://github.com/harvardartmuseums/api-docs), kept here for offline
reference while developing and extending this MCP server.

- [`api-reference.md`](./api-reference.md) — top-level guide: access, auth,
  paging, response format, errors, IIIF, aggregations, terms of use.
- [`sections/`](./sections) — one file per resource endpoint.

## Endpoint coverage in this server

Implemented:

| Resource | Doc | Tool |
| --- | --- | --- |
| Object (search + detail) | [object.md](./sections/object.md) | `ham_search_objects`, `ham_get_object` |
| Classification | [classification.md](./sections/classification.md) | `ham_list_terms` (type=classification) |
| Worktype | [worktype.md](./sections/worktype.md) | `ham_list_terms` (type=worktype) |
| Medium | [medium.md](./sections/medium.md) | `ham_list_terms` (type=medium) |
| Technique | [technique.md](./sections/technique.md) | `ham_list_terms` (type=technique) |
| Color | [color.md](./sections/color.md) | `ham_list_colors` |
| Image / IIIF | [image.md](./sections/image.md), [iiif.md](./sections/iiif.md) | `ham_get_image_url` |

Not yet implemented (straightforward to add following the patterns in
`src/tools/`): person, culture, century, period, place, exhibition, gallery,
group, publication, support, spectrum, activity, site, video, audio, annotation,
and the `aggregation`-based [analysis](./sections/analysis.md) workflows.

> These docs are a snapshot. Check the upstream repo for the latest version.
