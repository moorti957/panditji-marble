// frontend/src/app/track-order/page.tsx

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import  Container  from '../../components/ui/Container';
import  GlassCard  from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  MapPin,
  Calendar,
  ChevronRight,
  Search,
  Mail,
  Phone,
} from 'lucide-react';

// ============================================================
// Types
// ============================================================
interface OrderStatus {
  id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  description: string;
}

interface OrderDetails {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  estimatedDelivery: string;
  shippingAddress: string;
  trackingNumber?: string;
  carrier?: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  timeline: OrderStatus[];
}

// ============================================================
// Mock Order Data (replace with API call)
// ============================================================
const mockOrders: Record<string, OrderDetails> = {
  'PJM2025123': {
    orderId: 'PJM2025123',
    customerName: 'Devotee Sharma',
    customerEmail: 'devotee@example.com',
    customerPhone: '+91 72403 64772',
    status: 'shipped',
    orderDate: '2025-12-15',
    estimatedDelivery: '2025-12-22',
    shippingAddress: '123, Murti Marg, govindgarh, Rajasthan 302001, India',
    trackingNumber: 'TRK123456789',
    carrier: 'DTDC Express',
    items: [
      { name: 'Ganesh Murti (Brass, 12 inch)', quantity: 1, price: 2499 },
      { name: 'Shivling (Marble, 8 inch)', quantity: 1, price: 1999 },
    ],
    total: 4498,
    timeline: [
      {
        id: '1',
        status: 'pending',
        date: '2025-12-15 10:30 AM',
        description: 'Order placed successfully',
      },
      {
        id: '2',
        status: 'processing',
        date: '2025-12-16 02:15 PM',
        description: 'Order confirmed and being processed',
      },
      {
        id: '3',
        status: 'shipped',
        date: '2025-12-18 09:45 AM',
        description: 'Order shipped via DTDC Express',
      },
      {
        id: '4',
        status: 'delivered',
        date: 'Pending',
        description: 'Awaiting delivery',
      },
    ],
  },
  'PJM2025120': {
    orderId: 'PJM2025120',
    customerName: 'Radhika Krishna',
    customerEmail: 'radhika@example.com',
    customerPhone: '+91 98765 43211',
    status: 'delivered',
    orderDate: '2025-12-10',
    estimatedDelivery: '2025-12-17',
    shippingAddress: '456, Temple Road, govindgarh, Rajasthan 302002, India',
    trackingNumber: 'TRK987654321',
    carrier: 'Blue Dart',
    items: [
      { name: 'Radha Krishna Murti (Marble, 18 inch)', quantity: 1, price: 5499 },
    ],
    total: 5499,
    timeline: [
      {
        id: '1',
        status: 'pending',
        date: '2025-12-10 09:15 AM',
        description: 'Order placed successfully',
      },
      {
        id: '2',
        status: 'processing',
        date: '2025-12-11 11:30 AM',
        description: 'Order confirmed and being processed',
      },
      {
        id: '3',
        status: 'shipped',
        date: '2025-12-13 04:20 PM',
        description: 'Order shipped via Blue Dart',
      },
      {
        id: '4',
        status: 'delivered',
        date: '2025-12-15 02:10 PM',
        description: 'Delivered successfully',
      },
    ],
  },
  'PJM2025118': {
    orderId: 'PJM2025118',
    customerName: 'Shiv Bhakta',
    customerEmail: 'shiv@example.com',
    customerPhone: '+91 98765 43212',
    status: 'cancelled',
    orderDate: '2025-11-28',
    estimatedDelivery: 'N/A',
    shippingAddress: '789, Temple Street, govindgarh, Rajasthan 302003, India',
    trackingNumber: undefined,
    carrier: undefined,
    items: [
      { name: 'Shivling (Stone, 6 inch)', quantity: 1, price: 1499 },
    ],
    total: 1499,
    timeline: [
      {
        id: '1',
        status: 'pending',
        date: '2025-11-28 03:45 PM',
        description: 'Order placed successfully',
      },
      {
        id: '2',
        status: 'processing',
        date: '2025-11-29 10:00 AM',
        description: 'Order confirmed and being processed',
      },
      {
        id: '3',
        status: 'cancelled',
        date: '2025-11-30 11:20 AM',
        description: 'Order cancelled by customer',
      },
    ],
  },
};

// ============================================================
// Status Badge Component
// ============================================================
function StatusBadge({ status }: { status: OrderDetails['status'] }) {
  const statusConfig = {
    pending: {
      label: 'Pending',
      icon: Clock,
      className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
    processing: {
      label: 'Processing',
      icon: Package,
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    },
    shipped: {
      label: 'Shipped',
      icon: Truck,
      className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    },
    delivered: {
      label: 'Delivered',
      icon: CheckCircle,
      className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    },
    cancelled: {
      label: 'Cancelled',
      icon: XCircle,
      className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}

// ============================================================
// Timeline Component
// ============================================================
function OrderTimeline({ timeline }: { timeline: OrderStatus[] }) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gold/20 dark:bg-gold/10" />

      <div className="space-y-6">
        {timeline.map((step, index) => {
          const isLast = index === timeline.length - 1;
          const isActive = index === timeline.length - 1 && step.status !== 'cancelled';
          const isCancelled = step.status === 'cancelled';

          return (
            <div key={step.id} className="relative pl-10">
              {/* Dot */}
              <div
                className={`absolute left-3 top-0.5 w-3 h-3 rounded-full border-2 ${
                  isActive
                    ? 'border-gold bg-gold animate-pulse'
                    : isCancelled
                    ? 'border-red-500 bg-red-500'
                    : 'border-gold/40 bg-gold/20'
                }`}
              />

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <span className="text-xs text-brown-light dark:text-ivory/50 whitespace-nowrap">
                  {step.date}
                </span>
                <span className="text-sm text-brown dark:text-ivory">{step.description}</span>
              </div>

              {!isLast && (
                <div className="absolute left-3.5 top-3.5 w-0.5 h-full bg-gold/20 dark:bg-gold/10" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// Track Order Page
// ============================================================
export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate inputs
    if (!orderId.trim()) {
      setError('Please enter your order ID');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setIsSubmitted(true);

    // Simulate API call
    setTimeout(() => {
      const foundOrder = mockOrders[orderId.trim().toUpperCase()];
      if (foundOrder && foundOrder.customerEmail.toLowerCase() === email.toLowerCase()) {
        setOrderDetails(foundOrder);
        setError('');
      } else {
        setOrderDetails(null);
        setError('Order not found. Please check your order ID and email.');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleReset = () => {
    setOrderDetails(null);
    setError('');
    setOrderId('');
    setEmail('');
    setIsSubmitted(false);
  };

  return (
    <div className="bg-ivory dark:bg-brown min-h-screen py-12 md:py-20">
      <Container>
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-brown-light dark:text-ivory/60 hover:text-gold-dark dark:hover:text-gold transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-gold-dark dark:text-gold" />
              </div>
              <span className="tag">✦ Track Your Order</span>
            </div>
            <h1 className="font-cinzel text-3xl md:text-4xl lg:text-5xl font-bold text-brown dark:text-ivory">
              Track Your Order
            </h1>
            <p className="text-brown-light dark:text-ivory/60 mt-3 text-sm md:text-base max-w-2xl">
              Enter your order ID and email address to track the status of your divine murti delivery.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Search Form */}
            {!orderDetails && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <GlassCard variant="default" hover={false}>
                  <form onSubmit={handleTrackOrder} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="orderId"
                          className="block text-sm font-medium text-brown dark:text-ivory mb-1.5"
                        >
                          Order ID *
                        </label>
                        <Input
                          id="orderId"
                          type="text"
                          placeholder="e.g., PJM2025123"
                          value={orderId}
                          onChange={(e) => setOrderId(e.target.value)}
                          className="border-gold/10 focus:border-gold"
                          disabled={isLoading}
                        />
                        <p className="text-xs text-brown-light/50 dark:text-ivory/30 mt-1">
                          Format: PJM followed by 7 digits
                        </p>
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-brown dark:text-ivory mb-1.5"
                        >
                          Email Address *
                        </label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="border-gold/10 focus:border-gold"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-500 flex items-center gap-2"
                      >
                        <AlertCircle className="w-4 h-4" />
                        {error}
                      </motion.p>
                    )}

                    <Button
                      type="submit"
                      className="btn-gold w-full md:w-auto"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Tracking...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Track Order
                        </>
                      )}
                    </Button>
                  </form>
                </GlassCard>
              </motion.div>
            )}

            {/* Order Details */}
            <AnimatePresence mode="wait">
              {orderDetails && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="mt-8 space-y-6"
                >
                  {/* Order Summary */}
                  <GlassCard variant="gold" hover={false}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-cinzel text-lg font-bold text-brown dark:text-ivory">
                            {orderDetails.orderId}
                          </h3>
                          <StatusBadge status={orderDetails.status} />
                        </div>
                        <p className="text-sm text-brown-light dark:text-ivory/60">
                          Ordered on {new Date(orderDetails.orderDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-brown-light dark:text-ivory/60">Total Amount</p>
                        <p className="font-cinzel text-2xl font-bold text-gold-dark dark:text-gold">
                          {orderDetails.total.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </GlassCard>

                  {/* Shipping & Contact Info */}
                  <GlassCard variant="default" hover={false}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-brown dark:text-ivory flex items-center gap-2 mb-2">
                          <Truck className="w-4 h-4 text-gold-dark dark:text-gold" />
                          Shipping Details
                        </h4>
                        <div className="space-y-1.5 text-sm text-brown-light dark:text-ivory/70">
                          <p>
                            <span className="font-medium">Address:</span> {orderDetails.shippingAddress}
                          </p>
                          {orderDetails.trackingNumber && (
                            <p>
                              <span className="font-medium">Tracking:</span> {orderDetails.trackingNumber}
                            </p>
                          )}
                          {orderDetails.carrier && (
                            <p>
                              <span className="font-medium">Carrier:</span> {orderDetails.carrier}
                            </p>
                          )}
                          <p>
                            <span className="font-medium">Estimated Delivery:</span>{' '}
                            {orderDetails.estimatedDelivery === 'N/A'
                              ? 'N/A'
                              : new Date(orderDetails.estimatedDelivery).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-brown dark:text-ivory flex items-center gap-2 mb-2">
                          <Mail className="w-4 h-4 text-gold-dark dark:text-gold" />
                          Customer Details
                        </h4>
                        <div className="space-y-1.5 text-sm text-brown-light dark:text-ivory/70">
                          <p><span className="font-medium">Name:</span> {orderDetails.customerName}</p>
                          <p><span className="font-medium">Email:</span> {orderDetails.customerEmail}</p>
                          <p><span className="font-medium">Phone:</span> {orderDetails.customerPhone}</p>
                        </div>
                      </div>
                    </div>
                  </GlassCard>

                  {/* Items */}
                  <GlassCard variant="default" hover={false}>
                    <h4 className="font-semibold text-brown dark:text-ivory flex items-center gap-2 mb-3">
                      <Package className="w-4 h-4 text-gold-dark dark:text-gold" />
                      Order Items
                    </h4>
                    <div className="space-y-2">
                      {orderDetails.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-2 border-b border-gold/5 last:border-0"
                        >
                          <div>
                            <p className="text-sm text-brown dark:text-ivory">{item.name}</p>
                            <p className="text-xs text-brown-light dark:text-ivory/50">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="font-cinzel text-sm text-gold-dark dark:text-gold">
                            {item.price.toLocaleString('en-IN')}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end pt-3 mt-3 border-t border-gold/10">
                      <p className="font-cinzel text-base font-bold text-gold-dark dark:text-gold">
                        Total: {orderDetails.total.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </GlassCard>

                  {/* Timeline */}
                  <GlassCard variant="default" hover={false}>
                    <h4 className="font-semibold text-brown dark:text-ivory flex items-center gap-2 mb-4">
                      <Clock className="w-4 h-4 text-gold-dark dark:text-gold" />
                      Order Timeline
                    </h4>
                    <OrderTimeline timeline={orderDetails.timeline} />
                  </GlassCard>

                  {/* Track Another Order */}
                  <div className="text-center">
                    <button
                      onClick={handleReset}
                      className="inline-flex items-center gap-2 text-brown-light dark:text-ivory/60 hover:text-gold-dark dark:hover:text-gold transition-colors"
                    >
                      <Search className="w-4 h-4" />
                      Track Another Order
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Need Help? */}
            {!orderDetails && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="mt-8"
              >
                <GlassCard variant="default" hover={false}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-cinzel text-lg font-semibold text-brown dark:text-ivory">
                        Need Help?
                      </h3>
                      <p className="text-sm text-brown-light dark:text-ivory/60 mt-1">
                        If you&apos;re having trouble tracking your order, our support team is here to help.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <a
                        href="https://wa.me/917240364772"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors text-sm font-medium"
                      >
                        <Phone className="w-4 h-4" />
                        WhatsApp
                      </a>
                      <Link
                        href="/contact"
                        className="btn-gold text-sm px-4 py-2"
                      >
                        Contact Support
                      </Link>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </div>
        </motion.div>
      </Container>
    </div>
  );
}