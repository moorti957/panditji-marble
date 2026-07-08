// frontend/src/store/rootStore.ts

import { useAuthStore } from '@/features/auth/store/authStore';
import useCartStore from '@/features/cart/store/cartStore';
import { useWishlistStore } from '@/features/wishlist/store/wishlistStore';
import { useThemeStore } from '@/store/themeStore';

// ============================================================
// Export all stores individually
// ============================================================

export { useAuthStore, useCartStore, useWishlistStore, useThemeStore };

// ============================================================
// Helper to get auth store state for API client (non-reactive)
// ============================================================

/**
 * Get the current auth state directly from the store (for use in axios interceptors)
 * This avoids hooks and provides a synchronous way to read auth data.
 */
export function getAuthStore() {
  const state = useAuthStore.getState();
  return {
    user: state.user,
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
    isAuthenticated: state.isAuthenticated,
    permissions: state.permissions,
  };
}

// ============================================================
// Combined store hook for convenience
// ============================================================

/**
 * A convenience hook that provides all stores in one object.
 * Useful for components that need data from multiple stores.
 * 
 * @example
 * ```tsx
 * const { auth, cart, wishlist, theme } = useRootStore();
 * const user = auth.user;
 * const items = cart.items;
 * ```
 */
export function useRootStore() {
  const auth = useAuthStore();
  const cart = useCartStore();
  const wishlist = useWishlistStore();
  const theme = useThemeStore();

  return {
    auth,
    cart,
    wishlist,
    theme,
  };
}

// ============================================================
// Selectors for commonly used state (optimized for components)
// ============================================================

/**
 * Get the current user (optimized selector)
 */
export function useUser() {
  return useAuthStore((state) => state.user);
}

/**
 * Get the authentication status (optimized selector)
 */
export function useIsAuthenticated() {
  return useAuthStore((state) => state.isAuthenticated);
}

/**
 * Get the access token (optimized selector)
 */
export function useAccessToken() {
  return useAuthStore((state) => state.accessToken);
}

/**
 * Get total cart items count (optimized selector)
 */
export function useCartTotalItems() {
  return useCartStore((state) => state.totalItems);
}

/**
 * Get cart grand total (optimized selector)
 */
export function useCartGrandTotal() {
  return useCartStore((state) => state.grandTotal);
}

/**
 * Get wishlist items count (optimized selector)
 */
export function useWishlistCount() {
  return useWishlistStore((state) => state.items.length);
}

/**
 * Get the current theme (optimized selector)
 */
export function useTheme() {
  return useThemeStore((state) => state.theme);
}

// ============================================================
// Utility functions for store operations
// ============================================================

/**
 * Clear all stores (logout or reset app state)
 */
export function resetAllStores() {
  useAuthStore.getState().clearAuth();
  useCartStore.getState().clearCart();
  useWishlistStore.getState().clearWishlist();
  // Theme store doesn't need resetting, but you can if needed
}

/**
 * Logout helper – clears auth and cart, but keeps theme preference
 */
export function logoutUser() {
  useAuthStore.getState().logout();
  useCartStore.getState().clearCart();
  useWishlistStore.getState().clearWishlist();
}

// ============================================================
// Default export (for simpler imports)
// ============================================================

const rootStore = {
  useAuthStore,
  useCartStore,
  useWishlistStore,
  useThemeStore,
  getAuthStore,
  useRootStore,
  useUser,
  useIsAuthenticated,
  useAccessToken,
  useCartTotalItems,
  useCartGrandTotal,
  useWishlistCount,
  useTheme,
  resetAllStores,
  logoutUser,
};

export default rootStore;