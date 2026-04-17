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

左サイドバーでガバナンスのパラメータを操作し，メインパネルで
**CADL → IR → Config → Results → Governance** の因果連鎖を確認します。

## 2. ガバナンステンプレートを選ぶ

サイドバーから以下のいずれかを選びます。

| テンプレート | 意味 |
|---|---|
| **A-SoS** | Acknowledged SoS — 強い中央権限（α=0.3, β=0.7, λ=0.0）。 |
| **C-SoS** | Collaborative SoS — 自律性重視（α=0.7, β=0.3, λ=0.3）。 |
| **A-SoS + motivation-sensitive** | 中央権限がエージェントのモチベーションに応じて予算を調整。 |

αは権限重み，βはインセンティブ重み，λは情報共有重みです。

## 3. モチベーションプロファイルと ρ を設定

- **Motivation profile** — エージェント間のモチベーション分布
  （`uniform`, `linear`, `polarized`）。
- **ρ（モチベーション感度）** — ガバナンスがモチベーションにどれだけ応答するか。
  ρ=0 はモチベーションを無視，ρ=1 は完全に結合。

## 4. パイプラインを実行

**Run Governance Pipeline Demo** を押すと，以下のタブが同時に更新されます。

1. **Causal Chain** — ベースラインと選択設定の段階別セマンティック差分。
2. **Service View** — 機能配置図と YAML 設定。
3. **CADL / IR Diff** — 層ごとのテキスト差分。
4. **Simulator Config Diff** — Unity互換設定JSONの差分。
5. **Results & Evaluation** — 散布図，ρ掃引，個体別，サマリ。
6. **Run History** — 複数実行の比較（セッション内）。

## 5. オプション — 自作CADLを貼り付ける

サイドバーの **Advanced: Custom CADL YAML** を開き，
`CADLMotivationConfig` YAMLを貼り付けるとテンプレートを上書きできます。
最小例：

```yaml
name: my-custom-config
sos_type: directed
alpha: 0.3
beta: 0.7
lambda_param: 0.0
agent_motivation:
  profile: linear
governance_motivation:
  motivation_model: hybrid
  rho: 0.5
```

## 次のステップ

- 言語全体については [仕様書の概要](../spec/intro) を参照。
- 第 [5. 言語仕様](../spec/05-language-spec) 章で三層構文を確認。
- 第 [7. 例](../spec/07-examples) 章により大きな例が載っています。
