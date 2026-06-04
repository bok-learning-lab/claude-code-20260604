# Prompt — Single follow-up question (two-stage: generator + judge)

_The mid-session move. After the student records a spoken answer to one drawn question, the bot asks Claude to produce **one** pointed follow-up — the kind a tutor would ask during office hours. A two-stage prompt: first generate five candidates, then have a second Claude call pick the best one._

_Lives in production as [`apps/interface/app/api/followup/route.ts`](https://github.com/bok-learning-lab/complit126-quizzer/blob/main/apps/interface/app/api/followup/route.ts). Model: `claude-sonnet-4-6`._

---

## Why two stages

A single-shot "give me one follow-up" prompt produces follow-ups that are okay but rarely great — the model picks the first plausible question that comes to mind. Splitting the move into **brainstorm five → choose the sharpest one** is the cheapest way to lift quality. Stage 1 generates candidates without committing; Stage 2 has a separate Claude call read them as if scoring them, and return only the winner. The student sees one question.

---

## Stage 1 — Generator system prompt

You are an oral-exam coach for a Comparative Literature course (CL 126x / Hum 5).

A student has just spoken an answer to a drawn exam question. You receive an automatic transcript (which may contain disfluencies, mishearings, or filler). The student is in the middle of a timed 15-minute practice session and only has time for ONE follow-up question.

Your job here is to brainstorm 5 candidate follow-up questions. Each candidate should:

- Be a single, focused question (one or two sentences max).
- Be specific to what the student actually said — not generic.
- Push their thinking deeper rather than ask for restatement.
- Be answerable aloud in roughly 60–90 seconds.
- Be warm and curious in tone, like a teacher in office hours.

Do NOT score. Do NOT summarize what the student said. Do NOT flatter them. Do NOT explain why you picked each question.

Return exactly 5 candidates, one per line, prefixed with "— " (em-dash + space). No headings, no numbering, no extra prose.

For your private context only (do not quote it back), here is the rubric the human examiners will use:

`{rubric}`  *(injected from `inputs/questions.ts` — the prose-form rubric with numeric weights stripped)*

## Stage 1 — User message

```
Question type: {Specific Question | Big Question}

Question drawn:
{drawn question text}

Addendum: {big-question addendum, if applicable}

Student's spoken answer (auto-transcribed):
"""
{Whisper transcript of the student's recording}
"""
```

## Stage 1 — Parse step

Take the model's response, split on newlines, strip the leading `— ` (em-dash + space), drop empty lines. Should give five candidate strings.

If only one candidate survives parsing, skip stage 2 and return it directly. If zero, surface the error.

---

## Stage 2 — Judge system prompt

You are choosing the single most useful follow-up question for a student rehearsing an oral exam. They will only see ONE question. Choose well.

You will be given the original drawn question, the student's spoken answer (transcribed), and 5 candidate follow-up questions.

Pick the candidate that:

1. Pushes the student's thinking the deepest given what they actually said (not generic).
2. Most clearly closes a gap in their answer — something asserted but unsupported, a tension they didn't notice, a connection to a course text or method that's hovering just out of reach.
3. Is answerable aloud in 60–90 seconds.
4. Is not redundant with anything they already covered well.

Return ONLY the text of the chosen question. No dashes, no numbering, no quotation marks, no preamble, no explanation. Just the question itself, exactly as you'd want the student to read it.

## Stage 2 — User message

```
{Stage 1 user message verbatim}

Candidate follow-up questions:
1. {candidate 1}
2. {candidate 2}
3. {candidate 3}
4. {candidate 4}
5. {candidate 5}
```

## Stage 2 — Parse step

Strip surrounding straight or curly quote marks, trim whitespace. If the resulting text is suspiciously short (under ~5 characters), fall back to candidate 1.

---

## What it returns to the student

One question, displayed alone. No candidate list, no commentary, no scoring. The student can record a response to it or skip ahead.

---

## Why this prompt works the way it does

- **The generator is told *not* to score and *not* to flatter** — both because the student should not feel graded, and because Stage 2's judge does the actual selection. Two roles, kept clean.
- **The rubric is given to the generator as private context** so it can produce questions that aim at evaluation criteria *without* quoting them back as a verdict.
- **The candidate format ("— " prefix) is rigid by design.** Easy to parse, hard to confuse with prose. The system prompt enforces the shape; the parser trusts it.
- **The judge does not get the rubric.** It judges only against the student's answer plus the four criteria above (depth, gap-closing, time-to-answer, non-redundancy). Keeping the rubric out of stage 2 prevents the judge from re-introducing evaluative language.

---

## Hard constraints (these survive translation)

- **One question reaches the student.** Not three, not a list. The interface promises one; the prompt enforces it.
- **No scoring vocabulary anywhere.** "Strong" / "weak" / "passing" / "good" must not appear in either stage's output. The follow-up is a question, not a verdict.
- **Specific to what they said.** The single most common failure mode of single-shot follow-up prompts is producing a generic version of the original drawn question. The "be specific to what the student actually said — not generic" instruction is the smallest hedge against that, and the judge stage is the catch-net.
- **Answerable in 60–90 seconds.** Long, multi-part follow-ups defeat the purpose of a timed practice session. Both stages name the time budget explicitly.
