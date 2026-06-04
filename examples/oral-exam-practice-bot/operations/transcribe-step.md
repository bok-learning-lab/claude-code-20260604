# Operation — Speech-to-text via Whisper

_Not a Claude prompt — a short note documenting the transcription step that feeds the two Claude prompts in this folder. Lives in production as [`apps/interface/app/api/transcribe/route.ts`](https://github.com/bok-learning-lab/complit126-quizzer/blob/main/apps/interface/app/api/transcribe/route.ts)._

---

## What it does

The browser captures the student's spoken answer with `MediaRecorder` (WebM/Opus on most browsers, M4A on Safari). The audio Blob is POSTed to `/api/transcribe` as multipart form-data. The server hands it to **OpenAI Whisper** (`whisper-1`) and returns the transcribed text.

The returned transcript is then what the two Claude prompts in this folder operate on — never the audio itself.

## Why Whisper

- It handles the spoken-undergraduate-prose register well enough for the use case. Disfluencies and mid-sentence restarts come through; literary names sometimes get mangled (Hesiod → "Heziod", Pinsky → "Pinski"). Both Claude prompts in this folder are explicitly told to expect that.
- It does not require a wake word, a specific phrasing, or any prompt-side configuration. The student talks; the model writes it down.
- It runs server-side. Audio never leaves the server to a client-side recognizer, and the API key stays in `.env.local`.

## The handoff

```
audio Blob (browser)
  ─→ POST /api/transcribe (multipart form-data)
       └─ whisper-1 → text
  ─→ transcript string
       ├─ during a question: stored in component state
       │   └─ /api/followup ← uses it to generate one follow-up
       └─ at session end:    sent in the answers array
           └─ /api/summary  ← uses all transcripts for the coach's note
```

## What the Claude prompts assume about the transcript

Both [`follow-up-prompt.md`](follow-up-prompt.md) and [`coachs-note-prompt.md`](coachs-note-prompt.md) state explicitly that the input may contain disfluencies, mishearings, or filler. They do not ask the model to clean the transcript. They ask it to read past the noise and focus on the substance of what the student said.

## Hard constraints

- **Server-side only.** The OpenAI key is in `.env.local` (server-side). The browser never sees it.
- **No persistence by default.** The audio Blob is not saved; the transcript is held in memory for the duration of the session and discarded when the page reloads. (The production project follows this rule strictly — there is no recording history, no transcript log on disk.)
- **One transcript = one question.** Each recording is bound to the question that was on screen when it was made. This is how the downstream Claude prompts know what the student was answering.
