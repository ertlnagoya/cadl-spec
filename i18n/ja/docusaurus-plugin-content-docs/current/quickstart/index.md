---
sidebar_position: 0
title: "クイックスタート"
---

# CADL クイックスタート（5分）

このページでは，CADL仕様からシミュレーション結果とガバナンス評価までを
最短経路でたどります。**[CADL Explorer](https://cadl-explorer.streamlit.app/)**
を使えばインストールは不要です。

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

左サイドバーでガバナンスのパラメータを操作し，メインパネルで
**CADL → IR → Config → Results → Governance** の因果連鎖を確認します。

## 2. ガバナンステンプレートを選ぶ

サイドバーから以下のいずれかを選びます。

| テンプレート | 意味 |
|---|---|
| **A-SoS** | 強い中央権限（α=0.3, β=0.7, λ=0.0）。 |
| **C-SoS** | Collaborative SoS — 自律性重視（α=0.7, β=0.3, λ=0.3）。 |
| **A-SoS + motivation-sensitive** | 中央権限がエージェントのモチベーションに応じて予算を調整（α，β，λはA-SoSと同じ）。 |

ここでαはエージェントの自律度，βは集中度，λは探索確率です。
これらのシミュレータ用パラメータは，言語仕様で契約ごとに定めるα / β / λとは
別のものです（[用語集](../spec/glossary.md)を参照）。なお，A-SoSの2つの
テンプレートは，Explorerが表示するYAMLでは`sos_type`を`Directed`としています。

## 3. モチベーションプロファイルと ρ を設定

- **Motivation profile** — エージェント間のモチベーション分布
  （`uniform`, `linear`, `polarized`）。
- **ρ（モチベーション感度）** — ガバナンスがモチベーションにどれだけ応答するか。
  ρ=0 はモチベーションを無視，ρ=1 は完全に結合。

## 4. パイプラインを実行

**Run Governance Pipeline Demo** を押すと，以下の6つのタブが同時に更新されます。

1. **Causal Chain** — ベースラインと選択設定の段階別セマンティック差分。
2. **Service View** — フリートのトポロジー図と YAML 設定。
3. **CADL / IR Diff** — 層ごとのテキスト差分。
4. **Simulator Config Diff** — Unity互換設定JSONの差分。
5. **Results & Evaluation** — 散布図，ρの効果，ロボット別，サマリ。
6. **Run History** — 複数実行の比較（セッション内）。

![パイプライン実行後の CADL Explorer：左にサイドバーの設定，右に Causal Chain タブ](/img/handson/explorer-pipeline-demo.jpg)

## 5. オプション — 自作CADLを貼り付ける

サイドバーの **Advanced: Custom CADL YAML** を開き，
`CADLMotivationConfig` YAMLを貼り付けるとテンプレートを上書きできます。
Service View タブに表示されるYAMLと同じく，`governance:` / `motivation:` を
入れ子にした形式で書きます。最小例：

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

## 次のステップ

- **手を動かして学ぶなら → [ハンズオン入口](../handson/index.md)**（初学者向けの 3 段階の進め方あり）。
- 言語全体については [仕様書の概要](../spec/intro.md) を参照。
- 第 [5. 言語仕様](../spec/05-language-spec.md) 章で三層構文を確認。
- 第 [7. 例](../spec/07-examples.md) 章により大きな例が載っています。
