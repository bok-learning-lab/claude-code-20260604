---
title: "Workshop"
nav_title: "Workshop"
sidebar_position: 2
phase: 2
tags: ["workshop", "prompt chaining", "python", "code"]
description: "The workshop session: a recap of key concepts from the in-class session, frameworks for organizing your chain, and a practical guide to building it."
next_page: "next-steps"
---

# Workshop

*Unit II: Voice, Style, and Form — Workshop Session*

---

**On this page:**

1. [Workshop Recap](#workshop-recap) — Key concepts from the in-class session: prompting, context, thinking models, and prompt chaining
2. [Frameworks](#frameworks) — Three structures for organizing the operations in your chain (STAR, Communication Model, Dramatistic Pentad)
3. [A Bank of Operations](#a-bank-of-operations) — The atomic steps you'll combine, in any order
4. [The Basic Chain, Step by Step](#the-basic-chain-step-by-step) — Each step in sequence: Score → Extract → Annotate → Build Context → Generate → Compare
5. [Going Further](#going-further-other-chain-configurations) — Other configurations: parallel tracks, feedback loops, branching by form

---

## Workshop Recap

> *"Good context engineering means finding the **smallest possible** set of **high-signal tokens** that maximize the likelihood of some desired outcome."*
> — [Anthropic, "Building Effective Agents"](https://www.anthropic.com/engineering/building-effective-agents)

> *This section synthesizes the key concepts from the in-class workshop session. It was generated from the workshop transcript and edited for clarity.*

### Where We Left Off

Before this session, you ran the spider chart and saw what a purely numerical representation of a poem produces when used to generate new text: something in the right emotional register, but without specificity. You tried feeding sonnets directly into a prompt, and you heard generated text read aloud in a synthesized voice.

The through-line across all three demos: the output works as a mood, not as a voice. The numbers capture *dimensions* of a poem — how melancholic it is, how romantic — without capturing the specific images, syntactic habits, and formal moves that make those qualities feel like one particular writer's. That gap is real. Closing it is what prompt chaining is for.

### Prompting: Strings In, Strings Out

The workshop began with a foundational question: what is prompting? Students offered that it's an input that leads to an output, that the goal is to obtain a desirable result, and that good prompts are clear, specific, and parameterized. The synthesis: prompting is, at its core, putting a string in to get a string out. That is the essence of what large language models do — they take a string of tokens (units roughly between characters and words, converted to numerical codes on the back end) and produce a string of tokens in response.

```
┌─────────────────┐              ┌──────────────────────┐
│  your prompt     │              │  model response       │
│  (a string)      │──▶  LLM  ──▶│  (a string)           │
│                  │              │                       │
│  "generate me    │   tokens    │  "Shall I compare     │
│   a sonnet"      │──▶ in/out ──▶│   thee to a summer's │
└─────────────────┘              │   day..."             │
                                 └──────────────────────┘
```

What makes a *good* prompt? Clarity, a certain level of specificity, and parameters — but the right level of specificity is task-dependent. Anthropic's context engineering guide calls this finding the *right altitude*: "the Goldilocks zone between two common failure modes." Too constrained — hardcoding exact logic — and the output is brittle. Too vague, and the model drifts. The optimal altitude is specific enough to guide behavior, yet flexible enough to let the model use strong heuristics. When you boil it down, prompting is just really good, clear communication.

### Context: The Length of a Novel

When you have a conversation with an LLM, you're building up context. Each exchange — your prompt, the model's response, your follow-up — accumulates in a context window. Most models have a context window of about 200,000 tokens, roughly the length of a novel. (Think of tokens as approximately words — the math isn't exact, but the intuition holds.)

But that space isn't all yours. Before you type anything, the system prompt takes up about 10,000 tokens. System prompts are the literal instructions that the company gives the model before any conversation begins. Claude, for instance, [publishes its system prompts](https://platform.claude.com/docs/en/release-notes/system-prompts) — and if you do a close reading, you'll see choices being made about your textual output that you never consented to. The system prompt specifies tone ("warm," "friendly, age-appropriate"), restricts emoji use, and reflects accumulated user complaints. It's an inherently reactive document: some of it comes from the company's values, and a lot of it comes from other users saying *I kind of hate this thing*.

```
Your context window (~200K tokens)
┌──────────────────────────────────────────────────────────────────────┐
│▓▓▓▓▓▓▓▓▓▓│                                                          │
│  system   │                  (available space)                       │
│  prompt   │                                                          │
│  ~10K     │                                                          │
└──────────────────────────────────────────────────────────────────────┘

After a few exchanges:
┌──────────────────────────────────────────────────────────────────────┐
│▓▓▓▓▓▓▓▓▓▓│░░░│▒▒▒▒▒▒▒▒▒▒│░░░░│▒▒▒▒▒▒▒▒▒▒▒▒▒│                     │
│  system   │you│  AI resp  │you │   AI resp    │   (remaining)       │
│  prompt   │   │           │    │              │                     │
└──────────────────────────────────────────────────────────────────────┘
  ▓ system prompt (you don't control this)
  ░ your input
  ▒ AI-generated text
```

The key insight: even something as technical-sounding as a "system prompt" is, at the end of the day, text. And working with text is precisely what you're doing in this course. You have the ability to read, critique, and construct documents like this — because you've all written papers, you've all made good instruction docs, and you've all decided what to highlight when reading.

### The Context Ratio Problem

Here the workshop introduced a key concept about agency. In a typical chat interaction, your input might constitute roughly 10,000 tokens — the system prompt and a few short messages. The AI's generated output, meanwhile, might occupy 30,000 tokens. You're giving a lot of agency to the LLM: both its system prompt and its generated text dominate the context window.

The metaphor from the session: a tiny input in a large context window is "weak and wobbly" — hallucinating, drifting, ignoring your instructions. The more context you add that you know is strong and you've personally vetted, the more deterministic the output becomes. You can say more cleanly: *this is all of my context, I know every element of this window is something I approve, now use all of it to produce something focused and finite.*

The goal is to reverse the ratio. Instead of giving the model a small prompt and getting a large, uncontrolled output, you provide rich, curated context and ask the LLM to produce something small and specific. That reversal is the core principle behind context engineering.

```
Typical interaction:
┌──────────────────────────────────────────────────────┐
│▓▓▓▓▓│░░│▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│   "weak and wobbly"
│ sys  │u │              AI output (~30K)              │   hallucinating, drifting
└──────────────────────────────────────────────────────┘

The goal:
┌──────────────────────────────────────────────────────┐
│▓▓▓▓▓│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│▒▒▒▒│   focused, deterministic
│ sys  │      your context (rich, curated)        │out │   you control the window
└──────────────────────────────────────────────────────┘
  ░ = context you wrote or approved
  ▒ = small, specific AI output
```

### From Thinking Models to Prompt Chaining

Thinking models (when you click "thinking" or "deep think" in a chat window) don't actually put more brain into the task. Instead, your prompt goes to an LLM that creates a plan — breaking the task into subtasks, pulling from training data, sometimes calling tools (code execution, web search). The results of these subtasks get packaged into context, and that context goes to the LLM, which generates the final output.

But you don't control any of these intermediate decisions. You can't intervene to say *no, don't use that sonnet as a reference* or *that's not what I meant by 'style.'* You're giving away the decomposition — the choice of what steps to take, in what order, with what tools — to the model.

```
  WHAT YOU SEE
  ┌──────────────┐                                        ┌──────────────┐
  │░░░░░░░░░░░░░░│── ── ── ── ── ── ── ── ── ── ── ── ──▶│ final output │
  │ your prompt  │                                        │ (sonnet)     │
  └──────┬───────┘                                        └──────▲───────┘
─────────┼──────────────── UNDER THE HOOD ───────────────────────┼────────
         ▼                                                       │
  ┌──────────────┐                                        ┌──────┴───────┐
  │  LLM         │    ┌────────┐ ┌────────┐ ┌────────┐   │  all context │
  │  makes a     │──▶ │"what is│ │"who is │ │"find   │──▶│  packaged    │
  │  plan        │    │a       │ │Shakes- │ │example │   │  together    │
  └──────────────┘    │sonnet?"│ │peare?" │ │sonnets"│   └──────────────┘
                      └───┬────┘ └───┬────┘ └───┬────┘
                          │          │          │
                          ▼          ▼          ▼
                    ╔═════════════════════════════════╗
                    ║    TOOLS (when needed)          ║
                    ║    </> code   (web) search      ║
                    ╚═════════════════════════════════╝

  you control: nothing in between
```

Prompt chaining takes that agency back. Instead of letting the model automate the decomposition, you design the sequence of operations yourself. To make this concrete, the workshop walked through an industry example: a customer service bot. A customer calls in and provides their name. That triggers a plan: query a database for the customer's order history, retrieve relevant policy documents, ask the customer to describe their problem, trigger a refund tool. Each step feeds into the next, all packaged into context for the final output. On the customer's side, they said a few things — on the back end, an entire chain of operations ran.

```
  CUSTOMER SIDE                    UNDER THE HOOD
  ─────────────                    ──────────────

  "Hi, I'm Alex" ─────▶  [plan] ──▶ query DB ──▶ order history ──┐
                                                                   │
  "I never got            [plan] ──▶ policy docs ──▶ refund rules ─┤
   my order" ──────────▶                                           │
                          [plan] ──▶ refund tool ──────────────────┤
                                                                   │
                                     ┌─────────────────────────────┘
                                     ▼
                               [package context] ──▶ [LLM] ──▶ response
```

The key insight: these best practices for getting consistent AI output were developed for call centers, business operations, and code generation — but they apply equally to making a sonnet. The workshop retrofits industry techniques for literary production.

### High-Signal Tokens

From the industry framing: "Good context means finding the smallest possible set of high-signal tokens that maximize the likelihood of some desired outcome." A high-signal token is one that carries the meaning of what you're actually asking the model to do — the actual content and argumentation, as opposed to noise tokens like publisher pages, metadata, and filler.

This is not a foreign concept. You already practice it when you read: you highlight key passages, you skip the frontmatter, you identify where an argument is finally being made. Context engineering is, in this sense, an extension of close reading — deciding what's signal and what's noise, and constructing a window that's as dense with signal as possible.

### The Workshop Activity

Students worked in groups with two tools: a computer (chat windows, no coding) and paper or index cards. The task was to generate a sonnet in the style of a chosen poet — not by one-shotting it, but by building a sequence of operations:

```
  chat (computer)                                    paper (log)
  ───────────────                                    ───────────
  ┌──────────┐    ┌──────────┐    ┌──────────┐
  │ 1. one-  │──▶ │ 2. diag- │──▶ │ 3. dia-  │
  │ shot     │    │ nose     │    │ logue    │
  └──────────┘    └──────────┘    └─────┬────┘
                                        │
                                        ▼
                                  ┌──────────┐    ┌──────────┐    ┌──────────┐
                                  │ 4. find  │──▶ │ 5. build │──▶ │ 6. add   │
                                  │ steps /  │    │ sequence │    │ loops +  │
                                  │ mechanics│    │          │    │ judges   │
                                  └──────────┘    └──────────┘    └─────┬────┘
                                                                        │
                                                                        ▼
                                                                  ┌──────────┐
                                                                  │ 7. pre-  │
                                                                  │ sent     │
                                                                  └──────────┘
```

1. **One-shot a sonnet.** Pick a poet and ask the model: *generate me a sonnet in the style of X.* Look at what comes back.
2. **Diagnose.** As a group, identify what's wrong with the sonnet. What's missing? What doesn't sound like the poet?
3. **Dialogue.** Have a back-and-forth conversation with the LLM. Tell it what's bad and what's good. When the model nails something based on a specific instruction, note it — that instruction could become a step.
4. **Identify atomic mechanics.** Each time the LLM succeeds at something because of how you prompted it, extract that as a repeatable operation. Maybe one step is about getting good imagery, another about choosing a conceit, another about fetching context on the author.
5. **Build a sequence.** Arrange the steps into an order. Open new threads to test whether the order matters. Think about what's the equivalent of a policy document for making a sonnet — what's the equivalent of customer data?
6. **Add loops and judges.** Maybe you want an LLM that judges the quality of the sonnet and provides pros and cons — and you want to run that not once but *N* times. The sequence doesn't have to be linear.
7. **Present.** Share the chain, the final sonnet, and an argument for why it works. If you had to leave this sequence as a stand-alone machine — no human in the loop — what would it be?

Context engineering and prompt chaining are not magic. They are sequences of focused operations — each one doing one thing, each one passing something to the next. The rest of this page gives you the tools to formalize what you practiced in the workshop.

---

## Frameworks

Before you start building, it helps to have a skeleton — a way to organize the operations in your chain before you decide what goes where. Frameworks from other fields give you a starting vocabulary: structures already tested for moving raw material through staged refinement.

You do not need to use these frameworkds, but we want to show you over and over again how you can pull expertise and structures from other fields to build your own "machines" for text production. You can continue to practice prompt chaining by picking a framework below (or find your own), slot operations into its slots, then decide on movement: do the operations chain linearly, loop, branch, or hand control back to you? Plan it on paper before you write any code.

---

### STAR — Situation, Task, Action, Result

Originally a job-interview preparation structure, recently tested as a prompt architecture. [Jo (2026)](https://arxiv.org/abs/2602.21814) found that STAR-structured prompts reached 85% accuracy on an implicit-constraint reasoning task where bare prompts scored 0% — because the **Task** step forces explicit goal articulation before any output is generated.

| Slot | Question to answer | Example |
|---|---|---|
| **Situation** | What are you working from? | 3 Whitman poems; I want to capture his long-line cataloguing and direct address |
| **Task** | What would a successful output actually do? | A poem that sounds like it comes from the same place — not a copy, but recognizably his |
| **Action** | Which operations, in which order? | Score → Extract → Annotate → Build Context → Generate → Judge |
| **Result** | How will you know if it worked? | Compare against scores-only output; identify what the chain added |

The key move is the Task step. Defining success *before* you build the chain forces you to think about what "voice" means for your poet — which is the hard question this exercise is organized around.

---

### Communication Model — Speaker, Message, Audience

This model reflects a classical rhetorical structure in which each message connects a Speaker to an Audience via two dimensions: Form (how something is said) and Content (what is said).

```
Speaker ──┬──▶ Form ─────┬──▶ Audience
          │      │       │
          └──▶ Content ──┘
                (Message)
```

| Slot | What it maps to in a voice chain |
|---|---|
| **Speaker** | The source poet — your input poems and what you extract from them |
| **Form** | Syntactic habits, line structure, rhythm, formal choices — separable from content |
| **Content** | Themes, poetic images, recurring concerns — what the poems are about |
| **Audience** | Who the generated text is for, and in what context it will be read |

This framework draws attention to a split the spider chart collapses: Form and Content can be extracted in separate steps, weighted differently, and passed to the generation step as distinct variables. The interesting design question is whether your poet's voice lives more in Form or in Content — and what happens to the output when you give the model one but not the other.

---

### Dramatistic Pentad — Act, Scene, Agent, Agency, Purpose

Kenneth Burke's [Dramatistic Pentad](https://en.wikipedia.org/wiki/Dramatistic_pentad) is a framework for analyzing any human action by asking five questions simultaneously. Where STAR sequences steps and the Communication Model separates form from content, the Pentad asks you to hold five dimensions in tension at once — and to notice which *ratio* (Act:Agent, Agency:Purpose, etc.) dominates your design.

| Slot | Question | What it maps to in a voice chain |
|---|---|---|
| **Act** | What is being done? | The output itself — a sonnet, a chorus, a spoken-word verse |
| **Scene** | In what context? | Formal constraints, genre, platform — where the output lives |
| **Agent** | Who is doing it? | The source poet — and, separately, the model executing the steps |
| **Agency** | By what means? | The operations in the chain — extraction, annotation, generation |
| **Purpose** | To what end? | Your argument about what voice *is* for this poet |

The most useful design question the Pentad raises is about **ratios**: which term drives the others? A chain dominated by *Agency* (the operations) produces different outputs than one dominated by *Purpose* (the goal). If your chain front-loads extraction and annotation, you're running an Agency:Act ratio — the means shape the output. If you define the purpose first (as STAR's Task step requires), you're running a Purpose:Agency ratio. The Pentad doesn't tell you which is correct; it makes the choice visible.

---

Each framework is a skeleton for organizing operations, not a formula. Once you've chosen one and slotted in your operations, the remaining design decisions are about movement: does the chain run linearly, loop back on a judge step, branch into parallel tracks, or pause for your input partway through?

---

## A Practical Guide to Building Your Chain

*The rest of this page is the technical guide. The [Appendix](/reading/appendix-open-game) has some intellectual history for those who want it.*

---

## The Core Idea

A prompt chain is a sequence of calls where **the output of one step becomes part of the input for the next**. Each arrow is a separate API call doing one focused thing.

You've already run the simplest possible version of this. The spider chart is a two-step chain:

```
Poem ──▶ [Score] ──▶ trait values
                          │
                          ▼
                    [Generate] ──▶ sonnet
```

Step 1 compresses a poem into numbers. Step 2 generates new text from those numbers. That's the whole thing — and you saw exactly what it costs: the sonnet comes out in the right register, but it sounds like no one in particular.

The fuller chain you'll build today adds steps between Score and Generate — steps that preserve more of the actual language before it gets compressed away:

```
Poem ──▶ [Score]   ──▶ trait values     ─┐
Poem ──▶ [Extract] ──▶ phrases, images  ─┤
          [Annotate: you]               ─┼──▶ [Build Context] ──▶ [Generate] ──▶ draft
          ... repeat for 3+ poems      ─┘
```

Same structure. More steps between input and output, each one preserving something the spider chart discarded. The sequence below walks through each step — read it to understand the logic, then modify it to suit your poet. The Python notebook implements this chain; the code is there when you need it.

---

## A Bank of Operations

Every step in a chain is one of a small number of atomic operations. This is not a full list of operations-- feel free to invent some yourself. But we wanted to provide a few examples to give you a starting point. These combine in any order, any number of times. The diagram section below shows a few configurations. The interesting design question is which sequence suits your poet and your goal.

| Operation | What it does | Example instruction |
|---|---|---|
| **Score** | Assign numerical values across defined traits | *"Score each trait 1–10, return JSON with one-sentence reasoning"* |
| **Extract** | Pull specific elements from text | *"List the 5 phrases most distinctive of this voice"* |
| **Annotate** | You add a judgment or reason — no model call | *(you write this)* |
| **Summarize** | Compress multiple inputs into a shorter form | *"Write a 50-word portrait of this poet's emotional range"* |
| **Generate** | Produce new text from accumulated context | *"Write a verse using only the imagery in this profile"* |
| **Vary** | Produce N alternatives | *"Write three choruses, each with a different formal approach"* |
| **Critique** | Identify weaknesses in a draft | *"What is the single weakest line — the one least like this poet?"* |
| **Judge** | Select the best from N candidates | *"Which of these drafts best captures the voice? Explain."* |
| **Rewrite** | Revise against a constraint | *"Rewrite with no adjectives"* — though see below for who does this |
| **Route** | Decide what happens next | *"Does this need revision? Answer YES or NO."* |

---

## The Basic Chain, Step by Step

### Score

```
SCORE:
  input  → poem text, your trait list
  ask    → "score each trait 1–10, return JSON with one-sentence reasoning"
  output → scores{}
```

This is the spider chart step — the same operation the web tool performs. Run it for each poem in your pool (aim for 3+). At the end, average the scores across all poems. These averaged values are your baseline and your comparison target.

---

### Extract

```
EXTRACT:
  input  → poem text
  ask    → "list 5 phrases or lines that feel most distinctively like this poet"
  output → candidate_phrases[]
```

This is the step the spider chart skips. Where scoring compresses a poem into numbers, extraction keeps the actual language — the specific images, syntactic habits, and turns of phrase that make a voice feel like itself. Run this for each poem alongside the scoring step. You may decide the LLM is good at making these choices, or you may decide you want to make choices like this yourself-- which gets to the next step.

---

### Annotate

```
ANNOTATE (you — no model call):
  from candidate_phrases[], pick the ones that feel right to you
  for each: write one sentence — WHY this line, in your own words
  output → annotated_quotes[]
```

This step has no API call. It's you reading, selecting, and making a judgment. It's also the step that the model cannot do — it can surface candidate phrases, but it cannot tell you which ones matter and why. That act of selection and annotation is close reading. The annotated quotes you build here become the most important input to your generation step.

---

### Build Your Context Object

```
BUILD CONTEXT:
  input  → annotated_quotes[], averaged scores, anything else you choose
  ask    → [optional: ask model to compress; or pass your annotations directly]
  output → context_block
```

The Python notebook calls this `poet_profile` — a 150-word prose description the model synthesizes from texture analyses. It's one approach. It is also, to be direct, the lazier one: you handed the synthesis back to the model, which will treat it approximately the way it treats the numerical scores: as abstracted description rather than specific language.

More generative alternatives for what `context_block` can be:

- Your annotated quotes as-is, passed directly
- A list of 10 poetic images — verbal figures, not picture files — the model is **allowed to use** (and no others)
- Constraints you wrote yourself: *"end every stanza with a question," "no adjectives in the chorus"*
- The raw poem text with no synthesis at all
- Multiple variables, each feeding into the generation step for a different reason

Whatever you build, it must appear in the generation call. If it doesn't, it isn't doing work.

---

### Generate

```
GENERATE:
  input  → context_block, averaged scores
  ask    → "write a verse, chorus, and bridge in this style;
            do not copy lines — write something new that sounds like it
            comes from the same place"
  output → first_draft
```

This is where everything you've built pays off. The more specific and human-authored your context block, the more specific the output will be. A model-written prose description will produce a different result than your own annotated list of lines and reasons — and the comparison between those two will tell you something useful about what "voice" actually consists of.

---

### Compare

```
COMPARE:
  GENERATE (scores only):
    input  → averaged scores, nothing else
    ask    → "write a love song with these trait scores"
    output → scores_only_draft

  read both outputs side by side:
  → which uses more concrete imagery?
  → which sounds more like your poet?
  → what, specifically, did the chain add?
  → which steps mattered most — and how do you know?
```

The differences between these two are the point of this exercise. Not "the chain is better" (though it probably is) — but *why*, specifically. Which step added what? What did your annotated quotes contribute that numerical scores couldn't?

---

### Judge

```
JUDGE:
  input  → first_draft, your annotated_quotes[]
  ask    → "what is the weakest line — the one that sounds
            least like this poet? quote it, then explain why"
  output → critique
```

The judge step is another place to practice putting your metacognition into words. You can also run it across multiple drafts: generate three versions and ask the model to select the strongest, with explanation. What you do with the critique is the next step.

---

### Rewrite

```
REWRITE (you — not the model):
  read   → critique + your original poems
  decide → what to put in place of the weak line, and why
  output → revised_draft
```

Up to you to decide whether the model does this or you do. The model can identify a weak line; but it may not be good at deciding what should replace it.

---

## Going Further: Other Chain Configurations

These are not exotic patterns. Every one of them is built from the same operations in the table above — assembled differently.

```
LINEAR (what the notebook implements)
────────────────────────────────────────────────────────────────────────
Poems ──▶ [Score] ──▶ [Extract] ──▶ [Annotate] ──▶ [Build Context] ──▶ [Generate] ──▶ Draft


GENERATE MULTIPLE, THEN JUDGE
────────────────────────────────────────────────────────────────────────
                                            ┌──▶ Draft A ───┐
Poems ──▶ [Score] ──▶ [Build Context] ──────┼──▶ Draft B ───┼──▶ [Judge] ──▶ Best
                                            └──▶ Draft C ───┘


ITERATIVE REFINEMENT (feedback loop)
────────────────────────────────────────────────────────────────────────
Poems ──▶ [Build Context] ──▶ [Generate] ──▶ [Critique] ──┐
                                   ▲                       │
                                   └──── you Rewrite ──────┘
                                         (repeat 2–3×)


PARALLEL EXTRACTION TRACKS
────────────────────────────────────────────────────────────────────────
          ┌──▶ [Extract: imagery & metaphor]     ──┐
Poem ────▶│                                        ├──▶ [Build Context] ──▶ [Generate]
          └──▶ [Extract: sound, rhythm, syntax] ───┘


BRANCHING BY FORM
────────────────────────────────────────────────────────────────────────
                                       ┌──▶ [Generate: ballad]      ──▶ Track 1
Poems ──▶ [Build Context] ─────────────┼──▶ [Generate: spoken word] ──▶ Track 2
                                       └──▶ [Generate: duet]         ──▶ Track 3
```

The notebook implements the linear chain. Your assignment is to treat it as a starting point. Every pattern above is built from the same operations in the table above — and there are more combinations than any diagram can show.

---

## What's Next

Head to **[Next Steps](/reading/next-steps)** for three ways to build your chain for the assignment:

1. **Conversational chat** — do it in stages in any chat interface, saving each step's output. Best for focusing on the writing rather than the code.
2. **Python notebooks** — a base notebook that implements the chain above, plus **workshop notebooks for each poet** built from your group's prompt chains. Your group's specific architecture is already translated into runnable Python — use it as a starting point.
3. **Something custom** — build your own tool, use a different SDK, or design a workflow we haven't thought of. The Learning Lab can help.

---
