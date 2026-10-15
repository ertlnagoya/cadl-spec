---
sidebar_position: 3
sidebar_label: "3 — Essentials of CADL"
title: "Chapter 3 — Essentials of CADL"
---

# Chapter 3 — Essentials of CADL

This chapter explains how to write the CADL files of Chapter 4 onwards, limited to what this textbook uses. The specification defines the whole language, but you do not need to read it to follow this textbook. Each section ends with the sections of the specification to read if you want the details.

## Step 1 — Learn the essentials of CADL (15 min)

### What you'll learn
- A CADL file consists of a **structure layer** (actors / contracts / protocols) and a **norms layer** (lifecycle / monitors).
- By which rules an individual agreement (a contract instance) moves between states, and when it becomes a violation.
- What `cadl check` and `cadl verify` check.

### Background: the structure layer and the norms layer

A specification of an SoS has two jobs:

1. **Descriptive** — *what exists*: the participants, how they are connected, the messages they exchange.
2. **Normative** — *what should happen*: obligations, deadlines, violations.

CADL covers (1) in the core language. The SoS-DSL extension adds (2) on top of (1). The extension adds only two keys, `lifecycle:` and `monitors:`, placed inside a contract and written in the same way as the core.

### The skeleton of a file

A CADL file is written in YAML and has a single `sos:` at the top level. The keys used in this textbook are:

```yaml
sos:
  name: "MyDelivery"            # name of the SoS
  type: Acknowledged            # SoS type (Directed / Acknowledged / Collaborative / Virtual)
  version: "0.1.0"
  extensions:                   # declared by files that use the SoS-DSL extension (from Chapter 5)
    - sos-dsl: 0.1

  context:                      # environment parameters (values passed to simulators and others)
    environment:
      num_robots: 3

  actors:    [...]              # who exists
  contracts: [...]              # who promises what to whom (the norms layer goes here too)
  protocols: [...]              # in which order they interact
```

`type:` takes one of the four types of Chapter 1, Section 1.4. It is a descriptive label; the tools do not check it against anything else in the file. The top level has other keys too, such as `transitions:`, which states the conditions for switching between operating modes (regimes); this textbook does not use them.

Details: [Chapter 5](../spec/05-language-spec.md), Section 5.1, and [Appendix A](../spec/appendix-a-syntax.md), Section A.2, of the specification.

### Actors

An actor is a participant of the SoS.

```yaml
actors:
  - id: DISPATCHER
    role: "central_coordinator"
    autonomy: low
    capabilities: [assign_tasks]
    interface:
      input:  [position_report, task_completion]
      output: [route_assignment]

  - id: "ROBOT[1..N]"           # N actors of the same kind
    role: "delivery_agent"
    autonomy: high
```

| Key | What it says |
| --- | --- |
| `id` | Name of the actor. A range such as `ROBOT[1..N]` makes it a set of actors of the same kind |
| `role` | A string naming its role |
| `autonomy` | How autonomous it is (`low` / `medium` / `high`; `medium` when omitted). A descriptive label, like `type:` |
| `capabilities` | What the actor can do |
| `interface` | What it receives (`input`) and sends out (`output`) |

Elsewhere in the file, `ROBOT[*]` refers to the whole set and `ROBOT[i]` to one member of it. `ROBOT[i].battery` is the attribute `battery` of that robot. The upper bound `N` of a range is a symbol meaning "any number"; there is no syntax that gives it a value (a range can also be written with numbers, as in `[1..3]`).

Details: [Chapter 5](../spec/05-language-spec.md), Section 5.2.2, of the specification.

### Contracts

A contract is an agreement between actors. A CADL contract is written in the form **as long as the assumptions (`assume`) hold, the parties keep the guarantees (`guarantee`)** (assume-guarantee form). If an assumption fails, the parties are not bound by the guarantees.

```yaml
contracts:
  - id: DELIVERY_SLA
    parties: [DISPATCHER, "ROBOT[*]", "CUSTOMER[*]"]
    assume:
      - "ROBOT[i].battery > 20"           # assumption: the battery is above 20%
    guarantee:
      - "delivery_time <= 300s"           # guarantee: delivered within 300 s
    incentives:
      type: task_completion
      lambda: 0.5
      rules:
        - "reward(ROBOT[i], 10) when on_time_delivery"
```

| Key | What it says |
| --- | --- |
| `id` | Name of the contract |
| `parties` | The parties to the contract (actor `id`s) |
| `assume` | Assumptions, as a list of expressions written as strings |
| `guarantee` | Guarantees, as a list of expressions written as strings |
| `incentives` | Rewards and penalties. `type` is the kind, `lambda` (λ) a number for their strength, and `rules` says who gets what and when |

Contracts have other keys as well, such as who decides (`authority:`, with the decision holder `decision_holder` and `beta` (β), how centralised decisions are) and how much information is shared (`alpha` (α) in `information:`). The subject of this textbook uses keys up to `incentives:`.

A contract so far describes a **class**: "this is the kind of agreement we make". How each individual delivery goes through that agreement is written in the norms layer below.

Details: [Chapter 5](../spec/05-language-spec.md), Sections 5.2.3 and 5.4.1, of the specification.

### Protocols

A protocol is the procedure of an interaction between actors.

```yaml
protocols:
  - id: DeliveryProposal
    trigger: "new_delivery_request(CUSTOMER[i])"     # what starts it
    precondition: "ROBOT[i].battery > 20"            # when it may start
    steps:
      - "DISPATCHER -> ROBOT[i] : route_assignment"  # DISPATCHER sends route_assignment to ROBOT[i]
      - "ROBOT[i] -> DISPATCHER : ack"
      - "ROBOT[i] -> DISPATCHER : completion"
    postcondition: "ROBOT[i].status == Delivered"    # what holds when it has finished
```

Each line of `steps` is one step. `A -> B : m` means "A sends the message `m` to B", and `A : f(x)` means "A performs the computation `f(x)` itself". Steps can also branch on a condition (`if` / `else`), run without a fixed order (`parallel:`), or wait until a condition holds (`barrier:`).

Details: [Chapter 5](../spec/05-language-spec.md), Section 5.2.4, of the specification.

### The norms layer (1): contract instances and the lifecycle

The basic idea of the norms layer is the **contract instance**. Every time a delivery order arrives, one instance of the `DELIVERY_SLA` contract is created, and that instance moves from state to state. Instances are created by the application that runs the contracts (in this textbook, the simulator).

The state machine an instance goes through is written in `lifecycle:`.

```yaml
    lifecycle:
      states: [Proposed, Assigned, Accepted, Delivering, Completed, Violated, Terminated]
      initial: Proposed                       # the state when it is created
      terminal: [Completed, Violated, Terminated]   # the final states
      transitions:
        - id: accept
          from: Assigned                      # when in this state
          to:   Accepted                      # move to this state
          on:   "ROBOT[i] -> DISPATCHER : ack(accepted)"   # when this event occurs
          deadline: 5s                        # within 5 s of entering Assigned
          on_violation:                       # if that deadline is missed
            transition: Violated              # force the instance to Violated
            severity:   Major                 # how serious the violation is
```

A transition (one item of `transitions`) works as follows.

- When the instance is in one of the `from` states, the `on:` event occurs and the `when:` condition (if written) holds, the transition fires and the instance moves to the `to` state. `from` may list several states, as in `[Holding, Overstay]`.
- An `on:` event is one of two kinds. The form `"A -> B : m"` occurs when that message is sent. A condition such as `"ROBOT[i].status == Delivered"` occurs when the condition becomes true.
- `deadline:` is a time bound measured **from the moment the instance enters a `from` state**. If the transition has not fired by then, this is a violation, and the instance moves to the state named in `on_violation.transition`. What `transition:` holds is **the name of the target state**, not the `id` of a transition.
- The severity of a violation, `severity`, is `Minor`, `Major` or `Critical`; it is `Major` when omitted. If `on_violation:` has no `transition:`, a missed deadline is recorded as a violation but the state does not change.
- A deadline is an integer with a unit: `5s`, `500ms`, `2min`, `1h`.

Details: [Appendix E](../spec/appendix-e-sos-dsl.md), Sections E.3 and E.5, of the specification.

### The norms layer (2): monitors

`monitors:` holds rules that are watched while a contract instance is running.

```yaml
    monitors:
      - id: battery_guard
        observe: "ROBOT[i].battery"           # the value it reads
        sampling: periodic(500ms)             # evaluate every 500 ms
        rule: "ROBOT[i].battery < 20 AND state == Assigned"   # a violation when this holds
        on_match:
          transition: Violated                # force the instance to Violated
          severity:   Major
```

| Key | What it says |
| --- | --- |
| `observe` | The values the monitor reads: an attribute of a declared actor (`ROBOT[i].battery`), a message name, or one of the reserved names `time` and `state` |
| `sampling` | When it is evaluated: `periodic(500ms)` at a fixed interval, `event` whenever an event reaches the instance. `event` when omitted |
| `rule` | The condition that counts as a violation |
| `on_match` | What happens when the condition holds: `violation:` is the name the violation is recorded under (the monitor's `id` when omitted), `transition:` the target state, `severity:` the severity (`Major` when omitted) |

Monitors are evaluated separately from the lifecycle, but a `rule` can read `state`, the current state of the instance. `IN` says "in one of these states", as in `state IN [Assigned, Accepted]`. Besides `state`, the names `now` (the current time) and `request` (the request that created the instance) are reserved in conditions.

The values of `on:`, `when:` and `rule:`, and of `observe:` entries that contain `[`, `->` or `": "`, must be quoted as strings; otherwise YAML reads them as other constructs.

Details: [Appendix E](../spec/appendix-e-sos-dsl.md), Sections E.3–E.5, of the specification.

### What cadl check and cadl verify check

Besides syntax and types, `cadl check` reports mistakes in the norms layer such as the following as **errors**. With even one error it prints `Type check failed`.

| Mistake | Example |
| --- | --- |
| `initial`, `terminal`, or the `from` / `to` of a transition names a state that is not in `states` | `initial: Proposed`, but `Proposed` is not in `states` |
| The `transition:` of `on_violation` / `on_match` is not a state name | the transition `id` `accept` was written |
| No final state can be reached from the initial state | |
| `severity:` is not one of `Minor` / `Major` / `Critical` | `severity: Fatal` |
| `deadline:` cannot be read as a duration | `deadline: soon` |
| A message in `on:` mentions an actor that is not declared | `HUB` in `"ROBOT[i] -> HUB : ack"` is not declared |
| An `observe:` entry is neither an attribute of a declared actor nor a message name | `DRONE` in `DRONE.battery` is not declared |

For example, when the `transition:` of `on_violation` names a transition `id`, `cadl` 0.3.14 reports:

```text
  [ERROR]: on_violation.transition 'accept' of the lifecycle transition 'accept' of contract 'DELIVERY_SLA' is not a state listed in states (L-5); it names the target state, not a transition id
Type check failed: 1 error(s), 0 warning(s)
```

A transition with a `deadline:` but no `on_violation:` gives a **warning**. With warnings only, the file is valid and `Type check passed` is printed.

`cadl verify` does what `cadl check` does and, in addition, examines the assumptions and guarantees of each contract with an SMT solver (Z3). If the assumptions list both `ROBOT[i].battery > 20` and `ROBOT[i].battery < 10`, which can never hold together, it reports that the contract can never apply:

```text
  [FAIL] Contract 'DELIVERY_SLA' assumptions: Assumptions contradict each other; the contract can never apply
```

The procedures of this textbook do not use `cadl verify`, but you can use it to check contracts you write yourself.

Details: [Appendix E](../spec/appendix-e-sos-dsl.md), Section E.4, and [Chapter 6](../spec/06-design.md), Section 6.3, of the specification.

### Reading an example

With what you have read so far, read the contract of robot delivery. It is the example of Section E.6 of Appendix E of the specification, cut down to one transition and one monitor. In Chapter 5 you will write something very similar yourself.

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

Without looking at the example, can you answer these four questions aloud?

1. What is the **initial state** of the delivery contract? → *Proposed*
2. What happens if a robot does not acknowledge within **5 seconds**? → *a violation of severity `Major`, and the instance is forced to `Violated`*
3. From when are those 5 seconds counted? → *from the moment the instance enters `Assigned`*
4. Which monitor acts when the battery falls below 20% **while the instance is still Assigned**? → *`battery_guard`*

If you can answer all four, you know enough to start writing in Chapter 4.

### Recap

A CADL file has two floors: the **structure layer** (actors / contracts / protocols), which says what exists, and the **norms layer** (lifecycle / monitors inside a contract), which says what must be kept. A contract is a class of agreement written in assume-guarantee form; the contract instance created for each order moves between states following the transitions, deadlines and monitors of the lifecycle. A missed deadline or a monitor whose condition holds is a violation and forces the instance to the state named in `transition:`. `cadl check` checks the file you wrote, and `cadl verify` looks for contradictions between assumptions and guarantees.

### Where the specification covers this

To look up these constructs, including the parts this textbook does not use, read:

| What you want to know | Specification |
| --- | --- |
| The structure of a whole file and the levels of detail | [Chapter 5](../spec/05-language-spec.md), Section 5.1 |
| Every key of actors, contracts and protocols | [Chapter 5](../spec/05-language-spec.md), Section 5.2 |
| The formal syntax (EBNF) | [Appendix A](../spec/appendix-a-syntax.md) |
| Syntax, static rules and behaviour of the lifecycle and monitors | [Appendix E](../spec/appendix-e-sos-dsl.md), Sections E.3–E.5 |
| The fields written to the IR | [Appendix E](../spec/appendix-e-sos-dsl.md), Section E.7 |
| Terms | the [Glossary](../spec/glossary.md) and [Appendix A](appendix-a-glossary.md) of this textbook |
