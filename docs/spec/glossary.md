---
sidebar_position: 20
title: "Glossary"
description: "Definitions of the terms used in the CADL specification, grouped by topic, with links to the chapters and sections that define them."
---

# Glossary

Working vocabulary for CADL and the surrounding research programme. Terms
are grouped by topic. Links point to the chapters where each term is
introduced in depth. For an introductory glossary with plain
explanations and examples, see
[Section 1.3 of Chapter 1](./01-introduction.md#13-glossary).

## Core language

- **CADL** — Contract Architecture Description Language. A DSL for
  specifying the Institution / Protocol / Algorithm layers of a System
  of Systems in a single, verifiable document. See the
  [Specification introduction](./intro.md).
- **Institution layer** — The layer that declares actors and contracts.
  Each contract states its parties, `assume` / `guarantee`, `authority`,
  `information`, `responsibilities`, `incentives`, and `violation`, and
  carries the governance parameters α, β, λ.
- **Protocol layer** — Coordination procedures: message passing, compute
  steps, conditionals, parallel blocks, and barriers between actors.
  Defined in [Section 5.2.4](./05-language-spec.md#524-protocol-model) and
  [Appendix A, §A.5](./appendix-a-syntax.md#a5-protocols).
- **Algorithm layer** — Reference to central or local algorithms
  consumed by the protocol steps. Each algorithm is keyed by a function
  name and has a `central` and a `local` entry.
- **Actor** — A constituent system, agent, or role participating in the
  SoS. Identified by its `id`, possibly parameterised by a range.
  Defined in [Section 5.2.2](./05-language-spec.md#522-actor-model) and
  [Appendix A, §A.3](./appendix-a-syntax.md#a3-context-actors-metrics).
- **`autonomy`** — Actor attribute: `low`, `medium`, or `high` (default
  `medium`). A descriptive label; it is not checked.
- **Contract** — Assume-guarantee constraint attached to a set of
  parties and an authority. The formal unit of institutional design.
  Defined in [Section 5.2.3](./05-language-spec.md#523-contract-model) and
  [Appendix A, §A.4](./appendix-a-syntax.md#a4-contracts-institution-layer).
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
  `information` block.
- **β (beta)** — Decision centralization degree. 0 = distributed (each
  actor decides autonomously); 1 = centralized (a single actor
  decides). Written in a contract's `authority` block.
- **λ (lambda)** — Incentive strength. 0 = directive-based; 1 = market
  mechanism. Written in a contract's `incentives` block.

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

- **SoS** — System of Systems. A collection of independently managed
  systems that cooperate toward a shared purpose while retaining
  operational autonomy.
- **Directed SoS (D-SoS)** — A central authority dictates
  coordination among constituent systems.
- **Acknowledged SoS (A-SoS)** — Constituent systems retain autonomy but
  recognise a shared governance arrangement.
- **Collaborative SoS (C-SoS)** — Cooperation emerges through mutual
  agreement without a dominant authority.
- **Virtual SoS (V-SoS)** — No formal coordination mechanism;
  cooperation is implicit and opportunistic.

## Institutional dynamics

See [Chapter 1, §1.3.4](./01-introduction.md).

- **Regime** (also written *operational mode*) — The complete set of
  institutional settings effective at a given time. As environmental
  conditions change, the optimal regime also changes. In the v0.1 syntax
  a regime is a name used in `transitions:`; see
  [Section 5.1](./05-language-spec.md#51-overall-structure) and
  [Appendix A, §A.7](./appendix-a-syntax.md#a7-transitions).
- **Regime map** — A map of which regime is optimal under which
  environmental conditions: the environmental parameter space divided
  into regions, each assigned a regime. This map of the parameter space
  is a concept whose construction support is planned; the
  `cadl regime-map` command reports something narrower: the graph of
  regime names and transitions.
- **Regime transition** (also: *institutional transition*) — Switching from one regime to another in
  response to a change in environmental conditions.
- **Safety invariant** — A condition that must never be violated, also
  during a regime transition.

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
- **Run history** — Session-local record of experiment runs in CADL
  Explorer, exportable as CSV / JSON.
- **Config hash** — SHA-256 fingerprint of the full CADL config; equal
  hashes with equal seed sets produce identical results.

## Evaluation metrics

- **Throughput** — Completed tasks per unit time across the fleet.
- **Autonomy** — Share of decisions made locally (vs dictated centrally).
- **Fairness** — Distribution of workload or reward across actors.
- **Region (performance–autonomy plane)** — Convex area covered by a
  set of experiment runs in the 2-D plane of throughput × autonomy.

## Related standards and acronyms

- **IEC 62853** — Open Systems Dependability standard [[IEC 62853:2018]](./appendix-b-references.md). CADL's framing of
  the system life cycle, consensus building, and accountability draws on
  open systems dependability; CADL does not claim conformance to the
  standard.
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
