"use client";

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Products', href: '/products', icon: Package },
  { label: 'Categories', href: '/categories', icon: FolderTree },
  { label: 'Orders', href: '/orders', icon: ShoppingCart },
  { label: 'Users', href: '/users', icon: Users },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings },
];

const publicPaths = ['/login'];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const isPublicPath = publicPaths.includes(pathname);

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublicPath) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, isPublicPath, router]);

  React.useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (isPublicPath) {
    return <>{children}</>;
  }

  if (isLoading || !isAuthenticated) {
    return (
      <main className="min-h-screen bg-admin-bg flex items-center justify-center text-admin-text">
        <div className="rounded-xl border border-admin-border bg-admin-card px-6 py-5 shadow-sm">
          <div className="h-2 w-48 overflow-hidden rounded-full bg-admin-hover">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-admin-primary" />
          </div>
          <p className="mt-4 text-sm text-admin-muted">Checking admin session...</p>
        </div>
      </main>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-admin-bg text-admin-text">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-admin-border bg-admin-card transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-admin-border px-5">
          <Link href="/dashboard" className="font-semibold tracking-tight text-admin-text">
            Pandit Ji Admin
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 text-admin-muted hover:bg-admin-hover lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-admin-primary text-white'
                    : 'text-admin-muted hover:bg-admin-hover hover:text-admin-text'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-admin-border bg-admin-card/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 text-admin-muted hover:bg-admin-hover lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-sm font-semibold text-admin-text">Admin Panel</p>
              <p className="text-xs text-admin-muted">Production management console</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-admin-text">{user?.name || user?.email}</p>
              <p className="text-xs capitalize text-admin-muted">{user?.role}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg border border-admin-border px-3 py-2 text-sm text-admin-muted transition-colors hover:bg-admin-hover hover:text-admin-text"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;
