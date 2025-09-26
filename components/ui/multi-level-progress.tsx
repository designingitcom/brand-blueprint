'use client';

import * as React from 'react';
import { CheckCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Phase {
  id: number;
  title: string;
  description: string;
  steps: Step[];
}

export interface Step {
  id: number;
  phaseId: number;
  title: string;
  description?: string;
  completed: boolean;
}

interface MultiLevelProgressProps {
  phases: Phase[];
  currentPhaseId: number;
  currentStepId: number;
  className?: string;
}

export function MultiLevelProgress({
  phases,
  currentPhaseId,
  currentStepId,
  className,
}: MultiLevelProgressProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Phase Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">
            Onboarding Progress
          </h3>
          <span className="text-xs text-muted-foreground">
            Phase {currentPhaseId} of {phases.length}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {phases.map((phase, index) => (
            <React.Fragment key={phase.id}>
              <div className="flex items-center space-x-2">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors',
                    phase.id < currentPhaseId
                      ? 'bg-primary text-primary-foreground'
                      : phase.id === currentPhaseId
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                  )}
                >
                  {phase.id < currentPhaseId ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    phase.id
                  )}
                </div>
                <span
                  className={cn(
                    'text-sm font-medium transition-colors',
                    phase.id <= currentPhaseId
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {phase.title}
                </span>
              </div>

              {index < phases.length - 1 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Current Phase Steps */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-foreground">
            {phases.find(p => p.id === currentPhaseId)?.title} Steps
          </h4>
          <span className="text-xs text-muted-foreground">
            Step {currentStepId} of{' '}
            {phases.find(p => p.id === currentPhaseId)?.steps.length || 0}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {phases
            .find(p => p.id === currentPhaseId)
            ?.steps.map(step => (
              <div
                key={step.id}
                className={cn(
                  'flex flex-col items-center space-y-1 rounded-lg border-2 p-3 transition-all',
                  step.completed
                    ? 'border-primary bg-primary/5'
                    : step.id === currentStepId
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card'
                )}
              >
                <div
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                    step.completed
                      ? 'bg-primary text-primary-foreground'
                      : step.id === currentStepId
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                  )}
                >
                  {step.completed ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs text-center font-medium leading-tight',
                    step.completed || step.id === currentStepId
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
