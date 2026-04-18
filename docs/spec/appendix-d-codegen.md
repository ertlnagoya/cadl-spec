---
sidebar_position: 14
title: "Appendix D — Codegen Target Catalog"
---

# Appendix D — Codegen Target Catalog

This appendix enumerates the code-generation targets defined by CADL v0.1
and the mapping to the reference implementation's directory layout.
Appendix A §A.9 defines the EBNF for `codegen:` blocks; this appendix
pairs each enumerated `target_name` with its **category**, **intended
artifact**, and **implementation location** in `cadl_repo`.

## D.1 Target catalog

| `target_name` | Category | Emitted artifact | Reference-impl module |
|---------------|----------|------------------|-----------------------|
| `unity` | Simulator config | JSON for the Unity runtime | `cadl.sim.gen_unity` |
| `ros2` | Runtime node | Go / ROS 2 node scaffolds | `cadl.sim.gen_go` |
| `python` | Runtime node | Python agent scaffolds | `cadl.sim.gen_python` |
| `solidity` | Institutional contract | Solidity smart contracts | `cadl.codegen.solidity` |
| `opa` | Institutional policy | Rego / OPA policies | `cadl.codegen.opa` |
| `identifier` (user-defined) | Plugin | Whatever the user plugin emits | user-supplied |

## D.2 Two-tier generator layout

The reference implementation splits codegen into two tiers, reflecting
whether the output enforces **institutional constraints** or configures a
**runtime / simulator**:

```
cadl/
├── codegen/          ← institutional-constraint tier
│   ├── solidity/     ← smart-contract enforcement of contracts
│   └── opa/          ← policy enforcement (Rego) of contracts
└── sim/              ← runtime / simulator tier
    ├── gen_unity.py
    ├── gen_ros2.py   (alias: gen_go.py)
    └── gen_python.py
```

A single CADL source file MAY declare targets from both tiers in one
`codegen:` block. The processor SHOULD dispatch each target to its tier
independently.

## D.3 Selection guidance

- Pick **`unity`** when the experiment is a multi-agent simulation with
  graphical inspection.
- Pick **`ros2` / `python`** when you want to drive actual runtime
  actors (robots, services).
- Pick **`solidity`** when the Institution-layer contracts must be
  enforced on-chain (blockchain deployment).
- Pick **`opa`** when contracts should be enforced as policies at API
  / service boundaries (policy-as-code).

Multiple runtime targets in one file are permitted but the resulting
artifacts are independent — the CADL toolchain does not guarantee
runtime interoperability between, e.g., a Unity config and a Solidity
contract generated from the same source.

## D.4 Conformance

A processor is **codegen-core-conforming** if it supports at least one
target from each tier (at minimum `unity` + one of `{solidity, opa}`).

A processor that cannot emit a declared target MUST report a clear
diagnostic (e.g. `"codegen target `ros2` not supported by this
processor"`) rather than silently skipping it. See also Appendix C §C.6
for the parallel requirement on the motivation extension.

## D.5 Cross-reference

- [Appendix A §A.9](./appendix-a-syntax#a9-codegen-block) — EBNF.
- [Glossary](./glossary) — **Codegen target** definition.
