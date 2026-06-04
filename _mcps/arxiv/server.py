#!/usr/bin/env python3
"""MCP server for the arXiv API.

This server provides tools to search arXiv e-prints and retrieve metadata for
specific articles by their arXiv identifiers. It wraps the public arXiv API
(https://export.arxiv.org/api/query), which returns results as Atom feeds, and
parses them into clean, agent-friendly output.

Please review the arXiv API Terms of Use before using:
https://info.arxiv.org/help/api/tou.html

The arXiv API asks callers to be polite: include a short delay between repeated
requests and cache results (search results only change once per day). This
server inserts a small inter-request delay automatically.
"""

from __future__ import annotations

import asyncio
import io
import json
import re
import time
from enum import Enum
from typing import Any, Optional

import feedparser
import httpx
from bs4 import BeautifulSoup
from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel, ConfigDict, Field, field_validator
from pypdf import PdfReader

# Initialize the MCP server
mcp = FastMCP("arxiv_mcp")

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
API_BASE_URL = "https://export.arxiv.org/api/query"
# Full-text source URLs. {id} is the bare arXiv id (optionally with version).
HTML_URL_TEMPLATE = "https://arxiv.org/html/{id}"
AR5IV_URL_TEMPLATE = "https://ar5iv.labs.arxiv.org/html/{id}"
PDF_URL_TEMPLATE = "https://arxiv.org/pdf/{id}"
CHARACTER_LIMIT = 25000  # Maximum response size in characters
# Default-but-overridable cap on a single full-text slice.
FULL_TEXT_SLICE_DEFAULT = 25000
FULL_TEXT_SLICE_MAX = 100000
# Cap on bytes downloaded for a PDF to avoid pathological documents.
MAX_PDF_BYTES = 50 * 1024 * 1024
FULL_TEXT_TIMEOUT = 60.0
REQUEST_TIMEOUT = 30.0
# arXiv requests a ~3 second delay between successive calls. We enforce a
# minimum gap between outgoing requests to stay friendly to the service.
MIN_REQUEST_INTERVAL = 3.0
# arXiv caps a single response at 2000 results per slice.
MAX_RESULTS_PER_CALL = 2000

USER_AGENT = "arxiv-mcp/0.1.0 (https://github.com/; MCP server for the arXiv API)"

# arXiv search field prefixes, for reference in tool docs and validation help.
SEARCH_FIELD_PREFIXES = {
    "ti": "Title",
    "au": "Author",
    "abs": "Abstract",
    "co": "Comment",
    "jr": "Journal Reference",
    "cat": "Subject Category",
    "rn": "Report Number",
    "all": "All of the above",
}

# Module-level state to throttle outgoing requests.
_last_request_time = 0.0
_request_lock = asyncio.Lock()


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------
class ResponseFormat(str, Enum):
    """Output format for tool responses."""

    MARKDOWN = "markdown"
    JSON = "json"


class SortBy(str, Enum):
    """Field used to sort arXiv search results."""

    RELEVANCE = "relevance"
    LAST_UPDATED = "lastUpdatedDate"
    SUBMITTED = "submittedDate"


class SortOrder(str, Enum):
    """Direction of the sort order."""

    ASCENDING = "ascending"
    DESCENDING = "descending"


class FullTextSource(str, Enum):
    """Which source to use when retrieving a paper's full text."""

    AUTO = "auto"  # Try HTML (arXiv, then ar5iv), then fall back to PDF.
    HTML = "html"  # HTML only (arXiv native, then ar5iv).
    PDF = "pdf"  # Extract text from the PDF.


# ---------------------------------------------------------------------------
# Pydantic input models
# ---------------------------------------------------------------------------
class SearchPapersInput(BaseModel):
    """Input model for searching arXiv papers."""

    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True,
        extra="forbid",
    )

    query: str = Field(
        ...,
        description=(
            "arXiv search query. Plain words search all fields. Use field "
            "prefixes for precision: ti: (title), au: (author), abs: "
            "(abstract), co: (comment), jr: (journal ref), cat: (category, "
            "e.g. cs.AI), rn: (report number), all: (all fields). Combine "
            "terms with AND, OR, ANDNOT. Group with parentheses and quote "
            'phrases with double quotes. Examples: \'electron\', '
            '\'au:del_maestro AND ti:checkerboard\', '
            '\'cat:cs.LG AND abs:\"language model\"\', '
            '\'ti:\"quantum criticality\"\'. A submittedDate range filter is '
            "also supported, e.g. "
            "'au:del_maestro AND submittedDate:[202301010600 TO 202401010600]'."
        ),
        min_length=1,
        max_length=1000,
    )
    start: int = Field(
        default=0,
        description="0-based index of the first result to return (for paging).",
        ge=0,
    )
    max_results: int = Field(
        default=10,
        description=(
            "Maximum number of results to return in this call (1-2000). "
            "Use 'start' to page through larger result sets."
        ),
        ge=1,
        le=MAX_RESULTS_PER_CALL,
    )
    sort_by: SortBy = Field(
        default=SortBy.RELEVANCE,
        description="Sort field: 'relevance', 'lastUpdatedDate', or 'submittedDate'.",
    )
    sort_order: SortOrder = Field(
        default=SortOrder.DESCENDING,
        description="Sort direction: 'ascending' or 'descending'.",
    )
    response_format: ResponseFormat = Field(
        default=ResponseFormat.MARKDOWN,
        description="Output format: 'markdown' (human-readable) or 'json' (structured).",
    )

    @field_validator("query")
    @classmethod
    def validate_query(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("query cannot be empty or whitespace only")
        return v.strip()


class GetPaperInput(BaseModel):
    """Input model for retrieving specific arXiv papers by ID."""

    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True,
        extra="forbid",
    )

    ids: list[str] = Field(
        ...,
        description=(
            "List of arXiv identifiers to retrieve. Accepts modern IDs "
            "(e.g. '2101.00001'), legacy IDs (e.g. 'hep-ex/0307015'), and "
            "version suffixes (e.g. '2101.00001v2'). Omitting the version "
            "returns the latest version. The leading 'http://arxiv.org/abs/' "
            "may be included or omitted."
        ),
        min_length=1,
        max_length=100,
    )
    response_format: ResponseFormat = Field(
        default=ResponseFormat.MARKDOWN,
        description="Output format: 'markdown' (human-readable) or 'json' (structured).",
    )

    @field_validator("ids")
    @classmethod
    def validate_ids(cls, v: list[str]) -> list[str]:
        cleaned: list[str] = []
        for raw in v:
            ident = raw.strip()
            # Strip the abstract-page URL prefix if present.
            for prefix in ("https://arxiv.org/abs/", "http://arxiv.org/abs/"):
                if ident.startswith(prefix):
                    ident = ident[len(prefix):]
            if not ident:
                raise ValueError("arXiv id cannot be empty")
            cleaned.append(ident)
        if not cleaned:
            raise ValueError("ids must contain at least one identifier")
        return cleaned


class GetFullTextInput(BaseModel):
    """Input model for retrieving the full text of a single arXiv paper."""

    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True,
        extra="forbid",
    )

    id: str = Field(
        ...,
        description=(
            "A single arXiv identifier whose full text to retrieve. Accepts "
            "modern IDs ('2101.00001'), legacy IDs ('hep-ex/0307015'), and "
            "version suffixes ('2101.00001v2'). A leading "
            "'http://arxiv.org/abs/' is stripped automatically."
        ),
        min_length=1,
        max_length=100,
    )
    source: FullTextSource = Field(
        default=FullTextSource.AUTO,
        description=(
            "Where to get the text: 'auto' (try HTML, fall back to PDF), "
            "'html' (HTML only — arXiv native then ar5iv), or 'pdf' (extract "
            "from the PDF). HTML is cleaner; PDF is the universal fallback."
        ),
    )
    start_char: int = Field(
        default=0,
        description=(
            "Character offset to start from. Full text is paged because "
            "papers are long; use this with the returned 'next_start_char' to "
            "read subsequent chunks."
        ),
        ge=0,
    )
    max_chars: int = Field(
        default=FULL_TEXT_SLICE_DEFAULT,
        description=(
            f"Maximum characters to return in this slice "
            f"(1-{FULL_TEXT_SLICE_MAX})."
        ),
        ge=1,
        le=FULL_TEXT_SLICE_MAX,
    )

    @field_validator("id")
    @classmethod
    def validate_id(cls, v: str) -> str:
        ident = v.strip()
        for prefix in ("https://arxiv.org/abs/", "http://arxiv.org/abs/"):
            if ident.startswith(prefix):
                ident = ident[len(prefix):]
        if not ident:
            raise ValueError("id cannot be empty")
        return ident


# ---------------------------------------------------------------------------
# Shared utilities
# ---------------------------------------------------------------------------
async def _make_api_request(params: dict[str, Any]) -> str:
    """Call the arXiv API and return the raw Atom feed body.

    Enforces a minimum interval between successive requests to be polite to
    the arXiv service, as requested in their API documentation.
    """
    global _last_request_time

    async with _request_lock:
        elapsed = time.monotonic() - _last_request_time
        if elapsed < MIN_REQUEST_INTERVAL:
            await asyncio.sleep(MIN_REQUEST_INTERVAL - elapsed)

        async with httpx.AsyncClient() as client:
            response = await client.get(
                API_BASE_URL,
                params=params,
                timeout=REQUEST_TIMEOUT,
                headers={"User-Agent": USER_AGENT},
            )
            _last_request_time = time.monotonic()
            response.raise_for_status()
            return response.text


def _handle_api_error(e: Exception) -> str:
    """Format exceptions into clear, actionable error messages."""
    if isinstance(e, httpx.HTTPStatusError):
        status = e.response.status_code
        if status == 400:
            return (
                "Error: arXiv rejected the request (400). Check your query "
                "syntax, id format, or that max_results is between 1 and 2000."
            )
        if status == 503:
            return (
                "Error: arXiv service temporarily unavailable (503). "
                "Wait a few seconds and try again."
            )
        return f"Error: arXiv API request failed with status {status}."
    if isinstance(e, httpx.TimeoutException):
        return "Error: Request to arXiv timed out. Please try again."
    if isinstance(e, httpx.HTTPError):
        return f"Error: Network error contacting arXiv: {type(e).__name__}."
    return f"Error: Unexpected error occurred: {type(e).__name__}: {e}"


def _arxiv_id_from_entry(entry: Any) -> str:
    """Extract the bare arXiv id (with version) from an entry's id URL."""
    raw = entry.get("id", "")
    for prefix in ("http://arxiv.org/abs/", "https://arxiv.org/abs/"):
        if raw.startswith(prefix):
            return raw[len(prefix):]
    return raw


def _parse_entry(entry: Any) -> dict[str, Any]:
    """Convert a feedparser entry into a normalized dict of paper metadata."""
    authors = [a.get("name", "").strip() for a in entry.get("authors", [])]
    authors = [a for a in authors if a]

    # Links: abstract page, pdf, and optionally a resolved DOI.
    abstract_url = ""
    pdf_url = ""
    doi_url = ""
    for link in entry.get("links", []):
        rel = link.get("rel")
        title = link.get("title")
        href = link.get("href", "")
        if rel == "alternate":
            abstract_url = href
        elif title == "pdf":
            pdf_url = href
        elif title == "doi":
            doi_url = href

    categories = [t.get("term") for t in entry.get("tags", []) if t.get("term")]
    primary_category = ""
    primary = entry.get("arxiv_primary_category")
    if isinstance(primary, dict):
        primary_category = primary.get("term", "")

    return {
        "id": _arxiv_id_from_entry(entry),
        "title": " ".join(entry.get("title", "").split()),
        "summary": " ".join(entry.get("summary", "").split()),
        "authors": authors,
        "published": entry.get("published", ""),
        "updated": entry.get("updated", ""),
        "primary_category": primary_category,
        "categories": categories,
        "comment": entry.get("arxiv_comment", ""),
        "journal_ref": entry.get("arxiv_journal_ref", ""),
        "doi": entry.get("arxiv_doi", ""),
        "abstract_url": abstract_url,
        "pdf_url": pdf_url,
        "doi_url": doi_url,
    }


def _detect_feed_error(parsed: Any) -> Optional[str]:
    """Return an error message if the feed represents an arXiv API error.

    arXiv returns errors as a feed with a single entry whose id points at
    http://arxiv.org/api/errors. Detect that case so we can surface the
    helpful message instead of treating it as a real result.
    """
    entries = parsed.get("entries", [])
    if len(entries) == 1:
        entry = entries[0]
        if "arxiv.org/api/errors" in entry.get("id", ""):
            summary = " ".join(entry.get("summary", "").split())
            return f"Error: arXiv API returned an error: {summary}"
    return None


def _format_paper_markdown(paper: dict[str, Any], abstract: bool = True) -> list[str]:
    """Render a single paper as Markdown lines."""
    lines = [f"## {paper['title']}", ""]
    lines.append(f"- **arXiv ID**: {paper['id']}")
    if paper["authors"]:
        shown = ", ".join(paper["authors"][:10])
        if len(paper["authors"]) > 10:
            shown += f", … (+{len(paper['authors']) - 10} more)"
        lines.append(f"- **Authors**: {shown}")
    if paper["primary_category"]:
        cats = paper["primary_category"]
        others = [c for c in paper["categories"] if c != paper["primary_category"]]
        if others:
            cats += " (" + ", ".join(others) + ")"
        lines.append(f"- **Categories**: {cats}")
    if paper["published"]:
        lines.append(f"- **Published**: {paper['published']}")
    if paper["updated"] and paper["updated"] != paper["published"]:
        lines.append(f"- **Updated**: {paper['updated']}")
    if paper["journal_ref"]:
        lines.append(f"- **Journal ref**: {paper['journal_ref']}")
    if paper["doi"]:
        lines.append(f"- **DOI**: {paper['doi']}")
    if paper["comment"]:
        lines.append(f"- **Comment**: {paper['comment']}")
    if paper["pdf_url"]:
        lines.append(f"- **PDF**: {paper['pdf_url']}")
    if paper["abstract_url"]:
        lines.append(f"- **Abstract page**: {paper['abstract_url']}")
    if abstract and paper["summary"]:
        lines.append("")
        lines.append(f"{paper['summary']}")
    lines.append("")
    return lines


def _build_response(
    papers: list[dict[str, Any]],
    total_results: int,
    start: int,
    response_format: ResponseFormat,
    query_label: str,
) -> str:
    """Build a markdown or JSON response, truncating to the character limit."""
    count = len(papers)
    has_more = total_results > start + count

    if response_format == ResponseFormat.JSON:
        payload: dict[str, Any] = {
            "query": query_label,
            "total_results": total_results,
            "count": count,
            "start": start,
            "has_more": has_more,
            "next_start": start + count if has_more else None,
            "papers": papers,
        }
        result = json.dumps(payload, indent=2)
        if len(result) > CHARACTER_LIMIT and count > 1:
            keep = max(1, count // 2)
            payload["papers"] = papers[:keep]
            payload["count"] = keep
            payload["truncated"] = True
            payload["truncation_message"] = (
                f"Response truncated from {count} to {keep} papers to stay "
                f"under the character limit. Use a smaller 'max_results' or "
                f"page with 'start'."
            )
            result = json.dumps(payload, indent=2)
        return result

    # Markdown
    header = [
        f"# arXiv results for: {query_label}",
        "",
        f"Showing {count} of {total_results} total results "
        f"(start={start}).",
        "",
    ]
    body_lines: list[str] = []
    for paper in papers:
        body_lines.extend(_format_paper_markdown(paper))

    result = "\n".join(header + body_lines)
    if len(result) > CHARACTER_LIMIT and count > 1:
        # Re-render with as many papers as fit.
        kept: list[str] = []
        running = "\n".join(header)
        included = 0
        for paper in papers:
            block = "\n".join(_format_paper_markdown(paper))
            if len(running) + len(block) + 1 > CHARACTER_LIMIT:
                break
            running += "\n" + block
            kept.append(block)
            included += 1
        if included == 0:
            included = 1
            kept = ["\n".join(_format_paper_markdown(papers[0], abstract=False))]
        notice = (
            f"\n\n_Response truncated to {included} of {count} returned papers "
            f"to stay under the character limit. Use a smaller 'max_results' "
            f"or page with 'start'._"
        )
        result = "\n".join(header + kept) + notice

    if has_more:
        result += (
            f"\n\n_More results available. Call again with start="
            f"{start + count} to continue paging._"
        )
    return result


# ---------------------------------------------------------------------------
# Full-text retrieval helpers
# ---------------------------------------------------------------------------
async def _fetch_url(url: str, *, as_bytes: bool = False) -> httpx.Response:
    """GET a URL with redirects, the polite throttle, and our User-Agent."""
    global _last_request_time

    async with _request_lock:
        elapsed = time.monotonic() - _last_request_time
        if elapsed < MIN_REQUEST_INTERVAL:
            await asyncio.sleep(MIN_REQUEST_INTERVAL - elapsed)
        async with httpx.AsyncClient(follow_redirects=True) as client:
            response = await client.get(
                url,
                timeout=FULL_TEXT_TIMEOUT,
                headers={"User-Agent": USER_AGENT},
            )
            _last_request_time = time.monotonic()
            return response


def _extract_text_from_html(html: str) -> str:
    """Extract readable text from an arXiv/ar5iv HTML page."""
    soup = BeautifulSoup(html, "html.parser")

    # Drop non-content elements.
    for tag in soup(["script", "style", "noscript", "head", "nav", "footer"]):
        tag.decompose()

    # Prefer the main article body if present (ar5iv/arXiv wrap content in
    # <article> or <main>); otherwise fall back to the whole document.
    root = soup.find("article") or soup.find("main") or soup.body or soup
    text = root.get_text(separator="\n")

    # Collapse excessive blank lines and trailing whitespace.
    lines = [ln.rstrip() for ln in text.splitlines()]
    cleaned: list[str] = []
    blank = 0
    for ln in lines:
        if ln.strip():
            blank = 0
            cleaned.append(ln)
        else:
            blank += 1
            if blank <= 1:
                cleaned.append("")
    return "\n".join(cleaned).strip()


def _extract_text_from_pdf(data: bytes) -> str:
    """Extract text from PDF bytes using pypdf."""
    reader = PdfReader(io.BytesIO(data))
    parts: list[str] = []
    for page in reader.pages:
        try:
            parts.append(page.extract_text() or "")
        except Exception:  # noqa: BLE001 - skip unparseable pages
            continue
    text = "\n\n".join(parts)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


async def _try_html_text(arxiv_id: str) -> Optional[tuple[str, str]]:
    """Return (text, source_url) from arXiv HTML, then ar5iv. None if neither."""
    for url in (
        HTML_URL_TEMPLATE.format(id=arxiv_id),
        AR5IV_URL_TEMPLATE.format(id=arxiv_id),
    ):
        try:
            resp = await _fetch_url(url)
        except httpx.HTTPError:
            continue
        if resp.status_code != 200:
            continue
        if "html" not in resp.headers.get("content-type", "").lower():
            continue
        text = _extract_text_from_html(resp.text)
        if len(text) >= 500:  # Guard against stub/error pages.
            return text, str(resp.url)
    return None


async def _try_pdf_text(arxiv_id: str) -> Optional[tuple[str, str]]:
    """Return (text, source_url) extracted from the paper's PDF, or None."""
    url = PDF_URL_TEMPLATE.format(id=arxiv_id)
    try:
        resp = await _fetch_url(url, as_bytes=True)
    except httpx.HTTPError:
        return None
    if resp.status_code != 200:
        return None
    data = resp.content
    if len(data) > MAX_PDF_BYTES:
        return None
    text = _extract_text_from_pdf(data)
    if text:
        return text, str(resp.url)
    return None


def _slice_full_text(
    text: str,
    start_char: int,
    max_chars: int,
    source_label: str,
    source_url: str,
    arxiv_id: str,
) -> str:
    """Return a markdown-wrapped slice of full text with paging metadata."""
    total = len(text)
    if start_char >= total and total > 0:
        return (
            f"Error: start_char ({start_char}) is beyond the end of the "
            f"document (length {total} characters)."
        )
    chunk = text[start_char:start_char + max_chars]
    end_char = start_char + len(chunk)
    has_more = end_char < total

    header = [
        f"# Full text of arXiv:{arxiv_id}",
        "",
        f"- **Source**: {source_label} ({source_url})",
        f"- **Characters**: {start_char}–{end_char} of {total}",
    ]
    if has_more:
        header.append(
            f"- **More available**: call again with start_char={end_char}"
        )
    header.extend(["", "---", ""])
    return "\n".join(header) + chunk


# ---------------------------------------------------------------------------
# Tools
# ---------------------------------------------------------------------------
@mcp.tool(
    name="arxiv_search_papers",
    annotations={
        "title": "Search arXiv Papers",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    },
)
async def arxiv_search_papers(params: SearchPapersInput) -> str:
    """Search arXiv e-prints by query and return matching paper metadata.

    Searches the arXiv corpus using its query syntax and returns titles,
    authors, abstracts, categories, links, and identifiers for matching
    papers. This is the right tool when you have a topic, author, or keyword
    but do NOT already know the arXiv IDs. If you already know the IDs, use
    arxiv_get_paper instead.

    Query syntax (passed via the 'query' field):
        - Plain words search all fields: "electron"
        - Field prefixes: ti: (title), au: (author), abs: (abstract),
          co: (comment), jr: (journal ref), cat: (category, e.g. cs.AI),
          rn: (report number), all: (all fields)
        - Boolean operators: AND, OR, ANDNOT
        - Grouping with parentheses; phrases in double quotes
        - Date range: submittedDate:[YYYYMMDDTTTT TO YYYYMMDDTTTT] (GMT)

    Args:
        params (SearchPapersInput): Validated input containing:
            - query (str): arXiv search query (see syntax above)
            - start (int): 0-based index of first result (default 0)
            - max_results (int): results per call, 1-2000 (default 10)
            - sort_by (SortBy): relevance | lastUpdatedDate | submittedDate
            - sort_order (SortOrder): ascending | descending
            - response_format (ResponseFormat): markdown | json

    Returns:
        str: In JSON format, an object with schema:
        {
            "query": str,
            "total_results": int,      # total matches in arXiv
            "count": int,              # papers in this response
            "start": int,
            "has_more": bool,
            "next_start": int | null,  # value to page with
            "papers": [
                {
                    "id": str,                 # e.g. "2101.00001v1"
                    "title": str,
                    "summary": str,            # abstract
                    "authors": [str, ...],
                    "published": str,          # ISO timestamp
                    "updated": str,
                    "primary_category": str,   # e.g. "cs.LG"
                    "categories": [str, ...],
                    "comment": str,
                    "journal_ref": str,
                    "doi": str,
                    "abstract_url": str,
                    "pdf_url": str,
                    "doi_url": str
                }
            ]
        }
        In markdown format, a human-readable summary of the same data.
        On failure, a string beginning with "Error:".

    Examples:
        - "Recent papers on diffusion models" ->
          query="abs:\"diffusion models\"", sort_by="submittedDate"
        - "Papers by Yann LeCun on convolutional networks" ->
          query="au:LeCun AND abs:convolutional"
        - "cs.AI papers submitted in Jan 2023" ->
          query="cat:cs.AI AND submittedDate:[202301010000 TO 202302010000]"
        - Don't use when you already have arXiv IDs (use arxiv_get_paper).

    Error Handling:
        - Pydantic validates inputs before the request is made.
        - Malformed query/date syntax returns an "Error:" message from arXiv.
        - Returns "No papers found matching ..." when there are zero results.
    """
    request_params = {
        "search_query": params.query,
        "start": params.start,
        "max_results": params.max_results,
        "sortBy": params.sort_by.value,
        "sortOrder": params.sort_order.value,
    }

    try:
        raw = await _make_api_request(request_params)
    except Exception as e:  # noqa: BLE001 - converted to friendly message
        return _handle_api_error(e)

    parsed = feedparser.parse(raw)

    error = _detect_feed_error(parsed)
    if error:
        return error

    entries = parsed.get("entries", [])
    if not entries:
        return f"No papers found matching '{params.query}'."

    try:
        total_results = int(parsed.feed.get("opensearch_totalresults", len(entries)))
    except (TypeError, ValueError):
        total_results = len(entries)

    papers = [_parse_entry(e) for e in entries]
    return _build_response(
        papers,
        total_results=total_results,
        start=params.start,
        response_format=params.response_format,
        query_label=params.query,
    )


@mcp.tool(
    name="arxiv_get_paper",
    annotations={
        "title": "Get arXiv Papers by ID",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    },
)
async def arxiv_get_paper(params: GetPaperInput) -> str:
    """Retrieve metadata for specific arXiv papers by their identifiers.

    Fetches full metadata (title, authors, abstract, categories, links,
    journal reference, DOI, comments) for one or more arXiv papers when you
    already know their IDs. Use this instead of arxiv_search_papers when you
    have identifiers in hand. To request a specific version, append the
    version suffix (e.g. "2101.00001v2"); omit it for the latest version.

    Args:
        params (GetPaperInput): Validated input containing:
            - ids (list[str]): arXiv identifiers. Modern ("2101.00001"),
              legacy ("hep-ex/0307015"), and versioned ("2101.00001v2") forms
              are accepted. A leading "http://arxiv.org/abs/" is stripped
              automatically.
            - response_format (ResponseFormat): markdown | json

    Returns:
        str: Same per-paper schema and formats as arxiv_search_papers. In JSON,
        an object with "count" and a "papers" array. In markdown, a
        human-readable rendering. On failure, a string beginning with "Error:".

    Examples:
        - "Get details for 2101.00001 and 1706.03762" ->
          ids=["2101.00001", "1706.03762"]
        - "Show version 1 of cond-mat/0207270" -> ids=["cond-mat/0207270v1"]
        - Don't use when you only have a topic or author (use
          arxiv_search_papers).

    Error Handling:
        - Pydantic validates inputs before the request is made.
        - A malformed id returns an "Error:" message from arXiv.
        - IDs that match no paper simply do not appear in the results; a note
          is added when fewer papers are returned than were requested.
    """
    request_params = {
        "id_list": ",".join(params.ids),
        "start": 0,
        "max_results": len(params.ids),
    }

    try:
        raw = await _make_api_request(request_params)
    except Exception as e:  # noqa: BLE001 - converted to friendly message
        return _handle_api_error(e)

    parsed = feedparser.parse(raw)

    error = _detect_feed_error(parsed)
    if error:
        return error

    entries = parsed.get("entries", [])
    if not entries:
        return f"No papers found for the given ids: {', '.join(params.ids)}."

    papers = [_parse_entry(e) for e in entries]
    label = ", ".join(params.ids)
    response = _build_response(
        papers,
        total_results=len(papers),
        start=0,
        response_format=params.response_format,
        query_label=f"id_list={label}",
    )

    if len(papers) < len(params.ids) and params.response_format == ResponseFormat.MARKDOWN:
        response += (
            f"\n\n_Note: requested {len(params.ids)} ids but received "
            f"{len(papers)} papers. Some ids may be incorrect or unavailable._"
        )
    return response


@mcp.tool(
    name="arxiv_get_full_text",
    annotations={
        "title": "Get arXiv Paper Full Text",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    },
)
async def arxiv_get_full_text(params: GetFullTextInput) -> str:
    """Retrieve the full text of a single arXiv paper, paged by character.

    Use this only when the abstract from arxiv_search_papers or
    arxiv_get_paper is not enough and you need the body of the paper. The
    text is fetched from arXiv's HTML rendering when available (cleanest),
    falling back to the ar5iv HTML conversion and then to text extracted from
    the PDF. Because papers are long, the text is returned in slices: read the
    paging metadata in the response and call again with the suggested
    'start_char' to continue.

    Args:
        params (GetFullTextInput): Validated input containing:
            - id (str): a single arXiv identifier (versioned forms allowed)
            - source (FullTextSource): 'auto' (default), 'html', or 'pdf'
            - start_char (int): character offset to start from (default 0)
            - max_chars (int): max characters per slice (default 25000)

    Returns:
        str: A markdown document beginning with a header that reports the
        source used, the character range returned (e.g. "0–25000 of 84210"),
        and—if more remains—the 'start_char' to use for the next call,
        followed by the text slice itself. On failure, a string beginning
        with "Error:".

    Examples:
        - "Read the methods section of 2101.00001" -> id="2101.00001", then
          page with start_char as needed.
        - "Get the PDF-extracted text of hep-ex/0307015" ->
          id="hep-ex/0307015", source="pdf"
        - Don't use to get the abstract only (use arxiv_get_paper).

    Error Handling:
        - Pydantic validates inputs before any request is made.
        - Returns an "Error:" message if no full text can be retrieved (e.g.
          the paper has no HTML and the PDF text could not be extracted), or
          if 'start_char' is past the end of the document.
    """
    arxiv_id = params.id
    result: Optional[tuple[str, str]] = None
    source_label = ""

    try:
        if params.source in (FullTextSource.AUTO, FullTextSource.HTML):
            result = await _try_html_text(arxiv_id)
            if result:
                source_label = "HTML"
        if result is None and params.source in (
            FullTextSource.AUTO,
            FullTextSource.PDF,
        ):
            result = await _try_pdf_text(arxiv_id)
            if result:
                source_label = "PDF"
    except Exception as e:  # noqa: BLE001 - converted to friendly message
        return _handle_api_error(e)

    if result is None:
        if params.source == FullTextSource.HTML:
            return (
                f"Error: No HTML full text available for arXiv:{arxiv_id}. "
                f"Try source='pdf' or source='auto'."
            )
        if params.source == FullTextSource.PDF:
            return (
                f"Error: Could not extract text from the PDF for "
                f"arXiv:{arxiv_id}. The PDF may be scanned/image-only. "
                f"Try source='html' or source='auto'."
            )
        return (
            f"Error: Could not retrieve full text for arXiv:{arxiv_id} from "
            f"HTML or PDF. Verify the id is correct (try arxiv_get_paper)."
        )

    text, source_url = result
    return _slice_full_text(
        text,
        start_char=params.start_char,
        max_chars=params.max_chars,
        source_label=source_label,
        source_url=source_url,
        arxiv_id=arxiv_id,
    )


def main() -> None:
    """Entry point for running the server over stdio."""
    mcp.run()


if __name__ == "__main__":
    main()
