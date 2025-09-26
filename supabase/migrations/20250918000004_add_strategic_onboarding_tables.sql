-- Migration: Add strategic onboarding tables for business positioning
-- This adds the missing tables for the complete S1BMW strategic onboarding flow

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Market segments table for Phase 2
CREATE TABLE IF NOT EXISTS market_segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  characteristics JSONB DEFAULT '[]'::jsonb,
  pain_points JSONB DEFAULT '[]'::jsonb,
  opportunities JSONB DEFAULT '[]'::jsonb,
  ai_confidence NUMERIC(3,2) DEFAULT 0.0 CHECK (ai_confidence >= 0 AND ai_confidence <= 1),
  is_primary BOOLEAN DEFAULT FALSE,
  is_secondary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer personas table for Phase 2
CREATE TABLE IF NOT EXISTS customer_personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  age_range TEXT,
  description TEXT,
  characteristics JSONB DEFAULT '[]'::jsonb,
  pain_points JSONB DEFAULT '[]'::jsonb,
  goals JSONB DEFAULT '[]'::jsonb,
  information_sources JSONB DEFAULT '[]'::jsonb,
  trigger_events JSONB DEFAULT '[]'::jsonb,
  ai_confidence NUMERIC(3,2) DEFAULT 0.0 CHECK (ai_confidence >= 0 AND ai_confidence <= 1),
  is_customized BOOLEAN DEFAULT FALSE,
  is_selected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Strategic responses table for Phase 3 (15 questions)
CREATE TABLE IF NOT EXISTS strategic_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL, -- e.g., 'Q1', 'Q2', etc.
  question_text TEXT NOT NULL,
  question_category TEXT, -- e.g., 'problem', 'identity', 'value'
  response TEXT NOT NULL,
  ai_suggestion TEXT,
  confidence_level TEXT CHECK (confidence_level IN ('low', 'medium', 'high')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, question_id)
);

-- Positioning output table for Phase 4
CREATE TABLE IF NOT EXISTS positioning_outputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,

  -- Core positioning elements
  positioning_statement TEXT NOT NULL,
  segment_focus TEXT,
  persona_target TEXT,
  problem_solved TEXT,
  category TEXT,
  unique_value TEXT,
  competitive_advantage TEXT,

  -- Identity elements
  core_identity TEXT,
  values TEXT,
  belief TEXT,
  sacrifice TEXT,

  -- Decision factors
  alternatives TEXT,
  only_position TEXT,
  decision_driver TEXT,

  -- Metrics and scoring
  success_metrics JSONB DEFAULT '{}'::jsonb,
  strength_scores JSONB DEFAULT '{
    "problem_clarity": 0,
    "segment_focus": 0,
    "unique_position": 0,
    "value_clarity": 0,
    "overall": 0
  }'::jsonb,

  completeness_score NUMERIC(3,2) DEFAULT 0.0 CHECK (completeness_score >= 0 AND completeness_score <= 1),

  -- Timestamps
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add strategic onboarding fields to businesses table
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS onboarding_phase TEXT DEFAULT 'business_setup'
    CHECK (onboarding_phase IN ('business_setup', 'strategic_foundation', 'strategic_questions', 'positioning_output', 'completed')),
  ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS strategic_onboarding_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS strategic_onboarding_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS basics_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS segments_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS personas_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS questions_completed_at TIMESTAMPTZ;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_market_segments_business_id ON market_segments(business_id);
CREATE INDEX IF NOT EXISTS idx_market_segments_primary ON market_segments(business_id, is_primary) WHERE is_primary = TRUE;
CREATE INDEX IF NOT EXISTS idx_customer_personas_business_id ON customer_personas(business_id);
CREATE INDEX IF NOT EXISTS idx_customer_personas_selected ON customer_personas(business_id, is_selected) WHERE is_selected = TRUE;
CREATE INDEX IF NOT EXISTS idx_strategic_responses_business_id ON strategic_responses(business_id);
CREATE INDEX IF NOT EXISTS idx_strategic_responses_question ON strategic_responses(business_id, question_id);
CREATE INDEX IF NOT EXISTS idx_positioning_outputs_business_id ON positioning_outputs(business_id);
CREATE INDEX IF NOT EXISTS idx_businesses_onboarding_phase ON businesses(onboarding_phase);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to new tables
CREATE TRIGGER update_market_segments_updated_at BEFORE UPDATE ON market_segments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_personas_updated_at BEFORE UPDATE ON customer_personas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_strategic_responses_updated_at BEFORE UPDATE ON strategic_responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_positioning_outputs_updated_at BEFORE UPDATE ON positioning_outputs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies for new tables
ALTER TABLE market_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE positioning_outputs ENABLE ROW LEVEL SECURITY;

-- RLS policies for market_segments
CREATE POLICY "Users can view their business segments" ON market_segments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = market_segments.business_id
      AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create segments for their businesses" ON market_segments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = market_segments.business_id
      AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their business segments" ON market_segments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = market_segments.business_id
      AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their business segments" ON market_segments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = market_segments.business_id
      AND b.user_id = auth.uid()
    )
  );

-- RLS policies for customer_personas (same pattern)
CREATE POLICY "Users can view their business personas" ON customer_personas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = customer_personas.business_id
      AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create personas for their businesses" ON customer_personas
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = customer_personas.business_id
      AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their business personas" ON customer_personas
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = customer_personas.business_id
      AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their business personas" ON customer_personas
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = customer_personas.business_id
      AND b.user_id = auth.uid()
    )
  );

-- RLS policies for strategic_responses
CREATE POLICY "Users can view their business responses" ON strategic_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = strategic_responses.business_id
      AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create responses for their businesses" ON strategic_responses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = strategic_responses.business_id
      AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their business responses" ON strategic_responses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = strategic_responses.business_id
      AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their business responses" ON strategic_responses
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = strategic_responses.business_id
      AND b.user_id = auth.uid()
    )
  );

-- RLS policies for positioning_outputs
CREATE POLICY "Users can view their positioning outputs" ON positioning_outputs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = positioning_outputs.business_id
      AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create positioning for their businesses" ON positioning_outputs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = positioning_outputs.business_id
      AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their positioning outputs" ON positioning_outputs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = positioning_outputs.business_id
      AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their positioning outputs" ON positioning_outputs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = positioning_outputs.business_id
      AND b.user_id = auth.uid()
    )
  );

-- Grant permissions
GRANT ALL ON market_segments TO authenticated;
GRANT ALL ON customer_personas TO authenticated;
GRANT ALL ON strategic_responses TO authenticated;
GRANT ALL ON positioning_outputs TO authenticated;