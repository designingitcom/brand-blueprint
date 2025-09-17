-- Add onboarding fields to businesses table
-- Migration: Add onboarding status tracking to businesses

-- Add onboarding fields to businesses table
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS profile_completeness INTEGER DEFAULT 0;

-- Create index for efficient onboarding status queries
CREATE INDEX IF NOT EXISTS idx_businesses_onboarding_completed ON businesses(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_businesses_profile_completeness ON businesses(profile_completeness);

-- Update existing businesses to have a more realistic status (none are onboarded yet)
-- This ensures they show as "Needs Onboarding" rather than "Active • Available for projects"
UPDATE businesses
SET
  onboarding_completed = FALSE,
  profile_completeness = 0
WHERE onboarding_completed IS NULL;