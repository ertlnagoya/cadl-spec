---
sidebar_position: 6
title: "6. Design"
description: "Design of the CADL toolchain: architecture, parser, type checker, verification engine, and runtime, with what the v0.3 reference implementation provides."
---

This chapter describes the design of the CADL toolchain. Each section
separates what the public reference implementation (`cadl` v0.3)
provides from what is design intent and still planned.
[Chapter 10](./10-roadmap.md) tracks the status per phase.

## 6.1 Architecture
The CADL toolchain is designed around the following four main
components:

**Parser and Type Checker (Frontend):** Analyzes CADL descriptions and
generates abstract syntax trees (AST). Static type checking verifies
actor reference resolution, contract party consistency, and parameter
ranges. Available in v0.3.

**Verification Engine (Verifier):** Performs formal verification on AST.
v0.3 provides consistency verification with an SMT solver (Z3), protocol
deadlock detection, and graph analysis of regime transitions. Model
checking and reachability analysis of continuous dynamics are planned.

**Code Generator:** Generates code from CADL descriptions. v0.3 targets
Python (runtime), Solidity, OPA/Rego, and Unity C# (for the SoS-DSL
extension, [Appendix E](./appendix-e-sos-dsl.md)), and also emits
simulator configurations; the targets are listed in
[Appendix D](./appendix-d-codegen.md). TypeScript
generation and conversion to SysMLv2 and AADL are planned.

**Runtime Monitor:** Monitors execution of deployed institutions,
detects contract violations, executes institutional transitions, and
performs logging. v0.3 provides these as classes in the generated
runtime code, not as a separate monitoring service.

The pipeline below shows the stages as provided by v0.3.

```text
Processing Pipeline:

CADL Description (.cadl)
  │
  ▼
┌─────────────────────┐
│ Parser              │ ─── Syntax error report
│ Type Checker        │ ─── Type error report
└──────────┬──────────┘
           │ AST
           ▼
┌─────────────────────┐
│ Verification Engine │ ─── Verification result (OK / Counterexample)
│  - SMT (Z3)         │
│  - Deadlock check   │
│  - Regime graph     │
└──────────┬──────────┘
           │ AST
           ▼
┌─────────────────────┐    ┌─────────────────────────┐
│ Code Generator      │───▶│ Runtime                 │
│  - Python           │    │ Monitor                 │
│  - Solidity         │    │  - Contract Monitoring  │
│  - OPA / Unity C#   │    │  - Transition Control   │
└─────────────────────┘    └─────────────────────────┘
```

The figure shows the intended order of use. `cadl codegen` itself runs
the type check but not the verification engine, so `cadl verify` has to
be run separately before generating code.

## 6.2 Toolchain Components
### 6.2.1 Parser

Parses YAML-based syntax and additionally parses CADL-specific
constraint expressions and protocol steps. In v0.3 a YAML loader reads
the document structure and a Lark grammar parses the expression
sub-language; parse results are output as typed AST. Parsing stops at
the first error, and keys the parser does not know are skipped without a
diagnostic. A PEG-based parser with error recovery is design intent and
not implemented.

### 6.2.2 Type Checker

Type checking verifies the following: (1) Actor reference existence
confirmation, (2) Detection of duplicate/missing contract parties, (3)
Protocol step senders/receivers match actor definitions, (4) Information
sharing declarations refer to defined actors, (5) Value constraints for
institutional parameters (0 ≤ α, β, λ ≤ 1). Checking information sharing
declarations against the actual message exchanges is planned.

### 6.2.3 Other Commands

Besides `cadl verify` and `cadl codegen`, the reference implementation
provides the following commands.

- `cadl parse` runs the parser alone, and `cadl check` the parser and
  the type checker.
- `cadl regime-map` gives the regime-graph analysis of Section 6.3 as a
  report (text, DOT, or JSON).
- `cadl iec62853` gives a dependability summary built from the parsed
  definition.
- `cadl sim-validate`, `cadl sim-ir`, and `cadl sim-gen` lower the
  definition to the three-layer IR and generate simulator configs
  ([Appendix D](./appendix-d-codegen.md)).
- `cadl ai` drafts a CADL file from a natural-language description
  through an LLM API, then parses and type-checks it.

## 6.3 Verification Engine
The verification engine is designed to integrate four verification
techniques. The reference verifier implements only the `smt` method;
the last column shows what v0.3 provides for each technique.

| **Verification Technique** | **Verification Target** | **Tool Foundation (design)** | **v0.3 reference implementation** |
|---|---|---|---|
| SMT-Based Verification | Consistency between contracts. Logical consistency of guarantees. | Z3, CVC5 | Available with Z3: consistency within each contract and between contracts that share a party, satisfiability of the assumptions of each contract, exclusivity of transition conditions. Whether the guarantees follow from the assumptions is reported as information only. CVC5 is not integrated. |
| Model Checking | Deadlock and livelock detection in protocols. Exhaustive search of reachable states. | UPPAAL, NuSMV | Not integrated. Deadlock detection is done by structural analysis instead (mutual sends between the branches of a `parallel` block, barrier reachability, circular fallback chains). Steps written in sequence are ordered and are not treated as circular waits. Livelock detection is planned. |
| Reachability Analysis | Preservation of safety invariants during institutional transitions. Hamilton-Jacobi reachability analysis. | hj_reachability | Not integrated. Available instead: reachability, dead-state, and cycle analysis on the regime transition graph, and a satisfiability check of each safety invariant with Z3. The initial regime is inferred from the transitions, and a regime with no outgoing transition is reported as a failure. |
| Compositional Verification | Differential verification when actors join/leave. Impact analysis on existing contracts. | Custom implementation | Planned. |

## 6.4 Runtime System
The runtime system monitors and controls runtime code generated from
CADL descriptions on the execution platform. The main features are as
follows; unless noted, they describe design intent:

**Contract Monitoring:** Monitors satisfaction of assume/guarantee at
runtime for each contract and executes defined violation actions when
violations are detected. v0.3 generates one monitor class per contract
that checks assume/guarantee and records violations.

**Institutional Transition Control:** Safely executes institutional
transitions in response to environmental parameter changes based on
regime maps. Manages each step of transition protocols and provides
rollback functionality. v0.3 generates a regime controller that
evaluates transition conditions and asserts the safety invariant when
switching; managed transition steps and rollback execution are planned.

**Metrics Collection:** Computes defined evaluation metrics
(performance, fairness, resilience, etc.) in real-time and displays them
on dashboards. v0.3 generates a metrics collector that records values
and checks targets; a dashboard is not provided.

**Logging and Audit:** Records all protocol executions, contract
violations, and institutional transitions with timestamps, supporting
post-analysis and accountability. The v0.3 runtime keeps a timestamped
in-memory log of protocol executions, violations, and regime
transitions. Integration with IEC 62853
agreement description databases is planned.
