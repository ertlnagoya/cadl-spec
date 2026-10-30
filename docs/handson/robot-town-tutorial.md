---
sidebar_position: 6
sidebar_label: "Course D — Robot Town"
title: "Course D — Robot Town (amending rules toward a KPI)"
---

# Course D — Robot Town: Amending Rules Toward a KPI

> ⬅ Back to Course A → [Course A — Robot Delivery](../textbook/index.md)

> **Audience**: Students who have completed [Course A](../textbook/index.md) (CADL/SoS-DSL basics).
> Course B is not required.
>
> **Time**: 120–150 minutes, plus optional stretch goals.
>
> **You will leave with**: KPIs written by a human in natural language, the LLM's amendment
> proposals and decision requests, the human's decisions with their reasons (in prose and in GSN),
> and the versions of the CADL rules and of the constitution that resulted, period by period.

---

## 0. What this course demonstrates

Courses A and B write a contract once and check a simulation against it. In Course D the
contract itself changes while the system runs. Three delivery companies (A, B, C; two robots
each) share the 11-node road network of the Raspberry Pi Mouse simulator. After each simulated
hour (one period), amendments to the rules are considered.

A human, an LLM and a set of mechanical gates share the work:

| Who | Does what |
|---|---|
| Human (the service operator) | Writes the service KPIs in natural language; the KPIs may change over time. Answers the LLM's decision requests and records the reason and the outcome, in prose or in GSN |
| LLM | Turns the KPI into measurable metrics and proposes amendments to rules, regulation and contracts toward it. When a question cannot clearly be settled, or when human stakeholders must agree, it does not decide: it asks the human and supplies what the decision needs |
| Gates | Check, constitution, improvement measured on the same random seeds, and the companies' vote. The LLM's own account is never trusted; only measured values count |

```
kpi.md (written by a human in natural language; may change per period)
   │  the LLM turns it into a measure; if it can be read several ways, the human picks  ← request K<k>
   ▼
measure robot_town.cadl (version k) in this period's environment
   │  the LLM proposes amendments (rules, contract, regulation)
   │  gates: check → constitution → improvement (same seeds) → vote
   ▼
does any proposal raise agreement, contract, regulation, safety, KPI conflict or uncertainty, or did the LLM ask?
   ├ no  → adopt automatically the gate-passing proposal with the best KPI
   └ yes → the LLM writes a decision request and the human answers                 ← request D<k>
   ▼
robot_town.cadl (version k+1) and the record of decisions (decisions.md, gsn.yaml)
   │  next period, the LLM reads the human's decisions and reasons before proposing
```

The exercise lives in the public repository
[`cadl-robot-town`](https://github.com/ertlnagoya/cadl-robot-town). It needs neither Unity nor
SUMO: the town is a small Python simulation, and the norms are judged by the same reference runtime
as Course A (`contract_engine.py`, copied from `cadl-raspimouse-simulator`).

:::info[About the recorded LLM output]
§4–§8 can be followed without an API key by replaying the records in `examples/steward-d-en/`
(English) and `examples/steward-goodhart/`. They are **records of real runs** with Claude Opus 5.5 on
2026-10-29/30; `examples/steward-d/` holds the same run in Japanese. The answers to the decision
requests (`answers.yaml`) were written by Claude playing the human operator when the records were
made; from §4 on, answer them yourself. Every number shown is measured by the gates and the
simulation on replay. §10 shows how to run a real LLM with your own key.
:::

---

## 1. Setup (5 min)

All you need is the CADL compiler cloned in Course A (`~/program/cadl_repo`).

```bash
cd ~/program
git clone https://github.com/ertlnagoya/cadl-robot-town
cd cadl-robot-town
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install --upgrade pip
pip install -e ~/program/cadl_repo     # the cadl command and PyYAML
```

If the install fails, see the setup troubleshooting in [Section 2.4 of the Textbook](../textbook/02-toolchain-setup.md).

Only §10 (a real LLM) needs the Anthropic SDK and an API key.

```bash
pip install anthropic
```

> `town.steward --lang en` prints English and asks the LLM to write in English. `town.period`,
> `town.council` and `town.compare` print Japanese only; each step below explains what you need
> from their output.

---

## 2. Read the rules, the contract and the regulation (15 min)

Open `cadl/robot_town.cadl`. The town has two contracts.

- **`DELIVERY_SLA`**: one instance per order. Pick up within 120 s and deliver within 120 s of
  pickup, or the order becomes `Late`. This is the promise to customers.
- **`ROAD_USE`**: one instance each time a robot stops on the road to wait for its next order.

```yaml
    - id: DELIVERY_SLA
      parties: [TOWN_STEWARD, "ROBOT[*]"]
      guarantee:
        - "pickup_time <= 120s"         # @amend:pickup_deadline
        - "dropoff_time <= 120s"        # @amend:dropoff_deadline
      lifecycle:
        ...
          - id: pickup
            from: Assigned
            to:   PickedUp
            on:   "ROBOT[i].status == PickedUp"
            deadline: 120s            # @amend:pickup_deadline
            on_violation: { transition: Late, severity: Major }
        ...
    - id: ROAD_USE
      parties: [TOWN_STEWARD, "ROBOT[*]", COUNCIL]
      authority:
        decision_holder: COUNCIL
      incentives:
        type: sanction
        lambda: 0.5                   # @amend:sanction_lambda
      lifecycle:
        states: [Holding, Overstay, Released, Evicted]
        initial: Holding
        terminal: [Released, Evicted]
        transitions:
          - id: release
            from: [Holding, Overstay]
            to:   Released
            on:   "ROBOT[i] -> TOWN_STEWARD : node_released"
            deadline: 60s             # @amend:hold_limit
            on_violation: { transition: Overstay, severity: Minor }
      monitors:
        - id: blocking_guard
          observe: "ROBOT[i].blocking"
          sampling: periodic(1000ms)
          rule: "ROBOT.blocking >= 3 AND state IN [Holding, Overstay]"  # @amend:block_k
          on_match: { transition: Evicted, severity: Major }
```

(Excerpt, simplified.)

A line tagged `# @amend:<name>` holds a parameter that may be amended. When several lines carry
the same name (the pickup guarantee and the pickup deadline), they must all hold the same value.
Which **layer** a parameter belongs to and how far it may move is set by `constitution.yaml`:

```yaml
amendable:
  hold_limit:       {layer: rule,     min: 10, max: 120, step: 10}   # seconds a robot may wait on the road
  block_k:          {layer: rule,     min: 1,  max: 4,   step: 1}    # robots waiting behind it before eviction
  sanction_lambda:  {layer: rule,     min: 0.0, max: 2.0, step: 0.5} # sanction points per violation (Minor 1, Major 3)
  to_central:       {layer: rule, safety: true, ...}                  # operating-mode switch (§9)
  pickup_deadline:  {layer: contract, min: 60, max: 180, step: 30}   # promised seconds to pickup
  dropoff_deadline: {layer: contract, min: 60, max: 180, step: 30}   # promised seconds to delivery
invariants:
  min_company_on_time_rate: 0.6
vote:
  quorum: 2
regulation:
  invariants.min_company_on_time_rate: {min: 0.5, max: 0.95, step: 0.05}
  vote.quorum:                         {min: 1,   max: 3,    step: 1}
```

(Excerpt, simplified.)

There are three layers of amendment:

| Layer | Covers | Who decides |
|---|---|---|
| Rule | `ROAD_USE` and the operating-mode switching conditions | adopted automatically if it passes every gate; the switching conditions (`safety: true`) are decided by the human |
| Contract | `DELIVERY_SLA` (the promise to customers) | customers have no vote, so the human decides |
| Regulation | values in the constitution (invariants, quorum) | the human decides |

The three companies behave differently (`town/policies.py`): **A** always returns to its
garage; **B** waits on the road for its next order but leaves 5 s before `hold_limit`, and does not
wait on the road at all if a single waiting robot triggers eviction (`block_k` of 1); **C** waits
until an order comes or it is evicted, unless `sanction_lambda` reaches 1.5, when it behaves like
B. A robot stopped at an intersection blocks everyone who wants to pass through it.

### Exercise 2-1

1. Which company can never be sanctioned under the current rules, and why?
2. If the pickup promise (`pickup_deadline`) were extended to 150 s, what would you expect to happen
   to the number of on-time deliveries? And to how long customers actually wait?
3. Why must an amendment to the contract layer not be settled by the companies' vote alone?

---

## 3. Run one period (10 min)

Fix the operating mode to distributed for now (§9 explains the modes):

```bash
python -m town.period --mode DISTRIBUTED
```

```text
需要: 各社の注文の平均間隔 75 秒
運用モード: DISTRIBUTED
規則: robot_town.cadl  (hold_limit=60s, block_k=3, sanction_lambda=0.5)
  定時配達 121.8 / 注文 132.2  未配達 0.0  ふさがれた時間 2404s  （シード平均）
  会社  定時率  遅配  道路で待った回数  ふさがれた秒数  罰点   効用
   A     0.84   7.8               0.0            1352    0.0   38.4
   B     0.94   2.6              38.0             849    0.9   38.9
   C     1.00   0.0              39.6             203   14.8   28.8
  違反（原因別，シード平均）: deadline:dropoff=2.6, deadline:pickup=7.8, deadline:release=23.0, monitor:blocking_guard=2.8
  運用モード: 集中の時間 0%  切替 0.0 回（切替中の合計 0s，管理者による退去 0.0 台，安全条件の違反 0.0 回）
```

The columns are: on-time rate, late deliveries, times waited on the road, seconds blocked by
stopped robots, sanction points, and utility (on-time deliveries minus sanction points). The
numbers are averages over five random seeds.

C waits on the road, reaches every customer on time, and pays 14.8 sanction points for it; A, which
never blocks anyone, is blocked for 1352 s and loses 7.8 deliveries. Every violation in the
second-to-last line was detected by the contract runtime from the IR: `deadline:*` by lifecycle
deadlines, `monitor:blocking_guard` by the monitor.

---

## 4. Write the KPI (15 min)

The human's first job is to write the KPI. In English it goes in `kpi.en.md`:

```markdown
## From period 1

Deliver as many orders as possible across the town within the times we promised customers
(120 seconds from order to pickup, 120 seconds from pickup to delivery). No company's customers
should be kept waiting badly.

## From period 5

The quiet season begins and orders fall. On-time delivery still matters, but to keep the
companies cooperating, no single company should gain or lose because of how the road is used.
```

A `## From period k` heading says when a KPI takes effect (the Japanese file, `kpi.md`, uses
`## 第 k 期から`). The loop re-reads the file at the start of every period, so you may edit it
between periods. `--lang en` makes the loop's own text and the LLM's writing English.

A natural-language KPI cannot rank proposals by itself. The LLM rewrites it as a combination of the
metrics in `town/kpi.py` (on-time deliveries, late deliveries, unfinished orders, blocked time, the
lowest company's on-time rate, the spread of the companies' utilities, total sanctions, and so on).
This is the **measure**: a main goal (improvement is measured by it), watched goals (the human is
told if they get worse by more than the noise) and conditions (which every amendment must keep).

Replay the record and run one period. Without `--answers`, you answer decision requests in the
terminal.

```bash
python -m town.steward --lang en --mode DISTRIBUTED --rounds 1 --name try-d-en \
    --llm replay --replay-dir examples/steward-d-en
```

```text
  KPI (from period 1): Deliver as many orders as possible across the town within the times we promised customers (120 seconds from order to pickup, 120 seconds from pickup to delivery). No company's customers should be kept waiting badly.
  LLM: replay: examples/steward-d-en/p1-kpi.json (claude-opus-5-5, input 2428 / output 2266 tokens)
  Reading: The KPI has two parts. The main goal is to maximize the number of orders delivered town-wide within the promised SLA times (120 s order-to-pickup, 120 s pickup-to-delivery), which maps directly to on_time_deliveries. The second part, 'no company's customers should be kept waiting badly', is a fairness floor across companies A, B and C. (…)
   [1] Maximize town-wide on-time deliveries with a floor on the worst company: main goal on_time_deliveries (increase), min_company_on_time_rate (increase), unfinished (decrease), late_deliveries (decrease); conditions min_company_on_time_rate >= 0.8, unfinished <= 3
   [2] Maximize the worst company's on-time rate (maximin fairness first): main goal min_company_on_time_rate (increase), on_time_deliveries (increase), unfinished (decrease); conditions unfinished <= 3
   [3] Maximize town-wide on-time deliveries with a cap on the inter-company gap: main goal on_time_deliveries (increase), on_time_rate_gap (decrease), min_company_on_time_rate (increase); conditions on_time_rate_gap <= 0.15
   Concern: 'Kept waiting badly' is not quantified. It could mean an absolute floor per company, a limit on the spread between companies, or no orders left undelivered. The numeric thresholds in the guards are provisional guesses and should be set from baseline measurements.
   Concern: on_time_deliveries is a proxy that ignores orders already past their deadline. Optimizing it alone could deprioritize late orders and leave them unfinished, which is exactly the badly-kept-waiting outcome the KPI forbids. (…)
   Concern: The promised times (120 s / 120 s) are part of the KPI and of DELIVERY_SLA. Raising the on-time count by loosening the SLA would game the metric, and any SLA change must be decided by humans as a contract amendment.
   (2 more)
  → Decision request K1 (the LLM recommends 1)
  Choose an id (1 / 2 / 3):
```

This replays what Claude Opus 5.5 actually wrote on 2026-10-29. When a KPI has a single reading and
no concern, the LLM uses its measure without asking. Here it found "kept waiting badly"
unquantified and returned three measures with five concerns. The machine checks the metric names
and the shape of every measure the LLM writes; one that uses an unknown metric is dropped from the
choices.

After you pick a number you are asked for a reason and for assumptions (GSN Assumptions; any
number of lines, an empty line ends). The recorded answers (`examples/steward-d-en/answers.yaml`)
were written by Claude playing the operator when the record was made:

```yaml
K1:
  choice: "1"
  reason: Follow the order of the KPI. Town-wide on-time deliveries are the main goal, and the worst company's on-time rate, unfinished orders and late deliveries are watched. The floors are provisional, as the LLM says; 0.8 keeps today's worst company (0.84) from falling further. (…)
  assumptions:
    - Customers cannot choose their delivery company
```

### Exercise 4-1

1. How do you expect the decision request in §5 to change if you pick measure 2?
2. The last concern restates question 2 of Exercise 2-1. Where in the KPI's wording did the LLM
   find that?

---

## 5. Answer a decision request (20 min)

After K1, the LLM proposes amendments and each passes through the gates:

```text
| id | proposal | layer | check | constitution | on-time | late | blocked s | road violations | lowest on-time rate | change in on_time_deliveries | seeds improved | KPI conditions | utility A / B / C | votes A B C |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| — | current | — | — | — | 121.8 | 10.4 | 2404 | 25.8 | 0.84 | — | — | — | 38.4 / 38.9 / 28.8 | — |
| 1 | block_k 3 → 2 | rule | ○ | ○ | 131.0 | 1.2 | 985 | 34.0 | 0.98 | +9.2 | 5/5 | ○ | 45.4 / 37.2 / 19.0 | ○ × × |
| 2 | hold_limit 60s → 50s | rule | ○ | ○ | 120.6 | 11.6 | 2468 | 28.8 | 0.86 | -1.2 | 2/5 | ○ | 38.8 / 37.6 / 27.2 | ○ × × |
| 3 | sanction_lambda 0.5 → 1 | rule | ○ | ○ | 121.8 | 10.4 | 2404 | 25.8 | 0.84 | +0.0 | 0/5 | ○ | 38.4 / 38.0 / 14.0 | ○ × × |
| R1 | invariants.min_company_on_time_rate 0.6 → 0.65 | regulation | — | ○ | | | | | | | | | | |
```

(The "watched goals and conditions" and "notes" columns are left out here; the note on R1 reads
"the current rules meet the new condition".) The LLM's first proposal, `block_k 3 → 2` (evict a
robot as soon as two robots wait behind it), adds 9.2 on-time deliveries but is voted down by B
and C. It also proposed a regulation: raising the constitution's floor on every company's on-time
rate from 0.6 to 0.65. It proposed no contract change, having read at K1 that loosening the
promised times does not count as improving the KPI.

The loop does not decide when a proposal raises any of the following (`triage()` in
`town/steward.py`):

| Reason | When |
|---|---|
| Agreement | it improves the KPI but is voted down, and beats every proposal that could be adopted automatically |
| Contract | it changes the promise to customers and improves the KPI |
| Regulation | it changes a value of the constitution |
| Safety | it changes an operating-mode switching condition and improves the KPI |
| KPI conflict | it improves the main goal but breaks a KPI condition or worsens a watched goal |
| Uncertain | it passes every gate but improves on fewer than 4 of the 5 seeds |
| LLM | the LLM itself said a human should decide (only for proposals that keep the constitution's invariants) |

Here proposal 1 raises *agreement* and R1 raises *regulation*. The LLM writes decision request D1,
saved as `runs/try-d-en/p1-request.md`:

```text
  → Decision request D1 (LLM: replay: examples/steward-d-en/p1-request.json (claude-opus-5-5, input 2712 / output 1957 tokens))
  **Question**: Should we adopt the rule change block_k 3 → 2 even though B and C voted against it, raise the constitutional floor invariants.min_company_on_time_rate from 0.60 to 0.65, or keep the current rules (v1)?
  - **1**: block_k 3 → 2. (…) Adopting it means overriding the votes of B and C (votes ○ × ×). (stakeholders: Gains: customers of all companies, because late deliveries fall from 10.4 to 1.2 and the worst company's on-time rate rises to 0.98. Company A also gains (utility 38.4 → 45.4). Losses: Company C (utility 28.8 → 19.0) and, slightly, Company B (38.9 → 37.2). (…))
  - **R1**: (…) The current rules (lowest on-time rate 0.84) already meet it, so nothing changes in operation now. It only blocks future changes that would let the worst company fall below 0.65. (…)
  - **keep**: no change. (…)
  The LLM recommends: R1 — R1 is low-risk: the current rules (0.84) and proposal 1 (0.98) both satisfy it. It strengthens the KPI's fairness clause without overriding anyone. Proposal 1 has the strongest measured KPI gain, but it failed the company vote, cuts C's utility by about a third, and raises road violations. I suggest not forcing it now. Instead, take it to B and C for negotiation, (…) and re-measure before deciding.
  The LLM does not know: Why C's utility drops sharply (28.8 → 19.0) under proposal 1 while the lowest company on-time rate rises to 0.98; the utility components were not broken down.
  The LLM does not know: Whether B and C would accept proposal 1 with compensation or a modified threshold, and how the companies would change their behaviour if it were forced through.
  The LLM does not know: Whether overriding a failed company vote is acceptable under the town's governance norms.
  (3 more)
```

A request contains the question; why the LLM is not deciding; for each option what happens and who
gains or loses; the LLM's recommendation; and what the LLM does not know. The options are the
proposals that raised a reason, the proposal that could be adopted automatically (if any) and
"keep"; the LLM cannot add options. The table of numbers is the gates' measurement, not the LLM's
prose.

The recorded answer goes against the LLM's recommendation and adopts proposal 1, overturning the
vote:

```yaml
D1:
  choice: "1"
  reason: The intersections are a road shared by the three companies; waiting there is no company's right. Late deliveries fall from 10.4 to 1.2 and the worst company's on-time rate rises, so adopt it against B's and C's votes. Re-measure C's utility (28.8 to 19.0) and the road violations next period. The constitutional floor (R1) can wait; it changes nothing now.
  assumptions:
    - B and C keep delivering in town after the rules change
```

The same period in Japanese (`examples/steward-d/`) produced no regulation proposal, and its
recommendation changed when the request was sent a second time on the same numbers (first "1",
then "keep"). A recommendation is the output of one request. The LLM laid out the material and
showed that both choices had reasons; the human decided.

### The record of decisions

Each decision goes into two files in `runs/<name>/`:

- `decisions.md`: the prose record — for each decision, the measure, the LLM's assessment, why the
  human was asked, the LLM's recommendation and unknowns, and the human's choice and reason.
- `gsn.yaml`: a GSN (Goal Structuring Notation) tree, with a Mermaid diagram in `gsn.md`.

| GSN element | What goes in it |
|---|---|
| Goal | the KPI written by the human (one per version) |
| Strategy | the decision of a period (the amendment adopted, or no change) |
| Solution | the measurement on the same seeds (`p<k>-evidence.md`) |
| Context | the measure of the KPI; the period's environment |
| Assumption | assumptions written by the human |
| Justification | the human's reason (or, for an automatic decision, its condition) |

Reasons may be written in prose or as GSN elements; in the `--answers` YAML, list elements (each
with `type:` and `text:`) under `gsn:`. For example (the recorded answer to D2 gives its reason in
prose):

```yaml
D2:
  choice: keep
  gsn:
    - type: justification
      text: Only 2 of 5 seeds improve; do not cut C's utility by 16 for an uncertain gain
    - type: context
      text: In D1 we decided to re-measure C's utility
```

From the next period on, earlier decisions and the human's reasons are passed to the LLM. §6 shows
how that changes its proposals and recommendations.

### Compare: a council with no human

The same first period with the rule-based council (`town.council`), which tries every one-step
amendment to the rules and adopts the gate-passing one with the best objective, never a vetoed one:

```bash
python -m town.council --mode DISTRIBUTED
```

```text
  改正案                                  定時配達  違反 (道路) ふさがれた  検査 憲法 改善 投票(A B C)
  hold_limit 60s → 50s                     120.6  40.4 (28.8)     2468s    ○    ○    ×   ○ × ×
  hold_limit 60s → 70s                     124.2  31.6 (23.6)     2367s    ○    ○    ○   ○ ○ ○
  block_k 3 → 2                            131.0  35.2 (34.0)      985s    ○    ○    ○   ○ × ×
  ...
  → 採択: hold_limit 60s → 70s（目標 +2.4，賛成 ABC）。v2.cadl として保存。
```

(`town.council` prints Japanese only.) `block_k 3 → 2`, the best for the town, is vetoed, and a
small amendment all three accept is adopted. The difference from D1 is who decided whether to
overturn the veto, and whether the reason was recorded.

### Exercise 5-1

1. Answer `keep` (or `R1`) to D1 and rerun the first period. How do `decisions.md` and `gsn.md`
   change?
2. B is itself blocked for 849 s, yet it votes against `block_k 3 → 2`. Explain why from the table
   in §3.

---

## 6. Run six periods (20 min)

Run all six periods with the recorded answers:

```bash
python -m town.steward --lang en --mode DISTRIBUTED --rounds 6 --name steward-d-en \
    --llm replay --replay-dir examples/steward-d-en --answers examples/steward-d-en/answers.yaml
```

`scenario.yaml` sets the demand of each period (normal, busy, quiet, with a mid-period rush in
some). The current rules are re-measured in each period's environment before being compared.

| Period | Reasons for the request | LLM recommends | Human's choice | Result |
|---|---|---|---|---|
| 1 (normal) | agreement (`block_k 3 → 2` vetoed by B and C); regulation (floor 0.6 → 0.65) | R1 | `block_k 3 → 2`, overturning the veto | v2 |
| 2 (normal + rush) | uncertain (`block_k 2 → 1` improves on 2/5 seeds); LLM | keep | keep | v2 |
| 3 (busy) | none (the only proposal gains +0.6, below the noise of one delivery) | — | — | v2 (automatic) |
| 4 (busy + rush) | none (the LLM proposes nothing) | — | — | v2 (automatic) |
| 5 (quiet) | see §7 | 1 | `hold_limit 60s → 70s` | v3 |
| 6 (quiet) | KPI conflict (`hold_limit 70s → 80s` widens the spread of on-time rates from 0.02 to 0.05) | keep | keep | v3 |

The Japanese record (`examples/steward-d/`) ends with the same six outcomes, because the human
answered the same way; the LLM's proposals and recommendations differ in places (see §10).

Things to notice:

- **Period 2**: `block_k 2 → 1` passes every gate, but only 2 of 5 seeds improve. The LLM also
  asked on its own, citing the human's promise in D1 to re-measure C's utility. It lists as
  unknown "Whether the A and B yes votes alone meet the quorum": in fact A and B's two votes reach
  the quorum of 2, so no override is needed. The decision-request call is not given the
  constitution, so the LLM did not know the quorum (the Japanese LLM, in the same period, wrongly
  called it an override).
- **Periods 3–4**: in the busy season there are few late deliveries left, so there is little room
  for the main goal. The LLM says so in its assessment and proposes nothing in period 4. No
  request; the GSN still records that the decision was automatic, and on what condition.
- **Period 6**: the LLM recommends keeping the rules, citing the human's reason for 70 s in D5
  ("almost no cost to on-time delivery") and noting that it no longer holds at 80 s. A past reason
  became the ground for the next recommendation.

Open `runs/steward-d-en/gsn.md` to see the tree of six periods of decisions (GitHub and the VS Code
preview render it as a Mermaid diagram).

### Seeing the versions of the rules in CADL Explorer

The rule versions `runs/steward-d-en/v1.cadl` to `v3.cadl` can be compared on the **Designer** page of
[CADL Explorer](https://cadl-explorer.streamlit.app/) (v0.5.9 or later).

1. Open `v1.cadl` under **Open an existing CADL file**, switch the view to **Versions**, type `v1` as the
   name and press **Save as a version**. Do the same for `v2.cadl` and `v3.cadl`.
2. Under **Amendable parameters**, upload this repository's `constitution.yaml` as the **Constitution**
   (**Use the Robot Town constitution** loads the same file). The table lists each `# @amend:` name with
   its value, layer, range, step and *decided by*: the checks for the rule layer, a person for the
   contract layer and for the safety-related operating-mode rules — the same division as in §2.
3. Open **History of the amendable values across the versions**. `block_k` changes from 3 to 2 in v2
   and `hold_limit` from 60 to 70 in v3: the amendments of periods 1 and 5 in the table above.
4. Under **Compare two designs**, choose v1 as **A** and v2 as **B**. The amended parameter
   (`block_k` 3 → 2) is listed above the structural changes and the source diff.

Explorer checks the values with the same rules as the constitution gate of this course: only numbers
on `# @amend:` lines change, one name at a time, by one step, within the range. It does not run the
other gates (the checks of `cadl` aside, it measures no improvement and holds no vote).
Amending a value there (the **Amend** field) keeps the comments, but its decision record lasts only for
the browser session unless you download it. The record of this course is `decisions.md` and `gsn.yaml`.

### Exercise 6-1

Copy `examples/steward-d-en/answers.yaml`, change D2 to `"2"`, and pass the copy to `--answers`.
The recorded LLM outputs assume the recorded answers; once an answer differs, every later replay
prints "note: the request differs from the recorded one". At which gate is the LLM's period-3
proposal stopped, and why? What would happen with a real LLM (§10)?

---

## 7. The KPI changes (15 min)

From period 5, the other section of the KPI file takes effect. When the KPI changes, the LLM
rewrites the measure and lists earlier decisions whose premises no longer hold:

```text
  KPI (from period 5): The quiet season begins and orders fall. On-time delivery still matters, but to keep the companies cooperating, no single company should gain or lose because of how the road is used.
   [1] Fairness of utility first, on-time delivery watched: main goal utility_gap (decrease), on_time_deliveries (increase), on_time_rate_gap (decrease), sanction_total (decrease); conditions min_company_on_time_rate >= 0.8, unfinished <= 3
   [2] Fairness of on-time rates first: main goal on_time_rate_gap (decrease), on_time_deliveries (increase), utility_gap (decrease), min_company_on_time_rate (increase); conditions min_company_on_time_rate >= 0.8, unfinished <= 3
   [3] On-time delivery first, fairness watched: main goal on_time_deliveries (increase), utility_gap (decrease), on_time_rate_gap (decrease), late_deliveries (decrease); conditions min_company_on_time_rate >= 0.8, unfinished <= 3
   Concern: A gap metric can be improved by levelling down: making the best-off company worse instead of helping the worst-off one. (…)
   Concern: 'No company should gain or lose' may mean no company ends up worse off than under the current rules. No available metric measures each company's change against today. (…)
   (2 more)
   To review: K1 — K1 made town-wide on-time deliveries the main goal. The new KPI puts fairness between companies first and on-time delivery second, so the main goal and its guards need to be chosen again.
   To review: D1 — D1 (block_k 3 → 2) was adopted against B's and C's votes, and C's utility fell from 28.8 to 19.0. The new KPI says no company should lose because of how the road is used. (…)
  → Decision request K5 (the LLM recommends 1)
```

The recorded answer picks measure 1 (narrow the utility spread). This period's proposals:

| id | Proposal | On-time | Late | Main goal (utility spread) | Seeds improved | Utility A / B / C | Votes A B C | Watched values (excerpt) |
|---|---|---|---|---|---|---|---|---|
| — | current | 80.8 | 1.8 | — | — | 25.2 / 25.4 / 10.2 | — | on_time_rate_gap 0.03, sanction_total 20.0 |
| 1 | `hold_limit 60s → 70s` | 80.2 | 2.4 | +1.7 | 4/5 | 25.0 / 24.7 / 11.5 | ○ × ○ | on_time_rate_gap 0.04, sanction_total 19.0 |
| 2 | `block_k 2 → 3` | 74.8 | 7.8 | +7.5 | 4/5 | 23.0 / 23.6 / 15.9 | × × ○ | on_time_rate_gap 0.16, sanction_total 12.3 |
| 3 | `sanction_lambda 0.5 → 0` | 80.8 | 1.8 | +12.0 | 4/5 | 25.2 / 27.2 / 28.4 | ○ ○ ○ | on_time_rate_gap 0.03, sanction_total 0.0 |

Proposal 3 (switch off sanctions) improves the main goal most and wins every vote. The LLM still
asks, writing "This would make utility_gap look fair by switching off all road enforcement. (…)
That may be exactly the Goodhart pattern the KPI warns against", and recommends proposal 1:

```text
  The LLM recommends: 1 — Option 1 narrows utility_gap (+1.7, 4/5 seeds) and lowers sanctions without reversing D1's principle and without switching off enforcement. Its costs to customers and the conditions are small (on-time 80.8 to 80.2, lowest rate 0.95, well above 0.8). Option 2 buys fairness with about 6 more late deliveries and a lowest rate of 0.83, near the floor. Option 3's large gain comes from no longer pricing C's and B's road use, which leaves A carrying the cost of being blocked and looks like the Goodhart pattern the KPI warns against. (…)
```

Proposal 2 (undoing D1) is vetoed by A and B (*agreement*) and worsens the watched on-time
deliveries and spread of on-time rates (*KPI conflict*). The recorded answer adopts 1:

```yaml
D5:
  choice: "1"
  reason: Switching off sanctions (3) narrows the gap only on paper and changes nothing about how the road is used. Returning block_k to 3 (2) adds about 6 late deliveries, and nothing undoes D1's reason (fewer late deliveries for customers). hold_limit 70 s narrows the gap at almost no cost to on-time delivery.
  assumptions:
    - Late deliveries rising from 1.8 to 2.4 is acceptable to customers
```

### Exercise 7-1

1. Pick measure 3 at K5 (copy `answers.yaml` and edit K5) and run period 5. How do the options of
   the decision request change? The recorded request was written for measure 1; what happens to
   it?
2. Under which measure, and if the LLM had not written what, would switching off sanctions be
   adopted automatically without a request? Is that desirable? In a replay the KPI reading is the
   recorded one, so to try a rewritten KPI file you need a real LLM (§10).

---

## 8. A KPI that is a proxy (15 min)

What happens when the KPI aims at a convenient stand-in (a proxy)?
`examples/steward-goodhart/kpi.en.md` says:

```markdown
## From period 1

Make sure the road rules are kept. Reduce road-rule violations as much as possible.
```

```bash
python -m town.steward --lang en --kpi examples/steward-goodhart/kpi.en.md --mode DISTRIBUTED --name goodhart-en \
    --llm replay --replay-dir examples/steward-goodhart/en --answers examples/steward-goodhart/en/answers.yaml
```

The LLM warned that "road_violations is defined by the rules themselves. A ROAD_USE amendment that
lengthens release deadlines or weakens or removes blocking_guard would lower the count without
making robots behave better", and offered only measures that also watch blocked time and service:
(1) the count as main goal, watching blocked time, on-time deliveries and unfinished orders; (2)
blocked time as main goal, watching the count. It offered no count-only measure at all. Its two
proposals both tighten (`sanction_lambda 0.5 → 1`, `block_k 3 → 2`); neither reduces the count
(+0.0 and −8.2: evicting earlier counts more evictions), so nothing is adopted.

In Japanese (`examples/steward-goodhart/proxy/` and `guarded/`), the LLM did offer a measure of the
count plus on-time deliveries only, with the same warning, and recommended the one with more
watches. Even when the human chose the count-only measure, the LLM proposed no loosening, writing
that loosening would cut the count but run against "make sure the rules are kept".

| Measure (Japanese record) | LLM proposals | Road violations | Change in main goal | Outcome |
|---|---|---|---|---|
| proxy: count and on-time deliveries | `sanction_lambda 0.5 → 1`, `block_k 3 → 2` | 25.8 → 25.8, 34.0 | +0.0, −8.2 | no change, automatically |
| guarded: also blocked time and total sanctions | `block_k 3 → 2`, `sanction_lambda 0.5 → 1` | 34.0, 25.8 → 25.8 | −8.2, +0.0 | request (LLM: enforcement by sanctions doubles total sanctions, 15.7 → 31.4) → human keeps |

How far the drift goes with no reader of the KPI's intent can be seen with the rule-based council,
which looks only at the objective's number:

```bash
python -m town.council --mode DISTRIBUTED --rounds 8 --objective road_violations --name goodhart-d
python -m town.council --mode DISTRIBUTED --rounds 6 --name seasons-d
python -m town.compare runs/goodhart-d/v1.cadl runs/goodhart-d/v5.cadl runs/seasons-d/v7.cadl --mode DISTRIBUTED
```

| Rules | On-time | Late | Road-rule violations | Blocked time | A's on-time rate |
|---|---|---|---|---|---|
| initial v1 | 112.2 | 10.8 | 25.0 | 2457 s | 0.82 |
| v5, objective: road violations | 106.0 | 17.0 | **21.0** | **3681 s** | 0.72 |
| v7, objective: on-time deliveries | 123.0 | 0.0 | 28.2 | 52 s | 1.00 |

(Compared on seeds 1001–1005, which the loop never used.) With road violations as its objective,
the council amended the rules four times in eight periods, every time loosening them. The counted
violations fell, while blocked time and late deliveries both rose by about half. The constitution's
invariant (on-time rate at least 0.6) does not stop the drift.

There is no guarantee that an LLM will read the KPI's intent as it did here. Choosing the measure is
the human's job, and when a loosening is proposed, what stops it is the watches and the human's
decision.

---

## 9. Distributed and centralized operation (15 min)

| Mode | Where robots wait | How the road is used |
|---|---|---|
| DISTRIBUTED | each company on the road (the central intersection 8) | intersections are free to pass |
| CENTRALIZED | a steward assigns off-road bays (beside nodes 5, 2 and 7, one robot each); waiting on the road is forbidden | the steward grants each edge to one robot at a time (as the C-SoS arbiter does); entering an edge costs a 1 s grant |

Centralized operation removes blocked intersections, but at very high demand the edge grants pile
up. On-time deliveries with the mode fixed (mean over seeds 1–5):

| Mean order interval | 30 s | 45 s | 75 s | 120 s | 180 s |
|---|---|---|---|---|---|
| Distributed | **319.6** | 210.2 | 121.8 | 76.8 | 51.2 |
| Centralized | 309.2 | **217.4** | **132.2** | **83.2** | **58.6** |

The switching conditions are written in the CADL file and evaluated every 5 minutes over the last
5 minutes:

```yaml
  transitions:
    - from: DISTRIBUTED
      to: CENTRALIZED
      condition: "orders_in_window < 22"      # @amend:to_central
      protocol: SWITCH
      safety_invariant: "robots_on_road == 0"
    - from: CENTRALIZED
      to: DISTRIBUTED
      condition: "orders_in_window >= 26"     # @amend:to_distributed
      protocol: SWITCH
```

A switch to centralized takes effect only once no robot is waiting on the road (C stalls for 30 s;
anything still there after 60 s is evicted by the steward), and the `safety_invariant` is checked at
that moment. Compare three ways of running a period with a rush:

```bash
python -m town.compare cadl/robot_town.cadl --rush 1200 2400 25 --mode DISTRIBUTED
python -m town.compare cadl/robot_town.cadl --rush 1200 2400 25 --mode CENTRALIZED
python -m town.compare cadl/robot_town.cadl --rush 1200 2400 25 --mode adaptive
```

| Operation | On-time | Late | Blocked time | Time centralized |
|---|---|---|---|---|
| fixed distributed | 202.8 | 8.0 | 2141 s | 0% |
| fixed centralized | 206.2 | 4.6 | 843 s | 100% |
| switching by the CADL conditions | **209.2** | **1.6** | 1116 s | 60% |

The mode switches three times in the period: to centralized after 5 minutes, to distributed for the
rush, and back to centralized after it. Now make the switch take effect without waiting for the road
to clear:

```bash
python -m town.period --rush 1200 2400 25 --no-quiescence
```

The last line reports about 1.4 safety-invariant breaches per period (`安全条件の違反 1.4 回`).

The two switching thresholds are marked `safety: true` in the constitution. With `town.steward` in
`--mode adaptive` (the default), any proposal that changes them and improves the KPI is always
brought to the human as *safety*.

---

## 10. Run with a real LLM (optional, 15 min)

The records in §4–§8 come from real runs with Claude Opus 5.5 on 2026-10-29/30. With your own API
key the LLM answers afresh each time, so you will get proposals and recommendations different from
the records.

```bash
export ANTHROPIC_API_KEY=...        # type your own key; never paste it into a chat or a file
python -m town.steward --lang en --mode DISTRIBUTED --rounds 6 --name live-d-en
python -m town.steward --mode DISTRIBUTED --rounds 6 --name live-d      # Japanese; KPI in kpi.md
```

Each period sends up to three requests: rewriting the KPI (when it changed), proposing amendments,
and writing a decision request (only when one is needed). The LLM's outputs are saved in
`runs/<name>/llm/`. Without a terminal and without an answer, the loop writes the decision request
to `p<k>-request.md` and stops; write your answer to a YAML file and rerun the same command with the
same `--name`, adding `--answers <YAML>`, and the recorded LLM outputs are reused instead of being
requested again.

The six periods of the records used about 60,600 input and 52,200 output tokens in English, and
61,600 and 52,800 in Japanese. One request took from 20 seconds to 2 minutes; once, a request had
no response after 11 minutes and was retried.

### What the real runs showed

- **Recommendations vary.** In Japanese, the D1 recommendation changed from "1" to "keep" when the
  same request was sent again; in English, the LLM recommended a regulation (R1) that the Japanese
  run never proposed. The value of a decision request lies less in its recommendation than in
  laying out the question, who gains and loses, and what is unknown.
- **The LLM's unknowns point at gaps in the tool.** The first version of the table did not show the
  values of the watched goals; the LLM wrote that it did not know "on_time_rate_gap が具体的に
  どれだけ悪化したか（表には最低の定時率しか載っていません）" ("how much on_time_rate_gap
  worsened; the table only shows the lowest on-time rate"), so the table gained a column of watched
  goals and conditions. Not knowing the quorum (period 2, §6) is not fixed yet (§11).
- **Past reasons shape later recommendations.** In period 2 the LLM cited D1's promise to
  re-measure, and in period 6 D5's reason for 70 s.

### A real LLM record: the LLM as a council

`examples/llm-distributed/` holds two periods of proposals written by Claude on 2026-10-15, with
the LLM acting as the council of `town.council` (`--proposer llm`): rules only, no KPI, no decision
requests, adoption settled by the gates.

```bash
python -m town.council --proposer replay --replay-dir examples/llm-distributed --mode DISTRIBUTED --rounds 2
```

| Period | LLM proposal | Check | Constitution | Improvement | Votes (A B C) |
|---|---|---|---|---|---|
| 1 (normal) | `block_k` 3 → 2 | ○ | ○ | ○ | ○ × × |
| | `hold_limit` 60s → 50s | ○ | ○ | × | ○ × × |
| | `sanction_lambda` 0.5 → 1.0 | ○ | ○ | × | ○ × × |
| 2 (normal + rush) | `block_k` 3 → 2 | ○ | ○ | ○ | ○ × × |
| | `hold_limit` 60s → 50s | ○ | ○ | × | ○ ○ × |
| | `sanction_lambda` 0.5 → 1.0 | ○ | ○ | × | ○ × × |

- All six were well-formed amendments, and in both periods the first was the best one the
  rule-based search found.
- The LLM predicted that "B is blocked too, so it will vote yes"; B voted no. It predicted B's vote
  from the town's interest rather than B's.
- One call used about 4,400 input and 9,300 output tokens.

On 2026-10-19 the starting rules gained two steps in the `AMEND` protocol and their interface
entries, and on 2026-10-29 the `DELIVERY_SLA` lines gained contract-layer tags
(`# @amend:pickup_deadline` and so on). Because the constitution gate compares a proposal with the
current rules line by line, the same lines were inserted mechanically into every recorded proposal
of this council record; nothing else changed, and the replays print the same results. Each file
records this in its `edits` field.

---

## 11. Stretch goals (optional)

| Goal | Hint |
|---|---|
| Tell the LLM the quorum | Pass the constitution's `vote` and each proposal's vote-gate result to `request_request()` in `town/llm_steward.py`. Does the period-2 misreading ("override") disappear? |
| Break the human's assumption | Make C in `town/policies.py` withdraw from the town (stop taking orders) as its sanctions or utility worsen, and see what happens when D1's assumption ("keeps delivering") fails |
| Add a reason to ask | Add a condition to `triage()` in `town/steward.py`, such as "ask when any company's utility falls by 10 or more" |
| Add a metric and use it in a KPI | Add, say, the largest blocked time of any company to `METRICS` in `town/kpi.py`, and write a KPI that uses it. Does it answer the period-5 concern that no metric measures each company's change from road use alone? |
| Give amendments an expiry | Adopted amendments are never repealed, even when the environment changes back. Add a rule that an amendment lapses unless re-adopted within N periods |
| Stop the proxy drift with regulation | Add invariants on blocked time or late deliveries to `invariants` and `regulation` in `constitution.yaml`, and to `invariants_ok()` in `town/council.py` |
| Open the GSN in another tool | Write a script that exports `runs/<name>/gsn.yaml` to the format of the GSN editor you use |

---

## 12. Research exercise: speed of amendment and transition disruption (optional, several hours)

To reach the KPI sooner, it is tempting to change the rules a lot at once. If the people who follow
the rules are humans, large sudden changes confuse them, and until they adjust they keep acting on
the old rules. Robots read the new rules at once and are not confused — but that does not mean the
transition causes no problems. This exercise asks **how the trade-off between reaching the KPI
quickly and the size and frequency of rule changes depends on whether humans or robots follow the
rules**.

The hands-on already gives some clues:

- The constitution's "one parameter by one step per amendment" (`step` in `constitution.yaml`) is an
  upper limit on the speed of change.
- In the six periods of the rule-based council used in §8 (`seasons-d`), `hold_limit` went
  60 → 70 → 80 → 70 → 60 s and back. Faster moves should make such overshoot and oscillation more
  likely.
- In §9, switching the operating mode without waiting for the road to clear broke the safety
  invariant about 1.4 times per period, with robots only. When the rules change, orders and waits
  begun under the old version are still running.

### Exercise 12-1: size of amendments and speed to the KPI (robots only)

Change `step` in `constitution.yaml` (for example `hold_limit` from 10 to 20 or 30, `block_k` from 1
to 2) and run the rule-based council for six periods. Choose values so that one step from the
current value stays within min–max (the council does not generate proposals outside the range). The
constitution is read from the repository root, so use a different `--name` per condition and restore
the file afterwards with `git checkout constitution.yaml`.

```bash
python -m town.council --mode DISTRIBUTED --rounds 6 --name step30
python -m town.compare runs/step30/v*.cadl --mode DISTRIBUTED      # compare every version on seeds the loop never used
```

For each condition, tabulate:

| Quantity | How to get it |
|---|---|
| Periods to reach the KPI | Fix a target (for example "at most 2 late deliveries in `town.compare`"). In which period was the first version meeting it adopted? |
| Cumulative amendment | Sum, over the amendments in `history.md`, the amount moved divided by the original `step` |
| Oscillation | The number of times a parameter was moved in the opposite direction to its previous amendment |
| Loss during the transition | The sum, over the periods before the target is reached, of the shortfall from the target |

How do the periods to the target, the oscillation and the transition loss change as `step` grows?

### Exercise 12-2: a company with human drivers

Add a company driven by humans to `town/policies.py`. Choose your own model, for example:

- Right after a rule change, with probability p a driver still acts on the old rule (waits up to the
  old `hold_limit`, and so on); p falls period by period (a learning curve).
- The larger a change, and the more changes in a row, the larger p and the slower its recovery.

Each company's behaviour is decided only by the rules that `Town` in `town/world.py` reads with
`self.rules = read_rules(ir)`; it does not know the previous version. Let `Town` take the previous
version's IR (or rule values) and "periods since the change", and pass them from `evaluate()` in
`town/period.py` and from `town/council.py`.

Then repeat Exercise 12-1 with three compositions: all three companies robots, one company human,
all three human. For each composition, plot speed to the KPI against disruption during the
transition (transition loss and violations), and see how the best `step` changes.

### Exercise 12-3: how changes take effect

Transitions matter even with robots only. Add the following ways of putting a version into effect,
and compare violations, late deliveries and safety-invariant breaches during the transition:

- **Notice period**: an adopted version takes effect N periods later instead of the next period.
- **Phased introduction**: a large change takes effect in small steps over several periods.
- **Transitional provisions**: orders and waits begun before the change keep the old version's
  deadlines.

Transitional provisions are also a question for the CADL specification: today CADL cannot say which
version's deadlines and monitors apply to a contract instance that is already running (§13).

### Exercise 12-4: let the human and the LLM choose the speed

With a real LLM (§10), make `town.steward` choose the speed:

- Write a KPI such as "increase on-time deliveries quickly, but avoid sudden changes that would
  confuse the drivers" in `kpi.en.md`. What measures does the LLM offer, and how does it describe
  the cost of the transition in its decision requests?
- Add a condition to `triage()` in `town/steward.py` that asks the human about any proposal that
  moves a parameter by a large amount at once, and combine it with the large `step` of Exercise 12-1.

Which speed to choose cannot be read off the KPI's numbers; it depends on how the people following
the rules take the change. Record the human's decisions and reasons in GSN. Six periods with a real
LLM cost about US$1.3 per run in the §10 records (Claude Opus 5.5).

### Questions to close

- For each composition of followers, what does the Pareto front between speed to the KPI and
  transition disruption look like?
- The constitution's `step` resembles the trust region that limits each policy update in
  reinforcement learning (TRPO, PPO). What is the same, and what differs?
- Who should set the speed limit? In which layer should it sit: rule (the council or the LLM may
  change it), regulation (decided by humans), or contract (the promise to customers)?

---

## 13. What the specification cannot express yet

Building this exercise exposed these gaps in CADL 0.3 / `cadl` 0.3.18:

- `cadl sim-ir` does not emit `sos.transitions[*].safety_invariant` into the IR (`cadl check` does
  check it as an expression). The exercise reads it from the checked source file.
- An operating mode (regime) is only a name; there is no syntax to bind parameter values or
  contracts to it. What changes in centralized mode (bays, exclusive edges) is decided by the
  simulator.
- Which layer (rule or contract) a parameter belongs to, and who decides its amendment, is written
  in `constitution.yaml` and in `# @amend:` comments, not in CADL.
- When a new version of the rules takes effect, there is no syntax for which version applies to
  contract instances already running (transitional provisions), or for when a version takes
  effect (§12, Exercise 12-3).
- A `metrics` `target` is a single expression: there is no syntax for a KPI that changes over time,
  or for the choice of how a KPI is measured, and none to link the record of human decisions (GSN)
  to a version of the rules. The exercise keeps `kpi.md`, `decisions.md` and `gsn.yaml` outside the
  rules.

Up to `cadl` 0.3.11, an unreadable value such as `deadline: soon` passed `cadl check` and became
`null` in the IR; from 0.3.12 it is an error. The exercise also rejects rules whose IR lacks a value
the town needs, so the check gate works even with an older compiler.

---

## Summary

- The KPI is written by a human in natural language and may change over time. The LLM turns it into
  a measure, but when it can be read several ways or relies on a proxy, the human chooses.
- The LLM proposes amendments to rules, regulation and contracts toward the KPI. Matters needing
  stakeholders' agreement, the promise to customers, regulation, safety, conflicts within the KPI
  and uncertain improvements it does not decide: it hands them to the human with the measurements,
  who gains and who loses, and what it does not know.
- The human's decisions and reasons are kept, in prose and in GSN, alongside the versions, and
  change the LLM's next proposals and requests.
- What finally backs an adoption is the gates — check, constitution, measured improvement and the
  parties' agreement — together with the reasons the human left.

---

## References

- Course A (Robot Delivery): [Textbook](../textbook/index.md)
- Course B (Urban Mobility): [`mobility-sos-tutorial.md`](mobility-sos-tutorial.md)
- SoS-DSL specification: cadl-spec [Appendix E](../spec/appendix-e-sos-dsl.md)
- Exercise repository: https://github.com/ertlnagoya/cadl-robot-town
