#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

async function testMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('🧪 Testing multilingual question system...');

  try {
    // Step 1: Test if new columns exist
    console.log('\n1️⃣ Testing if language columns exist...');

    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, title, content_language, is_master, parent_question_id')
      .limit(1);

    if (questionsError) {
      console.error('❌ New columns not yet available:', questionsError.message);
      console.log('\n📋 MIGRATION REQUIRED');
      console.log('Please run the SQL from scripts/manual-migration.js in your Supabase SQL Editor');
      return;
    }

    console.log('✅ Language columns are available!');

    // Step 2: Test fetching questions with language filter
    console.log('\n2️⃣ Testing question fetching with language support...');

    const { data: allQuestions, error: fetchError } = await supabase
      .from('questions')
      .select(`
        id,
        title,
        definition,
        question_type,
        content_language,
        is_master,
        parent_question_id,
        modules:module_id (
          id,
          name
        )
      `)
      .limit(5);

    if (fetchError) {
      console.error('❌ Error fetching questions:', fetchError);
      return;
    }

    console.log('✅ Question fetching works!');
    console.log('Sample questions:');
    allQuestions.forEach(q => {
      console.log(`  - ${q.title} [${q.content_language || 'en'}] master=${q.is_master}`);
    });

    // Step 3: Test language filtering
    console.log('\n3️⃣ Testing language filtering...');

    const { data: englishQuestions, error: langError } = await supabase
      .from('questions')
      .select('id, title, content_language')
      .eq('content_language', 'en')
      .limit(3);

    if (langError) {
      console.error('❌ Language filtering failed:', langError);
    } else {
      console.log(`✅ Language filtering works! Found ${englishQuestions.length} English questions`);
    }

    // Step 4: Test the clone function (if it exists)
    console.log('\n4️⃣ Testing clone function availability...');

    try {
      // Try to call the function with a test (will fail but tells us if function exists)
      const { error: funcError } = await supabase.rpc('clone_question_for_translation', {
        p_master_id: '00000000-0000-0000-0000-000000000000',  // fake ID
        p_target_language: 'de',
        p_translated_title: 'Test'
      });

      if (funcError && funcError.message.includes('Master question not found')) {
        console.log('✅ Clone function exists and is working!');
      } else if (funcError && funcError.message.includes('function public.clone_question_for_translation')) {
        console.log('⚠️  Clone function not yet created');
      } else {
        console.log('⚠️  Clone function test inconclusive:', funcError?.message);
      }
    } catch (error) {
      console.log('⚠️  Clone function test failed:', error.message);
    }

    // Step 5: Summary
    console.log('\n🎉 MIGRATION TEST SUMMARY');
    console.log('=====================================');

    if (allQuestions && allQuestions.length > 0) {
      const hasLanguageFields = allQuestions.every(q =>
        q.hasOwnProperty('content_language') &&
        q.hasOwnProperty('is_master') &&
        q.hasOwnProperty('parent_question_id')
      );

      if (hasLanguageFields) {
        console.log('✅ Database migration successful');
        console.log('✅ Language support fully enabled');
        console.log('✅ Ready to test UI components');
        console.log('\nNext steps:');
        console.log('1. Visit /admin/questions to test language filtering');
        console.log('2. Test the clone & translate modal');
        console.log('3. Test language version switching');
      } else {
        console.log('⚠️  Partial migration - some fields missing');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testMigration();