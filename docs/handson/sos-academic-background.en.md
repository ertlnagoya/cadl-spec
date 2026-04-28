---
sidebar_position: 6
sidebar_label: "Academic Background (EN)"
title: "Academic Background (English)"
---

# Academic Background and References for SoS-DSL Hands-on

> 🌐 **日本語版** → [`sos-academic-background.ja.md`](sos-academic-background.ja.md)
>
> ⬅ Back to the main textbook → [`sos-dsl-handson-textbook.en.md`](sos-dsl-handson-textbook.en.md)

This page positions the hands-on materials in the wider academic and standards landscape of System of Systems (SoS) engineering. Use it to:

- Decide whether a candidate domain is *really* an SoS (not just a complex workflow).
- Cite the canonical references when writing reports, theses, or papers.
- Find related work to read after the hands-on.

---

## 1. What is a System of Systems?

A **System of Systems (SoS)** is "an arrangement of systems that results when independent and useful systems are integrated into a larger system that delivers unique capabilities" (US DoD, 2008). The term has appeared in systems engineering literature since the 1960s, but its modern operational definition is anchored in:

- **Maier (1998)** — five characteristics that distinguish an SoS from a monolithic system. Foundational and widely cited.
- **ISO/IEC/IEEE 21839, 21840, 21841 (2019)** — the international standards that codify SoS engineering and taxonomy on top of the systems engineering process standard ISO/IEC/IEEE 15288.

### 1.1 Maier's five criteria

To call something an SoS, at least the first two of the following five must hold:

| # | Criterion | What it means |
| --- | --- | --- |
| 1 | **Operational independence of components** | Each constituent system is useful on its own, even outside the SoS. |
| 2 | **Managerial independence of components** | Each constituent has its own owner / decision-maker. They cooperate but are not commanded. |
| 3 | **Geographic distribution** | Constituents are physically separated and exchange information rather than energy or matter. |
| 4 | **Emergent behaviour** | The SoS as a whole does things that no constituent does individually. |
| 5 | **Evolutionary development** | The SoS is never "finished"; constituents are added, removed, and modified over its life. |

> 💡 **Litmus test for the hands-on examples**:
> - The robot delivery in the main hands-on satisfies (1) at the robot level, (3), (4), and partially (5). Managerial independence is borderline because all robots and the dispatcher belong to the same fictional warehouse operator. **It is closer to a parallel control problem than a textbook SoS.**
> - A **coffee shop** does not satisfy (1), (2), or (3) — staff serve only the shop, the owner manages all of them, and they all sit in the same building. Despite the pedagogical convenience, **it is not an SoS**.
> - A **food-delivery platform** (UberEats / Wolt / 出前館) clearly satisfies (1)–(5): restaurants are independent businesses, drivers are gig workers, the platform does not own them, they are spread across a city, the aggregate behaviour ("30-min average delivery") is not designed into any single party, and the population of restaurants/drivers churns daily.

### 1.2 Maier's four taxonomy types

Maier also distinguishes four kinds of SoS by the strength of their central authority:

| Type | Central authority | Example | Where Part 2 candidates fit |
| --- | --- | --- | --- |
| **Directed** | Strong, top-down. SoS is built and managed for a specific purpose. | Air-defence network | (rare in everyday life) |
| **Acknowledged** | Recognised SoS authority but constituent systems retain ownership. | NASA mission with multiple ESA / JAXA / ROSCOSMOS components, **today's robot delivery example** | Robot delivery main hands-on |
| **Collaborative** | No single authority; constituents voluntarily cooperate via standards / protocols. | The Internet, **food-delivery platforms** | Part 2 — Food delivery |
| **Virtual** | No central management and no agreed common purpose; coordination emerges. | The World Wide Web, **emergency response across separately-funded agencies** | Part 2 — Emergency response |

ISO/IEC/IEEE 21841 standardises this taxonomy (with minor wording differences: "Recognised" instead of "Acknowledged" in some translations).

---

## 2. The ISO standards landscape

CADL and the SoS-DSL extension are best understood as tools that *operationalise* the SoS engineering processes prescribed by the ISO standards. The standards themselves do not prescribe a notation; CADL fills that gap.

### 2.1 The 15288 family — parent standard

**ISO/IEC/IEEE 15288:2023 — Systems and software engineering — System life cycle processes** is the umbrella standard that defines the technical, agreement, organizational, and project processes for any system. Almost every other standard discussed below builds on it.

### 2.2 The SoS triad — ISO/IEC/IEEE 21839 / 21840 / 21841

| Standard | Year | Title (abbreviated) | Audience | Relation to CADL |
| --- | --- | --- | --- | --- |
| **ISO/IEC/IEEE 21839** | 2019 | SoS considerations in life cycle stages of *a system* | Engineer of a constituent system | The pilot you write in C# (and even `Pilot_CSoS.cs`) is the constituent. 21839 says "remember you are part of an SoS — observe, advertise, comply." Our **monitors** answer "observe", and the **lifecycle** answers "comply." |
| **ISO/IEC/IEEE 21840** | 2019 | Guidelines for using *15288* in *SoS context* | Engineer of the SoS itself | The CADL spec writer is this engineer. 21840 maps each 15288 process (e.g., requirements, validation, transition) onto the SoS scale. The SoS-DSL `lifecycle:` block maps to 21840's notion of an *agreement-driven SoS process*. |
| **ISO/IEC/IEEE 21841** | 2019 | Taxonomy of System of Systems | Anyone classifying SoS | Defines the four types listed above. We use it to label our examples (Acknowledged for robot delivery, Collaborative for food delivery). |

### 2.3 Adjacent standards worth knowing

| Standard | Why it matters here |
| --- | --- |
| **ISO/IEC/IEEE 12207:2017** | Software life cycle processes; the software-engineering counterpart to 15288. CADL itself is a software product, governed by 12207. |
| **ISO/IEC/IEEE 42010:2022** | Systems and software engineering — Architecture description. Defines what an Architecture Description (AD) is, its viewpoints and views. **CADL is an AD language in the sense of 42010.** |
| **INCOSE Handbook (4th ed., 2015)** | The de-facto practitioner reference for ISO 15288. Has a chapter on SoS that pre-dates 21839/21840/21841 but uses the same vocabulary. |
| **DoD SE Guide for SoS (2008)** | Open US Department of Defense document. Pre-dates the ISO standards but introduced the now-standard "SoS pain points" language refined by Dahmann (2014). |

### 2.4 How to cite the standards

The standards themselves are paywalled. For an academic paper:

```
ISO/IEC/IEEE 21839:2019. Systems and software engineering — System of Systems (SoS) considerations in life cycle stages of a system. International Organization for Standardization, Geneva.

ISO/IEC/IEEE 21840:2019. Systems and software engineering — Guidelines for the utilization of ISO/IEC/IEEE 15288 in the context of System of Systems (SoS). International Organization for Standardization, Geneva.

ISO/IEC/IEEE 21841:2019. Systems and software engineering — Taxonomy of Systems of Systems. International Organization for Standardization, Geneva.

ISO/IEC/IEEE 15288:2023. Systems and software engineering — System life cycle processes. International Organization for Standardization, Geneva.
```

Open-access summaries: search "ISO/IEC/IEEE 21839 SoS" on arXiv or institutional repositories — most authors who cite the standards quote the relevant clauses verbatim in their papers.

---

## 3. Where CADL and SoS-DSL sit in the research landscape

CADL is at the intersection of three established research traditions. Understanding which tradition each of CADL's features comes from helps you find related work.

### 3.1 Architecture Description Languages (ADLs)

**Background**: Medvidovic & Taylor (2000) classify ADLs along structural primitives (component, connector), modelling capabilities (concurrency, dynamism), and analytical capabilities (analyses supported). Classic examples: ACME, AADL, Wright, Rapide.

**CADL's position**: CADL is an ADL in the 42010 sense. Its `actors:` block is the component primitive; `protocols:` is the connector + behaviour primitive; `transitions:` is the dynamism primitive. The **SoS-DSL extension adds normative primitives** (`lifecycle:` per-instance, `monitors:` declarative observers) that classical ADLs lack.

### 3.2 Normative Multi-Agent Systems

**Background**: Boella, van der Torre, Verhagen (2006) define a Normative MAS as a system in which agents are governed by *norms* (obligations, permissions, prohibitions) that are first-class entities. Roots in deontic logic going back to von Wright (1951).

**CADL's position**: The `obligations:` / `permissions:` / `prohibitions:` clauses in CADL's existing `contracts:` section already follow this tradition. The SoS-DSL extension adds **per-instance lifecycle** and **declarative monitors**, both of which sharpen the operationalisation of norms.

### 3.3 Runtime Verification

**Background**: Bartocci et al. (2018) — runtime verification observes a running system against a formal specification and reports violations. Tools include MOP, RV-Monitor, Larva. Specifications are often expressed as temporal logic or state machines.

**CADL's position**: SoS-DSL `monitors:` are runtime-verification specifications restricted to a small predicate language. The Python and Unity-C# runtimes act as the *monitor* component. The lifecycle's `deadline` + `on_violation` is closer to MaC ("Monitoring and Checking") frameworks than to pure temporal logic.

### 3.4 Smart contracts and blockchain DSLs

**Background**: Ethereum's Solidity (Buterin et al., 2014) showed that contractual norms can be executable code. Atzei et al. (2017) catalogue what goes wrong when the contract code disagrees with the contract intent.

**CADL's position**: SoS-DSL is **Solidity-shaped at the spec level but not blockchain-bound**. Generators can target Solidity (already an existing CADL target), Unity-C# (new in this hands-on), or pure Python — same spec, different deployment target.

---

## 4. Familiar yet SoS-characteristic domains for Part 2

When picking a domain for Part 2, both criteria matter:

- **Familiar** — the student should recognise the actors and what they want.
- **SoS-characteristic** — Maier (1)+(2) at minimum, ideally (3) and (5) too.

The table below scores 6 candidate domains on both axes.

| Domain | (1) Op. indep. | (2) Mgr. indep. | (3) Geo. distrib. | (4) Emergent | (5) Evolutionary | Familiar to students | ISO 21841 type |
| --- | :---: | :---: | :---: | :---: | :---: | :---: | --- |
| **Coffee shop** | ✗ | ✗ | ✗ | ~ | ~ | ★★★ | (not SoS) |
| **Multi-elevator dispatch** | ~ | ✗ | ✗ | ~ | ~ | ★★ | (not SoS) |
| **Course-assignment workflow** | ✗ | ✗ | ✗ | ✗ | ✗ | ★★★ | (not SoS) |
| **🥡 Food delivery (UberEats / Wolt / 出前館)** | ✓ | ✓ | ✓ | ✓ | ✓ | ★★★ | **Collaborative** |
| **🚨 Emergency response (119 / 110 + ER)** | ✓ | ✓ | ✓ | ✓ | ~ | ★★ | **Virtual** (or Acknowledged when commanded) |
| **🛒 Online shopping fulfillment (Amazon / Rakuten + Yamato / 佐川)** | ✓ | ✓ | ✓ | ✓ | ✓ | ★★★ | **Collaborative** |

> The first three rows are kept for honesty — they are educationally useful but *not* SoS in the textbook sense.

### Recommended primary domain: **Food delivery (Collaborative SoS)**

Why this is the pedagogically strongest pick:

1. **Daily familiarity** — almost every student in 2025+ orders food delivery at least monthly.
2. **Clear constituent independence** — restaurants are independent businesses with their own pricing and hours; drivers are gig workers who choose when to work; the platform owns neither restaurants nor vehicles.
3. **Direct contrast with the main hands-on** — the structural lifecycle (`Placed → Accepted → InPreparation → InTransit → Delivered`) is *almost identical* to the robot delivery's, but the SoS *type* is different (Collaborative vs Acknowledged). Students see how the same lifecycle reads differently across SoS types.
4. **Natural normative content** — temperature monitor (food cooling), driver-battery monitor (e-bikes), restaurant-load monitor, deadline contracts (30-minute promise). Maps cleanly onto SoS-DSL `monitors:` and `lifecycle:`.
5. **SimPy fit** — Poisson-process arrivals, exponential service times, multi-server queues. Standard simulation textbook material.

### Recommended secondary domain: **Emergency response (Virtual SoS)**

Why include this as a stretch option for advanced students:

1. **Canonical SoS textbook example** — Maier (1998), DoD (2008), Dahmann (2014) all use it.
2. **Multi-agency coordination** — Fire department, ambulance service, ER, police are *managerially independent* in a way food-delivery platforms are not (they have *zero* shared management; food delivery has the platform as a coordinator).
3. **Tight, life-critical deadlines** — 8-minute ambulance response is a real Japanese MHLW indicator, making the violation severity meaningful.
4. **Less daily familiarity, more cultural awareness** — students know 119 / 110 from drills and news. They have not made calls.

### Why not the others?

- **Coffee shop / multi-elevator / course assignment** — fail the SoS test (single-organisation workflows).
- **Online shopping fulfillment** — would also work but has a longer time scale (days, not minutes), which makes simulation slower to iterate on.
- **Multi-modal commute** — works as a Virtual SoS but the journey-completion contract is harder to make *normative* (compared to a delivery-time SLA).

---

## 5. Annotated bibliography

A curated selection. Numbers are cross-referenced from the rest of this page.

### A. Foundational SoS papers

- **[Maier 1998]** Maier, M.W. (1998). *Architecting Principles for Systems-of-Systems*. Systems Engineering, 1(4), 267–284. — The 5 criteria + 4 types. Required reading.
- **[Sage & Cuppan 2001]** Sage, A.P., Cuppan, C.D. (2001). *On the Systems Engineering and Management of Systems of Systems and Federations of Systems*. Information, Knowledge, Systems Management, 2(4), 325–345.
- **[Boardman & Sauser 2006]** Boardman, J., Sauser, B. (2006). *System of Systems — the meaning of "of"*. IEEE/SMC International Conference on System of Systems Engineering. — Introduces the ABCDE framework (Autonomy, Belonging, Connectivity, Diversity, Emergence) as an alternative to Maier's criteria.
- **[Dahmann 2014]** Dahmann, J.S. (2014). *Systems of Systems Pain Points*. INCOSE International Symposium. — The 7 SoS pain points: SoS authorities, leadership, constituent systems' perspectives, capabilities and requirements, autonomy, interdependencies and emergence, testing/validation/learning. The SoS-DSL `monitors:` block addresses pain point #6 (interdependencies & emergence).
- **[Madni & Sievers 2014]** Madni, A.M., Sievers, M. (2014). *System of Systems Integration: Key Considerations and Challenges*. Systems Engineering, 17(3), 330–347.

### B. ISO standards (re-listed for citation convenience)

- **[ISO 21839]** ISO/IEC/IEEE 21839:2019. *Systems and software engineering — System of Systems (SoS) considerations in life cycle stages of a system*.
- **[ISO 21840]** ISO/IEC/IEEE 21840:2019. *Systems and software engineering — Guidelines for the utilization of ISO/IEC/IEEE 15288 in the context of System of Systems (SoS)*.
- **[ISO 21841]** ISO/IEC/IEEE 21841:2019. *Systems and software engineering — Taxonomy of Systems of Systems*.
- **[ISO 15288]** ISO/IEC/IEEE 15288:2023. *Systems and software engineering — System life cycle processes*.
- **[ISO 42010]** ISO/IEC/IEEE 42010:2022. *Systems and software engineering — Architecture description*.

### C. Architecture Description Languages

- **[Medvidovic & Taylor 2000]** Medvidovic, N., Taylor, R.N. (2000). *A Classification and Comparison Framework for Software Architecture Description Languages*. IEEE Trans. Software Engineering, 26(1), 70–93. — Use this when positioning CADL among ADLs.
- **[Garlan & Schmerl 2009]** Garlan, D., Schmerl, B. (2009). *Architecture-Driven Modelling and Analysis*. SCS '09. — Connects ADLs to runtime adaptation.

### D. Normative Multi-Agent Systems

- **[Boella et al. 2006]** Boella, G., van der Torre, L., Verhagen, H. (2006). *Introduction to Normative Multiagent Systems*. Computational and Mathematical Organization Theory, 12(2–3), 71–79. — The textbook definition.
- **[Andrighetto et al. 2013]** Andrighetto, G., Governatori, G., Noriega, P., van der Torre, L. (Eds.) (2013). *Normative Multi-Agent Systems*. Dagstuhl Follow-Ups Vol. 4. — Comprehensive volume; chapters on operationalising norms map directly to our `lifecycle:` and `monitors:`.
- **[Boella & van der Torre 2008]** Boella, G., van der Torre, L. (2008). *Substantive and procedural norms in normative multiagent systems*. Journal of Applied Logic, 6(2), 152–171.

### E. Runtime Verification

- **[Bartocci et al. 2018]** Bartocci, E., Falcone, Y., Francalanza, A., Reger, G. (2018). *Introduction to Runtime Verification*. In: Lectures on Runtime Verification, LNCS 10457, 1–33.
- **[Havelund & Goldberg 2008]** Havelund, K., Goldberg, A. (2008). *Verify Your Runs*. VSTTE '08. — Practitioner-oriented intro.

### F. Smart contracts as a comparison

- **[Atzei et al. 2017]** Atzei, N., Bartoletti, M., Cimoli, T. (2017). *A Survey of Attacks on Ethereum Smart Contracts (SoK)*. POST 2017. — Why "the spec is the code" is a dangerous oversimplification. Background reading for students who wonder why CADL stays at the spec level and emits code, rather than executing on-chain directly.

### G. Domain-specific simulation references for Part 2

- **[Allen 2014]** Allen, T. (2014). *Probability, Statistics, and Queueing Theory: With Computer Science Applications*. — For setting up arrival-rate / service-time distributions in SimPy.
- **[Banks et al. 2014]** Banks, J., Carson, J.S., Nelson, B.L., Nicol, D.M. (2014). *Discrete-Event System Simulation* (5th ed.). — Standard textbook for the simulation methodology.
- **[Matloff 2008]** Matloff, N. (2008). *Introduction to Discrete-Event Simulation and the SimPy Language*. — Free, web-available primer specifically for SimPy.

### H. SoS-specific simulation case studies

- **[Sahin et al. 2017]** Sahin, F., Sridhar, P., Horan, B., Raghavan, V., Jamshidi, M. (2007). *System of Systems Approach to Threat Detection and Integration of Heterogeneous Independently Operable Systems*. SoSE 2007. — Emergency response SoS, with formal architecture.
- **[Acheson et al. 2013]** Acheson, P., Dagli, C.H., Kilicay-Ergin, N. (2013). *Model based systems engineering for system of systems using agent-based modeling*. Procedia Computer Science, 16, 11–19.

---

## 6. How to use this page

- **As a student**: skim §1 + §4 before Part 2; come back to §3 + §5 when writing your reflection report.
- **As a reviewer**: §2 is a quick map to the standards if you need to challenge whether a paper is "really" doing SoS engineering.
- **As a researcher**: §3 + §5 are starting points for a literature search; §5G–H are the simulation-methodology spine of any SoS validation paper.

---

## Quick navigation

- Main hands-on textbook → [`sos-dsl-handson-textbook.en.md`](sos-dsl-handson-textbook.en.md)
- Exercises booklet → [`sos-dsl-exercises.en.md`](sos-dsl-exercises.en.md)
- 日本語版 → [`sos-academic-background.ja.md`](sos-academic-background.ja.md)
