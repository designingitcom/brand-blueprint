// Business onboarding utility functions
// These are client-side helper functions for onboarding logic

export type OnboardingPhase =
  | 'not_started'
  | 'business_setup'
  | 'segment_selection'
  | 'persona_selection'
  | 'strategic_questions'
  | 'completed';

/**
 * Check if onboarding is complete
 */
export function isOnboardingComplete(business: any): boolean {
  return (
    business?.onboarding_phase === 'completed' ||
    business?.strategic_onboarding_completed_at !== null
  );
}

/**
 * Get onboarding completion percentage
 */
export function getOnboardingCompletionPercentage(business: any): number {
  if (!business) return 0;

  const phase = business.onboarding_phase;
  const phases: OnboardingPhase[] = [
    'not_started',
    'business_setup',
    'segment_selection',
    'persona_selection',
    'strategic_questions',
    'completed',
  ];
  const currentPhaseIndex = phases.indexOf(phase);

  if (currentPhaseIndex === -1) return 0;
  if (currentPhaseIndex === phases.length - 1) return 100;

  // Calculate percentage based on phase progress
  const baseProgress = (currentPhaseIndex / (phases.length - 1)) * 100;

  // Add step progress within current phase
  const step = business.onboarding_step || 0;
  let maxStepsInPhase = 1;

  switch (phase) {
    case 'business_setup':
      maxStepsInPhase = 2; // Basic info + Services
      break;
    case 'segment_selection':
      maxStepsInPhase = 1;
      break;
    case 'persona_selection':
      maxStepsInPhase = 1;
      break;
    case 'strategic_questions':
      maxStepsInPhase = 15; // 15 questions
      break;
  }

  const stepProgress = (step / maxStepsInPhase) * (100 / (phases.length - 1));

  return Math.min(100, Math.round(baseProgress + stepProgress));
}

/**
 * Get next onboarding step
 */
export function getNextOnboardingStep(
  business: any
): { phase: string; step: number; description: string } | null {
  if (!business || isOnboardingComplete(business)) return null;

  const phase = business.onboarding_phase;
  const step = business.onboarding_step || 0;

  switch (phase) {
    case 'not_started':
      return {
        phase: 'business_setup',
        step: 0,
        description: 'Complete basic business information',
      };
    case 'business_setup':
      if (step === 0)
        return {
          phase: 'business_setup',
          step: 1,
          description: 'Add services and competitors',
        };
      return {
        phase: 'segment_selection',
        step: 0,
        description: 'Select primary market segment',
      };
    case 'segment_selection':
      return {
        phase: 'persona_selection',
        step: 0,
        description: 'Choose buyer persona',
      };
    case 'persona_selection':
      return {
        phase: 'strategic_questions',
        step: 0,
        description: 'Answer strategic positioning questions',
      };
    case 'strategic_questions':
      const responses = business.strategic_responses || {};
      const completedQuestions = Object.keys(responses).length;
      if (completedQuestions < 15) {
        return {
          phase: 'strategic_questions',
          step: completedQuestions,
          description: `Answer question ${completedQuestions + 1} of 15`,
        };
      }
      return {
        phase: 'completed',
        step: 0,
        description: 'Generate positioning output',
      };
    default:
      return null;
  }
}

/**
 * Get phase display name
 */
export function getPhaseDisplayName(phase: OnboardingPhase): string {
  switch (phase) {
    case 'not_started':
      return 'Getting Started';
    case 'business_setup':
      return 'Business Setup';
    case 'segment_selection':
      return 'Target Segment';
    case 'persona_selection':
      return 'Buyer Persona';
    case 'strategic_questions':
      return 'Strategic Questions';
    case 'completed':
      return 'Complete';
    default:
      return 'Unknown';
  }
}

/**
 * Get step display info for a phase
 */
export function getStepDisplayInfo(
  phase: OnboardingPhase,
  step: number
): { title: string; description: string } {
  switch (phase) {
    case 'business_setup':
      return step === 0
        ? { title: 'Business Basics', description: 'Name, website, industry' }
        : {
            title: 'Services & Intelligence',
            description: 'Offerings and competitors',
          };

    case 'segment_selection':
      return {
        title: 'Target Segment',
        description: 'Choose your primary market',
      };

    case 'persona_selection':
      return {
        title: 'Buyer Persona',
        description: 'Select ideal customer profile',
      };

    case 'strategic_questions':
      return {
        title: `Question ${step + 1}`,
        description: 'Strategic positioning questions',
      };

    case 'completed':
      return { title: 'Complete', description: 'Positioning generated' };

    default:
      return { title: 'Unknown', description: '' };
  }
}
