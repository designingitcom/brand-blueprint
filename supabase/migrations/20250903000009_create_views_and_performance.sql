-- BrandBlueprint Database Schema - Views and Performance Optimization
-- Migration 009: Materialized views, helper views, and performance indexes

-- Project M1 answers (from own project or base project)
CREATE OR REPLACE VIEW project_m1_answers AS
SELECT 
  p.id as project_id,
  COALESCE(base_p.id, p.id) as m1_source_project_id,
  a.id,
  a.question_id,
  a.value_json,
  a.status,
  a.confidence,
  a.source,
  a.updated_by,
  a.updated_at,
  a.created_at
FROM projects p
LEFT JOIN projects base_p ON base_p.id = p.base_project_id
LEFT JOIN answers a ON a.project_id = COALESCE(base_p.id, p.id)
LEFT JOIN questions q ON q.id = a.question_id
LEFT JOIN modules m ON m.id = q.module_id
WHERE m.code = 'm1-core';

-- Comprehensive project overview
CREATE OR REPLACE VIEW project_complete_overview AS
SELECT 
  p.*,
  c.name as client_name,
  c.slug as client_slug,
  c.organization_id,
  bp.onboarding_completed,
  bp.profile_completeness,
  bp.budget_range_structured,
  bp.timeline_urgency_structured,
  sp.name as strategy_path_name,
  sp.code as strategy_path_code,
  COUNT(DISTINCT pm.id) as total_modules,
  COUNT(DISTINCT CASE WHEN pm.status = 'approved' THEN pm.id END) as completed_modules,
  COUNT(DISTINCT CASE WHEN pm.status = 'in_progress' THEN pm.id END) as in_progress_modules,
  ROUND((COUNT(DISTINCT CASE WHEN pm.status = 'approved' THEN pm.id END)::NUMERIC / 
         NULLIF(COUNT(DISTINCT pm.id), 0)) * 100, 2) as completion_percentage
FROM projects p
JOIN clients c ON c.id = p.client_id
LEFT JOIN business_profiles bp ON bp.client_id = c.id
LEFT JOIN strategy_paths sp ON sp.id = p.strategy_path_id
LEFT JOIN project_modules pm ON pm.project_id = p.id
GROUP BY p.id, c.id, c.name, c.slug, c.organization_id, 
         bp.onboarding_completed, bp.profile_completeness, 
         bp.budget_range_structured, bp.timeline_urgency_structured,
         sp.name, sp.code;

-- Module details with source information
CREATE OR REPLACE VIEW project_module_details AS
SELECT 
  pm.*,
  p.strategy_mode,
  m.name as module_name,
  m.code as module_code,
  m.category as module_category,
  m.description as module_description,
  CASE pm.source
    WHEN 'strategy' THEN 'From: ' || COALESCE(sp.name, 'Strategy')
    WHEN 'template' THEN 'From: ' || COALESCE(ms.name, 'Template')
    ELSE 'Manually added'
  END as source_description,
  sp.name as source_strategy_name,
  ms.name as source_template_name
FROM project_modules pm
JOIN projects p ON p.id = pm.project_id
JOIN modules m ON m.id = pm.module_id
LEFT JOIN strategy_path_modules spm ON spm.id = pm.source_ref_id AND pm.source = 'strategy'
LEFT JOIN strategy_paths sp ON sp.id = spm.strategy_path_id
LEFT JOIN module_set_modules msm ON msm.id = pm.source_ref_id AND pm.source = 'template'
LEFT JOIN module_sets ms ON ms.id = msm.module_set_id;

-- Materialized view for dashboard performance
CREATE MATERIALIZED VIEW project_progress_summary AS
SELECT 
  p.id as project_id,
  p.client_id,
  c.organization_id,
  p.name as project_name,
  p.slug as project_slug,
  p.strategy_mode,
  c.name as client_name,
  c.slug as client_slug,
  COUNT(DISTINCT pm.id) as total_modules,
  COUNT(DISTINCT CASE WHEN pm.status = 'approved' THEN pm.id END) as completed_modules,
  COUNT(DISTINCT CASE WHEN pm.status = 'in_progress' THEN pm.id END) as in_progress_modules,
  COUNT(DISTINCT CASE WHEN pm.status = 'not_started' THEN pm.id END) as pending_modules,
  ROUND((COUNT(DISTINCT CASE WHEN pm.status = 'approved' THEN pm.id END)::NUMERIC / 
         NULLIF(COUNT(DISTINCT pm.id), 0)) * 100, 2) as module_completion_pct,
  MAX(pm.updated_at) as last_activity,
  COUNT(DISTINCT d.id) as total_deliverables,
  COUNT(DISTINCT CASE WHEN d.status = 'published' THEN d.id END) as published_deliverables
FROM projects p
JOIN clients c ON c.id = p.client_id
LEFT JOIN project_modules pm ON pm.project_id = p.id
LEFT JOIN deliverables d ON d.project_id = p.id
WHERE p.status = 'active'
GROUP BY p.id, p.client_id, c.organization_id, p.name, p.slug, 
         p.strategy_mode, c.name, c.slug;

-- Create unique index on materialized view
CREATE UNIQUE INDEX idx_project_progress_summary_project_id ON project_progress_summary(project_id);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_project_progress()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY project_progress_summary;
END;
$$ LANGUAGE plpgsql;

-- Organization dashboard view
CREATE OR REPLACE VIEW organization_dashboard AS
SELECT 
  o.id,
  o.name,
  o.slug,
  COUNT(DISTINCT c.id) as total_clients,
  COUNT(DISTINCT p.id) as total_projects,
  COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'active') as active_projects,
  COUNT(DISTINCT bp.id) FILTER (WHERE bp.onboarding_completed = true) as completed_onboarding,
  AVG(bp.profile_completeness) as avg_profile_completeness,
  COUNT(DISTINCT m.id) as total_memberships,
  COUNT(DISTINCT pm.id) as total_modules_in_progress,
  COUNT(DISTINCT d.id) as total_deliverables
FROM organizations o
LEFT JOIN clients c ON c.organization_id = o.id
LEFT JOIN business_profiles bp ON bp.client_id = c.id
LEFT JOIN projects p ON p.client_id = c.id
LEFT JOIN memberships m ON m.organization_id = o.id
LEFT JOIN project_modules pm ON pm.project_id = p.id AND pm.status = 'in_progress'
LEFT JOIN deliverables d ON d.project_id = p.id
GROUP BY o.id, o.name, o.slug;

-- 6-Question framework summary view
CREATE OR REPLACE VIEW project_sixq_summary AS
SELECT 
  p.id as project_id,
  p.name as project_name,
  COUNT(pcv.id) as answered_questions,
  COUNT(pcv.id) FILTER (WHERE pcv.status = 'approved') as approved_answers,
  COUNT(ff.id) as total_framework_fields,
  ROUND((COUNT(pcv.id)::NUMERIC / COUNT(ff.id)) * 100, 2) as completion_percentage
FROM projects p
CROSS JOIN frameworks f
CROSS JOIN framework_fields ff
LEFT JOIN project_canonical_values pcv ON pcv.project_id = p.id 
  AND pcv.framework_field_id = ff.id
WHERE f.code = 'sixq' AND ff.framework_id = f.id
GROUP BY p.id, p.name;

-- Performance indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_client_status ON projects(client_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_modules_project_status ON project_modules(project_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_business_profiles_org_incomplete ON business_profiles(client_id) 
  WHERE onboarding_completed = FALSE;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_answers_project_question ON answers(project_id, question_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deliverables_project_status ON deliverables(project_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_runs_project_created ON ai_runs(project_id, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_org_created ON events(organization_id, created_at);

-- Partial indexes for active records
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_strategy_paths_active ON strategy_paths(organization_id, is_active) 
  WHERE is_active = TRUE;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_modules_active ON modules(sort_order) 
  WHERE is_active = TRUE;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_active ON subscriptions(organization_id, status) 
  WHERE status = 'active';

-- Composite indexes for dashboard queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_modules_completion ON project_modules(project_id, status, completed_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_org_created ON clients(organization_id, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_client_created ON projects(client_id, created_at) 
  WHERE status = 'active';

-- Index for URL routing
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_org_slug ON clients(organization_id, slug);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_client_slug ON projects(client_id, slug);

-- Comment on materialized view maintenance
COMMENT ON MATERIALIZED VIEW project_progress_summary IS 
'Dashboard performance view. Refresh with: SELECT refresh_project_progress(); 
Recommended refresh frequency: every 15 minutes or on significant project updates.';