---
sidebar_position: 1
sidebar_label: "1 — What is an SoS?"
title: "Chapter 1 — What is an SoS?"
---

# Chapter 1 — What is an SoS?

This chapter explains what a System of Systems (SoS), the subject of this textbook, is, why its rules need a language of their own, and what CADL (Contract Architecture Description Language) is a language for. The hands-on work starts in Chapter 2.

## 1.1 What this textbook does

An **SoS** is a set of systems, each operated independently, that together achieve a goal none of them can achieve alone. The subject of this textbook is a robot-delivery SoS made of a fleet of delivery robots, a central coordinator that assigns deliveries (the dispatcher), and the customers who place orders. Each has its own goals and its own software. The robot we simulate is the **Raspberry Pi Mouse** ("raspimouse"), a small autonomous mobile robot — hence the simulator name `cadl-raspimouse-simulator`. (The physical robot runs on ROS; this textbook uses the simulator only.)

The job of an SoS designer is not to write all the code of the constituent systems. It is to decide the **rules of the game** they all follow: who can ask whom for what, what counts as a violation, and what happens when one occurs.

You will learn three things:

1. **Describe the structure** of an SoS in CADL: who exists, and who exchanges what with whom (Chapter 4).
2. **Describe the norms** of an SoS in the SoS-DSL extension of CADL: what each individual agreement must do, by when, and what happens on a violation (Chapter 5).
3. **Build working artefacts from one specification**: from the same specification, produce a diagram, executable code and a simulation configuration, and watch violations of the norms being detected in a running simulation (Chapters 6–8). Finally, revise the specification from what you observed (Chapter 9).

## 1.2 A familiar example: a food-delivery app

Before turning to robot delivery, look at an SoS you already know.

| Actor | What they do | Who owns or commands them? |
|---|---|---|
| Restaurant | Cooks the meal and hands it over | Itself. It sets its own hours and prices. |
| Courier (gig worker) | Delivers by bike or scooter | Themselves. They choose their own working hours. |
| Platform (the app) | Matches orders to couriers | The app company — which employs neither the restaurants nor the couriers. |
| Customer | Orders and pays | Themselves. |

The behaviour of the whole — "the food arrives within 30 minutes" — is not designed and delivered by any single party. It results from independent actors each acting on their own interests. That state, in which independently operating systems together form a larger whole, is a System of Systems.

## 1.3 Telling whether something is an SoS: Maier's five criteria

Whether something can be called an SoS is usually decided with Maier's (1998) five criteria [[1]](appendix-d-references.md). The classification of SoS itself is standardised in ISO/IEC/IEEE 21841:2019 [[2]](appendix-d-references.md).

| # | Criterion | What to check | In food delivery |
| --- | --- | --- | --- |
| 1 | Operational independence | Does each part work on its own when the SoS as a whole is "off"? | A restaurant can run as a restaurant without the app |
| 2 | Managerial independence | Does each part have its own owner or decision-maker? | Couriers are gig workers, not employees of the app company |
| 3 | Geographic distribution | Are the parts spread out and exchanging information rather than matter or energy? | Restaurants, couriers and customers are all in different places |
| 4 | Emergent behaviour | Does the whole do something no part can do alone? | "Delivered in 30 minutes" is a collective property nobody designed explicitly |
| 5 | Evolutionary development | Do parts join, leave or change while the SoS is in use? | Restaurants and couriers come and go every day |

(1) and (2) are essentially mandatory; (3)–(5) usually accompany them. A coffee shop, for example, whose staff work in one place and whose owner manages everyone, fails (2) and is not an SoS.

### Applying the criteria to robot delivery

For the robot delivery of this textbook:

- ✓ (1) each robot can roam on its own even with no delivery assigned.
- △ (2) all robots share a single dispatcher, so managerial independence is weak.
- ✓ (3) the robots are distributed over a graph-shaped road network.
- ✓ (4) the delivery throughput of the fleet is something no single robot can produce alone.
- △ (5) the robot count is fixed in our scenario, but the simulator supports changing it.

Because (2) is weak, this subject sits closer to a problem of controlling several robots in parallel than to a textbook SoS. It is still a manageable size for practising how contracts govern behaviour. A domain where managerial independence clearly holds, such as food delivery, is the subject of Course C, which follows this textbook (Chapter 11).

## 1.4 The four types of SoS

SoS differ by how strong their central authority is. ISO/IEC/IEEE 21841 [[2]](appendix-d-references.md) defines four types: the three types Maier proposed (Directed, Collaborative, Virtual) [[1]](appendix-d-references.md) and Acknowledged, added by Dahmann and Baldwin [[3]](appendix-d-references.md).

| Type | Central authority | Examples |
|---|---|---|
| Directed | Strong, top-down, centralised management | An air-defence network |
| Acknowledged | An authority for the SoS as a whole exists, but each constituent keeps its ownership and its own management | An international space mission; the robot delivery of this textbook; a large ride-hailing platform |
| Collaborative | No single authority; the parts cooperate voluntarily through shared agreements (protocols, rules) | The Internet |
| Virtual | Neither central management nor an agreed purpose; coordination arises on its own | The World Wide Web; the shelters that open one by one right after a major disaster |

The CADL file for robot delivery in this textbook declares `type: Acknowledged`: it models each robot as a constituent system that keeps its own control software and autonomy but accepts the dispatcher as the SoS-level authority for assigning deliveries.

The type is not fixed by the subject alone. The same food delivery is closer to Acknowledged if you focus on the platform's authority, and closer to Collaborative if you focus on the voluntary cooperation of the participants. Types also shift over time: right after a disaster the response starts as Virtual, becomes Collaborative once the municipal disaster headquarters is running, and approaches Acknowledged once the command authority is fixed by law.

The `type:` of a CADL file is a descriptive label. The tools record it and write it to reports and generated configurations, but do not check it against anything else in the file.

## 1.5 Why ordinary programming languages are not enough

If you try to write the rules of an SoS in an ordinary programming language such as C++ or Python alone, you run into problems like these.

| What you want to say | How you would write it | What goes wrong |
|---|---|---|
| A robot must answer an assignment within 5 seconds | A comment, or a verbal agreement | It lives apart from the code, and the two drift apart |
| After 5 seconds it is a violation | An `if` statement somewhere | Which 5 seconds (from sending, or from receiving?) depends on the context of the code |
| A robot below 20% battery must not be given a new delivery | An `if` statement in each implementation | The same rule ends up scattered over many places |
| Check the same rule in two runtimes, Unity and Python | A separate implementation per language | One of them falls out of date |

Ordinary languages offer no direct way to write both at once: that the parts act independently, and that the whole must still keep certain rules.

## 1.6 What CADL adds

CADL is a description language for writing the rules that several systems must follow in one file, apart from their implementation code. The file is written in YAML.

| CADL key | What it describes | In robot delivery |
|---|---|---|
| `actors:` | The participants of the SoS and how autonomous they are | `DISPATCHER`, `ROBOT[1..N]`, `CUSTOMER[1..M]` |
| `contracts:` | Agreements between participants (assumptions and guarantees) | The delivery service-level agreement `DELIVERY_SLA` |
| `protocols:` | The procedure of an interaction between participants | assignment → acknowledgement → completion report |
| `lifecycle:` | The state machine one agreement goes through | `Proposed → Assigned → Accepted → Delivering → Completed` |
| `monitors:` | Rules watched while a contract is running | Has the battery fallen below 20%? |

From this one file the toolchain produces:

- **Check results**: `cadl check` finds mistakes in how the file is written, and `cadl verify` finds contradictions between assumptions and guarantees.
- **An intermediate representation (IR)**: `cadl sim-ir` turns the file into JSON. The other tools read the IR.
- **A diagram**: cadl-explorer draws the state machine from the IR.
- **Code**: `cadl codegen` generates Unity C# code from the IR.
- **A reference execution**: the Python reference runtime reads and interprets the IR directly; it is not generated.

Because all of these come from the same file, a rule is written in one place, and changing it means editing that file only.

### The structure layer and the norms layer

`actors:`, `contracts:` and `protocols:` in the table belong to the core of CADL and describe what exists in the SoS (structure). `lifecycle:` and `monitors:` are added by the **SoS-DSL extension** and describe what should happen (norms). If you only want to describe structure, the core is enough, so the parts that treat norms as first-class concepts are kept in an extension. A file that uses the extension declares it with `sos-dsl: 0.1` under `extensions:`.

Chapter 3 explains how both layers are written; Chapter 4 writes the structure layer and Chapter 5 the norms layer.

## Recap

An SoS is a set of independently operated systems that together do something none of them can do alone. Operational and managerial independence are the key criteria of Maier's five, and the strength of the central authority divides SoS into four types; the robot delivery of this textbook is modelled as Acknowledged. Rules written inside implementation code end up scattered and differ between runtimes. CADL avoids this by writing the rules in one file and producing checks, diagrams, code and executions from it.

## Further reading

You can go on with this textbook alone. For more background, see:

- International standards for SoS (ISO/IEC/IEEE 21839 [[4]](appendix-d-references.md), 21840 [[5]](appendix-d-references.md), 21841 [[2]](appendix-d-references.md), 15288 [[6]](appendix-d-references.md) and 42010 [[7]](appendix-d-references.md)), related research areas, and a reading list: "[Why SoS-DSL?](../handson/academic-background.md)" in the hands-on materials.
- Comparison with existing languages: [Chapter 3](../spec/03-comparison.md) of the specification.
