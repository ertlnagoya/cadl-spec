---
sidebar_position: 6
sidebar_label: "コース D — ロボットの街"
title: "コース D — ロボットの街（規則を自分たちで直す）"
---

# コース D — ロボットの街：規則を自分たちで直す

⬅ [コース A — ロボット配送](../textbook/index.md) に戻る

- 対象：[コース A](../textbook/index.md)（CADL/SoS-DSL の基礎）を済ませた方。コース B は不要です
- 所要時間：90〜120 分（改造課題は別）
- 完成すると手元に残るもの：委員会が期ごとに改正した CADL の道路規則、版として残った改正の履歴（`.cadl` ファイル）、自己利益で投票する当事者・選び方を誤った目標・LLM による改正案が、それぞれ規則をどう動かすかを自分で確かめた記録

---

## 0. このコースで何が起きるか

コース A と B では、契約を一度書き、シミュレーションの結果をその契約に照らして判定しました。
コース D では、システムが動いている間に契約そのものが変わります。
3 社（A・B・C、各社 2 台）の配送ロボットが、ラズパイマウスのシミュレータと同じ 11 ノードの道路網を共有します。
シミュレーション上の 1 時間（1 期）が終わるたびに**委員会**が道路の規則の改正案を出し、4 つの関門を通った案だけが次の版の規則になります。

```
robot_town.cadl（第 k 版）
   │  cadl check / cadl sim-ir                     ← 関門 1：検査
   ▼
シミュレーション上の 1 時間（期限と監視は、コース A の Python 参照ランタイムが判定）
   │  観測：定時配達、原因別の違反、会社ごとの効用
   ▼
委員会が改正案を出す（ルールベースの探索、または LLM）
   │  constitution.yaml：何をどこまで変えてよいか ← 関門 2：憲法
   │  同じ乱数シードで現行と改正案を比べる        ← 関門 3：改善
   │  各社が自社の効用で投票する                  ← 関門 4：投票
   ▼
robot_town.cadl（第 k+1 版）。runs/<名前>/ に残る
```

演習は公開リポジトリ [`cadl-robot-town`](https://github.com/ertlnagoya/cadl-robot-town) にあります。
Unity も SUMO も使いません。街は小さな Python のシミュレーションで、規範の判定には、コース A と同じ参照ランタイム（`cadl-raspimouse-simulator` から複製した `contract_engine.py`）を使います。

---

## 1. セットアップ（5 分）

必要なのは、コース A でクローンした CADL コンパイラ（`~/program/cadl_repo`）だけです。

```bash
cd ~/program
git clone https://github.com/ertlnagoya/cadl-robot-town
cd cadl-robot-town
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install --upgrade pip
pip install -e ~/program/cadl_repo     # cadl コマンドと PyYAML が入る
```

インストールに失敗した場合は、[テキストブック 2.4 節](../textbook/02-toolchain-setup.md)のセットアップのトラブルシューティングを参照してください。

Anthropic の SDK と API キーが必要なのは、§8 で LLM を実際に呼ぶときだけです。§8 はそれらがなくても進められます。

```bash
pip install anthropic
```

---

## 2. 規則を読む（15 分）

`cadl/robot_town.cadl` を開きます。街の契約は 2 つです。

- **`DELIVERY_SLA`**：注文 1 件ごとのインスタンスです。120 秒以内に集荷し、そこから 120 秒以内に届けなければ `Late` になります。顧客への約束なので、**改正の対象外**です。
- **`ROAD_USE`**：ロボットが次の注文を待つために道路上に止まるたびに 1 インスタンスです。委員会が治めるのはこちらです。

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

`# @amend:<名前>` が付いた行の数値は、委員会が改正できます。
どこまで動かしてよいかは `constitution.yaml`（憲法）が決め、委員会は憲法を変えられません。

```yaml
amendable:
  hold_limit:      {min: 10, max: 120, step: 10}   # 道路上で待ってよい秒数
  block_k:         {min: 1,  max: 4,   step: 1}    # 後ろで何台待ったら退去させるか
  sanction_lambda: {min: 0.0, max: 2.0, step: 0.5} # 違反 1 件あたりの罰点の倍率（Minor 1、Major 3）
  ...
invariants:
  min_company_on_time_rate: 0.6
vote:
  quorum: 2
```

（抜粋して簡略化したものです。実際のファイルには、§7 の切替のしきい値 2 つも並びます。）

3 社の振る舞いは違います（`town/policies.py`）。
**A 社**は仕事がなければ必ず車庫に戻ります。**B 社**は道路上で次の注文を待ちますが、`hold_limit` の 5 秒前には離れます。**C 社**は、注文が来るか退去させられるまで待ち続けます。ただし `sanction_lambda` が 1.5 以上になると、B 社と同じ振る舞いに変わります。
交差点に止まっているロボットは、そこを通りたい他のロボットをすべてふさぎます。

### 演習 2-1

1. 今の規則で、罰点を受けることがありえない会社はどこですか。それはなぜですか。
2. B 社は `hold_limit` を超えて待つことはありません。それでも B 社に罰点を与えうる規則はどれですか。
3. C 社に道路上で待つのをやめさせるには、どこを何に変える必要がありますか。

---

## 3. 1 期だけ動かす（10 分）

ここでは運用モードを分散に固定します（モードは §7 で扱います）。

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

効用は「定時配達件数 − 罰点」です。数値は 5 つの乱数シードの平均です。

C 社は道路上で待ち、すべての顧客に定時で届け、そのために罰点 14.8 を払っています。
誰もふさいでいない A 社は 1352 秒ふさがれ、7.8 件を遅配しています。
下から 2 行目の違反は、すべて契約ランタイムが IR から判定したものです。`deadline:*` はライフサイクルの期限、`monitor:blocking_guard` は監視ルールによるものです。最後の行は運用モードの記録で、§7 で使います。

---

## 4. 改正ループを 1 期回す（15 分）

```bash
python -m town.council --mode DISTRIBUTED
```

ルールベースの委員会は、1 つのパラメータを 1 ステップ動かした案をすべて試します。

```text
  改正案                                  定時配達  違反 (道路) ふさがれた  検査 憲法 改善 投票(A B C)
  hold_limit 60s → 50s                     120.6  40.4 (28.8)     2468s    ○    ○    ×   ○ × ×
  hold_limit 60s → 70s                     124.2  31.6 (23.6)     2367s    ○    ○    ○   ○ ○ ○
  block_k 3 → 2                            131.0  35.2 (34.0)      985s    ○    ○    ○   ○ × ×
  ...
  → 採択: hold_limit 60s → 70s（目標 +2.4，賛成 ABC）。v2.cadl として保存。
```

町全体に最もよい案は `block_k 3 → 2`（後ろで 2 台が待った時点で退去させる）で、定時配達は 121.8 から 131.0 に増えます。
しかし B 社と C 社の反対で否決され、全社が賛成する小さな改正が採択されます。
採択された規則は `runs/<名前>/v2.cadl` に保存されます。`v1.cadl` と `v2.cadl` は、cadl-explorer（v0.5.4 以降）の **Designer** ページで比べられます。**Open an existing CADL file** で `v1.cadl` を開き、表示を **Versions** に切り替えて **Save as a version** で保存してから、`v2.cadl` を開きます。すると **Compare two designs** の **A — baseline** に保存した `v1`、**B — compared** に現在の設計（`v2`）が入り、差分が表示されます。これらのファイルは **Forms** ではなく **Source** で編集してください。フォームを適用するとコメントを除いてファイルを書き直すので、委員会が読む `# @amend:` の印が消えます（cadl-explorer も警告を出します）。初期の規則は、例題の設計 **robot town** としても用意されています。

### 演習 4-1

B 社自身も 849 秒ふさがれているのに、`block_k 3 → 2` に反対するのはなぜですか。§3 の表から説明してください。

---

## 5. 需要が変わる（10 分）

`scenario.yaml` が期ごとの需要を決めます。平常・繁忙期・閑散期があり、平常と繁忙期の 2 期目には、期の途中（20〜40 分）に注文が集中するラッシュがあります。
現行の規則も、その期の環境で評価し直してから改正案と比べます。

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

平常期と繁忙期に否決されていた `block_k 3 → 2` が、閑散期に通ります。
注文が少ないと、道路上で待って次の注文に早く着く利得よりも、C 社にふさがれる損のほうが、B 社にとって大きくなるためです。
環境が変わると会社の利害が変わり、それにつれて規則も変わります。

---

## 6. グッドハート型の暴走（15 分）

委員会に別の目標を与えます。委員会の担当である、道路の規則の違反件数（`release` の超過と `blocking_guard` による退去）の少なさです。

```bash
python -m town.council --mode DISTRIBUTED --rounds 8 --objective road_violations --name goodhart-d
```

```text
- 第 1 期（平常）: v2 hold_limit 60s → 70s（目標 +2.2，賛成 ABC）
- 第 4 期（繁忙期＋ラッシュ）: v3 block_k 3 → 4（目標 +4.0，賛成 ABC）
- 第 5 期（閑散期）: v4 hold_limit 70s → 80s（目標 +1.0，賛成 ABC）
- 第 7 期（平常）: v5 hold_limit 80s → 90s（目標 +1.4，賛成 ABC）
```

（第 2・3・6・8 期は採択なしです。）採択された改正は、すべて規則を**緩める**方向です。
改正ループが評価に使っていないシードで、版どうしを比べます。

```bash
python -m town.compare runs/goodhart-d/v1.cadl runs/goodhart-d/v5.cadl runs/seasons-d/v7.cadl --mode DISTRIBUTED
```

| 規則 | 定時配達 | 遅配 | 道路の規則の違反 | ふさがれた時間 | A 社の定時率 |
|---|---|---|---|---|---|
| 初期 v1 | 112.2 | 10.8 | 25.0 | 2457 秒 | 0.82 |
| 道路の違反を目標にした v5 | 106.0 | 17.0 | **21.0** | **3681 秒** | 0.72 |
| 定時配達を目標にした v7（§5） | 123.0 | 0.0 | 28.2 | 52 秒 | 1.00 |

数えている違反は減りました。違反を減らすいちばん簡単な方法は、違反と数えないことだからです。
一方で、ふさがれた時間と遅配はどちらも約 1.5 倍に増え、得をしたのは C 社だけでした。
定時配達を目標にした規則は、道路の規則の違反がむしろ多いのに、遅配はゼロです。
憲法の不変条件（定時率 6 割以上）は、この暴走を止めません。

---

## 7. 分散と集中の運用モードを切り替える（15 分）

| モード | 待機の場所 | 道路の使い方 |
|---|---|---|
| DISTRIBUTED（分散） | 各社が道路上（中央の交差点 8）で待つ | 交差点を自由に通る |
| CENTRALIZED（集中） | 管理者が道路の外の待避所（ノード 5・2・7 の脇、各 1 台）を割り当てる。道路上での待機は禁止 | 管理者がエッジを 1 台ずつ専有で割り当てる（C-SoS の調停器と同じ）。エッジに入るたびに 1 秒の許可待ち |

集中では交差点をふさがれなくなりますが、注文が非常に多いと、エッジの許可待ちが積み重なります。
モードを固定したときの定時配達（シード 1〜5 の平均）は次のとおりです。

| 注文の平均間隔 | 30 秒 | 45 秒 | 75 秒 | 120 秒 | 180 秒 |
|---|---|---|---|---|---|
| 分散 | **319.6** | 210.2 | 121.8 | 76.8 | 51.2 |
| 集中 | 309.2 | **217.4** | **132.2** | **83.2** | **58.6** |

切り替える条件は CADL ファイルの中に書かれています。5 分ごとに、直前 5 分の観測で判定します。

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

集中への切替は、道路上で待っているロボットが 1 台もいなくなってから有効になります（C 社は 30 秒渋り、60 秒たっても残っていれば管理者が退去させます）。有効になった時点で `safety_invariant` を判定します。
ラッシュのある期を、3 通りの運用で比べます。

```bash
python -m town.compare cadl/robot_town.cadl --rush 1200 2400 25 --mode DISTRIBUTED
python -m town.compare cadl/robot_town.cadl --rush 1200 2400 25 --mode CENTRALIZED
python -m town.compare cadl/robot_town.cadl --rush 1200 2400 25 --mode adaptive
```

| 運用 | 定時配達 | 遅配 | ふさがれた時間 | 集中の時間 |
|---|---|---|---|---|
| 分散に固定 | 202.8 | 8.0 | 2141 秒 | 0% |
| 集中に固定 | 206.2 | 4.6 | 843 秒 | 100% |
| CADL の条件で切替 | **209.2** | **1.6** | 1116 秒 | 60% |

切替は 1 期に 3 回起きます。開始 5 分で集中へ、ラッシュで分散へ、ラッシュが終わると集中へ戻ります。
次に、道路が空くのを待たずに切替を有効にしてみます。

```bash
python -m town.period --rush 1200 2400 25 --no-quiescence
```

最後の行に、安全条件の違反が 1 期あたり約 1.4 回（`安全条件の違反 1.4 回`）と出ます。
以後、委員会は切替つき（既定）で動き、2 つのしきい値も改正の対象になります。

---

## 8. LLM の委員会（15 分）

`--proposer llm` を付けると、改正案を Claude Opus 5.5 が書きます。
LLM には、その期の観測、これまでの改正履歴、憲法、現行の規則を渡し、改正案を最大 3 件返させます。各案は、題名と理由つきの**規則ファイル全体**です。
LLM が「何を変えたか」をどう説明しても信用しません。返ってきたファイルを同じ関門にかけ、憲法の関門では現行の規則と 1 行ずつ比べて、`@amend` 行の数値以外が変わっていないことも確かめます。

API キーがなくても、実際の実行を再生できます。`examples/llm-distributed/` には、2026-10-15 に Claude が書いた 2 期分の案（`--mode DISTRIBUTED --rounds 2`）が入っています。

```bash
python -m town.council --proposer replay --replay-dir examples/llm-distributed --mode DISTRIBUTED --rounds 2
```

| 期 | LLM の案 | 検査 | 憲法 | 改善 | 投票（A B C） |
|---|---|---|---|---|---|
| 1（平常） | `block_k` 3 → 2 | ○ | ○ | ○ | ○ × × |
| | `hold_limit` 60s → 50s | ○ | ○ | × | ○ × × |
| | `sanction_lambda` 0.5 → 1.0 | ○ | ○ | × | ○ × × |
| 2（平常＋ラッシュ） | `block_k` 3 → 2 | ○ | ○ | ○ | ○ × × |
| | `hold_limit` 60s → 50s | ○ | ○ | × | ○ ○ × |
| | `sanction_lambda` 0.5 → 1.0 | ○ | ○ | × | ○ × × |

注目してほしい点は次のとおりです。

- 6 案とも正しい形の改正で、両期の第一案は、ルールベースの探索が見つけた最善の案と同じでした。
- LLM は「B 社もふさがれているので賛成する」と見込みましたが、B 社は反対しました。B 社の投票を、B 社の損得ではなく町全体の利益から予想しています。
- 全社が賛成する「緩める」改正（§4）は、一度も出しませんでした。
- `sanction_lambda` を 1.0 に上げても何も変わりませんでした。C 社が振る舞いを変えるのは 1.5 以上で、1 回に動かせるのは 0.5 までです。LLM には各社の行動方針を渡していません。
- 1 回の呼び出しで、入力は約 4,400 トークン、出力は約 9,300 トークンでした（1 期あたり約 20 セント）。出力の大半は、3 案分の規則ファイル全体です。

実際に LLM を呼ぶには、次のようにします。

```bash
export ANTHROPIC_API_KEY=...        # 自分のキーを入力する。チャットやファイルには貼らない
python -m town.council --proposer llm --mode DISTRIBUTED --rounds 2 --name llm-distributed
```

`examples/llm-replay/` には、検査・憲法・投票のそれぞれで止まる 3 件の見本（LLM の出力ではなく、手で書いた案）が入っています。

---

## 9. 改造課題（任意）

| 課題 | ヒント |
|---|---|
| §6 の暴走を止める憲法を書く | ふさがれた時間や遅配についての不変条件を、`constitution.yaml` と `town/council.py` の `invariants_ok()` に足し、`--objective road_violations` をもう一度回す |
| B 社に学習する行動方針を与える | `town/policies.py` の `wants_to_park()` / `max_park_s()` を、前の期に受けた罰点に応じて変わるようにし、§4 の否決がそれでも起きるかを調べる |
| 投票の規則を変える | `ballots()` の定足数を、重みつきの投票や、最もふさがれている会社の拒否権に置き換える。誰が得をするか |
| 改正に期限を付ける | 環境が戻っても、委員会は改正を廃止しない（§5）。N 期のうちに再採択されなければ失効する、という規則を足す |
| LLM に渡す情報を増減する | `town/llm_council.py` の依頼に `town/policies.py` を加える、あるいは投票の規則を消す。改正案と投票の見込みがどう変わるかを比べる |

---

## 10. 仕様でまだ書けないこと

この演習を作る過程で、CADL 0.2 / `cadl` 0.3.14 に残る不足が 2 つ見つかりました。

- `cadl sim-ir` は `sos.transitions[*].safety_invariant` を IR に出力しません（`cadl check` は式として検査します）。演習では、検査を通ったソースファイルから読んでいます。
- 運用モード（regime）は名前だけで、パラメータの値や契約を結びつける構文がありません。集中モードで何が変わるか（待避所、エッジの専有）は、シミュレータの側で決めています。

`cadl` 0.3.11 までは、`deadline: soon` のような読めない値も `cadl check` を通り、IR では `null` になっていました。0.3.12 からはエラーです。演習では、街を動かすのに必要な値が IR にそろわない規則も却下するので、古いコンパイラでも検査の関門は働きます。

---

## まとめ

- 契約は固定されたものではありません。手続きを経て変わる、版のある成果物であり、どの版も動かす前に検査されます。
- 誰が決めるか（投票）、何をよしとするか（目標）、何を変えてはならないか（憲法）は、データと同じくらい規則の行方を左右します。
- LLM は、正しい形の改正案ともっともらしい理由を書けます。何を採択するかを決めるのは、検証・憲法・測った改善・当事者の合意という関門です。

---

## 参考資料

- メイン教材（ロボット配送）: [テキストブック](../textbook/index.md)
- コース B（都市モビリティ）: [`mobility-sos-tutorial.md`](mobility-sos-tutorial.md)
- SoS-DSL 仕様: cadl-spec [Appendix E](../spec/appendix-e-sos-dsl.md)
- 演習リポジトリ: https://github.com/ertlnagoya/cadl-robot-town
