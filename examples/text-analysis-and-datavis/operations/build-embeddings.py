"""Embed every paragraph of the five Calvino memos with OpenAI, project to 2D
with UMAP, and write the result to apps/mw-project-002/src/data/embeddings.json.

The browser then renders an SVG scatter plot of these points and projects the
user's draft paragraphs into the same 2D space at runtime via k-NN weighted
centroid (so we don't have to ship UMAP to the browser).
"""
from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path

import numpy as np
import umap
from dotenv import load_dotenv
from google import genai
from google.genai import types

REPO_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(REPO_ROOT / "apps" / "mw-project-002" / ".env")

API_KEY = os.environ.get("GEMINI_API_KEY")
if not API_KEY:
    sys.exit("Need GEMINI_API_KEY in .env")

MEMO_DIR = REPO_ROOT / "_context" / "mw-memos"
OUT_FILE = REPO_ROOT / "apps" / "mw-project-002" / "src" / "data" / "embeddings.json"

MEMOS = [
    ("lightness", "1-lightness/lightness.md"),
    ("quickness", "2-quickness/quickness.md"),
    ("exactitude", "3-exactitude/exactitude.md"),
    ("visibility", "4-visibility/visibility.md"),
    ("multiplicity", "5-multiplicity/multiplicity.md"),
]

EMBED_MODEL = "gemini-embedding-001"
EMBED_DIMS = 256  # request a small dimensionality to keep the JSON shippable

MIN_PARAGRAPH_WORDS = 20  # skip very short paragraphs (block-quote tails, etc.)


def split_paragraphs(text: str) -> list[str]:
    text = re.sub(r"^#\s+\w+\s*\n+", "", text)  # strip H1
    raw = re.split(r"\n\s*\n", text)
    paras = []
    for p in raw:
        cleaned = " ".join(p.split())
        if len(cleaned.split()) >= MIN_PARAGRAPH_WORDS:
            paras.append(cleaned)
    return paras


def main() -> None:
    client = genai.Client(api_key=API_KEY)

    items: list[dict] = []  # {memo, text}
    for key, rel in MEMOS:
        text = (MEMO_DIR / rel).read_text()
        for p in split_paragraphs(text):
            items.append({"memo": key, "text": p})

    print(f"Embedding {len(items)} paragraphs across 5 memos with {EMBED_MODEL}...")

    # Gemini embedding API: one paragraph per call (or small batches via list).
    # The Python SDK accepts a list under `contents`.
    BATCH = 32
    vectors: list[list[float]] = []
    for i in range(0, len(items), BATCH):
        batch = items[i : i + BATCH]
        resp = client.models.embed_content(
            model=EMBED_MODEL,
            contents=[it["text"] for it in batch],
            config=types.EmbedContentConfig(
                task_type="SEMANTIC_SIMILARITY",
                output_dimensionality=EMBED_DIMS,
            ),
        )
        vectors.extend([list(e.values) for e in resp.embeddings])
        print(f"  embedded {min(i + BATCH, len(items))}/{len(items)}")

    arr = np.array(vectors, dtype=np.float32)
    print(f"Embeddings shape: {arr.shape}")

    # UMAP to 2D
    print("Running UMAP...")
    reducer = umap.UMAP(
        n_neighbors=15,
        min_dist=0.15,
        metric="cosine",
        random_state=42,
    )
    coords = reducer.fit_transform(arr)
    print(f"Coords shape: {coords.shape}")

    # Normalise to [0, 1]
    xs = coords[:, 0]
    ys = coords[:, 1]
    xs = (xs - xs.min()) / (xs.max() - xs.min() + 1e-9)
    ys = (ys - ys.min()) / (ys.max() - ys.min() + 1e-9)

    points = []
    for it, x, y, vec in zip(items, xs, ys, vectors):
        points.append({
            "memo": it["memo"],
            "text": it["text"],
            "x": float(x),
            "y": float(y),
            "vec": vec,  # kept for k-NN projection in browser
        })

    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUT_FILE.write_text(json.dumps({
        "model": EMBED_MODEL,
        "dims": EMBED_DIMS,
        "count": len(points),
        "points": points,
    }))
    size_kb = OUT_FILE.stat().st_size // 1024
    print(f"\nWrote {OUT_FILE} ({size_kb} KB, {len(points)} points)")


if __name__ == "__main__":
    main()
