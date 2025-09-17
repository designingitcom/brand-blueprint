#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

async function applyMigrationDirect() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing required environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('🚀 Applying language support migration manually...');

  try {
    // Step 1: Add new columns to questions table
    console.log('\n1️⃣ Adding columns to questions table...');

    // Check if columns already exist first
    const { data: questionColumns } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'questions')
      .in('column_name', ['parent_question_id', 'is_master', 'content_language']);

    const existingColumns = questionColumns?.map(c => c.column_name) || [];

    if (!existingColumns.includes('parent_question_id')) {
      console.log('Adding parent_question_id column...');
      // We need to use a different approach since direct ALTER isn't available
      console.log('⚠️ Column addition requires database admin access');
    } else {
      console.log('✅ parent_question_id already exists');
    }

    if (!existingColumns.includes('is_master')) {
      console.log('Adding is_master column...');
      console.log('⚠️ Column addition requires database admin access');
    } else {
      console.log('✅ is_master already exists');
    }

    if (!existingColumns.includes('content_language')) {
      console.log('Adding content_language column...');
      console.log('⚠️ Column addition requires database admin access');
    } else {
      console.log('✅ content_language already exists');
    }

    // Step 2: Test if we can insert questions with new structure
    console.log('\n2️⃣ Testing new question structure...');

    const { data: existingQuestions, error: fetchError } = await supabase
      .from('questions')
      .select('id, label, type, module_id')
      .limit(1);

    if (fetchError) {
      console.error('❌ Error fetching questions:', fetchError);
      return;
    }

    if (existingQuestions && existingQuestions.length > 0) {
      console.log('✅ Questions table accessible');
      console.log('Sample question:', existingQuestions[0]);

      // Try to select with new columns to see which exist
      const { data: questionsWithNewCols, error: newColsError } = await supabase
        .from('questions')
        .select('id, label, content_language, is_master, parent_question_id')
        .limit(1);

      if (newColsError) {
        console.log('⚠️ New columns not yet available:', newColsError.message);
        console.log('\n📋 Migration Status: COLUMNS NEED TO BE ADDED');
        console.log('Please run the following SQL commands in your Supabase SQL editor:');
        console.log('\n--- Copy and paste these commands in Supabase SQL Editor ---');
        console.log('ALTER TABLE questions ADD COLUMN IF NOT EXISTS parent_question_id UUID REFERENCES questions(id);');
        console.log('ALTER TABLE questions ADD COLUMN IF NOT EXISTS is_master BOOLEAN DEFAULT true;');
        console.log('ALTER TABLE questions ADD COLUMN IF NOT EXISTS content_language VARCHAR(5) DEFAULT \'en\';');
        console.log('\nALTER TABLE modules ADD COLUMN IF NOT EXISTS parent_module_id UUID REFERENCES modules(id);');
        console.log('ALTER TABLE modules ADD COLUMN IF NOT EXISTS is_master BOOLEAN DEFAULT true;');
        console.log('ALTER TABLE modules ADD COLUMN IF NOT EXISTS content_language VARCHAR(5) DEFAULT \'en\';');
        console.log('\nCREATE INDEX IF NOT EXISTS idx_questions_parent_id ON questions(parent_question_id);');
        console.log('CREATE INDEX IF NOT EXISTS idx_questions_language ON questions(content_language);');
        console.log('CREATE INDEX IF NOT EXISTS idx_questions_master ON questions(is_master);');
        console.log('--- End of SQL commands ---\n');
      } else {
        console.log('✅ New columns are available!');
        console.log('Sample question with new fields:', questionsWithNewCols[0]);

        // Step 3: Test the actions
        console.log('\n3️⃣ Testing updated question actions...');
        await testQuestionActions(supabase);
      }
    }

  } catch (error) {
    console.error('❌ Migration test failed:', error);
  }
}

async function testQuestionActions(supabase) {
  try {
    // Test fetching questions with language support
    const { data: questions, error } = await supabase
      .from('questions')
      .select(`
        id,
        label,
        help_text,
        type,
        content_language,
        is_master,
        parent_question_id,
        modules(name)
      `)
      .limit(3);

    if (error) {
      console.error('❌ Error fetching questions with relations:', error);
      return;
    }

    console.log('✅ Question actions working!');
    console.log('Sample questions with language data:');
    questions.forEach(q => {
      console.log(`  - ${q.label} [${q.content_language}] master=${q.is_master} module=${q.modules?.name || 'N/A'}`);
    });

    // Test language filtering
    const { data: englishQuestions, error: langError } = await supabase
      .from('questions')
      .select('id, label, content_language')
      .eq('content_language', 'en')
      .limit(2);

    if (langError) {
      console.error('❌ Error filtering by language:', langError);
    } else {
      console.log(`✅ Language filtering works! Found ${englishQuestions.length} English questions`);
    }

  } catch (error) {
    console.error('❌ Action testing failed:', error);
  }
}

applyMigrationDirect();