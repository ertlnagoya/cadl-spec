---
sidebar_position: 1
title: "1. Introduction"
description: "Purpose and scope of the CADL specification, the challenges of SoS institutional design that motivate the language, and an introductory glossary."
---

## 1.1 Purpose and Scope
CADL (Contract Architecture Description Language) is a domain-specific
language (DSL) for formally specifying, verifying, and deploying
institutional designs in System of Systems (SoS). This document presents
the CADL language specification (Version 0.3, Draft), covering language
objectives, requirements, syntax and semantics definitions, and
toolchain design.

This document consolidates the specification for CADL implementation
based on a survey of SoS research and SoS
architecture design studies conducted at the ERTL.

Chapters 1 and 2 describe the goals of the language; what the reference
implementation provides today is listed in [Chapter 10](./10-roadmap.md)
and [Appendix A, §A.12](./appendix-a-syntax.md#a12-reference-implementation-status-v03).

## 1.2 Background: Challenges of Institutional Design in SoS
An SoS is a system configuration in which multiple independently
operated systems cooperate to achieve capabilities that no single system
can achieve alone [[Maier, 1998]](./appendix-b-references.md). [[ISO/IEC/IEEE 21841:2019]](./appendix-b-references.md) classifies SoS into four
types: Directed, Acknowledged, Collaborative, and Virtual.

Traditional SoS research has focused on control/coordination algorithms
and technical optimization, but governance and institutional design are
now recognized as upper-layer design variables that structurally
determine overall system behavior. However, current SoS institutional
design relies on natural language contracts and agreements, presenting
the following challenges.

-   Difficulty detecting ambiguity and contradictions: Natural language
    institutional descriptions cannot be formally verified for
    consistency.

-   Lack of consistency guarantees for institutional updates:
    Institutional updates accompanying system addition/removal are
    manual, with no engineering means for consistency checking.

-   Gap between design and implementation: There are no means to verify
    that institutional design intent is accurately reflected in
    implementation.

-   Absence of institutional parameterization: No framework exists that
    treats governance structures as quantitatively manipulable
    variables.

-   Lack of three-layer integrated description: No language can
    uniformly describe institutions (authority structures), protocols
    (coordination procedures), and algorithms (computational methods).

-   Difficulty of non-expert participation: Existing formal methods and
    architecture description languages presume advanced expertise,
    making it difficult for students, enterprise practitioners,
    municipal officials, and citizens to actively participate in
    institutional design.

In addition to the above challenges, a fundamental motivation for CADL
is the need to treat SoS institutional design as a computational object.
The following three objectives serve as the direct motivation for
designing the CADL language.

### Objective 1: Making SoS Institutional Design Computationally Tractable

In real-world SoS, many institutions exist as human tacit knowledge,
customs, and rules of thumb, often without any documentation. For
example, household chore-sharing rules, implicit agreements in local
communities, and informal inter-organizational cooperation exist only in
participants' minds, making external observation and analysis extremely
difficult.

CADL's primary objective is to model and formalize real-world SoS
institutions, including such tacit rules and customs, making them
manipulable as computational objects. When institutions exist as
computational data, the following operations become possible.

-   Copy and reuse: Effective institutional designs from one context can
    be copied and adapted to another. For example, a household's
    chore-sharing rules can be transplanted to another household and
    adjusted for family composition.

-   Integration and composition: Multiple partial institutional
    descriptions can be integrated to compose larger SoS institutions.
    For example, delivery robot routing institutions and data sharing
    institutions can be merged into a delivery data coordination
    institution.

-   Version control and diff comparison: Track institutional change
    history, revert to any point in time, visualize changes as diffs,
    and identify the scope of impact.

-   Search and classification: Search repositories of accumulated
    institutional descriptions for similar patterns and recommend reuse
    candidates.

-   Tacit knowledge elicitation: Through human interviews and AI
    analysis of observational data, implicit rules are formalized as
    CADL descriptions. This creates a common foundation for sharing,
    discussing, and improving institutions.

### Objective 2: Computing Institutional Violations and Contradictions

If institutions are formally described, it becomes possible to
computationally verify consistency and detect violations at runtime.
Currently, contradictions between institutions (e.g., one contract
mandates information sharing while another prohibits it for privacy
protection) can only be checked manually, and oversights become
inevitable as SoS scale increases.

CADL's second objective is to automate institutional contradiction
detection and violation monitoring through computational power. This
encompasses the following two aspects.

-   AI-integrated design support: AI such as LLMs receives CADL
    descriptions as input and automatically generates contradiction
    detection, correction proposals, and institutional improvement
    suggestions. When asked in natural language "Are these rules
    contradictory?", AI responds based on CADL's formal semantics. In
    the future, a workflow will be realized where CADL descriptions are
    automatically generated from natural language requests, formally
    verified, and deployed.

-   Human decision support: Visualize institutional contradictions and
    potential problems to enable informed decisions by human institution
    designers. Quantitatively present contradiction severity and impact
    scope, supporting prioritization of corrections. Simulate
    institutional changes (what-if analysis) to understand impacts in
    advance.

### Objective 3: Automatic Conversion from Institutional Design to Control Logic, Optimization, and Code Generation

Once institutional design is described in a formal language and
verification is complete, the natural next step is to automatically
generate control logic and executable code from institutional
descriptions. Currently, there is a large gap between institutional
design (policy documents) and implementation (code), with no guarantee
that design intent is correctly reflected in implementation.

CADL's third objective is to provide a conversion pipeline from
institutional descriptions to executable artifacts. Specifically, the
following conversions are envisioned.

-   Automatic conversion from institutions to control logic:
    Automatically generate each actor's control logic (state machines,
    event handlers, coordination protocol implementations) from CADL
    contract and protocol definitions. For example, generate skeleton
    code for DISPATCHER assignment algorithms and ROBOT route-following
    logic from a robot delivery system's institutional description.

-   Institutional parameter optimization: Automatically tune
    institutional parameter values (alpha, beta, lambda, etc.) through
    simulation or mathematical optimization. Explore optimal parameter
    combinations for changing environmental conditions and automatically
    construct regime maps.

-   Runtime code generation: Automatically generate contract monitoring
    code (assume/guarantee satisfaction checks), protocol execution
    engines, and metrics collection code in target languages (Python,
    TypeScript, Solidity, etc.).

-   Integration with assurance cases: Automatically incorporate
    institutional verification results as evidence in assurance cases
    (safety arguments) and export to IEC 62853 agreement description
    databases.

### Cross-Cutting Feature: Institutional Description Language Anyone Can Understand

As a cross-cutting feature spanning all three objectives, CADL
emphasizes that "anyone from students to enterprise practitioners,
municipal officials, and local residents can understand the intent of
institutional descriptions and participate in institutional design."
SoS institutional design is a process involving diverse stakeholders
beyond just engineers, and if the description language can only be read
by a small number of specialists, democratization of institutional
design cannot be achieved.

To achieve this universal readability, CADL adopts the following
approaches.

-   YAML-based declarative syntax: Adopts indent-based descriptions that
    allow intuitive structural understanding even without programming
    experience, prioritizing readable syntax over JSON/XML.

-   Vocabulary close to natural language: Uses vocabulary that directly
    reflects institutional concepts such as authority, responsibility,
    and incentive, while minimizing exposure to formal method notation.

-   Graduated description levels: Three levels are provided: (1)
    Overview level (descriptions close to natural language, entry point
    for AI auto-generation), (2) Design level (parameter and constraint
    definitions), (3) Verification level (formal assume-guarantee
    descriptions), enabling participation according to user expertise.

-   Visualization: Automatically generate diagrams (authority structure
    diagrams, protocol sequence diagrams, regime maps) from CADL
    descriptions, enabling non-technical users to visually grasp
    institutional overviews.

-   AI-assisted barrier reduction: Through LLM-mediated CADL description
    generation, modification, and explanation in natural language,
    provide an environment where "institutions can be described by
    communicating intentions in natural language without knowing CADL
    syntax."

Integrating these three objectives with the cross-cutting feature of
universal readability, CADL's vision is the establishment of an
engineering cycle for institutional design: "formalize real-world
institutions in a form everyone can understand, verify and improve them
through computation, and automatically convert them into executable
form." This can be positioned as extending the model-driven development
(MDD) approach from software engineering to the SoS institutional design
domain, while simultaneously broadening participation from specialists
to society as a whole.

## 1.3 Glossary

This document uses many technical terms. The [Glossary](./glossary.md) defines them by topic — basic concepts, institutional design, the institutional parameters α, β and λ, institutional dynamics, verification and code generation, and the SoS types and related standards — with plain explanations and, where it helps, concrete examples.
