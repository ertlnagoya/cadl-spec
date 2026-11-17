---
sidebar_position: 11
title: "Appendix A: Syntax Reference (EBNF)"
description: "Reference grammar of CADL v0.3 in EBNF: document structure, expression sub-language, reserved keywords, and reference implementation status."
---

# Appendix A. Syntax Reference (EBNF)

A CADL file is a **YAML 1.2 document** [[Ben-Kiki+, 2021]](./appendix-b-references.md). This appendix gives the reference
grammar of CADL v0.3 in two parts: the *structure* of the document
(A.2–A.9), written as EBNF over YAML mappings and sequences, and the
*expression sub-language* (A.1, A.10) that is written inside individual
YAML string scalars.

[Chapter 5](./05-language-spec.md) and this appendix describe the same
syntax. This appendix is normative for the concrete syntax; Chapter 5 is
explanatory. The
reference implementation ([`cadl`](https://github.com/ertlnagoya/cadl))
is expected to accept exactly this syntax; known deviations of `cadl` 0.3 are
listed in [A.12](#a12-reference-implementation-status-v03).

To try the grammar, install the reference implementation (see
[Path B of the Quick Start](../quickstart/index.md#path-b)) and run `cadl parse` or `cadl check`; runnable
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
it differently. A `sharing_entry` (A.4) MUST be a quoted string
wherever it is written.

Keys that this appendix does not define are not part of CADL v0.3. A
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

A `duration_lit` is an integer followed by its unit: `2.5s` is not a
duration, and the same time is written `2500ms`. A `string` is delimited
by double quotes only: `'k'` is not a string.

`identifier` names actors, contracts, protocols, regimes, and metrics.
`hyphen_name` is used only for extension names and codegen target names
(for example `sos-dsl`, `unity-csharp`). Numeric literals are unsigned.
Identifiers are ASCII. Strings and comments may contain any Unicode
character, which is what requirement NFR-7
([Chapter 4](./04-requirements.md)) asks for. From `cadl` 0.3.9 the
reference implementation reports an id or regime name that violates the
ASCII rule as an error ([A.12](#a12-reference-implementation-status-v03)).

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
              [ "regimes:"      , regimes_block ] ,       (* A.7.1 *)
              [ "metrics:"      , { "-" , metric_def } ] ,
              [ "verification:" , { "-" , verify_def } ] ,
              [ "codegen:"      , { "-" , codegen_def } ] ,
              [ "motivation:"   , motivation_block ] ,
              [ "model:"        , model_block ] ,          (* Appendix H *)
              [ "amendment:"    , amendment_block ] ;      (* Appendix K *)
sos_type    = "Directed" | "Acknowledged" | "Collaborative" | "Virtual" ;
extension_decl = hyphen_name , ":" , scalar ;
```

One file contains one SoS definition. `version:` is conventionally a
semantic version string such as `"1.0.0"`.

**Extension points.** `extensions:` declares the language extensions a
file relies on, each as a name and a version (for example
`- sos-dsl: 0.1`). Eight extensions are defined; all but the last have a
name that can be declared:

- the SoS-DSL extension ([Appendix E](./appendix-e-sos-dsl.md)),
  declared as `sos-dsl` with version `0.1`, which adds the keys
  `lifecycle:` and `monitors:` to `contract_def` (A.4);
- the norms extension ([Appendix F](./appendix-f-norms.md)), declared as
  `norms` with version `0.1`, which adds the keys `norms:` and
  `counts_as:` to `contract_def` (A.4) and bounded temporal operators to
  the predicates of a contract. A file that uses it MUST declare it;
- the agent governance extension ([Appendix G](./appendix-g-agents.md)),
  declared as `agents` with version `0.1`, which requires `norms` and
  adds the key `agent:` to `actor_def` (A.3), the keys `enforcement:`
  and `delegations:` to `contract_def` (A.4), and `on_denied:` to a
  prohibition;
- the stochastic model extension
  ([Appendix H](./appendix-h-stochastic.md)), declared as `stochastic`
  with version `0.1`, which adds the key `model:` to `sos_body`;
- the strategic model extension
  ([Appendix I](./appendix-i-games.md)), declared as `games` with
  version `0.1`, which requires `stochastic` and adds players,
  profiles, payoffs, and equilibrium queries to `model:`;
- the grounding extension
  ([Appendix J](./appendix-j-grounding.md)), declared as `grounding`
  with version `0.1`, which requires `norms` and adds the key
  `grounding:` to `contract_def` (A.4), the keys `shares:` and
  `on_fulfilment:` to a norm and `magnitude:` to its `on_violation:`,
  and, with `games`, the keys `sanction_of:` and `reward_of:` to a
  payoff term;
- the amendment extension
  ([Appendix K](./appendix-k-amendment.md)), declared as `amendment`
  with version `0.1`, which adds the key `amendment:` to `sos_body`
  (amendable parameters, the version and its transitional provisions,
  decision records) and the keys `schedule:` and `measure:` to
  `metric_def` (A.3);
- the motivation extension ([Appendix C](./appendix-c-motivation.md)),
  which defines `motivation_block`. It has no `extensions:` name in
  v0.3 and is used simply by writing a `motivation:` block.

## A.3 Context, actors, metrics

```ebnf
context_block  = [ "environment:" , { identifier , ":" , scalar } ] ,
                 [ "assumptions:" , { "-" , text } ] ;

actor_def      = "id:"   , actor_ref ,
                 "role:" , text ,
                 [ "autonomy:"     , autonomy_level ] ,
                 [ "capabilities:" , { "-" , text } ] ,
                 [ "interface:"    , interface_def ] ,
                 [ "agent:"        , agent_binding ] ;   (* Appendix G *)
autonomy_level = "low" | "medium" | "high" ;
interface_def  = [ "input:"  , { "-" , text } ] ,
                 [ "output:" , { "-" , text } ] ;

metric_def     = "id:" , identifier ,
                 [ "formula:" , predicate ] ,          (* string *)
                 [ "target:"  , scalar ] ,
                 [ "schedule:" , { "-" , schedule_entry } ] ,  (* Appendix K *)
                 [ "measure:"  , measure_def ] ;               (* Appendix K *)
```

`autonomy:` defaults to `medium`. In `actor_def`, the index of `id:` is
normally a range (`"ROBOT[1..N]"`) and declares a parameterised set of
actors. The upper bound of a `range_expr` is an integer or an
identifier. An identifier such as `N` is a symbolic size; v0.3 has no
construct that binds it to a value (see
[A.12](#a12-reference-implementation-status-v03) for what the reference
implementation does with it). A non-string value in `environment:` is read as a literal
(A.1); a string value is kept verbatim.

## A.4 Contracts (Institution layer)

The Institution layer consists of `contracts:`, defined here, together
with `actors:` (A.3) and `transitions:` (A.7).

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
                    [ "monitors:"         , { "-" , monitor_def } ] , (* Appendix E *)
                    [ "norms:"            , { "-" , norm_def } ] ,    (* Appendix F *)
                    [ "counts_as:"        , { "-" , counts_as_def } ] , (* Appendix F *)
                    [ "enforcement:"      , enforcement_block ] ,     (* Appendix G *)
                    [ "delegations:"      , { "-" , delegation_def } ] , (* Appendix G *)
                    [ "grounding:"        , grounding_block ] ;       (* Appendix J *)

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
A `sharing_entry` MUST be written as a quoted string
(`- "TAXI[*] -> CENTRAL : position"`); unquoted, YAML reads it as a
one-entry mapping and not as a string.

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

### A.7.1 Regime bindings {/* #a71-regime-bindings */}

From `cadl` 0.3.32 the block `regimes:` binds, per regime, values of
declared parameters and the contracts in force.

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
        ROUTING.beta: 0.9           # authority.beta of the contract ROUTING
        environment.bays: 3         # the entry bays of context.environment
      contracts: { active: [ROUTING, BAY_ASSIGNMENT] }
```

A `param_ref` names a value that the file declares: `C.alpha`,
`C.beta`, and `C.lambda` are `information.alpha`, `authority.beta`, and
`incentives.lambda` of the contract with `id: C`, and `environment.X` is
the entry `X` of `context.environment`. These are the sources of a
parameter of the stochastic model extension
([Appendix H, H.3](./appendix-h-stochastic.md)).

**Semantics.** In a regime `R`, the value of a parameter is the value
that `R` binds to it, if any, and otherwise its declared value. A
contract is in force in `R` when `R` gives `active:` and lists it, when
`R` gives `suspended:` and does not list it, or when `R` gives neither.
A regime without an entry keeps every declared value and has every
contract in force; a file without `regimes:` behaves as one in which no
regime has an entry. A file without regimes (without `transitions:`)
has every contract in force at all times, even when it has an empty
`regimes:` block. The declared values themselves are not changed: the
contract keeps the number written in it. A transition from `R` to `R'`
replaces the bindings of `R` by those of `R'`, at the point that "Runs"
below fixes.

**Runs.** From `cadl` 0.3.33 this appendix fixes in which regime a run
of the system is at each step. These rules apply to every file with
`transitions:`, with or without a `regimes:` block; the bindings
(parameter values and the contracts in force) apply only to a file with
the block, and without it every contract is in force at every step. A *step* is the unit at which a runtime
evaluates contracts: one cycle of the generated Python runtime, one call
of `runMonitorCycle()` of the generated Solidity, one decision of the
generated Rego policy, and one observation of a trace of the norms
extension ([Appendix F](./appendix-f-norms.md), F.5).

1. At every step exactly one regime is current.
2. A run starts in the *initial regime*: the first `from:`, in the order
   of `transitions:`, that is not the `to:` of any transition, and
   otherwise the `from:` of the first transition. This is the initial
   state of the regime map of `cadl regime-map`. A host MAY start a run
   in another regime; until it names one, the run is in the initial
   regime.
3. After the evaluations of a step, the transitions from the current
   regime are considered in the order of `transitions:`, and the first
   whose `condition:` holds is selected; a condition that cannot be
   evaluated (it reads a value that is not given) does not hold, and the
   run goes on. Its `safety_invariant:` is
   checked then: when it holds, the transition is taken; when it does
   not hold, or cannot be evaluated, the transition is not taken, the
   regime stays, and the processor reports the refused transition. A
   transition is never taken without its invariant. At most one
   transition is taken per step. The
   `protocol:` of a transition names how the parties carry it out; its
   messages belong to the steps at which they are sent and do not delay
   the change of regime.
4. The bindings change together with the regime, between two steps.
   Every evaluation of a step (the `assume:` and `guarantee:` items, the
   monitors, the norms, and the policies, and every parameter value that
   generated code reads) uses the bindings of the regime current at that
   step and of no other regime. Two contracts are therefore in force at
   the same step only if some regime has both in force.
5. A contract that is not in force at a step is not evaluated at it.
   For the norms extension, F.5 ("Contracts not in force") defines what
   a contract instance sees when its contract is not in force: its norm
   instances keep their states, their deadlines and the intervals of the
   temporal operators do not advance, and nothing that happens meanwhile
   counts.

A run with versions of the amendment extension combines these rules
with the versions in force: from `cadl` 0.3.35 the regime transition
chosen at the end of a step is taken before the versions that take
effect at the next step, and the contracts in force are those of the
bindings of the version in force
([Appendix K, K.11, "Versions and regimes"](./appendix-k-amendment.md#versions-and-regimes)).

A predicate cannot name a parameter (A.10), so the parameter values of
a regime change only the code that writes them out (the institutional
parameters of the Solidity and Rego targets, the parameters of the
generated Python runtime) and the models of Appendices H and I, which
evaluate each regime as a design of its own.

A runtime that does not take transitions itself, such as the generated
Rego policies, is told the current regime by its host; the host then
takes the transitions and checks their invariants as items 2 and 3 say.
An empty block (`regimes: {}`) in a file with `transitions:` binds
nothing, but makes the file one with bindings: the generated code reads
the regime (for example, a Rego contract policy then requires
`input.regime`).

**Static rules.** A processor MUST report the following as errors.

- **R-1** A key of `regimes:` is a regime of the file, a name used in
  `from:` or `to:` of `transitions:`. A file without `transitions:` has
  no regimes and therefore no entries. A regime name that YAML 1.1 reads
  as a boolean or null (`yes`, `ON`, `null`) MUST be quoted.
- **R-2** An entry has no keys other than `parameters:` and
  `contracts:`.
- **R-3** A `param_ref` names `alpha`, `beta`, or `lambda` of a declared
  contract that writes that value, or an entry of `context.environment`.
- **R-4** The value of `C.alpha`, `C.beta`, or `C.lambda` is a number in
  `[0, 1]`. The value of `environment.X` has the type of the entry: a
  boolean for a boolean, an integer for an integer, an integer or a
  number for a number, a string for a string; an entry that is not a
  scalar cannot be bound.
- **R-5** `contracts:` has exactly one of `active:` and `suspended:`,
  and its list names declared contracts, each at most once.
- **R-6** A regime binds a parameter at most once (`ROUTING.beta` and
  `"ROUTING . beta"` are the same parameter), and it does not bind
  `alpha`, `beta`, or `lambda` of a contract that is not in force in it.
- **R-7** In a file that declares `stochastic: 0.1`, the value that a
  regime binds to a source is the value, under the design of that regime,
  of every model parameter with that `from:`. `model.regimes:` MAY give
  such a parameter the same value in the same regime and MUST NOT give it
  another one (H.6). A `regimes:` block that breaks R-1 to R-6 leaves the
  designs of the model undefined.

**IR.** `cadl sim-ir` writes two additions to the three-layer IR
(module `cadl.sim.ir`):

- each entry of `transitions` carries `safety_invariant`, the predicate
  as written (like `condition`), when the transition has one; the key is
  absent otherwise;
- a file with `regimes:` gets the top-level key `regimes`, a list with
  one entry per regime in order of first appearance in `transitions:`:

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

`parameters` holds the values the regime binds, keyed by the
`param_ref` without spaces; a parameter that is absent has its declared
value, which the IR keeps in the contract (`governance`) or in
`environment`. The two contract lists are complete and in declaration
order. `regimes` is `null` when the block breaks one of R-1 to R-6; a
conflict with `model.regimes:` (R-7) concerns the stochastic model only,
and `regimes` is then written. The key is absent for a file without the
block, whose IR is the same as in `cadl` 0.3.31 apart from
`safety_invariant`.

## A.8 Verification block

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

Operators bind, from loosest to tightest: `OR`, `AND`, `NOT`, comparison,
`+` `-`, `*` `/`, unary `-`. A unary `-` in front of a numeric literal
gives a negative number (`permit_state == -2`); in front of any other
factor, `-x` has the value of `0 - x`. Binary operators of equal precedence associate to the
left. A comparison is not associative (`a < b < c` is not a predicate).
A quantifier extends as far to the right as possible. White space
between tokens is ignored.

A `comprehension` is the argument of an aggregate function and
evaluates its `predicate` once for each value of the bound identifier,
for example `sum(ROBOT[i].goal_count for i in 1..N)` or
`sum(r.load for r in ROBOT[*])`.

This appendix fixes the form of quantifiers and comprehensions, not the
set of aggregate functions or the values of these expressions on
observations. The norms extension defines them for its dynamic
semantics: the domain of a quantifier or comprehension (a set of
actors, possibly with a symbolic bound, or a range), the meaning of the
bound identifier, the aggregate functions `sum`, `count`, `min`, `max`,
and `avg`, and three-valued values over domains whose members are not
all known ([Appendix F, F.5](./appendix-f-norms.md), "Quantifiers and
aggregates"). An `indexed_ref` with `*` or a range outside a domain,
as in `ROBOT[*].battery > 10`, is shorthand that the norms extension
rewrites into a quantifier or a comprehension
([Appendix F, F.5](./appendix-f-norms.md), "Wildcard and range
references"): the smallest comparison that contains it holds for every
member, and in the argument of an aggregate it ranges over the members.

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
| `sos` | `name` `type` `version` `description` `extensions` `context` `actors` `contracts` `protocols` `algorithms` `transitions` `regimes` `metrics` `verification` `codegen` `motivation` `model` |
| `context` | `environment` `assumptions` |
| actor | `id` `role` `autonomy` `capabilities` `interface` (`input` `output`) |
| contract | `id` `parties` `assume` `guarantee` `authority` `information` `responsibilities` `incentives` `violation` `duration` `lifecycle` `monitors` `norms` `counts_as` `enforcement` `delegations` `grounding` |
| norm (Appendix F) | `id` `kind` `bearer` `counterparty` `trigger` `until` `content` `deadline` `on_violation` (`severity` `sanction` `reparation` `transition`) `effects` (`activate` `suspend` `resume` `discharge`) `on_amendment` (`transform`) |
| counts-as rule (Appendix F) | `when` `creates` `if` |
| agent governance (Appendix G) | actor `agent` (`kind` `protocol` `tools`); contract `enforcement` (`default` `point`), `delegations` (`norm` `to` `grant` `revoke` `max_depth` `until`); prohibition `on_denied` (`escalate_to` `timeout` `fallback` `notify`) |
| stochastic model (Appendix H) | `model` (`kind` `parameters` `variables` `commands` `labels` `regimes` `rewards` `properties` `regime_maps`); the keys of each entry are listed in H.2 |
| strategic model (Appendix I) | `model` (`players` `profiles` `compliance` `payoffs` `equilibria`); command `owner`; property and regime map `profile`; the keys of each entry are listed in I.2 |
| amendment (Appendix K) | `sos` `amendment` (`previous` `effective` `transitional` `decisions` `layers` `parameters`); metric `schedule` (`from` `target` `decision`), `measure` (`window` `every` `aggregate` `runs` `across_runs` `description` `decision`); the keys of each entry are listed in K.3 to K.5 |
| grounding (Appendix J) | contract `grounding` (`items` `tolerance`); norm `shares`, `on_fulfilment` (`reward` `magnitude`), `on_violation` (`magnitude`); payoff term `sanction_of` `reward_of` |
| `authority` | `decision_scope` `decision_holder` `beta` `mode` |
| `information` | `alpha` `views` `sharing` |
| `incentives` | `type` `lambda` `rules` |
| `violation` | `detect` `action` `escalation` |
| protocol | `id` `trigger` `precondition` `steps` `timing` `fallback` `rollback` (`condition` `action`) `postcondition` `safety_invariant` |
| step | `if` `else` `parallel` `barrier` |
| algorithm | `central` `local` |
| transition | `from` `to` `condition` `protocol` `safety_invariant` |
| regime binding (A.7.1) | `parameters` `contracts` (`active` `suspended`) |
| metric | `id` `formula` `target` |
| verification | `id` `type` `target` `property` `method` `expr` `bound` |
| codegen | `target` `output` `mappings` |

Enumerated values: `Directed` `Acknowledged` `Collaborative` `Virtual`
(SoS type); `low` `medium` `high` (autonomy); `smt` `model_check`
`simulation` `proof` (verification method); `ms` `s` `min` `h`
(duration units). The keys and values of the extensions are listed in
[Appendix C](./appendix-c-motivation.md),
[Appendix E](./appendix-e-sos-dsl.md),
[Appendix F](./appendix-f-norms.md),
[Appendix G](./appendix-g-agents.md),
[Appendix H](./appendix-h-stochastic.md),
[Appendix I](./appendix-i-games.md),
[Appendix J](./appendix-j-grounding.md), and
[Appendix K](./appendix-k-amendment.md).

## A.12 Reference implementation status (`cadl` 0.3) {/* #a12-reference-implementation-status-v03 */}

The reference implementation reads the file with a YAML 1.1 loader and
is lenient: only a missing `sos:` mapping, invalid YAML, an invalid
`type:`, and an `alpha`, `beta`, or `lambda` that is not a number are
rejected by the parser. `cadl check` additionally reports duplicate
ids, undeclared actors, a party listed twice, a contract without
parties, governance parameters outside `[0, 1]`, a `severity:`
other than `Minor`, `Major`, or `Critical`, an `autonomy:` other than
`low`, `medium`, or `high`, an id or regime name that
is not an identifier, a malformed `sharing:` entry, and a violation of
rules L-1, L-2, L-3, L-5, M-1 (from `cadl` 0.3.11), or M-3 of
[Appendix E](./appendix-e-sos-dsl.md#e4-static-semantics), and (from `cadl` 0.3.12) a `deadline:` or
`sampling:` value that cannot be read, as errors. In an item of
`assume:` or `guarantee:`, a name counts as an actor reference, and
must be declared, when it is indexed (`ROBOT[i]`) or is the object of a
member access (`ROBOT.battery`), including inside an index; a name
standing alone is taken as a state variable and is not checked. The
predicates of `condition:`, `safety_invariant:`, `formula:`, `expr:`,
monitor `rule:`, lifecycle `when:`, and an `on:` that is not a message
event are not checked for undeclared actors. Other
missing required keys are replaced by an empty value. `cadl` 0.3
deviates from this appendix as follows (checked against `cadl` 0.3.35).

- **Expressions.** Expressions follow A.10 and A.11 in `cadl` 0.3.35; no
  deviation is known. Up to `cadl` 0.3.17 the unary `-` of `factor` was
  not accepted: an item that used it was kept as an opaque predicate,
  and for a lifecycle `on:` or `when:` or a monitor `rule:`, `cadl check`
  gave a warning.
- **Identifiers.** From `cadl` 0.3.9, `cadl check` reports as an error
  an actor, contract, protocol, or metric id, or a regime name, that is
  not an identifier of A.1 (for example one with non-ASCII characters
  or a hyphen) or that is a reserved word of A.11 or the `IN` of
  [Appendix E](./appendix-e-sos-dsl.md). From `cadl` 0.3.10 the same
  check applies to the names of lifecycle states, the ids of lifecycle
  transitions and monitors, and the violation labels of monitors. The
  ids of verification entries are not checked. Up to `cadl` 0.3.12 an
  unquoted `true` or `false` used as such a name or as a regime name was
  read by YAML as a boolean, became `True` / `False`, and was accepted.
- **Ranges.** A range with a symbolic bound (`"TAXI[1..N]"`) is kept as
  written. `N` is not looked up in `environment:`, and an index is not
  checked against the declared range. `cadl sim-gen` writes a `count`
  only when both bounds are integers.
- **Types.** The types of [Section 5.2.1](./05-language-spec.md) are not
  checked. A value
  written with a type constructor (for example `Range(1, 4)`) is kept
  as text.
- **Lenient forms.** The parser also accepts `parties:` written as one
  string (`"[A, B]"`), a non-negative numeric `deadline:`, possibly
  fractional (read as seconds), a duration or period with a space before
  its unit (`5 s`, `periodic( 500ms )`), `sampling:` written as the
  mapping `{kind: periodic, period_ms: <non-negative integer>}` or
  `{kind: event}`, and a `method:` in any letter case. These forms are not part of this
  appendix.
- **Steps.** From `cadl` 0.3.10 the `else:` branch of a
  `conditional_step` and the condition of a `barrier_step` are
  retained, so actors named in an `else:` branch are checked and both
  reach the simulator IR; earlier releases discarded them.
- **Contracts.** From `cadl` 0.3.9, a `sharing:` entry that is not a
  string of the form `"SOURCE -> TARGET : item"`, or whose item does not
  begin with an identifier, is an error in `cadl check`; earlier
  releases dropped an unquoted entry without a diagnostic. An entry
  whose item begins with an identifier and continues with other text,
  such as the arguments in `"A -> B : report(period: 5s)"`, is accepted
  with a warning and only the leading name is kept; this form is not
  part of this appendix. From `cadl` 0.3.10 an `autonomy:` value other
  than `low`, `medium`, or `high` is an error in `cadl check`; earlier
  releases read it as `medium` without a diagnostic.
- **Regimes.** From `cadl` 0.3.32 `cadl check` applies R-1 to R-7 of
  A.7.1, and the bindings are used where the tools read parameters and
  contracts: `cadl sim-ir` writes them (A.7.1) and `cadl sim-gen` passes
  them to the `python` and `go` configurations (`regimes`) and to the
  `unity` configuration (`regimeBindings`). `cadl verify` checks every
  pair of contracts that share a party. When no regime has both in force
  under the regime bindings of A.7.1, the pair is reported as `info`
  with the regimes of each, also when the two contradict each other:
  from `cadl` 0.3.33 every step of a run has the bindings of one regime
  (A.7.1, "Runs"), so the two are never in force at the same step. In
  0.3.32, which left that step open, such a conflict was a warning
  (`WARN`). A pair that some regime has in force is judged as before,
  and a pair that the solver does not decide stays `unknown`. A file
  without regimes has every contract in force, so every pair is judged
  as before, even with an empty `regimes:` block. `cadl regime-map`
  shows, from `cadl` 0.3.33, the bindings of each regime in its text,
  DOT, and JSON outputs (JSON: the key `regimes`, in the form of the IR,
  `null` for a block that breaks R-1 to R-6); its analysis reads only
  the transitions and is not changed by the bindings. The code
  generators apply the bindings from `cadl` 0.3.33
  ([Appendix D](./appendix-d-codegen.md), D.1): the `python` target
  starts the regime controller in the initial regime, rejects a name
  that is not a regime, checks the safety invariant of a transition
  explicitly and does not take the transition when it fails, gives the
  controller the methods `parameters()`, `contract_active()`, and
  `apply_bindings()`,
  exposes the values of the current regime in `ctx.parameters`, and runs
  the monitor of a contract only in the regimes in which it is in force
  (from 0.3.32); its norms monitor and `cadl norms-eval` read the
  current regime from the trace, which is in the initial regime until it
  names one (F.5, F.10). The `solidity` target makes one step one call
  of the orchestrator and checks the safety invariants in the same way;
  the `solidity` and `opa` targets read the current regime for the
  contracts in force and the institutional parameters. From `cadl`
  0.3.36 the norms monitors of the `opa` and `solidity` targets (D.5),
  the `unity-csharp` target, and the boundary policies of
  [Appendix G](./appendix-g-agents.md) (`cadl agents-decide`,
  `agent-rego`, `agent-cedar`) follow the current regime as well; in
  0.3.33 to 0.3.35 they refused a contract that some regime does not
  have in force. From `cadl` 0.3.36 `cadl agents-run` and the gateways of
  Appendix G follow the current regime too: a trace line, or the host of
  a gateway, names it (G.13); in 0.3.33 to 0.3.35 they refused a file in
  which a regime does not have an enforced contract in force. Up to 0.3.32 the
  generated `unity-csharp`, `solidity`, and `opa` code, the online
  monitor of the norms, and `cadl regime-map` did not use the bindings,
  the Python regime controller started in the `from:` of the first
  transition and checked the safety invariant with `assert`, and the
  Solidity `RegimeController` started in the first regime in
  alphabetical order, did not check the invariant, had no setters, and
  could be called by anyone. From 0.3.33 the rules of "Runs" (the
  initial regime, the explicit check, one step per call of the
  orchestrator) apply to every file with transitions. The
  `safety_invariant` of a transition is in the IR and the simulator
  configurations from `cadl` 0.3.32; up to 0.3.31 `cadl check` checked it
  but `cadl sim-ir` left it out.
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
  ([Appendix D](./appendix-d-codegen.md)). From `cadl` 0.3.9, an entry
  whose `target:` the implementation cannot emit (for example
  `target: ros2`) gets a warning from `cadl check`, `cadl verify`, and
  `cadl codegen`, which is the diagnostic that
  [Appendix D, Section D.4](./appendix-d-codegen.md) requires; the file
  remains valid. On the command line `-t ros2` is rejected.
- **Extensions.** `lifecycle:` and `monitors:` are recognised whether
  or not `extensions:` declares `sos-dsl`. From `cadl` 0.3.9,
  `cadl check` emits an informational diagnostic, which never makes a
  file invalid, for an `extensions:` name other than `sos-dsl`, for a
  version of `sos-dsl` other than `0.1`, and for a `motivation:` block,
  as [Appendix C](./appendix-c-motivation.md) asks of a processor that
  does not implement the extension. The `motivation:` block is not
  interpreted, but `cadl sim-ir` passes it on as written under the key
  `motivation_block`
  ([Appendix C, Section C.6](./appendix-c-motivation.md)); the key is
  absent when the file has no such block. Where `cadl` falls short of
  Appendix E itself is stated in
  [Section E.4](./appendix-e-sos-dsl.md#e4-static-semantics). From
  `cadl` 0.3.19 the declared extension `norms` with version `0.1` is
  implemented and gets no such diagnostic; what `cadl` implements of
  Appendix F is stated in
  [Section F.10](./appendix-f-norms.md#f10-reference-implementation-status).
  From `cadl` 0.3.20 the same holds for `agents` 0.1
  ([Appendix G, G.13](./appendix-g-agents.md)) and `stochastic` 0.1
  ([Appendix H, H.14](./appendix-h-stochastic.md)), and `cadl sim-ir`
  emits the key `stochastic_model`, which is `null` for a file without
  that extension. `cadl` 0.3.22 adds the certified regime maps of H.9,
  the runtime of G.5 to G.8 with the rules G-17 to G-19, and the online
  monitor of norms in the generated Python code; the three sections
  named above state what each covers. The extensions `games` 0.1
  ([Appendix I, I.14](./appendix-i-games.md#i14-reference-implementation-status))
  and `grounding` 0.1
  ([Appendix J, J.11](./appendix-j-grounding.md#j11-reference-implementation-status))
  are implemented from `cadl` 0.3.23 (`cadl game-check`,
  `cadl norms-indices`); the two sections named state what each
  covers. Up to 0.3.22 their names got the informational diagnostic
  for an unknown extension; for a model with `kind: smg`, `cadl check`
  0.3.22 reports errors of S-1 and S-9 where H.10 and H.15 ask for one
  informational diagnostic, and it ignores the keys of Appendix J
  without a diagnostic. The extension `amendment` 0.1
  ([Appendix K, K.9](./appendix-k-amendment.md#k9-reference-implementation-status))
  is implemented from `cadl` 0.3.32 (`cadl amend-diff`); up to 0.3.31
  its name got the informational diagnostic for an unknown extension
  and its keys were ignored.

Releases of `cadl` before 0.3.7 differed in several of these points; the history
is in the
[CHANGELOG](https://github.com/ertlnagoya/cadl/blob/master/CHANGELOG.md)
of the cadl repository.
