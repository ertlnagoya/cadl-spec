---
sidebar_position: 4
sidebar_label: "第 4 章 — 構造を書く"
title: "第 4 章 — 構造を書く"
---

# 第 4 章 — 構造を書く

この章では、ロボット配送 SoS の構造（アクター、契約、プロトコル）を CADL で書き、`cadl check` と `cadl sim-ir` で確かめます（約 15 分）。章の終わりの演習では、アクターを足し、プロトコルに条件を加え、知らないドメインの構造を書きます。

## 4.1 学ぶこと

**手順で：**

- アクターを `id`, `role`, `autonomy`, `interface` で宣言する方法。
- 契約の parties, A/G clauses (`assume` / `guarantee`), incentives の宣言方法。
- プロトコルの宣言方法。1 件の注文で交わすメッセージを、`送信者 -> 受信者 : メッセージ` のステップの列として書く。

**演習で：**

- SoS のアクターを洗い出し、自分で宣言できる（知らないドメインを含む）。
- `cadl check` を実行し、その診断メッセージを説明できる。

## 4.2 背景

`actors:` ブロックには、UML のクラス図と同じように、SoS に参加するアクターの種類を書きます。各アクターは、入出力（`interface.input` / `interface.output`）と自律性の程度（`autonomy: low | medium | high`）を持ちます。`contracts:` ブロックには、`parties:` に挙げたアクターの間の合意を書きます。

```mermaid
flowchart LR
  D[DISPATCHER<br/>autonomy: low<br/>タスクを割り当てる]
  R1["ROBOT[1..N]<br/>autonomy: high<br/>追従 / 集荷 / 配送"]
  C1["CUSTOMER[1..M]<br/>autonomy: medium<br/>注文する"]
  C1 -- delivery_request --> D
  D  -- route_assignment  --> R1
  R1 -- position_report   --> D
  D  -- delivery_notif    --> C1
  SLA[("DELIVERY_SLA<br/>契約")]
  R1 -. governed by .- SLA
  SLA -.- D
```

### 構造を組み立てる部品

CADL ファイルには、いつ、どれくらいの頻度でどのような事象が起こるかよりも先に、誰が参加し、お互いに何を期待しているかを書きます。構造を組み立てる部品は次のとおりです。

```mermaid
flowchart LR
  A[actors:<br/>SoS に参加する者]
  P[protocols:<br/>会話の仕方]
  C[contracts:<br/>合意内容]
  T[transitions:<br/>運用モードの切替条件]
  A --> C
  A --> P
  C --> T
```

この章では `actors:` と `contracts:`、それにプロトコルを 1 つ（`protocols:`）書きます。`transitions:` はこの章では扱いません。

## 4.3 手順

`cadl_repo` の直下に `my_delivery.cadl` を新規作成し（`~/program/cadl_repo/my_delivery.cadl`。手本になる同梱の例は `examples/sos_dsl_robot_delivery.cadl` です）、下の骨組みを貼り付けます。第 4〜6 章のコマンドは `~/program/cadl_repo` で実行します。コメントを読みながら、各ブロックが何をしているかを確かめてください。

```yaml
# my_delivery.cadl ─── 私の最初の SoS 仕様
# (このファイルは構造のみを記述します。規範は第 5 章で追加します)

sos:
  name: "MyDelivery"
  type: Acknowledged           # 中央権威 + 自律エージェント
  version: "0.1.0"

  context:
    environment:
      grid_size:    30                         # 抽象的な環境パラメータ（Unity の経路グラフとは別）
      num_robots:    3
      time_step_ms: 100

  # ── SoS に存在する者たち ──────────────────────────────────────
  actors:
    - id: DISPATCHER
      role: "central_coordinator"
      autonomy: low                            # 方針に従う、自由行動なし
      capabilities: [assign_tasks]
      interface:
        input:  [delivery_request, position_report, task_completion, ack]
        output: [route_assignment, delivery_notification]

    - id: "ROBOT[1..N]"                        # パラメトリック: N コピー
      role: "delivery_agent"
      autonomy: high
      capabilities: [follow_path, pick_up, deliver]
      interface:
        input:  [route_assignment]
        output: [position_report, task_completion, ack]

    - id: "CUSTOMER[1..M]"
      role: "service_requester"
      autonomy: medium
      capabilities: [submit_order]
      interface:
        input:  [delivery_notification]
        output: [delivery_request]

  # ── 当事者間の合意 ───────────────────────────────────────────
  contracts:
    - id: DELIVERY_SLA
      parties: [DISPATCHER, "ROBOT[*]", "CUSTOMER[*]"]
      assume:
        - "ROBOT[i].battery > 20"              # 入力前提条件
      guarantee:
        - "delivery_time <= 300s"              # 出力事後条件
      incentives:
        type: task_completion
        lambda: 0.5
        rules:
          - "reward(ROBOT[i], 10) when on_time_delivery"

  # ── 会話の仕方：1 件の注文で交わすメッセージ ───────────────
  protocols:
    - id: DeliveryOrder
      trigger: "new_delivery_request(CUSTOMER[j])"
      steps:                                   # "送信者 -> 受信者 : メッセージ"
        - "CUSTOMER[j] -> DISPATCHER : delivery_request"
        - "DISPATCHER -> ROBOT[i] : route_assignment"
        - "ROBOT[i] -> DISPATCHER : ack"
        - "ROBOT[i] -> DISPATCHER : task_completion"
        - "DISPATCHER -> CUSTOMER[j] : delivery_notification"
```

`cadl check` で検査します。

```bash
cd ~/program/cadl_repo
cadl check my_delivery.cadl
```

## 4.4 期待される出力

```
$ cadl check my_delivery.cadl
Type check passed: my_delivery.cadl
```

IR JSON に変換します。出力は 150 行ほどあります。下の表示は、ここで見るべき部分だけを抜粋したものです：

```bash
cadl sim-ir my_delivery.cadl --format json
```

```jsonc
{
  "name": "MyDelivery",
  "sos_type": "Acknowledged",
  "description": "",
  "environment": {
    "grid_size":    30,
    "num_robots":    3,
    "time_step_ms": 100
  },
  "institution": {
    "actors": [ ... ],
    "contracts": [
      {
        "id": "DELIVERY_SLA",
        "parties": ["DISPATCHER", "ROBOT[*]", "CUSTOMER[*]"],
        "assume":   ["ROBOT[i].battery > 20"],
        "guarantee":["delivery_time <= 300s"],
        ...
        "lifecycle": null,           ← まだ書いていない
        "monitors":  []
      }
    ]
  },
```

## 4.5 チェック

次の 2 点を確認します。

1. `cadl check my_delivery.cadl` が `Type check passed: my_delivery.cadl` と表示され、`[ERROR]` の行がない。
2. IR JSON で `"lifecycle": null` と `"monitors": []` になっている。この 2 行は契約の終わり近く（出力の 90 行目あたり）にあり、その後に規範拡張の `"norms"` と `"counts_as"` が続く（ここでは空）。この 2 行だけを表示するには：

   ```bash
   cadl sim-ir my_delivery.cadl --format json | grep -n -A1 '"lifecycle"'
   ```

   ```
   90:        "lifecycle": null,
   91-        "monitors": [],
   ```

この `null` と `[]` の部分を、第 5 章で書きます。ここが空なので、構造だけの仕様では「ロボットは 5 秒以内に ack を返す」という規則を書けません。

## 4.6 よくある間違い

| 症状 | 原因 |
| --- | --- |
| `YAML parse error: while parsing a flow sequence` | `[ROBOT[i].battery, ...]` のように subscript 付きをクオートなしで書いた。`["ROBOT[i].battery", ...]` のように quote する。 |
| `Parse error: Invalid SoS type: 'Centralized'. Must be one of: Directed, Acknowledged, Collaborative, Virtual` | `type:` に書けるのはこの 4 つだけ。 |
| `[ERROR]: Undefined actor 'CUSTMER' referenced in contract 'DELIVERY_SLA' parties` | `parties:`（または述語の中。例：`CUSTMER[i].x`）に書いた名前が `actors:` で宣言されていない。多くは打ち間違い。`CUSTOMER[1..M]` と宣言したアクターは、`"CUSTOMER[*]"`（全員）または `CUSTOMER[i]`（1 人）で参照する。 |

## 4.7 おさらい

SoS の構造を記述する CADL ファイルが完成しました。コンパイルでき、IR に変換でき、IR の中に契約 `DELIVERY_SLA` とプロトコル `DeliveryOrder` が 1 つずつあることも確認できました。次は、ランタイムがこの契約への違反を検出できるように、規範を書き加えます。

## 4.8 演習

### 演習 4.1 (★) — 構造モデルのベースラインを作る

**目的**: 4.3 節のアクター、契約、プロトコルを、ゼロから書き起こした新ファイル `my_delivery_v1.cadl` に再現する。

**手順**:

1. `cadl_repo` の直下に `my_delivery_v1.cadl` を作成し（見比べる同梱の例は `examples/sos_dsl_robot_delivery.cadl`）、以下のコマンドはそのディレクトリで実行する。
2. 3 つのアクターを宣言：`DISPATCHER`、`ROBOT[1..N]`、`CUSTOMER[1..M]`。それぞれに妥当な `autonomy` レベルを選ぶ。
3. 1 つの契約 `DELIVERY_SLA` を宣言：`parties: [DISPATCHER, "ROBOT[*]", "CUSTOMER[*]"]`、`assume: ["ROBOT[i].battery > 20"]`、`guarantee: ["delivery_time <= 300s"]`。
4. プロトコル `DeliveryOrder` を 4.3 節の 5 ステップで宣言し、各メッセージを送信者の `interface` の `output` と受信者の `input` に書く。
5. `cadl check my_delivery_v1.cadl` を実行し、`Type check passed: my_delivery_v1.cadl` と表示されることを確認。

**確認**: ファイルが型検査を通り、IR JSON にアクター 3 つ、契約 1 つ、プロトコル 1 つが見える。

### 演習 4.2 (★★) — 4 番目のアクターを追加する

**目的**: 定期的にロボットを点検する `MAINTENANCE` アクターを追加し、`MAINTENANCE` と `ROBOT[*]` の間に別の契約 `MAINTENANCE_SLA` を宣言する。

**手順**:

1. `MAINTENANCE` を追加（単一、低自律度、capabilities `[inspect, repair]`）。
2. 契約 `MAINTENANCE_SLA` を宣言：`parties: [MAINTENANCE, "ROBOT[*]"]`。
3. `assume` に `ROBOT[i].battery > 0` を含めるか、もっと強い条件にするか判断する。
4. `cadl check` を再実行。

**振り返り**: 同じアクターが 2 つの契約の当事者であるとき、それぞれの `assume` はどう働きますか？（ヒント：両方が同時に成り立つ必要があります。Dahmann (2014) [[9]](appendix-d-references.md) が SoS の課題（pain point）の 5 番目に挙げた相互依存の問題に当たります。）

### 演習 4.3 (★★) — プロトコルに条件を加える

**目的**: `my_delivery_v1.cadl` のプロトコル `DeliveryOrder` に、始まる前に成り立つべき条件と、終わったときに成り立つ条件を加え、両方が IR に入ったことを確かめる。

**手順**:

1. `protocols:` の下の `DeliveryOrder` を見つける。プロトコルに参加者の一覧を書くキーはない。誰が参加するかは `steps` に書いた送信者と受信者で決まる。
2. `steps:` の上に `precondition: "ROBOT[i].battery > 20"` を、下に `postcondition: "ROBOT[i].status == Delivered"` を加える（ほかに任意のキーとして `safety_invariant` と `timing` がある）。
3. `cadl check my_delivery_v1.cadl` を実行し、続けて 2 つの条件が IR に入ったことを確認：`cadl sim-ir my_delivery_v1.cadl --format json | grep -n -E '"(precondition|postcondition)"'` が 2 行を表示する。ここでは `cadl check` だけに頼らないこと。`cadl check` は知らないキーを黙って無視するので、キー名を間違えても（`pre:`、`post_condition:` など）検査は通ってしまう。

```yaml
  protocols:
    - id: DeliveryOrder
      trigger: "new_delivery_request(CUSTOMER[j])"
      precondition: "ROBOT[i].battery > 20"
      steps:
        - "CUSTOMER[j] -> DISPATCHER : delivery_request"
        - "DISPATCHER -> ROBOT[i] : route_assignment"
        - "ROBOT[i] -> DISPATCHER : ack"
        - "ROBOT[i] -> DISPATCHER : task_completion"
        - "DISPATCHER -> CUSTOMER[j] : delivery_notification"
      postcondition: "ROBOT[i].status == Delivered"
```

**振り返り**: プロトコルをコードとして書かず、メッセージの列として書くのはなぜでしょうか？ Python の関数として書いた場合と比べて、どんな利点がありますか？（ヒント：各ステップを誰が実装するかを考える。）

### 演習 4.4 (★★★) — 知らないドメインを書いてみる

**目的**: 既存のファイルをコピーせずに、配送ドローンの群（地上ロボットの代わりにドローンが運ぶ）の CADL ファイルの骨組みを最初から書く。全体の構成は同じだが、アクターと capabilities は異なる。

**手順**:

1. `my_drone_delivery.cadl` を白紙から作成。
2. アクターを決める。ヒント：DRONE には ROBOT と違う `capabilities` が要る（高度、飛行禁止区域、天候を考慮する）。
3. `cadl check` を実行。

**振り返り**: 自分のファイルのうち、ロボット配送と同じ部分はどれくらいで、違う部分はどれくらいですか？ SoS-DSL は、同じライフサイクルを少し変えるだけで別のドメインに使えるように設計されています。

### 授業で使う場合

**授業の前に。**

- 第 2 章を完了（リポジトリのクローンと `cadl` のインストール）。
- 事前読書 30 分：本書の第 3 章。

**まとめと宿題。**

**次の授業（第 5 章）に持参**:

- `my_delivery_v1.cadl`（`cadl check` がエラーなく通るもの）
- v1 で表現できないものを 3〜5 行のメモで列挙（ヒント：タイミング、何を違反とみなすか、違反したらどうなるか）。
