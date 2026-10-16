---
sidebar_position: 20
title: "Glossary"
description: "Definitions of the terms used in the CADL specification, grouped by topic, with links to the chapters and sections that define them."
---

# Glossary

Working vocabulary for CADL and the surrounding research programme. Terms
are grouped by topic. Links point to the chapters where each term is
introduced in depth. Where it helps, an entry ends with an example.

## Core language

- **CADL** — Contract Architecture Description Language. A DSL for
  specifying the Institution / Protocol / Algorithm layers of a System
  of Systems in a single, verifiable document. See the
  [Specification introduction](./intro.md). *Example:* CADL targets a wide range of institutions, from household chore-sharing rules to the governance of large-scale urban transport.
- **Institution layer** — The layer that states who participates and
  under which rules: `actors:`, `contracts:`, and `transitions:` (the
  conditions for switching between regimes). The same definition is used
  in [Section 2.2](./02-objectives.md) and
  [Appendix A, §A.4](./appendix-a-syntax.md#a4-contracts-institution-layer).
  In the IR of the reference implementation, `institution` holds the
  actors and contracts, and the transitions are a separate top-level list.
  Each contract states its parties, `assume` / `guarantee`, `authority`,
  `information`, `responsibilities`, `incentives`, and `violation`, and
  carries the governance parameters α, β, λ.
- **Protocol layer** — Coordination procedures: message passing, compute
  steps, conditionals, parallel blocks, and barriers between actors.
  Defined in [Section 5.2.4](./05-language-spec.md#524-protocol-model) and
  [Appendix A, §A.5](./appendix-a-syntax.md#a5-protocols).
- **Protocol** — The interaction procedure between actors, with timing constraints:
  who sends what to whom, and in which order. *Example:* (1) the customer orders →
  (2) the dispatcher assigns a robot → (3) the robot delivers → (4) the customer
  is notified.
- **Algorithm layer** — Reference to central or local algorithms
  consumed by the protocol steps. Each algorithm is keyed by a function
  name and has a `central` and a `local` entry.
- **Institution** — A general term for the rules, authorities, role assignments and
  reward mechanisms between people or systems, from codified laws and contracts
  to implicit household rules. CADL describes an institution through three
  aspects: authority structure, information sharing and incentives. *Example:*
  "Children finish their chores before dinner" and "they receive 100 yen when done".
- **Actor** — A constituent system, agent, or role participating in the
  SoS. Identified by its `id`, possibly parameterised by a range.
  Defined in [Section 5.2.2](./05-language-spec.md#522-actor-model) and
  [Appendix A, §A.3](./appendix-a-syntax.md#a3-context-actors-metrics). *Example:* in a delivery system, the robots, the dispatchers and the customers are each actors.
- **`autonomy`** — Actor attribute: `low`, `medium`, or `high` (default
  `medium`). From `cadl` 0.3.10 a value other than these three is an
  error; the value is not checked against β or anything else.
  `cadl sim-gen -t go` uses it to give the actor only the central
  algorithm (`low`), only the local one (`high`), or both (`medium`).
- **Stakeholder** — Everyone with an interest in an institutional design: the actors
  that take part in it, the people it affects, and those who supervise it.
  *Example:* the users, delivery companies, municipality and nearby residents of
  a delivery system.
- **Contract** — Assume-guarantee constraint attached to a set of
  parties and an authority. The formal unit of institutional design.
  Defined in [Section 5.2.3](./05-language-spec.md#523-contract-model) and
  [Appendix A, §A.4](./appendix-a-syntax.md#a4-contracts-institution-layer). *Example:* "As long as the robot operates normally (assume), delivery arrives within 1.2× the promised time (guarantee)."
- **Assume-guarantee** — The basic structure of a contract: if the assumptions
  (`assume`) are satisfied, the guarantees (`guarantee`) are promised; if an
  assumption fails, the guarantees no longer bind. *Example:* assume "road
  accessibility ≥ 80%", guarantee "delivery success rate ≥ 95%".
- **Obligation** — Something an actor must do: a contractual responsibility whose
  violation may be penalised. *Example:* "Data providers must keep their data
  accuracy at 95% or above."
- **SLA** (Service Level Agreement) — An agreement, in numbers, on the level of
  quality a service provider guarantees to its users. *Example:* "data latency
  within 5 s", "uptime ≥ 99.9%", "delivery within 1.2× the promised time".
- **Authority structure** — Who has the authority to decide what, from centralised
  (one actor decides) to distributed (collective decision); its degree is β.
  *Example:* β = 0.8, the dispatcher decides almost everything; β = 0.2, each
  robot decides autonomously.
- **Incentive** — The reward and penalty mechanism that encourages the behaviour of
  actors; its strength is λ. *Example:* "on-time delivery: bonus", "late
  delivery: −50% of the base fee".
- **Transition** — A switch between regimes, declared with `from` and
  `to` (both required) and optionally `condition`, `protocol`, and
  `safety_invariant`. Defined in [Appendix A, §A.7](./appendix-a-syntax.md#a7-transitions).

## Governance parameters

The letters α, β, λ are used in two distinct parameterizations. They
share symbols and the range [0, 1]. β points the same way in both
(higher = more centralized), but α and λ have different meanings.

**Core language (per contract; [Chapter 5](./05-language-spec.md))**

- **α (alpha)** — Information sharing degree. 0 = no sharing (each actor
  has only local information); 1 = full sharing. Written in a contract's
  `information` block. *Example:* α = 1.0, every family member can see the schedule; α = 0.4, IoT data shares metadata only.
- **β (beta)** — Decision centralization degree. 0 = distributed (each
  actor decides autonomously); 1 = centralized (a single actor
  decides). Written in a contract's `authority` block. *Example:* β = 0.8, the dispatcher decides routes centrally; β = 0.2, each data provider decides on its own what data to publish.
- **λ (lambda)** — Incentive strength. 0 = directive-based; 1 = market
  mechanism. Written in a contract's `incentives` block. *Example:* λ = 0.6, pocket money affects behaviour moderately; λ = 0.9, strong control through market mechanisms.

**CADL Explorer simulation configuration (top-level `governance:` block;
[Appendix C](./appendix-c-motivation.md))**

- **α (alpha)** — Autonomy level of the agents. Higher α ⇒ more local
  judgment.
- **β (beta)** — Centralization level. Higher β ⇒ the central authority
  is more dominant.
- **λ (lambda)** — Exploration probability. λ = 0 means deterministic
  routing.

**Motivation extension ([Appendix C](./appendix-c-motivation.md))**

- **ρ (rho)** — Motivation sensitivity. Governs how strongly decisions
  respond to per-agent motivation values. ρ = 0 is motivation-blind;
  ρ = 1 fully couples budget / wait decisions to motivation.
- **κ (kappa)** — Scale factor for motivation-to-budget conversion.
- **Budget base** — Baseline resource quota assigned to an actor before
  motivation adjustments.
- **Motivation profile** — Distribution of motivation across actors:
  `uniform`, `linear`, `polarized`, or `custom` (an explicit list of
  values).

## System of Systems (SoS)

ISO/IEC/IEEE 21841:2019 classifies SoS into the four types below by their
governance structure. CADL can describe all four.

- **SoS** — System of Systems. A collection of independently managed
  systems that cooperate toward a shared purpose while retaining
  operational autonomy. *Example:* delivery robots of several companies that cooperate to make city-wide delivery efficient: each robot operates independently, but together they form an efficient delivery network.
- **Directed SoS (D-SoS)** — A central authority dictates
  coordination among constituent systems. *Example:* a military chain of command, in which headquarters controls the actions of all units.
- **Acknowledged SoS (A-SoS)** — Constituent systems retain autonomy but
  recognise a shared governance arrangement. *Example:* robot delivery, in which the dispatcher manages the whole but each robot avoids local obstacles on its own.
- **Collaborative SoS (C-SoS)** — Cooperation emerges through mutual
  agreement without a dominant authority. *Example:* family rule-making in family meetings; the running of a condominium management association.
- **Virtual SoS (V-SoS)** — No formal coordination mechanism;
  cooperation is implicit and opportunistic. *Example:* the Internet as a whole: its services are run independently but together form a huge ecosystem.
- **Five-layer framework** — A classification of SoS design into five layers
  [[Shimoyama & Matsubara, 2026]](./appendix-b-references.md): (1) objective
  (policy), (2) institution and governance, (3) control and coordination,
  (4) execution and operation, (5) environment and disturbance. CADL mainly
  describes layers 2 and 3; the correspondence with CADL's own three layers is
  given in [Section 2.2](./02-objectives.md). *Example:* policy "safety first" →
  governance "collision-avoidance rules" → control "route planning" → execution
  "motor control".

## Institutional dynamics

- **Regime** (also written *operational mode*) — The complete set of
  institutional settings effective at a given time. As environmental
  conditions change, the optimal regime also changes. In the v0.2 syntax
  a regime is a name used in `transitions:`; see
  [Section 5.1](./05-language-spec.md#51-overall-structure) and
  [Appendix A, §A.7](./appendix-a-syntax.md#a7-transitions). *Example:* a normal regime in which the dispatcher manages centrally, and a failure regime in which each robot decides on its own.
- **Regime map** — A map of which regime is optimal under which
  environmental conditions: the environmental parameter space divided
  into regions, each assigned a regime. This map of the parameter space
  is a concept whose construction support is planned; the
  `cadl regime-map` command reports something narrower: the graph of
  regime names and transitions. *Example:* low failure rate and low latency → centralised regime; high failure rate or high latency → distributed regime.
- **Regime transition** (also: *institutional transition*) — Switching from one regime to another in
  response to a change in environmental conditions. Safety (collision avoidance, for instance) must be kept during the switch. *Example:* when communication latency exceeds 300 ms, switch from centralised to distributed operation, keeping "no collisions, no lost orders" during the switch.
- **Safety invariant** — A condition that must never be violated, also
  during a regime transition. *Example:* "robots do not collide with each other", "order data is not lost".

## SoS-DSL extension

Terms of the SoS Contract DSL extension; see
[Appendix E](./appendix-e-sos-dsl.md).

- **Lifecycle** — The `lifecycle:` block of a contract: its `states`,
  the `initial` and `terminal` states, and the `transitions` between
  them.
- **Contract instance** — One execution of a contract, created when its
  initial trigger fires. It advances through the lifecycle states.
- **Monitor** — An entry of a contract's `monitors:` block: what to
  `observe`, the `sampling` (event or periodic), and a `rule` predicate.
- **Severity** — Grade of a violation: `Minor`, `Major`, or `Critical`.
- **`deadline` / `on_violation`** — A time bound on a lifecycle
  transition. When it expires, the instance moves to the state named by
  `on_violation.transition`, with the given severity.
- **`on_match`** — What a monitor does when its rule matches: report a
  violation, move the instance to a target state, or both.

## Verification

The checks of the reference verifier are described in
[Section 6.3](./06-design.md); the `verification:` block is specified in
[Appendix A, §A.8](./appendix-a-syntax.md#a8-verification-block).

- **Formal verification** — Checking mathematically, by computer, whether stated
  properties (such as freedom from contradiction) hold for an institutional
  description; it finds contradictions that human review tends to miss.
  *Example:* the consistency of two contracts is checked with an SMT solver, and
  freedom from deadlock of a protocol by structural analysis
  ([Section 6.3](./06-design.md)).
- **Contradiction detection** — Finding rules in an institutional description that
  contradict each other, such as one contract giving an authority to A and another
  giving the same authority to B. *Example:* "two chores assigned to the same time
  slot"; "privacy constraints contradict a data-publication requirement".
- **Model checking** — Examining every state a system can reach to confirm that no
  undesirable state is reached. *Example:* confirming that no state in which
  robots collide can be reached during a regime transition.
- **Reactive synthesis** — Synthesising automatically a controller that satisfies a
  specification of how a system should behave. *Example:* from an AI safety
  contract, a controller that always prevents harmful actions and escalates to a
  human when uncertain.
- **Runtime monitoring** — Checking, while an institution is in operation, that the
  conditions of its contracts are kept, and warning or acting when one is
  violated. *Example:* checking "delivery_time ≤ promised_time × 1.2" throughout a
  delivery and reassigning when it is likely to be exceeded.
- **Safety property** — "Nothing bad happens." Expressed as an invariant
  over the system state.
- **Liveness property** — "Something good eventually happens." Typically
  a ◇φ (eventually φ) temporal formula.
- **Fairness property** — A scheduling or resource-allocation
  constraint: no participant is indefinitely starved.
- **Invariant** — A predicate that must hold in every reachable state.
- **Verification methods** — `smt` (SMT solving, e.g. Z3 [[de Moura & Bjørner, 2008]](./appendix-b-references.md)),
  `model_check`, `simulation`, `proof`. The reference implementation
  implements `smt` only.
- **Deadlock** — A global state where no protocol step is enabled.
- **Regime transition safety** — No invariant is violated during a
  transition between regimes.

## Pipeline and toolchain

- **IR (Intermediate Representation)** — The three-layer data structure
  the toolchain builds from a CADL source file. Consumed by the
  simulator config generators.
- **Code generation** — Generating working program code automatically from a CADL
  institutional description: the implementation from the blueprint. *Example:*
  from the delivery SLA, a skeleton of the dispatch algorithm and code that
  monitors SLA violations.
- **Codegen target** — An output format named in the catalog of
  [Appendix D](./appendix-d-codegen.md): `unity` and `go` (simulation
  config), `ros2` (runtime nodes), `python`, `solidity` (smart
  contracts), `opa` (Rego policies), `unity-csharp` (contract runtime
  for Unity), or a user-defined target.
- **Simulator config** — Environment + actor + governance settings
  passed to the downstream simulator (e.g. Unity).
- **Pipeline** — `CADL → IR → Simulator config → Experiment → Evaluation`.
- **CADL Explorer** — Interactive web app that walks the pipeline
  end-to-end. See [cadl-explorer.streamlit.app](https://cadl-explorer.streamlit.app/)
  and the [source repository](https://github.com/ertlnagoya/cadl-explorer).
- **Saved comparisons** — Session-local record of the comparisons saved
  in CADL Explorer (**Save this comparison**), exportable as CSV / JSON.
  Called "Run history" before CADL Explorer v0.4.0.
- **CADL id / IR id / config id** — The first 12 hex digits of the
  SHA-256 of each stage (the CADL config, the IR, the simulator config),
  shown by CADL Explorer. Equal CADL ids with equal seed sets produce
  identical results.

## Evaluation metrics

- **Throughput** — Completed tasks per unit time across the fleet. CADL
  Explorer reports it as the total deliveries of one 300 s run.
- **Autonomy** — Share of decisions made locally (vs dictated centrally).
- **Fairness** — Distribution of workload or reward across actors.
- **Region (performance–autonomy plane)** — Convex area covered by a
  set of experiment runs in the 2-D plane of throughput × autonomy.

## Related standards and acronyms

- **IEC 62853** — Open Systems Dependability standard [[IEC 62853:2018]](./appendix-b-references.md). CADL's framing of
  the system life cycle, consensus building, and accountability draws on
  open systems dependability; CADL does not claim conformance to the
  standard. *Example:* describing in CADL the consensus-building process of an institutional change, or the accountability mechanism of a fault response.
- **ISO/IEC/IEEE 21841** — Taxonomy of Systems of Systems
  (Directed / Acknowledged / Collaborative / Virtual) [[ISO/IEC/IEEE 21841:2019]](./appendix-b-references.md).
- **EBNF** — Extended Backus–Naur Form [[ISO/IEC 14977:1996]](./appendix-b-references.md). Used in Appendix A to define
  CADL's concrete syntax.
- **SMT** — Satisfiability Modulo Theories. The backbone of CADL's
  `method: smt` verification.
- **OPA / Rego** — Open Policy Agent [[Open Policy Agent]](./appendix-b-references.md) and its policy language; a codegen
  target for institutional constraints.

## See also

- [Specification introduction](./intro.md)
- [Language specification (Chapter 5)](./05-language-spec.md)
- [Appendix A — Syntax (EBNF)](./appendix-a-syntax.md)
- [Appendix C — Motivation Extension](./appendix-c-motivation.md)
- [Appendix D — Codegen Target Catalog](./appendix-d-codegen.md)
- [Appendix E — SoS Contract DSL Extension](./appendix-e-sos-dsl.md)
