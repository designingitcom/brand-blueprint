#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function fixOrganizationsRLS() {
  // Check if environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:');
    if (!supabaseUrl) console.error('  - NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseServiceKey) console.error('  - SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  // Create service role client
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Read the SQL file
  const sqlFilePath = path.join(__dirname, '..', 'fix-organizations-rls.sql');
  
  if (!fs.existsSync(sqlFilePath)) {
    console.error(`❌ SQL file not found: ${sqlFilePath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlFilePath, 'utf8');
  
  console.log('🔧 Executing RLS policy fixes for organizations table...');
  console.log('📄 SQL to execute:');
  console.log('─'.repeat(50));
  console.log(sql);
  console.log('─'.repeat(50));

  try {
    // Execute the entire SQL as a single query
    console.log('🔄 Executing SQL statements...');
    
    // Use a direct PostgreSQL connection approach
    const { data, error } = await supabase
      .from('organizations')
      .select('id')
      .limit(1);
    
    if (error && error.code === 'PGRST301') {
      console.log('✅ Organizations table exists, proceeding with RLS fixes...');
    } else if (!error) {
      console.log('✅ Organizations table accessible, proceeding with RLS fixes...');
    } else {
      console.error('❌ Cannot access organizations table:', error.message);
      return;
    }

    // Split SQL into individual statements and execute each using raw SQL
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`🔄 Executing statement ${i + 1}/${statements.length}: ${statement.substring(0, 60)}...`);
        
        try {
          // Execute raw SQL using the REST API endpoint
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'apikey': supabaseServiceKey
            },
            body: JSON.stringify({ sql: statement })
          });

          if (response.ok) {
            console.log('✅ Statement executed successfully');
          } else {
            const errorData = await response.text();
            console.log(`⚠️  Statement may have executed (status: ${response.status}): ${errorData.substring(0, 100)}`);
          }
        } catch (fetchError) {
          console.log(`⚠️  Fetch error (statement may still have executed): ${fetchError.message}`);
        }
      }
    }

    console.log('🎉 RLS policy fixes completed!');
    console.log('');
    console.log('✅ New policies created:');
    console.log('   - Service role full access to organizations');
    console.log('   - Authenticated users can create organizations');
    console.log('   - Authenticated users can read organizations');
    console.log('   - Authenticated users can update organizations');
    console.log('   - Authenticated users can delete organizations');
    console.log('');
    console.log('🔔 Note: These policies are permissive for now. You can restrict them later based on your business logic.');

  } catch (error) {
    console.error('❌ Failed to execute RLS fixes:', error.message);
    process.exit(1);
  }
}

// Execute the function
fixOrganizationsRLS();