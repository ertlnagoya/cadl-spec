---
sidebar_position: 14
title: "付録D. コード生成ターゲット一覧"
description: "CADL v0.3のコード生成ターゲットの一覧。各ターゲットのカテゴリ，生成物，リファレンス実装のモジュールとコマンドを示す。"
---

# 付録D. コード生成ターゲット一覧

本付録は CADL v0.3 が規定するコード生成ターゲットを列挙し，
リファレンス実装のディレクトリ構成との対応を示す。
[付録A §A.9](./appendix-a-syntax.md#a9-codegen-block) が `codegen:` の項目の EBNF を定義する。
本付録では，各ターゲット名を**カテゴリ**・**生成物**・
**リファレンス実装（[`cadl`](https://github.com/ertlnagoya/cadl) 0.3）内の
モジュール**と対応づける。

## D.1 ターゲット一覧

| ターゲット名 | カテゴリ | 生成物 | リファレンス実装モジュール | コマンド |
|-------------|---------|--------|-------------------|---------|
| `python` | ランタイムコード | Python パッケージ（アクター，契約モニター，プロトコル，モードコントローラ，メトリクス，ランタイム。`norms: 0.1` を宣言したファイルでは，[付録F](./appendix-f-norms.md)の規範のモニターも含む） | `cadl.codegen` | `cadl codegen -t python` |
| `solidity` | 制度契約 | Solidity [[Solidity Documentation]](./appendix-b-references.md) スマートコントラクト（契約ごとに 1 つ） | `cadl.codegen.solidity` | `cadl codegen -t solidity` |
| `opa` | 制度ポリシー | Rego / OPA [[Open Policy Agent]](./appendix-b-references.md) ポリシー（契約ごとに 1 つ） | `cadl.codegen.opa` | `cadl codegen -t opa` |
| `unity-csharp` | ランタイムコード | [付録E](./appendix-e-sos-dsl.md) のライフサイクルとモニターを実行する Unity C# クラス | `cadl.codegen.unity_csharp` | `cadl codegen -t unity-csharp` |
| `unity` | シミュレータ設定 | Unity ベースのシミュレータ用 JSON | `cadl.sim.gen_unity` | `cadl sim-gen -t unity` |
| `go` | シミュレータ設定 | Go ベースのシミュレータ用 JSON | `cadl.sim.gen_go` | `cadl sim-gen -t go` |
| `python`（シミュレータ） | シミュレータ設定 | Python ベースのシミュレータ用 YAML | `cadl.sim.gen_python` | `cadl sim-gen -t python` |
| `agent-rego` | 境界方針 | メッセージに対する[付録G](./appendix-g-agents.md)の許可・拒否・エスカレーションの決定を返すRegoの方針 | `cadl.codegen` | `cadl codegen -t agent-rego` |
| `agent-cedar` | 境界方針 | [付録G](./appendix-g-agents.md)のうち静的に決まる部分のCedarの方針と付表 | `cadl.codegen` | `cadl codegen -t agent-cedar` |
| `ros2` | ランタイムノード | ROS 2 [[Macenski+, 2022]](./appendix-b-references.md) ノードの雛形 | `cadl` 0.3 では未実装 | — |
| その他の名前（ユーザ定義） | プラグイン | プラグインが出力するもの | `cadl` 0.3 にはプラグイン機構がなく，その他のターゲット名はコマンドラインでは拒否され，`codegen:` の項目では警告になる | — |

`codegen:` の項目では，名前 `python` はランタイムコードのターゲットを指す。
同名のシミュレータ設定は `cadl sim-gen` で生成する。したがって，v0.3 では
Python のシミュレータ設定を `codegen:` の項目から要求することはできず，
`cadl sim-gen -t python` を用いる。リファレンス実装（`cadl` 0.3）では，
最右列に示すとおりコマンドラインでターゲットを選択する。ファイル中の
`codegen:` の項目は構文解析されるが，まだ生成を駆動しない。`cadl` 0.3.9 からは，
実装が出力できないターゲットを指定した項目に警告が出る（D.4）。

規範拡張（[付録F](./appendix-f-norms.md)）を宣言したファイルに対しては，`python` ターゲットは
モジュール `norms_monitor.py` も出力する（`cadl` 0.3.21 の後の開発版）。このモジュールは，
各契約の `norms:` と `counts_as:` のブロック，および `assume:` と `guarantee:` の項目を，
時相演算子を含む項目も含めて，システムの動作中に 1 つの契約インスタンスについて監視する。
観測を 1 つずつ受け取り，状態または判定（`pending`，`fulfilled`，`violated`，`excused`）が
変わった規範インスタンスと項目を返す。パッケージの他のモジュールと違い，`cadl` をインポートしない。
契約をデータとして持ち，`cadl norms-eval` の評価コードを含み，Python の標準ライブラリだけを用いる。
詳細は [F.10](./appendix-f-norms.md#f10-reference-implementation-status) に示す。
`solidity`，`opa`，`unity-csharp` の各ターゲットは規範を監視しない。`solidity` と `opa` は，
時相演算子を含む項目を生成する検査から外し，コメントを残して警告を出す。

## D.2 二層ジェネレータ構成

リファレンス実装は，出力が**契約を強制または実行するコード**であるか，
**シミュレータの設定**であるかに応じて codegen を二層に分割している：

```
src/cadl/
├── codegen/            ← コード層（cadl codegen）
│   ├── *_gen.py        ← Python ランタイムパッケージ
│   ├── solidity/       ← 契約のスマートコントラクト強制
│   ├── opa/            ← 契約のポリシー強制（Rego）
│   └── unity_csharp/   ← Unity C# のライフサイクル／モニター実行系
└── sim/                ← シミュレータ層（cadl sim-gen）
    ├── ir.py           ← 三層シミュレータ IR
    ├── gen_unity.py
    ├── gen_go.py
    └── gen_python.py
```

単一の CADL ソースファイルは，両層のターゲットを同じ `codegen:`
ブロック内で宣言してよい。処理系は各ターゲットを独立に対応層へ
ディスパッチすることが望ましい。

## D.3 選択指針

- **`unity`**: 多エージェントシミュレーションを視覚的に観察する場合。
  契約のライフサイクルとモニター（[付録E](./appendix-e-sos-dsl.md)）をそのシミュレーションの
  中で実行する場合は **`unity-csharp`**。
- **`python`**: アクター，契約モニター，プロトコルの実行可能な
  ランタイムの骨格が必要な場合，または[付録F](./appendix-f-norms.md)の規範を
  システムの動作中に監視する場合。**`ros2`** は実ロボットの駆動のために
  予約されており，`cadl` 0.3 では未実装。
- **`solidity`**: Institution 層契約をオンチェーン（ブロックチェーン）
  で強制する場合。
- **`opa`**: 契約を API／サービス境界のポリシー（policy-as-code）
  として強制する場合。

同一ファイルでの複数ターゲット指定は許可されるが，
結果の成果物は独立である。たとえば同一ソースから生成された
Unity のシミュレータ設定と Solidity 契約のランタイム相互運用性は，CADL ツール
チェーンでは保証しない。

## D.4 準拠性

処理系は，各層から少なくとも 1 ターゲット
（たとえば `unity` と，`solidity` または `opa`）を
サポートするとき **codegen コア準拠**。

要求されたターゲットを生成できない場合，処理系は明確な診断
（例: 「codegen ターゲット `ros2` は本処理系で未対応」）
を出力しなければならない。無言でスキップしてはならない。

## D.5 相互参照

- [付録A §A.9](./appendix-a-syntax.md#a9-codegen-block) — EBNF。
- [用語集](./glossary.md) — **Codegen ターゲット** の定義。
