# Business Onboarding System Architecture

## System Overview

This document defines the complete architecture for the 4-phase, 10-step business onboarding flow as specified in the Strategic S1BMW methodology. The system is designed to guide businesses through a comprehensive positioning framework with intelligent AI assistance.

## Architecture Decision Records (ADRs)

### ADR-001: State Management Pattern

**Decision**: Use Zustand for centralized state management
**Rationale**:

- Lightweight and performant for React applications
- Provides TypeScript support out of the box
- Enables persistent state across browser sessions
- Simpler than Redux for this use case
  **Consequences**: Single source of truth for form state, easier debugging, potential for state persistence

### ADR-002: Form Architecture Pattern

**Decision**: Multi-step wizard with centralized validation
**Rationale**:

- Each phase contains multiple related steps
- Validation can be progressive (step-by-step) or complete
- State is preserved across navigation
- Can support branching logic based on AI suggestions
  **Consequences**: Complex state management, need for navigation guards, better UX

### ADR-003: AI Integration Pattern

**Decision**: Server-side AI processing with client-side suggestions
**Rationale**:

- AI calls are expensive and should be cached
- Client should show loading states and fallbacks
- Suggestions should be pre-computed when possible
  **Consequences**: Need for background processing, caching strategy, error handling

### ADR-004: Data Persistence Strategy

**Decision**: Progressive saving with draft support
**Rationale**:

- Users can abandon and return to forms
- Business basics are saved immediately after Phase 1
- Strategic data is saved as drafts during completion
  **Consequences**: Complex state synchronization, need for conflict resolution

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Business Onboarding System                   │
├─────────────────────────────────────────────────────────────────┤
│  Phase 1: Business Setup                                       │
│  ├─ Step 1: Basic Info (name, website, industry)              │
│  └─ Step 2: Services & Competition                             │
│                                                                 │
│  Phase 2: Strategic Foundation                                  │
│  ├─ Step 3: Segment Selection                                  │
│  └─ Step 4: Persona Selection                                  │
│                                                                 │
│  Phase 3: Strategic Questions                                   │
│  ├─ Step 5: Problem & Category (Q1-Q2)                        │
│  ├─ Step 6: Obstacles & Transformation (Q3-Q4)               │
│  ├─ Step 7: Identity & Values (Q5-Q6)                         │
│  ├─ Step 8: Triggers & Beliefs (Q7-Q8)                        │
│  └─ Step 9: Position & Value (Q9-Q15)                         │
│                                                                 │
│  Phase 4: Results                                               │
│  └─ Step 10: Complete Positioning                              │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Core Components Hierarchy

```
BusinessOnboardingFlow
├── OnboardingProvider (Zustand context)
├── ProgressIndicator
├── StepContainer
│   ├── PhaseWrapper
│   ├── StepNavigation
│   └── StepContent
│       ├── Phase1Components
│       │   ├── BasicInfoStep
│       │   └── ServicesCompetitionStep
│       ├── Phase2Components
│       │   ├── SegmentSelectionStep
│       │   └── PersonaSelectionStep
│       ├── Phase3Components
│       │   ├── ProblemCategoryStep
│       │   ├── ObstaclesTransformationStep
│       │   ├── IdentityValuesStep
│       │   ├── TriggersBeliefStep
│       │   └── PositionValueStep
│       └── Phase4Components
│           └── CompletePositioningStep
└── AIAssistantProvider
    ├── SuggestionPanel
    ├── ChatInterface
    └── ConfidenceIndicator
```

## Data Architecture

### Core Data Entities

#### Business Entity (Extended)

```typescript
interface Business {
  // Existing fields
  id: string;
  user_id: string;
  name: string;
  slug: string;
  status: 'draft' | 'onboarding' | 'complete' | 'archived';

  // Phase 1: Business Setup
  website_url?: string;
  linkedin_url?: string;
  industry: string;
  custom_industry?: string;
  business_type: 'B2B' | 'B2C' | 'B2B2C' | 'Marketplace' | 'Non-profit';
  years_in_business: '<1' | '1-3' | '3-5' | '5-10' | '10+';
  employee_count: '1-10' | '11-50' | '51-200' | '200-1000' | '1000+';
  business_model: 'Subscription' | 'One-time' | 'Retainer' | 'Commission';
  avg_customer_ltv: '<$1K' | '$1-10K' | '$10-100K' | '$100K+' | 'Not sure';
  primary_goal: string;
  services: Service[];
  competitors: Competitor[];
  documents: UploadedDocument[];

  // Phase 2: Strategic Foundation
  selected_segments: MarketSegment[];
  selected_persona: CustomerPersona;

  // Phase 3: Strategic Questions
  strategic_responses: StrategicResponse[];

  // Phase 4: Results
  positioning_output: PositioningOutput;

  // Metadata
  onboarding_completed: boolean;
  onboarding_completed_at?: string;
  phase_progress: PhaseProgress;
  created_at: string;
  updated_at: string;
}
```

#### Market Segment

```typescript
interface MarketSegment {
  id: string;
  title: string;
  description: string;
  characteristics: string[];
  pain_points: string[];
  opportunities: string[];
  ai_confidence: number;
  is_primary: boolean;
}
```

#### Customer Persona

```typescript
interface CustomerPersona {
  id: string;
  name: string;
  title: string;
  age_range: string;
  characteristics: string[];
  pain_points: string[];
  goals: string[];
  information_sources: string[];
  trigger_events: string[];
  ai_confidence: number;
  is_customized: boolean;
}
```

#### Strategic Response

```typescript
interface StrategicResponse {
  question_id: string;
  question_text: string;
  response: string;
  ai_suggestion: string;
  confidence_level: 'low' | 'medium' | 'high';
  metadata: {
    cost_impact?: string;
    time_to_answer: number;
    revised_count: number;
  };
}
```

## State Management Architecture

### Zustand Store Structure

```typescript
interface OnboardingStore {
  // Current state
  currentPhase: number;
  currentStep: number;
  isLoading: boolean;
  isSaving: boolean;

  // Form data
  business: Partial<Business>;
  tempData: Record<string, any>;

  // UI state
  sidebarCollapsed: boolean;
  showAIPanel: boolean;
  validationErrors: Record<string, string[]>;

  // Navigation
  navigationHistory: NavigationHistoryItem[];
  canNavigateForward: boolean;
  canNavigateBackward: boolean;

  // AI state
  aiSuggestions: Record<string, AISuggestion>;
  confidenceLevels: Record<string, number>;

  // Actions
  actions: {
    // Navigation
    goToStep: (phase: number, step: number) => void;
    goNext: () => Promise<void>;
    goPrevious: () => void;

    // Data management
    updateBusinessData: (data: Partial<Business>) => void;
    saveProgress: () => Promise<void>;
    loadBusiness: (businessId: string) => Promise<void>;

    // AI interactions
    requestAISuggestion: (context: string) => Promise<void>;
    acceptAISuggestion: (questionId: string) => void;
    setConfidence: (questionId: string, level: number) => void;

    // Validation
    validateCurrentStep: () => boolean;
    validatePhase: (phase: number) => boolean;

    // UI actions
    toggleSidebar: () => void;
    toggleAIPanel: () => void;
    setLoadingState: (loading: boolean) => void;
  };
}
```

## Validation Architecture

### Zod Schema Definitions

```typescript
// Phase 1 Schemas
const BasicInfoSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  website_url: z.string().url().optional().or(z.literal('')),
  linkedin_url: z.string().optional(),
  industry: z.string().min(1, 'Industry is required'),
  custom_industry: z.string().optional(),
});

const BusinessDetailsSchema = z.object({
  business_type: z.enum(['B2B', 'B2C', 'B2B2C', 'Marketplace', 'Non-profit']),
  years_in_business: z.enum(['<1', '1-3', '3-5', '5-10', '10+']),
  employee_count: z.enum(['1-10', '11-50', '51-200', '200-1000', '1000+']),
  business_model: z.enum([
    'Subscription',
    'One-time',
    'Retainer',
    'Commission',
  ]),
  avg_customer_ltv: z.enum([
    '<$1K',
    '$1-10K',
    '$10-100K',
    '$100K+',
    'Not sure',
  ]),
  primary_goal: z.string().min(1, 'Primary goal is required'),
});

// Phase 2 Schemas
const SegmentSelectionSchema = z.object({
  selected_segments: z
    .array(z.string())
    .min(1, 'At least one segment required'),
  primary_segment: z.string().min(1, 'Primary segment is required'),
});

// Phase 3 Schemas
const StrategicQuestionSchema = z.object({
  response: z.string().min(10, 'Response must be at least 10 characters'),
  confidence_level: z.enum(['low', 'medium', 'high']),
});

// Complete validation schema
const OnboardingValidationSchema = z.object({
  phase1: z.object({
    step1: BasicInfoSchema,
    step2: BusinessDetailsSchema,
  }),
  phase2: z.object({
    step3: SegmentSelectionSchema,
    step4: z.object({
      selected_persona: z.string().min(1, 'Persona selection required'),
    }),
  }),
  phase3: z.object({
    responses: z.array(StrategicQuestionSchema).length(15),
  }),
});
```

## API Architecture

### Endpoint Design

```typescript
// Business Management
POST   /api/businesses                    // Create new business
GET    /api/businesses/:id               // Get business details
PATCH  /api/businesses/:id               // Update business
DELETE /api/businesses/:id               // Delete business

// Onboarding Specific
POST   /api/onboarding/start             // Initialize onboarding
PATCH  /api/onboarding/:id/progress      // Save progress
GET    /api/onboarding/:id/status        // Get current status

// AI Services
POST   /api/ai/suggest-segments          // Get segment suggestions
POST   /api/ai/suggest-personas          // Get persona suggestions
POST   /api/ai/analyze-response          // Analyze strategic response
POST   /api/ai/generate-positioning      // Generate final positioning

// Data Services
GET    /api/data/segments                // Get predefined segments
GET    /api/data/personas                // Get predefined personas
GET    /api/data/questions               // Get strategic questions
```

### API Response Patterns

```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: Record<string, any>;
  };
  metadata?: {
    timestamp: string;
    request_id: string;
    processing_time_ms: number;
  };
}

interface AISuggestionResponse {
  suggestions: Array<{
    id: string;
    title: string;
    description: string;
    confidence: number;
    reasoning: string;
  }>;
  context: {
    business_type: string;
    industry: string;
    analysis_depth: 'basic' | 'detailed' | 'comprehensive';
  };
}
```

## Database Schema Extensions

### New Tables for Onboarding

```sql
-- Strategic responses table
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
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market segments table
CREATE TABLE market_segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  characteristics JSONB DEFAULT '[]',
  pain_points JSONB DEFAULT '[]',
  opportunities JSONB DEFAULT '[]',
  ai_confidence NUMERIC(3,2) DEFAULT 0.0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer personas table
CREATE TABLE customer_personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Positioning output table
CREATE TABLE positioning_outputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  positioning_statement TEXT NOT NULL,
  segment_focus TEXT,
  persona_target TEXT,
  problem_solved TEXT,
  unique_value TEXT,
  competitive_advantage TEXT,
  success_metrics JSONB DEFAULT '{}',
  strength_score NUMERIC(3,2) DEFAULT 0.0,
  completeness_score NUMERIC(3,2) DEFAULT 0.0,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**: Load step components only when needed
2. **Data Prefetching**: Pre-load AI suggestions for likely next steps
3. **Caching**: Cache API responses for segments, personas, and questions
4. **Debounced Saving**: Save progress on input debounce to prevent excessive API calls
5. **Progressive Enhancement**: Core functionality works without JavaScript

### Monitoring and Analytics

```typescript
interface OnboardingAnalytics {
  session_id: string;
  business_id: string;
  events: AnalyticsEvent[];
}

interface AnalyticsEvent {
  type:
    | 'step_enter'
    | 'step_exit'
    | 'validation_error'
    | 'ai_suggestion_used'
    | 'save_progress';
  timestamp: string;
  data: Record<string, any>;
}
```

## Security Architecture

### Data Protection

- All form data encrypted in transit and at rest
- Progressive saving with user session validation
- Input sanitization and validation at multiple layers
- GDPR compliance for data collection and storage

### Access Control

- User must be authenticated to access onboarding
- Business data isolated by user ownership
- Admin users can view aggregated analytics only

## Error Handling Strategy

### Error Categories

1. **Validation Errors**: Field-level and form-level validation
2. **Network Errors**: API failures, timeout handling
3. **AI Service Errors**: Fallback to manual input when AI unavailable
4. **Data Persistence Errors**: Local storage backup, retry mechanisms

### User Experience

- Graceful degradation when services are unavailable
- Clear error messages with suggested actions
- Progress preservation during errors
- Offline capability for form completion

## Testing Strategy

### Component Testing

- Unit tests for each step component
- Integration tests for navigation flow
- E2E tests for complete onboarding journey

### Data Testing

- Validation schema testing
- API contract testing
- Database migration testing

### Performance Testing

- Load testing for AI endpoints
- Progressive saving performance
- Large form state management

This architecture provides a comprehensive foundation for implementing the business onboarding flow with scalability, maintainability, and excellent user experience in mind.
