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
| `solidity` | 制度契約 | Solidity [[Solidity Documentation]](./appendix-b-references.md) スマートコントラクト（契約ごとに 1 つ）。`norms: 0.1` を宣言したファイルでは，契約ごとの規範のモニターも含む（D.5） | `cadl.codegen.solidity` | `cadl codegen -t solidity` |
| `opa` | 制度ポリシー | Rego / OPA [[Open Policy Agent]](./appendix-b-references.md) ポリシー（契約ごとに 1 つ）。`norms: 0.1` を宣言したファイルでは，契約ごとの規範のモニターをステップ関数として含む（D.5） | `cadl.codegen.opa` | `cadl codegen -t opa` |
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
`codegen:` の項目は構文解析されるだけで，この項目に基づく生成はまだ行わない。`cadl` 0.3.9 からは，
実装が出力できないターゲットを指定した項目に警告が出る（D.4）。

規範拡張（[付録F](./appendix-f-norms.md)）を宣言したファイルに対しては，`python` ターゲットは
モジュール `norms_monitor.py` も出力する（`cadl` 0.3.22 から）。このモジュールは，
各契約の `norms:` と `counts_as:` のブロック，および `assume:` と `guarantee:` の項目を，
時相演算子を含む項目も含めて，システムの動作中に 1 つの契約インスタンスについて監視する。
観測を 1 つずつ受け取り，状態または判定（`pending`，`fulfilled`，`violated`，`excused`）が
変わった規範インスタンスと項目を返す。パッケージの他のモジュールと違い，`cadl` をインポートしない。
宣言されたアクターと契約をデータ（1 つの JSON テキスト）として持ち，`cadl norms-eval` の
評価コードを含み，Python の標準ライブラリだけを用いる。生成器は，モジュールを書き出す前に検査し，
検査に失敗した場合は何も書き出さない。
詳細は [F.10](./appendix-f-norms.md#f10-reference-implementation-status) に示す。
`solidity` と `opa` のターゲットは，時相演算子を含む項目を契約のポリシーから外してコメントを残し，
それらを規範とともに契約ごとの別のファイルで監視する（`cadl` 0.3.24 から。D.5）。
`unity-csharp` のターゲットは規範を監視しない。

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
ブロック内で宣言してよい。処理系は，各ターゲットを，対応する層で
独立に処理することが望ましい。

## D.3 選択指針

- **`unity`**: 多エージェントシミュレーションを視覚的に観察する場合。
  契約のライフサイクルとモニター（[付録E](./appendix-e-sos-dsl.md)）をそのシミュレーションの
  中で実行する場合は **`unity-csharp`**。
- **`python`**: アクター，契約モニター，プロトコルの実行可能な
  ランタイムの基本のコードが必要な場合，または[付録F](./appendix-f-norms.md)の規範を
  システムの動作中に監視する場合。**`ros2`** は実ロボットの駆動のために
  予約されており，`cadl` 0.3 では未実装である。
- **`solidity`**: Institution 層契約をオンチェーン（ブロックチェーン）
  で強制する場合。
- **`opa`**: 契約を API／サービス境界のポリシー（policy-as-code）
  として強制する場合。

同一ファイルで複数のターゲットを指定してよいが，
生成される成果物は互いに独立である。たとえば同一ソースから生成された
Unity のシミュレータ設定と Solidity 契約のランタイム相互運用性は，CADL ツール
チェーンでは保証しない。

## D.4 準拠性

処理系は，各層から少なくとも 1 ターゲット
（たとえば `unity` と，`solidity` または `opa`）を
サポートするとき，**codegen コア準拠**である。

要求されたターゲットを生成できない場合，処理系は明確な診断
（例: 「codegen ターゲット `ros2` は本処理系で未対応」）
を出力しなければならない。診断を出さずに読み飛ばしてはならない。

## D.5 `opa` と `solidity` のターゲットの規範モニター {/* #d5-norms-monitors-of-the-opa-and-solidity-targets */}

`norms: 0.1` を宣言したファイルに対して，リファレンス実装の `opa` と `solidity` のターゲットは，
`cadl` 0.3.24 から，契約のポリシーとは別に，契約ごとに規範のモニターを 1 つ出力する。
`opa` は `norms_monitor_<contract>.rego` に Rego のパッケージ `cadl.norms_monitor.<contract>` を，
`solidity` は `<Contract>NormsMonitor.sol` にコントラクト `<Contract>NormsMonitor` を出力する。
モニターは，1 つの契約インスタンスについて `norms:` と `counts_as:` のブロック，および
`assume:` と `guarantee:` の項目を評価する。契約のポリシーが外す，時相演算子を含む項目も評価する。
1 つの観測は，`cadl norms-eval` と同じく F.5 の順序で処理する。

**扱う構文。** 両方のモニターは，メッセージ事象（F.3 のアクターの指定と引数を含む），制度的事象，
F.5 の 3 値の読み方による述語（比較，`IN`，`AND`，`OR`，`NOT`，算術，アクターを付けた量と付けない量，
`request` のフィールド，`now`，`state`），トリガ，`until:`，期限，`reparation:` の規範，権能の効果，
`if:` を持つ counts-as 規則，入れ子を含む F.4 の時相演算子を評価する。述語の限量子，集約，
ワイルドカード参照と範囲参照，式である添字（`A[i+1]`），改正（F.6）は評価しない。規範，counts-as 規則，
`assume:` の項目でこれらのいずれかを使う契約にはモニターを生成せず，処理系は妨げになった構文を報告する。
そのような `guarantee:` の項目は，ほかの判定がそれに依存しないので，警告を出してモニターから外す。
Solidity のモニターは小数点以下 6 桁の固定小数点数を用いるので，`*`，`/`，小数点以下が 6 桁を超える
リテラルも拒否する。`amend` を持つ観測は実行時に拒否する。F.5 と異なる形で評価する構文はない。

**Rego のモニター。** Rego のモニターはステップ関数である。OPA は状態を持たないので，ポリシーは直前の状態と
1 つの観測からモニターの次の状態を計算する。状態は呼び出しの間ホストが保存する。規則 `result` は
`input` として次を受け取る。

| キー | 意味 |
|-----|------|
| `state` | 直前のステップが返した状態。最初の観測の前は null または省略 |
| `observation` | `cadl norms-eval` のトレース形式による 1 つの観測（`t`，`values`，`messages`，`state`，`end`。`bindings` と `request` は最初の観測だけ） |
| `finish` | 観測の代わりに `true` を与えると，インスタンスは最後の観測で終わる（F.5 の手順 6） |
| `bindings`，`request` | 最初の観測が持たない場合の，インスタンスの束縛と request |
| `quantities` | アクターを付けずに書かれた量の名前。既知の名前（F.5）に加える |

`result` は，`state`（次の状態），`changes`（状態または判定が変わった規範インスタンスとその前の値，
および決まった項目），`violations`，`institutional_events`，`powers_exercised`，`unauthorised`，
`verdicts`（各規範の状態と判定，各仮定の状態，各保証の判定，`ok`），`ended`，`next_deadline`
（活性の義務と禁止の最も早い期限）を持つ。形式の誤った観測に対しては，`result` は `error` と
変わらない `state` を持つ。状態は次のキーを持つ JSON オブジェクトである。

| キー | 内容 |
|-----|------|
| `format` | `"cadl-norms-monitor-state/1"` |
| `contract` | 契約の id。ほかの契約の状態は拒否する |
| `n` | これまでに処理したインスタンスの観測の数 |
| `t` | 最後の観測の時刻。終了後の観測の時刻も含む |
| `ended`，`end_index` | インスタンスが終わったかどうかと，終わった観測 |
| `ignored` | 終了後の観測の数（それらは効果を持たない） |
| `bindings`，`request` | 最初の観測とともに与えられたもの |
| `known` | 既知の量の名前（F.5）を整列したもの |
| `values` | これまでに観測した各量の現在の値 |
| `lc` | 最後の観測の後のライフサイクルの状態（`lifecycle:` がなければ null） |
| `buffer` | まだ読む観測。`i`（インスタンスの中の番号），`t`，`values`（その時点の値），`st`（その観測の前のライフサイクルの状態）を持つ。最後の観測，時相的な内容がまだ決まらない規範の最も古い候補からの観測，時相的な項目がまだ決まらない間は最初からのすべての観測を保持し，それより古い観測は捨てる |
| `norms` | 規範ごとに 1 つの記録を契約の順に持つ。`id`，`state`，`verdict`，`at` と `act`（最初の活性化の時刻と番号），`since` と `before`（期限のための，現在の活性の区間の始まりとそれ以前の活性の時間），`from`（`reparation:` の規範を初めて判定する観測），`cands`（時相的な内容がまだ決まらない観測の番号） |
| `items` | `assume` と `guarantee`。項目ごとに `value`（null，`true`，`false`，`"undefined"`），`seen`（状態述語がある観測で成り立ったか），`verdict`，`time` |
| `failed_at` | 最初の仮定が成り立たなくなった時刻，または null |

**Solidity のモニター。** Solidity のモニターは状態を保持するコントラクトである。コントラクトは 1 つの契約インスタンスの状態を保存する。
`begin(bindings, request, quantities)` は最初の観測の前に呼べる。`observe(t, values, messages,
hasState, state, end)` は 1 つの観測を記録し，`finish()` は最後の観測でインスタンスを終える。
`verdicts()` は規範の状態と判定，および項目の判定を返す。そのほかは `ok()`，`nextDeadline()`，
`observations()`，`ended()` と，イベント `NormChanged`，`ItemChanged`，`Violation`，
`InstitutionalEvent`，`PowerExercised`，`Unauthorised` が返す。値は，名前，種類（null，真偽値，数，
文字列），数，文字列の組である。時刻を含む数は 10<sup>6</sup> を掛けた固定小数点数である。
トレースを再生して検査できるように，時刻は `observe` の引数とする。運用では `block.timestamp` に
10<sup>6</sup> を掛けた値を渡してもよい（MAY）。形式の誤った観測は revert し，状態は元のままである。
コントラクトは CADL の契約のモデルをデータとして保存し（コンストラクタが格納する），それを解釈する。
述語の評価と状態を持たない関数は 2 つのライブラリに置き，それぞれの実行時コードを EIP-170 の
大きさの上限に収める。

**ファイルの文字列。** どちらのモニターでも，`.cadl` ファイルのテキストはコードにならない。Rego は
契約を 1 つの JSON テキストとして持ち，ほかのリテラルを JSON の文字列として書く。Solidity は
すべてのテキストを 16 進リテラルとして書く。`cadl codegen` の入力検査はその前に適用する。

**検証。** リファレンス実装は，観測ごとに，両方のモニターを `cadl norms-eval` と比べる。比べるのは
規範の状態と判定，項目の判定，違反，制度的事象，権限のない行為である。対象は，サンプルのトレース，
テストのトレース，ランダムなトレースである。Rego は `opa eval` で，Solidity は EVM で実行する。

## D.6 相互参照

- [付録A §A.9](./appendix-a-syntax.md#a9-codegen-block) — EBNF。
- [用語集](./glossary.md) — **Codegen ターゲット** の定義。
