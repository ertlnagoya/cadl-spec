---
sidebar_position: 20
title: "Glossary"
---

# Glossary

Working vocabulary for CADL and the surrounding research programme. Terms
are grouped by topic. Links point to the chapters where each term is
introduced in depth.

## Core language

- **CADL** — Contract Architecture Description Language. A DSL for
  specifying the Institution / Protocol / Algorithm layers of a System
  of Systems in a single, verifiable document. See the
  [Specification introduction](./intro).
- **Institution layer** — The top layer of a CADL file. Declares
  authority structure, obligations, permissions, prohibitions, and
  sanctions. Carries the governance parameters α, β, λ.
- **Protocol layer** — Coordination procedures: message passing, compute
  steps, conditionals, parallel blocks, barriers, and loops between
  actors.
- **Algorithm layer** — Reference to central or local algorithms
  consumed by the protocol steps (inputs, outputs, implementation
  handle, parameters).
- **Actor** — A constituent system, agent, or role participating in the
  SoS. Identified by `actor_id`, possibly parameterised by a range.
- **Contract** — Assume-guarantee constraint attached to a set of
  parties and an authority. The formal unit of institutional design.
- **Transition** — Regime shift defined by a source/target pair with a
  trigger, guard, and effect. Used to model operational mode changes.

## Governance parameters

- **α (alpha)** — Authority / centralisation weight. Higher α ⇒ stronger
  central enforcement of contracts.
- **β (beta)** — Incentive weight. Higher β ⇒ rewards / sanctions have
  more influence on behaviour than top-down authority.
- **λ (lambda)** — Information-sharing weight. Higher λ ⇒ actors share
  more state with each other and with the governance layer.
- **ρ (rho)** — Motivation sensitivity. Governs how strongly decisions
  respond to per-agent motivation values. ρ = 0 is motivation-blind;
  ρ = 1 fully couples budget / wait decisions to motivation.
- **κ (kappa)** — Scale factor for motivation-to-budget conversion.
- **Budget base** — Baseline resource quota assigned to an actor before
  motivation adjustments.
- **Motivation profile** — Distribution of motivation across actors:
  `uniform`, `linear`, or `polarized`.

## System of Systems (SoS)

- **SoS** — System of Systems. A collection of independently managed
  systems that cooperate toward a shared purpose while retaining
  operational autonomy.
- **Directed SoS (A-SoS variant)** — A central authority dictates
  coordination among constituent systems.
- **Acknowledged SoS (A-SoS)** — Constituent systems retain autonomy but
  recognise a shared governance arrangement.
- **Collaborative SoS (C-SoS)** — Cooperation emerges through mutual
  agreement without a dominant authority.
- **Virtual SoS** — No formal coordination mechanism; cooperation is
  implicit and opportunistic.
- **Regime** — A named operating condition (e.g. normal / degraded /
  emergency) that governs which contracts and protocols are active.

## Verification

- **Safety property** — "Nothing bad happens." Expressed as an invariant
  over the system state.
- **Liveness property** — "Something good eventually happens." Typically
  a ◇φ (eventually φ) temporal formula.
- **Fairness property** — A scheduling or resource-allocation
  constraint: no participant is indefinitely starved.
- **Invariant** — A predicate that must hold in every reachable state.
- **Verification methods** — `smt` (SMT solving, e.g. Z3),
  `model_check`, `simulation`, `proof`.
- **Deadlock** — A global state where no protocol step is enabled.
- **Regime transition safety** — No invariant is violated during a
  transition between regimes.

## Pipeline and toolchain

- **IR (Intermediate Representation)** — The three-layer data structure
  the toolchain builds from a CADL source file. Consumed by simulator
  generators and verifiers.
- **Codegen target** — An output format produced from the IR:
  `unity` (simulation config), `solidity` (smart contracts),
  `ros2` (runtime nodes), `python`, or a user-defined target.
- **Simulator config** — Environment + actor + governance settings
  passed to the downstream simulator (e.g. Unity).
- **Pipeline** — `CADL → IR → Simulator config → Experiment → Evaluation`.
- **CADL Explorer** — Interactive web app that walks the pipeline
  end-to-end. See [cadl-explorer.streamlit.app](https://cadl-explorer.streamlit.app/).
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

- **IEC 62853** — Open Systems Dependability standard; CADL's regime
  model draws on its terminology.
- **ISO/IEC/IEEE 21841** — Taxonomy of Systems of Systems
  (Directed / Acknowledged / Collaborative / Virtual).
- **EBNF** — Extended Backus–Naur Form. Used in Appendix A to define
  CADL's concrete syntax.
- **SMT** — Satisfiability Modulo Theories. The backbone of CADL's
  `method: smt` verification.
- **OPA / Rego** — Open Policy Agent and its policy language; a codegen
  target for institutional constraints.

## See also

- [Specification introduction](./intro)
- [Language specification (Chapter 5)](./05-language-spec)
- [Appendix A — Syntax (EBNF)](./appendix-a-syntax)
