---
sidebar_position: 13
title: "Appendix C: Motivation Extension"
description: "Optional motivation extension of CADL (v0.1-ext): agent motivation profiles and the governance parameters rho and kappa."
---

# Appendix C — Motivation Extension (v0.1-ext)

This appendix describes the **motivation extension** to CADL used in the
CADL Explorer demonstrator and the motivation-sensitive governance
experiments on a Directed SoS (the "D-SoS + motivation-sensitive" template of
CADL Explorer, named "A-SoS + motivation-sensitive" up to v0.4.1). The core language ([Chapter 5](./05-language-spec.md) and
[Appendix A](./appendix-a-syntax.md)) does **not** mandate this block; a
conforming CADL processor that does not implement the extension MUST NOT
reject a file because of the `motivation:` block. It SHOULD accept the
block syntactically and emit an *informational* diagnostic.

The extension is versioned independently from the core language; this
document describes **v0.1-ext**, which is the version label of the
extension text. In v0.1 the extension has no name to declare under
`extensions:`
([Appendix A.2](./appendix-a-syntax.md#a2-top-level-structure)); a file
uses it simply by writing a `motivation:` block.

## C.1 Scope

The extension adds two concepts on top of the Institution layer:

1. **Agent motivation** — a per-actor scalar `m ∈ [0, 1]` describing
   intrinsic willingness to accept tasks. A `profile` selector names a
   distribution of motivation values across the actor set.
2. **Governance motivation interpretation** — how the authority layer
   couples motivation into budget / wait-time decisions, via parameters
   ρ (sensitivity) and κ (scale).

These parameters supplement the governance parameters (α, β, λ) of the
contracts; they do not replace them.

The block originated as the configuration schema of the simulator of
[CADL Explorer](https://github.com/ertlnagoya/cadl-explorer) (`cadl_sim`).
In a CADL file it is the optional `motivation:` key of the `sos:`
mapping, i.e. the `motivation_block` of
[Appendix A.2](./appendix-a-syntax.md#a2-top-level-structure).

## C.2 EBNF

The grammar uses the notation of [Appendix A](./appendix-a-syntax.md);
`number` and `int_literal` are defined there.

```ebnf
motivation_block      = [ "agent:"      , agent_motivation ] ,
                        [ "governance:" , governance_motivation ] ;

agent_motivation      = [ "profile:" , motivation_profile ] ,
                        [ "values:"  , { "-" , number } ] ;
motivation_profile    = "uniform" | "linear" | "polarized" | "custom" ;

governance_motivation = [ "model:"       , motivation_model ] ,
                        [ "rho:"         , number ] ,
                        [ "kappa:"       , number ] ,
                        [ "budget_base:" , int_literal ] ,
                        [ "wait_scale:"  , number ] ;
motivation_model      = "none" | "commitment_budget" | "hybrid" ;
```

Defaults: `profile: uniform`, `model: none`, `rho: 0.0`, `kappa: 5.0`,
`budget_base: 3`, `wait_scale: 3.0`.

## C.3 Parameter semantics

| Symbol | Name | Range | Meaning |
|--------|------|-------|---------|
| m_i | Motivation of actor i | [0, 1] | 0 = unwilling, 1 = fully willing |
| ρ (rho) | Motivation sensitivity | [0, 1] | 0 = ignore motivation; 1 = throttle over-budget actors at full strength |
| κ (kappa) | Budget scale | ≥ 0 | Multiplier from motivation to budget extension |
| budget_base | Baseline budget | ℤ ≥ 0 | Per-actor commitment budget before motivation |
| wait_scale | Overshoot→retry factor | ≥ 0 | Converts budget overshoot to retry wait time |

### Profile semantics

For `N` actors:

- `uniform` — every actor gets `m = 0.5`.
- `linear` — motivations are linearly spaced over `[0.2, 1.0]`
  (`m_i = 0.2 + 0.8 · i/(N−1)` for `i = 0 … N−1`; for `N = 1`,
  `m = 0.5`).
- `polarized` — first `⌊N/2⌋` actors get `m = 0.2`, the rest `m = 0.9`.
- `custom` — explicit `values` list of length `N` MUST be provided.

## C.4 Governance models

| `model` | Effect |
|---------|--------|
| `none` | Baseline — motivation is ignored (equivalent to ρ = 0). |
| `commitment_budget` | Actor i gets the commitment budget `B_i = budget_base + κ · m_i`. An actor that exceeds its budget is throttled by an extra wait of `⌊ρ · overshoot · wait_scale⌋`. |
| `hybrid` | Budget constraint as above **plus** preference-sensitive routing priority; ρ governs both. The priority rule is **undefined** in v0.1-ext (see below). |

The quantities in the table are defined as follows.

- `used_i` is the cumulative number of goals (commitments) actor i has
  taken on since the start of the run.
- `overshoot = max(0, used_i − B_i)` is the amount by which actor i
  exceeds its budget; it is 0 while the actor is within budget.
- The extra wait `⌊ρ · overshoot · wait_scale⌋` is counted in retry
  ticks of the runtime's dispatcher and is added to the wait the actor
  would have anyway before its next routing attempt.
- "Preference-sensitive routing priority" (`hybrid`) is **undefined** in
  v0.1-ext: no formula is given, and the reference simulator applies
  only the budget constraint, so `hybrid` behaves as `commitment_budget`.

Effective sensitivity is `ρ · 𝟙[model ≠ "none"]`; when `model = "none"`
the runtime MUST ignore `rho`.

## C.5 Example

In a CADL file the block is written under `sos:`.

```yaml
sos:
  name: "MotivationSensitiveDelivery"
  type: Directed
  # actors, contracts, ... as in Chapter 5

  motivation:
    agent:
      profile: linear
    governance:
      model: hybrid
      rho: 0.6
      kappa: 5.0
      budget_base: 3
      wait_scale: 3.0
```

CADL Explorer's simulator reads the same `motivation:` block from its
own configuration file, next to simulator settings such as
`sos_type:` and `environment:`. That file also has a top-level
`governance:` mapping with keys `alpha`, `beta`, and `lambda`. These are
simulator parameters — autonomy level, centralization level, and
exploration probability — and are **not** the per-contract α
(information sharing), β (decision centralization), and λ (incentive
intensity) of [Section 5.4.2](./05-language-spec.md). The simulator
configuration file is not a CADL file in the sense of
[Appendix A](./appendix-a-syntax.md).

## C.6 Conformance

A CADL processor is **core-conforming** if it accepts files without the
`motivation:` block and fully implements
[Chapter 5](./05-language-spec.md) and
[Appendix A](./appendix-a-syntax.md).

A processor is **motivation-conforming** if it additionally:

1. Parses the `motivation:` block per the EBNF in §C.2.
2. Validates `profile` and `model` against the enumerations in §C.2.
3. Resolves profiles to concrete per-actor motivation vectors per §C.3.
4. Documents how it passes motivation parameters to downstream codegen
   targets (simulator config, policy code, etc.).

A processor that does not support the extension SHOULD preserve the
block verbatim so downstream tools can consume it.

## C.7 Cross-reference

- **[CADL Explorer](https://github.com/ertlnagoya/cadl-explorer)**
  (demo): implements v0.1-ext in the configuration schema of its
  simulator (`cadl_sim/schema/motivation_schema.py`). The Explorer page
  accepts the profiles `uniform`, `linear` and `polarized`; it rejects
  `custom`.
- **[`cadl`](https://github.com/ertlnagoya/cadl)** (reference
  implementation): defines an optional `MotivationBlock` on
  `SoSDefinition` in its AST. At v0.3 the parser does not read the
  `motivation:` key from a CADL file; the block is accepted and
  ignored, and verification and code generation do not use it. The
  reference implementation implements the core language with the
  deviations listed in
  [Appendix A §A.12](./appendix-a-syntax.md#a12-reference-implementation-status-v03)
  and does not implement the motivation extension.
- [Glossary](./glossary.md) — definitions of ρ, κ, profile terms.
