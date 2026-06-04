# Operation — `/api/generate` (provider-agnostic image generation)

*The whole project rests on this single endpoint. It accepts a prompt (and optionally a source image), picks an inference provider based on which API tokens are set, and returns one generated image. Lives in production as [`apps/interface/app/api/generate/route.ts`](https://github.com/bok-learning-lab/stable-diffusion-widget/blob/main/apps/interface/app/api/generate/route.ts) with the actual provider calls in [`apps/interface/lib/generate.ts`](https://github.com/bok-learning-lab/stable-diffusion-widget/blob/main/apps/interface/lib/generate.ts).*

---

## What it does

Takes a prompt (and optionally a source image plus a strength parameter), calls a Stable Diffusion–family inference provider, and returns a generated image as a URL or a base64 data URL. Two providers supported, chosen automatically:

| Provider | When chosen | Cost | Supports |
|---|---|---|---|
| **Replicate** | Default if `REPLICATE_API_TOKEN` is set | ~$0.003 per SD-1.5 image | txt2img **and** img2img |
| **HuggingFace** | Fallback if only `HF_TOKEN` is set | Free tier (rate-limited) | txt2img only |

Force a specific provider with `INFERENCE_PROVIDER=replicate` or `INFERENCE_PROVIDER=huggingface`.

---

## Request shape

`POST /api/generate` with JSON body:

```json
{
  "prompt": "a painting by Arcimboldo, fruit and vegetables forming a face, Wunderkammer, 16th century",
  "sourceImage": "data:image/png;base64,..."  (optional — img2img only),
  "strength": 0.7                              (optional — img2img only, 0–1),
  "steps": 25                                  (optional, default 25),
  "seed": 12345                                (optional — set for reproducibility)
}
```

- **`prompt`** — required. Free text. Per Rule 1 of the Kluge framework (see [`inputs/kluge-rules.md`](../inputs/kluge-rules.md)), the prompt should name a source (artist, medium, period, institution) rather than describe in the abstract.
- **`sourceImage`** — optional. If present, switches to img2img mode. A data URL (`data:image/...;base64,...`) read client-side from a file input via `FileReader`. Replicate provider only — HF will error if a source image is supplied.
- **`strength`** — optional, 0 to 1, default 0.7. The img2img *prompt strength*. Low values preserve the source; high values follow the prompt. Per Rule 2, the dialogical band is 0.4–0.8.
- **`steps`** — optional, default 25. Diffusion inference steps. More steps = more detail and more cost; fewer steps = faster and looser.
- **`seed`** — optional integer. Pin a seed for reproducibility (the same prompt + same source + same seed should produce the same image). Leave unset for a fresh draw.

## Response shape

On success:

```json
{
  "imageUrl": "https://replicate.delivery/...png"  OR  "data:image/png;base64,...",
  "provider": "replicate"  OR  "huggingface",
  "seed": 12345
}
```

On error:

```json
{ "error": "human-readable message" }
```

with HTTP 400 (bad request, e.g. empty prompt or img2img on HF) or 500 (provider failure).

---

## Provider details

### Replicate (primary)

- Default model: `stability-ai/stable-diffusion:ac732df8...` — pinned SD 1.5 version. The pinned hash means upgrades are explicit; if the version is deprecated upstream, set `REPLICATE_MODEL` to a current version (or to a different model entirely — `black-forest-labs/flux-schnell` is the natural next step if SD 1.5 stops being available).
- Default parameters: `num_inference_steps=25`, `guidance_scale=7.5`, `512×512`.
- Returns either a URL string (hosted by Replicate's CDN, expires ~24h after generation) or a `ReadableStream` (which the route reads into a Buffer and returns as a base64 data URL). The Studio doesn't care which — both render in an `<img>` tag.
- For img2img: pass `image` (the source data URL) plus `prompt_strength` (the strength).

### HuggingFace (fallback)

- Default model: `stable-diffusion-v1-5/stable-diffusion-v1-5`. Override with `HF_MODEL`.
- Calls the Serverless Inference API endpoint directly with `fetch`. Returns image bytes; the route reads them into a Buffer and returns a base64 data URL.
- **Important caveat**: HF Serverless Inference does **not** reliably support img2img for SD models. If `sourceImage` is supplied, the route throws a clear error so the UI can surface "switch to Replicate."
- Why keep it: free tier. Useful for a classroom where you don't want to ask every student to put a credit card on Replicate.

### Why two providers

For pedagogy: the substance of "API widget" *is* the provider abstraction. Showing a class that the same prompt can be routed to different inference services — with different costs, capabilities, and idiosyncrasies — is more useful than showing them a single hardcoded provider. A student adapting this widget to their own work can swap providers with one environment variable, no code change.

The two providers also let the project run in free-tier-only environments (classroom labs without budget) by setting only `HF_TOKEN`, and switch to paid Replicate (better quality, img2img) when a real budget is available.

---

## The strength parameter — semantics

The `strength` slider runs 0–1 and has three named bands in the UI:

| Range | Label | What it means |
|---|---|---|
| 0.00 – 0.39 | preserve source | Generation stays very close to the source image; the prompt acts as a light tint or color-shift. The composition is the source's. |
| 0.40 – 0.80 | dialog | The dialogical band. The source's composition and major shapes survive; the prompt's named source (artist, medium, period) recasts the look. Per Rule 2, this is where the productive conversation happens. |
| 0.81 – 1.00 | follow prompt | The source is mostly discarded; you're effectively in txt2img with a faint compositional ghost. Useful when you want the source's *layout* but not its *content*. |

The labels are not arbitrary — they tie literally to Kluge's Rule 2 ("dialog between the tool and the author"). A student moving the slider sees the vocabulary of the rule applied to the parameter. The rule and the control are one artifact.

---

## What the route deliberately doesn't do

- **No prompt rewriting.** The route passes the user's prompt verbatim. No safety filter, no quality booster, no "ostgreaterized" rewording. If the model returns junk, the prompt told it to.
- **No image storage or history.** The image lives in the browser's `<img>` (and in the gallery in memory) until the page reloads. Per the project's anti-grading / anti-profiling posture inherited from the wider workshop, nothing is logged.
- **No safety classifier on the output.** The widget is built for an adult classroom with named source material. If you fork it for a public-facing tool, add a moderation step here — but that is a deliberate choice for that fork, not the default.
- **No API key in the browser, ever.** Both `REPLICATE_API_TOKEN` and `HF_TOKEN` are read from `process.env` server-side. The client only ever sees the returned image URL or data URL.

---

## Hard constraints (these survive translation)

- **Provider-agnostic interface.** The endpoint accepts the same JSON shape regardless of provider. The provider is implementation detail, set by env vars, never exposed to the client.
- **One generation per call.** No batch parameter, no "n=4 grid." Each call is a discrete move in the dialog (Rule 2). If a user wants four variants, they make four calls — and that sequence shows up in the gallery.
- **Seed always returned.** When a seed is set in the request, the response echoes it back. When the user *doesn't* set a seed, the provider's chosen seed is returned (where available). Reproducibility is part of the contract — a student should be able to ask "what was the seed of that one?" and get an answer.
- **Source-image transport is the data URL.** The image rides into the request as base64 in the JSON body, not as a separate multipart upload. Simpler request handling; the file never touches disk on the server.
- **Errors are surfaced.** A failed generation returns a human-readable error string. The Studio displays it verbatim in a red bordered box. No silent fallbacks, no "try again later."
