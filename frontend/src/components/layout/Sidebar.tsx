// frontend/src/components/layout/Sidebar.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  ShoppingBag,
  Heart,
  MapPin,
  Settings,
  LogOut,
  Package,
  Users,
  BarChart3,
  FileText,
  Image,
  Tag,
  Bell,
  Menu,
  X,
  ChevronRight,
  User,
  Award,
  Calendar,
  MessageCircle,
} from 'lucide-react';

import { useAuthStore } from '@/features/auth/store/authStore';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// ============================================================
// Types
// ============================================================
export interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  subItems?: SidebarItem[];
}

export interface SidebarProps {
  items: SidebarItem[];
  isOpen?: boolean;
  onClose?: () => void;
  onItemClick?: (item: SidebarItem) => void;
  className?: string;
  variant?: 'user' | 'admin';
  footerItems?: SidebarItem[];
}

// ============================================================
// Sidebar Component
// ============================================================
export function Sidebar({
  items,
  isOpen = false,
  onClose,
  onItemClick,
  className = '',
  variant = 'user',
  footerItems,
}: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-expand items based on current path
  useEffect(() => {
    if (pathname) {
      const expanded = new Set<string>();
      items.forEach((item) => {
        if (pathname.startsWith(item.href) || pathname === item.href) {
          expanded.add(item.id);
        }
        if (item.subItems) {
          item.subItems.forEach((sub) => {
            if (pathname.startsWith(sub.href) || pathname === sub.href) {
              expanded.add(item.id);
            }
          });
        }
      });
      setExpandedItems(expanded);
    }
  }, [pathname, items]);

  // Toggle sub-items expansion
  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  // Handle item click
  const handleItemClick = (item: SidebarItem) => {
    if (onItemClick) {
      onItemClick(item);
    }
    if (isMobile && onClose) {
      onClose();
    }
  };

  // Check if item is active
  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href) || false;
  };

  // Render sidebar item
  const renderItem = (item: SidebarItem, depth = 0) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const active = isActive(item.href);

    return (
      <div key={item.id} className="w-full">
        <Link
          href={item.href}
          onClick={(e) => {
            if (hasSubItems) {
              e.preventDefault();
              toggleExpand(item.id);
            } else {
              handleItemClick(item);
            }
          }}
          className={`
            flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200
            ${depth > 0 ? 'ml-6 text-sm' : 'text-sm font-medium'}
            ${active 
              ? 'bg-gold/10 text-gold-dark dark:bg-gold/20 dark:text-gold' 
              : 'text-brown-light dark:text-ivory/70 hover:bg-gold/5 hover:text-brown dark:hover:text-ivory'}
          `}
        >
          <span className="shrink-0">{item.icon}</span>
          <span className="flex-1 truncate">{item.label}</span>
          {hasSubItems && (
            <span className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
              <ChevronRight className="w-4 h-4" />
            </span>
          )}
          {item.badge !== undefined && item.badge > 0 && (
            <span className="bg-gold text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
              {item.badge}
            </span>
          )}
        </Link>

        <AnimatePresence>
          {hasSubItems && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="py-1">
                {item.subItems!.map((sub) => renderItem(sub, depth + 1))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Render footer items (like logout, settings)
  const renderFooterItems = () => {
    if (!footerItems || footerItems.length === 0) return null;
    return (
      <div className="mt-auto pt-4 border-t border-gold/10">
        {footerItems.map((item) => (
          <div key={item.id} className="w-full">
            <button
              onClick={() => {
                if (item.id === 'logout') {
                  logout();
                  if (isMobile && onClose) onClose();
                } else {
                  handleItemClick(item);
                }
              }}
              className={`
                flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium
                text-brown-light dark:text-ivory/70 hover:bg-gold/5 hover:text-brown dark:hover:text-ivory
                ${item.id === 'logout' ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' : ''}
              `}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="flex-1 truncate">{item.label}</span>
            </button>
          </div>
        ))}
      </div>
    );
  };

  // Render user info at top
  const renderUserInfo = () => {
    if (!user) return null;
    return (
      <div className="pb-6 mb-4 border-b border-gold/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold-dark text-xl font-cinzel font-bold">
            {user.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-brown dark:text-ivory truncate">
              {user.name || 'Devotee'}
            </p>
            <p className="text-xs text-brown-light dark:text-ivory/50 truncate">
              {user.email || ''}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <Award className="w-3 h-3 text-gold" />
              <span className="text-[10px] text-brown-light dark:text-ivory/50">
                {variant === 'admin' ? 'Admin' : 'Devotee'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Sidebar content
  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* User info */}
      {renderUserInfo()}

      {/* Navigation items */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        {items.map((item) => renderItem(item))}
      </nav>

      {/* Footer items */}
      {renderFooterItems()}
    </div>
  );

  // If mounted and not mobile, render as fixed sidebar
  if (isMounted && !isMobile) {
    return (
      <aside className={`
        w-64 flex-shrink-0 h-full bg-white dark:bg-brown-dark 
        border-r border-gold/10 dark:border-gold/5
        ${className}
      `}>
        <div className="p-4 h-full overflow-y-auto">
          {sidebarContent}
        </div>
      </aside>
    );
  }

  // Mobile: render as drawer with overlay
  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed top-0 left-0 z-50 w-80 h-full bg-white dark:bg-brown-dark shadow-2xl border-r border-gold/10"
          >
            <div className="flex flex-col h-full">
              {/* Header with close button */}
              <div className="flex items-center justify-between p-4 border-b border-gold/10">
                <div className="font-cinzel text-xl font-bold">
                  <span className="text-brown dark:text-ivory">Pandit Ji</span>
                  <span className="text-gold-dark"> Murti</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gold/10 transition-colors"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5 text-brown-light dark:text-ivory/70" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 p-4 overflow-y-auto">
                {sidebarContent}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================
// Pre-defined items for common use cases
// ============================================================

// User dashboard items
export const userSidebarItems: SidebarItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    href: '/profile',
    icon: <Home className="w-5 h-5" />,
  },
  {
    id: 'orders',
    label: 'My Orders',
    href: '/orders',
    icon: <Package className="w-5 h-5" />,
  },
  {
    id: 'wishlist',
    label: 'Wishlist',
    href: '/wishlist',
    icon: <Heart className="w-5 h-5" />,
  },
  {
    id: 'addresses',
    label: 'Addresses',
    href: '/profile?tab=addresses',
    icon: <MapPin className="w-5 h-5" />,
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/profile?tab=settings',
    icon: <Settings className="w-5 h-5" />,
  },
];

// Admin dashboard items
export const adminSidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/admin',
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    id: 'orders',
    label: 'Orders',
    href: '/admin/orders',
    icon: <ShoppingBag className="w-5 h-5" />,
    badge: 12,
  },
  {
    id: 'products',
    label: 'Products',
    href: '/admin/products',
    icon: <Package className="w-5 h-5" />,
    subItems: [
      { id: 'products-list', label: 'All Products', href: '/admin/products', icon: <Package className="w-4 h-4" /> },
      { id: 'products-add', label: 'Add New', href: '/admin/products/add', icon: <Package className="w-4 h-4" /> },
      { id: 'products-categories', label: 'Categories', href: '/admin/categories', icon: <Tag className="w-4 h-4" /> },
    ],
  },
  {
    id: 'customers',
    label: 'Customers',
    href: '/admin/customers',
    icon: <Users className="w-5 h-5" />,
  },
  {
    id: 'gallery',
    label: 'Gallery',
    href: '/admin/gallery',
    icon: <Image className="w-5 h-5" />,
  },
  {
    id: 'blogs',
    label: 'Blogs',
    href: '/admin/blogs',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/admin/settings',
    icon: <Settings className="w-5 h-5" />,
  },
];

// Footer items (logout, support, etc.)
export const footerItems: SidebarItem[] = [
  {
    id: 'support',
    label: 'Support',
    href: '/contact',
    icon: <MessageCircle className="w-5 h-5" />,
  },
  {
    id: 'logout',
    label: 'Logout',
    href: '#',
    icon: <LogOut className="w-5 h-5" />,
  },
];

// ============================================================
// Example usage:
// 
// In your profile/layout:
// const [sidebarOpen, setSidebarOpen] = useState(false);
// 
// <Sidebar
//   items={userSidebarItems}
//   footerItems={footerItems}
//   isOpen={sidebarOpen}
//   onClose={() => setSidebarOpen(false)}
//   variant="user"
// />
// 
// For desktop, it will render as a fixed sidebar without overlay.
// ============================================================