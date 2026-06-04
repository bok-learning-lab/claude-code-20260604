# Operation — OCR pipeline (scanned PDF → cleaned per-memo markdown)

*The pipeline that produced the cleaned markdown in [`inputs/memos/`](../inputs/memos/). Three independent OCR passes (Tesseract, Claude vision, Gemini 3 Pro vision), then a per-token majority vote with a Claude judge for disagreements, then assembly into clean per-memo markdown. Lives in production as [`scripts/ocr/`](https://github.com/bok-learning-lab/a-project-on-calvino/tree/main/scripts/ocr) in the Calvino repo.*

*Not copied into this example folder because it's ten Python scripts; described here so a reader knows the shape and the trust posture. The output of this pipeline — the five `*.md` files in [`inputs/memos/`](../inputs/memos/) — is what the rest of the operations consume.*

---

## What it does, end-to-end

A 2-up scan of *Six Memos for the Next Millennium* (the Mondadori edition) is the starting point: a PDF where each page-image contains two book-pages side by side. The pipeline turns that into five clean markdown files — one per memo — that you can read, embed, count, and ship.

The Calvino corpus was OCR'd this way because no single OCR engine was reliable enough at the level of *prose* — not "92% accurate," but accurate enough that you can ship the result as the reading text. Three engines disagreed about Italian-typesetting features (the long dashes, italicized titles, footnote-number superscripts, accented characters); a Claude vision judge resolved the disagreements with the source image in hand.

## The ten scripts

```
scripts/ocr/
  .venv/                  ← Python venv (uvicorn, anthropic, google-genai, etc.)
  01_extract_pages.py     ← PDF → 300dpi PNGs, one per spread
  02_find_chapters.py     ← detect frontmatter + 5 chapter page ranges
  03_ocr_tesseract.py     ← Tesseract pass (baseline, fast, OK quality)
  04_ocr_claude.py        ← Claude vision pass (better at Italian typography)
  05_ocr_gemini.py        ← Gemini 3 Pro vision pass (best at footnotes and headers)
  06_reconcile.py         ← per-token vote across the three; judge picks the disputes
  07_assemble.py          ← stitch pages → memo; clean running heads + page numbers
  08_sweep.py             ← Gemini QA pass over the assembled memo (final clean)
  09_metrics.py           ← per-memo word counts, page counts, OCR confidence
  10_extract_critics.py   ← extracts text from critic PDFs (different shape — single-up)
  lib.py                  ← shared helpers (image loading, model clients, prompt scaffolding)
```

Run the scripts in order. Each is idempotent — re-running skips pages already processed (cached by a content hash). The whole pipeline takes ~20 minutes for the 134-page book, mostly waiting on Claude and Gemini API calls.

Output lives at `_context/mw-memos/<memo-name>/<memo-name>.md`, which is what was copied into [`inputs/memos/`](../inputs/memos/).

## The reconcile step — why it's the hard part

The interesting move is in `06_reconcile.py`. Three OCR engines produce three transcriptions of the same page. At a token level, they mostly agree. Where they disagree, the question is: *which is correct?*

Naive majority vote gets you ~95% accuracy — better than any single engine — but the remaining 5% is always the editorially-important stuff (the italicized book titles, the accented Italian, the long dashes that mark interpolations, the footnote markers). For those, a vote alone isn't enough.

The reconcile step:

1. For each page, align the three transcriptions token by token.
2. Identify the tokens where any two engines disagree.
3. For each disagreement, build a small prompt: *"Here is a tight crop of the image around this token; here is what Tesseract said; here is what Claude said; here is what Gemini said. Which is correct? If none of them, what is the correct text?"*
4. Send the crop + the three candidate tokens + the prompt to Claude vision (the judge).
5. The judge returns one token. That token wins.

The judge is given the source image — which is the whole point. The other two engines have already failed on this token; the only way to break the tie is to look at the image again with explicit attention to the disputed spot. The pipeline does that.

## Why three engines, not two

Two engines disagree often. Three engines either agree (in which case no judge is needed) or split (in which case the judge has a useful signal). The third engine is what makes the cheap-vote-where-possible / expensive-judge-where-needed pattern work — without it, every disagreement is binary and you'd be calling the judge constantly.

The pattern: cheap-when-possible, expensive-only-where-needed. Same posture as the [oral-exam-practice-bot's two-stage follow-up](../../oral-exam-practice-bot/operations/follow-up-prompt.md) (generator + judge) — applied here to OCR rather than to coaching.

## What the assembly step does

`07_assemble.py` takes the reconciled per-page text and:

- **Stitches pages within a chapter** into one continuous prose stream, joining hyphenated line-breaks (*"transpa-rency"* → *"transparency"*).
- **Strips running headers and page numbers** — every page in the Mondadori edition has *"LEZIONI AMERICANE"* at the top of the left page and the chapter name at the top of the right page; those get removed.
- **Preserves paragraph breaks** as `\n\n`.
- **Preserves italicized titles** as markdown `*…*`.
- **Marks footnotes** with a `[^n]` convention and collects them at the end of the memo.

The output is `_context/mw-memos/<memo>/<memo>.md` — one file per memo, no metadata frontmatter, just `# Title` followed by the prose. That's what's in [`inputs/memos/`](../inputs/memos/).

## What the sweep step adds

`08_sweep.py` is a final pass with Gemini 3 Pro: read the assembled memo as a *whole document* and flag anything that looks wrong — sentences that don't make sense, words that look like OCR errors that the per-token reconcile missed, paragraph breaks in the wrong place. Gemini outputs a list of locations with suggestions; a human reviews them before they're applied.

The `review-needed.md` file at `_context/mw-memos/review-needed.md` is the running list of suggestions the sweep flagged. Each one is "fix" or "leave" by hand.

## The metrics step

`09_metrics.py` walks the cleaned memos and produces per-memo statistics: word count, page count, paragraph count, sentence count, average sentence length, OCR-confidence percentile (from the underlying engines, not from the cleaned output). The numbers in this script's output are the *retrospective* check on the pipeline — did we land in the right ballpark?

For Calvino's five memos, the metrics file says:

| Memo | Words | Sentences | Avg sentence length |
|---|---|---|---|
| Lightness | 8,140 | 357 | 22.8 |
| Quickness | 6,838 | 285 | 24.0 |
| Exactitude | 10,420 | 432 | 24.1 |
| Visibility | 5,265 | 220 | 23.9 |
| Multiplicity | 7,531 | 296 | 25.4 |

(These are the same numbers the page recomputes live in the browser from the cleaned markdown — the [`MemosPage.jsx`](https://github.com/bok-learning-lab/a-project-on-calvino/blob/main/apps/mw-project-002/src/pages/MemosPage.jsx) `analyse()` function. See [`deterministic-text-analysis.md`](deterministic-text-analysis.md).)

## What this operation deliberately doesn't do

- **No "AI did the OCR" claim.** Three engines did the OCR; an LLM judge did the *disambiguation* on tokens the engines disagreed about. The phrase "AI-OCR'd" elides what's actually expensive (the judge).
- **No fine-tuning, no custom models.** Off-the-shelf Tesseract + off-the-shelf Claude vision + off-the-shelf Gemini vision. The hard work is in the pipeline, not in the model.
- **No batch mode for the judge.** Each disputed token gets its own image crop + three candidates + prompt. The judge is called per-disagreement, not in batches. The slowness is a feature: each call is small and inspectable.
- **No automatic acceptance of the sweep.** Gemini's "this looks wrong" list is reviewed by a human (`review-needed.md`). The pipeline doesn't trust the sweep enough to act on it autonomously.

## Hard constraints (these survive translation)

- **Three engines, one judge.** Cheap-vote-where-possible; expensive-judge-where-needed. With two engines you call the judge constantly; with three, the judge runs only on real disagreements.
- **Judge gets the image, not just the candidates.** The disagreement is broken by looking at the source again, not by reasoning about the candidates abstractly.
- **Idempotent per page.** Re-running the pipeline skips pages already processed. The unit of work is the page; the unit of cache is the page-hash.
- **Cleaning happens after reconciliation, not before.** Don't strip running heads before voting — the engines may disagree about whether something is a head or part of the body. Vote first, then clean.
- **The sweep is advisory, not authoritative.** Final cleaning passes are reviewed by a human. The pipeline's outputs are the cleaned memos in [`inputs/memos/`](../inputs/memos/) — but the trust is built incrementally, not all at once.
