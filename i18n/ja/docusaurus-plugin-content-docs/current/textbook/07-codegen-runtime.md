---
sidebar_position: 7
sidebar_label: "第 7 章 — コードを生成し、参照ランタイムで動かす"
title: "第 7 章 — コードを生成し、参照ランタイムで動かす"
---

# 第 7 章 — コードを生成し、参照ランタイムで動かす

この章では、仕様から Unity の C# コードを生成し、同じ IR を Python 参照ランタイムで動かして結果を確かめます（約 15 分）。演習では、期限や環境のパラメータを変え、結果を予想してから観察します。

## 7.1 学ぶこと

**手順で：**

- 1 つの CLI コマンドで CADL が Unity に貼れる C# ツリーに変わる仕組み。
- なぜ **同じ意味論**のランタイムが **2 つ**あるのか（IR を解釈実行する Python 参照ランタイムと、生成される C#）。

**演習で：**

- 自分の仕様に対して Python 参照ランタイムをマルチロボットで実行できる。
- NDJSON トレースを読み、ロボットごとのサマリに集約できる。
- 1 つずつパラメータを変え、観測前に予測を立てる。

## 7.2 背景

### テストベンチとしての参照ランタイム

`cadl-raspimouse-simulator/cadl/runtime/` の Python ランタイムは IR を読み込み、*決定論的で再実行可能な* 離散時間シミュレーションを実行します。5 ロボットの `multi_robot_demo.py` が固定のテストベンチです：

| ロボット | 期待する終端 | なぜ大事か |
| --- | --- | --- |
| robot-0-1 | `Completed` | 正常系が通ることの確認 |
| robot-1-1 | `Violated` via `deadline:accept` | 期限切れの検出のデモ |
| robot-2-1 | `Violated` via `monitor:battery_guard` | 周期的 monitor のデモ |
| robot-3-1 | `Violated` via `monitor:deadline_watch` | 宣言的 monitor のデモ |
| robot-4-1 | `Proposed` のまま | 「インスタンスが進まない」ことも有効なトレース |

これがあらゆる仕様変更を検証する **ground truth（正解）** です。

この表は *同梱の* fixture についてのものです。同梱の fixture は `battery_guard` と `deadline_watch` の両方の monitor を宣言しています。自分の IR でデモを動かすとき（`--ir`、演習 7.2 以降）、自分のファイルで宣言していない monitor は発火しません。第 5 章の v2 は `battery_guard` を持ちますが `deadline_watch` を持たないので、`robot-3-1` は `Violated` にならず、違反なしの `Delivering` で終わります。自分の v2 に `battery_guard` もない場合、`robot-2-1` は `Violated` のままですが、原因は `deadline:accept` になります。

## 7.3 手順

リポジトリにエンドツーエンドのスクリプトが入っています。実行：

```bash
cd ~/program/cadl_repo
./scripts/sos_dsl_handson_e2e.sh \
    examples/sos_dsl_robot_delivery.cadl \
    --unity ../cadl-raspimouse-simulator/unity
```

> シミュレータのリポジトリが無くても、コード生成までは実行できます。`--unity ""` を渡すと、`output/sos_dsl_handson/` に C# ツリーを生成したところでスクリプトが終了します。
>
> 自分の仕様を使いたいなら入力を `my_delivery.cadl` に変えてください。ただし bridge が発火するイベント名と `lifecycle.transitions[*].on:` がマッチする必要があるので、最初は同梱の example を推奨します。

## 7.4 期待される出力

```
$ ./scripts/sos_dsl_handson_e2e.sh examples/sos_dsl_robot_delivery.cadl \
      --unity ../cadl-raspimouse-simulator/unity

== INPUT ==
  source : .../examples/sos_dsl_robot_delivery.cadl
  size   : 166 lines

== Step 1/4 — parse + type-check (cadl check) ==
  OK

== Step 2/4 — emit Sim-IR JSON (cadl sim-ir) ==
  output/sos_dsl_handson/sos_dsl_robot_delivery.ir.json
  contracts : 1
  states    : 7
  monitors  : 3

== Step 3/4 — codegen Unity C# (cadl codegen --target unity-csharp) ==
  output    : output/sos_dsl_handson/unity-csharp
  runtime   : 5 files
  generated : 3 files
  total lines : 783

== Step 4/4 — drop into ../cadl-raspimouse-simulator/unity/Assets/Scripts/SoSDsl/ ==
  installed: .../Runtime, .../Generated
  preserved: .../Demo (if it existed)

== DONE ==
Next steps for the student:
  1. Open the Unity project at .../unity in Unity 6 (6000.2)
  2. Open Assets/Scenes/C-SoS.unity
  3. Add a ContractRuntimeHost GameObject (Demo/ContractRuntimeHost)
  4. Attach PilotContractBridge to each robot that has Pilot_CSoS
  5. Press Play and watch the Console for [lifecycle ...] / [violation ...]

See the textbook for the full walkthrough (Chapter 8 covers these steps):
  https://www.ertl.jp/cadl-spec/docs/textbook/
```

生成されたツリーを確認：

```
output/sos_dsl_handson/unity-csharp/
├── Runtime/                          # 生成のたび同一、契約間で共有
│   ├── Severity.cs                   # enum Minor / Major / Critical
│   ├── ContractEvent.cs              # lifecycle/violation 共通の struct
│   ├── EventBus.cs                   # 軽量 FIFO publish-subscribe
│   ├── PredicateEvaluator.cs         # CADL 述語評価器（Python 版と同等）
│   └── ContractRuntime.cs            # 登録 + tick ループ
└── Generated/                        # CADL の契約ごとに 1 セット
    ├── DeliverySlaState.cs           # public enum DeliverySlaState { Proposed, Assigned, ... }
    ├── DeliverySlaContract.cs        # DELIVERY_SLA 用 IContractInstance 実装
    └── DeliverySlaMonitors.cs        # monitor 1 個に対し Eval_xxx メソッド
```

スクリプトを実行すると、生成されたファイルが Unity プロジェクトに入ります。Unity でプロジェクトを開き（開き方は 8.2 節）、Project ウィンドウを見ると、`Assets/Scripts/SoSDsl/Generated` の下に表示されます。`DeliverySlaContract` を選ぶと、生成された C# が Inspector に表示されます（このファイルは編集しません。再生成のたびに上書きされます）。

![この章の手順を終えた Unity エディタ。Project ウィンドウに Assets/Scripts/SoSDsl/Generated、Inspector に生成された DeliverySlaContract.cs が表示されている](/img/handson/unity-generated-contract.jpg)

## 7.5 なぜ 2 つのランタイム？

同じ IR が両方を駆動しますが、駆動の仕方は異なります。Python 参照ランタイム（シミュレータリポジトリの `cadl/runtime/engine.py`）は、起動時に IR JSON を読み込む手書きの**インタプリタ**です。一方、C# の契約クラスは `cadl codegen` が IR から**生成**します。

```
                             ┌──────────────────────┐
                             │ multi_robot_demo.py  │ ← 今日 Python で実行
                             │ (Python ランタイム)    │
                             │                      │
                  ┌──────────┘                      │
   IR JSON ──────►│                                 │
                  └──────────┐                      │
                             │ DeliverySlaContract  │ ← 後で Unity で実行
                             │ (Unity / C#)          │
                             └──────────────────────┘
```

両方のランタイムが正しいなら、同じ入力に対して **同じトレース** を生成するはずです。Unity 無しでも検証できます：

```bash
cd ~/program/cadl-raspimouse-simulator
python3 -m cadl.runtime.multi_robot_demo --summary
```

```
$ python3 -m cadl.runtime.multi_robot_demo --summary
# multi_robot_demo summary (20 events)
  robot-0-1     state=Completed     violations=[(none)]
  robot-1-1     state=Violated      violations=[deadline:accept]
  robot-2-1     state=Violated      violations=[monitor:battery_guard]
  robot-3-1     state=Violated      violations=[monitor:deadline_watch]
  robot-4-1     state=Proposed      violations=[(none)]
```

5 ロボット、5 種類の異なる結末です。これは、契約が取りうる結末（正常完了・期限違反・モニター違反・未割当のまま）を 1 回の実行で一望できるように組んだ **Python 側のシナリオ** です。

第 8 章の Unity 実行では、割当のタイミングも各ロボットのバッテリ設定も違うので、**この 5 行がそのまま再現されるわけではありません**（Unity では通常、バッテリを下げた 1 台が `battery_guard` で違反し、残りは `Completed` まで進みます）。突き合わせるのは個々の結末の並びではなく、**同じ仕組み — lifecycle の遷移・`deadline`・`monitor` — が同じ意味で働くこと** です。

> #### 🛠 うまくいかないとき：`multi_robot_demo` が見つからない
>
> コマンドは **`cadl-raspimouse-simulator` のルートで**実行してください。Python は `cadl.runtime` をカレントディレクトリから探します。別の場所で実行すると、`runtime` モジュールを持たないコンパイラ側の `cadl` パッケージだけが見つかり、`No module named cadl.runtime` というエラーになります。
>
> ```bash
> cd ~/program/cadl-raspimouse-simulator
> git pull                      # チェックアウトを最新にする
> python3 -m cadl.runtime.multi_robot_demo --summary
> ```
>
> 契約インスタンスを 1 つずつ確認したいときは、`demo_delivery` で 3 つの仕組み（正常系・期限違反・モニタ違反）を1契約ずつ確認できます（出力は 1 契約ぶんなので上の 5 ロボット表とは形が異なります）。
>
> ```bash
> PYTHONPATH=. python3 -m cadl.runtime.demo_delivery --scenario happy     # 受理されて Accepted で止まる
> PYTHONPATH=. python3 -m cadl.runtime.demo_delivery --scenario late      # 5 秒の期限切れ → deadline:accept で Violated
> PYTHONPATH=. python3 -m cadl.runtime.demo_delivery --scenario battery   # バッテリ低下 → monitor:battery_guard で Violated
> ```

## 7.6 生成されたコードと参照ランタイムの中身

同梱の例題 `examples/sos_dsl_robot_delivery.cadl`（166 行）を例に、自分の書いた 1 行がどこへ流れていくかを追います。手順を進めるのには必要ありません。コマンドが何を作ったのかを知りたくなったときに読んでください。

**(1) 仕様 → IR**。`.cadl` の `deadline: 5s` は、`cadl_repo/src/cadl/parser.py` が構文解析し、`sim/lower.py` が IR に落とすと `"deadline_ms": 5000` という JSON になります（IR 全体で 297 行）。IR は「人間向けの書き方」を捨てて「機械が実行しやすい形」だけを残した中間表現です。

**(2) IR → C#**。`codegen/unity_csharp/contract_emitter.py` が IR を読んで、契約 1 つにつき 3 ファイルを生成します：状態の列挙（`DeliverySlaState.cs`）、状態機械本体（`DeliverySlaContract.cs`）、監視ルール（`DeliverySlaMonitors.cs`）。これに共有ランタイム 5 ファイル（下の表）を足した計 783 行が `unity/Assets/Scripts/SoSDsl/` に配置されます。

### 生成される C# — `unity/Assets/Scripts/SoSDsl/`

| ファイル | 中身 | 行数の目安 |
| --- | --- | --- |
| `Runtime/ContractRuntime.cs` | インスタンス登録・イベント配送（1 インスタンス宛て、または全インスタンス）・`Tick` ループ。心臓部 | 約 100 |
| `Runtime/PredicateEvaluator.cs` | `"battery < 20 AND state == Assigned"` のような述語文字列の評価器 | 約 250 |
| `Runtime/ContractEvent.cs` | lifecycle / violation イベントの共通構造体。Console の行はここの `ToString()` | 約 40 |
| `Runtime/EventBus.cs` / `Severity.cs` | 軽量 pub-sub と深刻度 enum | 小 |
| `Generated/DeliverySlaContract.cs` | 遷移表そのもの。「このイベントが来て、この状態なら、この状態へ」の if 文が並ぶ | 約 220 |
| `Generated/DeliverySlaMonitors.cs` | 監視ルール。周期（500ms 等）ごとに述語を評価し、真なら違反を発行 | 約 100 |

### Python 参照ランタイム — `cadl/runtime/`（答え合わせ用）

| ファイル | 中身 |
| --- | --- |
| `engine.py` | C# ランタイムと同じ意味論の Python 実装（約 720 行）。IR を読み、状態機械・期限・監視を動かす |
| `multi_robot_demo.py` | 5 台のロボットが 5 通りの結末（完了・応答期限切れ・バッテリ違反・配送遅延・未割当）になる台本つき実行 |

### コードを読む（任意、約 30 分）

1. `examples/sos_dsl_robot_delivery.cadl` を上から読む（10 分）。コメントが多く、第 4〜5 章の答えでもあります。
2. `Generated/DeliverySlaContract.cs` の `HandleEvent` を読み（10 分）、`.cadl` の遷移がそのまま if 文になっているのを確かめる。
3. `engine.py` の `ContractRuntime.tick` を読む（10 分）。

## 7.7 チェック

```bash
cd ~/program/cadl_repo
pip install pytest          # 初回のみ。第 2 章ではインストールされません
PYTHONPATH=src python3 -m pytest tests/test_unity_csharp_structural.py -q
# 9 passed
```

これら 9 個のテストは、Unity が生成 C# をコンパイルできなくなる構造的バグ（括弧不一致、namespace 欠落、名前衝突等）を検出します。失敗すれば生成器の回帰です。

## 7.8 おさらい

今あるもの：

- 297 行の Sim-IR JSON（同梱の例の場合）。
- 783 行の Unity に貼れる C# ツリー（Unity プロジェクトに配置済み）。
- C# トレースが **どうなるべきか** を示す Python のリファレンス実装。

## 7.9 演習

### 演習 7.1 (★) — ベースラインを取得

**目的**: まずは *同梱の* fixture に対して `multi_robot_demo --summary` を実行し（自分の `my_delivery_v2.cadl` はまだ使いません）、出力をそのまま記録して各行を説明する。

**手順**:

```bash
cd ~/program/cadl-raspimouse-simulator
python3 -m cadl.runtime.multi_robot_demo --summary > session4_baseline.txt
python3 -m cadl.runtime.multi_robot_demo --log session4_baseline.ndjson
```

**確認**: 5 体すべての最終状態が上の表と一致する。

### 演習 7.2 (★★) — 期限を縮める

**目的**: `my_delivery_v2.cadl` の `accept` 期限を `5s` → `1s` → `100ms` → `50ms` と段階的に縮め、結果が変わる境目を見つける。それでも完了するロボットはいるか？

**手順**:

1. `my_delivery_v2.cadl` を編集、`accept` 遷移の `deadline: 5s` を `deadline: 1s` に変更（このシナリオの時間スケールはミリ秒で、ロボットは割当ての約 100 ms 後に応答します）。
2. IR を再生成し、`--ir` オプションを付けてデモを実行（`--ir` を付けないと同梱の fixture が読み込まれる）：

   ```bash
   cd ~/program/cadl_repo
   cadl sim-ir my_delivery_v2.cadl --format json > my_delivery_v2.ir.json
   cd ~/program/cadl-raspimouse-simulator
   python3 -m cadl.runtime.multi_robot_demo --ir ~/program/cadl_repo/my_delivery_v2.ir.json --summary
   ```

3. 同じファイルを `deadline: 5s` のまま実行したときの summary と比べ、続けて `100ms` と `50ms` で手順 1〜2 を繰り返す。本編テキストの v2 では次のようになります。

   | `deadline` | 変化 |
   |---|---|
   | `5s`、`1s` | 変化なし。summary は同一で、この実行では期限は制約になっていない。 |
   | `100ms` | `robot-2-1` は `Violated` のままだが、原因が `monitor:battery_guard` から `deadline:accept` に変わる（モニタより先に期限が発火する）。 |
   | `50ms` | 完了するロボットがなくなる。`robot-0-1`〜`robot-3-1` がすべて `deadline:accept` で `Violated` になる。 |

   `my_delivery_v2.cadl` には `deadline_watch` モニターと `late_failure` 遷移が無いので、`5s`・`1s`・`100ms` の実行では `robot-3-1` は `Violated` ではなく `Delivering` で終わります。自分の v2 で再現できるのは、同梱例の 5 通りの結末のうち 4 通りです。

**振り返り**: 厳しすぎる期限（ここでは `50ms`）は努力に関係なく *すべての* 契約を違反にします。緩すぎる期限（`5s` と `1s` は同じ結果）は不正動作を見逃します。**実 SoS の期限値を決めるプロセスは？**（ヒント：ベースラインデータ + 許容偽陽性率）

### 演習 7.3 (★★) — World パラメータを変える

**目的**: 同じシナリオを per-instance battery / speed / deadline 値を変えて実行。違反パターンがどう変わるかを観察。

**手順**: `multi_robot_demo.py` のコピーを作り、`_seed_battery(...)` と `update_instance_world(...)` の呼び出しを修正、`--summary` で実行。最低 3 構成を試す。

**提出**: 構成名 → ロボットごとの終端状態の小さな表。

### 授業で使う場合

**授業の前に。**

- `my_delivery_v2.cadl` とその IR
- （任意）第 6 章の `violation_trace_view.py`

**まとめと宿題。**

**次の授業（第 9 章）に持参**:

- `session4_baseline.txt` + `session4_baseline.ndjson`
- パラメータスイープ表（最低 3 構成）
- 1 文：もっとも驚いた違反パターンとその理由
