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
If the hosted app asks you to sign in or is unavailable, run it locally
from the [cadl-explorer repository](https://github.com/ertlnagoya/cadl-explorer):

```bash
git clone https://github.com/ertlnagoya/cadl-explorer.git
cd cadl-explorer
pip install -r requirements.txt
streamlit run app.py
```

The left sidebar exposes the governance knobs; the main panel shows the full
**CADL → IR → Config → Results → Governance** causal chain.

## 2. Pick a governance template

In the sidebar, choose one of:

| Template | Meaning |
|---|---|
| **A-SoS** | Strong central authority (α=0.3, β=0.7, λ=0.0). |
| **C-SoS** | Collaborative SoS — autonomy-oriented (α=0.7, β=0.3, λ=0.3). |
| **A-SoS + motivation-sensitive** | Central authority that adjusts budgets to agent motivation (same α, β, λ as A-SoS). |

Here α is the autonomy level of the agents, β the centralization level,
and λ the exploration probability. These simulator parameters differ
from the per-contract α / β / λ of the language specification; see the
[Glossary](../spec/glossary.md). Both A-SoS templates set `sos_type` to
`Directed` in the YAML that the Explorer shows.

## 3. Set a motivation profile and ρ

- **Motivation profile** — how motivation is distributed across agents
  (`uniform`, `linear`, `polarized`).
- **ρ (motivation sensitivity)** — how strongly governance responds to
  motivation. ρ=0 is motivation-blind; ρ=1 fully couples decisions to
  motivation.

## 4. Run the pipeline

Click **Run Governance Pipeline Demo**. The six tabs update together:

1. **Causal Chain** — semantic diff between the baseline and your selection,
   stage by stage.
2. **Service View** — the fleet topology diagram and the YAML configs.
3. **CADL / IR Diff** — layer-by-layer text diff.
4. **Simulator Config Diff** — Unity-compatible config JSON diff.
5. **Results & Evaluation** — scatter, ρ effects, per-robot, and summary views.
6. **Run History** — compare multiple runs across the session.

## 5. Optional — paste your own CADL

Expand **Advanced: Custom CADL YAML** in the sidebar and paste a
`CADLMotivationConfig` YAML to override the template. Use the nested
`governance:` / `motivation:` layout, the same as the YAML shown in the
Service View tab. Minimal example:

```yaml
name: my-custom-config
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
    rho: 0.5
```

## Next steps

- Read the [Specification Introduction](../spec/intro) for the language as a
  whole.
- **To learn by doing → [the Hands-on index](../handson/index.md)** (includes a three-stage path for beginners).
- Chapter [5. Language Specification](../spec/05-language-spec.md) covers the
  three-layer syntax.
- Chapter [7. Examples](../spec/07-examples.md) walks through larger worked
  examples.
