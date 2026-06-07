---
sidebar_position: 2
sidebar_label: "Why SoS-DSL?"
title: "Why SoS-DSL? — Background for Learners"
---

# Why SoS-DSL? — Background for Learners

> Read this once before Course A. It establishes the vocabulary the courses will rely on
> (actors / contracts / lifecycle / monitors, the four SoS types).

Goals of this page:

- Develop an everyday-language intuition for what a **System of Systems (SoS)** is.
- Understand why ordinary programming languages (C++, Python, Java, …) struggle to express SoS rules.
- Get a preview of what **CADL/SoS-DSL** adds on top.

The detailed academic material is collected in **Further reading** at the end ─
feel free to skip it on a first pass.

---

## 1. An SoS is "a larger system that emerges when independent systems work together"

A familiar example.

### Example: a food-delivery order, today

| Actor | What they do | Who owns / commands them? |
|---|---|---|
| **Restaurant** | Cooks the meal | Itself. Sets its own hours and prices. |
| **Courier** (gig worker) | Delivers by bike or car | Themselves. Decides their own working hours. |
| **Platform** (the app) | Matches orders to couriers | The app company. But it owns **neither** restaurants nor couriers. |
| **Customer** | Orders, pays | Themselves. |

The system-level behaviour ("food arrives in 30 minutes") is not designed by any single party.
It emerges from independent actors each pursuing their own interests.

That **is** a System of Systems — multiple independent systems, cooperating or competing,
together forming a larger whole.

### Maier's five criteria — the SoS litmus test

Academically, Maier (1998) defines an SoS by five criteria. At minimum (1) and (2) must hold.

| # | Criterion | In the food-delivery example |
|---|---|---|
| 1 | **Operational independence** of components | Restaurants run as restaurants without any delivery app |
| 2 | **Managerial independence** of components | Couriers are gig workers, not employees of the platform |
| 3 | **Geographic distribution** | Restaurants, couriers, customers are physically separate |
| 4 | **Emergent behaviour** | "30-minute delivery" is a system-level property nobody designs explicitly |
| 5 | **Evolutionary development** | Participating restaurants and couriers turn over daily |

> 💡 **Try the test on familiar things**
> - **Coffee shop** → staff work for that one shop, owner manages all of them. **Not an SoS.**
> - **Robot warehouse** (Course A's domain) → robots act individually, but a single owner controls everything.
>   This is more of a concurrency-control problem than a textbook SoS — yet it's perfect as a training problem
>   for "writing contracts that govern behaviour".
> - **A large taxi-dispatch platform** (Course B's domain) → drivers work independently, but the platform sets fares, dispatches rides, and enforces terms. That makes it Acknowledged, not Collaborative.
> - **Food delivery** is structurally similar, but we keep using it as a Collaborative-leaning example to show the contrast: the same real domain can be modelled as a different SoS type depending on whether you treat the platform's authority as central or as an opt-in service. Modelling choices reflect the perspective of the SoS designer.
> - **The opening hours of a major disaster** — when individual evacuation sites have just been improvised, no command structure has formed yet, and each site is acting on its own — that is a clean example of a Virtual SoS.
>   Routine fire / EMS / police coordination, by contrast, already runs on incident-command protocols and mutual-aid agreements, which puts it closer to Collaborative or Acknowledged.

> The SoS type is not fixed in time. A disaster typically *starts* Virtual; once a municipal emergency operations centre stands up, coordination becomes Collaborative; once a legally designated incident commander takes over, it shifts toward Acknowledged. SoS classifications describe a slice in time, not a permanent label.

### Four taxonomic types — by strength of central authority

Even within the umbrella term "SoS", systems differ by how strong the central authority is.

| Type | Central authority | Examples |
|---|---|---|
| **Directed** | Strong, top-down | Air-defense network |
| **Acknowledged** | SoS-level authority recognised, but components keep ownership | International space missions, **Course A's robot delivery**, **Course B's taxi dispatch** |
| **Collaborative** | No single authority; participants cooperate via shared agreements (protocols, conventions) | The Internet, peer-to-peer-leaning food-delivery cooperatives |
| **Virtual** | No central management, no agreed common goal; coordination is emergent | The World Wide Web; the first hours of a major disaster, before any incident command has formed |

> 💡 **Course A and B are both Acknowledged; only the domain changes.**
> Course C asks you to pick your own domain and classify it yourself.

---

## 2. Why ordinary programming languages aren't enough

We've seen that an SoS is "many independent actors". Try writing the rules in plain C++ or Python and these problems appear:

| What you want to say | Plain-language attempt | What's missing |
|---|---|---|
| "Taxi must respond within 5 seconds" | Comments / a Slack agreement | Rules live **outside the code**, so they drift |
| "If 5 seconds passes, count it as a violation" | An `if` statement somewhere | "Which 5 seconds?" — semantics are context-dependent |
| "A courier with battery below 20% mustn't accept new orders" | An `if` in every implementation | Rules **scatter** across hundreds of code sites |
| "Both Unity and SUMO runtimes must enforce the same rules" | Re-implement per language | **Double maintenance**; one inevitably falls behind |

In short: ordinary languages can't naturally express both
"actors are independent" *and* "the whole still has to obey collective rules".

---

## 3. What CADL adds

CADL (Contract Architecture Description Language) is an
architecture-description language designed to record the rules multiple systems must obey,
in a single source file kept separate from any one runtime implementation.

| CADL concept | What it expresses | Example in food delivery |
|---|---|---|
| `actors:` | Participating actors, with autonomy levels | `RESTAURANT[*]`, `COURIER[1..N]`, `PLATFORM` |
| `contracts:` | Inter-actor agreements | `DELIVERY_SLA` |
| `lifecycle:` | The state machine each contract instance traverses | `Placed → Accepted → InTransit → Delivered` |
| `monitors:` | Periodic observable constraints | Battery / food temperature / delivery delay |

All of this lives in **one YAML file**. From there:

- **Visualisation** (cadl-explorer) — the state machine renders in a browser
- **Code generation** (`cadl codegen`) — Unity C#, SUMO config, Python runtime, ...
- **Compliance check** (analyze_results) — verify that simulation outputs respect the contract

are all **derived from the same CADL source** — the contract becomes the **single source of truth**.

### What is the SoS-DSL extension?

The `lifecycle:` and `monitors:` features live in a CADL extension called **SoS-DSL** (cadl-spec Appendix E).
It's an "extension" because they elevate **norms** (rules to obey) to first-class concepts ─
core CADL alone (actors / contract skeleton) doesn't include them.

When you reach §3 of any course and add `lifecycle:` / `monitors:`,
**you are using SoS-DSL for the first time**.

---

## 4. How to read the rest of the materials

Recommended order:

1. **Course A — Robot Delivery** ─ a minimal example covering actors → contracts → lifecycle → monitors → codegen → execution in 90 minutes.
2. **Course B — Urban Mobility** ─ keep the same CADL syntax, swap domain and runtime.
3. **Course C — Your own SoS** ─ apply the concepts to a domain you choose (food delivery, emergency response, power grid…).

> The material on this page (the five criteria, four types, what CADL adds) is presupposed by every course.
> Come back here whenever you forget what something means.

---

## 5. Further reading (skim or skip)

The remainder is **reference material** for reports, theses, and papers.
You don't need it to learn the courses.

### 5.1 ISO standards landscape

CADL/SoS-DSL is best understood as a notation that gives concrete form to the SoS-engineering
processes the ISO standards prescribe — the standards themselves stop short of specifying any notation.

| Standard | Role | Connection to CADL |
|---|---|---|
| **ISO/IEC/IEEE 15288:2023** | Generic system life-cycle processes | CADL itself is developed in 15288's spirit |
| **ISO/IEC/IEEE 21839:2019** | SoS considerations from a constituent system's perspective | CADL `monitors:` ≈ "observation duty"; `lifecycle:` ≈ "compliance duty" |
| **ISO/IEC/IEEE 21840:2019** | Using 15288 in an SoS context | The work an SoS engineer does when authoring CADL |
| **ISO/IEC/IEEE 21841:2019** | Taxonomy of SoS (the four types) | Source of the four-types table above |
| **ISO/IEC/IEEE 42010:2022** | Architecture description (AD) | **CADL is an AD language in the 42010 sense** |

### 5.2 Three research traditions CADL draws from

- **Architecture Description Languages (ADL)** ─ ACME, AADL, Wright … CADL's `actors:` / `protocols:` inherit from this tradition (Medvidovic & Taylor 2000).
- **Normative Multi-Agent Systems** ─ obligations, permissions, prohibitions as first-class objects (Boella et al. 2006). CADL's `obligations:` clauses fit here.
- **Runtime Verification** ─ observing a running system against a formal specification (Bartocci et al. 2018). CADL's `monitors:` belong here.

### 5.3 Difference from blockchain DSLs

Ethereum's Solidity (Buterin et al. 2014) was an early "contract as code" approach,
but **contract = executable code** ties it to a blockchain runtime.
CADL stays at the **specification level** and generates code per target,
so the same spec drives Unity, SUMO, and Python alike.

### 5.4 Annotated bibliography

#### A. SoS foundations

- **[Maier 1998]** *Architecting Principles for Systems-of-Systems*. Systems Engineering, 1(4), 267–284. — Source of the five criteria and four types. **Required reading.**
- **[Sage & Cuppan 2001]** *On the Systems Engineering and Management of Systems of Systems*.
- **[Boardman & Sauser 2006]** *System of Systems — the meaning of "of"*. — Alternative ABCDE framework.
- **[Dahmann 2014]** *Systems of Systems Pain Points*. — Seven SoS pain points.
- **[Madni & Sievers 2014]** *System of Systems Integration: Key Considerations and Challenges*.

#### B. ISO standards

- **[ISO 21839]** ISO/IEC/IEEE 21839:2019.
- **[ISO 21840]** ISO/IEC/IEEE 21840:2019.
- **[ISO 21841]** ISO/IEC/IEEE 21841:2019.
- **[ISO 15288]** ISO/IEC/IEEE 15288:2023.
- **[ISO 42010]** ISO/IEC/IEEE 42010:2022.

#### C. Architecture description languages

- **[Medvidovic & Taylor 2000]** *A Classification and Comparison Framework for Software Architecture Description Languages*.
- **[Garlan & Schmerl 2009]** *Architecture-Driven Modelling and Analysis*.

#### D. Normative multi-agent systems

- **[Boella et al. 2006]** *Introduction to Normative Multiagent Systems*.
- **[Andrighetto et al. 2013]** *Normative Multi-Agent Systems*. Dagstuhl Follow-Ups Vol. 4.
- **[Boella & van der Torre 2008]** *Substantive and procedural norms in normative multiagent systems*.

#### E. Runtime verification

- **[Bartocci et al. 2018]** *Introduction to Runtime Verification*.
- **[Havelund & Goldberg 2008]** *Verify Your Runs*. VSTTE '08.

#### F. Blockchain DSLs (for contrast)

- **[Atzei et al. 2017]** *A Survey of Attacks on Ethereum Smart Contracts (SoK)*. — Why "spec = code" is a dangerous oversimplification.

#### G. Simulation methodology (used in Course B / C)

- **[Banks et al. 2014]** *Discrete-Event System Simulation* (5th ed.).
- **[Matloff 2008]** *Introduction to Discrete-Event Simulation and the SimPy Language*. — Free, web-published SimPy intro.

#### H. SoS-specific simulation examples

- **[Sahin et al. 2007]** *System of Systems Approach to Threat Detection and Integration of Heterogeneous Independently Operable Systems*. — Formal architecture for an emergency-response SoS.
- **[Acheson et al. 2013]** *Model based systems engineering for system of systems using agent-based modeling*.

---

## What to read next

- Start **Course A** → [Course A — Robot Delivery](main-textbook.md)
- Back to the index → [Hands-on Index](index.md)
