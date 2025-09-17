const { Client } = require('pg');

// Connection string from your .mcp.json
const connectionString = 'postgresql://postgres:baE53fb5GNkc*gM@db.xigzapsughpuqjxttsra.supabase.co:5432/postgres';

const client = new Client({
  connectionString: connectionString,
});

async function createBusinessesTable() {
  try {
    await client.connect();
    console.log('Connected to database...');

    const sql = `
      -- First ensure organizations table exists
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

      -- Create users table if not exists
      CREATE TABLE IF NOT EXISTS public.users (
        id UUID PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        avatar_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        last_login_at TIMESTAMPTZ
      );

      -- Create memberships table if not exists
      CREATE TABLE IF NOT EXISTS public.memberships (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role TEXT DEFAULT 'viewer',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Create businesses table
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
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS update_businesses_updated_at ON businesses;
      CREATE TRIGGER update_businesses_updated_at
        BEFORE UPDATE ON businesses
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

      -- Enable RLS (Row Level Security) on businesses table
      ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

      -- RLS policies for businesses
      DROP POLICY IF EXISTS "Users can access businesses in their organizations" ON businesses;
      CREATE POLICY "Users can access businesses in their organizations" 
      ON businesses FOR ALL 
      USING (
        organization_id IN (
          SELECT organization_id FROM memberships 
          WHERE user_id = auth.uid()
        )
      );
    `;

    await client.query(sql);
    console.log('✅ Businesses table created successfully!');
    console.log('You can now create businesses in your app!');
    
  } catch (error) {
    console.error('Error creating businesses table:', error.message);
  } finally {
    await client.end();
  }
}

createBusinessesTable();