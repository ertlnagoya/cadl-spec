---
sidebar_position: 13
title: "Appendix C — 動機拡張"
---

# Appendix C — 動機拡張（Motivation Extension, v0.1-ext）

本付録は、cadl-explorer デモおよび A-SoS 動機感応型ガバナンス実験で
使用される CADL の**動機拡張**を規定する。
コア言語（第 5 章・Appendix A）は本ブロックを必須としない。
拡張を未実装のコア準拠プロセッサは `motivation:` ブロックを
構文上受理し、エラーではなく**情報レベルの診断**を出すことが望ましい。

本拡張はコア言語と独立にバージョニングされる。
本書は **v0.1-ext** を規定する。

## C.1 スコープ

拡張は Institution 層に 2 つの概念を追加する：

1. **エージェント動機** — 各アクターに対するスカラー
   `m ∈ [0, 1]`。タスク受諾への内発的意欲を表す。
   `profile` セレクタがアクター群に対する動機分布を指定する。
2. **ガバナンスによる動機解釈** — 権威層がどのように動機を
   予算／待機時間決定に結合するか。パラメータ ρ（感度）と
   κ（スケール）により制御。

これらのパラメータはコアガバナンス三項組（α, β, λ）を**補完**する
ものであり、置換ではない。

## C.2 EBNF

```ebnf
motivation_section  = "motivation:" , INDENT ,
                      [ agent_motivation ] ,
                      [ governance_motivation ] ,
                      DEDENT ;

agent_motivation    = "agent:" , INDENT ,
                        "profile:" , motivation_profile , NEWLINE ,
                        [ "values:" , float_list , NEWLINE ] ,
                      DEDENT ;

motivation_profile  = "uniform" | "linear" | "polarized" | "custom" ;

governance_motivation = "governance:" , INDENT ,
                          "model:" , motivation_model , NEWLINE ,
                          [ "rho:"         , float_literal , NEWLINE ] ,
                          [ "kappa:"       , float_literal , NEWLINE ] ,
                          [ "budget_base:" , int_literal   , NEWLINE ] ,
                          [ "wait_scale:"  , float_literal , NEWLINE ] ,
                        DEDENT ;

motivation_model    = "none" | "commitment_budget" | "hybrid" ;
```

## C.3 パラメータ意味論

| 記号 | 名称 | 範囲 | 意味 |
|------|------|------|------|
| m_i | アクター i の動機 | [0, 1] | 0 = 非意欲、1 = 完全意欲 |
| ρ (rho) | 動機感度 | [0, 1] | 0 = 動機無視、1 = 意思決定を m に完全連動 |
| κ (kappa) | 予算スケール | ≥ 0 | 動機差分から予算調整量への係数 |
| budget_base | 予算基準値 | ℤ ≥ 0 | 動機調整前のアクター別リソース量 |
| wait_scale | 超過→再試行係数 | ≥ 0 | 予算超過量を再試行待機時間に変換する係数 |

### プロファイル意味論

アクター数 `N` に対して：

- `uniform` — 全アクターが `m = 0.5`。
- `linear` — `[0.2, 1.0]` 上に等間隔
  （`m_i = 0.2 + 0.8 · i/(N−1)`、`N = 1` なら `m = 0.5`）。
- `polarized` — 前半 `⌊N/2⌋` 個が `m = 0.2`、残りが `m = 0.9`。
- `custom` — 長さ `N` の明示的 `values` リストが必須。

## C.4 ガバナンスモデル

| `model` | 効果 |
|---------|------|
| `none` | ベースライン — 動機を無視（ρ = 0 と等価） |
| `commitment_budget` | 各アクターに `budget_base` トークン、動機に応じ `κ · (m − 0.5)` で拡張 |
| `hybrid` | 予算制約ディスパッチ**に加え**、嗜好重み付きタスク調停 |

実効感度は `ρ · 𝟙[model ≠ "none"]`。
`model = "none"` のとき、ランタイムは `rho` を無視しなければならない。

## C.5 記述例

```yaml
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
    rho: 0.6
    kappa: 5.0
    budget_base: 3
    wait_scale: 3.0
```

## C.6 準拠性

CADL プロセッサは、`motivation:` ブロックを持たないファイルを受理し
第 5 章および Appendix A を完全実装するとき **コア準拠**。

さらに以下を満たすとき **動機準拠**：

1. §C.2 の EBNF に従って `motivation:` ブロックをパースする。
2. `profile` と `model` を §C.2 の列挙に対して検証する。
3. §C.3 に従って profile を具体的なアクター別動機ベクトルに解決する。
4. 下流 codegen ターゲット（シミュレータ設定、ポリシーコード等）
   に動機パラメータを引き渡す方法を文書化する。

拡張未対応プロセッサはブロックを**原文のまま保持**することが望ましい
（下流ツールが消費できるように）。

## C.7 相互参照

- **cadl-explorer**（デモ）: v0.1-ext を
  `cadl_sim/schema/motivation_schema.py` に実装。
- **cadl（実装、`cadl_repo`）**: `motivation:` ブロックをオプトイン
  `MotivationBlock` として `SoSDefinition` に付随させ、
  検証・codegen ではコア意味論チェックなしに引き渡す。
- [用語集](./glossary) — ρ, κ, プロファイル用語の定義。
