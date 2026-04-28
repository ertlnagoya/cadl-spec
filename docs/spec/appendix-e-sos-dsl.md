---
sidebar_position: 15
title: "Appendix E — SoS-DSL Extension"
---

# Appendix E — SoS Contract DSL Extension (v0.1-sos-ext)

This appendix specifies the **SoS Contract DSL extension** to CADL. It
augments the existing `contracts:` section (Appendix A.4) with two new
body keys, `lifecycle:` and `monitors:`, that promote contract execution
state and runtime observation to first-class language constructs.

The core language (Chapter 5, Appendix A) does **not** mandate these
blocks; a conforming CADL processor that does not implement the
extension SHOULD accept the new keys syntactically and emit an
*informational* diagnostic rather than rejecting the file.

This extension is versioned independently from the core language. Files
that rely on it SHOULD declare:

```yaml
sos:
  ...
  extensions:
    - sos-dsl: 0.1
```

## E.1 Motivation

CADL contracts as defined today describe **classes of normative
agreements** — they declare parties, A/G clauses, authority,
information flows, incentive parameters, and an aggregate
violation-detection predicate. This is sufficient to specify *what*
must hold across the SoS, but it is intentionally silent on:

1. **Per-instance contract lifecycle.** A "delivery contract" is
   instantiated once per `DeliveryRequest` and progresses through
   distinct states (Proposed → Assigned → Accepted → Delivering →
   Completed/Violated). The class-level contract spec cannot express
   this per-instance state machine.
2. **Declarative observation.** `violation.detect` collapses observation
   sources, sampling strategy, and detection logic into a single
   string-encoded predicate. There is no first-class way to declare
   *what* is being observed and *how often*.
3. **Norm-bound deadlines.** `protocol.timing.max_response` captures
   timing on a protocol step; it does not bind a deadline to an
   individual obligation as a normative constraint.
4. **Runtime event emission for visualization.** Without an explicit
   lifecycle, downstream tools (cadl-explorer, runtimes) cannot subscribe
   to contract events at the level that operators reason about.

The SoS-DSL extension addresses these four gaps additively, preserving
backward compatibility with existing contract definitions.

## E.2 Conceptual layering

| Layer | Existing CADL | SoS-DSL Extension |
| --- | --- | --- |
| Class-level normative spec | `parties` / `assume` / `guarantee` / `authority` / `information` / `incentives` / `violation` | unchanged |
| Per-instance lifecycle | — | **`lifecycle:`** |
| Declarative observation | one-shot `violation.detect` | **`monitors:`** |
| Obligation deadlines | implicit via `timing` | **`deadline:` on lifecycle transitions** |

The extension does **not** introduce a parallel contract namespace.
`lifecycle:` and `monitors:` are body keys of the same `contract_decl`
that already accepts `obligations:` and friends.

## E.3 Syntax (EBNF additions to A.4)

```ebnf
contract_body  =/  "lifecycle:" , INDENT , lifecycle_body , DEDENT
                |  "monitors:"  , INDENT , { monitor_decl } , DEDENT ;

lifecycle_body = "states:"     , state_list  , NEWLINE ,
                 "initial:"    , identifier  , NEWLINE ,
                 [ "terminal:" , state_list  , NEWLINE ] ,
                 [ "transitions:" , INDENT , { lifecycle_trans } , DEDENT ] ;

state_list     = inline_list | INDENT , { "-" , identifier , NEWLINE } , DEDENT ;

lifecycle_trans = "-" , INDENT ,
                  "id:"      , identifier , NEWLINE ,
                  "from:"    , ( identifier | inline_list ) , NEWLINE ,
                  "to:"      , identifier , NEWLINE ,
                  "on:"      , event_expr , NEWLINE ,
                  [ "when:"  , predicate  , NEWLINE ] ,
                  [ "deadline:" , duration_lit , NEWLINE ] ,
                  [ "on_violation:" , INDENT , on_violation_body , DEDENT ] ,
                  [ "emit:"  , INDENT , { "-" , string , NEWLINE } , DEDENT ] ,
                  DEDENT ;

on_violation_body = [ "transition:" , identifier , NEWLINE ] ,
                    [ "severity:"   , severity_lit , NEWLINE ] ;

severity_lit   = "Minor" | "Major" | "Critical" ;

monitor_decl   = "-" , INDENT ,
                 "id:"        , identifier , NEWLINE ,
                 "observe:"   , observe_list , NEWLINE ,
                 [ "sampling:" , sampling_spec , NEWLINE ] ,
                 "rule:"      , predicate , NEWLINE ,
                 [ "on_match:" , INDENT , on_match_body , DEDENT ] ,
                 DEDENT ;

observe_list   = inline_list | observation ;
observation    = identifier , { "." , identifier } ;
sampling_spec  = "event"
               | "periodic" , "(" , duration_lit , ")" ;

on_match_body  = [ "violation:" , identifier , NEWLINE ] ,
                 [ "transition:" , identifier , NEWLINE ] ,
                 [ "severity:"   , severity_lit , NEWLINE ] ;
```

## E.4 Static semantics

A SoS-DSL-aware processor MUST, in addition to existing checks:

- **L-1.** Every `lifecycle.initial` and `lifecycle.terminal` state MUST
  appear in `lifecycle.states`.
- **L-2.** Every `lifecycle.transitions[*].from` and `.to` MUST appear in
  `lifecycle.states`.
- **L-3.** A lifecycle MUST have at least one terminal state reachable
  from the initial state.
- **L-4.** A `deadline:` on a transition implicitly introduces a
  `Timeout` event scoped to that transition's `from` state. Two
  transitions out of the same state MAY have deadlines; their semantics
  are independent.
- **M-1.** `monitor.observe` references MUST resolve to declared actor
  attributes, message names, or the reserved identifiers `time` and
  `state`.
- **M-2.** `on_match.violation` references MUST name an obligation /
  permission / prohibition declared in the same contract.
- **M-3.** `on_match.transition` references MUST name a lifecycle
  transition declared in the same contract.

## E.5 Dynamic semantics (informative)

- A contract instance is created when its initial trigger fires (e.g.,
  a `DeliveryRequest` arrives). It advances through `lifecycle.states`
  driven by `lifecycle.transitions[*].on` events, deadline timers, and
  `monitors[*].on_match.transition` actions.
- An obligation's `deadline:` defines a normative time bound. Failure
  to fire the obligation's `must` event before the deadline is a
  *violation* of severity `Major` unless overridden in the
  `on_violation:` block.
- `monitors` evaluate independently of the lifecycle state machine but
  can read `state` (current lifecycle state) in their `rule:`. On
  match, they MAY emit a violation, drive a transition, or both.
- `incentives.rules` (existing) and `monitor.on_match` (extension)
  cooperate: rewards/penalties reference the violations and transitions
  that this extension makes addressable.

## E.6 Robot-delivery example (excerpt)

```yaml
contracts:
  - id: DELIVERY_SLA
    parties: [DISPATCHER, "ROBOT[*]", "CUSTOMER[*]"]
    assume:
      - "ROBOT[i].battery > 20"
    guarantee:
      - "delivery_time <= 300s"
    incentives:
      type: task_completion
      lambda: 0.5
      rules:
        - "reward(ROBOT[i], 10) when on_time_delivery"
        - "penalty(ROBOT[i], -5) when path_deviation"

    # === SoS-DSL extension: per-instance lifecycle ===
    lifecycle:
      states:    [Proposed, Assigned, Accepted, Delivering, Completed, Violated, Terminated]
      initial:   Proposed
      terminal:  [Completed, Violated, Terminated]
      transitions:
        - id: assign
          from: Proposed
          to:   Assigned
          on:   "DISPATCHER -> ROBOT[i] : route_assignment"
        - id: accept
          from: Assigned
          to:   Accepted
          on:   "ROBOT[i] -> DISPATCHER : ack(accepted)"
          deadline: 5s
          on_violation:
            transition: Violated
            severity:   Major
        - id: deliver
          from: Accepted
          to:   Delivering
          on:   "ROBOT[i].status == InTransit"
        - id: complete
          from: Delivering
          to:   Completed
          on:   "ROBOT[i].status == Delivered"
          when: "now <= request.deadline"

    # === SoS-DSL extension: declarative monitors ===
    monitors:
      - id: battery_guard
        observe: "ROBOT[i].battery"
        sampling: periodic(500ms)
        rule: "ROBOT[i].battery < 20 AND state == Assigned"
        on_match:
          transition: Violated
          severity:   Major
      - id: deadline_watch
        observe: time
        sampling: periodic(1s)
        rule: "now > request.deadline AND state IN [Assigned, Accepted, Delivering]"
        on_match:
          transition: Violated
          severity:   Critical
```

## E.7 Intermediate Representation (IR) addition

The CADL Sim-IR (see `cadl/sim/ir.py`) is extended with a `lifecycle`
and `monitors` field on each contract IR object. The shape is a direct
serialization of the AST after normalization:

```jsonc
{
  "contracts": [
    {
      "id": "DELIVERY_SLA",
      "parties": ["DISPATCHER", "ROBOT[*]", "CUSTOMER[*]"],
      "assume": [...],
      "guarantee": [...],
      "incentives": {...},
      "lifecycle": {
        "states":   ["Proposed", "Assigned", "Accepted", "Delivering",
                     "Completed", "Violated", "Terminated"],
        "initial":  "Proposed",
        "terminal": ["Completed", "Violated", "Terminated"],
        "transitions": [
          { "id": "assign",
            "from": ["Proposed"], "to": "Assigned",
            "on": "DISPATCHER -> ROBOT[i] : route_assignment" },
          { "id": "accept",
            "from": ["Assigned"], "to": "Accepted",
            "on": "ROBOT[i] -> DISPATCHER : ack(accepted)",
            "deadline_ms": 5000,
            "on_violation": { "transition": "Violated", "severity": "Major" } }
        ]
      },
      "monitors": [
        { "id": "battery_guard",
          "observe": ["ROBOT[i].battery"],
          "sampling": { "kind": "periodic", "period_ms": 500 },
          "rule": "ROBOT[i].battery < 20 AND state == Assigned",
          "on_match": { "transition": "Violated", "severity": "Major" } }
      ]
    }
  ]
}
```

Normalizations applied during lowering:

| Sugar | Normalized form |
| --- | --- |
| `from: Assigned` (single id) | `"from": ["Assigned"]` |
| `from: [Assigned, Accepted]` | `"from": ["Assigned", "Accepted"]` |
| `deadline: 5s` | `"deadline_ms": 5000` |
| `sampling: periodic(500ms)` | `{"kind":"periodic","period_ms":500}` |

## E.8 Codegen contract (informative)

Targets in `codegen:` MAY emit code from the `lifecycle` and
`monitors` IR fields. The reference codegen pipeline produces:

- a state machine class per contract (states from `lifecycle.states`,
  transitions from `lifecycle.transitions`),
- a deadline timer per transition with a `deadline_ms`,
- a periodic / event-driven monitor task per `monitor`,
- a violation log entry per fired `on_violation` or
  `on_match.violation`.

Reward / sanction execution is **out of scope** for this revision; the
runtime SHOULD record reward and sanction events but is not required to
act on them.

## E.9 Backward compatibility

Files written against unmodified CADL v0.1 remain valid. Files that use
the SoS-DSL extension SHOULD declare `extensions: [sos-dsl: 0.1]` in
the `sos:` header. Processors that do not implement the extension MUST
NOT reject such files; they SHOULD emit a single informational
diagnostic per file.
