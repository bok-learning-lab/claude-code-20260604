# Gemini Vision MCP

A small [MCP](https://modelcontextprotocol.io) server that wraps the Google
Gemini `generateContent` vision API so an agent can reason about images.

## Tools

| Tool | What it does |
| --- | --- |
| `gemini_describe_image` | Natural-language caption/description (`brief`/`standard`/`detailed`). |
| `gemini_ask_image` | Answer a free-form question about an image (visual Q&A). |
| `gemini_extract_text` | Transcribe readable text in an image, verbatim (OCR). |
| `gemini_extract_structured` | Extract structured JSON, optionally constrained by a schema. |

Every tool takes an `image` that is **either a local file path or an http(s)
URL**. Supported formats: png, jpeg, webp, heic, heif, gif.

## Setup

1. Get an API key at https://aistudio.google.com/apikey
2. The Python venv is already created (`.venv/`). To recreate it:
   ```bash
   python3 -m venv .venv
   ./.venv/bin/python -m pip install -r requirements.txt
   ```
3. Register the server with Claude Code via `/.mcp.json` in the repo root
   (already scaffolded — paste your key into `GEMINI_API_KEY`). That file is
   **gitignored** because it holds the key.

## Configuration (env vars)

| Variable | Required | Default | Notes |
| --- | --- | --- | --- |
| `GEMINI_API_KEY` | yes | — | Google AI Studio key. |
| `GEMINI_MODEL` | no | `gemini-3.5-flash` | Any vision-capable Gemini model. |

## Reference

- Image understanding: https://ai.google.dev/gemini-api/docs/image-understanding
- Models: https://ai.google.dev/gemini-api/docs/models
- generateContent API: https://ai.google.dev/api/generate-content
