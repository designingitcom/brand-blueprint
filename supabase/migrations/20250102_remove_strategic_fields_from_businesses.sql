-- Migration: Remove strategic fields from businesses table
-- Keep businesses table purely for identity/operational data
-- All strategic insights live in strategic_responses table

-- This creates a clean separation:
-- - businesses = WHO you are (identity, operational)
-- - strategic_responses = WHAT you know (strategy, insights)

BEGIN;

-- Remove strategic fields that belong in strategic_responses
ALTER TABLE businesses
  DROP COLUMN IF EXISTS target_audience,
  DROP COLUMN IF EXISTS additional_context;

-- Add comment explaining the separation
COMMENT ON TABLE businesses IS
  'Business identity and operational data only. All strategic insights (ICP, personas, positioning, etc.) are stored in strategic_responses table.';

-- Document which fields remain
COMMENT ON COLUMN businesses.name IS 'Business name (Q1)';
COMMENT ON COLUMN businesses.website_url IS 'Website URL (Q2)';
COMMENT ON COLUMN businesses.website_context IS 'Website context from onboarding (e.g., "accurate", "no-website")';
COMMENT ON COLUMN businesses.industry IS 'Industry (Q3)';
COMMENT ON COLUMN businesses.linkedin_url IS 'LinkedIn company profile (Q4)';
COMMENT ON COLUMN businesses.business_type IS 'Business type - single value from Q5 (B2B, B2C, SaaS, etc.)';
COMMENT ON COLUMN businesses.files_uploaded IS 'Array of file URLs uploaded during onboarding (Q6)';
COMMENT ON COLUMN businesses.description IS 'Business description - elevator pitch (Q7)';

COMMENT ON COLUMN businesses.onboarding_path IS 'Selected onboarding path: progressive_enhancement, fast_track, or strategic_foundation';
COMMENT ON COLUMN businesses.onboarding_step IS 'Current step in onboarding wizard';
COMMENT ON COLUMN businesses.onboarding_completed IS 'Whether user completed onboarding';
COMMENT ON COLUMN businesses.current_question_id IS 'Resume point for incomplete onboarding (e.g., Q8, Q15)';

-- Verify strategic_responses exists and is ready
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'strategic_responses') THEN
    RAISE EXCEPTION 'strategic_responses table must exist before removing fields from businesses table';
  END IF;
END $$;

COMMIT;

-- ============================================
-- VERIFICATION QUERY (run after migration)
-- ============================================
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'businesses'
-- ORDER BY ordinal_position;
