---
sidebar_position: 8
title: "8. Use Cases and Novelty Analysis"
description: "Feasible use cases of CADL in four domains and its novelty compared with existing technologies and research."
---

Based on the description examples of [Chapter 7](./07-examples.md), we concretely examine
feasible use cases of CADL. For each use case, we outline CADL's novelty
through comparison with existing technologies and research. The
comparisons reflect the scope of the authors' survey, and some use
cases are still at the concept stage.

## 8.1 Democratization of Institutional Design for Daily Life
The description example in household rule design ([Section 7.1](./07-examples.md#71-household-rule-design))
demonstrates the possibility of fundamentally extending the scope of
application of traditional formal methods. IndoorWorld by [Wu et al. (2025)](./appendix-b-references.md) enables LLM-driven agents to simulate physical tasks
and social interactions in indoor environments, but does not target describing and
verifying governance structure (authority, responsibility,
incentives) itself. Furthermore, according to the OECD's overview page on innovative public participation [[OECD, "Innovative public participation"]](./appendix-b-references.md),
institutionalized deliberative citizen participation
cases increased rapidly from 22 cases in 2020 to 41 cases in 2023, yet,
to our knowledge, there are no tools for citizens to directly "write"
governance rules.

| **Use Case** | **Overview** | **Limitations of Existing Technologies** | **CADL's Novelty** |
| --- | --- | --- | --- |
| Household Chore-Sharing<br />Optimization | AI analyzes chore-sharing rules written in CADL and optimizes fairness (Gini coefficient) and efficiency. AI refines design level descriptions from overview-level natural language. | Existing chore-sharing apps focus on task management; rule formalization, verification, and optimization are not their main target. | Quantitative household governance design via institutional parameters (β, λ). Enables formalization of implicit rules and contradiction detection. |
| Condominium<br />Bylaw Design | Formalize management bylaws in CADL and automatically detect resident rights conflicts and obligation contradictions. Describe maintenance fund sharing rules with incentive models. | Existing condominium management software focuses on accounting and minutes management; formal verification of bylaws is not in its scope. | Formal verifiability of legal bylaws. Symboleo [[Sharifi+, 2020]](./appendix-b-references.md) leads legal contract formalization, but three-layer integrated organizational governance description is a distinguishing feature of CADL. |
| Local Community<br />Autonomy Rules | Describe neighborhood association rules in CADL, with AI detecting contradictions and proposing improvements. Municipal staff grasp the overall picture via visualization. | Deliberative citizen participation as surveyed by the OECD [[OECD, 2020]](./appendix-b-references.md) focuses on aggregating opinions and deliberation; rule formalization is not its target. Citizen participation platforms such as OpenStad [[OpenStad]](./appendix-b-references.md) likewise do not target formal description of institutions. | To our knowledge, there is little prior work on citizen-participatory formal institutional design. Through overview-level description + AI support, CADL aims to enable non-expert participation in institutional design. |

## 8.2 Institutional Experimentation Platform for Robotics SoS
The robot delivery system ([Section 7.2](./07-examples.md#72-robot-delivery-system)) provides an
experimental platform that fuses MAPF research and institutional design.
[Friedrich et al. (IJCAI 2024)](./appendix-b-references.md) proposed Payment-CBS (PCBS) introducing VCG
mechanisms to MAPF and realized strategyproof route assignment, but
formal description of overall governance structure (who decides what,
under what conditions rules change) is outside the scope. CADL adds
"institutional layer" to MAPF research, making decision structures
above the algorithm manipulable as experimental variables.

| **Use Case** | **Overview** | **Limitations of Existing Technologies** | **CADL's Novelty** |
| --- | --- | --- | --- |
| Institutional Parameter<br />Experimentation<br />Platform | Systematically vary CADL institutional parameters (α, β, λ) on MAPF simulator, measure impacts on throughput, fairness, and resilience (cf. the game-theoretic resilience analysis of SoS by Zhang & Matsubara [[2026]](./appendix-b-references.md)). Automatically construct regime maps. | Payment-CBS [[Friedrich+, IJCAI 2024]](./appendix-b-references.md): Mechanism design for route assignment but does not address institutional design variables overall. Distributed MAPF research (e.g., PRIMAL [[Sartoretti+, 2019]](./appendix-b-references.md)): Only computation distribution, governance distribution not considered. | Systematic exploration of institutional parameter space and automatic regime map construction. Its distinguishing feature is treating governance structure itself as a MAPF experimental variable. |
| Safety Verification of Dynamic<br />Institutional Transitions | Formally verify transitions between a centralized and a distributed regime ([Section 7.2](./07-examples.md)) responding to changes in failure rate and latency. Model checking verifies safety invariants during transitions (collision avoidance, order loss prevention). | Adaptive governance research [[Folke+, 2005]](./appendix-b-references.md): Theoretical framework only, no formal transition condition description. AADL/HAMR [[Hatcliff+, 2021]](./appendix-b-references.md): Can generate code for architecture transitions, but not institutional transitions. | To our knowledge, there is little prior work on formal verification of institutional transitions. CADL describes verifiable dynamic institutional switching via its transitions block and safety_invariant specification. |
| Multi-Domain<br />Delivery Coordination | Institutional design for SoS with multiple delivery providers (drones, ground robots, human couriers). Describe competition and collaboration between providers with incentive models. | Last-mile delivery research [[Boysen+, 2021]](./appendix-b-references.md): Individual optimization dominates. Multi-provider governance structure formalization remains unaddressed. | Describe institutional design among heterogeneous actors in a single CADL file. Experimental verification platform for Shimoyama & Matsubara [[2026]](./appendix-b-references.md) performance-autonomy value space. |

## 8.3 Trust Foundation for IoT Data Economy
The IoT data sharing system ([Section 7.3](./07-examples.md#73-iot-data-sharing-system)) supports data sharing
from upstream institutional design, in light of the requirements that
the [EU Data Act](./appendix-b-references.md) (Regulation (EU) 2023/2854) places on smart contracts
used for the automated execution of data sharing agreements. IoT-Gov [[Computing, 2022]](./appendix-b-references.md) and
Policy-Based Smart Contracts [[Future Internet, 2024]](./appendix-b-references.md) focus on the
execution layer on blockchain, but do not address the entire lifecycle
of institutional design, verification, and evolution. CADL integrates
the complete pipeline: "institutional design → formal verification →
code generation → runtime monitoring" for data sharing.

| **Use Case** | **Overview** | **Limitations of Existing Technologies** | **CADL's Novelty** |
| --- | --- | --- | --- |
| Smart City<br />Data Coordination | Describe data sharing rules for municipal, private sensors, and citizen data in CADL. Automatically detect contradictions between privacy constraints and open data requirements. | IoT-Gov [[2022]](./appendix-b-references.md): Access control on Ethereum but no formal verification of privacy constraints. vCity [[BSC]](./appendix-b-references.md): Urban digital twin; institutional description is not its main target. | Formal contradiction detection between privacy constraints and data publication requirements. Institutional simulation platform integrated with digital twins. |
| Industrial Data<br />Marketplace | Institutionalize supply chain data sharing in manufacturing with CADL. Automatically generate Solidity/Python code from SLA contracts. | Symboleo2SC [[Rasti+, MODELS 2022]](./appendix-b-references.md): Generates smart contract code from legal contract specifications. However, institutional parametrization and SLA contradiction detection are outside scope. | Verify SLA constraint satisfiability with linear programming. Simultaneous verification of combined bandwidth, latency, and privacy constraints is novel. |
| Healthcare Data Sharing<br />Governance | Describe inter-hospital patient data sharing rules in CADL. Formal verification of consent management, anonymization levels, and access rights. | HL7 FHIR [[HL7, 2023]](./appendix-b-references.md): Data exchange standard but governance rule formal verification out of scope. Smart contract research for healthcare data sharing is in early stages. | Check conformance to healthcare-specific strict privacy requirements via CADL's information flow verification (this does not by itself guarantee legal compliance). Detect consent management contradictions using deontic logic. |

## 8.4 Formalization and Automation of AI Governance
AI integration ([Section 7.4](./07-examples.md#74-ai-integration)) applies CADL to the field of AI governance
whose social importance is rapidly increasing. As of 2026, AI governance
has become a core issue for enterprises as "AI risk and compliance,"
but formal description and automatic verification of governance policies
remain unestablished. CADL aims to formally
describe AI safety contracts, authority boundaries, and human oversight
requirements, and to automate contradiction detection and policy code
generation.

| **Use Case** | **Overview** | **Limitations of Existing Technologies** | **CADL's Novelty** |
| --- | --- | --- | --- |
| LLM Governance<br />Policy | Describe LLM usage rules (access control, content filters, logging obligations) in CADL. Automatically generate policy code in OPA/Rego [[Open Policy Agent]](./appendix-b-references.md) format. | Procedural and ad-hoc policy management is currently mainstream in AI governance; to our knowledge, no formally verifiable governance description language is established. | CADL as formal specification language for AI governance policy. AI safety contract verification via assume-guarantee semantics. |
| Autonomous System<br />Safety Certification | Describe safety contracts for autonomous systems (autonomous vehicles, drones, etc.) in CADL. Automatically generate safe controllers via reactive synthesis (GR(1) [[Piterman+, 2006]](./appendix-b-references.md)). | Nuzzo+ [[ACM TECS, 2019]](./appendix-b-references.md): Probabilistic assume-guarantee contracts but CPS design only. Saoud+ [[Automatica, 2021]](./appendix-b-references.md): Continuous-time contracts but institutional layer excluded. | Unified safety verification for institutional (governance) and control (algorithm) layers. Automatic safe controller generation via reactive synthesis from contract specifications. |
| AI-Assisted<br />Institutional Design<br />Workflow | Automated pipeline: Natural language → CADL conversion → formal verification → deployment. LLM generates and refines CADL descriptions in dialogue with institutional designers. | LLM-based Symboleo generation [[Zitouni+, 2025]](./appendix-b-references.md): Natural language to legal contract specification conversion. CURRANTE [[Rosa+, SANER 2026 registered report]](./appendix-b-references.md): Human-in-the-loop specification → testing → code. | End-to-end pipeline: NL → institutional specification → verification → code generation. While Symboleo is limited to legal contracts, CADL covers entire institutions. |

**Demonstrations.** Working minimal demonstrations for this section have been built in the `cadl-ai-governance` repository (not publicly available at present). The case numbers are those of the repository; the table shows what each case corresponds to in this specification.

| **Case** | **What it demonstrates** | **Aspect of [Section 7.4](./07-examples.md#74-ai-integration)** | **Use case in the table above** |
| --- | --- | --- | --- |
| Case 1 | Behavioural contracts on an LLM agent team are enforced at runtime (approval gate, review deadline, API budget). | Third aspect: AI agents take part as constituent systems (`AI_GOVERNANCE`, `AI_SAFETY_CONTRACT`). | LLM Governance Policy (enforcement at runtime) |
| Case 2 | Propose–verify–repair loop: an LLM's CADL drafts take effect only once they pass `cadl check`. | First aspect: natural language to CADL (`NL_TO_CADL_WORKFLOW`). | AI-Assisted Institutional Design Workflow |
| Case 3 | AI operation policies (72-hour human oversight, no PII egress) are audited after the fact by replaying gateway logs. | Third aspect, checked from logs rather than at runtime. | LLM Governance Policy (audit) |

The second aspect of Section 7.4 (regime recommendation by an AI advisor) and the use case "Autonomous System Safety Certification" (reactive synthesis) have no demonstration yet. The three cases share one IR-driven runtime with swappable bridges — itself a demonstration that the contract description is independent of the execution environment.

## 8.5 Summary of Novelty
Based on the above use case analysis, we summarize CADL's novelty in
five key points:

| **ID** | **Novelty** | **Description and Differences from Existing Research** |
| --- | --- | --- |
| N-1 | Democratization of Institutional Design | Overview-level description + AI support enables students, citizens, and municipal staff to participate in institutional design. Existing formal methods (Symboleo, MOISE+) mainly assume expert users. Deliberative citizen participation focuses on aggregating opinions and deliberation, and does not target institutional "description". |
| N-2 | Governance as an Experimental Science | Systematic manipulation of institutional parameters (α, β, λ) and regime map construction aim to make institutional design an experimental science. Adds governance layer to MAPF research, enabling quantitative exploration of Shimoyama & Matsubara [[2026]](./appendix-b-references.md) value space. |
| N-3 | Formal Verification of Dynamic Institutional Transitions | Formally implements theory from adaptive governance [[Folke+, 2005]](./appendix-b-references.md). Verifiable description of transition conditions, safety invariants, and rollback has, to our knowledge, received little study. |
| N-4 | Unified Institutional Lifecycle Management | Manage all stages design → verification → code generation → runtime monitoring in a single language. Symboleo2SC focuses on code generation and IoT-Gov [[2022]](./appendix-b-references.md) on the execution layer; CADL differs in aiming at lifecycle integration. |
| N-5 | Institutional Integration with Digital Twins | Provide institutional design layer to urban digital twins like vCity [[BSC]](./appendix-b-references.md). Aims to enable not only physical simulation but also "institutional simulation". |
