---
sidebar_position: 2
sidebar_label: "なぜ SoS-DSL なのか？"
title: "なぜ SoS-DSL なのか？ — 学習者のための背景"
---

# なぜ SoS-DSL なのか？ — 学習者のための背景

各コースに入る前に「そもそも何のための教材なのか」を共有しておきます。
コース A〜C で前提となる用語（actors / contracts / lifecycle / monitors / SoS の 4 類型）は、ここでまとめて紹介します。

このページで扱うのは次の 3 つです。

- System of Systems (SoS) とは何か、を生活感のある言葉で。
- なぜ普通のプログラミング言語では SoS のルールを書きにくいのか。
- そこに CADL/SoS-DSL は何を補うのか。

§5 以降は学術的な参照用なので、最初の通読では飛ばしてかまいません。

---

## 1. SoS は「複数のシステムが寄り集まって出来上がる、もう一段大きいシステム」

身近な例から入りましょう。

### 食事配達アプリの場合

| 主体 | やること | 誰が動かしている？ |
|---|---|---|
| レストラン | 料理を作って渡す | 自分の店。営業時間も価格も自分で決める |
| 配達員（ギグワーカー） | 自転車・バイクで運ぶ | 自分自身。働く時間帯も自分で決める |
| プラットフォーム（アプリ） | 注文と配達員をマッチング | アプリ会社。レストランも配達員も雇っているわけではない |
| 顧客 | 注文する／払う | 自分自身 |

「30 分以内に料理が届く」という全体としての挙動は、誰か一人が設計して実現しているわけではありません。
独立した主体がそれぞれ自分の都合で動いた結果として、たまたまそうなっています。

これが **System of Systems (SoS)** で、独立に動くシステムが寄り集まって、より大きな仕組みを成している状態のことです。

### Maier の 5 条件

学術的には Maier (1998) の 5 条件で「これは SoS と呼べるか」を判定します。
最低でも (1) と (2) は満たす必要があります。

| # | 条件 | 食事配達ではどう成立するか |
|---|---|---|
| 1 | 構成要素の運用上の独立性 | レストランは配達アプリが無くても店として営業できる |
| 2 | 構成要素の管理上の独立性 | 配達員はギグワーカーで、アプリ会社の社員ではない |
| 3 | 地理的分散 | レストラン・配達員・顧客はそれぞれ別の場所にいる |
| 4 | 創発的振る舞い | 「30 分配達」は誰も明示的に設計していない、集団としての性質 |
| 5 | 進化的発展 | 参加店も配達員も日々入れ替わる |

身近なものを当てはめてみると、線引きが見えてきます。

- コーヒーショップは、スタッフが同じ店で働きオーナーが全員を管理しているので **SoS ではない**。
- ロボット配送（コース A の題材）は、個々のロボットが独立に動くものの所有者は一つ。教科書的な SoS というより並行制御問題に近い。とはいえ「contract で振る舞いを規約化する」練習題材としては手頃。
- 大手の配車プラットフォーム（コース B のタクシー配車もこの形）は、ドライバー自身は独立して働くが、配車・料金・規約はプラットフォームが指揮するので、SoS としては Acknowledged 型に位置付けられる。
- 食事配達も実体は近いが、ここでは「強い中央権限がない peer-to-peer 的な合意」という対比例として Collaborative 寄りに置いて読むことにする。同じ題材でも、モデリングする側の関心（プラットフォームの指揮権に注目するか、参加者の自発的協力に注目するか）で類型は変わる、という点も押さえてほしい。
- 大規模災害の発生直後、各避難所が個別に立ち上がり、まだ連絡網も指揮系統も成立していない時期 ── これが Virtual SoS のわかりやすい例。
  日常運用の消防・救急・警察はすでに合同指揮系統や相互応援協定があるので、同じ「別組織の連携」でも Collaborative〜Acknowledged 寄りになる点に注意。

> SoS の類型は固定ではなく、時間とともに移ることが珍しくありません。
> 災害初期は Virtual に始まり、自治体の災害対策本部が動き始めると Collaborative になり、指揮権限が法的に定まれば Acknowledged に近づく、というように段階的に育ちます。

### 4 類型 — 中央の指揮権の強さで分かれる

同じ SoS と呼ばれていても、中央の指揮権の強さで性質が変わります。

| 類型 | 中央の指揮権 | 例 |
|---|---|---|
| Directed（指令型） | 強いトップダウンで集中管理 | 防空ネットワーク |
| Acknowledged（認知型） | SoS 全体の指揮権が定まっていて、各構成システムは所有権を保つ | 国際宇宙ミッション、コース A のロボット配送、コース B のタクシー配車 |
| Collaborative（協調型） | 単一の指揮権はなく、共通の取り決め（プロトコル・規約）を介して自発的に協力 | インターネット、食事配達のような peer-to-peer 寄りの合意 |
| Virtual（仮想型） | 中央管理も合意された目的もなく、調整は自然発生的に成立 | World Wide Web、災害発生直後の避難所群（指揮系統が立ち上がる前） |

コース A と B はどちらも Acknowledged で、ドメインだけ差し替わります。
コース C ではここから一歩進み、自分で題材を選んで類型を判定するところから始めます。

---

## 2. なぜ普通のプログラミング言語では足りないのか？

SoS は独立した主体の集まりだ、というところまで来ました。
これを普通の C++ や Python で書こうとすると、次のような場面で詰まります。

| 書きたいこと | 普通の言語での書き方 | 残る問題 |
|---|---|---|
| タクシーは 5 秒以内に応答する義務がある | コメントで書くか、口頭での合意 | コードと別の場所に書かれるので、いずれ食い違う |
| もし 5 秒過ぎたら違反扱いにする | if 文をどこかに書く | どの 5 秒の話か（送信時刻？受信時刻？）が文脈依存 |
| 配達員はバッテリー 20 % 以下では新規受注しない | 各実装に if 文を書く | 同じルールが何百ヶ所にも散らばる |
| 同じルールを Unity と SUMO の両方で守らせたい | 言語ごとに別実装 | どちらかが古くなる |

要するに、「主体は独立に動く」と「全体としては一定のルールを守らせたい」を両立させる書き方を、普通の言語は素直には用意していません。

---

## 3. CADL は何を補うのか？

CADL（Contract Architecture Description Language）は、複数のシステムが守るべき決まりごとを、実装コードとは別に、一つのファイルにまとめて書くためのアーキテクチャ記述言語です。

| CADL の概念 | 何を書くか | 食事配達での例 |
|---|---|---|
| `actors:` | 関わる主体（自律性レベル付き） | `RESTAURANT[*]`, `COURIER[1..N]`, `PLATFORM` |
| `contracts:` | 主体間の合意 | `DELIVERY_SLA` |
| `lifecycle:` | 1 件の合意がたどる状態機械 | `Placed → Accepted → InTransit → Delivered` |
| `monitors:` | 周期的に観測する制約 | バッテリー残量 / 食品温度 / 配達遅延 |

これらが一つの YAML ファイルにまとまっているのが CADL の中核です。
ここから次の 3 つが派生します。

- 可視化（cadl-explorer）：状態機械の図がブラウザに表示される
- コード生成（`cadl codegen` や変換スクリプト）：Unity C# / SUMO 設定 / Python ランタイムなどへ自動変換
- 判定（analyze_results）：シミュレーション結果が契約に違反していないかチェック

どれも同じ CADL ソースから派生するので、契約を書く場所は一箇所で済みます。

### SoS-DSL 拡張とは？

`lifecycle:` と `monitors:` は CADL 本体ではなく、SoS-DSL 拡張（cadl-spec Appendix E）にあります。
拡張になっているのは、これらが「規範（守るべきルール）」を一級の概念として扱うパーツで、構造（actors / contracts のスケルトン）だけを書きたい場合は本体だけで十分だからです。

各コースの §3 で `lifecycle:` と `monitors:` を扱い始めた時点で、SoS-DSL を実際に使っていることになります。

---

## 4. このあとの読み進め方

おすすめは次の順です。

1. コース A（ロボット配送）— 最小の題材で actors → contracts → lifecycle → monitors → コード生成 → 実行 を約 95 分で一周。
2. コース B（都市モビリティ）— 同じ CADL のまま、題材とランタイムを差し替えた経験を積む。
3. コース C（自分の SoS）— 食事配達 / 緊急対応 / 電力グリッドなど、自分のドメインに応用する。

このページの内容（5 条件、4 類型、CADL の役割）はどのコースでも前提として戻ってきます。
分からなくなったら、ここに戻ってきて確認してください。

---

## 5. もっと知りたい人のために（参照用・読み飛ばし可）

ここから先は、レポート・修論・論文の参照用です。
学習を進めるだけなら飛ばしても支障ありません。

### 5.1 ISO 標準のランドスケープ

CADL/SoS-DSL は、ISO 標準が定義する SoS 工学プロセスを記法として具体化したもの、と捉えると整理しやすいです。標準そのものは表記法を規定していないので、その空白を埋めている格好です。

| 標準 | 役割 | CADL との関係 |
|---|---|---|
| ISO/IEC/IEEE 15288:2023 | システムライフサイクル全般のプロセス標準 | CADL 自体を 15288 に沿って開発している |
| ISO/IEC/IEEE 21839:2019 | 構成システム側から見た SoS の留意点 | `monitors:` が「観測義務」、`lifecycle:` が「遵守義務」に対応 |
| ISO/IEC/IEEE 21840:2019 | 15288 を SoS 文脈で使うガイドライン | CADL を書く SoS エンジニアの作業がここに対応 |
| ISO/IEC/IEEE 21841:2019 | SoS の分類（4 類型） | このページの 4 類型表の出典 |
| ISO/IEC/IEEE 42010:2022 | アーキテクチャ記述（AD）の構造定義 | CADL は 42010 の意味での AD 言語 |

### 5.2 関連する 3 つの研究伝統

CADL は次の 3 系統が交差する位置にあります。

- アーキテクチャ記述言語 (ADL) — ACME, AADL, Wright など。CADL の `actors:` `protocols:` が古典的 ADL の流れ（Medvidovic & Taylor 2000）。
- 規範的マルチエージェントシステム (Normative MAS) — 義務・許可・禁止を一級の概念として扱う研究系統（Boella et al. 2006）。CADL の `obligations:` 系がここに対応。
- 実行時検証 (Runtime Verification) — 動作中システムを形式仕様に対して観測・違反検出する技術（Bartocci et al. 2018）。CADL の `monitors:` がここに対応。

### 5.3 ブロックチェーン DSL との違い

Ethereum（Buterin 2014）のスマートコントラクト言語 Solidity は「契約をコードとして書く」という意味で先行例ですが、契約 = 実行コードなのでブロックチェーン上で動かす前提と切り離せません。
CADL は仕様レベルに留まり、コードはターゲットごとに生成するので、Unity でも SUMO でも Python でも、同じ仕様を共通の出典として扱えます。

### 5.4 注釈付き参考文献

#### A. SoS の基礎文献

- Maier, M.W. (1998). *Architecting Principles for Systems-of-Systems*. Systems Engineering, 1(4), 267–284. — 5 条件と 4 類型の出典。必読。
- Sage, A.P., Cuppan, C.D. (2001). *On the Systems Engineering and Management of Systems of Systems*.
- Boardman, J., Sauser, B. (2006). *System of Systems — the meaning of "of"*. — Maier の代替の ABCDE フレームワーク。
- Dahmann, J. (2014). *Systems of Systems Pain Points*. — 7 つの SoS pain points。
- Madni, A.M., Sievers, M. (2014). *System of Systems Integration: Key Considerations and Challenges*.

#### B. ISO 標準

- ISO/IEC/IEEE 21839:2019. *Systems and software engineering — System of Systems (SoS) considerations in life cycle stages of a system*.
- ISO/IEC/IEEE 21840:2019. *Guidelines for the utilization of ISO/IEC/IEEE 15288 in the context of System of Systems*.
- ISO/IEC/IEEE 21841:2019. *Taxonomy of Systems of Systems*.
- ISO/IEC/IEEE 15288:2023. *System life cycle processes*.
- ISO/IEC/IEEE 42010:2022. *Architecture description*.

#### C. アーキテクチャ記述言語

- Medvidovic, N., Taylor, R.N. (2000). *A Classification and Comparison Framework for Software Architecture Description Languages*.
- Garlan, D., Schmerl, B. (2009). *Architecture-Driven Modelling and Analysis*.

#### D. 規範的マルチエージェントシステム

- Boella, G., van der Torre, L., Verhagen, H. (2006). *Introduction to Normative Multiagent Systems*.
- Andrighetto, G. et al. (Eds.) (2013). *Normative Multi-Agent Systems*. Dagstuhl Follow-Ups Vol. 4.
- Boella, G., van der Torre, L. (2008). *Substantive and procedural norms in normative multiagent systems*.

#### E. 実行時検証

- Bartocci, E., Falcone, Y., Francalanza, A., Reger, G. (2018). *Introduction to Runtime Verification*.
- Havelund, K., Goldberg, A. (2008). *Verify Your Runs*. In VSTTE 2005, LNCS 4171, pp. 374–383, Springer. — 発表は VSTTE 2005、論文集は 2008 年刊。

#### F. ブロックチェーン DSL（比較対象）

- Buterin, V. (2014). *Ethereum White Paper: A Next-Generation Smart Contract and Decentralized Application Platform*. — 本文 5.3 で触れた Ethereum / Solidity の出典。
- Atzei, N., Bartoletti, M., Cimoli, T. (2017). *A Survey of Attacks on Ethereum Smart Contracts (SoK)*. — 「仕様 = コード」が危ういとされる理由。

#### G. シミュレーション関連（コース B / C で参照）

- Banks, J. et al. (2014). *Discrete-Event System Simulation* (5th ed.). — シミュレーション方法論の標準教科書。
- Matloff, N. (2008). *Introduction to Discrete-Event Simulation and the SimPy Language*. — Web で公開されている SimPy 入門。

#### H. SoS 固有のシミュレーション事例

- Sahin, F. et al. (2007). *System of Systems Approach to Threat Detection and Integration of Heterogeneous Independently Operable Systems*. — 緊急対応 SoS の形式アーキテクチャ。
- Acheson, P., Dagli, C.H., Kilicay-Ergin, N. (2013). *Model based systems engineering for system of systems using agent-based modeling*.

---

## 次に読むもの

- [コース A — ロボット配送](main-textbook.md) から本編へ
- [ハンズオン入口](index.md) に戻る
