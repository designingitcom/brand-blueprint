require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const serviceClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRLSPolicies() {
  console.log('🔒 Checking RLS Policies');
  console.log('=======================\n');

  // Query the policies for organizations table
  try {
    console.log('1. Organizations table RLS policies:');
    const { data, error } = await serviceClient.rpc('exec_sql', {
      sql: `
          SELECT 
            schemaname, 
            tablename, 
            policyname, 
            permissive, 
            roles, 
            cmd, 
            qual,
            with_check
          FROM pg_policies 
          WHERE tablename = 'organizations';
        `,
    });

    if (error) {
      console.log('❌ Error querying policies:', error.message);

      // Try alternative query
      const { data: altData, error: altError } = await serviceClient
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'organizations');

      if (altError) {
        console.log('❌ Alternative query also failed:', altError.message);
      } else {
        console.log(
          '📋 Policies (alt query):',
          JSON.stringify(altData, null, 2)
        );
      }
    } else {
      console.log('📋 Policies:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.log('❌ Exception querying policies:', err.message);
  }

  console.log('\n2. Checking if RLS is enabled:');
  try {
    const { data, error } = await serviceClient.rpc('exec_sql', {
      sql: `
          SELECT 
            schemaname,
            tablename, 
            rowsecurity 
          FROM pg_tables 
          WHERE tablename = 'organizations';
        `,
    });

    if (error) {
      console.log('❌ Error checking RLS status:', error.message);
    } else {
      console.log('📋 RLS Status:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.log('❌ Exception checking RLS:', err.message);
  }

  console.log('\n3. Testing different auth scenarios:');

  // Test without auth
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    console.log('🔄 Testing SELECT with anon client...');
    const { data: selectData, error: selectError } = await anonClient
      .from('organizations')
      .select('id, name')
      .limit(1);

    if (selectError) {
      console.log('❌ Anon SELECT error:', selectError.message);
    } else {
      console.log('✅ Anon SELECT works:', selectData);
    }
  } catch (err) {
    console.log('❌ Anon SELECT exception:', err.message);
  }

  try {
    console.log('🔄 Testing INSERT with anon client...');
    const { data: insertData, error: insertError } = await anonClient
      .from('organizations')
      .insert({
        name: 'Test Anon Org',
        slug: `test-anon-${Date.now()}`,
        timezone: 'UTC',
      })
      .select();

    if (insertError) {
      console.log('❌ Anon INSERT error:', insertError.message);
    } else {
      console.log('✅ Anon INSERT works:', insertData);
      // Clean up
      await serviceClient
        .from('organizations')
        .delete()
        .eq('id', insertData[0].id);
    }
  } catch (err) {
    console.log('❌ Anon INSERT exception:', err.message);
  }

  console.log('\n4. Checking memberships table structure:');
  try {
    const { data, error } = await serviceClient
      .from('memberships')
      .select('*')
      .limit(3);

    if (error) {
      console.log('❌ Memberships query error:', error.message);
    } else {
      console.log('📋 Sample memberships:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.log('❌ Memberships exception:', err.message);
  }
}

checkRLSPolicies().catch(console.error);
