# paper-to-teaching-materials — folder index

A worked example of using Claude Code to build and run teaching material for an ethics-of-AI session, grounded in Grant, Behrends & Basl (2025) on decision-subject ethics. Start with [summary.md](summary.md); everything else is here for browsing. For a polished walkthrough suitable for sharing with colleagues, see [outputs/case-study.html](outputs/case-study.html).

## Top-level

- [summary.md](summary.md) — what this project is, the framework it applies, how we built it, what you can translate it to
- [CLAUDE.md](CLAUDE.md) — project-level instructions loaded by Claude Code on session start
- [index.md](index.md) / [index.html](index.html) — this file

## inputs/

The source paper, in two forms.

- [inputs/grant_behrends_basl.pdf](inputs/grant_behrends_basl.pdf) — the source paper (open access, CC BY 4.0)
- [inputs/grant_behrends_basl.md](inputs/grant_behrends_basl.md) — markdown digest for fast reading and citation lookup

## operations/

The Deep Research prompt that produced the contextualizing essay, plus the skills that operate on the paper.

- [operations/deep-research-prompt.md](operations/deep-research-prompt.md) — the prompt for an LLM Deep Research tool (Claude Deep Research, ChatGPT Deep Research, Perplexity Deep Research). Produces a 2,500–3,500-word contextualizing essay on decision-subject ethics, the Grant-Behrends-Basl framework, and how it lands across adjacent fields. The artifact for workshop participants who want the methodological tradition the paper sits in.
- operations/skills/
  - [teaching-case/](operations/skills/teaching-case/) — generate a student-facing case + instructor notes, engineered to surface a specific move in the framework
    - [SKILL.md](operations/skills/teaching-case/SKILL.md)
    - examples/ — `case-medical-bail-5.2.md` (a §5.2 case) and `case-decoy-admissions.md` (the construct-validity stress test, designed to pass)
  - [discussion-plan/](operations/skills/discussion-plan/) — Socratic sequence around a case, anticipating student positions and routing toward the move in the paper that answers them
    - [SKILL.md](operations/skills/discussion-plan/SKILL.md)
    - examples/ — `discussion-plan-C1.md` (a plan built around the C1 recidivism case)
  - [objection-audit/](operations/skills/objection-audit/) — steelman a student argument, then diagnose against the framework with section citations
    - [SKILL.md](operations/skills/objection-audit/SKILL.md)
    - examples/ — `audit-S1.md`, `audit-S2.md`, `audit-S3.md` (audits of the three corpus student arguments)
  - [quiz/](operations/skills/quiz/) — short-answer comprehension check on the core argument, with student version and instructor answer key
    - [SKILL.md](operations/skills/quiz/SKILL.md)
    - examples/ — `end-of-class-quiz.md`

## outputs/

Produced artifacts.

- [outputs/case-study.html](outputs/case-study.html) — the published landing page for the project. Walks a visitor through what the project is, what it's teaching, the skills, what they produce, the cases and student arguments they operate on, the constraints, the build story, and a one-screen summary of the paper. Single-page document with #anchor navigation, suitable for sharing with a colleague who is not going to clone the folder.
- [outputs/README.md](outputs/README.md) — design rationale for the synthetic case/student-argument corpus
- [outputs/walkthrough.md](outputs/walkthrough.md) — the conversational steps that produced this project, prompts shown verbatim
- outputs/cases/ — four cases ([C1 recidivism](outputs/cases/C1-recidivism.md), [C2 resume screener](outputs/cases/C2-resume-screener.md), [C3 interpretable alt](outputs/cases/C3-interpretable-alt.md) — the construct-validity stress test, designed to pass — [C4 juror model](outputs/cases/C4-juror-model.md))
- outputs/student-arguments/ — three engineered-wrong arguments ([S1](outputs/student-arguments/S1-accuracy-is-all.md), [S2](outputs/student-arguments/S2-humans-too.md), [S3](outputs/student-arguments/S3-human-in-the-loop.md))
- outputs/discussion-plans/ — [discussion-plan-C1.md](outputs/discussion-plans/discussion-plan-C1.md) (worked example for C1)
- outputs/objection-audits/ — [audit-S1.md](outputs/objection-audits/audit-S1.md), [audit-S2.md](outputs/objection-audits/audit-S2.md), [audit-S3.md](outputs/objection-audits/audit-S3.md)
- [outputs/end-of-class-quiz.md](outputs/end-of-class-quiz.md) — student-facing comprehension quiz + instructor answer key

---

*To run the demo: open this folder in Claude Code, then `/teaching-case` for a §5.2 case → `/discussion-plan` around that case → `/objection-audit` on a student argument that picks up the missed distinction → `/quiz` for the comprehension check. The throughline to show the room: at every step Claude is augmenting the teacher's reasoning, never deciding — which is the paper's own thesis, demonstrated rather than asserted.*
