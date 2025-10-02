-- Fix business_type constraint to match form options
-- Drop old constraint and add new one with all valid values

ALTER TABLE businesses 
  DROP CONSTRAINT IF EXISTS businesses_business_type_check;

ALTER TABLE businesses
  ADD CONSTRAINT businesses_business_type_check 
  CHECK (business_type IN (
    'B2B',
    'B2C', 
    'B2B2C',
    'Marketplace',
    'Non-profit',
    'SaaS',
    'E-commerce',
    'Professional Services',
    'Agency',
    'Consulting',
    'Healthcare',
    'Education',
    'Manufacturing',
    'Retail',
    'Restaurant/Hospitality',
    'Real Estate',
    'Financial Services',
    'Technology/Software',
    'Other'
  ) OR business_type IS NULL);

COMMENT ON CONSTRAINT businesses_business_type_check ON businesses 
  IS 'Allows business types from onboarding form plus NULL for incomplete data';
