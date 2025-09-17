-- BrandBlueprint Database Schema - AI & RAG System
-- Migration 006: AI policies, runs, messages, and RAG infrastructure

-- AI configuration per org or project
CREATE TABLE ai_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scope TEXT CHECK (scope IN ('org', 'project')),
    scope_id UUID NOT NULL,
    provider ai_provider DEFAULT 'openai',
    model TEXT,
    temperature NUMERIC(3,2) DEFAULT 0.20,
    max_tokens INTEGER,
    allow_tools BOOLEAN DEFAULT TRUE,
    blocked_topics TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual AI operation records
CREATE TABLE ai_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    trigger TEXT CHECK (trigger IN ('question_assist', 'rewrite', 'summarize', 'deliverable_generate', 'qa_check')),
    input_json JSONB DEFAULT '{}',
    output_json JSONB DEFAULT '{}',
    provider ai_provider NOT NULL,
    model TEXT,
    status ai_run_status DEFAULT 'success',
    duration_ms INTEGER,
    cost_usd NUMERIC(10,4),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages within AI runs
CREATE TABLE ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ai_run_id UUID NOT NULL REFERENCES ai_runs(id) ON DELETE CASCADE,
    role ai_message_role_enum NOT NULL,
    content TEXT,
    tool_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Knowledge base sources for RAG
CREATE TABLE rag_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE, -- NULL = org-level
    name TEXT NOT NULL,
    kind TEXT CHECK (kind IN ('file', 'url', 'notion', 'gdoc', 'answers_snapshot')),
    status TEXT,
    last_indexed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents within RAG sources
CREATE TABLE rag_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rag_source_id UUID NOT NULL REFERENCES rag_sources(id) ON DELETE CASCADE,
    external_id TEXT,
    title TEXT,
    url TEXT,
    metadata_json JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vectorized chunks for similarity search
CREATE TABLE rag_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rag_document_id UUID NOT NULL REFERENCES rag_documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(1536), -- OpenAI embedding dimension (requires pgvector extension)
    token_count INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(rag_document_id, chunk_index)
);

-- Links AI responses to source chunks
CREATE TABLE ai_citations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ai_run_id UUID NOT NULL REFERENCES ai_runs(id) ON DELETE CASCADE,
    rag_chunk_id UUID NOT NULL REFERENCES rag_chunks(id) ON DELETE CASCADE,
    score NUMERIC(6,4),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_ai_policies_scope ON ai_policies(scope, scope_id);
CREATE INDEX idx_ai_runs_project_id ON ai_runs(project_id);
CREATE INDEX idx_ai_runs_created_at ON ai_runs(created_at);
CREATE INDEX idx_ai_messages_ai_run_id ON ai_messages(ai_run_id);
CREATE INDEX idx_rag_sources_project_id ON rag_sources(project_id);
CREATE INDEX idx_rag_documents_source_id ON rag_documents(rag_source_id);
CREATE INDEX idx_rag_chunks_document_id ON rag_chunks(rag_document_id);
CREATE INDEX idx_ai_citations_ai_run_id ON ai_citations(ai_run_id);
CREATE INDEX idx_ai_citations_rag_chunk_id ON ai_citations(rag_chunk_id);

-- Vector similarity search index (requires pgvector extension)
-- This will be created when pgvector is properly enabled
-- CREATE INDEX idx_rag_chunks_embedding ON rag_chunks USING hnsw (embedding vector_cosine_ops);