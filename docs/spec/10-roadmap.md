---
sidebar_position: 10
title: "Implementation Roadmap"
---

Below is a roadmap for CADL implementation and practical deployment,
considering the research directions in Chapter 9. The periods are the
originally planned ones; the status column records what the public
reference implementation (`cadl` v0.3.7, as of October 2026) provides.
For the up-to-date status, see the status table in the README of the
[`cadl` repository](https://github.com/ertlnagoya/cadl).

| **Phase**<br />(planned period) | **Goal** | **Content** | **Status** |
| --- | --- | --- | --- |
| Phase 1<br />(2026 Q2-Q3) | Language Core Design and Parser Implementation | EBNF finalization, parser implementation, type checker implementation. Initial evaluation via MAPF simulator integration. | **Done.** Parser, type checker, and simulator IR / config generation (Python, Unity, Go) are available. |
| Phase 2<br />(2026 Q3-Q4) | Verification Engine (Basic) | SMT-based consistency verification, protocol deadlock detection. Verification experiments on robot delivery scenarios. | **Done.** Z3-based consistency checks and protocol deadlock detection are available. The `model_check`, `simulation`, and `proof` methods are not supported yet. |
| Phase 3<br />(2027 Q1-Q2) | Runtime and Code Generation | Python/TypeScript runtime generation, contract monitoring implementation. Demonstration on IoT data sharing scenarios. | **Partly available.** Python runtime generation including contract monitor classes is available. TypeScript generation is planned. |
| Phase 4<br />(2027 Q2-Q3) | AI Integration | NL→CADL conversion via LLM, regime recommendation engine. Evaluation on household rule design scenarios. | **Partly available.** NL→CADL generation via an LLM with a parse / type-check / retry loop is available. The regime recommendation engine is planned. |
| Phase 5<br />(2027 Q3-Q4) | Institutional Transition and Regime Maps | Safety verification of dynamic institutional switching, regime map construction support tool. Integrated experiments across domains. | **Partly available.** Graph analysis of regime transitions (reachability, dead states, cycles) and a satisfiability check of safety invariants are available. Safety verification of dynamic switching and the construction support tool are planned. |
| Phase 6<br />(2028 Q1-) | IEC 62853 Integration and Practical Deployment | Assurance case integration, smart contract generation. Real-world pilot projects. | **Partly available.** An IEC 62853 mapping report and Solidity / OPA-Rego generation are available. Assurance case integration and pilot projects are planned. |

The status column covers the tooling only; the evaluation experiments
and demonstrations listed for each phase are outside its scope. The
reference implementation also provides the SoS-DSL extension
([Appendix E](./appendix-e-sos-dsl.md): `lifecycle:` / `monitors:`) with
Unity C# generation, which the original phase plan did not list.
