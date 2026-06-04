# arXiv API Reference

Condensed reference for the arXiv API, used by this MCP server. Source: the
[arXiv API User's Manual](https://info.arxiv.org/help/api/user-manual.html).
Please review the [Terms of Use](https://info.arxiv.org/help/api/tou.html)
before using the API.

## Endpoint

```
http://export.arxiv.org/api/query?{parameters}
```

Requests can be made via HTTP GET (parameters in the URL) or POST. Responses are
[Atom 1.0](https://www.w3.org/2005/Atom) feeds (XML), including error responses.

## Query parameters

| Parameter | Type | Default | Required |
| --- | --- | --- | --- |
| `search_query` | string | None | No |
| `id_list` | comma-delimited string | None | No |
| `start` | int | 0 | No |
| `max_results` | int | 10 | No |
| `sortBy` | `relevance` \| `lastUpdatedDate` \| `submittedDate` | `relevance` | No |
| `sortOrder` | `ascending` \| `descending` | `descending` | No |

### `search_query` and `id_list` logic

| `search_query` | `id_list` | API returns |
| --- | --- | --- |
| yes | no | articles matching `search_query` |
| no | yes | articles in `id_list` |
| yes | yes | articles in `id_list` that also match `search_query` (filter) |

### Paging (`start`, `max_results`)

- `start` is the 0-based index of the first returned result.
- `max_results` is the number of results returned.
- Max results per call is **2000**; total reachable via paging is **30000**.
- A request with `max_results > 30000` returns HTTP 400.
- Be polite: insert a ~3 second delay between successive calls, and cache
  results (they only change once per day).

## Search query construction

Field prefixes (prepend `prefix:` to a term):

| Prefix | Field |
| --- | --- |
| `ti` | Title |
| `au` | Author |
| `abs` | Abstract |
| `co` | Comment |
| `jr` | Journal Reference |
| `cat` | Subject Category |
| `rn` | Report Number |
| `id` | Id (prefer `id_list`) |
| `all` | All of the above |

Boolean operators: `AND`, `OR`, `ANDNOT`.

Grouping / phrases (URL-encoded in raw URLs; the MCP server handles encoding):

| Symbol | Encoding | Meaning |
| --- | --- | --- |
| `( )` | `%28` `%29` | Group boolean expressions |
| `" "` | `%22` `%22` | Phrase search within a field |
| space | `+` | Combine fields |

Date filter: `submittedDate:[YYYYMMDDTTTT+TO+YYYYMMDDTTTT]` where `TTTT` is 24h
time to the minute, GMT.

Examples:

```
search_query=all:electron
search_query=au:del_maestro
search_query=au:del_maestro+AND+ti:checkerboard
search_query=au:del_maestro+ANDNOT+%28ti:checkerboard+OR+ti:Pyrochlore%29
search_query=au:del_maestro+AND+ti:%22quantum+criticality%22
search_query=au:del_maestro+AND+submittedDate:[202301010600+TO+202401010600]
```

## Article versions

Each article has a version (`v1`, `v2`, …). Use `id_list` to handle versions
correctly. Append `vN` to an id for a specific version; omit it for the latest.

```
id_list=cond-mat/0207270      # latest version
id_list=cond-mat/0207270v1    # first version
```

## Response: Atom feed structure

### Feed-level elements

| Element | Meaning |
| --- | --- |
| `<title>` | Canonicalized query string |
| `<id>` | Unique id for this query |
| `<updated>` | Last time results updated (midnight of current day) |
| `<link rel="self">` | GET-requestable URL for this feed |
| `<opensearch:totalResults>` | Total matches for the query |
| `<opensearch:startIndex>` | 0-based index of first result |
| `<opensearch:itemsPerPage>` | Number of results returned |

### Entry-level elements (one `<entry>` per article)

| Element | Meaning |
| --- | --- |
| `<title>` | Article title |
| `<id>` | Abstract page URL `http://arxiv.org/abs/{id}` |
| `<published>` | Date version 1 was submitted |
| `<updated>` | Date the retrieved version was submitted |
| `<summary>` | Abstract |
| `<author><name>` | One per author (in order) |
| `<category term scheme>` | arXiv/ACM/MSC categories |
| `<arxiv:primary_category>` | Primary arXiv category |
| `<arxiv:comment>` | Author comment |
| `<arxiv:affiliation>` | Author affiliation (subelement of `<author>`) |
| `<arxiv:journal_ref>` | Journal reference |
| `<arxiv:doi>` | DOI |
| `<link>` | Up to 3: abstract page (`rel=alternate`), pdf (`title=pdf`), doi (`title=doi`) |

Namespaces:

```
xmlns="http://www.w3.org/2005/Atom"
xmlns:opensearch="http://a9.com/-/spec/opensearch/1.1/"
xmlns:arxiv="http://arxiv.org/schemas/atom"
```

## Errors

Errors are returned as an Atom feed with a single `<entry>` whose `<id>` points
at `http://arxiv.org/api/errors`. The `<summary>` contains the message.

| Sample bad input | Error |
| --- | --- |
| `start=not_an_int` | start must be an integer |
| `start=-1` | start must be >= 0 |
| `max_results=not_an_int` | max_results must be an integer |
| `max_results=-1` | max_results must be >= 0 |
| `id_list=1234.1234` | malformed id |

## Subject classifications

Full taxonomy: https://arxiv.org/category_taxonomy

## Bulk harvesting

For bulk metadata harvesting, use the OAI-PMH interface rather than this API.
Refine queries returning more than ~1000 results, or request smaller slices.
