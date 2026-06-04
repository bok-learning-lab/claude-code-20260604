# exam-makeup-generator — folder index

A worked example of a **standalone Claude Code skill** that generates candidate replacement problems for a make-up exam from an existing original, runs an instructor interview about per-slot topic scope, iterates on feedback, and assembles the chosen candidates into a finished make-up exam in the original's format. The skill in this folder is **CS20-tested** — the worked run is the real Round-1 + Round-2 + Assembly trace on the Harvard CS20 spring-2026 final exam. Start with [summary.md](summary.md); everything else is here for browsing.

This is the gallery's **first standalone-skill example.** Where the other examples ship deployed Vercel pages or CLI-style projects, this one ships only the skill (~400 lines in [`operations/skill.md`](operations/skill.md)) plus a worked run. There is no live URL — installation is `cp` into `.claude/skills/`.

## Top-level

- [summary.md](summary.md) — what this project is, the three moves worth noticing (file-as-state, the interview phase, security-vs-parity), how it was built, what you can translate it to. **Installation instructions at the top; no Vercel link because this is a skill.**
- [CLAUDE.md](CLAUDE.md) — project-level instructions loaded by Claude Code on session start.
- [index.md](index.md) / [index.html](index.html) — this file.

## inputs/

The worked run's input — the original exam the skill operated on.

- [inputs/final_s.tex](inputs/final_s.tex) — the CS20 spring-2026 final exam, LaTeX source (with solutions). 10 problems, the structural anchor for the run
- [inputs/final_s.pdf](inputs/final_s.pdf) — same exam, rendered, for visual reference

## operations/

The skill itself (the substance of the example) plus a reader's entry point.

- [operations/three-mode-state-machine.md](operations/three-mode-state-machine.md) — **read this first.** The skill's shape in one document: three modes (Generation, Iteration, Assembly), one driving file, one interview moment. The reader's framework before the substance
- [operations/skill.md](operations/skill.md) — **the skill itself.** ~400 lines, deliberately single-document. Defines the three modes, the interview phase, the generation rules (parity, distinctness, partial-credit, format match), the iteration semantics (audit-trail preservation), the assembly sanity checks, the format-agnostic read strategies
- [operations/skill.json](operations/skill.json) — the one-line manifest (name, description, version, author)

## outputs/

The worked run's output, plus a reader's guide.

- [outputs/worked-run-summary.md](outputs/worked-run-summary.md) — a guide to the two real-run artifacts: what happened in which mode, what to look for in each file, what the numbers mean
- [outputs/final_s_makeup_candidates.md](outputs/final_s_makeup_candidates.md) — **the real run.** 1,741 lines, 10 slots, 37 candidates across two rounds. Complete LaTeX solutions per candidate. Instructor's 10 Keep checkboxes pre-checked. This is the curation log + state-driving artifact
- [outputs/final_s_makeup.tex](outputs/final_s_makeup.tex) — **the assembled exam.** The chosen-per-slot candidates assembled into a complete make-up exam in the original's LaTeX format. Passed all sanity checks (balanced environments, no typo'd closing tags, 10 problems / 10 slots, subpart counts match the test plan)

---

*To install: drop [`operations/skill.md`](operations/skill.md) and [`operations/skill.json`](operations/skill.json) into your project's `.claude/skills/exam-makeup/` (or your user-level `~/.claude/skills/exam-makeup/`). Rename to `SKILL.md` if your Claude Code version expects the uppercase filename. Then invoke in any Claude Code session: `Use exam-makeup to generate candidates from path/to/my-final.tex`. The skill auto-detects mode from the state of the candidates file across re-invocations.*
