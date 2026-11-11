---
sidebar_position: 20
title: "Appendix J: Grounding of the Institutional Parameters"
description: "Grounding extension (grounding 0.1): indices of information sharing, decision centralisation, and incentive coverage derived from the norms of a contract, rules that relate them to the declared alpha, beta, and lambda, numeric magnitudes of sanctions and rewards, and the link from a sanction to a payoff term of a strategic model."
---

# Appendix J — Grounding of the Institutional Parameters in Norms (grounding 0.1)

This appendix specifies the **grounding extension** to CADL. It builds
on the norms extension ([Appendix F](./appendix-f-norms.md)) and adds
the key `grounding:` to `contract_def`
([A.4](./appendix-a-syntax.md#a4-contracts-institution-layer)), the
keys `shares:` and `on_fulfilment:` to `norm_def` and the key
`magnitude:` to `on_violation:` (F.3), and, in a file that also uses
the strategic model extension
([Appendix I](./appendix-i-games.md)), the keys `sanction_of:` and
`reward_of:` to a payoff term (I.2). With them, a processor computes
from the norms of a contract three **derived indices** α̂, β̂, and λ̂ in
`[0, 1]`, compares them with the declared `alpha`, `beta`, and
`lambda`, and checks that the payoff term which stands for the
sanction of a norm in a strategic model has the size the norm
declares, multiplied by λ.

The core language does **not** mandate these keys; a conforming CADL
processor that does not implement the extension MUST NOT reject a file
because of them. It SHOULD accept them syntactically and emit an
*informational* diagnostic.

The extension is named `grounding` and this appendix describes version
`0.1`. It **requires** `norms: 0.1`. A file that uses it MUST declare
both under `extensions:`
([A.2](./appendix-a-syntax.md#a2-top-level-structure)); J.12 says what
a processor does with an undeclared use. The keys `sanction_of:` and
`reward_of:` additionally require `stochastic: 0.1` and `games: 0.1`.

```yaml
sos:
  ...
  extensions:
    - norms: 0.1
    - grounding: 0.1
```

## J.1 Motivation and scope

[Section 5.4.2](./05-language-spec.md) defines the institutional
parameters α, β, and λ as numbers in `[0, 1]` with qualitative end
points, and nothing else in the language says what an intermediate
value means. A designer writes `beta: 0.7`, and no rule relates that
number to the contract in which it stands. Appendix F states an
intended reading (β describes who holds the powers of a contract, α
which triggers and contents the other parties can observe, and λ
scales the sanctions of violated norms) and leaves it informative;
[Section 9.6](./09-research.md) lists the formal link between norms
and the parameters as open, and RD-1.5 asks for λ to be treated as a
parameter of the contracts. The classification of institutional rules
by what they affect, among them information rules, aggregation rules,
and payoff rules [[Ostrom, 2005]](./appendix-b-references.md), suggests
that the three parameters summarise three kinds of norms. Grounding
0.1 is a first step:

- **Indices are computed from the file.** J.4 defines α̂, β̂, and λ̂ as
  ratios of counts over finite sets that are read from one contract.
  They are reproducible, and they move in the expected direction when
  a norm is added (the lemmas of J.4).
- **Indices are evidence, not meaning.** The indices do not replace
  the declared parameters and do not change Section 5.4.2. They are
  structural facts about the norms of a contract with which a declared
  value can agree or disagree. J.4 says what they cannot capture.
- **Declared values are checked against them.** A declared end point
  that a norm of the same contract contradicts is an error; other
  disagreements are warnings (J.5).
- **Sanctions get a size, and the model uses it.** `magnitude:` gives
  the sanction or the reward of a norm a number. In a strategic model,
  a payoff term declared with `sanction_of:` has the weight
  −magnitude·λ, where λ is the parameter bound to the `lambda` of the
  contract (J.7). This is where λ enters the equilibrium question of
  Appendix I.

**Scope of version 0.1.**

- An index concerns one contract. Indices are not aggregated over the
  contracts of an SoS.
- Information items are declared by the author (`grounding.items`);
  they are not derived from actor interfaces, predicates, or messages.
- The indices are counts. They are not weighted by magnitudes, by
  severities, or by the number of norms a power affects.
- `magnitude:` has no effect on the dynamic semantics of Appendix F:
  verdicts, violations, and reparations are unchanged.
- The extension does not derive a model from norms and does not check
  that a reward structure of a model counts the violations of a norm
  (H.8 defines no translation between a norm and a model).
- No index is defined for the delegations of
  [Appendix G](./appendix-g-agents.md) or for the motivation
  parameters ρ and κ of [Appendix C](./appendix-c-motivation.md).

## J.2 Concepts

| Concept | Meaning in grounding 0.1 |
| --- | --- |
| **Actor name** | The identifier of an actor reference, without its index: `ROBOT` for `ROBOT[i]`, `"ROBOT[*]"`, and `ROBOT[2]`. |
| **Party name** | The actor name of an entry of `parties:` of the contract. |
| **Information item** | A named piece of information declared in `grounding.items`, with its **origin**, the party from which it stems. |
| **Sharing norm** | An obligation or a permission whose content is a message and which has `shares:`; its message gives the listed items to the receiver. |
| **Backed norm** | An obligation or a prohibition that carries a consequence: a sanction, a reparation, or a reward (J.4). |
| **Magnitude** | A number that is not negative: the size of a sanction or of a reward at full incentive intensity (λ = 1), in the unit of account of the contract. |
| **Derived index** | One of α̂, β̂, λ̂: a rational number in `[0, 1]` computed from one contract, or undefined. |

Norm, obligation, permission, prohibition, power, and bearer have the
meaning of [Appendix F](./appendix-f-norms.md).

## J.3 Syntax (EBNF additions to A.4, F.3, and I.2)

The grammar uses the notation of
[Appendix A](./appendix-a-syntax.md), which defines `identifier`,
`actor_ref`, `number`, and `text`.

```ebnf
contract_def    = ... , [ "grounding:" , grounding_block ] ;
grounding_block = [ "items:"     , { identifier , ":" , actor_ref } ] ,
                  [ "tolerance:" , number ] ;

norm_def        = ... ,
                  [ "shares:"        , { "-" , identifier } ] ,
                  [ "on_fulfilment:" , norm_fulfilment ] ;
norm_violation  = ... , [ "magnitude:" , number ] ;
norm_fulfilment = [ "reward:"    , text ] ,
                  [ "magnitude:" , number ] ;

payoff_term     = "reward:" , identifier ,
                  ( [ "weight:" , param_expr ]                  (* I.2 *)
                  | "sanction_of:" , norm_ref
                  | "reward_of:"   , norm_ref ) ;
norm_ref        = identifier , "." , identifier ;               (* string *)
```

- `grounding.items` maps the name of each information item to its
  origin. `tolerance:` is a number in `[0, 1]`, by default `0.25`
  (J.5).
- `shares:` lists the information items that the message of a sharing
  norm conveys.
- `on_violation.magnitude` is the size of the sanction of the norm.
  `on_fulfilment:` records a reward for fulfilling the norm:
  `reward:` describes it in text, as `sanction:` describes a sanction,
  and `magnitude:` is its size. `on_fulfilment:` has no effect on the
  semantics of Appendix F.
- A `norm_ref` is a quoted string `"C.n"`: the `id` of a contract, a
  dot, and the `id` of a norm of that contract.

An unquoted item name that a YAML 1.1 loader reads as a boolean or
null MUST be quoted
([A.12](./appendix-a-syntax.md#a12-reference-implementation-status-v03)).

## J.4 The derived indices

The indices are defined for one contract C of a file that declares the
extension. Each is a ratio of two counts, or **undefined** when its
denominator is zero or a precondition stated below fails. An undefined
index takes part in no rule of J.5.

### Information sharing: α̂

Let Π be the set of party names of C, X the set of items of
`grounding.items`, and o(x) the origin of an item x (a party name,
J-2). The **pairs** of C are the pairs (x, q) of an item x and a party
name q other than o(x): the places where an item can be shared. A pair
(x, q) is **given** when at least one of the following is in C:

- an entry `"S -> T : x"` of `information.sharing` whose item is x and
  whose target T has the actor name q;
- a sharing norm whose `shares:` lists x and whose content is a
  message `S -> T : m` in which T has the actor name q.

```text
α̂  =  (number of given pairs) / (number of pairs)
```

α̂ is undefined when there is no pair (no item, or a single party).
α̂ = 0 exactly when nothing is given to a party other than its origin,
which is the end point "no sharing" of 5.4.2; α̂ = 1 exactly when every
party is given every item of the others, the end point "complete
sharing". An obligation and a permission count alike: the index
records that a norm makes or lets a party have an item, not that the
party has it. A processor reports the given pairs with the entry or
norm that gives each.

### Decision centralisation: β̂

The **decision points** of C are its powers (F.2). A power is the only
construct of a contract whose exercise changes the state of other
norms with a defined effect (F.5); `authority.decision_scope` is text
and is not counted. Let h be `authority.decision_holder`. A power is
**held centrally** when its `bearer:` is the same actor reference as
h: the same actor name and the same index (no index, or the same
integer). h **names one actor** when it has an integer index, or has
no index and the actor is declared without a range.

```text
β̂  =  (number of powers held centrally) / (number of powers)
```

β̂ is undefined when C has no power, when C has no `decision_holder`,
or when h does not name one actor (as `"ROBOT[*]"`). β̂ = 1 exactly when the decision holder
holds every power, the end point "single actor decides all" of
5.4.2; β̂ = 0 exactly when it holds none, so that every decision point
lies with other parties. A power whose bearer is `ROBOT[i]` is held by
each robot for itself and is not held centrally, whoever h is.

### Incentive coverage: λ̂

Let N be the set of obligations and prohibitions of C. A norm of N is
**backed** when at least one of the following holds:

- it has `on_violation.reparation`;
- it has `on_violation.magnitude` greater than zero, or it has
  `on_violation.sanction` and no `on_violation.magnitude`;
- it has `on_fulfilment.magnitude` greater than zero, or it has
  `on_fulfilment.reward` and no `on_fulfilment.magnitude`.

```text
λ̂  =  (number of backed norms) / (number of norms in N)
```

λ̂ is undefined when N is empty. λ̂ = 0 exactly when no obligation or
prohibition carries a consequence, the end point "directive-based" of
5.4.2; λ̂ = 1 exactly when each of them does. A `magnitude:` of zero
says that the consequence has no size, so the norm is not backed by
it. `severity:` and `on_violation.transition` do not make a norm
backed: they classify the violation and move the contract instance,
and neither falls on the bearer.

### Monotonicity

The indices are invariant under renaming and reordering, and they
move as follows. In each lemma everything not mentioned stays the
same, and the index is defined before and after.

- **Lemma 1 (α̂).** Adding an entry to `information.sharing`, adding
  an item to the `shares:` of a sharing norm, or adding a sharing norm
  never lowers α̂. *Proof.* The set of pairs is unchanged, and every
  pair that was given is still given.
- **Lemma 2 (β̂).** Adding a power whose bearer is the decision holder
  never lowers β̂, and adding a power with another bearer never raises
  it. *Proof.* With k of n powers held centrally, k ≤ n, so
  k/n ≤ (k + 1)/(n + 1) and k/(n + 1) ≤ k/n.
- **Lemma 3 (λ̂).** Giving a consequence to an obligation or a
  prohibition that had none raises λ̂ by 1/|N|; adding a backed norm
  never lowers λ̂, and adding a norm that is not backed never raises
  it. *Proof.* As for Lemma 2, with the backed norms among the norms
  of N.

### What the indices do not capture

- α̂ counts entitlements and duties to share, not what a party
  observes in operation, and not the quality or the delay of the
  information. Sharing among the members of one actor set (robot to
  robot) is not a pair. The items are those the author lists.
- β̂ counts powers. Decisions that are not institutional acts, such as
  who plans a route, are not norms and are not counted; all powers
  weigh the same, whatever their effects.
- λ̂ says how many norms carry a consequence, not how large the
  consequences are or how likely they are to be applied. It is a
  measure of coverage. The size of the incentive is what `magnitude:`
  and λ express together (J.7). Section 5.4.2 describes λ by the kind
  of governance at its end points, and Appendix F reads it as a scale
  of sanctions; λ̂ grounds the first reading, and J.7 uses the second.
- No index says anything about behaviour. Whether more sharing or a
  stronger incentive improves a property is a question for the models
  of Appendices H and I.

## J.5 Relation to the declared parameters

For a contract that declares `alpha`, `beta`, or `lambda`, a processor
computes the corresponding index and reports both and their
difference (J-5). The rules distinguish three kinds of disagreement.

**A declared end point contradicted by a norm: error.** The end points
of 5.4.2 are universal statements ("no sharing", "single actor
decides all"). When a construct of the same contract is a
counterexample to the statement, the contract contradicts itself, and
the processor can name the construct. These cases are errors (J-6):

| Declared | Contradicted by |
| --- | --- |
| `alpha: 0` | a given pair: an entry or a sharing norm gives an item to a party other than its origin |
| `beta: 1` | a power whose bearer is not the decision holder |
| `beta: 0` | a power whose bearer is the decision holder |

**A declared end point without support: warning.** `alpha: 1` while a
pair is not given is not a contradiction: that no norm gives an item
to a party does not show that the party lacks it. A processor SHOULD
warn and list the pairs that are not given (J-7).

**An intermediate value far from the index: warning.** For α and β, a
processor SHOULD warn when the declared value and the index differ by
more than the tolerance of the contract (J-7). The default tolerance
is 0.25: the indices are coarse, and a contract with few norms has
few possible index values (with two powers, β̂ is 0, 1/2, or 1). An
author who accepts a larger difference states it with
`grounding.tolerance`.

**λ is not compared by tolerance.** λ̂ measures coverage, and the
declared λ is used in J.7 as the scale of the sanctions. A contract
in which every norm is sanctioned mildly has λ̂ = 1 and a small λ, and
is consistent. A processor reports λ, λ̂, and their difference, and
SHOULD warn in two cases only (J-8): `lambda` is greater than zero
while λ̂ = 0, so that λ has nothing to scale in the norms of the
contract; and `lambda: 0` while a norm of the contract has a
magnitude greater than zero, so that the declared sizes have no
effect.

**Versions of a contract.** A processor that compares two versions of
a contract (F.6) SHOULD warn when a declared value and its index move
in opposite directions (J-13): for example, `beta` is raised while an
amendment gives a power to a robot.

## J.6 The parameters in the models of Appendices H and I

**Today.** A parameter of a model is bound to a declared value by
`from: "C.alpha"`, `"C.beta"`, or `"C.lambda"` (H.3), so that contract
and model use the same number. What the number does in the model is
written by the author: in [H.12](./appendix-h-stochastic.md), β is the
probability that a decision is taken centrally and α multiplies the
quality of the central plan. Neither appendix derives these
expressions from the contract, and this appendix does not either.

**What this appendix adds for α and β.** The norms of a contract
describe the design in which the bound parameter has its declared
value. A regime that assigns another value describes an operating mode
(H.6) for which the file has no norms of its own. A processor
therefore compares the fixed value of a parameter bound to `C.alpha`
or `C.beta` with the index of C in every design, and SHOULD emit an
informational diagnostic, not a warning, for a design in which they
differ by more than the tolerance (J-9). In H.12 this would tell the
reader that the norms of the contract, if they gave every power to the
dispatcher, describe the regime CENTRALIZED and not DISTRIBUTED.

**What stays open.** A regime has no norms of its own, so the values
that regimes assign to α and β cannot be checked against indices, and
the ordering of regimes by β cannot be compared with an ordering of
their norms. Deriving a probability of the model from a sharing norm
or from a power, and α as what a player observes in a game (RD-7.3),
are not defined.

## J.7 λ: from the sanction of a norm to a payoff term

In a strategic model ([Appendix I](./appendix-i-games.md)), a payoff
term may name the norm whose sanction or reward it represents instead
of giving a weight:

```yaml
- { reward: shortcuts, sanction_of: "DELIVERY.no_shortcut" }
```

Let n be the norm `C.n` that the term names, and let ℓ be the
parameter of the model that is bound by `from: "C.lambda"` (there MUST
be exactly one, J-10). The term has no `weight:`; its weight is
defined as

| Term | Weight |
| --- | --- |
| `sanction_of: "C.n"` | −m · ℓ, with m the `on_violation.magnitude` of n |
| `reward_of: "C.n"` | m′ · ℓ, with m′ the `on_fulfilment.magnitude` of n |

The term is otherwise a term of I.6, and Appendix I applies to it
unchanged. The reward structure of the term is the author's statement
of how often the sanction is applied, or the reward paid, in the
model: its accumulated reward counts the violations, or the
fulfilments, of the norm.

**What a processor checks (J-10 to J-12).** The norm exists, is an
obligation or a prohibition, and declares the magnitude; the player
of the payoff stands for the bearer of the norm; a norm is represented
at most once; every norm of C with a magnitude whose bearer is a
player of the model is represented, once the model represents any; and
the compliance profile incurs no sanction. The size and the factor λ
are then correct by construction, since the file states the magnitude
once. **What it cannot check:** that the reward structure counts the
violations of the norm. Appendix F judges a norm on a timed trace and
Appendix H evaluates a model in steps, and no translation between the
two is defined.

**The shape of the answer.** Let σ be a profile, D a design, and
suppose that (i) ℓ occurs in no probability, in no reward value, and
in no weight of the model other than those of `sanction_of:` terms,
and (ii) under σ the reward structure of every `sanction_of:` term of
a player p has the expected accumulated value 0. Then, with all other
parameters fixed:

> **Proposition.** gain_p is a non-increasing, convex, piecewise
> linear function of ℓ. If (i) and (ii) hold for every player, then on
> every interval of values of ℓ on which D is well-defined, the set of
> values at which σ is an ε-equilibrium of D is empty or consists of
> the values ℓ ≥ λ\* of the interval, for a threshold λ\*.

*Proof.* By (i), the probabilities and therefore every expected
accumulated reward do not depend on ℓ. For a strategy τ of p, the
payoff of p under σ[p↦τ] is A(τ) − ℓ·B(τ), where B(τ) is the sum,
over the `sanction_of:` terms of p, of the magnitude times the
expected accumulated reward, which is not negative, and A(τ) collects
the other terms. By (ii), the payoff under σ is the constant A(σ). So
gain_p = max over τ of (A(τ) − ℓ·B(τ)) − A(σ), a maximum of finitely
many non-increasing affine functions (I.7), which is continuous. The
set where every gain is at most ε is therefore closed and contains,
with a value, every greater one. Whether D is stopping does not depend
on ℓ. ∎

The proposition gives a sound method for a cell of an equilibrium map
(I.9) whose only open parameter is ℓ, when (i) and (ii) have been
established: the profile is an equilibrium on the cell `[a, b]` when
it is one at a, and a player is a deviator on the cell when its gain
exceeds ε at b. An exact evaluation at one end then certifies the
whole cell, because the monotonicity is proved and not sampled (H.9).
The proposition does not hold in general for `reward_of:` terms, whose
value under σ grows with ℓ.

**The example.** The model of [I.12](./appendix-i-games.md) is linked
to a norm by declaring the two extensions, adding the norm to the
contract, and replacing the weight of the third term of R:

```yaml
sos:
  name: "RobotDeliveryGame"
  extensions:
    - stochastic: 0.1
    - games: 0.1
    - norms: 0.1
    - grounding: 0.1
  # actors, transitions as in I.12

  contracts:
    - id: DELIVERY
      parties: [DISPATCHER, "ROBOT[*]"]
      information: { alpha: 0.9 }
      authority:   { decision_holder: DISPATCHER, beta: 0.9 }
      incentives:  { lambda: 0.1 }
      norms:
        - id: no_shortcut
          kind: prohibition
          bearer: "ROBOT[i]"
          counterparty: DISPATCHER
          content: "ROBOT[i].handling == Careless"
          on_violation:
            severity: Major
            sanction: "deduction from the delivery fee"
            magnitude: 2

  model:
    # as in I.12, except the payoff of R:
    payoffs:
      - player: R
        until: "settled"
        terms:
          - { reward: fee,       weight: 10 }
          - { reward: effort,    weight: -1 }
          - { reward: shortcuts, sanction_of: "DELIVERY.no_shortcut" }
      - player: D
        until: "settled"
        terms:
          - { reward: fee, weight: 5 }
```

The weight of the third term is −2·`lambda`, the weight written by
hand in I.12, so every number of I.12 is unchanged. The bearer
`ROBOT[i]` has the actor name of `"ROBOT[*]"`, for which R stands. In
this model each attempt is made under a contract instance of its own,
so the prohibition can be violated once per attempt (F.5 judges a norm
once per contract instance), and `shortcuts` counts the careless
attempts. Conditions (i) and (ii) hold: `lambda` occurs only in the
weight of the term, and `comply` takes no careless attempt. With g the
fee, c the cost of effort, s the probability that a careful attempt
succeeds, and m the magnitude of `no_shortcut`, I.12 derives, for
s·g ≥ c:

> In each design, the compliance profile is a Nash equilibrium exactly
> when λ ≥ λ\*, where
> λ\* = max(0, (c − (s/2)·(g·(1 − s)² + c·(2 − s))) / m).

With g = 10, c = 1, and m = 2, λ\* is 0.150108 in CENTRALIZED and
0.060373 in DISTRIBUTED at the fixed values. The declared λ = 0.1
makes compliance an equilibrium in DISTRIBUTED only. The threshold is
inversely proportional to the magnitude: at λ = 0.1, the magnitude
would have to be at least 3.002169 for compliance to be an equilibrium
in CENTRALIZED as well, and 1.207466 suffices in DISTRIBUTED. For this
contract λ̂ = 1/1 = 1 (its one prohibition is backed), and α̂ and β̂ are
undefined (no items, no power): the coverage is complete, and the
question that remains is the one the model answers, whether the size
m·λ is enough.

## J.8 Static semantics {/* #j8-static-semantics */}

A processor that implements the extension MUST, in a file that
declares `grounding: 0.1`, in addition to existing checks:

- **J-1.** A file that declares `grounding: 0.1` MUST also declare
  `norms: 0.1`; otherwise the processor reports an error and does not
  interpret the keys of this extension.
- **J-2.** Every key of `grounding.items` MUST be an identifier and
  MUST NOT be a reserved word of
  [A.11](./appendix-a-syntax.md#a11-reserved-keywords); its value MUST
  be an actor reference whose actor name is a party name of the
  contract. `tolerance:` MUST be a number in `[0, 1]`.
- **J-3.** `shares:` is allowed only for an obligation or a permission
  whose `content:` is a `message_event`. It MUST list at least one
  item, each declared in `grounding.items` of the same contract and
  each once. A processor SHOULD warn when the receiver of the message
  has the actor name of the origin of a listed item, and when an entry
  of `information.sharing` names an item that `grounding.items` does
  not declare while the contract declares items.
- **J-4.** `on_violation.magnitude` and `on_fulfilment.magnitude` MUST
  be finite numbers that are not negative. `on_fulfilment:` is allowed
  only for an obligation or a prohibition (as `on_violation:`, N-4)
  and MUST have at least one of `reward:` and `magnitude:`.
- **J-5.** For every contract that has `norms:`, a processor that
  reports MUST compute α̂, β̂, and λ̂ by the definitions of J.4, exactly,
  and report each index with its two counts, or as undefined with the
  reason. For each of `alpha`, `beta`, and `lambda` that the contract
  declares and whose index is defined, it MUST report the declared
  value, the index, and their difference. The comparisons of J-6 to
  J-9 and J-13 are exact; a declared value is the decimal that is
  written (H.2).
- **J-6.** It is an error when a contract declares `alpha: 0` and has
  a given pair; `beta: 1` and β̂ is defined and less than 1; or
  `beta: 0` and β̂ is defined and greater than 0. The diagnostic MUST
  name an entry or a norm that contradicts the declared value.
- **J-7.** A processor SHOULD warn when a contract declares `alpha: 1`
  and α̂ is defined and less than 1, and when the declared `alpha` or
  `beta` and the defined index differ by more than the tolerance of
  the contract and J-6 reports no error for that parameter.
- **J-8.** A processor SHOULD warn when a contract declares a `lambda`
  greater than zero and λ̂ is defined and equal to 0, and when it
  declares `lambda: 0` and a norm of the contract has an
  `on_violation.magnitude` or an `on_fulfilment.magnitude` greater
  than zero.
- **J-9.** In a file that also declares `stochastic: 0.1`, for every
  design and every parameter bound to `C.alpha` or `C.beta` whose
  index is defined, a processor SHOULD emit an informational
  diagnostic when the fixed value of the parameter under the design
  differs from the index by more than the tolerance of C.
- **J-10.** `sanction_of:` and `reward_of:` are allowed only in a file
  that also declares `stochastic: 0.1` and `games: 0.1`. A term MUST
  have at most one of `weight:`, `sanction_of:`, and `reward_of:`. The
  value MUST be a string `C.n` in which `C` is a declared contract and
  `n` an obligation or a prohibition of `C` that has an
  `on_violation.magnitude` (for `sanction_of:`) or an
  `on_fulfilment.magnitude` (for `reward_of:`) greater than zero. The
  model MUST have exactly one parameter bound by `from: "C.lambda"`.
  The player of the payoff MUST list, in `actors:`, a reference with
  the actor name of the bearer of `n`. In one model, a norm MUST NOT
  be named by more than one `sanction_of:` and by more than one
  `reward_of:`.
- **J-11.** When a model has a term that names a norm of a contract
  `C`, a processor SHOULD warn about every obligation or prohibition
  of `C` that has a magnitude greater than zero, whose bearer has the
  actor name of an actor of some player, and that no term names with
  the corresponding key. It SHOULD also warn about a term with a
  `weight:` in which a parameter bound to `C.lambda` occurs: the size
  of such a term is not checked against a norm.
- **J-12.** For every `sanction_of:` term and every design, a
  processor that evaluates models SHOULD report the expected
  accumulated value, until the target of the payoff, of the reward
  structure of the term under the compliance profile at the fixed
  values, and SHOULD warn when it is greater than zero: the profile
  declared as compliance then incurs the sanction.
- **J-13.** A processor that compares two versions of a contract
  SHOULD warn when, for α or for β, the declared value and the index
  are defined in both versions and (x′ − x)·(x̂′ − x̂) is less than
  zero, where x and x̂ are the declared value and the index of the old
  version and x′ and x̂′ those of the new one.

Rule A.4 that `alpha`, `beta`, and `lambda` lie in `[0, 1]` is
unchanged, and so are the rules N-1 to N-12 and I-1 to I-11.

## J.9 Example

The contract below is that of
[F.8](./appendix-f-norms.md) with the three parameter blocks, a
`grounding:` block, two `shares:` annotations, a magnitude, and one
more power, `decline`, by which a robot refuses an assignment. The
keys that F.8 already has are abridged.

```yaml
sos:
  name: "RobotDeliveryNorms"
  extensions:
    - sos-dsl: 0.1
    - norms: 0.1
    - grounding: 0.1
  # actors DISPATCHER, ROBOT[1..N], CUSTOMER[1..M] as in F.8

  contracts:
    - id: DELIVERY_SLA
      parties: [DISPATCHER, "ROBOT[*]", "CUSTOMER[*]"]
      authority:   { decision_holder: DISPATCHER, beta: 0.9 }
      information:
        alpha: 0.6
        sharing:
          - "DISPATCHER -> ROBOT[*] : route"
          - "ROBOT[*] -> DISPATCHER : status"
          - "DISPATCHER -> CUSTOMER[*] : status"
      incentives:  { lambda: 0.5 }
      grounding:
        items:
          route:   DISPATCHER
          status:  "ROBOT[*]"
          battery: "ROBOT[*]"
          failure: "ROBOT[*]"
      # assume, guarantee, lifecycle, counts_as as in F.8

      norms:
        - id: acknowledge              # obligation of ROBOT[i], as in F.8
          on_violation: { severity: Major, reparation: report_failure }
        - id: report_failure           # obligation of ROBOT[i], as in F.8
          content: "ROBOT[i] -> DISPATCHER : failure_report"
          shares: [failure]
          on_violation: { severity: Critical, transition: Violated }
        - id: no_low_battery_driving   # prohibition of ROBOT[i], as in F.8
          on_violation:
            severity: Critical
            sanction: "removed from the dispatch pool for one period"
            magnitude: 4
        - id: may_return_to_charge     # permission of ROBOT[i], as in F.8
          content: "ROBOT[i] -> DISPATCHER : charging_request"
          shares: [battery]
        - id: reassign                 # power of DISPATCHER, as in F.8
        - id: decline
          kind: power
          bearer: "ROBOT[i]"
          content: "ROBOT[i] -> DISPATCHER : decline"
          effects:
            discharge: [acknowledge]
```

**α̂.** The party names are DISPATCHER, ROBOT, and CUSTOMER, and there
are four items, each with two parties other than its origin: eight
pairs.

| Item (origin) | DISPATCHER | ROBOT | CUSTOMER |
| --- | --- | --- | --- |
| `route` (DISPATCHER) | origin | given: `sharing` | not given |
| `status` (ROBOT) | given: `sharing` | origin | given: `sharing` |
| `battery` (ROBOT) | given: `may_return_to_charge` | origin | not given |
| `failure` (ROBOT) | given: `report_failure` | origin | not given |

Five pairs are given: α̂ = 5/8 = 0.625. The declared `alpha: 0.6`
differs by 0.025, within the tolerance.

**β̂.** The contract has two powers. `reassign` is held by DISPATCHER,
the decision holder; `decline` is held by `ROBOT[i]`. β̂ = 1/2 = 0.5.
The declared `beta: 0.9` differs by 0.4, more than the tolerance of
0.25, and the processor warns (J-7): the contract declares a nearly
centralised authority while half of its decision points lie with the
robots. With `beta: 1` the file would be in error (J-6), and the
diagnostic would name `decline`.

**λ̂.** The contract has three obligations and prohibitions.
`acknowledge` is backed by its reparation, and
`no_low_battery_driving` by a sanction of magnitude 4. `report_failure`
has only a severity and a lifecycle transition and is not backed.
λ̂ = 2/3 = 0.666667. The declared `lambda: 0.5` is greater than zero
and λ̂ is not zero, so J-8 gives no warning; the difference, 0.166667,
is reported.

By Lemma 2, an amendment that removes `decline` raises β̂ to 1, and by
Lemma 3 one that gives `report_failure` a sanction raises λ̂ to 1.

## J.10 Intermediate Representation (IR) addition

Each contract under `institution.contracts` gains the field
`grounding`, and each norm of F.9 four fields. For the example of J.9:

```jsonc
{
  "grounding": {
    "items": { "route": "DISPATCHER", "status": "ROBOT[*]", "battery": "ROBOT[*]", "failure": "ROBOT[*]" },
    "tolerance": 0.25,
    "indices": {
      "alpha":  { "given": 5,  "pairs": 8 },
      "beta":   { "central": 1, "powers": 2 },
      "lambda": { "backed": 2, "norms": 3 }
    }
  },
  "norms": [
    { "id": "no_low_battery_driving",
      // ... the fields of F.9
      "shares": [],
      "on_violation_magnitude": 4,
      "on_fulfilment_reward": null,
      "on_fulfilment_magnitude": null }
  ]
}
```

`grounding` is `null` when the extension is not declared. `items` is
an empty mapping and `tolerance` the default when the contract has no
`grounding:` block. An index is `null` when it is undefined; otherwise
it is given by its two counts, numerator first, so that the exact
ratio can be formed. The four norm fields are written only when the
extension is declared; magnitudes are `null` when absent.

A payoff term of the IR of
[I.13](./appendix-i-games.md) gains the fields `sanction_of` and
`reward_of` (a string `C.n`, or `null`), written only when the
extension is declared. For a term with one of them, `weight` is the
defined weight as text: `-m * p` or `m * p`, with m the magnitude as
the shortest decimal that round-trips and p the `id` of the parameter
bound to `C.lambda` (`"-2 * lambda"` in J.7). Results of J-5 other
than the counts, and the diagnostics, are not in the IR.

## J.11 Reference implementation status {/* #j11-reference-implementation-status */}

Grounding 0.1 is **not implemented** in `cadl` 0.3.22.

- `cadl check` reports the extension name `grounding` as unknown, with
  an informational diagnostic, and ignores `grounding:`, `shares:`,
  `on_fulfilment:`, and `magnitude:`, which are keys it does not know.
  The file of J.9 passes `cadl check` 0.3.22 with that one diagnostic.
  The file of J.7 fails for the reasons given in
  [I.14](./appendix-i-games.md#i14-reference-implementation-status).
- Planned: the rules J-1 to J-8 in `cadl check`, with the indices
  shown by a command `cadl norms-indices` (text and JSON) and written
  to the IR of J.10; J-9 to J-12 together with the implementation of
  Appendix I; J-13 in `cadl norms-diff`.
- The indices of J.9 were computed by hand and checked with a script
  that reads the YAML of the example and applies the definitions of
  J.4; the numbers of J.7 are those of I.12.

## J.12 Backward compatibility

Files written against CADL v0.3 without this extension remain valid
and are read the same way. The extension changes no verdict of
Appendix F and no result of Appendices H and I: a term with
`sanction_of:` is a term of I.6 with a defined weight.

A file that uses `grounding:`, `shares:`, `on_fulfilment:`,
`on_violation.magnitude`, `sanction_of:`, or `reward_of:` without
declaring `grounding: 0.1` does not conform to this appendix. A
processor that implements the extension does not interpret these keys
in such a file and SHOULD report them as undeclared extension keys:
no index is computed, and a payoff term with `sanction_of:` or
`reward_of:` is an error by I-7, so that it is never read as a term
with the default weight. A file that declares `grounding: 0.1` without
`norms: 0.1` gets the error of J-1. Processors that do not implement
the extension MUST NOT reject files that use it; they SHOULD emit a
single informational diagnostic per file.
