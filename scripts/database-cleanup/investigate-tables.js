require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const serviceClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function investigateTables() {
  console.log('🔍 Investigating Tables and Schema');
  console.log('=================================\n');

  // 1. Check if organizations is a view or alias
  try {
    console.log('1. Getting table information...');
    const { data, error } = await serviceClient
      .from('information_schema.tables')
      .select('table_name, table_type')
      .in('table_name', ['organizations', 'businesses'])
      .eq('table_schema', 'public');

    if (error) {
      console.log('❌ Error querying information_schema:', error.message);
    } else {
      console.log('📋 Table info:', data);
    }
  } catch (err) {
    console.log('❌ Error accessing information_schema:', err.message);
  }

  // 2. Check if organizations is a view
  try {
    console.log('\n2. Checking for views...');
    const { data, error } = await serviceClient
      .from('information_schema.views')
      .select('table_name, view_definition')
      .eq('table_name', 'organizations')
      .eq('table_schema', 'public');

    if (error) {
      console.log('❌ Error querying views:', error.message);
    } else {
      console.log('📋 Views found:', data);
    }
  } catch (err) {
    console.log('❌ Error accessing views:', err.message);
  }

  // 3. Compare table schemas
  try {
    console.log('\n3. Comparing table schemas...');

    // Get columns for both tables
    const { data: orgColumns, error: orgError } = await serviceClient
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'organizations')
      .eq('table_schema', 'public');

    const { data: bizColumns, error: bizError } = await serviceClient
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'businesses')
      .eq('table_schema', 'public');

    if (orgError) {
      console.log('❌ Error getting organizations columns:', orgError.message);
    } else {
      console.log('📋 Organizations columns:', orgColumns);
    }

    if (bizError) {
      console.log('❌ Error getting businesses columns:', bizError.message);
    } else {
      console.log('📋 Businesses columns:', bizColumns);
    }
  } catch (err) {
    console.log('❌ Error comparing schemas:', err.message);
  }

  // 4. Try to describe both tables directly
  try {
    console.log('\n4. Direct table access comparison...');

    // Get first row from each table to compare structure
    const { data: orgData, error: orgError } = await serviceClient
      .from('organizations')
      .select('*')
      .limit(1);

    const { data: bizData, error: bizError } = await serviceClient
      .from('businesses')
      .select('*')
      .limit(1);

    console.log('Organizations first row:', orgData);
    console.log('Businesses first row:', bizData);

    // Check if they're the same data
    if (orgData && bizData && orgData.length > 0 && bizData.length > 0) {
      console.log(
        'Are they the same data?',
        JSON.stringify(orgData[0]) === JSON.stringify(bizData[0])
      );
    }
  } catch (err) {
    console.log('❌ Error in direct comparison:', err.message);
  }

  // 5. Test the actual error scenario - creating an organization
  try {
    console.log('\n5. Testing organization creation...');

    const testOrg = {
      name: 'Test Organization',
      slug: `test-org-${Date.now()}`,
    };

    console.log('🔄 Creating organization...');
    const { data, error } = await serviceClient
      .from('organizations')
      .insert(testOrg)
      .select();

    if (error) {
      console.log('❌ Organization creation error:', error.message);
      console.log('📋 Full error:', error);
    } else {
      console.log('✅ Organization created:', data[0]);

      // Clean up
      await serviceClient.from('organizations').delete().eq('id', data[0].id);
      console.log('🧹 Test organization deleted');
    }
  } catch (err) {
    console.log('❌ Organization creation exception:', err.message);
  }
}

investigateTables().catch(console.error);
