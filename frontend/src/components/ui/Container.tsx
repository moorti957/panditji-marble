// frontend/src/components/ui/Container.tsx

import * as React from 'react';
import { cn } from '@/lib/utils';

// ============================================================
// Types
// ============================================================
export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Width variant for the container
   * @default 'default'
   */
  variant?: 'default' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'narrow';
  /**
   * Whether to remove horizontal padding
   * @default false
   */
  noPadding?: boolean;
  /**
   * Whether to remove padding on mobile only
   * @default false
   */
  noPaddingMobile?: boolean;
  /**
   * Custom padding className override
   */
  paddingClassName?: string;
  /**
   * Whether the container should be centered
   * @default true
   */
  centered?: boolean;
  /**
   * Whether to add a subtle background (for visual separation)
   * @default false
   */
  withBackground?: boolean;
  /**
   * Background variant when withBackground is true
   * @default 'default'
   */
  backgroundVariant?: 'default' | 'gold' | 'maroon' | 'sand' | 'ivory';
}

// ============================================================
// Container Component
// ============================================================
const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      className,
      children,
      variant = 'default',
      noPadding = false,
      noPaddingMobile = false,
      paddingClassName,
      centered = true,
      withBackground = false,
      backgroundVariant = 'default',
      ...props
    },
    ref
  ) => {
    // Width variants
    const widthVariants = {
      default: 'max-w-7xl',
      sm: 'max-w-3xl',
      md: 'max-w-5xl',
      lg: 'max-w-6xl',
      xl: 'max-w-7xl',
      full: 'max-w-full',
      narrow: 'max-w-2xl',
    };

    // Padding defaults
    const paddingClasses = noPadding
      ? 'px-0'
      : noPaddingMobile
      ? 'px-4 sm:px-6 md:px-8 lg:px-10'
      : 'px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12';

    // Background variants
    const backgroundClasses = withBackground
      ? {
          default: 'bg-white dark:bg-brown-dark',
          gold: 'bg-gold/5 dark:bg-gold/10',
          maroon: 'bg-maroon/5 dark:bg-maroon/10',
          sand: 'bg-sand/30 dark:bg-brown/20',
          ivory: 'bg-ivory dark:bg-brown/30',
        }[backgroundVariant]
      : '';

    // Centering
    const centeringClasses = centered ? 'mx-auto' : '';

    // Combine all classes
    const containerClasses = cn(
      'w-full',
      widthVariants[variant],
      paddingClassName || paddingClasses,
      centeringClasses,
      backgroundClasses,
      withBackground && 'rounded-2xl shadow-sm border border-gold/5',
      withBackground && 'transition-colors duration-200',
      className
    );

    return (
      <div
        ref={ref}
        className={containerClasses}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';

export { Container };

// ============================================================
// Section component – a container with consistent spacing
// ============================================================
export interface SectionProps extends Omit<ContainerProps, 'variant'> {
  /**
   * Vertical padding variant
   * @default 'default'
   */
  paddingY?: 'none' | 'sm' | 'default' | 'lg' | 'xl';
  /**
   * Whether to add a separator border at the top
   * @default false
   */
  withSeparator?: boolean;
  /**
   * Background color for the section
   * @default 'transparent'
   */
  background?: 'transparent' | 'ivory' | 'sand' | 'gold-light' | 'maroon-light' | 'brown';
}

export function Section({
  className,
  children,
  paddingY = 'default',
  withSeparator = false,
  background = 'transparent',
  centered = true,
  withBackground = false,
  backgroundVariant = 'default',
  ...props
}: SectionProps) {
  // Vertical padding variants
  const paddingYVariants = {
    none: 'py-0',
    sm: 'py-8 md:py-12',
    default: 'py-12 md:py-16',
    lg: 'py-16 md:py-24',
    xl: 'py-20 md:py-32',
  };

  // Background colors
  const bgClasses = {
    transparent: '',
    ivory: 'bg-ivory dark:bg-brown',
    sand: 'bg-sand/50 dark:bg-brown/30',
    'gold-light': 'bg-gold/10 dark:bg-gold/5',
    'maroon-light': 'bg-maroon/10 dark:bg-maroon/5',
    brown: 'bg-brown/10 dark:bg-brown/30',
  };

  const sectionClasses = cn(
    'w-full',
    paddingYVariants[paddingY],
    bgClasses[background],
    withSeparator && 'border-t border-gold/10 dark:border-gold/5',
    className
  );

  return (
    <section className={sectionClasses}>
      <Container
        centered={centered}
        withBackground={withBackground}
        backgroundVariant={backgroundVariant}
        {...props}
      >
        {children}
      </Container>
    </section>
  );
}

// ============================================================
// ContentContainer – for content sections with max-width constraint
// ============================================================
export interface ContentContainerProps extends Omit<ContainerProps, 'variant'> {
  /**
   * Max width for the content
   * @default 'md'
   */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /**
   * Center text alignment
   * @default false
   */
  textCenter?: boolean;
}

export function ContentContainer({
  className,
  children,
  maxWidth = 'md',
  textCenter = false,
  centered = true,
  ...props
}: ContentContainerProps) {
  const maxWidthVariants = {
    sm: 'max-w-2xl',
    md: 'max-w-3xl',
    lg: 'max-w-4xl',
    xl: 'max-w-5xl',
    full: 'max-w-full',
  };

  return (
    <Container
      variant="full"
      centered={centered}
      className={cn(
        'w-full',
        maxWidthVariants[maxWidth],
        textCenter && 'text-center',
        className
      )}
      {...props}
    >
      {children}
    </Container>
  );
}

// ============================================================
// Default export
// ============================================================
export default Container;