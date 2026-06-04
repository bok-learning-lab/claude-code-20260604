# Source snapshot — the running app this example is drawn from

*This document stands in for copying the Next.js source code into the example folder. The live app is at [stable-diffusion-widget-interface.vercel.app](https://stable-diffusion-widget-interface.vercel.app/); the repo is [bok-learning-lab/stable-diffusion-widget](https://github.com/bok-learning-lab/stable-diffusion-widget). What follows is enough to read the app's shape without cloning it.*

---

## What the app does, end-to-end

1. **Open the page.** The user lands on a single screen titled *"The Virtual Camera"* with two columns: the **Studio** (the generation form) and the **Kluge Rules** sidebar.

2. **Read the rules** (or don't — they're right there). Rule 1 (presence of source information) and Rule 2 (dialogical method), paraphrased from Alexander Kluge, render in a sidebar with sample-card styling and a closing line: *"More rules are likely to emerge through necessary intensifications and counter-rules. Add your own."*

3. **Write a prompt.** A textarea with monospace placeholder text: *"a painting by Arcimboldo, fruit and vegetables forming a face, Wunderkammer, 16th century."* The placeholder is doing pedagogical work — it shows a prompt that obeys Rule 1.

4. **Optional: bring a source image into the dialog** (Rule 1). An upload control labeled *"Source image (optional — Rule 1)"*. The file is read as a data URL with `FileReader` and held in component state. If a source is present, a **strength slider** appears with labels that change band — "preserve source" / "dialog" / "follow prompt" (Rule 2).

5. **Optional: pin a seed** for reproducibility.

6. **Click Generate.** The browser POSTs to `/api/generate` with the prompt, optional source data URL, optional strength, and optional seed. The server picks a provider (Replicate primary, HuggingFace fallback — see [`operations/generate-operation.md`](../operations/generate-operation.md)), calls it, and returns `{ imageUrl, provider, seed }`.

7. **The result renders** in a card below the form, with the source image (if any) side-by-side with the generation. The card shows the prompt verbatim in italics, the strength and seed used, and a `download` link.

8. **Earlier attempts** appear as a grid of thumbnails below the latest. The whole gallery lives in component state — no persistence, no server-side store. A page reload starts a fresh sequence.

## Repo layout

```
stable-diffusion-widget/                  (pnpm workspace, monorepo)
├── _content/
│   └── docs/                             ← /docs route (light template content)
├── _context/
│   ├── ll/                               ← Learning Lab background docs
│   └── dev/                              ← provider notes (anthropic, audio, slack)
├── apps/
│   └── interface/                        ← the Next.js app
│       ├── app/
│       │   ├── page.tsx                  ← the entire "Virtual Camera" page (Studio + KlugeRules)
│       │   ├── layout.tsx
│       │   ├── globals.css
│       │   ├── api/
│       │   │   └── generate/route.ts     ← the single API route
│       │   ├── [folder]/                 ← dynamic content-page rendering for _content/
│       │   └── test/                     ← dev sandbox routes
│       ├── components/
│       │   ├── studio.tsx                ← the generation form + gallery (~290 lines)
│       │   ├── kluge-rules.tsx           ← the rules sidebar (~50 lines, data is in the file)
│       │   ├── ui/                       ← shadcn/ui primitives (button, card, textarea, input, label, alert, badge)
│       │   ├── docs-layout.tsx
│       │   ├── mdx-content.tsx
│       │   └── sidebar.tsx
│       ├── lib/
│       │   ├── generate.ts               ← provider abstraction (Replicate + HuggingFace)
│       │   ├── content.ts                ← _content/ file walker
│       │   └── content-page.tsx          ← dynamic MDX page render
│       ├── .env.example                  ← documents REPLICATE_API_TOKEN, HF_TOKEN, model overrides
│       └── package.json
├── CLAUDE.md
├── README.md
├── package.json
├── pnpm-workspace.yaml
└── pnpm-lock.yaml
```

## Tech stack

- **pnpm** workspaces — monorepo with `apps/interface/` as the only deployable app.
- **Next.js 15** App Router. The one API route is Node-runtime; the Studio is a client component (it manages file reads, the gallery state, and the form).
- **React 19.**
- **Tailwind CSS v4** + **shadcn/ui** primitives (Card, Textarea, Input, Label, Button — and `lucide-react` icons: `Loader2`, `Upload`, `X`, `Wand2`).
- **`replicate`** SDK for Replicate. Default model: `stability-ai/stable-diffusion:ac732df83cea...` (SD 1.5).
- **Plain `fetch`** for HuggingFace Serverless Inference (no SDK).
- **Browser `FileReader` API** for reading the source image into a data URL client-side. The file never touches disk on the server.

## Where API keys live

`apps/interface/.env.local` (server-side only). The `.env.example` documents:

```
REPLICATE_API_TOKEN=r8_xxx...
HF_TOKEN=hf_xxx...                       (optional fallback)
INFERENCE_PROVIDER=replicate|huggingface  (optional force)
REPLICATE_MODEL=owner/name:version       (optional override)
HF_MODEL=owner/name                      (optional override)
```

Only one provider needs to be configured. Both at once: Replicate wins unless `INFERENCE_PROVIDER` says otherwise.

## Deployment

- **Vercel.** Project root at `apps/interface/`, build command `next build`. Environment variables set in the Vercel project settings.
- Live at <https://stable-diffusion-widget-interface.vercel.app/>.

## What's *not* here (and why)

- **No persistence, no user accounts, no gallery storage.** The Studio's gallery is in-memory React state. A page reload discards everything. The student's sequence belongs to the student, on their own machine.
- **No prompt safety filter.** The widget is for an adult classroom working with named source material. Forks for public-facing use should add a moderation step in `lib/generate.ts`.
- **No batch generation.** Each click is one generation. Multiple variants = multiple clicks = a visible *sequence* of moves (Rule 2). Resist adding an "n=4" parameter.
- **No prompt rewriting.** The user's prompt is passed verbatim. "Quality enhancers" or "negative prompt suggestions" would obscure what the prompt is actually doing.
- **No model picker in the UI.** The model is set by environment variable, not by a dropdown. A class adapting the widget changes one env var and the whole UI flips to a different model.

## How a faculty member would adapt this

The pattern is **one image-generation endpoint with a provider-agnostic interface + a critical-framework sidebar that ties UI controls to specific rules**. To port:

1. Edit [`inputs/kluge-rules.md`](../inputs/kluge-rules.md) — replace Kluge's rules with the rules your course wants to surface. Could be Walter Benjamin on aura. Could be Lev Manovich on the database aesthetic. Could be the disciplinary norms of your field (citation, attribution, fair use, dataset provenance). The conceit only works if the rules do live work on the UI.
2. Mirror those edits back into `apps/interface/components/kluge-rules.tsx`. The TSX module is the live source for the deployed app.
3. Adjust the UI controls so they tie to the new rules. A control without a rule is decoration; a rule without a control is a handout.
4. Optionally swap providers in `apps/interface/lib/generate.ts` — the abstraction is one file, one function, two providers. Adding a third (e.g. Stability AI's REST API, OpenAI's gpt-image, Google's Imagen) is a copy-paste of the existing provider stub.
5. Update [`inputs/prompt-starters.md`](../inputs/prompt-starters.md) with example prompts in your course's aesthetic.

Nothing else changes. The architecture is small on purpose.
