'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, RefreshCw, ShoppingBag, Heart, Search, Eye } from 'lucide-react';

import { adminApi } from '@/services/adminApi';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';

export default function UserActivityPage() {
  const params = useParams();
  const userId = params?.id as string | undefined;

  const {
    data: user,
    isLoading: isLoadingUser,
    isError: isUserError,
  } = useQuery({
    queryKey: ['admin', 'user', userId],
    queryFn: () => adminApi.getUser(userId as string),
    enabled: Boolean(userId),
  });

  const {
    data: activity,
    isLoading: isLoadingActivity,
    isError: isActivityError,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'userActivity', userId],
    queryFn: () => adminApi.getUserActivity(userId as string, { limit: 10 }),
    enabled: Boolean(userId),
  });

  const isLoading = isLoadingUser || isLoadingActivity;
  const hasError = isUserError || isActivityError;

  const totals = activity?.totals ?? {};
  const orders = activity?.orders ?? [];
  const clicks = activity?.productClicks ?? [];
  const searches = activity?.searchHistory ?? [];
  const favorites = activity?.favoriteActivities ?? [];
  const cartActions = activity?.cartActivities ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Link href="/users" className="inline-flex items-center gap-2 text-sm font-medium text-gold-dark hover:text-gold">
              <ArrowLeft className="w-4 h-4" />
              Back to users
            </Link>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-900">User Activity</h1>
            <p className="text-sm text-black dark:text-black">Recent activity and engagement for this customer.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => refetch()} type="button" className="inline-flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      <GlassCard className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-6 bg-sand/50 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-sand/50 rounded animate-pulse" />
          </div>
        ) : hasError ? (
          <div className="text-red-600">Unable to load user activity.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2 rounded-3xl border border-gold/10 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-gold-dark"><Eye className="w-5 h-5" /> Product Clicks</div>
              <div className="text-3xl font-semibold text-black">{totals.productClicks ?? 0}</div>
              <div className="text-xs text-brown-light">Most recent click at {clicks[0]?.lastClickedAt ? formatDate(clicks[0].lastClickedAt) : 'N/A'}</div>
            </div>
            <div className="space-y-2 rounded-3xl border border-gold/10 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-gold-dark"><Search className="w-5 h-5" /> Search Terms</div>
              <div className="text-3xl font-semibold text-black">{totals.searchHistory ?? 0}</div>
              <div className="text-xs text-brown-light">Latest search: {searches[0]?.keyword ?? 'N/A'}</div>
            </div>
            <div className="space-y-2 rounded-3xl border border-gold/10 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-gold-dark"><Heart className="w-5 h-5" /> Favorites</div>
              <div className="text-3xl font-semibold text-black">{totals.favoriteActivities ?? 0}</div>
              <div className="text-xs text-brown-light">Last favorite action: {favorites[0]?.action ?? 'N/A'}</div>
            </div>
            <div className="space-y-2 rounded-3xl border border-gold/10 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-gold-dark"><ShoppingBag className="w-5 h-5" /> Cart Actions</div>
              <div className="text-3xl font-semibold text-black">{totals.cartActivities ?? 0}</div>
              <div className="text-xs text-brown-light">Last cart action: {cartActions[0]?.action ?? 'N/A'}</div>
            </div>
          </div>
        )}
      </GlassCard>

      {!isLoading && !hasError && user && (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <GlassCard className="p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-black">{user.name}</h2>
                  <p className="text-sm text-brown-light">{user.email}</p>
                </div>
                <div className="text-right text-sm text-brown-light">
                  Joined {formatDate(user.createdAt)}
                </div>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-gold/10 bg-sand/50 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-brown-light">Role</div>
                  <div className="mt-2 text-base font-semibold text-black">{user.role}</div>
                </div>
                <div className="rounded-3xl border border-gold/10 bg-sand/50 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-brown-light">Status</div>
                  <div className="mt-2 text-base font-semibold text-black">{user.isActive ? 'Active' : 'Inactive'}</div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-black">Recent Orders</h3>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gold/10 text-brown-light">
                      <th className="py-3 pr-4">Order #</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3 pr-4">Total</th>
                      <th className="py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-black">No recent orders</td>
                      </tr>
                    ) : (
                      orders.map((order: any) => (
                        <tr key={order._id} className="border-b border-gold/5">
                          <td className="py-3 pr-4">{order.orderNumber || order._id}</td>
                          <td className="py-3 pr-4">{order.status || 'Unknown'}</td>
                          <td className="py-3 pr-4">{order.grandTotal ? `₹${order.grandTotal}` : '₹0'}</td>
                          <td className="py-3">{formatDate(order.createdAt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-black">Recent Searches</h3>
              <div className="mt-4 space-y-3">
                {searches.length === 0 ? (
                  <p className="text-sm text-brown-light">No search history yet.</p>
                ) : (
                  searches.map((search: any) => (
                    <div key={search._id} className="rounded-3xl border border-gold/10 bg-sand/50 p-4">
                      <div className="font-medium text-black">{search.keyword}</div>
                      <div className="text-xs text-brown-light">{formatDate(search.createdAt)}</div>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>
          </div>

          <div className="space-y-6">
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-black">Recent Product Clicks</h3>
              <div className="mt-4 space-y-3">
                {clicks.length === 0 ? (
                  <p className="text-sm text-brown-light">No product clicks yet.</p>
                ) : (
                  clicks.map((click: any) => (
                    <div key={click._id} className="rounded-3xl border border-gold/10 bg-sand/50 p-4">
                      <div className="font-medium text-black">{click.product?.name || 'Unknown product'}</div>
                      <div className="text-xs text-brown-light">Last clicked {formatDate(click.lastClickedAt)}</div>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-black">Favorites</h3>
              <div className="mt-4 space-y-3">
                {favorites.length === 0 ? (
                  <p className="text-sm text-brown-light">No favorite activity yet.</p>
                ) : (
                  favorites.map((favorite: any) => (
                    <div key={favorite._id} className="rounded-3xl border border-gold/10 bg-sand/50 p-4">
                      <div className="font-medium text-black">{favorite.product?.name || 'Unknown product'}</div>
                      <div className="text-xs text-brown-light">{favorite.action} • {formatDate(favorite.timestamp)}</div>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-black">Cart Actions</h3>
              <div className="mt-4 space-y-3">
                {cartActions.length === 0 ? (
                  <p className="text-sm text-brown-light">No cart activity yet.</p>
                ) : (
                  cartActions.map((action: any) => (
                    <div key={action._id} className="rounded-3xl border border-gold/10 bg-sand/50 p-4">
                      <div className="font-medium text-black">{action.product?.name || 'Unknown product'}</div>
                      <div className="text-xs text-brown-light">{action.action} • Qty {action.quantity ?? '-'}</div>
                      <div className="text-xs text-brown-light">{formatDate(action.timestamp)}</div>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}
