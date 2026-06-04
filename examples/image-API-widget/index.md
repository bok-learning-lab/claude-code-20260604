# image-API-widget — folder index

A worked example of a deployed Stable-Diffusion image-generation widget — *"The Virtual Camera"* — whose UI surfaces Alexander Kluge's "A Few Preliminary Rules" alongside the generation form, with specific UI controls tied to specific rules. Drawn from the production app at <https://stable-diffusion-widget-interface.vercel.app/> (repo: <https://github.com/bok-learning-lab/stable-diffusion-widget>). Start with [summary.md](summary.md); everything else is here for browsing.

## Top-level

- [summary.md](summary.md) — what this project is, the "virtual camera with rules" pedagogical conceit, how it was built, what you can translate it to. **Live demo + source repo are linked at the top.**
- [CLAUDE.md](CLAUDE.md) — project-level instructions loaded by Claude Code on session start
- [index.md](index.md) / [index.html](index.html) — this file

## inputs/

The editable source for what the UI surfaces.

- [inputs/kluge-rules.md](inputs/kluge-rules.md) — the two Kluge rules paraphrased for the project, with the explicit ties between each rule and a specific UI control (Rule 1 ↔ source-image input; Rule 2 ↔ strength-slider labels). The source of truth for editing the sidebar — the production TSX module mirrors this file
- [inputs/prompt-starters.md](inputs/prompt-starters.md) — five example prompts in the project's aesthetic (Arcimboldo / Herzog / Tenniel / Hellenistic / Eliasson), with notes on how to adapt them to a different course's source material

## operations/

One file, because the project has one operation.

- [operations/generate-operation.md](operations/generate-operation.md) — the single API endpoint (`/api/generate`) documented end to end: request/response shape, **provider abstraction** (Replicate primary, HuggingFace fallback), the txt2img vs img2img modes, the **strength-parameter semantics** with the named bands ("preserve source" / "dialog" / "follow prompt"), the seed-reproducibility contract, and what the route deliberately doesn't do

## outputs/

The illustrative material — a written dialogical sequence (three generations as a conversation) and standalone documentation of the running app.

- [outputs/_source-snapshot.md](outputs/_source-snapshot.md) — the Next.js architecture, repo layout, deployment, and what the app deliberately does *not* do. Read this if you want the app's shape without cloning the repo
- [outputs/example-generation-1-txt2img.md](outputs/example-generation-1-txt2img.md) — generation 1 of the worked sequence: pure text-to-image, the Arcimboldo prompt, no source image. Demonstrates Rule 1 (presence of source information) in the prompt itself
- [outputs/example-generation-2-img2img-low-strength.md](outputs/example-generation-2-img2img-low-strength.md) — generation 2: take generation 1 as the source, prompt a Chihuly-glass recasting at strength 0.30 ("preserve source"). Demonstrates the low end of the strength slider
- [outputs/example-generation-3-img2img-high-strength.md](outputs/example-generation-3-img2img-high-strength.md) — generation 3: same source, same prompt as generation 2, strength 0.90 ("follow prompt"). Demonstrates the high end. Read 1 → 2 → 3 as a sequence — that's Rule 2 (dialogical method) enacted

---

*To translate this pattern to another course or assessment format: rewrite [`inputs/kluge-rules.md`](inputs/kluge-rules.md) with the rules your course wants to surface; mirror the edits to `apps/interface/components/kluge-rules.tsx` in the production repo; tie any new UI controls to specific rules (a control without a rule is decoration; a rule without a control is a handout). See the closing section of [summary.md](summary.md) for candidate operations and adjacent domains.*
