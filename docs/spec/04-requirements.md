---
sidebar_position: 4
title: "4. Requirements Specification"
description: "Functional requirements, non-functional requirements, and constraints that the CADL language and its toolchain aim to meet."
---

## 4.1 Functional Requirements

The requirements in this chapter are targets for the CADL language and
its toolchain; they do not state that the current implementation meets
them. [Chapter 10](./10-roadmap.md) gives the implementation status per
implementation phase, not per requirement.

### 4.1.1 Institution Description (FR-1)

| **ID** | **Requirement Name** | **Description** |
| --- | --- | --- |
| FR-1.1 | Actor Definition | Be able to define SoS constituent systems (actors) with identifiers, roles, and autonomy levels. |
| FR-1.2 | Contract Definition | Be able to define contracts including parties, authority scope, information sharing structure, responsibilities, and incentives. |
| FR-1.3 | Authority Structure Description | Be able to explicitly describe decision scope and decision makers, quantifiable by the decision centralization degree β (0 = distributed, 1 = centralized). |
| FR-1.4 | Information Sharing Structure Description | Be able to define observable information for each actor and sharing modes (push/pull/broadcast). |
| FR-1.5 | Incentive Description | Be able to define incentive structures including rewards, penalties, and reputation mechanisms. |
| FR-1.6 | Environment Modeling | Be able to define environmental parameters such as latency, failure rate, and demand rate as intervals or probability distributions. |

### 4.1.2 Protocol Description (FR-2)

| **ID** | **Requirement Name** | **Description** |
| --- | --- | --- |
| FR-2.1 | Event-Driven Protocol | Be able to define message exchange procedures between actors based on trigger conditions. |
| FR-2.2 | Timing Constraints | Be able to impose time constraints such as response time limits, timeouts, and periodic execution. |
| FR-2.3 | Fallback Definition | Be able to define alternative behaviors on timeout or failure. |
| FR-2.4 | Protocol Composition | Be able to define composite protocols combining parallel execution, sequential execution, and conditional branches of multiple protocols. |

### 4.1.3 Algorithm Reference (FR-3)

| **ID** | **Requirement Name** | **Description** |
| --- | --- | --- |
| FR-3.1 | Algorithm Abstract Reference | Be able to reference algorithms such as route planning and optimization by name and input/output interface. |
| FR-3.2 | Algorithm Switching | Be able to describe dynamic algorithm switching in response to environmental conditions or governance structures. |

### 4.1.4 Verification (FR-4)

| **ID** | **Requirement Name** | **Description** |
| --- | --- | --- |
| FR-4.1 | Static Type Checking | Be able to statically check consistency of contract parties, authorities, and information sharing. |
| FR-4.2 | Consistency Verification | Be able to detect contradictions in obligations between contracts and authority conflicts. |
| FR-4.3 | Deadlock Detection | Be able to detect deadlock possibilities between protocols. |
| FR-4.4 | Safety Verification | Be able to verify maintenance of safety invariants during institutional transitions. |
| FR-4.5 | Compositional Verification | Be able to confirm overall consistency through differential verification when actors join or leave. |

### 4.1.5 Regime Transition (FR-5)

| **ID** | **Requirement Name** | **Description** |
| --- | --- | --- |
| FR-5.1 | Transition Condition Definition | Be able to define institutional transition conditions based on environmental parameter thresholds. |
| FR-5.2 | Transition Protocol | Be able to describe transition procedures during institutional switching (gradual switching, rollback, etc.). |
| FR-5.3 | Regime Map Definition | Be able to define institutional boundaries in environmental parameter space. |

## 4.2 Non-Functional Requirements

The following are likewise targets, including the quantitative ones
(e.g. NFR-3) and the conversion targets (NFR-5); see
[Chapter 10](./10-roadmap.md) for what the current implementation
provides. The v0.1 expression grammar
([Appendix A, §A.1](./appendix-a-syntax.md#a1-lexical-rules)) admits ASCII
identifiers only, so NFR-7 is not yet met.

| **ID** | **Requirement Name** | **Description** |
| --- | --- | --- |
| NFR-1 | Universal Readability | A broad range of stakeholders including students, enterprise practitioners, municipal officials, and citizens can understand the intent and structure of institutional descriptions. The primary means are YAML-based declarative syntax, vocabulary close to natural language (authority, responsibility, incentive, etc.), and graduated description levels (overview/design/verification). |
| NFR-2 | Graduated Participation | Provide three graduated description levels (overview, design, verification) matching user expertise, enabling non-experts to participate from overview level and experts up to verification level, each according to their abilities. |
| NFR-3 | Scalability | Be able to process SoS descriptions including 100 or more actors and 50 or more contracts within practical timeframes (verification: within minutes). |
| NFR-4 | Extensibility | Have a plugin mechanism to add domain-specific vocabulary and constraints as libraries. |
| NFR-5 | Interoperability | Support code generation to SysMLv2 [[OMG, 2025]](./appendix-b-references.md), AADL [[Feiler & Gluch, 2012]](./appendix-b-references.md), and smart contracts (Solidity [[Solidity Documentation]](./appendix-b-references.md)). |
| NFR-6 | AI Affinity | Ensure syntax is regular and has little ambiguity so LLMs can generate, modify, and explain CADL descriptions from natural language. Designed with AI-assisted barrier reduction (NL→CADL conversion, natural language explanation generation) in mind. |
| NFR-7 | Internationalization | Be able to use Unicode characters (Japanese, etc.) in identifiers, with multilingual comment support. |
| NFR-8 | Visualization | Automatically generate diagrams such as authority structure diagrams, protocol sequence diagrams, and regime maps from CADL descriptions, enabling non-technical users to visually grasp the overall institutional picture. |

## 4.3 Constraints

| **ID** | **Description** |
| --- | --- |
| C-1 | Be able to map to the five-layer framework [[Shimoyama & Matsubara, 2026]](./appendix-b-references.md); the mapping is given in [Section 2.2](./02-objectives.md). |
| C-2 | Be able to describe SoS classifications (D/A/C/V-SoS) from [ISO/IEC/IEEE 21841:2019](./appendix-b-references.md). |
| C-3 | Be able to integrate with IEC 62853 [[IEC 62853:2018]](./appendix-b-references.md) process views (consensus-building, accountability, fault response, change management). |
| C-4 | Have a formal foundation based on assume-guarantee contract semantics. |
