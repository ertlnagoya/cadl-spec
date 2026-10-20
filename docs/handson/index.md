---
sidebar_position: 1
sidebar_label: "Hands-on Index"
title: "Hands-on Index"
---

# Hands-on Index

This section gathers all CADL / SoS-DSL hands-on materials.
The materials fall into **two tracks**. Pick the one that matches your role.

| Your role | What you do | Where to start |
|---|---|---|
| 🧑‍🎓 **Learner** | Write CADL with your own hands and watch it run | [Course A (Textbook)](../textbook/index.md), which explains the background and the architecture itself → B / D → C |
| 🧑‍🔬 **Researcher** | Already comfortable with the field; reuse the courses for your own SoS | Skim [Why SoS-DSL?](academic-background.md) then jump to [Course C](own-sos.md) |

:::info[Repository availability]
`cadl-spec` (this specification and hands-on site), `cadl` (compiler / CLI), `cadl-explorer` (visualisation) and `cadl-raspimouse-simulator` (simulator) are public, so every step of Course A can be followed with public repositories. `cadl-robot-town`, used by Course D, is public too. `cadl-mobility-sos-exercise`, used by Course B, is a private repository and **not publicly available at present**.
:::

## 🗺️ First time here? A three-stage path

If this is your first contact with the toolchain, follow three stages:
**understand → practise with templates → build from scratch**. You are
never asked to write code cold.

| Stage | What you do | Materials | Rough time |
|---|---|---|---|
| **① Understand** | Grasp the overall structure (four repositories; the spec → IR → codegen flow) and what each key program does | Chapters 1–3 of the [Textbook](../textbook/index.md) (the SoS background, the toolchain and its four repositories, the essentials of CADL); [Why SoS-DSL?](academic-background.md) for more background | 0.5–1 day |
| **② Practise with templates** | Copy the provided skeletons and fill them in while going once around the loop: write a contract → check → visualise → run the simulation | [Course A (Textbook)](../textbook/index.md) Chapters 1–8, then the ★ / ★★ exercises at the end of Chapters 4–9 | 1–2 weeks |
| **③ Build from scratch** | Add features with no template: new monitors and states (★★★), model a new domain (Course C), or the LLM contract-generation loop (advanced exercise) | ★★★ exercises and Chapter 10 of the [Textbook](../textbook/index.md), then [Course C](own-sos.md) | as your interest dictates |

---

## 🧑‍🎓 For learners — four courses

All courses share the **same CADL/SoS-DSL syntax**; only the domain and target runtime change.
Start with A. B and D are independent applied courses that both build on A; take either or both.
Finish with C.

### Before you start: Why SoS-DSL?

A short, plain-language intro to **what an SoS is**, **why ordinary programming languages
don't capture it well**, and **what CADL adds on top**. Read this once before Course A —
it gives you the vocabulary the courses will rely on.

→ [Why SoS-DSL?](academic-background.md)

### Course A — Robot Delivery (foundations)

| Item | Details |
|---|---|
| **Domain** | Warehouse robot package delivery |
| **Target runtime** | Unity C# |
| **Time** | About 95 min (5 min setup + 15 min × 6 steps) |
| **Prerequisite** | None — open to CADL beginners |
| **You will learn** | CADL syntax / actors / contract / lifecycle / monitors / cadl-explorer / Unity integration |

Course A is a self-contained **Textbook** with its own navigation tab. Its Chapters 4–9 end with the exercises of a five-session class (19 exercises graded ★ to ★★★).

→ [Textbook — Course A: Robot Delivery](../textbook/index.md)

### Course B — Urban Mobility (applied)

| Item | Details |
|---|---|
| **Domain** | Taxi-fleet System of Systems |
| **Target runtime** | SUMO (traffic simulator) |
| **Time** | 60–90 min (with 5 visualization checkpoints) |
| **Prerequisite** | Course A |
| **You will learn** | Code generation for a different runtime / checking simulation results against the contract's `guarantee` clauses (deadlines and monitors are listed but not evaluated in SUMO) / **sensitivity analysis (edit CADL, re-evaluate)** |

→ [Course B — Urban Mobility](mobility-sos-tutorial.md)

> Contrast with Course A: see what happens when you swap the domain *and* the codegen target while keeping the CADL syntax untouched.

### Course D — Robot Town (applied)

| Item | Details |
|---|---|
| **Domain** | Three delivery companies sharing the road network of the Raspberry Pi Mouse simulator |
| **Target runtime** | A small Python simulation; norms judged by the Course A reference runtime (no Unity, no SUMO) |
| **Time** | 90–120 min |
| **Prerequisite** | Course A |
| **You will learn** | **Amending a contract while the system runs**: a council (rule-based or an LLM) proposes new versions of the rules, which are adopted only through verification, a constitution, measured improvement and a vote; operating-mode switching with a safety invariant; how self-interested votes and a badly chosen objective steer the rules |

→ [Course D — Robot Town](robot-town-tutorial.md)

### Course C — Model your own SoS (advanced)

| Item | Details |
|---|---|
| **Domain** | Anything you choose (food delivery, emergency response, power grid…) |
| **Target runtime** | Your choice. The suggested default is a lightweight Python discrete-event harness such as SimPy; Unity is not required |
| **Time** | A few hours to a few weeks (a self-directed mini-project) |
| **Prerequisite** | Course A, plus Course B or D |
| **You will learn** | Designing actors / contracts / lifecycle / monitors **on your own** for a new domain, then choosing your own runtime |

Course C is deliberately open-ended: the brief is an outline, not a step-by-step tutorial. → [Course C — Your own SoS](own-sos.md)

---


## 🚀 60-second smoke test (optional)

Just want to see something work first?

```bash
cd ~/program/cadl_repo
./scripts/sos_dsl_handson_e2e.sh
```

This assumes the setup in [Section 2.4 of the Textbook](../textbook/02-toolchain-setup.md) is done (the `cadl` repository cloned as
`~/program/cadl_repo`). The script runs the end-to-end pipeline (parse → IR → codegen) on the bundled
`examples/sos_dsl_robot_delivery.cadl` and prints what to do next. Its last stage copies the generated C#
into the Unity project of `cadl-raspimouse-simulator` (expected next to `cadl_repo`); if you have not
cloned it yet, run `./scripts/sos_dsl_handson_e2e.sh --unity ""` instead, which stops after code generation.

After that, start with **[Why SoS-DSL?](academic-background.md)** and then **[Course A (Textbook)](../textbook/index.md)**.

---

## Quick reference

| Role | Document |
|---|---|
| Background read (learner's first) | [Why SoS-DSL?](academic-background.md) |
| Course A — Textbook (with exercises) | [Robot Delivery](../textbook/index.md) |
| Course B — mobility tutorial | [Urban Mobility](mobility-sos-tutorial.md) |
| Course D — rules a community amends | [Robot Town](robot-town-tutorial.md) |
| Course C — your own SoS | [Your own SoS](own-sos.md) |
