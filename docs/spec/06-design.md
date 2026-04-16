---
sidebar_position: 6
title: "Design"
---

## 6.1 Architecture
The CADL toolchain consists of the following four main components:

**Parser and Type Checker (Frontend):** Analyzes CADL descriptions and
generates abstract syntax trees (AST). Static type checking verifies
actor reference resolution, contract party consistency, and type
matching.

**Verification Engine (Verifier):** Performs formal verification on AST.
Integrates consistency verification (SMT solver), deadlock detection
(model checking), and safety verification (reachability analysis).

**Code Generator:** Generates runtime code in target languages
(Python/TypeScript/Solidity) from CADL descriptions. Also supports
conversion to SysMLv2 and AADL.

**Runtime Monitor:** Monitors execution of deployed institutions,
detects contract violations, executes institutional transitions, and
performs logging.

```yaml
Processing Pipeline:

CADL Description (.cadl)
│
▼
┌──────────────┐
│ Parser │ ─── Syntax error report
│ Type Checker│ ─── Type error report
└──────┬───────┘
│ AST
▼
┌──────────────┐
│ Verification │ ─── Verification result (OK / Counterexample)
│ Engine │
│ - SMT │
│ - Model │
│ Checking │
│ - Reachab- │
│ ility │
└──────┬───────┘
│ Verified AST
▼
┌──────────────┐ ┌──────────────┐
│Code Generator │────▶│ Runtime │
│ - Python │ │ Monitor │
│ - Solidity │ │ - Contract │
│ - SysMLv2 │ │ Monitoring │
│ │ │ - Transition │
│ │ │ Control │
└──────────────┘ └──────────────┘
```

## 6.2 Toolchain Components
### 6.2.1 Parser

Parses YAML-based syntax and additionally parses CADL-specific type
annotations, constraint expressions, and protocol steps. The parser uses
a PEG parser generator and has error recovery capabilities. Parse
results are output as typed AST.

### 6.2.2 Type Checker

Type checking verifies the following: (1) Actor reference existence
confirmation, (2) Detection of duplicate/missing contract parties, (3)
Protocol step senders/receivers match actor definitions, (4) Consistency
between information sharing declarations and actual message exchanges,
(5) Value constraints for institutional parameters (0 ≤ α, β, λ ≤ 1).

## 6.3 Verification Engine
The verification engine integrates three verification techniques.

  **Verification Technique**   **Verification Target**                                                                                      **Tool Foundation**
  ---------------------------- ------------------------------------------------------------------------------------------------------------ -----------------------
  SMT-Based Verification       Consistency between contracts. Logical consistency of guarantees.                                            Z3, CVC5
  Model Checking               Deadlock and livelock detection in protocols. Exhaustive search of reachable states.                         UPPAAL, NuSMV
  Reachability Analysis        Preservation of safety invariants during institutional transitions. Hamilton-Jacobi reachability analysis.   hj_reachability
  Compositional Verification   Differential verification when actors join/leave. Impact analysis on existing contracts.                     Custom implementation

## 6.4 Runtime System
The runtime system monitors and controls runtime code generated from
CADL descriptions on the execution platform. The main features are as
follows:

**Contract Monitoring:** Monitors satisfaction of assume/guarantee at
runtime for each contract and executes defined violation actions when
violations are detected.

**Institutional Transition Control:** Safely executes institutional
transitions in response to environmental parameter changes based on
regime maps. Manages each step of transition protocols and provides
rollback functionality.

**Metrics Collection:** Computes defined evaluation metrics
(performance, fairness, resilience, etc.) in real-time and displays them
on dashboards.

**Logging and Audit:** Records all protocol executions, contract
violations, and institutional transitions with timestamps, supporting
post-analysis and accountability. Assumes integration with IEC 62853
agreement description databases.
