# Operation — Deterministic text analysis (the browser-side stats)

*The first of the two analyses the [`/memos`](https://a-project-on-calvino-interface-3kqu.vercel.app/memos) page performs. Computed live in the browser from the cleaned markdown shipped at `/memos/<memo>.md`. No model call, no API, no Python — just JavaScript over the text. Lives in production as the `analyse()` function in [`apps/mw-project-002/src/pages/MemosPage.jsx`](https://github.com/bok-learning-lab/a-project-on-calvino/blob/main/apps/mw-project-002/src/pages/MemosPage.jsx).*

---

## The pedagogical move

The student is asked to write Calvino's unwritten sixth memo (on **Consistency** — the lecture he was writing when he died in 1985). The page accepts their draft as text and re-runs the same set of measurements on it as on the five extant memos. Every chart on the page shows the five Calvino values plus the student's value as a dashed bar in the same units.

The measurements are deliberately *deterministic* — same input always produces the same output, no model variance, no probabilistic ranking. This is the counterweight to the page's other half (the embedding map, which is probabilistic). Together they let the student answer "do I sound like Calvino?" in two registers: by measurement, and by semantic neighborhood.

## The measurements

All formulas computed in JavaScript over a tokenized version of the cleaned memo body (the `# Title` H1 is stripped first so it doesn't pollute counts).

### Tokenization

```javascript
function tokenize(text) {
  return (text.toLowerCase().match(/[a-z']+/g) || []).filter(Boolean)
}
```

Lowercase, alphabetic tokens only, apostrophe-preserving (so *"don't"* stays one token). The choice of regex is conservative — it drops every numeric token, every accented character, every punctuation mark. The Italian-titles-in-italics stay as separate tokens (since markdown's `*Cosmicomics*` tokenizes to `cosmicomics`).

### Sentence splitting

```javascript
function splitSentences(text) {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z"'(])/)
    .map((s) => s.trim())
    .filter(Boolean)
}
```

A sentence ends with `.`, `!`, or `?` followed by whitespace and then a capital letter, quote mark, or open parenthesis. Calvino's prose is well-behaved on this front — almost no ellipses-as-sentences, almost no abbreviation traps.

### The seven core charts

The page renders these as hand-rolled SVG bar charts (no chart library — see [`embedding-map-explained.md`](embedding-map-explained.md) for the rationale of building the visualizations from scratch).

#### 1. Word count per memo

```javascript
wordCount = tokens.length
```

The simplest measurement and arguably the most useful — Calvino's memos are *not* the same length. Lightness is 8,140 words; Visibility is 5,265. The student's draft is plotted in the same units. A 1,500-word draft is *visibly* short; a 12,000-word draft is *visibly* long.

#### 2. Estimated oral delivery time

```javascript
oralMinutes = wordCount / 145
```

Calvino was going to deliver these as the **Charles Eliot Norton Lectures** at Harvard — they were drafted to be read aloud. At a reading rate of ~145 words per minute (typical for academic prose read aloud at conference pace), each memo's oral runtime can be estimated. A 1,000-word Consistency draft is ~7 minutes; Calvino's actual memos run 36–72 minutes. The student sees immediately whether they've drafted a lecture or a paragraph.

The 145 wpm rate is exposed as the constant `WPM` at the top of the page and named in the footer. Tunable.

#### 3. Lexical density (type-token ratio)

```javascript
lexicalDensity = (new Set(tokens).size) / wordCount
```

The ratio of *unique tokens* to *total tokens*. High lexical density means few repeated words — academic / encyclopedic prose. Low lexical density means lots of repetition — argumentative, hortatory, lecture-tone prose. Calvino's memos sit in a narrow band (typically 0.25–0.32 depending on length) because TTR is inversely correlated with length, and his memos are long. The student's draft, *if shorter*, will produce a higher TTR — and the chart deliberately reveals this artifact rather than correcting for it (no Yule's K, no MTLD, no length-corrected variant). The lesson: lexical density is length-sensitive, and that's part of what the measurement teaches.

#### 4. Quoted-material ratio

```javascript
const quotedRegex = /[“"]([^”"]+)[”"]/g
let quotedWords = 0
let m
while ((m = quotedRegex.exec(text))) {
  quotedWords += tokenize(m[1]).length
}
quotedRatio = quotedWords / wordCount
```

The fraction of words inside straight or curly double quotes. Calvino quotes *constantly* — Leopardi, Lucretius, Galileo, Borges, Queneau, Perec, Mallarmé. The quoted-material ratio is unusually high for his memos (often 10–20% of the words). A draft that quotes nothing is doing a different kind of work than Calvino was doing.

The regex catches both straight `"..."` and curly `"..."` quotes. Single quotes are deliberately *not* counted because they conflate quotation with possessive apostrophes in English.

#### 5. Frequency of own title-word

```javascript
const TITLE_WORDS = ["lightness", "quickness", "exactitude", "visibility", "multiplicity", "consistency"]
const titleWordFreq = Object.fromEntries(
  TITLE_WORDS.map((w) => [w, tokens.filter((t) => t === w).length])
)
consistencyCount = titleWordFreq.consistency  // for the student's draft
```

How often does Calvino actually use the word *lightness* in his lecture on lightness? (Lightness: ~80 times. Quickness: ~60 times. Exactitude: ~110 times.) The lecture *is* what its title says it is, in the most literal way. A draft of Consistency that uses the word *consistency* zero times has slipped into another lecture without realizing it.

This is also the only chart where the student's bar gets a different label ("Consistency") — because their title-word is different from any of Calvino's five.

#### 6. First-person density (per 1,000 words)

```javascript
const FIRST_PERSON = new Set(["i", "me", "my", "mine", "myself", "we", "us", "our", "ours", "ourselves"])
firstPersonCount = tokens.filter((t) => FIRST_PERSON.has(t)).length
firstPersonPer1k = (firstPersonCount * 1000) / wordCount
```

How often does the speaker appear as *I* (or, less commonly, *we*)? Calvino's memos are lecture-form — he uses *I* far more than a typical academic text. The density per 1,000 words is the comparable measure (since the memos differ in length). Students writing in a more formal register, with no *I*, will see a very low bar.

#### 7. Average sentence length

```javascript
sentenceLengths = sentences.map((s) => tokenize(s).length)
avgSentenceLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length
```

Mean words per sentence. Calvino's average lands around 23–25 across all five memos — long for English academic prose, characteristic for Italian literary prose, even after translation. This is the one stat that's most directly under the student's control: a draft of 12-word sentences "doesn't sound like him" in a way the student can act on.

### The sentence-length histogram (small multiples)

A second visual on sentence length: the *distribution*, not just the mean. Each memo gets a small histogram (220 × 110 px) showing the fraction of sentences in each 5-word bucket (1–5, 6–10, …, 55–60, 60+). Five small multiples for the Calvino memos plus a sixth (in black, dashed) for the student.

This catches what the mean hides — *Lightness* has long mean sentences but a long tail of very short ones (Calvino's epigrammatic moves: *"Lightness has a precise structure."*); *Exactitude* is more even. A draft with all sentences in one bucket is visibly different from a draft that spans buckets the way Calvino's does.

### Additional reader stats (only for the student)

When the student types into the draft composer, three extra panels appear:

- **Top keywords** — the ten most frequent content words in the draft, after stop-words and tokens shorter than three characters are filtered out.
- **Top "I + verb" phrases** — bigrams starting with `i` (e.g., *"I see"*, *"I follow"*, *"I imagine"*). Calvino's memos are rich in these; a student's draft either is or isn't.
- **Title-word echoes** — frequency of each of the six title words (lightness, quickness, exactitude, visibility, multiplicity, consistency) in the student's draft. Useful for seeing which of the existing memos the draft is *implicitly engaging*.

These are not computed for Calvino's memos — they're a coaching layer for the student's draft.

## What this operation deliberately doesn't do

- **No reading-level estimate** (Flesch-Kincaid, Gunning Fog, etc.). Reading-level formulas are noise on lecture prose translated from Italian — they over-react to syllable counts in a way that doesn't carry meaning here.
- **No sentiment, no emotion classification.** Calvino's prose mixes registers in ways that defeat single-axis sentiment scores. Skip it.
- **No style-matching adjustment.** The page does not tell the student "you'd be closer if you raised your lexical density." The measurement is presented; the inference is the student's.
- **No grading, no overall score.** Same posture as [`oral-exam-practice-bot`](../../oral-exam-practice-bot/operations/coachs-note-prompt.md). No combined "you're 73% Calvino" number. Every chart presents one dimension at a time, and the student looks at them all.
- **No model call.** This is the page's deliberate counterweight to the embedding map: every measurement is reproducible by hand. The student could check any of the numbers with a Python script.

## Hard constraints (these survive translation)

- **Computed live in the browser from the cleaned markdown.** No pre-computed JSON of stats. The browser fetches the five `.md` files and recomputes. This means the source of truth is the markdown; edit a memo, the numbers update.
- **Every measurement is reproducible.** A student curious about a bar can ask *what is this counting?* and the answer fits in a sentence.
- **Charts are hand-rolled SVG.** No chart library. Each chart is ~30 lines of JSX that renders rects + labels. This is what lets the page run any analysis without inheriting a library's idea of what a chart should look like — and what lets the same SVG render the dashed user-bar in the same units.
- **The student's bar is dashed.** Across every chart, the same visual convention: a dashed black bar, drawn in the same units as Calvino's solid bars. The student is *one of the lecturers* now.
- **One dimension per chart.** Resist combining metrics into a "score." Each metric is an axis; the student looks at all of them.
