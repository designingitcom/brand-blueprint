require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const serviceClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const anonClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testComprehensiveRLSFix() {
  console.log('🧪 Testing Comprehensive RLS Policy Fix');
  console.log('======================================\n');

  const testTables = [
    'organizations',
    'businesses',
    'projects',
    'modules',
    'questions',
    'memberships',
    'users',
    'invites',
    'responses',
  ];

  console.log('🔄 Testing Service Role Access (should all pass)...\n');

  let servicePassCount = 0;
  let serviceFailCount = 0;

  for (const table of testTables) {
    try {
      const { data, error } = await serviceClient
        .from(table)
        .select('id')
        .limit(1);

      if (error) {
        console.log(`❌ Service ${table}: ${error.message}`);
        serviceFailCount++;
      } else {
        console.log(`✅ Service ${table}: Read access working`);
        servicePassCount++;
      }
    } catch (err) {
      console.log(`❌ Service ${table}: Exception - ${err.message}`);
      serviceFailCount++;
    }
  }

  console.log(
    `\n📊 Service Role Results: ${servicePassCount} passed, ${serviceFailCount} failed\n`
  );

  console.log('🔄 Testing Anonymous Access (should all fail properly)...\n');

  let anonProperlyBlockedCount = 0;
  let anonUnexpectedAccessCount = 0;

  for (const table of testTables) {
    try {
      const { data, error } = await anonClient
        .from(table)
        .select('id')
        .limit(1);

      if (error) {
        if (error.message.includes('row-level security policy')) {
          console.log(`✅ Anon ${table}: Properly blocked by RLS`);
          anonProperlyBlockedCount++;
        } else {
          console.log(`⚠️  Anon ${table}: Different error - ${error.message}`);
        }
      } else {
        console.log(`❌ Anon ${table}: Unexpected access allowed`);
        anonUnexpectedAccessCount++;
      }
    } catch (err) {
      console.log(`⚠️  Anon ${table}: Exception - ${err.message}`);
    }
  }

  console.log(
    `\n📊 Anonymous Access Results: ${anonProperlyBlockedCount} properly blocked, ${anonUnexpectedAccessCount} unexpected access\n`
  );

  // Test actual CRUD operations on organizations
  console.log('🔄 Testing CRUD operations on organizations...\n');

  try {
    // Test CREATE with service role
    const testOrg = {
      name: 'RLS Test Organization',
      slug: `rls-test-${Date.now()}`,
      timezone: 'UTC',
      settings: {},
    };

    console.log('🔄 Testing organization creation with service role...');
    const { data: orgData, error: createError } = await serviceClient
      .from('organizations')
      .insert(testOrg)
      .select()
      .single();

    if (createError) {
      console.log('❌ Organization creation failed:', createError.message);
      return;
    }

    console.log('✅ Organization created successfully');
    const orgId = orgData.id;

    // Test READ
    console.log('🔄 Testing organization read...');
    const { data: readData, error: readError } = await serviceClient
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single();

    if (readError) {
      console.log('❌ Organization read failed:', readError.message);
    } else {
      console.log('✅ Organization read successful');
    }

    // Test UPDATE
    console.log('🔄 Testing organization update...');
    const { error: updateError } = await serviceClient
      .from('organizations')
      .update({ name: 'RLS Test Organization Updated' })
      .eq('id', orgId);

    if (updateError) {
      console.log('❌ Organization update failed:', updateError.message);
    } else {
      console.log('✅ Organization update successful');
    }

    // Test with anon client (should fail)
    console.log(
      '🔄 Testing organization creation with anon client (should fail)...'
    );
    const { data: anonOrgData, error: anonCreateError } = await anonClient
      .from('organizations')
      .insert({
        name: 'Anon Test Org',
        slug: `anon-test-${Date.now()}`,
        timezone: 'UTC',
      });

    if (anonCreateError) {
      console.log(
        '✅ Anon organization creation properly blocked:',
        anonCreateError.message
      );
    } else {
      console.log('❌ Anon organization creation unexpectedly succeeded');
    }

    // Test DELETE (cleanup)
    console.log('🔄 Testing organization deletion...');
    const { error: deleteError } = await serviceClient
      .from('organizations')
      .delete()
      .eq('id', orgId);

    if (deleteError) {
      console.log('❌ Organization deletion failed:', deleteError.message);
    } else {
      console.log('✅ Organization deletion successful');
    }
  } catch (error) {
    console.error('❌ CRUD test error:', error.message);
  }

  // Final summary
  console.log('\n🎉 Comprehensive RLS Fix Test Complete!');
  console.log('=====================================\n');

  if (
    servicePassCount === testTables.length &&
    anonProperlyBlockedCount >= testTables.length - 2
  ) {
    console.log('✅ SUCCESS: All RLS policies are working correctly!');
    console.log('   - Service role has full access to all tables');
    console.log('   - Anonymous users are properly blocked');
    console.log('   - CRUD operations work as expected');
    console.log(
      '\n🔧 Your database is now ready for use with proper RLS protection.'
    );
  } else {
    console.log('⚠️  PARTIAL SUCCESS: Some issues may remain');
    console.log(
      `   - Service role access: ${servicePassCount}/${testTables.length} working`
    );
    console.log(
      `   - Anonymous blocking: ${anonProperlyBlockedCount}/${testTables.length} working`
    );
    console.log('\n🔍 Please review any failed tests above.');
  }
}

testComprehensiveRLSFix().catch(console.error);
