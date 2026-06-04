# Physics interactives with Claude Code

A working demonstration that the kind of interactive teaching simulation pioneered by Carl Wieman's PhET project at Colorado — small, manipulable, conceptually disciplined worlds in which a learning idea becomes visible — is now within reach of an individual faculty member with an afternoon. The project ships four Claude Code skills (`/phet-sim`, `/phet-activity`, `/phet-accessibility-audit`, `/phet-rationale`), single-file HTML templates a faculty member can adapt, a quality rubric and accessibility checklist that gate "ready to share with students," and a sample teaching brief (the heat-pump lecture in `inputs/`) the skills can be exercised against.

The companion essays that previously sat in `overview/` — a longer summary, a piece on the PhET tradition, and a piece on what LLMs change about it — are folded into the relevant sections below. The plan that scheduled the build is folded into "how we built it."

---

## What it is

Four Claude Code skills, scoped to this project's `operations/skills/` directory, each implementing one move in the PhET design grammar.

- **`/phet-sim`** runs a structured pedagogical interview *before* writing any code: learning goal, target learner, the misconception the simulation should make visible, the variables that should be manipulable, the variables that should be deliberately hidden, the linked representations, the reflection prompts, the model's limitations, the classroom use. Only then does it generate a single-file HTML simulation that opens by double-click in Chrome with no build step. The interview is the skill's main contribution; without it, the skill would be just another "make a slider thing" prompt. Self-scores against an 8-dimension quality rubric and refuses to declare a simulation done if it scores below 12/16 or scores 0 on any dimension.
- **`/phet-activity`** takes an existing simulation (or its design record) and a few classroom context inputs and produces a Wieman-style lesson plan organized around the four-phase Predict → Observe → Explain → Synthesize structure. Refuses to ship a plan that does not name at least two expected wrong predictions — the highest-leverage piece of an interactive-engagement lesson, and the one most often skipped by faculty new to the approach.
- **`/phet-accessibility-audit`** audits a generated simulation against an accessibility floor (keyboard operability, label coverage, contrast, color-only information, live-region density, motion handling) and produces a markdown report categorizing findings as Blockers, Warnings, or Notes. A simulation with Blockers is not declared ready to share with students.
- **`/phet-rationale`** produces a 600–1,000-word department-facing rationale for a specific simulation and (optionally) its `/phet-activity` lesson plan, suitable for a department chair, curriculum committee, dean, accreditation reviewer, or skeptical colleague. Refuses to fabricate citations; refuses to omit the "what we are not claiming" section.

The project also ships three single-file HTML templates (SVG, Canvas, and a linked-graph layout), a paper-friendly long-form version of the pedagogical interview, and a sample teaching brief — the [heat-pumps brief](inputs/heat-pumps-teaching-brief.md) — that faculty can use to exercise the skills end-to-end. Background research that informed the project (the PhET tradition essay, the manipulable-artifact essay, the empirical research basis) sits in `outputs/` as produced artifacts.

The hard output contract for every generated simulation: single `.html` file, opens by double-click from `file://`, no React/Vue/Vite/Next.js/npm/build step, no runtime data fetches, no emojis, header comment captures the full pedagogical design record. If a user explicitly overrides one of these rules, the deviation is marked in the file's header.

### The tradition this sits in

The idea that learners build conceptual understanding most powerfully by manipulating a public artifact rather than absorbing description goes back to Seymour Papert's *constructionism* at MIT in the 1970s. The Logo turtle microworld — a contained environment with simple rules and immediate consequences, on which a learner forms a conjecture, runs it, observes the result, and revises — is structurally identical to the loop a scientist runs in the lab. Joined in the 1980s and 1990s by empirical work on conceptual change in science education, the Force Concept Inventory's revelation that nearly 80% of students completing introductory physics could state Newton's Third Law but fewer than 15% understood it, and the consequent finding that conceptual change requires *cognitive conflict* — predict, run, confront the discrepancy.

PhET Interactive Simulations was founded at the University of Colorado Boulder in 2002 by Nobel laureate Carl Wieman, around exactly this insight. A PhET simulation is built around five design moves: a model (a faithful simplification of the system), a manipulable interface, immediate feedback, multiple linked representations (physical, graph, equation, table, all updating together), and a deliberately simplified world (the pedagogical move is the simplification, not the realism). What to leave out is the most consequential design decision and is invisible in the finished product.

PhET's twenty-year track record came from doing two kinds of work expensively and well: writing the code, and identifying the right learning goal, choosing the right simplification, designing the right linked representations, and validating against actual students. Each simulation was the product of a team of three to five specialists — software developer, content expert, teacher, education researcher — across years, with hundreds of one-on-one student interviews. The evidence base accumulated alongside: Hake's 1998 study of about 6,000 introductory-physics students (interactive engagement courses produce roughly double the normalized learning gain on the FCI vs. traditional lecture); Adams et al.'s 2008 simulation-engagement and interface-design studies (over four hundred student interviews); Freeman et al.'s 2014 PNAS meta-analysis (active-learning conditions raise exam scores by 0.47 SDs and reduce failure rates by 55%); Banda & Nzabahimana's 2021 PRPER review of 31 studies of PhET specifically. The pattern is consistent: simulations teach when they surface a specific misconception and are used in classroom routines that require students to predict, test, discuss, explain, and revise.

### What LLMs change about it

Generative AI does not lower the PhET barrier by removing one of the specialists; it lowers it by collapsing the cost of *prototyping* an artifact to the point where a single faculty member, working alone with Claude Code, can produce in an afternoon what previously took a team a year. The cost of writing the code has collapsed. The cost of identifying the right learning goal, choosing the right simplification, designing the right linked representations, and validating against actual students has not.

The new affordance is substantial: faculty can describe a conceptual system in natural language and have a working interactive in minutes, iterate on labels and units for a specific course, generate parallel versions for different student levels — and do this for the topics PhET never covered, in the disciplines PhET never served. A rhetorical-feedback-loop sandbox for a writing class, a small-N qualitative-coding visualizer for a methods class, a bargaining-game widget for an economics tutorial, an attention-mechanism visualizer for a CS lecture, an infrastructure-decay simulator for an urban-studies seminar — none of these were going to be built by a funded team. All are now within reach.

The risk is that the technical floor has dropped far faster than the design floor. A bad AI-generated simulation can be very seductive — sliders, particles, graphs, color, motion, all responding immediately to the user, and no learning goal at the center. PhET's hardest lesson was not "make things interactive." It was: *make the right things interactive, in the right way, and constrain everything else.* The pedagogical interview in `/phet-sim` is not friction to be optimized away. The interview *is* the contribution. Without it, the project competes with every other "make a slider thing" prompt. And a simulation in a tab open beside a textbook is not a lesson — it is a tool waiting for a lesson; the `/phet-activity` skill exists because Wieman's group has been clear in print for years that PhET sims produce conceptual gains *only when wrapped in interactive engagement activities*.

What this project is *not* claiming: that the simulations it produces are better than PhET's; that an instructor-built artifact has been validated against students the way a published PhET simulation has been; that LLM-built simulations have a measured learning effect (they have no such track record, by definition). The defensible claim is conditional: an AI-built simulation is more likely to teach when it follows PhET-tradition design principles, is integrated into an active-learning routine in the classroom, and is iteratively tested with actual learners. The instrument is more powerful. The standard of care has not changed.

---

## How we built it

The project's quality depends entirely on the rubric, worksheet, and template documents that back the skills. Build those first, then build examples, then promote.

**Phase 1 — Foundations.** Draft the three rubric/worksheet documents: an 8-dimension quality rubric (conceptual clarity, interactivity, visual legibility, feedback quality, accessibility, local portability, code maintainability, disciplinary honesty), an accessibility checklist (keyboard operability, labels, contrast, color-only information, sizing floor, no hover-only affordances), and a paper-friendly version of the 10-question pedagogical interview. Phase done when all three docs read as a coherent set and the tradition essay has been voice-edited.

**Phase 2 — Templates.** Three single-file HTML starters that the skill uses as scaffolds: an SVG default (model + DOM controls + reset, embedded `<style>` and `<script>` blocks, no external dependencies), a Canvas variant (for particle systems, fields, fluids — anything where rendering many moving objects per frame matters), and a linked-graph variant (the canonical PhET layout — model viewport on the left, live graph on the right, both wired to the same state). Each template must open from `file://` and pass the accessibility checklist for its scaffolding before any topic-specific code is added.

**Phase 3 — Worked examples + skill iteration.** This is where the skill gets tested against itself. Each example is built by *invoking the skill draft on a learning goal*, not by writing the HTML directly. The point is to find the skill's failure modes early — Common predicted failures: skipped pedagogical interview, used a CDN library it didn't need, generated `fetch()` calls, forgot to wire reset, forgot the "Model limitations" panel, put accessibility labels in inline comments instead of `aria-label` attributes. Each failure mode discovered becomes an explicit line in the skill's QC checklist or pedagogical contract. Four planned examples: projectile motion (canonical PhET STEM lineage), SIR epidemiology (current STEM relevance), rhetorical feedback loop (humanities, new affordance), attention-window visualizer (CS / AI explainer).

**Phase 4 — Promotion + sibling skills.** Move the working drafts into `operations/skills/<name>/` once verified. Build the sibling skills in the same project-local convention: `/phet-activity` for classroom lesson plans (the natural pair to `/phet-sim` — a sim without an activity is a screenshot, an activity without a sim is a worksheet), `/phet-accessibility-audit` for the audit floor, `/phet-rationale` for the department-facing argument, with planned `/phet-critique` (score an existing `.html`) and `/phet-port` (convert a static figure to an interactive — the on-ramp skill for faculty arriving with a textbook diagram in mind).

The skill location convention matters: skills live under the project's own `operations/skills/` so a faculty member who clones just this folder gets the corpus, the templates, the rubrics, and the skills as a self-contained bundle. The CLAUDE.md is what makes the project self-introducing to any Claude session that opens it.

### Things this approach taught us

The skill quality depends entirely on the rubrics and templates that back it. Building rubrics first — before any examples — keeps the skill from producing plausible-looking simulations with no learning goal at the center. The pedagogical interview is the contribution; trying to optimize it away by collecting "fewer questions, faster artifact" defeats the point. Accessibility belongs in the audit step, not the QC vibe-check; without a measurable floor, "accessible" becomes a marketing word. The output contract (single file, no build step, opens from `file://`) makes the artifacts portable in the way faculty actually need — emailable, Canvas-uploadable, viewable on any laptop without setup.

---

## What you can translate this to

The pattern in this project is portable to any domain where the substantive work is:

1. **A design discipline with named moves** — PhET's five design moves are the constraints `/phet-sim` enforces. Any field with a comparable explicit design grammar (UX heuristics, instructional design models, editorial style guides) can structure a skill the same way.
2. **A hard output contract** that makes the artifact portable. PhET's contract is "single HTML, no build, no fetches." Other domains have analogous constraints: "single PDF," "single Jupyter notebook with no external data," "single Markdown file with no broken links."
3. **A pedagogical interview before generation.** The interview is what keeps the artifact aimed. Other domains have analogous pre-generation specs: a learning-outcomes pass before a syllabus, a stakeholder-needs pass before a deliverable, a constraint-elicitation pass before a design brief.
4. **A measurable floor** that gates "ready to share." Accessibility for simulations. Citation verification for literature reviews. Reproducibility checks for analysis notebooks. Test coverage for code.

Domains where the same shape applies almost without modification:

- **Interactive teaching artifacts in non-STEM fields** — humanities, social sciences, professional schools. Same skill shape, different content domains. Try a rhetorical-feedback-loop simulator for a writing seminar; a small-N qualitative-coding visualizer; a bargaining-game widget; an infrastructure-decay simulator; an attention-mechanism visualizer.
- **Lesson plan generation from any artifact** — `/phet-activity` is just a Predict-Observe-Explain-Synthesize generator parameterized by an artifact. Swap PhET sim for a primary-source document, a data visualization, a piece of legislation, a contested news article.
- **Accessibility audits for any web artifact**, not just simulations. Same checklist categories, different application.
- **Department-facing rationale documents** for any pedagogical choice — `/phet-rationale` is a 600–1,000 word argument generator with a "what we are not claiming" section and citation discipline.
- **Compliance-style audits with category-gated outputs** (Blockers / Warnings / Notes) for any domain where a checklist exists — security review, code review against a style guide, manuscript review against journal requirements.

The pattern in all of these is the same: design grammar provides constraints, pedagogical interview provides aim, templates provide scaffolding, audit closes the loop on a floor, rationale makes the work defensible to stakeholders. The skills travel with the project rather than living globally.

---

## Alignment constraints (the hard ones)

These survive translation to other domains:

- **The interview is the contribution.** Optimizing for fewer questions defeats the purpose. The skill's value is making the design discipline cheap enough that a faculty member actually does it.
- **Output contract is non-negotiable.** Single file, opens locally, no build step. The portability is what makes the artifact usable in the way faculty actually need.
- **Accessibility is part of pedagogy.** It gates "ready to share with students" against a real floor, not instructor confidence.
- **Refuse to fabricate.** The `/phet-rationale` skill refuses to invent citations. The audit skill refuses to claim compliance without measurement. The methods-paragraph equivalent in this project's design grammar is "what we are not claiming" — every artifact has one.
- **No emojis. No CDN dependencies by default.** Workshop conventions, also portability requirements.
