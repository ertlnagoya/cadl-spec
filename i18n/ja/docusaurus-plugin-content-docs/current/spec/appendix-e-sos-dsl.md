---
sidebar_position: 15
title: "付録E. SoS-DSL拡張"
---

# 付録E. SoS Contract DSL拡張（sos-dsl 0.1）

本付録は，CADLの**SoS Contract DSL拡張**を規定する。この拡張は，
[付録A.4](./appendix-a-syntax#a4-contracts-institution-layer)の生成規則
`contract_def` に2つのキー `lifecycle:` と `monitors:` を追加し，
契約の実行状態と実行時の観測を，言語の第一級の構成要素として記述できるようにする。

コア言語（第5章，付録A）は，これらのブロックを必須と**しない**。
本拡張を実装していないCADL準拠の処理系は，新しいキーを構文上は受理し，
ファイルを拒否するのではなく*情報レベル*の診断を出すことが望ましい。

本拡張のバージョンは，コア言語とは独立に管理する。拡張の名前は `sos-dsl` であり，
本付録はバージョン `0.1` を記述する（リファレンス実装のソースでは，同じ版に
`v0.1-sos-ext` というラベルが付いている）。本拡張に依存するファイルは，
付録A.2の `extensions:` キーでそのことを宣言することが望ましい。

```yaml
sos:
  ...
  extensions:
    - sos-dsl: 0.1
```

## E.1 動機 {/* #e1-motivation */}

現在のCADLの契約は，**規範的な合意のクラス**を記述する。すなわち，当事者，
A/G節，権限，情報の流れ，インセンティブのパラメータ，および違反検出のための
1つにまとめた述語を宣言する。SoS全体で*何が*成り立たなければならないかを
規定するには，これで十分である。しかし，次の点については意図的に何も述べていない。

1. **インスタンスごとの契約ライフサイクル。** 「配送契約」は `DeliveryRequest`
   ごとに1つ生成され，いくつかの状態（Proposed → Assigned → Accepted →
   Delivering → Completed/Violated）を順に進む。クラスレベルの契約仕様では，
   このインスタンスごとの状態機械を表現できない。
2. **宣言的な観測。** `violation.detect` は，観測の対象，サンプリングの方法，
   検出の論理を，文字列で書いた1つの述語にまとめてしまう。*何を*，
   *どの頻度で*観測するかを，第一級の要素として宣言する手段がない。
3. **規範に結び付いた期限。** `protocol.timing.max_response` は，プロトコルの
   ステップの時間制約を表す。個々の契約インスタンスのあるステップに，
   規範的な制約として期限を課すものではない。
4. **可視化のための実行時イベントの発行。** ライフサイクルが明示されていないと，
   下流のツール（CADL Explorerやランタイム）は，運用者が考える粒度で
   契約のイベントを購読できない。

SoS-DSL拡張は，この4つの不足を，既存の定義に追加する形で補う。
既存の契約定義との後方互換性は保たれる。

## E.2 概念上の階層 {/* #e2-conceptual-layering */}

| 階層 | 既存のCADL | SoS-DSL拡張 |
| --- | --- | --- |
| クラスレベルの規範仕様 | `parties` / `assume` / `guarantee` / `authority` / `information` / `responsibilities` / `incentives` / `violation` | 変更なし |
| インスタンスごとのライフサイクル | — | **`lifecycle:`** |
| 宣言的な観測 | 単一の `violation.detect` | **`monitors:`** |
| 規範に結び付いた期限 | `timing` による暗黙の指定 | **ライフサイクル遷移の `deadline:`** |

本拡張は，契約のための別の名前空間を導入**しない**。`lifecycle:` と `monitors:` は，
`assume:`，`guarantee:`，その他の付録A.4のキーをすでに受理している，
同じ `contract_def` のキーである。

## E.3 構文（A.4へのEBNFの追加） {/* #e3-syntax-ebnf-additions-to-a4 */}

文法には付録Aの記法を用いる。コロンで終わる終端記号はYAMLマッピングのキーであり，
`{ "-" , x }` はYAMLシーケンスである。`(* string *)` と注記した生成規則は，
1つのYAML文字列スカラーの内容を記述する。`lifecycle_block` と `monitor_def` は，
A.4が参照している2つの非終端記号である。

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

`identifier`，`actor_ref`，`duration_lit`，`step_expr`，`predicate`，`arith_expr`，
`member_access` は付録A（A.1，A.5，A.10）で定義している。`rule` の中では，
`membership` がA.10の生成規則 `comparison` の選択肢として加わり，`IN` は予約語となる。
`sampling:` の既定値は `event`，`severity:` の既定値は `Major` である。

`on:`，`when:`，`rule:` の値，および `observe:` の要素のうち `[`，`->`，`": "` を
含むものは，E.6の例のように引用符で囲む必要がある。キー `on` は引用符を付けずに
書くことが望ましい。YAML 1.1のローダーは引用符のない `on` を真偽値として読むが，
そのようなローダーの上に作られた処理系も，これをこのキーとして認識しなければならない。

## E.4 静的意味論 {/* #e4-static-semantics */}

SoS-DSL拡張に対応する処理系は，既存の検査に加えて，次の規則を検査しなければならない。

- **L-1.** `lifecycle.initial` の状態と `lifecycle.terminal` の各状態は，
  `lifecycle.states` に現れなければならない。
- **L-2.** `lifecycle.transitions[*].from` と `.to` の各状態は，
  `lifecycle.states` に現れなければならない。
- **L-3.** `lifecycle.terminal` は少なくとも1つの状態を挙げなければならず，
  初期状態から少なくとも1つの終端状態に到達可能でなければならない。
- **L-4.** 遷移に `deadline:` を書くと，その遷移の `from` の状態を有効範囲とする
  `Timeout` イベントが暗黙に導入される。同じ状態から出る2つの遷移がともに期限を
  持ってもよく，それらの意味は互いに独立である。`deadline:` を持つ遷移は，
  `on_violation:` ブロックも持つことが望ましい。
- **L-5.** `lifecycle.transitions[*].on_violation.transition` の値は，
  `lifecycle.states` に現れる状態の名前でなければならない（強制的な移動の
  遷移先の状態である。たとえば `Violated`）。
- **M-1.** `monitor.observe` の各要素は，宣言済みのアクターの属性
  （たとえば `ROBOT[i].battery`），メッセージ名，または予約済みの識別子
  `time` と `state` のいずれかでなければならない。
- **M-2.** `on_match.violation` は，報告する違反（破られた規範。たとえば
  `collision`）に付けるラベルとなる識別子である。ほかの場所で宣言されている
  必要はない。省略した場合は，モニターの `id` をラベルとして用いる。
- **M-3.** `on_match.transition` の値は，同じ契約の `lifecycle.states` に現れる
  状態の名前でなければならない。この値は，強制的な移動の*遷移先の状態*
  （たとえば `Violated`）であり，宣言された遷移の `id` ではない。

したがって，`on_violation:` と `on_match:` のどちらにおいても，キー `transition:` の
値はつねに遷移先の状態の名前である。これは，E.6の例，IRのフィールド
`on_violation_transition` / `on_match_transition`（E.7），およびリファレンス実装の
Unity C#ジェネレータと一致する。このジェネレータは，そのような移動を，現在の状態から
指定された状態への `<jump>` として記録する。

`rule` の中では（したがって `when:` と `on:` のイベントの中でも），3つの識別子が
予約されている。`state` はインスタンスの現在のライフサイクル状態，`now` は現在時刻，
`request` はそのインスタンスを生成した要求（たとえば `request.deadline`）である。
ライフサイクルの状態の名前を単独で書いた識別子（たとえば `Assigned`）は，
その状態を表す。

v0.3のリファレンス実装は，2つのブロックを構文解析してIR（E.7）に変換するが，
規則L-1からM-3まではまだ検査しない。`severity:`，`sampling:`，`deadline:` の値の
妥当性も検査しない。認識できない `sampling:` は `event` として読まれ，読み取れない
`deadline:` は捨てられ，`severity:` は書かれたとおりに引き継がれる。したがって，E.6の例は，
`collision_watch` が `OBSTACLES.positions` を観測しているにもかかわらず検査を通る。
これは環境の量であり，M-1が求める宣言済みのアクターの属性ではない。

## E.5 動的意味論（参考） {/* #e5-dynamic-semantics-informative */}

- 契約インスタンスは，初期トリガが発火したとき（たとえば `DeliveryRequest` が
  到着したとき）に生成される。インスタンスは `lifecycle.states` の状態を進む。
  これを駆動するのは，`lifecycle.transitions[*].on` のイベント，期限のタイマー
  （インスタンスを `on_violation.transition` の状態へ移す），および
  `monitors[*].on_match.transition` のアクション（インスタンスを指定された状態へ移す）
  である。
- 遷移は，インスタンスがその `from` の状態のいずれかにあり，`on:` のイベントが発生し，
  かつ `when:` のガードがあればそれが成り立つときに発火する。`message_event` は，
  そのメッセージが送信されたときに発生する。イベントとして用いた `rule` は，
  それが真になったときに発生する。
- 遷移の `deadline:` は，規範的な時間制約を定める。この時間は，インスタンスが
  その遷移の `from` の状態のいずれかに入った時点から測る。それまでに遷移が
  発火しなければ，*違反*となる。違反の重大度は，`on_violation:` ブロックで
  上書きしない限り `Major` であり，インスタンスは `on_violation.transition` が
  指定する状態へ移る。
- `emit:` には，遷移の発火時に追加で発行するイベントの名前を列挙する。これらは
  可視化ツールやログ記録ツールが利用する。リファレンス実装のジェネレータは
  `emit:` をIRに引き継ぐが，v0.3ではそれに基づく処理を行わない。`emit:` の有無に
  かかわらず，すべての遷移がライフサイクルイベントとして発行される。
- `monitors` は，ライフサイクルの状態機械とは独立に評価されるが，`rule:` の中で
  `state`（現在のライフサイクル状態）を参照できる。`sampling: event` のモニターは，
  インスタンスに配送されるイベントごとに評価され，`periodic(d)` のモニターは
  `d` ごとに評価される。規則が成り立つと，モニターは `on_match.violation` を
  ラベルとする違反を報告し，`on_match.transition` があれば，インスタンスを
  その状態へ移す。
- 既存の `incentives.rules` と，拡張の `monitor.on_match` は連携する。本拡張によって
  違反と遷移を名前で指せるようになり，報酬と罰則はそれらを参照する。

## E.6 ロボット配送の例（抜粋） {/* #e6-robot-delivery-example-excerpt */}

次の契約は，[`cadl`](https://github.com/ertlnagoya/cadl) リポジトリの
`examples/sos_dsl_robot_delivery.cadl` から取ったものである。一部を省略しており，
契約の `authority`，`information`，`incentives`，`violation` の各ブロックと，
ファイルの残りの部分（`actors:`，`metrics:`）は示していない。

```yaml
contracts:
  - id: DELIVERY_SLA
    parties: [DISPATCHER, "ROBOT[*]", "CUSTOMER[*]"]
    assume:
      - "ROBOT[i].battery > 20"
    guarantee:
      - "delivery_time <= 300s"

    # === SoS-DSL拡張: インスタンスごとのライフサイクル ===
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

    # === SoS-DSL拡張: 宣言的なモニター ===
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

## E.7 中間表現（IR）への追加 {/* #e7-intermediate-representation-ir-addition */}

CADLシミュレータのIR（[`cadl`](https://github.com/ertlnagoya/cadl) リポジトリの
モジュール `cadl.sim.ir`）を拡張し，`institution.contracts` の下にある契約の
各IRオブジェクトに，フィールド `lifecycle` と `monitors` を追加する。その形は，
IRのデータクラスを**そのままシリアライズしたもの**（`asdict()`）である。
IRは表層構文を正規化し，入れ子になった `on_violation` / `on_match` / `sampling` の
各ブロックを，親の名前を接頭辞とする平坦なフィールドに**展開する**
（これにより，フィールドを1つずつ読むジェネレータにとってJSONの形が安定する）。

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

IRへの変換時に行う正規化は次のとおりである。

| 表層構文 | 正規化後のIRフィールド |
| --- | --- |
| `from: Assigned`（単一のid） | `"from_states": ["Assigned"]` |
| `from: [Assigned, Accepted]` | `"from_states": ["Assigned", "Accepted"]` |
| `to: Accepted` | `"to_state": "Accepted"` |
| `deadline: 5s` | `"deadline_ms": 5000` |
| `on_violation: { transition: V, severity: Major }` | `"on_violation_transition": "V"`，`"on_violation_severity": "Major"` |
| `sampling: periodic(500ms)` | `"sampling_kind": "periodic"`，`"sampling_period_ms": 500` |
| `sampling: event` | `"sampling_kind": "event"`，`"sampling_period_ms": null` |
| `on_match: { violation, transition, severity }` | `"on_match_violation"`，`"on_match_transition"`，`"on_match_severity"` |

コマンド `cadl sim-ir <file> --format json` は，CADL ExplorerのLifecycle Viewなどの
下流のツールに向けて，この形（上の例は一部を省略している）を出力する。
Unity C#ジェネレータ（`cadl codegen --target unity-csharp`）は，構文解析された
同じ契約をもとに動作する。PythonのリファレンスランタイムもこのJSONを読み込む。このランタイムは，
[`cadl-raspimouse-simulator`](https://github.com/ertlnagoya/cadl-raspimouse-simulator)
リポジトリの `cadl/runtime/` で公開している。

## E.8 コード生成に関する取り決め（参考） {/* #e8-codegen-contract-informative */}

コード生成ターゲットは，`lifecycle` ブロックと `monitors` ブロックからコードを
生成してよい。本拡張のリファレンスジェネレータは，`unity-csharp` ターゲット
（[付録D](./appendix-d-codegen)）である。このジェネレータは，`lifecycle:` または
`monitors:` のブロックを持つ契約ごとに，次のものを生成する。

- 契約ごとに1つの状態機械クラス（状態は `lifecycle.states` から，
  遷移は `lifecycle.transitions` から得る）
- `deadline_ms` を持つ遷移ごとに1つの期限タイマー
- `monitor` ごとに1つの，周期駆動またはイベント駆動のモニタータスク
- 発火した `on_violation` または `on_match.violation` ごとに1件の違反ログ

v0.3では，生成されたランタイムは，`on:` のイベントの文字列を，ホストアプリケーションが
通知したイベントの名前と比較して照合する。また，`rule` を関数呼び出しなしで評価する。
E.6の `collision_watch` のように関数呼び出しを含む規則は，決して成り立たない。
生成された評価器は，`rule` の中の算術演算子 `+ - * /` と時間長リテラル（`5s`）にも
対応していない。
`now`，`request`，および観測対象の属性の値は，ホストが与える。

報酬と制裁の実行は，この版の**対象外**である。ランタイムは報酬と制裁のイベントを
記録することが望ましいが，それに基づいて動作することは求めない。

## E.9 後方互換性 {/* #e9-backward-compatibility */}

拡張を含まないCADL v0.1に基づいて書かれたファイルは，引き続き有効である。
SoS-DSL拡張を用いるファイルは，`sos:` マッピングの `extensions:` の下で
`sos-dsl: 0.1` を宣言することが望ましい。本拡張を実装していない処理系は，
そのようなファイルを拒否してはならない。そのような処理系は，ファイルごとに
1件の情報レベルの診断を出すことが望ましい。
