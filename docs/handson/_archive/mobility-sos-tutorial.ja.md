---
sidebar_position: 11
sidebar_label: "Mobility SoS Tutorial (JA)"
title: "都市モビリティ SoS ハンズオン (日本語)"
---

# ハンズオン: CADL × SUMO で都市モビリティ SoS を設計する

> 🌐 **English version** → [`mobility-sos-tutorial.en.md`](mobility-sos-tutorial.en.md)
>
> ⬅ メイン教材に戻る → [`sos-dsl-handson-textbook.ja.md`](sos-dsl-handson-textbook.ja.md)

> **対象**: CADL/SoS-DSL の基本（[メイン教材](sos-dsl-handson-textbook.ja.md)）を済ませた方。
>
> **所要時間**: 60〜90 分。
>
> **持ち帰るもの**: タクシー需要を題材に自分で書いた `mobility_sos.cadl`、
> SUMO 上で実際に走るシミュレーション、CADL 契約に対する違反検出レポート。

---

## 0. このハンズオンで体験すること

メイン教材ではロボット荷物配送 SoS を題材に **CADL → SoS-DSL → Unity C#** を扱いました。
本ハンズオンでは、題材を**都市モビリティ（タクシー）**に、コード生成のターゲットを **SUMO** にそれぞれ差し替えます。

```
mobility_sos.cadl
       │
       ├─ cadl check                     ← 型検査
       ├─ cadl sim-ir   ─► IR JSON
       │                       │
       │                       ├─► cadl-explorer (Lifecycle View)
       │                       │
       │                       └─► cadl_to_sumo.py    ← ★ コード生成
       │                              ├─► SUMO sumocfg
       │                              └─► 契約制約 JSON
       │
       └─ (需要データ CSV) ─► generate_sumo_routes.py
                                    ↓
                              SUMO 実行 ─► tripinfo.xml
                                    ↓
                            analyze_results.py（契約遵守判定）
                                    ↓
                       CADL に戻り、契約条件・インセンティブを改訂
```

参考プロトタイプは
[`ertlnagoya/mobility-sos-exercise`](https://github.com/ertlnagoya/mobility-sos-exercise)
（あるいは演習用としてローカルに同梱した `mobility-sos-exercise/`）にあります。

---

## 1. セットアップ

`cadl_repo` と `cadl-explorer` のセットアップはメイン教材と同じです。
本ハンズオンで新たに必要になるのは **SUMO** だけです。

```bash
# 演習用 venv
cd mobility-sos-exercise
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# SUMO（任意の OS で pip 経由が手軽）
pip install eclipse-sumo

# CADL コンパイラ（メイン教材と同じ）
cd ~/program/cadl_repo
source .venv/bin/activate     # 既に作成済みなら
cadl --version

# CADL-Explorer（メイン教材と同じ）
cd ~/program/cadl-explorer
source .venv/bin/activate
streamlit --version
```

> z3-solver のビルドに失敗する場合は、CADL 本体のインストールで
> `pip install --no-deps -e .` + `pip install lark pyyaml` の順に実行してください。
> 本ハンズオンで使うのは `cadl check` と `cadl sim-ir` だけなので Z3 は不要です。

---

## 2. SoS の構造を読む（5 分）

`cadl/mobility_sos.cadl` の先頭、`sos:` ブロック内の `actors:` を見てみましょう：

```yaml
sos:
  name: "MobilitySoS"
  type: Acknowledged
  actors:
    - id: PLATFORM                       # 中央マッチングプラットフォーム
      autonomy: low
    - id: "TAXI[1..N]"                   # 自律的に動く N 台のタクシー
      autonomy: high
    - id: "PASSENGER[1..M]"              # 乗車要求を出す M 人の乗客
      autonomy: medium
```

**読み方**：プラットフォームは中央権威ではあるものの裁量は弱く、
タクシーは自分の利益を最大化しようとする高自律のエージェント、
乗客は需要を出して乗降の意思を持つ中程度の自律性、と捉えます。

メイン教材のロボット配送と同じ **Acknowledged** 型 SoS です。

:::tip 🔍 可視化チェックポイント 0 — 構造層だけで型検査
ここまでで読んだのは CADL の **構造（actors と contracts のスケルトン）だけ**です。
この時点でも `cadl check` は通り、`cadl sim-ir` は IR を出力しますが、
**`institution.contracts[0].lifecycle == null`** であることを確認できます。

```bash
cd mobility-sos-exercise
cadl check  cadl/mobility_sos.cadl                              # → Type check passed
cadl sim-ir cadl/mobility_sos.cadl --format json \
   | python3 -c "import sys, json; d=json.load(sys.stdin); print('lifecycle =', d['institution']['contracts'][0]['lifecycle'])"
```

この IR を cadl-explorer にアップロードしても **「No lifecycle defined」** と表示されるだけです。
このギャップ ── 構造だけでは「期限」「違反」「帰結」を表現できないこと ── を §3 で埋めていきます。
:::

---

## 3. 契約 (lifecycle + monitors) を読む（10 分）

```yaml
contracts:
  - id: RIDE_SLA
    parties: [PLATFORM, "TAXI[*]", "PASSENGER[*]"]
    guarantee:
      - "waiting_time <= 300s"
      - "ride_time <= 1800s"
    lifecycle:
      states: [Requested, Matched, Accepted, PickedUp, Delivered,
               Violated, Cancelled, Terminated]
      initial: Requested
      terminal: [Delivered, Violated, Cancelled, Terminated]
      transitions:
        - id: match
          from: Requested
          to:   Matched
          deadline: 30s
          on_violation: { transition: Violated, severity: Major }
        - id: accept
          from: Matched
          to:   Accepted
          deadline: 5s
          on_violation: { transition: Violated, severity: Major }
        # ...
    monitors:
      - id: low_battery_guard
        observe: "TAXI[i].battery"
        sampling: periodic(500ms)
        rule: "TAXI[i].battery < 15 AND state == Accepted"
        on_match: { transition: Violated, severity: Critical }
```

### 演習 3-1

この契約は「乗車要求 1 件につきライフサイクル 1 インスタンス」が成り立ちます。
以下を答えてください：

1. プラットフォームが 31 秒経っても割り当てを出さなかったら、状態は何になりますか？
2. タクシーが「accept」イベントを返さない場合、誰の責任ですか？
3. `low_battery_guard` が発火する条件を 1 文で説明してください。

---

## 4. 可視化する（10 分） — 🔍 可視化チェックポイント 1（DSL 後）

§3 で `lifecycle:` と `monitors:` を読みました。
これで cadl-explorer に**意味のある図**が描かれるようになります。

```bash
cd mobility-sos-exercise
cadl check  cadl/mobility_sos.cadl
cadl sim-ir cadl/mobility_sos.cadl --format json > cadl/mobility_sos.ir.json

cd ~/program/cadl-explorer
streamlit run app.py
# → http://localhost:8501 が開く
# → サイドバー "SoS_DSL_Lifecycle" を選び、
#    File uploader に上で生成した mobility_sos.ir.json をドラッグ
```

以下のような図がブラウザに描画されます：

![Mobility SoS Lifecycle](/img/mobility_sos_lifecycle.png)

| 図の要素 | 意味 |
|---|---|
| 二重円 = `Requested` | initial state |
| 灰色破線枠 = `Delivered`/`Cancelled`/`Terminated` | 通常終端 |
| 赤系破線枠 = `Violated` | 違反終端 |
| 実線エッジ + `Δ 30s` / `Δ 5s` | deadline 付き遷移 |
| 赤の破線エッジ + `violation Major` | `on_violation` の lift |

:::info このパターンは何度も繰り返します
本ハンズオンでは **「CADL を編集 → `cadl sim-ir` で IR を再生成 → cadl-explorer をリロード」** の 3 ステップを、
**実装の節目（構造を書いた後・契約を書いた後・コード生成後・シミュレーション後・契約改訂後）**で繰り返します。
コードを編集すると**図が即座に追従する**感覚を体で覚えることが、本ハンズオンの主目的です。
:::

### 演習 4-1

`cadl/mobility_sos.cadl` の `match` の `deadline: 30s` を `60s` に変更し、
IR を再生成してリロードしてください。エッジラベルの数値が `Δ 30s → Δ 60s` に変わるはずです。
**確認できたら 30s に戻してから次の章へ進んでください**（以降の手順は 30s 前提）。

---

## 5. SUMO 用コードを生成する（10 分）

`scripts/cadl_to_sumo.py` が、IR JSON から SUMO 設定と契約制約 JSON を
書き出します。これがメイン教材の `cadl codegen --target unity-csharp` に
対応する、SUMO 向けのコード生成ステップです。

```bash
python scripts/cadl_to_sumo.py
```

期待される出力：

```text
[1/4] CADL.environment 検証
  [OK] grid_size=5 は SUMO ネットワークと一致。
[2/4] contracts → constraints 抽出
  - contract RIDE_SLA
      guarantees: 2
        waiting_time   <= 300.0s
        ride_time      <= 1800.0s
      deadlines : 2
        match      30.0s (violation→Violated, sev=Major)
        accept     5.0s (violation→Violated, sev=Major)
      monitors  : 3
[3/4] sumocfg 生成 (CADL.time_step_ms / 終端を反映)
  ✓ step-length = 1.0s
  ✓ end         = 4920s
```

生成されるもの：

- `sumo/config/midtown.cadl.sumocfg` — `step-length` が CADL の `time_step_ms` から、
  `end` が CSV 最終 depart + ride_time guarantee から決まる
- `sumo/cadl_constraints.json` — `analyze_results.py` が読む契約条件 (deadlines / monitors / guarantees)

:::tip 🔍 可視化チェックポイント 2 — コード生成後（CADL のソースは不変）
`cadl_to_sumo.py` がやっているのは **IR を読んで SUMO の設定ファイルを書き出すこと**だけで、
`cadl/mobility_sos.cadl` の `lifecycle:` / `monitors:` は **1 文字も書き換わりません**。
ここで cadl-explorer をリロードすると、**§4 と全く同じ図**が表示されるはずです。

これが「コード生成は仕様を改変しない」という性質の確認であり、
CADL を **唯一の正本 (single source of truth)** として扱える根拠です。
:::

---

## 6. SUMO シミュレーションを実行する（10 分）

```bash
# サンプル需要 CSV の確認
python scripts/prepare_sample_data.py

# SUMO ネットワーク生成（一度だけ）
netconvert -c sumo/network/midtown.netccfg

# CSV → ルートファイル
python scripts/generate_sumo_routes.py

# SUMO 実行（CADL 派生 sumocfg を自動選択）
python scripts/run_sumo.py            # ヘッドレス
# python scripts/run_sumo.py --gui    # 可視化
```

完了すると `results/tripinfo.xml` と `results/summary.xml` が生成されます。

---

## 7. 契約遵守を判定する（10 分）

```bash
python scripts/analyze_results.py
```

期待される表示の抜粋：

```text
=== CADL 契約 (cadl_constraints.json) との遵守チェック ===

  contract: RIDE_SLA
    -- guarantees --
      [OK          ] waiting_time <= 300s  (tripinfo.waitingTime)
      [OK          ] ride_time <= 1800s  (tripinfo.duration)
    -- deadlines (lifecycle) --
      [SKIP        ] match      ≤ 30.0s  (matching event not modeled in SUMO yet)
      [SKIP        ] accept     ≤ 5.0s   (matching event not modeled in SUMO yet)
    -- monitors --
      [SKIP        ] low_battery_guard   (battery not exported by SUMO)
```

**ここで気づいてほしいこと**：

- `guarantees` は SUMO の `tripinfo.duration` / `waitingTime` と直接対応するため評価可能。
- `deadlines` (matching/accept) は SUMO 上にイベントが存在しないため未評価。
- `monitors` は battery / route_deviation など SUMO の標準出力に無い属性を見ているため未評価。

:::tip 🔍 可視化チェックポイント 3 — シミュレーション後（仕様と実装の対応確認）
`analyze_results.py` の `[OK]` / `[SKIP]` 行と、cadl-explorer の図は**同じ CADL 仕様から派生している**ことを意識します。
ブラウザで cadl-explorer を開いたまま、次の対応を見比べてみてください：

| analyze_results.py の出力 | cadl-explorer 図中の対応箇所 |
|---|---|
| `[OK] waiting_time <= 300s` | 図には現れない（guarantees は事後判定用の数値制約）|
| `[OK] ride_time <= 1800s` | 同上 |
| `[SKIP] match ≤ 30.0s` | `Requested → Matched` エッジの `Δ 30s` ラベル |
| `[SKIP] accept ≤ 5.0s` | `Matched → Accepted` エッジの `Δ 5s` ラベル |
| `[SKIP] low_battery_guard` | Monitors テーブルの 1 行目 |

**「SKIP」は失敗ではなく、SUMO 側にこの観測量が無いという事実報告にすぎません**。
このギャップを TraCI 連携で埋める課題は §9 に置いてあります。
:::

---

## 8. 感度解析: 契約条件を変えて再評価する（10 分）

ここが本ハンズオンのハイライトです。CADL の guarantee を**書き換えるだけで**、
SUMO 再実行をせずに違反件数が変わることを確認してみましょう。

```bash
# ride_time を 1800s → 100s に書き換え (試験用)
sed -i.bak 's|ride_time <= 1800s|ride_time <= 100s|' cadl/mobility_sos.cadl

# IR を再生成 (シミュ再実行は不要)
cadl sim-ir cadl/mobility_sos.cadl --format json > cadl/mobility_sos.ir.json
python scripts/cadl_to_sumo.py

# 既存の SUMO 結果に対して再評価
python scripts/analyze_results.py | grep -E "OK|VIOLATED"
```

期待される結果：

```text
[OK          ] waiting_time <= 300s  (tripinfo.waitingTime)
[VIOLATED (13)] ride_time <= 100s  (tripinfo.duration  e.g. ['taxi_8', 'taxi_9', ...])
```

:::tip 🔍 可視化チェックポイント 4 — 改訂後（★ハイライト）
`analyze_results.py` を実行する**前に**、cadl-explorer をリロードしてみてください。

ここで変更したのは guarantee の値（`ride_time <= 1800s` → `100s`）だけで、
`lifecycle:` / `monitors:` には触れていないため、**状態機械の図そのものは §4 と同じ**になります
（状態数も遷移数も deadline ラベルも変化なし）。
状態機械を変えるなら `transitions:` を編集する必要があり、その違いは演習 4-1 で実感した通りです。

それでもこのチェックポイントが大事な理由は、CADL を編集した直後に必ずブラウザに戻り、
**「同じ CADL 仕様が `analyze_results.py` の判定を駆動している」**ことを確認するためです。
この対応関係が、本ハンズオンのゴールである次の三者の結びつきにそのままつながります：

```
  CADL ソース (mobility_sos.cadl)
        │
        ├── 図 (cadl-explorer)         ← 仕様の視覚的理解
        ├── 実行 (SUMO)                 ← 仕様の動的振る舞い
        └── 判定 (analyze_results.py)   ← 仕様への適合性
```

この一連の操作が、**CADL 駆動の SoS 設計フィードバックループ**です。

最後に元に戻すのを忘れずに：

```bash
mv cadl/mobility_sos.cadl.bak cadl/mobility_sos.cadl
cadl sim-ir cadl/mobility_sos.cadl --format json > cadl/mobility_sos.ir.json
python scripts/cadl_to_sumo.py
```
:::

---

## 9. 改造課題（任意）

| 課題 | ヒント |
|---|---|
| プラットフォームの match deadline を 30s→10s に厳しくしたら、現実的に何件達成できる？ | `cadl_to_sumo.py` を拡張して、SUMOからmatch時刻も出力 |
| `num_taxis` を 10→5 に減らしたら、capacity 違反は SUMO のどの統計に現れる？ | `summary.xml` の `running` を見る |
| 新しい monitor `surge_pricing_guard` を追加して、需要過多時にどう動くか観察 | YAML に monitor を追記 → IR 再生成 |
| **A/B 可視化比較**：2 つの cadl-explorer インスタンスを別ポート (8501 / 8502) で起動し、改訂前と改訂後の Lifecycle 図を**並べて比較**する | `streamlit run app.py --server.port 8502` で2窓目を起動。各窓に異なる IR をアップロード |
| §9 で残した `[SKIP]` を埋める：`match` deadline を SUMO で実評価する | TraCI で `vehicle.depart` 時刻を取得し、`pickup_time` との差を計算 |

---

## まとめ

- メイン教材の **CADL → Unity C#** に対し、本ハンズオンでは **CADL → SUMO** を扱いました。
- 同じ CADL/SoS-DSL の構文・意味論のまま、対象ドメインとランタイムを差し替えられます。
- 契約の deadline / guarantee / monitor を CADL で書き換えるだけで、再シミュレーションなしに評価結果が変わります。
- これが SoS 設計で最も大事な性質、すなわち **構造と規範を一箇所にまとめて書き、それを各ランタイムへ自動的に伝搬させる**という点です。

---

## 参考

- メイン教材（ロボット配送）: [`sos-dsl-handson-textbook.ja.md`](sos-dsl-handson-textbook.ja.md)
- 演習問題集: [`sos-dsl-exercises.ja.md`](sos-dsl-exercises.ja.md)
- SoS-DSL 仕様: cadl-spec Appendix E
- SUMO 公式: https://eclipse.dev/sumo/
