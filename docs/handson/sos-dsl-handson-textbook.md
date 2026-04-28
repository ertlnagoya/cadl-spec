---
sidebar_position: 1
sidebar_label: "Hands-on Index"
title: "Hands-on Index"
---

# SoS-DSL Hands-on Textbook / SoS-DSL ハンズオン教材

> Designing a robot delivery System of Systems with **CADL** and the **SoS-DSL** extension.
> **CADL** と **SoS-DSL** 拡張で、ロボット荷物配送 System of Systems を設計します。

This handson is published as two separate textbooks — pick the language you prefer.
このハンズオンは、言語別に 2 冊の教材に分かれています。お好きな方をどうぞ。

---

## 📘 [English version](sos-dsl-handson-textbook.en.md)

A 90-minute self-paced workshop. Six 15-minute steps from CADL spec → CADL design → SoS-DSL contracts → visualisation → code generation → live Unity execution.

→ [`sos-dsl-handson-textbook.en.md`](sos-dsl-handson-textbook.en.md)

## 📗 [日本語版](sos-dsl-handson-textbook.ja.md)

90 分のワークショップ。CADL 仕様書 → CADL 設計 → SoS-DSL 契約 → 可視化 → コード生成 → Unity 実行までを、15 分 × 6 ステップで進めます。

→ [`sos-dsl-handson-textbook.ja.md`](sos-dsl-handson-textbook.ja.md)

---

## What is in both versions / 両版の共通内容

The two files have **identical structure** so you can switch between them mid-step if you want to look up an idiom in the other language. Same code blocks, same screenshots, same checks.
両ファイルは **構造が同一** で、ステップの途中でもう一方の言語を参照したい時に切り替えられます。同じコードブロック、同じスクリーンショット、同じチェックリストです。

| Section | English | 日本語 |
| --- | --- | --- |
| Why are we doing this? | ✓ | なぜこのハンズオンをやるのか ✓ |
| The big picture | ✓ | 全体像 ✓ |
| Prerequisites | ✓ | 準備するもの ✓ |
| Step 0: Setup | ✓ | セットアップ ✓ |
| Step 1: Read the CADL spec | ✓ | CADL 仕様書を読む ✓ |
| Step 2: Write CADL for Robot Delivery | ✓ | ロボット配送を CADL で書く ✓ |
| Step 3: Add SoS-DSL contracts | ✓ | SoS-DSL の契約を追加する ✓ |
| Step 4: Visualise the lifecycle | ✓ | ライフサイクルを可視化する ✓ |
| Step 5: Generate Unity C# | ✓ | Unity C# を生成する ✓ |
| Step 6: Run the simulation in Unity | ✓ | Unity でシミュレーションを動かす ✓ |
| Wrap-up & exercises & glossary | ✓ | まとめと任意課題と用語集 ✓ |

## After the workshop / ワークショップの後に

The optional exercises live in a separate booklet:
任意・発展課題は別ブックレットにまとめてあります：

- **English** → [`sos-dsl-exercises.en.md`](sos-dsl-exercises.en.md)
- **日本語** → [`sos-dsl-exercises.ja.md`](sos-dsl-exercises.ja.md)

Two parts:
2 つのパート構成です：

- **Part 1 — Extending the robot delivery service** / ロボット配送サービスの拡張演習 (5 graded exercises / 5 課題、★〜★★★)
- **Part 2 — Modelling a new SoS end-to-end** / 新しい SoS の end-to-end モデリング (proposal stage — see below / 提案中・下記参照)

## Academic background / 学術背景

For the academic positioning of CADL and the SoS-DSL extension — including the **ISO/IEC/IEEE 21839 / 21840 / 21841** standards, **Maier's five criteria and four taxonomy types**, related research lines (ADLs, Normative MAS, Runtime Verification), and an annotated bibliography — see:
CADL と SoS-DSL 拡張の学術的位置付け — **ISO/IEC/IEEE 21839 / 21840 / 21841** 規格、**Maier の 5 条件と 4 類型**、関連研究領域（ADL・規範的 MAS・実行時検証）、注釈付き参考文献 — は以下を参照：

- **English** → [`sos-academic-background.en.md`](sos-academic-background.en.md)
- **日本語** → [`sos-academic-background.ja.md`](sos-academic-background.ja.md)

## For instructors / 教員向け

A complete PBL (Project-Based Learning) course design document covering 5 sessions with academic significance, learning objectives, common student pitfalls, research connections, and extension topics:
5 回のセッション設計、学術的意義、学びの観点、よくあるつまずき、研究との接続、発展テーマを網羅した PBL コース設計書：

- **English** → [`sos-dsl-pbl-course-design.en.md`](sos-dsl-pbl-course-design.en.md)
- **日本語** → [`sos-dsl-pbl-course-design.ja.md`](sos-dsl-pbl-course-design.ja.md)

## Quick start / クイックスタート

If you only have a terminal and want to see something work in 60 seconds:
ターミナルだけで 60 秒で何かが動くことを確認したいなら：

```bash
cd ~/program/cadl_repo
./scripts/sos_dsl_handson_e2e.sh
```

This runs the end-to-end pipeline (parse → IR → codegen) on the bundled `examples/sos_dsl_robot_delivery.cadl` and tells you what to do next.
これで同梱の `examples/sos_dsl_robot_delivery.cadl` に対する end-to-end パイプライン（parse → IR → codegen）が走り、次にやるべきことを案内してくれます。
