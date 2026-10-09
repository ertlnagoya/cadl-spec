---
sidebar_position: 11
title: "Appendix A: Syntax Reference (EBNF)"
description: "Reference grammar of CADL v0.1 in EBNF: document structure, expression sub-language, reserved keywords, and reference implementation status."
---

# Appendix A. Syntax Reference (EBNF)

A CADL file is a **YAML 1.2 document** [[Ben-Kiki+, 2021]](./appendix-b-references.md). This appendix gives the reference
grammar of CADL v0.1 in two parts: the *structure* of the document
(A.2–A.9), written as EBNF over YAML mappings and sequences, and the
*expression sub-language* (A.1, A.10) that is written inside individual
YAML string scalars.

[Chapter 5](./05-language-spec.md) and this appendix describe the same
syntax. This appendix is normative for the concrete syntax; Chapter 5 is
explanatory. The
reference implementation ([`cadl`](https://github.com/ertlnagoya/cadl))
is expected to accept exactly this syntax; known deviations of v0.3 are
listed in [A.12](#a12-reference-implementation-status-v03).

To try the grammar, install the reference implementation
(`pip install cadl-lang`) and run `cadl parse` or `cadl check`; runnable
files are in the `examples/` directory of the
[cadl repository](https://github.com/ertlnagoya/cadl).

**Notation.** The grammar uses ISO/IEC 14977 EBNF [[ISO/IEC 14977:1996]](./appendix-b-references.md) with the following
conventions.

- A terminal ending in a colon, such as `"name:"`, is a key of a YAML
  mapping, followed by its value. The entries of one mapping may appear
  in any order, each at most once.
- `{ "-" , x }` is a YAML sequence whose items are `x`. Block style and
  flow style (`[a, b]`) are equivalent.
- `k , ":" , v` with a non-terminal `k` is a mapping whose keys are
  chosen by the author.
- `text` is any YAML string scalar, `number` any YAML integer or float,
  and `scalar` any YAML scalar. Their content is not interpreted further.
- `any_char` is any single character. The `string` rule (A.1) excludes
  the double quotation mark from it, so a string ends at the next `"`.
- Productions marked `(* string *)` describe the content of a single
  YAML string scalar.

Indentation, comments, quoting, and the choice between block and flow
style are governed by YAML and are not shown. A scalar that contains
`[`, `]`, `*`, `->`, or `": "` — for example an actor reference such as
`"TAXI[*]"` or a step such as `"A -> B : msg"` — SHOULD be quoted, and
MUST be quoted inside a flow sequence, where YAML would otherwise read
it differently.

Keys that this appendix does not define are not part of CADL v0.1. A
processor MUST NOT reject a file because of them; the reference
implementation ignores them.

The grammar covers the design and verification levels of
[Section 5.1.1](./05-language-spec.md).
An overview-level description is informal input for AI-assisted
refinement and need not conform to it.

## A.1 Lexical rules

These rules apply inside scalars.

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

`identifier` names actors, contracts, protocols, regimes, and metrics.
`hyphen_name` is used only for extension names and codegen target names
(for example `sos-dsl`, `unity-csharp`). Numeric literals are unsigned.
Identifiers are ASCII. Strings and comments may contain any Unicode
character, which is what requirement NFR-7
([Chapter 4](./04-requirements.md)) asks for.

## A.2 Top-level structure

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

One file contains one SoS definition. `version:` is conventionally a
semantic version string such as `"1.0.0"`.

**Extension points.** `extensions:` declares the language extensions a
file relies on, each as a name and a version (for example
`- sos-dsl: 0.1`). Two extensions are defined; only the first has a
name that can be declared:

- the SoS-DSL extension ([Appendix E](./appendix-e-sos-dsl.md)),
  declared as `sos-dsl` with version `0.1`, which adds the keys
  `lifecycle:` and `monitors:` to `contract_def` (A.4);
- the motivation extension ([Appendix C](./appendix-c-motivation.md)),
  which defines `motivation_block`. It has no `extensions:` name in
  v0.1 and is used simply by writing a `motivation:` block.

## A.3 Context, actors, metrics

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

`autonomy:` defaults to `medium`. In `actor_def`, the index of `id:` is
normally a range (`"ROBOT[1..N]"`) and declares a parameterised set of
actors. A non-string value in `environment:` is read as a literal
(A.1); a string value is kept verbatim.

## A.4 Contracts (Institution layer)

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
                    [ "lifecycle:"        , lifecycle_block ] ,       (* Appendix E *)
                    [ "monitors:"         , { "-" , monitor_def } ] ; (* Appendix E *)

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

Each item of `assume:` and `guarantee:` is a string holding a
`predicate` (A.10). `alpha`, `beta`, and `lambda` MUST lie in `[0, 1]`.
`parties:` MUST name at least one declared actor, and every actor
reference in a contract MUST refer to an actor declared in `actors:`.
`duration:` is `indefinite`, a `duration_lit`, or an event description.

## A.5 Protocols

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

A `message_step` or `compute_step` is one sequence item. It may be
written as a quoted string (`- "A -> B : msg(x)"`, recommended) or
unquoted, in which case YAML reads it as a one-entry mapping; both forms
are equivalent. `conditional_step`, `parallel_step`, and `barrier_step`
are mappings whose key is `if <predicate>`, `parallel`, or `barrier`.
Typical keys of `timing:` are `max_response`, `max_total`, and
`checkpoint_interval`; typical keys of `fallback:` are `on_timeout` and
`on_failure`.

## A.6 Algorithms

```ebnf
algorithm_def = identifier , ":" , algorithm_body ;
algorithm_body = [ "central:" , text ] ,
                 [ "local:"   , text ] ;
```

`algorithms:` is a mapping from a function name (for example
`pathfinding`) to the algorithms used centrally and locally.

## A.7 Transitions

```ebnf
transition_def = "from:" , identifier ,
                 "to:"   , identifier ,
                 [ "condition:"        , predicate ] ,     (* string *)
                 [ "protocol:"         , identifier ] ,
                 [ "safety_invariant:" , predicate ] ;     (* string *)
```

`from:` and `to:` name regimes. A regime is introduced by its use in a
transition; there is no separate declaration. `protocol:` SHOULD name a
protocol declared in `protocols:`.

## A.8 Verification block

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

`type:` names the kind of property, for example `consistency`,
`deadlock`, `safety`, or `liveness`. `target:` names the contract,
protocol, or transition concerned: the `id` of a contract or protocol,
the name of a regime, or `FROM->TO` for the transition between two
regimes. `method:` defaults to `smt`. A
processor that does not implement a declared method MUST report the
entry as `not_supported` rather than skip it silently, and MUST report
an unknown method as an error. A `target:` that names nothing declared
SHOULD be reported as an error.

## A.9 Codegen block

```ebnf
codegen_def = [ "target:"   , hyphen_name ] ,
              [ "output:"   , text ] ,
              [ "mappings:" , { identifier , ":" , text } ] ;
```

`target:` defaults to `python`. The target names are catalogued in
[Appendix D](./appendix-d-codegen.md). `output:` is the output path and
`mappings:` passes target-specific name mappings to the generator.

## A.10 Expressions

A `predicate` is written inside one YAML string scalar.

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

Operators bind, from loosest to tightest: `OR`, `AND`, `NOT`, comparison,
`+` `-`, `*` `/`. Binary operators of equal precedence associate to the
left. A comparison is not associative (`a < b < c` is not a predicate).
A quantifier extends as far to the right as possible. White space
between tokens is ignored.

A `comprehension` is the argument of an aggregate function and
evaluates its `predicate` once for each value of the bound identifier,
for example `sum(ROBOT[i].goal_count for i in 1..N)` or
`sum(r.load for r in ROBOT[*])`.

An item of `assume:` or `guarantee:` that does not conform to this
grammar is not a syntax error: it is retained as an *opaque predicate*,
which a processor carries through unchanged and excludes from formal
verification. This permits natural-language conditions at the design
level. The same applies to step expressions and conditions in A.5.

## A.11 Reserved keywords

Keywords of the expression sub-language. They MUST NOT be used as
identifiers.

```
AND    OR    NOT    true    false    for all    exists    in
```

`for` on its own (it introduces a comprehension) and `all` are not
reserved. `IN` (upper case, set membership inside a monitor `rule`,
[Appendix E](./appendix-e-sos-dsl.md)) and `in` (lower case, quantifier
and comprehension domains) are distinct keywords.

Keys of the structure, by the block in which they are recognised.

| Block | Keys |
|---|---|
| file | `sos` |
| `sos` | `name` `type` `version` `description` `extensions` `context` `actors` `contracts` `protocols` `algorithms` `transitions` `metrics` `verification` `codegen` `motivation` |
| `context` | `environment` `assumptions` |
| actor | `id` `role` `autonomy` `capabilities` `interface` (`input` `output`) |
| contract | `id` `parties` `assume` `guarantee` `authority` `information` `responsibilities` `incentives` `violation` `duration` `lifecycle` `monitors` |
| `authority` | `decision_scope` `decision_holder` `beta` `mode` |
| `information` | `alpha` `views` `sharing` |
| `incentives` | `type` `lambda` `rules` |
| `violation` | `detect` `action` `escalation` |
| protocol | `id` `trigger` `precondition` `steps` `timing` `fallback` `rollback` (`condition` `action`) `postcondition` `safety_invariant` |
| step | `if` `else` `parallel` `barrier` |
| algorithm | `central` `local` |
| transition | `from` `to` `condition` `protocol` `safety_invariant` |
| metric | `id` `formula` `target` |
| verification | `id` `type` `target` `property` `method` `expr` `bound` |
| codegen | `target` `output` `mappings` |

Enumerated values: `Directed` `Acknowledged` `Collaborative` `Virtual`
(SoS type); `low` `medium` `high` (autonomy); `smt` `model_check`
`simulation` `proof` (verification method); `ms` `s` `min` `h`
(duration units). The keys and values of the extensions are listed in
[Appendix C](./appendix-c-motivation.md) and
[Appendix E](./appendix-e-sos-dsl.md).

## A.12 Reference implementation status (v0.3)

The reference implementation reads the file with a YAML 1.1 loader and
is lenient: only a missing `sos:` mapping, invalid YAML, an invalid
`type:`, and an `alpha`, `beta`, or `lambda` that is not a number are
rejected by the parser. `cadl check` additionally reports duplicate
ids, undeclared actors, a party listed twice, a contract without
parties, governance parameters outside `[0, 1]`, and a `severity:`
other than `Minor`, `Major`, or `Critical` as errors. In an item of
`assume:` or `guarantee:`, a name counts as an actor reference, and
must be declared, when it is indexed (`ROBOT[i]`) or is the object of a
member access (`ROBOT.battery`), including inside an index; a name
standing alone is taken as a state variable and is not checked. The
predicates of `condition:`, `safety_invariant:`, `formula:`, `expr:`,
and monitor `rule:` are not checked for undeclared actors. Other
missing required keys are replaced by an empty value. At v0.3 it
deviates from this appendix as follows (checked against v0.3.8).

- **Expressions.** Expressions follow A.10 and A.11 in v0.3.8; no
  deviation is known.
- **Types.** The types of [Section 5.2.1](./05-language-spec.md) are not
  checked. A value
  written with a type constructor (for example `Range(1, 4)`) is kept
  as text.
- **Lenient forms.** The parser also accepts `parties:` written as one
  string (`"[A, B]"`), a numeric `deadline:` (read as seconds),
  `sampling:` written as a mapping with `kind` and `period_ms`, and a
  `method:` in any letter case. These forms are not part of this
  appendix.
- **Steps.** The `else:` branch of a `conditional_step` and the
  condition of a `barrier_step` are not retained.
- **Contracts.** A `sharing:` entry is recognised only when it is
  written as a quoted string. An unrecognised `autonomy:` value is read
  as `medium`.
- **Verification.** `method:`, `expr:`, and `bound:` are read. Methods
  other than `smt` are reported as `not_supported` (shown as `[SKIP]`
  in text output), and an unknown method is an error. A `target:` that
  names nothing declared is an error for every method. For an `smt`
  entry an unsatisfiable `expr:` is an error, and an `expr:` that does
  not conform to A.10 is reported as `unknown` and not checked; `expr`
  is not proved against the model. The contract and transition checks
  of [Section 6.3](./06-design.md) run whether or not entries are
  present.
- **Codegen.** `codegen:` entries are parsed but not acted upon; the
  target is selected on the command line
  ([Appendix D](./appendix-d-codegen.md)).
- **Extensions.** `extensions:` and `motivation:` are ignored.
  `lifecycle:` and `monitors:` are recognised whether or not
  `extensions:` declares `sos-dsl`.

Releases before v0.3.7 differed in several of these points; the history
is in the
[CHANGELOG](https://github.com/ertlnagoya/cadl/blob/master/CHANGELOG.md)
of the cadl repository.
