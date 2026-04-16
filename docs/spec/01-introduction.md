---
sidebar_position: 1
title: "Introduction"
---

## 1.1 Purpose and Scope
CADL (Contract Architecture Description Language) is a domain-specific
language (DSL) for formally specifying, verifying, and deploying
institutional designs in System of Systems (SoS). This document presents
the first draft of the CADL language specification, covering language
objectives, requirements, syntax and semantics definitions, and
toolchain design.

This document consolidates the specification for CADL implementation
based on the SoS research survey report (March 14, 2026 version) and SoS
architecture design studies conducted at the Matsubara Laboratory.

## 1.2 Background: Challenges of Institutional Design in SoS
An SoS is a system configuration in which multiple independently
operated systems cooperate to achieve capabilities that no single system
can achieve alone. ISO/IEC/IEEE 21841:2019 classifies SoS into four
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

**Objective 1: Making SoS Institutional Design Computationally
Tractable**

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

**Objective 2: Computing Institutional Violations and Contradictions**

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

**Objective 3: Automatic Conversion from Institutional Design to Control
Logic, Optimization, and Code Generation**

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

**Cross-Cutting Feature: Institutional Description Language Anyone Can
Understand**

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

-   YAML-like declarative syntax: Adopts indent-based descriptions that
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
This document uses many technical terms. Below, key terms are organized
by field with plain explanations and concrete examples to ensure
comprehension by readers without specialized knowledge.

### 1.3.1 Basic Concepts

  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Term**                  **Description**                                                                                                                                                                                                                                                                                                  **Example**
  ------------------------- ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  SoS\                      A configuration where multiple independently operating systems cooperate to achieve objectives that no single system can achieve alone.                                                                                                                                                                          A system where delivery robots from multiple companies cooperate to optimize city-wide delivery. Each robot operates independently, but together they achieve an optimal delivery network.
  (System of Systems)

  CADL\                     The institutional description language defined in this document. A language for writing down "who has what authority, how they cooperate, and what rules they follow" in SoS in a computer-understandable form.                                                                                                Any institution can be described in CADL, from household chore-sharing rules to large-scale urban transportation system governance.
  (Contract Architecture\
  Description Language)

  Institution               A general term for "rules, authorities, role assignments, and reward mechanisms" between people or systems. Includes both codified forms like laws and contracts, and implicit household rules. CADL describes institutions through three aspects: authority structure, information sharing, and incentives.   "Children must finish chores before dinner" and "They receive 100 yen upon completion" are examples of household institutions.

  Actor                     An entity participating in the SoS (humans, robots, AI systems, organizations, etc.). Each has roles and capabilities and acts according to institutional rules.                                                                                                                                                 In a delivery system, robots, dispatchers, and customers are each actors.

  Stakeholder               All parties with interest in institutional design. Includes not only actors directly participating in institutions, but also people affected by institutions and those in supervisory positions.                                                                                                                 In a delivery system, users, delivery companies, municipalities, and nearby residents are stakeholders.
  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

### 1.3.2 Institutional Design Terminology

  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Term**              **Description**                                                                                                                                                                                                   **Example**
  --------------------- ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- --------------------------------------------------------------------------------------------------------------------------------
  Contract              A formal written statement of "promises" between actors. Clarifies who guarantees what and under what preconditions it is valid. Written in assume-guarantee form in CADL.                                      "As long as the robot operates normally (assume), delivery arrives within 1.2x the promised time (guarantee)"

  Assume-Guarantee      The basic structure of a contract. A formal statement: "If this precondition (assume) is satisfied, then we promise this guarantee." If the precondition is violated, the guarantee is void.                    assume: "Road accessibility >= 80%"\
                                                                                                                                                                                                                                          guarantee: "Delivery success rate >= 95%"

  Authority Structure   The structure of "who has authority to decide what." Ranges from centralized (one person decides) to distributed (collective decision-making), expressed by the beta parameter.                                 beta=0.2: Dispatcher decides almost everything\
                                                                                                                                                                                                                                          beta=0.8: Each robot decides autonomously

  Incentive             A "reward and penalty mechanism" to encourage actor behavior. By rewarding good behavior and penalizing bad behavior, desirable outcomes are achieved overall. The lambda parameter represents its intensity.   "On-time delivery: +bonus" "Late delivery: -50% of base fee." Higher lambda means stronger reward/penalty effects.

  Protocol              The "interaction procedures" between actors defined with timing constraints. Describes who sends what to whom and in what order processing occurs.                                                              \(1\) Customer orders -> (2) Dispatcher assigns robot -> (3) Robot delivers -> (4) Customer notified, as a series of steps.

  SLA\                  A service quality guarantee agreement. A numerical agreement between service providers and users on "what level of quality is guaranteed."                                                                      "Data latency within 5 seconds" "Uptime >= 99.9%" "Delivery time within 1.2x the promise"
  (Service Level\
  Agreement)

  Obligation            Something an actor "must do." A contractual responsibility, where violations may result in penalties.                                                                                                           "Data providers have the obligation to maintain data accuracy >= 95%"
  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

### 1.3.3 Institutional Parameters

In CADL, institutional characteristics are expressed as quantitative
parameters. This enables numerical adjustment and optimization of
institutional "degree."

  -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Parameter**         **Meaning**                                                                                                                                          **Example**
  --------------------- ---------------------------------------------------------------------------------------------------------------------------------------------------- --------------------------------------------------------------------------
  alpha (Information\   Represents how much information is shared. Closer to 0 means restricted information (privacy-focused), closer to 1 means open to all.                alpha=1.0: All family members can view the schedule\
  Sharing Degree)                                                                                                                                                            alpha=0.4: IoT data shares metadata only

  beta (Decision\       Represents how distributed decision-making is. Closer to 0 means one person (central) decides, closer to 1 means distributed collective decisions.   beta=0.2: Dispatcher centrally decides routes\
  Decentralization)                                                                                                                                                          beta=0.8: Each data provider autonomously decides their data publication

  lambda (Incentive\    Represents how much rewards/penalties affect behavior. Closer to 0 means weak incentive effects, closer to 1 means strong.                           lambda=0.6: Allowance moderately affects behavior\
  Intensity)                                                                                                                                                                 lambda=0.9: Strong control via market mechanisms
  -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

### 1.3.4 Terms Related to Institutional Dynamics

  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Term**            **Description**                                                                                                                                                                                                                **Example**
  ------------------- ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ ------------------------------------------------------------------------------------------------------------------------------------------------------------
  Regime              The "complete set of institutional settings" effective at a given time. As environmental conditions change, the optimal regime also changes.                                                                                 Normal regime: Dispatcher manages centrally\
                                                                                                                                                                                                                                                     Failure regime: Each robot decides autonomously

  Regime Map          A map-like representation showing "which regime (institutional settings) is optimal under which environmental conditions." Divides the environmental parameter space into regions and maps each to an optimal institution.   Low failure rate and low latency -> Centralized management regime\
                                                                                                                                                                                                                                                     High failure rate or high latency -> Distributed autonomous regime

  Regime Transition   Switching from one regime to another in response to changes in environmental conditions. Safety (collision avoidance, etc.) must be guaranteed during the transition.                                                          When communication latency exceeds 300ms, switch from centralized to distributed autonomous. Maintain "no collisions, no lost orders" during transition.

  Safety Invariant    A condition that "must never be violated under any circumstances." This condition must always be satisfied even during regime transitions.                                                                                   "Robots do not collide with each other" "Order data is not lost"
  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

### 1.3.5 Verification and Code Generation Terminology

  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Term**              **Description**                                                                                                                                                                                  **Example**
  --------------------- ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ ----------------------------------------------------------------------------------------------------------------------------------------------------------------
  Formal Verification   Using computers to mathematically prove that institutional descriptions are free of contradictions and problems. Can automatically discover contradictions that human reviews tend to miss.      "Whether conditions of two contracts are contradictory" "Whether a protocol deadlocks" automatically verified using SMT solvers.

  Contradiction\        Detecting whether institutional descriptions contain mutually contradictory rules. For example, one contract grants authority to person A while another grants the same authority to person B.   "Two chores assigned to the same time slot" "Privacy constraints contradict data publication requirements"
  Detection

  Model Checking        A method that exhaustively examines all possible system states to verify that undesirable states are never reached.                                                                              Checking all patterns to confirm "no possibility of reaching a state where robots collide during regime transition."

  Code Generation       Automatically generating working program code (Python, TypeScript, etc.) from CADL institutional descriptions. Automatically creating "implementation" from the institutional "blueprint."   From delivery SLA contract descriptions, automatically generate dispatch algorithm skeleton code and SLA violation monitoring code.

  Reactive Synthesis    A method for automatically synthesizing control programs that satisfy specifications (requirements for "how to behave").                                                                       From AI safety contract specifications, automatically synthesize a controller that "always prevents harmful actions and escalates to humans when uncertain."

  Runtime Monitoring    Real-time monitoring of whether contract conditions are being maintained while institutions are actually in operation. When violations are detected, warnings or countermeasures are executed.   During delivery, continuously check "delivery_time &lt;= promised_time x 1.2" and execute reassignment if likely to exceed.
  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

### 1.3.6 SoS Classification and Related Standards

ISO/IEC/IEEE 21841:2019 classifies SoS into four types based on
differences in governance structures. CADL can describe all of these
types.

  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Term**               **Description**                                                                                                                                                                                                                    **Example**
  ---------------------- ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- -----------------------------------------------------------------------------------------------------------------------------------------
  D-SoS\                 An SoS where a central authority directs the whole. Each constituent system follows the authority's instructions. The most centralized management structure.                                                                      Military chain of command. Headquarters controls the actions of all units.
  (Directed SoS)

  A-SoS\                 A central authority exists, but each constituent system has some degree of autonomy. Operated through consultation between the authority and constituent systems.                                                                  Robot delivery system. The dispatcher manages overall, but each robot autonomously handles local obstacle avoidance.
  (Acknowledged SoS)

  C-SoS\                 No central authority; constituent systems of equal standing voluntarily cooperate. Decision-making through consensus building.                                                                                                     Family rule-making. Decided through family meetings. Condominium management association operations.
  (Collaborative SoS)

  V-SoS\                 An SoS with no clear management structure where constituent systems cooperate incidentally. Overall objectives may not be explicitly stated.                                                                                       The Internet as a whole. Individual services operate independently but collectively form a massive ecosystem.
  (Virtual SoS)

  Five-Layer Framework   A framework that structures SoS design into five layers (Policy / Governance / Control / Execution / Environment). CADL primarily describes the Governance and Control layers.                                                     Policy: "Safety first" -> Governance: "Collision avoidance rules" -> Control: "Route planning" -> Execution: "Motor control"

  IEC 62853              International standard for Open Systems Dependability. Defines processes for consensus building, accountability, and change response to continuously ensure system dependability. CADL considers integration with this standard.   Describing consensus-building processes during institutional changes and accountability mechanisms during fault response in CADL.
  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
