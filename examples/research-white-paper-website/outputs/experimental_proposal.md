# Experimental Proposal: Testing Anglo-Saxon Harvest-Time Instructions Against Phytochemical Analysis

## Working Title

**"Algorithmic Rituals and Balsamic Time: Testing Whether Anglo-Saxon Harvest-Time Instructions Optimize Bioactive Compound Concentration in Medicinal Plants"**

---

## I. THE GAP

No existing study has tested whether harvest-time instructions prescribed in medieval medical texts yield higher concentrations of therapeutically relevant bioactive compounds compared to control harvest times.

- **Ancientbiotics (Nottingham)**: Tested recipe *composition* and *preparation*, not harvest timing. ([Harrison et al. 2015, mBio](https://pmc.ncbi.nlm.nih.gov/articles/PMC4542191/))
- **Watkins et al. (2012)**: Tested *plant species choice* for antimicrobial activity, not when plants were gathered. ([J Ethnopharmacol 144(2):408-415](https://pubmed.ncbi.nlm.nih.gov/23026307/))
- **Brennessel, Drout & Gravel (2005)**: Tested the compounded recipe, not temporal variables. ([ASE 34:183-195](https://www.cambridge.org/core/journals/anglo-saxon-england/article/abs/reassessment-of-the-efficacy-of-anglosaxon-medicine/))
- **Chronopharmacognosy literature** (Liebelt et al. 2019; Hazrati et al. 2024): Establishes that harvest timing dramatically affects bioactive compound content, but has never been applied to historical prescriptions as a validation exercise.

The closest precedent is **Vogt et al. (2002)**, who validated an indigenous community's lunar-phase harvest practices for structural plant chemistry in tropical forests — but that study measured durability compounds, not medicinal bioactives. ([Ambio 31(6):485-490](https://pubmed.ncbi.nlm.nih.gov/12436848/))

---

## II. HYPOTHESIS

**H1**: Harvest-time instructions in the Old English Herbarium (10th century) correlate with periods of peak bioactive compound concentration in the prescribed plants, as measured by modern phytochemical analysis.

**H0**: There is no significant difference in bioactive compound concentration between plant material harvested at the manuscript-prescribed time and plant material harvested at a non-prescribed control time.

---

## III. EXPERIMENTAL DESIGN

### A. Overview

A controlled comparative harvest study: for each candidate plant, harvest at the **manuscript-prescribed time** and at a **non-prescribed control time**, then measure concentration of the therapeutically relevant bioactive compound(s) using HPLC, GC-MS, or spectrophotometric assays.

### B. Candidate Experiments (ranked by feasibility and impact)

---

#### EXPERIMENT 1: Chamomile — "Before Sunrise" vs. Control Harvest

**Manuscript instruction (OEH 24:1):** "pick the plant... before sunrise"
**Stated use:** Eye pain and white specks in the eye
**Target compound:** Alpha-bisabolol oxide-A (anti-inflammatory sesquiterpene)
**Preliminary evidence:** One study found α-bisabolol oxide-A peaks at 6 AM despite lower total essential oil yield (which peaks at noon). [Source](https://updatepublishing.com/journal/index.php/josac/article/view/6452)

**Design:**
- **Plant source:** *Chamaemelum nobile* or *Matricaria chamomilla*, grown under controlled conditions or wild-harvested from a single population
- **Treatment groups:**
  - T1: Harvested **before sunrise** (manuscript-prescribed)
  - T2: Harvested at **solar noon** (control — maximum total oil yield)
  - T3: Harvested at **6 PM** (control — end of day)
- **Replicates:** Minimum 5 biological replicates per time point, across 3 harvest dates (15 samples per treatment)
- **Analysis:** Steam distillation or hydrodistillation → GC-MS for essential oil composition. Quantify: total oil yield (%), α-bisabolol oxide-A (%), α-bisabolol oxide-B (%), chamazulene (%), (E)-β-farnesene (%)
- **Statistical test:** One-way ANOVA with Tukey HSD post-hoc; or Kruskal-Wallis if non-normal distribution

**Why this experiment matters:** If α-bisabolol oxide-A is significantly higher in the pre-sunrise harvest, it demonstrates that the Anglo-Saxon instruction optimizes for the *specific compound relevant to the stated medical use* (eye inflammation), even though total oil yield is not maximized. This would be a genuinely novel finding connecting historical pharmacology to modern phytochemistry.

**Feasibility:** HIGH. Chamomile is widely cultivated, GC-MS is standard, and the diurnal comparison can be done within a single growing season.

---

#### EXPERIMENT 2: Betony — August Harvest vs. Other Months + Iron Avoidance

**Manuscript instruction (OEH 1:1):** "gather it in the month of August without using a tool made of iron... dry it very thoroughly in the shade"
**Stated use:** Multiple (antimicrobial, wound healing)
**Target compounds:** Rosmarinic acid, caffeic acid, chlorogenic acid, total phenolics, essential oil

**Design (two sub-experiments):**

**2A. Seasonal comparison:**
- **Treatment groups:**
  - T1: Harvested in **August** (manuscript-prescribed, during flowering)
  - T2: Harvested in **June** (pre-flowering)
  - T3: Harvested in **October** (post-flowering, seed-setting)
- **Analysis:** HPLC for phenolic acid profile; Folin-Ciocalteu for total phenolics; GC-MS for essential oil

**2B. Iron avoidance:**
- **Treatment groups:**
  - T1: Harvested with **ceramic/wooden tools** (manuscript-prescribed)
  - T2: Harvested with **iron/steel blade** (modern standard)
  - T3: Harvested with **stainless steel blade** (modern standard, lower oxidation)
- **Post-harvest:** Divide each harvest into two sub-groups: shade-dried vs. sun-dried
- **Analysis:** HPLC for phenolic acids at 0, 24, 48, 72 hours post-harvest; measure degradation curve

**Why this experiment matters:** Tests three instructions simultaneously (August, no iron, shade). The iron experiment is particularly novel — no published study has measured whether iron tool contact accelerates phenolic oxidation in fresh-harvested Lamiaceae tissue.

**Feasibility:** HIGH for 2A (seasonal); MODERATE for 2B (requires careful tool-control methodology and time-series sampling).

---

#### EXPERIMENT 3: Vervain — Midsummer's Day vs. Other Harvest Dates

**Manuscript instruction (OEH 4:4):** "gather the same plant on Midsummer's Day"
**Stated use:** Liver pain
**Target compounds:** Verbenalin, hastatoside (iridoid glycosides, hepatoprotective); verbascoside (phenylpropanoid glycoside)

**Design:**
- **Treatment groups:**
  - T1: Harvested at **Midsummer** (June 21-24, manuscript-prescribed)
  - T2: Harvested **4 weeks before Midsummer** (late May, pre-flowering)
  - T3: Harvested **4 weeks after Midsummer** (late July, post-peak flowering)
  - T4: Harvested in **September** (late season)
- **Analysis:** HPLC for iridoid glycoside content (verbenalin, hastatoside); LC-MS for verbascoside

**Why this experiment matters:** Vervain is explicitly recommended for liver pain in the Herbarium, and its hepatoprotective compounds (iridoid glycosides) are well-characterized. Modern herbalists already say to harvest "in mid-summer when flowering peaks for optimal iridoid content" — this experiment would formally test whether the Anglo-Saxon instruction coincides with the phytochemical optimum.

**Feasibility:** HIGH. Verbena officinalis is common in England; HPLC analysis for iridoids is well-established.

---

#### EXPERIMENT 4: Navelwort — Winter vs. Summer Harvest

**Manuscript instruction (OEH 44:1):** "You should pick the plant in wintertime."
**Stated use:** Swellings (anti-inflammatory)
**Target compounds:** Total phenolics, flavonoids, rosmarinic acid, quercetin-3-O-rutinoside

**Design:**
- **Treatment groups:**
  - T1: Harvested in **January-February** (manuscript-prescribed, winter active growth)
  - T2: Harvested in **June-July** (summer dormancy)
  - T3: Harvested in **April** (spring transition)
- **Analysis:** Folin-Ciocalteu for total phenolics; HPLC for individual flavonoids; in vitro anti-inflammatory assay (COX-2 inhibition or carrageenan model)

**Why this experiment matters:** This is the most counterintuitive prescription — most herbs are harvested in summer. The fact that navelwort is a CAM succulent with winter active growth makes the prescription pharmacologically logical, but this has never been experimentally tested.

**Feasibility:** HIGH. Umbilicus rupestris is common on stone walls in western Britain; two-season comparison is straightforward.

---

#### EXPERIMENT 5: Greater Periwinkle — Lunar Phase Harvest

**Manuscript instruction (OEH 179):** "pick it when the moon is 9 nights old, and 11 nights, 13 nights, 30 nights, and when it is 1 night old"
**Stated use:** Neuroprotective (demons, terror, envy — likely neurological/psychiatric conditions)
**Target compounds:** Vincamine, reserpine, alkaloid profile

**Design:**
- **Treatment groups:** Harvest *V. major* leaves at 6 lunar phase points across 2-3 complete lunar cycles:
  - T1: Night 1 (day after new moon, manuscript-prescribed)
  - T2: Night 9 (waxing crescent, manuscript-prescribed)
  - T3: Night 13 (near full moon, manuscript-prescribed)
  - T4: Night 15 (full moon, NOT prescribed)
  - T5: Night 22 (waning, NOT prescribed)
  - T6: Night 30 (new moon, manuscript-prescribed)
- **Replicates:** 5 biological replicates per time point, across 2-3 lunar cycles
- **Analysis:** LC-MS or HPLC for total alkaloid content and vincamine specifically
- **Control variable:** All harvests at the same time of day (e.g., 9 AM) to isolate lunar phase from diurnal variation

**Why this experiment matters:** 
1. No published study has measured alkaloid content in any Vinca species across lunar phases
2. Vindoline/vincamine biosynthesis is **specifically light-regulated via phytochrome** (St-Pierre et al. 1998; Liu et al. 2019) — the mechanism by which moonlight could affect alkaloid production exists
3. Recent research (Breitler et al. 2020; Priyanka et al. 2025) demonstrates plants perceive and respond metabolically to moonlight
4. The Herbarium's lunar schedule is the most granular temporal instruction in the entire corpus — testing it would be genuinely novel

**Feasibility:** MODERATE. Requires: (a) access to a stable *V. major* population, (b) LC-MS capability, (c) discipline to harvest at specific lunar phases across multiple cycles. The experiment would take 3-4 months minimum. The statistical challenge is real — with only 2-3 cycles per season, detecting small effects will require careful power analysis.

**Risk:** The effect may not exist. The honest framing is: "We test whether the most granular temporal prescription in the Anglo-Saxon corpus has a measurable phytochemical correlate, knowing that the mechanism is plausible but the effect is unproven."

---

#### EXPERIMENT 6: Bistort — April Root vs. Other Seasons

**Manuscript instruction (OEH 6):** "You must gather the plant in the month of April."
**Stated use:** Snakebite (wound treatment)
**Target compounds:** Total tannins (15-36% in roots), gallic acid, chlorogenic acid

**Design:**
- **Treatment groups:**
  - T1: Roots harvested in **April** (manuscript-prescribed, early spring)
  - T2: Roots harvested in **July** (mid-season)
  - T3: Roots harvested in **October** (autumn, traditional root-harvest season)
- **Analysis:** Folin-Denis for total tannins; HPLC for individual tannin compounds; disc-diffusion antimicrobial assay against *S. aureus*

**Why this experiment matters:** Tests whether the April instruction captures stored root tannins before they are mobilized for spring growth. Also tests whether the Herbarium's April disagrees with or agrees with the general root-harvest wisdom of "autumn is best."

**Feasibility:** HIGH. Polygonum bistorta is common in northern England; tannin analysis is straightforward.

---

### C. Controls and Methodology Notes

**Across all experiments:**
- Plants should be sourced from a single population or from controlled cultivation to minimize genetic variation
- Environmental variables (temperature, rainfall, soil) should be recorded
- Voucher specimens should be deposited for botanical verification
- All harvests processed identically (same drying method, storage conditions, extraction protocol) except where the variable under test is the processing method (Experiment 2B)
- Where possible, grow plants in England or a comparable latitude to approximate Anglo-Saxon growing conditions

**On the "Anglo-Saxon garden" approach:**
An ideal version of this project would cultivate all candidate plants in a single garden at a monastic-era site in England (e.g., in collaboration with English Heritage or a functioning monastery with medieval herb gardens). This would control for soil, climate, and latitude while evoking the original context. Several such gardens exist:
- Michelham Priory (Sussex) — maintained medieval physic garden
- Beaulieu Abbey (Hampshire) — herb garden
- Battle Abbey (Sussex) — monastic garden

---

## IV. FRAMING AND SIGNIFICANCE

### This project sits at the intersection of three literatures:

1. **Anglo-Saxon medical history** (Cameron, Van Arsdall, Lee, Jolly) — reappraising the rational/magical dichotomy
2. **Chronopharmacognosy** (Liebelt et al. 2019; Hazrati et al. 2024) — the impact of harvest timing on phytochemical composition
3. **Algorithmic ritual theory** (Pasquinelli 2019) — ritual as emergent algorithm encoding empirical knowledge

### The theoretical contribution:

Following Pasquinelli, the harvest-time instructions are readable as **algorithms**: step-by-step procedures encoding non-obvious empirical knowledge, emergent from material practice, and transmitted in ritual form. The experimental results would test whether this reading is pharmacologically grounded — whether the "algorithmic ritual" of harvest actually produces measurably different (and therapeutically superior) plant material.

### The historiographical contribution:

If the experiments confirm alignment, the thesis disrupts Cameron's rational/magical dichotomy at its foundation. The "magical" elements of Anglo-Saxon medicine — lunar timing, pre-dawn harvest, iron avoidance — are shown to encode empirical pharmacological knowledge in ritual form. The dichotomy dissolves: what looks "magical" from a post-Enlightenment perspective is in fact a **different epistemology of empiricism**, one in which observation is transmitted through ritualized procedure rather than through propositional theory.

The peony and madder cases serve as honest controls — not all harvest instructions encode empirical knowledge. Some derive from classical mythology (peony's nighttime luminescence) or ritual convention (madder's purity requirement). The thesis does not claim that every ritualized instruction is empirically grounded; it claims that the *systematic pattern* of alignment across the corpus is too consistent to be coincidental.

### The practical contribution:

If lunar-phase harvest affects Vinca alkaloid content, this would be a genuinely novel finding with implications for pharmaceutical agriculture and the chronopharmacognosy field. It would also validate (for the first time) a specific ethnobotanical lunar prescription against phytochemical analysis.

---

## V. PAPERS NEEDED (Harvard access)

The following papers are behind paywalls and would strengthen the literature review:

1. **Liebelt et al. (2019)**, "Only a matter of time: the impact of daily and seasonal rhythms on phytochemicals." *Phytochemistry Reviews*. [Springer](https://link.springer.com/article/10.1007/s11101-019-09617-z)

2. **Hazrati, Mousavi & Nicola (2024)**, "Harvest time optimization for medicinal and aromatic plant secondary metabolites." *Plant Physiology and Biochemistry* 212:108735. [PubMed](https://pubmed.ncbi.nlm.nih.gov/38781639/)

3. **Vogt et al. (2002)**, "Indigenous knowledge informing management of tropical forests: the link between rhythms in plant secondary chemistry and lunar cycles." *Ambio* 31(6):485-490. [PubMed](https://pubmed.ncbi.nlm.nih.gov/12436848/)

4. **Brennessel, Drout & Gravel (2005)**, "A Re-Assessment of the Efficacy of Anglo-Saxon Medicine." *Anglo-Saxon England* 34:183-195. [Cambridge Core](https://www.cambridge.org/core/journals/anglo-saxon-england/article/abs/reassessment-of-the-efficacy-of-anglosaxon-medicine/)

5. **Priyanka et al. (2025)**, "Short Exposure to Full Moonlight Has a Long-Term Impact on Brassica juncea Cell Activity and Growth." *Plant, Cell & Environment* 48(5):3038-3051. [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC11963477/)

6. **Van Arsdall, *Medieval Herbal Remedies*, 2nd ed. (2023)** — Chapters 1-4 (analytical chapters not in the PDF we have). [Routledge](https://www.routledge.com/Medieval-Herbal-Remedies-The-Old-English-Herbarium-and-Early-Medieval-Medicine/Van-Arsdall/p/book/9780367753771)

7. **D'Aronco (1988)**, "The botanical lexicon of the Old English Herbarium." *Anglo-Saxon England* 17. [Cambridge Core](https://www.cambridge.org/core/journals/anglo-saxon-england/article/abs/botanical-lexicon-of-the-old-english-herbarium/)

---

*Draft proposal, April 2026. For discussion — not yet for submission.*
