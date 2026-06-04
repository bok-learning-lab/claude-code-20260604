# CLAUDE.md — Image API widget ("The Virtual Camera")

Project-level instructions loaded when Claude Code starts in this folder.

## What this example is

A worked example of a **provider-agnostic image-generation API widget** drawn from the production project at <https://stable-diffusion-widget-interface.vercel.app/>. The user writes a prompt, optionally uploads a source image, optionally pins a seed, clicks generate — and gets one image back from Stable Diffusion (via Replicate, with HuggingFace as a free-tier fallback). The substance of the example is **not** "how to call Stable Diffusion" — that's the easy part. The substance is what the project does *around* the API call: a critical framework (Alexander Kluge's "A Few Preliminary Rules") rendered in the UI sidebar, with specific UI controls tied to specific rules. See [summary.md](summary.md) for the move worth noticing and what you can translate it to.

This is the second deployed-webapp example in the gallery, alongside [`oral-exam-practice-bot`](../oral-exam-practice-bot/). The pattern they share: live demo on Vercel + production GitHub repo + this gallery folder reproducing the *substance* (inputs, prompts/operations, illustrative outputs) without copying the running source code.

## If you just opened this folder

Read in this order:

1. [summary.md](summary.md) — what this is, the "virtual camera with rules" pedagogical conceit, how it was built, what you can translate it to. The live demo and source repo are linked at the top.
2. [inputs/kluge-rules.md](inputs/kluge-rules.md) — the two rules the production app surfaces in its sidebar, extracted into a markdown file that's the source of truth for editing them.
3. [operations/generate-operation.md](operations/generate-operation.md) — the single API endpoint that does all the work: provider abstraction, txt2img vs img2img, strength semantics, seed reproducibility.
4. [outputs/_source-snapshot.md](outputs/_source-snapshot.md) — the Next.js architecture in one document.
5. [outputs/example-generation-1-txt2img.md](outputs/example-generation-1-txt2img.md) → [`...-2-img2img-low-strength.md`](outputs/example-generation-2-img2img-low-strength.md) → [`...-3-img2img-high-strength.md`](outputs/example-generation-3-img2img-high-strength.md) — three generations as a dialogical sequence (Rule 2 enacted), demonstrating what the strength slider does to a held prompt and source.

## How to work in this project

You are reading an example of **a UI-as-pedagogy widget**. The substance is the tight coupling between the *interface controls* and the *critical framework that explains why they exist*. Unlike `oral-exam-practice-bot`, this project has **no Claude prompt** — there is no LLM call anywhere in the pipeline. The intelligence is in (a) the Stable Diffusion model on the other side of the API, and (b) the prompt the user writes, scaffolded by a UI that surfaces what makes a *good* prompt good.

Two passes, in order:

1. **Read the rules before you read the operation.** [`inputs/kluge-rules.md`](inputs/kluge-rules.md) sets up what the UI is *for*. The operation document only makes sense once you've absorbed Rule 1 (presence of source information — why a prompt that names an artist, medium, period, institution does work that a generic prompt cannot) and Rule 2 (dialogical method — why a sequence of generations is the work, not any single image).
2. **Then read the operation.** [`operations/generate-operation.md`](operations/generate-operation.md) explains the provider abstraction and the strength-slider semantics. The slider's labels (preserve source / dialog / follow prompt) are *literally the vocabulary of Rule 2*. Reading the operation after the rules is what makes that connection visible.

## The pipeline

| Step | What | Where |
|---|---|---|
| 1 | User reads the rules (always visible in sidebar) | [`inputs/kluge-rules.md`](inputs/kluge-rules.md) |
| 2 | User writes a prompt (Rule 1: name the source) | UI textarea — see [`outputs/_source-snapshot.md`](outputs/_source-snapshot.md) |
| 3 | User optionally uploads a source image (Rule 1) | UI file input → `FileReader` → data URL |
| 4 | If source image: strength slider appears (Rule 2: dialog) | UI range input, 0–1 |
| 5 | User clicks Generate | POST `/api/generate` |
| 6 | Server picks provider (Replicate primary, HF fallback) | [`operations/generate-operation.md`](operations/generate-operation.md) |
| 7 | Server returns `{ imageUrl, provider, seed }` | JSON response |
| 8 | Client renders generation in card + adds to gallery | React component state |
| 9 | User runs the *next* move in the dialog (Rule 2) | Back to step 2 |

## Conventions

- **`inputs/` is the editable source for what the UI surfaces.** [`inputs/kluge-rules.md`](inputs/kluge-rules.md) is the source of truth for the rules sidebar; the production TSX module mirrors it. [`inputs/prompt-starters.md`](inputs/prompt-starters.md) carries the project's prompt aesthetic — adapt to your own course's source material.
- **`operations/` holds the substance of the single API endpoint.** Just one file: `generate-operation.md`. The route is small; the document explains the provider abstraction and what each request parameter is doing.
- **`outputs/` holds the illustrative material.** Three written generation descriptions (txt2img, img2img low strength, img2img high strength) as a sequence — plus `_source-snapshot.md` for the Next.js architecture. **No real image files** in this gallery example; visit the live demo to generate actual images.
- **No emojis** in any file (workshop-wide convention).
- **Markdown link syntax** for file references.

## Alignment constraints (the hard ones)

These come from the production project and survive translation:

- **The rules and the UI controls are one artifact.** A control without a rule is decoration; a rule without a control is a handout. Rule 1 ties to the source-image input; Rule 2 ties to the strength slider's labels. If you add a control, add or extend a rule. If you add a rule, find a control it speaks through.
- **Provider abstraction is non-optional.** The substance of *"API widget"* is that the same prompt can be routed to different inference services. Hardcoding to one provider in the UI defeats the point and makes the widget hostile to classroom adaptation.
- **No prompt rewriting, no quality enhancers, no safety filter in the default.** The user's prompt is passed verbatim. The widget's pedagogy depends on the user being able to see what their prompt is doing — which means no hidden manipulation by the app.
- **One generation per call.** No batch parameter, no n=4 grid. Each click is a move in the dialog (Rule 2). The gallery shows the sequence; the sequence is the work.
- **Seed in / seed out.** Reproducibility is part of the contract. Set a seed and the response echoes it back; don't set one and the provider's chosen seed is returned (where available).
- **No persistence.** The session lives in component state; a page reload discards everything. The student's sequence belongs to the student.
- **Server-side keys.** `REPLICATE_API_TOKEN` and `HF_TOKEN` never leave `process.env` on the server. The browser never sees them.
