// frontend/src/components/animations/ScrollReveal.tsx

'use client';

import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';

import { motion, useInView, useReducedMotion, Variants, HTMLMotionProps, Transition } from 'framer-motion';
import { cn } from '../../lib/utils';

// ============================================================
// Types
// ============================================================
export type RevealVariant =
  | 'fadeUp'
  | 'fadeDown'
  | 'fadeLeft'
  | 'fadeRight'
  | 'fadeScale'
  | 'fade'
  | 'scale'
  | 'stagger'
  | 'slideUp'
  | 'slideDown'
  | 'slideLeft'
  | 'slideRight'
  | 'zoomIn'
  | 'zoomOut'
  | 'flip'
  | 'blur';

export interface ScrollRevealProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  /**
   * The animation variant to apply
   * @default 'fadeUp'
   */
  variant?: RevealVariant;
  /**
   * Custom variants object (overrides variant prop)
   */
  customVariants?: Variants;
  /**
   * Animation duration in seconds
   * @default 0.6
   */
  duration?: number;
  /**
   * Animation delay in seconds
   * @default 0
   */
  delay?: number;
  /**
   * Stagger children delay in seconds (for stagger variants)
   * @default 0.05
   */
  staggerChildren?: number;
  /**
   * Amount of element that must be visible before triggering (0-1)
   * @default 0.2
   */
  threshold?: number;
  /**
   * Whether to trigger once or every time element comes into view
   * @default true
   */
  once?: boolean;
  /**
   * Custom className for the wrapper
   */
  className?: string;
  /**
   * Children elements
   */
  children: React.ReactNode;
  /**
   * Whether to animate on initial mount
   * @default true
   */
  animateOnMount?: boolean;
  /**
   * Whether to disable animations (for performance or preference)
   * @default false
   */
  disabled?: boolean;
  /**
   * Root margin for IntersectionObserver
   * @default '0px 0px -50px 0px'
   */
  rootMargin?: string;
  /**
   * Whether to apply a subtle scale effect
   * @default false
   */
  subtle?: boolean;
  /**
   * Whether to use a snap effect (element snaps into place)
   * @default false
   */
  snap?: boolean;
}

// ============================================================
// Default variants
// ============================================================
export const revealVariants: Record<RevealVariant, Variants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  fadeDown: {
    hidden: { opacity: 0, y: -40 },
    visible: { opacity: 1, y: 0 },
  },
  fadeLeft: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  fadeRight: {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
  },
  fadeScale: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  scale: {
    hidden: { scale: 0.8 },
    visible: { scale: 1 },
  },
  stagger: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
  slideUp: {
    hidden: { y: 60, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  },
  slideDown: {
    hidden: { y: -60, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  },
  slideLeft: {
    hidden: { x: -60, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  },
  slideRight: {
    hidden: { x: 60, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  },
  zoomIn: {
    hidden: { scale: 0.6, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
  },
  zoomOut: {
    hidden: { scale: 1.4, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
  },
  flip: {
    hidden: { rotateX: 90, opacity: 0 },
    visible: { rotateX: 0, opacity: 1 },
  },
  blur: {
    hidden: { filter: 'blur(12px)', opacity: 0 },
    visible: { filter: 'blur(0px)', opacity: 1 },
  },
};

// ============================================================
// Child stagger variants
// ============================================================
export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

// ============================================================
// ScrollReveal Component
// ============================================================
export function ScrollReveal({
  variant = 'fadeUp',
  customVariants,
  duration = 0.6,
  delay = 0,
  staggerChildren = 0.05,
  threshold = 0.2,
  once = true,
  className,
  children,
  animateOnMount = true,
  disabled = false,
  rootMargin = '0px 0px -50px 0px',
  subtle = false,
  snap = false,
  ...props
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    amount: threshold,
    once,
    margin: rootMargin as NonNullable<Parameters<typeof useInView>[1]>['margin'],
  });
  const prefersReducedMotion = useReducedMotion();
  const [hasAnimated, setHasAnimated] = useState(false);

  // Determine if animation should be active
  const shouldAnimate = useMemo(() => {
    if (disabled) return false;
    if (prefersReducedMotion) return false;
    if (!animateOnMount && !isInView) return false;
    return true;
  }, [disabled, prefersReducedMotion, animateOnMount, isInView]);

  // Track animation state (derived during render instead of in an effect,
  // // to avoid the extra render pass caused by setState-in-effect)
  // const [prevIsInView, setPrevIsInView] = useState(isInView);
  // if (isInView !== prevIsInView) {
  //   setPrevIsInView(isInView);
  //   if (isInView && once && !hasAnimated) {
  //     setHasAnimated(true);
  //   }
  // }
  
useEffect(() => {
  if (isInView && once && !hasAnimated) {
    setHasAnimated(true);
  }
}, [isInView, once, hasAnimated]);

  // Get the appropriate variants
  const getVariants = useCallback((): Variants => {
    if (customVariants) return customVariants;
    if (variant === 'stagger') {
      return {
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            staggerChildren,
            delayChildren: delay,
            duration,
            ease: 'easeOut',
          },
        },
      };
    }
    return revealVariants[variant] || revealVariants.fadeUp;
  }, [customVariants, variant, staggerChildren, delay, duration]);

  // Get transition config
  const getTransition = useCallback((): Transition => {
    if (variant === 'stagger') {
      return {
        staggerChildren,
        delayChildren: delay,
      };
    }
    if (snap) {
      return {
        duration,
        delay,
        ease: [0.34, 1.56, 0.64, 1],
        type: 'spring',
        damping: 20,
        stiffness: 200,
      };
    }
    return {
      duration,
      delay,
      ease: 'easeOut',
      type: 'tween',
    };
  }, [variant, staggerChildren, delay, duration, snap]);

  // Compute final variants
  const variants = getVariants();
  const transition = getTransition();

  // If disabled or prefers reduced motion, render children without animation
  if (disabled || prefersReducedMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  // If it's a stagger variant, wrap children in motion.div with stagger
  if (variant === 'stagger') {
    return (
      <motion.div
        ref={ref}
        className={className}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={variants}
        transition={transition}
        {...props}
      >
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
              variants: staggerItemVariants,
              custom: index,
            });
          }
          return child;
        })}
      </motion.div>
    );
  }

  // For individual child animations
  const animationProps = {
    ref,
    className,
   initial: 'hidden',
animate: isInView ? 'visible' : 'hidden',
    variants,
    transition,
    ...props,
  };

  // Apply subtle variant (reduced intensity)
  if (subtle) {
    const subtleVariants = {
      hidden: { opacity: 0, y: 15 },
      visible: { opacity: 1, y: 0 },
    };
    return (
      <motion.div
        {...animationProps}
        variants={subtleVariants}
        transition={{ duration: duration * 0.8, delay, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div {...animationProps}>
      {children}
    </motion.div>
  );
}

// ============================================================
// ScrollRevealGroup – Group multiple items with stagger
// ============================================================
export interface ScrollRevealGroupProps extends Omit<ScrollRevealProps, 'variant' | 'children'> {
  children: React.ReactNode;
  /**
   * The stagger direction
   * @default 'up'
   */
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  /**
   * The number of columns for grid layout
   */
  columns?: 2 | 3 | 4 | 5;
  /**
   * Gap between items
   * @default 'gap-4 md:gap-6'
   */
  gap?: string;
}

export function ScrollRevealGroup({
  children,
  direction = 'up',
  columns,
  gap = 'gap-4 md:gap-6',
  duration = 0.5,
  staggerChildren = 0.08,
  threshold = 0.15,
  once = true,
  className,
  ...props
}: ScrollRevealGroupProps) {
  // Map direction to variant
  const variantMap: Record<string, RevealVariant> = {
    up: 'fadeUp',
    down: 'fadeDown',
    left: 'fadeLeft',
    right: 'fadeRight',
    fade: 'fade',
  };

  const columnClasses = columns
    ? {
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5',
      }[columns]
    : '';

  return (
    <ScrollReveal
      variant="stagger"
      duration={duration}
      staggerChildren={staggerChildren}
      threshold={threshold}
      once={once}
      className={cn('grid', columnClasses, gap, className)}
      {...props}
    >
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
            variants: {
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.5,
                  delay: index * 0.08,
                  ease: 'easeOut',
                },
              },
            },
          });
        }
        return child;
      })}
    </ScrollReveal>
  );
}

// ============================================================
// ScrollRevealItem – Individual item in a group
// ============================================================
export interface ScrollRevealItemProps extends Omit<ScrollRevealProps, 'children'> {
  children: React.ReactNode;
  index?: number;
}

export function ScrollRevealItem({
  children,
  index = 0,
  duration = 0.5,
  delay = 0,
  className,
  ...props
}: ScrollRevealItemProps) {
  const itemDelay = delay + index * 0.05;

  return (
    <ScrollReveal
      duration={duration}
      delay={itemDelay}
      className={className}
      {...props}
    >
      {children}
    </ScrollReveal>
  );
}

// ============================================================
// ScrollRevealSection – Full section with title and content
// ============================================================
export interface ScrollRevealSectionProps extends ScrollRevealProps {
  title?: string;
  titleVariant?: RevealVariant;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
}

export function ScrollRevealSection({
  title,
  titleVariant = 'fadeUp',
  subtitle,
  align = 'center',
  children,
  className,
  ...props
}: ScrollRevealSectionProps) {
  const alignClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      {(title || subtitle) && (
        <div className={cn('flex flex-col', alignClasses[align])}>
          {title && (
            <ScrollReveal variant={titleVariant} once threshold={0.1}>
              <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-900">
                {title}
              </h2>
            </ScrollReveal>
          )}
          {subtitle && (
            <ScrollReveal variant="fade" delay={0.1} once threshold={0.1}>
              <p className={cn(
                'text-brown-light dark:text-ivory/60 text-sm md:text-base max-w-2xl',
                align === 'center' && 'mx-auto'
              )}>
                {subtitle}
              </p>
            </ScrollReveal>
          )}
        </div>
      )}

      {/* Content */}
      <ScrollReveal {...props}>
        {children}
      </ScrollReveal>
    </div>
  );
}

// ============================================================
// ScrollRevealImage – Specialized image reveal with zoom
// ============================================================
export interface ScrollRevealImageProps extends ScrollRevealProps {
  src: string;
  alt: string;
  aspectRatio?: '1/1' | '4/3' | '16/9' | '21/9' | '3/2';
  className?: string;
}

export function ScrollRevealImage({
  src,
  alt,
  aspectRatio = '16/9',
  className,
  variant = 'scale',
  ...props
}: ScrollRevealImageProps) {
  const aspectRatioClasses = {
    '1/1': 'aspect-square',
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-[16/9]',
    '21/9': 'aspect-[21/9]',
    '3/2': 'aspect-[3/2]',
  };

  return (
    <ScrollReveal variant={variant} {...props}>
      <div className={cn('relative overflow-hidden rounded-2xl', aspectRatioClasses[aspectRatio], className)}>
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    </ScrollReveal>
  );
}

// ============================================================
// ScrollRevealList – For animating list items
// ============================================================
export interface ScrollRevealListProps extends Omit<ScrollRevealGroupProps, 'children' | 'columns'> {
  items: Array<{
    id: string;
    content: React.ReactNode;
  }>;
  columns?: 1 | 2 | 3 | 4;
}

export function ScrollRevealList({
  items,
  columns = 1,
  gap = 'gap-4',
  ...props
}: ScrollRevealListProps) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid', columnClasses[columns as keyof typeof columnClasses] || 'grid-cols-1', gap)}>
      {items.map((item, index) => (
        <ScrollRevealItem key={item.id} index={index} {...props}>
          {item.content}
        </ScrollRevealItem>
      ))}
    </div>
  );
}

// ============================================================
// ScrollRevealSkeleton – Loading placeholder
// ============================================================
export interface ScrollRevealSkeletonProps {
  count?: number;
  height?: number;
  width?: string;
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
}

export function ScrollRevealSkeleton({
  count = 3,
  height = 200,
  width = 'w-full',
  className,
  variant = 'rect',
}: ScrollRevealSkeletonProps) {
  const variantClasses = {
    rect: 'rounded-2xl',
    circle: 'rounded-full aspect-square',
    text: 'rounded-lg h-6',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'bg-sand/50 dark:bg-brown/50 animate-pulse',
            variantClasses[variant],
            className
          )}
          style={{ height: variant === 'text' ? 'auto' : height, minHeight: variant === 'text' ? 24 : 0 }}
        />
      ))}
    </div>
  );
}

// ============================================================
// useScrollReveal – Custom hook for programmatic control
// ============================================================
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const isInView = useInView(ref, { amount: 0.2, once: true });
  const [isVisible, setIsVisible] = useState(false);

  // Derive isVisible during render instead of in an effect, to avoid the
  // extra render pass caused by setState-in-effect.
  if (isInView && !isVisible) {
    setIsVisible(true);
  }

  return { ref, isInView, isVisible };
}

// ============================================================
// Default export
// ============================================================
export default ScrollReveal;