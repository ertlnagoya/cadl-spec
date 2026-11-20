---
sidebar_position: 11
title: "付録A. 構文リファレンス（EBNF）"
description: "CADL v0.3のリファレンス文法をEBNFで示す。文書の構造，式の部分言語，予約語，リファレンス実装の状況を扱う。"
---

# 付録A. 構文リファレンス（EBNF）

CADLファイルは**YAML 1.2文書** [[Ben-Kiki+, 2021]](./appendix-b-references.md) である。本付録は CADL v0.3 のリファレンス文法を
2つの部分に分けて示す。文書の*構造*（A.2〜A.9）は，YAMLのマッピングと
シーケンスの上のEBNFとして記述する。*式の部分言語*（A.1，A.10）は，
個々のYAML文字列スカラーの中に書かれる。

[第5章](./05-language-spec.md)と本付録は同じ構文を記述する。具象構文については本付録が規範的であり，
第5章は説明のための記述である。リファレンス実装
（[`cadl`](https://github.com/ertlnagoya/cadl)）は，この構文をそのまま
受理すべきものである。`cadl` 0.3における既知の相違は
[A.12](#a12-reference-implementation-status-v03)に示す。

この文法を試すには，リファレンス実装をインストールし（[クイックスタートの経路 B](../quickstart/index.md#path-b)を参照），
`cadl parse` または `cadl check` を実行する。実行できるファイルは，
[cadlリポジトリ](https://github.com/ertlnagoya/cadl)の `examples/` ディレクトリにある。

**記法。** 文法にはISO/IEC 14977のEBNF [[ISO/IEC 14977:1996]](./appendix-b-references.md) を用い，次の規約を置く。

- `"name:"` のようにコロンで終わる終端記号は，YAMLマッピングのキーであり，
  その後に値が続く。1つのマッピングの中の項目は任意の順序で書いてよく，
  各項目は高々1回だけ現れる。
- `{ "-" , x }` は，`x` を要素とするYAMLシーケンスである。ブロック形式と
  フロー形式（`[a, b]`）は等価である。
- 非終端記号 `k` を用いた `k , ":" , v` は，キーを記述者が選ぶマッピングである。
- `text` は任意のYAML文字列スカラー，`number` は任意のYAML整数または
  浮動小数点数，`scalar` は任意のYAMLスカラーである。これらの内容は
  それ以上解釈しない。
- `any_char` は任意の1文字である。`string` の規則（A.1）はここから二重引用符を除くので，
  文字列は次の `"` で終わる。
- `(* string *)` と注記した生成規則は，1つのYAML文字列スカラーの内容を記述する。

インデント，コメント，引用符，ブロック形式とフロー形式の選択はYAMLの規定に従い，
文法には示さない。`[`，`]`，`*`，`->`，`": "` を含むスカラー（たとえば
`"TAXI[*]"` のようなアクター参照や `"A -> B : msg"` のようなステップ）は，
引用符で囲むことが望ましい。フローシーケンスの中では，YAMLが別の意味に
解釈するため，必ず引用符で囲まなければならない。`sharing_entry`（A.4）は，
どこに書く場合も，引用符で囲んだ文字列でなければならない。

本付録が定義しないキーは CADL v0.3 の一部ではない。処理系は，そのようなキーを
理由にファイルを拒否してはならない。リファレンス実装はそれらを無視する。

本文法は[5.1.1節](./05-language-spec.md)の設計レベルと検証レベルを対象とする。概要レベルの記述は，
AIによる精緻化のための非形式的な入力であり，本文法に従う必要はない。

## A.1 字句規則 {/* #a1-lexical-rules */}

これらの規則はスカラーの内部に適用する。

```ebnf
letter          = "A" | … | "Z" | "a" | … | "z" ;
digit           = "0" | … | "9" ;
identifier      = ( letter | "_" ) , { letter | digit | "_" } ;
hyphen_name     = identifier , { "-" , name_part } ;
name_part       = ( letter | digit | "_" ) , { letter | digit | "_" } ;
actor_ref       = identifier , [ "[" , index , "]" ] ;   (* string *)
index           = "*" | range_expr | int_literal | identifier ;
range_expr      = int_literal , ".." , ( int_literal | identifier ) ;
string          = '"' , { any_char - '"' } , '"' ;
int_literal     = digit , { digit } ;
float_literal   = int_literal , "." , [ int_literal ] , [ exponent ]
                | "." , int_literal , [ exponent ]
                | int_literal , exponent ;
exponent        = ( "e" | "E" ) , [ "+" | "-" ] , int_literal ;
bool_literal    = "true" | "false" ;
duration_lit    = int_literal , ( "ms" | "s" | "min" | "h" ) ;
literal         = string | int_literal | float_literal
                | bool_literal | duration_lit ;
```

`duration_lit` は，整数の後に単位を続けたものである。`2.5s` は期間に当たらないので，同じ時間は `2500ms` と書く。
`string` を区切るのは二重引用符だけであり，`'k'` は文字列でない。

`identifier` は，アクター，契約，プロトコル，運用モード（regime），メトリクスの名前に用いる。
`hyphen_name` は，拡張の名前とコード生成ターゲットの名前（たとえば `sos-dsl`，
`unity-csharp`）にだけ用いる。数値リテラルは符号を持たない。
識別子はASCIIに限る。文字列とコメントには任意のUnicode文字を使用できる。これが要求NFR-7（[第4章](./04-requirements.md)）の求める内容である。`cadl` 0.3.9からは，リファレンス実装は，ASCIIの規則に違反するidや運用モードの名前をエラーとして報告する（[A.12](#a12-reference-implementation-status-v03)）。

## A.2 トップレベル構造 {/* #a2-top-level-structure */}

```ebnf
cadl_file   = "sos:" , sos_body ;
sos_body    = "name:" , text ,
              [ "type:"         , sos_type ] ,
              [ "version:"      , scalar ] ,
              [ "description:"  , text ] ,
              [ "extensions:"   , { "-" , extension_decl } ] ,
              [ "context:"      , context_block ] ,
              [ "actors:"       , { "-" , actor_def } ] ,
              [ "contracts:"    , { "-" , contract_def } ] ,
              [ "protocols:"    , { "-" , protocol_def } ] ,
              [ "algorithms:"   , { algorithm_def } ] ,
              [ "transitions:"  , { "-" , transition_def } ] ,
              [ "regimes:"      , regimes_block ] ,       (* A.7.1 *)
              [ "metrics:"      , { "-" , metric_def } ] ,
              [ "verification:" , { "-" , verify_def } ] ,
              [ "codegen:"      , { "-" , codegen_def } ] ,
              [ "motivation:"   , motivation_block ] ,
              [ "model:"        , model_block ] ,          (* 付録H *)
              [ "amendment:"    , amendment_block ] ;      (* 付録K *)
sos_type    = "Directed" | "Acknowledged" | "Collaborative" | "Virtual" ;
extension_decl = hyphen_name , ":" , scalar ;
```

1つのファイルは1つのSoS定義を含む。`version:` には，慣例として `"1.0.0"` のような
セマンティックバージョンの文字列を書く。

**拡張点。** `extensions:` は，ファイルが依存する言語拡張を，名前とバージョンの組
（たとえば `- sos-dsl: 0.1`）として宣言する。次の8つの拡張を定義している。
最後のもの以外は，宣言できる名前を持つ。

- SoS-DSL拡張（[付録E](./appendix-e-sos-dsl.md)）。名前 `sos-dsl`，バージョン `0.1` として
  宣言する。`contract_def`（A.4）にキー `lifecycle:` と `monitors:` を追加する。
- 規範拡張（[付録F](./appendix-f-norms.md)）。名前 `norms`，バージョン `0.1` として宣言する。
  `contract_def`（A.4）にキー `norms:` と `counts_as:` を，契約の述語に有界の時相演算子を追加する。
  この拡張を用いるファイルは，宣言しなければならない。
- エージェント統治拡張（[付録G](./appendix-g-agents.md)）。名前 `agents`，バージョン `0.1` として宣言する。
  `norms` を必要とし，`actor_def`（A.3）にキー `agent:` を，`contract_def`（A.4）にキー `enforcement:` と
  `delegations:` を，禁止に `on_denied:` を追加する。
- 確率モデル拡張（[付録H](./appendix-h-stochastic.md)）。名前 `stochastic`，バージョン `0.1` として宣言する。
  `sos_body` にキー `model:` を追加する。
- 戦略モデル拡張（[付録I](./appendix-i-games.md)）。名前 `games`，バージョン `0.1` として宣言する。
  `stochastic` を必要とし，`model:` にプレイヤー，プロファイル，利得，均衡問い合わせを追加する。
- 根拠付け拡張（[付録J](./appendix-j-grounding.md)）。名前 `grounding`，バージョン `0.1` として宣言する。
  `norms` を必要とし，`contract_def`（A.4）にキー `grounding:` を，規範にキー `shares:` と
  `on_fulfilment:` を，その `on_violation:` に `magnitude:` を追加する。`games` とともに用いるときは，
  利得の項にキー `sanction_of:` と `reward_of:` を追加する。
- 改正拡張（[付録K](./appendix-k-amendment.md)）。名前 `amendment`，バージョン `0.1` として宣言する。
  `sos_body` にキー `amendment:`（改正できるパラメータ，バージョンとその経過規定，判断の記録）を，
  `metric_def`（A.3）にキー `schedule:` と `measure:` を追加する。
- 動機拡張（[付録C](./appendix-c-motivation.md)）。`motivation_block` を定義する。
  v0.3では `extensions:` に書く名前を持たず，`motivation:` ブロックを書くだけで用いる。

## A.3 コンテキスト・アクター・メトリクス {/* #a3-context-actors-metrics */}

```ebnf
context_block  = [ "environment:" , { identifier , ":" , scalar } ] ,
                 [ "assumptions:" , { "-" , text } ] ;

actor_def      = "id:"   , actor_ref ,
                 "role:" , text ,
                 [ "autonomy:"     , autonomy_level ] ,
                 [ "capabilities:" , { "-" , text } ] ,
                 [ "interface:"    , interface_def ] ,
                 [ "agent:"        , agent_binding ] ;   (* 付録G *)
autonomy_level = "low" | "medium" | "high" ;
interface_def  = [ "input:"  , { "-" , text } ] ,
                 [ "output:" , { "-" , text } ] ;

metric_def     = "id:" , identifier ,
                 [ "formula:" , predicate ] ,          (* string *)
                 [ "target:"  , scalar ] ,
                 [ "schedule:" , { "-" , schedule_entry } ] ,  (* 付録K *)
                 [ "measure:"  , measure_def ] ;               (* 付録K *)
```

`autonomy:` の既定値は `medium` である。`actor_def` の `id:` の添字は，通常は範囲
（`"ROBOT[1..N]"`）であり，パラメータ化されたアクターの集合を宣言する。
`range_expr` の上限は整数または識別子である。`N` のような識別子は記号的な大きさであり，
v0.3にはこれを値に束縛する構文がない（リファレンス実装での扱いは
[A.12](#a12-reference-implementation-status-v03)を参照）。
`environment:` の値が文字列でないときはリテラル（A.1）として読み，
文字列のときはそのまま保持する。

## A.4 コントラクト（制度層） {/* #a4-contracts-institution-layer */}

制度層は，ここで定義する `contracts:` と，`actors:`（A.3）および `transitions:`（A.7）からなる。

```ebnf
contract_def      = "id:"      , identifier ,
                    "parties:" , { "-" , actor_ref } ,
                    [ "assume:"           , { "-" , predicate } ] ,
                    [ "guarantee:"        , { "-" , predicate } ] ,
                    [ "authority:"        , authority_block ] ,
                    [ "information:"      , information_block ] ,
                    [ "responsibilities:" , { actor_ref , ":" , { "-" , text } } ] ,
                    [ "incentives:"       , incentive_block ] ,
                    [ "violation:"        , violation_block ] ,
                    [ "duration:"         , scalar ] ,
                    [ "lifecycle:"        , lifecycle_block ] ,       (* 付録E *)
                    [ "monitors:"         , { "-" , monitor_def } ] , (* 付録E *)
                    [ "norms:"            , { "-" , norm_def } ] ,    (* 付録F *)
                    [ "counts_as:"        , { "-" , counts_as_def } ] , (* 付録F *)
                    [ "enforcement:"      , enforcement_block ] ,     (* 付録G *)
                    [ "delegations:"      , { "-" , delegation_def } ] , (* 付録G *)
                    [ "grounding:"        , grounding_block ] ;       (* 付録J *)

authority_block   = [ "decision_scope:"  , text ] ,
                    [ "decision_holder:" , actor_ref ] ,
                    [ "beta:"            , number ] ,
                    [ "mode:"            , text ] ;

information_block = [ "alpha:"   , number ] ,
                    [ "views:"   , { actor_ref , ":" , text } ] ,
                    [ "sharing:" , { "-" , sharing_entry } ] ;
sharing_entry     = actor_ref , "->" , actor_ref , ":" , identifier ;  (* string *)

incentive_block   = [ "type:"   , text ] ,
                    [ "lambda:" , number ] ,
                    [ "rules:"  , { "-" , text } ] ;

violation_block   = [ "detect:"     , text ] ,
                    [ "action:"     , text ] ,
                    [ "escalation:" , text ] ;
```

`assume:` と `guarantee:` の各要素は，`predicate`（A.10）を保持する文字列である。
`alpha`，`beta`，`lambda` は `[0, 1]` の範囲になければならない。`parties:` は
宣言済みのアクターを少なくとも1つ挙げなければならず，契約の中のアクター参照は
すべて `actors:` で宣言されたアクターを指さなければならない。`duration:` は
`indefinite`，`duration_lit`，またはイベントの記述のいずれかである。
`sharing_entry` は，引用符で囲んだ文字列として書かなければならない
（`- "TAXI[*] -> CENTRAL : position"`）。引用符がないと，YAMLはこれを文字列ではなく，
項目が1つのマッピングとして読む。

## A.5 プロトコル {/* #a5-protocols */}

```ebnf
protocol_def     = "id:"      , identifier ,
                   "trigger:" , text ,
                   [ "precondition:"     , text ] ,
                   "steps:"   , { "-" , step } ,
                   [ "timing:"           , { identifier , ":" , scalar } ] ,
                   [ "fallback:"         , { identifier , ":" , text } ] ,
                   [ "rollback:"         , rollback_block ] ,
                   [ "postcondition:"    , text ] ,
                   [ "safety_invariant:" , text ] ;
rollback_block   = [ "condition:" , text ] ,
                   [ "action:"    , text ] ;

step             = message_step | compute_step | conditional_step
                 | parallel_step | barrier_step ;
message_step     = actor_ref , "->" , actor_ref , ":" , step_expr ;
compute_step     = actor_ref , ":" , step_expr ;
conditional_step = "if" , predicate , ":" , { "-" , step } ,
                   [ "else:" , { "-" , step } ] ;
parallel_step    = "parallel:" , { "-" , step } ;
barrier_step     = "barrier:" , predicate ;
step_expr        = function_call | identifier ;
```

`message_step` と `compute_step` は，シーケンスの1要素である。引用符で囲んだ
文字列（`- "A -> B : msg(x)"`，推奨）として書いても，引用符なしで書いてもよい。
後者の場合，YAMLはこれを項目が1つのマッピングとして読むが，両者は等価である。
`conditional_step`，`parallel_step`，`barrier_step` は，キーが `if <predicate>`，
`parallel`，`barrier` のマッピングである。`timing:` の代表的なキーは
`max_response`，`max_total`，`checkpoint_interval` であり，`fallback:` の
代表的なキーは `on_timeout` と `on_failure` である。

## A.6 アルゴリズム {/* #a6-algorithms */}

```ebnf
algorithm_def = identifier , ":" , algorithm_body ;
algorithm_body = [ "central:" , text ] ,
                 [ "local:"   , text ] ;
```

`algorithms:` は，機能の名前（たとえば `pathfinding`）から，中央側とローカル側で
用いるアルゴリズムへのマッピングである。

## A.7 遷移 {/* #a7-transitions */}

```ebnf
transition_def = "from:" , identifier ,
                 "to:"   , identifier ,
                 [ "condition:"        , predicate ] ,     (* string *)
                 [ "protocol:"         , identifier ] ,
                 [ "safety_invariant:" , predicate ] ;     (* string *)
```

`from:` と `to:` は運用モードの名前である。運用モードは遷移の中で使うことで導入され，
別個の宣言はない。`protocol:` は `protocols:` で宣言したプロトコルを
指すことが望ましい。

### A.7.1 モードへの束縛 {/* #a71-regime-bindings */}

`cadl` 0.3.32から，ブロック `regimes:` で，運用モードごとに，宣言されたパラメータの値と
有効な契約を指定できる。

```ebnf
regimes_block   = { identifier , ":" , regime_binding } ;
regime_binding  = [ "parameters:" , { param_ref , ":" , scalar } ] ,
                  [ "contracts:"  , contracts_in_force ] ;
param_ref       = identifier , "." , ( "alpha" | "beta" | "lambda" )
                | "environment" , "." , identifier ;
contracts_in_force = "active:"    , { "-" , identifier }
                   | "suspended:" , { "-" , identifier } ;
```

```yaml
  transitions:
    - { from: DISTRIBUTED, to: CENTRALIZED, condition: "orders_in_window < 22",
        safety_invariant: "robots_on_road == 0" }
    - { from: CENTRALIZED, to: DISTRIBUTED, condition: "orders_in_window >= 26" }

  regimes:
    DISTRIBUTED:
      contracts: { suspended: [BAY_ASSIGNMENT] }
    CENTRALIZED:
      parameters:
        ROUTING.beta: 0.9           # 契約 ROUTING の authority.beta
        environment.bays: 3         # context.environment のエントリ bays
      contracts: { active: [ROUTING, BAY_ASSIGNMENT] }
```

`param_ref` は，ファイルが宣言している値を指す。`C.alpha`，`C.beta`，`C.lambda` は，
`id: C` の契約の `information.alpha`，`authority.beta`，`incentives.lambda` であり，
`environment.X` は `context.environment` のエントリ `X` である。これらは，確率モデル拡張の
パラメータのソースと同じである（[付録HのH.3節](./appendix-h-stochastic.md)）。

**意味。** モード `R` でのパラメータの値は，`R` がそれに束縛する値があればその値，なければ
宣言された値である。契約がモード `R` で有効であるのは，`R` が `active:` を与えてその契約を挙げて
いる場合，`R` が `suspended:` を与えてその契約を挙げていない場合，`R` がどちらも与えていない場合
である。エントリのないモードでは，宣言された値がすべてそのまま使われ，すべての契約が有効である。
`regimes:` のないファイルは，どのモードもエントリを持たないファイルと同じに扱う。モードを
持たない（`transitions:` のない）ファイルでは，空の `regimes:` ブロックがあっても，すべての
契約が常に有効である。宣言された値そのものは変わらず，契約はそこに書かれた数を保持する。モード `R` から `R'` への遷移は，`R` の
束縛を `R'` の束縛に置き換える。置き換わる時点は，次の「実行」で定める。

**実行。** `cadl` 0.3.33から，本付録は，システムの実行の各ステップがどのモードにあるかを
定める。この規則は，`regimes:` ブロックの有無にかかわらず，`transitions:` を持つすべての
ファイルに適用する。束縛（パラメータの値と有効な契約）は，ブロックを持つファイルにだけ適用し，
ブロックのないファイルでは，すべての契約が各ステップで有効である。ステップは，実行環境が契約を評価する単位である。生成されるPythonの実行環境の1周期，
生成されるSolidityの `runMonitorCycle()` の1回の呼び出し，生成されるRegoのポリシーの1回の
判定，規範拡張のトレースの1つの観測（[付録F](./appendix-f-norms.md)のF.5節）がこれにあたる。

1. 各ステップでは，ちょうど1つのモードが現在のモードである。
2. 実行は初期モードで始まる。初期モードは，`transitions:` の順で最初の `from:` のうち，
   どの遷移の `to:` でもないものであり，そのようなものがなければ最初の遷移の `from:` である。
   これは `cadl regime-map` のモード図の初期状態と同じである。ホストは，実行を別のモードで
   始めてもよい。ホストがモードを名指すまでは，実行は初期モードにある。
3. ステップの評価が終わった後に，現在のモードからの遷移を `transitions:` の順に調べ，
   `condition:` が成り立つ最初の遷移を選ぶ。評価できない条件（与えられていない値を読む条件）は
   成り立たないものとし，実行は続く。その遷移の `safety_invariant:` はこのときに検査する。
   それが成り立てば遷移をとる。成り立たないとき，または評価できないときは遷移をとらず，モードは
   変わらず，処理系はとらなかった遷移を報告する。不変条件を検査せずに遷移をとることはない。
   1つのステップでとる遷移は高々1つである。遷移の `protocol:` は，当事者が遷移をどう進めるかを
   示す。そのメッセージは送られたステップに属し，モードの変更を遅らせない。
4. 束縛はモードとともに，2つのステップの間で変わる。ステップの評価（`assume:` と `guarantee:` の
   項目，モニター，規範，ポリシー，生成されたコードが読むパラメータの値）は，すべてそのステップの
   現在のモードの束縛を使い，ほかのモードの束縛は使わない。したがって，2つの契約が同じステップで
   ともに有効になるのは，両方を有効とするモードがある場合に限られる。
5. ステップで有効でない契約は，そのステップでは評価しない。規範拡張については，契約が有効で
   ないあいだに契約インスタンスが何を観測するかを，F.5節の「有効でない契約」で定める。規範
   インスタンスは状態を保ち，期限と時間演算子の区間は進まず，そのあいだに起きたことは数えない。

改正拡張のバージョンを持つ実行は，これらの規則を効力を持つバージョンと組み合わせる。`cadl` 0.3.35
からは，ステップの終わりに選んだモードの遷移を，次のステップで効力を持つバージョンより先に行い，
有効な契約は効力を持つバージョンの束縛で決まる
（[付録KのK.11の「バージョンとモード」](./appendix-k-amendment.md#versions-and-regimes)）。

述語はパラメータを名指しできない（A.10）。そのため，モードのパラメータの値が変えるのは，
その値を書き出すコード（SolidityとRegoのターゲットの制度パラメータ，生成されるPythonの実行環境の
パラメータ）と，各モードをそれぞれ1つの設計として評価する付録Hと付録Iのモデルだけである。

生成されるRegoのポリシーのように自身では遷移をとらない実行環境には，ホストが現在のモードを
与える。その場合，遷移をとり，その不変条件を検査するのは，2と3に従うホストである。
`transitions:` を持つファイルの空のブロック（`regimes: {}`）は何も束縛しないが，そのファイルを
束縛を持つファイルにする。生成されるコードはモードを読む（たとえば，Regoの契約のポリシーは
`input.regime` を必要とする）。

**静的規則。** 処理系は，次の違反をエラーとして報告しなければならない。

- **R-1** `regimes:` のキーは，ファイルのモード，すなわち `transitions:` の `from:` または
  `to:` で用いる名前である。`transitions:` のないファイルはモードを持たないので，エントリも
  持てない。YAML 1.1 が真偽値またはnullとして読むモード名（`yes`，`ON`，`null`）は，
  引用符で囲まなければならない。
- **R-2** エントリは，`parameters:` と `contracts:` 以外のキーを持たない。
- **R-3** `param_ref` は，宣言された契約のうちその値を書いているものの `alpha`，`beta`，
  `lambda`，または `context.environment` のエントリを指す。
- **R-4** `C.alpha`，`C.beta`，`C.lambda` の値は `[0, 1]` の数である。`environment.X` の
  値はエントリと同じ型を持つ。真偽値には真偽値，整数には整数，数には整数または数，文字列には
  文字列である。スカラーでないエントリは束縛できない。
- **R-5** `contracts:` は `active:` と `suspended:` のちょうど一方を持ち，その列は宣言された
  契約を，それぞれ高々1回挙げる。
- **R-6** 1つのモードは，同じパラメータを高々1回束縛する（`ROUTING.beta` と
  `"ROUTING . beta"` は同じパラメータである）。また，そのモードで有効でない契約の `alpha`，
  `beta`，`lambda` を束縛しない。
- **R-7** `stochastic: 0.1` を宣言したファイルでは，モードがソースに束縛した値は，その
  `from:` を持つすべてのモデルパラメータの，そのモードの設計での値である。`model.regimes:` は，
  同じモードでそのパラメータに同じ値を与えてもよいが，別の値を与えてはならない（H.6）。
  R-1からR-6に違反する `regimes:` ブロックがあると，モデルの設計は定まらない。

**IR。** `cadl sim-ir` は，3層IR（モジュール `cadl.sim.ir`）に次の2つを加える。

- `transitions` の各要素は，遷移が `safety_invariant` を持つとき，その述語を書かれたとおりに
  持つ（`condition` と同じ扱い）。持たないときは，キーそのものがない。
- `regimes:` を持つファイルでは，トップレベルのキー `regimes` が加わる。これは，`transitions:`
  に最初に現れる順に，モードごとに1つの要素を持つ列である。

```json
"regimes": [
  { "name": "DISTRIBUTED", "parameters": {},
    "active_contracts": ["ROUTING", "FREE_PASSAGE"],
    "suspended_contracts": ["BAY_ASSIGNMENT"] },
  { "name": "CENTRALIZED",
    "parameters": { "ROUTING.beta": 0.9, "environment.bays": 3 },
    "active_contracts": ["ROUTING", "BAY_ASSIGNMENT"],
    "suspended_contracts": ["FREE_PASSAGE"] }
]
```

`parameters` は，モードが束縛する値を，スペースを含まない `param_ref` をキーとして持つ。そこにない
パラメータは宣言された値を持ち，その値はIRの契約（`governance`）または `environment` にある。
2つの契約の列は，すべての契約を宣言の順に挙げる。ブロックがR-1からR-6のいずれかに違反する
とき `regimes` は `null` である。`model.regimes:` との矛盾（R-7）は確率モデルだけに関わり，
そのときも `regimes` は出力される。ブロックのないファイルにはこのキーがなく，そのIRは，
`safety_invariant` を除いて `cadl` 0.3.31と同じである。

## A.8 検証ブロック {/* #a8-verification-block */}

```ebnf
verify_def    = "id:"   , identifier ,
                "type:" , text ,
                [ "target:"   , verify_target ] ,
                [ "property:" , text ] ,
                [ "method:"   , verify_method ] ,
                [ "expr:"     , predicate ] ,              (* string *)
                [ "bound:"    , int_literal ] ;
verify_target = identifier
              | identifier , "->" , identifier ;           (* FROM->TO *)
verify_method = "smt" | "model_check" | "simulation" | "proof" ;
```

`type:` は性質の種類を表し，たとえば `consistency`，`deadlock`，`safety`，
`liveness` を書く。`target:` は対象の契約，プロトコル，または遷移の名前である。すなわち，契約または
プロトコルの `id`，運用モードの名前，または2つの運用モードの間の遷移を表す `FROM->TO` を書く。
`method:` の既定値は `smt` である。宣言された手法を実装していない処理系は，
その項目を報告せずに読み飛ばすのではなく `not_supported` として報告しなければならず，
未知の手法はエラーとして報告しなければならない。宣言されたものを何も指さない `target:` は，
エラーとして報告することが望ましい。

## A.9 コード生成ブロック {/* #a9-codegen-block */}

```ebnf
codegen_def = [ "target:"   , hyphen_name ] ,
              [ "output:"   , text ] ,
              [ "mappings:" , { identifier , ":" , text } ] ;
```

`target:` の既定値は `python` である。ターゲットの名前は
[付録D](./appendix-d-codegen.md)に一覧する。`output:` は出力先のパスであり，
`mappings:` はターゲットに固有の名前の対応を生成器に渡す。

## A.10 式 {/* #a10-expressions */}

`predicate` は，1つのYAML文字列スカラーの中に書く。

```ebnf
predicate        = or_expr ;
or_expr          = and_expr , { "OR" , and_expr } ;
and_expr         = not_expr , { "AND" , not_expr } ;
not_expr         = "NOT" , not_expr
                 | comparison ;
comparison       = arith_expr , [ comp_op , arith_expr ]
                 | quantified_expr ;
comp_op          = "==" | "!=" | "<=" | ">=" | "<" | ">" ;
quantified_expr  = ( "for all" | "exists" ) , identifier , "in" ,
                   arith_expr , ":" , predicate ;
arith_expr       = term , { ( "+" | "-" ) , term } ;
term             = factor , { ( "*" | "/" ) , factor } ;
factor           = "(" , predicate , ")"
                 | "-" , factor
                 | function_call
                 | member_access
                 | literal
                 | indexed_ref ;
function_call    = identifier , "(" , [ arg_list ] , ")" ;
arg_list         = arg , { "," , arg } ;
arg              = predicate | comprehension ;
comprehension    = predicate , "for" , identifier , "in" ,
                   ( range_expr | arith_expr ) ;
member_access    = indexed_ref , "." , identifier , { "." , identifier } ;
indexed_ref      = identifier ,
                   [ "[" , ( "*" | range_expr | arith_expr ) , "]" ] ;
```

演算子の結合の強さは，弱いものから順に `OR`，`AND`，`NOT`，比較，`+` `-`，
`*` `/`，単項の `-` である。数値リテラルの前の単項 `-` は負の数を表す
（`permit_state == -2`）。それ以外の因子の前では，`-x` の値は `0 - x` の値と同じである。優先順位が等しい二項演算子は左結合である。比較は結合的でない
（`a < b < c` は述語ではない）。量化子の有効範囲は，右方向へ可能な限り広くとる。
トークンの間の空白は無視する。

`comprehension` は集約関数の引数であり，束縛された識別子の値ごとに，その `predicate` を
1回評価する。たとえば `sum(ROBOT[i].goal_count for i in 1..N)` や
`sum(r.load for r in ROBOT[*])` である。

この付録は，量化子と内包表記の形を定めるが，集約関数の集合や，観測の上でのこれらの式の値は
定めない。規範拡張は，その動的意味論のためにこれらを定める。量化子と内包表記の定義域
（記号の境界を持ちうるアクターの集合，または範囲），束縛された識別子の意味，集約関数
`sum`，`count`，`min`，`max`，`avg`，およびメンバーがすべてはわかっていない定義域の上での
3値の値である（[付録FのF.5節](./appendix-f-norms.md)の「限量子と集約」）。
`ROBOT[*].battery > 10` のように定義域の外で `*` または範囲を持つ `indexed_ref` は，
規範拡張が限量子または内包表記に書き換える略記である（[付録FのF.5節](./appendix-f-norms.md)の
「ワイルドカード参照と範囲参照」）。それを含む最小の比較がすべてのメンバーについて成り立つことを表し，
集約の引数の中ではメンバーを動く。

`assume:` または `guarantee:` の要素がこの文法に従わなくても，構文エラーには
ならない。その要素は*不透明な述語*として保持され，処理系はそれを変更せずに
引き渡し，形式検証の対象から除く。これにより，設計レベルでは自然言語による
条件を書くことができる。A.5のステップの式と条件についても同様である。

## A.11 予約語 {/* #a11-reserved-keywords */}

式の部分言語のキーワード。これらを識別子として用いてはならない。

```
AND    OR    NOT    true    false    for all    exists    in
```

単独の `for`（内包表記を導入する）と `all` は予約語ではない。`IN`（大文字。モニターの
`rule` の中での集合への所属，[付録E](./appendix-e-sos-dsl.md)）と `in`（小文字。量化子と
内包表記の定義域）は，別のキーワードである。

構造のキー。認識されるブロックごとに示す。

| ブロック | キー |
|---|---|
| ファイル | `sos` |
| `sos` | `name` `type` `version` `description` `extensions` `context` `actors` `contracts` `protocols` `algorithms` `transitions` `regimes` `metrics` `verification` `codegen` `motivation` `model` |
| `context` | `environment` `assumptions` |
| アクター | `id` `role` `autonomy` `capabilities` `interface`（`input` `output`） |
| 契約 | `id` `parties` `assume` `guarantee` `authority` `information` `responsibilities` `incentives` `violation` `duration` `lifecycle` `monitors` `norms` `counts_as` `enforcement` `delegations` `grounding` |
| 規範（付録F） | `id` `kind` `bearer` `counterparty` `trigger` `until` `content` `deadline` `on_violation`（`severity` `sanction` `reparation` `transition`） `effects`（`activate` `suspend` `resume` `discharge`） `on_amendment`（`transform`） |
| counts-as規則（付録F） | `when` `creates` `if` |
| エージェント統治（付録G） | アクターの `agent`（`kind` `protocol` `tools`），契約の `enforcement`（`default` `point`）と `delegations`（`norm` `to` `grant` `revoke` `max_depth` `until`），禁止の `on_denied`（`escalate_to` `timeout` `fallback` `notify`） |
| 確率モデル（付録H） | `model`（`kind` `parameters` `variables` `commands` `labels` `regimes` `rewards` `properties` `regime_maps`）。各要素のキーはH.2に示す |
| 戦略モデル（付録I） | `model`（`players` `profiles` `compliance` `payoffs` `equilibria`），コマンドの `owner`，性質とモードマップの `profile`。各要素のキーはI.2に示す |
| 改正（付録K） | `sos` の `amendment`（`previous` `effective` `transitional` `decisions` `layers` `parameters`），メトリクスの `schedule`（`from` `target` `decision`），`measure`（`window` `every` `aggregate` `runs` `across_runs` `description` `decision`）。各項目のキーはK.3からK.5に示す |
| 根拠付け（付録J） | 契約の `grounding`（`items` `tolerance`），規範の `shares`，`on_fulfilment`（`reward` `magnitude`），`on_violation`（`magnitude`），利得の項の `sanction_of` `reward_of` |
| `authority` | `decision_scope` `decision_holder` `beta` `mode` |
| `information` | `alpha` `views` `sharing` |
| `incentives` | `type` `lambda` `rules` |
| `violation` | `detect` `action` `escalation` |
| プロトコル | `id` `trigger` `precondition` `steps` `timing` `fallback` `rollback`（`condition` `action`） `postcondition` `safety_invariant` |
| ステップ | `if` `else` `parallel` `barrier` |
| アルゴリズム | `central` `local` |
| 遷移 | `from` `to` `condition` `protocol` `safety_invariant` |
| モードへの束縛（A.7.1） | `parameters` `contracts`（`active` `suspended`） |
| メトリクス | `id` `formula` `target` |
| 検証 | `id` `type` `target` `property` `method` `expr` `bound` |
| コード生成 | `target` `output` `mappings` |

列挙値: `Directed` `Acknowledged` `Collaborative` `Virtual`（SoSの型），
`low` `medium` `high`（自律度），`smt` `model_check` `simulation` `proof`
（検証手法），`ms` `s` `min` `h`（時間の単位）。拡張のキーと値は
[付録C](./appendix-c-motivation.md)，[付録E](./appendix-e-sos-dsl.md)，[付録F](./appendix-f-norms.md)，[付録G](./appendix-g-agents.md)，[付録H](./appendix-h-stochastic.md)，[付録I](./appendix-i-games.md)，[付録J](./appendix-j-grounding.md)，[付録K](./appendix-k-amendment.md)に示す。

## A.12 リファレンス実装の状況（`cadl` 0.3） {/* #a12-reference-implementation-status-v03 */}

リファレンス実装は，YAML 1.1のローダーでファイルを読み，寛容に振る舞う。
パーサが拒否するのは，`sos:` マッピングの欠落，不正なYAML，不正な `type:`，
および数値でない `alpha`，`beta`，`lambda` だけである。
`cadl check` は，これに加えて，idの重複，未宣言のアクター，重複して挙げられた当事者，
当事者のない契約，`[0, 1]` の範囲外のガバナンスパラメータ，`Minor`，`Major`，
`Critical` 以外の `severity:`，`low`，`medium`，`high` 以外の `autonomy:`，
識別子でないidや運用モードの名前，形式に合わない `sharing:` の要素，
および[付録E](./appendix-e-sos-dsl.md#e4-static-semantics)の規則L-1，L-2，L-3，L-5，M-1（`cadl` 0.3.11から），M-3への違反，および（`cadl` 0.3.12から）読み取れない `deadline:` と `sampling:` の値を
エラーとして報告する。`assume:` または `guarantee:` の
項目の中では，名前が添字付きである（`ROBOT[i]`）か，メンバーアクセスの対象である
（`ROBOT.battery`）とき，添字の中に現れる場合も含めて，その名前はアクターへの参照と
みなされ，宣言されていなければならない。単独で現れる名前は状態変数とみなされ，
検査されない。`condition:`，`safety_invariant:`，`formula:`，`expr:`，モニターの
`rule:`，ライフサイクルの `when:`，およびメッセージイベントでない `on:` の述語については，未宣言のアクターの検査を行わない。それ以外の必須キーが
欠けている場合は，空の値で置き換える。`cadl` 0.3では，次の点で本付録と相違する（`cadl` 0.3.37で確認）。

- **式。** `cadl` 0.3.37では，式はA.10とA.11に従う。既知の相違はない。`cadl` 0.3.17までは，
  `factor` の単項 `-` を受け付けなかった。それを使った項目は不透明な述語として保持し，
  ライフサイクルの `on:` と `when:`，モニターの `rule:` については `cadl check` が警告を出した。
- **識別子。** `cadl` 0.3.9からは，`cadl check` は，アクター，契約，プロトコル，メトリクスのid，
  および運用モードの名前が，A.1の識別子でない場合（たとえば非ASCII文字やハイフンを含む場合），
  またはA.11の予約語か[付録E](./appendix-e-sos-dsl.md)の `IN` である場合に，エラーとして報告する。
  `cadl` 0.3.10からは，ライフサイクルの状態の名前，ライフサイクルの遷移とモニターのid，
  およびモニターの違反ラベルにも同じ検査が適用される。検証項目のidは検査されない。
  `cadl` 0.3.12までは，これらの名前や運用モードの名前に引用符なしで書いた `true` / `false` は
  YAMLが真偽値として読み，`True` / `False` という名前として受理されていた。
- **範囲。** 上限が記号である範囲（`"TAXI[1..N]"`）は，書かれたとおりに保持される。
  `N` を `environment:` から引くことはなく，添字が宣言された範囲に収まるかどうかも
  検査されない。`cadl sim-gen` が `count` を出力するのは，両端が整数のときだけである。
- **型。** [5.2.1節](./05-language-spec.md)の型は検査されない。型構成子を用いて書いた値（たとえば `Range(1, 4)`）は，
  テキストのまま保持される。
- **寛容な形式。** パーサは，1つの文字列として書いた `parties:`（`"[A, B]"`），
  負でない数値の `deadline:`（小数でもよく，秒として読まれる），単位の前に空白を含む期間
  （`5 s`，`periodic( 500ms )`），マッピング `{kind: periodic, period_ms: <負でない整数>}` または
  `{kind: event}` として書いた `sampling:`，および大文字と小文字を問わない `method:` も受理する。
  これらの形式は本付録の一部ではない。
- **ステップ。** `cadl` 0.3.10からは，`conditional_step` の `else:` の分岐と，`barrier_step` の条件が
  保持される。したがって，`else:` の分岐に現れるアクターは検査され，どちらもシミュレータIRに
  出力される。それより前のリリースは，これらを捨てていた。
- **契約。** `cadl` 0.3.9からは，`"SOURCE -> TARGET : item"` の形式の文字列でない `sharing:` の要素，
  および項目が識別子で始まらない要素は，`cadl check` でエラーとなる。それより前のリリースは，
  引用符なしの要素を診断なしに捨てていた。`"A -> B : report(period: 5s)"` の引数のように，
  項目が識別子で始まり，その後ろに別の文字列が続く要素は，警告を出したうえで受理され，
  先頭の名前だけが保持される。この形式は本付録の一部ではない。
  `cadl` 0.3.10からは，`low`，`medium`，`high` 以外の `autonomy:` の値は，`cadl check` で
  エラーとなる。それより前のリリースは，診断なしに `medium` として読んでいた。
- **モード。** `cadl` 0.3.32からは，`cadl check` はA.7.1のR-1からR-7を適用する。束縛は，
  各ツールがパラメータと契約を読むところで使われる。`cadl sim-ir` はそれを書き出し（A.7.1），
  `cadl sim-gen` は `python` と `go` の設定（`regimes`）と `unity` の設定
  （`regimeBindings`）に渡す。`cadl verify` は，当事者を共有する契約の組をすべて検査する。
  A.7.1のモードへの束縛のもとで両方が有効なモードがない組は，2つが矛盾する場合も含めて，
  それぞれが有効なモードを挙げた `info` として報告する。`cadl` 0.3.33からは，実行の各ステップが
  1つのモードの束縛を持つ（A.7.1の「実行」）ので，2つが同じステップでともに有効になることは
  ないからである。この時点を定めていなかった0.3.32では，このような矛盾は警告（`WARN`）であった。
  あるモードで両方が有効な組はこれまでどおり判定し，ソルバーが判定できない組は `unknown` の
  ままとする。モードを持たないファイルではすべての契約が有効なので，空の `regimes:` ブロックが
  あっても，すべての組をこれまでどおり判定する。`cadl regime-map` は，`cadl` 0.3.33から，
  各モードの束縛をテキスト，DOT，JSONの出力に示す（JSONではキー `regimes` にIRと同じ形で示し，
  R-1からR-6に反するブロックでは `null` とする）。その解析は遷移だけを読み，束縛によって
  変わらない。コード生成は，`cadl` 0.3.33から束縛を適用する（[付録D](./appendix-d-codegen.md)の
  D.1節）。`python` ターゲットは，モードの制御クラスを初期モードで始め，モードでない名前を
  拒否し，遷移の安全不変条件を明示的に検査して，成り立たなければ遷移をとらない。制御クラスには
  メソッド `parameters()`，`contract_active()`，`apply_bindings()` を与え，現在のモードの値を
  `ctx.parameters` に置き，契約のモニターをその契約が有効なモードでだけ実行する（0.3.32から）。
  その規範のモニターと `cadl norms-eval` は，現在のモードをトレースから読む。トレースは，
  モードを名指すまでは初期モードにある（F.5節，F.10節）。`solidity` ターゲットは，1つのステップを
  オーケストレータの1回の呼び出しとし，安全不変条件を同じように検査する。`solidity` と `opa` の
  ターゲットは，有効な契約と制度パラメータについて現在のモードを読む。
  `cadl` 0.3.36からは，`opa` と `solidity` の規範のモニター（D.5節），`unity-csharp` ターゲット，
  [付録G](./appendix-g-agents.md)の境界ポリシー（`cadl agents-decide`，`agent-rego`，`agent-cedar`）も
  現在のモードに従う。0.3.33から0.3.35までは，あるモードで有効でない契約についてこれらは拒否していた。
  `cadl` 0.3.36からは，`cadl agents-run` と付録Gのゲートウェイも現在のモードに従う。トレースの行，
  またはゲートウェイのホストがモードを示す（G.13）。0.3.33から0.3.35までは，強制される契約を
  有効としないモードがあるファイルを拒否した。0.3.32までは，生成される `unity-csharp`，`solidity`，`opa` のコード，
  規範のオンラインモニター，`cadl regime-map` は束縛を使わず，Pythonのモードの制御クラスは
  最初の遷移の `from:` で始まり，安全不変条件を `assert` で検査していた。Solidityの
  `RegimeController` は，アルファベット順で最初のモードで始まり，不変条件を検査せず，値を設定する
  関数を持たず，だれでも呼べた。0.3.33からは，「実行」の規則（初期モード，明示的な検査，
  オーケストレータの1回の呼び出しを1つのステップとすること）を，遷移を持つすべてのファイルに
  適用する。遷移の
  `safety_invariant` は，`cadl` 0.3.32からIRとシミュレータの設定に含まれる。0.3.31までは
  `cadl check` が検査していたが，`cadl sim-ir` は出力しなかった。
- **検証。** `method:`，`expr:`，`bound:` は読み込まれる。`smt` 以外の手法は
  `not_supported` として報告され（テキスト出力では `[SKIP]` と表示される），未知の手法は
  エラーとなる。宣言されたものを何も指さない `target:` は，どの手法についてもエラーとなる。
  `smt` の項目については，充足不能な `expr:` はエラーとなり，A.10に適合しない `expr:` は
  `unknown` として報告され，検査されない。`expr` をモデルに対して証明することはしない。
  [6.3節](./06-design.md)の契約と遷移の検査は，項目の有無にかかわらず実行される。
- **コード生成。** `codegen:` の項目は構文解析されるが，それに基づく処理は行われない。
  ターゲットはコマンドラインで選択する（[付録D](./appendix-d-codegen.md)）。
  `cadl` 0.3.9からは，実装が出力できない `target:` を持つ項目（たとえば `target: ros2`）について，
  `cadl check`，`cadl verify`，`cadl codegen` が警告を出す。これは[付録DのD.4節](./appendix-d-codegen.md)が
  求める診断であり，ファイルは有効なままである。コマンドラインの `-t ros2` は拒否される。
- **拡張。** `lifecycle:` と `monitors:` は，`extensions:` が `sos-dsl` を宣言しているかどうかに
  かかわらず認識される。`cadl` 0.3.9からは，`cadl check` は，`sos-dsl` 以外の `extensions:` の名前，
  `0.1` 以外の `sos-dsl` のバージョン，および `motivation:` ブロックについて，情報レベルの診断を出す。
  この診断によってファイルが無効になることはない。これは，拡張を実装していない処理系に
  [付録C](./appendix-c-motivation.md)が求めるものである。`motivation:` ブロックは解釈されないが，
  `cadl sim-ir` は，このブロックを書かれたとおりに `motivation_block` というキーで引き渡す
  （[付録CのC.6節](./appendix-c-motivation.md)）。ファイルにこのブロックがなければ，このキーは出力されない。
  `cadl` が付録Eそのものに対して満たしていない点は，[E.4節](./appendix-e-sos-dsl.md#e4-static-semantics)に示す。
  `cadl` 0.3.19からは，宣言された拡張 `norms` のバージョン `0.1` を実装しており，この診断は出ない。
  `cadl` が付録Fのどこまでを実装しているかは，[F.10節](./appendix-f-norms.md#f10-reference-implementation-status)に示す。
  `cadl` 0.3.20からは，`agents` 0.1（[付録GのG.13節](./appendix-g-agents.md)）と `stochastic` 0.1
  （[付録HのH.14節](./appendix-h-stochastic.md)）についても同様である。また，`cadl sim-ir` は
  キー `stochastic_model` を出力する。この拡張を用いないファイルでは，その値は `null` である。
  `cadl` 0.3.22は，H.9の認証付きのモードマップ，G.5からG.8のランタイムと規則G-17からG-19，
  および生成したPythonコードでの規範のオンライン監視を追加する。それぞれの範囲は，上に挙げた
  3つの節に示す。拡張 `games` 0.1
  （[付録IのI.14節](./appendix-i-games.md#i14-reference-implementation-status)）と `grounding` 0.1
  （[付録JのJ.11節](./appendix-j-grounding.md#j11-reference-implementation-status)）は，`cadl` 0.3.23から
  実装している（`cadl game-check`，`cadl norms-indices`）。それぞれの範囲は，挙げた2つの節に示す。
  0.3.22までは，これらの名前には，未知の拡張に対する情報レベルの診断が出ていた。`kind: smg` を持つ
  モデルについて，`cadl check` 0.3.22は，H.10とH.15が1つの情報レベルの診断を求めるところで，S-1とS-9の
  誤りを報告する。また，付録Jのキーを，診断なしに無視する。拡張 `amendment` 0.1
  （[付録KのK.9節](./appendix-k-amendment.md#k9-reference-implementation-status)）は，`cadl` 0.3.32から
  実装している（`cadl amend-diff`）。0.3.31までは，この名前には未知の拡張に対する情報レベルの診断が出て
  おり，そのキーは無視されていた。

`cadl` の0.3.7より前のリリースは，これらの点のいくつかで異なっていた。その経緯は，cadlリポジトリの
[CHANGELOG](https://github.com/ertlnagoya/cadl/blob/master/CHANGELOG.md)にある。
