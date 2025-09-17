-- BrandBlueprint Database Schema - Business Entities
-- Migration 003: Clients, business profiles, and projects

-- Clients (businesses being served)
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    industry TEXT,
    website TEXT,
    locale TEXT DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, name),
    UNIQUE(organization_id, slug)
);

-- Extended business information captured during onboarding
CREATE TABLE business_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Basic Information
    legal_name TEXT,
    dba_name TEXT,
    founding_year INTEGER,
    employee_count INTEGER,
    annual_revenue TEXT,
    annual_revenue_min NUMERIC(12,2),
    annual_revenue_max NUMERIC(12,2),
    
    -- Contact Information
    primary_contact_name TEXT,
    primary_contact_email TEXT,
    primary_contact_phone TEXT,
    headquarters_address TEXT,
    headquarters_city TEXT,
    headquarters_state TEXT,
    headquarters_country TEXT,
    headquarters_postal TEXT,
    
    -- Business Details
    business_model TEXT,
    business_model_structured business_model_enum,
    target_market TEXT[],
    primary_products TEXT[],
    primary_services TEXT[],
    key_differentiators TEXT[],
    main_competitors TEXT[],
    
    -- Strategic Assessment
    current_challenges TEXT[],
    growth_goals TEXT[],
    success_metrics TEXT[],
    timeline_urgency TEXT,
    timeline_urgency_structured timeline_urgency_enum,
    budget_range TEXT,
    budget_range_structured budget_range_enum,
    
    -- Brand Status
    has_existing_brand BOOLEAN DEFAULT FALSE,
    brand_satisfaction_score INTEGER CHECK (brand_satisfaction_score >= 1 AND brand_satisfaction_score <= 10),
    has_brand_guidelines BOOLEAN DEFAULT FALSE,
    has_website BOOLEAN DEFAULT FALSE,
    website_satisfaction_score INTEGER CHECK (website_satisfaction_score >= 1 AND website_satisfaction_score <= 10),
    
    -- Marketing Presence
    social_media_channels JSONB DEFAULT '{}',
    marketing_channels TEXT[],
    monthly_marketing_spend TEXT,
    monthly_marketing_spend_amount NUMERIC(10,2),
    has_internal_marketing_team BOOLEAN DEFAULT FALSE,
    
    -- Technical Details
    current_tech_stack TEXT[],
    preferred_cms TEXT,
    integration_requirements TEXT[],
    
    -- Project Specifics
    project_goals TEXT[],
    success_definition TEXT,
    key_stakeholders JSONB DEFAULT '{}',
    decision_maker TEXT,
    
    -- Preferences
    communication_preference TEXT,
    meeting_cadence TEXT,
    preferred_timeline TEXT,
    
    -- Metadata
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_completed_at TIMESTAMPTZ,
    profile_completeness INTEGER DEFAULT 0,
    last_updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(client_id)
);

-- Projects (work containers for clients)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    code TEXT,
    status TEXT CHECK (status IN ('active', 'archived')) DEFAULT 'active',
    strategy_mode strategy_mode_enum DEFAULT 'custom',
    strategy_path_id UUID, -- Will reference strategy_paths table
    base_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(client_id, name),
    UNIQUE(client_id, slug)
);

-- Add strategy constraint (will be enabled after strategy_paths table is created)
-- ALTER TABLE projects ADD CONSTRAINT projects_strategy_ck
-- CHECK (
--   (strategy_mode = 'custom' AND strategy_path_id IS NULL)
--   OR (strategy_mode IN ('predefined','hybrid') AND strategy_path_id IS NOT NULL)
-- );

-- Create indexes
CREATE INDEX idx_clients_organization_id ON clients(organization_id);
CREATE INDEX idx_business_profiles_client_id ON business_profiles(client_id);
CREATE INDEX idx_business_profiles_onboarding_completed ON business_profiles(onboarding_completed);
CREATE INDEX idx_business_profiles_profile_completeness ON business_profiles(profile_completeness);
CREATE INDEX idx_business_profiles_budget_range ON business_profiles(budget_range_structured);
CREATE INDEX idx_business_profiles_timeline_urgency ON business_profiles(timeline_urgency_structured);
CREATE INDEX idx_business_profiles_revenue_range ON business_profiles(annual_revenue_min, annual_revenue_max);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_strategy_path_id ON projects(strategy_path_id);
CREATE INDEX idx_projects_base_project_id ON projects(base_project_id);

-- Add updated_at triggers
CREATE TRIGGER update_business_profiles_updated_at 
    BEFORE UPDATE ON business_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();