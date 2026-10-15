---
sidebar_position: 21
sidebar_label: "App. B — Using this textbook in a class"
title: "Appendix B — Using this textbook in a class"
---

# Appendix B — Using this textbook in a class

## Course at a glance

| Session | Title | Theme | Deliverable |
| --- | --- | --- | --- |
| 1 | **CADL Modelling** | Structure of an SoS | `my_delivery_v1.cadl` (structure only) |
| 2 | **DSL Design** | Norms: lifecycle and monitors | `my_delivery_v2.cadl` (with lifecycle + monitors) |
| 3 | **Visualisation** | Reading and comparing specs visually | A/B comparison report with screenshots |
| 4 | **Simulation** | Executing the spec, reading traces | Baseline trace + parameter sweep |
| 5 | **Improvement** | Using observations to refine the spec | `my_delivery_v3.cadl` + before/after report |

Each session is **~90 minutes in class** plus **~3 hours of homework**. The final deliverable across all five sessions is a **3-page report** (initial model / simulation comparison / reflection).

:::info[Repository availability]
Sessions 1–3 need only `cadl` and `cadl-explorer` (except the ★★★ Exercise 3.3, which takes a log from the simulator repository). Sessions 4–5 run the Python reference runtime that lives in `cadl-raspimouse-simulator` (see Step 0 of the [main textbook](index.md) for how to get it).
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

Every session has the same shape:

1. **Learning objectives** — what you should be able to do by the end.
2. **Prerequisites** — deliverables from the previous session, plus reading.
3. **Concept introduction** (~30 min) — the small amount of theory you need.
4. **Exercises** (~50 min) — graded ★ (basic) → ★★ (intermediate) → ★★★ (stretch).
5. **Wrap-up + homework** (~10 min) — what to bring to next session.

### Rubric (suggested)

The instructor can use this for grading; the student can self-check.

| Criterion | Weight |
| --- | --- |
| All ★ and ★★ exercises completed for every session | 40% |
| `cadl check` passes on every submitted CADL file | 20% |
| Final 3-page report demonstrates understanding (not just steps) | 30% |
| At least one ★★★ stretch exercise attempted | 10% |

---

## Final deliverable summary

By the end of Session 5, every student should have:

| Artefact | From session |
| --- | --- |
| `my_delivery_v1.cadl` (structure only) | 1 |
| `my_delivery_v2.cadl` (with lifecycle + monitors) | 2 |
| `session3_comparison.md` + 2 screenshots | 3 |
| `session4_baseline.ndjson` + parameter-sweep table | 4 |
| `my_delivery_v3.cadl` (improved) + 3-page final report | 5 |
| (Optional) `test_rewards.py` + reward execution code | 5 |
| (Optional) `violation_trace_view.py` Streamlit page | 3 |

All five (or seven, with optionals) live in a single course-deliverables repository.
