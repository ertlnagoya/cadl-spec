---
sidebar_position: 20
sidebar_label: "付録 A — 用語集"
title: "付録 A — 用語集"
---

# 付録 A — 用語集

## リファレンス

| トピック | ファイル |
| --- | --- |
| 言語仕様 | `cadl-spec/docs/spec/`（今日のメインは [Appendix E](../spec/appendix-e-sos-dsl.md)） |
| パーサ実装 | `cadl_repo/src/cadl/parser.py` |
| IR | `cadl_repo/src/cadl/sim/ir.py`, `cadl_repo/src/cadl/sim/lower.py` |
| Unity C# 生成器 | `cadl_repo/src/cadl/codegen/unity_csharp/` |
| Python 参照ランタイム | `cadl-raspimouse-simulator/cadl/runtime/` |
| Lifecycle 可視化 | `cadl-explorer/cadl_sim/sos_dsl/` |
| End-to-end スクリプト | `cadl_repo/scripts/sos_dsl_handson_e2e.sh` |

### 用語集

| 用語 | 意味 |
| --- | --- |
| **SoS** | System of Systems — 構成要素自体が独立に運用されるシステム |
| **Actor** | SoS の自律参加者（ロボット、dispatcher、顧客） |
| **Contract（契約）** | 当事者間の規範的合意のクラス |
| **Contract instance（契約インスタンス）** | 1 件の配送要求に対応する具体的な契約実行 |
| **Lifecycle（ライフサイクル）** | 契約インスタンスが辿る状態機械 |
| **Monitor（モニター）** | 契約に紐づく宣言的な観測ルール |
| **Deadline（期限）** | 遷移に対する `deadline: <時間>` 形式のタイミング制約 |
| **`on_violation`** | 遷移の期限が切れたときのランタイムの動作。`transition:` には、インスタンスの移動先となる**状態名**（例：`Violated`）を書く（遷移の `id` ではない） |
| **`on_match`** | モニターの `rule` が成立したときのランタイムの動作。`transition:` には同じく移動先の状態名（例：`Violated`）を、`violation:` には記録する違反名を書く |
| **Severity（深刻度）** | 違反の分類：Minor / Major / Critical |
| **IR** | 中間表現（Intermediate Representation）— パーサと生成器の間の JSON |
| **Codegen target** | コード生成のバックエンド。例：`python`, `solidity`, `unity-csharp` |
| **Bridge（橋渡し）** | Pilot 状態変化を contract イベントに翻訳する `MonoBehaviour` |
