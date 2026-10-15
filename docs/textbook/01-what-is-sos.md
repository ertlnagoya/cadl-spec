---
sidebar_position: 1
sidebar_label: "1 — What is an SoS?"
title: "Chapter 1 — What is an SoS?"
---

# Chapter 1 — What is an SoS?

## Why are we doing this?

A **System of Systems (SoS)** is a system whose parts are themselves independent, operationally autonomous systems — for example, a fleet of delivery robots, a central dispatcher, and the customers placing orders. The robot simulated in this hands-on is the **Raspberry Pi Mouse** ("raspimouse"), a small autonomous mobile robot — hence the simulator name `cadl-raspimouse-simulator`. (The physical robot runs on ROS; this hands-on is entirely simulator-based.) The parts have their own goals and their own software; the SoS designer's job is **not** to write all of their code, but to write the **rules of the game** they all follow: who can ask whom for what, what counts as a violation, what the consequences are.

Today you will learn three things:

1. **Describe the structure** of an SoS in CADL — who exists, who talks to whom.
2. **Describe the rules** of an SoS in the SoS-DSL extension ([Appendix E](../spec/appendix-e-sos-dsl.md)) — what each contract instance must do, by when, with what consequences for violations.
3. **Generate executable code** from a single specification, drop it into a Unity project, and watch the runtime detect violations of those rules in a running simulation.

## What makes a system an SoS?

A useful litmus test before declaring something "an SoS" is **Maier's five criteria** ([Maier, 1998]; the SoS taxonomy itself is standardised in **ISO/IEC/IEEE 21841:2019**):

| # | Criterion | Plain-English check |
| --- | --- | --- |
| 1 | Operational independence | Does each part work on its own when the SoS is "off"? |
| 2 | Managerial independence | Does each part have its own owner / decision-maker? |
| 3 | Geographic distribution | Are the parts spread out and exchanging information rather than energy or matter? |
| 4 | Emergent behaviour | Does the whole do things no individual part can? |
| 5 | Evolutionary development | Do parts get added, removed, modified over the SoS's lifetime? |

(1) and (2) are essentially mandatory. (3)–(5) usually accompany them.

**Applying it** — the robot delivery in this hands-on:

- ✓ (1) each robot can roam on its own even with no assignment.
- △ (2) all robots share a single dispatcher, so managerial independence is weak.
- ✓ (3) robots are distributed over a graph-shaped road network.
- ✓ (4) the collective delivery throughput is something no single robot can produce alone.
- △ (5) the robot count is fixed in this scenario, but the simulator itself supports changing it.

Because (2) is weak, this hands-on sits closer to a *parallel control problem* than to a textbook SoS. The CADL files nevertheless declare it `type: Acknowledged`: each robot is modelled as a constituent system that keeps its own control software and autonomy (`autonomy: high`) while recognising the dispatcher as the SoS-level authority for task assignment. A domain where managerial independence clearly holds (food delivery) is the recommended choice for **Part 2 of the exercises booklet**.

> 📚 For the full standards landscape (ISO/IEC/IEEE 21839 / 21840 / 21841 / 15288 / 42010), the four SoS taxonomy types, related research lines (ADLs, Normative MAS, Runtime Verification), and a curated reading list, see → [`academic-background.md`](../handson/academic-background.md).
