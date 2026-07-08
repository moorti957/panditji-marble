// frontend/src/features/wishlist/hooks/useWishlist.ts

import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import useWishlistStore from '@/features/wishlist/store/wishlistStore';
import type { WishlistItem } from '@/features/wishlist/store/wishlistStore';
import type { Product } from '@/features/products/types/product.types';

// ============================================================
// Types
// ============================================================

export interface UseWishlistReturn {
  /** Wishlisted products */
  items: WishlistItem[];
  /** Number of items in the wishlist */
  totalItems: number;
  /** Whether the wishlist is empty */
  isEmpty: boolean;

  /** Add a product to the wishlist */
  addItem: (product: Product) => void;
  /** Remove a product from the wishlist by ID */
  removeItem: (productId: string) => void;
  /** Add if absent, remove if present */
  toggleWishlist: (product: Product) => void;
  /** Clear the entire wishlist */
  clearWishlist: () => void;

  /** Check whether a product is in the wishlist */
  isInWishlist: (productId: string) => boolean;
}

// ============================================================
// useWishlist Hook
// ============================================================

/**
 * A custom hook that provides a complete wishlist API with selectors for
 * performance, mirroring the pattern used by `useCart`.
 *
 * @example
 * ```tsx
 * const { items, toggleWishlist, isInWishlist } = useWishlist();
 * ```
 */
export function useWishlist(): UseWishlistReturn {
  const items = useWishlistStore((state) => state.items);

 const addItem = useWishlistStore((s) => s.addItem);
const removeItem = useWishlistStore((s) => s.removeItem);
const toggleItem = useWishlistStore((s) => s.toggleItem);
const clearWishlist = useWishlistStore((s) => s.clearWishlist);

const isInWishlist = useWishlistStore((s) => s.isInWishlist);

  return useMemo(
    () => ({
      items,
      totalItems: items.length,
      isEmpty: items.length === 0,
      addItem,
      removeItem,
      toggleWishlist: toggleItem,
      clearWishlist,
      isInWishlist,
    }),
    [items, addItem, removeItem, toggleItem, clearWishlist, isInWishlist]
  );
}

// ============================================================
// Default export
// ============================================================
export default useWishlist;
