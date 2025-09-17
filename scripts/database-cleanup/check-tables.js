const { Client } = require('pg');

const connectionString = 'postgresql://postgres:baE53fb5GNkc*gM@db.xigzapsughpuqjxttsra.supabase.co:5432/postgres';

const client = new Client({
  connectionString: connectionString,
});

async function checkTables() {
  try {
    await client.connect();
    console.log('Connected to database...\n');

    // Check what tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('Existing tables:');
    tablesResult.rows.forEach(row => {
      console.log('  -', row.table_name);
    });

    // Check organizations table structure
    const orgColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'organizations' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    console.log('\nOrganizations table columns:');
    orgColumns.rows.forEach(row => {
      console.log('  -', row.column_name, ':', row.data_type);
    });

    // Check if businesses table exists
    const bizExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'businesses'
      );
    `);
    
    console.log('\nBusinesses table exists:', bizExists.rows[0].exists);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkTables();