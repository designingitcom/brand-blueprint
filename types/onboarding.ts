/**
 * Business Onboarding System - TypeScript Definitions
 * Complete type definitions for the 4-phase, 10-step onboarding flow
 */

// ============================================================================
// Core Enums and Constants
// ============================================================================

export type BusinessType =
  | 'B2B'
  | 'B2C'
  | 'B2B2C'
  | 'Marketplace'
  | 'Non-profit';
export type YearsInBusiness = '<1' | '1-3' | '3-5' | '5-10' | '10+';
export type EmployeeCount = '1-10' | '11-50' | '51-200' | '200-1000' | '1000+';
export type BusinessModel =
  | 'Subscription'
  | 'One-time'
  | 'Retainer'
  | 'Commission';
export type CustomerLTV =
  | '<$1K'
  | '$1-10K'
  | '$10-100K'
  | '$100K+'
  | 'Not sure';
export type BusinessStatus = 'draft' | 'onboarding' | 'complete' | 'archived';
export type ConfidenceLevel = 'low' | 'medium' | 'high';

export const PHASES = {
  BUSINESS_SETUP: 1,
  STRATEGIC_FOUNDATION: 2,
  STRATEGIC_QUESTIONS: 3,
  RESULTS: 4,
} as const;

export const STEPS = {
  BASIC_INFO: 1,
  SERVICES_COMPETITION: 2,
  SEGMENT_SELECTION: 3,
  PERSONA_SELECTION: 4,
  PROBLEM_CATEGORY: 5,
  OBSTACLES_TRANSFORMATION: 6,
  IDENTITY_VALUES: 7,
  TRIGGERS_BELIEFS: 8,
  POSITION_VALUE: 9,
  COMPLETE_POSITIONING: 10,
} as const;

// ============================================================================
// Phase 1: Business Setup Data Structures
// ============================================================================

export interface Service {
  id?: string;
  name: string;
  url?: string;
  description?: string;
}

export interface Competitor {
  id?: string;
  url: string;
  name?: string;
  notes: string;
  strengths?: string[];
  weaknesses?: string[];
}

export interface UploadedDocument {
  id?: string;
  name: string;
  url: string;
  type: string;
  size?: number;
  uploadedAt?: string;
}

export interface BasicBusinessInfo {
  name: string;
  website_url?: string;
  linkedin_url?: string;
  industry: string;
  custom_industry?: string;
}

export interface BusinessDetails {
  business_type: BusinessType;
  years_in_business: YearsInBusiness;
  employee_count: EmployeeCount;
  business_model: BusinessModel;
  avg_customer_ltv: CustomerLTV;
  primary_goal: string;
}

export interface ServicesAndCompetition {
  services: Service[];
  competitors: Competitor[];
  documents: UploadedDocument[];
  annual_revenue?: string;
}

// ============================================================================
// Phase 2: Strategic Foundation Data Structures
// ============================================================================

export interface MarketSegment {
  id: string;
  title: string;
  description: string;
  characteristics: string[];
  pain_points: string[];
  opportunities: string[];
  size_estimate?: string;
  growth_rate?: string;
  ai_confidence: number;
  is_primary?: boolean;
  is_custom?: boolean;
  created_from_analysis?: boolean;
}

export interface CustomerPersona {
  id: string;
  name: string;
  title: string;
  age_range: string;
  company_size?: string;
  characteristics: string[];
  pain_points: string[];
  goals: string[];
  information_sources: string[];
  trigger_events: string[];
  decision_making_process?: string;
  budget_authority?: boolean;
  ai_confidence: number;
  is_customized?: boolean;
  segment_id?: string;
}

export interface SegmentSelection {
  selected_segments: string[]; // segment IDs
  primary_segment: string; // primary segment ID
  secondary_segment?: string; // optional secondary segment ID
  custom_segments?: MarketSegment[];
}

export interface PersonaSelection {
  selected_persona: string; // persona ID
  customization_notes?: string;
  custom_personas?: CustomerPersona[];
}

// ============================================================================
// Phase 3: Strategic Questions Data Structures
// ============================================================================

export interface StrategicQuestion {
  id: string;
  text: string;
  category:
    | 'problem'
    | 'category'
    | 'obstacle'
    | 'transformation'
    | 'identity'
    | 'values'
    | 'triggers'
    | 'beliefs'
    | 'position'
    | 'value';
  order: number;
  required: boolean;
  help_text?: string;
  examples?: string[];
  validation_criteria?: string[];
}

export interface StrategicResponse {
  question_id: string;
  question_text: string;
  response: string;
  ai_suggestion?: string;
  confidence_level: ConfidenceLevel;
  notes?: string;
  metadata: {
    cost_impact?: string;
    time_to_answer: number;
    revised_count: number;
    word_count: number;
    last_updated: string;
  };
}

export interface AIContext {
  business_type: BusinessType;
  industry: string;
  segment: MarketSegment;
  persona: CustomerPersona;
  previous_responses: StrategicResponse[];
  competitors: Competitor[];
}

export interface AISuggestion {
  id: string;
  question_id: string;
  suggestion: string;
  reasoning: string;
  confidence: number;
  alternatives?: string[];
  sources?: string[];
  generated_at: string;
}

// Strategic Question Groups
export interface ProblemCategoryQuestions {
  expensive_problem: StrategicResponse; // Q1
  category_context: StrategicResponse; // Q2
}

export interface ObstaclesTransformationQuestions {
  hidden_obstacle: StrategicResponse; // Q3
  transformation_desired: StrategicResponse; // Q4
}

export interface IdentityValuesQuestions {
  identity_markers: StrategicResponse; // Q5
  core_values: StrategicResponse; // Q6
}

export interface TriggersBeliefQuestions {
  trigger_moment: StrategicResponse; // Q7
  contrarian_belief: StrategicResponse; // Q8
}

export interface PositionValueQuestions {
  strategic_sacrifice: StrategicResponse; // Q9
  real_alternatives: StrategicResponse; // Q10
  only_position: StrategicResponse; // Q11
  decision_driver: StrategicResponse; // Q12
  unique_value: StrategicResponse; // Q13
  success_metrics: StrategicResponse; // Q14
  competitive_moats: StrategicResponse; // Q15
}

// ============================================================================
// Phase 4: Results Data Structures
// ============================================================================

export interface PositioningOutput {
  id?: string;
  positioning_statement: string;
  segment_focus: string;
  persona_target: string;
  problem_solved: string;
  category_definition: string;
  unique_value_proposition: string;
  competitive_advantage: string;
  strategic_beliefs: string[];
  success_metrics: string[];
  positioning_strengths: {
    problem_clarity: number; // 0-100
    segment_focus: number; // 0-100
    unique_position: number; // 0-100
    value_clarity: number; // 0-100
    overall: number; // 0-100
  };
  recommendations: string[];
  generated_at: string;
}

export interface PositioningAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  risks: string[];
  confidence_score: number;
  completeness_score: number;
  market_fit_score: number;
}

// ============================================================================
// Core Business Entity (Extended)
// ============================================================================

export interface Business {
  // Core identifiers
  id: string;
  user_id: string;
  name: string;
  slug: string;
  status: BusinessStatus;

  // Phase 1: Business Setup
  basic_info: BasicBusinessInfo;
  business_details: BusinessDetails;
  services_competition: ServicesAndCompetition;

  // Phase 2: Strategic Foundation
  segment_selection?: SegmentSelection;
  persona_selection?: PersonaSelection;

  // Phase 3: Strategic Questions
  strategic_responses?: StrategicResponse[];

  // Phase 4: Results
  positioning_output?: PositioningOutput;
  positioning_analysis?: PositioningAnalysis;

  // Progress tracking
  phase_progress: PhaseProgress;
  onboarding_completed: boolean;
  onboarding_completed_at?: string;

  // Metadata
  created_at: string;
  updated_at: string;
  last_saved_at?: string;
}

// ============================================================================
// Progress and Navigation
// ============================================================================

export interface PhaseProgress {
  current_phase: number;
  current_step: number;
  completed_phases: number[];
  completed_steps: number[];
  phase_completion: {
    [phase: number]: {
      started_at: string;
      completed_at?: string;
      progress_percentage: number;
      steps_completed: number[];
    };
  };
}

export interface NavigationHistoryItem {
  phase: number;
  step: number;
  timestamp: string;
  action: 'navigate' | 'save' | 'validate' | 'ai_suggest';
  data?: Record<string, any>;
}

export interface StepValidation {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
  canProceed: boolean;
  requiredFields: string[];
  optionalFields: string[];
}

// ============================================================================
// UI State and Components
// ============================================================================

export interface OnboardingUIState {
  sidebarCollapsed: boolean;
  showAIPanel: boolean;
  showProgressDetails: boolean;
  currentStepErrors: Record<string, string[]>;
  isFullscreen: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export interface StepComponentProps {
  business: Partial<Business>;
  onUpdate: (updates: Partial<Business>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLoading: boolean;
  validationErrors: Record<string, string[]>;
}

export interface AIAssistantState {
  isVisible: boolean;
  isLoading: boolean;
  currentSuggestions: AISuggestion[];
  chatHistory: ChatMessage[];
  confidenceLevels: Record<string, number>;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// API and Persistence
// ============================================================================

export interface APIResponse<T = any> {
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

export interface SaveProgressRequest {
  business_id: string;
  phase: number;
  step: number;
  data: Partial<Business>;
  auto_save: boolean;
}

export interface SaveProgressResponse {
  business: Business;
  conflicts?: Array<{
    field: string;
    local_value: any;
    server_value: any;
    resolution: 'keep_local' | 'keep_server' | 'manual_merge';
  }>;
}

// ============================================================================
// Analytics and Monitoring
// ============================================================================

export interface OnboardingAnalytics {
  session_id: string;
  business_id: string;
  user_id: string;
  started_at: string;
  completed_at?: string;
  total_time_spent: number;
  events: AnalyticsEvent[];
}

export interface AnalyticsEvent {
  type:
    | 'step_enter'
    | 'step_exit'
    | 'validation_error'
    | 'ai_suggestion_used'
    | 'save_progress'
    | 'navigation';
  timestamp: string;
  phase: number;
  step: number;
  data: Record<string, any>;
  user_action?: boolean;
}

// ============================================================================
// Validation and Form Schemas
// ============================================================================

export interface ValidationSchema {
  phase1: {
    step1: any; // Zod schema
    step2: any; // Zod schema
  };
  phase2: {
    step3: any; // Zod schema
    step4: any; // Zod schema
  };
  phase3: {
    responses: any; // Zod schema array
  };
  phase4: {
    positioning: any; // Zod schema
  };
}

export interface FormFieldConfig {
  name: string;
  type:
    | 'text'
    | 'select'
    | 'radio'
    | 'checkbox'
    | 'textarea'
    | 'file'
    | 'url'
    | 'email';
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: any; // Zod schema
  options?: Array<{ value: string; label: string }>;
  helpText?: string;
  dependencies?: string[]; // other field names this depends on
}

// ============================================================================
// Error Handling
// ============================================================================

export interface OnboardingError {
  type: 'validation' | 'network' | 'ai_service' | 'persistence' | 'user_input';
  message: string;
  code: string;
  field?: string;
  phase?: number;
  step?: number;
  retry_count?: number;
  timestamp: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  context: {
    phase: number;
    step: number;
    business_id?: string;
  };
}

// ============================================================================
// Export Collections
// ============================================================================

// Type guards
export const isValidPhase = (phase: number): boolean => {
  return phase >= 1 && phase <= 4;
};

export const isValidStep = (step: number): boolean => {
  return step >= 1 && step <= 10;
};

export const getStepsByPhase = (phase: number): number[] => {
  const phaseSteps: Record<number, number[]> = {
    1: [1, 2],
    2: [3, 4],
    3: [5, 6, 7, 8, 9],
    4: [10],
  };
  return phaseSteps[phase] || [];
};

export const getPhaseByStep = (step: number): number => {
  if (step <= 2) return 1;
  if (step <= 4) return 2;
  if (step <= 9) return 3;
  return 4;
};

// Default values
export const createEmptyBusiness = (): Partial<Business> => ({
  basic_info: {
    name: '',
    website_url: '',
    linkedin_url: '',
    industry: '',
    custom_industry: '',
  },
  business_details: {
    business_type: 'B2B',
    years_in_business: '<1',
    employee_count: '1-10',
    business_model: 'Subscription',
    avg_customer_ltv: 'Not sure',
    primary_goal: '',
  },
  services_competition: {
    services: [{ name: '', url: '' }],
    competitors: [{ url: '', notes: '' }],
    documents: [],
  },
  phase_progress: {
    current_phase: 1,
    current_step: 1,
    completed_phases: [],
    completed_steps: [],
    phase_completion: {},
  },
  onboarding_completed: false,
});

export const STRATEGIC_QUESTIONS: StrategicQuestion[] = [
  {
    id: 'Q1',
    text: 'What expensive problem does your target customer face?',
    category: 'problem',
    order: 1,
    required: true,
    help_text:
      'Focus on quantifiable costs - lost revenue, wasted time, or missed opportunities.',
    examples: [
      'Lost $500K annually from poor customer retention',
      'Wasting 20 hours/week on manual processes',
    ],
  },
  {
    id: 'Q2',
    text: 'When they look for solutions, what do they search for?',
    category: 'category',
    order: 2,
    required: true,
    help_text:
      'This defines your competitive category and positions you against alternatives.',
  },
  // ... Additional questions would be defined here
];
