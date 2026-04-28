---
title: "Unity Runbook (legacy)"
description: "Standalone walkthrough for running the Unity scene end-to-end. Superseded by Step 6 of the main hands-on textbook."
draft: true
unlisted: true
---

# Unity 実走 Runbook (SoS-DSL × C-SoS)

このセッションで生成した SoS-DSL ランタイムを **既存の C-SoS シーン** で
動かして、`Pilot_CSoS` の状態遷移が `DeliverySlaContract` に正しく
流れることを確認するための手順です。所要 15〜30 分（初回 Library 再構築
含むなら +α）。

---

## 0. 前提

- Unity 2022.3.27f1
- Go 1.21+
- NATS Server (`brew install nats-server` で入れる)
- 既に `feature/sos-dsl` ブランチに submodule SHA bump まで commit 済み

---

## 1. NATS と arbitrator を別 Terminal で起動

```bash
# Terminal 1 — NATS
nats-server -p 4222

# Terminal 2 — C-SoS arbitrator (Go)
cd ~/program/raspimouse-swarm-simulator/arbitrator/C-SoS/main
go run main.go            # 既にビルド済みなら ./csos_arbitrator
```

両方とも前面で動かしっぱなしにしてください。

---

## 2. Unity Hub から `unity/` プロジェクトを開く

`~/program/raspimouse-swarm-simulator/unity` を Unity 2022.3.27f1
で開きます。初回なら Library 再構築で数分待ちます。

---

## 3. C-SoS シーンを開く

Project ペインで `Assets/Scenes/C-SoS.unity` をダブルクリック。

---

## 4. シーンに ContractRuntimeHost を追加

1. Hierarchy で右クリック → **Create Empty** → 名前を
   `ContractRuntimeHost` に変更。
2. Inspector の **Add Component** から
   `Cadl.SosDsl.Demo.ContractRuntimeHost` を追加。
3. `Log To Console` チェック (default ON でOK)。

> このオブジェクトはシーン全体で 1 つだけ。`DontDestroyOnLoad` 付き。

---

## 5. 各ロボットに PilotContractBridge を追加

Hierarchy で `Pilot_CSoS` がアタッチされたロボット GameObject を
**5 体すべて** 探し、それぞれに：

1. **Add Component** → `Cadl.SosDsl.Demo.PilotContractBridge`
2. Inspector の `Robot Battery` を 90 (default) のまま、または
   テスト用に 15 に下げて `battery_guard` モニタを発火確認。

> ロボット GameObject のリストは Hierarchy で `Pilot_CSoS` を検索
> （Hierarchy 上部の検索欄に `Pilot_CSoS`）するのが速いです。

---

## 6. シーン保存

`Cmd+S` で `C-SoS.unity` を保存。

---

## 7. Play

Unity Editor の上部の Play ボタンを押す。

Console ペインに **次のような行** が継続的に出れば成功：

```
[lifecycle DELIVERY_SLA/robot-0-1 Proposed -> Assigned (assign, event) @ 1234ms]
[lifecycle DELIVERY_SLA/robot-0-1 Assigned -> Accepted (accept, event) @ 1234ms]
[lifecycle DELIVERY_SLA/robot-0-1 Accepted -> Delivering (start_delivery, event) @ 1280ms]
[lifecycle DELIVERY_SLA/robot-0-1 Delivering -> Completed (complete, event) @ 8341ms]
[lifecycle DELIVERY_SLA/robot-0-2 Proposed -> Assigned (assign, event) @ 8650ms]
...
```

各ロボットの delivery 1件ごとに 4 行出るはずです。
`battery` を 15 まで下げたロボットは、

```
[violation DELIVERY_SLA/robot-2-1 battery_guard Major monitor:battery_guard @ 2150ms]
[lifecycle DELIVERY_SLA/robot-2-1 Assigned -> Violated (<jump>, monitor) @ 2150ms]
```

が出ます。

---

## 8. もしうまく動かなかったら

| 症状 | 原因と対処 |
| --- | --- |
| `[PilotContractBridge X] ContractRuntimeHost.Instance is null.` | ContractRuntimeHost を 1個もシーンに置いていない。Step 4 をやり直す。 |
| Console に lifecycle が一切出ない | arbitrator / NATS が起動していない、またはCADL config が delivery_request を broadcast していない。Step 1 と CADL config を確認。 |
| 5体すべてではなく1体しか出ない | PilotContractBridge を1体しかattachしていない。Step 5 をやり直す。 |
| `accept` が `assign` の直後に必ず出る | 期待動作。Bridge は「勝ったときに assign+accept を一括発火」している (Demo/README.md 参照)。 |
| `start_delivery` がない/順番が変 | Pilot_CSoS が `hasActiveDelivery` を立ててから次の Update に出るので、1 frame 遅れて `InTransit` が出る。これは想定動作。 |

---

## 9. 結果ログの共有方法

Unity の Console は右上の三点メニューから **Open Editor Log** で
ファイルパスが表示されます。`Editor.log` から該当行を抽出：

```bash
grep -E "lifecycle DELIVERY_SLA|violation DELIVERY_SLA" \
     ~/Library/Logs/Unity/Editor.log | head -200
```

出てきた20〜50行を貼ってもらえれば、こちらで「期待する遷移列に一致しているか」を
検証します。

---

## 10. 終わったら

- Play を止める
- `nats-server` と `arbitrator` (Terminal 1, 2) を Ctrl+C で止める
