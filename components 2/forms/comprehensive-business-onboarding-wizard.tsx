'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/lib/stores/onboarding-store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Building2,
  Target,
  Users,
  MessageSquare,
  Award
} from 'lucide-react';

// Phase components
import { BusinessSetupPhase } from './onboarding/business-setup-phase';
import { SegmentSelectionPhase } from './onboarding/segment-selection-phase';
import { PersonaSelectionPhase } from './onboarding/persona-selection-phase';
import { StrategicQuestionsPhase } from './onboarding/strategic-questions-phase';
import { PositioningOutputPhase } from './onboarding/positioning-output-phase';

interface ComprehensiveBusinessOnboardingWizardProps {
  userId: string;
  onComplete?: (result?: any) => void;
  existingBusiness?: any;
}

export function ComprehensiveBusinessOnboardingWizard({
  userId,
  onComplete,
  existingBusiness
}: ComprehensiveBusinessOnboardingWizardProps) {
  const router = useRouter();
  const {
    currentPhase,
    currentStep,
    isLoading,
    completedPhases,
    setUserId,
    setBusinessId,
    setLoading,
    setCurrentPhase,
    completePhase,
    nextStep,
    previousStep
  } = useOnboardingStore();

  // Initialize the store with user data
  React.useEffect(() => {
    setUserId(userId);
    if (existingBusiness?.id) {
      setBusinessId(existingBusiness.id);
    }
  }, [userId, existingBusiness, setUserId, setBusinessId]);

  const phases = [
    {
      id: 1,
      title: 'Business Setup',
      icon: Building2,
      description: 'Basic information and services',
      estimatedTime: '2-3 min'
    },
    {
      id: 2,
      title: 'Segment Selection',
      icon: Target,
      description: 'Choose your target market',
      estimatedTime: '1 min'
    },
    {
      id: 3,
      title: 'Persona Selection',
      icon: Users,
      description: 'Define your ideal customer',
      estimatedTime: '1 min'
    },
    {
      id: 4,
      title: 'Strategic Questions',
      icon: MessageSquare,
      description: '15 positioning questions',
      estimatedTime: '13 min'
    },
    {
      id: 5,
      title: 'Positioning Results',
      icon: Award,
      description: 'Your complete positioning',
      estimatedTime: 'Instant'
    }
  ];

  const currentPhaseData = phases.find(p => p.id === currentPhase);
  const totalSteps = getCurrentPhaseSteps();

  function getCurrentPhaseSteps() {
    switch (currentPhase) {
      case 1: return 2; // Business basics + Services/Intelligence
      case 2: return 1; // Segment selection
      case 3: return 1; // Persona selection
      case 4: return 15; // 15 strategic questions
      case 5: return 1; // Results
      default: return 1;
    }
  }

  const handlePhaseComplete = async (phase: number) => {
    setLoading(true);
    try {
      completePhase(phase);

      if (phase < 5) {
        setCurrentPhase((phase + 1) as any);
        toast.success(`Phase ${phase} completed!`, {
          description: `Moving to ${phases[phase]?.title}...`
        });
      } else {
        // Final completion
        toast.success('Onboarding completed!', {
          description: 'Your strategic positioning is ready.'
        });

        if (onComplete) {
          onComplete();
        } else {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error completing phase:', error);
      toast.error('Failed to complete phase', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousPhase = () => {
    if (currentPhase > 1) {
      setCurrentPhase((currentPhase - 1) as any);
    }
  };

  const canAccessPhase = (phaseId: number) => {
    if (phaseId === 1) return true;
    return completedPhases.includes(phaseId - 1);
  };

  const renderCurrentPhase = () => {
    switch (currentPhase) {
      case 1:
        return (
          <BusinessSetupPhase
            onComplete={() => handlePhaseComplete(1)}
            onPrevious={currentStep > 1 ? previousStep : undefined}
            existingBusiness={existingBusiness}
          />
        );
      case 2:
        return (
          <SegmentSelectionPhase
            onComplete={() => handlePhaseComplete(2)}
            onPrevious={() => handlePreviousPhase()}
          />
        );
      case 3:
        return (
          <PersonaSelectionPhase
            onComplete={() => handlePhaseComplete(3)}
            onPrevious={() => handlePreviousPhase()}
          />
        );
      case 4:
        return (
          <StrategicQuestionsPhase
            onComplete={() => handlePhaseComplete(4)}
            onPrevious={() => handlePreviousPhase()}
          />
        );
      case 5:
        return (
          <PositioningOutputPhase
            onComplete={() => handlePhaseComplete(5)}
            onPrevious={() => handlePreviousPhase()}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Phase Progress Indicator */}
      <div className="mb-8">
        <div className="mb-4">
          <h1 className="text-2xl font-bold mb-2">Strategic Business Onboarding</h1>
          <p className="text-muted-foreground">
            Complete setup to generate your personalized positioning strategy
          </p>
        </div>

        {/* Phase Steps */}
        <div className="flex items-center justify-between mb-6">
          {phases.map((phase, index) => {
            const isCompleted = completedPhases.includes(phase.id);
            const isCurrent = currentPhase === phase.id;
            const isAccessible = canAccessPhase(phase.id);
            const Icon = phase.icon;

            return (
              <div key={phase.id} className="flex items-center">
                <div
                  className={cn(
                    "flex flex-col items-center text-center",
                    !isAccessible && "opacity-50"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-12 h-12 rounded-full border-2 mb-2 transition-colors",
                      isCompleted
                        ? "bg-primary border-primary text-primary-foreground"
                        : isCurrent
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-muted-foreground/30 text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  <div className="max-w-24">
                    <div
                      className={cn(
                        "text-sm font-medium mb-1",
                        isCurrent ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {phase.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {phase.estimatedTime}
                    </div>
                  </div>
                </div>
                {index < phases.length - 1 && (
                  <div className="flex-1 h-px bg-border mx-4 mt-6" />
                )}
              </div>
            );
          })}
        </div>

        {/* Current Phase Details */}
        {currentPhaseData && (
          <div className="bg-secondary/30 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">
                  Phase {currentPhase}: {currentPhaseData.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {currentPhaseData.description}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  Step {currentStep} of {totalSteps}
                </div>
                <div className="text-xs text-muted-foreground">
                  Est. {currentPhaseData.estimatedTime}
                </div>
              </div>
            </div>
            {/* Step progress bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Phase Content */}
      <div className="bg-card rounded-lg border p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Processing...</p>
            </div>
          </div>
        ) : (
          renderCurrentPhase()
        )}
      </div>

      {/* Phase Navigation (shown only when not in loading state) */}
      {!isLoading && (
        <div className="mt-6 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePreviousPhase}
            disabled={currentPhase === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous Phase
          </Button>

          {currentPhase < 5 && (
            <div className="text-sm text-muted-foreground">
              Complete this phase to continue
            </div>
          )}

          {currentPhase === 5 && (
            <Button
              onClick={() => handlePhaseComplete(5)}
              className="flex items-center gap-2"
            >
              Complete Onboarding
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}