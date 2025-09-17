#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

async function manualMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('🚀 Manual Migration: Adding language support columns...');

  try {
    // First, let's verify we can access the questions table
    const { data: sample, error: sampleError } = await supabase
      .from('questions')
      .select('id, title, question_type')
      .limit(1);

    if (sampleError) {
      console.error('❌ Cannot access questions table:', sampleError);
      return;
    }

    console.log('✅ Questions table accessible');
    console.log('Sample question:', sample[0]);

    // Now let's create a function that will be executed as a raw SQL query
    console.log('\n💊 Creating SQL migration script for manual execution...');

    const migrationSQL = `
-- Language support migration for questions table
DO $$
BEGIN
    -- Add parent relationship column
    IF NOT EXISTS (
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name='questions' AND column_name='parent_question_id'
    ) THEN
        ALTER TABLE questions ADD COLUMN parent_question_id UUID REFERENCES questions(id);
        RAISE NOTICE 'Added parent_question_id column';
    ELSE
        RAISE NOTICE 'parent_question_id already exists';
    END IF;

    -- Add master flag column
    IF NOT EXISTS (
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name='questions' AND column_name='is_master'
    ) THEN
        ALTER TABLE questions ADD COLUMN is_master BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_master column';
    ELSE
        RAISE NOTICE 'is_master already exists';
    END IF;

    -- Add content language column
    IF NOT EXISTS (
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name='questions' AND column_name='content_language'
    ) THEN
        ALTER TABLE questions ADD COLUMN content_language VARCHAR(5) DEFAULT 'en';
        RAISE NOTICE 'Added content_language column';
    ELSE
        RAISE NOTICE 'content_language already exists';
    END IF;

    -- Create indexes
    IF NOT EXISTS (
        SELECT indexname FROM pg_indexes
        WHERE tablename = 'questions' AND indexname = 'idx_questions_parent_id'
    ) THEN
        CREATE INDEX idx_questions_parent_id ON questions(parent_question_id);
        RAISE NOTICE 'Created idx_questions_parent_id index';
    END IF;

    IF NOT EXISTS (
        SELECT indexname FROM pg_indexes
        WHERE tablename = 'questions' AND indexname = 'idx_questions_language'
    ) THEN
        CREATE INDEX idx_questions_language ON questions(content_language);
        RAISE NOTICE 'Created idx_questions_language index';
    END IF;

    IF NOT EXISTS (
        SELECT indexname FROM pg_indexes
        WHERE tablename = 'questions' AND indexname = 'idx_questions_master'
    ) THEN
        CREATE INDEX idx_questions_master ON questions(is_master);
        RAISE NOTICE 'Created idx_questions_master index';
    END IF;

END
$$;

-- Create the clone function
CREATE OR REPLACE FUNCTION clone_question_for_translation(
  p_master_id UUID,
  p_target_language VARCHAR(5),
  p_translated_title TEXT,
  p_translated_definition TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_new_id UUID;
  v_master_record RECORD;
BEGIN
  -- Get master question details
  SELECT * INTO v_master_record
  FROM questions
  WHERE id = p_master_id AND is_master = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Master question not found: %', p_master_id;
  END IF;

  -- Check if translation already exists
  SELECT id INTO v_new_id
  FROM questions
  WHERE parent_question_id = p_master_id
    AND content_language = p_target_language;

  IF FOUND THEN
    RAISE EXCEPTION 'Translation already exists for language: %', p_target_language;
  END IF;

  -- Create new translation
  INSERT INTO questions (
    module_id,
    title,
    definition,
    question_type,
    sort_order,
    content_language,
    parent_question_id,
    is_master,
    prerequisites,
    examples,
    demonstrations,
    why_it_matters,
    simple_terms,
    confidence_calibration_enabled,
    ai_assistance_enabled,
    validation_rules,
    ui_config
  ) VALUES (
    v_master_record.module_id,
    p_translated_title,
    COALESCE(p_translated_definition, v_master_record.definition),
    v_master_record.question_type,
    v_master_record.sort_order,
    p_target_language,
    p_master_id,
    false,
    v_master_record.prerequisites,
    v_master_record.examples,
    v_master_record.demonstrations,
    v_master_record.why_it_matters,
    v_master_record.simple_terms,
    v_master_record.confidence_calibration_enabled,
    v_master_record.ai_assistance_enabled,
    v_master_record.validation_rules,
    v_master_record.ui_config
  ) RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$ LANGUAGE plpgsql;
`;

    console.log('\n📋 MANUAL MIGRATION REQUIRED');
    console.log('==================================');
    console.log('Please copy and paste the following SQL into your Supabase SQL Editor:');
    console.log('(Go to: https://supabase.com/dashboard/project/xigzapsughpuqjxttsra/sql/new)');
    console.log('\n' + '='.repeat(80));
    console.log(migrationSQL);
    console.log('='.repeat(80));
    console.log('\nAfter running the SQL, come back and run: node scripts/test-migration.js');

  } catch (error) {
    console.error('❌ Migration preparation failed:', error);
  }
}

manualMigration();