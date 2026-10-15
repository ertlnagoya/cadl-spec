---
sidebar_position: 8
sidebar_label: "第 8 章 — Unity でシミュレーションを動かす"
title: "第 8 章 — Unity でシミュレーションを動かす"
---

# 第 8 章 — Unity でシミュレーションを動かす

## Step 6 — Unity でシミュレーションを動かす (15 分)

### 学ぶこと
- 既存シーンに `ContractRuntimeHost` と `PilotContractBridge` を組み込む方法。
- Unity Console でリアルタイムの contract イベントを読む方法。

### 6.1 NATS と arbitrator を起動

**2 つ**の別 Terminal で：

```bash
# Terminal 1 — NATS メッセージブローカ
nats-server -p 4222
```

```
[INFO] Starting nats-server
[INFO] Server is ready
[INFO] Listening for client connections on 0.0.0.0:4222
```

```bash
# Terminal 2 — C-SoS arbitrator (Go)
cd ~/program/cadl-raspimouse-simulator/arbitrator/C-SoS/main
go run .
```

```
[Config] Loaded from ../../../unity/Assets/streamingAssets/cadl_config.json: nats_url=nats://localhost:4222 numAgents=5
[Config]   init=init next=next ret=ret fin=fin disp=disp resource=resource
[Config]   taskArbitration.enabled=true protocol=fcfs intervalSec=5.0
```

この 3 行目 `taskArbitration.enabled=true` が出ていれば、arbitrator が設定を読めていて配送を配り始められる状態です。ここが `false` だったり `[Config]` 行自体が出ない場合は、設定ファイルを読めていません（下の注記の `-config` で絶対パスを渡してください）。このあとに `[Motivation] Disabled (baseline behavior)` という行も出ますが、動機拡張が無効であることを示しているだけです。

> #### 🛠 Play のたびに arbitrator を再起動する（重要）
>
> Go の arbitrator はロボット台数や配送状態を**起動時に一度だけ**初期化し、Unity を停止→再生しても**状態をリセットしません**。前回セッションの「busy／割当中」を抱えたまま新しい配送を出さなくなり、**全車が `Proposed` のまま約 5 分後に `deadline_watch` で `Violated`**、という症状になります。**Play のたびに Terminal 2 の arbitrator を `Ctrl+C` で止めて再起動**してください（不安なら NATS も）。起動順は必ず **NATS → arbitrator → Unity の Play**。
>
> 設定ファイルは**絶対パスで明示**すると確実です（既定は相対パスで、起動ディレクトリに依存します）。
>
> ```bash
> cd ~/program/cadl-raspimouse-simulator/arbitrator/C-SoS/main
> go run . -config ~/program/cadl-raspimouse-simulator/unity/Assets/streamingAssets/cadl_config.json
> ```
>
> 起動直後に `[Config] … taskArbitration.enabled=true …` が表示されれば config を読めています。

### 6.2 C-SoS シーンを開く

1. Unity Hub を起動。`~/program/cadl-raspimouse-simulator/unity` を **Unity 6000.2.9f1 (Unity 6.2)** で開く。
2. 初回オープンはパッケージの取得と Library の構築で数分かかる。
3. Project ペインで `Assets/Scenes/C-SoS.unity` をダブルクリック。

**11 個のノードと 17 本のエッジ**からなる経路網（グラフ）と、その上を走る **5 体**のロボット（Red / Blue / Green / Yellow / Purple）が見えるはずです。ノード数・エッジ数・台数はいずれも `Assets/streamingAssets/cadl_config.json` から読み込まれるので、Console にも `[GraphDefinition] Loaded from CADL config: 11 nodes, 17 edges` と出ます（CADL ファイルの `context.environment` にある `grid_size: 30` は IR に引き継がれる抽象的な環境パラメータで、Unity シーンは参照しません。シーンの経路グラフは `cadl_config.json` で定義されたものです）。

![C-SoS.unity を開いた直後の Unity エディタ。Scene ビューに、番号の付いたノードを持つ経路網と 5 台のロボットが表示されている](/img/handson/unity-scene-opened.jpg)

Scene ビューで経路網が小さく見える場合は、Hierarchy で `road` を選び、マウスを Scene ビューの上に置いて `F` キーを押すと、経路網が画面いっぱいに表示されます。Play 中の **Game** ビューは 1 台のロボット（`m1`）を追いかけ、その周りの経路網を映します。右下には、そのロボット自身のカメラの映像が出ます。経路網全体を一度に見たいときは **Scene** ビューを使います。

> #### 🛠 Unity のバージョンに注意
>
> このプロジェクトは **Unity 6000.2.9f1** で保存されており（`ProjectSettings/ProjectVersion.txt` に記録）、本コースの動作確認もこのバージョンで行っています。Unity Hub からインストールしてください。プロジェクトを追加したときに対応する Editor が無ければ、Unity Hub がインストールを案内します。
>
> Unity 2022.3 以前では開かないでください。`Packages/manifest.json` には Unity 6 にしか無いパッケージが含まれています。より新しい Unity 6 で開くと初回にプロジェクトのアップグレードを求められますが、本コースでは未確認です。

### 6.3 ContractRuntimeHost を追加（シーンに 1 つだけ）

```
Hierarchy ▸ 右クリック ▸ Create Empty
名前を ContractRuntimeHost に変更
Inspector ▸ Add Component ▸ "ContractRuntimeHost" を検索 ▸ CADL.SosDsl.Demo.ContractRuntimeHost を選択
```

Inspector：

```
Contract Runtime Host (Script)
└── Logging
    └── Log To Console   ☑  （チェックを入れたまま）
```

![Hierarchy で ContractRuntimeHost を選択した Unity エディタ。Inspector に Contract Runtime Host コンポーネントが表示され、Log To Console にチェックが入っている](/img/handson/unity-contract-runtime-host.jpg)

### 6.4 各ロボットに PilotContractBridge を追加

Hierarchy 上部の検索欄に `Pilot_CSoS` と入れると、5 体のロボットだけに絞り込めます。

それぞれに対して：

```
Inspector ▸ Add Component ▸ "PilotContractBridge"   (CADL.SosDsl.Demo.PilotContractBridge)
```

Inspector に：

```
Pilot Contract Bridge (Script)
└── World keys (must match the contract's predicates)
    ├── Robot Battery       [───────●───] 90
    ├── Request Deadline Ms              300000
    └── Assigned Dwell Ms                700
```

> `Assigned Dwell Ms` は「`Assigned` 状態に最低どれだけ留まってから accept するか」です。`battery_guard` のような周期モニター（500ms 間隔）が `Assigned` 中に最低 1 回評価される猶予を作るためのもので、既定の 700ms のまま触らないでください（モニター周期より短くすると違反が検出されなくなります）。

5 体のうち 1 体の Battery スライダーを **15** まで下げ、`battery_guard` モニターを発火させます。

このときのエディタは次のようになります。ロボット `m2` を選択した状態で、Inspector の一番下に `Pilot Contract Bridge` コンポーネントが表示されています（Robot Battery は 15）。

![ロボットを選択した Unity エディタ。Inspector に Pilot Contract Bridge が表示され、Robot Battery 15、Request Deadline Ms 300000、Assigned Dwell Ms 700 になっている](/img/handson/unity-pilot-contract-bridge.jpg)

シーンを保存（`Cmd+S` / `Ctrl+S`）。

### 6.5 Play を押す

Editor 上部の ▶ をクリック。

### 表示されるもの

Console に以下のような行が連続的に出ます。Console の検索欄に `lifecycle DELIVERY_SLA` または `violation` と入れて絞り込めます。

![Play 中の Unity：Scene ビューに経路網上のロボット、Console に DELIVERY_SLA で絞り込んだライフサイクルイベント](/img/handson/unity-play-console.jpg)

このスクリーンショットは Play 開始から約 22 秒後のもので、Console の検索欄に `DELIVERY_SLA` と入力し、Scene タブを選んだ状態です。バッテリ 15 の robot-2-1 が `battery_guard` で `Violated` になり、その 5 秒後に robot-1-1 が割り当てられたところです。Play 中、host は Hierarchy の `DontDestroyOnLoad` の下に `ContractRuntimeHost` として表示されます。この画像では、シーン側の Hierarchy に手順 6.3 のオブジェクトが「New Game Object」のまま残っていますが、Inspector には名前が出ています。

同じ実行中の経路網を拡大したものです。5 台のロボットが走行しています。

![Play 中の C-SoS の経路網と 5 台のロボット](/img/handson/unity-road-network.jpg)

Play 中の Game ビューです。カメラがロボット `m1` を追いかけており、右下の小さな映像はそのロボットのカメラから見た景色です。

![Play 中の Game ビュー。カメラが経路網上のロボットを追いかけ、右下にロボット自身のカメラの映像が出ている](/img/handson/unity-game-view.jpg)

```
[lifecycle DELIVERY_SLA/robot-2-1 Proposed -> Assigned (assign, event) @ 16112ms]
[violation DELIVERY_SLA/robot-2-1 battery_guard Major monitor:battery_guard @ 16112ms]
[lifecycle DELIVERY_SLA/robot-2-1 Assigned -> Violated (<jump>, monitor) @ 16112ms]

[lifecycle DELIVERY_SLA/robot-1-1 Proposed -> Assigned (assign, event) @ 21675ms]
[lifecycle DELIVERY_SLA/robot-1-1 Assigned -> Accepted (accept, event) @ 22479ms]
[lifecycle DELIVERY_SLA/robot-1-1 Accepted -> Delivering (start_delivery, event) @ 22479ms]
[lifecycle DELIVERY_SLA/robot-1-1 Delivering -> Completed (complete, event) @ 46361ms]
```

各ロボットの契約は、そのロボット自身のイベントでだけ進みます。調停器は約 5 秒ごとに 1 件ずつ配達を割り当てるので、ロボットは順番に `Assigned` になります（この実行では約 5・11・16・22・27 秒）。`robot-1-1` の `assign` と `accept` の間が 700〜800 ms 空いているのは、6.4 で設定した `Assigned Dwell Ms` によるものです。バッテリ 15 の `robot-2-1` は、`assign` と同じフレームで `battery_guard` に検出されています。

### チェック 6

すべて確認：

| 項目 | 期待 |
| --- | --- |
| `[lifecycle ... robot-{id}-1 ...]` イベントが **5 体すべて** に出る | はい |
| Battery 15 のロボットには `monitor:battery_guard` の violation が出る | はい |
| 各ロボットの最初の遷移は `Proposed -> Assigned` | はい |
| ロボットは約 5 秒ごとに 1 台ずつ `Assigned` になる（調停器が 1 件ずつ配達を割り当てる）ので、最後の 1 台までは 25〜30 秒ほどかかる | はい |
| ロボットの契約が `Completed` になるのは、**そのロボット**が配達を終えたときで、他のロボットの契約は一緒に動かない | はい |
| Step 5 の Python と **同じ種類のイベント**（lifecycle 遷移・violation）が同じ意味で出ている | はい |

### よくある間違い

| 症状 | 対処 |
| --- | --- |
| Console: `[PilotContractBridge X] ContractRuntimeHost.Instance is null` | host を置き忘れ。Step 6.3 をやり直す。 |
| Console に contract イベントが何も出ない | NATS / arbitrator が起動していない。Terminal 1 に `Server is ready`、Terminal 2 に `[Config] … taskArbitration.enabled=true …` が出ているか確認。 |
| 配送が一切割り当てられない（`WON delivery` が出ない） | arbitrator が設定を読めていない可能性。`-config` に `cadl_config.json` の**絶対パス**を渡して起動し直し、`taskArbitration.enabled=true` の表示を確認する（同梱の config は既定で `true`）。 |
| Play 後 Console に `The name 'CADL.SosDsl.Demo.ContractRuntimeHost' could not be found` | Generated/Runtime ファイルが認識されていない。e2e スクリプトを再実行、または Unity で `Assets ▸ Reimport All`。 |
| **全車が `Proposed` のまま、約 5 分後に `deadline_watch` で `Violated`** | arbitrator が前回 Play の状態を持ち越している（落札が来ない）。Play を止め、**arbitrator を再起動**（必要なら NATS も）してから再生。**Play のたびに再起動が必要**（6.1 の注記参照）。 |
| **コンパイルエラー `... already contains a definition for ...`（パスが `Generated/Generated/…` や `Runtime/Runtime/…`）** | 生成ツリーが入れ子に二重コピーされている。`Assets/Scripts/SoSDsl/Generated/Generated` と `Runtime/Runtime` を削除（最新の e2e スクリプトは自動で掃除する）。 |
| **Battery 15 の車も違反せず `Completed` まで進む** | bridge が `assign` と `accept` を同一フレームで撃ち、`Assigned` に留まらないため periodic な `battery_guard` がサンプリングできない。同梱の `PilotContractBridge` は `assignedDwellMs`（既定 700ms）で対策済み。bridge を差し替えた場合はこの値を monitor 周期より大きく保つ。 |

### おさらい

CADL で仕様を書き、IR に変換し、C# を生成し、リアルタイムシミュレーションとして実行するところまでを通しで体験し、期限切れやバッテリ規則への違反が検出され、該当する契約インスタンスが `Violated` に移る様子を確認しました（ランタイムが行うのは違反の検出と記録であり、ロボットの逸脱そのものを防ぐわけではありません）。

---

## 演習 4.4（第 4 回より）

### 演習 4.4 (★★★) — Unity シーンを動かす

**目的**: C# ランタイムが Python と同じトレース形を出すことを検証する。

**手順**: メイン教材の Step 6 に従う。Console 出力を Python の `session4_baseline.ndjson` と比較し、イベントの形式が同じであることを確認する（終端状態の内訳まで Python 側のシナリオと一致するわけではありません）。
