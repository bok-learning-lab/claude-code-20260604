# Operation — Embedding map (semantic neighborhood as the second analysis)

*The second analysis on the [`/memos`](https://a-project-on-calvino-interface-3kqu.vercel.app/memos) page, and the more architecturally interesting of the two. Every paragraph of Calvino's five memos is embedded with `gemini-embedding-001` and UMAP-projected to 2D — once, offline, by [`build-embeddings.py`](build-embeddings.py). The browser renders the 2D scatter and projects the student's draft paragraphs into the same space at runtime via k-NN weighted centroid (so UMAP doesn't have to ship to the browser). The student writes paragraphs; the dots appear where they belong.*

---

## The pipeline at a glance

```
inputs/memos/{lightness,quickness,exactitude,visibility,multiplicity}.md
        │
        │  build-embeddings.py  (offline, ~3 min on a laptop)
        │  ├─ split into paragraphs (filter < 20 words)
        │  ├─ embed each paragraph with gemini-embedding-001 (256 dims)
        │  ├─ UMAP-reduce to 2D (n_neighbors=15, min_dist=0.15, cosine)
        │  ├─ normalize x and y to [0, 1]
        │  └─ write apps/mw-project-002/src/data/embeddings.json
        ▼
embeddings.json: { model, dims, count, points: [{memo, text, x, y, vec}, ...] }
        │
        │  Imported by EmbeddingMap.jsx in the browser bundle
        ▼
Static scatter plot (~600 SVG <circle> elements, color-coded by memo)
        ▲
        │  When the student types into the draft composer:
        │  ├─ Split user text into paragraphs
        │  ├─ For each paragraph: POST to /api/embed → Gemini → 256-dim vec
        │  └─ projectKNN(userVec, points, k=8) → (x, y) in [0, 1]
        │
Live user dots placed in the same 2D space
```

## Why offline-once + live-projection (not live-everything)

If the page embedded *Calvino's* paragraphs at request time too, every load would burn 600 API calls (one per Calvino paragraph) before anything could render. That's the wrong trade — Calvino's paragraphs don't change. So:

- **The Calvino corpus is embedded once, offline, and the result is checked into the repo.** `embeddings.json` is ~5 MB (with the 256-dim vectors retained alongside the 2D coordinates — the vectors are needed for the live k-NN projection, not just for the scatter plot). Shipped in the JS bundle, decoded once, kept in memory.
- **The student's paragraphs are embedded live, one at a time, server-side.** A Vercel serverless function ([`embed-api-proxy.js`](embed-api-proxy.js)) takes a `{text}` POST and returns the Gemini embedding. The API key stays in `process.env` server-side; the browser never sees it.
- **The student's paragraphs are projected into the 2D space client-side via k-NN weighted centroid.** This is the move that lets us avoid shipping UMAP to the browser.

## Why k-NN weighted centroid (and not running UMAP in the browser)

UMAP is a stochastic, non-parametric dimensionality reduction. There is no `umap.transform(new_point)` that gives you a deterministic placement for a single new vector — UMAP is fundamentally a *manifold-learning* algorithm that needs the full neighbor graph to place a point.

So the page approximates the right answer instead of producing it directly:

```javascript
function projectKNN(userVec, points, k = 8) {
  const sims = points.map((p, i) => ({ i, s: cosine(userVec, p.vec) }))
  sims.sort((a, b) => b.s - a.s)
  const top = sims.slice(0, k)
  // Soften: subtract the worst-of-top so weights are positive but proportional
  const minS = top[top.length - 1].s
  let xw = 0, yw = 0, total = 0
  for (const { i, s } of top) {
    const w = Math.max(s - minS, 1e-3)
    xw += points[i].x * w
    yw += points[i].y * w
    total += w
  }
  return { x: xw / total, y: yw / total, neighbors: top.map(({ i }) => points[i]) }
}
```

The user vector is compared (cosine similarity) to all ~600 Calvino vectors. The top-8 are selected. The user's 2D position is the *weighted average* of those eight neighbors' 2D positions, where the weights are the cosine similarities (softened by subtracting the lowest-of-top so the weights are positive but proportional).

**The intuition:** if the user's vector is semantically close to a cluster of Calvino paragraphs about *quickness*, it will be drawn into the *quickness* cluster on the 2D map. If it's between two clusters, it lands between them. The placement isn't *exactly* where UMAP would have put it, but it's close — and it's deterministic, fast, and ships in the browser.

## Why Gemini specifically

Three reasons:

1. **`output_dimensionality` is tunable.** The default Gemini embedding is 3072 dims; the page requests 256. That keeps `embeddings.json` shippable (~5 MB vs. ~60 MB for the full-dim version) without measurably degrading the 2D projection — UMAP is already throwing away most of the variance anyway.

2. **`task_type: "SEMANTIC_SIMILARITY"`** is a Gemini-specific flag that asks the model for embeddings optimized for cosine-similarity comparison rather than retrieval. Since the page's downstream operation is cosine similarity (in the k-NN step), this is the right setting.

3. **The same embedding model is available offline (for `build-embeddings.py`) and online (via the `/api/embed` proxy).** Same model, same task type, same dimensionality, same normalization. The student's paragraph and Calvino's paragraphs are embedded the *same way*. Without that consistency, the k-NN distances would be meaningless.

## Why UMAP and not PCA / t-SNE

- **PCA** is linear — it can only project the existing variance. For a semantic space with non-linear structure (clusters separated by curving manifolds), PCA flattens the structure into noise. The 2D plot would not be readable.
- **t-SNE** is non-linear and preserves local structure beautifully but is famously *unstable* — small changes in the input produce large changes in the layout. Re-running the pipeline after adding a single new paragraph would produce a different map, which would break the page's promise that "where your dot lands" means anything across sessions.
- **UMAP** preserves both local and global structure better than t-SNE and is more stable under small perturbations. Critically: with `random_state=42`, the layout is deterministic. Re-running `build-embeddings.py` produces *the same map*. The student can come back tomorrow and see the same placements.

UMAP hyperparameters:

- `n_neighbors=15` — the smoothness of the manifold. Calvino's memos cluster naturally into five regions; 15 neighbors per point is enough to find the regions without over-smoothing.
- `min_dist=0.15` — the minimum distance between projected points. Lower would crowd the clusters; higher would spread them out and lose the cluster shape.
- `metric="cosine"` — match the downstream k-NN. Consistency matters.
- `random_state=42` — determinism.

## What the rendered map looks like

The browser renders an SVG `<svg viewBox="0 0 1 1">` with ~600 `<circle>` elements, one per Calvino paragraph. Each circle is colored by memo (amber for Lightness, orange for Quickness, red for Exactitude, purple for Visibility, blue for Multiplicity — the same palette as the bar charts on the same page).

When the student writes paragraphs in the composer, their paragraphs are embedded one at a time, projected via k-NN, and drawn as **black circles outlined with a dashed stroke** — visually distinct from the colored Calvino dots in the same way the dashed bars are visually distinct in the bar charts. The placement updates as the student types (debounced so the API isn't hammered).

Hovering a Calvino dot shows the paragraph's first ~150 characters in a tooltip; hovering a user dot shows the user's paragraph. The map is read-only — no dragging, no zoom (Calvino's full corpus comfortably fits at 1:1).

## What the map reveals (and doesn't)

- **The five memos cluster visibly into five regions** — clean enough that a reader can identify *Quickness* (orange) from *Multiplicity* (blue) at a glance. This is a useful diagnostic: if the clusters didn't separate, the embeddings or UMAP would be doing something wrong.
- **Each cluster has internal structure.** Inside *Exactitude* (red), there are sub-clusters around Calvino's recurring topics — the crystal, the flame, geometry, the page as object. The reader can zoom-by-attention.
- **Cross-cluster bridges exist.** Paragraphs that talk about *visibility* in the context of *exactitude* land in the middle. These bridges are themselves worth looking at — they're where Calvino's themes cross.
- **The map doesn't tell you *why* paragraphs cluster.** The embedding is opaque. A paragraph and its neighbors share *something*, and the student has to look at the texts to figure out what. That's a feature, not a bug — the map is a *finder*, not an *explainer*.
- **The student's projection is approximate.** A user paragraph that lands in the heart of the *Quickness* cluster is *very close* to actual Calvino-Quickness prose. A user paragraph that lands between two clusters is *somewhere between* them — but not necessarily where UMAP would have placed it. The approximation is honest about itself; the map doesn't promise more than it can deliver.

## What this operation deliberately doesn't do

- **No "score" attached to the projection.** The map doesn't say "you are 73% Calvino-Quickness." It places a dot. The student reads the placement.
- **No live re-embedding of the full corpus.** The static `embeddings.json` is the *commitment*; it's how the placements stay stable across sessions and re-runs.
- **No retrieval / search interface.** This is not "find the Calvino paragraph most like your draft." That would be a different page. Here the operation is *geometric*, not *retrievalist*.
- **No fine-tuning of the embedding model.** The embeddings are off-the-shelf Gemini. The interesting work is in the pipeline (UMAP, k-NN projection, the page), not in the model.
- **No persistence of student drafts.** When the page reloads, the student's dots are gone. The Calvino map persists.

## Hard constraints (these survive translation)

- **Embed the canonical corpus offline; embed user inputs live.** The asymmetry is what makes the page possible.
- **Project user vectors into 2D via k-NN, not by re-running UMAP.** k-NN is deterministic, fast, ships to the browser. Re-running UMAP per request is wrong.
- **Use the same embedding model and parameters on both sides.** Same model, same task type, same dimensionality. Without this, the cosine distances are meaningless.
- **Pick a dimensionality reduction with stability.** UMAP with a pinned random_state. t-SNE will break the promise that "the same map renders for everyone."
- **Ship the per-point vectors alongside the 2D coordinates.** k-NN needs the vectors; the scatter plot needs the coordinates. Both go in `embeddings.json`.
- **Server-side API key.** The `/api/embed` proxy keeps `GEMINI_API_KEY` in `process.env`. The browser never sees it.
- **Visual differentiation between corpus dots and user dots.** Calvino's are solid colored; the student's are black with a dashed outline. The same convention as the bar charts on the same page.
