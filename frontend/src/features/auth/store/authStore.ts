// frontend/src/features/auth/store/authStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import type { User } from '@/features/auth/types/auth.types';

// ============================================================
// Types
// ============================================================

export interface AuthState {
  // User data
  user: User | null;
  
  // Tokens
  accessToken: string | null;
  refreshToken: string | null;
  
  // Permissions
  permissions: string[];
  
  // Status flags
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
  
  // User role helpers
  getRole: () => string | undefined;
  hasRole: (role: string | string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string | null, refreshToken: string | null) => void;
  setPermissions: (permissions: string[]) => void;
  setLoading: (isLoading: boolean) => void;
  setInitializing: (isInitializing: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;
  reset: () => void;
  
  // Convenience actions
  login: (user: User, accessToken: string, refreshToken?: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshSession: (user: User, accessToken: string, refreshToken?: string) => void;
}

// ============================================================
// Initial State
// ============================================================

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  permissions: [],
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  error: null,
};

// ============================================================
// Zustand Store with Persistence
// ============================================================

export const useAuthStore = create<AuthState>()(
  persist(
    immer((set, get) => ({
      // === Initial state ===
      ...initialState,

      // === Getters ===
      
      /**
       * Get user role
       */
      getRole: () => {
        const { user } = get();
        return user?.role;
      },

      /**
       * Check if user has a specific role or any of the roles
       */
      hasRole: (role: string | string[]) => {
        const { user } = get();
        if (!user) return false;
        
        const userRole = user.role;
        if (Array.isArray(role)) {
          return role.includes(userRole);
        }
        return userRole === role;
      },

      /**
       * Check if user has a specific permission
       */
      hasPermission: (permission: string) => {
        const { permissions } = get();
        return permissions.includes(permission);
      },

      /**
       * Check if user has any of the given permissions
       */
      hasAnyPermission: (permissions: string[]) => {
        const { permissions: userPermissions } = get();
        return permissions.some((p) => userPermissions.includes(p));
      },

      /**
       * Check if user has all of the given permissions
       */
      hasAllPermissions: (permissions: string[]) => {
        const { permissions: userPermissions } = get();
        return permissions.every((p) => userPermissions.includes(p));
      },

      // === Actions ===

      /**
       * Set user data
       */
      setUser: (user: User | null) => {
        set((state) => {
          state.user = user;
          state.isAuthenticated = !!user;
          state.error = null;
        });
      },

      /**
       * Set tokens
       */
      setTokens: (accessToken: string | null, refreshToken: string | null) => {
        set((state) => {
          state.accessToken = accessToken;
          state.refreshToken = refreshToken;
          state.isAuthenticated = !!accessToken;
        });
      },

      /**
       * Set permissions
       */
      setPermissions: (permissions: string[]) => {
        set((state) => {
          state.permissions = permissions;
        });
      },

      /**
       * Set loading state
       */
      setLoading: (isLoading: boolean) => {
        set((state) => {
          state.isLoading = isLoading;
        });
      },

      /**
       * Set initializing state
       */
      setInitializing: (isInitializing: boolean) => {
        set((state) => {
          state.isInitializing = isInitializing;
        });
      },

      /**
       * Set error state
       */
      setError: (error: string | null) => {
        set((state) => {
          state.error = error;
        });
      },

      /**
       * Clear all auth data (logout)
       */
      clearAuth: () => {
        set((state) => {
          state.user = null;
          state.accessToken = null;
          state.refreshToken = null;
          state.permissions = [];
          state.isAuthenticated = false;
          state.isLoading = false;
          state.error = null;
        });
      },

      /**
       * Reset store to initial state
       */
      reset: () => {
        set(initialState);
      },

      /**
       * Convenience login action
       */
      login: (user: User, accessToken: string, refreshToken?: string) => {
        set((state) => {
          state.user = user;
          state.accessToken = accessToken;
          state.refreshToken = refreshToken || null;
          state.isAuthenticated = true;
          state.isLoading = false;
          state.error = null;
        });
      },

      /**
       * Convenience logout action (clear all auth data)
       */
      logout: () => {
        set((state) => {
          state.user = null;
          state.accessToken = null;
          state.refreshToken = null;
          state.permissions = [];
          state.isAuthenticated = false;
          state.isLoading = false;
          state.error = null;
        });
      },

      /**
       * Update user data (partial)
       */
      updateUser: (userData: Partial<User>) => {
        set((state) => {
          if (state.user) {
            state.user = { ...state.user, ...userData };
          }
        });
      },

      /**
       * Refresh session with new user and tokens
       */
      refreshSession: (user: User, accessToken: string, refreshToken?: string) => {
        set((state) => {
          state.user = user;
          state.accessToken = accessToken;
          state.refreshToken = refreshToken || state.refreshToken;
          state.isAuthenticated = true;
          state.isLoading = false;
          state.error = null;
        });
      },
    })),
    {
      name: 'panditji-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        permissions: state.permissions,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // If user exists but no tokens, clear auth
          if (state.user && !state.accessToken) {
            state.clearAuth();
          }
          // Reset loading state after rehydration
          state.isInitializing = false;
          state.isLoading = false;
        }
      },
    }
  )
);

// ============================================================
// Selectors (for optimized component subscriptions)
// ============================================================

export const authSelectors = {
  /** Get current user */
  selectUser: (state: AuthState) => state.user,
  
  /** Check if user is authenticated */
  selectIsAuthenticated: (state: AuthState) => state.isAuthenticated,
  
  /** Get access token */
  selectAccessToken: (state: AuthState) => state.accessToken,
  
  /** Get refresh token */
  selectRefreshToken: (state: AuthState) => state.refreshToken,
  
  /** Get user permissions */
  selectPermissions: (state: AuthState) => state.permissions,
  
  /** Check if loading */
  selectIsLoading: (state: AuthState) => state.isLoading,
  
  /** Check if initializing */
  selectIsInitializing: (state: AuthState) => state.isInitializing,
  
  /** Get error */
  selectError: (state: AuthState) => state.error,
  
  /** Get user role */
  selectUserRole: (state: AuthState) => state.user?.role,
  
  /** Check if user has a specific role */
  selectHasRole: (state: AuthState) => (role: string | string[]) => state.hasRole(role),
  
  /** Check if user has a specific permission */
  selectHasPermission: (state: AuthState) => (permission: string) => state.hasPermission(permission),
};

// ============================================================
// Utility Functions
// ============================================================

/**
 * Check if token is expired by decoding it
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;
    if (!exp) return true;
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

/**
 * Get token expiration time in milliseconds
 */
export function getTokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

/**
 * Check if token is about to expire (within 5 minutes)
 */
export function isTokenExpiringSoon(token: string, thresholdMs: number = 5 * 60 * 1000): boolean {
  const expiry = getTokenExpiry(token);
  if (!expiry) return true;
  return Date.now() >= expiry - thresholdMs;
}

/**
 * Get token payload
 */
export function getTokenPayload(token: string): any {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

/**
 * Decode user from token (if stored in token payload)
 */
export function decodeUserFromToken(token: string): Partial<User> | null {
  const payload = getTokenPayload(token);
  if (!payload) return null;
  return {
    id: payload.sub || payload.id,
    email: payload.email,
    name: payload.name,
    role: payload.role,
    permissions: payload.permissions || [],
  };
}

// ============================================================
// Default export
// ============================================================
export default useAuthStore;