---
sidebar_position: 20
sidebar_label: "App. A — Glossary"
title: "Appendix A — Glossary"
---

# Appendix A — Glossary

## Reference

| Topic | File |
| --- | --- |
| Language reference | `cadl-spec/docs/spec/` ([Appendix E](../spec/appendix-e-sos-dsl.md) for today's content) |
| Parser implementation | `cadl_repo/src/cadl/parser.py` |
| IR | `cadl_repo/src/cadl/sim/ir.py`, `cadl_repo/src/cadl/sim/lower.py` |
| Unity C# generator | `cadl_repo/src/cadl/codegen/unity_csharp/` |
| Python reference runtime | `cadl-raspimouse-simulator/cadl/runtime/` |
| Lifecycle visualiser | `cadl-explorer/cadl_sim/sos_dsl/` |
| End-to-end script | `cadl_repo/scripts/sos_dsl_handson_e2e.sh` |

### Glossary

| Term | Meaning |
| --- | --- |
| **SoS** | System of Systems — a system whose parts are themselves operationally independent systems. |
| **Actor** | An autonomous participant in the SoS (robot, dispatcher, customer). |
| **Contract** | A class of normative agreement between named parties. |
| **Contract instance** | A concrete in-flight execution of a contract (one per delivery request). |
| **Lifecycle** | The state machine a contract instance progresses through. |
| **Monitor** | A declarative observation rule attached to a contract. |
| **Deadline** | A timing constraint expressed as `deadline: <duration>` on a transition. |
| **`on_violation`** | What the runtime does when a transition's deadline expires. Its `transition:` names the **target state** the instance is moved to (e.g. `Violated`), not a transition `id`. |
| **`on_match`** | What the runtime does when a monitor's `rule` holds. Its `transition:` likewise names the target state (e.g. `Violated`); `violation:` names a violation to record. |
| **Severity** | Classification of a violation: Minor / Major / Critical. |
| **IR** | Intermediate Representation — the JSON between parser and codegen. |
| **Codegen target** | A code generation backend, e.g. `python`, `solidity`, `unity-csharp`. |
| **Bridge** | A `MonoBehaviour` translating Pilot state changes into contract events. |
