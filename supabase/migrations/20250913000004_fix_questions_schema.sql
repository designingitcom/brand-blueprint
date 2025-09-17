-- Fix questions table schema to match application expectations
-- Migration to add missing columns and rename existing ones

-- Add missing columns to questions table
ALTER TABLE questions 
ADD COLUMN title TEXT,
ADD COLUMN definition TEXT,
ADD COLUMN simple_terms TEXT,
ADD COLUMN why_it_matters TEXT,
ADD COLUMN examples TEXT[],
ADD COLUMN question_type TEXT,
ADD COLUMN demonstrations JSONB DEFAULT '{}',
ADD COLUMN confidence_calibration_score INTEGER DEFAULT 7,
ADD COLUMN ai_assistance_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN validation_rules JSONB DEFAULT '{}',
ADD COLUMN prerequisites TEXT[],
ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- Copy data from existing columns to new ones
UPDATE questions 
SET 
  title = label,
  question_type = type::TEXT
WHERE title IS NULL;

-- Make title column required (after data migration)
ALTER TABLE questions ALTER COLUMN title SET NOT NULL;
ALTER TABLE questions ALTER COLUMN question_type SET NOT NULL;

-- Add check constraints for confidence calibration score
ALTER TABLE questions 
ADD CONSTRAINT check_confidence_calibration_score 
CHECK (confidence_calibration_score >= 1 AND confidence_calibration_score <= 10);

-- Create index for the new columns
CREATE INDEX idx_questions_title ON questions(title);
CREATE INDEX idx_questions_question_type ON questions(question_type);
CREATE INDEX idx_questions_is_active ON questions(is_active);

-- Update the existing questions to have valid question_type values
UPDATE questions 
SET question_type = CASE 
    WHEN question_type IN ('text', 'textarea', 'select', 'multiselect', 'radio', 'checkbox', 'number', 'date', 'email', 'url') 
    THEN question_type
    ELSE 'text' 
END;