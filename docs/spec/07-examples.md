---
sidebar_position: 7
title: "Domain-Specific Description Examples"
---

This chapter presents CADL description examples through four application
domains. Each example concretely illustrates descriptive capabilities
corresponding to the three objectives outlined in Chapter 1.

:::note
The examples illustrate the intended design of CADL; they are conceptual
and are not accepted as written by the v0.3 reference implementation.
The base definitions write actor references such as `ROBOT[*]` unquoted
inside inline lists, which its YAML-based parser rejects, and the
`verification:` / `codegen:` listings are fragments placed outside
`sos:`. They also use forward-looking constructs beyond Appendix A, such
as `optimization:`, `policy_codegen:`, `post_generation_verification:`,
`calendar_integration:`, `tool:`, and verification methods like
`Monte_Carlo(...)`; the reference verifier implements only `smt`.
Runnable examples live in the `examples/` directory of the
[`cadl` repository](https://github.com/ertlnagoya/cadl).
:::

| **Description Example** | **Objective 1: Computational Processing** | **Objective 2: Contradiction Detection** | **Objective 3: Auto-Conversion and Code Generation** |
|---|---|---|---|
| 7.1 Household Rules | Formalization of institutional parameters<br />Structuring of tacit knowledge | Detection of obligation conflicts<br />Discovery of schedule contradictions | Household app notification code generation<br />Calendar integration code |
| 7.2 Robot Delivery | Regime map computation<br />Definition of environmental parameter space | Verification of safety invariants<br />Consistency checking during transitions | Automatic control code generation<br />Synthesis of monitor code |
| 7.3 IoT Data Sharing | Formalization of privacy constraints<br />Computation of SLA conditions | Detection of contradictions between SLAs<br />Discovery of access right conflicts | Data pipeline generation<br />Synthesis of contract monitoring code |
| 7.4 AI Integration | Formalization of regime recommendation<br />NL→CADL conversion | Verification of AI safety contracts<br />Contradiction detection in authority boundaries | Governance policy generation<br />Reactive synthesis |

Below, for each description example, we show the basic structure and
then provide concrete extended descriptions corresponding to Objective 2
(contradiction detection and verification) and Objective 3 (code
generation and auto-conversion).

## 7.1 Household Rule Design
As an example of everyday institutional design, we describe household
task-sharing and shared resource usage rules in CADL. This example
demonstrates that CADL is applicable not only to large-scale SoS but
also to familiar institutional design. It envisions a future where AI
assistants automatically generate CADL descriptions from natural
language requests.

```yaml
sos:
  name: "FamilyHousehold"
  type: Collaborative          # Family is equal-standing relationship
  version: "1.0.0"

  context:
    environment:
      members_at_home: Range(1, 4)
      weekday: Bool
      shared_resources:
        - bathroom(count: 2)
        - kitchen(count: 1)
        - washing_machine(count: 1)

  actors:
    - id: PARENT[1..2]
      role: "parent"
      autonomy: high
      capabilities: [approve_purchase, set_curfew]
    - id: CHILD[1..2]
      role: "child"
      autonomy: medium
      capabilities: [request_permission]
    - id: AI_ASSISTANT
      role: "mediator"
      autonomy: low
      capabilities: [suggest_schedule, detect_conflict]

  contracts:
    - id: CHORE_SHARING
      parties: [PARENT[*], CHILD[*]]
      authority:
        decision_scope: "chore_assignment"
        decision_holder: PARENT[1]       # Weekly rotation
        beta: 0.7                        # Somewhat centralized
      information:
        sharing_mode: "broadcast"        # All can view schedule
        alpha: 1.0
      responsibilities:
        PARENT[*]:
          - assign_weekly_chores
          - review_completion
        CHILD[*]:
          - complete_assigned_chores(deadline: "before_dinner")
          - report_completion
      incentives:
        type: token
        lambda: 0.6
        rules:
          - "reward(CHILD[i], 100yen) when chore_completed_on_time"
          - "bonus(CHILD[i], 200yen) when all_weekly_chores_done"

    - id: SHARED_RESOURCE_USE
      parties: [PARENT[*], CHILD[*]]
      assume:
        - "resource.is_available"
      guarantee:
        - "no_conflict(resource, time_slot)"
      authority:
        decision_scope: "resource_scheduling"
        decision_holder: AI_ASSISTANT    # AI proposes optimal schedule
        beta: 0.5
      information:
        views:
          ALL: "resource_calendar"
      responsibilities:
        AI_ASSISTANT:
          - optimize_schedule(fairness_weight: 0.7)
          - notify_conflicts
        ALL:
          - book_resource_via_app
          - release_resource_after_use

  protocols:
    - id: CONFLICT_RESOLUTION
      trigger: "resource_conflict_detected"
      steps:
        - AI_ASSISTANT : propose_alternatives(all_parties)
        - AI_ASSISTANT -> conflicting_parties : alternatives
        - conflicting_parties : vote(preferred_alternative)
        - if consensus_reached:
            - AI_ASSISTANT : update_schedule
          else:
            - PARENT[1] : make_final_decision   # Escalation
      timing:
        max_total: 10min
```

### 7.1.1 Contradiction Detection and Verification (Objective 2)

Even in household rules, obligation conflicts and schedule
contradictions can occur. CADL's verification block formally detects
these contradictions.

```yaml
# === Objective 2: Contradiction Detection and Verification ===
verification:
  # Obligation conflict detection: Check that multiple obligations don't overlap at same time
  - id: OBLIGATION_CONFLICT_CHECK
    type: obligation_consistency
    check: >
      for all actor in [PARENT[*], CHILD[*]]:
        for all t in time_slots:
          count(obligations(actor, t)) <= 1
    severity: error
    message: "Actor {actor} has overlapping obligations at time slot {t}"

  # Schedule contradiction: Check for simultaneous shared resource use
  - id: RESOURCE_CONFLICT_CHECK
    type: invariant
    check: >
      for all r in shared_resources:
        for all t in time_slots:
          count(bookings(r, t)) <= r.count
    severity: error
    message: "Resource {r} exceeds capacity at time slot {t}"

  # Incentive consistency: Reachability of reward conditions
  - id: INCENTIVE_REACHABILITY
    type: reachability
    check: >
      for all child in CHILD[*]:
        exists path in protocol_traces:
          path.leads_to(chore_completed_on_time)
    severity: warning
    message: "Child {child} may not be able to reach reward condition"

  # assume-guarantee consistency
  - id: CONTRACT_CONSISTENCY
    type: assume_guarantee
    contracts: [CHORE_SHARING, SHARED_RESOURCE_USE]
    check: "no_circular_dependency AND all_assumes_satisfiable"
    method: SMT          # Verified with Z3 solver
```

### 7.1.2 Code Generation and Auto-Conversion (Objective 3)

We show an example of automatically generating code for household
applications from CADL descriptions. Schedule management, notification,
and conflict resolution logic are generation targets.

```yaml
# === Objective 3: Code Generation ===
codegen:
  target: "python"
  modules:
    - id: SCHEDULE_MANAGER
      source_contract: SHARED_RESOURCE_USE
      generates:
        - "class ResourceScheduler:  # AI_ASSISTANT optimization logic"
        - "    def optimize_schedule(self, fairness_weight=0.7)"
        - "    def detect_conflicts(self) -> list[Conflict]"
        - "    def notify_parties(self, conflict: Conflict)"

    - id: CHORE_TRACKER
      source_contract: CHORE_SHARING
      generates:
        - "class ChoreTracker:  # Chore management and reward calculation"
        - "    def assign_weekly(self, decision_holder: Actor)"
        - "    def check_completion(self, child: Actor) -> bool"
        - "    def compute_reward(self, child: Actor) -> int"

    - id: CONTRACT_MONITOR
      source_contracts: [CHORE_SHARING, SHARED_RESOURCE_USE]
      generates:
        - "class ContractMonitor:  # assume/guarantee monitoring"
        - "    def check_assumes(self) -> list[Violation]"
        - "    def check_guarantees(self) -> list[Violation]"
        - "    def on_violation(self, v: Violation): ..."

  calendar_integration:
    format: "ical"
    export: "family_schedule.ics"
    sync_protocol: CONFLICT_RESOLUTION
```

## 7.2 Robot Delivery System
An example of a robot delivery system using MAPF as an institutional
experimentation platform. We describe two institutional regimes---D-SoS
(centralized) and C-SoS (distributed collaborative)---in CADL and define
dynamic switching based on environmental conditions.

```yaml
sos:
  name: "UrbanRobotDelivery"
  type: Acknowledged
  version: "1.0.0"

  context:
    environment:
      grid_size: { width: 50, height: 50 }
      num_robots: Range(10, 100)
      latency_ms: Range(0, 500)
      failure_rate: { roads_per_1000_steps: Range(0, 10) }
      demand_rate: { orders_per_min: Range(5, 50) }

  actors:
    - id: DISPATCHER
      role: "central_coordinator"
      autonomy: low
    - id: ROBOT[1..N]
      role: "delivery_vehicle"
      autonomy: medium
      capabilities: [navigate, pickup, deliver, detect_obstacle]
    - id: CUSTOMER[*]
      role: "service_requester"
      autonomy: high

  contracts:
    - id: DELIVERY_SLA
      parties: [DISPATCHER, ROBOT[*], CUSTOMER[*]]
      assume:
        - "DISPATCHER.is_operational"
        - "road_network.connectivity >= 0.8"
      guarantee:
        - "delivery_time <= promised_time * 1.2"
        - "delivery_success_rate >= 0.95"
      authority:
        decision_scope: "order_assignment_and_routing"
        decision_holder: DISPATCHER
        beta: 0.8
      information:
        alpha: 0.8
        views:
          DISPATCHER: "all_robot_positions + all_orders + road_status"
          ROBOT[i]: "own_route + local_map(radius: 5) + assigned_orders"
          CUSTOMER[j]: "own_order_status + estimated_arrival"
        sharing:
          - ROBOT[*] -> DISPATCHER : position(period: 500ms)
          - ROBOT[*] -> DISPATCHER : obstacle_report(event_driven)
          - DISPATCHER -> ROBOT[*] : route_update(event_driven)
          - DISPATCHER -> CUSTOMER[*] : status_update(period: 30s)
      responsibilities:
        DISPATCHER:
          - compute_optimal_assignment(minimize: total_delivery_time)
          - replan_on_failure
          - balance_workload(fairness: gini_coefficient <= 0.3)
        ROBOT[*]:
          - follow_assigned_route
          - avoid_collisions_locally
          - report_anomalies
      incentives:
        type: performance_based
        lambda: 0.7
        rules:
          - "reward(ROBOT[i], base_fee + speed_bonus) when delivery_on_time"
          - "penalty(ROBOT[i], -base_fee * 0.5) when delivery_late"

  # === Institutional Transition: Switch from D-SoS to C-SoS based on failure rate ===
  transitions:
    - from: CENTRALIZED_REGIME
      to: DISTRIBUTED_REGIME
      condition: >
        failure_rate > 5 per 1000 steps
        OR latency > 300ms
        OR DISPATCHER.is_operational == false
      protocol: REGIME_SHIFT_PROTOCOL
      safety_invariant: "no_collision AND no_order_loss"

    - from: DISTRIBUTED_REGIME
      to: CENTRALIZED_REGIME
      condition: >
        failure_rate <= 2 per 1000 steps
        AND latency <= 100ms
        AND DISPATCHER.is_operational == true
      protocol: REGIME_SHIFT_PROTOCOL
      safety_invariant: "no_collision"

  metrics:
    - id: throughput
      formula: "count(completed_deliveries) / time_window"
      target: ">= 0.9 * demand_rate"
    - id: fairness
      formula: "1 - gini(ROBOT[*].completed_deliveries)"
      target: ">= 0.7"
    - id: resilience
      formula: "throughput_during_failure / throughput_normal"
      target: ">= 0.8"
```

### 7.2.1 Contradiction Detection and Verification (Objective 2)

In robot delivery systems, safety verification during institutional
transitions and consistency verification between contracts are
particularly important. The verification block below formally detects
contradictions in transition conditions and SLA violations.

```yaml
# === Objective 2: Contradiction Detection and Verification ===
verification:
  # Transition safety: Are invariants maintained during transition?
  - id: TRANSITION_SAFETY
    type: transition_invariant
    transitions: [CENTRALIZED_REGIME -> DISTRIBUTED_REGIME,
                  DISTRIBUTED_REGIME -> CENTRALIZED_REGIME]
    invariant: "no_collision AND no_order_loss"
    method: model_checking
    tool: "NuSMV"
    property: >
      AG(transition_in_progress ->
        (no_collision AND no_order_loss))

  # Transition condition non-contradiction: Can multiple transitions fire simultaneously?
  - id: TRANSITION_EXCLUSIVITY
    type: mutex
    check: >
      NOT(condition(CENTRALIZED->DISTRIBUTED)
        AND condition(DISTRIBUTED->CENTRALIZED))
    severity: error
    message: "Transition conditions may be satisfied simultaneously: risk of deadlock"

  # Cross-contract consistency: SLA and institutional transition consistency
  - id: SLA_REGIME_CONSISTENCY
    type: cross_contract
    check: >
      for all regime in [CENTRALIZED, DISTRIBUTED]:
        regime.can_satisfy(DELIVERY_SLA.guarantee)
    severity: error
    message: "Regime {regime} may not satisfy SLA guarantees"

  # Metric reachability: Are target metrics achievable?
  - id: METRIC_FEASIBILITY
    type: simulation_based
    method: Monte_Carlo(n=10000)
    check: >
      P(throughput >= target) >= 0.95 AND
      P(fairness >= target) >= 0.90
    parameters:
      failure_rate: Uniform(0, 10)
      latency: Uniform(0, 500)
```

### 7.2.2 Code Generation and Auto-Conversion (Objective 3)

From the delivery system institutional description, we automatically
generate code for the DISPATCHER's assignment algorithm, ROBOT control
logic, and contract monitoring code. Furthermore, regime maps are
automatically constructed through institutional parameter optimization.

```yaml
# === Objective 3: Code Generation and Auto-Conversion ===
codegen:
  target: "python"
  modules:
    # Control code generation: Contract → State machine
    - id: DISPATCHER_CONTROLLER
      source_contract: DELIVERY_SLA
      source_role: DISPATCHER
      generates:
        - "class DispatcherFSM(StateMachine):"
        - "    states: [IDLE, ASSIGNING, MONITORING, REPLANNING]"
        - "    def compute_optimal_assignment(self, orders, robots):"
        - "        # minimize: total_delivery_time"
        - "        # constraint: gini_coefficient <= 0.3"
        - "    def replan_on_failure(self, failed_robot):"

    - id: ROBOT_CONTROLLER
      source_contract: DELIVERY_SLA
      source_role: ROBOT
      generates:
        - "class RobotFSM(StateMachine):"
        - "    states: [IDLE, NAVIGATING, PICKING_UP, DELIVERING]"
        - "    def follow_assigned_route(self, route: Path):"
        - "    def avoid_collisions_locally(self, local_map):"
        - "    def report_anomalies(self, event: AnomalyEvent):"

    # Contract monitor generation
    - id: SLA_MONITOR
      source_contract: DELIVERY_SLA
      generates:
        - "class SLAMonitor(RuntimeMonitor):"
        - "    def check_delivery_time(self, actual, promised):"
        - "        assert actual <= promised * 1.2"
        - "    def check_success_rate(self, window=100):"
        - "        assert success_count / window >= 0.95"

    # Institutional transition controller generation
    - id: REGIME_CONTROLLER
      source_transitions: [CENTRALIZED->DISTRIBUTED,
                           DISTRIBUTED->CENTRALIZED]
      generates:
        - "class RegimeController:"
        - "    def evaluate_transition_condition(self, env):"
        - "    def execute_safe_transition(self, from_r, to_r):"
        - "    def verify_invariant_during_transition(self):"

  # Automatic regime map construction
  optimization:
    - id: REGIME_MAP_CONSTRUCTION
      method: "grid_search + Bayesian_optimization"
      parameter_space:
        failure_rate: [0, 10, step=0.5]
        latency_ms: [0, 500, step=25]
        num_robots: [10, 100, step=10]
      objective: "maximize(throughput) subject_to fairness >= 0.7"
      output: "regime_map.json"
      # At each parameter point, determine optimal regime (D-SoS/C-SoS) and parameters (β,α,λ)
```

## 7.3 IoT Data Sharing System
An example of a system that shares data between IoT sensor networks
operated by multiple organizations. We formalize data ownership, access
rights, and quality assurance as contracts.

```yaml
sos:
  name: "IoTDataSharing"
  type: Collaborative
  version: "1.0.0"

  context:
    environment:
      data_freshness_requirement: 5s
      privacy_level: { min: "anonymized", max: "raw" }
      network_bandwidth: Range(1Mbps, 100Mbps)

  actors:
    - id: DATA_PROVIDER[1..M]
      role: "sensor_operator"
      autonomy: high
      capabilities: [collect_data, anonymize, publish]
    - id: DATA_CONSUMER[1..K]
      role: "application_operator"
      autonomy: high
      capabilities: [subscribe, process, visualize]
    - id: DATA_BROKER
      role: "marketplace_operator"
      autonomy: medium
      capabilities: [match, audit, billing]

  contracts:
    - id: DATA_QUALITY_SLA
      parties: [DATA_PROVIDER[i], DATA_CONSUMER[j], DATA_BROKER]
      assume:
        - "DATA_PROVIDER[i].sensor_calibrated"
        - "network.available"
      guarantee:
        - "data_latency <= 5s"
        - "data_accuracy >= 0.95"
        - "privacy_level >= DATA_CONSUMER[j].required_privacy"
      authority:
        decision_scope: "data_access_control"
        decision_holder: DATA_PROVIDER[i]   # Data owner controls
        beta: 0.2                           # Highly decentralized
      information:
        alpha: 0.4       # Limited sharing (privacy protection)
        views:
          DATA_PROVIDER[i]: "own_sensor_data + subscriber_list"
          DATA_CONSUMER[j]: "subscribed_data + quality_metrics"
          DATA_BROKER: "metadata + usage_statistics"  # No access to raw data
        sharing:
          - DATA_PROVIDER[i] -> DATA_BROKER : metadata(schema, quality, price)
          - DATA_BROKER -> DATA_CONSUMER[*] : catalog(available_data)
          - DATA_PROVIDER[i] -> DATA_CONSUMER[j] : data_stream(encrypted)
      responsibilities:
        DATA_PROVIDER[i]:
          - maintain_data_quality(accuracy >= 0.95)
          - anonymize_if_required
          - provide_data_lineage
        DATA_CONSUMER[j]:
          - respect_usage_terms
          - report_quality_issues
        DATA_BROKER:
          - verify_quality_claims(sampling_rate: 0.1)
          - mediate_disputes
          - maintain_audit_trail
      incentives:
        type: market
        lambda: 0.9
        rules:
          - "payment(DATA_PROVIDER[i], unit_price * volume) when quality_met"
          - "refund(DATA_CONSUMER[j], partial) when quality_violated"
          - "reputation_update(DATA_PROVIDER[i], quality_score)"

  protocols:
    - id: DATA_SUBSCRIPTION
      trigger: "DATA_CONSUMER[j].request_subscription(data_type)"
      steps:
        - DATA_CONSUMER[j] -> DATA_BROKER : subscription_request(requirements)
        - DATA_BROKER : match_providers(requirements)
        - DATA_BROKER -> DATA_PROVIDER[matched] : access_request(terms)
        - DATA_PROVIDER[matched] : evaluate_terms
        - if terms_accepted:
            - DATA_PROVIDER[matched] -> DATA_BROKER : accept(conditions)
            - DATA_BROKER : create_contract_instance
            - DATA_BROKER -> DATA_CONSUMER[j] : subscription_active
          else:
            - DATA_BROKER -> DATA_CONSUMER[j] : suggest_alternatives
      timing:
        max_total: 60s
```

### 7.3.1 Contradiction Detection and Verification (Objective 2)

In IoT data sharing systems, potential contradictions often arise
between privacy constraints and data sharing requirements. We verify
consistency between multiple SLA contracts and detect access right
conflicts.

```yaml
# === Objective 2: Contradiction Detection and Verification ===
verification:
  # Contradiction between privacy constraints and data sharing
  - id: PRIVACY_SHARING_CONSISTENCY
    type: constraint_satisfiability
    check: >
      for all provider_i in DATA_PROVIDER[*]:
        for all consumer_j in DATA_CONSUMER[*]:
          provider_i.privacy_policy.min_level
            <= consumer_j.required_privacy
    severity: error
    message: "PROVIDER[{i}] privacy policy contradicts CONSUMER[{j}] requirements"

  # Contradiction between SLAs: Feasibility of bandwidth and latency constraints
  - id: SLA_FEASIBILITY
    type: resource_analysis
    check: >
      sum(DATA_CONSUMER[*].bandwidth_demand)
        <= network_bandwidth
      AND for all stream in active_streams:
        stream.achievable_latency <= data_freshness_requirement
    method: linear_programming
    severity: error

  # Access right conflict: Information flow consistency
  - id: ACCESS_CONTROL_CONSISTENCY
    type: information_flow
    check: >
      # DATA_BROKER cannot access raw data
      NOT(exists flow: DATA_PROVIDER[*] -> DATA_BROKER
        where flow.contains(raw_data))
      # CONSUMER[j] can only access subscribed data
      AND for all consumer_j in DATA_CONSUMER[*]:
        consumer_j.accessible_data
          SUBSET_OF subscribed_data(consumer_j)
    method: taint_analysis

  # Deontic logic consistency: Contractual obligations don't cycle
  - id: OBLIGATION_ACYCLICITY
    type: deontic_logic
    check: >
      no_cyclic_obligation(
        DATA_PROVIDER.maintain_quality,
        DATA_CONSUMER.respect_usage_terms,
        DATA_BROKER.verify_quality_claims)
    severity: warning
```

### 7.3.2 Code Generation and Auto-Conversion (Objective 3)

From data-sharing contracts, we automatically generate skeleton code for
data pipelines, SLA monitors, and billing logic. We also demonstrate
conversion to smart contracts (Solidity).

```yaml
# === Objective 3: Code Generation and Auto-Conversion ===
codegen:
  targets:
    # Python: Data pipeline and monitors
    - language: "python"
      modules:
        - id: DATA_PIPELINE
          source_protocol: DATA_SUBSCRIPTION
          generates:
            - "class DataPipeline:"
            - "    def subscribe(self, consumer, requirements):"
            - "    def match_providers(self, requirements):"
            - "    def create_encrypted_stream(self, provider, consumer):"

        - id: SLA_MONITOR
          source_contract: DATA_QUALITY_SLA
          generates:
            - "class SLAMonitor(RuntimeMonitor):"
            - "    def check_latency(self, stream) -> bool:"
            - "        return stream.latency <= 5  # seconds"
            - "    def check_accuracy(self, sample) -> float:"
            - "    def on_violation(self, violation):"
            - "        self.trigger_refund(violation.consumer)"

        - id: BILLING_ENGINE
          source_incentives: DATA_QUALITY_SLA.incentives
          generates:
            - "class BillingEngine:"
            - "    def compute_payment(self, provider, volume, quality):"
            - "    def process_refund(self, consumer, violation):"
            - "    def update_reputation(self, provider, score):"

    # Solidity: Smart contract
    - language: "solidity"
      modules:
        - id: DATA_SHARING_CONTRACT
          source_contract: DATA_QUALITY_SLA
          generates:
            - "contract DataSharingAgreement {"
            - "    mapping(address => Provider) public providers;"
            - "    mapping(address => Consumer) public consumers;"
            - "    function registerProvider(bytes32 schema) external;"
            - "    function subscribe(address provider) external payable;"
            - "    function reportViolation(bytes32 proof) external;"
            - "    function settlePayment() external;"
            - "}"

  # Integration with formal verification: Property verification of generated code
  post_generation_verification:
    - check: "generated_monitor covers all guarantee clauses"
    - check: "generated_billing matches incentive rules"
    - check: "solidity_contract has no reentrancy vulnerability"
      tool: "Slither"
```

## 7.4 AI Integration
CADL-AI fusion has three aspects. First, automatic conversion from
natural language to CADL descriptions via LLM. Second, AI agents
recommending and optimizing institutions based on CADL descriptions.
Third, contract descriptions when AI agents themselves participate as
constituent systems in SoS.

```yaml
sos:
  name: "AI_Integrated_SoS"
  type: Acknowledged
  version: "1.0.0"

  context:
    environment:
      ai_availability: Range(0.95, 1.0)
      human_oversight_required: true

  actors:
    - id: HUMAN_OPERATOR
      role: "supervisor"
      autonomy: high
      capabilities: [approve_transition, override_ai, set_policy]
    - id: AI_ADVISOR
      role: "institution_designer"
      autonomy: medium
      capabilities:
        - natural_language_to_cadl      # Natural language → CADL conversion
        - regime_recommendation         # Regime recommendation
        - parameter_optimization        # Parameter optimization
        - anomaly_detection             # Anomaly detection
    - id: AI_AGENT[1..P]
      role: "autonomous_participant"
      autonomy: high
      capabilities: [perceive, decide, act, learn]

  contracts:
    - id: AI_GOVERNANCE
      parties: [HUMAN_OPERATOR, AI_ADVISOR, AI_AGENT[*]]
      assume:
        - "AI_ADVISOR.model_accuracy >= 0.9"
        - "HUMAN_OPERATOR.available_for_escalation"
      guarantee:
        - "ai_decisions_are_explainable"
        - "human_can_override_within(5s)"
        - "no_action_without_authorization_level_check"
      authority:
        decision_scope: "regime_selection_and_parameter_tuning"
        decision_holder: AI_ADVISOR       # AI proposes
        approval_required: HUMAN_OPERATOR # Human approves
        beta: 0.6                         # AI-led but human-supervised
      information:
        alpha: 0.7
        views:
          HUMAN_OPERATOR: "dashboard(metrics, alerts, recommendations)"
          AI_ADVISOR: "full_system_state + historical_data + regime_map"
          AI_AGENT[i]: "local_observation + assigned_contract"
      responsibilities:
        AI_ADVISOR:
          - monitor_environment_parameters(continuous)
          - compute_regime_recommendation(method: POMDP)
          - generate_cadl_from_natural_language(user_input)
          - explain_recommendation(format: natural_language)
        HUMAN_OPERATOR:
          - review_ai_recommendations
          - approve_or_reject_transitions
          - define_safety_boundaries
        AI_AGENT[*]:
          - comply_with_active_contract
          - report_local_observations
          - adapt_behavior_within_contract_bounds

    - id: AI_SAFETY_CONTRACT
      parties: [AI_ADVISOR, AI_AGENT[*]]
      assume:
        - "training_data.is_representative"
      guarantee:
        - "no_harmful_action"
        - "uncertainty_quantification_provided"
        - "graceful_degradation_on_failure"
      violation:
        detect: >
          confidence < 0.7
          OR action_outside_permitted_range
          OR human_override_signal
        action: >
          switch_to_safe_mode
          AND notify(HUMAN_OPERATOR)
          AND log_full_context

  protocols:
    - id: AI_REGIME_RECOMMENDATION
      trigger: "AI_ADVISOR.regime_score_delta > threshold"
      steps:
        - AI_ADVISOR : compute_recommendation(current_state, regime_map)
        - AI_ADVISOR -> HUMAN_OPERATOR : recommendation(
            proposed_regime,
            expected_improvement,
            risk_assessment,
            explanation_in_natural_language)
        - HUMAN_OPERATOR : review
        - if approved:
            - HUMAN_OPERATOR -> AI_ADVISOR : approve
            - AI_ADVISOR : initiate_transition(protocol: REGIME_TRANSITION)
          else:
            - HUMAN_OPERATOR -> AI_ADVISOR : reject(reason)
            - AI_ADVISOR : learn_from_rejection(reason)
      timing:
        recommendation_interval: 5min
        human_review_timeout: 30min
      fallback:
        on_timeout: "maintain_current_regime"

    - id: NL_TO_CADL_WORKFLOW
      trigger: "HUMAN_OPERATOR.submit_natural_language_spec"
      steps:
        - HUMAN_OPERATOR -> AI_ADVISOR : natural_language_spec
        - AI_ADVISOR : parse_and_generate_cadl(spec)
        - AI_ADVISOR -> HUMAN_OPERATOR : proposed_cadl + explanation
        - HUMAN_OPERATOR : review_cadl
        - if accepted:
            - AI_ADVISOR : validate_cadl(formal_verification)
            - AI_ADVISOR -> HUMAN_OPERATOR : verification_result
            - if verified:
                - AI_ADVISOR : deploy_cadl
              else:
                - AI_ADVISOR : suggest_fixes + iterate
          else:
            - HUMAN_OPERATOR -> AI_ADVISOR : feedback
            - AI_ADVISOR : revise_cadl(feedback) -> loop
```

### 7.4.1 Contradiction Detection and Verification (Objective 2)

In AI fusion systems, detecting contradictions between AI safety
contracts, authority boundaries, and human oversight requirements is
particularly important. We formally verify the consistency between AI
autonomy levels and human approval requirements.

```yaml
# === Objective 2: Contradiction Detection and Verification ===
verification:
  # AI safety contract satisfiability
  - id: AI_SAFETY_SATISFIABILITY
    type: assume_guarantee
    contract: AI_SAFETY_CONTRACT
    check: >
      # Under assume(training_data.is_representative),
      # is guarantee(no_harmful_action) always satisfied?
      assumes_imply_guarantees(
        under: all_reachable_states)
    method: bounded_model_checking
    bound: 1000_steps

  # Authority contradiction: AI autonomy and human approval consistency
  - id: AUTHORITY_CONSISTENCY
    type: authority_analysis
    check: >
      # Flow: AI_ADVISOR proposes → HUMAN_OPERATOR approves
      for all action in AI_ADVISOR.actions:
        if action.requires_approval:
          exists path: action -> HUMAN_OPERATOR.review
      # Is AI_AGENT autonomous action within contract scope?
      AND for all agent in AI_AGENT[*]:
        agent.action_space SUBSET_OF
          active_contract.permitted_actions
    severity: error

  # Timeout consistency: Can human review keep up?
  - id: TIMING_CONSISTENCY
    type: timing_analysis
    check: >
      human_review_timeout(30min)
        >= expected_review_time(95th_percentile)
      AND recommendation_interval(5min)
        >= compute_recommendation.worst_case_time
    severity: warning
    message: "Human review timeout may be insufficient"

  # Deontic logic: Do AI_ADVISOR obligations conflict?
  - id: AI_DEONTIC_CONSISTENCY
    type: deontic_logic
    check: >
      # Do "explainability" and "confidentiality" obligations conflict?
      compatible(
        obligation(explain_recommendation),
        obligation(protect_training_data))
      # Is fallback "maintain_current_regime" safe?
      AND safe_state(maintain_current_regime)
```

### 7.4.2 Code Generation and Auto-Conversion (Objective 3)

Code generation from AI fusion systems occurs at three levels. (1)
Orchestration code for the NL→CADL conversion pipeline, (2) Governance
policy execution code (OPA/Rego format), (3) Safe control code for AI
agents via reactive synthesis.

```yaml
# === Objective 3: Code Generation and Auto-Conversion ===
codegen:
  target: "python"
  modules:
    # NL → CADL conversion pipeline
    - id: NL_TO_CADL_PIPELINE
      source_protocol: NL_TO_CADL_WORKFLOW
      generates:
        - "class NLtoCADLPipeline:"
        - "    def __init__(self, llm_model: str):"
        - "    def parse_natural_language(self, spec: str) -> AST:"
        - "    def generate_cadl(self, ast: AST) -> CADLDocument:"
        - "    def validate_cadl(self, doc: CADLDocument) -> VerificationResult:"
        - "    def iterate_with_feedback(self, feedback: str) -> CADLDocument:"

    # AI safety controller: Reactive synthesis
    - id: AI_SAFETY_CONTROLLER
      source_contract: AI_SAFETY_CONTRACT
      synthesis:
        method: "reactive_synthesis"      # GR(1) realizability
        environment: "AI_AGENT[*].actions"
        system: "SAFETY_CONTROLLER.decisions"
        specification: >
          # Environment assumption: AI acts within contract scope
          assume G(ai_action IN permitted_range)
          # Safety guarantee: No harmful actions
          guarantee G(NOT harmful_action)
          # Liveness: Escalate to human if confidence is low
          guarantee G(confidence < 0.7 -> F escalate_to_human)
      generates:
        - "class SafetyController(ReactiveSystem):"
        - "    def compute_safe_action(self, state, ai_proposal):"
        - "    def should_escalate(self, confidence) -> bool:"
        - "    def switch_to_safe_mode(self):"

    # Regime recommendation engine
    - id: REGIME_RECOMMENDER
      source_protocol: AI_REGIME_RECOMMENDATION
      generates:
        - "class RegimeRecommender:"
        - "    def __init__(self, regime_map: RegimeMap):"
        - "    def compute_recommendation(self, state) -> Regime:"
        - "    def explain_in_natural_language(self, rec) -> str:"
        - "    def learn_from_rejection(self, reason: str):"

  # Governance policy generation (OPA/Rego format)
  policy_codegen:
    target: "rego"
    source_contract: AI_GOVERNANCE
    generates:
      - "package cadl.ai_governance"
      - ""
      - "default allow = false"
      - ""
      - "# AI_ADVISOR action permission rules"
      - "allow {"
      - '    input.actor == "AI_ADVISOR"'
      - '    input.action == "recommend"'
      - "    input.confidence >= 0.7"
      - "}"
      - ""
      - "# Human approval required actions"
      - "requires_approval {"
      - '    input.action == "initiate_transition"'
      - "}"
      - ""
      - "# Force transition to safe mode"
      - "force_safe_mode {"
      - "    input.confidence < 0.5"
      - "    input.action_outside_permitted_range"
      - "}"
```

The four description examples above illustrate how CADL is intended to
realize three objectives within a unified language framework: Objective 1
(formal and computational representation of institutions), Objective 2
(detection and verification of institutional contradictions and
violations), Objective 3 (automatic transformation from institutional
description to executable code). Although each example is applied to
different domains (household, robotics, IoT, AI), the common structure
of verification blocks and codegen blocks is meant to enable
construction of cross-domain verification and generation pipelines.
