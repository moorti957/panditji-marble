// admin/src/app/orders/page.tsx

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  RefreshCw,
  Filter,
  Loader2,
} from 'lucide-react';

import { adminApi } from '@/services/adminApi';
import { formatPrice, formatDate, formatRelativeTime } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { GlassCard } from '@/components/ui/GlassCard';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

// ============================================================
// Order Status Config
// ============================================================
const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  processing: {
    label: 'Processing',
    icon: RefreshCw,
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
  shipped: {
    label: 'Shipped',
    icon: Truck,
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  },
  delivered: {
    label: 'Delivered',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  refunded: {
    label: 'Refunded',
    icon: RefreshCw,
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  },
};

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
];

// ============================================================
// Orders Page
// ============================================================
export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [statusUpdateOrder, setStatusUpdateOrder] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  // Fetch orders
  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'orders', currentPage, limit, statusFilter, searchQuery],
    queryFn: () =>
      adminApi.getOrders({
        page: currentPage,
        limit,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchQuery || undefined,
      }),
  });

  const orders = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 0;

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      adminApi.updateOrderStatus(orderId, status),
    onSuccess: () => {
      toast.success('Order status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      setIsStatusDialogOpen(false);
      setStatusUpdateOrder(null);
      setNewStatus('');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update order status');
    },
  });

  // Open status update dialog
  const openStatusDialog = (order: any) => {
    setStatusUpdateOrder(order);
    setNewStatus(order.status);
    setIsStatusDialogOpen(true);
  };

  // Confirm status update
  const confirmStatusUpdate = () => {
    if (statusUpdateOrder && newStatus) {
      updateStatusMutation.mutate({
        orderId: statusUpdateOrder._id,
        status: newStatus,
      });
    }
  };

  // View order details
  const viewOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  // Payment status badge
  const PaymentStatusBadge = ({ paymentStatus }: { paymentStatus: string }) => {
    const config: Record<string, { label: string; color: string }> = {
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
      paid: { label: 'Paid', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
      failed: { label: 'Failed', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
      refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' },
    };
    const c = config[paymentStatus] || config.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${c.color}`}>
        {c.label}
      </span>
    );
  };

  // Loading skeleton
  if (isLoading && !data) {
    return <OrdersSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-cinzel text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-900">
            Orders
          </h1>
          <p className="text-black dark:text-black text-sm">
            Manage customer orders
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-xl border border-gold/10 hover:bg-gold/10 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-brown-light dark:text-ivory/50" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-light/50" />
          <Input
            type="text"
            placeholder="Search by order ID or customer name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 pr-4 py-2.5 bg-white dark:bg-brown-dark border-gold/10 rounded-full"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
            options={statusOptions}
            placeholder="Filter by status"
            className="w-full"
          />
        </div>
      </div>

      {/* Orders Table */}
      <GlassCard variant="default" padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold/10 dark:border-gold/5 bg-sand/30 dark:bg-brown/30">
                <th className="text-left py-3 px-4 font-medium text-brown-light dark:text-ivory/50 text-xs uppercase tracking-wider">
                  Order ID
                </th>
                <th className="text-left py-3 px-4 font-medium text-brown-light dark:text-ivory/50 text-xs uppercase tracking-wider">
                  Customer
                </th>
                <th className="text-left py-3 px-4 font-medium text-brown-light dark:text-ivory/50 text-xs uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left py-3 px-4 font-medium text-brown-light dark:text-ivory/50 text-xs uppercase tracking-wider">
                  Total
                </th>
                <th className="text-left py-3 px-4 font-medium text-brown-light dark:text-ivory/50 text-xs uppercase tracking-wider">
                  Payment
                </th>
                <th className="text-left py-3 px-4 font-medium text-brown-light dark:text-ivory/50 text-xs uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right py-3 px-4 font-medium text-brown-light dark:text-ivory/50 text-xs uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
  {orders.length === 0 ? (
    <tr>
      <td colSpan={7} className="py-12 text-center text-black dark:text-black">
        <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
        <p>No orders found</p>
      </td>
    </tr>
  ) : (
    orders.map((order: any) => (
      <tr
        key={order._id}
        className="border-b border-gold/5 dark:border-gold/5 hover:bg-gold/5 transition-colors"
      >
        {/* Order Number */}
        <td className="py-3 px-4">
          <span className="font-mono text-xs font-medium text-black dark:text-black">
            #{order.orderNumber}
          </span>
        </td>

        {/* Customer */}
        <td className="py-3 px-4 text-black dark:text-black">
          {order.user?.name || 'Guest'}
        </td>

        {/* Date */}
        <td className="py-3 px-4 text-xs text-black dark:text-black">
          {formatDate(order.createdAt)}
        </td>

        {/* Amount */}
        <td className="py-3 px-4 font-cinzel text-gold-dark dark:text-gold">
          ₹{formatPrice(order.grandTotal)}
        </td>

        {/* Payment Status */}
        <td className="py-3 px-4">
          <PaymentStatusBadge paymentStatus={order.paymentStatus} />
        </td>

        {/* Order Status */}
        <td className="py-3 px-4">
          <StatusBadge status={order.status} />
        </td>

        {/* Actions */}
        <td className="py-3 px-4 text-right">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => viewOrderDetails(order)}
              className="p-1.5 rounded-lg hover:bg-gold/10 transition-colors text-black dark:text-black hover:text-gold-dark"
              aria-label="View details"
            >
              <Eye className="w-4 h-4" />
            </button>

            <button
              onClick={() => openStatusDialog(order)}
              className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors text-black dark:text-black hover:text-blue-600"
              aria-label="Update status"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    ))
  )}
</tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gold/10 dark:border-gold/5">
            <p className="text-xs text-brown-light dark:text-ivory/50">
              Showing {(currentPage - 1) * limit + 1} to{' '}
              {Math.min(currentPage * limit, total)} of {total} orders
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gold/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-brown-light dark:text-ivory/50">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gold/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Order Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedOrder(null);
        }}
        title={`Order #${selectedOrder?.orderNumber || ''}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Customer & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-brown-light dark:text-ivory/50 uppercase tracking-wider">
                  Customer
                </p>
                <p className="text-brown dark:text-ivory font-medium">
                  {selectedOrder.user?.name || 'Guest'}
                </p>
                <p className="text-sm text-brown-light dark:text-ivory/60">
                  {selectedOrder.user?.email || 'N/A'}
                </p>
                <p className="text-sm text-brown-light dark:text-ivory/60">
                  {selectedOrder.user?.phone || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-brown-light dark:text-ivory/50 uppercase tracking-wider">
                  Order Details
                </p>
                <p className="text-sm text-brown-light dark:text-ivory/60">
                  Date: {formatDate(selectedOrder.createdAt)}
                </p>
                <p className="text-sm text-brown-light dark:text-ivory/60">
                  Payment: {selectedOrder.paymentMethod}
                </p>
                <p className="text-sm text-brown-light dark:text-ivory/60">
                  Items: {selectedOrder.items?.length || 0}
                </p>
              </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-brown-light dark:text-ivory/50 uppercase tracking-wider">
                  Shipping Address
                </p>
                <p className="text-sm text-brown-light dark:text-ivory/70">
                  {selectedOrder.shippingAddress?.fullName}<br />
                  {selectedOrder.shippingAddress?.addressLine1}<br />
                  {selectedOrder.shippingAddress?.addressLine2 && (
                    <>{selectedOrder.shippingAddress.addressLine2}<br /></>
                  )}
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}<br />
                  {selectedOrder.shippingAddress?.pincode}<br />
                  {selectedOrder.shippingAddress?.country}
                </p>
              </div>
              <div>
                <p className="text-xs text-brown-light dark:text-ivory/50 uppercase tracking-wider">
                  Billing Address
                </p>
                <p className="text-sm text-brown-light dark:text-ivory/70">
                  {selectedOrder.billingAddress?.fullName || selectedOrder.shippingAddress?.fullName}<br />
                  {selectedOrder.billingAddress?.addressLine1 || selectedOrder.shippingAddress?.addressLine1}<br />
                  {selectedOrder.billingAddress?.city || selectedOrder.shippingAddress?.city}, {selectedOrder.billingAddress?.state || selectedOrder.shippingAddress?.state}<br />
                  {selectedOrder.billingAddress?.pincode || selectedOrder.shippingAddress?.pincode}
                </p>
              </div>
            </div>

            {/* Items */}
            <div>
              <p className="text-xs text-brown-light dark:text-ivory/50 uppercase tracking-wider mb-2">
                Items
              </p>
              <div className="space-y-2">
                {selectedOrder.items?.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gold/5 dark:border-gold/5 last:border-0">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                      )}
                      <div>
                        <p className="text-sm text-brown dark:text-ivory">{item.name}</p>
                        <p className="text-xs text-brown-light dark:text-ivory/50">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-cinzel text-sm text-gold-dark dark:text-gold">
                      ₹{formatPrice(item.total || item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-gold/10 dark:border-gold/5 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-brown-light dark:text-ivory/60">Subtotal</span>
                <span className="text-brown dark:text-ivory">₹{formatPrice(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-brown-light dark:text-ivory/60">Shipping</span>
                <span className="text-brown dark:text-ivory">₹{formatPrice(selectedOrder.shippingCost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-brown-light dark:text-ivory/60">Tax</span>
                <span className="text-brown dark:text-ivory">₹{formatPrice(selectedOrder.tax)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-₹{formatPrice(selectedOrder.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-cinzel text-lg pt-2 border-t border-gold/10 dark:border-gold/5">
                <span className="text-brown dark:text-ivory">Grand Total</span>
                <span className="text-gold-dark dark:text-gold">₹{formatPrice(selectedOrder.grandTotal)}</span>
              </div>
            </div>

            {/* Status & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-xs text-brown-light dark:text-ivory/50 uppercase tracking-wider">Status</p>
                <StatusBadge status={selectedOrder.status} />
              </div>
              <div>
                <p className="text-xs text-brown-light dark:text-ivory/50 uppercase tracking-wider">Payment Status</p>
                <PaymentStatusBadge paymentStatus={selectedOrder.paymentStatus} />
              </div>
            </div>
            {selectedOrder.notes && (
              <div>
                <p className="text-xs text-brown-light dark:text-ivory/50 uppercase tracking-wider">Notes</p>
                <p className="text-sm text-brown-light dark:text-ivory/70">{selectedOrder.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Status Update Dialog */}
      <ConfirmDialog
        isOpen={isStatusDialogOpen}
        onClose={() => {
          setIsStatusDialogOpen(false);
          setStatusUpdateOrder(null);
          setNewStatus('');
        }}
        onConfirm={confirmStatusUpdate}
        title="Update Order Status"
        message={
          <div className="space-y-3">
            <p className="text-sm text-brown-light dark:text-ivory/70">
              Update status for order <strong>#{statusUpdateOrder?.orderNumber}</strong>
            </p>
            <Select
              value={newStatus}
              onValueChange={setNewStatus}
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'processing', label: 'Processing' },
                { value: 'shipped', label: 'Shipped' },
                { value: 'delivered', label: 'Delivered' },
                { value: 'cancelled', label: 'Cancelled' },
                { value: 'refunded', label: 'Refunded' },
              ]}
              placeholder="Select new status"
              className="w-full"
            />
          </div>
        }
        confirmLabel="Update Status"
        variant="primary"
        isLoading={updateStatusMutation.isPending}
      />
    </div>
  );
}

// ============================================================
// Orders Skeleton
// ============================================================
function OrdersSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-40 bg-sand/50 dark:bg-brown/50 rounded animate-pulse" />
          <div className="h-4 w-48 bg-sand/30 dark:bg-brown/30 rounded animate-pulse mt-1" />
        </div>
        <div className="h-10 w-10 bg-sand/50 dark:bg-brown/50 rounded-xl animate-pulse" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 h-11 bg-sand/50 dark:bg-brown/50 rounded-full animate-pulse" />
        <div className="w-full sm:w-48 h-11 bg-sand/50 dark:bg-brown/50 rounded-xl animate-pulse" />
      </div>

      <div className="bg-white dark:bg-brown-dark rounded-2xl border border-gold/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold/10 dark:border-gold/5">
                {Array.from({ length: 7 }).map((_, i) => (
                  <th key={i} className="py-3 px-4">
                    <div className="h-3 w-16 bg-sand/50 dark:bg-brown/50 rounded animate-pulse" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gold/5 dark:border-gold/5">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="py-3 px-4">
                      <div className={`h-4 ${j === 0 ? 'w-20' : j === 3 ? 'w-16' : 'w-24'} bg-sand/50 dark:bg-brown/50 rounded animate-pulse`} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}