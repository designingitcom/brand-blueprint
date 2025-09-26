import React from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ValidationMessage, ValidationSummary } from './validation-message';
import { ValidationError } from '@/lib/validations/business-onboarding';
import { getFieldDisplayName } from '@/lib/validations/validation-utils';
import { cn } from '@/lib/utils';

interface StepValidationSummaryProps {
  step: number;
  stepName: string;
  errors?: ValidationError[];
  warnings?: ValidationError[];
  canProceed: boolean;
  onFieldFocus?: (fieldName: string) => void;
  className?: string;
  showWhenValid?: boolean;
}

export function StepValidationSummary({
  step,
  stepName,
  errors = [],
  warnings = [],
  canProceed,
  onFieldFocus,
  className,
  showWhenValid = false,
}: StepValidationSummaryProps) {
  const [isExpanded, setIsExpanded] = React.useState(!canProceed);

  const hasErrors = errors.length > 0;
  const hasWarnings = warnings.length > 0;
  const hasIssues = hasErrors || hasWarnings;

  // Auto-expand when there are errors
  React.useEffect(() => {
    if (!canProceed) {
      setIsExpanded(true);
    }
  }, [canProceed]);

  if (!hasIssues && !showWhenValid) {
    return null;
  }

  const handleFieldClick = (fieldName: string) => {
    if (onFieldFocus) {
      onFieldFocus(fieldName);
    }
  };

  return (
    <div
      className={cn(
        'border rounded-lg transition-all duration-200',
        hasErrors
          ? 'border-destructive/30 bg-destructive/5'
          : hasWarnings
            ? 'border-neutral-300 bg-neutral-50'
            : 'border-green-300 bg-green-50 dark:bg-green-900/10',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          {hasErrors ? (
            <AlertTriangle className="h-5 w-5 text-destructive" />
          ) : hasWarnings ? (
            <AlertTriangle className="h-5 w-5 text-neutral-600" />
          ) : (
            <CheckCircle className="h-5 w-5 text-green-600" />
          )}

          <div>
            <h3 className="font-medium">
              {stepName}{' '}
              {hasErrors
                ? 'Validation Issues'
                : hasWarnings
                  ? 'Warnings'
                  : 'Complete'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {hasErrors
                ? `${errors.length} error${errors.length === 1 ? '' : 's'} to fix`
                : hasWarnings
                  ? `${warnings.length} warning${warnings.length === 1 ? '' : 's'} to review`
                  : 'All requirements met'}
            </p>
          </div>
        </div>

        {hasIssues && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-auto"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Expandable Content */}
      {hasIssues && isExpanded && (
        <div className="border-t border-border/50 p-4 space-y-4">
          {/* Errors */}
          {hasErrors && (
            <div className="space-y-3">
              <h4 className="font-medium text-destructive text-sm">
                Required fixes:
              </h4>
              <div className="space-y-2">
                {errors.map((error, index) => (
                  <div
                    key={`error-${index}`}
                    className="flex items-start gap-2 p-3 bg-background rounded border border-destructive/20"
                  >
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-destructive">
                          {getFieldDisplayName(error.field)}
                        </span>
                        {onFieldFocus && (
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
                            onClick={() => handleFieldClick(error.field)}
                          >
                            Go to field
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {error.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {hasWarnings && (
            <div className="space-y-3">
              <h4 className="font-medium text-neutral-700 text-sm">
                Recommendations:
              </h4>
              <div className="space-y-2">
                {warnings.map((warning, index) => (
                  <div
                    key={`warning-${index}`}
                    className="flex items-start gap-2 p-3 bg-background rounded border border-neutral-200"
                  >
                    <Info className="h-4 w-4 text-neutral-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-neutral-700">
                          {getFieldDisplayName(warning.field)}
                        </span>
                        {onFieldFocus && (
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
                            onClick={() => handleFieldClick(warning.field)}
                          >
                            Review field
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {warning.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end pt-2 border-t border-border/50">
            {hasErrors && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(false)}
              >
                I'll fix these issues
              </Button>
            )}
            {hasWarnings && !hasErrors && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                >
                  I'll review later
                </Button>
                <Button size="sm" onClick={() => setIsExpanded(false)}>
                  Continue anyway
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success state content */}
      {!hasIssues && showWhenValid && (
        <div className="border-t border-border/50 p-4">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">
              All required information has been provided. You can proceed to the
              next step.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

interface FormValidationSummaryProps {
  currentStep: number;
  totalSteps: number;
  stepValidations: Array<{
    step: number;
    stepName: string;
    errors: ValidationError[];
    warnings: ValidationError[];
    canProceed: boolean;
  }>;
  onFieldFocus?: (fieldName: string) => void;
  onStepNavigate?: (step: number) => void;
  className?: string;
}

export function FormValidationSummary({
  currentStep,
  totalSteps,
  stepValidations,
  onFieldFocus,
  onStepNavigate,
  className,
}: FormValidationSummaryProps) {
  const [showAllSteps, setShowAllSteps] = React.useState(false);

  const totalErrors = stepValidations.reduce(
    (sum, validation) => sum + validation.errors.length,
    0
  );
  const totalWarnings = stepValidations.reduce(
    (sum, validation) => sum + validation.warnings.length,
    0
  );
  const completedSteps = stepValidations.filter(
    validation => validation.canProceed
  ).length;

  const visibleValidations = showAllSteps
    ? stepValidations
    : stepValidations.filter(
        validation =>
          validation.step === currentStep ||
          validation.errors.length > 0 ||
          validation.warnings.length > 0
      );

  if (totalErrors === 0 && totalWarnings === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Overall Progress */}
      <div className="p-4 bg-muted/30 rounded-lg border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">Form Validation Status</h3>
          <span className="text-sm text-muted-foreground">
            {completedSteps}/{totalSteps} steps complete
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm">
          {totalErrors > 0 && (
            <div className="flex items-center gap-1 text-destructive">
              <AlertTriangle className="h-3 w-3" />
              <span>
                {totalErrors} error{totalErrors === 1 ? '' : 's'}
              </span>
            </div>
          )}

          {totalWarnings > 0 && (
            <div className="flex items-center gap-1 text-neutral-600">
              <Info className="h-3 w-3" />
              <span>
                {totalWarnings} warning{totalWarnings === 1 ? '' : 's'}
              </span>
            </div>
          )}

          {totalErrors === 0 && totalWarnings === 0 && (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-3 w-3" />
              <span>All validation passed</span>
            </div>
          )}
        </div>

        {stepValidations.length > 1 && (
          <Button
            variant="link"
            size="sm"
            onClick={() => setShowAllSteps(!showAllSteps)}
            className="mt-2 h-auto p-0 text-xs"
          >
            {showAllSteps ? 'Show current step only' : 'Show all steps'}
          </Button>
        )}
      </div>

      {/* Step-by-step validation */}
      <div className="space-y-3">
        {visibleValidations.map(validation => (
          <div key={validation.step} className="relative">
            {validation.step !== currentStep && onStepNavigate && (
              <Button
                variant="link"
                size="sm"
                onClick={() => onStepNavigate(validation.step)}
                className="absolute -top-1 right-0 h-auto p-0 text-xs z-10"
              >
                Go to Step {validation.step}
              </Button>
            )}

            <StepValidationSummary
              step={validation.step}
              stepName={validation.stepName}
              errors={validation.errors}
              warnings={validation.warnings}
              canProceed={validation.canProceed}
              onFieldFocus={onFieldFocus}
              showWhenValid={validation.step === currentStep}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
