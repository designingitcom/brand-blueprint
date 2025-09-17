-- BrandBlueprint Database Schema - Deliverables & Content Management
-- Migration 007: Deliverables, exports, content assets, and billing

-- High-level deliverable containers
CREATE TABLE deliverables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    type deliverable_type NOT NULL,
    title TEXT NOT NULL,
    status deliverable_status DEFAULT 'draft',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Versioned content for deliverables
CREATE TABLE deliverable_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deliverable_id UUID NOT NULL REFERENCES deliverables(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    content_json JSONB NOT NULL,
    rendered_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(deliverable_id, version)
);

-- Approval workflow for deliverables
CREATE TABLE approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deliverable_id UUID NOT NULL REFERENCES deliverables(id) ON DELETE CASCADE,
    requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    decision approval_decision,
    comment TEXT,
    decided_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Async export processing jobs
CREATE TABLE export_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deliverable_version_id UUID NOT NULL REFERENCES deliverable_versions(id) ON DELETE CASCADE,
    format export_format_enum NOT NULL,
    status job_status_enum NOT NULL DEFAULT 'queued',
    output_url TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Reusable content blocks (WordPress blocks, etc)
CREATE TABLE block_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    schema_json JSONB NOT NULL,
    category TEXT,
    status TEXT CHECK (status IN ('active', 'deprecated')) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Used blocks in projects
CREATE TABLE block_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    block_id UUID NOT NULL REFERENCES block_library(id) ON DELETE RESTRICT,
    props_json JSONB NOT NULL,
    created_from_deliverable_version_id UUID REFERENCES deliverable_versions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Website page templates
CREATE TABLE page_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    layout_json JSONB NOT NULL,
    status TEXT CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, name)
);

-- Uploaded files and assets
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    uploader_id UUID REFERENCES users(id) ON DELETE SET NULL,
    filename TEXT NOT NULL,
    mime TEXT,
    size_bytes BIGINT,
    storage_path TEXT NOT NULL,
    checksum TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project-specific asset metadata
CREATE TABLE content_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    alt_text TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription plan definitions
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code plan_code UNIQUE NOT NULL,
    name TEXT NOT NULL,
    price_usd_month NUMERIC(10,2),
    price_usd_year NUMERIC(10,2),
    limits_json JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Active subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    status subscription_status DEFAULT 'trialing',
    billing_cycle_anchor TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking for billing
CREATE TABLE subscription_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    metric TEXT CHECK (metric IN ('ai_tokens', 'exports', 'projects', 'seats')),
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    quantity BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment records
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    external_id TEXT, -- Stripe/payment ID
    status TEXT,
    total_usd NUMERIC(10,2),
    issued_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics event tracking
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    props_json JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Security and compliance audit trail
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    diff_json JSONB DEFAULT '{}',
    ip TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    channel notification_channel DEFAULT 'in_app',
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default plans
INSERT INTO plans (code, name, price_usd_month, price_usd_year, limits_json) VALUES
('free', 'Free', 0, 0, '{"projects": 1, "ai_tokens": 10000, "exports": 5, "seats": 1}'),
('pro', 'Professional', 29, 290, '{"projects": 10, "ai_tokens": 100000, "exports": 50, "seats": 5}'),
('agency', 'Agency', 99, 990, '{"projects": 50, "ai_tokens": 500000, "exports": 200, "seats": 20}'),
('enterprise', 'Enterprise', 299, 2990, '{"projects": -1, "ai_tokens": -1, "exports": -1, "seats": -1}');

-- Create indexes
CREATE INDEX idx_deliverables_project_id ON deliverables(project_id);
CREATE INDEX idx_deliverable_versions_deliverable_id ON deliverable_versions(deliverable_id);
CREATE INDEX idx_approvals_deliverable_id ON approvals(deliverable_id);
CREATE INDEX idx_export_jobs_deliverable_version_id ON export_jobs(deliverable_version_id);
CREATE INDEX idx_export_jobs_status ON export_jobs(status);
CREATE INDEX idx_block_instances_project_id ON block_instances(project_id);
CREATE INDEX idx_page_templates_project_id ON page_templates(project_id);
CREATE INDEX idx_files_organization_id ON files(organization_id);
CREATE INDEX idx_content_assets_project_id ON content_assets(project_id);
CREATE INDEX idx_subscriptions_organization_id ON subscriptions(organization_id);
CREATE INDEX idx_subscription_usage_subscription_id ON subscription_usage(subscription_id);
CREATE INDEX idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX idx_events_organization_id ON events(organization_id);
CREATE INDEX idx_events_project_id ON events(project_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_read ON notifications(read_at);

-- Add updated_at triggers
CREATE TRIGGER update_deliverables_updated_at 
    BEFORE UPDATE ON deliverables 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();