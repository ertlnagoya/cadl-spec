---
sidebar_position: 3
sidebar_label: "第 3 章 — CADL 言語の要点"
title: "第 3 章 — CADL 言語の要点"
---

# 第 3 章 — CADL 言語の要点

## Step 1 — CADL 仕様書を読む (15 分)

### 学ぶこと
- 仕様書のどこに **構造の層**（actors / contracts / protocols）が書かれているか。
- 仕様書のどこに **規範の層**（Appendix E の lifecycle / monitors）があるか。

### 背景

SoS の文脈では、仕様言語が果たすべき仕事は 2 つあります。

1. **記述的（descriptive）** — *何が存在するか*。アクター、接続、交換するメッセージ。
2. **規範的（normative）** — *何が起こるべきか*。義務、期限、違反。

CADL は (1) を本体文法（Appendix A）でカバーします。SoS-DSL 拡張（[Appendix E](../spec/appendix-e-sos-dsl.md)）は (1) の上に (2) を加えます — 同じ構文ファミリーで、新しい body キーは `lifecycle:` と `monitors:` の 2 つだけです。

### 手順

```bash
cd ~/program/cadl-spec
npm install
npm run start
# ブラウザで http://localhost:3000/cadl-spec/ が開く
```

15 分に収まるよう、下表の目安時間に沿って順に読んでいきます。

| 章 | 答えてくれる問い | 時間 |
| --- | --- | --- |
| 1. Introduction | CADL は何のため？ | 2 分 |
| 5. Language Specification | actors / contracts / protocols はどう書く？ | 5 分 |
| **[Appendix E](../spec/appendix-e-sos-dsl.md)（今日のメイン）** | **契約のライフサイクルと監視はどう書く？** | **6 分** |
| 7. Examples | 完全なファイルはどう見える？ | 2 分 |

### 期待される出力

[Appendix E](../spec/appendix-e-sos-dsl.md) の E.6 節に、ロボット配送の例が載っています。以下はその抜粋（遷移 1 つとモニター 1 つに絞った短縮版）です。よく読んでください。Step 3 で同じようなものを書いてもらいます。

```yaml
contracts:
  - id: DELIVERY_SLA
    parties: [DISPATCHER, "ROBOT[*]", "CUSTOMER[*]"]
    assume:
      - "ROBOT[i].battery > 20"
    guarantee:
      - "delivery_time <= 300s"

    lifecycle:
      states: [Proposed, Assigned, Accepted, Delivering, Completed, Violated, Terminated]
      initial: Proposed
      terminal: [Completed, Violated, Terminated]
      transitions:
        - id: accept
          from: Assigned
          to:   Accepted
          on:   "ROBOT[i] -> DISPATCHER : ack(accepted)"
          deadline: 5s
          on_violation:
            transition: Violated
            severity:   Major

    monitors:
      - id: battery_guard
        observe: "ROBOT[i].battery"
        sampling: periodic(500ms)
        rule: "ROBOT[i].battery < 20 AND state == Assigned"
        on_match:
          transition: Violated
          severity:   Major
```

### チェック 1

スクロールせずに、次の 3 問に口頭で答えられますか？

1. 配送契約の **初期状態** は何？ → *Proposed*
2. ロボットが **5 秒** 以内に ack を返さなかったら何が起こる？ → *severity `Major` の違反として `Violated` へ強制的に遷移する*
3. バッテリ 20% 未満で **まだ Assigned のとき** どの監視が発火する？ → *`battery_guard`*

全部答えられたら、書き始めるのに十分な理解ができています。

### おさらい

仕様書を読み終えると、SoS の仕様が「**構造の層**（何が存在するか）」と「**規範の層**（何を守るべきか）」の二階建てで、それぞれどこに書かれているかが分かります。配送契約なら、初期状態は `Proposed`、ack が 5 秒で返らなければ `Major` で `Violated` に飛び、Assigned 中にバッテリが下がれば `battery_guard` が見張る——この“地図”を持って Step 2 の執筆に入れます。
