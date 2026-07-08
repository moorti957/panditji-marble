// frontend/src/components/modals/CartDrawer.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { X, Minus, Plus, Trash2, ShoppingBag, Ticket, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { useCartStore } from '@/features/cart/store/cartStore';
import { formatPrice, cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GlassCard } from '@/components/ui/GlassCard';

// ============================================================
// CartDrawer Component
// ============================================================
export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const {
    items,
    totalItems,
    totalPrice,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCartStore();

  // Subscribe to cart open/close state (if you have a global store for drawer)
  // For now we'll use a simple local state, but you can integrate with Zustand

  // Open/close methods (exposed via store or context)
  // We'll add a global cart drawer store later, but for now we'll use a simple approach
  // with a function to open the drawer from anywhere.
  // We'll also add a useEffect to listen for custom events.

  // For this implementation, we'll use a simple state and expose functions.
  // You can replace with a dedicated store.

  // Listen for custom event to open drawer
  useEffect(() => {
    const handleOpenCart = () => setIsOpen(true);
    window.addEventListener('openCartDrawer', handleOpenCart);
    return () => window.removeEventListener('openCartDrawer', handleOpenCart);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Handle coupon apply (mock)
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    setIsApplyingCoupon(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Mock validation
    if (couponCode.toUpperCase() === 'DIVINE10') {
      setAppliedCoupon({ code: couponCode.toUpperCase(), discount: 10 });
      toast.success('Coupon applied! 10% discount ✨');
      setCouponCode('');
    } else if (couponCode.toUpperCase() === 'WELCOME20') {
      setAppliedCoupon({ code: couponCode.toUpperCase(), discount: 20 });
      toast.success('Coupon applied! 20% discount 🙏');
      setCouponCode('');
    } else {
      toast.error('Invalid coupon code');
    }
    setIsApplyingCoupon(false);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast.success('Coupon removed');
  };

  // Calculate totals
  const subtotal = totalPrice;
  const shipping = subtotal > 5000 ? 0 : 299;
  const tax = Math.round(subtotal * 0.18);
  const discount = appliedCoupon ? Math.round(subtotal * (appliedCoupon.discount / 100)) : 0;
  const grandTotal = subtotal + shipping + tax - discount;

  // Overlay and drawer variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const drawerVariants = {
    hidden: { x: '100%' },
    visible: { x: 0 },
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={drawerRef}
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 z-50 w-full max-w-md h-full bg-white dark:bg-brown-dark shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gold/10 dark:border-gold/5 shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-gold-dark" />
                <h2 className="font-cinzel text-lg font-bold text-brown dark:text-ivory">
                  Your Cart
                </h2>
                <span className="text-xs text-brown-light dark:text-ivory/50 bg-sand/60 dark:bg-brown/60 px-2 py-0.5 rounded-full">
                  {totalItems} items
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-gold/10 transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5 text-brown-light dark:text-ivory/70" />
              </button>
            </div>

            {/* Cart Items (scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag className="w-10 h-10 text-gold/40" />
                  </div>
                  <h3 className="font-cinzel text-lg text-brown dark:text-ivory">
                    Your cart is empty
                  </h3>
                  <p className="text-sm text-brown-light dark:text-ivory/50 mt-2">
                    Start adding some divine murtis!
                  </p>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="btn-gold mt-4 text-sm px-6 py-2"
                  >
                    Browse Collection
                  </button>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      transition={{ duration: 0.2 }}
                      className="flex gap-3 bg-sand/30 dark:bg-brown/30 rounded-xl p-3 border border-gold/5"
                    >
                      {/* Image */}
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="relative w-16 h-16 rounded-lg overflow-hidden bg-sand dark:bg-brown flex-shrink-0"
                        onClick={() => setIsOpen(false)}
                      >
                        <Image
                          src={item.product.images[0] || '/placeholder.png'}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="font-medium text-sm text-brown dark:text-ivory hover:text-gold-dark transition-colors line-clamp-1"
                          onClick={() => setIsOpen(false)}
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-xs text-brown-light dark:text-ivory/50">
                          {item.product.material || 'Handcrafted'}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-cinzel text-sm text-gold-dark dark:text-gold">
                            {formatPrice(item.product.price)}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity - 1)
                              }
                              className="p-0.5 rounded-full hover:bg-gold/10 transition-colors"
                              aria-label="Decrease"
                            >
                              <Minus className="w-3 h-3 text-brown-light" />
                            </button>
                            <span className="w-6 text-center text-xs font-medium text-brown dark:text-ivory">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity + 1)
                              }
                              className="p-0.5 rounded-full hover:bg-gold/10 transition-colors"
                              aria-label="Increase"
                            >
                              <Plus className="w-3 h-3 text-brown-light" />
                            </button>
                            <button
                              onClick={() => removeItem(item.product.id)}
                              className="p-1 ml-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              aria-label="Remove"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-brown-light hover:text-red-500 transition-colors" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer (summary + checkout) */}
            {items.length > 0 && (
              <div className="border-t border-gold/10 dark:border-gold/5 p-4 bg-white dark:bg-brown-dark shrink-0">
                {/* Coupon */}
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-light" />
                    <Input
                      type="text"
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      disabled={!!appliedCoupon}
                      className="pl-9 pr-4 py-2 text-sm border-gold/10 rounded-full"
                    />
                  </div>
                  <Button
                    onClick={handleApplyCoupon}
                    disabled={!!appliedCoupon || isApplyingCoupon}
                    className="btn-gold px-4 py-2 text-sm whitespace-nowrap"
                  >
                    {isApplyingCoupon ? 'Applying...' : 'Apply'}
                  </Button>
                </div>

                {appliedCoupon && (
                  <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-1.5 mb-3 border border-green-200 dark:border-green-800">
                    <span className="text-sm text-green-700 dark:text-green-400">
                      Coupon {appliedCoupon.code} applied
                      <span className="text-xs ml-1">(-{appliedCoupon.discount}%)</span>
                    </span>
                    <button
                      onClick={removeCoupon}
                      className="text-green-700/60 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Totals */}
                <div className="space-y-2 text-sm mb-3">
                  <div className="flex justify-between">
                    <span className="text-brown-light dark:text-ivory/60">Subtotal</span>
                    <span className="font-medium text-brown dark:text-ivory">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brown-light dark:text-ivory/60">Shipping</span>
                    <span className="font-medium text-brown dark:text-ivory">
                      {shipping === 0 ? 'Shipping included' : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brown-light dark:text-ivory/60">Tax (GST 18%)</span>
                    <span className="font-medium text-brown dark:text-ivory">
                      {formatPrice(tax)}
                    </span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Discount ({appliedCoupon.discount}%)</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gold/10 dark:border-gold/5 pt-3 mb-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="font-cinzel text-brown dark:text-ivory">Total</span>
                    <span className="font-cinzel text-gold-dark dark:text-gold">
                      {formatPrice(grandTotal)}
                    </span>
                  </div>
                  <p className="text-xs text-brown-light/50 dark:text-ivory/30 mt-1 text-right">
                    Inclusive of all taxes
                  </p>
                </div>

                <div className="flex gap-3">
                  <Link
                    href="/cart"
                    className="flex-1 btn-outline-gold text-center py-2.5 text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    View Cart
                  </Link>
                  <Link
                    href="/checkout"
                    className="flex-1 btn-gold text-center py-2.5 text-sm flex items-center justify-center gap-1"
                    onClick={() => setIsOpen(false)}
                  >
                    Checkout
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================
// Helper: Open cart drawer from anywhere
// ============================================================
export function openCartDrawer() {
  window.dispatchEvent(new Event('openCartDrawer'));
}

// ============================================================
// Default export
// ============================================================
export { CartDrawer };