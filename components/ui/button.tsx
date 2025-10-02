import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default:
          'bg-neutral-900 text-white shadow hover:bg-neutral-800 hover:shadow-lg hover:scale-105',
        destructive:
          'bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-md',
        outline:
          'border border-neutral-300 bg-white shadow-sm hover:bg-neutral-50 hover:text-neutral-900 hover:border-neutral-400',
        secondary:
          'bg-neutral-100 text-neutral-900 shadow-sm hover:bg-neutral-200 hover:shadow-md',
        ghost: 'hover:bg-neutral-100 hover:text-neutral-900 hover:scale-105',
        link: 'text-neutral-900 underline-offset-4 hover:underline hover:text-neutral-700',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
