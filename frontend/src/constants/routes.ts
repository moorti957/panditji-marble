// frontend/src/constants/routes.ts

// ============================================================
// Route Path Definitions
// ============================================================

export const ROUTES = {
  // Public routes
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/[slug]',
  CATEGORIES: '/categories',
  CATEGORY_DETAIL: '/categories/[slug]',
  GALLERY: '/gallery',
  BLOGS: '/blogs',
  BLOG_DETAIL: '/blogs/[slug]',
  ABOUT: '/about',
  CONTACT: '/contact',
  FAQ: '/faq',
  PRIVACY_POLICY: '/privacy-policy',
  REFUND_POLICY: '/refund-policy',
  SHIPPING_POLICY: '/shipping-policy',
  TERMS: '/terms',
  
  // Auth routes
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  
  // Protected routes (require authentication)
  CART: '/cart',
  CHECKOUT: '/checkout',
  CHECKOUT_SUCCESS: '/checkout/success',
  PROFILE: '/profile',
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/[id]',
  WISHLIST: '/wishlist',
  ACCOUNT_SETTINGS: '/settings',
  ADDRESSES: '/addresses',
  PAYMENT_METHODS: '/payment-methods',
  
  // Admin routes
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_PRODUCT_CREATE: '/admin/products/create',
  ADMIN_PRODUCT_EDIT: '/admin/products/[id]/edit',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_ORDER_DETAIL: '/admin/orders/[id]',
  ADMIN_CUSTOMERS: '/admin/customers',
  ADMIN_REVIEWS: '/admin/reviews',
  ADMIN_COUPONS: '/admin/coupons',
  ADMIN_BLOGS: '/admin/blogs',
  ADMIN_BLOG_CREATE: '/admin/blogs/create',
  ADMIN_BLOG_EDIT: '/admin/blogs/[id]/edit',
  ADMIN_GALLERY: '/admin/gallery',
  ADMIN_BANNERS: '/admin/banners',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_SEO: '/admin/seo',
  ADMIN_ANALYTICS: '/admin/analytics',
  
  // API routes (for frontend use)
  API_AUTH: '/api/auth',
  API_PRODUCTS: '/api/products',
  API_ORDERS: '/api/orders',
  API_USERS: '/api/users',
  API_UPLOAD: '/api/upload',
} as const;

// ============================================================
// Route Types
// ============================================================

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];

// ============================================================
// Route Parameter Types
// ============================================================

export interface RouteParams {
  slug?: string;
  id?: string;
  category?: string;
  tab?: string;
  page?: number;
  search?: string;
}

// ============================================================
// Route Builders
// ============================================================

/**
 * Build a product detail URL
 */
export function productDetailUrl(slug: string): string {
  return `/products/${slug}`;
}

/**
 * Build a category detail URL
 */
export function categoryDetailUrl(slug: string): string {
  return `/categories/${slug}`;
}

/**
 * Build a blog detail URL
 */
export function blogDetailUrl(slug: string): string {
  return `/blogs/${slug}`;
}

/**
 * Build an order detail URL
 */
export function orderDetailUrl(id: string): string {
  return `/orders/${id}`;
}

/**
 * Build a product edit URL (admin)
 */
export function adminProductEditUrl(id: string): string {
  return `/admin/products/${id}/edit`;
}

/**
 * Build a blog edit URL (admin)
 */
export function adminBlogEditUrl(id: string): string {
  return `/admin/blogs/${id}/edit`;
}

/**
 * Build a URL with query parameters
 */
export function buildUrl(
  base: string,
  params?: Record<string, string | number | boolean | undefined>
): string {
  if (!params) return base;
  const filtered = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== ''
  );
  if (filtered.length === 0) return base;
  const queryString = filtered
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  return `${base}?${queryString}`;
}

/**
 * Build a products URL with filters
 */
export function productsUrl(filters?: {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  material?: string;
}): string {
  return buildUrl(ROUTES.PRODUCTS, filters);
}

// ============================================================
// Navigation Items
// ============================================================

export interface NavItem {
  label: string;
  /** Optional when the item is a group header that only has children */
  href?: RoutePath | string;
  icon?: string;
  isExternal?: boolean;
  children?: NavItem[];
  requiresAuth?: boolean;
  roles?: string[];
}

/**
 * Main navigation items (header)
 */
export const mainNavItems: NavItem[] = [
  {
    label: 'Home',
    href: ROUTES.HOME,
  },
  {
    label: 'Products',
    href: ROUTES.PRODUCTS,
  },
  {
    label: 'Categories',
    href: ROUTES.CATEGORIES,
  },
  {
    label: 'Gallery',
    href: ROUTES.GALLERY,
  },
  {
    label: 'Blogs',
    href: ROUTES.BLOGS,
  },
  {
    label: 'About',
    href: ROUTES.ABOUT,
  },
  {
    label: 'Contact',
    href: ROUTES.CONTACT,
  },
];

/**
 * Footer navigation items
 */
export const footerNavItems: NavItem[] = [
  {
    label: 'Quick Links',
    children: [
      { label: 'About Us', href: ROUTES.ABOUT },
      { label: 'Products', href: ROUTES.PRODUCTS },
      { label: 'Gallery', href: ROUTES.GALLERY },
      { label: 'Blog', href: ROUTES.BLOGS },
      { label: 'Contact', href: ROUTES.CONTACT },
      { label: 'FAQ', href: ROUTES.FAQ },
    ],
  },
  {
    label: 'Categories',
    children: [
      { label: 'Ganesh Ji', href: '/products?category=ganesh' },
      { label: 'Radha Krishna', href: '/products?category=krishna' },
      { label: 'Shiv Ji', href: '/products?category=shiv' },
      { label: 'Hanuman Ji', href: '/products?category=hanuman' },
      { label: 'Ram Darbar', href: '/products?category=ram' },
      { label: 'Durga Maa', href: '/products?category=durga' },
    ],
  },
  {
    label: 'Legal',
    children: [
      { label: 'Privacy Policy', href: ROUTES.PRIVACY_POLICY },
      { label: 'Refund Policy', href: ROUTES.REFUND_POLICY },
      { label: 'Shipping Policy', href: ROUTES.SHIPPING_POLICY },
      { label: 'Terms of Service', href: ROUTES.TERMS },
    ],
  },
];

/**
 * User account navigation (profile sidebar)
 */
export const accountNavItems: NavItem[] = [
  { label: 'Overview', href: ROUTES.PROFILE },
  { label: 'My Orders', href: ROUTES.ORDERS },
  { label: 'Wishlist', href: ROUTES.WISHLIST },
  { label: 'Addresses', href: ROUTES.ADDRESSES },
  { label: 'Payment Methods', href: ROUTES.PAYMENT_METHODS },
  { label: 'Settings', href: ROUTES.ACCOUNT_SETTINGS },
];

/**
 * Admin navigation items
 */
export const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: ROUTES.ADMIN_DASHBOARD },
  {
    label: 'Products',
    href: ROUTES.ADMIN_PRODUCTS,
    children: [
      { label: 'All Products', href: ROUTES.ADMIN_PRODUCTS },
      { label: 'Add New', href: ROUTES.ADMIN_PRODUCT_CREATE },
      { label: 'Categories', href: ROUTES.ADMIN_CATEGORIES },
    ],
  },
  { label: 'Orders', href: ROUTES.ADMIN_ORDERS },
  { label: 'Customers', href: ROUTES.ADMIN_CUSTOMERS },
  { label: 'Reviews', href: ROUTES.ADMIN_REVIEWS },
  { label: 'Coupons', href: ROUTES.ADMIN_COUPONS },
  {
    label: 'Blogs',
    href: ROUTES.ADMIN_BLOGS,
    children: [
      { label: 'All Blogs', href: ROUTES.ADMIN_BLOGS },
      { label: 'Create New', href: ROUTES.ADMIN_BLOG_CREATE },
    ],
  },
  { label: 'Gallery', href: ROUTES.ADMIN_GALLERY },
  { label: 'Banners', href: ROUTES.ADMIN_BANNERS },
  { label: 'SEO', href: ROUTES.ADMIN_SEO },
  { label: 'Analytics', href: ROUTES.ADMIN_ANALYTICS },
  { label: 'Settings', href: ROUTES.ADMIN_SETTINGS },
];

// ============================================================
// Auth Routes Group
// ============================================================

/**
 * Routes that should only be accessible when not authenticated
 */
export const publicOnlyRoutes: RoutePath[] = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
  ROUTES.VERIFY_EMAIL,
];

/**
 * Routes that require authentication
 */
export const protectedRoutes: RoutePath[] = [
  ROUTES.PROFILE,
  ROUTES.ORDERS,
  ROUTES.ORDER_DETAIL,
  ROUTES.WISHLIST,
  ROUTES.CART,
  ROUTES.CHECKOUT,
  ROUTES.CHECKOUT_SUCCESS,
  ROUTES.ACCOUNT_SETTINGS,
  ROUTES.ADDRESSES,
  ROUTES.PAYMENT_METHODS,
];

/**
 * Admin-only routes
 */
export const adminRoutes: RoutePath[] = [
  ROUTES.ADMIN,
  ROUTES.ADMIN_DASHBOARD,
  ROUTES.ADMIN_PRODUCTS,
  ROUTES.ADMIN_PRODUCT_CREATE,
  ROUTES.ADMIN_PRODUCT_EDIT,
  ROUTES.ADMIN_CATEGORIES,
  ROUTES.ADMIN_ORDERS,
  ROUTES.ADMIN_ORDER_DETAIL,
  ROUTES.ADMIN_CUSTOMERS,
  ROUTES.ADMIN_REVIEWS,
  ROUTES.ADMIN_COUPONS,
  ROUTES.ADMIN_BLOGS,
  ROUTES.ADMIN_BLOG_CREATE,
  ROUTES.ADMIN_BLOG_EDIT,
  ROUTES.ADMIN_GALLERY,
  ROUTES.ADMIN_BANNERS,
  ROUTES.ADMIN_SETTINGS,
  ROUTES.ADMIN_SEO,
  ROUTES.ADMIN_ANALYTICS,
];

// ============================================================
// Utility Functions
// ============================================================

/**
 * Check if a path is a protected route
 */
export function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some((route) => pathname.startsWith(route));
}

/**
 * Check if a path is an admin route
 */
export function isAdminRoute(pathname: string): boolean {
  return adminRoutes.some((route) => pathname.startsWith(route));
}

/**
 * Check if a path is a public-only route (login, register, etc.)
 */
export function isPublicOnlyRoute(pathname: string): boolean {
  return publicOnlyRoutes.some((route) => pathname.startsWith(route));
}

/**
 * Get the current route name from a path
 */
export function getRouteKey(pathname: string): RouteKey | null {
  const entry = Object.entries(ROUTES).find(([, path]) => pathname === path);
  return entry ? (entry[0] as RouteKey) : null;
}

/**
 * Get the breadcrumb label for a route
 */
export function getBreadcrumbLabel(pathname: string): string {
  const routeKey = getRouteKey(pathname);
  if (!routeKey) return pathname.split('/').pop() || pathname;
  
  const labels: Record<string, string> = {
    HOME: 'Home',
    PRODUCTS: 'Products',
    PRODUCT_DETAIL: 'Product Detail',
    CATEGORIES: 'Categories',
    CATEGORY_DETAIL: 'Category',
    GALLERY: 'Gallery',
    BLOGS: 'Blogs',
    BLOG_DETAIL: 'Blog',
    ABOUT: 'About',
    CONTACT: 'Contact',
    FAQ: 'FAQ',
    LOGIN: 'Login',
    REGISTER: 'Register',
    FORGOT_PASSWORD: 'Forgot Password',
    RESET_PASSWORD: 'Reset Password',
    VERIFY_EMAIL: 'Verify Email',
    CART: 'Cart',
    CHECKOUT: 'Checkout',
    CHECKOUT_SUCCESS: 'Order Confirmed',
    PROFILE: 'Profile',
    ORDERS: 'Orders',
    ORDER_DETAIL: 'Order Detail',
    WISHLIST: 'Wishlist',
    ACCOUNT_SETTINGS: 'Settings',
    ADDRESSES: 'Addresses',
    PAYMENT_METHODS: 'Payment Methods',
    ADMIN: 'Admin',
    ADMIN_DASHBOARD: 'Dashboard',
    ADMIN_PRODUCTS: 'Products',
    ADMIN_PRODUCT_CREATE: 'Create Product',
    ADMIN_PRODUCT_EDIT: 'Edit Product',
    ADMIN_CATEGORIES: 'Categories',
    ADMIN_ORDERS: 'Orders',
    ADMIN_ORDER_DETAIL: 'Order Detail',
    ADMIN_CUSTOMERS: 'Customers',
    ADMIN_REVIEWS: 'Reviews',
    ADMIN_COUPONS: 'Coupons',
    ADMIN_BLOGS: 'Blogs',
    ADMIN_BLOG_CREATE: 'Create Blog',
    ADMIN_BLOG_EDIT: 'Edit Blog',
    ADMIN_GALLERY: 'Gallery',
    ADMIN_BANNERS: 'Banners',
    ADMIN_SETTINGS: 'Settings',
    ADMIN_SEO: 'SEO',
    ADMIN_ANALYTICS: 'Analytics',
  };
  
  return labels[routeKey] || routeKey;
}

// ============================================================
// Default Export
// ============================================================

const routeConstants = {
  ROUTES,
  productDetailUrl,
  categoryDetailUrl,
  blogDetailUrl,
  orderDetailUrl,
  adminProductEditUrl,
  adminBlogEditUrl,
  buildUrl,
  productsUrl,
  mainNavItems,
  footerNavItems,
  accountNavItems,
  adminNavItems,
  publicOnlyRoutes,
  protectedRoutes,
  adminRoutes,
  isProtectedRoute,
  isAdminRoute,
  isPublicOnlyRoute,
  getRouteKey,
  getBreadcrumbLabel,
};

export default routeConstants;