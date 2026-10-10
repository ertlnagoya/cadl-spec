---
sidebar_position: 7
title: "7. 用途別記述例"
description: "家庭内ルール，ロボット配送，IoTデータ共有，AI融合の4つの適用領域におけるCADLの記述例を示す。"
---

# 7. 用途別記述例

本章では，4つの適用領域を通じてCADLの記述例を示す。各例は，[第1章](./01-introduction.md)で掲げた3つの目的に対応する記述機能を具体的に例示している。

:::note
本章の記述例はCADLが意図する設計を例示する概念的なものであり，v0.3リファレンス実装はこのままの形では受理しない。基本構造の記述は，`ROBOT[*]`のようなアクター参照を引用符なしでインラインリスト内に書いており，YAMLベースのパーサはこれを拒否する。`verification:`と`codegen:`の記述は，`sos:`の外に置いた断片である。また，`optimization:`，`policy_codegen:`，`post_generation_verification:`，`calendar_integration:`，`tool:`や，`Monte_Carlo(...)`のような検証手法など，[付録A](./appendix-a-syntax.md)の範囲を超える将来の構成要素も含む。リファレンス実装の検証器が実装する検証手法は`smt`だけである。これらの構成要素のほかにも，`verification:`の記述はキー（`check:`，`severity:`，`message:`，`contracts:`）を，`codegen:`の記述は形（`modules:`，`generates:`，`targets:`）を用いているが，これらは付録Aの[§A.8](./appendix-a-syntax.md#a8-verification-block)と[§A.9](./appendix-a-syntax.md#a9-codegen-block)のキーではない。契約の記述に現れる`sharing_mode:`（7.1節）と`approval_required:`（7.4節）も，同様に[§A.4](./appendix-a-syntax.md#a4-contracts-institution-layer)のキーではない。実行できる例は，[`cadl`リポジトリ](https://github.com/ertlnagoya/cadl)の`examples/`ディレクトリにある。
:::

| **記述例** | **目的1: 計算機処理** | **目的2: 矛盾検出** | **目的3: 自動変換・コード生成** |
|---|---|---|---|
| 7.1 家庭内ルール | 制度パラメータの形式化 / 暗黙知の構造化 | 義務衝突の検出 / スケジュール矛盾の発見 | 家庭アプリ通知コード生成 / カレンダー連携コード |
| 7.2 ロボット配送 | モードマップの計算 / 環境パラメータ空間の定義 | 安全不変条件の検証 / 制度遷移時の整合性検査 | 制御コードの自動生成 / 監視器コードの合成 |
| 7.3 IoTデータ共有 | プライバシー制約の形式化 / SLA条件の計算 | SLA間矛盾の検出 / アクセス権衝突の発見 | データパイプライン生成 / 契約監視コードの合成 |
| 7.4 AI融合 | モード推薦の形式化 / NL→CADL変換 | AI安全契約の検証 / 権限境界の矛盾検出 | ガバナンスポリシー生成 / 反応型合成 |

以下，各記述例について基本構造を示した後，目的2（矛盾検出・検証）と目的3（コード生成・自動変換）に対応する拡張記述を具体的に例示する。

## 7.1 家庭内ルール設計

日常的な制度設計の例として，家庭内でのタスク分担と共有資源の利用ルールをCADLで記述する。この例は，CADLが大規模SoSだけでなく，身近な制度設計にも適用可能であることを示す。AIアシスタントが自然言語の要望からCADL記述を自動生成する将来像を想定している。

```yaml
sos:
  name: "FamilyHousehold"
  type: Collaborative          # 家族は対等な関係
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
        decision_holder: PARENT[1]       # 週替わりローテーション
        beta: 0.7                        # やや集中的
      information:
        sharing_mode: "broadcast"        # 全員がスケジュールを閲覧可能
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
      parties: [PARENT[*], CHILD[*], AI_ASSISTANT]
      assume:
        - "resource.is_available"
      guarantee:
        - "no_conflict(resource, time_slot)"
      authority:
        decision_scope: "resource_scheduling"
        decision_holder: AI_ASSISTANT    # AIが最適スケジュール提案
        beta: 0.5
      information:
        views:
          PARENT[*]: "resource_calendar"
          CHILD[*]: "resource_calendar"
      responsibilities:
        AI_ASSISTANT:
          - optimize_schedule(fairness_weight: 0.7)
          - notify_conflicts
        PARENT[*]:
          - book_resource_via_app
          - release_resource_after_use
        CHILD[*]:
          - book_resource_via_app
          - release_resource_after_use

  protocols:
    - id: CONFLICT_RESOLUTION
      trigger: "resource_conflict_detected"
      steps:
        - AI_ASSISTANT : propose_alternatives(all_parties)
        # conflicting_parties: 衝突に関わるアクター（宣言されたアクターではない）
        - AI_ASSISTANT -> conflicting_parties : alternatives
        - conflicting_parties : vote(preferred_alternative)
        - if consensus_reached:
            - AI_ASSISTANT : update_schedule
          else:
            - PARENT[1] : make_final_decision   # エスカレーション
      timing:
        max_total: 10min
```

### 7.1.1 矛盾検出・検証（目的2）

家庭内ルールにおいても，義務の衝突やスケジュールの矛盾は発生しうる。CADLのverificationブロックにより，これらの矛盾を形式的に検出する。

```yaml
# === 目的2: 矛盾検出・検証 ===
verification:
  # 義務衝突の検出: 同一時間帯に複数の義務が重複しないか
  - id: OBLIGATION_CONFLICT_CHECK
    type: obligation_consistency
    check: >
      for all actor in [PARENT[*], CHILD[*]]:
        for all t in time_slots:
          count(obligations(actor, t)) <= 1
    severity: error
    message: "{actor}に時間帯{t}で義務が重複しています"

  # スケジュール矛盾: 共有資源の同時利用チェック
  - id: RESOURCE_CONFLICT_CHECK
    type: invariant
    check: >
      for all r in shared_resources:
        for all t in time_slots:
          count(bookings(r, t)) <= r.count
    severity: error
    message: "{r}が時間帯{t}で定員超過です"

  # インセンティブ整合性: 報酬条件の到達可能性
  - id: INCENTIVE_REACHABILITY
    type: reachability
    check: >
      for all child in CHILD[*]:
        exists path in protocol_traces:
          path.leads_to(chore_completed_on_time)
    severity: warning
    message: "{child}が報酬条件に到達できない可能性があります"

  # assume-guarantee整合性
  - id: CONTRACT_CONSISTENCY
    type: assume_guarantee
    contracts: [CHORE_SHARING, SHARED_RESOURCE_USE]
    check: "no_circular_dependency AND all_assumes_satisfiable"
    method: SMT          # Z3ソルバで検証
```

### 7.1.2 コード生成・自動変換（目的3）

CADL記述から家庭向けアプリケーションのコードを自動生成する例を示す。スケジュール管理・通知・紛争解決のロジックが生成対象となる。

```yaml
# === 目的3: コード生成 ===
codegen:
  target: "python"
  modules:
    - id: SCHEDULE_MANAGER
      source_contract: SHARED_RESOURCE_USE
      generates:
        - "class ResourceScheduler:  # AI_ASSISTANTの最適化ロジック"
        - "    def optimize_schedule(self, fairness_weight=0.7)"
        - "    def detect_conflicts(self) -> list[Conflict]"
        - "    def notify_parties(self, conflict: Conflict)"

    - id: CHORE_TRACKER
      source_contract: CHORE_SHARING
      generates:
        - "class ChoreTracker:  # 家事管理・報酬計算"
        - "    def assign_weekly(self, decision_holder: Actor)"
        - "    def check_completion(self, child: Actor) -> bool"
        - "    def compute_reward(self, child: Actor) -> int"

    - id: CONTRACT_MONITOR
      source_contracts: [CHORE_SHARING, SHARED_RESOURCE_USE]
      generates:
        - "class ContractMonitor:  # assume/guarantee監視"
        - "    def check_assumes(self) -> list[Violation]"
        - "    def check_guarantees(self) -> list[Violation]"
        - "    def on_violation(self, v: Violation): ..."

  calendar_integration:
    format: "ical"
    export: "family_schedule.ics"
    sync_protocol: CONFLICT_RESOLUTION
```

## 7.2 ロボット配送システム

MAPFを制度実験プラットフォームとして活用するロボット配送システムの例である。SoS全体は `type: Acknowledged` と宣言している。ディスパッチャが，独立に運用されるロボットと顧客を調整する構成である。この記述例は，集中型の運用モード（β = 0.8，ディスパッチャが決定する）の契約と，環境条件に応じて，ロボット同士が協調する分散型の運用モードとの間で切り替える条件を定義する。運用モードの名前はSoSの類型ではなく，ファイルレベルの `type:` は遷移によって変わらない。

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

  # === 制度遷移: 障害率に応じて集中型と分散型の運用モードを切替 ===
  transitions:
    - from: CENTRALIZED_REGIME
      to: DISTRIBUTED_REGIME
      condition: >
        failure_rate > 5 per 1000 steps
        OR latency_ms > 300
        OR DISPATCHER.is_operational == false
      protocol: REGIME_SHIFT_PROTOCOL   # プロトコルの定義はこの記述例では省略
      safety_invariant: "no_collision AND no_order_loss"

    - from: DISTRIBUTED_REGIME
      to: CENTRALIZED_REGIME
      condition: >
        failure_rate <= 2 per 1000 steps
        AND latency_ms <= 100
        AND DISPATCHER.is_operational == true
      protocol: REGIME_SHIFT_PROTOCOL   # プロトコルの定義はこの記述例では省略
      safety_invariant: "no_collision AND no_order_loss"

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

### 7.2.1 矛盾検出・検証（目的2）

ロボット配送システムでは，制度遷移時の安全性検証と，契約間の整合性検証が特に重要である。以下のverificationブロックにより，遷移条件の矛盾やSLA違反を形式的に検出する。

```yaml
# === 目的2: 矛盾検出・検証 ===
verification:
  # 制度遷移の安全性: 遷移中も不変条件が維持されるか
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

  # 遷移条件の無矛盾性: 同時に複数遷移が発火しないか
  - id: TRANSITION_EXCLUSIVITY
    type: mutex
    check: >
      NOT(condition(CENTRALIZED_REGIME->DISTRIBUTED_REGIME)
        AND condition(DISTRIBUTED_REGIME->CENTRALIZED_REGIME))
    severity: error
    message: "遷移条件が同時に成立し得ます: デッドロックの危険"

  # 契約間整合性: SLAと制度遷移の整合
  - id: SLA_REGIME_CONSISTENCY
    type: cross_contract
    check: >
      for all regime in [CENTRALIZED_REGIME, DISTRIBUTED_REGIME]:
        regime.can_satisfy(DELIVERY_SLA.guarantee)
    severity: error
    message: "{regime}下でSLA保証を満たせない可能性があります"

  # メトリクス到達可能性: 目標メトリクスは達成可能か
  - id: METRIC_FEASIBILITY
    type: simulation_based
    method: Monte_Carlo(n=10000)
    check: >
      P(throughput >= target) >= 0.95 AND
      P(fairness >= target) >= 0.90
    parameters:
      failure_rate: Uniform(0, 10)
      latency_ms: Uniform(0, 500)
```

### 7.2.2 コード生成・自動変換（目的3）

配送システムの制度記述から，DISPATCHERの割当アルゴリズム，ROBOTの制御ロジック，および契約監視器のコードを自動生成する。さらに，制度パラメータの最適化によりモードマップを自動構築する。

```yaml
# === 目的3: コード生成・自動変換 ===
codegen:
  target: "python"
  modules:
    # 制御コード生成: 契約→状態機械
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

    # 契約監視器生成
    - id: SLA_MONITOR
      source_contract: DELIVERY_SLA
      generates:
        - "class SLAMonitor(RuntimeMonitor):"
        - "    def check_delivery_time(self, actual, promised):"
        - "        assert actual <= promised * 1.2"
        - "    def check_success_rate(self, window=100):"
        - "        assert success_count / window >= 0.95"

    # 制度遷移コントローラ生成
    - id: REGIME_CONTROLLER
      source_transitions: [CENTRALIZED_REGIME->DISTRIBUTED_REGIME,
                           DISTRIBUTED_REGIME->CENTRALIZED_REGIME]
      generates:
        - "class RegimeController:"
        - "    def evaluate_transition_condition(self, env):"
        - "    def execute_safe_transition(self, from_r, to_r):"
        - "    def verify_invariant_during_transition(self):"

  # モードマップ自動構築
  optimization:
    - id: REGIME_MAP_CONSTRUCTION
      method: "grid_search + Bayesian_optimization"
      parameter_space:
        failure_rate: [0, 10, step=0.5]
        latency_ms: [0, 500, step=25]
        num_robots: [10, 100, step=10]
      objective: "maximize(throughput) subject_to fairness >= 0.7"
      output: "regime_map.json"
      # 各パラメータ点で最適な運用モード（集中型/分散型）とパラメータ(β,α,λ)を決定
```

## 7.3 IoTデータ共有システム

複数の組織が運営するIoTセンサーネットワーク間でデータを共有するシステムの例である。データの所有権・アクセス権・品質保証を契約として形式化する。

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
        decision_holder: DATA_PROVIDER[i]   # データ所有者が制御
        beta: 0.2                           # 高度に分散
      information:
        alpha: 0.4       # 限定的共有（プライバシー保護）
        views:
          DATA_PROVIDER[i]: "own_sensor_data + subscriber_list"
          DATA_CONSUMER[j]: "subscribed_data + quality_metrics"
          DATA_BROKER: "metadata + usage_statistics"  # 生データへのアクセスなし
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

### 7.3.1 矛盾検出・検証（目的2）

IoTデータ共有システムでは，プライバシー制約とデータ共有要件の間に潜在的矛盾が生じやすい。複数のSLA契約間の整合性や，アクセス権の衝突を検証する。

```yaml
# === 目的2: 矛盾検出・検証 ===
verification:
  # プライバシー制約とデータ共有の矛盾
  - id: PRIVACY_SHARING_CONSISTENCY
    type: constraint_satisfiability
    check: >
      for all provider_i in DATA_PROVIDER[*]:
        for all consumer_j in DATA_CONSUMER[*]:
          provider_i.privacy_policy.min_level
            <= consumer_j.required_privacy
    severity: error
    message: "{provider_i}のプライバシーポリシーと{consumer_j}の要件が矛盾"

  # SLA間の矛盾: 帯域・遅延制約の同時充足可能性
  - id: SLA_FEASIBILITY
    type: resource_analysis
    check: >
      sum(DATA_CONSUMER[*].bandwidth_demand)
        <= network_bandwidth
      AND for all stream in active_streams:
        stream.achievable_latency <= data_freshness_requirement
    method: linear_programming
    severity: error

  # アクセス権の衝突: 情報フロー整合性
  - id: ACCESS_CONTROL_CONSISTENCY
    type: information_flow
    check: >
      # DATA_BROKERは生データにアクセスできない
      NOT(exists flow: DATA_PROVIDER[*] -> DATA_BROKER
        where flow.contains(raw_data))
      # DATA_CONSUMER[j]はsubscribedデータのみ参照可能
      AND for all consumer_j in DATA_CONSUMER[*]:
        consumer_j.accessible_data
          SUBSET_OF subscribed_data(consumer_j)
    method: taint_analysis

  # 義務論理的整合性: 契約上の義務が循環しないか
  - id: OBLIGATION_ACYCLICITY
    type: deontic_logic
    check: >
      no_cyclic_obligation(
        DATA_PROVIDER.maintain_data_quality,
        DATA_CONSUMER.respect_usage_terms,
        DATA_BROKER.verify_quality_claims)
    severity: warning
```

### 7.3.2 コード生成・自動変換（目的3）

データ共有契約からデータパイプラインのスケルトンコード，SLA監視器，課金ロジックを自動生成する。スマートコントラクト（Solidity [[Solidity Documentation]](./appendix-b-references.md)）への変換も示す。生成したコントラクトの検査には，静的解析ツールSlither [[Feist+, 2019]](./appendix-b-references.md) を指定している。

```yaml
# === 目的3: コード生成・自動変換 ===
codegen:
  targets:
    # Python: データパイプライン・監視器
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

    # Solidity: スマートコントラクト
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

  # 形式検証との連携: 生成コードのプロパティ検証
  post_generation_verification:
    - check: "generated_monitor covers all guarantee clauses"
    - check: "generated_billing matches incentive rules"
    - check: "solidity_contract has no reentrancy vulnerability"
      tool: "Slither"
```

## 7.4 AIとの融合

CADLとAIの融合は3つの側面を持つ。第一に，LLMによる自然言語からCADL記述への自動変換。第二に，AIエージェントがCADL記述に基づいて制度を推薦・最適化する機能。第三に，AIエージェント自身がSoSの構成システムとして参加する場合の契約記述である。

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
        - natural_language_to_cadl      # 自然言語→CADL変換
        - regime_recommendation         # 制度推薦
        - parameter_optimization        # パラメータ最適化
        - anomaly_detection             # 異常検知
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
        decision_holder: AI_ADVISOR       # AIが提案
        approval_required: HUMAN_OPERATOR # 人間が承認
        beta: 0.6                         # AIが主導するが人間が監督
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
          - protect_training_data
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

    - id: REGIME_TRANSITION
      trigger: "AI_REGIME_RECOMMENDATION.approved"
      steps:
        - AI_ADVISOR -> AI_AGENT[*] : announce_transition(proposed_regime)
        - AI_AGENT[*] -> AI_ADVISOR : ack
        - AI_ADVISOR -> HUMAN_OPERATOR : transition_report

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

### 7.4.1 矛盾検出・検証（目的2）

AI融合システムでは，AIの安全契約・権限境界・人間監督要件間の矛盾を検出することが特に重要である。AIの自律性レベルと人間承認要件の整合性を形式的に検証する。

```yaml
# === 目的2: 矛盾検出・検証 ===
verification:
  # AI安全契約の充足可能性
  - id: AI_SAFETY_SATISFIABILITY
    type: assume_guarantee
    contracts: [AI_SAFETY_CONTRACT]
    check: >
      # assume(training_data.is_representative)の下で
      # guarantee(no_harmful_action)が常に成立するか
      assumes_imply_guarantees(
        under: all_reachable_states)
    method: bounded_model_checking
    bound: 1000_steps

  # 権限の矛盾: AIの自律性と人間承認の整合
  - id: AUTHORITY_CONSISTENCY
    type: authority_analysis
    check: >
      # AI_ADVISORが提案→HUMAN_OPERATORが承認のフロー
      for all action in AI_ADVISOR.actions:
        if action.requires_approval:
          exists path: action -> HUMAN_OPERATOR.review
      # AI_AGENT自律行動が契約範囲内か
      AND for all agent in AI_AGENT[*]:
        agent.action_space SUBSET_OF
          active_contract.permitted_actions
    severity: error

  # タイムアウト整合性: 人間レビューが間に合うか
  - id: TIMING_CONSISTENCY
    type: timing_analysis
    check: >
      human_review_timeout(30min)
        >= expected_review_time(95th_percentile)
      AND recommendation_interval(5min)
        >= compute_recommendation.worst_case_time
    severity: warning
    message: "人間レビューのタイムアウトが不十分な可能性があります"

  # 義務論理: AI_ADVISORの義務が矛盾しないか
  - id: AI_DEONTIC_CONSISTENCY
    type: deontic_logic
    check: >
      # "explainability"義務と"confidentiality"義務が矛盾しないか
      compatible(
        obligation(explain_recommendation),
        obligation(protect_training_data))
      # フォールバック"maintain_current_regime"が安全か
      AND safe_state(maintain_current_regime)
```

### 7.4.2 コード生成・自動変換（目的3）

AI融合システムからのコード生成は3つのレベルで行われる。(1) NL→CADL変換パイプラインのオーケストレーションコード，(2) ガバナンスポリシーの実行コード（OPA/Rego形式），(3) 反応型合成によるAIエージェントの安全制御コードである。

```yaml
# === 目的3: コード生成・自動変換 ===
codegen:
  target: "python"
  modules:
    # NL→CADL変換パイプライン
    - id: NL_TO_CADL_PIPELINE
      source_protocol: NL_TO_CADL_WORKFLOW
      generates:
        - "class NLtoCADLPipeline:"
        - "    def __init__(self, llm_model: str):"
        - "    def parse_natural_language(self, spec: str) -> AST:"
        - "    def generate_cadl(self, ast: AST) -> CADLDocument:"
        - "    def validate_cadl(self, doc: CADLDocument) -> VerificationResult:"
        - "    def iterate_with_feedback(self, feedback: str) -> CADLDocument:"

    # AI安全制御器: 反応型合成
    - id: AI_SAFETY_CONTROLLER
      source_contract: AI_SAFETY_CONTRACT
      synthesis:
        method: "reactive_synthesis"      # GR(1) realizability
        environment: "AI_AGENT[*].actions"
        system: "AI_SAFETY_CONTROLLER.decisions"
        specification: >
          # 環境仮定: AIは契約範囲内で行動
          assume G(ai_action IN permitted_range)
          # 安全保証: 有害な行動は発生しない
          guarantee G(NOT harmful_action)
          # 活性: 不確実性が高い場合は人間にエスカレーション
          guarantee G(confidence < 0.7 -> F escalate_to_human)
      generates:
        - "class SafetyController(ReactiveSystem):"
        - "    def compute_safe_action(self, state, ai_proposal):"
        - "    def should_escalate(self, confidence) -> bool:"
        - "    def switch_to_safe_mode(self):"

    # モード推薦エンジン
    - id: REGIME_RECOMMENDER
      source_protocol: AI_REGIME_RECOMMENDATION
      generates:
        - "class RegimeRecommender:"
        - "    def __init__(self, regime_map: RegimeMap):"
        - "    def compute_recommendation(self, state) -> Regime:"
        - "    def explain_in_natural_language(self, rec) -> str:"
        - "    def learn_from_rejection(self, reason: str):"

  # ガバナンスポリシー生成 (OPA/Rego形式)
  policy_codegen:
    target: "rego"
    source_contract: AI_GOVERNANCE
    generates:
      - "package cadl.ai_governance"
      - ""
      - "default allow = false"
      - ""
      - "# AI_ADVISORの行動許可ルール"
      - "allow {"
      - '    input.actor == "AI_ADVISOR"'
      - '    input.action == "recommend"'
      - "    input.confidence >= 0.7"
      - "}"
      - ""
      - "# 人間承認が必要な行動"
      - "requires_approval {"
      - '    input.action == "initiate_transition"'
      - "}"
      - ""
      - "# 安全モードへの強制遷移"
      - "force_safe_mode {"
      - "    input.confidence < 0.7"
      - "}"
      - "force_safe_mode {"
      - "    input.action_outside_permitted_range"
      - "}"
      - "force_safe_mode {"
      - "    input.human_override_signal"
      - "}"
```

以上の4つの記述例は，CADLが目的1（制度の形式的・計算的表現），目的2（制度矛盾・違反の検出と検証），目的3（制度記述から実行可能コードへの自動変換）を一貫した言語フレームワーク内でどのように実現しようとしているかを例示している。各例は異なるドメイン（家庭・ロボティクス・IoT・AI）に適用されているが，アクター・契約・プロトコルという階層構造を共有しており，これにより，ドメイン横断的な検証・生成パイプラインを構築できるようにすることを意図している。verificationとcodegenの記述は素描である（本章冒頭の注記を参照）。
