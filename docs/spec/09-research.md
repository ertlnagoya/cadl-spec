---
sidebar_position: 9
title: "Research Directions and Open Challenges"
---

Based on use case analysis in Section 8 and survey of existing research,
we organize research directions toward CADL realization and development.
For each direction, we present related existing research and concrete
research challenges that CADL should address.

## 9.1 Algebraic Composition Theory for Institutions
Establishment of an algebraic foundation for safely composing and
decomposing multiple institutional descriptions is necessary. Benveniste
et al. [Foundations and Trends in EDA, 2018] theorized parallel
composition of contracts C₁ ⊗ C₂ in component design, but composition
theory including three institutional layers (authority, protocol,
incentives) remains unestablished. For example, when composing household
chore-sharing institution with shared resource usage institution, a
theory that algebraically guarantees absence of obligation conflicts and
incentive interference is required.

  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **ID**   **Challenge**                        **Content**
  -------- ------------------------------------ -----------------------------------------------------------------------------------------------------------------------------------------------------------------------
  RD-1.1   Institutional Composition Algebra    Algebraic definitions and soundness proofs for parallel, sequential, and choice composition of institutions including three layers (authority, protocol, incentives).

  RD-1.2   Institutional Refinement Relations   Formal proofs that overview level → design level → verification level refinements preserve institutional properties.

  RD-1.3   Topological Structure of\            Mathematical characterization of regime boundaries on institutional parameter space (α, β, λ). Continuity, convexity, monotonicity conditions.
           Parameter Space
  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## 9.2 Extraction and Institutionalization of Tacit Knowledge
Establishment of technology to explicitly formalize institutional
knowledge implicitly shared in household rules and community customs as
CADL descriptions is required. IndoorWorld [Brudy+, EMNLP 2025]
realizes household behavior simulation with LLM agents, but the inverse
problem of extracting institutional rules from observed behavior
patterns (institutional reverse engineering) remains unaddressed.

  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **ID**   **Challenge**                          **Content**
  -------- -------------------------------------- -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  RD-2.1   Institutional Inference from\          Algorithm to infer potential institutional rules (implicit authority structures, information sharing patterns, incentive structures) from IoT sensor data and behavior logs.
           Behavioral Observation

  RD-2.2   LLM-based\                             Technology to automatically generate CADL descriptions from natural language interview records and meeting minutes. Extends LLM-Based Symboleo Generation [2024] methods to general institutional descriptions.
           Institutional Description Generation

  RD-2.3   Tacit Knowledge Ontology\              Build ontology systematically classifying and structuring implicit institutional knowledge. Map Ostrom [1990] IAD framework to CADL vocabulary.
           for Institutions
  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## 9.3 Institutional Digital Twins
Developing the concept of Digital Twins of Organization [J.
Organization Design, 2023], establishment of technology to build and
simulate institutions themselves as digital twins is the next-generation
research direction. vCity [BSC, 2024] and Social Digital Twins
[Fujitsu Research, 2025] advance twinning of physical and social
aspects, but twinning of institutions (governance structures, rules,
incentives) remains unaddressed.

  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **ID**   **Challenge**                        **Content**
  -------- ------------------------------------ --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  RD-3.1   Institutional Simulator              Technology to automatically generate institutional simulation models from CADL descriptions and what-if analyze impacts of institutional parameter changes. MAPF simulator integration is initial target.

  RD-3.2   Institutional Synchronization and\   Technology to detect divergence between real institutional operation and CADL descriptions (twins) via runtime monitoring and automatically update institutional descriptions. Integration with IEC 62853 change management process.
           Divergence Detection

  RD-3.3   Institutional A/B Testing            Technology to operate different institutional designs in parallel and perform comparative experiments on performance. Integration with AI Economist [Zheng+, 2022] mechanism design automation methods.
  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## 9.4 Scalability and Computational Complexity
Scalability of formal verification and code generation of institutions
is one of the most critical challenges toward practical deployment. To
complete verification of SoS descriptions containing 100+ actors and 50+
contracts within practical time, theoretical analysis of computational
complexity of verification methods and development of efficient
algorithms are necessary.

  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **ID**   **Challenge**                  **Content**
  -------- ------------------------------ ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  RD-4.1   Computational Complexity of\   Determine computational complexity classes for consistency verification, deadlock detection, and safety verification of CADL descriptions respectively. Identify decidability boundary conditions.
           Institutional Verification

  RD-4.2   Abstraction-based\             Methods to efficiently verify large-scale SoS through hierarchical abstraction of institutional descriptions. Application of counterexample-guided abstraction refinement (CEGAR) to institutional verification.
           Scalable Verification

  RD-4.3   Incremental\                   Technology to confirm consistency through differential verification rather than full re-verification when actors join/leave or institutions change. Implementation of compositional verification theory.
           Verification
  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## 9.5 Multi-Cultural and Multi-Jurisdictional Support
For CADL to be applied to international SoS, support for different legal
systems, cultural norms, and language environments is necessary. EU Data
Act [2024] legally mandates smart-contract-ification of data sharing
in Europe, but institutional compatibility with other jurisdictions
(Japan, US, China, etc.) remains an unresolved challenge.

  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **ID**   **Challenge**                            **Content**
  -------- ---------------------------------------- ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  RD-5.1   Cross-jurisdictional Institutional\      Technology to detect legal contradictions when composing CADL descriptions from different jurisdictions (e.g., differences between EU GDPR and Japanese Personal Information Protection Act).
           Compatibility Verification

  RD-5.2   Parameterization of\                     Technology to model cultural dimensions (collectivism/individualism, power distance, uncertainty avoidance, etc.) as institutional parameters and handle cross-cultural governance differences quantitatively.
           Cultural Norms

  RD-5.3   Multilingual Institutional Description   Enable CADL overview-level descriptions in multiple languages with AI verifying institutional equivalence across languages. Realize NFR-7 (internationalization).
  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## 9.6 Research Roadmap
We organize the above research directions along a time axis and present
a short-, medium-, and long-term research roadmap:

  -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Period**     **Key Challenges**   **Content**
  -------------- -------------------- -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Short-term\    RD-1.1, RD-2.2,\     Establishment of basic theory for institutional composition, initial prototype of CADL generation via LLM, computational complexity analysis of verification, integrated experiments with MAPF simulator.
  (2026-2027)    RD-4.1, RD-4.3

  Medium-term\   RD-1.3, RD-2.1,\     Mathematical analysis of parameter space, experiments in institutional inference from IoT sensors, institutional simulator construction, implementation of scalable verification methods.
  (2027-2028)    RD-3.1, RD-4.2

  Long-term\     RD-2.3, RD-3.2,\     Tacit knowledge ontology, complete implementation of institutional digital twins, institutional A/B testing platform, multicultural and multi-jurisdictional support.
  (2028-2030)    RD-3.3, RD-5.1-5.3
  -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
