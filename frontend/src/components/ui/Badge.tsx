// frontend/src/components/ui/Badge.tsx

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ============================================================
// Badge Variants using class-variance-authority
// ============================================================
const badgeVariants = cva(
  // Base styles
  'inline-flex items-center rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gold/30 focus:ring-offset-2',
  {
    variants: {
      variant: {
        // Gold (default / new / featured)
        default: 'bg-gold text-white',
        // Maroon (discount / sale)
        secondary: 'bg-maroon/10 text-maroon',
        // Outline
        outline: 'border border-gold/30 text-brown bg-transparent dark:text-ivory dark:border-gold/20',
        // Destructive (out of stock / error)
        destructive: 'bg-red-500 text-white',
        // Success (in stock)
        success: 'bg-green-500 text-white',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// ============================================================
// Props interface
// ============================================================
export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

// ============================================================
// Badge Component
// ============================================================
/**
 * A small pill-shaped label used to highlight product status
 * (e.g. "New", discount percentage, stock status).
 */
const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

// ============================================================
// Exports
// ============================================================
export { Badge, badgeVariants };
export default Badge;
