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
| 🧑‍🎓 **Learner** | Write CADL with your own hands and watch it run | [Why SoS-DSL?](academic-background.md) → [Code Walkthrough](code-walkthrough.md) (recommended before Course A) → [Course A](main-textbook.md) → B → C |
| 🧑‍🔬 **Researcher** | Already comfortable with the field; reuse the courses for your own SoS | Skim [Why SoS-DSL?](academic-background.md) then jump to [Course C](exercises.md#course-c) |

:::info[Repository availability]
`cadl-spec` (this specification and hands-on site), `cadl` (compiler / CLI), `cadl-explorer` (visualisation) and `cadl-raspimouse-simulator` (simulator) are public, so every step of Course A can be followed with public repositories. `mobility-sos-exercise`, used by Course B, is **not publicly available at present**.
:::

## 🗺️ First time here? A three-stage path

If this is your first contact with the toolchain, follow three stages:
**understand → practise with templates → build from scratch**. You are
never asked to write code cold.

| Stage | What you do | Materials | Rough time |
|---|---|---|---|
| **① Understand** | Grasp the overall structure (four repositories; the spec → IR → codegen flow) and what each key program does | [Why SoS-DSL?](academic-background.md) (skimming is fine), then the [Architecture & Code Walkthrough](code-walkthrough.md) (recommended before Course A) | 0.5–1 day |
| **② Practise with templates** | Copy the provided skeletons and fill them in while going once around the loop: write a contract → check → visualise → run the simulation | [Course A (main textbook)](main-textbook.md) Steps 0–6, then the ★ / ★★ exercises of [the exercises booklet](exercises.md) Part 1 | 1–2 weeks |
| **③ Build from scratch** | Add features with no template: new monitors and states (★★★), model a new domain (Part 2), or the LLM contract-generation loop (advanced exercise) | ★★★ / advanced exercise / Part 2 of [the exercises booklet](exercises.md) | as your interest dictates |

---

## 🧑‍💻 For learners — three courses

All courses share the **same CADL/SoS-DSL syntax**; only the domain and target runtime change.
Take them in order: A → B → C.

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

→ [Course A — Robot Delivery](main-textbook.md)

After finishing, practice with the extra exercises:
→ [Course A — Exercises](exercises.md) — 5 sessions, 19 exercises graded ★ to ★★★ (Part 1 of the exercises booklet)

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

### Course C — Model your own SoS (advanced)

| Item | Details |
|---|---|
| **Domain** | Anything you choose (food delivery, emergency response, power grid…) |
| **Target runtime** | Your choice. The suggested default is a lightweight Python discrete-event harness such as SimPy; Unity is not required |
| **Time** | A few hours to a few weeks (a self-directed mini-project) |
| **Prerequisite** | Course A + B |
| **You will learn** | Designing actors / contracts / lifecycle / monitors **on your own** for a new domain, then choosing your own runtime |

Course C is deliberately open-ended: the brief is an outline, not a step-by-step tutorial. It is **Part 2** of the exercises booklet:
→ [Exercises booklet — Part 2 (Course C)](exercises.md#course-c)

---


## 🚀 60-second smoke test (optional)

Just want to see something work first?

```bash
cd ~/program/cadl_repo
./scripts/sos_dsl_handson_e2e.sh
```

This assumes the setup in Step 0 of [Course A](main-textbook.md) is done (the `cadl` repository cloned as
`~/program/cadl_repo`). The script runs the end-to-end pipeline (parse → IR → codegen) on the bundled
`examples/sos_dsl_robot_delivery.cadl` and prints what to do next. Its last stage copies the generated C#
into the Unity project of `cadl-raspimouse-simulator` (expected next to `cadl_repo`); if you have not
cloned it yet, run `./scripts/sos_dsl_handson_e2e.sh --unity ""` instead, which stops after code generation.

After that, start with **[Why SoS-DSL?](academic-background.md)** and then **[Course A](main-textbook.md)**.

---

## Quick reference

| Role | Document |
|---|---|
| Background read (learner's first) | [Why SoS-DSL?](academic-background.md) |
| Course A — main textbook | [Robot Delivery](main-textbook.md) |
| Course A — extra problems | [Exercises](exercises.md) |
| Course B — mobility tutorial | [Urban Mobility](mobility-sos-tutorial.md) |
| Course C — your own SoS | [Exercises Part 2](exercises.md#course-c) |
