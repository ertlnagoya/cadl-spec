---
sidebar_position: 13
title: "付録C. 動機拡張"
description: "CADLの任意の動機拡張（v0.1-ext）を規定する。エージェントの動機プロファイルと，ガバナンスのパラメータ ρ・κ を扱う。"
---

# 付録C. 動機拡張（Motivation Extension, v0.1-ext）

本付録は，CADL Explorer デモおよび D-SoS 動機感応型ガバナンス実験で
使用される CADL の**動機拡張**を規定する。
コア言語（[第 5 章](./05-language-spec.md)・[付録A](./appendix-a-syntax.md)）は
本ブロックを必須としない。
拡張を未実装の CADL 準拠の処理系は，`motivation:` ブロックを理由に
ファイルを拒否してはならない。ブロックを構文上受理し，
**情報レベルの診断**を出すことが望ましい。

本拡張はコア言語と独立にバージョニングされる。
本書は **v0.1-ext** を規定する。v0.1-ext は本拡張の文書の版を示すラベルである。
v0.1 では，本拡張は `extensions:` に宣言する名前を持たない
（[付録A.2](./appendix-a-syntax.md#a2-top-level-structure)）。
ファイルは `motivation:` ブロックを書くだけで本拡張を用いる。

## C.1 スコープ

拡張は Institution 層に 2 つの概念を追加する：

1. **エージェント動機** — 各アクターに対するスカラー
   `m ∈ [0, 1]`。タスク受諾への内発的意欲を表す。
   `profile` セレクタがアクター群に対する動機分布を指定する。
2. **ガバナンスによる動機解釈** — 権威層がどのように動機を
   予算／待機時間決定に結合するか。パラメータ ρ（感度）と
   κ（スケール）により制御。

これらのパラメータは契約のガバナンスパラメータ（α, β, λ）を**補完**する
ものであり，置換ではない。

本ブロックは，[CADL Explorer](https://github.com/ertlnagoya/cadl-explorer)
のシミュレータ（`cadl_sim`）の設定スキーマとして生まれた。CADL ファイルでは，
`sos:` マッピングの省略可能なキー `motivation:`，すなわち
[付録A.2](./appendix-a-syntax.md#a2-top-level-structure) の
`motivation_block` である。

## C.2 EBNF

文法は[付録A](./appendix-a-syntax.md) の記法に従う。`number` と `int_literal` は付録A で
定義する。

```ebnf
motivation_block      = [ "agent:"      , agent_motivation ] ,
                        [ "governance:" , governance_motivation ] ;

agent_motivation      = [ "profile:" , motivation_profile ] ,
                        [ "values:"  , { "-" , number } ] ;
motivation_profile    = "uniform" | "linear" | "polarized" | "custom" ;

governance_motivation = [ "model:"       , motivation_model ] ,
                        [ "rho:"         , number ] ,
                        [ "kappa:"       , number ] ,
                        [ "budget_base:" , int_literal ] ,
                        [ "wait_scale:"  , number ] ;
motivation_model      = "none" | "commitment_budget" | "hybrid" ;
```

既定値: `profile: uniform`，`model: none`，`rho: 0.0`，`kappa: 5.0`，
`budget_base: 3`，`wait_scale: 3.0`。

## C.3 パラメータ意味論

| 記号 | 名称 | 範囲 | 意味 |
|------|------|------|------|
| m_i | アクター i の動機 | [0, 1] | 0 = 非意欲，1 = 完全意欲 |
| ρ (rho) | 動機感度 | [0, 1] | 0 = 動機無視，1 = 予算超過アクターを最大の強さで抑制 |
| κ (kappa) | 予算スケール | ≥ 0 | 動機から予算拡張量への係数 |
| budget_base | 予算基準値 | ℤ ≥ 0 | 動機調整前のアクター別コミットメント予算 |
| wait_scale | 超過→再試行係数 | ≥ 0 | 予算超過量を再試行待機時間に変換する係数 |

### プロファイル意味論

アクター数 `N` に対して：

- `uniform` — 全アクターが `m = 0.5`。
- `linear` — `[0.2, 1.0]` 上に等間隔
  （`i = 0 … N−1` に対し `m_i = 0.2 + 0.8 · i/(N−1)`，`N = 1` なら `m = 0.5`）。
- `polarized` — 前半 `⌊N/2⌋` 個が `m = 0.2`，残りが `m = 0.9`。
- `custom` — 長さ `N` の明示的 `values` リストが必須。

## C.4 ガバナンスモデル

| `model` | 効果 |
|---------|------|
| `none` | ベースライン — 動機を無視（ρ = 0 と等価） |
| `commitment_budget` | アクター i にコミットメント予算 `B_i = budget_base + κ · m_i` を与える。予算を超過したアクターは，`⌊ρ · overshoot · wait_scale⌋` の追加待機により抑制される |
| `hybrid` | 上記の予算制約**に加え**，嗜好を考慮した経路優先度。ρ が両方を制御する。優先度の規則は v0.1-ext では**未定義**（下記参照） |

表中の量は次のように定義する。

- `used_i` は，実行開始からアクター i が引き受けたゴール（コミットメント）の累積数である。
- `overshoot = max(0, used_i − B_i)` は，アクター i が予算を超過した量である。予算内の間は 0 である。
- 追加待機 `⌊ρ · overshoot · wait_scale⌋` は，ランタイムのディスパッチャの再試行ティック数で数え，次の経路割当てまでの通常の待機に加算する。
- 「嗜好を考慮した経路優先度」（`hybrid`）は v0.1-ext では**未定義**である。式は与えられておらず，参照シミュレータは予算制約だけを適用するため，`hybrid` は `commitment_budget` と同じ動作になる。

実効感度は `ρ · 𝟙[model ≠ "none"]`。
`model = "none"` のとき，ランタイムは `rho` を無視しなければならない。

## C.5 記述例

CADL ファイルでは，本ブロックを `sos:` の下に書く。

```yaml
sos:
  name: "MotivationSensitiveDelivery"
  type: Directed
  # actors, contracts, ... は第 5 章のとおり

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

CADL Explorer のシミュレータは，同じ `motivation:` ブロックを，独自の
設定ファイルから読み込む。この設定ファイルでは，`sos_type:` や
`environment:` などのシミュレータ設定と並べて書く。同ファイルには，キー
`alpha`，`beta`，`lambda` を持つトップレベルの `governance:` マッピングもある。
これらはシミュレータのパラメータ（自律度，集中度，探索確率）であり，[5.4.2 節](./05-language-spec.md)の
契約ごとの α（情報共有度），β（意思決定集中度），λ（インセンティブ強度）
**ではない**。シミュレータの設定ファイルは，[付録A](./appendix-a-syntax.md) の意味での CADL
ファイルではない。

## C.6 準拠性

CADL 処理系は，`motivation:` ブロックを持たないファイルを受理し
[第 5 章](./05-language-spec.md)および[付録A](./appendix-a-syntax.md) を完全実装するとき **コア準拠**。

さらに以下を満たすとき **動機準拠**：

1. §C.2 の EBNF に従って `motivation:` ブロックをパースする。
2. `profile` と `model` を §C.2 の列挙に対して検証する。
3. §C.3 に従って profile を具体的なアクター別動機ベクトルに解決する。
4. 下流 codegen ターゲット（シミュレータ設定，ポリシーコード等）
   に動機パラメータを引き渡す方法を文書化する。

拡張未対応の処理系はブロックを**原文のまま保持**することが望ましい
（下流ツールが消費できるように）。

## C.7 相互参照

- **[CADL Explorer](https://github.com/ertlnagoya/cadl-explorer)**（デモ）:
  v0.1-ext を，シミュレータの設定スキーマ
  （`cadl_sim/schema/motivation_schema.py`）に実装。Explorer のページが
  受け付けるプロファイルは `uniform`，`linear`，`polarized` で，`custom` は
  受け付けない。
- **[`cadl`](https://github.com/ertlnagoya/cadl)**（リファレンス実装）:
  AST の `SoSDefinition` に省略可能な `MotivationBlock` を定義している。
  v0.3 のパーサは CADL ファイルの `motivation:` キーを読み込まない。
  このブロックは受理されたうえで無視され，検証とコード生成でも使われない。
  リファレンス実装は，
  [付録A §A.12](./appendix-a-syntax.md#a12-reference-implementation-status-v03)
  に挙げた相違を伴ってコア言語を実装しており，動機拡張は実装していない。
- [用語集](./glossary.md) — ρ, κ, プロファイル用語の定義。
