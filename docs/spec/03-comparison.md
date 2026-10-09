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

## 3.3 Uniqueness of CADL
Within the scope of our survey, we found no existing approach that
alone satisfies all requirements. CADL's distinguishing features are
summarized in three points:

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
