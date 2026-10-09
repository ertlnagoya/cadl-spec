---
sidebar_position: 0
title: "クイックスタート"
---

# CADL クイックスタート（5分）

このページでは，CADL仕様からシミュレーション結果とガバナンス評価までを
最短経路でたどります。**[CADL Explorer](https://cadl-explorer.streamlit.app/)**
を使えばインストールは不要です。以下の手順は CADL Explorer v0.5.0 の画面に
もとづいています。

## 1. CADL Explorer を開く

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
| **Contract Lifecycle** | IR の JSON から契約の状態機械を1ステップずつたどる。 |
| **About & Glossary** | ツールの説明，パラメータの値，用語。 |

最初に開くのは **Explorer** のページです。このページは，2つの設計
**A**（ベースライン）と **B**（検討する設計）を比べ，両方について
**CADL → IR → Config → Result** の連鎖を表示します。実行ボタンはなく，
設定を変えるたびに結果が再計算されます。

## 2. ガバナンステンプレートを選ぶ

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

## 3. モチベーションプロファイルと ρ を設定

- **Motivation profile** — エージェント間のモチベーション分布
  （`uniform`, `linear`, `polarized`）。
- **ρ（モチベーション感度）** — ガバナンスがモチベーションにどれだけ応答するか。
  ρ=0 はモチベーションを無視，ρ=1 は完全に結合。モチベーションのモデルを
  持たないテンプレート（D-SoS と C-SoS）では，スライダーは無効になります。

用意された比較から始めたい場合は，ページ上部の **Getting started**
（またはサイドバーの **Examples**）を開き，ボタンで読み込みます。

## 4. 結果を読む

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

![D-SoS（A）と C-SoS（B）を比べている CADL Explorer：左にサイドバーの設定，右に Outcome と因果連鎖の節](/img/handson/explorer-compare.jpg)

## 5. オプション — 自作CADLを貼り付ける

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
引き継がれますが，結果は変えません。

この YAML は Explorer のページ独自の設定の形式で，CADL のモデル全体では
ありません。CADL のモデル全体（アクター，契約，ライフサイクル，モニタ）を
書いて検査するには，**Designer** のページを使います。

## 次のステップ

- **手を動かして学ぶなら → [ハンズオン入口](../handson/index.md)**（初学者向けの 3 段階の進め方あり）。
- 言語全体については [仕様書の概要](../spec/intro.md) を参照。
- 第 [5. 言語仕様](../spec/05-language-spec.md) 章で三層構文を確認。
- 第 [7. 例](../spec/07-examples.md) 章により大きな例が載っています。
