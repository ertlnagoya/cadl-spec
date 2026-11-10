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
| **Ground** | A prohibition that applies to a message in the decision function. |
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
observations, and the decision MUST be deterministic.

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
  with the time of the decision as its time stamp.
- **`deny`.** The message does not take effect and is **not an
  observation**: it triggers no norm, creates no institutional event,
  fires no lifecycle transition, fulfils no obligation, and violates no
  prohibition. The enforcement point SHOULD return the result to the
  sender.
- **`escalate`.** The message is held (G.6); while held it is not an
  observation.

The deadlines of Appendix F keep running while a message is denied or
held. A denied `trigger:` message does not activate its norm. As an
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
none). A hold without deadline in a contract instance that never ends
is held for ever. How the hold id reaches the approver depends on the
protocol.

| State | Entered when | Closing record (G.8) |
| --- | --- | --- |
| `held` | the hold is created; the only state that is not final | — |
| `approved` | the approver approves; the message is released | `allow`, reason `approved` (or the denial of the re-check) |
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
  `held` hold and whose performer (F.5, item 7) is the approver of that
  hold makes it `approved` (`rejected`). Any other `approval` or
  `rejection` changes no hold and SHOULD be recorded as unauthorised.
  Then the grants, revocations, and `until:` events of G.7 are applied.
- **In step 6:** when a contract instance ends, the `held` holds with a
  ground in it become `cancelled`, before its norms are settled.
- **After step 6:** each hold that became `approved` at this
  observation is released, in the order of creation.

**Release.** The message is re-checked on the current state. It is
denied with the reason `undeclared_tool` if it is now a call of an
undeclared tool, `no_instance` if a contract instance of a ground is no
longer running, and `prohibition` (with that prohibition in `norms`) if
a prohibition outside the grounds of the hold now applies. Nothing else
is re-checked: the approval stands in for the permission. Otherwise the
message takes effect as **the immediately following observation, with
the time stamp of the approving observation**, before any other message
is decided. As an addition to F.5, item 3, it is not an occurrence of
the content of the prohibitions among its grounds: an approved
exception does not violate them. An approval releases one message; a
later message with the same sender, receiver, and name is decided
again.

**Expiry.** Before each decision and each observation whose time is
later than the deadline of a `held` hold, that hold becomes `expired`.
An approval at exactly the deadline is in time.

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
`until:` of the entry occurs, as for the `until:` of a norm; (c) the
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
| `instances` | The running instances of the governing contracts: contract `id` and an identifier of the instance. |
| `hold_id` | For an `escalate` decision and for the record that closes the hold; otherwise `null`. |
| `outcome` | In the record that closes a hold, its final state; otherwise `null`. |

An `escalate` decision gives two records with the same `hold_id`: one
when the hold is created and a **closing record** when it reaches a
final state (table of G.6); the closing record keeps the `contracts`,
`norms`, and `escalate_to` of the hold, unless the re-check denies.
Grants, revocations, and acts recorded as
unauthorised SHOULD be written to the same log.

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
  these are the only uses that are errors. A reference to the two
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
  enforced contract, with no index bound and no derived instance. Per
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
- `escalate_to`: the approver for `escalate`, as a concrete actor;
  otherwise `null`.
- `timeout` (milliseconds), `fallback` (message events as text), and
  `notify` (actor references) are filled whenever the reason is
  `prohibition`, for `deny` as well as for `escalate`, from the
  grounds, without duplicates, in the order of declaration; for every
  other reason they are `null`, `[]`, and `[]`.

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
becomes `approved`. After step 6 the re-check finds a declared tool, a
running instance, and no prohibition outside the grounds, so the held
message becomes the next observation, with the time stamp 09:03:40. It
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
`cadl check` (the SHOULDs as warnings), and lowers the blocks to the IR
above; a `timeout:` given as a bare number is read as seconds, the
lenient form that
[A.12](./appendix-a-syntax.md#a12-reference-implementation-status-v03)
describes for deadlines. `cadl agents-decide` implements the decision
function of G.5 over the policy input of G.10. It is stateless: holds,
release, expiry, grants, and revocations are not implemented, and valid
derived instances come in through the input. `cadl codegen -t
agent-rego` emits a Rego policy that returns the full result, and
`-t agent-cedar` emits Cedar policies for the static norms with a side
table. The tests of the reference implementation run the generated
Rego against an OPA engine only when `opa` is installed, and do not
run the Cedar policies at all. No command produces audit records
(G.8).

## G.14 Backward compatibility

Files written against CADL v0.3 without this extension remain valid and
are read the same way; so are files that declare only `norms: 0.1`. A
contract without the key `enforcement:` is not enforced, and its norms
keep exactly the meaning of [Appendix F](./appendix-f-norms.md). For an
enforced contract this appendix makes these additions to F.5 and no
other change: the instance of a contract without host exists from the
start of the enforcement point; a denied or held message is not an
observation; permissions and prohibitions have an in-force flag; an
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
