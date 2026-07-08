// frontend/src/components/animations/MagneticButton.tsx

'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { cn } from '../../lib/utils';

// ============================================================
// Types
// ============================================================
export interface MagneticButtonOwnProps {
  /**
   * The strength of the magnetic effect (how far the button follows the cursor)
   * @default 0.3
   */
  strength?: number;
  /**
   * The damping value for the spring animation
   * @default 0.3
   */
  damping?: number;
  /**
   * The stiffness value for the spring animation
   * @default 0.2
   */
  stiffness?: number;
  /**
   * Whether to enable the magnetic effect
   * @default true
   */
  enabled?: boolean;
  /**
   * Children elements (the button content)
   */
  children: React.ReactNode;
  /**
   * Whether to apply a slight scale effect on hover
   * @default true
   */
  scaleOnHover?: boolean;
  /**
   * Scale factor when hovering
   * @default 1.05
   */
  scaleFactor?: number;
  /**
   * Whether to round the corners of the magnetic area
   * @default true
   */
  rounded?: boolean;
}

// The `as` prop is constrained to element types that accept a ref pointing to
// an HTMLElement, so `containerRef` (RefObject<HTMLDivElement>) can be safely
// forwarded regardless of which tag/component is rendered.
export type MagneticButtonProps<
  T extends React.ElementType = 'div'
> = MagneticButtonOwnProps &
  Omit<React.ComponentPropsWithRef<T>, keyof MagneticButtonOwnProps | 'as'> & {
    /**
     * The element to render as the container
     * @default 'div'
     */
    as?: T;
  };

// ============================================================
// MagneticButton Component
// ============================================================
export function MagneticButton<T extends React.ElementType = 'div'>({
  children,
  strength = 0.3,
  damping = 0.3,
  stiffness = 0.2,
  enabled = true,
  scaleOnHover = true,
  scaleFactor = 1.05,
  rounded = true,
  className,
  as,
  ...props
}: MagneticButtonProps<T>) {
  const Component = (as || 'div') as React.ElementType;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [center, setCenter] = useState({ x: 0, y: 0 });

  // Motion values for smooth animation
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);

  // Spring animations for smooth following
  const springX = useSpring(x, { damping: 20, stiffness: 150 });
  const springY = useSpring(y, { damping: 20, stiffness: 150 });
  const springScale = useSpring(scale, { damping: 20, stiffness: 150 });

  // Update dimensions and center on mount and resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
        setCenter({ x: rect.width / 2, y: rect.height / 2 });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Handle mouse enter
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (scaleOnHover) {
      scale.set(scaleFactor);
    }
  }, [scaleOnHover, scaleFactor, scale]);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
    scale.set(1);
  }, [x, y, scale]);

  // Handle mouse move
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!enabled || !containerRef.current || dimensions.width === 0) {
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Calculate offset from center
      const offsetX = (mouseX - center.x) / (dimensions.width / 2);
      const offsetY = (mouseY - center.y) / (dimensions.height / 2);

      // Apply strength and limit movement
      const maxOffset = 20;
      const moveX = Math.min(Math.max(offsetX * strength * maxOffset, -maxOffset), maxOffset);
      const moveY = Math.min(Math.max(offsetY * strength * maxOffset, -maxOffset), maxOffset);

      x.set(moveX);
      y.set(moveY);
    },
    [enabled, dimensions, center, strength, x, y]
  );

  // Touch support for mobile
  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!enabled || !containerRef.current || dimensions.width === 0) {
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      if (!touch) return;

      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;

      const offsetX = (touchX - center.x) / (dimensions.width / 2);
      const offsetY = (touchY - center.y) / (dimensions.height / 2);

      const maxOffset = 15;
      const moveX = Math.min(Math.max(offsetX * strength * maxOffset, -maxOffset), maxOffset);
      const moveY = Math.min(Math.max(offsetY * strength * maxOffset, -maxOffset), maxOffset);

      x.set(moveX);
      y.set(moveY);
    },
    [enabled, dimensions, center, strength, x, y]
  );

  const handleTouchEnd = useCallback(() => {
    x.set(0);
    y.set(0);
    scale.set(1);
  }, [x, y, scale]);

  return (
    <Component
      ref={containerRef}
      className={cn(
        'relative inline-block',
        rounded && 'rounded-full',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        cursor: enabled ? 'pointer' : 'default',
      }}
      {...props}
    >
      {/* Outer glow effect (active on hover) */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 -m-6 rounded-full bg-gold/20 blur-2xl pointer-events-none"
          style={{
            zIndex: -1,
          }}
        />
      )}

      {/* Magnetic content */}
      <motion.div
        style={{
          x: springX,
          y: springY,
          scale: springScale,
        }}
        transition={{
          type: 'spring',
          damping: 30,
          stiffness: 200,
        }}
        className="relative z-10 w-full h-full"
      >
        {children}
      </motion.div>
    </Component>
  );
}

// ============================================================
// MagneticButtonGroup – for grouping multiple magnetic buttons
// ============================================================
export interface MagneticButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  /**
   * The gap between buttons
   * @default 'gap-4'
   */
  gap?: string;
  /**
   * The alignment of buttons
   * @default 'center'
   */
  align?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
}

export function MagneticButtonGroup({
  children,
  className,
  gap = 'gap-4',
  align = 'center',
}: MagneticButtonGroupProps) {
  const alignClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  return (
    <div
      className={cn(
        'flex flex-wrap items-center',
        gap,
        alignClasses[align],
        className
      )}
    >
      {React.Children.map(children, (child, index) => (
        <div key={index} className="flex-shrink-0">
          {child}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// MagneticButtonSkeleton – Loading placeholder
// ============================================================
export function MagneticButtonSkeleton({
  className,
  width = 'w-32',
  height = 'h-12',
}: {
  className?: string;
  width?: string;
  height?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-full bg-sand/50 dark:bg-brown/50 animate-pulse',
        width,
        height,
        className
      )}
    />
  );
}

// ============================================================
// Default export
// ============================================================
export default MagneticButton;