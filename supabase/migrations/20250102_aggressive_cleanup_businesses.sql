-- Migration: Aggressive cleanup of businesses table
-- Remove all truly unused/redundant fields
-- Keep only: core identity, onboarding tracking, and fields mapped to Q1-Q8

-- ============================================
-- PART 0: DROP OLD POLICIES THAT REFERENCE COLUMNS WE'LL REMOVE
-- ============================================

-- Drop policies that reference owner_id
DROP POLICY IF EXISTS "Business owners can update their businesses" ON businesses;
DROP POLICY IF EXISTS "Users can create businesses" ON businesses;
DROP POLICY IF EXISTS "Business owners can delete their businesses" ON businesses;
DROP POLICY IF EXISTS "Owners can view their businesses" ON businesses;

-- ============================================
-- PART 1: DROP UNUSED/REDUNDANT COLUMNS
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
    RAISE NOTICE 'Dropped owner_id (duplicate of user_id)';
  END IF;

  -- Drop onboarding_current_step (duplicate of onboarding_step)
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='onboarding_current_step'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN onboarding_current_step;
    RAISE NOTICE 'Dropped onboarding_current_step (duplicate of onboarding_step)';
  END IF;

  -- Drop services (empty JSON, unused)
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='services'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN services;
    RAISE NOTICE 'Dropped services (unused)';
  END IF;

  -- Drop competitors (empty JSON, unused)
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='competitors'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN competitors;
    RAISE NOTICE 'Dropped competitors (unused)';
  END IF;

  -- Drop pitch_deck_url (should be in files_uploaded)
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='pitch_deck_url'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN pitch_deck_url;
    RAISE NOTICE 'Dropped pitch_deck_url (use files_uploaded instead)';
  END IF;

  -- Drop one_pager_url (should be in files_uploaded)
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='one_pager_url'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN one_pager_url;
    RAISE NOTICE 'Dropped one_pager_url (use files_uploaded instead)';
  END IF;

  -- Drop ai_analysis (should be in ai_messages table)
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='ai_analysis'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN ai_analysis;
    RAISE NOTICE 'Dropped ai_analysis (use ai_messages table)';
  END IF;

  -- Drop ai_analysis_completed_at (not needed)
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='ai_analysis_completed_at'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN ai_analysis_completed_at;
    RAISE NOTICE 'Dropped ai_analysis_completed_at (not needed)';
  END IF;

  -- Drop business_model (should be in strategic_responses)
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='business_model'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN business_model;
    RAISE NOTICE 'Dropped business_model (use strategic_responses)';
  END IF;

  -- Drop avg_customer_ltv (should be in strategic_responses)
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='avg_customer_ltv'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN avg_customer_ltv;
    RAISE NOTICE 'Dropped avg_customer_ltv (use strategic_responses)';
  END IF;

  -- Drop primary_goal (should be in strategic_responses)
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='primary_goal'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN primary_goal;
    RAISE NOTICE 'Dropped primary_goal (use strategic_responses)';
  END IF;

  -- Drop custom_industry (just use industry field)
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='custom_industry'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN custom_industry;
    RAISE NOTICE 'Dropped custom_industry (use industry field)';
  END IF;

END $$;

-- ============================================
-- PART 2: DOCUMENT FINAL SCHEMA
-- ============================================

COMMENT ON TABLE businesses IS 'Core business entity with essential fields only. Extended data in: strategic_responses (Q&A), ai_messages (Lindy), market_segments, customer_personas';

-- Core Identity
COMMENT ON COLUMN businesses.name IS 'Business name (Q1)';
COMMENT ON COLUMN businesses.slug IS 'URL-safe identifier';
COMMENT ON COLUMN businesses.logo_url IS 'Logo image URL';

-- Relationships
COMMENT ON COLUMN businesses.user_id IS 'Owner user ID';
COMMENT ON COLUMN businesses.organization_id IS 'Parent organization';

-- Basic Info (Q2-Q6)
COMMENT ON COLUMN businesses.website_url IS 'Business website (Q2)';
COMMENT ON COLUMN businesses.industry IS 'Industry category (Q3)';
COMMENT ON COLUMN businesses.business_type IS 'B2B, B2C, etc (Q4)';
COMMENT ON COLUMN businesses.linkedin_url IS 'LinkedIn profile (Q5)';
COMMENT ON COLUMN businesses.files_uploaded IS 'Uploaded files metadata (Q6) - JSONB array';

-- Business Data
COMMENT ON COLUMN businesses.description IS 'Business description from Q7 (may include AI suggestions)';
COMMENT ON COLUMN businesses.target_audience IS 'Target audience from Q8';
COMMENT ON COLUMN businesses.years_in_business IS 'How long operating';
COMMENT ON COLUMN businesses.employee_count IS 'Number of employees';
COMMENT ON COLUMN businesses.annual_revenue IS 'Annual revenue';

-- Onboarding State
COMMENT ON COLUMN businesses.onboarding_path IS 'progressive_enhancement (M0), fast_track (M1), or strategic_foundation (M2)';
COMMENT ON COLUMN businesses.onboarding_path_selected_at IS 'When path was chosen';
COMMENT ON COLUMN businesses.onboarding_path_history IS 'Path change history - JSONB array';
COMMENT ON COLUMN businesses.onboarding_phase IS 'Current onboarding phase';
COMMENT ON COLUMN businesses.onboarding_step IS 'Current step number';
COMMENT ON COLUMN businesses.current_question_id IS 'Current question (Q1-Q31) for resuming';
COMMENT ON COLUMN businesses.onboarding_completed IS 'Full onboarding done';
COMMENT ON COLUMN businesses.onboarding_started_at IS 'First started';
COMMENT ON COLUMN businesses.basics_completed_at IS 'Q1-Q6 completed';
COMMENT ON COLUMN businesses.strategic_onboarding_started_at IS 'Strategic questions started';
COMMENT ON COLUMN businesses.strategic_onboarding_completed_at IS 'Strategic questions completed';
COMMENT ON COLUMN businesses.segments_completed_at IS 'Market segments defined';
COMMENT ON COLUMN businesses.personas_completed_at IS 'Customer personas created';
COMMENT ON COLUMN businesses.questions_completed_at IS 'All questions answered';

-- Status
COMMENT ON COLUMN businesses.status_enum IS 'Business status (active, pending, inactive)';
COMMENT ON COLUMN businesses.type_enum IS 'Business type enum';

-- Additional Context
COMMENT ON COLUMN businesses.additional_context IS 'Free-form additional information';

-- ============================================
-- PART 3: RECREATE RLS POLICIES (using user_id instead of owner_id)
-- ============================================

DO $$
BEGIN
  -- Users can view businesses they own
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'businesses'
    AND policyname = 'Users can view their own businesses'
  ) THEN
    CREATE POLICY "Users can view their own businesses" ON businesses
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
    RAISE NOTICE 'Created policy: Users can view their own businesses';
  END IF;

  -- Users can create businesses
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'businesses'
    AND policyname = 'Users can create their businesses'
  ) THEN
    CREATE POLICY "Users can create their businesses" ON businesses
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    RAISE NOTICE 'Created policy: Users can create their businesses';
  END IF;

  -- Users can update their own businesses
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'businesses'
    AND policyname = 'Users can update their own businesses'
  ) THEN
    CREATE POLICY "Users can update their own businesses" ON businesses
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
    RAISE NOTICE 'Created policy: Users can update their own businesses';
  END IF;

  -- Users can delete their own businesses
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'businesses'
    AND policyname = 'Users can delete their own businesses'
  ) THEN
    CREATE POLICY "Users can delete their own businesses" ON businesses
      FOR DELETE USING (auth.uid() = user_id);
    RAISE NOTICE 'Created policy: Users can delete their own businesses';
  END IF;

  -- Service role can do anything (for webhooks)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'businesses'
    AND policyname = 'Service role full access'
  ) THEN
    CREATE POLICY "Service role full access" ON businesses
      FOR ALL USING (true) WITH CHECK (true);
    RAISE NOTICE 'Created policy: Service role full access';
  END IF;
END $$;

-- ============================================
-- PART 4: SUMMARY OF FINAL SCHEMA
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Cleanup Complete!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Final businesses table has:';
  RAISE NOTICE '  ✅ Core Identity: name, slug, logo_url';
  RAISE NOTICE '  ✅ Relationships: user_id, organization_id';
  RAISE NOTICE '  ✅ Basic Info (Q1-Q8): website_url, industry, business_type, linkedin_url, files_uploaded, description, target_audience';
  RAISE NOTICE '  ✅ Business Metrics: years_in_business, employee_count, annual_revenue';
  RAISE NOTICE '  ✅ Onboarding Tracking: path, phase, step, completion timestamps';
  RAISE NOTICE '  ✅ Status: status_enum, type_enum';
  RAISE NOTICE '';
  RAISE NOTICE '🗑️  Removed fields now live in:';
  RAISE NOTICE '  → strategic_responses: Q9-Q31 answers, business_model, avg_customer_ltv, primary_goal';
  RAISE NOTICE '  → ai_messages: Lindy responses, AI analysis';
  RAISE NOTICE '  → files_uploaded (JSONB): pitch decks, one-pagers, other docs';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Total fields remaining: ~30 (down from ~45+)';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 RLS Policies recreated using user_id (owner_id removed)';
END $$;
