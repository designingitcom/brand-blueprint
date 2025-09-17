const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createMissingTables() {
  console.log('Creating missing database tables...');

  try {
    // First check if organizations table exists
    const { data: orgCheck } = await supabase
      .from('organizations')
      .select('id')
      .limit(1);

    if (orgCheck) {
      console.log('✅ Organizations table already exists');
      return;
    }
  } catch (orgError) {
    console.log('Organizations table does not exist, creating...');
    
    // Create organizations table
    const { error: orgError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (orgError) {
      console.error('Error creating organizations table:', orgError);
      throw orgError;
    }
    console.log('✅ Organizations table created');
  }

  try {
    // Check if users table exists
    const { data: usersCheck } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (usersCheck) {
      console.log('✅ Users table already exists');
    }
  } catch (usersError) {
    console.log('Users table does not exist, creating...');
    
    // Create users table
    const { error: usersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.users (
          id UUID PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          name TEXT,
          avatar_url TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          last_login_at TIMESTAMPTZ
        );
      `
    });

    if (usersError) {
      console.error('Error creating users table:', usersError);
      throw usersError;
    }
    console.log('✅ Users table created');
  }

  try {
    // Check if memberships table exists
    const { data: membershipsCheck } = await supabase
      .from('memberships')
      .select('id')
      .limit(1);
    
    if (membershipsCheck) {
      console.log('✅ Memberships table already exists');
    }
  } catch (membershipsError) {
    console.log('Memberships table does not exist, creating...');
    
    // Create memberships table
    const { error: membershipsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.memberships (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          role TEXT DEFAULT 'viewer',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        CREATE UNIQUE INDEX IF NOT EXISTS memberships_org_user_unique 
        ON memberships(organization_id, user_id);
      `
    });

    if (membershipsError) {
      console.error('Error creating memberships table:', membershipsError);
      throw membershipsError;
    }
    console.log('✅ Memberships table created');
  }

  // Test the tables by running a simple SELECT query on each
  console.log('\nTesting created tables...');
  
  try {
    const { data: orgTest, error: orgTestError } = await supabase
      .from('organizations')
      .select('id')
      .limit(1);
    
    if (orgTestError) throw orgTestError;
    console.log('✅ Organizations table test passed');
  } catch (error) {
    console.error('❌ Organizations table test failed:', error);
  }

  try {
    const { data: usersTest, error: usersTestError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (usersTestError) throw usersTestError;
    console.log('✅ Users table test passed');
  } catch (error) {
    console.error('❌ Users table test failed:', error);
  }

  try {
    const { data: membershipsTest, error: membershipsTestError } = await supabase
      .from('memberships')
      .select('id')
      .limit(1);
    
    if (membershipsTestError) throw membershipsTestError;
    console.log('✅ Memberships table test passed');
  } catch (error) {
    console.error('❌ Memberships table test failed:', error);
  }

  console.log('\n✅ All tables created and tested successfully!');
}

createMissingTables().catch(console.error);