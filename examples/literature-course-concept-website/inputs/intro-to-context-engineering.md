---
title: "Learning Lab Intro to Context Engineering"
nav_title: "Intro to Context Engineering"
sidebar_position: 1
phase: 2
tags: ["reading", "context engineering", "prompt chaining"]
description: "What does an LLM actually see? How context shapes output — and what that means for writing love songs with AI."
---

# Learning Lab Intro to Context Engineering

*A reading for CompLit 126x: Love in Context*

---

## What Does an LLM Actually See?

When you send a prompt to a language model, it sees exactly what you give it — and nothing else.

This sounds obvious. But it has a consequence that isn't obvious until you run into it: **the quality of the output is bounded by the quality and completeness of the input.** The model has no memory of your previous sessions, no access to your intentions, no ability to go read the poems you're thinking of. It only has the text in front of it.

This is what "context" means in the phrase *context engineering*: the total set of information that goes into a model's input window before it generates a response. Context engineering is the craft of deciding what that information should be — what to include, what to leave out, how to structure it, in what order, and why.

If prompt engineering is about *what you ask*, context engineering is about *what you bring with you when you ask it*.

---

## A Demonstration: Two Ways to Ask for a Love Song

You've been spending time this unit reading sonnets — Shakespeare, Millay, Keats, and others. Imagine you wanted an AI to write a new love song inspired by these poems. You could approach this two ways.

**Approach 1: Ask from a summary.**

You run each poem through an analysis tool and extract a set of trait scores:

```
Melancholy:      6.2 / 10
Romanticism:     8.4 / 10
Nature Imagery:  7.1 / 10
Mortality:       7.8 / 10
Optimism:        4.9 / 10
```

Then you hand these numbers to the model and ask: *write a love song with these characteristics.*

What you get back will probably be technically correct. It may even be competent. But it will almost certainly feel generic — like a song assembled from parts rather than born from a voice. It will have "some sadness" and "nature references" and "romantic feeling" in the way that a paint-by-numbers picture has color.

**Approach 2: Ask with the poems.**

You keep the scores — they're useful for understanding the shape of the work. But you also give the model the actual poems: their specific images, their rhythms, their turns of phrase, the particular way this poet moves from line to line. Now when you ask for a love song, the model has something real to work from.

The difference in output is not subtle. One version knows that something has an "Optimism score of 4.9." The other has read the lines:

> *What lips my lips have kissed, and where, and why,*
> *I have forgotten.*

The score tells you a *quantity*. The poem gives you a *quality* — a texture, a voice, a way of seeing. These are not the same thing, and the gap between them is exactly the gap you will feel in the output.

---

## Why the Spider Chart Is Useful (and Where It Falls Short)

The spider chart tool you've been using does something genuinely valuable: it lets you *compare* poems across dimensions, to see at a glance that Keats is more preoccupied with mortality than Millay, or that Shakespeare uses more nature imagery than Ashbery. It creates a shared vocabulary for talking about poems analytically.

But a radar chart is a **compression**. It takes a poem — a dense, particular, irreducible object — and reduces it to five or six numbers. Compression always involves loss. The question is whether the loss matters for what you're trying to do.

For *comparison*, compression is a feature. The chart strips away everything except the dimensions you care about, making the patterns visible.

For *generation*, compression is a problem. When you want to write something new, the stripped-away parts are often exactly what you need. The model can't reconstruct Frank O'Hara's voice from a score of 3/10 on the Mortality scale. That score tells you he's not very preoccupied with death. It doesn't tell you that he's instead preoccupied with soft drinks and Frank's baseball and the way New York City sounds in the afternoon.

This is the core tension in context engineering: **the representations that are useful for analysis are often not the representations that are useful for generation.**

---

## What Is Prompt Chaining?

One of the most powerful techniques in context engineering is **prompt chaining** — breaking a complex task into a sequence of smaller prompts, where the output of each step becomes part of the input for the next.

Think of it like writing: you don't sit down and produce a final draft in one pass. You brainstorm, then outline, then draft, then revise. Each stage builds on the one before it, and each stage gives the next stage something richer to work with.

In our case, the chain might look like this:

**Step 1 — Extract the spider chart.**
Send each poem to the model with your trait definitions. Get back structured scores and reasoning. This is what the spider chart tool does now.

**Step 2 — Extract the texture.**
Send each poem to the model again, with a different prompt. This time, ask it to pull out the specific images, phrases, and formal moves that make this poem feel like itself. Ask for concrete examples — not "this poem is melancholic" but "the poem conveys melancholy through the image of frost on a mirror and the phrase 'the singing of a solitary voice.'"

**Step 3 — Build a style profile.**
Combine the outputs of steps 1 and 2 into a rich description of the poet's voice: not just their trait scores but their characteristic moves, their recurring imagery, their relationship to rhyme and rhythm, their typical arc of feeling from opening to close.

**Step 4 — Generate with full context.**
Now ask the model to write a love song — but pass it the full style profile, including the actual extracted phrases and images. The model now has something real to work from.

Each step in this chain does something the single-prompt approach can't: it lets the model slow down, build up, and hand forward a richer representation of what it has learned.

---

## Context Is a Design Decision

Every prompt is a set of choices about what to include and exclude. Those choices shape the output in ways that are predictable once you understand them.

Ask yourself, for any generation task:

- **What does the model actually need to produce good output here?**
  Facts? Examples? Tone? Voice? Structure?

- **What am I giving it instead?**
  A summary? A score? A vague instruction?

- **What is in the gap between those two things?**
  That gap is where the output will fail.

For the love song assignment, the gap between "scores only" and "actual poems" is very large — because poetry is exactly the kind of thing that resists reduction to numbers. A poem's power lives in its specific language, and specific language is what the model needs to imitate it.

Closing that gap is your job as a context engineer. The tools are there: you can pass in the poems themselves, you can extract key phrases first, you can describe the formal features, you can give the model examples of the kind of thing you want. The question is which combination of these things produces the best result — and that's something you'll discover only by experimenting.

---

## What to Do Next

Before the workshop session, you'll use the [Poem Personality Analyzer](/) to do the following:

1. **Select your favorite poet** from those we've read in this unit.

2. **Find at least three more poems** by that poet (beyond those assigned).

3. **Paste each poem into the analyzer** and build up a spider chart of their work across your chosen traits. What patterns do you see?

4. **Click "Generate First Draft Lyrics"** to see what the model produces from scores alone.

5. **Reflect**: What is missing? What did the compression lose? What would you need to give the model to get closer to your poet's actual voice?

Bring your generated lyrics and your reflections to the workshop. We'll use them as the starting point for building a prompt chain together.

---

*Further reading: [Workshop](/reading/prompt-chaining-guide)*
