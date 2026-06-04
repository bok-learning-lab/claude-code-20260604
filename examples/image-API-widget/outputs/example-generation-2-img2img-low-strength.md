# Example 2 — img2img (low strength, preserve source)

*Illustrative only. The second move in the conversation that started with [example 1](example-generation-1-txt2img.md). To see actual outputs, visit [the live demo](https://stable-diffusion-widget-interface.vercel.app/).*

---

## Request

```json
{
  "prompt": "the same composite face, but as a glass-blown sculpture by Dale Chihuly in the entrance hall of the Bellagio",
  "sourceImage": "data:image/png;base64,...(the result of example 1)...",
  "strength": 0.30,
  "seed": 17
}
```

The source image is the Arcimboldo-style composite face from example 1, fed back in as `sourceImage`. Strength is **0.30** — well below the dialog band, in the "preserve source" range.

## Settings used

- **Provider**: Replicate (HF doesn't support img2img — see [`operations/generate-operation.md`](../operations/generate-operation.md))
- **Strength**: **0.30** — the slider label in the UI reads *"preserve source"*
- **Seed**: 17

## What the model returned (described)

A 512×512 PNG. Recognizably *the same composition* as the source — same three-quarter portrait pose, same arrangement of produce-as-face — but with a faint shift in materiality. The pear-cheek now has a glossy, slightly translucent quality. There's a hint of the Chihuly chandelier vocabulary at the edges of the artichoke crown, but the fruit-and-vegetable identities of each element are intact. The background palette has lightened a touch. The face is still very much an Arcimboldo composite face; the glass-sculpture register is whispering at it, not overwriting it.

## What this teaches about strength

Strength **0.30** holds the source. The prompt is doing minor work — a tint, a glaze, a hint. If you were trying to *transform* the image into a Chihuly sculpture, this strength is too low; the prompt's instruction is being filtered through the source's compositional gravity. If you were trying to *honor* the source while introducing a new material register, this is roughly right.

The general rule:

| Strength | What survives | What you're doing |
|---|---|---|
| 0.00–0.39 (this generation) | Composition, color palette, the basic identity of the source | Glazing, tinting, light material shifts |
| 0.40–0.80 (the dialog band) | Composition; some color | Genuine recasting — same scene in a different register |
| 0.81–1.00 | Composition ghost only | Essentially txt2img with a faint layout hint |

## The dialogical move (Rule 2)

This generation makes the conversation legible. Side by side with example 1, the question becomes: *what is the model treating as essential to the composition, and what is it willing to let go of?* At strength 0.30, the answer is: the *arrangement* of produce-as-portrait is essential; the material register (oil paint vs. blown glass) is negotiable.

The natural next move is to push the strength up — see [`example-generation-3-img2img-high-strength.md`](example-generation-3-img2img-high-strength.md) — and see what the model does when the prompt is given more authority over the source.

## Where this would appear in the Studio

- **Latest-generation card** with two columns: the **source** (example 1) on the left, the **generated** (this) on the right. Below: the prompt verbatim, `strength 0.30`, `seed 17`, a download link.
- Example 1 has now moved into the "Earlier attempts" gallery at position 1. The dialog is visibly building.
