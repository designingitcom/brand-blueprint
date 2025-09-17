-- Create Organizations table if it doesn't exist
-- Run this in Supabase SQL Editor

-- First ensure we have the required enum types
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'company_size_enum') THEN
        CREATE TYPE company_size_enum AS ENUM ('startup', 'small', 'medium', 'large', 'enterprise');
    END IF;
END$$;

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}',
    logo_url TEXT,
    website TEXT,
    industry TEXT,
    company_size company_size_enum,
    timezone TEXT DEFAULT 'UTC',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

-- Create role enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role') THEN
        CREATE TYPE role AS ENUM ('owner', 'admin', 'strategist', 'client_owner', 'client_editor', 'viewer');
    END IF;
END$$;

-- Create memberships table
CREATE TABLE IF NOT EXISTS memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role role DEFAULT 'viewer',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- Create invites table
CREATE TABLE IF NOT EXISTS invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role role DEFAULT 'viewer',
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    type TEXT,
    description TEXT,
    website TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, slug)
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'planning',
    start_date DATE,
    end_date DATE,
    budget DECIMAL(12,2),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(business_id, slug)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_memberships_organization_id ON memberships(organization_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_invites_organization_id ON invites(organization_id);
CREATE INDEX IF NOT EXISTS idx_invites_token ON invites(token);
CREATE INDEX IF NOT EXISTS idx_businesses_organization_id ON businesses(organization_id);
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);
CREATE INDEX IF NOT EXISTS idx_projects_business_id ON projects(business_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);

-- Create update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at 
    BEFORE UPDATE ON organizations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_businesses_updated_at ON businesses;
CREATE TRIGGER update_businesses_updated_at 
    BEFORE UPDATE ON businesses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for development
-- Note: These are permissive for development. Tighten for production!

-- Organizations: Users can see organizations they belong to
CREATE POLICY "Users can view their organizations" ON organizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM memberships 
            WHERE memberships.organization_id = organizations.id 
            AND memberships.user_id = auth.uid()
        )
    );

-- Organizations: Users can create organizations (they become owner)
CREATE POLICY "Users can create organizations" ON organizations
    FOR INSERT WITH CHECK (true);

-- Organizations: Owners and admins can update
CREATE POLICY "Owners and admins can update organizations" ON organizations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM memberships 
            WHERE memberships.organization_id = organizations.id 
            AND memberships.user_id = auth.uid()
            AND memberships.role IN ('owner', 'admin')
        )
    );

-- Organizations: Only owners can delete
CREATE POLICY "Owners can delete organizations" ON organizations
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM memberships 
            WHERE memberships.organization_id = organizations.id 
            AND memberships.user_id = auth.uid()
            AND memberships.role = 'owner'
        )
    );

-- Memberships: Users can view memberships for their organizations
CREATE POLICY "Users can view organization memberships" ON memberships
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM memberships m2
            WHERE m2.organization_id = memberships.organization_id 
            AND m2.user_id = auth.uid()
        )
    );

-- Memberships: Owners and admins can manage memberships
CREATE POLICY "Owners and admins can manage memberships" ON memberships
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM memberships m2
            WHERE m2.organization_id = memberships.organization_id 
            AND m2.user_id = auth.uid()
            AND m2.role IN ('owner', 'admin')
        )
    );

-- Businesses: Users can view businesses in their organizations
CREATE POLICY "Users can view organization businesses" ON businesses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM memberships 
            WHERE memberships.organization_id = businesses.organization_id 
            AND memberships.user_id = auth.uid()
        )
    );

-- Businesses: Users with appropriate roles can manage businesses
CREATE POLICY "Users can manage businesses" ON businesses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM memberships 
            WHERE memberships.organization_id = businesses.organization_id 
            AND memberships.user_id = auth.uid()
            AND memberships.role IN ('owner', 'admin', 'strategist')
        )
    );

-- Projects: Users can view projects in their organization's businesses
CREATE POLICY "Users can view projects" ON projects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM businesses 
            JOIN memberships ON memberships.organization_id = businesses.organization_id
            WHERE businesses.id = projects.business_id 
            AND memberships.user_id = auth.uid()
        )
    );

-- Projects: Users with appropriate roles can manage projects
CREATE POLICY "Users can manage projects" ON projects
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM businesses 
            JOIN memberships ON memberships.organization_id = businesses.organization_id
            WHERE businesses.id = projects.business_id 
            AND memberships.user_id = auth.uid()
            AND memberships.role IN ('owner', 'admin', 'strategist')
        )
    );

-- Users table: Users can view and update their own record
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

GRANT ALL ON organizations TO authenticated;
GRANT ALL ON users TO authenticated;
GRANT ALL ON memberships TO authenticated;
GRANT ALL ON invites TO authenticated;
GRANT ALL ON businesses TO authenticated;
GRANT ALL ON projects TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database tables created successfully!';
END$$;