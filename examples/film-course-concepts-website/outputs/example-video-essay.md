# Example — the scroll-synced video essay, as the student experiences it

*Illustrative description of the demo at [`/video-essay/01`](https://gened-1049.vercel.app/video-essay/01). A second interactive concept demo in a different mode — instead of a top-down diagram, the student watches a scene *through* an editing overlay that fades shot-by-shot annotations in and out as they scroll.*

---

## The arrival

The student lands on a fullscreen video page. The first frame of a film clip — likely from a course film — fills the viewport. Faint editorial UI overlays the corners: a fullscreen toggle, a small shot counter (*"Shot 1 of 7"*), a quietly-named identifier in the corner.

This page does not auto-play. The video is *scroll-driven*. As the student scrolls down the page, the video advances; as they scroll up, it rewinds. The scroll progress controls the timeline.

## The first shot

As the student scrolls, the first shot of the sequence plays out under the video. Above the still image, an **editing overlay** fades in: a small title strip identifying the shot (*"01. Medium two-shot — establishing"*), then a one-sentence summary of what the shot is doing, then — staggered, one at a time — a sequence of three or four short notes that fade in, dwell, and fade out as the student continues scrolling.

The notes are *cinematographic readings* of what's on screen — the kind of margin annotation a teacher would draw on a still in office hours, here animated to track the actual shot's duration:

> **Note 1** (0–25% through the shot): *"Two-shot keeps both characters in frame; the screen direction established here will be honored across the next four shots — that's the 180-degree rule doing its work."*
>
> **Note 2** (25–55%): *"Watch the eye-lines. Both actors look slightly off-axis, not into the lens — the camera is on the line, not on the axis."*
>
> **Note 3** (55–85%): *"The cutting moment is announced by the silence before the next line. Sound design is doing the editorial work."*
>
> **Note 4** (85–100%): *"And cut to the reverse — same screen direction, opposite angle."*

By the end of Shot 1, the student has watched the shot once, *while reading the cinematographic argument about it*. The overlay fades out cleanly as the next shot's frame fills the viewport.

## The middle shots

The page contains seven shots in sequence — the worked example is one scene of dialogue or one short sequence from a course film. Each shot gets its own overlay structure: title strip → summary → three or four staggered notes → fade out. The phase timing is precise (visible in the source — *"0.00–0.08: fade in; 0.08–0.35: summary visible; 0.30–0.90: cycle through notes; 0.90–1.00: fade out"* per shot).

The student is in control of the pace. They can scroll slowly to dwell on a single note, scroll back up to re-read, scroll fast through a shot they've absorbed. The video and the annotations are bound together — but the student sets the tempo.

## The conclusion

By the end of the sequence the student has watched a 30–60 second scene seven times in a row, each time with a different annotation layer up. The video has *not* been edited or chopped up — the original scene plays continuously. What's changed is the *reading* that surrounds it.

A footer card invites the student to the next essay (or back to the landing page). Nothing is logged; the student's progress is not persisted.

## What the page teaches without saying

- **Close reading is a temporal operation.** A scene happens *in time*, and a reading of it happens *in time too*. The scroll-synced format is the only way (short of a sit-down lecture) to hold the temporal alignment between the film and the commentary.
- **The video and the criticism are one artifact.** The student does not read a critical essay *about* a clip; they read criticism *over* the clip, as the clip plays. The two are not separated.
- **Pacing belongs to the student.** Unlike a real video essay (which has a fixed soundtrack-driven pace), this format lets the student linger on the move they didn't catch and skim through the one they did. Self-pacing without losing the temporal coupling.

## The technical structure

The page is built around a **`ScrollVideo`** component (shared, in `components/ScrollVideo.tsx`) that ties video playback to scroll position, and an **`EditingOverlay`** component that uses the scroll progress within a shot to drive fade timings for the title, summary, and notes.

The data — shot list, shot types, titles, summaries, and per-shot notes — lives in the page file itself as a `clips` array. Each clip is roughly:

```typescript
{
  shotNumber: 1,
  totalShots: 7,
  shotType: "Medium two-shot — establishing",
  title: "...",
  summary: "...",
  notes: [
    "Two-shot keeps both characters in frame; the screen direction established here will be honored across the next four shots — that's the 180-degree rule doing its work.",
    "Watch the eye-lines...",
    "...",
  ],
}
```

The pattern is the same as the three-point-lighting demo at a structural level: **structured data + a rendering component + a page that walks through the data as a narrative sequence.** What differs is the *medium of the data* (shot-level reading-notes vs. lighting-angle parameters) and the *rendering surface* (a scroll-driven video timeline vs. a static top-down diagram).

## How this generalizes

The scroll-synced video-essay format ports cleanly to any course where:

- A short clip (30–90 seconds) is the primary text.
- The instructor has annotations that need to land at *specific moments* in the clip's timeline.
- The student benefits from controlling the pace (re-reading, dwelling, skipping).

Candidate adaptations for adjacent courses:

- **Music theory courses** — a phrase of a piece plays as the student scrolls; annotations identify the harmonic move, the rhythmic figure, the orchestrational choice.
- **Dance / movement studies** — a short sequence plays; annotations call attention to specific muscle groups, weight transfers, the relation to musical accent.
- **Public speaking / rhetoric** — a 60-second clip of an oration; annotations track the rhetorical figures, the pauses, the audience reactions.
- **Foreign-language film study** — a short dialog with subtitle annotations that go *beyond* translation: grammar notes, idiom callouts, sociolinguistic context.

The data shape stays roughly the same; the medium and the reading-vocabulary change.

## Where this fits in the broader site

The video-essay demo is the second of the two interactive concept demos on the landing page. The three-point-lighting demo teaches the student to *see* lighting; the video-essay demo teaches the student to *read* editing. Together they're the two demos a workshop-station visitor passes through, paired with the workshop's own hands-on stations (filming, lighting, AI-tool resources).

The video essay is also the **template** for the "video essay of the future" idea threaded through the AI-resources curriculum — see [`inputs/ai-resources-philosophy.md`](../inputs/ai-resources-philosophy.md), section 5 "Building Interactive Video Essays." The students' workshop deliverable is, eventually, *making one of these themselves* — using AI as the technical assistant (ffmpeg for the video processing, the Next.js scaffolding, the React components) while keeping the *reading* as their own.
