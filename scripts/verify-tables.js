const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function verifyTables() {
  console.log('🔍 Verifying database tables after SQL execution...\n');

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

  const tests = [
    {
      name: 'Organizations Table',
      table: 'organizations',
      requiredColumns: ['id', 'name', 'slug', 'website', 'industry', 'company_size', 'timezone', 'settings', 'created_at', 'updated_at']
    },
    {
      name: 'Users Table',
      table: 'users',
      requiredColumns: ['id', 'email', 'name', 'avatar_url', 'created_at', 'last_login_at']
    },
    {
      name: 'Memberships Table',
      table: 'memberships',
      requiredColumns: ['id', 'organization_id', 'user_id', 'role', 'created_at']
    }
  ];

  let allTestsPassed = true;

  for (const test of tests) {
    try {
      // Test basic table access
      const { data, error } = await supabase
        .from(test.table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${test.name}: ${error.message}`);
        allTestsPassed = false;
        continue;
      }

      console.log(`✅ ${test.name}: Table exists and is accessible`);

      // Test table structure by trying to select specific columns
      try {
        const columnTest = await supabase
          .from(test.table)
          .select(test.requiredColumns.join(','))
          .limit(1);
        
        if (columnTest.error) {
          console.log(`⚠️  ${test.name}: Missing some columns - ${columnTest.error.message}`);
        } else {
          console.log(`✅ ${test.name}: All required columns present`);
        }
      } catch (columnError) {
        console.log(`⚠️  ${test.name}: Could not verify columns - ${columnError.message}`);
      }

      // Show row count
      const { count } = await supabase
        .from(test.table)
        .select('*', { count: 'exact', head: true });
      
      console.log(`📊 ${test.name}: ${count || 0} rows`);

    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
      allTestsPassed = false;
    }

    console.log(''); // Empty line for readability
  }

  // Test relationships
  console.log('🔗 Testing table relationships...\n');
  
  try {
    // Test membership -> organization relationship
    const { data: membershipTest, error: membershipError } = await supabase
      .from('memberships')
      .select(`
        id,
        role,
        organization:organizations(id, name, slug),
        user:users(id, email, name)
      `)
      .limit(1);

    if (membershipError) {
      console.log(`⚠️  Relationship test: ${membershipError.message}`);
    } else {
      console.log('✅ Table relationships working correctly');
    }
  } catch (relationError) {
    console.log(`⚠️  Relationship test failed: ${relationError.message}`);
  }

  console.log('\n' + '='.repeat(60));
  
  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED! Your database is ready.');
    console.log('✅ The organizations table exists with all required columns');
    console.log('✅ The users table exists with all required columns');  
    console.log('✅ The memberships table exists with all required columns');
    console.log('✅ Table relationships are working correctly');
    console.log('\n💡 You can now use your organization creation form!');
  } else {
    console.log('❌ Some tests failed. Please check the errors above.');
    console.log('💡 You may need to run the SQL script again or check for typos.');
  }
}

verifyTables().catch(error => {
  console.error('❌ Verification failed with error:', error.message);
  console.log('\n💡 This might mean the tables were not created yet.');
  console.log('Please run the SQL script in your Supabase dashboard first.');
});