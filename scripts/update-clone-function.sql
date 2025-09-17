-- Update the clone function to support all translation fields
CREATE OR REPLACE FUNCTION clone_question_for_translation(
  p_master_id UUID,
  p_target_language VARCHAR(5),
  p_translated_text TEXT,
  p_translated_description TEXT DEFAULT NULL,
  p_translated_why_it_matters TEXT DEFAULT NULL,
  p_translated_simple_terms TEXT DEFAULT NULL,
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
    is_master,
    prerequisites,
    examples,
    demonstrations,
    why_it_matters,
    simple_terms,
    confidence_calibration_enabled,
    ai_assistance_enabled,
    validation_rules,
    ui_config,
    created_at,
    updated_at
  ) VALUES (
    v_master_record.module_id,
    p_translated_text,
    COALESCE(p_translated_description, v_master_record.definition),
    v_master_record.question_type,
    v_master_record.sort_order,
    p_target_language,
    p_master_id,
    false, -- is_master = false for translations
    v_master_record.prerequisites,
    v_master_record.examples,
    v_master_record.demonstrations,
    COALESCE(p_translated_why_it_matters, v_master_record.why_it_matters),
    COALESCE(p_translated_simple_terms, v_master_record.simple_terms),
    v_master_record.confidence_calibration_enabled,
    v_master_record.ai_assistance_enabled,
    v_master_record.validation_rules,
    v_master_record.ui_config,
    NOW(),
    NOW()
  ) RETURNING id INTO v_new_id;

  -- Log the operation
  RAISE NOTICE 'Created translation % for master question % in language %', v_new_id, p_master_id, p_target_language;

  RETURN v_new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION clone_question_for_translation TO authenticated, anon;