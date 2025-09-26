# Business Onboarding API Contracts & Data Persistence Layer

## API Architecture Overview

This document defines the complete API contracts, data persistence patterns, and service integration for the business onboarding system.

## API Endpoint Structure

### Base Configuration

```typescript
const API_BASE = '/api/onboarding';
const BUSINESS_API = '/api/businesses';
const AI_API = '/api/ai';
const DATA_API = '/api/data';
```

## Core Business Management APIs

### 1. Business CRUD Operations

#### Create Business

```http
POST /api/businesses
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "string",
  "website_url": "string?",
  "linkedin_url": "string?",
  "industry": "string",
  "custom_industry": "string?",
  "business_type": "B2B|B2C|B2B2C|Marketplace|Non-profit",
  "user_id": "string"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "string",
    "slug": "string",
    "status": "draft",
    "created_at": "datetime",
    "updated_at": "datetime"
    // ... other fields
  },
  "metadata": {
    "timestamp": "datetime",
    "request_id": "string"
  }
}
```

#### Get Business

```http
GET /api/businesses/{businessId}
Authorization: Bearer {token}
```

#### Update Business

```http
PATCH /api/businesses/{businessId}
Content-Type: application/json
Authorization: Bearer {token}

{
  "auto_save": boolean,
  "phase": number,
  "step": number,
  // ... partial business data
}
```

#### Delete Business

```http
DELETE /api/businesses/{businessId}
Authorization: Bearer {token}
```

## Onboarding-Specific APIs

### 1. Initialize Onboarding

```http
POST /api/onboarding/initialize
Content-Type: application/json
Authorization: Bearer {token}

{
  "business_id": "string?"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "business": Business,
    "available_segments": MarketSegment[],
    "available_personas": CustomerPersona[],
    "strategic_questions": StrategicQuestion[],
    "session_id": "string"
  }
}
```

### 2. Save Progress

```http
PATCH /api/onboarding/{businessId}/progress
Content-Type: application/json
Authorization: Bearer {token}

{
  "phase": number,
  "step": number,
  "data": object,
  "auto_save": boolean,
  "validation_required": boolean
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "business": Business,
    "conflicts": ConflictResolution[]?,
    "next_recommendations": Recommendation[]?
  },
  "metadata": {
    "saved_at": "datetime",
    "validation_status": "valid|invalid|warning"
  }
}
```

### 3. Get Current Status

```http
GET /api/onboarding/{businessId}/status
Authorization: Bearer {token}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "current_phase": number,
    "current_step": number,
    "completed_phases": number[],
    "completed_steps": number[],
    "overall_progress": number,
    "can_proceed": boolean,
    "validation_errors": object
  }
}
```

## AI Service APIs

### 1. Generate Segment Suggestions

```http
POST /api/ai/suggest-segments
Content-Type: application/json
Authorization: Bearer {token}

{
  "business_context": {
    "industry": "string",
    "business_type": "string",
    "services": Service[],
    "competitors": Competitor[]
  },
  "additional_context": "string?"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "suggestions": MarketSegment[],
    "reasoning": "string",
    "confidence": number,
    "alternatives": MarketSegment[]
  },
  "metadata": {
    "model_used": "string",
    "processing_time_ms": number,
    "tokens_used": number
  }
}
```

### 2. Generate Persona Suggestions

```http
POST /api/ai/suggest-personas
Content-Type: application/json
Authorization: Bearer {token}

{
  "segment": MarketSegment,
  "business_context": object,
  "customization_preferences": object?
}
```

### 3. Analyze Strategic Response

```http
POST /api/ai/analyze-response
Content-Type: application/json
Authorization: Bearer {token}

{
  "question_id": "string",
  "response": "string",
  "business_context": object,
  "previous_responses": StrategicResponse[]
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "analysis": {
      "clarity_score": number,
      "specificity_score": number,
      "strategic_value": number,
      "consistency_check": boolean
    },
    "suggestions": AISuggestion[],
    "improvements": string[],
    "follow_up_questions": string[]
  }
}
```

### 4. Generate Strategic Suggestions

```http
POST /api/ai/suggest-strategic
Content-Type: application/json
Authorization: Bearer {token}

{
  "question_id": "string",
  "business_context": object,
  "segment": MarketSegment,
  "persona": CustomerPersona,
  "previous_responses": StrategicResponse[]
}
```

### 5. Generate Final Positioning

```http
POST /api/ai/generate-positioning
Content-Type: application/json
Authorization: Bearer {token}

{
  "business": Business,
  "strategic_responses": StrategicResponse[],
  "preferences": {
    "tone": "professional|friendly|bold",
    "length": "concise|detailed|comprehensive",
    "focus": "b2b|b2c|technical|emotional"
  }
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "positioning_output": PositioningOutput,
    "analysis": PositioningAnalysis,
    "alternatives": PositioningOutput[],
    "recommendations": string[]
  }
}
```

## Data Service APIs

### 1. Get Predefined Segments

```http
GET /api/data/segments
Query Parameters:
  - industry: string?
  - business_type: string?
  - include_custom: boolean?
Authorization: Bearer {token}
```

### 2. Get Predefined Personas

```http
GET /api/data/personas
Query Parameters:
  - segment_id: string?
  - industry: string?
  - include_custom: boolean?
Authorization: Bearer {token}
```

### 3. Get Strategic Questions

```http
GET /api/data/questions
Query Parameters:
  - category: string?
  - required_only: boolean?
Authorization: Bearer {token}
```

### 4. Get Industry Data

```http
GET /api/data/industries
Query Parameters:
  - include_stats: boolean?
  - include_trends: boolean?
Authorization: Bearer {token}
```

## Validation APIs

### 1. Validate Step

```http
POST /api/validation/step
Content-Type: application/json
Authorization: Bearer {token}

{
  "step": number,
  "data": object,
  "business_context": object?
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "is_valid": boolean,
    "errors": Record<string, string[]>,
    "warnings": Record<string, string[]>,
    "can_proceed": boolean,
    "required_fields": string[],
    "optional_fields": string[],
    "suggestions": string[]
  }
}
```

### 2. Validate Phase

```http
POST /api/validation/phase
Content-Type: application/json
Authorization: Bearer {token}

{
  "phase": number,
  "data": object
}
```

## File Upload APIs

### 1. Upload Document

```http
POST /api/upload/document
Content-Type: multipart/form-data
Authorization: Bearer {token}

Form Data:
  - file: File
  - business_id: string
  - document_type: "pitch_deck"|"one_pager"|"other"
  - description: string?
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "url": "string",
    "type": "string",
    "size": number,
    "uploaded_at": "datetime"
  }
}
```

### 2. Delete Document

```http
DELETE /api/upload/document/{documentId}
Authorization: Bearer {token}
```

## Export APIs

### 1. Export Positioning Report

```http
POST /api/export/positioning
Content-Type: application/json
Authorization: Bearer {token}

{
  "business_id": "string",
  "format": "pdf"|"json"|"markdown"|"docx",
  "template": "standard"|"detailed"|"presentation",
  "include_analysis": boolean
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "download_url": "string",
    "expires_at": "datetime",
    "file_size": number,
    "format": "string"
  }
}
```

### 2. Export Business Data

```http
GET /api/export/business/{businessId}
Query Parameters:
  - format: json|csv|xlsx
  - include_responses: boolean?
  - include_analysis: boolean?
Authorization: Bearer {token}
```

## Database Schema & Persistence Layer

### Extended Business Table

```sql
-- Extend existing businesses table
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS onboarding_data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS phase_progress JSONB DEFAULT '{}'::jsonb;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS ai_analysis JSONB DEFAULT '{}'::jsonb;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_businesses_onboarding_phase
ON businesses USING GIN ((onboarding_data->'current_phase'));

CREATE INDEX IF NOT EXISTS idx_businesses_progress
ON businesses USING GIN (phase_progress);
```

### New Tables

#### Strategic Responses

```sql
CREATE TABLE strategic_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  response TEXT NOT NULL,
  ai_suggestion TEXT,
  confidence_level TEXT CHECK (confidence_level IN ('low', 'medium', 'high')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(business_id, question_id)
);

CREATE INDEX idx_strategic_responses_business_id ON strategic_responses(business_id);
CREATE INDEX idx_strategic_responses_question_id ON strategic_responses(question_id);
```

#### Market Segments

```sql
CREATE TABLE market_segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  characteristics JSONB DEFAULT '[]',
  pain_points JSONB DEFAULT '[]',
  opportunities JSONB DEFAULT '[]',
  ai_confidence NUMERIC(3,2) DEFAULT 0.0,
  is_primary BOOLEAN DEFAULT FALSE,
  is_custom BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- For predefined segments, business_id is NULL
  CONSTRAINT check_custom_has_business CHECK (
    (is_custom = TRUE AND business_id IS NOT NULL) OR
    (is_custom = FALSE)
  )
);

CREATE INDEX idx_market_segments_business_id ON market_segments(business_id);
CREATE INDEX idx_market_segments_is_custom ON market_segments(is_custom);
```

#### Customer Personas

```sql
CREATE TABLE customer_personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  segment_id UUID REFERENCES market_segments(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  title TEXT,
  age_range TEXT,
  characteristics JSONB DEFAULT '[]',
  pain_points JSONB DEFAULT '[]',
  goals JSONB DEFAULT '[]',
  information_sources JSONB DEFAULT '[]',
  trigger_events JSONB DEFAULT '[]',
  ai_confidence NUMERIC(3,2) DEFAULT 0.0,
  is_customized BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT check_customized_has_business CHECK (
    (is_customized = TRUE AND business_id IS NOT NULL) OR
    (is_customized = FALSE)
  )
);

CREATE INDEX idx_customer_personas_business_id ON customer_personas(business_id);
CREATE INDEX idx_customer_personas_segment_id ON customer_personas(segment_id);
```

#### Positioning Outputs

```sql
CREATE TABLE positioning_outputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  positioning_statement TEXT NOT NULL,
  segment_focus TEXT,
  persona_target TEXT,
  problem_solved TEXT,
  category_definition TEXT,
  unique_value_proposition TEXT,
  competitive_advantage TEXT,
  strategic_beliefs JSONB DEFAULT '[]',
  success_metrics JSONB DEFAULT '[]',
  positioning_strengths JSONB DEFAULT '{}',
  recommendations JSONB DEFAULT '[]',
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(business_id, version)
);

CREATE INDEX idx_positioning_outputs_business_id ON positioning_outputs(business_id);
CREATE INDEX idx_positioning_outputs_generated_at ON positioning_outputs(generated_at);
```

#### AI Interactions Log

```sql
CREATE TABLE ai_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('segment_suggestion', 'persona_suggestion', 'strategic_analysis', 'positioning_generation')),
  request_data JSONB NOT NULL,
  response_data JSONB NOT NULL,
  model_used TEXT,
  tokens_used INTEGER,
  processing_time_ms INTEGER,
  confidence_score NUMERIC(3,2),
  user_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_interactions_business_id ON ai_interactions(business_id);
CREATE INDEX idx_ai_interactions_type ON ai_interactions(interaction_type);
CREATE INDEX idx_ai_interactions_created_at ON ai_interactions(created_at);
```

### Data Access Layer (DAL)

#### Business Repository

```typescript
// /lib/repositories/business-repository.ts

export class BusinessRepository {
  async create(data: CreateBusinessData): Promise<Business>;
  async findById(id: string, userId: string): Promise<Business | null>;
  async update(id: string, data: Partial<Business>): Promise<Business>;
  async delete(id: string, userId: string): Promise<void>;
  async findByUser(userId: string): Promise<Business[]>;

  // Onboarding specific
  async saveProgress(
    businessId: string,
    phase: number,
    step: number,
    data: any
  ): Promise<void>;
  async getProgress(businessId: string): Promise<PhaseProgress>;
  async markPhaseComplete(businessId: string, phase: number): Promise<void>;
}
```

#### Strategic Response Repository

```typescript
// /lib/repositories/strategic-response-repository.ts

export class StrategicResponseRepository {
  async saveResponse(
    businessId: string,
    response: StrategicResponse
  ): Promise<StrategicResponse>;
  async getResponses(businessId: string): Promise<StrategicResponse[]>;
  async getResponseByQuestion(
    businessId: string,
    questionId: string
  ): Promise<StrategicResponse | null>;
  async updateResponse(
    businessId: string,
    questionId: string,
    updates: Partial<StrategicResponse>
  ): Promise<StrategicResponse>;
  async deleteResponse(businessId: string, questionId: string): Promise<void>;
}
```

#### Segment & Persona Repository

```typescript
// /lib/repositories/segment-persona-repository.ts

export class SegmentPersonaRepository {
  // Segments
  async getPredefinedSegments(
    filters?: SegmentFilters
  ): Promise<MarketSegment[]>;
  async getCustomSegments(businessId: string): Promise<MarketSegment[]>;
  async createCustomSegment(
    businessId: string,
    segment: CreateSegmentData
  ): Promise<MarketSegment>;

  // Personas
  async getPredefinedPersonas(segmentId?: string): Promise<CustomerPersona[]>;
  async getCustomPersonas(businessId: string): Promise<CustomerPersona[]>;
  async createCustomPersona(
    businessId: string,
    persona: CreatePersonaData
  ): Promise<CustomerPersona>;
}
```

### Caching Strategy

#### Redis Cache Configuration

```typescript
// /lib/cache/cache-config.ts

export const cacheConfig = {
  segments: {
    key: 'segments:predefined',
    ttl: 60 * 60 * 24, // 24 hours
  },
  personas: {
    key: (segmentId?: string) =>
      `personas:predefined${segmentId ? `:${segmentId}` : ''}`,
    ttl: 60 * 60 * 12, // 12 hours
  },
  questions: {
    key: 'questions:strategic',
    ttl: 60 * 60 * 24 * 7, // 7 days
  },
  aiSuggestions: {
    key: (businessId: string, context: string) =>
      `ai:suggestions:${businessId}:${context}`,
    ttl: 60 * 60 * 2, // 2 hours
  },
};
```

#### Cache Implementation

```typescript
// /lib/cache/cache-service.ts

export class CacheService {
  async get<T>(key: string): Promise<T | null>;
  async set<T>(key: string, value: T, ttl?: number): Promise<void>;
  async del(key: string): Promise<void>;
  async invalidatePattern(pattern: string): Promise<void>;

  // Specific cache methods
  async getSegments(): Promise<MarketSegment[] | null>;
  async setSegments(segments: MarketSegment[]): Promise<void>;
  async getPersonas(segmentId?: string): Promise<CustomerPersona[] | null>;
  async setPersonas(
    personas: CustomerPersona[],
    segmentId?: string
  ): Promise<void>;
}
```

## Data Sync & Conflict Resolution

### Conflict Detection

```typescript
interface DataConflict {
  field: string;
  local_value: any;
  server_value: any;
  local_timestamp: string;
  server_timestamp: string;
  resolution_strategy: 'keep_local' | 'keep_server' | 'manual_merge';
}
```

### Auto-Save Implementation

```typescript
// /lib/services/auto-save-service.ts

export class AutoSaveService {
  private saveQueue: Map<string, any> = new Map();
  private saveTimer: NodeJS.Timeout | null = null;

  queueSave(businessId: string, data: any): void;
  flush(): Promise<void>;
  private processSaveQueue(): Promise<void>;
}
```

## Error Handling & Monitoring

### API Error Standards

```typescript
interface APIError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    retry_after?: number;
    correlation_id: string;
  };
  metadata: {
    timestamp: string;
    request_id: string;
  };
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Input validation failed
- `BUSINESS_NOT_FOUND`: Business entity not found
- `UNAUTHORIZED`: User not authorized
- `AI_SERVICE_UNAVAILABLE`: AI service temporarily down
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `CONFLICT`: Data conflict detected
- `STORAGE_ERROR`: Database operation failed

### Monitoring & Analytics

```typescript
// /lib/analytics/onboarding-analytics.ts

export class OnboardingAnalytics {
  trackStepEntry(businessId: string, phase: number, step: number): void;
  trackStepCompletion(
    businessId: string,
    phase: number,
    step: number,
    timeSpent: number
  ): void;
  trackValidationError(
    businessId: string,
    step: number,
    errors: Record<string, string[]>
  ): void;
  trackAIInteraction(businessId: string, type: string, accepted: boolean): void;
  trackOnboardingCompletion(businessId: string, totalTime: number): void;
}
```

This comprehensive API and data persistence architecture provides the foundation for a robust, scalable, and maintainable business onboarding system.
