---
sidebar_position: 5
title: "5. Language Specification"
description: "Structure of a CADL file, description levels, data model (types, actors, contracts, protocols), main syntax rules, and semantics."
---

## 5.1 Overall Structure
A CADL description consists of the following top-level elements. One
CADL file contains one SoS definition. A CADL file is a YAML document;
CADL expressions (predicates, steps) are written inside YAML strings.

```yaml
sos:
  name: <identifier>            # SoS name
  type: <Directed|Acknowledged|Collaborative|Virtual>  # SoS classification
  version: <semantic_version>

  context:                      # Environment and preconditions
    environment: { ... }
    assumptions: [ ... ]

  actors:                       # Constituent system (actor) definitions
    - id: <identifier>
      role: <string>
      autonomy: <low|medium|high>
      capabilities: [ ... ]

  contracts:                    # Contract definitions (core element)
    - id: <identifier>
      parties: [ ... ]
      assume: [ ... ]           # Preconditions (assume-guarantee)
      guarantee: [ ... ]        # Guarantee conditions
      authority: { ... }        # Authority structure
      information: { ... }      # Information sharing structure
      responsibilities: { ... } # Responsibility distribution
      incentives: { ... }       # Incentive structure

  protocols:                    # Protocol definitions
    - id: <identifier>
      trigger: <event_expression>
      steps: [ ... ]
      timing: { ... }
      fallback: { ... }

  algorithms:                   # Algorithm references
    <function_name>:
      central: <algorithm_name>
      local: <algorithm_name>

  transitions:                  # Institutional transition definitions
    - from: <regime_id>
      to: <regime_id>
      condition: <predicate_expression>
      protocol: <transition_protocol_id>
      safety_invariant: <safety_condition>

  metrics:                      # Evaluation metric definitions
    - id: <identifier>
      formula: <expression>
      target: <target_value>
```

The skeleton shows the main blocks only; `description`, `verification`,
`codegen`, `extensions`, and `motivation` are omitted. The complete list
of keys is in [Appendix A, §A.11](./appendix-a-syntax.md#a11-reserved-keywords).

In v0.2 a regime is a name. It is introduced by appearing in `from:` /
`to:` of `transitions:`; there is no separate declaration, and the
language has no syntax that attaches contracts or parameter values to a
regime.

### 5.1.1 Graduated Description Levels

CADL provides three graduated description levels according to user
expertise and purpose. The overview level is informal and lies outside
the grammar ([Appendix A](./appendix-a-syntax.md) says such a description need not conform
to it). Its keys are free-form: the author may choose any keys, in any
language (the overview-level example below uses `content:` and
`conflict_resolution:`, which Appendix A does not define). Moving to the design level means rewriting it into the structure
shown in the design-level example below; design-level files are extended
to the verification level by adding blocks.

| **Description Level** | **Target Users** | **Content** | **Syntax Features** |
|---|---|---|---|
| Overview | Citizens, Municipal Officials<br />Enterprise Practitioners, Students | SoS name, Actor roles,<br />Contract overview (natural language),<br />Basic rules | Allow natural language-like descriptions<br />Parameters and constraints optional<br />Entry point for AI generation |
| Design | Designers, Researchers<br />Advanced Students | Institutional parameters (α,β,λ),<br />Protocol procedures,<br />Transition conditions, Metrics | Explicit parameter values<br />Type annotations<br />Constraint expressions |
| Verification | SoS Architects<br />Verification Engineers | assume-guarantee contracts,<br />Safety invariants,<br />Formal properties (temporal logic) | Formal predicates and quantifiers<br />Annotations for SMT/model checking<br />Code generation/synthesis specification |

v0.2 has no syntax for type annotations or temporal-logic properties:
"Type annotations" in the design-level row and the verification-level
row describe the intended direction. What a verification-level file can
contain in v0.2 is shown in the fragment below.

Below is an example showing how the same institution for household
"chore-sharing rules" is described at the overview level, at the
design level, and, as a fragment added to the design-level file, at the
verification level.

```yaml
# === Overview Level: For Citizens and Students ===
sos:
  name: "Household Chore-Sharing"
  type: Collaborative
  description: "Rules for fairly sharing household chores among a family of 4"

  actors:
    - Parents (2): Assign chores
    - Children (2): Perform assigned chores

  contracts:
    - name: "Chore-Sharing Rules"
      content: >
        Each week, parents assign chores.
        Children must complete by dinner time.
        Completion earns 100 yen pocket money.
      conflict_resolution: "Resolve by discussion. If no agreement, parents decide."
```

```yaml
# === Design Level: Adding Parameters and Protocols ===
sos:
  name: "FamilyHousehold"
  type: Collaborative
  version: "1.0.0"

  actors:
    - id: PARENT[1..2]
      role: "parent"
      autonomy: high
    - id: CHILD[1..2]
      role: "child"
      autonomy: medium
    - id: AI_ASSISTANT
      role: "mediator"
      autonomy: low

  contracts:
    - id: CHORE_SHARING
      parties: ["PARENT[*]", "CHILD[*]"]
      authority:
        decision_holder: PARENT[1]
        beta: 0.7                    # Somewhat centralized
      incentives:
        lambda: 0.6
        rules:
          - "reward(CHILD[i], 100yen) when chore_completed_on_time"

  protocols:
    - id: CONFLICT_RESOLUTION
      trigger: "resource_conflict_detected"
      steps:
        - AI_ASSISTANT : propose_alternatives(all_parties)
        - PARENT[*] : vote(preferred_alternative)
        - CHILD[*] : vote(preferred_alternative)
        - if consensus_reached:
            - AI_ASSISTANT : update_schedule
          else:
            - PARENT[1] : make_final_decision
```

A verification-level description adds a `verification:` block to the
design-level file; its syntax is in
[Appendix A, §A.8](./appendix-a-syntax.md#a8-verification-block). The
fragment below is appended to the design-level example, under `sos:` at
the same indentation as `protocols:`.

```yaml
  # === Verification Level: block appended to the design-level file ===
  verification:
    - id: CHORE_CONSISTENCY        # Target only
      type: consistency
      target: CHORE_SHARING
      method: smt
    - id: REWARD_BOUND             # With a predicate (Appendix A, A.10)
      type: safety
      target: CHORE_SHARING
      property: "The weekly reward stays within the budget"
      method: smt
      expr: "weekly_reward >= 0 AND weekly_reward <= 400"
```

With this block appended, `cadl verify` (v0.3.8) accepts the file and
reports both entries as passed. For the entry with `expr:` it checks
only that the predicate is satisfiable; it does not prove it against
the model
([Appendix A, §A.12](./appendix-a-syntax.md#a12-reference-implementation-status-v03)).

[Section 7.1](./07-examples.md) illustrates the contradiction detection
that the verification level aims at
([Objective 2 of Section 1.2](./01-introduction.md#objective-2-computing-institutional-violations-and-contradictions)).
Its listings are conceptual and use keys other than those of §A.8 (see
the note at the beginning of Chapter 7).
In this way, the
same institution can be described at different granularities according
to user needs, and AI supports refinement from overview level to design
and verification levels.

## 5.2 Data Model
### 5.2.1 Type System

The table below lists the built-in types of CADL. They are
part of the language design; the reference implementation at v0.3 does
not check them (Appendix A, A.12).

| **Type Name** | **Description** | **Example** |
|---|---|---|
| Int | Integer type | latency_ms: 100 |
| Float | Floating-point type | failure_rate: 0.002 |
| Bool | Boolean type | is_active: true |
| String | String type | role: "vehicle" |
| Duration | Duration type | timeout: 100ms, 5s, 1min |
| Range | Range type | latency: Range(0, 200) |
| Dist | Probability distribution type | demand: Normal(15, 3) |
| Enum | Enumeration type | autonomy: low \| medium \| high |
| Set | Set type | `parties: [CENTRAL, "TAXI[*]"]` |
| Map | Map type | views: \{ CENTRAL: "global", TAXI: "local" \} |
| Actor | Actor reference type | decision_holder: CENTRAL |
| ActorSet | Actor set type (wildcard support) | TAXI[*], SENSOR[1..N] |

### 5.2.2 Actor Model

An actor is the basic unit representing a constituent system in an SoS.
Each actor has a unique identifier and declares its role, autonomy
level, and capabilities. Sets of actors can be referenced using wildcard
notation ([*]) or index ranges ([1..N]).
The upper bound of a range is an integer or a name. A name such as `N`
is a symbolic size: v0.2 has no construct that gives it a value, so the
description stands for any number of actors. The reference
implementation keeps such a range as written. It does not take `N` from
`context.environment`, and `cadl sim-gen` writes an actor count only
for a range whose bounds are both integers (`[1..3]` gives `count: 3`);
for `[1..N]` the generated configuration carries no count
([Appendix A, §A.12](./appendix-a-syntax.md#a12-reference-implementation-status-v03)).

```yaml
actors:
  - id: CENTRAL
    role: "global_planner"
    autonomy: low
    capabilities:
      - compute_routes
      - monitor_all
    interface:
      input: [taxi_positions, failure_reports]
      output: [route_assignments]

  - id: TAXI[1..N]       # Parametrically define N taxis
    role: "vehicle"
    autonomy: high
    capabilities:
      - local_navigation
      - obstacle_detection
    interface:
      input: [assigned_route, road_status]
      output: [position, sensor_data]
```

`autonomy:` (`low` / `medium` / `high`; default `medium`) and the
file-level `type:` (`Directed` / `Acknowledged` / `Collaborative` /
`Virtual`) are descriptive labels: the reference implementation records
them and passes them to reports and generated configs, but does not
check them against β or anything else.

### 5.2.3 Contract Model

A contract is the core element of CADL, based on assume-guarantee
semantics. Each contract has the following sub-elements:

| **Sub-element** | **Description** |
|---|---|
| assume | Preconditions. Conditions that the environment and other actors must satisfy for the contract to be valid. |
| guarantee | Guarantee conditions. Properties that contract parties promise to provide when preconditions are met. |
| authority | Decision scope and decision maker. Contains centralization parameter β. |
| information | Holds `alpha` (sharing degree parameter α), the `views` each party has, and the `sharing` flows (`source -> target : item`). A push/pull/broadcast sharing mode cannot be expressed in v0.2 (in the example below, the comments on the `sharing:` entries note whether a flow is periodic or event-driven; they are comments only). |
| responsibilities | List of obligations and tasks for each party. |
| incentives | Definition of rewards, penalties, and reputation mechanisms. Contains intensity parameter λ. |
| duration | Validity period of the contract. Three types: indefinite, time-limited, event-driven. |
| violation | Violation detection conditions and corresponding actions. |

```yaml
contracts:
  - id: CENTRALIZED_ROUTING
    parties: [CENTRAL, "TAXI[*]"]

    assume:
      - "CENTRAL.is_operational == true"
      - "network_latency <= 200ms"
      - "for all t in TAXI[*]: has_capability(t, local_navigation)"

    guarantee:
      - "all_routes_conflict_free()"
      - "route_update_delay <= 100ms"

    authority:
      decision_scope: "route_assignment"
      decision_holder: CENTRAL
      beta: 0.9          # Decision centralization (0=fully distributed, 1=fully centralized)

    information:
      alpha: 0.9          # Information sharing degree
      views:
        CENTRAL: "global_road_graph + all_taxi_positions"
        TAXI[*]: "assigned_route + local_sensors"
      sharing:
        - "TAXI[*] -> CENTRAL : position"       # Periodic (1 second period)
        - "CENTRAL -> TAXI[*] : route"          # Event-driven

    responsibilities:
      CENTRAL:
        - compute_conflict_free_routes(all_taxis)
        - update_routes_on_failure
      TAXI[*]:
        - follow_route
        - "report_position(period: 1s)"
        - report_detected_failures

    incentives:
      type: reputation
      lambda: 0.5
      rules:
        - "reward(TAXI[i], 10) when on_time_delivery"
        - "penalty(TAXI[i], -5) when route_deviation"

    violation:
      detect: "route_deviation > threshold OR position_report_delay > 5s"
      action: "notify(CENTRAL) AND log_violation"
      escalation: "after 3 violations: suspend_contract"

    duration: indefinite
```

### 5.2.4 Protocol Model

A protocol defines coordination procedures between actors. There are
five kinds of step.

- **Message transmission** (`A -> B : m`, arrow notation) — actor A sends
  the message `m` to actor B.
- **Local computation** (`A : f(x)`, colon notation) — actor A performs a
  computation of its own.
- **Conditional branching** (`if` / `else`) — the steps under `if` are
  taken when its condition holds, and those under `else:` otherwise.
- **`parallel:`** — the steps listed under it have no fixed order among
  themselves, and the protocol continues when all of them have completed.
- **`barrier:`** — a synchronisation point: the protocol continues only
  when the given condition holds.

The reference implementation at v0.3 does not retain the `else:` branch
or the barrier condition ([Appendix A, §A.12](./appendix-a-syntax.md#a12-reference-implementation-status-v03)).

```yaml
protocols:
  - id: FAILURE_REPLAN
    trigger: "road_failure_detected_by(TAXI[i])"
    precondition: "CENTRAL.is_operational"

    steps:
      - TAXI[i] -> CENTRAL : failure_report(road_id, severity)
      - CENTRAL : validate_failure(road_id)
      - if severity >= HIGH:
          - CENTRAL : recompute_routes(all_taxis)
          - CENTRAL -> TAXI[*] : new_route
        else:
          - CENTRAL : recompute_routes(affected_taxis)
          - CENTRAL -> TAXI[*] : new_route

    timing:
      max_response: 100ms
      max_total: 500ms

    fallback:
      on_timeout: "TAXI[*] : execute_safe_stop()"
      on_failure: "switch_to_protocol(LOCAL_REPLAN)"

    postcondition: "all_routes_conflict_free()"

  - id: REGIME_TRANSITION
    trigger: "regime_map.recommend(new_regime) != current_regime"

    steps:
      - CENTRAL -> TAXI[*] : transition_notice(new_regime, deadline)
      - parallel:
          - TAXI[*] : prepare_for_transition()
          - CENTRAL : verify_safety_invariants(new_regime)
      - barrier: all_ready(TAXI[*])
      - CENTRAL : activate_regime(new_regime)
      - CENTRAL -> TAXI[*] : regime_activated

    timing:
      max_total: 30s
      checkpoint_interval: 5s

    rollback:
      condition: "NOT all_ready(TAXI[*]) within 20s"
      action: "revert_to(current_regime)"

    safety_invariant: "no_collision AND service_continuity"
```

## 5.3 Syntax Definition
A CADL file is a YAML document. Below are the main syntax rules of CADL
in EBNF (Extended Backus-Naur Form), using the notation of
[Appendix A](./appendix-a-syntax.md): a terminal ending in a colon is a
key of a YAML mapping, the entries of a mapping may appear in any order,
and `{ "-" , x }` is a YAML sequence of `x`. For the complete grammar,
including the expression syntax of predicates, see
[Appendix A](./appendix-a-syntax.md), which is normative for the
concrete syntax. The rules below are abridged: they leave out
`extensions:` and `motivation:` of the file and `lifecycle:` and
`monitors:` of a contract (Appendix A, §A.2 and §A.4), as well as the
rules of the nested blocks.

```ebnf
(* CADL EBNF - Main Rules (abridged; Appendix A is normative) *)

cadl_file = "sos:" , sos_definition ;
sos_definition = "name:" , text ,
    [ "type:" , sos_type ] ,
    [ "version:" , scalar ] ,
    [ "description:" , text ] ,
    [ "context:" , context_block ] ,
    [ "actors:" , { "-" , actor_def } ] ,
    [ "contracts:" , { "-" , contract_def } ] ,
    [ "protocols:" , { "-" , protocol_def } ] ,
    [ "algorithms:" , { algorithm_def } ] ,
    [ "transitions:" , { "-" , transition_def } ] ,
    [ "metrics:" , { "-" , metric_def } ] ,
    [ "verification:" , { "-" , verify_def } ] ,
    [ "codegen:" , { "-" , codegen_def } ] ;

sos_type = "Directed" | "Acknowledged" | "Collaborative" | "Virtual" ;

actor_def = "id:" , actor_ref ,
    "role:" , text ,
    [ "autonomy:" , autonomy_level ] ,
    [ "capabilities:" , { "-" , text } ] ,
    [ "interface:" , interface_def ] ;

actor_ref = identifier , [ "[" , ( "*" | range_expr | int_literal | identifier ) , "]" ] ;
autonomy_level = "low" | "medium" | "high" ;

contract_def = "id:" , identifier ,
    "parties:" , { "-" , actor_ref } ,
    [ "assume:" , { "-" , predicate } ] ,
    [ "guarantee:" , { "-" , predicate } ] ,
    [ "authority:" , authority_block ] ,
    [ "information:" , information_block ] ,
    [ "responsibilities:" , { actor_ref , ":" , { "-" , text } } ] ,
    [ "incentives:" , incentive_block ] ,
    [ "violation:" , violation_block ] ,
    [ "duration:" , scalar ] ;

protocol_def = "id:" , identifier ,
    "trigger:" , text ,
    [ "precondition:" , text ] ,
    "steps:" , { "-" , step } ,
    [ "timing:" , { identifier , ":" , scalar } ] ,
    [ "fallback:" , { identifier , ":" , text } ] ,
    [ "rollback:" , rollback_block ] ,
    [ "postcondition:" , text ] ,
    [ "safety_invariant:" , text ] ;

step = message_step | compute_step | conditional_step
     | parallel_step | barrier_step ;
message_step = actor_ref , "->" , actor_ref , ":" , step_expr ;
compute_step = actor_ref , ":" , step_expr ;
```

Only `id` and `parties` are required in a contract; the examples in this
chapter omit the blocks they do not need. `autonomy` defaults to
`medium`.

Because the file is YAML, some scalars have to be quoted. A protocol
step may be written unquoted: YAML reads `A -> B : m` as a one-entry
mapping, which the parser accepts, though the quoted form
(`- "A -> B : m"`) is recommended. An entry of `sharing:`
(`- "TAXI[*] -> CENTRAL : position"`) and an actor reference with an
index inside an inline list (`parties: [CENTRAL, "TAXI[*]"]`) MUST be
quoted (Appendix A, notation and §A.4); otherwise YAML reads them
differently or rejects them. The reference implementation silently
drops an unquoted `sharing:` entry
([Appendix A, §A.12](./appendix-a-syntax.md#a12-reference-implementation-status-v03)).

## 5.4 Semantics
### 5.4.1 Assume-Guarantee Semantics of Contracts

CADL contracts are based on contract-based design theory by Benveniste
et al. and continuous-time assume-guarantee contracts by Saoud et al. In
a contract C = (A, G), A is the precondition (assume) and G is the
guarantee condition. Composition and saturation are due to Benveniste et
al., and the distinction between weak and strong satisfaction to Saoud
et al. (see [Appendix B](./appendix-b-references.md)).

Saturated form: A contract C = (A, G) is in saturated (canonical) form
when G already contains every behaviour that violates A, i.e. G is
replaced by G ∨ ¬A.

Consistency: A contract is consistent when A ∧ G is satisfiable. This is
the property the reference verifier checks per contract and for pairs of
contracts that share a party.

Contract composition: The parallel composition of two contracts C₁ =
(A₁, G₁) and C₂ = (A₂, G₂) is defined, for contracts in saturated (canonical) form, as
C₁ ⊗ C₂ = ((A₁ ∧ A₂) ∨ ¬(G₁ ∧ G₂), G₁ ∧ G₂).

Weak and strong satisfaction: Under weak satisfaction a component must
meet G for as long as A has held so far; under strong satisfaction it
must continue to meet G for a short time after A stops holding, which is
what breaks circular reasoning between components.
When circular dependencies exist, we follow Saoud et al. and require
strong (rather than weak) satisfaction of the component contracts.

### 5.4.2 Semantics of Institutional Parameters

Institutional parameters α (information sharing degree), β (decision
centralization degree), and λ (incentive intensity) each take a value in
the interval [0, 1]. These parameters continuously control the structural
properties of institutions and form the basis for regime map
construction.

| **Parameter** | **Name** | **Meaning** |
|---|---|---|
| α (alpha) | Information Sharing Degree | 0: No sharing (each actor has only local information)<br />1: Complete sharing (all actors observe all information) |
| β (beta) | Decision Centralization Degree | 0: Complete decentralization (C-SoS: each actor decides autonomously)<br />1: Complete centralization (D-SoS: single actor decides all) |
| λ (lambda) | Incentive Intensity | 0: No incentive (directive-based)<br />1: Strong incentive (market mechanism) |

The correspondence between β and the SoS types shown in the table is a
guide, not a rule that is checked (the example of Section 5.1.1 pairs
`type: Collaborative` with `beta: 0.7`).

### 5.4.3 Operational Semantics of Protocols

Each step of a protocol is interpreted as a labeled transition system
(LTS). Message transmission A -> B : m is defined as synchronized
composition of A's send action and B's receive action. Timing
constraints are encoded as invariants of timed automata; verification
by model checkers such as UPPAAL [[Larsen+, 1997]](./appendix-b-references.md) is the design intent. Model checking is
not integrated in v0.3; deadlock detection is done by structural
analysis ([Section 6.3](./06-design.md)).

## 5.5 Where to Go Next

- Complete grammar and list of keys: [Appendix A](./appendix-a-syntax.md).
- Blocks not detailed in Section 5.2 (`context`, `algorithms`,
  `transitions`, `metrics`, `verification`, `codegen`): specified in
  [Appendix A](./appendix-a-syntax.md), §A.3 and §A.6–A.9.
- Contract lifecycle and monitors (`lifecycle:`, `monitors:`):
  [Appendix E](./appendix-e-sos-dsl.md).
- Motivation extension: [Appendix C](./appendix-c-motivation.md).
- Code generation targets: [Appendix D](./appendix-d-codegen.md).
- Checking a file: `cadl parse`, `cadl check`, and `cadl verify`
  (installation is described in the
  [specification introduction](./intro.md)).
- Runnable examples: the [`examples/` directory](https://github.com/ertlnagoya/cadl/tree/master/examples) of the cadl
  repository.
