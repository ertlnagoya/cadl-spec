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
> **You will leave with**: A `mobility_sos.cadl` describing a
> taxi-fleet SoS that you have read and edited yourself, a SUMO simulation that actually runs, and a
> report that checks the simulation results against the `guarantee` clauses of your CADL contract.

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
                          analyze_results.py (guarantee check)
                                  ↓
                       Iterate: revise CADL guarantees / deadlines
```

The reference implementation lives in the `mobility-sos-exercise` repository.

:::info[Repository availability]
`mobility-sos-exercise` is **not publicly available at present**. The commands below assume you have been given access to it; without it, this page can still be read as a worked example of applying CADL to a mobility SoS.
:::

---

## 1. Setup

Same as the main textbook for `cadl_repo` and `cadl-explorer`.
The new requirement is **SUMO**:

```bash
# The exercise repository is not publicly available at present.
# Place the copy you were given at ~/program/mobility-sos-exercise.
cd ~/program

# Exercise venv
cd mobility-sos-exercise
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# SUMO (pip is the simplest cross-platform way)
pip install eclipse-sumo

# CADL compiler: install the clone from Course A into this venv,
# so that `cadl` and the exercise scripts run in the same shell
pip install -e ~/program/cadl_repo
cadl --version

# cadl-explorer: same as Course A, Step 4
```

> If `z3-solver` fails to build during `pip install -e ~/program/cadl_repo`, fall back
> to `pip install --no-deps -e ~/program/cadl_repo` followed by `pip install lark pyyaml`.
> This tutorial only needs `cadl check` and `cadl sim-ir`, neither of
> which uses Z3.

---

## 2. Read the structure (5 min)

Open `cadl/mobility_sos.cadl` and look at the `actors:` inside the `sos:` block (excerpt):

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

How to read it: the platform is the central coordinator and has little freedom to act on its own (`autonomy: low`);
the taxis are self-interested agents with high autonomy; passengers issue requests and decide whether to board.

The same **Acknowledged** SoS type as the robot-delivery example.

:::tip[🔍 Visualization Checkpoint 0 — What a structure-only spec gives you]
So far you have read only the **structure** (the actors). Check the file, and print how much of the
contract's normative part the IR carries:

```bash
cd ~/program/mobility-sos-exercise
cadl check  cadl/mobility_sos.cadl        # → Type check passed: cadl/mobility_sos.cadl
cadl sim-ir cadl/mobility_sos.cadl --format json \
   | python3 -c "import sys, json; c=json.load(sys.stdin)['institution']['contracts'][0]; print('lifecycle =', 'present' if c['lifecycle'] else None, '/ monitors =', len(c['monitors']))"
```

The file you are reading is the complete specification: its contract already carries the
`lifecycle:` and `monitors:` blocks that §3 walks through, so the command should report a lifecycle.
To see what the **structure alone** would give, make a scratch copy, delete the `lifecycle:` and
`monitors:` blocks from it, and run the same two commands on the copy: `cadl check` still passes, but
the IR has `"lifecycle": null` and no monitors, and cadl-explorer shows only a warning that the
contract does not declare a `lifecycle:` section.
That gap — structure alone cannot express deadlines, violations, or consequences — is what the blocks you read in §3 fill.
:::

---

## 3. Read the contract (10 min)

The contract in the same file (an excerpt: the `on:` trigger of each transition, the remaining
transitions and the remaining monitors are omitted and marked `# ...`):

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
          # on: ...
          deadline: 30s
          on_violation: { transition: Violated, severity: Major }
        - id: accept
          from: Matched
          to:   Accepted
          # on: ...
          deadline: 5s
          on_violation: { transition: Violated, severity: Major }
        # ...
    monitors:
      - id: low_battery_guard
        observe: "TAXI[i].battery"
        sampling: periodic(500ms)
        rule: "TAXI[i].battery < 15 AND state == Accepted"
        on_match: { transition: Violated, severity: Critical }
      # ...
```

### Exercise 3-1

One lifecycle instance corresponds to one ride request. Answer the following.

1. If the platform fails to dispatch within 31 seconds, what state does the contract enter?
2. Whose responsibility is the `accept` deadline?
3. State, in one sentence, when `low_battery_guard` fires.

---

## 4. Visualize (10 min) — 🔍 Visualization Checkpoint 1 (post-DSL)

In §3 you read the `lifecycle:` and `monitors:` blocks of the CADL source.
Because the file contains them, cadl-explorer renders a **meaningful** picture.

```bash
cd ~/program/mobility-sos-exercise
cadl check  cadl/mobility_sos.cadl
cadl sim-ir cadl/mobility_sos.cadl --format json > cadl/mobility_sos.ir.json

cd ~/program/cadl-explorer
streamlit run app.py
# Browser opens at http://localhost:8501
# Sidebar → "Contract Lifecycle" → drag mobility_sos.ir.json into the uploader
```

You should see something like:

![Mobility SoS Lifecycle](/img/mobility_sos_lifecycle.png)

| Visual | Meaning |
|---|---|
| Double circle = `Requested` | initial state |
| Dashed grey = `Delivered`/`Cancelled`/`Terminated` | normal terminals |
| Dashed pink = `Violated` | violation terminal |
| Solid edge with `Δ 30s` / `Δ 5s` | deadline-bearing transitions |
| Red dashed edge with `violation Major` | forced move to the `on_violation` target state |

:::info[This pattern repeats throughout the tutorial]
You will run **edit CADL → `cadl sim-ir` → reload cadl-explorer** at every milestone:
after reading the structure, after reading the contract, after codegen, after the simulation, after revising the contract.
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
cd ~/program/mobility-sos-exercise
python scripts/cadl_to_sumo.py
```

Example output (excerpt; the scripts print their progress messages in Japanese):

```text
[1/4] CADL.environment 検証
  [OK] grid_size=5 は SUMO ネットワークと一致。
[2/4] contracts → constraints 抽出
  - contract RIDE_SLA
      guarantees: 2
        waiting_time   <= 300.0s
        ride_time      <= 1800.0s
      deadlines : 2
        match      30.0s (violation→Violated, sev=Major)
        accept     5.0s (violation→Violated, sev=Major)
      monitors  : 3
[3/4] sumocfg 生成 (CADL.time_step_ms / 終端を反映)
  ✓ step-length = 1.0s
  ✓ end         = 4920s
```

Produces:

- `sumo/config/midtown.cadl.sumocfg` — `step-length` from
  `environment.time_step_ms`, `end` from CSV last depart + `ride_time` guarantee.
- `sumo/cadl_constraints.json` — the contract conditions (guarantees / deadlines / monitors) that
  `analyze_results.py` reads.

:::tip[🔍 Visualization Checkpoint 2 — Post-codegen (CADL source is unchanged)]
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
# Check the sample demand CSV
python scripts/prepare_sample_data.py

# Build the SUMO network (one time)
netconvert -c sumo/network/midtown.netccfg

# CSV → route file
python scripts/generate_sumo_routes.py

# Run SUMO (picks the CADL-derived sumocfg)
python scripts/run_sumo.py            # headless
# python scripts/run_sumo.py --gui    # with visualization
```

This populates `results/tripinfo.xml` and `results/summary.xml`.

---

## 7. Check the results against the contract (10 min)

```bash
python scripts/analyze_results.py
```

Example output (excerpt; the header line is printed in Japanese):

```text
=== CADL 契約 (cadl_constraints.json) との遵守チェック ===

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

What is actually checked here is the two `guarantee` clauses only; the deadlines and the monitor are listed but not evaluated:

- **Guarantees** map directly to `tripinfo.duration` / `waitingTime` — evaluated.
- **Deadlines** for matching/accept events are not modeled in SUMO yet — flagged SKIP.
- **Monitors** referencing `battery` / `route_deviation` are not exported by SUMO — flagged SKIP.

:::tip[🔍 Visualization Checkpoint 3 — Post-simulation (spec ↔ outcomes)]
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
# Rewrite ride_time 1800s → 100s (for the experiment)
sed -i.bak 's|ride_time <= 1800s|ride_time <= 100s|' cadl/mobility_sos.cadl

# Regenerate the IR (no need to re-run the simulation)
cadl sim-ir cadl/mobility_sos.cadl --format json > cadl/mobility_sos.ir.json
python scripts/cadl_to_sumo.py

# Re-evaluate the existing SUMO results
python scripts/analyze_results.py | grep -E "OK|VIOLATED"
```

Output (the violation count and the taxis listed vary with the random seed and your SUMO
version — what matters is the *pattern*: `waiting_time` stays `OK` while `ride_time` turns
`VIOLATED`):

```text
[OK          ] waiting_time <= 300s  (tripinfo.waitingTime)
[VIOLATED (13)] ride_time <= 100s  (tripinfo.duration  e.g. ['taxi_8', 'taxi_9', ...])
```

:::tip[🔍 Visualization Checkpoint 4 — Post-revision (★ highlight)]
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
        └── Verdict (analyze_results.py)    ← guarantee check
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
| **A/B visual diff**: compare the *before* and *after* designs. | In cadl-explorer, open the `.cadl` file on the **Designer** page, save a version under **Versions**, open the revised file and compare the two there (structured diff and source diff). To see two lifecycle diagrams side by side, open the **Contract Lifecycle** page in two browser tabs and upload one IR in each; a second instance on another port is not needed. |
| Close one of the `[SKIP]` gaps by exporting the relevant SUMO signal via TraCI. | Start with the `match` deadline: capture `vehicle.depart` and compare it to the CSV's `pickup_time`. |

---

## Summary

- Same CADL/SoS-DSL syntax; different domain (mobility vs robot delivery)
  and different runtime (SUMO vs Unity C#).
- The contract's deadlines / guarantees / monitors live in one place, the CADL source, and reach each
  tool through the IR that `cadl sim-ir` emits. How much of them a given runtime can evaluate
  differs: in this course the SUMO pipeline evaluates the `guarantee` clauses only, and reports the
  deadlines and monitors as `[SKIP]` because SUMO has no observable for them.
- Editing a CADL guarantee and re-running the analysis re-evaluates the existing results without
  re-simulating — a cheap, fast feedback loop for SoS design.

---

## References

- Main textbook (robot delivery): [`main-textbook.md`](main-textbook.md)
- Exercises: [`exercises.md`](exercises.md)
- SoS-DSL spec: cadl-spec [Appendix E](../spec/appendix-e-sos-dsl.md)
- SUMO project: https://eclipse.dev/sumo/
