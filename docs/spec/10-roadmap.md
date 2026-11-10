---
sidebar_position: 10
title: "10. Implementation Roadmap"
description: "Phased roadmap for implementing and deploying CADL, with the status of each phase in the public reference implementation."
---

Below is a roadmap for CADL implementation and practical deployment,
considering the research directions in [Chapter 9](./09-research.md). The periods are the
originally planned ones; the status column records what the public
reference implementation (`cadl` 0.3.21, as of November 2026) provides.
For the up-to-date status, see the status table in the README of the
[`cadl` repository](https://github.com/ertlnagoya/cadl). The README
lists features, not phases, so the two tables do not correspond row by
row.

| **Phase**<br />(planned period) | **Goal** | **Content** | **Status** |
| --- | --- | --- | --- |
| Phase 1<br />(2026 Q2-Q3) | Language Core Design and Parser Implementation | EBNF finalization, parser implementation, type checker implementation. Initial evaluation via MAPF simulator integration. | **Done.** Parser, type checker, and simulator IR / config generation (Python, Unity, Go) are available. |
| Phase 2<br />(2026 Q3-Q4) | Verification Engine (Basic) | SMT-based consistency verification, protocol deadlock detection. Verification experiments on robot delivery scenarios. | **Done.** Z3-based consistency checks and protocol deadlock detection are available. The `model_check`, `simulation`, and `proof` methods are not supported yet. |
| Phase 3<br />(2027 Q1-Q2) | Runtime and Code Generation | Python/TypeScript runtime generation, contract monitoring implementation. Demonstration on IoT data sharing scenarios. | **Partly available.** Python runtime generation including contract monitor classes is available. TypeScript generation is planned. |
| Phase 4<br />(2027 Q2-Q3) | AI Integration | NL→CADL conversion via LLM, regime recommendation engine. Evaluation on household rule design scenarios. | **Partly available.** NL→CADL generation via an LLM with a parse / type-check / retry loop is available; with `--verify`, the generated definition also goes through the SMT and deadlock checks of `cadl verify`. The regime recommendation engine is planned. |
| Phase 5<br />(2027 Q3-Q4) | Institutional Transition and Regime Maps | Safety verification of dynamic institutional switching, regime map construction support tool. Integrated experiments across domains. | **Partly available.** Graph analysis of regime transitions (reachability, dead states, cycles) and a satisfiability check of safety invariants are available. Safety verification of dynamic switching and the construction support tool are planned. |
| Phase 6<br />(2028 Q1-) | IEC 62853 Integration and Practical Deployment | Assurance case integration, smart contract generation. Real-world pilot projects. | **Partly available.** An IEC 62853 mapping report and Solidity / OPA-Rego generation are available. Assurance case integration and pilot projects are planned. |

The status column covers the tooling only; the evaluation experiments
and demonstrations listed for each phase are outside its scope. The
reference implementation also provides the SoS-DSL extension
([Appendix E](./appendix-e-sos-dsl.md): `lifecycle:` / `monitors:`) with
Unity C# generation, which the original phase plan did not list.

Three further extensions follow the research directions of
[Chapter 9](./09-research.md) and are likewise outside the original
phase plan. Each is specified in an appendix that states what the
reference implementation provides:

| **Extension** | **Research challenges** | **Reference implementation (`cadl` 0.3.21)** |
| --- | --- | --- |
| Norms ([Appendix F](./appendix-f-norms.md)) | RD-6.1, RD-6.2, RD-6.3, RD-6.5 | Static rules; verdicts and amendments computed from a recorded trace (`cadl norms-eval`, `cadl norms-diff`). Not provided: monitoring in the generated runtimes, translation to a model checker. |
| Agent governance ([Appendix G](./appendix-g-agents.md)) | RD-8.1, RD-8.2, RD-8.3 | Static rules; the decision function for one message (`cadl agents-decide`); Rego and Cedar boundary policies. Not provided: holds, grants and revocations at runtime, audit records. |
| Stochastic model ([Appendix H](./appendix-h-stochastic.md)) | RD-1.3 | Static rules; export to the PRISM language (`cadl model-export`); a reference evaluator at fixed parameter values (`cadl model-check`). Not provided: certified regime maps, game semantics. |
