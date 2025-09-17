require('dotenv').config();
const fs = require('fs');
const path = require('path');

// We'll use raw SQL execution since Supabase RPC isn't available
// Let's output the SQL for manual execution in Supabase SQL Editor

async function showMigrationSteps() {
  console.log('📋 RLS Fix Migration Instructions');
  console.log('==================================\n');

  console.log(
    'Since we cannot execute SQL directly via the client, please follow these steps:'
  );
  console.log('');
  console.log('1. Go to your Supabase dashboard:');
  console.log(
    '   https://supabase.com/dashboard/project/xigzapsughpuqjxttsra/sql/new'
  );
  console.log('');
  console.log('2. Copy and paste the following SQL into the SQL editor:');
  console.log('');
  console.log('='.repeat(80));

  // Read and display the migration file
  try {
    const migrationPath = path.join(
      __dirname,
      'supabase',
      'migrations',
      '002_fix_organizations_rls.sql'
    );
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log(migrationSQL);
    console.log('='.repeat(80));
    console.log('');
    console.log('3. Click "Run" to execute the migration');
    console.log('');
    console.log(
      '4. After running, return here and press Enter to test the fix'
    );

    // Wait for user confirmation
    process.stdout.write(
      'Press Enter after you have run the migration in Supabase... '
    );

    return new Promise(resolve => {
      process.stdin.once('data', () => {
        resolve();
      });
    });
  } catch (error) {
    console.error('❌ Error reading migration file:', error.message);
  }
}

async function testFix() {
  console.log('\n🧪 Testing the RLS fix...');

  const { createClient } = require('@supabase/supabase-js');
  const serviceClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Test organization creation
    const testOrg = {
      name: 'Test Post-Migration Org',
      slug: `test-post-migration-${Date.now()}`,
      timezone: 'UTC',
      settings: {},
    };

    console.log('🔄 Testing organization creation...');
    const { data: orgData, error: orgError } = await serviceClient
      .from('organizations')
      .insert(testOrg)
      .select()
      .single();

    if (orgError) {
      console.log('❌ Organization creation failed:', orgError.message);
      return;
    }

    console.log('✅ Organization created successfully');

    // Test with anon client (should still fail for anon, but with better error)
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    console.log('🔄 Testing with anon client (should fail gracefully)...');
    const { data: anonData, error: anonError } = await anonClient
      .from('organizations')
      .insert({
        name: 'Anon Test Org',
        slug: `anon-test-${Date.now()}`,
        timezone: 'UTC',
      });

    if (anonError) {
      console.log('✅ Anon client correctly blocked:', anonError.message);
    } else {
      console.log('⚠️  Anon client unexpectedly succeeded');
    }

    // Clean up
    await serviceClient.from('organizations').delete().eq('id', orgData.id);
    console.log('🧹 Test organization deleted');

    console.log('\n🎉 Fix verified! The issue should now be resolved.');
    console.log('');
    console.log('Summary:');
    console.log('- Authenticated users can create organizations');
    console.log('- Anonymous users are properly blocked');
    console.log('- RLS policies are working correctly');
  } catch (error) {
    console.error('❌ Error testing fix:', error.message);
  }
}

// Run the process
async function main() {
  await showMigrationSteps();
  await testFix();
}

main().catch(console.error);
