# Example — the three-point-lighting demo, as the student experiences it

*Illustrative description of the interactive demo at [`/three-point-lighting`](https://gened-1049.vercel.app/three-point-lighting). The actual visual is on the live site; this document gives a reader the demo's shape and pedagogical arc without requiring them to visit.*

---

## The arrival

The student lands on a black page. At the top: small, all-caps, orange-tinted serif text reading **"LIGHTING FUNDAMENTALS."** Below it: a hero title in gradient orange/amber/red — *"Three-Point Lighting."* A subtitle in muted white: *"Read Kurosawa's Rashomon by the lights Miyagawa chose."*

This is not a tutorial. It is not a glossary entry. It is a *guided viewing* of a specific cinematographer's work, organized around a specific technique.

## The first still

The student scrolls. The first still arrives full-bleed: a frame from *Rashomon* (1950) — the bandit Tajōmaru in medium shot, body angled toward camera, one arm extended in accusation. Hard sunlight rakes across his face and chest from camera-right. Deep shadows on the left.

Beside the still (on desktop) or below it (on mobile), a top-down diagram fades in. A small circle in the center represents the subject. Around it, three colored arcs:

- **A bright, hard-edged warm-yellow arc** at the 4 o'clock position, slightly elevated. The diagram calls out: *"Key Light · 120° · 45° elevation · intensity 0.95 · #fff8e7."*
- **A soft, muted blue arc** at the 8 o'clock position, low. *"Fill Light · 240° · 15° elevation · intensity 0.20 · #b8d8ea."*
- **A small white arc** behind the subject (12 o'clock from the diagram's frame of reference, which is the camera's). *"Back Light · 0° · 30° elevation · intensity 0.40 · #ffffff."*

Below the diagram, three paragraphs — one per light — and a longer **shot description** above them, paraphrased here from the production data:

> *"Medium shot — Tajōmaru points accusingly, body angled toward camera. Miyagawa places the key light high and to the right, using mirrors to bounce sunlight through the forest canopy. The result is dramatic chiaroscuro: bright highlights carve the musculature of his outstretched arm while the left side falls into deep shadow. Minimal fill preserves the high-contrast ratio that makes Tajōmaru appear dangerous and unpredictable."*

The student can now read the shadows in the still as the *consequence* of three specific decisions, each of which they can see encoded as a number.

## The second still

The student scrolls. Still 2 arrives: a different shot from later in the sequence — the woodcutter, his expression closed, the forest light filtered differently. The diagram changes:

- Key light is **lower** in intensity (around 0.65) and **softer in angle** (less acute).
- Fill light is **higher** — closer to the key in strength — so the shadow side of the face isn't black, it's information.
- Back light stays in the same range; the woodcutter is still separated from the canopy behind him.

The shot description reads (paraphrased): *"A different kind of light — neither punishing nor revealing. The key-to-fill ratio has closed; the woodcutter is observed, not dramatized."*

The student doesn't have to be told that the lower contrast carries different meaning. The diagram showed them. The data is doing the explaining.

## The third still

The student scrolls. Still 3 arrives. By now they have a mental model of the three-light vocabulary, and the diagram is a thing they can read at a glance. Still 3 introduces a **variation** — perhaps the back light is more dominant, or the key has shifted around the front of the subject to a near-frontal flat-fill position. Whatever the data says, the student can read it.

The footer of the page (in cinematic small caps): a link back to the glossary entry [`/gened-1049/glossary/three-point-lighting`](https://gened-1049.vercel.app/gened-1049/glossary/three-point-lighting), and a forward link to the next concept in the curriculum.

## What the page teaches without saying

- **The concept is not abstract.** Three-point lighting *is* what these three numbers do to this specific face in this specific film.
- **The same concept produces different results.** The three stills are *the same setup* in concept and *different setups* in parameter values. The page lets the student feel the difference between *invariant principle* and *interpretive choice*.
- **Numbers are a vocabulary.** The student leaves the page with `angle`, `elevation`, `intensity`, and `key-to-fill ratio` as words they can reach for when describing other films, including their own footage.
- **The cinematographer chose this.** The page foregrounds Miyagawa's authorship. The reading of the lighting is the *interpretation of a craft decision*, not a description of a generic technique.

## The technical structure (briefly)

This page is the worked example for the **interactive concept demo** pattern documented in [`operations/interactive-concept-demo.md`](../operations/interactive-concept-demo.md):

- **Data**: `inputs/stills.ts` (mirrored in the production app at `app/three-point-lighting/stills.ts`). One record per still; numeric fields encode the lighting setup; string fields hold the descriptions.
- **Component**: a `LightingDiagram.tsx` that reads a `StillData` and renders the top-down view.
- **Page**: `app/three-point-lighting/page.tsx` that walks through the stills as a sequence.

Adding a fourth still — from a different film, or a student's own work — is a data edit to `stills.ts`. The page picks it up automatically.

## Where this fits in the broader site

The interactive demo is *paired with* a glossary entry — the same concept, written out in prose at [`/gened-1049/glossary/three-point-lighting`](https://gened-1049.vercel.app/gened-1049/glossary/three-point-lighting) (mirrored in `inputs/glossary-three-point-lighting.md`). The glossary is the *reference*; the interactive demo is the *encounter*. They reinforce each other.

A workshop participant might come to the demo first, see the lights at work on *Rashomon*, then click through to the glossary for the definition; or come to the glossary first, encounter the definition, then click through to the demo to *see* what they just read. Both directions work.
