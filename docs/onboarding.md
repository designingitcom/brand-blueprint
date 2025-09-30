# Smart Onboarding System — Master Spec (Merged)


---

## 1) System Overview

**Purpose:** A unified, three‑path onboarding system that gathers the minimum viable inputs, guides optional deepening, and orchestrates AI research to produce an activation‑ready strategic foundation.

**Core Principles:**

* **Progressive enhancement:** Depth is user‑controlled; quality scales with inputs + research.
* **Human‑in‑the‑loop:** AI suggests; the user (or strategist) confirms, edits, and elevates.
* **One dataset, many experiences:** A single question bank + research layer powers all paths.
* **Confidence transparency:** Every output is tagged with a confidence score; thresholds gate activation.

---

## 2) Path Selector (UX)

**Prompt:** *How do you want to build your foundation?*

* **🚀 Path 1: Quick Start (5–8 min | 6 Qs)**

  * **Purpose:** Rapid triage → which areas to focus on.
  * **Output:** Module‑style recommendations + path suggestion.
  * **AI Research:** Basic (simple analysis; no deep web research).

* **🎯 Path 2: Progressive Enhancement (15–40 min | 12–31 Qs)**

  * **Purpose:** Build a strategic foundation at your pace.
  * **Output:** From basic to complete foundation (user‑controlled depth).
  * **AI Research:** Basic → Enhanced if Block 1 is completed.

* **🏆 Path 3: Complete Foundation (30–40 min | 31 Qs)**

  * **Purpose:** Maximum quality, full strategic foundation now.
  * **Output:** Activation‑ready foundation.
  * **AI Research:** Comprehensive (basic + enhanced).

---

## 3) Question Architecture (Phases & Blocks)

### 3.0 Six‑Question Framework (applies to every question)

**Goal:** make each concept crystal‑clear and answerable in minutes. The helper appears as a 6‑tab panel beside every field (collapsed by default in Quick Start).

1. **In Plain English** — a one‑sentence, non‑jargony definition of the term.
2. **Why It Matters** — what this answer unlocks downstream (Feeds_Forward) + examples of where it’s used.
3. **What “Good” Looks Like** — quality bar, 2–3 strong examples, 1 weak counter‑example.
4. **How To Answer Fast** — a mini template + suggested sources ("Use Previous", site/competitor excerpts) + optional **Ask AI** draft.
5. **Pitfalls To Avoid** — common mistakes, anti‑patterns, things to leave out.
6. **Confidence & Next Steps** — how we score this field, what raises confidence, suggested refinements if low.

**Quick Start behavior:** shows tabs **1, 2, 4** by default; **3, 5, 6** collapsed. **Paths 2–3:** all tabs available by default.

**DB mapping (→ `questions` table fields):**

* 1. In Plain English → `simple_terms_version`
* 2. Why It Matters → `why_this_matters`
* 3. What “Good” Looks Like → `examples_suggestions`
* 4. How To Answer Fast → `alternative_formats` (templates) and `interactive_elements`; AI notes → `ai_assistance_notes`
* 5. Pitfalls To Avoid → `expert_tips`
* 6. Confidence & Next Steps → `confidence_guidance`

---

### 3.1 Quick Start Questions (Path 1 only)

* Business name + website + industry
* What do you offer (briefly)
* What are you most unclear about? (target, competition, positioning, problems, all)
* Urgency (this week / this month / build properly)
* Biggest business challenge
* How much you know about competitors (know well / some / little / none)

**Output:** Triage summary + recommended next steps (Fast‑Track into Path 2 or targeted deep‑dive tasks).

---

### 3.2 Foundation Phases (Paths 2 & 3)

**Phase 1 — Business Basics (4 Qs)**

1. Business name + website
2. Industry + business type
3. Primary service/product
4. How long in business

**Phase 2 — Market Context (4 Qs)**

1. Top 3 competitors (URLs)
2. What makes you different
3. Who you currently serve best
4. What problem you solve

**Phase 3 — Quick Positioning (4 Qs)**

1. How customers currently solve this
2. Why customers choose you
3. Outcome you deliver
4. “We help [who] achieve [what] by [how]”

> **AI Research (Basic)** triggers after Phase 3 in Paths 2 & 3.

---

### 3.3 Enhancement Block 1 (5 Qs)

1. Customer success stories
2. Buying process insights
3. Customer language examples
4. Pain urgency/impact
5. Success metrics customers use

* **Path 2:** Optional (unlocks Enhanced AI Research).
* **Path 3:** Required.

> **Enhanced AI Research** triggers after Block 1 when completed.

---

### 3.4 ICP & Persona (Paths 2 & 3)

* **Phase 4 — ICP Selection:** 2–3 AI options (Path 2) or 3–4 (Path 3), each with confidence ranges.
* **Phase 5 — Persona Selection:** Options scoped to chosen ICP. Confidence displayed.

---

### 3.5 Enhancement Block 2 (14 Qs)

1. Describe business in 2–3 sentences
2. Problem you solve
3. Category you’re in
4. Main obstacle customers face
5. Transformation you enable
6. Why you’re the right choice
7. Brand values
8. Contrarian belief
9. What you do **not** do
10. Alternatives customers have
11. Unique approach
12. Buying triggers
13. Core value proposition
14. How you measure success

* **Path 2:** Optional → converts a Basic foundation into a **Complete** one.
* **Path 3:** Required.

---

## 4) Source‑of‑Truth & Input Priority

**Six‑Question tie‑ins:**

* **Tab 4 (How To Answer Fast)** surfaces smart re‑use: **Use Previous**, **Synthesize**, **AI‑enhance**, or **Start Fresh**.
* **Tab 6 (Confidence & Next Steps)** displays real‑time confidence + exactly which evidence will raise it.

**Per‑question sources:**

1. **Previous answers** (direct reuse)
2. **Synthesis of previous** (combine prior inputs)
3. **AI‑enhanced previous** (previous + research context)
4. **New direct input**
5. **AI research only** (always user‑validated)

**Confidence heuristics:** Previous (0.9) > Synthesis (0.8) > AI‑enhanced (0.7) > New input (0.6–0.8) > Research‑only (0.5–0.7).

> Each question stores: previous context used, AI context shown, final input, confidence guidance, and pointers to upstream/downstream dependencies.

**Per‑question sources:**

1. **Previous answers** (direct reuse)
2. **Synthesis of previous** (combine prior inputs)
3. **AI‑enhanced previous** (previous + research context)
4. **New direct input**
5. **AI research only** (always user‑validated)

**Confidence heuristics:** Previous (0.9) > Synthesis (0.8) > AI‑enhanced (0.7) > New input (0.6–0.8) > Research‑only (0.5–0.7).

> Each question stores: previous context used, AI context shown, final input, confidence guidance, and pointers to upstream/downstream dependencies.

---

## 5) Website Context Chips (Research Scope Control)

**Under Website URL:**

* 🚫 No website yet
* 🔄 Outdated/doesn’t reflect current business
* 🎯 Planning major redesign
* 📝 Minimal/placeholder content
* ⚠️ Site doesn’t represent target market
* ✅ Accurate representation *(default)*

**Effect on AI research:**

* Chips selectively **skip/limit** messaging analysis vs **focus** on industry, competitors, target market, etc.
* Smart defaults: empty URL → auto‑select “No website yet”; populated URL → default to “Accurate”.
* Research preview explicitly lists what will be analyzed, limited, or skipped.

---

## 6) AI Research System

**When it runs:**

* **Basic** after Phase 3 (Paths 2 & 3).
* **Enhanced** after Block 1.

**Inputs used:** Website (+ chips), competitor URLs, industry/business type, problem/positioning context, Block‑1 artifacts (stories, language, buying process, metrics).

**Focus areas:**

* Competitor messaging, testimonials, delivery model, pricing signals
* Industry trends, common pains/goals, compliance/context
* Customer roles, terminology, buying behavior, KPIs

**Architecture:** modular research agents triggered by completion events; research artifacts attached to the related questions/components with provenance and confidence.

---

## 7) Confidence & Activation Gates

**Thresholds:**

* **≥ 0.80** → Activation‑ready
* **0.60–0.79** → Recommend targeted refinement
* **< 0.60** → Complete refinement before activation

**Targeted refinement (examples):** ICP Hardening, Problem Validation, Category Positioning, Competitive Advantage, Proof Accumulation.

**Roadmaps:** 30‑day foundation fixes → 90‑day strategic enhancements → ongoing market/competitor monitoring.

---

## 8) Brand DNA Output Package (What You Get)

**8.1 One‑Page Summary**

* Primary Segment & Persona, Core Promise (Mad‑Lib), evidence sources, overall confidence.

**8.2 Mad‑Lib Positioning**
*We help [IDEAL CUSTOMER] achieve [OUTCOME] with [UNIQUE MECHANISM] in [CATEGORY].*

**8.3 WHY / THEY / US / COMPETITION Cards**

* **WHY:** pains, goals, triggers, success metrics
* **THEY:** ICP firmographics, roles, disqualifiers, buying motion
* **US:** values, contrarian belief, identity line, brand promise
* **COMPETITION:** real alternatives, their claims vs your counter‑stance

**8.4 ICP & Personas**

* ICP details, technographics, buying motion, persona KPIs, triggers/evaluation.

**8.5 Messaging Architecture**

* Three pillars (Pain → Value → Proof → Headlines), CTA pack, top objections & rebuttals, reusable copy blocks.

**8.6 Proof & Credibility**

* Reasons‑to‑believe, social proof inventory + gaps, case study recommendations.

**8.7 Go‑to‑Market Snapshot**

* Prioritized channels (with rationale), lead magnets, competitor angles.

**8.8 Voice & Tone**

* Tone labels, do/don’t words, signature phrases, reading guidance.

**8.9 Design Cues**

* Color inspiration, type pairing, imagery tags (directional only).

**8.10 Metrics & Roadmap**

* Success metrics, 30‑day tasks (confidence gaps), 90‑day framework.

**8.11 Confidence‑Driven Refinement Plan**

* Thresholds, module‑style recommendations, evidence requirements, actions.

**8.12 Activation Readiness Checklist**

* Minimum component completeness + proof bar for go‑to‑market.

**8.13 Exports**

* JSON/CSV (systems), Markdown (PM), PDF/PNG (presentation).

> Each component lists traceable inputs (direct answers vs research) and confidence scores.

---

## 9) Comparative Path Summary (At a Glance)

| **Phase**            | **Path 1: Quick Start** | **Path 2: Progressive Enhancement**     | **Path 3: Complete Foundation** |
| -------------------- | ----------------------- | --------------------------------------- | ------------------------------- |
| Quick Start Qs       | **6 total**             | –                                       | –                               |
| Phases 1–3           | –                       | **12 Qs (complete)**                    | **12 Qs (complete)**            |
| Basic AI Research    | **Yes (simple)**        | **Yes**                                 | **Yes**                         |
| Enhancement Block 1  | –                       | **Optional (+5)**                       | **Required (+5)**               |
| Enhanced AI Research | –                       | **If Block 1**                          | **Yes**                         |
| Phase 4: ICP         | –                       | **2–3 options**                         | **3–4 options**                 |
| Phase 5: Persona     | –                       | **2–3 options**                         | **3–4 options**                 |
| Enhancement Block 2  | –                       | **Optional (+14)**                      | **Required (+14)**              |
| Total Qs             | **6**                   | **12–31**                               | **31**                          |
| Output               | Module guidance         | Strategic foundation (basic → complete) | Complete foundation             |
| Confidence           | N/A                     | 65–85%                                  | 85–95%                          |

---

## 10) Technical & UX Notes

**Six‑Question UI:** 6‑tab side panel; keyboard shortcuts **1–6** toggle tabs; context chips show provenance (Prev / Synth / AI‑enhanced / New / Research). Per‑tab visibility defaults based on path.

**Backend:** Single question DB; per‑question metadata (type, validation, assistance notes, dependencies); research agents fire on completion checkpoints; component‑level confidence aggregation.

**UX:** Path cards with time/value framing; progress bars; optional enhancement prompts; context‑aware assistance on each question; escape hatches at every decision point.

**QA:** Multi‑source research validation; confidence transparency; research citations; user feedback loops.

**Implementation priorities:**

1. MVP: three‑path flow, website chips, basic competitor/industry research, ICP/persona generation, confidence framework, **Six‑Question panel (tabs 1,2,4,6)**.
2. Enhancements: deeper research blocks, contextual help, source transparency, output quality indicators, **tabs 3 & 5** content library.
3. Optimization: A/B value‑prop tests for blocks, advanced validation, peer benchmarking, predictive confidence.

**Backend:** Single question DB; per‑question metadata (type, validation, assistance notes, dependencies); research agents fire on completion checkpoints; component‑level confidence aggregation.

**UX:** Path cards with time/value framing; progress bars; optional enhancement prompts; context‑aware assistance on each question; escape hatches at every decision point.

**QA:** Multi‑source research validation; confidence transparency; research citations; user feedback loops.

**Implementation priorities:**

1. MVP: three‑path flow, website chips, basic competitor/industry research, ICP/persona generation, confidence framework.
2. Enhancements: deeper research blocks, contextual help, source transparency, output quality indicators.
3. Optimization: A/B value‑prop tests for blocks, advanced validation, peer benchmarking, predictive confidence.

---

## 11) Appendix — Source Mapping Examples

**Example (Phase 3 – “What outcome you deliver”):**

* Uses: Phase 2 “problem” + testimonial/case study extraction.
* UI: [Use Previous] · [Refine] · [Start Over]
* AI Context: industry‑typical outcomes presented for validation (not auto‑overwrite).

**Example (Block 2 – “Core value proposition”):**

* Inputs: Phase 3 positioning + differentiation + outcome synthesis + enhanced research.
* Confidence: rises when outcomes, proof, and differentiators triangulate.

**Example (CTA Pack):**

* Inputs: Buying triggers (Block 2), buying motion, persona preferences; outputs primary + secondary/low‑friction CTAs.

---

## 12) Template — Question File Skeleton

```
[Question_ID]: <UUID or slug>
[Question_Title]: <short user-facing label>
Type: <text | select | chips | checkbox | scale | etc>
Required: <true|false>
Validation: <rules>
Assistance:
  - AI enabled: <true|false>
  - Notes: <when/how to assist>
Context:
  - Builds_From: [Q_refs]
  - Feeds_Forward: [Q_refs]
  - Validates_Against: [Q_refs]
  - Downstream_Impact: [components]
Sources:
  - Previous: <ref or synthesis>
  - Client_Input: <fields>
  - AI_Research: <agents + artifacts>
Confidence_Guidance: <what raises/lowers confidence>
UI_Widgets: <cards | chips | sliders | etc>
Export_Mapping: <Brand DNA component fields>

Six-Question Helper:
  1_In_Plain_English: <simple definition>
  2_Why_It_Matters: <downstream uses + why>
  3_What_Good_Looks_Like: <examples + counter-example>
  4_How_To_Answer_Fast: <mini template + sources + Ask AI>
  5_Pitfalls_To_Avoid: <anti-patterns>
  6_Confidence_And_Next_Steps: <scoring + exact evidence to raise>

DB_Mapping:
  simple_terms_version ← 1_In_Plain_English
  why_this_matters ← 2_Why_It_Matters
  examples_suggestions ← 3_What_Good_Looks_Like
  alternative_formats / interactive_elements / ai_assistance_notes ← 4_How_To_Answer_Fast
  expert_tips ← 5_Pitfalls_To_Avoid
  confidence_guidance ← 6_Confidence_And_Next_Steps
```

---

### End of Master Spec
