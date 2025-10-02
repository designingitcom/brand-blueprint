-- Create table for storing Lindy webhook responses
-- This is separate from ai_messages which is used for the RAG system

CREATE TABLE IF NOT EXISTS lindy_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL, -- 'Q7', 'Q8', etc.
  role TEXT NOT NULL DEFAULT 'lindy', -- 'lindy' or 'user'
  content JSONB NOT NULL, -- Full webhook payload
  suggestions JSONB, -- Array of AI suggestions
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_lindy_responses_business_id ON lindy_responses(business_id);
CREATE INDEX IF NOT EXISTS idx_lindy_responses_question_id ON lindy_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_lindy_responses_idempotency_key ON lindy_responses(idempotency_key);

-- RLS Policies
ALTER TABLE lindy_responses ENABLE ROW LEVEL SECURITY;

-- Users can view their own business's Lindy responses
CREATE POLICY "Users can view their Lindy responses" ON lindy_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = lindy_responses.business_id
      AND b.user_id = auth.uid()
    )
  );

-- Service role can insert (for webhooks)
CREATE POLICY "Service role can insert Lindy responses" ON lindy_responses
  FOR INSERT WITH CHECK (true);

-- Service role can update
CREATE POLICY "Service role can update Lindy responses" ON lindy_responses
  FOR UPDATE USING (true);

COMMENT ON TABLE lindy_responses IS 'Stores responses from Lindy AI webhooks (Q7 suggestions, etc.)';
COMMENT ON COLUMN lindy_responses.business_id IS 'Reference to business (project_id from webhook)';
COMMENT ON COLUMN lindy_responses.question_id IS 'Which question this relates to (Q7, Q8, etc.)';
COMMENT ON COLUMN lindy_responses.content IS 'Full webhook payload from Lindy';
COMMENT ON COLUMN lindy_responses.suggestions IS 'Array of AI-generated suggestions';
COMMENT ON COLUMN lindy_responses.idempotency_key IS 'Prevents duplicate processing of same webhook';
