-- Create businesses table to match application expectations
-- Run this SQL in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT,
  description TEXT,
  website TEXT,
  settings JSONB DEFAULT '{}',
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_businesses_organization_id ON businesses(organization_id);
CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);

-- Add updated_at trigger for businesses
DROP TRIGGER IF EXISTS update_businesses_updated_at ON businesses;
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security) on businesses table
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can access businesses in their organizations" ON businesses;

-- RLS policies for businesses
CREATE POLICY "Users can access businesses in their organizations" 
ON businesses FOR ALL 
USING (
  organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid()
  )
);

-- Test the table works
SELECT 'BUSINESSES TABLE CREATED SUCCESSFULLY!' as status;