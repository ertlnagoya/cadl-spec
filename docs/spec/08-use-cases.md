---
sidebar_position: 8
title: "Use Cases and Novelty Analysis"
---

Based on the description examples of Section 7, we concretely examine
feasible use cases of CADL. For each use case, we clarify the novelty
and innovation that CADL brings through comparison with existing
technologies and research.

## 8.1 Democratization of Institutional Design for Daily Life
The description example in household rule design (Section 7.1)
demonstrates the possibility of fundamentally extending the scope of
application of traditional formal methods. IndoorWorld by Brudy et al.
(2025) enables LLM-driven agents to simulate household physical tasks
and social interactions, but does not provide means to describe and
verify household governance structure (authority, responsibility,
incentives) itself. Furthermore, according to OECD citizen participation
report (2024), institutionalized deliberative citizen participation
cases increased rapidly from 22 cases in 2020 to 41 cases in 2023, yet
no tools exist for citizens to directly "write" governance rules.

  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Use Case**               **Overview**                                                                                                                                                                           **Limitations of Existing Technologies**                                                                                                                                                           **CADL's Novelty**
  -------------------------- -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Household Chore-Sharing\   AI analyzes chore-sharing rules written in CADL and optimizes fairness (Gini coefficient) and efficiency. AI refines design level descriptions from overview-level natural language.   Chore-sharing apps (OurHome, Tody, etc.) only support task management. Rule formalization, verification, and optimization are not possible.                                                        First-in-the-world quantitative household governance design via institutional parameters (β, λ). Enables formalization of implicit rules and contradiction detection.
  Optimization

  Condominium\               Formalize management bylaws in CADL and automatically detect resident rights conflicts and obligation contradictions. Describe maintenance fund sharing rules with incentive models.   Condominium management software (condominium management cloud, etc.) supports accounting and minutes management. Bylaw formal verification is not supported.                                       Formal verifiability of legal bylaws. Symboleo [Sharifi+, 2020] leads legal contract formalization, but three-layer integrated organizational governance description is unique to CADL.
  Bylaw Design

  Local Community\           Describe neighborhood association rules in CADL, with AI detecting contradictions and proposing improvements. Municipal staff grasp the overall picture via visualization.             OECD deliberative citizen participation [2024] only aggregates opinions. Does not reach rule formalization. OpenStad [NL, 2024] is a participatory budgeting tool, not institutional design.   Citizen-participatory formal institutional design is an uncharted area. Via CADL's overview-level description + AI support, it becomes the first framework enabling non-expert participation in institutional design.
  Autonomy Rules
  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## 8.2 Institutional Experimentation Platform for Robotics SoS
The robot delivery system (Section 7.2) provides an innovative
experimental platform that fuses MAPF research and institutional design.
Zhang et al. (IJCAI 2024) proposed Payment-CBS (PCBS) introducing VCG
mechanisms to MAPF and realized strategy-resistant route assignment, but
formal description of overall governance structure (who decides what,
under what conditions rules change) is outside the scope. CADL adds
"institutional layer" to MAPF research, making decision structures
above the algorithm manipulable as experimental variables.

  -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Use Case**                      **Overview**                                                                                                                                                                                                **Limitations of Existing Technologies**                                                                                                                                                                                                   **CADL's Novelty**
  --------------------------------- ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Institutional Parameter\          Systematically vary CADL institutional parameters (α, β, λ) on MAPF simulator, measure impacts on throughput, fairness, and resilience. Automatically construct regime maps.                                Payment-CBS [Zhang+, IJCAI 2024]: Mechanism design for route assignment but does not address institutional design variables overall. Distributed MAPF [2020]: Only computation distribution, governance distribution not considered.   Systematic exploration of institutional parameter space and automatic regime map construction. First framework treating governance structure itself as MAPF experimental variable.
  Experimentation\
  Platform

  Safety Verification of Dynamic\   Formally verify D-SoS ⇔ C-SoS transitions responding to changes in failure rate and latency. Model checking guarantees safety invariants during transitions (collision avoidance, order loss prevention).   Adaptive governance research [Folke+, 2021]: Theoretical framework only, no formal transition condition description. AADL/HAMR: Can generate code for architecture transitions, but not institutional transitions.                       Formal verification of institutional transitions is academically unexplored. Verifiable dynamic institutional switching via CADL's transitions block and safety_invariant specification is highly novel.
  Institutional Transitions

  Multi-Domain\                     Institutional design for SoS with multiple delivery providers (drones, ground robots, human couriers). Describe competition and collaboration between providers with incentive models.                      Last-mile delivery research: Individual optimization dominates. Multi-provider governance structure formalization remains unaddressed.                                                                                                     Describe institutional design among heterogeneous actors in a single CADL file. Experimental verification platform for Shimoyama & Matsubara [2026] performance-autonomy value space.
  Delivery Coordination
  -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## 8.3 Trust Foundation for IoT Data Economy
The IoT data sharing system (Section 7.3) supports the
smart-contract-ification of data sharing required by EU Data Act (2024)
from upstream institutional design. IoT-Gov [Computing, 2022] and
Policy-Based Smart Contracts [Future Internet, 2024] focus on the
execution layer on blockchain, but do not address the entire lifecycle
of institutional design, verification, and evolution. CADL integrates
the complete pipeline: "institutional design → formal verification →
code generation → runtime monitoring" for data sharing.

  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Use Case**               **Overview**                                                                                                                                                                        **Limitations of Existing Technologies**                                                                                                                                               **CADL's Novelty**
  -------------------------- ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- --------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Smart City\                Describe data sharing rules for municipal, private sensors, and citizen data in CADL. Automatically detect contradictions between privacy constraints and open data requirements.   IoT-Gov [2022]: Access control on Ethereum but no formal verification of privacy constraints. vCity [BSC, 2024]: Urban digital twin but no institutional description capability.   Formal contradiction detection between privacy constraints and data publication requirements. Institutional simulation platform integrated with digital twins.
  Data Coordination

  Industrial Data\           Institutionalize supply chain data sharing in manufacturing with CADL. Automatically generate Solidity/Python code from SLA contracts.                                              Symboleo2SC [Sharifi+, 2024]: Realizes legal contract to Solidity conversion. However, institutional parametrization and SLA contradiction detection are outside scope.              Verify SLA constraint satisfiability with linear programming. Simultaneous verification of combined bandwidth, latency, and privacy constraints is novel.
  Marketplace

  Healthcare Data Sharing\   Describe inter-hospital patient data sharing rules in CADL. Formal verification of consent management, anonymization levels, and access rights.                                     HL7 FHIR: Data exchange standard but governance rule formal verification out of scope. Smart contract research for healthcare data sharing is in early stages.                         Guarantee healthcare-specific strict privacy requirements via CADL's information flow verification. Detect consent management contradictions using deontic logic.
  Governance
  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## 8.4 Formalization and Automation of AI Governance
AI integration (Section 7.4) applies CADL to the field of AI governance
whose social importance is rapidly increasing. As of 2026, AI governance
has become a core issue for enterprises as "AI risk and compliance,"
but formal description and automatic verification of governance policies
remain unestablished. CADL can become the first framework to formally
describe AI safety contracts, authority boundaries, and human oversight
requirements, and automate contradiction detection and policy code
generation.

  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Use Case**            **Overview**                                                                                                                                                                       **Limitations of Existing Technologies**                                                                                                                                           **CADL's Novelty**
  ----------------------- ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  LLM Governance\         Describe LLM usage rules (access control, content filters, logging obligations) in CADL. Automatically generate policy code in OPA/Rego format.                                    AI Governance 2026: Procedural and ad-hoc policy management is mainstream. No formally verifiable AI governance language exists.                                                   CADL as formal specification language for AI governance policy. AI safety contract verification via assume-guarantee semantics.
  Policy

  Autonomous System\      Describe safety contracts for autonomous systems (autonomous vehicles, drones, etc.) in CADL. Automatically generate safe controllers via reactive synthesis (GR(1)).              Kang+ [ACM TECS, 2019]: Probabilistic assume-guarantee contracts but CPS design only. Saoud+ [Automatica, 2021]: Continuous-time contracts but institutional layer excluded.   Unified safety guarantee for institutional (governance) and control (algorithm) layers. Automatic safe controller generation via reactive synthesis from contract specifications.
  Safety Certification

  AI-Assisted\            Automated pipeline: Natural language → CADL conversion → formal verification → deployment. LLM generates and refines CADL descriptions in dialogue with institutional designers.   LLM-Based Symboleo Generation [2024]: Natural language to legal contract specification conversion. CURRANTE [SANER 2026]: Human-in-the-loop specification → testing → code.    Complete pipeline: NL → institutional specification → verification → code generation. While Symboleo is limited to legal contracts, CADL covers entire institutions.
  Institutional Design\
  Workflow
  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## 8.5 Summary of Novelty
Based on the above use case analysis, we summarize CADL's novelty in
five key points:

  **ID**   **Novelty**                                                  **Description and Differences from Existing Research**
  -------- ------------------------------------------------------------ ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  N-1      Democratization of Institutional Design                      Overview-level description + AI support enables students, citizens, and municipal staff to participate in institutional design. Existing formal methods (Symboleo, MOISE+) are expert-limited. OECD-style citizen participation only aggregates opinions and does not reach institutional "description".
  N-2      Institutionalization of Governance as Experimental Science   Systematic manipulation of institutional parameters (α, β, λ) and regime map construction establishes institutional design as experimental science. Adds governance layer to MAPF research, enabling quantitative exploration of Shimoyama & Matsubara [2026] value space.
  N-3      Formal Verification of Dynamic Institutional Transitions     Formally implements theory from adaptive governance [Folke+, 2021]. Verifiable description of transition conditions, safety invariants, and rollback is academically unexplored.
  N-4      Unified Institutional Lifecycle Management                   Manage all stages design → verification → code generation → runtime monitoring in a single language. Symboleo2SC [2024] only does code generation, IoT-Gov [2022] only handles execution layer; lifecycle integration is novel.
  N-5      Institutional Integration with Digital Twins                 Provide institutional design layer to urban digital twins like vCity [BSC, 2024]. Concept enabling not only physical simulation but "institutional simulation" is highly novel.
