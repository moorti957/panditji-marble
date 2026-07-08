// frontend/src/components/ui/Skeleton.tsx

import { cn } from '../../lib/utils';
import { forwardRef, HTMLAttributes } from 'react';

// ============================================================
// Types
// ============================================================
export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Variant of the skeleton
   * @default 'default'
   */
  variant?: 'default' | 'rect' | 'circle' | 'text' | 'button' | 'card' | 'product';
  /**
   * Width of the skeleton (can be any Tailwind width or custom value)
   * @default 'w-full'
   */
  width?: string;
  /**
   * Height of the skeleton (can be any Tailwind height or custom value)
   * @default 'h-4'
   */
  height?: string;
  /**
   * Border radius variant
   * @default 'default'
   */
  radius?: 'none' | 'sm' | 'default' | 'lg' | 'xl' | 'full';
  /**
   * Whether the skeleton is animated
   * @default true
   */
  animated?: boolean;
  /**
   * Animation speed
   * @default 'default'
   */
  speed?: 'slow' | 'default' | 'fast';
  /**
   * Number of skeleton items (for text lines)
   * @default 1
   */
  lines?: number;
  /**
   * Spacing between lines (when lines > 1)
   * @default 'gap-2'
   */
  gap?: string;
  /**
   * Whether to render as a child component wrapper
   * @default false
   */
  asChild?: boolean;
}

// ============================================================
// Skeleton Component
// ============================================================
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      variant = 'default',
      width = 'w-full',
      height = 'h-4',
      radius = 'default',
      animated = true,
      speed = 'default',
      lines = 1,
      gap = 'gap-2',
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    // Animation speed classes
    const speedClasses = {
      slow: 'duration-1000',
      default: 'duration-700',
      fast: 'duration-300',
    };

    // Radius classes
    const radiusClasses = {
      none: 'rounded-none',
      sm: 'rounded-sm',
      default: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      full: 'rounded-full',
    };

    // Variant specific classes
    const variantClasses = {
      default: '',
      rect: '',
      circle: 'aspect-square',
      text: 'h-3',
      button: 'h-10 rounded-full',
      card: 'aspect-[4/3] rounded-xl',
      product: 'aspect-[3/4] rounded-2xl',
    };

    // If we have multiple lines, render them as a stack
    if (lines > 1) {
      return (
        <div className={cn('flex flex-col', gap)}>
          {Array.from({ length: lines }).map((_, index) => {
            // Make the last line shorter for text-like appearance
            const isLast = index === lines - 1;
            const widthClass = isLast && variant === 'text' ? 'w-3/4' : width;
            return (
              <Skeleton
                key={index}
                variant={variant}
                width={widthClass}
                height={height}
                radius={radius}
                animated={animated}
                speed={speed}
                className={className}
                {...props}
              />
            );
          })}
        </div>
      );
    }

    // Single skeleton
    const Comp = asChild ? 'div' : 'div';

    return (
      <Comp
        ref={ref}
        className={cn(
          // Base styles
          'bg-sand/60 dark:bg-brown/50',
          // Variant styles
          variantClasses[variant],
          // Width & Height
          width,
          height,
          // Radius
          radiusClasses[radius],
          // Animation
          animated && 'animate-pulse',
          animated && speedClasses[speed],
          // Additional className
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

Skeleton.displayName = 'Skeleton';

// ============================================================
// SkeletonText - Convenience component for text skeletons
// ============================================================
export interface SkeletonTextProps extends SkeletonProps {
  /**
   * Number of text lines
   * @default 3
   */
  lines?: number;
  /**
   * Whether the last line should be shorter
   * @default true
   */
  lastLineShort?: boolean;
}

export function SkeletonText({
  lines = 3,
  lastLineShort = true,
  gap = 'gap-2',
  className,
  ...props
}: SkeletonTextProps) {
  return (
    <div className={cn('flex flex-col', gap)}>
      {Array.from({ length: lines }).map((_, index) => {
        const isLast = index === lines - 1;
        const widthClass = isLast && lastLineShort ? 'w-3/4' : 'w-full';
        return (
          <Skeleton
            key={index}
            variant="text"
            width={widthClass}
            height="h-3"
            className={cn(
              index === lines - 1 && lastLineShort ? 'w-3/4' : 'w-full',
              className
            )}
            {...props}
          />
        );
      })}
    </div>
  );
}

// ============================================================
// SkeletonAvatar - Avatar skeleton
// ============================================================
export interface SkeletonAvatarProps extends SkeletonProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function SkeletonAvatar({
  size = 'md',
  ...props
}: SkeletonAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };

  return (
    <Skeleton
      variant="circle"
      width={sizeClasses[size]}
      height={sizeClasses[size]}
      radius="full"
      {...props}
    />
  );
}

// ============================================================
// SkeletonButton - Button skeleton
// ============================================================
export interface SkeletonButtonProps extends SkeletonProps {
  size?: 'sm' | 'md' | 'lg';
}

export function SkeletonButton({
  size = 'md',
  ...props
}: SkeletonButtonProps) {
  const sizeClasses = {
    sm: 'h-8 w-20',
    md: 'h-10 w-28',
    lg: 'h-12 w-36',
  };

  return (
    <Skeleton
      variant="button"
      width={sizeClasses[size]}
      height={sizeClasses[size]}
      radius="full"
      {...props}
    />
  );
}

// ============================================================
// SkeletonCard - Card skeleton (image + text)
// ============================================================
export interface SkeletonCardProps extends SkeletonProps {
  /**
   * Whether to show image placeholder
   * @default true
   */
  showImage?: boolean;
  /**
   * Number of text lines in the card
   * @default 2
   */
  textLines?: number;
  /**
   * Whether to show an avatar
   * @default false
   */
  showAvatar?: boolean;
}

export function SkeletonCard({
  showImage = true,
  textLines = 2,
  showAvatar = false,
  className,
  ...props
}: SkeletonCardProps) {
  return (
    <div className={cn('bg-white dark:bg-brown-dark rounded-2xl overflow-hidden shadow-sm border border-gold/5', className)}>
      {showImage && (
        <Skeleton
          variant="card"
          width="w-full"
          height="h-48 sm:h-56"
          radius="none"
          {...props}
        />
      )}
      <div className="p-4 space-y-3">
        {showAvatar && (
          <div className="flex items-center gap-3">
            <SkeletonAvatar size="md" />
            <div className="flex-1">
              <Skeleton width="w-1/2" height="h-4" />
              <Skeleton width="w-1/3" height="h-3" />
            </div>
          </div>
        )}
        <SkeletonText lines={textLines} />
        <Skeleton width="w-1/4" height="h-8" radius="full" />
      </div>
    </div>
  );
}

// ============================================================
// SkeletonProductCard - Product card skeleton
// ============================================================
export function SkeletonProductCard({
  className,
  ...props
}: SkeletonProps) {
  return (
    <div className={cn('bg-white dark:bg-brown-dark rounded-2xl overflow-hidden shadow-sm border border-gold/5', className)}>
      <Skeleton
        variant="product"
        width="w-full"
        height="h-auto"
        radius="none"
        {...props}
        className="aspect-[3/4]"
      />
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <Skeleton width="w-3/4" height="h-5" />
          <Skeleton width="w-6 h-6" radius="full" />
        </div>
        <Skeleton width="w-1/2" height="h-3" />
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} width="w-3 h-3" radius="full" />
          ))}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-gold/5">
          <Skeleton width="w-1/3" height="h-6" />
          <Skeleton width="w-8 h-8" radius="full" />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SkeletonGallery - Gallery skeleton
// ============================================================
export interface SkeletonGalleryProps {
  count?: number;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function SkeletonGallery({
  count = 4,
  columns = 4,
  className,
}: SkeletonGalleryProps) {
  const columnClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', columnClasses[columns], className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="card" width="w-full" height="h-64" radius="lg" />
      ))}
    </div>
  );
}

// ============================================================
// Default export
// ============================================================
export default Skeleton;