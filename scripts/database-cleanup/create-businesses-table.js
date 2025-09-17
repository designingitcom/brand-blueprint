#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Your Supabase connection details from .mcp.json
const supabaseUrl = 'https://xigzapsughpuqjxttsra.supabase.co';
const serviceRoleKey = 'YOUR_SERVICE_ROLE_KEY_HERE'; // You need to replace this with your actual service role key

const supabase = createClient(supabaseUrl, serviceRoleKey);

const createBusinessesTable = async () => {
  console.log('Creating businesses table...');
  
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
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
    `
  });

  if (error) {
    console.error('Error creating businesses table:', error);
  } else {
    console.log('✅ Businesses table created successfully!');
    console.log('You can now create businesses in your app!');
  }
};

createBusinessesTable();