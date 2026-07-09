// frontend/src/app/checkout/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Truck,
  CreditCard,
  Wallet,
  Building,
  MapPin,
  Phone,
  Mail,
  User,
  Home,
  Lock,
  Clock,
} from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

import { useCart } from '@/features/cart/hooks/useCart';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { formatPrice } from '@/lib/utils';
import { get, post } from '@/services/apiClient';

// ============================================================
// Types and Validation Schemas
// ============================================================

// Address schema
const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number is required'),
  addressLine1: z.string().min(5, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().min(6, 'Valid pincode is required'),
  country: z.string().default('India'),
});

// Shipping schema
const shippingSchema = z.object({
  shippingMethod: z.enum(['standard', 'express'], {
    error: 'Please select a shipping method',
  }),
});

// Payment schema
const paymentSchema = z.object({
  paymentMethod: z.string().min(1, 'Please select a payment method'),
  // Card fields (conditional)
  cardNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  cvv: z.string().optional(),
  nameOnCard: z.string().optional(),
  // UPI
  upiId: z.string().optional(),
});

// Combined checkout form schema
const checkoutSchema = z.object({
  address: addressSchema,
  shipping: shippingSchema,
  payment: paymentSchema,
});

type CheckoutFormInput = z.input<typeof checkoutSchema>;
type CheckoutFormData = z.output<typeof checkoutSchema>;

declare global {
  interface Window {
    Razorpay: any;
  }
}

// ============================================================
// Checkout Page
// ============================================================
export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal: totalPrice, clearCart, coupon, giftWrap, setShippingMethod, discountAmount } = useCart();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [settings, setSettings] = useState<any>(null);

  const totalSteps = ['Address', 'Shipping', 'Payment', 'Confirm'];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isValid },
    trigger,
  } = useForm<CheckoutFormInput, unknown, CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      address: {
        fullName: user?.name || '',
        email: user?.email || '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
      },
      shipping: {
        shippingMethod: 'standard',
      },
      payment: {
        paymentMethod: 'cod',
      },
    },
  });

  // Watch payment method to conditionally show fields
  const paymentMethod = watch('payment.paymentMethod');
  const selectedShippingMethod = watch('shipping.shippingMethod');

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

  useEffect(() => {
    setShippingMethod(selectedShippingMethod as 'standard' | 'express');
  }, [selectedShippingMethod, setShippingMethod]);

  useEffect(() => {
    if (!settings) return;
    const isEnabled = (method: string) => {
      if (settings.paymentMethods?.[method] !== undefined) return settings.paymentMethods[method];
      if (method === 'cod') return settings.codEnabled ?? true;
      if (method === 'card') return settings.cardEnabled ?? true;
      if (method === 'upi') return settings.upiEnabled ?? true;
      if (method === 'wallet') return settings.walletEnabled ?? true;
      if (method === 'netBanking') return settings.netBankingEnabled ?? true;
      return true;
    };

    if (paymentMethod && !isEnabled(paymentMethod)) {
      const enabledMethod = ['cod', 'card', 'upi', 'wallet', 'netBanking'].find((method) => isEnabled(method));
      setValue('payment.paymentMethod', enabledMethod || 'cod');
    }
  }, [paymentMethod, setValue, settings]);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      router.push('/products');
    }
  }, [items, router]);

  // Step validation and navigation
  const goToStep = (step: number) => {
    const stepKeys = ['address', 'shipping', 'payment'] as const;
    if (step > currentStep) {
      // Validate current step before proceeding
      trigger(stepKeys[currentStep]).then((isValid) => {
        if (isValid) {
          setCurrentStep(step);
        } else {
          toast.error('Please fill in all required fields');
        }
      });
    } else {
      setCurrentStep(step);
    }
  };

  const nextStep = () => {
    const stepKeys = ['address', 'shipping', 'payment'] as const;
    trigger(stepKeys[currentStep]).then((isValid) => {
      if (isValid) {
        if (currentStep < totalSteps.length - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          // Last step → place order
          placeOrder();
        }
      } else {
        toast.error('Please fill in all required fields');
      }
    });
  };

  const loadRazorpayScript = () => {
    return new Promise<void>((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Window is not available'));
        return;
      }

      if (window.Razorpay) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Unable to load Razorpay'));
      document.body.appendChild(script);
    });
  };

  // Place order
  const placeOrder = async () => {
    setIsSubmitting(true);
    try {
      const formValues = getValues();
      const shippingAddress = {
        ...formValues.address,
        phone: formValues.address.phone,
        country: formValues.address.country || 'India',
      };

      const checkoutPayload = {
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        shippingAddress,
        billingAddress: shippingAddress,
        paymentMethod: formValues.payment.paymentMethod,
        couponCode: coupon?.code,
        giftWrap,
        shippingMethod: formValues.shipping.shippingMethod,
        notes: `Checkout via ${formValues.payment.paymentMethod}`,
      };

      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!keyId) {
        throw new Error('Razorpay is not configured on the frontend.');
      }

      const paymentAmount = formValues.payment.paymentMethod === 'cod'
        ? Math.round(grandTotal * ((settings?.advancePaymentPercentage ?? settings?.advancePaymentPercent ?? 25) / 100))
        : grandTotal;

      const paymentOrderResponse = await post<{ success: boolean; data?: { id?: string; amount?: number; currency?: string } }>('/payment/create-order', {
        amount: paymentAmount,
        currency: 'INR',
        receipt: `order_${Date.now()}`,
        notes: {
          paymentMethod: formValues.payment.paymentMethod,
          shippingMethod: formValues.shipping.shippingMethod,
        },
      });

      const razorpayOrder = (paymentOrderResponse as any)?.data || paymentOrderResponse;
      await loadRazorpayScript();

      const options = {
        key: keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        order_id: razorpayOrder.id,
        name: 'Panditji Marble',
        description: 'Order payment',
        prefill: {
          name: formValues.address.fullName,
          email: formValues.address.email,
          contact: formValues.address.phone,
        },
        theme: {
          color: '#b8860b',
        },
        handler: async (response: any) => {
          try {
            const verifyResponse = await post<{ success: boolean; data?: { orderNumber?: string; _id?: string }; message?: string }>('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              checkoutPayload,
            });
            const createdOrder = (verifyResponse as any)?.data || verifyResponse;
            setOrderId(createdOrder?.orderNumber || createdOrder?._id || 'PJM');
            setOrderComplete(true);
            clearCart();
            toast.success('Payment successful! Order placed. 🙏');
          } catch (error: any) {
            toast.error(error?.message || 'Payment verification failed.');
          } finally {
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
            toast.error('Payment was cancelled.');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || 'Failed to place order. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Calculate order totals
  const freeShippingThreshold = settings?.freeShippingThreshold ?? 5000;
  const standardShippingCost = settings?.shipping?.standard ?? settings?.standardShippingCost ?? 500;
  const expressShippingCost = settings?.shipping?.express ?? settings?.expressShippingCost ?? 1200;
  const shippingCost = totalPrice > freeShippingThreshold
    ? 0
    : selectedShippingMethod === 'express'
    ? expressShippingCost
    : standardShippingCost;
  const gstPercentage = settings?.gstPercentage ?? settings?.taxRate ?? 18;
  const tax = Math.round(totalPrice * (Number(gstPercentage) / 100));
  const discount = discountAmount || 0;
  const grandTotal = totalPrice + shippingCost + tax + (giftWrap ? (settings?.giftWrapCharge ?? 99) : 0) - discount;
  const advancePercent = settings?.advancePaymentPercentage ?? settings?.advancePaymentPercent ?? 25;
  const advanceAmount = Math.round(grandTotal * (Number(advancePercent) / 100));
  const availablePaymentMethods = [
    { value: 'cod', label: 'Cash on Delivery (COD)', description: 'Pay a secure advance online and settle the balance on delivery.', icon: Wallet },
    { value: 'card', label: 'Credit / Debit Card', description: 'Secure payment via card.', icon: CreditCard },
    { value: 'upi', label: 'UPI', description: 'Pay using Google Pay, PhonePe, Paytm, or any UPI app.', icon: Building },
    { value: 'wallet', label: 'Wallet', description: 'Use a digital wallet for quick checkout.', icon: Wallet },
    { value: 'netBanking', label: 'Net Banking', description: 'Complete payment through your bank.', icon: Building },
  ].filter((method) => {
    if (settings?.paymentMethods?.[method.value] !== undefined) return settings.paymentMethods[method.value];
    if (method.value === 'cod') return settings?.codEnabled ?? true;
    if (method.value === 'card') return settings?.cardEnabled ?? true;
    if (method.value === 'upi') return settings?.upiEnabled ?? true;
    if (method.value === 'wallet') return settings?.walletEnabled ?? true;
    if (method.value === 'netBanking') return settings?.netBankingEnabled ?? true;
    return true;
  });

  // If cart is empty, don't render
  if (items.length === 0) {
    return null;
  }

  // ============================================================
  // SUCCESS VIEW
  // ============================================================
  if (orderComplete) {
    return (
      <Container className="py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-gold/10 text-center"
        >
          <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
            <Check className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="font-cinzel text-3xl font-bold text-brown">Order Confirmed!</h1>
          <p className="text-brown-light mt-2">
            Thank you for your order. Your divine murti will be crafted with love and devotion.
          </p>
          <div className="bg-sand/30 rounded-xl p-4 my-6">
            <p className="text-sm text-brown-light">Order ID</p>
            <p className="font-cinzel text-xl font-bold text-gold-dark">{orderId}</p>
          </div>
          <p className="text-sm text-brown-light/70">
            We&apos;ll send you a confirmation email with tracking details shortly.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mt-8">
            <Link href="/orders" className="btn-gold">
              View My Orders
            </Link>
            <Link href="/" className="btn-outline-gold">
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </Container>
    );
  }

  // ============================================================
  // CHECKOUT STEPS
  // ============================================================
  return (
    <Container className="py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-8">
            {totalSteps.map((label, index) => (
              <div key={label} className="flex items-center flex-1">
                <button
                  onClick={() => goToStep(index)}
                  className={`flex items-center gap-2 ${
                    index <= currentStep ? 'text-brown' : 'text-brown-light/50'
                  }`}
                  disabled={index > currentStep}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      index < currentStep
                        ? 'bg-gold text-white'
                        : index === currentStep
                        ? 'bg-gold text-white ring-4 ring-gold/20'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">
                    {label}
                  </span>
                </button>
                {index < totalSteps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      index < currentStep ? 'bg-gold' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Step 0: Address */}
            {currentStep === 0 && (
              <motion.div
                key="address"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gold/5"
              >
                <h2 className="font-cinzel text-xl font-bold text-brown mb-6">
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-brown mb-1">
                        Full Name *
                      </label>
                      <Input
                        placeholder="Your full name"
                        {...register('address.fullName')}
                        className={errors.address?.fullName ? 'border-red-400' : ''}
                      />
                      {errors.address?.fullName && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.address.fullName.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brown mb-1">
                        Email *
                      </label>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        {...register('address.email')}
                        className={errors.address?.email ? 'border-red-400' : ''}
                      />
                      {errors.address?.email && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.address.email.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brown mb-1">
                      Phone *
                    </label>
                    <Input
                      placeholder="+91 72403 64772"
                      {...register('address.phone')}
                      className={errors.address?.phone ? 'border-red-400' : ''}
                    />
                    {errors.address?.phone && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.address.phone.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brown mb-1">
                      Address Line 1 *
                    </label>
                    <Input
                      placeholder="Street address, building, etc."
                      {...register('address.addressLine1')}
                      className={errors.address?.addressLine1 ? 'border-red-400' : ''}
                    />
                    {errors.address?.addressLine1 && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.address.addressLine1.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brown mb-1">
                      Address Line 2 (optional)
                    </label>
                    <Input
                      placeholder="Apartment, suite, etc."
                      {...register('address.addressLine2')}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-brown mb-1">
                        City *
                      </label>
                      <Input
                        placeholder="City"
                        {...register('address.city')}
                        className={errors.address?.city ? 'border-red-400' : ''}
                      />
                      {errors.address?.city && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.address.city.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brown mb-1">
                        State *
                      </label>
                      <Input
                        placeholder="State"
                        {...register('address.state')}
                        className={errors.address?.state ? 'border-red-400' : ''}
                      />
                      {errors.address?.state && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.address.state.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-brown mb-1">
                        Pincode *
                      </label>
                      <Input
                        placeholder="123456"
                        {...register('address.pincode')}
                        className={errors.address?.pincode ? 'border-red-400' : ''}
                      />
                      {errors.address?.pincode && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.address.pincode.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brown mb-1">
                        Country *
                      </label>
                      <Input
                        placeholder="India"
                        {...register('address.country')}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 1: Shipping */}
            {currentStep === 1 && (
              <motion.div
                key="shipping"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gold/5"
              >
                <h2 className="font-cinzel text-xl font-bold text-brown mb-6">
                  Shipping Method
                </h2>
                <div className="space-y-4">
                  <label className="flex items-center gap-4 p-4 border rounded-xl cursor-pointer hover:bg-sand/20 transition-colors has-[:checked]:border-gold has-[:checked]:bg-gold/5">
                    <input
                      type="radio"
                      value="standard"
                      {...register('shipping.shippingMethod')}
                      className="w-4 h-4 text-gold"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Truck className="w-5 h-5 text-brown-light" />
                        <span className="font-medium">Standard Shipping</span>
                      </div>
                      <p className="text-sm text-brown-light/70">Delivery in 5-7 business days</p>
                    </div>
                    <span className="font-cinzel text-gold-dark">299</span>
                  </label>

                  <label className="flex items-center gap-4 p-4 border rounded-xl cursor-pointer hover:bg-sand/20 transition-colors has-[:checked]:border-gold has-[:checked]:bg-gold/5">
                    <input
                      type="radio"
                      value="express"
                      {...register('shipping.shippingMethod')}
                      className="w-4 h-4 text-gold"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-brown-light" />
                        <span className="font-medium">Express Shipping</span>
                      </div>
                      <p className="text-sm text-brown-light/70">Delivery in 2-3 business days</p>
                    </div>
                    <span className="font-cinzel text-gold-dark">{shippingCost}</span>
                  </label>
                  {errors.shipping?.shippingMethod && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.shipping.shippingMethod.message}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gold/5"
              >
                <h2 className="font-cinzel text-xl font-bold text-brown mb-6">
                  Payment Method
                </h2>
                <div className="space-y-4">
                  {availablePaymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <label key={method.value} className="flex items-center gap-4 p-4 border rounded-xl cursor-pointer hover:bg-sand/20 transition-colors has-[:checked]:border-gold has-[:checked]:bg-gold/5">
                        <input
                          type="radio"
                          value={method.value}
                          {...register('payment.paymentMethod')}
                          className="w-4 h-4 text-gold"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Icon className="w-5 h-5 text-brown-light" />
                            <span className="font-medium">{method.label}</span>
                          </div>
                          <p className="text-sm text-brown-light/70">{method.description}</p>
                        </div>
                      </label>
                    );
                  })}

                  {errors.payment?.paymentMethod && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.payment.paymentMethod.message}
                    </p>
                  )}

                  {paymentMethod === 'cod' && (
                    <div className="rounded-xl border border-gold/20 bg-gold/5 p-4 text-sm text-brown-light">
                      <p className="font-medium text-brown">COD advance payment</p>
                      <p className="mt-1">
                        A secure advance of {formatPrice(advanceAmount)} ({advancePercent}%) is collected online for this order. The remaining balance will be paid on delivery.
                      </p>
                    </div>
                  )}

                  {/* Conditional payment fields */}
                  {paymentMethod === 'card' && (
                    <div className="mt-4 p-4 bg-sand/30 rounded-xl space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-brown mb-1">
                          Card Number
                        </label>
                        <Input
                          placeholder="1234 5678 9012 3456"
                          {...register('payment.cardNumber')}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-brown mb-1">
                            Expiry Date
                          </label>
                          <Input
                            placeholder="MM/YY"
                            {...register('payment.expiryDate')}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-brown mb-1">
                            CVV
                          </label>
                          <Input
                            placeholder="123"
                            {...register('payment.cvv')}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brown mb-1">
                          Name on Card
                        </label>
                        <Input
                          placeholder="Name as on card"
                          {...register('payment.nameOnCard')}
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'upi' && (
                    <div className="mt-4 p-4 bg-sand/30 rounded-xl">
                      <label className="block text-sm font-medium text-brown mb-1">
                        UPI ID
                      </label>
                      <Input
                        placeholder="your@upi"
                        {...register('payment.upiId')}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              className={`inline-flex items-center gap-2 text-brown-light hover:text-brown transition-colors ${
                currentStep === 0 ? 'invisible' : ''
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={nextStep}
              disabled={isSubmitting}
              className="btn-gold px-6 py-2.5 text-sm flex items-center gap-2"
            >
              {currentStep === totalSteps.length - 1 ? (
                isSubmitting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Place Order'
                )
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gold/5 sticky top-24">
            <h2 className="font-cinzel text-xl font-bold text-brown mb-6">
              Order Summary
            </h2>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-3 items-center">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-sand flex-shrink-0">
                    <Image
                      src={item.product.images[0] || '/placeholder.png'}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-brown-light/70">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-cinzel text-sm text-gold-dark">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gold/10 my-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-brown-light">Subtotal</span>
                <span className="font-medium">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brown-light">Shipping</span>
                <span className="font-medium">{formatPrice(shippingCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brown-light">Tax (GST {gstPercentage}%)</span>
                <span className="font-medium">{formatPrice(tax)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-brown-light">Discount</span>
                  <span className="font-medium text-green-600">- {formatPrice(discount)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-gold/10 pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span className="font-cinzel text-brown">Total</span>
                <span className="font-cinzel text-gold-dark">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}