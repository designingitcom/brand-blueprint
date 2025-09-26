import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { InlineValidation } from './validation-message';
import { validatePartial } from '@/lib/validations/validation-utils';
import { ValidationError } from '@/lib/validations/business-onboarding';
import { cn } from '@/lib/utils';

interface BaseFieldProps {
  id: string;
  label: string;
  required?: boolean;
  step: number;
  errors?: ValidationError[];
  warnings?: ValidationError[];
  onValidationChange?: (field: string, isValid: boolean, error?: ValidationError) => void;
  className?: string;
  helpText?: string;
}

interface EnhancedInputProps extends BaseFieldProps {
  type?: 'text' | 'email' | 'url' | 'tel';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  pattern?: string;
  debounceMs?: number;
}

export function EnhancedInput({
  id,
  label,
  required = false,
  step,
  type = 'text',
  value,
  onChange,
  placeholder,
  maxLength,
  pattern,
  errors = [],
  warnings = [],
  onValidationChange,
  className,
  helpText,
  debounceMs = 300
}: EnhancedInputProps) {
  const [isDirty, setIsDirty] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const debounceTimer = React.useRef<NodeJS.Timeout>();

  // Validate field value with debouncing
  const validateField = React.useCallback((fieldValue: string) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      const result = validatePartial(id, fieldValue, step);

      if (onValidationChange) {
        onValidationChange(
          id,
          result.success,
          result.errors?.[0]
        );
      }
    }, debounceMs);
  }, [id, step, onValidationChange, debounceMs]);

  const handleChange = React.useCallback((newValue: string) => {
    onChange(newValue);

    if (isDirty || newValue !== '') {
      validateField(newValue);
    }
  }, [onChange, isDirty, validateField]);

  const handleBlur = React.useCallback(() => {
    setIsFocused(false);
    setIsDirty(true);

    if (!isDirty) {
      validateField(value);
    }
  }, [isDirty, validateField, value]);

  const handleFocus = React.useCallback(() => {
    setIsFocused(true);
  }, []);

  // Clean up timeout on unmount
  React.useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const hasError = errors.some(error => error.field === id);
  const hasWarning = warnings.some(warning => warning.field === id);

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id} className="block">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {helpText && (
        <p className="text-sm text-muted-foreground">{helpText}</p>
      )}

      <div className="relative">
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          maxLength={maxLength}
          pattern={pattern}
          className={cn(
            'transition-colors',
            hasError && 'border-destructive focus:border-destructive',
            hasWarning && !hasError && 'border-neutral-400 focus:border-neutral-500',
            isFocused && !hasError && !hasWarning && 'border-primary'
          )}
          aria-invalid={hasError}
          aria-describedby={
            hasError || hasWarning
              ? `${id}-validation`
              : helpText
              ? `${id}-help`
              : undefined
          }
        />

        {/* Character count for fields with maxLength */}
        {maxLength && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {value.length}/{maxLength}
          </div>
        )}
      </div>

      <InlineValidation
        fieldPath={id}
        errors={errors}
        warnings={warnings}
        showSuccessIcon={isDirty && !hasError && !hasWarning && value.length > 0}
        successMessage={
          isDirty && !hasError && !hasWarning && value.length > 0
            ? "Looks good!"
            : undefined
        }
      />
    </div>
  );
}

interface EnhancedSelectProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
}

export function EnhancedSelect({
  id,
  label,
  required = false,
  step,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  errors = [],
  warnings = [],
  onValidationChange,
  className,
  helpText
}: EnhancedSelectProps) {
  const [isDirty, setIsDirty] = React.useState(false);

  const handleChange = React.useCallback((newValue: string) => {
    onChange(newValue);
    setIsDirty(true);

    // Validate immediately on selection
    const result = validatePartial(id, newValue, step);

    if (onValidationChange) {
      onValidationChange(
        id,
        result.success,
        result.errors?.[0]
      );
    }
  }, [onChange, id, step, onValidationChange]);

  const hasError = errors.some(error => error.field === id);
  const hasWarning = warnings.some(warning => warning.field === id);

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id} className="block">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {helpText && (
        <p className="text-sm text-muted-foreground">{helpText}</p>
      )}

      <Select value={value} onValueChange={handleChange}>
        <SelectTrigger
          id={id}
          className={cn(
            'transition-colors',
            hasError && 'border-destructive focus:border-destructive',
            hasWarning && !hasError && 'border-neutral-400 focus:border-neutral-500'
          )}
          aria-invalid={hasError}
          aria-describedby={
            hasError || hasWarning
              ? `${id}-validation`
              : helpText
              ? `${id}-help`
              : undefined
          }
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <InlineValidation
        fieldPath={id}
        errors={errors}
        warnings={warnings}
        showSuccessIcon={isDirty && !hasError && !hasWarning && value.length > 0}
        successMessage={
          isDirty && !hasError && !hasWarning && value.length > 0
            ? "Great choice!"
            : undefined
        }
      />
    </div>
  );
}

interface EnhancedRadioGroupProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; description?: string; disabled?: boolean }[];
  layout?: 'vertical' | 'horizontal' | 'grid';
  columns?: number;
}

export function EnhancedRadioGroup({
  id,
  label,
  required = false,
  step,
  value,
  onChange,
  options,
  layout = 'vertical',
  columns = 2,
  errors = [],
  warnings = [],
  onValidationChange,
  className,
  helpText
}: EnhancedRadioGroupProps) {
  const [isDirty, setIsDirty] = React.useState(false);

  const handleChange = React.useCallback((newValue: string) => {
    onChange(newValue);
    setIsDirty(true);

    // Validate immediately on selection
    const result = validatePartial(id, newValue, step);

    if (onValidationChange) {
      onValidationChange(
        id,
        result.success,
        result.errors?.[0]
      );
    }
  }, [onChange, id, step, onValidationChange]);

  const hasError = errors.some(error => error.field === id);
  const hasWarning = warnings.some(warning => warning.field === id);

  const getLayoutClasses = () => {
    switch (layout) {
      case 'horizontal':
        return 'flex flex-wrap gap-4';
      case 'grid':
        return `grid grid-cols-1 md:grid-cols-${columns} gap-3`;
      default:
        return 'space-y-3';
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <Label className="block">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {helpText && (
        <p className="text-sm text-muted-foreground">{helpText}</p>
      )}

      <RadioGroup
        value={value}
        onValueChange={handleChange}
        className={getLayoutClasses()}
        aria-invalid={hasError}
        aria-describedby={
          hasError || hasWarning
            ? `${id}-validation`
            : helpText
            ? `${id}-help`
            : undefined
        }
      >
        {options.map((option) => (
          <div
            key={option.value}
            className={cn(
              'flex items-start space-x-3 p-3 rounded-lg border transition-colors',
              'hover:bg-secondary/50',
              value === option.value ? 'bg-secondary border-primary' : 'border-border',
              hasError && 'border-destructive/50',
              hasWarning && !hasError && 'border-neutral-400/50',
              option.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <RadioGroupItem
              value={option.value}
              id={`${id}-${option.value}`}
              disabled={option.disabled}
              className="mt-0.5"
            />
            <div className="flex-1">
              <Label
                htmlFor={`${id}-${option.value}`}
                className="cursor-pointer font-normal"
              >
                {option.label}
              </Label>
              {option.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {option.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </RadioGroup>

      <InlineValidation
        fieldPath={id}
        errors={errors}
        warnings={warnings}
        showSuccessIcon={isDirty && !hasError && !hasWarning && value.length > 0}
        successMessage={
          isDirty && !hasError && !hasWarning && value.length > 0
            ? "Selection confirmed!"
            : undefined
        }
      />
    </div>
  );
}

interface EnhancedTextareaProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  minLength?: number;
  debounceMs?: number;
}

export function EnhancedTextarea({
  id,
  label,
  required = false,
  step,
  value,
  onChange,
  placeholder,
  rows = 4,
  maxLength,
  minLength,
  errors = [],
  warnings = [],
  onValidationChange,
  className,
  helpText,
  debounceMs = 500
}: EnhancedTextareaProps) {
  const [isDirty, setIsDirty] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const debounceTimer = React.useRef<NodeJS.Timeout>();

  const validateField = React.useCallback((fieldValue: string) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      const result = validatePartial(id, fieldValue, step);

      if (onValidationChange) {
        onValidationChange(
          id,
          result.success,
          result.errors?.[0]
        );
      }
    }, debounceMs);
  }, [id, step, onValidationChange, debounceMs]);

  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (isDirty || newValue !== '') {
      validateField(newValue);
    }
  }, [onChange, isDirty, validateField]);

  const handleBlur = React.useCallback(() => {
    setIsFocused(false);
    setIsDirty(true);

    if (!isDirty) {
      validateField(value);
    }
  }, [isDirty, validateField, value]);

  const handleFocus = React.useCallback(() => {
    setIsFocused(true);
  }, []);

  React.useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const hasError = errors.some(error => error.field === id);
  const hasWarning = warnings.some(warning => warning.field === id);

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id} className="block">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {helpText && (
        <p className="text-sm text-muted-foreground">{helpText}</p>
      )}

      <div className="relative">
        <textarea
          id={id}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          className={cn(
            'w-full p-3 border border-border rounded-lg bg-background resize-none',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'transition-colors',
            hasError && 'border-destructive focus:border-destructive focus:ring-destructive',
            hasWarning && !hasError && 'border-neutral-400 focus:border-neutral-500 focus:ring-neutral-500',
            isFocused && !hasError && !hasWarning && 'border-primary'
          )}
          aria-invalid={hasError}
          aria-describedby={
            hasError || hasWarning
              ? `${id}-validation`
              : helpText
              ? `${id}-help`
              : undefined
          }
        />

        {/* Character count */}
        {maxLength && (
          <div className="absolute right-2 bottom-2 text-xs text-muted-foreground">
            {value.length}/{maxLength}
          </div>
        )}
      </div>

      <InlineValidation
        fieldPath={id}
        errors={errors}
        warnings={warnings}
        showSuccessIcon={
          isDirty && !hasError && !hasWarning &&
          value.length >= (minLength || 0) && value.length > 0
        }
        successMessage={
          isDirty && !hasError && !hasWarning &&
          value.length >= (minLength || 0) && value.length > 0
            ? "Well written!"
            : undefined
        }
      />
    </div>
  );
}