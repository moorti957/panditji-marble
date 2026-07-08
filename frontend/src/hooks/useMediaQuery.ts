// frontend/src/hooks/useMediaQuery.ts

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// ============================================================
// Types
// ============================================================

export interface UseMediaQueryOptions {
  /**
   * Default value to return when not in browser (SSR)
   * @default false
   */
  defaultValue?: boolean;
  /**
   * Whether to debounce the change handler
   * @default false
   */
  debounce?: boolean;
  /**
   * Debounce delay in milliseconds
   * @default 150
   */
  debounceDelay?: number;
  /**
   * Whether to trigger an immediate update on mount
   * @default true
   */
  immediate?: boolean;
}

// ============================================================
// useMediaQuery Hook
// ============================================================

/**
 * A hook that returns whether a media query matches.
 * 
 * @param query - The media query string (e.g., '(min-width: 768px)')
 * @param options - Configuration options
 * @returns Whether the media query matches
 * 
 * @example
 * ```tsx
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
 * const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
 * ```
 */
export function useMediaQuery(
  query: string,
  options: UseMediaQueryOptions = {}
): boolean {
  const {
    defaultValue = false,
    debounce = false,
    debounceDelay = 150,
    immediate = true,
  } = options;

  // SSR safe: determine if we're in the browser
  const isBrowser = typeof window !== 'undefined' && typeof window.matchMedia === 'function';

  // State for the match result
  const [matches, setMatches] = useState<boolean>(() => {
    if (!isBrowser) return defaultValue;
    if (immediate) {
      try {
        return window.matchMedia(query).matches;
      } catch {
        return defaultValue;
      }
    }
    return defaultValue;
  });

  // Ref for debounce timer
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
    };
  }, []);

  // Handler for media query change
  const handleChange = useCallback(
    (event: MediaQueryListEvent) => {
      const newMatches = event.matches;

      if (debounce) {
        // Debounce the update
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }
        debounceTimer.current = setTimeout(() => {
          setMatches(newMatches);
          debounceTimer.current = null;
        }, debounceDelay);
      } else {
        setMatches(newMatches);
      }
    },
    [debounce, debounceDelay]
  );

  // Set up the media query listener
  useEffect(() => {
    if (!isBrowser) return;

    let mediaQueryList: MediaQueryList | null = null;

    try {
      mediaQueryList = window.matchMedia(query);
    } catch (error) {
      // Fallback for unsupported matchMedia
      setMatches(defaultValue);
      return;
    }

    // Set initial match if not already set or if immediate is false
    if (!immediate) {
      setMatches(mediaQueryList.matches);
    }

    // Add listener using the modern API if available, fallback to deprecated addListener
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', handleChange);
    } else if (mediaQueryList.addListener) {
      // Deprecated but fallback for older browsers
      mediaQueryList.addListener(handleChange);
    }

    return () => {
      if (mediaQueryList) {
        if (mediaQueryList.removeEventListener) {
          mediaQueryList.removeEventListener('change', handleChange);
        } else if (mediaQueryList.removeListener) {
          mediaQueryList.removeListener(handleChange);
        }
      }
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
    };
  }, [query, isBrowser, handleChange, defaultValue, immediate]);

  return matches;
}

// ============================================================
// Predefined media query hooks for common breakpoints
// ============================================================

/**
 * Hook for mobile devices (width ≤ 768px)
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)');
}

/**
 * Hook for tablets (width between 769px and 1024px)
 */
export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
}

/**
 * Hook for desktop devices (width ≥ 1025px)
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1025px)');
}

/**
 * Hook for dark mode preference
 */
export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

/**
 * Hook for light mode preference
 */
export function usePrefersLightMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: light)');
}

/**
 * Hook for reduced motion preference
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/**
 * Hook for portrait orientation
 */
export function useIsPortrait(): boolean {
  return useMediaQuery('(orientation: portrait)');
}

/**
 * Hook for landscape orientation
 */
export function useIsLandscape(): boolean {
  return useMediaQuery('(orientation: landscape)');
}

/**
 * Hook for high contrast mode
 */
export function usePrefersHighContrast(): boolean {
  return useMediaQuery('(prefers-contrast: high)');
}

// ============================================================
// Responsive breakpoints (Tailwind-like)
// ============================================================

export const breakpoints = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
  maxSm: '(max-width: 639px)',
  maxMd: '(max-width: 767px)',
  maxLg: '(max-width: 1023px)',
  maxXl: '(max-width: 1279px)',
  max2xl: '(max-width: 1535px)',
};

/**
 * Hook for Tailwind's sm breakpoint (≥640px)
 */
export function useSm(): boolean {
  return useMediaQuery(breakpoints.sm);
}

/**
 * Hook for Tailwind's md breakpoint (≥768px)
 */
export function useMd(): boolean {
  return useMediaQuery(breakpoints.md);
}

/**
 * Hook for Tailwind's lg breakpoint (≥1024px)
 */
export function useLg(): boolean {
  return useMediaQuery(breakpoints.lg);
}

/**
 * Hook for Tailwind's xl breakpoint (≥1280px)
 */
export function useXl(): boolean {
  return useMediaQuery(breakpoints.xl);
}

/**
 * Hook for Tailwind's 2xl breakpoint (≥1536px)
 */
export function use2xl(): boolean {
  return useMediaQuery(breakpoints['2xl']);
}

/**
 * Hook for below sm breakpoint (<640px)
 */
export function useBelowSm(): boolean {
  return useMediaQuery(breakpoints.maxSm);
}

// ============================================================
// useMediaQueries – Multiple queries at once
// ============================================================

export interface MediaQueriesResult {
  [key: string]: boolean;
}

/**
 * Hook that takes multiple media queries and returns an object with their matches.
 * 
 * @example
 * ```tsx
 * const { isMobile, isTablet, isDesktop } = useMediaQueries({
 *   isMobile: '(max-width: 768px)',
 *   isTablet: '(min-width: 769px) and (max-width: 1024px)',
 *   isDesktop: '(min-width: 1025px)',
 * });
 * ```
 */
export function useMediaQueries<T extends Record<string, string>>(
  queries: T,
  options?: UseMediaQueryOptions
): { [K in keyof T]: boolean } {
  const result = {} as { [K in keyof T]: boolean };
  const keys = Object.keys(queries) as (keyof T)[];

  // Use individual hooks for each query
  for (const key of keys) {
    // This would normally cause a violation of hooks rules if used inside a loop,
    // but since we're calling it at the top level of a custom hook, we can't loop.
    // Instead, we'll use a single effect with matchMedia.
    // We'll implement a simpler version: we'll use useState and useEffect manually.
  }

  // Correct implementation: use a single effect that checks all queries
  const initialMatches = Object.fromEntries(
    keys.map((key) => [key, false])
  ) as { [K in keyof T]: boolean };

  const [matches, setMatches] = useState<{ [K in keyof T]: boolean }>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return initialMatches;
    }
    const result = { ...initialMatches };
    for (const key of keys) {
      const query = queries[key];
      try {
        result[key] = window.matchMedia(query).matches;
      } catch {
        result[key] = false;
      }
    }
    return result;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQueryLists: { key: keyof T; mql: MediaQueryList }[] = [];
    const handlers: ((e: MediaQueryListEvent) => void)[] = [];

    for (const key of keys) {
      const query = queries[key];
      try {
        const mql = window.matchMedia(query);
        mediaQueryLists.push({ key, mql });
        const handler = (e: MediaQueryListEvent) => {
          setMatches((prev) => ({
            ...prev,
            [key]: e.matches,
          }));
        };
        handlers.push(handler);
        if (mql.addEventListener) {
          mql.addEventListener('change', handler);
        } else if (mql.addListener) {
          mql.addListener(handler);
        }
      } catch {
        // ignore
      }
    }

    return () => {
      for (let i = 0; i < mediaQueryLists.length; i++) {
        const { mql, key } = mediaQueryLists[i];
        const handler = handlers[i];
        if (mql.removeEventListener) {
          mql.removeEventListener('change', handler);
        } else if (mql.removeListener) {
          mql.removeListener(handler);
        }
      }
    };
  }, [queries, keys]);

  return matches;
}

// ============================================================
// useMatchMedia – Alias for useMediaQuery
// ============================================================

export const useMatchMedia = useMediaQuery;

// ============================================================
// Default export
// ============================================================

export default useMediaQuery;