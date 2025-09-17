-- Add CRM/PM/QuickBooks integration fields to organizations
-- This extends the existing organizations table with client portal integration

-- Add integration fields to organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS integrations JSONB DEFAULT '{}';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS quickbooks_customer_id TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS slack_workspace_id TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS google_drive_folder_url TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS primary_contact_name TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS primary_contact_email TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS primary_contact_phone TEXT;

-- Client portal documents and links
CREATE TABLE IF NOT EXISTS organization_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL, -- 'contract', 'sow', 'invoice', 'proposal', 'deliverable', 'other'
    title TEXT NOT NULL,
    file_url TEXT, -- Google Drive link or uploaded file URL
    external_id TEXT, -- QuickBooks invoice ID, PM tool task ID, etc.
    status TEXT DEFAULT 'active', -- 'active', 'archived', 'draft'
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project management and time tracking integration
CREATE TABLE IF NOT EXISTS organization_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    integration_type TEXT NOT NULL, -- 'quickbooks', 'slack', 'asana', 'trello', 'harvest', 'toggl'
    external_id TEXT NOT NULL, -- Customer ID, workspace ID, project ID, etc.
    integration_data JSONB DEFAULT '{}', -- API tokens, webhook URLs, etc.
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, integration_type)
);

-- Client portal activity feed (aggregates from all integrations)
CREATE TABLE IF NOT EXISTS client_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'task_completed', 'invoice_sent', 'document_uploaded', 'meeting_scheduled'
    title TEXT NOT NULL,
    description TEXT,
    source_system TEXT, -- 'brand_app', 'quickbooks', 'slack', 'asana', etc.
    source_id TEXT, -- Original record ID from source system
    metadata JSONB DEFAULT '{}', -- Additional data like amounts, due dates, etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_organization_documents_org_id ON organization_documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_documents_type ON organization_documents(organization_id, document_type);
CREATE INDEX IF NOT EXISTS idx_organization_integrations_org_id ON organization_integrations(organization_id);
CREATE INDEX IF NOT EXISTS idx_client_activities_org_id ON client_activities(organization_id);
CREATE INDEX IF NOT EXISTS idx_client_activities_created_at ON client_activities(organization_id, created_at DESC);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organization_documents_updated_at 
    BEFORE UPDATE ON organization_documents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organization_integrations_updated_at 
    BEFORE UPDATE ON organization_integrations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();