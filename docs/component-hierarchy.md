# Business Onboarding Component Hierarchy & Navigation Flow

## Component Architecture Overview

This document defines the complete component hierarchy, navigation patterns, and implementation specifications for the business onboarding system.

## Root Component Structure

```
BusinessOnboardingFlow
├── OnboardingProvider (Zustand Store Context)
├── OnboardingLayout
│   ├── ProgressSidebar
│   │   ├── PhaseIndicator
│   │   ├── StepNavigator
│   │   └── ProgressActions
│   ├── MainContent
│   │   ├── StepHeader
│   │   ├── StepContainer
│   │   └── NavigationFooter
│   └── AIAssistantPanel (Optional)
└── ErrorBoundary
```

## Layout Components

### 1. OnboardingLayout

**Location**: `/components/onboarding/layout/OnboardingLayout.tsx`

```tsx
interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentPhase: number;
  currentStep: number;
  showSidebar?: boolean;
  showAIPanel?: boolean;
}
```

**Responsibilities**:

- Overall layout structure with sidebar and main content
- Responsive design breakpoints
- Sidebar toggle functionality
- AI panel integration

### 2. ProgressSidebar

**Location**: `/components/onboarding/layout/ProgressSidebar.tsx`

```tsx
interface ProgressSidebarProps {
  phases: PhaseConfig[];
  currentPhase: number;
  currentStep: number;
  onStepClick: (phase: number, step: number) => void;
  collapsed: boolean;
}
```

**Features**:

- Phase completion indicators
- Step navigation with validation checks
- Progress percentage display
- Collapsible design

### 3. MainContent

**Location**: `/components/onboarding/layout/MainContent.tsx`

```tsx
interface MainContentProps {
  children: React.ReactNode;
  showAIPanel: boolean;
  isFullscreen: boolean;
}
```

## Step Components Architecture

### Base Step Component

**Location**: `/components/onboarding/steps/BaseStep.tsx`

```tsx
interface BaseStepProps {
  title: string;
  description?: string;
  phase: number;
  step: number;
  children: React.ReactNode;
  onNext?: () => void;
  onPrevious?: () => void;
  canProceed?: boolean;
  isLoading?: boolean;
  validationErrors?: Record<string, string[]>;
}
```

### Phase 1 Components

#### Step 1: BasicInfoStep

**Location**: `/components/onboarding/steps/phase1/BasicInfoStep.tsx`

```tsx
interface BasicInfoStepProps extends BaseStepProps {
  data: BasicBusinessInfo;
  onUpdate: (data: Partial<BasicBusinessInfo>) => void;
  industries: string[];
}
```

**Form Fields**:

- Business Name (required)
- Website URL (optional, validated)
- LinkedIn Company URL (optional, validated)
- Industry Selection (required, dropdown)
- Custom Industry (conditional, required if "Other")

**UI Features**:

- Real-time validation
- Industry autocomplete
- URL format validation
- Progress save indicator

#### Step 2: BusinessDetailsStep

**Location**: `/components/onboarding/steps/phase1/BusinessDetailsStep.tsx`

```tsx
interface BusinessDetailsStepProps extends BaseStepProps {
  data: BusinessDetails;
  onUpdate: (data: Partial<BusinessDetails>) => void;
}
```

**Form Fields**:

- Business Type (radio group)
- Years in Business (radio group)
- Employee Count (radio group)
- Business Model (radio group)
- Average Customer LTV (radio group)
- Primary Goal (textarea)

**UI Features**:

- Radio group styling per CLAUDE.md standards
- Responsive grid layout
- Validation feedback
- Goal text counter

#### Step 3: ServicesCompetitionStep

**Location**: `/components/onboarding/steps/phase1/ServicesCompetitionStep.tsx`

```tsx
interface ServicesCompetitionStepProps extends BaseStepProps {
  data: ServicesAndCompetition;
  onUpdate: (data: Partial<ServicesAndCompetition>) => void;
}
```

**Sub-components**:

- ServicesList
- CompetitorsList
- DocumentUpload

### Phase 2 Components

#### Step 4: SegmentSelectionStep

**Location**: `/components/onboarding/steps/phase2/SegmentSelectionStep.tsx`

```tsx
interface SegmentSelectionStepProps extends BaseStepProps {
  data: SegmentSelection;
  availableSegments: MarketSegment[];
  onUpdate: (data: Partial<SegmentSelection>) => void;
  onRequestAI: () => void;
}
```

**Features**:

- AI-suggested segments display
- Multi-select with primary/secondary designation
- Custom segment creation
- Confidence indicators

#### Step 5: PersonaSelectionStep

**Location**: `/components/onboarding/steps/phase2/PersonaSelectionStep.tsx`

```tsx
interface PersonaSelectionStepProps extends BaseStepProps {
  data: PersonaSelection;
  availablePersonas: CustomerPersona[];
  selectedSegment: MarketSegment;
  onUpdate: (data: Partial<PersonaSelection>) => void;
  onCustomizePersona: (persona: CustomerPersona) => void;
}
```

**Features**:

- Persona cards with detailed information
- Customization options
- Chat with AI for persona refinement
- Preview of persona details

### Phase 3 Components

#### Strategic Question Components

**Base Location**: `/components/onboarding/steps/phase3/`

All strategic question steps extend from:

```tsx
interface StrategicQuestionStepProps extends BaseStepProps {
  questions: StrategicQuestion[];
  responses: StrategicResponse[];
  onUpdateResponse: (
    questionId: string,
    response: Partial<StrategicResponse>
  ) => void;
  onRequestAI: (questionId: string) => void;
  aiSuggestions: AISuggestion[];
}
```

**Step Components**:

- ProblemCategoryStep (Q1-Q2)
- ObstaclesTransformationStep (Q3-Q4)
- IdentityValuesStep (Q5-Q6)
- TriggersBeliefStep (Q7-Q8)
- PositionValueStep (Q9-Q15)

### Phase 4 Components

#### Step 10: CompletePositioningStep

**Location**: `/components/onboarding/steps/phase4/CompletePositioningStep.tsx`

```tsx
interface CompletePositioningStepProps extends BaseStepProps {
  positioningOutput: PositioningOutput;
  analysis: PositioningAnalysis;
  onExport: (format: 'pdf' | 'json' | 'markdown') => void;
  onShare: () => void;
}
```

## Shared Components

### 1. StepNavigation

**Location**: `/components/onboarding/shared/StepNavigation.tsx`

```tsx
interface StepNavigationProps {
  canGoBack: boolean;
  canGoForward: boolean;
  onPrevious: () => void;
  onNext: () => void;
  isLoading?: boolean;
  nextLabel?: string;
  previousLabel?: string;
}
```

### 2. ValidationAlert

**Location**: `/components/onboarding/shared/ValidationAlert.tsx`

```tsx
interface ValidationAlertProps {
  errors: Record<string, string[]>;
  warnings?: Record<string, string[]>;
  onDismiss?: () => void;
}
```

### 3. ProgressIndicator

**Location**: `/components/onboarding/shared/ProgressIndicator.tsx`

```tsx
interface ProgressIndicatorProps {
  totalSteps: number;
  currentStep: number;
  completedSteps: number[];
  phases: PhaseConfig[];
  showStepTitles?: boolean;
  onClick?: (step: number) => void;
}
```

### 4. AIAssistant Components

#### AIPanel

**Location**: `/components/onboarding/ai/AIPanel.tsx`

```tsx
interface AIPanelProps {
  isVisible: boolean;
  onToggle: () => void;
  currentContext: AIContext;
  suggestions: AISuggestion[];
  onAcceptSuggestion: (suggestionId: string) => void;
  onRejectSuggestion: (suggestionId: string) => void;
}
```

#### SuggestionCard

**Location**: `/components/onboarding/ai/SuggestionCard.tsx`

```tsx
interface SuggestionCardProps {
  suggestion: AISuggestion;
  onAccept: () => void;
  onReject: () => void;
  onViewReasoning: () => void;
}
```

#### ConfidenceIndicator

**Location**: `/components/onboarding/ai/ConfidenceIndicator.tsx`

```tsx
interface ConfidenceIndicatorProps {
  level: ConfidenceLevel;
  score?: number;
  onChange?: (level: ConfidenceLevel) => void;
  interactive?: boolean;
}
```

## Form Components

### 1. DynamicForm

**Location**: `/components/onboarding/forms/DynamicForm.tsx`

```tsx
interface DynamicFormProps {
  fields: FormFieldConfig[];
  data: Record<string, any>;
  onChange: (field: string, value: any) => void;
  errors?: Record<string, string[]>;
  disabled?: boolean;
}
```

### 2. FieldComponents

**Location**: `/components/onboarding/forms/fields/`

- TextInput
- SelectField
- RadioGroup
- CheckboxGroup
- TextArea
- FileUpload
- URLInput
- DynamicList (for services, competitors)

## Navigation Flow Architecture

### Navigation State Machine

```typescript
interface NavigationState {
  currentPhase: number;
  currentStep: number;
  history: NavigationHistoryItem[];
  canNavigate: {
    forward: boolean;
    backward: boolean;
    toStep: (step: number) => boolean;
  };
}

interface NavigationActions {
  goNext(): Promise<boolean>;
  goPrevious(): Promise<boolean>;
  goToStep(phase: number, step: number): Promise<boolean>;
  goToPhase(phase: number): Promise<boolean>;
  validateAndProceed(): Promise<boolean>;
}
```

### Navigation Rules

1. **Forward Navigation**:
   - Current step must be valid
   - Required fields completed
   - Validation passes
   - Can skip optional steps with confirmation

2. **Backward Navigation**:
   - Always allowed to previous steps
   - Changes are auto-saved
   - Validation warnings (not errors) for incomplete data

3. **Jump Navigation**:
   - Can jump to any completed step
   - Can jump within current phase if valid
   - Cannot jump to future phases without completion

4. **Validation Gates**:
   - Phase 1 → Phase 2: Basic business info complete
   - Phase 2 → Phase 3: Segment and persona selected
   - Phase 3 → Phase 4: All strategic questions answered
   - Phase 4: Complete onboarding

### URL Structure

```
/onboarding/business
/onboarding/business/[businessId]/phase/[phase]/step/[step]
```

**Examples**:

- `/onboarding/business/new/phase/1/step/1`
- `/onboarding/business/123/phase/2/step/3`
- `/onboarding/business/123/phase/3/step/7`

### Route Guards

```typescript
interface RouteGuard {
  canEnter(route: string, context: NavigationContext): boolean;
  canLeave(route: string, context: NavigationContext): boolean;
  redirect?: string;
  message?: string;
}
```

## Responsive Design

### Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Layout Adaptations

#### Mobile

- Sidebar collapses to bottom navigation
- Single column layout
- Touch-optimized controls
- Simplified AI panel

#### Tablet

- Collapsible sidebar
- Two-column layout for forms
- Overlay AI panel

#### Desktop

- Full sidebar always visible
- Multi-column layouts
- Side-by-side AI panel
- Keyboard shortcuts

## Accessibility Features

### ARIA Implementation

- Step navigation with role="tablist"
- Form validation announcements
- Progress indicators with aria-label
- Screen reader friendly descriptions

### Keyboard Navigation

- Tab order follows logical flow
- Enter to proceed, Escape to cancel
- Arrow keys for radio groups
- Ctrl+S to save progress

### Visual Accessibility

- High contrast mode support
- Focus indicators
- Color-blind friendly progress indicators
- Text size scaling support

## Performance Optimizations

### Code Splitting

```typescript
// Lazy load step components
const BasicInfoStep = lazy(() => import('./steps/phase1/BasicInfoStep'));
const BusinessDetailsStep = lazy(
  () => import('./steps/phase1/BusinessDetailsStep')
);
// ... etc
```

### Memoization Strategy

```typescript
// Memoize expensive operations
const MemoizedStepComponent = memo(StepComponent, (prev, next) => {
  return prev.data === next.data && prev.currentStep === next.currentStep;
});
```

### State Optimization

- Use Zustand selectors to prevent unnecessary re-renders
- Debounce auto-save operations
- Lazy load AI suggestions
- Cache validation results

## Testing Strategy

### Unit Tests

- Individual step components
- Form validation
- Navigation logic
- AI suggestion handling

### Integration Tests

- Complete flow navigation
- Data persistence
- AI integration
- Error handling

### E2E Tests

- Full onboarding journey
- Cross-browser compatibility
- Accessibility compliance
- Performance benchmarks

## Error Handling

### Error Boundaries

```tsx
<ErrorBoundary
  fallback={<OnboardingErrorFallback />}
  onError={(error, errorInfo) => logError(error, errorInfo)}
>
  <BusinessOnboardingFlow />
</ErrorBoundary>
```

### Error Types

- Validation errors (inline)
- Network errors (toast + retry)
- AI service errors (graceful degradation)
- Data persistence errors (auto-retry)

### Recovery Mechanisms

- Auto-save and restore
- Offline capability
- Retry mechanisms
- Fallback content

This component hierarchy provides a comprehensive foundation for implementing the business onboarding flow with excellent maintainability, testability, and user experience.
