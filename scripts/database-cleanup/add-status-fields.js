const { Client } = require('pg');

const connectionString = 'postgresql://postgres:baE53fb5GNkc*gM@db.xigzapsughpuqjxttsra.supabase.co:5432/postgres';

const client = new Client({
  connectionString: connectionString,
});

async function addStatusFields() {
  try {
    await client.connect();
    console.log('Connected to database...');
    console.log('Adding status fields to organizations and businesses...\n');

    // Add status field to organizations
    console.log('1. Adding status field to organizations table...');
    await client.query(`
      -- Add status field to organizations
      ALTER TABLE organizations 
      ADD COLUMN IF NOT EXISTS status TEXT 
      DEFAULT 'active' 
      CHECK (status IN ('active', 'inactive', 'suspended', 'archived'));
      
      -- Update existing organizations to have active status
      UPDATE organizations 
      SET status = 'active' 
      WHERE status IS NULL;
    `);
    console.log('   ✅ Added status field to organizations (active, inactive, suspended, archived)');

    // Add status field to businesses
    console.log('2. Adding status field to businesses table...');
    await client.query(`
      -- Add status field to businesses (if not already exists from old schema)
      ALTER TABLE businesses 
      ADD COLUMN IF NOT EXISTS status TEXT 
      DEFAULT 'active' 
      CHECK (status IN ('active', 'inactive', 'suspended', 'archived'));
      
      -- Update existing businesses to have active status
      UPDATE businesses 
      SET status = 'active' 
      WHERE status IS NULL;
    `);
    console.log('   ✅ Added status field to businesses (active, inactive, suspended, archived)');

    // Verify the changes
    const orgColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'organizations' 
      AND column_name = 'status';
    `);

    const bizColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'businesses' 
      AND column_name = 'status';
    `);

    const orgCount = await client.query(`
      SELECT status, COUNT(*) 
      FROM organizations 
      GROUP BY status;
    `);

    const bizCount = await client.query(`
      SELECT status, COUNT(*) 
      FROM businesses 
      GROUP BY status;
    `);

    console.log('\n📊 Status field verification:');
    console.log('   Organizations status column exists:', orgColumns.rows.length > 0);
    console.log('   Businesses status column exists:', bizColumns.rows.length > 0);
    
    console.log('\n📈 Current status distribution:');
    console.log('   Organizations:');
    orgCount.rows.forEach(row => {
      console.log(`     - ${row.status}: ${row.count}`);
    });
    
    console.log('   Businesses:');
    bizCount.rows.forEach(row => {
      console.log(`     - ${row.status}: ${row.count}`);
    });

    console.log('\n✅ Status fields added successfully!');
    console.log('Available statuses: active, inactive, suspended, archived');
    
  } catch (error) {
    console.error('Error adding status fields:', error.message);
  } finally {
    await client.end();
  }
}

addStatusFields();