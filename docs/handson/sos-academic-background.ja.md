---
sidebar_position: 7
sidebar_label: "Academic Background (JA)"
title: "学術背景 (日本語)"
---

# SoS-DSL ハンズオン 学術背景・参考文献

> 🌐 **English version** → [`sos-academic-background.en.md`](sos-academic-background.en.md)
>
> ⬅ メイン教材に戻る → [`sos-dsl-handson-textbook.ja.md`](sos-dsl-handson-textbook.ja.md)

このページは、ハンズオン教材を System of Systems (SoS) 工学のより広い学術および標準の文脈に位置付けるためのものです。次の用途で活用してください。

- 候補ドメインが *本当に* SoS かどうか（単なる複雑なワークフローでないか）を判断する。
- レポート、修論、論文を書くときに正典となる参考文献を引用する。
- ハンズオン後にさらに読み進めたいときの関連文献を見つける。

---

## 1. System of Systems とは

**System of Systems (SoS)** は「独立して有用な複数のシステムが、より大きなシステムへ統合され、独自の能力を提供する状態」（米 DoD, 2008）と定義されます。SoS という用語自体は 1960 年代から系統工学の文献に現れますが、現代の運用的定義は次の 2 つに錨づいています。

- **Maier (1998)** — SoS をモノリシックなシステムから区別する 5 条件。基礎文献として広く引用される。
- **ISO/IEC/IEEE 21839, 21840, 21841 (2019)** — システム工学プロセス標準 ISO/IEC/IEEE 15288 の上に SoS 工学とその分類を国際標準化したもの。

### 1.1 Maier の 5 条件

ある対象を SoS と呼ぶには、以下のうち最低でも (1) と (2) を満たす必要があります。

| # | 条件 | 意味 |
| --- | --- | --- |
| 1 | **構成要素の運用上の独立性** | 各構成システムは SoS とは独立した目的でも単独で運用できる |
| 2 | **構成要素の管理上の独立性** | 各構成システムは異なるオーナー・意思決定者によって管理される。命令ではなく協調する関係 |
| 3 | **地理的分散** | 構成要素は物理的に離れて存在し、エネルギーや物質ではなく情報を交換する |
| 4 | **創発的振る舞い** | SoS 全体としては、どの構成要素も単独では持たない振る舞いが現れる |
| 5 | **進化的発展** | SoS は決して "完成しない"。構成要素は時間とともに加除・改変される |

> 💡 **ハンズオンの題材を試金石にかける**：
> - メインハンズオンのロボット配送は、ロボット個別レベルで (1)、(3)、(4)、部分的に (5) を満たします。(2) 管理独立性は微妙で、ロボット群とディスパッチャは同じ仮想的な倉庫オペレーターのものです。**教科書的な SoS というより並行制御問題に近い**位置にあります。
> - **コーヒーショップ**は (1)(2)(3) のいずれも満たしません — スタッフはこの店だけのために働き、オーナーが全員を管理し、全員同じ建物にいます。教育上は便利でも、**SoS ではありません**。
> - **フードデリバリーサービス**（Uber Eats / Wolt / 出前館）は (1)〜(5) を明確に満たします — レストランは独立企業で価格・営業時間を自分で決める、driver はギグワーカーで platform に雇用されていない、両者を platform は所有しない、地理的に都市全体に広がる、平均配達時間 30 分という集合的振る舞いはどの単一当事者も設計しておらず、レストラン・driver の集団は日々入れ替わる。

### 1.2 Maier の 4 類型

Maier はさらに、中央権威の強さにより SoS を 4 類型に分類しています。

| 類型 | 中央権威 | 例 | Part 2 候補との対応 |
| --- | --- | --- | --- |
| **Directed（指令型）** | 強力なトップダウン。特定目的のために構築・管理される | 防空ネットワーク | （日常生活では稀） |
| **Acknowledged（認知型）** | SoS としての権威は認識されるが、各構成システムは所有権を保持 | NASA / ESA / JAXA / ROSCOSMOS が共同するミッション、**今のロボット配送例** | メインのロボット配送 |
| **Collaborative（協調型）** | 単一の権威なし。標準やプロトコルを通じて自発的に協力 | インターネット、**フードデリバリーサービス** | Part 2 — フードデリバリー |
| **Virtual（仮想型）** | 中央管理も合意された共通目的もなく、調整は自然発生する | World Wide Web、**独立に予算化された行政機関の連携による緊急対応** | Part 2 — 緊急通報 |

ISO/IEC/IEEE 21841 はこの類型を国際標準化しています（一部の翻訳では "Acknowledged" が "Recognised" になるなどの微差はあります）。

---

## 2. ISO 標準のランドスケープ

CADL と SoS-DSL 拡張は、ISO 標準が規定する SoS 工学プロセスを *記法レベルで運用化する* ツールとして理解するのが最もすっきりします。標準自身は表記法を規定しませんから、その空白を CADL が埋める形です。

### 2.1 親標準：15288 ファミリー

**ISO/IEC/IEEE 15288:2023 — Systems and software engineering — System life cycle processes** はすべてのシステムに適用される技術プロセス、合意プロセス、組織プロセス、プロジェクトプロセスを定める総合標準です。本ページで議論する他のほぼすべての標準が 15288 を土台にしています。

### 2.2 SoS 三部作 — ISO/IEC/IEEE 21839 / 21840 / 21841

| 標準 | 発行年 | タイトル（簡略） | 想定読者 | CADL との関係 |
| --- | --- | --- | --- | --- |
| **ISO/IEC/IEEE 21839** | 2019 | *単一の* システムのライフサイクルにおける SoS 観点の考慮 | 構成システムのエンジニア | C# で書く pilot（および `Pilot_CSoS.cs`）が構成システム。21839 は「あなたは SoS の一部であることを忘れずに観測・通知・遵守せよ」と言う。私たちの **monitors** が「観測」、**lifecycle** が「遵守」に相当 |
| **ISO/IEC/IEEE 21840** | 2019 | *15288* を *SoS 文脈* で利用するためのガイドライン | SoS 自体のエンジニア | CADL 仕様を書く人がこのエンジニア。21840 は 15288 の各プロセス（要件、検証、移行など）を SoS スケールに対応付ける。SoS-DSL の `lifecycle:` ブロックは 21840 のいう *合意駆動の SoS プロセス* に該当 |
| **ISO/IEC/IEEE 21841** | 2019 | System of Systems の分類体系 | SoS を分類する者全般 | 上記の 4 類型を定義。私たちは例にラベル付けに使用（ロボット配送 = Acknowledged、フードデリバリー = Collaborative） |

### 2.3 周辺の押さえておくべき標準

| 標準 | ハンズオンとの関係 |
| --- | --- |
| **ISO/IEC/IEEE 12207:2017** | ソフトウェアライフサイクルプロセス。15288 のソフトウェア工学版。CADL 自体はソフトウェア成果物なので 12207 に従う |
| **ISO/IEC/IEEE 42010:2022** | Systems and software engineering — Architecture description。アーキテクチャ記述（AD）の構成、ビューポイントとビューを定義。**CADL は 42010 の意味で AD 言語** |
| **INCOSE Handbook（第 4 版, 2015）** | ISO 15288 の事実上の実務リファレンス。SoS の章は 21839/21840/21841 より古いが、語彙は同じ |
| **DoD SE Guide for SoS (2008)** | 米国防総省の公開文書。ISO 標準より古いが、Dahmann (2014) が改良した「SoS pain points」の語彙を導入 |

### 2.4 標準の引用形式

ISO 標準本体は有償ですが、論文での引用形式は次のとおりです。

```
ISO/IEC/IEEE 21839:2019. Systems and software engineering — System of Systems (SoS) considerations in life cycle stages of a system. International Organization for Standardization, Geneva.

ISO/IEC/IEEE 21840:2019. Systems and software engineering — Guidelines for the utilization of ISO/IEC/IEEE 15288 in the context of System of Systems (SoS). International Organization for Standardization, Geneva.

ISO/IEC/IEEE 21841:2019. Systems and software engineering — Taxonomy of Systems of Systems. International Organization for Standardization, Geneva.

ISO/IEC/IEEE 15288:2023. Systems and software engineering — System life cycle processes. International Organization for Standardization, Geneva.
```

オープンアクセスの要約：arXiv や機関リポジトリで「ISO/IEC/IEEE 21839 SoS」を検索すると、論文中に該当条項が逐語引用されているものが多数見つかります。

---

## 3. CADL と SoS-DSL の研究的位置付け

CADL は確立された 3 つの研究伝統の交点に位置します。各機能がどの伝統から来ているかを理解すると、関連研究を辿りやすくなります。

### 3.1 アーキテクチャ記述言語（ADL）

**背景**: Medvidovic & Taylor (2000) は ADL を構造的プリミティブ（コンポーネント、コネクタ）、モデリング能力（並行性、動的性）、解析能力（対応する解析）の 3 軸で分類しました。代表例：ACME、AADL、Wright、Rapide。

**CADL の位置**: CADL は 42010 の意味での ADL です。`actors:` ブロックがコンポーネントプリミティブ、`protocols:` がコネクタ＋振る舞いプリミティブ、`transitions:` が動的性プリミティブ。**SoS-DSL 拡張は古典的 ADL に欠けていた規範的プリミティブ**（インスタンスごとの `lifecycle:`、宣言的観測者 `monitors:`）を追加します。

### 3.2 規範的マルチエージェントシステム（Normative MAS）

**背景**: Boella, van der Torre, Verhagen (2006) は規範的 MAS を「エージェントが規範（義務、許可、禁止）に支配され、その規範自体が第一級の存在として扱われるシステム」と定義しました。von Wright (1951) の義務論理にまで遡るルーツを持ちます。

**CADL の位置**: CADL の既存 `contracts:` セクション内の `obligations:` / `permissions:` / `prohibitions:` clauses はすでにこの伝統に従っています。SoS-DSL 拡張は **インスタンスごとのライフサイクル** と **宣言的モニター** を追加し、規範の運用化を一段先鋭化します。

### 3.3 実行時検証（Runtime Verification）

**背景**: Bartocci et al. (2018) — 実行時検証は、動作中のシステムを形式仕様に対して観測し、違反を報告します。MOP、RV-Monitor、Larva などのツールがあり、仕様は時相論理または状態機械で表現されます。

**CADL の位置**: SoS-DSL の `monitors:` は、小さな述語言語に制限された実行時検証仕様です。Python と Unity-C# の両ランタイムが *モニター* コンポーネントとして動作します。ライフサイクルの `deadline` + `on_violation` は、純粋な時相論理よりも MaC（Monitoring and Checking）系のフレームワークに近い設計です。

### 3.4 比較対象としてのスマートコントラクトとブロックチェーン DSL

**背景**: Ethereum の Solidity（Buterin et al., 2014）は、契約規範を実行コードとして書けることを示しました。Atzei et al. (2017) は、契約コードと契約意図が乖離したときに何が起こるかをまとめています。

**CADL の位置**: SoS-DSL は **仕様レベルでは Solidity 形だが、ブロックチェーンに縛られない**設計です。生成器は Solidity（既存の CADL ターゲット）、Unity-C#（このハンズオンで新設）、純粋な Python のいずれもターゲットにできます — 同じ仕様、異なる配備先。

---

## 4. 身近かつ SoS の特徴のあるドメイン（Part 2 候補）

Part 2 のドメインを選ぶには 2 つの基準が共に重要です。

- **身近さ** — 学生がアクターと彼らが望むことを直感できる
- **SoS 性** — 最低限 Maier (1)+(2)、できれば (3)(5) も満たす

下表は 6 候補ドメインをこの 2 軸で採点したものです。

| ドメイン | (1) 運用独立 | (2) 管理独立 | (3) 地理分散 | (4) 創発 | (5) 進化 | 学生にとっての身近さ | ISO 21841 類型 |
| --- | :---: | :---: | :---: | :---: | :---: | :---: | --- |
| コーヒーショップ | ✗ | ✗ | ✗ | ~ | ~ | ★★★ | （SoS ではない） |
| 複数エレベータ | ~ | ✗ | ✗ | ~ | ~ | ★★ | （SoS ではない） |
| 課題提出ワークフロー | ✗ | ✗ | ✗ | ✗ | ✗ | ★★★ | （SoS ではない） |
| **🥡 フードデリバリー (UberEats / Wolt / 出前館)** | ✓ | ✓ | ✓ | ✓ | ✓ | ★★★ | **Collaborative** |
| **🚨 緊急対応 (119 / 110 + ER)** | ✓ | ✓ | ✓ | ✓ | ~ | ★★ | **Virtual**（指令時は Acknowledged） |
| **🛒 EC 購入と配送 (Amazon / 楽天 + ヤマト / 佐川)** | ✓ | ✓ | ✓ | ✓ | ✓ | ★★★ | **Collaborative** |

> 上 3 行は誠実さのため残しています — 教育的には有益ですが、教科書的な意味で **SoS ではありません**。

### 第 1 推奨：**フードデリバリー（Collaborative SoS）**

教育上もっとも強い選択である理由：

1. **日常的な親近感** — 2025 年以降、ほぼすべての学生が月に 1 回以上はフードデリバリーを利用している。
2. **構成要素独立性が明確** — レストランは独立した飲食店（自分で価格と営業時間を決める）、driver はギグワーカー（労働時間を自分で決める）、platform はそのどちらも所有していない。
3. **メインハンズオンとの直接対比** — ライフサイクル（`Placed → Accepted → InPreparation → InTransit → Delivered`）はロボット配送と *ほぼ同一* だが、SoS *類型* が違う（Collaborative vs Acknowledged）。学生は「同じライフサイクルが SoS 類型を変えるとどう読めるか」を体験できる。
4. **規範の自然さ** — 食品温度モニター、driver バッテリーモニター（電動自転車）、レストラン負荷モニター、配達時間契約（30 分以内）。SoS-DSL の `monitors:` と `lifecycle:` に綺麗に対応する。
5. **SimPy との相性** — Poisson 過程による到着、指数分布のサービス時間、複数サーバ待ち行列。シミュレーション教科書の標準題材。

### 第 2 推奨：**緊急対応（Virtual SoS）**

発展的学生向けの選択肢として併設する理由：

1. **SoS 教科書事例の典型** — Maier (1998), DoD (2008), Dahmann (2014) いずれも例として挙げる。
2. **省庁横断の調整** — 消防、救急、ER、警察は、フードデリバリー platform より *管理独立性* が強い（共有する管理がゼロ。フードデリバリーには platform という調整役がいる）。
3. **生命に関わる厳しい期限** — 救急車 8 分以内応答は厚労省の実在指標であり、違反 severity に意味がある。
4. **日常の身近さよりも文化的認知度** — 学生は 119 / 110 を訓練やニュースで知っているが、自分でかけたことはあまりない。

### なぜ他は採らないか

- **コーヒーショップ / 複数エレベータ / 課題提出** — SoS テストに不合格（単一組織内のワークフロー）。
- **EC 購入と配送** — SoS 性は十分だが、時間スケールが長い（時間〜日）ため、シミュレーション反復が遅くなる。
- **マルチモーダル通学** — Virtual SoS として成り立つが、旅程完了契約を *規範化* するのが難しい（配送時間 SLA に比べて）。

---

## 5. 注釈付き参考文献

精選リスト。番号は本ページ内で相互参照されます。

### A. SoS の基礎文献

- **[Maier 1998]** Maier, M.W. (1998). *Architecting Principles for Systems-of-Systems*. Systems Engineering, 1(4), 267–284. — 5 条件と 4 類型の出典。必読。
- **[Sage & Cuppan 2001]** Sage, A.P., Cuppan, C.D. (2001). *On the Systems Engineering and Management of Systems of Systems and Federations of Systems*. Information, Knowledge, Systems Management, 2(4), 325–345.
- **[Boardman & Sauser 2006]** Boardman, J., Sauser, B. (2006). *System of Systems — the meaning of "of"*. IEEE/SMC International Conference on System of Systems Engineering. — Maier の代替として ABCDE フレームワーク（Autonomy, Belonging, Connectivity, Diversity, Emergence）を提示。
- **[Dahmann 2014]** Dahmann, J.S. (2014). *Systems of Systems Pain Points*. INCOSE International Symposium. — 7 つの SoS pain points（SoS 権威、リーダーシップ、構成システムの視点、能力と要件、自律性、相互依存と創発、テスト・検証・学習、SoS エンジニアリング）。SoS-DSL の `monitors:` ブロックは pain point #6（相互依存と創発）に応じる。
- **[Madni & Sievers 2014]** Madni, A.M., Sievers, M. (2014). *System of Systems Integration: Key Considerations and Challenges*. Systems Engineering, 17(3), 330–347.

### B. ISO 標準（再掲、引用便利のため）

- **[ISO 21839]** ISO/IEC/IEEE 21839:2019. *Systems and software engineering — System of Systems (SoS) considerations in life cycle stages of a system*.
- **[ISO 21840]** ISO/IEC/IEEE 21840:2019. *Systems and software engineering — Guidelines for the utilization of ISO/IEC/IEEE 15288 in the context of System of Systems (SoS)*.
- **[ISO 21841]** ISO/IEC/IEEE 21841:2019. *Systems and software engineering — Taxonomy of Systems of Systems*.
- **[ISO 15288]** ISO/IEC/IEEE 15288:2023. *Systems and software engineering — System life cycle processes*.
- **[ISO 42010]** ISO/IEC/IEEE 42010:2022. *Systems and software engineering — Architecture description*.

### C. アーキテクチャ記述言語

- **[Medvidovic & Taylor 2000]** Medvidovic, N., Taylor, R.N. (2000). *A Classification and Comparison Framework for Software Architecture Description Languages*. IEEE Trans. Software Engineering, 26(1), 70–93. — CADL を ADL の中に位置付ける際に使用。
- **[Garlan & Schmerl 2009]** Garlan, D., Schmerl, B. (2009). *Architecture-Driven Modelling and Analysis*. SCS '09. — ADL と実行時適応の接続。

### D. 規範的マルチエージェントシステム

- **[Boella et al. 2006]** Boella, G., van der Torre, L., Verhagen, H. (2006). *Introduction to Normative Multiagent Systems*. Computational and Mathematical Organization Theory, 12(2–3), 71–79. — 教科書的定義。
- **[Andrighetto et al. 2013]** Andrighetto, G., Governatori, G., Noriega, P., van der Torre, L. (Eds.) (2013). *Normative Multi-Agent Systems*. Dagstuhl Follow-Ups Vol. 4. — 包括的な巻。規範の運用化に関する章は私たちの `lifecycle:` `monitors:` に直接対応。
- **[Boella & van der Torre 2008]** Boella, G., van der Torre, L. (2008). *Substantive and procedural norms in normative multiagent systems*. Journal of Applied Logic, 6(2), 152–171.

### E. 実行時検証

- **[Bartocci et al. 2018]** Bartocci, E., Falcone, Y., Francalanza, A., Reger, G. (2018). *Introduction to Runtime Verification*. In: Lectures on Runtime Verification, LNCS 10457, 1–33.
- **[Havelund & Goldberg 2008]** Havelund, K., Goldberg, A. (2008). *Verify Your Runs*. VSTTE '08. — 実務向けの導入。

### F. 比較対象としてのスマートコントラクト

- **[Atzei et al. 2017]** Atzei, N., Bartoletti, M., Cimoli, T. (2017). *A Survey of Attacks on Ethereum Smart Contracts (SoK)*. POST 2017. — 「仕様 = コード」が危険な単純化である理由。なぜ CADL は仕様レベルに留まりコードを生成するのか（オンチェーン直接実行ではなく）を考えるための背景。

### G. Part 2 のシミュレーション関連

- **[Allen 2014]** Allen, T. (2014). *Probability, Statistics, and Queueing Theory: With Computer Science Applications*. — SimPy で到着率・サービス時間分布を設計するときに参照。
- **[Banks et al. 2014]** Banks, J., Carson, J.S., Nelson, B.L., Nicol, D.M. (2014). *Discrete-Event System Simulation* (5th ed.). — シミュレーション方法論の標準教科書。
- **[Matloff 2008]** Matloff, N. (2008). *Introduction to Discrete-Event Simulation and the SimPy Language*. — 無料・Web 公開の SimPy 専用入門。

### H. SoS 固有のシミュレーション事例

- **[Sahin et al. 2007]** Sahin, F., Sridhar, P., Horan, B., Raghavan, V., Jamshidi, M. (2007). *System of Systems Approach to Threat Detection and Integration of Heterogeneous Independently Operable Systems*. SoSE 2007. — 緊急対応 SoS の形式アーキテクチャ。
- **[Acheson et al. 2013]** Acheson, P., Dagli, C.H., Kilicay-Ergin, N. (2013). *Model based systems engineering for system of systems using agent-based modeling*. Procedia Computer Science, 16, 11–19.

---

## 6. このページの使い方

- **学生として**: Part 2 に入る前に §1 と §4 をざっと通読し、振り返りレポートを書くときに §3 と §5 に戻る。
- **査読者として**: §2 は、ある論文が「本当に」SoS 工学を扱っているかを判定する標準のミニマップ。
- **研究者として**: §3 と §5 は文献調査の起点。§5G–H は SoS 検証論文のシミュレーション方法論の屋台骨。

---

## ナビゲーション

- メイン教材 → [`sos-dsl-handson-textbook.ja.md`](sos-dsl-handson-textbook.ja.md)
- 演習問題集 → [`sos-dsl-exercises.ja.md`](sos-dsl-exercises.ja.md)
- English version → [`sos-academic-background.en.md`](sos-academic-background.en.md)
