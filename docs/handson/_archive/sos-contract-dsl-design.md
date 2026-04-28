---
title: "Initial Design Notes"
description: "Early-session R&D notes on the SoS-DSL design. Content has been absorbed into Appendix E and the PBL course design; kept here as historical reference."
draft: true
unlisted: true
---

# CADL拡張：SoS契約DSL 設計・実装計画メモ

**対象ドメイン**: ロボット配送SoS（raspimouse-swarm-simulator / Unity）
**対象リポジトリ**:
- [ertlnagoya/cadl](https://github.com/ertlnagoya/cadl)
- [ertlnagoya/cadl-spec](https://github.com/ertlnagoya/cadl-spec)
- [ertlnagoya/cadl-explorer](https://github.com/ertlnagoya/cadl-explorer)
- [ertlnagoya/raspimouse-swarm-simulator](https://github.com/ertlnagoya/raspimouse-swarm-simulator)

**作成日**: 2026-04-28
**位置付け**: 研究開発メモ（第一版）。CADL本体および各リポジトリの最新コミットを参照のうえ、構文・識別子は実コードに合わせて調整する前提。

---

## 1. プロジェクト全体の設計方針

### 1.1 基本コンセプト

本プロジェクトの中心命題は **「SoSの構造記述（descriptive）と規範記述（normative）を、同じ言語生態系の中で一貫して扱う」** ことである。CADLはSoSの構造・構成要素・相互作用を記述する descriptive な層を担い、SoS契約DSLはその上に **「あるべき振る舞い（義務・許可・禁止）」と「破られたときの帰結（違反・報酬・制裁）」** を載せる normative な層を担う。

両者は別言語ではなく、**CADL内のサブ言語／構文拡張**として設計する。これにより、契約は構造から切り離された外部仕様ではなく、構造記述と同じ抽象構文木（AST）上で参照・型検査・可視化が可能になる。

### 1.2 設計上の四層構造

| 層 | 名称 | 責務 | 表現形式 |
| --- | --- | --- | --- |
| L1 | CADL構造層 | 構成システム・ポート・関係・相互作用の宣言 | 既存CADL構文 |
| L2 | SoS契約DSL層 | 規範（義務／許可／禁止）、状態機械、監視、報酬・制裁 | CADL拡張構文 |
| L3 | IR（中間表現） | L1+L2を意味論的に正規化したJSON/YAMLモデル | データ形式 |
| L4 | 実行コード | Unity C# / Python / ROS2 ノード等 | 生成成果物 |

L3を明示的に挟むことで、**可視化（CADL-explorer）と実装コード生成は同じIRを参照**できる。新しいターゲット（例：シミュレータをROS2に置換）への移植コストはL3→L4の置換のみに局所化される。

### 1.3 段階的スコープ

最初から全機能を生成しない。以下の優先順で実装する。

1. 状態機械（契約ライフサイクル：Proposed → Assigned → … → Completed/Violated）
2. イベント監視（タイマ・ポート・テレメトリの観測）
3. 違反判定（述語の評価とルール照合）
4. 報酬／ペナルティ評価（記録のみ。経済機構は後回し）
5. 再割当・補償ロジック（Coordinator側の自動アクション）

これにより最初のデモは「ロボット配送が成功／遅延／失敗するたびに、契約状態が遷移し、違反が記録され、可視化される」までを最短で示せる。

---

## 2. CADLとSoS契約DSLの関係

### 2.1 役割分担

| 観点 | CADL（L1） | SoS契約DSL（L2） |
| --- | --- | --- |
| 記述する対象 | 「何が存在し、何が繋がっているか」 | 「何が起きるべきで、起きなかったときどうなるか」 |
| 中心概念 | System, Port, Connector, Interaction | Contract, Party, Obligation, Violation |
| 評価モード | 静的構造 | 時間付き／イベント駆動 |
| 検証手段 | 構造整合性・接続検査 | 時相論理的性質・実行時監視 |
| 例 | `Robot has Battery, exposes /assign port` | `Robot must respond_within 5s of /assign` |

### 2.2 結合の仕方

SoS契約DSLは **CADLの識別子空間にホスト**される。すなわち契約定義は `Robot`, `Coordinator`, `DeliveryRequest` といったCADLで宣言された型・インスタンス・ポートを直接参照する。これは以下の制約を生む。

- 契約に登場する party は CADL の System として宣言済みでなければならない（型検査）。
- 契約のトリガとなるイベントは CADL のポート／メッセージとしてバインド可能でなければならない。
- 契約状態は CADL のシステム属性（テレメトリ）として外部観測可能である必要がある。

これにより **「契約に書いたが構造に存在しない要素」「構造にあるが契約で言及されない要素」** を機械的に検出できる。

### 2.3 用語上の決め

CADL本体の語彙との衝突を避けるため、契約DSL側のキーワードは以下のように差別化する（暫定）。

- 構造側: `system`, `port`, `connector`, `interaction`
- 契約側: `contract`, `party`, `state`, `on`, `obligation`, `must`, `may`, `must_not`, `within`, `violates`, `rewards`, `sanctions`, `monitor`

---

## 3. CADL拡張としてのメタモデル案

以下はCADLメタモデルにadditiveに追加する要素群（Ecore/UML風の擬似記法）。

```
Package SoSContract {

  // --- 契約と当事者 -----------------------------------------
  class Contract {
    name        : String
    parties     : Party[1..*]            // 参加するConstituent System
    subject     : Reference[CADL::Entity]?  // 契約の主題（例: DeliveryRequest）
    states      : ContractState[1..*]
    initial     : Reference[ContractState]
    terminal    : Reference[ContractState][0..*]
    obligations : Obligation[*]
    permissions : Permission[*]
    prohibitions: Prohibition[*]
    rewards     : Reward[*]
    sanctions   : Sanction[*]
    monitors    : Monitor[*]
    transitions : Transition[*]
  }

  class Party {
    role   : String                       // "robot", "coordinator", "client"
    binds  : Reference[CADL::System]      // 構造側のSystemへバインド
  }

  // --- 規範 ---------------------------------------------------
  abstract class Norm {
    id        : String
    actor     : Reference[Party]
    trigger   : Event
    condition : Predicate?
    deadline  : TimeExpression?
  }
  class Obligation  extends Norm { effect : Action }
  class Permission  extends Norm { effect : Action }
  class Prohibition extends Norm { forbid : Action }

  // --- 状態と遷移 --------------------------------------------
  class ContractState {
    name     : String
    invariant: Predicate?
  }
  class Transition {
    from   : Reference[ContractState]
    to     : Reference[ContractState]
    on     : Event
    when   : Predicate?
    emit   : Action[*]
  }

  // --- 違反と帰結 --------------------------------------------
  class Violation {
    of       : Reference[Norm]
    severity : enum { Minor, Major, Critical }
    detected : Reference[Monitor]
  }
  class Reward {
    to        : Reference[Party]
    amount    : Expression                // 数値/トークン/評価点
    when      : Predicate                 // 例: delivered_before_deadline
  }
  class Sanction {
    to        : Reference[Party]
    amount    : Expression
    when      : Reference[Violation]
    actions   : Action[*]                 // 例: blacklist, reassign
  }

  // --- 監視 ---------------------------------------------------
  class Monitor {
    name      : String
    observes  : ObservationSource[1..*]   // CADLポート/タイマ/テレメトリ
    rule      : Predicate
    on_match  : Action[*]                 // emit event / mark violation
    sampling  : enum { Event, Periodic }
    period    : Duration?
  }

  // --- 共通 ---------------------------------------------------
  class Event {
    kind   : enum { PortMessage, Timeout, StateChange, External }
    source : Reference[Any]
    name   : String
    payload: TypeExpr?
  }
  class Predicate { expr : ExpressionAST }
  class Action    { expr : ExpressionAST }
  class TimeExpression { value : Number; unit : enum { ms, s, min, h } }
}
```

### 3.1 設計上のポイント

- **規範は norm（Obligation/Permission/Prohibition）として一元的に階層化**し、共通の `trigger / condition / deadline` を持たせる。これにより監視器の生成テンプレートが1本化できる。
- **状態と規範を分離する**。状態機械は契約の「ライフサイクル」、規範は各状態における「振る舞い制約」を表す。両者は `Transition.emit` と `Monitor.on_match` を通じて結合する。
- **Reward/Sanctionは実体として宣言**するが、第一版では「記録（log）と表示」のみ。経済的なインセンティブ機構（トークン移転等）はL4で別モジュール化する。

---

## 4. ロボット配送デモ用の具体的なSoS-DSL構文案

CADLの既存構文に親和的な、宣言的・ブロック構造のシンタックスを提案する。

### 4.1 構造側（CADL本体、参考）

```cadl
system Robot {
  port assign        : in  DeliveryRequest
  port ack           : out Ack
  port status        : out DeliveryStatus
  attr battery_level : Float    // 0.0..1.0
  attr position      : Pose2D
}

system Coordinator {
  port request_in    : in  DeliveryRequest
  port assign_out    : out DeliveryRequest
  port status_in     : in  DeliveryStatus
}

system Field {
  contains Depot, Destination, Obstacle*
}

interaction DeliveryFlow {
  Coordinator.assign_out --> Robot.assign
  Robot.ack              --> Coordinator
  Robot.status           --> Coordinator.status_in
}
```

### 4.2 契約DSL本体

```cadl
contract DeliveryContract {

  // --- 当事者と主題 ---
  party robot       : Robot
  party coordinator : Coordinator
  subject request   : DeliveryRequest

  // --- 状態機械 ---
  states {
    Proposed     initial
    Assigned
    Accepted
    Delivering
    Completed    terminal
    Violated     terminal
    Terminated   terminal
  }

  // --- 状態遷移 ---
  transition assign_proposed_to_assigned {
    from Proposed to Assigned
    on  coordinator.assign_out(request)
  }

  transition robot_accepts {
    from Assigned to Accepted
    on  robot.ack(request)
    when ack.kind == Accepted
    emit log("robot accepted: " + request.id)
  }

  transition start_delivery {
    from Accepted to Delivering
    on  robot.status(request)
    when status == InTransit
  }

  transition complete_delivery {
    from Delivering to Completed
    on  robot.status(request)
    when status == Delivered && time.now <= request.deadline
  }

  transition violated_late {
    from { Assigned, Accepted, Delivering } to Violated
    on  timeout(request.deadline)
  }

  // --- 義務 ---
  obligation respond_to_assignment {
    actor    robot
    on       coordinator.assign_out(request)
    must     robot.ack(request)
    within   5s
    on_violation -> Violated, severity Major
  }

  obligation deliver_before_deadline {
    actor    robot
    state    Accepted | Delivering
    must     robot.status(request) where status == Delivered
    within   request.deadline
    on_violation -> Violated, severity Critical
  }

  // --- 禁止 ---
  prohibition no_accept_when_low_battery {
    actor    robot
    must_not robot.ack(request) where ack.kind == Accepted
    when     robot.battery_level < 0.20
    on_violation severity Major
  }

  // --- 許可（Coordinatorの再割当権） ---
  permission reassign_on_failure {
    actor coordinator
    may   coordinator.assign_out(request)
    when  contract.state in { Violated }
       || (obligation respond_to_assignment.violated)
       || (obligation deliver_before_deadline.violated)
  }

  // --- 報酬 ---
  reward early_delivery_bonus {
    to     robot
    when   contract.state == Completed
        && time.now <= (request.deadline - 30s)
    amount 10
  }

  reward cooperative_handover {
    to     robot
    when   exists handover : Handover where handover.from == robot
    amount 5
  }

  // --- 制裁 ---
  sanction late_or_failed_penalty {
    to      robot
    when    violated(deliver_before_deadline)
         || violated(respond_to_assignment)
    amount  20
    actions { blacklist(robot, 60s); reassign(request) }
  }

  // --- 監視 ---
  monitor battery_guard {
    observes robot.battery_level (periodic 500ms)
    rule     robot.battery_level < 0.20 && contract.state == Assigned
    on_match emit violation(no_accept_when_low_battery)
  }

  monitor collision_watch {
    observes robot.position, field.obstacles (periodic 100ms)
    rule     dist(robot.position, any obstacle) < 0.05
    on_match emit violation("collision"), severity Critical
  }

  monitor deadline_watch {
    observes time.now
    rule     time.now > request.deadline
          && contract.state in { Assigned, Accepted, Delivering }
    on_match emit transition(violated_late)
  }
}
```

### 4.3 構文上の判断

- **`contract` ブロックは1つの「主題（subject）」に対する1ライフサイクル**を表す。複数の配送要求がある場合はインスタンス化される（テンプレート的）。
- **`obligation` は「actor / trigger / must / within」の四つ組**を必須化することで、義務記述の抜け漏れを文法レベルで防ぐ。
- **`state` 集合に対する遷移源指定**（`from { Assigned, Accepted, Delivering }`）を許し、現実的な状態多発生に対応。
- **`monitor` を独立させる**ことで、規範（normative）と観測（operational）を分離。同じ違反検出ロジックを複数の規範で再利用可能。
- **報酬・制裁は宣言的**にし、`amount` は数値だけでなく式（評価点・トークン）に拡張可能としておく。

---

## 5. CADL-explorerで追加すべき可視化ビュー案

既存のCADL-explorerは構造ビュー中心と想定。SoS-DSL対応として以下のビューを追加する。

### 5.1 Contract Lifecycle View（契約状態機械）

各契約インスタンスごとに、状態ノード（Proposed/Assigned/.../Violated）を有向グラフで描画。アクティブな状態をハイライト。遷移エッジには `on / when` をラベル表示。

### 5.2 Obligation Timeline View（義務タイムライン）

横軸を時間、縦軸を `(契約インスタンス, 義務ID)` の組とし、

- 義務発生（trigger）→ オープン
- 達成 → 緑バー
- 違反 → 赤バー（severityで濃淡）
- 期限 → 縦点線

を描く。Gantt風UI。SoSの「いつ・誰の・何が・どう守られなかったか」が一目で分かる。

### 5.3 Norm Compliance Matrix（規範遵守マトリクス）

行：Party、列：Norm、セル：遵守率／違反回数。SoS全体の健全性ダッシュボード。

### 5.4 Reward / Sanction Ledger View（インセンティブ台帳）

各Partyごとの報酬・制裁を時系列の台帳として表示。累積スコアと内訳（どの契約／どのイベントから来たか）をトレース可能に。

### 5.5 Interaction × Contract Overlay View（相互作用オーバーレイ）

CADLの既存「インタラクション図」上に、契約状態をエッジ色で重ね描き。例：`Coordinator → Robot` のメッセージ線が、対応する契約の現状態に応じて色が変わる。構造ビューと契約ビューの橋渡し。

### 5.6 Violation Trace View（違反トレース）

特定の違反を選ぶと、その違反に至るまでのイベント系列・状態遷移・観測値を時系列で再生（タイムスライダ付き）。デバッグ・規範改善の中心UI。

### 5.7 What-if Editor（規範編集→再シミュレーション連携、将来）

CADL-explorer上でobligationの `within` 値や `when` 述語を編集 → IR再生成 → シミュレータ再実行 → 結果を比較。規範チューニングのループを閉じる。

---

## 6. 中間表現IRの設計案

### 6.1 形式と原則

- 形式：JSON（YAML出力もサポート）
- スキーマ：JSON Schemaで明示的に固定
- 原則：
  - **CADLとSoS-DSLを同一IR内に統合**し、相互参照は安定IDで解決
  - **意味論的正規化**（糖衣構文の展開、状態集合 from の単一遷移列への展開、`within` を明示的タイマイベントへ変換）
  - **生成器は IR のみを入力とする**（CADLソースを読まない）

### 6.2 IRトップレベル構造

```json
{
  "ir_version": "0.1",
  "source": { "cadl_files": ["delivery.cadl"], "hash": "..." },
  "entities": {
    "systems": [ /* CADL System */ ],
    "ports":   [ /* CADL Port */ ],
    "connectors": [ /* CADL Connector */ ],
    "interactions": [ /* CADL Interaction */ ],
    "types":   [ /* DTO/Message型 */ ]
  },
  "contracts": [
    {
      "id": "DeliveryContract",
      "parties": [
        { "role": "robot", "system_ref": "sys.Robot" },
        { "role": "coordinator", "system_ref": "sys.Coordinator" }
      ],
      "subject_type": "type.DeliveryRequest",
      "state_machine": {
        "states": [
          { "id": "Proposed", "kind": "initial" },
          { "id": "Assigned" },
          { "id": "Accepted" },
          { "id": "Delivering" },
          { "id": "Completed", "kind": "terminal" },
          { "id": "Violated",  "kind": "terminal" },
          { "id": "Terminated","kind": "terminal" }
        ],
        "transitions": [
          {
            "id": "t.assign",
            "from": "Proposed", "to": "Assigned",
            "trigger": { "kind": "PortMessage", "port": "sys.Coordinator.assign_out" }
          }
        ]
      },
      "norms": [
        {
          "kind": "Obligation",
          "id": "respond_to_assignment",
          "actor": "party.robot",
          "trigger": { "kind": "PortMessage", "port": "sys.Coordinator.assign_out" },
          "must": { "kind": "PortMessage", "port": "sys.Robot.ack" },
          "deadline": { "value": 5, "unit": "s" },
          "on_violation": { "to_state": "Violated", "severity": "Major" }
        }
      ],
      "monitors": [
        {
          "id": "battery_guard",
          "sources": [
            { "kind": "Attribute", "ref": "sys.Robot.battery_level", "sampling": "Periodic", "period_ms": 500 }
          ],
          "rule_ast": { "op": "and", "lhs": { "op": "<", "lhs": "sys.Robot.battery_level", "rhs": 0.20 },
                                       "rhs": { "op": "==", "lhs": "contract.state", "rhs": "Assigned" } },
          "on_match": [ { "kind": "EmitViolation", "norm": "no_accept_when_low_battery" } ]
        }
      ],
      "rewards":   [ /* ... */ ],
      "sanctions": [ /* ... */ ]
    }
  ],
  "diagnostics": {
    "unbound_party": [],
    "unobserved_event": [],
    "dead_state": []
  }
}
```

### 6.3 正規化規則（抜粋）

| 糖衣 | 正規化後 |
| --- | --- |
| `from { A, B, C } to X` | `A→X`, `B→X`, `C→X` の3つのtransitionに展開 |
| `obligation … within 5s` | 暗黙の `Timeout` イベントを契約に追加し、deadline transition を生成 |
| `state A | B` （規範のスコープ条件） | `condition.AST = state in {A,B}` に置き換え |
| `violated(norm_id)` | 述語ASTで `violations[norm_id].count > 0` に展開 |

これにより、後段のコード生成は「単純な状態機械＋イベント駆動述語評価」だけを扱えばよくなる。

---

## 7. Unity/C# または raspimouse-swarm-simulator 向けコード生成方針

### 7.1 ターゲットと共通アーキテクチャ

| ターゲット | 言語 | 想定ランタイム |
| --- | --- | --- |
| Unity | C# | MonoBehaviour / ScriptableObject |
| raspimouse-swarm-simulator | Python（または既存採用言語） | ROS2ノード相当 |

両者で共通する **「契約ランタイム」コア**を仕様として固定する。

```
ContractRuntime
 ├─ ContractInstanceRegistry      // インスタンス管理
 ├─ EventBus                      // ポートメッセージ・タイマ・テレメトリの共通入力
 ├─ StateMachineEngine            // IRから生成された遷移表を駆動
 ├─ MonitorEngine                 // ルール評価とviolation発火
 ├─ NormEvaluator                 // obligation/permission/prohibitionの判定
 ├─ Ledger                        // reward/sanctionの記録
 └─ Telemetry                     // CADL-explorerへの可視化用ストリーム
```

### 7.2 Unity/C# 生成方針

- 各 `contract` → C# クラス `XxxContract : ContractBase` を生成。
- `state_machine` → enum `XxxState` ＋ 遷移表ScriptableObject。
- `obligation` → 内部 `Obligation` インスタンス（trigger, deadline, must, onViolation）。
- `monitor` → 各MonitorはMonoBehaviourとして `Update()` または `Coroutine` で起動可能。
- ポートバインドはインターフェース（例：`IRobotPorts`）を生成し、シミュレータ側実装を注入。
- 違反・報酬は `ContractEvent` として `EventBus` にpublish、Editor拡張で可視化。

### 7.3 raspimouse-swarm-simulator 向け生成方針

- 現行シミュレータがPython中心と仮定し、`contract_runtime.py` を共通モジュールとして配備。
- 各 `contract` → Pythonクラス（dataclass + state enum）。
- ROSトピックがある場合は、ポート → トピック購読/出版のマッピングを生成。
- 監視器は `asyncio` タスクまたは `rclpy` のタイマで実装。
- 違反検出とログは構造化JSONで標準出力 → CADL-explorerが拾えるWebSocketまたはファイルtail。

### 7.4 コード生成の段階的スコープ

1. **状態機械の骨組み**（enum＋遷移表＋現状態管理）
2. **イベントバス連携**（ポートメッセージ受信→トリガ発火）
3. **タイマと違反判定**（`within` のdeadlineハンドラ）
4. **監視器**（Periodic / Event両方）
5. **報酬・制裁の記録のみ**（実行アクションはまだ生成しない）
6. **再割当などの自動アクション**（permissionを自動行使する戦略の生成）

### 7.5 生成テンプレートの方針

- テンプレートエンジン：Jinja2（Python側）／ Scriban or T4（C#側）
- IR → テンプレート → ソース。テンプレートはレポジトリに **`templates/<lang>/<artifact>.tmpl`** として版管理。
- 生成ファイルのヘッダに **生成元IRハッシュ**を埋め込み、手修正の事故を抑止。

---

## 8. 最小実装プロトタイプのステップ

### Step 0: 準備
- `cadl-spec` リポジトリでSoS-DSL拡張のRFCドラフトを作成（本メモを下敷きに）。
- `cadl` リポジトリに `experimental/sos-dsl` ブランチを切る。

### Step 1: パーサ拡張
- 既存パーサに `contract`, `party`, `state(s)`, `transition`, `obligation`, `permission`, `prohibition`, `reward`, `sanction`, `monitor` の構文を追加。
- ASTノード定義を追加。最小限の構文検査（重複定義・未定義参照）を実装。

### Step 2: 型・参照解決
- `party` の `: Robot` バインドが既存CADL型に解決できることを検証。
- `on coordinator.assign_out(request)` のポート参照を解決。
- 解析エラーをdiagnosticsに集約。

### Step 3: IR出力
- パース後のASTからJSON IRを出力するシリアライザを実装。
- 正規化規則（状態集合の展開、deadline timer注入、`violated()` 述語展開）。

### Step 4: CADL-explorer 拡張（可視化最小版）
- IRを読み込み、Contract Lifecycle View と Obligation Timeline View の2つだけまず実装。
- 静的シナリオ（あらかじめ用意したイベントログ）でビューが動くことを確認。

### Step 5: 契約ランタイム（Python版）
- raspimouse-swarm-simulator上で動く `contract_runtime.py` を実装。
- 1契約・1ロボット・1配送要求の最小ケースを動作させ、状態が遷移し、violationがログ出力されることを確認。

### Step 6: 監視器のひとつを実装
- `battery_guard` を実装し、バッテリ閾値割れで `no_accept_when_low_battery` 違反が出ることを確認。

### Step 7: イベントログ → CADL-explorer
- ランタイムが吐く違反・遷移・報酬イベントを、CADL-explorerが受信し時系列に表示できる経路を作る（WebSocket or NDJSON tail）。

### Step 8: Unity側プロトタイプ
- 同じIRからUnity C#向け状態機械クラスを生成し、Unityシーン上で配送デモを動かす。

### Step 9: デモシナリオ
- 「正常配送」「期限遅延」「バッテリ不足」「Coordinator再割当」の4シナリオを用意し、それぞれが契約ライフサイクル・違反・報酬として可視化されることをend-to-endで示す。

---

## 9. 研究論文として主張できる新規性

### 9.1 主張可能なコントリビューション

1. **SoSの構造記述ADLと規範記述DSLの統合**
   既存のADL（AADL, SysML, ArchiMate等）はSoSの構造を扱うが、SoS固有の規範（義務・許可・禁止・違反・報酬）を第一級概念として備える例は乏しい。CADLにSoS契約DSLを内包させた設計は、両者を同一識別子空間で扱う点で新規性がある。

2. **「契約」をスマートコントラクト言語に依存せず ADL 上に定義**
   Solidityなど既存の契約言語は実行プラットフォーム（ブロックチェーン）と強く結合している。本提案は契約を **アーキテクチャ記述上の宣言**として扱い、必要に応じて多様な実行ターゲット（Unity, ROS, ブロックチェーン）へ写像する分離設計を主張できる。

3. **可視化駆動の規範洗練ループ**
   契約状態・義務タイムライン・違反トレースをCADL-explorerで可視化し、編集→再生成→再シミュレーションのループを閉じる。規範を「書いて終わり」でなく **対話的に磨ける**点を方法論として打ち出せる。

4. **規範記述から実行コードへの段階的生成**
   状態機械→イベント監視→違反判定→報酬/制裁、という段階的生成ロードマップ自体を、SoS規範DSLのコード生成パターンとして整理できる。

5. **同一IRからの異種ターゲット生成**
   Unity/C#（仮想空間）と raspimouse シミュレータ（物理近似）に対し同じIRから生成し、規範レベルでの **シミュレーション間移植性**を示せる。

### 9.2 想定する関連研究との差分

- **Deontic Logic / Norm-based MAS**: 規範論理の理論はあるが、ADLとの統合・実装コード生成・SoS文脈はカバーされにくい。
- **xADL / AADL / SysML**: 構造・振る舞い記述は強いが、義務・違反・報酬という normative 語彙を欠く。
- **Smart Contracts (Solidity等)**: 契約記述は強力だが、SoSの構造記述や物理シミュレーションとの接続は弱い。
- **Runtime Verification / RV-Monitor**: 監視は強いが、ADL内に統合された規範DSLとしてではなく、独立したアサーション言語として提供される。

### 9.3 評価軸の候補

- ロボット配送デモにおける規範違反検出の正確性・遅延
- 同一IRからUnity / raspimouseへの生成における再現性
- 規範変更1サイクル（編集→再生成→再実行）の所要時間
- ユーザスタディ：CADL-explorer上で違反原因を特定するまでの時間

---

## 10. 実装タスクをGitHub Issue化できる粒度のToDoリスト

### A. 仕様・設計
- [ ] **A1** SoS-DSL RFC（本メモを基に `cadl-spec` にドラフト追加）
- [ ] **A2** メタモデル UML/Ecore 図の作成と `cadl-spec/docs/sos-dsl/metamodel.md` 化
- [ ] **A3** 構文EBNFの最終確定（`cadl-spec/grammar/sos.ebnf`）
- [ ] **A4** IR JSON Schema の作成（`cadl-spec/ir/schema/v0.1/contract.schema.json`）
- [ ] **A5** 用語集（party, obligation, monitor等）の確定と多言語対訳

### B. CADLパーサ／コンパイラ
- [ ] **B1** `contract` ブロック構文のレキサ／パーサ追加
- [ ] **B2** `obligation` / `permission` / `prohibition` / `monitor` のAST定義
- [ ] **B3** `party : Robot` の参照解決と型検査
- [ ] **B4** `on port(...)` のポート参照解決
- [ ] **B5** 状態集合 `from { A,B,C }` 等の正規化パス
- [ ] **B6** `within` deadline のタイマ展開
- [ ] **B7** IRシリアライザ（JSON/YAML出力）
- [ ] **B8** diagnostics（unbound_party, unobserved_event, dead_state）出力
- [ ] **B9** ユニットテスト：構文OK／NGケース最低30
- [ ] **B10** ユニットテスト：IR正規化の不変条件チェック

### C. CADL-explorer 可視化
- [ ] **C1** IRローダ（v0.1 schema対応）
- [ ] **C2** Contract Lifecycle View 実装
- [ ] **C3** Obligation Timeline View 実装
- [ ] **C4** Norm Compliance Matrix 実装
- [ ] **C5** Reward/Sanction Ledger 実装
- [ ] **C6** Interaction × Contract Overlay 実装
- [ ] **C7** Violation Trace View 実装（イベントログ再生対応）
- [ ] **C8** ランタイムからのイベントストリーム受信（WebSocket/NDJSON）

### D. 契約ランタイム（Python / raspimouse-swarm-simulator 向け）
- [ ] **D1** `contract_runtime` パッケージ雛形と CI セットアップ
- [ ] **D2** `EventBus` 実装
- [ ] **D3** `StateMachineEngine`（IRからの遷移表ローダ含む）
- [ ] **D4** `MonitorEngine`（Event/Periodic両モード）
- [ ] **D5** `NormEvaluator`（obligation/prohibition/permission評価）
- [ ] **D6** `Ledger`（reward/sanction記録、JSONログ）
- [ ] **D7** raspimouse シミュレータとのポート↔トピック写像層
- [ ] **D8** デモ：1ロボット・1配送・正常系
- [ ] **D9** デモ：deadline遅延 → Violated 遷移
- [ ] **D10** デモ：バッテリ低下 → 受諾禁止違反
- [ ] **D11** デモ：Coordinator再割当 permission の発火

### E. Unity/C# 生成
- [ ] **E1** 生成器スケルトン（IR → C#プロジェクト雛形）
- [ ] **E2** 状態機械クラステンプレート
- [ ] **E3** イベントバス／ポートインターフェース生成
- [ ] **E4** 監視器（MonoBehaviour／Coroutine）テンプレート
- [ ] **E5** Editor拡張：契約状態のScene上可視化
- [ ] **E6** Unityサンプルシーン：簡易配送デモ

### F. 統合・評価
- [ ] **F1** end-to-end CIパイプライン（CADL → IR → ランタイム → 可視化）
- [ ] **F2** 同一IRからUnity / raspimouse生成の再現性チェック
- [ ] **F3** 4シナリオ（正常／遅延／バッテリ不足／再割当）の自動回帰テスト
- [ ] **F4** 性能計測（違反検出遅延、生成所要時間）
- [ ] **F5** ユーザスタディ計画書

### G. ドキュメント・対外
- [ ] **G1** チュートリアル「ロボット配送SoSをCADL+SoS-DSLで書く」
- [ ] **G2** リファレンス（構文一覧／IR仕様／ランタイムAPI）
- [ ] **G3** デザインノート（本メモを公開可能な形に整理）
- [ ] **G4** 国内学会向けポジションペーパー
- [ ] **G5** 国際会議向けフルペーパーのアウトライン

---

## 付録：用語の暫定定義

| 用語 | 定義（本プロジェクトでの意味） |
| --- | --- |
| Constituent System | SoSを構成する独立運用可能なシステム（Robot, Coordinator等） |
| Party | 契約に参加するConstituent Systemのロール付き参照 |
| Norm | Obligation / Permission / Prohibition の総称。規範の最小単位 |
| Obligation | actorが特定のtriggerに対し、deadline以内にmust行為を行う義務 |
| Permission | actorが条件を満たすときmay行為を行ってよい許可 |
| Prohibition | actorが条件を満たすときmust_not行為を行ってはならない禁止 |
| Violation | Norm が破られた事実。severity を持つ |
| Monitor | 観測対象とルールを持ち、ルール充足時にviolation／遷移を発火する観測器 |
| Reward | 条件充足時にPartyに与えられる正の評価 |
| Sanction | Violationに対しPartyに課される負の評価および随伴アクション |
| IR | CADL+SoS-DSLを意味論的に正規化した中間JSON表現 |

---

**次のアクション候補**:
1. `cadl-spec` に本メモをRFCとしてpush（タスクA1）
2. ロボット配送デモの最小CADLモデル（`delivery.cadl`）を1ファイル試作
3. パーサ拡張プロトタイプ（タスクB1〜B3）を `experimental/sos-dsl` で開始
