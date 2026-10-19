---
sidebar_position: 21
sidebar_label: "App. B — Notation quick reference"
title: "Appendix B — Notation quick reference"
---

# Appendix B — Notation quick reference

The CADL notation, the commands and the file locations used in this textbook, on one page. Chapter 3 explains what each construct means. The CADL listings of this appendix fit together into one file, which passes `cadl check` and `cadl verify` of `cadl` 0.3.14.

## B.1 The skeleton of a file

```yaml
sos:
  name: "MyDelivery"
  type: Acknowledged              # Directed / Acknowledged / Collaborative / Virtual
  version: "0.1.0"
  extensions:                     # declare when you use lifecycle: and monitors:
    - sos-dsl: 0.1
  context:
    environment:
      num_robots: 3               # values passed to simulators and others
  actors:    [...]                # B.2
  contracts: [...]                # B.2, B.3
  protocols: [...]                # B.2
```

## B.2 The structure layer

```yaml
  actors:
    - id: DISPATCHER
      role: "central_coordinator"
      autonomy: low               # low / medium / high (medium when omitted)
      capabilities: [assign_tasks]
      interface:
        input:  [position_report, ack]
        output: [route_assignment]
    - id: "ROBOT[1..N]"           # a set of actors of the same kind
      role: "delivery_agent"
      autonomy: high

  contracts:
    - id: DELIVERY_SLA
      parties: [DISPATCHER, "ROBOT[*]"]
      assume:                     # assumptions
        - "ROBOT[i].battery > 20"
      guarantee:                  # guarantees
        - "delivery_time <= 300s"
      incentives:
        type: task_completion
        lambda: 0.5               # strength (λ)
        rules:
          - "reward(ROBOT[i], 10) when on_time_delivery"

  protocols:
    - id: DeliveryProposal
      trigger: "new_delivery_request(ROBOT[i])"
      precondition: "ROBOT[i].battery > 20"
      steps:
        - "DISPATCHER -> ROBOT[i] : route_assignment"   # send a message
        - "DISPATCHER : log(route_assignment)"          # a computation of its own
        - "ROBOT[i] -> DISPATCHER : ack"
      postcondition: "ROBOT[i].status == Delivered"
```

## B.3 The norms layer (inside a contract)

```yaml
      lifecycle:
        states: [Proposed, Assigned, Accepted, Completed, Violated]
        initial: Proposed
        terminal: [Completed, Violated]
        transitions:
          - id: assign
            from: Proposed
            to: Assigned
            on: "DISPATCHER -> ROBOT[i] : route_assignment"   # a message event
          - id: accept
            from: Assigned                # one state, or several as in [A, B]
            to: Accepted
            on: "ROBOT[i] -> DISPATCHER : ack(accepted)"
            when: "ROBOT[i].battery > 20" # optional: a condition that must also hold
            deadline: 5s                  # optional: bound from entering the from state
            on_violation:                 # write it whenever you write deadline:
              transition: Violated        # the name of the target state (not a transition id)
              severity: Major             # Minor / Major / Critical (Major when omitted)
            emit: [accepted]              # optional: names of extra events to publish
          - id: complete
            from: [Accepted]
            to: Completed
            on: "ROBOT[i].status == Delivered"   # a condition event (occurs when it becomes true)
      monitors:
        - id: battery_guard
          observe: "ROBOT[i].battery"     # one entry, or several as in ["A.x", "B.y"]
          sampling: periodic(500ms)       # event (the default) or periodic(<duration>)
          rule: "ROBOT[i].battery < 20 AND state IN [Assigned, Accepted]"
          on_match:
            violation: low_battery        # optional: name to record (the id when omitted)
            transition: Violated          # optional: the name of the target state
            severity: Major
```

## B.4 Expressions and values

Conditions (`assume`, `guarantee`, `on:`, `when:`, `rule:` and others) are written inside quoted strings.

| Notation | Meaning | Example |
| --- | --- | --- |
| `OR`, `AND`, `NOT` | Or, and, not (binding more tightly in this order) | `a > 1 AND NOT b` |
| `==`, `!=`, `<`, `<=`, `>`, `>=` | Comparison; cannot be chained as in `a < b < c` | `ROBOT[i].battery < 20` |
| `IN [ ... ]` | Equal to one of the listed values | `state IN [Assigned, Accepted]` |
| `+`, `-`, `*`, `/` | Arithmetic | `deadline - now` |
| `X[i].attr` | An attribute of an actor | `ROBOT[i].battery` |
| `X[*]`, `X[i]`, `X[1..N]` | A whole set, one member, a range | `"ROBOT[*]"` |
| `for all x in S: P`, `exists x in S: P` | `P` holds for every / some `x` | `for all t in TAXI[*]: has_capability(t, local_navigation)` |
| `f(x, y)` | A function call | `min_dist(ROBOT[i].position, DISPATCHER.obstacle_positions)` |
| `state`, `now`, `request` | Reserved: the current state, the current time, the request that created the instance | `state == Assigned` |

| Value | How to write it |
| --- | --- |
| Durations (`deadline:`, `periodic(...)`) | An integer with the unit `ms`, `s`, `min` or `h`: `5s`, `500ms`, `2min`. Decimals such as `0.5s` are not accepted |
| Severities | `Minor`, `Major`, `Critical` |
| Values that need quotes | The values of `on:`, `when:` and `rule:`, and values containing `[`, `->` or `": "` (such as `"ROBOT[*]"`) |

## B.5 Commands

| Command | What it does | Sections |
| --- | --- | --- |
| `cadl check <file>` | Checks syntax, types and the static rules of the SoS-DSL extension | 3.9, 4.3 |
| `cadl verify <file>` | Does what `cadl check` does and also looks for contradictions between assumptions and guarantees and for deadlocks in protocols | 3.9 |
| `cadl sim-ir <file> --format json` | Writes the IR as JSON | 4.3, 5.3 |
| `cadl codegen --target unity-csharp -o <dir> <file>` | Generates Unity C# from the IR (`--target` is `python`, `solidity`, `opa` or `unity-csharp`) | 7.6 |
| `./scripts/sos_dsl_handson_e2e.sh <file> --unity <dir>` | Checks the file, writes the IR, generates the C# and copies it into the Unity project in one go; `--unity ""` skips the copy | 7.3 |
| `python3 -m cadl.runtime.multi_robot_demo [--summary] [--log <file>] [--ir <file>]` | Runs the five-robot demo on the reference runtime: `--summary` prints a table of final states, `--log` writes an NDJSON trace, `--ir` uses your own IR | 7.5, 7.9 |
| `streamlit run app.py` (in `cadl-explorer`) | Starts cadl-explorer | 6.3 |
| `nats-server -p 4222` | Starts NATS | 8.2 |
| `go run .` (in `arbitrator/C-SoS/main`) | Starts the arbitrator | 8.2 |

## B.6 Where the source files are

| What | Where |
| --- | --- |
| The language specification | `cadl-spec/docs/spec/` (the norms layer is in [Appendix E](../spec/appendix-e-sos-dsl.md)) |
| Parser | `cadl_repo/src/cadl/parser.py` |
| IR | `cadl_repo/src/cadl/sim/ir.py`, `cadl_repo/src/cadl/sim/lower.py` |
| Unity C# generator | `cadl_repo/src/cadl/codegen/unity_csharp/` |
| e2e script | `cadl_repo/scripts/sos_dsl_handson_e2e.sh` |
| Example | `cadl_repo/examples/sos_dsl_robot_delivery.cadl` |
| Python reference runtime | `cadl-raspimouse-simulator/cadl/runtime/` |
| Generated C# and the hand-written glue | `cadl-raspimouse-simulator/unity/Assets/Scripts/SoSDsl/` (`Generated/`, `Runtime/`, `Demo/`) |
| The part that draws lifecycles | `cadl-explorer/cadl_sim/sos_dsl/` |
