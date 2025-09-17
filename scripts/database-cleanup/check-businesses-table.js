const { Client } = require('pg');

const connectionString = 'postgresql://postgres:baE53fb5GNkc*gM@db.xigzapsughpuqjxttsra.supabase.co:5432/postgres';

const client = new Client({
  connectionString: connectionString,
});

async function checkBusinessesTable() {
  try {
    await client.connect();
    console.log('Connected to database...\n');

    // Check businesses table structure
    const bizColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'businesses' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    console.log('Businesses table columns:');
    bizColumns.rows.forEach(row => {
      console.log('  -', row.column_name, ':', row.data_type, row.is_nullable === 'NO' ? '(required)' : '');
    });

    // Check if description column exists
    const hasDescription = bizColumns.rows.some(row => row.column_name === 'description');
    const hasOrganizationId = bizColumns.rows.some(row => row.column_name === 'organization_id');
    
    console.log('\n✓ Has description column:', hasDescription);
    console.log('✓ Has organization_id column:', hasOrganizationId);

    // Check for any existing businesses
    const bizCount = await client.query('SELECT COUNT(*) FROM businesses');
    console.log('\nTotal businesses in table:', bizCount.rows[0].count);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkBusinessesTable();