-- Combined Migration: Clean up businesses table + Add Lindy integration
-- This migration is safe and idempotent

-- ============================================
-- PART 1: DROP OLD POLICIES THAT REFERENCE COLUMNS WE'LL REMOVE
-- ============================================

DROP POLICY IF EXISTS "Business owners can update their businesses" ON businesses;
DROP POLICY IF EXISTS "Users can create businesses" ON businesses;
DROP POLICY IF EXISTS "Business owners can delete their businesses" ON businesses;
DROP POLICY IF EXISTS "Owners can view their businesses" ON businesses;
DROP POLICY IF EXISTS "view_own_businesses_simple" ON businesses;
DROP POLICY IF EXISTS "Users can view their tenant businesses" ON businesses;
DROP POLICY IF EXISTS "Users can view businesses in their tenant" ON businesses;
DROP POLICY IF EXISTS "Users can view their organization businesses" ON businesses;
DROP POLICY IF EXISTS "Users can view their own businesses" ON businesses;
DROP POLICY IF EXISTS "Users can create their businesses" ON businesses;
DROP POLICY IF EXISTS "Users can update their businesses" ON businesses;
DROP POLICY IF EXISTS "Users can update their own businesses" ON businesses;
DROP POLICY IF EXISTS "Users can delete their own businesses" ON businesses;
DROP POLICY IF EXISTS "Service role can update businesses" ON businesses;
DROP POLICY IF EXISTS "Service role full access" ON businesses;

-- ============================================
-- PART 2: SAFELY REMOVE UNUSED COLUMNS
-- ============================================

DO $$
DECLARE
  col_exists BOOLEAN;
BEGIN
  -- Drop owner_id (duplicate of user_id)
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='owner_id'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN owner_id;
    RAISE NOTICE 'Dropped owner_id';
  END IF;

  -- Drop onboarding_current_step (duplicate of onboarding_step)
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='onboarding_current_step'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN onboarding_current_step;
    RAISE NOTICE 'Dropped onboarding_current_step';
  END IF;

  -- Drop services
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='services'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN services;
    RAISE NOTICE 'Dropped services';
  END IF;

  -- Drop competitors
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='competitors'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN competitors;
    RAISE NOTICE 'Dropped competitors';
  END IF;

  -- Drop pitch_deck_url
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='pitch_deck_url'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN pitch_deck_url;
    RAISE NOTICE 'Dropped pitch_deck_url';
  END IF;

  -- Drop one_pager_url
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='one_pager_url'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN one_pager_url;
    RAISE NOTICE 'Dropped one_pager_url';
  END IF;

  -- Drop ai_analysis
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='ai_analysis'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN ai_analysis;
    RAISE NOTICE 'Dropped ai_analysis';
  END IF;

  -- Drop ai_analysis_completed_at
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='ai_analysis_completed_at'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN ai_analysis_completed_at;
    RAISE NOTICE 'Dropped ai_analysis_completed_at';
  END IF;

  -- Drop business_model
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='business_model'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN business_model;
    RAISE NOTICE 'Dropped business_model';
  END IF;

  -- Drop avg_customer_ltv
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='avg_customer_ltv'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN avg_customer_ltv;
    RAISE NOTICE 'Dropped avg_customer_ltv';
  END IF;

  -- Drop primary_goal
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='primary_goal'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN primary_goal;
    RAISE NOTICE 'Dropped primary_goal';
  END IF;

  -- Drop custom_industry
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='custom_industry'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN custom_industry;
    RAISE NOTICE 'Dropped custom_industry';
  END IF;
END $$;

-- ============================================
-- PART 3: RECREATE SIMPLE RLS POLICIES
-- ============================================

-- Users can view their own businesses
CREATE POLICY "Users can view own businesses" ON businesses
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create businesses
CREATE POLICY "Users can create businesses" ON businesses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own businesses
CREATE POLICY "Users can update own businesses" ON businesses
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own businesses
CREATE POLICY "Users can delete own businesses" ON businesses
  FOR DELETE USING (auth.uid() = user_id);

-- Service role can do anything (for webhooks and admin operations)
CREATE POLICY "Service role full access" ON businesses
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- PART 4: CREATE LINDY RESPONSES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS lindy_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'lindy',
  content JSONB NOT NULL,
  suggestions JSONB,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lindy_responses_business_id ON lindy_responses(business_id);
CREATE INDEX IF NOT EXISTS idx_lindy_responses_question_id ON lindy_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_lindy_responses_idempotency_key ON lindy_responses(idempotency_key);

-- RLS for lindy_responses
ALTER TABLE lindy_responses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their Lindy responses" ON lindy_responses;
DROP POLICY IF EXISTS "Service role can manage Lindy responses" ON lindy_responses;
DROP POLICY IF EXISTS "Service role can insert Lindy responses" ON lindy_responses;
DROP POLICY IF EXISTS "Service role can update Lindy responses" ON lindy_responses;

-- Create policies
CREATE POLICY "Users can view their Lindy responses" ON lindy_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = lindy_responses.business_id
      AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage Lindy responses" ON lindy_responses
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- PART 5: ADD COMMENTS
-- ============================================

COMMENT ON TABLE businesses IS 'Core business entity (~30 fields). Related: strategic_responses (Q&A), lindy_responses (AI suggestions), market_segments, customer_personas';
COMMENT ON TABLE lindy_responses IS 'Stores Lindy AI webhook responses (Q7 suggestions, etc.)';

-- ============================================
-- PART 6: SUMMARY
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Migration Complete!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Changes:';
  RAISE NOTICE '  - Removed 12 unused columns from businesses table';
  RAISE NOTICE '  - Recreated simple RLS policies';
  RAISE NOTICE '  - Created lindy_responses table';
  RAISE NOTICE '  - Ready for Lindy webhook integration';
  RAISE NOTICE '';
END $$;
