-- BrandBlueprint Database Schema - Strategy Path System
-- Migration 004: Strategy paths and module system foundation

-- Strategy paths (predefined module sequences)
CREATE TABLE strategy_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    target_audience TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Org-scoped unique strategy codes (allows NULL org for global templates)
CREATE UNIQUE INDEX strategy_paths_org_code_uk 
ON strategy_paths(COALESCE(organization_id, '00000000-0000-0000-0000-000000000000'::uuid), code);

-- Only one default strategy path per organization
CREATE UNIQUE INDEX strategy_paths_one_default_per_org 
ON strategy_paths(organization_id) WHERE is_default = TRUE;

-- Master module definitions (M1-M21)
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Module dependencies (not self-referencing)
CREATE TABLE module_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    depends_on_module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    dependency_type module_dependency_type_enum DEFAULT 'requires',
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(module_id, depends_on_module_id),
    CHECK (module_id <> depends_on_module_id)
);

-- Modules included in each strategy path
CREATE TABLE strategy_path_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    strategy_path_id UUID NOT NULL REFERENCES strategy_paths(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE RESTRICT,
    sort_order INTEGER DEFAULT 0,
    is_required BOOLEAN DEFAULT FALSE,
    default_visibility module_visibility DEFAULT 'client',
    unlock_rule_json JSONB DEFAULT '{}',
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(strategy_path_id, module_id)
);

-- Modules selected for specific projects
CREATE TABLE project_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE RESTRICT,
    sort_order INTEGER DEFAULT 0,
    visibility module_visibility DEFAULT 'client',
    status module_status DEFAULT 'not_started',
    is_required BOOLEAN DEFAULT FALSE,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    due_at TIMESTAMPTZ,
    unlock_rule_json JSONB DEFAULT '{}',
    source module_source_enum DEFAULT 'manual',
    source_ref_id UUID, -- References strategy_path_modules.id or module_set_modules.id
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, module_id)
);

-- Module sets (templates)
CREATE TABLE module_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modules within a set
CREATE TABLE module_set_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_set_id UUID NOT NULL REFERENCES module_sets(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE RESTRICT,
    sort_order INTEGER DEFAULT 0,
    is_required BOOLEAN DEFAULT FALSE,
    UNIQUE(module_set_id, module_id)
);

-- Now add the strategy constraint to projects
ALTER TABLE projects ADD CONSTRAINT projects_strategy_ck
CHECK (
  (strategy_mode = 'custom' AND strategy_path_id IS NULL)
  OR (strategy_mode IN ('predefined','hybrid') AND strategy_path_id IS NOT NULL)
);

-- Add foreign key constraint for strategy_path_id
ALTER TABLE projects ADD CONSTRAINT projects_strategy_path_fk 
FOREIGN KEY (strategy_path_id) REFERENCES strategy_paths(id) ON DELETE SET NULL;

-- Insert the 21 core modules
INSERT INTO modules (code, name, category, description, sort_order) VALUES
('m1-core', 'Brand Foundation', 'foundation', 'Core brand identity and values', 1),
('m2-research', 'Market Research', 'foundation', 'Understanding your market and competitors', 2),
('m3-audience', 'Target Audience', 'strategy', 'Defining and understanding your ideal customers', 3),
('m4-positioning', 'Brand Positioning', 'strategy', 'Unique market position and differentiation', 4),
('m5-personality', 'Brand Personality', 'strategy', 'Human characteristics of your brand', 5),
('m6-voice', 'Brand Voice & Tone', 'communication', 'How your brand communicates', 6),
('m7-visual', 'Visual Identity System', 'visual', 'Logo, colors, typography, imagery', 7),
('m8-guidelines', 'Brand Guidelines', 'visual', 'Usage rules and standards', 8),
('m9-website', 'Website Strategy', 'digital', 'Digital presence foundation', 9),
('m10-content', 'Content Strategy', 'communication', 'Content planning and creation approach', 10),
('m11-social', 'Social Media Strategy', 'digital', 'Social platform approach and presence', 11),
('m12-marketing', 'Marketing Channels', 'marketing', 'Channel selection and optimization', 12),
('m13-journey', 'Customer Journey', 'experience', 'Mapping the customer experience', 13),
('m14-touchpoints', 'Touchpoint Analysis', 'experience', 'All brand interaction points', 14),
('m15-experience', 'Brand Experience Design', 'experience', 'Crafting memorable interactions', 15),
('m16-metrics', 'Performance Metrics', 'analytics', 'KPIs and measurement framework', 16),
('m17-analytics', 'Analytics Setup', 'analytics', 'Tracking and monitoring systems', 17),
('m18-evolution', 'Brand Evolution Plan', 'strategy', 'Future growth and adaptation strategy', 18),
('m19-crisis', 'Crisis Management', 'strategy', 'Brand protection and recovery', 19),
('m20-team', 'Team Alignment', 'foundation', 'Internal brand adoption and training', 20),
('m21-roadmap', 'Implementation Roadmap', 'foundation', 'Execution plan and timeline', 21);

-- Create indexes
CREATE INDEX idx_strategy_paths_organization_id ON strategy_paths(organization_id);
CREATE INDEX idx_strategy_paths_code ON strategy_paths(code);
CREATE INDEX idx_modules_code ON modules(code);
CREATE INDEX idx_modules_category ON modules(category);
CREATE INDEX idx_modules_sort_order ON modules(sort_order);
CREATE INDEX idx_module_dependencies_module_id ON module_dependencies(module_id);
CREATE INDEX idx_module_dependencies_depends_on ON module_dependencies(depends_on_module_id);
CREATE INDEX idx_strategy_path_modules_strategy_path_id ON strategy_path_modules(strategy_path_id);
CREATE INDEX idx_project_modules_project_id ON project_modules(project_id);
CREATE INDEX idx_project_modules_project_sort ON project_modules(project_id, sort_order);
CREATE INDEX idx_project_modules_status ON project_modules(project_id, status);
CREATE INDEX idx_project_modules_completed ON project_modules(project_id, completed_at) WHERE completed_at IS NOT NULL;

-- Add updated_at triggers
CREATE TRIGGER update_strategy_paths_updated_at 
    BEFORE UPDATE ON strategy_paths 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modules_updated_at 
    BEFORE UPDATE ON modules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_module_dependencies_updated_at 
    BEFORE UPDATE ON module_dependencies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_strategy_path_modules_updated_at 
    BEFORE UPDATE ON strategy_path_modules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_modules_updated_at 
    BEFORE UPDATE ON project_modules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();