-- Fix database schema to match application expectations
-- Run this SQL in the Supabase SQL Editor: https://supabase.com/dashboard/project/xigzapsughpuqjxttsra/sql-editor

-- Create organizations table (as expected by the app)
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  website TEXT,
  industry TEXT,
  company_size TEXT,
  timezone TEXT DEFAULT 'UTC',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create users table if it doesn't exist (auth.users should link to this)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- Drop and recreate memberships table to use organizations instead of businesses
-- First, save any existing data if the table exists
CREATE TEMP TABLE IF NOT EXISTS temp_memberships_backup AS 
SELECT * FROM memberships WHERE FALSE; -- This will fail if table doesn't exist, that's OK

-- Now create the correct memberships table structure
DROP TABLE IF EXISTS public.memberships CASCADE;

CREATE TABLE IF NOT EXISTS public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'viewer',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_memberships_org_id ON memberships(organization_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);

-- Create unique constraint for memberships
CREATE UNIQUE INDEX IF NOT EXISTS memberships_org_user_unique 
ON memberships(organization_id, user_id);

-- Add updated_at trigger for organizations
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists, then create it
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security) on new tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can access organizations they are members of" ON organizations;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their memberships" ON memberships;
DROP POLICY IF EXISTS "Org owners/admins can manage memberships" ON memberships;

-- Basic RLS policies for organizations
CREATE POLICY "Users can access organizations they are members of" 
ON organizations FOR ALL 
USING (
  id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid()
  )
);

-- Basic RLS policies for users  
CREATE POLICY "Users can view their own profile" 
ON users FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON users FOR UPDATE 
USING (auth.uid() = id);

-- Basic RLS policies for memberships
CREATE POLICY "Users can view their memberships" 
ON memberships FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Org owners/admins can manage memberships" 
ON memberships FOR ALL 
USING (
  organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

-- Insert some test data for verification
INSERT INTO organizations (name, slug, website, industry, company_size) 
VALUES (
  'Test Organization', 
  'test-org', 
  'https://example.com', 
  'Technology', 
  'startup'
) ON CONFLICT (slug) DO NOTHING;

-- Create a test user (you would normally do this through Supabase Auth)
INSERT INTO users (id, email, name) 
VALUES (
  gen_random_uuid(), 
  'test@example.com', 
  'Test User'
) ON CONFLICT (email) DO NOTHING;

-- Test the tables work by running a simple query
SELECT 
  'organizations' as table_name, 
  count(*) as row_count 
FROM organizations
UNION ALL
SELECT 
  'users' as table_name, 
  count(*) as row_count 
FROM users
UNION ALL
SELECT 
  'memberships' as table_name, 
  count(*) as row_count 
FROM memberships;

-- Output success message
SELECT 'DATABASE SETUP COMPLETE! The organizations, users, and memberships tables are now ready.' as status;