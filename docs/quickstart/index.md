---
sidebar_position: 0
title: "Quick Start"
---

# CADL Quick Start (5 minutes)

This page walks through the shortest possible path from a CADL specification
to a simulation result and governance evaluation. No installation is required
if you use **[CADL Explorer](https://cadl-explorer.streamlit.app/)**.
The steps below describe CADL Explorer v0.5.0.

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

The app has four pages, listed at the top of the sidebar:

| Page | What it is for |
|---|---|
| **Explorer** | Compare two governance designs, A and B (this quick start). |
| **Designer** | Edit, check and visualise a full CADL model. |
| **Contract Lifecycle** | Step through the state machine of a contract from its IR JSON. |
| **About & Glossary** | What the tool does, the parameter values and the terms. |

The **Explorer** page opens first. It compares two designs, **A** (the
baseline) and **B** (the design under study), and shows the whole
**CADL → IR → Config → Result** chain for both. There is no run button: the
page recalculates whenever you change a setting.

## 2. Pick a governance template

Under **B — design under study** in the sidebar, choose one of:

| Template | Meaning |
|---|---|
| **D-SoS** | Directed SoS — strong central authority (α=0.3, β=0.7, λ=0.0). |
| **C-SoS** | Collaborative SoS — autonomy-oriented (α=0.7, β=0.3, λ=0.3). |
| **D-SoS + motivation-sensitive** | Central authority that adjusts budgets to agent motivation (same α, β, λ as D-SoS). |

Here α is the autonomy level of the agents, β the centralization level,
and λ the exploration probability. These simulator parameters differ
from the per-contract α / β / λ of the language specification; see the
[Glossary](../spec/glossary.md). Both D-SoS templates set `sos_type` to
`Directed` in the YAML that the Explorer shows.

:::note
Up to v0.4.1 the D-SoS templates were named A-SoS. They were renamed in
v0.5.0 because A-SoS is the abbreviation of Acknowledged SoS. Links shared
from older versions still open the same designs.
:::

To change what B is compared against, open **A — baseline** and choose in
the same way. The baseline starts as D-SoS, `uniform`, ρ=0.

## 3. Set a motivation profile and ρ

- **Motivation profile** — how motivation is distributed across agents
  (`uniform`, `linear`, `polarized`).
- **ρ (motivation sensitivity)** — how strongly governance responds to
  motivation. ρ=0 is motivation-blind; ρ=1 fully couples decisions to
  motivation. The slider is disabled for templates without a motivation
  model (D-SoS and C-SoS).

If you would rather start from a ready-made comparison, open
**Getting started** at the top of the page (or **Examples** in the sidebar)
and load one with a button.

## 4. Read the result

The page is divided into four numbered sections:

1. **Outcome** — throughput, autonomy and fairness of A and B, averaged
   over ten random seeds, with the difference between them.
2. **Why — the causal chain** — the same change seen at each stage
   (CADL, IR, Config, Result). Interpreted changes come first; the raw
   diff is available under each stage.
3. **Explore** — three tabs: **Effect of ρ**, **Per-robot view** and
   **Scenario**.
4. **Reproduce & export** — the content hashes of each stage, the CADL
   source of A and B, and downloads of B's CADL (YAML), IR (JSON) and
   simulator config (JSON), plus the A vs B comparison (JSON).

**Save this comparison** in the sidebar adds the current A/B metrics to
the **Saved comparisons** table at the bottom of the page, which can be
downloaded as CSV or JSON. The address in the browser records the current
settings, so copying it shares the comparison.

![CADL Explorer comparing D-SoS (A) with C-SoS (B): sidebar controls on the left, the Outcome and causal-chain sections on the right](/img/handson/explorer-compare.jpg)

## 5. Optional — paste your own CADL

Expand **Custom CADL** in the sidebar and paste a `CADLMotivationConfig`
YAML into **Design B** (or **Design A (baseline)**) to use it instead of
the selectors. Use the nested `governance:` / `motivation:` layout, the
same as the YAML shown under **CADL source of A and B**. Minimal example:

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

The synthetic metrics depend only on `sos_type`, the agent `profile` and
`rho`. Other fields such as `alpha`, `beta` and `lambda` are carried into
the generated IR and config but do not change the results.

This YAML is the Explorer's own configuration format, not a full CADL
model. To write and check a full CADL model (actors, contracts,
lifecycles, monitors), use the **Designer** page.

## Next steps

- Read the [Specification Introduction](../spec/intro) for the language as a
  whole.
- **To learn by doing → [the Hands-on index](../handson/index.md)** (includes a three-stage path for beginners).
- Chapter [5. Language Specification](../spec/05-language-spec.md) covers the
  three-layer syntax.
- Chapter [7. Examples](../spec/07-examples.md) walks through larger worked
  examples.
