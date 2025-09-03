-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- User roles for admin functionality
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role TEXT NOT NULL DEFAULT 'user', -- 'user', 'admin', 'super_admin'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Core business entities with proper multi-tenancy
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL DEFAULT 'in_house', -- 'agency' or 'in_house'
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL DEFAULT auth.uid(),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Membership table for multi-user access
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'project_manager', 'contributor', 'client', 'viewer'
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(business_id, user_id)
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL, -- Inherited from business
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, slug)
);

-- Module system
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  prerequisites UUID[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  module_type TEXT DEFAULT 'standard', -- 'standard', 'specialized'
  category TEXT NOT NULL, -- 'foundation', 'brand', 'customer', 'messaging', 'website', 'execution'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions with 6-part framework
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  
  -- Core question data
  title TEXT NOT NULL,
  question_type TEXT NOT NULL, -- 'text', 'dropdown', 'multiselect', 'slider', 'card_sorting', 'moodboard', 'scenario_branching'
  sort_order INTEGER DEFAULT 0,
  prerequisites UUID[] DEFAULT '{}',
  
  -- 6-Part Framework Fields
  definition TEXT NOT NULL,           -- "What this means, in plain terms"
  examples TEXT[] DEFAULT '{}',       -- Array of real-world examples
  demonstrations JSONB DEFAULT '{}',  -- Visual/interactive demonstrations
  why_it_matters TEXT NOT NULL,       -- Downstream impact explanation
  simple_terms TEXT NOT NULL,         -- Kid-friendly restatement
  confidence_calibration_enabled BOOLEAN DEFAULT true,
  
  -- Technical config
  ai_assistance_enabled BOOLEAN DEFAULT true,
  validation_rules JSONB DEFAULT '{}',
  ui_config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Question relationships and dependencies (manually created mapping graph)
CREATE TABLE question_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  target_question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL, -- 'prerequisite', 'feeds_forward', 'validates', 'blocks'
  weight DECIMAL DEFAULT 1.0, -- Importance weight for AI context
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_question_id, target_question_id, relationship_type)
);

-- LEFT PANEL: User workspace for answers
CREATE TABLE user_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL, -- For RLS
  
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  version_number INTEGER, -- 1, 2, 3 for multiple attempts
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RIGHT PANEL: AI assistant conversation
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id), -- NULL for AI messages
  tenant_id UUID NOT NULL, -- For RLS
  
  message_type TEXT NOT NULL, -- 'ai_suggestion', 'user_chat', 'ai_chat'
  content TEXT NOT NULL,
  
  -- AI processing details
  ai_context JSONB, -- Context sent to LLM
  ai_model TEXT,
  ai_tokens_used INTEGER,
  ai_cost DECIMAL(10,4), -- Cost in USD from OpenRouter
  
  -- Conversation threading
  parent_message_id UUID REFERENCES ai_conversations(id),
  conversation_turn INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Main responses table points to approved user answer
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL, -- For RLS
  
  approved_answer_id UUID REFERENCES user_answers(id), -- Points to left panel
  status TEXT DEFAULT 'unanswered', -- 'unanswered', 'draft', 'ai_suggested', 'in_review', 'approved'
  confidence_score INTEGER CHECK (confidence_score >= 1 AND confidence_score <= 10),
  needs_review BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, question_id)
);

-- Strategy paths and module groupings
CREATE TABLE strategy_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- 'Startup Path', 'Growth Path', 'Enterprise Path', 'Agency Path'
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  target_audience TEXT, -- 'startups', 'growth_companies', 'enterprises', 'agencies'
  module_sequence UUID[] NOT NULL, -- Ordered array of module IDs
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brand portal sections (20 components across 5 sections)
CREATE TABLE brand_portal_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  section_type TEXT NOT NULL, -- 'brand_strategy', 'verbal_identity', 'visual_identity', 'customer_intelligence', 'brand_applications'
  component_type TEXT NOT NULL, -- 'purpose', 'positioning', 'tagline', 'logo', etc.
  content JSONB NOT NULL,
  assets JSONB DEFAULT '{}', -- File URLs, images, documents
  is_completed BOOLEAN DEFAULT false,
  last_updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, section_type, component_type)
);

-- Analysis results from n8n workflows (competitor auditor, business analyzer)
CREATE TABLE analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  analysis_type TEXT NOT NULL, -- 'competitor_analysis', 'website_audit', 'seo_analysis'
  target_url TEXT,
  workflow_id TEXT, -- n8n workflow identifier
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  results JSONB, -- Analysis results from n8n
  triggered_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Activations and post-strategy executions (activation marketplace)
CREATE TABLE activations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  activation_type TEXT NOT NULL, -- 'seo_plan', 'content_calendar', 'ad_campaign', 'email_sequence'
  focus_area TEXT NOT NULL, -- 'seo', 'content', 'advertising', 'email', 'social'
  sub_area TEXT, -- 'local_seo', 'on_page', 'hook_writing', etc.
  status TEXT DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
  brief JSONB, -- Activation brief and requirements
  deliverables JSONB, -- Generated deliverables
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deliverables and exports
CREATE TABLE deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'brand_guide', 'strategy_report', 'activation_brief'
  format TEXT NOT NULL, -- 'markdown', 'pdf', 'html'
  content JSONB NOT NULL,
  file_url TEXT,
  status TEXT DEFAULT 'draft', -- 'draft', 'generating', 'ready'
  version INTEGER DEFAULT 1,
  generated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI context and embeddings for RAG system
CREATE TABLE ai_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  content_type TEXT NOT NULL, -- 'response', 'analysis', 'brand_section'
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  embedding VECTOR(1536), -- OpenAI embedding dimension
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_portal_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only access data from businesses they're members of)
CREATE POLICY "Users can access businesses they're members of" 
ON businesses FOR ALL 
USING (
  id IN (
    SELECT business_id FROM memberships 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can access projects from their businesses" 
ON projects FOR ALL 
USING (
  business_id IN (
    SELECT business_id FROM memberships 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can access user_answers from their projects" 
ON user_answers FOR ALL 
USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN memberships m ON p.business_id = m.business_id
    WHERE m.user_id = auth.uid()
  )
);

CREATE POLICY "Users can access ai_conversations from their projects" 
ON ai_conversations FOR ALL 
USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN memberships m ON p.business_id = m.business_id
    WHERE m.user_id = auth.uid()
  )
);

CREATE POLICY "Users can access responses from their projects" 
ON responses FOR ALL 
USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN memberships m ON p.business_id = m.business_id
    WHERE m.user_id = auth.uid()
  )
);

CREATE POLICY "Users can access brand portal sections from their projects" 
ON brand_portal_sections FOR ALL 
USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN memberships m ON p.business_id = m.business_id
    WHERE m.user_id = auth.uid()
  )
);

CREATE POLICY "Users can access analysis results from their projects" 
ON analysis_results FOR ALL 
USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN memberships m ON p.business_id = m.business_id
    WHERE m.user_id = auth.uid()
  )
);

CREATE POLICY "Users can access activations from their projects" 
ON activations FOR ALL 
USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN memberships m ON p.business_id = m.business_id
    WHERE m.user_id = auth.uid()
  )
);

CREATE POLICY "Users can access deliverables from their projects" 
ON deliverables FOR ALL 
USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN memberships m ON p.business_id = m.business_id
    WHERE m.user_id = auth.uid()
  )
);

CREATE POLICY "Users can access ai_contexts from their projects" 
ON ai_contexts FOR ALL 
USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN memberships m ON p.business_id = m.business_id
    WHERE m.user_id = auth.uid()
  )
);

CREATE POLICY "Users can access their memberships" 
ON memberships FOR ALL 
USING (
  user_id = auth.uid() OR
  business_id IN (
    SELECT business_id FROM memberships 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

-- Create indexes for performance
CREATE INDEX idx_businesses_owner ON businesses(owner_id);
CREATE INDEX idx_businesses_slug ON businesses(slug);
CREATE INDEX idx_memberships_user ON memberships(user_id);
CREATE INDEX idx_memberships_business ON memberships(business_id);
CREATE INDEX idx_projects_business ON projects(business_id);
CREATE INDEX idx_projects_slug ON projects(business_id, slug);
CREATE INDEX idx_questions_module ON questions(module_id);
CREATE INDEX idx_user_answers_project ON user_answers(project_id);
CREATE INDEX idx_user_answers_question ON user_answers(question_id);
CREATE INDEX idx_responses_project ON responses(project_id);
CREATE INDEX idx_responses_question ON responses(question_id);
CREATE INDEX idx_brand_portal_project ON brand_portal_sections(project_id);
CREATE INDEX idx_ai_contexts_project ON ai_contexts(project_id);
CREATE INDEX idx_ai_contexts_embedding ON ai_contexts USING ivfflat (embedding vector_cosine_ops);