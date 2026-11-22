---
sidebar_position: 20.6
title: "付録L. 判断の記録"
description: "判断の記録（decisions 0.3）の形式を規定する。モデルの改正がどのように判断されたかを記録するファイルの形式であり，人，LLM，ツールのどれにも同じ証拠を求める。当事者とその役割，各当事者が判断する層（ほかの当事者に代わって判断する当事者と，それを許す委任を含む），目的，改正案，測定，検査，投票，推奨，判断の要求，判断，バージョン，後で確かめる約束（何がそれを果たすかを含む）を項目として持つ。各判断の根拠，G.8 のハッシュの連鎖による完全性，検証者が行う検査と，確認のために報告する指摘，付録Kとの関係，GSNへの対応を定める。"
---

# 付録L. 判断の記録（decisions 0.3）

[付録K，K.5](./appendix-k-amendment.md)では，モデルのバージョンは，その根拠となった判断の記録を
URI参照で指すことができる。K.5は記録そのものについては何も定めない。この付録は，そのような記録の形式を
定める。この形式の記録を，判断の記録と呼ぶ。判断の記録があれば，記録を書いたシステムを知らないツールでも，
記録を読み，検査し，示すことができる。

判断の記録はモデルとは別のファイルであり，モデルのキーではない。CADLファイルは，判断の記録を使うために
何も宣言しない。コアと拡張のどの判定も，判断の記録によらない。形式は規定であり，判断の記録を残すか
どうかは各システムが決める。リファレンス実装とコースDの演習がこの形式をどう扱うかは，L.10が述べる。

## L.1 動機と範囲 {/* #l1-motivation-and-scope */}

[コースD](../handson/robot-town-tutorial.md)のロボットの街は，期ごとに規則を改正する。LLMが改正案を
出し，ツールが同じ乱数シードで改正案を測って憲法の判定にかけ，3社が投票する。判定やLLMが求めたときは，
人間が判断する。人間は，LLMが選択肢を推奨する判断要求を読んでから判断する。人間はKPIも書き，LLMが
KPIを複数の読み方で読んだときは，どう測るかを選ぶ。ループを縛る憲法の値，つまり規制の変更は，別の人が
判断する。規制の担当者である。

このような改正のループには，後から次の2つが問われる。

- 合意：それぞれの変更に誰が同意したか。各社は賛成したか。賛成しなかったなら，誰がその投票を覆したか。
- 説明責任：誰が，どの手続きで，何を根拠に，なぜ判断したか。判断した者が分からなかったことは何か。
  後で何を確かめると約束したか。

演習では，人が読むための `decisions.md` と `gsn.yaml` がこれに答える。robot-town v0.2.2 より後は
`evidence.json` もこれに答える。`evidence.json` はプログラムで読めるが，演習に結び付いている。判定と
メトリクスの名前が，シミュレータのものである。判断の記録は，同じ問いに，システムによらない形で答える。
判断ごとに次のことを記録する。

- どの目的のもとで判断したか（所有者が書いた文と，その測り方）。
- 何が，誰によって提案され，何が測られたか。
- それぞれの改正案がどの検査を通ったか，誰が検査したか。
- 各当事者がどう投票したか。
- 提案者が何を予測し，助言者が何を推奨したか。その理由と前提，何が分からないと述べたか。
- 誰が，どの手続きで，どの理由，前提，分からないことのもとで判断したか。判断がどの項目を根拠としたか。
- モデルのどのバージョンが効力を持ったか。
- 判断した者が後で何を確かめると約束したか。何がその約束を果たすか。それが果たされたか。

どの当事者にも同じ証拠を求める。LLMやツールが行った提案，推奨，判断は，人が行ったものと同じ
フィールドで記録し，同じ規則で検査する。理由，根拠とした項目，前提，予測，分からないことである
（L.4の「証拠のフィールド」）。コースDでは，LLMが提案と推奨を行い，人間に代わって判断することもある。
規則の改正でも，顧客との契約の改正でも同じであり，規制については規制の担当者に代わって判断する。確認する
人は，LLMの判断を人間の判断と同じように詳しく読めなければならず，誰が誰に代わって，どの層について
判断したかを記録から読み取れなければならない。

この付録が定めるのは，項目とそのフィールド，項目のあいだの参照，ファイルの完全性，検証者の検査である。
定めないのは，項目を生み出す手続き（システムがどの判定を行うか，改正案をどう作るか），メトリクスの
意味（その式と測定方法はモデルにある，K.5），ツールが記録をどう示すかである。

## L.2 概念 {/* #l2-concepts */}

- 判断の記録は1つのファイルである。1つのモデルに対する一連の判断を扱う。改正のループの1回の実行，
  または運用中のシステムの全期間がその例である。
- 当事者は，判断に加わる人，組織，ソフトウェアエージェント，LLM，ツールである。当事者は1つ以上の
  役割を持つ。

  | 役割 | 当事者が行うこと |
  | --- | --- |
  | `owner` | 目的を書く |
  | `proposer` | 改正案，または目的の読み方を提案する |
  | `assessor` | 改正案を測り，検査する |
  | `voter` | 改正案に投票する |
  | `advisor` | 判断する者に選択肢を推奨する |
  | `decider` | 与えられた層（`layers`，L.3）について判断する。ほかの当事者に代わって判断することもある（`on_behalf_of`，L.3） |
  | `affected` | 判断の影響を受けるが，判断には加わらない（顧客など）。項目が誰に影響するかを示すために挙げる |

- 項目は，記録のヘッダより後の1行である。項目は，種類（L.4），識別子，項目を作った当事者，項目が属する
  システムの時間上の時点（K.4と同じく，期または時刻），項目を書いた時刻を持つ。
- 項目の根拠は，その項目のもとになった，より前の項目の並びである。判断は根拠として，有効な目的，測定，
  検査，投票，推奨を挙げる。
- 後で確かめる約束（follow-up）は，判断とともに，後で何かを確かめる，または行うと約束するものである。
  後の項目が約束を果たす。約束は，それを果たす項目が何でなければならないかを示せる。測り直す約束なら，
  測り直す対象の測定と同じ条件での測定である。
- 委任（delegation）は，ある当事者が，ほかの当事者に自分の代わりに判断させる項目である。どの層について，
  どの手続きで，どんな条件のもとで，いつまで任せるかを示す。自分の規則で改正を採択するツールも，人に
  代わって判断の要求に答えるLLMも，同じく委任を受けた者である。有効な委任の範囲で行った判断は，その委任の
  もとの判断として示す。委任なしにほかの当事者に代わって行った判断は，確認のために報告する。
- 項目は変更しない。訂正は，前の項目の誤りを述べる後の項目である。

## L.3 ファイルの形式 {/* #l3-file-format */}

判断の記録は，UTF-8のJSON Linesのファイルであり，各行は改行で終わる。最初の行はヘッダであり，続いて
項目が書いた順に並び，完全な記録は終わりの記録で終わる。ファイル名は `decisions.jsonl` を推奨する。

どの行も，[付録G，G.8](./appendix-g-agents.md)の3つの完全性のフィールド `seq`，`prev`，`digest` で
終わる。これらはG.8のとおりに，行の正規化JSONに対して，SHA-256で，または鍵付きの記録ではHMAC-SHA256で
計算する。行はG.8の書き出しの形に従う。連鎖の限界と，ファイルの外に保管するアンカーについてG.8が
述べることは，判断の記録にも当てはまる。記録を書く者は，最後の行の `digest` と `run_id` を記録の外に
保管することが望ましい。

| 行 | 完全性のフィールドより前のフィールド |
| --- | --- |
| ヘッダ | `decisions_format`：`"cadl-decisions/3"`。`hash`，`key_id`，`run_id`：G.8のヘッダと同じ。`model`：`name`（モデルの `sos.name`），`version`（最初のバージョンの `sos.version`，または `null`），`source_sha256`（CADLファイルの最初のバージョンのバイト列のSHA-256，または `null`）。`time_base`：期が何であるかの説明，または `null`。`started`：記録を始めた時刻（UTCのISO 8601のタイムスタンプ）。`previous`：別の記録の続きであるときは，その記録の `run_id` と終わりの記録の `digest`。そうでなければ `null`。`parties`：当事者（下記）。 |
| 項目 | L.4の共通のフィールドと，種類ごとのフィールド。 |
| 終わりの記録 | `decisions_end`：`true`。`entries`：ヘッダと終わりの記録のあいだの項目の数。 |

終わりの記録がない記録は，書いている途中であるか，書く者が書き終えなかったものである。検証者は，それを
開いた記録として報告する。完全な記録に項目を足すことはできない。記録はヘッダを1つだけ持つので，一連の
判断を続けて記録する者は新しい記録を始め，そのヘッダの `previous` で前の記録を指す。

当事者。`parties` の各当事者は次のフィールドを持つ。

| フィールド | 内容 |
| --- | --- |
| `id` | 記録の中での当事者の識別子。英字，数字，`_`，`-`，`.`。 |
| `kind` | `human`，`organisation`，`agent`，`llm`，`tool` のいずれか。 |
| `roles` | L.2の役割を1つ以上。 |
| `name` | 読む人のための名前，または `null`。 |
| `actor` | 当事者が，モデルのどのアクターまたは役割にあたるか。K.3の `decided_by:` と `voters:` が指す形で書く（`COUNCIL`，`service_operator`）。なければ `null`。 |
| `model` | `llm` ではモデルの識別子，`tool` ではツールの名前とバージョン。それ以外は `null`。 |
| `on_behalf_of` | この当事者が代わりを務める当事者の `id`，または `null`。サービス運営者に代わって判断するLLMは，自身が役割 `decider` を持ち，ここに運営者の当事者を書く。 |
| `layers` | 当事者が判断する層。`rule`，`contract`，`regulation`（K.3の層）の並び，または限らないときは `null`。ほかの当事者に代わる当事者では，代わって判断する層。 |

`layers` は，誰が何を判断してよいかを分ける。コースDでは，サービス運営者は規則と契約について判断し
（`["rule", "contract"]`），規制の担当者は規制について判断する（`["regulation"]`）。ツールであるstewardが
自分で採択するのは，規則の変更だけである（`["rule"]`）。運営者に代わって判断するLLMの層は，運営者の層を
超えない。

種類が `human` の当事者は，人が担う役割を表す。記録はその人の名前を示さなくてよい。誰がその役割を
担ったかは，記録を保管する組織が扱う。種類が `llm` と `tool` の当事者は `model` を持つ。どのモデル，
どのバージョンのツールが項目を作ったかを，読む人が分かるようにするためである。

## L.4 項目 {/* #l4-entries */}

### 共通のフィールド

| フィールド | 内容 |
| --- | --- |
| `id` | 項目の識別子。記録の中で一意。英字，数字，`_`，`-`，`.`。K.5がこの項目を指すときのフラグメントである（L.7）。 |
| `type` | 下記の種類のいずれか。 |
| `point` | 項目が属するシステムの時間上の時点。`{"period": k}`（k ≥ 1）または `{"at": "<ISO 8601>"}`。K.4の `time_point` と同じ。 |
| `written` | 項目を書いた時刻。UTCのISO 8601のタイムスタンプ。 |
| `by` | 項目を作った当事者の `id`。 |
| `basis` | この項目の根拠となった，より前の項目の `id`。空でもよい。 |
| `fulfils` | この項目が果たす，より前の `follow_up` の項目の `id`。空でもよい。 |
| `attachments` | 項目に属するファイル。`path`（記録からの相対パス），`sha256`，`media_type` または `null`。測定の表，LLMの出力，改正案のCADLファイルなど。 |
| `generated` | 文をLLMが生成した項目では，ほかの当事者が項目を書いたときも，`model`（モデルの識別子）と `request_digest`（LLMへの依頼の要約）。同じ入力による2回の実行と，異なる入力による実行を見分けるためである。それ以外は `null`。 |

判断，判断の要求，推奨の選択肢は，`proposal` の項目の `id`，またはモデルを変えないことを表す `"keep"`
である。

### 証拠のフィールド

`proposal`，`recommendation`，`decision` は，作った当事者の種類によらず，さらに4つのフィールドを持つ。

| フィールド | 内容 |
| --- | --- |
| `reason` | その当事者が，なぜそれを提案，推奨，判断するか。当事者自身の言葉で書く。空であってはならない。ただし `procedure` が `automatic` の判断は，代わりに `rule` を持ち，`null` でもよい。 |
| `assumptions` | 当事者が確かめずに正しいとしていること。文の並び。 |
| `unknowns` | 当事者が分からず，知る必要があると述べたこと。文の並び。 |
| `predictions` | 当事者が起こると予測すること。`option`（予測の対象の選択肢。提案では自身の `id`），`subject`（メトリクスは `metric:<名前>`，1つの当事者のメトリクスは `metric:<名前>@<当事者>`，投票は `vote:<当事者>`），`expected`（`increase`，`decrease`，`unchanged`，`yes`，`no`，または `"<= 1"` のような条件の文字列），`note`（文，または `null`）の並び。 |

並びは空でもよい。空の `unknowns` は，当事者が分からないことを何も挙げなかったことを表す。これらの
フィールドによって，確認する人は，各当事者が述べたことを後で測ったことと比べられる。人でもLLMでも同じ
方法で比べる。

### 種類

`objective`：所有者が書いたままの目的の文（コースDのKPI）。`point` から次の目的までのあいだ有効である。

| フィールド | 内容 |
| --- | --- |
| `text` | 書かれたままの文。 |
| `measure` | 所有者が測り方を書いたときは，目的の測り方。測り方の項目（下記）の並び。提案者に読み方を任せるときは `null`。そのときは，種類が `measure` の `proposal` の項目が読み方を出し，`decision` が1つを選ぶ。 |

測り方の項目は，`metric`（モデルのメトリクス，またはシステムでの名前），`role`（`goal`，`watch`，
`guard` のいずれか），`direction`（`increase`，`decrease`，または `null`），`target`（`"<= 1"` の
ような条件の文字列，または `null`）を持つ。最初の `goal` が主目標である。

`proposal`：変更の提案。

| フィールド | 内容 |
| --- | --- |
| `kind` | `amendment`（モデルの新しいバージョン）または `measure`（目的の読み方）。 |
| `title` | 短い題名。 |
| `changes` | 改正では，`parameter`（K.3のパラメータの `id`，またはシステムでの名前），`from`，`to`（数，または時間の文字列），`layer`（`rule`，`contract`，`regulation`，または `null`）の並び。 |
| `objective` | 読み方では，読む目的の `id`。 |
| `measure` | 読み方では，測り方の項目。 |
| `affected` | 変更の影響を受け，その判断に加わらない当事者の `id`。顧客との契約の変更での顧客など。空でもよい。 |

提案は証拠のフィールドも持つ。

`measurement`：有効なバージョン，または改正案について測った値。

| フィールド | 内容 |
| --- | --- |
| `of` | `"in_force"`，または改正案の `id`。 |
| `version` | 測ったバージョンの `sos.version`（`in_force` のとき），または `null`。 |
| `method` | K.5の `measure:` と同じく，`runs`（実行の回数），`window`（時間の文字列，または `null`），`description`（文，または `null`）。 |
| `values` | 実行をまとめた測定値。メトリクスの名前から数への写像。 |
| `per_party` | 当事者ごとの値。当事者の `id` から，メトリクスの名前から数への写像への写像。または `null`。各社の効用など。 |
| `compared_with` | 比べる相手の測定の `id`，または `null`。 |
| `runs_better` | 主目標について，`compared_with` よりよかった実行の数，または `null`。 |

`check`：1つの改正案を検査した結果。

| フィールド | 内容 |
| --- | --- |
| `proposal` | 改正案の `id`。 |
| `results` | `name`（`cadl check`，`constitution`，`invariants`，`gain` のような，システムでの検査の名前），`passed`（`true`，`false`，当てはまらないときは `null`），`note`（文，または `null`）の並び。 |

`vote`：1人の投票者の，1つの改正案への投票。

| フィールド | 内容 |
| --- | --- |
| `proposal` | 改正案の `id`。 |
| `value` | `yes`，`no`，`abstain` のいずれか。 |
| `reason` | 投票者が述べた理由，または `null`。 |

`request`：判断する者に送る，判断の要求。

| フィールド | 内容 |
| --- | --- |
| `to` | 判断する者の `id`。 |
| `question` | 問い。 |
| `options` | 選択肢。 |
| `why` | その者に判断を求める理由。`option` と `reason`（文）の並び。 |

`recommendation`：助言者の推奨。

| フィールド | 内容 |
| --- | --- |
| `request` | 判断の要求の `id`，または `null`。 |
| `options` | `option`，`summary`，`affected`（誰が得をし，誰が損をするかの文）の並び。 |
| `recommends` | 推奨する選択肢，または `null`。 |

推奨は証拠のフィールドも持つ。

`decision`：判断。

| フィールド | 内容 |
| --- | --- |
| `question` | 判断した問い，または `null`。 |
| `options` | 選べた選択肢。 |
| `choice` | 選んだ選択肢。 |
| `procedure` | `single`（判断する者が単独で判断した），`vote`（`choice` への投票の結果に従った），`override`（判断する者が投票の結果を覆した），`automatic`（ツールが `rule` に書いた規則を適用した）のいずれか。 |
| `rule` | `automatic` では，その規則の文（たとえば「すべての検査と投票を通った案のうち，改善が最も大きいものを採択する」）。それ以外は `null`。 |
| `affected` | 判断の影響を受ける当事者の `id`。空でもよい。 |
| `result` | 判断の後に有効な `sos.version`。読み方についての判断では `null`。 |

判断は証拠のフィールドも持つ。

`version`：モデルのバージョンが効力を持つ。

| フィールド | 内容 |
| --- | --- |
| `version` | その `sos.version`。 |
| `previous` | 置き換える `sos.version`，または `null`。 |
| `effective` | 効力を持つ時点。K.4の `effective:` と同じ。 |
| `source_sha256` | そのCADLファイルのバイト列のSHA-256。 |
| `decision` | それを採択した判断の `id`。最初のバージョンでは `null`。 |

`follow_up`：後で確かめる，または行う約束。

| フィールド | 内容 |
| --- | --- |
| `text` | 行うこと。 |
| `due` | 期限。`point` の形，または `null`。 |
| `decision` | 約束をした判断の `id`，または `null`。 |
| `fulfilled_by` | 約束を果たすもの。`fulfils` でこの約束を挙げる後の項目なら何でもよいときは `null`。オブジェクトのときは，`type`（項目の種類，または `null`）と，測定について `of`（`"in_force"` か改正案の `id`，または `null`），`same_method_as`（約束を果たす測定が同じ `method`，つまり同じ実行の回数，期間，説明を持たなければならない，より前の測定の `id`。同じ条件で測ることを表す。または `null`），`subjects`（その測定が持たなければならない値。`metric:<name>` または `metric:<name>@<party>` の形。空でもよい）を持つ。 |

測り直す約束は，測り直す対象の測定を `same_method_as` に挙げる。ほかの条件（ほかの乱数シード，ほかの
需要）での測定は，値がどれほど近くても約束を果たさない。行動の約束（緩和策を提案する，読み方を見直す
など）は，`type` を `decision` または `proposal` とする。

`delegation`：ある当事者が，ほかの当事者に自分の代わりに判断させる。

| フィールド | 内容 |
| --- | --- |
| `to` | `by` に代わって判断する当事者の `id`。`on_behalf_of` が `by` である当事者。 |
| `layers` | `to` が `by` に代わって判断してよい層。`rule`，`contract`，`regulation` の並び，または `to` のすべての層を表す `null`。空の並びは委任を終える。 |
| `procedures` | `to` が使ってよい `decision` の手続き。`single`，`vote`，`override`，`automatic` の並び，またはどれでもよいことを表す `null`。 |
| `conditions` | `to` が判断するときの条件の説明（たとえば，ツールが改正案を採択する前に改正案が通らなければならない検査）。空でもよい。検証者は検査しない。 |
| `until` | 委任が及ぶ最後の時点。`point` の形，または `null`。 |
| `reason` | `by` が任せる理由。 |

委任は，その時点から `until` まで，同じ当事者から同じ当事者への後の委任が置き換えるまで有効である。
当事者が任せてよいか，誰に任せてよいかは，記録を保管する組織が決める。記録は，誰が，いつ，どの範囲で
任せたかを示す。こうして読み手は，委任を受けた者がその範囲の中で行った判断と，範囲の外で行った判断を
区別できる。

`correction`：前の項目の訂正。

| フィールド | 内容 |
| --- | --- |
| `corrects` | 訂正する項目の `id`。 |
| `text` | 何が誤りで，何が正しいか。 |

`note`：当事者が記録に残したいその他のこと。`text` に書く。

## L.5 参照と順序 {/* #l5-references-and-order */}

項目は，それより前に書かれた項目だけを指す。`basis`，`fulfils`，`proposal`，`of`，`compared_with`，
`request`，`decision`，`objective`，`corrects`，`options`，`choice` の `id` は，前の行の `id`
（または `"keep"`）である。委任の `to` は当事者の `id` である。項目の `point` は減らない。1つの時点の
中では，項目は生じた順に書く。委任，目的，
改正案，測定と検査，投票，判断の要求，推奨，判断，後で確かめる約束，バージョンの順である。この順序は推奨
であり，検証者は，この順序に従わない記録を報告しない。

## L.6 検査と指摘 {/* #l6-checks-and-findings */}

検証者は，次のものをエラーとして報告しなければならない。エラーのある記録は，そのままでは信頼できない。

- L-1 ファイルはUTF-8のJSON Linesであり，最初の行は `decisions_format` が `"cadl-decisions/3"` の
  ヘッダである。どの行も，その種類に対するL.3とL.4のフィールドを持ち，ほかのフィールドを持たない
  （`"cadl-decisions/1"` と `"cadl-decisions/2"` の記録はL.11を見よ）。
- L-2 完全性のフィールドが，G.8のとおりに検証を通る。鍵付きの記録では鍵を用いる。
- L-3 当事者の `id` は一意であり，項目の `id` も一意である。
- L-4 項目が指す `id` は，フィールドが求める種類の，より前の項目の `id` である（L.5）。選択肢を表す
  ところでは `"keep"` でもよい。`fulfils` は `follow_up` の項目を指す。`point` は減らない。
- L-5 `by` は，種類が求める役割を持つ当事者を指す。`objective` は owner，`proposal` は proposer，
  `measurement` と `check` は assessor，`vote` は voter，`recommendation` は advisor，`decision` と
  `delegation` は decider である。`request`，`follow_up`，`version`，`correction`，`note` はどの当事者でもよい。
  種類が `amendment` の改正案を採択する判断は，`layers` が `null` であるか，改正案のすべての変更の
  `layer` を `layers` に持つ当事者が行う。
- L-6 判断の `choice` は，その `options` の1つである。改正案への投票は，その改正案への `vote` の
  項目で，投票者ごとに1つである。同じ投票者の後の投票は，前の投票に代わる。`procedure` が `vote`
  または `override` の判断は，`choice` について判断する（`choice` が `"keep"` のときは，`options` の
  最初の改正案について判断する）。その改正案へのそれまでの投票をすべて `basis` に持つ。`vote` では，
  投票がK.3の判断者の定めに従って結果を決める。投票者の賛成が定足数に届くのは，判断がその改正案を
  採択するときに限る。`override` では，投票が結果を決めない。賛成が定足数に届くかどうかは，有効な
  バージョンのCADLファイルがあるときだけ検査できる（L-9〜L-11）。ないときは，検証者は検査しなかった
  ことを示す。`procedure` が `automatic` の判断は `rule` を持ち，判断する者は種類が `tool` の当事者で
  ある。ほかの判断の `rule` は `null` である。
- L-7 改正案を採択する `version` の項目は，その改正案を `choice` とする判断を指し，その判断の
  `result` はバージョンの `version` である。
- L-8 どの `proposal`，`recommendation`，`decision` も，当事者の種類によらず，L.4の証拠のフィールドを
  持ち，その `reason` は空でない（L.4が `automatic` に認める場合を除く）。種類が `llm` と `tool` の
  当事者は `model` を持つ。当事者の `on_behalf_of` はほかの当事者を指し，自身の代わりを務める当事者は
  ない。予測の `subject` は，メトリクス，または役割 `voter` を持つ当事者を指す。ほかの当事者に代わる
  当事者は，その当事者が判断する層についてだけ代わる。代わられる当事者が `layers` を持つときは，代わる
  当事者の `layers` は `null` ではなく，そのうちの層である。`delegation` の `to` は，`on_behalf_of` が
  委任の `by` である当事者である。`to` が `layers` を持つときは，委任の `layers` は `null` ではなく，
  そのうちの層である。

バージョンのCADLファイルが手元にあるとき（`version` の項目の `attachments` のパス，または検証者に
渡されたファイル），検証者は次のものも報告しなければならない。

- L-9 ヘッダと各 `version` の項目の `source_sha256` は，ファイルのSHA-256である。ファイルの
  `sos.version`，`amendment.previous`，`amendment.effective` は項目のものと同じである。
- L-10 判断が採択する，種類が `amendment` の改正案の各 `parameter` は，有効なバージョンのK.3の
  パラメータであり，`from` はそのパラメータの値，`to` はK.3が1回の改正で許す値である。どの判断も採択
  しない改正案は，その外にあってもよい。記録は何が提案されたかを示し，その検査は退けられたことを示す。
  検証者はそれを not amendable として報告する。
- L-11 改正案を採択する判断の判断する者は，それが変える各パラメータのK.3の判断者である（`actor` が
  `decided_by:` である当事者）か，その当事者に代わって判断する（`on_behalf_of`）。そうでなければ，
  判断の `procedure` は `override` である。
  結果を決める投票の投票者は，`actor` が `voters:` にある当事者である。

検証者は，次の指摘も報告する。指摘はエラーではない。記録が，確認する人の見るべきことを示しており，
それが正しかったかどうかは確認する人が判断する。

| 指摘 | 記録が示すこと |
| --- | --- |
| override | 判断が投票の結果を覆した（`procedure` が `override`）。 |
| against recommendation | 判断が，根拠にある推奨と違う選択肢を選んだ。 |
| delegated | ほかの当事者に代わって判断する当事者（`on_behalf_of`）が判断し，それを覆う有効な委任がない。サービス運営者に代わるLLMなど。覆う委任とは，そのほかの当事者からこの当事者への委任で，`layers` が判断の採択する改正案のすべての変更の層を持ち，`procedures` が判断の `procedure` を持つものである。検証者は，委任が覆う判断ごとにその委任を示し，その判断は報告しない。 |
| unknowns | 判断，または判断の根拠にある推奨が，その当事者の分からなかったことを挙げている。 |
| prediction missed | 提案，推奨，判断の予測が，後の項目と食い違う。メトリクスの予測では，予測の対象の選択肢の後の測定が，その `compared_with` の測定と比べて，上がっていない（`increase`），下がっていない（`decrease`），変わっている（`unchanged`。許す幅は検証者が示す），または条件を満たさない。投票の予測では，予測が指す当事者の後の投票が，予測と違う。 |
| affected not measured | 判断が採択する改正案について，その `affected` の当事者（`contract` の層のパラメータの変更では，役割 `affected` を持つ当事者）の値が，根拠にあるどの測定の `per_party` にもない。 |
| unmeasured choice | 判断が，種類が `amendment` の改正案を，その測定を根拠に持たずに採択した。 |
| reading not decided | `measure` のない目的のあと，判断が読み方を選ぶ前に測定が行われた。 |
| fulfilment not shown | 項目が `fulfils` で約束を挙げているが，その約束の `fulfilled_by` が求めるものではない。種類が違う，ほかのものを測った，`same_method_as` の測定と違う `method` で測った，または `subject` の値がない。このような項目は約束を果たさない。 |
| open follow-up | 後で確かめる約束が果たされておらず（`fulfils` でそれを挙げ，`fulfilled_by` を満たす後の項目がない），その `due` の時点を過ぎている（または記録が完全である）。 |
| not amendable | どの判断も採択しない，種類が `amendment` の改正案が，有効なバージョンのK.3が宣言しないパラメータを変える，またはK.3が1回の改正で許さない値に変える（L-10）。 |
| corrected | 項目に訂正がある。 |
| open record | 記録に終わりの記録がない。 |

## L.7 付録Kとの関係 {/* #l7-relation-to-appendix-k */}

`amendment.decisions`（K.5）の項目は，`kind: record` と，フラグメントが項目の `id` であるURI参照に
よって，判断の記録の項目を指す。

```yaml
sos:
  version: v2
  amendment:
    previous: v1
    effective: { period: 2 }
    decisions:
      - id: d1
        kind: record
        ref: decisions.jsonl#D1
        text: "block_k 3 → 2，BとCの反対票を覆して採択"
    parameters:
      - id: block_k
        layer: rule
        value: 2
        decision: d1
        # ...
```

記録とモデルは，異なる当事者が異なる時点に書くので，どちらも他方に依存しない。モデルは記録の項目を
指すことができ，記録はモデルのバージョンを `sos.version` とファイルのSHA-256で指す（L-9）。

## L.8 GSNへの対応（参考） {/* #l8-mapping-to-gsn-informative */}

判断の記録は，GSNのアシュアランスケースとして示すことができる。ツールがGSNを別に書かずに記録から
導けば，両者が食い違うことはない。

| 項目またはフィールド | GSNの要素 |
| --- | --- |
| 一連の判断の最上位のゴール（「システムは所有者の目的を満たし続ける」など） | Goal（ツールが書く） |
| `objective` | 最上位のゴールの下のGoal。目的ごとに1つ。 |
| 有効な測り方 | 目的のGoalのContext |
| `decision` | 有効な目的のGoalの下のStrategy。選択の論証である。 |
| `point` とその期の条件 | StrategyのContext |
| 根拠にある `measurement` と `check` | StrategyのSolution |
| `reason` | StrategyのJustification |
| `assumptions` | StrategyのAssumption |
| `unknowns` と `predictions` | StrategyのContext。後の測定と食い違った予測は，そのStrategyへの反証である。 |
| 根拠にある `recommendation` | StrategyのContext |
| `delegation` | それが覆う各判断のStrategyのContext |
| `follow_up` | Strategyの下のGoal。後の項目が（`fulfilled_by` を満たして）果たすまでは未展開とし，果たした項目をそのSolutionとする。 |

## L.9 例 {/* #l9-example */}

コースDの英語の記録（cadl-robot-townの `examples/steward-d-en`）の第1期を，短くしたもの。各オブジェクトは
ファイルの1行である。ここでは複数の行に分けて示し，完全性のフィールドは省いた。バージョンは，実行の
ファイルの名前にならって `v1`，`v2` と呼ぶ。cadl-robot-town v0.5.0からは，それらのファイルが改正拡張を
宣言し，この `sos.version` を持つ。提案の予測は，その理由の文から取った。人間は
D1に前提，分からないこと，予測を書かなかったので，空の並びで記録している。

```json
{"decisions_format": "cadl-decisions/3", "hash": "sha256", "key_id": null,
 "run_id": "3f2a…", "model": {"name": "RobotTown", "version": "v1", "source_sha256": "9c1e…"},
 "time_base": "one simulated hour of the robot town", "started": "2026-11-18T09:12:03Z",
 "previous": null, "parties": [
  {"id": "operator", "kind": "human", "roles": ["owner", "decider"], "name": "service operator",
   "actor": null, "model": null, "on_behalf_of": null, "layers": ["rule", "contract"]},
  {"id": "regulator", "kind": "human", "roles": ["decider"], "name": "regulator",
   "actor": null, "model": null, "on_behalf_of": null, "layers": ["regulation"]},
  {"id": "llm", "kind": "llm", "roles": ["proposer", "advisor"], "name": null, "actor": null,
   "model": "claude-opus-5-5", "on_behalf_of": null, "layers": null},
  {"id": "steward", "kind": "tool", "roles": ["assessor", "decider"], "name": "town.steward",
   "actor": null, "model": "cadl-robot-town (main, 2026-11-21)", "on_behalf_of": null, "layers": ["rule"]},
  {"id": "A", "kind": "agent", "roles": ["voter"], "name": "company A", "actor": null, "model": null, "on_behalf_of": null, "layers": null},
  {"id": "B", "kind": "agent", "roles": ["voter"], "name": "company B", "actor": null, "model": null, "on_behalf_of": null, "layers": null},
  {"id": "C", "kind": "agent", "roles": ["voter"], "name": "company C", "actor": null, "model": null, "on_behalf_of": null, "layers": null},
  {"id": "customers", "kind": "organisation", "roles": ["affected"], "name": null, "actor": null, "model": null, "on_behalf_of": null, "layers": null}]}
{"id": "K1", "type": "objective", "point": {"period": 1}, "by": "operator",
 "text": "Deliver as many orders as possible across the town within the times we promised customers …",
 "measure": null, "basis": [], "fulfils": [], "attachments": [], "written": "…"}
{"id": "K1.r1", "type": "proposal", "point": {"period": 1}, "by": "llm", "kind": "measure",
 "objective": "K1", "title": "Maximize on-time deliveries; watch the worst company's waiting tail",
 "measure": [{"metric": "on_time_deliveries", "role": "goal", "direction": "increase", "target": null},
             {"metric": "worst_company_p95_wait_s", "role": "watch", "direction": "decrease", "target": null},
             {"metric": "unfinished", "role": "watch", "direction": "decrease", "target": null}], …}
{"id": "K1.d", "type": "decision", "point": {"period": 1}, "by": "operator",
 "options": ["K1.r1", "K1.r2", "K1.r3"], "choice": "K1.r1", "procedure": "single", "rule": null,
 "reason": "Follow the order of the KPI. … set the level after period 1 is measured.",
 "assumptions": ["Customers cannot choose which company delivers their order"],
 "basis": ["K1", "K1.r1", "K1.r2", "K1.r3", "K1.rec"], "result": null, …}
{"id": "P1.m0", "type": "measurement", "point": {"period": 1}, "by": "steward", "of": "in_force",
 "version": "v1", "method": {"runs": 5, "window": "1h", "description": "seeds 1–5"},
 "values": {"on_time_deliveries": 121.8, "late_deliveries": 10.4, "blocked_s": 2404},
 "per_party": {"A": {"utility": 38.4}, "B": {"utility": 38.9}, "C": {"utility": 28.8}}, …}
{"id": "P1.2", "type": "proposal", "point": {"period": 1}, "by": "llm", "kind": "amendment",
 "title": "Lower blocking_guard threshold from 3 to 2 waiting robots",
 "changes": [{"parameter": "block_k", "from": "3", "to": "2", "layer": "rule"}],
 "affected": ["customers"],
 "reason": "Only 2.8 blocking_guard evictions fire per period, yet 2404 s of blocked time …",
 "assumptions": ["Queues of two robots are common, queues of three are rare"], "unknowns": [],
 "predictions": [{"option": "P1.2", "subject": "metric:blocked_s", "expected": "decrease", "note": null},
                 {"option": "P1.2", "subject": "vote:A", "expected": "yes", "note": null},
                 {"option": "P1.2", "subject": "vote:B", "expected": "yes", "note": "probably"},
                 {"option": "P1.2", "subject": "vote:C", "expected": "no", "note": null}],
 "generated": {"model": "claude-opus-5-5", "request_digest": "5be0…"}, …}
{"id": "P1.2.m", "type": "measurement", "point": {"period": 1}, "by": "steward", "of": "P1.2",
 "values": {"on_time_deliveries": 131.0, "late_deliveries": 1.2, "blocked_s": 985},
 "per_party": {"A": {"utility": 45.4}, "B": {"utility": 37.2}, "C": {"utility": 19.0}},
 "compared_with": "P1.m0", "runs_better": 5, …}
{"id": "P1.2.c", "type": "check", "point": {"period": 1}, "by": "steward", "proposal": "P1.2",
 "results": [{"name": "cadl check", "passed": true, "note": null},
             {"name": "constitution", "passed": true, "note": null},
             {"name": "gain", "passed": true, "note": "+9.2 on on_time_deliveries"}], …}
{"id": "P1.2.vA", "type": "vote", "point": {"period": 1}, "by": "A", "proposal": "P1.2", "value": "yes", "reason": null, …}
{"id": "P1.2.vB", "type": "vote", "point": {"period": 1}, "by": "B", "proposal": "P1.2", "value": "no", "reason": null, …}
{"id": "P1.2.vC", "type": "vote", "point": {"period": 1}, "by": "C", "proposal": "P1.2", "value": "no", "reason": null, …}
{"id": "D1.req", "type": "request", "point": {"period": 1}, "by": "steward", "to": "operator",
 "question": "Should block_k be lowered from 3 to 2 even though companies B and C voted against it …?",
 "options": ["P1.2", "keep"],
 "why": [{"option": "P1.2", "reason": "the main goal improves by +9.2, but B and C voted it down"}], …}
{"id": "D1.rec", "type": "recommendation", "point": {"period": 1}, "by": "llm", "request": "D1.req",
 "recommends": "keep", "reason": "Adopting it means overriding a majority vote. …",
 "assumptions": [], "predictions": [],
 "unknowns": ["Why C's utility drops sharply while the lowest on-time rate improves", "…"], …}
{"id": "D1", "type": "decision", "point": {"period": 1}, "by": "operator",
 "options": ["P1.2", "keep"], "choice": "P1.2", "procedure": "override", "rule": null,
 "reason": "The intersections are a road shared by the three companies; waiting there is no company's right. …",
 "assumptions": [], "unknowns": [], "predictions": [], "affected": ["C", "customers"], "result": "v2",
 "basis": ["K1.d", "P1.m0", "P1.2", "P1.2.m", "P1.2.c", "P1.2.vA", "P1.2.vB", "P1.2.vC", "D1.req", "D1.rec"], …}
{"id": "D1.f1", "type": "follow_up", "point": {"period": 1}, "by": "operator", "decision": "D1",
 "text": "Re-measure C's utility (28.8 to 19.0) and the road violations (25.8 to 34.0)",
 "due": {"period": 2},
 "fulfilled_by": {"type": "measurement", "of": "in_force", "same_method_as": "P1.m0",
                  "subjects": ["metric:utility@C", "metric:road_violations"]}, …}
{"id": "V2", "type": "version", "point": {"period": 1}, "by": "steward", "version": "v2",
 "previous": "v1", "effective": {"period": 2}, "source_sha256": "47d0…", "decision": "D1",
 "attachments": [{"path": "v2.cadl", "sha256": "47d0…", "media_type": "application/yaml"}], …}
```

第2期には，記録は次のように続く。

```json
{"id": "P2.m0", "type": "measurement", "point": {"period": 2}, "by": "steward", "of": "in_force",
 "version": "v2", "method": {"runs": 5, "window": "1h", "description": "seeds 101–105, rush"},
 "values": {"road_violations": 28.0, …}, "per_party": {"C": {"utility": 56.3}, …},
 "fulfils": ["D1.f1"], …}
{"id": "F2.D1.f1", "type": "measurement", "point": {"period": 2}, "by": "steward", "of": "in_force",
 "version": "v2", "method": {"runs": 5, "window": "1h", "description": "seeds 1–5"},
 "values": {"road_violations": 34.0, …}, "per_party": {"C": {"utility": 19.0}, …},
 "compared_with": "P1.m0", "fulfils": ["D1.f1"], …}
```

検証者は，D1について指摘 override，against recommendation，unknowns を報告し，エラーは報告しない。
判断が理由と根拠を示しているからである。P1.2については prediction missed を報告する。LLMはBが賛成すると
予測したが，Bは反対した。P2.m0については fulfilment not shown を報告する。第2期の測定は `D1.f1` を
挙げるが，P1.m0とは違う乱数シードと需要で測ったので，第1期の値を確かめ直していない。P1.m0の条件で
v2を測った `F2.D1.f1` が，約束を果たす。

サービス運営者がLLMに自分の代わりに判断させていたら，記録には当事者が1つと，運営者からその当事者への
委任が増え，判断は同じフィールドで同じように書かれ，同じ検査を受ける。

```json
{"id": "llm-decider", "kind": "llm", "roles": ["decider"], "name": null, "actor": null,
 "model": "claude-opus-5-5", "on_behalf_of": "operator", "layers": ["rule", "contract"]}
{"id": "G.llm-decider", "type": "delegation", "point": {"period": 1}, "by": "operator",
 "to": "llm-decider", "layers": ["rule", "contract"], "procedures": ["single", "vote"],
 "conditions": ["answer the decision requests of the steward on the rules and the contract"],
 "until": null, "reason": "The operator lets the LLM answer the decision requests (--delegate rule,contract).", …}
{"id": "D1", "type": "decision", "point": {"period": 1}, "by": "llm-decider",
 "options": ["P1.2", "keep"], "choice": "keep", "procedure": "vote", "rule": null,
 "reason": "Adopting it means overriding a majority vote. …",
 "assumptions": ["…"], "unknowns": ["Why C's utility drops sharply …", "…"],
 "predictions": [{"option": "keep", "subject": "metric:late_deliveries", "expected": "unchanged", "note": null}],
 "generated": {"model": "claude-opus-5-5", "request_digest": "…"}, "result": "v1", …}
```

この場合，検証者は unknowns を報告し，D1を行った委任として G.llm-decider を示す。LLMが運営者に
代わって判断してよいか，どの層でよいかは，記録を保管する組織が決める。記録は，LLMが代わって判断した
こと，どの層について判断したか，誰がそれを任せたかを示す。G.llm-decider がなければ，またはLLMが投票の
結果を覆していたら（G.llm-decider が与えない `override`），検証者は delegated を報告する。運営者に代わるLLMは，規制の変更を採択できない。運営者の `layers` が規制を持たないからであり
（L-8），そのような変更を採択する判断はエラーである（L-5）。規制の変更は，別の判断要求で規制の担当者に
出し，それを判断するLLMは規制の担当者に代わる。

## L.10 リファレンス実装の状況 {/* #l10-reference-implementation-status */}

`cadl` 0.3.39から，次のものがある（decisions 0.3。`cadl` 0.3.38はdecisions 0.2を，0.3.37はdecisions 0.1を実装した）。

- `cadl.decisions.DecisionChain` は記録を書き，`cadl decisions-verify RECORD.jsonl` は記録を検査する。
  エラーL-1〜L-8と，バージョンのCADLファイル（`version` の項目の `.cadl` の添付と，`--version` で渡した
  ファイル）に対するL-9〜L-11を報告する。L.6の指摘を報告し，検査できなかったものを挙げる。値が比べる
  値の1%以内なら `unchanged` とみなす。`--key`，`--run-id`，`--anchor` は `cadl audit-verify` と同じで
  ある。`"cadl-decisions/1"` と `"cadl-decisions/2"` の記録も読む（L.11）。書き手が `layers` と
  `fulfilled_by` を省いたときは，`null` を補う。委任のもとで行った判断ごとに，その委任を示す。
- cadl-robot-town（v0.4.0から）は，`town.steward` と `town.council` の実行ごとに `decisions.jsonl` を
  書き出す。運営者は規則と契約について判断し，規制については別の当事者である規制の担当者が，別の判断要求
  で判断する。`--decider llm` では，`--delegate` で与えた層について，LLMが人間に代わって判断要求に答え，
  `on_behalf_of` を持つ当事者として記録される。測り直す約束は，その期の測定を `same_method_as` に挙げ，
  stewardが次の期にその測定を行う。v0.5.0からは，最初のバージョンを含むバージョンの項目が，改正拡張
  （付録K：改正してよいパラメータ，その場所と範囲，層ごとに誰が決めるか）を書いたそのバージョンのCADL
  ファイルを添付するので，検証者はL-9〜L-11と投票の結果を検査する。stewardとcouncilは，運営者に代わって
  規則の変更を採択する。規制の案は，その値をその期の測定と投票に当てはめて測る。約束は，測定，案，判断の
  どれがそれを果たすかを示す。v0.6.0からは，記録の初めに運営者（と規制の担当者）の委任を書く。stewardと
  councilには規則の層を自分の規則で決めること（`automatic`）を，LLMには `--delegate` で与えた層を任せる。
  規制の案は，それまでの期に測ったすべての案にも当てはめ，会社ごとに，その会社が反対したのに投票を通る
  案の数を測定に残す。約束の問いは，期限が来たら判断する者に渡し，最後の期には残った問いをすべて渡す。
  `python -m town.check_examples` は，継続的インテグレーションで見本をもう一度実行し，履歴，GSN，指摘を
  比べる。
- cadl-explorer（v1.5.0から）のページDecision Evidenceは，記録を読み，`cadl.decisions` で検証し，
  当事者の時系列，各判断の経緯，当事者ごとの証拠，L.8のGSN，指摘，連鎖を示す。v1.6.0からは，判断した者の
  層と，約束が果たされたかを示す。v1.7.0からは，記録とともにバージョンのCADLファイルを受け取り，それで
  L-9〜L-11を検査する。v1.8.0からは，委任と，それぞれのもとで行った判断を挙げ，時系列とGSNに示す。

## L.11 後方互換性 {/* #l11-backward-compatibility */}

この形式は新しい。CADLファイルのキーと判定を変えない。K.5は変わらない。K.5の `ref:` が判断の記録の
項目をどう指すかは，L.7が述べる。

decisions 0.3は，decisions 0.2に項目の種類 `delegation` を加え，ヘッダは `"cadl-decisions/3"` を
示す。検証者は `"cadl-decisions/2"` の記録を以前と同じように読む。委任がないので，ほかの当事者に代わって
行った判断はすべて delegated として報告し，その記録の中の `delegation` の項目はエラーである（L-1）。
また，どの形式の記録についても，L-10を判断が採択する改正案に限る。どの判断も採択しないK.3の外の
改正案は，以前はエラーであったが，指摘 not amendable になる。

decisions 0.2は，decisions 0.1に2つのフィールドを加える。当事者の `layers` と，約束の `fulfilled_by` で
あり，ヘッダは `"cadl-decisions/2"` を示す。`"cadl-decisions/1"` の記録はどちらのフィールドも持たない。
検証者は，それを，どの当事者もどの層についても判断でき，どの約束も，それを挙げる後の項目なら何でも果たす
記録として読む。その記録の中の2つのフィールドは受け付けない。
