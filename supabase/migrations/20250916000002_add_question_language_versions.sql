-- Add parent-child relationship support for questions, modules, and strategies
-- This enables language-versioned content with master-translation relationships

-- Add parent relationship and master flag to questions
ALTER TABLE questions ADD COLUMN IF NOT EXISTS parent_question_id UUID REFERENCES questions(id);
ALTER TABLE questions ADD COLUMN IF NOT EXISTS is_master BOOLEAN DEFAULT true;

-- Add parent relationship and master flag to modules
ALTER TABLE modules ADD COLUMN IF NOT EXISTS parent_module_id UUID REFERENCES modules(id);
ALTER TABLE modules ADD COLUMN IF NOT EXISTS is_master BOOLEAN DEFAULT true;

-- Add parent relationship and master flag to strategies
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS parent_strategy_id UUID REFERENCES strategies(id);
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS is_master BOOLEAN DEFAULT true;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_parent_id ON questions(parent_question_id);
CREATE INDEX IF NOT EXISTS idx_questions_language ON questions(content_language);
CREATE INDEX IF NOT EXISTS idx_questions_master ON questions(is_master);

CREATE INDEX IF NOT EXISTS idx_modules_parent_id ON modules(parent_module_id);
CREATE INDEX IF NOT EXISTS idx_modules_language ON modules(content_language);
CREATE INDEX IF NOT EXISTS idx_modules_master ON modules(is_master);

CREATE INDEX IF NOT EXISTS idx_strategies_parent_id ON strategies(parent_strategy_id);
CREATE INDEX IF NOT EXISTS idx_strategies_language ON strategies(content_language);
CREATE INDEX IF NOT EXISTS idx_strategies_master ON strategies(is_master);

-- Create view for question language families (master + all translations)
CREATE OR REPLACE VIEW question_language_families AS
SELECT
  COALESCE(q.parent_question_id, q.id) as master_id,
  q.id,
  q.text,
  q.content_language,
  q.is_master,
  q.parent_question_id,
  master.text as master_text,
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
  text TEXT,
  content_language VARCHAR(5),
  is_master BOOLEAN,
  description TEXT,
  type VARCHAR(100),
  category VARCHAR(100),
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- First try to get translation in preferred language
  RETURN QUERY
  SELECT q.id, q.text, q.content_language, q.is_master, q.description,
         q.type, q.category, q.order_index, q.created_at, q.updated_at
  FROM questions q
  WHERE q.parent_question_id = p_master_question_id
    AND q.content_language = p_preferred_language
  LIMIT 1;

  -- If no translation found, return master
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT q.id, q.text, q.content_language, q.is_master, q.description,
           q.type, q.category, q.order_index, q.created_at, q.updated_at
    FROM questions q
    WHERE q.id = p_master_question_id AND q.is_master = true;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to clone question for translation
CREATE OR REPLACE FUNCTION clone_question_for_translation(
  p_master_id UUID,
  p_target_language VARCHAR(5),
  p_translated_text TEXT,
  p_translated_description TEXT DEFAULT NULL,
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
    text,
    description,
    type,
    category,
    content_language,
    parent_question_id,
    is_master,
    order_index,
    organization_id,
    business_id,
    project_id,
    created_by
  ) VALUES (
    p_translated_text,
    COALESCE(p_translated_description, v_master_record.description),
    v_master_record.type,
    v_master_record.category,
    p_target_language,
    p_master_id,
    false,
    v_master_record.order_index,
    v_master_record.organization_id,
    v_master_record.business_id,
    v_master_record.project_id,
    COALESCE(p_user_id, v_master_record.created_by)
  ) RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies for translated content
-- Users can view all language versions of questions they have access to
CREATE POLICY "Users can view question translations" ON questions
  FOR SELECT USING (
    -- Same access rules as original questions, just extended to translations
    CASE
      WHEN organization_id IS NOT NULL THEN
        EXISTS (
          SELECT 1 FROM organization_members om
          WHERE om.organization_id = questions.organization_id
          AND om.user_id = auth.uid()
        )
      WHEN business_id IS NOT NULL THEN
        EXISTS (
          SELECT 1 FROM businesses b
          JOIN organization_members om ON b.organization_id = om.organization_id
          WHERE b.id = questions.business_id
          AND om.user_id = auth.uid()
        )
      WHEN project_id IS NOT NULL THEN
        EXISTS (
          SELECT 1 FROM projects p
          JOIN businesses b ON p.business_id = b.id
          JOIN organization_members om ON b.organization_id = om.organization_id
          WHERE p.id = questions.project_id
          AND om.user_id = auth.uid()
        )
      ELSE false
    END
  );

-- Users can create translations of questions they can access
CREATE POLICY "Users can create question translations" ON questions
  FOR INSERT WITH CHECK (
    -- Can create translation if they can access the master question
    parent_question_id IS NOT NULL
    AND is_master = false
    AND EXISTS (
      SELECT 1 FROM questions master
      WHERE master.id = parent_question_id
      AND master.is_master = true
      -- Apply same access check as the view policy above
    )
  );

-- Add comments for documentation
COMMENT ON COLUMN questions.parent_question_id IS 'Links to master question for translations (NULL for master questions)';
COMMENT ON COLUMN questions.is_master IS 'True for original questions, false for translations';
COMMENT ON FUNCTION get_question_for_language IS 'Returns question in preferred language, falls back to master';
COMMENT ON FUNCTION clone_question_for_translation IS 'Creates a translated copy of a master question';