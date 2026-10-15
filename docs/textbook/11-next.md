---
sidebar_position: 11
sidebar_label: "11 — Where to go next"
title: "Chapter 11 — Where to go next"
---

# Chapter 11 — Where to go next

## Wrap-up — What did we just learn?

| Layer | We wrote | We didn't write |
| --- | --- | --- |
| Spec | a CADL file of about 100 lines (Steps 2 & 3) | nothing — the spec was the only source |
| IR | nothing | generated JSON (245 lines for the bundled example) |
| Visualisation | nothing | the Lifecycle View page |
| Implementation | nothing | generated Unity C# (783 lines for the bundled example) |
| Runtime semantics | nothing | a working state machine + monitors + deadline timers |

Why does this matter for SoS? **The same specification powers everything**: the docs, the diagram, the simulation, the code. When the specification changes — say, you tighten the deadline from 5s to 3s — you edit one file and re-run the generation commands (`cadl sim-ir`, `cadl codegen`, or the e2e script); the IR, the diagram and the generated C# then all follow from that single source, with no second copy of the rule to edit by hand. Keeping one source for all of them helps keep a large SoS design maintainable.

---

## What's next?

Each chapter from 4 to 9 ends with the exercises of one class session (19 exercises in total, graded ★ to ★★★), and Chapter 10 adds one optional advanced exercise. They rebuild and then modify the system you just built one axis at a time — tighter deadlines, new monitors, new lifecycle states, reward execution, a violation-trace view. [Appendix B](appendix-b-teaching.md) shows how to run them as a 5-session (or 3-session) class.

To try the workflow on a fresh problem, go on to the other courses of the [hands-on materials](../handson/index.md):

- **[Course B — Urban Mobility](../handson/mobility-sos-tutorial.md)**: the same CADL syntax with another domain and runtime (SUMO).
- **[Course D — Robot Town](../handson/robot-town-tutorial.md)**: rules that a community amends while the system runs.
- **[Course C — Your own SoS](../handson/own-sos.md)**: an open-ended, self-directed track given as an outline. Pick a *different* domain (food delivery, smart traffic, data sharing between organisations, …), write its CADL from a blank page, exercise it with a small simulation harness of your choice (a Python discrete-event harness such as SimPy is the suggested default), and compare results across parameter sweeps.
