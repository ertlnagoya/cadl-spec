---
sidebar_position: 5
title: "Language Specification"
---

## 5.1 Overall Structure
A CADL description consists of the following top-level elements. One
CADL file contains one SoS definition. The syntax is fundamentally
declarative, similar to YAML, combined with type annotations and
constraint expressions.

```yaml
sos:
name: <identifier> # SoS name
type: <Directed|Acknowledged|Collaborative|Virtual> # SoS
classification
version: <semantic_version>

context: # Environment and preconditions
environment: { ... }
assumptions: [ ... ]

actors: # Constituent system (actor) definitions
- id: <identifier>
role: <string>
autonomy: <low|medium|high>
capabilities: [ ... ]

contracts: # Contract definitions (core element)
- id: <identifier>
parties: [ ... ]
assume: { ... } # Preconditions (assume-guarantee)
guarantee: { ... } # Guarantee conditions
authority: { ... } # Authority structure
information: { ... } # Information sharing structure
responsibilities: { ... } # Responsibility distribution
incentives: { ... } # Incentive structure

protocols: # Protocol definitions
- id: <identifier>
trigger: <event_expression>
steps: [ ... ]
timing: { ... }
fallback: { ... }

algorithms: # Algorithm references
<function_name>:
central: <algorithm_name>
local: <algorithm_name>

transitions: # Institutional transition definitions
- from: <regime_id>
to: <regime_id>
condition: <predicate_expression>
protocol: <transition_protocol_id>
safety_invariant: <safety_condition>

metrics: # Evaluation metric definitions
- id: <identifier>
formula: <expression>
target: <target_value>
```

### 5.1.1 Graduated Description Levels

CADL provides three graduated description levels according to user
expertise and purpose. Each level is backward compatible; design-level
and verification-level information can be progressively added to
overview-level descriptions.

  -------------------------------------------------------------------------------------------------------------------------------------------------
  **Description Level**   **Target Users**                     **Content**                              **Syntax Features**
  ----------------------- ------------------------------------ ---------------------------------------- -------------------------------------------
  Overview\               Citizens, Municipal Officials\       SoS name, Actor roles,\                  Allow natural language-like descriptions\
  (Overview)              Enterprise Practitioners, Students   Contract overview (natural language),\   Parameters and constraints optional\
                                                               Basic rules                              Entry point for AI generation

  Design\                 Designers, Researchers\              Institutional parameters (α,β,λ),\       Explicit parameter values\
  (Design)                Advanced Students                    Protocol procedures,\                    Type annotations\
                                                               Transition conditions, Metrics           Constraint expressions

  Verification\           SoS Architects\                      assume-guarantee contracts,\             Formal predicates and quantifiers\
  (Verification)          Verification Engineers               Safety invariants,\                      Annotations for SMT/model checking\
                                                               Formal properties (temporal logic)       Code generation/synthesis specification
  -------------------------------------------------------------------------------------------------------------------------------------------------

Below is an example showing how the same institution for household
"chore-sharing rules" is described at three different levels.

```yaml
# === Overview Level: For Citizens and Students ===
sos:
name: "Household Chore-Sharing"
type: Collaborative
description: "Rules for fairly sharing household chores among a
family of 4"

actors:
- Parents (2): Assign chores
- Children (2): Perform assigned chores

contracts:
- name: "Chore-Sharing Rules"
content: >
Each week, parents assign chores.
Children must complete by dinner time.
Completion earns 100 yen pocket money.
conflict_resolution: "Resolve by discussion. If no agreement,
parents decide."

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

contracts:
- id: CHORE_SHARING
parties: [PARENT[*], CHILD[*]]
authority:
decision_holder: PARENT[1]
beta: 0.3 # Somewhat centralized
incentives:
lambda: 0.6
rules:
- "reward(CHILD[i], 100yen) when chore_completed_on_time"

protocols:
- id: CONFLICT_RESOLUTION
trigger: "resource_conflict_detected"
steps:
- AI_ASSISTANT : propose_alternatives(all_parties)
- conflicting_parties : vote(preferred_alternative)
- if consensus_reached:
- AI_ASSISTANT : update_schedule
else:
- PARENT[1] : make_final_decision
```

For verification-level description examples, see Section 7.1 for
contradiction detection and verification (Objective 2). In this way, the
same institution can be described at different granularities according
to user needs, and AI supports refinement from overview level to design
and verification levels.

## 5.2 Data Model
### 5.2.1 Type System

CADL provides the following basic and user-defined types.

  **Type Name**   **Description**                     **Example**
  --------------- ----------------------------------- -------------------------------------------------
  Int             Integer type                        latency_ms: 100
  Float           Floating-point type                 failure_rate: 0.002
  Bool            Boolean type                        is_active: true
  String          String type                         role: "vehicle"
  Duration        Duration type                       timeout: 100ms, 5s, 1min
  Range           Range type                          latency: \{ min: 0, max: 200 \}
  Dist            Probability distribution type       demand: Normal(15, 3)
  Enum            Enumeration type                    autonomy: low | medium | high
  Set             Set type                            parties: \{CENTRAL, TAXI[*]\}
  Map             Map type                            views: \{ CENTRAL: "global", TAXI: "local" \}
  Actor           Actor reference type                decision_holder: CENTRAL
  ActorSet        Actor set type (wildcard support)   TAXI[*], SENSOR[1..N]

### 5.2.2 Actor Model

An actor is the basic unit representing a constituent system in an SoS.
Each actor has a unique identifier and declares its role, autonomy
level, and capabilities. Sets of actors can be referenced using wildcard
notation ([*]) or index ranges ([1..N]).

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

- id: TAXI[1..N] # Parametrically define N taxis
role: "vehicle"
autonomy: high
capabilities:
- local_navigation
- obstacle_detection
interface:
input: [assigned_route, road_status]
output: [position, sensor_data]
```

### 5.2.3 Contract Model

A contract is the core element of CADL, based on assume-guarantee
semantics. Each contract has the following sub-elements:

  **Sub-element**    **Description**
  ------------------ ------------------------------------------------------------------------------------------------------------
  assume             Preconditions. Conditions that the environment and other actors must satisfy for the contract to be valid.
  guarantee          Guarantee conditions. Properties that contract parties promise to provide when preconditions are met.
  authority          Decision scope and decision maker. Contains decentralization parameter β.
  information        Observable range and information sharing mode for each party. Contains sharing degree parameter α.
  responsibilities   List of obligations and tasks for each party.
  incentives         Definition of rewards, penalties, and reputation mechanisms. Contains intensity parameter λ.
  duration           Validity period of the contract. Three types: indefinite, time-limited, event-driven.
  violation          Violation detection conditions and corresponding actions.

```yaml
contracts:
- id: CENTRALIZED_ROUTING
parties: [CENTRAL, TAXI[*]]

assume:
- "CENTRAL.is_operational == true"
- "network_latency <= 200ms"
- "TAXI[i].has_capability(local_navigation) for all i"

guarantee:
- "all_routes_conflict_free()"
- "route_update_delay <= 100ms"

authority:
decision_scope: "route_assignment"
decision_holder: CENTRAL
beta: 0.1 # Concentration degree (0=fully centralized, 1=fully
distributed)

information:
alpha: 0.9 # Information sharing degree
views:
CENTRAL: "global_road_graph + all_taxi_positions"
TAXI[*]: "assigned_route + local_sensors"
sharing:
- TAXI[*] -> CENTRAL : position # Periodic (1 second period)
- CENTRAL -> TAXI[*] : route # Event-driven

responsibilities:
CENTRAL:
- compute_conflict_free_routes(all_taxis)
- update_routes_on_failure
TAXI[*]:
- follow_route
- report_position(period: 1s)
- report_detected_failures

incentives:
type: reputation
lambda: 0.5
rules:
- "reward(TAXI[i], 10) when on_time_delivery"
- "penalty(TAXI[i], -5) when route_deviation"

violation:
detect: "route_deviation > threshold OR position_report_delay >
5s"
action: "notify(CENTRAL) AND log_violation"
escalation: "after 3 violations: suspend_contract"

duration: indefinite
```

### 5.2.4 Protocol Model

A protocol defines coordination procedures between actors. Each step
consists of message transmission (arrow notation), local computation
(colon notation), or conditional branching.

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
- CENTRAL -> affected_taxis : new_route

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
Below are the main syntax rules of CADL in EBNF (Extended Backus-Naur
Form). For the complete EBNF, see Appendix A.

```yaml
(* CADL EBNF - Main Rules *)

cadl_file = "sos:" , sos_definition ;
sos_definition = "name:" , string ,
[ "type:" , sos_type ] ,
[ "version:" , version_string ] ,
[ context_block ] ,
[ actors_block ] ,
[ contracts_block ] ,
[ protocols_block ] ,
[ algorithms_block ] ,
[ transitions_block ] ,
[ metrics_block ] ;

sos_type = "Directed" | "Acknowledged" | "Collaborative" |
"Virtual" ;

actor_def = "- id:" , actor_id ,
"role:" , string ,
"autonomy:" , autonomy_level ,
[ "capabilities:" , capability_list ] ,
[ "interface:" , interface_def ] ;

actor_id = identifier , [ "[" , ( "*" | range ) , "]" ]
;
autonomy_level = "low" | "medium" | "high" | float_literal
;

contract_def = "- id:" , identifier ,
"parties:" , actor_ref_list ,
[ "assume:" , predicate_list ] ,
[ "guarantee:" , predicate_list ] ,
"authority:" , authority_block ,
"information:" , information_block ,
"responsibilities:" , responsibility_block ,
[ "incentives:" , incentive_block ] ,
[ "violation:" , violation_block ] ,
[ "duration:" , duration_spec ] ;

protocol_def = "- id:" , identifier ,
"trigger:" , event_expr ,
[ "precondition:" , predicate ] ,
"steps:" , step_list ,
[ "timing:" , timing_block ] ,
[ "fallback:" , fallback_block ] ,
[ "postcondition:" , predicate ] ;

step = message_step | compute_step | conditional_step
| parallel_step | barrier_step ;
message_step = actor_ref , "->" , actor_ref , ":" ,
message_expr ;
compute_step = actor_ref , ":" , computation_expr ;
```

## 5.4 Semantics
### 5.4.1 Assume-Guarantee Semantics of Contracts

CADL contracts are based on contract-based design theory by Benveniste
et al. and continuous-time assume-guarantee contracts by Saoud et al. In
a contract C = (A, G), A is the precondition (assume) and G is the
guarantee condition.

Contract composition: The parallel composition of two contracts C₁ =
(A₁, G₁) and C₂ = (A₂, G₂) is defined as C₁ ⊗ C₂ = (A₁ ∧ A₂, G₁ ∧ G₂).
However, when circular dependencies exist, we follow Saoud et al.'s
approach and apply greatest fixed-point semantics.

### 5.4.2 Semantics of Institutional Parameters

Institutional parameters α (information sharing degree), β (decision
decentralization degree), and λ (incentive intensity) take interval
values in [0, 1]. These parameters continuously control the structural
properties of institutions and form the basis for regime map
construction.

  --------------------------------------------------------------------------------------------------------------------------
  **Parameter**   **Name**                           **Meaning**
  --------------- ---------------------------------- -----------------------------------------------------------------------
  α (alpha)       Information Sharing Degree         0: No sharing (each actor has only local information)\
                                                     1: Complete sharing (all actors observe all information)

  β (beta)        Decision Decentralization Degree   0: Complete centralization (D-SoS: single actor decides all)\
                                                     1: Complete decentralization (C-SoS: each actor decides autonomously)

  λ (lambda)      Incentive Intensity                0: No incentive (directive-based)\
                                                     1: Strong incentive (market mechanism)
  --------------------------------------------------------------------------------------------------------------------------

### 5.4.3 Operational Semantics of Protocols

Each step of a protocol is interpreted as a labeled transition system
(LTS). Message transmission A -> B : m is defined as synchronized
composition of A's send action and B's receive action. Timing
constraints are encoded as invariants of timed automata, enabling
verification by model checkers such as UPPAAL.
