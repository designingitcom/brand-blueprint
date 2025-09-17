const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function applyMigration() {
  console.log('Applying database migration...');

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

  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '002_create_organizations_tables.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Migration SQL loaded, executing...');

    // Split the SQL into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && stmt !== '');

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        // Use the raw SQL query method
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          // Try alternative approach if exec_sql doesn't exist
          const { error: altError } = await supabase
            .from('_supabase_migrations')
            .select('*')
            .limit(0); // This will fail but test connection
          
          if (altError && altError.message.includes('relation "_supabase_migrations" does not exist')) {
            // Direct query approach won't work, try postgres REST API
            console.log('Attempting direct connection...');
            const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
              method: 'POST',
              headers: {
                'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ sql: statement })
            });

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}, statement: ${statement.substring(0, 100)}...`);
            }
          } else {
            throw error;
          }
        }
        console.log(`✅ Statement ${i + 1} executed successfully`);
      } catch (stmtError) {
        // Skip statements that might already exist
        if (stmtError.message && (
          stmtError.message.includes('already exists') ||
          stmtError.message.includes('relation') && stmtError.message.includes('already exists')
        )) {
          console.log(`⚠️  Statement ${i + 1} skipped (already exists): ${stmtError.message}`);
        } else {
          console.error(`❌ Error in statement ${i + 1}:`, stmtError.message);
          console.error('Statement:', statement.substring(0, 200) + '...');
          throw stmtError;
        }
      }
    }

    // Test the tables by running simple queries
    console.log('\nTesting created tables...');
    
    const tests = [
      { table: 'organizations', test: 'Organizations table' },
      { table: 'users', test: 'Users table' },
      { table: 'memberships', test: 'Memberships table' }
    ];

    for (const { table, test } of tests) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) throw error;
        console.log(`✅ ${test} test passed`);
      } catch (testError) {
        console.error(`❌ ${test} test failed:`, testError.message);
        throw testError;
      }
    }

    console.log('\n🎉 Migration applied and tested successfully!');
    console.log('The organizations, users, and memberships tables are now available.');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

applyMigration();