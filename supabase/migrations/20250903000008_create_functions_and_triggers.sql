-- BrandBlueprint Database Schema - Core Functions and Triggers
-- Migration 008: Business logic functions and safety triggers

-- Function to generate URL-friendly unique slugs
CREATE OR REPLACE FUNCTION generate_unique_slug(
  p_base_text TEXT,
  p_table_name TEXT,
  p_parent_field TEXT DEFAULT NULL,
  p_parent_id UUID DEFAULT NULL
) RETURNS TEXT
LANGUAGE plpgsql AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
  exists_check BOOLEAN;
BEGIN
  -- Convert to slug format
  base_slug := lower(trim(regexp_replace(p_base_text, '[^a-zA-Z0-9\s-]', '', 'g')));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  -- Ensure minimum length
  IF length(base_slug) < 1 THEN
    base_slug := 'item';
  END IF;
  
  final_slug := base_slug;
  
  -- Check for uniqueness and increment if needed
  LOOP
    IF p_parent_field IS NOT NULL AND p_parent_id IS NOT NULL THEN
      EXECUTE format('SELECT EXISTS(SELECT 1 FROM %I WHERE slug = $1 AND %I = $2)', 
                    p_table_name, p_parent_field)
      INTO exists_check
      USING final_slug, p_parent_id;
    ELSE
      EXECUTE format('SELECT EXISTS(SELECT 1 FROM %I WHERE slug = $1)', p_table_name)
      INTO exists_check
      USING final_slug;
    END IF;
    
    IF NOT exists_check THEN
      EXIT;
    END IF;
    
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Function to calculate business profile completeness
CREATE OR REPLACE FUNCTION calculate_profile_completeness(p_profile_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql AS $$
DECLARE
  total_fields INTEGER := 50; -- Adjust based on number of fields we're tracking
  completed_fields INTEGER := 0;
  profile_record RECORD;
BEGIN
  SELECT * INTO profile_record FROM business_profiles WHERE id = p_profile_id;
  
  -- Count non-null important fields
  IF profile_record.legal_name IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF profile_record.founding_year IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF profile_record.employee_count IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF profile_record.annual_revenue_min IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF profile_record.primary_contact_name IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF profile_record.primary_contact_email IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF profile_record.headquarters_city IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF profile_record.headquarters_country IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF profile_record.business_model_structured IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF profile_record.target_market IS NOT NULL AND array_length(profile_record.target_market, 1) > 0 THEN completed_fields := completed_fields + 1; END IF;
  IF profile_record.primary_products IS NOT NULL AND array_length(profile_record.primary_products, 1) > 0 THEN completed_fields := completed_fields + 1; END IF;
  IF profile_record.key_differentiators IS NOT NULL AND array_length(profile_record.key_differentiators, 1) > 0 THEN completed_fields := completed_fields + 1; END IF;
  IF profile_record.current_challenges IS NOT NULL AND array_length(profile_record.current_challenges, 1) > 0 THEN completed_fields := completed_fields + 1; END IF;
  IF profile_record.growth_goals IS NOT NULL AND array_length(profile_record.growth_goals, 1) > 0 THEN completed_fields := completed_fields + 1; END IF;
  IF profile_record.timeline_urgency_structured IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF profile_record.budget_range_structured IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  -- Add more fields as needed...
  
  RETURN ROUND((completed_fields::DECIMAL / total_fields) * 100);
END;
$$;

-- Trigger to update profile completeness
CREATE OR REPLACE FUNCTION update_profile_completeness()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profile_completeness := calculate_profile_completeness(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check for base project cycles (FIXED version)
CREATE OR REPLACE FUNCTION check_base_project_cycle() 
RETURNS TRIGGER AS $$
DECLARE
  temp_count INTEGER := 0;
BEGIN
  IF NEW.base_project_id IS NOT NULL THEN
    WITH RECURSIVE project_chain AS (
      SELECT id, base_project_id
      FROM projects
      WHERE id = NEW.base_project_id
      UNION ALL
      SELECT p.id, p.base_project_id
      FROM projects p
      JOIN project_chain pc ON p.id = pc.base_project_id
    )
    SELECT COUNT(*) INTO temp_count
    FROM project_chain
    WHERE id = NEW.id;

    IF temp_count > 0 THEN
      RAISE EXCEPTION 'Cannot create circular base project reference';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check strategy path organization match
CREATE OR REPLACE FUNCTION check_strategy_path_org() 
RETURNS TRIGGER AS $$
DECLARE
  project_org_id UUID;
  strategy_org_id UUID;
BEGIN
  IF NEW.strategy_path_id IS NOT NULL THEN
    -- Get project's organization
    SELECT c.organization_id INTO project_org_id
    FROM projects p
    JOIN clients c ON c.id = p.client_id
    WHERE p.id = NEW.id;
    
    -- Get strategy path's organization
    SELECT organization_id INTO strategy_org_id
    FROM strategy_paths
    WHERE id = NEW.strategy_path_id;
    
    -- Allow if strategy is global (NULL org) or matches project org
    IF strategy_org_id IS NOT NULL AND strategy_org_id != project_org_id THEN
      RAISE EXCEPTION 'Strategy path must belong to same organization or be global';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to apply strategy path to project
CREATE OR REPLACE FUNCTION apply_strategy_path_to_project(
  p_project_id UUID,
  p_strategy_path_id UUID,
  p_preserve_custom BOOLEAN DEFAULT FALSE
) RETURNS VOID
LANGUAGE plpgsql AS $$
BEGIN
  -- Remove existing modules if not preserving custom ones
  IF NOT p_preserve_custom THEN
    DELETE FROM project_modules 
    WHERE project_id = p_project_id;
  ELSE
    DELETE FROM project_modules 
    WHERE project_id = p_project_id 
    AND source != 'manual';
  END IF;
  
  -- Add strategy modules
  INSERT INTO project_modules (
    project_id, module_id, sort_order, visibility, 
    is_required, source, source_ref_id
  )
  SELECT 
    p_project_id,
    spm.module_id,
    spm.sort_order,
    spm.default_visibility,
    spm.is_required,
    'strategy',
    spm.id
  FROM strategy_path_modules spm
  WHERE spm.strategy_path_id = p_strategy_path_id
  ON CONFLICT (project_id, module_id) DO UPDATE SET
    sort_order = EXCLUDED.sort_order,
    visibility = EXCLUDED.visibility,
    is_required = EXCLUDED.is_required,
    source = EXCLUDED.source,
    source_ref_id = EXCLUDED.source_ref_id;
END;
$$;

-- Function to check module dependencies
CREATE OR REPLACE FUNCTION can_start_module(
  p_project_id UUID,
  p_module_id UUID
) RETURNS TABLE(
  can_start BOOLEAN,
  reason TEXT,
  blocking_modules UUID[]
)
LANGUAGE plpgsql AS $$
DECLARE
  blocking_deps UUID[];
  requires_deps UUID[];
  recommends_deps UUID[];
BEGIN
  -- Get blocking dependencies (must be approved)
  SELECT array_agg(md.depends_on_module_id) INTO blocking_deps
  FROM module_dependencies md
  JOIN project_modules pm ON pm.module_id = md.depends_on_module_id 
    AND pm.project_id = p_project_id
  WHERE md.module_id = p_module_id 
    AND md.dependency_type = 'blocks'
    AND pm.status != 'approved';
    
  -- Get requires dependencies (must be completed)
  SELECT array_agg(md.depends_on_module_id) INTO requires_deps
  FROM module_dependencies md
  JOIN project_modules pm ON pm.module_id = md.depends_on_module_id 
    AND pm.project_id = p_project_id
  WHERE md.module_id = p_module_id 
    AND md.dependency_type = 'requires'
    AND pm.status NOT IN ('approved', 'locked');
    
  -- Check blocking dependencies first
  IF blocking_deps IS NOT NULL AND array_length(blocking_deps, 1) > 0 THEN
    RETURN QUERY SELECT false, 'Blocked by unapproved modules', blocking_deps;
    RETURN;
  END IF;
  
  -- Check required dependencies
  IF requires_deps IS NOT NULL AND array_length(requires_deps, 1) > 0 THEN
    RETURN QUERY SELECT false, 'Required modules not completed', requires_deps;
    RETURN;
  END IF;
  
  -- Module can be started
  RETURN QUERY SELECT true, 'Module can be started', ARRAY[]::UUID[];
END;
$$;

-- Audit changes function (FIXED version)
CREATE OR REPLACE FUNCTION audit_changes()
RETURNS TRIGGER AS $$
DECLARE
  old_data JSONB;
  new_data JSONB;
  diff_data JSONB;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);

    SELECT jsonb_object_agg(
             e.key,
             jsonb_build_object(
               'old', old_data -> e.key,
               'new', new_data -> e.key
             )
           )
      INTO diff_data
      FROM jsonb_each(new_data) AS e
      WHERE old_data -> e.key IS DISTINCT FROM new_data -> e.key;

  ELSE
    diff_data := to_jsonb(COALESCE(NEW, OLD));
  END IF;

  INSERT INTO audit_logs (
    actor_id, action, entity_type, entity_id, diff_json, ip, user_agent
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    diff_data,
    current_setting('request.headers', true)::json->>'x-forwarded-for',
    current_setting('request.headers', true)::json->>'user-agent'
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_profile_completeness_trigger
  BEFORE INSERT OR UPDATE ON business_profiles
  FOR EACH ROW EXECUTE FUNCTION update_profile_completeness();

CREATE TRIGGER check_base_project_cycle_trigger
  BEFORE INSERT OR UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION check_base_project_cycle();

CREATE TRIGGER check_strategy_path_org_trigger
  BEFORE INSERT OR UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION check_strategy_path_org();

-- Add audit triggers to key tables
CREATE TRIGGER audit_projects_trigger
  AFTER INSERT OR UPDATE OR DELETE ON projects
  FOR EACH ROW EXECUTE FUNCTION audit_changes();

CREATE TRIGGER audit_answers_trigger
  AFTER INSERT OR UPDATE OR DELETE ON answers
  FOR EACH ROW EXECUTE FUNCTION audit_changes();

CREATE TRIGGER audit_deliverables_trigger
  AFTER INSERT OR UPDATE OR DELETE ON deliverables
  FOR EACH ROW EXECUTE FUNCTION audit_changes();