---
sidebar_position: 20
title: "Appendix J: Grounding of the Institutional Parameters"
description: "Grounding extension (grounding 0.1): an index of information sharing, an index of the concentration of powers, and a coverage measure for incentives, derived from the norms of a contract; rules that compare the declared alpha and beta with the indices; numeric magnitudes of sanctions and rewards; and the definition of the payoff term of a sanction in a strategic model as the magnitude times lambda."
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
from the norms of a contract two **derived indices**, α̂ and β̂, and
the **incentive coverage** χ, all in `[0, 1]`, and compares the
declared `alpha` and `beta` with the indices. The extension also
defines the weight of a payoff term that is declared to stand for the
sanction of a norm in a strategic model: the size the norm declares,
multiplied by λ.

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
0.1 is a first step. It does not give α, β, and λ a formal meaning in
terms of norms; that remains open beyond what follows.

- **Two indices and a coverage are computed from the file.** J.4
  defines α̂, β̂, and χ as ratios of counts over finite sets that are
  read from one contract. They are reproducible in the sense that two
  processors compute the same numbers from the same file. For α̂ both
  counts rest on annotations of the author (the items and the
  `shares:` lists), so the index is as good as the annotation.
- **Indices are evidence, not meaning.** The indices do not replace
  the declared parameters and do not change Section 5.4.2. They are
  structural facts about the norms of a contract with which a declared
  value can agree or disagree. J.4 says what they cannot capture.
- **Declared values are compared with them.** A disagreement between a
  declared α or β and its index is a warning that names the construct
  concerned (J.5). No rule of this appendix makes a file invalid that
  is valid under Appendix F and uses none of the new keys (J.12).
- **λ is a scale.** In this appendix λ multiplies the sizes of
  sanctions and rewards; it is not compared with a derived index. χ
  measures something else: how many norms carry a sanction or a reward
  that λ could scale.
- **Sanctions get a size, and the model uses it.** `magnitude:` gives
  the sanction or the reward of a norm a number. In a strategic model,
  a payoff term declared with `sanction_of:` has, by definition, the
  weight −magnitude·λ, where λ is the parameter bound to the `lambda`
  of the contract (J.7). That the term represents the sanction, that
  is, that its reward structure counts the violations of the norm,
  remains the author's assumption, and every result computed with such
  a term is reported with it.

**Scope of version 0.1.**

- An index concerns one contract. Indices are not aggregated over the
  contracts of an SoS.
- Information items are declared by the author (`grounding.items`);
  they are not derived from actor interfaces, predicates, or messages.
- The indices are counts. They are not weighted by magnitudes, by
  severities, or by the number of norms a power affects.
- `magnitude:` and `on_fulfilment:` have no effect on the dynamic
  semantics of Appendix F: verdicts, violations, and reparations are
  unchanged.
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
| **Party name** | The actor name of an entry of `parties:` of the contract. Entries with one actor name are one party. |
| **Single actor** | An actor reference with an integer index, or without an index when the actor is declared without a range. |
| **Information item** | A named piece of information declared in `grounding.items`, with its **origin**, the party from which it stems. An item has one origin; information that stems from two parties is declared as two items. |
| **Sharing norm** | An obligation or a permission whose content is a message and which has `shares:`; its message gives the listed items to the receiver. |
| **Magnitude** | A number that is not negative: the size of a sanction or of a reward at full incentive intensity (λ = 1), in the unit of account of the contract. |
| **Derived index** | α̂ or β̂: a rational number in `[0, 1]` computed from one contract, or undefined. |
| **Incentive coverage** | χ: the fraction of the obligations and prohibitions of a contract that carry a sanction or a reward, or undefined. |

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
- `on_fulfilment:` records a reward for fulfilling the norm:
  `reward:` describes it in text, as `sanction:` describes a sanction,
  and `magnitude:` is its size. The reward is deemed paid when the
  norm instance reaches the state `fulfilled` of F.5: for an
  obligation, when its content is brought about in time; for a
  prohibition, when its window closes or the contract instance ends
  without a violation. It is not paid when the instance is
  `discharged`, although the verdict of a discharged instance is
  `fulfilled`. The block is an annotation and has no effect on the
  semantics of Appendix F.
- A `norm_ref` is a quoted string `"C.n"`: the `id` of a contract, a
  dot, and the `id` of a norm of that contract.

A text that is empty or consists of white space only
(`sanction: ""`, `reward: " "`) counts as empty, and a YAML null
counts as absent, for every key of this appendix. A text is taken
after YAML loading: an unquoted scalar that the loader reads as a
number or a boolean is the text as written (`sanction: 0` is the text
"0" and carries an incentive), and an author SHOULD quote such a text.
A `reward:` that is a sequence or a mapping is an error (J-4). A
magnitude MUST be written as a decimal: a YAML 1.1 loader reads `1e3`
as a string, which is an error of J-4, and `1.0e-7` as a number. An unquoted item name that a YAML 1.1 loader reads as a
boolean or null MUST be quoted
([A.12](./appendix-a-syntax.md#a12-reference-implementation-status-v03)).

## J.4 The derived indices and the coverage

The three quantities are defined for every contract C of a file that
declares the extension. Each is a ratio of two counts, or
**undefined** when its denominator is zero. An undefined quantity
takes part in no comparison of J.5.

### Information sharing: α̂

Let Π be the set of party names of C, X the set of items of
`grounding.items`, and o(x) the origin of an item x (a party name,
J-2). The **pairs** of C are the pairs (x, q) of an item x and a party
name q other than o(x): the places where an item can be shared with a
party.

Whether a target stands for a whole party follows the matching of
actor references of F.3. An actor reference T **denotes the whole
party** q when its actor name is q and it is a single actor `A`
(J.2), `A[*]`, `A[i]` with an identifier as index, the full range with
which the actor is declared, or a range with a symbolic bound (which
matches every member, F.3). A reference with an integer index denotes
the whole party only when it is equal to the only entry of `parties:`
with that actor name. Any other reference with an integer index or a
range is **member-specific**. A bare set name, `A` for an actor
declared with a range, matches no member (F.3): it gives no pair, and
a processor SHOULD warn (J-3); it is not member-specific. Indices and
ranges are compared as written; the core parser does not accept white
space inside an index. For example, with
`parties: [DISPATCHER, "ROBOT[1]", "ROBOT[2]"]` the target `ROBOT[2]`
is member-specific, and only `ROBOT[*]`, `ROBOT[i]`, or a range gives
the pair of an item and ROBOT.

A pair (x, q) is given

- **by a sharing entry**, when an entry `"S -> T : x"` of
  `information.sharing` has the item x and a target T that denotes the
  whole party q; an entry that is not of this form with one item, such
  as `"A -> B : x, y"` or `"A -> B : f(5s)"`, which the core parser
  accepts leniently (A.12), gives no pair, and a processor SHOULD warn
  (J-3);
- **by an obligation**, or **by a permission**, when a sharing norm of
  that kind lists x in `shares:` and has as content a message
  `S -> T : m` whose receiver T denotes the whole party q.

A pair is **given** when it is given in at least one of the three
ways.

```text
α̂  =  (number of given pairs) / (number of pairs)
```

α̂ is undefined when there is no pair (no item, or a single party
name). α̂ = 0 exactly when no pair is given, which corresponds, for
the declared items only, to the end point "no sharing" of 5.4.2;
α̂ = 1 exactly when every pair is given, which corresponds, for the
declared items only, to "complete sharing". A processor reports, with
α̂, the number of pairs given in each of the three ways, the pairs
that are not given, and the **member-specific** entries and norms: an
entry or norm that would give a pair but whose target is
member-specific (as in `"DISPATCHER -> ROBOT[3] : route"`) gives no
pair and is listed separately, each entry and each norm once, however
many items it names. A contract that declares `alpha: 0` and whose
sharing entries are all member-specific has α̂ = 0 and gets no warning
of J-6, although a member-specific entry is sharing; the index does
not see it.

What the definition does not look at:

- The source S is not examined: an entry gives the item to T whoever
  sends it.
- An identifier index always counts as the whole party, also where
  the author means one selected member (`ROBOT[winner]`).
- A target that is not a party of the contract gives no pair; a
  processor SHOULD warn (J-3).
- The state of a norm is ignored: a sharing norm counts whether or not
  it has a `trigger:`, an `until:`, or a `deadline:`, and whether it
  is active from the start or only as a reparation or by a power.
- A prohibition of the same message does not remove a pair; N-12 of
  Appendix F warns about such a conflict.
- An obligation and a permission both give a pair. The index records
  that a norm makes or lets a party have an item, not that the party
  has it; the three counts keep the difference visible.
- A contract whose parties are one actor set has a single party name
  and no pair, so α̂ is undefined for it. Sharing among peers, which is
  what matters in a collaborative SoS of equal constituents, is
  therefore not measured in version 0.1.

### Concentration of powers: β̂

The **decision points** of C are its powers (F.2). A power is the only
construct of a contract whose exercise changes the state of other
norms with a defined effect (F.5); `authority.decision_scope` is text
and is not counted. For a single actor a (J.2), let k(a) be the number
of powers of C whose `bearer:` is the reference a (the same actor
name and the same index). A power whose bearer is not a single actor,
as `ROBOT[i]`, is held by each member for itself and counts for no
single actor.

```text
β̂  =  (largest k(a) over the single actors a) / (number of powers)
```

β̂ is 0 when no power is borne by a single actor, and undefined only
when C has no power. It is the largest share of the decision points of
the contract that lie with one actor: a **concentration** index. β̂ = 1
exactly when one single actor bears every power, which corresponds,
for the powers only, to the end point "single actor decides all" of
5.4.2; β̂ = 0 exactly when no single actor bears a power.

β̂ does not depend on `authority.decision_holder`. A processor reports
with β̂: the number of powers per bearer; for each power, the number of
distinct norms named in its `effects:`; and, when the decision holder names a
single actor h, the **share of the decision holder** k(h) divided by
the number of powers. The counts are not weighted by the effects: a
power that discharges one norm and a power that discharges another
party's power count alike.

### Incentive coverage: χ

Let N be the set of obligations and prohibitions of C. A norm of N
**carries an incentive** when at least one of the following holds:

- it has an `on_violation.sanction` that is not empty;
- it has an `on_violation.magnitude` greater than zero;
- it has an `on_fulfilment.reward` that is not empty, or an
  `on_fulfilment.magnitude` greater than zero.

```text
χ  =  (number of norms of N that carry an incentive) / (number of norms in N)
```

χ is undefined when N is empty. χ = 0 exactly when no obligation or
prohibition carries a sanction or a reward, and χ = 1 exactly when
each of them does. χ is not an index of λ. It counts the norms that
have something for λ to scale; λ says by how much (J.7).

Two further counts are reported separately and are not part of χ: the
norms of N that carry no incentive and have an
`on_violation.reparation` (their violation creates a further duty,
not a sanction), and the norms of N that have an
`on_violation.transition` (their violation moves or ends the contract
instance). `severity:` is not counted anywhere: it classifies a
violation.

### How the quantities move

The three quantities are invariant under renaming and under
reordering of norms, items, and parties. They are **not** invariant
under splitting or merging: one power written as two, or two
obligations merged into one, changes β̂ or χ although the contract
asks the same of the parties. In each lemma everything not mentioned
stays the same, and the quantity is defined before and after.

- **Lemma 1 (α̂).** Adding an entry to `information.sharing`, adding
  an item to the `shares:` of a sharing norm, or adding a sharing norm
  never lowers α̂. *Proof.* The set of pairs is unchanged, and every
  pair that was given is still given. Adding an item or a party, in
  contrast, adds pairs and can lower α̂.
- **Lemma 2 (β̂).** Adding a power whose bearer is a single actor with
  the largest k(a) never lowers β̂, and adding a power whose bearer is
  not a single actor never raises it. *Proof.* With the largest count
  k among n powers, k ≤ n, so k/n ≤ (k + 1)/(n + 1) and
  k/(n + 1) ≤ k/n.
- **Lemma 3 (χ).** Making an obligation or a prohibition carry an
  incentive that carried none (by a sanction text that is not empty,
  or a magnitude greater than zero) raises χ by 1/|N|; a magnitude of
  zero does not. Adding a norm to N that carries an incentive never
  lowers χ, and adding one that carries none never raises it.
  *Proof.* As for Lemma 2.

### What the quantities do not capture

- α̂ counts entitlements and duties to share, not what a party
  observes in operation, and not the quality or the delay of the
  information. The items are those the author lists.
- β̂ counts powers. Decisions that are not institutional acts, such as
  who plans a route, are not norms and are not counted; all powers
  weigh the same, whatever their effects.
- χ says how many norms carry a sanction or a reward, not how large
  these are or how likely they are to be applied.
- Only the product of a magnitude and λ enters any result of J.7.
  Within one contract, λ and the magnitudes are not identified
  separately: doubling every magnitude and halving λ changes nothing.
- The core keys `incentives.type`, `incentives.rules`, and
  `violation.action` are text and are ignored; a contract can have
  incentives there that χ does not see.
- Under the enforcement of [Appendix G](./appendix-g-agents.md), a
  prohibited message is denied at the boundary and cannot be sent, so
  the prohibition needs no sanction to be effective. A coverage of 0
  in an enforced contract is therefore not "no incentive".
- No quantity says anything about behaviour. Whether more sharing or a
  stronger incentive improves a property is a question for the models
  of Appendices H and I.

## J.5 Relation to the declared parameters

A processor computes the three quantities for every contract and
reports them (J-5). For `alpha` and `beta` it reports the declared
value, the index, and their difference, and compares them. Every
disagreement is a **warning**: the indices are evidence about the
norms, and declaring this extension never invalidates a file that
declares `norms: 0.1`.

**A declared end point with a counterexample in the contract.** The
end points of 5.4.2 are universal statements. When a construct of the
same contract is a counterexample, a processor SHOULD warn and name
the construct (J-6):

| Declared | Counterexample named in the warning |
| --- | --- |
| `alpha: 0` | a given pair, with the entry or sharing norm that gives it; when α̂ is undefined, a non-empty `information.sharing` |
| `alpha: 1` | the pairs that are not given (absence of a norm does not show that a party lacks an item, so this is the weakest of the four) |
| `beta: 1` | a power that is not borne by a single actor with the largest count (the first in the order of the file when several have it); every power when β̂ = 0 |
| `beta: 0` | a single actor with the largest count, but only when β̂ exceeds 1 divided by the number of distinct single actors that bear a power |

β̂ is 0 only when every power is borne by an actor set. A contract in
which several single actors each bear the same number of powers and
none bears more has β̂ equal to 1 divided by their number, the least
value possible for these bearers, and `beta: 0` gets no warning
there.

**An intermediate value far from the index.** For α and β, a processor
SHOULD warn when the declared value and the index differ by more than
the tolerance of the contract and J-6 gives no warning for that
parameter (J-7). The default tolerance is 0.25: the indices are
coarse, and a contract with few norms has few possible index values
(with two powers, β̂ is 0, 1/2, or 1). An author who accepts a larger
difference states it with `grounding.tolerance`. A processor SHOULD
also warn when the decision holder names a single actor whose share is
smaller than β̂: the powers are then concentrated in another actor.

**λ is not compared with a number.** λ is a scale, and χ is a
coverage; a contract in which every norm is sanctioned mildly has
χ = 1 and a small λ and is consistent. A processor reports χ next to
the declared `lambda` and SHOULD warn in two cases only (J-8):
`lambda` is greater than zero while no obligation or prohibition of
the contract carries an incentive (χ = 0, or N is empty), so that λ
has nothing to scale in the norms; and `lambda: 0` while some norm
carries an incentive, so that what the norm declares has no effect in
a model.

**Versions of a contract.** A processor that compares two versions of
a contract (F.6) reports what changed in the keys of this appendix
(magnitudes, `on_fulfilment:`, `shares:`, items) and SHOULD warn when
a declared value and its index move in opposite directions (J-13):
for example, `beta` is raised while an amendment gives a power to a
robot.

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
differ by more than the tolerance (J-9).

**What stays open.** A regime has no norms of its own, so the values
that regimes assign to α and β cannot be checked against indices, and
the ordering of regimes by β cannot be compared with an ordering of
their norms. Deriving a probability of the model from a sharing norm
or from a power, and α as what a player observes in a game (RD-7.3),
are not defined.

## J.7 λ: from the sanction of a norm to a payoff term

In a strategic model ([Appendix I](./appendix-i-games.md)), a payoff
term may name the norm whose sanction or reward it is declared to
represent, instead of giving a weight:

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
unchanged.

**The assumption that is not checked.** The reward structure of the
term is the author's statement of how often the sanction is applied,
or the reward paid, in the model. The convention is: the accumulated
reward of a `sanction_of:` term counts the violations of the norm,
and that of a `reward_of:` term its fulfilments, over all contract
instances within one run of the model; a run may span several contract
instances. No processor can check this. Appendix F judges a norm on a
timed trace and Appendix H evaluates a model in steps, and no
translation between the two is defined. Every result computed with a
payoff that has such a term MUST therefore be reported together with
the assumption, for each term: "the reward structure r is taken to
count the violations (fulfilments) of C.n" (J-12).

**Who bears it.** A sanction is a loss of the bearer of the norm: a
`sanction_of:` term stands in the payoff of the player that stands
for the bearer, and nowhere else. This appendix does not say where the
amount goes. When it is a transfer to the counterparty, the author
writes a second, ordinary term in the payoff of the counterparty's
player, with the same reward structure and an explicit weight
(`weight: "2 * lambda"`); the size of that term is not checked against
the norm (J-11).

**What a processor checks (J-10, J-11).** The norm exists, is an
obligation or a prohibition, and declares the magnitude; the player
of the payoff stands for the bearer of the norm; a norm is named at
most once by each key; and every norm of C with a magnitude whose
bearer is a player of the model is named, once the model names any.
The size and the factor λ hold by definition, since the file states
the magnitude once.

**The shape of the answer.** Let σ be a profile, D a design, and ℓ a
parameter, with all other parameters fixed. Consider two conditions:

- **(i)** ℓ occurs in no probability and in no reward value of the
  model, and every weight in which ℓ occurs is affine in ℓ (ℓ does
  not occur in it with a power above one).
- **(ii) for a player p:** every term of p in whose weight ℓ occurs
  has a weight −m·ℓ with m ≥ 0, as `sanction_of:` terms have, and
  under σ the expected accumulated value of its reward structure is 0.

> **Proposition.** Assume (i). Whether D is well-defined and whether σ
> is admissible do not depend on ℓ. Where they hold:
>
> 1. Every gain_p is a convex, piecewise linear function of ℓ. On an
>    interval of values of ℓ, the set of values at which σ is an
>    ε-equilibrium of D is a closed interval, possibly empty. In
>    particular, σ is an ε-equilibrium at every value between a and b
>    if it is one at a and at b.
> 2. If (ii) holds for p, gain_p is non-increasing in ℓ: if
>    gain_p > ε at b, then gain_p > ε at every value below b.
> 3. If (ii) holds for every player, the set of 1 is empty or consists
>    of the values ℓ ≥ λ\* of the interval, for a threshold λ\*.

*Proof.* By (i), the probabilities, and with them the graph of the
game and every expected accumulated reward, do not depend on ℓ, so
neither do well-definedness and admissibility (H.5, I.6). For a
strategy τ of p, the payoff of p under σ[p↦τ] is A(τ) + ℓ·B(τ) with
numbers A(τ) and B(τ) that do not depend on ℓ, because every weight
is affine in ℓ. BR_p is the maximum of finitely many such functions
(I.7), hence convex and piecewise linear, and the payoff under σ is
affine, so gain_p is convex and piecewise linear, and continuous. The
set where a convex continuous function is at most ε is a closed
interval, and so is the intersection over the players. Under (ii),
B(τ) ≤ 0 for every τ, since it is minus a sum of magnitudes times
expected accumulated rewards, and B is 0 for σ's own strategy; gain_p
is then a maximum of non-increasing functions minus a constant. A
closed interval that contains, with a value, every greater one is
empty or of the form of 3. ∎

**Where it stops.**

- Without (ii) the set is a closed interval and need not be a
  threshold set. In I.12, `shortcut_first` incurs the sanction, and it
  is an equilibrium exactly for max(0, T_1, T_2) ≤ λ ≤ T_3. A
  `reward_of:` term violates (ii) as well, since its value under σ
  grows with ℓ.
- With two contracts there are two parameters bound to two `lambda`
  values. The proposition holds for each of them with the other
  fixed; it says nothing about a region of both.
- When ℓ occurs in a probability (the incentive changes how the
  environment behaves), (i) fails, the payoffs are rational functions
  of ℓ, and nothing of the above holds.

**Certification by the end points of a cell.** J-14 turns the
proposition into a method for an equilibrium map (I.9) whose only
open parameter is ℓ: one exact evaluation at each end of a cell
`[a, b]` certifies `equilibrium`, and one at b certifies a deviator
for whom (ii) holds. This is not evaluation at sample points in the
sense of H.9, because convexity and monotonicity are proved, but it
is sound only under all the conditions that J-14 lists.

**The example.** The first model of [I.12](./appendix-i-games.md) is
linked to a norm by declaring the two extensions, adding the norm to
the contract, and replacing the weight of the third term of R:

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
hand in I.12, so every number of I.12 is unchanged, and every result
is reported with the assumption "the reward structure `shortcuts` is
taken to count the violations of `DELIVERY.no_shortcut`". The bearer
`ROBOT[i]` is covered by `"ROBOT[*]"`, for which R stands (J-10).
`shortcuts` counts the careless attempts of one run, up to three.
Appendix F judges a norm once per contract instance, so the count
agrees with the violations of the norm only if the host starts a
contract instance for each attempt. That is an assumption about the
host which nothing in the file expresses; it is the kind of
assumption the report carries.

Conditions (i) and (ii) hold for `comply`: `lambda` occurs only in
the weight of the term, which is −2·`lambda`, and `comply` takes no
careless attempt, so the expected value of `shortcuts` under it is 0
(reported by J-12). With g the fee, c the cost of effort, s the
probability that a careful attempt succeeds, and m the magnitude of
`no_shortcut`, I.12 derives:

> In each design with s·g ≥ c and s < 1, the compliance profile is a
> Nash equilibrium exactly when λ ≥ λ\*, where
> λ\* = max(0, (c − (s/2)·(g·(1 − s)² + c·(2 − s))) / m).

With g = 10, c = 1, and m = 2, λ\* is 0.150108 in CENTRALIZED and
0.060373 in DISTRIBUTED at the fixed values. The declared λ = 0.1
makes compliance an equilibrium in DISTRIBUTED only. The threshold is
inversely proportional to the magnitude. At λ = 0.1, compliance is an
equilibrium in CENTRALIZED exactly when the magnitude is at least
480347064349/160000000000 (about 3.0022; 3.002 is not enough), and in
DISTRIBUTED exactly when it is at least 193194567781/160000000000
(about 1.2075). For this contract χ = 1/1 = 1 (its one prohibition
carries a sanction), α̂ is undefined (no items), and β̂ is undefined
(no power): the coverage is complete, and the question that remains is
the one the model answers, whether the size m·λ is enough.

## J.8 Static semantics {/* #j8-static-semantics */}

A processor that implements the extension MUST, in a file that
declares `grounding: 0.1`, in addition to existing checks, apply the
rules below. J-1 to J-4 and J-10 are errors; they concern only the
keys of this appendix. Where two clauses would report the same fact
about the same construct, a processor gives one diagnostic.

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
  has the actor name of the origin of a listed item; when the target
  of a sharing entry that names a declared item, or the receiver of a
  sharing norm, is not a party of the contract or is a bare set name
  (J.4); when an entry of `information.sharing` that names a declared
  item is not of the form of J.4 with one item; and when an entry of `information.sharing` names an
  item that `grounding.items` does not declare while the contract
  declares items.
- **J-4.** `on_violation.magnitude` and `on_fulfilment.magnitude` MUST
  be finite numbers that are not negative. `on_fulfilment:` is allowed
  only for an obligation or a prohibition (as `on_violation:`, N-4)
  and MUST have at least one of `reward:` and `magnitude:` that is not
  empty (J.3). A `reward:` MUST be a text (a scalar); a sequence or a
  mapping is an error. A processor SHOULD warn about a `magnitude:` of zero next to a
  `sanction:` or `reward:` text that is not empty.
- **J-5.** For every contract of the file, a processor that implements
  the extension and reports MUST compute α̂, β̂, and χ by the
  definitions of J.4, exactly, and report each with its two counts, or
  as undefined with the reason, together with the further counts that
  J.4 names (the three ways of giving a pair, the member-specific
  entries and norms, the powers per bearer and the effects per power,
  the share of the decision holder, the norms with a reparation only
  and with a transition). For `alpha` and for `beta`, when declared
  and the index is defined, it MUST report the declared value, the
  index, and their difference. For `lambda` it reports the declared
  value next to χ and no difference. The comparisons of J-6 to J-9 and
  J-13 are exact; a declared value is the decimal that is written
  (H.2). The quantities are defined for a file without errors: for a
  file with an error of J-2 to J-4, no quantity is reported.
- **J-6.** A processor SHOULD warn, and name a construct that is the
  counterexample, when a contract declares `alpha: 0` and has a given
  pair, or has a non-empty `information.sharing` while α̂ is
  undefined; `alpha: 1` and α̂ is defined and less than 1; `beta: 1`
  and β̂ is defined and less than 1; or `beta: 0` and β̂ is defined and
  greater than 1 divided by the number of distinct single actors that
  bear a power (J.5).
- **J-7.** A processor SHOULD warn when the declared `alpha` or `beta`
  and the defined index differ by more than the tolerance of the
  contract and the declared value is neither 0 nor 1 (J-6 tests the
  end points, also where it gives no warning), and when the
  decision holder names a single actor whose share of the powers is
  smaller than β̂.
- **J-8.** For a contract that has `norms:`, a processor SHOULD warn
  when the contract declares a `lambda`
  greater than zero and none of its obligations and prohibitions
  carries an incentive (J.4), and when it declares `lambda: 0` and one
  of them does.
- **J-9.** In a file that also declares `stochastic: 0.1`, for every
  design and every parameter bound to `C.alpha` or `C.beta` whose
  index is defined, a processor SHOULD emit an informational
  diagnostic when the fixed value of the parameter under the design
  differs from the index by more than the tolerance of C. It is not
  emitted for a design whose fixed value equals the declared value of
  a parameter that J-6 or J-7 already reported. A file without
  `transitions:` has the one design `base`.
- **J-10.** `sanction_of:` and `reward_of:` are allowed only in a file
  that also declares `stochastic: 0.1` and `games: 0.1`. A term MUST
  have at most one of `weight:`, `sanction_of:`, and `reward_of:`. The
  value MUST be a string `C.n` in which `C` is a declared contract and
  `n` an obligation or a prohibition of `C` that has an
  `on_violation.magnitude` (for `sanction_of:`) or an
  `on_fulfilment.magnitude` (for `reward_of:`) greater than zero. A
  model that has a term naming a norm of `C` MUST have exactly one
  parameter bound by `from: "C.lambda"`.
  The player of the payoff MUST list, in `actors:`, a reference that
  **covers** the bearer of `n`: the two have the same actor name and
  do not have two different integer indices (`"ROBOT[*]"` and
  `ROBOT[1]` cover the bearer `ROBOT[i]`; `ROBOT[1]` does not cover
  the bearer `ROBOT[2]`). In one model, a norm MUST NOT be named by
  more than one `sanction_of:` term, nor by more than one `reward_of:`
  term.
- **J-11.** When a model has a term that names a norm of a contract
  `C`, a processor SHOULD warn about every obligation or prohibition
  of `C` that has a magnitude greater than zero, whose bearer is
  covered by an actor reference of some player, and that no term names
  with the key that corresponds to that magnitude (a norm with both
  magnitudes needs both terms). It SHOULD also warn about a term with a
  `weight:` in which a parameter bound to `C.lambda` occurs: the size
  of such a term is not checked against a norm.
- **J-12.** A processor that evaluates a payoff with a `sanction_of:`
  or `reward_of:` term MUST report, with every result that depends on
  the payoff, the assumption of J.7 for each such term. For every
  `sanction_of:` and every `reward_of:` term and every design it SHOULD
  report the expected accumulated value, until the target of the
  payoff, of the reward structure of the term under the compliance
  profile at the fixed values. A value greater than zero is
  information, not a warning: an obligation can be violated by chance
  although the bearer complies. For a `sanction_of:` term a value of
  zero is condition (ii) of J.7 for the compliance profile; a
  `reward_of:` term breaks (ii) whatever its value, by the sign of its
  weight.
- **J-13.** A processor that compares two versions of a contract
  SHOULD report every change of an `on_violation.magnitude`, an
  `on_fulfilment:` block, a `shares:` list, and `grounding.items`, and
  SHOULD warn when, for α or for β, the declared value and the index
  are defined in both versions and (x′ − x)·(x̂′ − x̂) is less than
  zero, where x and x̂ are the declared value and the index of the old
  version and x′ and x̂′ those of the new one. When only one of the
  two versions declares the extension, the changes of these keys are
  reported against their absence, the processor says that the indices
  are not compared, and no direction warning is given. A norm that is
  new in the second version is listed with its magnitudes,
  `on_fulfilment:`, and `shares:`.
- **J-14.** A processor MAY certify a cell `[a, b]` of an equilibrium
  map (I.9) from evaluations at its end points, and MUST NOT do so
  unless all of the following hold:
  1. the query has exactly one open parameter ℓ (which no regime
     assigns, I-9); ℓ is the open parameter of the query, whether or
     not it is bound to a `C.lambda`;
  2. condition (i) of J.7 holds for ℓ, checked on the text of the
     model: ℓ occurs in no `prob:` and in no reward `value:`, and in
     every `weight:` of every player, and in every weight defined by
     J.7, ℓ occurs with a power of at most one, counted on the text
     (the powers of the factors of a product add up, and nothing
     cancels: `lambda * lambda - lambda * lambda` has the power two);
  3. the design is well-defined and the profile admissible at one
     value of ℓ in the cell (by the proposition, then at every value);
     this is a reminder and no separate check, since the evaluations
     of condition 4 establish it at a and at b;
  4. the evaluations at a and at b are exact (I.8);
  5. for a claim that p is a deviator, condition (ii) of J.7 holds for
     p in that design: every weight of p in which ℓ occurs is, at the
     values used for the other parameters, −m·ℓ with m ≥ 0, and the
     expected value 0 under the profile is computed exactly.

  Then the cell is `equilibrium` when the profile is an ε-equilibrium
  at a and at b, and p is a deviator on the cell when condition 5
  holds and gain_p > ε at b. No other status follows: a gain above ε
  at both ends does not make a player a deviator on the cell without
  condition 5. A processor may report, besides the status, the gain
  bounds `[0, max(g(a), g(b))]` for each player of an `equilibrium`
  cell (by convexity) and `[g(b), g(a)]` for a deviator (by
  monotonicity), where g(a) and g(b) are the gains at the ends, and the
  canonical best response at b as the deviation of a deviator; it does
  not claim `from_every_state`.

  A processor that uses this rule together with the conditions of I.9
  applies it to cells that those conditions leave `undecided`; a cell
  carries the deviators that either method establishes. The rule is a
  rule of this appendix: a file that does not declare
  `grounding: 0.1` cannot use it. Its argument does not use norms; an
  end-point method for a file that declares only `games` is left to a
  later version of Appendix I.

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
pairs. Every target denotes a whole party.

| Item (origin) | DISPATCHER | ROBOT | CUSTOMER |
| --- | --- | --- | --- |
| `route` (DISPATCHER) | origin | given by a sharing entry | not given |
| `status` (ROBOT) | given by a sharing entry | origin | given by a sharing entry |
| `battery` (ROBOT) | given by a permission (`may_return_to_charge`) | origin | not given |
| `failure` (ROBOT) | given by an obligation (`report_failure`) | origin | not given |

Three pairs are given by sharing entries, one by an obligation, and
one by a permission; no entry is member-specific. Five pairs are
given: α̂ = 5/8 = 0.625. The declared `alpha: 0.6` differs by 0.025,
within the tolerance. Had the first entry been
`"DISPATCHER -> ROBOT[3] : route"`, it would be member-specific, the
pair (`route`, ROBOT) would not be given, and α̂ would be 4/8.

**β̂.** The contract has two powers. `reassign` is borne by
DISPATCHER, a single actor; `decline` is borne by `ROBOT[i]`, which is
not a single actor. The largest count of a single actor is 1:
β̂ = 1/2 = 0.5, and the share of the decision holder is also 1/2.
`reassign` names two norms in its effects and `decline` one. The
declared `beta: 0.9` differs by 0.4, more than the tolerance of 0.25,
and the processor warns (J-7): the contract declares a nearly
centralised authority while half of its decision points lie with the
robots. With `beta: 1` the warning would be that of J-6 and would name
`decline`.

**χ.** The contract has three obligations and prohibitions.
`no_low_battery_driving` carries a sanction of magnitude 4.
`acknowledge` has a reparation and no sanction, and `report_failure`
has a lifecycle transition and no sanction; neither carries an
incentive. χ = 1/3 = 0.333333, with one norm that has a reparation
only and one that has a transition. The declared `lambda: 0.5` is
greater than zero and a norm carries an incentive, so J-8 gives no
warning.

By the definition, an amendment that removes `decline` raises β̂ to
1/1 = 1, and by Lemma 3 one that gives
`report_failure` a sanction raises χ to 2/3.

## J.10 Intermediate Representation (IR) addition

Each contract under `institution.contracts` gains the field
`grounding`, and each norm of F.9 four fields. For the example of J.9:

```jsonc
{
  "grounding": {
    "items": { "route": "DISPATCHER", "status": "ROBOT[*]", "battery": "ROBOT[*]", "failure": "ROBOT[*]" },
    "tolerance": 0.25,
    "indices": {
      "alpha":    { "given": 5, "pairs": 8,
                    "by_sharing": 3, "by_obligation": 1, "by_permission": 1, "member_specific": 0 },
      "beta":     { "largest": 1, "powers": 2, "holder": 1,
                    "bearers": { "DISPATCHER": 1, "ROBOT[i]": 1 } },
      "coverage": { "incentive": 1, "norms": 3, "reparation_only": 1, "transition": 1 }
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

The field `grounding` and the four norm fields are absent unless the
extension is declared (with `norms: 0.1`); the IR of every other file
is unchanged. `items` is
an empty mapping and `tolerance` the default when the contract has no
`grounding:` block. `alpha`, `beta`, or `coverage` is `null` when the
quantity is undefined; otherwise the first two fields are its
numerator and denominator, so that the exact ratio can be formed.
`by_sharing`, `by_obligation`, and `by_permission` count pairs and
may overlap; `member_specific` counts entries and norms, each once,
and does not count bare set names. `holder` is
the count k(h) of the decision holder, or `null` when it does not
name a single actor; `bearers` maps each bearer reference, as written,
to its number of powers. Magnitudes are `null` when absent, and an
empty text is `null`.

A payoff term of the IR of
[I.13](./appendix-i-games.md) gains the fields `sanction_of` and
`reward_of` (a string `C.n`, or `null`), written for every term when
the extension is declared (both `null` for a term with a written
weight). For a term with one of them, `weight` is the defined weight
as text: `-m * p` or `m * p`, with m the magnitude written as a plain
decimal without exponent (as the numbers of H.11) and p the `id` of the parameter
bound to `C.lambda` (`"-2 * lambda"` in J.7). Diagnostics are not in
the IR.

## J.11 Reference implementation status {/* #j11-reference-implementation-status */}

The reference implementation implements grounding 0.1 from `cadl`
0.3.23 as follows. Up to 0.3.22, the extension name was unknown and
its keys were ignored without a diagnostic.

- `cadl check` applies the rules J-1 to J-9, and in a strategic
  model J-10 to J-12 (the SHOULDs as warnings, J-9 and J-12 as
  informational diagnostics), and lowers the
  keys to the IR of J.10. An undeclared use gets one warning per file
  (J.12). A key that this appendix does not define inside `grounding:`
  or `on_fulfilment:` (a typo such as `tolerence:`) gets a warning; a
  typo of `magnitude:` inside `on_violation:` or of `shares:` cannot be
  told from an unknown key of the core language and is silent.
- `cadl norms-indices FILE [--contract ID] [--format text|json]`
  reports the quantities of J.4 with all their counts, the comparisons
  of J.5, and the diagnostics of J-9 per design. It refuses a file
  with an error, in particular of J-2 to J-4 (exit status 2); warnings
  do not change the exit status 0.
- `cadl norms-diff` reports the findings of J-13, including a version
  that does not declare the extension. By default it compares the
  contracts that have `norms:` or `counts_as:`; a contract without
  norms whose `grounding.items` change is compared with `--contract`.
- The keys are kept apart from the norms read by Appendix F, so
  `cadl norms-eval`, `cadl agents-run`, the boundary decision, and the
  generated monitor give the same verdicts with and without them. The
  generated monitor of an annotated file is identical to that of the
  file without the keys only when every annotated norm already had an
  `on_violation:` block: adding `on_violation: { magnitude: m }` to a
  norm without one creates the block, and the monitor then carries
  the default severity, with the same behaviour.
- The core parser reads `alpha`, `beta`, and `lambda` as binary
  floating-point numbers; the shortest decimal that round-trips is
  taken as the written decimal (J-5), so a value with more than 17
  significant digits is not recovered. A reference without an index
  to an undeclared actor counts as a single actor (other rules report
  it), and `bearers` is keyed by the reference without white space.
- With Appendix I (`cadl game-check`), the link of J.7 is
  implemented: a `sanction_of:` or `reward_of:` term gets the weight
  of J.7, every
  check and map result carries the assumption of J.7, and J-14 is used
  in `--certify` in a file that declares `grounding: 0.1` when its
  conditions hold (the map reports whether it applies and why not;
  cells it certifies carry `method: "endpoints (J-14)"`). With the link
  implemented, the status `not_evaluated` of I.13 cannot arise for a
  valid file: an unusable reference is an error of J-1 or J-10.
- Verification of the indices: an independent review compared the
  quantities with two scripts on 4 300 and 2 000 random contracts,
  with no disagreement. The invariant of J.12 held on 4 454 random
  files and on 174 sources of the test suite: adding
  `- grounding: 0.1` to a file that declares `norms: 0.1` gained no
  error. The lemmas of J.4 were tested as properties on seeded random
  contracts. The verdicts of `cadl norms-eval` and `cadl agents-run`
  on the bundled traces were identical with and without magnitudes
  and `on_fulfilment:` on every norm, and the outputs of the 17
  bundled examples of 0.3.22 (331 files) were identical to 0.3.22.
- Verification of the link: an independent review ran 840 generated
  models through the programming interface with the bounds of I.9
  disabled, so that every decided cell came from J-14 (12 416 point
  evaluations), and 320 through the command line (3 496 point
  evaluations), against an oracle that enumerates all strategies: no
  wrong claim. The implementer's fuzzing certified cells by J-14 on
  1 200 models, among them games with ℓ in a probability or in a
  weight that is not affine, which J-14 refused (50 733 point
  evaluations, no wrong claim), and detected injected errors that drop
  conditions 2 and 5.
- The example of J.7 gives every result of the first example of I.12
  with the written weight; J-12 reports 0 in both designs. The least
  magnitudes at λ = 0.1 are reproduced exactly: with
  `magnitude: 3.00216915218125` (480347064349/160000000000)
  `comply_nash` is an equilibrium in CENTRALIZED and with
  3.00216915218124 it is not; with 1.20746604863125
  (193194567781/160000000000) it is one in DISTRIBUTED and with
  1.20746604863124 it is not. A value written in a file has at most 15
  significant digits (H.2), so the threshold is tested with these two
  neighbours.
- The quantities of J.9 are those printed by `cadl norms-indices` for
  the example, with one warning (J-7 for `beta`).

## J.12 Backward compatibility

Files written against CADL v0.3 without this extension remain valid
and are read the same way, and their IR does not change (J.10). The
extension changes no verdict of Appendix F and no result of Appendices H and I: a term with
`sanction_of:` is a term of I.6 with a defined weight.

**Declaring the extension never invalidates a file that declares
`norms: 0.1`.** A file that declares `norms: 0.1`, is valid under
Appendix F, and uses none of the keys of this appendix remains valid
when `grounding: 0.1` is added to its `extensions:`. Of the rules
that are errors, J-1 cannot fire for such a file, and J-2, J-3, J-4,
and J-10 apply only to the keys of this appendix; every comparison of a declared parameter with
an index (J-6 to J-9) is a warning or an informational diagnostic.

A file that uses `grounding:`, `shares:`, `on_fulfilment:`,
`on_violation.magnitude`, `sanction_of:`, or `reward_of:` without
declaring `grounding: 0.1` does not conform to this appendix. A
processor that implements the extension does not interpret these keys
in such a file and SHOULD report them as undeclared extension keys,
with one warning per file that lists the keys used (a key whose value
is null is not used):
no quantity is computed, and a payoff term with `sanction_of:` or
`reward_of:` is an error by I-7. A file that declares `grounding: 0.1`
without `norms: 0.1` gets the error of J-1.

A processor that implements Appendix I and not this appendix MUST NOT
evaluate, in a file that declares both, a payoff that has a
`sanction_of:` or `reward_of:` term, nor a query that needs it; it
reports the query as not evaluated (I-7). In no case is such a term
read as a term with the default weight. Processors that do not
implement the extension MUST NOT reject files that use it; they
SHOULD emit a single informational diagnostic per file.
