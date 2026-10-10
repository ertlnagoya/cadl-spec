---
sidebar_position: 15
title: "Appendix E: SoS-DSL Extension"
description: "SoS Contract DSL extension (sos-dsl 0.1): per-instance contract lifecycles and declarative monitors added to CADL contracts."
---

# Appendix E — SoS Contract DSL Extension (sos-dsl 0.1)

This appendix specifies the **SoS Contract DSL extension** to CADL. It
augments the `contract_def` production of
[Appendix A.4](./appendix-a-syntax.md#a4-contracts-institution-layer)
with two keys, `lifecycle:` and `monitors:`, that promote contract
execution state and runtime observation to first-class language
constructs.

The core language ([Chapter 5](./05-language-spec.md),
[Appendix A](./appendix-a-syntax.md)) does **not** mandate these
blocks; a conforming CADL processor that does not implement the
extension MUST NOT reject a file because of the new keys. It SHOULD
accept them syntactically and emit an *informational* diagnostic.

This extension is versioned independently from the core language. Its
name is `sos-dsl` and this appendix describes version `0.1` (the same
revision is labelled `v0.1-sos-ext` in the source of the reference
implementation). Files that rely on it SHOULD declare it with the
`extensions:` key of
[Appendix A.2](./appendix-a-syntax.md#a2-top-level-structure):

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
   timing on a protocol step; it does not bind a deadline to a step of
   an individual contract instance as a normative constraint.
4. **Runtime event emission for visualization.** Without an explicit
   lifecycle, downstream tools (CADL Explorer, runtimes) cannot
   subscribe to contract events at the level that operators reason
   about.

The SoS-DSL extension addresses these four gaps additively, preserving
backward compatibility with existing contract definitions.

## E.2 Conceptual layering

| Layer | Existing CADL | SoS-DSL Extension |
| --- | --- | --- |
| Class-level normative spec | `parties` / `assume` / `guarantee` / `authority` / `information` / `responsibilities` / `incentives` / `violation` | unchanged |
| Per-instance lifecycle | — | **`lifecycle:`** |
| Declarative observation | one-shot `violation.detect` | **`monitors:`** |
| Norm-bound deadlines | implicit via `timing` | **`deadline:` on lifecycle transitions** |

The extension does **not** introduce a parallel contract namespace.
`lifecycle:` and `monitors:` are keys of the same `contract_def` that
already accepts `assume:`, `guarantee:`, and the other keys of
[Appendix A.4](./appendix-a-syntax.md#a4-contracts-institution-layer).

## E.3 Syntax (EBNF additions to A.4)

The grammar uses the notation of
[Appendix A](./appendix-a-syntax.md): a terminal ending in a
colon is a key of a YAML mapping, `{ "-" , x }` is a YAML sequence, and
a production marked `(* string *)` describes the content of one YAML
string scalar. `lifecycle_block` and `monitor_def` are the two
non-terminals that A.4 refers to.

```ebnf
lifecycle_block   = "states:"   , state_list ,
                    "initial:"  , identifier ,
                    "terminal:" , state_list ,
                    [ "transitions:" , { "-" , lifecycle_trans } ] ;
state_list        = { "-" , identifier } ;

lifecycle_trans   = "id:"   , identifier ,
                    "from:" , ( identifier | state_list ) ,
                    "to:"   , identifier ,
                    "on:"   , event ,
                    [ "when:"         , rule ] ,
                    [ "deadline:"     , duration_lit ] ,
                    [ "on_violation:" , on_violation_body ] ,
                    [ "emit:"         , { "-" , text } ] ;
on_violation_body = "transition:" , identifier ,
                    [ "severity:" , severity ] ;
severity          = "Minor" | "Major" | "Critical" ;

monitor_def       = "id:"      , identifier ,
                    "observe:" , ( observation | { "-" , observation } ) ,
                    [ "sampling:" , sampling_spec ] ,
                    "rule:"    , rule ,
                    [ "on_match:" , on_match_body ] ;
on_match_body     = [ "violation:"  , identifier ] ,
                    [ "transition:" , identifier ] ,
                    [ "severity:"   , severity ] ;

event             = message_event | rule ;                  (* string *)
message_event     = actor_ref , "->" , actor_ref , ":" , step_expr ;
rule              = predicate ;                             (* string *)
membership        = arith_expr , "IN" ,
                    "[" , arith_expr , { "," , arith_expr } , "]" ;
observation       = member_access | identifier ;            (* string *)
sampling_spec     = "event"
                  | "periodic" , "(" , duration_lit , ")" ;  (* string *)
```

`identifier`, `actor_ref`, `duration_lit`, `step_expr`, `predicate`,
`arith_expr`, and `member_access` are defined in Appendix A (A.1, A.5,
A.10). Inside a `rule`, `membership` is an additional alternative of
the `comparison` production of A.10, and `IN` is a reserved keyword;
an example is `state IN [Assigned, Accepted]`. `IN` is distinct from
the lower-case `in` of Appendix A, which introduces the domain of a
quantifier or comprehension.
`sampling:` defaults to `event` and `severity:` to `Major`.

The values of `on:`, `when:`, `rule:`, and of `observe:` entries that
contain `[`, `->`, or `": "` have to be quoted, as in the example of
E.6. The key `on` SHOULD be written without quotation marks; a
processor built on a YAML 1.1 loader, which reads an unquoted `on` as a
boolean, MUST still recognise it as this key.

## E.4 Static semantics

A SoS-DSL-aware processor MUST, in addition to existing checks:

- **L-1.** Every `lifecycle.initial` and `lifecycle.terminal` state MUST
  appear in `lifecycle.states`.
- **L-2.** Every `lifecycle.transitions[*].from` and `.to` MUST appear in
  `lifecycle.states`.
- **L-3.** `lifecycle.terminal` MUST list at least one state, and at
  least one terminal state MUST be reachable from the initial state.
- **L-4.** A `deadline:` on a transition implicitly introduces a
  `Timeout` event scoped to that transition's `from` state. Two
  transitions out of the same state MAY have deadlines; their semantics
  are independent. A transition with a `deadline:` SHOULD also have an
  `on_violation:` block. When a transition has a `deadline:` but no
  `on_violation.transition`, missing the deadline is still a violation
  (severity `Major` unless overridden) but causes no change of state.
  `sos-dsl` 0.1 defines no way to refer to the implicit `Timeout` event from
  `on:`.
- **L-5.** Every `lifecycle.transitions[*].on_violation.transition`
  MUST name a state that appears in `lifecycle.states` (the target
  state of the forced move, e.g. `Violated`).
- **M-1.** Every `monitor.observe` entry MUST be an attribute of a
  declared actor (e.g. `ROBOT[i].battery`), a message name, or one of
  the reserved identifiers `time` and `state`.
- **M-2.** `on_match.violation` is an identifier that labels the
  reported violation (the norm that was broken, e.g. `collision`). It
  need not be declared elsewhere; when it is omitted, the `id` of the
  monitor is used as the label.
- **M-3.** `on_match.transition` references MUST name a state that
  appears in `lifecycle.states` of the same contract. The value is the
  *target state* of the forced move (e.g. `Violated`), not the `id` of
  a declared transition.

In both `on_violation:` and `on_match:`, the key `transition:` therefore
always holds a target state name. This matches the examples in E.6, the
IR fields `on_violation_transition` / `on_match_transition` (E.7), and
the reference Unity C# generator, which records such a move as a
`<jump>` from the current state to the named state.

In a `rule` (and therefore in `when:` and in an `on:` event), three
identifiers are reserved: `state` is the current lifecycle state of the
instance, `now` is the current time, and `request` is the request that
created the instance (e.g. `request.deadline`). A bare identifier that
names a lifecycle state (e.g. `Assigned`) denotes that state. `sos-dsl` 0.1 has
no syntax for the trigger that creates an instance or for the fields of
`request`; the host application creates instances and supplies
`request` (see E.8).

In a monitor, `observe:` names the quantities the monitor reads and is
carried into the IR; in `sos-dsl` 0.1 it does not restrict which names a `rule`
may mention. `time` in `observe:` denotes the clock that `now` reads in
a rule.

The reference implementation (`cadl` 0.3) parses both blocks and lowers them
to the IR (E.7) but does not yet check rules L-1 to M-3. From v0.3.7
`cadl check` reports a `severity:` other than `Minor`, `Major`, or
`Critical` as an error. `sampling:` and `deadline:` values are not
validated: an unrecognised `sampling:` is read as `event`, and a
`deadline:` it cannot read is dropped. `rule:`, `when:`, and `on:` are
kept as text; `cadl check` does not parse them, so a malformed one is
not reported. The example
in E.6 accordingly passes although `collision_watch` observes
`OBSTACLES.positions`, an environment quantity that is not an attribute
of a declared actor as M-1 requires.

## E.5 Dynamic semantics (informative)

- A contract instance is created when its initial trigger fires (e.g.,
  a `DeliveryRequest` arrives). `sos-dsl` 0.1 has no syntax for this trigger or
  for the fields of `request`; the host application creates instances
  and supplies `request` (see E.8). It advances through `lifecycle.states`
  driven by `lifecycle.transitions[*].on` events, deadline timers
  (which move the instance to `on_violation.transition`), and
  `monitors[*].on_match.transition` actions (which move it to the named
  state).
- A transition fires when the instance is in one of its `from` states,
  its `on:` event occurs, and its `when:` guard, if any, holds. A
  `message_event` occurs when that message is sent; a `rule` used as an
  event occurs when it becomes true.
- A transition's `deadline:` defines a normative time bound, measured
  from the moment the instance enters one of the transition's `from`
  states. If the transition has not fired by then, this is a
  *violation* whose severity is `Major` unless overridden in the
  `on_violation:` block, and the instance moves to the state named by
  `on_violation.transition`. When the transition has no
  `on_violation.transition`, missing the deadline is still a violation
  but causes no change of state.
- `emit:` lists the names of additional events to publish when the
  transition fires, for consumption by visualization and logging
  tools. The reference generators carry `emit:` into the IR but do not
  act on it in `cadl` 0.3; every transition is published as a lifecycle
  event regardless.
- `monitors` evaluate independently of the lifecycle state machine but
  can read `state` (current lifecycle state) in their `rule:`. A
  monitor with `sampling: event` is evaluated on every event delivered
  to the instance, one with `periodic(d)` every `d`. On match, a
  monitor reports a violation labelled by `on_match.violation` and, if
  `on_match.transition` is given, also moves the instance to that
  state.
- `incentives.rules` (existing) and `monitor.on_match` (extension)
  cooperate: rewards/penalties reference the violations and transitions
  that this extension makes addressable.

## E.6 Robot-delivery example (excerpt)

The contract below is taken from `examples/sos_dsl_robot_delivery.cadl`
in the [`cadl`](https://github.com/ertlnagoya/cadl) repository. It is
abridged: the `authority`, `information`, `incentives`, and `violation`
blocks of the contract and the rest of the file (`actors:`, `metrics:`)
are omitted.

```yaml
contracts:
  - id: DELIVERY_SLA
    parties: [DISPATCHER, "ROBOT[*]", "CUSTOMER[*]"]
    assume:
      - "ROBOT[i].battery > 20"
    guarantee:
      - "delivery_time <= 300s"

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
        - id: start_delivery
          from: Accepted
          to:   Delivering
          on:   "ROBOT[i].status == InTransit"
        - id: complete
          from: Delivering
          to:   Completed
          on:   "ROBOT[i].status == Delivered"
          when: "now <= request.deadline"
        - id: late_failure
          from: [Assigned, Accepted, Delivering]
          to:   Violated
          on:   "now > request.deadline"

    # === SoS-DSL extension: declarative monitors ===
    monitors:
      - id: battery_guard
        observe: "ROBOT[i].battery"
        sampling: periodic(500ms)
        rule: "ROBOT[i].battery < 20 AND state == Assigned"
        on_match:
          transition: Violated
          severity:   Major
      - id: collision_watch
        observe: ["ROBOT[i].position", "OBSTACLES.positions"]
        sampling: periodic(100ms)
        rule: "min_dist(ROBOT[i].position, OBSTACLES.positions) < 0.05"
        on_match:
          violation: collision
          severity:  Critical
      - id: deadline_watch
        observe: time
        sampling: periodic(1s)
        rule: "now > request.deadline"
        on_match:
          transition: Violated
          severity:   Critical
```

No transition in this example leads to `Terminated`; the state is
declared for completeness.

## E.7 Intermediate Representation (IR) addition

The CADL simulator IR (module `cadl.sim.ir` of the
[`cadl`](https://github.com/ertlnagoya/cadl) repository) is extended
with a `lifecycle` and a `monitors` field on each contract IR object
under `institution.contracts`. The shape is a
**direct serialization** of the IR dataclasses (`asdict()`), which
applies normalizations to the surface syntax and **denormalizes** the
nested `on_violation` / `on_match` / `sampling` blocks into flat
fields prefixed with their parent (this keeps the JSON stable for
generators that read it field-by-field):

```jsonc
{
  "institution": {
    "actors": [...],
    "contracts": [
      {
        "id": "DELIVERY_SLA",
        "parties": ["DISPATCHER", "ROBOT[*]", "CUSTOMER[*]"],
        "assume": [...],
        "guarantee": [...],
        "governance": {...},
        "lifecycle": {
          "states":   ["Proposed", "Assigned", "Accepted", "Delivering",
                       "Completed", "Violated", "Terminated"],
          "initial":  "Proposed",
          "terminal": ["Completed", "Violated", "Terminated"],
          "transitions": [
            { "id": "assign",
              "from_states": ["Proposed"],
              "to_state":    "Assigned",
              "on":          "DISPATCHER -> ROBOT[i] : route_assignment",
              "when":        null,
              "deadline_ms": null,
              "on_violation_transition": null,
              "on_violation_severity":   null,
              "emit":        [] },
            { "id": "accept",
              "from_states": ["Assigned"],
              "to_state":    "Accepted",
              "on":          "ROBOT[i] -> DISPATCHER : ack(accepted)",
              "when":        null,
              "deadline_ms": 5000,
              "on_violation_transition": "Violated",
              "on_violation_severity":   "Major",
              "emit":        [] }
          ]
        },
        "monitors": [
          { "id": "battery_guard",
            "observe":            ["ROBOT[i].battery"],
            "sampling_kind":      "periodic",
            "sampling_period_ms": 500,
            "rule":               "ROBOT[i].battery < 20 AND state == Assigned",
            "on_match_violation": null,
            "on_match_transition": "Violated",
            "on_match_severity":   "Major" }
        ]
      }
    ]
  }
}
```

Normalizations applied during lowering:

| Surface syntax | Normalized IR field(s) |
| --- | --- |
| `from: Assigned` (single id) | `"from_states": ["Assigned"]` |
| `from: [Assigned, Accepted]` | `"from_states": ["Assigned", "Accepted"]` |
| `to: Accepted` | `"to_state": "Accepted"` |
| `deadline: 5s` | `"deadline_ms": 5000` |
| `on_violation: { transition: V, severity: Major }` | `"on_violation_transition": "V"`, `"on_violation_severity": "Major"` |
| `sampling: periodic(500ms)` | `"sampling_kind": "periodic"`, `"sampling_period_ms": 500` |
| `sampling: event` | `"sampling_kind": "event"`, `"sampling_period_ms": null` |
| `on_match: { violation, transition, severity }` | `"on_match_violation"`, `"on_match_transition"`, `"on_match_severity"` |

The IR does not fill in every default. When the violation label
(`on_match.violation`) is omitted, the IR records `null`. The severity
fields are `null` when the whole `on_violation:` or `on_match:` block
is omitted; when the block is present without `severity:`, the IR
records `Major`. Where the IR records `null`, applying the defaults
(`Major`; the monitor's `id` as label) is left to the consumer of the
IR.

The `cadl sim-ir <file> --format json` command emits this shape
(abridged above) for downstream tools such as the Lifecycle View of
CADL Explorer. The Unity C# generator (`cadl codegen --target
unity-csharp`) works from the same parsed contract. A Python reference
runtime also consumes this JSON; it is published in the
[`cadl-raspimouse-simulator`](https://github.com/ertlnagoya/cadl-raspimouse-simulator)
repository under `cadl/runtime/`.

## E.8 Codegen contract (informative)

Code generation targets MAY emit code from the `lifecycle` and
`monitors` blocks. The reference generator for this extension is the
`unity-csharp` target ([Appendix D](./appendix-d-codegen.md)). For each
contract that has a `lifecycle:` or `monitors:` block it produces:

- a state machine class per contract (states from `lifecycle.states`,
  transitions from `lifecycle.transitions`),
- a deadline timer per transition with a `deadline_ms` (in `cadl` 0.3 only
  when the transition also names a state in `on_violation.transition`;
  a deadline without one is not enforced by the generated code),
- a periodic / event-driven monitor task per `monitor`,
- a violation log entry per fired `on_violation` or
  `on_match.violation`.

In `cadl` 0.3 the generated runtime matches an `on:` event by comparing its
text with the name of the event posted by the host application, and it
evaluates a `rule` without function calls: a rule that contains one,
such as `collision_watch` in E.6, never matches. The generated
evaluator does not support the arithmetic operators `+ - * /` or
duration literals (`5s`) in a `rule` either. The values of `now`,
`request`, and the observed attributes are supplied by the host.

Reward / sanction execution is **out of scope** for this revision; the
runtime SHOULD record reward and sanction events but is not required to
act on them.

## E.9 Backward compatibility

Files written against unmodified CADL v0.2 remain valid. Files that use
the SoS-DSL extension SHOULD declare `sos-dsl: 0.1` under `extensions:`
in the `sos:` mapping. Processors that do not implement the extension MUST
NOT reject such files; they SHOULD emit a single informational
diagnostic per file.
