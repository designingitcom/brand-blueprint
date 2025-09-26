/**
 * Business Onboarding Zustand Store
 * Centralized state management for the 4-phase onboarding flow
 */

import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  Business,
  PhaseProgress,
  NavigationHistoryItem,
  OnboardingUIState,
  AIAssistantState,
  AISuggestion,
  StrategicResponse,
  MarketSegment,
  CustomerPersona,
  PositioningOutput,
  OnboardingError,
  StepValidation,
  ConfidenceLevel,
  getPhaseByStep,
  getStepsByPhase,
  isValidPhase,
  isValidStep,
  createEmptyBusiness,
} from '@/types/onboarding';

// ============================================================================
// Store Interface Definition
// ============================================================================

interface OnboardingStore {
  // Core state
  business: Partial<Business>;
  businessId?: string;

  // Navigation state
  currentPhase: number;
  currentStep: number;
  navigationHistory: NavigationHistoryItem[];
  canNavigateForward: boolean;
  canNavigateBackward: boolean;

  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  isValidating: boolean;

  // UI state
  ui: OnboardingUIState;

  // AI state
  ai: AIAssistantState;

  // Validation state
  validationErrors: Record<string, string[]>;
  stepValidation: Record<number, StepValidation>;

  // Data collections
  availableSegments: MarketSegment[];
  availablePersonas: CustomerPersona[];

  // Error handling
  errors: OnboardingError[];
  lastError?: OnboardingError;

  // Actions
  actions: {
    // Initialization
    initializeOnboarding: (businessId?: string) => Promise<void>;
    resetOnboarding: () => void;

    // Business data management
    updateBusiness: (updates: Partial<Business>) => void;
    loadBusiness: (businessId: string) => Promise<void>;
    saveBusiness: (autoSave?: boolean) => Promise<void>;

    // Navigation
    goToStep: (phase: number, step: number) => Promise<boolean>;
    goNext: () => Promise<boolean>;
    goPrevious: () => Promise<boolean>;
    goToPhase: (phase: number) => Promise<boolean>;

    // Validation
    validateCurrentStep: () => Promise<StepValidation>;
    validatePhase: (phase: number) => Promise<boolean>;
    clearValidationErrors: (field?: string) => void;

    // AI interactions
    requestAISuggestion: (
      questionId: string,
      context?: string
    ) => Promise<void>;
    acceptAISuggestion: (questionId: string, suggestionId: string) => void;
    rejectAISuggestion: (questionId: string, suggestionId: string) => void;
    setConfidenceLevel: (questionId: string, level: ConfidenceLevel) => void;
    toggleAIPanel: () => void;

    // Data management
    loadSegments: () => Promise<void>;
    loadPersonas: (segmentId?: string) => Promise<void>;
    addCustomSegment: (segment: Omit<MarketSegment, 'id'>) => void;
    addCustomPersona: (persona: Omit<CustomerPersona, 'id'>) => void;

    // UI actions
    toggleSidebar: () => void;
    setFullscreen: (fullscreen: boolean) => void;
    setTheme: (theme: 'light' | 'dark' | 'auto') => void;

    // Error handling
    addError: (error: OnboardingError) => void;
    clearErrors: () => void;
    retryFailedAction: () => Promise<void>;

    // Progress tracking
    updateProgress: (phase: number, step: number) => void;
    markPhaseComplete: (phase: number) => void;
    markStepComplete: (step: number) => void;

    // Export/Import
    exportData: () => string;
    importData: (data: string) => boolean;
  };
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useOnboardingStore = create<OnboardingStore>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        // Initial state
        business: createEmptyBusiness(),
        businessId: undefined,
        currentPhase: 1,
        currentStep: 1,
        navigationHistory: [],
        canNavigateForward: false,
        canNavigateBackward: false,
        isLoading: false,
        isSaving: false,
        isValidating: false,

        ui: {
          sidebarCollapsed: false,
          showAIPanel: false,
          showProgressDetails: false,
          currentStepErrors: {},
          isFullscreen: false,
          theme: 'auto',
        },

        ai: {
          isVisible: false,
          isLoading: false,
          currentSuggestions: [],
          chatHistory: [],
          confidenceLevels: {},
        },

        validationErrors: {},
        stepValidation: {},
        availableSegments: [],
        availablePersonas: [],
        errors: [],

        // Actions implementation
        actions: {
          // ============================================================================
          // Initialization Actions
          // ============================================================================

          initializeOnboarding: async (businessId?: string) => {
            set(state => {
              state.isLoading = true;
              state.errors = [];
            });

            try {
              if (businessId) {
                await get().actions.loadBusiness(businessId);
              } else {
                // Create new business
                set(state => {
                  state.business = createEmptyBusiness();
                  state.currentPhase = 1;
                  state.currentStep = 1;
                });
              }

              // Load initial data
              await Promise.all([
                get().actions.loadSegments(),
                get().actions.loadPersonas(),
              ]);

              // Update navigation state
              const validation = await get().actions.validateCurrentStep();
              set(state => {
                state.canNavigateForward = validation.canProceed;
                state.canNavigateBackward = state.currentStep > 1;
              });
            } catch (error) {
              get().actions.addError({
                type: 'persistence',
                message: 'Failed to initialize onboarding',
                code: 'INIT_ERROR',
                timestamp: new Date().toISOString(),
              });
            } finally {
              set(state => {
                state.isLoading = false;
              });
            }
          },

          resetOnboarding: () => {
            set(state => {
              state.business = createEmptyBusiness();
              state.businessId = undefined;
              state.currentPhase = 1;
              state.currentStep = 1;
              state.navigationHistory = [];
              state.validationErrors = {};
              state.stepValidation = {};
              state.errors = [];
              state.ai.currentSuggestions = [];
              state.ai.chatHistory = [];
              state.ai.confidenceLevels = {};
            });
          },

          // ============================================================================
          // Business Data Management
          // ============================================================================

          updateBusiness: (updates: Partial<Business>) => {
            set(state => {
              // Deep merge updates with existing business data
              Object.assign(state.business, updates);

              // Update last saved timestamp
              state.business.updated_at = new Date().toISOString();
            });

            // Trigger auto-save after 2 seconds of inactivity
            const autoSaveTimer = setTimeout(() => {
              get().actions.saveBusiness(true);
            }, 2000);

            // Clear previous timer if exists
            if ((window as any).onboardingAutoSaveTimer) {
              clearTimeout((window as any).onboardingAutoSaveTimer);
            }
            (window as any).onboardingAutoSaveTimer = autoSaveTimer;
          },

          loadBusiness: async (businessId: string) => {
            set(state => {
              state.isLoading = true;
            });

            try {
              const response = await fetch(`/api/businesses/${businessId}`);
              if (!response.ok) {
                throw new Error('Failed to load business');
              }

              const { data: business } = await response.json();

              set(state => {
                state.business = business;
                state.businessId = businessId;
                state.currentPhase =
                  business.phase_progress?.current_phase || 1;
                state.currentStep = business.phase_progress?.current_step || 1;
              });
            } catch (error) {
              get().actions.addError({
                type: 'persistence',
                message: `Failed to load business: ${error}`,
                code: 'LOAD_ERROR',
                timestamp: new Date().toISOString(),
              });
            } finally {
              set(state => {
                state.isLoading = false;
              });
            }
          },

          saveBusiness: async (autoSave = false) => {
            if (get().isSaving) return; // Prevent concurrent saves

            set(state => {
              state.isSaving = true;
            });

            try {
              const { business, businessId } = get();
              const url = businessId
                ? `/api/businesses/${businessId}`
                : '/api/businesses';
              const method = businessId ? 'PATCH' : 'POST';

              const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...business,
                  auto_save: autoSave,
                }),
              });

              if (!response.ok) {
                throw new Error('Failed to save business');
              }

              const { data: savedBusiness } = await response.json();

              set(state => {
                state.business = savedBusiness;
                state.businessId = savedBusiness.id;
                state.business.last_saved_at = new Date().toISOString();
              });
            } catch (error) {
              get().actions.addError({
                type: 'persistence',
                message: `Failed to save business: ${error}`,
                code: 'SAVE_ERROR',
                timestamp: new Date().toISOString(),
              });
            } finally {
              set(state => {
                state.isSaving = false;
              });
            }
          },

          // ============================================================================
          // Navigation Actions
          // ============================================================================

          goToStep: async (phase: number, step: number) => {
            if (!isValidPhase(phase) || !isValidStep(step)) {
              return false;
            }

            const currentPhase = get().currentPhase;
            const currentStep = get().currentStep;

            // Validate current step before moving if going forward
            if (
              phase > currentPhase ||
              (phase === currentPhase && step > currentStep)
            ) {
              const validation = await get().actions.validateCurrentStep();
              if (!validation.canProceed) {
                return false;
              }
            }

            // Add to navigation history
            const historyItem: NavigationHistoryItem = {
              phase: currentPhase,
              step: currentStep,
              timestamp: new Date().toISOString(),
              action: 'navigate',
            };

            set(state => {
              state.currentPhase = phase;
              state.currentStep = step;
              state.navigationHistory.push(historyItem);
              state.canNavigateBackward = step > 1;
            });

            // Update progress
            get().actions.updateProgress(phase, step);

            // Validate new step
            const newValidation = await get().actions.validateCurrentStep();
            set(state => {
              state.canNavigateForward = newValidation.canProceed;
            });

            return true;
          },

          goNext: async () => {
            const { currentPhase, currentStep } = get();
            const phaseSteps = getStepsByPhase(currentPhase);
            const currentStepIndex = phaseSteps.indexOf(currentStep);

            if (currentStepIndex < phaseSteps.length - 1) {
              // Next step in same phase
              const nextStep = phaseSteps[currentStepIndex + 1];
              return get().actions.goToStep(currentPhase, nextStep);
            } else if (currentPhase < 4) {
              // First step of next phase
              const nextPhase = currentPhase + 1;
              const nextPhaseSteps = getStepsByPhase(nextPhase);
              return get().actions.goToStep(nextPhase, nextPhaseSteps[0]);
            }

            return false;
          },

          goPrevious: async () => {
            const { currentPhase, currentStep } = get();
            const phaseSteps = getStepsByPhase(currentPhase);
            const currentStepIndex = phaseSteps.indexOf(currentStep);

            if (currentStepIndex > 0) {
              // Previous step in same phase
              const prevStep = phaseSteps[currentStepIndex - 1];
              return get().actions.goToStep(currentPhase, prevStep);
            } else if (currentPhase > 1) {
              // Last step of previous phase
              const prevPhase = currentPhase - 1;
              const prevPhaseSteps = getStepsByPhase(prevPhase);
              const lastStep = prevPhaseSteps[prevPhaseSteps.length - 1];
              return get().actions.goToStep(prevPhase, lastStep);
            }

            return false;
          },

          goToPhase: async (phase: number) => {
            if (!isValidPhase(phase)) return false;

            const phaseSteps = getStepsByPhase(phase);
            return get().actions.goToStep(phase, phaseSteps[0]);
          },

          // ============================================================================
          // Validation Actions
          // ============================================================================

          validateCurrentStep: async () => {
            const { currentStep, business } = get();

            set(state => {
              state.isValidating = true;
            });

            try {
              const response = await fetch('/api/validation/step', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ step: currentStep, business }),
              });

              const validation: StepValidation = await response.json();

              set(state => {
                state.stepValidation[currentStep] = validation;
                state.validationErrors = validation.errors;
              });

              return validation;
            } catch (error) {
              const fallbackValidation: StepValidation = {
                isValid: false,
                errors: { general: ['Validation service unavailable'] },
                warnings: {},
                canProceed: false,
                requiredFields: [],
                optionalFields: [],
              };

              set(state => {
                state.stepValidation[currentStep] = fallbackValidation;
              });

              return fallbackValidation;
            } finally {
              set(state => {
                state.isValidating = false;
              });
            }
          },

          validatePhase: async (phase: number) => {
            const phaseSteps = getStepsByPhase(phase);
            const validations = await Promise.all(
              phaseSteps.map(step => {
                // Temporarily set step for validation
                const originalStep = get().currentStep;
                set(state => {
                  state.currentStep = step;
                });
                const validation = get().actions.validateCurrentStep();
                set(state => {
                  state.currentStep = originalStep;
                });
                return validation;
              })
            );

            return validations.every(v => v.isValid);
          },

          clearValidationErrors: (field?: string) => {
            set(state => {
              if (field) {
                delete state.validationErrors[field];
              } else {
                state.validationErrors = {};
              }
            });
          },

          // ============================================================================
          // AI Actions
          // ============================================================================

          requestAISuggestion: async (questionId: string, context?: string) => {
            set(state => {
              state.ai.isLoading = true;
            });

            try {
              const { business } = get();
              const response = await fetch('/api/ai/suggest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  question_id: questionId,
                  business_context: business,
                  additional_context: context,
                }),
              });

              const { suggestions }: { suggestions: AISuggestion[] } =
                await response.json();

              set(state => {
                state.ai.currentSuggestions.push(...suggestions);
              });
            } catch (error) {
              get().actions.addError({
                type: 'ai_service',
                message: `AI suggestion failed: ${error}`,
                code: 'AI_ERROR',
                timestamp: new Date().toISOString(),
              });
            } finally {
              set(state => {
                state.ai.isLoading = false;
              });
            }
          },

          acceptAISuggestion: (questionId: string, suggestionId: string) => {
            const suggestion = get().ai.currentSuggestions.find(
              s => s.id === suggestionId
            );
            if (!suggestion) return;

            // Update business data with suggestion
            const response: StrategicResponse = {
              question_id: questionId,
              question_text: suggestion.question_id, // This should be looked up properly
              response: suggestion.suggestion,
              ai_suggestion: suggestion.suggestion,
              confidence_level: 'high',
              metadata: {
                time_to_answer: 0,
                revised_count: 0,
                word_count: suggestion.suggestion.split(' ').length,
                last_updated: new Date().toISOString(),
              },
            };

            set(state => {
              if (!state.business.strategic_responses) {
                state.business.strategic_responses = [];
              }

              const existingIndex =
                state.business.strategic_responses.findIndex(
                  r => r.question_id === questionId
                );

              if (existingIndex >= 0) {
                state.business.strategic_responses[existingIndex] = response;
              } else {
                state.business.strategic_responses.push(response);
              }

              // Set confidence level
              state.ai.confidenceLevels[questionId] = suggestion.confidence;
            });
          },

          rejectAISuggestion: (questionId: string, suggestionId: string) => {
            set(state => {
              state.ai.currentSuggestions = state.ai.currentSuggestions.filter(
                s => s.id !== suggestionId
              );
            });
          },

          setConfidenceLevel: (questionId: string, level: ConfidenceLevel) => {
            const confidenceMap = { low: 0.3, medium: 0.6, high: 0.9 };

            set(state => {
              state.ai.confidenceLevels[questionId] = confidenceMap[level];

              // Update response if it exists
              if (state.business.strategic_responses) {
                const response = state.business.strategic_responses.find(
                  r => r.question_id === questionId
                );
                if (response) {
                  response.confidence_level = level;
                }
              }
            });
          },

          toggleAIPanel: () => {
            set(state => {
              state.ai.isVisible = !state.ai.isVisible;
              state.ui.showAIPanel = state.ai.isVisible;
            });
          },

          // ============================================================================
          // Data Management Actions
          // ============================================================================

          loadSegments: async () => {
            try {
              const response = await fetch('/api/data/segments');
              const { segments } = await response.json();

              set(state => {
                state.availableSegments = segments;
              });
            } catch (error) {
              get().actions.addError({
                type: 'network',
                message: `Failed to load segments: ${error}`,
                code: 'SEGMENTS_LOAD_ERROR',
                timestamp: new Date().toISOString(),
              });
            }
          },

          loadPersonas: async (segmentId?: string) => {
            try {
              const url = segmentId
                ? `/api/data/personas?segment=${segmentId}`
                : '/api/data/personas';
              const response = await fetch(url);
              const { personas } = await response.json();

              set(state => {
                state.availablePersonas = personas;
              });
            } catch (error) {
              get().actions.addError({
                type: 'network',
                message: `Failed to load personas: ${error}`,
                code: 'PERSONAS_LOAD_ERROR',
                timestamp: new Date().toISOString(),
              });
            }
          },

          addCustomSegment: (segment: Omit<MarketSegment, 'id'>) => {
            set(state => {
              const newSegment: MarketSegment = {
                ...segment,
                id: `custom_${Date.now()}`,
                is_custom: true,
              };
              state.availableSegments.push(newSegment);
            });
          },

          addCustomPersona: (persona: Omit<CustomerPersona, 'id'>) => {
            set(state => {
              const newPersona: CustomerPersona = {
                ...persona,
                id: `custom_${Date.now()}`,
                is_customized: true,
              };
              state.availablePersonas.push(newPersona);
            });
          },

          // ============================================================================
          // UI Actions
          // ============================================================================

          toggleSidebar: () => {
            set(state => {
              state.ui.sidebarCollapsed = !state.ui.sidebarCollapsed;
            });
          },

          setFullscreen: (fullscreen: boolean) => {
            set(state => {
              state.ui.isFullscreen = fullscreen;
            });
          },

          setTheme: (theme: 'light' | 'dark' | 'auto') => {
            set(state => {
              state.ui.theme = theme;
            });
          },

          // ============================================================================
          // Error Handling Actions
          // ============================================================================

          addError: (error: OnboardingError) => {
            set(state => {
              state.errors.push(error);
              state.lastError = error;
            });
          },

          clearErrors: () => {
            set(state => {
              state.errors = [];
              state.lastError = undefined;
            });
          },

          retryFailedAction: async () => {
            const { lastError } = get();
            if (!lastError) return;

            // Implement retry logic based on error type
            switch (lastError.type) {
              case 'persistence':
                await get().actions.saveBusiness();
                break;
              case 'network':
                // Retry network requests
                break;
              case 'ai_service':
                // Retry AI suggestions
                break;
            }
          },

          // ============================================================================
          // Progress Tracking Actions
          // ============================================================================

          updateProgress: (phase: number, step: number) => {
            set(state => {
              if (!state.business.phase_progress) {
                state.business.phase_progress = {
                  current_phase: phase,
                  current_step: step,
                  completed_phases: [],
                  completed_steps: [],
                  phase_completion: {},
                };
              }

              state.business.phase_progress.current_phase = phase;
              state.business.phase_progress.current_step = step;

              // Mark previous steps as completed
              for (let p = 1; p < phase; p++) {
                if (
                  !state.business.phase_progress.completed_phases.includes(p)
                ) {
                  state.business.phase_progress.completed_phases.push(p);
                }
              }

              for (let s = 1; s < step; s++) {
                if (
                  !state.business.phase_progress.completed_steps.includes(s)
                ) {
                  state.business.phase_progress.completed_steps.push(s);
                }
              }
            });
          },

          markPhaseComplete: (phase: number) => {
            set(state => {
              if (!state.business.phase_progress) return;

              if (
                !state.business.phase_progress.completed_phases.includes(phase)
              ) {
                state.business.phase_progress.completed_phases.push(phase);
              }

              // Update phase completion details
              const phaseSteps = getStepsByPhase(phase);
              state.business.phase_progress.phase_completion[phase] = {
                started_at:
                  state.business.phase_progress.phase_completion[phase]
                    ?.started_at || new Date().toISOString(),
                completed_at: new Date().toISOString(),
                progress_percentage: 100,
                steps_completed: phaseSteps,
              };
            });
          },

          markStepComplete: (step: number) => {
            set(state => {
              if (!state.business.phase_progress) return;

              if (
                !state.business.phase_progress.completed_steps.includes(step)
              ) {
                state.business.phase_progress.completed_steps.push(step);
              }
            });
          },

          // ============================================================================
          // Export/Import Actions
          // ============================================================================

          exportData: () => {
            const { business, currentPhase, currentStep } = get();
            const exportData = {
              business,
              currentPhase,
              currentStep,
              exportedAt: new Date().toISOString(),
              version: '1.0',
            };
            return JSON.stringify(exportData, null, 2);
          },

          importData: (data: string) => {
            try {
              const parsed = JSON.parse(data);

              set(state => {
                state.business = parsed.business;
                state.currentPhase = parsed.currentPhase || 1;
                state.currentStep = parsed.currentStep || 1;
              });

              return true;
            } catch (error) {
              get().actions.addError({
                type: 'user_input',
                message: 'Failed to import data: Invalid format',
                code: 'IMPORT_ERROR',
                timestamp: new Date().toISOString(),
              });
              return false;
            }
          },
        },
      })),
      {
        name: 'onboarding-store',
        partialize: state => ({
          business: state.business,
          businessId: state.businessId,
          currentPhase: state.currentPhase,
          currentStep: state.currentStep,
          ui: state.ui,
          ai: {
            confidenceLevels: state.ai.confidenceLevels,
          },
        }),
      }
    )
  )
);

// ============================================================================
// Store Hooks and Utilities
// ============================================================================

// Selector hooks for common use cases
export const useCurrentStep = () =>
  useOnboardingStore(state => ({
    phase: state.currentPhase,
    step: state.currentStep,
  }));

export const useNavigation = () =>
  useOnboardingStore(state => ({
    canGoForward: state.canNavigateForward,
    canGoBackward: state.canNavigateBackward,
    goNext: state.actions.goNext,
    goPrevious: state.actions.goPrevious,
    goToStep: state.actions.goToStep,
  }));

export const useBusinessData = () =>
  useOnboardingStore(state => ({
    business: state.business,
    updateBusiness: state.actions.updateBusiness,
    saveBusiness: state.actions.saveBusiness,
    isSaving: state.isSaving,
  }));

export const useValidation = () =>
  useOnboardingStore(state => ({
    errors: state.validationErrors,
    stepValidation: state.stepValidation,
    isValidating: state.isValidating,
    validateCurrentStep: state.actions.validateCurrentStep,
    clearErrors: state.actions.clearValidationErrors,
  }));

export const useAI = () =>
  useOnboardingStore(state => ({
    suggestions: state.ai.currentSuggestions,
    isLoading: state.ai.isLoading,
    confidenceLevels: state.ai.confidenceLevels,
    requestSuggestion: state.actions.requestAISuggestion,
    acceptSuggestion: state.actions.acceptAISuggestion,
    setConfidence: state.actions.setConfidenceLevel,
  }));

// Progress calculation utilities
export const calculateOverallProgress = (
  business: Partial<Business>
): number => {
  const totalSteps = 10;
  const completedSteps = business.phase_progress?.completed_steps?.length || 0;
  return (completedSteps / totalSteps) * 100;
};

export const calculatePhaseProgress = (
  phase: number,
  business: Partial<Business>
): number => {
  const phaseSteps = getStepsByPhase(phase);
  const completedSteps = business.phase_progress?.completed_steps || [];
  const phaseCompletedSteps = phaseSteps.filter(step =>
    completedSteps.includes(step)
  );
  return (phaseCompletedSteps.length / phaseSteps.length) * 100;
};

// Store event listeners for side effects
useOnboardingStore.subscribe(
  state => state.currentStep,
  (currentStep, previousStep) => {
    // Auto-save when changing steps
    if (previousStep && currentStep !== previousStep) {
      useOnboardingStore.getState().actions.saveBusiness(true);
    }
  }
);

useOnboardingStore.subscribe(
  state => state.business,
  business => {
    // Update document title with business name
    if (business.basic_info?.name) {
      document.title = `${business.basic_info.name} - Onboarding | S1BMW`;
    }
  },
  { equalityFn: (a, b) => a.basic_info?.name === b.basic_info?.name }
);

export default useOnboardingStore;
