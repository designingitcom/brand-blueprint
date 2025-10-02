-- Add timestamp column to track when onboarding was completed
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

COMMENT ON COLUMN businesses.onboarding_completed_at IS 'Timestamp when onboarding was marked as completed';
