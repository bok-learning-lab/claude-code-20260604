# Operation — Interactive concept demo (data file + React component = exploration)

*The site's other signature move. A film-craft concept (three-point lighting; the 180-degree rule; shot-reverse-shot) is paired with **canonical course material** (stills from a course film, e.g. *Rashomon*) and rendered as an interactive diagram the student can manipulate. The concept is not just defined — it's **demonstrated on a specific image the student already knows**, with the underlying technique exposed as adjustable data. Worked example in production: [`app/three-point-lighting/`](https://github.com/bok-learning-lab/gened-1049/blob/main/app/three-point-lighting/).*

---

## The pattern, abstracted

A single concept demo has three pieces:

1. **A data file** that encodes the concept as structured data, anchored to specific course examples (`stills.ts` for three-point lighting — one record per still, each with the lighting setup as numeric fields).
2. **A diagram component** (`LightingDiagram.tsx`) that renders the data spatially — in this case, a top-down view of the subject with the three lights placed by angle, elevation, and intensity.
3. **A page** (`page.tsx`) that walks the student through the stills as a *narrative sequence* — hero text introducing the concept, then each still presented with its diagram, its accompanying shot description, and the named values for each light.

The data file is the source of truth. The component reads from it. Editing the data — adding a new still, adjusting an angle, retuning an intensity — propagates immediately.

## The worked example: `three-point-lighting/`

The production app's three-point-lighting demo is built around the *Rashomon* forest sequence (Kurosawa 1950, cinematographer Kazuo Miyagawa). Three stills are presented, each with Miyagawa's specific lighting setup encoded:

### The data shape (from `inputs/stills.ts`)

```typescript
export interface LightConfig {
  label: string;
  description: string;
  /** Angle in degrees on the top-down diagram (0 = directly in front, clockwise) */
  angle: number;
  /** Elevation in degrees: 0 = subject level, positive = above, negative = below */
  elevation: number;
  /** 0–1 intensity */
  intensity: number;
  /** CSS color for the light glow */
  color: string;
}

export interface StillData {
  id: string;
  src: string;
  title: string;
  shotDescription: string;
  keyLight: LightConfig;
  fillLight: LightConfig;
  backLight: LightConfig;
}
```

Each still gets one `StillData` record. Each light is a `LightConfig` with five numeric/string fields: where it's positioned (angle + elevation), how strong it is (intensity), what color (warm sunlight, cool blue, etc.), plus human-readable labels and descriptions the page renders alongside the diagram.

### What the student sees

For each still in the sequence:

1. **The still itself** — the actual frame from the film. The thing the student already remembers.
2. **A top-down diagram** — the subject as a circle in the center; the three lights as colored arcs positioned according to `angle` and sized according to `intensity`. The student can see at a glance that this still uses a hard, high key light from camera-right and minimal fill — and that's why the shadows fall the way they do.
3. **The shot description** — the *cinematographic argument*: *"Miyagawa places the key light high and to the right, using mirrors to bounce sunlight through the forest canopy. The result is dramatic chiaroscuro: bright highlights carve the musculature of his outstretched arm while the left side falls into deep shadow."* This is the *reading* of the lighting choice, written by the instructor.
4. **The per-light descriptions** — three short paragraphs, one per light, with the specific values: *"Strong directional light from the right (~4 o'clock), high above the subject, mimicking sunlight bounced off mirrors through the tree canopy. Creates hard-edged highlights on the right side of the face, chest, and extended arm."*

The student moves through the stills one at a time and sees how the same concept (three-point lighting) produces *different effects* under different parameter settings. The data file is the locus of comparison.

## Why this pattern works

- **Concepts taught only as definitions stay abstract.** "The key light is the primary source" is a sentence; *seeing* the key light at a specific angle on a specific Rashomon still that the student has already watched is a memory.
- **The data file makes the concept legible as a sequence.** When the student moves from Still 1 to Still 2 to Still 3 and the diagrams change, they're seeing *what stays the same* (it's always a three-point setup) and *what changes* (the ratio between key and fill, the elevation, the warmth of the back light). The concept and its variation are presented together.
- **The data file is the locus of edits.** Adding a new still — from a different film, a student's own footage, a still from a different cinematographer — is a data edit, not a code edit. The component and the page are written once.

## Adapting to other concepts

The pattern generalizes well to anything where a concept has *spatial or parametric* structure that can be encoded as numbers:

| Concept | What the data encodes | What the diagram renders |
|---|---|---|
| Three-point lighting | Angle, elevation, intensity, color per light | Top-down placement of lights around subject |
| 180-degree rule | Two characters' positions, the camera line, where the camera is allowed | Top-down floor plan with the 180° axis marked |
| Shot-reverse-shot | A sequence of camera placements relative to two subjects | A storyboard with arrows showing camera position |
| Aspect ratio | Frame dimensions, subject placement | The frame with the subject overlaid; the rule-of-thirds grid |
| Color grading | Hue, saturation, lift/gamma/gain values | A before/after pair with the curve visible |
| Editing rhythm | Shot lengths in frames, cut positions | A timeline with the cuts as ticks |

The constraint is *not* "all concepts work this way" — many film concepts (genre, allegory, narration) are conceptual rather than parametric. But the parametric ones gain a lot from this treatment, and the cinematography curriculum is dense with them.

## The page-as-narrative structure

The `app/three-point-lighting/page.tsx` is not just a viewer — it's a *narrative*:

1. **Hero** — the concept introduced, with a quote or framing claim
2. **Still 1** — diagram + description, establishing the canonical case
3. **Still 2** — diagram + description, showing variation
4. **Still 3** — diagram + description, showing further variation or a counter-example
5. **Outro** — what to take into the student's own work

The page treats the stills as a *sequence of teaching moments* rather than a gallery. Each still is given its own scroll-section with deliberate transitions. The reading is linear; the comparison is built up incrementally.

## What this operation deliberately doesn't do

- **No interactivity on the diagram itself.** The diagrams are *read-only* — the student doesn't drag the lights around. The pedagogical commitment is to show *what the cinematographer chose*, not to let the student remix it. (A "remix the lighting" mode could be a sibling operation; deliberately out of scope here.)
- **No quiz or graded check.** The page is a reading experience. Assessment happens elsewhere.
- **No CMS-backed data.** The data is a TypeScript file checked into the repo. Editing requires a code commit. This is intentional — the data is *content*, not user input, and it should travel with the code that renders it.
- **No animation timeline / playback.** The student moves through the stills by scrolling. Self-pacing.

## Hard constraints (these survive translation)

- **Anchor every concept demo to canonical course material.** Don't teach three-point lighting against a generic photograph — teach it on the *Rashomon* stills that are already on the syllabus. The match between the concept demo and the course's actual texts is what makes the demo earn its place.
- **The data file is the source of truth.** A new still / a new example is a data edit. Resist building admin UIs or content-management layers.
- **The diagram reads from the data, not from the page.** The component should be reusable across stills (and ideally across pages) — never hardcode a specific still inside the component.
- **Pair the diagram with the instructor's *reading*.** A diagram alone is a chart; a diagram next to the instructor's prose argument is a *lesson*. The `shotDescription` field in the data is doing essential work.
- **Sequence matters.** The order of stills is a curriculum choice. Don't shuffle them; don't add a "random" mode. The teaching arc lives in the sequence.
