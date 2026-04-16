---
sidebar_position: 3
title: "Comparison with Existing Languages"
---

## 3.1 Overview of Related Languages and Frameworks
**MOISE+:** A structural, functional, and deontic description model for
organizational multi-agent systems. Can formally describe organizational
roles, groups, and missions, but contracts and algorithms are outside
scope.

**OperA:** An organizational model for agent-based systems. Describes
organizations from three perspectives: social structure, interaction
structure, and normative structure. Has some protocol description
support, but does not address SoS institutional layer.

**Symboleo:** A formal specification language for legal contracts. Can
precisely describe contract parties, obligations, rights, and violation
conditions, but integration with organizational structure, protocols,
and technical architecture is outside scope.

**AADL Contract Extension:** An extension of Architecture Analysis and
Design Language that introduces contract concepts. Integrates
assume-guarantee contracts into architecture descriptions, but does not
target SoS institutional layer in design.

**SysMLv2 / HAMR:** Next-generation system modeling language and its
code generation tool. Excellent for architecture description, but
institutional design variables are outside scope.

**Smart Contracts (Solidity, etc.):** Implementation platform for
distributed self-governance. Promising for C-SoS governance
implementation, but does not provide verification at design stage or
three-layer integrated description.

**IAD Framework:** Ostrom's Institutional Analysis and Development
framework. Conceptually analyzes governance of shared resources, but is
not a formal description language and parametrization is limited.

## 3.2 Comparative Analysis
The table below organizes how existing approaches address requirements
needed for SoS institutional design. Legend: ◎=Core feature, ○=Partial
support, △=Limited, ×=Out of scope.

  --------------------------------------------------------------------------------------------------------------------------------------------
  **Requirement**                      **MOISE+**   **OperA**   **Symboleo**   **AADL Ext.**   **SysMLv2**   **Smart\      **CADL\
                                                                                                             Contracts**   (This Language)**
  ------------------------------------ ------------ ----------- -------------- --------------- ------------- ------------- -------------------
  Organization structure description   ◎            ○           ×              ○               ◎             ×             ◎

  Contract description                 ×            ×           ◎              △               ×             ◎             ◎

  Protocol description                 △            ○           ×              △               △             △             ◎

  Algorithm reference                  ×            ×           ×              ○               ○             △             ◎

  SoS institutional parametrization    ×            ×           △              ×               ×             ×             ◎

  Dynamic institutional switching      ×            ×           ×              ×               ×             ×             ◎

  Formal verification                  △            △           ○              ◎               △             △             ◎

  Runtime monitoring                   △            △           ×              △               ×             ◎             ◎

  Environment modeling                 ×            ×           ×              △               ○             ×             ◎

  AI integration                       ×            ×           ×              ×               ×             △             ◎
  --------------------------------------------------------------------------------------------------------------------------------------------

## 3.3 Uniqueness of CADL
As is clear from the above comparison, no existing approach alone
satisfies all requirements. CADL's uniqueness is summarized in three
points:

**(1) Three-layer integrated description:** The only DSL that can
consistently describe three layers within a single language:
institutions (authority, incentives, information sharing), protocols
(coordination procedures, timing constraints), and algorithms (abstract
references to computational methods).

**(2) Parametric institutional design:** Directly supports regime map
construction by defining institutional design variables such as decision
decentralization degree (β), information sharing degree (α), and
incentive intensity (λ) as numerical parameters.

**(3) Unified describe-verify-deploy-monitor cycle:** Realizes formal
verification at design stage (consistency and safety), code generation
at deployment, and runtime monitoring at operation, all on a unified
language foundation.
