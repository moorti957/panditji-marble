// frontend/src/hooks/useScroll.ts

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { RefObject } from 'react';

// ============================================================
// Types
// ============================================================

export interface ScrollState {
  /** Current scroll position in pixels from the top */
  scrollY: number;
  /** Previous scroll position in pixels from the top */
  prevScrollY: number;
  /** Scroll direction: 'up', 'down', or null */
  direction: 'up' | 'down' | null;
  /** Whether the user has scrolled past the threshold */
  isScrolled: boolean;
  /** Whether the user has scrolled to the bottom of the page */
  isAtBottom: boolean;
  /** Whether the user is at the top of the page */
  isAtTop: boolean;
  /** Scroll progress percentage (0-1) */
  progress: number;
  /** Scroll velocity in pixels per second */
  velocity: number;
}

export interface UseScrollOptions {
  /** Initial scroll threshold to trigger 'isScrolled' */
  threshold?: number;
  /** Whether to track scroll velocity */
  trackVelocity?: boolean;
  /** Whether to enable smooth scrolling with Lenis */
  enableSmooth?: boolean;
  /** Lenis smooth scroll options */
  smoothOptions?: {
    duration?: number;
    easing?: (t: number) => number;
  };
  /** Whether to enable GSAP ScrollTrigger integration */
  enableGSAP?: boolean;
  /** Whether to enable on-mount scroll restoration */
  restoreScroll?: boolean;
  /** Callback when scroll position changes */
  onScroll?: (state: ScrollState) => void;
  /** Callback when scroll direction changes */
  onDirectionChange?: (direction: 'up' | 'down') => void;
  /** Callback when scrolled past threshold */
  onThresholdPass?: (isScrolled: boolean) => void;
}

export interface UseScrollReturn extends ScrollState {
  /** Scroll to a specific position */
  scrollTo: (y: number, options?: { smooth?: boolean; duration?: number }) => void;
  /** Scroll to a specific element */
  scrollToElement: (element: HTMLElement | string, options?: { offset?: number; smooth?: boolean }) => void;
  /** Scroll to the top of the page */
  scrollToTop: (smooth?: boolean) => void;
  /** Scroll to the bottom of the page */
  scrollToBottom: (smooth?: boolean) => void;
  /** Scroll by a delta value */
  scrollBy: (deltaY: number, smooth?: boolean) => void;
  /** Get the current scroll position */
  getScrollY: () => number;
  /** Get the maximum scroll position */
  getMaxScrollY: () => number;
  /** Get the current scroll progress */
  getScrollProgress: () => number;
  /** Check if an element is in viewport */
  isElementInViewport: (element: HTMLElement, offset?: number) => boolean;
  /** Get the bounding rect of an element relative to viewport */
  getElementRect: (element: HTMLElement) => DOMRect | null;
  /** Enable/disable smooth scrolling */
  setSmoothEnabled: (enabled: boolean) => void;
  /** Lenis instance (if enabled) */
  lenis: any | null;
  /** GSAP ScrollTrigger instance (if enabled) */
  scrollTrigger: any | null;
}

// ============================================================
// Lenis smooth scroll setup (lazy loaded)
// ============================================================

let lenisInstance: any = null;
let gsapScrollTriggerInstance: any = null;

// ============================================================
// useScroll Hook
// ============================================================

export function useScroll(options: UseScrollOptions = {}): UseScrollReturn {
  const {
    threshold = 50,
    trackVelocity = true,
    enableSmooth = false,
    smoothOptions = { duration: 1.2, easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) },
    enableGSAP = false,
    restoreScroll = false,
    onScroll,
    onDirectionChange,
    onThresholdPass,
  } = options;

  // State
  const [state, setState] = useState<ScrollState>({
    scrollY: 0,
    prevScrollY: 0,
    direction: null,
    isScrolled: false,
    isAtBottom: false,
    isAtTop: true,
    progress: 0,
    velocity: 0,
  });

  // Refs
  const lastScrollTime = useRef<number>(Date.now());
  const lastScrollY = useRef<number>(0);
  const animationFrame = useRef<number | null>(null);
  const lenisRef = useRef<any>(null);
  const isInitialized = useRef<boolean>(false);

  // ============================================================
  // Calculate scroll state
  // ============================================================

  const calculateScrollState = useCallback((): ScrollState => {
    const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    const maxScrollY = typeof window !== 'undefined'
      ? document.documentElement.scrollHeight - window.innerHeight
      : 0;
    const progress = maxScrollY > 0 ? scrollY / maxScrollY : 0;
    const isAtBottom = scrollY >= maxScrollY - 10;
    const isAtTop = scrollY < 10;
    const isScrolled = scrollY > threshold;

    const prevState = state;
    const direction: 'up' | 'down' | null = scrollY > prevState.prevScrollY ? 'down' : scrollY < prevState.prevScrollY ? 'up' : null;

    // Calculate velocity
    let velocity = 0;
    if (trackVelocity) {
      const now = Date.now();
      const timeDelta = Math.max(now - lastScrollTime.current, 16);
      const scrollDelta = scrollY - lastScrollY.current;
      velocity = Math.abs(scrollDelta) / (timeDelta / 1000);
      lastScrollTime.current = now;
      lastScrollY.current = scrollY;
    }

    return {
      scrollY,
      prevScrollY: prevState.scrollY,
      direction,
      isScrolled,
      isAtBottom,
      isAtTop,
      progress,
      velocity,
    };
  }, [state, threshold, trackVelocity]);

  // ============================================================
  // Update scroll state
  // ============================================================

  const updateScrollState = useCallback(() => {
    if (typeof window === 'undefined') return;

    const newState = calculateScrollState();
    
    setState((prev) => {
      // Only update if changed
      if (
        prev.scrollY === newState.scrollY &&
        prev.direction === newState.direction &&
        prev.isScrolled === newState.isScrolled &&
        prev.isAtBottom === newState.isAtBottom &&
        prev.isAtTop === newState.isAtTop &&
        prev.progress === newState.progress
      ) {
        return prev;
      }

      // Callbacks
      if (onScroll) onScroll(newState);
      if (onDirectionChange && newState.direction && newState.direction !== prev.direction) {
        onDirectionChange(newState.direction);
      }
      if (onThresholdPass && newState.isScrolled !== prev.isScrolled) {
        onThresholdPass(newState.isScrolled);
      }

      return newState;
    });
  }, [calculateScrollState, onScroll, onDirectionChange, onThresholdPass]);

  // ============================================================
  // Scroll functions
  // ============================================================

  const scrollTo = useCallback((y: number, options?: { smooth?: boolean; duration?: number }) => {
    const smooth = options?.smooth ?? true;
    const duration = options?.duration ?? 800;

    if (typeof window === 'undefined') return;

    if (enableSmooth && lenisRef.current) {
      // Use Lenis smooth scroll
      lenisRef.current.scrollTo(y, {
        duration: duration / 1000,
        easing: smoothOptions.easing,
      });
    } else if (smooth) {
      // Native smooth scroll
      window.scrollTo({ top: y, behavior: 'smooth' });
    } else {
      // Instant scroll
      window.scrollTo({ top: y, behavior: 'auto' });
    }
  }, [enableSmooth, smoothOptions.easing]);

  const scrollToElement = useCallback((element: HTMLElement | string, options?: { offset?: number; smooth?: boolean }) => {
    const target = typeof element === 'string'
      ? document.querySelector(element)
      : element;

    if (!target) return;

    const offset = options?.offset ?? 0;
    const smooth = options?.smooth ?? true;
    const rect = target.getBoundingClientRect();
    const y = rect.top + window.scrollY - offset;

    scrollTo(y, { smooth });
  }, [scrollTo]);

  const scrollToTop = useCallback((smooth: boolean = true) => {
    scrollTo(0, { smooth });
  }, [scrollTo]);

  const scrollToBottom = useCallback((smooth: boolean = true) => {
    const maxY = typeof window !== 'undefined'
      ? document.documentElement.scrollHeight - window.innerHeight
      : 0;
    scrollTo(maxY, { smooth });
  }, [scrollTo]);

  const scrollBy = useCallback((deltaY: number, smooth: boolean = true) => {
    const currentY = typeof window !== 'undefined' ? window.scrollY : 0;
    scrollTo(currentY + deltaY, { smooth });
  }, [scrollTo]);

  const getScrollY = useCallback(() => {
    return typeof window !== 'undefined' ? window.scrollY : 0;
  }, []);

  const getMaxScrollY = useCallback(() => {
    return typeof window !== 'undefined'
      ? document.documentElement.scrollHeight - window.innerHeight
      : 0;
  }, []);

  const getScrollProgress = useCallback(() => {
    const maxY = getMaxScrollY();
    return maxY > 0 ? getScrollY() / maxY : 0;
  }, [getMaxScrollY, getScrollY]);

  const isElementInViewport = useCallback((element: HTMLElement, offset: number = 0) => {
    const rect = element.getBoundingClientRect();
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
    return rect.top + offset < viewportHeight && rect.bottom - offset > 0;
  }, []);

  const getElementRect = useCallback((element: HTMLElement) => {
    return element.getBoundingClientRect();
  }, []);

  const setSmoothEnabled = useCallback((enabled: boolean) => {
    if (typeof window === 'undefined') return;

    if (enabled && !lenisRef.current) {
      // Initialize Lenis
      import('lenis').then((module) => {
        const Lenis = module.default;
        const lenis = new Lenis({
          duration: smoothOptions.duration,
          easing: smoothOptions.easing,
          orientation: 'vertical',
          smoothWheel: true,
        });

        lenis.on('scroll', (e: any) => {
          // Update state with Lenis scroll position
          setState((prev) => {
            const newState = {
              ...prev,
              scrollY: e,
            };
            return newState;
          });
          updateScrollState();
        });

        lenisRef.current = lenis;
        // Connect to GSAP if enabled
        if (enableGSAP) {
          import('gsap').then((gsapModule) => {
            const gsap = gsapModule.default;
            import('gsap/ScrollTrigger').then((stModule) => {
              const ScrollTrigger = stModule.default;
              gsap.registerPlugin(ScrollTrigger);
              lenis.on('scroll', ScrollTrigger.update);
              gsap.ticker.add(lenis.raf);
              gsapScrollTriggerInstance = ScrollTrigger;
            });
          });
        }
      });
    } else if (!enabled && lenisRef.current) {
      // Destroy Lenis
      lenisRef.current.destroy();
      lenisRef.current = null;
      if (gsapScrollTriggerInstance) {
        gsapScrollTriggerInstance = null;
      }
    }
  }, [smoothOptions.duration, smoothOptions.easing, enableGSAP, updateScrollState]);

  // ============================================================
  // Setup scroll listener
  // ============================================================

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // If Lenis is already enabled, use its scroll events
    if (enableSmooth && lenisRef.current) {
      return;
    }

    // Native scroll listener with RAF throttling
    const handleScroll = () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      animationFrame.current = requestAnimationFrame(() => {
        updateScrollState();
        animationFrame.current = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initial update
    updateScrollState();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
      }
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
    };
  }, [enableSmooth, restoreScroll, updateScrollState]);

  // ============================================================
  // Initialize Lenis if smooth enabled
  // ============================================================

  useEffect(() => {
    if (enableSmooth && !isInitialized.current) {
      isInitialized.current = true;
      setSmoothEnabled(true);
    }

    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
    };
  }, [enableSmooth, setSmoothEnabled]);

  // ============================================================
  // Return
  // ============================================================

  return {
    ...state,
    scrollTo,
    scrollToElement,
    scrollToTop,
    scrollToBottom,
    scrollBy,
    getScrollY,
    getMaxScrollY,
    getScrollProgress,
    isElementInViewport,
    getElementRect,
    setSmoothEnabled,
    lenis: lenisRef.current,
    scrollTrigger: gsapScrollTriggerInstance,
  };
}

// ============================================================
// useScrollToTop – Hook for scroll-to-top functionality
// ============================================================

export interface UseScrollToTopOptions {
  /** Scroll threshold to show the button */
  threshold?: number;
  /** Whether to smooth scroll */
  smooth?: boolean;
}

export function useScrollToTop(options: UseScrollToTopOptions = {}) {
  const { threshold = 300, smooth = true } = options;
  const [isVisible, setIsVisible] = useState(false);

  const scrollToTop = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
  }, [smooth]);

  const handleScroll = useCallback(() => {
    const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    setIsVisible(scrollY > threshold);
  }, [threshold]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return {
    isVisible,
    scrollToTop,
  };
}

// ============================================================
// useScrollProgress – Hook for scroll progress
// ============================================================

export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateProgress = () => {
      const scrollY = window.scrollY;
      const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(maxScrollY > 0 ? scrollY / maxScrollY : 0);
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return progress;
}

// ============================================================
// useScrollLock – Hook for locking/unlocking scroll
// ============================================================

export function useScrollLock(locked: boolean = false) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (locked) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [locked]);
}

// ============================================================
// useScrollToHash – Hook for scrolling to hash on mount
// ============================================================

export function useScrollToHash(options?: { offset?: number; smooth?: boolean }) {
  const { offset = 0, smooth = true } = options || {};

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = window.location.hash;
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        setTimeout(() => {
          const rect = element.getBoundingClientRect();
          const y = rect.top + window.scrollY - offset;
          window.scrollTo({ top: y, behavior: smooth ? 'smooth' : 'auto' });
        }, 100);
      }
    }
  }, [offset, smooth]);
}

// ============================================================
// Default export
// ============================================================

export default useScroll;