# Example — a worked Spider Chart session (Demo 1)

*Illustrative walkthrough of a student analyzing Shakespeare's Sonnets 18, 29, and 55 with the default five trait rubrics, then generating a new sonnet from the averaged scores. Numbers are written illustrations of what the page would return on a representative run; the actual run would land near these values but vary in the reasoning paragraphs.*

---

## Setup

The student lands on [`/analyzer`](https://complit126x-lovesongs.vercel.app/analyzer). The default state is loaded:

- The **poem input** holds Sonnet 18 (`Shall I compare thee to a summer's day?`).
- The **trait editor** shows the five defaults: Melancholy, Romanticism, Nature Imagery, Mortality, Optimism — each with a 1–10 rubric. (See [`inputs/default-traits.json`](../inputs/default-traits.json).)
- The right column shows an empty placeholder: *"Enter a poem and define traits, then click 'Analyze Poem' to see results."*

The student doesn't edit anything. They click **Analyze Poem**.

## Analyzing Sonnet 18

The endpoint posts the poem + traits to `/api/analyze`. ~3 seconds later, the right column populates:

**Sonnet 18 — radar chart polygon (purple)**

| Trait | Score | Model's reasoning |
|---|---|---|
| Melancholy | 4/10 | *Some wistfulness about the brevity of summer ("summer's lease hath all too short a date") and the inevitability of fading beauty, but the overall thrust is reassurance, not sadness.* |
| Romanticism | 8/10 | *A direct address to a beloved, with the poem itself offered as the gift that will make them immortal. Romantic in tone and intent.* |
| Nature Imagery | 9/10 | *Sustained extended metaphor on summer, the sun, the buds of May, fading "fair." Nature is the entire central comparison.* |
| Mortality | 5/10 | *Death is named ("Nor shall death brag"), but as a force to be defied by the poem itself rather than a central preoccupation.* |
| Optimism | 8/10 | *The poem's argument is that the beloved's "eternal summer shall not fade" because the lines themselves will preserve them. A triumphant claim.* |

The radar chart renders these as a purple polygon on the five axes. Below it, the per-trait reasoning panels make the scoring inspectable. The student can disagree with any of them — the rationale is on the page.

## Analyzing Sonnet 29

The student pastes Sonnet 29 over the default poem and clicks Analyze again. A green polygon overlays on top of the purple one. The two shapes are visibly different — Sonnet 29 has its mass on the Melancholy and Romanticism axes; Sonnet 18 has its mass on Nature Imagery and Optimism.

**Sonnet 29 — radar polygon (green)**

| Trait | Score | Model's reasoning |
|---|---|---|
| Melancholy | 8/10 | *Opens with "disgrace with fortune and men's eyes," beweeping outcast state, troubling deaf heaven with bootless cries. Deeply melancholic until the volta.* |
| Romanticism | 9/10 | *The volta turns on "Haply I think on thee" — romantic love is the rescue from despair. Intensely romantic in its argument.* |
| Nature Imagery | 4/10 | *One sustained nature image — the lark at break of day — but not a sustained natural-world setting.* |
| Mortality | 3/10 | *Almost no mortality themes. The despair is social and existential, not death-driven.* |
| Optimism | 7/10 | *Pessimistic through line 8, then dramatically optimistic — the closing couplet would not exchange the state with kings.* |

## Analyzing Sonnet 55

A third polygon, blue this time, overlays. Sonnet 55 has its mass pushed *yet again* in a different direction — toward Mortality, which dominates.

**Sonnet 55 — radar polygon (blue)**

| Trait | Score | Model's reasoning |
|---|---|---|
| Melancholy | 5/10 | *Awareness of "sluttish time" and "wasteful war," but channeled into defiance rather than grief.* |
| Romanticism | 6/10 | *The beloved is addressed and praised, but the argument is monumental rather than intimate — about preservation, not feeling.* |
| Nature Imagery | 3/10 | *Almost none. The imagery is built and martial — marble, gilded monuments, statues, masonry, war.* |
| Mortality | 9/10 | *Time, decay, death, posterity, "the ending doom." Mortality is the central theme.* |
| Optimism | 7/10 | *The argument is that the poem itself will outlive everything that decays. Triumphant in claim.* |

## What the chart now shows

Three polygons overlaid on the five-axis radar. The student can see at a glance:

- **Nature Imagery** is dominated by Sonnet 18; the others are low.
- **Mortality** is dominated by Sonnet 55.
- **Melancholy** is dominated by Sonnet 29.
- **Romanticism** is high across all three but most extreme in Sonnet 29.
- **Optimism** is roughly equal across all three.

Each sonnet has a *signature shape*. Looking at the three polygons together, the student can see what makes each one distinctive — visually.

## Computing the averages

Below the chart, in the *"Step 2 — From Spider Chart to Sonnet"* section, the page renders the averaged scores. With three poems analyzed:

| Trait | Score (average of three) |
|---|---|
| Melancholy | 5.7/10 |
| Romanticism | 7.7/10 |
| Nature Imagery | 5.3/10 |
| Mortality | 5.7/10 |
| Optimism | 7.3/10 |

The averaging **flattens the contrast that made each sonnet distinctive.** Where Sonnet 18 was a 9 on Nature Imagery, the average is 5.3 — a *moderate* nature poem, not a *nature-saturated* one. Where Sonnet 55 was a 9 on Mortality, the average is 5.7 — *some* mortality, not *central*.

The averaging is the act of pedagogical violence the demo enacts. The student sees the three signature polygons; the average is the polygon that *doesn't look like any of them*. That gap is the lesson.

## The complete prompt

Beside the averaged-scores visual, in a monospace code block, the page shows the prompt that will be sent:

```
Write a sonnet with the following trait scores (scale of 1-10):

- Melancholy: 5.7/10
- Romanticism: 7.7/10
- Nature Imagery: 5.3/10
- Mortality: 5.7/10
- Optimism: 7.3/10

Write exactly 14 lines in iambic pentameter with an ABAB CDCD EFEF GG rhyme scheme. Do not include a title.
```

The student can see *exactly what the model is going to see*. The three sonnets — the things that made the scoring possible — are not in this prompt. They cannot be. The compression is total.

## The generated sonnet

The student clicks **Generate a Sonnet**. ~5 seconds later, the output appears:

```
When evening lays its hand upon the rose,
And gathers shadow where the light had been,
A quiet hope amid the dusk still grows —
The kind of hope no daytime mind has seen.

Though brief the season fair affections last,
And brief the breath that names them in the air,
The heart's slow ledger holds them, hand to past,
And finds them still — though changed — and still as fair.

Love's tender weather softens what we lose;
Time gentles where it might have only torn;
Among the leaves no certainties refuse
The faith that something steady will be born.

So if the world should darken, even so,
Some warmth remains the deepest cold can't know.
```

It scans. It rhymes correctly (`rose / grows`, `been / seen`, `last / past`, `air / fair`, `lose / refuse`, `torn / born`, `so / know`). It uses iambic pentameter. It is, technically, a sonnet.

It is not Shakespeare. It is not in the voice of any actual poet. It is *neighborhood-correct*: somewhat melancholy (5.7), with some nature imagery (5.3), with romantic feeling (7.7), with awareness of impermanence (5.7), resolving optimistically (7.3). All the scores are matched approximately.

But the *specifics* are gone. There is no "darling buds of May" — the model didn't have access to that phrase. There is no "lark at break of day" — likewise. There is no "gilded monuments" — likewise. The poem is *all median*; the average of three sonnets gave the model a coordinate to aim for, and the model produced what falls at that coordinate when nothing else constrains it.

## The reflection panel

Under the generated sonnet:

> **Reflect:** What does this get right? What did the compression lose? The sonnet form is constrained — 14 lines, fixed rhyme scheme — but everything inside those constraints was underdetermined by the scores. What would the model need to replicate the choices a specific poet actually made?

The student now has the question the workshop will work through. They can list what the model needed and didn't have:

- The actual texts of the source poems.
- The *order* of the lines — what comes first, what's set up, what's withheld.
- The *rhetorical structure* — Sonnet 18's confidence, Sonnet 29's volta, Sonnet 55's monumental claim.
- The *register* — the period diction Shakespeare draws on.
- The *argument* — what each sonnet is *doing*, not just *being about*.

These are the dimensions that the trait scores didn't capture. Naming them is the unit's content.

## The student moves on to Demo 2

At the bottom of the analyzer page, a card links to Demo 2: *"Stuffing the Prompt — Skip the abstraction, feed poems directly and see what comes out."*

Clicking it takes the student to the next demo — where the three actual sonnets get pasted into the prompt and the model is asked to write a fourth. See [`example-three-demos-compared.md`](example-three-demos-compared.md) for what comes back and how it differs from this generation.
