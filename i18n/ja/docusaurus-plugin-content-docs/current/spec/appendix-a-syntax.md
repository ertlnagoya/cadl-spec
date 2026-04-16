---
sidebar_position: 11
title: "付録A. 構文リファレンス（EBNF抜粋）"
---

# 付録A. 構文リファレンス（EBNF抜粋）

以下にCADLの主要な構文規則のEBNF定義を示す。完全版は別途公開予定。

```ebnf
(* 字句規則 *)
identifier = letter , { letter | digit | "_" } ;
actor_id = identifier , [ "[" , ( "*" | range_expr ) , "]" ] ;
range_expr = int_literal , ".." , ( int_literal | identifier ) ;
string = '"' , { any_char - '"' } , '"' ;
int_literal = digit , { digit } ;
float_literal = int_literal , "." , int_literal ;
duration_lit = int_literal , ( "ms" | "s" | "min" | "h" ) ;
version_string = int_literal , "." , int_literal , "." , int_literal ;

(* トップレベル *)
cadl_file = "sos:" , INDENT , sos_body , DEDENT ;
sos_body = "name:" , string , NEWLINE ,
    [ "type:" , sos_type , NEWLINE ] ,
    [ "version:" , version_string , NEWLINE ] ,
    { section } ;
sos_type = "Directed" | "Acknowledged" | "Collaborative" | "Virtual" ;
section = context_section | actors_section | contracts_section
        | protocols_section | algorithms_section
        | transitions_section | metrics_section ;

(* 式 *)
predicate = comparison | logical_expr | quantified_expr | function_call ;
comparison = expr , comp_op , expr ;
comp_op = "==" | "!=" | "<" | "<=" | ">" | ">=" ;
logical_expr = predicate , ( "AND" | "OR" ) , predicate
             | "NOT" , predicate ;
quantified_expr = ( "for all" | "exists" ) , identifier , "in" , set_expr ,
    ":" , predicate ;
event_expr = function_call | identifier , "." , identifier ;

(* プロトコルステップ *)
step = message_step | compute_step | conditional_step
     | parallel_step | barrier_step ;
message_step = actor_ref , "->" , actor_ref , ":" , message_expr ;
compute_step = actor_ref , ":" , computation_expr ;
conditional_step = "if" , predicate , ":" , INDENT , step_list , DEDENT ,
    [ "else:" , INDENT , step_list , DEDENT ] ;
parallel_step = "parallel:" , INDENT , step_list , DEDENT ;
barrier_step = "barrier:" , predicate ;
```
