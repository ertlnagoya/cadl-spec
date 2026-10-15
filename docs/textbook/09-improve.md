---
sidebar_position: 9
sidebar_label: "9 — Improving the specification"
title: "Chapter 9 — Improving the specification"
---

# Chapter 9 — Improving the specification

This chapter decides, from the results observed in Chapter 7, where to change the specification, and checks the change by running it again. The chapter consists of exercises only.

## 9.1 What you'll learn

- Use observations from simulation to identify *which knob to turn*.
- Adjust the spec at the right layer (deadline / monitor / lifecycle / actor / runtime).
- Validate the change with a re-run.

## 9.2 Background

### Which layer fixes which symptom

Each layer of the design has its own kind of fix:

| Symptom in trace | Layer that fixes it | Example fix |
| --- | --- | --- |
| Deadline expires for *every* robot | Spec — relax `deadline` | 5s → 7s |
| One robot's monitor fires too often (false positive) | Spec — tighten `rule` | `< 20` → `< 15` |
| Robots reach `Violated` because the world model is wrong | Runtime — fix world snapshot keys | check `update_instance_world` calls |
| Reward never gets paid | Runtime — implement reward execution | extend `engine.py` |
| All robots succeed but the *aggregate* is wrong (e.g., late) | New monitor or new contract | add `FLEET_THROUGHPUT_SLA` |

This is a small but useful *typology of regressions* in normative SoS specs.

## 9.3 Exercises

### Exercise 9.1 (★) — Diagnose one failure

**Goal**: Pick *one* violation from your Chapter 7 traces. Explain in 1 paragraph: which layer would you change, and how.

**Submit**: `session5_diagnosis.md` (1 page).

### Exercise 9.2 (★★) — Apply the fix

**Goal**: Implement your diagnosis. Save the fixed spec as `my_delivery_v3.cadl`.

**Procedure**:

1. Make the change you diagnosed in 5.1.
2. Generate the IR of the new file and re-run the demo against it, as in Exercise 7.2:

   ```bash
   cd ~/program/cadl_repo
   cadl sim-ir my_delivery_v3.cadl --format json > my_delivery_v3.ir.json
   cd ~/program/cadl-raspimouse-simulator
   python3 -m cadl.runtime.multi_robot_demo --ir ~/program/cadl_repo/my_delivery_v3.ir.json --summary
   ```

3. Confirm the violation you fixed is gone *and* you didn't break anything else.

**Submit**: `my_delivery_v3.cadl` + diff against v2.

### Exercise 9.3 (★★★) — Implement reward execution

**Goal**: Currently a reward is *written* in the spec (`incentives.rules`) but never *applied* — and the rule text does not even reach the runtime. When the spec is lowered to the IR (`cadl_repo/src/cadl/sim/lower.py`), only `lambda` and `incentive_type` are kept, under the contract's `governance`; the `rules` list is dropped. Make the Python runtime maintain a per-actor balance and credit a reward when a contract reaches `Completed`.

**Procedure**:

1. Extend `ContractRuntime` with `balances: dict[str, float]`, accessor `runtime.balance(actor_id)`, and a way to receive the rules, for example `ContractRuntime(ir, log_path=None, reward_rules=[...])`.
2. Get the rules. Because the IR does not carry them, read them from the `.cadl` source with the cadl parser **in a separate script that writes them to JSON** (if your file has no `incentives:` block, add the one from Chapter 4):

   ```python
   # dump_rules.py — run with the Python environment where cadl-lang is installed
   import json, sys
   from cadl.parser import parse_file

   sos = parse_file(sys.argv[1])
   rules = [{"contract": c.id, "rule": r.description}
            for c in sos.contracts if c.incentives
            for r in c.incentives.rules]
   json.dump(rules, open(sys.argv[2], "w"), indent=2)
   # python dump_rules.py my_delivery_v2.cadl rules.json
   # -> [{"contract": "DELIVERY_SLA", "rule": "reward(ROBOT[i], 10) when on_time_delivery"}]
   ```

   The script has to be separate: the simulator repository has its own top-level `cadl/` package, which shadows `cadl-lang`, so `from cadl.parser import parse_file` fails with `No module named 'cadl.parser'` inside the runtime, its tests, or anything run with `python -m` from the simulator root. Run the script from another directory and pass `rules.json` to the demo (add a `--rewards rules.json` option to `multi_robot_demo`).

   Each rule is a raw string. Parse entries of the form `reward(<actor_ref>, <amount>) when on_time_delivery` yourself (a regular expression is enough) and skip the others (the bundled example also has a `penalty(...)` rule).

   *Stretch variant*: instead of reading the source, extend `lower.py` (and `GovernanceParams` in `sim/ir.py`) so that the IR carries the rules, for example as `governance.incentive_rules`. Run `cadl` from your edited checkout (`pip install -e .`; the PyPI release does not have the key), confirm that the rules appear in the output of `cadl sim-ir --format json`, and let the runtime read them from the IR.
3. Decide who is paid. The runtime knows only the instance id (`robot-0-1`); a contract instance has no actor field. Pass the actor when the instance is opened (for example `open_instance(..., actors={"ROBOT": "robot-0"})`) and map the rule's `ROBOT[i]` to it.
4. Credit on entry to a terminal state. An instance is closed in two places — `StateMachineEngine.fire_transition` (ordinary transitions, including `complete`) and `ContractRuntime._fire_state_jump` (deadline and monitor jumps) — so hook both. Define `on_time_delivery` yourself as "the instance entered `Completed` and has no `violation` record"; the runtime's predicate evaluator cannot decide it, because it treats a bare identifier as true.
5. Add `cadl/runtime/tests/test_rewards.py` with at least:
   - One test: a robot earns 10 on a `Completed` delivery.
   - One test: no reward is paid on a `Violated` delivery.
6. Update `multi_robot_demo --summary` to print final balances. With the bundled scenario, `robot-0` ends with 10 and the other four with 0.

**Reflection**: The CADL spec already says `reward(ROBOT[i], 10) when on_time_delivery`, but until this exercise the runtime ignored it — the IR did not even carry it. **Where is the line between "the spec says so" and "the runtime does so"?**

### Exercise 9.4 (★★★) — Final report

**Goal**: A 3-page report covering the entire course.

| Page | Content |
| --- | --- |
| 1 | Initial CADL model (v1), the question your model is asking, and what was missing in v1. |
| 2 | Simulation results — baseline vs your modifications. Tables and at least one screenshot from cadl-explorer. |
| 3 | Reflection: what did *adding norms* buy you? What did *running the simulation* teach you that the spec alone could not? Where do you think SoS-DSL could go next? |

### Using this chapter in a class

**Before the session.**

- All deliverables from Chapters 4–7.

**Wrap-up and homework.**

**Submit by the end of the last session (Chapter 9)**:

- `my_delivery_v1.cadl` / `v2.cadl` / `v3.cadl`.
- `session5_diagnosis.md` + final report (3 pages).
- (Optional) `test_rewards.py` and the modified `engine.py`.
