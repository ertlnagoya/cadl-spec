---
sidebar_position: 10
sidebar_label: "10 — Generating contracts with an LLM"
title: "Chapter 10 — Generating contracts with an LLM"
---

# Chapter 10 — Generating contracts with an LLM

## 10.1 Advanced exercise (optional, ★★★): the propose-and-check loop

**Overview.** In Chapters 4–9 you wrote the contracts by hand. In this
advanced exercise you build and evaluate a loop in which an **LLM
generates the CADL contract from natural-language operating rules**
("respond within 5 seconds", "never assign a low-battery robot") and is
**auto-corrected until the draft passes `cadl check`**, with the
diagnostics fed back on every failure. The essence: the LLM proposes,
the type checker gatekeeps — no LLM output takes effect until it passes.
Keep in mind that passing `cadl check` is a syntactic and type-level
check, not a safety guarantee: it says the draft is well-formed CADL,
not that its deadlines and rules are the right ones.

**Key points.**

- A draft that passes the check is **not necessarily what you meant**.
  Compare the accepted draft's `deadline` values and monitor rules
  against the contract you hand-wrote in Chapter 5 — noticing that
  "passes ≠ matches intent" is the single biggest lesson here.
- Feed failure diagnostics back to the LLM **verbatim**. Record what
  it managed to fix and what it could not.
- Evaluate with counting statistics: first-pass rate, pass@K, and mean
  rounds to pass.

**Hints.**

- Spelling out the CADL grammar constraints in the system prompt (only
  four SoS types, ASCII identifiers, `deadline: 5s` duration format,
  ...) can be expected to raise the first-pass rate; measuring it with
  and without the constraints makes a good experiment.
- `cadl check` can be invoked as a subprocess (inspect the exit code
  and output).
- No reference implementation is publicly available at present (the
  authors' own, `step_a_design.py` and `measure_step_a.py` in the
  `cadl-ai-governance` repository, is not public), so writing the loop
  and a small measurement script is part of the exercise. Start with a
  deterministic mock in place of the LLM (a function that returns a
  fixed sequence of drafts) to watch the loop run, then switch to a
  real LLM.

## 10.2 Agents that act while the system runs

In 10.1 an LLM writes a contract, and the contract is checked before it is used. When LLM agents
act on their own while the system runs, the agent governance extension of the specification
([Appendix G](../spec/appendix-g-agents.md)) decides each message that an agent sends from the
norms of its contract: allow, deny, or escalate to a human. `cadl` 0.3.26 makes this decision in a
gateway between an agent and an MCP tool server (`cadl mcp-gateway`) and in a gateway between the
clients and an A2A agent (`cadl a2a-gateway`). Every decision is written to an audit log, and
`cadl audit-verify` checks its hash chain (Sections G.8, G.11 and G.13). This textbook does not use
these commands.
