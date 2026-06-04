#!/usr/bin/env python3
"""MCP server wrapping the Semantic Scholar Academic Graph API.

Exposes three tools:
  - academic_search:    search for papers by keyword/phrase
  - academic_get_paper: fetch full details for a single paper (by ID, DOI, or URL)
  - academic_recommend: find papers related to a given paper

Auth: Semantic Scholar's API is free for basic use (no key required).
An optional SEMANTIC_SCHOLAR_API_KEY env var raises rate limits.
"""

from __future__ import annotations

import json
import os
import time
from pathlib import Path
from typing import Any, Optional

import httpx
from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel, ConfigDict, Field, field_validator

# --- Constants ---------------------------------------------------------------

BASE_URL = "https://api.semanticscholar.org/graph/v1"
RECOMMEND_URL = "https://api.semanticscholar.org/recommendations/v1/papers"
CHARACTER_LIMIT = 25_000

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
DEFAULT_OUTPUT_DIR = PROJECT_ROOT / "output"

# Fields we request from the API (balances detail vs. response size)
SEARCH_FIELDS = ",".join([
    "title",
    "authors",
    "year",
    "abstract",
    "citationCount",
    "url",
    "externalIds",
    "publicationTypes",
    "journal",
])

DETAIL_FIELDS = ",".join([
    "title",
    "authors",
    "year",
    "abstract",
    "citationCount",
    "referenceCount",
    "influentialCitationCount",
    "url",
    "externalIds",
    "publicationTypes",
    "journal",
    "publicationDate",
    "fieldsOfStudy",
    "tldr",
])

# --- Server init -------------------------------------------------------------

mcp = FastMCP("academic_search_mcp")


def _get_headers() -> dict[str, str]:
    """Build request headers. Adds API key if available (raises rate limits)."""
    headers = {"Accept": "application/json"}
    key = os.environ.get("SEMANTIC_SCHOLAR_API_KEY")
    if key:
        headers["x-api-key"] = key
    return headers


def _truncate_if_huge(payload: str, hint: str) -> str:
    """Return payload as-is, or a truncation envelope if it exceeds the limit."""
    if len(payload) <= CHARACTER_LIMIT:
        return payload
    head = payload[: CHARACTER_LIMIT - 500]
    return (
        head
        + "\n\n...[truncated]...\n"
        + json.dumps(
            {
                "truncated": True,
                "original_length": len(payload),
                "guidance": hint,
            },
            indent=2,
        )
    )


# --- Input models ------------------------------------------------------------


class SearchInput(BaseModel):
    """Inputs for academic_search."""

    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True,
        extra="forbid",
    )

    query: str = Field(
        ...,
        description=(
            "Search query: keywords, a phrase, or a natural-language question "
            "(e.g., 'machine learning in higher education', "
            "'effects of sleep on memory consolidation'). "
            "Supports operators: \"exact phrase\", + (required term), "
            "- (exclude term), | (OR), term* (prefix), term~3 (fuzzy)."
        ),
        min_length=1,
        max_length=500,
    )
    limit: int = Field(
        default=10,
        description="Number of results to return (1-100). Default: 10.",
        ge=1,
        le=100,
    )
    year: Optional[str] = Field(
        default=None,
        description=(
            "Filter by publication year. Formats: '2024' (exact year), "
            "'2020-2024' (range), '2020-' (2020 onward), '-2020' (up to 2020)."
        ),
        max_length=20,
    )
    fields_of_study: Optional[str] = Field(
        default=None,
        description=(
            "Comma-separated fields of study to filter by "
            "(e.g., 'Computer Science', 'Education', 'Physics', 'Medicine'). "
            "See Semantic Scholar field taxonomy."
        ),
        max_length=200,
    )
    open_access_only: bool = Field(
        default=False,
        description="If true, return only open-access papers.",
    )
    save_results: bool = Field(
        default=False,
        description=(
            "If true, save the results as a markdown file in the output directory."
        ),
    )


class GetPaperInput(BaseModel):
    """Inputs for academic_get_paper."""

    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True,
        extra="forbid",
    )

    paper_id: str = Field(
        ...,
        description=(
            "Paper identifier. Accepts: Semantic Scholar ID, DOI (with 'DOI:' prefix), "
            "arXiv ID (with 'ARXIV:' prefix), ACL ID (with 'ACL:' prefix), "
            "PubMed ID (with 'PMID:' prefix), or a Semantic Scholar URL."
        ),
        min_length=1,
        max_length=500,
    )
    include_citations: bool = Field(
        default=False,
        description="If true, include the paper's top citing papers (up to 10).",
    )
    include_references: bool = Field(
        default=False,
        description="If true, include the paper's references (up to 10).",
    )


class RecommendInput(BaseModel):
    """Inputs for academic_recommend."""

    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True,
        extra="forbid",
    )

    paper_id: str = Field(
        ...,
        description=(
            "Paper identifier to find recommendations for. Same formats as "
            "academic_get_paper: Semantic Scholar ID, DOI: prefix, ARXIV: prefix, etc."
        ),
        min_length=1,
        max_length=500,
    )
    limit: int = Field(
        default=10,
        description="Number of recommendations to return (1-20). Default: 10.",
        ge=1,
        le=20,
    )


# --- Formatting helpers ------------------------------------------------------


def _format_authors(authors: list[dict]) -> str:
    """Format author list as a readable string."""
    names = [a.get("name", "Unknown") for a in authors[:5]]
    if len(authors) > 5:
        names.append(f"et al. ({len(authors)} total)")
    return ", ".join(names)


def _format_paper_markdown(paper: dict, index: Optional[int] = None) -> str:
    """Format a single paper as a markdown block."""
    prefix = f"### {index}. " if index is not None else "## "
    title = paper.get("title", "Untitled")
    authors = _format_authors(paper.get("authors", []))
    year = paper.get("year", "n.d.")
    citations = paper.get("citationCount", 0)
    abstract = paper.get("abstract") or "_No abstract available._"
    url = paper.get("url", "")

    # External IDs for easy lookup
    ext = paper.get("externalIds", {}) or {}
    doi = ext.get("DOI", "")
    arxiv = ext.get("ArXiv", "")

    ids_line = ""
    if doi:
        ids_line += f"  DOI: {doi}"
    if arxiv:
        ids_line += f"  arXiv: {arxiv}"

    journal_info = ""
    journal = paper.get("journal")
    if journal and journal.get("name"):
        journal_info = f"  Journal: {journal['name']}"
        if journal.get("volume"):
            journal_info += f", vol. {journal['volume']}"

    lines = [
        f"{prefix}{title}",
        f"**{authors}** ({year}) | {citations} citations",
    ]
    if journal_info:
        lines.append(journal_info)
    if ids_line:
        lines.append(ids_line)
    if url:
        lines.append(f"  {url}")
    lines.append("")
    lines.append(abstract)
    lines.append("")

    return "\n".join(lines)


def _format_search_results(papers: list[dict], query: str, total: int) -> str:
    """Format search results as markdown."""
    lines = [
        f"# Search results: \"{query}\"",
        f"Showing {len(papers)} of {total} results.",
        "",
    ]
    for i, paper in enumerate(papers, 1):
        lines.append(_format_paper_markdown(paper, index=i))
        lines.append("---")
        lines.append("")
    return "\n".join(lines)


# --- Tools -------------------------------------------------------------------


@mcp.tool(
    name="academic_search",
    annotations={
        "title": "Search Academic Papers",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    },
)
async def academic_search(params: SearchInput) -> str:
    """Search for academic papers by keyword, phrase, or question.

    Queries the Semantic Scholar Academic Graph API and returns
    matching papers with titles, authors, year, citation counts,
    and abstracts. Results are formatted as readable markdown.

    Args:
        params: SearchInput
            - query (str): search keywords or phrase.
            - limit (int): number of results, 1-20. Default 10.
            - year (str | None): year filter ('2024', '2020-2024', '2020-').
            - fields_of_study (str | None): e.g. 'Computer Science,Education'.
            - open_access_only (bool): restrict to open-access papers.
            - save_results (bool): save results as markdown file.

    Returns:
        Markdown-formatted search results with paper details.

    When to use:
      - "Find papers about X" -> use this tool.
      - "What's the recent literature on Y?" -> use this with year filter.
      - "Search for open-access papers on Z" -> set open_access_only=True.

    When NOT to use:
      - To get details on a specific known paper -> use academic_get_paper.
      - To find papers similar to one you already have -> use academic_recommend.
    """
    try:
        api_params: dict[str, Any] = {
            "query": params.query,
            "limit": params.limit,
            "fields": SEARCH_FIELDS,
        }
        if params.year:
            api_params["year"] = params.year
        if params.fields_of_study:
            api_params["fieldsOfStudy"] = params.fields_of_study
        if params.open_access_only:
            api_params["openAccessPdf"] = ""

        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(
                f"{BASE_URL}/paper/search/bulk",
                params=api_params,
                headers=_get_headers(),
            )
            resp.raise_for_status()
            data = resp.json()

        papers = data.get("data", [])
        total = data.get("total", len(papers))
        # Bulk endpoint may return more than requested; trim to limit
        papers = papers[:params.limit]

        if not papers:
            return f"No results found for \"{params.query}\". Try broader keywords or remove filters."

        result = _format_search_results(papers, params.query, total)

        if params.save_results:
            out_dir = DEFAULT_OUTPUT_DIR
            out_dir.mkdir(parents=True, exist_ok=True)
            slug = params.query[:40].replace(" ", "-").lower()
            slug = "".join(c for c in slug if c.isalnum() or c == "-")
            filename = f"search-{slug}-{int(time.time())}.md"
            path = out_dir / filename
            path.write_text(result, encoding="utf-8")
            result += f"\n\n_Results saved to `{path}`._"

        return _truncate_if_huge(
            result,
            "Reduce the limit parameter to get fewer results.",
        )

    except httpx.HTTPStatusError as e:
        if e.response.status_code == 429:
            return (
                "Error: rate limited by Semantic Scholar. Wait a moment and retry. "
                "For higher limits, set SEMANTIC_SCHOLAR_API_KEY."
            )
        return f"Error: Semantic Scholar API returned {e.response.status_code}: {e.response.text[:500]}"
    except Exception as e:
        return f"Error: {type(e).__name__}: {e}"


@mcp.tool(
    name="academic_get_paper",
    annotations={
        "title": "Get Paper Details",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    },
)
async def academic_get_paper(params: GetPaperInput) -> str:
    """Fetch detailed information about a specific academic paper.

    Looks up a paper by its Semantic Scholar ID, DOI, arXiv ID, or other
    identifier. Returns full metadata including abstract, citation counts,
    fields of study, and optionally its top citations and references.

    Args:
        params: GetPaperInput
            - paper_id (str): identifier (e.g., 'DOI:10.1234/example',
              'ARXIV:2301.00001', or a Semantic Scholar paper ID).
            - include_citations (bool): include up to 10 citing papers.
            - include_references (bool): include up to 10 referenced papers.

    Returns:
        Markdown-formatted paper details.

    When to use:
      - "Tell me about this paper: [DOI]" -> use this tool.
      - "What does paper X cite?" -> set include_references=True.
      - "Who cites paper X?" -> set include_citations=True.

    When NOT to use:
      - To search for papers by topic -> use academic_search.
      - To find related papers -> use academic_recommend.
    """
    try:
        fields = DETAIL_FIELDS
        if params.include_citations:
            fields += ",citations"
        if params.include_references:
            fields += ",references"

        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(
                f"{BASE_URL}/paper/{params.paper_id}",
                params={"fields": fields},
                headers=_get_headers(),
            )
            resp.raise_for_status()
            paper = resp.json()

        # Build detailed markdown
        title = paper.get("title", "Untitled")
        authors = _format_authors(paper.get("authors", []))
        year = paper.get("year", "n.d.")
        pub_date = paper.get("publicationDate", "")
        citations = paper.get("citationCount", 0)
        references = paper.get("referenceCount", 0)
        influential = paper.get("influentialCitationCount", 0)
        abstract = paper.get("abstract") or "_No abstract available._"
        url = paper.get("url", "")
        fields_of_study = paper.get("fieldsOfStudy") or []
        tldr = paper.get("tldr")

        ext = paper.get("externalIds", {}) or {}
        doi = ext.get("DOI", "")
        arxiv = ext.get("ArXiv", "")

        journal = paper.get("journal")
        journal_name = journal.get("name", "") if journal else ""

        lines = [
            f"# {title}",
            "",
            f"**{authors}** ({year})",
            "",
            "## Metadata",
            f"- **Published:** {pub_date or year}",
        ]
        if journal_name:
            lines.append(f"- **Journal:** {journal_name}")
        lines.extend([
            f"- **Citations:** {citations} ({influential} influential)",
            f"- **References:** {references}",
        ])
        if fields_of_study:
            lines.append(f"- **Fields:** {', '.join(fields_of_study)}")
        if doi:
            lines.append(f"- **DOI:** {doi}")
        if arxiv:
            lines.append(f"- **arXiv:** {arxiv}")
        if url:
            lines.append(f"- **URL:** {url}")

        if tldr and tldr.get("text"):
            lines.extend(["", "## TL;DR", tldr["text"]])

        lines.extend(["", "## Abstract", abstract])

        # Citations
        if params.include_citations and paper.get("citations"):
            cites = [c for c in paper["citations"] if c and c.get("title")][:10]
            if cites:
                lines.extend(["", "## Citing papers"])
                for i, c in enumerate(cites, 1):
                    c_authors = _format_authors(c.get("authors", []))
                    c_year = c.get("year", "n.d.")
                    lines.append(f"{i}. **{c['title']}** -- {c_authors} ({c_year})")

        # References
        if params.include_references and paper.get("references"):
            refs = [r for r in paper["references"] if r and r.get("title")][:10]
            if refs:
                lines.extend(["", "## References"])
                for i, r in enumerate(refs, 1):
                    r_authors = _format_authors(r.get("authors", []))
                    r_year = r.get("year", "n.d.")
                    lines.append(f"{i}. **{r['title']}** -- {r_authors} ({r_year})")

        return _truncate_if_huge(
            "\n".join(lines),
            "Omit include_citations and include_references for a smaller response.",
        )

    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            return (
                f"Error: paper not found for identifier '{params.paper_id}'. "
                "Check the ID format. DOIs need the 'DOI:' prefix, "
                "arXiv IDs need 'ARXIV:', etc."
            )
        if e.response.status_code == 429:
            return "Error: rate limited. Wait a moment and retry."
        return f"Error: API returned {e.response.status_code}: {e.response.text[:500]}"
    except Exception as e:
        return f"Error: {type(e).__name__}: {e}"


@mcp.tool(
    name="academic_recommend",
    annotations={
        "title": "Find Related Papers",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    },
)
async def academic_recommend(params: RecommendInput) -> str:
    """Find papers related to a given paper using Semantic Scholar recommendations.

    Given a paper ID, returns a list of recommended papers based on
    citation patterns and content similarity. Useful for literature
    reviews and discovering related work.

    Args:
        params: RecommendInput
            - paper_id (str): identifier of the seed paper.
            - limit (int): number of recommendations, 1-20. Default 10.

    Returns:
        Markdown-formatted list of recommended papers.

    When to use:
      - "Find papers related to X" -> use this tool.
      - "What should I read next after this paper?" -> use this tool.
      - "Build a reading list around this paper" -> use this tool.

    When NOT to use:
      - To search by topic keywords -> use academic_search.
      - To get details on a known paper -> use academic_get_paper.
    """
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                RECOMMEND_URL,
                json={"positivePaperIds": [params.paper_id]},
                params={
                    "fields": SEARCH_FIELDS,
                    "limit": params.limit,
                },
                headers=_get_headers(),
            )
            resp.raise_for_status()
            data = resp.json()

        papers = data.get("recommendedPapers", [])

        if not papers:
            return (
                f"No recommendations found for paper '{params.paper_id}'. "
                "The paper may be too new or too niche for the recommendation engine."
            )

        lines = [
            f"# Recommended papers",
            f"Related to paper: {params.paper_id}",
            f"Showing {len(papers)} recommendations.",
            "",
        ]
        for i, paper in enumerate(papers, 1):
            lines.append(_format_paper_markdown(paper, index=i))
            lines.append("---")
            lines.append("")

        return _truncate_if_huge(
            "\n".join(lines),
            "Reduce the limit parameter for fewer results.",
        )

    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            return (
                f"Error: paper not found for '{params.paper_id}'. "
                "Check the ID. DOIs need 'DOI:' prefix, arXiv needs 'ARXIV:' prefix."
            )
        if e.response.status_code == 429:
            return "Error: rate limited. Wait a moment and retry."
        return f"Error: API returned {e.response.status_code}: {e.response.text[:500]}"
    except Exception as e:
        return f"Error: {type(e).__name__}: {e}"


# --- Entrypoint --------------------------------------------------------------

if __name__ == "__main__":
    mcp.run()
