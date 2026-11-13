---
sidebar_position: 10
title: "10. Implementation Roadmap"
description: "Phased roadmap for implementing and deploying CADL, with the status of each phase in the public reference implementation."
---

Below is a roadmap for CADL implementation and practical deployment,
considering the research directions in [Chapter 9](./09-research.md). The periods are the
originally planned ones; the status column records what the public
reference implementation (`cadl` 0.3.28, as of November 2026) provides.
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

Five further extensions follow the research directions of
[Chapter 9](./09-research.md) and are likewise outside the original
phase plan. Each is specified in an appendix that states what the
reference implementation provides:

| **Extension** | **Research challenges** | **Reference implementation (`cadl` 0.3.28)** |
| --- | --- | --- |
| Norms ([Appendix F](./appendix-f-norms.md)) | RD-6.1, RD-6.2, RD-6.3, RD-6.5 | Static rules; verdicts and amendments computed from a recorded trace (`cadl norms-eval`, `cadl norms-diff`); an online monitor in the generated Python code (`norms_monitor.py`); quantifiers, aggregates and `[*]` references in predicates. From `cadl` 0.3.25: design-time checking of one contract instance with PRISM (`cadl norms-check`, F.12); monitors in the generated Rego and Solidity (D.5). From `cadl` 0.3.26: exact numbers and times; design-time checking of quantified predicates, comparisons and arithmetic over a given domain, several instances, and amendments. Not provided: monitoring in the generated Unity C#, and in Rego and Solidity of what they refuse (quantifiers, aggregates, wildcard references, amendments). |
| Agent governance ([Appendix G](./appendix-g-agents.md)) | RD-8.1, RD-8.2, RD-8.3 | Static rules; the decision function for one message (`cadl agents-decide`); Rego and Cedar boundary policies; a reference runtime that replays a recorded trace with holds, delegation and audit records (`cadl agents-run`), also usable online; a tamper-evident audit log (`cadl audit-verify`); a gateway for the Model Context Protocol (`cadl mcp-gateway`). From `cadl` 0.3.25: a gateway for A2A 1.0.0 over JSON-RPC (`cadl a2a-gateway`). From `cadl` 0.3.26: streams of A2A, signed holds, and tests against the official MCP and A2A SDKs. From `cadl` 0.3.28: the HTTP+JSON binding, push notifications behind an allowlist, gRPC as the optional extra `cadl-lang[grpc]`, and mutual TLS (G.13). Not provided: other MCP transports than stdio. |
| Stochastic model ([Appendix H](./appendix-h-stochastic.md)) | RD-1.3 | Static rules; export to the PRISM language (`cadl model-export`); a reference evaluator at fixed parameter values (`cadl model-check`); certified regime maps by parameter lifting (`--certify`). Not provided: derivation of the model from contracts. |
| Strategic model ([Appendix I](./appendix-i-games.md)) | RD-7.1, RD-7.2 | From `cadl` 0.3.23: static rules; checks that a named memoryless deterministic profile is an equilibrium against unilateral deviations, with deviation gains, and certified equilibrium maps (`cadl game-check`); export to PRISM-games; from 0.3.24 end-point certification for any strategic model and the concept `every_reachable_state`; in the version after 0.3.26 the conditions PD+ and PD− of I.9 (one-step advantages) and the export compared with PRISM-games 3.2.4. From `cadl` 0.3.27: the export checked with PRISM-games 3.2.4, and maps decided also by the performance-difference conditions PD+ and PD− (I.9); in the version after 0.3.27, coupled bounds of the advantages for PD+ and PD− (I.9). Not provided: equilibria under partial observation, concurrent moves. |
| Grounding of the institutional parameters ([Appendix J](./appendix-j-grounding.md)) | RD-6.1, RD-1.5 | From `cadl` 0.3.23: static rules; indices for α and β and a coverage measure for incentives (`cadl norms-indices`); the payoff term of a sanction in a strategic model; from 0.3.24 indices over all contracts of an SoS. Not provided: the formal meaning of α, β, and λ in terms of norms. |
