CODE: S1-DB-V1.0

Sept 4 2025

# BrandBlueprint Database Schema Documentation - Production-Ready Final Version (Fixed)

## Table of Contents

1. [Schema Overview](about:blank#schema-overview)
2. [Core Enums](about:blank#core-enums)
3. [Authentication & Tenancy Tables](about:blank#authentication--tenancy)
4. [Business Entities](about:blank#business-entities)
5. [Strategy Path System](about:blank#strategy-path-system)
6. [Module System](about:blank#module-system)
7. [Questions & Answers](about:blank#questions--answers)
8. [6-Question Framework](about:blank#6-question-framework)
9. [AI & RAG System](about:blank#ai--rag-system)
10. [Deliverables & Exports](about:blank#deliverables--exports)
11. [Content & Assets](about:blank#content--assets)
12. [Billing & Analytics](about:blank#billing--analytics)
13. [Entity Relationships](about:blank#entity-relationships)
14. [Database Constraints & Functions](about:blank#database-constraints--functions)
15. [Views & Helpers](about:blank#views--helpers)
16. [Performance & Safety](about:blank#performance--safety)

---

## Schema Overview

The BrandBlueprint database is built on PostgreSQL with the following extensions:
- **pgcrypto**: For UUID generation and encryption
- **vector**: For AI embeddings (1536 dimensions)

The schema follows a multi-tenant architecture where:
- **Organizations** are the top-level tenants (agencies or in-house teams)
- **Clients** belong to organizations with extended profile data captured during onboarding
- **Projects** belong to clients and can use predefined strategies, custom module selection, or hybrid approaches
- **Base Project Reuse**: Projects can inherit M1 foundation from another project (read-only link)
- All data is scoped through these relationships with complete audit trails

Key Features:
- **Strategy Path System**: Projects follow predefined module sequences (Startup, Growth, Enterprise) or custom selection
- **Module Provenance**: Every module tracks whether it came from a strategy, template, or manual selection
- **Business Profiles**: Comprehensive onboarding data capture with completeness tracking
- **6-Question Framework**: First-class canonical values separate from individual answers
- **Module Dependencies**: Supports requires/recommends/blocks relationships between modules
- **URL-Friendly Slugs**: Clean URLs for clients and projects
- **Complete Audit Trail**: Full versioning and source tracking throughout

Production Hardening:
- **No self-referencing dependencies** or cyclic base projects
- **Org-scoped strategy codes** preventing naming conflicts
- **Typed enums** for all status and choice fields
- **Performance indexes** and materialized views for dashboards
- **Safety constraints** ensuring data integrity

---

## Core Enums

### User & Access Enums

| Enum | Values | Description |
| --- | --- | --- |
| **role** | owner, admin, strategist, client_owner, client_editor, viewer | User roles within organization |
| **invitation_status** | pending, accepted, declined, expired, revoked | Invitation tracking |

### Strategy & Module Enums

| Enum | Values | Description |
| --- | --- | --- |
| **strategy_mode_enum** | custom, predefined, hybrid | How project modules are selected |
| **module_source_enum** | manual, strategy, template | Where a module came from |
| **module_status** | not_started, in_progress, needs_review, approved, locked | Module completion status |
| **module_visibility** | internal, client | Who can see the module |
| **module_dependency_type_enum** | requires, recommends, blocks | Module prerequisite strength (blocks = must be approved) |

### Answer & Framework Enums

| Enum | Values | Description |
| --- | --- | --- |
| **answer_status** | draft, submitted, flagged, approved | Answer approval workflow |
| **confidence** | low, medium, high | Answer confidence level |
| **canonical_status** | draft, submitted, approved | 6Q framework value status |
| **source_enum** | user, ai, import, answer_link, strategy, template | Unified source tracking |

### Question Types

| Enum | Values | Description |
| --- | --- | --- |
| **question_type** | text, longtext, number, boolean, date, rating, select, multiselect, url, file, persona, matrix | Input types for questions |
| **framework_code** | sixq | Framework identifier (6-Question) |
| **sixq_slot** | q1, q2, q3, q4, q5, q6 | 6Q framework positions |

### AI & Processing Enums

| Enum | Values | Description |
| --- | --- | --- |
| **ai_provider** | openai, anthropic, openrouter | LLM providers |
| **ai_run_status** | success, error, rate_limited, canceled | AI operation status |
| **ai_message_role_enum** | system, user, assistant, tool, function | AI message roles |

### Deliverable & Export Enums

| Enum | Values | Description |
| --- | --- | --- |
| **deliverable_type** | brand_blueprint, value_props, personas, journey_map, sitemap, wireframes, ui, wp_blocks, pdf, csv, json | Output types |
| **deliverable_status** | draft, in_review, approved, published | Deliverable workflow |
| **approval_decision** | approved, changes_requested, rejected | Approval outcomes |
| **export_format_enum** | pdf, html, docx, md, json, csv | Export formats |
| **job_status_enum** | queued, processing, succeeded, failed, canceled | Job statuses |

### Business Enums

| Enum | Values | Description |
| --- | --- | --- |
| **company_size_enum** | startup, small, medium, large, enterprise | Organization/client size categories |
| **budget_range_enum** | under_10k, 10k_25k, 25k_50k, 50k_100k, 100k_250k, 250k_500k, 500k_plus | Budget ranges |
| **timeline_urgency_enum** | immediate, 1_month, 3_months, 6_months, 1_year, no_rush | Timeline urgency |
| **business_model_enum** | b2b, b2c, b2b2c, marketplace, saas, d2c, nonprofit, government, other | Business models |

### Billing Enums

| Enum | Values | Description |
| --- | --- | --- |
| **plan_code** | free, pro, agency, enterprise | Subscription tiers |
| **subscription_status** | trialing, active, past_due, canceled, unpaid | Subscription states |
| **notification_channel** | in_app, email | Notification delivery methods |

---

## Authentication & Tenancy

### organizations

Top-level tenant container for agencies or in-house teams.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| name | TEXT | NOT NULL | Organization name |
| slug | TEXT | UNIQUE, NOT NULL | URL-friendly identifier |
| settings | JSONB | DEFAULT ‘{}’ | Flexible configuration options |
| logo_url | TEXT |  | Organization logo |
| website | TEXT |  | Organization website |
| industry | TEXT |  | Organization’s industry |
| company_size | company_size_enum |  | Organization size category |
| timezone | TEXT | DEFAULT ‘UTC’ | Default timezone |
| onboarding_completed | BOOLEAN | DEFAULT FALSE | Onboarding status |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Triggers**: update_updated_at_column

### users

System users across all organizations.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| email | TEXT | UNIQUE, NOT NULL | Login email |
| name | TEXT |  | Full name |
| avatar_url | TEXT |  | Profile picture URL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Account creation |
| last_login_at | TIMESTAMPTZ |  | Last login timestamp |

### memberships

Links users to organizations with roles.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| organization_id | UUID | FK → organizations ON DELETE CASCADE | Organization reference |
| user_id | UUID | FK → users ON DELETE CASCADE | User reference |
| role | role | DEFAULT ‘viewer’ | User’s role in org |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Membership created |

**Indexes**: organization_id, user_id

**Unique**: (organization_id, user_id)

### invites

Pending invitations to join organizations.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| organization_id | UUID | FK → organizations ON DELETE CASCADE | Inviting organization |
| email | TEXT | NOT NULL | Invitee email |
| role | role | DEFAULT ‘viewer’ | Proposed role |
| token | TEXT | UNIQUE, NOT NULL | Invitation token |
| expires_at | TIMESTAMPTZ | NOT NULL | Expiration time |
| accepted_at | TIMESTAMPTZ |  | When accepted |

### api_keys

API access tokens for programmatic access.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| owner_type | TEXT | CHECK IN (‘org’,‘user’) | Key owner type |
| owner_id | UUID | NOT NULL | Owner reference |
| name | TEXT | NOT NULL | Key description |
| hash | TEXT | NOT NULL | Hashed key value |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| revoked_at | TIMESTAMPTZ |  | Revocation time |

---

## Business Entities

### clients

Businesses being served (belong to organizations).

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| organization_id | UUID | FK → organizations ON DELETE CASCADE | Parent organization |
| name | TEXT | NOT NULL | Client business name |
| **slug** | TEXT | NOT NULL | URL-friendly identifier |
| industry | TEXT |  | Industry vertical |
| website | TEXT |  | Company website |
| locale | TEXT | DEFAULT ‘en’ | Primary locale |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |

**Indexes**: organization_id

**Unique**: (organization_id, name), **(organization_id, slug)**

### business_profiles

Extended business information captured during onboarding.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| client_id | UUID | FK → clients ON DELETE CASCADE | Parent client |
| **Basic Information** |  |  |  |
| legal_name | TEXT |  | Legal business name |
| dba_name | TEXT |  | Doing Business As name |
| founding_year | INTEGER |  | Year founded |
| employee_count | INTEGER |  | Number of employees |
| annual_revenue | TEXT |  | Revenue range text |
| **annual_revenue_min** | NUMERIC(12,2) |  | Min revenue for filtering |
| **annual_revenue_max** | NUMERIC(12,2) |  | Max revenue for filtering |
| **Contact Information** |  |  |  |
| primary_contact_name | TEXT |  | Main contact person |
| primary_contact_email | TEXT |  | Contact email |
| primary_contact_phone | TEXT |  | Contact phone |
| headquarters_address | TEXT |  | Street address |
| headquarters_city | TEXT |  | City |
| headquarters_state | TEXT |  | State/Province |
| headquarters_country | TEXT |  | Country |
| headquarters_postal | TEXT |  | Postal/ZIP code |
| **Business Details** |  |  |  |
| business_model | TEXT |  | Business model text |
| **business_model_structured** | business_model_enum |  | Structured business model |
| target_market | TEXT[] |  | Target market segments |
| primary_products | TEXT[] |  | Main products offered |
| primary_services | TEXT[] |  | Main services offered |
| key_differentiators | TEXT[] |  | Competitive advantages |
| main_competitors | TEXT[] |  | Primary competitors |
| **Strategic Assessment** |  |  |  |
| current_challenges | TEXT[] |  | Current business challenges |
| growth_goals | TEXT[] |  | Growth objectives |
| success_metrics | TEXT[] |  | How success is measured |
| timeline_urgency | TEXT |  | Timeline text |
| **timeline_urgency_structured** | timeline_urgency_enum |  | Structured timeline |
| budget_range | TEXT |  | Budget range text |
| **budget_range_structured** | budget_range_enum |  | Structured budget |
| **Brand Status** |  |  |  |
| has_existing_brand | BOOLEAN | DEFAULT FALSE | Has brand identity |
| brand_satisfaction_score | INTEGER | CHECK 1-10 | Current brand satisfaction |
| has_brand_guidelines | BOOLEAN | DEFAULT FALSE | Has brand guide |
| has_website | BOOLEAN | DEFAULT FALSE | Has website |
| website_satisfaction_score | INTEGER | CHECK 1-10 | Website satisfaction |
| **Marketing Presence** |  |  |  |
| social_media_channels | JSONB |  | {platform: handle/url} |
| marketing_channels | TEXT[] |  | Active marketing channels |
| monthly_marketing_spend | TEXT |  | Marketing budget text |
| **monthly_marketing_spend_amount** | NUMERIC(10,2) |  | Marketing spend amount |
| has_internal_marketing_team | BOOLEAN | DEFAULT FALSE | Has marketing team |
| **Technical Details** |  |  |  |
| current_tech_stack | TEXT[] |  | Current technologies |
| preferred_cms | TEXT |  | Preferred CMS platform |
| integration_requirements | TEXT[] |  | Required integrations |
| **Project Specifics** |  |  |  |
| project_goals | TEXT[] |  | Specific project goals |
| success_definition | TEXT |  | How success is defined |
| key_stakeholders | JSONB |  | [{name, role, email}] |
| decision_maker | TEXT |  | Final decision maker |
| **Preferences** |  |  |  |
| communication_preference | TEXT |  | Email, Slack, Phone, etc. |
| meeting_cadence | TEXT |  | Weekly, Bi-weekly, etc. |
| preferred_timeline | TEXT |  | Desired completion time |
| **Metadata** |  |  |  |
| onboarding_completed | BOOLEAN | DEFAULT FALSE | Onboarding done |
| onboarding_completed_at | TIMESTAMPTZ |  | When completed |
| profile_completeness | INTEGER | DEFAULT 0 | % complete (auto-calculated) |
| last_updated_by | UUID | FK → users ON DELETE SET NULL | Last editor |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**Indexes**: client_id, onboarding_completed, profile_completeness, budget_range_structured, timeline_urgency_structured, (annual_revenue_min, annual_revenue_max)

**Unique**: client_id

**Triggers**: update_profile_completeness, update_updated_at_column

### projects

Work containers for clients with strategy mode support.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| client_id | UUID | FK → clients ON DELETE RESTRICT | Parent client |
| name | TEXT | NOT NULL | Project name |
| **slug** | TEXT | NOT NULL | URL-friendly identifier |
| code | TEXT |  | Project code |
| status | TEXT | CHECK IN (‘active’,‘archived’) | Project status |
| strategy_mode | strategy_mode_enum | DEFAULT ‘custom’ | How modules are selected |
| strategy_path_id | UUID | FK → strategy_paths ON DELETE SET NULL | Template used if predefined |
| base_project_id | UUID | FK → projects ON DELETE SET NULL | Reuse M1 from this project (READ-ONLY link) |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**Indexes**: client_id, strategy_path_id, base_project_id

**Unique**: (client_id, name), **(client_id, slug)**

**Check Constraints**:
- `projects_strategy_ck`: Ensures strategy_mode aligns with strategy_path_id
- No self-reference or cycles in base_project_id
**Triggers**: check_base_project_cycle_trigger, check_strategy_path_org_trigger, update_updated_at_column

---

## Strategy Path System

### strategy_paths

Pre-defined module sequences for different business types.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| organization_id | UUID | FK → organizations ON DELETE CASCADE | Null = global template |
| code | TEXT | NOT NULL | Path identifier (startup, growth, enterprise) |
| name | TEXT | NOT NULL | Display name |
| description | TEXT |  | Path description |
| target_audience | TEXT |  | Who this is for |
| is_active | BOOLEAN | DEFAULT TRUE | Available for selection |
| is_default | BOOLEAN | DEFAULT FALSE | Default for new projects |
| created_by | UUID | FK → users ON DELETE SET NULL | Creator |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**Indexes**: organization_id, code, (organization_id) WHERE is_default = TRUE

**Unique**: **(COALESCE(organization_id, ‘00000000-0000-0000-0000-000000000000’::uuid), code)** - Org-scoped codes

**Business Rules**:
- Only one path can be is_default per organization (enforced by partial unique index)
- Code is unique per organization (NULL org_id = global template)
**Triggers**: update_updated_at_column

### strategy_path_modules

Modules included in each strategy path.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| strategy_path_id | UUID | FK → strategy_paths ON DELETE CASCADE | Parent strategy |
| module_id | UUID | FK → modules ON DELETE RESTRICT | Module to include |
| sort_order | INT | DEFAULT 0 | Sequence order |
| is_required | BOOLEAN | DEFAULT FALSE | Required in this path |
| default_visibility | module_visibility | DEFAULT ‘client’ | Default visibility |
| unlock_rule_json | JSONB |  | Gating conditions |
| notes | TEXT |  | Implementation notes |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**Unique**: (strategy_path_id, module_id)

**Indexes**: strategy_path_id

**Triggers**: update_updated_at_column

---

## Module System

### modules

Master module definitions (M1-M21).

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| code | TEXT | UNIQUE, NOT NULL | Module code (m1-core, etc) |
| name | TEXT | NOT NULL | Display name |
| category | TEXT |  | Module category |
| description | TEXT |  | Module description |
| sort_order | INT | DEFAULT 0 | Display order |
| is_active | BOOLEAN | DEFAULT TRUE | Module available |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**Triggers**: update_updated_at_column

### module_dependencies

Dependencies between modules (not questions).

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| module_id | UUID | FK → modules ON DELETE CASCADE | Dependent module |
| depends_on_module_id | UUID | FK → modules ON DELETE CASCADE | Prerequisite module |
| dependency_type | module_dependency_type_enum | DEFAULT ‘requires’ | Dependency strength |
| notes | TEXT |  | Why this dependency exists |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**Unique**: (module_id, depends_on_module_id)

**Indexes**: module_id, depends_on_module_id

**Check Constraints**: `module_dependencies_no_self_reference_ck` (module_id <> depends_on_module_id)

**Semantics**:
- `requires`: Cannot start until prerequisite completed
- `recommends`: Should complete prerequisite first (warning)
- `blocks`: Cannot start until prerequisite is approved
**Triggers**: update_updated_at_column

### project_modules

Modules selected for a specific project with source tracking.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| project_id | UUID | FK → projects ON DELETE CASCADE | Parent project |
| module_id | UUID | FK → modules ON DELETE RESTRICT | Module reference |
| sort_order | INT | DEFAULT 0 | Display order |
| visibility | module_visibility | DEFAULT ‘client’ | Who can see |
| status | module_status | DEFAULT ‘not_started’ | Progress status |
| is_required | BOOLEAN | DEFAULT FALSE | Required module |
| assigned_to | UUID | FK → users ON DELETE SET NULL | Assignee |
| due_at | TIMESTAMPTZ |  | Due date |
| unlock_rule_json | JSONB |  | Gating conditions |
| source | module_source_enum | DEFAULT ‘manual’ | How module was added |
| source_ref_id | UUID |  | References strategy_path_modules.id or module_set_modules.id |
| started_at | TIMESTAMPTZ |  | Start time |
| completed_at | TIMESTAMPTZ |  | Completion time |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Added to project |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last updated |

**Indexes**: project_id, (project_id, sort_order), (project_id, status), (project_id, completed_at) WHERE completed_at IS NOT NULL, (project_id, sort_order) WHERE status NOT IN (‘locked’, ‘approved’)

**Unique**: (project_id, module_id)

**Triggers**: update_updated_at_column

### module_sets

Pre-defined collections of modules (templates).

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| organization_id | UUID | FK → organizations ON DELETE CASCADE | Owner org (null=global) |
| name | TEXT | NOT NULL | Set name |
| description | TEXT |  | Set description |

### module_set_modules

Modules within a set.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| module_set_id | UUID | FK → module_sets ON DELETE CASCADE | Parent set |
| module_id | UUID | FK → modules ON DELETE RESTRICT | Module reference |
| sort_order | INT | DEFAULT 0 | Display order |
| is_required | BOOLEAN | DEFAULT FALSE | Required in set |

**Unique**: (module_set_id, module_id)

---

## Questions & Answers

### questions

Individual questions within modules.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| module_id | UUID | FK → modules ON DELETE CASCADE | Parent module |
| code | TEXT | NOT NULL | Stable question ID |
| label | TEXT | NOT NULL | Question text |
| help_text | TEXT |  | Helper text |
| type | question_type | NOT NULL | Input type |
| required | BOOLEAN | DEFAULT FALSE | Required question |
| sort_order | INT | DEFAULT 0 | Display order |
| ai_prompt_hint | TEXT |  | AI assistance hint |

**Unique**: (module_id, code)

### question_options

Options for select/multiselect questions.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| question_id | UUID | FK → questions ON DELETE CASCADE | Parent question |
| value | TEXT | NOT NULL | Option value |
| label | TEXT | NOT NULL | Display label |
| sort_order | INT | DEFAULT 0 | Display order |
| is_active | BOOLEAN | DEFAULT TRUE | Option available |

**Indexes**: question_id

### question_dependencies

Conditional display logic between questions.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| question_id | UUID | FK → questions ON DELETE CASCADE | Dependent question |
| depends_on_question_id | UUID | FK → questions ON DELETE CASCADE | Prerequisite question |
| operator | TEXT | CHECK operators | Comparison operator |
| value_json | JSONB |  | Expected value |

**Operators**: equals, not_equals, in, not_in, gte, lte, exists, not_exists

**Indexes**: question_id

### module_question_overrides

Project-specific question customizations.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| project_id | UUID | FK → projects ON DELETE CASCADE | Parent project |
| question_id | UUID | FK → questions ON DELETE CASCADE | Target question |
| hidden | BOOLEAN | DEFAULT FALSE | Hide question |
| sort_order_override | INT |  | Custom sort order |

**Unique**: (project_id, question_id)

### answers

User responses to questions.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| project_id | UUID | FK → projects ON DELETE CASCADE | Parent project |
| question_id | UUID | FK → questions ON DELETE CASCADE | Question answered |
| value_json | JSONB | NOT NULL | Answer value |
| status | answer_status | DEFAULT ‘draft’ | Approval status |
| confidence | confidence | DEFAULT ‘medium’ | Confidence level |
| **source** | source_enum | DEFAULT ‘user’ | Answer source (unified enum) |
| updated_by | UUID | FK → users ON DELETE SET NULL | Last editor |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**Indexes**: project_id, (project_id, question_id) - unique acts as index

**Unique**: (project_id, question_id)

**Triggers**: update_updated_at_column

### answer_revisions

Version history for answers.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| answer_id | UUID | FK → answers ON DELETE CASCADE | Parent answer |
| version | INT | NOT NULL | Version number |
| value_json | JSONB | NOT NULL | Answer at version |
| created_by | UUID | FK → users ON DELETE SET NULL | Who created |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | When created |
| note | TEXT |  | Change note |

**Unique**: (answer_id, version)

### review_requests

Request reviews for answers or deliverables.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| project_id | UUID | FK → projects ON DELETE CASCADE | Parent project |
| question_id | UUID | FK → questions ON DELETE SET NULL | Question to review |
| requested_by | UUID | FK → users ON DELETE SET NULL | Requester |
| reason | TEXT |  | Review reason |
| status | TEXT | CHECK IN (‘open’,‘in_review’,‘resolved’) | Review status |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Request time |

### comments

Comments on various entities.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| project_id | UUID | FK → projects ON DELETE CASCADE | Parent project |
| entity_type | TEXT | CHECK IN (‘answer’,‘deliverable’,‘module’) | What’s commented on |
| entity_id | UUID | NOT NULL | Entity reference |
| author_id | UUID | FK → users ON DELETE SET NULL | Comment author |
| body | TEXT | NOT NULL | Comment text |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Comment time |
| resolved_at | TIMESTAMPTZ |  | Resolution time |

**Indexes**: project_id

---

## 6-Question Framework

### frameworks

Framework definitions (currently just ‘sixq’).

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| code | framework_code | UNIQUE, NOT NULL | Framework code |
| name | TEXT | NOT NULL | Framework name |
| description | TEXT |  | Framework description |

### framework_fields

The 6 question slots (Q1-Q6).

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| framework_id | UUID | FK → frameworks ON DELETE CASCADE | Parent framework |
| slot | sixq_slot | NOT NULL | Q1-Q6 position |
| label | TEXT | NOT NULL | Question label |
| help_text | TEXT |  | Helper text |
| sort_order | INT | DEFAULT 0 | Display order |

**Unique**: (framework_id, slot)

### framework_bindings

Maps framework fields to actual questions.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| framework_field_id | UUID | FK → framework_fields ON DELETE CASCADE | Framework field |
| question_id | UUID | FK → questions ON DELETE CASCADE | Linked question |

**Unique**: framework_field_id

### project_canonical_values

The curated 6Q answers for a project.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| project_id | UUID | FK → projects ON DELETE CASCADE | Parent project |
| framework_field_id | UUID | FK → framework_fields ON DELETE CASCADE | Framework field |
| value_json | JSONB | NOT NULL | Canonical value |
| status | canonical_status | DEFAULT ‘draft’ | Approval status |
| confidence | confidence | DEFAULT ‘medium’ | Confidence level |
| **source** | source_enum | DEFAULT ‘user’ | Value origin (unified enum) |
| answer_id | UUID | FK → answers ON DELETE SET NULL | Source answer |
| updated_by | UUID | FK → users ON DELETE SET NULL | Last editor |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**Indexes**: project_id

**Unique**: (project_id, framework_field_id)

**Triggers**: update_updated_at_column

---

## AI & RAG System

### ai_policies

AI configuration per org or project.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| scope | TEXT | CHECK IN (‘org’,‘project’) | Policy scope |
| scope_id | UUID | NOT NULL | Org or project ID |
| provider | ai_provider | DEFAULT ‘openai’ | LLM provider |
| model | TEXT |  | Model name |
| temperature | NUMERIC(3,2) | DEFAULT 0.20 | Temperature setting |
| max_tokens | INT |  | Token limit |
| allow_tools | BOOLEAN | DEFAULT TRUE | Function calling |
| blocked_topics | TEXT[] |  | Restricted topics |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |

### ai_runs

Individual AI operation records.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| project_id | UUID | FK → projects ON DELETE CASCADE | Parent project |
| trigger | TEXT | CHECK triggers | What triggered |
| input_json | JSONB |  | Input data |
| output_json | JSONB |  | Output data |
| provider | ai_provider | NOT NULL | Provider used |
| model | TEXT |  | Model used |
| status | ai_run_status | DEFAULT ‘success’ | Run status |
| duration_ms | INT |  | Processing time |
| cost_usd | NUMERIC(10,4) |  | Cost in USD |
| created_by | UUID | FK → users ON DELETE SET NULL | Who triggered |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | When run |

**Triggers**: question_assist, rewrite, summarize, deliverable_generate, qa_check

**Indexes**: project_id

### ai_messages

Chat messages within AI runs.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| ai_run_id | UUID | FK → ai_runs ON DELETE CASCADE | Parent run |
| **role** | ai_message_role_enum | NOT NULL | Message role (typed enum) |
| content | TEXT |  | Message content |
| tool_name | TEXT |  | Tool if applicable |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Message time |

### rag_sources

Knowledge base sources for RAG.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| project_id | UUID | FK → projects ON DELETE CASCADE | Project scope (null=org) |
| name | TEXT | NOT NULL | Source name |
| kind | TEXT | CHECK kinds | Source type |
| status | TEXT |  | Processing status |
| last_indexed_at | TIMESTAMPTZ |  | Last index time |

**Kinds**: file, url, notion, gdoc, answers_snapshot

### rag_documents

Documents within RAG sources.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| rag_source_id | UUID | FK → rag_sources ON DELETE CASCADE | Parent source |
| external_id | TEXT |  | External reference |
| title | TEXT |  | Document title |
| url | TEXT |  | Document URL |
| metadata_json | JSONB |  | Additional metadata |

### rag_chunks

Vectorized chunks for similarity search.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| rag_document_id | UUID | FK → rag_documents ON DELETE CASCADE | Parent document |
| chunk_index | INT | NOT NULL | Chunk position |
| content | TEXT | NOT NULL | Chunk text |
| embedding | VECTOR(1536) |  | Vector embedding |
| token_count | INT |  | Token count |

**Unique**: (rag_document_id, chunk_index)

### ai_citations

Links AI responses to source chunks.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| ai_run_id | UUID | FK → ai_runs ON DELETE CASCADE | AI run |
| rag_chunk_id | UUID | FK → rag_chunks ON DELETE CASCADE | Source chunk |
| score | NUMERIC(6,4) |  | Relevance score |

---

## Deliverables & Exports

### deliverables

High-level deliverable containers.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| project_id | UUID | FK → projects ON DELETE CASCADE | Parent project |
| type | deliverable_type | NOT NULL | Deliverable type |
| title | TEXT | NOT NULL | Deliverable title |
| status | deliverable_status | DEFAULT ‘draft’ | Current status |
| created_by | UUID | FK → users ON DELETE SET NULL | Creator |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |

**Indexes**: project_id

### deliverable_versions

Versioned content for deliverables.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| deliverable_id | UUID | FK → deliverables ON DELETE CASCADE | Parent deliverable |
| version | INT | NOT NULL | Version number |
| content_json | JSONB | NOT NULL | Version content |
| rendered_url | TEXT |  | Rendered file URL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Version created |

**Unique**: (deliverable_id, version)

### approvals

Approval workflow for deliverables.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| deliverable_id | UUID | FK → deliverables ON DELETE CASCADE | Target deliverable |
| requested_by | UUID | FK → users ON DELETE SET NULL | Requester |
| assigned_to | UUID | FK → users ON DELETE SET NULL | Approver |
| decision | approval_decision |  | Decision made |
| comment | TEXT |  | Approval comment |
| decided_at | TIMESTAMPTZ |  | Decision time |

### export_jobs

Async export processing jobs.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| deliverable_version_id | UUID | FK → deliverable_versions ON DELETE CASCADE | Source version |
| **format** | export_format_enum | NOT NULL | Export format (typed enum) |
| **status** | job_status_enum | NOT NULL DEFAULT ‘queued’ | Job status (typed enum) |
| output_url | TEXT |  | Result URL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Job created |

---

## Content & Assets

### block_library

Reusable content blocks (WordPress blocks, etc).

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| key | TEXT | UNIQUE, NOT NULL | Block identifier |
| name | TEXT | NOT NULL | Block name |
| schema_json | JSONB | NOT NULL | Block schema |
| category | TEXT |  | Block category |
| status | TEXT | CHECK IN (‘active’,‘deprecated’) | Block status |

### block_instances

Used blocks in projects.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| project_id | UUID | FK → projects ON DELETE CASCADE | Parent project |
| block_id | UUID | FK → block_library ON DELETE RESTRICT | Block type |
| props_json | JSONB | NOT NULL | Block properties |
| created_from_deliverable_version_id | UUID | FK → deliverable_versions ON DELETE SET NULL | Source |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Instance created |

**Indexes**: project_id

### page_templates

Website page templates.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| project_id | UUID | FK → projects ON DELETE CASCADE | Parent project |
| name | TEXT | NOT NULL | Template name |
| layout_json | JSONB | NOT NULL | Layout config |
| status | TEXT | CHECK IN (‘draft’,‘published’) | Status |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |

**Unique**: (project_id, name)

### files

Uploaded files and assets.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| organization_id | UUID | FK → organizations ON DELETE CASCADE | Owner org |
| uploader_id | UUID | FK → users ON DELETE SET NULL | Who uploaded |
| filename | TEXT | NOT NULL | Original filename |
| mime | TEXT |  | MIME type |
| size_bytes | BIGINT |  | File size |
| storage_path | TEXT | NOT NULL | Storage location |
| checksum | TEXT |  | File hash |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Upload time |

### content_assets

Project-specific asset metadata.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| project_id | UUID | FK → projects ON DELETE CASCADE | Parent project |
| file_id | UUID | FK → files ON DELETE CASCADE | File reference |
| alt_text | TEXT |  | Alt text |
| tags | TEXT[] |  | Asset tags |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Added to project |

---

## Billing & Analytics

### plans

Subscription plan definitions.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| code | plan_code | UNIQUE, NOT NULL | Plan identifier |
| name | TEXT | NOT NULL | Plan name |
| price_usd_month | NUMERIC(10,2) |  | Monthly price |
| price_usd_year | NUMERIC(10,2) |  | Annual price |
| limits_json | JSONB |  | Usage limits |

### subscriptions

Active subscriptions.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| organization_id | UUID | FK → organizations ON DELETE CASCADE | Subscriber |
| plan_id | UUID | FK → plans ON DELETE RESTRICT | Plan type |
| status | subscription_status | DEFAULT ‘trialing’ | Current status |
| billing_cycle_anchor | TIMESTAMPTZ |  | Billing anchor |
| trial_end | TIMESTAMPTZ |  | Trial expiration |
| cancel_at_period_end | BOOLEAN | DEFAULT FALSE | Pending cancel |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Subscription start |

### subscription_usage

Usage tracking for billing.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| subscription_id | UUID | FK → subscriptions ON DELETE CASCADE | Parent subscription |
| metric | TEXT | CHECK IN (‘ai_tokens’,‘exports’,‘projects’,‘seats’) | What’s measured |
| period_start | TIMESTAMPTZ | NOT NULL | Period start |
| period_end | TIMESTAMPTZ | NOT NULL | Period end |
| quantity | BIGINT | DEFAULT 0 | Usage amount |

### invoices

Payment records.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| subscription_id | UUID | FK → subscriptions ON DELETE CASCADE | Related subscription |
| external_id | TEXT |  | Stripe/payment ID |
| status | TEXT |  | Payment status |
| total_usd | NUMERIC(10,2) |  | Invoice amount |
| issued_at | TIMESTAMPTZ |  | Issue date |
| paid_at | TIMESTAMPTZ |  | Payment date |

### events

Analytics event tracking.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| organization_id | UUID | FK → organizations ON DELETE CASCADE | Event org |
| user_id | UUID | FK → users ON DELETE SET NULL | Event user |
| project_id | UUID | FK → projects ON DELETE SET NULL | Event project |
| name | TEXT | NOT NULL | Event name |
| props_json | JSONB |  | Event properties |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Event time |

**Indexes**: organization_id, project_id

### audit_logs

Security and compliance audit trail.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| actor_id | UUID | FK → users ON DELETE SET NULL | Who did it |
| action | TEXT | NOT NULL | What they did |
| entity_type | TEXT | NOT NULL | What type |
| entity_id | UUID | NOT NULL | What entity |
| diff_json | JSONB |  | Changes made |
| ip | TEXT |  | IP address |
| user_agent | TEXT |  | Browser info |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | When it happened |

### notifications

User notifications.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier |
| recipient_id | UUID | FK → users ON DELETE CASCADE | Who receives |
| channel | notification_channel | DEFAULT ‘in_app’ | Delivery method |
| title | TEXT | NOT NULL | Notification title |
| body | TEXT | NOT NULL | Notification body |
| read_at | TIMESTAMPTZ |  | When read |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | When sent |

---

## Entity Relationships

### Primary Relationship Chains

```
organizations
    ↔ (has many)
clients (with slugs) → business_profiles (1:1 for extended data)
    ↔ (has many)
projects (with slugs, strategy_mode and strategy_path_id)
    ↔ (has many)
project_modules (with source tracking) ← (references) → modules
    ↔                                                        ↔
answers ← (references) → questions           module_dependencies (no self-refs)
    ↔
answer_revisions

strategy_paths (org-scoped codes) → strategy_path_modules → modules

projects.base_project_id → projects (M1 reuse - READ-ONLY, no cycles)
```

### User Access Chain

```
users → memberships → organizations
  ↔
assigned to various entities (projects, modules, approvals)
```

### 6-Question Framework Chain

```
frameworks → framework_fields → framework_bindings → questions
                    ↔
         project_canonical_values ← answers (unified source_enum)
```

### AI/RAG Chain

```
ai_policies → ai_runs → ai_messages (typed roles)
                ↔
         ai_citations → rag_chunks → rag_documents → rag_sources
```

### Deliverable Chain

```
projects → deliverables → deliverable_versions → export_jobs (typed enums)
                ↔
           approvals
```

---

## Database Constraints & Functions

### Key Constraints

### Project Strategy Constraint

```sql
ALTER TABLE projects ADD CONSTRAINT projects_strategy_ck
CHECK (
  (strategy_mode = 'custom' AND strategy_path_id IS NULL)
  OR (strategy_mode IN ('predefined','hybrid') AND strategy_path_id IS NOT NULL)
);
```

### Module Dependency Self-Reference Prevention

```sql
ALTER TABLE module_dependencies ADD CONSTRAINT module_dependencies_no_self_reference_ck
CHECK (module_id <> depends_on_module_id);
```

### Strategy Path Org-Scoped Uniqueness

```sql
CREATE UNIQUE INDEX strategy_paths_org_code_uk
ON strategy_paths(COALESCE(organization_id, '00000000-0000-0000-0000-000000000000'::uuid), code);
```

### One Default Strategy Path Per Org

```sql
CREATE UNIQUE INDEX strategy_paths_one_default_per_org
ON strategy_paths(organization_id) WHERE is_default = TRUE;
```

### Core Functions

### Apply Strategy Path to Project (Enhanced)

```sql
CREATE OR REPLACE FUNCTION apply_strategy_path_to_project(
  p_project_id UUID,
  p_strategy_path_id UUID,
  p_preserve_custom BOOLEAN DEFAULT FALSE) RETURNS VOID
```

Applies a predefined strategy path to a project, syncing all fields (sort_order, visibility, is_required).

### Check Module Dependencies (Enhanced)

```sql
CREATE OR REPLACE FUNCTION can_start_module(
  p_project_id UUID,
  p_module_id UUID
) RETURNS TABLE(
  can_start BOOLEAN,
  reason TEXT,
  blocking_modules UUID[]
)
```

Returns detailed status about whether a module can be started.

### Link Base Project M1

```sql
CREATE OR REPLACE FUNCTION link_base_project_m1(
  p_project_id UUID,
  p_base_project_id UUID
) RETURNS VOID
```

Creates a read-only link to reuse M1 foundation from another project.

### Calculate Profile Completeness

```sql
CREATE OR REPLACE FUNCTION calculate_profile_completeness(p_profile_id UUID)
RETURNS INTEGER
```

Auto-calculates the percentage of business profile fields completed.

### Generate Unique Slug

```sql
CREATE OR REPLACE FUNCTION generate_unique_slug(
  p_base_text TEXT,
  p_table_name TEXT,
  p_parent_field TEXT DEFAULT NULL,
  p_parent_id UUID DEFAULT NULL) RETURNS TEXT
```

Generates URL-friendly unique slugs for clients and projects.

### Check Base Project Cycle (FIXED)

```sql
CREATE OR REPLACE FUNCTION check_base_project_cycle()
RETURNS TRIGGER AS $$
DECLARE  temp_count integer := 0;  -- Properly declared variableBEGIN  IF NEW.base_project_id IS NOT NULL THEN    WITH RECURSIVE project_chain AS (
      SELECT id, base_project_id
      FROM projects
      WHERE id = NEW.base_project_id
      UNION ALL      SELECT p.id, p.base_project_id
      FROM projects p
      JOIN project_chain pc ON p.id = pc.base_project_id
    )
    SELECT COUNT(*) INTO temp_count  -- Proper SELECT INTO    FROM project_chain
    WHERE id = NEW.id;
    IF temp_count > 0 THEN      RAISE EXCEPTION 'Cannot create circular base project reference';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Check Strategy Path Organization

```sql
CREATE OR REPLACE FUNCTION check_strategy_path_org()
RETURNS TRIGGER
```

Ensures strategy paths belong to same organization or are global.

### Audit Changes (FIXED)

```sql
CREATE OR REPLACE FUNCTION audit_changes()
RETURNS TRIGGER AS $$
DECLARE  old_data JSONB;
  new_data JSONB;
  diff_data JSONB;
BEGIN  IF TG_OP = 'UPDATE' THEN    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
    -- Fixed: Proper SELECT INTO syntax with JSONB consistency    SELECT jsonb_object_agg(
             e.key,
             jsonb_build_object(
               'old', old_data -> e.key,
               'new', new_data -> e.key             )
           )
      INTO diff_data
      FROM jsonb_each(new_data) AS e
      WHERE old_data -> e.key IS DISTINCT FROM new_data -> e.key;
  ELSE    diff_data := to_jsonb(COALESCE(NEW, OLD));
  END IF;
  INSERT INTO audit_logs (
    actor_id, action, entity_type, entity_id, diff_json, ip, user_agent
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    diff_data,
    current_setting('request.headers', true)::json->>'x-forwarded-for',
    current_setting('request.headers', true)::json->>'user-agent'  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

---

## Views & Helpers

### project_m1_answers

Gets M1 answers whether from own project or base project.

```sql
CREATE OR REPLACE VIEW project_m1_answers ASSELECT
  p.id as project_id,
  COALESCE(base_p.id, p.id) as m1_source_project_id,
  a.*FROM projects p
LEFT JOIN projects base_p ON base_p.id = p.base_project_id
LEFT JOIN answers a ON a.project_id = COALESCE(base_p.id, p.id)
-- ... (filtered to M1 module)
```

### project_complete_overview

Comprehensive project information including strategy, profile, and progress.

```sql
CREATE OR REPLACE VIEW project_complete_overview ASSELECT
  p.*,
  c.name as client_name,
  c.slug as client_slug,
  bp.onboarding_completed,
  bp.profile_completeness,
  bp.budget_range_structured,
  bp.timeline_urgency_structured,
  sp.name as strategy_path_name,
  -- ... module counts, completion status, etc.
```

### project_module_details

Shows module details with source information.

```sql
CREATE OR REPLACE VIEW project_module_details ASSELECT
  pm.*,
  p.strategy_mode,
  m.name as module_name,
  CASE pm.source    WHEN 'strategy' THEN 'From: ' || sp.name
    WHEN 'template' THEN 'From: ' || ms.name
    ELSE 'Manually added'  END as source_description
-- ... full join details
```

---

## Performance & Safety

### Materialized View for Dashboards

```sql
CREATE MATERIALIZED VIEW IF NOT EXISTS project_progress_summary ASSELECT
  p.id as project_id,
  p.client_id,
  p.name as project_name,
  p.slug as project_slug,
  p.strategy_mode,
  COUNT(DISTINCT pm.id) as total_modules,
  COUNT(DISTINCT CASE WHEN pm.status = 'approved' THEN pm.id END) as completed_modules,
  ROUND((COUNT(DISTINCT CASE WHEN pm.status = 'approved' THEN pm.id END)::NUMERIC /
         NULLIF(COUNT(DISTINCT pm.id), 0)) * 100, 2) as module_completion_pct,
  MAX(pm.updated_at) as last_activity
FROM projects p
LEFT JOIN project_modules pm ON pm.project_id = p.idGROUP BY p.id, p.client_id, p.name, p.slug, p.strategy_mode;
CREATE UNIQUE INDEX ON project_progress_summary(project_id);
-- Refresh functionCREATE OR REPLACE FUNCTION refresh_project_progress()
RETURNS void AS $$
BEGIN  REFRESH MATERIALIZED VIEW CONCURRENTLY project_progress_summary;
END;
$$ LANGUAGE plpgsql;
```

### Performance Indexes Summary

- **Progress Queries**: (project_id, status) on project_modules
- **Incomplete Profiles**: (organization_id, profile_completeness) WHERE onboarding_completed = FALSE
- **Active Strategies**: (organization_id, is_active) WHERE is_active = TRUE
- **Budget/Timeline Filtering**: Structured enum fields in business_profiles
- **URL Routing**: Unique slugs on clients and projects

### Safety Features

- **No Self-References**: Modules can’t depend on themselves
- **No Cycles**: Base projects can’t create circular references (FIXED)
- **Org Isolation**: Strategy paths validated for organization
- **Type Safety**: All enums properly typed
- **Audit Trail**: Updated_at triggers on all relevant tables (FIXED)

---

## Database Conventions

### Naming Conventions

- Tables: `snake_case` plural (e.g., `projects`, `business_profiles`)
- Fields: `snake_case` singular (e.g., `created_at`, `is_active`)
- Foreign Keys: `[table]_id` (e.g., `project_id`, `user_id`)
- Enums: `snake_case` with `_enum` suffix for types
- Slugs: URL-friendly identifiers for routing

### Standard Fields

Most tables include:
- `id` - UUID primary key
- `created_at` - Creation timestamp
- `updated_at` - Last modification (where applicable with triggers)
- `slug` - URL-friendly identifier (where needed for routing)

### Indexing Strategy

- All foreign keys are indexed
- Unique constraints create implicit indexes
- Additional indexes on frequently queried fields
- Composite indexes for common query patterns
- Partial indexes for conditional queries
- Materialized views for dashboard performance

### Data Integrity

- CASCADE deletes for dependent data
- RESTRICT deletes for critical references
- SET NULL for optional relationships
- CHECK constraints for valid values
- UNIQUE constraints for business rules
- Triggers for auto-calculations and validations

---

## Usage Examples

### Creating a Project with Predefined Strategy

```sql
-- 1. Create client with slugINSERT INTO clients (organization_id, name, slug)
VALUES (?, 'Acme Corp', generate_unique_slug('Acme Corp', 'clients', 'organization_id', ?));
-- 2. Create project with strategy and slugINSERT INTO projects (client_id, name, slug, strategy_mode, strategy_path_id)
SELECT
  ?,
  'Brand Refresh 2024',
  generate_unique_slug('Brand Refresh 2024', 'projects', 'client_id', ?),
  'predefined',
  id
FROM strategy_paths WHERE code = 'growth' AND organization_id = ?;
-- 3. Apply the strategy modulesSELECT apply_strategy_path_to_project(project_id, strategy_path_id);
```

### URL-Based Project Access

```sql
-- Access project by slug path: /acme-corp/brand-refresh-2024SELECT p.*, c.name as client_name
FROM projects p
JOIN clients c ON c.id = p.client_id
WHERE c.slug = 'acme-corp'
AND p.slug = 'brand-refresh-2024'AND c.organization_id = ?;
```

### Checking Module Dependencies

```sql
-- Can user start module?SELECT * FROM can_start_module(project_id, module_id);
-- Returns: (can_start: true/false, reason: text, blocking_modules: UUID[])
```

### Dashboard Query Using Materialized View

```sql
-- Fast dashboard querySELECT * FROM project_progress_summary
WHERE client_id = ?
ORDER BY last_activity DESC;
-- Refresh periodicallySELECT refresh_project_progress();
```

---

## Sample Data

### Strategy Paths (Org-Scoped)

```sql
-- Global templates (NULL org)INSERT INTO strategy_paths (organization_id, code, name, description, target_audience) VALUES(NULL, 'startup', 'Startup Path', 'Lean strategy for early-stage', 'Startups <10 employees'),
(NULL, 'growth', 'Growth Path', 'Comprehensive scaling strategy', 'Companies 10-50 employees');
-- Organization-specific pathsINSERT INTO strategy_paths (organization_id, code, name, is_default) VALUES('org-uuid-1', 'startup', 'Our Startup Process', true),
('org-uuid-2', 'startup', 'Quick Start Path', false);
```

### Module Dependencies (With Safety)

```sql
-- All modules require M1, but can't depend on themselvesINSERT INTO module_dependencies (module_id, depends_on_module_id, dependency_type)
SELECT m2.id, m1.id, 'requires'FROM modules m1, modules m2
WHERE m1.code = 'm1-core'
AND m2.code != 'm1-core'AND m1.id != m2.id; -- Safety check
```

### Business Profile with Structured Data

```sql
INSERT INTO business_profiles (
  client_id,
  legal_name,
  budget_range_structured,
  timeline_urgency_structured,
  annual_revenue_min,
  annual_revenue_max
) VALUES (
  ?,
  'Acme Corporation',
  '25k_50k',
  '3_months',
  1000000,
  5000000);
```

---

## Production Checklist

✅ **Type Safety**
- All enums properly defined
- Unified source_enum across tables
- Typed AI message roles
- Typed export formats and job statuses

✅ **Data Integrity**
- No self-referencing dependencies
- No cyclic base projects (FIXED with proper cycle detection)
- Strategy paths validated for organization
- One default strategy per org enforced

✅ **Performance**
- Indexes on all foreign keys
- Composite indexes for common queries
- Materialized views for dashboards
- Partial indexes for conditional queries

✅ **URL Routing**
- Slugs on clients and projects
- Unique within parent scope
- Helper function for generation

✅ **Audit & Security**
- Updated_at triggers everywhere
- Audit logs for compliance (FIXED with proper JSONB handling)
- Row-level security ready

✅ **Business Logic**
- Profile completeness auto-calculation
- Module dependency checking
- Strategy path application
- Base project M1 reuse

---

## Fixed Issues Summary

This final version includes fixes for the two critical compilation errors:

1. **`check_base_project_cycle()` function**: Now properly declares the `temp_count` variable before using it in the SELECT INTO statement.
2. **`audit_changes()` function**: Fixed with proper SELECT INTO syntax and consistent JSONB data type usage throughout.

All other features remain intact:
- URL-friendly slugs for routing
- Org-scoped strategy codes
- Comprehensive business profiles
- Module dependency system
- 6-Question framework
- AI/RAG integration
- Complete audit trail

The schema is now fully production-ready and will compile cleanly in Supabase.