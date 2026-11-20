---
sidebar_position: 20.6
title: "Appendix L: Decision Records"
description: "Decision records (decisions 0.1): a file format for the record of how amendments of a model were decided. Parties and their roles; objectives, proposals, measurements, checks, votes, recommendations, requests, decisions, versions and follow-ups as entries; the basis of each decision; integrity by the hash chain of G.8; the checks that a verifier makes and the findings it reports for review; the relation to Appendix K and a mapping to GSN."
---

# Appendix L — Decision Records (decisions 0.1)

[Appendix K, K.5](./appendix-k-amendment.md) lets a version of a model
name the records of human decisions on which it rests, by a URI
reference, and says nothing about the records themselves. This appendix
gives a format for such a record: a **decision record**. With it, a
tool that does not know the system that wrote a record can read it,
check it, and show it.

A decision record is a file beside the model, not a key of the model.
A CADL file declares nothing to use it, and no verdict of the core or
of an extension depends on it. The format is normative; whether a
system keeps a decision record is its own choice. The reference
implementation does not read or write decision records yet (L.10).

## L.1 Motivation and scope

The robot town of [Course D](../handson/robot-town-tutorial.md) amends
its rules after every period. An LLM proposes amendments, a tool
measures them on the same random seeds and applies the gates of the
constitution, the three companies vote, and when the gates or the
LLM say so, a human decides after reading a decision request in which
the LLM recommends an option. The human also writes the KPI, and
chooses how it is measured when the LLM reads it in more than one way.

Two questions are asked of such a loop afterwards.

- **Consensus.** Who agreed to each change? Did the companies vote for
  it, and if not, who set their vote aside?
- **Accountability.** Who decided, by which procedure, on what basis,
  and why? What did the deciders not know, and what did they promise to
  check later?

The exercise answers them in `decisions.md` and `gsn.yaml`, which are
written for people, and, after robot-town v0.2.2, in `evidence.json`,
which a program can read but which is tied to the exercise: the names
of its gates and metrics are those of the simulator. A decision record
answers the same questions in a form that does not depend on the
system. For each decision it says:

- under which objective it was taken (the text that the owner
  wrote, and how it is measured);
- what was proposed, by whom, and what was measured;
- which checks each proposal passed, and who made them;
- how each party voted;
- what an advisor recommended, and what it said it did not know;
- who decided, by which procedure, with which reason and
  assumptions, and on which earlier entries the decision rests;
- which version of the model came into force;
- what the deciders promised to follow up, and whether it was done.

In scope: the entries and their fields, the references between them,
the integrity of the file, and the checks of a verifier. Out of scope:
the procedure that produces the entries (which gates a system applies,
how proposals are made), the meaning of a metric (its formula and its
measurement method are in the model, K.5), and how a tool shows a
record.

## L.2 Concepts

- A **decision record** is one file. It covers one series of decisions
  on one model: a run of an amendment loop, or the life of a system in
  operation.
- A **party** is a person, an organisation, a software agent, an LLM,
  or a tool that takes part in the decisions. Each party has one or more
  **roles**:

  | Role | What the party does |
  | --- | --- |
  | `owner` | writes the objective |
  | `proposer` | proposes amendments, or readings of an objective |
  | `assessor` | measures proposals and checks them |
  | `voter` | votes on proposals |
  | `advisor` | recommends an option to a decider |
  | `decider` | decides |
  | `affected` | is affected by a decision and takes no part in it (for example customers); named so that an entry can say who is affected |

- An **entry** is one line of the record after its header. Each entry
  has a **type** (L.4), an identifier, the party that made it, the
  **point** in the time of the system to which it belongs (a period or
  an instant, as in K.4), and the time at which it was written.
- The **basis** of an entry is the list of earlier entries on which it
  rests. A decision names its basis: the objective in force, the
  measurements, the checks, the votes, the recommendation.
- A **follow-up** is a promise, made with a decision, to check or do
  something later. A later entry **fulfils** it.
- Entries are never changed. A **correction** is a later entry that
  says what was wrong in an earlier one.

## L.3 File format

A decision record is a file of JSON Lines in UTF-8, each line ended by
a line feed. The first line is a **header**, then come the entries in
the order in which they were written, and a complete record ends with
an **end record**. The suggested file name is `decisions.jsonl`.

Every line ends with the three integrity fields `seq`, `prev`, and
`digest` of [Appendix G, G.8](./appendix-g-agents.md#g8-audit-record),
computed as G.8 says: over the canonical JSON of the line, with SHA-256
or, for a keyed record, HMAC-SHA256. A line is in the written form of
G.8. What G.8 says about the limits of the chain and about an
**anchor** kept outside the file holds for a decision record as well:
a writer SHOULD keep the digest of the last line and the `run_id`
outside the record.

| Line | Fields before the integrity fields |
| --- | --- |
| Header | `decisions_format`: `"cadl-decisions/1"`. `hash`, `key_id`, `run_id`: as in the header of G.8. `model`: `name` (the `sos.name` of the model), `version` (the `sos.version` of the first version, or `null`), `source_sha256` (the SHA-256 of the bytes of the first version of the CADL file, or `null`). `time_base`: what a period is, in words, or `null`. `started`: the time at which the record was started, as an ISO 8601 time stamp in UTC. `previous`: for a record that continues another, the `run_id` of that record and the `digest` of its end record; otherwise `null`. `parties`: the parties (below). |
| Entry | The common fields of L.4, then the fields of its type. |
| End record | `decisions_end`: `true`. `entries`: the number of entries between the header and the end record. |

A record without end record is still being written, or its writer did
not finish; a verifier reports it as **open**. A writer that adds
entries to a complete record writes them after a new header: a record
has exactly one header, so a writer that continues a series of
decisions starts a new record, whose header names the previous record
in `previous` (its `run_id` and the digest of its end record).

**Parties.** Each party in `parties` has these fields:

| Field | Content |
| --- | --- |
| `id` | Identifier of the party in the record: letters, digits, `_`, `-`, `.`. |
| `kind` | `human`, `organisation`, `agent`, `llm`, or `tool`. |
| `roles` | One or more roles of L.2. |
| `name` | A name for a reader, or `null`. |
| `actor` | The actor id or the role of the model that the party is, as `decided_by:` and `voters:` of K.3 name it (`COUNCIL`, `service_operator`), or `null`. |
| `model` | For an `llm`, the model identifier; for a `tool`, its name and version; otherwise `null`. |

A party whose kind is `human` stands for a role held by a person; the
record does not need to name the person. Who held the role is a matter
for the organisation that keeps the record.

## L.4 Entries

### Common fields

| Field | Content |
| --- | --- |
| `id` | Identifier of the entry, unique in the record: letters, digits, `_`, `-`, `.`. It is the fragment by which K.5 names the entry (L.7). |
| `type` | One of the types below. |
| `point` | The point of the system's time to which the entry belongs: `{"period": k}` (k ≥ 1) or `{"at": "<ISO 8601>"}`, as the `time_point` of K.4. |
| `written` | The time at which the entry was written, an ISO 8601 time stamp in UTC. |
| `by` | The `id` of the party that made the entry. |
| `basis` | The `id`s of earlier entries on which this entry rests; may be empty. |
| `fulfils` | The `id`s of earlier `follow_up` entries that this entry fulfils; may be empty. |
| `attachments` | Files that belong to the entry: `path` (relative to the record), `sha256`, `media_type` or `null`. For example the table of a measurement, the output of an LLM, the CADL file of a proposal. |

An option of a decision, a request, or a recommendation is the `id` of
a `proposal` entry, or `"keep"` for leaving the model as it is.

### Types

**`objective`**: the text of an objective as its owner wrote it (the
KPI of Course D), in force from `point` until the next objective.

| Field | Content |
| --- | --- |
| `text` | The text, as written. |
| `measure` | How the objective is measured, when the owner wrote it: a list of measure items (below). `null` when it is to be read by a proposer; then `proposal` entries of kind `measure` offer readings and a `decision` chooses one. |

A **measure item** has `metric` (a metric of the model, or a name of the
system), `role` (`goal`, `watch`, or `guard`), `direction` (`increase`,
`decrease`, or `null`), and `target` (a condition as text, such as
`"<= 1"`, or `null`). The first `goal` is the main goal.

**`proposal`**: a proposed change.

| Field | Content |
| --- | --- |
| `kind` | `amendment` (a new version of the model) or `measure` (a reading of an objective). |
| `title` | A short title. |
| `rationale` | Why the proposer proposes it, as the proposer wrote it. |
| `changes` | For an amendment: a list of `parameter` (the `id` of a parameter of K.3, or a name of the system), `from`, `to` (numbers or durations as text), and `layer` (`rule`, `contract`, `regulation`, or `null`). |
| `objective` | For a reading: the `id` of the objective it reads. |
| `measure` | For a reading: the measure items. |

**`measurement`**: values measured for the version in force or for a
proposal.

| Field | Content |
| --- | --- |
| `of` | `"in_force"`, or the `id` of a proposal. |
| `version` | The `sos.version` of the version measured (for `in_force`), or `null`. |
| `method` | `runs` (number of runs), `window` (duration as text, or `null`), and `description` (text, or `null`), as `measure:` of K.5. |
| `values` | The measured values, a map from metric name to number, combined over the runs. |
| `per_party` | Values per party: a map from party `id` to a map from metric name to number, or `null`. For example the utility of each company. |
| `compared_with` | The `id` of the measurement this one is compared with, or `null`. |
| `runs_better` | Of the runs, how many are better than in `compared_with` on the main goal, or `null`. |

**`check`**: the results of checking one proposal.

| Field | Content |
| --- | --- |
| `proposal` | The `id` of the proposal. |
| `results` | A list of `name` (the name of the check in the system, such as `cadl check`, `constitution`, `invariants`, `gain`), `passed` (`true`, `false`, or `null` when not applicable), and `note` (text or `null`). |

**`vote`**: the vote of one voter on one proposal.

| Field | Content |
| --- | --- |
| `proposal` | The `id` of the proposal. |
| `value` | `yes`, `no`, or `abstain`. |
| `reason` | The reason the voter gave, or `null`. |

**`request`**: a request for a decision, sent to a decider.

| Field | Content |
| --- | --- |
| `to` | The `id` of the decider. |
| `question` | The question. |
| `options` | The options. |
| `why` | Why the decision is asked of the decider: a list of `option` and `reason` (text). |

**`recommendation`**: what an advisor recommends.

| Field | Content |
| --- | --- |
| `request` | The `id` of the request, or `null`. |
| `options` | A list of `option`, `summary`, and `affected` (who gains and who loses, as text). |
| `recommends` | The recommended option, or `null`. |
| `reason` | The reason. |
| `unknowns` | What the advisor says it does not know: a list of texts. |

**`decision`**: a decision.

| Field | Content |
| --- | --- |
| `question` | The question decided, or `null`. |
| `options` | The options that were open. |
| `choice` | The option chosen. |
| `procedure` | `single` (the decider decided alone), `vote` (the decision follows the votes on `choice`), `override` (the decider set aside the outcome of the votes), or `automatic` (a tool applied a rule stated in `rule`). |
| `rule` | For `automatic`, the rule in words (for example "adopt the proposal with the largest gain among those that pass every check and the vote"); otherwise `null`. |
| `reason` | The reason, as the decider wrote it, or `null`. |
| `assumptions` | Assumptions on which the decision rests: a list of texts. |
| `affected` | The `id`s of parties affected by the decision, or empty. |
| `result` | The `sos.version` in force after the decision, or `null` for a decision on a reading. |

**`version`**: a version of the model comes into force.

| Field | Content |
| --- | --- |
| `version` | Its `sos.version`. |
| `previous` | The `sos.version` it replaces, or `null`. |
| `effective` | When it takes effect, as `effective:` of K.4. |
| `source_sha256` | The SHA-256 of the bytes of its CADL file. |
| `decision` | The `id` of the decision that adopted it, or `null` for the first version. |

**`follow_up`**: a promise to check or to do something later.

| Field | Content |
| --- | --- |
| `text` | What is to be done. |
| `due` | By when, as a `point`, or `null`. |
| `decision` | The `id` of the decision with which it was made, or `null`. |

**`correction`**: a correction of an earlier entry.

| Field | Content |
| --- | --- |
| `corrects` | The `id` of the entry. |
| `text` | What was wrong, and what is right. |

**`note`**: anything else a party wants on the record, as `text`.

## L.5 References and order

An entry refers only to entries written before it: the `id`s in
`basis`, `fulfils`, `proposal`, `of`, `compared_with`, `request`,
`decision`, `objective`, `corrects`, `options`, and `choice` are `id`s
of earlier lines (or `"keep"`). The `point` of the entries does not
decrease. Within one point, the entries are written in the order in
which they arise: objective, proposals, measurements and checks, votes,
request, recommendation, decision, follow-ups, version.

## L.6 Checks and findings

A verifier MUST report the following as **errors**. A record with an
error cannot be relied on as it stands.

- **L-1** The file is JSON Lines in UTF-8, the first line is a header
  with `decisions_format` `"cadl-decisions/1"`, and every line has the
  fields of L.3 and L.4 for its kind and type, with no others.
- **L-2** The integrity fields verify as in G.8, with the key when the
  record is keyed.
- **L-3** The `id`s of the parties are unique, and so are the `id`s of
  the entries.
- **L-4** Every `id` that an entry names is the `id` of an earlier entry
  of the type that the field requires (L.5), or `"keep"` where an option
  is meant; `fulfils` names `follow_up` entries; `point` does not
  decrease.
- **L-5** `by` names a party with the role that the type requires:
  `objective` owner; `proposal` proposer; `measurement` and `check`
  assessor; `vote` voter; `recommendation` advisor; `decision` decider;
  `request`, `follow_up`, `version`, `correction`, and `note` any party.
- **L-6** The `choice` of a decision is one of its `options`. A decision
  with `procedure` `vote` or `override` has in its `basis` the votes on
  `choice` (for a choice of `"keep"`, on the proposal set aside). With
  `vote`, the votes on `choice` decide as the authority of K.3 says;
  with `override`, they do not, and `reason` is not `null`. A decision
  with `procedure` `automatic` gives `rule`, and its decider is a
  party of kind `tool`.
- **L-7** A `version` entry that adopts a proposal names the decision
  whose `choice` is that proposal, and that decision's `result` is the
  version's `version`.

When the CADL files of the versions are at hand (the paths in the
`attachments` of the `version` entries, or given to the verifier), a
verifier MUST also report:

- **L-8** The `source_sha256` of the header and of each `version` entry
  is the SHA-256 of the file, and its `sos.version`, `amendment.previous`
  and `amendment.effective` are those of the entry.
- **L-9** Each `parameter` of a proposal of kind `amendment` is a
  parameter of K.3 of the version in force, its `from` is the value of
  the parameter, and its `to` is a value that K.3 allows in one
  amendment.
- **L-10** The decider of a decision that adopts a proposal is the
  authority of K.3 for each parameter it changes (the party whose
  `actor` is `decided_by:`), or the decision has `procedure`
  `override` and a reason. The voters whose votes decide are parties
  whose `actor` is in `voters:`.

A verifier also reports the following **findings**. A finding is not an
error: the record shows something that a reviewer should look at, and
whether it was right is for the reviewer to judge.

| Finding | What the record shows |
| --- | --- |
| **override** | A decision set aside the outcome of the votes (`procedure` `override`). |
| **against recommendation** | A decision chose another option than the recommendation in its basis. |
| **no reason** | A decision of a `human` decider without a reason. |
| **unknowns** | A recommendation in the basis of a decision lists what the advisor did not know. |
| **unmeasured choice** | A decision adopts a proposal of kind `amendment` with no measurement of it in its basis. |
| **reading not decided** | An objective without `measure` was followed by measurements before any decision chose a reading. |
| **open follow-up** | A follow-up has not been fulfilled, and its `due` point has passed (or the record is complete). |
| **corrected** | An entry has a correction. |
| **open record** | The record has no end record. |

## L.7 Relation to Appendix K

An entry of `amendment.decisions` (K.5) names an entry of a decision
record with `kind: record` and a URI reference whose fragment is the
`id` of the entry:

```yaml
sos:
  version: v2
  amendment:
    previous: v1
    effective: { period: 2 }
    decisions:
      - id: d1
        kind: record
        ref: decisions.jsonl#D1
        text: "block_k 3 → 2, adopted against the votes of B and C"
    parameters:
      - id: block_k
        layer: rule
        value: 2
        decision: d1
        # ...
```

The record and the model are written by different parties and at
different times, so neither depends on the other: a model may name
entries of a record, and a record names versions of the model by
`sos.version` and by the SHA-256 of their files (L-8).

## L.8 Mapping to GSN (informative)

A decision record can be shown as a GSN assurance case. A tool that
derives the GSN from the record, instead of writing it separately,
keeps the two from disagreeing.

| Entry or field | GSN element |
| --- | --- |
| a top goal of the series, such as "the system keeps meeting the objectives of its owner" | Goal (written by the tool) |
| `objective` | Goal under the top goal, one per objective |
| the measure in force | Context of the objective's goal |
| `decision` | Strategy under the goal of the objective in force: the argument for the choice |
| `point` and the conditions of the period | Context of the strategy |
| `measurement` and `check` in the basis | Solution of the strategy |
| `reason` | Justification of the strategy |
| `assumptions` | Assumption of the strategy |
| `recommendation` in the basis | Context of the strategy |
| `follow_up` | Goal under the strategy, undeveloped until a later entry fulfils it; the fulfilling entry is its Solution |

## L.9 Example

Period 1 of the English record of Course D (`examples/steward-d-en` of
cadl-robot-town), shortened. Each object is one line of the file; here
it is spread over several lines, and the integrity fields are left out.
The versions are called `v1` and `v2` after the files of the run; the
model of the exercise does not declare the amendment extension yet, so
this is the `sos.version` that those files would give.

```json
{"decisions_format": "cadl-decisions/1", "hash": "sha256", "key_id": null,
 "run_id": "3f2a…", "model": {"name": "RobotTown", "version": "v1", "source_sha256": "9c1e…"},
 "time_base": "one simulated hour of the robot town", "started": "2026-11-18T09:12:03Z",
 "parties": [
  {"id": "operator", "kind": "human", "roles": ["owner", "decider"], "name": "service operator",
   "actor": null, "model": null},
  {"id": "llm", "kind": "llm", "roles": ["proposer", "advisor"], "name": null, "actor": null,
   "model": "claude-opus-5-5"},
  {"id": "steward", "kind": "tool", "roles": ["assessor", "decider"], "name": "town.steward",
   "actor": null, "model": "cadl-robot-town (main, 2026-11-20)"},
  {"id": "A", "kind": "agent", "roles": ["voter"], "name": "company A", "actor": null, "model": null},
  {"id": "B", "kind": "agent", "roles": ["voter"], "name": "company B", "actor": null, "model": null},
  {"id": "C", "kind": "agent", "roles": ["voter"], "name": "company C", "actor": null, "model": null},
  {"id": "customers", "kind": "organisation", "roles": ["affected"], "name": null, "actor": null, "model": null}]}
{"id": "K1", "type": "objective", "point": {"period": 1}, "by": "operator",
 "text": "Deliver as many orders as possible across the town within the times we promised customers …",
 "measure": null, "basis": [], "fulfils": [], "attachments": [], "written": "…"}
{"id": "K1.r1", "type": "proposal", "point": {"period": 1}, "by": "llm", "kind": "measure",
 "objective": "K1", "title": "Maximize on-time deliveries; watch the worst company's waiting tail",
 "measure": [{"metric": "on_time_deliveries", "role": "goal", "direction": "increase", "target": null},
             {"metric": "worst_company_p95_wait_s", "role": "watch", "direction": "decrease", "target": null},
             {"metric": "unfinished", "role": "watch", "direction": "decrease", "target": null}], …}
{"id": "K1.d", "type": "decision", "point": {"period": 1}, "by": "operator",
 "options": ["K1.r1", "K1.r2", "K1.r3"], "choice": "K1.r1", "procedure": "single", "rule": null,
 "reason": "Follow the order of the KPI. … set the level after period 1 is measured.",
 "assumptions": ["Customers cannot choose which company delivers their order"],
 "basis": ["K1", "K1.r1", "K1.r2", "K1.r3", "K1.rec"], "result": null, …}
{"id": "P1.m0", "type": "measurement", "point": {"period": 1}, "by": "steward", "of": "in_force",
 "version": "v1", "method": {"runs": 5, "window": "1h", "description": "seeds 1–5"},
 "values": {"on_time_deliveries": 121.8, "late_deliveries": 10.4, "blocked_s": 2404},
 "per_party": {"A": {"utility": 38.4}, "B": {"utility": 38.9}, "C": {"utility": 28.8}}, …}
{"id": "P1.2", "type": "proposal", "point": {"period": 1}, "by": "llm", "kind": "amendment",
 "title": "Lower blocking_guard threshold from 3 to 2 waiting robots",
 "changes": [{"parameter": "block_k", "from": "3", "to": "2", "layer": "rule"}],
 "rationale": "Only 2.8 blocking_guard evictions fire per period, yet 2404 s of blocked time …", …}
{"id": "P1.2.m", "type": "measurement", "point": {"period": 1}, "by": "steward", "of": "P1.2",
 "values": {"on_time_deliveries": 131.0, "late_deliveries": 1.2, "blocked_s": 985},
 "per_party": {"A": {"utility": 45.4}, "B": {"utility": 37.2}, "C": {"utility": 19.0}},
 "compared_with": "P1.m0", "runs_better": 5, …}
{"id": "P1.2.c", "type": "check", "point": {"period": 1}, "by": "steward", "proposal": "P1.2",
 "results": [{"name": "cadl check", "passed": true, "note": null},
             {"name": "constitution", "passed": true, "note": null},
             {"name": "gain", "passed": true, "note": "+9.2 on on_time_deliveries"}], …}
{"id": "P1.2.vA", "type": "vote", "point": {"period": 1}, "by": "A", "proposal": "P1.2", "value": "yes", "reason": null, …}
{"id": "P1.2.vB", "type": "vote", "point": {"period": 1}, "by": "B", "proposal": "P1.2", "value": "no", "reason": null, …}
{"id": "P1.2.vC", "type": "vote", "point": {"period": 1}, "by": "C", "proposal": "P1.2", "value": "no", "reason": null, …}
{"id": "D1.req", "type": "request", "point": {"period": 1}, "by": "steward", "to": "operator",
 "question": "Should block_k be lowered from 3 to 2 even though companies B and C voted against it …?",
 "options": ["P1.2", "keep"],
 "why": [{"option": "P1.2", "reason": "the main goal improves by +9.2, but B and C voted it down"}], …}
{"id": "D1.rec", "type": "recommendation", "point": {"period": 1}, "by": "llm", "request": "D1.req",
 "recommends": "keep", "reason": "Adopting it means overriding a majority vote. …",
 "unknowns": ["Why C's utility drops sharply while the lowest on-time rate improves", "…"], …}
{"id": "D1", "type": "decision", "point": {"period": 1}, "by": "operator",
 "options": ["P1.2", "keep"], "choice": "P1.2", "procedure": "override", "rule": null,
 "reason": "The intersections are a road shared by the three companies; waiting there is no company's right. …",
 "assumptions": [], "affected": ["C", "customers"], "result": "v2",
 "basis": ["K1.d", "P1.m0", "P1.2", "P1.2.m", "P1.2.c", "P1.2.vA", "P1.2.vB", "P1.2.vC", "D1.req", "D1.rec"], …}
{"id": "D1.f1", "type": "follow_up", "point": {"period": 1}, "by": "operator", "decision": "D1",
 "text": "Re-measure C's utility (28.8 to 19.0) and the road violations (25.8 to 34.0)",
 "due": {"period": 2}, …}
{"id": "V2", "type": "version", "point": {"period": 1}, "by": "steward", "version": "v2",
 "previous": "v1", "effective": {"period": 2}, "source_sha256": "47d0…", "decision": "D1",
 "attachments": [{"path": "v2.cadl", "sha256": "47d0…", "media_type": "application/yaml"}], …}
```

The measurement of period 2 under v2 names `D1.f1` in `fulfils`. A
verifier reports for D1 the findings override, against recommendation,
and unknowns, and no error: the decision gives its reason and its
basis.

## L.10 Reference implementation status

`cadl` 0.3.36 does not read or write decision records. What exists:

- `cadl audit-verify` verifies the chain of G.8, which L.3 uses.
- cadl-robot-town (from the version after v0.2.2) writes
  `evidence.json` (format `robot-town-evidence/1`) in each run of
  `town.steward`. It is a precursor of this format: one JSON document
  with a chain over its records, not a JSON Lines file, and fields of
  the exercise. Its K records correspond to `objective`, `proposal` of
  kind `measure`, `recommendation`, and `decision`; each D record holds
  what this format writes as `measurement`, `proposal`, `check`, `vote`,
  `request`, `recommendation`, `decision`, and `version` entries; it
  has no `follow_up` entries.
- The page Decision Evidence of cadl-explorer (from the version after
  v1.4.2) reads `evidence.json` and shows a timeline of the parties,
  the trail of each decision, the GSN, the findings of L.6, and the
  chain.

Planned: a writer of decision records in cadl-robot-town, a verifier in
`cadl` with the checks of L.6, and the reading of decision records in
cadl-explorer.

## L.11 Backward compatibility

The format is new. It changes no key of a CADL file and no verdict.
K.5 is unchanged; L.7 says how a `ref:` of K.5 names an entry of a
decision record.
