---
sidebar_position: 2
sidebar_label: "なぜ SoS-DSL なのか？"
title: "なぜ SoS-DSL なのか？ — 学習者のための背景"
---

# なぜ SoS-DSL なのか？ — 学習者のための背景

各コースに入る前に、この教材が何のためのものかを説明します。
コース A〜D で前提となる用語（actors / contracts / lifecycle / monitors / SoS の 4 類型）は、ここでまとめて紹介します。

このページで扱うのは次の 3 つです。

- System of Systems (SoS) とは何か（身近な例で説明します）
- なぜ普通のプログラミング言語では SoS のルールを書きにくいのか
- CADL/SoS-DSL は何を補うのか

§5 以降は学術的な参照用なので、最初の通読では飛ばしてかまいません。

---

## 1. SoS とは何か

身近な例から始めます。

### 食事配達アプリの場合

| 主体 | やること | 誰が動かしている？ |
|---|---|---|
| レストラン | 料理を作って渡す | 自分の店。営業時間も価格も自分で決める |
| 配達員（ギグワーカー） | 自転車・バイクで運ぶ | 自分自身。働く時間帯も自分で決める |
| プラットフォーム（アプリ） | 注文と配達員をマッチング | アプリ会社。レストランも配達員も雇っているわけではない |
| 顧客 | 注文する／払う | 自分自身 |

「30 分以内に料理が届く」という全体としての挙動は、誰か一人が設計して実現しているわけではありません。
独立した主体がそれぞれ自分の都合で動いた結果として成り立っています。

独立に動くシステムが集まって、より大きな仕組みを成しているこの状態を **System of Systems (SoS)** と呼びます。

### Maier の 5 条件

ある対象を SoS と呼べるかどうかは、Maier (1998) の 5 条件で判定します。
最低でも (1) と (2) は満たす必要があります。

| # | 条件 | 食事配達ではどう成立するか |
|---|---|---|
| 1 | 構成要素の運用上の独立性 | レストランは配達アプリが無くても店として営業できる |
| 2 | 構成要素の管理上の独立性 | 配達員はギグワーカーで、アプリ会社の社員ではない |
| 3 | 地理的分散 | レストラン・配達員・顧客はそれぞれ別の場所にいる |
| 4 | 創発的振る舞い | 「30 分配達」は誰も明示的に設計していない、集団としての性質 |
| 5 | 進化的発展 | 参加店も配達員も日々入れ替わる |

身近なものに当てはめると、次のようになります。

- コーヒーショップは、スタッフが同じ店で働きオーナーが全員を管理しているので、SoS ではありません。
- ロボット配送（コース A の題材）は、個々のロボットは独立に動くものの、シミュレーション上のシナリオでは 1 つの運用者が全台を所有しているので、管理上の独立性は弱くなります。典型的な SoS というより、複数のロボットを並行して制御する問題に近い題材です。それでも、契約でロボットの振る舞いを決める練習の題材としては扱いやすい大きさです。CADL ファイルで `type: Acknowledged` と宣言しているのは、各ロボットを、自前の制御ソフトウェアと自律性を保ちつつ、タスク割当についてはディスパッチャを SoS レベルの権威として認める構成システムとしてモデル化しているためです。
- 大手の配車プラットフォーム（コース B のタクシー配車もこの形）は、ドライバー自身は独立して働くが、配車・料金・規約はプラットフォームが指揮するので、Acknowledged 型に当たります。
- 食事配達も実態は配車プラットフォームに近いのですが、このページでは、強い中央権限がなく参加者どうしの合意で成り立つ例として、Collaborative に近いものとして扱います。同じ題材でも、モデル化する側の関心（プラットフォームの指揮権に注目するか、参加者の自発的な協力に注目するか）によって類型は変わります。
- 大規模災害の発生直後、各避難所が個別に立ち上がり、まだ連絡網も指揮系統も成立していない時期の避難所の集まりは、Virtual SoS の例です。
  日常の消防・救急・警察にはすでに合同の指揮系統や相互応援協定があるので、同じく別組織の連携であっても Collaborative から Acknowledged に近くなります。

> SoS の類型は、時間とともに移ることが珍しくありません。
> 災害の直後は Virtual に始まり、自治体の災害対策本部が動き始めると Collaborative になり、指揮権限が法的に定まれば Acknowledged に近づく、というように変わっていきます。

### 4 類型 — 中央の指揮権の強さで分かれる

同じ SoS でも、中央の指揮権の強さによって性質が変わります。

| 類型 | 中央の指揮権 | 例 |
|---|---|---|
| Directed（統率型） | 強いトップダウンで集中管理 | 防空ネットワーク |
| Acknowledged（認知型） | SoS 全体の指揮権が定まっていて、各構成システムは所有権を保つ | 国際宇宙ミッション、コース A のロボット配送（CADL ファイル上のモデル化として。上の説明を参照）、コース B のタクシー配車 |
| Collaborative（協調型） | 単一の指揮権はなく、共通の取り決め（プロトコル・規約）を介して自発的に協力 | インターネット、食事配達のような peer-to-peer 寄りの合意、コース D のロボットの街（3 社が街の規則を取り決める） |
| Virtual（仮想型） | 中央管理も合意された目的もなく、調整は自然発生的に成立 | World Wide Web、災害発生直後の避難所群（指揮系統が立ち上がる前） |

コース A と B はどちらも `type: Acknowledged` と宣言しており、違うのはドメインだけです。コース D の街は `type: Collaborative` です。
コース C は、自分で題材を選び、その類型を判定するところから始めます。

---

## 2. なぜ普通のプログラミング言語では足りないのか？

独立した主体の集まりである SoS の規則を、C++ や Python といった普通のプログラミング言語だけで書こうとすると、次のような場面で困ります。

| 書きたいこと | 普通の言語での書き方 | 残る問題 |
|---|---|---|
| タクシーは 5 秒以内に応答する義務がある | コメントで書くか、口頭での合意 | コードと別の場所に書かれるので、いずれ食い違う |
| もし 5 秒過ぎたら違反扱いにする | if 文をどこかに書く | どの 5 秒の話か（送信時刻？受信時刻？）が文脈依存 |
| 配達員は車両のバッテリーが 20 % 未満のときは新規受注しない | 各実装に if 文を書く | 同じルールが何百ヶ所にも散らばる |
| 同じルールを Unity と SUMO の両方のランタイムで検査したい | 言語ごとに別実装 | どちらかが古くなる |

主体は独立に動き、それでも全体としては一定のルールを守らせたい、という 2 つを両立させる書き方を、普通の言語は用意していません。

---

## 3. CADL は何を補うのか？

CADL（Contract Architecture Description Language）は、複数のシステムが守るべき決まりごとを、実装コードとは別に、一つのファイルにまとめて書くためのアーキテクチャ記述言語です。

| CADL の概念 | 何を書くか | 食事配達での例 |
|---|---|---|
| `actors:` | 関わる主体（自律性レベル付き） | `RESTAURANT[*]`, `COURIER[1..N]`, `PLATFORM` |
| `contracts:` | 主体間の合意 | `DELIVERY_SLA` |
| `lifecycle:` | 1 件の合意がたどる状態機械 | `Placed → Accepted → InTransit → Delivered` |
| `monitors:` | 周期的に観測する制約 | バッテリー残量 / 食品温度 / 配達遅延 |

CADL では、これらを一つの YAML ファイルにまとめて書きます。
このファイルから、次の 3 つを行います。

- 可視化（cadl-explorer）：状態機械の図がブラウザに表示される
- コード生成（`cadl codegen` や変換スクリプト）：Unity C# や SUMO 設定などへ変換（コース A で使う Python 参照ランタイムは IR を直接解釈、実行するもので、生成物ではありません）
- 結果の判定（コース B の `analyze_results.py` スクリプト）：シミュレーション結果を契約の `guarantee` 節に照らしてチェック

どれも同じ CADL ファイルをもとにするので、契約を書く場所は一箇所で済みます。

### SoS-DSL 拡張とは？

`lifecycle:` と `monitors:` は、CADL 本体にはなく、SoS-DSL 拡張（cadl-spec [Appendix E](../spec/appendix-e-sos-dsl.md)）が加えるキーです。
この 2 つは規範（守るべきルール）を一級の概念として扱う部分です。構造（actors と contracts の骨格）だけを書きたい場合は本体だけで足りるので、拡張として分けています。

テキストブック（コース A）の第 5 章で `lifecycle:` と `monitors:` を書き足した時点（コース B では §3 でそれらを読んだ時点）で、SoS-DSL を実際に使っていることになります。

---

## 4. このあとの読み進め方

コースを進める順番は、[ハンズオン入口](index.md)にまとめています。まずコース A の[テキストブック](../textbook/index.md)から始めてください。テキストブックの第 1 章でも、このページの SoS の基本を説明しています。

このページの内容（5 条件、4 類型、CADL の役割）は、どのコースでも前提として使います。
分からなくなったら、このページに戻って確認してください。

---

## 5. もっと知りたい人のために（参照用・読み飛ばし可）

ここから先は、レポート・修論・論文の参照用です。
学習を進めるだけなら飛ばしても支障ありません。

### 5.1 SoS に関する ISO 標準

ISO 標準は SoS 工学のプロセスを定義していますが、表記法は規定していません。CADL/SoS-DSL は、そのプロセスで決めることを書くための記法に当たります。

| 標準 | 役割 | CADL との関係 |
|---|---|---|
| ISO/IEC/IEEE 15288:2023 | システムライフサイクル全般のプロセス標準 | CADL 自体の開発も 15288 の考え方を意識して進めている（規格への適合を主張するものではない） |
| ISO/IEC/IEEE 21839:2019 | 構成システム側から見た SoS の留意点 | 著者らの解釈（規格自体がこの用語を使っているわけではない）：`monitors:` は構成システムが SoS に観測させるべき事項を、`lifecycle:` は遵守すべき事項を書いたものに当たる |
| ISO/IEC/IEEE 21840:2019 | 15288 を SoS 文脈で使うガイドライン | CADL を書く SoS エンジニアの作業がここに対応 |
| ISO/IEC/IEEE 21841:2019 | SoS の分類（4 類型） | このページの 4 類型表の出典 |
| ISO/IEC/IEEE 42010:2022 | アーキテクチャ記述（AD）の構造定義 | CADL は 42010 の意味でのアーキテクチャ記述言語を意図している（規格への適合性は評価していない） |

### 5.2 関連する 3 つの研究領域

CADL は次の 3 つの研究領域に関係します。

- アーキテクチャ記述言語 (ADL)：ACME、AADL、Wright など。CADL の `actors:` と `protocols:` は、古典的な ADL（Medvidovic & Taylor 2000）を引き継いでいます。
- 規範的マルチエージェントシステム (Normative MAS)：義務・許可・禁止を一級の概念として扱う研究領域（Boella et al. 2006）。CADL の `responsibilities:` と、SoS-DSL の `on_violation:` が対応します。
- 実行時検証 (Runtime Verification)：動作中のシステムを形式仕様に照らして観測し、違反を検出する技術（Bartocci et al. 2018）。CADL の `monitors:` が対応します。

### 5.3 ブロックチェーン DSL との違い

Ethereum（Buterin 2014）のスマートコントラクト言語 Solidity は、契約をコードとして書く言語の先行例です。ただし、Solidity では契約がそのまま実行コードなので、ブロックチェーン上で動かすことが前提になります。
CADL が書くのは仕様で、コードはターゲットごとに生成します。そのため、Unity でも SUMO でも Python 参照ランタイムでも、同じ仕様をもとにできます。

### 5.4 注釈付き参考文献

#### A. SoS の基礎文献

- Maier, M.W. (1998). *Architecting Principles for Systems-of-Systems*. Systems Engineering, 1(4), 267–284. — 5 条件と、当初の 3 類型（Directed / Collaborative / Virtual）の出典。必読。
- Dahmann, J.S., Baldwin, K.J. (2008). *Understanding the Current State of US Defense Systems of Systems and the Implications for Systems Engineering*. Proc. 2nd Annual IEEE Systems Conference. — 4 つ目の類型 Acknowledged を導入。
- Sage, A.P., Cuppan, C.D. (2001). *On the Systems Engineering and Management of Systems of Systems*.
- Boardman, J., Sauser, B. (2006). *System of Systems — the meaning of "of"*. — Maier の代替の ABCDE フレームワーク。
- Dahmann, J. (2014). *System of Systems Pain Points*. INCOSE International Symposium, 24(1), 108–121. — 7 つの SoS pain points。
- Madni, A.M., Sievers, M. (2014). *System of Systems Integration: Key Considerations and Challenges*.

#### B. ISO 標準

- ISO/IEC/IEEE 21839:2019. *Systems and software engineering — System of Systems (SoS) considerations in life cycle stages of a system*.
- ISO/IEC/IEEE 21840:2019. *Systems and software engineering — Guidelines for the utilization of ISO/IEC/IEEE 15288 in the context of system of systems (SoS)*.
- ISO/IEC/IEEE 21841:2019. *Systems and software engineering — Taxonomy of systems of systems*.
- ISO/IEC/IEEE 15288:2023. *Systems and software engineering — System life cycle processes*.
- ISO/IEC/IEEE 42010:2022. *Software, systems and enterprise — Architecture description*.

#### C. アーキテクチャ記述言語

- Medvidovic, N., Taylor, R.N. (2000). *A Classification and Comparison Framework for Software Architecture Description Languages*.
- Garlan, D., Schmerl, B. (2006). *Architecture-Driven Modelling and Analysis*.

#### D. 規範的マルチエージェントシステム

- Boella, G., van der Torre, L., Verhagen, H. (2006). *Introduction to Normative Multiagent Systems*.
- Andrighetto, G. et al. (Eds.) (2013). *Normative Multi-Agent Systems*. Dagstuhl Follow-Ups Vol. 4.
- Boella, G., van der Torre, L. (2008). *Substantive and procedural norms in normative multiagent systems*.

#### E. 実行時検証

- Bartocci, E., Falcone, Y., Francalanza, A., Reger, G. (2018). *Introduction to Runtime Verification*.
- Havelund, K., Goldberg, A. (2008). *Verify Your Runs*. In VSTTE 2005, LNCS 4171, pp. 374–383, Springer. — 発表は VSTTE 2005、論文集は 2008 年刊。

#### F. ブロックチェーン DSL（比較対象）

- Buterin, V. (2014). *Ethereum White Paper: A Next-Generation Smart Contract and Decentralized Application Platform*. — 本文 5.3 で触れた Ethereum / Solidity の出典。
- Atzei, N., Bartoletti, M., Cimoli, T. (2017). *A Survey of Attacks on Ethereum Smart Contracts (SoK)*. — 仕様とコードを同一にすることが危険とされる理由。

#### G. シミュレーション関連（コース B / C で参照）

- Banks, J. et al. (2010). *Discrete-Event System Simulation* (5th ed.). Pearson. — シミュレーション方法論の標準教科書。
- Matloff, N. (2008). *Introduction to Discrete-Event Simulation and the SimPy Language*. — Web で公開されている SimPy 入門。

#### H. SoS 固有のシミュレーション事例

- Sahin, F. et al. (2007). *System of Systems Approach to Threat Detection and Integration of Heterogeneous Independently Operable Systems*. — 脅威検知と、独立運用される異種システムの統合に対する SoS アプローチ。
- Acheson, P., Dagli, C.H., Kilicay-Ergin, N. (2013). *Model based systems engineering for system of systems using agent-based modeling*.

---

## 次に読むもの

- [コース A — ロボット配送](../textbook/index.md)
- [ハンズオン入口](index.md)
