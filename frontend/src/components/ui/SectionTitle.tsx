// frontend/src/components/ui/SectionTitle.tsx

import * as React from 'react';
import { cn } from '@/lib/utils';

// ============================================================
// Types
// ============================================================
export interface SectionTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Main title text
   */
  title: string;
  /**
   * Subtitle text (optional)
   */
  subtitle?: string;
  /**
   * Tag/badge text (optional) – appears above the title
   */
  tag?: string;
  /**
   * Alignment of the section title
   * @default 'center'
   */
  align?: 'left' | 'center' | 'right';
  /**
   * Size variant for the title
   * @default 'default'
   */
  size?: 'sm' | 'default' | 'lg' | 'xl';
  /**
   * Whether to show the ornate divider
   * @default true
   */
  showDivider?: boolean;
  /**
   * Whether to show the diamond decoration
   * @default true
   */
  showDiamond?: boolean;
  /**
   * Custom className for the title
   */
  titleClassName?: string;
  /**
   * Custom className for the subtitle
   */
  subtitleClassName?: string;
  /**
   * Custom className for the tag
   */
  tagClassName?: string;
  /**
   * Whether the title has a gradient text effect
   * @default false
   */
  gradient?: boolean;
  /**
   * Color variant for the title
   * @default 'default'
   */
  color?: 'default' | 'gold' | 'maroon' | 'ivory' | 'brown';
}

// ============================================================
// SectionTitle Component
// ============================================================
const SectionTitle = React.forwardRef<HTMLDivElement, SectionTitleProps>(
  (
    {
      className,
      title,
      subtitle,
      tag,
      align = 'center',
      size = 'default',
      showDivider = true,
      showDiamond = true,
      titleClassName,
      subtitleClassName,
      tagClassName,
      gradient = false,
      color = 'default',
      ...props
    },
    ref
  ) => {
    // Size variants
    const sizeVariants = {
      sm: {
        title: 'text-xl sm:text-2xl md:text-3xl',
        subtitle: 'text-sm',
        tag: 'text-[10px]',
      },
      default: {
        title: 'text-2xl sm:text-3xl md:text-4xl',
        subtitle: 'text-sm md:text-base',
        tag: 'text-[10px] sm:text-xs',
      },
      lg: {
        title: 'text-3xl sm:text-4xl md:text-5xl',
        subtitle: 'text-base md:text-lg',
        tag: 'text-xs sm:text-sm',
      },
      xl: {
        title: 'text-4xl sm:text-5xl md:text-6xl',
        subtitle: 'text-base md:text-lg',
        tag: 'text-xs sm:text-sm',
      },
    };

    // Color variants
    const colorVariants = {
      default: 'text-brown dark:text-ivory',
      gold: 'text-gold-dark dark:text-gold',
      maroon: 'text-maroon dark:text-maroon-light',
      ivory: 'text-ivory',
      brown: 'text-brown',
    };

    const titleColor = colorVariants[color];
    const titleSize = sizeVariants[size].title;
    const subtitleSize = sizeVariants[size].subtitle;
    const tagSize = sizeVariants[size].tag;

    // Alignment classes
    const alignClasses = {
      left: 'text-left items-start',
      center: 'text-center items-center',
      right: 'text-right items-end',
    };

    // Gradient text
    const gradientClasses = gradient
      ? 'bg-gradient-to-r from-gold to-gold-dark bg-clip-text text-transparent dark:from-gold dark:to-gold-light'
      : '';

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col space-y-2',
          alignClasses[align],
          className
        )}
        {...props}
      >
        {/* Tag (optional) */}
        {tag && (
          <span
            className={cn(
              'inline-block font-semibold tracking-widest uppercase text-gold-dark dark:text-gold',
              tagSize,
              tagClassName
            )}
          >
            {tag}
          </span>
        )}

        {/* Ornate Divider (top) */}
        {showDivider && (
          <div
            className={cn(
              'flex items-center gap-3',
              align === 'center' && 'justify-center',
              align === 'right' && 'justify-end'
            )}
          >
            <div className="flex-1 max-w-12 h-px bg-gradient-to-r from-transparent to-gold/40" />
            {showDiamond && (
              <span className="text-gold/60 text-sm select-none">✦</span>
            )}
            <div className="flex-1 max-w-12 h-px bg-gradient-to-l from-transparent to-gold/40" />
          </div>
        )}

        {/* Main Title */}
        <h2
          className={cn(
            'font-cinzel font-bold leading-tight tracking-tight',
            titleSize,
            color === 'default' ? titleColor : '',
            gradientClasses,
            titleClassName
          )}
        >
          {title}
        </h2>

        {/* Subtitle (optional) */}
        {subtitle && (
          <p
            className={cn(
              'text-brown-light dark:text-ivory/60 max-w-2xl',
              subtitleSize,
              align === 'center' && 'mx-auto',
              subtitleClassName
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
    );
  }
);

SectionTitle.displayName = 'SectionTitle';

// ============================================================
// SectionHeader – a wrapper with action button/link
// ============================================================
export interface SectionHeaderProps extends SectionTitleProps {
  /**
   * Action button/link to render on the right side
   */
  action?: React.ReactNode;
  /**
   * Whether to stack the action below the title on mobile
   * @default true
   */
  stackOnMobile?: boolean;
}

export function SectionHeader({
  className,
  action,
  stackOnMobile = true,
  align = 'left',
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8',
        className
      )}
    >
      <SectionTitle
        align={align}
        showDivider={false}
        {...props}
        className={cn(
          'flex-1',
          align === 'center' && 'text-center md:text-left'
        )}
      />
      {action && (
        <div
          className={cn(
            'shrink-0',
            stackOnMobile ? 'w-full md:w-auto' : 'w-auto'
          )}
        >
          {action}
        </div>
      )}
    </div>
  );
}

// ============================================================
// TitleWithIcon – a title with an icon
// ============================================================
export interface TitleWithIconProps extends Omit<SectionTitleProps, 'title'> {
  icon: React.ReactNode;
  title: string;
  iconPosition?: 'left' | 'top';
  iconClassName?: string;
}

export function TitleWithIcon({
  icon,
  title,
  subtitle,
  iconPosition = 'left',
  iconClassName,
  className,
  align = 'center',
  ...props
}: TitleWithIconProps) {
  const isLeft = iconPosition === 'left';

  return (
    <div
      className={cn(
        'flex flex-col',
        isLeft ? 'flex-row items-center gap-4' : 'items-center gap-3',
        align === 'center' && 'justify-center',
        align === 'right' && 'justify-end',
        className
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'shrink-0 text-gold-dark dark:text-gold',
          isLeft ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-5xl',
          iconClassName
        )}
      >
        {icon}
      </div>

      {/* Title */}
      <div className={cn('flex-1', !isLeft && 'text-center')}>
        <SectionTitle
          title={title}
          subtitle={subtitle}
          align={align}
          showDivider={false}
          {...props}
        />
      </div>
    </div>
  );
}

// ============================================================
// TitleSkeleton – loading placeholder
// ============================================================
export function TitleSkeleton({
  className,
  size = 'default',
  showSubtitle = true,
}: {
  className?: string;
  size?: 'sm' | 'default' | 'lg' | 'xl';
  showSubtitle?: boolean;
}) {
  const sizeClasses = {
    sm: 'h-6 w-40',
    default: 'h-8 w-48',
    lg: 'h-10 w-56',
    xl: 'h-12 w-64',
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-3">
        <div className="flex-1 max-w-12 h-px bg-gold/10" />
        <div className="w-2 h-2 rounded-full bg-gold/20" />
        <div className="flex-1 max-w-12 h-px bg-gold/10" />
      </div>
      <div
        className={cn(
          'mx-auto bg-sand/50 dark:bg-brown/50 rounded-lg animate-pulse',
          sizeClasses[size]
        )}
      />
      {showSubtitle && (
        <div className="mx-auto h-4 w-64 bg-sand/30 dark:bg-brown/30 rounded animate-pulse" />
      )}
    </div>
  );
}

// ============================================================
// Default export
// ============================================================
export default SectionTitle;