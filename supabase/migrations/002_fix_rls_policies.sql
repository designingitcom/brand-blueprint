-- Drop existing policies that might have failed
DROP POLICY IF EXISTS "Users can access businesses they're members of" ON businesses;
DROP POLICY IF EXISTS "Users can access projects from their businesses" ON projects;
DROP POLICY IF EXISTS "Users can access user_answers from their projects" ON user_answers;
DROP POLICY IF EXISTS "Users can access ai_conversations from their projects" ON ai_conversations;
DROP POLICY IF EXISTS "Users can access responses from their projects" ON responses;
DROP POLICY IF EXISTS "Users can access brand portal sections from their projects" ON brand_portal_sections;
DROP POLICY IF EXISTS "Users can access analysis results from their projects" ON analysis_results;
DROP POLICY IF EXISTS "Users can access activations from their projects" ON activations;
DROP POLICY IF EXISTS "Users can access deliverables from their projects" ON deliverables;
DROP POLICY IF EXISTS "Users can access ai_contexts from their projects" ON ai_contexts;
DROP POLICY IF EXISTS "Users can access their memberships" ON memberships;

-- Enable RLS on all tables (in case it wasn't enabled)
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
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create proper RLS policies

-- Businesses: Users can only see businesses they're members of
CREATE POLICY "Users can view businesses they belong to"
ON businesses FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.business_id = businesses.id
    AND memberships.user_id = auth.uid()
  )
);

CREATE POLICY "Business owners can update their businesses"
ON businesses FOR UPDATE
USING (
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.business_id = businesses.id
    AND memberships.user_id = auth.uid()
    AND memberships.role IN ('owner', 'admin')
  )
);

CREATE POLICY "Users can create businesses"
ON businesses FOR INSERT
WITH CHECK (owner_id = auth.uid());

-- Projects: Access based on business membership
CREATE POLICY "Users can view projects in their businesses"
ON projects FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.business_id = projects.business_id
    AND memberships.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create projects in their businesses"
ON projects FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.business_id = projects.business_id
    AND memberships.user_id = auth.uid()
    AND memberships.role IN ('owner', 'admin', 'project_manager')
  )
);

CREATE POLICY "Users can update projects in their businesses"
ON projects FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.business_id = projects.business_id
    AND memberships.user_id = auth.uid()
    AND memberships.role IN ('owner', 'admin', 'project_manager')
  )
);

-- Memberships: Users can see their own memberships and admins can see all
CREATE POLICY "Users can view their own memberships"
ON memberships FOR SELECT
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM memberships m2
    WHERE m2.business_id = memberships.business_id
    AND m2.user_id = auth.uid()
    AND m2.role IN ('owner', 'admin')
  )
);

CREATE POLICY "Admins can manage memberships"
ON memberships FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.business_id = NEW.business_id
    AND memberships.user_id = auth.uid()
    AND memberships.role IN ('owner', 'admin')
  )
);

-- User Answers: Access based on project access
CREATE POLICY "Users can view answers in their projects"
ON user_answers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects p
    JOIN memberships m ON p.business_id = m.business_id
    WHERE p.id = user_answers.project_id
    AND m.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create answers in their projects"
ON user_answers FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM projects p
    JOIN memberships m ON p.business_id = m.business_id
    WHERE p.id = user_answers.project_id
    AND m.user_id = auth.uid()
    AND m.role IN ('owner', 'admin', 'project_manager', 'contributor')
  )
);

CREATE POLICY "Users can update their own answers"
ON user_answers FOR UPDATE
USING (user_id = auth.uid());

-- AI Conversations: Same as user_answers
CREATE POLICY "Users can view AI conversations in their projects"
ON ai_conversations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects p
    JOIN memberships m ON p.business_id = m.business_id
    WHERE p.id = ai_conversations.project_id
    AND m.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create AI conversations"
ON ai_conversations FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects p
    JOIN memberships m ON p.business_id = m.business_id
    WHERE p.id = ai_conversations.project_id
    AND m.user_id = auth.uid()
  )
);

-- Responses: Project-based access
CREATE POLICY "Users can view responses in their projects"
ON responses FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects p
    JOIN memberships m ON p.business_id = m.business_id
    WHERE p.id = responses.project_id
    AND m.user_id = auth.uid()
  )
);

CREATE POLICY "Contributors can manage responses"
ON responses FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM projects p
    JOIN memberships m ON p.business_id = m.business_id
    WHERE p.id = responses.project_id
    AND m.user_id = auth.uid()
    AND m.role IN ('owner', 'admin', 'project_manager', 'contributor')
  )
);

-- Brand Portal Sections
CREATE POLICY "Users can view brand portals in their projects"
ON brand_portal_sections FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects p
    JOIN memberships m ON p.business_id = m.business_id
    WHERE p.id = brand_portal_sections.project_id
    AND m.user_id = auth.uid()
  )
);

CREATE POLICY "Contributors can manage brand portals"
ON brand_portal_sections FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM projects p
    JOIN memberships m ON p.business_id = m.business_id
    WHERE p.id = brand_portal_sections.project_id
    AND m.user_id = auth.uid()
    AND m.role IN ('owner', 'admin', 'project_manager', 'contributor')
  )
);

-- Analysis Results
CREATE POLICY "Users can view analysis in their projects"
ON analysis_results FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects p
    JOIN memberships m ON p.business_id = m.business_id
    WHERE p.id = analysis_results.project_id
    AND m.user_id = auth.uid()
  )
);

CREATE POLICY "Contributors can create analysis"
ON analysis_results FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects p
    JOIN memberships m ON p.business_id = m.business_id
    WHERE p.id = analysis_results.project_id
    AND m.user_id = auth.uid()
    AND m.role IN ('owner', 'admin', 'project_manager', 'contributor')
  )
);

-- Activations
CREATE POLICY "Users can view activations in their projects"
ON activations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects p
    JOIN memberships m ON p.business_id = m.business_id
    WHERE p.id = activations.project_id
    AND m.user_id = auth.uid()
  )
);

CREATE POLICY "Contributors can manage activations"
ON activations FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM projects p
    JOIN memberships m ON p.business_id = m.business_id
    WHERE p.id = activations.project_id
    AND m.user_id = auth.uid()
    AND m.role IN ('owner', 'admin', 'project_manager', 'contributor')
  )
);

-- Deliverables
CREATE POLICY "Users can view deliverables in their projects"
ON deliverables FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects p
    JOIN memberships m ON p.business_id = m.business_id
    WHERE p.id = deliverables.project_id
    AND m.user_id = auth.uid()
  )
);

CREATE POLICY "Contributors can manage deliverables"
ON deliverables FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM projects p
    JOIN memberships m ON p.business_id = m.business_id
    WHERE p.id = deliverables.project_id
    AND m.user_id = auth.uid()
    AND m.role IN ('owner', 'admin', 'project_manager', 'contributor')
  )
);

-- AI Contexts
CREATE POLICY "Users can view AI contexts in their projects"
ON ai_contexts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects p
    JOIN memberships m ON p.business_id = m.business_id
    WHERE p.id = ai_contexts.project_id
    AND m.user_id = auth.uid()
  )
);

CREATE POLICY "System can manage AI contexts"
ON ai_contexts FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM projects p
    JOIN memberships m ON p.business_id = m.business_id
    WHERE p.id = ai_contexts.project_id
    AND m.user_id = auth.uid()
  )
);

-- Modules and Questions are public read (system data)
CREATE POLICY "Everyone can view modules"
ON modules FOR SELECT
USING (true);

CREATE POLICY "Everyone can view questions"
ON questions FOR SELECT
USING (true);

CREATE POLICY "Everyone can view question relationships"
ON question_relationships FOR SELECT
USING (true);

CREATE POLICY "Everyone can view strategy paths"
ON strategy_paths FOR SELECT
USING (true);

-- User roles
CREATE POLICY "Users can view their own role"
ON user_roles FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Only super admins can manage roles"
ON user_roles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  )
);