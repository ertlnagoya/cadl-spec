---
sidebar_position: 0
title: "クイックスタート"
---


始め方は2通りあります。目的に合うほうを選んでください。どちらも5分ほどで終わります。

| 経路 | 行うこと | 必要なもの |
|---|---|---|
| [**A. ブラウザで試す**](#path-a) | **CADL Explorer** で2つのガバナンス設計を比較し，結果がどう変わるかを見ます。CADL は書きません。 | ウェブブラウザ |
| [**B. CLI で書いて検査する**](#path-b) | `cadl` コマンドをインストールし，例題を検査・検証したうえで，わざと壊して検証器が矛盾を見つける様子を確認します。 | Python 3.9 以上，git |

経路 A ではガバナンス設計が何を変えるかが，経路 B では言語とツールが分かります。互いに独立なので，どちらから始めても構いません。

## 経路 A — ブラウザで試す（CADL Explorer） {/* #path-a */}

**[CADL Explorer](https://cadl-explorer.streamlit.app/)** を使えばインストールは不要です。以下の手順は CADL Explorer v0.5.1 の画面にもとづいています（公開アプリでは，サイドバーのページ一覧の下に版が表示されます）。

### A-1. CADL Explorer を開く

[cadl-explorer.streamlit.app](https://cadl-explorer.streamlit.app/) にアクセスします。
公開アプリでサインインを求められる場合や利用できない場合は，
[cadl-explorer リポジトリ](https://github.com/ertlnagoya/cadl-explorer)から
ローカルで実行できます。

```bash
git clone https://github.com/ertlnagoya/cadl-explorer.git
cd cadl-explorer
pip install -r requirements.txt
streamlit run app.py
```

アプリには4つのページがあり，サイドバーの一番上に並んでいます。

| ページ | 用途 |
|---|---|
| **Explorer** | 2つのガバナンス設計 A と B を比べる（このクイックスタート）。 |
| **Designer** | CADL のモデル全体を編集，検査，可視化する。 |
| **Contract Lifecycle** | IR の JSON から契約のライフサイクル（状態機械）とモニタを描く。 |
| **About & Glossary** | ツールの説明，パラメータの値，用語。 |

最初に開くのは **Explorer** のページです。このページは，2つの設計
**A**（ベースライン）と **B**（検討する設計）を比べ，両方について
**CADL → IR → Config → Result** の連鎖を表示します。実行ボタンはなく，
設定を変えるたびに結果が再計算されます。

### A-2. ガバナンステンプレートを選ぶ

サイドバーの **B — design under study** で，以下のいずれかを選びます。

| テンプレート | 意味 |
|---|---|
| **D-SoS** | Directed SoS — 強い中央権限（α=0.3, β=0.7, λ=0.0）。 |
| **C-SoS** | Collaborative SoS — 自律性重視（α=0.7, β=0.3, λ=0.3）。 |
| **D-SoS + motivation-sensitive** | 中央権限がエージェントのモチベーションに応じて予算を調整（α，β，λはD-SoSと同じ）。 |

ここでαはエージェントの自律度，βは集中度，λは探索確率です。
これらのシミュレータ用パラメータは，言語仕様で契約ごとに定めるα / β / λとは
別のものです（[用語集](../spec/glossary.md)を参照）。D-SoSの2つの
テンプレートは，Explorerが表示するYAMLでは`sos_type`を`Directed`としています。

:::note
v0.4.1 までは，D-SoS のテンプレートに A-SoS という名前が付いていました。
A-SoS は Acknowledged SoS の略称なので，v0.5.0 で名前が改められました。
以前の版で共有したリンクは，同じ設計を開きます。
:::

B と比べる相手を変えるには，**A — baseline** を開いて同じように選びます。
ベースラインの初期値は D-SoS，`uniform`，ρ=0 です。

### A-3. モチベーションプロファイルと ρ を設定

- **Motivation profile** — エージェント間のモチベーション分布
  （`uniform`, `linear`, `polarized`）。
- **ρ（モチベーション感度）** — ガバナンスがモチベーションにどれだけ応答するか。
  ρ=0 はモチベーションを無視，ρ=1 は完全に結合。モチベーションのモデルを
  持たないテンプレート（D-SoS と C-SoS）では，スライダーは無効になります。

用意された比較から始めたい場合は，ページ上部の **Getting started**
（またはサイドバーの **Examples**）を開き，ボタンで読み込みます。

### A-4. 結果を読む

ページは，番号の付いた4つの節に分かれています。

1. **Outcome** — A と B のスループット，自律性，公平性（10個の乱数シードの
   平均）と，その差。
2. **Why — the causal chain** — 同じ変更を各段階（CADL，IR，Config，Result）で
   見たもの。解釈された変更が先に示され，生の差分は各段階の下で開けます。
3. **Explore** — 3つのタブ（**Effect of ρ**，**Per-robot view**，**Scenario**）。
4. **Reproduce & export** — 各段階の内容のハッシュ，A と B の CADL ソース，
   B の CADL（YAML），IR（JSON），シミュレータ設定（JSON）と，A と B の比較（JSON）の
   ダウンロード。

サイドバーの **Save this comparison** を押すと，現在の A と B の指標が
ページ下部の **Saved comparisons** の表に加わります。表は CSV または JSON で
ダウンロードできます。ブラウザのアドレスには現在の設定が記録されるので，
アドレスを写せば比較を共有できます。

![D-SoS（A）と C-SoS（B）を比べている CADL Explorer：左にサイドバーの設定，右に Outcome の節](/img/handson/explorer-compare.jpg)

### A-5. オプション — 自作CADLを貼り付ける

サイドバーの **Custom CADL** を開き，**Design B**（または
**Design A (baseline)**）に `CADLMotivationConfig` YAMLを貼り付けると，
選択肢の代わりにその設定が使われます。**CADL source of A and B** に表示される
YAMLと同じく，`governance:` / `motivation:` を入れ子にした形式で書きます。最小例：

```yaml
name: my-custom-config
sos_type: Directed
governance:
  alpha: 0.3
  beta: 0.7
  lambda: 0.0
motivation:
  agent:
    profile: linear
  governance:
    model: hybrid
    rho: 0.5
```

合成の指標が使うのは，`sos_type`，エージェントの `profile`，`rho` だけです。
`alpha`，`beta`，`lambda` などのほかの項目は，生成される IR と設定には
引き継がれますが，結果は変えません。別に扱われるのは `Directed` だけで，
ほかの `sos_type` は協調型として計算されます。プロファイルは `uniform`，
`linear`，`polarized` の3つで，それ以外の値（付録C の `custom` を含む）は
エラーになります。この形式にないキーや，階層を誤って書いた
キーは，エラーにならずに無視されるので，上の入れ子の形を守ってください。

この YAML は Explorer のページ独自の設定の形式で，CADL のモデル全体では
ありません。CADL のモデル全体（アクター，契約，ライフサイクル，モニタ）を
書いて検査するには，**Designer** のページを使います。

## 経路 B — CLI で書いて検査する {/* #path-b */}

参照実装はコマンドラインツール `cadl` で，PyPI では `cadl-lang` という名前で配布しています。以下の出力は cadl 0.3.8 のものです。

### B-1. インストール

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install cadl-lang
cadl --version
```

### B-2. 例題を取得する

例題は PyPI のパッケージではなく，cadl リポジトリにあります。

```bash
git clone https://github.com/ertlnagoya/cadl.git
```

### B-3. 例題を検査する

`cadl check` はファイルを構文解析し，型検査（アクターの宣言，参照，パラメータの範囲）を行います。

```bash
cadl check cadl/examples/robot_delivery.cadl
```

```text
Type check passed: cadl/examples/robot_delivery.cadl
```

### B-4. 検証する

`cadl verify` は，これに整合性の検査を加えます。各契約の前提（assume）と保証（guarantee）が同時に成り立ちうるか（SMT ソルバ），すべての運用モードに到達できるか，プロトコルがデッドロックしないかを調べます。

```bash
cadl verify cadl/examples/robot_delivery.cadl
```

```text
Verifying: cadl/examples/robot_delivery.cadl
  SoS: RobotDeliverySystem

--- Type Check ---
  [PASS] Type check passed

--- SMT Verification ---
  [PASS] Contract 'DELIVERY_SLA' consistency: Assumes and guarantees are jointly satisfiable
  [PASS] Contract 'DELIVERY_SLA' assumptions: Assumptions are satisfiable
  [INFO] Contract 'DELIVERY_SLA' entailment: Guarantees do not follow from the assumptions alone; they are obligations the parties must meet
  ...
--- Deadlock Detection ---
  [PASS] Protocol 'FAILURE_REPLAN' deadlock: No circular dependencies found

Verification PASSED: 8/8 checks passed
```

`[INFO]` の行は失敗ではありません。entailment の行は，保証が前提から導かれる帰結ではなく，当事者が果たすべき義務であることを述べています。

### B-5. わざと壊して，検証器に指摘させる

例題をコピーし，既存の前提と矛盾する前提を1行追加します。

```bash
cp cadl/examples/robot_delivery.cadl my_delivery.cadl
```

`my_delivery.cadl` の契約 `DELIVERY_SLA` を次のようにします。

```yaml
      assume:
        - "DISPATCHER.is_operational == true"
        - "network_latency <= 200ms"
        - "network_latency > 500ms"      # 追加：上の行と矛盾する
```

```bash
cadl verify my_delivery.cadl
```

```text
  [FAIL] Contract 'DELIVERY_SLA' consistency: Assumes and guarantees are contradictory (unsatisfiable together)
  [FAIL] Contract 'DELIVERY_SLA' assumptions: Assumptions contradict each other; the contract can never apply

Verification FAILED: 7/9 checks passed
```

このファイルは `cadl check` には通ります。書式としては正しいものの，契約が決して適用されないからです。検査の合計が 8 件から 9 件に増えているのは，entailment の行が `[INFO]` から `[PASS]` に変わるためです。矛盾した前提からは何でも導けるので，この `[PASS]` に意味はありません。こうした矛盾を運用前に見つけるのが検証器の役割です。追加した行を消すと，再び検証に通ります。

この先は，同じファイルから `cadl codegen` と `cadl sim-gen` でコードやシミュレータ設定を生成できます。全コマンドは [cadl リポジトリの README](https://github.com/ertlnagoya/cadl#readme) にあります。

## 次のステップ

- **手を動かして学ぶなら → [ハンズオン入口](../handson/index.md)**（初学者向けの 3 段階の進め方あり）。
- 言語全体については [仕様書の概要](../spec/intro.md) を参照。
- 第 [5. 言語仕様](../spec/05-language-spec.md) 章で三層構文を確認。
- 第 [7. 例](../spec/07-examples.md) 章により大きな例が載っています。
