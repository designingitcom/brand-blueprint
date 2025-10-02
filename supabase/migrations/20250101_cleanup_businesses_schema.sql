-- Migration: Clean up businesses table and align with onboarding wizard
-- SAFE cleanup: Only removes truly unused fields, keeps all relationships intact
-- Adds onboarding path tracking and history

-- ============================================
-- PART 0: DROP OLD POLICIES THAT REFERENCE COLUMNS WE'LL REMOVE
-- ============================================

-- Drop old policies that reference tenant_id or other columns we're removing
DROP POLICY IF EXISTS "view_own_businesses_simple" ON businesses;
DROP POLICY IF EXISTS "Users can view their tenant businesses" ON businesses;
DROP POLICY IF EXISTS "Users can view businesses in their tenant" ON businesses;

-- ============================================
-- PART 1: SAFELY REMOVE UNUSED COLUMNS
-- ============================================

-- Check what's actually being used before dropping
DO $$
DECLARE
  col_exists BOOLEAN;
BEGIN
  -- Only drop if column exists and is truly unused

  -- Drop old tenant_id (replaced by organization_id)
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='tenant_id'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN IF EXISTS tenant_id;
    RAISE NOTICE 'Dropped tenant_id column';
  END IF;

  -- Drop old settings JSONB (empty in all records)
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='settings'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN IF EXISTS settings;
    RAISE NOTICE 'Dropped settings column';
  END IF;

  -- Drop old onboarding_data JSONB (replaced by strategic_responses table)
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='onboarding_data'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN IF EXISTS onboarding_data;
    RAISE NOTICE 'Dropped onboarding_data column';
  END IF;

  -- Drop duplicate status column (keep status_enum)
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='status'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN IF EXISTS status;
    RAISE NOTICE 'Dropped duplicate status column (kept status_enum)';
  END IF;

  -- Drop duplicate type column (keep type_enum)
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='type'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN IF EXISTS type;
    RAISE NOTICE 'Dropped duplicate type column (kept type_enum)';
  END IF;

  -- Drop duplicate website column (keep website_url)
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='website'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN IF EXISTS website;
    RAISE NOTICE 'Dropped duplicate website column (kept website_url)';
  END IF;

END $$;

-- ============================================
-- PART 2: ADD MISSING ONBOARDING FIELDS
-- ============================================

ALTER TABLE businesses
  -- Core onboarding data
  ADD COLUMN IF NOT EXISTS files_uploaded JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS additional_context TEXT,

  -- Path tracking
  ADD COLUMN IF NOT EXISTS onboarding_path TEXT
    CHECK (onboarding_path IN ('progressive_enhancement', 'fast_track', 'strategic_foundation')),
  ADD COLUMN IF NOT EXISTS onboarding_path_selected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS onboarding_path_history JSONB DEFAULT '[]'::jsonb,

  -- Progress tracking
  ADD COLUMN IF NOT EXISTS current_question_id TEXT,

  -- Business description (from Q7)
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS target_audience TEXT;

-- ============================================
-- PART 3: UPDATE DEFAULTS AND CONSTRAINTS
-- ============================================

ALTER TABLE businesses
  ALTER COLUMN onboarding_phase SET DEFAULT 'business_setup',
  ALTER COLUMN onboarding_step SET DEFAULT 1,
  ALTER COLUMN status_enum SET DEFAULT 'pending',
  ALTER COLUMN onboarding_completed SET DEFAULT false;

-- ============================================
-- PART 4: ADD PERFORMANCE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_organization_id ON businesses(organization_id);
CREATE INDEX IF NOT EXISTS idx_businesses_onboarding_phase ON businesses(onboarding_phase);
CREATE INDEX IF NOT EXISTS idx_businesses_onboarding_path ON businesses(onboarding_path);
CREATE INDEX IF NOT EXISTS idx_businesses_status_enum ON businesses(status_enum);
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);

-- ============================================
-- PART 5: ADD HELPFUL COMMENTS
-- ============================================

COMMENT ON TABLE businesses IS 'Main business entity with onboarding tracking. Related tables: strategic_responses (Q&A), ai_messages (Lindy responses), market_segments, customer_personas';

COMMENT ON COLUMN businesses.files_uploaded IS 'JSONB array of uploaded file metadata from Q6';
COMMENT ON COLUMN businesses.onboarding_path IS 'Which onboarding flow: progressive_enhancement (M0), fast_track (M1), or strategic_foundation (M2)';
COMMENT ON COLUMN businesses.onboarding_path_history IS 'History of path changes: [{"path": "progressive_enhancement", "timestamp": "2025-01-01T12:00:00Z"}]';
COMMENT ON COLUMN businesses.current_question_id IS 'Current question ID (Q1-Q31) for resuming onboarding';
COMMENT ON COLUMN businesses.description IS 'Business description from Q7 (may include AI suggestions)';
COMMENT ON COLUMN businesses.target_audience IS 'Target audience from Q8';

-- ============================================
-- PART 6: RECREATE RLS POLICIES (using correct columns)
-- ============================================

-- Recreate view policy using organization_id instead of tenant_id
CREATE POLICY IF NOT EXISTS "Users can view their organization businesses" ON businesses
  FOR SELECT USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.business_id = businesses.id
      AND m.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM organizations o
      JOIN organization_memberships om ON om.organization_id = o.id
      WHERE o.id = businesses.organization_id
      AND om.user_id = auth.uid()
    )
  );

-- Users can insert businesses
CREATE POLICY IF NOT EXISTS "Users can create businesses" ON businesses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own businesses
CREATE POLICY IF NOT EXISTS "Users can update their businesses" ON businesses
  FOR UPDATE USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.business_id = businesses.id
      AND m.user_id = auth.uid()
      AND m.role IN ('owner', 'admin')
    )
  );

-- Service role can update for webhook responses
CREATE POLICY IF NOT EXISTS "Service role can update businesses" ON businesses
  FOR UPDATE USING (true) WITH CHECK (true);
