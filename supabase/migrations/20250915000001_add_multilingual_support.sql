-- Add multilingual support for content tables
-- This migration creates translation tables for multilingual content

-- Create question translations table
CREATE TABLE IF NOT EXISTS question_translations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    locale VARCHAR(5) NOT NULL DEFAULT 'en',
    title TEXT NOT NULL,
    definition TEXT,
    why_it_matters TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(question_id, locale)
);

-- Create module translations table
CREATE TABLE IF NOT EXISTS module_translations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    locale VARCHAR(5) NOT NULL DEFAULT 'en',
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(module_id, locale)
);

-- Create strategy translations table
CREATE TABLE IF NOT EXISTS strategy_translations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
    locale VARCHAR(5) NOT NULL DEFAULT 'en',
    name TEXT NOT NULL,
    description TEXT,
    target_audience TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(strategy_id, locale)
);

-- Create business translations table
CREATE TABLE IF NOT EXISTS business_translations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    locale VARCHAR(5) NOT NULL DEFAULT 'en',
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_id, locale)
);

-- Create organization translations table
CREATE TABLE IF NOT EXISTS organization_translations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    locale VARCHAR(5) NOT NULL DEFAULT 'en',
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, locale)
);

-- Create project translations table
CREATE TABLE IF NOT EXISTS project_translations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    locale VARCHAR(5) NOT NULL DEFAULT 'en',
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, locale)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_question_translations_question_id ON question_translations(question_id);
CREATE INDEX IF NOT EXISTS idx_question_translations_locale ON question_translations(locale);
CREATE INDEX IF NOT EXISTS idx_module_translations_module_id ON module_translations(module_id);
CREATE INDEX IF NOT EXISTS idx_module_translations_locale ON module_translations(locale);
CREATE INDEX IF NOT EXISTS idx_strategy_translations_strategy_id ON strategy_translations(strategy_id);
CREATE INDEX IF NOT EXISTS idx_strategy_translations_locale ON strategy_translations(locale);
CREATE INDEX IF NOT EXISTS idx_business_translations_business_id ON business_translations(business_id);
CREATE INDEX IF NOT EXISTS idx_business_translations_locale ON business_translations(locale);
CREATE INDEX IF NOT EXISTS idx_organization_translations_organization_id ON organization_translations(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_translations_locale ON organization_translations(locale);
CREATE INDEX IF NOT EXISTS idx_project_translations_project_id ON project_translations(project_id);
CREATE INDEX IF NOT EXISTS idx_project_translations_locale ON project_translations(locale);

-- Create updated_at triggers for all translation tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_question_translations_updated_at BEFORE UPDATE ON question_translations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_module_translations_updated_at BEFORE UPDATE ON module_translations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_strategy_translations_updated_at BEFORE UPDATE ON strategy_translations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_business_translations_updated_at BEFORE UPDATE ON business_translations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_organization_translations_updated_at BEFORE UPDATE ON organization_translations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_project_translations_updated_at BEFORE UPDATE ON project_translations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();