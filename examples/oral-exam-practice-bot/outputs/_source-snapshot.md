# Source snapshot — the running app this example is drawn from

_This document stands in for copying the Next.js source code into the example folder. The live app is at [complit126-quizzer-interface.vercel.app](https://complit126-quizzer-interface.vercel.app/); the repo is [bok-learning-lab/complit126-quizzer](https://github.com/bok-learning-lab/complit126-quizzer). What follows is enough to read the app's shape without cloning it._

---

## What the app does, end-to-end

1. **Draw.** Page-load presents an "intro" screen. The user clicks "Draw your questions." The client calls `drawQuestions()` ([`apps/interface/lib/quizzer/draw.ts`](https://github.com/bok-learning-lab/complit126-quizzer/blob/main/apps/interface/lib/quizzer/draw.ts)) which picks two specific questions from two *different* units (so the texts don't overlap) plus one big question, all from the hardcoded source of truth at `_content/exam/questions.ts` (mirrored in this example as [`inputs/questions.ts`](../inputs/questions.ts)).

2. **Prep.** Optional 15-minute closed-book prep window. A `PrepTimer` component counts down; the questions stay visible.

3. **Exam.** A 15-minute Q&A clock starts. For each of the three questions, the `QuestionCard` component:
   - Shows the question.
   - Activates the `AudioRecorder` component, which uses the browser's `MediaRecorder` API to capture audio.
   - POSTs the audio Blob to `/api/transcribe` ([Whisper proxy](https://github.com/bok-learning-lab/complit126-quizzer/blob/main/apps/interface/app/api/transcribe/route.ts)) and displays the returned transcript.
   - On user request ("Get follow-up"), POSTs the transcript to `/api/followup` ([the two-stage Claude prompt — see `operations/follow-up-prompt.md`](../operations/follow-up-prompt.md)) and displays the single returned question.
   - Optionally records a response to the follow-up (same loop: record → transcribe → store).
   - Moves to the next question on completion. The exam clock **pauses** while Claude is thinking and while the user is replaying their own audio (so neither delay eats into their answering time).

4. **Wrap.** When all three questions are done — or the 15-minute clock runs out — the `Summary` component POSTs the full answers array to `/api/summary` ([the centerpiece prompt — see `operations/coachs-note-prompt.md`](../operations/coachs-note-prompt.md)) and displays the returned coach's note.

## Repo layout

```
complit126-quizzer/                 (pnpm workspace, monorepo)
├── _content/
│   ├── exam/questions.ts           ← source of truth: questions, works, rubric, addendum
│   └── docs/                       ← /docs route content (light MDX)
├── _context/
│   ├── cl126x-oral.docx            ← the faculty's original oral-exam packet
│   ├── ll/                         ← Learning Lab background documents
│   └── dev/                        ← provider/API notes (anthropic, openai, vercel, slack)
├── apps/
│   └── interface/                  ← the Next.js app
│       ├── app/
│       │   ├── page.tsx            ← the entire quizzer state machine (intro → drawn → prep → exam → done|timeup)
│       │   ├── layout.tsx
│       │   ├── globals.css
│       │   ├── api/
│       │   │   ├── transcribe/route.ts   ← Whisper proxy
│       │   │   ├── followup/route.ts     ← Claude: generator + judge (two-stage)
│       │   │   └── summary/route.ts      ← Claude: coach's note
│       │   ├── [folder]/                 ← dynamic content-page rendering for _content/
│       │   └── test/                     ← dev sandbox routes
│       ├── components/
│       │   ├── quizzer/
│       │   │   ├── question-card.tsx     ← per-question state machine
│       │   │   ├── audio-recorder.tsx    ← MediaRecorder wrapper
│       │   │   └── prep-timer.tsx        ← 15-min countdown
│       │   ├── ui/                       ← shadcn/ui primitives (button, card, alert, badge)
│       │   ├── docs-layout.tsx
│       │   ├── mdx-content.tsx
│       │   └── sidebar.tsx
│       ├── lib/
│       │   ├── quizzer/draw.ts           ← question-drawing logic
│       │   ├── content.ts                ← _content/ file walker
│       │   └── content-page.tsx          ← dynamic MDX page render
│       └── package.json
├── CLAUDE.md
├── README.md
├── package.json                    ← workspace root
├── pnpm-workspace.yaml             ← declares apps/* as workspaces
└── pnpm-lock.yaml
```

## Tech stack

- **pnpm** workspaces — monorepo with `apps/interface/` as the only deployable app today; reserves room for sibling apps without restructuring.
- **Next.js 15** with the App Router. Server routes (`/api/*`) are Node-runtime; client components handle the recording UI.
- **React 19.**
- **Tailwind CSS v4** + **shadcn/ui** primitives (Radix under the hood).
- **`@anthropic-ai/sdk`** for Claude calls. Model: `claude-sonnet-4-6`. Both Claude routes use **ephemeral prompt caching** on the system block (the system prompts here are long; caching pays back fast across a session).
- **`openai`** SDK for Whisper (`whisper-1`).
- **Browser `MediaRecorder` API** for audio capture. WebM/Opus on Chrome/Firefox/Edge; M4A on Safari. The transcribe route sniffs the MIME type and renames the Blob accordingly so Whisper can decode it.

## Where API keys live

Both Claude and OpenAI keys are read from `apps/interface/.env.local` and never leave the server. The browser never sees them.

```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

`apps/interface/.env.local.example` ships in the repo as the template.

## Deployment

- **Vercel.** Project root at `apps/interface/`, build command `next build`. Environment variables (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`) set in the Vercel project settings.
- Live at <https://complit126-quizzer-interface.vercel.app/>.

## What's *not* here (and why)

- **No login, no user accounts, no persistence.** The session lives in React state and is discarded when the page reloads. This was a deliberate choice for the rehearsal use case — the student is not building a transcript history, and the no-storage stance is part of the project's no-grading posture (nothing about a session can be retrieved or compared later).
- **No analytics, no usage logging.** Same reason.
- **No grading endpoint.** Designed out by the prompt, not just the UI. See [`operations/coachs-note-prompt.md`](../operations/coachs-note-prompt.md).
- **No multiple-courses abstraction.** The course is hardcoded as CL 126x / Hum 5 in the system prompts and the questions data. Porting to another course is a `questions.ts` rewrite plus a few text edits in the prompts; the architecture doesn't change.

## How a faculty member would adapt this

The pattern is **a single source-of-truth content file (`questions.ts`) + two Claude prompts (one mid-task coaching, one end-of-session reflection) + one transcription step + a tiny React state machine to chain them**. To port to another exam or assessment format:

1. Replace `inputs/questions.ts` with the new course's questions, works, rubric, and addendum. The exam shape (2 specific + 1 big) is encoded in `lib/quizzer/draw.ts` — change there if the draw structure changes.
2. Rewrite the two Claude prompts' opening paragraphs to name the new course and its conventions. Most of the structure of `coachs-note-prompt.md` ports verbatim — the no-grading constitution, the qualitative vocabulary list, the rubric-as-questions move all generalize.
3. Adjust the UI's stage names ("draw", "prep", "exam", "done") if the protocol differs.

Nothing else changes.
