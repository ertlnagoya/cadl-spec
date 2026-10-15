---
sidebar_position: 7
sidebar_label: "Course C — Your own SoS"
title: "Course C — Modelling a New SoS End-to-End"
---

# Course C — Modelling a New SoS End-to-End

Course C is deliberately open-ended. It is given as an outline rather than as step-by-step exercises: you choose the domain, write the specification from a blank page, and decide how to exercise it. Treat it as a small self-directed project.

Pick a domain other than robot delivery — recommended: **food delivery (modelled as a Collaborative SoS)**; as a stretch, **disaster response in its first hours, before any incident-command structure has formed (Virtual SoS)** — and take it through the same five stages as the [textbook](../textbook/index.md) (Chapters 4–9). The key difference: Course C does not give you a starting `.cadl` file.

1. Identify actors and contracts (no template is provided).
2. Decide which SoS type (Maier / ISO/IEC/IEEE 21841) the domain belongs to, and justify the `type:` you declare.
3. Write `lifecycle:` and `monitors:` from scratch, pass `cadl check`, and inspect the result in cadl-explorer.
4. Exercise the specification with a runtime of your choice. The suggested default is a lightweight Python discrete-event harness (for example SimPy) that replays the lifecycle from the IR JSON; Unity is not required. No harness is provided — writing it is part of the task.
5. Sweep parameters and write a comparison report (the 3-page format of Exercise 9.4 in [Chapter 9 of the textbook](../textbook/09-improve.md) works well).

Course C needs only the public repositories (`cadl`, `cadl-explorer`).

For the academic positioning of this course (Maier criteria, ISO standards, taxonomy), see [`academic-background.md`](academic-background.md).
