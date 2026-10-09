---
sidebar_position: 5
title: "5. 言語仕様"
description: "CADLファイルの構造，記述レベル，データモデル（型・アクター・契約・プロトコル），主要な構文規則，意味論を示す。"
---

# 5. 言語仕様

## 5.1 全体構造

CADL記述は，以下のトップレベル要素で構成される。1つのCADLファイルは1つのSoS定義を含む。CADLファイルはYAML文書であり，CADLの式（述語，ステップ）はYAML文字列の中に書く。

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
      assume: [ ... ]           # 前提条件（assume-guarantee）
      guarantee: [ ... ]        # 保証条件
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

この骨格は主要なブロックだけを示しており，`description`，`verification`，`codegen`，`extensions`，`motivation` は省略している。キーの完全な一覧は[付録AのA.11節](./appendix-a-syntax.md#a11-reserved-keywords)にある。

v0.1では，運用モード（regime）は名前である。`transitions:` の `from:` / `to:` に現れることで導入され，別個の宣言はない。また，契約やパラメータ値をモードに結び付ける構文は言語にない。

### 5.1.1 段階的記述レベル

CADLは，利用者の専門性と記述の目的に応じた3段階の記述レベルを提供する。概要レベルは非形式的な記述であり，文法の対象外である（[付録A](./appendix-a-syntax.md)は，そのような記述は文法に適合しなくてよいとしている）。設計レベルへ進むには，下の設計レベルの例に示す構造へ書き直す。設計レベルのファイルは，ブロックを追加することで検証レベルへ拡張する。

| **記述レベル** | **対象利用者** | **記述内容** | **構文の特徴** |
|---|---|---|---|
| 概要レベル (Overview) | 市民・自治体職員・企業実務者・学生 | SoS名，アクターの役割，契約の概要（自然言語），基本的なルール | 自然言語に近い記述を許容 / パラメータ・制約は省略可 / AI生成の入口となる |
| 設計レベル (Design) | 設計者・研究者・上級学生 | 制度パラメータ(α,β,λ)，プロトコル手順，遷移条件，メトリクス | パラメータ値の明示 / 型注釈の付与 / 制約式の記述 |
| 検証レベル (Verification) | SoSアーキテクト・検証エンジニア | assume-guarantee契約，安全不変条件，形式的性質（時相論理） | 形式的述語・量化子 / SMT/モデル検査用注釈 / codegen/synthesis指定 |

v0.1には，型注釈や時相論理の性質を書く構文はない。検証レベルの行は，目指す方向を述べたものである。

以下に，家庭内ルールの「家事分担」を題材に，同一の制度が概要レベルと設計レベルでどのように記述されるかの例を示す。検証レベルの記述は，設計レベルのファイルに `verification:` ブロックを追加したものであり，その構文は[付録A §A.8](./appendix-a-syntax.md)に示す。

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
    - id: AI_ASSISTANT
      role: "mediator"
      autonomy: low

  contracts:
    - id: CHORE_SHARING
      parties: ["PARENT[*]", "CHILD[*]"]
      authority:
        decision_holder: PARENT[1]
        beta: 0.7                    # やや集中的
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

検証レベルの記述例は，[7.1節](./07-examples.md)の矛盾検出・検証（[1.2節の目的2](./01-introduction.md#目的2-sosの制度違反や矛盾を計算できるようにする)）を参照されたい。このように，同一の制度が利用者のニーズに応じて異なる粒度で記述でき，AIが概要レベルから設計・検証レベルへの精緻化を支援する。

## 5.2 データモデル

### 5.2.1 型システム

以下の表にCADLの組み込み型を示す。これらは言語設計の一部であり，v0.3のリファレンス実装はこれらを検査しない（付録A，A.12）。

| **型名** | **説明** | **記述例** |
|---|---|---|
| Int | 整数型 | latency_ms: 100 |
| Float | 浮動小数点型 | failure_rate: 0.002 |
| Bool | 真偽値型 | is_active: true |
| String | 文字列型 | role: "vehicle" |
| Duration | 時間長型 | timeout: 100ms, 5s, 1min |
| Range | 区間型 | latency: Range(0, 200) |
| Dist | 確率分布型 | demand: Normal(15, 3) |
| Enum | 列挙型 | autonomy: low \| medium \| high |
| Set | 集合型 | `parties: [CENTRAL, "TAXI[*]"]` |
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

`autonomy:`（`low` / `medium` / `high`，既定値は `medium`）と，ファイルレベルの `type:`（`Directed` / `Acknowledged` / `Collaborative` / `Virtual`）は，説明のためのラベルである。リファレンス実装はこれらを記録し，レポートや生成する設定に渡すが，βやその他の値と照合する検査は行わない。

### 5.2.3 契約モデル

契約はCADLの中核要素であり，assume-guaranteeセマンティクスに基づく。各契約は以下のサブ要素を持つ。

| **サブ要素** | **説明** |
|---|---|
| assume | 前提条件。契約が有効であるために環境・他アクターが満たすべき条件。 |
| guarantee | 保証条件。前提条件が満たされた場合に契約当事者が保証する性質。 |
| authority | 意思決定のスコープと決定権者。集中度パラメータβを含む。 |
| information | `alpha`（共有度パラメータα），各当事者が持つ `views`，および `sharing` のフロー（`送信元 -> 受信先 : 項目`）を保持する。push/pull/broadcastといった共有モードはv0.1では表現できない（下の例ではコメントとして現れるだけである）。 |
| responsibilities | 各当事者の義務・タスクの列挙。 |
| incentives | 報酬・ペナルティ・評判メカニズムの定義。強度パラメータλを含む。 |
| duration | 契約の有効期間。無期限・期限付き・イベント駆動の3種。 |
| violation | 契約違反時の検出条件と対応動作。 |

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
      beta: 0.9          # 意思決定の集中度（0=完全分散, 1=完全集中）

    information:
      alpha: 0.9          # 情報共有度
      views:
        CENTRAL: "global_road_graph + all_taxi_positions"
        TAXI[*]: "assigned_route + local_sensors"
      sharing:
        - "TAXI[*] -> CENTRAL : position"       # 定期的（1秒周期）
        - "CENTRAL -> TAXI[*] : route"          # イベント駆動

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

### 5.2.4 プロトコルモデル

プロトコルはアクター間の協調手順を定義する。ステップには次の5種類がある。

- **メッセージ送信**（`A -> B : m`，矢印記法）— アクターAがアクターBにメッセージ `m` を送る。
- **ローカル計算**（`A : f(x)`，コロン記法）— アクターAが自身の計算を行う。
- **条件分岐**（`if` / `else`）— 条件が成り立つときは `if` の下のステップを，成り立たないときは `else:` の下のステップを実行する。
- **`parallel:`** — その下に並べたステップは互いの順序が定まっておらず，それらがすべて完了するとプロトコルは先へ進む。
- **`barrier:`** — 同期点である。与えた条件が成り立つときにだけ，プロトコルは先へ進む。

v0.3のリファレンス実装は，`else:` の分岐とバリアの条件を保持しない（[付録AのA.12節](./appendix-a-syntax.md#a12-reference-implementation-status-v03)）。

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

## 5.3 構文定義

CADLファイルはYAML文書である。以下にCADLの主要な構文規則をEBNF（拡張バッカス・ナウア記法）で示す。記法は[付録A](./appendix-a-syntax.md)に従う。すなわち，コロンで終わる終端記号はYAMLマッピングのキーであり，マッピングの中の項目は任意の順序で書いてよく，`{ "-" , x }` は `x` を要素とするYAMLシーケンスである。述語の式の構文を含む完全な文法は[付録A](./appendix-a-syntax.md)を参照されたい。具象構文については付録Aが規範的である。

```ebnf
(* CADL EBNF - 主要規則 *)

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

契約で必須なのは `id` と `parties` だけであり，本章の例では不要なブロックを省略している。`autonomy` の既定値は `medium` である。

ファイルはYAMLであるため，一部のスカラーは引用符で囲む必要がある。プロトコルのステップは引用符なしで書いてもよい。YAMLは `A -> B : m` を項目が1つのマッピングとして読み，パーサはこれを受理する。ただし，引用符で囲んだ形（`- "A -> B : m"`）を推奨する。`sharing:` の要素（`- "TAXI[*] -> CENTRAL : position"`）と，インラインのリストの中の添字付きアクター参照（`parties: [CENTRAL, "TAXI[*]"]`）は，引用符で囲まなければならない。囲まないと，YAMLが別の意味に読むか，拒否する。

## 5.4 意味論

### 5.4.1 契約のassume-guaranteeセマンティクス

CADLの契約は，Benvenisteらの契約ベース設計理論およびSaoudらの連続時間assume-guarantee契約に基づく。契約C = (A, G)において，Aは前提条件（assume），Gは保証条件（guarantee）である。合成と飽和形はBenvenisteらに，弱充足と強充足の区別はSaoudらによる（[付録B](./appendix-b-references.md)を参照）。

飽和形: 契約C = (A, G)は，Aに違反するすべての振る舞いをGがすでに含んでいるとき，すなわちGをG ∨ ¬Aで置き換えたとき，飽和形（正準形）であるという。

無矛盾性: 契約は，A ∧ Gが充足可能であるとき無矛盾である。リファレンス実装の検証器が，契約ごとに，また当事者を共有する契約の対について検査するのは，この性質である。

契約の合成: 2つの契約C₁ = (A₁, G₁)とC₂ = (A₂, G₂)の並行合成は，飽和形（正準形）の契約に対して C₁ ⊗ C₂ = ((A₁ ∧ A₂) ∨ ¬(G₁ ∧ G₂), G₁ ∧ G₂) で定義される。

弱充足と強充足: 弱充足では，構成要素は，それまでAが成り立ち続けている間，Gを満たさなければならない。強充足では，Aが成り立たなくなった後も短い時間はGを満たし続けなければならない。これが，構成要素間の循環論法を断ち切る。循環依存がある場合はSaoudらに従い，各構成契約に（弱充足ではなく）強充足を要求する。

### 5.4.2 制度パラメータの意味論

制度パラメータα（情報共有度），β（意思決定集中度），λ（インセンティブ強度）は，それぞれ区間[0, 1]の値を取る。これらのパラメータは制度の構造的特性を連続的に制御し，モードマップ構築の基礎となる。

| **パラメータ** | **名称** | **意味** |
|---|---|---|
| α (alpha) | 情報共有度 | 0: 情報非共有（各アクターはローカル情報のみ） / 1: 完全共有（全アクターが全情報を観測可能） |
| β (beta) | 意思決定集中度 | 0: 完全分散（C-SoS: 各アクターが自律的に決定） / 1: 完全集中（D-SoS: 単一アクターが全決定） |
| λ (lambda) | インセンティブ強度 | 0: インセンティブなし（指令ベース） / 1: 強いインセンティブ（市場メカニズム） |

表に示したβとSoS類型の対応は目安であり，検査される規則ではない（5.1.1節の例は `type: Collaborative` と `beta: 0.7` を組み合わせている）。

### 5.4.3 プロトコルの操作的意味論

プロトコルの各ステップはラベル付き遷移システム（LTS）として解釈される。メッセージ送信 A -> B : m は，Aの送信アクションとBの受信アクションの同期合成として定義される。タイミング制約は時間オートマトンの不変条件として符号化し，UPPAAL等のモデル検査器で検証することを設計上の意図としている。v0.3ではモデル検査は統合されておらず，デッドロック検出は構造解析で行う（[6.3節](./06-design.md)）。

## 5.5 この先の参照先

- 完全な文法とキーの一覧: [付録A](./appendix-a-syntax.md)。
- 5.2節で詳しく扱っていないブロック（`context`，`algorithms`，`transitions`，`metrics`，`verification`，`codegen`）: [付録A](./appendix-a-syntax.md)のA.3節とA.6〜A.9節で規定する。
- 契約のライフサイクルとモニター（`lifecycle:`，`monitors:`）: [付録E](./appendix-e-sos-dsl.md)。
- 動機拡張: [付録C](./appendix-c-motivation.md)。
- コード生成ターゲット: [付録D](./appendix-d-codegen.md)。
- ファイルの検査: `cadl parse`，`cadl check`，`cadl verify`（インストール方法は[仕様書イントロダクション](./intro.md)に示す）。
- 実行できる例: cadlリポジトリの[`examples/` ディレクトリ](https://github.com/ertlnagoya/cadl/tree/master/examples)。
