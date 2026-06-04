# CLAUDE.md

Project-level instructions loaded when Claude Code starts in this folder.

## What this repo is

A curated gallery of worked Claude Code examples and supporting workshop materials, drawn from the **"Claude for Teaching, Course Development, and Research"** workshop series run by Marlon Kuzmick (Director of the Learning Lab at Harvard's Bok Center). It is a docs/materials repo — no build system, no package manager, no tests.

Two top-level folders carry the substance:

- [examples/](examples/) — nine self-contained worked examples. Each is meant to be opened as its own Claude Code project (`cd` into the example, run `claude`). Each has its own `CLAUDE.md`, `summary.md`, `index.md`/`index.html`, `inputs/`, `operations/`, and `outputs/`.
- [resources/](resources/) — workshop-recap material, handouts, and the AI glossary in both HTML and Markdown variants.

## The examples

Each example is a standalone project demonstrating one Claude Code move applied to a real teaching, research, or course-development task. They share a structure — `inputs/` (read-only source), `operations/` (the prompt and/or skills that do the work), `outputs/` (generated artifacts), plus `CLAUDE.md` / `summary.md` / `index.md` documentation at the root.

| Example | The move it demonstrates |
|---|---|
| [class-summarizer](examples/class-summarizer/) | Forced-count distillation of a workshop transcript into a Top 10 Key Takeaways doc + portable HTML |
| [interview-coding](examples/interview-coding/) | Mary-Waters-aligned flexible coding of qualitative interview transcripts at scale |
| [paper-to-teaching-materials](examples/paper-to-teaching-materials/) | Skill toolkit (`/teaching-case`, `/discussion-plan`, `/objection-audit`, `/quiz`) built around a single defining paper |
| [physics-interactives](examples/physics-interactives/) | PhET-style single-file HTML simulations a faculty member can build and ship without a build step |
| [recentering-academics](examples/recentering-academics/) | Discipline-specific curricular recommendations grounded in Bok guidance, Harvard data, and the grading research |
| [research-helper](examples/research-helper/) | Faithful research-paper summaries with an explicit "pedagogical bridge" interpretive layer |
| [smart-text-search](examples/smart-text-search/) | LLM as close reader at scale — naming every writer cited in 538 Dylan songs |
| [smart-text-search-joyce](examples/smart-text-search-joyce/) | Parallel close-reading subagents finding Fionn in *Finnegans Wake* |
| [texts-and-translation](examples/texts-and-translation/) | Comparative translation and figure-identification across non-English primary texts (Homeric Greek, Sanskrit) |

## Conventions inside examples

Every example follows the same structure so faculty can move between them without re-learning the layout:

- **`CLAUDE.md`** at the root of each example — project-level instructions loaded on session start.
- **`inputs/`** — read-only source material. Don't modify it.
- **`operations/`** — the prompt(s) and/or skills that drive the work. Skills, when used, live at `operations/skills/<skill-name>/`, project-scoped so they travel with the example.
- **`outputs/`** — generated artifacts. Regenerating overwrites.
- **`summary.md`** — what the project is, how it was built, what you can translate it to.
- **`index.md` / `index.html`** — a map of the folder.
- **No emojis** in any file (workshop-wide convention).
- **Markdown link syntax** for file references — `[file](path/to/file.md)`.

## Conventions at this repo level

- **Don't create top-level markdown files** (READMEs, plans, summaries) unless explicitly asked. New content goes inside an example or in `resources/`.
- **No build system.** This is a static docs and prompts repo; if tooling ever does appear, the preference is `pnpm` over `npm` or `yarn`.
- **Generated artifacts belong inside the example that produced them**, in that example's `outputs/`.
- **No emojis** in any file unless explicitly requested.

## If you just opened this folder

- Looking for a specific example? Start with [examples/](examples/) and read the `summary.md` of the one that matches your task.
- Looking for the workshop recap material? Start in [resources/](resources/).
- Building a new example? Copy the structure of an existing one (`paper-to-teaching-materials` and `texts-and-translation` are the most fully-developed multi-skill examples; `research-helper` and `smart-text-search` are the simplest single-prompt examples).
