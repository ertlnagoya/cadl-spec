---
sidebar_position: 14
title: "Appendix D: Codegen Target Catalog"
description: "Catalog of CADL v0.3 code-generation targets: category, emitted artifact, and the module and command of the reference implementation."
---

# Appendix D — Codegen Target Catalog

This appendix enumerates the code-generation targets defined by CADL v0.3
and the mapping to the reference implementation's directory layout.
[Appendix A §A.9](./appendix-a-syntax.md#a9-codegen-block) defines the
EBNF for `codegen:` entries; this appendix
pairs each target name with its **category**, **intended artifact**, and
**implementation location** in the reference implementation
([`cadl`](https://github.com/ertlnagoya/cadl) 0.3).

## D.1 Target catalog

| Target name | Category | Emitted artifact | Reference-impl module | Command |
|-------------|----------|------------------|-----------------------|---------|
| `python` | Runtime code | Python package (actors, contract monitors, protocols, regime controller, metrics, runtime; for a file that declares `norms: 0.1`, also a monitor of the norms of [Appendix F](./appendix-f-norms.md)) | `cadl.codegen` | `cadl codegen -t python` |
| `solidity` | Institutional contract | Solidity [[Solidity Documentation]](./appendix-b-references.md) smart contracts, one per contract; for a file that declares `norms: 0.1`, also a monitor of the norms per contract (D.5) | `cadl.codegen.solidity` | `cadl codegen -t solidity` |
| `opa` | Institutional policy | Rego / OPA [[Open Policy Agent]](./appendix-b-references.md) policies, one per contract; for a file that declares `norms: 0.1`, also a monitor of the norms per contract as a step function (D.5) | `cadl.codegen.opa` | `cadl codegen -t opa` |
| `unity-csharp` | Runtime code | Unity C# classes for the lifecycles and monitors of [Appendix E](./appendix-e-sos-dsl.md) | `cadl.codegen.unity_csharp` | `cadl codegen -t unity-csharp` |
| `unity` | Simulator config | JSON for a Unity-based simulator | `cadl.sim.gen_unity` | `cadl sim-gen -t unity` |
| `go` | Simulator config | JSON for a Go-based simulator | `cadl.sim.gen_go` | `cadl sim-gen -t go` |
| `python` (simulator) | Simulator config | YAML for a Python-based simulator | `cadl.sim.gen_python` | `cadl sim-gen -t python` |
| `agent-rego` | Boundary policy | Rego policy that returns the allow / deny / escalate decision of [Appendix G](./appendix-g-agents.md) for a message | `cadl.codegen` | `cadl codegen -t agent-rego` |
| `agent-cedar` | Boundary policy | Cedar policies and a side table for the statically decidable part of [Appendix G](./appendix-g-agents.md) | `cadl.codegen` | `cadl codegen -t agent-cedar` |
| `ros2` | Runtime node | ROS 2 [[Macenski+, 2022]](./appendix-b-references.md) node scaffolds | not implemented in `cadl` 0.3 | — |
| other name (user-defined) | Plugin | Whatever the user plugin emits | no plugin mechanism exists in `cadl` 0.3; other target names are rejected on the command line and get a warning in a `codegen:` entry | — |

The name `python` denotes the runtime-code target in a `codegen:` entry;
the simulator configuration of the same name is requested with
`cadl sim-gen`. The Python simulator config therefore cannot be
requested from a `codegen:` entry in v0.3; use `cadl sim-gen -t python`.
In the reference implementation (`cadl` 0.3) the target is
selected on the command line as shown in the last column; `codegen:`
entries in the file are parsed but do not yet drive generation. From
`cadl` 0.3.9, an entry that names a target the implementation cannot
emit gets a warning (D.4).

For a file that declares the norms extension
([Appendix F](./appendix-f-norms.md)), the `python` target also emits
the module `norms_monitor.py` (from `cadl` 0.3.22). It monitors the `norms:` and `counts_as:` blocks and the
`assume:` and `guarantee:` items of each contract, including the items
with temporal operators, for one contract instance while the system
runs: it is given one observation at a time and returns the norm
instances and items whose state or verdict (`pending`, `fulfilled`,
`violated`, `excused`) changed. Unlike the other modules of the package,
it does not import `cadl`: it carries the declared actors and the
contracts as data (one JSON text) and the evaluation code of
`cadl norms-eval`, and uses only the standard library of Python. The
generator checks the module before it writes it and writes nothing when
the check fails.
[F.10](./appendix-f-norms.md#f10-reference-implementation-status) gives
the details. The `solidity` and `opa` targets leave the items with
temporal operators out of the contract policy, with a comment, and
monitor them, with the norms, in a separate file per contract (from
`cadl` 0.3.25; D.5). The `unity-csharp` target does not monitor norms.

## D.2 Two-tier generator layout

The reference implementation splits codegen into two tiers, reflecting
whether the output is **code that enforces or executes the contracts**
or a **configuration for a simulator**:

```
src/cadl/
├── codegen/            ← code tier (cadl codegen)
│   ├── *_gen.py        ← Python runtime package
│   ├── solidity/       ← smart-contract enforcement of contracts
│   ├── opa/            ← policy enforcement (Rego) of contracts
│   └── unity_csharp/   ← Unity C# lifecycle / monitor runtime
└── sim/                ← simulator tier (cadl sim-gen)
    ├── ir.py           ← three-layer simulator IR
    ├── gen_unity.py
    ├── gen_go.py
    └── gen_python.py
```

A single CADL source file MAY declare targets from both tiers in one
`codegen:` block. The processor SHOULD dispatch each target to its tier
independently.

## D.3 Selection guidance

- Pick **`unity`** when the experiment is a multi-agent simulation with
  graphical inspection, and **`unity-csharp`** when contract lifecycles
  and monitors ([Appendix E](./appendix-e-sos-dsl.md)) are to run inside
  that simulation.
- Pick **`python`** when you want an executable runtime skeleton of the
  actors, contract monitors, and protocols, or when the norms of
  [Appendix F](./appendix-f-norms.md) are to be monitored while the
  system runs; **`ros2`** is reserved for
  driving actual robots and is not implemented in `cadl` 0.3.
- Pick **`solidity`** when the Institution-layer contracts must be
  enforced on-chain (blockchain deployment).
- Pick **`opa`** when contracts should be enforced as policies at API
  / service boundaries (policy-as-code).

Multiple targets in one file are permitted but the resulting
artifacts are independent — the CADL toolchain does not guarantee
runtime interoperability between, e.g., a Unity simulator config and a
Solidity contract generated from the same source.

## D.4 Conformance

A processor is **codegen-core-conforming** if it supports at least one
target from each tier (for example `unity` together with `solidity` or
`opa`).

A processor that cannot emit a requested target MUST report a clear
diagnostic (for example, "codegen target `ros2` is not supported by
this processor") rather than silently skipping it.

## D.5 Norms monitors of the `opa` and `solidity` targets {/* #d5-norms-monitors-of-the-opa-and-solidity-targets */}

For a file that declares `norms: 0.1`, the `opa` and `solidity` targets
of the reference implementation emit, from `cadl` 0.3.25, one monitor of
the norms per contract next to the contract policy: `opa` the Rego
package `cadl.norms_monitor.<contract>` in
`norms_monitor_<contract>.rego`, and `solidity` the contract
`<Contract>NormsMonitor` in `<Contract>NormsMonitor.sol`. A monitor
evaluates the `norms:` and `counts_as:` blocks and the `assume:` and
`guarantee:` items of one contract instance, including the items with
temporal operators, which the contract policy leaves out. One
observation is processed in the order of F.5, as `cadl norms-eval`
processes it.

**Supported constructs.** Both monitors evaluate message events (with
the actor patterns of F.3 and arguments), institutional events,
predicates with the three-valued reading of F.5 (comparisons, `IN`,
`AND`, `OR`, `NOT`, arithmetic, quantities with and without an actor,
fields of `request`, `now`, `state`), triggers, `until:`, deadlines,
reparations, the effects of powers, counts-as rules with `if:`, and the
temporal operators of F.4, also nested. They do not evaluate
quantifiers, aggregates, wildcard or range references in predicates, an
index that is an expression (`A[i+1]`), or amendments (F.6). A contract
that uses one of these in a norm, a counts-as rule, or an `assume:` item
gets no monitor, and the processor reports which construct prevents it;
such a `guarantee:` item, on which no other verdict depends, is left
out of the monitor with a warning. Both compute exactly (F.5): the Rego
monitor with decimal numbers, so it refuses `/`, whose result is not
always one. The Solidity monitor uses
fixed-point numbers with six decimals and therefore also refuses `*`,
`/`, and literals with more than six decimals; outside the content of a
norm it scans the window of a temporal operator once, as the
observations arrive, and therefore refuses there a temporal operator
inside another one; in the content of a norm it refuses six or more
temporal operators (five or more before `cadl` 0.3.31) and the temporal
operators inside another one whose values are not decided in the order
of the observations (see below);
and it refuses a contract whose
creation code would exceed the 49152 bytes of EIP-3860 or whose runtime
code would exceed the 24576 bytes of EIP-170 (`cadl codegen` estimates
both sizes from above). In
a `guarantee:` item these lead to the item being left out, as above. An
observation with `amend` is refused at run time.

**The Rego monitor.** The Rego monitor is a step function. OPA keeps no state, so the
policy computes the next state of the monitor from the previous state
and one observation; the host stores the state between calls. The rule
`result` takes as `input`:

| Key | Meaning |
|-----|---------|
| `state` | The state returned by the previous step; null or absent before the first observation |
| `observation` | One observation in the trace format of `cadl norms-eval` (`t`, `values`, `messages`, `state`, `end`; `bindings` and `request` only in the first) |
| `finish` | `true` instead of an observation: the instance ends at its last observation (step 6 of F.5) |
| `bindings`, `request` | Bindings and request of the instance, when the first observation does not carry them |
| `quantities` | Names of quantities written without an actor, added to the known names (F.5) |

`result` has `state` (the next state), `changes` (each norm instance
whose state or verdict changed, with the previous ones, and each item
that was decided), `violations`, `institutional_events`,
`powers_exercised`, `unauthorised`, `verdicts` (the state and verdict
of every norm, the status of every assumption, the verdict of every
guarantee, and `ok`), `ended`, and `next_deadline` (the earliest
deadline of an active obligation or prohibition). For an observation
that is malformed, `result` has `error` and the unchanged `state`. The
state is a JSON object with these keys:

| Key | Content |
|-----|---------|
| `format` | `"cadl-norms-monitor-state/1"` |
| `contract` | Id of the contract; a state of another contract is refused |
| `n` | Number of observations of the instance processed so far |
| `t` | Time of the last observation, also of one after the end |
| `ended`, `end_index` | Whether the instance has ended, and at which observation |
| `ignored` | Number of observations after the end (they have no effect) |
| `bindings`, `request` | As given with the first observation |
| `known` | The known names of quantities (F.5), sorted |
| `values` | The current value of every quantity observed so far |
| `lc` | The lifecycle state after the last observation (null without `lifecycle:`) |
| `buffer` | The observations that are still read: `i` (index in the instance), `t`, `values` (the values at it), `st` (the lifecycle state before it). It holds the last observation, the observations from the oldest candidate of a norm whose temporal content is not yet decided, and, while a temporal item is not decided, all observations from the first. Older observations are dropped |
| `norms` | One record per norm, in the order of the contract: `id`, `state`, `verdict`, `at` and `act` (time and index of the first activation), `since` and `before` (start of the current active stretch and the active time before it, for the deadline), `from` (the first observation at which a reparation is judged), `cands` (indices of the observations at which a temporal content is not yet decided) |
| `items` | `assume` and `guarantee`: per item `value` (null, `true`, `false`, or `"undefined"`), `seen` (a state predicate held at some observation), `verdict`, `time` |
| `failed_at` | Time at which the first assumption failed, or null |

**The Solidity monitor.** The Solidity monitor is a contract that
keeps the state of one contract instance. Its constructor takes the
address of the reporter (the deployer when it is the zero address,
`reporter()`); only the reporter may call `begin`, `observe`,
`addQuantities`, and `finish`. The reporter cannot be changed: if its
key is lost, the monitor stays as it is and records no further
observation. `begin(bindings, request, quantities)`
may be called before the first observation, `observe(t, values,
messages, hasState, state, end)` records one observation,
`addQuantities(names)` adds names of quantities written without an
actor, and `finish()` ends the instance at its last observation.
`verdicts()` returns the states and verdicts of the norms and the marks
of the items, in the order of `normIds()`; `contractId()`, `ok()`,
`nextDeadline()`, `observations()`, `lastT()` (the time of the last
observation, also of one after the end), `ended()`, and `ignored()` (the
number of observations after the end) can be read, and the events
`NormChanged`, `ItemChanged`, `Violation`, `InstitutionalEvent`,
`PowerExercised`, and `Unauthorised` report the changes of each call. A value is a
tuple of a name, a kind (null, boolean, number, string), a number, and
a string; numbers, including the time, are fixed-point numbers times
10<sup>6</sup>. The time is an argument of `observe` so that a trace can
be replayed and tested; a deployment MAY pass `block.timestamp` times
10<sup>6</sup>. A malformed observation reverts, which leaves the state
as it was. The contract stores the model of the CADL contract as data,
filled in by its constructor, and interprets it. The model and the
state are one struct in storage, which six libraries read and change:
they hold the evaluation of predicates, the functions without state,
the judgement of contents with one temporal operator, that of contents
with two to five or with one inside another, the items, and the events,
messages, counts-as rules and powers, so that each runtime code stays within the size limit of
EIP-170. From `cadl` 0.3.28 the runtime code of the contract is
estimated at 16 840 bytes, which leaves more than
7 × 10<sup>3</sup> bytes below that limit (24 410 in 0.3.27); from `cadl`
0.3.30, without the `frozen` flag of a norm, which the engine no longer
needs (F.7, N-16), it is estimated at 16 670 bytes, and `CadlNormsActs`
at 12 080 bytes (12 170 before). From `cadl` 0.3.29 the
libraries `CadlNormsMulti` and `CadlNormsEval` are estimated at 7 490 and
10 410 bytes (4 430 and 10 310 in 0.3.28). From `cadl` 0.3.31, which
keeps the values of a content with five temporal operators in four words
and treats a nested operator as a chain of levels, `CadlNormsMulti`,
`CadlNormsEval` and `CadlNormsWindows` are estimated at 10 120, 11 440 and
5 490 bytes (7 490, 10 410 and 5 230 in 0.3.30). The size of the code does
not depend on the number of temporal operators or of levels. The cost of an
observation does not grow with the number of earlier observations: the
window of a temporal operator is scanned once (each observation adds
its own value to the scans that are open), a value is found by binary
search, and the values that no later step can read are deleted, a few
per new value.

*One temporal operator.* The content of a norm with one temporal
operator is decided, at the observation of a candidate, up to that
operator: the rest of the content has its value there (its names are
fixed, see the differences below), so the content is a function of the
value of the operator, and the monitor reads it there with the
operator undecided, true, and false. The content is then true whatever
the operator gives (the candidate holds at once), never true (no
candidate), true exactly when the operator is true, true exactly when
it is false, true when it is true or false, or never true but
undecided until the operator is decided (the candidate keeps the norm
pending, as F.5 does). An undefined operator makes the content true
only when the content is true with the operator undecided, so these
cases are all: a comparison, an arithmetic operation, and the left
side of `IN` are undefined when an operand is, and `AND`, `OR`, and
`NOT` give a true or false result for an undefined operand only when
they give it for an undecided one. This covers an operator under `NOT`,
inside a comparison (`within(3s, p) == flag`, `until(p, q, 3s) <= A.y`),
and in `IN`. A norm keeps three queues of candidates, oldest first:
those that hold when the operator is true, those that hold when it is
false, and those that only wait for it; a candidate that holds in both
cases is in the first two. The second queue reads the dual operator on
the negated operands: `NOT within(d, p)` is `throughout(d, NOT p)`,
`NOT throughout(d, p)` is `within(d, NOT p)`, and `NOT until(p, q, d)`
is the release below. Each queue keeps, with what the observations
since its last judgement say about the operands: for `within`, the
first time the operand is true; for `throughout`, the first time it is
false and the first time it is undefined; for `until`, the first
observation at which `q` is true and the first at which `p` is not;
for the release, these two, the first observation at which `q` is not
false, and the first at which `p` is false. Together with the last
candidate whose window has seen an operand that rules it out, these
decide every candidate by comparing times (for `throughout`, the
newest candidate whose window ended before the first false or
undefined value holds), with a few binary searches over the queue and
without scanning a window per candidate; this holds also while the
norm is suspended. Decided candidates are deleted a few per
observation.

*Release.* Write the values of a predicate at an observation in the
three values of F.5 (true, false, undefined) with the connectives of
Kleene, and let W be the observations of the window of candidate k.
By F.4, `until(p, q, d)` at k is

∨<sub>j ∈ W</sub> ( q<sub>j</sub> ∧ ∧<sub>k ≤ i &lt; j</sub> p<sub>i</sub> ),

decided at the first observation at which a term is true, at the first
at which `p` is false (every later term is false), or when the window
is over, and undecided before. The negation of Kleene is an involution
and satisfies the laws of De Morgan, so

NOT `until(p, q, d)` = ∧<sub>j ∈ W</sub> ( ¬q<sub>j</sub> ∨ ∨<sub>k ≤ i &lt; j</sub> ¬p<sub>i</sub> ),

the release of ¬p and ¬q: ¬q holds at every observation of the
window up to and including the first at which ¬p holds. `NOT` keeps an
undecided value undecided and turns a decided value into its negation,
so the release is decided at the same observations as `until`. It is
true exactly when every term is false. Let b be the first observation
of W at which `p` is false, or the last of W when there is none. A
term with j after b is false through p<sub>b</sub>. A term with j at or
before b has no false p<sub>i</sub>, so it is false exactly when
q<sub>j</sub> is false. Hence the release is true exactly when `q` is
false at every observation of W up to b, and it is false or undefined
otherwise; with undefined values this is the same statement, since a
term with an undefined q<sub>j</sub> and no false p<sub>i</sub> is not
false. The queue of the release therefore holds a candidate when `p` is
false inside its window with `q` false before and at that observation,
or when its window is over with `q` false in it; it removes every
candidate when `p` is false (each window is then decided), the
candidates for which `until` becomes true (`q` true with `p` true since
the candidate), and those whose window is over; a candidate that has
seen `q` not false is kept, undecided, until it is decided in one of
these ways.

*Several temporal operators.* For a content with m temporal operators,
2 ≤ m ≤ 5 (m ≤ 4 before `cadl` 0.3.31), the monitor reads the content once
at the observation of a candidate and obtains its value for each of the
4<sup>m</sup> combinations of values of the operators (undecided, true,
false, undefined), as bits of one 256-bit word for m ≤ 4 and of four
words for m = 5 (combination c is bit c mod 256 of word ⌊c / 256⌋); this
covers a comparison of two operators (`within(…) == throughout(…)`).
An `IN` with temporal operators in its operands is read once for each
combination, at most 4<sup>5</sup> = 1024 times, a bounded cost. An observation decides an
operator for a range of candidates at a time: the candidates whose
window is over become false (`throughout`: true), or undefined when an
operand was undefined in the window; an operand true for `within`,
false for `throughout`, or `p` false for `until` decides every open
window; `q` true for `until` decides the candidates with `p` true since
them. Binary searches over the candidates find these ranges. The
candidates are the leaves of a segment tree in storage. A node gives
each operator a state: decided, or undecided and taking one of the four
values in the future considered. For each of the 5<sup>m</sup>
combinations of states it records whether a candidate below holds in
that future and whether one is undecided in it. A decided operator
leaves no value in the node: its value is already part of the values of
the content that the candidate keeps for the other operators. The
2 × 5<sup>m</sup> bits fit in one word for m ≤ 3 (250 bits, with 6 bits
for the tags of the lazy propagation), in five words for m = 4 and in 25
for m = 5 (the states of the fourth and fifth operators select the
word). Deciding operator i to
the value v moves the combinations in which i is undecided and takes v
to those in which it is decided, and drops the other combinations in
which it is undecided: for the first three operators a shift and a mask
of each word, for the fourth and fifth an OR of words. This is propagated lazily,
so an observation changes a few ranges per operator, each in steps that
grow with the logarithm of the number of candidates, and the root says
whether a candidate holds and whether one is undecided. The cost of an
observation therefore does not grow with the number of observations for
any m ≤ 5, and it grows with m by a factor measured below. Six or more
temporal operators in one content are refused: a node would have 125
words, and an observation, which costs up to 1.0 × 10<sup>7</sup> gas with
five operators in the measurements below, would cost about five times as
much, of the order of the gas limit of a block. (Up to `cadl` 0.3.28 a
node kept the values of the decided operators too, 7<sup>m</sup> pairs,
which allowed two operators in one word; up to 0.3.30 five operators
were refused, since their 4<sup>5</sup> values do not fit in one word.)

*A temporal operator inside another one.* In the content of a norm, the
operand of `within(d, …)` or `throughout(d, …)` may be another
`within(e, …)` or `throughout(e, …)`, or its negation, whose operand is
either without a temporal operator (`within(5s, throughout(2s, p))`,
`throughout(3s, NOT within(1s, p))`) or, from `cadl` 0.3.31, again such
an operator (`within(5s, throughout(3s, NOT within(1s, p)))`, with any
number of levels). Call the operators below the outer one the levels of
the chain: the first level reads p, each further level reads the values
of the level below it (negated when `NOT` stands between them), and the
outer operator reads the values of the last level. The value of a level
at an observation j is known only later; the level above reads the
sequence of these values, each with the time t<sub>j</sub> of its
observation. The monitor decides every level for every observation from
the first candidate of the activation on, with a summary per level,
and feeds the decided values of each level to the level above, and those
of the last level to the outer operator, in the order of the
observations and in runs of equal values; the outer operator is one
operator of the segment tree above. For a level with operator O and
duration e, call O's decisive value (true for `within`, false for
`throughout`) decisive and the other truth value final; for one
observation n, let G be the first observation whose value below is not
fed after n (n + 1 for the first level, which reads p at every
observation), F the first observation whose own value was not decided
at n − 1, and u the last observation with an undefined value fed before
n.

1. If the values fed to a level are decided for a prefix of the
   observations at every n, so are its own values. Let the value of
   observation j be decided at n and i &lt; j. If it is decisive by a
   decisive value at an observation x of the window of j, either x is in
   the window of i, which decides i, or the window of i ended before
   t<sub>x</sub> ≤ t<sub>n</sub>, and every value of it is fed since x is,
   which decides i. If it is decided because the window of j is over and
   every value in it is fed, the same holds for the window of i, which
   ends no later. p is decided at every observation, so by induction the
   decided values of every level are those of the first observations.
2. Let the runs fed at n cover the observations up to G − 1, with their
   own values. Let τ be t<sub>G</sub> when G ≤ n and t<sub>n</sub>
   otherwise. An observation j ≥ F is decided at n exactly when a
   decisive value fed at n is in its window, that is j is in [a, e] for a
   run [s, e] of decisive values, with a the first observation at or after
   t<sub>s</sub> − e (a binary search over the times), or when
   t<sub>j</sub> + e &lt; τ: then every value of its window is fed and
   the window is over. No decisive value fed before n is in the window of
   such a j, as it would have decided j then. A decided value is decisive
   when a decisive value is in its window; otherwise it is undefined when
   an undefined value is in its window, and final otherwise. An undefined
   value fed before n is in the window of j ≥ F exactly when j ≤ u, since
   the window of an observation not decided at n − 1 reaches at least
   G<sub>n−1</sub> − 1 ≥ u, and one fed at n is in it exactly when j is
   in [a, e] for a run [s, e] of undefined values. By 1 the decided
   observations are those before the largest of F, the first observation
   with t<sub>j</sub> + e ≥ τ, and e + 1 for the runs of decisive values.
   The value changes only at some a, e + 1, or u + 1; the summary keeps
   F and u only. At every observation the runs fed to a level, and to the
   outer operator, have all their undefined runs before every true or
   false run: the window of an observation not decided at n − 1 reaches
   G<sub>n−1</sub> − 1, and if j<sub>1</sub> &lt; j<sub>2</sub> are
   decided at n with j<sub>1</sub> true or false and j<sub>2</sub>
   undefined, the value that decides j<sub>1</sub> lies in the window of
   j<sub>2</sub> too (by induction over the levels, starting from the one
   run of p). Hence a level gives at most three runs: undefined, final,
   and decisive, in this order, at any depth, and the gas per level does
   not depend on the depth. The first level receives one run, the value
   of p at n, and gives undefined up to u, final, and decisive from a
   when p is decisive at n.
3. The outer operator (duration d) treats its candidates in the same
   way. A run [s, e] of decisive values decides the candidates k ≤ e with
   t<sub>k</sub> + d ≥ t<sub>s</sub>. Then, with τ as in 2 for the last
   level, a candidate with t<sub>k</sub> + d &lt; τ that is not decided
   becomes undefined when it is at or before u or in such a range of a
   run of undefined values, and final otherwise. The decisive runs are
   applied first, so a candidate whose window has a decisive and an
   undefined value is decisive. The candidates whose window holds an
   undefined value and is not over keep the mark u.
4. These are the values of F.5 at every observation. By 1 the values that
   F.5 reads in the window of candidate k at n are decided exactly when
   they are fed, so a decisive value decides k at the same observation,
   and to the same value. Without one, F.5 gives undecided while the
   window is not over or holds an undecided value. If G ≤ n, the value
   at G is undecided: when k ≤ G and t<sub>G</sub> ≤ t<sub>k</sub> + d
   it is in the window of k; when t<sub>G</sub> > t<sub>k</sub> + d every
   value of the window is fed and the window is over, since t<sub>n</sub>
   ≥ t<sub>G</sub>; when k > G, the value at k is undecided by 1 and k is
   in its own window, while t<sub>G</sub> ≤ t<sub>k</sub> leaves the
   window of k open in 3. If G = n + 1, every value is fed and τ =
   t<sub>n</sub>. In each case the monitor decides k at the observation at
   which F.5 does, from the same values, and so to the same value; the
   same argument with 2 in place of 3 shows it for each level.

An observation evaluates p once and, per level, makes one binary search
over the times and one per run fed, and feeds a bounded number of runs
to the outer operator, each with a few binary searches and range updates
of the tree, so its cost is bounded as above for any fixed chain.
Refused are `until` in a nesting and an operand of a level or of the
outer operator that is more than another level or its negation
(`within(5s, throughout(2s, p) AND r)`). In them a value of the operand
can be decided before that of an earlier observation, and feeding the
values in order would decide later than F.5. In
`within(5s, until(p, q, 3s))`, with p undefined and q false at t = 0 and
p and q true at t = 1, the inner value at t = 1 is true at once, so the
outer operator at t = 0 is true at t = 1 in F.5, while the inner value at
t = 0 stays undecided until its window ends after t = 3. In
`within(d, throughout(e, p) AND r)` a false r decides the operand at
once. For such an operand, deciding the values out of order would not
keep the cost bounded:
after a gap in the times, one observation decides the inner values of
all observations of a long stretch at once, and the operand is then true
exactly at those with r true, so the candidates whose window holds such
an observation become true and the others stay as they were, which can
alternate from one candidate to the next as often as there are
candidates; one observation would change that many ranges of the tree.
For `until` in a nesting no construction with bounded gas is known
either. Whether these contents can be monitored with bounded gas in some
other way is left open.

The tree is not pruned: each activation of such a norm
adds at least three storage slots per candidate (its observation, its
time, its leaf, and the inner nodes above it), which stay in storage;
the gas of an observation does not grow with them. Every monitor also
keeps two entries per observation (its time and the lifecycle state
before it), which are not deleted either.

*Gas.* The figures below are measured with one value per observation;
with two values an observation costs about 20 % more. In the tests, an observation of the example of F.8 costs about
6.4 × 10<sup>5</sup> gas over 320 observations at one per second while
the 300-second window of its assumption is open and after it (at most
1.2 × 10<sup>6</sup>, at the first observation). At one observation per
second into windows of 1000 seconds in which every candidate stays
undecided, an observation costs, at the 320th and at the 1000th
observation, 4.4 × 10<sup>5</sup> and 4.5 × 10<sup>5</sup> gas for the
content `throughout(1000s, …)`, 5.2 × 10<sup>5</sup> for
`NOT until(…, 1000s)`, 5.1 × 10<sup>5</sup> for
`throughout(1000s, …) == true`, and 5.9 × 10<sup>5</sup> for
`within(1000s, …) OR throughout(1000s, …)` (at most
8.0 × 10<sup>5</sup>); from `cadl` 0.3.29 the last content costs
6.1 × 10<sup>5</sup> and 6.2 × 10<sup>5</sup>, with a third operator
(`… OR within(1000s, …)`) 8.4 × 10<sup>5</sup> and 8.5 × 10<sup>5</sup>
(at most 1.1 × 10<sup>6</sup>), with a fourth 1.8 × 10<sup>6</sup> and 1.9 × 10<sup>6</sup>
(at most 2.6 × 10<sup>6</sup>; the factors over two operators are
about 1.4 for three and 3.0 for four, from the five words of a node), and the nested
contents `within(1000s, throughout(500s, …))` and
`throughout(1000s, within(10s, …))` 4.9 × 10<sup>5</sup> and
5.0 × 10<sup>5</sup>, and 6.0 × 10<sup>5</sup> and 6.3 × 10<sup>5</sup>
(at most 8.3 × 10<sup>5</sup>; the inner values of the second are
decided from the eleventh second on, and each then decides the
candidates of its window false). From `cadl` 0.3.31, with the levels,
these two nested contents cost 5.1 × 10<sup>5</sup> and 5.2 × 10<sup>5</sup>,
and 6.2 × 10<sup>5</sup> and 6.5 × 10<sup>5</sup> (at most
8.5 × 10<sup>5</sup>), three levels
(`within(1000s, throughout(500s, within(10s, …)))`) 5.5 × 10<sup>5</sup>
and 5.6 × 10<sup>5</sup> (at most 7.6 × 10<sup>5</sup>), four operators
1.9 × 10<sup>6</sup> and 2.0 × 10<sup>6</sup> (at most 2.8 × 10<sup>6</sup>),
and five operators (`… OR within(1000s, …)`) 6.7 × 10<sup>6</sup> and
6.9 × 10<sup>6</sup> (at most 1.0 × 10<sup>7</sup>; the factor over four
is about 3.5, from the 25 words of a node). `cadl` 0.3.25 read every candidate at every
observation and used 1.3 × 10<sup>7</sup> gas at the 320th. A monitor whose observation would exceed the block gas limit cannot record it and does
not recover, so the bound matters. The generated file is to be compiled with solc
0.8.24 to 0.8.37 (checked; its pragma is `>=0.8.24 <=0.8.37`) and
`--optimize --optimize-runs 1`, as its header says: without the
optimizer the runtime code exceeds the limit of EIP-170, and the
estimates of the creation code and of the runtime code hold for the
optimizer with 1 or 200 runs.

**Differences from `cadl norms-eval`.** The monitors decide each
observation with the observations received so far, as the Python
monitor does: a passed deadline is detected at the next observation,
the instance ends with `finish` or with an observation that ends it,
and the names of quantities written without an actor are those given
with `quantities` (or `addQuantities`) and those observed so far. Where
they differ from `cadl norms-eval` (which this appendix does not
change):

- Numbers and times are exact in both monitors, as in `cadl norms-eval`
  (F.5). The Rego monitor reads a number as the decimal it is written as
  and keeps numbers and times in its state as `{"$q": [n, k]}`, the
  number n / 10<sup>k</sup>; it refuses `/` (a quotient is not always a
  decimal number), and a product whose exact value could have more than
  4095 decimals (every number has at most 400, F.5). Both monitors, like
  `cadl norms-eval`, refuse a number outside the range of F.5 in an
  observation, its request or its bindings. The
  Solidity monitor holds six decimals and refuses `*`, `/`, and literals
  with more decimals; its host passes numbers with at most six decimals.
  For the inputs that meet these limits, the verdicts agree with
  `cadl norms-eval`. The results of the Rego monitor write times as JSON
  numbers for reference.
- The monitors refuse inputs that `cadl norms-eval` accepts: a binding
  that is not an integer written as one (`1.0` and `1e2` are refused) or
  a string, a value of `values` that is a list or an object (in Rego a
  list anywhere in `request` too), in Rego two keys of `values` that
  differ only in whitespace, and an observation with `amend`. The Solidity monitor
  takes the request as leaves (`"a.b"`), the names of values in ASCII,
  and the actors and names of messages in ASCII letters, digits, and
  `_`. It receives bindings as integers or strings, so its host refuses
  a binding written with a fraction or an exponent.
- In Solidity, a bare name read inside a temporal operator (a quantity
  such as `flag` in `throughout(10s, A.s == flag)`, as opposed to a
  symbol) must be given in `begin` (or `addQuantities` before the first
  observation) when it is a quantity, or be observed at the first
  observation; a name that is a binding is not affected: the scans keep the values they have read,
  so an `observe` or `addQuantities` that would make such a name known
  later is refused (it reverts). `cadl norms-eval` and the Rego monitor
  read the earlier observations again with the new name.
- The Rego monitor trusts the state it is given: it checks the format
  and the contract of the state, not its content. The host keeps the
  states it stores intact and passes each one to the next step only.
- Reasons, warnings, and the timeline of `cadl norms-eval` are not
  reported.

**Strings of the file.** No text of the `.cadl` file is code in either
monitor: the Rego carries the contract as one JSON text and writes the
other literals as JSON strings, and the Solidity writes every text as a
hex literal. The input check of `cadl codegen` applies first.

**Verification.** The reference implementation compares both monitors
with `cadl norms-eval` after every observation: the norm states and
verdicts, the item verdicts, the changes, the violations (with severity
and sanction), the institutional events, the exercised powers, the
unauthorised acts, and the next deadline, on the example traces, the
traces of its test suite, random traces, and a long trace. The Rego
runs in `opa eval`, the Solidity on an EVM.

## D.6 Cross-reference

- [Appendix A §A.9](./appendix-a-syntax.md#a9-codegen-block) — EBNF.
- [Glossary](./glossary.md) — **Codegen target** definition.
