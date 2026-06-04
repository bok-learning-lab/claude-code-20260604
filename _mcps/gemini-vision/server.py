#!/usr/bin/env python3
'''
MCP Server for the Google Gemini vision API.

Wraps the Gemini `generateContent` REST endpoint to let an agent reason about
images: caption them, ask free-form questions, transcribe text (OCR), and pull
structured JSON out of them. Images may be supplied as a local file path or an
http(s) URL.

Configuration (environment variables):
  GEMINI_API_KEY   (required) Google AI Studio API key.
  GEMINI_MODEL     (optional) Model name. Default: "gemini-3.5-flash".

The server talks to:
  https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
'''

import base64
import json
import mimetypes
import os
from enum import Enum
from pathlib import Path
from typing import Any, Optional

import httpx
from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel, ConfigDict, Field, field_validator

# ---------------------------------------------------------------------------
# Configuration & constants
# ---------------------------------------------------------------------------

mcp = FastMCP("gemini_vision_mcp")

API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta"
DEFAULT_MODEL = "gemini-3.5-flash"
REQUEST_TIMEOUT = 90.0  # seconds; vision calls can be slow
CHARACTER_LIMIT = 25000  # max characters returned to the agent
MAX_IMAGE_BYTES = 18 * 1024 * 1024  # inline_data ceiling (~20MB request budget)

# Extensions the Gemini API accepts as inline image data.
SUPPORTED_IMAGE_MIME = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".heic": "image/heic",
    ".heif": "image/heif",
    ".gif": "image/gif",
}


def _model() -> str:
    '''Resolve the configured model name at call time (not import time).'''
    return os.environ.get("GEMINI_MODEL", DEFAULT_MODEL).strip() or DEFAULT_MODEL


# ---------------------------------------------------------------------------
# Shared input pieces
# ---------------------------------------------------------------------------


class ResponseFormat(str, Enum):
    '''Output format for tool responses.'''
    MARKDOWN = "markdown"
    JSON = "json"


class _ImageInputMixin(BaseModel):
    '''Common config + the image-source field shared by every tool.'''
    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True,
        extra="forbid",
    )

    image: str = Field(
        ...,
        description=(
            "The image to analyze, given as EITHER a local filesystem path "
            "(absolute is safest, e.g. '/Users/me/photos/recipe.jpg') OR an "
            "http(s) URL (e.g. 'https://example.com/chart.png'). Supported "
            "formats: png, jpeg, webp, heic, heif, gif."
        ),
        min_length=1,
        max_length=4096,
    )


# ---------------------------------------------------------------------------
# Image loading
# ---------------------------------------------------------------------------


class ImageLoadError(Exception):
    '''Raised when an image source cannot be read or is unsupported.'''


def _mime_for_path(path: Path) -> str:
    ext = path.suffix.lower()
    if ext in SUPPORTED_IMAGE_MIME:
        return SUPPORTED_IMAGE_MIME[ext]
    guessed, _ = mimetypes.guess_type(str(path))
    if guessed and guessed.startswith("image/"):
        return guessed
    raise ImageLoadError(
        f"Unsupported or unknown image type for '{path.name}'. "
        f"Supported extensions: {', '.join(sorted(SUPPORTED_IMAGE_MIME))}."
    )


async def _load_image(source: str) -> tuple[str, str]:
    '''Read an image from a path or URL into (base64_data, mime_type).

    Raises ImageLoadError with an actionable message on any failure.
    '''
    if source.startswith(("http://", "https://")):
        try:
            async with httpx.AsyncClient(follow_redirects=True) as client:
                resp = await client.get(source, timeout=REQUEST_TIMEOUT)
                resp.raise_for_status()
        except httpx.HTTPStatusError as e:
            raise ImageLoadError(
                f"Could not download image (HTTP {e.response.status_code}). "
                f"Check the URL is public and correct: {source}"
            ) from e
        except httpx.HTTPError as e:
            raise ImageLoadError(f"Network error fetching image URL: {e}") from e

        raw = resp.content
        mime = resp.headers.get("content-type", "").split(";")[0].strip()
        if not mime.startswith("image/"):
            # Fall back to URL extension.
            mime = _mime_for_path(Path(source.split("?")[0]))
    else:
        path = Path(source).expanduser()
        if not path.exists():
            raise ImageLoadError(
                f"No file found at '{source}'. Provide an absolute path, or a "
                f"public http(s) URL."
            )
        if not path.is_file():
            raise ImageLoadError(f"'{source}' is a directory, not an image file.")
        mime = _mime_for_path(path)
        raw = path.read_bytes()

    if len(raw) > MAX_IMAGE_BYTES:
        raise ImageLoadError(
            f"Image is {len(raw) // (1024 * 1024)}MB, over the "
            f"{MAX_IMAGE_BYTES // (1024 * 1024)}MB inline limit. Resize or "
            f"compress it before analyzing."
        )
    return base64.b64encode(raw).decode("ascii"), mime


# ---------------------------------------------------------------------------
# Gemini API call
# ---------------------------------------------------------------------------


class GeminiError(Exception):
    '''Raised when the Gemini API returns an error or unusable response.'''


async def _call_gemini(
    prompt: str,
    image_b64: str,
    mime_type: str,
    generation_config: Optional[dict[str, Any]] = None,
) -> str:
    '''Send one prompt + one image to Gemini and return the model's text.

    Raises GeminiError with an actionable message on failure.
    '''
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise GeminiError(
            "GEMINI_API_KEY is not set. Add it to the server's env block in "
            ".mcp.json (get a key at https://aistudio.google.com/apikey)."
        )

    url = f"{API_BASE_URL}/models/{_model()}:generateContent"
    body: dict[str, Any] = {
        "contents": [
            {
                "parts": [
                    {"text": prompt},
                    {"inline_data": {"mime_type": mime_type, "data": image_b64}},
                ]
            }
        ]
    }
    if generation_config:
        body["generationConfig"] = generation_config

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                url,
                headers={
                    "x-goog-api-key": api_key,
                    "Content-Type": "application/json",
                },
                json=body,
                timeout=REQUEST_TIMEOUT,
            )
            resp.raise_for_status()
    except httpx.HTTPStatusError as e:
        raise GeminiError(_explain_http_error(e)) from e
    except httpx.TimeoutException as e:
        raise GeminiError(
            "Gemini request timed out. The image may be large or the service "
            "busy — try again."
        ) from e
    except httpx.HTTPError as e:
        raise GeminiError(f"Network error calling Gemini: {e}") from e

    return _extract_text(resp.json())


def _explain_http_error(e: httpx.HTTPStatusError) -> str:
    code = e.response.status_code
    try:
        detail = e.response.json().get("error", {}).get("message", "")
    except Exception:
        detail = e.response.text[:300]
    hints = {
        400: "Bad request (often a malformed image or unsupported model). ",
        403: "Permission denied — the API key may be invalid or lack access. ",
        404: f"Model '{_model()}' not found. Set GEMINI_MODEL to a valid name. ",
        429: "Rate limit / quota exceeded. Wait and retry, or check billing. ",
    }
    prefix = hints.get(code, f"Gemini API error (HTTP {code}). ")
    return f"{prefix}{detail}".strip()


def _extract_text(payload: dict[str, Any]) -> str:
    '''Pull the text out of a generateContent response, or explain why none.'''
    candidates = payload.get("candidates") or []
    if not candidates:
        block = payload.get("promptFeedback", {}).get("blockReason")
        if block:
            raise GeminiError(
                f"Gemini blocked the request (reason: {block}). Try a different "
                f"image or rephrase the prompt."
            )
        raise GeminiError("Gemini returned no candidates.")

    first = candidates[0]
    parts = first.get("content", {}).get("parts") or []
    text = "".join(p.get("text", "") for p in parts).strip()
    if not text:
        reason = first.get("finishReason", "unknown")
        raise GeminiError(
            f"Gemini returned an empty response (finishReason: {reason})."
        )
    return text


def _truncate(text: str) -> str:
    '''Cap a text response at CHARACTER_LIMIT with a clear notice.'''
    if len(text) <= CHARACTER_LIMIT:
        return text
    keep = CHARACTER_LIMIT - 200
    return (
        text[:keep]
        + f"\n\n[... truncated {len(text) - keep} characters. The full response "
        f"exceeded the {CHARACTER_LIMIT}-character limit. Ask a narrower "
        f"question to get a complete answer.]"
    )


# ---------------------------------------------------------------------------
# Tool: describe / caption
# ---------------------------------------------------------------------------


class DescribeImageInput(_ImageInputMixin):
    '''Input for gemini_describe_image.'''

    detail: str = Field(
        default="standard",
        description=(
            "Level of detail: 'brief' (one or two sentences), 'standard' (a "
            "short paragraph), or 'detailed' (a thorough, structured "
            "description covering subjects, setting, text, and notable detail)."
        ),
        pattern="^(brief|standard|detailed)$",
    )


_DESCRIBE_PROMPTS = {
    "brief": "Describe this image in one or two clear sentences.",
    "standard": (
        "Describe this image in a short, informative paragraph. Cover the main "
        "subjects, the setting, and anything notable."
    ),
    "detailed": (
        "Give a thorough description of this image. Cover: (1) the main "
        "subjects and what they are doing, (2) the setting and background, "
        "(3) any visible text, labels, or numbers (quote them), (4) colors, "
        "style, and mood, and (5) anything unusual or noteworthy. Use clear "
        "prose or short sections."
    ),
}


@mcp.tool(
    name="gemini_describe_image",
    annotations={
        "title": "Describe an image with Gemini",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    },
)
async def gemini_describe_image(params: DescribeImageInput) -> str:
    '''Generate a natural-language description / caption of an image.

    Use this when you want a general account of what an image shows and you do
    NOT have a specific question. For a targeted question use
    gemini_ask_image; to transcribe text use gemini_extract_text; to pull
    structured data use gemini_extract_structured.

    Args:
        params (DescribeImageInput):
            - image (str): Local file path or http(s) URL to the image.
            - detail (str): 'brief' | 'standard' | 'detailed' (default 'standard').

    Returns:
        str: The description as plain text (markdown-friendly), or a message
        beginning with "Error:" if the image could not be loaded or the API
        call failed.
    '''
    try:
        image_b64, mime = await _load_image(params.image)
        text = await _call_gemini(
            _DESCRIBE_PROMPTS[params.detail],
            image_b64,
            mime,
            generation_config={"temperature": 0.4},
        )
        return _truncate(text)
    except (ImageLoadError, GeminiError) as e:
        return f"Error: {e}"


# ---------------------------------------------------------------------------
# Tool: ask (VQA)
# ---------------------------------------------------------------------------


class AskImageInput(_ImageInputMixin):
    '''Input for gemini_ask_image.'''

    question: str = Field(
        ...,
        description=(
            "A free-form question about the image, e.g. 'How many people are "
            "wearing hats?', 'What does the sign say?', 'Is this safe to eat?'"
        ),
        min_length=1,
        max_length=2000,
    )

    @field_validator("question")
    @classmethod
    def _non_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("question cannot be empty")
        return v


@mcp.tool(
    name="gemini_ask_image",
    annotations={
        "title": "Ask a question about an image with Gemini",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    },
)
async def gemini_ask_image(params: AskImageInput) -> str:
    '''Answer a specific, free-form question about an image (visual Q&A).

    This is the most flexible tool: use it whenever you have a concrete
    question about an image's content. For an open-ended description use
    gemini_describe_image instead.

    Args:
        params (AskImageInput):
            - image (str): Local file path or http(s) URL to the image.
            - question (str): The question to answer about the image.

    Returns:
        str: The model's answer as plain text, or a message beginning with
        "Error:" on failure.
    '''
    try:
        image_b64, mime = await _load_image(params.image)
        prompt = (
            f"Answer this question about the image as accurately as you can. "
            f"If the image does not contain enough information to answer, say "
            f"so plainly.\n\nQuestion: {params.question}"
        )
        text = await _call_gemini(
            prompt, image_b64, mime, generation_config={"temperature": 0.2}
        )
        return _truncate(text)
    except (ImageLoadError, GeminiError) as e:
        return f"Error: {e}"


# ---------------------------------------------------------------------------
# Tool: extract text (OCR)
# ---------------------------------------------------------------------------


@mcp.tool(
    name="gemini_extract_text",
    annotations={
        "title": "Extract text (OCR) from an image with Gemini",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    },
)
async def gemini_extract_text(params: _ImageInputMixin) -> str:
    '''Transcribe the readable text in an image, verbatim (OCR).

    Use this to read handwritten notes, recipe cards, signs, screenshots,
    documents, or any image whose value is its text. Returns the text only,
    preserving reading order and line breaks as best the model can.

    Args:
        params (_ImageInputMixin):
            - image (str): Local file path or http(s) URL to the image.

    Returns:
        str: The transcribed text, or "No readable text found in the image." if
        there is none, or a message beginning with "Error:" on failure.
    '''
    try:
        image_b64, mime = await _load_image(params.image)
        prompt = (
            "Transcribe ALL readable text in this image verbatim. Preserve the "
            "reading order and line breaks. Do not add commentary, headings, or "
            "explanation — output only the transcribed text. If there is no "
            "readable text, reply exactly: NO_TEXT"
        )
        text = await _call_gemini(
            prompt, image_b64, mime, generation_config={"temperature": 0.0}
        )
        if text.strip() == "NO_TEXT":
            return "No readable text found in the image."
        return _truncate(text)
    except (ImageLoadError, GeminiError) as e:
        return f"Error: {e}"


# ---------------------------------------------------------------------------
# Tool: structured extraction
# ---------------------------------------------------------------------------


class ExtractStructuredInput(_ImageInputMixin):
    '''Input for gemini_extract_structured.'''

    instructions: str = Field(
        ...,
        description=(
            "What to extract, in plain language, e.g. 'Extract the recipe as "
            "{title, ingredients[], steps[]}' or 'List every product name and "
            "its price'."
        ),
        min_length=1,
        max_length=2000,
    )
    json_schema: Optional[dict[str, Any]] = Field(
        default=None,
        description=(
            "Optional OpenAPI-style JSON schema describing the exact output "
            "shape (e.g. {'type':'object','properties':{...}}). When provided, "
            "Gemini is constrained to return JSON matching it. Omit to let the "
            "model choose a reasonable shape from the instructions."
        ),
    )

    @field_validator("instructions")
    @classmethod
    def _non_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("instructions cannot be empty")
        return v


@mcp.tool(
    name="gemini_extract_structured",
    annotations={
        "title": "Extract structured JSON from an image with Gemini",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    },
)
async def gemini_extract_structured(params: ExtractStructuredInput) -> str:
    '''Extract structured JSON data from an image per instructions/schema.

    Use this when you need machine-readable data rather than prose: turning a
    recipe card into {title, ingredients, steps}, a receipt into line items, a
    chart into series, etc. Provide a json_schema to pin the exact shape.

    Args:
        params (ExtractStructuredInput):
            - image (str): Local file path or http(s) URL to the image.
            - instructions (str): What to extract, in plain language.
            - json_schema (dict, optional): OpenAPI-style schema to constrain
              the output shape.

    Returns:
        str: Pretty-printed JSON matching the request. On failure, a message
        beginning with "Error:". If the model returns non-JSON despite the
        request, the raw text is returned with an explanatory note.
    '''
    try:
        image_b64, mime = await _load_image(params.image)
        gen_config: dict[str, Any] = {
            "temperature": 0.0,
            "responseMimeType": "application/json",
        }
        if params.json_schema:
            gen_config["responseSchema"] = params.json_schema

        prompt = (
            "Extract data from the image according to these instructions and "
            "return ONLY valid JSON (no markdown fences, no prose).\n\n"
            f"Instructions: {params.instructions}"
        )
        text = await _call_gemini(prompt, image_b64, mime, generation_config=gen_config)

        # Gemini with responseMimeType=application/json returns raw JSON, but be
        # defensive: strip stray code fences and re-pretty-print when possible.
        cleaned = text.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.strip("`")
            if cleaned.lower().startswith("json"):
                cleaned = cleaned[4:]
            cleaned = cleaned.strip()
        try:
            parsed = json.loads(cleaned)
            return _truncate(json.dumps(parsed, indent=2, ensure_ascii=False))
        except json.JSONDecodeError:
            return _truncate(
                "Note: Gemini did not return valid JSON. Raw response:\n\n" + text
            )
    except (ImageLoadError, GeminiError) as e:
        return f"Error: {e}"


if __name__ == "__main__":
    mcp.run()
