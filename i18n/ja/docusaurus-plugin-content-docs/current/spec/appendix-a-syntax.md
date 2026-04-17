---
sidebar_position: 11
title: "付録A. 構文リファレンス（EBNF）"
---

# 付録A. 構文リファレンス（EBNF）

本付録は CADL v0.1 の完全なEBNF文法を定義する。具象構文については本付録が
規範的であるが，第5章の非形式的な記述との間に矛盾がある場合は第5章が優先する。

本文法はISO/IEC 14977記法を用いる。`INDENT` / `DEDENT` / `NEWLINE` は
Pythonに類似したインデント依存規則により字句解析器が生成する。

## A.1 字句規則

```ebnf
letter          = "A" | … | "Z" | "a" | … | "z" ;
digit           = "0" | … | "9" ;
identifier      = letter , { letter | digit | "_" } ;
actor_id        = identifier , [ "[" , ( "*" | range_expr ) , "]" ] ;
range_expr      = int_literal , ".." , ( int_literal | identifier ) ;
string          = '"' , { any_char - '"' } , '"' ;
int_literal     = digit , { digit } ;
float_literal   = int_literal , "." , int_literal ;
bool_literal    = "true" | "false" ;
duration_lit    = int_literal , ( "ms" | "s" | "min" | "h" ) ;
version_string  = int_literal , "." , int_literal , "." , int_literal ;
literal         = string | int_literal | float_literal
                | bool_literal | duration_lit ;
```

## A.2 トップレベル構造

```ebnf
cadl_file   = "sos:" , INDENT , sos_body , DEDENT ;
sos_body    = "name:"    , string          , NEWLINE ,
              [ "type:"   , sos_type        , NEWLINE ] ,
              [ "version:", version_string  , NEWLINE ] ,
              { section } ;
sos_type    = "Directed" | "Acknowledged" | "Collaborative" | "Virtual" ;
section     = context_section
            | actors_section
            | contracts_section
            | protocols_section
            | algorithms_section
            | transitions_section
            | metrics_section
            | verification_section
            | codegen_section ;
```

## A.3 コンテキスト・アクター・メトリクス

```ebnf
context_section  = "context:"  , INDENT , { kv_entry } , DEDENT ;
actors_section   = "actors:"   , INDENT , { actor_decl } , DEDENT ;
actor_decl       = actor_id , ":" , INDENT , { kv_entry } , DEDENT ;
metrics_section  = "metrics:"  , INDENT , { metric_decl } , DEDENT ;
metric_decl      = identifier , ":" , INDENT ,
                   "aggregation:" , string , NEWLINE ,
                   [ "unit:"    , string , NEWLINE ] ,
                   [ "target:"  , expr   , NEWLINE ] ,
                   DEDENT ;
kv_entry         = identifier , ":" , ( literal | inline_list
                                       | INDENT , { kv_entry } , DEDENT ) ,
                   NEWLINE ;
inline_list      = "[" , [ literal , { "," , literal } ] , "]" ;
```

## A.4 コントラクト（制度層）

```ebnf
contracts_section = "contracts:" , INDENT , { contract_decl } , DEDENT ;
contract_decl     = identifier , ":" , INDENT , contract_body , DEDENT ;
contract_body     = { "parties:"       , actor_list         , NEWLINE
                    | "authority:"     , identifier         , NEWLINE
                    | "alpha:"         , float_literal      , NEWLINE
                    | "beta:"          , float_literal      , NEWLINE
                    | "lambda:"        , float_literal      , NEWLINE
                    | "obligations:"   , INDENT , { clause } , DEDENT
                    | "permissions:"   , INDENT , { clause } , DEDENT
                    | "prohibitions:"  , INDENT , { clause } , DEDENT
                    | "sanctions:"     , INDENT , { clause } , DEDENT } ;
clause            = "-" , predicate , NEWLINE ;
actor_list        = actor_ref , { "," , actor_ref } ;
actor_ref         = actor_id | "all" | "any" ;
```

## A.5 プロトコル

```ebnf
protocols_section = "protocols:" , INDENT , { protocol_decl } , DEDENT ;
protocol_decl     = identifier , ":" , INDENT , protocol_body , DEDENT ;
protocol_body     = [ "participants:" , actor_list , NEWLINE ] ,
                    [ "precondition:" , predicate  , NEWLINE ] ,
                    [ "postcondition:", predicate  , NEWLINE ] ,
                    "steps:" , INDENT , step_list , DEDENT ;
step_list         = { step } ;
step              = message_step
                  | compute_step
                  | conditional_step
                  | parallel_step
                  | barrier_step
                  | loop_step ;
message_step      = actor_ref , "->" , actor_ref , ":" , message_expr , NEWLINE ;
compute_step      = actor_ref , ":" , computation_expr , NEWLINE ;
conditional_step  = "if" , predicate , ":" , INDENT , step_list , DEDENT ,
                    [ "else:" , INDENT , step_list , DEDENT ] ;
parallel_step     = "parallel:" , INDENT , step_list , DEDENT ;
barrier_step      = "barrier:" , predicate , NEWLINE ;
loop_step         = "loop" , [ "while" , predicate ] , ":" ,
                    INDENT , step_list , DEDENT ;
message_expr      = identifier , [ "(" , [ arg_list ] , ")" ] ;
computation_expr  = identifier , "(" , [ arg_list ] , ")" ;
arg_list          = expr , { "," , expr } ;
```

## A.6 アルゴリズム

```ebnf
algorithms_section = "algorithms:" , INDENT , { algorithm_decl } , DEDENT ;
algorithm_decl     = identifier , ":" , INDENT , algorithm_body , DEDENT ;
algorithm_body     = [ "inputs:"  , inline_list , NEWLINE ] ,
                     [ "outputs:" , inline_list , NEWLINE ] ,
                     [ "model:"   , string      , NEWLINE ] ,
                     [ "impl:"    , string      , NEWLINE ] ,
                     [ "params:"  , INDENT , { kv_entry } , DEDENT ] ;
```

## A.7 遷移

```ebnf
transitions_section = "transitions:" , INDENT , { transition_decl } , DEDENT ;
transition_decl     = identifier , ":" , INDENT ,
                      "from:"   , identifier , NEWLINE ,
                      "to:"     , identifier , NEWLINE ,
                      "trigger:", predicate  , NEWLINE ,
                      [ "guard:"  , predicate , NEWLINE ] ,
                      [ "effect:" , action    , NEWLINE ] ,
                      DEDENT ;
action              = function_call ;
```

## A.8 検証ブロック

```ebnf
verification_section = "verification:" , INDENT , { verify_decl } , DEDENT ;
verify_decl          = identifier , ":" , INDENT , verify_body , DEDENT ;
verify_body          = "property:" , property_kind , NEWLINE ,
                       "expr:"     , predicate      , NEWLINE ,
                       [ "method:" , verify_method , NEWLINE ] ,
                       [ "bound:"  , int_literal   , NEWLINE ] ;
property_kind        = "safety" | "liveness" | "fairness" | "invariant" ;
verify_method        = "smt" | "model_check" | "simulation" | "proof" ;
```

## A.9 コード生成ブロック

```ebnf
codegen_section = "codegen:" , INDENT , { codegen_target } , DEDENT ;
codegen_target  = target_name , ":" , INDENT , codegen_body , DEDENT ;
target_name     = "unity" | "ros2" | "python" | "solidity" | identifier ;
codegen_body    = [ "output:" , string , NEWLINE ] ,
                  [ "template:", string , NEWLINE ] ,
                  [ "options:" , INDENT , { kv_entry } , DEDENT ] ;
```

## A.10 式

```ebnf
expr             = logical_expr ;
logical_expr     = comparison , { ( "AND" | "OR" ) , comparison }
                 | "NOT" , expr ;
comparison       = arith_expr , [ comp_op , arith_expr ] ;
comp_op          = "==" | "!=" | "<" | "<=" | ">" | ">=" ;
arith_expr       = term , { ( "+" | "-" ) , term } ;
term             = factor , { ( "*" | "/" ) , factor } ;
factor           = literal | identifier | function_call
                 | "(" , expr , ")" ;
function_call    = identifier , "(" , [ arg_list ] , ")" ;
quantified_expr  = ( "for all" | "exists" ) , identifier , "in" , set_expr ,
                   ":" , predicate ;
predicate        = comparison | logical_expr | quantified_expr
                 | function_call ;
set_expr         = identifier | inline_list | range_expr ;
event_expr       = function_call | identifier , "." , identifier ;
```

## A.11 予約語

```
actors      algorithms    AND         any         all
authority   barrier       beta        codegen     context
contracts   effect        else        exists      expr
fairness    for all       from        guard       if
invariant   lambda        liveness    loop        metrics
model_check name          NOT         OR          output
parallel    parties       permissions postcondition precondition
prohibitions property     protocols   proof       safety
sanctions   simulation    smt         sos         steps
target      template      to          transitions trigger
type        unit          verification version    while
```
