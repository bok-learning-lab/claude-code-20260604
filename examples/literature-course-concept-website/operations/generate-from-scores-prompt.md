# Prompt — Generate a sonnet from scores only (Demo 1, step 2)

*The centerpiece of the whole workshop. The student has analyzed one or more poems on a set of trait rubrics; the page averages the scores; **the averaged scores — and nothing else — become the entire prompt** to write a new sonnet. No poem text, no quotations, no author's name, no style examples. Just numbers and the formal constraint. The gap between what the scores capture and what poems do is the lesson.*

*Lives in production as [`app/api/generate-lyrics/route.ts`](https://github.com/bok-learning-lab/complit126x-lovesongs-draft/blob/main/app/api/generate-lyrics/route.ts). Model: `gpt-4o` via the Responses API.*

---

## The complete prompt (this is all the model sees)

```
Write a sonnet with the following trait scores (scale of 1-10):

- Melancholy: 7.3/10
- Romanticism: 6.7/10
- Nature Imagery: 8.0/10
- Mortality: 5.7/10
- Optimism: 7.0/10

Write exactly 14 lines in iambic pentameter with an ABAB CDCD EFEF GG rhyme scheme. Do not include a title.
```

(With the trait list and the score values populated from whatever the student averaged. The above shows what the prompt would look like for the running Shakespeare-18/29/55 example.)

There is no system prompt. There is no preamble. The model has not been told it's writing "in the style of" anyone, has not been shown what those traits *mean* beyond the names, has not seen the rubric descriptions, has not been quoted any poem.

That asymmetry is the demo's whole point.

## The UI shows the student exactly this

The `/analyzer` page renders the prompt verbatim in the "Step 2" section, in a monospace code block, with the heading *"The complete prompt sent to the model"* — so the student can see what's being sent and *what isn't*. The averaged scores are rendered visually (a progress-bar per trait) on the left of the same row; the prompt text is on the right. They're presented as two views of the same data: numbers on the left, what the model will read on the right.

## What the student is meant to notice

After clicking "Generate a Sonnet," the model returns a 14-line poem. It will scan, it will rhyme, it will land in the *vicinity* of the trait scores — moodily melancholic, with some nature imagery, gesturing at mortality. It will probably read fine.

It will not, however, be a Shakespeare sonnet. It will not be a Dickinson poem. It will not be in the voice of any poet the student has actually been reading. It will be a *generic* sonnet calibrated to a set of numerical dials.

The "Reflect" panel under the generated sonnet says it plainly:

> **Reflect:** What does this get right? What did the compression lose? The sonnet form is constrained — 14 lines, fixed rhyme scheme — but everything inside those constraints was underdetermined by the scores. What would the model need to replicate the choices a specific poet actually made?

## The pedagogical move

Voice — *the whole operation* of a writer's attention, in the workshop overview's terms — is *not* a vector of trait scores. Reducing a poet's work to numbers and asking the model to expand the numbers back into a poem produces something *in the right neighborhood*, but the neighborhood is large and the poet is one specific point in it.

The averaged-scores prompt is the upper bound of what trait-based compression can do. Reading the output and noticing what's missing is what teaches the student what voice actually contains — beyond what numbers can capture.

## What this prompt deliberately doesn't do

- **Doesn't include the trait rubrics.** The model sees `Melancholy: 7.3/10` and has to *guess what melancholy means here*. The rubric the analyzer used ("4-6: Some wistful moments, 7-10: Deeply melancholic") is not in this prompt. The asymmetry exposes what the model is filling in.
- **Doesn't mention any poet.** Not Shakespeare, not the source corpus, not the analyzer's prior runs. Each generation is fresh. The model isn't being asked to imitate anyone.
- **Doesn't show any source text.** This is the whole point of separating Demo 1 from Demo 2. The follow-up demo ([`stuffing-the-prompt.md`](stuffing-the-prompt.md)) does the opposite — feeds three actual sonnets directly. The contrast between the two outputs is the second lesson.
- **No reasoning required from the model.** Demo 1 step 1 asks for reasoning alongside scores; Demo 1 step 2 asks only for the poem. The generator is operating on pure numerical input, no scaffolding.

## Why `gpt-4o` and not `gpt-4o-2024-08-06`

The analyze endpoint uses the pinned `2024-08-06` version (because `zodResponseFormat` was first available in that snapshot). The generate-lyrics endpoint uses plain `gpt-4o` — there's no structured-output requirement, just a free-text completion. The model choice is deliberately commodity; the demo's lesson does not depend on a frontier model.

## Hard constraints (these survive translation)

- **The complete prompt is what's shown.** The student sees the *whole* string sent to the model — not a sketch, not a summary. The transparency is part of the lesson; nothing is hidden.
- **No system prompt.** A system prompt would smuggle context the demo is deliberately withholding. Resist adding one.
- **Form is named, content is not.** "14 lines, iambic pentameter, ABAB CDCD EFEF GG" is in the prompt. *Specific words, themes, or poets to imitate* are not.
- **Averaged across all analyzed poems.** Not "the most recent" or "the highest-scoring." The averaging is what flattens — and the flattening is the move.
- **No retry, no judging, no refinement.** One call, one output. The output's *limitations* are part of what the demo teaches; don't paper over them with second-pass corrections.
