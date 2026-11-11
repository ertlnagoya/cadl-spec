---
sidebar_position: 18
title: "Appendix H: Stochastic Model Extension"
description: "Stochastic model extension (stochastic 0.1): a declarative parametric discrete-time Markov chain in which the institutional parameters appear, regimes as designs, PCTL-style properties, regime map queries with certified cells, and a normative export to the PRISM modelling language."
---

# Appendix H — Stochastic Model Extension (stochastic 0.1)

This appendix specifies the **stochastic model extension** to CADL. It
adds one key, `model:`, to the `sos_body` production of
[Appendix A.2](./appendix-a-syntax.md#a2-top-level-structure). With it,
a file can carry an explicit stochastic model in which the
institutional parameters α, β, and λ appear, state properties of that
model, and ask the question of a regime map: which regime is best in
which region of the parameter space.

The core language does **not** mandate this block; a conforming CADL
processor that does not implement the extension MUST NOT reject a file
because of the new key. It SHOULD accept it syntactically and emit an
*informational* diagnostic. The extension is versioned independently
from the core language: its name is `stochastic` and this appendix
describes version `0.1`. A file that uses it MUST declare it with the
entry `- stochastic: 0.1` under `extensions:` (H.15 says what a
processor does with an undeclared use).

The extension changes the meaning of no construct of the core language
or of the other extensions; in particular the `verification:` block of
[Appendix A.8](./appendix-a-syntax.md#a8-verification-block) is
unchanged.

## H.1 Motivation and scope

[Section 5.4.2](./05-language-spec.md) says that the institutional
parameters "form the basis for regime map construction", but nothing in
the core language connects a parameter to behaviour, and the
`cadl regime-map` command reports the graph of regime names, not a map
of the parameter space. RD-1.3 of [Section 9.1](./09-research.md) asks
for that connection. Parameter synthesis for parametric Markov models
partitions a parameter space into regions certified to satisfy or to
violate a property [[Junges+, FMSD 2024]](./appendix-b-references.md),
and Storm implements it and reads the PRISM modelling language
[[Hensel+, STTT 2022]](./appendix-b-references.md)
[[Kwiatkowska+, CAV 2011]](./appendix-b-references.md); CADL has no model to
give to such a tool. Stochastic 0.1 is a small first step:

- **The author writes the model**: state variables and probabilistic
  commands that refer to parameters. Nothing is derived from contracts,
  protocols, or norms. What the extension fixes is the link: a
  parameter can be *bound* to `alpha`, `beta`, or `lambda` of a
  contract, so that contract and model use the same number.
- **The semantics is a translation.** A model and a regime define a
  parametric discrete-time Markov chain (H.7), which a processor
  exports to the PRISM modelling language by fixed rules (H.11).
- **The regime map question is defined, not solved.** H.9 defines what
  a query asks and what a correct answer is, not how to compute it.
  H.14 describes the method of the reference implementation.

**Scope of version 0.1.**

- Time is discrete: one step is one transition, unrelated to a
  `duration_lit`. No continuous-time or timed models; finite state.
- Every regime model is a Markov chain: no nondeterminism (S-9), no
  synchronisation of commands.
- A switch between regimes (A.7) is not part of the model: each regime
  is analysed as a model of its own.
- Monotonicity claims ("raising α does not lower the success
  probability") are deferred; monotonicity checking exists for
  parametric Markov chains
  [[Spel+, ATVA 2019]](./appendix-b-references.md), but that work
  concerns reachability probabilities.
- There is no game semantics in this appendix. Reading the model as a
  game among the actors, to ask whether compliance is an equilibrium
  (RD-7.1, RD-7.2 of [Section 9.7](./09-research.md); rational
  verification [[Gutierrez+, AI 2020]](./appendix-b-references.md),
  correlated equilibria of concurrent stochastic games
  [[Kwiatkowska+, TACAS 2022]](./appendix-b-references.md)), is the
  subject of the strategic model extension
  ([Appendix I](./appendix-i-games.md), `games` 0.1). **Reserved** for
  it, and not to be used with another meaning: the keys `owner:` (of a
  variable or a command) and `sync:` (of a command); `players:`,
  `payoffs:`, and `equilibria:` of `model:`; the value `mdp` of
  `kind:`; and the parameter sources `motivation.rho` and
  `motivation.kappa`. In a file that declares `games: 0.1`,
  Appendix I defines `players:`, `payoffs:`, `equilibria:`, and
  `owner:` of a command, adds the value `smg` of `kind:`, and replaces
  S-9 for a model of that kind; `sync:`, `owner:` of a variable,
  `mdp`, and the two parameter sources remain reserved there too. In a
  file that does not declare it, all of them remain reserved.

## H.2 Syntax (EBNF addition to A.2)

The grammar uses the notation of
[Appendix A](./appendix-a-syntax.md). `identifier`, `int_literal`,
`bool_literal`, `string`, `number`, `scalar`, and `comp_op` are
defined there. `sos_body` gains one optional key:

```ebnf
sos_body        = ... ,
                  [ "model:" , model_block ] ;

model_block     = [ "kind:"        , "dtmc" ] ,
                  [ "parameters:"  , { "-" , param_def } ] ,
                  "variables:"   , { "-" , var_def } ,
                  "commands:"    , { "-" , command_def } ,
                  [ "labels:"      , { identifier , ":" , state_pred } ] ,
                  [ "regimes:"     , { identifier , ":" , regime_def } ] ,
                  [ "rewards:"     , { "-" , reward_def } ] ,
                  [ "properties:"  , { "-" , property_def } ] ,
                  [ "regime_maps:" , { "-" , regime_map_def } ] ;

param_def       = "id:" , identifier ,
                  ( "from:" , param_source , [ "range:" , interval ]
                  | "range:" , interval , [ "value:" , number ] ) ;
param_source    = identifier , "." , ( "alpha" | "beta" | "lambda" )
                | "environment" , "." , identifier ;            (* string *)
interval        = "-" , number , "-" , number ;   (* a sequence of exactly two numbers: [lo, hi] *)

var_def         = "id:"   , identifier ,
                  "type:" , var_type ,
                  "init:" , scalar ;
var_type        = "bool" | int_range | enum_type ;              (* string *)
int_range       = "[" , int_const , ".." , int_const , "]" ;
enum_type       = "{" , identifier , { "," , identifier } , "}" ;
int_const       = [ "-" ] , int_literal ;

command_def     = [ "action:" , identifier ] ,
                  [ "when:"   , { "-" , identifier } ] ,
                  [ "guard:"  , state_pred ] ,                  (* string *)
                  "updates:"  , { "-" , update_def } ;
update_def      = [ "prob:" , ( param_expr | "rest" ) ] ,       (* string or number *)
                  [ "set:"  , { identifier , ":" , state_pred } ] ;

regime_def      = [ "parameters:" , { identifier , ":" , number } ] ;

reward_def      = "id:"    , identifier ,
                  "items:" , { "-" , reward_item } ;
reward_item     = [ "action:" , identifier ] ,
                  [ "guard:"  , state_pred ] ,                  (* string *)
                  "value:"    , param_expr ;                    (* string or number *)

property_def    = "id:"   , identifier ,
                  [ "regimes:" , { "-" , identifier } ] ,
                  "expr:" , property ;                          (* string *)

regime_map_def  = "id:"        , identifier ,
                  "over:"      , { identifier , ":" , interval } ,
                  [ "regimes:"    , { "-" , identifier } ] ,
                  "objective:" , objective ,
                  [ "constraint:" , threshold_prop ] ,          (* string *)
                  [ "resolution:" , number ] ;
objective       = "maximize:" , query_prop                      (* string *)
                | "minimize:" , query_prop ;                    (* string *)
```

Three small expression languages are written inside string scalars.
`state_pred` and `param_expr` are subsets of the `predicate` and
`arith_expr` of
[Appendix A.10](./appendix-a-syntax.md#a10-expressions), with the same
precedence and associativity; `property` is new (H.8).

```ebnf
state_pred      = s_and , { "OR" , s_and } ;
s_and           = s_not , { "AND" , s_not } ;
s_not           = "NOT" , s_not | s_cmp ;
s_cmp           = s_sum , [ comp_op , s_sum ] ;
s_sum           = s_term , { ( "+" | "-" ) , s_term } ;
s_term          = s_factor , { "*" , s_factor } ;
s_factor        = "(" , state_pred , ")" | "-" , s_factor
                | int_literal | bool_literal | identifier ;

param_expr      = p_term , { ( "+" | "-" ) , p_term } ;
p_term          = p_factor , { "*" , p_factor } ;
p_factor        = "(" , param_expr , ")" | "-" , p_factor
                | decimal | identifier ;
decimal         = int_literal , [ "." , int_literal ] ;

property        = query_prop | threshold_prop ;
query_prop      = quantity , "=?" , "[" , path , "]" ;
threshold_prop  = quantity , threshold_op , decimal ,
                  "[" , path , "]" ;
quantity        = "P" | "R" , "{" , string , "}" ;
threshold_op    = ">=" | ">" | "<=" | "<" ;
path            = "F" , [ step_bound ] , state_pred
                | state_pred , "U" , [ step_bound ] , state_pred ;
step_bound      = "<=" , int_literal ;
```

With `R{"…"}` the path MUST be `F φ` without a step bound (S-13). A
`state_pred` has no quantifiers, function calls, member accesses,
indexed references, strings, durations, floating-point literals, or
division. A `param_expr` is a polynomial: no division, no comparison,
no function call. A number in the three sub-languages is digits with an
optional fractional part (`decimal`); there is no exponent form.

**Writing the values in YAML.** A `var_type` other than `bool`, a
`from:`, an `expr:`, and the values of `maximize:`, `minimize:`, and
`constraint:` MUST be quoted strings; a property with a reward name is
written in a single-quoted scalar (`'R{"delay"}<=1.5 [ F done ]'`). A
`prob:`, a reward `value:`, an `init:`, and the right-hand side of a
`set:` entry may be a YAML number or boolean instead of a string
(`prob: 0.5`, `init: false`), and a `guard:` may be the YAML boolean
`true` or `false`. Under a YAML 1.1 loader the unquoted
scalars `ON`, `No`, `Off`, `Yes`, `null`, and `~` are booleans or null,
not names: such a name MUST be quoted where it is a mapping key
(`model.regimes:`, `over:`, `set:`) or an `init:` value (see
[A.12](./appendix-a-syntax.md#a12-reference-implementation-status-v03)).
Such a loader also reads `1e-3` as a string; numbers SHOULD be written
without an exponent (`range: [0, 0.001]`).

**Numbers** are real numbers and are treated exactly. A numeric literal
inside a string is the decimal fraction that is written. A numeric YAML
scalar is read as the shortest decimal that round-trips the
floating-point value the loader produced; an author MUST NOT write more
than 15 significant digits, so that this decimal is the one written.

**Defaults.** `kind:` is `dtmc`. `guard:` is `"true"`. An omitted
`prob:` is `rest`; an omitted `set:` changes no variable; an omitted
`when:` means every design. The `range:` of an institutional parameter
is `[0, 1]`. The `regimes:` of a property is all designs, that of a
regime map all regimes of the file. `resolution:` is `0.05`.

## H.3 Parameters

`model.parameters:` declares the parameters. A parameter without
`from:` is *free*. With `from:` it is *bound*:

| `from:` | Bound to | Declared value |
| --- | --- | --- |
| `"C.alpha"` | `information.alpha` of the contract with `id: C` | the number written there, if any |
| `"C.beta"` | `authority.beta` of the contract `C` | the number written there, if any |
| `"C.lambda"` | `incentives.lambda` of the contract `C` | the number written there, if any |
| `"environment.X"` | the entry `X` of `context.environment` | the entry, which MUST be a YAML number |

The word `environment` before the dot always denotes
`context.environment`; any other name MUST be the `id` of a contract. A
parameter bound to a contract is an **institutional parameter**. A
bound parameter has no `value:`; the **declared value** of a free
parameter is its `value:`, if present.

`range: [lo, hi]` is the closed interval `lo ≤ x ≤ hi` with finite
numbers `lo ≤ hi`, the **declared range**. For an institutional
parameter it defaults to `[0, 1]` and, when given, MUST lie within
`[0, 1]`; for every other parameter it is REQUIRED. Every value the
parameter is given anywhere in the file, including the number of the
contract it is bound to, MUST lie in the declared range (S-4).

Under a design `D` (H.6) the **fixed value** of a parameter is the
value the regime of `D` assigns to it, if it assigns one, and otherwise
the declared value. Every parameter MUST have a fixed value under every
design (S-11). A parameter is **open** in a regime map query when the
query lists it in `over:`; there it ranges over an interval and its
fixed value is not used. Everywhere else, in particular in every
property of `model.properties:`, every parameter has its fixed value.

## H.4 Variables, labels, and state expressions

`model.variables:` declares at least one state variable:

| `type:` | Domain | Values are written as |
| --- | --- | --- |
| `bool` | `false`, `true` | `true`, `false` |
| `"[lo..hi]"` | the integers `lo`, …, `hi`, with `lo ≤ hi` | integer literals |
| `"{A, B, C}"` | the listed enumeration literals, at least one, all different | the literal names |

`init:` is REQUIRED and MUST be a value of the domain; the single
initial state gives every variable its `init:` value. An enumeration is
not ordered. Two enumeration types are the same when they list the same
literals in the same order; a literal may occur in several types.

A `state_pred` is evaluated in a state. An identifier in it is a
variable, an enumeration literal, or, in a `property` only, a label; a
parameter MUST NOT appear in it. It is *integer* (integer literals and
variables with `+`, `-`, `*`), *boolean* (`true`, `false`, boolean
variables, labels, comparisons, and `AND`, `OR`, `NOT`), or of an
*enumeration* type (a literal or a variable). `<`, `<=`, `>`, `>=`
compare two integers; `==` and `!=` compare two integers, two booleans,
or two values of the same enumeration type, of which at least one is
a variable (two literals are not compared with each other). A guard, a label, a reward
guard, and each `state_pred` of a `property` MUST be boolean. Integer
arithmetic is exact and is not confined to a variable's range; only a
value assigned by an update must lie in the domain (H.5).

`model.labels:` names boolean state predicates
(`delivered: "task == Delivered"`). A label may be used in the
`state_pred` of a `property` wherever a boolean variable may, and
nowhere else; its own predicate refers to variables only.

## H.5 Commands

`model.commands:` is a list of guarded probabilistic commands; H.12
has an example.

**Enabledness.** A command *exists* in a design when it has no `when:`
or its `when:` lists the regime of the design. It is *enabled* in a
state when it exists in the design and its guard is true in the state.
In every state at most one command may be enabled (S-9).

**Updates.** Taking an update in a state s gives the state in which
each variable named in `set:` has the value of its right-hand side
evaluated in s (all right-hand sides before any assignment), and every
other variable keeps its value. The value MUST lie in the domain
whenever the command is enabled (S-7); it is never wrapped or clamped.

**Probabilities.** `prob:` is a `param_expr` over numeric literals and
parameters. At most one update of a command has the probability
`rest`, written or by omission: one minus the sum of the other
probabilities of the command. A command without `rest` MUST have only
probabilities without parameters, and they MUST sum to exactly 1
(S-8). A command in which a parameter occurs therefore always has
exactly one `rest`, and its probabilities sum to one by construction.

**Well-definedness.** A design is *well-defined at* an assignment of
numbers to all parameters when every probability of every command that
exists in the design, including the value of `rest`, lies in `[0, 1]`
and every reward value (H.8) is not negative. H.7 to H.9 are defined
only there; S-11 requires it at the fixed values and S-14 on the
region of a regime map.

**Graph preservation.** A region is *graph-preserving* for a design
when no probability of its commands is zero at a valuation of the
region unless it is zero at all of them. Where a probability becomes
zero, a solution function (H.7) need not be continuous: a probability
of reaching a state can drop to zero, and an expected reward can become
+∞. A processor MAY decline to certify cells that are not
graph-preserving; they are then `undecided` (H.9). A processor that
certifies such a cell MUST use a method that is sound without the
assumption; a method that assumes graph preservation MUST NOT be
applied to it.

**Action labels.** `action:` names a command; several commands may
share a name. Commands do not synchronise on it. Transition rewards
refer to it (H.8), and it appears in the exported model (H.11).

**Deadlock.** A state in which no command is enabled stays where it is
with probability 1. This is not an error; absorbing states such as
"delivered" are written by enabling nothing.

## H.6 Regimes and designs

[A.7](./appendix-a-syntax.md#a7-transitions) introduces regimes only
through `transitions:`: the **regimes** of a file are the names used
in `from:` and `to:` there. Comparing designs therefore requires a
`transitions:` block. `model.regimes:` assigns parameter values per
regime, and `when:` on a command (H.5) says in which regimes it exists:

```yaml
regimes:
  CENTRALIZED: { parameters: { beta: 0.9 } }
  DISTRIBUTED: { parameters: { beta: 0.1 } }
```

An assigned value replaces the declared value under that regime and
MUST lie in the declared range. For a bound parameter, the contract
gives the value of the design as declared, and a regime that assigns
it describes the operating mode in which it has another value. A
regime without an entry assigns nothing.

A **design** is a regime together with its parameter assignment and
the set of commands that exist in it; "the model under regime `R`",
"the design `R`", and "the institution `R`" all mean this. A file with
regimes has one design per regime, named after it; wherever designs
are listed or exported, their order is that of first appearance in
`transitions:` (the `from:` of an entry before its `to:`). A file without
`transitions:` has exactly one design, named `base`, with no
assignment and every command; in such a file `model.regimes:`,
`when:`, and `model.regime_maps:` MUST NOT appear (S-10). The
`condition:` of a `transition_def` is the operational rule for
switching; this appendix does not compare it with a regime map.

## H.7 Semantics: the induced parametric Markov chain

For a command c with k updates, write f(c, j) for the probability
expression of its j-th update (for `rest`: one minus the sum of the
others) and u(c, j)(s) for the state that the j-th update gives in
state s. Fix a design D, and let θ assign a number to every parameter
such that D is well-defined at θ (H.5); f[θ] is the value of f under θ.
The **regime model** of D at θ is the discrete-time Markov chain
M(D, θ) = (S, s₀, P):

- **States.** S is the set of all assignments of a domain value to
  every variable. It is finite and depends on neither θ nor D.
- **Initial state.** s₀ is the state given by the `init:` values.
- **Transition function.** If a command c is enabled in s under D (it
  is unique by S-9), P(s, s′) is the sum of f(c, j)[θ] over the updates
  j with u(c, j)(s) = s′. If no command is enabled in s, P(s, s) = 1
  and P(s, s′) = 0 for every other s′.

P(s, ·) is a probability distribution for every s. A path is an
infinite sequence of states s₀ s₁ s₂ … in which every P(sᵢ, sᵢ₊₁) is
positive; each transition is one **step**. M(D, θ) induces a
probability measure on paths in the standard way.

For a property (H.8), θ gives every parameter its fixed value under D.
For a regime map query with region B (H.9), each valuation v ∈ B gives
the θ that agrees with v on the open parameters and has the fixed
values elsewhere; the value of a query is then a function J_D of v,
from B to the real numbers extended with +∞, the **solution function**
of the design.

## H.8 Rewards and properties

**Rewards.** `model.rewards:` declares named reward structures. Each
item has a `value:`, a `param_expr` (it may depend on parameters, not
on the state). An item **without** `action:` is a *state reward*,
earned at each step taken from a state in which its guard is true,
including the self-loop of a deadlock state. An item **with** `action:`
is a *transition reward*, earned at each step in which a command with
that action label is taken from a state in which its guard is true.
The reward of a step is the sum of the values of all items of the
structure that apply to it.

**The property language.** A `property` (H.2) is written as in the
PRISM property language [[Kwiatkowska+, CAV 2011]](./appendix-b-references.md)
and is a small fragment of the probabilistic temporal logic PCTL
[[Hansson & Jonsson, 1994]](./appendix-b-references.md) with an
expected-reward operator, with the standard meaning. Operators cannot be nested. Let s₀ s₁ s₂ … be a path
and φ, φ₁, φ₂ state predicates.

| Path formula | The path satisfies it when |
| --- | --- |
| `F φ` | φ holds in sᵢ for some i ≥ 0 |
| `F<=k φ` | φ holds in sᵢ for some 0 ≤ i ≤ k |
| `φ₁ U φ₂` | φ₂ holds in sᵢ for some i ≥ 0, and φ₁ holds in every sⱼ with j < i |
| `φ₁ U<=k φ₂` | the same with 0 ≤ i ≤ k |

A step bound counts steps from the initial state. An `F` or `U` whose
next token is `<=` has a step bound, whatever the white space between
them (`F x <= 3` is the unbounded `F` of the predicate `x <= 3`).

| Property | Meaning in M(D, θ) |
| --- | --- |
| `P=? [ ψ ]` | the probability of the paths that satisfy ψ |
| `P⋈b [ ψ ]` | that probability ⋈ b, for ⋈ one of `>=`, `>`, `<=`, `<` |
| `R{"r"}=? [ F φ ]` | the expected reward of structure `r` accumulated until φ first holds |
| `R{"r"}⋈c [ F φ ]` | that expectation ⋈ c |

For `R`, let i be the first position of a path at which φ holds; the
accumulated reward of the path is the sum of the rewards of the steps
0, …, i − 1. The expected reward is the expectation of this sum when φ
is reached with probability 1, and +∞ otherwise; +∞ is greater than
every number. A property with `=?` is a **query**; one with a threshold
is a **threshold property**.

**`model.properties:`.** Each entry states a property of the designs
listed in `regimes:` (default: all designs), at the fixed values of all
parameters. The result, per design, is the value of a query, or
`satisfied` or `violated` for a threshold property. A processor that
reports results MUST compute them with exact arithmetic or with
numerics that have a sound error bound, or mark the result as
approximate; a threshold that the error bound does not decide is
`inconclusive`.

The operators `F` and `U` are not the `within`, `throughout`, and
`until` of [Appendix F](./appendix-f-norms.md): those are evaluated on
one timed trace of the running system and give a verdict, these on all
paths of the model, in steps, and give a probability or an expectation.
The two cannot be mixed, and version 0.1 defines no translation between
a norm and a property of the model.

## H.9 Regime map queries

`model.regime_maps:` lists **regime map queries** (an example is in
H.12). The keys of a query:

- **`over:`** gives the open parameters, at least one and at most four,
  each with a closed interval `[lo, hi]`, `lo < hi`, within the
  declared range. The region B is the box of these intervals. A
  parameter in `over:` MUST NOT be assigned by any regime in
  `model.regimes:`. Institutional parameters may be opened like any
  other, which is how a map over α or λ is asked for.
- **`regimes:`** lists the regimes to compare, at least two, each once.
- **`objective:`** has exactly one key, `maximize:` or `minimize:`,
  with a query. J_R(v) is the value of the query in the design of
  regime R at valuation v (H.7). Write x ⪰ y for "x is at least as good
  as y": x ≥ y under `maximize:` and x ≤ y under `minimize:`.
- **`constraint:`** is an optional threshold property. Write sat_R(v)
  for: the design of R satisfies the constraint at v (true when there
  is none) and, under `minimize:`, J_R(v) is finite. Under `maximize:`
  the value +∞ is admitted and is at least as good as every value.
- **`resolution:`** is a number r with 0 < r < 1: the fraction of the
  volume of B that may remain undecided.

Every compared design MUST be well-defined at every valuation of B
(S-14).

**What is asked.** At a valuation v, a regime is **optimal** when it
satisfies the constraint and is at least as good as every regime that
satisfies it:

```text
R ∈ opt(v)   iff   sat_R(v),  and  J_R(v) ⪰ J_R'(v)
                   for every compared regime R' with sat_R'(v)
```

opt(v) is empty exactly when no regime satisfies the constraint at v
(under `minimize:`, also when every regime has the value +∞), and has
several members when regimes tie. A **cell** is a closed box contained
in B. A regime R is **optimal on a cell** C when R ∈ opt(v) for every
v ∈ C; C is **infeasible** when opt(v) is empty for every v ∈ C.
Deciding that a regime is optimal on a cell is the **comparative
region verification** problem of RD-1.3. Region verification in
parameter synthesis asks whether one model satisfies a threshold on a
region [[Junges+, FMSD 2024]](./appendix-b-references.md); here the
solution functions of several models are compared with each other.

**The result.** The answer, the **regime map**, is a finite set of
cells that cover B and whose interiors are pairwise disjoint, each with
a `status` and a set `best`, together with the **undecided fraction**
(the volume of the `undecided` cells divided by the volume of B) and
whether it is at most `resolution:`.

| `status` | Claim | `best` |
| --- | --- | --- |
| `decided` | every regime in `best` is optimal on the cell | a non-empty set of regimes |
| `infeasible` | the cell is infeasible | empty |
| `undecided` | none: the best regime changes inside the cell, or the processor could not decide | empty |

`best` need not contain every regime that is optimal on the cell;
where regimes tie on a whole cell it SHOULD list them all. Because ⪰
is not strict, adjacent cells with different `best` sets are
consistent: on their common boundary the regimes of both are optimal.
The points at which the optimal regime changes pass through the
interior of cells, so some cells stay `undecided` however fine the
partition, which is why `resolution:` is greater than zero.

**Certified.** `decided` and `infeasible` are claims about **every**
valuation of the cell. A processor MUST NOT make them unless it has
established them by a method that is sound for the whole cell, with
exact arithmetic or numerics with a sound error bound; this holds also
for a claim about a single point. Region verification by parameter
lifting and exact reasoning on the solution functions are such
methods; evaluation at sample points, however many, is not. Only such
certified cells count toward `resolution:`. A processor that cannot
reach the requested resolution still reports the map and says so. A
processor SHOULD name the method together with the map.

The claims presuppose that H.7 is defined on the cell. A processor MUST
NOT claim `decided` or `infeasible` for a cell unless every compared
design is well-defined (H.5) at every valuation of the cell. The corner
check of S-14 establishes this for a design whose probabilities are
multi-affine in the open parameters. For any other design the processor
has to establish it for the cell, or leave the cell `undecided`.

**Deciding a cell from bounds.** Suppose a method gives, for each
compared regime R, a lower bound l_R and an upper bound u_R of J_R that
hold at every valuation of a cell C (a bound may be +∞), and likewise
bounds of the quantity of the constraint. Say that R is *in* on C when
the bounds show sat_R(v) for every v ∈ C, and *out* on C when they show
that sat_R(v) fails for every v ∈ C. Then:

- C is infeasible when every compared regime is out on C;
- R is optimal on C when R is in on C and, for every other compared
  regime R′, either R′ is out on C or l_R ≥ u_R′ under `maximize:`
  (u_R ≤ l_R′ under `minimize:`).

These conditions are sufficient, not necessary. They compare a bound of
one solution function with a bound of another, not the two functions at
the same valuation. A cell near a point where two regimes tie can
therefore stay `undecided` although one regime is optimal on it, and
regimes that tie on a whole cell are both found only when their bounds
coincide, or when the processor knows that the two solution functions
are the same.

**Estimates.** A processor MAY additionally report estimates of the
objective at sample points, for example from simulation, with their
confidence. It reports them separately from the cells: they are claims
about those points only, never change the status of a cell, and never
count toward `resolution:`.

## H.10 Static semantics {/* #h10-static-semantics */}

A processor that implements the extension MUST, in a file that
declares `stochastic: 0.1`, in addition to existing checks:

- **S-1.** `model:` MUST have `variables:` with at least one variable
  and `commands:`, which may be an empty list. `kind:`, if present,
  MUST be `dtmc`. One case is not an error of this rule: in a file
  that declares the extension `games`, in any version
  ([Appendix I](./appendix-i-games.md)), a
  processor that does not implement that extension does not interpret
  a model whose `kind:` is present and is not `dtmc`. It emits one
  informational diagnostic, applies none of S-2 to S-15 to the block,
  and MUST NOT evaluate, lower, or export the block as a Markov chain
  (H.15). In a file that does not declare `games`, such a `kind:`
  is an error.
- **S-2.** The `id` of a parameter, variable, reward structure,
  property, and regime map, every label name, every enumeration
  literal, and every action label MUST be an identifier and MUST NOT be
  a keyword of the expression sub-language of
  [A.11](./appendix-a-syntax.md#a11-reserved-keywords) (`AND`, `OR`,
  `NOT`, `true`, `false`, `in`, `exists`), `IN`, or a keyword of the
  sub-languages of this appendix (`rest`, `F`, `U`, `P`, `R`). The
  structure keys of A.11 (`alpha`, `beta`, …) are not reserved here.
  Parameters, variables, labels, and enumeration literals share one
  namespace in which every name is declared once, except that a
  literal may occur in several enumeration types. For an enumeration
  variable `x` with literal `L`, the generated name `x_L` (H.11) MUST
  be distinct from every name declared in that namespace and from
  every other generated name. A label MUST NOT be named `init` or
  `deadlock`, which are built-in labels of PRISM. Reward structures, properties together
  with regime maps, and action labels each have a namespace of their
  own; an action label may be used by several commands.
- **S-3.** `from:` MUST be a string of the form `C.alpha`, `C.beta`,
  `C.lambda`, or `environment.X`, where `C` is the `id` of a declared
  contract and `X` a key of `context.environment` whose value is a
  YAML number. A parameter with `from:` MUST NOT have `value:`. A
  processor SHOULD warn when two parameters have the same source.
- **S-4.** `range:` MUST be a sequence of two finite numbers
  `[lo, hi]` with `lo ≤ hi`. It is REQUIRED except for an
  institutional parameter, where it MUST lie within `[0, 1]`. A
  `value:`, the number given by a source, and every value assigned by
  a regime MUST lie in the declared range.
- **S-5.** `type:` MUST be `bool`, an `int_range` with `lo ≤ hi`, or an
  `enum_type` with at least one literal and no literal twice. `init:`
  MUST be a value of the domain.
- **S-6.** Every `state_pred` MUST conform to the grammar of H.2 and be
  well typed (H.4): its identifiers are declared variables,
  enumeration literals of the right type, or, in a `property` only,
  labels, and never parameters. A string that does not conform is an
  error; it is **not** kept as an opaque predicate. For the right-hand
  side of a `set:` entry, a syntax error falls under this rule and a
  type or domain error under S-7.
- **S-7.** Every key of `set:` MUST be a declared variable, and its
  right-hand side MUST have the type of the variable. For every design
  in which the command exists and every state of S in which its guard
  is true, the value of the right-hand side MUST lie in the domain.
  (This is decided by enumerating S, as is S-9.)
- **S-8.** `prob:` MUST be `rest`, a number, or a `param_expr` whose
  identifiers are declared parameters. A command MUST have at least
  one update and at most one update with `rest` (written or by
  omission). In a command without `rest`, no probability may contain a
  parameter, and the probabilities MUST sum to exactly 1. A
  probability without parameters MUST lie in `[0, 1]`.
- **S-9.** For every design and every state of S (reachable or not),
  at most one command that exists in the design may have a true guard.
- **S-10.** Every key of `model.regimes:` and every name in a `when:`
  MUST be a regime of the file; every key of a regime's `parameters:`
  MUST be a declared parameter and its value a number. In a file
  without `transitions:`, `model.regimes:`, `when:`, and
  `model.regime_maps:` MUST NOT appear. A processor SHOULD warn about
  a regime that has no entry in `model.regimes:` when the block is
  present.
- **S-11.** Every parameter MUST have a fixed value under every
  design, and every design MUST be well-defined at its fixed values
  (H.5).
- **S-12.** A reward structure MUST have at least one item. In an
  item, `action:` MUST be the action label of at least one command,
  and `value:` a number or a `param_expr` over declared parameters.
  A `value:` MUST NOT mention a parameter that occurs in the `over:`
  of a regime map: in PRISM a parameter of parametric model checking
  can only be used in probabilities
  [[Kwiatkowska+, CAV 2011]](./appendix-b-references.md).
- **S-13.** Every `property` MUST conform to the grammar of H.2. With
  `R`, the name MUST be a declared reward structure and the path MUST
  be `F φ` without a step bound. A probability threshold MUST lie in
  `[0, 1]`. The `regimes:` of
  a property MUST name designs of the file, each once.
- **S-14.** In a regime map: `over:` MUST have one to four declared
  parameters, each with `lo < hi` within the declared range and none
  assigned by any regime in `model.regimes:`; `regimes:` MUST name at
  least two regimes of the file, each once (so the default, all
  regimes, is an error in a file with fewer than two); `objective:` MUST have
  exactly one of `maximize:` and `minimize:`, with a query;
  `constraint:` MUST be a threshold property; `resolution:` MUST
  satisfy `0 < r < 1`. Every compared design MUST be well-defined on
  the whole region; a processor MUST check this at least at the corner
  points of the region, which decide the whole box when no open
  parameter occurs with a power above one (the expressions are then
  multi-affine in the open parameters).
- **S-15.** A processor SHOULD emit an informational diagnostic for a
  key or value reserved in H.1 and MUST NOT give it a meaning. A
  reserved value (`kind: mdp`, a `motivation.` source) gets this
  diagnostic in addition to the error of S-1 or S-3.

The checks of [Section 6.3](./06-design.md) do not read `model:`. The
rule of A.4 that `alpha`, `beta`, and `lambda` lie in `[0, 1]` is
unchanged.

This appendix does not change [Section 5.4.2](./05-language-spec.md):
α, β, and λ acquire behaviour only through the expressions an author
writes. What is guaranteed is that the number a model uses for a bound
parameter is the number of the contract, unless a regime assigns
another in `model.regimes:`, where the difference is visible.

## H.11 Export to the PRISM modelling language {/* #h11-export */}

This section is normative for a processor that exports. It exports,
**per design**, one model file in the PRISM modelling language and one
companion properties file, for tools that do model checking, region
verification, and parameter synthesis. The files are named
`<name>_<design>.prism` and `<name>_<design>.props`, where `<name>` is
the SoS `name` with every character outside `[A-Za-z0-9_.-]` replaced
by `_`. The listings of H.12 show the canonical layout (indentation,
one blank line between parts, single spaces around binary operators,
source parentheses kept); two exports that differ only in white space
and blank lines are equal. `tr(e)` below is the translation of an
expression: `AND`, `OR`, `NOT`, `==` become `&`, `|`, `!`, `=`; an
enumeration literal `L` that is compared with, or assigned to, the
variable `x` becomes `x_L`; everything else, including parentheses, is
kept as written.

**Model file**, in this order:

1. The line `dtmc`.
2. One constant per parameter, in declaration order. A parameter that
   occurs in the `over:` of at least one regime map of the file is
   **open** and is written without a value, `const double p;`. Every
   other parameter is written with its fixed value under the design,
   `const double p = 0.9;`. (An `over:` parameter is assigned by no
   regime, S-14, so the two cases do not conflict.)
3. For each enumeration variable `x`, in declaration order, and each
   literal `L` of its type at position i (from 0), `const int x_L = i;`.
4. `module main`, then the variables in declaration order:
   `x : bool init true;` or `x : bool init false;`,
   `x : [lo..hi] init v;`, and for an enumeration with k literals
   `x : [0..k-1] init i;` with i the position of the `init:` literal.
5. The commands that exist in the design, in declaration order, each as
   `[a] tr(guard) -> (p1) : upd1 + (p2) : upd2 + … ;` where `a` is the
   action label (empty when there is none); each probability expression
   is written in parentheses; `rest` is written as
   `(1 - ((p1) + (p2) + …))` over the other probabilities of the
   command, in their order; the probability of a single update with
   `rest` is `(1)`. An update is `(x'=tr(e))` for each entry of `set:`,
   in the order of variable declaration, joined by ` & `; an update
   without `set:` is `true`.
6. One deadlock command, `[] !((g1) | (g2) | …) -> true;`, where
   g1, g2, … are the translated guards of the commands of step 5, in
   order (`[] true -> true;` when the design has no command). It is
   always written, so that the model does not depend on how a tool
   treats deadlock states. Then `endmodule`.
7. For each label, in declaration order,
   `label "name" = (tr(pred));`.
8. For each reward structure, `rewards "id"`, then its items in order,
   a state reward as `tr(guard) : (value);` and a transition reward as
   `[a] tr(guard) : (value);`, then `endrewards`. A transition reward
   whose action label no command of the design has is not written: it
   is never earned in that design, and PRISM and Storm reject an item
   that names an action the model does not have. When no item of a
   structure is written, the single item `true : (0);` is written
   instead, because Storm rejects an empty reward structure.

**Numbers** are written as the shortest decimal that round-trips,
without an exponent (`0.9`, `1`, `0.001`).

**Identifiers.** Parameter, variable, and action names, and the
generated names `x_L`, are written unchanged, except that a name equal
to a keyword of the PRISM language, or to one of its built-in function
names `floor`, `ceil`, `round`, `pow`, `mod`, `log`, gets one trailing
underscore; an
exporter MUST report an error when the result collides with another
name. Label and reward names are written in quotation marks and are
renamed by the same rule: PRISM and Storm accept only an identifier
that is no keyword between the quotation marks (`label "max"` is a
syntax error in both), and Storm also rejects the built-in function
names there. Labels and reward structures each have a namespace of
their own in PRISM, so a collision is reported only between two labels
or between two reward structures. The reserved
keywords are those of the PRISM manual
[[Kwiatkowska+, CAV 2011]](./appendix-b-references.md), which are
case-sensitive:
`A`, `bool`, `clock`, `const`, `ctmc`, `C`, `double`, `dtmc`, `E`,
`endinit`, `endinvariant`, `endmodule`, `endobservables`, `endrewards`,
`endsystem`, `false`, `formula`, `filter`, `func`, `F`, `global`, `G`,
`init`, `invariant`, `I`, `int`, `label`, `max`, `mdp`, `min`,
`module`, `X`, `nondeterministic`, `observable`, `observables`, `of`,
`Pmax`, `Pmin`, `P`, `pomdp`, `popta`, `probabilistic`, `prob`, `pta`,
`rate`, `rewards`, `Rmax`, `Rmin`, `R`, `S`, `stochastic`, `system`,
`true`, `U`, `W`.

**Properties file**, in this order: for each open parameter, a comment
line `// const p = v` with its declared value; then each property of
`model.properties:` that concerns the design, preceded by a comment
line `// id`; then, for each regime map that compares the design, its
objective and its constraint, preceded by `// id objective` and
`// id constraint`. A property is written as in the file, with every
`state_pred` translated by `tr`, every label in quotation marks, and an
operand of `F` or `U` in parentheses unless it is a single identifier,
a quoted label, or already one parenthesised expression:
`P=? [ F<=3 "delivered" ]`.

Regions, the regimes compared, and `resolution:` are arguments of an
analysis and are not exported. Parameter lifting
[[Quatmann+, ATVA 2016]](./appendix-b-references.md) in its classic form
assumes probabilities that are multi-affine in the parameters and
regions that are graph-preserving (H.5)
[[Heck+, ATVA 2025]](./appendix-b-references.md). Regime maps are not a function
of existing tools: a processor builds them from several analyses of
several regime models.

## H.12 Example

A dispatcher and robots deliver parcels. In the centralised regime
most delivery decisions are taken by the dispatcher, whose plan is
good when information is shared (α) but reaches the robot only when
the dispatcher is up and the message is not lost. In the distributed
regime most decisions are taken by the robot from local information,
with a fixed quality. β is the probability that a decision is taken
centrally. A robot makes at most three attempts.

```yaml
sos:
  name: "RobotDeliveryStochastic"
  type: Acknowledged
  extensions:
    - stochastic: 0.1

  actors:
    - { id: DISPATCHER,    role: "Assigns and replans routes" }
    - { id: "ROBOT[1..N]", role: "Delivers parcels" }

  contracts:
    - id: DELIVERY
      parties: [DISPATCHER, "ROBOT[*]"]
      information: { alpha: 0.9 }
      authority:   { decision_holder: DISPATCHER, beta: 0.9 }

  transitions:
    - { from: CENTRALIZED, to: DISTRIBUTED, condition: "loss_rate > 0.3" }
    - { from: DISTRIBUTED, to: CENTRALIZED, condition: "loss_rate <= 0.2" }

  model:
    kind: dtmc
    parameters:
      - { id: p_fail,  range: [0, 0.5], value: 0.05 }   # dispatcher out of service during an attempt
      - { id: p_loss,  range: [0, 0.5], value: 0.1 }    # message from the dispatcher lost
      - { id: alpha,   from: "DELIVERY.alpha" }         # 0.9, range [0, 1]
      - { id: beta,    from: "DELIVERY.beta" }          # assigned by the regimes
      - { id: q_local, range: [0, 1],   value: 0.6 }    # success of a local decision
    variables:
      - { id: task,     type: "{Pending, Delivered}", init: Pending }
      - { id: attempts, type: "[0..3]",               init: 0 }
    labels:
      delivered: "task == Delivered"
      given_up:  "task == Pending AND attempts == 3"
    commands:
      - action: attempt
        guard: "task == Pending AND attempts < 3"
        updates:
          - prob: "beta * alpha * (1 - p_fail) * (1 - p_loss) + (1 - beta) * q_local"
            set: { task: Delivered, attempts: "attempts + 1" }
          - prob: rest
            set: { attempts: "attempts + 1" }
    regimes:
      CENTRALIZED: { parameters: { beta: 0.9 } }
      DISTRIBUTED: { parameters: { beta: 0.1 } }
    rewards:
      - { id: delay, items: [ { action: attempt, value: 1 } ] }
    properties:
      - { id: P_DELIVERY, expr: "P>=0.95 [ F<=3 delivered ]" }
      - { id: P_EVENTUAL, expr: "P=? [ F delivered ]" }
      - { id: P_DELAY, regimes: [CENTRALIZED], expr: 'R{"delay"}<=1.5 [ F delivered OR given_up ]' }
    regime_maps:
      - id: best_for_delivery
        over: { p_fail: [0, 0.5], p_loss: [0, 0.5] }
        regimes: [CENTRALIZED, DISTRIBUTED]
        objective: { maximize: "P=? [ F<=3 delivered ]" }
        constraint: "P>=0.9 [ F<=3 delivered ]"
        resolution: 0.05
```

The `condition:` of the two transitions (thresholds on `loss_rate`) is
the operational switching rule; it is independent of the certified
boundary computed below. The model has eight states, seven of them
reachable. The single command satisfies S-9, and its update
`attempts + 1` stays in `[0..3]` because the guard requires
`attempts < 3` (S-7). The states with `task == Delivered` and the
state `given_up` enable nothing and loop on themselves. The two
designs differ only in β.

Write x = (1 − p_fail)(1 − p_loss), and s for the probability that one
attempt succeeds. With α = 0.9 and q_local = 0.6:

| Regime | β | s = β·α·x + (1 − β)·q_local |
| --- | --- | --- |
| CENTRALIZED | 0.9 | s_C = 0.81·x + 0.06 |
| DISTRIBUTED | 0.1 | s_D = 0.09·x + 0.54 |

On the region of the query, 0.25 ≤ x ≤ 1, so 0.2625 ≤ s_C ≤ 0.87 and
0.5625 ≤ s_D ≤ 0.63: both designs are well-defined on the region, the
region is graph-preserving, and the probability is multi-affine in
p_fail and p_loss. Each attempt succeeds independently, so for either
regime:

- `P=? [ F<=3 delivered ]` has the value 1 − (1 − s)³, and
  `P=? [ F delivered ]` has the same value, because the model is
  acyclic and every path is absorbed within three steps;
- `R{"delay"}=? [ F delivered OR given_up ]` has the value
  1 + (1 − s) + (1 − s)², the expected number of attempts.

The value of `R{"delay"}=? [ F delivered ]` is +∞, because `delivered`
is not reached with probability 1.

**The properties.** At the fixed values p_fail = 0.05 and p_loss = 0.1,
x = 0.855, s_C = 0.75255, and s_D = 0.61695. Computed values in this
section are rounded to six decimals.

| Property | Design | Value | Result |
| --- | --- | --- | --- |
| `P_DELIVERY` | CENTRALIZED | 1 − 0.24745³ = 0.984848 | `satisfied` |
| `P_DELIVERY` | DISTRIBUTED | 1 − 0.38305³ = 0.943796 | `violated` |
| `P_EVENTUAL` | CENTRALIZED / DISTRIBUTED | 0.984848 / 0.943796 | (query) |
| `P_DELAY` | CENTRALIZED | 1 + 0.24745 + 0.24745² = 1.308682 | `satisfied` |

`P_DELAY` is restricted to CENTRALIZED; on DISTRIBUTED the value would
be 1.529777, above the bound of 1.5.

**The regime map.** 1 − (1 − s)³ grows with s, so CENTRALIZED is at
least as good as DISTRIBUTED exactly when s_C ≥ s_D, that is, when
0.72·x ≥ 0.48:

- CENTRALIZED is optimal where (1 − p_fail)(1 − p_loss) ≥ 2/3;
- DISTRIBUTED is optimal where (1 − p_fail)(1 − p_loss) ≤ 2/3;
- on the curve p_loss = 1 − 2 / (3·(1 − p_fail)), which runs from
  (p_fail, p_loss) = (0, 1/3) to (1/3, 0), both are optimal, with
  s = 0.6 and probability 1 − 0.4³ = 0.936.

The constraint holds where s ≥ 1 − 0.1^(1/3) = 0.535841. DISTRIBUTED
satisfies it on the whole region (s_D ≥ 0.5625). CENTRALIZED satisfies
it where x ≥ 0.587458 and violates it below, which lies inside the
part where DISTRIBUTED is optimal, so the constraint removes CENTRALIZED
from the candidates there but does not change `best`. Low failure and low loss favour the centralised
regime, high failure or high loss the distributed one.

Values at some points, for checking an implementation:

| p_fail | p_loss | x | P, CENTRALIZED | P, DISTRIBUTED | `best` |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | 1 | 0.997803 | 0.949347 | CENTRALIZED |
| 0.1 | 0.1 | 0.81 | 0.977118 | 0.941994 | CENTRALIZED |
| 0.2 | 1/6 | 2/3 | 0.936 | 0.936 | both |
| 0.3 | 0.3 | 0.49 | 0.839809 | 0.928061 | DISTRIBUTED (CENTRALIZED violates the constraint) |
| 0.5 | 0.5 | 0.25 | 0.598869 | 0.916260 | DISTRIBUTED (CENTRALIZED violates the constraint) |

Because x decreases in both parameters, a cell
[f₁, f₂] × [l₁, l₂] is certified by its corners: CENTRALIZED is
optimal on it when (1 − f₂)(1 − l₂) ≥ 2/3, DISTRIBUTED when
(1 − f₁)(1 − l₁) ≤ 2/3, and otherwise the curve crosses the cell and
it is `undecided`.

A method that decides a cell from bounds of the two designs (H.9)
decides fewer cells. Write x_min = (1 − f₂)(1 − l₂) and
x_max = (1 − f₁)(1 − l₁) for the least and the greatest x on the cell.
The value of either design on the cell ranges exactly over
1 − (1 − s)³ for x between x_min and x_max. Comparing these ranges
decides CENTRALIZED when s_C at x_min is at least s_D at x_max, that is
when 0.81·x_min − 0.09·x_max ≥ 0.48, and DISTRIBUTED when
0.81·x_max − 0.09·x_min ≤ 0.48. A cell that satisfies neither is
`undecided`, also when the curve does not cross it.

**Export.** By H.11, the model file of the design CENTRALIZED is the
following; p_fail and p_loss are open because the regime map lists
them in `over:`. The file of DISTRIBUTED differs only in
`const double beta = 0.1;`.

```
dtmc

const double p_fail;
const double p_loss;
const double alpha = 0.9;
const double beta = 0.9;
const double q_local = 0.6;
const int task_Pending = 0;
const int task_Delivered = 1;

module main
  task : [0..1] init 0;
  attempts : [0..3] init 0;
  [attempt] task = task_Pending & attempts < 3 -> (beta * alpha * (1 - p_fail) * (1 - p_loss) + (1 - beta) * q_local) : (task'=task_Delivered) & (attempts'=attempts + 1) + (1 - ((beta * alpha * (1 - p_fail) * (1 - p_loss) + (1 - beta) * q_local))) : (attempts'=attempts + 1);
  [] !((task = task_Pending & attempts < 3)) -> true;
endmodule

label "delivered" = (task = task_Delivered);
label "given_up" = (task = task_Pending & attempts = 3);

rewards "delay"
  [attempt] true : (1);
endrewards
```

Its properties file:

```
// const p_fail = 0.05
// const p_loss = 0.1
// P_DELIVERY
P>=0.95 [ F<=3 "delivered" ]
// P_EVENTUAL
P=? [ F "delivered" ]
// P_DELAY
R{"delay"}<=1.5 [ F ("delivered" | "given_up") ]
// best_for_delivery objective
P=? [ F<=3 "delivered" ]
// best_for_delivery constraint
P>=0.9 [ F<=3 "delivered" ]
```

## H.13 Intermediate Representation (IR) addition

The IR gains one top-level field, `stochastic_model`, next to the three
layers; it is `null` when the extension is not declared, when there is
no `model:`, or when the block has a check error.
As in [Appendix E, E.7](./appendix-e-sos-dsl.md), expressions are kept
as text. The sample is abridged where marked:

```jsonc
{
  "stochastic_model": {
    "kind": "dtmc",
    "parameters": [
      { "id": "p_fail", "source": null, "range": [0, 0.5], "value": 0.05, "open": true },
      { "id": "alpha", "source": "DELIVERY.alpha", "range": [0, 1], "value": 0.9, "open": false }
      // ... p_loss, beta, q_local
    ],
    "designs": [ { "name": "CENTRALIZED", "parameters": { "beta": 0.9 } } ],   // ... DISTRIBUTED
    "properties": [   // ... P_EVENTUAL, P_DELAY
      { "id": "P_DELIVERY", "regimes": ["CENTRALIZED", "DISTRIBUTED"], "expr": "P>=0.95 [ F<=3 delivered ]" }
    ],
    // ... "variables", "labels", "commands", "rewards": the fields of H.2 under the same names;
    //     a variable has "kind" (bool | int | enum), "lo", "hi", "literals", "init";
    //     a command has "index", "action", "when", "guard", "updates" (each with "prob", "set")
    "regime_maps": [
      { "id": "best_for_delivery", "over": { "p_fail": [0, 0.5], "p_loss": [0, 0.5] },
        "regimes": ["CENTRALIZED", "DISTRIBUTED"], "direction": "maximize",
        "objective": "P=? [ F<=3 delivered ]", "constraint": "P>=0.9 [ F<=3 delivered ]", "resolution": 0.05 }
    ]
  }
}
```

The keys are in the order `kind`, `parameters`, `designs`,
`properties`, `variables`, `labels`, `commands`, `rewards`,
`regime_maps`. `labels` maps each name to its text; `prob` is text
(`"rest"` or the expression or decimal as text); `set` maps each
variable to text; a reward item is `{action, guard, value}` with
`value` as text; an unused `lo` or `hi` is `null` and unused
`literals` is `[]`. The defaults of H.2 are filled in (`when: []`
means every design).
`value` is the declared value of H.3, or `null`; `open` is true for a
parameter that some regime map lists in `over:`. `designs` lists every
design with the values its regime assigns (the single entry `base` for
a file without `transitions:`). `index` is the position of the command
in `model.commands:`, from 1. Results of analyses are not in the IR.

## H.14 Reference implementation status {/* #h14-reference-implementation-status */}

The reference implementation implements stochastic 0.1 from `cadl`
0.3.20 as follows:

- `cadl` parses `model:`, applies rules S-1 to S-15 in `cadl check`
  (the SHOULDs as warnings; S-7 and S-9 by enumerating the state
  space, which is refused above 200 000 states), and lowers the block
  to the IR of H.13.
- `cadl model-export` writes the files of H.11.
- `cadl model-check` is a small reference evaluator with exact rational
  arithmetic for one design at fixed parameter values. It evaluates
  the properties of H.8, up to 2 000 unknowns. With `--regime-map ID`
  it evaluates the objective of a regime map at the points of a grid;
  these are reported as estimates at sample points (H.9), never as
  decided cells.
- `cadl model-check --regime-map ID --certify` computes the regime map
  of H.9, from `cadl` 0.3.22. It runs no external model
  checker. The method is parameter lifting
  [[Quatmann+, ATVA 2016]](./appendix-b-references.md) with exact
  rational arithmetic. On a cell, a design is relaxed to a Markov
  decision process in which every state chooses, independently of the
  other states, a corner of the cell for the open parameters that occur
  in its outgoing probabilities. When those probabilities are
  multi-affine, the chain at any valuation of the cell is this process
  under one randomised policy, so the minimal and the maximal value of
  the process bound the solution function on the whole cell. Bounded
  properties are solved by backward induction, unbounded ones by policy
  iteration with exact linear solves. A cell is decided from these
  bounds by the conditions of H.9. An undecided cell is bisected along
  the parameter whose interval is widest relative to the region, the
  largest undecided cell first, until the undecided fraction is at most
  `resolution:` or a budget is exhausted (`--max-depth`, by default 24
  bisections of one cell; `--max-cells`, by default 20 000 cells). In
  the second case the map is reported with the statement that the
  resolution is not reached, and the exit status is 1. Two halves with
  the same claim are reported as one cell. The command reports the
  method, the cells, their numbers per status, and the undecided
  fraction as an exact number; estimates (`--grid`) and the certified
  map (`--certify`) are separate outputs and cannot be combined.
- Limits of the certified map:
  - The bounds of two designs are compared, not their difference, so
    cells next to a boundary stay `undecided` (H.9, H.12). Regimes that
    tie on a cell are listed together only when their bounds coincide
    or their designs have the same model.
  - A probability that is not multi-affine in the open parameters is
    enclosed by exact interval arithmetic on its monomials, and the
    state chooses a vertex of the set of distributions within these
    intervals. This is sound but coarser. Such a design counts as
    well-defined on a cell only when the intervals lie within `[0, 1]`;
    otherwise the cell is `undecided` and the report gives this reason.
    Interval arithmetic overestimates, so near a valuation where such
    a probability is 0 or 1 it may fail to establish this however small
    the cell is.
  - Cells that are not graph-preserving are analysed, not declined. The
    bounds of a probability are those of the decision process. An
    expected reward gets a finite upper bound only when every policy of
    the process reaches the target with probability 1; it is +∞ on the
    whole cell when no policy does; its lower bound is the least
    expected reward that any policy accumulates.
  - The cost grows with the number of cells, which grows with the
    number of open parameters, and with the number of states: every
    policy is evaluated by an exact linear system, of at most 2 000
    unknowns.
  - S-14 is checked by `cadl check` at the corners of the region. A
    probability that is not multi-affine can leave `[0, 1]` in the
    interior only; the certified mode reports that as an error (exit
    status 2) when the centre or a corner of a cell shows it, and
    otherwise leaves the cell `undecided`.
  - A YAML number with more than 15 significant digits, which H.2
    forbids, is rounded when the file is loaded and is not reported;
    the claims are then about the rounded model.
- For the example of H.12 (`resolution: 0.05`) the certified map has 95
  cells, 60 `decided` and 35 `undecided`, after joining a partition of
  121 cells; 241 cells were analysed, with at most 10 bisections of a
  cell. CENTRALIZED is certified on 235/1024 of the region (it is
  optimal on 0.2521 of it), DISTRIBUTED on 738/1024 (optimal on
  0.7479), and the undecided fraction is 51/1024 = 0.0498. The curve
  crosses 31 of the 35 undecided cells; the other 4 lie next to it. The
  computation takes about 0.1 s on a laptop; with `resolution: 0.01` it
  takes 0.8 s (726 cells before joining) and with `resolution: 0.002`
  3.8 s (3 632 cells).
- The certified maps were checked in two ways. The tests of the
  reference implementation repeat both; the second needs `stormpy`.
  The eight maps are that of H.12 and seven maps of a second model with
  three regimes, cycles, `minimize:` with an expected reward that is +∞
  for one regime everywhere and for the others at one face of the
  region, constraints that make part of the region infeasible, a
  probability that is not multi-affine, cells that are not
  graph-preserving, a tie on a whole cell, and three open parameters.
  - Every `decided` and `infeasible` cell of the eight maps, 212 cells,
    was evaluated with the exact reference evaluator at its corners,
    its centre, and six random rational points: 2 512 point
    evaluations. At each of them every regime in `best` is optimal, or
    no regime satisfies the constraint, as claimed.
  - The bounds were compared with Storm (stormpy 2.0.0, exact parameter
    lifting engine) on the exported files, for 134 pairs of a design
    and a cell that is graph-preserving for it. For the designs with
    multi-affine probabilities, the lower and upper bounds of `cadl`
    are equal, as rational numbers, to those of Storm (159 pairs of
    bounds). The extrema that Storm finds on the cell by refinement lie
    within the bounds of `cadl` (213 pairs). Storm's verdict on the
    constraint for the cell (all valuations satisfy it, all violate it,
    or neither) is the claim of `cadl` in 79 of 79 cases.
  - Storm's parameter lifting assumes a graph-preserving region.
    stormpy's `verify` refuses a region that is not, and its extremum
    computation returned the minimum 1 for `P=? [ F done ]` on
    0 ≤ p ≤ 1/2 for a design that reaches `done` with probability p in
    each step, where the value at p = 0 is 0. Cells that are not
    graph-preserving were therefore checked with the reference
    evaluator only.
- An independent review tried to break the certified mode and found no
  wrong claim: 3 290 random models, 56 782 `decided` or `infeasible`
  cells tested at 1 731 349 exact points, among them cells that are not
  graph-preserving and designs that are not multi-affine; the solvers
  of the decision process agreed with a brute-force search over all
  memoryless policies on 60 000 random processes; and four soundness
  errors injected into the code were each detected by the harness.
- `cadl regime-map` still reports the graph of regime names and
  transitions.
- Deviation: `cadl` 0.3.22 does not know the extension `games`
  ([Appendix I](./appendix-i-games.md)). For a model with `kind: smg`
  in a file that declares `games: 0.1` it reports an error of S-1
  and, where two commands of one player are enabled in a state, an
  error of S-9, where S-1 and H.15 ask for one informational
  diagnostic and no further check. It does not evaluate or export the
  model.
- The exported files have been run through PRISM 4.11 and Storm
  (stormpy 2.0.0) for the example of H.12, for a second model that
  uses `when:`, updates with three branches, guarded state and
  transition rewards, `U`, `U<=k`, and keyword names, and for the model
  of the certified maps above: 39 properties in 7 designs. The state
  counts agree, and every value agrees with
  `cadl model-check` as a rational number under Storm and under the
  exact engine of PRISM. That engine does not support a step bound
  (`F<=k`, `U<=k`); those properties were compared with PRISM in
  floating point. The tests of the reference implementation repeat the
  comparison when `prism` or `stormpy` is installed. These runs found
  two defects of the export. `cadl` 0.3.20 wrote a label or reward
  structure named like a keyword unchanged, which neither tool loads;
  0.3.21 renames it as H.11 now says. `cadl` up to 0.3.21 wrote a
  transition reward for an action that no command of the design has,
  which neither tool loads; 0.3.22 omits it as H.11
  now says.

## H.15 Backward compatibility

Files written against CADL v0.3 without this extension remain valid
and are read the same way: the extension adds one key and changes the
meaning of nothing that exists.

A file that uses `model:` without declaring `stochastic: 0.1` does not
conform to this appendix. A processor that implements the extension
does not interpret the `model:` block of such a file (it is not
checked, not lowered to the IR, and not exported) and SHOULD report it
as an undeclared extension key. Processors that do not implement the
extension MUST NOT reject a file because of `model:`; they SHOULD emit
a single informational diagnostic per file.

A file may declare the extension `games`, in any version
([Appendix I](./appendix-i-games.md)), and carry a model with `kind: smg`, which is a game and not a Markov
chain. A processor that implements this appendix and not Appendix I
skips such a model (S-1): it reports it with one informational
diagnostic, `stochastic_model` is `null`, and it MUST NOT check,
evaluate, or export the model by the rules of this appendix, since
H.7 would give it a meaning it does not have. A model with
`kind: dtmc`, or without `kind:`, in such a file is a model of this
appendix and is read as before.
