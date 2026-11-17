---
sidebar_position: 20.5
title: "付録K. モデルの改正"
description: "改正拡張（amendment 0.1）を規定する。改正できるパラメータの層，改正を判断するアクターまたは役割，範囲とステップ，バージョンの識別子，効力の発生時点，動いている契約インスタンスに対する経過規定と規範拡張の on_amendment: との関係，時間とともに変わるメトリクスの目標，メトリクスの測定方法，人間の判断の記録への参照，静的な規則，2つのバージョンの比較，IRへの追加を定める。"
---

# 付録K. モデルの改正（amendment 0.1）

この付録は，CADLの改正拡張を規定する。改正拡張は，`sos_body`
（[A.2](./appendix-a-syntax.md#a2-top-level-structure)）にキー `amendment:` を，`metric_def`
（[A.3](./appendix-a-syntax.md#a3-context-actors-metrics)）にキー `schedule:` と `measure:` を追加する。
この拡張を用いるファイルは，次のように宣言する。

```yaml
extensions:
  - amendment: 0.1
```

この拡張は，モデルがどのように変わってよいかを宣言する。変更をどのような手続きで行うかは定めない。
宣言するのは次の内容である。

- モデルのどの値を改正できるか，それぞれがどの層に属するか，改正を誰が判断するか，1回の改正で値をどこまで
  動かせるか（K.3）。
- モデルのバージョンの識別子，それが置き換えるバージョン，効力を持つ時点，その時点で動いている契約
  インスタンスの扱い（K.4）。
- 時間とともに，またはバージョンごとに変わるメトリクスの目標，メトリクスの測定方法，バージョンの根拠と
  なった人間の判断の記録への参照（K.5）。

コア，[付録E](./appendix-e-sos-dsl.md)，[付録F](./appendix-f-norms.md)のどの判定も，これらのキーに
よらない。リファレンス実装は，`cadl` 0.3.32から，これらのキーを検査し，IRに出力し，これらのキーを用いて
モデルの2つのバージョンを比較する（K.9）。

## K.1 動機と範囲 {/* #k1-motivation-and-scope */}

[コースD](../handson/robot-town-tutorial.md)のロボットの街は，期ごとに規則を改正する。`cadl`
0.3.31までは，モデルの中でどの値を改正できるかを書けなかった。演習では，改正できる値をコメント
（`# @amend:hold_limit`）で示し，その層，範囲，ステップを別の `constitution.yaml` に置き，期ごとに
変わるKPIを `kpi.md` に置き，人間の判断を `decisions.md` と `gsn.yaml` に置いている。コメントは，
ツールがファイルを書き換えると失われる。同じ値を持つ2つの行が異なる値になることもある。また，規則の
1つのバージョンを読んでも，それがいつ効力を持ったか，すでに始まっていた注文がどのバージョンに従うかは
わからない。

この拡張は，モデルに属する内容をモデルの中に書けるようにする。

| 演習での置き場所 | モデルでの書き方 |
| --- | --- |
| 値を持つ行の `# @amend:<名前>` | パラメータと，その値を持つ場所を挙げる `at:` |
| `constitution.yaml` の `layer`，`min`，`max`，`step`，`unit`，`safety` | パラメータの同じ名前のキー |
| 層ごとに改正を採択できる者（投票する委員会，人間） | 層ごと，またはパラメータごとの `decided_by:`，`procedure:`，`quorum:` |
| `v<k>.cadl` のバージョン番号と，適用を始める期 | `sos.version`，`amendment.previous`，`amendment.effective` |
| すでに始まっていた注文が従う規則（演習12-3） | `amendment.transitional` |
| `kpi.md` の期ごとのKPIと，その測定方法（5つのシード，1期） | メトリクスの `schedule:` と `measure:` |
| `decisions.md` の項目と `gsn.yaml` のノード | `amendment.decisions` と，それを指す `decision:` |

次の内容はモデルの外に残る。バージョンを作る手続き（提案，判定，投票，人間への判断要求），KPIと判断の
文章，モデルの値ではない憲法の値（演習の不変条件と，改善とみなす量の下限）である。この拡張は，
バージョンを適用しない。複数のバージョンを実行するランタイムやシミュレータが，その宣言を読み（K.4），K.11のとおりに適用する。

## K.2 概念 {/* #k2-concepts */}

- 改正できるパラメータは，改正によって変えてよい，名前を持つモデルの値であり，数または時間である。
  その値を持つファイル内の場所を，パラメータの場所と呼ぶ。
- パラメータの層は，それが属する規則の種類を表す。`rule`（構成システムが互いのあいだで定める規則），
  `contract`（顧客のように改正に加わらない当事者への約束），`regulation`（SoSの外から課される制限）の
  いずれかである。
- パラメータの判断者は，その改正を採択する判断を下すアクターまたは役割である。単独で判断する
  （`procedure: single`）か，`voters:` の投票と `quorum:` によって判断する（`procedure: vote`）。
- モデルのバージョンは1つのファイルであり，その識別子は `sos.version` である。バージョンは，ある期
  またはある時刻に効力を持ち，次のバージョンが効力を持つまで効力を保つ。
- 経過規定は，バージョンが効力を持つときに動いているインスタンスの扱いを，契約ごとに定める。インスタンスは，
  始まったときのバージョンを保つ（`keep`）か，新しいバージョンに切り替わる（`switch`）。
- 判断の記録は，人間の判断の記録の項目，またはGSNのアシュアランスケースのノードであり，URI参照で指す。
- スケジュールは，ある期，ある時刻，またはあるバージョン以降のメトリクスの目標を与える。測定方法は，
  メトリクスの1回の測定がどの長さの区間と何回の実行にわたるかを定める。

## K.3 改正できるパラメータ {/* #k3-amendable-parameters */}

### 構文

```ebnf
(* sos_body（A.2）への追加 *)
                [ "amendment:" , amendment_block ]

amendment_block = [ "previous:"     , scalar ] ,
                  [ "effective:"    , time_point ] ,
                  [ "transitional:" , transitional_block ] ,
                  [ "decisions:"    , { "-" , decision_def } ] ,
                  [ "layers:"       , { layer , ":" , authority } ] ,
                  [ "parameters:"   , { "-" , param_def } ] ;

layer           = "rule" | "contract" | "regulation" ;
authority       = "decided_by:" , text ,
                  [ "procedure:" , ( "single" | "vote" ) ] ,
                  [ "quorum:"    , int_literal ] ,
                  [ "voters:"    , { "-" , actor_ref } ] ;

param_def       = "id:"    , identifier ,
                  "layer:" , layer ,
                  "value:" , quantity ,
                  [ "min:"       , quantity ] ,
                  [ "max:"       , quantity ] ,
                  [ "step:"      , quantity ] ,
                  [ "max_steps:" , int_literal ] ,
                  [ "unit:"      , text ] ,
                  [ "safety:"    , bool_literal ] ,
                  "at:" , { "-" , location } ,
                  [ "decision:"  , identifier ] ,
                  [ "decided_by:" , text ] , [ "procedure:" , ( "single" | "vote" ) ] ,
                  [ "quorum:" , int_literal ] , [ "voters:" , { "-" , actor_ref } ] ;

quantity        = number | duration_lit ;
location        = text ;                       (* 「場所」を参照 *)
```

`value:`，`min:`，`max:`，`step:` は，すべて数であるか，すべて時間（`60s`，`2min`）である。
`decided_by:` は，ファイルのアクターをそのid（`COUNCIL`，`"ROBOT[*]"`）で指すか，役割
（`service_operator`）で指す。

### 意味

パラメータの値は `value:` であり，モデルはそのすべての場所でこの値を持つ。`min:` と `max:` は，改正が
パラメータに与えてよい値の範囲を定め，`step:` はその値の刻みを定める。値が許されるのは，`[min, max]` に
あり，`min:` との差がステップの整数倍であるときである。1回の改正で値を動かせるのは，`max_steps:`
ステップ（既定値は1）までである。`unit:` は，数の単位を読み手に示す。時間の単位は値に書く（`60s`）。
`safety: true` は，モデルの安全上の条件がそのパラメータに依存することを示す（たとえば，
`safety_invariant:` を持つモード遷移の条件）。

パラメータの判断者は，パラメータ自身が `decided_by:`，`procedure:`，`quorum:`，`voters:` のいずれかを
持つときはそれらで定まり，持たないときは `amendment.layers` にあるその層の判断者である。
`procedure: vote` では，`voters:` のうち少なくとも `quorum:` が賛成したとき，`decided_by:` のアクターが
改正を採択する。`voters:` がないときは，投票者はモデルの外にある。このバージョンでは，層はこれ以上の
意味を持たない。層はパラメータをまとめ，既定の判断者を与える。

宣言は改正の範囲を定める。動作中のシステムの値は，モードの束縛
（[A.7.1](./appendix-a-syntax.md#a71-regime-bindings)）や後のバージョンが変えることがある。

### 場所

場所は，`sos:` からのキーをドットで区切った経路である。

- マッピングでは，区切られた各部分はキーである。
- シーケンスでは，各部分は `id:` がそれに等しい項目を選ぶ。`transitions:` の項目は `FROM->TO` と書いて選ぶ。
  数字だけの部分は，0から数えたその位置の項目を選ぶ。
- 二重引用符で囲んだ部分は，ドットを含めて書かれたとおりに読む。これにより，モードに束縛した値を
  `regimes.CENTRALIZED.parameters."ROUTING.beta"` のように指せる。引用符は部分全体を囲む（YAMLでは，
  場所を単一引用符で囲んで書く）。
- 最初の部分が `sos:` のキーでないときは，`C.alpha`，`C.beta`，`C.lambda` は契約 `C` の値を，
  `environment.X` は `context.environment` の項目 `X` を指す。これは
  [A.7.1](./appendix-a-syntax.md#a71-regime-bindings)のモードの束縛と同じ書き方である。

| 場所 | 値 |
| --- | --- |
| `contracts.ROAD_USE.lifecycle.transitions.release.deadline` | ライフサイクルの遷移 `release` の `deadline:` |
| `contracts.ROAD_USE.monitors.blocking_guard.rule` | モニターの `rule:` |
| `contracts.DELIVERY_SLA.guarantee.0` | `guarantee:` の最初の項目 |
| `contracts.JOB.norms.report.deadline` | 規範の `deadline:`（付録F） |
| `transitions.DISTRIBUTED->CENTRALIZED.condition` | モード遷移の条件 |
| `regimes.CENTRALIZED.parameters."ROUTING.beta"` | モード `CENTRALIZED` が `ROUTING.beta` に束縛する値（A.7.1） |
| `ROAD_USE.lambda`，`environment.bays` | `contracts.ROAD_USE.incentives.lambda` と `context.environment.bays` の短い形 |

場所がパラメータを持つとは，そこに書かれた値をリテラル（A.1）として読んだものが `value:` に等しいこと，
または式であれば，`value:` に等しいリテラルを含むか，パラメータの名前を名前として使う
（`hold_time <= hold_limit`）ことをいう。アクター参照の添字（`ROBOT[3]`）は，このリテラルに含めない。
場所にある `value:` に等しいリテラルは，どれもパラメータの出現である。このため，場所はファイルが許す
かぎり狭くするのがよい（2つの項目が等しい値を持つときは `guarantee.0` のように項目まで書く）。そうで
ないときは，処理系は警告を出す（K-9）。2つのリテラルは，同じ数または同じ時間を表すときに等しい。
`120s` と `2min` は等しく，`120s` と `120` は等しくない。

## K.4 バージョンと経過規定 {/* #k4-versions-and-transitional-provisions */}

### 構文

```ebnf
time_point         = "period:" , int_literal
                   | "at:"     , text ;               (* どちらか一方 *)
transitional_block = [ "default:"   , transitional_rule ] ,
                     [ "contracts:" , { "-" , transitional_entry } ] ;
transitional_entry = "contract:" , identifier ,
                     "rule:"     , transitional_rule ,
                     [ "in_states:" , { "-" , identifier } ] ;
transitional_rule  = "keep" | "switch" ;
```

### 意味

`sos.version` はバージョンの識別子，`previous:` はそれが置き換えるバージョン，`effective:` はそれが効力を
持つ時点である。時点は，番号で指定した期の始まり（`period:`。1から数える。期の長さはシステムが定め，
ハンズオンでは模擬時間の1時間である）か，時刻（`at:`。ISO 8601の日付または日時。日付はその日の
00:00 UTCを表し，オフセットのない日時はUTCとして読む）である。バージョンは，次のバージョンが効力を
持つまで効力を保つ。

あるバージョンが効力を持つ時点以降に始まる契約インスタンスは，そのバージョンのインスタンスである。
その時点で動いている（始まっていて終わっていない）インスタンスは，新しいバージョンにあるその契約の
経過規定に従う。経過規定は，`transitional.contracts` にあるその契約の項目か，`transitional.default`
である。`transitional.default` の既定値は `switch` である。

| 規定 | ライフサイクル，モニター，保証 | 規範（付録F） |
| --- | --- | --- |
| `keep` | インスタンスは，終わるまで，始まったときのバージョンに従う。期限，モニター，`assume:`，`guarantee:` は古いバージョンのものである。 | 規範インスタンスは改正されない。`on_amendment:` は適用されない。 |
| `switch` | インスタンスは，バージョンが効力を持つ時点で新しいバージョンに移る。`in_states:` があるときは，その時点以降で，挙げた状態のいずれかにある最初の観測で移る（それより前に終わるインスタンスは移らない）。移ったあとは新しいバージョンに従う。現在の状態ですでに過ぎた時間は，新しい期限に算入する。 | インスタンスが移るとき，その観測でF.6を適用する。発効中または停止中の各規範インスタンスは，`on_amendment:`（`carry_over`，`discharge`，`transform:`）に従う。 |

`switch` は，[付録FのF.6](./appendix-f-norms.md)が前提とする規定である。F.6は，改正が契約インスタンスの
規範インスタンスをどう扱うかを定め，この節は，契約インスタンスを改正するかどうかと，いつ改正するかを
定める。2つの定めは重ならない。F.6が求めるとおり，切り替わるインスタンスの現在の状態は，新しい
バージョンの状態でなければならない。`in_states:` は，これが成り立つ状態に切り替えを限るために使う。
`transitional:` を持たないバージョンでは，動いているすべてのインスタンスが，バージョンが効力を持つ時点で
切り替わる。これは，この拡張を用いないファイルのF.6のもとでの扱いと同じである。

`keep` は，[演習12-3](../handson/robot-town-tutorial.md)の経過措置「変更前に始まった注文と待機は古い
期限を保つ」にあたる。`switch` に `in_states:` を付けると，たとえば，まだ集荷していない注文だけを
切り替えられる（`in_states: [Assigned]`）。

## K.5 メトリクス：スケジュール，測定方法，判断の記録 {/* #k5-metrics-schedules-measurement-and-decision-records */}

### 構文

```ebnf
(* metric_def（A.3）への追加 *)
                [ "schedule:" , { "-" , schedule_entry } ] ,
                [ "measure:"  , measure_def ]

schedule_entry  = "from:"   , ( time_point | "version:" , scalar ) ,
                  "target:" , scalar ,
                  [ "decision:" , identifier ] ;
measure_def     = [ "window:"      , duration_lit ] ,
                  [ "every:"       , duration_lit ] ,
                  [ "aggregate:"   , aggregate ] ,
                  [ "runs:"        , int_literal ] ,
                  [ "across_runs:" , aggregate ] ,
                  [ "description:" , text ] ,
                  [ "decision:"    , identifier ] ;
aggregate       = "mean" | "median" | "min" | "max" | "sum" | "last" ;

decision_def    = "id:"  , identifier ,
                  "ref:" , text ,                      (* URI参照 *)
                  [ "kind:" , ( "gsn" | "record" ) ] ,
                  [ "text:" , text ] ;
```

### 意味

スケジュール。ある時点のメトリクスの目標は，`from:` がその時点より後でない `schedule:` の最後の項目の
`target:` である。最初の項目より前は，メトリクス自身の `target:` である。1つのスケジュールの項目は，
1つの形の `from:` を使う。`period:` または `at:` では，項目は時間の順に並ぶ。`version:` では，項目は
そのバージョンが効力を持つ時点から適用され，項目はそのバージョンが効力を持つ順に並ぶ。目標は，メトリクスの
`target:`（A.3）と同じように書き，それ以上は解釈しない。

測定方法。メトリクスの1回の測定は，長さ `window:` の区間にわたる。`every:` があるときは，区間の中で
その間隔ごとに式を評価し，得た値を `aggregate:`（既定値は `mean`）でまとめる。`every:` がないときは，
区間全体について式を1回評価する。`runs:` があるときは，1回の測定をその回数の独立な実行（たとえば乱数の
シードを変えたシミュレーション）で行い，得た値を `across_runs:`（既定値は `mean`）でまとめる。目標は
この測定値と比べる。`description:` は，測定値の意味を読み手に文章で示す。

判断の記録。`amendment.decisions` は，このバージョンの根拠となった人間の判断の記録を挙げる。`ref:` は
URI参照（RFC 3986）であり，ファイルからの相対参照でも絶対参照でもよい（たとえば `decisions.md#d1`，
`gsn.yaml#S2`）。`kind:` は，それがGSNのアシュアランスケースのノード（`gsn`）を指すか，判断の記録の
項目（`record`）を指すかを示し，`text:` はその要約である。パラメータ（その現在の値を決めた判断），
スケジュールの項目（目標を決めた判断），測定方法（それを選んだ判断）は，`decision:` で記録を指す。
この拡張は，記録の内容を読まない。

## K.6 静的意味論 {/* #k6-static-semantics */}

`amendment: 0.1` を宣言したファイルについて，処理系は次をエラーとして報告しなければならない。

- K-1. `amendment:` とその各部分は，K.3からK.5が定めるマッピングまたはシーケンスであり，挙げたもの以外の
  キーを持たない。
- K-2. `amendment:` を持つファイルは `sos.version` を書く。`previous:` は `sos.version` と異なる
  スカラーである。
- K-3. `time_point` は，正の整数である `period:` と，ISO 8601の日付または日時である `at:` のどちらか
  一方だけを持つ。
- K-4. 経過規定は `keep` または `switch` である。`transitional_entry` はファイルの契約を指し，同じ契約を
  2回以上指さない。`in_states:` は `switch` とともにだけ書き，その契約の `lifecycle:` の終端でない状態を
  挙げる。
- K-5. `decision_def` は，判断のあいだで一意な識別子を `id:` に持ち，スペースや改行を含まない `ref:` と，一覧の中の
  `kind:` を持つ。
- K-6. `decided_by:` は，ファイルのアクター（添字の有無を問わないid）またはアクターの役割を指す。
  `voters:` の各項目はアクターを指す。`layers:` の層は `rule`，`contract`，`regulation` のいずれかであり，その判断者は
  `decided_by:` を持つ。`procedure: vote` は正の `quorum:` を持ち，`voters:` がすべて添字のない
  アクターであるときは，`quorum:` はその数を超えない。`quorum:` と `voters:` は `procedure: vote` と
  ともにだけ書く。どのパラメータも，自身の判断者か，その層の判断者を持つ。
- K-7. パラメータは，パラメータのあいだで一意な識別子を `id:` に持ち，一覧の中の層と，数または時間である
  `value:` を持つ。`unit:` は文字列，`safety:` は真偽値である。
- K-8. `min:`，`max:`，`step:` は `value:` と同じ種類である。`step:` は正であり，`min:` は `max:` より
  大きくない。`value:` は `[min, max]` にあり，`min:` と `step:` があるときは，`min:` との差がステップの
  整数倍である。`max_steps:` は正の整数であり，`step:` とともにだけ書く。契約の `alpha`，`beta`，
  `lambda` にあるパラメータが数でないとき，または0より小さい `min:` か1より大きい `max:` を宣言する
  ときは，処理系は警告を出すべきである。これらの値の範囲は `[0, 1]` である（A.12）。
- K-9. `at:` は，互いに異なる場所の空でない一覧である。各場所は解決でき（K.3），`version:` と
  `amendment:` の中になく，パラメータを持つ。2つのパラメータが同じ場所（または一方が他方の中にある場所）に
  同じ値を持つときは，処理系は警告を出すべきである。一方の改正を他方の改正と区別できないからである。
  場所がマッピングかシーケンスであるとき，または値を2回以上持つときも，警告を出すべきである。その
  ようなリテラルはどれもパラメータとみなされる。
- K-10. `decision:` は，`amendment.decisions` の判断を指す。
- K-11. `schedule:` は空でない項目の一覧であり，項目は1つの形の `from:` を持つ。`period:` と `at:` では
  増加する順に並び，`version:` では互いに異なるバージョンを指す。`target:` は文字列または数である。
- K-12. `window:` と `every:` は正の時間である。`every:` は `window:` とともにだけ書き，`window:` より
  長くない。`aggregate:` と `across_runs:` は一覧の中の値であり，それぞれ `every:` と `runs:` とともに
  だけ書く。`runs:` は正の整数である。
- K-13. `amendment: 0.1` を宣言せずに `amendment:`，`schedule:`，`measure:` を用いるファイルには，警告を
  1つ出す。これらのキーは検査せず，IRにも出力しない。

処理系は，規範を持つ契約の動いているインスタンスが古いバージョンを保つとき，その旨を情報として報告する
べきである。その規範の `on_amendment:` は適用されない（K.4）。

## K.7 2つのバージョンの比較 {/* #k7-comparing-two-versions */}

モデルの2つのバージョンは，古いバージョンの宣言のもとで比較する。改正は，古いバージョンの宣言に基づいて
行われるからである。`amendment: 0.1` を宣言していない古いバージョンは，どのキーを持っていても，
パラメータを宣言していないものとして扱う。モデルの変更が宣言した改正の範囲に収まるとは，その変更が，
宣言されたパラメータをその場所で変えたものであり，それぞれが古い宣言の範囲内にあることをいう。

1. 古いバージョンのパラメータで値が変わるものについて，新しい値は同じ種類であり，古い `[min, max]` に
   あり，古い `min:` からのステップに乗り，古い値との差が `max_steps` × `step` 以下である。
2. 古いバージョンで，値が変わるすべてのパラメータについて，その各場所にある古い値の出現を新しい値に
   一度に置き換えると，新しいバージョンが得られる。ただし，`version:`，`amendment:` と，規則ではない
   部分（`name:`，`description:`，`metrics:`，`codegen:`，`motivation:`）は除く。`verification:` は
   規則と同じように比べる。その変更は，証明する内容を弱めることがあるからである。値はK.3のとおりに
   比べる。`60s` と `1min` は等しい。場所が古い値を2回以上持つとき（ほかの出現も一緒に変わる），
   または値が変わる2つのパラメータが同じ場所に同じ古い値を持ち，それに異なる新しい値を与えるときは，
   置き換えはあいまいであり，変更は説明されない。
3. 項目がidを持つリストでは，意味がその順序を使うとき，両方のバージョンにある項目の順序は変わらない。
   これにあたるのは，契約の規範（F.5のステップ2は宣言の順に処理する）とアクター（付録Jのファイルの順序）
   である。ほかのそのようなリストの順序の変更は，警告として報告するべきである。
4. 新しいバージョンが `previous:` を書くときは，その値は古いバージョンの `sos.version` である。2つの
   バージョンの `sos.version` は異なる。古いバージョンが `sos.version` を持たないときは `previous:` を
   確かめられず，処理系はそのことを警告として報告するべきである。両方が同じ形の効力の発生時点を持つときは，新しいバージョンの時点のほうが後である。期と時刻は
   比べられない。処理系はそのことを報告するべきである。
5. 変わる契約で，動いているインスタンスが切り替わるものについて，インスタンスが切り替わりうる状態
   （`in_states:`，それがなければ終端でないすべての状態）は，新しいバージョンの状態である（F.6）。
   状態の削除は，それ自体がパラメータで説明されない変更である（項目2）。処理系は，それが影響する切り替わる
   インスタンスを警告として加えるべきであり，2つ目のエラーとして数えない。

宣言そのものの変更（パラメータの層，判断者，範囲，ステップ，場所の変更，パラメータの追加）は，宣言の
範囲に含まれない。処理系はこれを報告するべきである。規則ではない部分の変更も報告するべきである。規範を
持つ契約で，動いているインスタンスが切り替わるものについては，その契約の記述が変わるかどうかにかかわらず，
処理系は，`cadl norms-diff` と同じように，F.6がその規範をどう扱うかを報告するべきである。その契約の
動いているインスタンスはどれも改正されるからである。

## K.8 中間表現（IR）への追加 {/* #k8-intermediate-representation-ir-addition */}

`amendment: 0.1` を宣言し，そのキーを用いるファイルでは，IRに最上位のキー `amendment` が加わる。時間は
ミリ秒で表し（`kind: duration`，`unit: ms`），数は数として書く。各パラメータは，解決した判断者を持つ。

```json
"amendment": {
  "version": "2", "previous": "1", "effective": { "period": 2 },
  "transitional": {
    "default": "keep",
    "contracts": [ { "contract": "ROAD_USE", "rule": "switch", "in_states": [] } ]
  },
  "decisions": [ { "id": "D1", "ref": "decisions.md#d1", "kind": "record" } ],
  "parameters": [
    { "id": "block_k", "layer": "rule", "kind": "number", "unit": null,
      "value": 2, "min": 1, "max": 4, "step": 1, "max_steps": 1, "safety": false,
      "decided_by": "COUNCIL", "procedure": "vote", "quorum": 2, "voters": [],
      "at": ["contracts.ROAD_USE.monitors.blocking_guard.rule"], "decision": "D1" }
  ],
  "metrics": [
    { "id": "on_time_deliveries",
      "measure": { "window_ms": 3600000, "runs": 5, "across_runs": "mean",
                   "decision": "K1" },
      "schedule": [ { "from": { "period": 5 },
                      "target": ">= 0.85 * count(orders)", "decision": "K5" } ] }
  ]
}
```

コアのIRの `metrics` の項目は，`id`，`formula`，`target` だけを持つ。追加分は `amendment.metrics` に
置く。宣言のないファイルとキーを用いないファイルには，このキーは出力されない。

## K.9 例とリファレンス実装の状況 {/* #k9-reference-implementation-status */}

`cadl` リポジトリには，コースDのロボットの街にこの拡張を用いたものが，2つのバージョン
`examples/amendment_robot_town_v1.cadl` と `_v2.cadl` としてある。バージョン2の抜粋を示す。

```yaml
sos:
  name: "RobotTown"
  version: "2"
  extensions:
    - sos-dsl: 0.1
    - amendment: 0.1
  actors:
    # TOWN_STEWARD，"ROBOT[1..N]"，COUNCIL はハンズオンと同じ。加えて人間：
    - { id: OPERATOR, role: "service_operator", autonomy: high }
  # 契約 DELIVERY_SLA と ROAD_USE，遷移，プロトコルはハンズオンと同じ
  metrics:
    - id: on_time_deliveries
      formula: "count(Delivered)"
      target: ">= 0.9 * count(orders)"
      measure: { window: 3600s, runs: 5, across_runs: mean, decision: K1 }
      schedule:
        - { from: { period: 5 }, target: ">= 0.85 * count(orders)", decision: K5 }
  amendment:
    previous: "1"
    effective: { period: 2 }
    transitional:
      default: keep                 # 始まっている注文は期限を保つ
      contracts:
        - { contract: ROAD_USE, rule: switch }
    decisions:
      - { id: K1, ref: "decisions.md#k1", kind: record }
      - { id: K5, ref: "gsn.yaml#G5", kind: gsn }
      - { id: D1, ref: "decisions.md#d1", kind: record }
    layers:
      rule:     { decided_by: COUNCIL, procedure: vote, quorum: 2 }
      contract: { decided_by: OPERATOR }
    parameters:
      - { id: hold_limit, layer: rule, value: 60s, min: 10s, max: 120s, step: 10s,
          at: [contracts.ROAD_USE.lifecycle.transitions.release.deadline] }
      - { id: block_k, layer: rule, value: 2, min: 1, max: 4, step: 1, decision: D1,
          at: [contracts.ROAD_USE.monitors.blocking_guard.rule] }
      - { id: to_central, layer: rule, safety: true, decided_by: OPERATOR,
          value: 22, min: 10, max: 30, step: 2, unit: orders,
          at: ["transitions.DISTRIBUTED->CENTRALIZED.condition"] }
      - { id: pickup_deadline, layer: contract, value: 120s, min: 60s, max: 180s,
          step: 30s,
          at: [contracts.DELIVERY_SLA.lifecycle.transitions.pickup.deadline,
               contracts.DELIVERY_SLA.guarantee.0] }
      # sanction_lambda，to_distributed，dropoff_deadline も同様
```

`cadl amend-diff` は2つのバージョンを比べる（抜粋）。

```text
$ cadl amend-diff examples/amendment_robot_town_v1.cadl examples/amendment_robot_town_v2.cadl
Amendment from ... (version 1) to ... (version 2) (amendment 0.1, K.7)
  takes effect: period 2
  decisions: K1 (decisions.md#k1), K5 (gsn.yaml#G5), D1 (decisions.md#d1)

Parameters
           hold_limit: 60s → 60s (rule, COUNCIL by vote, quorum 2)
  changed  block_k: 3 → 2 (rule, COUNCIL by vote, quorum 2)
           ...
           pickup_deadline: 120s → 120s (contract, OPERATOR)

Contract ROAD_USE: changed by block_k (transitional: switch)
  info     running instances switch to the new version when the new version takes effect

Result: the changes respect the declared amendability
```

`block_k` を一度に3から1へ動かし，さらに `ROAD_USE` の待機の超過を `Major` の違反に変えたバージョンでは，
エラーが2つ出る。`block_k` については「moves by 2, more than 1 step of 1」，重大度については
「is changed and no declared parameter explains it」である。このとき終了コードは1である。

リファレンス実装は，`cadl` 0.3.32から次を提供する。

- `cadl check`：規則K-1からK-13。規範を持つ契約のインスタンスが古いバージョンを保つときの，K.6の情報も
  含む。
- `cadl sim-ir`：K.8のIRへの追加。
- `cadl amend-diff OLD NEW`（テキスト，または `--format json`）：K.7の比較。宣言されたすべての
  パラメータを，古い値，新しい値，層，判断者とともに挙げ，変わったすべての契約を，それを変えたパラメータと
  経過規定とともに挙げ，検出結果を示す。規則の部分の変更で説明されないもの（`verification:` と，
  アクターと規範の順序を含む）と，あいまいな置き換えはエラーである。規則ではない部分の変更，ほかの
  リストの順序の変更，宣言の変更は警告である。古いバージョンが宣言を持たないときも警告を出す（このとき，
  規則の変更はどれも宣言で説明できない）。古いバージョンでない `previous:`，両方で同じバージョン，後に
  ならない効力の発生時点はエラーである。規範を持つ契約でインスタンスが切り替わるものには，その契約の記述が
  変わらないときも，その契約についての `cadl norms-diff` の検出結果を含める。インスタンスがバージョンを
  保つものには含めない。F.6が適用されないからである。終了コードは，変更が宣言した改正の範囲に収まるとき0，
  収まらないとき，または新しいバージョンが `cadl check` を通らないとき1，ファイルがないとき，
  または古いバージョンが `cadl check` を通らないとき2である。

リファレンス実装は，`cadl` 0.3.34から，K.11のとおりにシステムの動作中にバージョンを適用する。

- `cadl norms-eval FILE --version FILE ... [--period DURATION] [--origin SECONDS] [--epoch]`：
  実行のバージョン（ファイルと後のバージョン。`previous:` による1つの列），時間の基準，トレースの観測の
  キー `version`（効力を持つバージョンを指定する）を扱う。結果はキー `versions` を持ち，インスタンスが
  始まったときのバージョン，従っているバージョン，各 `keep`，`switch`，待っている切り替え，取り消した
  切り替えをその時刻とともに示す。切り替えによる改正は，`amend` による改正と同じく報告する（F.10）。
  バージョンのあるトレースは `amend` を持てず，モードを指定する実行と，初期モードが契約を有効と
  しない実行はバージョンを持てない（K.11の「モード」）。`--version`，時間の基準，キー `version` の
  どれもないときの結果は，拡張を宣言したファイルでも `cadl` 0.3.33と同じである。
- Pythonターゲットの規範モニター（F.10）：`amendment:` ブロックとともに拡張を宣言したファイルについて，
  ほかのバージョンのモデル，時間の基準，観測のキー `version` を，`cadl norms-eval` と同じく扱う。
- `cadl metrics-eval FILE --measurements FILE [--version FILE ...]`（時間の基準は同じ）：K.11の測定の
  判定（`met`，`not met`，または理由を付けた `not judged`）。測定は，区間の始まり（タイムスタンプ
  または期），各実行の値（`every:` があるときは標本のリスト），目標の項の値を与える。目標を満たさない
  測定があるとき終了コードは1である。
- `cadl norms-check --version` は，契約の規定が `keep` または `in_states:` を持つ `switch` である
  バージョンを拒否する（K.11）。
- Pythonターゲットのモジュール `version.py` と，K.11が定めるRegoとSolidityの各ターゲットの規範
  モニターおよびUnity C#ターゲットの拒否。

テストは，例の契約について，2から4のバージョンと無作為な規定（`keep`，`switch`，`in_states:` を
持つ `switch`，集荷の期限）を持つ無作為なトレースで，バージョンを与えた `cadl norms-eval` を，
テストの中で別に書いたK.11の参照実装がインスタンスを切り替える観測に `amend` の行を入れた
`cadl norms-eval` と比べ，モニターを `cadl norms-eval` と比べる。効力を持つバージョンの選択と
切り替えの判断に入れた4つの誤りは，どれも検出された。`cadl agents-run` は，これまでどおりトレースが
`amend` を持つところでだけ改正する。判断の記録は開かない。

## K.10 後方互換性 {/* #k10-backward-compatibility */}

この拡張はキーを追加するだけである。そのキーをどれも用いないファイルは，`cadl check`，`cadl sim-ir`，
`cadl verify` について，`cadl` 0.3.31と同じ結果になる。`cadl` 0.3.32について，`cadl` リポジトリの例と
テストの78のファイルで0.3.31と比べた。また，テストは，キーを用いない同梱の例がIRへの追加も拡張の診断も
受けないことを確かめる。拡張を宣言しないファイルにあるこの拡張のキーには，警告を1つ出し（K-13），
それ以外では無視する。これは，言語のあるバージョンに含まれないキーについてA.2が求める扱いである。
拡張を宣言したファイルでも，IRのコアの `metrics` の項目は変わらない。

## K.11 システムの動作中のバージョンの適用 {/* #k11-applying-versions-while-a-system-runs */}

K.4とK.5は，バージョンがいつ効力を持つか，そのとき動いている契約インスタンスがどう扱われるか，
ある時点のメトリクスの目標が何かを宣言する。この節は，システムを動かす処理系またはシステムを
監視する処理系が，これらの宣言をどう適用するかを定める（`cadl` 0.3.34から）。この節はキーを
追加しない。[付録AのA.7.1](./appendix-a-syntax.md#a71-regime-bindings)（「実行」）のステップと，
[付録FのF.6](./appendix-f-norms.md)の規範インスタンスの改正を用い，それらを変えない。

### 実行のバージョン

実行のバージョンは，`amendment: 0.1` を宣言し，`previous:` によって1つの列をなすファイルである。
最初のバージョン以外はどれも `previous:` を持ち，それは直前のバージョンの `sos.version` を指す。
また，最初のバージョン以外はどれも `effective:` を持つ。処理系は，このような列をなさないバージョンの
組と，`sos.version` が同じ2つのバージョンを含む組を拒否しなければならない（MUST）。

### 時間の基準

効力の発生時点は，実行の時間の中の時点であり，ステップのタイムスタンプと同じ尺度で表す。契約の時計
（[F.5](./appendix-f-norms.md#contracts-not-in-force)）では読まない。バージョンはモデル全体の
バージョンであり，契約の時計は1つの契約が効力を持つ時間だけを測るからである。K.4は期の長さを
システムに委ねるので，実行は次の時間の基準を与える。

- `period: k` には，期の長さ `L` と，期1が始まる時刻 `T0` を与える。期 `k` は `T0 + (k - 1) × L` に
  始まる。
- `at:` には，タイムスタンプが1970-01-01T00:00:00Zからの秒数であることを与える。`at:` の時刻は，
  その秒数としてタイムスタンプと比べる（K.4と同じく，日付はその日の00:00 UTCを表し，オフセットの
  ない日時はUTCとして読む）。

時間の基準があるとき，バージョンの効力の発生時点は列に沿って狭義に増加しなければならない（MUST）。
そうでなければ処理系はバージョンを拒否する。

### ステップで効力を持つバージョン

どのステップでも，効力を持つバージョンはちょうど1つである。それは次の2つの方法のどちらか，または
両方で決まる。

1. 効力の発生時点による。時間の基準があるとき，タイムスタンプ `t` のステップで効力を持つバージョンは，
   効力の発生時点が `t` より後でない，列の最後のバージョンである。`effective:` を持たない最初の
   バージョンは，はじめから効力を持つ。最初のバージョンの効力の発生時点より前のステップでは，効力を持つ
   バージョンがなく，処理系はそのステップを拒否する。
2. ホストによる。ホストがモードを指定するのと同じく（A.7.1），ホストはステップで効力を持つ
   バージョンを指定できる。指定したバージョンは，別のステップが指定するまで効力を保つ。最初の指定より
   前は，列の最初のバージョンが効力を持つ。指定するバージョンは，直前のステップで効力を持つバージョンより
   列の前にあってはならない（MUST NOT）。時間の基準もあるときは，指定するバージョンは1.で決まる
   バージョンでなければならない（MUST）。そうでなければ処理系はそのステップを拒否する。

時間の基準もバージョンの指定もないときは，どのステップでも列の最初のバージョンが効力を持つ。したがって，
バージョンは，タイムスタンプが効力の発生時点以降である最初のステップで効力を持つ。切り替わるのはその
ステップとその前のステップの間であり，これはモードの束縛が変わるのと同じである（A.7.1の4.）。
効力の発生時点ちょうどのステップで観測した値とメッセージは，新しいバージョンに属する。F.6は，その
ステップで他の何を評価するよりも前に新しいバージョンを適用するからである。

### 動いている契約インスタンス

契約インスタンスは，各ステップで1つのバージョンに従う。インスタンスは，最初のステップで効力を持つ
バージョンに従う。あるステップでバージョン `V` が効力を持つとき，動いている各インスタンスは，`V` に
あるその契約の経過規定に従う（K.4）。

| `V` の規定 | このステップでの扱い |
| --- | --- |
| `keep` | インスタンスは，従っているバージョンに従い続ける。F.6は何も適用されず，規範インスタンス，期限，区間は変わらない。 |
| `switch` | インスタンスは，従っているバージョンから `V` へ改正される（F.6）。改正は，このステップで他の何を評価するよりも前に行う。K.4のとおり，現在のライフサイクルの状態ですでに過ぎた時間は `V` の期限に算入する。これは，引き継がれる規範の期限にすでに過ぎた時間を算入する（F.6）のと同じである。 |
| `in_states:` を持つ `switch` | 切り替えを待つ。このステップ以降で，ステップの前のインスタンスのライフサイクルの状態（そのステップの述語が見る状態，F.5）が `in_states:` のいずれかである最初のステップで，上と同じく切り替える。 |

F.6はそのまま適用し，インスタンスが従っているバージョンを古いバージョンとする。たとえば，バージョン2が
効力を持ったときにバージョン1を保ち，バージョン3が効力を持ったときに切り替わるインスタンスは，
バージョン1からバージョン3へ改正され，バージョン1の規範の `on_amendment:` が適用される。1つの
ステップでは，ステップの前の状態が条件を満たす待っている切り替えを先に行い，その後でそのステップで
効力を持つバージョンを適用する。待っている切り替えは，それが行われないステップで後のバージョンが
効力を持つと取り消され，そのときは後のバージョンの規定だけを適用する。先に終わるインスタンスは
切り替わらない。1つのステップで複数のバージョンが効力を
持つときは，列の順に効力を持ち，インスタンスはそれぞれの規定に順に従う。1つのステップでの2つの
切り替えは2回の改正であり，他の何を評価するよりも前に順に適用する。契約を持たないバージョンへの切り替えと，
現在のライフサイクルの状態がないバージョンへの切り替えは適用できず（F.6），処理系はそのステップを
拒否する。バージョンを保つインスタンスは，終わるか切り替わるまで，そのバージョンの期限，モニター，
`assume:` と `guarantee:` の項目，規範を持つ。

[F.10](./appendix-f-norms.md#f10-reference-implementation-status)のキー `amend` で契約を改正する
トレースは，バージョンが何を宣言していても，その観測でインスタンスを切り替える。処理系は，1つの実行に
両方を適用してはならない（MUST NOT）。バージョンがあるときは，インスタンスをいつ改正するかを経過規定が
決める。契約の経過規定が `keep` または `in_states:` を持つ `switch` であるファイルにこのキーを適用する
処理系は，改正を切り替えとして適用したことを警告すべきである（SHOULD）。処理系がキー `amend` のために
与えられる新しいバージョンのモデルは，実行のバージョンではない。実行のバージョンは別に与える。

### モード

`regimes:` を持つファイルの実行で，モードを指定するもの，または初期モードが契約を有効としない
ものには，バージョンを与えられない。`cadl` 0.3.33がそのような実行に改正を与えることを拒否したのと
同じく，処理系はこれを拒否する。2つの問いが決まっていないからである。1つは，バージョンが `regimes:` を
変え，それとともに有効な契約を変えうることである。この付録は，古いバージョンを保つインスタンスの
契約が，自身のバージョンの束縛と，効力を持つバージョンの束縛のどちらによって有効になるかを定めない。
もう1つは，この付録が効力の発生時点を実行の時間の上に置き，F.5が契約の期限を，契約が有効でない
あいだは止まる契約の時計で測ることである。この付録は，契約が有効でないあいだに効力を持つバージョンが
いつインスタンスに及ぶか，そのとき期限に対して過ぎた時間をどう数えるかを定めない。
それ以外の実行では，列のどのバージョンも，初期モードで契約を有効としなければならない（MUST）。
そのとき，実行は `regimes:` を持たないファイルの実行として判定する。

### メトリクスのスケジュールと測定

メトリクスの1回の測定は，`measure:` の区間 `[s, s + window)` にわたる。`s` はその始まりであり，実行の
タイムスタンプである。`window:` がないときは，時刻 `s` で測定する。測定は次のように判定する。

1. 宣言。目標，スケジュール，測定方法は，`s` で効力を持つバージョンにあるメトリクスのものである。
   メトリクスを宣言しないバージョンは，それを判定しない。
2. 目標。ある時点の目標はK.5が定める目標である。`from: { version: X }` の項目は，バージョンの列での
   `X` の効力の発生時点から適用する。時点を定められない項目（その形の時間の基準がない，または列にない
   バージョンを指す）があると，測定は判定しない。`s` の目標が区間の中のある時点の目標と異なるときは，
   1つの目標が定まらず，測定は判定しない。区間の中のある時点の目標は，そのとき効力を持つバージョンの
   目標である。区間の中で効力を持ち，メトリクスに別の目標を与えるバージョンや，メトリクスを宣言しない
   バージョンがあると，スケジュールの項目と同じく，測定は判定しない。こうして，新しいバージョンとして
   書いた変更と `schedule:` の項目として書いた変更を同じに判定する。
3. 値。`every:` がないときは，1回の実行が1つの値を与える。`every:` があるときは，1回の実行が，
   `s`，`s + every`，…，`s + window` より前の時点での式の値，つまり⌈`window` / `every`⌉個の値を与え，
   それを `aggregate:` でまとめる。`runs:` があるときは，測定はその回数の実行からなり，`across_runs:`
   でまとめる。ないときは1回である。偶数個の値の `median` は，中央の2つの値の平均である。式そのものは，
   動いているシステムが評価する。この付録は評価しない。
4. 比較。比較演算子（`<`，`<=`，`>`，`>=`，`==`，`!=`）に，数，期間，項からなる算術式が続く目標は，
   値と比べる。値を左のオペランドとする。期間は秒で表し，目標に期間を含むメトリクスの値も秒で表す。
   数でも期間でもない項（`count(orders)`）は，測定がその項に与える値を，その文字列によって取る。比較が
   成り立つとき測定は目標を満たし，成り立たないとき満たさない。ほかの形の目標，値のない項，0による
   除算があると，測定は判定せず，その理由を示す。

数はF.5と同じく正確に扱う。

### ツールが示せること

- `cadl verify` は1つのバージョンを判定する。その結果は，そのバージョンが効力を持つすべてのステップと，
  そのバージョンに従うすべてのインスタンスについて成り立つ。切り替わるインスタンスの性質は，どちらの
  バージョン単独の性質でもなく，`cadl verify` はそれを示さない。
- `cadl amend-diff` は，これまでどおり，あるバージョンから次のバージョンへの変更が宣言した改正の範囲に
  収まるかを示す。結果は，バージョンがいつ効力を持つかによらない。
- `cadl norms-check` は，`--version` があると，環境がすべてのインスタンスを任意の1つの観測で改正する
  ことを許す。これは，効力の発生時点を知らないまま `in_states:` のない `switch` を適用することにあたる。
  `cadl` 0.3.34から，契約の規定が `keep` または `in_states:` を持つ `switch` である後のバージョンを
  拒否する。そのモデルは，バージョンが保たせるインスタンスや，切り替わらない状態にあるインスタンスも
  改正するからである。`keep` では，各バージョンをそれぞれ検査する。
- `cadl norms-eval` とPythonターゲットの規範モニターはこの節をトレースに適用し（F.10），
  `cadl metrics-eval` は測定を判定する（K.9）。

### 生成するコード

ファイルは1つのバージョンであり，それから生成するコードはそのバージョンのコードである。ステップを
またいで契約インスタンスを保持しないコード（Python，Solidity，Regoの各ターゲットの契約の検査と，
付録Gの境界ポリシー）は，ホストがそれを実行するステップごとにバージョンを適用する。ホストは，各
ステップで効力を持つバージョンのコードを実行し，古いバージョンを保つインスタンスにはそのバージョンの
コードを実行することで，この節を適用する。契約インスタンスの状態を保持するコードは，インスタンスが
切り替わるときにそれを移さなければならない。

- Pythonターゲットの規範モニターは，実行のほかのバージョンのモデルを与えられると，この節を適用する
  （F.10）。Pythonターゲットは，バージョンの識別子，効力の発生時点，経過規定，パラメータの値，
  メトリクスのスケジュールを持つモジュール `version.py` も書く。どのバージョンが効力を持つかを決める
  ホストのためである。`metrics.py` の，`schedule:` を持つメトリクスの目標の検査は，時刻と時間の基準を
  受け取り，その時刻に効力を持つ目標と比べる。時刻または時間の基準がないときは判定を返さず（判定
  しない），目標をPythonの式にできない検査も同じである。
- RegoとSolidityの各ターゲットの規範モニター
  （[D.5](./appendix-d-codegen.md#d5-norms-monitors-of-the-opa-and-solidity-targets)）は改正を
  適用しない。`previous:` を持つバージョンでは，規範を持ち，動いているインスタンスが切り替わる契約
  （既定の `switch` を含む）にはモニターを生成しない。モニターはそのインスタンスを引き継げないから
  である。インスタンスがバージョンを保つ契約では，モニターはこのバージョンで始まるインスタンスを扱う。
- Unity C#ターゲットは，期限を持つライフサイクルのインスタンスを保持する。`previous:` を持ち，
  `lifecycle:` を持つ契約が動いているインスタンスを切り替えるバージョンを拒否する。
