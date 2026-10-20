---
sidebar_position: 21
sidebar_label: "付録 B — 記法の早見表"
title: "付録 B — 記法の早見表"
---

# 付録 B — 記法の早見表

本書で使う CADL の書き方、コマンド、ファイルの場所を 1 ページにまとめます。それぞれの意味は第 3 章で説明しています。この付録の CADL の例は、つなげると 1 つのファイルになり、`cadl` 0.3.18 の `cadl check` と `cadl verify` を通ります。

## B.1 ファイルの骨組み

```yaml
sos:
  name: "MyDelivery"
  type: Acknowledged              # Directed / Acknowledged / Collaborative / Virtual
  version: "0.1.0"
  extensions:                     # lifecycle: と monitors: を使うときに宣言する
    - sos-dsl: 0.1
  context:
    environment:
      num_robots: 3               # シミュレータなどに渡す値
  actors:    [...]                # B.2
  contracts: [...]                # B.2、B.3
  protocols: [...]                # B.2
```

## B.2 構造の層

```yaml
  actors:
    - id: DISPATCHER
      role: "central_coordinator"
      autonomy: low               # low / medium / high（省略時 medium）
      capabilities: [assign_tasks]
      interface:
        input:  [position_report, ack]
        output: [route_assignment]
    - id: "ROBOT[1..N]"           # 同じ種類のアクターの集まり
      role: "delivery_agent"
      autonomy: high

  contracts:
    - id: DELIVERY_SLA
      parties: [DISPATCHER, "ROBOT[*]"]
      assume:                     # 前提
        - "ROBOT[i].battery > 20"
      guarantee:                  # 保証
        - "delivery_time <= 300s"
      incentives:
        type: task_completion
        lambda: 0.5               # 強さ（λ）
        rules:
          - "reward(ROBOT[i], 10) when on_time_delivery"

  protocols:
    - id: DeliveryProposal
      trigger: "new_delivery_request(ROBOT[i])"
      precondition: "ROBOT[i].battery > 20"
      steps:
        - "DISPATCHER -> ROBOT[i] : route_assignment"   # メッセージの送信
        - "DISPATCHER : log(route_assignment)"          # 自分での計算
        - "ROBOT[i] -> DISPATCHER : ack"
      postcondition: "ROBOT[i].status == Delivered"
```

## B.3 規範の層（契約の中に書く）

```yaml
      lifecycle:
        states: [Proposed, Assigned, Accepted, Completed, Violated]
        initial: Proposed
        terminal: [Completed, Violated]
        transitions:
          - id: assign
            from: Proposed
            to: Assigned
            on: "DISPATCHER -> ROBOT[i] : route_assignment"   # メッセージのイベント
          - id: accept
            from: Assigned                # 1 つの状態、または [A, B] のように複数
            to: Accepted
            on: "ROBOT[i] -> DISPATCHER : ack(accepted)"
            when: "ROBOT[i].battery > 20" # 任意：遷移を許す条件
            deadline: 5s                  # 任意：from の状態に入ってからの期限
            on_violation:                 # deadline を書いたら書く
              transition: Violated        # 移り先の状態の名前（遷移の id ではない）
              severity: Major             # Minor / Major / Critical（省略時 Major）
            emit: [accepted]              # 任意：追加で出すイベントの名前
          - id: complete
            from: [Accepted]
            to: Completed
            on: "ROBOT[i].status == Delivered"   # 条件のイベント（成り立ったときに起きる）
      monitors:
        - id: battery_guard
          observe: "ROBOT[i].battery"     # 1 つ、または ["A.x", "B.y"] のように複数
          sampling: periodic(500ms)       # event（省略時）または periodic(<時間>)
          rule: "ROBOT[i].battery < 20 AND state IN [Assigned, Accepted]"
          on_match:
            violation: low_battery        # 任意：記録する違反の名前（省略時は id）
            transition: Violated          # 任意：移り先の状態の名前
            severity: Major
```

## B.4 式と値の書き方

条件式（`assume`、`guarantee`、`on:`、`when:`、`rule:` など）は、引用符で囲んだ文字列の中に書きます。

| 書き方 | 意味 | 例 |
| --- | --- | --- |
| `OR`、`AND`、`NOT` | 論理和、論理積、否定（この順に結び付きが強くなる） | `a > 1 AND NOT b` |
| `==`、`!=`、`<`、`<=`、`>`、`>=` | 比較。`a < b < c` のようにつなげることはできない | `ROBOT[i].battery < 20` |
| `IN [ ... ]` | 並べたもののどれかに等しい | `state IN [Assigned, Accepted]` |
| `+`、`-`、`*`、`/` | 算術 | `deadline - now` |
| `X[i].attr` | アクターの属性 | `ROBOT[i].battery` |
| `X[*]`、`X[i]`、`X[1..N]` | 集まり全体、そのうちの 1 つ、範囲 | `"ROBOT[*]"` |
| `for all x in S: P`、`exists x in S: P` | すべての／ある `x` について `P` が成り立つ | `for all t in TAXI[*]: has_capability(t, local_navigation)` |
| `f(x, y)` | 関数の呼び出し | `min_dist(ROBOT[i].position, DISPATCHER.obstacle_positions)` |
| `state`、`now`、`request` | 予約語：現在の状態、現在時刻、インスタンスを作った要求 | `state == Assigned` |

| 値 | 書き方 |
| --- | --- |
| 時間（`deadline:`、`periodic(...)`） | 整数と単位 `ms`、`s`、`min`、`h`。`5s`、`500ms`、`2min`。`0.5s` のような小数は書けない |
| 違反の重さ | `Minor`、`Major`、`Critical` |
| 引用符が要るもの | `on:`、`when:`、`rule:` の値、`[`、`->`、`": "` を含む値（`"ROBOT[*]"` など） |

## B.5 コマンド

| コマンド | すること | 本書の節 |
| --- | --- | --- |
| `cadl check <file>` | 構文、型、SoS-DSL の静的な規則を検査する | 3.9、4.3 |
| `cadl verify <file>` | `cadl check` に加え、前提と保証の矛盾、プロトコルのデッドロックを検査する | 3.9 |
| `cadl sim-ir <file> --format json` | IR を JSON で出力する | 4.3、5.3 |
| `cadl codegen --target unity-csharp -o <dir> <file>` | IR から Unity の C# を生成する（`--target` は `python`、`solidity`、`opa`、`unity-csharp`） | 7.6 |
| `./scripts/sos_dsl_handson_e2e.sh <file> --unity <dir>` | 検査、IR の出力、C# の生成、Unity プロジェクトへの配置をまとめて行う。`--unity ""` で配置を省く | 7.3 |
| `python3 -m cadl.runtime.multi_robot_demo [--summary] [--log <file>] [--ir <file>]` | 参照ランタイムで 5 台のデモを動かす。`--summary` は終わりの状態の表、`--log` は NDJSON のトレース、`--ir` は自分の IR を使う | 7.5、7.9 |
| `streamlit run app.py`（`cadl-explorer` で） | cadl-explorer を起動する | 6.3 |
| `nats-server -p 4222` | NATS を起動する | 8.2 |
| `go run .`（`arbitrator/C-SoS/main` で） | arbitrator を起動する | 8.2 |

## B.6 ソースファイルの場所

| 何か | 場所 |
| --- | --- |
| 言語仕様 | `cadl-spec/docs/spec/`（規範の層は[付録 E](../spec/appendix-e-sos-dsl.md)） |
| パーサ | `cadl_repo/src/cadl/parser.py` |
| IR | `cadl_repo/src/cadl/sim/ir.py`、`cadl_repo/src/cadl/sim/lower.py` |
| Unity C# の生成器 | `cadl_repo/src/cadl/codegen/unity_csharp/` |
| e2e スクリプト | `cadl_repo/scripts/sos_dsl_handson_e2e.sh` |
| 例題 | `cadl_repo/examples/sos_dsl_robot_delivery.cadl` |
| Python 参照ランタイム | `cadl-raspimouse-simulator/cadl/runtime/` |
| 生成された C# と手書きの橋渡し | `cadl-raspimouse-simulator/unity/Assets/Scripts/SoSDsl/`（`Generated/`、`Runtime/`、`Demo/`） |
| ライフサイクルの図を描く部分 | `cadl-explorer/cadl_sim/sos_dsl/` |
