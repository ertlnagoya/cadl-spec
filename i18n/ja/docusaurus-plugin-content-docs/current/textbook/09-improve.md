---
sidebar_position: 9
sidebar_label: "第 9 章 — 仕様を改善する"
title: "第 9 章 — 仕様を改善する"
---

# 第 9 章 — 仕様を改善する

この章では、第 7 章で観測した結果から仕様のどこを直すかを決め、直した仕様をもう一度動かして確かめます。この章は演習だけからなります。

## 9.1 学ぶこと

- シミュレーションの観察結果から、仕様のどの設定を変えるべきかを判断する。
- 適切な層（deadline / monitor / lifecycle / actor / runtime）で仕様を調整する。
- 再実行して、変更の効果を確かめる。

## 9.2 背景

### どの症状をどの層で直すか

修正のしかたは、設計の層ごとに異なります。

| トレースで観察される症状 | 修正する層 | 例 |
| --- | --- | --- |
| すべてのロボットで期限切れ | 仕様 — `deadline` を緩める | 5s → 7s |
| 1 体のロボットで monitor が頻発（偽陽性） | 仕様 — `rule` を厳しく | `< 20` → `< 15` |
| World モデルが間違っていてロボットが Violated になる | ランタイム — world snapshot のキーを修正 | `update_instance_world` 呼び出しを確認 |
| 報酬が支払われない | ランタイム — 報酬実行を実装 | `engine.py` を拡張 |
| すべて成功するが、全体を集計した値がおかしい（例：遅延） | 新しい monitor または新しい契約 | `FLEET_THROUGHPUT_SLA` を追加 |

この表は、規範を書いた SoS 仕様で起こる不具合を、小さく分類したものです。

## 9.3 演習

### 演習 9.1 (★) — 1 つの失敗を診断する

**目的**: 第 7 章のトレースから違反を 1 つ選び、どの層をどう変えるかを 1 段落で説明する。

**提出**: `session5_diagnosis.md`（1 ページ）。

### 演習 9.2 (★★) — 修正を適用する

**目的**: 演習 9.1 の診断を実装し、修正後の仕様を `my_delivery_v3.cadl` として保存する。

**手順**:

1. 演習 9.1 で診断した変更を行う。
2. 演習 7.2 と同じ手順で、新しいファイルの IR を生成し、その IR に対してデモを再実行する。

   ```bash
   cd ~/program/cadl_repo
   cadl sim-ir my_delivery_v3.cadl --format json > my_delivery_v3.ir.json
   cd ~/program/cadl-raspimouse-simulator
   python3 -m cadl.runtime.multi_robot_demo --ir ~/program/cadl_repo/my_delivery_v3.ir.json --summary
   ```

3. 修正したい違反が消え、ほかの結果が変わっていないことを確認する。

**提出**: `my_delivery_v3.cadl` + v2 との diff。

### 演習 9.3 (★★★) — 報酬実行を実装

**目的**: 現在、報酬は仕様（`incentives.rules`）に書かれているだけで、実行されない。しかも、ルールの文字列はランタイムに渡されていない。仕様を IR に変換するとき（`cadl_repo/src/cadl/sim/lower.py`）、契約の `governance` に残るのは `lambda` と `incentive_type` だけで、`rules` のリストは IR に含まれない。Python ランタイムにアクターごとの残高を持たせ、契約が `Completed` に到達したら報酬を加算する。

**手順**:

1. `ContractRuntime` に `balances: dict[str, float]` とアクセサ `runtime.balance(actor_id)` を追加し、ルールを受け取る引数を用意する（例：`ContractRuntime(ir, log_path=None, reward_rules=[...])`）。
2. ルールを取得する。IR には入っていないので、cadl のパーサで `.cadl` ソースから読み、別のスクリプトで JSON に書き出す（自分のファイルに `incentives:` ブロックがなければ、第 4 章のものを追加する）。

   ```python
   # dump_rules.py — cadl-lang をインストールした Python 環境で実行
   import json, sys
   from cadl.parser import parse_file

   sos = parse_file(sys.argv[1])
   rules = [{"contract": c.id, "rule": r.description}
            for c in sos.contracts if c.incentives
            for r in c.incentives.rules]
   json.dump(rules, open(sys.argv[2], "w"), indent=2)
   # python dump_rules.py my_delivery_v2.cadl rules.json
   # -> [{"contract": "DELIVERY_SLA", "rule": "reward(ROBOT[i], 10) when on_time_delivery"}]
   ```

   別スクリプトにするのは、シミュレータのリポジトリに独自のトップレベルパッケージ `cadl/` があり、`cadl-lang` を隠してしまうためです。ランタイムの中、そのテスト、あるいはシミュレータのルートから `python -m` で実行するコードでは、`from cadl.parser import parse_file` が `No module named 'cadl.parser'` で失敗します。スクリプトは別のディレクトリで実行し、`rules.json` をデモに渡します（`multi_robot_demo` に `--rewards rules.json` オプションを追加する）。

   各ルールは元の文字列のままです。`reward(<actor_ref>, <amount>) when on_time_delivery` の形式を自分でパースし（正規表現で足りる）、それ以外は読み飛ばします（同梱の例には `penalty(...)` のルールもある）。

   *発展版*: ソースを読む代わりに、`lower.py`（と `sim/ir.py` の `GovernanceParams`）を拡張して IR にルールを載せる（例：`governance.incentive_rules`）。編集したチェックアウトの `cadl` を使い（`pip install -e .`。PyPI 版にはこのキーがない）、`cadl sim-ir --format json` の出力に現れることを確認したうえで、ランタイムが IR から読むようにする。
3. 誰に支払うかを決める。ランタイムが知っているのはインスタンス ID（`robot-0-1`）だけで、契約インスタンスにアクターのフィールドはない。インスタンスを開くときにアクターを渡し（例：`open_instance(..., actors={"ROBOT": "robot-0"})`）、ルールの `ROBOT[i]` をそれに対応付ける。
4. 終端状態に入ったときに加算する。インスタンスが閉じる箇所は、`StateMachineEngine.fire_transition`（`complete` を含む通常の遷移）と `ContractRuntime._fire_state_jump`（期限とモニタによるジャンプ）の 2 つあるので、両方にフックする。`on_time_delivery` は「インスタンスが `Completed` に入り、`violation` レコードがない」と自分で定義する。ランタイムの述語評価器は単独の識別子を真として扱うため、これを判定できない。
5. `cadl/runtime/tests/test_rewards.py` を追加し、次の 2 つのテストを書く。
   - 配送 `Completed` で 10 ポイント獲得するテスト
   - `Violated` 配送では報酬が払われないテスト
6. `multi_robot_demo --summary` の出力に最終残高を追加する。同梱のシナリオでは `robot-0` が 10、他の 4 台は 0 になる。

**振り返り**: CADL 仕様には既に `reward(ROBOT[i], 10) when on_time_delivery` と書かれていましたが、ここまでランタイムはこれを無視しており、IR にも含まれていませんでした。「仕様にそう書いてある」ことと「ランタイムが実際にそう動く」ことは、どこで分かれるでしょうか。

### 演習 9.4 (★★★) — 最終レポート

**目的**: コース全体を 3 ページのレポートにまとめる。

| ページ | 内容 |
| --- | --- |
| 1 | 初期 CADL モデル（v1）、モデルが問うている質問、v1 で欠けていたもの |
| 2 | シミュレーション結果（ベースラインと修正後の比較）。表と、少なくとも 1 枚の cadl-explorer のスクリーンショット |
| 3 | 振り返り：規範を追加したことで何が得られたか。シミュレーションを動かしたことで、仕様だけでは分からなかった何が分かったか。SoS-DSL は今後どう発展させるとよいか。 |

### 授業で使う場合

**授業の前に。**

- 第 4〜7 章のすべての提出物。

**まとめと宿題。**

**最後の授業（第 9 章）の終わりまでに提出**:

- `my_delivery_v1.cadl` / `v2.cadl` / `v3.cadl`
- `session5_diagnosis.md` + 最終レポート（3 ページ）
- （任意）`test_rewards.py` と修正版 `engine.py`
