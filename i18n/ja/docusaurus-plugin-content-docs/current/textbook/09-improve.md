---
sidebar_position: 9
sidebar_label: "第 9 章 — 仕様を改善する"
title: "第 9 章 — 仕様を改善する"
---

# 第 9 章 — 仕様を改善する

## 第 5 回 — 改善

### 学習目標

- シミュレーション観察を使って *どのつまみを回すか* を同定する。
- 適切な層（deadline / monitor / lifecycle / actor / runtime）で仕様を調整する。
- 再実行で変更を検証する。

### 前提

- 第 1〜4 回のすべての提出物。

### 概念導入（約 30 分）

設計の各層に固有の修正方法があります：

| トレースで観察される症状 | 修正する層 | 例 |
| --- | --- | --- |
| すべてのロボットで期限切れ | 仕様 — `deadline` を緩める | 5s → 7s |
| 1 体のロボットで monitor が頻発（偽陽性） | 仕様 — `rule` を厳しく | `< 20` → `< 15` |
| World モデルが間違っていてロボットが Violated になる | ランタイム — world snapshot のキーを修正 | `update_instance_world` 呼び出しを確認 |
| 報酬が支払われない | ランタイム — 報酬実行を実装 | `engine.py` を拡張 |
| すべて成功するが *集約* がおかしい（例：遅延） | 新 monitor または新契約 | `FLEET_THROUGHPUT_SLA` を追加 |

これは規範的 SoS 仕様における *不具合の小さな分類* です。

### 演習（授業 50 分 + 宿題）

#### 演習 5.1 (★) — 1 つの失敗を診断する

**目的**: 第 4 回のトレースから *1 つ* の違反を選ぶ。1 段落で説明：どの層を、どう変えるか。

**提出**: `session5_diagnosis.md`（1 ページ）。

#### 演習 5.2 (★★) — 修正を適用する

**目的**: 5.1 の診断を実装する。修正後の仕様を `my_delivery_v3.cadl` として保存。

**手順**:

1. 5.1 で診断した変更を実施。
2. 演習 4.2 と同じ手順で、新しいファイルの IR を生成し、その IR に対してデモを再実行：

   ```bash
   cd ~/program/cadl_repo
   cadl sim-ir my_delivery_v3.cadl --format json > my_delivery_v3.ir.json
   cd ~/program/cadl-raspimouse-simulator
   python3 -m cadl.runtime.multi_robot_demo --ir ~/program/cadl_repo/my_delivery_v3.ir.json --summary
   ```

3. 修正したい違反が消え、*かつ* 他を壊していないことを確認。

**提出**: `my_delivery_v3.cadl` + v2 との diff。

#### 演習 5.3 (★★★) — 報酬実行を実装

**目的**: 現在、報酬は仕様（`incentives.rules`）に *書かれている* だけで *実行* されない。しかも、ルールの文字列はランタイムまで届いていない。仕様を IR に変換するとき（`cadl_repo/src/cadl/sim/lower.py`）、契約の `governance` に残るのは `lambda` と `incentive_type` だけで、`rules` のリストは落とされる。Python ランタイムにアクターごとの残高を持たせ、契約が `Completed` に到達したら報酬を加算する。

**手順**:

1. `ContractRuntime` に `balances: dict[str, float]` とアクセサ `runtime.balance(actor_id)` を追加し、ルールを受け取る口を用意する（例：`ContractRuntime(ir, log_path=None, reward_rules=[...])`）。
2. ルールを取得する。IR には入っていないので、cadl のパーサで `.cadl` ソースから読み、**別のスクリプトで JSON に書き出す**（自分のファイルに `incentives:` ブロックがなければ、メイン教材 Step 2 のものを追加する）：

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
4. 終端状態に入ったときに加算する。インスタンスが閉じる箇所は 2 つある — `StateMachineEngine.fire_transition`（`complete` を含む通常の遷移）と `ContractRuntime._fire_state_jump`（期限とモニタによるジャンプ）— ので、両方にフックする。`on_time_delivery` は「インスタンスが `Completed` に入り、`violation` レコードがない」と自分で定義する。ランタイムの述語評価器は単独の識別子を真として扱うため、これを判定できない。
5. `cadl/runtime/tests/test_rewards.py` を追加：
   - 配送 `Completed` で 10 ポイント獲得するテスト
   - `Violated` 配送では報酬が払われないテスト
6. `multi_robot_demo --summary` の出力に最終残高を追加。同梱のシナリオでは `robot-0` が 10、他の 4 台は 0 になる。

**振り返り**: CADL 仕様には既に `reward(ROBOT[i], 10) when on_time_delivery` と書かれていましたが、ここまでランタイムは無視してきました。IR にすら載っていませんでした。**「仕様にそう書いてある」と「ランタイムが実際にそう動く」の境界線はどこですか？**

#### 演習 5.4 (★★★) — 最終レポート

**目的**: コース全体をカバーする 3 ページのレポート。

| ページ | 内容 |
| --- | --- |
| 1 | 初期 CADL モデル（v1）、モデルが問うている質問、v1 で欠けていたもの |
| 2 | シミュレーション結果 — ベースラインと修正後の比較。表と最低 1 枚の cadl-explorer スクリーンショット |
| 3 | 振り返り：*規範を追加すること* で何が得られたか？ *シミュレーションを動かすこと* で仕様だけでは分からなかった何を学んだか？ SoS-DSL の次の一手は？ |

### まとめ

**第 5 回終了時に提出**:

- `my_delivery_v1.cadl` / `v2.cadl` / `v3.cadl`
- `session5_diagnosis.md` + 最終レポート（3 ページ）
- （任意）`test_rewards.py` と修正版 `engine.py`
