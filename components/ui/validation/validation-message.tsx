import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ValidationError } from '@/lib/validations/business-onboarding';

interface ValidationMessageProps {
  type?: 'error' | 'warning' | 'success' | 'info';
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export function ValidationMessage({
  type = 'error',
  message,
  onDismiss,
  className,
}: ValidationMessageProps) {
  const icons = {
    error: AlertTriangle,
    warning: AlertTriangle,
    success: CheckCircle,
    info: Info,
  };

  const Icon = icons[type];

  const styles = {
    error: 'bg-destructive/10 border-destructive/20 text-destructive',
    warning: 'bg-neutral-50 border-neutral-200 text-neutral-800',
    success:
      'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300',
    info: 'bg-neutral-50 border-neutral-200 text-neutral-800',
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border text-sm',
        styles[type],
        className
      )}
    >
      <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="leading-relaxed">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 ml-2 hover:opacity-70 transition-opacity"
          aria-label="Dismiss message"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

interface FieldValidationMessageProps {
  error?: ValidationError;
  warning?: ValidationError;
  success?: string;
  className?: string;
}

export function FieldValidationMessage({
  error,
  warning,
  success,
  className,
}: FieldValidationMessageProps) {
  if (error) {
    return (
      <ValidationMessage
        type="error"
        message={error.message}
        className={cn('mt-1', className)}
      />
    );
  }

  if (warning) {
    return (
      <ValidationMessage
        type="warning"
        message={warning.message}
        className={cn('mt-1', className)}
      />
    );
  }

  if (success) {
    return (
      <ValidationMessage
        type="success"
        message={success}
        className={cn('mt-1', className)}
      />
    );
  }

  return null;
}

interface ValidationSummaryProps {
  errors?: ValidationError[];
  warnings?: ValidationError[];
  className?: string;
  maxVisible?: number;
  collapsible?: boolean;
}

export function ValidationSummary({
  errors = [],
  warnings = [],
  className,
  maxVisible = 5,
  collapsible = true,
}: ValidationSummaryProps) {
  const [showAll, setShowAll] = React.useState(false);

  const hasErrors = errors.length > 0;
  const hasWarnings = warnings.length > 0;

  if (!hasErrors && !hasWarnings) {
    return null;
  }

  const visibleErrors = showAll ? errors : errors.slice(0, maxVisible);
  const visibleWarnings = showAll ? warnings : warnings.slice(0, maxVisible);
  const hiddenCount =
    errors.length +
    warnings.length -
    (visibleErrors.length + visibleWarnings.length);

  return (
    <div className={cn('space-y-3', className)}>
      {hasErrors && (
        <div className="space-y-2">
          <h4 className="font-medium text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {errors.length === 1 ? 'Error' : `${errors.length} Errors`}
          </h4>
          <div className="space-y-1">
            {visibleErrors.map((error, index) => (
              <ValidationMessage
                key={`error-${index}`}
                type="error"
                message={error.message}
                className="text-xs"
              />
            ))}
          </div>
        </div>
      )}

      {hasWarnings && (
        <div className="space-y-2">
          <h4 className="font-medium text-neutral-700 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {warnings.length === 1 ? 'Warning' : `${warnings.length} Warnings`}
          </h4>
          <div className="space-y-1">
            {visibleWarnings.map((warning, index) => (
              <ValidationMessage
                key={`warning-${index}`}
                type="warning"
                message={warning.message}
                className="text-xs"
              />
            ))}
          </div>
        </div>
      )}

      {collapsible && hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
        >
          {showAll ? 'Show Less' : `Show ${hiddenCount} More`}
        </button>
      )}
    </div>
  );
}

interface InlineValidationProps {
  fieldPath: string;
  errors?: ValidationError[];
  warnings?: ValidationError[];
  successMessage?: string;
  showSuccessIcon?: boolean;
  className?: string;
}

export function InlineValidation({
  fieldPath,
  errors = [],
  warnings = [],
  successMessage,
  showSuccessIcon = false,
  className,
}: InlineValidationProps) {
  const fieldError = errors.find(error => error.field === fieldPath);
  const fieldWarning = warnings.find(warning => warning.field === fieldPath);
  const hasSuccess = successMessage && !fieldError && !fieldWarning;

  return (
    <div className={cn('min-h-[1.25rem]', className)}>
      {fieldError && (
        <div className="flex items-center gap-2 text-xs text-destructive mt-1">
          <AlertTriangle className="h-3 w-3 flex-shrink-0" />
          <span>{fieldError.message}</span>
        </div>
      )}

      {!fieldError && fieldWarning && (
        <div className="flex items-center gap-2 text-xs text-neutral-600 mt-1">
          <AlertTriangle className="h-3 w-3 flex-shrink-0" />
          <span>{fieldWarning.message}</span>
        </div>
      )}

      {hasSuccess && showSuccessIcon && (
        <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 mt-1">
          <CheckCircle className="h-3 w-3 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
}

// Hook for managing validation state
import React from 'react';
import { ValidationError } from '@/lib/validations/business-onboarding';

interface UseValidationFeedbackOptions {
  autoHideSuccess?: number; // milliseconds
  maxErrorsVisible?: number;
}

export function useValidationFeedback(
  options: UseValidationFeedbackOptions = {}
) {
  const { autoHideSuccess = 3000, maxErrorsVisible = 5 } = options;

  const [errors, setErrors] = React.useState<ValidationError[]>([]);
  const [warnings, setWarnings] = React.useState<ValidationError[]>([]);
  const [successMessages, setSuccessMessages] = React.useState<
    Record<string, string>
  >({});
  const [dismissedErrors, setDismissedErrors] = React.useState<Set<string>>(
    new Set()
  );

  // Auto-hide success messages
  React.useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    Object.keys(successMessages).forEach(field => {
      const timeout = setTimeout(() => {
        setSuccessMessages(prev => {
          const { [field]: _, ...rest } = prev;
          return rest;
        });
      }, autoHideSuccess);
      timeouts.push(timeout);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [successMessages, autoHideSuccess]);

  const addError = React.useCallback((error: ValidationError) => {
    setErrors(prev => {
      // Remove any existing error for the same field
      const filtered = prev.filter(e => e.field !== error.field);
      return [...filtered, error];
    });

    // Clear success message for this field
    setSuccessMessages(prev => {
      const { [error.field]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const addWarning = React.useCallback((warning: ValidationError) => {
    setWarnings(prev => {
      // Remove any existing warning for the same field
      const filtered = prev.filter(w => w.field !== warning.field);
      return [...filtered, warning];
    });
  }, []);

  const addSuccess = React.useCallback((field: string, message: string) => {
    setSuccessMessages(prev => ({ ...prev, [field]: message }));

    // Clear any errors or warnings for this field
    setErrors(prev => prev.filter(e => e.field !== field));
    setWarnings(prev => prev.filter(w => w.field !== field));
  }, []);

  const clearField = React.useCallback((field: string) => {
    setErrors(prev => prev.filter(e => e.field !== field));
    setWarnings(prev => prev.filter(w => w.field !== field));
    setSuccessMessages(prev => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const clearAll = React.useCallback(() => {
    setErrors([]);
    setWarnings([]);
    setSuccessMessages({});
    setDismissedErrors(new Set());
  }, []);

  const dismissError = React.useCallback((field: string) => {
    setDismissedErrors(prev => new Set([...prev, field]));
  }, []);

  const visibleErrors = errors.filter(
    error => !dismissedErrors.has(error.field)
  );

  return {
    errors: visibleErrors,
    warnings,
    successMessages,
    addError,
    addWarning,
    addSuccess,
    clearField,
    clearAll,
    dismissError,
    hasErrors: visibleErrors.length > 0,
    hasWarnings: warnings.length > 0,
    hasSuccess: Object.keys(successMessages).length > 0,
  };
}
