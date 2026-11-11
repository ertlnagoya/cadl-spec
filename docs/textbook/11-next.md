---
sidebar_position: 11
sidebar_label: "11 — Where to go next"
title: "Chapter 11 — Where to go next"
---

# Chapter 11 — Where to go next

## 11.1 What you learned

| Layer | We wrote | We didn't write |
| --- | --- | --- |
| Spec | a CADL file of about 110 lines (Chapters 4 and 5) | nothing — the spec was the only source |
| IR | nothing | generated JSON (300 lines for the bundled example) |
| Visualisation | nothing | the Lifecycle View page |
| Implementation | nothing | generated Unity C# (783 lines for the bundled example) |
| Runtime semantics | nothing | a working state machine + monitors + deadline timers |

Why does this matter for SoS? **The same specification powers everything**: the docs, the diagram, the simulation, the code. When the specification changes — say, you tighten the deadline from 5s to 3s — you edit one file and re-run the generation commands (`cadl sim-ir`, `cadl codegen`, or the e2e script); the IR, the diagram and the generated C# then all follow from that single source, with no second copy of the rule to edit by hand. Keeping one source for all of them helps keep a large SoS design maintainable.

---

## 11.2 What's next

Each chapter from 4 to 9 ends with the exercises of one class session (19 exercises in total, graded ★ to ★★★), and Chapter 10 adds one optional advanced exercise. They rebuild and then modify the system you just built one axis at a time — tighter deadlines, new monitors, new lifecycle states, reward execution, a violation-trace view. [Appendix C](appendix-c-teaching.md) shows how to run them as a 5-session (or 3-session) class.

To try the workflow on a fresh problem, go on to the other courses of the [hands-on materials](../handson/index.md):

- **[Course B — Urban Mobility](../handson/mobility-sos-tutorial.md)**: the same CADL syntax with another domain and runtime (SUMO).
- **[Course D — Robot Town](../handson/robot-town-tutorial.md)**: rules, regulation and contracts amended toward a KPI while the system runs: a human sets the KPIs and decides what an LLM proposer should not decide alone.
- **[Course C — Your own SoS](../handson/own-sos.md)**: an open-ended, self-directed track given as an outline. Pick a *different* domain (food delivery, smart traffic, data sharing between organisations, …), write its CADL from a blank page, exercise it with a small simulation harness of your choice (a Python discrete-event harness such as SimPy is the suggested default), and compare results across parameter sweeps.

The specification also has extensions that this textbook does not use. Each one is an appendix of
the specification, and `cadl` 0.3.25 provides commands for it (`cadl --help` lists them):

- **Norms** ([Appendix F](../spec/appendix-f-norms.md)): obligations, permissions, prohibitions and
  powers. `cadl norms-eval` judges them on a recorded trace, `cadl norms-check` checks them with the
  model checker PRISM before the system runs, and `cadl codegen` with `python`, `opa` or `solidity`
  generates monitors of them.
- **Agent governance** ([Appendix G](../spec/appendix-g-agents.md)): decisions on the messages of
  LLM agents and an audit log (`cadl agents-run`, `cadl mcp-gateway`, `cadl a2a-gateway`,
  `cadl audit-verify`; see Section 10.2).
- **Stochastic model** ([Appendix H](../spec/appendix-h-stochastic.md)): a probabilistic model of
  the SoS, exported to PRISM (`cadl model-export`) or evaluated by `cadl model-check`.
- **Strategic model** ([Appendix I](../spec/appendix-i-games.md)): whether a named profile of the
  players, such as compliance, is an equilibrium (`cadl game-check`).
- **Grounding** ([Appendix J](../spec/appendix-j-grounding.md)): an index of information sharing,
  an index of the concentration of powers and the coverage of incentives, computed from the norms
  (`cadl norms-indices`).
