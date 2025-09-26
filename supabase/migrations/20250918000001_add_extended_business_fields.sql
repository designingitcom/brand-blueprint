-- Add extended business fields for comprehensive onboarding
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- Business details
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS business_type TEXT CHECK (business_type IN ('B2B', 'B2C', 'B2B2C', 'Marketplace', 'Non-profit'));
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS years_in_business TEXT CHECK (years_in_business IN ('<1', '1-3', '3-5', '5-10', '10+'));
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS employee_count TEXT CHECK (employee_count IN ('1-10', '11-50', '51-200', '200-1000', '1000+'));
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS annual_revenue TEXT CHECK (annual_revenue IN ('<$1M', '$1-10M', '$10-50M', '$50M+', 'Not disclosed'));

-- Business model and customer value
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS business_model TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS avg_customer_ltv TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS primary_goal TEXT;

-- Onboarding tracking
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS basics_completed_at TIMESTAMP WITH TIME ZONE;

-- Services/Products (JSON array)
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS services JSONB DEFAULT '[]'::jsonb;
-- Expected format: [{"name": "Service 1", "url": "https://..."}, ...]

-- Competitors (JSON array)
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS competitors JSONB DEFAULT '[]'::jsonb;
-- Expected format: ["competitor1.com", "competitor2.com", ...]

-- File uploads references
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS pitch_deck_url TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS one_pager_url TEXT;

-- AI analysis results (stored after processing)
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS ai_analysis JSONB;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS ai_analysis_completed_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_businesses_industry ON businesses(industry);
CREATE INDEX IF NOT EXISTS idx_businesses_business_type ON businesses(business_type);
CREATE INDEX IF NOT EXISTS idx_businesses_employee_count ON businesses(employee_count);

-- Create RLS policies for new fields (inherit existing policies)
-- The existing RLS policies should already cover these new columns