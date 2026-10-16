---
sidebar_position: 6
sidebar_label: "Course D — Robot Town"
title: "Course D — Robot Town (rules a community amends itself)"
---

# Course D — Robot Town: Rules a Community Amends Itself

> ⬅ Back to Course A → [Course A — Robot Delivery](../textbook/index.md)

> **Audience**: Students who have completed [Course A](../textbook/index.md) (CADL/SoS-DSL basics).
> Course B is not required.
>
> **Time**: 90–120 minutes, plus optional stretch goals.
>
> **You will leave with**: A set of road rules in CADL that a council has amended period by
> period, the history of those amendments as versioned `.cadl` files, and first-hand evidence of
> how self-interested voting, a badly chosen objective and an LLM proposer can each steer the rules.

---

## 0. What this course demonstrates

Courses A and B write a contract once and check a simulation against it. In Course D the
contract itself changes while the system runs. Three delivery companies (A, B, C; two robots
each) share the 11-node road network of the Raspberry Pi Mouse simulator. After each simulated
hour, a **council** proposes amendments to the road rules, and a proposal becomes the next version
of the rules only if it passes four gates.

```
robot_town.cadl (version k)
   │  cadl check / cadl sim-ir                        ← gate 1: check
   ▼
one simulated hour (Python reference runtime of Course A judges deadlines and monitors)
   │  observations: on-time deliveries, violations by cause, utility per company
   ▼
council proposes amendments (rule-based search, or an LLM)
   │  constitution.yaml: what may change, by how much  ← gate 2: constitution
   │  same random seeds, current rules vs proposal     ← gate 3: improvement
   │  each company votes on its own utility            ← gate 4: vote
   ▼
robot_town.cadl (version k+1), kept in runs/<name>/
```

The exercise lives in the public repository
[`cadl-robot-town`](https://github.com/ertlnagoya/cadl-robot-town). It needs no Unity and no SUMO:
the town is a small Python simulation, and the norms are judged by the same reference runtime
(`contract_engine.py`, copied from `cadl-raspimouse-simulator`) that Course A uses.

---

## 1. Setup (5 min)

The CADL compiler from Course A (`~/program/cadl_repo`) is all you need.

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

Only §8 (the LLM council, live) needs the Anthropic SDK and an API key; §8 can also be followed
without them.

```bash
pip install anthropic
```

> The program output is in Japanese. Each step below explains the columns you need.

---

## 2. Read the rules (15 min)

Open `cadl/robot_town.cadl`. The town has two contracts.

- **`DELIVERY_SLA`**: one instance per order; pick up within 120 s, drop off within 120 s, else
  `Late`. This is the promise to customers and is **not** amendable.
- **`ROAD_USE`**: one instance each time a robot stops on the road to wait for its next order.
  This is what the council governs.

```yaml
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

A line tagged `# @amend:<name>` holds a number the council may change. How far it may change is
set by `constitution.yaml`, which the council cannot change:

```yaml
amendable:
  hold_limit:      {min: 10, max: 120, step: 10}   # seconds a robot may wait on the road
  block_k:         {min: 1,  max: 4,   step: 1}    # robots waiting behind it before eviction
  sanction_lambda: {min: 0.0, max: 2.0, step: 0.5} # sanction points per violation (Minor 1, Major 3)
  ...
invariants:
  min_company_on_time_rate: 0.6
vote:
  quorum: 2
```

(Excerpt, simplified. The file also lists the two switching thresholds of §7.)

The three companies behave differently (`town/policies.py`): **A** always returns to its
garage; **B** waits on the road for its next order but leaves 5 s before `hold_limit`; **C** waits
until an order comes or it is evicted, unless `sanction_lambda` reaches 1.5. A robot stopped at an
intersection blocks everyone who wants to pass through it.

### Exercise 2-1

1. Which company can never be sanctioned under the current rules, and why?
2. B never overstays `hold_limit`. Which rule can still sanction B?
3. What would have to change, and where, for C to stop waiting on the road?

---

## 3. Run one period (10 min)

Fix the operating mode to distributed for now (§7 explains the modes):

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
deadlines, `monitor:blocking_guard` by the monitor. The last line records the operating mode;
§7 returns to it.

---

## 4. One round of the amendment loop (15 min)

```bash
python -m town.council --mode DISTRIBUTED
```

The rule-based council tries every amendment that moves one parameter by one step:

```text
  改正案                                  定時配達  違反 (道路) ふさがれた  検査 憲法 改善 投票(A B C)
  hold_limit 60s → 50s                     120.6  40.4 (28.8)     2468s    ○    ○    ×   ○ × ×
  hold_limit 60s → 70s                     124.2  31.6 (23.6)     2367s    ○    ○    ○   ○ ○ ○
  block_k 3 → 2                            131.0  35.2 (34.0)      985s    ○    ○    ○   ○ × ×
  ...
  → 採択: hold_limit 60s → 70s（目標 +2.4，賛成 ABC）。v2.cadl として保存。
```

The columns after the proposal are on-time deliveries, violations (of which road rules), blocked
time, then the four gates (○ pass, × fail) and the three votes.

The amendment that helps the town most, `block_k 3 → 2` (evict a robot as soon as two robots wait
behind it), raises on-time deliveries from 121.8 to 131.0 — and is voted down by B and C. The
council adopts a smaller amendment that all three accept. The adopted rules are saved as
`runs/<name>/v2.cadl`; compare `v1.cadl` and `v2.cadl` in cadl-explorer's **Designer → Versions**,
as in Course B's stretch goal.

### Exercise 4-1

Explain from the table in §3 why B votes against `block_k 3 → 2`, although B is itself blocked
for 849 s.

---

## 5. Demand changes (10 min)

`scenario.yaml` gives each period its demand: normal, busy and quiet periods, and in the second
normal and busy periods a rush between minutes 20 and 40. The current rules are re-evaluated in
each period's environment before the proposals are compared.

```bash
python -m town.council --mode DISTRIBUTED --rounds 6 --name seasons-d
```

```text
- 第 1 期（平常）: v2 hold_limit 60s → 70s（目標 +2.4，賛成 ABC）
- 第 2 期（平常＋ラッシュ）: v3 hold_limit 70s → 80s（目標 +1.6，賛成 ABC）
- 第 3 期（繁忙期）: v4 hold_limit 80s → 70s（目標 +6.0，賛成 ABC）
- 第 4 期（繁忙期＋ラッシュ）: v5 hold_limit 70s → 60s（目標 +4.0，賛成 ABC）
- 第 5 期（閑散期）: v6 block_k 3 → 2（目標 +6.0，賛成 AB）
- 第 6 期（閑散期）: v7 block_k 2 → 1（目標 +2.0，賛成 AB）
```

(`runs/seasons-d/history.md`; 第 k 期 = period k, 平常 = normal, 繁忙期 = busy, 閑散期 = quiet,
ラッシュ = rush, 賛成 = voted for.)

`block_k 3 → 2`, vetoed in normal and busy periods, passes in the quiet period: with few orders,
waiting on the road no longer pays B enough to outweigh being blocked by C. A change in the
environment changed a company's interests, and with them the rules.

---

## 6. Goodhart drift (15 min)

Give the council a different objective: the number of road-rule violations (`release` overruns
and `blocking_guard` evictions) — the council's own area of responsibility.

```bash
python -m town.council --mode DISTRIBUTED --rounds 8 --objective road_violations --name goodhart-d
```

```text
- 第 1 期（平常）: v2 hold_limit 60s → 70s（目標 +2.2，賛成 ABC）
- 第 4 期（繁忙期＋ラッシュ）: v3 block_k 3 → 4（目標 +4.0，賛成 ABC）
- 第 5 期（閑散期）: v4 hold_limit 70s → 80s（目標 +1.0，賛成 ABC）
- 第 7 期（平常）: v5 hold_limit 80s → 90s（目標 +1.4，賛成 ABC）
```

(Periods 2, 3, 6 and 8 adopted nothing.) Every adopted amendment **loosens** a rule. Compare the
versions on seeds the loop never used:

```bash
python -m town.compare runs/goodhart-d/v1.cadl runs/goodhart-d/v5.cadl runs/seasons-d/v7.cadl --mode DISTRIBUTED
```

| Rules | On-time | Late | Road violations | Blocked | A on-time rate |
|---|---|---|---|---|---|
| initial v1 | 112.2 | 10.8 | 25.0 | 2457 s | 0.82 |
| road-violations objective, v5 | 106.0 | 17.0 | **21.0** | **3681 s** | 0.72 |
| on-time objective (§5), v7 | 123.0 | 0.0 | 28.2 | 52 s | 1.00 |

The counted violations fell, because the easiest way to have fewer violations is to stop counting
them; blocked time and late deliveries rose by about half, and only C gained. The rules that the
on-time objective produced have *more* road violations and no late deliveries at all. The
constitution's invariant (on-time rate ≥ 0.6) does not catch this drift.

---

## 7. Switching between distributed and centralized operation (15 min)

| Mode | Where robots wait | How the road is used |
|---|---|---|
| DISTRIBUTED | Each company waits on the road (intersection 8) | Robots pass through intersections freely |
| CENTRALIZED | The steward assigns off-road bays (beside nodes 5, 2 and 7, one robot each); waiting on the road is not allowed | The steward allocates edges one robot at a time, as the C-SoS arbitrator does, with a 1 s grant per edge |

Centralized operation removes blocking but makes robots queue for edge grants when demand is very
high. On-time deliveries with a fixed mode (seeds 1–5):

| Mean order interval | 30 s | 45 s | 75 s | 120 s | 180 s |
|---|---|---|---|---|---|
| DISTRIBUTED | **319.6** | 210.2 | 121.8 | 76.8 | 51.2 |
| CENTRALIZED | 309.2 | **217.4** | **132.2** | **83.2** | **58.6** |

The switching conditions are part of the CADL file, evaluated every five minutes on the last
five minutes:

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

A switch to centralized takes effect only once no robot is waiting on the road (C drags its feet
for 30 s; the steward evicts stragglers after 60 s), and the `safety_invariant` is checked at that
moment. Compare the three ways of operating a period with a rush:

```bash
python -m town.compare cadl/robot_town.cadl --rush 1200 2400 25 --mode DISTRIBUTED
python -m town.compare cadl/robot_town.cadl --rush 1200 2400 25 --mode CENTRALIZED
python -m town.compare cadl/robot_town.cadl --rush 1200 2400 25 --mode adaptive
```

| Operation | On-time | Late | Blocked | Time centralized |
|---|---|---|---|---|
| fixed distributed | 202.8 | 8.0 | 2141 s | 0% |
| fixed centralized | 206.2 | 4.6 | 843 s | 100% |
| switching by the CADL conditions | **209.2** | **1.6** | 1116 s | 60% |

Switching happens three times in the period: to centralized after five minutes, back to
distributed for the rush, and to centralized again after it. Now activate the switch without
waiting for the road to clear:

```bash
python -m town.period --rush 1200 2400 25 --no-quiescence
```

The last line reports about 1.4 safety-invariant violations per period
(`安全条件の違反 1.4 回`). From now on the council runs with switching (the default), and the two
thresholds are amendable too.

---

## 8. An LLM council (15 min)

`--proposer llm` lets Claude Opus 5.5 write the amendments. It receives the period's observations,
the amendment history, the constitution and the current rules, and returns up to three proposals,
each a **whole CADL file** with a title and a rationale. What the model says it changed is not
trusted: every file goes through the same gates, and the constitution gate also compares the file
with the current rules line by line, allowing only the `@amend` numbers to change.

You can replay a real run without an API key. `examples/llm-distributed/` holds two periods
Claude wrote on 2026-10-15 (`--mode DISTRIBUTED --rounds 2`):

```bash
python -m town.council --proposer replay --replay-dir examples/llm-distributed --mode DISTRIBUTED --rounds 2
```

| Period | Proposal | Check | Constitution | Improvement | Vote (A B C) |
|---|---|---|---|---|---|
| 1 (normal) | `block_k` 3 → 2 | ○ | ○ | ○ | ○ × × |
| | `hold_limit` 60s → 50s | ○ | ○ | × | ○ × × |
| | `sanction_lambda` 0.5 → 1.0 | ○ | ○ | × | ○ × × |
| 2 (normal + rush) | `block_k` 3 → 2 | ○ | ○ | ○ | ○ × × |
| | `hold_limit` 60s → 50s | ○ | ○ | × | ○ ○ × |
| | `sanction_lambda` 0.5 → 1.0 | ○ | ○ | × | ○ × × |

What to notice:

- All six proposals were well-formed amendments, and the first proposal in both periods is the
  best one the rule-based search found.
- The model expected B to vote for `block_k 3 → 2` "because B is blocked too"; B voted against it.
  It predicted B's vote from the town's interest instead of B's.
- It never proposed the loosening amendment that all three companies accept (§4).
- Raising `sanction_lambda` to 1.0 changed nothing: C changes its behaviour only at 1.5, one step
  is 0.5, and the model was not given the company policies.
- Each call took about 4,400 input and 9,300 output tokens (about USD 0.20 per period); most of the
  output is the three rewritten rule files.

To run it live:

```bash
export ANTHROPIC_API_KEY=...        # type your own key; never paste it into a chat or a file
python -m town.council --proposer llm --mode DISTRIBUTED --rounds 2 --name llm-distributed
```

`examples/llm-replay/` holds three hand-written proposals (not model output) that stop at the
check gate, at the constitution gate, and at the vote, respectively.

---

## 9. Stretch goals (optional)

| Goal | Hint |
|---|---|
| Write a constitution that stops the drift of §6 | Add an invariant on blocked time or late deliveries to `constitution.yaml` and to `invariants_ok()` in `town/council.py`, then rerun `--objective road_violations` |
| Give B a policy that learns | Make `wants_to_park()` / `max_park_s()` in `town/policies.py` depend on the previous period's sanctions, and see whether the veto of §4 survives |
| Change the voting rule | Replace the quorum by weighted votes or a veto for the most-blocked company in `ballots()`; who gains? |
| Let amendments expire | The council never repeals an amendment when the environment returns (§5). Add a sunset rule: an amendment lapses unless re-adopted after N periods |
| Give the LLM more or less information | Add `town/policies.py` to the request in `town/llm_council.py`, or remove the vote rule from it, and compare the proposals and the vote predictions |

---

## 10. What the specification cannot say yet

Building this exercise exposed two gaps that remain in CADL 0.2 / `cadl` 0.3.14:

- `cadl sim-ir` does not carry `sos.transitions[*].safety_invariant` into the IR (`cadl check`
  does check it as an expression). The exercise reads it from the checked source file.
- A regime is only a name; there is no syntax to attach parameter values or contracts to it. What
  changes in centralized operation (bays, exclusive edges) is decided by the simulator.

Up to `cadl` 0.3.11, an unreadable value such as `deadline: soon` also passed `cadl check` and
became `null` in the IR; from 0.3.12 it is an error. The exercise additionally rejects any rules
whose IR lacks a value the town needs, so the check gate holds with older compilers too.

---

## Wrap-up

- The contract is not fixed: it is a versioned artifact that changes through a procedure, and
  every version is checked before it runs.
- Who decides (the vote), what counts as better (the objective) and what may never change (the
  constitution) shape the rules as much as the data does.
- An LLM can write well-formed amendments and plausible reasons; the gates — verification, the
  constitution, measured improvement and the parties' consent — decide what is adopted.

---

## References

- Main textbook (robot delivery): [Textbook](../textbook/index.md)
- Course B (urban mobility): [`mobility-sos-tutorial.md`](mobility-sos-tutorial.md)
- SoS-DSL spec: cadl-spec [Appendix E](../spec/appendix-e-sos-dsl.md)
- Exercise repository: https://github.com/ertlnagoya/cadl-robot-town
