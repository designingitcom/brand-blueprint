#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

async function checkSchema() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('🔍 Checking current database schema...');

  try {
    // Check questions table columns
    const { data: questionColumns, error: qError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'questions')
      .order('ordinal_position');

    if (qError) {
      console.error('❌ Error fetching questions columns:', qError);
    } else {
      console.log('\n📋 Questions table columns:');
      questionColumns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
      });
    }

    // Check modules table columns
    const { data: moduleColumns, error: mError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'modules')
      .order('ordinal_position');

    if (mError) {
      console.error('❌ Error fetching modules columns:', mError);
    } else {
      console.log('\n📋 Modules table columns:');
      moduleColumns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
      });
    }

    // Test a simple select to see what works
    console.log('\n🔬 Testing basic queries...');

    const { data: questions, error: selectError } = await supabase
      .from('questions')
      .select('*')
      .limit(1);

    if (selectError) {
      console.error('❌ Error selecting from questions:', selectError);
    } else {
      console.log('✅ Questions table accessible');
      if (questions.length > 0) {
        console.log('Sample question keys:', Object.keys(questions[0]));
      }
    }

  } catch (error) {
    console.error('❌ Schema check failed:', error);
  }
}

checkSchema();