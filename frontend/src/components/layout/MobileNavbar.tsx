// frontend/src/components/layout/MobileNavbar.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Menu,
  X,
  Search,
  ShoppingBag,
  Heart,
  User,
  Home,
  Package,
  Image,
  FileText,
  Phone,
  MessageCircle,
  ChevronRight,
  LogOut,
  Settings,
  MapPin,
  Award,
  Moon,
  Sun,
  Sparkles,
  TrendingUp,
  Star,
  Clock,
} from 'lucide-react';

import { useCartStore } from '@/features/cart/store/cartStore';
import { useWishlistStore } from '@/features/wishlist/store/wishlistStore';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// ============================================================
// MobileNavbar Component
// ============================================================
export default function MobileNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Store hooks
  const { totalItems } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  // Navigation links
  const mainNavLinks = [
    { href: '/', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { href: '/products', label: 'Products', icon: <Package className="w-5 h-5" /> },
    { href: '/categories', label: 'Categories', icon: <Sparkles className="w-5 h-5" /> },
    { href: '/gallery', label: 'Gallery', icon: <Image className="w-5 h-5" /> },
    { href: '/blogs', label: 'Blogs', icon: <FileText className="w-5 h-5" /> },
  ];

  // Quick categories
  const quickCategories = [
    { name: 'Ganesh Ji', href: '/products?category=ganesh', icon: '🐘' },
    { name: 'Radha Krishna', href: '/products?category=krishna', icon: '🪈' },
    { name: 'Shiv Ji', href: '/products?category=shiv', icon: '🔱' },
    { name: 'Hanuman Ji', href: '/products?category=hanuman', icon: '🙏' },
    { name: 'Ram Darbar', href: '/products?category=ram', icon: '🏹' },
    { name: 'Durga Maa', href: '/products?category=durga', icon: '⚔️' },
  ];

  // Profile links (when logged in)
  const profileLinks = [
    { href: '/profile', label: 'Dashboard', icon: <Home className="w-4 h-4" /> },
    { href: '/orders', label: 'My Orders', icon: <Package className="w-4 h-4" /> },
    { href: '/wishlist', label: 'Wishlist', icon: <Heart className="w-4 h-4" /> },
    { href: '/profile?tab=addresses', label: 'Addresses', icon: <MapPin className="w-4 h-4" /> },
    { href: '/profile?tab=settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
      setIsOpen(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    setIsOpen(false);
    router.push('/');
  };

  // WhatsApp click
  const handleWhatsAppClick = () => {
    window.open('https://wa.me/917240364772', '_blank');
    setIsOpen(false);
  };

  // Call click
  const handleCallClick = () => {
    window.location.href = 'tel:+917240364772';
    setIsOpen(false);
  };

  // Menu item animation variants
  const menuVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: 'easeOut',
      },
    }),
  };

  // If not mobile, don't render the mobile navbar (or you can hide it with CSS)
  if (!isMobile) {
    return null;
  }

  return (
    <>
      {/* Mobile Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 dark:bg-brown-dark/90 backdrop-blur-xl shadow-lg border-b border-gold/10'
            : 'bg-white/70 dark:bg-brown-dark/70 backdrop-blur-md border-b border-gold/5'
        }`}
      >
        <div className="flex items-center justify-between px-4 h-14">
          {/* Menu Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-full hover:bg-gold/10 transition-colors text-brown-light dark:text-ivory/70"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🕉️</span>
            <div className="font-cinzel text-base font-bold">
              <span className="text-brown dark:text-ivory">Pandit Ji</span>
              <span className="text-gold-dark"> Murti</span>
            </div>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 rounded-full hover:bg-gold/10 transition-colors text-brown-light dark:text-ivory/70"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gold/10 transition-colors text-brown-light dark:text-ivory/70"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative p-2 rounded-full hover:bg-gold/10 transition-colors text-brown-light dark:text-ivory/70"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 rounded-full hover:bg-gold/10 transition-colors text-brown-light dark:text-ivory/70"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gold text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Search Bar (expanded) */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden px-4 pb-3"
            >
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-light" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search for murtis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-sand/50 dark:bg-brown/50 rounded-xl border border-gold/20 focus:outline-none focus:ring-2 focus:ring-gold/30 dark:text-ivory text-sm"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 btn-gold px-3 py-1 text-xs"
                >
                  Search
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 z-50 w-[85%] max-w-sm h-full bg-white dark:bg-brown-dark shadow-2xl overflow-y-auto"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gold/10 dark:border-gold/5">
                  <div className="font-cinzel text-lg font-bold">
                    <span className="text-brown dark:text-ivory">Pandit Ji</span>
                    <span className="text-gold-dark"> Murti</span>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full hover:bg-gold/10 transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5 text-brown-light dark:text-ivory/70" />
                  </button>
                </div>

                {/* User Info (if logged in) */}
                {user && (
                  <div className="p-4 border-b border-gold/10 dark:border-gold/5">
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
                          <span className="text-[10px] text-brown-light dark:text-ivory/50">Devotee</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Navigation */}
                <nav className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-1">
                    {mainNavLinks.map((link, index) => (
                      <motion.div
                        key={link.href}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        variants={menuVariants}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                            pathname === link.href
                              ? 'bg-gold/10 text-gold-dark dark:bg-gold/20 dark:text-gold'
                              : 'text-brown-light dark:text-ivory/70 hover:bg-gold/5 hover:text-brown dark:hover:text-ivory'
                          }`}
                        >
                          {link.icon}
                          <span className="font-medium">{link.label}</span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  {/* Quick Categories */}
                  <div className="mt-6">
                    <p className="text-xs uppercase tracking-wider text-brown-light dark:text-ivory/50 font-semibold mb-3 px-4">
                      Quick Categories
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {quickCategories.map((cat, index) => (
                        <motion.div
                          key={cat.name}
                          custom={index + mainNavLinks.length}
                          initial="hidden"
                          animate="visible"
                          variants={menuVariants}
                        >
                          <Link
                            href={cat.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-gold/5 transition-colors text-sm text-brown-light dark:text-ivory/70"
                          >
                            <span>{cat.icon}</span>
                            <span>{cat.name}</span>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                    <Link
                      href="/categories"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-1 mt-2 px-4 py-2.5 rounded-xl bg-gold/10 text-gold-dark dark:text-gold text-sm font-medium hover:bg-gold/20 transition-colors"
                    >
                      View All Categories
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>

                  {/* Profile Links (when logged in) */}
                  {user && (
                    <div className="mt-6 pt-4 border-t border-gold/10 dark:border-gold/5">
                      <p className="text-xs uppercase tracking-wider text-brown-light dark:text-ivory/50 font-semibold mb-2 px-4">
                        Account
                      </p>
                      {profileLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gold/5 transition-colors text-sm text-brown-light dark:text-ivory/70"
                        >
                          {link.icon}
                          <span>{link.label}</span>
                        </Link>
                      ))}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm text-red-500 mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}

                  {/* Auth buttons (when not logged in) */}
                  {!user && (
                    <div className="mt-6 pt-4 border-t border-gold/10 dark:border-gold/5 space-y-3">
                      <Link
                        href="/login"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center gap-2 w-full btn-gold py-3 text-sm"
                      >
                        <User className="w-4 h-4" />
                        Login
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center gap-2 w-full btn-outline-gold py-3 text-sm"
                      >
                        Create Account
                      </Link>
                    </div>
                  )}
                </nav>

                {/* Quick Actions Footer */}
                <div className="p-4 border-t border-gold/10 dark:border-gold/5 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleWhatsAppClick}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors text-sm font-medium"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </button>
                    <button
                      onClick={handleCallClick}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-maroon text-white rounded-xl hover:bg-maroon-dark transition-colors text-sm font-medium"
                    >
                      <Phone className="w-4 h-4" />
                      Call Now
                    </button>
                  </div>
                  <div className="text-center text-xs text-brown-light/50 dark:text-ivory/30">
                    🕉️ Bringing divinity to your home
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content from hiding behind navbar */}
      <div className="h-14" />
    </>
  );
}