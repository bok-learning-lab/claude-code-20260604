# Worked-research summary — reading the substance

*A reader's guide to the research the site exposes. This document orients you to the research arc, points at the centerpiece findings, and helps you decide what to read first. The full substance is browsable at <https://harvest-times.vercel.app/>; a representative slice is in this folder.*

---

## The thesis in one paragraph

Anglo-Saxon monks encoded empirical pharmacological knowledge in **ritualized harvest-time instructions** preserved in the *Old English Herbarium* (10th century). What colonial-era and 20th-century scholars dismissed as "magical" or "superstitious" — lunar timing, pre-dawn harvest, iron avoidance, seasonal prescriptions — may reflect *centuries of accumulated observation* about when medicinal plants are most pharmacologically potent. The research asks: **does modern phytochemistry confirm what the manuscript prescribes?**

## The key finding

**Of the 14 Tier 1 candidate remedies the researcher screened, 11 are testable** (the others lack sufficient modern data). **Of those 11, 9 (82%) show alignment** between the manuscript's prescribed harvest time and the modern pharmacological optimum for the bioactive compound concentration relevant to the stated use.

This is in [`candidate_remedies.md`](candidate_remedies.md) (the centerpiece document). The 9 confirming cases include:

- **Betony** (*Stachys officinalis*) — harvest in August (manuscript) aligns with peak phenolic concentration (modern pharmacology).
- **Vervain** (*Verbena officinalis*) — moonless-night harvest aligns with peak iridoid glycoside concentration (which drops in sunlight).
- **Mugwort** (*Artemisia vulgaris*) — pre-dawn harvest aligns with peak essential oil yield (which decreases by mid-morning).
- **Plantain** (*Plantago major*) — iron-avoidance instructions align with the modern observation that plantain's phenolic compounds chelate ferrous iron, *reducing* their pharmacological availability.

The two counterexamples are documented honestly. The 2 untested candidates are flagged for future work.

## The theoretical frame — Pasquinelli

Matteo Pasquinelli's "Three Thousand Years of Algorithmic Rituals" (e-flux, 2019) is the theoretical anchor. Pasquinelli's definition of "algorithm" — emergent from below, divided into finite steps, encoding non-obvious tricks, and economical — applies precisely to ritualized harvest-time instructions:

- **Emergent from below**: instructions accumulated across centuries of monks observing what works.
- **Divided into finite steps**: harvest at this time, in this season, under this light, avoiding this metal.
- **Encoding non-obvious tricks**: the chemistry behind the timing isn't visible in the surface instruction.
- **Economical**: a one-paragraph instruction transmits what required generations of trial-and-error to learn.

The ritual IS the algorithm — a way of preserving and transmitting pharmacological knowledge that pre-modern cultures developed for the same reason modern cultures invented programming languages: to encode procedural knowledge in a transmissible form.

This is in [`theoretical_framework.md`](theoretical_framework.md).

## The research arc — file by file

The research builds across files in a deliberate sequence. Reading them in order:

### Tier 1 — primary engagement

| File | What it does | Where it lives in production |
|---|---|---|
| `README.md` | Thesis, key finding, status checklist | repo root (rendered on `/`) |
| `analysis/candidate_remedies.md` | The 14 Tier 1 candidates with harvest-time + pharmacology citation per candidate; the centerpiece data | `/browse/analysis/candidate_remedies.md` |
| `analysis/theoretical_framework.md` | Pasquinelli's ritual-as-algorithm frame, applied to the research | `/browse/analysis/theoretical_framework.md` |
| `proposal/experimental_proposal.md` | Six experiments to test specific claims — bench-top phytochemistry, ethnographic fieldwork, archival cross-referencing | `/browse/proposal/experimental_proposal.md` |

### Tier 2 — extension and synthesis

| File | What it does |
|---|---|
| `analysis/expanded_candidates.md` | Round 2: peony, navelwort, madder, additional candidates beyond the initial 14 |
| `analysis/deep_research_findings.md` | Extended notes on diurnal variation, lunar chronobiology, iron-phenolic chemistry, the Bee Plant identification problem, Bald's Leechbook precedents |
| `analysis/paper_arcs.md` | The three paper arcs (ethnopharmacology, intellectual history, folklore) sketched out as outlines |

### Tier 3 — drafts in progress

| File | What it does |
|---|---|
| `drafts/paper1_ethnopharmacology.md` | The pharmacology paper — focus on the alignment finding, the methodology, the experimental proposal |
| `drafts/paper2_intellectual_history.md` | The intellectual-history paper — colonial-era dismissals, 20th-century revival, the political stakes of "what counts as knowledge" |
| `drafts/paper3_folklore.md` | The folklore paper — ritual as algorithm, transmission across cultures, the move from observation to instruction |
| `drafts/sources_to_acquire.md` | Working list of paywalled and physical sources still to obtain |
| `drafts/sources_split_books_articles.md` | Bibliography split by source type |

### Tier 4 — sources (primary)

| File | What it does |
|---|---|
| `sources/old_english_herbarium.txt` | The Van Arsdall translation, plain-text extract (~228KB). The 30 remedies with harvest-time instructions are scattered across this file |
| `sources/review_of_scholarship.txt` | The researcher's review of scholarship — what other scholars have said about the Herbarium, the colonial-era dismissal of "magical" elements, the 20th-century revival |
| `sources/*.pdf` | The original PDFs (Van Arsdall, Review of Scholarship); rendered in an iframe by the browse route |

### The firebreak — `agent-output/`

| File | What it does |
|---|---|
| `agent-output/read-through-2026-05-05.md` | An AI-generated read-through of the Herbarium, dated, in its original form (16KB) |
| `agent-output/van-arsdall-translator-choices.md` | An AI-generated synthesis comparing Van Arsdall's translation choices against the Cockayne original (32KB) |

These are kept structurally separate from the human-authored work (see [`../operations/agent-output-firebreak.md`](../operations/agent-output-firebreak.md)). A reader can compare what the agent produced against what the researcher kept; the firebreak makes that audit possible.

## What to read in this folder

The example folder copies a representative slice of the substance:

- **[`candidate_remedies.md`](candidate_remedies.md)** — the centerpiece finding, the 14 Tier 1 candidates table.
- **[`theoretical_framework.md`](theoretical_framework.md)** — the Pasquinelli frame.
- **[`experimental_proposal.md`](experimental_proposal.md)** — the six proposed experiments.
- **[`agent-output-sample-van-arsdall.md`](agent-output-sample-van-arsdall.md)** — a sample agent-output for the firebreak.

For the full substance, navigate the live site at <https://harvest-times.vercel.app/>.

## Status (from the README)

- ✓ Full extraction of harvest-time instructions from the Old English Herbarium (30 remedies)
- ✓ Pharmacological screening of all harvest-time plants
- ✓ 14 Tier 1 candidates identified (9 with strong alignment, 2 untested, 2 counterexamples, 1 moderate)
- ✓ Literature review: diurnal variation, lunar chronobiology, iron-phenolic chemistry
- ✓ Experimental proposal drafted (6 experiments)
- ☐ Access paywalled papers (see [`experimental_proposal.md`](experimental_proposal.md) §V)
- ☐ Read Van Arsdall chapters 1-4 (analytical chapters)
- ☐ Cross-reference Cockayne's original translation for variant harvest instructions
- ☐ Extend analysis to Bald's Leechbook remedies with temporal instructions
- ☐ Formal thesis outline

Research-in-progress. The site preserves the working state of the research; the checklist will move as the work continues.

## What this run demonstrates about the gallery example pattern

This is the **second research-content website** in the gallery, alongside [`film-course-concepts-website`](../../film-course-concepts-website/). They share a base shape — Next.js, dynamic content engine, markdown rendering — but differ in three important ways:

| | film-course-concepts-website (GENED 1049) | research-white-paper-website (harvest-times) |
|---|---|---|
| Content directory | `_content/<book>/` (under a hidden-prefix folder) | Top-level section folders at the repo root |
| Authoring substance | Course-concept demos + glossary + workshop overview | Primary sources + analysis + drafts + proposal |
| AI provenance | Implicit (AI used in authoring) | Explicit (`agent-output/` as a top-level section) |
| Purpose | Pre-workshop reading for enrolled students | Public research-in-progress for any reader |

The harvest-times site's distinctive moves — section folders at the repo root, the agent-output firebreak — generalize to **any researcher who wants to publish their working state**. See [`../operations/research-site-architecture.md`](../operations/research-site-architecture.md) and [`../operations/agent-output-firebreak.md`](../operations/agent-output-firebreak.md) for the pattern.
