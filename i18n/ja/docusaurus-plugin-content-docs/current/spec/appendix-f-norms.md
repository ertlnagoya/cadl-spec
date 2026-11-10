---
sidebar_position: 16
title: "付録F. 規範拡張"
description: "規範拡張（norms 0.1）を規定する。義務・許可・禁止・権能を契約の第一級の対象とし，counts-as規則，有界の時相演算子，4値の判定，改正時の規範の継続を定める。"
---

# 付録F. 規範拡張（norms 0.1）

本付録は，CADLの**規範拡張**を規定する。この拡張は，
[付録A.4](./appendix-a-syntax.md#a4-contracts-institution-layer)の生成規則
`contract_def` に2つのキー `norms:` と `counts_as:` を追加し，契約の一部の述語に
有界の時相演算子を追加する。これにより，コア言語では `assume:`，`guarantee:`，
`responsibilities:` のテキストに埋もれていた義務・許可・禁止・権能が，負担者，期限，
時間に沿った状態，違反時の帰結を持つ対象になる。

コア言語（[第5章](./05-language-spec.md)，[付録A](./appendix-a-syntax.md)）は，
これらのブロックを必須と**しない**。
本拡張を実装していないCADL準拠の処理系は，新しいキーを理由にファイルを
拒否してはならない。新しいキーを構文上は受理し，*情報レベル*の診断を出すことが望ましい。

本拡張のバージョンは，コア言語とは独立に管理する。拡張の名前は `norms` であり，
本付録はバージョン `0.1` を記述する。F.4の時相演算子は一部の述語の読み方を変えるため，
本拡張を用いるファイルは，[付録A.2](./appendix-a-syntax.md#a2-top-level-structure)の
`extensions:` キーでそのことを宣言しなければならない。宣言せずに用いた場合に処理系がどう扱うかは
F.11で述べる。

```yaml
sos:
  ...
  extensions:
    - norms: 0.1
```

本拡張は，SoS-DSL拡張（[付録E](./appendix-e-sos-dsl.md)）と併用しても，単独で用いてもよい。
契約が `lifecycle:` ブロックも持つ場合，規範は違反時に契約インスタンスをライフサイクルの状態へ
移すことができる（F.3）。

## F.1 動機

[9.6節](./09-research.md)の研究方向は，次の4つの欠落を挙げている。本拡張のバージョン0.1は，
そのそれぞれへの最初の一歩である。

1. **規範が第一級でない。** `"delivery_time <= 300s"` のような保証は，何が成り立つべきかを述べるが，
   誰がそれを成り立たせるのか，いつからいつまでか，成り立たなかったときに何が起こるかを述べない。
   Symboleoのような義務論理に基づく契約言語は，義務と権能をライフサイクルを持つ対象として扱う
   [[Sharifi+, 2020]](./appendix-b-references.md)。CADLの契約はそうではなかった。
2. **述語に時間がない。** `assume:` と `guarantee:` は状態述語である。期限は，SoS-DSL拡張の
   ライフサイクル遷移にしかない。
3. **プロトコルと契約がつながっていない。** プロトコルのメッセージが契約上の行為と*みなされる*
   （counts as）ことを述べる手段がない。制度は，このようにして他の事実から制度的事実を作り出す
   [[Boella & van der Torre, KR 2004]](./appendix-b-references.md)。
4. **改正が動作中の規範に及ばない。** SoSの運用中に契約を改正する場合（ハンズオン教材の
   [Course D](../handson/robot-town-tutorial.md) のように），すでに発効している義務がどうなるかを
   述べる手段がない。

norms 0.1は意図して小さく保つ。語彙と静的・動的意味論を定めることで，設計時の検査
（モデル検査器への変換）と実行時の監視を，言語を変えずに処理系が追加できるようにする。
制度パラメータα，β，λには，規範に関する形式的な意味をまだ与えない（F.7）。

## F.2 概念

| 概念 | norms 0.1での意味 |
| --- | --- |
| **規範（norm）** | 契約に宣言する，1人の負担者の義務・許可・禁止・権能。 |
| **義務（obligation）** | 負担者は，その `content` を実現しなければならない（述語を真にする，または事象を起こす）。`deadline:` があればその期限までに。 |
| **禁止（prohibition）** | 負担者は，規範が発効している間（`deadline:` があればその期間内），その `content` を実現してはならない。 |
| **許可（permission）** | 負担者は，その `content` を実現してよい。許可は違反されることがなく，許されていることを記録する。 |
| **権能（power）** | 負担者は，契約の他の規範の状態を変える制度上の行為（その `content`）を行うことができる（`effects:`）。権能は履行も違反もされない。 |
| **制度的事象（institutional event）** | `counts_as:` 規則がメッセージや条件から作る，契約の名前付きの事象。たとえば「このメッセージは再割当てとみなす」。 |
| **契約インスタンス** | [付録E](./appendix-e-sos-dsl.md)と同じく，契約の1回の実行。いつ始まりいつ終わるかはF.5で述べる。 |
| **規範インスタンス** | 1つの契約インスタンスにおける規範。バージョン0.1では，各規範は1つの契約インスタンスにつきちょうど1つのインスタンスを持つ。`ROBOT[i]` の `i` のような添字は契約インスタンスが束縛する。 |
| **判定（verdict）** | これまでに観測したトレース上での，規範インスタンスまたは時相的な保証の値。`pending`，`fulfilled`，`violated`，`excused` のいずれか（F.5）。 |

## F.3 構文（A.4へのEBNFの追加）

文法は[付録A](./appendix-a-syntax.md)の記法に従う。`identifier`，`actor_ref`，
`duration_lit`，`predicate`，`text` は付録Aで，`message_event` と `severity` は
[付録EのE.3節](./appendix-e-sos-dsl.md)で定義している。`contract_def` に2つの省略可能なキーを追加する。

```ebnf
contract_def    = ... ,
                  [ "norms:"     , { "-" , norm_def } ] ,
                  [ "counts_as:" , { "-" , counts_as_def } ] ;

norm_def        = "id:"           , identifier ,
                  "kind:"         , norm_kind ,
                  "bearer:"       , actor_ref ,
                  [ "counterparty:" , actor_ref ] ,
                  [ "trigger:"      , norm_event ] ,
                  [ "until:"        , norm_event ] ,
                  "content:"      , norm_content ,
                  [ "deadline:"     , duration_lit ] ,
                  [ "on_violation:" , norm_violation ] ,
                  [ "effects:"      , power_effects ] ,
                  [ "on_amendment:" , amendment_policy ] ;
norm_kind       = "obligation" | "permission" | "prohibition" | "power" ;

norm_event      = message_event | identifier | predicate ;    (* string *)
norm_content    = message_event | identifier | tpredicate ;   (* string *)

norm_violation  = [ "severity:"   , severity ] ,
                  [ "sanction:"   , text ] ,
                  [ "reparation:" , identifier ] ,
                  [ "transition:" , identifier ] ;

power_effects   = [ "activate:"  , { "-" , identifier } ] ,
                  [ "suspend:"   , { "-" , identifier } ] ,
                  [ "resume:"    , { "-" , identifier } ] ,
                  [ "discharge:" , { "-" , identifier } ] ;

amendment_policy = "carry_over" | "discharge"
                 | ( "transform:" , identifier ) ;

counts_as_def   = "when:"    , ( message_event | predicate ) ,
                  "creates:" , identifier ,
                  [ "if:"      , predicate ] ;
```

`norm_event` と `norm_content` は次のように読む。`A -> B : m` の形の文字列は `message_event` である。
1つの識別子だけからなる文字列は，契約が `counts_as:` でその名前の制度的事象を宣言していれば
その事象を名指し，そうでなければ述語（状態変数，N-8）である。それ以外の文字列は述語
（`norm_event`）または `tpredicate`（`norm_content`）である。より大きな述語の中に現れる
制度的事象の名前（`reassignment AND x > 0`）は，事象ではなく状態変数である。`[`，`]`，`*`，`->`，
`": "` を含む値は，[付録A](./appendix-a-syntax.md)のすべてのスカラーと同じく，引用符で囲むことが
望ましく，フロー形式のシーケンスの中では囲まなければならない。

これらの述語では，[付録EのE.4節](./appendix-e-sos-dsl.md#e4-static-semantics)の予約識別子を
`rule` と同じく用いることができる。`now`，`request`，および契約が `lifecycle:` ブロックを持つ場合の
`state` である。E.3の所属判定 `x IN [a, b]` も用いることができる。

`on_violation:` の `reparation:` は，この規範が違反されたときに発効する同じ契約の別の規範
（反義務（contrary-to-duty）の規範）を名指し，`sanction:` は制裁をテキストで述べ，
`transition:` は契約の `lifecycle:` ブロック（[付録E](./appendix-e-sos-dsl.md)）の状態を名指す。
契約インスタンスは，ライフサイクル遷移の `on_violation.transition` と同じく，その状態へ移る。
`severity:` の既定値は `Major`，`on_amendment:` の既定値は `carry_over` である。
`counterparty:` は規範の相手方となる当事者を名指す。バージョン0.1では参考情報であり，
意味論には影響しない。

キー `until:` と，F.4の時相演算子 `until(...)` は別のものであり，同じ規範の中に両方現れてよい。

## F.4 時相述語

`tpredicate` は，[付録AのA.10節](./appendix-a-syntax.md#a10-expressions)の `predicate` のうち，
`function_call` が書ける位置に次の3つの有界の時相演算子を書けるものである。
演算子は関数呼び出しの形で書くため，A.10の式の文法は変わらない。本拡張はこの3つの名前に意味を与える。

```ebnf
tpredicate      = predicate ;     (* 以下の呼び出しが時相的な意味を持つ *)
temporal_call   = "within"     , "(" , duration_lit , "," , tpredicate , ")"
                | "throughout" , "(" , duration_lit , "," , tpredicate , ")"
                | "until"      , "(" , tpredicate , "," , tpredicate , "," , duration_lit , ")" ;
```

| 演算子 | 時刻 t で成り立つ条件 | 計量時相論理 |
| --- | --- | --- |
| `within(d, p)` | `[t, t + d]` のある時刻で `p` が成り立つ | F<sub>[0,d]</sub> p |
| `throughout(d, p)` | `[t, t + d]` のすべての時刻で `p` が成り立つ | G<sub>[0,d]</sub> p |
| `until(p, q, d)` | `[t, t + d]` のある時刻 t′ で `q` が成り立ち，`[t, t′)` のすべての時刻で `p` が成り立つ | p U<sub>[0,d]</sub> q |

演算子は**時刻付きトレース**の上で評価する。これは観測の列であり，各観測は観測量のスナップショットと
単調非減少の時刻印からなる。[付録E](./appendix-e-sos-dsl.md)のモニターに渡されるものと同じである。
「ある時刻」「すべての時刻」は，時刻印がその区間に入る観測の上を動く（点ごとの意味論）。
観測を1つも含まない区間では，`within` は偽，`throughout` は真になる。`d` は0より大きい
`duration_lit` でなければならない。演算子は入れ子にしてよい。

**書ける位置。** 本拡張を宣言すると，時相演算子は，契約の `assume:` と `guarantee:` の項目，
および規範の `content:` にだけ書ける。バージョン0.1では，ファイルのそれ以外の述語や条件には
書いてはならない（N-10）。たとえば，規範の `trigger:` と `until:`，`counts_as:` 規則の `when:` と
`if:`，モニターの `rule:`，ライフサイクルの `when:` と `on:`，`condition:`，`safety_invariant:`，
`formula:`，`expr:`，プロトコルの条件である。事象と条件は1つの観測の時点で評価するため，そこに未来を参照する演算子を
書くと，後になるまで真偽が決まらないからである。

**評価する時点。** `assume:` または `guarantee:` の `tpredicate` は，契約インスタンスが始まる時刻に
評価する。そこでの `within(300s, p)` は「契約インスタンスの開始から300秒以内に `p`」を意味する。
不変条件を述べるには `throughout` を用いて書く。`content:` の `tpredicate` は，規範の発動後の
観測の時刻に評価する（F.5）。時相演算子を含まない述語は，コア言語での意味を保つ。

`norms: 0.1` を宣言していないファイルは，コア言語と同じく，`within`，`throughout`，`until` を
ふつうの関数名として読む。

## F.5 動的意味論

### 契約インスタンス

規範は契約インスタンスごとに判定する。契約が `lifecycle:` ブロックを持つ場合，契約インスタンスは
[付録EのE.5節](./appendix-e-sos-dsl.md)のものである。ホストアプリケーションがインスタンスを生成し，
インスタンスは終端状態に達したときに**終わる**。契約が `lifecycle:` ブロックを持たない場合，
ホストアプリケーションは同じようにして，状態を持たない契約インスタンスを生成し，終わらせる。
ホストがない場合は，1つのインスタンスが最初の観測で始まり，最後の観測で終わる。
契約インスタンスがまだ動作している間に止まったトレースは*前半部分*であり，インスタンスは終わっておらず，
何も確定させない。

述語は，各観測で，真，偽，**未定義**の3つの値のいずれかを取る。未定義とは，まだ値を持たない量を
参照している場合である。`AND`，`OR`，`NOT` はクリーネの3値論理に従う。未定義の述語は，成り立ちも
破れもしない。事象や条件はそれによって起こらず，仮定や保証はそれによって決まらない。
「真になる」とは，現在の観測で真であり，かつインスタンスの直前の観測で真でなかった（または直前の
観測がない）ことをいう。`lifecycle:` ブロックを持つ契約では，述語の中の `state` は，現在の観測の
遷移が起こる前のライフサイクルの状態である。

### 規範インスタンス

規範インスタンスは，次の6つの状態のいずれかにある。

| 状態 | 意味 |
| --- | --- |
| `inactive` | まだ発効していない。 |
| `active` | 発効中。義務または禁止が判定されている。 |
| `suspended` | 一時的に発効していない（権能による）。期限と期間の時計は止まる。 |
| `fulfilled` | 内容が期限内に実現された義務，または内容が起こらないまま期間が閉じた禁止。 |
| `violated` | 内容が実現されないまま期限が過ぎた義務，または内容が起こった禁止。 |
| `discharged` | 履行も違反もされずに終わった。`until:`，権能，契約インスタンスの終了，または改正（F.6）による。 |

`fulfilled`，`violated`，`discharged` は最終状態である。バージョン0.1では，規範インスタンスは
1つの契約インスタンスにつき高々1回判定される。規範インスタンスが `inactive` でないときに
起こった発動条件は無視し，禁止は最初の違反だけを報告する。

1. **発動。** 規範インスタンスは `inactive` で始まり，次のときに `active` になる。
   - その `trigger:` が起こったとき（メッセージが送られる，制度的事象が作られる，または述語が真になる）。
   - `trigger:` を持たず，他の規範の `reparation:` にも権能の `activate:` の効果にも名指されていない
     規範については，契約インスタンスが始まったとき。
   - それが修復する規範が違反されたとき（`reparation:`），または権能がそれを発効させたとき（`activate:`）。

   **発動時刻**は，規範が発効した観測の時刻印である。
2. **義務。** 発効中の義務は，発動時刻以降の観測のうち，その `content` が起こる（メッセージまたは
   制度的事象）か成り立つ（その観測の時点で評価した `tpredicate`）最初の観測で `fulfilled` になる。
   発動時刻から `suspended` の間の時間を除いて測った `deadline:` が，そうならないまま過ぎると
   `violated` になる。ちょうど期限の時刻の内容は期限内とし，義務が `suspended` である間の内容は数えない。
違反は，期限の後の最初の観測で起こる。内容が時相演算子を含む `tpredicate`
   である場合，ある観測での値は後になって決まることがある。義務は値が決まるまで `pending` にとどまり，
   期限までの観測だけを数える。
3. **禁止。** 発効中の禁止は，その `content` が起こるか成り立つ最初の観測で `violated` になる。
   発動時刻から `suspended` の間の時間を除いて測った `deadline:` の期間が閉じると `fulfilled` になる。
   ちょうど期間の終わりの時刻の内容は違反とする。停止中の禁止は判定しない。
4. **許可と権能。** 解除されるまで `active` にとどまる。
5. **解除。** `active` または `suspended` の規範インスタンスは，期限にかかわらず，その `until:` が
   起こったとき，または権能がそれを解除したときに `discharged` になる。
6. **契約インスタンスの終了。** 契約インスタンスが終わると，最終状態でないすべての規範インスタンスを
   確定させる。`deadline:` のない発効中または停止中の義務は `violated` に，期限がまだ過ぎていない
   義務は `discharged` に，禁止は `fulfilled` に，`inactive` のものを含むそれ以外の規範インスタンスは
   `discharged` になる。例外が2つある。インスタンスが終わる観測で発効した規範インスタンスは，
   一度も判定されていないため `discharged` になる。内容の `tpredicate` の値がまだ決まっていない
   義務または禁止は，そのままの状態にとどまり，判定は `pending` である。この確定によって生じた違反は，
   その重大度とともに報告するが，インスタンスが終わっているため，`reparation:` と `transition:` は
   適用しない。
7. **権能。** メッセージから作られた制度的事象は，そのメッセージの送信者が*行った*ものとする。
   述語から作られた制度的事象には行為者がいない。発効中の権能の負担者がその `content`（制度的事象，
   または負担者が送るメッセージ）を行うと，`effects:` が同じ契約インスタンスの規範インスタンスに
   適用される。`activate` は未発効の規範を発効させ，`suspend` は発効中の規範を停止し，`resume` は
   停止中の規範を発効に戻し，`discharge` は発効中または停止中の規範を `discharged` にする。
   他の状態にある規範への効果は何もしない。行為者の対応する権能が発効していないときにその行為が
   行われた場合，効果は適用されない（制度的事象そのものは他の規範に対して存在する）。規範を監視する
   処理系は，その行為を権限のない行為として記録することが望ましい。
8. **違反。** 規範インスタンスが `violated` になると，その `on_violation:` が適用される。
   指定の `severity:`（既定値 `Major`）で，規範の `id` をラベルとする違反が報告され，
   `reparation:` の規範が発動し，`transition:` があり，かつ契約インスタンスがまだ終端状態に
   なければ，契約インスタンスはその状態へ移る。

### Counts-as

`counts_as:` 規則は，その `when:` が起こり（メッセージが送られるか，述語が真になる），
その観測で `if:` の条件（あれば）が成り立つと，契約インスタンスにその制度的事象を作る。
制度的事象は契約インスタンスに局所的である。制度的事象は事象としてのみ存在し，規範を発動させ，
終わらせ，履行させることができ，権能の内容になる。

### 1つの観測の中での順序

1つの観測が運ぶ1つのメッセージが，制度的事象を作り，ある規範を発動させ，別の規範を履行させ，
ライフサイクル遷移を起こすことがある。処理系は次の順に，それぞれ直前の段階が残した状態に対して適用する。
段階1の前に，契約の `assume:` の項目，次に `guarantee:` の項目を評価する。したがって，ある観測で
破れた仮定は，その観測での違反を免責する。また，インスタンスの最初の観測では，それより前に，
インスタンスの開始時に発効する規範を発効させる。

1. `counts_as:` 規則の制度的事象を作る。
2. 権能の効果を適用する（7）。権能は宣言の順に，1つの権能の中では `activate`，`suspend`，`resume`，
   `discharge` の順に適用する。権能が発効しているかどうかは，この段階の初めに決める。
3. 発動条件が起こった規範を発動させる（1）。
4. 発効中の規範を判定する。各規範について，過ぎた期限，内容，`until:` の順に調べる（2，3，5）。
   したがって，同じ観測では，期限切れによる違反が解除より先になり，内容が `until:` より先になる。
   段階3で発動した規範もこの段階で判定するため，発動時刻の内容も数える。
5. `on_violation:` を適用する（8）。ここで発動した修復の規範は，次の観測で初めて判定する。
6. [付録E](./appendix-e-sos-dsl.md)のライフサイクル遷移を起こし，契約インスタンスが終わっていれば
   その規範を確定させる（6）。

### 判定

これまでに観測した有限のトレース上での，規範インスタンス，または時相演算子を含む保証の**判定**は，
次の4つの値のいずれかである。

| 判定 | 規範インスタンス | 契約の保証 |
| --- | --- | --- |
| `pending` | `inactive`，`active`，`suspended` | 観測した前半部分では決まらない |
| `fulfilled` | `fulfilled` または `discharged` | 前半部分のどの続きでも成り立つ |
| `violated` | 契約の仮定が1つも破れていない間に `violated` になった | どの続きでも成り立たず，その時点で仮定が1つも破れていなかった |
| `excused` | 契約の仮定が破れた観測以降に `violated` になった | 仮定が破れた観測以降に成り立たなくなった |

仮定は，その値が偽になる最初の観測で**破れる**。値がまだ決まらない仮定や，値が未定義の仮定は
破れていない。時相演算子を含まない `assume:` または `guarantee:` の項目は状態述語であり，すべての観測で
評価する。偽である最初の観測で破れ，契約インスタンスが終わるまで破れなかった保証は `fulfilled` になる。
状態述語と時相演算子が混ざった項目は `tpredicate` であり，インスタンスの開始時に1回評価する。
仮定がいったん破れると，同じ契約インスタンスの以後の違反はすべて `excused` になる。保証や規範が
`excused` になるのは，仮定が破れたときではなく，それ自身が破れたときである。解除された許可や
権能の判定は `fulfilled` とする。F.2の意味で履行されたわけではない。期限切れによる違反が
`violated` か `excused` かは，期限の時刻ではなく，違反が起こる観測で判定する。トレースが終わっても，
`pending` の判定は `pending` のままである。期限や区間の終わりより前に止まったトレースは，
それを決めない。区間がまだ終わっていない時相的な項目は，契約インスタンスが終わっても決まらない。

`excused` は，「負担者が果たさなかった」ことと「契約が仮定するものを負担者が与えられなかった」ことを
区別する。これは，義務論理に基づく実行時検証で責任を割り当てる基礎である
[[Kharraz+, ICTAC 2023]](./appendix-b-references.md)。仮定を考慮することで，監視できる性質も増える
[[Henzinger & Saraç, RV 2020]](./appendix-b-references.md)。バージョン0.1は，仮定のこの弱い読み方を
用いる。仮定が成り立たなくなった後もしばらく保証が成り立たなければならないという
[5.4.1節](./05-language-spec.md)の強い読み方は，バージョン0.1の判定では表さない。
`excused` となった規範も，その `on_violation:` は発動する。契約インスタンスへの帰結は
責任の所在に依存しないためである。報告される違反は，判定 `excused` を伴う。

## F.6 改正

**改正**とは，契約インスタンスの動作中に，契約の定義を同じ `id` を持つ新しい版で置き換えることである。
版をどう作り，承認し，発効させるかはnorms 0.1の範囲外である。ハンズオン教材の
[Course D](../handson/robot-town-tutorial.md) はその手続きの1つを示している。新しい版は，ある観測で，
その観測で他の何を評価するよりも前に発効する（仮定と保証の評価，およびF.5の段階1よりも前）。
したがって，改正によって発効した規範は，その同じ観測で判定する。規範インスタンスは次のように扱う。

`active` または `suspended` の規範インスタンスは，**旧い**版の規範の `on_amendment:` に従う。

| `on_amendment:` | 効果 |
| --- | --- |
| `carry_over`（既定値） | インスタンスは，新しい版の同じ `id` の規範のもとで続く。状態と，期限に対してすでに経過した時間を保つ。新しい版にその `id` の規範がない場合，またはその規範の `kind` が異なる場合は，代わりに `discharged` になる。内容が変わる場合，インスタンスはこの観測以降，新しい内容で判定する。経過した時間がすでに新しい期限を超えている場合（ちょうど等しい場合は超えていない），義務は，停止中のものも含めて，新しい版の発効時に `violated` になる。禁止は期間が閉じたことになり，`fulfilled` になる。 |
| `discharge` | インスタンスは `discharged` になる。 |
| `transform: X` | インスタンスは `discharged` になり，新しい版の規範 `X` が `inactive` であればそれを発動させる。経過した時間は期限に算入する（義務と禁止の場合。許可と権能では時間は影響しない）。`X` が `inactive` でなければ，それ以上は何もしない。 |

表の各項目は，旧い版が規範を宣言している順に，新しい規範を発効させる前に適用する。
`transform:` の対象 `X` が新しい版にない場合，インスタンスは `discharged` になるだけである。

`inactive` の規範インスタンスは，新しい版の同じ `id` の規範の定義を引き継ぎ，新しい版にその規範が
なければ取り除かれる。新しい定義が `trigger:` を持たなくても，改正によって発効することはない。
旧い版にその `id` の規範がないものを*新しい*規範という。新しい規範は `inactive` から始まり，
`trigger:` を持たず，修復や発動の対象でもなければ，ただちに発効する（F.5の1）。最終状態のインスタンス
（`fulfilled`，`violated`，`discharged`）は影響を受けず，その `id` は同じ契約インスタンスの中で
再び使わない。最終状態のインスタンスと同じ `id` を持つ新しい版の規範には，新しいインスタンスを
作らない。特に，違反は，それが起きた版のもとでの違反のままである。改正の後に起きた違反には，
新しい版の `on_violation:` を用いる。

新しい版の `counts_as:` 規則は，その発効時から適用する。両方の版でテキストが同じ `assume:` または
`guarantee:` の項目は，その値を保って続く。新しい項目はこの観測から評価する（`tpredicate` はこの観測で
評価する）。取り除かれた項目は，それまでの判定を保つ。改正の前に破れた仮定は，以後の違反を
引き続き免責する。契約が `lifecycle:` ブロックを持つ場合，インスタンスの現在の状態は新しい版の状態で
なければならない。そうでなければ，そのインスタンスに改正を適用できない。バージョン0.1では，
モード遷移（A.7）は規範インスタンスに影響しない。

改正を適用する処理系は，新しい版が発効する前に，引き継がれる規範のうち `content` または
`deadline:` が変わるものをすべて報告することが望ましい。

## F.7 静的意味論 {/* #f7-static-semantics */}

規範拡張を扱う処理系は，既存の検査に加えて，次の検査をしなければならない。

- **N-1.** 規範の `id` は識別子でなければならず，予約語（[付録E](./appendix-e-sos-dsl.md)の `IN` を
  含む）であってはならず，契約の中で一意でなければならない。`creates:` の名前は識別子でなければならず，
  同じ契約の規範の `id` と同じであってはならない（YAML 1.1のローダーでは，引用符のない `yes`，`no`，
  `on`，`off` は名前ではなく真偽値になる。[A.12](./appendix-a-syntax.md#a12-reference-implementation-status-v03)を参照）。
- **N-2.** `kind:` は `obligation`，`permission`，`prohibition`，`power` のいずれかでなければならない。
- **N-3.** `bearer:` と `counterparty:` は，宣言済みの1つのアクターを，添字なしで，整数の添字付きで
  （`ROBOT[1]`），または契約インスタンスが束縛する添字付きで（`ROBOT[i]`）名指さなければならない。ワイルドカードや範囲（`ROBOT[*]`，
  `ROBOT[1..3]`）は許されない。契約の当事者を名指すことが望ましい。
- **N-4.** `deadline:` は `duration_lit` でなければならず，義務または禁止にだけ書ける。
  `on_violation:` も義務または禁止にだけ書ける。
- **N-5.** `effects:` は権能にだけ書け，権能は少なくとも1つの効果を持たなければならない。
  `effects:` の各名前は，権能自身以外の，同じ契約の規範の `id` でなければならない。
- **N-6.** `on_violation.reparation` は，`trigger:` を持たない，同じ契約の義務または禁止を
  名指さなければならない。どの規範から `reparation:` をたどっても，その規範に戻ってはならない。
- **N-7.** `on_violation.transition` は，同じ契約の `lifecycle.states` にある状態を名指さなければ
  ならない。したがって，その契約は `lifecycle:` ブロック（[付録E](./appendix-e-sos-dsl.md)）を
  持たなければならない。
- **N-8.** `trigger:`，`until:`，`content:` の全体として用いた識別子が，契約の制度的事象ではなく
  規範の `id` であるときは，誤りの可能性が高いため，処理系は警告することが望ましい。
- **N-9.** 規範または `counts_as:` 規則の `message_event` では，送信者と受信者は宣言済みのアクターを
  名指さなければならない。権能の内容は，それを作るすべての `counts_as:` 規則が `message_event` から
  作る制度的事象，または送信者が負担者である `message_event` でなければならない。内容が `message_event` である義務または禁止では，
  送信者は負担者であることが望ましい。
- **N-10.** 時相演算子はF.4の引数を持たなければならず，その期間は0より大きい `duration_lit`
  でなければならず，F.4が許す位置の外に現れてはならない。
- **N-11.** `on_amendment:` は，`carry_over`，`discharge`，または識別子 `X` を持つ
  `{ transform: X }` でなければならない（`X` が新しい版に存在するかは，その版に対してしか検査できない）。
- **N-12.** 同じ契約の許可と禁止が，同じ `bearer:` と，テキストとして同一の `content:` を持つ
  ときは，両者が衝突するため，処理系は警告することが望ましい。

### コアの検査との関係

[6.3節](./06-design.md)の無矛盾性検査（SMTソルバーによる `assume:` と `guarantee:` の
充足可能性の検査）は状態述語に適用する。時相演算子を含む `assume:` または `guarantee:` の項目は
状態述語ではない。規範拡張を扱う処理系のうち時相述語を変換しないものは，そのような項目をSMT検査から外し，
外したことを報告しなければならない。演算子を解釈されない関数として扱ってはならない。

### 制度パラメータとの関係（参考）

[5.4.2節](./05-language-spec.md)のパラメータには，バージョン0.1では規範に関する形式的な意味を
与えない。後の版で明確にする予定の読み方（[9.6節](./09-research.md)のRD-6.1）は次のとおりである。
意思決定の集中度βは，契約の権能を誰が持つかを表す。情報共有度αは，他の当事者がどの発動条件と
内容を観測できるかを表す。インセンティブ強度λは，違反された規範の制裁の大きさを調整する。

## F.8 例

次の契約は，[付録EのE.6節](./appendix-e-sos-dsl.md)の配送契約を簡略にし，規範を加えたものである。
[`cadl`](https://github.com/ertlnagoya/cadl) リポジトリの `examples/norms_robot_delivery.cadl`
から取り，一部を省略している。

```yaml
sos:
  name: "RobotDeliveryNorms"
  extensions:
    - sos-dsl: 0.1
    - norms: 0.1
  # アクター DISPATCHER，ROBOT[1..N]，CUSTOMER[1..M] は付録Eと同じ

  contracts:
    - id: DELIVERY_SLA
      parties: [DISPATCHER, "ROBOT[*]", "CUSTOMER[*]"]
      assume:
        - "throughout(300s, DISPATCHER.is_operational == true)"
      guarantee:
        - "within(300s, ROBOT[i].status == Delivered)"

      lifecycle:
        states:   [Proposed, Assigned, Delivering, Completed, Violated]
        initial:  Proposed
        terminal: [Completed, Violated]
        transitions:
          - { id: assign,   from: Proposed,   to: Assigned,   on: "DISPATCHER -> ROBOT[i] : route_assignment" }
          - { id: start,    from: Assigned,   to: Delivering, on: "ROBOT[i].status == InTransit" }
          - { id: complete, from: Delivering, to: Completed,  on: "ROBOT[i].status == Delivered" }

      counts_as:
        - when: "DISPATCHER -> ROBOT[i] : replan_command"
          creates: reassignment

      norms:
        - id: acknowledge
          kind: obligation
          bearer: "ROBOT[i]"
          counterparty: DISPATCHER
          trigger: "DISPATCHER -> ROBOT[i] : route_assignment"
          content: "ROBOT[i] -> DISPATCHER : ack(accepted)"
          deadline: 5s
          on_violation:
            severity: Major
            reparation: report_failure
        - id: report_failure
          kind: obligation
          bearer: "ROBOT[i]"
          counterparty: DISPATCHER
          content: "ROBOT[i] -> DISPATCHER : failure_report"
          deadline: 2s
          on_violation:
            severity: Critical
            transition: Violated
        - id: no_low_battery_driving
          kind: prohibition
          bearer: "ROBOT[i]"
          content: "ROBOT[i].battery < 10 AND ROBOT[i].status == InTransit"
          on_violation:
            severity: Critical
            sanction: "removed from the dispatch pool for one period"
        - id: may_return_to_charge
          kind: permission
          bearer: "ROBOT[i]"
          content: "ROBOT[i] -> DISPATCHER : charging_request"
        - id: reassign
          kind: power
          bearer: DISPATCHER
          content: reassignment
          effects:
            discharge: [acknowledge, report_failure]
          on_amendment: discharge
```

`acknowledge` は経路の割当てで発動し，5秒以内に果たさなければならない。これが違反されると，
ロボットは2秒以内に故障を報告しなければならない（反義務の義務 `report_failure`。それまでは
`inactive` のままである）。これも果たせないと，契約インスタンスは `Violated` へ移る。
`no_low_battery_driving`，`may_return_to_charge`，`reassign` は発動条件を持たず，契約インスタンスの
開始時から発効している。配車係の `replan_command` は配車係が行う `reassignment` とみなされ，
権能 `reassign` が発効している間は，2つの義務をどちらも解除する。各規範は契約インスタンスごとに
1回しか判定されないため，同じインスタンスで後から経路の割当てがあっても新しい義務は生じない。
保証は，ロボットが契約インスタンスの開始から300秒以内に配送することを述べる。遅れた配送より前に
配車係が動作を止めた場合，その配送は `violated` ではなく `excused` になる。

## F.9 中間表現（IR）への追加

シミュレータIR（E.7）の `institution.contracts` の各契約に，`norms` と `counts_as` の
2つのフィールドを追加する。E.7と同じく，IRはデータクラスをそのまま直列化したものであり，
入れ子のブロックを平らにする。

```jsonc
{
  "norms": [
    { "id": "acknowledge",
      "kind": "obligation",
      "bearer": "ROBOT[i]",
      "counterparty": "DISPATCHER",
      "trigger": "DISPATCHER -> ROBOT[i] : route_assignment",
      "until": null,
      "content": "ROBOT[i] -> DISPATCHER : ack(accepted)",
      "deadline_ms": 5000,
      "on_violation_severity": "Major",
      "on_violation_sanction": null,
      "on_violation_reparation": "report_failure",
      "on_violation_transition": null,
      "effects_activate": [],
      "effects_suspend": [],
      "effects_resume": [],
      "effects_discharge": [],
      "on_amendment": "carry_over",
      "transform_to": null }
  ],
  "counts_as": [
    { "when": "DISPATCHER -> ROBOT[i] : replan_command",
      "creates": "reassignment",
      "if": null }
  ]
}
```

`trigger`，`until`，`content`，`when`，`if` は，E.7の規則と同じくテキストのまま保持する。
キー `if` は，直列化したIRでは `if` と書く。ホスト言語によっては，データクラスのフィールドにこの名前を付けられない。
`on_violation_severity` は，`on_violation:` ブロック全体を省略したときは `null`，
`severity:` なしでブロックがあるときは `Major` である。`on_amendment` は常に値を持ち，`carry_over`，`discharge`，
`transform` のいずれかである。`transform_to` は `transform:` の対象であり，それ以外のときは `null` である。
`norms` と `counts_as` は，それらを持たない契約では空のリストである。

## F.10 リファレンス実装の状況 {/* #f10-reference-implementation-status */}

リファレンス実装（`cadl` 0.3）は，`cadl` 0.3.19からnorms 0.1を次のように実装する。

- `cadl` は `norms:`，`counts_as:`，およびF.4の時相演算子を構文解析し，`cadl check` で
  規則N-1からN-12を適用し（N-8とN-12，およびN-3とN-9の「望ましい」は警告とする），
  両ブロックをF.9のIRへ変換する。
- `cadl verify` のSMT検査は，時相演算子を含む `assume:` と `guarantee:` の項目を外し，
  それぞれを検査しなかったものとして報告する（F.7）。`cadl codegen` は，同じ項目をすべてのターゲットの
  生成コードから外し，コードにコメントを残して警告を出す。時相演算子は変換しない。
- 規範の数値の `deadline:` は秒として読む。これは，[A.12](./appendix-a-syntax.md#a12-reference-implementation-status-v03)が
  ライフサイクルの期限について述べる寛容な形式である。`cadl check` は，F.4に挙げた位置で時相演算子を探す。
  テキストである `violation.detect`，`incentives.rules`，プロトコルの `trigger:`，`context.assumptions` の中は探さない。
- `cadl` 0.3.20からは，`cadl norms-eval` が，記録したトレース（JSON Lines。1行に1つの観測。形式は
  `cadl` リポジトリのREADMEに示す）から，1つの契約インスタンスについて，F.5の規範の状態，判定，違反，
  制度的事象，権限のない行為を計算し，トレースが名指すF.6の改正を適用する。ライフサイクルの状態は
  トレースから取り，ライフサイクルの状態機械は実行しない。違反が求める `transition:` は報告するだけで，
  適用しない。時相演算子以外の関数呼び出し，限量子，またはワイルドカード参照を含む規範や項目は
  評価せず，`pending` のままにする。`cadl norms-diff` は，ファイルの2つの版を比べ，F.6が各契約の規範に
  何をするかを報告する。引き継がれる規範のうち `content` または `deadline:` が変わるものと，新しい版に
  ない `transform:` の対象を含む。
- 生成ランタイム（Python，Unity C#）は規範を監視しない。設計時の検査のために規範をモデル検査器へ
  変換する機能は実装していない。

## F.11 後方互換性

本拡張を用いないCADL v0.3のファイルは引き続き有効であり，同じように読まれる。
`norms: 0.1` を宣言せずに `norms:`，`counts_as:`，または時相演算子を用いるファイルは，
本付録に適合しない。規範拡張を扱う処理系は，そのようなファイルでは `within`，`throughout`，`until` を
ふつうの関数名として読み，`norms:` と `counts_as:` のブロックを解釈せず（検査もIRへの変換もしない），
宣言されていない拡張のキーとして報告することが望ましい。本拡張を実装していない処理系は，
そのようなファイルを拒否してはならない。ファイルごとに1つの情報レベルの診断を出すことが望ましい。
