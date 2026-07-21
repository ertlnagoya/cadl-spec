---
sidebar_position: 5
sidebar_label: "Course B — Urban Mobility"
title: "Course B — Urban Mobility (CADL × SUMO)"
---

# Course B — Urban Mobility: Designing an SoS with CADL × SUMO

> ⬅ Back to Course A → [Course A — Robot Delivery](main-textbook.md)

> **Audience**: Students who have completed the
> [main hands-on textbook](main-textbook.md) (CADL/SoS-DSL basics).
>
> **Time**: 60–90 minutes.
>
> **You will leave with**: Your own `mobility_sos.cadl` describing a
> taxi-fleet SoS, a SUMO simulation that actually runs, and a
> compliance report against your CADL contract.

---

## 0. What this tutorial demonstrates

The main textbook used a robot-delivery SoS as the running example and
generated **Unity C#**. This tutorial swaps both axes:

- **Domain**: urban mobility (taxis + passengers + a matching platform)
- **Target runtime**: **SUMO** (Simulation of Urban MObility)

The CADL/SoS-DSL syntax is unchanged — that is the whole point.

```
mobility_sos.cadl
       │
       ├─ cadl check                    ← type-check
       ├─ cadl sim-ir   ─► IR JSON
       │                       │
       │                       ├─► cadl-explorer (Lifecycle View)
       │                       │
       │                       └─► cadl_to_sumo.py    ← ★ codegen
       │                              ├─► SUMO sumocfg
       │                              └─► contract constraints JSON
       │
       └─ (demand CSV) ─► generate_sumo_routes.py
                                  ↓
                          SUMO ─► tripinfo.xml
                                  ↓
                          analyze_results.py (contract compliance)
                                  ↓
                       Iterate: revise CADL guarantees / deadlines
```

The reference implementation lives at
[`ertlnagoya/mobility-sos-exercise`](https://github.com/ertlnagoya/mobility-sos-exercise)
(or, for this hands-on, your local `mobility-sos-exercise/` checkout).

---

## 1. Setup

Same as the main textbook for `cadl_repo` and `cadl-explorer`.
The new requirement is **SUMO**:

```bash
# Get the exercise repository (skip the clone if it was distributed to you locally)
cd ~/program
git clone https://github.com/ertlnagoya/mobility-sos-exercise

# Exercise venv
cd mobility-sos-exercise
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# SUMO (pip is the simplest cross-platform way)
pip install eclipse-sumo

# CADL compiler & cadl-explorer: same as the main textbook.
```

> If `z3-solver` fails to build during `pip install -e .`, fall back
> to `pip install --no-deps -e .` followed by `pip install lark pyyaml`.
> This tutorial only needs `cadl check` and `cadl sim-ir`, neither of
> which uses Z3.

---

## 2. Read the structure (5 min)

`cadl/mobility_sos.cadl`:

```yaml
sos:
  name: "MobilitySoS"
  type: Acknowledged
  actors:
    - id: PLATFORM
      autonomy: low                # central matching authority
    - id: "TAXI[1..N]"
      autonomy: high               # self-interested fleet
    - id: "PASSENGER[1..M]"
      autonomy: medium             # service requesters
```

The same **Acknowledged** SoS type as the robot-delivery example.

:::tip 🔍 Visualization Checkpoint 0 — Structure layer only
So far you've only looked at the **structure** (actors and a contract skeleton).
`cadl check` already passes and `cadl sim-ir` emits an IR, but
**`institution.contracts[0].lifecycle == null`** — confirm it:

```bash
cd mobility-sos-exercise
cadl check  cadl/mobility_sos.cadl        # → Type check passed: cadl/mobility_sos.cadl
cadl sim-ir cadl/mobility_sos.cadl --format json \
   | python3 -c "import sys, json; d=json.load(sys.stdin); print('lifecycle =', d['institution']['contracts'][0]['lifecycle'])"
```

Upload this IR to cadl-explorer and you'll just see **"No lifecycle defined"**.
That gap — structure alone cannot express deadlines, violations, or consequences — is what §3 fills.
:::

---

## 3. Read the contract (10 min)

```yaml
contracts:
  - id: RIDE_SLA
    parties: [PLATFORM, "TAXI[*]", "PASSENGER[*]"]
    guarantee:
      - "waiting_time <= 300s"
      - "ride_time <= 1800s"
    lifecycle:
      states: [Requested, Matched, Accepted, PickedUp, Delivered,
               Violated, Cancelled, Terminated]
      initial: Requested
      terminal: [Delivered, Violated, Cancelled, Terminated]
      transitions:
        - id: match
          from: Requested
          to:   Matched
          deadline: 30s
          on_violation: { transition: Violated, severity: Major }
        - id: accept
          from: Matched
          to:   Accepted
          deadline: 5s
          on_violation: { transition: Violated, severity: Major }
    monitors:
      - id: low_battery_guard
        observe: "TAXI[i].battery"
        sampling: periodic(500ms)
        rule: "TAXI[i].battery < 15 AND state == Accepted"
        on_match: { transition: Violated, severity: Critical }
```

### Exercise 3-1

1. If the platform fails to dispatch within 31 seconds, what state does the contract enter?
2. Whose responsibility is the `accept` deadline?
3. State, in one sentence, when `low_battery_guard` fires.

---

## 4. Visualize (10 min) — 🔍 Visualization Checkpoint 1 (post-DSL)

In §3 we added `lifecycle:` and `monitors:` to the CADL source.
Now cadl-explorer renders a **meaningful** picture for the first time.

```bash
cd mobility-sos-exercise
cadl check  cadl/mobility_sos.cadl
cadl sim-ir cadl/mobility_sos.cadl --format json > cadl/mobility_sos.ir.json

cd ~/program/cadl-explorer
streamlit run app.py
# Browser opens at http://localhost:8501
# Sidebar → "SoS_DSL_Lifecycle" → drag mobility_sos.ir.json into the uploader
```

You should see something like:

![Mobility SoS Lifecycle](/img/mobility_sos_lifecycle.png)

| Visual | Meaning |
|---|---|
| Double circle = `Requested` | initial state |
| Dashed grey = `Delivered`/`Cancelled`/`Terminated` | normal terminals |
| Dashed pink = `Violated` | violation terminal |
| Solid edge with `Δ 30s` / `Δ 5s` | deadline-bearing transitions |
| Red dashed edge with `violation Major` | `on_violation` lift |

:::info This pattern repeats throughout the tutorial
You will run **edit CADL → `cadl sim-ir` → reload cadl-explorer** at every milestone:
after the structure layer, after the DSL layer, after codegen, after sensitivity edits.
The whole point of the tutorial is to internalize that **the picture changes in lockstep with the code**.
:::

### Exercise 4-1

Change the `match` deadline from `30s` to `60s`, regenerate the IR,
and reload the page. The edge label should update to `Δ 60s`.
**Once verified, revert it back to 30s before continuing** (later sections assume 30s).

---

## 5. Generate SUMO code (10 min)

`scripts/cadl_to_sumo.py` is the SUMO counterpart to
`cadl codegen --target unity-csharp`: it consumes the IR JSON and
emits SUMO configuration plus a contract-constraints JSON.

```bash
python scripts/cadl_to_sumo.py
```

Produces:

- `sumo/config/midtown.cadl.sumocfg` — `step-length` from
  `environment.time_step_ms`, `end` from CSV last depart + `ride_time` guarantee.
- `sumo/cadl_constraints.json` — `analyze_results.py` reads this for
  per-trip compliance checking.

:::tip 🔍 Visualization Checkpoint 2 — Post-codegen (CADL source is unchanged)
`cadl_to_sumo.py` only **reads** the IR and **writes** SUMO config files; it never
modifies `cadl/mobility_sos.cadl`. The `lifecycle:` and `monitors:` blocks are
byte-for-byte identical to what they were in §3.
Reload cadl-explorer now and you should see **the exact same picture** as in §4.

That invariance is what lets us treat CADL as the **single source of truth**:
target-specific generators consume the spec without mutating it.
:::

---

## 6. Run SUMO (10 min)

```bash
python scripts/prepare_sample_data.py
netconvert -c sumo/network/midtown.netccfg     # one time
python scripts/generate_sumo_routes.py
python scripts/run_sumo.py                     # add --gui to visualize
```

This populates `results/tripinfo.xml` and `results/summary.xml`.

---

## 7. Check contract compliance (10 min)

```bash
python scripts/analyze_results.py
```

Expected excerpt:

```text
=== Contract compliance against cadl_constraints.json ===

  contract: RIDE_SLA
    -- guarantees --
      [OK          ] waiting_time <= 300s  (tripinfo.waitingTime)
      [OK          ] ride_time <= 1800s  (tripinfo.duration)
    -- deadlines (lifecycle) --
      [SKIP        ] match      ≤ 30.0s  (matching event not modeled in SUMO yet)
      [SKIP        ] accept     ≤ 5.0s   (matching event not modeled in SUMO yet)
    -- monitors --
      [SKIP        ] low_battery_guard   (battery not exported by SUMO)
```

Observations:

- **Guarantees** map directly to `tripinfo.duration` / `waitingTime` — evaluated.
- **Deadlines** for matching/accept events are not modeled in SUMO yet — flagged SKIP.
- **Monitors** referencing `battery` / `route_deviation` are not exported by SUMO — flagged SKIP.

:::tip 🔍 Visualization Checkpoint 3 — Post-simulation (spec ↔ outcomes)
Each line of `analyze_results.py`'s output traces back to something in cadl-explorer's diagram.
With the explorer open beside the terminal, walk through the correspondence:

| `analyze_results.py` line | Where it lives in cadl-explorer |
|---|---|
| `[OK] waiting_time <= 300s` | Not in the graph (a numeric guarantee, evaluated post-hoc) |
| `[OK] ride_time <= 1800s` | Same as above |
| `[SKIP] match ≤ 30.0s` | The `Δ 30s` label on the `Requested → Matched` edge |
| `[SKIP] accept ≤ 5.0s` | The `Δ 5s` label on the `Matched → Accepted` edge |
| `[SKIP] low_battery_guard` | First row of the Monitors table |

**`SKIP` is not a failure** — it simply reports that SUMO has no observable for that signal.
A stretch goal in §9 walks through closing one of these gaps via TraCI.
:::

---

## 8. Sensitivity analysis: edit the contract, re-evaluate (10 min)

This is the punchline. Edit a CADL guarantee, regenerate the IR, and the
existing simulation result is re-evaluated against the new contract — **without re-running SUMO**.

```bash
sed -i.bak 's|ride_time <= 1800s|ride_time <= 100s|' cadl/mobility_sos.cadl
cadl sim-ir cadl/mobility_sos.cadl --format json > cadl/mobility_sos.ir.json
python scripts/cadl_to_sumo.py
python scripts/analyze_results.py | grep -E "OK|VIOLATED"
```

Output (the violation count and the taxis listed vary with the random seed and your SUMO
version — what matters is the *pattern*: `waiting_time` stays `OK` while `ride_time` turns
`VIOLATED`):

```text
[OK          ] waiting_time <= 300s  (tripinfo.waitingTime)
[VIOLATED (13)] ride_time <= 100s  (tripinfo.duration  e.g. ['taxi_8', 'taxi_9', ...])
```

:::tip 🔍 Visualization Checkpoint 4 — Post-revision (★ highlight)
Reload cadl-explorer **before** running `analyze_results.py`.

The change you just made touches only a guarantee value (`ride_time <= 1800s` → `100s`).
You did not touch `lifecycle:` or `monitors:`, so **the state-machine diagram itself is
identical to §4** — same states, same transitions, same `Δ` labels.
To change the diagram you would have to edit `transitions:` (you did exactly that in Exercise 4-1).

The reason this checkpoint still matters is that, after editing the CADL source,
you should consciously go back to the browser and see that **the same spec
that drives the diagram also drives `analyze_results.py`'s verdict**. That single-source
correspondence is the whole goal of this tutorial:

```
  CADL source (mobility_sos.cadl)
        │
        ├── Picture (cadl-explorer)        ← visual understanding
        ├── Execution (SUMO)                ← dynamic behavior
        └── Verdict (analyze_results.py)    ← compliance check
```

That round-trip is the **SoS-design feedback loop** CADL is meant to enable.

When you're done, restore the original guarantee:

```bash
mv cadl/mobility_sos.cadl.bak cadl/mobility_sos.cadl
cadl sim-ir cadl/mobility_sos.cadl --format json > cadl/mobility_sos.ir.json
python scripts/cadl_to_sumo.py
```
:::

---

## 9. Stretch goals

| Task | Hint |
|---|---|
| Tighten `match` deadline 30s→10s; how many trips realistically meet it? | Extend `cadl_to_sumo.py` to also export per-vehicle match timestamps. |
| Reduce `num_taxis` from 10 to 5; where does the capacity violation show up? | Look at `summary.xml`'s `running` time-series. |
| Add a new monitor `surge_pricing_guard` and observe its trigger pattern. | Add it under `monitors:` and regenerate the IR. |
| **A/B visual diff**: launch two cadl-explorer instances on different ports (8501 / 8502), upload the *before* and *after* IRs side-by-side, and compare the lifecycles. | `streamlit run app.py --server.port 8502` for the second window. |
| Close one of the `[SKIP]` gaps by exporting the relevant SUMO signal via TraCI. | Start with the `match` deadline: capture `vehicle.depart` and compare it to the CSV's `pickup_time`. |

---

## Summary

- Same CADL/SoS-DSL syntax; different domain (mobility vs robot delivery)
  and different runtime (SUMO vs Unity C#).
- The contract deadlines / guarantees / monitors live in the CADL source
  and propagate to **all** runtimes via `sim-ir`.
- Editing a CADL guarantee triggers re-evaluation without re-simulating —
  the cheap, fast feedback loop that SoS design needs.

---

## References

- Main textbook (robot delivery): [`main-textbook.md`](main-textbook.md)
- Exercises: [`exercises.md`](exercises.md)
- SoS-DSL spec: cadl-spec Appendix E
- SUMO project: https://eclipse.dev/sumo/
