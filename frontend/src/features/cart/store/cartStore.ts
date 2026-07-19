// frontend/src/features/cart/store/cartStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { toast } from '@/lib/notifications';

import type { Product } from '@/features/products/types/product.types';

// ============================================================
// Types
// ============================================================

/**
 * Cart item structure
 */
export interface CartItem {
  product: Product;
  quantity: number;
}

/**
 * Applied coupon
 */
export interface AppliedCoupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  description?: string;
}

/**
 * Cart state interface
 */
export interface CartState {
  // Items
  items: CartItem[];
  
  // Coupon
  coupon: AppliedCoupon | null;
  
  // Gift wrap option
  giftWrap: boolean;
  
  // Shipping method
  shippingMethod: 'standard' | 'express';
  
  // Computed totals (derived)
  totalItems: number;
  totalPrice: number;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discountAmount: number;
  grandTotal: number;
  
  // Actions
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Coupon actions
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  
  // Shipping actions
  setShippingMethod: (method: 'standard' | 'express') => void;
  
  // Gift wrap actions
  toggleGiftWrap: () => void;
  
  // Utility actions
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
  getItem: (productId: string) => CartItem | undefined;
  
  // Checkout
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
  
  // Reset
  reset: () => void;
}

// ============================================================
// Constants
// ============================================================

const TAX_RATE = 0.18; // 18% GST
const STANDARD_SHIPPING_COST = 299;
const EXPRESS_SHIPPING_COST = 499;

// ============================================================
// Initial state
// ============================================================

const initialState = {
  items: [],
  coupon: null,
  giftWrap: false,
  shippingMethod: 'standard' as const,
  totalItems: 0,
  totalPrice: 0,
  subtotal: 0,
  shippingCost: 0,
  tax: 0,
  discountAmount: 0,
  grandTotal: 0,
};

// ============================================================
// Helper functions
// ============================================================

/**
 * Calculate shipping cost based on subtotal and method
 */
const calculateShippingCost = (_subtotal: number, method: 'standard' | 'express'): number => {
  return method === 'standard' ? STANDARD_SHIPPING_COST : EXPRESS_SHIPPING_COST;
};

/**
 * Calculate tax (GST)
 */
const calculateTax = (subtotal: number): number => {
  return Math.round(subtotal * TAX_RATE);
};

/**
 * Calculate discount amount from coupon
 */
const calculateDiscount = (subtotal: number, coupon: AppliedCoupon | null): number => {
  if (!coupon) return 0;
  if (coupon.discountType === 'percentage') {
    return Math.round((subtotal * coupon.discountValue) / 100);
  }
  return Math.min(coupon.discountValue, subtotal);
};

/**
 * Calculate all totals
 */
const calculateTotals = (
  items: CartItem[],
  coupon: AppliedCoupon | null,
  shippingMethod: 'standard' | 'express',
  giftWrap: boolean
) => {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const shippingCost = calculateShippingCost(subtotal, shippingMethod);
  const tax = calculateTax(subtotal);
  const discountAmount = calculateDiscount(subtotal, coupon);
  const giftWrapCost = giftWrap ? 99 : 0;
  const grandTotal = subtotal + shippingCost + tax + giftWrapCost - discountAmount;

  return {
    subtotal,
    totalItems,
    shippingCost,
    tax,
    discountAmount,
    grandTotal,
    giftWrapCost,
  };
};

// ============================================================
// Mock coupon validation (replace with API call)
// ============================================================

const VALID_COUPONS: Record<string, AppliedCoupon> = {
  'DIVINE10': {
    code: 'DIVINE10',
    discountType: 'percentage',
    discountValue: 10,
    description: '10% off on all murtis',
  },
  'WELCOME20': {
    code: 'WELCOME20',
    discountType: 'percentage',
    discountValue: 20,
    description: '20% off for new devotees',
  },
  'FREESHIP': {
    code: 'FREESHIP',
    discountType: 'fixed',
    discountValue: 500,
    description: '500 off on shipping',
  },
  'MARBLE10': {
    code: 'MARBLE10',
    discountType: 'percentage',
    discountValue: 10,
    description: '10% off on marble murtis',
  },
};

// ============================================================
// Zustand Store with persistence
// ============================================================

export const useCartStore = create<CartState>()(
  persist(
    immer((set, get) => ({
      // === Initial state ===
      ...initialState,

      // === Add item ===
      addItem: (product: Product, quantity: number = 1) => {
        set((state) => {
          const existingItem = state.items.find((item: CartItem) => item.product.id === product.id);
          
          if (existingItem) {
            existingItem.quantity += quantity;
          } else {
            state.items.push({ product, quantity });
          }

          // Recalculate totals
          const totals = calculateTotals(
            state.items,
            state.coupon,
            state.shippingMethod,
            state.giftWrap
          );
          
          state.subtotal = totals.subtotal;
          state.totalItems = totals.totalItems;
          state.shippingCost = totals.shippingCost;
          state.tax = totals.tax;
          state.discountAmount = totals.discountAmount;
          state.grandTotal = totals.grandTotal;
          state.totalPrice = totals.subtotal;
        });

        // Toast notification
        toast.success('Added to Cart', 'Your selected murti has been added successfully.');
      },

      // === Remove item ===
      removeItem: (productId: string) => {
        set((state) => {
          const item = state.items.find((i: CartItem) => i.product.id === productId);
          state.items = state.items.filter((item: CartItem) => item.product.id !== productId);

          // Recalculate totals
          const totals = calculateTotals(
            state.items,
            state.coupon,
            state.shippingMethod,
            state.giftWrap
          );
          
          state.subtotal = totals.subtotal;
          state.totalItems = totals.totalItems;
          state.shippingCost = totals.shippingCost;
          state.tax = totals.tax;
          state.discountAmount = totals.discountAmount;
          state.grandTotal = totals.grandTotal;
          state.totalPrice = totals.subtotal;
        });

        toast.success('Removed from Cart', 'Item removed successfully.');
      },

      // === Update quantity ===
      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => {
          const item = state.items.find((i: CartItem) => i.product.id === productId);
          if (item) {
            item.quantity = quantity;
          }

          // Recalculate totals
          const totals = calculateTotals(
            state.items,
            state.coupon,
            state.shippingMethod,
            state.giftWrap
          );
          
          state.subtotal = totals.subtotal;
          state.totalItems = totals.totalItems;
          state.shippingCost = totals.shippingCost;
          state.tax = totals.tax;
          state.discountAmount = totals.discountAmount;
          state.grandTotal = totals.grandTotal;
          state.totalPrice = totals.subtotal;
        });
      },

      // === Clear cart ===
      clearCart: () => {
        set((state) => {
          state.items = [];
          state.coupon = null;
          state.giftWrap = false;
          state.subtotal = 0;
          state.totalItems = 0;
          state.shippingCost = 0;
          state.tax = 0;
          state.discountAmount = 0;
          state.grandTotal = 0;
          state.totalPrice = 0;
        });
      },

      // === Apply coupon ===
      applyCoupon: async (code: string) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        const normalizedCode = code.trim().toUpperCase();
        const coupon = VALID_COUPONS[normalizedCode];

        if (!coupon) {
          toast.error('We couldn’t apply that offer.', 'Please check the coupon code and try again.');
          return false;
        }

        set((state) => {
          state.coupon = coupon;

          // Recalculate totals
          const totals = calculateTotals(
            state.items,
            state.coupon,
            state.shippingMethod,
            state.giftWrap
          );
          
          state.subtotal = totals.subtotal;
          state.totalItems = totals.totalItems;
          state.shippingCost = totals.shippingCost;
          state.tax = totals.tax;
          state.discountAmount = totals.discountAmount;
          state.grandTotal = totals.grandTotal;
          state.totalPrice = totals.subtotal;
        });

        toast.success('Offer applied', 'Your discount has been added successfully.');
        return true;
      },

      // === Remove coupon ===
      removeCoupon: () => {
        set((state) => {
          state.coupon = null;

          // Recalculate totals
          const totals = calculateTotals(
            state.items,
            state.coupon,
            state.shippingMethod,
            state.giftWrap
          );
          
          state.subtotal = totals.subtotal;
          state.totalItems = totals.totalItems;
          state.shippingCost = totals.shippingCost;
          state.tax = totals.tax;
          state.discountAmount = totals.discountAmount;
          state.grandTotal = totals.grandTotal;
          state.totalPrice = totals.subtotal;
        });

        toast.success('Offer removed', 'Your discount has been removed.');
      },

      // === Set shipping method ===
      setShippingMethod: (method: 'standard' | 'express') => {
        set((state) => {
          state.shippingMethod = method;

          // Recalculate totals
          const totals = calculateTotals(
            state.items,
            state.coupon,
            state.shippingMethod,
            state.giftWrap
          );
          
          state.subtotal = totals.subtotal;
          state.totalItems = totals.totalItems;
          state.shippingCost = totals.shippingCost;
          state.tax = totals.tax;
          state.discountAmount = totals.discountAmount;
          state.grandTotal = totals.grandTotal;
          state.totalPrice = totals.subtotal;
        });
      },

      // === Toggle gift wrap ===
      toggleGiftWrap: () => {
        set((state) => {
          state.giftWrap = !state.giftWrap;

          // Recalculate totals
          const totals = calculateTotals(
            state.items,
            state.coupon,
            state.shippingMethod,
            state.giftWrap
          );
          
          state.subtotal = totals.subtotal;
          state.totalItems = totals.totalItems;
          state.shippingCost = totals.shippingCost;
          state.tax = totals.tax;
          state.discountAmount = totals.discountAmount;
          state.grandTotal = totals.grandTotal;
          state.totalPrice = totals.subtotal;
        });

        toast.success(get().giftWrap ? 'Gift wrap added' : 'Gift wrap removed', get().giftWrap ? 'Your order will be wrapped beautifully.' : 'Gift wrap has been removed.');
      },

      // === Utility: Check if product is in cart ===
      isInCart: (productId: string) => {
        return get().items.some((item) => item.product.id === productId);
      },

      // === Utility: Get item quantity ===
      getItemQuantity: (productId: string) => {
        const item = get().items.find((i) => i.product.id === productId);
        return item?.quantity || 0;
      },

      // === Utility: Get item ===
      getItem: (productId: string) => {
        return get().items.find((i) => i.product.id === productId);
      },

      // === Prepare checkout data ===
      prepareCheckout: () => {
        const state = get();
        return {
          items: state.items,
          subtotal: state.subtotal,
          shippingCost: state.shippingCost,
          tax: state.tax,
          discountAmount: state.discountAmount,
          grandTotal: state.grandTotal,
          coupon: state.coupon,
          giftWrap: state.giftWrap,
          shippingMethod: state.shippingMethod,
        };
      },

      // === Reset store ===
      reset: () => {
        set(initialState);
      },
    })),
    {
      name: 'panditji-cart-storage', // Storage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        coupon: state.coupon,
        giftWrap: state.giftWrap,
        shippingMethod: state.shippingMethod,
      }),
      
    }
  )
);

// ============================================================
// Selectors (for use in components)
// ============================================================

/**
 * Selectors for cart state (to avoid re-renders)
 */
export const cartSelectors = {
  /** Get all cart items */
  selectItems: (state: CartState) => state.items,
  
  /** Get total number of items */
  selectTotalItems: (state: CartState) => state.totalItems,
  
  /** Get subtotal */
  selectSubtotal: (state: CartState) => state.subtotal,
  
  /** Get shipping cost */
  selectShippingCost: (state: CartState) => state.shippingCost,
  
  /** Get tax amount */
  selectTax: (state: CartState) => state.tax,
  
  /** Get discount amount */
  selectDiscountAmount: (state: CartState) => state.discountAmount,
  
  /** Get grand total */
  selectGrandTotal: (state: CartState) => state.grandTotal,
  
  /** Get applied coupon */
  selectCoupon: (state: CartState) => state.coupon,
  
  /** Get shipping method */
  selectShippingMethod: (state: CartState) => state.shippingMethod,
  
  /** Get gift wrap status */
  selectGiftWrap: (state: CartState) => state.giftWrap,
  
  /** Check if cart is empty */
  selectIsEmpty: (state: CartState) => state.items.length === 0,
  
  /** Get total unique items count */
  selectUniqueItemsCount: (state: CartState) => state.items.length,
};

// ============================================================
// Utility Functions
// ============================================================

/**
 * Open the cart drawer (works with CartDrawer component)
 */
export function openCartDrawer() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('openCartDrawer'));
  }
}

/**
 * Get a formatted summary of the cart (for sharing or logging)
 */
export function getCartSummary(state: CartState): string {
  const items = state.items
    .map((item) => `${item.product.name} x${item.quantity}`)
    .join(', ');
  
  return `🛒 ${state.items.length} items · ${state.subtotal.toLocaleString('en-IN')}`;
}

/**
 * Validate if cart can be checked out
 */
export function canCheckout(state: CartState): {
  valid: boolean;
  message?: string;
} {
  if (state.items.length === 0) {
    return { valid: false, message: 'Your cart is empty' };
  }
  
  const outOfStock = state.items.filter(
    (item) => !item.product.inStock || (item.product.stockQuantity !== undefined && item.quantity > item.product.stockQuantity)
  );
  
  if (outOfStock.length > 0) {
    const names = outOfStock.map((i) => i.product.name).join(', ');
    return { valid: false, message: `Some items are out of stock: ${names}` };
  }
  
  return { valid: true };
}

// ============================================================
// Default export
// ============================================================
export default useCartStore;