// frontend/src/store/themeStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ============================================================
// Types
// ============================================================

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeState {
  /** Current theme preference ('system' follows OS preference) */
  theme: Theme;

  /** Set the theme explicitly */
  setTheme: (theme: Theme) => void;

  /** Toggle between light and dark (does not toggle 'system') */
  toggleTheme: () => void;
}

// ============================================================
// Zustand Store with persistence
// ============================================================

/**
 * Theme store – persists the user's theme preference across sessions.
 * Storage key matches the inline script in ThemeProvider (`getThemeScript`)
 * that applies the theme before hydration to avoid a flash of incorrect theme.
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',

      setTheme: (theme: Theme) => {
        set({ theme });
      },

      toggleTheme: () => {
        const current = get().theme;
        const resolved = current === 'system'
          ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          : current;
        set({ theme: resolved === 'dark' ? 'light' : 'dark' });
      },
    }),
    {
      name: 'panditji-theme-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ============================================================
// Default export
// ============================================================
export default useThemeStore;
