// frontend/src/components/ui/Button.tsx

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ============================================================
// Button Variants using class-variance-authority
// ============================================================
const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      variant: {
        // Gold gradient (primary CTA)
        gold: 'bg-gradient-to-r from-gold to-gold-dark text-white shadow-gold hover:shadow-xl hover:scale-[1.02]',
        // Maroon gradient (secondary CTA)
        maroon: 'bg-gradient-to-r from-maroon to-maroon-dark text-white shadow-md hover:shadow-lg hover:scale-[1.02]',
        // Outline with gold border
        outline: 'border-2 border-gold text-gold-dark bg-transparent hover:bg-gold hover:text-white hover:border-gold',
        // Ghost – subtle hover
        ghost: 'text-brown-light hover:bg-gold/10 hover:text-brown dark:text-ivory/70 dark:hover:bg-gold/20 dark:hover:text-ivory',
        // Destructive (danger)
        destructive: 'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500',
        // Link style (looks like a text link)
        link: 'text-gold-dark underline-offset-4 hover:underline dark:text-gold',
      },
      size: {
        sm: 'px-4 py-2 text-xs',
        md: 'px-6 py-2.5 text-sm',
        lg: 'px-8 py-3.5 text-base',
        icon: 'h-10 w-10 p-0',
        'icon-sm': 'h-8 w-8 p-0',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'gold',
      size: 'md',
      fullWidth: false,
    },
  }
);

// ============================================================
// Props interface
// ============================================================
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// ============================================================
// Button Component
// ============================================================
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      loading = false,
      loadingText = 'Loading...',
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    const isDisabled = disabled || loading;

    // Determine content
    let content = children;
    if (loading) {
      content = (
        <>
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {loadingText}
        </>
      );
    } else {
      content = (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      );
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        {...props}
      >
        {content}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

// ============================================================
// Export both the component and the variant function
// ============================================================
export { Button, buttonVariants };
export default Button;