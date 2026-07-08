// frontend/src/features/cart/hooks/useCart.ts

import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import useCartStore, { cartSelectors } from '@/features/cart/store/cartStore';
import type { CartItem, AppliedCoupon } from '@/features/cart/store/cartStore';
import type { Product } from '@/features/products/types/product.types';

// ============================================================
// Types
// ============================================================

export interface UseCartReturn {
  // State
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discountAmount: number;
  grandTotal: number;
  coupon: AppliedCoupon | null;
  shippingMethod: 'standard' | 'express';
  giftWrap: boolean;
  isEmpty: boolean;
  uniqueItemsCount: number;

  // Actions
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  setShippingMethod: (method: 'standard' | 'express') => void;
  toggleGiftWrap: () => void;
  prepareCheckout: () => {
    items: CartItem[];
    subtotal: number;
    shippingCost: number;
    tax: number;
    discountAmount: number;
    grandTotal: number;
    coupon: AppliedCoupon | null;
    giftWrap: boolean;
    shippingMethod: 'standard' | 'express';
  };

  // Utilities
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
  getItem: (productId: string) => CartItem | undefined;
  openCartDrawer: () => void;
}

// ============================================================
// useCart Hook
// ============================================================

/**
 * A custom hook that provides a complete cart API with selectors for performance.
 * 
 * @example
 * ```tsx
 * const { items, totalItems, grandTotal, addItem, removeItem } = useCart();
 * ```
 */
export function useCart(): UseCartReturn {
  // Selectors for state (to avoid unnecessary re-renders)
  const items = useCartStore(cartSelectors.selectItems);
  const totalItems = useCartStore(cartSelectors.selectTotalItems);
  const subtotal = useCartStore(cartSelectors.selectSubtotal);
  const shippingCost = useCartStore(cartSelectors.selectShippingCost);
  const tax = useCartStore(cartSelectors.selectTax);
  const discountAmount = useCartStore(cartSelectors.selectDiscountAmount);
  const grandTotal = useCartStore(cartSelectors.selectGrandTotal);
  const coupon = useCartStore(cartSelectors.selectCoupon);
  const shippingMethod = useCartStore(cartSelectors.selectShippingMethod);
  const giftWrap = useCartStore(cartSelectors.selectGiftWrap);
  const isEmpty = useCartStore(cartSelectors.selectIsEmpty);
  const uniqueItemsCount = useCartStore(cartSelectors.selectUniqueItemsCount);

  // Actions (grouped together to minimize subscriptions)
  const {
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
    setShippingMethod,
    toggleGiftWrap,
    prepareCheckout,
  } = useCartStore(
    useShallow((state) => ({
      addItem: state.addItem,
      removeItem: state.removeItem,
      updateQuantity: state.updateQuantity,
      clearCart: state.clearCart,
      applyCoupon: state.applyCoupon,
      removeCoupon: state.removeCoupon,
      setShippingMethod: state.setShippingMethod,
      toggleGiftWrap: state.toggleGiftWrap,
      prepareCheckout: state.prepareCheckout,
    }))
  );

  // Utilities (using store directly to avoid extra selector calls)
const isInCart = useCartStore((state) => state.isInCart);

const getItemQuantity = useCartStore((state) => state.getItemQuantity);

const getItem = useCartStore((state) => state.getItem);

const openCartDrawer = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('openCartDrawer'));
  }
};

  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(
    () => ({
      items,
      totalItems,
      subtotal,
      shippingCost,
      tax,
      discountAmount,
      grandTotal,
      coupon,
      shippingMethod,
      giftWrap,
      isEmpty,
      uniqueItemsCount,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      applyCoupon,
      removeCoupon,
      setShippingMethod,
      toggleGiftWrap,
      prepareCheckout,
      isInCart,
      getItemQuantity,
      getItem,
      openCartDrawer,
    }),
    [
      items,
      totalItems,
      subtotal,
      shippingCost,
      tax,
      discountAmount,
      grandTotal,
      coupon,
      shippingMethod,
      giftWrap,
      isEmpty,
      uniqueItemsCount,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      applyCoupon,
      removeCoupon,
      setShippingMethod,
      toggleGiftWrap,
      prepareCheckout,
      isInCart,
      getItemQuantity,
      getItem,
      openCartDrawer,
    ]
  );
}

// ============================================================
// useCartItem – For specific item operations
// ============================================================

/**
 * Hook to get a specific cart item and its operations.
 * 
 * @param productId - The ID of the product
 * @returns The item, quantity, and operations for that item
 * 
 * @example
 * ```tsx
 * const { item, quantity, updateQuantity, removeItem } = useCartItem('product-123');
 * ```
 */
export function useCartItem(productId: string) {
  const item = useCartStore((state) => state.getItem(productId));
  const quantity = useCartStore((state) => state.getItemQuantity(productId));
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  return useMemo(
    () => ({
      item,
      quantity,
      updateQuantity: (newQuantity: number) => updateQuantity(productId, newQuantity),
      removeItem: () => removeItem(productId),
      isInCart: quantity > 0,
    }),
    [item, quantity, productId, updateQuantity, removeItem]
  );
}

// ============================================================
// useCartTotal – For totals only (performance optimized)
// ============================================================

/**
 * Hook that only returns total calculations, optimized for performance.
 * 
 * @example
 * ```tsx
 * const { grandTotal, totalItems } = useCartTotal();
 * ```
 */
export function useCartTotal() {
  const totalItems = useCartStore(cartSelectors.selectTotalItems);
  const subtotal = useCartStore(cartSelectors.selectSubtotal);
  const shippingCost = useCartStore(cartSelectors.selectShippingCost);
  const tax = useCartStore(cartSelectors.selectTax);
  const discountAmount = useCartStore(cartSelectors.selectDiscountAmount);
  const grandTotal = useCartStore(cartSelectors.selectGrandTotal);

  return useMemo(
    () => ({
      totalItems,
      subtotal,
      shippingCost,
      tax,
      discountAmount,
      grandTotal,
    }),
    [totalItems, subtotal, shippingCost, tax, discountAmount, grandTotal]
  );
}

// ============================================================
// useCartActions – For actions only (without state)
// ============================================================

/**
 * Hook that only returns cart actions, for components that don't need state.
 * 
 * @example
 * ```tsx
 * const { addItem, removeItem } = useCartActions();
 * ```
 */
export function useCartActions() {
  const addItem = useCartStore((state) => state.addItem);
const removeItem = useCartStore((state) => state.removeItem);
const updateQuantity = useCartStore((state) => state.updateQuantity);
const clearCart = useCartStore((state) => state.clearCart);
const applyCoupon = useCartStore((state) => state.applyCoupon);
const removeCoupon = useCartStore((state) => state.removeCoupon);
const setShippingMethod = useCartStore((state) => state.setShippingMethod);
const toggleGiftWrap = useCartStore((state) => state.toggleGiftWrap);
const prepareCheckout = useCartStore((state) => state.prepareCheckout);

  return useMemo(
    () => ({
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      applyCoupon,
      removeCoupon,
      setShippingMethod,
      toggleGiftWrap,
      prepareCheckout,
    }),
    [
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      applyCoupon,
      removeCoupon,
      setShippingMethod,
      toggleGiftWrap,
      prepareCheckout,
    ]
  );
}

// ============================================================
// useCartCount – For quick badge count
// ============================================================

/**
 * Hook that returns only the total item count, for badges and icons.
 * 
 * @example
 * ```tsx
 * const itemCount = useCartCount();
 * ```
 */
export function useCartCount(): number {
  return useCartStore(cartSelectors.selectTotalItems);
}

// ============================================================
// useIsCartEmpty – For conditional rendering
// ============================================================

/**
 * Hook that returns whether the cart is empty.
 * 
 * @example
 * ```tsx
 * const isEmpty = useIsCartEmpty();
 * ```
 */
export function useIsCartEmpty(): boolean {
  return useCartStore(cartSelectors.selectIsEmpty);
}

// ============================================================
// Default export (main hook)
// ============================================================
export default useCart;