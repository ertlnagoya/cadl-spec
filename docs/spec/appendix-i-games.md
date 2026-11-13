---
sidebar_position: 19
title: "Appendix I: Strategic Model Extension"
description: "Strategic model extension (games 0.1): players and ownership of commands in the model of Appendix H, named memoryless deterministic profiles with a distinguished compliance profile, payoffs as weighted expected rewards, checks that a named profile is an equilibrium against unilateral deviations or from every reachable state, with deviation gains, and equilibrium maps over institutional parameters with certified cells, also from the end points of a cell."
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
and asks whether that behaviour is an equilibrium against unilateral
deviations: at the fixed values of the parameters, or as a map over a
region of parameters.

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
- **The question is defined exactly.** I.7 defines when a named
  profile is a Nash equilibrium of a design at a valuation, that is,
  when no player gains by deviating from it alone, and the **deviation
  gain** of each player; `concept: every_reachable_state` asks the same
  from every state that a player can reach by its own deviations. I.9 defines the **equilibrium map**: cells of
  a region of parameters, each certified in the sense of H.9 as
  `equilibrium` or `not_equilibrium`, or left `undecided`. The
  appendix defines what a correct answer is and gives sufficient
  conditions that a processor can compute; it prescribes no algorithm.

**Scope of version 0.1.**

- The game is **turn-based**: in every state at most one player
  chooses (I-5). There are no concurrent moves and no synchronisation
  of commands. When players choose at the same time, an equilibrium
  needs randomisation already in a game with one state, and exact
  values are no longer rational: the values of two-player zero-sum
  concurrent stochastic games (the games of Shapley and Everett, of
  which concurrent reachability games are a special case) may be
  irrational algebraic numbers
  [[Hansen+, STOC 2011]](./appendix-b-references.md). PRISM-games
  computes subgame-perfect Nash and correlated equilibria of
  concurrent stochastic games that are optimal for social welfare or
  social fairness, for nonzero-sum probabilistic and reward
  objectives; for objectives with an infinite horizon it approximates
  the values by value iteration
  [[Kwiatkowska+, TACAS 2022]](./appendix-b-references.md). The payoffs
  of I.6 have an infinite horizon, and the claims of I.9 must be
  established exactly or with a sound error bound, so concurrent games
  wait for a method that gives such bounds.
- Strategies named in a file are **memoryless and deterministic**: a
  choice of one command per state. There are no mixed strategies, so
  an equilibrium in mixed strategies cannot be named or found. Checking
  a named stationary randomised profile with rational probabilities
  against unilateral deviations would remain the best-response problem
  of I.7 and could be decided exactly; finding such a profile cannot.
  In turn-based stochastic games with several players and reachability
  objectives, whether there is a stationary Nash equilibrium with a
  constraint on the payoffs is NP-hard, the square-root-sum problem
  reduces to it, and the payoff of a stationary equilibrium can be
  irrational; whether there is any Nash equilibrium with such a
  constraint is undecidable, also for pure strategies, already with 10
  players [[Ummels & Wojtczak, LMCS 2011]](./appendix-b-references.md).
  Version 0.1 therefore asks about named profiles only and has no
  syntax for randomised ones.
- Every player observes the whole state. Equilibria under partial
  observation, which is what α controls (RD-7.3), remain open. The
  best response of one player who does not observe the whole state is
  a partially observable Markov decision process, and whether such a
  process has a policy whose expected total reward over an infinite
  horizon, discounted or not, exceeds a threshold is undecidable
  [[Madani+, AI 2003]](./appendix-b-references.md). Even the check of
  one named profile against unilateral deviations is then not
  decidable in general: the reduction of I.7 to finitely many
  memoryless strategies does not hold.
- A player is one representative of the actors it stands for, and an
  actor set has at most one player (I-3). Two members of one actor
  set, for example two robots that compete, cannot be two players.
- A payoff is a weighted sum of expected rewards accumulated until a
  target, for a profile from which no single player can keep the game
  away from its target (I.6). Discounted, mean-payoff, and
  step-bounded payoffs are not defined; a bounded horizon is written
  with a counter variable, as `attempts` in I.12.
- The equilibrium notions are the Nash equilibrium of a named profile
  and the equilibrium from every reachable state (I.7, `concept:`),
  each with its ε-relaxation. Subgame-perfect equilibria, dominant
  strategies, the set of all equilibria of a game, and whether a
  property holds on every equilibrium (the question of RD-7.1 in full)
  are not defined. I.7 explains why the equilibrium from every
  reachable state is weaker than subgame perfection.
- A centralised mediator, modelled as a correlated equilibrium, and
  the value of centralisation of RD-7.2 are out of scope. A correlated
  equilibrium needs a device that recommends a joint choice to the
  players, which the model of Appendix H does not have; the method of
  PRISM-games cited above computes it for concurrent games and
  approximates its values for infinite-horizon objectives.
- An equilibrium is asked for per design; a switch between regimes is
  not part of the game (H.1).
- **Reserved**, and not to be used with another meaning: the key
  `sync:` of a command and `owner:` of a variable; the keys
  `mediator:` and `observations:` of `model:`; the values
  `subgame_perfect` and `correlated` of the key `concept:` of an entry
  of `equilibria:`; the value `mdp` of `kind:`; and the parameter
  sources `motivation.rho` and `motivation.kappa`. Of the names that
  H.1 reserves, this appendix defines `players:`, `payoffs:`,
  `equilibria:`, and `owner:` of a command.

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
                  [ "resolution:" , number ] ,
                  [ "concept:"    , ( "nash" | "every_reachable_state" ) ] ;
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
`0.05`. `concept:` is `nash`.

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
(H.8); what happens after that position does not count. Write φ_p for
the target of the payoff of p. Under one general strategy per player,
the payoff of p is

```text
u_p  =  Σ_k  w_k[θ] · E[ accumulated reward of r_k until φ_p ]
```

over the terms k of p's payoff, where E is the expectation under the
induced measure. For a profile σ, the expectation of the k-th term is
the value of the query `R{"r_k"}=? [ F φ_p ]` in M(D, θ, σ); write
u_p(D, θ, σ) for the payoff.

**The game of one player against a profile.** The question of I.7
lets one player deviate while the others follow a profile σ. For a
player p, a command is **allowed** in a state s when s is a state of
p and the command is in En(s), when s is a state of another player
and σ selects the command, or when s is a chance state and the
command is its enabled command. Reach_p(D, θ, σ), written Reach_p, is
the set of states s for which there is a sequence s₀, …, s_n = s such
that φ_p holds in none of s₀, …, s_(n−1) and each s_(i+1) has a
positive probability P(s_i, c, s_(i+1)) for a command c allowed in
s_i. These are the states that p can reach while its payoff is still
accumulating; a state in which φ_p holds belongs to Reach_p when it is
reached in this way, and nothing beyond it does.

**Admissible profiles.** The definition needs every expectation to be
finite, and a player must not be able to make its payoff infinite or
undefined by keeping the game away from its target. A profile σ is
**admissible for p** at θ when, for every strategy τ of p, the
probability of `F φ_p` in M(D, θ, σ[p↦τ]) is 1. It is **admissible**
at θ when it is admissible for every player. Admissibility depends
only on which probabilities P(s, c, s′) are positive, and it has a
graph characterisation: σ is admissible for p exactly when there is no
non-empty set E of states of Reach_p in which φ_p does not hold such
that every state of E either is a deadlock state or has an allowed
command all of whose successors of positive probability lie in E.
(Such a set is a deadlock in which the target does not hold, or an end
component that avoids the target.) A processor decides it on the graph
of Reach_p: starting from the states of Reach_p in which φ_p does not
hold, it removes, as long as there is one, a state that is not a
deadlock state and has no allowed command all of whose successors of
positive probability remain; σ is admissible for p exactly when no
state remains.

When σ is admissible for p, φ_p is reached with probability 1 also
under every general strategy of p against σ, from every state of
Reach_p, and the expected number of steps until then is finite,
because the minimal probability of reaching a set of states in a
finite Markov decision process is attained by a memoryless
deterministic policy
[[Baier & Katoen, 2008]](./appendix-b-references.md) (Chapter 10).
The payoff of p is then a real number whatever p does. The statement
concerns Reach_p only: a state that is reachable only after φ_p has
held may be a deadlock state or lie on a cycle, and this does no harm.

I.7 to I.9 are defined for a profile at the valuations at which the
design is well-defined (H.5) and the profile is admissible. A profile
that is not admissible at θ has no equilibrium status there. I-8
requires admissibility at the fixed values; I-9 and I.9 say what is
required on the region of an equilibrium map. Admissibility is weaker
than requiring that the game end under all profiles: it concerns the
deviations of one player at a time from the profile that is asked
about.

## I.7 Equilibrium

Fix a design D that is well-defined at θ and a profile σ that is
admissible at θ.

**Nash equilibrium.** σ is a **Nash equilibrium** of D at θ when no
player gains by deviating alone: for every player p and every
**general** strategy τ of p, the payoff of p when p plays τ and every
other player plays as in σ is at most u_p(D, θ, σ). The notion
concerns unilateral deviations only, from a profile that is named in
the file.

**Memoryless deterministic deviations suffice.** When the other
players play as in σ, what remains is a finite Markov decision process
on Reach_p in which p alone chooses, with the reward
ρ_p(s, c) = Σ_k w_k[θ] · (reward of r_k for taking c in s) per step,
of either sign, accumulated until φ_p. The stochastic shortest path
problem of [[Bertsekas & Tsitsiklis, 1991]](./appendix-b-references.md)
is this problem with costs −ρ_p and the states of φ_p as the
destination. Its two assumptions are that a proper stationary policy
exists (one that reaches the destination with probability 1 from every
state) and that every improper stationary policy has an infinite cost
from some state; costs may have either sign. Under them, the optimal
cost is the unique solution of Bellman's equation and is attained by a
stationary deterministic policy. Here every stationary policy is
proper, because σ is admissible for p, so the first assumption holds
and the second holds vacuously. A policy that depends on the history
or randomises attains no more: for every such policy and initial state
there is a randomised policy that depends on the step and the current
state only and has the same probability of every pair of a state and a
command at every step ([[Puterman, 1994]](./appendix-b-references.md),
Section 5.5), hence the same expected total reward, and a randomised
choice in a state attains at most the maximum over the commands in
Bellman's equation. Hence the **best-response value**

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
M(D, θ, σ), and solve the Markov decision process of p on Reach_p for
BR_p. Both are solved exactly by linear equations and policy iteration
over the rational numbers when the parameters are rational.

**Values from a state.** For a state s of Reach_p, write V_p(s) for
the payoff of p under σ, and V\*_p(s) for the best-response value of
p, in the game started in s instead of s₀; both are 0 when φ_p holds
in s. For a state s of Reach_p in which φ_p does not hold and a
command c allowed in s, write

```text
Q_p(s, c)   =  ρ_p(s, c) + Σ_s′ P(s, c, s′) · V_p(s′)
Q*_p(s, c)  =  ρ_p(s, c) + Σ_s′ P(s, c, s′) · V*_p(s′)
```

Q_p(s, c) is the payoff of p when c is taken once in s and σ is
followed afterwards. V\*_p is the unique solution of
V\*_p(s) = max over the allowed commands c of Q\*_p(s, c), and
BR_p = V\*_p(s₀).

**Equilibrium from every reachable state.** σ is an **equilibrium
from every reachable state** at θ when V\*_p(s) = V_p(s) for every
player p and every state s of Reach_p: no player gains by deviating
alone, wherever in Reach_p it starts to deviate. For a number ε ≥ 0,
σ is an **ε-equilibrium from every reachable state** when
V\*_p(s) − V_p(s) ≤ ε for every player p and every state s of
Reach_p. The **state gain** of p,

```text
sgain_p(D, θ, σ)  =  max over the states s of Reach_p of  V*_p(s) − V_p(s)
```

is the largest of these differences; it is at least gain_p, since s₀
belongs to Reach_p. An equilibrium from every reachable state is
therefore a Nash equilibrium. The converse does not hold: σ can be a
Nash equilibrium although p could gain in a state that is reached only
when p itself deviates. An entry of `equilibria:` with
`concept: every_reachable_state` asks for this notion (I.8, I.9); a
result of the default concept `nash` reports it as `from_every_state`
when it was established on the way.

**Weaker than subgame perfection.** A profile is subgame perfect when
it is an equilibrium in the game started in every state, whoever
deviated before. The equilibrium from every reachable state asks less
in two ways. Reach_p contains only the states that p reaches by its
own deviations while the others follow σ; a state that is reached
only when another player q deviates is in Reach_q, where only the
gains of q are examined, and not in Reach_p. And in a state of Reach_p
that belongs to another player q, the command that σ selects for q is
fixed: it is not examined against the interest of q unless the state
is also in Reach_q. A threat that a player would not carry out is
therefore not detected. Example (the file is the data of a test of
the reference implementation): A chooses `out`, with payoffs 1 for A
and 3 for B, or `enter`; after `enter`, B chooses `fight` (−1 for
both) or `share` (2 for both). The profile (out; fight) is an
equilibrium from every reachable state: the state after `enter` is in
Reach_A, where A gains nothing by entering, and not in Reach_B, since
A does not enter under the profile. It is not subgame perfect: in the
state after `enter`, B gains 3 by sharing. Subgame perfection is not
offered as a query because the payoffs of a player are not defined in
general from a state that only another player's deviation reaches:
admissibility (I.6) concerns the deviations of the player itself, and
from such a state another player may keep the game away from the
target. A definition would first have to say which profiles are to be
admissible from which states.

**The one-step test.** V\*_p(s) = V_p(s) for every state s of Reach_p
exactly when Q_p(s, c) ≤ V_p(s) for every state s of p in Reach_p in
which φ_p does not hold and every command c of En(s). If the
inequalities hold, V_p solves Bellman's equation, whose solution is
unique; if one fails in s, taking c once in s gains from s. The test
is therefore necessary and sufficient for "no gain of p from any
state of Reach_p", and sufficient, not necessary, for gain_p = 0.

**The reported best response.** Among the best responses of p, the
**canonical best response** is the strategy that selects, in a state
s of p in Reach_p in which φ_p does not hold, the command that σ
selects when Q\*_p(s, c) = V\*_p(s) for it, and otherwise the first
command c of En(s), in the order of `model.commands:`, with
Q\*_p(s, c) = V\*_p(s); in every other state it selects what σ
selects. It is a best response, it is determined by the file, and it
differs from σ only where the command of σ is not optimal.

## I.8 Equilibrium checks at the fixed values

`model.equilibria:` lists **equilibrium queries**. An entry without
`over:` is an **equilibrium check**: it asks, for each design listed
in `regimes:` (default: all designs), whether the profile named by
`profile:` (default: the compliance profile) is an ε-equilibrium of
the design at the fixed values of all parameters (H.3), with ε given
by `epsilon:` (default 0). In a file without `transitions:` the only
design is `base` (H.6); `regimes:` is then omitted or is `[base]`.

The result, per design, consists of:

- for every player p: the payoff u_p, the best-response value BR_p,
  and the deviation gain;
- the `status`: `equilibrium` when every gain is at most ε, and
  `not_equilibrium` otherwise;
- for `not_equilibrium`: the non-empty set `deviators` of the players
  whose gain exceeds ε, and for each of them the canonical best
  response (I.7), as the list of the states that are reachable from
  the initial state under σ[p↦τ] before φ_p holds and in which it
  selects another command than the profile, in the order of S
  (variables in declaration order, values in the order of their
  domains), each with the action label selected;
- `from_every_state`: `true` when the processor has established that
  the profile is an equilibrium from every reachable state (I.7),
  `false` when it has established that it is not, and absent or
  `null` when it has not examined the question. It is reported only
  with the status `equilibrium` and ε = 0.

**The concept `every_reachable_state`.** With
`concept: every_reachable_state` the check asks whether the profile is
an ε-equilibrium from every reachable state (I.7). The result is the
one above, with these changes: the `status` is `equilibrium` when
every state gain is at most ε; `deviators` are the players whose state
gain exceeds ε; every player also has its state gain and, when it is
a deviator, the **state** s: the first state of Reach_p, in the order
of S, at which V\*_p(s) − V_p(s) equals the state gain; and the
canonical best response of a deviator is listed on the states that
are reachable from s, instead of s₀, under σ[p↦τ] before φ_p. The
canonical best response is optimal from every state of Reach_p, since
it selects an optimal command in each of them, so its payoff from s
exceeds V_p(s) by the state gain. `from_every_state` keeps its meaning.

By I-8 the profile is admissible at the fixed values. A processor that
evaluates a check at other values (I.13) first establishes that the
design is well-defined and the profile admissible there, and reports
an error otherwise.

A processor that reports results MUST compute them with exact
arithmetic or with numerics that have a sound error bound, or mark the
result as approximate; a `status` that the error bound does not decide
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
- **`profile:`**, **`regimes:`**, **`epsilon:`**, **`concept:`** as in
  I.8.
- **`resolution:`** is a number r with 0 < r < 1: the fraction of the
  volume of B that may remain undecided, per design.

For a design D and a valuation v ∈ B, θ(v) agrees with v on the open
parameters and has the fixed values of D elsewhere (H.7). Write
U_p(v), BR_p(v), and gain_p(v) for the payoff, the best-response
value, and the deviation gain of p in D at θ(v) for the profile of the
query, and sgain_p(v), V_p(s, v), and V\*_p(s, v) for the state gain
and the values from a state s of Reach_p (I.7); they are defined where
D is well-defined and the profile admissible at θ(v).

**What is asked.** For each listed design: at which valuations of B is
the profile an ε-equilibrium? A **cell** is a closed box contained in
B (H.9).

- The profile is an **equilibrium on a cell** C when, at every v ∈ C,
  D is well-defined and the profile admissible at θ(v), and
  gain_p(v) ≤ ε for every player p.
- A player p is a **deviator on a cell** C when, at every v ∈ C, D is
  well-defined and the profile admissible at θ(v), and gain_p(v) > ε.

For `concept: every_reachable_state`, gain_p is replaced by sgain_p in
both definitions: the profile is an equilibrium on C when
sgain_p(v) ≤ ε for every player at every v ∈ C, and p is a deviator on
C when sgain_p(v) > ε at every v ∈ C. A deviator may then gain from
different states at different valuations, and Reach_p itself may
change inside the cell, since a probability may be zero at some
valuations and positive at others.

**The result.** The answer consists of one **equilibrium map** per
listed design. An equilibrium map is a finite set of cells that cover
B and whose interiors are pairwise disjoint, each with a `status`,
together with the undecided fraction (the volume of the `undecided`
cells divided by the volume of B) and whether it is at most
`resolution:`.

| `status` | Claim | Reported with it |
| --- | --- | --- |
| `equilibrium` | the profile is an equilibrium on the cell | `from_every_state` (see below) |
| `not_equilibrium` | every player in `deviators` is a deviator on the cell | `deviators`, a non-empty set of players |
| `undecided` | none | `reason` |

`deviators` contains only players who gain at every valuation of the
cell; a processor SHOULD list every player for whom it has established
this. A cell that lies across the surface on which the deviator
changes, so that at every valuation some player gains but no single
player does everywhere, stays `undecided` until a refinement separates
the parts. For a `not_equilibrium` cell a processor SHOULD also
report, for each deviator, a strategy that gains more than ε at every
valuation of the cell, when its method provides one (as condition N
below does), and for every decided cell the bounds of the gains it
established. For `concept: every_reachable_state` the strategy is
reported with the state s from which it gains, which then belongs to
Reach_p at every valuation of the cell (condition N_s below), and with
a lower bound of that gain (`deviation_states`). `from_every_state` is `true` for an `equilibrium` cell
when the processor has established that the profile is an equilibrium
from every reachable state (I.7) at every valuation of the cell, and
absent or `null` otherwise. For a cell the field does not depend on ε:
it is a statement about gains of zero and is stronger than the claim
of an ε-equilibrium, so it may be `true` also when ε > 0.

An `undecided` cell SHOULD carry a `reason`: `not_well_defined` (the
processor has not established that the design is well-defined on the
cell), `not_admissible` (it has not established that the profile is
admissible on the cell, or has found a valuation at which it is not),
or `bounds` (its bounds do not decide the cell, or the budget is
exhausted).

A cell that contains both a valuation at which the profile is an
ε-equilibrium and one at which it is not can have neither status.
Where the two kinds of valuations meet, as at λ\* in I.12, such cells
remain however fine the partition, which is why `resolution:` is
greater than zero.

A processor MAY report the union of cells as one cell when the union
is a box and the claim holds on each part: the same status; for
`not_equilibrium`, `deviators` a non-empty subset of the deviators of
every part, with a deviation only where the same strategy was
reported for that deviator in every part; `from_every_state: true`
only when every part carries it; `gain_bounds` the hull.

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

**Well-definedness and admissibility on the region.** The claims
presuppose that I.7 is defined on the cell. A processor MUST NOT claim
`equilibrium` or `not_equilibrium` for a cell unless it has
established that the design is well-defined (H.5) and the profile
admissible (I.6) at every valuation of the cell.

Checking the corners of a box is not enough for admissibility. A
probability can be positive inside a box and zero at a corner, so the
corners have the smallest graphs and the interior the largest. For a
design whose probabilities are all **multi-affine** in the open
parameters (no open parameter occurs with a power above one in a
probability, the value of `rest` included) the following holds. Call
a *face* of the box B a set obtained by fixing some of the open
parameters, possibly none, at an end of their intervals and letting
each of the others range over the open interval between its ends; B
has 3ⁿ faces for n open parameters, and every valuation of B lies in
exactly one of them. If the design is well-defined at the corners of
B, a probability is a positive combination of its values at the
corners of a face at every valuation of that face, so it is zero at
one valuation of a face only if it is zero on the whole face. The
graph of the game is therefore the same at all valuations of one
face, and since admissibility depends on the graph only:

> For a design whose probabilities are multi-affine in the open
> parameters and that is well-defined at the corners of B, a profile
> is admissible at every valuation of B exactly when it is admissible
> at the centre of each of the 3ⁿ faces of B (the valuations in which
> every open parameter is at the lower end, the middle, or the upper
> end of its interval).

I-9 requires this check. For such a design, a failure at the centre
of a face means that the profile is not admissible at any valuation
of that face. A region that touches a degenerate end, for example a
retry loop whose success probability is 0 at `lo`, is therefore an
error of the file, and the author shrinks the interval. When the
check succeeds for such a design, the profile is admissible on every
cell, and nothing remains to be established per cell for
admissibility; a bounding method may still fail on a cell, for
example the relaxation on a cell that touches such a face; that cell
is `undecided` with the reason `bounds`. The reason `not_admissible`
of an undecided cell can therefore occur only for a design that is
not multi-affine. For a design with a probability that is not
multi-affine, the processor establishes admissibility for each cell,
for example by the relaxation below, or leaves the cell `undecided`
with the reason `not_admissible`.

**Deciding a cell from bounds.** For a player p and a cell C, let
R_C(p) be a set of states that contains s₀ and, with a state s in
which φ_p does not hold, every state s′ such that P(s, c, s′) is
positive at some valuation of C for some command c allowed in s for p
(I.6); it contains Reach_p at every valuation of C. Suppose a method
gives, for each player p, numbers that hold at every valuation v of
C:

- l_p ≤ U_p(v) ≤ u_p, bounds of the payoff under the profile;
- b_p ≥ BR_p(v), an upper bound of the best-response value, and, for
  every state s of R_C(p), b_p(s) ≥ V\*_p(s, v) for every v in C at
  which s is a state of Reach_p;
- for one or more strategies τ of p, d_p(τ) ≤ U_p(τ, v), a lower bound
  of the payoff of p under the profile in which p plays τ, and
  d_p(τ, s), a lower bound of that payoff in the game started in a
  state s of R_C(p), for every v in C at which s is a state of
  Reach_p;
- for every state s of R_C(p), numbers l_p(s) and u_p(s) with
  l_p(s) ≤ V_p(s, v) ≤ u_p(s) for every v in C and every state s of
  Reach_p at θ(v) (both 0 when φ_p holds in s), and, for every state
  s of p in R_C(p) in which φ_p does not hold and every command c of
  En(s), a number q_p(s, c) with q_p(s, c) ≥ Q_p(s, c, v) for every v
  in C at which s is a state of Reach_p at θ(v). Nothing is required
  at a valuation at which s is not reachable, where V_p(s, v) need
  not exist. Such a number is obtained from an upper
  bound of the step payoff ρ_p(s, c) on C and the **upper** bounds
  u_p(s′) of the successors: q_p(s, c) is at least
  ρ_p(s, c) + Σ_s′ μ(s′) · u_p(s′) for every distribution μ that the
  command can have on C.

Then:

- **N.** p is a deviator on C when d_p(τ) − u_p > ε for some strategy
  τ of p.
- **E1.** gain_p(v) ≤ ε on C when b_p − l_p ≤ ε.
- **E2.** V\*_p(s, v) = V_p(s, v) for every state s of Reach_p at
  every valuation of C, and in particular gain_p(v) = 0 on C, when
  q_p(s, c) ≤ l_p(s) for every state s of p in R_C(p) in which φ_p
  does not hold and every command c of En(s) other than the one the
  profile selects (the one-step test of I.7, with the upper bound of
  the deviating command against the **lower** bound of the profile in
  the same state).
- The profile is an equilibrium on C when every player satisfies E1 or
  E2. It is an equilibrium from every reachable state at every
  valuation of C (`from_every_state: true`) when every player
  satisfies E2.

For `concept: every_reachable_state`, E2 serves as it is, E1 is
required at every state, and N is complemented by a condition that
names a state. Let R⁺_C(p) be the set of states that contains s₀ and,
with a state s in which φ_p does not hold, every state s′ such that
P(s, c, s′) is positive at **every** valuation of C for some command c
allowed in s for p. Every state of R⁺_C(p) is in Reach_p at every
valuation of C, by induction along the path that put it there, since
the allowed commands do not depend on the valuation. A probability
that is multi-affine in the open parameters is positive on C when it
is positive at every corner of C, because its value at a valuation of
C is a convex combination of its values at the corners; any other
probability is positive on C when an exact interval enclosure of it
on C has a positive lower end. A probability that is zero at a corner
does not count, even if it is positive elsewhere in C.

- **E1\*.** sgain_p(v) ≤ ε on C when b_p(s) − l_p(s) ≤ ε for every
  state s of R_C(p) in which φ_p does not hold. At every v, every
  state s of Reach_p is in R_C(p), and V\*_p(s, v) − V_p(s, v) is at
  most b_p(s) − l_p(s).
- **N_s.** p is a deviator on C when there are a state s of R⁺_C(p) in
  which φ_p does not hold and a strategy τ of p with
  d_p(τ, s) − u_p(s) > ε. At every v, s is in Reach_p, and the payoff
  of τ from s exceeds V_p(s, v) by more than ε, so sgain_p(v) > ε. N is
  the case s = s₀.
- The profile is an equilibrium on C when every player satisfies E1\*
  or E2; p is a deviator on C when it satisfies N or N_s. With ε = 0,
  an equilibrium cell of this concept is an equilibrium from every
  reachable state at every valuation (`from_every_state: true`).

Without R⁺_C(p), N_s would be unsound: a state that is reachable at
the centre of a cell may be unreachable at a corner, where the
probability that leads to it is zero, and the profile may be an
equilibrium from every reachable state there.

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
establishes more than is asked, so it fails on a cell of Nash
equilibria in which p could gain in a state that only its own
deviation reaches. A cell next to the boundary stays `undecided` under
all three conditions.

**Bounds by parameter lifting (informative).** The relaxation of H.14
extends to the game of one player against the profile. On a cell,
every state chooses, independently of the other states, a distribution
for each of its allowed commands; a state of the player under study
chooses a command as well, and every other state of a player takes the
command the profile selects. When the probabilities of a command are
multi-affine in the open parameters, the distributions to choose from
are those at the corners of the cell, and the distribution at any
valuation of the cell is a mixture of them. When they are not, corners
do not suffice: each probability is enclosed by an interval on the
cell, as H.14 describes, and the state chooses a vertex of the set of
distributions within these intervals. The step payoff ρ_p(s, c) is
enclosed by its extreme values on the cell (at the corners when the
weights are multi-affine in the open parameters, by interval
arithmetic otherwise). The states reachable in the relaxed process
form a set R_C(p). When every policy of the relaxed process reaches
φ_p with probability 1, the profile is admissible for p on the cell;
the maximal value of the process with the upper step payoffs is a
number b_p, and the minimal and maximal values with the player's
commands fixed by τ or by the profile, with the lower and the upper
step payoffs, are numbers d_p(τ), l_p, and u_p, and with each state of
R_C(p) as the initial state, l_p(s) and u_p(s). For condition N, a
strategy τ can be chosen, for example, as the canonical best response
of p (I.7) at the centre of the cell, restricted to the states that
are reachable under it there; it decides how much of a region gets
`not_equilibrium`. For N_s, the same strategy on all of Reach_p at the
centre can be used, with d_p(τ, s) the minimal value of the relaxed
process from s, and the strategy reported as its restriction to the
states that the relaxed process reaches from s under it. Other sound
methods are admissible, for example exact reasoning on the rational
functions U_p and BR_p, or the certification by the end points of a
cell below, which proves that a gain is convex or monotone in a
parameter. The conditions PD+ and PD− below bound a gain directly
through the one-step advantages.

**Conditions from the one-step advantages.** For a state s of p in
R_C(p) in which φ_p does not hold, a command c of En(s), and a valuation
v of C at which s is a state of Reach_p, the **advantage**

```text
A_p(s, c, v)  =  Q_p(s, c, v) − V_p(s, v)
```

is the gain of taking c once in s and following the profile afterwards;
it is 0 for the command that the profile selects. For a strategy τ of p
and a state s of Reach_p at θ(v), write U_p(τ, s, v) for the payoff of p
in the game started in s when p plays τ and the others follow the
profile. The **performance-difference identity** states

```text
U_p(τ, s, v) − V_p(s, v)  =  E[ Σ_t A_p(s_t, c_t, v) ]
```

where the expectation is over the plays from s under σ[p↦τ] until φ_p,
s_t is the state of step t and c_t the command taken in it, and a step
in a state of another player, or in a state in which τ selects the
command of the profile, adds 0. *Proof.* Given s_t and c_t, the
expectation of ρ_p(s_t, c_t) + V_p(s_(t+1), v) is Q_p(s_t, c_t, v). The
sum of the advantages is therefore, in expectation, the accumulated
payoff of p minus V_p(s, v) plus the value V_p at the first state in
which φ_p holds, which is 0. Every state of the play is in Reach_p, and
the expected number of steps is finite since the profile is admissible
(I.6). ∎ V\*_p(s, v) − V_p(s, v) is the largest of these expectations
over the strategies τ of p (I.7).

Suppose a method gives, for each such s and each command c other than
the one the profile selects, numbers a⁻_p(s, c) ≤ A_p(s, c, v) ≤
a⁺_p(s, c) for every v in C at which s is a state of Reach_p, both 0 for
the command of the profile and in the states of the other players. Let
g⁺_p(s) be an upper bound, over all strategies of p and all v in C at
which s is a state of Reach_p, of the expected sum of a⁺_p along the
play from s, and g⁻_p(τ, s) a lower bound, over these v, of the expected
sum of a⁻_p along the play of τ from s. Then:

- **PD+.** gain_p(v) ≤ ε on C when g⁺_p(s₀) ≤ ε. For
  `concept: every_reachable_state`, sgain_p(v) ≤ ε on C when
  g⁺_p(s) ≤ ε for every state s of R_C(p) in which φ_p does not hold.
  When g⁺_p(s) ≤ 0 for all these states, V\*_p(s, v) = V_p(s, v) for
  every state s of Reach_p at every valuation of C, as under E2.
- **PD−.** p is a deviator on C when g⁻_p(τ, s₀) > ε for a strategy τ
  of p, and, for `concept: every_reachable_state`, also when
  g⁻_p(τ, s) > ε for a state s of R⁺_C(p) in which φ_p does not hold.

PD+ may take the place of E1 or E1\*, and of E2 for `from_every_state`;
PD− may take the place of N or N_s. These conditions, too, are
sufficient, not necessary. Unlike E1 and N, they do not compare a bound
of the payoff under one strategy with a bound of the payoff under
another, so the variation of U_p over the cell does not enter twice.
With σ(s) the command of the profile, V_p(s, v) = Q_p(s, σ(s), v), and
since both distributions sum to 1,

```text
A_p(s, c, v)  =  ρ_p(s, c) − ρ_p(s, σ(s))
                 + Σ_s′ (P(s, c, s′) − P(s, σ(s), s′)) · (V_p(s′, v) − m)
```

for every number m, with ρ_p and P at v. The difference of the two step
payoffs and each difference of two probabilities is a single function
of the open parameters and is bounded on C as such (at the corners when
it is multi-affine, by an exact interval enclosure otherwise); V_p(s′, v)
is bounded by l_p(s′) and u_p(s′), and the products by interval
arithmetic. A successor s′ whose difference is not zero at v is in
Reach_p at v, since both commands are allowed in s. In the relaxation
above, g⁺_p(s) is the maximal value from s with the step reward a⁺_p,
and g⁻_p(τ, s) the minimal value from s with the commands of p fixed by
τ and the step reward a⁻_p; they are bounds for the same reason as b_p
and d_p(τ).

**Coupled bounds of the advantages (informative).** The bounds above
take V_p(s′, v) between l_p(s′) and u_p(s′) for each successor
separately. When the advantage is the difference of the values of two
different successors whose values change together with v, the
difference of their bounds can be much wider than the range of the
advantage on C. When the probabilities of every command of the design
are multi-affine in the open parameters, the advantage can be bounded
by running the two plays together. For a valuation v of C, let w_e(v)
be the multilinear weights of v with respect to the corners e of C:
they are not negative, their sum is 1, and f(v) = Σ_e w_e(v) · f(e) for
every function f that is multi-affine in the open parameters. Consider
two plays from s, one that takes c in s and one that takes σ(s), both
following the profile afterwards. In each step, a corner e is drawn
with probability w_e(v), and the pair of current states (x, y) moves by
a joint distribution whose marginals are the distributions of the two
commands at e. Any such joint distribution may be chosen as a fixed
function of (x, y) and e; when x = y it must keep the two states equal,
and a play in which φ_p holds stays where it is. Each play alone is
then the Markov chain at v: given the past, its next state has the
distribution Σ_e w_e(v) · P(x, ·, e) = P(x, ·, v). The expected step
payoff of each play in each step is also that at v, so, since both
plays reach φ_p after a finite expected number of steps, the expected
difference of their accumulated payoffs is Q_p(s, c, v) − Q_p(s, σ(s), v)
= A_p(s, c, v). A pair of equal states, and a pair of two states in
which φ_p holds, adds 0 from then on.

Drawing the corner at random is a randomised policy of the following
process on pairs: in each pair (x, y) of different states that do not
both satisfy φ_p, a corner e is chosen, the step reward is
ρ_p(x, e) − ρ_p(y, e), and the pair moves by the joint distribution at
e; a step payoff that is not multi-affine in the open parameters is
replaced by its bound on C in the direction of the bound sought. Each
play alone follows a policy of the relaxed process above, which reaches
φ_p with probability 1 under every policy when the profile is
admissible on the cell as established there, so every policy of the
process on pairs ends with probability 1. Its largest value from the
first step (c and σ(s) in s) is therefore an upper bound a⁺_p(s, c),
and its least value a lower bound a⁻_p(s, c), at every valuation of C.
Together with the bounds above, the smaller upper and the larger lower
bound may be used. The coupled bounds tend to be narrower when the joint
distribution keeps the two plays in the same state where it can, and
otherwise in step: for two commands with the same probabilities at e,
such as the attempts of the robot with and without monitoring in the
second example of I.12, the two plays then take corresponding updates
together. Each step still chooses its corner, so the bounds are not
exact.

When a probability is not multi-affine, the vertices of the sets of
distributions of H.14 are not mixtures with weights common to all
commands, and the argument does not apply as it stands. It applies to
a lifted cell. Write each probability that is not multi-affine in the
open parameters x as a + b · R(x), with numbers a and b and a
polynomial R without constant term, normalised (for example, its first
coefficient is 1) so that probabilities that differ only in a and b
have the same R, and give each such R a new coordinate y_R with the
interval [α_R, β_R] of an exact enclosure of R on C, for example the
one that the relaxation of H.14 uses. Replacing R(x) by y_R turns every
probability into a polynomial L in (x, y) that is multi-affine and
satisfies L(x, R(x)) = P(x); in a command whose lifted polynomials do
not sum to 1 identically, one of those that contain a y is replaced by
1 minus the others, which still equals its probability at (x, R(x))
because the probabilities sum to 1. Let B be the lifted cell, C times
the intervals [α_R, β_R]. For v in C the point u(v) = (v, R(v)) lies in
B, so the multilinear weights w_e(u(v)) of the corners e of B are not
negative, sum to 1, and are the same for every command, and every
lifted polynomial satisfies L(u(v)) = Σ_e w_e(u(v)) · L(e). The
distribution of a command at v is therefore Σ_e w_e(u(v)) · D_e, where
D_e lists the lifted polynomials of the command at e, for both plays
with the same weights; a step payoff that is multi-affine in x is
multi-affine in (x, y) and is a mixture with the same weights. A corner
e is used for a command only when D_e is a distribution of the relaxed
process above, that is, when each of its components lies in the
interval that the relaxation gives that probability on C (they sum to 1
by construction). With this check, each play alone again follows a
mixture of the distributions of the relaxed process, every policy of
the process on pairs ends with probability 1, and the argument above
holds with the corners of B in place of those of C and w_e(u(v)) in
place of w_e(v). The relation between y and x is given up, which makes
the bounds wider; in exchange, two commands with the same probability
get the same coordinate and so the same value at every corner of B, and
the two plays again take corresponding updates together. When the check
fails at a corner that a bound needs, that bound is not used, which is
always sound. For a design whose probabilities are multi-affine, B is C.

**Certification by the end points of a cell.** When the only open
parameter enters the game through weights only, a cell can be decided
from two exact evaluations. A processor MAY decide a cell [a, b] of an
equilibrium map from its end points, and MUST NOT do so unless
condition A holds:

- **A.** The query has exactly one open parameter ℓ; ℓ occurs in no
  `prob:` of a command of the design and in no reward `value:`; and in
  every `weight:` of every player, and in every weight that
  [Appendix J](./appendix-j-grounding.md) defines, ℓ occurs with a
  power of at most one, counted on the text (the powers of the factors
  of a product add up, and nothing cancels:
  `lambda * lambda - lambda * lambda` has the power two).

Under A, the weight of the k-th term of p is, at the fixed values of
the other parameters, a_k + c_k·ℓ with numbers a_k and c_k. For a
player p and a state s of Reach_p:

- **B−** holds for p from s when c_k ≤ 0 for every term k of p and,
  for every term with c_k ≠ 0, the expected accumulated reward of r_k
  until φ_p in the game started in s under the profile is 0;
- **B+** holds for p from s when the same holds with c_k ≥ 0.

A term whose ℓ has the coefficient 0 at these values, or in whose
weight ℓ does not occur, imposes nothing; a player with no other
terms satisfies both. In Appendix J, a `sanction_of:` term has
c_k = −m ≤ 0 and satisfies B− from s₀ when the profile incurs no
sanction of the norm, which condition (ii) of J.7 states.

> **Proposition.** Assume A, and fix the values of the other
> parameters.
>
> 0. Whether D is well-defined, whether the profile is admissible,
>    Reach_p, and every expected accumulated reward do not depend
>    on ℓ.
> 1. Where they hold, for every player p and every state s of
>    Reach_p, V\*_p(s) − V_p(s) is a convex, piecewise linear function
>    of ℓ, and so are gain_p and sgain_p.
> 2. If B− holds for p from s, V\*_p(s) − V_p(s) is non-increasing in
>    ℓ, and so is the gain from s of every fixed strategy of p. If B+
>    holds, both are non-decreasing.

*Proof.* By A the probabilities, and with them the graph of the game,
do not depend on ℓ; well-definedness and admissibility depend only on
the probabilities (H.5, I.6), Reach_p only on the graph, and an
expected accumulated reward only on the probabilities and the reward
values. For a strategy τ of p, the payoff of p in the game started in
s under σ[p↦τ] is Σ_k (a_k + c_k·ℓ) · E_τ,s[r_k] = A_s(τ) + ℓ·B_s(τ),
where E_τ,s[r_k] is the expected accumulated reward of r_k until φ_p,
and A_s(τ) and B_s(τ) do not depend on ℓ. V\*_p(s) is the maximum of
finitely many such affine functions (I.7, for the game started in s),
hence convex and piecewise linear, and V_p(s) = A_s(σ) + ℓ·B_s(σ) is
affine, so their difference is convex and piecewise linear; gain_p is
the case s = s₀, and sgain_p, a maximum over the finitely many states
of Reach_p, which does not depend on ℓ, is convex and piecewise linear
as well. Under B−, every E_τ,s[r_k] is at least 0, since reward values
are not negative (H.5), so B_s(τ) ≤ 0 for every τ; and B_s(σ) = 0,
since every term with c_k ≠ 0 has the expected value 0 under the
profile. The gain from s of every τ, (A_s(τ) − A_s(σ)) + ℓ·B_s(τ), is
then non-increasing, and so is its maximum over τ. Under B+, B_s(τ) ≥ 0
and the same argument gives non-decreasing functions. ∎

The method, for a cell [a, b] and a profile σ:

- The cell is `equilibrium` when σ is an ε-equilibrium (of the concept
  of the query) at a and at b, established exactly (I.8). By part 0
  the design is well-defined and σ admissible on the whole cell, and
  by part 1 a convex function that is at most ε at both ends is at
  most ε in between. The gain bounds `[0, max(g(a), g(b))]` hold for
  each player, where g is gain_p.
- For `concept: nash`, p is a deviator on the cell when B− holds for p
  from s₀ and gain_p(b) > ε, or B+ holds from s₀ and gain_p(a) > ε. By
  part 2 the gain at the deciding end is a lower bound on the cell; the
  canonical best response at that end is a deviation that gains more
  than ε on the whole cell, and the gain bounds are `[g(b), g(a)]`
  under B− and `[g(a), g(b)]` under B+.
- For `concept: every_reachable_state`, p is a deviator on the cell
  when, for some state s of Reach_p, B− holds from s and
  V\*_p(s) − V_p(s) > ε at b, or B+ holds from s and the difference
  exceeds ε at a. By part 0, s is in Reach_p on the whole cell. The
  canonical best response at the deciding end, restricted to the
  states reachable from s under it, gains more than ε from s on the
  whole cell, by part 2.
- No other status follows. A gain above ε at both ends does not make
  p a deviator on the cell without B: a gain |1 − 2ℓ| is convex, above
  1/4 at ℓ = 0 and at ℓ = 1, and 0 at ℓ = 1/2. The method claims
  `from_every_state: true` only for an equilibrium cell of
  `concept: every_reachable_state` with ε = 0.

This is not evaluation at sample points in the sense of H.9: the
proposition proves convexity and monotonicity, and the method is
sound only under A and, for a deviator, B. A processor that uses it
together with the conditions above applies it to the cells that
those conditions leave `undecided`, and MAY add to a `not_equilibrium`
cell the deviators that the end points establish; a cell decided by
the conditions above keeps its claim. Without A, nothing of the above
holds: when ℓ occurs in a probability the payoffs are rational
functions of ℓ, and a gain can rise and fall again inside a cell
whose end points are equilibria. With two or more open parameters the
proposition holds along each parameter with the others fixed and
says nothing about a box. [J-14](./appendix-j-grounding.md#j8-static-semantics)
refers to this method for the weights that Appendix J defines.

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
- **I-3.** The `id` of a player MUST be an identifier, MUST NOT be a
  keyword of A.11, `IN`, or `rest`, and MUST be unique among the
  players. The keywords `F`, `U`, `P`, and `R` of the property
  sub-language are admitted, since a player id occurs in no
  expression. `actors:` MUST list at least one actor reference, each
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
  applicable rule in no state of any design. (`profiles:` is a YAML
  mapping: a processor that reads the file through a YAML loader
  cannot detect two profiles with the same name, since the loader
  keeps one of them; the same holds for the labels of H.4.)
- **I-7.** `model.payoffs:` MUST have exactly one entry for every
  player, and `player:` MUST name a declared player. `until:` MUST be
  a boolean `state_pred` in which labels may be used as in a property
  (S-6). `terms:` MUST have at least one term; `reward:` MUST name a
  declared reward structure, at most once per payoff; `weight:` MUST
  be a number or a `param_expr` whose identifiers are declared
  parameters. A processor SHOULD warn when the target of a payoff
  holds in the initial state: the payoff is then 0 under every
  profile. The keys `sanction_of:` and `reward_of:` of a term are
  defined by [Appendix J](./appendix-j-grounding.md). In a file that
  does not declare `grounding: 0.1`, a term that has one of them is an
  error. In a file that declares it, a processor that does not
  implement Appendix J MUST NOT evaluate a payoff that has such a
  term, nor a query that needs that payoff: it reports the query as
  not evaluated, with a diagnostic that names the term. Every entry of
  `equilibria:` needs the payoffs of all players and is then not
  evaluated; properties and regime maps need no payoff and are
  evaluated, and I-8 and I-9 need only the targets of the payoffs.
  Such a term is never read as a term with the default weight.
- **I-8.** Every design MUST be well-defined at its fixed values
  (S-11), and every profile of the file MUST be admissible (I.6) in
  every design at the fixed values. This is weaker than requiring that
  every play of the game end.
- **I-9.** The `id` of an entry of `equilibria:` MUST be an identifier
  that S-2 admits and MUST be unique in the namespace of properties
  and regime maps. `profile:` MUST name a profile. `regimes:` MUST
  name designs of the file, at least one, each once. `epsilon:` MUST
  be a finite number that is not negative. `concept:` MUST be `nash` or
  `every_reachable_state`. `over:` and `resolution:`
  MUST satisfy the conditions that S-14 states for a regime map
  (`over:` has one to four declared parameters, each with `lo < hi`
  within the declared range and none assigned by any regime;
  `0 < r < 1`); `resolution:` MUST NOT appear without `over:`. Unlike
  a regime map (S-10), an entry with `over:` is allowed in a file
  without `transitions:`, where it concerns the design `base`. A
  parameter in the `over:` of an entry of `equilibria:` MUST NOT occur
  in the `value:` of a reward item. For every listed design, a
  processor MUST check that the design is well-defined at the corner
  points of the region (as S-14) and at the centre of every face, and
  that the profile is admissible at the centre of every face of the
  region (I.9: every open parameter at
  the lower end, the middle, or the upper end of its interval, 3ⁿ
  valuations); a failure at one of these valuations is an error of the
  file (for a multi-affine design the profile is then inadmissible on
  the whole face, I.9). For a design whose probabilities are multi-affine in the open
  parameters these checks decide both properties on the whole region
  (S-14, I.9). For any other design they do not; the processor then
  establishes both for each cell or leaves the cell `undecided`, and
  it MUST NOT certify a cell on which it has not established them.
- **I-10.** The `profile:` of a property or of a regime map MUST name
  a profile. S-12 to S-14 apply to a strategic model unchanged, with
  M(D, θ, σ) in the place of the regime model.
- **I-11.** A processor SHOULD emit an informational diagnostic for a
  key or value reserved in I.1 and MUST NOT give it a meaning (this
  replaces the list of S-15 for a file that declares `games: 0.1`). A
  reserved value (`kind: mdp`, a `motivation.` source, the `concept:`
  `subgame_perfect` or `correlated`) gets this diagnostic in addition
  to the error of I-2, S-3, or I-9.

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
are the conditions of I-4 and I-5. PRISM-games computes expected total
rewards only for a stopping game, one in which terminal states with
zero reward are reached with probability 1 under all strategies, which
is more than the admissibility of I.6. Storm (stormpy 2.0.0) parses an
exported `smg` file but refuses to build it unless every command is
owned by a player; the export targets PRISM-games.

H.11 does not apply to a strategic model as written: a design of a
strategic model is not a Markov chain, and a processor MUST NOT export
it as a `dtmc` file. Version 0.1 defines no export of the Markov chain
M(D, θ, σ) of a profile either. A processor MAY export a design of
a strategic model as the model file of
[H.11](./appendix-h-stochastic.md#h11-export) with two changes:

1. the first line is `smg` instead of `dtmc`;
2. after it, for each player, in declaration order, one construct that
   lists the action labels of the commands of the design that the
   player owns, in the order of their first declaration; the list is
   empty for a player that owns no command of the design:

```
smg

player R_
  [careful], [careless]
endplayer
```

A player that owns no command of the design is written with the empty
list, as `player D` followed by `endplayer`. Without such players, a
design without owned commands would give an `smg` file without any
`player` construct, which PRISM-games 3.2.4 rejects, and a player that
is not written cannot be named in a coalition. All
commands of the design are written, whatever a profile selects;
unowned commands and the deadlock command are allocated to no player.
A player name is renamed by the rule of H.11 when it equals a keyword
(`R` is one, hence `player R_`). For a strategic model the list of
keywords of H.11 is extended by `player`, `endplayer`, `smg`, `csg`,
and `tptg`, the keywords that the PRISM-games manual adds to the PRISM
language; every name of the exported model is renamed by this
extended list.
This appendix does not determine whether PRISM-games accepts a player
whose name equals another identifier of the model; an exporter SHOULD
report such a name. PRISM-games 3.2.4 accepts such a player when the
other identifier is a variable, a label, an action label, a parameter,
a reward structure, or the module `main` (I.14). A parameter that is
open only in an equilibrium map is written with its fixed value (I.13).

Version 0.1 defines **no properties file** for a strategic model. A
payoff is a sum of expected rewards with weights of either sign, and
the question of I.7 is a best response to a fixed profile. The
property language of PRISM-games states what a coalition can
guarantee against the other players, as in
`<<p1>> R{"r"}max=? [ F "success" ]`
[[Chen+, FMSD 2013]](./appendix-b-references.md), and equilibria of
its own choosing; neither is the question of this appendix, and a
translation is left to a later version. The syntax above was checked
against the PRISM-games manual (accessed Nov. 2026), and files exported
in this form were run through PRISM-games 3.2.4 (I.14). PRISM-games
3.2.4 rejects a reward structure with a negative reward and has no
exact engine for games, so a payoff whose weights have both signs is
not one reward structure of the exported file, and the values that
PRISM-games computes are floating-point numbers.

## I.12 Example

The first example extends that of
[H.12](./appendix-h-stochastic.md) by one choice; the second, at the
end of the section, adds a choice of the dispatcher. Before each attempt
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
has no choice; it is declared so that the fee has a receiver. Every
path reaches `settled` within four steps whatever R does, so every
profile is admissible at every valuation, and all probabilities lie in
`[0, 1]` on the regions of the two maps. The profile `comply` selects `careful` in every state of R. The profile
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
difference between delivering now and continuing. Let

```text
λ* = max(0, T_1, T_2, T_3)
T_1 = ( c − (s/2)·g ) / m
T_2 = ( c − (s/2)·(g − (s·g − c)) ) / m
T_3 = ( c − (s/2)·( g·(1 − s)² + c·(2 − s) ) ) / m
```

(for T_3, g − V_2 = g·(1 − s)² + c·(2 − s)).

**For 0 ≤ s < 1, `comply` is a Nash equilibrium of a design at θ
exactly when λ ≥ λ\*.** Under `comply` each of the three states of R
is reached with positive probability, since an attempt fails with
probability 1 − s > 0. So R has no gain exactly when the one-step test
of I.7 holds in the three states, that is, when λ ≥ T_k for
k = 1, 2, 3; D has no choice and no gain. The condition s < 1 is
needed for "exactly": at s = 1 the later states are reached only when
R deviates.

When s·g ≥ c, that is for s ≥ 0.1, V_0 ≤ V_1 ≤ V_2 and therefore
T_1 ≤ T_2 ≤ T_3, so λ\* = max(0, T_3): the temptation is greatest
before the first attempt, when a failure can still be repaired. This
is the case at the fixed values and on the regions of the two maps
below, where s ≥ 0.4245. It is not the case for small s: at
s = 0.07695 (DISTRIBUTED with q_local = 0), T_1 = 0.307625 is the
largest of the three.

By the same computation, **for 0 ≤ s < 1, `shortcut_first` is a Nash
equilibrium exactly when max(0, T_1, T_2) ≤ λ ≤ T_3**: R must prefer
the shortcut before the first attempt and care afterwards.

In both designs T_1 and T_2 are negative at the fixed values (T_2 is
−0.153684 and −0.245044) and T_3 is positive. There, for every λ ≥ 0,
a careless attempt later than the first one loses, `shortcut_first` is
the best response for λ < λ\*, it is a Nash equilibrium exactly when
λ ≤ λ\*, both profiles are equilibria at λ = λ\*, and

```text
gain_R = max(0, m·(λ* − λ)) = max(0, 2·(λ* − λ))
```

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
| `comply_nash`: `status` | `not_equilibrium`, `deviators`: R, canonical best response: `careless` in the state with `attempts == 0` | `equilibrium`, `from_every_state: true` |
| `shortcut_nash`: gain_R, `status` | 0, `equilibrium`, `from_every_state: true` | 126805432219/1600000000000 = 0.079253, `not_equilibrium`, `deviators`: R |

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
largest undecided cell until the resolution of 0.05 is reached, and
joins cells with the same claim (I.9), reports:

| Design | `not_equilibrium` (`deviators`: R) | `undecided` (`reason: bounds`) | `equilibrium` | Undecided fraction |
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
varies with p_fail, so E1 decides no `equilibrium` cell (I.9). For D,
whose gain is 0, E2 holds on every cell. For R, the cells away from the
curve are decided mostly by PD+ and PD−: in a bisection of CENTRALIZED
to the resolution of 0.05 (I.14), before cells are joined, PD+
establishes V\*_R = V_R on each of the 91 `equilibrium` cells, where
E1 and E2 fail, and PD− establishes R as a deviator on 66 of the 68
`not_equilibrium` cells, N on the other 2.

### A second example: two deciding players

In the first example only the robot chooses, so the check of each
player is an optimisation of one player. In the second, the
dispatcher chooses too: before the first attempt it decides whether
to `monitor` the robot, at a cost κ, or to `trust` it. A careless
attempt is sanctioned only when the dispatcher monitors. The file is
that of the first example with the following changes (the commands
`careful` and `careless` keep their updates):

```yaml
  model:
    kind: smg
    parameters:
      # ... as above, and:
      - { id: kappa,   range: [0, 1],   value: 0.05 }   # cost of monitoring
    variables:
      - { id: watch,    type: "{Open, On, Off}",      init: Open }
      # ... task, attempts, settled as above
    commands:
      - action: monitor
        owner: D
        guard: "watch == Open AND task == Pending AND attempts == 0"
        updates:
          - set: { watch: "On" }
      - action: trust
        owner: D
        guard: "watch == Open AND task == Pending AND attempts == 0"
        updates:
          - set: { watch: "Off" }
      - action: careful
        owner: R
        guard: "watch != Open AND task == Pending AND attempts < 3"
        # updates as above
      - action: careless
        owner: R
        guard: "watch != Open AND task == Pending AND attempts < 3"
        # updates as above
      - action: settle
        guard: "watch != Open AND (task == Delivered OR attempts == 3) AND NOT settled"
        updates:
          - set: { settled: true }
    rewards:
      - { id: fee,        items: [ { action: settle, guard: "task == Delivered", value: 1 } ] }
      - { id: effort,     items: [ { action: careful,  value: 1 } ] }
      - { id: shortcuts,  items: [ { action: careless, guard: "watch == On", value: 1 } ] }
      - { id: monitoring, items: [ { action: monitor,  value: 1 } ] }
    profiles:
      comply:
        - { choose: monitor }
        - { choose: careful }
      comply_if_watched:
        - { choose: monitor }
        - { guard: "watch == Off AND attempts == 0", choose: careless }
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
          - { reward: fee,        weight: 5 }
          - { reward: monitoring, weight: "-kappa" }
    equilibria:
      - { id: comply_nash }
      - { id: watched_nash, profile: comply_if_watched }
      - id: watched_map
        profile: comply_if_watched
        regimes: [CENTRALIZED]
        over: { lambda: [0, 0.4], kappa: [0, 0.4] }
        resolution: 0.25
```

The model has 48 states. The initial state is a state of D; the
states with `watch != Open AND task == Pending AND attempts < 3` are
states of R; the guards are written so that I-5 holds in the
unreachable states too. Every path reaches `settled` within five
steps, so every profile is admissible at every valuation. Both
profiles let D monitor and R be careful along the path that is
played, so they give the same payoffs: u_R is V_3 as before, and
u_D = 5·(1 − (1 − s)³) − κ. They differ in what R would do if D did
not monitor: under `comply`, R is careful all the same; under
`comply_if_watched`, R takes the shortcut before the first attempt.

**R.** While D monitors, the game of R against either profile is the
first example, so gain_R = max(0, 2·(λ\* − λ)) at the fixed values,
with the λ\* of the first example. The states with `watch == Off` are
not in Reach_R, and what the profile selects there does not matter
for R.

**D.** Against `comply`, trusting saves κ and changes nothing else,
so gain_D = κ: for every κ > 0, D is a deviator and `comply` is not a
Nash equilibrium, whatever λ is. Against `comply_if_watched`,
trusting saves κ and lets R take the shortcut, which lowers the
probability of delivery from 1 − (1 − s)³ to 1 − (1 − s/2)(1 − s)².
With

```text
κ* = 5 · (s/2) · (1 − s)²
```

D loses 5·(s/2)(1 − s)² − κ by trusting, and gain_D = max(0, κ − κ\*).

**`comply_if_watched` is a Nash equilibrium of a design, at the fixed
values of the other parameters, exactly when λ ≥ λ\* and κ ≤ κ\*.**
The behaviour that is played is the one of `comply`; it is an
equilibrium only together with what the robot would do when it is not
watched, which is what makes monitoring worth its cost.

| | CENTRALIZED | DISTRIBUTED |
| --- | --- | --- |
| λ\* | 0.150108 | 0.060373 |
| κ\* | 368638137651/3200000000000 = 0.115199 | 724187274219/3200000000000 = 0.226309 |
| u_R, u_D under both profiles (λ = 0.1, κ = 0.05) | 8.539801, 7798786117651/1600000000000 = 4.874241 | 7.908184, 7470368854219/1600000000000 = 4.668981 |
| u_D when D trusts, against `comply` / `comply_if_watched` | 4.924241 / 4.809042 | 4.718981 / 4.492672 |
| `comply_nash`: gain_R, gain_D | 0.100217, 1/20 | 0, 1/20 |
| `comply_nash`: status | `not_equilibrium`, deviators R and D | `not_equilibrium`, deviator D |
| `watched_nash`: gain_R, gain_D | 0.100217, 0 | 0, 0 |
| `watched_nash`: status | `not_equilibrium`, deviator R | `equilibrium` |

In `comply_nash` the canonical best response of D is `trust` in the
initial state. In `watched_nash` for DISTRIBUTED the one-step test
holds for both players, so the result carries
`from_every_state: true`.

**The map.** `watched_map` opens λ and κ in CENTRALIZED. R is a
deviator where λ < 0.150108 and D where κ > 0.115199. On the uniform
partition of the region into 4 × 4 cells (not the cells of a
bisection), the conditions of I.9 give the following; the columns are
the intervals of λ, the rows those of κ:

| κ \ λ | `[0, 0.1]` | `[0.1, 0.2]` | `[0.2, 0.3]` | `[0.3, 0.4]` |
| --- | --- | --- | --- | --- |
| `[0.3, 0.4]` | `not_equilibrium`, R and D | `not_equilibrium`, D | `not_equilibrium`, D | `not_equilibrium`, D |
| `[0.2, 0.3]` | `not_equilibrium`, R and D | `not_equilibrium`, D | `not_equilibrium`, D | `not_equilibrium`, D |
| `[0.1, 0.2]` | `not_equilibrium`, R | `undecided` | `undecided` | `undecided` |
| `[0, 0.1]` | `not_equilibrium`, R | `undecided` | `equilibrium` | `equilibrium` |

A bisection decides λ ∈ [0, 0.4] × κ ∈ [0.2, 0.4] as one cell with
`deviators: [D]`; a coarser cell can list fewer deviators.

Four of the 16 cells are `undecided`, with the reason `bounds`: the
undecided fraction is 1/4, which is the `resolution:` of the query.
N decides the deviators: for R with the strategy that is careless
before the first attempt while watched, whose payoff is least at the
upper end of λ; for D with `trust`, against the payoff of the profile
at the lower end of κ. In the cells of the second column and the two
upper rows, D is a deviator and R is not established as one, because
λ\* lies inside the column; `deviators` lists what is established. In
the two `equilibrium` cells, E2 holds for both players (for D: the
payoff of `trust`, 4.809042, is at most the lower bound 4.824241 of
the payoff of the profile at κ = 0.1), so they carry
`from_every_state: true`. E1 holds for R, whose payoff under the
profile is constant, and fails for D, whose payoff under the profile
falls with κ.

## I.13 Intermediate Representation (IR) addition and results

The field `stochastic_model` of
[H.13](./appendix-h-stochastic.md) is extended for a strategic model.
`kind` is `"smg"`. Every command has a field `owner` (a player `id`,
or `null`), after `action`. Every property has a field `profile`
after `regimes`, and every regime map a field `profile` after
`regimes`, with the default filled in. Every parameter has a field
`open_in_equilibria` after `open`: true when some entry of
`equilibria:` lists the parameter in `over:`. The `open` field keeps
its meaning of H.13 (open in some regime map), and only `open`
decides how a parameter is written by H.11: a parameter that is open
in an equilibrium map only is exported with its fixed value. Five
fields are added after `regime_maps`, in this order:

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
        "epsilon": 0, "over": null, "resolution": null, "concept": "nash" },
      { "id": "comply_by_lambda", "profile": "comply", "regimes": ["CENTRALIZED", "DISTRIBUTED"],
        "epsilon": 0, "over": { "lambda": [0, 1] }, "resolution": 0.05,
        "concept": "nash" }
      // ... shortcut_nash, comply_by_lambda_and_failure
    ]
  }
}
```

Guards, targets, and weights are kept as text, like the expressions of
H.13; the defaults of I.2 are filled in. `profiles` is a list in the
order of the file. For a model of Appendix H the five fields are
absent and `owner`, `profile`, and `open_in_equilibria` are not
written, so the IR of a file that does not use the extension is
unchanged. Results of analyses are not in the IR.

**Results (informative, but a processor that emits JSON SHOULD use
this shape).** Exact numbers are strings: an integer, or a fraction
`"n/d"` in lowest terms. The result of an equilibrium check
(abridged):

```jsonc
{ "id": "comply_nash", "profile": "comply", "epsilon": "0",
  "designs": [
    { "design": "CENTRALIZED",
      "parameters": { "p_fail": "1/20", "lambda": "1/10" /* ... every parameter */ },
      "status": "not_equilibrium",            // equilibrium | not_equilibrium | inconclusive | not_evaluated
      "deviators": ["R"],                     // [] unless not_equilibrium
      "from_every_state": null,               // true | false | null
      "players": [
        { "player": "R",
          "payoff": "6831840915651/800000000000",
          "best_response_value": "13824028895651/1600000000000",
          "gain": "160347064349/1600000000000",
          "best_response": [ { "state": { "task": "Pending", "attempts": 0, "settled": false },
                               "action": "careless" } ] },
        { "player": "D", "payoff": "7878786117651/1600000000000",
          "best_response_value": "7878786117651/1600000000000", "gain": "0", "best_response": [] }
      ] }
    // ... DISTRIBUTED
  ] }
```

The result of an equilibrium map query:

```jsonc
{ "id": "comply_by_lambda", "profile": "comply", "epsilon": "0",
  "over": { "lambda": ["0", "1"] }, "resolution": "1/20",
  "designs": [
    { "design": "CENTRALIZED", "method": "...",
      "parameters": { "p_fail": "1/20" /* ... every parameter that is not open */ },
      "cells": [
        { "box": { "lambda": ["0", "1/8"] }, "status": "not_equilibrium", "deviators": ["R"] },
        { "box": { "lambda": ["1/8", "5/32"] }, "status": "undecided", "reason": "bounds" },
        { "box": { "lambda": ["5/32", "1"] }, "status": "equilibrium", "from_every_state": true }
      ],
      "undecided_fraction": "1/32", "resolution_reached": true }
    // ... DISTRIBUTED
  ] }
```

When a processor does not evaluate a query because a payoff has a
`sanction_of:` or `reward_of:` term that it does not implement (I-7),
the result of each design, in a check and in a map, is
`{ "design": "...", "status": "not_evaluated", "reason": "..." }`,
where `reason` names the term, and has no other field. A map result
carries, per design, a field `parameters` like that of a check, with
the fixed values of the parameters that are not open.

`players` is in the order of declaration, and `cells` in the
lexicographic order of their lower corners, with the parameters in the
order of `over:`; `best_response` is the
canonical best response of I.7, with the values of all variables in
declaration order, and is empty for a player without a gain above ε. A
cell may also carry `method` (the method that decided it, for example
`"end points (I.9)"`), `deviations` (for each deviator, a strategy in
the form of `best_response`), `deviation_states` (for
`concept: every_reachable_state`: for each deviator, the state s of
condition N_s or of the end points, as `{ "state": …, "gain_lower": … }`,
the strategy of `deviations` being the one that gains from s) and
`gain_bounds` (for each player, a pair of
a lower and an upper bound of gain_p).

A result of a query with `concept: every_reachable_state` carries
`"concept": "every_reachable_state"` after `epsilon`; a result of the
default concept may omit the field. In a check of this concept, every
player has `state_gain` (an exact number) and `state` (the state s of
I.8 for a deviator, otherwise `null`) after `gain`, and its
`best_response` is the one from s.

**Processor behaviour.** A processor that offers the checks and maps
as a command MUST distinguish three outcomes by its exit status:

| Exit status | Meaning |
| --- | --- |
| 0 | every requested result was computed, whatever the answers (`equilibrium` or `not_equilibrium`, any number of `undecided` cells within the resolution) |
| 1 | some result is `inconclusive` or `not_evaluated`, or some map did not reach its `resolution:` |
| 2 | nothing can be claimed: a static error of the file, a usage error of the command, or a design that is not well-defined or a profile that is not admissible at the values at which the command was asked to evaluate |

When the command lets the user give a parameter another value than its
fixed value (as `--set` of `cadl model-check` does), the value MUST
lie in the declared range, giving a value to a parameter that the
evaluated query lists in `over:` is a usage error (exit status 2),
and the processor MUST check, for every design and profile of the
evaluated queries, that the design is well-defined and the profile
admissible at the values it uses (for a map, the checks of I-9) before
it evaluates.

When the command lets the user restrict the evaluation to one design
(as `--regime`), a query whose `regimes:` does not list that design is
reported with "the query does not concern this design", which is not
an error (exit status 0). A command MAY offer to start a map from the
uniform partition of the region into N intervals per open parameter
and to report the cells as analysed, without joining them (I.9); in
`cadl game-check` these are `--partition N` and `--no-merge`.

## I.14 Reference implementation status {/* #i14-reference-implementation-status */}

The reference implementation implements games 0.1 from `cadl` 0.3.23
as follows. Up to 0.3.22, `cadl check` reported the extension name
`games` as unknown and a strategic model as errors of S-1 and S-9
(see H.14).

- `cadl check` applies the rules I-1 to I-11 (the SHOULDs as
  warnings), including the corner and face-centre checks of I-9, and
  lowers the strategic model to the IR of I.13. A player id may be
  `F`, `U`, `P`, or `R` (I-3). Two profiles with the same name cannot
  be detected (I-6), because the file is read through a YAML loader.
  An undeclared use of the keys of this appendix gets one
  informational diagnostic (I.15).
- `cadl game-check` evaluates the equilibrium checks of I.8 with exact
  rational arithmetic (explicit enumeration, policy iteration), and,
  with `--certify`, the equilibrium maps of I.9 by the relaxation of
  I.9 on top of the solvers of the certified regime maps
  ([H.14](./appendix-h-stochastic.md#h14-reference-implementation-status)).
  Options: `--equilibrium ID` (repeatable), `--regime`, `--set`,
  `--certify`, `--max-depth`, `--max-cells`, `--partition N`,
  `--no-merge`, `--format text|json`. Without `--certify` the maps are
  listed as not computed; naming a map with `--equilibrium` without
  `--certify` is a usage error. The results and exit statuses are
  those of I.13; `inconclusive` does not occur, since the arithmetic is
  exact. For condition N it uses the canonical best response at the
  centre of the cell (I.9) and tries N only for a player for whom E1
  and E2 fail. Cells with the same claim are joined (I.9) unless
  `--no-merge` is given. Since the version after 0.3.23, the cells that
  N, E1 and E2 (and PD+ and PD− below) leave undecided are decided from
  their end points (I.9)
  when condition A holds, in any strategic model; the map reports
  whether A holds, for which players the gain is non-increasing (B−)
  or non-decreasing (B+) from s₀, or why the end points are not used,
  and such cells carry `method: "end points (I.9)"`. The concept
  `every_reachable_state` is implemented for checks and maps (E2, E1\*,
  N, N_s, and the end points); for N_s, R⁺_C(p) is computed per cell,
  τ is the canonical best response on Reach_p at the centre of the
  cell, and s is the first state of S that satisfies the condition.
  Since the version after 0.3.26, PD+ and PD− (I.9) are used as well.
  For a player for whom E1 (E1\* for `every_reachable_state`) and E2
  fail, the advantages are bounded on the cell as I.9 describes: the
  difference of the step payoffs and each difference of probabilities
  exactly (at the corners, or by interval enclosure when it is not
  multi-affine), the values of the successors by l_p and u_p, and m the
  middle of the hull of these bounds. PD+ is tried before N, with g⁺_p(s)
  the maximal value of the relaxed process; PD− is tried when N fails,
  with τ the canonical best response at the centre of the cell, and with
  the strategy and the states of N_s for N_s. An `equilibrium` cell
  carries `from_every_state: true` when every player satisfies E2 or
  PD+ with g⁺_p(s) ≤ 0 in every state of R_C(p) without φ_p, in any
  combination, and, for `concept: every_reachable_state` with ε = 0,
  always.
  `games_eval.USE_ADVANTAGES = False` gives the maps of 0.3.26.
  Since the version after 0.3.27, the coupled bounds of the advantages
  (I.9) are used as well, in a design whose probabilities are all
  multi-affine in the open parameters, for a player for whom E1, E2,
  PD+, N and PD− fail. When the gain of the player at the centre of
  the cell (for `every_reachable_state`, the largest gain from a state
  of Reach_p) is at most ε, PD+ is tried again, with each
  upper bound of an advantage that is positive replaced by the smaller
  of it and the coupled upper bound; otherwise PD− (and N_s) is tried
  again, with the lower bounds of the commands of τ replaced in the
  same way. The other condition cannot hold, since the coupled bounds
  hold at the centre. A coupled bound is not computed when, for every
  successor x of c and every different successor y of σ(s) in the
  relaxed process, x or y has l_p = u_p on the cell (its value does not
  depend on the valuation); the coupled bound is then not expected to be
  narrower. A condition is tried again only when some bound became
  narrower. The joint distribution of a step puts
  min(P₁(s′), P₂(s′)) on the pair (s′, s′) and matches the rest in the
  order of the updates of the two commands (the north-west corner
  rule). The values of the process on pairs are computed by backward
  induction when the pairs reachable from the first step form an
  acyclic graph and by policy iteration otherwise, and are shared by
  the advantages of a cell; the distributions at the corners are
  computed once per cell. `games_eval.USE_COUPLING = False` gives the
  maps of 0.3.27.
- `cadl model-export` writes the file of I.11 (`smg` and the `player`
  constructs, with the renaming of H.11 and of the keywords that I.11
  adds for a strategic model, and a check that two players do not
  collide). Up to 0.3.26 it did not write a player that owns no command
  of the design.
- A payoff with a `sanction_of:` or `reward_of:` term gets the weight
  of J.7, and J-14 (the end points of I.9) is used in `--certify`
  ([J.11](./appendix-j-grounding.md#j11-reference-implementation-status));
  the status `not_evaluated` of I.13 remains for a processor without
  Appendix J.
- Every number of I.12 is reproduced by `cadl game-check`: payoffs,
  best-response values, and gains as the fractions printed; λ\* and
  κ\* through the gains, and the table of λ\* by `--set`; statuses,
  deviators, and `from_every_state`. The maps of the first example
  have 3 cells per design after joining for `comply_by_lambda` (11
  cells analysed, about 0.4 s for both designs), and 105 and 13 cells
  after joining (567 and 115 analysed, about 1.5 s) for
  `comply_by_lambda_and_failure` (CENTRALIZED: 0.811768 `equilibrium`,
  0.138672 `not_equilibrium`, 203/4096 undecided). Without PD+ and PD−,
  as up to 0.3.26, they are 257 and 17 cells after joining (3 849 and 271
  analysed, about 6.3 s; CENTRALIZED: 0.808838, 0.141235, 409/8192).
  For `watched_map` a bisection gives 5 cells
  after joining (17 analysed); `--partition 4 --no-merge` gives the
  table of I.12. Times are wall-clock on a laptop.
- Verification by the implementer, with an oracle that shares no code
  with `cadl` and enumerates every memoryless deterministic strategy:
  2 500 random parametric games with 2 or 3 players, cycles, signed
  weights with parameters, parameters in probabilities (also not
  multi-affine), regions that touch probability 0 or 1, and
  ε ∈ {0, 1/4, 1}. Every decided cell (1 933 `equilibrium`,
  2 504 `not_equilibrium`) was evaluated at the corners, face centres,
  and centre and at random rational points: 69 195 point evaluations,
  no wrong claim. The checks at the fixed values agreed with the
  oracle on all 2 500 models. Five soundness errors injected into the
  code were each detected. The payoff under the profile and the
  best-response value were compared with Storm (stormpy 2.0.0, exact)
  on the game of one player against the profile, written as an MDP:
  90 values, all equal as rational numbers.
- An independent review ran 860 generated models through the command
  line (`cadl check`, `cadl game-check --certify`): 76 921 exact point
  evaluations of decided cells, no wrong claim. It compared 244
  best-response values with Storm, all equal, and found no regression
  against `cadl` 0.3.22.
- Verification of the end points without grounding, of the concept
  `every_reachable_state`, and of games with three and four players,
  by the implementer, with the oracle above (extended by the gains
  from every state of Reach_p and the check of a reported state and
  its deviation): 2 350 random games, among them 1 109 with 2, 1 009
  with 3, and 232 with 4 players, and 472 maps with three open
  parameters; 750 asked for every_reachable_state only and 850 chose
  one of the two concepts at random; 461 `not_equilibrium` cells were
  established from a state other than s₀ (N_s); the end points were
  applicable in 590 maps and were also tried directly on whole
  regions, halves, quarters, and random sub-intervals (2 629
  `equilibrium` and 1 222 `not_equilibrium` claims). 74 531 exact
  point evaluations of decided cells: no wrong claim, and the checks
  at the fixed values agreed with the oracle on every model. Each of
  five injected errors (condition A without its probability part, A
  without the affinity of the weights, B assumed for every player,
  N_s without the reachability certificate R⁺_C(p), and the conditions
  of `nash` used for `every_reachable_state`) is detected by fuzzing
  and, deterministically, by a fixed file of the test suite on which
  it makes a wrong claim: the files of the hump of J.11 without
  grounding, a gain |1 − 2ℓ|, and a state that only the player's own
  deviation reaches with probability p. Two files of the independent
  review of this version are part of the suite as well: on one, a
  sixth injected error (condition B checked from s₀ and taken for
  every state) claims a deviator where the profile is an equilibrium
  from every reachable state; on the other, N_s without R⁺_C(p) decides
  the cell that contains p = 0, which must stay undecided. The
  generators of the
  independent reviews of 0.3.23 were run again against the new code
  (through the command line: the ten generator presets of the review of
  Appendix J (600 models) and the driver of the review of the maps (160
  models), 15 467 exact point evaluations of decided cells, no wrong
  claim). The claims of `cadl game-check` on the bundled
  examples and on the files of the reviews are those of 0.3.23.
- Three open parameters, measured on the bundled examples with one
  more parameter opened (λ ∈ [0, 0.4], p_fail ∈ [0, 0.5], and
  p_loss ∈ [0, 0.5] in the first; λ, κ ∈ [0, 0.4] and
  p_fail ∈ [0, 0.5] in the second, CENTRALIZED, profile
  `comply_if_watched`), with the default budget (`--max-cells 20000`),
  processor time on a laptop. Without PD+ and PD−, as up to 0.3.26, in
  the first example DISTRIBUTED reaches the resolution 0.1 with 3 891
  cells analysed (139 after joining; 0.838 of the region
  `equilibrium`, 0.062 `not_equilibrium`) and 0.05 with 15 853 (526);
  CENTRALIZED exhausts the budget with 39 999 cells analysed and 0.269
  undecided (1 059 after joining; 0.700 `equilibrium`, 0.030
  `not_equilibrium`). Both designs take 50 s (resolution 0.1) and
  82 s (0.05). The second example exhausts the budget as well, with
  0.260 undecided after 39 999 cells (77 s). The cells next to the
  boundary must be small in all three directions, and N and E1 compare
  bounds of two different functions, which drift apart on a cell that
  is wide in a parameter on which the payoff depends strongly: in
  CENTRALIZED, cells near λ = 0 stay undecided at a width of 1/32 in
  p_fail and p_loss although R gains about 0.23 at their centres. With
  PD+ and PD− (since the version after 0.3.26), CENTRALIZED reaches the
  resolution 0.1 with 7 987 cells analysed (921 after joining; 0.849
  `equilibrium`, 0.051 `not_equilibrium`) and 0.05 with 27 031
  (3 037; 0.889 and 0.062), and DISTRIBUTED with 463 (39) and 2 271
  (154). Both designs take 18 s (resolution 0.1) and 64 s (0.05);
  `concept: every_reachable_state` gives the same cells as `nash`, with
  and without PD+ and PD−. Up to 0.3.27 the second example exhausted
  the budget, with 0.200 undecided after 39 999 cells (290 after
  joining; 0.410 `equilibrium`, 0.390 `not_equilibrium`; 92 s). There
  the advantage of `trust` for the dispatcher in the initial state is
  the difference of the values of two different successors, watched and
  not watched, and PD+ bounds it with l_p and u_p of the two states,
  which drift apart with p_fail as the bounds of E1 do: on cells of
  width 1/8 in p_fail, the upper bound of the gain of D exceeds the
  largest gain at the corners by about 0.1 to 0.4. With the coupled
  bounds of I.9 (since the version after 0.3.27), the second example
  reaches the resolution 0.1 with 13 853 cells analysed (208 after
  joining; 0.459 `equilibrium`, 0.441 `not_equilibrium`); the coupled
  bounds decide D on 3 049 of these cells (1 910 by PD+, 1 139 by PD−).
  On the cell λ ∈ [0, 0.1], κ ∈ [0.1, 0.2], p_fail ∈ [0, 1/8], the
  bounds of the advantage of `trust` are [−0.150, 0.203] from l_p and
  u_p and [−0.080, 0.122] from the coupled relaxation, and the exact
  advantage at 125 points of a grid on the cell lies in
  [−0.059, 0.112]. Measured together on one machine, the map took 52 s
  with the coupled bounds and 127 s without them (as in 0.3.27). The
  coupled bounds do not change the maps of the first example (the same
  cells at both resolutions, about 2 % more time for 0.1 and 9 % for
  0.05), whose advantages of R compare a state whose value does not
  depend on the valuation with one that does, nor the maps of I.12. A
  coupled relaxation tried for 0.3.27, which met the two plays only in
  equal states and was used on every cell that the other conditions
  left open, left 0.129 undecided after 39 999 cells and took about four
  times as long; the joint distribution that keeps the plays in step,
  and the restrictions above on where coupled bounds are computed,
  make the difference. The coupled
  relaxation still lets every step choose its corner, so cells on which
  an advantage changes sign must be small; and it does not apply to
  probabilities that are not multi-affine, where bounds of differences
  of values remain an open item. In the
  fuzzing above, the games with three or four players, most of them
  with three open parameters, took about 0.9 s each (wall-clock, check,
  map with a budget of 24 cells, and oracle).
- Verification of PD+ and PD− (version after 0.3.26), by the
  implementer, with the oracle above: 5 200 random games of
  `tests/games_fuzz.py` (2 600 of the kind of the first verification,
  800 that ask for `every_reachable_state`, 900 with three or four
  players, two thirds of them with three open parameters, 700 games of
  the end points without grounding, and 200 with grounding), 3 486
  `equilibrium` and 4 693 `not_equilibrium` cells, 167 069 exact point
  evaluations, no wrong claim, and the checks at the fixed values agreed
  with the oracle on every model. The drivers of the independent
  reviews, through the command line: the driver of the review of the
  maps (860 models, 16 042 evaluations), the ten generator presets of
  the review of Appendix J (600 models, 5 868 evaluations), and the
  eight presets of the review of 0.3.24 (560 models, 7 149
  evaluations): no wrong claim. Three injected errors of the new
  conditions (the term of the successors left out, the lower and the
  upper bounds of the advantages exchanged, the differences of payoffs
  and probabilities taken at the centre of the cell only) are each
  detected by fuzzing and by the test suite; the earlier injected errors
  are run with PD+ and PD− switched off and are still detected.
- Verification of the coupled bounds (version after 0.3.27), by the
  implementer, with the oracle above: 5 200 random games of
  `tests/games_fuzz.py` of the same kinds as for PD+ and PD−, 3 455
  `equilibrium` and 4 913 `not_equilibrium` cells, 170 529 exact point
  evaluations, no wrong claim; in 1 188 cases a player was decided by
  PD+ or PD− with the coupled bounds. In the multi-affine games, every
  coupled bound on the whole region and on two random sub-boxes was
  also compared directly with the advantage that the oracle computes at
  sample points: 251 933 comparisons, none outside the bounds. The
  drivers of the earlier independent reviews were not available; a
  driver through the command line (`cadl game-check --certify --format
  json` on 860 generated games of four kinds, the decided cells checked
  with the oracle) made 25 530 exact point evaluations without a wrong
  claim. Three injected errors of the coupled bounds (the largest and
  the least value exchanged, the difference of the step payoffs of the
  first step left out, the step payoffs after the first step left out)
  are each detected by the claims of the maps in fuzzing, by the direct
  comparison, and on cells of the second example in
  `tests/test_games_coupling.py`.
- Since the version after 0.3.26, the export of I.11 is run through
  PRISM-games 3.2.4, the binary release of the PRISM-games project
  (prismmodelchecker.org/games, for macOS arm64 and Linux x86-64). The
  exported model file is passed unchanged, followed by a module that
  synchronises on the action labels of the players and lets every
  player but one take only the command of the profile, and by a reward
  structure per player. Since PRISM-games rejects negative rewards and
  has no exact engine for games, V_p is computed term by term from the
  exported reward structures, with `<<p>> R{"r"}max=? [ F φ_p ]` while
  every player follows the profile, and V\*_p from the structure
  ρ_p(s, c) + h(s) − Σ_s′ P(s, c, s′) · h(s′), which is not negative
  for h(s) a multiple of the largest expected number of steps from s
  until φ_p, and whose maximum from s is V\*_p(s) + h(s), since the added
  terms telescope along every play. The values come from value
  iteration (`-e 1e-12`) and are compared with a relative tolerance of
  10⁻⁶. On the three bundled examples and 200 games of
  `tests/games_fuzz.py` (two to four players, both concepts, the games
  of the end points), in 212 pairs of a design and a profile, the
  number of states, 2 240 payoffs and best-response values, V_p and
  V\*_p − V_p in 7 813 states of Reach_p, 212 statuses with their
  deviators (in 118 of them a gain equals ε, which the exact gain of
  `cadl` is there), and 69 values of `from_every_state` agreed with
  `cadl game-check`; so did 200 other games run earlier. One export
  error was found and corrected (I.11): a player that owns no command
  of the design was not written, so a design without owned commands
  gave an `smg` file without players, which PRISM-games rejects. A
  player named like a variable, a label, an action label, a parameter,
  a reward structure, or the module `main` is accepted.
  `tests/test_games_prism_games.py` runs the comparison when
  PRISM-games is installed, and the CI installs the Linux release for
  one Python version (12 tests; about 7 minutes in an emulated Linux
  x86-64 container on a laptop).

## I.15 Backward compatibility

Files written against CADL v0.3 without this extension remain valid
and are read the same way. A file that declares `stochastic: 0.1` and
not `games: 0.1` is read by Appendix H unchanged: the names that H.1
reserves stay reserved for it, and S-1, S-9, and S-15 apply.

A file that uses `kind: smg` or the keys of this appendix without
declaring `games: 0.1` does not conform to this appendix. A processor
that implements the extension reads the `model:` block of such a file
by Appendix H and SHOULD report the keys as an undeclared extension,
with an informational diagnostic.
A file that declares `games: 0.1` without `stochastic: 0.1` gets the
error of I-1.

A processor that implements Appendix H and not this appendix cannot
read a strategic model as a Markov chain.
[H.10 (S-1) and H.15](./appendix-h-stochastic.md) say what it does
with a file that declares `games: 0.1` and has a model whose `kind:`
is not `dtmc`: it skips the model with one informational diagnostic
and MUST NOT evaluate it as a Markov chain; the block is not checked
by S-2 to S-15, not lowered to the IR, and not exported. Processors
that implement neither extension MUST NOT reject a file because of
`model:`; they SHOULD emit a single informational diagnostic per file.
