// frontend/src/app/profile/page.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  Settings,
  LogOut,
  ChevronRight,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Edit2,
  Plus,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Award,
} from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useWishlist } from '@/features/wishlist/hooks/useWishlist';
import { formatPrice } from '@/lib/utils';
import { get } from '@/services/apiClient';

const mockAddresses = [
  {
    id: 'addr1',
    name: 'Home',
    fullName: 'Devotee Sharma',
    addressLine1: '123, Murti Marg',
    city: 'govindgarh',
    state: 'Rajasthan',
    pincode: '302001',
    phone: '+91 72403 64772',
    isDefault: true,
  },
  {
    id: 'addr2',
    name: 'Office',
    fullName: 'Devotee Sharma',
    addressLine1: '456, Temple Road',
    city: 'govindgarh',
    state: 'Rajasthan',
    pincode: '302002',
    phone: '+91 98765 43211',
    isDefault: false,
  },
];

// ============================================================
// Profile Page
// ============================================================
export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
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
            })),
          }))
        );
      } catch (error) {
        console.error('Failed to load profile orders', error);
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

  // Handle logout
  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Status badge
  const StatusBadge = ({ status }: { status: string }) => {
    const statusMap: Record<string, { label: string; icon: any; className: string }> = {
      pending: { label: 'Pending', icon: Clock, className: 'bg-yellow-100 text-yellow-700' },
      shipped: { label: 'Shipped', icon: Package, className: 'bg-blue-100 text-blue-700' },
      delivered: { label: 'Delivered', icon: CheckCircle, className: 'bg-green-100 text-green-700' },
      cancelled: { label: 'Cancelled', icon: XCircle, className: 'bg-red-100 text-red-700' },
    };
    const info = statusMap[status] || statusMap.pending;
    const Icon = info.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${info.className}`}>
        <Icon className="w-3 h-3" />
        {info.label}
      </span>
    );
  };

  // Sidebar tabs
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <User className="w-4 h-4" /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'wishlist', label: 'Wishlist', icon: <Heart className="w-4 h-4" /> },
    { id: 'addresses', label: 'Addresses', icon: <MapPin className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  // Loading state
  if (isLoading) {
    return (
      <Container className="py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Skeleton className="h-64 rounded-2xl" />
          </div>
          <div className="md:col-span-3">
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </div>
      </Container>
    );
  }

  // If no user, don't render (will redirect)
  if (!user) return null;

  return (
    <Container className="py-8 md:py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="md:col-span-1"
        >
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gold/5 sticky top-24">
            {/* User info */}
            <div className="text-center pb-6 border-b border-gold/10">
              <div className="w-20 h-20 mx-auto bg-gold/10 rounded-full flex items-center justify-center text-3xl">
                {user.name?.charAt(0) || 'D'}
              </div>
              <h3 className="font-cinzel text-lg font-semibold text-brown mt-3">
                {user.name || 'Devotee'}
              </h3>
              <p className="text-sm text-brown-light">{user.email}</p>
              <div className="flex items-center justify-center gap-2 mt-2 text-xs text-brown-light/70">
                <Award className="w-3.5 h-3.5 text-gold" />
                <span>Member since 2025</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1 mt-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
                    activeTab === tab.id
                      ? 'bg-gold/10 text-gold-dark'
                      : 'text-brown-light hover:bg-gold/5 hover:text-brown'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.id === 'wishlist' && wishlistItems.length > 0 && (
                    <span className="ml-auto bg-gold/20 text-gold-dark text-xs px-2 py-0.5 rounded-full">
                      {wishlistItems.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Logout */}
            <div className="pt-6 mt-6 border-t border-gold/10">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </motion.aside>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="md:col-span-3"
        >
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gold/5 min-h-[500px]">
            <AnimatePresence mode="wait">
              {/* Overview */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <h2 className="font-cinzel text-2xl font-bold text-brown">Overview</h2>
                  <p className="text-brown-light text-sm">
                    Welcome back, {user.name}! Here's a summary of your account.
                  </p>

                  {/* Stats cards */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-sand/30 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-gold-dark">{orders.length}</p>
                      <p className="text-xs text-brown-light">Total Orders</p>
                    </div>
                    <div className="bg-sand/30 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-gold-dark">{wishlistItems.length}</p>
                      <p className="text-xs text-brown-light">Wishlist Items</p>
                    </div>
                    <div className="bg-sand/30 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-gold-dark">2</p>
                      <p className="text-xs text-brown-light">Saved Addresses</p>
                    </div>
                  </div>

                  {/* Recent orders preview */}
                  <div>
                    <h3 className="font-cinzel text-lg font-semibold text-brown mb-3">
                      Recent Orders
                    </h3>
                    {orders.slice(0, 2).map((order) => (
                      <Link
                        key={order.id}
                        href="/orders"
                        className="flex items-center justify-between p-4 border border-gold/10 rounded-xl hover:bg-gold/5 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-sm">{order.id}</p>
                          <p className="text-xs text-brown-light">{formatDate(order.date)}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-cinzel text-gold-dark">{formatPrice(order.total)}</span>
                          <StatusBadge status={order.status} />
                          <ChevronRight className="w-4 h-4 text-brown-light" />
                        </div>
                      </Link>
                    ))}
                    <Link
                      href="#"
                      onClick={() => setActiveTab('orders')}
                      className="inline-flex items-center gap-1 text-sm text-gold-dark hover:text-gold transition-colors mt-3"
                    >
                      View all orders
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              )}

              {/* Orders */}
              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-cinzel text-2xl font-bold text-brown">My Orders</h2>
                    <span className="text-sm text-brown-light">{orders.length} orders</span>
                  </div>

                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="w-12 h-12 text-brown-light/30 mx-auto" />
                      <p className="text-brown-light mt-3">No orders yet.</p>
                      <Link href="/products" className="btn-gold inline-block mt-4 text-sm">
                        Start Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="border border-gold/10 rounded-xl p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-sm">{order.id}</p>
                              <p className="text-xs text-brown-light">{formatDate(order.date)}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-brown-light">
                                  {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                </span>
                                <StatusBadge status={order.status} />
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-cinzel text-lg text-gold-dark">
                                {formatPrice(order.total)}
                              </p>
                              <button className="text-xs text-gold-dark hover:text-gold transition-colors">
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Wishlist */}
              {activeTab === 'wishlist' && (
                <motion.div
                  key="wishlist"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h2 className="font-cinzel text-2xl font-bold text-brown mb-6">My Wishlist</h2>
                  {wishlistItems.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="w-12 h-12 text-brown-light/30 mx-auto" />
                      <p className="text-brown-light mt-3">Your wishlist is empty.</p>
                      <Link href="/products" className="btn-gold inline-block mt-4 text-sm">
                        Browse Collection
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {wishlistItems.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 border border-gold/10 rounded-xl p-3 hover:shadow-md transition-shadow"
                        >
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-sand flex-shrink-0">
                            <Image
                              src={item.images[0] || '/placeholder.png'}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/products/${item.slug}`}
                              className="font-medium text-sm hover:text-gold-dark transition-colors line-clamp-1"
                            >
                              {item.name}
                            </Link>
                            <p className="font-cinzel text-sm text-gold-dark">
                              {formatPrice(item.price)}
                            </p>
                          </div>
                          <button
                            className="text-red-400 hover:text-red-600 transition-colors p-1"
                            aria-label="Remove from wishlist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Addresses */}
              {activeTab === 'addresses' && (
                <motion.div
                  key="addresses"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-cinzel text-2xl font-bold text-brown">Saved Addresses</h2>
                    <button className="btn-gold text-sm px-4 py-2 flex items-center gap-1">
                      <Plus className="w-4 h-4" />
                      Add New
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`border rounded-xl p-4 ${
                          addr.isDefault ? 'border-gold bg-gold/5' : 'border-gold/10'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-brown">{addr.name}</h4>
                              {addr.isDefault && (
                                <span className="text-xs bg-gold/20 text-gold-dark px-2 py-0.5 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-brown-light mt-1">{addr.fullName}</p>
                            <p className="text-sm text-brown-light">
                              {addr.addressLine1}, {addr.city}, {addr.state} – {addr.pincode}
                            </p>
                            <p className="text-sm text-brown-light">{addr.phone}</p>
                          </div>
                          <div className="flex gap-1">
                            <button className="p-1 text-brown-light hover:text-brown transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-brown-light hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Settings */}
              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h2 className="font-cinzel text-2xl font-bold text-brown mb-6">Account Settings</h2>

                  <div className="space-y-6">
                    {/* Profile form */}
                    <div>
                      <h3 className="font-medium text-brown mb-3">Profile Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-brown mb-1">
                            Full Name
                          </label>
                          <Input
                            defaultValue={user.name || ''}
                            placeholder="Your name"
                            className="bg-sand/30"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-brown mb-1">
                            Email
                          </label>
                          <Input
                            defaultValue={user.email || ''}
                            placeholder="Email"
                            disabled
                            className="bg-gray-100 cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-brown mb-1">
                            Phone
                          </label>
                          <Input
                            defaultValue={user.phone || ''}
                            placeholder="Phone number"
                            className="bg-sand/30"
                          />
                        </div>
                      </div>
                      <button className="btn-gold mt-4 px-6 py-2 text-sm">
                        Save Changes
                      </button>
                    </div>

                    {/* Password change */}
                    <div className="pt-6 border-t border-gold/10">
                      <h3 className="font-medium text-brown mb-3">Change Password</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-brown mb-1">
                            Current Password
                          </label>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="bg-sand/30"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-brown mb-1">
                            New Password
                          </label>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="bg-sand/30"
                          />
                        </div>
                      </div>
                      <button className="btn-maroon mt-4 px-6 py-2 text-sm">
                        Update Password
                      </button>
                    </div>

                    {/* Notifications */}
                    <div className="pt-6 border-t border-gold/10">
                      <h3 className="font-medium text-brown mb-3">Notification Preferences</h3>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm text-brown-light cursor-pointer">
                          <input type="checkbox" defaultChecked className="accent-gold" />
                          Order updates
                        </label>
                        <label className="flex items-center gap-2 text-sm text-brown-light cursor-pointer">
                          <input type="checkbox" defaultChecked className="accent-gold" />
                          Promotions and offers
                        </label>
                        <label className="flex items-center gap-2 text-sm text-brown-light cursor-pointer">
                          <input type="checkbox" className="accent-gold" />
                          Newsletter
                        </label>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </Container>
  );
}