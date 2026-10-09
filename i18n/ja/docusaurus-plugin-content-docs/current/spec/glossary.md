---
sidebar_position: 20
title: "用語集"
---

# 用語集

CADLおよび周辺の研究プログラムで用いる作業語彙をまとめる。
リンク先は各用語を詳しく導入している章である。

## コア言語

- **CADL** — Contract Architecture Description Language。
  System of Systems の Institution / Protocol / Algorithm の三層を，
  検証可能な単一ドキュメントで記述するDSLである。
  [仕様書イントロダクション](./intro) を参照。
- **Institution 層** — アクターと契約を宣言する層。各契約は，当事者，
  `assume` / `guarantee`，`authority`，`information`，
  `responsibilities`，`incentives`，`violation` を記述し，
  ガバナンスパラメータ α / β / λ を保持する。
- **Protocol 層** — アクター間の協調手続き（メッセージ交換，
  計算ステップ，条件分岐，並列ブロック，バリア）を定義する。
- **Algorithm 層** — Protocol ステップが利用する中央／ローカル
  アルゴリズムへの参照（アルゴリズムごとに `central` と `local` の要素）。
- **Actor（アクター）** — SoS に参加する構成システム／エージェント
  ／役割。`id` で識別し，範囲指定も可能である。
- **Contract（契約）** — 当事者集合と権限に紐づく
  assume-guarantee 制約。制度設計における形式単位である。
- **Transition（遷移）** — モード間の切替。`from`，`to`，`condition` と，
  任意の `protocol`，`safety_invariant` で宣言する。

## ガバナンスパラメータ

α，β，λ の文字は，2つの異なるパラメータ体系で使われている。記号と
値域 [0, 1] は共通である。β はどちらも同じ向き（高いほど集中）であるが，
α と λ は意味が異なる。

**コア言語（契約ごと，[第5章](./05-language-spec.md)）**

- **α（アルファ）** — 情報共有度。0 は共有なし（各アクターは局所情報
  のみを持つ），1 は完全共有。契約の `information` ブロックに書く。
- **β（ベータ）** — 意思決定集中度。0 は分散（各アクターが自律的に決定），
  1 は集中（単一アクターが決定）。契約の `authority` ブロックに
  書く。
- **λ（ラムダ）** — インセンティブ強度。0 は指令ベース，1 は市場
  メカニズム。契約の `incentives` ブロックに書く。

**CADL Explorer のシミュレーション設定（最上位の `governance:`
ブロック，[Appendix C](./appendix-c-motivation.md)）**

- **α（アルファ）** — エージェントの自律度。α が高いほど局所的な
  判断の余地が大きい。
- **β（ベータ）** — 集中度。β が高いほど中央権限が支配的である。
- **λ（ラムダ）** — 探索確率。λ=0 は決定的な経路選択を意味する。

**動機拡張（[Appendix C](./appendix-c-motivation.md)）**

- **ρ（ロー）** — 動機感度。エージェント個別の動機値が意思決定に
  及ぼす強さを制御する。ρ=0 は動機非依存，ρ=1 で予算／待機が動機に
  完全連動する。
- **κ（カッパ）** — 動機値→予算変換のスケール係数。
- **予算基準値（Budget base）** — 動機調整前にアクターへ割り当てる
  基本リソース量。
- **Motivation profile（動機プロファイル）** — アクター間の動機
  分布。`uniform` / `linear` / `polarized` / `custom`（値のリストを
  明示する）のいずれか。

## System of Systems (SoS)

- **SoS** — 独立に運用される複数システムが，自律性を保ったまま
  共通目的に向けて協調する集合体。
- **Directed SoS（指揮型, D-SoS）** — 中央権限が構成システム間の
  協調を指示する。
- **Acknowledged SoS（承認型, A-SoS）** — 構成システムは自律性を
  保ちつつ，共有ガバナンスを承認する。
- **Collaborative SoS（協調型, C-SoS）** — 支配的な権限なしに，
  相互合意によって協調が成立する。
- **Virtual SoS（仮想型, V-SoS）** — 形式的な協調機構を持たず，
  暗黙的／機会主義的に協調が生じる。

## 制度の動態

[第1章 1.3.4節](./01-introduction.md) を参照。

- **Regime（運用モード）** — ある時点で有効な制度の設定一式。
  環境条件が変わると，最適なモードも変わる。
- **Regime map（モードマップ）** — どの環境条件のときにどのモードが
  最適かを表す地図。環境パラメータの空間を領域に分割し，各領域に
  モードを対応付ける。
- **Regime transition（モード遷移）** — 環境条件の変化に応じて，
  あるモードから別のモードへ切り替えること。
- **Safety invariant（安全不変条件）** — 決して破ってはならない条件。
  モード遷移の途中でも満たされなければならない。

## SoS-DSL拡張

SoS Contract DSL 拡張の用語である。
[Appendix E](./appendix-e-sos-dsl) を参照。

- **Lifecycle（ライフサイクル）** — 契約の `lifecycle:` ブロック。
  状態の集合 `states`，初期状態 `initial`，終端状態 `terminal`，
  状態間の `transitions` からなる。
- **Contract instance（契約インスタンス）** — 契約の1回の実行。
  初期トリガの発火時に生成され，ライフサイクルの状態を進む。
- **Monitor（モニター）** — 契約の `monitors:` ブロックの要素。
  観測対象 `observe`，`sampling`（イベントまたは周期），述語 `rule`
  を記述する。
- **Severity（重大度）** — 違反の等級。`Minor`，`Major`，`Critical`
  のいずれか。
- **`deadline` / `on_violation`** — ライフサイクル遷移に課す時間
  制約。期限が切れると，インスタンスは `on_violation.transition` が
  名指す状態へ，指定の重大度で移る。
- **`on_match`** — モニターの規則が成立したときの動作。違反の報告，
  目標状態への移動，またはその両方を行う。

## 検証

- **安全性（Safety）** — 「悪いことが起きない」。状態に関する
  不変性として表現する。
- **活性（Liveness）** — 「良いことがいずれ起きる」。通常 ◇φ
  （eventually φ）という時相論理式で表す。
- **公平性（Fairness）** — スケジューリング／資源配分の制約。
  いずれの参加者も無期限に飢餓しない。
- **不変条件（Invariant）** — 到達可能な全状態で成立すべき述語。
- **検証手法** — `smt`（例: Z3），`model_check`，`simulation`，
  `proof`。リファレンス実装が実装するのは `smt` だけである。
- **デッドロック** — いずれのプロトコルステップも発火不能な大域
  状態。
- **モード遷移安全性** — モード間の遷移中に不変条件が侵されない
  こと。

## パイプライン／ツールチェイン

- **IR（中間表現）** — CADL ソースから構築される三層データ構造。
  シミュレータ設定の生成器が利用する。
- **Codegen ターゲット** — [Appendix D](./appendix-d-codegen.md) の
  カタログに挙げた出力形式。`unity` と `go`（シミュレーション設定），
  `ros2`（ランタイムノード），`python`，`solidity`（スマート
  コントラクト），`opa`（Regoポリシー），`unity-csharp`（Unity向けの
  契約ランタイム），ユーザ定義ターゲットがある。
- **シミュレータ設定** — 下流シミュレータ（例: Unity）に渡す
  環境＋アクター＋ガバナンス設定。
- **パイプライン** — `CADL → IR → シミュレータ設定 → 実験 → 評価`。
- **CADL Explorer** — パイプラインを端から端までたどれる対話型
  ウェブアプリ。
  [cadl-explorer.streamlit.app](https://cadl-explorer.streamlit.app/) と
  [ソースリポジトリ](https://github.com/ertlnagoya/cadl-explorer) を参照。
- **Run history（実行履歴）** — CADL Explorer のセッション内
  実行記録。CSV / JSON でエクスポートできる。
- **Config hash** — CADL 設定全体の SHA-256 指紋。同一ハッシュ
  ＋同一シード集合なら結果が一致する。

## 評価指標

- **Throughput（スループット）** — 単位時間あたりの完了タスク数
  （フリート全体）。
- **Autonomy（自律性）** — ローカルに決定された意思決定の割合
  （中央指示との対比）。
- **Fairness（公平性）** — アクター間の負荷／報酬分布。
- **Region（性能–自律性平面の領域）** — 実験群が throughput ×
  autonomy 平面で覆う凸領域。

## 関連規格・略語

- **IEC 62853** — Open Systems Dependability 規格。CADL における
  システムライフサイクル，合意形成，説明責任の捉え方は，オープン
  システムディペンダビリティの考え方を参照している。CADL はこの規格
  への適合を主張するものではない。
- **ISO/IEC/IEEE 21841** — SoS 分類
  （Directed / Acknowledged / Collaborative / Virtual）。
- **EBNF** — Extended Backus–Naur Form。Appendix A で CADL の
  具象構文を定義するのに使用する。
- **SMT** — Satisfiability Modulo Theories。CADL の
  `method: smt` 検証の基盤である。
- **OPA / Rego** — Open Policy Agent とそのポリシー言語。制度制約の
  codegen ターゲットの一つである。

## 関連項目

- [仕様書イントロダクション](./intro)
- [言語仕様（第5章）](./05-language-spec.md)
- [Appendix A — 構文（EBNF）](./appendix-a-syntax)
- [Appendix C — 動機拡張](./appendix-c-motivation.md)
- [Appendix D — コード生成ターゲット一覧](./appendix-d-codegen.md)
- [Appendix E — SoS Contract DSL 拡張](./appendix-e-sos-dsl)
