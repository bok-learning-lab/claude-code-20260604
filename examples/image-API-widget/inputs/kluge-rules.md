# A Few Preliminary Rules

*After Alexander Kluge — paraphrased for use as the critical framework that ships alongside the image generator. The production app reads these rules from a TypeScript module ([`apps/interface/components/kluge-rules.tsx`](https://github.com/bok-learning-lab/stable-diffusion-widget/blob/main/apps/interface/components/kluge-rules.tsx)) and renders them as a sidebar next to the generation form. This is the source.*

---

> Several strict rules apply to the use of a "virtual camera." In fact, you must be something of a true **ICONOCLAST** to have anything to do with it in the first place.

---

## Rule 1 — Presence of the source information of the original image

Bring the context of the source — the history, the working conditions, the medium it came from — into the generation. A painting by Arcimboldo carries Rudolf II's *Wunderkammer* in Prague with it. Film stills, book illustrations, sketches, watercolors, sculptures, and installations each carry different roots. The model has been trained on billions of images and their captions; what it returns depends on which of those roots you choose to name in your prompt.

A prompt that says "an image of a face made of fruit" pulls a generic average of everything labeled that way. A prompt that says "a painting by Arcimboldo, fruit and vegetables forming a face, Wunderkammer, 16th century" pulls the historical lineage of *this kind of image*. The source information is what makes the generation citable.

## Rule 2 — Dialogical method

There is dialog between the tool and the author. The experiments make sense only when they are connected to other experiments, other attempts, other hands. Treat each generation as a move in a conversation.

A single generation is not the work. The work is the *sequence* — what you tried, what came back, what you tried next, what changed when you raised the strength, what stayed the same across seeds. The Studio's gallery of "earlier attempts" exists for this reason: not so you can pick the best one, but so the sequence is legible as a sequence.

---

*More rules are likely to emerge through necessary intensifications and counter-rules. Add your own.*

---

## How these rules show up in the interface

The rules are not a separate handout — they live in the sidebar of the generator UI itself. Two specific design moves tie the rules to the controls:

- **Rule 1** ties to the **source-image input.** The label reads *"Source image (optional — Rule 1)"*. A user who has read the rule understands what "bringing the source into the dialog" means; a user who hasn't can read it without leaving the page.
- **Rule 2** ties to the **strength slider's labels.** Below 0.4 it reads *"preserve source"*; above 0.8 it reads *"follow prompt"*; in between (0.4–0.8) it reads *"dialog"* — the literal vocabulary of Rule 2. The slider's middle band is where the dialogical method lives.

---

## Editing this file

This file is the source of truth for the rules that ship with the widget. The production app pulls equivalent content from `kluge-rules.tsx`; a class translating this widget to its own use should edit this file (and add Rule 3, Rule 4, etc. as needed for the specific course) and then mirror those edits back into the TSX module. The rules are *paraphrased* from Kluge; quote freely, add your own intensifications, write counter-rules.

The conceit only works if the rules are doing live work — if a student can map the UI control to the rule and back. Adding a new control should mean adding a new rule, or making a new rule visible on an existing control. The rules and the interface are one artifact.
