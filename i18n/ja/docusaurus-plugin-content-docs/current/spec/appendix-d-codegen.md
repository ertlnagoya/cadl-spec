---
sidebar_position: 14
title: "Appendix D — コード生成ターゲット一覧"
---

# Appendix D — コード生成ターゲット一覧

本付録は CADL v0.1 が規定するコード生成ターゲットを列挙し、
参照実装のディレクトリ構成との対応を示す。
Appendix A §A.9 が `codegen:` の項目の EBNF を定義する。
本付録では、各ターゲット名を**カテゴリ**・**生成物**・
**参照実装（[`cadl`](https://github.com/ertlnagoya/cadl)、v0.3）内の
モジュール**と対応づける。

## D.1 ターゲット一覧

| ターゲット名 | カテゴリ | 生成物 | 参照実装モジュール | コマンド |
|-------------|---------|--------|-------------------|---------|
| `python` | ランタイムコード | Python パッケージ（アクター、契約モニター、プロトコル、レジームコントローラ、メトリクス、ランタイム） | `cadl.codegen` | `cadl codegen -t python` |
| `solidity` | 制度契約 | Solidity スマートコントラクト（契約ごとに 1 つ） | `cadl.codegen.solidity` | `cadl codegen -t solidity` |
| `opa` | 制度ポリシー | Rego / OPA ポリシー（契約ごとに 1 つ） | `cadl.codegen.opa` | `cadl codegen -t opa` |
| `unity-csharp` | ランタイムコード | [Appendix E](./appendix-e-sos-dsl) のライフサイクルとモニターを実行する Unity C# クラス | `cadl.codegen.unity_csharp` | `cadl codegen -t unity-csharp` |
| `unity` | シミュレータ設定 | Unity ベースのシミュレータ用 JSON | `cadl.sim.gen_unity` | `cadl sim-gen -t unity` |
| `go` | シミュレータ設定 | Go ベースのシミュレータ用 JSON | `cadl.sim.gen_go` | `cadl sim-gen -t go` |
| `python`（シミュレータ） | シミュレータ設定 | Python ベースのシミュレータ用 YAML | `cadl.sim.gen_python` | `cadl sim-gen -t python` |
| `ros2` | ランタイムノード | ROS 2 ノードの雛形 | v0.3 では未実装 | — |
| その他の名前（ユーザ定義） | プラグイン | プラグインが出力するもの | ユーザ提供 | — |

`codegen:` の項目では、名前 `python` はランタイムコードのターゲットを指す。
同名のシミュレータ設定は `cadl sim-gen` で生成する。v0.3 の参照実装では、
最右列に示すとおりコマンドラインでターゲットを選択する。ファイル中の
`codegen:` の項目は構文解析されるが、まだ生成を駆動しない。

## D.2 二層ジェネレータ構成

参照実装は、出力が**契約を強制または実行するコード**であるか、
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

単一の CADL ソースファイルは、両層のターゲットを同じ `codegen:`
ブロック内で宣言してよい。プロセッサは各ターゲットを独立に対応層へ
ディスパッチすることが望ましい。

## D.3 選択指針

- **`unity`**: 多エージェントシミュレーションを視覚的に観察する場合。
  契約のライフサイクルとモニター（Appendix E）をそのシミュレーションの
  中で実行する場合は **`unity-csharp`**。
- **`python`**: アクター、契約モニター、プロトコルの実行可能な
  ランタイムの骨格が必要な場合。**`ros2`** は実ロボットの駆動のために
  予約されており、v0.3 では未実装。
- **`solidity`**: Institution 層契約をオンチェーン（ブロックチェーン）
  で強制する場合。
- **`opa`**: 契約を API／サービス境界のポリシー（policy-as-code）
  として強制する場合。

同一ファイルでの複数ランタイムターゲット指定は許可されるが、
結果の成果物は独立である。たとえば同一ソースから生成された
Unity 設定と Solidity 契約のランタイム相互運用性は、CADL ツール
チェーンでは保証しない。

## D.4 準拠性

プロセッサは、各層から少なくとも 1 ターゲット
（最低 `unity` ＋ `solidity` と `opa` のいずれか）を
サポートするとき **codegen コア準拠**。

要求されたターゲットを生成できない場合、プロセッサは明確な診断
（例: 「codegen ターゲット `ros2` は本プロセッサで未対応」）
を出力しなければならない。無言でスキップしてはならない。
動機拡張に関する同様の要件は Appendix C §C.6 を参照。

## D.5 相互参照

- [Appendix A §A.9](./appendix-a-syntax.md#a9-codegen-block) — EBNF。
- [用語集](./glossary) — **Codegen ターゲット** の定義。
