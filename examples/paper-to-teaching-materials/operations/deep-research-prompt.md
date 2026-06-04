# Deep Research Prompt — Contextualizing decision-subject ethics and its AI-era successors

Use this as the prompt for an LLM Deep Research tool (Claude Deep Research, ChatGPT Deep Research, Perplexity Deep Research). The output is a contextualizing essay for workshop participants who have just seen a live demo of LLM-assisted teaching-material generation built around Grant, Behrends & Basl's (2025) paper on decision-subject ethics.

---

## Prompt

Produce a contextualizing essay of **2,500–3,500 words** for an audience of faculty in philosophy, law, public policy, computer-science ethics, science-and-technology studies, and adjacent fields who have just attended a workshop demonstration of LLM-assisted teaching-material generation. The demo was built around **Grant, D. G., Behrends, J., & Basl, J. (2025). "What we owe to decision-subjects: beyond transparency and explanation in automated decision-making." *Philosophical Studies* 182, 55–85.** (Open access, CC BY 4.0.)

The essay should be defensible to a senior philosopher of AI ethics (Jeff Behrends himself is in the audience). Do not oversell LLMs. Frame LLM affordances as augmenting instructor judgment, never as replacing it — and be explicit about the self-referential tension: the workshop is teaching faculty to lean on an AI tool, and the paper is precisely about the *limits* of relying on AI for consequential decisions about people. That tension is the lesson, not a problem to hide. Take seriously the field's concerns about black-box systems, automation bias, and the limits of "human-in-the-loop" as a guarantee of due consideration.

The essay must accomplish three things, in this order.

### Part 1 — The methodological tradition Grant, Behrends & Basl are addressing (~1,000 words)

Trace the intellectual history of ethics for automated decision-making. At minimum, cover:

- **The Explainability Thesis tradition.** The cluster of arguments — Mittelstadt et al. (2016), Wachter et al. (2017), Edwards & Veale (2017), Selbst & Barocas (2018) — defending obligations of transparency, explainability, or interpretability for high-stakes algorithmic systems. Why "you must be able to explain it" became the dominant ethical frame.
- **The GDPR Article 22 / "right to explanation" debate.** Wachter, Mittelstadt & Floridi (2017) on the misnomer; Edwards & Veale on what the regulation actually requires vs. what scholars wish it required; the broader European turn toward algorithmic accountability (AI Act 2024).
- **The interpretable-ML tradition.** Cynthia Rudin's *"Stop Explaining Black Box Machine Learning Models for High Stakes Decisions and Use Interpretable Models Instead"* (2019, *Nature Machine Intelligence*); the contrast between post-hoc explanation methods (LIME, SHAP) and inherently interpretable models (decision lists, generalized additive models); the cottage industry of XAI and its critics.
- **The fairness-in-ML tradition.** Barocas, Hardt & Narayanan's *Fairness and Machine Learning* (2019/2023); the impossibility theorems (Chouldechova 2017; Kleinberg, Mullainathan & Raghavan 2017); ProPublica's COMPAS investigation (Angwin et al. 2016) and the methodological exchange that followed.
- **The autonomy-and-respect tradition.** Kantian and post-Kantian arguments about treating persons as ends — Korsgaard, O'Neill, Velleman — and how these have entered AI ethics through the language of "respect for autonomy" and "decisional autonomy."
- **The democratic-legitimacy and accountability tradition.** Citron & Pasquale (2014) on the *Scored Society*; Eubanks (2018) *Automating Inequality*; Benjamin (2019) *Race After Technology*; the critique of algorithmic governance as a question of legitimacy and standing, not just accuracy.
- **The philosophy of expertise and human judgment.** Selinger & Frischmann's *Re-engineering Humanity* (2018); Crawford's *Atlas of AI* (2021); the longer tradition of Sennett, Dreyfus, and Polanyi on tacit knowledge and the limits of formalization.

Make the lineage legible to readers who are not analytic philosophers of AI. Concrete examples of what each tradition *actually argues about* (COMPAS, hiring algorithms, university admissions, healthcare triage) would help. The point is to set up the methodological commitments that the Grant–Behrends–Basl paper is intervening on — not catalog every contribution.

### Part 2 — What Grant, Behrends & Basl propose, and why now (~700 words)

Summarize their core argument with specifics. Cite by section.

- **The diagnosis (§§1–3).** The Explainability Thesis is defended on transparency grounds, but those grounds are *narrower* than the duties decision-subjects are actually owed. The framing problem: most AI-ethics literature collapses *due consideration* into *transparency*, missing what makes algorithmic decision-making wrongful when it is.
- **The Definition Problem (§4).** What "black box" actually means: high flexibility + high dimensionality + limited *rule transparency*. Black-box ≠ "any AI." Not every automated system is the paper's target.
- **The Double Standard Problem (§6).** Why hold machines to a higher bar than human experts? The paper's answer: partly the problems generalize to opaque humans, but **interpretable models are the safer third option**, and humans have *agential capacities* (responsibility, deliberation, moral risk) that black-box systems lack.
- **The Grounding Problem (§§5, 7).** Where the obligation comes from. **Due consideration** decomposes into **duties of consideration**:
  - **Evidential consideration (§5).** Black-box reliance fails three ways: degraded field *accuracy* / overfitting (§5.1, the "Jared" screener); *ignoring readily available evidence* a human wouldn't (§5.2, COMPAS + the excised brain-tumor neurologist); relying on *morally inadmissible evidence* (§5.3, redundantly-encoded race/gender; the Amazon "women's" résumé tool; proxies).
  - **Practical consideration (§7).** Prohibited *decision rules* / the Kantian injunction against treating people as mere things (§7.1); and *agential consideration* (§§7.2–7.3) — some decisions (jury verdicts, lethal force, punishment) must be made by full-blown moral agents who take responsibility. The **Juror Substitution** thought experiment carries this; HITL doesn't escape it if the human merely defers.
- **The careful hedges.** The Explainability Thesis is *not* absolute. The paper says "often," "prima facie," "potentially overridable," "context-sensitive." Never present it as "never use black boxes." Quote the explicit caveats.
- **Interpretable models as the third option (§6).** They are *less* prone to the failures, not immune. The paper is conservative about what interpretability buys you.

### Part 3 — Where LLMs and modern AI systems extend the tradition, and into which adjacent fields (~1,200 words)

The framework Grant, Behrends & Basl propose maps unusually well onto contemporary AI ethics questions, *because the moves they make distinguish exactly the failures large generative models are most prone to.* Walk through the connections, by section:

- **Evidential consideration in the LLM era (§5).** Large language models are paradigm black-box systems in the paper's sense — high flexibility, high dimensionality, low rule transparency. They are also more likely to ignore readily available evidence (the user's contextual cues, the specific case's particulars) and to reproduce morally inadmissible reasoning encoded in their training data. Connect to Bender et al. (2021) on stochastic parrots; to Bommasani et al. (2021) on foundation-model risks; to the empirical work on LLM bias in clinical and legal contexts.
- **Agential consideration and AI-assisted high-stakes decisions (§§7.2–7.3).** The Juror Substitution argument extends naturally to LLM-assisted sentencing recommendations, parole decisions, asylum adjudications, medical triage. The presence of a human reviewer who *merely defers* does not satisfy the agential duty. Connect to the recent legal scholarship on AI in court (Re & Solow-Niederman 2019; Coglianese & Lehr 2017) and to the medical-AI literature on automation bias (Goddard et al. 2012; Lyell & Coiera 2017).
- **Interpretable models as the third option in practice.** Why the §6 move matters now: the field has powerful interpretable alternatives (Rudin's work; the GAM tradition; rule lists; decision trees with reasonable accuracy ceilings for many tabular problems). Connect to the empirical literature on accuracy-interpretability tradeoffs and the cases (recidivism scoring, credit scoring) where the tradeoff is smaller than commonly assumed.
- **Teaching AI ethics in the LLM era.** The Grant–Behrends–Basl paper is unusually well-suited to a graduate seminar precisely because its taxonomy is clean (three Problems, two kinds of consideration, six failure modes). Discuss how teaching philosophy of AI changes when the students arrive having already used the systems being theorized — the paper's framework gives a clean structure for that classroom.

Then extend the argument *beyond philosophy* to adjacent fields that work on or with automated decision-making and would benefit from the same framework. For each field, identify (a) what kind of decision-making is at stake, (b) which Grant-Behrends-Basl move is most relevant, and (c) what the field's existing framework misses that this one supplies.

- **Law and legal scholarship** — administrative law, sentencing, due process; the literature on algorithmic government (Citron, Calo, Pasquale); recent cases on AI in criminal justice. Where the paper's *agential consideration* maps onto the legal concept of standing and the right to a human adjudicator.
- **Public policy and administrative practice** — benefits eligibility, child-welfare risk scoring, fraud detection in tax and unemployment; the Eubanks tradition; where *ignoring readily available evidence* (§5.2) lands in administrative review.
- **Medicine and clinical ethics** — clinical decision support, diagnostic AI, triage; the Topol (2019) literature; informed consent for AI-assisted decisions; where *interpretable third options* (§6) line up with the clinical demand for explicable diagnoses.
- **Education and assessment** — automated grading, admissions screening, plagiarism and AI-use detection; where the paper's *Double Standard Problem* (why hold AI to a higher bar than human graders) and its answer (because the alternatives are not actually symmetric) cleanly applies.
- **Hiring, HR, and the platform economy** — résumé screening, performance management, gig-worker scoring; where the *morally inadmissible evidence* failure (§5.3) has the most legal and ethical traction.
- **Computer science and AI safety** — value alignment, RLHF, constitutional AI; where the Grant-Behrends-Basl framework gives a richer normative vocabulary than the existing literature on "harm reduction" or "alignment."
- **Science and technology studies (STS)** — the longer tradition of Latour, Winner, Suchman; where philosophy-of-AI's analytic precision and STS's ethnographic and political sensibility could productively engage.
- **Democratic theory and political philosophy** — Anderson's *Private Government*, the literature on workplace and bureaucratic legitimacy; where the paper's *agential consideration* connects to questions about who has standing to make consequential decisions about citizens.

Close with a frank statement of what this framework does *not* solve. The paper is conservative — it does not give a complete theory of AI ethics, it does not handle every case, and its hedges are load-bearing. Name two or three open questions a careful reader is left with — for instance, what *agential consideration* requires of an LLM-assisted process where the human is genuinely deliberating but the LLM has framed the choice space.

---

## Voice and form

- Write in academic register. The audience is faculty; do not condescend, and do not adopt a journalistic register.
- Cite by author-year throughout. Where you quote Grant, Behrends & Basl directly, cite by section (e.g. §5.2).
- Do not invent references. If a claim cannot be verified, soften it or remove it.
- No emojis.
- The essay should leave a reader who has *not* attended the workshop able to understand the framework and its place in the tradition. The essay should leave a reader who *has* attended the workshop with a richer sense of why the four skills (`/teaching-case`, `/discussion-plan`, `/objection-audit`, `/quiz`) are structured around the paper's distinctions.

## Hard constraints (these survive any draft)

- **Faithful to the paper.** Do not collapse the three Problems, do not collapse due consideration into transparency, do not present the Explainability Thesis as absolute, do not treat interpretable models as a panacea.
- **Black-box ≠ "any AI."** The paper's target is high-flexibility, high-dimensional, low-rule-transparency systems (§4) — not all automation.
- **Conservative on the LLM uplift claims.** The paper is itself conservative; the essay should mirror that.
- **Cite by section** (§5.2). Page numbers only when verified.
- **Defensible to the paper's authors** — write as if Jeff Behrends, Daniel Grant, and John Basl will read it.
