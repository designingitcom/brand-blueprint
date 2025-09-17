-- BrandBlueprint Database Schema - Questions & Answers System
-- Migration 005: Questions, answers, and 6-Question Framework

-- Questions within modules
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    label TEXT NOT NULL,
    help_text TEXT,
    type question_type NOT NULL,
    required BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    ai_prompt_hint TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(module_id, code)
);

-- Options for select/multiselect questions
CREATE TABLE question_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    value TEXT NOT NULL,
    label TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Question dependencies (conditional display logic)
CREATE TABLE question_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    depends_on_question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    operator TEXT CHECK (operator IN ('equals', 'not_equals', 'in', 'not_in', 'gte', 'lte', 'exists', 'not_exists')),
    value_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project-specific question customizations
CREATE TABLE module_question_overrides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    hidden BOOLEAN DEFAULT FALSE,
    sort_order_override INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, question_id)
);

-- User responses to questions
CREATE TABLE answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    value_json JSONB NOT NULL,
    status answer_status DEFAULT 'draft',
    confidence confidence DEFAULT 'medium',
    source source_enum DEFAULT 'user',
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, question_id)
);

-- Version history for answers
CREATE TABLE answer_revisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    answer_id UUID NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    value_json JSONB NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    note TEXT,
    UNIQUE(answer_id, version)
);

-- Review requests
CREATE TABLE review_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE SET NULL,
    requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT,
    status TEXT CHECK (status IN ('open', 'in_review', 'resolved')) DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments on various entities
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    entity_type TEXT CHECK (entity_type IN ('answer', 'deliverable', 'module')),
    entity_id UUID NOT NULL,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 6-Question Framework System

-- Framework definitions (currently just 'sixq')
CREATE TABLE frameworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code framework_code UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- The 6 question slots (Q1-Q6)
CREATE TABLE framework_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    framework_id UUID NOT NULL REFERENCES frameworks(id) ON DELETE CASCADE,
    slot sixq_slot NOT NULL,
    label TEXT NOT NULL,
    help_text TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(framework_id, slot)
);

-- Maps framework fields to actual questions
CREATE TABLE framework_bindings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    framework_field_id UUID NOT NULL REFERENCES framework_fields(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(framework_field_id)
);

-- The curated 6Q answers for a project
CREATE TABLE project_canonical_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    framework_field_id UUID NOT NULL REFERENCES framework_fields(id) ON DELETE CASCADE,
    value_json JSONB NOT NULL,
    status canonical_status DEFAULT 'draft',
    confidence confidence DEFAULT 'medium',
    source source_enum DEFAULT 'user',
    answer_id UUID REFERENCES answers(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, framework_field_id)
);

-- Insert the 6-Question Framework
INSERT INTO frameworks (code, name, description) VALUES 
('sixq', '6-Question Framework', 'Core brand questions that drive everything else');

-- Insert the 6 framework fields
WITH framework_data AS (
    SELECT id FROM frameworks WHERE code = 'sixq'
)
INSERT INTO framework_fields (framework_id, slot, label, help_text, sort_order) 
SELECT 
    f.id,
    slot,
    label,
    help_text,
    sort_order
FROM framework_data f, (VALUES
    ('q1', 'What do we do?', 'Core business offering and value proposition', 1),
    ('q2', 'How are we different?', 'Unique differentiators and competitive advantages', 2),
    ('q3', 'Who is it for?', 'Target audience and ideal customer profile', 3),
    ('q4', 'What do they get?', 'Benefits and outcomes customers receive', 4),
    ('q5', 'How do they feel?', 'Emotional experience and brand perception', 5),
    ('q6', 'What should they do?', 'Clear call-to-action and next steps', 6)
) AS fields(slot, label, help_text, sort_order);

-- Create indexes
CREATE INDEX idx_questions_module_id ON questions(module_id);
CREATE INDEX idx_questions_sort_order ON questions(module_id, sort_order);
CREATE INDEX idx_question_options_question_id ON question_options(question_id);
CREATE INDEX idx_question_dependencies_question_id ON question_dependencies(question_id);
CREATE INDEX idx_question_dependencies_depends_on ON question_dependencies(depends_on_question_id);
CREATE INDEX idx_module_question_overrides_project_id ON module_question_overrides(project_id);
CREATE INDEX idx_answers_project_id ON answers(project_id);
CREATE INDEX idx_answer_revisions_answer_id ON answer_revisions(answer_id);
CREATE INDEX idx_review_requests_project_id ON review_requests(project_id);
CREATE INDEX idx_comments_project_id ON comments(project_id);
CREATE INDEX idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX idx_framework_fields_framework_id ON framework_fields(framework_id);
CREATE INDEX idx_framework_bindings_field_id ON framework_bindings(framework_field_id);
CREATE INDEX idx_framework_bindings_question_id ON framework_bindings(question_id);
CREATE INDEX idx_project_canonical_values_project_id ON project_canonical_values(project_id);

-- Add updated_at triggers
CREATE TRIGGER update_answers_updated_at 
    BEFORE UPDATE ON answers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_canonical_values_updated_at 
    BEFORE UPDATE ON project_canonical_values 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();