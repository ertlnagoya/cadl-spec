---
sidebar_position: 5
title: "5. 言語仕様"
---

# 5. 言語仕様

## 5.1 全体構造

CADL記述は，以下のトップレベル要素で構成される。1つのCADLファイルは1つのSoS定義を含む。構文はYAMLに類似した宣言的スタイルを基本とし，型注釈と制約式を組み合わせる。

```yaml
sos:
  name: <識別子>                # SoS名
  type: <Directed|Acknowledged|Collaborative|Virtual>  # SoS分類
  version: <セマンティックバージョン>

  context:                      # 環境・前提条件
    environment: { ... }
    assumptions: [ ... ]

  actors:                       # 構成システム（アクター）定義
    - id: <識別子>
      role: <文字列>
      autonomy: <low|medium|high>
      capabilities: [ ... ]

  contracts:                    # 契約定義（中核要素）
    - id: <識別子>
      parties: [ ... ]
      assume: { ... }           # 前提条件（assume-guarantee）
      guarantee: { ... }        # 保証条件
      authority: { ... }        # 権限構造
      information: { ... }      # 情報共有構造
      responsibilities: { ... } # 責任分担
      incentives: { ... }       # インセンティブ構造

  protocols:                    # プロトコル定義
    - id: <識別子>
      trigger: <イベント式>
      steps: [ ... ]
      timing: { ... }
      fallback: { ... }

  algorithms:                   # アルゴリズム参照
    <機能名>:
      central: <アルゴリズム名>
      local: <アルゴリズム名>

  transitions:                  # 制度遷移定義
    - from: <制度ID>
      to: <制度ID>
      condition: <述語式>
      protocol: <遷移プロトコルID>
      safety_invariant: <安全条件>

  metrics:                      # 評価指標定義
    - id: <識別子>
      formula: <式>
      target: <目標値>
```

### 5.1.1 段階的記述レベル

CADLは，利用者の専門性と記述の目的に応じた3段階の記述レベルを提供する。各レベルは上位互換であり，概要レベルの記述に設計レベル・検証レベルの情報を段階的に追加できる。

| **記述レベル** | **対象利用者** | **記述内容** | **構文の特徴** |
|---|---|---|---|
| 概要レベル (Overview) | 市民・自治体職員・企業実務者・学生 | SoS名，アクターの役割，契約の概要（自然言語），基本的なルール | 自然言語に近い記述を許容 / パラメータ・制約は省略可 / AI生成の入口となる |
| 設計レベル (Design) | 設計者・研究者・上級学生 | 制度パラメータ(α,β,λ)，プロトコル手順，遷移条件，メトリクス | パラメータ値の明示 / 型注釈の付与 / 制約式の記述 |
| 検証レベル (Verification) | SoSアーキテクト・検証エンジニア | assume-guarantee契約，安全不変条件，形式的性質（時相論理） | 形式的述語・量化子 / SMT/モデル検査用注釈 / codegen/synthesis指定 |

以下に，家庭内ルールの「家事分担」を題材に，同一の制度が3つのレベルでどのように記述されるかの例を示す。

```yaml
# === 概要レベル: 市民・学生向け ===
sos:
  name: "家庭の家事分担"
  type: Collaborative
  description: "家族4人で家事を公平に分担するルール"

  actors:
    - 親（2人）: 家事の割り当てを決める
    - 子ども（2人）: 割り当てられた家事を担当する

  contracts:
    - name: "家事の分担ルール"
      内容: >
        毎週，親が家事を割り当てる。
        子どもは夕食前までに完了する。
        完了したら100円のお小遣いをもらえる。
      紛争解決: "話し合いで決める。まとまらなければ親が最終決定。"
```

```yaml
# === 設計レベル: パラメータ・プロトコルの追加 ===
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
        beta: 0.3                    # やや集中的
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

検証レベルの記述例は，7.1節の矛盾検出・検証（目的2）を参照されたい。このように，同一の制度が利用者のニーズに応じて異なる粒度で記述でき，AIが概要レベルから設計・検証レベルへの精緻化を支援する。

## 5.2 データモデル

### 5.2.1 型システム

CADLは以下の基本型とユーザ定義型を提供する。

| **型名** | **説明** | **記述例** |
|---|---|---|
| Int | 整数型 | latency_ms: 100 |
| Float | 浮動小数点型 | failure_rate: 0.002 |
| Bool | 真偽値型 | is_active: true |
| String | 文字列型 | role: "vehicle" |
| Duration | 時間長型 | timeout: 100ms, 5s, 1min |
| Range | 区間型 | latency: \{ min: 0, max: 200 \} |
| Dist | 確率分布型 | demand: Normal(15, 3) |
| Enum | 列挙型 | autonomy: low \| medium \| high |
| Set | 集合型 | parties: \{CENTRAL, TAXI[*]\} |
| Map | マップ型 | views: \{ CENTRAL: "global", TAXI: "local" \} |
| Actor | アクター参照型 | decision_holder: CENTRAL |
| ActorSet | アクター集合型（ワイルドカード対応） | TAXI[*], SENSOR[1..N] |

### 5.2.2 アクターモデル

アクターはSoSの構成システムを表す基本単位である。各アクターは一意の識別子を持ち，役割・自律性レベル・能力を宣言する。アクターの集合はワイルドカード記法（[*]）またはインデックス範囲（[1..N]）で参照できる。

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

  - id: TAXI[1..N]       # N台のタクシーをパラメトリックに定義
    role: "vehicle"
    autonomy: high
    capabilities:
      - local_navigation
      - obstacle_detection
    interface:
      input: [assigned_route, road_status]
      output: [position, sensor_data]
```

### 5.2.3 契約モデル

契約はCADLの中核要素であり，assume-guaranteeセマンティクスに基づく。各契約は以下のサブ要素を持つ。

| **サブ要素** | **説明** |
|---|---|
| assume | 前提条件。契約が有効であるために環境・他アクターが満たすべき条件。 |
| guarantee | 保証条件。前提条件が満たされた場合に契約当事者が保証する性質。 |
| authority | 意思決定のスコープと決定権者。分散度パラメータβを含む。 |
| information | 各当事者の観測範囲と情報共有モード。共有度パラメータαを含む。 |
| responsibilities | 各当事者の義務・タスクの列挙。 |
| incentives | 報酬・ペナルティ・評判メカニズムの定義。強度パラメータλを含む。 |
| duration | 契約の有効期間。無期限・期限付き・イベント駆動の3種。 |
| violation | 契約違反時の検出条件と対応動作。 |

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
      beta: 0.1          # 集中度（0=完全集中, 1=完全分散）

    information:
      alpha: 0.9          # 情報共有度
      views:
        CENTRAL: "global_road_graph + all_taxi_positions"
        TAXI[*]: "assigned_route + local_sensors"
      sharing:
        - TAXI[*] -> CENTRAL : position       # 定期的（1秒周期）
        - CENTRAL -> TAXI[*] : route          # イベント駆動

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
      detect: "route_deviation > threshold OR position_report_delay > 5s"
      action: "notify(CENTRAL) AND log_violation"
      escalation: "after 3 violations: suspend_contract"

    duration: indefinite
```

### 5.2.4 プロトコルモデル

プロトコルはアクター間の協調手順を定義する。各ステップはメッセージ送信（矢印記法），ローカル計算（コロン記法），または条件分岐で構成される。

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

## 5.3 構文定義

以下にCADLの主要な構文規則をEBNF（拡張バッカス・ナウア記法）で示す。完全なEBNFは付録Aを参照。

```
(* CADL EBNF - 主要規則 *)

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

sos_type = "Directed" | "Acknowledged" | "Collaborative" | "Virtual" ;

actor_def = "- id:" , actor_id ,
    "role:" , string ,
    "autonomy:" , autonomy_level ,
    [ "capabilities:" , capability_list ] ,
    [ "interface:" , interface_def ] ;

actor_id = identifier , [ "[" , ( "*" | range ) , "]" ] ;
autonomy_level = "low" | "medium" | "high" | float_literal ;

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
message_step = actor_ref , "->" , actor_ref , ":" , message_expr ;
compute_step = actor_ref , ":" , computation_expr ;
```

## 5.4 意味論

### 5.4.1 契約のassume-guaranteeセマンティクス

CADLの契約は，Benvenisteらの契約ベース設計理論およびSaoudらの連続時間assume-guarantee契約に基づく。契約C = (A, G)において，Aは前提条件（assume），Gは保証条件（guarantee）である。

契約の合成: 2つの契約C₁ = (A₁, G₁)とC₂ = (A₂, G₂)の並行合成は C₁ ⊗ C₂ = (A₁ ∧ A₂, G₁ ∧ G₂) で定義される。ただし，循環依存がある場合はSaoudらの手法に従い，最大不動点意味論を適用する。

### 5.4.2 制度パラメータの意味論

制度パラメータα（情報共有度），β（意思決定分散度），λ（インセンティブ強度）は[0, 1]の区間値を取る。これらのパラメータは制度の構造的特性を連続的に制御し，モードマップ構築の基礎となる。

| **パラメータ** | **名称** | **意味** |
|---|---|---|
| α (alpha) | 情報共有度 | 0: 情報非共有（各アクターはローカル情報のみ） / 1: 完全共有（全アクターが全情報を観測可能） |
| β (beta) | 意思決定分散度 | 0: 完全集中（D-SoS: 単一アクターが全決定） / 1: 完全分散（C-SoS: 各アクターが自律的に決定） |
| λ (lambda) | インセンティブ強度 | 0: インセンティブなし（指令ベース） / 1: 強いインセンティブ（市場メカニズム） |

### 5.4.3 プロトコルの操作的意味論

プロトコルの各ステップはラベル付き遷移システム（LTS）として解釈される。メッセージ送信 A -> B : m は，Aの送信アクションとBの受信アクションの同期合成として定義される。タイミング制約は時間オートマトンの不変条件として符号化され，UPPAAL等のモデル検査器による検証が可能である。
