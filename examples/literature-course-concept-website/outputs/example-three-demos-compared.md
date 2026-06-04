# Example — the three demos compared, side by side

*Illustrative side-by-side of Demo 1 (Spider Chart — scores only), Demo 2 (Stuffing the Prompt — full source sonnets in context), and Demo 3 (Voice cloning of a sonnet generated from Prof. Weigel's scored Crimson article). What each demo produces; what each one misses; what the contrast teaches. The Demo 1 walkthrough is detailed in [`example-spider-chart-session.md`](example-spider-chart-session.md); this document focuses on the comparison.*

---

## Same inputs, in different mechanisms

To make the contrast legible, both Demo 1 and Demo 2 use the *same three Shakespeare sonnets* (18, 29, 55). The question becomes: when the model has access to the **scores** vs. the **full text**, what's different about what comes back?

Demo 3 uses a different source (Prof. Weigel's 2006 Crimson article) so the comparison axis there is *not the same source* — it's *the same five-trait rubric applied to prose instead of poetry, plus the addition of a multimodal layer*. The structural parallel is what makes the contrast useful.

## Demo 1 — Generated from scores only

(From [`example-spider-chart-session.md`](example-spider-chart-session.md):)

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

**Where it lands on the rubric:** Approximately on target. Some nature ("rose," "leaves," "season fair"), some melancholy (evening, shadow, brief), some romance (love's tender weather, affections), some mortality (what we lose, time, the cold), strongly optimistic ending (warmth remains, something steady will be born). All five scored dimensions are reflected; the polygon shape is recognizably the average of the three source sonnets'.

**What's missing:** *Anything specific.* No "darling buds of May," no "lark at break of day," no "gilded monuments." No volta (the rhetorical turn around line 9 that the source sonnets all enact in different ways). The argument is generic — vague consolation prose set to iambic pentameter.

**The lesson the page wants the student to draw:** Voice is not a coordinate. The averaging gave the model a destination, and the destination is empty unless filled with something specific. What would *fill it* is what the trait scores cannot specify.

## Demo 2 — Generated from full source text

(Illustrative — what `/api/demo-sonnet` would return for the three Shakespeare sonnets stuffed into context:)

```
Shall I behold thy face in winter's gleam,
Or trace thy form beneath the silvered hour,
When time, that thief, makes every promise seem
A pageant lent — a kingdom built of flower?

Yet thou, more lasting than the laurel-crowned,
Dost lend thy radiance to these worn-out lines;
And though all monuments be cast to ground,
Thy memory in this rude paper shines.

What is the world, with all its sluttish hours,
If not a stage for thee to walk upon?
Death's brag is hollow when our verse devours
The shade that else would claim thee at the dawn.

  So while these hands can write, or eyes can read,
  Thy beauty in these living lines is seed.
```

**Where it lands:** Visibly more Shakespearean. Period vocabulary in heavy concentration (*thou*, *thee*, *thy*, *thief*, *sluttish hours*, *laurel-crowned*, *gilded*-adjacent imagery, *the shade* echoing Sonnet 18's "Nor shall death brag thou wander'st in his shade"). The closing couplet echoes Sonnet 18 (*"So long as men can breathe, or eyes can see…"*). The volta lands around the right place.

**What's missing:** *The mind that wrote the source sonnets.* This poem is a *texture-match* — a credible pastiche that uses Shakespeare-shaped phrases. But the *intellectual move* of any one of the source sonnets isn't replicated: Sonnet 18's specific argument (the beloved is preserved by these lines), Sonnet 29's specific drama (the volta on *Haply I think on thee*), Sonnet 55's specific claim (the poem will outlive marble) — none of those is the argument of *this* sonnet. The model has produced *imitation surfaces* without producing an *original argument*.

Also visible: some lines verge on outright cribbing. *"Death's brag is hollow"* is structurally close to *"Nor shall death brag"* in Sonnet 18; *"sluttish hours"* lifts *"sluttish time"* from Sonnet 55. The instruction *"Do not copy lines"* is doing something, but the next-token statistics of the loaded context are heavy with Shakespearean phrasings.

**The lesson:** Stuffing the source poems gives the model the *surface* of Shakespeare. What it cannot give the model is *the specific argumentative move* each source sonnet performs. The model produces variations on the texture rather than new instances of the form.

## The Demo 1 / Demo 2 contrast

| | Demo 1 (scores only) | Demo 2 (full source) |
|---|---|---|
| What the model sees | 5 numbers + form | 3 sonnets verbatim + form |
| Period vocabulary | Absent | Heavy |
| Specific imagery | Absent | Echoes source |
| Argumentative move | Absent | Imitated, not new |
| Likely failure mode | Generic, neighborhood-correct | Pastiche, occasional cribbing |
| What's lost | The specifics | The originality |
| What's preserved | The trait-axis profile | The texture |

The two failure modes are precisely complementary. Demo 1 retains the *abstract shape* and loses the *content*; Demo 2 retains the *content* and loses the *originality*. Neither produces what Shakespeare did. Voice, the unit's question, sits in a place neither demo can reach.

## Demo 3 — Voice cloning of a scored-from-prose sonnet

The third demo uses a different source: a 2006 Harvard Crimson article by Prof. Moira Weigel (the course instructor, then an undergraduate), *"Weigel Room: Listen Up! Whitman Wants To Talk."* The page hardcodes the scored-trait values:

```
Melancholy:       3.0 / 10   (slight wistfulness about unreachable connection, not dark)
Romanticism:      3.0 / 10   (about intimacy, not romantic love)
Nature Imagery:   1.0 / 10   (almost none — a purely intellectual, urban piece)
Mortality:        5.0 / 10   (time, the gap across years, the dead poets)
Optimism:         8.0 / 10   ("intimacy with hope" — strongly utopian resolution)
```

The generated sonnet (also hardcoded into the page, captured from a representative run):

```
The years between a sentence and its eye
are not a silence but a held-out hand.
What time removes, the poem can supply—
the dead speak still, and we still understand.

No hedge or hillside enters what we write;
the only seasons here are those of mind,
the darkness that precedes a burst of light,
when thought completes the circuit left behind.

What's lost in person—warmth, reply, the face
that proves the voice inhabiting the word—
returns in part when readers find their place
in text where some surviving self is heard.

So something holds. The poem can maintain
the absent voice, and hope is what remains.
```

**Where it lands on the rubric:** Very low Nature Imagery (only "hedge or hillside" — and only as negation), low Melancholy and Romanticism, moderate Mortality (the dead poets, time), strongly Optimistic ending (*"hope is what remains"*). The trait profile matches.

**What's distinctive about this sonnet:** It is more *intellectual* than the Demo 1 generation from Shakespeare's scores. Compare: Demo 1's output was *"When evening lays its hand upon the rose"* — visual, atmospheric, generic; Demo 3's output is *"The years between a sentence and its eye"* — abstract, syntactic, *about reading*. The model has read the trait profile (low nature, moderate mortality, high optimism, with melancholy and romanticism *both* low) and produced an *idea-heavy* sonnet rather than an *image-heavy* one.

**What happens when the audio plays:** The page invokes `/api/demo-voice-audio` with the sonnet's text. ElevenLabs returns audio bytes. The audio plays. It is *Prof. Weigel's voice* — recognizably hers, in cadence and timbre, reading lines she did not write.

## What Demo 3 teaches that Demos 1 and 2 cannot

The previous two demos were entirely textual. They asked: *can you generate text that captures voice?* and answered: *partially, in different ways, neither sufficiently.*

Demo 3 asks a different question. The text was generated by the same (insufficient) Demo 1 mechanism. The cloned voice is *separately, precisely* the instructor's. Hearing the two together — the words she didn't write, in the voice she has — is the demonstration that **voice is not just the text**. The acoustic dimension is a separate channel; the channels can be independently engineered; even when both are correct, the artifact doesn't *land* as her voice in the full sense.

The recursion is the move: the instructor scored her own article, the LLM generated from her own scores, the cloned voice was hers. Every layer points back to her — and yet the result is alien. Voice, as the unit's readings have been suggesting, is something less mechanizable than any individual layer of synthesis.

## The combined lesson

After the three demos:

| Question the student can now ask | Demo that taught it |
|---|---|
| What dimensions can describe a poem at all? | Demo 1 (trait rubrics) |
| What does compression to those dimensions lose? | Demo 1 (the generated sonnet's emptiness) |
| What does the model do when given the source texts directly? | Demo 2 (the stuffing result) |
| What's the *gap* between texture-matching and originality? | Demos 1 + 2 contrast |
| Is voice purely textual? | Demo 3 (cloned audio) |
| If voice is multimodal, is the acoustic capturable separately from the text? | Demo 3 (the acoustic alone is correct) |
| Does correctly synthesizing both layers reconstruct voice? | Demo 3 (no) |

The workshop's actual question — *what is voice?* — is not answered by any demo. Each demo gives the student *language to name what's missing* from itself. The student arrives at the workshop able to articulate the question more precisely than they could before.

## What this comparison is not

- **Not a competition.** No demo "wins." Demo 2's output is more Shakespearean than Demo 1's — and more imitative. Both observations matter. The frame is *what does each one fail to capture*, not *which one's better*.
- **Not a recipe.** A combined Demo 4 that did Demo 1 + Demo 2 + Demo 3 together would teach the wrong lesson — that the limit can be engineered around. The unit's posture is that it cannot.
- **Not just about LLMs.** The same triad of mechanisms — abstraction, mimicry, multimodal layering — could be applied with no AI at all. The structure-as-pedagogy survives the model.
