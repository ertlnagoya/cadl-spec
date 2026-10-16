---
sidebar_position: 21
sidebar_label: "App. B — Using this textbook in a class"
title: "Appendix B — Using this textbook in a class"
---

# Appendix B — Using this textbook in a class

This appendix shows how to teach Chapters 4–9 as a five-session class (or a three-session one). Students who have read Chapters 1–3 and done the setup of Section 2.4 can start with Session 1.

## B.1 Course at a glance

| Session | Chapter | Title | Theme | Deliverable |
| --- | --- | --- | --- | --- |
| 1 | [4](04-structure.md) | **CADL Modelling** | Structure of an SoS | `my_delivery_v1.cadl` (structure only) |
| 2 | [5](05-norms.md) | **DSL Design** | Norms: lifecycle and monitors | `my_delivery_v2.cadl` (with lifecycle + monitors) |
| 3 | [6](06-visualise.md) | **Visualisation** | Reading and comparing specs visually | A/B comparison report with screenshots |
| 4 | [7](07-codegen-runtime.md) (and [8](08-unity.md)) | **Simulation** | Executing the spec, reading traces | Baseline trace + parameter sweep |
| 5 | [9](09-improve.md) | **Improvement** | Using observations to refine the spec | `my_delivery_v3.cadl` + before/after report |

Chapter 8 (Unity) is optional in a class: its only exercise, 8.1 (★★★), belongs to Session 4.

Each session is **~90 minutes in class** plus **~3 hours of homework**. The final deliverable across all five sessions is a **3-page report** (initial model / simulation comparison / reflection).

:::info[Repository availability]
Sessions 1–3 need only `cadl` and `cadl-explorer` (except the ★★★ Exercise 6.3, which takes a log from the simulator repository). Sessions 4–5 run the Python reference runtime that lives in `cadl-raspimouse-simulator` (see [Section 2.4](02-toolchain-setup.md) for how to get it).
:::

### Compact 3-session version

If you only have three sessions (e.g., a short module, an intensive weekend), use this mapping:

| 3-session | Combines |
| --- | --- |
| Session A | Sessions 1 + 2 (Modelling + DSL design) |
| Session B | Sessions 3 + 4 (Visualisation + Simulation) |
| Session C | Session 5 (Improvement) |

The exercises stay the same; you simply move the optional / "stretch" exercises to homework.

### Per-session format

Every session has the same shape, and each part is found in the same place of its chapter:

1. **Learning objectives** — what you should be able to do by the end (Section *N*.1, "What you'll learn").
2. **Prerequisites** — deliverables from the previous session, plus reading ("Before the session" at the end of the chapter).
3. **Concept introduction** (~30 min) — the small amount of theory you need (the subsection of "Background").
4. **Exercises** (~50 min) — graded ★ (basic) → ★★ (intermediate) → ★★★ (stretch) (the "Exercises" section).
5. **Wrap-up + homework** (~10 min) — what to bring to next session ("Wrap-up and homework" at the end of the chapter).

The procedure of each chapter (the former Course A steps, about 15 minutes each) can be done before the session as preparation or at its start.

### Rubric (suggested)

The instructor can use this for grading; the student can self-check.

| Criterion | Weight |
| --- | --- |
| All ★ and ★★ exercises completed for every session | 40% |
| `cadl check` passes on every submitted CADL file | 20% |
| Final 3-page report demonstrates understanding (not just steps) | 30% |
| At least one ★★★ stretch exercise attempted | 10% |

---

## B.2 Final deliverable summary

By the end of Session 5, every student should have:

| Artefact | From session | Exercise |
| --- | --- | --- |
| `my_delivery_v1.cadl` (structure only) | 1 | 4.1 |
| `my_delivery_v2.cadl` (with lifecycle + monitors) | 2 | 5.1–5.2 |
| `session3_comparison.md` + 2 screenshots | 3 | 6.2 |
| `session4_baseline.ndjson` + parameter-sweep table | 4 | 7.1–7.3 |
| `my_delivery_v3.cadl` (improved) + 3-page final report | 5 | 9.2, 9.4 |
| (Optional) `test_rewards.py` + reward execution code | 5 | 9.3 |
| (Optional) `violation_trace_view.py` Streamlit page | 3 | 6.3 |

All five (or seven, with optionals) live in a single course-deliverables repository.
