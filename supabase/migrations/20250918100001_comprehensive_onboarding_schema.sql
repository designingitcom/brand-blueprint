-- Comprehensive Business Onboarding Schema Migration
-- Supports complete onboarding flow from business-onboarding.md documentation
-- Migration: 20250918100001_comprehensive_onboarding_schema

BEGIN;

-- ============================================================================
-- 1. PHASE 1: BUSINESS SETUP EXTENSIONS (Basic Information & Services)
-- ============================================================================

-- Services/Products structure (JSON array with name and optional URL)
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS services JSONB DEFAULT '[]'::jsonb,
-- Expected format: [{"name": "Service 1", "url": "https://...", "description": "..."}, ...]

-- Competitors structure (JSON array with URL and notes)
ADD COLUMN IF NOT EXISTS competitors JSONB DEFAULT '[]'::jsonb;
-- Expected format: [{"url": "competitor1.com", "notes": "Strong in X, weak in Y"}, ...]

-- Document storage references
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS document_files JSONB DEFAULT '[]'::jsonb;
-- Expected format: [{"type": "pitch_deck", "url": "...", "filename": "...", "uploaded_at": "..."}, ...]

-- ============================================================================
-- 2. PHASE 2: STRATEGIC ONBOARDING (Segment & Persona Selection)
-- ============================================================================

-- Segment and persona data from Phase 2
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS primary_segment JSONB,
ADD COLUMN IF NOT EXISTS secondary_segment JSONB,
ADD COLUMN IF NOT EXISTS selected_persona JSONB;

-- Expected format for segments:
-- {
--   "id": "growing-b2b-saas",
--   "name": "Growing B2B SaaS",
--   "description": "11-50 employees, Series A funded",
--   "pain": "Can't differentiate from competitors",
--   "opportunity": "High growth, need speed",
--   "ai_suggested": true
-- }

-- Expected format for persona:
-- {
--   "id": "ambitious-founder",
--   "name": "The Ambitious Founder",
--   "description": "Sarah, CEO, 35-45",
--   "characteristics": ["Just raised funding", "Pressure to grow"],
--   "reads": ["TechCrunch", "First Round Review"],
--   "trigger": "Board demanding growth",
--   "ai_suggested": true,
--   "customizations": "..."
-- }

-- ============================================================================
-- 3. PHASE 3: STRATEGIC QUESTIONS RESPONSES (15 Questions)
-- ============================================================================

-- Strategic question responses (JSON object with question ID as key)
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS strategic_responses JSONB DEFAULT '{}'::jsonb;

-- Expected format:
-- {
--   "q1_expensive_problem": {
--     "answer": "Loses $500K annually because poor differentiation",
--     "problem_cost": "$500K+",
--     "confidence": "high",
--     "ai_suggestions_used": ["suggestion1", "suggestion2"],
--     "chat_history": [...],
--     "answered_at": "2024-03-15T10:30:00Z"
--   },
--   "q2_category_context": {
--     "answer": "Real-time strategy platform",
--     "search_terms": ["strategy platform", "positioning tool"],
--     "competitor_categories": ["Marketing agency", "Consulting firm"],
--     "confidence": "medium",
--     ...
--   },
--   ... (all 15 questions)
-- }

-- ============================================================================
-- 4. PROGRESS TRACKING & AI ASSISTANCE
-- ============================================================================

-- Progress tracking fields
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS onboarding_phase TEXT DEFAULT 'not_started'
    CHECK (onboarding_phase IN ('not_started', 'business_setup', 'segment_selection', 'persona_selection', 'strategic_questions', 'completed')),
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS onboarding_progress JSONB DEFAULT '{}'::jsonb,
-- Expected format:
-- {
--   "business_setup_completed_at": "2024-03-15T10:00:00Z",
--   "segment_selection_completed_at": "2024-03-15T10:15:00Z",
--   "persona_selection_completed_at": "2024-03-15T10:16:00Z",
--   "questions_started_at": "2024-03-15T10:17:00Z",
--   "questions_completed_at": "2024-03-15T10:45:00Z",
--   "total_time_minutes": 45,
--   "questions_answered_count": 15,
--   "ai_suggestions_accepted": 12,
--   "chat_interactions": 8
-- }

-- AI assistance and confidence data
ADD COLUMN IF NOT EXISTS ai_assistance_data JSONB DEFAULT '{}'::jsonb;
-- Expected format:
-- {
--   "overall_confidence_score": 85,
--   "question_confidence_scores": {
--     "q1": "high",
--     "q2": "medium",
--     ...
--   },
--   "ai_suggestions_by_question": {
--     "q1": ["suggestion1", "suggestion2"],
--     ...
--   },
--   "chat_interactions_count": 8,
--   "total_ai_cost": 2.45,
--   "models_used": ["claude-3", "gpt-4"]
-- }

-- ============================================================================
-- 5. FINAL POSITIONING OUTPUT
-- ============================================================================

-- Generated positioning statement and analysis
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS positioning_output JSONB;

-- Expected format:
-- {
--   "positioning_statement": "For ambitious SaaS founders struggling...",
--   "segment": "Growing B2B SaaS (11-50 employees)",
--   "persona": "The Ambitious Founder (Sarah, CEO)",
--   "problem": "Losing $500K annually from poor differentiation",
--   "category": "Real-time strategy platform",
--   "obstacle": "Paralyzed by too many options",
--   "transformation": "From invisible to obvious choice",
--   "identity": "The strategists who work in real-time",
--   "values": ["Speed over perfection", "Truth over comfort"],
--   "belief": "Strategy emerges through smart questions, not months of analysis",
--   "sacrifice": "Won't serve enterprises needing consensus",
--   "alternatives": "$50K agencies or DIY confusion",
--   "only_position": "Only platform building strategy AS you answer",
--   "decision_driver": "10x faster with equal depth",
--   "unique_value": "Strategic clarity in days not months",
--   "success_metrics": "100 customers in 12 months",
--   "strength_scores": {
--     "problem_clarity": 85,
--     "segment_focus": 100,
--     "unique_position": 80,
--     "value_clarity": 90,
--     "overall": 88
--   },
--   "generated_at": "2024-03-15T10:45:00Z"
-- }

-- ============================================================================
-- 6. METADATA & TIMESTAMPS
-- ============================================================================

-- Add completion timestamps for tracking
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS strategic_onboarding_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS positioning_generated_at TIMESTAMPTZ;

-- ============================================================================
-- 7. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_businesses_onboarding_phase ON businesses(onboarding_phase);
CREATE INDEX IF NOT EXISTS idx_businesses_onboarding_step ON businesses(onboarding_step);
CREATE INDEX IF NOT EXISTS idx_businesses_strategic_completed ON businesses(strategic_onboarding_completed_at);
CREATE INDEX IF NOT EXISTS idx_businesses_positioning_generated ON businesses(positioning_generated_at);

-- Specialized indexes for JSONB fields
CREATE INDEX IF NOT EXISTS idx_businesses_services_gin ON businesses USING GIN(services);
CREATE INDEX IF NOT EXISTS idx_businesses_competitors_gin ON businesses USING GIN(competitors);
CREATE INDEX IF NOT EXISTS idx_businesses_strategic_responses_gin ON businesses USING GIN(strategic_responses);
CREATE INDEX IF NOT EXISTS idx_businesses_ai_assistance_gin ON businesses USING GIN(ai_assistance_data);

-- ============================================================================
-- 8. COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN businesses.services IS 'JSON array of business services/products with names, URLs, and descriptions';
COMMENT ON COLUMN businesses.competitors IS 'JSON array of competitors with URLs and analysis notes';
COMMENT ON COLUMN businesses.document_files IS 'JSON array of uploaded documents (pitch decks, one-pagers) with metadata';
COMMENT ON COLUMN businesses.primary_segment IS 'Primary market segment selected during onboarding with AI analysis';
COMMENT ON COLUMN businesses.secondary_segment IS 'Optional secondary market segment';
COMMENT ON COLUMN businesses.selected_persona IS 'Selected buyer persona with characteristics and triggers';
COMMENT ON COLUMN businesses.strategic_responses IS 'Responses to 15 strategic positioning questions with confidence scores';
COMMENT ON COLUMN businesses.onboarding_phase IS 'Current phase of the onboarding process';
COMMENT ON COLUMN businesses.onboarding_step IS 'Current step within the current phase (0-based)';
COMMENT ON COLUMN businesses.onboarding_progress IS 'Detailed progress tracking with timestamps and metrics';
COMMENT ON COLUMN businesses.ai_assistance_data IS 'AI assistance usage, confidence scores, and interaction data';
COMMENT ON COLUMN businesses.positioning_output IS 'Final generated positioning statement and strategic analysis';

-- ============================================================================
-- 9. UPDATE EXISTING RECORDS FOR BACKWARD COMPATIBILITY
-- ============================================================================

-- Ensure existing businesses have proper default values
UPDATE businesses
SET
    onboarding_phase = 'completed',
    strategic_onboarding_completed_at = created_at,
    positioning_generated_at = created_at
WHERE onboarding_completed = true AND strategic_onboarding_completed_at IS NULL;

-- For businesses that have basic onboarding completed but not strategic
UPDATE businesses
SET
    onboarding_phase = 'business_setup'
WHERE onboarding_completed = true AND strategic_onboarding_completed_at IS NULL;

-- For businesses with no onboarding
UPDATE businesses
SET
    onboarding_phase = 'not_started'
WHERE onboarding_completed = false OR onboarding_completed IS NULL;

COMMIT;