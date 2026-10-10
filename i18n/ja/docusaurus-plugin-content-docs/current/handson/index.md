---
sidebar_position: 1
sidebar_label: "ハンズオン入口"
title: "ハンズオン入口"
---

# ハンズオン入口

CADL と SoS-DSL のハンズオン教材は、目的別に 2 つのトラックに分かれています。
自分に合うトラックから始めてください。

| 読み手 | やること | 入口 |
|---|---|---|
| 🧑‍🎓 学習者 | 自分で CADL を書いて動かす | [なぜ SoS-DSL なのか？](academic-background.md) → [コード解説](code-walkthrough.md)（コース A の前に読むのを推奨） → [コース A](main-textbook.md) → B → C |
| 🧑‍🔬 研究者 | 教材を自分の SoS の試作に流用する | [なぜ SoS-DSL なのか？](academic-background.md)を流し読み → [コース C](exercises.md#course-c) |

:::info[リポジトリの公開状況]
`cadl-spec`（本仕様・ハンズオンサイト）、`cadl`（コンパイラ / CLI）、`cadl-explorer`（可視化）、`cadl-raspimouse-simulator`（シミュレータ）は公開しています。コース A はすべての Step を公開リポジトリだけで進められます。コース B で使う `mobility-sos-exercise` は**現時点では非公開**です。
:::

## 🗺️ 初めての人へ：3 段階の進め方

初めて触る場合は、次の 3 段階で進むのがおすすめです。**理解 → 雛形で練習 → ゼロから作る**の順で、いきなりコードを書かされることはありません。

| 段階 | 何をするか | 使う教材 | 目安 |
|---|---|---|---|
| **① 理解する** | 全体の構造（4 リポジトリ・仕様→IR→コード生成の流れ）と主要プログラムの役割を把握する | [なぜ SoS-DSL なのか？](academic-background.md)（流し読み可） → [全体構造とコード解説](code-walkthrough.md)（コース A の前に読むのを推奨） | 0.5〜1 日 |
| **② 雛形で練習する** | 用意された骨組みをコピーして埋めながら、契約の記述 → 検査 → 可視化 → シミュレーション実行を一周する | [コース A（メイン教材）](main-textbook.md) Step 0〜6 → [演習問題集](exercises.md) Part 1 の ★・★★ 課題 | 1〜2 週間 |
| **③ ゼロから作る** | 雛形なしで機能を追加する：新しい監視・状態の追加（★★★）、別ドメインのモデリング（Part 2）、LLM による契約生成ループ（発展課題） | [演習問題集](exercises.md) の ★★★・発展課題・Part 2 | 興味に応じて |

---

## 🧑‍🎓 学習者向けの 3 コース

3 コースは同じ CADL/SoS-DSL の文法を共有し、扱う題材とランタイムだけが異なります。
A → B → C の順に進めると、最後は自分のドメインに CADL を当てはめられるところまで到達します。

### 始める前に：なぜ SoS-DSL なのか？

SoS とはどういうもので、なぜ普通のプログラミング言語では書きにくく、CADL は何を補うのか。
A〜C で前提となる用語をひと通り出しておく短い導入です。
コース A の前に読んでおくと、後の章を読み進めやすくなります。

→ [なぜ SoS-DSL なのか？](academic-background.md)

### コース A — ロボット配送（基礎）

| 項目 | 内容 |
|---|---|
| 題材 | 倉庫内のロボット配送 |
| ターゲット | Unity C# |
| 所要時間 | 約 95 分（5 分のセットアップ + 15 分 × 6 ステップ）|
| 前提 | なし。CADL に初めて触れる人向け |
| 学べること | actors / contracts / lifecycle / monitors の基本、cadl-explorer による可視化、Unity 連携 |

→ [コース A — ロボット配送](main-textbook.md)

終わったら、同じ題材の練習問題：
→ [コース A — 演習問題集](exercises.md)（全 5 回・計 19 課題、難易度 ★〜★★★。演習問題集の Part 1）

### コース B — 都市モビリティ（応用）

| 項目 | 内容 |
|---|---|
| 題材 | タクシー配車の System of Systems |
| ターゲット | SUMO（交通シミュレータ）|
| 所要時間 | 60〜90 分（5 つの可視化チェックポイント付き）|
| 前提 | コース A |
| 学べること | 別ランタイムへのコード生成、契約の `guarantee` 節に対するシミュレーション結果の判定（deadline と monitor は一覧に出るが、SUMO 上では評価されない）、感度解析（CADL を書き換えて再評価する） |

→ [コース B — 都市モビリティ](mobility-sos-tutorial.md)

> コース A との対比がポイントです。文法を変えずに題材とコード生成のターゲットだけを差し替えたとき、何が同じで何が違うのかを体感する内容です。

### コース C — 自分の SoS をモデル化（発展）

| 項目 | 内容 |
|---|---|
| 題材 | 受講者が選ぶ任意のドメイン（食事配達、緊急対応、電力グリッドなど）|
| ターゲット | 任意。標準の選択肢は SimPy のような軽量な Python の離散事象ハーネスで、Unity は不要 |
| 所要時間 | 数時間〜数週間（自走型のミニプロジェクト相当）|
| 前提 | コース A + B |
| 学べること | 新しいドメインに対して actors / contracts / lifecycle / monitors を自力で設計し、ランタイムも自分で選ぶ |

コース C は意図的に自由度を高くしてあり、課題は手順書ではなく概要として示しています。演習問題集の Part 2 がこれに当たります：
→ [演習問題集 — Part 2（コース C）](exercises.md#course-c)

---

## 🚀 60 秒で動かしてみる（任意）

ターミナルだけで「とにかく動くもの」を見たい場合：

```bash
cd ~/program/cadl_repo
./scripts/sos_dsl_handson_e2e.sh
```

[コース A](main-textbook.md) の Step 0 のセットアップ（`cadl` リポジトリを `~/program/cadl_repo` としてクローン）が済んでいることが前提です。
スクリプトは同梱の `examples/sos_dsl_robot_delivery.cadl` に対して parse → IR → codegen を一気に通し、続きの案内を出します。
最後の段階では、生成した C# を `cadl-raspimouse-simulator`（`cadl_repo` の隣にある想定）の Unity プロジェクトにコピーします。まだクローンしていない場合は、代わりに `./scripts/sos_dsl_handson_e2e.sh --unity ""` を実行してください。コード生成までで終了します。
このあとは [なぜ SoS-DSL なのか？](academic-background.md) → [コース A](main-textbook.md) の順で本編に入るのが自然です。

---

## 教材一覧

| 役割 | リンク |
|---|---|
| 学習者の最初の一冊 | [なぜ SoS-DSL なのか？](academic-background.md) |
| コース A — メイン教材 | [ロボット配送](main-textbook.md) |
| コース A — 演習問題集 | [演習問題集](exercises.md) |
| コース B — モビリティ | [都市モビリティ](mobility-sos-tutorial.md) |
| コース C — 自分の SoS | [演習問題集 Part 2](exercises.md#course-c) |
