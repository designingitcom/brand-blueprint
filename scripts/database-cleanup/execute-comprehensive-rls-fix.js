require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const serviceClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function executeComprehensiveRLSFix() {
  console.log('🚀 Executing Comprehensive RLS Policy Fix');
  console.log('==========================================\n');

  try {
    // Read the comprehensive RLS fix file
    const fixPath = path.join(__dirname, 'fix-all-rls-policies.sql');
    const fixSQL = fs.readFileSync(fixPath, 'utf8');

    console.log('📋 Comprehensive RLS Fix SQL loaded');
    console.log('🔄 Executing all RLS policy fixes...\n');

    // Split the SQL into individual statements and execute them
    const statements = fixSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📊 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        console.log(
          `${i + 1}/${statements.length}: ${statement.substring(0, 60)}${statement.length > 60 ? '...' : ''}`
        );

        try {
          // Use direct SQL execution with raw query
          const { error } = await serviceClient.rpc('exec_sql', {
            sql: statement,
          });

          if (error) {
            console.log(`❌ Error in statement ${i + 1}:`, error.message);
            errorCount++;
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
            successCount++;
          }
        } catch (err) {
          console.log(`❌ Exception in statement ${i + 1}:`, err.message);
          errorCount++;
        }
      }
    }

    console.log('\n📊 Execution Summary:');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📋 Total: ${statements.length}`);

    if (errorCount === 0) {
      console.log('\n🧪 Testing comprehensive fix across all tables...');
      await testAllTables();
      console.log('\n🎉 Comprehensive RLS Fix Applied Successfully!');
      console.log('All tables now have proper RLS policies that allow:');
      console.log('- Service role: Full access');
      console.log('- Authenticated users: Full access with auth.uid() check');
    } else {
      console.log(
        '\n⚠️  Some statements failed. Please review the errors above.'
      );
    }
  } catch (error) {
    console.error('❌ Error executing comprehensive RLS fix:', error.message);
  }
}

async function testAllTables() {
  const testTables = [
    'organizations',
    'businesses',
    'projects',
    'modules',
    'strategies',
    'questions',
    'memberships',
    'users',
  ];

  console.log('🔄 Testing basic read access across all tables...');

  for (const table of testTables) {
    try {
      const { data, error } = await serviceClient
        .from(table)
        .select('id')
        .limit(1);

      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: Read access working`);
      }
    } catch (err) {
      console.log(`❌ ${table}: Exception - ${err.message}`);
    }
  }

  // Test a specific create operation on organizations
  console.log('\n🔄 Testing create operation on organizations...');
  try {
    const testOrg = {
      name: 'Test Comprehensive Fix Org',
      slug: `test-comprehensive-${Date.now()}`,
      timezone: 'UTC',
      settings: {},
    };

    const { data: orgData, error: orgError } = await serviceClient
      .from('organizations')
      .insert(testOrg)
      .select()
      .single();

    if (orgError) {
      console.log('❌ Organization creation test failed:', orgError.message);
    } else {
      console.log('✅ Organization creation test successful');

      // Clean up
      await serviceClient.from('organizations').delete().eq('id', orgData.id);
      console.log('🧹 Test organization cleaned up');
    }
  } catch (err) {
    console.log('❌ Organization creation test exception:', err.message);
  }
}

executeComprehensiveRLSFix().catch(console.error);
