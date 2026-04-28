---
title: "PR Draft Templates"
description: "PR body templates used for the initial cadl-spec / cadl / cadl-explorer / raspimouse-unity / raspimouse-swarm-simulator submissions. Reusable as a starting point for future feature PRs."
draft: true
unlisted: true
---

# SoS-DSL Extension — PR Drafts (5 repositories)

All five PRs target the **`feature/sos-dsl`** branch on
`ertlnagoya/<repo>` and share a common motivation. Recommended merge
order (because of dependency direction):

1. `cadl-spec` — defines Appendix E
2. `cadl_repo` — implements parser / IR / Unity-C# codegen for the spec
3. `cadl-explorer` — visualizes IR produced by `cadl_repo`
4. `raspimouse-unity` (the `unity` submodule of raspimouse-swarm-simulator) — drops the generated C# + bridge components
5. `raspimouse-swarm-simulator` (parent) — bumps the unity submodule SHA and adds the Python reference runtime

> Each section below is a self-contained PR description. Copy / paste
> as the PR body, or use `gh pr create -F <file>` after splitting.

---

## 1) `ertlnagoya/cadl-spec` — `feature/sos-dsl`

### Title

`spec(sos-dsl): add Appendix E — SoS Contract DSL Extension v0.1-sos-ext`

### Body

```markdown
## Summary

Adds **Appendix E — SoS Contract DSL Extension (v0.1-sos-ext)** to the
language reference. The extension is **additive** to the existing
`contracts:` section (Appendix A.4): it introduces two new body keys,
`lifecycle:` and `monitors:`, that promote per-instance contract
execution state and runtime observation to first-class language
constructs.

Files: `docs/spec/appendix-e-sos-dsl.md` (291 lines).

## What this adds

| Sub-section | Content |
| --- | --- |
| E.1 | Motivation — what the existing class-level contract spec cannot say |
| E.2 | Conceptual layering vs. existing contract semantics |
| E.3 | EBNF additions to Appendix A.4 |
| E.4 | Static-semantic checks L-1..L-4 / M-1..M-3 |
| E.5 | Informative dynamic semantics |
| E.6 | Robot-delivery example excerpt |
| E.7 | Sim-IR shape and normalization rules (5s → 5000 ms etc.) |
| E.8 | Codegen contract; reward/sanction *execution* out of scope |
| E.9 | Backward compatibility |

## Backward compatibility

Files written against unmodified CADL v0.1 remain valid. Files using
the extension SHOULD declare `extensions: [sos-dsl: 0.1]`. Processors
that do not implement the extension MUST NOT reject such files.

## Companion PRs

- `ertlnagoya/cadl#feature/sos-dsl` — parser/IR/codegen implementation
- `ertlnagoya/cadl-explorer#feature/sos-dsl` — Lifecycle View
- `ertlnagoya/raspimouse-unity#feature/sos-dsl` — generated C# in-tree
- `ertlnagoya/raspimouse-swarm-simulator#feature/sos-dsl` — Python ref runtime + submodule bump
```

---

## 2) `ertlnagoya/cadl` — `feature/sos-dsl`

### Title

`feat(sos-dsl): parser, AST, Sim-IR, and Unity-C# codegen for Appendix E`

### Body

```markdown
## Summary

Implements the **SoS-DSL extension** specified in `cadl-spec`'s new
Appendix E. The extension is purely additive — **403 existing tests
still pass with no changes** — and a CADL file without `lifecycle:` /
`monitors:` parses, lowers, and codegen's exactly as before.

Three commits, building bottom-up:

1. **Parser + AST** (`b9d97bc`) — `LifecycleSpec`, `LifecycleTransition`,
   `OnViolationSpec`, `MonitorDef`, `SamplingSpec`, `OnMatchSpec`;
   `ContractDef` gains `lifecycle` and `monitors` fields. Parser
   normalises `from:` scalar → list, `deadline 5s` → `deadline_ms 5000`,
   `sampling: periodic(500ms)` → `{kind, period_ms}`. PyYAML's YAML 1.1
   quirk where `on:` is parsed as boolean `True` is worked around in
   `_yaml_on_key()`.

2. **Sim-IR** (`5661a02`) — `LifecycleSpecIR`, `LifecycleTransitionSpec`,
   `MonitorSpecIR`. `_lower_lifecycle` / `_lower_monitor` flatten the
   nested `on_violation` / `on_match` AST into denormalized fields
   suitable for direct `asdict() → JSON` consumption by cadl-explorer
   and the runtimes.

3. **Unity-C# codegen** (`0afe315`) — new top-level target
   `unity-csharp` (`cadl codegen --target unity-csharp …`). Emits a
   self-contained `Runtime/` (Severity, ContractEvent, EventBus,
   PredicateEvaluator, ContractRuntime — constant per generation) and
   `Generated/<Cls>{State,Contract,Monitors}.cs`. The C# evaluator
   mirrors the Python reference runtime's semantics one-to-one so the
   runtime tests in `raspimouse-swarm-simulator` apply transitively.

## New tests

| File | Tests | Coverage |
| --- | --- | --- |
| `tests/test_sos_dsl_extension.py` | 10 | parser, normalization, static checks, backward compat |
| `tests/test_sim_ir_sos_dsl.py` | 7 | IR shape, JSON-friendliness, plain-contract pass-through |
| `tests/test_unity_csharp_codegen.py` | 19 | file set, naming, state enum, transition emission, deadline arming, monitor periods, severity, namespace, plain-contract skip |

`PYTHONPATH=src python3 -m pytest tests/` → **+36 new tests, all pass**.

## End-to-end

`examples/sos_dsl_robot_delivery.cadl` exercises every new construct
(5 lifecycle states, deadline + on_violation, three monitors with
mixed periods and severities, `from:` as a state set). The same file
flows through:

```
.cadl  →  parse + lower  →  *.ir.json (245 lines)
                         →  cadl codegen --target unity-csharp
                            → 8 .cs files (770 lines)
```

## Companion PRs

See `cadl-spec#feature/sos-dsl` for the language reference, and
`cadl-explorer` / `raspimouse-unity` / `raspimouse-swarm-simulator` for
downstream consumers.
```

---

## 3) `ertlnagoya/cadl-explorer` — `feature/sos-dsl`

### Title

`feat(sos-dsl): add Lifecycle View page for the SoS-DSL extension`

### Body

```markdown
## Summary

Adds a Streamlit multipage page that renders the per-instance contract
lifecycle introduced by the SoS-DSL extension (cadl-spec Appendix E).

Single commit (`3da71c9`). Five new files; no edits to existing code.

## What's new

- `cadl_sim/sos_dsl/lifecycle_view.py` — dependency-free DOT renderer.
  - `LifecycleView` dataclass + `build_lifecycle_view()` extractor.
  - `lifecycle_to_dot()`: initial state = doublecircle; terminals
    dashed (Completed=green, Violated=red, Terminated=grey); deadline
    edges include `Δ 5s` label; `on_violation` lifts as dashed red
    secondary edges; state-set `from:` expands to multiple edges.
  - `monitors_summary()`: projects monitors into a small list of
    dicts for `st.dataframe`; periodic sampling renders nicely
    (`periodic(500ms)`).

- `pages/SoS_DSL_Lifecycle.py` — Streamlit page. File-uploader +
  bundled-example dropdown. Two-column layout (graph + metadata)
  with a monitors table beneath. Uses `st.graphviz_chart`, so no
  new dependency on top of stock Streamlit.

- `cadl_sim/sos_dsl/examples/sos_dsl_robot_delivery.ir.json` —
  bundled IR sample (output of `cadl sim-ir` from
  `ertlnagoya/cadl#feature/sos-dsl`).

- `tests/test_sos_dsl_lifecycle_view.py` — 11 tests covering
  extraction, DOT invariants, and monitors summary.

## Verifying

```bash
PYTHONPATH=. python -m pytest tests/test_sos_dsl_lifecycle_view.py -v
# 11 passed
```

then `streamlit run app.py` and pick **SoS_DSL_Lifecycle** from the
sidebar.

## Companion PRs

Depends on the IR shape defined in `ertlnagoya/cadl-spec` Appendix E
and emitted by `ertlnagoya/cadl#feature/sos-dsl`.
```

---

## 4) `ertlnagoya/raspimouse-unity` — `feature/sos-dsl`

### Title

`feat(SoSDsl): drop generated SoS-DSL contract runtime + Pilot bridge`

### Body

```markdown
## Summary

Adds the SoS-DSL contract runtime to the Unity project under
`Assets/Scripts/SoSDsl/`, plus a thin observation-only bridge that
plugs into the existing `Pilot_CSoS` so the FCFS delivery flow drives
contract instances without any change to the pilot's logic.

Two commits:

- `a2636cc0` — generated runtime + standalone demo harness
- `e89a6be0` — Pilot↔ContractRuntime bridge

## Layout

```
Assets/Scripts/SoSDsl/
  Runtime/      # regenerated by `cadl codegen --target unity-csharp`
    Severity.cs
    ContractEvent.cs
    EventBus.cs
    PredicateEvaluator.cs       # mirrors Python runtime semantics
    ContractRuntime.cs

  Generated/    # one file per CADL contract (regenerated)
    DeliverySlaState.cs
    DeliverySlaContract.cs
    DeliverySlaMonitors.cs

  Demo/         # hand-written, NOT regenerated
    DeliveryContractDemo.cs    # 3 fake scenarios for smoke tests
    ContractRuntimeHost.cs     # scene-wide singleton
    PilotContractBridge.cs     # observes Pilot_CSoS, posts events
    README.md
```

Namespaces: `CADL.SosDsl` (runtime + generated) and `CADL.SosDsl.Demo`
(harness).

## Pilot_CSoS change (1 line)

```csharp
public bool HasActiveDelivery => hasActiveDelivery;
```

A read-only accessor. The bridge uses it to translate state changes
into contract events without reflection or any modification to the
pilot's existing FCFS / wandering / NATS logic.

## State → contract event mapping (the bridge)

| Pilot_CSoS state change | Contract event posted |
| --- | --- |
| `HasActiveDelivery` flips false → true | `DISPATCHER -> ROBOT[i] : route_assignment` then `ROBOT[i] -> DISPATCHER : ack(accepted)` |
| First Update while delivering | `ROBOT[i].status == InTransit` |
| `DeliveryCount` increments | `ROBOT[i].status == Delivered`, then `robot-{id}-{n+1}` opens |

## Smoke check

For the standalone demo (no arbitrator running), drop a single
GameObject, attach `DeliveryContractDemo`, set `Scenario` to
`Happy` / `Late` / `Battery`, press Play. Console output mirrors the
Python reference runtime's NDJSON trace one-to-one.

For the wired demo, attach `ContractRuntimeHost` to one scene-root
GameObject and `PilotContractBridge` to each robot that already has a
`Pilot_CSoS`.

## Companion PRs

- `ertlnagoya/cadl-spec#feature/sos-dsl` — Appendix E (language reference)
- `ertlnagoya/cadl#feature/sos-dsl` — generator that produced
  `Runtime/` and `Generated/`
- `ertlnagoya/raspimouse-swarm-simulator#feature/sos-dsl` — submodule
  bump + Python reference runtime
```

---

## 5) `ertlnagoya/raspimouse-swarm-simulator` — `feature/sos-dsl`

### Title

`feat(sos-dsl): Python contract runtime + bump unity submodule`

### Body

```markdown
## Summary

Two layers in one PR:

1. A **stdlib-only Python reference runtime** under
   `cadl/runtime/` that consumes the Sim-IR JSON emitted by
   `ertlnagoya/cadl#feature/sos-dsl` (Appendix E) and drives one
   `DeliverySlaContract` instance through Proposed → Assigned →
   Accepted → Delivering → Completed/Violated, emitting an NDJSON
   trace that the Lifecycle View consumes.

2. A **submodule bump** of `unity/` to
   `ertlnagoya/raspimouse-unity#feature/sos-dsl`, which carries the
   generated C# runtime, the standalone demo harness, and the
   Pilot↔contract bridge.

## What's in `cadl/runtime/`

- `engine.py` (671 lines) — `ContractRuntime` + `StateMachineEngine` +
  `TimerService` + `MonitorEngine` + a small predicate evaluator.
  - Lifecycle transitions, deadline-driven `on_violation` lifts,
    periodic + event-driven monitors, terminal-state close.
  - Predicate evaluator: `<`, `<=`, `>`, `>=`, `==`, `!=`, `AND`,
    `OR`, `NOT`, `IN`, dotted member access, list literals.
    Bare unresolved identifiers act as enum-like literals so
    `state == Assigned` works without quotes; function calls
    fail-safe to false; parse errors yield false.

- `demo_delivery.py` — three end-to-end scenarios (`happy` / `late`
  / `battery`) producing the reference NDJSON trace.

- `tests/test_engine.py` (14 tests, all pass) — predicate forms,
  lifecycle happy path, deadline-driven on_violation lift, deadline
  cancellation on early ack, periodic monitor lift, log persistence.

- `README.md` — pipeline overview and v0.1 scope.

## Why both in one PR

The submodule bump and the Python runtime share one design and one
NDJSON event shape. Reviewing them together makes it easier to see
that the C# runtime in the unity submodule and the Python runtime
agree on semantics (the predicate evaluator and the event log shape
are identical by design — see Appendix E and the cadl PR).

## Notes

- Reward / sanction **execution** is out of scope for v0.1. Events
  are recorded; actuation is left to a future revision.
- `__pycache__/` exclusion was added to `.gitignore` in the chore
  commit (`47b2454`).

## Companion PRs

- `ertlnagoya/cadl-spec#feature/sos-dsl` — language reference
- `ertlnagoya/cadl#feature/sos-dsl` — generator
- `ertlnagoya/cadl-explorer#feature/sos-dsl` — visualizer
- `ertlnagoya/raspimouse-unity#feature/sos-dsl` — Unity-side runtime + bridge
```

---

## How to file these

Recommended (manual, with `gh`):

```bash
# Save each section above as <repo>.md, then:
cd ~/program/cadl-spec
gh pr create -B main -H feature/sos-dsl \
    -t "spec(sos-dsl): add Appendix E — SoS Contract DSL Extension v0.1-sos-ext" \
    -F path/to/cadl-spec.md

cd ~/program/cadl_repo
gh pr create -B master -H feature/sos-dsl \
    -t "feat(sos-dsl): parser, AST, Sim-IR, and Unity-C# codegen for Appendix E" \
    -F path/to/cadl_repo.md

cd ~/program/cadl-explorer
gh pr create -B main -H feature/sos-dsl \
    -t "feat(sos-dsl): add Lifecycle View page for the SoS-DSL extension" \
    -F path/to/cadl-explorer.md

cd ~/program/raspimouse-swarm-simulator/unity
gh pr create -B main -H feature/sos-dsl \
    -t "feat(SoSDsl): drop generated SoS-DSL contract runtime + Pilot bridge" \
    -F path/to/raspimouse-unity.md

cd ~/program/raspimouse-swarm-simulator
gh pr create -B main -H feature/sos-dsl \
    -t "feat(sos-dsl): Python contract runtime + bump unity submodule" \
    -F path/to/raspimouse-swarm-simulator.md
```

Note the **`-B master` for `cadl_repo`** (its default branch is
`master`, not `main`).

If `gh` is not installed (or not authenticated), open each repository
in the browser, click **Compare & pull request** on the
`feature/sos-dsl` banner, paste the corresponding section above, and
file.
