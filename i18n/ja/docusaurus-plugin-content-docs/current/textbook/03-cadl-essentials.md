---
sidebar_position: 3
sidebar_label: "第 3 章 — CADL 言語の要点"
title: "第 3 章 — CADL 言語の要点"
---

# 第 3 章 — CADL 言語の要点

この章では、第 4 章以降で書く CADL ファイルの書き方を、本書で使う範囲に絞って説明します。言語のすべてを定義しているのは仕様書ですが、本書を進めるのに仕様書を読む必要はありません。各節の終わりに、詳しく知りたいときに読む仕様書の節を示します。読むのにかかる時間は 15 分ほどです。

## 3.1 学ぶこと
- CADL ファイルが **構造の層**（actors / contracts / protocols）と **規範の層**（lifecycle / monitors）からなること。
- 1 件ごとの契約（契約インスタンス）が、どのような規則で状態を移り、どのような場合に違反になるか。
- `cadl check` と `cadl verify` が何を検査するか。

## 3.2 背景：構造の層と規範の層

SoS の仕様には、2 つの仕事があります。

1. **記述的な仕事**：何が存在するか。主体、主体の間のつながり、やり取りするメッセージ。
2. **規範的な仕事**：何が起こるべきか。義務、期限、違反。

CADL は (1) を言語の本体で書きます。SoS-DSL 拡張は、(1) の上に (2) を加えます。拡張が加えるのは、契約の中に置く `lifecycle:` と `monitors:` の 2 つのキーだけで、書き方は本体と同じです。

## 3.3 ファイルの骨組み

CADL ファイルは YAML で書き、最上位に `sos:` を 1 つ置きます。本書で使うキーは次のとおりです。

```yaml
sos:
  name: "MyDelivery"            # SoS の名前
  type: Acknowledged            # SoS の類型（Directed / Acknowledged / Collaborative / Virtual）
  version: "0.1.0"
  extensions:                   # SoS-DSL 拡張を使うファイルで宣言する（第 5 章から）
    - sos-dsl: 0.1

  context:                      # 環境のパラメータ（シミュレータなどに渡す値）
    environment:
      num_robots: 3

  actors:    [...]              # 誰がいるか
  contracts: [...]              # 誰と誰が何を約束するか（規範の層もここに書く）
  protocols: [...]              # どの順にやり取りするか
```

`type:` は第 1 章 1.4 節の 4 類型のどれかを書きます。説明のためのラベルで、ツールはファイルの他の記述と突き合わせて検査しません。最上位には他に、運用のモード（regime）を切り替える条件を書く `transitions:` などのキーもありますが、本書では使いません。

詳しくは：仕様書の[第 5 章](../spec/05-language-spec.md) 5.1 節、[付録 A](../spec/appendix-a-syntax.md) A.2 節。

## 3.4 アクター（actors）

アクターは SoS を構成する主体です。

```yaml
actors:
  - id: DISPATCHER
    role: "central_coordinator"
    autonomy: low
    capabilities: [assign_tasks]
    interface:
      input:  [position_report, task_completion]
      output: [route_assignment]

  - id: "ROBOT[1..N]"           # 同じ種類のアクターを N 台
    role: "delivery_agent"
    autonomy: high
```

| キー | 書くこと |
| --- | --- |
| `id` | アクターの名前。`ROBOT[1..N]` のように範囲を付けると、同じ種類のアクターの集まりを表す |
| `role` | 役割を表す文字列 |
| `autonomy` | 自律性の程度（`low` / `medium` / `high`。省略すると `medium`）。`type:` と同じく説明のためのラベル |
| `capabilities` | そのアクターができること |
| `interface` | 受け取るもの（`input`）と送り出すもの（`output`） |

他の場所からアクターを指すときは、集まり全体を `ROBOT[*]`、そのうちの 1 台を `ROBOT[i]` と書きます。`ROBOT[i].battery` は、そのロボットの属性 `battery` です。範囲の上限 `N` は「何台でもよい」ことを表す記号で、値を与える構文はありません（`[1..3]` のように数で書くこともできます）。

詳しくは：仕様書の[第 5 章](../spec/05-language-spec.md) 5.2.2 節。

## 3.5 契約（contracts）

契約は、アクターの間の合意です。CADL の契約は、**前提（assume）が満たされている限り、当事者は保証（guarantee）を守る**という形（assume-guarantee 形式）で書きます。前提が崩れた場合、保証を守る義務はありません。

```yaml
contracts:
  - id: DELIVERY_SLA
    parties: [DISPATCHER, "ROBOT[*]", "CUSTOMER[*]"]
    assume:
      - "ROBOT[i].battery > 20"           # 前提：バッテリが 20% を超えていること
    guarantee:
      - "delivery_time <= 300s"           # 保証：300 秒以内に届けること
    incentives:
      type: task_completion
      lambda: 0.5
      rules:
        - "reward(ROBOT[i], 10) when on_time_delivery"
```

| キー | 書くこと |
| --- | --- |
| `id` | 契約の名前 |
| `parties` | 契約の当事者（アクターの `id`） |
| `assume` | 前提。式を文字列で並べる |
| `guarantee` | 保証。式を文字列で並べる |
| `incentives` | 報酬と罰則。`type` は種類、`lambda`（λ）は強さを表す数、`rules` は「誰に何をどういうときに」を書く |

契約には他に、誰が決めるか（`authority:`。決定者 `decision_holder` と、決定がどれだけ中央に集まっているかを表す `beta`（β））、情報をどれだけ共有するか（`information:` の `alpha`（α））といったキーもあります。本書の題材では `incentives:` まで使います。

ここまでの契約は「この種類の合意を結ぶ」という**クラス**の記述です。1 件 1 件の配送がこの合意をどう進むかは、次の規範の層で書きます。

詳しくは：仕様書の[第 5 章](../spec/05-language-spec.md) 5.2.3 節と 5.4.1 節。

## 3.6 プロトコル（protocols）

プロトコルは、アクターの間のやり取りの手順です。

```yaml
protocols:
  - id: DeliveryProposal
    trigger: "new_delivery_request(CUSTOMER[i])"     # 始まるきっかけ
    precondition: "ROBOT[i].battery > 20"            # 始めてよい条件
    steps:
      - "DISPATCHER -> ROBOT[i] : route_assignment"  # DISPATCHER が ROBOT[i] に route_assignment を送る
      - "ROBOT[i] -> DISPATCHER : ack"
      - "ROBOT[i] -> DISPATCHER : completion"
    postcondition: "ROBOT[i].status == Delivered"    # 終わったときに成り立つ条件
```

`steps` の 1 行が 1 つの手順です。`A -> B : m` は「A が B にメッセージ `m` を送る」、`A : f(x)` は「A が自分で計算 `f(x)` をする」を表します。このほか、条件で分ける `if` / `else`、順序を決めない `parallel:`、条件が成り立つまで待つ `barrier:` も書けます。

詳しくは：仕様書の[第 5 章](../spec/05-language-spec.md) 5.2.4 節。

## 3.7 規範の層（1）：契約インスタンスとライフサイクル

規範の層の基本の考え方は**契約インスタンス**です。配送の注文が 1 件来るたびに、`DELIVERY_SLA` の契約インスタンスが 1 つ作られ、そのインスタンスが状態を移っていきます。インスタンスを作るのは、契約を動かす側のアプリケーション（本書ではシミュレータ）です。

インスタンスがたどる状態機械を `lifecycle:` に書きます。

```yaml
    lifecycle:
      states: [Proposed, Assigned, Accepted, Delivering, Completed, Violated, Terminated]
      initial: Proposed                       # 作られたときの状態
      terminal: [Completed, Violated, Terminated]   # 終わりの状態
      transitions:
        - id: accept
          from: Assigned                      # この状態のときに
          to:   Accepted                      # この状態へ移る
          on:   "ROBOT[i] -> DISPATCHER : ack(accepted)"   # このイベントが起きたら
          deadline: 5s                        # Assigned に入ってから 5 秒以内に
          on_violation:                       # 間に合わなかったら
            transition: Violated              # Violated へ強制的に移す
            severity:   Major                 # 違反の重さ
```

遷移（`transitions` の 1 項目）の規則は次のとおりです。

- インスタンスが `from` のどれかの状態にあり、`on:` のイベントが起き、`when:` の条件（書いた場合）が成り立つと、遷移が起きて `to` の状態に移ります。`from` には `[Holding, Overstay]` のように複数の状態を書けます。
- `on:` のイベントには 2 種類あります。`"A -> B : m"` の形は、そのメッセージが送られたときに起きます。`"ROBOT[i].status == Delivered"` のような条件式は、その条件が成り立ったときに起きます。
- `deadline:` は、インスタンスが `from` の状態に**入った時刻から**数えた期限です。期限までに遷移が起きなければ違反になり、インスタンスは `on_violation.transition` に書いた状態へ移ります。`transition:` に書くのは**移り先の状態の名前**で、遷移の `id` ではありません。
- 違反の重さ `severity` は `Minor`、`Major`、`Critical` のどれかで、省略すると `Major` です。`on_violation:` に `transition:` を書かなかった場合、期限切れは違反として記録されますが、状態は移りません。
- 期限は `5s`、`500ms`、`2min`、`1h` のように、整数と単位で書きます。

詳しくは：仕様書の[付録 E](../spec/appendix-e-sos-dsl.md) E.3 節と E.5 節。

## 3.8 規範の層（2）：監視ルール（monitors）

`monitors:` には、契約インスタンスが動いている間に見張る規則を書きます。

```yaml
    monitors:
      - id: battery_guard
        observe: "ROBOT[i].battery"           # 読む値
        sampling: periodic(500ms)             # 500 ms ごとに評価する
        rule: "ROBOT[i].battery < 20 AND state == Assigned"   # 成り立ったら違反
        on_match:
          transition: Violated                # Violated へ強制的に移す
          severity:   Major
```

| キー | 書くこと |
| --- | --- |
| `observe` | 監視ルールが読む値。宣言したアクターの属性（`ROBOT[i].battery`）、メッセージの名前、予約語の `time` と `state` のどれか |
| `sampling` | いつ評価するか。`periodic(500ms)` は一定の間隔で、`event` はインスタンスにイベントが届くたびに評価する。省略すると `event` |
| `rule` | 違反とみなす条件 |
| `on_match` | 条件が成り立ったときの扱い。`violation:` は記録する違反の名前（省略すると監視ルールの `id`）、`transition:` は移り先の状態、`severity:` は違反の重さ（省略すると `Major`） |

監視ルールはライフサイクルとは別に評価されますが、`rule` の中で `state`（インスタンスの現在の状態）を読めます。`state IN [Assigned, Accepted]` のように、`IN` で「どれかの状態にある」も書けます。条件式の中では、`state` のほかに `now`（現在時刻）と `request`（インスタンスを作った要求）が予約語です。

`on:`、`when:`、`rule:` の値と、`[`、`->`、`": "` を含む `observe:` の値は、引用符で囲んで文字列にします。囲まないと YAML の別の構文として読まれます。

詳しくは：仕様書の[付録 E](../spec/appendix-e-sos-dsl.md) E.3 節〜E.5 節。

## 3.9 cadl check と cadl verify が検査すること

`cadl check` は、構文と型に加えて、規範の層について次のような誤りを**エラー**として報告します。エラーが 1 つでもあると、`Type check failed` と表示されます。

| 誤り | 例 |
| --- | --- |
| `initial`、`terminal`、遷移の `from` / `to` に、`states` にない状態を書いた | `initial: Proposed` なのに `states` に `Proposed` がない |
| `on_violation` / `on_match` の `transition:` に、状態ではない名前を書いた | 遷移の `id` の `accept` を書いた |
| 初期状態から、どの終わりの状態にも行けない | |
| `severity:` が `Minor` / `Major` / `Critical` のどれでもない | `severity: Fatal` |
| `deadline:` が期限として読めない | `deadline: soon` |
| `on:` のメッセージに、宣言していないアクターが出てくる | `"ROBOT[i] -> HUB : ack"` で `HUB` が未宣言 |
| `observe:` が、宣言したアクターの属性でもメッセージの名前でもない | `DRONE.battery` で `DRONE` が未宣言 |

たとえば、`on_violation` の `transition:` に遷移の `id` を書くと、`cadl` 0.3.14 は次のように報告します。

```text
  [ERROR]: on_violation.transition 'accept' of the lifecycle transition 'accept' of contract 'DELIVERY_SLA' is not a state listed in states (L-5); it names the target state, not a transition id
Type check failed: 1 error(s), 0 warning(s)
```

`deadline:` を書いたのに `on_violation:` がない遷移は、**警告**になります。警告だけならファイルは有効で、`Type check passed` と表示されます。

`cadl verify` は、`cadl check` に加えて、SMT ソルバ（Z3）で契約の前提と保証を調べます。たとえば、前提に `ROBOT[i].battery > 20` と `ROBOT[i].battery < 10` を並べると、2 つが同時に成り立つことはないので、「この契約はどんな場合にも適用されない」と報告します。

```text
  [FAIL] Contract 'DELIVERY_SLA' assumptions: Assumptions contradict each other; the contract can never apply
```

本書の手順では `cadl verify` は使いませんが、自分で契約を書いたときの確認に使えます。

詳しくは：仕様書の[付録 E](../spec/appendix-e-sos-dsl.md) E.4 節、[第 6 章](../spec/06-design.md) 6.3 節。

## 3.10 例を読む

ここまでの書き方で、ロボット配送の契約を読んでみます。仕様書の付録 E の E.6 節にある例から、遷移 1 つと監視ルール 1 つを抜き出したものです。第 5 章では、これとよく似たものを自分で書きます。

```yaml
contracts:
  - id: DELIVERY_SLA
    parties: [DISPATCHER, "ROBOT[*]", "CUSTOMER[*]"]
    assume:
      - "ROBOT[i].battery > 20"
    guarantee:
      - "delivery_time <= 300s"

    lifecycle:
      states: [Proposed, Assigned, Accepted, Delivering, Completed, Violated, Terminated]
      initial: Proposed
      terminal: [Completed, Violated, Terminated]
      transitions:
        - id: accept
          from: Assigned
          to:   Accepted
          on:   "ROBOT[i] -> DISPATCHER : ack(accepted)"
          deadline: 5s
          on_violation:
            transition: Violated
            severity:   Major

    monitors:
      - id: battery_guard
        observe: "ROBOT[i].battery"
        sampling: periodic(500ms)
        rule: "ROBOT[i].battery < 20 AND state == Assigned"
        on_match:
          transition: Violated
          severity:   Major
```

## 3.11 チェック

例を見ずに、次の 4 問に口頭で答えられますか。

1. 配送契約の**初期状態**は何ですか。→ *Proposed*
2. ロボットが **5 秒**以内に ack を返さなかったら、何が起こりますか。→ *重さ `Major` の違反になり、インスタンスは `Violated` へ強制的に移る*
3. その 5 秒は、いつから数えますか。→ *インスタンスが `Assigned` に入った時刻から*
4. バッテリが 20% を下回ったとき、**まだ Assigned なら**どの監視ルールが働きますか。→ *`battery_guard`*

すべて答えられれば、第 4 章で書き始めるのに十分です。

## 3.12 おさらい

CADL ファイルは、何が存在するかを書く**構造の層**（actors / contracts / protocols）と、何を守るべきかを書く**規範の層**（契約の中の lifecycle / monitors）の二階建てです。契約は assume-guarantee 形式で書いた合意のクラスで、注文 1 件ごとに作られる契約インスタンスが、ライフサイクルの遷移、期限、監視ルールに従って状態を移ります。期限切れや監視ルールの条件が成り立つと違反になり、`transition:` に書いた状態へ強制的に移ります。書いたファイルは `cadl check` が検査し、`cadl verify` が前提と保証の矛盾を調べます。

## 3.13 仕様書との対応

本書で扱わなかった書き方も含めて調べるときは、次の節を読んでください。

| 知りたいこと | 仕様書 |
| --- | --- |
| ファイル全体の構成と、記述の詳しさの段階 | [第 5 章](../spec/05-language-spec.md) 5.1 節 |
| アクター、契約、プロトコルのすべてのキー | [第 5 章](../spec/05-language-spec.md) 5.2 節 |
| 構文の正式な定義（EBNF） | [付録 A](../spec/appendix-a-syntax.md) |
| ライフサイクルと監視ルールの構文、静的な規則、動作 | [付録 E](../spec/appendix-e-sos-dsl.md) E.3〜E.5 節 |
| IR に出力される項目 | [付録 E](../spec/appendix-e-sos-dsl.md) E.7 節 |
| 用語 | [用語集](../spec/glossary.md)、本書の[付録 A](appendix-a-glossary.md) |
