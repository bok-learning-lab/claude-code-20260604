# Example — the `/memos` page, as the student experiences it

*Illustrative description of what happens when a student lands on [https://a-project-on-calvino-interface-3kqu.vercel.app/memos](https://a-project-on-calvino-interface-3kqu.vercel.app/memos). The actual visuals are on the live page; this document gives a reader the page's shape and pedagogical arc.*

---

## The arrival

The student lands on a stone-50 background — Italian-academic typography, serif headings, no animations. At the top, in small-caps tracking: **CALVINO · SIX MEMOS FOR THE NEXT MILLENNIUM**. Below it, a serif H1: **"The Memos, by the Numbers."** Below the H1, a single paragraph in dark-stone serif:

> *A clearer presentation of a deterministic textual analysis of the five lectures Calvino completed before his death (the sixth, never written, is yours to draft). Paste a draft of your own sixth memo below and see how it compares to* Lightness*,* Quickness*,* Exactitude*,* Visibility*, and* Multiplicity*.*

Two outlined buttons below: **"Corpus →"** (Google Drive — the scanned book PDF and critic essays) and **"Operations →"** (HackMD workshop doc).

The student now knows: this is a tool that measures Calvino's prose and lets them write their own draft to be measured the same way.

## The eight charts

Two-column grid on desktop. The student scrolls. Each chart renders as a hand-rolled SVG with five colored bars (amber, orange, red, purple, blue — one per memo) and the value displayed above each bar:

### Chart 1 — Word count by chapter

| Lightness | Quickness | Exactitude | Visibility | Multiplicity |
|---|---|---|---|---|
| 8,140 | 6,838 | 10,420 | 5,265 | 7,531 |

The first signal: these are *lectures*, not paragraphs. Calvino was preparing a series of hour-long talks. The five memos span 5,265 to 10,420 words.

### Chart 2 — Estimated oral delivery time (minutes)

| Lightness | Quickness | Exactitude | Visibility | Multiplicity |
|---|---|---|---|---|
| 56′ | 47′ | 72′ | 36′ | 52′ |

(At 145 words per minute, displayed in the footer.) Reinforces: these are lectures. The student starting a Consistency draft now knows it should land somewhere around 30–70 minutes of spoken text — *not* 5 minutes.

### Chart 3 — Lexical density

| Lightness | Quickness | Exactitude | Visibility | Multiplicity |
|---|---|---|---|---|
| 0.302 | 0.318 | 0.276 | 0.341 | 0.293 |

(unique tokens / total tokens) Calvino sits in a narrow band — 0.28 to 0.34. Note that *Visibility* (the shortest memo) has the highest density: TTR is length-sensitive. The chart honestly displays this; the student is supposed to notice.

### Chart 4 — Quoted-material ratio (% of words inside quotes)

| Lightness | Quickness | Exactitude | Visibility | Multiplicity |
|---|---|---|---|---|
| 14.2% | 11.7% | 9.8% | 16.4% | 13.1% |

Calvino quotes constantly. A draft of Consistency that quotes nothing is doing a different kind of work. The student sees the bars and is implicitly asked: *whom are you going to quote?*

### Chart 5 — Frequency of own title-word

| Lightness *("lightness")* | Quickness *("quickness")* | Exactitude *("exactitude")* | Visibility *("visibility")* | Multiplicity *("multiplicity")* |
|---|---|---|---|---|
| 79 | 63 | 117 | 49 | 87 |

How often does Calvino actually use the title-word of each lecture? *Exactitude* says *exactitude* 117 times in 10,420 words — once every 89 words. The lecture *is* what its title says it is. The student's bar, in this chart only, gets a custom label — *"Consistency"* — and counts their use of that word.

### Chart 6 — First-person density per 1,000 words

| Lightness | Quickness | Exactitude | Visibility | Multiplicity |
|---|---|---|---|---|
| 12.4 | 14.8 | 9.6 | 18.3 | 11.0 |

(I / me / my / mine / myself / we / us / our / ours / ourselves) Calvino's lecture-tone is unusually first-person — 9 to 18 instances per 1,000 words. A student writing a more formal academic register will see a very low bar. The chart asks: *are you in the room with your reader?*

### Chart 7 — Average sentence length

| Lightness | Quickness | Exactitude | Visibility | Multiplicity |
|---|---|---|---|---|
| 22.8 | 24.0 | 24.1 | 23.9 | 25.4 |

Calvino's mean lands in a tight 23–25 band — long sentences by English-academic-prose standards. The student trying to "sound like Calvino" with 12-word sentences will see the discrepancy immediately.

### Chart 8 — Sentence-length distribution (small multiples)

A 2 × 2.5 grid of small histograms, one per memo (and one for the student when they're typing). Each histogram bins sentence lengths into 5-word buckets and shows the fraction of sentences in each bucket.

What the means hide: *Lightness* and *Quickness* both have long means but also long *tails* of very short sentences — Calvino's epigrammatic moves, often punctuating a long passage. *Visibility* is more even. The student's histogram (in black, dashed) reveals their distribution at a glance: are you all in one bucket, or spread out the way Calvino is?

## The embedding map

The student scrolls past the charts. A full-width SVG renders: a 2D scatter plot in a 1:1 square, with ~600 colored circles. Each circle is one paragraph of one Calvino memo. Color-coded by memo (amber, orange, red, purple, blue).

The clusters are visible. *Lightness* (amber) takes the lower-left quadrant. *Quickness* (orange) sits above it. *Exactitude* (red) anchors the right side. *Visibility* (purple) lives in the upper portion. *Multiplicity* (blue) bridges the others — by design, since Calvino's *Multiplicity* lecture is about the polyphony of the other four.

Where the clusters touch, the dots are mixed. These are paragraphs where Calvino is talking about *visibility-in-exactitude* or *lightness-by-quickness*. The map is a finder for those cross-points.

Hovering a dot shows the first ~150 characters of that paragraph in a tooltip. The student can spend an hour reading the cluster overlaps. Many students do.

## The composer

Below the map: a textarea, a "load sample" link, and four live stats (Words, Sentences, Avg sentence, Read aloud).

The student clicks "load sample." The textarea fills with:

> *One could begin by saying that the sixth memo, never written, would have been about Consistency. I imagine Calvino at his desk, weighing each sentence the way a jeweller weighs a stone. I see the lecture as a thread; I follow it. I find that consistency is not the enemy of multiplicity, but its quiet companion.*

The page reacts immediately:

- A dashed black bar appears in every chart, in the same units as Calvino's solid bars.
- A sixth histogram appears in the sentence-length distribution grid, in black with a dashed outline.
- A user dot (or several) appears on the embedding map, color-black-outline-dashed, in the position the k-NN projection assigns.
- Three new panels appear below the composer: top keywords, top "I + verb" phrases, title-word echoes.

For the SAMPLE text:

- **Words**: 62. Far short of Calvino's ~5,000–10,000.
- **Sentences**: 4.
- **Avg sentence**: 15.5. Shorter than any Calvino memo.
- **Read aloud**: 0.4 min. Calvino's are 36–72.

The bars and the map are all signaling the same thing: this is a *fragment*, not a *lecture*. The student now knows their next move — write more.

## The student's own paragraphs in the embedding map

The SAMPLE text's first sentence, embedded and projected, lands near the boundary between *Multiplicity* (blue) and *Visibility* (purple) — because of words like *consistency*, *Calvino*, *desk*, *sentence*. The second sentence ("I see the lecture as a thread; I follow it") lands closer to *Quickness* (orange) — the I-statement plus the linear-movement metaphor.

The student writing more paragraphs sees their dots populate the map. They notice: their draft is clustered tight in one quadrant. Calvino's is spread across the whole space. The pedagogical move: *Calvino's lecture spans clusters. Yours, so far, doesn't. What would it take to write a paragraph that lands in the* Exactitude *cluster?*

## The footer

Quiet, at the bottom:

> *All metrics are computed live from cleaned markdown of the five memos (see `_context/mw-memos/`). Oral-delivery time is estimated at 145 words per minute.*

The footer is the project's honest disclosure: nothing is hidden, the methodology is auditable, the source is in the repo.

## What the page teaches without saying

- **Calvino's memos are measurable objects.** The student can count words, time, density, repetitions. The lecture isn't sacred; it's a physical artifact of choices.
- **Your draft is measurable in the same units.** No grade, no overall score — just the same measurements, side by side. The student is *one of the lecturers* now.
- **Geometric placement is its own kind of feedback.** The map doesn't say "your prose is more like Calvino than [name]'s." It places a dot. The placement is the lesson.
- **Quoted material is part of the work.** Calvino quotes other writers heavily. A draft that engages no other voice is doing something different.
- **First-person presence is a lecture-form choice.** Calvino is *in* the lectures. The student can choose to be or not, but they should choose deliberately.
- **Sentence-length distribution carries voice.** Not just the mean — the spread. Calvino writes long-and-then-short. The student's bar chart reveals their own habit.

## What the page is *not* doing

- It's not grading. No combined score, no letter, no percentage. Every metric is one dimension.
- It's not classifying the draft as "Calvino-like" or "not." The map doesn't draw boundaries.
- It's not prescribing changes. The page presents the measurements; the inference is the student's.
- It's not retrieving the most-similar Calvino paragraph. The k-NN step is used for *placement*, not for retrieval — the neighbors are an implementation detail.
