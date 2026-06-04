# Image API widget ("The Virtual Camera")

A worked example of a **provider-agnostic image-generation widget** with a **critical framework rendered in the UI itself**. The user writes a prompt, optionally brings a source image into the dialog, optionally pins a seed, clicks generate — and gets one Stable Diffusion image back. Right next to the form, a sidebar holds Alexander Kluge's "A Few Preliminary Rules" — Rule 1 (presence of source information) and Rule 2 (dialogical method) — paraphrased so the class can work with them. Specific UI controls are *literally* tied to specific rules.

> **Live demo:** <https://stable-diffusion-widget-interface.vercel.app/> — try a generation in your browser. Both Replicate and HuggingFace are supported as providers (one of `REPLICATE_API_TOKEN` or `HF_TOKEN` is set in production).
>
> **Source repo:** <https://github.com/bok-learning-lab/stable-diffusion-widget> — the production Next.js app, deployed to Vercel. This gallery example reproduces the *substance* (inputs, the API operation, illustrative outputs) without copying the running source code.

This is the second deployed-webapp example in the gallery, alongside [`oral-exam-practice-bot`](../oral-exam-practice-bot/). Both share the same porting pattern: source material and structured data in `inputs/`, the production API operations documented in `operations/`, and `outputs/` holding a synthetic illustrative session plus a `_source-snapshot.md` that documents the Next.js architecture standalone.

---

## What it is

A single-page Next.js webapp wired around one API endpoint plus a critical-framework sidebar:

- **A provider-agnostic generate endpoint** (`/api/generate`) — accepts a prompt and optional source image, picks an inference provider based on which API tokens are set (**Replicate** primary, **HuggingFace** fallback), and returns one image. See [`operations/generate-operation.md`](operations/generate-operation.md).
- **The Studio component** — a form (prompt textarea, optional source-image upload, strength slider when a source is present, optional seed input, generate button) plus a gallery of "earlier attempts" so the sequence of generations is visible as a sequence.
- **The Kluge Rules sidebar** — Rule 1 (presence of source information) and Rule 2 (dialogical method), rendered alongside the form. See [`inputs/kluge-rules.md`](inputs/kluge-rules.md).

The substance the example reproduces in this folder:

- [inputs/kluge-rules.md](inputs/kluge-rules.md) — the two Kluge rules paraphrased for the project, plus the explicit ties between each rule and a specific UI control (Rule 1 ↔ source-image input; Rule 2 ↔ strength-slider labels).
- [inputs/prompt-starters.md](inputs/prompt-starters.md) — five example prompts in the Arcimboldo / Herzog / Tenniel / Hellenistic / Eliasson aesthetic the widget is built around, with notes on how to adapt them to a different course's source material.
- [operations/generate-operation.md](operations/generate-operation.md) — the single API endpoint documented end to end: request/response shape, the provider abstraction (Replicate vs HuggingFace), the strength-parameter semantics and the named bands ("preserve source" / "dialog" / "follow prompt"), the seed-reproducibility contract, and what the route deliberately doesn't do.
- [outputs/_source-snapshot.md](outputs/_source-snapshot.md) — the Next.js architecture, the repo layout, the deployment, and what the app deliberately omits (no persistence, no batch generation, no prompt rewriting).
- [outputs/example-generation-1-txt2img.md](outputs/example-generation-1-txt2img.md) → [`...-2-img2img-low-strength.md`](outputs/example-generation-2-img2img-low-strength.md) → [`...-3-img2img-high-strength.md`](outputs/example-generation-3-img2img-high-strength.md) — three generations written up as a *dialogical sequence* (Rule 2 enacted), showing what the strength slider does to a held prompt and source.

---

## The move worth noticing

**A widget whose pedagogical framework is rendered in the UI alongside the controls, not as a separate handout — and where each control is tied to a specific rule.**

Most stable-diffusion playgrounds present generation as a frictionless "type prompt, get image" loop. This widget does the opposite: it makes the critical framework structurally present.

- **Rule 1 — presence of source information.** Bring the context of the source — the artist, the medium, the period, the institution — into the prompt. The Studio's *placeholder text* is itself a demonstration of the rule: *"a painting by Arcimboldo, fruit and vegetables forming a face, Wunderkammer, 16th century."* And the optional source-image input is labeled *"Source image (optional — Rule 1)"* — the rule is in the label, not in a tooltip or a docs page.
- **Rule 2 — dialogical method.** There is dialog between the tool and the author. The experiments make sense only as sequences. The Studio's strength slider has three labeled bands — *"preserve source"* (0–0.4), *"dialog"* (0.4–0.8), *"follow prompt"* (0.8–1.0). The middle band is named after the rule. And the gallery of "earlier attempts" exists *so the sequence is legible as a sequence*, not so the student can pick the best one.

The second move worth noticing is the **provider abstraction**. The substance of "API widget" *is* that the same prompt can be routed to different inference services. The project supports Replicate (primary, paid, ~$0.003/image, full img2img) and HuggingFace Serverless Inference (free tier, rate-limited, txt2img only) — same JSON request shape, automatic provider selection based on which tokens are set, manual override via `INFERENCE_PROVIDER` env var. A class adapting the widget to its own use can swap providers with one environment variable, no code change. See [`operations/generate-operation.md`](operations/generate-operation.md) for why two providers is the right default and how to add a third.

---

## How we built it

**Phase 1 — The single endpoint, dual-provider.** The first move was building `/api/generate` and the `lib/generate.ts` provider abstraction. Replicate's SDK is the simplest path for SD-family models; HuggingFace's Serverless Inference is the free fallback for classrooms without a budget. The choice to *pin a model version hash* (rather than track `:latest`) means a working deployment doesn't break when upstream models are deprecated. Override is one env var.

**Phase 2 — The Kluge rules.** The pedagogical move came from Alexander Kluge's writing on the "virtual camera" — paraphrased aggressively so the class can edit and add to them. The two rules in the production app are minimal on purpose: Rule 1 (presence of source information) and Rule 2 (dialogical method). The expectation, written into the sidebar's closing line, is that *more rules emerge through necessary intensifications and counter-rules. Add your own.*

**Phase 3 — Tying controls to rules.** This is the design center of the project. Each UI element was audited against "which rule does this surface?" — and where there was no answer, either the rule was extended or the control was reconsidered. The optional source-image input is labeled with "Rule 1" explicitly. The strength slider's labels use the literal vocabulary of Rule 2 (*"dialog"* in the middle band). The gallery of earlier attempts is justified by Rule 2 — a sequence, visible as a sequence.

**Phase 4 — The Studio as a thin client.** The component (`apps/interface/components/studio.tsx`, ~290 lines) holds the gallery in React state, reads source images with `FileReader` into data URLs, POSTs to `/api/generate`, and renders the latest generation in a card with the source-vs-generation side-by-side. No state management library, no router for stage transitions, no animations. Resist the urge to factor it.

**Phase 5 — Deploy and forget.** Vercel project, root at `apps/interface/`, env vars for the inference-provider tokens. No login, no analytics, no persistence — a session is gone when the page reloads. Same stance as `oral-exam-practice-bot`: nothing about a session is logged, compared, or used to build a profile.

### Things this approach taught us

The placeholder text is doing real pedagogical work. *"a painting by Arcimboldo, fruit and vegetables forming a face, Wunderkammer, 16th century"* is not a random example — it's a prompt that follows Rule 1 *visibly*. A student who reads the placeholder before typing has already absorbed half the lesson. Generic placeholders ("Enter a prompt…") squander the affordance.

Tying UI control labels to the *literal vocabulary* of the framework — the strength slider's *"dialog"* band — is the cheapest way to make pedagogy stick. The student sees the word *dialog* on a slider, then sees Rule 2 in the sidebar, then sees the rule's text use the word *dialog*. The three reinforce each other without anyone needing to explain the connection.

Two providers is right; three would be excess. The provider abstraction is one function with two branches in `lib/generate.ts`. Adding Stability AI's REST API or OpenAI's image-generation endpoint is a copy-paste of an existing branch — easy when needed, but the *default* of two (paid + free fallback) covers the classroom case without ceremony.

Holding the seed constant across a sequence of generations is the smallest piece of scientific rigor a class can practice. It lets the conversation about generation 2 vs generation 3 be about *the parameter that changed* rather than vague impressions. See [`outputs/example-generation-3-img2img-high-strength.md`](outputs/example-generation-3-img2img-high-strength.md) for the worked case.

The earlier-attempts gallery should reverse-chronological. Latest at top, oldest at bottom. The reading order matches how the student would tell the story — *"I started with this, then I tried this, then I ended up here."*

---

## What you can translate this to

The pattern is **a single API endpoint with a provider-agnostic abstraction + a critical-framework sidebar with each UI control tied to a specific rule + a sequence-visible gallery**. The substance survives translation. Specifically:

- **Any course teaching with generative image models.** Replace Kluge's rules with the framework your course uses. Walter Benjamin on aura and mechanical reproduction; Lev Manovich on the database aesthetic; the disciplinary norms of your field (attribution, dataset provenance, fair use). The conceit only works if the rules do live work on the UI.
- **Generative text widgets with the same conceit.** Replace the image-generation endpoint with a Claude or OpenAI chat endpoint; the rest of the pattern — rules sidebar, sequence-visible gallery, provider abstraction — ports verbatim.
- **Audio generation, music generation, video generation.** Provider abstraction is the most reusable piece; for each medium, the relevant rules and the UI control vocabulary change.
- **Any "rules + control" pedagogical tool.** Even outside generative AI — a writing tool that ships with style rules in the sidebar; a citation manager that surfaces disciplinary citation norms next to the entry form. The general move is *make the pedagogy structurally present, not parallel*.
- **Multi-modal experiments.** The img2img move (source image + strength slider) generalizes to any "take this input + transform with this strength" pattern. Audio: take a melody, transform with strength; text: take a paragraph, rewrite with strength; etc.

Candidate operations a workshop attendee could add against the same architecture:

- **`/api/describe`** — a Claude call that takes a generated image and writes a critical reading of it against the named rules. Bridges this widget back into the LLM-prompt-engineering territory the other gallery examples cover.
- **`/api/compare`** — takes a sequence of generations from the gallery and writes a comparative reading (which moves were dialogical, which were source-preserving, which were prompt-following). The instructor's discussion-warmup tool.
- **`/api/critique-prompt`** — a Claude call that reads a user's prompt *before* generation and flags where it might violate Rule 1 (no source named, or vague source). A live coaching layer.
- **Sequence export** — a "save this dialog" button that exports the gallery's prompts, sources, settings, and generations as a markdown document the student can submit.

The pattern in all of these is the same: a single thin API endpoint, a critical framework that lives in the UI alongside the controls, sequence-as-substance, no persistence, and provider abstraction so the architecture survives upstream model changes.

---

## Alignment constraints (the hard ones)

These come from the production project and survive translation:

- **Rules and UI controls are one artifact.** A control without a rule is decoration; a rule without a control is a handout. Surfacing the framework in the sidebar without tying it to specific controls produces a webapp with a homily attached.
- **Provider abstraction is the substance of "API widget."** Hardcoding to one provider in the UI makes the widget hostile to classroom adaptation. One env var should be enough to swap inference services.
- **No prompt rewriting.** The user's prompt is passed verbatim. Hidden manipulation makes the pedagogy a lie — the student can't see what their prompt is doing if the app is editing it underneath.
- **One generation per call.** No batch parameter, no n=4 grid. Each click is a move in the dialog (Rule 2). The gallery shows the sequence; the sequence is the work.
- **Seed in / seed out.** Reproducibility is part of the contract. A student should be able to ask "what was the seed of that one?" and get an answer.
- **No persistence.** The session lives in browser state; a page reload discards everything. The student owns what they take away.
- **Server-side keys.** API tokens never leave `process.env` on the server. The browser never sees them.
- **No safety classifier in the default.** The widget is for an adult classroom working with named source material. Forks for public use should add moderation explicitly, in `lib/generate.ts`, where the choice is visible — not as a hidden default.
