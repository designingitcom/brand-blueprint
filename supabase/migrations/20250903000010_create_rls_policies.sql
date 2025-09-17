-- BrandBlueprint Database Schema - Row Level Security Policies  
-- Migration 010: Complete RLS setup for multi-tenant security

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_path_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_set_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_question_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE framework_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE framework_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_canonical_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverable_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION auth.user_organizations()
RETURNS SETOF UUID AS $$
BEGIN
    RETURN QUERY
    SELECT m.organization_id
    FROM memberships m
    WHERE m.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.is_org_admin(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM memberships m
        WHERE m.organization_id = org_id
        AND m.user_id = auth.uid()
        AND m.role IN ('owner', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.has_project_access(proj_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM projects p
        JOIN clients c ON c.id = p.client_id
        JOIN memberships m ON m.organization_id = c.organization_id
        WHERE p.id = proj_id
        AND m.user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Organizations policies
CREATE POLICY "Users can view organizations they belong to" ON organizations
    FOR SELECT USING (id IN (SELECT auth.user_organizations()));

CREATE POLICY "Organization owners/admins can update their organization" ON organizations
    FOR UPDATE USING (auth.is_org_admin(id));

CREATE POLICY "Organization owners/admins can delete their organization" ON organizations
    FOR DELETE USING (auth.is_org_admin(id));

-- Users policies  
CREATE POLICY "Users can view users in their organizations" ON users
    FOR SELECT USING (
        id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM memberships m1
            JOIN memberships m2 ON m1.organization_id = m2.organization_id
            WHERE m1.user_id = auth.uid() AND m2.user_id = users.id
        )
    );

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (id = auth.uid());

-- Membership policies
CREATE POLICY "Users can view memberships in their organizations" ON memberships
    FOR SELECT USING (
        user_id = auth.uid() OR
        organization_id IN (SELECT auth.user_organizations())
    );

CREATE POLICY "Organization admins can manage memberships" ON memberships
    FOR ALL USING (auth.is_org_admin(organization_id));

-- Invites policies
CREATE POLICY "Organization members can view invites" ON invites
    FOR SELECT USING (organization_id IN (SELECT auth.user_organizations()));

CREATE POLICY "Organization admins can manage invites" ON invites
    FOR ALL USING (auth.is_org_admin(organization_id));

-- Clients policies
CREATE POLICY "Users can view clients in their organizations" ON clients
    FOR SELECT USING (organization_id IN (SELECT auth.user_organizations()));

CREATE POLICY "Organization members can manage clients" ON clients
    FOR ALL USING (organization_id IN (SELECT auth.user_organizations()));

-- Business profiles policies
CREATE POLICY "Users can view business profiles for accessible clients" ON business_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clients c
            WHERE c.id = business_profiles.client_id
            AND c.organization_id IN (SELECT auth.user_organizations())
        )
    );

CREATE POLICY "Organization members can manage business profiles" ON business_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM clients c
            WHERE c.id = business_profiles.client_id
            AND c.organization_id IN (SELECT auth.user_organizations())
        )
    );

-- Projects policies
CREATE POLICY "Users can view projects they have access to" ON projects
    FOR SELECT USING (auth.has_project_access(id));

CREATE POLICY "Organization members can manage projects" ON projects
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM clients c
            WHERE c.id = projects.client_id
            AND c.organization_id IN (SELECT auth.user_organizations())
        )
    );

-- Strategy paths policies
CREATE POLICY "Users can view strategy paths for their organizations or global" ON strategy_paths
    FOR SELECT USING (
        organization_id IS NULL OR 
        organization_id IN (SELECT auth.user_organizations())
    );

CREATE POLICY "Organization admins can manage strategy paths" ON strategy_paths
    FOR ALL USING (
        organization_id IN (SELECT auth.user_organizations()) AND
        auth.is_org_admin(organization_id)
    );

-- Modules policies (public read for active modules)
CREATE POLICY "Anyone can view active modules" ON modules
    FOR SELECT USING (is_active = true);

-- Questions policies (public read for active questions)
CREATE POLICY "Anyone can view active questions" ON questions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM modules m WHERE m.id = questions.module_id AND m.is_active = true)
    );

-- Project modules policies
CREATE POLICY "Users can view project modules for accessible projects" ON project_modules
    FOR SELECT USING (auth.has_project_access(project_id));

CREATE POLICY "Project members can manage project modules" ON project_modules
    FOR ALL USING (auth.has_project_access(project_id));

-- Answers policies
CREATE POLICY "Users can view answers for accessible projects" ON answers
    FOR SELECT USING (auth.has_project_access(project_id));

CREATE POLICY "Project members can manage answers" ON answers
    FOR ALL USING (auth.has_project_access(project_id));

-- Answer revisions policies
CREATE POLICY "Users can view answer revisions for accessible answers" ON answer_revisions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM answers a
            WHERE a.id = answer_revisions.answer_id
            AND auth.has_project_access(a.project_id)
        )
    );

-- Project canonical values policies
CREATE POLICY "Users can view canonical values for accessible projects" ON project_canonical_values
    FOR SELECT USING (auth.has_project_access(project_id));

CREATE POLICY "Project members can manage canonical values" ON project_canonical_values
    FOR ALL USING (auth.has_project_access(project_id));

-- AI policies
CREATE POLICY "Users can view AI policies for their scope" ON ai_policies
    FOR SELECT USING (
        (scope = 'org' AND scope_id IN (SELECT auth.user_organizations())) OR
        (scope = 'project' AND auth.has_project_access(scope_id))
    );

CREATE POLICY "Organization admins can manage AI policies" ON ai_policies
    FOR ALL USING (
        (scope = 'org' AND auth.is_org_admin(scope_id)) OR
        (scope = 'project' AND auth.has_project_access(scope_id))
    );

-- AI runs policies
CREATE POLICY "Users can view AI runs for accessible projects" ON ai_runs
    FOR SELECT USING (auth.has_project_access(project_id));

CREATE POLICY "Project members can manage AI runs" ON ai_runs
    FOR ALL USING (auth.has_project_access(project_id));

-- Deliverables policies
CREATE POLICY "Users can view deliverables for accessible projects" ON deliverables
    FOR SELECT USING (auth.has_project_access(project_id));

CREATE POLICY "Project members can manage deliverables" ON deliverables
    FOR ALL USING (auth.has_project_access(project_id));

-- Files policies
CREATE POLICY "Users can view files for their organizations" ON files
    FOR SELECT USING (organization_id IN (SELECT auth.user_organizations()));

CREATE POLICY "Organization members can manage files" ON files
    FOR ALL USING (organization_id IN (SELECT auth.user_organizations()));

-- Events policies
CREATE POLICY "Users can view events for their organizations" ON events
    FOR SELECT USING (organization_id IN (SELECT auth.user_organizations()));

CREATE POLICY "Organization members can create events" ON events
    FOR INSERT WITH CHECK (organization_id IN (SELECT auth.user_organizations()));

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (recipient_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (recipient_id = auth.uid());

-- Subscriptions policies
CREATE POLICY "Users can view subscriptions for their organizations" ON subscriptions
    FOR SELECT USING (organization_id IN (SELECT auth.user_organizations()));

CREATE POLICY "Organization owners can manage subscriptions" ON subscriptions
    FOR ALL USING (
        organization_id IN (SELECT auth.user_organizations()) AND
        EXISTS (
            SELECT 1 FROM memberships m
            WHERE m.organization_id = subscriptions.organization_id
            AND m.user_id = auth.uid()
            AND m.role = 'owner'
        )
    );

-- Public policies for system tables
CREATE POLICY "Anyone can view plans" ON plans FOR SELECT USING (true);
CREATE POLICY "Anyone can view frameworks" ON frameworks FOR SELECT USING (true);
CREATE POLICY "Anyone can view framework fields" ON framework_fields FOR SELECT USING (true);
CREATE POLICY "Anyone can view framework bindings" ON framework_bindings FOR SELECT USING (true);
CREATE POLICY "Anyone can view module dependencies" ON module_dependencies FOR SELECT USING (true);
CREATE POLICY "Anyone can view question options" ON question_options FOR SELECT USING (true);
CREATE POLICY "Anyone can view question dependencies" ON question_dependencies FOR SELECT USING (true);
CREATE POLICY "Anyone can view block library" ON block_library FOR SELECT USING (true);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;