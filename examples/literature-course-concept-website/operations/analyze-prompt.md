# Prompt — Trait analysis (Demo 1, step 1)

*The first step of the Spider Chart demo. A poem and a set of student-defined traits go in; structured JSON with per-trait score and reasoning comes back. Lives in production as [`app/api/analyze/route.ts`](https://github.com/bok-learning-lab/complit126x-lovesongs-draft/blob/main/app/api/analyze/route.ts). Model: `gpt-4o-2024-08-06` with `zodResponseFormat` for structured output.*

---

## What it does

The student writes (or accepts the defaults for) a list of **traits** with names, descriptions, and 1–10 scoring rubrics — e.g. *"Melancholy: presence of sadness, longing, or wistfulness; 1-3: No sadness present, 4-6: Some wistful moments, 7-10: Deeply melancholic."* They paste a poem. The endpoint asks an OpenAI model to score the poem against each trait and return JSON.

The structured output is what feeds the rest of the demo: the radar chart, the per-trait reasoning panels, and the averaged scores that become the *only* input to the sonnet-generation prompt in [`generate-from-scores-prompt.md`](generate-from-scores-prompt.md).

## System prompt

```
You are a literary analyst. Analyze the given poem and score it on the specified traits.

For each trait, provide:
1. A score from 1-10 based on the rubric provided
2. A brief reasoning (1-2 sentences) explaining your score

Be precise and consistent in your scoring. Use the full range of the scale.
```

## User message

```
Analyze this poem:

"""
{POEM TEXT}
"""

Score it on these traits:
- {TRAIT_1_NAME}: {TRAIT_1_DESCRIPTION}
  Scoring rubric: {TRAIT_1_RUBRIC}
- {TRAIT_2_NAME}: {TRAIT_2_DESCRIPTION}
  Scoring rubric: {TRAIT_2_RUBRIC}
... (one per trait)

Return your analysis as JSON with scores and reasoning for each trait.
```

## Response schema (Zod)

```typescript
const TraitAnalysisSchema = z.object({
  analysis: z.array(
    z.object({
      trait: z.string(),
      score: z.number(),
      reasoning: z.string(),
    })
  ),
});
```

Passed to OpenAI as `response_format: zodResponseFormat(TraitAnalysisSchema, 'trait_analysis')`. The structured-output API guarantees the model returns valid JSON matching the schema — no parsing failures.

## The default traits the student starts from

See [`inputs/default-traits.json`](../inputs/default-traits.json) — five trait rubrics shipped with the analyzer page. Melancholy, Romanticism, Nature Imagery, Mortality, Optimism. These were chosen to demonstrate the move; students are *encouraged to edit them* (the `TraitEditor` component is the third box on the page, before the analyze button).

## What the student then does with the JSON

The endpoint returns `{ analysis: [{trait, score, reasoning}, ...] }`. The page:

1. **Renders the per-trait scores in a radar chart** (via the `ResultsRadar` component, built on `recharts`). Each poem analyzed gets its own colored polygon overlaid on the same chart axes.
2. **Lists the per-trait reasoning** in a sidebar below the chart. Hovering or clicking a poem in the list reveals its specific reasoning per trait.
3. **Averages the scores across all analyzed poems** when the student clicks "Generate a Sonnet" — see [`generate-from-scores-prompt.md`](generate-from-scores-prompt.md).

## What this prompt deliberately doesn't do

- **No interpretive verdict.** "Be precise and consistent" — not "tell us what the poem means."
- **No comparison across poems.** The endpoint scores one poem at a time. The comparison is the *student's* job, performed by analyzing multiple poems and reading the layered chart.
- **No suggested traits.** The model doesn't propose its own dimensions. The student writes the trait list; the model only scores against it. This is part of the pedagogical posture — *what to measure* is the student's question, not the model's.
- **No score normalization across runs.** A 7 in this analysis isn't calibrated against a 7 from yesterday. Each call is independent. The instruction *"use the full range of the scale"* is the only nudge against compression.

## Hard constraints (these survive translation)

- **Structured output via schema.** Don't ask for "scores as JSON" in the prompt and parse the response. Use the model's native structured-output mechanism; it's the difference between *occasionally fails* and *reliably works*.
- **One poem per call.** Don't batch. Each analysis is a discrete object the student will compare.
- **The trait list is the user's, not the model's.** The model scores; it does not propose traits. The pedagogical commitment is to make *what to measure* the student's question.
- **Reasoning alongside the score.** Without it, a 7 is uninspectable. With it, the student can read why the model landed where it did and disagree with it. The disagreement is itself part of the lesson.
- **Use the full range.** Without the instruction, models cluster around 5–7 and the radar chart becomes unreadable. The instruction is one sentence; the chart's legibility depends on it.
