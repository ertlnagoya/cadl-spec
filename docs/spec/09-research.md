---
sidebar_position: 9
title: "9. Research Directions and Open Challenges"
description: "Research directions and open challenges for CADL: composition algebra, tacit knowledge, institutional digital twins and assurance, scalability, multiple jurisdictions, norms and time, strategic constituents, and governance of AI agents, with a research roadmap."
---

Based on use case analysis in [Chapter 8](./08-use-cases.md) and a survey of existing research,
we organize research directions toward CADL realization and development.
For each direction, we state what the current state of the art already
provides (named tools and results), what remains open for CADL, and the
concrete research challenges that CADL should address. Where an existing
tool already solves part of a problem, we say which part CADL would hand
to that tool and which question the tool cannot answer.

The starting point is this specification (Version 0.3) and the reference
implementation `cadl` 0.3.27. It checks the satisfiability of contracts
with Z3 [[de Moura & Bjørner, 2008]](./appendix-b-references.md), detects
protocol deadlocks by structural analysis, supports the SoS-DSL extension
([Appendix E](./appendix-e-sos-dsl.md): `lifecycle:`, `monitors:`,
`deadline:`), generates Python, Solidity, OPA/Rego, and Unity C# code,
drafts CADL from natural language with `cadl ai` (a parse / type-check /
retry loop, and with `--verify` the checks of `cadl verify`), and reports
a mapping to IEC 62853 ([Chapter 10](./10-roadmap.md)).

Statements below that no work addresses a given problem are based on a
limited literature search (mainly 2023–2026). They mean that we did not
find such work, not that none exists.

## 9.1 Algebraic Composition Theory for Institutions
Establishment of an algebraic foundation for safely composing and
decomposing multiple institutional descriptions is necessary. Benveniste
et al. [[Foundations and Trends in EDA, 2018]](./appendix-b-references.md) theorized parallel
composition of contracts C₁ ⊗ C₂ in component design. Since then the
algebra of assume-guarantee contracts has been largely completed:
hypercontracts give closed forms for composition and quotient (the
specification of a missing component) over hyperproperties
[[Incer+, NFM 2022]](./appendix-b-references.md), and Pacti computes the
algebraic operations of contract theory efficiently
[[Incer+, arXiv 2023]](./appendix-b-references.md). OCRA checks the
refinement of contracts written in LTL, including metric real-time
constraints [[Cimatti+, ASE 2013]](./appendix-b-references.md); Kind 2
checks that the modes of a contract cover its assumptions
[[Champion+, CAV 2016]](./appendix-b-references.md); and contracts have
been composed across agents with quantitative temporal requirements
[[Dewes & Dimitrova, AAAI 2025]](./appendix-b-references.md). SysML v2
[[OMG, 2025]](./appendix-b-references.md) gives requirements an
`assume constraint` and a `require constraint`, and SAWS² connects a
fragment of SysML v2 to OCRA, nuXmv, and xSAP
[[FBK, SAWS²]](./appendix-b-references.md).

What remains open for CADL is the institutional interpretation of these
operators. The parties of a CADL contract are autonomous organisations
whose compliance depends on incentives rather than on the designer's
authority; composition must therefore be indexed by institutional
parameters and its guarantees must hold in equilibrium. Switching between
whole operating modes (regimes), including the transitional phase, must
be safe, and the algebra must stay open to constituents joining and
leaving. For example, when composing household chore-sharing institution
with shared resource usage institution, a theory that algebraically
guarantees absence of obligation conflicts and incentive interference is
required. Mode-aware contracts address components, and the evolution of
SoS configurations has been checked without a contract algebra
[[Etzien+, ISORC 2013]](./appendix-b-references.md). We found no work that
models normative concepts (obligation, permission, sanction) in SysML v2.

The structure of the institutional parameter space (α, β, λ) is a second
open area. Parameter synthesis for parametric Markov chains and MDPs
already partitions a parameter space into regions certified to satisfy or
to violate a property [[Junges+, FMSD 2024]](./appendix-b-references.md);
Storm implements it and can be called from Python
[[Hensel+, STTT 2022]](./appendix-b-references.md), and monotonicity
checking proves, region by region, that a probability increases or
decreases with a parameter [[Spel+, ATVA 2019]](./appendix-b-references.md).
These tools answer whether one design satisfies a threshold on a region.
They do not answer which design is best where, which is the question of a
regime map. The stochastic model extension
([Appendix H](./appendix-h-stochastic.md), `stochastic` 0.1) is a first
step on RD-1.3: it lets a file state a parametric Markov model in which
α, β, and λ appear, defines the regime map as a query whose result is a
set of certified cells, and fixes an export to the PRISM language.
The reference implementation computes certified cells by parameter
lifting ([H.14](./appendix-h-stochastic.md#h14-reference-implementation-status)).
The strategic model extension
([Appendix I](./appendix-i-games.md)) adds the game reading of
Section 9.7 to that model, and the grounding extension
([Appendix J](./appendix-j-grounding.md)) lets a payoff term take the
size of a sanction from a norm and multiply it by λ, a first step on
RD-1.5 in which λ is a parameter of a model, not yet of a composition.
Deriving the model from contracts and scaling beyond small models
remain open.

| **ID** | **Challenge** | **Content** |
| --- | --- | --- |
| RD-1.1 | Institutional Composition Algebra | Build parallel composition and merging on the existing hypercontract results [[Incer+, NFM 2022]](./appendix-b-references.md), and concentrate CADL's own contribution on sequential and choice composition and on the institutional interpretation of the three layers (Institution, Protocol, Algorithm), with soundness proofs. |
| RD-1.2 | Institutional Refinement Relations | Formal proofs that overview level → design level → verification level refinements preserve institutional properties. Use OCRA's temporal refinement [[Cimatti+, ASE 2013]](./appendix-b-references.md) and Pacti's refinement check [[Incer+, arXiv 2023]](./appendix-b-references.md) as the means of checking refinement between description levels. |
| RD-1.3 | Certified Regime Maps<br />by Parameter Synthesis | Translate CADL descriptions into parametric MDPs (PRISM/JANI) in which α, β, and λ appear in transition probabilities and rewards; generate certified regions per regime with Storm [[Hensel+, STTT 2022]](./appendix-b-references.md); prove qualitative design laws (for example, that raising α does not lower the mission success probability in a region) by monotonicity checking [[Spel+, ATVA 2019]](./appendix-b-references.md); and define comparative region verification ("which regime is best where") as a new problem. Exact partitioning is practical only for a few parameters [[Junges+, FMSD 2024]](./appendix-b-references.md), so the scale of this approach is an open question. |
| RD-1.4 | Safety of<br />Regime Transitions | Lift mode exhaustiveness (as checked by Kind 2 [[Champion+, CAV 2016]](./appendix-b-references.md)) and proof obligations before and after a mode transition to switches between centralised and decentralised regimes, with an explicit contract for the transitional phase. [Course D](../handson/robot-town-tutorial.md) of the hands-on materials shows that switching without waiting for the shared road to clear breaks the safety invariant. |
| RD-1.5 | Incentive-parameterised<br />Composition | Treat λ as a parameter of the contracts and compute, through the quotient, the range of λ under which the composition of constituent contracts refines the system contract. Related to the equilibrium analysis of RD-7.2. |
| RD-1.6 | Interoperability<br />with SysML v2 | Map actors to `part def` and contracts to `requirement def` with `assume constraint` and `require constraint` [[OMG, 2025]](./appendix-b-references.md); delegate the algebraic computation to SAWS²/OCRA [[FBK, SAWS²]](./appendix-b-references.md) or Pacti; add normative concepts and regimes as a CADL model library, since SysML v2 does not define them. |

## 9.2 Extraction and Institutionalization of Tacit Knowledge
Establishment of technology to explicitly formalize institutional
knowledge implicitly shared in household rules and community customs as
CADL descriptions is required. IndoorWorld [[Wu+, Findings of EMNLP 2025]](./appendix-b-references.md)
realizes behavior simulation of LLM agents in indoor environments, but the inverse
problem of extracting institutional rules from observed behavior
patterns (institutional reverse engineering) remains unaddressed.
For timed properties, procedures that mine signal temporal logic
specifications from traces have been surveyed
[[Bartocci+, Inf. Comput. 2022]](./appendix-b-references.md).

LLM-based translation into formal specifications is accurate only for
simple targets. A fine-tuned model reached more than 95% accuracy in
translating natural language into temporal logic with abstracted
propositions, while GPT-4 with few-shot prompting reached 77.7%
[[Chen+, EMNLP 2023]](./appendix-b-references.md). For TLA+, the best of
thirty LLMs produced semantically correct specifications in 8.6% of the
cases [[Bisharat+, ICSOFT 2026]](./appendix-b-references.md). The LLM-based
generation of Symboleo [[Zitouni+, 2025]](./appendix-b-references.md)
assessed 38 prompt configurations against 16 error types and found the
results promising but with many remaining errors. `cadl ai` already loops
over parsing, type checking, and retries, and with `--verify` runs the
SMT and deadlock checks; this assures syntactic validity and consistency,
not that the description is faithful to the source text. We found no
benchmark for translating deontic content (obligation, permission,
remedy).

| **ID** | **Challenge** | **Content** |
| --- | --- | --- |
| RD-2.1 | Institutional Inference from<br />Behavioral Observation | Algorithm to infer potential institutional rules (implicit authority structures, information sharing patterns, incentive structures) from IoT sensor data and behavior logs. Includes estimating candidate `deadline` values and `guarantee` thresholds from simulation and monitor logs by specification mining [[Bartocci+, Inf. Comput. 2022]](./appendix-b-references.md). |
| RD-2.2 | LLM-based Institutional<br />Description Generation<br />and Faithfulness Checking | Technology to generate CADL descriptions from natural language interview records and meeting minutes, extending LLM-based Symboleo generation [[Zitouni+, 2025]](./appendix-b-references.md) to general institutional descriptions. Beyond the syntactic checks of `cadl ai`, check faithfulness: compare round-trip translations (NL → CADL → NL), validate the generated contracts against scenario traces in the CADL simulator, and show the reviewer the clauses with low confidence. |
| RD-2.3 | Tacit Knowledge Ontology<br />for Institutions | Build ontology systematically classifying and structuring implicit institutional knowledge. Map Ostrom [[1990]](./appendix-b-references.md) IAD framework [[Ostrom, 2005]](./appendix-b-references.md) to CADL vocabulary. |
| RD-2.4 | NL→CADL Benchmark | A benchmark of natural-language institutional descriptions paired with reference CADL descriptions and scenario traces, including deontic content, to measure the accuracy and faithfulness of RD-2.2 and of other translators [[Bisharat+, ICSOFT 2026]](./appendix-b-references.md). |

## 9.3 Institutional Digital Twins and Assurance
Developing the concept of Digital Twins of Organization [[Lyytinen+, J.
Organization Design, 2024]](./appendix-b-references.md), establishment of technology to build and
simulate institutions themselves as digital twins is the next-generation
research direction. Lyytinen et al. argue that a full twin of an
organization may not be feasible because organizations involve agency,
conflict, and emergence; a reply argues that a twin built for a narrow
purpose from digital trace data is feasible
[[Winkler & Kremser, J. Organization Design, 2024]](./appendix-b-references.md).
A CADL description can serve as the normative layer of such a narrow
twin: it mirrors the agreed rules, not the whole organization.
vCity [[BSC]](./appendix-b-references.md) and Social Digital Twin
[[Fujitsu]](./appendix-b-references.md) advance twinning of physical and social
aspects, but twinning of institutions (governance structures, rules,
incentives) is, to our knowledge, not their main target.

Dynamic assurance cases connect a model to runtime evidence. Starting
from dynamic safety cases [[Denney+, ICSE 2015]](./appendix-b-references.md),
ACCESS evaluates an assurance case both at design time and at runtime,
where the validity of the case depends on runtime data checked by a
monitor [[Wei+, JSS 2024]](./appendix-b-references.md), and Trusta checks
LLM-drafted assurance cases against formal constraints
[[Chen+, SCP 2025]](./appendix-b-references.md). The notations are GSN
Community Standard Version 3 [[SCSC-141C, 2021]](./appendix-b-references.md)
and OMG SACM 2.3 [[OMG SACM, 2023]](./appendix-b-references.md). The
divergence between a model and the running system is studied as
`models@run.time` [[Bencomo+, SoSyM 2019]](./appendix-b-references.md).

Three problems remain open for CADL. First, the dynamic assurance cases
we found assure a single technical system; we found none whose claims are
the obligations, permissions, and amendment procedures of several
organizations and whose evidence comes from monitors owned by different
parties. Second, research on twin synchronization assumes that reality
corrects the model. For an institution the model is normative: a
divergence is either a violation by a participant (evidence against an
assurance claim) or a drift in which the rules actually in force changed
without an amendment of the CADL description (the twin is stale), and
observation alone does not tell them apart. Updating the model
automatically to fit observed practice would ratify violations. Third,
statistical evaluation of institutions on a simulator needs confidence
bounds, and experiments on institutions change the behaviour of the
people who take part in them.

| **ID** | **Challenge** | **Content** |
| --- | --- | --- |
| RD-3.1 | Institutional Simulator | Technology to automatically generate institutional simulation models from CADL descriptions and what-if analyze impacts of institutional parameter changes. MAPF simulator integration is initial target. Wrap the simulator as a black-box oracle for statistical model checking, attach a confidence interval to each parameter point, and mark boundaries where the intervals of competing regimes overlap as statistically indistinguishable; export to JANI to reach both exact tools (RD-1.3) and statistical model checkers such as modes [[Budde+, TACAS 2018]](./appendix-b-references.md). |
| RD-3.2 | Divergence Classification and<br />Connection to Amendment | Detect divergence between institutional operation and the CADL description by checking monitor traces against it, and classify each divergence as a violation or as a drift. A violation is handled by the contract (violation handling and sanctions) and counts as evidence against the assurance case. A drift is not corrected by updating the description automatically: it goes through the amendment procedure (in Course D, a constitution gate and a versioned record of amendments) and from there into the change management process of IEC 62853 [[IEC 62853:2018]](./appendix-b-references.md). |
| RD-3.3 | Verified Institutional<br />A/B Testing | Technology to operate different institutional designs in parallel and compare their performance. Institutional parameters proposed by reinforcement learning, as in AI Economist [[Zheng+, 2022]](./appendix-b-references.md), or by LLM agents are certified with the methods of RD-1.3 and RD-7.1 before they are deployed. The "rationality" of LLM agents is not the rationality assumed by game theory, and this must be stated as a precondition of any claim. Because experiments on institutions affect their participants, they need a framework of ethics and consent. |
| RD-3.4 | Assurance Cases<br />Generated from CADL | Derive the claims of an assurance case deterministically from contract elements, use design-time static checks and operation-time monitor verdicts as evidence, output the case in GSN [[SCSC-141C, 2021]](./appendix-b-references.md) or SACM [[OMG SACM, 2023]](./appendix-b-references.md), and use it as the dependability case of IEC 62853. Re-evaluate the case when monitors report, as ACCESS does for technical systems [[Wei+, JSS 2024]](./appendix-b-references.md). Open points: argument patterns for institutional claims (fairness, accountability, amendability), aggregating confidence over monitors owned by different organizations, and referring to the constituents' own assurance cases as away goals. |

## 9.4 Scalability and Computational Complexity
Scalability of formal verification and code generation of institutions
is one of the most critical challenges toward practical deployment. To
complete verification of SoS descriptions containing 100+ actors and 50+
contracts within practical time, theoretical analysis of computational
complexity of verification methods and development of efficient
algorithms are necessary. Some bounds are already known for the
strategic questions of Section 9.7: checking
LTL properties on the equilibria of probabilistic systems is
2EXPTIME-complete [[Gutierrez+, KR 2021]](./appendix-b-references.md);
designing incentives so that a property holds on equilibria is in PSPACE
for LTL and in NP or Σ₂ᴾ for GR(1) goals
[[Gutierrez+, LMCS 2024]](./appendix-b-references.md); and verifying
incentives with quantitative goals is 2EXPTIME-complete
[[Hyland+, KR 2024]](./appendix-b-references.md). Practical tools will
therefore need restricted fragments such as GR(1)
[[Piterman+, VMCAI 2006]](./appendix-b-references.md), finite traces, or
bounded horizons.

| **ID** | **Challenge** | **Content** |
| --- | --- | --- |
| RD-4.1 | Computational Complexity of<br />Institutional Verification | Determine computational complexity classes for consistency verification, deadlock detection, safety verification, realizability of temporal contract sets, and equilibrium properties of CADL descriptions respectively, starting from the known results above. Identify decidability boundary conditions and the fragments (for example GR(1) [[Piterman+, VMCAI 2006]](./appendix-b-references.md)) that keep them tractable. |
| RD-4.2 | Abstraction-based<br />Scalable Verification | Methods to efficiently verify large-scale SoS through hierarchical abstraction of institutional descriptions. Application of counterexample-guided abstraction refinement (CEGAR) [[Clarke+, 2000]](./appendix-b-references.md) to institutional verification, and compositional assume-guarantee reasoning per constituent for the equilibrium checks of Section 9.7. |
| RD-4.3 | Incremental<br />Verification | Confirm consistency through differential verification rather than full re-verification when actors join or leave or institutions change. Formulate leaving as the quotient `C_sys / C_rest` (the specification that a replacement must satisfy given the remaining constituents) and joining as re-checking the refinement of the new composition, computable with Pacti [[Incer+, arXiv 2023]](./appendix-b-references.md) for the fragments it supports. We found no work that formulates join and leave this way; earlier work on evolving SoS checks the reachability of critical configurations without a contract algebra [[Etzien+, ISORC 2013]](./appendix-b-references.md). |

## 9.5 Multi-Cultural and Multi-Jurisdictional Support
For CADL to be applied to international SoS, support for different legal
systems, cultural norms, and language environments is necessary. The [EU Data
Act](./appendix-b-references.md) (Regulation (EU) 2023/2854) sets essential requirements for smart
contracts used for the automated execution of data sharing agreements, but institutional compatibility with other jurisdictions
(Japan, US, China, etc.) remains an unresolved challenge.
For data usage, ODRL is used as the policy layer of data spaces
[[Iannella+, W3C Blog 2025]](./appendix-b-references.md), and the draft
ODRL Formal Semantics of the W3C Community Group defines deontic states
for permissions, prohibitions, and duties and separates access control
from monitoring; it leaves remedies unformalized and the handling of
conflicts pending [[W3C ODRL CG, Formal Semantics]](./appendix-b-references.md).
We found no reliable source that maps the obligations of the EU Data Act
to ODRL policies, and CADL does not assume such a mapping.

| **ID** | **Challenge** | **Content** |
| --- | --- | --- |
| RD-5.1 | Cross-jurisdictional Institutional<br />Compatibility Verification | Technology to detect legal contradictions when composing CADL descriptions from different jurisdictions (e.g., differences between EU GDPR [[Regulation (EU) 2016/679]](./appendix-b-references.md) and Japanese Personal Information Protection Act [[Act No. 57 of 2003]](./appendix-b-references.md)). For data-sharing norms, refer to the conflict semantics of ODRL as it is formalized [[W3C ODRL CG, Formal Semantics]](./appendix-b-references.md). |
| RD-5.2 | Parameterization of<br />Cultural Norms | Technology to model cultural dimensions (collectivism/individualism, power distance, uncertainty avoidance, etc.) as institutional parameters and handle cross-cultural governance differences quantitatively. |
| RD-5.3 | Multilingual Institutional Description | Enable CADL overview-level descriptions in multiple languages with AI verifying institutional equivalence across languages. This goes beyond NFR-7 (internationalization), which only requires that human-readable text can be written in any language. |

## 9.6 Norms and Time
CADL contracts describe normative agreements, but norms are not yet
first-class objects with their own state over time. Symboleo
[[Sharifi+, 2020]](./appendix-b-references.md) treats obligations and powers
as objects with lifecycles (creation, activation, suspension, resumption,
fulfilment, violation, termination), SymboleoPC translates Symboleo to
nuXmv and checks LTL and CTL properties
[[Parvizimosaed+, SoSyM 2025]](./appendix-b-references.md), and Symboleo
specifications have been translated into smart contracts
[[Rasti+, MODELS 2022]](./appendix-b-references.md). The normative
programming language NPL handles obligations with deadlines and
sanctions in multi-agent organisations
[[Hübner+, AMAI 2011]](./appendix-b-references.md), and constitutive norms
(counts-as) create institutional facts from other facts, as distinct from
regulative norms [[Boella & van der Torre, KR 2004]](./appendix-b-references.md).
Norms can also be synthesized automatically for multi-agent systems
[[Alechina+, KR 2022]](./appendix-b-references.md).

On the side of time and monitoring, RTAMT computes the robustness of
signal temporal logic online, and its interface-aware variant separates
input signals from output signals, which matches CADL's split between
assume and guarantee [[Ničković & Yamaguchi, ATVA 2020]](./appendix-b-references.md)
[[Yamaguchi+, STTT 2024]](./appendix-b-references.md). R2U2 compiles
temporal specifications into hardware or software observers
[[Johannsen+, CAV 2023]](./appendix-b-references.md). An assumption can
make more properties monitorable by restricting the traces a monitor must
handle [[Henzinger & Saraç, RV 2020]](./appendix-b-references.md).
Deontic runtime verification identifies the party to blame
[[Kharraz+, ICTAC 2023]](./appendix-b-references.md) and distinguishes
where a violation is detected from where it occurred
[[Colombo+, ISoLA 2024]](./appendix-b-references.md). Monitoring has been
decentralized [[Francalanza+, 2018]](./appendix-b-references.md), and
shields synthesized from temporal safety specifications block unsafe
actions [[Alshiekh+, AAAI 2018]](./appendix-b-references.md), also per
agent without communication [[Melcer+, NeurIPS 2022]](./appendix-b-references.md).

In the core language, `assume` and `guarantee` are state predicates
without temporal operators, deadlines exist only on lifecycle
transitions (`deadline:`), monitors are hand-written `rule:` predicates,
and Z3 is used only for satisfiability. The norms extension
([Appendix F](./appendix-f-norms.md), `norms` 0.1) is a first step on
RD-6.1, RD-6.2, RD-6.3, and RD-6.5: it defines first-class norms,
bounded temporal operators with four-valued verdicts, counts-as rules,
and what happens to running norms on an amendment. The
generated Python code monitors norms at run time, and so do the
generated Rego, as a step function that is given the stored state,
and Solidity, for the contracts they support
([F.10](./appendix-f-norms.md#f10-reference-implementation-status)),
and the norms of one contract instance can be checked at design time:
[F.12](./appendix-f-norms.md#f12-design-time-checking) translates them,
with discrete time and classes of values, into an MDP for PRISM
[[Kwiatkowska+, CAV 2011]](./appendix-b-references.md) and asks whether
each norm can be violated, whether every activation can be kept,
whether two norms are in conflict
[[Vasconcelos+, JAAMAS 2009]](./appendix-b-references.md), and whether
a power is ever exercised, each "yes" with a trace that the runtime
semantics of F.5 confirms.
The grounding extension
([Appendix J](./appendix-j-grounding.md), `grounding` 0.1) is a first
step towards the link to α, β, and λ: it derives from the norms of a
contract an index of information sharing over declared items and an
index of the concentration of powers, compares the declared α and β
with them, measures how many norms carry a sanction or a reward, and
gives sanctions a numeric magnitude that λ scales; the same indices
are also computed over all contracts of an SoS. The indices are
counts and are evidence about a contract, not the meaning of the
parameters. The formal meaning of α, β, and λ in terms of norms,
design-time checking that F.12 does not cover (quantifiers and arithmetic in
predicates, several contract instances, sets of actors whose size is not fixed, continuous
time, amendments, and which party can avoid a violation),
monitoring in the Unity C#
runtime, monitoring in the generated Rego and Solidity of what they
refuse (quantifiers, aggregates, wildcard and range references in
predicates, index expressions, and amendments; in Rego also `/`; in Solidity also `*`,
`/`, literals with more than six decimals, nested temporal operators,
three or more temporal operators in the content of a norm,
and contracts whose creation code exceeds the limit of EIP-3860),
weighted indices, norms per regime, and the derivation of model
probabilities from norms remain open. We found no work that handles first-class norm
objects together with the institutional parameters α, β, and λ, the
composition of many contracts in an SoS, and amendment during operation.
We also found no tool that connects deontic blame semantics with
efficient monitoring engines, or that lets several organizations, each
observing only its own interface with unsynchronized clocks, agree on a
verdict and on the responsible party.

| **ID** | **Challenge** | **Content** |
| --- | --- | --- |
| RD-6.1 | First-class Norm Objects | A candidate `norms:` block whose norms have a kind (obligation, permission, prohibition, power), a bearer, a counterparty, a trigger, a deadline, and the handling of violation (a contrary-to-duty obligation or a sanction), with the lifecycle of Symboleo [[Sharifi+, 2020]](./appendix-b-references.md). Check norms at design time by translation to nuXmv, as SymboleoPC does [[Parvizimosaed+, SoSyM 2025]](./appendix-b-references.md), and export data-sharing norms to ODRL. The holder of a power corresponds to β, the observability of trigger and fulfilment to α, and the size of a sanction to λ; whether the probability of compliance can be analysed as a function of λ and α is an open question. |
| RD-6.2 | Temporal Assume-Guarantee<br />and Four-valued Verdicts | Allow bounded MTL/STL in contracts and give four verdicts: pending (open and within its deadline), fulfilled, violated, and assumption violated (the provider is not to blame) [[Henzinger & Saraç, RV 2020]](./appendix-b-references.md). Translate them to RTAMT for the Python backend [[Yamaguchi+, STTT 2024]](./appendix-b-references.md) and to generated observers in the style of R2U2 for the Unity C# backend [[Johannsen+, CAV 2023]](./appendix-b-references.md). |
| RD-6.3 | Counts-as Bridge<br />to Protocols | Rules of the form "message m in protocol P counts as institutional event e in contract C" [[Boella & van der Torre, KR 2004]](./appendix-b-references.md), so that protocol traces change the state of norms. |
| RD-6.4 | Cross-organizational<br />Monitoring and Blame | Placement of monitors (provider, consumer, neutral third party) [[Francalanza+, 2018]](./appendix-b-references.md), uncertainty of clocks, tamper-evident records, and tracing the cause of a violation upstream along the graph of delegated contracts, using the blame semantics of deontic runtime verification [[Kharraz+, ICTAC 2023]](./appendix-b-references.md) [[Colombo+, ISoLA 2024]](./appendix-b-references.md). |
| RD-6.5 | Continuity of Norms<br />across Amendments | Define what happens to obligations that are active, suspended, or violated when a regime transition or an amendment takes effect: carried over, discharged, or transformed, together with transitional provisions and the time a version takes effect. To our knowledge Symboleo, ODRL, and NPL do not define this. [Course D](../handson/robot-town-tutorial.md) of the hands-on materials amends rules while the system runs and lists the missing syntax for transitional provisions; its research exercise on the speed of amendment is a first experiment. |
| RD-6.6 | From Monitoring<br />to Enforcement | Synthesize per-party shields [[Alshiekh+, AAAI 2018]](./appendix-b-references.md) [[Melcer+, NeurIPS 2022]](./appendix-b-references.md) or Simplex-style fallback behaviour from CADL contracts, using the lifecycle state machines as the finite abstraction. The shields we found act on physical actions; we found none for institutional acts. |

## 9.7 Strategic Constituents
CADL assumes that constituent systems keep their operational and
managerial independence, so they may not comply with a contract when
compliance does not pay. Rational verification checks whether a
temporal property holds on the Nash equilibria of a multi-agent system:
EVE takes modules with LTL goals and reduces the problem to parity games
[[Gutierrez+, AI 2020]](./appendix-b-references.md), and the problem has
been extended to probabilistic systems
[[Gutierrez+, KR 2021]](./appendix-b-references.md). Recent work moved from
checking to design: equilibrium design chooses incentives within a budget
so that a property holds on equilibria
[[Gutierrez+, LMCS 2024]](./appendix-b-references.md), incentive design
handles static and dynamic incentives with quantitative goals
[[Hyland+, KR 2024]](./appendix-b-references.md), and norms can be
synthesized against strategic objectives
[[Alechina+, KR 2022]](./appendix-b-references.md). PRISM-games verifies
Nash and correlated equilibria of concurrent stochastic games with
social-welfare and fairness criteria
[[Kwiatkowska+, TACAS 2022]](./appendix-b-references.md) and has been
extended to psychological games, whose payoffs depend on beliefs
[[Kwiatkowska+, 2024]](./appendix-b-references.md). Bayesian incentive
compatibility of mechanisms has been reduced to model checking
[[Mittelmann+, AAAI 2023]](./appendix-b-references.md). Learning-based
institution design such as AI Economist [[Zheng+, 2022]](./appendix-b-references.md)
gives no formal guarantee.

What remains open for CADL is a map rather than a point. Equilibrium
design finds one incentive scheme; CADL needs the range of λ (and of the
motivation parameters ρ and κ, [Appendix C](./appendix-c-motivation.md))
in which compliance is an equilibrium. We found no tool that combines
parametric transition probabilities with equilibrium computation, and
little work on equilibria when constituents observe only part of the
state, which is what α controls.

The strategic model extension
([Appendix I](./appendix-i-games.md), `games` 0.1) is a first step on
RD-7.1 and RD-7.2. It reads the model of Appendix H as a turn-based
stochastic game and defines when a named memoryless deterministic
profile, in particular the compliance profile, is an equilibrium
against unilateral deviations, and the equilibrium map: the cells of
a region of parameters, λ among them, on which the profile is
certified to be such an equilibrium or not to be one. It does not
compute the equilibria of a game. With the grounding extension
([Appendix J](./appendix-j-grounding.md)) the sanction term of a
payoff is, by definition, the magnitude of a norm multiplied by λ,
and under the conditions of J.7 the set of λ at which compliance is
an equilibrium is empty or an upper interval. The extension is implemented from `cadl` 0.3.23
([I.14](./appendix-i-games.md#i14-reference-implementation-status)). Concurrent moves, mixed strategies, properties that
must hold on every equilibrium, the mediator and the value of
centralisation of RD-7.2, the motivation parameters ρ and κ, and
partial observation (RD-7.3) remain open.

| **ID** | **Challenge** | **Content** |
| --- | --- | --- |
| RD-7.1 | Verifying that<br />Compliance is Rational | Translate CADL constituent systems and their goals into the input of EVE [[Gutierrez+, AI 2020]](./appendix-b-references.md) or into concurrent stochastic games for PRISM-games [[Kwiatkowska+, TACAS 2022]](./appendix-b-references.md), and check whether the compliance properties hold on every equilibrium. Use restricted fragments (Section 9.4) to keep the checks tractable. |
| RD-7.2 | Parametric<br />Equilibrium Analysis | Compute the region of λ, ρ, and κ in which compliance is an equilibrium. Model a centralized mediator as a correlated equilibrium and decentralized operation as a Nash equilibrium, and measure the difference between their values at each parameter point as the value of centralization (β). Relates to RD-1.3 and RD-1.5. |
| RD-7.3 | Equilibria under<br />Partial Observation | Equilibrium analysis when each constituent observes only what the information sharing degree α allows, with compositional reasoning per constituent for scale. |

## 9.8 Governance of AI Agents
LLM-based agents are becoming constituent systems of SoS, and the
protocols that connect them are being standardized. The current
specification of the Model Context Protocol (MCP) has a stateless core,
requires `Mcp-Method` and `Mcp-Name` headers so that gateways can route
and meter requests without parsing their bodies, and adds a framework for
extensions [[MCP, 2026-07-28]](./appendix-b-references.md). MCP is a
project of the Agentic AI Foundation of the Linux Foundation
[[Linux Foundation, AAIF 2025]](./appendix-b-references.md), and the
Agent2Agent (A2A) protocol was contributed to the Linux Foundation
[[Linux Foundation, A2A 2025]](./appendix-b-references.md). A preprint that
compares MCP, A2A, and three other protocols finds that none of them
supports voting or preserving dissent, and concludes that community
governance is a layer missing above them
[[Kang & Diponegoro, arXiv 2026]](./appendix-b-references.md).
Enforcement is converging on deterministic checks at the tool-call
boundary; for example, Amazon Bedrock AgentCore Policy authorizes tool
calls with Cedar policies and denies by default
[[AWS, AgentCore Policy]](./appendix-b-references.md). A preprint review
of 38 studies finds that writing the specification is the bottleneck,
that runtime monitoring is the most mature approach but gives guarantees
for single steps, and reports a study in which blocking 94% of unsafe
actions still left fewer than 5% of tasks completed safely and correctly
[[Dantas+, arXiv 2026]](./appendix-b-references.md). From the side of
institutional design, a preprint enforced a public governance graph with
an append-only audit log and reduced severe collusion among LLM agents
from 50% to 5.6% of runs, while a prompt-only "constitution" showed no
reliable improvement [[Bracale Syrnikov+, arXiv 2026]](./appendix-b-references.md).
Regulation such as the EU AI Act, with its requirements on record-keeping
and human oversight, is a further motivation for executable governance;
this chapter does not claim a mapping from its articles to CADL.

What remains open for CADL is the step from organizational contracts
(roles, obligations, the provenance of authority, incentives) to
deterministic enforcement at the protocol level; we found no work that
takes this step. The institutional designs above are built by hand for
each case, and `cadl ai` assures only the syntactic validity and
consistency of what it generates (Section 9.2). The agent governance
extension ([Appendix G](./appendix-g-agents.md), `agents` 0.1) is a first
step on RD-8.1, RD-8.2, and RD-8.3: it defines the decision that the
norms of a contract give for a message at the boundary, delegation with
a provenance chain, and escalation after a denial. Governance elements
such as voting and dissent (RD-8.4) and plan-level verification
(RD-8.5) remain open.

| **ID** | **Challenge** | **Content** |
| --- | --- | --- |
| RD-8.1 | Compiling Contracts<br />to Boundary Policies | Map actors to MCP clients and servers or to A2A agents, and compile contracts and authority into Rego [[Open Policy Agent]](./appendix-b-references.md) (already generated), Cedar [[AWS, AgentCore Policy]](./appendix-b-references.md), and Datalog policies, with the `Mcp-Method` and `Mcp-Name` headers [[MCP, 2026-07-28]](./appendix-b-references.md) as the point of enforcement. |
| RD-8.2 | Provenance of<br />Delegated Authority | Authority parameters that carry the chain of delegation, so that a guard checks where an authority came from and not only the local state, which cannot show whether an action was passed on through delegations its originator was not entitled to make. |
| RD-8.3 | Recovery after<br />a Blocked Action | Protocols that define the path after a guard blocks an action (escalation to a human, an alternative provider, renegotiation of the contract), in response to the low task completion reported after blocking [[Dantas+, arXiv 2026]](./appendix-b-references.md). |
| RD-8.4 | Governance Elements<br />Missing from Protocols | Describe membership, voting, dissent, escalation to humans, and audit records as CADL protocols, and distribute them as MCP or A2A extensions [[Kang & Diponegoro, arXiv 2026]](./appendix-b-references.md). Course D of the hands-on materials already combines a vote of the companies with a recorded human decision. |
| RD-8.5 | Plan-level and<br />Multi-agent Verification | Verify properties of plans and of the interaction of several agents, not of single steps, using the strategic methods of Section 9.7, and evaluate the generated guards on public agent-security benchmarks against existing guards. |

## 9.9 Research Roadmap
We organize the above research directions along a time axis and present
a short-, medium-, and long-term research roadmap. The order follows the
current implementation: items that extend what `cadl` 0.3.27 already
provides come first.

| **Period** | **Key Challenges** | **Content** |
| --- | --- | --- |
| Short-term<br />(2026-2027) | RD-1.1, RD-1.2,<br />RD-2.2, RD-4.1,<br />RD-4.3, RD-6.1,<br />RD-6.2, RD-8.1 | Basic theory of institutional composition (RD-1.1) and of refinement between description levels (RD-1.2), faithfulness checking for CADL generation via LLM (RD-2.2), computational complexity analysis of verification (RD-4.1), incremental verification when actors join or leave (RD-4.3), first-class norms and temporal contracts with four-valued verdicts as extensions of the existing `deadline:` and monitors (RD-6.1, RD-6.2), and compilation of contracts to boundary policies as an extension of Rego generation (RD-8.1). |
| Medium-term<br />(2027-2028) | RD-1.3, RD-1.4,<br />RD-1.6, RD-2.1,<br />RD-2.4, RD-3.1,<br />RD-3.2, RD-4.2,<br />RD-6.3-6.5,<br />RD-7.1, RD-8.2,<br />RD-8.3 | Certified regime maps by parameter synthesis (RD-1.3), safety of regime transitions (RD-1.4), SysML v2 interoperability (RD-1.6), institutional inference including specification mining (RD-2.1), an NL→CADL benchmark (RD-2.4), institutional simulator with statistical model checking, starting with integrated experiments with a MAPF simulator (RD-3.1), classification of divergences connected to the amendment procedure (RD-3.2), scalable verification methods (RD-4.2), counts-as, cross-organizational monitoring, and continuity of norms across amendments (RD-6.3 to RD-6.5), verification that compliance is rational (RD-7.1), provenance of delegated authority and recovery after blocked actions (RD-8.2, RD-8.3). |
| Long-term<br />(2028-2030) | RD-1.5, RD-2.3,<br />RD-3.3, RD-3.4,<br />RD-5.1-5.3,<br />RD-6.6, RD-7.2,<br />RD-7.3, RD-8.4,<br />RD-8.5 | Incentive-parameterised composition (RD-1.5), tacit knowledge ontology (RD-2.3), verified institutional A/B testing (RD-3.3), assurance cases generated from CADL (RD-3.4), multicultural and multi-jurisdictional support (RD-5.1 to RD-5.3), enforcement by shields (RD-6.6), parametric equilibrium analysis and equilibria under partial observation (RD-7.2, RD-7.3), governance elements for agent protocols and plan-level verification (RD-8.4, RD-8.5). |
