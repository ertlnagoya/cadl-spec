---
sidebar_position: 13
title: "Appendix C — Motivation Extension"
---

# Appendix C — Motivation Extension (v0.1-ext)

This appendix describes the **motivation extension** to CADL used in the
cadl-explorer demonstrator and the A-SoS motivation-sensitive governance
experiments. The core language (Chapters 5 and Appendix A) does **not**
mandate these blocks; a conforming CADL processor that does not implement
the extension SHOULD accept the `motivation:` block syntactically and emit
an *informational* diagnostic rather than rejecting the file.

The extension is versioned independently from the core language; this
document describes **v0.1-ext**.

## C.1 Scope

The extension adds two concepts on top of the Institution layer:

1. **Agent motivation** — a per-actor scalar `m ∈ [0, 1]` describing
   intrinsic willingness to accept tasks. A `profile` selector names a
   distribution of motivation values across the actor set.
2. **Governance motivation interpretation** — how the authority layer
   couples motivation into budget / wait-time decisions, via parameters
   ρ (sensitivity) and κ (scale).

These parameters supplement the core governance triple (α, β, λ); they
do not replace it.

## C.2 EBNF

```ebnf
motivation_section  = "motivation:" , INDENT ,
                      [ agent_motivation ] ,
                      [ governance_motivation ] ,
                      DEDENT ;

agent_motivation    = "agent:" , INDENT ,
                        "profile:" , motivation_profile , NEWLINE ,
                        [ "values:" , float_list , NEWLINE ] ,
                      DEDENT ;

motivation_profile  = "uniform" | "linear" | "polarized" | "custom" ;

governance_motivation = "governance:" , INDENT ,
                          "model:" , motivation_model , NEWLINE ,
                          [ "rho:"         , float_literal , NEWLINE ] ,
                          [ "kappa:"       , float_literal , NEWLINE ] ,
                          [ "budget_base:" , int_literal   , NEWLINE ] ,
                          [ "wait_scale:"  , float_literal , NEWLINE ] ,
                        DEDENT ;

motivation_model    = "none" | "commitment_budget" | "hybrid" ;
```

## C.3 Parameter semantics

| Symbol | Name | Range | Meaning |
|--------|------|-------|---------|
| m_i | Motivation of actor i | [0, 1] | 0 = unwilling, 1 = fully willing |
| ρ (rho) | Motivation sensitivity | [0, 1] | 0 = ignore motivation; 1 = fully couple decisions to m |
| κ (kappa) | Budget scale | ≥ 0 | Multiplier from motivation delta to budget adjustment |
| budget_base | Baseline budget | ℤ ≥ 0 | Per-actor resource quota before motivation |
| wait_scale | Overshoot→retry factor | ≥ 0 | Converts budget overshoot to retry wait time |

### Profile semantics

For `N` actors:

- `uniform` — every actor gets `m = 0.5`.
- `linear` — motivations are linearly spaced over `[0.2, 1.0]`
  (`m_i = 0.2 + 0.8 · i/(N−1)`; for `N = 1`, `m = 0.5`).
- `polarized` — first `⌊N/2⌋` actors get `m = 0.2`, the rest `m = 0.9`.
- `custom` — explicit `values` list of length `N` MUST be provided.

## C.4 Governance models

| `model` | Effect |
|---------|--------|
| `none` | Baseline — motivation is ignored (equivalent to ρ = 0). |
| `commitment_budget` | Each actor gets `budget_base` tokens; motivation extends via `κ · (m − 0.5)`. |
| `hybrid` | Budget-constrained dispatch **plus** preference-weighted task arbitration. |

Effective sensitivity is `ρ · 𝟙[model ≠ "none"]`; when `model = "none"`
the runtime MUST ignore `rho`.

## C.5 Example

```yaml
sos_type: Directed
governance:
  alpha: 0.3
  beta: 0.7
  lambda: 0.0

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

## C.6 Conformance

A CADL processor is **core-conforming** if it accepts files without the
`motivation:` block and fully implements Chapters 5 and Appendix A.

A processor is **motivation-conforming** if it additionally:

1. Parses the `motivation:` block per the EBNF in §C.2.
2. Validates `profile` and `model` against the enumerations in §C.2.
3. Resolves profiles to concrete per-actor motivation vectors per §C.3.
4. Documents how it passes motivation parameters to downstream codegen
   targets (simulator config, policy code, etc.).

A processor that does not support the extension SHOULD preserve the
block verbatim so downstream tools can consume it.

## C.7 Cross-reference

- **cadl-explorer** (demo): implements v0.1-ext in
  `cadl_sim/schema/motivation_schema.py`.
- **cadl (impl, `cadl_repo`)**: accepts the `motivation:` block as an
  opt-in `MotivationBlock` attached to `SoSDefinition`; verification and
  codegen pass it through without core semantic checks.
- [Glossary](./glossary) — definitions of ρ, κ, profile terms.
