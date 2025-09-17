-- COMPREHENSIVE ENUM MIGRATION FOR BRAND BLUEPRINT DATABASE
-- Based on complete schema documentation
-- Copy and paste this into Supabase SQL Editor

-- =========================
-- 1. CREATE ALL ENUM TYPES FROM SCHEMA
-- =========================

-- User & Access Enums
CREATE TYPE role AS ENUM (
  'owner', 'admin', 'strategist', 'client_owner', 'client_editor', 'viewer'
);

CREATE TYPE invitation_status AS ENUM (
  'pending', 'accepted', 'declined', 'expired', 'revoked'
);

-- Strategy & Module Enums  
CREATE TYPE strategy_mode_enum AS ENUM (
  'custom', 'predefined', 'hybrid'
);

CREATE TYPE module_source_enum AS ENUM (
  'manual', 'strategy', 'template'
);

CREATE TYPE module_status AS ENUM (
  'not_started', 'in_progress', 'needs_review', 'approved', 'locked'
);

CREATE TYPE module_visibility AS ENUM (
  'internal', 'client'
);

CREATE TYPE module_dependency_type_enum AS ENUM (
  'requires', 'recommends', 'blocks'
);

-- Answer & Framework Enums
CREATE TYPE answer_status AS ENUM (
  'draft', 'submitted', 'flagged', 'approved'
);

CREATE TYPE confidence AS ENUM (
  'low', 'medium', 'high'
);

CREATE TYPE canonical_status AS ENUM (
  'draft', 'submitted', 'approved'
);

CREATE TYPE source_enum AS ENUM (
  'user', 'ai', 'import', 'answer_link', 'strategy', 'template'
);

-- Question Types
CREATE TYPE question_type AS ENUM (
  'text', 'longtext', 'number', 'boolean', 'date', 'rating', 
  'select', 'multiselect', 'url', 'file', 'persona', 'matrix'
);

CREATE TYPE framework_code AS ENUM (
  'sixq'
);

CREATE TYPE sixq_slot AS ENUM (
  'q1', 'q2', 'q3', 'q4', 'q5', 'q6'
);

-- AI & Processing Enums
CREATE TYPE ai_provider AS ENUM (
  'openai', 'anthropic', 'openrouter'
);

CREATE TYPE ai_run_status AS ENUM (
  'success', 'error', 'rate_limited', 'canceled'
);

CREATE TYPE ai_message_role_enum AS ENUM (
  'system', 'user', 'assistant', 'tool', 'function'
);

-- Deliverable & Export Enums
CREATE TYPE deliverable_type AS ENUM (
  'brand_blueprint', 'value_props', 'personas', 'journey_map', 'sitemap', 
  'wireframes', 'ui', 'wp_blocks', 'pdf', 'csv', 'json'
);

CREATE TYPE deliverable_status AS ENUM (
  'draft', 'in_review', 'approved', 'published'
);

CREATE TYPE approval_decision AS ENUM (
  'approved', 'changes_requested', 'rejected'
);

CREATE TYPE export_format_enum AS ENUM (
  'pdf', 'html', 'docx', 'md', 'json', 'csv'
);

CREATE TYPE job_status_enum AS ENUM (
  'queued', 'processing', 'succeeded', 'failed', 'canceled'
);

-- Business Enums
CREATE TYPE business_status_enum AS ENUM (
  'pending', 'onboarding', 'active', 'inactive', 'suspended'
);

CREATE TYPE company_size_enum AS ENUM (
  'startup', 'small', 'medium', 'large', 'enterprise'
);

CREATE TYPE budget_range_enum AS ENUM (
  'under_10k', '10k_25k', '25k_50k', '50k_100k', '100k_250k', '250k_500k', '500k_plus'
);

CREATE TYPE timeline_urgency_enum AS ENUM (
  'immediate', '1_month', '3_months', '6_months', '1_year', 'no_rush'
);

CREATE TYPE business_model_enum AS ENUM (
  'b2b', 'b2c', 'b2b2c', 'marketplace', 'saas', 'd2c', 'nonprofit', 'government', 'other'
);

-- Billing Enums
CREATE TYPE plan_code AS ENUM (
  'free', 'pro', 'agency', 'enterprise'
);

CREATE TYPE subscription_status AS ENUM (
  'trialing', 'active', 'past_due', 'canceled', 'unpaid'
);

CREATE TYPE notification_channel AS ENUM (
  'in_app', 'email'
);

-- Project Status (missing from current)
CREATE TYPE project_status_enum AS ENUM (
  'active', 'planning', 'in_progress', 'on_hold', 'completed', 'cancelled', 'archived'
);

-- =========================
-- 2. ADD MISSING ONBOARDING FIELDS AND ENUM COLUMNS TO EXISTING TABLES
-- =========================

-- Add missing onboarding tracking fields to businesses (if not exist)
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS onboarding_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS onboarding_current_step INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS onboarding_data JSONB DEFAULT '{}';

-- BUSINESSES TABLE - Add ENUM columns
ALTER TABLE businesses 
ADD COLUMN status_enum business_status_enum DEFAULT 'pending',
ADD COLUMN type_enum business_model_enum;

-- ORGANIZATIONS TABLE  
ALTER TABLE organizations
ADD COLUMN status_enum business_status_enum DEFAULT 'active',
ADD COLUMN company_size_enum company_size_enum,
ADD COLUMN type_enum business_model_enum;

-- PROJECTS TABLE
ALTER TABLE projects
ADD COLUMN status_enum project_status_enum DEFAULT 'active',
ADD COLUMN strategy_mode_enum strategy_mode_enum DEFAULT 'custom';

-- BUSINESS_PROFILES TABLE (if exists)
-- ALTER TABLE business_profiles
-- ADD COLUMN business_model_structured business_model_enum,
-- ADD COLUMN timeline_urgency_structured timeline_urgency_enum,
-- ADD COLUMN budget_range_structured budget_range_enum,
-- ADD COLUMN company_size_structured company_size_enum;

-- MODULES TABLE (if exists)
-- ALTER TABLE modules
-- ADD COLUMN status_enum module_status DEFAULT 'not_started';

-- PROJECT_MODULES TABLE (if exists) 
-- ALTER TABLE project_modules
-- ADD COLUMN status_enum module_status DEFAULT 'not_started',
-- ADD COLUMN visibility_enum module_visibility DEFAULT 'client',
-- ADD COLUMN source_enum module_source_enum DEFAULT 'manual';

-- QUESTIONS TABLE (if exists)
-- ALTER TABLE questions  
-- ADD COLUMN type_enum question_type,
-- ADD COLUMN status_enum answer_status DEFAULT 'draft';

-- ANSWERS TABLE (if exists)
-- ALTER TABLE answers
-- ADD COLUMN status_enum answer_status DEFAULT 'draft',
-- ADD COLUMN confidence_enum confidence DEFAULT 'medium',
-- ADD COLUMN source_enum source_enum DEFAULT 'user';

-- =========================
-- 3. MIGRATE EXISTING DATA
-- =========================

-- Migrate businesses status (based on actual schema - only onboarding_completed exists)
UPDATE businesses 
SET status_enum = CASE 
  WHEN onboarding_completed = true THEN 'active'::business_status_enum
  ELSE 'pending'::business_status_enum
END;

-- Migrate business type from text to enum (best effort)
UPDATE businesses 
SET type_enum = CASE 
  WHEN type ILIKE '%b2b%' THEN 'b2b'::business_model_enum
  WHEN type ILIKE '%b2c%' THEN 'b2c'::business_model_enum
  WHEN type ILIKE '%saas%' THEN 'saas'::business_model_enum
  WHEN type ILIKE '%marketplace%' THEN 'marketplace'::business_model_enum
  WHEN type ILIKE '%nonprofit%' THEN 'nonprofit'::business_model_enum
  ELSE 'other'::business_model_enum
END
WHERE type IS NOT NULL;

-- Migrate organizations
UPDATE organizations 
SET status_enum = CASE 
  WHEN status = 'active' THEN 'active'::business_status_enum
  ELSE 'active'::business_status_enum
END;

-- Migrate organization company size
UPDATE organizations
SET company_size_enum = CASE
  WHEN company_size = 'startup' THEN 'startup'::company_size_enum
  WHEN company_size = 'small' THEN 'small'::company_size_enum
  WHEN company_size = 'medium' THEN 'medium'::company_size_enum
  WHEN company_size = 'large' THEN 'large'::company_size_enum
  WHEN company_size = 'enterprise' THEN 'enterprise'::company_size_enum
  ELSE 'small'::company_size_enum
END
WHERE company_size IS NOT NULL;

-- Migrate projects
UPDATE projects 
SET status_enum = CASE 
  WHEN status = 'active' THEN 'active'::project_status_enum
  WHEN status = 'archived' THEN 'archived'::project_status_enum
  ELSE 'active'::project_status_enum
END;

UPDATE projects
SET strategy_mode_enum = CASE
  WHEN strategy_mode = 'custom' THEN 'custom'::strategy_mode_enum
  WHEN strategy_mode = 'predefined' THEN 'predefined'::strategy_mode_enum
  WHEN strategy_mode = 'hybrid' THEN 'hybrid'::strategy_mode_enum
  ELSE 'custom'::strategy_mode_enum
END
WHERE strategy_mode IS NOT NULL;

-- =========================
-- 4. REPLACE OLD TEXT COLUMNS WITH ENUMS (CAREFUL!)
-- =========================

-- After verifying data migration, drop old columns and rename
-- ONLY run this after confirming the enum columns have correct data!

-- For businesses:
-- ALTER TABLE businesses DROP COLUMN status CASCADE;
-- ALTER TABLE businesses RENAME COLUMN status_enum TO status;

-- ALTER TABLE businesses DROP COLUMN type CASCADE;  
-- ALTER TABLE businesses RENAME COLUMN type_enum TO type;

-- For organizations:
-- ALTER TABLE organizations DROP COLUMN status CASCADE;
-- ALTER TABLE organizations RENAME COLUMN status_enum TO status;

-- ALTER TABLE organizations DROP COLUMN company_size CASCADE;
-- ALTER TABLE organizations RENAME COLUMN company_size_enum TO company_size;

-- For projects:
-- ALTER TABLE projects DROP COLUMN status CASCADE;
-- ALTER TABLE projects RENAME COLUMN status_enum TO status;

-- ALTER TABLE projects DROP COLUMN strategy_mode CASCADE;
-- ALTER TABLE projects RENAME COLUMN strategy_mode_enum TO strategy_mode;

-- =========================
-- 5. CREATE INDEXES FOR PERFORMANCE
-- =========================

CREATE INDEX IF NOT EXISTS idx_businesses_status_enum ON businesses(status_enum);
CREATE INDEX IF NOT EXISTS idx_businesses_type_enum ON businesses(type_enum);
CREATE INDEX IF NOT EXISTS idx_organizations_status_enum ON organizations(status_enum);
CREATE INDEX IF NOT EXISTS idx_organizations_company_size ON organizations(company_size_enum);
CREATE INDEX IF NOT EXISTS idx_projects_status_enum ON projects(status_enum);
CREATE INDEX IF NOT EXISTS idx_projects_strategy_mode ON projects(strategy_mode_enum);

-- =========================
-- 6. UPDATE CONSTRAINTS & POLICIES
-- =========================

-- Add check constraints to ensure enum consistency
ALTER TABLE businesses 
ADD CONSTRAINT businesses_status_enum_check 
CHECK (status_enum IN ('pending', 'onboarding', 'active', 'inactive', 'suspended'));

ALTER TABLE projects
ADD CONSTRAINT projects_status_enum_check
CHECK (status_enum IN ('active', 'planning', 'in_progress', 'on_hold', 'completed', 'cancelled', 'archived'));

-- =========================
-- 7. VERIFY THE MIGRATION
-- =========================

-- Check businesses
SELECT name, status_enum, type_enum, onboarding_completed, created_at 
FROM businesses 
ORDER BY created_at DESC 
LIMIT 10;

-- Check organizations
SELECT name, status_enum, company_size_enum, industry 
FROM organizations 
LIMIT 5;

-- Check projects  
SELECT name, status_enum, strategy_mode_enum, created_at
FROM projects
ORDER BY created_at DESC
LIMIT 10;

-- Check all enum types exist
SELECT typname 
FROM pg_type 
WHERE typtype = 'e' 
ORDER BY typname;