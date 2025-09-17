-- BrandBlueprint Database Schema - Create all enums and extensions first
-- Migration 001: Extensions and Core Enums

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- Note: pgvector extension will be enabled separately in Supabase

-- Core Type Enums
-- User & Access Enums
CREATE TYPE role AS ENUM ('owner', 'admin', 'strategist', 'client_owner', 'client_editor', 'viewer');
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'declined', 'expired', 'revoked');

-- Strategy & Module Enums
CREATE TYPE strategy_mode_enum AS ENUM ('custom', 'predefined', 'hybrid');
CREATE TYPE module_source_enum AS ENUM ('manual', 'strategy', 'template');
CREATE TYPE module_status AS ENUM ('not_started', 'in_progress', 'needs_review', 'approved', 'locked');
CREATE TYPE module_visibility AS ENUM ('internal', 'client');
CREATE TYPE module_dependency_type_enum AS ENUM ('requires', 'recommends', 'blocks');

-- Answer & Framework Enums
CREATE TYPE answer_status AS ENUM ('draft', 'submitted', 'flagged', 'approved');
CREATE TYPE confidence AS ENUM ('low', 'medium', 'high');
CREATE TYPE canonical_status AS ENUM ('draft', 'submitted', 'approved');
CREATE TYPE source_enum AS ENUM ('user', 'ai', 'import', 'answer_link', 'strategy', 'template');

-- Question Types
CREATE TYPE question_type AS ENUM ('text', 'longtext', 'number', 'boolean', 'date', 'rating', 'select', 'multiselect', 'url', 'file', 'persona', 'matrix');
CREATE TYPE framework_code AS ENUM ('sixq');
CREATE TYPE sixq_slot AS ENUM ('q1', 'q2', 'q3', 'q4', 'q5', 'q6');

-- AI & Processing Enums
CREATE TYPE ai_provider AS ENUM ('openai', 'anthropic', 'openrouter');
CREATE TYPE ai_run_status AS ENUM ('success', 'error', 'rate_limited', 'canceled');
CREATE TYPE ai_message_role_enum AS ENUM ('system', 'user', 'assistant', 'tool', 'function');

-- Deliverable & Export Enums
CREATE TYPE deliverable_type AS ENUM ('brand_blueprint', 'value_props', 'personas', 'journey_map', 'sitemap', 'wireframes', 'ui', 'wp_blocks', 'pdf', 'csv', 'json');
CREATE TYPE deliverable_status AS ENUM ('draft', 'in_review', 'approved', 'published');
CREATE TYPE approval_decision AS ENUM ('approved', 'changes_requested', 'rejected');
CREATE TYPE export_format_enum AS ENUM ('pdf', 'html', 'docx', 'md', 'json', 'csv');
CREATE TYPE job_status_enum AS ENUM ('queued', 'processing', 'succeeded', 'failed', 'canceled');

-- Business Enums
CREATE TYPE company_size_enum AS ENUM ('startup', 'small', 'medium', 'large', 'enterprise');
CREATE TYPE budget_range_enum AS ENUM ('under_10k', '10k_25k', '25k_50k', '50k_100k', '100k_250k', '250k_500k', '500k_plus');
CREATE TYPE timeline_urgency_enum AS ENUM ('immediate', '1_month', '3_months', '6_months', '1_year', 'no_rush');
CREATE TYPE business_model_enum AS ENUM ('b2b', 'b2c', 'b2b2c', 'marketplace', 'saas', 'd2c', 'nonprofit', 'government', 'other');

-- Billing Enums
CREATE TYPE plan_code AS ENUM ('free', 'pro', 'agency', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'canceled', 'unpaid');
CREATE TYPE notification_channel AS ENUM ('in_app', 'email');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;