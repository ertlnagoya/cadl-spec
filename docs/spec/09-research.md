---
sidebar_position: 9
title: "9. Research Directions and Open Challenges"
description: "Research directions and open challenges for CADL, with related work, concrete research challenges, and a research roadmap."
---

Based on use case analysis in [Chapter 8](./08-use-cases.md) and survey of existing research,
we organize research directions toward CADL realization and development.
For each direction, we present related existing research and concrete
research challenges that CADL should address.

## 9.1 Algebraic Composition Theory for Institutions
Establishment of an algebraic foundation for safely composing and
decomposing multiple institutional descriptions is necessary. Benveniste
et al. [[Foundations and Trends in EDA, 2018]](./appendix-b-references.md) theorized parallel
composition of contracts C₁ ⊗ C₂ in component design, but composition
theory including three institutional layers (Institution, Protocol,
Algorithm) remains unestablished. For example, when composing household
chore-sharing institution with shared resource usage institution, a
theory that algebraically guarantees absence of obligation conflicts and
incentive interference is required.

| **ID** | **Challenge** | **Content** |
| --- | --- | --- |
| RD-1.1 | Institutional Composition Algebra | Algebraic definitions and soundness proofs for parallel, sequential, and choice composition of institutions including three layers (Institution, Protocol, Algorithm). |
| RD-1.2 | Institutional Refinement Relations | Formal proofs that overview level → design level → verification level refinements preserve institutional properties. |
| RD-1.3 | Topological Structure of<br />Parameter Space | Mathematical characterization of regime boundaries on institutional parameter space (α, β, λ). Continuity, convexity, monotonicity conditions. |

## 9.2 Extraction and Institutionalization of Tacit Knowledge
Establishment of technology to explicitly formalize institutional
knowledge implicitly shared in household rules and community customs as
CADL descriptions is required. IndoorWorld [[Wu+, Findings of EMNLP 2025]](./appendix-b-references.md)
realizes household behavior simulation with LLM agents, but the inverse
problem of extracting institutional rules from observed behavior
patterns (institutional reverse engineering) remains unaddressed.

| **ID** | **Challenge** | **Content** |
| --- | --- | --- |
| RD-2.1 | Institutional Inference from<br />Behavioral Observation | Algorithm to infer potential institutional rules (implicit authority structures, information sharing patterns, incentive structures) from IoT sensor data and behavior logs. |
| RD-2.2 | LLM-based<br />Institutional Description Generation | Technology to automatically generate CADL descriptions from natural language interview records and meeting minutes. Extends LLM-based Symboleo generation [[Zitouni+, 2025]](./appendix-b-references.md) methods to general institutional descriptions. |
| RD-2.3 | Tacit Knowledge Ontology<br />for Institutions | Build ontology systematically classifying and structuring implicit institutional knowledge. Map Ostrom [[1990]](./appendix-b-references.md) IAD framework [[Ostrom, 2005]](./appendix-b-references.md) to CADL vocabulary. |

## 9.3 Institutional Digital Twins
Developing the concept of Digital Twins of Organization [[Lyytinen+, J.
Organization Design, 2024]](./appendix-b-references.md), establishment of technology to build and
simulate institutions themselves as digital twins is the next-generation
research direction. vCity [[BSC]](./appendix-b-references.md) and Social Digital Twin
[[Fujitsu]](./appendix-b-references.md) advance twinning of physical and social
aspects, but twinning of institutions (governance structures, rules,
incentives) is, to our knowledge, not their main target.

| **ID** | **Challenge** | **Content** |
| --- | --- | --- |
| RD-3.1 | Institutional Simulator | Technology to automatically generate institutional simulation models from CADL descriptions and what-if analyze impacts of institutional parameter changes. MAPF simulator integration is initial target. |
| RD-3.2 | Institutional Synchronization and<br />Divergence Detection | Technology to detect divergence between real institutional operation and CADL descriptions (twins) via runtime monitoring and automatically update institutional descriptions. Integration with IEC 62853 [[IEC 62853:2018]](./appendix-b-references.md) change management process. |
| RD-3.3 | Institutional A/B Testing | Technology to operate different institutional designs in parallel and perform comparative experiments on performance. Integration with AI Economist [[Zheng+, 2022]](./appendix-b-references.md) mechanism design automation methods. |

## 9.4 Scalability and Computational Complexity
Scalability of formal verification and code generation of institutions
is one of the most critical challenges toward practical deployment. To
complete verification of SoS descriptions containing 100+ actors and 50+
contracts within practical time, theoretical analysis of computational
complexity of verification methods and development of efficient
algorithms are necessary.

| **ID** | **Challenge** | **Content** |
| --- | --- | --- |
| RD-4.1 | Computational Complexity of<br />Institutional Verification | Determine computational complexity classes for consistency verification, deadlock detection, and safety verification of CADL descriptions respectively. Identify decidability boundary conditions. |
| RD-4.2 | Abstraction-based<br />Scalable Verification | Methods to efficiently verify large-scale SoS through hierarchical abstraction of institutional descriptions. Application of counterexample-guided abstraction refinement (CEGAR) [[Clarke+, 2000]](./appendix-b-references.md) to institutional verification. |
| RD-4.3 | Incremental<br />Verification | Technology to confirm consistency through differential verification rather than full re-verification when actors join/leave or institutions change. Implementation of compositional verification theory. |

## 9.5 Multi-Cultural and Multi-Jurisdictional Support
For CADL to be applied to international SoS, support for different legal
systems, cultural norms, and language environments is necessary. The [EU Data
Act](./appendix-b-references.md) (Regulation (EU) 2023/2854) sets essential requirements for smart
contracts used for the automated execution of data sharing agreements, but institutional compatibility with other jurisdictions
(Japan, US, China, etc.) remains an unresolved challenge.

| **ID** | **Challenge** | **Content** |
| --- | --- | --- |
| RD-5.1 | Cross-jurisdictional Institutional<br />Compatibility Verification | Technology to detect legal contradictions when composing CADL descriptions from different jurisdictions (e.g., differences between EU GDPR [[Regulation (EU) 2016/679]](./appendix-b-references.md) and Japanese Personal Information Protection Act [[Act No. 57 of 2003]](./appendix-b-references.md)). |
| RD-5.2 | Parameterization of<br />Cultural Norms | Technology to model cultural dimensions (collectivism/individualism, power distance, uncertainty avoidance, etc.) as institutional parameters and handle cross-cultural governance differences quantitatively. |
| RD-5.3 | Multilingual Institutional Description | Enable CADL overview-level descriptions in multiple languages with AI verifying institutional equivalence across languages. This goes beyond NFR-7 (internationalization), which only requires that human-readable text can be written in any language. |

## 9.6 Research Roadmap
We organize the above research directions along a time axis and present
a short-, medium-, and long-term research roadmap:

| **Period** | **Key Challenges** | **Content** |
| --- | --- | --- |
| Short-term<br />(2026-2027) | RD-1.1, RD-1.2,<br />RD-2.2, RD-4.1,<br />RD-4.3 | Basic theory of institutional composition (RD-1.1) and of refinement between description levels (RD-1.2), initial prototype of CADL generation via LLM (RD-2.2), computational complexity analysis of verification (RD-4.1), incremental verification when actors join or leave (RD-4.3). |
| Medium-term<br />(2027-2028) | RD-1.3, RD-2.1,<br />RD-3.1, RD-4.2 | Mathematical analysis of parameter space (RD-1.3), experiments in institutional inference from IoT sensors (RD-2.1), institutional simulator construction, starting with integrated experiments with a MAPF simulator (RD-3.1), implementation of scalable verification methods (RD-4.2). |
| Long-term<br />(2028-2030) | RD-2.3, RD-3.2,<br />RD-3.3, RD-5.1-5.3 | Tacit knowledge ontology (RD-2.3), complete implementation of institutional digital twins including divergence detection (RD-3.2), institutional A/B testing platform (RD-3.3), multicultural and multi-jurisdictional support (RD-5.1 to RD-5.3). |
