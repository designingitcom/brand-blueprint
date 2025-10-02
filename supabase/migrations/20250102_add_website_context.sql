-- Add website_context field to businesses table
-- This stores the accuracy chips selected for the website URL in Q2

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS website_context TEXT;

COMMENT ON COLUMN businesses.website_context IS 'Website accuracy context from Q2 chips (comma-separated)';
