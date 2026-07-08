// frontend/src/components/ui/GlassCard.tsx

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

// ============================================================
// Types
// ============================================================
export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Variant of the glass card
   * @default 'default'
   */
  variant?: 'default' | 'subtle' | 'gold' | 'dark' | 'maroon' | 'ivory';
  /**
   * Size of the card
   * @default 'default'
   */
  size?: 'sm' | 'default' | 'lg' | 'xl';
  /**
   * Whether the card should have a hover effect
   * @default true
   */
  hover?: boolean;
  /**
   * Whether the card should be interactive (clickable)
   * @default false
   */
  interactive?: boolean;
  /**
   * Whether the card should have a border
   * @default true
   */
  bordered?: boolean;
  /**
   * Whether the card should have a shadow
   * @default true
   */
  shadow?: boolean;
  /**
   * Whether to render as child (polymorphic)
   * @default false
   */
  asChild?: boolean;
  /**
   * Padding variant
   * @default 'default'
   */
  padding?: 'none' | 'sm' | 'default' | 'lg' | 'xl';
  /**
   * Border radius variant
   * @default 'default'
   */
  radius?: 'sm' | 'default' | 'lg' | 'xl' | 'full';
  /**
   * Whether to add a subtle glow effect
   * @default false
   */
  glow?: boolean;
  /**
   * Whether the card has a loading state (shows skeleton)
   * @default false
   */
  loading?: boolean;
  /**
   * Loading skeleton height (when loading is true)
   * @default 200
   */
  loadingHeight?: number;
}

// ============================================================
// GlassCard Component
// ============================================================
const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      className,
      children,
      variant = 'default',
      size = 'default',
      hover = true,
      interactive = false,
      bordered = true,
      shadow = true,
      asChild = false,
      padding = 'default',
      radius = 'default',
      glow = false,
      loading = false,
      loadingHeight = 200,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'div';

    // Variant styles
    const variantClasses = {
      default: 'bg-white/80 dark:bg-brown-dark/80 backdrop-blur-xl',
      subtle: 'bg-white/60 dark:bg-brown-dark/60 backdrop-blur-md',
      gold: 'bg-gold/10 dark:bg-gold/20 backdrop-blur-xl border-gold/20',
      dark: 'bg-black/40 dark:bg-black/60 backdrop-blur-xl text-white',
      maroon: 'bg-maroon/10 dark:bg-maroon/20 backdrop-blur-xl border-maroon/20',
      ivory: 'bg-ivory/80 dark:bg-ivory/10 backdrop-blur-xl',
    };

    // Size classes
    const sizeClasses = {
      sm: 'p-4',
      default: 'p-5 md:p-6',
      lg: 'p-6 md:p-8',
      xl: 'p-8 md:p-10',
    };

    // Padding classes (overrides size)
    const paddingClasses = {
      none: 'p-0',
      sm: 'p-4',
      default: 'p-5 md:p-6',
      lg: 'p-6 md:p-8',
      xl: 'p-8 md:p-10',
    };

    // Radius classes
    const radiusClasses = {
      sm: 'rounded-lg',
      default: 'rounded-2xl',
      lg: 'rounded-3xl',
      xl: 'rounded-[2rem]',
      full: 'rounded-full',
    };

    // Border classes
    const borderClasses = bordered
      ? 'border border-white/20 dark:border-white/10'
      : '';

    // Shadow classes
    const shadowClasses = shadow
      ? 'shadow-lg shadow-black/5 dark:shadow-black/20'
      : '';

    // Hover classes
    const hoverClasses =
      hover && !loading
        ? 'hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30 hover:-translate-y-1 transition-all duration-300'
        : '';

    // Interactive classes
    const interactiveClasses =
      interactive && !loading
        ? 'cursor-pointer active:scale-[0.98]'
        : '';

    // Glow effect
    const glowClasses = glow
      ? 'relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-gold/10 before:via-transparent before:to-gold/10 before:animate-shimmer before:pointer-events-none'
      : '';

    // Loading state
    if (loading) {
      return (
        <div
          className={cn(
            'animate-pulse bg-sand/50 dark:bg-brown/50 rounded-2xl',
            variantClasses[variant],
            radiusClasses[radius],
            borderClasses,
            shadowClasses,
            className
          )}
          style={{ height: loadingHeight }}
        />
      );
    }

    return (
      <Comp
        ref={ref}
        className={cn(
          'relative overflow-hidden transition-all duration-300',
          variantClasses[variant],
          sizeClasses[size],
          paddingClasses[padding],
          radiusClasses[radius],
          borderClasses,
          shadowClasses,
          hoverClasses,
          interactiveClasses,
          glowClasses,
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export { GlassCard };

// ============================================================
// GlassCardHeader – Header section with optional icon/title
// ============================================================
export interface GlassCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'gold' | 'maroon';
}

export function GlassCardHeader({
  className,
  icon,
  title,
  subtitle,
  action,
  variant = 'default',
  children,
  ...props
}: GlassCardHeaderProps) {
  const variantColors = {
    default: 'text-brown dark:text-ivory',
    gold: 'text-gold-dark dark:text-gold',
    maroon: 'text-maroon dark:text-maroon-light',
  };

  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 pb-4 mb-4 border-b border-gold/10 dark:border-gold/5',
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {icon && (
          <div className="shrink-0 text-gold-dark dark:text-gold">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={cn('font-cinzel text-lg font-semibold', variantColors[variant])}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-brown-light dark:text-ivory/60">
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
      {action && (
        <div className="shrink-0">{action}</div>
      )}
    </div>
  );
}

// ============================================================
// GlassCardBody – Body content section
// ============================================================
export interface GlassCardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to remove padding from the body
   * @default false
   */
  noPadding?: boolean;
}

export function GlassCardBody({
  className,
  noPadding = false,
  children,
  ...props
}: GlassCardBodyProps) {
  return (
    <div
      className={cn(
        !noPadding && 'py-2',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================================
// GlassCardFooter – Footer section with actions
// ============================================================
export interface GlassCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Alignment of the footer content
   * @default 'right'
   */
  align?: 'left' | 'center' | 'right';
  /**
   * Whether to show a divider above the footer
   * @default true
   */
  showDivider?: boolean;
}

export function GlassCardFooter({
  className,
  align = 'right',
  showDivider = true,
  children,
  ...props
}: GlassCardFooterProps) {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 pt-4 mt-4',
        showDivider && 'border-t border-gold/10 dark:border-gold/5',
        alignClasses[align],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================================
// GlassCardGrid – For rendering multiple glass cards in a grid
// ============================================================
export interface GlassCardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 2 | 3 | 4 | 5;
  gap?: 'sm' | 'default' | 'lg' | 'xl';
  children: React.ReactNode;
}

export function GlassCardGrid({
  className,
  columns = 3,
  gap = 'default',
  children,
  ...props
}: GlassCardGridProps) {
  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  };

  const gapClasses = {
    sm: 'gap-3 md:gap-4',
    default: 'gap-4 md:gap-6',
    lg: 'gap-6 md:gap-8',
    xl: 'gap-8 md:gap-10',
  };

  return (
    <div
      className={cn(
        'grid',
        columnClasses[columns],
        gapClasses[gap],
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <div key={index} className="flex">
          {child}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// GlassCardSkeleton – Loading placeholder
// ============================================================
export interface GlassCardSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Number of skeleton cards to show
   * @default 3
   */
  count?: number;
  /**
   * Columns in the skeleton grid
   * @default 3
   */
  columns?: 2 | 3 | 4;
  /**
   * Height of each skeleton card
   * @default 200
   */
  height?: number;
  /**
   * Whether to show a header skeleton
   * @default true
   */
  showHeader?: boolean;
  /**
   * Whether to show a footer skeleton
   * @default false
   */
  showFooter?: boolean;
}

export function GlassCardSkeleton({
  className,
  count = 3,
  columns = 3,
  height = 200,
  showHeader = true,
  showFooter = false,
  ...props
}: GlassCardSkeletonProps) {
  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4 md:gap-6', columnClasses[columns], className)} {...props}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white/80 dark:bg-brown-dark/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/20 p-6 animate-pulse"
        >
          {showHeader && (
            <div className="flex items-center gap-4 pb-4 mb-4 border-b border-gold/10 dark:border-gold/5">
              <div className="w-10 h-10 rounded-full bg-sand/50 dark:bg-brown/50" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-sand/50 dark:bg-brown/50 rounded" />
                <div className="h-3 w-48 bg-sand/30 dark:bg-brown/30 rounded" />
              </div>
            </div>
          )}
          <div
            className="w-full bg-sand/30 dark:bg-brown/30 rounded-lg"
            style={{ height: height - (showHeader ? 120 : 80) }}
          />
          {showFooter && (
            <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gold/10 dark:border-gold/5">
              <div className="h-8 w-20 bg-sand/50 dark:bg-brown/50 rounded-full" />
              <div className="h-8 w-20 bg-sand/50 dark:bg-brown/50 rounded-full" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Default export
// ============================================================
export default GlassCard;