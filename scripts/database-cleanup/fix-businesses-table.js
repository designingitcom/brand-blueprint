const { Client } = require('pg');

const connectionString = 'postgresql://postgres:baE53fb5GNkc*gM@db.xigzapsughpuqjxttsra.supabase.co:5432/postgres';

const client = new Client({
  connectionString: connectionString,
});

async function fixBusinessesTable() {
  try {
    await client.connect();
    console.log('Connected to database...');

    // Add the missing columns to businesses table
    const sql = `
      -- Add missing columns to businesses table
      ALTER TABLE businesses 
      ADD COLUMN IF NOT EXISTS description TEXT;
      
      ALTER TABLE businesses 
      ADD COLUMN IF NOT EXISTS website TEXT;
      
      ALTER TABLE businesses 
      ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
      
      ALTER TABLE businesses 
      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

      -- Make type nullable since app expects it optional
      ALTER TABLE businesses 
      ALTER COLUMN type DROP NOT NULL;

      -- Make slug nullable since app expects it optional  
      ALTER TABLE businesses 
      ALTER COLUMN slug DROP NOT NULL;

      -- Don't copy tenant_id to organization_id as they might not match
      -- The app will handle setting organization_id for new businesses
    `;

    await client.query(sql);
    console.log('✅ Businesses table fixed successfully!');
    console.log('Added columns: description, website, organization_id, user_id');
    console.log('Made type and slug nullable');
    console.log('You can now create businesses in your app!');
    
  } catch (error) {
    console.error('Error fixing businesses table:', error.message);
  } finally {
    await client.end();
  }
}

fixBusinessesTable();