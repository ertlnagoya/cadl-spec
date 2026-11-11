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
`cadl` 0.3.24; D.5). The `unity-csharp` target does not monitor norms.

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
of the reference implementation emit, from `cadl` 0.3.24, one monitor of
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
out of the monitor with a warning. The Solidity monitor uses
fixed-point numbers with six decimals and therefore also refuses `*`,
`/`, and literals with more than six decimals. An observation with
`amend` is refused at run time. A construct is never evaluated in a way
that differs from F.5.

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

**The Solidity monitor.** The Solidity monitor is a contract that keeps the state. It stores the state
of one contract instance. `begin(bindings, request, quantities)` may be
called before the first observation, `observe(t, values, messages,
hasState, state, end)` records one observation, and `finish()` ends the
instance at its last observation. `verdicts()` returns the states and
verdicts of the norms and the marks of the items; `ok()`,
`nextDeadline()`, `observations()`, `ended()`, and the events
`NormChanged`, `ItemChanged`, `Violation`, `InstitutionalEvent`,
`PowerExercised`, and `Unauthorised` report the rest. A value is a
tuple of a name, a kind (null, boolean, number, string), a number, and
a string; numbers, including the time, are fixed-point numbers times
10<sup>6</sup>. The time is an argument of `observe` so that a trace can
be replayed and tested; a deployment MAY pass `block.timestamp` times
10<sup>6</sup>. A malformed observation reverts, which leaves the state
as it was. The contract stores the model of the CADL contract as data,
filled in by its constructor, and interprets it; two libraries hold the
evaluation of predicates and the functions without state, so that each
runtime code stays within the size limit of EIP-170.

**Strings of the file.** No text of the `.cadl` file is code in either
monitor: the Rego carries the contract as one JSON text and writes the
other literals as JSON strings, and the Solidity writes every text as a
hex literal. The input check of `cadl codegen` applies first.

**Verification.** The reference implementation compares both monitors
with `cadl norms-eval` after every observation: the norm states and
verdicts, the item verdicts, the violations, the institutional events,
and the unauthorised acts, on the example traces, the traces of its
test suite, and random traces. The Rego runs in `opa eval`, the
Solidity on an EVM.

## D.6 Cross-reference

- [Appendix A §A.9](./appendix-a-syntax.md#a9-codegen-block) — EBNF.
- [Glossary](./glossary.md) — **Codegen target** definition.
