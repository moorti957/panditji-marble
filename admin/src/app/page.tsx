// admin/src/app/page.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  Eye,
  ShoppingCart,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Download,
} from 'lucide-react';

import { adminApi } from '@/services/adminApi';
import { formatPrice, formatDate } from '@/lib/utils';

// ============================================================
// Dashboard Page
// ============================================================
export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year'>('month');

  // Fetch dashboard stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['admin', 'dashboard', 'stats', dateRange],
    queryFn: () => adminApi.getDashboardStats(dateRange),
  });

  // Fetch recent orders
  const { data: recentOrders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['admin', 'orders', 'recent'],
    queryFn: () => adminApi.getRecentOrders(5),
  });

  // Fetch revenue data for chart
  const { data: revenueData, isLoading: isLoadingRevenue } = useQuery({
    queryKey: ['admin', 'revenue', dateRange],
    queryFn: () => adminApi.getRevenueData(dateRange),
  });

  // Stats cards
  const statsCards = [
    {
      title: 'Total Revenue',
      value: stats?.totalRevenue || 0,
      formatted: `${formatPrice(stats?.totalRevenue || 0)}`,
      change: stats?.revenueChange || 0,
      icon: DollarSign,
      color: 'bg-green-500',
      bg: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      change: stats?.ordersChange || 0,
      icon: ShoppingBag,
      color: 'bg-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      change: stats?.productsChange || 0,
      icon: Package,
      color: 'bg-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      title: 'Total Customers',
      value: stats?.totalCustomers || 0,
      change: stats?.customersChange || 0,
      icon: Users,
      color: 'bg-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
    },
  ];

  // Status badge colors
  const statusColors: Record<string, string> = {
     pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  refunded: "bg-gray-100 text-gray-800 border-gray-200",
  };

  const statusLabels: Record<string, string> = {
    pending: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  // Loading skeleton
  if (isLoadingStats) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-cinzel text-2xl md:text-3xl font-bold text-black dark:text-black">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-600 text-sm">
            Welcome back! Here's what's happening with your store.
          </p>
        </div>
        <div className="flex items-center gap-3">
  <div className="flex items-center gap-1 bg-white dark:bg-brown-dark rounded-lg border border-gold/10 p-1">
    {['today', 'week', 'month', 'year'].map((period) => (
      <button
        key={period}
        onClick={() => setDateRange(period as any)}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
          dateRange === period
            ? 'bg-gold text-white'
            : 'text-black dark:text-black hover:bg-gold/10'
        }`}
      >
        {period.charAt(0).toUpperCase() + period.slice(1)}
      </button>
    ))}
  </div>

  <button className="p-2 rounded-lg hover:bg-gold/10 transition-colors text-black dark:text-black">
    <Download className="w-4 h-4" />
  </button>
</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.change >= 0;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white dark:bg-brown-dark rounded-2xl p-5 border border-gold/5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-black dark:text-black uppercase tracking-wider">
                    {stat.title}
                  </p>
                  <p className="font-cinzel text-2xl font-bold text-black dark:text-black mt-1">
                    {stat.formatted || stat.value.toLocaleString()}
                  </p>
                </div>
                <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                  <Icon className={`w-5 h-5 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
              </div>
              {stat.change !== undefined && (
                <div className="flex items-center gap-1.5 mt-3">
                  {isPositive ? (
                    <ArrowUpRight className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      isPositive ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {Math.abs(stat.change)}%
                  </span>
                  <span className="text-xs text-brown-light dark:text-ivory/40">
                    from last period
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Charts & Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart (2 columns on desktop) */}
        <div className="lg:col-span-2 bg-white dark:bg-brown-dark rounded-2xl p-5 border border-gold/5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-cinzel text-lg font-semibold text-black dark:text-black">
              Revenue Overview
            </h3>
            <span className="text-xs text-black dark:text-black/50">
              {dateRange.charAt(0).toUpperCase() + dateRange.slice(1)}
            </span>
          </div>
          <div className="h-64 flex items-center justify-center">
            {isLoadingRevenue ? (
              <div className="w-full h-full animate-pulse bg-sand/30 dark:bg-brown/30 rounded-lg" />
            ) : (
              <div className="w-full h-full relative">
                {/* Simple bar chart representation */}
                <div className="flex items-end justify-between h-full gap-1.5 pt-4">
                  {revenueData?.map((item: any, index: number) => {
                    const max = Math.max(...(revenueData?.map((d: any) => d.revenue) || [1]));
                    const height = max > 0 ? (item.revenue / max) * 100 : 0;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-gold/60 hover:bg-gold transition-colors rounded-t"
                          style={{ height: `${Math.max(height, 2)}%` }}
                        />
                        <span className="text-[10px] text-brown-light dark:text-ivory/40 truncate w-full text-center">
                          {item.label || index + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-brown-dark rounded-2xl p-5 border border-gold/5 shadow-sm">
          <h3 className="font-cinzel text-lg font-semibold text-brown dark:text-ivory mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Link
              href="/products/create"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gold/5 transition-colors group"
            >
              <div className="p-2 bg-gold/10 rounded-lg text-gold-dark">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-sm text-black dark:text-black group-hover:text-gold-dark transition-colors">
                Add New Product
              </span>
              <ChevronRight className="w-4 h-4 ml-auto text-brown-light/50" />
            </Link>
            <Link
              href="/orders"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gold/5 transition-colors group"
            >
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
                <Eye className="w-4 h-4" />
              </div>
              <span className="text-sm text-black dark:text-black group-hover:text-gold-dark transition-colors">
                View All Orders
              </span>
              <ChevronRight className="w-4 h-4 ml-auto text-black/50" />
            </Link>
            <Link
              href="/categories"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gold/5 transition-colors group"
            >
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600">
                <Filter className="w-4 h-4" />
              </div>
              <span className="text-sm text-black dark:text-black group-hover:text-gold-dark transition-colors">
                Manage Categories
              </span>
              <ChevronRight className="w-4 h-4 ml-auto text-black/50" />
            </Link>
            <Link
              href="/customers"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gold/5 transition-colors group"
            >
              <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-sm text-black dark:text-black group-hover:text-gold-dark transition-colors">
                View Customers
              </span>
              <ChevronRight className="w-4 h-4 ml-auto text-black/50" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-brown-dark rounded-2xl p-5 border border-gold/5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-cinzel text-lg font-semibold text-black dark:text-black">
            Recent Orders
          </h3>
          <Link
            href="/orders"
            className="text-sm text-gold-dark hover:text-gold transition-colors flex items-center gap-1"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoadingOrders ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-sand/30 dark:bg-brown/30 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gold/10 dark:border-gold/5">
                  <th className="text-left py-3 font-medium text-black dark:text-black text-xs uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="text-left py-3 font-medium text-black dark:text-black text-xs uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="text-left py-3 font-medium text-black dark:text-black text-xs uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left py-3 font-medium text-black dark:text-black text-xs uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-left py-3 font-medium text-black dark:text-black text-xs uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right py-3 font-medium text-black dark:text-black text-xs uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders?.map((order: any) => (
                  <tr
                    key={order.id}
                    className="border-b border-gold/5 dark:border-gold/5 hover:bg-gold/5 transition-colors"
                  >
                    <td className="py-3 font-medium text-black dark:text-black">
                      #{order.orderNumber}
                    </td>
                    <td className="py-3 text-black dark:text-black text-xs">
                      {order.user?.name || 'Guest'}
                    </td>
                    <td className="py-3 text-black dark:text-black text-xs">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="py-3 font-cinzel text-gold-dark dark:text-gold">
                      {formatPrice(order.grandTotal)}
                    </td>
                   <td className="py-3">
  {(() => {
    const status = (order.status || "pending").toLowerCase();

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
          statusColors[status] || "bg-yellow-100 text-yellow-800 border-yellow-200"
        }`}
      >
        {statusLabels[status] || status}
      </span>
    );
  })()}
</td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-gold-dark hover:text-gold transition-colors text-xs"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
                {(!recentOrders || recentOrders.length === 0) && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-black dark:text-black text-sm">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Dashboard Skeleton Loader
// ============================================================
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-48 bg-sand/50 dark:bg-brown/50 rounded animate-pulse" />
          <div className="h-4 w-64 bg-sand/30 dark:bg-brown/30 rounded animate-pulse mt-1" />
        </div>
        <div className="h-10 w-48 bg-sand/50 dark:bg-brown/50 rounded-lg animate-pulse" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-brown-dark rounded-2xl p-5 border border-gold/5">
            <div className="h-3 w-20 bg-sand/50 dark:bg-brown/50 rounded animate-pulse" />
            <div className="h-8 w-24 bg-sand/50 dark:bg-brown/50 rounded animate-pulse mt-2" />
            <div className="flex items-center gap-2 mt-3">
              <div className="h-3 w-12 bg-sand/50 dark:bg-brown/50 rounded animate-pulse" />
              <div className="h-3 w-20 bg-sand/30 dark:bg-brown/30 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-brown-dark rounded-2xl p-5 border border-gold/5">
          <div className="h-6 w-32 bg-sand/50 dark:bg-brown/50 rounded animate-pulse mb-4" />
          <div className="h-64 bg-sand/30 dark:bg-brown/30 rounded-lg animate-pulse" />
        </div>
        <div className="bg-white dark:bg-brown-dark rounded-2xl p-5 border border-gold/5">
          <div className="h-6 w-28 bg-sand/50 dark:bg-brown/50 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-sand/30 dark:bg-brown/30 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-brown-dark rounded-2xl p-5 border border-gold/5">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-32 bg-sand/50 dark:bg-brown/50 rounded animate-pulse" />
          <div className="h-4 w-16 bg-sand/30 dark:bg-brown/30 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-sand/30 dark:bg-brown/30 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
