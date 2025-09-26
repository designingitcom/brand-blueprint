-- Strategic Onboarding Database Schema
-- Creates tables for segments, personas, strategic questions, and positioning data

-- Market Segments Table
CREATE TABLE IF NOT EXISTS market_segments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  characteristics JSONB,
  pain_points JSONB,
  opportunities JSONB,
  industry TEXT,
  business_type TEXT,
  employee_range TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer Personas Table
CREATE TABLE IF NOT EXISTS customer_personas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  age_range TEXT,
  description TEXT,
  characteristics JSONB,
  pain_points JSONB,
  goals JSONB,
  reads_follows JSONB,
  triggers JSONB,
  segment_id UUID REFERENCES market_segments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Strategic Questions Template
CREATE TABLE IF NOT EXISTS strategic_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  question_text TEXT NOT NULL,
  description TEXT,
  question_type TEXT CHECK (question_type IN ('text', 'radio', 'textarea', 'slider', 'multi_select')),
  options JSONB, -- For radio buttons, dropdowns, etc.
  placeholder_text TEXT,
  help_text TEXT,
  ai_suggestion_prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Strategic Responses
CREATE TABLE IF NOT EXISTS business_strategic_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  project_id UUID, -- References projects table when available

  -- Segment & Persona Selection
  selected_segment_id UUID REFERENCES market_segments(id),
  selected_persona_id UUID REFERENCES customer_personas(id),
  custom_segment TEXT,
  custom_persona TEXT,

  -- Strategic Question Responses
  question_responses JSONB DEFAULT '{}'::jsonb,
  -- Format: {"1": {"answer": "...", "confidence": "high", "ai_suggestion": "..."}, ...}

  -- AI Analysis and Suggestions
  ai_segment_suggestions JSONB,
  ai_persona_suggestions JSONB,
  ai_positioning_analysis JSONB,

  -- Positioning Output
  positioning_statement TEXT,
  positioning_strength JSONB,
  -- Format: {"problem_clarity": 85, "segment_focus": 100, "unique_position": 80, "value_clarity": 90, "overall": 88}

  -- Session Tracking
  onboarding_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  onboarding_completed_at TIMESTAMP WITH TIME ZONE,
  current_step INTEGER DEFAULT 1,
  time_spent_minutes INTEGER DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default strategic questions (the 15 key questions)
INSERT INTO strategic_questions (question_number, title, question_text, description, question_type, placeholder_text, ai_suggestion_prompt) VALUES
(1, 'The Expensive Problem', 'What expensive problem does your target customer face?', 'Identify the costly pain point your solution addresses', 'textarea', 'Describe the specific problem that costs your customers money, time, or opportunities...', 'Based on the selected persona and business type, suggest expensive problems this customer segment typically faces'),

(2, 'The Category Context', 'When your customer looks for solutions, what do they search for?', 'Understand how customers categorize and search for solutions like yours', 'text', 'e.g., marketing automation, business consulting, web development...', 'Analyze the competitive landscape and suggest relevant category terms customers use when searching'),

(3, 'The Hidden Obstacle', 'What stops your customer from solving this themselves?', 'Identify the barriers that prevent self-service solutions', 'multi_select', '', 'Suggest common obstacles based on the customer persona and problem type'),

(4, 'The Transformation Desired', 'If this problem vanished, what would your customer achieve?', 'Define the ultimate outcome or transformation', 'textarea', 'Describe the ideal future state when the problem is completely solved...', 'Based on the problem and persona, suggest specific measurable outcomes and transformations'),

(5, 'Identity Markers', 'How does your target customer see themselves?', 'Understand customer self-perception and identity', 'textarea', 'They are the type of person who...', 'Suggest identity traits, values, and characteristics based on the selected persona'),

(6, 'The Trigger Moment', 'What happens right before your customer looks for you?', 'Identify the catalyst moment that drives purchase intent', 'textarea', 'Describe the specific event or realization that triggers the search...', 'Suggest common trigger events for this persona and problem combination'),

(7, 'Your Core Identity', 'Complete: "We are the [role] who [unique action]"', 'Define your unique position and role in the market', 'text', 'We are the strategists who work in real-time...', 'Based on services and differentiation, suggest unique identity positioning'),

(8, 'Non-Negotiable Values', 'What will you ALWAYS do, even if costly?', 'Define your core values and principles', 'multi_select', '', 'Suggest values that align with customer needs and create differentiation'),

(9, 'Your Contrarian Belief', 'What do you believe about solving this problem that others don''t?', 'Identify your unique perspective or contrarian view', 'textarea', 'While everyone believes X, we believe Y because...', 'Suggest contrarian beliefs based on industry norms and unique positioning opportunities'),

(10, 'Strategic Sacrifice', 'What part of the market will you deliberately NOT serve?', 'Define what you will exclude to strengthen your position', 'textarea', 'We deliberately don''t serve X because it would prevent Y...', 'Suggest strategic exclusions that strengthen positioning with the target segment'),

(11, 'Real Alternatives', 'What would your customer do without you?', 'Understand the competitive landscape and alternatives', 'textarea', 'They would likely try to...', 'Suggest realistic alternatives and explain why they typically fail'),

(12, 'The Only Position', 'Complete: "We are the only ones who..."', 'Define your unique and defensible market position', 'text', 'We are the only platform that...', 'Suggest unique positioning based on capabilities and market analysis'),

(13, 'Decision Driver', 'What makes your customer choose YOU over alternatives?', 'Identify the primary decision factors', 'multi_select', '', 'Suggest rational, emotional, and social drivers based on persona and positioning'),

(14, 'Unique Value Created', 'What specific VALUE do you create that others can''t?', 'Define measurable unique value proposition', 'textarea', 'We create X that is impossible with alternatives because...', 'Suggest specific, measurable value propositions based on unique positioning'),

(15, 'Success Metrics', 'How will you measure winning?', 'Define clear success metrics and timeline', 'text', 'We will achieve X by Y timeframe...', 'Suggest realistic metrics and timelines based on business stage and goals');

-- Add extended business fields for better strategic analysis
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS business_model TEXT CHECK (business_model IN ('Subscription', 'One-time', 'Retainer', 'Commission', 'Freemium', 'Marketplace'));
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS avg_customer_ltv TEXT CHECK (avg_customer_ltv IN ('<$1K', '$1-10K', '$10-100K', '$100K+', 'Not sure'));
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS primary_goal TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS custom_industry TEXT;

-- Update existing competitors format to include notes
ALTER TABLE businesses ALTER COLUMN competitors TYPE JSONB USING
  CASE
    WHEN competitors IS NULL THEN '[]'::jsonb
    WHEN jsonb_typeof(competitors) = 'array' AND jsonb_array_length(competitors) > 0 AND jsonb_typeof(competitors->0) = 'string' THEN
      (SELECT jsonb_agg(jsonb_build_object('url', value, 'notes', '')) FROM jsonb_array_elements_text(competitors) AS value)
    ELSE competitors
  END;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_market_segments_industry ON market_segments(industry);
CREATE INDEX IF NOT EXISTS idx_customer_personas_segment ON customer_personas(segment_id);
CREATE INDEX IF NOT EXISTS idx_strategic_responses_business ON business_strategic_responses(business_id);
CREATE INDEX IF NOT EXISTS idx_strategic_responses_status ON business_strategic_responses(status);
CREATE INDEX IF NOT EXISTS idx_strategic_questions_number ON strategic_questions(question_number);

-- Enable RLS
ALTER TABLE market_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_strategic_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Market segments and personas are publicly readable for onboarding
CREATE POLICY "Market segments are publicly readable" ON market_segments FOR SELECT USING (true);
CREATE POLICY "Customer personas are publicly readable" ON customer_personas FOR SELECT USING (true);
CREATE POLICY "Strategic questions are publicly readable" ON strategic_questions FOR SELECT USING (true);

-- Strategic responses follow business ownership
CREATE POLICY "Users can manage their business strategic responses" ON business_strategic_responses
  FOR ALL USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_market_segments_updated_at BEFORE UPDATE ON market_segments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_personas_updated_at BEFORE UPDATE ON customer_personas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_strategic_questions_updated_at BEFORE UPDATE ON strategic_questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_strategic_responses_updated_at BEFORE UPDATE ON business_strategic_responses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();