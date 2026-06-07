---
sidebar_position: 1
sidebar_label: "Hands-on Index"
title: "Hands-on Index"
---

# Hands-on Index

This section gathers all CADL / SoS-DSL hands-on materials.
The materials fall into **three tracks**. Pick the one that matches your role.

| Your role | What you do | Where to start |
|---|---|---|
| 🧑‍🎓 **Learner** | Write CADL with your own hands and watch it run | **Why SoS-DSL? → Course A → Course B → Course C** |
| 🧑‍🏫 **Instructor** | Design a PBL-style course | **PBL Course Design** |
| 🧑‍🔬 **Researcher** | Already comfortable with the field; reuse the courses for your own SoS | Skim **Why SoS-DSL?** then jump to **Course C** |

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
| **Time** | 90 min (15 min × 6 steps) |
| **Prerequisite** | None — open to CADL beginners |
| **You will learn** | CADL syntax / actors / contract / lifecycle / monitors / cadl-explorer / Unity integration |

→ [Course A — Robot Delivery](main-textbook.md)

After finishing, practice with the extra exercises:
→ [Course A — Exercises](exercises.md) — 5 graded problems (★ to ★★★)

### Course B — Urban Mobility (applied)

| Item | Details |
|---|---|
| **Domain** | Taxi-fleet System of Systems |
| **Target runtime** | SUMO (traffic simulator) |
| **Time** | 60–90 min (with 5 visualization checkpoints) |
| **Prerequisite** | Course A |
| **You will learn** | Code generation for a different runtime / contract compliance checking / **sensitivity analysis (edit CADL, re-evaluate)** |

→ [Course B — Urban Mobility](mobility-sos-tutorial.md)

> Contrast with Course A: see what happens when you swap the domain *and* the codegen target while keeping the CADL syntax untouched.

### Course C — Model your own SoS (advanced)

| Item | Details |
|---|---|
| **Domain** | Anything you choose (food delivery, emergency response, power grid…) |
| **Target runtime** | Your choice |
| **Time** | A few hours to a few weeks (mini research project) |
| **Prerequisite** | Course A + B |
| **You will learn** | Designing actors / contracts / lifecycle / monitors **on your own** for a new domain, then choosing your own runtime |

The brief is in **Part 2** of the exercise booklet:
→ [Course A — Exercises (Part 2)](exercises.md)

---

## 🧑‍🏫 For instructors — PBL Course Design

A 5-session syllabus covering learning objectives, common student pitfalls,
research connections, and extension topics.

→ [PBL Course Design (Instructor)](pbl-course-design.md)

> This is a **syllabus / instructor guide**, not a learner-facing tutorial.

---

## 🚀 60-second smoke test (optional)

Just want to see something work first?

```bash
cd ~/program/cadl_repo
./scripts/sos_dsl_handson_e2e.sh
```

This runs the end-to-end pipeline (parse → IR → codegen) on the bundled
`examples/sos_dsl_robot_delivery.cadl` and prints what to do next.

After that, start with **[Why SoS-DSL?](academic-background.md)** and then **[Course A](main-textbook.md)**.

---

## Quick reference

| Role | Document |
|---|---|
| Background read (learner's first) | [Why SoS-DSL?](academic-background.md) |
| Course A — main textbook | [Robot Delivery](main-textbook.md) |
| Course A — extra problems | [Exercises](exercises.md) |
| Course B — mobility tutorial | [Urban Mobility](mobility-sos-tutorial.md) |
| Course C — your own SoS | See Exercises Part 2 |
| Instructor's syllabus | [PBL Course Design](pbl-course-design.md) |
