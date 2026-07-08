// frontend/src/app/orders/page.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Package,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Eye,
  Search,
  Filter,
  Calendar,
  Download,
  Loader,
} from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { formatPrice } from '@/lib/utils';
import { get } from '@/services/apiClient';

// ============================================================
// Orders Page
// ============================================================
export default function OrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const response: any = await get('/orders/my');
        const fetchedOrders = response?.data?.orders || [];
        setOrders(
          fetchedOrders.map((order: any) => ({
            id: order.orderNumber || order._id,
            date: order.createdAt,
            total: order.grandTotal || 0,
            status: order.status,
            items: (order.items || []).map((item: any) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              image: item.image,
            })),
            shippingAddress: order.shippingAddress
              ? `${order.shippingAddress.addressLine1}${order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}`
              : 'Not available',
            paymentMethod: order.paymentMethod?.toUpperCase() || 'N/A',
            trackingNumber: order.trackingNumber || null,
            advancePaid: order.advancePaid || 0,
            remainingAmount: order.remainingAmount || 0,
          }))
        );
      } catch (error) {
        console.error('Failed to load orders', error);
        toast.error('Unable to load your orders right now.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user && !isLoading) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Filter orders
  const filteredOrders = orders.filter((order: any) => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.items.some((item: any) => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusMap: Record<string, { label: string; icon: any; className: string }> = {
      pending: { label: 'Pending', icon: Clock, className: 'bg-yellow-100 text-yellow-700' },
      advance_paid: { label: 'Advance Paid', icon: Clock, className: 'bg-amber-100 text-amber-700' },
      processing: { label: 'Processing', icon: Loader, className: 'bg-sky-100 text-sky-700' },
      shipped: { label: 'Shipped', icon: Truck, className: 'bg-blue-100 text-blue-700' },
      delivered: { label: 'Delivered', icon: CheckCircle, className: 'bg-green-100 text-green-700' },
      cancelled: { label: 'Cancelled', icon: XCircle, className: 'bg-red-100 text-red-700' },
    };
    const info = statusMap[status] || statusMap.pending;
    const Icon = info.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${info.className}`}>
        <Icon className="w-3.5 h-3.5" />
        {info.label}
      </span>
    );
  };

  // Toggle order details
  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Track order action
  const handleTrackOrder = (orderId: string) => {
    toast.success(`Tracking order ${orderId}`);
    // Navigate to tracking page
    // router.push(`/track-order/${orderId}`);
  };

  // Download invoice
  const handleDownloadInvoice = (orderId: string) => {
    toast.success(`Downloading invoice for ${orderId}`);
    // Trigger download
  };

  // Cancel order
  const handleCancelOrder = (orderId: string) => {
    toast.success(`Order ${orderId} cancelled`);
    // Update status
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: 'cancelled' } : o
      )
    );
  };

  // Loading state
  if (isLoading) {
    return <OrdersSkeleton />;
  }

  // If no user, return null (will redirect)
  if (!user) return null;

  // Get unique statuses for filter
  const statuses = ['all', ...new Set(orders.map((o) => o.status))];

  return (
    <Container className="py-8 md:py-12">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-cinzel text-2xl md:text-3xl font-bold text-brown">My Orders</h1>
            <p className="text-brown-light text-sm mt-1">
              Track and manage all your orders in one place.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-light" />
              <Input
                type="text"
                placeholder="Search by order ID or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border-gold/10 rounded-full w-full md:w-64"
              />
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 text-sm border border-gold/10 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-gold/20"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-light pointer-events-none" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Order count */}
      <p className="text-sm text-brown-light/70 mb-4">
        {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} found
      </p>

      {/* Orders list */}
      {filteredOrders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 bg-white rounded-2xl border border-gold/5"
        >
          <Package className="w-16 h-16 text-brown-light/20 mx-auto mb-4" />
          <h3 className="font-cinzel text-xl text-brown">No orders found</h3>
          <p className="text-brown-light text-sm mt-2">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'You haven\'t placed any orders yet.'}
          </p>
          <Link href="/products" className="btn-gold inline-block mt-6">
            Browse Collection
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white rounded-2xl border border-gold/5 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Order summary (always visible) */}
              <div
                className="p-4 md:p-6 cursor-pointer"
                onClick={() => toggleOrderDetails(order.id)}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="font-cinzel text-sm font-semibold text-brown">
                        {order.id}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-brown-light">
                      <span>{formatDate(order.date)}</span>
                      <span>•</span>
                      <span>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
                      <span>•</span>
                      <span>{order.paymentMethod}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-cinzel text-lg text-gold-dark">
                      {formatPrice(order.total)}
                    </span>
                    <button
                      className="p-2 rounded-full hover:bg-gold/10 transition-colors"
                      aria-label={expandedOrder === order.id ? 'Collapse' : 'Expand'}
                    >
                      {expandedOrder === order.id ? (
                        <ChevronUp className="w-5 h-5 text-brown-light" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-brown-light" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded details */}
              <AnimatePresence>
                {expandedOrder === order.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gold/10 px-4 md:px-6 py-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Items */}
                      <div>
                        <h4 className="font-medium text-sm text-brown mb-2">Items</h4>
                        <div className="space-y-2">
                          {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <span>{item.quantity} ×</span>
                                <span className="text-brown">{item.name}</span>
                              </div>
                              <span className="font-cinzel text-gold-dark">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 pt-2 border-t border-gold/10 flex justify-between text-sm font-medium">
                          <span>Total</span>
                          <span className="font-cinzel text-gold-dark">{formatPrice(order.total)}</span>
                        </div>
                      </div>

                      {/* Details */}
                      <div>
                        <h4 className="font-medium text-sm text-brown mb-2">Order Details</h4>
                        <div className="space-y-2 text-sm text-brown-light">
                          <p><span className="font-medium text-brown">Payment:</span> {order.paymentMethod}</p>
                          <p><span className="font-medium text-brown">Shipping:</span> {order.shippingAddress}</p>
                          {order.trackingNumber && (
                            <p><span className="font-medium text-brown">Tracking:</span> {order.trackingNumber}</p>
                          )}
                          <p><span className="font-medium text-brown">Placed on:</span> {formatDate(order.date)}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 mt-4">
                          {order.status === 'shipped' && order.trackingNumber && (
                            <button
                              onClick={() => handleTrackOrder(order.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              <Truck className="w-4 h-4" />
                              Track
                            </button>
                          )}
                          <button
                            onClick={() => handleDownloadInvoice(order.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gold/10 text-gold-dark rounded-lg hover:bg-gold/20 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Invoice
                          </button>
                          {order.status === 'pending' && (
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                              Cancel
                            </button>
                          )}
                          <Link
                            href={`/orders/${order.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gold/20 text-brown rounded-lg hover:bg-gold/5 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View Full Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* Back to profile link */}
      <div className="mt-8 text-center">
        <Link href="/profile" className="text-sm text-brown-light hover:text-gold-dark transition-colors inline-flex items-center gap-1">
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to Profile
        </Link>
      </div>
    </Container>
  );
}

// ============================================================
// SKELETON LOADER
// ============================================================
function OrdersSkeleton() {
  return (
    <Container className="py-8 md:py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-1" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-64 rounded-full" />
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gold/5 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}