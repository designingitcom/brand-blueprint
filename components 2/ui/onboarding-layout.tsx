'use client';

import * as React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from './dialog';
import { Button } from './button';
import { Badge } from './badge';
import { Alert, AlertDescription } from './alert';
import { MultiLevelProgress, Phase, Step } from './multi-level-progress';
import { AiChatBubble, ChatMessage } from './ai-chat-bubble';

interface OnboardingLayoutProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  phases: Phase[];
  currentPhaseId: number;
  currentStepId: number;
  canGoNext: boolean;
  canGoPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onSave?: () => void;
  onSkip?: () => void;
  isSaving?: boolean;
  errors?: string[];
  warnings?: string[];
  children: React.ReactNode;
  className?: string;

  // AI Chat integration
  showAiChat?: boolean;
  onAiChatToggle?: () => void;
  onSendMessage?: (message: string) => Promise<void>;
  chatMessages?: ChatMessage[];
  aiChatLoading?: boolean;
  aiSuggestedPrompts?: string[];
}

export function OnboardingLayout({
  isOpen,
  onClose,
  title,
  phases,
  currentPhaseId,
  currentStepId,
  canGoNext,
  canGoPrevious,
  onNext,
  onPrevious,
  onSave,
  onSkip,
  isSaving = false,
  errors = [],
  warnings = [],
  children,
  className,
  showAiChat = false,
  onAiChatToggle,
  onSendMessage,
  chatMessages = [],
  aiChatLoading = false,
  aiSuggestedPrompts = []
}: OnboardingLayoutProps) {
  const currentPhase = phases.find(p => p.id === currentPhaseId);
  const currentStep = currentPhase?.steps.find(s => s.id === currentStepId);
  const totalSteps = phases.reduce((acc, phase) => acc + phase.steps.length, 0);
  const completedSteps = phases.reduce((acc, phase) => {
    return acc + phase.steps.filter(step => step.completed).length;
  }, 0);

  const overallProgress = Math.round((completedSteps / totalSteps) * 100);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className={cn(
            'max-w-6xl max-h-[95vh] overflow-hidden p-0 gap-0',
            'border-2 border-primary/20',
            className
          )}
        >
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <DialogTitle className="text-xl font-semibold sr-only">
                  {title}
                </DialogTitle>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold text-foreground">
                    {title}
                  </h1>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {overallProgress}% Complete
                  </Badge>
                </div>
                {currentStep && (
                  <p className="text-sm text-muted-foreground">
                    {currentPhase?.title} • {currentStep.title}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {onAiChatToggle && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onAiChatToggle}
                    className={cn(
                      'h-8 w-8 p-0',
                      showAiChat && 'bg-primary/10 text-primary'
                    )}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span className="sr-only">AI Chat</span>
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            {/* Progress Section */}
            <div className="px-6 py-4 border-b border-border bg-card/50">
              <MultiLevelProgress
                phases={phases}
                currentPhaseId={currentPhaseId}
                currentStepId={currentStepId}
              />
            </div>

            {/* Content Section */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="px-6 py-6 space-y-6">
                {/* Errors and Warnings */}
                {errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        {errors.map((error, index) => (
                          <p key={index}>{error}</p>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {warnings.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        {warnings.map((warning, index) => (
                          <p key={index}>{warning}</p>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Main Content */}
                {children}
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-6 py-4 border-t border-border bg-card/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {canGoPrevious && (
                    <Button
                      variant="outline"
                      onClick={onPrevious}
                      disabled={isSaving}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                  )}

                  {onSkip && currentStepId < totalSteps && (
                    <Button
                      variant="ghost"
                      onClick={onSkip}
                      disabled={isSaving}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Skip for now
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {onSave && (
                    <Button
                      variant="outline"
                      onClick={onSave}
                      disabled={isSaving}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {isSaving ? 'Saving...' : 'Save Draft'}
                    </Button>
                  )}

                  <Button
                    onClick={onNext}
                    disabled={!canGoNext || isSaving}
                    className="flex items-center gap-2"
                  >
                    {isSaving ? (
                      'Processing...'
                    ) : currentStepId === totalSteps ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Complete Setup
                      </>
                    ) : (
                      <>
                        Continue
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Step Progress Indicator */}
              <div className="mt-3 flex justify-center">
                <div className="text-xs text-muted-foreground">
                  Step {currentStepId} of {totalSteps} •{' '}
                  {Math.round(((currentStepId - 1) / totalSteps) * 100)}%
                  complete
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Chat Bubble */}
      {showAiChat && onSendMessage && onAiChatToggle && (
        <AiChatBubble
          isOpen={showAiChat}
          onClose={onAiChatToggle}
          onSendMessage={onSendMessage}
          messages={chatMessages}
          isLoading={aiChatLoading}
          contextInfo={currentStep ? `${currentPhase?.title} - ${currentStep.title}` : undefined}
          suggestedPrompts={aiSuggestedPrompts}
        />
      )}
    </>
  );
}

// Animation variants for step transitions
export const stepTransitionVariants = {
  enter: {
    x: 300,
    opacity: 0
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: {
    zIndex: 0,
    x: -300,
    opacity: 0
  }
};

// Hook for managing onboarding state
export function useOnboardingState(initialPhases: Phase[]) {
  const [phases, setPhases] = React.useState<Phase[]>(initialPhases);
  const [currentPhaseId, setCurrentPhaseId] = React.useState(1);
  const [currentStepId, setCurrentStepId] = React.useState(1);

  const currentPhase = phases.find(p => p.id === currentPhaseId);
  const currentStep = currentPhase?.steps.find(s => s.id === currentStepId);

  const canGoNext = React.useMemo(() => {
    // Add your validation logic here
    return true;
  }, [currentStep]);

  const canGoPrevious = currentStepId > 1;

  const goNext = () => {
    const currentPhaseSteps = currentPhase?.steps || [];
    const currentStepIndex = currentPhaseSteps.findIndex(s => s.id === currentStepId);

    if (currentStepIndex < currentPhaseSteps.length - 1) {
      // Move to next step in same phase
      setCurrentStepId(currentPhaseSteps[currentStepIndex + 1].id);
    } else {
      // Move to first step of next phase
      const nextPhase = phases.find(p => p.id === currentPhaseId + 1);
      if (nextPhase && nextPhase.steps.length > 0) {
        setCurrentPhaseId(nextPhase.id);
        setCurrentStepId(nextPhase.steps[0].id);
      }
    }

    // Mark current step as completed
    markStepCompleted(currentStepId);
  };

  const goPrevious = () => {
    const currentPhaseSteps = currentPhase?.steps || [];
    const currentStepIndex = currentPhaseSteps.findIndex(s => s.id === currentStepId);

    if (currentStepIndex > 0) {
      // Move to previous step in same phase
      setCurrentStepId(currentPhaseSteps[currentStepIndex - 1].id);
    } else {
      // Move to last step of previous phase
      const previousPhase = phases.find(p => p.id === currentPhaseId - 1);
      if (previousPhase && previousPhase.steps.length > 0) {
        setCurrentPhaseId(previousPhase.id);
        setCurrentStepId(previousPhase.steps[previousPhase.steps.length - 1].id);
      }
    }
  };

  const markStepCompleted = (stepId: number) => {
    setPhases(prevPhases =>
      prevPhases.map(phase => ({
        ...phase,
        steps: phase.steps.map(step =>
          step.id === stepId ? { ...step, completed: true } : step
        )
      }))
    );
  };

  return {
    phases,
    currentPhaseId,
    currentStepId,
    currentPhase,
    currentStep,
    canGoNext,
    canGoPrevious,
    goNext,
    goPrevious,
    markStepCompleted,
    setPhases
  };
}