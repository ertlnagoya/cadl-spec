---
sidebar_position: 17
title: "Appendix G: Agent Governance Extension"
description: "Agent governance extension (agents 0.1): binding of actors to agents and tool servers, a deterministic allow / deny / escalate decision computed from the norms of a contract at the message boundary, escalation to a human after a denial, delegation of permissions with a provenance chain, audit records, and boundary-policy code generation."
---

# Appendix G — Agent Governance Extension (agents 0.1)

This appendix specifies the **agent governance extension** to CADL. It
builds on the norms extension ([Appendix F](./appendix-f-norms.md)) and
adds the key `agent:` to `actor_def`
([A.3](./appendix-a-syntax.md#a3-context-actors-metrics)), the keys
`enforcement:` and `delegations:` to `contract_def`
([A.4](./appendix-a-syntax.md#a4-contracts-institution-layer)), and the
key `on_denied:` to `norm_def` (F.3). With them, the permissions and
prohibitions of a contract determine, for every message that arrives at
an enforcement point, one of three **decisions**: `allow`, `deny`, or
`escalate`. The decision is made before the message takes effect, and
it is a function of the message and of the state of the norm instances;
no part of it is left to the judgement of an agent.

The core language does **not** mandate these blocks; a conforming CADL
processor that does not implement the extension MUST NOT reject a file
because of the new keys. It SHOULD accept them syntactically and emit
an *informational* diagnostic.

The extension is named `agents` and this appendix describes version
`0.1`. It **requires** `norms: 0.1`: the norms are what is enforced. A
file that uses it MUST declare both under `extensions:`
([A.2](./appendix-a-syntax.md#a2-top-level-structure)); G.14 says what
a processor does with an undeclared use.

```yaml
sos:
  ...
  extensions:
    - norms: 0.1
    - agents: 0.1
```

## G.1 Motivation

LLM-based agents are becoming constituent systems of SoS, and the
protocols that connect them are being standardised
[[MCP, 2026-07-28]](./appendix-b-references.md)
[[Linux Foundation, A2A 2025]](./appendix-b-references.md). Enforcement
is converging on deterministic checks at the tool-call boundary; for
example, Amazon Bedrock AgentCore Policy authorises tool calls with
Cedar policies and denies by default
[[AWS, AgentCore Policy]](./appendix-b-references.md). What is missing
is the step from an organisational contract (who is allowed to do what,
on whose authority) to such a check. Version 0.1 is a first step on
four research directions of [Section 9.8](./09-research.md):

1. **RD-8.1, compiling contracts to boundary policies.** Nothing in a
   CADL file says which actor is an agent, which message is a tool
   call, and what a generated policy has to decide (G.4, G.5, G.10).
2. **RD-8.2, provenance of delegated authority.** A check that sees
   only the local state cannot tell whether an action reached the
   caller through delegations that its originator was not entitled to
   make. G.7 gives delegated permissions a provenance chain.
3. **RD-8.3, recovery after a blocked action.** A preprint review
   reports a study in which blocking 94% of unsafe actions still left
   fewer than 5% of tasks completed safely and correctly
   [[Dantas+, arXiv 2026]](./appendix-b-references.md). G.6 defines
   escalation to a named actor and a fallback message.
4. **Part of RD-8.4, audit.** Community governance has been found to be
   a layer missing above the protocols
   [[Kang & Diponegoro, arXiv 2026]](./appendix-b-references.md), and a
   governance graph enforced with an append-only audit log constrained
   LLM agents where a prompt-only "constitution" did not
   [[Bracale Syrnikov+, arXiv 2026]](./appendix-b-references.md). G.8
   fixes the format of an audit record.

**Scope of version 0.1.** The extension is small on purpose. It has no
primitives for membership, voting, or the preservation of dissent
(RD-8.4 otherwise remains open, for a later version); it does not
verify plans or the interaction of several agents (RD-8.5), since every
decision concerns one message; it maps no article of any regulation to
CADL; and it does not cover authentication: the sender and the receiver
of a message are taken as given. At the boundary it considers only
norms whose content is a message, and only the sender, the receiver,
and the name of a message, not its arguments.

## G.2 Concepts

| Concept | Meaning in agents 0.1 |
| --- | --- |
| **Tool call** | A message whose receiver is an actor of kind `tool_server` and whose name is one of the `tools:` of that actor. |
| **Enforced contract** | A contract that has the key `enforcement:`. Only enforced contracts take part in decisions. |
| **Enforcement point** | The one logical place where the decision for a message is made, over all enforced contracts of the file. |
| **Decision** | `allow`, `deny`, or `escalate`, computed for one message by the decision function of G.5 before the message takes effect. |
| **Ground** | A prohibition that applies to a message in the decision function. For a hold, grounds are counted per contract instance: a **ground of a hold** is a prohibition in one contract instance in which it applies (G.6). |
| **Hold** | The record of a message whose decision is `escalate`; the message is kept back until the hold reaches a final state (G.6). |
| **Derived instance** | A permission held by a delegate (G.7), with its **provenance chain**: the actors from the bearer of the original permission to the holder, one link per delegation. |
| **Audit record** | What an enforcement point records for one decision (G.8). |

Norm, norm instance, contract instance, institutional event, and
observation have the meaning of [Appendix F](./appendix-f-norms.md).

## G.3 Syntax (EBNF additions to A.3, A.4, and F.3)

The grammar uses the notation of [Appendix A](./appendix-a-syntax.md),
which defines `identifier`, `hyphen_name`, `actor_ref`, `int_literal`,
and `duration_lit`; `message_event` is defined in
[E.3](./appendix-e-sos-dsl.md) and `norm_event` in
[F.3](./appendix-f-norms.md).

```ebnf
actor_def         = ... , [ "agent:" , agent_binding ] ;
agent_binding     = "kind:" , agent_kind ,
                    [ "protocol:" , hyphen_name ] ,
                    [ "tools:"    , { "-" , identifier } ] ;
agent_kind        = "llm_agent" | "tool_server" | "human" | "service" ;

contract_def      = ... ,
                    [ "enforcement:" , enforcement_block ] ,
                    [ "delegations:" , { "-" , delegation_def } ] ;
enforcement_block = [ "default:" , ( "deny" | "allow" ) ] ,
                    [ "point:"   , ( "caller" | "receiver" | "gateway" ) ] ;

norm_def          = ... , [ "on_denied:" , denial_recovery ] ;
denial_recovery   = [ "escalate_to:" , actor_ref ] ,
                    [ "timeout:"     , duration_lit ] ,
                    [ "fallback:"    , message_event ] ,   (* string *)
                    [ "notify:"      , actor_ref ] ;

delegation_def    = "norm:"  , identifier ,
                    "to:"    , { "-" , actor_ref } ,
                    "grant:" , identifier ,
                    [ "revoke:"    , identifier ] ,
                    [ "max_depth:" , int_literal ] ,
                    [ "until:"     , norm_event ] ;        (* string *)
```

- An actor without `agent:` has no agent kind. The kind `tool_server`
  defines tool calls (G.4); `llm_agent`, `human`, and `service` have no
  meaning beyond the static rule that names one of them (G-8) and the
  use generators make of them. `protocol:` (`mcp`, `a2a`, or another
  name) has no default and no effect on decisions. An `agent:` on an
  actor declared with a range applies to every actor of the set.
- A tool name is an `identifier`, because it is the message name of a
  `message_event`. Where the protocol-level name is not an identifier,
  the `mappings:` of a `codegen:` entry (A.9) relates the two.
- A contract is **enforced** when it has the key `enforcement:`; an
  empty mapping or a null value (`enforcement: {}`, or the bare key)
  means "enforced with all defaults". When `default:` is omitted, the
  default decision is `deny` for a tool call and `allow` for every
  other message; when given, it applies to both (G.5).
- `point:` (default `gateway`) is a deployment hint for generators and
  has no effect on the decision. Whatever the deployment, there is one
  logical enforcement point: every governed message is decided once,
  over all enforced contracts, on one state.
- `on_denied:` is allowed only on a prohibition. `timeout:` has no
  default. `fallback:` and `notify:` are data: they are copied into the
  result of the decision (G.10) and have no other effect.
- `max_depth:` defaults to `1`. Without `revoke:` a delegation cannot
  be revoked by a message; without `until:` it has no end of its own.

Keys added, by block: actor — `agent` (`kind` `protocol` `tools`);
contract — `enforcement` (`default` `point`), `delegations` (`norm`
`to` `grant` `revoke` `max_depth` `until`); norm — `on_denied`
(`escalate_to` `timeout` `fallback` `notify`). In an enforced contract
the names `approval` and `rejection` are reserved for the institutional
events of G.6.

## G.4 Messages and tool calls

A **message** has a sender and a receiver, each one concrete actor, a
name, and arguments. It is a **tool call** when its receiver has
`agent.kind: tool_server` and its name is one of that actor's `tools:`;
a message to a tool server with any other name is a call of an
**undeclared tool**; every other message is an **ordinary message**.
The result that a tool server returns is not a separate message in
version 0.1.

At the boundary, a `message_event` `S -> R : e` is **matched** against
a message on three components: the sender, the receiver, and the
message name (the identifier of `e`, or the name of the call).
**Arguments written in `e` are not considered** in version 0.1:
`delete_file` and `delete_file(path)` match the same messages. Each
component is true, false, or **unknown**, and the match is their Kleene
conjunction: false when any component is false, otherwise unknown when
any is unknown, otherwise true. An actor reference matches a concrete
actor as follows:

| Reference | Matches |
| --- | --- |
| `A` | the actor `A`, declared without index; never an indexed member `A[k]` |
| `A[3]`, `A[*]`, `A[1..3]` | `A[3]`; every member of the set `A`; `A[1]` to `A[3]` |
| `A[1..N]` (symbolic bound) | every member of the set `A`; the bounds are not compared |
| `A[i]` | false when the concrete actor is not a member of `A`. Otherwise: exactly `A[v]` when the contract instance binds `i` to `v`, and **unknown** when it binds no value to `i`. |

The table is that of [F.3](./appendix-f-norms.md), which the norms
engine uses for the events of a trace, with two differences. First,
F.3 compares the arguments written in a message event with those of the
message, and the boundary does not consider arguments. Second, where
the contract instance binds no value to `i`, F.3 lets `A[i]` match
every member of the set, and at the boundary the match is unknown and
is resolved fail-closed (G.5). The second difference also holds for the
events of an enforced contract that the norms engine evaluates, and for
the performer of a power (G.5, "Unknown occurrences").

`A[k]` is a **member** of the set `A` when `A` is declared with a range
and `k` lies within its integer bounds (a set declared as `A[1..3]`
does not contain `A[7]`); when the declared upper bound is symbolic,
every index from the lower bound on is a member.

## G.5 Boundary enforcement of norms

### Instances, governed messages, and norms that take part

For an enforced contract without host-created instances, the single
instance of F.5 exists **from the start of the enforcement point**, not
from the first observation; this addition to F.5 lets the first message
be decided. When a host application creates and ends the instances, the
running instances are those it has created and not ended.

Whether an enforced contract **governs** a message `m` is decided
before any instance is considered, so no binding is applied to
`parties:`: a party `A[i]` or `A[*]` matches every member of `A`.

- A message whose receiver is a tool server (a tool call or a call of
  an undeclared tool) is governed by every enforced contract of which
  that tool server is a party, **whatever its sender**: a party, a
  declared actor that is not a party, or an undeclared actor. Steps 2
  to 4 below therefore apply to outsiders too.
  When a tool server is a party of several enforced contracts, each of
  them governs every call to it, and a call that one of them does not
  allow is denied (step 4): contracts that share a tool server each
  have to permit the calls they intend.
- An ordinary message is governed by an enforced contract when its
  sender and its receiver each match a party.

A norm still applies only to its bearer or to a valid holder (below).
The enforcement point decides the messages one at a time, in
the order in which they arrive, each on the state left by all earlier
observations, and the decision MUST be deterministic. A decision never
depends on a later observation. This holds also for the reading of a
bare name in a predicate as a quantity or as a symbolic value (F.5): an
enforcement point that is given the quantity names uses them from the
start, and one that is not takes a name as a quantity from the first
observation on that gives it a value, never earlier.

Only a permission or a prohibition whose `content:` is a
`message_event` takes part in a decision. One whose content is a
predicate, a `tpredicate` with temporal operators, or an institutional
event has **no effect at the boundary** in version 0.1 and is monitored
under Appendix F only. Obligations and powers do not take part: the
message that an obligation requires, or by which a power is exercised,
is decided like any other, and F.5, item 7 is unchanged.

A norm instance takes part while it is **in force at the boundary**.
The flag is an addition to F.5; the states and verdicts of F.5 are
unchanged.

- A permission is in force while its instance is `active`.
- A prohibition is in force while its instance is `active`. When the
  instance becomes `violated`, the prohibition **stays in force**: the
  violation is reported once (F.5) but does not lift the prohibition.
  It then stays in force until the first of: the time at which its
  `deadline:` window would have closed; the occurrence of its `until:`;
  a `discharge` effect of a power that names it; an amendment under
  which it is not carried over (F.6); the end of the contract
  instance. `suspend` and `resume` effects that name it put it out of
  force and back, also after a violation.

A norm instance in force **applies** to `m` when its content matches
`m` (G.4) and the sender of `m` is its bearer. A derived instance of a
permission (G.7) applies when it is valid and the content matches with
the holder as sender. The result is unknown when the match is unknown
or the enforcement point does not have the flag. Unknown is resolved
**fail-closed**: an unknown prohibition applies, an unknown permission
does not.

**Missing data.** The enforcement point also does not have the flag
when it cannot determine it because a quantity has no value yet. This
concerns the `trigger:` of a prohibition that is `inactive` and the
`until:` of a permission that is `active`, in two forms. Directly:
while that `trigger:` or `until:` is a predicate that is undefined
(F.5), the flag is unknown. Through an institutional event: while it
is an event that a `counts_as:` rule creates from a predicate `when:`,
and the `when:` or the `if:` of such a rule is undefined, the flag is
unknown; with several rules for the event, as long as one of them is
undefined. An unknown prohibition applies and an unknown permission
does not. Nothing is latched: the state of the norm instance and its
verdict are those of F.5, where an undefined predicate does not occur;
as soon as the predicates have values, the flag is the one of the
state again. Two cases need no rule, because F.5 already blocks: an
undefined `trigger:` does not activate a permission, and an undefined
`until:` does not end a prohibition. A processor SHOULD warn when it
decides a message on a flag that is unknown for this reason. The
consequence at the start is intended: a message that arrives before
the quantities of such a predicate have their first values is denied
or escalated.

One case is **not** covered. A rule with a message `when:` and an
`if:` creates its event at the moment of that message or never. When
the message arrives while the `if:` is undefined, no event is created
(F.5); that blocks where the event would let a message through, but
where the event would bring a prohibition into force or end a
permission, the boundary does not block, and there is no later moment
at which the flag could be corrected without inventing a state that
F.5 does not have. G-19 warns about such a contract, and a processor
SHOULD warn when it observes such a message.

**Unknown occurrences.** G-18 requires every index variable of an
enforced contract to be the index of a party, and a contract instance
binds the indices of its parties (F.2). A processor that creates the
instances itself MUST refuse an instance of an enforced contract that
does not bind every index variable of its `parties:`. So no index is
unbound in a conforming run. The following rule is a second line of
defence for a processor that is handed such an instance all the same.
Where the occurrence of an event of an enforced contract, the value of
one of its predicates, or the identity of the performer of an act
depends on an index that the contract instance does not bind, it is
unknown, and unknown is resolved
fail-closed by what the occurrence would do: an unknown occurrence
never has an effect that lets a message through (it does not activate
or resume a permission, end, suspend, or discharge a prohibition,
create an institutional event, exercise a power, or fulfil an
obligation), and it always has the effects that block (it activates a
prohibition and ends a permission or a derived instance). There is one
exception to "always blocks": a power is the act of a determined
party, so a performer who is unknown exercises no power, also when the
effects of the power would block (activate a prohibition, suspend or
discharge a permission). The exception cannot arise in a processor that
refuses instances without bindings. A processor SHOULD warn. Grant and
revoke messages name no index variable (G-11, G-12) and are never
unknown.

The requirement to refuse an instance is on a processor that creates
contract instances. The policy input of G.10 is a description of
instances that a caller supplies, and it may describe an instance that
binds nothing, as it does when the field `instances` is absent; the
decision function then takes every match that depends on the index as
unknown (G.4) and resolves it fail-closed as above. The two do not
conflict: the decision for such an input is defined, and a conforming
runtime does not produce such an input.

### The decision function

For a message `m`, the following steps give a **result** (fields in
G.10), in this order.

1. **Ungoverned.** If no enforced contract governs `m`: `allow`, reason
   `ungoverned`. This appendix does not restrict such a message.
2. **Undeclared tool.** If `m` is a call of an undeclared tool: `deny`,
   reason `undeclared_tool`.
3. **Per contract.** Each governing contract *C* decides, over all its
   running instances:
   1. If *C* has no running instance: `deny`, reason `no_instance`,
      when `m` is a tool call; otherwise as in step 3.4.
   2. If prohibitions of *C* apply to `m`, they are the **grounds** and
      the reason is `prohibition`. *C* decides `escalate` when every
      ground has an `on_denied.escalate_to`, all name the same actor,
      and that actor is not the sender of `m`; otherwise `deny`. An
      `escalate_to: A[i]` is resolved with the bindings of each
      instance in which the ground applies; an unbound index, or
      different actors in different instances, gives `deny`.
   3. Otherwise, if a permission of *C*, original or derived, applies
      to `m`: `allow`, reason `permission`.
   4. Otherwise the `default:` of *C* or, when it is omitted, `deny` if
      `m` is a tool call and `allow` if not; reason `default`.
4. **Combination (deny overrides).** If some contract decides `deny`,
   the decision is `deny`. Otherwise, if some contract decides
   `escalate`, the decision is `escalate` when all escalating contracts
   name the same actor and `deny` when they do not (a hold has a single
   approver). Otherwise it is `allow`.

The **determining contracts** are those that decided `deny`; if none,
those that decided `escalate`; if none, all governing contracts. The
reason of the result is, for `deny` and `escalate`, the first of
`no_instance`, `prohibition`, `default` that a determining contract
has; for `allow`, `permission` if a contract has it, else `default`.
The result lists the grounds or applying permissions of the determining
contracts and, whenever the reason is `prohibition` (for `deny` as well
as for `escalate`), the `fallback` and `notify` of those grounds and
the smallest `timeout:` among them.

It follows that within a contract a prohibition overrides a permission
(N-12 still warns), that a message governed by two enforced contracts
has to be allowed by both, that a prohibition without `escalate_to:` is
never escalated, and that an actor cannot approve its own message.

The default differs by kind of message for a reason. Tools are
enumerated and a tool call acts outside the contract, so a closed
policy can be reviewed tool by tool; it is also the default of the
enforcement cited in G.1. Ordinary messages include the coordination
messages on which protocols, lifecycles, and triggers rely; a contract
written for norms 0.1 has no permissions for them, and `deny` would
stop them all. `default: deny` closes the policy for them too.

### Effect of a decision on the trace

- **`allow`.** The message takes effect and becomes an observation,
  with the time of the decision as its time stamp, for the instances of
  the enforced contracts that govern it. An instance of an enforced
  contract observes a message only when its contract governs the
  message: a message that no enforced contract governs (step 1) is an
  observation for no enforced contract, and a message that one enforced
  contract governs is no observation for another that does not. So a
  message cannot trigger, end, or fulfil a norm of an enforced contract,
  or create an institutional event in it, without having been decided by
  that contract. It follows that a message event of an enforced
  contract whose sender or receiver is not a party could never occur:
  a prohibition with such a `trigger:` would never come into force,
  and a permission with such an `until:` would never end. G-17
  therefore makes such an event an error. Contracts that are not
  enforced keep F.5 unchanged.
- **`deny`.** The message does not take effect and is **not an
  observation**: it triggers no norm, creates no institutional event,
  fires no lifecycle transition, fulfils no obligation, and violates no
  prohibition. The enforcement point SHOULD return the result to the
  sender.
- **`escalate`.** The message is held (G.6); while held it is not an
  observation.

The deadlines of Appendix F keep running while a message is denied or
held. Before a message is decided, the enforcement point observes the
time of the decision: an observation that carries no message, at which
F.5 settles every deadline and every window that has passed. A decision
therefore never rests on a prohibition whose window closed, or on an
obligation whose deadline passed, before the time of the decision. A
denied `trigger:` message does not activate its norm. As an
addition to the verdicts of F.5, a `violated` obligation has the
verdict **`excused`** when, between its activation and the violation, a
message of its bearer that matches its content was denied with the
obligation's own contract among the determining contracts, or was held
on a ground of that contract and not released before the violation:
the contract itself prevented the fulfilment. Its `on_violation:` still
applies, as for every excused norm.

## G.6 Escalation after a denial

`on_denied:` on a prohibition says what follows when that prohibition
is a ground. `fallback:` names a message the sender could send instead
and `notify:` an actor to be informed; both are only copied into the
result. A fallback gives no permission: when sent, it is decided like
any other message. `escalate_to:` and `timeout:` define holds.

When the decision is `escalate`, the enforcement point creates a
**hold** with a `hold_id` unique within the enforcement point, the
message, the time of the decision, the grounds, the approver, and a
deadline (the time of the decision plus the `timeout` of the result, or
none). A **ground of a hold** is a prohibition in one contract
instance in which it applies to the message. The grounds of a hold are
all of them, over all governing contracts, and their contract instances
are the *contract instances of the grounds*. A prohibition that applies
in two contract instances is two grounds. A hold without deadline in a contract instance that never ends
is held for ever. How the hold id reaches the approver depends on the
protocol.

| State | Entered when | Closing record (G.8) |
| --- | --- | --- |
| `held` | the hold is created; the only state that is not final | — |
| `approved` | the approver approves; the message is released | `allow`, reason `approved` (or the denial of the release) |
| `rejected` | the approver rejects | `deny`, reason `rejected` |
| `expired` | the deadline has passed | `deny`, reason `expired`, with the deadline as `time` |
| `cancelled` | a contract instance of a ground ends, or a contract of a ground is amended | `deny`, reason `cancelled` |

The approver acts through two institutional events, `approval` and
`rejection`, each created by a `counts_as:` rule from a message of the
approver (G-9), for example `when: "OPERATOR -> PLANNER : approve"`,
`creates: approval`. As an extension of F.5, where institutional events
"exist only as events", these two carry one value, the **hold id**: the
first argument of the message that created them. This is the only use
of a message argument in version 0.1. The approver's message is itself
governed and decided by G.5.

The order of steps within one observation (F.5) is extended:

- **After step 1:** an `approval` (`rejection`) whose hold id names a
  `held` hold, whose performer (F.5, item 7) is the approver of that
  hold, and which was created in a contract instance of a ground of the
  hold makes it `approved` (`rejected`). When the hold has several
  contract instances of grounds, one such event is enough; an event
  that one message creates in several contract instances is one event.
  Any other `approval` or `rejection` changes no hold and SHOULD be
  recorded as unauthorised. Then the grants, revocations, and `until:`
  events of G.7 are applied.
- **In step 6:** when a contract instance ends, the `held` holds with a
  ground in it become `cancelled`, before its norms are settled.
- **After step 6:** each hold that became `approved` at this
  observation is released, in the order of creation.

**Release.** The message is decided again, on the current state and at
the time of the approving observation. The approval stands in for the
permission and for the grounds, and for nothing else:

1. If the message is now a call of an undeclared tool: `deny`, reason
   `undeclared_tool`.
2. A governing contract that has a ground of the hold denies with the
   reason `no_instance` when a contract instance of one of its grounds
   is no longer running, and with the reason `prohibition` when one of
   its prohibitions applies in a contract instance in which it is not a
   ground of the hold (`norms` lists these prohibitions). This includes
   a prohibition of the grounds that now applies in another contract
   instance, for example one created after the hold. Otherwise the
   contract allows: it tests neither a permission nor its default. This
   is so also when a prohibition of the grounds is no longer in force
   at the time of the approval, for example after its `until:`: the
   approval stands in for the permission in that contract, and the
   message is released. The reason `no_instance` arises only when the
   approving observation itself ends that contract instance (step 6);
   an instance that ended earlier has cancelled the hold. The reference
   runtime does not reach it, because there the end of an instance is
   an observation of its own (G.13).
3. Every other governing contract decides in full by step 3 of G.5 and
   has to allow, by a permission, original or derived and valid now, or
   by its default. A contract that would decide `escalate` denies, with
   the reason `prohibition`.
4. If no contract denies, the message is released. Otherwise the
   release is denied; the result is formed as in step 4 of G.5 from the
   contracts that deny: `contracts` lists them, the reason is the first
   of `no_instance`, `prohibition`, `default` among them, and for
   `prohibition` the `norms`, `timeout`, `fallback`, and `notify` are
   those of G.10. `escalate_to` is `null`.

A denial of the release is final: it creates no hold, and the hold
stays `approved`. With these rules a release keeps what G.5 and G.7
state for every other message: a message governed by two enforced
contracts is allowed by both, and no actor acts on an authority that
its originator no longer has. A delegation revoked, a contract instance
ended, or a contract amended between the hold and the approval in a
contract without a ground therefore denies the release. If the message
is released, it
takes effect as **the immediately following observation, with
the time stamp of the approving observation**, before any other message
is decided. As an addition to F.5, item 3, it is not an occurrence of
the content of a prohibition in a contract instance in which that
prohibition is a ground of the hold: an approved exception does not
violate its grounds. An approval releases one message; a
later message with the same sender, receiver, and name is decided
again.

**Hold identifiers.** An approval or a rejection names a hold by its
identifier and by nothing else. An identifier need not be
unpredictable: what protects a hold is that only its approver can
close it, through a message that the contract governs, and not the
secrecy of the identifier. An approver's message that is itself held
and released later applies to the hold that has the identifier when
that message is released; if that hold is no longer `held`, it changes
nothing and is recorded as unauthorised.

**Expiry.** Before each decision and each observation whose time is
later than the deadline of a `held` hold, that hold becomes `expired`.
Holds that expire together do so in the order of their deadlines, and
of their creation when the deadlines are equal. An approval at exactly
the deadline is in time.

## G.7 Delegation with provenance

An entry of `delegations:` makes one permission **delegable**: `norm:`
names it, `to:` lists the actors that may hold a derived instance at
any depth, `grant:` and `revoke:` name the messages that delegate and
revoke, `max_depth:` is the largest number of links in a chain, and
`until:` is an event that ends every derived instance of the entry.
Only a permission whose content is a `message_event` can be delegated
in version 0.1; a power cannot.

A **derived instance** is a permission with the same content, read with
its **holder** as sender, in one contract instance. Its **provenance
chain** is *a*<sub>0</sub>, …, *a*<sub>n</sub>: *a*<sub>0</sub> is the
bearer of the original permission, *a*<sub>n</sub> the holder, and each
pair of neighbours a **link** made by one grant; the chain of the
bearer is *a*<sub>0</sub> alone. A derived instance is `active` or
`discharged` (final). Derived instances are an addition to Appendix F,
which has one instance per norm; there is **at most one `active`
derived instance per norm, holder, and contract instance**, so every
holder has one chain.

A derived instance is **valid** when the original permission is in
force (G.5), the derived instance is `active`, its chain has at most
`max_depth` links, and every actor of the chain after the first matches
a reference in `to:`. While the original is suspended, its derived
instances are not valid.

**Grant.** A message `X -> Y : g`, where `g` is the `grant:` name of an
entry of a contract that governs it, is decided by G.5 like any other
message. When it is observed, these conditions are tested in each
running instance of the contract:

1. `X` is the bearer and the permission is in force, or `X` holds a
   valid derived instance;
2. `Y` matches a reference in `to:`;
3. `Y` does not occur in the chain of `X`;
4. the chain of `X` has fewer than `max_depth` links;
5. `Y` holds no `active` derived instance of the permission.

If all hold, a derived instance is created for `Y`, with the chain of
`X` followed by `Y`. If 1 to 4 hold and 5 fails, the grant is a no-op.
If one of 1 to 4 fails, the grant has no effect and SHOULD be recorded
as unauthorised. The granter keeps its instance: delegation shares
authority and does not transfer it.

**End.** A derived instance becomes `discharged` when (a) a message
`X -> Y : r` with the `revoke:` name of the entry is observed and `X`
occurs before `Y` in the chain of `Y`: the instance of `Y` and every
derived instance in whose chain `Y` occurs are discharged; (b) the
`until:` of the entry occurs, as for the `until:` of a norm: the
derived instances that are `active` at that observation are discharged,
and the entry stays delegable; (c) the
original permission becomes `discharged` or the contract instance ends.
A revoke message that does not satisfy (a) has no effect. A discharged
instance is not revived; a new grant creates a new one.

Because validity is computed from the whole chain, an actor cannot
obtain through intermediaries an authority that its originator did not
have or no longer has: a grant by an actor without a valid instance
creates nothing, a chain is never longer than the contract allows, and
revoking one link ends everything derived through it.

**Amendments.** F.6 governs the norm instances of an amended contract.
This appendix adds two rules: when a new version of an enforced
contract takes effect, (1) every `held` hold with a ground in that
contract becomes `cancelled`, and (2) the validity of every derived
instance is tested against the new version; an instance whose
permission has no `delegations:` entry there, or whose original was
discharged by the amendment, is `discharged`.

## G.8 Audit record

An enforcement point SHOULD record every decision and SHOULD keep the
records append-only. Recording is a recommendation; the format is
normative. An **audit record** is the result of the decision (G.10)
with five more fields:

| Field | Content |
| --- | --- |
| `time` | The time of the decision, on the clock of the trace. |
| `message` | `from`, `to`, and `name`, as in the policy input. |
| `instances` | The running instances of the governing contracts: contract `id` and an identifier of the instance. In a closing record: the contract instances of the grounds of the hold, whether they are still running or not. |
| `hold_id` | For an `escalate` decision and for the record that closes the hold; otherwise `null`. The identifier is unique within the enforcement point and need not be unpredictable (G.6). |
| `outcome` | In the record that closes a hold, its final state; otherwise `null`. |

An `escalate` decision gives two records with the same `hold_id`: one
when the hold is created and a **closing record** when it reaches a
final state (table of G.6). The closing record keeps the `contracts`,
`norms`, and `escalate_to` of the hold; when its reason is `rejected`,
`expired`, or `cancelled`, it also keeps the `fallback` and `notify` of
the hold, so that the sender finds them in the denial. Its `timeout` is
`null`. When the release is denied (G.6), the closing record has the
result of that denial instead, and its `outcome` is `approved`. The
`time` of a closing record is the time of the observation that closed
the hold, except for `expired`, where it is the deadline; such a record
is written when the expiry is found, before the next decision or
observation, so the times of a log never decrease.

A denial or an escalation that rests on a flag that is unknown (G.5)
has the reason `prohibition` and lists the norm in `norms`, like any
other. What distinguishes it is in the policy input of the decision,
where the flag is absent from `in_force`, and in the warning of the
processor. The remedy of the sender differs: for missing data it is to
wait for the data, not to ask the approver.

Grants, revocations, and acts recorded as unauthorised SHOULD be
written to the same log, as **event records**, and so SHOULD every
other change of the state on which later decisions rest: the end of a
derived instance for any cause, the start and the end of a contract
instance, and an amendment. An event record has no result; it has the
field `event` in place of `decision`, and these fields:

| Field | Content |
| --- | --- |
| `time`, `message` | As in an audit record: the observation and the message that the event comes from; `message` is `null` when there is none. |
| `event` | `grant`, `revoke`, `delegation_end` (a derived instance ended for another cause than a revoke message; one record per derived instance), `instance_start`, `instance_end`, `amendment`, `unauthorised_grant`, `unauthorised_approval`, `unauthorised_rejection`, or `unauthorised_act` (an act that F.5, item 7 records as unauthorised). |
| `instances` | The contract instance or instances in which the event took place; for `amendment`, the running instances of the amended contracts. |
| `norm` | For a grant, a revocation, or a `delegation_end`, the delegable permission as `<contract id>.<norm id>`; otherwise `null`. |
| `chain` | For a `grant`, the chain of the derived instance of the receiver; for a `revoke` that has an effect, the chain of the revoked instance; for a `delegation_end`, the chain of the instance that ended; otherwise `null`. |
| `holders` | The holders whose derived instance the event created or discharged, in the order of creation; otherwise empty. |
| `hold_id` | For an unauthorised approval or rejection, the hold id it carried, if any; otherwise `null`. |
| `reason` | `null` for a grant or a revocation that has an effect; `holder_exists` for a grant that is a no-op (condition 5 of G.7); `no_effect` for a revoke message that does not satisfy (a); for `unauthorised_grant` the first condition that fails: `no_authority` (1), `not_in_to` (2), `in_chain` (3), `max_depth` (4); for an unauthorised approval or rejection `unknown_hold`, `not_held`, `not_approver`, or `other_instance` (not created in a contract instance of a ground); for `unauthorised_act`, `no_power`; for `delegation_end` the cause: `until`, `original_discharged`, `instance_end`, or `amendment`; for `instance_end`, `end` or `terminal_state`; for `amendment`, the name of the new version; for `instance_start`, `null`. |

Records are written in the order in which the enforcement point
produces them: the record of a decision, then the event records of the
observation that the message becomes, then the closing records of the
holds that this observation approved or rejected. A change of the
in-force flag of a norm has no record of its own: it follows from the
recorded messages, from the times, and from the values that the
predicates of the contract read. This appendix defines
no integrity protection for the log, such as a hash chain or a
signature; a deployment that needs one adds it outside the record.

## G.9 Static semantics {/* #g9-static-semantics */}

An agents-aware processor MUST, in addition to the checks of
[Appendix F](./appendix-f-norms.md):

- **G-1.** A file that declares `agents: 0.1` MUST also declare
  `norms: 0.1`; otherwise the processor reports an error and does not
  interpret the keys of this extension.
- **G-2.** An `agent:` mapping MUST have `kind:`, one of `llm_agent`,
  `tool_server`, `human`, `service`; `protocol:` MUST be a
  `hyphen_name`.
- **G-3.** `tools:` is allowed only for a `tool_server`, which MUST
  list at least one tool. A tool name MUST be an identifier, not a
  reserved word, and unique within its actor. (Under a YAML 1.1 loader
  an unquoted `yes`, `no`, `on`, `off`, `true`, `false`, or `null` is
  not a name; see
  [A.12](./appendix-a-syntax.md#a12-reference-implementation-status-v03).)
- **G-4.** When the receiver of a `message_event` is a tool server, the
  message name MUST be one of its `tools:`. This applies to the
  `trigger:`, `until:`, and `content:` of a norm, the `when:` of a
  `counts_as:` rule, the `on:` of a lifecycle transition, and a
  `fallback:`. A processor SHOULD warn about a message step of a
  protocol (A.5) that does not satisfy it.
- **G-5.** `enforcement.default` MUST be `deny` or `allow`, and
  `enforcement.point` one of `caller`, `receiver`, `gateway`. A null or
  empty `enforcement:` is valid.
- **G-6.** In an enforced contract, the sender of the `message_event`
  content of a permission or a prohibition MUST be textually equal to
  its `bearer:`.
- **G-7.** `on_denied:` is allowed only on a prohibition whose content
  is a `message_event`, in an enforced contract, and MUST have at least
  one key. `timeout:` MUST be a `duration_lit` greater than zero and
  requires `escalate_to:`. A processor SHOULD warn about an
  `escalate_to:` without `timeout:`.
- **G-8.** `escalate_to:` and `notify:` MUST name single declared
  actors (as N-3). `escalate_to:` MUST name a party of the contract, so
  that its messages are governed, MUST NOT be textually equal to the
  `bearer:` of its prohibition, and SHOULD have `agent.kind: human`.
- **G-9.** A contract with an `escalate_to: A` MUST have a `counts_as:`
  rule that creates `approval` from a `message_event` whose sender is
  `A`, and SHOULD have one for `rejection`. In an enforced contract,
  every rule that creates `approval` or `rejection` MUST have as
  `when:` a `message_event` whose sender is the `escalate_to:` of a
  prohibition of the contract, and no norm `id` may equal either name;
  these are the only uses that are errors. By G-17 the sender and the
  receiver of that `message_event` are parties of the contract, so the
  contract governs the approver's message and its instances observe
  it. A reference to the two
  events in a `trigger:`, `until:`, or `content:` is allowed.
- **G-10.** A `fallback:` MUST be a `message_event` whose sender is
  textually equal to the `bearer:` of its prohibition and whose
  receiver is a declared actor, and MUST differ from the content of the
  prohibition in receiver or message name.
- **G-11.** `delegations:` is allowed only in an enforced contract.
  `norm:` MUST be the `id` of a permission of the contract whose
  content is a `message_event`; at most one entry may name a norm. The
  `bearer:` of that permission MUST NOT have an index bound by the
  contract instance (`ROBOT[i]`), so that the first actor of every
  chain can be read from the file.
- **G-12.** `to:` MUST list at least one reference, each naming
  declared actors; a wildcard or a range is allowed, an index bound by
  the contract instance is not. `to:` MUST NOT name a tool server and
  SHOULD NOT include the bearer. `max_depth:` MUST be an integer of at
  least 1. `until:` MUST satisfy the rules of Appendix F for the
  `until:` of a norm (N-9, N-10).
- **G-13.** `grant:` and `revoke:` MUST be identifiers and not reserved
  words. Within a contract, all `grant:` and `revoke:` names MUST
  differ from each other and from `approval` and `rejection`, and none
  may be a tool of a tool server that is a party. (The YAML 1.1 note of
  G-3 applies.)
- **G-14.** A processor SHOULD warn, in an enforced contract, about a
  permission or prohibition (a) whose content is not a `message_event`,
  because it has no effect at the boundary, or (b) whose
  `message_event` content has arguments, because they are not
  considered.
- **G-15.** A processor SHOULD warn about (a) a tool of a party of an
  enforced contract with `default: allow` that no permission or
  prohibition of the contract covers, and (b) a tool server that is a
  party of no enforced contract, whose tool calls are ungoverned. A
  norm *covers* a message when its `message_event` content has that
  receiver and message name.
- **G-16.** A processor SHOULD warn about a message that a contract
  needs and would itself deny: (a) the content of an obligation, or a
  `fallback:`, that a prohibition without `trigger:` whose bearer is
  the sender of that message covers, or that is a tool call covered by
  no permission of its sender while the default for tool calls is
  `deny`; a message that the sender could send only through a derived
  permission still gets the warning, because delegations are runtime
  state; (b) under `default: deny`, a `grant:` or `revoke:`
  name, or the `when:` message of a rule that creates `approval` or
  `rejection`, that no permission covers.

- **G-17.** In an enforced contract, the sender and the receiver of
  every `message_event` of the contract MUST be **covered by the
  parties** and MUST name declared members only: the `trigger:`,
  `until:`, and `content:` of its norms, the `when:` of its
  `counts_as:` rules, and the `until:` of its delegations. A reference
  is covered when **one** reference in `parties:` matches every actor
  that it can name (G.5): `A` by a party `A`; `A[3]` by a party `A[3]`,
  `A[i]`, `A[*]`, or a range that contains 3; `A[1..3]` by a party
  `A[i]`, `A[*]`, or a range that contains it; `A[*]` and `A[i]` by a
  party `A[i]` or `A[*]`, or by a party range that contains the whole
  declared set. Two party references are not combined: the parties
  `A[1..2]` and `A[3]` do not cover `A[1..3]`. A literal index or a
  range MUST lie within the declared set: for a set declared as
  `A[1..3]`, `A[7]` and `A[2..5]` are errors. An instance of an
  enforced contract observes only the messages that the contract
  governs (G.5), so an event that is not covered, or that names no
  declared member, could never occur for some or all of the actors it
  names. The receiver of a tool call is included: G-4 requires the
  tool, and this rule that the tool server is a party. So is its
  sender: a contract cannot make the tool call of an actor that is not
  a party the content or the event of a norm. Such a call to a tool
  server that is a party is governed all the same (G.5); it is decided
  by the default of the contract and by the norms written for parties,
  and that is intended. A `fallback:` is not included: it is data for
  the sender and no event of the contract, G-10 requires its receiver
  only to be declared, and a fallback sent to an actor that is not a
  party is not governed by this contract.
- **G-18.** In an enforced contract, every index variable MUST be
  bound. An index variable is a name that is used as an index or inside
  an index expression (`j` in `ROBOT[j]`, in `ROBOT[j+1]`, and in
  `ROBOT[SLOT[j].next]`). There are three binders: a reference in
  `parties:` binds its index variable for the whole contract (`i` for a
  party `ROBOT[i]`); a quantifier binds its variable within its
  predicate (`exists j in ROBOT: ROBOT[j].battery < 20`, A.10); and a
  comprehension binds its variable within its element
  (`sum(ROBOT[j].load for j in ROBOT)`, A.10). Every other index
  variable is an error, wherever an expression of the contract can
  stand: in the `bearer:` and the `counterparty:` of a norm; in
  `escalate_to:`, `notify:`, and the sender and receiver of a
  `fallback:`; in the sender, the receiver, and the arguments of every
  `message_event` that G-17 names, including the `content:` of a norm
  of any kind; and in every predicate of the contract, which are the
  `trigger:`, `until:`, and `content:` of its norms, the `when:` and
  `if:` of its `counts_as:` rules, the `until:` of its delegations, and
  its `assume:` and `guarantee:` items. The contract instance binds the
  index variables of its parties (F.2) and no others; a variable
  without a binder has no value that the file accounts for: by F.3 an
  event or a power with such a variable would hold for every member of
  the set, and a predicate with it would read a quantity that no actor
  has. That a quantifier binds its variable makes the predicate valid;
  whether a processor can evaluate it is a separate matter (G.13).

- **G-19.** A processor SHOULD warn, in an enforced contract, about an
  institutional event that a `counts_as:` rule creates under an `if:`
  and that is the `trigger:` of a prohibition or the `until:` of a
  permission. When the `when:` of the rule is a message that arrives
  while the `if:` is undefined, the event is not created and the
  boundary does not block (G.5, "Missing data").

The MUST rules are errors; the SHOULD rules are warnings and leave the
file valid. N-1 to N-12 of Appendix F apply unchanged.

## G.10 Code generation

Two code targets generate a boundary policy from the enforced contracts
of a file. They are listed in
[Appendix D](./appendix-d-codegen.md) in the category *Boundary
policy*: `agent-rego` emits Rego
[[Open Policy Agent]](./appendix-b-references.md) and is independent of
the `opa` target, which emits one policy per contract from other parts
of the contract; `agent-cedar` emits Cedar policies
[[AWS, AgentCore Policy]](./appendix-b-references.md). The syntax of
the policies and the layout of the files belong to the targets.

```jsonc
// policy input
{ "message": { "from": "SUMMARIZER", "to": "FILES", "name": "read_file" },
  "now": "2026-11-10T09:00:05Z",
  "instances": [
    { "contract": "ASSISTED_REPORTING", "instance": "default",
      "bindings": {},
      "in_force": {},
      "derived": [ { "norm": "may_read", "holder": "SUMMARIZER",
                     "chain": ["OPERATOR", "PLANNER", "SUMMARIZER"] } ] } ] }

// result
{ "decision": "allow", "reason": "permission",
  "contracts": ["ASSISTED_REPORTING"],
  "norms": ["ASSISTED_REPORTING.may_read"],
  "provenance": [["OPERATOR", "PLANNER", "SUMMARIZER"]],
  "escalate_to": null, "timeout": null, "fallback": [], "notify": [] }
```

Input:

- `message` (required): `from` and `to` are concrete actors written as
  in the file (`PLANNER`, `ROBOT[2]`); `name` is the message name.
  Arguments are not part of the input.
- `now` (optional): the time of the decision; it does not influence the
  decision.
- `instances` (optional): **every** running instance of every enforced
  contract; a contract without an entry has no running instance. When
  the field is absent, the policy assumes one running instance of each
  enforced contract, with no index bound and no derived instance; a
  match that depends on an index is then unknown (G.4, and G.5 for the
  relation to the instances a runtime creates). Per
  instance: `bindings` maps index names to integers; `in_force` maps
  the `id` of each norm that is not static (below) to `true` or
  `false`, and a missing entry is unknown; `derived` lists the derived
  instances that the runtime found valid by G.7, with their chains.
- A `derived` entry is re-checked fail-closed. It applies only if its
  norm is a delegable permission of that contract, the holder is the
  sender of the message and the last element of the chain, the chain
  has at most `max_depth` links, its first element matches the bearer
  and every later one a reference in `to:`, and the original permission
  is in force (static, or flag `true`; a missing flag does not count).
  Any other entry is ignored.

For an input that does not have this form no decision is defined: a
processor reports an error, and a generated policy denies.

Result:

- `decision`: `allow`, `deny`, or `escalate`.
- `reason`: one of `ungoverned`, `undeclared_tool`, `no_instance`,
  `prohibition`, `permission`, `default`; in a closing record (G.6)
  also `approved`, `rejected`, `expired`, `cancelled`.
- `contracts`: the `id`s of the determining contracts (G.5); empty for
  `ungoverned` and `undeclared_tool`.
- `norms`: the grounds (reason `prohibition`) or the applying
  permissions (reason `permission`) of the determining contracts, each
  as `<contract id>.<norm id>`, each once, in the order of
  declaration; empty for the other reasons.
- `provenance`: the chains of the applying derived instances, in the
  order of their norms and then of the input, without duplicates;
  empty when only original permissions applied.
- `escalate_to`: the approver for `escalate` and in a closing record
  that keeps it (G.8), as a concrete actor; otherwise `null`.
- `timeout` (milliseconds), `fallback` (message events as text), and
  `notify` (actor references) are filled whenever the reason is
  `prohibition`, for `deny` as well as for `escalate`, from the
  grounds, without duplicates, in the order of declaration; for every
  other reason they are `null`, `[]`, and `[]`, except that a closing
  record with the reason `rejected`, `expired`, or `cancelled` keeps
  the `fallback` and `notify` of its hold (G.8).

A norm is **static** when it is a permission or a prohibition whose
content is a `message_event`, it has no `trigger:`, `until:`, or
`deadline:`, no power names it in `effects:`, no norm names it as
`reparation:`, and no actor reference of the norm has an index bound by
the contract instance: its bearer, counterparty, and content, its
`escalate_to` and `notify`, and the sender and receiver of its
`fallback`. By G.5 a static norm is in force in every running
instance from its start to its end, so the input carries no flag for
it. A policy is generated for one version of the contracts; an
amendment requires a new policy.

A generated policy MUST return, for every input, the same `decision` as
the decision function of G.5, with static norms taken as in force, the
other flags and the derived instances taken from the input, and
everything the input does not supply taken as unknown. A target whose
policy language has only two outcomes returns `deny` where G.5 gives
`escalate`. The other result fields MAY be produced by the policy or by
the runtime, from a table that the generator emits beside the policy
(per prohibition: `escalate_to`, `timeout`, `fallback`, `notify`). A
generator MUST list in the generated artifact, as needing runtime
state, each permission or prohibition with a message content that is
not static, and separately, as having no effect at the boundary, each
permission or prohibition with another content; norms of other kinds
are not listed. Holds, release, and the bookkeeping of delegations (G.6, G.7)
belong to the runtime, not to the policy.

For the example of G.12 with only `message` in the input (informative):

| `message` | Result |
| --- | --- |
| `PLANNER -> TICKETS : search_tickets` | `allow`, `permission`, `may_search` (static permission) |
| `PLANNER -> FILES : delete_file` | `escalate` to `OPERATOR`, `prohibition`, `no_delete` |
| `PLANNER -> FILES : format_disk` | `deny`, `undeclared_tool` |
| `SUMMARIZER -> FILES : read_file` | `deny`, `default`; with the `derived` entry shown above, `allow`, `permission` |

**Cedar mapping (informative).** In Cedar
[[Cutler+, OOPSLA 2024]](./appendix-b-references.md) a request is
denied unless a `permit` policy is satisfied, a satisfied `forbid`
policy overrides every `permit`, and a policy whose evaluation raises an
error is skipped. Undeclared tools and prohibitions therefore become
`forbid` policies, permissions `permit` policies, and the default for
tool calls is the default denial of the language; `escalate` is
returned as a denial and resolved by the runtime from the emitted
table. Because an erroring `forbid` policy would be skipped and so
would not deny, a generated policy must not raise an error on any
input of the schema above: it tests the presence of every optional
attribute before reading it. Messages that G.5 allows without a
permission (ungoverned messages, a contract whose default is `allow`)
need explicit `permit` policies, and with more than one enforced
contract, deny-overrides across contracts needs an additional `forbid`
policy per contract for what that contract does not allow. From the
Cedar answer alone, a denial by such a policy or by the language
default cannot be told apart from "a non-static or derived permission
might allow"; the Cedar target therefore covers static norms only, and
the runtime decides the rest.

## G.11 Mapping to agent protocols (informative)

The decision function does not depend on a protocol. The table gives
the intended correspondence; nothing normative depends on it.

| CADL (agents 0.1) | MCP [[MCP, 2026-07-28]](./appendix-b-references.md) | A2A [[Linux Foundation, A2A 2025]](./appendix-b-references.md) (to be confirmed) |
| --- | --- | --- |
| `kind: tool_server`; tool; tool call | An MCP server; a tool of it; a request to call the tool | — |
| `kind: llm_agent` | An MCP client, when it calls tools | An A2A agent |
| Ordinary message between agents | — | A message from one agent to another |
| `point: gateway` | A gateway in front of the server; the specification requires the headers `Mcp-Method` and `Mcp-Name` so that gateways can route and meter requests without parsing their bodies | An intermediary between the agents |
| `escalate_to:`, hold id | Outside the protocol | Outside the protocol |

## G.12 Example

A human operator asks an LLM planner to prepare a report. The planner
calls the tools of two tool servers and uses a sub-agent to summarise
files. The file satisfies every rule of this appendix and N-1 to N-12
of [Appendix F](./appendix-f-norms.md).

```yaml
sos:
  name: "AssistedReporting"
  extensions:
    - norms: 0.1
    - agents: 0.1

  actors:
    - id: OPERATOR
      role: "Human operator who owns the task and the files"
      agent: { kind: human }
    - id: PLANNER
      role: "LLM agent that plans the report and calls tools"
      agent: { kind: llm_agent, protocol: a2a }
    - id: SUMMARIZER
      role: "LLM sub-agent that summarises files for the planner"
      agent: { kind: llm_agent, protocol: a2a }
    - id: FILES
      role: "File store"
      agent: { kind: tool_server, protocol: mcp, tools: [read_file, delete_file] }
    - id: TICKETS
      role: "Issue tracker"
      agent: { kind: tool_server, protocol: mcp, tools: [search_tickets, create_ticket] }

  contracts:
    - id: ASSISTED_REPORTING
      parties: [OPERATOR, PLANNER, SUMMARIZER, FILES, TICKETS]
      enforcement:
        point: gateway      # default: omitted -> deny tool calls, allow other messages
      counts_as:
        - { when: "OPERATOR -> PLANNER : approve", creates: approval }
        - { when: "OPERATOR -> PLANNER : reject",  creates: rejection }
      norms:
        - id: may_read
          kind: permission
          bearer: OPERATOR
          content: "OPERATOR -> FILES : read_file"
        - id: may_search
          kind: permission
          bearer: PLANNER
          content: "PLANNER -> TICKETS : search_tickets"
        - id: may_file_ticket
          kind: permission
          bearer: PLANNER
          content: "PLANNER -> TICKETS : create_ticket"
        - id: no_delete
          kind: prohibition
          bearer: PLANNER
          content: "PLANNER -> FILES : delete_file"
          on_denied:
            escalate_to: OPERATOR
            timeout: 10min
            fallback: "PLANNER -> TICKETS : create_ticket"
            notify: OPERATOR
      delegations:
        - norm: may_read
          to: [PLANNER, SUMMARIZER]
          grant: grant_read
          revoke: revoke_read
          max_depth: 2
```

The contract has no `lifecycle:` block and no host creates instances,
so its single instance, here called `default`, exists from the start of
the enforcement point. The four norms have no trigger: they are in
force from the start, and all four are static (G.10). The permission to
read belongs to the operator; the planner and the sub-agent read only
through a delegation, over at most two links.

At 09:00:00 the operator sends `OPERATOR -> PLANNER : grant_read`, and
at 09:00:02 the planner sends `PLANNER -> SUMMARIZER : grant_read`.
Both are ordinary messages to which no norm applies, so the default
allows them. The first creates a derived instance of `may_read` for
`PLANNER` with the chain OPERATOR → PLANNER, the second one for
`SUMMARIZER` with the chain OPERATOR → PLANNER → SUMMARIZER. A further
`SUMMARIZER -> PLANNER : grant_read` would be recorded as unauthorised:
`PLANNER` occurs in the chain of `SUMMARIZER` (condition 3), which
already has two links (condition 4).

**Call 1 — allowed through a chain.** At 09:00:05 the sub-agent sends
`SUMMARIZER -> FILES : read_file`. The message is governed and the tool
is declared. No prohibition applies: the sender is not the bearer of
`no_delete`. The derived instance of `SUMMARIZER` is valid (`may_read`
is in force, the chain has two links, its actors are in `to:`), and its
content, read with the holder as sender, matches: `allow`.

**Call 2 — escalated and approved.** At 09:03:00 the planner sends
`PLANNER -> FILES : delete_file`. `no_delete` is in force and applies;
it is the only ground and its `escalate_to:` is not the sender, so the
decision is `escalate`. The hold `h-1` is created with the approver
`OPERATOR` and the deadline 09:13:00. At 09:03:40 the operator sends
`OPERATOR -> PLANNER : approve("h-1")`, an ordinary message that the
default allows. After step 1 of that observation the event `approval`,
performed by `OPERATOR`, carries the hold id `h-1`, and the hold
becomes `approved`. After step 6 the message is decided again: the
tool is declared, the instance of the ground is running, no prohibition
applies outside the grounds, and no other enforced contract governs the
call, so the held message becomes the next observation, with the time
stamp 09:03:40. It
is not an occurrence of the content of `no_delete`, which stays
`active`. Had the operator sent `reject("h-1")`, or nothing until
09:13:00, the closing record would be a `deny` with the reason
`rejected`, or `expired` with the time 09:13:00; the planner would find
the fallback in the result, and `may_file_ticket` allows that call.

**Call 3 — denied after a revocation.** At 09:10:00 the operator sends
`OPERATOR -> PLANNER : revoke_read`. `OPERATOR` occurs before `PLANNER`
in the chain of `PLANNER`, so the instance of `PLANNER` is discharged,
and with it the instance of `SUMMARIZER`, in whose chain `PLANNER`
occurs. At 09:10:30 the sub-agent sends `SUMMARIZER -> FILES :
read_file`. No prohibition applies; `SUMMARIZER` holds no valid
permission, and the original `may_read` does not apply because the
sender is not its bearer; the message is a tool call and `default:` is
omitted, so the contract denies. The sub-agent cannot keep an authority
that the planner no longer has.

The audit records of the three calls (the two of call 2 share the hold
`h-1`). In all four, `instances` is the instance `default` of
`ASSISTED_REPORTING` and `contracts` is `["ASSISTED_REPORTING"]`; the
first record of call 2 is written out below the table.

| `time` | `message` | `decision` | `reason` | `norms` | `provenance` | `hold_id` | `outcome` |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 09:00:05 | `SUMMARIZER`, `FILES`, `read_file` | `allow` | `permission` | `may_read` | OPERATOR, PLANNER, SUMMARIZER | `null` | `null` |
| 09:03:00 | `PLANNER`, `FILES`, `delete_file` | `escalate` | `prohibition` | `no_delete` | — | `h-1` | `null` |
| 09:03:40 | `PLANNER`, `FILES`, `delete_file` | `allow` | `approved` | `no_delete` | — | `h-1` | `approved` |
| 09:10:30 | `SUMMARIZER`, `FILES`, `read_file` | `deny` | `default` | — | — | `null` | `null` |

```jsonc
{ "time": "2026-11-10T09:03:00Z",
  "message": { "from": "PLANNER", "to": "FILES", "name": "delete_file" },
  "instances": [ { "contract": "ASSISTED_REPORTING", "instance": "default" } ],
  "decision": "escalate", "reason": "prohibition",
  "contracts": ["ASSISTED_REPORTING"],
  "norms": ["ASSISTED_REPORTING.no_delete"], "provenance": [],
  "escalate_to": "OPERATOR", "timeout": 600000,
  "fallback": ["PLANNER -> TICKETS : create_ticket"], "notify": ["OPERATOR"],
  "hold_id": "h-1", "outcome": null }
```

## G.13 IR addition and reference implementation status

The simulator IR (E.7, F.9) is extended in three places; as there, it
is a direct serialization of dataclasses and flattens nested blocks.

```jsonc
// each actor under institution.actors
{ "id": "FILES",
  "agent_kind": "tool_server",          // null for an actor without agent:
  "agent_protocol": "mcp",
  "agent_tools": ["read_file", "delete_file"] }

// each contract under institution.contracts
{ "enforced": true,
  "enforcement_default": null,
  "enforcement_point": "gateway",
  "norms": [
    { "id": "no_delete",                // ... and the fields of F.9
      "on_denied_escalate_to": "OPERATOR",
      "on_denied_timeout_ms": 600000,
      "on_denied_fallback": "PLANNER -> TICKETS : create_ticket",
      "on_denied_notify": "OPERATOR" } ],
  "delegations": [
    { "norm": "may_read", "to": ["PLANNER", "SUMMARIZER"],
      "grant": "grant_read", "revoke": "revoke_read",
      "max_depth": 2, "until": null } ] }
```

`enforced` is `true` when the contract has the key `enforcement:`, also
with a null or empty value. `enforcement_default` is `null` when
`default:` is omitted, because the default then depends on the kind of
message; applying it is left to the consumer. `enforcement_point` is
filled in for an enforced contract (`gateway`) and `null` otherwise;
`max_depth` is always filled in (`1`). `fallback` and `until` are kept
as text. `agent_tools` and `delegations` are empty lists when there is
nothing to list, and the four `on_denied_*` fields are `null` for a
norm without `on_denied:`. All fields shown here (`agent_*`,
`enforced`, `enforcement_*`, `delegations`, `on_denied_*`) are present
only when the file declares `agents: 0.1`; a file that declares only
`norms: 0.1` has exactly the IR of F.9.

**Reference implementation.** `cadl` 0.3.20 implements agents 0.1 as
follows. It parses the four new keys, applies G-1 to G-16 in
`cadl check` (the SHOULDs as warnings; G-17 to G-19 from `cadl` 0.3.22), and lowers the blocks to the IR
above; a `timeout:` given as a bare number is read as seconds, the
lenient form that
[A.12](./appendix-a-syntax.md#a12-reference-implementation-status-v03)
describes for deadlines. `cadl agents-decide` implements the decision
function of G.5 over the policy input of G.10. It is stateless: the
in-force flags and the valid derived instances come in through the
input. `cadl codegen -t agent-rego` emits a Rego policy that returns
the full result, and `-t agent-cedar` emits Cedar policies for the
static norms with a side table.

**Runtime.** `cadl` 0.3.22 adds
`cadl agents-run FILE --trace TRACE [--audit OUT.jsonl]`, a reference
runtime for G.5 to G.8. It is deterministic and offline: it replays a
recorded sequence of messages through one enforcement point over all
enforced contracts of the file, and its only clock is the time of the
trace. For each message it takes the in-force flags from the verdict
engine of `cadl norms-eval` (F.10), the valid derived instances from
the grants and revocations observed so far, and the running contract
instances from the trace; it builds the policy input of G.10 from them
and calls the decision function of `cadl agents-decide`. It then
applies the decision as G.5 says, keeps the holds and the derived
instances (G.6, G.7), decides an approved message again before it
releases it, and writes the audit records and event records of G.8, as
JSON Lines when `--audit` is given. Hold ids are `h-1`,
`h-2`, and so on, in the order of creation.

The trace is that of `cadl norms-eval` (JSON Lines with `t`,
`bindings`, `request`, `values`, `messages`, `state`, `amend`, `end`),
read for the whole enforcement point, with two more keys: `epoch`, the
time of `t = 0` as an ISO 8601 time stamp, which makes the times of
the records time stamps; and `instances`, the contract instances that a
host creates and ends, with their bindings. Every instance has to
bind the index variables of the parties of its contract, the single
instance of a contract without host through the `bindings` of the first
line, and each value has to be the index of a member of the set that
the party names; otherwise the trace is rejected, with the contract,
the instance, the variable, and the value in the message. A binding of
a variable that no party has is ignored, with a warning. A value has
to be the index of a member of every declared set that the variable
indexes in the contract, not only of the party's set. The key
`quantities` of the first line gives the quantity names of the run
(F.5); then exactly these names are quantities, from the start and for
every instance. Without it the runtime takes a name as a quantity from
the first line on that gives it a value, so that no decision depends on
a later line (G.5); a bare name without a value so far is a symbolic
value. This can differ from the verdicts of `cadl norms-eval` on the
same lines for a name before its first value, and the runtime warns
when a name that a predicate uses gets its first value after a message
was decided. Nothing after the end of an instance has an effect on
it. Which contracts have host-created instances is likewise fixed on
the first line: a contract that the first line names in `instances`,
or lists under the key `host_instances` when its first instance is
created later, has the instances that the trace creates, and none
before; every other enforced contract has its single instance from the
start, and a later line that creates an instance of it is a trace
error. When a message is decided while a flag is unknown for missing
data (G.5), the runtime warns once per norm and names the quantity
without a value. Messages sent before the first values of such
quantities are therefore denied or escalated; a trace gives the initial
values on its first line to avoid that. A grant that is sent while the
`until:` of the delegable permission is undefined is recorded as
`unauthorised_grant` with the reason `no_authority`, because the
permission is not known to be in force, and has to be sent again. Two
limits remain for missing data. A message that would create a blocking
event under an `if:` that is undefined creates nothing (G.5, G-19);
the runtime warns and names the rule, the event, and the quantity. And
the rule does not reach through an obligation: while the predicate
`trigger:` of an obligation is undefined, the obligation is not
activated, so it is not violated, and a prohibition that is its
`reparation:` does not arise. One line is processed in
this order: holds whose deadline lies before its time expire; instances
are created; the time and the values of the line are observed without
message (G.5), together with an amendment; each message is decided, and
an allowed one is one observation; a change of lifecycle state and the
end of instances are a last observation. Messages after the end of an
instance are still decided and recorded.

Three points are readings of the implementation and not rules of this
appendix. An amendment applies to the enforced contracts whose
definition differs between the two versions, and it may not add or
remove an enforced contract. After a violation, the window clock of a
prohibition stops while the prohibition is suspended, as it does before
(F.5). A message matches the content of an obligation, for the verdict
`excused`, as at the boundary: on sender, receiver, and name.

Known limits. The runtime is not connected to a protocol: it replays a
trace and does not run agents or tools. It does not protect the log
against later changes. The log has no record for a change of the
in-force flag of a norm (G.8). A holder whose derived instance is
`active` but no longer valid after an amendment of `to:` cannot be
granted the permission again: the grant is the no-op of condition 5
(`holder_exists`). A trace gives time as a finite number of at most
2<sup>53</sup> in absolute value; with an `epoch`, every time and every
deadline of a hold has to be an instant that an ISO 8601 time stamp can
express. A trace error on a later line is raised before anything is
printed or written, but after the earlier lines have been decided in
memory; the audit file is written only when the whole trace was
replayed. The functions of the runtime refuse a file with errors of
`cadl check` and an instance without the bindings of its parties; a
switch for tests turns both off, and only then is the resolution of
unknown occurrences (G.5) reached. The decision function
`cadl agents-decide` still takes instances without bindings and treats
the match as unknown (G.4). The runtime, like `cadl norms-eval`, does not evaluate
a predicate with a quantifier or a wildcard reference (`A[*]`); a norm
whose `trigger:`, `until:`, or `content:` is such a predicate is not
judged, and its in-force flag is unknown for the whole run. By G.5 a
prohibition of that kind then always applies and a permission never
does: fail-closed, but perhaps not what the author expects.

The tests replay each step of the runtime through the decision function
with the state the runtime computed, and through the generated Rego
policy under OPA 1.22.3: 81 decisions of nine hand-written scenarios
(the three calls of G.12, rejection, timeout, a prohibition between a
trigger and an `until:`, delegation with a depth limit, two contracts
with bound indices and host-created instances) and 7 800 decisions of
26 generated traces over eleven files gave the same result in both. The
generated traces have host-created instances with different bindings,
senders outside the declared sets and undeclared senders, a hold with a
ground in one of two contracts, and revocations, ends of instances, and
amendments between a hold and its approval. Every release in them, 176
with 15 denied, and 13 more with 8 denied under random amendments, was
checked from its recorded policy input against the rules of G.6. A
second model of G.4 to G.7 and F.3, written by the reviewer from the
text of the appendices without code of the reference implementation,
gave the same 8 102 decision and closing records on 108 further traces
over seven files: 60 traces with every index bound, run as
`cadl agents-run` runs them, and 48 with instances that bind nothing or
with two files that `cadl check` rejects by G-17 and G-18, run with the
switch for tests. That model has no powers and no obligations. For
them, 60 generated traces of 200 messages over two files check that
without a binding no power is exercised, no institutional event is
created, and no obligation is fulfilled, and that with a binding only
the bound member does these things. The expected records
of the scenario tests were derived from the text of this appendix
before the runtime was run, and the runtime produced them.

An independent review of the first version of the runtime found
defects that these tests had not shown, in the implementation and in
the text. All of them let a message take effect that should not have,
and all are corrected. The grounds of a hold were kept per contract and
not per contract instance, so an approval also covered the same
prohibition in an instance created later (G.6). The re-check of a
released message tested only new prohibitions, so a message was
released although another governing contract no longer allowed it, for
example after a revocation (G.6; the text said "nothing else is
re-checked"). An actor reference with a range in a `trigger:`, an
`until:`, or a `counts_as:` rule matched every actor of that name, and
`A[*]` matched actors outside the declared set; this was a defect of
`cadl norms-eval` since 0.3.20 (F.3, F.10). An instance observed
messages that its contract does not govern (G.5). The generated traces
had also shown one defect: holds that expired together were closed in
the order of creation, not of their deadlines.

A second review confirmed these corrections and found what the rule of
governed observations had opened. A message event of an enforced
contract that names an actor who is not a party could never occur, so a
prohibition triggered by such an actor never came into force; G-17 now
makes that an error. An index variable that the contract instance does
not bind matched every member of the set in a `trigger:`, an `until:`,
or a `counts_as:` rule, so any member could activate a permission or
lift a prohibition; G-18 excludes it, and the runtime resolves the
unknown occurrence fail-closed (G.5). A set with a symbolic upper bound
took an index below its lower bound as a member, in the decision
function, the Rego policy, and `cadl norms-eval`.

A third review found that the unbound index was still a way through
for powers and obligations, which the second model does not have: with
a bearer `SUP[k]` and no binding for `k`, any member of `SUP` exercised
a power that suspends a prohibition or activates a permission, and a
message to any member fulfilled an obligation whose reparation is a
prohibition. The cause was the same in every case, a contract instance
that runs with an index unbound, and it is now removed at the root:
G-18 covers every index variable of an enforced contract, the runtime
refuses an instance that does not bind the indices of its parties, and
its functions refuse a file with errors. The fail-closed resolution of
G.5 is complete and remains as a second line. G-17 also rejects a
literal index outside the declared set, and says that coverage is by
one party reference.

A fourth review found the same cause once more, in a place the rule
did not yet name: an index variable in a predicate. A prohibition with
the `trigger:` `W[j].alarm == true` and no party `W[j]` passed the
check and never came into force. G-18 now covers every predicate of an
enforced contract, with the exception of a variable that a quantifier
binds, and the runtime resolves such a predicate as an unknown
occurrence. The review also found that the runtime took the quantity
names of an instance from the whole trace, so a value given after the
end of an instance could change its verdict from violated to
fulfilled, and that it accepted a binding outside the declared set, so
a prohibition of `W[i]` applied to nobody; both are corrected.

A fifth review found that decisions depended on later lines of the
trace. The runtime had taken the quantity names from the whole trace
since its first version, and the correction after the fourth review
had only narrowed that to the lines of the instance: a value that a
later line gave to a name changed how an earlier predicate read that
name, and with it an earlier decision from deny to allow. The runtime now
decides causally (G.5): the names are given with the trace, or a name
becomes a quantity with its first value. The tests check, for every
prefix of generated traces, that the decisions on the prefix are the
first decisions on the whole trace; that invariant was missing. G-18
also missed an index variable inside an index expression and inside
the arguments of a message event; it is now stated by its binders, and
the checker walks every expression of the contract.

A sixth review found one more look-ahead of the same kind: whether a
contract has host-created instances was read from the whole trace, so
an `instances` entry on a later line removed the single instance from
the start and changed an earlier denial into an allowance. It is now
fixed on the first line. The review also led to the rule for missing
data in G.5: a prohibition whose `trigger:` could not be evaluated for
want of a value was not in force, and a message was allowed on data
that the enforcement point did not have.

A seventh review found that this rule looked only at the predicate of
the norm itself: a prohibition whose `trigger:` is an institutional
event that a rule creates from a predicate was not in force while that
predicate had no value. The rule of G.5 now reaches through such an
event, and G-19 and the two limits above state what it does not
reach.

Writing and reviewing the runtime showed these gaps in the text of
agents 0.1, which this revision of the appendix closes: the state on
which a message is decided did not include deadlines that had passed
since the last observation, and it was not said which contract
instances observe an allowed message (G.5); the grounds of a hold, the
contract instance in which an `approval` has to be created, the
decision at a release, and the order of holds that expire together were
not stated or were stated too weakly (G.6); whether the `until:` of a
delegation ends the entry or its instances was open (G.7); the
`fallback` that G.12 lets the sender find in a closing record was
excluded by G.10; the records of grants, revocations, unauthorised
acts, and other changes of state had no format (G.8); and nothing
required the contract to govern the messages its events name, or to
bind the indices they use (G-17 and G-18, added at the end of G.9; no
earlier rule changes).

The generated policies have been run with OPA 1.22.3 and the Cedar CLI
4.14.1 and compared with `cadl agents-decide`. Under OPA the full
result was equal for 20 400 inputs (three variants of a file with two
enforced contracts, actor sets, contract instances, in-force flags, and
delegation chains). Under Cedar the outcome was equal for 5 640
requests, where Deny stands for deny and escalate, except for the case
that G.10 names: a prohibition that is not static is not enforced by
the Cedar policies. The tests of the reference implementation repeat
both comparisons when `opa` or `cedar` is installed. This run found a
defect in the Rego policy of `cadl` 0.3.20: a reference `A[i]` whose
index the contract instance does not bind was treated as no match
instead of unknown (G.4), so a prohibition with such a bearer did not
apply, and a contract with `default: allow` allowed the message.
`cadl` 0.3.21 corrects it; a policy generated by 0.3.20 SHOULD be
generated again.

## G.14 Backward compatibility

Files written against CADL v0.3 without this extension remain valid and
are read the same way; so are files that declare only `norms: 0.1`. A
contract without the key `enforcement:` is not enforced, and its norms
keep exactly the meaning of [Appendix F](./appendix-f-norms.md). For an
enforced contract this appendix makes these additions to F.5 and no
other change: the instance of a contract without host exists from the
start of the enforcement point; a denied or held message is not an
observation; an instance of an enforced contract observes only the
messages that its contract governs, and an occurrence that depends on
an unbound index is unknown; the in-force flag is unknown while a
quantity that it depends on has no value, without a change to the
states of F.5; the time of a decision is observed
before the message is decided; permissions and prohibitions have an in-force flag; an
obligation whose content the contract itself denied or held is
`excused` (all G.5); `approval` and `rejection` carry a hold id, the
order of steps is extended, and a released message does not violate
its grounds (G.6); permissions have derived instances (G.7).

A file that uses `agent:`, `enforcement:`, `delegations:`, or
`on_denied:` without declaring `agents: 0.1` does not conform to this
appendix. An agents-aware processor does not interpret these keys in
such a file (they are not checked and not lowered to the IR) and SHOULD
emit one warning per file that names the keys used. A file that
declares `agents: 0.1` without `norms: 0.1` gets the error of G-1.
Processors that do not
implement the extension MUST NOT reject files that use it; they SHOULD
emit a single informational diagnostic per file.
