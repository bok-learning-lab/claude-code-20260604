# Example 1 — txt2img (no source image)

*Illustrative only. A representative generation written as a markdown card, since this example folder doesn't ship real binaries. To see actual outputs, visit [the live demo](https://stable-diffusion-widget-interface.vercel.app/).*

---

## Request

```json
{
  "prompt": "a painting by Arcimboldo, fruit and vegetables forming a face, Wunderkammer, 16th century",
  "seed": 42
}
```

No source image. Pure text-to-image. Seed pinned so the generation is reproducible across runs (assuming the same model version).

## Settings used

- **Provider**: Replicate (default — `REPLICATE_API_TOKEN` was set in `.env.local`)
- **Model**: `stability-ai/stable-diffusion:ac732df8...` (SD 1.5, the pinned default)
- **Steps**: 25 (the default)
- **Guidance scale**: 7.5 (the default)
- **Strength**: not applicable (txt2img)
- **Seed**: 42 (echoed back in the response)

## What the model returned (described)

A 512×512 PNG. A face composed entirely of produce in the Arcimboldo style: a pear forming the cheek, a halved fig forming the eye, grapes cascading where the beard would be, an artichoke at the crown, two small lemons as the brow ridge. Dark warm background — burnt sienna and umber — consistent with 16th-century oil-painting lighting. The composition reads as a *portrait*: three-quarter view, eye-level, slight tilt of the head. The face has the slightly menacing wit of the Arcimboldo originals — not photoreal fruit, but fruit *acting like* a face.

The seed (42) means the same prompt to the same model version will return effectively the same image again — useful for talking about a specific generation in class.

## What worked, in terms of the rules

**Rule 1 — source information.** The prompt names: an artist (Arcimboldo), a subject vocabulary (face, fruit and vegetables), a historical institution (Wunderkammer), a century (16th). Each of those names is doing work on the model's outputs. Removing any one of them measurably shifts the result — *"a painting of fruit forming a face"* without Arcimboldo's name produces something that looks more like a still-life-of-fruit-stacked-on-a-table; adding *"Wunderkammer"* darkens the palette and pulls the cabinet-of-curiosities framing in.

## What would be the dialogical move (Rule 2)

Generation 1 is the opening of a conversation, not the end. Natural next moves:

- **Try the same prompt with a different historical context.** Replace "Wunderkammer, 16th century" with "natural history catalog, 19th century" or "art photography, 21st century" — same composite-face conceit, different visual logic.
- **Hold the result and run a second generation with the same prompt but a fresh seed.** What stays the same is what the model is *committed to* about Arcimboldo; what changes is where the slack is.
- **Take this generation and use it as a source image** for the next generation, with the strength slider in the dialog band (0.4–0.8). That's where Rule 2 gets enacted directly — see [`example-generation-2-img2img-low-strength.md`](example-generation-2-img2img-low-strength.md) and [`example-generation-3-img2img-high-strength.md`](example-generation-3-img2img-high-strength.md).

## Where this would appear in the Studio

- **Latest-generation card** at the top of the column, with the image, the prompt in italics ("a painting by Arcimboldo, fruit and vegetables forming a face, Wunderkammer, 16th century"), the seed (42), and a download link.
- **Gallery** below the latest, this image will move to position 1 of "Earlier attempts" once the next generation runs. The gallery's order is reverse-chronological: latest at top, oldest at bottom.
