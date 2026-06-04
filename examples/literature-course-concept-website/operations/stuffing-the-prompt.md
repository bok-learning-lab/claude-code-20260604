# Prompt — Stuffing the prompt (Demo 2)

*The pedagogical counterpoint to Demo 1's averaged-scores prompt. Where [`generate-from-scores-prompt.md`](generate-from-scores-prompt.md) hides the poems and shows only numbers, this prompt does the opposite — the three actual Shakespeare sonnets are stuffed into the context verbatim, and the model is asked to write a fourth in the same style. No abstraction layer; no intermediate vocabulary. Lives in production as [`app/api/demo-sonnet/route.ts`](https://github.com/bok-learning-lab/complit126x-lovesongs-draft/blob/main/app/api/demo-sonnet/route.ts). Model: `gpt-4o` via the Responses API.*

---

## What it does

The user selects (in the UI; the three sonnets are pre-loaded as toggleable cards) one or more Shakespeare sonnets — by default 18, 29, and 55, the same three that the Spider Chart was built around. The page POSTs the array of sonnet texts to `/api/demo-sonnet`. The endpoint formats them inline in the prompt, asks for a fourth sonnet in Shakespeare's style.

There is no system prompt. There is no trait vocabulary. The model sees the actual text of three sonnets and is asked to write a fourth.

## The complete prompt (this is all the model sees)

```
Here are three Shakespeare sonnets:

--- Sonnet 1 ---
Shall I compare thee to a summer's day?
Thou art more lovely and more temperate:
Rough winds do shake the darling buds of May,
And summer's lease hath all too short a date:
Sometime too hot the eye of heaven shines,
And often is his gold complexion dimm'd;
And every fair from fair sometime declines,
By chance, or nature's changing course untrimm'd;
But thy eternal summer shall not fade,
Nor lose possession of that fair thou ow'st;
Nor shall death brag thou wander'st in his shade,
When in eternal lines to time thou grow'st:
  So long as men can breathe, or eyes can see,
  So long lives this, and this gives life to thee.

--- Sonnet 2 ---
When, in disgrace with fortune and men's eyes,
... [Sonnet 29] ...

--- Sonnet 3 ---
Not marble, nor the gilded monuments
... [Sonnet 55] ...

Write a new sonnet in Shakespeare's style — 14 lines, iambic pentameter, ABAB CDCD EFEF GG rhyme scheme. Draw on the imagery, themes, and emotional register of the sonnets above, but write something original. Do not copy lines.
```

## Why this is the opposite of Demo 1

| | Demo 1 (averaged scores) | Demo 2 (stuffed prompt) |
|---|---|---|
| What the model sees | A list of trait names + numbers | The full text of three poems |
| What's hidden from the model | The poems themselves | Any abstraction over the poems |
| What the model is told to do | Match the trait profile | Write in Shakespeare's style |
| What's lost in the compression | The poems' specifics | Nothing — but no language to *talk about* what's there |
| Failure mode | Generic, neighborhood-correct prose | Plausibly Shakespearean surfaces; sometimes pastiche |

## What the student is meant to notice

The Demo 2 sonnet will sound *more like Shakespeare* than the Demo 1 sonnet. The vocabulary will be more period-appropriate. Lines will more often land. The imagery will recur from the source corpus (summer, eternal lines, gilded monuments, death-as-shadow).

It will *also* be more imitative — sometimes outright lifting Shakespearean turns. Sometimes brilliantly; sometimes embarrassingly. The model has been given the source material and asked to imitate; it imitates.

The two demos together raise a sharper question than either alone: *what does the student want?* If the goal is "a sonnet that sounds like Shakespeare," Demo 2 wins. If the goal is "understanding what makes Shakespeare *Shakespeare* — what dimensions of the work survive abstraction and which ones don't," Demo 1 wins. The workshop will sit in the gap between the two.

## What this prompt deliberately doesn't do

- **No system prompt.** Like Demo 1, the full string sent to the model is visible. No hidden scaffolding.
- **No "rewrite this scene" or "modernize" instructions.** "Write something original" plus "Do not copy lines" plus "Draw on the imagery, themes, and emotional register" is the entire steering layer.
- **No trait vocabulary.** Whatever the model picks up from reading the three sonnets is what it picks up. It is not told *"these poems are 7/10 melancholic"*; it reads them.
- **No specific number of sonnets required.** The endpoint accepts any non-empty array. Two sonnets, four sonnets, ten sonnets — the prompt's shape is the same. (The UI defaults to three.)
- **No retry.** Same as Demo 1: one call, one output, the output stands.

## Why selecting *which* sonnets matters

The demo defaults to 18, 29, and 55 — chosen so they don't pull in the same direction. (See [`inputs/sample-sonnets.md`](../inputs/sample-sonnets.md) for the per-sonnet rubric profile.) A student who substitutes three sonnets that are all *love poems* will get a love poem back; a student who substitutes three sonnets that are all about *mortality* will get a mortality poem back. The selection is part of the prompt — even though the model isn't told *why* these three.

## Hard constraints (these survive translation)

- **The full source poems are included verbatim.** Not summarized, not paraphrased. The compression layer that Demo 1 forces is what Demo 2 deliberately omits.
- **The form is named explicitly.** Form (14 lines, iambic pentameter, ABAB CDCD EFEF GG) is in the prompt because the model needs structural anchors. Tone and content are *not* in the prompt; the source poems are doing that work.
- **"Do not copy lines."** Without this, the model occasionally lifts lines outright. The instruction doesn't fully prevent it — the next-token statistics are heavy with the source — but it's the smallest hedge.
- **No system prompt.** The transparency about what the model sees is the demo's point.
- **The contrast with Demo 1 is the move.** This prompt isn't meant to stand alone; it's the second half of a pair, and the lesson is in their juxtaposition.
