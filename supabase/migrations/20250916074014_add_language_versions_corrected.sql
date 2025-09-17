-- Add parent-child relationship support for questions and modules
-- This enables language-versioned content with master-translation relationships
-- CORRECTED VERSION - only references tables that exist

-- Add parent relationship and master flag to questions
ALTER TABLE questions ADD COLUMN IF NOT EXISTS parent_question_id UUID REFERENCES questions(id);
ALTER TABLE questions ADD COLUMN IF NOT EXISTS is_master BOOLEAN DEFAULT true;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS content_language VARCHAR(5) DEFAULT 'en';

-- Add parent relationship and master flag to modules
ALTER TABLE modules ADD COLUMN IF NOT EXISTS parent_module_id UUID REFERENCES modules(id);
ALTER TABLE modules ADD COLUMN IF NOT EXISTS is_master BOOLEAN DEFAULT true;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS content_language VARCHAR(5) DEFAULT 'en';

-- Add language tracking to other existing tables
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS content_language VARCHAR(5) DEFAULT 'en';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS content_language VARCHAR(5) DEFAULT 'en';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS content_language VARCHAR(5) DEFAULT 'en';

-- Only add to answers table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'answers') THEN
        ALTER TABLE answers ADD COLUMN IF NOT EXISTS content_language VARCHAR(5) DEFAULT 'en';
    END IF;
END
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_parent_id ON questions(parent_question_id);
CREATE INDEX IF NOT EXISTS idx_questions_language ON questions(content_language);
CREATE INDEX IF NOT EXISTS idx_questions_master ON questions(is_master);

CREATE INDEX IF NOT EXISTS idx_modules_parent_id ON modules(parent_module_id);
CREATE INDEX IF NOT EXISTS idx_modules_language ON modules(content_language);
CREATE INDEX IF NOT EXISTS idx_modules_master ON modules(is_master);

-- Create view for question language families (master + all translations)
CREATE OR REPLACE VIEW question_language_families AS
SELECT
  COALESCE(q.parent_question_id, q.id) as master_id,
  q.id,
  q.title,
  q.content_language,
  q.is_master,
  q.parent_question_id,
  master.title as master_title,
  master.content_language as master_language
FROM questions q
LEFT JOIN questions master ON (
  CASE
    WHEN q.is_master THEN q.id = master.id
    ELSE q.parent_question_id = master.id
  END
)
WHERE master.is_master = true;

-- Function to get preferred language version of a question
CREATE OR REPLACE FUNCTION get_question_for_language(
  p_master_question_id UUID,
  p_preferred_language VARCHAR(5) DEFAULT 'en'
) RETURNS TABLE (
  id UUID,
  title TEXT,
  content_language VARCHAR(5),
  is_master BOOLEAN,
  definition TEXT,
  question_type TEXT,
  sort_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- First try to get translation in preferred language
  RETURN QUERY
  SELECT q.id, q.title, q.content_language, q.is_master, q.definition,
         q.question_type, q.sort_order, q.created_at
  FROM questions q
  WHERE q.parent_question_id = p_master_question_id
    AND q.content_language = p_preferred_language
  LIMIT 1;

  -- If no translation found, return master
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT q.id, q.title, q.content_language, q.is_master, q.definition,
           q.question_type, q.sort_order, q.created_at
    FROM questions q
    WHERE q.id = p_master_question_id AND q.is_master = true;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to clone question for translation
CREATE OR REPLACE FUNCTION clone_question_for_translation(
  p_master_id UUID,
  p_target_language VARCHAR(5),
  p_translated_title TEXT,
  p_translated_definition TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
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
    is_master
  ) VALUES (
    v_master_record.module_id,
    p_translated_title,
    COALESCE(p_translated_definition, v_master_record.definition),
    v_master_record.question_type,
    v_master_record.sort_order,
    p_target_language,
    p_master_id,
    false
  ) RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON COLUMN questions.parent_question_id IS 'Links to master question for translations (NULL for master questions)';
COMMENT ON COLUMN questions.is_master IS 'True for original questions, false for translations';
COMMENT ON COLUMN questions.content_language IS 'ISO 639-1 language code for the content';
COMMENT ON FUNCTION get_question_for_language IS 'Returns question in preferred language, falls back to master';
COMMENT ON FUNCTION clone_question_for_translation IS 'Creates a translated copy of a master question';