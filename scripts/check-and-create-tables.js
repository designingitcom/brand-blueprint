const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function checkAndCreateTables() {
  console.log('Checking existing tables and creating missing ones...');

  // Create service client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  // Test which tables exist by attempting to query them
  const tablesToCheck = [
    'organizations',
    'users', 
    'memberships',
    'businesses' // From the existing migration
  ];

  const existingTables = {};

  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      existingTables[table] = !error;
      if (!error) {
        console.log(`✅ Table '${table}' exists`);
      }
    } catch (error) {
      existingTables[table] = false;
    }
    
    if (!existingTables[table]) {
      console.log(`❌ Table '${table}' does not exist`);
    }
  }

  // Check which tables we need to create
  const missingTables = [];
  if (!existingTables.organizations) missingTables.push('organizations');
  if (!existingTables.users) missingTables.push('users');
  if (!existingTables.memberships) missingTables.push('memberships');

  if (missingTables.length === 0) {
    console.log('\n✅ All required tables exist!');
    return;
  }

  console.log(`\n⚠️  Missing tables: ${missingTables.join(', ')}`);
  
  // Since we can't execute raw SQL through the client, we need to do this via the Supabase dashboard
  // or through database functions. Let's provide instructions instead.
  
  console.log('\n📋 TO FIX THIS ISSUE:');
  console.log('You need to run the following SQL commands in your Supabase database.');
  console.log('Go to: https://supabase.com/dashboard/project/xigzapsughpuqjxttsra/sql-editor');
  console.log('\nRun this SQL code:\n');
  
  const sqlCommands = `
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

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- Create memberships table
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

CREATE TRIGGER IF NOT EXISTS update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security) on new tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for organizations
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'organizations' AND policyname = 'Users can access organizations they are members of') THEN
    CREATE POLICY "Users can access organizations they are members of" 
    ON organizations FOR ALL 
    USING (
      id IN (
        SELECT organization_id FROM memberships 
        WHERE user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- Basic RLS policies for users  
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can view their own profile') THEN
    CREATE POLICY "Users can view their own profile" 
    ON users FOR SELECT 
    USING (auth.uid() = id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can update their own profile') THEN
    CREATE POLICY "Users can update their own profile" 
    ON users FOR UPDATE 
    USING (auth.uid() = id);
  END IF;
END $$;

-- Basic RLS policies for memberships
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'memberships' AND policyname = 'Users can view their memberships') THEN
    CREATE POLICY "Users can view their memberships" 
    ON memberships FOR SELECT 
    USING (user_id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'memberships' AND policyname = 'Org owners/admins can manage memberships') THEN
    CREATE POLICY "Org owners/admins can manage memberships" 
    ON memberships FOR ALL 
    USING (
      organization_id IN (
        SELECT organization_id FROM memberships 
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    );
  END IF;
END $$;
`;

  console.log(sqlCommands);
  console.log('\n💡 After running this SQL, your application should work correctly!');

  // Also save this SQL to a file for easy copying
  const fs = require('fs');
  const path = require('path');
  const outputPath = path.join(__dirname, 'create_missing_tables.sql');
  fs.writeFileSync(outputPath, sqlCommands);
  console.log(`\n📄 SQL saved to: ${outputPath}`);
  console.log('You can copy this file content and paste it into the Supabase SQL editor.');

}

checkAndCreateTables().catch(console.error);