---
sidebar_position: 2
title: "2. Language Objectives"
description: "The problems CADL addresses, its design philosophy and principles, and the users and application scenarios it targets."
---

## 2.1 Problems CADL Solves
This chapter, like Chapter 1, describes the goals of the language; what
the reference implementation provides today is listed in
[Chapter 10](./10-roadmap.md) and [Appendix A, §A.12](./appendix-a-syntax.md#a12-reference-implementation-status-v03).

CADL aims to describe the three layers of institutions, protocols, and
algorithms in a single language for SoS, and to verify consistency and safety
through formal verification at the design stage. The goal is to establish an
engineering cycle for institutions: "describe → verify → deploy →
monitor."

CADL addresses the following specific problems:

**Formalization of institutions:** Convert natural language
institutional descriptions into machine-readable and verifiable formats.
Enable authority structures, information sharing scope, and incentive
designs to be expressed as quantitative parameters.

**Automatic consistency verification:** Automatically detect
contradictions between multiple contracts, authority conflicts, and
deadlock possibilities at the design stage.

**Dynamic institutional regime transitions:** Describe dynamic
institutional switching in response to environmental changes (e.g.,
transition from C-SoS to A-SoS) with safety guarantees.

**Compositional verification support:** When constituent systems join or
leave, verify integrity using differential verification rather than full
re-verification.

**Runtime monitoring:** Support runtime monitoring of deployed
institutions and detection/response to contract violations.

## 2.2 Design Philosophy and Principles
**Declarative description:** Describe what institutions should achieve,
while the toolchain determines how. Designers are freed from
implementation details.

**Hierarchical composition:** Adopt a hierarchical description structure
corresponding to the five-layer classification of SoS design
[[Shimoyama & Matsubara, 2026]](./appendix-b-references.md): (1) Objective (policy), (2) Institutional and Governance,
(3) Control and Coordination, (4) Execution and Operation, and
(5) Environment and Disturbance. CADL's own three layers sit inside this
classification as follows.

| **Five-layer classification** | **Where it appears in CADL** |
| --- | --- |
| 1. Objective (policy) | Not a layer of CADL. The evaluation criteria that follow from the objectives are written in `metrics:`. |
| 2. Institutional and Governance | **Institution layer**: `contracts:` (authority, information, responsibilities, incentives) and `transitions:`. |
| 3. Control and Coordination | **Protocol layer** (`protocols:`, the coordination procedure) and **Algorithm layer** (`algorithms:`, which names the central and local algorithms without describing their internals). |
| 4. Execution and Operation | Outside the language. It is reached through code generation and simulator configs ([Appendix D](./appendix-d-codegen.md)). |
| 5. Environment and Disturbance | Not a layer of CADL. Assumptions about the environment are written in `context:`. |

**Parametric institutional design:** Make institutional parameters such
as information sharing degree (α), decision centralization degree (β),
and incentive intensity (λ) numerically manipulable.

**Contract-based composition:** Based on assume-guarantee contracts,
clearly specify each actor's preconditions and guarantees, enabling
compositional verification.

**Incremental refinement:** Enable gradual refinement from abstract
institutional descriptions to detailed implementation specifications. At
early design stages, allow natural language-like descriptions and
progressively add information needed for verification.

**Domain-independent:** Provide domain-independent descriptive
capability applicable to transportation, energy, IoT, daily life, etc.
Domain-specific extensions are provided through libraries.

**Universal Readability:** Enable students, enterprise practitioners,
municipal officials, citizens, and other stakeholders without
specialized knowledge of programming or formal methods to understand the
intent and structure of institutional descriptions. The means include
YAML-based declarative syntax, vocabulary close to natural language,
graduated description levels, and AI-assisted barrier reduction.

## 2.3 Target Users and Application Scenarios
Based on the principle of "universal readability," CADL envisions a
broad range of users from experts to non-experts. Below are the main
user archetypes and their levels of involvement.

**SoS Architects and Designers:** Experts who design and verify
institutional structures for large-scale SoS. Primarily use
verification-level descriptions and define formal assume-guarantee
contracts.

**Institutional Design Researchers:** Researchers who experimentally
verify theories such as game theory and mechanism design. Leverage
parametric design-level descriptions and explore institutional parameter
spaces.

**Students and Educators:** Students and instructors learning SoS and
institutional design concepts in university and technical college
courses. Start with overview-level descriptions and progress to design
level. Educational templates and AI support accelerate learning.

**Enterprise Practitioners and Project Managers:** Practitioners
designing inter-departmental cooperation rules and supply chain
institutions. Use natural language-like overview-level descriptions,
with AI supporting refinement to design level.

**Municipal Officials and Policymakers:** Government officials
responsible for institutional design in regional public service
coordination and smart city initiatives. Through visualization and AI
support, participate in institutional discussion and consensus-building
without focusing on technical details.

**Citizens and Community Participants:** Users who describe household
rules, condominium management institutions, and local community
institutions in CADL with AI support. Participate in everyday
institutional design through overview-level descriptions and AI
dialogue.

**AI Agents:** AI systems that perform automatic conversion from natural
language to CADL descriptions via LLM and provide institutional
recommendations based on CADL. Generate and process descriptions at all
levels.

Below shows the correspondence of description levels and support
mechanisms for each user type.

| **User Type** | **Primary Description Level** | **Primary Support Means** |
| --- | --- | --- |
| SoS Architect | Verification Level (Formal Descriptions) | IDE Plugin, Type Checker |
| Researcher | Design Level (Parametric) | Parameter Exploration Tools |
| Student/Educator | Overview → Design Level | Educational Templates, Tutorials |
| Enterprise Practitioner | Overview Level → AI Refinement | AI Support, Visualizer |
| Municipal Official | Overview Level | Visualization, AI Dialogue |
| Citizen | Overview Level (AI-Supported) | NL→CADL Conversion, AI Assistant |
| AI Agent | All Levels | API, Parser Library |
