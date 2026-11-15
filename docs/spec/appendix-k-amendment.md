---
sidebar_position: 20.5
title: "Appendix K: Amendment of a Model"
description: "Amendment extension (amendment 0.1): amendable parameters with their layer, the actor or role that decides an amendment, range and steps; the identity of a version, its effective time and the transitional rule for running contract instances, related to on_amendment: of the norms extension; metric targets that change over time, the measurement method of a metric, and references to records of human decisions; static rules, the comparison of two versions, and the IR addition."
---

# Appendix K — Amendment of a Model (amendment 0.1)

This appendix specifies the **amendment extension** to CADL. It adds
the key `amendment:` to `sos_body`
([A.2](./appendix-a-syntax.md#a2-top-level-structure)) and the keys
`schedule:` and `measure:` to `metric_def`
([A.3](./appendix-a-syntax.md#a3-context-actors-metrics)). A file that
uses it declares it:

```yaml
extensions:
  - amendment: 0.1
```

The extension declares how a model may change, not how a change is
made. It states:

- which values of the model may be amended, the **layer** each belongs
  to, **who decides** an amendment, and how far one amendment may move
  the value (K.3);
- the identity of a **version** of the model, the version it replaces,
  **when it takes effect**, and what happens to contract instances that
  are **running** at that time (K.4);
- **targets** of a metric that change over time or from one version to
  the next, **how a metric is measured**, and references to the
  **records of human decisions** on which a version rests (K.5).

No verdict of the core, of [Appendix E](./appendix-e-sos-dsl.md), or of
[Appendix F](./appendix-f-norms.md) depends on these keys. The
reference implementation checks them, lowers them to the IR, and
compares two versions of a model with them, from `cadl` 0.3.32 (K.9).

## K.1 Motivation and scope

The robot town of [Course D](../handson/robot-town-tutorial.md) amends
its own rules after every period. Up to `cadl` 0.3.31 the model could
not say which of its values may be amended: the exercise marks them
with comments (`# @amend:hold_limit`), keeps their layer, range, and
step in a separate `constitution.yaml`, keeps the KPI, which changes
from period to period, in `kpi.md`, and keeps the human decisions in
`decisions.md` and `gsn.yaml`. A comment is lost when a tool rewrites
the file, two lines that carry the same value can drift apart, and a
reader of one version of the rules cannot tell from it when it took
effect or which version governs an order that was already under way.

The extension moves into the model what belongs to it:

| In the exercise | In the model |
| --- | --- |
| `# @amend:<name>` on the lines that hold a value | a parameter with `at:`, the places that hold its value |
| `layer`, `min`, `max`, `step`, `unit`, `safety` in `constitution.yaml` | the same keys on the parameter |
| who may adopt an amendment of each layer (the council by vote, the human) | `decided_by:`, `procedure:`, `quorum:` per layer or per parameter |
| the version number of `v<k>.cadl` and the period from which it applies | `sos.version`, `amendment.previous`, `amendment.effective` |
| what an order already under way follows (Exercise 12-3) | `amendment.transitional` |
| the KPI of `kpi.md` by period, and how it is measured (five seeds, one period) | `schedule:` and `measure:` of a metric |
| the entries of `decisions.md` and the nodes of `gsn.yaml` | `amendment.decisions`, named by `decision:` |

What stays outside: the procedure that produces a version (the
proposal, the gates, the vote, the request to the human), the text of
the KPI and of the decisions, and the values of the constitution that
are not values of the model (the invariants and the improvement
threshold of the exercise). The extension does not apply a version: a
runtime or simulator that runs several versions reads their
declarations (K.4).

## K.2 Concepts

- An **amendable parameter** is a named value of the model, a number or
  a duration, that an amendment may change. Its **locations** are the
  places of the file that hold the value.
- Its **layer** says what kind of rule it belongs to: `rule` (the rules
  that the constituent systems set among themselves), `contract` (a
  promise to parties who do not take part in the amendment, such as
  customers), or `regulation` (a limit set from outside the SoS).
- Its **authority** is the actor or role whose decision adopts an
  amendment of it: alone (`procedure: single`) or by the votes of
  `voters:` with a `quorum:` (`procedure: vote`).
- A **version** of a model is one file. Its identity is `sos.version`.
  It **takes effect** at a period or at an instant, and stays in force
  until the next version takes effect.
- A **transitional rule** says, per contract, what an instance that is
  running when a version takes effect does: it **keeps** the version it
  started under, or it **switches** to the new version.
- A **decision record** is an entry of a record of human decisions, or
  a node of a GSN assurance case, named by a URI reference.
- A **schedule** gives the target of a metric from a period, an
  instant, or a version on. A **measurement method** says over which
  window and how many runs one measurement of the metric is taken.

## K.3 Amendable parameters

### Syntax

```ebnf
(* addition to sos_body (A.2) *)
                [ "amendment:" , amendment_block ]

amendment_block = [ "previous:"     , scalar ] ,
                  [ "effective:"    , time_point ] ,
                  [ "transitional:" , transitional_block ] ,
                  [ "decisions:"    , { "-" , decision_def } ] ,
                  [ "layers:"       , { layer , ":" , authority } ] ,
                  [ "parameters:"   , { "-" , param_def } ] ;

layer           = "rule" | "contract" | "regulation" ;
authority       = "decided_by:" , text ,
                  [ "procedure:" , ( "single" | "vote" ) ] ,
                  [ "quorum:"    , int_literal ] ,
                  [ "voters:"    , { "-" , actor_ref } ] ;

param_def       = "id:"    , identifier ,
                  "layer:" , layer ,
                  "value:" , quantity ,
                  [ "min:"       , quantity ] ,
                  [ "max:"       , quantity ] ,
                  [ "step:"      , quantity ] ,
                  [ "max_steps:" , int_literal ] ,
                  [ "unit:"      , text ] ,
                  [ "safety:"    , bool_literal ] ,
                  "at:" , { "-" , location } ,
                  [ "decision:"  , identifier ] ,
                  [ "decided_by:" , text ] , [ "procedure:" , ( "single" | "vote" ) ] ,
                  [ "quorum:" , int_literal ] , [ "voters:" , { "-" , actor_ref } ] ;

quantity        = number | duration_lit ;
location        = text ;                       (* see Locations *)
```

`value:`, `min:`, `max:`, and `step:` are all numbers or all durations
(`60s`, `2min`). `decided_by:` names an actor of the file by its id
(`COUNCIL`, `"ROBOT[*]"`) or a role (`service_operator`).

### Meaning

The value of the parameter is `value:`, and it is the value that the
model has at each of its locations. `min:` and `max:` bound the values
that an amendment may give it, and `step:` is the grid of those values:
a value is allowed when it lies in `[min, max]` and differs from `min:`
by a whole number of steps. One amendment moves the value by at most
`max_steps:` steps (default 1). `unit:` names the unit of a number for
a reader; a duration has its own unit. `safety: true` marks a parameter
on which a safety condition of the model depends (for example the
condition of a regime transition that has a `safety_invariant:`).

The authority of a parameter is its own `decided_by:`,
`procedure:`, `quorum:`, and `voters:` when it gives any of them, and
otherwise the authority of its layer under `amendment.layers`. With
`procedure: vote`, the actor of `decided_by:` adopts an amendment when
at least `quorum:` of `voters:` vote for it; without `voters:` the
voters are outside the model. The layer itself has no further meaning
in this version: it groups the parameters and gives them a default
authority.

The declaration bounds amendments. It is not a constraint on the
system while it runs: a regime binding
([A.7.1](./appendix-a-syntax.md#a71-regime-bindings)) or a later
version may give the same place another value.

### Locations

A location is a dot-separated path of keys from `sos:`:

- at a mapping, a segment is a key;
- in a sequence, a segment selects the item whose `id:` equals it, for
  an entry of `transitions:` the item written `FROM->TO`, and a segment
  of digits selects the item at that index, counted from 0;
- a segment in double quotes is taken as written, dots included, so
  that a value bound to a regime can be named:
  `regimes.CENTRALIZED.parameters."ROUTING.beta"`; the quotes span the
  whole segment (in YAML, write the location in single quotes);
- when the first segment is not a key of `sos:`, `C.alpha`, `C.beta`,
  and `C.lambda` name the values of the contract `C` and
  `environment.X` the entry `X` of `context.environment`, as in the
  regime bindings of [A.7.1](./appendix-a-syntax.md#a71-regime-bindings).

| Location | Value |
| --- | --- |
| `contracts.ROAD_USE.lifecycle.transitions.release.deadline` | the `deadline:` of the lifecycle transition `release` |
| `contracts.ROAD_USE.monitors.blocking_guard.rule` | the `rule:` of a monitor |
| `contracts.DELIVERY_SLA.guarantee.0` | the first item of `guarantee:` |
| `contracts.JOB.norms.report.deadline` | the `deadline:` of a norm (Appendix F) |
| `transitions.DISTRIBUTED->CENTRALIZED.condition` | the condition of a regime transition |
| `regimes.CENTRALIZED.parameters."ROUTING.beta"` | the value that the regime `CENTRALIZED` binds to `ROUTING.beta` (A.7.1) |
| `ROAD_USE.lambda`, `environment.bays` | short forms of `contracts.ROAD_USE.incentives.lambda` and `context.environment.bays` |

A location **holds** the parameter when the value written there, read
as a literal (A.1), equals `value:`, or, for an expression, when the
expression has a literal equal to `value:` or uses the name of the
parameter as a name (`hold_time <= hold_limit`). The index of an actor
reference (`ROBOT[3]`) is not a literal of this kind. Every literal
equal to `value:` at a location is an occurrence of the parameter: a
location should therefore be as narrow as the file allows
(`guarantee.0` rather than `guarantee` when two items hold equal
values), and a processor warns when it is not (K-9). Two literals are
equal when they denote the same number or the same duration: `120s`
and `2min` are equal, `120s` and `120` are not.

## K.4 Versions and transitional provisions

### Syntax

```ebnf
time_point         = "period:" , int_literal
                   | "at:"     , text ;               (* exactly one *)
transitional_block = [ "default:"   , transitional_rule ] ,
                     [ "contracts:" , { "-" , transitional_entry } ] ;
transitional_entry = "contract:" , identifier ,
                     "rule:"     , transitional_rule ,
                     [ "in_states:" , { "-" , identifier } ] ;
transitional_rule  = "keep" | "switch" ;
```

### Meaning

`sos.version` is the identity of the version, `previous:` names the
version it replaces, and `effective:` says when it takes effect: at the
start of the period with the given number (`period:`, counted from 1;
what a period is, is set by the system, in the hands-on one simulated
hour), or at an instant (`at:`, an ISO 8601 date or date-time; a date
stands for 00:00 UTC of that day, and a date-time without an offset is
read as UTC). A version stays in force until the next one takes effect.

A contract instance that starts at or after the time a version takes
effect is an instance of that version. An instance that is **running**
then (it has started and not ended) follows the transitional rule of
its contract in the **new** version: the entry under
`transitional.contracts` for the contract, or `transitional.default`,
which defaults to `switch`.

| Rule | Lifecycle, monitors, guarantees | Norms (Appendix F) |
| --- | --- | --- |
| `keep` | The instance continues under the version it started under until it ends: its deadlines, monitors, `assume:` and `guarantee:` are those of the old version. | The norm instances are not amended; their `on_amendment:` is not applied. |
| `switch` | The instance moves to the new version when the version takes effect, or with `in_states:` at the first observation, at or after that time, at which it is in one of the listed states (an instance that ends before is never moved). From then on it follows the new version; the time already spent in its current state counts against the new deadlines. | When the instance moves, F.6 applies at that observation: each active or suspended norm instance follows its `on_amendment:` (`carry_over`, `discharge`, `transform:`). |

`switch` is the rule that [Appendix F, F.6](./appendix-f-norms.md)
assumes: F.6 says what an amendment does to the norm instances of a
contract instance, and this section says whether and when a contract
instance is amended. The two do not overlap. As F.6 requires, the
current state of an instance that switches must be a state of the new
version; `in_states:` restricts the switch to states for which this
holds. A version that has no `transitional:` lets every running
instance switch when it takes effect, which is the behaviour of a file
without the extension under F.6.

`keep` corresponds to the transitional provision "an order or a wait
begun before the change keeps the old deadlines" of
[Exercise 12-3](../handson/robot-town-tutorial.md); `switch` with
`in_states:` lets, for example, an order switch only while it has not
been picked up (`in_states: [Assigned]`).

## K.5 Metrics: schedules, measurement, and decision records

### Syntax

```ebnf
(* additions to metric_def (A.3) *)
                [ "schedule:" , { "-" , schedule_entry } ] ,
                [ "measure:"  , measure_def ]

schedule_entry  = "from:"   , ( time_point | "version:" , scalar ) ,
                  "target:" , scalar ,
                  [ "decision:" , identifier ] ;
measure_def     = [ "window:"      , duration_lit ] ,
                  [ "every:"       , duration_lit ] ,
                  [ "aggregate:"   , aggregate ] ,
                  [ "runs:"        , int_literal ] ,
                  [ "across_runs:" , aggregate ] ,
                  [ "description:" , text ] ,
                  [ "decision:"    , identifier ] ;
aggregate       = "mean" | "median" | "min" | "max" | "sum" | "last" ;

decision_def    = "id:"  , identifier ,
                  "ref:" , text ,                      (* a URI reference *)
                  [ "kind:" , ( "gsn" | "record" ) ] ,
                  [ "text:" , text ] ;
```

### Meaning

**Schedule.** The target of a metric at a time is the `target:` of the
last entry of `schedule:` whose `from:` is not after that time, and the
metric's own `target:` before the first entry. The entries of one
schedule use one form of `from:`. With `period:` or `at:` they are in
increasing order of time. With `version:`, an entry applies from the
time that version of the model takes effect, and the entries are listed
in the order in which their versions take effect. A target is written
as the `target:` of a metric (A.3) and is not interpreted further.

**Measurement.** One measurement of the metric covers a window of
length `window:`. With `every:`, the formula is evaluated at that
interval within the window and the values are combined by `aggregate:`
(default `mean`); without it, the formula is evaluated once over the
window. With `runs:`, one measurement is taken in that many independent
runs (for example simulations with different random seeds) and the
values are combined by `across_runs:` (default `mean`). The target is
compared with the measurement. `description:` says in words what the
measurement means, for a reader.

**Decision records.** `amendment.decisions` lists the records of human
decisions on which this version rests. `ref:` is a URI reference
(RFC 3986), relative to the file or absolute, for example
`decisions.md#d1` or `gsn.yaml#S2`; `kind:` says whether it names a
node of a GSN assurance case (`gsn`) or an entry of a record of
decisions (`record`), and `text:` summarises it. A parameter (the
decision that set its current value), a schedule entry (the decision
that set the target), and a measurement method (the decision that chose
it) name a record with `decision:`. The extension does not read the
records.

## K.6 Static semantics {/* #k6-static-semantics */}

In a file that declares `amendment: 0.1`, a processor MUST report the
following as errors.

- **K-1** `amendment:` and each of its parts are mappings or sequences
  as K.3 to K.5 give them, with no keys other than those listed.
- **K-2** A file with `amendment:` gives `sos.version`. `previous:` is a
  scalar other than `sos.version`.
- **K-3** A `time_point` has exactly one of `period:`, a positive
  integer, and `at:`, an ISO 8601 date or date-time.
- **K-4** A transitional rule is `keep` or `switch`. A
  `transitional_entry` names a contract of the file, at most once.
  `in_states:` is given only with `switch` and names states of the
  contract's `lifecycle:` that are not terminal.
- **K-5** A `decision_def` has an identifier as `id:`, unique among the
  decisions, a `ref:` without white space, and a `kind:` from the list.
- **K-6** `decided_by:` names an actor of the file (by the id, with or
  without an index) or a role of an actor; every item of `voters:` names
  an actor.
  A layer of `layers:` is one of `rule`, `contract`, `regulation`, and
  its authority has `decided_by:`. `procedure: vote` has a positive
  `quorum:`, no larger than the number of `voters:` when they are all
  actors without an index; `quorum:` and `voters:` are given only with
  `procedure: vote`. Every parameter has an authority, its own or that
  of its layer.
- **K-7** A parameter has an identifier as `id:`, unique among the
  parameters, a layer from the list, and a number or a duration as
  `value:`; `unit:` is a string and `safety:` a boolean.
- **K-8** `min:`, `max:`, and `step:` are of the kind of `value:`;
  `step:` is positive and `min:` is not greater than `max:`; `value:`
  lies in `[min, max]` and, when `min:` and `step:` are given, differs
  from `min:` by a whole number of steps. `max_steps:` is a positive
  integer and is given only with `step:`. A processor SHOULD warn when a
  parameter located at `alpha`, `beta`, or `lambda` of a contract is not
  a number or declares `min:` below 0 or `max:` above 1, the range of
  these values (A.12).
- **K-9** `at:` is a non-empty list of distinct locations; each
  resolves (K.3), is not inside `version:` or `amendment:`, and holds
  the parameter. A processor SHOULD warn when two parameters have the
  same value at the same location, or one inside the other: an
  amendment of one could not be told from one of the other. It SHOULD
  also warn when a location is a mapping or a sequence, or holds the
  value more than once: every such literal counts as the parameter.
- **K-10** A `decision:` names a decision of `amendment.decisions`.
- **K-11** A `schedule:` is a non-empty list of entries with one form
  of `from:`, in increasing order for `period:` and `at:` and with
  distinct versions for `version:`; a `target:` is a string or a
  number.
- **K-12** `window:` and `every:` are positive durations, `every:` is
  given only with `window:` and is not longer; `aggregate:` and
  `across_runs:` are from the list and are given only with `every:` and
  `runs:` respectively; `runs:` is a positive integer.
- **K-13** A file that uses `amendment:`, `schedule:`, or `measure:`
  without declaring `amendment: 0.1` gets one warning; the keys are not
  checked and not lowered to the IR.

A processor SHOULD report, as information, a contract whose running
instances keep the old version while it has norms: their
`on_amendment:` does not apply (K.4).

## K.7 Comparing two versions {/* #k7-comparing-two-versions */}

Two versions of a model are compared under the declaration of the
**old** one, since that is the declaration under which the amendment is
made. An old version that does not declare `amendment: 0.1` declares no
parameter, whatever keys it has. A change of the model **respects the
declared amendability** when it is the change of declared parameters
at their locations, each within the bounds of its old declaration:

1. For each parameter of the old version whose value changes, the new
   value is of the same kind, lies in the old `[min, max]`, lies on the
   old steps from `min:`, and differs from the old value by at most
   `max_steps` × `step`.
2. Replacing in the old version, in one pass, the occurrences of the
   old value of every changed parameter at each of its locations by its
   new value gives the new version, apart from `version:`,
   `amendment:`, and the sections that are not rules: `name:`,
   `description:`, `metrics:`, `codegen:`, and `motivation:`.
   `verification:` is compared like the rules, since a change of it can
   weaken what is proved. Values are compared as in K.3: `60s` and
   `1min` are equal. The replacement is **ambiguous**, and the change is
   not explained, when a location holds the old value more than once
   (the other occurrences would change with it), or when two changed
   parameters have the same old value at the same place and give it
   different new values.
3. A list whose items have ids keeps the order of the items that both
   versions have, where the semantics use that order: the norms of a
   contract (F.5, step 2, processes them in declaration order) and the
   actors (the file order of Appendix J). A change of order of another
   such list SHOULD be reported as a warning.
4. `previous:` of the new version, when given, is the `sos.version` of
   the old one, and the two versions differ. When both give an
   effective time of the same form, the new one is later; a period and
   a time cannot be compared, and a processor SHOULD say so.
5. For a contract that changes and whose running instances switch, the
   states in which an instance may switch (`in_states:`, or every state
   that is not terminal) are states of the new version (F.6). A removed
   state is already a change that no parameter explains (item 2); a
   processor SHOULD add, as a warning, which switching instances it
   affects, without counting it as a second error.

A change of the declaration itself (a parameter's layer, authority,
range, step, or locations, a parameter that is added) is not covered by
the declaration, and a processor SHOULD report it. A change of a
section that is not a rule SHOULD be reported. For every contract with
norms whose running instances switch, whether or not its text changes,
a processor SHOULD report what F.6 does to its norms, as
`cadl norms-diff` does: every running instance of it is amended.

## K.8 Intermediate Representation (IR) addition

For a file that declares `amendment: 0.1` and uses its keys, the IR
gets the top-level key `amendment`. Durations are in milliseconds
(`kind: duration`, `unit: ms`), numbers are written as numbers, and
each parameter carries its resolved authority.

```json
"amendment": {
  "version": "2", "previous": "1", "effective": { "period": 2 },
  "transitional": {
    "default": "keep",
    "contracts": [ { "contract": "ROAD_USE", "rule": "switch", "in_states": [] } ]
  },
  "decisions": [ { "id": "D1", "ref": "decisions.md#d1", "kind": "record" } ],
  "parameters": [
    { "id": "block_k", "layer": "rule", "kind": "number", "unit": null,
      "value": 2, "min": 1, "max": 4, "step": 1, "max_steps": 1, "safety": false,
      "decided_by": "COUNCIL", "procedure": "vote", "quorum": 2, "voters": [],
      "at": ["contracts.ROAD_USE.monitors.blocking_guard.rule"], "decision": "D1" }
  ],
  "metrics": [
    { "id": "on_time_deliveries",
      "measure": { "window_ms": 3600000, "runs": 5, "across_runs": "mean",
                   "decision": "K1" },
      "schedule": [ { "from": { "period": 5 },
                      "target": ">= 0.85 * count(orders)", "decision": "K5" } ] }
  ]
}
```

The entries of `metrics` of the core IR keep `id`, `formula`, and
`target` only; the additions are under `amendment.metrics`. The key is
absent for a file without the declaration or without the keys.

## K.9 Example and reference implementation status {/* #k9-reference-implementation-status */}

The `cadl` repository has the robot town of Course D with the
extension in two versions,
`examples/amendment_robot_town_v1.cadl` and `_v2.cadl`. Excerpt of
version 2:

```yaml
sos:
  name: "RobotTown"
  version: "2"
  extensions:
    - sos-dsl: 0.1
    - amendment: 0.1
  actors:
    # TOWN_STEWARD, "ROBOT[1..N]", COUNCIL as in the hands-on, and the human:
    - { id: OPERATOR, role: "service_operator", autonomy: high }
  # contracts DELIVERY_SLA and ROAD_USE, transitions, protocols as in the hands-on
  metrics:
    - id: on_time_deliveries
      formula: "count(Delivered)"
      target: ">= 0.9 * count(orders)"
      measure: { window: 3600s, runs: 5, across_runs: mean, decision: K1 }
      schedule:
        - { from: { period: 5 }, target: ">= 0.85 * count(orders)", decision: K5 }
  amendment:
    previous: "1"
    effective: { period: 2 }
    transitional:
      default: keep                 # an order under way keeps its deadlines
      contracts:
        - { contract: ROAD_USE, rule: switch }
    decisions:
      - { id: K1, ref: "decisions.md#k1", kind: record }
      - { id: K5, ref: "gsn.yaml#G5", kind: gsn }
      - { id: D1, ref: "decisions.md#d1", kind: record }
    layers:
      rule:     { decided_by: COUNCIL, procedure: vote, quorum: 2 }
      contract: { decided_by: OPERATOR }
    parameters:
      - { id: hold_limit, layer: rule, value: 60s, min: 10s, max: 120s, step: 10s,
          at: [contracts.ROAD_USE.lifecycle.transitions.release.deadline] }
      - { id: block_k, layer: rule, value: 2, min: 1, max: 4, step: 1, decision: D1,
          at: [contracts.ROAD_USE.monitors.blocking_guard.rule] }
      - { id: to_central, layer: rule, safety: true, decided_by: OPERATOR,
          value: 22, min: 10, max: 30, step: 2, unit: orders,
          at: ["transitions.DISTRIBUTED->CENTRALIZED.condition"] }
      - { id: pickup_deadline, layer: contract, value: 120s, min: 60s, max: 180s,
          step: 30s,
          at: [contracts.DELIVERY_SLA.lifecycle.transitions.pickup.deadline,
               contracts.DELIVERY_SLA.guarantee.0] }
      # sanction_lambda, to_distributed, dropoff_deadline likewise
```

`cadl amend-diff` compares the two versions (abridged):

```text
$ cadl amend-diff examples/amendment_robot_town_v1.cadl examples/amendment_robot_town_v2.cadl
Amendment from ... (version 1) to ... (version 2) (amendment 0.1, K.7)
  takes effect: period 2
  decisions: K1 (decisions.md#k1), K5 (gsn.yaml#G5), D1 (decisions.md#d1)

Parameters
           hold_limit: 60s → 60s (rule, COUNCIL by vote, quorum 2)
  changed  block_k: 3 → 2 (rule, COUNCIL by vote, quorum 2)
           ...
           pickup_deadline: 120s → 120s (contract, OPERATOR)

Contract ROAD_USE: changed by block_k (transitional: switch)
  info     running instances switch to the new version when the new version takes effect

Result: the changes respect the declared amendability
```

A version that moves `block_k` from 3 to 1 at once and also makes the
overstay of `ROAD_USE` a `Major` violation gets two errors: `block_k`
"moves by 2, more than 1 step of 1", and the severity "is changed and
no declared parameter explains it". The exit status is then 1.

From `cadl` 0.3.32 the reference implementation provides:

- `cadl check`: the rules K-1 to K-13, including the information of
  K.6 for a kept contract with norms;
- `cadl sim-ir`: the IR addition of K.8;
- `cadl amend-diff OLD NEW` (text or `--format json`): the comparison
  of K.7. It lists every declared parameter with its old and new value,
  layer, and authority, every contract that changed with the parameters
  that changed it and its transitional rule, and the findings. An
  unexplained change of the rules (including `verification:` and the
  order of the actors and of the norms) and an ambiguous replacement
  are errors; a change of the sections that are not rules, of the order
  of other lists, and of the declaration is a warning, and so is an old
  version without the declaration (every change of the rules is then
  unexplained). A `previous:` that is not the old version, the same
  version on both sides, and an effective time that is not later are
  errors. For every contract with norms that switches, the findings of
  `cadl norms-diff` for that contract are included, also when its text
  is unchanged; for one that keeps, they are not, since F.6 does not
  apply. Exit status 0 when the
  changes respect the declared amendability, 1 when they do not or the
  new version does not pass `cadl check`, 2 for a missing file or an
  old version that does not pass `cadl check`.

Not provided: no tool applies versions, effective times, or
transitional rules while a system runs. `cadl norms-eval` and
`cadl agents-run` amend where a trace says `amend`, for every running
instance, which is `switch` at the effective time; a host that keeps
instances writes no `amend` for them. The models of `cadl norms-check`
(F.12) amend every instance at the same observation, which is `switch`.
The schedules and measurement methods are not evaluated (no tool
evaluates metrics), and decision records are not opened.

## K.10 Backward compatibility

The extension adds keys only. A file that uses none of them gives the
same results as with `cadl` 0.3.31 for `cadl check`, `cadl sim-ir`, and
`cadl verify`. For `cadl` 0.3.32 this was compared with 0.3.31 on the
78 example and test files of the `cadl` repository, and the test suite
checks that no bundled example without the keys gets the IR addition
or a diagnostic of the extension.
Keys of the extension in a file that does not declare it get one
warning (K-13) and are otherwise ignored, as A.2 asks of keys that are
not part of a version of the language. The core `metrics` entries of
the IR are unchanged also for a file that declares the extension.
