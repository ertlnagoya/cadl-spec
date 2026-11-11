---
sidebar_position: 16
title: "Appendix F: Norms Extension"
description: "Norms extension (norms 0.1): obligations, permissions, prohibitions and powers as first-class objects of a contract, counts-as rules, bounded temporal operators, four-valued verdicts, and the continuity of norms across amendments."
---

# Appendix F — Norms Extension (norms 0.1)

This appendix specifies the **norms extension** to CADL. It adds to the
`contract_def` production of
[Appendix A.4](./appendix-a-syntax.md#a4-contracts-institution-layer)
two keys, `norms:` and `counts_as:`, and adds bounded temporal
operators to some predicates of a contract. With them, the obligations,
permissions, prohibitions, and powers that the core language leaves in
the text of `assume:`, `guarantee:`, and `responsibilities:` become
objects with a bearer, a deadline, a state over time, and a defined
consequence of violation.

The core language ([Chapter 5](./05-language-spec.md),
[Appendix A](./appendix-a-syntax.md)) does **not** mandate these
blocks; a conforming CADL processor that does not implement the
extension MUST NOT reject a file because of the new keys. It SHOULD
accept them syntactically and emit an *informational* diagnostic.

The extension is versioned independently from the core language. Its
name is `norms` and this appendix describes version `0.1`. Because the
temporal operators of F.4 change how some predicates are read, a file
that uses the extension MUST declare it with the `extensions:` key of
[Appendix A.2](./appendix-a-syntax.md#a2-top-level-structure); F.11
says what a processor does with an undeclared use.

```yaml
sos:
  ...
  extensions:
    - norms: 0.1
```

The extension can be used with or without the SoS-DSL extension
([Appendix E](./appendix-e-sos-dsl.md)). Where a contract also has a
`lifecycle:` block, a norm can move the contract instance to a
lifecycle state on violation (F.3).

## F.1 Motivation

The research directions of [Section 9.6](./09-research.md) identify
four gaps. Version 0.1 of this extension is a first step on each:

1. **Norms are not first-class.** A guarantee such as
   `"delivery_time <= 300s"` says what must hold, but not who must make
   it hold, from when, until when, and what follows when it does not.
   Deontic contract languages such as Symboleo treat obligations and
   powers as objects with a lifecycle
   [[Sharifi+, 2020]](./appendix-b-references.md); CADL contracts did
   not.
2. **Predicates have no time.** `assume:` and `guarantee:` are state
   predicates. Deadlines exist only on lifecycle transitions of the
   SoS-DSL extension.
3. **Protocols and contracts are not connected.** Nothing says that a
   message of a protocol *counts as* an act in a contract, which is how
   institutions create institutional facts from other facts
   [[Boella & van der Torre, KR 2004]](./appendix-b-references.md).
4. **Amendments have no effect on running norms.** When a contract is
   amended while the SoS runs (as in
   [Course D](../handson/robot-town-tutorial.md) of the hands-on
   materials), nothing says what happens to an obligation that is
   already active.

Norms 0.1 deliberately stays small: it fixes the vocabulary and the
static and dynamic semantics, so that design-time checking (by
translation to a model checker) and runtime monitoring can be added by
processors without changing the language. It does not give the
institutional parameters α, β, and λ a formal meaning for norms (F.7);
the grounding extension ([Appendix J](./appendix-j-grounding.md))
takes a first step from the norms of a contract to the parameters.

## F.2 Concepts

| Concept | Meaning in norms 0.1 |
| --- | --- |
| **Norm** | An obligation, permission, prohibition, or power of one bearer, declared in a contract. |
| **Obligation** | The bearer must bring about its `content` (make a predicate true or make an event occur), by the `deadline:` if one is given. |
| **Prohibition** | The bearer must not bring about its `content` while the norm is active (and, if a `deadline:` is given, only within that window). |
| **Permission** | The bearer may bring about its `content`. A permission is never violated; it records what is allowed. |
| **Power** | The bearer can perform an institutional act (its `content`) that changes the state of other norms of the contract (`effects:`). A power is neither fulfilled nor violated. |
| **Institutional event** | A named event of a contract that is created by a `counts_as:` rule from a message or a condition, for example "this message counts as a reassignment". |
| **Contract instance** | One execution of a contract, as in [Appendix E](./appendix-e-sos-dsl.md). F.5 says when it starts and ends. |
| **Norm instance** | The norm within one contract instance. Each norm has exactly one instance per contract instance in version 0.1. An index such as `i` in `ROBOT[i]` is bound by the contract instance. |
| **Verdict** | The value of a norm instance or of a temporal guarantee on the trace observed so far: `pending`, `fulfilled`, `violated`, or `excused` (F.5). |

## F.3 Syntax (EBNF additions to A.4)

The grammar uses the notation of
[Appendix A](./appendix-a-syntax.md). `identifier`, `actor_ref`,
`duration_lit`, `predicate`, and `text` are defined in Appendix A;
`message_event` and `severity` in
[Appendix E, E.3](./appendix-e-sos-dsl.md). `contract_def` gains two
optional keys:

```ebnf
contract_def    = ... ,
                  [ "norms:"     , { "-" , norm_def } ] ,
                  [ "counts_as:" , { "-" , counts_as_def } ] ;

norm_def        = "id:"           , identifier ,
                  "kind:"         , norm_kind ,
                  "bearer:"       , actor_ref ,
                  [ "counterparty:" , actor_ref ] ,
                  [ "trigger:"      , norm_event ] ,
                  [ "until:"        , norm_event ] ,
                  "content:"      , norm_content ,
                  [ "deadline:"     , duration_lit ] ,
                  [ "on_violation:" , norm_violation ] ,
                  [ "effects:"      , power_effects ] ,
                  [ "on_amendment:" , amendment_policy ] ;
norm_kind       = "obligation" | "permission" | "prohibition" | "power" ;

norm_event      = message_event | identifier | predicate ;    (* string *)
norm_content    = message_event | identifier | tpredicate ;   (* string *)

norm_violation  = [ "severity:"   , severity ] ,
                  [ "sanction:"   , text ] ,
                  [ "reparation:" , identifier ] ,
                  [ "transition:" , identifier ] ;

power_effects   = [ "activate:"  , { "-" , identifier } ] ,
                  [ "suspend:"   , { "-" , identifier } ] ,
                  [ "resume:"    , { "-" , identifier } ] ,
                  [ "discharge:" , { "-" , identifier } ] ;

amendment_policy = "carry_over" | "discharge"
                 | ( "transform:" , identifier ) ;

counts_as_def   = "when:"    , ( message_event | predicate ) ,
                  "creates:" , identifier ,
                  [ "if:"      , predicate ] ;
```

A `norm_event` or `norm_content` is read as follows. A string of the
form `A -> B : m` is a `message_event`. A string that consists of a
single identifier names the institutional event of that name when the
contract declares one in `counts_as:`; otherwise it is a predicate (a
state variable, N-8). Any other string is a predicate (`norm_event`) or
a `tpredicate` (`norm_content`). An institutional event name inside a
larger predicate (`reassignment AND x > 0`) is a state variable, not the
event. Values that contain `[`, `]`, `*`, `->`, or `": "` SHOULD be quoted
and MUST be quoted inside a flow sequence, as for every scalar of
[Appendix A](./appendix-a-syntax.md).

A `message_event` `S -> R : m` **occurs** at an observation that
carries a message with the name `m` whose sender matches `S` and whose
receiver matches `R`; when `m` is written with arguments, they must
equal the arguments of the message. An actor reference matches a
concrete actor of a message as follows, wherever a `message_event`
stands: in a `trigger:`, an `until:`, a `content:`, and the `when:` of
a `counts_as:` rule.

| Reference | Matches |
| --- | --- |
| `A` | the actor `A`, declared without index; never an indexed member `A[k]` |
| `A[3]` | the member `A[3]` |
| `A[*]` | every member of the declared set `A` |
| `A[1..3]` | the members `A[1]` to `A[3]`; with a symbolic bound (`A[1..N]`), every member of the set |
| `A[i]` | the member `A[v]` when the contract instance binds `i` to `v`; every member of the set when it binds no value to `i` (a processor SHOULD warn) |

`A[k]` is a **member** of the set `A` when `A` is declared with a range
and `k` lies within its integer bounds: a set declared as `A[1..3]`
does not contain `A[7]`. When the declared upper bound is symbolic
(`A[1..N]`), every index from the lower bound on is a member, and
`A[0]` is not. An actor that is not declared, or that lies
outside the bounds of its set, matches no reference.

In these predicates the reserved identifiers of
[Appendix E, E.4](./appendix-e-sos-dsl.md#e4-static-semantics) are
available as in a `rule`: `now`, `request`, and, when the contract has a
`lifecycle:` block, `state`; and so is the membership `x IN [a, b]` of
E.3.

In `on_violation:`, `reparation:` names another norm of the same
contract that is activated when this norm is violated (a
contrary-to-duty norm), `sanction:` describes the sanction in text, and
`transition:` names a state of the contract's `lifecycle:` block
([Appendix E](./appendix-e-sos-dsl.md)), to which the contract instance
moves as with `on_violation.transition` of a lifecycle transition.
`severity:` defaults to `Major` and `on_amendment:` to `carry_over`.
`counterparty:` names the party to whom the norm is owed; it is
informative in version 0.1 and has no effect on the semantics.

The key `until:` and the temporal operator `until(...)` of F.4 are
different things and may appear in the same norm.

## F.4 Temporal predicates

A `tpredicate` is a `predicate` of
[Appendix A.10](./appendix-a-syntax.md#a10-expressions) in which three
bounded temporal operators may appear wherever a `function_call` may.
They are written as function calls, so the expression grammar of A.10
is unchanged; the extension gives these three names a meaning:

```ebnf
tpredicate      = predicate ;     (* in which the calls below have temporal meaning *)
temporal_call   = "within"     , "(" , duration_lit , "," , tpredicate , ")"
                | "throughout" , "(" , duration_lit , "," , tpredicate , ")"
                | "until"      , "(" , tpredicate , "," , tpredicate , "," , duration_lit , ")" ;
```

| Operator | Holds at time t when | Metric temporal logic |
| --- | --- | --- |
| `within(d, p)` | `p` holds at some time in `[t, t + d]` | F<sub>[0,d]</sub> p |
| `throughout(d, p)` | `p` holds at every time in `[t, t + d]` | G<sub>[0,d]</sub> p |
| `until(p, q, d)` | `q` holds at some time t′ in `[t, t + d]`, and `p` holds at every time in `[t, t′)` | p U<sub>[0,d]</sub> q |

The operators are evaluated on a **timed trace**: a sequence of
observations, each a snapshot of the observed quantities with a
non-decreasing time stamp, as delivered to the monitors of
[Appendix E](./appendix-e-sos-dsl.md). "At some time" and "at every
time" range over the observations whose time stamps fall in the
interval (pointwise semantics); an interval that contains no
observation makes `within` false and `throughout` true. `d` MUST be a
`duration_lit` greater than zero; operators may be nested.

**Where they may appear.** With the extension declared, temporal
operators may appear only in the `assume:` and `guarantee:` items of a
contract and in the `content:` of a norm. They MUST NOT appear in any
other predicate or condition of the file in version 0.1 (N-10): among
others the `trigger:` and `until:` of a norm, the `when:` and `if:` of a
`counts_as:` rule, monitor `rule:`, lifecycle `when:` and `on:`,
`condition:`, `safety_invariant:`, `formula:`, `expr:`, and protocol
conditions. Events and
conditions are evaluated at a single observation, and a future-time
operator there would not be decided until later.

**When they are evaluated.** A `tpredicate` in `assume:` or
`guarantee:` is evaluated at the time the contract instance starts:
`within(300s, p)` there means "`p` within 300 s of the start of the
contract instance". To state an invariant, write it with `throughout`.
A `tpredicate` in `content:` is evaluated at observation times after
the norm's activation (F.5). A predicate without temporal operators
keeps the meaning it has in the core language.

**When their value is known.** The value of an operator at time t can
depend on observations after t. It is **decided** at the first
observation that determines it; before that it is not decided, and a
decided value does not change.

For an operator whose operands contain no temporal operator, the rule is
as follows. `within(d, p)` is decided true, and `throughout(d, p)`
false, at the observation in `[t, t + d]` that shows it;
`until(p, q, d)` is decided true at the observation at which `q` holds,
and false at an observation at which `p` fails before `q` has held.
Otherwise the value is decided at the first observation whose time stamp
is after `t + d`. The interval is then over: `within` and `until` are
false and `throughout` is true, unless an operand was undefined (F.5) at
an observation of the interval and a value of that operand could have
decided it otherwise; in that case the value is undefined. For
`until(p, q, d)` this is so only for an undefined `q`, or for an
undefined `p` at an observation before one at which `q` held: an
undefined `p` does not matter when `q` never held, and the value is then
false. Likewise `until` is not decided false by a failing `p` at an
observation before which `q` was undefined; its value is then undefined. The end
of an interval is therefore not known at the time `t + d` itself but at
the first observation after it; that observation need not change any
quantity (F.5).

An operator whose operand contains a temporal operator is decided once
the values of the operand on which it depends are decided, each by the
same rule at its own observation. This can be later than `t + d`.
`within(2s, throughout(5s, p))` at time t needs the value of
`throughout(5s, p)` at the observations of `[t, t + 2s]`, and that
value, when `p` keeps holding, is decided only by an observation more
than 5 s later: the operator can stay undecided until an observation
after `t + 7s`. In general the value of a `tpredicate` at time t is
decided at the latest by the first observation after t plus the largest
sum of the durations of operators nested in one another.

A file that does not declare `norms: 0.1` reads `within`, `throughout`,
and `until` as ordinary function names, as in the core language.

## F.5 Dynamic semantics

### Contract instances

Norms are judged per contract instance. When the contract has a
`lifecycle:` block, contract instances are those of
[Appendix E, E.5](./appendix-e-sos-dsl.md): the host application creates
them, and an instance **ends** when it reaches a terminal state. When
the contract has no `lifecycle:` block, the host application creates
and ends contract instances in the same way, without states; with no
host, a single instance starts at the first observation and ends at the
last. A trace that stops while the contract instance is still running
is a *prefix*: the instance has not ended, and nothing is settled.

A processor that receives the observations one at a time, while the
system runs, does not know that an observation is the last one when it
processes it. For such a processor the end of the instance is signalled
separately, after that observation, and the norms are then settled
(item 6 below) at the last observation received, with its time stamp,
as in step 6 of that observation. An observation that arrives after the
contract instance has ended is not part of the instance and has no
effect on it.

An observation need not change anything. An observation that carries
only a time stamp is an observation like any other: predicates are
evaluated and deadlines are checked at it. A passed deadline and the end
of an interval are detected at an observation and not between
observations (items 2 and 3 below, F.4). A processor that monitors a
running system SHOULD therefore make an observation soon after the
deadline of an active norm passes; without one, the violation, and with
it the decision between `violated` and `excused`, waits for the next
observation.

A predicate has one of three values at an observation: true, false, or
**undefined**, when it refers to a quantity that has no value yet;
`AND`, `OR`, and `NOT` follow Kleene's three-valued logic. An undefined
predicate does not hold and does not fail: an event or condition does
not occur on it, and an assumption or guarantee is not decided by it.
"Becomes true" means: true at the current observation, and not true at
the previous observation of the instance or no previous observation.
In a contract with a `lifecycle:` block, `state` in a predicate is the
lifecycle state before the transitions of the current observation.

A name that stands alone in a predicate, such as `load` in `load > 5` or
`Delivered` in `ROBOT[i].status == Delivered`, is an observed quantity
or a symbolic value. The set of names that are observed quantities is
fixed for the contract instance: it is given to the processor when the
instance starts, or, for a recorded trace, it is the set of names that
have a value in some observation of the instance. A name of this set is
a quantity at every observation of the instance, and is undefined, not a
symbolic value, at the observations before its first value. Every other
name that stands alone is a symbolic value. A symbolic value can only be
compared with a text value, by `==`, `!=`, or `IN`; a predicate that
uses it in another way is undefined.

### Quantifiers and aggregates

A quantified predicate `exists x in D: p` or `for all x in D: p`, and
a comprehension `f(e for x in D)` as the argument of an aggregate
function ([Appendix A, A.10](./appendix-a-syntax.md#a10-expressions)),
are evaluated at an observation over a **domain** `D`. The domain names
a declared set of actors: `A`, `A[*]`, or `A[lo..hi]`. The domain of a
comprehension may also be a range of integers `lo..hi`. A predicate with
any other domain is not evaluated (F.10).

The variable `x` takes the indices of the members of the domain. In `p`
or `e`, an actor reference indexed by `x` (`A[x]`, also inside an index
expression such as `A[x+1]`) denotes the member with that index, and
an index that is not a member of `A` (F.3) denotes no member, so a
quantity of it is undefined, whatever the trace gives for it; `x.q`
denotes the quantity `q` of that member (`r.load` in
`sum(r.load for r in ROBOT[*])`); and `x` alone is the integer index,
so `j != k` says that `j` and `k` are different members. Within `p` or
`e`, `x` hides an index of the same name that the contract instance
binds, an observed quantity of the same name, and the variable of an
enclosing quantifier or comprehension. It never hides a symbolic bound
of a set declaration: the bound `N` of a set declared as `A[1..N]` is
read outside every quantifier and comprehension, also when one of them
has a variable named `N` (N-14).

**Closed and open domains.** The members of a set are those of F.3; a
range `A[lo..hi]` keeps the members within its bounds. When every bound
is an integer, the domain is **closed**: it is exactly those members.
A symbolic bound (`N` in a set declared as `A[1..N]`, in `A[2..N]`, or
in `1..N`) has a value at an observation when the contract instance
binds the name to an integer or the name is an observed quantity whose
value at the observation is an integer. A domain with a symbolic bound
is closed as well when every such bound has a value and, for the
symbolic bound of the set declaration, no member with an index beyond
its value has been named at or before the observation. F.3
makes every index from the lower bound on a member, whatever value the
bound has, so a member named beyond the value keeps the domain open; a
processor SHOULD warn when that happens. Otherwise the domain is
**open**: the number of members is not known. The **known members** of an open domain at an observation are
the members of the set, within the integer bounds, that the contract
instance has named at that observation or before: in the name of a
value (`A[3].delivery`), as the sender or receiver of a message, or by
binding an index `i` to `k` where a norm or a `counts_as:` rule of the
contract writes `A[i]`. Observations after the current one are never
used, so an open domain is not closed by what is observed later.

A processor MAY limit the number of members of a closed domain that it
enumerates, since a bound that the trace gives can be arbitrarily
large. A closed domain with more members than the limit is then
evaluated as an open domain, with its known members; by the argument
below this is sound, and only a value that the closed domain would
decide may become undefined. A processor that does so SHOULD warn and
name the set and the size.

**Values.** Over a closed domain the quantifiers follow Kleene's
three-valued logic: `exists x in D: p` is true when `p` is true for
some member, false when `p` is false for every member, and undefined
otherwise; `for all x in D: p` is false when `p` is false for some
member, true when `p` is true for every member, and undefined
otherwise. Over an empty domain `exists` is false and `for all` is
true. Over an open domain only a known member decides: `exists` is
true when `p` is true for some known member, `for all` is false when
`p` is false for some known member, and the value is undefined
otherwise, also when `p` has the same value for every known member and
when no member is known. When `p` contains a temporal operator (F.4),
the value is not decided while it is not decided for a member that
could still decide it.

The rule for open domains is sound. Let a closed domain contain the
known members with the values they have at the observation, and any
further members with any values, defined or not; such a domain is a
possible completion of the open domain, whatever value the bound later
takes, because it contains every member named so far. A member for which `p`
is true makes `exists` true over that domain too, and a member for
which `p` is false makes `for all` false, because in Kleene's logic a
disjunction with a true operand is true and a conjunction with a false
operand is false, whatever the other operands are. So a value that is
true or false over the open domain is the value over every such closed
domain. The rule is also the strongest one: when the known members do
not decide, a further member for which `p` is true, or false, changes
the value, and undefined is the value F.5 gives to a predicate that
refers to quantities without values. In particular `exists` over an
open domain is never false and `for all` never true: a prohibition
whose `content:` is such an `exists` is violated when known members
witness it, and otherwise, as for every undefined content, it is not.

**Aggregates.** Of the aggregate functions of a comprehension, the
norms extension evaluates `sum`, `count`, `min`, `max`, and `avg`.
`count(p for x in D)` is the number of members for which `p` is true,
where a value of `p` counts as true when it is true or a number other
than 0, and a text value or a symbolic value makes the count
undefined;
the other functions take the values of `e`, which are numbers. `sum`
and `count` of an empty domain are 0. An aggregate is undefined over an
open domain, when `e` (for `count`, `p`) is undefined for a member,
when a value of `e` is not a number, and for `min`, `max`, and `avg`
over an empty domain. A predicate that compares such a value is
undefined, except in the comparisons below. Another function, and a
temporal operator inside a comprehension, are not evaluated (F.10).

**Monotone aggregates in a comparison.** `count` cannot decrease when
members are added to the domain, `max` cannot decrease, and `min` cannot
increase. A comparison `a op b` or `b op a` with `op` one of `<`, `<=`,
`>`, `>=`, `==`, `!=`, where `a` is a call of `count`, `max`, or `min`
of a comprehension and `b` contains no quantifier and no comprehension
(so its value does not depend on a domain), is therefore decided from
the members known at the observation when that is possible. Every
element that is undefined, and on an open domain every member not yet
known, may take any value; the aggregate then lies in an interval. An
element whose value is of the wrong kind (a value of `e` that is not a
number, or for `count` a value of `p` that is a text or a symbolic
value) still makes the aggregate, and the comparison, undefined, as
stated above.

| Aggregate | Interval |
| --- | --- |
| `count` | from the number t of members for which `p` is true to t + u, with u the number of members for which `p` is undefined; no upper end on an open domain |
| `max` | from the largest defined value of `e` upwards, without upper end |
| `min` | from the smallest defined value of `e` downwards, without lower end |

The comparison is true when it holds for every value of the interval
(for `count`, every integer), false when it holds for none, and
undefined otherwise; `max` and `min` without a defined value of `e`
are undefined as before. For example, over the open domain of
`ROBOT[1..N]`, `count(ROBOT[j].delivery == 7 for j in ROBOT) >= 2` is
true as soon as two known robots have the delivery 7, and
`max(ROBOT[j].load for j in ROBOT) <= 10` is false as soon as a known
robot has a load above 10; `count(...) == 2` is never true over an open
domain, because a further member may add one. On a closed domain whose
elements are all defined the interval is the exact value, so nothing
changes there. The rule is sound by the argument for quantifiers above:
a completion of the domain keeps every known element, and so has its
value in the interval of the open domain. Other comparisons with an
aggregate keep the rule above: one whose other operand has a
quantifier or an aggregate, one inside arithmetic
(`count(...) + 1 >= 2`), and every comparison of `sum` and `avg`. `sum`
and `avg` are not monotone: a further member, or a value of an
undefined element, can move them either way, unless every value is
known to be non-negative or bounded, which the language does not
declare.

The domain and its known members at an observation depend only on the
observations up to it. The values of quantified predicates and
aggregates therefore keep the property of the verdicts below: the
verdicts after an observation are those of the trace up to it. A
predicate that is undefined at an observation because its domain is
open may have a value at a later observation, when a member is named
or the bound gets a value; its value at the earlier observation stays
undefined.

### Wildcard and range references

A **wildcard reference** `A[*]` or a **range reference** `A[lo..hi]`
in a predicate, outside the domain of a quantifier or a comprehension,
is shorthand for a quantifier or a comprehension over the members of
`A`, or over the members within the range, with that reference as the
domain. Two such references belong to the same **group** when they
have the same actor name and the same index as written: `A[*]` and
`A[*]` do, `A[*]` and `A[1..3]` do not. A predicate is rewritten in
two steps.

1. **Aggregate arguments.** Let `f(e)` be a call of `sum`, `count`,
   `min`, `max`, or `avg` whose only argument `e` is not a
   comprehension; inner calls are rewritten first. The call binds the
   references in `e` that are not inside a further aggregate call. When
   they form one group with domain `D`, `f(e)` stands for
   `f(e' for x in D)`, where `e'` is `e` with every reference of the
   group replaced by `A[x]`, and `x` is a variable that occurs nowhere
   else. When they form two or more groups, the call is not evaluated
   (F.10): a comprehension has to state which members are combined.
2. **Comparisons.** Every other reference is bound by the smallest
   comparison (`==`, `!=`, `<`, `<=`, `>`, `>=`, or `IN`) that contains
   it. A reference that no comparison contains is bound by the
   smallest of the following that contains it: an operand of `AND`,
   `OR`, or `NOT`, the predicate of a quantifier, a predicate argument
   of a temporal operator, and the whole predicate. Such a part `s`
   with the groups `G1`, ..., `Gn`, ordered by the first reference of
   each as written, stands for
   `for all x1 in D1: ... for all xn in Dn: s'`, where `s'` is `s` with
   every reference of `Gi` replaced by `A[xi]`.

Within one comparison, all references of one group therefore denote
the same member, and the comparison has to hold for every member, or
for every combination of members when it has several groups. Different
comparisons quantify on their own.

| Predicate | Stands for |
| --- | --- |
| `ROBOT[*].battery > 10` | `for all j in ROBOT[*]: ROBOT[j].battery > 10` |
| `ROBOT[*].x > ROBOT[*].y` | `for all j in ROBOT[*]: ROBOT[j].x > ROBOT[j].y` |
| `ROBOT[*].x == BASE[*].y` | `for all j in ROBOT[*]: for all k in BASE[*]: ROBOT[j].x == BASE[k].y` |
| `NOT ROBOT[*].stopped` | `NOT (for all j in ROBOT[*]: ROBOT[j].stopped)` |
| `ROBOT[*].x > 0 OR ROBOT[*].y > 0` | `(for all j in ROBOT[*]: ROBOT[j].x > 0) OR (for all k in ROBOT[*]: ROBOT[k].y > 0)` |
| `within(5s, ROBOT[1..3].ready)` | `within(5s, for all j in ROBOT[1..3]: ROBOT[j].ready)` |
| `count(ROBOT[*].status == Collision) >= 2` | `count(ROBOT[j].status == Collision for j in ROBOT[*]) >= 2` |
| `sum(ROBOT[*].load) > BASE[*].limit` | `for all k in BASE[*]: sum(ROBOT[j].load for j in ROBOT[*]) > BASE[k].limit` |

The rewritten predicate is evaluated as above. The rules for open
domains, the limit on the number of members a processor enumerates, and
the dependence on the observations up to the current one therefore
apply unchanged. The comparison is the scope, not the whole predicate,
so that `NOT`, `AND`, `OR`, and the temporal operators combine truth
values as they do elsewhere: `NOT ROBOT[*].stopped` is true when some
robot has not stopped, and `within(d, p)` reads the domain of `p` at
each observation of the interval. That no robot has stopped is
written with a quantifier, `for all j in ROBOT[*]: NOT ROBOT[j].stopped`.
N-15 names the cases where the reading may not be what the author
means. Three of them follow from the rule that one group denotes one
member in a comparison: `ROBOT[*].pos != ROBOT[*].pos` compares each
robot with itself and is never true (that the positions are pairwise
distinct is
`for all j in ROBOT[*]: for all k in ROBOT[*]: j == k OR ROBOT[j].pos != ROBOT[k].pos`);
`count(ROBOT[*].delivery == ROBOT[*].delivery)` counts every robot with
a delivery; and `within(5s, ROBOT[*].status == Delivered)` needs all
robots delivered at one observation of the interval (each robot within
5 s on its own is
`for all j in ROBOT[*]: within(5s, ROBOT[j].status == Delivered)`).

The references of a message event are matched as in F.3 and are not
rewritten. A wildcard or range reference in the arguments of a message
event is not evaluated (F.10).

Before this subsection, these references had no value in a predicate
(Appendix A, A.10), and the components of the reference implementation
that read them do so in different ways (F.10). The rewriting above
agrees with the quantified forms that earlier versions of this
appendix gave as their meaning, and with the use of `count(A[*]...)` in
the examples.

### Norm instances

A norm instance is in one of six states:

| State | Meaning |
| --- | --- |
| `inactive` | Not yet in force. |
| `active` | In force; an obligation or prohibition is being judged. |
| `suspended` | Temporarily not in force (by a power). Its deadline and window clocks stop. |
| `fulfilled` | An obligation whose content was brought about in time, or a prohibition whose window closed without the content occurring. |
| `violated` | An obligation whose deadline passed without the content, or a prohibition whose content occurred. |
| `discharged` | Ended without being fulfilled or violated: by `until:`, by a power, by the end of the contract instance, or by an amendment (F.6). |

`fulfilled`, `violated`, and `discharged` are final: in version 0.1 a
norm instance is judged at most once per contract instance. A trigger
that occurs while the norm instance is not `inactive` is ignored, and a
prohibition reports only its first violation.

1. **Activation.** A norm instance starts `inactive`. It becomes
   `active`:
   - when its `trigger:` occurs (a message is sent, an institutional
     event is created, or a predicate becomes true);
   - when the contract instance starts, if the norm has no `trigger:`
     and is neither named as the `reparation:` of another norm nor in
     the `activate:` effect of a power;
   - when the norm it repairs is violated (`reparation:`), or when a
     power activates it (`activate:`).

   The **activation time** is the time stamp of the observation at which
   the norm becomes active.
2. **Obligation.** An active obligation becomes `fulfilled` at the
   first observation, at or after its activation, at which its
   `content` occurs (a message or an institutional event) or holds (a
   `tpredicate` evaluated at that observation). It becomes `violated`
   when its `deadline:`, measured from the activation time without the
   time spent `suspended`, has passed without that happening; content
   at exactly the deadline is in time, and content while the obligation
   is `suspended` does not count. The violation takes place at the first
   observation after the deadline. When the content is a
   `tpredicate` with temporal operators, its value at an observation may
   be known only later; the obligation stays `pending` until it is
   decided, and only observations up to the deadline count.
3. **Prohibition.** An active prohibition becomes `violated` at the
   first observation at which its `content` occurs or holds. It becomes
   `fulfilled` when its `deadline:` window, measured from the activation
   time without the time spent `suspended`, has closed; content at
   exactly the end of the window is a violation. A suspended prohibition
   is not judged.
4. **Permission and power.** They stay `active` until they are
   discharged.
5. **Discharge.** A norm instance that is `active` or `suspended`
   becomes `discharged` when its `until:` occurs, whatever its
   deadline, or when a power discharges it.
6. **End of the contract instance.** When the contract instance ends,
   every norm instance that is not final is settled: an active or
   suspended obligation without `deadline:` becomes `violated`; an
   obligation whose deadline has not yet passed becomes `discharged`; a
   prohibition becomes `fulfilled`; every other norm instance, including
   an `inactive` one, becomes `discharged`. Two exceptions: a norm
   instance that became active at the observation at which the instance
   ends, and that step 4 of that observation did not make final,
   becomes `discharged`, since no observation followed its activation;
   and an obligation or
   prohibition whose `tpredicate` content is still undecided stays as it
   is, with the verdict `pending`. A violation that arises from this
   settlement is reported with its severity, but its `reparation:` and
   `transition:` do not apply, since the instance has ended.
7. **Powers.** An institutional event created from a message is
   *performed by* the sender of that message; one created from a
   predicate has no performer. When the bearer of an active power
   performs its `content` (an institutional event, or a message the
   bearer sends), the `effects:` apply to the norm instances of the same
   contract instance: `activate` makes an inactive norm active,
   `suspend` makes an active norm suspended, `resume` makes a suspended
   norm active, and `discharge` makes an active or suspended norm
   discharged. An effect on a norm in another state does nothing. When
   the act is performed while no matching power of the performer is
   active, the effects do not apply (the institutional event itself
   still exists for other norms); a processor that monitors norms
   SHOULD record the act as unauthorised.
8. **Violation.** When a norm instance becomes `violated`, its
   `on_violation:` applies: a violation with the given `severity:`
   (default `Major`) and the norm `id` as label is reported, the
   `reparation:` norm is activated, and the contract instance moves to
   the `transition:` state if one is given and the instance is not
   already in a terminal state.

### Counts-as

A `counts_as:` rule creates its institutional event in a contract
instance when its `when:` occurs (a message is sent, or a predicate
becomes true) and its `if:` condition, if any, holds at that
observation. Institutional events are local to the contract instance.
They exist only as events: they can trigger, end, or fulfil norms, and
they are the content of powers.

### Order within one observation

One observation can carry a message that creates an institutional
event, triggers a norm, fulfils another, and fires a lifecycle
transition. A processor applies the steps in this order, each to the
state left by the previous one. Before step 1 it evaluates the
`assume:` items and then the `guarantee:` items of the contract, so an
assumption that fails at an observation excuses the violations of that
observation; and at the first observation of the instance it first
activates the norms that become active when the instance starts.

1. create the institutional events of the `counts_as:` rules;
2. apply the effects of powers (item 7), power by power in the order
   of declaration and, within one power, in the order `activate`,
   `suspend`, `resume`, `discharge`; whether a power is active is
   decided at the beginning of this step;
3. activate norms whose triggers occurred (item 1);
4. judge the active norms, for each norm in this order: a deadline
   that has passed, then the content, then `until:` (items 2, 3, 5); so
   a violation by a passed deadline comes before a discharge at the same
   observation, and content before `until:`. A norm activated in step 3
   is judged in this step too, so content at its activation time
   counts;
5. apply `on_violation:` (item 8); a reparation norm activated here is
   first judged at the next observation;
6. fire the lifecycle transitions of
   [Appendix E](./appendix-e-sos-dsl.md), and, if the contract instance
   has ended, settle its norms (item 6).

### Verdicts

The **verdict** of a norm instance, or of a guarantee with temporal
operators, on the finite trace observed so far is one of four values:

| Verdict | Norm instance | Guarantee of a contract |
| --- | --- | --- |
| `pending` | `inactive`, `active`, or `suspended` | not yet decided on the observed prefix |
| `fulfilled` | `fulfilled`, or `discharged` | holds on every continuation of the prefix |
| `violated` | `violated` while no assumption of the contract had failed | fails on every continuation, while no assumption had failed |
| `excused` | `violated` at or after the observation at which an assumption of the contract failed | fails at or after the observation at which an assumption failed |

An assumption **fails** at the first observation at which its value
becomes false (for an item with temporal operators, the observation at
which its value is decided false, F.4); an assumption whose value is not
yet decided, or is undefined, has not failed. An `assume:` or
`guarantee:` item without
temporal operators is a state predicate and is evaluated at every
observation: it fails at the first observation at which it is false,
and a guarantee that has not failed when the contract instance ends is
`fulfilled`. An item that mixes a state predicate with temporal
operators is a `tpredicate` and is evaluated once, at the start of the
instance. Once an assumption has failed, every later violation in the
same contract instance is `excused`; a guarantee or norm becomes
`excused` only when it itself fails, not when the assumption fails. A
discharged permission or power has the verdict `fulfilled`, although it
is not fulfilled in the sense of F.2. A violation by a passed deadline
is judged `violated` or `excused` at the observation at which it takes
place, not at the time of the deadline. When a trace ends, `pending`
verdicts stay `pending`: a trace that stops before a deadline or the
end of an interval does not decide it, and neither does the end of the
contract instance for a temporal item whose interval is not over.

With the set of observed quantities fixed for the contract instance
(see "Contract instances" above), the verdicts after an observation are
those of the trace up to that observation, read as a prefix with the
same set. They do not depend on later observations, and a verdict other
than `pending` does not change afterwards. A processor MAY therefore
compute the verdicts while the system runs, observation by observation;
given the same set of quantities, it gives the verdicts that a processor
reading the recorded trace gives.

A processor that is not given the names of the quantities and learns
them from the observations reads a name as a symbolic value until its
first value arrives. For a predicate that uses such a name before its
first value, it MAY give a verdict that differs from the one above. This
is the only permitted difference. Such a processor SHOULD be given the
names; the difference arises only where the name is compared with a text
value, since any other use of a symbolic value is undefined, as is the
quantity without a value.

`excused` separates "the bearer failed" from "the bearer was not given
what the contract assumes", which is the basis of assigning blame in
deontic runtime verification
[[Kharraz+, ICTAC 2023]](./appendix-b-references.md); taking the
assumption into account also makes more properties monitorable
[[Henzinger & Saraç, RV 2020]](./appendix-b-references.md). Version 0.1
uses this weak reading of assumptions. The strong reading of
[Section 5.4.1](./05-language-spec.md), under which the guarantee must
still hold for a short time after an assumption stops holding, is not
expressed by verdicts in version 0.1. An excused norm still triggers
its `on_violation:`, because the consequence for the contract instance
does not depend on blame; the reported violation carries the verdict
`excused`.

## F.6 Amendments

An **amendment** replaces the definition of a contract by a new version
with the same contract `id` while contract instances are running. How
versions are made, approved, and put into effect is outside norms 0.1;
the [Course D](../handson/robot-town-tutorial.md) hands-on materials show
one procedure. The new version takes effect at an observation, before
anything else is evaluated at that observation (before the assumptions
and guarantees and before step 1 of F.5); a norm that the amendment
makes active is therefore judged at that same observation. Norm
instances are treated as follows.

An `active` or `suspended` norm instance follows the `on_amendment:` of
its norm in the **old** version:

| `on_amendment:` | Effect |
| --- | --- |
| `carry_over` (default) | The instance continues under the norm with the same `id` in the new version, keeping its state and the time already elapsed against its deadline. It is `discharged` instead when the new version has no norm with that `id` or when that norm has a different `kind`. If the content changes, the instance is judged on the new content from this observation on. If the elapsed time already exceeds the new deadline (elapsed time equal to it does not), an obligation, also a suspended one, becomes `violated` when the new version takes effect, and the window of a prohibition has closed, so it becomes `fulfilled`. |
| `discharge` | The instance is `discharged`. |
| `transform: X` | The instance is `discharged`, and the norm `X` of the new version is activated if it is `inactive`, with the time already elapsed counted against its deadline (for an obligation or prohibition; for a permission or power the time has no effect). If `X` is not `inactive`, nothing more happens. |

The entries of the table are applied in the order in which the old
version declares the norms, and before new norms are activated. When
the target `X` of `transform:` does not exist in the new version, the
instance is only `discharged`.

An `inactive` norm instance takes the definition of the norm with the
same `id` in the new version, and is removed when the new version has
no such norm; it is not activated by the amendment, even if its new
definition has no `trigger:`. A norm is *new* when the old version has
no norm with its `id`; it starts `inactive`, and becomes active at once
if it has no `trigger:` and is not a reparation or activation target
(F.5, item 1). Final instances (`fulfilled`, `violated`, `discharged`)
are not affected and their `id`s are not used again in the contract
instance: a norm of the new version with the `id` of a final instance
gets no new instance. In particular, a violation stays a violation of
the version under which it occurred, while a violation that occurs
after the amendment uses the `on_violation:` of the new version.

The `counts_as:` rules of the new version apply from the time it takes
effect. An `assume:` or `guarantee:` item whose text is the same in
both versions continues with its value; an item that is new is
evaluated from this observation on (a `tpredicate` at this observation);
an item that is removed keeps the verdict it had. An assumption that
failed before the amendment still excuses later violations. When the
contract has a `lifecycle:` block, the current state of the instance
MUST be a state of the new version; otherwise the amendment cannot be
applied to that instance. A regime transition (A.7) does not affect
norm instances in version 0.1.

A processor that applies amendments SHOULD report, before the new
version takes effect, every carried-over norm whose `content` or
`deadline:` changes.

## F.7 Static semantics {/* #f7-static-semantics */}

A norms-aware processor MUST, in addition to existing checks:

- **N-1.** Every norm `id` MUST be an identifier, MUST NOT be a reserved
  word (including the `IN` of [Appendix E](./appendix-e-sos-dsl.md)),
  and MUST be unique within its contract. The name in `creates:` MUST
  be an identifier and MUST NOT equal the `id` of a norm of the same
  contract. (Under a YAML 1.1 loader an unquoted `yes`, `no`, `on`, or
  `off` is a boolean, not a name; see
  [A.12](./appendix-a-syntax.md#a12-reference-implementation-status-v03).)
- **N-2.** `kind:` MUST be one of `obligation`, `permission`,
  `prohibition`, `power`.
- **N-3.** `bearer:` and `counterparty:` MUST name single declared
  actors: without an index, with an integer index (`ROBOT[1]`), or with
  an index that the contract instance binds (`ROBOT[i]`); a wildcard or
  a range (`ROBOT[*]`, `ROBOT[1..3]`) is not allowed. They SHOULD name parties of the contract.
- **N-4.** `deadline:` MUST be a `duration_lit` and is allowed only for
  an obligation or a prohibition. `on_violation:` is allowed only for an
  obligation or a prohibition.
- **N-5.** `effects:` is allowed only for a power, and a power MUST have
  at least one effect. Every name in `effects:` MUST be the `id` of a
  norm of the same contract other than the power itself.
- **N-6.** `on_violation.reparation` MUST name an obligation or a
  prohibition of the same contract that has no `trigger:`. Following
  `reparation:` from any norm MUST NOT lead back to that norm.
- **N-7.** `on_violation.transition` MUST name a state in
  `lifecycle.states` of the same contract; the contract MUST therefore
  have a `lifecycle:` block ([Appendix E](./appendix-e-sos-dsl.md)).
- **N-8.** A processor SHOULD warn when an identifier used as a whole
  `trigger:`, `until:`, or `content:` is not an institutional event of
  the contract but is the `id` of a norm, which is likely a mistake.
- **N-9.** In a `message_event` of a norm or a `counts_as:` rule, the
  sender and the receiver MUST name declared actors. The content of a
  power MUST be an institutional event that every `counts_as:` rule
  creating it creates from a `message_event`, or a `message_event` whose
  sender is the bearer.
  For an obligation or a prohibition whose content is a
  `message_event`, the sender SHOULD be the bearer.
- **N-10.** A temporal operator MUST have the arguments of F.4, its
  duration MUST be a `duration_lit` greater than zero, and it MUST NOT
  appear outside the places F.4 allows.
- **N-11.** `on_amendment:` MUST be `carry_over`, `discharge`, or
  `{ transform: X }` with an identifier `X`. (Whether `X` exists in the
  new version can only be checked against that version.)
- **N-12.** A processor SHOULD warn when a permission and a prohibition
  of the same contract have the same `bearer:` and textually identical
  `content:`, since the two conflict.
- **N-13.** A processor SHOULD warn when the `trigger:` of a prohibition
  is a `message_event` and every occurrence of the trigger is an
  occurrence of the content: the content is a `message_event` with the
  same message name, with the same argument values when the content has
  arguments, and with actor references that match every actor that
  those of the trigger match (`D -> R[i] : go` and `D -> R[1..3] : go`
  for a set declared as `R[1..3]`); or the content is an institutional
  event that a `counts_as:` rule without `if:` creates from such a
  message. The check is a best effort and does not detect every such
  prohibition (for example, one whose content is a predicate that the
  trigger message makes true). Such a prohibition is violated at the observation
  that activates it (F.5, step 4), which is rarely what is meant: a
  prohibition of a second occurrence is a quantified predicate over
  the state (F.5, "Quantifiers and aggregates") or an `until:`-bounded
  prohibition triggered by an earlier event.
- **N-14.** A processor SHOULD warn when the variable of a quantifier
  or a comprehension has the name of a symbolic bound of a declared set
  (`for all N in S: ...` with `S[1..N]`). The bound keeps its own value
  inside the quantifier (F.5), which a reader may not expect.
- **N-15.** A processor SHOULD warn when a predicate has a wildcard or
  range reference (F.5, "Wildcard and range references") that is bound
  under a `NOT` (`NOT A[*].x > 3` is true when some member has
  `x <= 3`), that is bound by a comparison with a second group (the
  comparison must hold for every combination of members), or whose
  group is bound in both operands of an `OR` (each operand quantifies
  on its own), whose group stands on both sides of one comparison, also
  in an aggregate argument (each member is compared with itself), or
  that is bound inside the predicate argument of `within`, `throughout`,
  or `until` (all members at one observation), and when an aggregate
  argument has two or more groups (it is not evaluated). The warning
  SHOULD name the quantified form that the author probably meant.

### Relation to the core checks

The consistency checks of [Section 6.3](./06-design.md) (satisfiability
of `assume:` and `guarantee:` with an SMT solver) apply to state
predicates. An `assume:` or `guarantee:` item that contains a temporal
operator is not a state predicate. A norms-aware processor that does
not translate temporal predicates MUST leave such an item out of the
SMT checks and report that it did so; it MUST NOT treat the operator as
an uninterpreted function.

### Relation to the institutional parameters (informative)

The parameters of [Section 5.4.2](./05-language-spec.md) are not given
a formal meaning for norms in version 0.1. The intended reading, to be
made precise in a later version (RD-6.1 in
[Section 9.6](./09-research.md)), is: β, the degree of centralisation of
decision-making, describes who holds the powers of a contract; α, the
degree of information sharing, describes which triggers and contents
the other parties can observe; and λ, the incentive intensity, scales
the sanctions of violated norms.

The grounding extension
([Appendix J](./appendix-j-grounding.md), `grounding` 0.1) defines
indices related to this reading without changing this appendix: for
β, the concentration of the powers of a contract; for α, the sharing
of declared information items (not the observability of triggers and
contents); and, for λ, a numeric magnitude of a sanction that a
strategic model multiplies by λ, together with a count of the norms
that carry a sanction or a reward.

## F.8 Example

The contract below is a simplified variant of the delivery contract of
[Appendix E, E.6](./appendix-e-sos-dsl.md) with norms added. It is taken
from `examples/norms_robot_delivery.cadl` in the
[`cadl`](https://github.com/ertlnagoya/cadl) repository and abridged.

```yaml
sos:
  name: "RobotDeliveryNorms"
  extensions:
    - sos-dsl: 0.1
    - norms: 0.1
  # actors DISPATCHER, ROBOT[1..N], CUSTOMER[1..M] as in Appendix E

  contracts:
    - id: DELIVERY_SLA
      parties: [DISPATCHER, "ROBOT[*]", "CUSTOMER[*]"]
      assume:
        - "throughout(300s, DISPATCHER.is_operational == true)"
      guarantee:
        - "within(300s, ROBOT[i].status == Delivered)"

      lifecycle:
        states:   [Proposed, Assigned, Delivering, Completed, Violated]
        initial:  Proposed
        terminal: [Completed, Violated]
        transitions:
          - { id: assign,   from: Proposed,   to: Assigned,   on: "DISPATCHER -> ROBOT[i] : route_assignment" }
          - { id: start,    from: Assigned,   to: Delivering, on: "ROBOT[i].status == InTransit" }
          - { id: complete, from: Delivering, to: Completed,  on: "ROBOT[i].status == Delivered" }

      counts_as:
        - when: "DISPATCHER -> ROBOT[i] : replan_command"
          creates: reassignment

      norms:
        - id: acknowledge
          kind: obligation
          bearer: "ROBOT[i]"
          counterparty: DISPATCHER
          trigger: "DISPATCHER -> ROBOT[i] : route_assignment"
          content: "ROBOT[i] -> DISPATCHER : ack(accepted)"
          deadline: 5s
          on_violation:
            severity: Major
            reparation: report_failure
        - id: report_failure
          kind: obligation
          bearer: "ROBOT[i]"
          counterparty: DISPATCHER
          content: "ROBOT[i] -> DISPATCHER : failure_report"
          deadline: 2s
          on_violation:
            severity: Critical
            transition: Violated
        - id: no_low_battery_driving
          kind: prohibition
          bearer: "ROBOT[i]"
          content: "ROBOT[i].battery < 10 AND ROBOT[i].status == InTransit"
          on_violation:
            severity: Critical
            sanction: "removed from the dispatch pool for one period"
        - id: may_return_to_charge
          kind: permission
          bearer: "ROBOT[i]"
          content: "ROBOT[i] -> DISPATCHER : charging_request"
        - id: reassign
          kind: power
          bearer: DISPATCHER
          content: reassignment
          effects:
            discharge: [acknowledge, report_failure]
          on_amendment: discharge
```

`acknowledge` is triggered by the route assignment and must be met
within 5 s. If it is violated, the robot must report a failure within
2 s (`report_failure`, a contrary-to-duty obligation, which stays
inactive until then); failing that too moves the contract instance to
`Violated`. `no_low_battery_driving`, `may_return_to_charge`, and
`reassign` have no trigger and are active from the start of the
contract instance. The dispatcher's `replan_command` counts as a
`reassignment` performed by the dispatcher, which discharges both
obligations while the power `reassign` is active; since each norm is
judged once per contract instance, a later route assignment in the same
instance creates no new obligation. The guarantee says that the robot
delivers within 300 s of the start of the contract instance; if the
dispatcher stops operating before a late delivery, the delivery is
`excused` rather than `violated`.

## F.9 Intermediate Representation (IR) addition

The simulator IR (E.7) is extended with two fields on each contract
under `institution.contracts`: `norms` and `counts_as`. As in E.7, the
IR is a direct serialization of dataclasses and flattens nested
blocks:

```jsonc
{
  "norms": [
    { "id": "acknowledge",
      "kind": "obligation",
      "bearer": "ROBOT[i]",
      "counterparty": "DISPATCHER",
      "trigger": "DISPATCHER -> ROBOT[i] : route_assignment",
      "until": null,
      "content": "ROBOT[i] -> DISPATCHER : ack(accepted)",
      "deadline_ms": 5000,
      "on_violation_severity": "Major",
      "on_violation_sanction": null,
      "on_violation_reparation": "report_failure",
      "on_violation_transition": null,
      "effects_activate": [],
      "effects_suspend": [],
      "effects_resume": [],
      "effects_discharge": [],
      "on_amendment": "carry_over",
      "transform_to": null }
  ],
  "counts_as": [
    { "when": "DISPATCHER -> ROBOT[i] : replan_command",
      "creates": "reassignment",
      "if": null }
  ]
}
```

`trigger`, `until`, `content`, `when`, and `if` are kept as text, like
the rules of E.7. The key `if` is written as `if` in the serialized IR,
although a dataclass field cannot have that name in every host
language. `on_violation_severity` is `null` when the whole
`on_violation:` block is omitted and `Major` when the block is present
without `severity:`. `on_amendment` is always filled in: `carry_over`,
`discharge`, or `transform`; `transform_to` is the target of
`transform:` and `null` otherwise. `norms` and
`counts_as` are empty lists for a contract without them.

## F.10 Reference implementation status {/* #f10-reference-implementation-status */}

The reference implementation (`cadl` 0.3) implements norms 0.1 from
`cadl` 0.3.19 as follows:

- `cadl` parses `norms:` and `counts_as:` and the temporal operators of
  F.4, applies rules N-1 to N-15 in `cadl check` (N-8, N-12 to N-15,
  and the SHOULDs of N-3 and N-9 as warnings; N-13 and N-14 from `cadl`
  0.3.23, N-15 from `cadl` 0.3.24), and lowers both blocks to the IR
  of F.9.
- The SMT checks of `cadl verify` leave out `assume:` and `guarantee:`
  items that contain temporal operators and report each one as not
  checked (F.7). `cadl codegen` leaves the same items out of the
  contract code of every target, with a comment in the code and a
  warning; it does not translate temporal operators into the target
  languages. The Python target monitors them in a separate module (see
  below).
- A numeric `deadline:` of a norm is read as seconds, the lenient form
  that [A.12](./appendix-a-syntax.md#a12-reference-implementation-status-v03)
  describes for lifecycle deadlines. `cadl check` looks for temporal
  operators in the places listed in F.4; it does not look inside
  `violation.detect`, `incentives.rules`, a protocol `trigger:`, or
  `context.assumptions`, which are text.
- From `cadl` 0.3.20, `cadl norms-eval` computes the norm states,
  verdicts, violations, institutional events, and unauthorised acts of
  F.5 for one contract instance from a recorded trace (JSON Lines, one
  observation per line; the format is described in the README of the
  `cadl` repository), and applies the amendments of F.6 that the trace
  names. It takes the lifecycle state from the trace and does not run
  the lifecycle state machine: a `transition:` requested by a violation
  is reported, not applied. Up to `cadl` 0.3.21 it matched the actor
  references of message events too widely: a range such as `A[1..2]`
  matched every actor named `A[k]`, and `A[*]` and an unbound `A[i]`
  also matched actors outside the declared set. `cadl` 0.3.22
  matches them by the table of F.3; verdicts computed
  for a file that uses such references in a `trigger:`, an `until:`, a
  `content:`, or a `counts_as:` rule SHOULD be computed again. It also
  tests the lower bound of a set with a symbolic upper bound. The time
  of a trace is a finite number of at most 2<sup>53</sup> in absolute
  value, so epoch seconds and epoch milliseconds are accepted. The
  actors and the name of a message of a trace are read as written:
  `ROBOT[ 2 ]`, which 0.3.21 read as `ROBOT[2]`, is a trace error. This
  is deliberate, because two spellings of one actor in a recorded trace
  defeat a check that compares names. It
  also ignores the observations after the end of the contract instance
  entirely: up to 0.3.21 it took the names of the observed quantities
  (F.5) also from them, so that such an observation could change a
  verdict. Up to `cadl` 0.3.22 a norm or item that contains a
  quantifier or an aggregate was not evaluated. From `cadl` 0.3.23 it
  evaluates them as F.5 defines ("Quantifiers and aggregates"); it
  enumerates at most 10 000 members of a closed domain and evaluates a
  larger one as an open domain, with a warning. Up to `cadl` 0.3.23 a
  norm or item with a wildcard or range reference outside the domain of
  a quantifier or a comprehension (`ROBOT[*].battery > 10`) was not
  evaluated. From `cadl` 0.3.24 it rewrites such a predicate as F.5
  defines ("Wildcard and range references") when it reads the contract,
  and evaluates the result with the code for quantifiers and aggregates;
  the variables it introduces have names that no predicate can write. A
  file without such references gives the same results as before. From
  the same release it decides the comparisons of `count`, `max`, and
  `min` of F.5 ("Monotone aggregates in a comparison") from the known
  members; up to 0.3.23 they were undefined over an open domain and when
  an element was undefined. A norm or
  item that contains a function call other than a temporal operator or
  `sum`, `count`, `min`, `max`, or `avg` of a comprehension, an
  aggregate argument with references of two or more groups, a wildcard
  or range reference in the arguments of a message event, a quantifier
  or comprehension whose domain is not a set of actors or a range,
  `x.q` for a variable `x` over a range of integers, or a temporal
  operator inside a comprehension is not evaluated and stays `pending`,
  with the reason in the report. `cadl norms-diff` compares two
  versions of a file and reports what F.6 does to the norms of each
  contract, including every carried-over norm whose `content` or
  `deadline:` changes and a `transform:` target that the new version
  lacks.
- From `cadl` 0.3.22,
  `cadl codegen -t python` writes, for a file that declares
  `norms: 0.1`, a module `norms_monitor.py` into the generated package
  ([Appendix D, D.1](./appendix-d-codegen.md)). It monitors one
  contract instance while the system runs: the host makes a
  monitor for the instance, passes it one observation at a time, and
  gets back the norm instances, guarantees, and assumptions whose state
  or verdict changed at that observation, with time and reason; it
  signals the end of the instance, and can ask for the current verdicts.
  The module contains the evaluation code of `cadl norms-eval`, copied
  verbatim, and the contracts of the file as data; it does not need
  `cadl` at run time, and for a recorded trace it gives the result of
  `cadl norms-eval`. As that command, it takes the lifecycle state from
  the observations and reports a `transition:` without applying it. It
  reads the points that F.4 and F.5 state for a processor that receives
  the observations one at a time as follows. A passed deadline and the
  end of an interval are detected at the next observation; the monitor
  tells the host the earliest time stamp at which an observation is
  certain to decide something that only waits for time (a little after
  the deadline or the end of the interval, since content at the
  deadline itself is in time; times are compared with a tolerance of
  10<sup>-9</sup> s). The host names the quantities that are written
  without an actor; a name it does not name is read as a symbolic value
  until its first value, which is the difference F.5 permits
  (`cadl norms-eval` takes the names from the observations of the
  instance in the trace). An observation after the end of the instance
  has no effect and is counted in a warning. An observation that is
  malformed, or whose amendment cannot be applied, is refused and leaves
  the monitor as it was. The monitor keeps the observations of the
  instance until it is dropped. An amendment (F.6) is applied when the
  host supplies the data of the monitor generated from the new version;
  the monitor cannot read a CADL file. Before `cadl codegen` writes the
  module it checks that the module compiles and that every name it uses
  is defined in it, and it refuses to generate otherwise.
- The Solidity, OPA, and Unity C# targets do not monitor norms, and
  translation of norms to a model checker for design-time checking is
  not implemented.
- The other components read a wildcard reference outside a domain in
  their own way, and `cadl` 0.3.24 does not change them. `cadl verify`
  reads `A[*].q` as one unconstrained variable per group, shared by
  all `assume:` and `guarantee:` items of the contract, so it does not
  range over the members either. The contract
  code of the Solidity and OPA targets and the predicate evaluator of
  the Unity C# target drop the index and read `A[*].q` as one quantity
  `A.q` (in Unity, of the snapshot of the contract instance), so they
  do not range over the members. The contract code of the Python target
  looks up the set name `A` in its table of actors, which holds the
  members under their own names (`A[1]`), so the reference has no value
  there. The Python target keeps the conditions of protocols, such as
  `count(ROBOT[*].status == Collision) >= 2`, as comments, and the
  simulator generators of `cadl sim-gen` copy predicates as text. The
  monitors of Appendix E and the simulator outputs are therefore the
  same as in `cadl` 0.3.23.

## F.11 Backward compatibility

Files written against CADL v0.3 without this extension remain valid and
are read the same way. A file that uses `norms:`, `counts_as:`, or the
temporal operators without declaring `norms: 0.1` does not conform to
this appendix. A norms-aware processor reads `within`, `throughout`, and
`until` in such a file as ordinary function names, does not interpret
its `norms:` and `counts_as:` blocks (they are not checked and not
lowered to the IR), and SHOULD report them as undeclared extension
keys. Processors that do not implement the extension MUST NOT reject
such files; they SHOULD emit a single informational diagnostic per
file.
