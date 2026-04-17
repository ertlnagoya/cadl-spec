---
sidebar_position: 0
title: "Quick Start"
---

# CADL Quick Start (5 minutes)

This page walks through the shortest possible path from a CADL specification
to a simulation result and governance evaluation. No installation is required
if you use **[CADL Explorer](https://cadl-explorer.streamlit.app/)**.

## 1. Open CADL Explorer

Go to [cadl-explorer.streamlit.app](https://cadl-explorer.streamlit.app/).

The left sidebar exposes the governance knobs; the main panel shows the full
**CADL → IR → Config → Results → Governance** causal chain.

## 2. Pick a governance template

In the sidebar, choose one of:

| Template | Meaning |
|---|---|
| **A-SoS** | Acknowledged SoS — strong central authority (α=0.3, β=0.7, λ=0.0). |
| **C-SoS** | Collaborative SoS — autonomy-oriented (α=0.7, β=0.3, λ=0.3). |
| **A-SoS + motivation-sensitive** | Directed authority that adjusts budgets to agent motivation. |

Here α is the authority weight, β the incentive weight, and λ the
information-sharing weight.

## 3. Set a motivation profile and ρ

- **Motivation profile** — how motivation is distributed across agents
  (`uniform`, `linear`, `polarized`).
- **ρ (motivation sensitivity)** — how strongly governance responds to
  motivation. ρ=0 is motivation-blind; ρ=1 fully couples decisions to
  motivation.

## 4. Run the pipeline

Click **Run Governance Pipeline Demo**. The five tabs update together:

1. **Causal Chain** — semantic diff between the baseline and your selection,
   stage by stage.
2. **Service View** — the fleet topology and YAML config.
3. **CADL / IR Diff** — layer-by-layer text diff.
4. **Simulator Config Diff** — Unity-compatible config JSON diff.
5. **Results & Evaluation** — scatter, ρ-sweep, per-robot, and summary views.
6. **Run History** — compare multiple runs across the session.

## 5. Optional — paste your own CADL

Expand **Advanced: Custom CADL YAML** in the sidebar and paste a
`CADLMotivationConfig` YAML to override the template. Minimal example:

```yaml
name: my-custom-config
sos_type: directed
alpha: 0.3
beta: 0.7
lambda_param: 0.0
agent_motivation:
  profile: linear
governance_motivation:
  motivation_model: hybrid
  rho: 0.5
```

## Next steps

- Read the [Specification Introduction](../spec/intro) for the language as a
  whole.
- Chapter [5. Language Specification](../spec/05-language-spec) covers the
  three-layer syntax.
- Chapter [7. Examples](../spec/07-examples) walks through larger worked
  examples.
