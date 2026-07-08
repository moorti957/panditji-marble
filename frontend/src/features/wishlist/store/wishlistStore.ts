// frontend/src/features/wishlist/store/wishlistStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type { Product } from '@/features/products/types/product.types';

// ============================================================
// Types
// ============================================================

/**
 * A wishlist item is the product itself (kept in full so it can be
 * rendered directly in wishlist/profile views without refetching).
 */
export type WishlistItem = Product;

/**
 * Wishlist store state and actions
 */
export interface WishlistState {
  /** Wishlisted products */
  items: WishlistItem[];

  /** Add a product to the wishlist (no-op if already present) */
  addItem: (product: Product) => void;

  /** Remove a product from the wishlist by ID */
  removeItem: (productId: string) => void;

  /** Add if absent, remove if present */
  toggleItem: (product: Product) => void;

  /** Check whether a product is in the wishlist */
  isInWishlist: (productId: string) => boolean;

  /** Clear the entire wishlist */
  clearWishlist: () => void;
}

// ============================================================
// Zustand Store with persistence
// ============================================================

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: Product) => {
        set((state) => {
          if (state.items.some((item) => item.id === product.id)) {
            return state;
          }
          return { items: [...state.items, product] };
        });
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },

      toggleItem: (product: Product) => {
        const exists = get().items.some((item) => item.id === product.id);
        if (exists) {
          get().removeItem(product.id);
        } else {
          get().addItem(product);
        }
      },

      isInWishlist: (productId: string) => {
        return get().items.some((item) => item.id === productId);
      },

      clearWishlist: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'panditji-wishlist-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ============================================================
// Default export
// ============================================================
export default useWishlistStore;
