// frontend/src/providers/ThemeProvider.tsx

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useThemeStore } from '@/store/themeStore';
import type { Theme } from '@/store/themeStore';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// ============================================================
// Types
// ============================================================

/** The resolved (non-'system') theme actually applied to the DOM */
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  theme: ResolvedTheme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  isLight: boolean;
}

// ============================================================
// Context
// ============================================================

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// ============================================================
// ThemeProvider Component
// ============================================================

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Get theme from Zustand store (useShallow avoids re-renders from a new
  // object reference on every store update under Zustand v5)
  const { theme, setTheme, toggleTheme } = useThemeStore(
    useShallow((state) => ({
      theme: state.theme,
      setTheme: state.setTheme,
      toggleTheme: state.toggleTheme,
    }))
  );

  // Detect system preference
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [mounted, setMounted] = useState(false);
  const [appliedTheme, setAppliedTheme] = useState<ResolvedTheme>(
    theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme
  );

  // Determine the effective theme (considering system preference)
  const effectiveTheme = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme;

  // Apply theme class to html element
  useEffect(() => {
    const root = document.documentElement;
    const previousTheme = root.getAttribute('data-theme') as ResolvedTheme | null;

    // Remove previous theme class
    if (previousTheme) {
      root.classList.remove(previousTheme);
    }

    // Add new theme class
    root.classList.add(effectiveTheme);
    root.setAttribute('data-theme', effectiveTheme);

    // Store the applied theme for other purposes
    setAppliedTheme(effectiveTheme);

    // Add smooth transition for theme changes
    root.style.transition = 'background-color 0.3s ease, color 0.3s ease';

    // Cleanup
    return () => {
      root.style.transition = '';
    };
  }, [effectiveTheme]);

  // Handle mount state to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Synchronize the store with system preference when it changes
  useEffect(() => {
    if (theme === 'system') {
      // The effectiveTheme will update automatically via the derived value
    }
  }, [prefersDark, theme]);

  // Provide context value
  const contextValue: ThemeContextValue = {
    theme: effectiveTheme, // Return the resolved theme (not 'system')
    toggleTheme,
    setTheme,
    isDark: effectiveTheme === 'dark',
    isLight: effectiveTheme === 'light',
  };

  // Avoid hydration mismatch by not rendering children until mounted
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// ============================================================
// Utility function to apply theme on initial load (script)
// ============================================================

/**
 * This function is meant to be used in a <script> tag in the HTML head
 * to prevent a flash of incorrect theme on initial load.
 * It reads the stored theme and applies it synchronously.
 */
export function getThemeScript() {
  return `
    (function() {
      try {
        const stored = localStorage.getItem('panditji-theme-storage');
        if (stored) {
          const parsed = JSON.parse(stored);
          const theme = parsed.state?.theme || 'light';
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          const resolved = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme;
          document.documentElement.classList.add(resolved);
          document.documentElement.setAttribute('data-theme', resolved);
        }
      } catch (e) {
        // ignore
      }
    })();
  `;
}

// ============================================================
// Default export
// ============================================================

export default ThemeProvider;