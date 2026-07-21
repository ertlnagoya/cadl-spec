---
sidebar_position: 20
title: "用語集"
---

# 用語集

CADL および周辺の研究プログラムで用いる作業語彙をまとめます。
リンク先は各用語を詳しく導入している章です。

## コア言語

- **CADL** — Contract Architecture Description Language。
  System of Systems の Institution / Protocol / Algorithm の三層を、
  検証可能な単一ドキュメントで記述する DSL。
  [仕様書イントロダクション](./intro) を参照。
- **Institution 層** — CADL ファイルの最上位層。権限構造・義務・
  許可・禁止・制裁を宣言し、ガバナンスパラメータ α / β / λ を保持。
- **Protocol 層** — 協調手続き（メッセージ交換、計算ステップ、
  条件分岐、並列ブロック、バリア、ループ）をアクター間で定義。
- **Algorithm 層** — Protocol ステップが利用する中央／ローカル
  アルゴリズムへの参照（入出力、実装ハンドル、パラメータ）。
- **Actor（アクター）** — SoS に参加する構成システム／エージェント
  ／役割。`actor_id` で識別し、範囲指定も可能。
- **Contract（契約）** — 当事者集合と権威に紐づく
  assume-guarantee 制約。制度設計における形式単位。
- **Transition（遷移）** — trigger / guard / effect で定義される
  source→target のモード遷移。運用モード変化のモデル化に利用。

## ガバナンスパラメータ

- **α（アルファ）** — 権威／中央集権度の重み。α が高いほど中央に
  よる契約履行強制が強い。
- **β（ベータ）** — インセンティブの重み。β が高いほど報酬／制裁
  による行動誘導が支配的。
- **λ（ラムダ）** — 情報共有の重み。λ が高いほどアクター間および
  ガバナンス層への状態共有が多い。
- **ρ（ロー）** — 動機感度。エージェント個別の動機値が意思決定に
  及ぼす強さを制御。ρ=0 は動機非依存、ρ=1 で予算／待機が動機に
  完全連動。
- **κ（カッパ）** — 動機値→予算変換のスケール係数。
- **予算基準値（Budget base）** — 動機調整前にアクターへ割り当てる
  基本リソース量。
- **Motivation profile（動機プロファイル）** — アクター間の動機
  分布：`uniform` / `linear` / `polarized`。

## System of Systems (SoS)

- **SoS** — 独立に運用される複数システムが、自律性を保ったまま
  共通目的に向けて協調する集合体。
- **Directed SoS（指揮型, A-SoS variant）** — 中央権威が構成
  システム間の協調を指示。
- **Acknowledged SoS（承認型, A-SoS）** — 構成システムは自律性を
  保ちつつ、共有ガバナンスを承認。
- **Collaborative SoS（協調型, C-SoS）** — 支配的権威なしに、
  相互合意によって協調が成立。
- **Virtual SoS（仮想型）** — 形式的な協調機構を持たず、暗黙的
  ／機会主義的に協調が生じる。
- **Regime（運用モード）** — 動作条件の名前付き状態
  （通常／劣化／緊急など）。有効な契約・プロトコルを規定。

## 検証

- **安全性（Safety）** — 「悪いことが起きない」。状態に関する
  不変性として表現。
- **活性（Liveness）** — 「良いことがいずれ起きる」。通常 ◇φ
  （eventually φ）という時相論理式。
- **公平性（Fairness）** — スケジューリング／資源配分の制約：
  いずれの参加者も無期限に飢餓しない。
- **不変条件（Invariant）** — 到達可能な全状態で成立すべき述語。
- **検証手法** — `smt`（例: Z3）、`model_check`、`simulation`、
  `proof`。
- **デッドロック** — いずれのプロトコルステップも発火不能な大域
  状態。
- **モード遷移安全性** — モード間遷移中に不変条件が侵されない
  こと。

## パイプライン／ツールチェイン

- **IR（中間表現）** — CADL ソースから構築される三層データ構造。
  シミュレータ生成器・検証器が消費。
- **Codegen ターゲット** — IR から生成する出力形式：
  `unity`（シミュレーション設定）、`solidity`（スマートコントラクト）、
  `ros2`（ランタイムノード）、`python`、ユーザ定義ターゲット。
- **シミュレータ設定** — 下流シミュレータ（例: Unity）に渡す
  環境＋アクター＋ガバナンス設定。
- **パイプライン** — `CADL → IR → シミュレータ設定 → 実験 → 評価`。
- **CADL Explorer** — パイプラインを端から端まで歩ける対話型
  ウェブアプリ。
  [cadl-explorer.streamlit.app](https://cadl-explorer.streamlit.app/) を参照。
- **Run history（実行履歴）** — CADL Explorer のセッション内
  実行記録。CSV / JSON でエクスポート可能。
- **Config hash** — CADL 設定全体の SHA-256 指紋。同一ハッシュ
  ＋同一シード集合なら結果が一致。

## 評価指標

- **Throughput（スループット）** — 単位時間あたりの完了タスク数
  （フリート全体）。
- **Autonomy（自律性）** — ローカルに決定された意思決定の割合
  （中央指示との対比）。
- **Fairness（公平性）** — アクター間の負荷／報酬分布。
- **Region（性能–自律性平面の領域）** — 実験群が throughput ×
  autonomy 平面で覆う凸領域。

## 関連規格・略語

- **IEC 62853** — Open Systems Dependability 規格。CADL のモード
  モデルはこの用語法を参照。
- **ISO/IEC/IEEE 21841** — SoS 分類
  （Directed / Acknowledged / Collaborative / Virtual）。
- **EBNF** — Extended Backus–Naur Form。Appendix A で CADL の
  具象構文を定義するのに使用。
- **SMT** — Satisfiability Modulo Theories。CADL の
  `method: smt` 検証の基盤。
- **OPA / Rego** — Open Policy Agent とそのポリシー言語。制度制約の
  codegen ターゲットの一つ。

## 関連項目

- [仕様書イントロダクション](./intro)
- [言語仕様（第5章）](./05-language-spec.md)
- [Appendix A — 構文（EBNF）](./appendix-a-syntax)
