---
sidebar_position: 20.6
title: "Appendix L: Decision Records"
description: "Decision records (decisions 0.3): a file format for the record of how amendments of a model were decided, with the same evidence required of every party, whether a person, an LLM, or a tool. Parties and their roles, the layers on which each decides, a party that decides in place of another, and the delegation that lets it; objectives, proposals, measurements, checks, votes, recommendations, requests, decisions, versions and follow-ups, with what fulfils each follow-up, as entries; the basis of each decision; integrity by the hash chain of G.8; the checks that a verifier makes and the findings it reports for review; the relation to Appendix K and a mapping to GSN."
---

# Appendix L — Decision Records (decisions 0.3)

[Appendix K, K.5](./appendix-k-amendment.md) lets a version of a model
name the records of decisions on which it rests, by a URI reference,
and says nothing about the records themselves. This appendix
gives a format for such a record: a **decision record**. With it, a
tool that does not know the system that wrote a record can read it,
check it, and show it.

A decision record is a file beside the model, not a key of the model.
A CADL file declares nothing to use it, and no verdict of the core or
of an extension depends on it. The format is normative; whether a
system keeps a decision record is its own choice. L.10 says what the
reference implementation and the exercise of Course D do with it.

## L.1 Motivation and scope

The robot town of [Course D](../handson/robot-town-tutorial.md) amends
its rules after every period. An LLM proposes amendments, a tool
measures them on the same random seeds and applies the gates of the
constitution, the three companies vote, and when the gates or the
LLM say so, a human decides after reading a decision request in which
the LLM recommends an option. The human also writes the KPI, and
chooses how it is measured when the LLM reads it in more than one way.
Changes of the regulation, the values of the constitution that bound
the loop, are decided by another person: the regulator.

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
- what each proposer predicted and what an advisor recommended, with
  their reasons, assumptions, and what they said they did not know;
- who decided, by which procedure, with which reason, assumptions and
  unknowns, and on which earlier entries the decision rests;
- which version of the model came into force;
- what the deciders promised to follow up, what would fulfil each
  promise, and whether it was done.

The same evidence is asked of every party. A proposal, a
recommendation, or a decision made by an LLM or by a tool is recorded
with the same fields, and checked by the same rules, as one made by a
person: its reason, the entries it rests on, its assumptions, what it
predicts, and what it does not know (L.4, "Evidence fields"). In Course
D the LLM proposes and recommends, and it may also decide in place of
the human, for amendments of the rules and of the contract with the
customers, and in place of the regulator for the regulation. A reviewer
must be able to read a decision of the LLM as closely as a decision of
the human, and to tell from the record who decided in whose place and
on which layers.

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
  | `decider` | decides, on the layers given to it (`layers`, L.3), also in place of another party (`on_behalf_of`, L.3) |
  | `affected` | is affected by a decision and takes no part in it (for example customers); named so that an entry can say who is affected |

- An **entry** is one line of the record after its header. Each entry
  has a **type** (L.4), an identifier, the party that made it, the
  **point** in the time of the system to which it belongs (a period or
  an instant, as in K.4), and the time at which it was written.
- The **basis** of an entry is the list of earlier entries on which it
  rests. A decision names its basis: the objective in force, the
  measurements, the checks, the votes, the recommendation.
- A **follow-up** is a promise, made with a decision, to check or do
  something later. A later entry **fulfils** it. A follow-up can say what
  a fulfilling entry must be: for a promise to measure again, a
  measurement under the same conditions as the one it re-checks.
- A **delegation** is an entry by which a party lets another party
  decide in its place: on which layers, by which procedures, under which
  conditions, and until when. A tool that adopts changes by its own rule
  and an LLM that answers decision requests in place of a person are
  delegates alike. A decision made within a delegation in force is
  shown under it; a decision made in another's place without one is
  reported for review.
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
| Header | `decisions_format`: `"cadl-decisions/3"`. `hash`, `key_id`, `run_id`: as in the header of G.8. `model`: `name` (the `sos.name` of the model), `version` (the `sos.version` of the first version, or `null`), `source_sha256` (the SHA-256 of the bytes of the first version of the CADL file, or `null`). `time_base`: what a period is, in words, or `null`. `started`: the time at which the record was started, as an ISO 8601 time stamp in UTC. `previous`: for a record that continues another, the `run_id` of that record and the `digest` of its end record; otherwise `null`. `parties`: the parties (below). |
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
| `on_behalf_of` | The `id` of the party in whose place this party acts, or `null`. An LLM that decides in place of the service operator has the role `decider` itself and names the operator's party here. |
| `layers` | The layers on which the party decides: a list of `rule`, `contract`, and `regulation` (the layers of K.3), or `null` when they are not limited. For a party that acts on behalf of another, the layers on which it does so. |

`layers` separates who may decide what. In Course D the service
operator decides on the rules and the contract (`["rule", "contract"]`),
the regulator on the regulation (`["regulation"]`), and the steward,
a tool, adopts by itself only changes of the rules (`["rule"]`); an LLM
that decides in place of the operator has at most the operator's
layers.

A party whose kind is `human` stands for a role held by a person; the
record does not need to name the person. Who held the role is a matter
for the organisation that keeps the record. A party of kind `llm` or
`tool` gives `model`, so that a reader knows which model or which
version of a tool made its entries.

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
| `generated` | For an entry whose text an LLM produced, also when another party wrote the entry: `model` (the model identifier) and `request_digest` (a digest of the request to the LLM, so that two runs with the same input can be told apart from two with different input). Otherwise `null`. |

An option of a decision, a request, or a recommendation is the `id` of
a `proposal` entry, or `"keep"` for leaving the model as it is.

### Evidence fields

A `proposal`, a `recommendation`, and a `decision` carry four more
fields, whatever the kind of the party that makes them:

| Field | Content |
| --- | --- |
| `reason` | Why the party proposes, recommends, or decides it, in the party's own words. Not empty, except in a decision with `procedure` `automatic`, which gives `rule` instead and may give `null`. |
| `assumptions` | What the party takes to be true without having checked it: a list of texts. |
| `unknowns` | What the party says it does not know and would need to know: a list of texts. |
| `predictions` | What the party expects to happen: a list of `option` (the option the prediction is about; for a proposal, its own `id`), `subject` (`metric:<name>` for a metric, `metric:<name>@<party>` for a metric of one party, or `vote:<party>` for a vote), `expected` (`increase`, `decrease`, `unchanged`, `yes`, `no`, or a condition as text, such as `"<= 1"`), and `note` (text or `null`). |

A list may be empty: an empty `unknowns` says that the party names
nothing it does not know. The fields let a reviewer compare what each
party said with what was measured afterwards, in the same way for a
person and for an LLM.

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
| `changes` | For an amendment: a list of `parameter` (the `id` of a parameter of K.3, or a name of the system), `from`, `to` (numbers or durations as text), and `layer` (`rule`, `contract`, `regulation`, or `null`). |
| `objective` | For a reading: the `id` of the objective it reads. |
| `measure` | For a reading: the measure items. |
| `affected` | The `id`s of parties that the change affects and that take no part in deciding it, such as customers for a change of the contract with them; may be empty. |

A proposal also gives the evidence fields.

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

A recommendation also gives the evidence fields.

**`decision`**: a decision.

| Field | Content |
| --- | --- |
| `question` | The question decided, or `null`. |
| `options` | The options that were open. |
| `choice` | The option chosen. |
| `procedure` | `single` (the decider decided alone), `vote` (the decision follows the votes on `choice`), `override` (the decider set aside the outcome of the votes), or `automatic` (a tool applied a rule stated in `rule`). |
| `rule` | For `automatic`, the rule in words (for example "adopt the proposal with the largest gain among those that pass every check and the vote"); otherwise `null`. |
| `affected` | The `id`s of parties affected by the decision, or empty. |
| `result` | The `sos.version` in force after the decision, or `null` for a decision on a reading. |

A decision also gives the evidence fields.

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
| `fulfilled_by` | What fulfils it, or `null` for any later entry that names it in `fulfils`. An object with `type` (the type of the entry, or `null`), and, for a measurement, `of` (`"in_force"` or the `id` of a proposal, or `null`), `same_method_as` (the `id` of an earlier measurement whose `method` the fulfilling measurement must have: the same runs, window and description, that is, the same conditions; or `null`), and `subjects` (the values it must give, as `metric:<name>` or `metric:<name>@<party>`; may be empty). |

A promise to re-measure names the measurement it re-checks in
`same_method_as`: a measurement under other conditions (other seeds,
another demand) does not fulfil it, however close its values. A promise
to act (to propose a mitigation, to revise a reading) gives `type`
`decision` or `proposal`.

**`delegation`**: a party lets another party decide in its place.

| Field | Content |
| --- | --- |
| `to` | The `id` of the party that decides in place of `by`: a party whose `on_behalf_of` is `by`. |
| `layers` | The layers on which `to` may decide in place of `by`: a list of `rule`, `contract`, and `regulation`, or `null` for every layer of `to`. An empty list ends the delegation. |
| `procedures` | The procedures of `decision` that `to` may use: a list of `single`, `vote`, `override`, and `automatic`, or `null` for any. |
| `conditions` | The conditions under which `to` decides, in words (for example, the checks that a proposal must pass before a tool adopts it); may be empty. A verifier does not check them. |
| `until` | The last point that it covers, as a `point`, or `null`. |
| `reason` | Why `by` delegates. |

A delegation is in force from its point to its `until`, and until a
later delegation from the same party to the same party replaces it.
Whether a party may delegate, and to whom, is for the organisation that
keeps the record; the record shows who delegated, when, and within
which limits, so that a reader can tell a decision that a delegate made
within them from one that it made outside them.

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
of earlier lines (or `"keep"`); the `to` of a delegation is the `id` of
a party. The `point` of the entries does not
decrease. Within one point, the entries are written in the order in
which they arise: delegations, objective, proposals, measurements and checks, votes,
request, recommendation, decision, follow-ups, version. This order is
a recommendation: a verifier does not report a record that departs
from it.

## L.6 Checks and findings

A verifier MUST report the following as **errors**. A record with an
error cannot be relied on as it stands.

- **L-1** The file is JSON Lines in UTF-8, the first line is a header
  with `decisions_format` `"cadl-decisions/3"`, and every line has the
  fields of L.3 and L.4 for its kind and type, with no others (for a
  record of `"cadl-decisions/1"` or `"cadl-decisions/2"`, see L.11).
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
  assessor; `vote` voter; `recommendation` advisor; `decision` and
  `delegation` decider;
  `request`, `follow_up`, `version`, `correction`, and `note` any party.
  A decision that adopts a proposal of kind `amendment` is made by a
  party whose `layers` is `null` or holds the `layer` of every change of
  the proposal.
- **L-6** The `choice` of a decision is one of its `options`. The votes
  on a proposal are the `vote` entries on it, one per voter: a later
  vote of a voter replaces an earlier one. A decision with `procedure`
  `vote` or `override` decides on `choice`, or, for a choice of
  `"keep"`, on the first proposal among its `options`; it has in its
  `basis` every earlier vote on that proposal. With `vote`, the votes
  decide as the authority of K.3 says: the yes votes of its voters reach
  the quorum exactly when the decision adopts the proposal. With
  `override`, they do not. Whether the votes reach the quorum can be
  checked only with the CADL file of the version in force (L-9 to
  L-11); without it, a verifier says that it did not check it. A
  decision with `procedure` `automatic` gives `rule`, and its decider is
  a party of kind `tool`; any other decision gives `rule` as `null`.
- **L-7** A `version` entry that adopts a proposal names the decision
  whose `choice` is that proposal, and that decision's `result` is the
  version's `version`.
- **L-8** Every `proposal`, `recommendation`, and `decision` gives the
  evidence fields of L.4, whatever the kind of its party, and its
  `reason` is not empty except as L.4 allows for `automatic`. A party of
  kind `llm` or `tool` gives `model`. The `on_behalf_of` of a party
  names another party, and no party acts in its own place. The
  `subject` of a prediction names a metric or a party with the role
  `voter`. A party that acts on behalf of another acts only on layers
  that the other decides: when the other gives `layers`, its own
  `layers` are not `null` and are among them. The `to` of a
  `delegation` is a party whose `on_behalf_of` is the delegation's `by`,
  and the delegation's `layers`, when `to` gives `layers`, are not
  `null` and are among them.

When the CADL files of the versions are at hand (the paths in the
`attachments` of the `version` entries, or given to the verifier), a
verifier MUST also report:

- **L-9** The `source_sha256` of the header and of each `version` entry
  is the SHA-256 of the file, and its `sos.version`, `amendment.previous`
  and `amendment.effective` are those of the entry.
- **L-10** Each `parameter` of a proposal of kind `amendment` that a
  decision adopts is a parameter of K.3 of the version in force, its
  `from` is the value of the parameter, and its `to` is a value that K.3
  allows in one amendment. A proposal that no decision adopts may lie
  outside them: the record shows what was proposed, and its checks show
  that it was turned down; a verifier reports it as not amendable.
- **L-11** The decider of a decision that adopts a proposal is the
  authority of K.3 for each parameter it changes (the party whose
  `actor` is `decided_by:`), or acts on behalf of that party
  (`on_behalf_of`), or the decision has `procedure` `override`. The
  voters whose votes decide are parties whose `actor` is in `voters:`.

A verifier also reports the following **findings**. A finding is not an
error: the record shows something that a reviewer should look at, and
whether it was right is for the reviewer to judge.

| Finding | What the record shows |
| --- | --- |
| **override** | A decision set aside the outcome of the votes (`procedure` `override`). |
| **against recommendation** | A decision chose another option than the recommendation in its basis. |
| **delegated** | A decision was made by a party that acts on behalf of another (`on_behalf_of`), for example an LLM in place of the service operator, and no delegation in force covers it: none from that other party to it whose `layers` hold the layer of every change of the proposal that the decision adopts, and whose `procedures` hold its `procedure`. A verifier names, for each decision that a delegation covers, that delegation, and does not report it. |
| **unknowns** | A decision, or a recommendation in its basis, lists what its party did not know. |
| **prediction missed** | A prediction of a proposal, a recommendation, or a decision is contradicted by a later entry. For a metric: a later measurement of the option it is about, compared with the measurement in its `compared_with`, that is not above it (`increase`), not below it (`decrease`), different from it (`unchanged`, within a tolerance that the verifier states), or that does not meet the condition. For a vote: a later vote of the party it names, other than the one expected. |
| **affected not measured** | A decision adopts a proposal whose `affected` parties, or, for a change of a parameter of layer `contract`, the parties with the role `affected`, have no values in `per_party` of any measurement of the proposal in the basis. |
| **unmeasured choice** | A decision adopts a proposal of kind `amendment` with no measurement of it in its basis. |
| **reading not decided** | An objective without `measure` was followed by measurements before any decision chose a reading. |
| **fulfilment not shown** | An entry names a follow-up in `fulfils` but is not what its `fulfilled_by` asks: another type, a measurement of something else, by another `method` than the measurement named in `same_method_as`, or without a value of a `subject`. Such an entry does not fulfil the follow-up. |
| **open follow-up** | A follow-up has not been fulfilled (no later entry names it in `fulfils` and meets its `fulfilled_by`), and its `due` point has passed (or the record is complete). |
| **not amendable** | A proposal of kind `amendment` that no decision adopts changes a parameter that K.3 of the version in force does not declare, or to a value that K.3 does not allow in one amendment (L-10). |
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
`sos.version` and by the SHA-256 of their files (L-9).

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
| `unknowns` and `predictions` | Context of the strategy; a prediction that a later measurement contradicts is a counter-evidence of it |
| `recommendation` in the basis | Context of the strategy |
| `delegation` | Context of the strategy of each decision that it covers |
| `follow_up` | Goal under the strategy, undeveloped until a later entry fulfils it (meeting `fulfilled_by`); the fulfilling entry is its Solution |

## L.9 Example

Period 1 of the English record of Course D (`examples/steward-d-en` of
cadl-robot-town), shortened. Each object is one line of the file; here
it is spread over several lines, and the integrity fields are left out.
The versions are called `v1` and `v2` after the files of the run; from
cadl-robot-town v0.5.0 these files declare the amendment extension and
give this `sos.version`. The predictions
of the proposal are taken from the text of its reason; the human gave
no assumptions, unknowns, or predictions for D1, which the empty lists
record.

```json
{"decisions_format": "cadl-decisions/3", "hash": "sha256", "key_id": null,
 "run_id": "3f2a…", "model": {"name": "RobotTown", "version": "v1", "source_sha256": "9c1e…"},
 "time_base": "one simulated hour of the robot town", "started": "2026-11-18T09:12:03Z",
 "previous": null, "parties": [
  {"id": "operator", "kind": "human", "roles": ["owner", "decider"], "name": "service operator",
   "actor": null, "model": null, "on_behalf_of": null, "layers": ["rule", "contract"]},
  {"id": "regulator", "kind": "human", "roles": ["decider"], "name": "regulator",
   "actor": null, "model": null, "on_behalf_of": null, "layers": ["regulation"]},
  {"id": "llm", "kind": "llm", "roles": ["proposer", "advisor"], "name": null, "actor": null,
   "model": "claude-opus-5-5", "on_behalf_of": null, "layers": null},
  {"id": "steward", "kind": "tool", "roles": ["assessor", "decider"], "name": "town.steward",
   "actor": null, "model": "cadl-robot-town (main, 2026-11-21)", "on_behalf_of": null, "layers": ["rule"]},
  {"id": "A", "kind": "agent", "roles": ["voter"], "name": "company A", "actor": null, "model": null, "on_behalf_of": null, "layers": null},
  {"id": "B", "kind": "agent", "roles": ["voter"], "name": "company B", "actor": null, "model": null, "on_behalf_of": null, "layers": null},
  {"id": "C", "kind": "agent", "roles": ["voter"], "name": "company C", "actor": null, "model": null, "on_behalf_of": null, "layers": null},
  {"id": "customers", "kind": "organisation", "roles": ["affected"], "name": null, "actor": null, "model": null, "on_behalf_of": null, "layers": null}]}
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
 "affected": ["customers"],
 "reason": "Only 2.8 blocking_guard evictions fire per period, yet 2404 s of blocked time …",
 "assumptions": ["Queues of two robots are common, queues of three are rare"], "unknowns": [],
 "predictions": [{"option": "P1.2", "subject": "metric:blocked_s", "expected": "decrease", "note": null},
                 {"option": "P1.2", "subject": "vote:A", "expected": "yes", "note": null},
                 {"option": "P1.2", "subject": "vote:B", "expected": "yes", "note": "probably"},
                 {"option": "P1.2", "subject": "vote:C", "expected": "no", "note": null}],
 "generated": {"model": "claude-opus-5-5", "request_digest": "5be0…"}, …}
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
 "assumptions": [], "predictions": [],
 "unknowns": ["Why C's utility drops sharply while the lowest on-time rate improves", "…"], …}
{"id": "D1", "type": "decision", "point": {"period": 1}, "by": "operator",
 "options": ["P1.2", "keep"], "choice": "P1.2", "procedure": "override", "rule": null,
 "reason": "The intersections are a road shared by the three companies; waiting there is no company's right. …",
 "assumptions": [], "unknowns": [], "predictions": [], "affected": ["C", "customers"], "result": "v2",
 "basis": ["K1.d", "P1.m0", "P1.2", "P1.2.m", "P1.2.c", "P1.2.vA", "P1.2.vB", "P1.2.vC", "D1.req", "D1.rec"], …}
{"id": "D1.f1", "type": "follow_up", "point": {"period": 1}, "by": "operator", "decision": "D1",
 "text": "Re-measure C's utility (28.8 to 19.0) and the road violations (25.8 to 34.0)",
 "due": {"period": 2},
 "fulfilled_by": {"type": "measurement", "of": "in_force", "same_method_as": "P1.m0",
                  "subjects": ["metric:utility@C", "metric:road_violations"]}, …}
{"id": "V2", "type": "version", "point": {"period": 1}, "by": "steward", "version": "v2",
 "previous": "v1", "effective": {"period": 2}, "source_sha256": "47d0…", "decision": "D1",
 "attachments": [{"path": "v2.cadl", "sha256": "47d0…", "media_type": "application/yaml"}], …}
```

In period 2 the record goes on:

```json
{"id": "P2.m0", "type": "measurement", "point": {"period": 2}, "by": "steward", "of": "in_force",
 "version": "v2", "method": {"runs": 5, "window": "1h", "description": "seeds 101–105, rush"},
 "values": {"road_violations": 28.0, …}, "per_party": {"C": {"utility": 56.3}, …},
 "fulfils": ["D1.f1"], …}
{"id": "F2.D1.f1", "type": "measurement", "point": {"period": 2}, "by": "steward", "of": "in_force",
 "version": "v2", "method": {"runs": 5, "window": "1h", "description": "seeds 1–5"},
 "values": {"road_violations": 34.0, …}, "per_party": {"C": {"utility": 19.0}, …},
 "compared_with": "P1.m0", "fulfils": ["D1.f1"], …}
```

A verifier reports for D1 the findings override, against recommendation,
and unknowns, and no error: the decision gives its reason and its
basis. For P1.2 it reports prediction missed: the LLM expected B to
vote for the change, and B voted against it. For P2.m0 it reports
fulfilment not shown: the measurement of period 2 names `D1.f1`, but it
was made on other seeds and another demand than P1.m0, so it does not
re-check the values of period 1. `F2.D1.f1`, a measurement of v2 under
the conditions of P1.m0, fulfils it.

Had the service operator let the LLM decide in its place, the record
would have one more party, a delegation from the operator to it, and the
decision would be written in the same way, with the same fields and the
same checks:

```json
{"id": "llm-decider", "kind": "llm", "roles": ["decider"], "name": null, "actor": null,
 "model": "claude-opus-5-5", "on_behalf_of": "operator", "layers": ["rule", "contract"]}
{"id": "G.llm-decider", "type": "delegation", "point": {"period": 1}, "by": "operator",
 "to": "llm-decider", "layers": ["rule", "contract"], "procedures": ["single", "vote"],
 "conditions": ["answer the decision requests of the steward on the rules and the contract"],
 "until": null, "reason": "The operator lets the LLM answer the decision requests (--delegate rule,contract).", …}
{"id": "D1", "type": "decision", "point": {"period": 1}, "by": "llm-decider",
 "options": ["P1.2", "keep"], "choice": "keep", "procedure": "vote", "rule": null,
 "reason": "Adopting it means overriding a majority vote. …",
 "assumptions": ["…"], "unknowns": ["Why C's utility drops sharply …", "…"],
 "predictions": [{"option": "keep", "subject": "metric:late_deliveries", "expected": "unchanged", "note": null}],
 "generated": {"model": "claude-opus-5-5", "request_digest": "…"}, "result": "v1", …}
```

Here the verifier reports unknowns, and names G.llm-decider as the
delegation under which D1 was made. Whether the LLM may decide in place
of the operator, and for which layers, is for the organisation that
keeps the record; the record shows that it did, on which layers, and
who let it. Without G.llm-decider, or had the LLM set aside the outcome
of the votes (`override`, which G.llm-decider does not give), the
verifier would report delegated. An LLM that acts for the operator cannot adopt a change
of the regulation: the operator's `layers` do not hold it (L-8), and a
decision that adopts such a change is an error (L-5). A change of the
regulation goes to the regulator in a request of its own, and an LLM
that decides it acts on behalf of the regulator.

## L.10 Reference implementation status

From `cadl` 0.3.39 (decisions 0.3; `cadl` 0.3.38 implemented decisions
0.2, and 0.3.37 decisions 0.1):

- `cadl.decisions.DecisionChain` writes a record, and `cadl
  decisions-verify RECORD.jsonl` checks it: the errors L-1 to L-8, and
  L-9 to L-11 against the CADL files of the versions (the `.cadl`
  attachments of the `version` entries and the files given with
  `--version`). It reports the findings of L.6 and lists what it could
  not check. It counts a value as `unchanged` within 1 % of the value it
  is compared with. `--key`, `--run-id` and `--anchor` work as for
  `cadl audit-verify`. It reads records of `cadl-decisions/1` and `/2`
  as well (L.11). The writer fills `layers` and `fulfilled_by` with
  `null` when its caller leaves them out. For each decision made within
  a delegation it names the delegation.
- cadl-robot-town (from v0.4.0) writes `decisions.jsonl` in each run of
  `town.steward` and `town.council`. The operator decides on the rules
  and the contract, and a regulator, another party, on the regulation,
  in a decision request of its own. With `--decider llm`, the LLM
  answers the requests in place of the human for the layers given with
  `--delegate`, as a party with `on_behalf_of`. A promise to re-measure
  names the measurement of its period in `same_method_as`, and the
  steward makes that measurement in the next period. From v0.5.0 each
  version entry, the first version included, attaches the CADL file of
  its version, written with the amendment extension (Appendix K: the
  amendable parameters, their places and ranges, and who decides each
  layer), so the verifier checks L-9 to L-11 and the outcome of the
  votes. The steward and the council adopt rule changes on behalf of the
  operator; a regulation proposal is measured by applying its value to
  the measurements and votes of its period; a follow-up says whether a
  measurement, a proposal or a decision fulfils it. From v0.6.0 the record
  starts with the delegations of the operator (and of the regulator): to
  the steward or the council the rule layer by its own rule (`automatic`),
  and to the LLM the layers given with `--delegate`. A regulation
  proposal is also applied to every proposal measured in the earlier
  periods, and for each company the measurement gives how many proposals
  would pass although it voted against them. A question promised in a
  follow-up is put to its decider when it falls due, and every open
  question in the last period. `python -m town.check_examples` runs the
  examples again in continuous integration and compares their histories,
  GSN and findings.
- The page Decision Evidence of cadl-explorer (from v1.5.0) reads a
  record, verifies it with `cadl.decisions`, and shows a timeline of the
  parties, the trail of each decision, the evidence of each party, the
  GSN of L.8, the findings and the chain. From v1.6.0 it shows the
  layers of each decider and whether each follow-up was fulfilled. From
  v1.7.0 it takes the CADL files of the versions with the record, and
  checks L-9 to L-11 with them. From v1.8.0 it lists the delegations and
  the decisions made within each, and shows them in the timeline and the
  GSN.

## L.11 Backward compatibility

The format is new. It changes no key of a CADL file and no verdict.
K.5 is unchanged; L.7 says how a `ref:` of K.5 names an entry of a
decision record.

decisions 0.3 adds the entry type `delegation` to decisions 0.2, and
the header names `"cadl-decisions/3"`. It also narrows L-10 to the
proposals that a decision adopts, for records of every format: a
proposal outside K.3 that no decision adopts was an error and is now
the finding not amendable. A verifier reads a record of
`"cadl-decisions/2"` as before: it has no delegations, so every
decision made on behalf of another party is reported as delegated, and
a `delegation` entry in it is an error (L-1).

decisions 0.2 adds two fields to decisions 0.1: `layers` of a party
and `fulfilled_by` of a follow-up, and the header names
`"cadl-decisions/2"`. A record of `"cadl-decisions/1"` has neither
field; a verifier reads it as a record in which every party decides on
any layer and every follow-up is fulfilled by any later entry that names
it, and does not accept the two fields in it.
