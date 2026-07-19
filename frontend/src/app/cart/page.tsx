// frontend/src/app/cart/page.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/notifications';
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ChevronRight,
  Ticket,
  X,
  Gift,
  Truck,
  Shield,
} from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';

import { useCart } from '@/features/cart/hooks/useCart';
import { formatPrice } from '@/lib/utils';
import { get } from '@/services/apiClient';

// ============================================================
// Cart Page
// ============================================================
export default function CartPage() {
  const router = useRouter();
  const {
    items,
    totalItems,
    subtotal: totalPrice,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response: any = await get('/settings');
        setSettings(response?.data || response);
      } catch (error) {
        console.error('Failed to load checkout settings', error);
      }
    };

    fetchSettings();
  }, []);

  const standardShippingCost = settings?.shipping?.standard ?? settings?.standardShippingCost ?? 500;
  const expressShippingCost = settings?.shipping?.express ?? settings?.expressShippingCost ?? 1200;
  const freeShippingThreshold = settings?.freeShippingThreshold ?? 5000;
  const gstPercentage = settings?.gstPercentage ?? settings?.taxRate ?? 18;
  const shipping = totalPrice > freeShippingThreshold ? 0 : standardShippingCost;
  const tax = Math.round(totalPrice * (Number(gstPercentage) / 100));
  const discount = appliedCoupon
    ? Math.round(totalPrice * (appliedCoupon.discount / 100))
    : 0;
  const grandTotal = totalPrice + shipping + tax - discount;

  // Apply coupon handler
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code.', 'We’ll apply it as soon as you’re ready.');
      return;
    }

    setIsApplyingCoupon(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock coupon validation (you'd check against your backend)
    if (couponCode.toUpperCase() === 'DIVINE10') {
      setAppliedCoupon({ code: couponCode.toUpperCase(), discount: 10 });
      toast.success('Offer applied', 'Your discount has been added successfully.');
      setCouponCode('');
    } else if (couponCode.toUpperCase() === 'WELCOME20') {
      setAppliedCoupon({ code: couponCode.toUpperCase(), discount: 20 });
      toast.success('Offer applied', 'Your discount has been added successfully.');
      setCouponCode('');
    } else {
      toast.error('We couldn’t apply that offer.', 'Please check the coupon code and try again.');
    }
    setIsApplyingCoupon(false);
  };

  // Remove coupon
  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast.success('Offer removed', 'Your discount has been removed.');
  };

  // Checkout handler
  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty.', 'Please add a few items before continuing.');
      return;
    }
    router.push('/checkout');
  };

  // Loading state (while cart is being hydrated from store)
  if (isLoading) {
    return <CartSkeleton />;
  }

  // Empty cart state
  if (items.length === 0) {
    return (
      <Container className="py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto"
        >
          <div className="w-24 h-24 mx-auto bg-gold/10 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-12 h-12 text-gold" />
          </div>
          <h1 className="font-cinzel text-2xl md:text-3xl font-bold text-brown">
            Your Cart is Empty
          </h1>
          <p className="text-brown-light mt-2">
            Looks like you haven&apos;t added any divine murtis yet.
          </p>
          <Link href="/products" className="btn-gold inline-block mt-6">
            Browse Collection
          </Link>
        </motion.div>
      </Container>
    );
  }

  return (
    <Container className="py-8 md:py-12">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3">
          <h1 className="font-cinzel text-2xl md:text-3xl font-bold text-brown">
            Your Cart
          </h1>
          <span className="text-sm text-brown-light bg-sand/60 px-3 py-1 rounded-full">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </span>
        </div>
        <p className="text-brown-light text-sm mt-1">
          Review your selection and proceed to checkout.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="popLayout">
            {items.map((item, index) => (
              <motion.div
                key={item.product.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gold/5 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="relative w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden bg-sand flex-shrink-0"
                  >
                    <Image
                      src={item.product.images[0] || '/placeholder.png'}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 96px, 112px"
                    />
                    {item.product.discount && (
                      <span className="absolute top-1 left-1 bg-maroon text-white text-xs font-bold px-1.5 py-0.5 rounded">
                        -{item.product.discount}%
                      </span>
                    )}
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="font-cinzel font-semibold text-brown hover:text-gold-dark transition-colors line-clamp-1"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-brown-light/70">
                      {item.product.material || 'Handcrafted'}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="font-cinzel text-lg text-gold-dark">
                        {formatPrice(item.product.price)}
                      </span>
                      {item.product.originalPrice && (
                        <span className="text-xs text-brown-light line-through">
                          {formatPrice(item.product.originalPrice)}
                        </span>
                      )}
                    </div>

                    {/* Quantity and Remove */}
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border border-gold/20 rounded-full overflow-hidden">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          className="px-3 py-1.5 hover:bg-gold/10 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          className="px-3 py-1.5 hover:bg-gold/10 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-brown-light hover:text-red-500 transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal (desktop) */}
                  <div className="hidden md:flex flex-col items-end justify-between">
                    <span className="font-cinzel text-sm font-medium text-brown">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Continue shopping */}
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm text-brown-light hover:text-gold-dark transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>

        {/* Right: Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gold/5 sticky top-24">
            <h2 className="font-cinzel text-xl font-bold text-brown mb-6">
              Order Summary
            </h2>

            {/* Coupon Section */}
            <div className="mb-6">
              <div className="flex gap-2">
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
                <div className="mt-2 flex items-center justify-between bg-green-50/70 rounded-lg px-3 py-1.5 border border-green-200">
                  <span className="text-sm text-green-700">
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
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-brown-light">Subtotal</span>
                <span className="font-medium text-brown">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-brown-light">Shipping</span>
                <span className="font-medium text-brown">
                  {shipping === 0 ? 'Free' : `${formatPrice(shipping)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-brown-light">Tax (GST 18%)</span>
                <span className="font-medium text-brown">
                  {formatPrice(tax)}
                </span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({appliedCoupon.discount}%)</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-gold/10 my-4 pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span className="font-cinzel text-brown">Total</span>
                <span className="font-cinzel text-gold-dark">
                  {formatPrice(grandTotal)}
                </span>
              </div>
              <p className="text-xs text-brown-light/70 mt-1">
                Inclusive of all taxes
              </p>
            </div>

            {/* Checkout Button */}
            <Button
              onClick={handleCheckout}
              className="btn-gold w-full py-3.5 text-base"
            >
              Proceed to Checkout
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>

            {/* Trust badges */}
            <div className="mt-6 grid grid-cols-2 gap-2 text-xs text-brown-light/60">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-gold" />
                <span>Secure Checkout</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-gold" />
                <span>Free Shipping over 5,000</span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2">
                <Gift className="w-3.5 h-3.5 text-gold" />
                <span>Each murti comes with a blessing certificate</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Container>
  );
}

// ============================================================
// SKELETON LOADER
// ============================================================
function CartSkeleton() {
  return (
    <Container className="py-12 md:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gold/5">
              <div className="flex gap-4">
                <Skeleton className="w-24 h-24 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-6 w-1/4" />
                  <div className="flex gap-3">
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gold/5">
            <Skeleton className="h-6 w-1/2 mb-6" />
            <div className="space-y-3">
              <Skeleton className="h-10 w-full rounded-full" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
              </div>
              <Skeleton className="h-8 w-3/4 mx-auto mt-4" />
              <Skeleton className="h-12 w-full rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}