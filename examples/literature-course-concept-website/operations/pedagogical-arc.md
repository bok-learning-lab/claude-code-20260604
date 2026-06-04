# The pedagogical arc — three demos, three failure modes

*The Spider Chart, Stuffing the Prompt, and the Cloned Voice are not three independent demos. They are a single pedagogical sequence — three attempts to capture **voice**, each by a different mechanism, each failing in a precise and instructive way. This document is the connective tissue that ties the three operations docs together.*

---

## What the unit is asking

From [`inputs/workshop-overview.md`](../inputs/workshop-overview.md):

> *This unit has been asking — through Whitman, Dickinson, Lerner — what it means to write in a way that is distinctly yours. Not just the words you choose but the way you arrange them: the syntax, the line breaks, the recurring images, the formal habits that accumulate into something a reader recognizes as **you** before they see your name.*
>
> *Voice isn't one dimension of a poem. It's the whole operation — word choice, structure, rhythm, what gets said and what gets left out, which images recur and which don't. It is, in the terms this unit has been developing, the entire shape of a writer's attention.*
>
> *For this workshop, we are going to try to operationalize that question. Not to answer it — the unit's readings suggest that's impossible — but to design a process that attempts it, fails in instructive ways, and in failing, tells you something precise about what "voice" actually consists of.*

The three demos *enact* that program. None of them produces a satisfying simulation of any specific poet's voice. All three fail. The point is that they each fail *differently*, and reading the differences is what teaches the substance of the question.

## Demo 1 — The Spider Chart

**The mechanism:** Score poems on student-defined trait rubrics → average the scores → write a sonnet from the averaged numbers alone. See [`analyze-prompt.md`](analyze-prompt.md) and [`generate-from-scores-prompt.md`](generate-from-scores-prompt.md).

**What it gets right:** The output sits in roughly the right *mood region*. If the source was 80% melancholy and 60% nature imagery, the generated sonnet will be melancholy and have some nature imagery. The compression to scores is *legible* — the student can point at the chart and say "these are the dimensions."

**What it loses:** *Everything specific.* The generated sonnet does not sound like Shakespeare or like Whitman or like any actual person. It sounds *generic in the right neighborhood*. The trait scores were a coordinate system; the generated poem is *anywhere within that coordinate's basin*.

**The lesson:** Voice is not a vector of scores. The dimensions on the spider chart are *real* — they are things you can recognize in a poem — but a poet's work is not equally well-described by *each* poet's choice of which traits to score. The model fills in everything *under-determined by the scores* with median-of-corpus prose. The amount of substance lost in the compression is exactly the amount that voice consists of.

## Demo 2 — Stuffing the Prompt

**The mechanism:** Take three actual Shakespeare sonnets, paste them into the context, ask for a fourth in his style. See [`stuffing-the-prompt.md`](stuffing-the-prompt.md).

**What it gets right:** Period vocabulary. Iambic pentameter that lands. Period-appropriate turns. The output reads as *plausibly Shakespearean*. The next-token statistics are doing their work — the surrounding context full of "thee" and "thou" and "fair" and "summer's day" pulls the generation in the same direction.

**What it loses:** *The mind behind the choices.* Shakespeare's sonnets are not strings of period-appropriate vocabulary; they are *arguments*. The volta in Sonnet 18 ("But thy eternal summer shall not fade"), the turn into self-pity-then-recovery in Sonnet 29, the monumental claim in Sonnet 55 — these are intellectual moves, and Demo 2 produces only their *texture*. Sometimes it produces outright pastiche; sometimes it produces a line that is genuinely good; never does it produce a poem that *means something specific*.

**The lesson:** Reading the model's output of Demo 2 next to the three source sonnets is what teaches the student to read the source sonnets *more carefully*. The student can now name what the model failed to do — and naming the failure is the closest they will get to defining what Shakespeare *did* do. The model becomes a foil, not an instrument.

## Demo 3 — Is Voice Textual — or Multimodal?

**The mechanism:** Run Demo 1's pipeline on a 2006 Harvard Crimson article by **Prof. Moira Weigel** (the course's instructor) → score the article on the same five-trait rubric → generate a sonnet from those scores → play it aloud in a cloned version of Prof. Weigel's own voice. See [`voice-cloning-step.md`](voice-cloning-step.md).

**What it gets right:** *The acoustic.* The cloned voice is, by ElevenLabs's measure, indistinguishable from Prof. Weigel reading. The cadence, the timbre, the way certain consonants land — all there.

**What it loses:** *The text isn't hers.* Prof. Weigel did not write the sonnet being read. The LLM generated it from numbers derived from her published prose. The voice is correct; the words are second-order.

**The lesson:** The two halves of "voice" — the *text* and the *acoustic* — can be independently engineered. Demo 1 captures the trait profile, mediocrely. Demo 3 captures the acoustic, precisely. Neither — and nor both together — produces *Prof. Weigel's voice in the full sense* the unit has been asking about. The artifact has surfaces (text-surface, acoustic-surface) but no center.

## What the three demos teach together

| Demo | Mechanism | What it captures | What it misses |
|---|---|---|---|
| 1: Spider Chart | Trait scores → sonnet | The trait neighborhood | Specificity, choices, the mind |
| 2: Stuffing | Source poems → sonnet | Surface features, period feel | The argument the source poems are *making* |
| 3: Voice clone | Article scores → sonnet → cloned audio | The acoustic, the trait profile | The text's *intentionality*; the speaker as author |

A student who works through all three has been given **three distinct partial answers to "what is voice?"** — each in different vocabulary, each calibrated to a different layer. The workshop's question is not "which of these works?" — it is "what is missing from *all three*?" That missing thing is the thing the unit's readings have been pointing at.

## The transparency commitment

Every demo shows the student *the complete prompt sent to the model*. Demo 1 renders the averaged-scores prompt verbatim in a code block. Demo 2's prompt is documented in [`stuffing-the-prompt.md`](stuffing-the-prompt.md) and can be inspected via the network tab. Demo 3 shows the scored-trait values, the generation prompt, and names the speaker.

Nothing is hidden. That transparency is what lets the student do the analytical work — *if* the failure modes were obscured behind a polished UI, the demos would teach the wrong lesson (that AI does a creditable job of replicating voice). With the prompts and the scores visible, the failures are *legible*, and the legibility is the point.

## Adapting the arc to other questions

The pattern — **three attempts at the same hard question, each by a different mechanism, each failing differently, presented together** — generalizes well beyond literary voice:

- **Genre, in any medium.** What is "noir"? What is "lyric"? What is "the long-tracking-shot tradition in cinema"? Build three demos that each try to capture the genre by a different mechanism, see what each loses.
- **Authorial intention** in a research paper or argument. Score the paper's argumentative moves; stuff the full paper into the prompt for a successor; synthesize the author's voice and let them disagree with their own simulated argument.
- **Disciplinary voice** in a research community. What makes a paper sound like *physics*? Like *literary criticism*? Like *clinical medicine*? Three demos, three failure modes.
- **Pedagogical voice.** What makes a teacher's explanation work? Three attempts to capture it: scored on rubrics; stuffed with examples; voice-cloned reading something the teacher didn't write.

The constant across all of these is the **three-failure-modes-presented-together** move. Single-mechanism demos teach the *strengths* of the mechanism; three-mechanism demos teach the *limits* of the question.

## What this arc deliberately doesn't do

- **No combined "best of three" demo.** A fourth demo that combined trait scoring + stuffed context + voice cloning would suggest the right answer is "all of the above." It isn't. Each demo's limit is a separate teaching point; combining them muddies them.
- **No grading rubric.** Students aren't asked "which demo worked best?" — they're asked "what did each one miss?" The question is diagnostic, not evaluative.
- **No correction or refinement.** A second pass on each demo's output (judge, retry, score) would obscure the failure modes that are the point. The demos run once, the output stands, the limit is visible.

## Hard constraints (these survive translation)

- **Three demos, three failure modes, presented as a sequence.** The pedagogical move is the *contrast*, not any one demo.
- **Each demo's complete prompt is visible to the student.** Transparency is the precondition for analysis.
- **The instructor goes first** in Demo 3, with the full apparatus turned on her, before students are asked to subject themselves to the same procedure. The pedagogical risk is deliberately borne by the teacher.
- **Naming the failure mode is the assignment.** "What did the compression lose?" — that question, asked of all three demos, is the unit's actual content.
- **The artifacts teach their own limits.** Each demo's output is what makes the limit visible. No accompanying explanation can substitute for sitting with the output and noticing what isn't there.
