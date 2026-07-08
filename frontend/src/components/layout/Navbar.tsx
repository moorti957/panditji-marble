// frontend/src/components/layout/Navbar.tsx

'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  ChevronDown,
  Heart,
  Home,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Package,
  Phone,
  Search,
  Settings,
  ShoppingBag,
  User,
  X,
} from 'lucide-react';

import Image from 'next/image';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useCartStore } from '@/features/cart/store/cartStore';
import { useWishlistStore } from '@/features/wishlist/store/wishlistStore';
import logo from '../../assets/logo.jpg';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const navbarRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);

  const { totalItems } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { user, logout } = useAuthStore();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/categories', label: 'Categories' },
    
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  const megaMenuCategories = [
    { name: 'Ganesh Ji', href: '/products?category=ganesh', icon: '🐘' },
    { name: 'Radha Krishna', href: '/products?category=krishna', icon: '🪈' },
    { name: 'Hanuman Ji', href: '/products?category=hanuman', icon: '🙏' },
    { name: 'Shiv Ji', href: '/products?category=shiv', icon: '🔱' },
    { name: 'Ram Darbar', href: '/products?category=ram', icon: '🏹' },
    { name: 'Sai Baba', href: '/products?category=sai', icon: '✨' },
    { name: 'Kali Maa', href: '/products?category=kali', icon: '🌙' },
    { name: 'Lakshmi', href: '/products?category=lakshmi', icon: '💰' },
  ];

  const profileItems = [
    { href: '/profile', label: 'Dashboard', icon: <Home className="h-4 w-4" /> },
    { href: '/orders', label: 'My Orders', icon: <Package className="h-4 w-4" /> },
    { href: '/wishlist', label: 'Wishlist', icon: <Heart className="h-4 w-4" /> },
    { href: '/profile?tab=addresses', label: 'Addresses', icon: <MapPin className="h-4 w-4" /> },
    { href: '/profile?tab=settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
  ];

  const drawerQuickLinks = [
    { href: '/wishlist', label: 'Wishlist', icon: <Heart className="h-4 w-4" /> },
    { href: '/cart', label: 'Cart', icon: <ShoppingBag className="h-4 w-4" /> },
    { href: '/orders', label: 'Orders', icon: <Package className="h-4 w-4" /> },
    { href: '/profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
    { href: '/profile?tab=settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
    { href: '/profile?tab=addresses', label: 'Addresses', icon: <MapPin className="h-4 w-4" /> },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsMegaMenuOpen(false);
    setIsProfileDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node)) {
        setIsMegaMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      window.setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
    router.push('/');
  };

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/917240364772', '_blank');
  };

  const handleCallClick = () => {
    window.location.href = 'tel:+917240364772';
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleNavItemClick = () => {
    closeMobileMenu();
  };

  return (
    <>
      <header
        ref={navbarRef}
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'border-b border-gold/10 bg-white/80 shadow-lg backdrop-blur-xl dark:bg-brown-dark/90'
            : 'border-b border-gold/5 bg-white/60 backdrop-blur-md dark:bg-brown-dark/70'
        }`}
      >
        <div className="container">
          <div className="hidden h-16 items-center justify-between md:h-20 lg:flex">
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <Image
                src={logo}
                alt="Pandit Ji Marble Murti Art Logo"
                className="h-10 w-10 object-contain"
                width={40}
                height={40}
              />
              <div className="font-cinzel text-lg font-bold md:text-xl">
                <span className="text-brown dark:text-ivory">pandit ji Marble </span>
                <span className="text-gold-dark"> Murti art</span>
              </div>
            </Link>

            <nav className="flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${pathname === link.href
                    ? 'text-gold-dark dark:text-gold'
                    : 'text-brown-light hover:text-gold-dark dark:text-ivory/70 dark:hover:text-gold'}`}
                >
                  {link.label}
                  {pathname === link.href && (
                    <motion.span
                      layoutId="navbar-active"
                      className="absolute bottom-0 left-1/2 h-0.5 w-1/2 -translate-x-1/2 rounded-full bg-gold"
                      transition={{ type: 'spring', duration: 0.5 }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1 md:gap-2">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="rounded-full p-2 text-brown-light transition-colors hover:bg-gold/10 dark:text-ivory/70"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>

              <button
                onClick={handleWhatsAppClick}
                className="hidden items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-600 md:flex"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="hidden lg:inline">WhatsApp</span>
              </button>

              <button
                onClick={handleCallClick}
                className="hidden items-center gap-1.5 rounded-full bg-maroon px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-maroon-dark md:flex"
                aria-label="Call"
              >
                <Phone className="h-4 w-4" />
                <span className="hidden lg:inline">Call</span>
              </button>

              <Link
                href="/wishlist"
                className="relative rounded-full p-2 text-brown-light transition-colors hover:bg-gold/10 dark:text-ivory/70"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              <Link
                href="/cart"
                className="relative rounded-full p-2 text-brown-light transition-colors hover:bg-gold/10 dark:text-ivory/70"
                aria-label="Cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-white">
                    {totalItems}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-1.5 rounded-full p-1.5 transition-colors hover:bg-gold/10"
                    aria-label="Profile"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 text-sm font-medium text-brown dark:text-ivory">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <ChevronDown className={`h-4 w-4 text-brown-light transition-transform dark:text-ivory/70 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-gold/10 bg-white shadow-xl dark:bg-brown-dark"
                      >
                        <div className="border-b border-gold/10 p-4">
                          <p className="font-medium text-brown dark:text-ivory">{user.name}</p>
                          <p className="truncate text-xs text-brown-light dark:text-ivory/60">{user.email}</p>
                        </div>
                        <div className="p-1">
                          {profileItems.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-brown transition-colors hover:bg-gold/10 dark:text-ivory/80"
                              onClick={() => setIsProfileDropdownOpen(false)}
                            >
                              {item.icon}
                              {item.label}
                            </Link>
                          ))}
                        </div>
                        <div className="border-t border-gold/10 p-1">
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <LogOut className="h-4 w-4" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="rounded-full p-2 text-brown-light transition-colors hover:bg-gold/10 dark:text-ivory/70"
                  aria-label="Login"
                >
                  <User className="h-5 w-5" />
                </Link>
              )}
            </div>
          </div>

          <div className="flex h-16 items-center justify-between px-1 lg:hidden">
            <Link href="/" className="flex min-w-0 flex-1 items-center gap-2">
              <Image
                src={logo}
                alt="Pandit Ji Marble Murti Art Logo"
                className="h-9 w-9 shrink-0 object-contain"
                width={36}
                height={36}
              />
              <div className="min-w-0 truncate font-cinzel text-sm font-bold sm:text-base">
                <span className="text-brown dark:text-ivory">pandit ji Marble</span>
                <span className="ml-1 text-gold-dark">Murti art</span>
              </div>
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className="rounded-full p-2 text-brown-light transition-colors hover:bg-gold/10 dark:text-ivory/70"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="hidden overflow-hidden lg:block"
              >
                <form onSubmit={handleSearch} className="border-t border-gold/10 py-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-brown-light" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search for murtis, categories, and more..."
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      className="w-full rounded-xl border border-gold/20 bg-sand/50 py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-gold/30 dark:bg-brown/50 dark:text-ivory"
                    />
                    <button type="submit" className="btn-gold absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 text-sm">
                      Search
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={closeMobileMenu}
            />
            <motion.aside
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              className="fixed left-0 top-0 z-50 flex h-screen w-[85vw] max-w-[360px] flex-col overflow-y-auto border-r border-gold/10 bg-white/95 shadow-2xl backdrop-blur-xl dark:bg-brown-dark/95 lg:hidden"
            >
              <div className="border-b border-gold/10 p-4">
                <div className="flex items-center justify-between">
                  <Link href="/" className="flex items-center gap-2" onClick={handleNavItemClick}>
                    <Image
                      src={logo}
                      alt="Pandit Ji Marble Murti Art Logo"
                      className="h-10 w-10 object-contain"
                      width={40}
                      height={40}
                    />
                    <div className="font-cinzel text-base font-bold">
                      <span className="text-brown dark:text-ivory">pandit ji Marble</span>
                      <span className="ml-1 text-gold-dark">Murti art</span>
                    </div>
                  </Link>
                  <button onClick={closeMobileMenu} className="rounded-full p-2 text-brown-light transition-colors hover:bg-gold/10 dark:text-ivory/70" aria-label="Close menu">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4 p-4">
                <form onSubmit={handleSearch} className="w-full">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brown-light" />
                    <input
                      type="text"
                      placeholder="Search products"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      className="w-full rounded-xl border border-gold/20 bg-sand/60 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 dark:bg-brown/60 dark:text-ivory"
                    />
                  </div>
                </form>

                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-brown-light dark:text-ivory/50">
                    Navigation
                  </p>
                  <div className="space-y-1">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={handleNavItemClick}
                        className={`flex items-center rounded-xl px-3 py-2.5 text-sm transition-colors ${pathname === link.href
                          ? 'bg-gold/10 text-gold-dark dark:text-gold'
                          : 'text-brown hover:bg-gold/10 dark:text-ivory/80'}`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-brown-light dark:text-ivory/50">
                    Quick Categories
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {megaMenuCategories.map((category) => (
                      <Link
                        key={category.name}
                        href={category.href}
                        onClick={handleNavItemClick}
                        className="flex items-center gap-2 rounded-xl border border-gold/10 bg-white/70 px-2.5 py-2 text-sm text-brown transition-colors hover:bg-gold/10 dark:bg-brown/50 dark:text-ivory/80"
                      >
                        <span>{category.icon}</span>
                        <span className="truncate">{category.name}</span>
                      </Link>
                    ))}
                    <Link
                      href="/categories"
                      onClick={handleNavItemClick}
                      className="col-span-2 rounded-xl bg-gold/10 px-3 py-2.5 text-center text-sm font-medium text-gold-dark transition-colors hover:bg-gold/20 dark:text-gold"
                    >
                      View All Categories →
                    </Link>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-brown-light dark:text-ivory/50">
                    Quick Access
                  </p>
                  <div className="space-y-1">
                    {drawerQuickLinks.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={handleNavItemClick}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-brown transition-colors hover:bg-gold/10 dark:text-ivory/80"
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      handleWhatsAppClick();
                      closeMobileMenu();
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-600"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </button>
                  <button
                    onClick={() => {
                      handleCallClick();
                      closeMobileMenu();
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl bg-maroon px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-maroon-dark"
                  >
                    <Phone className="h-4 w-4" />
                    Call Now
                  </button>
                </div>

                {!user ? (
                  <div className="flex gap-2 border-t border-gold/10 pt-3">
                    <Link href="/login" onClick={handleNavItemClick} className="flex-1 rounded-xl bg-gold px-3 py-2.5 text-center text-sm font-medium text-brown transition-colors hover:bg-gold-dark">
                      Login
                    </Link>
                    <Link href="/register" onClick={handleNavItemClick} className="flex-1 rounded-xl border border-gold/30 px-3 py-2.5 text-center text-sm font-medium text-brown transition-colors hover:bg-gold/10 dark:text-ivory">
                      Register
                    </Link>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-gold/10 bg-gold/5 p-3">
                    <p className="text-sm font-semibold text-brown dark:text-ivory">{user.name}</p>
                    <p className="truncate text-xs text-brown-light dark:text-ivory/60">{user.email}</p>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="h-16 md:h-20" />
    </>
  );
}