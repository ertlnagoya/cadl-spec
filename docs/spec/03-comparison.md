---
sidebar_position: 3
title: "3. Comparison with Existing Languages"
description: "How CADL relates to MOISE+, OperA, Symboleo, AADL contract extensions, SysMLv2, smart contracts, and the IAD framework, and what sets it apart."
---

## 3.1 Overview of Related Languages and Frameworks
**MOISE+:** A structural, functional, and deontic description model for
organizational multi-agent systems [[Hübner+, 2007]](./appendix-b-references.md). Can formally describe organizational
roles, groups, and missions, but contracts and algorithms are outside
scope.

**OperA:** An organizational model for agent-based systems [[Dignum, 2004]](./appendix-b-references.md). Describes
organizations from three perspectives: social structure, interaction
structure, and normative structure. Has some protocol description
support, but does not address SoS institutional layer.

**Symboleo:** A formal specification language for legal contracts [[Sharifi+, 2020]](./appendix-b-references.md). Can
precisely describe contract parties, obligations, rights, and violation
conditions, but integration with organizational structure, protocols,
and technical architecture is outside scope.

**AADL Contract Extension:** An extension of Architecture Analysis and
Design Language [[Feiler & Gluch, 2012]](./appendix-b-references.md) that introduces contract concepts. Integrates
assume-guarantee contracts into architecture descriptions, but does not
target SoS institutional layer in design.

**SysMLv2 / HAMR:** Next-generation system modeling language [[OMG, 2025]](./appendix-b-references.md), and a
model-driven code generation toolchain that originated for AADL and also targets SysMLv2 [[Hatcliff+, 2021]](./appendix-b-references.md). Excellent for architecture description, but
institutional design variables are outside scope.

**Smart Contracts (Solidity, etc.):** Implementation platform for
distributed self-governance; Solidity [[Solidity Documentation]](./appendix-b-references.md) is a representative language, and a finite-state-machine-based design method for secure contracts has been proposed [[Mavridou & Laszka, 2018]](./appendix-b-references.md). Promising for C-SoS governance
implementation, but does not provide verification at design stage or
three-layer integrated description.

**IAD Framework:** Ostrom's Institutional Analysis and Development
framework [[Ostrom, 2005]](./appendix-b-references.md). Conceptually analyzes governance of shared resources, but is
not a formal description language and parametrization is limited.

## 3.2 Comparative Analysis
The table below organizes how existing approaches address requirements
needed for SoS institutional design. Legend: ◎=Core feature, ○=Partial
support, △=Limited, ×=Out of scope. The ratings reflect the authors'
reading of each language's specification and of the literature in
[Appendix B](./appendix-b-references.md). The CADL column shows
the intended scope of the language design; it does not mean that the
current reference implementation already provides every item.

| **Requirement** | **MOISE+** | **OperA** | **Symboleo** | **AADL Ext.** | **SysMLv2** | **Smart<br />Contracts** | **CADL<br />(This Language)** |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Organization structure description | ◎ | ○ | × | ○ | ◎ | × | ◎ |
| Contract description | × | × | ◎ | △ | × | ◎ | ◎ |
| Protocol description | △ | ○ | × | △ | △ | △ | ◎ |
| Algorithm reference | × | × | × | ○ | ○ | △ | ◎ |
| SoS institutional parametrization | × | × | △ | × | × | × | ◎ |
| Dynamic institutional switching | × | × | × | × | × | × | ◎ |
| Formal verification | △ | △ | ○ | ◎ | △ | △ | ◎ |
| Runtime monitoring | △ | △ | × | △ | × | ◎ | ◎ |
| Environment modeling | × | × | × | △ | ○ | × | ◎ |
| AI integration | × | × | × | × | × | △ | ◎ |
| Versioned amendment with transitional provisions | △ | × | × | × | △ | ○ | ◎ |
| Checked records of decisions and delegation | △ | × | × | × | × | △ | ○ |

The last two rows concern the amendment of an institution and the
records of the decisions that amend it
([Appendix K](./appendix-k-amendment.md),
[Appendix L](./appendix-l-decisions.md)). A reorganisation in MOISE+ is
a plan of changes to the organisational specification that roles
propose, select and carry out, and a Historian role logs each change
[[Hübner+, SBIA 2004]](./appendix-b-references.md); versions of the organisation, and how a
running organisation passes to a new one, are not defined. OperA leaves
changing a running society to future work [[Dignum, 2004]](./appendix-b-references.md).
SysML v2 keeps the history of a model as immutable commits with
branches and tags [[OMG, Systems Modeling API 2025]](./appendix-b-references.md), but for the
design repository rather than for running instances, and a commit
records no decider and no reason. DAO governors delay the execution of
an adopted proposal by a timelock, and record proposals, votes and
delegated votes [[Compound Governance]](./appendix-b-references.md); they do not check a
decision afterwards against a model's declaration of who may amend
what. CADL is rated ○ in the last row because Appendix L checks a record
after the fact and enforces nothing at run time.

## 3.3 Uniqueness of CADL
Within the scope of our survey, we found no existing approach that
alone satisfies all requirements. CADL's distinguishing features are
summarized in four points:

**(1) Three-layer integrated description:** CADL consistently describes
three layers within a single language:
institutions (authority, incentives, information sharing), protocols
(coordination procedures, timing constraints), and algorithms (abstract
references to computational methods). Within the scope of our survey, we
found no existing DSL that covers all three layers in one language.

**(2) Parametric institutional design:** Directly supports regime map
construction by defining institutional design variables such as decision
centralization degree (β), information sharing degree (α), and
incentive intensity (λ) as numerical parameters.

**(3) Unified describe-verify-deploy-monitor cycle:** Aims to support formal
verification at design stage (consistency and safety), code generation
at deployment, and runtime monitoring at operation, all on a unified
language foundation.

**(4) Decisions about the institution, checked against it:** Amendments
are recorded with the same evidence for every kind of decider, whether a
person, an LLM or a tool, and the record is checked against the
amendable parameters and the authorities that the model itself declares
([Appendix K](./appendix-k-amendment.md) and
[Appendix L](./appendix-l-decisions.md)). The check says who decided
within which authority; it does not say whether the decision was right.

## 3.4 Records of Decisions and Delegation
The languages of Section 3.2 describe institutions; the records of
decisions that amend them ([Appendix L](./appendix-l-decisions.md)) are
closer to work outside language design, and each of their parts has
precedents. Recording the question, the options, the reasons and the
assumptions of a decision is the practice of design rationale since IBIS
[[Kunz & Rittel, 1970]](./appendix-b-references.md) and of architecture
decision records, which are superseded rather than rewritten
[[Nygard, 2011]](./appendix-b-references.md). W3C PROV-DM defines
delegation (`actedOnBehalfOf`) for agents of every kind, people and
software alike [[W3C PROV-DM, 2013]](./appendix-b-references.md). OAuth
token exchange carries who acts for whom
[[RFC 8693]](./appendix-b-references.md), and recent work on LLM agents
gives a delegation a scope, an expiry and revocation
[[Tomašev+, arXiv 2026]](./appendix-b-references.md). DAO governors
record proposals, votes and delegated votes, and execute what passes
[[Compound Governance]](./appendix-b-references.md). Regulatory impact
assessment fixes, before a rule is adopted, how and when it will be
evaluated [[EC, Better Regulation 2021]](./appendix-b-references.md).
Assurance cases are generated from models and re-evaluated during
operation [[Wei+, JSS 2024]](./appendix-b-references.md). In normative
multi-agent systems, the rules of an institution are changed by those
with the institutionalised power to change them
[[Jones & Sergot, 1996]](./appendix-b-references.md),
[[Pitt+, TAAS 2012]](./appendix-b-references.md), and a monitor can
follow norms that are added and removed at run time
[[Gómez-Sebastià, 2016]](./appendix-b-references.md).
Recent work on LLM agents comes closer. Arguments drafted by an LLM can
be admitted into a decision record only after deterministic checks of
their evidence, with W3C PROV provenance of what the model wrote and a
GSN-like view [[Moghaddam, arXiv 2026]](./appendix-b-references.md); rules legislated by
agents can be layered under contracts that people write and agents
cannot change, with every agent bound to a human principal
[[Ruan & Zhang, arXiv 2026]](./appendix-b-references.md); and the authority delegated along a
chain of LLM agents can be narrowed, given an expiry, revoked, and
reconstructed afterwards from what was done under it
[[Patil, arXiv 2026]](./appendix-b-references.md),
[[Mishra & Sharad, arXiv 2026]](./appendix-b-references.md). These works check authority
before an action takes effect or record the actions taken under a
delegation. In the first, the LLM drafts and a person decides; in the
second, the declaration of who may change which contracts is enforced
beforehand rather than checked against a record of the decisions.

Appendix L combines these parts for the amendments of an institutional
model. Within the scope of our survey, we found no record format that is
checked afterwards against the model's own declaration of what may be
amended, within which range and step, by whom and by which procedure
(Appendix K, K.3); that requires the same evidence of a person, an LLM
and a tool; that reports a decision made on behalf of another party
outside the layers and procedures it was delegated; and that accepts a
promise to re-measure as kept only when a later measurement under the
same conditions shows it. CADL does not claim the parts: rationale
fields, hash chains, delegation and its provenance, ex-post evaluation,
and the generation of GSN are established. Work on LLM delegation and
on audit trails of agents is appearing quickly, so this comparison
reflects the literature as of November 2026.
