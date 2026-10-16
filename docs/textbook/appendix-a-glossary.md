---
sidebar_position: 20
sidebar_label: "App. A — Glossary"
title: "Appendix A — Glossary"
---

# Appendix A — Glossary

The terms used in this textbook, grouped by topic. The right-hand column gives the sections of this textbook that explain each term. The [Glossary](../spec/glossary.md) of the specification also covers terms this textbook does not use.

## A.1 SoS concepts

| Term | Meaning | Sections |
| --- | --- | --- |
| **SoS** (System of Systems) | A set of systems, each operated independently, that together achieve a goal none of them can achieve alone | 1.1, 1.2 |
| **Maier's five criteria** | Five criteria for deciding whether something is an SoS: operational independence, managerial independence, geographic distribution, emergent behaviour, evolutionary development [1] | 1.3 |
| **Operational independence** | Each part works on its own when the SoS as a whole is off. Maier's criterion (1) | 1.3 |
| **Managerial independence** | Each part has its own owner or decision-maker. Maier's criterion (2) | 1.3 |
| **Emergent behaviour** | The whole does something no part can do alone. Maier's criterion (4) | 1.3 |
| **SoS type** | One of four classes by the strength of the central authority (Directed, Acknowledged, Collaborative, Virtual) [2] [3]. Written as `type:` in a CADL file | 1.4, 3.3 |
| **Directed** | An SoS managed centrally, with strong top-down authority | 1.4 |
| **Acknowledged** | An SoS with an authority for the whole, whose constituents keep their ownership and their own management. The robot delivery of this textbook is modelled as this type | 1.4 |
| **Collaborative** | An SoS with no single authority, whose parts cooperate voluntarily through shared agreements | 1.4 |
| **Virtual** | An SoS with neither central management nor an agreed purpose, in which coordination arises on its own | 1.4 |
| **Dispatcher** (`DISPATCHER`) | In the robot delivery of this textbook, the central coordinator that assigns deliveries to robots | 1.1, 3.4 |

## A.2 The structure layer of CADL

| Term | Meaning | Sections |
| --- | --- | --- |
| **CADL** (Contract Architecture Description Language) | A description language for writing the rules several systems must follow in one file, apart from their implementation code. Written in YAML | 1.6 |
| **Structure layer** | The part that says what exists in the SoS: `actors:`, `contracts:`, `protocols:` | 1.6, 3.2 |
| **Actor** (`actors:`) | A participant of the SoS. A range such as `ROBOT[1..N]` makes it a set of actors of the same kind | 3.4 |
| **`ROBOT[*]` / `ROBOT[i]`** | The notation for a whole set of actors and for one member of it. `ROBOT[i].battery` is an attribute of that member | 3.4 |
| **Autonomy** (`autonomy`) | How autonomous an actor is (`low` / `medium` / `high`). A descriptive label the tools do not check | 3.4 |
| **Contract** (`contracts:`) | An agreement between actors: a class, "this is the kind of agreement we make" | 3.5 |
| **Parties** (`parties`) | The actors that take part in a contract | 3.5 |
| **Assume-guarantee form** | The way a contract is written: as long as the assumptions (`assume`) hold, the parties keep the guarantees (`guarantee`). If an assumption fails, the guarantees do not bind | 3.5 |
| **Incentives** (`incentives:`) | Rewards and penalties. `lambda` (λ) is their strength; `rules` says who gets what and when | 3.5 |
| **`authority:` / `beta` (β)** | Who decides, and how centralised decisions are. Not used by the subject of this textbook | 3.5 |
| **`information:` / `alpha` (α)** | How much information is shared. Not used by the subject of this textbook | 3.5 |
| **Protocol** (`protocols:`) | The procedure of an interaction between actors, written with `trigger`, `precondition`, `steps` and `postcondition` | 3.6 |
| **Step** | One step of a protocol. `A -> B : m` sends a message; `A : f(x)` is a computation by A itself | 3.6 |
| **Operating mode** (regime) | A way of operating the SoS that can be switched (for example, centralised or distributed). The switching conditions go in the top-level `transitions:`. Not used in this textbook | 3.3 |

## A.3 The norms layer (SoS-DSL extension)

| Term | Meaning | Sections |
| --- | --- | --- |
| **Norms layer** | The part that says what should happen in the SoS: `lifecycle:` and `monitors:` inside a contract | 1.6, 3.2 |
| **SoS-DSL extension** | The extension that adds `lifecycle:` and `monitors:` to CADL. A file that uses it declares `sos-dsl: 0.1` under `extensions:` | 1.6, 3.3 |
| **Contract instance** | One individual realisation of a contract, created for each order. It moves between states following the lifecycle. The application that runs the contracts creates it | 3.7 |
| **Lifecycle** (`lifecycle:`) | The state machine a contract instance goes through | 3.7, 5.3 |
| **Initial / final states** (`initial` / `terminal`) | The state of an instance when it is created, and the states it never leaves | 3.7 |
| **Transition** (`transitions`) | A rule: when the instance is in a `from` state, the `on:` event occurs and `when:` holds, it moves to the `to` state | 3.7 |
| **Event** (`on:`) | What triggers a transition. The form `"A -> B : m"` occurs when the message is sent; a condition occurs when it becomes true | 3.7 |
| **Deadline** (`deadline:`) | A time bound measured from the moment the instance enters a `from` state, written as an integer with a unit, as in `5s` | 3.7 |
| **`on_violation:`** | What happens when a deadline is missed. `transition:` is the **name of the target state** (not a transition `id`); `severity:` is how serious the violation is | 3.7 |
| **Violation** | A missed deadline, or a monitor whose condition holds. It is recorded and, if so specified, forces the instance to another state | 3.7, 3.8 |
| **Severity** (`severity`) | How serious a violation is: `Minor`, `Major` or `Critical`; `Major` when omitted | 3.7 |
| **Monitor** (`monitors:`) | A rule watched while a contract instance is running | 3.8, 5.3 |
| **`observe`** | What a monitor reads: an attribute of a declared actor, a message name, `time` or `state` | 3.8 |
| **`sampling`** | When a monitor is evaluated: `periodic(500ms)` at a fixed interval, `event` whenever an event arrives (the default) | 3.8 |
| **`rule`** | The condition that counts as a violation, written as a string | 3.8 |
| **`on_match:`** | What happens when a monitor's condition holds. `violation:` is the name the violation is recorded under, `transition:` the target state | 3.8 |
| **Reserved names `state` / `now` / `request`** | In conditions: the current state of the instance, the current time, and the request that created the instance | 3.8 |

## A.4 The toolchain

| Term | Meaning | Sections |
| --- | --- | --- |
| **Toolchain** | The tools that produce check results, the IR, diagrams, code and executions from a CADL file | 2.1 |
| **`cadl check`** | The command that checks syntax, types and the static rules of the SoS-DSL extension. Mistakes are reported as errors, discouraged forms as warnings | 3.9 |
| **`cadl verify`** | The command that does what `cadl check` does and, with an SMT solver, also looks for contradictions between assumptions and guarantees and for deadlocks in protocols | 3.9 |
| **SMT solver / Z3** | A program that decides whether logical formulas can hold together. `cadl verify` uses Z3 [8] | 2.1, 3.9 |
| **IR** (intermediate representation, Sim-IR) | The content of a CADL file as JSON in three layers (institution / protocol / algorithm). `cadl sim-ir` writes it, and the other tools read it | 2.1, 7.6 |
| **Code generation** (`cadl codegen`) | Producing executable code from the IR. `--target` selects the target (`python`, `solidity`, `opa`, `unity-csharp`) | 7.3, 7.6 |
| **e2e script** | `cadl_repo/scripts/sos_dsl_handson_e2e.sh`, which checks the file, writes the IR, generates the C# and copies it into the Unity project in one go | 7.3 |
| **Python reference runtime** | A hand-written interpreter (`engine.py`) that reads the IR directly and replays how contract instances move between states. Used to cross-check the generated C# | 7.5, 7.6 |
| **`multi_robot_demo`** | A demo that runs five robots through fixed scripts on the reference runtime. `--summary` prints a table of final states, `--log` writes an NDJSON trace, `--ir` uses your own IR | 7.2, 7.9 |
| **NDJSON trace** | A record of events with one JSON object per line | 7.9 |
| **cadl-explorer** | A Streamlit app that edits and checks CADL and draws state machines | 6.3 |
| **Lifecycle View** | The diagram of a lifecycle drawn by the Contract Lifecycle page of cadl-explorer | 6.2, 6.4 |

## A.5 The simulator

| Term | Meaning | Sections |
| --- | --- | --- |
| **`cadl-raspimouse-simulator`** | The simulator repository: Unity project, Go arbitrator and Python reference runtime | 2.2 |
| **ContractRuntime** | The generated C# contract runtime: registers instances, delivers events, evaluates deadlines and monitors | 7.6 |
| **`ContractRuntimeHost`** | One per scene. Holds the runtime, has it evaluate every frame, and prints events to the Console | 8.2, 8.4 |
| **Bridge** (`PilotContractBridge`) | One per robot (a Unity `MonoBehaviour`). Observes changes of the robot state and turns them into contract events | 8.2, 8.4 |
| **`Pilot_CSoS`** | The robot controller: follows paths, claims deliveries, delivers. It knows nothing about contracts | 2.1, 8.4 |
| **Arbitrator** | The delivery dispatcher written in Go. It distributes deliveries over NATS and gives each to the robot that claims it first | 8.2, 8.4 |
| **NATS** | The message broker that carries messages between the robots and the arbitrator | 8.2 |
| **C-SoS** | The name of the simulator's operating mode (short for Collaborative SoS). Unrelated to the `type:` of a CADL file | 2.2 |
| **`cadl_config.json`** | The road network (11 nodes, 17 edges), the robot count and the NATS settings. Read by both the arbitrator and Unity | 8.4 |

Numbered references are listed in [Appendix D](appendix-d-references.md).
