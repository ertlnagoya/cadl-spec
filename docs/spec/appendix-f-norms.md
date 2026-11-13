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
translation to a model checker, F.12) and runtime monitoring can be added by
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

A number, in a predicate and in an observation, is the exact decimal
number it is written as: `0.1` is one tenth, and the time stamp
`1700000000.123` is that number of seconds. Arithmetic (`+`, `-`, `*`,
`/`, and `avg`) is exact, on rational numbers, so `0.1 + 0.2 == 0.3`
holds. Time stamps, the bounds of the intervals of F.4, and deadlines
are compared exactly, without a tolerance: content at exactly the
deadline is in time (item 2 below), and content one microsecond after
it is not. A processor MAY refuse a number with more than 400
significant digits, with more than 400 decimals, or with an absolute
value above 1.7976931348623157 × 10<sup>308</sup>, the largest finite
double (every finite double is inside this range); it then treats the
observation as an error. A predicate with such a literal is not evaluated.

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
| `carry_over` (default) | The instance continues under the norm with the same `id` in the new version, keeping its state and the time already elapsed against its deadline. It is `discharged` instead when the new version has no norm with that `id` or when that norm has a different `kind`. If the content changes, the instance is judged on the new content from this observation on, and its pending candidates (the candidates that step 4 has not yet judged, F.5, including one whose content was decided while the instance was suspended) are dropped; otherwise they are kept. If the elapsed time already exceeds the new deadline (elapsed time equal to it does not), the window has closed. An instance without a pending candidate is then decided when the new version takes effect, before step 1: an obligation, also a suspended one, becomes `violated`, and a prohibition, also a suspended one, becomes `fulfilled`. An instance with a pending candidate stays in force and gets no new candidate, and step 4 decides it when it judges its candidates, which for a suspended instance happens only after it is resumed: a candidate whose content holds fulfils an obligation or violates a prohibition, and when none holds the obligation becomes `violated` and the prohibition `fulfilled`. The verdict is thus the one that the new version gives when it applies from the start of the instance, whenever the pending candidates lie within the new window; a pending candidate outside it still counts, because it arose under the old version. A suspended instance with a pending candidate that is never resumed ends `pending` when the contract instance ends (F.5). |
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
  languages. The Python target monitors them in a separate module, and
  from `cadl` 0.3.25 the OPA and Solidity targets too (see below).
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
- From `cadl` 0.3.27 the test suite compares `cadl norms-diff` with
  what `cadl norms-eval` does at an amendment. A pair of versions is
  made from a bundled example with norms: the old version gets random
  `on_amendment:` policies, and the new version is the old one with
  deadlines (also non-integer ones) and contents changed, contents made
  temporal, kinds changed, norms added (also as a reparation target) and
  removed, and powers added that suspend or resume norms. A trace takes
  random environment choices of the models of F.12, of the old version
  before the amendment and of the new version from it on, and amends at
  a random observation. For every norm instance, the state right after
  the new version takes effect and the time elapsed against its deadline
  are predicted from the findings of `norms-diff` and the states and
  pending candidates before the amendment alone (carried over with its
  elapsed time, violated or fulfilled because the elapsed time exceeds
  the new deadline, kept in force by a pending candidate, discharged,
  transformed with the elapsed time of the old norm, removed, added and
  active at once or inactive), and compared with `norms-eval`; when a
  pending candidate keeps a late instance in force, its later decision is
  checked against the values of the candidates, computed from the
  content alone. Eight pairs written by hand reach the rarer rows of the
  table of F.6 in every run. On 3 000 random pairs there was no
  difference, and each of 16 errors injected into one of the two
  commands is detected; two errors injected into the model of F.12 are
  detected by paths that go on after the amendment. The comparison and
  its review found two defects of 0.3.26, in `norms-eval`, the Python
  monitor, and the model of F.12. A carried-over prohibition whose
  elapsed time exceeded its new deadline stayed active until step 4 of
  the observation, where a power could still suspend it, and a suspended
  one stayed suspended, while F.6 makes it `fulfilled` when the new
  version takes effect. A late obligation was violated at the amendment
  although a pending candidate of its temporal content could still
  fulfil it. 0.3.27 applies the rule that F.6 now states: a late instance
  without a pending candidate is decided at the amendment, one with a
  pending candidate is decided by its candidates. For the prediction,
  `norms-diff` from 0.3.27 also reports every norm whose
  `on_amendment:` is `discharge`, the kind of a `transform:` target,
  what a shorter deadline does to an obligation and a prohibition, and
  deadlines exactly; up to 0.3.26 it compared them rounded to
  milliseconds, so two numeric deadlines that `norms-eval` distinguishes
  could be reported as equal.
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
  deadline itself is in time). The host names the quantities that are written
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
- From `cadl` 0.3.25, `cadl codegen -t opa` and `-t solidity` write a
  monitor of the norms for each contract of a file that declares
  `norms: 0.1` ([Appendix D, D.5](./appendix-d-codegen.md#d5-norms-monitors-of-the-opa-and-solidity-targets)).
  The Rego monitor is a step function: it computes the next state of the
  monitor (a JSON object that the host stores) and the changes from the
  previous state and one observation. The Solidity monitor is a contract
  that stores the state and takes the time of an observation as an
  argument. Both follow the order of one observation of F.5 as
  `cadl norms-eval` does, and read the points of F.4 and F.5 for a
  processor that receives observations one at a time as the Python
  monitor does. They do not evaluate quantifiers, aggregates, wildcard
  or range references in predicates, index expressions, or amendments:
  a contract that uses one of them in a norm, a counts-as rule, or an
  `assume:` item gets no monitor, with a warning that names the
  construct, and such a `guarantee:` item is left out with a warning.
  The Solidity monitor also refuses `*`, `/`, literals with more than
  six decimals, a temporal operator inside another one, and a monitor
  whose creation code would exceed the limit of EIP-3860, and it refuses
  an observation that would make a bare name read inside a temporal
  operator known after the first observation. From `cadl` 0.3.26 it
  reduces a content with one temporal operator to that operator (its
  dual under `NOT`), refuses two temporal operators in one content,
  `NOT until(...)`, and a temporal operator inside a comparison, and
  decides the candidates of a temporal content together, so that the
  gas of an observation does not grow with the observations inside a
  window. From `cadl` 0.3.28 it also decides a content with one
  temporal operator under `NOT`, inside a comparison, or in `IN`
  (`NOT until(...)` through the release of D.5, whose duality with
  `until` D.5 proves for undefined values), and a content with two
  temporal operators, whose candidates form a segment tree; it refuses
  three or more temporal operators in one content. Its main contract
  then leaves more than 7 × 10<sup>3</sup> bytes below the limit of
  EIP-170. The Rego monitor refuses `/`, whose result is not always
  a decimal number. Both compute numbers and times exactly, as F.5 says,
  and agree with `cadl norms-eval` on the inputs that meet their
  limits; D.5 lists them. From `cadl` 0.3.26, `cadl norms-eval`, the
  Python monitor, `cadl agents-run`, and the Rego monitor refuse a
  number outside the range of F.5 (a trace error with its line), and a
  numeric `deadline:` is exact. The reference implementation
  compares both with `cadl norms-eval` after every observation, the
  Solidity monitor on an EVM.
- The Unity C# target does not monitor norms.
- From `cadl` 0.3.26, numbers and times are exact as F.5 states.
  Up to `cadl` 0.3.25, `cadl norms-eval`, the Python monitor, and
  `cadl agents-run` computed with binary floating point and compared
  times with a tolerance of 10<sup>-9</sup> s, so that `0.1 + 0.2 == 0.3`
  did not hold and a deadline within the spacing of the floats of an
  observation (about 2.4 × 10<sup>-7</sup> s near epoch seconds) could
  be judged on the wrong side. The example traces and the traces of the
  test suite of `cadl` give the same verdicts with both.
- From `cadl` 0.3.25, `cadl norms-check` implements F.12: it builds the
  model of one contract instance (`--bindings`, `--members`, `--step`,
  `--horizon`; from `cadl` 0.3.26 also `--domain` for
  arithmetic, `--instance` / `--instances` for several instances, and
  `--version` for amendments), runs the questions with PRISM 4.11 (`prism` on PATH;
  explicit engine, with strategies exported), and evaluates every
  witness with the engine of `cadl norms-eval`. `--timeout` bounds the
  time of all runs of PRISM together (600 s by default). Without PRISM
  it reports that nothing was checked, exits with status 0, and can
  still write the model and the properties (`--export`);
  `--require-checker` makes a missing PRISM an error. Storm is not
  used. The translation is tested against `cadl norms-eval` by running
  the generated PRISM text, with an interpreter of the subset it uses,
  on random paths of environment choices and on every path of at most
  two observations (one for several instances and for amendments) of
  small contracts, and comparing the state of every norm at every
  observation; random values of every JSON type are checked to fall
  into a class of the model; the interpreter is in turn compared with
  paths of the PRISM simulator, and the answers of PRISM with explicit
  fixpoints over the reachable states.
- From `cadl` 0.3.28, `cadl norms-check` lets the environment choose
  the start of each of several instances (`--starts any`, the default;
  `--starts together` keeps the earlier model), translates amendments
  together with several instances, translates linear arithmetic, `sum`,
  and `avg` without `--domain` by the faces of the linear arrangement,
  with an exact finite decimal point of every face that holds one, and
  assumes, and reports, a domain inferred from the literals for other
  arithmetic without `--domain`, marking the findings that depend on it. Four or more quantities ordered against each other
  stay refused, for the reason that F.12 gives. Each part is compared
  with `cadl norms-eval` as above: instances with starts of their own on
  random paths and on every path of at most three observations over two
  choices (every order of starts and ends; four in a longer run), amendments of two instances
  with two and with three versions on random paths, which include
  instances that start after an amendment, and linear arithmetic on
  random paths, on values of a decimal grid, many of which lie on the
  hyperplanes, on every point of a grid of two quantities, and on points
  of faces that few points reach; random linear predicates with large
  coefficients and coefficients with prime factors other than 2 and 5 are checked against finite decimal points
  found by brute force. Errors injected into the translation
  were detected by these tests: 5 of 6 for the starts (the sixth lets an
  observation pass at which no instance runs, which changes no trace),
  6 of 6 for amendments with several instances, 2 of 2 for the refusal,
  and 10 of 10 for arithmetic, and 3 of 3 bounds put back into the
  search for a finite decimal point of a face. A review found that the
  first version of this search gave up after a bound and dropped faces
  that hold finite decimal points; the search is now exact. The examples are
  `norms_check_starts.cadl`, `norms_check_amend_v1.cadl` with
  `norms_check_amend_v2.cadl`, and `norms_check_linear.cadl`.
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

## F.12 Design-time checking by a model checker {/* #f12-design-time-checking */}

F.5 judges the norms of one contract instance on one trace. This section
defines a translation of the norms of one contract instance into a
finite Markov decision process (MDP) in the PRISM language
[[Kwiatkowska+, CAV 2011]](./appendix-b-references.md), whose paths are
all the traces of the instance up to a bounded length. A model checker
then answers questions over all behaviours before any trace exists: can
a norm be violated at all, is every activation of an obligation
followed by a way to keep it, are two norms in conflict, is a power ever
exercised. The model has no probabilities: every choice is a
nondeterministic choice of the environment, and the questions are
qualitative. Detecting norms that oblige and forbid the same act is a
known problem of normative multi-agent systems
[[Vasconcelos+, JAAMAS 2009]](./appendix-b-references.md); SymboleoPC
checks properties of legal contracts with the model checker nuXmv
[[Parvizimosaed+, SoSyM 2025]](./appendix-b-references.md). This
section is for processors that offer such a check; it does not change
F.1 to F.11.

### The contract instance

The model is built for one contract and one contract instance. The index
variables of the contract (`i` in `ROBOT[i]`) have fixed values, and
every set of actors has a fixed number of members, `A[lo]` to
`A[lo+n-1]`; for a set with an integer upper bound, n is at most the
declared size. A reference `A[*]`, `A[lo..hi]`, or an unbound `A[i]` in
a message event stands for the members of the instance that the table
of F.3 makes it match. For a set with a symbolic upper bound
(`ROBOT[1..N]`), the instance binds N to the last index of its members,
as a trace that binds N does; quantifiers, aggregates, and wildcard
references in predicates (F.5) then range over a closed domain, the
members of the instance. For a set with integer bounds the domain is
the declared set; its members beyond the n of the instance send no
message and have no value in the model, and the report says so.

### Several contract instances

A model may also hold several instances of the same contract, each
with its own bindings (`--instance`, repeated, or `--instances N` in
the reference implementation). The instances share the observations
(the step and the horizon) and the choices of the environment (the
message events of all of them, and the quantities, which are the same
quantities in every instance). Each instance has its own norm instances
and their states, its own institutional events, its own assumptions and
their failure (so the verdict `excused` is per instance), its own start,
and its own end.

The environment chooses the start of every instance: at each
observation, each instance that has not started may start there, in any
order, and an instance that has not started by the horizon starts at
it. Some instance starts at the first observation, and at every
observation some instance has started and not ended or starts there;
an observation at which no instance runs changes nothing and is left
out, so this loses no trace. In the any end reading each instance ends
at an observation of its own, from its start on; in the full reading all
end at the horizon. Before its start and after its end the state of an
instance does not change, and these observations are not part of it
(F.5). The first observation of an instance is its start in the sense of
F.5: the norms without trigger that are not targets become active
there, a predicate whose rising edge is an event has no previous value
there, and the intervals of its `assume:` items begin there. The trace
of an instance is the sequence of observations from its start to its
end, at the times of the shared observations, with its bindings, and
the model is exact for each of these traces as F.12 states for one
instance. The horizon is shared: an instance that starts at observation s has at
most H − s + 1 observations, and the report says so; a larger horizon
covers longer late instances. A conflict across instances may need different starts: a
reparation of one instance in force when another instance starts with
an obligation that the reparation forbids. A processor MAY offer to let
all instances start at the first observation instead (`--starts
together` in the reference implementation), which needs fewer commands
but does not cover traces whose instances start at different
observations; the report says which reading was used. The questions are asked for every norm of
every instance, named `id@k` for the instance k, and conflicts for every
pair of obligations and prohibitions in the same instance or in two of
them: a conflict across instances arises, for example, when the bearer
of a norm of one instance is obliged to do what a norm of another
instance forbids. A witness holds the trace of every instance over the
same observations, and each is evaluated by F.5 with the bindings of its
instance. The number of instances is at most 4 in version 0.1. The
starts and ends of n instances at one observation multiply the commands
by at most 4<sup>n</sup> (each instance starts, ends, does both, or
neither), and by 2<sup>n</sup> when they start together.

### Amendments

A model may also hold later versions of the file
(`--version FILE`, repeated, in the reference implementation). At every
observation the environment may choose to amend the contract to the
next version, at most once per version and in their order. The
amendment takes effect at that observation before step 1, as F.6
defines and norms-eval applies it: a final norm instance is not
affected; an inactive one takes the definition of the new version, or
is removed when the new version has no norm with its id; an active or
suspended one follows its `on_amendment:`: `discharge` discharges it,
`transform: X` discharges it and activates X, when X is inactive, with
the elapsed time of the old norm, and `carry_over` keeps its state and
its elapsed time under the new definition, discharges it when the new
version has no norm with its id, keeps its pending candidates only when
its content is unchanged, violates an obligation whose elapsed time
exceeds the new deadline (with the reparation of the new definition),
and fulfils a prohibition whose elapsed time exceeds it, both only when
the norm has no pending candidate, which otherwise decides it at step 4; a
norm of the new version that the instance does not have becomes
inactive, and active at once when it has no trigger and is not a target;
an `assume:` item with the same text continues, a new one is evaluated
from the amendment on, and the others are closed; the counts-as rules of
the new version apply from then on. The variables of a norm id of any
version are shared by all versions and sized for each of them (the
largest deadline, interval, and set of candidates); a norm that the
instance does not have (of a version not yet in force, or removed) is
absent. The model is exact for the traces whose `amend` lines name the
given versions in their order, as F.12 states for one version. Not
translated, with the reason: versions with other actors or another
lifecycle, a norm whose kind changes between versions (F.6 discharges
it), a version with a norm or a counts-as rule that is not translated. The questions are
asked for every norm id of any version; a witness that needs an
amendment names the version file in its `amend` line. The amendment
doubles the choices of the environment and multiplies the commands by
the number of versions.

With several instances, the version in force is shared: one amendment
takes effect at the same observation in every instance that runs there
(it has started and not ended, or starts there), as norms-eval applies
the `amend` line that the trace of each of them has at that
observation. An instance that has ended is not amended. An instance
that starts after an amendment is an instance of the version then in
force: at its start it has the norms and `assume:` items of that
version, its trace is evaluated with that version file, and its `amend`
lines name only the later versions; a witness names, for each such
instance, the file whose instance it is. Every instance has the same
sequence of versions, each with the bindings of the instance, and the
model is exact for each of these traces as stated above.

### What the environment chooses

At each observation the environment chooses three things.

1. **Messages.** The message events of the model are the concrete
   messages (sender, receiver, name, arguments) that the message events
   of the translated triggers, `until:`s, contents of obligations,
   prohibitions and powers, and `when:`s of counts-as rules denote in
   the instance. A message that no such term matches does not change
   the state of a translated norm and is left out. The environment
   chooses a subset of the message events; each occurs at most once in
   an observation, in a fixed order (the order of the model).
2. **Values.** A trace may give a quantity any JSON value. The values
   are cut into classes on which every predicate of the model has the
   same value as norms-eval evaluates it (F.5): no value; true; false;
   for numbers, the numbers below, at, between, and above the numeric
   literals compared with the quantity, together with 0 (a number used
   as a condition is true unless it is 0) and, when a boolean literal is
   compared with it, 1 (an ordering compares true as 1); each text
   literal and each name without a value compared with it, and one other
   text; and, for a quantity that is not compared with another
   quantity, one value for lists and objects, which no comparison with a
   literal tells apart (a literal is never a list or an object). One representative stands for each class. The model evaluates
   every predicate on the representatives with the evaluator of
   norms-eval, so a comparison of values of different types (a text with
   a number, a boolean with a number) has in the model the value it has
   in a trace: undefined where norms-eval cannot compare the two values,
   false where it compares them as unequal. The environment chooses one
   class per quantity; combinations of classes that give every predicate
   the same three-valued value are one choice. When a quantity occurs
   only in comparisons with literals and as a condition (also inside a
   quantifier or as the element of `count`), two values that give every
   such comparison the same value give every predicate the same value,
   and the model keeps one value for them; a quantity whose value is used
   in another way (by `min`, `max`, `sum`, `avg`, or arithmetic) keeps a
   value of each class.

   Quantities compared with each other (`A.x < B.y`, `A.x == B.y`,
   `max(...) < A.y`) form groups. Every quantity of a group takes the
   literals of the whole group (so `A.x == B.y AND B.y > 3` gives `A.x`
   the literal 3 too), and for a group of k quantities the classes hold,
   besides each literal, k values in every gap: below the smallest
   literal, between two adjacent literals, and above the largest; likewise
   k texts (ordered as norms-eval orders texts, by Python's order of
   strings) and k objects (which are only equal or not, never ordered).
   Lists are ordered too, lexicographically, but not always comparable:
   two lists whose first different elements have different kinds (a
   number and a text, say) are neither less nor greater, and the
   comparison is undefined, so `[1, "a"] < [1, 2]` is undefined while
   `[1] < [1, "a"]` and `[1] < [1, 2]` are true. Quantities only tested for
   equality get k different lists. For quantities ordered (`<`, `<=`, `>`,
   `>=`) against each other the classes hold lists that realise every
   pattern of pairwise outcomes (equal, less, greater, not comparable)
   that lists of a trace can have: for two quantities `[]`, `[0]` and
   `["a"]` (4 patterns), for three `[]`, `[0]`, `[1]`, `["a"]`, `["b"]`,
   `[{"d": 0}]`, `[0, 0]`, and `[0, "a"]` (29 patterns). The outcomes of
   three lists are decided at the at most two positions where their
   elements first differ, so lists of length at most two whose elements
   realise the outcomes at those positions suffice; an enumeration of all
   lists of length at most two over 0, 1, 2, `"a"`, `"b"`, two objects,
   and null yields the 29 patterns, which these eight lists realise.
   A group of four or more quantities ordered against each other is
   translated by types and patterns, below. A text literal with the character
   U+0000 in such an order is not translated. Numbers are computed
   exactly; the values in a gap are integers or floats strictly inside
   it, since a value of a trace is an integer or a float, and a gap that
   holds fewer than k of them gets all of them.

   This is exact. Take values v<sub>1</sub>, …, v<sub>k</sub> of the
   quantities of a group in a trace, all numbers, and the common sorted
   literals c<sub>1</sub> < … < c<sub>m</sub>. Each v<sub>i</sub> equals a
   literal or lies in one gap, and a gap holds at most k of the distinct
   v<sub>i</sub>. Map a v<sub>i</sub> that equals a literal to it, and the
   distinct v<sub>i</sub> of each gap, in their order, to the first grid
   values of that gap in their order (the gap holds at least as many grid
   values as distinct values of a trace). The map keeps every comparison
   of two quantities of the group (order and equality, within a gap and
   across gaps) and every comparison of a quantity with a literal, so
   every predicate of the group has the same value on the image. The
   argument is the same for texts. Lists and objects are not compared
   with literals, and the comparison of two of them depends only on the
   pattern of outcomes, which the lists and objects of the classes
   realise. For values of mixed types,
   comparisons across types do not depend on the value within a type
   (an ordering compares true and false as 1 and 0, which are literals of
   every group).

   When the classes of the quantities of a component of predicates have
   more than 50 000 combinations, or the component has a group of four
   or more quantities ordered against each other, every group of the
   component whose quantities have the same classes (none has a domain)
   takes its valuations by **types and patterns** instead of the
   product of the classes. By the last remark, a valuation of the group is decided by
   a type for each quantity (no value, true, false, number, text,
   object, list) and, for each type, a pattern of the quantities of
   that type: for numbers and texts, the literal that each one equals
   or the gap that it lies in, and the order, with ties, of those in
   one gap, which take the first grid values of the gap in that order
   (the map above); for objects, which of them are equal; for lists, the
   pattern of pairwise outcomes. The model takes one valuation for each
   choice of types and patterns. The map above, with the lists and
   objects replaced by those of the same pattern, takes every valuation
   of a trace to one of them and keeps every comparison of two
   quantities and of a quantity with a literal, so these valuations
   give the predicates every combination of values that a trace gives
   them. The patterns of n lists are exactly the partitions into equal
   lists with a **series-parallel** order of the classes, an order
   without four classes a, b, c, d such that a < c, b < c, and b < d,
   while a and b, a and d, and c and d are not comparable. No other
   pattern occurs in a trace. The empty list is below every other list.
   The lists that are not empty and have equal first elements form a
   part whose pattern is that of their tails, and two lists of
   different parts compare as their first elements. Those are compared
   as numbers (true and false among them), as texts, or as lists by the
   same rule, or not at all (two kinds, an object, null), so the order
   of the first elements is a disjoint union of chains and of orders of
   lists. Series-parallel orders are closed under disjoint union, under
   putting one order below another, and under replacing each element of
   an order by an order, so by induction on the length the order of the
   lists is series-parallel. Every such pattern is realised: a pattern
   of two classes or more is the series composition (every list of one
   part below every list of the other) or the parallel composition (no
   two comparable) of two smaller patterns, and the lists that realise
   the two parts, prefixed with 0 and 1 for a series composition and
   with 0 and `"a"` for a parallel one, realise it. One to five lists
   have 1, 4, 29, 331, and 5 262 patterns; the 29 of three lists are
   those of the eight lists above. The number of valuations of a group
   is the sum, over the types of its quantities, of the products of the
   numbers of patterns of each type. Four quantities with only the
   literals 0 and 1 (which every group has) have 26 035 valuations,
   where the product of their classes has more than
   29<sup>4</sup> = 707 281 combinations (each has 29 classes that are
   not lists), and 46 285 with one more numeric literal. Five
   quantities ordered against each other have at least 424 213
   valuations, more than the limit of 50 000 (Limits), and are not
   translated; neither are four or more of them whose quantities do not
   have the same classes, or that are in a component with linear
   arithmetic below. The processor names the numbers of patterns per
   type and of valuations in its refusal.

   Arithmetic (`+`, `-`, `*`, `/`), `sum`, and `avg` are **linear** when
   every product has a literal factor and every divisor is a literal
   (`R.x * 0.5 - S.y / 4`, `sum(r.load for r in ROBOT) + 2 * D.r`). For
   linear arithmetic the quantities need no domain. In a component of
   predicates that share quantities and have such arithmetic, every
   quantity without a domain is either a number, a variable of the
   linear arrangement below, or one of its classes that are not numbers;
   a quantity with a domain takes its classes. For each such choice,
   with the other values fixed, every comparison and every number used
   as a condition in the predicates is decided by the signs of linear
   forms of the variables: the difference of the two sides of the
   comparison, with one alternative per defined element of a `min` or
   `max` and one per possible value of a `count`. A value built with
   `+`, `-`, literal factors, `min`, and `max` is obtained from these
   alternatives by least and greatest values alone, so its sign is
   decided by their signs,
   and the value of a `count` is decided by the forms of its elements.
   Every predicate therefore has one value on each **face** of
   the arrangement of the hyperplanes form = 0, the set of points at
   which every form has a given sign (negative, zero, or positive), and
   one point per face suffices. The points are found by a cylindrical
   decomposition: the last variable is eliminated by keeping the forms
   without it and adding, for every two forms with it, the difference of
   their roots in it; a point of every cell of this projection is
   extended in the last variable by the roots of the forms at that point
   and a point below, between, and above them. The order of the roots is
   the same over a cell of the projection, so the cells refine the faces
   and every face gets a point. A value of a trace is an integer or a
   float, a finite decimal, and a face may hold none (`3 * x == 1`). Let
   D be the finite decimals, the integers with the powers of 10 inverted.
   The affine hull H of a face is given by the forms that are zero on it.
   The processor scales a maximal set of independent ones of them to
   integer rows A x = b and brings A, by integer column operations of
   determinant ±1 (extended Euclid), to A V = T, with T lower triangular
   and nonzero on its diagonal in its first r columns and zero after
   them. With x = V y, the points of H have y<sub>1</sub>, …,
   y<sub>r</sub> fixed by T, and y<sub>r+1</sub>, … free. V and
   V<sup>-1</sup> are integer matrices, so x is in D<sup>n</sup> exactly
   when y is: H holds a point of D<sup>n</sup> exactly when the fixed
   y<sub>i</sub> are in D, and its points in D<sup>n</sup> are then
   x<sub>0</sub> + B t for t in D<sup>n-r</sup>, with x<sub>0</sub> in
   D<sup>n</sup> and B the last n − r columns of V. When the fixed
   y<sub>i</sub> are not all in D, no trace reaches the face, and it is
   left out. Otherwise the face, open in H, holds its point p = x<sub>0</sub> +
   B t<sup>\*</sup>. A form f that is not zero at p changes by at most
   δ · Σ<sub>j</sub> |(f B)<sub>j</sub>| when every t<sub>j</sub> moves
   by at most δ, and the forms that are zero at p stay zero on H. The
   processor rounds t<sup>\*</sup> to k decimal places, with k the least
   number for which 10<sup>-k</sup>/2 · Σ<sub>j</sub> |(f B)<sub>j</sub>|
   < |f(p)| for every such f; the rounded point is in D<sup>n</sup> and
   in the face. So a face is left out only when it holds no point of a
   trace, and no bound of the search can drop one. The point of a very
   thin face can need more digits than norms-eval accepts in a number of
   a trace (400); the witness that uses it is then reported as not
   confirmed (exit status 3 in the reference implementation), never as a
   wrong answer without notice. This is exact: the values of a trace lie in
   one face, with the same values that are not numbers, and the point of
   that face gives every predicate the value they give it. A comparison
   with a literal or between two quantities is a form too, so in such a
   component a gap between literals needs one point, and the k values
   per gap above are not needed. The report lists the quantities whose
   numbers are taken from the arrangement.

   Arithmetic that is not linear (a product or a division of two
   quantities) is translated for quantities with a finite domain. CADL
   declares none for the quantities of a norm, so the domain is given to
   the processor, as a range of integers lo..hi per quantity (`--domain`
   in the reference implementation). Such a quantity takes the integers
   of its domain and the values that are not numbers; the answers then
   hold for the traces in which every number of such a quantity is an
   integer of its domain, and the report names the quantities and their
   domains. When no domain is given, the processor assumes the integers
   from one below the smallest to one above the largest numeric literal
   of the predicate (and 0), and the report states this domain as an
   assumption, with the predicate; the answers then hold only for such
   traces. A processor MUST NOT give an answer that holds only under an
   assumed domain without stating the assumption. The reference
   implementation marks every norm whose trigger, `until:`, or content,
   or a counts-as rule, reparation, or power on which it depends, reads
   such a quantity, and every finding about such a norm.
3. **The end.** Whether the instance ends at this observation (step 6
   of F.5). This covers both the end signalled for an instance without
   `lifecycle:` and a terminal lifecycle state.

### Time

Observations take place at the multiples of a **step** Δ: observation n
is at time nΔ. Δ is given, or is the greatest common divisor of the
durations of the translated deadlines, temporal operators, and
assumptions (1 s when there are none); a given Δ must divide each of
them. A deadline d becomes d/Δ steps and an interval w of `within`,
`throughout`, or `until` becomes w/Δ steps.

The model is exact for the traces whose observations are the
multiples of Δ, from 0 to the end of the instance: every time that F.5
compares (the active time of a norm with its deadline, an observation
with the end of an interval) is then a whole number of steps, so the
comparison in steps has the same result as the comparison in seconds,
and an observation that carries nothing is an observation like any
other (F.5). The model does not cover observations between two
multiples of Δ, nor traces that skip a multiple: an observation between
two ticks can detect a passed deadline earlier, or see a value that
holds only between ticks. A check of a property of such traces needs a
smaller Δ.

The **horizon** H bounds the instance: it ends at observation H at the
latest. By default H = 2 + Σ (d + w + 2) over the translated obligations
and prohibitions, with d and w the deadline and the interval of the
content in steps (0 when absent), so that each norm can be activated,
judged, and followed by a reparation in turn. The answers are about
instances of at most H + 1 observations; a larger horizon covers longer
instances.

### The state and the transition

The state of the model after an observation consists of the step
number; whether the instance has ended; for every translated norm its
state (F.5; `discharged` is split into the norms that were in force and
those that the end of the instance found `inactive`, and `violated` into
the verdicts `violated` and `excused`), whether it was activated at that
observation, its active time in steps (counted up to deadline + 1), and,
for a content with a temporal operator, the pending candidates by their
age with the information F.4 needs to decide them (whether an undefined
value was seen; for `until`, also whether the prefix was undefined), and
whether a candidate decided true or not true is still waiting for the
norm to be judged (while it is `suspended`); for every predicate whose
rising edge is an event, its value at the previous observation; for
every temporal assumption, its status, and whether an assumption has
failed; for every power whether it has been exercised, and for every
obligation or prohibition with a reparation whether the reparation has
been activated.

One transition of the model is one observation: the steps of F.5 in
their order ("Order within one observation"), each applied to the state
left by the previous one, for the choice of the environment. After the
end of the instance the state does not change.

### What is translated

The translation translates message events (with literal arguments or
names), institutional events of counts-as rules, and predicates built
from comparisons (`==`, `!=`, `<`, `<=`, `>`, `>=`, `IN`) of a quantity
(`A.q`, `A[k].q`, `A[i].q` with `i` bound, `r.q` for a variable `r` over
a set, `A[j+1].q` for a quantifier variable `j`) with a literal or with
`count` of a comprehension, quantities used as conditions, `AND`, `OR`,
`NOT`, the quantifiers `exists` and `for all`, the aggregates `count`,
`min`, and `max` of comprehensions over a set or a range, comparisons
of two quantities, arithmetic, `sum`, and `avg` (linear ones for every
value, others over a given or assumed domain), and wildcard and range
references in predicates, which
F.5 reads as quantifiers or comprehensions; a content that is one bounded
temporal operator over such predicates; deadlines; `until:`; counts-as
rules with `if:`; powers and their effects; reparations; and `assume:`
items of these forms (for the verdict `excused`). It does not translate
`request` fields, `now`, `state`, and a temporal operator combined with other
operators or nested in another; amendments are translated as described
above. A norm with such a part is reported as **not translated**, with
the reason, and so is a norm whose behaviour depends on one: the
reparation of a norm that is not translated, the target of an effect of
a power that is not translated, and a norm whose trigger, content, or
`until:` is an event of a counts-as rule that is not translated. When an
`assume:` item is not translated, a violation may be `excused` in the
traces, and the model does not tell. Norms that F.10 does not judge
(not evaluable) stay `inactive` in the model, as in the traces.
`guarantee:` items do not change norm states and are not translated.

### Questions

The questions are PRISM properties over labels of the model. Two
readings of the end are used. In the **any end** reading
(`early_end=true`) the instance may end at every observation; it is used
for questions of possibility. In the **full** reading
(`early_end=false`) the instance runs to the horizon; it is used for
questions of necessity, since ending the instance early discharges an
obligation before its deadline and would answer every such question
trivially.

| Question | Reading | Property | Answer |
| --- | --- | --- | --- |
| Can norm n be activated? | any end | `Pmax=? [ F "a_n" ]` | yes when > 0 |
| Can it be violated? | any end | `Pmax=? [ F "v_n" ]` | yes when > 0 |
| Can it be fulfilled? | any end | `Pmax=? [ F "f_n" ]` | yes when > 0 |
| Is it violated in every instance? | full | `Pmin=? [ F "v_n" ]` | yes when = 1 |
| Can every activation be kept? | full | `Pmax=? [ F (!"end" & !(P<=0 [ X "j_n" ]) & P<=0 [ X ("j_n" & !"v_n" & !(P>=1 [ F "v_n" ])) ]) ]` | no when > 0 |
| Are n and m in conflict? | full | `Pmax=? [ F (!"v_n" & !"v_m" & !(P<1 [ G !"v_n" ]) & !(P<1 [ G !"v_m" ]) & P>=1 [ F ("v_n" \| "v_m") ]) ]` | yes when > 0 |
| Can power p be exercised? | any end | `Pmax=? [ F "x_p" ]` | yes when > 0 |
| Can the reparation of n be activated? | any end | `Pmax=? [ F "r_n" ]` | yes when > 0 |

`"a_n"` holds once n has been activated, `"v_n"` when it is violated
(with either verdict), `"f_n"` when it is fulfilled, `"j_n"` in the
state after the observation at which n was activated (whatever its
state after that observation), `"x_p"` once p has been exercised,
`"r_n"` once the reparation of n has been activated, and `"end"` once
the instance has ended. In an MDP, `P>=1 [ F φ ]` says that every
resolution of the choices reaches φ, `!(P<1 [ G !φ ])` that some
resolution avoids φ forever, `P<=0 [ X φ ]` that no choice of the
next observation leads to φ, and `!(P<=0 [ X φ ])` that some choice
does.

An activation **cannot be kept** when, before an observation, some
choice of the environment activates the norm and every choice that
activates it leads to a state from which every continuation violates
it. The question is asked in the state before the activating
observation, because that observation contains the choice of the
environment: an obligation with a deadline of 0 s that is triggered by
a message can be kept, since the content may occur at the same
observation, while a reparation with a deadline of 0 s cannot, since it
is first judged at the next observation (F.5, step 5). The question is
asked at activations, because any obligation with a deadline reaches,
by inaction of its bearer, a state from which it is violated whatever
follows. Two obligations or
prohibitions n and m are **in conflict** when a state is reachable in
which neither is violated, each can still be kept on its own, and every
continuation violates one of them, for example an obligation whose
content a prohibition forbids while both are in force. A conflict may
arise through a reparation: keeping n violates a third norm whose
reparation is m.

### Witnesses

Every answer that something is possible comes with a **witness**: a
trace in the format of the reference implementation, with one
observation at each multiple of Δ, that F.5 evaluates to the claimed
verdict. It is the path of the strategy the model checker gives for the
`Pmax` property, followed, after the target is reached, by observations
without messages and without values until the instance ends. For an
activation that cannot be kept the witness reaches the state before
the activating observation. The processor evaluates by F.5, for every
choice of the environment at that observation, whether it activates
the norm, which must agree with the model, and, for every activating
choice followed by observations without messages and values to the
horizon, that the norm is violated. That every other continuation of
an activating choice violates the norm as well rests on the model
checker; the witness trace is one of the activating choices. When
there are more than 512 choices at that observation, the processor
MAY check a sample of 512 of them instead of every choice, and then
SHALL say in the report that the check was sampled. For a conflict
there are two witnesses from the state of conflict: one keeps n and
violates m, the other keeps m and violates n. For a norm violated in
every instance, the instance without messages and values serves as an
example. A processor SHOULD evaluate every witness by F.5 and report a
witness that does not give the claimed verdict as its own error.

### Limits

Version 0.1 refuses a horizon of more than 1 000 observations, more than
16 message events, more than 8 192 choices of the environment per
observation, and quantities with more than 50 000 combinations of
classes in one group of predicates. A predicate over the members of a
set reads one quantity per member, and the classes of these quantities
multiply: with c classes per quantity, m members, and q quantities read
per member, a group has up to c<sup>m q</sup> combinations, which is
what the limit of 50 000 bounds. For a group of quantities compared
with each other that takes its valuations by types and patterns, the
limit bounds the number of these valuations, times the classes of the
other quantities of the component: the reference implementation
builds the 26 035 valuations of four ordered quantities without other
literals in about 2 seconds, and the 424 213 of five, which it refuses,
would take about 30 seconds. In a component with linear
arithmetic, the combinations are the points of the faces, summed over
the choices of classes that are not numbers, and the same limit
applies. The model checker explores the
reachable states explicitly; the number of transitions is the number of
reachable states times the number of choices, which grows with the
message events and the classes of values. The time of a check grows
with the number of commands of the model (four per choice of the environment) and
of reachable states: an instance with 12 message events (4 096
choices, 16 384 commands) took more than ten minutes. A processor
SHOULD bound the time of the model checker, and of building the model,
and report when the bound is exceeded. The limit on choices is checked
together with the starts and ends of several instances and the versions: a model
may have at most 32 768 commands. A refusal for too many combinations of
classes names the predicates and the quantities that cause it.
