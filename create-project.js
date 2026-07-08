const fs = require("fs");
const path = require("path");

// ============================================================
// 1. FOLDERS (complete structure)
// ============================================================
const folders = [
  // Frontend
  "frontend",
  "frontend/src",
  "frontend/src/app",
  "frontend/src/app/(auth)",
  "frontend/src/app/(auth)/login",
  "frontend/src/app/(auth)/register",
  "frontend/src/app/products",
  "frontend/src/app/products/[slug]",
  "frontend/src/app/categories",
  "frontend/src/app/gallery",
  "frontend/src/app/blogs",
  "frontend/src/app/blogs/[slug]",
  "frontend/src/app/about",
  "frontend/src/app/contact",
  "frontend/src/app/cart",
  "frontend/src/app/checkout",
  "frontend/src/app/wishlist",
  "frontend/src/app/profile",
  "frontend/src/app/orders",
  "frontend/src/app/faq",
  "frontend/src/app/privacy-policy",
  "frontend/src/app/refund-policy",
  "frontend/src/app/shipping-policy",
  "frontend/src/app/terms",
  "frontend/src/app/track-order",
  "frontend/src/components",
  "frontend/src/components/layout",
  "frontend/src/components/hero",
  "frontend/src/components/cards",
  "frontend/src/components/sections",
  "frontend/src/components/ui",
  "frontend/src/components/modals",
  "frontend/src/components/animations",
  "frontend/src/components/forms",
  "frontend/src/features",
  "frontend/src/features/home",
  "frontend/src/features/home/hooks",
  "frontend/src/features/products",
  "frontend/src/features/products/api",
  "frontend/src/features/products/hooks",
  "frontend/src/features/products/types",
  "frontend/src/features/cart",
  "frontend/src/features/cart/store",
  "frontend/src/features/cart/hooks",
  "frontend/src/features/wishlist",
  "frontend/src/features/wishlist/store",
  "frontend/src/features/auth",
  "frontend/src/features/auth/api",
  "frontend/src/features/auth/hooks",
  "frontend/src/features/auth/store",
  "frontend/src/hooks",
  "frontend/src/services",
  "frontend/src/store",
  "frontend/src/providers",
  "frontend/src/utils",
  "frontend/src/types",
  "frontend/src/constants",
  "frontend/src/styles",
  "frontend/src/assets",

  // Admin
  "admin",
  "admin/src",
  "admin/src/app",
  "admin/src/app/dashboard",
  "admin/src/app/products",
  "admin/src/app/products/[id]",
  "admin/src/app/categories",
  "admin/src/app/collections",
  "admin/src/app/blogs",
  "admin/src/app/gallery",
  "admin/src/app/banners",
  "admin/src/app/orders",
  "admin/src/app/users",
  "admin/src/app/customers",
  "admin/src/app/coupons",
  "admin/src/app/reviews",
  "admin/src/app/analytics",
  "admin/src/app/settings",
  "admin/src/app/seo",
  "admin/src/app/pages",
  "admin/src/app/notifications",
  "admin/src/app/login",
  "admin/src/components",
  "admin/src/components/dashboard",
  "admin/src/components/forms",
  "admin/src/components/tables",
  "admin/src/components/charts",
  "admin/src/components/upload",
  "admin/src/components/dialogs",
  "admin/src/components/editors",
  "admin/src/components/common",
  "admin/src/modules",
  "admin/src/modules/product",
  "admin/src/modules/category",
  "admin/src/modules/blog",
  "admin/src/modules/order",
  "admin/src/modules/user",
  "admin/src/hooks",
  "admin/src/services",
  "admin/src/store",
  "admin/src/utils",
  "admin/src/types",
  "admin/src/constants",

  // Backend
  "backend",
  "backend/src",
  "backend/src/config",
  "backend/src/database",
  "backend/src/routes",
  "backend/src/controllers",
  "backend/src/services",
  "backend/src/repositories",
  "backend/src/models",
  "backend/src/middlewares",
  "backend/src/validators",
  "backend/src/interfaces",
  "backend/src/types",
  "backend/src/helpers",
  "backend/src/utils",
  "backend/src/events",
  "backend/src/sockets",
  "backend/src/jobs",
  "backend/src/cron",
  "backend/src/uploads",
  "backend/src/docs",

  // Shared, docs, docker, nginx
  "shared",
  "shared/types",
  "shared/constants",
  "docs",
  "docker",
  "nginx",
  "scripts"
];

// ============================================================
// 2. FILES (complete with placeholder content)
// ============================================================
const files = {};

// -------- FRONTEND CONFIG --------
files["frontend/package.json"] = JSON.stringify({
  name: "panditji-frontend",
  version: "1.0.0",
  private: true,
  scripts: {
    dev: "next dev",
    build: "next build",
    start: "next start",
    lint: "next lint"
  },
  dependencies: {
    "@hookform/resolvers": "^3.3.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-slot": "^1.0.2",
    "@tanstack/react-query": "^5.17.19",
    "@tanstack/react-query-devtools": "^5.17.19",
    axios: "^1.6.2",
    "class-variance-authority": "^0.7.0",
    clsx: "^2.0.0",
    "framer-motion": "^10.16.16",
    gsap: "^3.12.5",
    lenis: "^1.1.12",
    "lucide-react": "^0.303.0",
    next: "15.0.0",
    react: "19.0.0-rc-4",
    "react-dom": "19.0.0-rc-4",
    "react-hook-form": "^7.48.2",
    "react-hot-toast": "^2.4.1",
    "react-icons": "^4.12.0",
    swiper: "^11.0.6",
    "tailwind-merge": "^2.1.0",
    "tailwindcss-animate": "^1.0.7",
    zod: "^3.22.4",
    zustand: "^4.4.7"
  },
  devDependencies: {
    "@types/node": "^20.10.5",
    "@types/react": "19.0.0-rc.0",
    "@types/react-dom": "19.0.0-rc.0",
    autoprefixer: "^10.4.16",
    eslint: "^8.56.0",
    "eslint-config-next": "15.0.0",
    postcss: "^8.4.32",
    tailwindcss: "^3.3.6",
    typescript: "^5.3.3"
  }
}, null, 2);

files["frontend/tsconfig.json"] = JSON.stringify({
  compilerOptions: {
    target: "ES2017",
    lib: ["dom", "dom.iterable", "esnext"],
    allowJs: true,
    skipLibCheck: true,
    strict: true,
    forceConsistentCasingInFileNames: true,
    noEmit: true,
    esModuleInterop: true,
    module: "esnext",
    moduleResolution: "node",
    resolveJsonModule: true,
    isolatedModules: true,
    jsx: "preserve",
    incremental: true,
    paths: { "@/*": ["./src/*"] }
  },
  include: ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  exclude: ["node_modules"]
}, null, 2);

files["frontend/next.config.js"] = `/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { domains: ['images.unsplash.com', 'res.cloudinary.com'] },
  reactStrictMode: true,
};
module.exports = nextConfig;`;

files["frontend/tailwind.config.js"] = `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gold: "#D4AF37",
        "gold-dark": "#B8962E",
        "gold-light": "#E8D5A3",
        maroon: "#7B1E1E",
        "maroon-dark": "#5C1616",
        ivory: "#FFFCF7",
        sand: "#F5EDDF",
        brown: "#6D4C41",
        "brown-light": "#8D6E63",
      },
      fontFamily: {
        cinzel: ["var(--font-cinzel)"],
        inter: ["var(--font-inter)"],
      },
      borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)" },
    },
  },
  plugins: [require("tailwindcss-animate")],
};`;

files["frontend/postcss.config.js"] = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`;

files["frontend/.env.local"] = `NEXT_PUBLIC_API_URL=http://localhost:5000/api`;

// -------- FRONTEND SOURCE --------
files["frontend/src/app/layout.tsx"] = `import type { Metadata } from 'next';
import { Inter, Cinzel } from 'next/font/google';
import './globals.css';
import { ReactQueryProvider } from '@/providers/ReactQueryProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/modals/CartDrawer';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-cinzel' });

export const metadata: Metadata = {
  title: 'Pandit Ji Marble Murti Arts – Handcrafted Divine Sculptures',
  description: 'Handcrafted marble, brass, and wood murtis by master artisans in Jaipur.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={\`\${inter.variable} \${cinzel.variable}\`}>
      <body>
        <ReactQueryProvider>
          <ThemeProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <CartDrawer />
            <Toaster position="bottom-right" />
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}`;

files["frontend/src/app/page.tsx"] = `'use client';
import { useEffect } from 'react';
import Hero from '@/components/hero/Hero';
import FeaturedCategories from '@/components/sections/FeaturedCategories';
import FeaturedProducts from '@/components/sections/FeaturedProducts';
import Testimonials from '@/components/sections/Testimonials';
import Newsletter from '@/components/sections/Newsletter';
import FAQAccordion from '@/components/sections/FAQAccordion';
import StatsSection from '@/components/sections/StatsSection';
import WorkshopSection from '@/components/sections/WorkshopSection';
import { useHomeData } from '@/features/home/hooks/useHomeData';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import Lenis from 'lenis';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function HomePage() {
  const { data, isLoading } = useHomeData();

  useEffect(() => {
    const lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(lenis.raf);
    return () => { lenis.destroy(); gsap.ticker.remove(lenis.raf); };
  }, []);

  return (
    <>
      <Hero />
      <ScrollReveal><FeaturedCategories categories={data?.categories} /></ScrollReveal>
      <ScrollReveal><FeaturedProducts products={data?.featuredProducts} /></ScrollReveal>
      <StatsSection />
      <WorkshopSection />
      <Testimonials reviews={data?.reviews} />
      <FAQAccordion faqs={data?.faqs} />
      <Newsletter />
    </>
  );
}`;

files["frontend/src/app/globals.css"] = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --radius: 20px;
  }
  * {
    @apply border-border;
  }
  body {
    @apply bg-ivory text-brown;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}`;

files["frontend/src/app/loading.tsx"] = `export default function Loading() { return <div className="flex justify-center items-center min-h-screen">Loading...</div>; }`;
files["frontend/src/app/error.tsx"] = `'use client';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return <div className="flex flex-col items-center justify-center min-h-screen"><h1>Something went wrong</h1><button onClick={reset}>Try again</button></div>;
}`;
files["frontend/src/app/not-found.tsx"] = `export default function NotFound() { return <div className="flex items-center justify-center min-h-screen">404 - Page Not Found</div>; }`;

// -------- FRONTEND PAGES (auth, products, etc.) --------
const frontendPages = [
  "products", "products/[slug]", "categories", "gallery", "blogs", "blogs/[slug]",
  "about", "contact", "cart", "checkout", "wishlist", "profile", "orders",
  "faq", "privacy-policy", "refund-policy", "shipping-policy", "terms", "track-order"
];
frontendPages.forEach(p => {
  const filePath = `frontend/src/app/${p}/page.tsx`;
  files[filePath] = `export default function ${p.replace(/[\/\[\]]/g,'_')}Page() { return <div className="container py-20">${p} page</div>; }`;
});
// auth pages
files["frontend/src/app/(auth)/login/page.tsx"] = `export default function LoginPage() { return <div className="container py-20">Login Page</div>; }`;
files["frontend/src/app/(auth)/register/page.tsx"] = `export default function RegisterPage() { return <div className="container py-20">Register Page</div>; }`;

// -------- FRONTEND COMPONENTS --------
files["frontend/src/components/layout/Navbar.tsx"] = `'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/features/cart/store/cartStore';
import { useAuthStore } from '@/features/auth/store/authStore';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { ShoppingBag, Heart, User, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { totalItems } = useCartStore();
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gold/10">
      <Container className="flex items-center justify-between h-16">
        <Link href="/" className="font-cinzel text-xl font-bold">Pandit Ji <span className="text-gold-dark">Murti</span></Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/products">Products</Link>
          <Link href="/categories">Categories</Link>
          <Link href="/gallery">Gallery</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <div className="flex items-center gap-4">
          <button className="relative" aria-label="Cart">
            <ShoppingBag />
            {totalItems > 0 && <span className="absolute -top-1 -right-1 bg-maroon text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{totalItems}</span>}
          </button>
          <button aria-label="Wishlist"><Heart /></button>
          {user ? <button aria-label="Profile"><User /></button> : <Link href="/login">Login</Link>}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>{isOpen ? <X /> : <Menu />}</button>
        </div>
      </Container>
      {isOpen && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="md:hidden bg-white p-4 border-t">
          <nav className="flex flex-col gap-3">
            <Link href="/products">Products</Link>
            <Link href="/categories">Categories</Link>
            <Link href="/gallery">Gallery</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </nav>
        </motion.div>
      )}
    </header>
  );
}`;

files["frontend/src/components/layout/Footer.tsx"] = `export default function Footer() {
  return (
    <footer className="bg-brown text-white/80 py-12">
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-8">
        <div><h4 className="font-cinzel text-lg">Pandit Ji Marble Murti Art</h4><p className="text-sm mt-2">Luxury marble and brass murtis handcrafted in Jaipur.</p></div>
        <div><h5>Quick Links</h5><ul className="text-sm space-y-1"><li><Link href="/about">About</Link></li><li><Link href="/products">Products</Link></li><li><Link href="/contact">Contact</Link></li></ul></div>
        <div><h5>Categories</h5><ul className="text-sm space-y-1"><li>Ganesh</li><li>Krishna</li><li>Shiva</li></ul></div>
        <div><h5>Contact</h5><ul className="text-sm space-y-1"><li>📞 +91 72403 64772</li><li>✉️ info@panditjimurti.com</li></ul></div>
      </div>
      <div className="container border-t border-white/10 mt-8 pt-4 text-center text-xs">© 2026 Pandit Ji Marble Murti Arts</div>
    </footer>
  );
}`;

// similarly add other components (Hero, ProductCard, etc.) – we'll add a few placeholders
const componentFiles = {
  "frontend/src/components/hero/Hero.tsx": `'use client';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
export default function Hero() { return <section className="min-h-screen flex items-center"><Container><h1 className="font-cinzel text-6xl">Hero</h1></Container></section>; }`,
  "frontend/src/components/cards/ProductCard.tsx": `'use client';
import { motion } from 'framer-motion';
import { Product } from '@/types';
export function ProductCard({ product }: { product: Product }) { return <div className="bg-white rounded-2xl shadow">{product.name}</div>; }`,
  "frontend/src/components/sections/FeaturedProducts.tsx": `import { ProductCard } from '@/components/cards/ProductCard';
export default function FeaturedProducts({ products }) { return <section className="py-16"><div className="container"><h2>Featured Products</h2><div className="grid grid-cols-4 gap-6">{products?.map(p => <ProductCard key={p.id} product={p} />)}</div></div></section>; }`,
  "frontend/src/components/ui/Container.tsx": `import { cn } from '@/lib/utils';
export function Container({ className, ...props }) { return <div className={cn('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8', className)} {...props} />; }`,
  "frontend/src/components/ui/Button.tsx": `import { cn } from '@/lib/utils';
export function Button({ className, ...props }) { return <button className={cn('px-4 py-2 rounded-full font-medium', className)} {...props} />; }`,
  "frontend/src/components/modals/CartDrawer.tsx": `'use client';
export default function CartDrawer() { return null; }`,
  "frontend/src/components/animations/ScrollReveal.tsx": `'use client';
import { motion } from 'framer-motion';
export function ScrollReveal({ children }) { return <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>{children}</motion.div>; }`,
  "frontend/src/components/animations/MagneticButton.tsx": `'use client';
import { useRef } from 'react';
export function MagneticButton({ children }) { const ref = useRef(); return <div ref={ref}>{children}</div>; }`,
};
Object.assign(files, componentFiles);

// -------- FRONTEND FEATURES --------
const featureFiles = {
  "frontend/src/features/home/hooks/useHomeData.ts": `import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';
export function useHomeData() { return useQuery({ queryKey: ['home'], queryFn: () => apiClient.get('/home') }); }`,
  "frontend/src/features/products/api/productsApi.ts": `import { apiClient } from '@/services/apiClient';
export const productsApi = { getAll: () => apiClient.get('/products'), getOne: (slug) => apiClient.get(\`/products/\${slug}\`) };`,
  "frontend/src/features/products/hooks/useProducts.ts": `import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api/productsApi';
export function useProducts() { return useQuery({ queryKey: ['products'], queryFn: productsApi.getAll }); }`,
  "frontend/src/features/products/types/product.types.ts": `export interface Product { id: string; name: string; slug: string; price: number; images: string[]; material: string; description: string; }`,
  "frontend/src/features/cart/store/cartStore.ts": `import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const useCartStore = create(persist((set) => ({ items: [], totalItems: 0, addItem: (p) => set((s) => ({ items: [...s.items, p], totalItems: s.totalItems + 1 })), }), { name: 'cart' }));`,
  "frontend/src/features/cart/hooks/useCart.ts": `import { useCartStore } from '../store/cartStore';
export function useCart() { return useCartStore(); }`,
  "frontend/src/features/auth/api/authApi.ts": `import { apiClient } from '@/services/apiClient';
export const authApi = { login: (data) => apiClient.post('/auth/login', data), register: (data) => apiClient.post('/auth/register', data) };`,
  "frontend/src/features/auth/hooks/useAuth.ts": `import { useAuthStore } from '../store/authStore';
export function useAuth() { return useAuthStore(); }`,
  "frontend/src/features/auth/store/authStore.ts": `import { create } from 'zustand';
export const useAuthStore = create((set) => ({ user: null, login: (user) => set({ user }), logout: () => set({ user: null }) }));`,
  "frontend/src/features/wishlist/store/wishlistStore.ts": `import { create } from 'zustand';
export const useWishlistStore = create((set) => ({ items: [], toggle: (id) => set((s) => ({ items: s.items.includes(id) ? s.items.filter(i => i !== id) : [...s.items, id] })) }));`,
};
Object.assign(files, featureFiles);

// -------- FRONTEND SERVICES, HOOKS, STORE, PROVIDERS, TYPES --------
files["frontend/src/services/apiClient.ts"] = `import axios from 'axios';
export const apiClient = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL, headers: { 'Content-Type': 'application/json' } });`;
files["frontend/src/services/product.service.ts"] = `import { apiClient } from './apiClient';
export const productService = { getAll: () => apiClient.get('/products'), getBySlug: (slug) => apiClient.get(\`/products/\${slug}\`) };`;
files["frontend/src/hooks/useScroll.ts"] = `import { useEffect } from 'react';
export function useScroll() { useEffect(() => { const handleScroll = () => {}; window.addEventListener('scroll', handleScroll); return () => window.removeEventListener('scroll', handleScroll); }, []); }`;
files["frontend/src/hooks/useMediaQuery.ts"] = `import { useState, useEffect } from 'react';
export function useMediaQuery(query) { const [matches, setMatches] = useState(false); useEffect(() => { const media = window.matchMedia(query); setMatches(media.matches); const listener = (e) => setMatches(e.matches); media.addEventListener('change', listener); return () => media.removeEventListener('change', listener); }, [query]); return matches; }`;
files["frontend/src/store/rootStore.ts"] = `export {};`;
files["frontend/src/providers/ReactQueryProvider.tsx"] = `'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
const queryClient = new QueryClient();
export function ReactQueryProvider({ children }) { return <QueryClientProvider client={queryClient}>{children}<ReactQueryDevtools /></QueryClientProvider>; }`;
files["frontend/src/providers/ThemeProvider.tsx"] = `'use client';
export function ThemeProvider({ children }) { return <>{children}</>; }`;
files["frontend/src/lib/utils.ts"] = `import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }`;
files["frontend/src/constants/colors.ts"] = `export const COLORS = { gold: '#D4AF37', maroon: '#7B1E1E' };`;
files["frontend/src/constants/routes.ts"] = `export const ROUTES = { home: '/', products: '/products' };`;
files["frontend/src/types/index.ts"] = `export interface Product { id: string; name: string; price: number; }`;
files["frontend/src/styles/globals.css"] = `@tailwind base; @tailwind components; @tailwind utilities;`;

// -------- ADMIN CONFIG --------
files["admin/package.json"] = JSON.stringify({
  name: "panditji-admin",
  version: "1.0.0",
  private: true,
  scripts: { dev: "next dev", build: "next build", start: "next start" },
  dependencies: { next: "15.0.0", react: "19.0.0-rc-4", "react-dom": "19.0.0-rc-4", axios: "^1.6.2", "@tanstack/react-query": "^5.17.19", zustand: "^4.4.7", "lucide-react": "^0.303.0" },
  devDependencies: { "@types/node": "^20.10.5", "@types/react": "19.0.0-rc.0", "@types/react-dom": "19.0.0-rc.0", typescript: "^5.3.3", tailwindcss: "^3.3.6", autoprefixer: "^10.4.16", postcss: "^8.4.32" }
}, null, 2);
files["admin/tsconfig.json"] = JSON.stringify({
  compilerOptions: { target: "ES2017", lib: ["dom", "dom.iterable", "esnext"], allowJs: true, skipLibCheck: true, strict: true, forceConsistentCasingInFileNames: true, noEmit: true, esModuleInterop: true, module: "esnext", moduleResolution: "node", resolveJsonModule: true, isolatedModules: true, jsx: "preserve", incremental: true, paths: { "@/*": ["./src/*"] } },
  include: ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  exclude: ["node_modules"]
}, null, 2);
files["admin/next.config.js"] = `/** @type {import('next').NextConfig} */ const nextConfig = { reactStrictMode: true }; module.exports = nextConfig;`;
files["admin/tailwind.config.js"] = `module.exports = { content: ["./src/**/*.{ts,tsx}"], theme: { extend: {} }, plugins: [] };`;
files["admin/postcss.config.js"] = `module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };`;

// -------- ADMIN SOURCE --------
files["admin/src/app/layout.tsx"] = `export default function RootLayout({ children }) { return <html><body>{children}</body></html>; }`;
files["admin/src/app/page.tsx"] = `export default function AdminDashboard() { return <h1>Admin Dashboard</h1>; }`;
files["admin/src/app/login/page.tsx"] = `export default function AdminLogin() { return <h1>Admin Login</h1>; }`;
files["admin/src/app/products/page.tsx"] = `export default function AdminProducts() { return <h1>Manage Products</h1>; }`;
files["admin/src/app/products/[id]/page.tsx"] = `export default function EditProduct() { return <h1>Edit Product</h1>; }`;
files["admin/src/app/categories/page.tsx"] = `export default function AdminCategories() { return <h1>Manage Categories</h1>; }`;
files["admin/src/app/orders/page.tsx"] = `export default function AdminOrders() { return <h1>Orders</h1>; }`;
files["admin/src/app/users/page.tsx"] = `export default function AdminUsers() { return <h1>Users</h1>; }`;
files["admin/src/app/settings/page.tsx"] = `export default function AdminSettings() { return <h1>Settings</h1>; }`;

// -------- BACKEND CONFIG --------
files["backend/package.json"] = JSON.stringify({
  name: "panditji-backend",
  version: "1.0.0",
  scripts: { dev: "nodemon src/server.ts", build: "tsc", start: "node dist/server.js" },
  dependencies: { express: "^4.18.2", mongoose: "^8.0.0", dotenv: "^16.3.1", cors: "^2.8.5", helmet: "^7.1.0", morgan: "^1.10.0", compression: "^1.7.4", jsonwebtoken: "^9.0.2", bcryptjs: "^2.4.3", multer: "^1.4.5", "express-rate-limit": "^7.1.5", cloudinary: "^1.41.0", nodemailer: "^6.9.7", "express-validator": "^7.0.1" },
  devDependencies: { "@types/express": "^4.17.21", "@types/node": "^20.10.5", "typescript": "^5.3.3", nodemon: "^3.0.2", "ts-node": "^10.9.2" }
}, null, 2);
files["backend/tsconfig.json"] = JSON.stringify({
  compilerOptions: { target: "ES2020", module: "commonjs", strict: true, esModuleInterop: true, skipLibCheck: true, forceConsistentCasingInFileNames: true, outDir: "./dist", rootDir: "./src" },
  include: ["src/**/*"],
  exclude: ["node_modules"]
}, null, 2);
files["backend/.env"] = `PORT=5000\nMONGODB_URI=mongodb://localhost:27017/panditji\nJWT_SECRET=your_secret\nCLOUDINARY_CLOUD_NAME=\nCLOUDINARY_API_KEY=\nCLOUDINARY_API_SECRET=`;

// -------- BACKEND SOURCE --------
files["backend/src/server.ts"] = `import app from './app';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));`;

files["backend/src/app.ts"] = `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { connectDB } from './database';
import productRoutes from './routes/product.routes';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import categoryRoutes from './routes/category.routes';
import orderRoutes from './routes/order.routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();
connectDB();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(compression());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);

app.use(errorHandler);

export default app;`;

files["backend/src/database/index.ts"] = `import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/panditji');
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};`;

// -------- BACKEND ROUTES --------
const routeFiles = {
  "backend/src/routes/auth.routes.ts": `import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
const router = Router();
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
export default router;`,
  "backend/src/routes/product.routes.ts": `import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
const router = Router();
router.get('/', ProductController.getAll);
router.get('/:slug', ProductController.getOne);
router.post('/', ProductController.create);
router.put('/:id', ProductController.update);
router.delete('/:id', ProductController.delete);
export default router;`,
  "backend/src/routes/category.routes.ts": `import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController';
const router = Router();
router.get('/', CategoryController.getAll);
router.post('/', CategoryController.create);
export default router;`,
  "backend/src/routes/order.routes.ts": `import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';
const router = Router();
router.get('/', OrderController.getAll);
router.post('/', OrderController.create);
export default router;`,
  "backend/src/routes/user.routes.ts": `import { Router } from 'express';
import { UserController } from '../controllers/UserController';
const router = Router();
router.get('/', UserController.getAll);
router.get('/:id', UserController.getOne);
export default router;`,
  "backend/src/routes/upload.routes.ts": `import { Router } from 'express';
import { UploadController } from '../controllers/UploadController';
const router = Router();
router.post('/', UploadController.upload);
export default router;`,
  "backend/src/routes/dashboard.routes.ts": `import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
const router = Router();
router.get('/stats', DashboardController.getStats);
export default router;`,
};
Object.assign(files, routeFiles);

// -------- BACKEND CONTROLLERS --------
const controllerFiles = {
  "backend/src/controllers/AuthController.ts": `import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
export class AuthController {
  static async register(req: Request, res: Response) { res.json(await AuthService.register(req.body)); }
  static async login(req: Request, res: Response) { res.json(await AuthService.login(req.body)); }
}`,
  "backend/src/controllers/ProductController.ts": `import { Request, Response } from 'express';
import { ProductService } from '../services/ProductService';
export class ProductController {
  static async getAll(req: Request, res: Response) { res.json(await ProductService.getAll()); }
  static async getOne(req: Request, res: Response) { res.json(await ProductService.getOne(req.params.slug)); }
  static async create(req: Request, res: Response) { res.json(await ProductService.create(req.body)); }
  static async update(req: Request, res: Response) { res.json(await ProductService.update(req.params.id, req.body)); }
  static async delete(req: Request, res: Response) { res.json(await ProductService.delete(req.params.id)); }
}`,
  "backend/src/controllers/CategoryController.ts": `import { Request, Response } from 'express';
import { CategoryService } from '../services/CategoryService';
export class CategoryController {
  static async getAll(req: Request, res: Response) { res.json(await CategoryService.getAll()); }
  static async create(req: Request, res: Response) { res.json(await CategoryService.create(req.body)); }
}`,
  "backend/src/controllers/OrderController.ts": `import { Request, Response } from 'express';
import { OrderService } from '../services/OrderService';
export class OrderController {
  static async getAll(req: Request, res: Response) { res.json(await OrderService.getAll()); }
  static async create(req: Request, res: Response) { res.json(await OrderService.create(req.body)); }
}`,
  "backend/src/controllers/UserController.ts": `import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
export class UserController {
  static async getAll(req: Request, res: Response) { res.json(await UserService.getAll()); }
  static async getOne(req: Request, res: Response) { res.json(await UserService.getOne(req.params.id)); }
}`,
  "backend/src/controllers/DashboardController.ts": `import { Request, Response } from 'express';
import { DashboardService } from '../services/DashboardService';
export class DashboardController {
  static async getStats(req: Request, res: Response) { res.json(await DashboardService.getStats()); }
}`,
};
Object.assign(files, controllerFiles);

// -------- BACKEND SERVICES --------
const serviceFiles = {
  "backend/src/services/AuthService.ts": `export class AuthService { static async register(data) { return data; } static async login(data) { return { token: 'fake' }; } }`,
  "backend/src/services/ProductService.ts": `export class ProductService { static async getAll() { return []; } static async getOne(slug) { return {}; } static async create(data) { return data; } static async update(id, data) { return data; } static async delete(id) { return {}; } }`,
  "backend/src/services/CategoryService.ts": `export class CategoryService { static async getAll() { return []; } static async create(data) { return data; } }`,
  "backend/src/services/OrderService.ts": `export class OrderService { static async getAll() { return []; } static async create(data) { return data; } }`,
  "backend/src/services/UserService.ts": `export class UserService { static async getAll() { return []; } static async getOne(id) { return {}; } }`,
  "backend/src/services/DashboardService.ts": `export class DashboardService { static async getStats() { return { totalOrders: 0 }; } }`,
};
Object.assign(files, serviceFiles);

// -------- BACKEND MODELS --------
const modelFiles = {
  "backend/src/models/User.ts": `import { Schema, model } from 'mongoose';
const UserSchema = new Schema({ name: String, email: { type: String, unique: true }, password: String, role: { type: String, default: 'user' } });
export const User = model('User', UserSchema);`,
  "backend/src/models/Product.ts": `import { Schema, model } from 'mongoose';
const ProductSchema = new Schema({ name: String, slug: { type: String, unique: true }, description: String, price: Number, images: [String], material: String, category: { type: Schema.Types.ObjectId, ref: 'Category' } }, { timestamps: true });
export const Product = model('Product', ProductSchema);`,
  "backend/src/models/Category.ts": `import { Schema, model } from 'mongoose';
const CategorySchema = new Schema({ name: String, slug: { type: String, unique: true }, icon: String });
export const Category = model('Category', CategorySchema);`,
  "backend/src/models/Order.ts": `import { Schema, model } from 'mongoose';
const OrderSchema = new Schema({ user: { type: Schema.Types.ObjectId, ref: 'User' }, items: [ { product: { type: Schema.Types.ObjectId, ref: 'Product' }, quantity: Number } ], total: Number, status: { type: String, default: 'pending' } }, { timestamps: true });
export const Order = model('Order', OrderSchema);`,
  "backend/src/models/Cart.ts": `import { Schema, model } from 'mongoose';
const CartSchema = new Schema({ user: { type: Schema.Types.ObjectId, ref: 'User' }, items: [ { product: { type: Schema.Types.ObjectId, ref: 'Product' }, quantity: Number } ] });
export const Cart = model('Cart', CartSchema);`,
  "backend/src/models/Coupon.ts": `import { Schema, model } from 'mongoose';
const CouponSchema = new Schema({ code: String, discount: Number, expiresAt: Date });
export const Coupon = model('Coupon', CouponSchema);`,
};
Object.assign(files, modelFiles);

// -------- BACKEND MIDDLEWARES --------
const middlewareFiles = {
  "backend/src/middlewares/auth.ts": `import { Request, Response, NextFunction } from 'express';
export const auth = (req: Request, res: Response, next: NextFunction) => { next(); };`,
  "backend/src/middlewares/admin.ts": `import { Request, Response, NextFunction } from 'express';
export const admin = (req: Request, res: Response, next: NextFunction) => { next(); };`,
  "backend/src/middlewares/errorHandler.ts": `import { Request, Response, NextFunction } from 'express';
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => { res.status(500).json({ error: err.message }); };`,
  "backend/src/middlewares/upload.ts": `import multer from 'multer';
export const upload = multer({ dest: 'uploads/' });`,
  "backend/src/middlewares/validate.ts": `import { validationResult } from 'express-validator';
export const validate = (validations) => { return async (req, res, next) => { await Promise.all(validations.map(v => v.run(req))); const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() }); next(); }; };`,
};
Object.assign(files, middlewareFiles);

// -------- BACKEND VALIDATORS --------
files["backend/src/validators/auth.validator.ts"] = `import { body } from 'express-validator';
export const registerValidator = [ body('email').isEmail(), body('password').isLength({ min: 6 }) ];`;
files["backend/src/validators/product.validator.ts"] = `import { body } from 'express-validator';
export const productValidator = [ body('name').notEmpty(), body('price').isNumeric() ];`;

// -------- BACKEND HELPERS & UTILS --------
files["backend/src/helpers/jwt.ts"] = `import jwt from 'jsonwebtoken';
export const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });`;
files["backend/src/helpers/password.ts"] = `import bcrypt from 'bcryptjs';
export const hash = (pwd) => bcrypt.hashSync(pwd, 10);
export const compare = (pwd, hash) => bcrypt.compareSync(pwd, hash);`;
files["backend/src/utils/logger.ts"] = `export const logger = { info: console.log, error: console.error };`;

// -------- SHARED --------
files["shared/types/index.ts"] = `export interface SharedType { id: string; }`;
files["shared/constants/index.ts"] = `export const APP_NAME = 'Pandit Ji Marble Murti Art';`;

// -------- DOCS, DOCKER, NGINX --------
files["docs/API.md"] = `# API Documentation\n\nAll endpoints under /api`;
files["docker/docker-compose.yml"] = `version: '3'\nservices:\n  backend:\n    build: ./backend\n    ports:\n      - "5000:5000"\n  frontend:\n    build: ./frontend\n    ports:\n      - "3000:3000"`;
files["nginx/nginx.conf"] = `server { listen 80; location / { proxy_pass http://frontend:3000; } location /api { proxy_pass http://backend:5000; } }`;
files["scripts/build.sh"] = `#!/bin/bash\nnpm install --workspaces\nnpm run build --workspaces`;
files["README.md"] = `# Pandit Ji Marble Murti Arts - E-Commerce Platform`;

// ============================================================
// 3. CREATE FOLDERS & FILES
// ============================================================
folders.forEach(folder => {
  const folderPath = path.join(__dirname, folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log("📁 Folder:", folder);
  }
});

Object.entries(files).forEach(([file, content]) => {
  const filePath = path.join(__dirname, file);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log("📄 File:", file);
  }
});

console.log("\n🎉 Complete project structure created successfully!");
console.log("Run 'npm install' in each folder (frontend, admin, backend) to install dependencies.");