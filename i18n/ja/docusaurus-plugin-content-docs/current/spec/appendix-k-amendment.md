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

[コースD](../handson/robot-town-tutorial.md)のロボットの街は，期ごとに自分の規則を改正する。`cadl`
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
バージョンを適用しない。複数のバージョンを実行するランタイムやシミュレータが，その宣言を読む（K.4）。

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
ステップ（既定値は1）までである。`unit:` は，数の単位を読み手に示す。時間は自分の単位を持つ。
`safety: true` は，モデルの安全上の条件がそのパラメータに依存することを示す（たとえば，
`safety_invariant:` を持つモード遷移の条件）。

パラメータの判断者は，パラメータ自身が `decided_by:`，`procedure:`，`quorum:`，`voters:` のいずれかを
持つときはそれらで定まり，持たないときは `amendment.layers` にあるその層の判断者である。
`procedure: vote` では，`voters:` のうち少なくとも `quorum:` が賛成したとき，`decided_by:` のアクターが
改正を採択する。`voters:` がないときは，投票者はモデルの外にある。このバージョンでは，層はこれ以上の
意味を持たない。層はパラメータをまとめ，既定の判断者を与える。

宣言が制限するのは改正である。動作中のシステムに対する制約ではない。モードの束縛（A.7.1）や後の
バージョンが，同じ場所に別の値を与えることがある。

### 場所

場所は，`sos:` からのキーをドットで区切った経路である。

- マッピングでは，区切られた各部分はキーである。
- シーケンスでは，各部分は `id:` がそれに等しい項目を選ぶ。`transitions:` の項目は `FROM->TO` と書いて選ぶ。
  数字だけの部分は，0から数えたその位置の項目を選ぶ。
- 最初の部分が `sos:` のキーでないときは，`C.alpha`，`C.beta`，`C.lambda` は契約 `C` の値を，
  `environment.X` は `context.environment` の項目 `X` を指す。これは
  [A.7.1](./appendix-a-syntax.md)のモードの束縛と同じ書き方である。

| 場所 | 値 |
| --- | --- |
| `contracts.ROAD_USE.lifecycle.transitions.release.deadline` | ライフサイクルの遷移 `release` の `deadline:` |
| `contracts.ROAD_USE.monitors.blocking_guard.rule` | モニターの `rule:` |
| `contracts.DELIVERY_SLA.guarantee.0` | `guarantee:` の最初の項目 |
| `contracts.JOB.norms.report.deadline` | 規範の `deadline:`（付録F） |
| `transitions.DISTRIBUTED->CENTRALIZED.condition` | モード遷移の条件 |
| `ROAD_USE.lambda`，`environment.bays` | `contracts.ROAD_USE.incentives.lambda` と `context.environment.bays` の短い形 |

場所がパラメータを持つとは，そこに書かれた値をリテラル（A.1）として読んだものが `value:` に等しいこと，
または式であれば，`value:` に等しいリテラルを含むか，パラメータの名前を名前として使う
（`hold_time <= hold_limit`）ことをいう。場所にある `value:` に等しいリテラルは，どれもパラメータの
出現である。このため，場所はファイルが許すかぎり狭くするのがよい（2つの項目が等しい値を持つときは，
`guarantee` ではなく `guarantee.0` と書く）。2つのリテラルは，同じ数または同じ時間を表すときに等しい。
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
- K-6. `decided_by:` と `voters:` の各項目は，ファイルのアクター（添字の有無を問わないid）またはアクターの
  役割を指す。`layers:` の層は `rule`，`contract`，`regulation` のいずれかであり，その判断者は
  `decided_by:` を持つ。`procedure: vote` は正の `quorum:` を持ち，`voters:` がすべて添字のない
  アクターであるときは，`quorum:` はその数を超えない。`quorum:` と `voters:` は `procedure: vote` と
  ともにだけ書く。どのパラメータも，自身の判断者か，その層の判断者を持つ。
- K-7. パラメータは，パラメータのあいだで一意な識別子を `id:` に持ち，一覧の中の層と，数または時間である
  `value:` を持つ。`unit:` は文字列，`safety:` は真偽値である。
- K-8. `min:`，`max:`，`step:` は `value:` と同じ種類である。`step:` は正であり，`min:` は `max:` より
  大きくない。`value:` は `[min, max]` にあり，`min:` と `step:` があるときは，`min:` との差がステップの
  整数倍である。`max_steps:` は正の整数であり，`step:` とともにだけ書く。
- K-9. `at:` は，互いに異なる場所の空でない一覧である。各場所は解決でき（K.3），`version:` と
  `amendment:` の中になく，パラメータを持つ。2つのパラメータが同じ場所（または一方が他方の中にある場所）に
  同じ値を持つときは，処理系は警告を出すべきである。一方の改正を他方の改正と区別できないからである。
- K-10. `decision:` は，`amendment.decisions` の判断を指す。
- K-11. `schedule:` は空でない項目の一覧であり，項目は1つの形の `from:` を持つ。`period:` と `at:` では
  増加する順に並び，`version:` では互いに異なるバージョンを指す。`target:` はスカラーである。
- K-12. `window:` と `every:` は正の時間である。`every:` は `window:` とともにだけ書き，`window:` より
  長くない。`aggregate:` と `across_runs:` は一覧の中の値であり，それぞれ `every:` と `runs:` とともに
  だけ書く。`runs:` は正の整数である。
- K-13. `amendment: 0.1` を宣言せずに `amendment:`，`schedule:`，`measure:` を用いるファイルには，警告を
  1つ出す。これらのキーは検査せず，IRにも出力しない。

処理系は，規範を持つ契約の動いているインスタンスが古いバージョンを保つとき，その旨を情報として報告する
べきである。その規範の `on_amendment:` は適用されない（K.4）。

## K.7 2つのバージョンの比較 {/* #k7-comparing-two-versions */}

モデルの2つのバージョンは，古いバージョンの宣言のもとで比較する。改正は，古いバージョンの宣言に基づいて
行われるからである。モデルの変更が宣言した改正の範囲に収まるとは，その変更が，宣言されたパラメータを
その場所で変えたものであり，それぞれが古い宣言の範囲内にあることをいう。

1. 古いバージョンのパラメータで値が変わるものについて，新しい値は同じ種類であり，古い `[min, max]` に
   あり，古い `min:` からのステップに乗り，古い値との差が `max_steps` × `step` 以下である。
2. 古いバージョンで，値が変わる各パラメータの各場所にある古い値の出現を新しい値に置き換えると，新しい
   バージョンが得られる。ただし，`version:`，`amendment:` と，規則ではない部分（`name:`，`description:`，
   `metrics:`，`verification:`，`codegen:`，`motivation:`）は除く。値はK.3のとおりに比べる。
   `60s` と `1min` は等しい。
3. 2つのバージョンが同じ形の効力の発生時点を持つときは，新しいバージョンの時点のほうが後である。
4. 変わる契約で，動いているインスタンスが切り替わるものについて，インスタンスが切り替わりうる状態
   （`in_states:`，それがなければ終端でないすべての状態）は，新しいバージョンの状態である（F.6）。

宣言そのものの変更（パラメータの層，判断者，範囲，ステップ，場所の変更，パラメータの追加）は，宣言の
範囲に含まれない。処理系はこれを報告するべきである。規則ではない部分の変更も報告するべきである。規範を
持つ契約で，動いているインスタンスが切り替わるものについては，処理系は，`cadl norms-diff` と同じように，
F.6がその規範をどう扱うかを報告するべきである。

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
      "measure": { "window_ms": 3600000, "runs": 5, "across_runs": "mean" },
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
  経過規定とともに挙げ，検出結果を示す。規則ではない部分の外の変更はエラー，規則ではない部分の変更と宣言の
  変更は警告である。古いバージョンが宣言を持たないときは警告を出す（このとき，規則の変更はどれも宣言で
  説明できない）。規範を持つ契約でインスタンスが切り替わるものには，その契約についての
  `cadl norms-diff` の検出結果を含める。インスタンスがバージョンを保つものには含めない。F.6が適用され
  ないからである。終了コードは，変更が宣言した改正の範囲に収まるとき0，収まらないとき，または新しい
  バージョンが `cadl check` を通らないとき1，ファイルがないとき，または古いバージョンが `cadl check` を
  通らないとき2である。

提供しないもの。システムの動作中にバージョン，効力の発生時点，経過規定を適用するツールはない。
`cadl norms-eval` と `cadl agents-run` は，トレースに `amend` があるところで，動いているすべての
インスタンスを改正する。これは，効力の発生時点での `switch` にあたる。インスタンスにバージョンを保たせる
ホストは，そのインスタンスについて `amend` を書かない。`cadl norms-check` のモデル（F.12）は，すべての
インスタンスを同じ観測で改正する。これは `switch` にあたる。スケジュールと測定方法は評価しない
（メトリクスを評価するツールはない）。判断の記録は開かない。場所は，ドットを含むキーを指せない。

## K.10 後方互換性 {/* #k10-backward-compatibility */}

この拡張はキーを追加するだけである。そのキーをどれも用いないファイルは，`cadl check`，`cadl sim-ir`，
`cadl verify` について，`cadl` 0.3.31と同じ結果になる。`cadl` 0.3.32について，`cadl` リポジトリの例と
テストの78のファイルで0.3.31と比べた。また，テストは，キーを用いない同梱の例がIRへの追加も拡張の診断も
受けないことを確かめる。拡張を宣言しないファイルにあるこの拡張のキーには，警告を1つ出し（K-13），
それ以外では無視する。これは，言語のあるバージョンに含まれないキーについてA.2が求める扱いである。
拡張を宣言したファイルでも，IRのコアの `metrics` の項目は変わらない。
