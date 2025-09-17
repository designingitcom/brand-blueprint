const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

async function initDatabase() {
  console.log('🚀 Initializing database tables...\n');

  try {
    // First, let's check what tables already exist
    const { data: existingTables, error: checkError } = await supabase
      .rpc('get_tables', {}, { get: true })
      .single();
    
    if (checkError) {
      console.log('📊 Checking existing tables...');
    }

    // Create the SQL statements to run
    const sqlStatements = [
      // Create enum types
      `DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'company_size_enum') THEN
              CREATE TYPE company_size_enum AS ENUM ('startup', 'small', 'medium', 'large', 'enterprise');
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role') THEN
              CREATE TYPE role AS ENUM ('owner', 'admin', 'strategist', 'client_owner', 'client_editor', 'viewer');
          END IF;
      END$$;`,

      // Create organizations table
      `CREATE TABLE IF NOT EXISTS organizations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          settings JSONB DEFAULT '{}',
          logo_url TEXT,
          website TEXT,
          industry TEXT,
          company_size company_size_enum,
          timezone TEXT DEFAULT 'UTC',
          onboarding_completed BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
      );`,

      // Create users table
      `CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT UNIQUE NOT NULL,
          name TEXT,
          avatar_url TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          last_login_at TIMESTAMPTZ
      );`,

      // Create memberships table
      `CREATE TABLE IF NOT EXISTS memberships (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          role role DEFAULT 'viewer',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(organization_id, user_id)
      );`,

      // Create invites table
      `CREATE TABLE IF NOT EXISTS invites (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
          email TEXT NOT NULL,
          role role DEFAULT 'viewer',
          token TEXT UNIQUE NOT NULL,
          expires_at TIMESTAMPTZ NOT NULL,
          accepted_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW()
      );`,

      // Create businesses table
      `CREATE TABLE IF NOT EXISTS businesses (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          slug TEXT NOT NULL,
          type TEXT,
          description TEXT,
          website TEXT,
          settings JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(organization_id, slug)
      );`,

      // Create projects table
      `CREATE TABLE IF NOT EXISTS projects (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          slug TEXT NOT NULL,
          description TEXT,
          status TEXT DEFAULT 'planning',
          start_date DATE,
          end_date DATE,
          budget DECIMAL(12,2),
          settings JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(business_id, slug)
      );`,

      // Create indexes
      `CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);`,
      `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`,
      `CREATE INDEX IF NOT EXISTS idx_memberships_organization_id ON memberships(organization_id);`,
      `CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);`,
      `CREATE INDEX IF NOT EXISTS idx_invites_organization_id ON invites(organization_id);`,
      `CREATE INDEX IF NOT EXISTS idx_invites_token ON invites(token);`,
      `CREATE INDEX IF NOT EXISTS idx_businesses_organization_id ON businesses(organization_id);`,
      `CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);`,
      `CREATE INDEX IF NOT EXISTS idx_projects_business_id ON projects(business_id);`,
      `CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);`,

      // Create update trigger function
      `CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';`,

      // Add triggers
      `DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;`,
      `CREATE TRIGGER update_organizations_updated_at 
          BEFORE UPDATE ON organizations 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,
      
      `DROP TRIGGER IF EXISTS update_businesses_updated_at ON businesses;`,
      `CREATE TRIGGER update_businesses_updated_at 
          BEFORE UPDATE ON businesses 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,
      
      `DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;`,
      `CREATE TRIGGER update_projects_updated_at 
          BEFORE UPDATE ON projects 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,
    ];

    // Execute each SQL statement
    for (let i = 0; i < sqlStatements.length; i++) {
      const sql = sqlStatements[i];
      console.log(`Executing statement ${i + 1}/${sqlStatements.length}...`);
      
      // For Supabase, we need to use the REST API directly for DDL statements
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          query: sql
        })
      }).catch(err => {
        // Some statements might not work via RPC, that's okay
        console.log(`Note: Statement ${i + 1} needs to be run manually`);
      });
    }

    console.log('\n✅ Database initialization attempt complete!');
    console.log('\n📝 IMPORTANT: Some statements may need to be run manually in Supabase SQL Editor.');
    console.log('   Copy the contents of scripts/create-organizations-table.sql and run it there.\n');

    // Test if tables were created
    console.log('🔍 Verifying tables...\n');
    
    const tables = ['organizations', 'users', 'memberships', 'businesses', 'projects'];
    
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (!error || error.code === 'PGRST116') {
        console.log(`✅ Table '${table}' exists`);
      } else {
        console.log(`❌ Table '${table}' not found or not accessible`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📋 Please run the following in Supabase SQL Editor:');
    console.log('   1. Go to: https://supabase.com/dashboard/project/xigzapsughpuqjxttsra/sql');
    console.log('   2. Copy contents from: scripts/create-organizations-table.sql');
    console.log('   3. Run the SQL in the editor\n');
  }
}

initDatabase();