-- SUPABASE SQL EDITOR: Implement ENUMs and Multi-Step Onboarding Tracking
-- Copy and paste this into Supabase SQL Editor and run it

-- =========================
-- 1. CREATE ENUM TYPES
-- =========================

-- Business Status ENUM
CREATE TYPE business_status_enum AS ENUM (
  'pending',      -- Just created, M0 not started
  'onboarding',   -- M0 in progress (saved page 1+)
  'active',       -- M0 completed 
  'inactive',
  'suspended'
);

-- Project Status ENUM  
CREATE TYPE project_status_enum AS ENUM (
  'planning',
  'active',
  'in_progress',
  'on_hold',
  'completed',
  'cancelled',
  'archived'
);

-- Module Status ENUM (for M0-M21 tracking)
CREATE TYPE module_status_enum AS ENUM (
  'not_started',
  'in_progress', 
  'completed',
  'skipped',
  'blocked'
);

-- Organization Type ENUM
CREATE TYPE organization_type_enum AS ENUM (
  'startup',
  'small_business',
  'enterprise',
  'nonprofit',
  'agency',
  'freelancer',
  'other'
);

-- =========================
-- 2. ADD ONBOARDING TRACKING FIELDS
-- =========================

-- Add onboarding tracking to businesses
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS onboarding_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS onboarding_current_step INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS onboarding_data JSONB DEFAULT '{}';

-- =========================
-- 3. MIGRATE TO ENUM COLUMNS (CAREFUL!)
-- =========================

-- Add new ENUM columns alongside existing TEXT columns
ALTER TABLE businesses 
ADD COLUMN status_new business_status_enum DEFAULT 'pending';

ALTER TABLE organizations 
ADD COLUMN status_new business_status_enum DEFAULT 'active',
ADD COLUMN type_new organization_type_enum DEFAULT 'small_business';

-- If projects table exists:
-- ALTER TABLE projects ADD COLUMN status_new project_status_enum DEFAULT 'planning';

-- =========================
-- 4. MIGRATE DATA FROM TEXT TO ENUM
-- =========================

-- Update businesses: all current ones should be 'pending' since onboarding_completed = false
UPDATE businesses 
SET status_new = CASE 
  WHEN onboarding_completed = true THEN 'active'::business_status_enum
  WHEN onboarding_started_at IS NOT NULL THEN 'onboarding'::business_status_enum
  ELSE 'pending'::business_status_enum
END;

-- Update organizations (keep current 'active' status)
UPDATE organizations 
SET status_new = CASE 
  WHEN status = 'active' THEN 'active'::business_status_enum
  ELSE 'active'::business_status_enum  -- Default to active for orgs
END;

-- =========================
-- 5. SWAP COLUMNS (AFTER VERIFYING DATA)
-- =========================

-- After verifying the new columns have correct data:
-- DROP the old columns and rename new ones

-- For businesses:
ALTER TABLE businesses DROP COLUMN status CASCADE;
ALTER TABLE businesses RENAME COLUMN status_new TO status;

-- For organizations:  
ALTER TABLE organizations DROP COLUMN status CASCADE;
ALTER TABLE organizations RENAME COLUMN status_new TO status;

-- =========================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- =========================

CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(status);
CREATE INDEX IF NOT EXISTS idx_businesses_onboarding_started ON businesses(onboarding_started_at);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status);

-- =========================
-- 7. UPDATE RLS POLICIES (if needed)
-- =========================

-- Update any RLS policies that reference the old TEXT status columns
-- Example:
-- DROP POLICY IF EXISTS "policy_name" ON businesses;
-- CREATE POLICY "policy_name" ON businesses FOR ALL USING (status = 'active');

-- =========================
-- 8. VERIFY THE MIGRATION
-- =========================

-- Check businesses
SELECT name, status, onboarding_completed, onboarding_started_at, created_at 
FROM businesses 
ORDER BY created_at DESC 
LIMIT 10;

-- Check organizations
SELECT name, status, industry 
FROM organizations 
LIMIT 5;

-- Check ENUM values
SELECT enumlabel 
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'business_status_enum'
ORDER BY e.enumsortorder;