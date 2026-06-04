# research-white-paper-website — folder index

A worked example of **publishing research-in-progress with about 150 lines of Next.js code** — no CMS, no headless content layer, no rewriting research as web posts. The markdown files the researcher writes for themselves *are* the published content; the website is a friendly viewer over the file tree. Drawn from <https://harvest-times.vercel.app/> — the public research site for an investigation into whether Anglo-Saxon harvest-time instructions in the *Old English Herbarium* correlate with modern pharmacological evidence (key finding: **9 of 11 testable candidates show alignment**). Start with [summary.md](summary.md); everything else is here for browsing.

## Top-level

- [summary.md](summary.md) — what this project is, the three moves worth noticing (file-tree-as-navigation, safe-prefix routing, the agent-output firebreak), how it was built, what you can translate it to. **Live site + source repo linked at the top.**
- [CLAUDE.md](CLAUDE.md) — project-level instructions loaded by Claude Code on session start.
- [index.md](index.md) / [index.html](index.html) — this file.

## inputs/

A representative slice of the research's primary sources.

- [inputs/sources/old_english_herbarium.txt](inputs/sources/old_english_herbarium.txt) — the Van Arsdall translation, plain-text extract (~228KB). The 30 remedies with harvest-time instructions are scattered through this file
- [inputs/sources/review_of_scholarship.txt](inputs/sources/review_of_scholarship.txt) — the researcher's review of scholarship on the Herbarium (44KB)

*Not copied: the 16MB PDF of the Herbarium itself. The full source repo has it.*

## operations/

The actual website code copied verbatim (four files, ~285 lines total) plus two architecture documents.

- [operations/research-site-architecture.md](operations/research-site-architecture.md) — **the file-tree-as-navigation pattern.** Safe-prefix routing, the `ensureSafe()` guard, relative-link rewriting, the five-section convention. The site's whole architecture in one document
- [operations/agent-output-firebreak.md](operations/agent-output-firebreak.md) — **the human/AI authorship convention.** A top-level `agent-output/` section keeps AI-generated artifacts structurally distinct from the human-authored research; the reader can audit which parts of the work are AI-assisted
- [operations/lib-content.ts](operations/lib-content.ts) — **copied verbatim from production** (~95 lines). The `SECTIONS` array, the `ensureSafe()` guard, the file readers (`listDir`, `readText`, `readBinary`, `statPath`)
- [operations/app-page.tsx](operations/app-page.tsx) — **copied verbatim** (~30 lines). The landing page that renders the repo's README + five section cards
- [operations/browse-page.tsx](operations/browse-page.tsx) — **copied verbatim** (~115 lines). The dynamic `[...path]` route that renders directories or files by type
- [operations/Markdown.tsx](operations/Markdown.tsx) — **copied verbatim** (~35 lines). The markdown renderer with relative-link rewriting

## outputs/

A representative slice of the research substance plus reader's guides.

- [outputs/_source-snapshot.md](outputs/_source-snapshot.md) — the Next.js architecture, the repo layout (which sections live where, what files are in each), the deployment story, what the site deliberately does *not* do
- [outputs/worked-research-summary.md](outputs/worked-research-summary.md) — a reader's guide to the research arc: the four-tier reading order, the file-by-file map, what each section contains, where to start
- [outputs/candidate_remedies.md](outputs/candidate_remedies.md) — **the centerpiece research finding.** The 14 Tier 1 candidates with harvest-time + pharmacological evidence per candidate; 9 of 11 testable cases show alignment
- [outputs/theoretical_framework.md](outputs/theoretical_framework.md) — the Pasquinelli "ritual as algorithm" framing
- [outputs/experimental_proposal.md](outputs/experimental_proposal.md) — six proposed experiments to test specific claims (bench-top phytochemistry, archival cross-referencing, ethnographic fieldwork)
- [outputs/agent-output-sample-van-arsdall.md](outputs/agent-output-sample-van-arsdall.md) — a sample agent-output: an AI-generated synthesis comparing Van Arsdall's translation choices against the Cockayne original. Lives in `agent-output/` in the production repo (behind the firebreak); included here as the example of what's on the AI-authored side of the structural separation

---

*To translate the pattern to another research project: declare your section slugs in [`operations/lib-content.ts`](operations/lib-content.ts); make sure each is a real folder at the repo root; deploy to Vercel. The 150 lines of code don't change. The substance — your research — replaces this site's substance. **Include an `agent-output/` (or equivalent) section** if AI assisted the work — see [`operations/agent-output-firebreak.md`](operations/agent-output-firebreak.md).*
