# Example 3 — img2img (high strength, follow prompt)

*Illustrative only. The third move in the conversation that started with [example 1](example-generation-1-txt2img.md). To see actual outputs, visit [the live demo](https://stable-diffusion-widget-interface.vercel.app/).*

---

## Request

Same prompt and same source image as [example 2](example-generation-2-img2img-low-strength.md), only the strength is changed:

```json
{
  "prompt": "the same composite face, but as a glass-blown sculpture by Dale Chihuly in the entrance hall of the Bellagio",
  "sourceImage": "data:image/png;base64,...(the result of example 1)...",
  "strength": 0.90,
  "seed": 17
}
```

Strength is now **0.90** — well above the dialog band, in the "follow prompt" range.

## Settings used

- **Provider**: Replicate
- **Strength**: **0.90** — the slider label in the UI reads *"follow prompt"*
- **Seed**: 17 (held constant from example 2 so the comparison is clean)

## What the model returned (described)

A 512×512 PNG. A full Chihuly-style blown-glass installation: tendrils, hooked stems, a confection of warm-yellow and saffron-orange glass curving outward and upward from a central mass. The *Arcimboldo composite-face conceit is gone* — there is no recognizable face. What survives is a faint compositional ghost: roughly vertical stack, slight rightward lean, light coming from the upper left.

The image is what *the prompt asked for* — a Chihuly sculpture in a Bellagio-like setting — rather than what the *source image* showed. At strength 0.90, the source has been used as a layout suggestion, not a content commitment.

## What this teaches about strength

Strength **0.90** discards the source's *content* and keeps a whisper of its *layout*. Useful when you want the source's compositional rhythm but not its imagery — e.g., when you have a sketch you like the layout of but want to fully re-render it in a different visual world.

Side by side with [example 2](example-generation-2-img2img-low-strength.md), this generation teaches the slider:

| | Example 2 (strength 0.30) | Example 3 (strength 0.90) |
|---|---|---|
| Composite-face conceit | Preserved | Gone |
| Material register | Hint of glass | Fully glass |
| Composition | Inherited from source | Faint ghost of source |
| What's doing the work | The source | The prompt |
| What was used | "Preserve source" | "Follow prompt" |

The slider's middle band (0.40–0.80) is where the genuinely *dialogical* move happens — where neither the source nor the prompt is unilaterally winning. This generation is what the slider's *upper* extreme produces.

## The dialogical move (Rule 2)

Examples 1, 2, and 3 are now a legible *sequence*. They're not three attempts at the same image — they're a conversation about how the model handles different ratios of source-to-prompt authority. The sequence is the work, not any one of its terms. This is what the Studio's gallery is for: the earlier attempts row makes the trajectory visible.

A natural next move: drop the strength to **0.60** (the middle of the dialog band) and run again with the same prompt and source. That's where the model gets to make a *real* compromise between Arcimboldo's composite-face logic and Chihuly's blown-glass logic — neither winning, both speaking. That generation is the one the class should look at most closely.

## Where this would appear in the Studio

- **Latest-generation card** with the source (example 1) on the left and this generation on the right. Below: the prompt verbatim, `strength 0.90`, `seed 17`, a download link.
- The **gallery** below now shows examples 1 and 2 as thumbnails — the conversation visibly building.

## Notes on seed

Holding `seed=17` constant between examples 2 and 3 means the only variable is the strength. That's how this becomes an experiment rather than two unrelated generations. The seed is the project's smallest piece of scientific rigor — it lets a class talk about *causal* moves rather than vague impressions.
