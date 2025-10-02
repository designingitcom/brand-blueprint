const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTable() {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (data && data.length > 0) {
    const columns = Object.keys(data[0]).sort();
    console.log('\n📋 Current businesses table has', columns.length, 'columns:\n');

    // Check for old columns that should have been removed
    const oldColumns = [
      'owner_id', 'onboarding_current_step', 'services', 'competitors',
      'pitch_deck_url', 'one_pager_url', 'ai_analysis', 'ai_analysis_completed_at',
      'business_model', 'avg_customer_ltv', 'primary_goal', 'custom_industry'
    ];

    const foundOldColumns = columns.filter(col => oldColumns.includes(col));

    if (foundOldColumns.length > 0) {
      console.log('❌ OLD COLUMNS STILL PRESENT (should be removed):');
      foundOldColumns.forEach(col => console.log(`   - ${col}`));
      console.log('');
    } else {
      console.log('✅ All old columns have been removed!');
      console.log('');
    }

    console.log('All columns:');
    columns.forEach((col, i) => {
      const marker = foundOldColumns.includes(col) ? '❌' : '✅';
      console.log(`  ${marker} ${i + 1}. ${col}`);
    });
  }
}

checkTable().then(() => process.exit(0));
