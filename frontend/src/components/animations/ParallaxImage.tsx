// frontend/src/components/animations/ParallaxImage.tsx

'use client';

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useMotionValue, useSpring, useTransform, motion } from 'framer-motion';
import { cn } from '../../lib/utils';

// ============================================================
// Types
// ============================================================
export interface ParallaxImageProps {
  /**
   * Image source URL
   */
  src: string;
  /**
   * Image alt text
   */
  alt: string;
  /**
   * Additional image className
   */
  imageClassName?: string;
  /**
   * Container className
   */
  className?: string;
  /**
   * Aspect ratio of the container
   * @default '16/9'
   */
  aspectRatio?: '1/1' | '4/3' | '16/9' | '21/9' | '3/2' | string;
  /**
   * The intensity of the parallax effect (0-1)
   * @default 0.3
   */
  intensity?: number;
  /**
   * The type of parallax effect
   * @default 'both'
   */
  type?: 'mouse' | 'scroll' | 'both';
  /**
   * Direction of the parallax effect
   * @default 'both'
   */
  direction?: 'horizontal' | 'vertical' | 'both';
  /**
   * Whether to reverse the parallax direction
   * @default false
   */
  reverse?: boolean;
  /**
   * Whether to enable the effect on mobile
   * @default true
   */
  enableOnMobile?: boolean;
  /**
   * Whether to enable the effect on touch devices
   * @default true
   */
  enableOnTouch?: boolean;
  /**
   * Whether to use a circular reveal mask
   * @default false
   */
  circular?: boolean;
  /**
   * Whether to show a loading skeleton
   * @default false
   */
  loading?: boolean;
  /**
   * Whether the image should be priority loaded
   * @default false
   */
  priority?: boolean;
  /**
   * Overlay gradient on the image
   */
  overlay?: React.ReactNode;
  /**
   * The damping for the spring animation
   * @default 20
   */
  damping?: number;
  /**
   * The stiffness for the spring animation
   * @default 150
   */
  stiffness?: number;
  /**
   * Children to render over the image
   */
  children?: React.ReactNode;
  /**
   * Whether to apply a glass effect overlay
   * @default false
   */
  glassEffect?: boolean;
}

// ============================================================
// useParallax – Custom hook for parallax logic
// ============================================================
function useParallax({
  intensity = 0.3,
  type = 'both',
  direction = 'both',
  reverse = false,
  enableOnMobile = true,
  enableOnTouch = true,
  damping = 20,
  stiffness = 150,
}: {
  intensity?: number;
  type?: 'mouse' | 'scroll' | 'both';
  direction?: 'horizontal' | 'vertical' | 'both';
  reverse?: boolean;
  enableOnMobile?: boolean;
  enableOnTouch?: boolean;
  damping?: number;
  stiffness?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  // Motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const scrollY = useMotionValue(0);

  // Spring animations
  const springX = useSpring(mouseX, { damping, stiffness });
  const springY = useSpring(mouseY, { damping, stiffness });
  const springScroll = useSpring(scrollY, { damping: 30, stiffness: 100 });

  // Transform values
  const maxOffset = useMemo(() => 40 * intensity, [intensity]);
  const maxScrollOffset = useMemo(() => 60 * intensity, [intensity]);

  const transformX = useTransform(springX, [-1, 1], reverse ? [maxOffset, -maxOffset] : [-maxOffset, maxOffset]);
  const transformY = useTransform(springY, [-1, 1], reverse ? [maxOffset, -maxOffset] : [-maxOffset, maxOffset]);
  const transformScroll = useTransform(
    springScroll,
    [-0.5, 0.5],
    reverse ? [maxScrollOffset, -maxScrollOffset] : [-maxScrollOffset, maxScrollOffset]
  );

  // Check device capabilities (must run after mount since it reads browser-only
  // APIs; this is a one-time hydration-safe detection, not derivable at render time)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time browser capability detection on mount, cannot be derived during render without risking SSR/client mismatch
    setIsMounted(true);
    const isMobileDevice = window.innerWidth < 768;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsMobile(isMobileDevice);
    setIsTouch(isTouchDevice);
  }, []);

  // Handle mouse movement
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      if (isMobile && !enableOnMobile) return;
      if (isTouch && !enableOnTouch) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const normalizedX = (x * 2) - 1;
      const normalizedY = (y * 2) - 1;

      if (type === 'mouse' || type === 'both') {
        if (direction === 'horizontal' || direction === 'both') {
          mouseX.set(normalizedX);
        }
        if (direction === 'vertical' || direction === 'both') {
          mouseY.set(normalizedY);
        }
      }
    },
    [
      containerRef,
      isMobile,
      isTouch,
      enableOnMobile,
      enableOnTouch,
      type,
      direction,
      mouseX,
      mouseY,
    ]
  );

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  // Handle scroll
  useEffect(() => {
    if (type !== 'scroll' && type !== 'both') return;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Calculate how much of the element is visible (-1 to 1)
      const visibleRatio = 1 - (rect.top / viewportHeight);
      const clampedRatio = Math.min(Math.max(visibleRatio * 2 - 1, -1), 1);

      scrollY.set(clampedRatio);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [type, scrollY]);

  // Determine which transform to use
  const getTransform = useCallback(() => {
    const transforms: string[] = [];

    if (type === 'mouse' || type === 'both') {
      if (direction === 'horizontal' || direction === 'both') {
        transforms.push(`translateX(${transformX.get()}px)`);
      }
      if (direction === 'vertical' || direction === 'both') {
        transforms.push(`translateY(${transformY.get()}px)`);
      }
    }

    if (type === 'scroll' || type === 'both') {
      if (direction === 'vertical' || direction === 'both') {
        transforms.push(`translateY(${transformScroll.get()}px)`);
      }
      if (direction === 'horizontal' || direction === 'both') {
        transforms.push(`translateX(${transformScroll.get() * 0.5}px)`);
      }
    }

    return transforms.join(' ') || 'none';
  }, [transformX, transformY, transformScroll, type, direction]);

  return {
    containerRef,
    handleMouseMove,
    handleMouseLeave,
    getTransform,
    transformX,
    transformY,
    transformScroll,
    isMounted,
    isMobile,
    isTouch,
  };
}

// ============================================================
// ParallaxImage Component
// ============================================================
export function ParallaxImage({
  src,
  alt,
  imageClassName,
  className,
  aspectRatio = '16/9',
  intensity = 0.3,
  type = 'both',
  direction = 'both',
  reverse = false,
  enableOnMobile = true,
  enableOnTouch = true,
  circular = false,
  loading = false,
  priority = false,
  overlay,
  damping = 20,
  stiffness = 150,
  children,
  glassEffect = false,
  ...props
}: ParallaxImageProps) {
  const {
    containerRef,
    handleMouseMove,
    handleMouseLeave,
    transformX,
    transformY,
    transformScroll,
    isMounted,
    isMobile,
    isTouch,
  } = useParallax({
    intensity,
    type,
    direction,
    reverse,
    enableOnMobile,
    enableOnTouch,
    damping,
    stiffness,
  });

  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Determine if parallax should be active
  const shouldParallax = useMemo(() => {
    if (loading) return false;
    if (isMobile && !enableOnMobile) return false;
    if (isTouch && !enableOnTouch) return false;
    return true;
  }, [loading, isMobile, enableOnMobile, isTouch, enableOnTouch]);

  // Aspect ratio class
  const aspectRatioClasses = {
    '1/1': 'aspect-square',
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-[16/9]',
    '21/9': 'aspect-[21/9]',
    '3/2': 'aspect-[3/2]',
  };

  const aspectClass = aspectRatio in aspectRatioClasses
    ? aspectRatioClasses[aspectRatio as keyof typeof aspectRatioClasses]
    : `aspect-[${aspectRatio}]`;

  // Loading skeleton
  if (loading) {
    return (
      <div
        className={cn(
          'relative overflow-hidden bg-sand/50 dark:bg-brown/50 animate-pulse',
          aspectClass,
          circular && 'rounded-full',
          className
        )}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden',
        aspectClass,
        circular && 'rounded-full',
        glassEffect && 'after:absolute after:inset-0 after:bg-white/10 after:backdrop-blur-[2px] after:pointer-events-none',
        className
      )}
      onMouseMove={shouldParallax ? handleMouseMove : undefined}
      onMouseLeave={shouldParallax ? handleMouseLeave : undefined}
      {...props}
    >
      {/* Image with parallax transform */}
      <motion.div
        className={cn(
          'absolute inset-0 w-full h-full',
          !isImageLoaded && 'opacity-0'
        )}
        style={{
          transform: shouldParallax
            ? `translate(${transformX.get() * 0.3}px, ${transformY.get() * 0.3}px)`
            : 'none',
        }}
        animate={{
          scale: shouldParallax ? 1.05 : 1,
        }}
        transition={{
          type: 'spring',
          damping: 30,
          stiffness: 200,
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className={cn(
            'object-cover transition-opacity duration-500',
            imageClassName
          )}
          priority={priority}
          onLoad={() => setIsImageLoaded(true)}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Inner parallax layer (for double parallax effect) */}
        {shouldParallax && (
          <motion.div
            className="absolute inset-0 w-full h-full"
            style={{
              transform: `translate(${transformX.get() * -0.15}px, ${transformY.get() * -0.15}px)`,
            }}
          />
        )}
      </motion.div>

      {/* Overlay gradient */}
      {overlay && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {overlay}
        </div>
      )}

      {/* Children content */}
      {children && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          {children}
        </div>
      )}

      {/* Loading skeleton placeholder */}
      {!isImageLoaded && !loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-sand/30 dark:bg-brown/30">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

// ============================================================
// ParallaxContainer – For grouping multiple parallax elements
// ============================================================
export interface ParallaxContainerProps {
  children: React.ReactNode;
  className?: string;
  /**
   * The intensity of the parallax effect for all children
   * @default 0.2
   */
  intensity?: number;
  /**
   * The type of parallax effect
   * @default 'mouse'
   */
  type?: 'mouse' | 'scroll' | 'both';
  /**
   * Whether to apply a subtle perspective transform to the container
   * @default true
   */
  perspective?: boolean;
  /**
   * The perspective value in pixels
   * @default 1000
   */
  perspectiveValue?: number;
}

export function ParallaxContainer({
  children,
  className,
  intensity = 0.2,
  type = 'mouse',
  perspective = true,
  perspectiveValue = 1000,
}: ParallaxContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMouseX((x * 2) - 1);
    setMouseY((y * 2) - 1);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseX(0);
    setMouseY(0);
  }, []);

  const rotateX = useSpring(useMotionValue(mouseY * intensity * 5), { damping: 20, stiffness: 150 });
  const rotateY = useSpring(useMotionValue(mouseX * intensity * 5), { damping: 20, stiffness: 150 });

  return (
    <motion.div
      ref={containerRef}
      className={cn('relative', className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: perspective ? perspectiveValue : undefined,
        transformStyle: 'preserve-3d',
        rotateX: perspective && type !== 'scroll' ? rotateX : 0,
        rotateY: perspective && type !== 'scroll' ? rotateY : 0,
      }}
      transition={{
        type: 'spring',
        damping: 25,
        stiffness: 200,
      }}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
            intensity: intensity * 0.5,
            type: type,
          });
        }
        return child;
      })}
    </motion.div>
  );
}

// ============================================================
// ParallaxImageSkeleton – Loading placeholder
// ============================================================
export function ParallaxImageSkeleton({
  className,
  aspectRatio = '16/9',
  circular = false,
  count = 1,
}: {
  className?: string;
  aspectRatio?: '1/1' | '4/3' | '16/9' | '21/9' | '3/2' | string;
  circular?: boolean;
  count?: number;
}) {
  const aspectRatioClasses = {
    '1/1': 'aspect-square',
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-[16/9]',
    '21/9': 'aspect-[21/9]',
    '3/2': 'aspect-[3/2]',
  };

  const aspectClass = aspectRatio in aspectRatioClasses
    ? aspectRatioClasses[aspectRatio as keyof typeof aspectRatioClasses]
    : `aspect-[${aspectRatio}]`;

  if (count > 1) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'bg-sand/50 dark:bg-brown/50 animate-pulse',
              aspectClass,
              circular && 'rounded-full',
              className
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-sand/50 dark:bg-brown/50 animate-pulse',
        aspectClass,
        circular && 'rounded-full',
        className
      )}
    />
  );
}

// ============================================================
// ParallaxImageGallery – Gallery with parallax images
// ============================================================
export interface ParallaxImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  className?: string;
  intensity?: number;
  type?: 'mouse' | 'scroll' | 'both';
  columns?: 2 | 3 | 4;
  gap?: 'sm' | 'default' | 'lg';
  aspectRatio?: '1/1' | '4/3' | '16/9' | '3/2';
}

export function ParallaxImageGallery({
  images,
  className,
  intensity = 0.2,
  type = 'mouse',
  columns = 3,
  gap = 'default',
  aspectRatio = '16/9',
}: ParallaxImageGalleryProps) {
  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  const gapClasses = {
    sm: 'gap-3',
    default: 'gap-4 md:gap-6',
    lg: 'gap-6 md:gap-8',
  };

  return (
    <div className={cn('grid', columnClasses[columns], gapClasses[gap], className)}>
      {images.map((image, index) => (
        <ParallaxImage
          key={index}
          src={image.src}
          alt={image.alt}
          aspectRatio={aspectRatio}
          intensity={intensity}
          type={type}
          className="group"
        >
          {image.caption && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-white text-sm font-medium text-center">{image.caption}</p>
            </div>
          )}
        </ParallaxImage>
      ))}
    </div>
  );
}

// ============================================================
// Default export
// ============================================================
export default ParallaxImage;