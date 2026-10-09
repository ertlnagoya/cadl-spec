---
sidebar_position: 11
title: "付録A. 構文リファレンス（EBNF）"
description: "CADL v0.1の参照文法をEBNFで示す。文書の構造，式の部分言語，予約語，リファレンス実装の状況を扱う。"
---

# 付録A. 構文リファレンス（EBNF）

CADLファイルは**YAML 1.2文書** [[Ben-Kiki+, 2021]](./appendix-b-references.md) である。本付録は CADL v0.1 の参照文法を
2つの部分に分けて示す。文書の*構造*（A.2〜A.9）は，YAMLのマッピングと
シーケンスの上のEBNFとして記述する。*式の部分言語*（A.1，A.10）は，
個々のYAML文字列スカラーの中に書かれる。

[第5章](./05-language-spec.md)と本付録は同じ構文を記述する。具象構文については本付録が規範的であり，
第5章は説明のための記述である。リファレンス実装
（[`cadl`](https://github.com/ertlnagoya/cadl)）は，この構文をそのまま
受理することが期待される。v0.3における既知の相違は
[A.12](#a12-reference-implementation-status-v03)に示す。

この文法を試すには，リファレンス実装をインストールし（`pip install cadl-lang`），
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
解釈するため，必ず引用符で囲まなければならない。

本付録が定義しないキーは CADL v0.1 の一部ではない。処理系は，そのようなキーを
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

`identifier` は，アクター，契約，プロトコル，レジーム，メトリクスの名前に用いる。
`hyphen_name` は，拡張の名前とコード生成ターゲットの名前（たとえば `sos-dsl`，
`unity-csharp`）にだけ用いる。数値リテラルは符号を持たない。
識別子はASCIIに限る。文字列とコメントには任意のUnicode文字を使用できる。これが要求NFR-7（[第4章](./04-requirements.md)）の求める内容である。

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
              [ "metrics:"      , { "-" , metric_def } ] ,
              [ "verification:" , { "-" , verify_def } ] ,
              [ "codegen:"      , { "-" , codegen_def } ] ,
              [ "motivation:"   , motivation_block ] ;
sos_type    = "Directed" | "Acknowledged" | "Collaborative" | "Virtual" ;
extension_decl = hyphen_name , ":" , scalar ;
```

1つのファイルは1つのSoS定義を含む。`version:` には，慣例として `"1.0.0"` のような
セマンティックバージョンの文字列を書く。

**拡張点。** `extensions:` は，ファイルが依存する言語拡張を，名前とバージョンの組
（たとえば `- sos-dsl: 0.1`）として宣言する。次の2つの拡張を定義している。
宣言できる名前を持つのは1つ目だけである。

- SoS-DSL拡張（[付録E](./appendix-e-sos-dsl.md)）。名前 `sos-dsl`，バージョン `0.1` として
  宣言する。`contract_def`（A.4）にキー `lifecycle:` と `monitors:` を追加する。
- 動機拡張（[付録C](./appendix-c-motivation.md)）。`motivation_block` を定義する。
  v0.1では `extensions:` に書く名前を持たず，`motivation:` ブロックを書くだけで用いる。

## A.3 コンテキスト・アクター・メトリクス {/* #a3-context-actors-metrics */}

```ebnf
context_block  = [ "environment:" , { identifier , ":" , scalar } ] ,
                 [ "assumptions:" , { "-" , text } ] ;

actor_def      = "id:"   , actor_ref ,
                 "role:" , text ,
                 [ "autonomy:"     , autonomy_level ] ,
                 [ "capabilities:" , { "-" , text } ] ,
                 [ "interface:"    , interface_def ] ;
autonomy_level = "low" | "medium" | "high" ;
interface_def  = [ "input:"  , { "-" , text } ] ,
                 [ "output:" , { "-" , text } ] ;

metric_def     = "id:" , identifier ,
                 [ "formula:" , predicate ] ,          (* string *)
                 [ "target:"  , scalar ] ;
```

`autonomy:` の既定値は `medium` である。`actor_def` の `id:` の添字は，通常は範囲
（`"ROBOT[1..N]"`）であり，パラメータ化されたアクターの集合を宣言する。
`environment:` の値が文字列でないときはリテラル（A.1）として読み，
文字列のときはそのまま保持する。

## A.4 コントラクト（制度層） {/* #a4-contracts-institution-layer */}

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
                    [ "monitors:"         , { "-" , monitor_def } ] ; (* 付録E *)

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

`from:` と `to:` はレジームの名前である。レジームは遷移の中で使うことで導入され，
別個の宣言はない。`protocol:` は `protocols:` で宣言したプロトコルを
指すことが望ましい。

## A.8 検証ブロック {/* #a8-verification-block */}

```ebnf
verify_def    = "id:"   , identifier ,
                "type:" , text ,
                [ "target:"   , identifier ] ,
                [ "property:" , text ] ,
                [ "method:"   , verify_method ] ,
                [ "expr:"     , predicate ] ,              (* string *)
                [ "bound:"    , int_literal ] ;
verify_method = "smt" | "model_check" | "simulation" | "proof" ;
```

`type:` は性質の種類を表し，たとえば `consistency`，`deadlock`，`safety`，
`liveness` を書く。`target:` は対象の契約，プロトコル，または遷移の名前である。すなわち，契約または
プロトコルの `id`，レジームの名前，または2つのレジームの間の遷移を表す `FROM->TO` を書く。
`method:` の既定値は `smt` である。宣言された手法を実装していない処理系は，
その項目を黙って読み飛ばすのではなく `not_supported` として報告しなければならず，
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
`*` `/` である。優先順位が等しい二項演算子は左結合である。比較は結合的でない
（`a < b < c` は述語ではない）。量化子の有効範囲は，右方向へ可能な限り広くとる。
トークンの間の空白は無視する。

`comprehension` は集約関数の引数であり，束縛された識別子の値ごとに，その `predicate` を
1回評価する。たとえば `sum(ROBOT[i].goal_count for i in 1..N)` や
`sum(r.load for r in ROBOT[*])` である。

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
| `sos` | `name` `type` `version` `description` `extensions` `context` `actors` `contracts` `protocols` `algorithms` `transitions` `metrics` `verification` `codegen` `motivation` |
| `context` | `environment` `assumptions` |
| アクター | `id` `role` `autonomy` `capabilities` `interface`（`input` `output`） |
| 契約 | `id` `parties` `assume` `guarantee` `authority` `information` `responsibilities` `incentives` `violation` `duration` `lifecycle` `monitors` |
| `authority` | `decision_scope` `decision_holder` `beta` `mode` |
| `information` | `alpha` `views` `sharing` |
| `incentives` | `type` `lambda` `rules` |
| `violation` | `detect` `action` `escalation` |
| プロトコル | `id` `trigger` `precondition` `steps` `timing` `fallback` `rollback`（`condition` `action`） `postcondition` `safety_invariant` |
| ステップ | `if` `else` `parallel` `barrier` |
| アルゴリズム | `central` `local` |
| 遷移 | `from` `to` `condition` `protocol` `safety_invariant` |
| メトリクス | `id` `formula` `target` |
| 検証 | `id` `type` `target` `property` `method` `expr` `bound` |
| コード生成 | `target` `output` `mappings` |

列挙値: `Directed` `Acknowledged` `Collaborative` `Virtual`（SoSの型），
`low` `medium` `high`（自律度），`smt` `model_check` `simulation` `proof`
（検証手法），`ms` `s` `min` `h`（時間の単位）。拡張のキーと値は
[付録C](./appendix-c-motivation.md)と[付録E](./appendix-e-sos-dsl.md)に示す。

## A.12 リファレンス実装の状況（v0.3） {/* #a12-reference-implementation-status-v03 */}

リファレンス実装は，YAML 1.1のローダーでファイルを読み，寛容に振る舞う。
パーサーが拒否するのは，`sos:` マッピングの欠落，不正なYAML，不正な `type:`，
および数値でない `alpha`，`beta`，`lambda` だけである。
`cadl check` は，これに加えて，idの重複，未宣言のアクター，重複して挙げられた当事者，
当事者のない契約，`[0, 1]` の範囲外のガバナンスパラメータ，および `Minor`，`Major`，
`Critical` 以外の `severity:` をエラーとして報告する。`assume:` または `guarantee:` の
項目の中では，名前が添字付きである（`ROBOT[i]`）か，メンバーアクセスの対象である
（`ROBOT.battery`）とき，添字の中に現れる場合も含めて，その名前はアクターへの参照と
みなされ，宣言されていなければならない。単独で現れる名前は状態変数とみなされ，
検査されない。`condition:`，`safety_invariant:`，`formula:`，`expr:`，およびモニターの
`rule:` の述語については，未宣言のアクターの検査を行わない。それ以外の必須キーが
欠けている場合は，空の値で置き換える。v0.3では，次の点で本付録と相違する（v0.3.8で確認）。

- **式。** v0.3.8では，式はA.10とA.11に従う。既知の相違はない。
- **型。** [5.2.1節](./05-language-spec.md)の型は検査されない。型構成子を用いて書いた値（たとえば `Range(1, 4)`）は，
  テキストのまま保持される。
- **寛容な形式。** パーサーは，1つの文字列として書いた `parties:`（`"[A, B]"`），
  数値の `deadline:`（秒として読まれる），`kind` と `period_ms` を持つマッピングとして
  書いた `sampling:`，および大文字と小文字を問わない `method:` も受理する。
  これらの形式は本付録の一部ではない。
- **ステップ。** `conditional_step` の `else:` の分岐と，`barrier_step` の条件は保持されない。
- **契約。** `sharing:` の要素は，引用符で囲んだ文字列として書いたときにだけ認識される。
  認識できない `autonomy:` の値は `medium` として読まれる。
- **検証。** `method:`，`expr:`，`bound:` は読み込まれる。`smt` 以外のメソッドは
  `not_supported` として報告され（テキスト出力では `[SKIP]` と表示される），未知のメソッドは
  エラーとなる。宣言されたものを何も指さない `target:` は，どのメソッドについてもエラーとなる。
  `smt` の項目については，充足不能な `expr:` はエラーとなり，A.10に適合しない `expr:` は
  `unknown` として報告され，検査されない。`expr` をモデルに対して証明することはしない。
  [6.3節](./06-design.md)の契約と遷移の検査は，項目の有無にかかわらず実行される。
- **コード生成。** `codegen:` の項目は構文解析されるが，それに基づく処理は行われない。
  ターゲットはコマンドラインで選択する（[付録D](./appendix-d-codegen.md)）。
- **拡張。** `extensions:` と `motivation:` は無視される。`lifecycle:` と `monitors:` は，
  `extensions:` が `sos-dsl` を宣言しているかどうかにかかわらず認識される。

v0.3.7より前のリリースは，これらの点のいくつかで異なっていた。その経緯は，cadlリポジトリの
[CHANGELOG](https://github.com/ertlnagoya/cadl/blob/master/CHANGELOG.md)にある。
