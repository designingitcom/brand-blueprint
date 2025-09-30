awesome — here’s the **implementation-ready spec** with your requested **Logic / Routing** column. i added the two conditional cases you mentioned, plus “Other” for Q28 & Q29.

# Phase 1 – Business Basics

| Question | Field Type | Notes | Example | Required? | Logic / Routing |
| --- | --- | --- | --- | --- | --- |
| 1) What is your business name? | Single-line text | Non-empty validation. | Acme Consulting Group | ✅ | — |
| 2) What is your website URL? | URL input **+ chip** (“No website yet”) | Validate URL if present. Show chip inline. | [https://acme.com](https://acme.com/) | ✅ | **If chip “No website yet” is selected (Quick Start path only)** → show **“Company description (1–2 sentences)”** (long text, required in QS). |
| 3) What industry are you in? | Dropdown (autocomplete) | 50–100 industry options; allow free text if needed. | Management Consulting | ✅ | Include **“Other”** option → if selected, show **“Enter industry”** (single-line text, required). |
| 4) What’s your LinkedIn company profile? | URL input | Validate linkedin.com/company/. | https://www.linkedin.com/company/acme/ | ✅ | — |
| 5) What type of business do you run? | Chip multi-select | Options: B2B, B2C, SaaS, Services, E-commerce, Nonprofit, Agency (multi). | B2B, SaaS | ✅ | — |
| 6) Upload any existing files that help us understand your business. | File upload (multi) | Allow PDF/DOCX/CSV/PNG. Store metadata; enable AI parsing. | Pitchdeck_Q1_2025.pdf | ❌ | — |
| 7) How would you describe your business in 2–3 sentences? | Long text + **AI draft** | Prefill from answers/uploads; user can edit/replace. | “Acme helps mid-size manufacturers…” | ✅ | — |

---

# Phase 2 – Services & Offerings (multi-matrix)

| Question | Field Type | Notes | Example | Required? | Logic / Routing |
| --- | --- | --- | --- | --- | --- |
| Service 1 – Name | Single-line text | Repeat group (max 3 services). | “Implementation Consulting” | ✅ | — |
| Service 1 – Short Description | Short text | Plain-English summary. | “We implement ERP workflows.” | ✅ | — |
| Service 1 – Primary Benefit / Outcome | Short text | Customer-facing outcome. | “Cut ops costs by 15–25%.” | ✅ | — |
| Service 2 – Name | Single-line text | Optional 2nd row. | “Training & Enablement” | ❌ | — |
| Service 2 – Short Description | Short text | — | “Team training on new stack.” | ❌ | — |
| Service 2 – Primary Benefit / Outcome | Short text | — | “Faster adoption, fewer errors.” | ❌ | — |
| Service 3 – Name | Single-line text | Optional 3rd row. | “Managed Services” | ❌ | — |
| Service 3 – Short Description | Short text | — | “Ongoing ops support.” | ❌ | — |
| Service 3 – Primary Benefit / Outcome | Short text | — | “Predictable uptime & SLAs.” | ❌ | — |
| (Optional) Brochure / one-pager per service | File upload | Attach to each service row. | “Enablement_Overview.pdf” | ❌ | — |

---

# Phase 3 – Positioning

| Question | Field Type | Notes | Example | Required? | Logic / Routing |
| --- | --- | --- | --- | --- | --- |
| 8) Who are your top 3 competitors? | Multi-URL list | Up to 3 entries; allow name + URL. | “Globex — globex.com” | ✅ | — |
| 9) What makes you different from them? | Long text | Differentiators vs named competitors. | “Deeper ops focus, fixed-fee model.” | ✅ | — |
| 10) What category are you in? | Dropdown (autocomplete) | Predefined list (e.g., SaaS → Ops; Services → Consulting). | “Consulting → Operations” | ✅ | — |
| 11) How do customers currently solve this without you? | Long text | Alternatives/workarounds status quo. | “In-house spreadsheets + contractors.” | ✅ | — |
| 12) Why do customers choose you / what makes you the right choice? | Long text | Merge VOC + internal proof. | “Speed to value; certified team.” | ✅ | — |
| 13) What’s your unique approach or “secret sauce”? | Long text | Methodology, IP, frameworks. | “OpsPlaybook™ + on-site pilots.” | ✅ | — |

---

# Phase 4 – Customer Intelligence

| Question | Field Type | Notes | Example | Required? | Logic / Routing |
| --- | --- | --- | --- | --- | --- |
| 14) Who do you currently serve best? | Short text or chip select | Allow free text + common segments. | “Mid-size manufacturers (200–1000 employees)” | ✅ | — |
| 15) Share a customer success story. | Long text | Include metrics/outcomes if possible. | “ACME cut changeover time 23%…” | ❌ | — |
| 16) Describe your customer’s buying journey. | Long text | Steps from awareness → decision. | “Ops lead pilots; CFO signs.” | ❌ | — |
| 17) What language do customers use to describe your product/service? | Long text | Collect exact phrases/keywords. | “Make factory runs smoother” | ✅ | — |
| 18) What’s the main obstacle your customers face? | Long text | Primary pain/barrier. | “Cost of downtime” | ✅ | — |
| 19) What transformation do you enable? | Long text | Before → After framing. | “Reactive → Predictable ops” | ✅ | — |
| 20) How urgent is this problem for your customers? | Select (Low/Med/High) + reason text | 1 required select + optional reason. | High — “Q4 peak demand” | ✅ | — |
| 21) How do customers measure success? | Short text | KPIs, metrics, outcomes. | “OEE, throughput, SLA adherence” | ✅ | — |

---

# Phase 5 – ICP & Persona

| Question | Field Type | Notes | Example | Required? | Logic / Routing |
| --- | --- | --- | --- | --- | --- |
| 22) Select your primary market segment (ICP). | Chip select (AI-suggested) + “Other” | Show 2–4 AI options; allow multiple? (prefer 1 primary). | “Mid-market manufacturing” | ✅ | **If “Other” selected** → show **“Describe ICP”** (short text, required). |
| 23) Select your ideal customer persona. | Chip select (AI-suggested) + “Other” | e.g., Ops Director, COO, Plant Manager. | “Director of Operations” | ✅ | **If “Other” selected** → show **“Describe persona”** (short text, required). |

---

# Phase 6 – Brand DNA & Communication

| Question | Field Type | Notes | Example | Required? | Logic / Routing |
| --- | --- | --- | --- | --- | --- |
| 24) What are your brand values? | Chip multi-select | Provide 20–30 chips; allow custom add. | Innovative, Reliable, Bold | ✅ | — |
| 25) What’s your brand’s tone of voice? | Chip selectors / slider pairs | Pairs: Professional↔Casual, Bold↔Conservative, Playful↔Serious, Simple↔Sophisticated. | Professional, Bold, Simple | ✅ | — |
| 26) Optional: Contrarian or unconventional beliefs? | Long text | Skippable; adds distinctiveness. | “Best-of-breed beats all-in-one.” | ❌ | — |
| 27) Proof points / credibility markers | Multi-select chips **+ “Other” text** | Chips: Certifications, Awards, Case studies, Press, Stats, Reviews, Partnerships, Security/Compliance; allow file links. | Case studies, ISO 9001, 98% SLA | ❌ | **If “Other” selected** → show **text** to specify. |
| 28) #1 business/marketing goal (6–12 months) | Single select (list) **+ “Other” text** | Options: Lead gen, Conversions, Awareness, Launch product, New market, Hiring pipeline, Fundraising narrative, Retention/Expansion. | Lead generation | ✅ | **If “Other” selected** → show **“Describe goal”** (short text, required). |
| 29) Non-negotiables / guardrails | Multi-select chips **+ “Other” text** | Chips: No jargon, No discounts, No luxury tone, No profanity, No price mentions, Avoid technical acronyms, Avoid fear tactics, etc. | No jargon; No discounts | ❌ | **If “Other” selected** → show **“Add guardrail”** (short text). |

---

## Notes for Dev/Design

- **Paths:** The “No website yet → Company description” conditional only fires in **Quick Start**. In full flow, website URL is required (chip hidden).
- phase 4 and phase 6 are optional if we pick the ‘fast track ‘ path . we need a screen if we are on fast track to clealry show this.. allow them to skip forward, or motivate them to add more questions to get faster results
- **AI touchpoints:**
    - Q7 (business description) prefilled from P1 + files.
    - ICP/Persona (Q22–23) show AI-suggested options based on P2–P4.
- **Validation:** Mark all ✅ as required; conditional sub-fields inherit required when triggered.
- **Chips:** Use searchable selectable chips with “add custom” support (for Values, Tone, Proof, Guardrails).
- **Matrix:** Services block is a repeatable group with add/remove up to 3; each service row enforces all 3 fields when the row exists.

want me to drop this into a **CSV/Notion table** or a quick **Figma-ready schema** (labels, placeholders, help text) so your team can wire it up right away?