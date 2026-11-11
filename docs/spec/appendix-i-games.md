---
sidebar_position: 19
title: "Appendix I: Strategic Model Extension"
description: "Strategic model extension (games 0.1): players and ownership of commands in the model of Appendix H, memoryless deterministic profiles with a distinguished compliance profile, payoffs as weighted expected rewards, Nash equilibrium checks with deviation gains, and equilibrium maps over institutional parameters with certified cells."
---

# Appendix I — Strategic Model Extension (games 0.1)

This appendix specifies the **strategic model extension** to CADL. It
builds on the stochastic model extension
([Appendix H](./appendix-h-stochastic.md)) and adds to the `model:`
block the keys `players:`, `profiles:`, `compliance:`, `payoffs:`, and
`equilibria:`, the key `owner:` to a command, the key `profile:` to a
property and to a regime map, and the value `smg` of `kind:`. With
them, a file says which party chooses which command of the model and
what each party gains, names the behaviour that the contract asks for,
and asks whether that behaviour is an equilibrium: at the declared
values of the parameters, or as a map over a region of parameters.

The core language does **not** mandate these keys; a conforming CADL
processor that does not implement the extension MUST NOT reject a file
because of them. It SHOULD accept them syntactically and emit an
*informational* diagnostic.

The extension is named `games` and this appendix describes version
`0.1`. It **requires** `stochastic: 0.1`: the game is played on the
model of Appendix H. A file that uses it MUST declare both under
`extensions:` ([A.2](./appendix-a-syntax.md#a2-top-level-structure));
I.15 says what a processor does with an undeclared use.

```yaml
sos:
  ...
  extensions:
    - stochastic: 0.1
    - games: 0.1
```

The extension does not depend on the norms extension
([Appendix F](./appendix-f-norms.md)).
[Appendix J](./appendix-j-grounding.md) relates the payoffs of a
strategic model to the sanctions of norms.

## I.1 Motivation and scope

Constituent systems keep their operational and managerial
independence, so a constituent complies with a contract only when
compliance pays ([Section 9.7](./09-research.md)). The model of
Appendix H has no party that chooses: every regime model is a Markov
chain. Rational verification asks whether a property holds on the
equilibria of a multi-agent system
[[Gutierrez+, AI 2020]](./appendix-b-references.md), also for
probabilistic systems [[Gutierrez+, KR 2021]](./appendix-b-references.md);
PRISM-games verifies turn-based stochastic games
[[Chen+, FMSD 2013]](./appendix-b-references.md) and computes
equilibria of concurrent ones
[[Kwiatkowska+, TACAS 2022]](./appendix-b-references.md); and Nash
equilibria have been computed for games in which each player chooses
the value of a parameter of a parametric Markov chain
[[Mu, QEST 2019]](./appendix-b-references.md). Parameter lifting
analyses a parametric Markov decision process through a stochastic
game of two players
[[Quatmann+, ATVA 2016]](./appendix-b-references.md); it bounds what
a controller can achieve and does not decide whether a profile is an
equilibrium.
RD-7.2 asks for a map: the region of λ, and of other parameters, in
which compliance is an equilibrium. We searched for tools and methods
that compute such a region for a stochastic game whose transition
probabilities are parametric (search terms: parametric stochastic
games, Nash equilibrium, parameter synthesis, equilibrium region) and
found none. Games 0.1 is a small first step on RD-7.1 and RD-7.2:

- **The author writes the game.** `players:` declares the players,
  `owner:` on a command says who chooses it, and `payoffs:` says what
  each player gains, built from the reward structures of H.8. Nothing
  is derived from contracts or norms.
- **Compliance is a named profile.** `profiles:` names profiles of
  memoryless deterministic strategies, and `compliance:` names the one
  that stands for the behaviour the contract asks for (I.4).
- **The question is defined exactly.** I.7 defines when a profile is a
  Nash equilibrium of a design at a valuation, and the **deviation
  gain** of each player. I.9 defines the **equilibrium map**: cells of
  a region of parameters, each certified in the sense of H.9 as
  `equilibrium` or `not_equilibrium`, or left `undecided`. The
  appendix defines what a correct answer is and gives sufficient
  conditions that a processor can compute; it prescribes no algorithm.

**Scope of version 0.1.**

- The game is **turn-based**: in every state at most one player
  chooses (I-5). There are no concurrent moves and no synchronisation
  of commands.
- Strategies named in a file are **memoryless and deterministic**: a
  choice of one command per state. There are no mixed strategies, so
  an equilibrium in mixed strategies cannot be named or found.
- Every player observes the whole state. Equilibria under partial
  observation, which is what α controls (RD-7.3), remain open.
- A payoff is a weighted sum of expected rewards accumulated until a
  target, in a game that reaches the target with probability 1
  whatever the players do (I.6). Discounted, mean-payoff, and
  step-bounded payoffs are not defined; a bounded horizon is written
  with a counter variable, as `attempts` in I.12.
- The equilibrium notion is the Nash equilibrium and its ε-relaxation.
  Subgame-perfect equilibria, dominant strategies, the set of all
  equilibria of a game, and whether a property holds on every
  equilibrium (the question of RD-7.1 in full) are not defined.
- A centralised mediator, modelled as a correlated equilibrium, and
  the value of centralisation of RD-7.2 are out of scope.
- An equilibrium is asked for per design; a switch between regimes is
  not part of the game (H.1).
- **Reserved**, and not to be used with another meaning: the key
  `sync:` of a command and `owner:` of a variable; the keys
  `mediator:` and `observations:` of `model:`; the key `concept:` of
  an entry of `equilibria:`; the value `mdp` of `kind:`; and the
  parameter sources `motivation.rho` and `motivation.kappa`. Of the
  names that H.1 reserves, this appendix defines `players:`,
  `payoffs:`, `equilibria:`, and `owner:` of a command.

## I.2 Syntax (EBNF additions to H.2)

The grammar uses the notation of
[Appendix A](./appendix-a-syntax.md). `identifier`, `actor_ref`, and
`number` are defined there; `state_pred`, `param_expr`, and `interval`
in [H.2](./appendix-h-stochastic.md).

```ebnf
model_block     = ... ,
                  [ "kind:"       , ( "dtmc" | "smg" ) ] ,
                  [ "players:"    , { "-" , player_def } ] ,
                  [ "profiles:"   , { identifier , ":" , { "-" , profile_rule } } ] ,
                  [ "compliance:" , identifier ] ,
                  [ "payoffs:"    , { "-" , payoff_def } ] ,
                  [ "equilibria:" , { "-" , equilibrium_def } ] ;

player_def      = "id:"     , identifier ,
                  "actors:" , { "-" , actor_ref } ;

command_def     = ... , [ "owner:" , identifier ] ;

profile_rule    = [ "guard:" , state_pred ] ,                   (* string *)
                  "choose:"  , identifier ;

payoff_def      = "player:" , identifier ,
                  "until:"  , state_pred ,                      (* string *)
                  "terms:"  , { "-" , payoff_term } ;
payoff_term     = "reward:" , identifier ,
                  [ "weight:" , param_expr ] ;                  (* string or number *)

property_def    = ... , [ "profile:" , identifier ] ;
regime_map_def  = ... , [ "profile:" , identifier ] ;

equilibrium_def = "id:" , identifier ,
                  [ "profile:"    , identifier ] ,
                  [ "regimes:"    , { "-" , identifier } ] ,
                  [ "epsilon:"    , number ] ,
                  [ "over:"       , { identifier , ":" , interval } ] ,
                  [ "resolution:" , number ] ;
```

**Writing the values in YAML.** The rules of H.2 apply: `until:` and a
`guard:` are quoted strings (a `guard:` may be the YAML boolean `true`
or `false`), and a `weight:` may be a YAML number or a quoted string
(`weight: -1`, `weight: "-2 * lambda"`). The value of a profile may be
the empty sequence (`comply: []`). The names that a YAML 1.1 loader
reads as booleans or null (H.2) MUST be quoted where they are a key of
`profiles:` or `over:`.

**Defaults.** The `guard:` of a profile rule is `"true"`. `weight:` is
`1`. The `profile:` of a property, of a regime map, and of an entry of
`equilibria:` is the compliance profile. The `regimes:` of an entry of
`equilibria:` is all designs. `epsilon:` is `0`. `resolution:` is
`0.05`.

## I.3 Players and ownership

A model with `kind: smg` is a **strategic model**. A model with
`kind: dtmc`, or without `kind:`, is a model of Appendix H and MUST NOT
use the keys of this appendix (I-2).

`model.players:` declares the **players**. Each has an `id` and a list
`actors:` of declared actors for which it stands; an actor stands
behind at most one player (I-3). A player stands for one decision
maker of the model, also when its actor is a set: `"ROBOT[*]"` in
I.12 is one robot that represents any member of the set. The mapping
to actors has no effect on the semantics of this appendix;
[Appendix J](./appendix-j-grounding.md) uses it to relate a payoff to
the bearer of a norm.

`owner:` on a command names the player who chooses it. A command with
`owner:` is **owned**; one without is **unowned** and belongs to no
player: it is a step of chance or of the environment, as every command
of Appendix H. An owned command MUST have an `action:`, and all
commands with one action label have the same owner or are all unowned
(I-4), so an action label identifies its owner.

Fix a design D (H.6). Write En(s) for the set of commands that are
enabled in state s under D (H.5). Rule S-9 of H.10 is replaced, for a
strategic model, by I-5: in every state of S, En(s) is

- empty: s is a **deadlock state** and stays where it is with
  probability 1 (H.5); or
- one unowned command: s is a **chance state**; or
- one or more commands that are all owned by the same player p, with
  pairwise different action labels: s is a **state of p**, and p
  chooses one of them.

No other case is allowed. A state of p in which one command is enabled
is a state of p with a single choice.

## I.4 Strategies, profiles, and the compliance profile

A **strategy** of a player p in a design D is a function that gives,
for every state of p, one command of En(s). Unless said otherwise, a
strategy in this appendix is of this kind: **memoryless** (it depends
on the current state only) and **deterministic** (it chooses one
command with certainty). A **profile** in D is one strategy for every
player. For a profile σ, a player p, and a strategy τ of p, σ[p↦τ] is
the profile that agrees with σ except that p plays τ.

`model.profiles:` names profiles in a form that is finite to write. A
named profile is an ordered list of **rules**, each with an action
label (`choose:`) and a state predicate (`guard:`, by default true). A
rule **applies** in a state s when its guard is true in s and a
command of En(s) has its action label. The profile selects, in a state
s of a player:

- the command of En(s) that has the action label of the **first** rule
  of the list that applies in s; or,
- when no rule applies and En(s) has one command, that command.

When no rule applies in a state in which two or more commands are
enabled, the file is in error (I-6). The rules of all players are
written in one list; a rule concerns the player who owns its action
label. A named profile therefore defines, in every design, one
strategy for every player, on all states of S, reachable or not.

`model.compliance:` names the **compliance profile**: the profile
that, by the author's declaration, is the behaviour the contracts of
the file ask of the players. It is REQUIRED in a strategic model. This
appendix gives the declaration no other meaning than that of a
default: properties, regime maps, and entries of `equilibria:` that
name no profile refer to it. The appendix does not check that the
compliance profile complies with any norm; version 0.1 defines no
translation between a norm and a model (H.8).
[Appendix J, J.7](./appendix-j-grounding.md) states what a processor
can check when the file also declares norms with sanctions.

## I.5 Semantics: the induced game

Fix a design D and an assignment θ of a number to every parameter such
that D is well-defined at θ (H.5). With f(c, j) and u(c, j) as in H.7,
write P(s, c, s′) for the sum of f(c, j)[θ] over the updates j of the
command c with u(c, j)(s) = s′. The **game** G(D, θ) has the states S
and the initial state s₀ of H.7. In a state of a player p, p chooses a
command c of En(s), and the next state is s′ with probability
P(s, c, s′). In a chance state the single enabled command is taken. A
deadlock state stays where it is.

**The model under a profile.** For a profile σ, M(D, θ, σ) is the
discrete-time Markov chain (S, s₀, P_σ) in which P_σ(s, s′) is
P(s, c, s′) for the command c that σ selects in a state s of a player,
or for the single enabled command of a chance state, and
P_σ(s, s) = 1 in a deadlock state. M(D, θ, σ) is a regime model in the
sense of H.7, and a step from a state of a player *takes* the selected
command, with its action label. Everything that H.7 to H.9 define for
M(D, θ) is defined for M(D, θ, σ) in the same way: paths, the reward
of a step, the value of a property, solution functions, and regime
maps.

**Properties and regime maps of a strategic model.** In a strategic
model, an entry of `model.properties:` or `model.regime_maps:` is
evaluated in M(D, θ, σ), where σ is the profile named by its
`profile:` key, by default the compliance profile. Its meaning, its
results, and the certification requirement are those of H.8 and H.9.
A regime map of a strategic model therefore compares the regimes under
one fixed profile; it does not ask whether that profile is an
equilibrium.

**General strategies.** The definitions of I.7 quantify over more
strategies than a file can name. A **general strategy** of p gives,
for every finite sequence of states and commands that starts in s₀ and
ends in a state s of p, a probability distribution over En(s). A
strategy in the sense of I.4 is the special case that depends on s
only and gives probability 1 to one command. One general strategy per
player, together with θ, induces a probability measure on the infinite
sequences of states and commands in the standard way
[[Puterman, 1994]](./appendix-b-references.md).

## I.6 Payoffs

`model.payoffs:` gives every player exactly one **payoff** (I-7). A
payoff has a target `until: φ`, a state predicate in which labels may
be used as in a property (H.4), and one or more **terms**. A term
names a reward structure r of `model.rewards:` (H.8) and has a
`weight:` w, a `param_expr` over numeric literals and parameters. A
weight may be negative and may contain a parameter that is open in an
equilibrium map; a reward `value:` remains not negative (H.5) and MUST
NOT contain such a parameter (I-9). Gains and costs are therefore
written as terms with weights of opposite sign, and an incentive term
carries λ in its weight (`weight: "-2 * lambda"`).

For a path, the **accumulated reward** of r until φ is the sum of the
rewards of the steps before the first position at which φ holds
(H.8). Under one general strategy per player, the payoff of p is

```text
u_p  =  Σ_k  w_k[θ] · E[ accumulated reward of r_k until φ ]
```

over the terms k of p's payoff, where E is the expectation under the
induced measure. For a profile σ, the expectation of the k-th term is
the value of the query `R{"r_k"}=? [ F φ ]` in M(D, θ, σ); write
u_p(D, θ, σ) for the payoff.

**Stopping.** The definition needs every expectation to be finite, and
a player must not be able to make a payoff infinite or undefined by
keeping the game away from the target. G(D, θ) is **stopping for φ**
when, for every profile σ, the probability of `F φ` in M(D, θ, σ) is 1.
This is a property of the graph of the game at θ: it depends only on
which probabilities P(s, c, s′) are positive, and it holds exactly
when no choice of commands by all players together keeps φ from being
reached with probability 1. When G(D, θ) is stopping for φ, φ is
reached with probability 1 under all general strategies as well, from
every state that is reachable from s₀ under some choice of commands,
and the expected number of steps until φ is bounded over all of them,
because minimal reachability probabilities and maximal expected total
rewards of a finite Markov decision process are attained by memoryless
deterministic policies
[[Puterman, 1994]](./appendix-b-references.md). Every payoff with
target φ is then a real number under all general strategies.

A design is **stopping at θ** when G(D, θ) is stopping for the target
of every payoff. I.7 to I.9 are defined only where the design is
well-defined (H.5) and stopping. I-8 requires this at the fixed
values; for an equilibrium map, I-9 and I.9 say what is required on
the region.

## I.7 Equilibrium

Fix a design D that is well-defined and stopping at θ, and a profile
σ.

**Nash equilibrium.** σ is a **Nash equilibrium** of D at θ when no
player gains by deviating alone: for every player p and every
**general** strategy τ of p, the payoff of p when p plays τ and every
other player plays as in σ is at most u_p(D, θ, σ).

**Memoryless deterministic deviations suffice.** When the other
players play as in σ, what remains is a finite Markov decision process
in which p alone chooses, with the reward
ρ_p(s, c) = Σ_k w_k[θ] · (reward of r_k for taking c in s) per step,
of either sign, accumulated until the target φ of the payoff of p. Because the design is stopping,
every policy of this process reaches φ with probability 1 (every
policy is *proper*). For such a process, with rewards of either sign,
the optimal value is attained by a memoryless deterministic policy and
is the unique solution of Bellman's optimality equation
[[Bertsekas & Tsitsiklis, 1991]](./appendix-b-references.md), and a
policy that depends on the history or randomises attains no more
[[Puterman, 1994]](./appendix-b-references.md). Hence the
**best-response value**

```text
BR_p(D, θ, σ)  =  max over the strategies τ of p of  u_p(D, θ, σ[p↦τ])
```

a maximum over finitely many strategies in the sense of I.4, is the
supremum over all general strategies of p, and σ is a Nash equilibrium
of D at θ exactly when BR_p(D, θ, σ) = u_p(D, θ, σ) for every player
p. The claim "σ is a Nash equilibrium" thus covers deviations by all
general strategies, although the profile itself is memoryless and
deterministic. It says nothing about equilibria in which the players
themselves randomise or use memory.

**Deviation gain.** The **deviation gain** of p is

```text
gain_p(D, θ, σ)  =  BR_p(D, θ, σ) − u_p(D, θ, σ)
```

It is never negative, since σ's own strategy of p is among the
candidates. A strategy τ of p with
u_p(D, θ, σ[p↦τ]) = BR_p(D, θ, σ) is a **best response** of p to σ.

**ε-equilibrium.** For a number ε ≥ 0, σ is an **ε-equilibrium** of D
at θ when gain_p(D, θ, σ) ≤ ε for every player p. A Nash equilibrium
is a 0-equilibrium. ε is compared with the payoff of each player in
that payoff's own unit; the appendix does not relate the units of
different players.

**Deciding it at a valuation.** Checking σ at θ consists of one
best-response problem per player: evaluate u_p in the Markov chain
M(D, θ, σ), and solve the Markov decision process of p for BR_p. Both
are solved exactly by linear equations and policy iteration over the
rational numbers when the parameters are rational.

**The one-step test.** Let φ be the target of the payoff of p, and
let Reach be the set of states that are reachable from s₀ in G(D, θ)
under some choice of commands; the game started in a state of Reach is
stopping as well (I.6). For a state s of Reach, write V_p(s) for the
payoff of p under σ in the game started in s instead of s₀
(V_p(s) = 0 when φ holds in s). For a state s of p in Reach in which φ
does not hold and a command c of En(s), write

```text
Q_p(s, c)  =  ρ_p(s, c) + Σ_s′ P(s, c, s′) · V_p(s′)
```

for the payoff of p when p takes c once in s and σ is followed
afterwards. If Q_p(s, c) ≤ V_p(s) for
every state s of p in Reach in which φ does not hold and every command
c of En(s), then gain_p(D, θ, σ) = 0: V_p then solves Bellman's
optimality equation on Reach, whose solution is unique. The converse
does not hold: σ can be a Nash equilibrium although p could gain in a
state that is reached only when p itself deviates. The test is used in
I.9.

## I.8 Equilibrium checks at the fixed values

`model.equilibria:` lists **equilibrium queries**. An entry without
`over:` is an **equilibrium check**: it asks, for each design listed
in `regimes:` (default: all designs), whether the profile named by
`profile:` (default: the compliance profile) is an ε-equilibrium of
the design at the fixed values of all parameters (H.3), with ε given
by `epsilon:` (default 0).

The result, per design, consists of:

- for every player p: the payoff u_p, the best-response value BR_p,
  and the deviation gain;
- the `status`: `equilibrium` when every gain is at most ε, and
  `not_equilibrium` otherwise;
- for `not_equilibrium`: the players whose gain exceeds ε, the
  **deviators**. For each deviator a processor SHOULD report one best
  response, as the list of the states that are reachable under it and
  in which it selects another command than the profile, each with the
  action label selected.

A processor that reports results MUST compute them with exact
arithmetic or with numerics that have a sound error bound, or mark the
result as approximate; a status that the error bound does not decide
is `inconclusive` (as in H.8).

## I.9 Equilibrium maps

An entry of `model.equilibria:` with `over:` is an **equilibrium map
query**. Its keys:

- **`over:`** gives the open parameters, at least one and at most
  four, each with a closed interval `[lo, hi]`, `lo < hi`, within the
  declared range, as in H.9. The region B is the box of these
  intervals. A parameter in `over:` MUST NOT be assigned by any regime
  in `model.regimes:` and MUST NOT occur in a reward `value:`; it may
  occur in probabilities and in weights. Institutional parameters may
  be opened like any other: a map over λ is asked for by opening the
  parameter bound to `lambda`.
- **`profile:`**, **`regimes:`**, **`epsilon:`** as in I.8.
- **`resolution:`** is a number r with 0 < r < 1: the fraction of the
  volume of B that may remain undecided, per design.

For a design D and a valuation v ∈ B, θ(v) agrees with v on the open
parameters and has the fixed values of D elsewhere (H.7). Write
U_p(v), BR_p(v), and gain_p(v) for the payoff, the best-response
value, and the deviation gain of p in D at θ(v) for the profile of the
query; they are defined where D is well-defined and stopping at θ(v).

**What is asked.** For each listed design: at which valuations of B is
the profile an ε-equilibrium? A **cell** is a closed box contained in
B (H.9).

- The profile is an **equilibrium on a cell** C when, at every v ∈ C,
  D is well-defined and stopping at θ(v) and gain_p(v) ≤ ε for every
  player p.
- A player p is a **deviator on a cell** C when, at every v ∈ C, D is
  well-defined and stopping at θ(v) and gain_p(v) > ε.

**The result.** The answer consists of one **equilibrium map** per
listed design. An equilibrium map is a finite set of cells that cover
B and whose interiors are pairwise disjoint, each with a `status`,
together with the undecided fraction (the volume of the `undecided`
cells divided by the volume of B) and whether it is at most
`resolution:`.

| `status` | Claim | Reported with it |
| --- | --- | --- |
| `equilibrium` | the profile is an equilibrium on the cell | — |
| `not_equilibrium` | the player `deviator` is a deviator on the cell | `deviator`, one player |
| `undecided` | none: the status changes inside the cell, different players are deviators in different parts of it, the game is not stopping somewhere in it, or the processor could not decide | — |

`not_equilibrium` names one player who gains at every valuation of the
cell. A cell at every valuation of which some player gains, but not
the same one, stays `undecided` until a refinement separates the
players. For a `not_equilibrium` cell a processor SHOULD also report a
strategy of the deviator that gains more than ε at every valuation of
the cell, when its method provides one (as condition N below does),
and for every decided cell the bounds of the gains it established.

A cell that contains both a valuation at which the profile is an
ε-equilibrium and one at which it is not can have neither status.
Where the two kinds of valuations meet, as at λ\* in I.12, such cells
remain however fine the partition, which is why `resolution:` is
greater than zero.

Maps of several designs over the same region answer "in which regimes,
and where, is the profile an equilibrium". The cells of two designs
need not coincide; a processor MAY report the maps on a common
refinement.

**Certified.** `equilibrium` and `not_equilibrium` are claims about
**every** valuation of the cell, and the certification requirement of
H.9 applies to them: a processor MUST NOT make them unless it has
established them by a method that is sound for the whole cell, with
exact arithmetic or numerics with a sound error bound. Evaluation at
sample points is not such a method on its own. Only certified cells
count toward `resolution:`. A processor that cannot reach the
requested resolution still reports the map and says so, and it SHOULD
name its method. Estimates at sample points MAY be reported
separately, as in H.9; they never change the status of a cell.

The claims presuppose that I.7 is defined on the cell. A processor
MUST NOT claim `equilibrium` or `not_equilibrium` for a cell unless it
has established that the design is well-defined (H.5) and stopping
(I.6) at every valuation of the cell. Stopping at the corners of a
cell does not imply stopping inside it. A sufficient check is the one
of the relaxation described below: every policy of the relaxed process
reaches the target with probability 1.

**Deciding a cell from bounds.** Suppose a method gives, for a cell C
and each player p, numbers that hold at every valuation v of C:

- l_p ≤ U_p(v) ≤ u_p, bounds of the payoff under the profile;
- b_p ≥ BR_p(v), an upper bound of the best-response value;
- for one or more strategies τ of p, d_p(τ) ≤ U_p(τ, v), a lower bound
  of the payoff of p under the profile in which p plays τ;
- for every state s of a set R_C, a lower bound l_p(s) ≤ V_p(s, v)
  of the payoff from s under the profile, and for every command c
  enabled in a state s of p in R_C in which the target of p does not
  hold, a number q_p(s, c) ≥ Q_p(s, c, v). Here V_p and Q_p are those
  of I.7 at θ(v), and R_C is a set of states that contains s₀ and,
  with a state s, every state s′ such that P(s, c, s′) is positive at
  some valuation of C for some command c enabled in s; the method
  must also have established that the game started in any state of
  R_C is stopping at every valuation of C.

Then:

- **N.** p is a deviator on C when d_p(τ) − u_p > ε for some strategy
  τ of p.
- **E1.** gain_p(v) ≤ ε on C when b_p − l_p ≤ ε.
- **E2.** gain_p(v) = 0 on C when q_p(s, c) ≤ l_p(s) for every state s
  of p in R_C in which the target of p does not hold and every command
  c enabled in s other than the one the profile selects (the one-step
  test of I.7).
- The profile is an equilibrium on C when every player satisfies E1 or
  E2.

These conditions are sufficient, not necessary. E1 compares a bound of
one function with a bound of another, as the conditions of H.9 do, and
here the two functions touch: BR_p(v) ≥ U_p(v) everywhere, with
equality wherever p does not gain. With ε = 0, E1 therefore holds only
when U_p is constant on the cell and both bounds are exact. That is
the case when the open parameters occur only in weights of terms that
are zero under the profile, as λ does in I.12; it is not the case as
soon as an open parameter changes the payoff under the profile. E2
does not have this defect: it compares the payoff of a one-step
deviation with the payoff of the profile in the same state, and these
differ at the valuations where the deviation strictly loses. E2
establishes more than is asked (no gain from any reachable state), so
it fails on a cell of equilibria that rest on a choice in a state the
profile never reaches. A cell next to the boundary stays `undecided`
under all three conditions.

**Bounds by parameter lifting (informative).** The relaxation of H.14
extends to a design of a strategic model. On a cell, every state
chooses a corner of the cell for the open parameters that occur in the
probabilities of its commands; a state of the player under study
chooses a command as well, and every other state of a player takes the
command the profile selects. The step payoff ρ_p(s, c) is enclosed by
its extreme values on the cell (at the corners when the weights are
multi-affine in the open parameters). When every policy of the relaxed
process reaches the target with probability 1, the design is stopping
on the cell, the maximal value of the process with the upper step
payoffs is a number b_p, and the minimal value with the lower step
payoffs, when the player's commands are fixed by τ or by the profile,
is a number d_p(τ) or l_p. The states reachable in the relaxed process
form a set R_C, and the bounds of E2 are obtained in the same way with
each of them as the initial state. Other sound methods
are admissible, for example exact reasoning on the rational functions
U_p and BR_p, or a proof that a gain is monotone in a parameter
([J.7](./appendix-j-grounding.md)).

## I.10 Static semantics {/* #i10-static-semantics */}

A processor that implements the extension MUST, in a file that
declares `games: 0.1`, apply the rules of H.10 with the changes stated
here, and in addition:

- **I-1.** A file that declares `games: 0.1` MUST also declare
  `stochastic: 0.1`; otherwise the processor reports an error and does
  not interpret the keys of this extension.
- **I-2.** `kind:`, if present, MUST be `dtmc` or `smg` (this replaces
  the last sentence of S-1). A model with `kind: smg` MUST have
  `players:` with at least one player, `profiles:`, `compliance:`, and
  `payoffs:`. A model whose `kind:` is `dtmc` or absent MUST NOT have
  `players:`, `profiles:`, `compliance:`, `payoffs:`, or
  `equilibria:`, an `owner:` on a command, or a `profile:` on a
  property or regime map; it is a model of Appendix H, and S-9
  applies to it.
- **I-3.** The `id` of a player MUST be an identifier, MUST NOT be one
  of the keywords that S-2 excludes, and MUST be unique among the
  players. `actors:` MUST list at least one actor reference, each
  naming a declared actor. Two players MUST NOT list references with
  the same actor name, and neither may one player.
- **I-4.** `owner:` MUST name a declared player. An owned command MUST
  have an `action:`. The commands with one action label MUST all have
  the same owner or all be unowned.
- **I-5.** (Replaces S-9 for a strategic model.) For every design and
  every state of S, reachable or not, the commands that exist in the
  design and have a true guard MUST be at most one command, or
  commands that are all owned by the same player and have pairwise
  different action labels. This is decided by enumerating S.
- **I-6.** The name of a profile MUST be an identifier, MUST NOT be
  one of the keywords that S-2 excludes, and MUST be unique among the
  profiles. In a rule, `choose:` MUST be the action label of an owned
  command, and `guard:` MUST be a boolean `state_pred` over variables
  and enumeration literals (S-6), without labels. For every design and
  every state of S in which two or more commands are enabled, some
  rule of every profile MUST apply (I.4). `compliance:` MUST name a
  profile. A processor SHOULD warn about a rule that is the first
  applicable rule in no state of any design.
- **I-7.** `model.payoffs:` MUST have exactly one entry for every
  player, and `player:` MUST name a declared player. `until:` MUST be
  a boolean `state_pred` in which labels may be used as in a property
  (S-6). `terms:` MUST have at least one term; `reward:` MUST name a
  declared reward structure, at most once per payoff; `weight:` MUST
  be a number or a `param_expr` whose identifiers are declared
  parameters. The keys `sanction_of:` and `reward_of:` of a term are
  defined by [Appendix J](./appendix-j-grounding.md); in a file that
  does not declare `grounding: 0.1`, a term that has one of them is an
  error.
- **I-8.** Every design MUST be well-defined (S-11) and stopping (I.6)
  at its fixed values.
- **I-9.** The `id` of an entry of `equilibria:` MUST be an identifier
  that S-2 admits and MUST be unique in the namespace of properties
  and regime maps. `profile:` MUST name a profile. `regimes:` MUST
  name designs of the file, at least one, each once. `epsilon:` MUST
  be a finite number that is not negative. `over:` and `resolution:`
  MUST satisfy the conditions that S-14 states for a regime map
  (`over:` has one to four declared parameters, each with `lo < hi`
  within the declared range and none assigned by any regime;
  `0 < r < 1`); `resolution:` MUST NOT appear without `over:`. A
  parameter in the `over:` of an entry of `equilibria:` MUST NOT occur
  in the `value:` of a reward item. Every listed design MUST be
  well-defined and stopping at every valuation of the region; a
  processor MUST check this at least at the corner points of the
  region and MUST NOT certify a cell on which it has not established
  it (I.9).
- **I-10.** The `profile:` of a property or of a regime map MUST name
  a profile. S-12 to S-14 apply to a strategic model unchanged, with
  M(D, θ, σ) in the place of the regime model.
- **I-11.** A processor SHOULD emit an informational diagnostic for a
  key or value reserved in I.1 and MUST NOT give it a meaning (this
  replaces the list of S-15 for a file that declares `games: 0.1`). A
  reserved value (`kind: mdp`, a `motivation.` source) gets this
  diagnostic in addition to the error of I-2 or S-3.
The rules S-2 to S-8 and S-10 to S-14 apply to a strategic model as
written. A weight is not a probability and not a reward value: no rule
restricts its sign or its range.

## I.11 Export to PRISM-games (informative) {/* #i11-export */}

PRISM-games reads turn-based stochastic multi-player games in an
extension of the PRISM modelling language: the model type is `smg`,
and each player is declared by a `player … endplayer` construct that
lists the action labels, in square brackets, and the modules that the
player controls. A state in which all available transitions belong to
one player is controlled by that player; actions and modules need not
be allocated to a player as long as no state has several such
transitions; a state whose transitions are owned by several players is
an error [[Kwiatkowska+, CAV 2020]](./appendix-b-references.md). These
are the conditions of I-4 and I-5.

H.11 does not apply to a strategic model as written: a design of a
strategic model is not a Markov chain, and a processor MUST NOT export
it as a `dtmc` file. Version 0.1 defines no export of the Markov chain
M(D, θ, σ) of a profile either. A processor MAY export a design of
a strategic model as the model file of
[H.11](./appendix-h-stochastic.md#h11-export) with two changes:

1. the first line is `smg` instead of `dtmc`;
2. after it, for each player that owns a command of the design, in
   declaration order, one construct that lists the action labels of
   the commands the player owns, in the order of their first
   declaration:

```
smg

player R
  [careful], [careless]
endplayer
```

A player that owns no command of the design is not written. All
commands of the design are written, whatever a profile selects;
unowned commands and the deadlock command are allocated to no player.
A player name is renamed by the rule of H.11 when it equals a keyword.

Version 0.1 defines **no properties file** for a strategic model. A
payoff is a sum of expected rewards with weights of either sign, and
the question of I.7 is a best response to a fixed profile. The
property language of PRISM-games states what a coalition can
guarantee against the other players, as in
`<<p1>> R{"r"}max=? [ F "success" ]`
[[Chen+, FMSD 2013]](./appendix-b-references.md), and equilibria of
its own choosing; neither is the question of this appendix, and a
translation is left to a later version. The syntax above was checked
against the PRISM-games manual (accessed Nov. 2026); files exported in
this form have not been run through PRISM-games (I.14).

## I.12 Example

The example extends that of
[H.12](./appendix-h-stochastic.md) by one choice. Before each attempt
the robot decides whether to follow the handling procedure. A
`careful` attempt costs the robot an effort of 1 and succeeds with the
probability s of H.12. A `careless` attempt costs no effort and
succeeds with probability s/2. The dispatcher pays a fee of 10 for a
delivered parcel, and a careless attempt is sanctioned: the robot
loses 2·λ, where 2 is the size of the sanction at full intensity and λ
is the incentive intensity of the contract. One more variable,
`settled`, and one chance command, `settle`, close the task, so that
the fee is the reward of a step.

```yaml
sos:
  name: "RobotDeliveryGame"
  type: Acknowledged
  extensions:
    - stochastic: 0.1
    - games: 0.1

  actors:
    - { id: DISPATCHER,    role: "Assigns and replans routes" }
    - { id: "ROBOT[1..N]", role: "Delivers parcels" }

  contracts:
    - id: DELIVERY
      parties: [DISPATCHER, "ROBOT[*]"]
      information: { alpha: 0.9 }
      authority:   { decision_holder: DISPATCHER, beta: 0.9 }
      incentives:  { lambda: 0.1 }

  transitions:
    - { from: CENTRALIZED, to: DISTRIBUTED, condition: "loss_rate > 0.3" }
    - { from: DISTRIBUTED, to: CENTRALIZED, condition: "loss_rate <= 0.2" }

  model:
    kind: smg
    parameters:
      - { id: p_fail,  range: [0, 0.5], value: 0.05 }
      - { id: p_loss,  range: [0, 0.5], value: 0.1 }
      - { id: alpha,   from: "DELIVERY.alpha" }
      - { id: beta,    from: "DELIVERY.beta" }
      - { id: lambda,  from: "DELIVERY.lambda" }        # 0.1, range [0, 1]
      - { id: q_local, range: [0, 1],   value: 0.6 }
    variables:
      - { id: task,     type: "{Pending, Delivered}", init: Pending }
      - { id: attempts, type: "[0..3]",               init: 0 }
      - { id: settled,  type: bool,                   init: false }
    labels:
      delivered: "task == Delivered"
    players:
      - { id: R, actors: ["ROBOT[*]"] }
      - { id: D, actors: [DISPATCHER] }
    commands:
      - action: careful
        owner: R
        guard: "task == Pending AND attempts < 3"
        updates:
          - prob: "beta * alpha * (1 - p_fail) * (1 - p_loss) + (1 - beta) * q_local"
            set: { task: Delivered, attempts: "attempts + 1" }
          - prob: rest
            set: { attempts: "attempts + 1" }
      - action: careless
        owner: R
        guard: "task == Pending AND attempts < 3"
        updates:
          - prob: "0.5 * (beta * alpha * (1 - p_fail) * (1 - p_loss) + (1 - beta) * q_local)"
            set: { task: Delivered, attempts: "attempts + 1" }
          - prob: rest
            set: { attempts: "attempts + 1" }
      - action: settle
        guard: "(task == Delivered OR attempts == 3) AND NOT settled"
        updates:
          - set: { settled: true }
    regimes:
      CENTRALIZED: { parameters: { beta: 0.9 } }
      DISTRIBUTED: { parameters: { beta: 0.1 } }
    rewards:
      - { id: fee,       items: [ { action: settle, guard: "task == Delivered", value: 1 } ] }
      - { id: effort,    items: [ { action: careful,  value: 1 } ] }
      - { id: shortcuts, items: [ { action: careless, value: 1 } ] }
    profiles:
      comply:
        - { choose: careful }
      shortcut_first:
        - { guard: "attempts == 0", choose: careless }
        - { choose: careful }
    compliance: comply
    payoffs:
      - player: R
        until: "settled"
        terms:
          - { reward: fee,       weight: 10 }
          - { reward: effort,    weight: -1 }
          - { reward: shortcuts, weight: "-2 * lambda" }
      - player: D
        until: "settled"
        terms:
          - { reward: fee, weight: 5 }
    properties:
      - { id: P_DELIVERY, expr: "P>=0.95 [ F<=3 delivered ]" }
      - { id: P_DELIVERY_SHORTCUT, profile: shortcut_first, expr: "P=? [ F<=3 delivered ]" }
    equilibria:
      - { id: comply_nash }
      - { id: shortcut_nash, profile: shortcut_first }
      - { id: comply_by_lambda, over: { lambda: [0, 1] }, resolution: 0.05 }
      - id: comply_by_lambda_and_failure
        regimes: [CENTRALIZED, DISTRIBUTED]
        over: { lambda: [0, 0.4], p_fail: [0, 0.5] }
        resolution: 0.05
```

**The game.** The model has 16 states, 11 of them reachable. In the
states with `task == Pending AND attempts < 3` the two commands of R
are enabled: these are the states of R (I-5). In the states with
`task == Delivered OR attempts == 3` that are not yet settled, the
unowned command `settle` is enabled: these are chance states. The
settled states are deadlock states. The player D owns no command and
has no choice; it is declared so that the fee has a receiver. Every path reaches `settled` within four steps
whatever R does, so both designs are stopping at every valuation, and
all probabilities lie in `[0, 1]` on the regions of the two maps. The
profile `comply` selects `careful` in every state of R. The profile
`shortcut_first` selects `careless` before the first attempt, by its
first rule, and `careful` afterwards.

Under `comply` the model is that of H.12 with one more step, so
`P_DELIVERY` has the values of H.12: 0.984848 (`satisfied`) in
CENTRALIZED and 0.943796 (`violated`) in DISTRIBUTED. Under
`shortcut_first`, `P_DELIVERY_SHORTCUT` is 1 − (1 − s/2)(1 − s)²:
0.961808 and 0.898534. Computed values in this section are rounded to
six decimals.

**The closed form.** Write g = 10 for the fee, c = 1 for the cost of
effort, m = 2 for the size of the sanction, and s for the probability
that a careful attempt succeeds (s_C = 0.75255 and s_D = 0.61695 at
the fixed values, H.12). Let V_k be the payoff of R under `comply`
from a state in which k attempts remain:

```text
V_0 = 0,    V_k = s·g − c + (1 − s)·V_(k−1)
V_1 = s·g − c,    V_2 = (s·g − c)(2 − s),    V_3 = (s·g − c)(1 + (1 − s) + (1 − s)²)
```

V_3 is the payoff of R under `comply`; λ does not occur in it, because
`comply` takes no careless attempt. A single careless attempt with k
attempts remaining, followed by `comply`, gives
−m·λ + (s/2)·g + (1 − s/2)·V_(k−1). It is at most V_k exactly when

```text
λ ≥ T_k,    where   T_k = ( c − (s/2)·(g − V_(k−1)) ) / m
```

Being careless saves the effort c and loses, with probability s/2, the
difference between delivering now and continuing. When s·g ≥ c, which
holds for s ≥ 0.1, V_0 ≤ V_1 ≤ V_2 and therefore T_1 ≤ T_2 ≤ T_3: the
temptation is greatest before the first attempt, when a failure can
still be repaired. With g − V_2 = g·(1 − s)² + c·(2 − s),

```text
λ* = max(0, T_3),    T_3 = ( c − (s/2)·( g·(1 − s)² + c·(2 − s) ) ) / m
```

**`comply` is a Nash equilibrium of a design at θ exactly when
λ ≥ λ\*.** If λ ≥ λ\*, then λ ≥ T_k for k = 1, 2, 3, the one-step test
of I.7 holds in every state of R, and R has no gain; D has no choice
and no gain. If λ < λ\*, then λ\* = T_3 > 0, and `shortcut_first`
gives R the payoff V_3 + m·(T_3 − λ), which is more than V_3. In both
designs T_2 is negative at the fixed values (−0.153684 and −0.245044),
so for every λ ≥ 0 a careless attempt later than the first one loses,
`shortcut_first` is the best response for λ < λ\*, and

```text
gain_R = max(0, m·(λ* − λ)) = max(0, 2·(λ* − λ))
```

By the same computation `shortcut_first` is a Nash equilibrium exactly
when λ ≤ λ\*; at λ = λ\* both profiles are equilibria.

**The checks.** At the fixed values, with λ = 0.1:

| | CENTRALIZED | DISTRIBUTED |
| --- | --- | --- |
| s | 0.75255 | 0.61695 |
| λ\* = T_3 | 480347064349/3200000000000 = 0.150108 | 193194567781/3200000000000 = 0.060373 |
| under `comply`: expected `fee`, `effort`, `shortcuts` | 0.984848, 1.308682, 0 | 0.943796, 1.529777, 0 |
| u_R under `comply` | 6831840915651/800000000000 = 8.539801 | 6326547012219/800000000000 = 7.908184 |
| under `shortcut_first`: expected `fee`, `effort`, `shortcuts` | 0.961808, 0.778066, 1 | 0.898534, 0.956414, 1 |
| u_R under `shortcut_first` | 8.840018 − 2·λ = 8.640018 | 8.028930 − 2·λ = 7.828930 |
| u_D under `comply` / `shortcut_first` | 4.924241 / 4.809042 | 4.718981 / 4.492672 |
| `comply_nash`: BR_R, gain_R | 8.640018, 160347064349/1600000000000 = 0.100217 | 7.908184, 0 |
| `comply_nash`: status | `not_equilibrium`, deviator R, best response: `careless` in the state with `attempts == 0` | `equilibrium` |
| `shortcut_nash`: gain_R, status | 0, `equilibrium` | 126805432219/1600000000000 = 0.079253, `not_equilibrium`, deviator R |

With the declared λ = 0.1, compliance is an equilibrium in the
distributed regime and not in the centralised one. The gain of D is 0
in every check. When R takes the shortcut, D loses: the fee is paid
less often.

**The map over λ.** `comply_by_lambda` opens λ on `[0, 1]` in both
designs. A cell `[a, b]` is an equilibrium cell exactly when a ≥ λ\*,
and R is a deviator on it exactly when b < λ\*; the cell that contains
λ\* in its interior is `undecided`. Conditions E1 and N of I.9 decide
all other cells, with exact bounds: U_R is constant in λ, the largest
best-response value on the cell is the one at λ = a, and the payoff of
`shortcut_first` is least at λ = b. A processor that bisects the
largest undecided cell until the resolution of 0.05 is reached
reports:

| Design | `not_equilibrium` (deviator R) | `undecided` | `equilibrium` | Undecided fraction |
| --- | --- | --- | --- | --- |
| CENTRALIZED | `[0, 1/8]` | `[1/8, 5/32]` | `[5/32, 1]` | 1/32 |
| DISTRIBUTED | `[0, 1/32]` | `[1/32, 1/16]` | `[1/16, 1]` | 1/32 |

For 0.060373 ≤ λ < 0.150108, compliance is an equilibrium in
DISTRIBUTED only; from 0.150108 on, in both.

**The map over λ and the failure probability.**
`comply_by_lambda_and_failure` also opens p_fail. With the other
parameters fixed, s_C = 0.729·(1 − p_fail) + 0.06 and
s_D = 0.081·(1 − p_fail) + 0.54, and in each design `comply` is an
equilibrium exactly where λ ≥ λ\*(s). T_3 increases with s on the
range of s that occurs, so the region in which compliance is not an
equilibrium lies below a curve that falls as p_fail grows. Values of
λ\* for checking an implementation:

| p_fail | s_C | λ\*, CENTRALIZED | s_D | λ\*, DISTRIBUTED |
| --- | --- | --- | --- | --- |
| 0 | 0.789 | 0.173313 | 0.621 | 0.062908 |
| 0.05 | 0.75255 | 0.150108 | 0.61695 | 0.060373 |
| 0.1 | 0.7161 | 0.125857 | 0.6129 | 0.057859 |
| 0.2 | 0.6432 | 0.077118 | 0.6048 | 0.052897 |
| 0.3 | 0.5703 | 0.032907 | 0.5967 | 0.048028 |
| 0.4 | 0.4974 | 0 | 0.5886 | 0.043261 |
| 0.5 | 0.4245 | 0 | 0.5805 | 0.038604 |

In CENTRALIZED, T_3 = 0 at s = 1/2, that is at
p_fail = 289/729 = 0.396433: when the dispatcher fails that often, a
failed attempt costs the robot so much that it is careful without any
sanction. Up to p_fail = 0.2 the centralised regime needs the stronger
incentive; at p_fail = 0.3 the distributed one does. On this map U_R
varies with p_fail, so E1 decides no `equilibrium` cell (I.9); the
cells away from the curve are decided by E2 and N.

## I.13 Intermediate Representation (IR) addition

The field `stochastic_model` of
[H.13](./appendix-h-stochastic.md) is extended for a strategic model.
`kind` is `"smg"`. Every command has a field `owner` (a player `id`,
or `null`), after `action`. Every property and regime map has a field
`profile`, with the default filled in. Five fields are added after
`regime_maps`, in this order:

```jsonc
{
  "stochastic_model": {
    "kind": "smg",
    // ... the fields of H.13
    "players": [ { "id": "R", "actors": ["ROBOT[*]"] }, { "id": "D", "actors": ["DISPATCHER"] } ],
    "profiles": [
      { "id": "comply", "rules": [ { "guard": "true", "choose": "careful" } ] },
      { "id": "shortcut_first", "rules": [ { "guard": "attempts == 0", "choose": "careless" },
                                           { "guard": "true", "choose": "careful" } ] }
    ],
    "compliance": "comply",
    "payoffs": [
      { "player": "R", "until": "settled",
        "terms": [ { "reward": "fee", "weight": "10" }, { "reward": "effort", "weight": "-1" },
                   { "reward": "shortcuts", "weight": "-2 * lambda" } ] }
      // ... D
    ],
    "equilibria": [
      { "id": "comply_nash", "profile": "comply", "regimes": ["CENTRALIZED", "DISTRIBUTED"],
        "epsilon": 0, "over": null, "resolution": null },
      { "id": "comply_by_lambda", "profile": "comply", "regimes": ["CENTRALIZED", "DISTRIBUTED"],
        "epsilon": 0, "over": { "lambda": [0, 1] }, "resolution": 0.05 }
      // ... shortcut_nash, comply_by_lambda_and_failure
    ]
  }
}
```

Guards, targets, and weights are kept as text, like the expressions of
H.13; the defaults of I.2 are filled in. `profiles` is a list in the
order of the file. For a model of Appendix H the five fields are
absent and `owner` and `profile` are not written, so the IR of a file
that does not use the extension is unchanged. The `open` field of a
parameter keeps its meaning of H.13 (open in some regime map). Results
of analyses are not in the IR.

## I.14 Reference implementation status {/* #i14-reference-implementation-status */}

Games 0.1 is **not implemented** in `cadl` 0.3.22.

- `cadl check` reports the extension name `games` as unknown, with an
  informational diagnostic, and reads the `model:` block by the rules
  of Appendix H. For a strategic model it therefore reports
  `kind: smg` as an error (S-1) and two commands of one player that
  are enabled in the same state as an error (S-9), and it reports
  `players:`, `payoffs:`, `equilibria:`, and `owner:` as reserved
  (S-15). The example of I.12 does not pass `cadl check` 0.3.22, and
  `stochastic_model` is `null` for it. This is the behaviour that I.15
  asks of a processor without the extension, except for the two
  errors.
- Planned: the rules I-1 to I-11 in `cadl check`; a command
  `cadl game-check` that evaluates the equilibrium checks of I.8 with
  exact rational arithmetic and, with `--certify`, computes the
  equilibrium maps of I.9 by the relaxation of I.9 on top of the
  solvers of the certified regime maps
  ([H.14](./appendix-h-stochastic.md#h14-reference-implementation-status));
  the IR of I.13; and the export of I.11 in `cadl model-export`.
- The numbers of I.12 were computed without an implementation of the
  extension. For each of the eight strategies of R (careful or
  careless before each of the three attempts) a Markov-chain variant
  of the model was written by hand as a file of Appendix H, and the
  expected values of `fee`, `effort`, and `shortcuts` were evaluated
  in both designs with `cadl model-check` 0.3.22, which uses exact
  rational arithmetic. The 48 values agree, as rational numbers, with
  the closed forms of I.12, and the payoffs, best responses, and gains
  of the tables follow from them.
- The conditions N, E1, and E2 of I.9 were tried on the two maps of
  I.12 with a script written for this model only, in which the
  relaxation is worked out by hand. On the map over λ, N and E1
  decide every cell except the one that contains λ\*. On the map over
  λ and p_fail, N and E2 reach the resolution of 0.05 in both designs
  (CENTRALIZED: 0.8088 of the region certified `equilibrium`, 0.1412
  `not_equilibrium`, 0.0499 undecided), and without E2 no
  `equilibrium` cell is decided. Every decided cell was evaluated
  exactly at its corners, its centre, and six random rational points
  (13 728 point evaluations), and the claim held at each of them. The
  script is not part of `cadl` and proves nothing about other models.
- The export of I.11 has not been run through PRISM-games.

## I.15 Backward compatibility

Files written against CADL v0.3 without this extension remain valid
and are read the same way. A file that declares `stochastic: 0.1` and
not `games: 0.1` is read by Appendix H unchanged: the names that H.1
reserves stay reserved for it, and S-9 and S-15 apply.

A file that uses `kind: smg` or the keys of this appendix without
declaring `games: 0.1` does not conform to this appendix. A processor
that implements the extension reads the `model:` block of such a file
by Appendix H and SHOULD report the keys as an undeclared extension.
A file that declares `games: 0.1` without `stochastic: 0.1` gets the
error of I-1.

A processor that implements Appendix H and not this appendix cannot
read a strategic model as a Markov chain. For a file that declares
`games: 0.1` it MUST NOT apply the semantics of H.7 to a `model:`
block with `kind: smg`: the block is not lowered to the IR, not
exported, and not evaluated. It SHOULD say so in a single
informational diagnostic. Processors that implement neither extension
MUST NOT reject a file because of `model:`; they SHOULD emit a single
informational diagnostic per file.
