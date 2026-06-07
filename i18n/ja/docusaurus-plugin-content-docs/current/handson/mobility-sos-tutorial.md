---
sidebar_position: 5
sidebar_label: "コース B — 都市モビリティ"
title: "コース B — 都市モビリティ (CADL × SUMO)"
---

# コース B — 都市モビリティ：CADL × SUMO で SoS を設計する

⬅ [コース A — ロボット配送](main-textbook.md) に戻る

- 対象：コース A（CADL/SoS-DSL の基礎）を済ませた方
- 所要時間：60〜90 分
- 完成すると手元に残るもの：タクシー需要を題材に自分で書いた `mobility_sos.cadl`、SUMO で走るシミュレーション、CADL 契約に対する違反検出レポート

---

## 0. このコースで何が起きるか

メイン教材（コース A）はロボット配送 SoS を題材に CADL → SoS-DSL → Unity C# を扱いました。
コース B では題材を都市モビリティ（タクシー）に、コード生成のターゲットを SUMO に差し替えます。
CADL/SoS-DSL の文法はそのままです。

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

`cadl_repo` と `cadl-explorer` の準備はコース A と同じです。
コース B で新しく必要になるのは SUMO だけです。

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

読み方は次の通りです。プラットフォームは中央の指揮役ですが、ドライバーへの裁量は弱め。
タクシーは自分の利益を最大化しようとする高自律のエージェント。
乗客は需要を出して乗降を判断する程度の自律性、というイメージです。

コース A のロボット配送と同じ Acknowledged 型 SoS です。

:::tip 🔍 可視化チェックポイント 0 — 構造だけで型検査が通ることを確認
ここまでで読んだのは CADL の構造（actors と contracts のスケルトン）だけです。
この段階でも `cadl check` は通り、`cadl sim-ir` は IR を出します。
ただし `institution.contracts[0].lifecycle == null` のはずです。

```bash
cd mobility-sos-exercise
cadl check  cadl/mobility_sos.cadl                              # → Type check passed
cadl sim-ir cadl/mobility_sos.cadl --format json \
   | python3 -c "import sys, json; d=json.load(sys.stdin); print('lifecycle =', d['institution']['contracts'][0]['lifecycle'])"
```

この IR を cadl-explorer にアップロードしても "No lifecycle defined" としか表示されません。
構造だけでは「期限」「違反」「帰結」を書けない、というこのギャップを §3 で埋めていきます。
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

この契約は「乗車要求 1 件につきライフサイクル 1 インスタンス」という対応関係になっています。
以下に答えてみてください。

1. プラットフォームが 31 秒経っても割り当てを出さなかった場合、状態は何になりますか？
2. タクシーが accept イベントを返さなかったときに違反したのは、どの主体ですか？
3. `low_battery_guard` が発火する条件を 1 文で説明してください。

---

## 4. 可視化する（10 分）— 🔍 可視化チェックポイント 1（DSL 後）

§3 で `lifecycle:` と `monitors:` を読み終わりました。
これで cadl-explorer に意味のある図が出るようになります。

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

:::info このパターンは何度も出てきます
このコースでは「CADL を編集 → `cadl sim-ir` で IR を再生成 → cadl-explorer をリロード」という 3 ステップを、実装の節目（構造を書いた後、契約を書いた後、コード生成後、シミュレーション後、契約改訂後）でそのつど繰り返します。
コードと図が連動して動く感触をつかむのが、このコースの主目的です。
:::

### 演習 4-1

`cadl/mobility_sos.cadl` の `match` の `deadline: 30s` を `60s` に書き換えて、IR を作り直し、cadl-explorer をリロードしてみてください。
エッジラベルが `Δ 30s` から `Δ 60s` に変わるはずです。
確認できたら 30s に戻してから次の章へ進んでください（以降の手順は 30s 前提）。

---

## 5. SUMO 用コードを生成する（10 分）

`scripts/cadl_to_sumo.py` が、IR JSON から SUMO の設定と契約制約 JSON を書き出します。
コース A の `cadl codegen --target unity-csharp` に相当する、SUMO 向けのコード生成ステップです。

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

:::tip 🔍 可視化チェックポイント 2 — コード生成しても CADL ソースは変わらない
`cadl_to_sumo.py` は IR を読んで SUMO の設定ファイルを書き出すだけで、`cadl/mobility_sos.cadl` の `lifecycle:` / `monitors:` には触れません。
ここで cadl-explorer をリロードしても、§4 と同じ図が出るだけのはずです。

「コード生成は仕様を書き換えない」というこの性質があるおかげで、CADL を仕様の唯一の出典として扱えます。
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

出力で押さえておきたいのは次の 3 点です。

- `guarantees` は SUMO の `tripinfo.duration` / `waitingTime` に直接対応するので評価できる。
- `deadlines`（matching/accept）は SUMO 上に対応するイベントがないので未評価。
- `monitors` は battery や route_deviation など、SUMO の標準出力にない属性を見ているので未評価。

:::tip 🔍 可視化チェックポイント 3 — 仕様と実装の対応を確認
`analyze_results.py` の `[OK]` / `[SKIP]` の各行と cadl-explorer の図は、同じ CADL から派生したものです。
ブラウザで cadl-explorer を開きながら、次の対応関係を眺めてみてください。

| analyze_results.py の出力 | cadl-explorer 上の対応箇所 |
|---|---|
| `[OK] waiting_time <= 300s` | 図には出ない（数値ガランティーは事後判定用） |
| `[OK] ride_time <= 1800s` | 同上 |
| `[SKIP] match ≤ 30.0s` | `Requested → Matched` の `Δ 30s` ラベル |
| `[SKIP] accept ≤ 5.0s` | `Matched → Accepted` の `Δ 5s` ラベル |
| `[SKIP] low_battery_guard` | Monitors テーブルの 1 行目 |

`[SKIP]` は失敗ではなく、「SUMO にはこの観測量が無い」という事実をそのまま表しているだけです。
このギャップを TraCI で埋める課題が §9 にあります。
:::

---

## 8. 感度解析：契約条件を変えて再評価する（10 分）

このコースの肝になる章です。CADL の guarantee を書き換えるだけで、SUMO を再実行しなくても違反件数が変わることを確かめます。

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

:::tip 🔍 可視化チェックポイント 4 — 改訂後（このコースの山場）
`analyze_results.py` を実行する前に、cadl-explorer をリロードしてみてください。

今回書き換えたのは guarantee の値（`ride_time <= 1800s` から `100s`）だけで、`lifecycle:` や `monitors:` には触れていません。
そのため、状態機械の図そのものは §4 と同じです（状態数も遷移数も `Δ` ラベルも変化なし）。
状態機械を変えたいときは `transitions:` を編集する必要があり、その例は演習 4-1 で扱った通りです。

このチェックポイントの狙いは、CADL を編集した直後にブラウザに戻り、判定を駆動しているのが同じ CADL ソースであることを目で確認することにあります。
それが次の三者の対応関係につながります。

```
  CADL ソース (mobility_sos.cadl)
        │
        ├── 図 (cadl-explorer)        ← 仕様を眺める
        ├── 実行 (SUMO)                ← 仕様が動いた結果
        └── 判定 (analyze_results.py) ← 仕様への適合判定
```

この往復が、CADL を起点にした SoS 設計のフィードバックループです。

最後に元に戻すのを忘れずに。

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
| match の deadline を 30s から 10s に厳しくしたとき、何件が現実的に間に合うか調べる | `cadl_to_sumo.py` を拡張して、SUMO から match 時刻も出力させる |
| `num_taxis` を 10 から 5 に減らしたとき、capacity 違反は SUMO のどの統計に現れるか | `summary.xml` の `running` を時系列で見る |
| 新しい monitor `surge_pricing_guard` を追加して、需要過多時の挙動を観察する | YAML に monitor を追記して IR を作り直す |
| A/B の可視化比較：cadl-explorer を 2 つ別ポート（8501 / 8502）で起動し、改訂前と改訂後の Lifecycle 図を並べて見比べる | `streamlit run app.py --server.port 8502` で 2 窓目を起動し、それぞれに別の IR をアップロード |
| `[SKIP]` のひとつを評価可能にする：match deadline を SUMO 上で実測する | TraCI で `vehicle.depart` を取得し、CSV の `pickup_time` との差を計算 |

---

## まとめ

コース A は CADL → Unity C# を扱いましたが、コース B は CADL → SUMO を扱いました。
同じ CADL/SoS-DSL の文法のまま、対象ドメインとランタイムを差し替えられることが体感できたはずです。
契約の deadline / guarantee / monitor を CADL で書き換えるだけで、再シミュレーションなしに評価結果が変わります。
構造と規範を 1 箇所に書き、それを各ランタイムに伝搬させる ── ここが CADL の中核です。

---

## 参考

- コース A（ロボット配送）: [main-textbook.md](main-textbook.md)
- 演習問題集: [exercises.md](exercises.md)
- SoS-DSL 仕様: cadl-spec Appendix E
- SUMO 公式: https://eclipse.dev/sumo/
