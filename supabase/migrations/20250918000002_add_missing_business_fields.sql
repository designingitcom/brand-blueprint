-- Add missing business fields for form compatibility
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS business_model TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS avg_customer_ltv TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS primary_goal TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS basics_completed_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_businesses_business_model ON businesses(business_model);
CREATE INDEX IF NOT EXISTS idx_businesses_primary_goal ON businesses(primary_goal);