---
sidebar_position: 3
sidebar_label: "3 — Essentials of CADL"
title: "Chapter 3 — Essentials of CADL"
---

# Chapter 3 — Essentials of CADL

## Step 1 — Read the CADL spec (15 min)

### What you'll learn
- Where in the spec the **structure layer** (actors / contracts / protocols) is described.
- Where in the spec the **norms layer** (Appendix E lifecycle / monitors) lives.

### Background

A specification language has two jobs in an SoS context:

1. **Descriptive** — *what exists*. The actors, the connections, the messages they exchange.
2. **Normative** — *what should happen*. Which obligations, which deadlines, which violations.

CADL covers (1) directly in its main grammar (Appendix A). The SoS-DSL extension ([Appendix E](../spec/appendix-e-sos-dsl.md)) adds (2) on top of (1) — same syntax family, just two new body keys: `lifecycle:` and `monitors:`.

### Procedure

```bash
cd ~/program/cadl-spec
npm install
npm run start
# Browser opens at http://localhost:3000/cadl-spec/
```

Read these chapters in order; the time guide is what we recommend so you stay within the 15-minute budget.

| Chapter | What it answers | Time |
| --- | --- | --- |
| 1. Introduction | What is CADL for? | 2 min |
| 5. Language Specification | How do I write actors / contracts / protocols? | 5 min |
| **[Appendix E](../spec/appendix-e-sos-dsl.md) (today's main)** | **How do I write a contract lifecycle and monitors?** | **6 min** |
| 7. Examples | What does a complete file look like? | 2 min |

### Expected output

Section E.6 of [Appendix E](../spec/appendix-e-sos-dsl.md) shows the robot-delivery example. The block below is an abridged version of it (one transition and one monitor only). Read it carefully — Step 3 will ask you to write something very similar.

```yaml
contracts:
  - id: DELIVERY_SLA
    parties: [DISPATCHER, "ROBOT[*]", "CUSTOMER[*]"]
    assume:
      - "ROBOT[i].battery > 20"
    guarantee:
      - "delivery_time <= 300s"

    lifecycle:
      states: [Proposed, Assigned, Accepted, Delivering, Completed, Violated, Terminated]
      initial: Proposed
      terminal: [Completed, Violated, Terminated]
      transitions:
        - id: accept
          from: Assigned
          to:   Accepted
          on:   "ROBOT[i] -> DISPATCHER : ack(accepted)"
          deadline: 5s
          on_violation:
            transition: Violated
            severity:   Major

    monitors:
      - id: battery_guard
        observe: "ROBOT[i].battery"
        sampling: periodic(500ms)
        rule: "ROBOT[i].battery < 20 AND state == Assigned"
        on_match:
          transition: Violated
          severity:   Major
```

### Check 1

Without scrolling, can you answer these three questions out loud?

1. What is the **initial state** of a delivery contract? → *Proposed*
2. If a robot does not ack within **5 seconds**, what happens? → *It is forced to transition to `Violated` with severity `Major`*
3. Which monitor fires when battery drops below 20% **while still Assigned**? → *`battery_guard`*

If you got all three, you understand the spec well enough to start writing.

### Recap

Having read the spec, you can place its two layers — the **structural** layer (what exists) and the **normative** layer (what must hold) — and say where each one lives. For the delivery contract you now know the key rules: the initial state is `Proposed`, a missing ack within 5 s forces a `Major` jump to `Violated`, and a low battery while `Assigned` trips `battery_guard`. With that map in hand you are ready to start writing in Step 2.
