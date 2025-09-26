'use client';

import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Circle, CheckCircle2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from './badge';

const EnhancedRadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> & {
    layout?: 'vertical' | 'grid' | 'horizontal';
    columns?: number;
  }
>(({ className, layout = 'vertical', columns = 2, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn(
        layout === 'grid'
          ? `grid gap-4`
          : layout === 'horizontal'
          ? 'flex flex-wrap gap-4'
          : 'space-y-3',
        layout === 'grid' && `grid-cols-1 sm:grid-cols-${Math.min(columns, 3)}`,
        className
      )}
      {...props}
      ref={ref}
      style={
        layout === 'grid'
          ? {
              gridTemplateColumns: `repeat(${Math.min(
                columns,
                3
              )}, minmax(0, 1fr))`
            }
          : undefined
      }
    />
  );
});
EnhancedRadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const EnhancedRadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & {
    label: string;
    description?: string;
    isRecommended?: boolean;
    recommendationReason?: string;
  }
>(
  (
    {
      className,
      label,
      description,
      isRecommended,
      recommendationReason,
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={cn(
          'relative rounded-lg border-2 transition-all duration-200',
          'hover:border-primary/50 hover:bg-primary/5',
          'has-[:checked]:border-primary has-[:checked]:bg-primary/10',
          isRecommended && 'ring-2 ring-primary/20 bg-primary/5',
          className
        )}
      >
        <RadioGroupPrimitive.Item
          ref={ref}
          className="peer sr-only"
          {...props}
        >
          <RadioGroupPrimitive.Indicator />
        </RadioGroupPrimitive.Item>

        <label
          htmlFor={props.value}
          className="block cursor-pointer p-4 space-y-3"
        >
          <div className="flex items-start gap-3">
            {/* Custom Radio Button */}
            <div className="mt-0.5">
              <div
                className={cn(
                  'h-4 w-4 rounded-full border-2 border-muted-foreground flex items-center justify-center transition-colors',
                  'peer-checked:border-primary peer-checked:bg-primary'
                )}
              >
                <Circle className="h-2 w-2 fill-current text-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-foreground leading-tight">
                  {label}
                </h4>
                {isRecommended && (
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    Recommended
                  </Badge>
                )}
              </div>

              {description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              )}

              {isRecommended && recommendationReason && (
                <div className="rounded-md bg-primary/5 border border-primary/10 p-2">
                  <p className="text-xs text-primary font-medium">
                    Why we recommend this:
                  </p>
                  <p className="text-xs text-foreground mt-1">
                    {recommendationReason}
                  </p>
                </div>
              )}
            </div>
          </div>
        </label>
      </div>
    );
  }
);
EnhancedRadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

// Simple checkbox group for multiple selection
const CheckboxGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    layout?: 'vertical' | 'grid' | 'horizontal';
    columns?: number;
  }
>(({ className, layout = 'vertical', columns = 2, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        layout === 'grid'
          ? `grid gap-4`
          : layout === 'horizontal'
          ? 'flex flex-wrap gap-4'
          : 'space-y-3',
        layout === 'grid' && `grid-cols-1 sm:grid-cols-${Math.min(columns, 3)}`,
        className
      )}
      style={
        layout === 'grid'
          ? {
              gridTemplateColumns: `repeat(${Math.min(
                columns,
                3
              )}, minmax(0, 1fr))`
            }
          : undefined
      }
      {...props}
    />
  );
});
CheckboxGroup.displayName = 'CheckboxGroup';

const CheckboxGroupItem = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    description?: string;
    isRecommended?: boolean;
    recommendationReason?: string;
  }
>(
  (
    {
      className,
      label,
      description,
      isRecommended,
      recommendationReason,
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={cn(
          'relative rounded-lg border-2 transition-all duration-200',
          'hover:border-primary/50 hover:bg-primary/5',
          'has-[:checked]:border-primary has-[:checked]:bg-primary/10',
          isRecommended && 'ring-2 ring-primary/20 bg-primary/5',
          className
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          className="peer sr-only"
          {...props}
        />

        <label
          htmlFor={props.id}
          className="block cursor-pointer p-4 space-y-3"
        >
          <div className="flex items-start gap-3">
            {/* Custom Checkbox */}
            <div className="mt-0.5">
              <div
                className={cn(
                  'h-4 w-4 rounded border-2 border-muted-foreground flex items-center justify-center transition-colors',
                  'peer-checked:border-primary peer-checked:bg-primary'
                )}
              >
                <CheckCircle2 className="h-3 w-3 text-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-foreground leading-tight">
                  {label}
                </h4>
                {isRecommended && (
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    Recommended
                  </Badge>
                )}
              </div>

              {description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              )}

              {isRecommended && recommendationReason && (
                <div className="rounded-md bg-primary/5 border border-primary/10 p-2">
                  <p className="text-xs text-primary font-medium">
                    Why we recommend this:
                  </p>
                  <p className="text-xs text-foreground mt-1">
                    {recommendationReason}
                  </p>
                </div>
              )}
            </div>
          </div>
        </label>
      </div>
    );
  }
);
CheckboxGroupItem.displayName = 'CheckboxGroupItem';

export {
  EnhancedRadioGroup,
  EnhancedRadioGroupItem,
  CheckboxGroup,
  CheckboxGroupItem
};