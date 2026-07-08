// admin/src/constants/routes.ts

// ============================================================
// Route Path Definitions
// ============================================================

export const ROUTES = {
  // Auth routes
  LOGIN: '/login',
  LOGOUT: '/logout',

  // Dashboard
  DASHBOARD: '/dashboard',

  // Product Management
  PRODUCTS: '/products',
  PRODUCT_CREATE: '/products/create',
  PRODUCT_EDIT: '/products/[id]/edit',
  PRODUCT_DETAIL: '/products/[id]',

  // Category Management
  CATEGORIES: '/categories',
  CATEGORY_CREATE: '/categories/create',
  CATEGORY_EDIT: '/categories/[id]/edit',

  // Order Management
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/[id]',

  // Customer Management
  CUSTOMERS: '/customers',
  CUSTOMER_DETAIL: '/customers/[id]',

  // User Management
  USERS: '/users',
  USER_EDIT: '/users/[id]/edit',
  USER_ROLES: '/users/roles',

  // Gallery Management
  GALLERY: '/gallery',

  // Banner Management
  BANNERS: '/banners',
  BANNER_CREATE: '/banners/create',
  BANNER_EDIT: '/banners/[id]/edit',

  // Testimonial Management
  TESTIMONIALS: '/testimonials',
  TESTIMONIAL_CREATE: '/testimonials/create',
  TESTIMONIAL_EDIT: '/testimonials/[id]/edit',

  // FAQ Management
  FAQS: '/faqs',
  FAQ_CREATE: '/faqs/create',
  FAQ_EDIT: '/faqs/[id]/edit',

  // Blog Management
  BLOGS: '/blogs',
  BLOG_CREATE: '/blogs/create',
  BLOG_EDIT: '/blogs/[id]/edit',
  BLOG_DETAIL: '/blogs/[id]',

  // Video Management
  VIDEOS: '/videos',
  VIDEO_CREATE: '/videos/create',
  VIDEO_EDIT: '/videos/[id]/edit',

  // Homepage Sections
  HOMEPAGE: '/homepage',
  HOMEPAGE_HERO: '/homepage/hero',
  HOMEPAGE_FEATURED: '/homepage/featured',

  // SEO Settings
  SEO: '/seo',
  SEO_PAGE: '/seo/page/[path]',

  // Media Management
  MEDIA: '/media',

  // Settings
  SETTINGS: '/settings',
  SETTINGS_GENERAL: '/settings/general',
  SETTINGS_PAYMENT: '/settings/payment',
  SETTINGS_SHIPPING: '/settings/shipping',
  SETTINGS_SOCIAL: '/settings/social',
  SETTINGS_CONTACT: '/settings/contact',

  // Profile
  PROFILE: '/profile',

  // Notifications
  NOTIFICATIONS: '/notifications',

  // Roles & Permissions
  ROLES: '/roles',
  PERMISSIONS: '/permissions',

  // Analytics
  ANALYTICS: '/analytics',
  ANALYTICS_SALES: '/analytics/sales',
  ANALYTICS_PRODUCTS: '/analytics/products',
  ANALYTICS_CUSTOMERS: '/analytics/customers',

  // Coupon Management (Optional)
  COUPONS: '/coupons',
  COUPON_CREATE: '/coupons/create',
  COUPON_EDIT: '/coupons/[id]/edit',

  // Reviews Management
  REVIEWS: '/reviews',
  REVIEW_DETAIL: '/reviews/[id]',

  // 404
  NOT_FOUND: '/404',
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
  id?: string;
  slug?: string;
  path?: string;
  page?: number;
  search?: string;
  tab?: string;
}

// ============================================================
// Route Builders
// ============================================================

/**
 * Build a product edit URL
 */
export function productEditUrl(id: string): string {
  return `/products/${id}/edit`;
}

/**
 * Build a product detail URL
 */
export function productDetailUrl(id: string): string {
  return `/products/${id}`;
}

/**
 * Build a category edit URL
 */
export function categoryEditUrl(id: string): string {
  return `/categories/${id}/edit`;
}

/**
 * Build an order detail URL
 */
export function orderDetailUrl(id: string): string {
  return `/orders/${id}`;
}

/**
 * Build a customer detail URL
 */
export function customerDetailUrl(id: string): string {
  return `/customers/${id}`;
}

/**
 * Build a blog edit URL
 */
export function blogEditUrl(id: string): string {
  return `/blogs/${id}/edit`;
}

/**
 * Build a blog detail URL
 */
export function blogDetailUrl(id: string): string {
  return `/blogs/${id}`;
}

/**
 * Build a video edit URL
 */
export function videoEditUrl(id: string): string {
  return `/videos/${id}/edit`;
}

/**
 * Build a banner edit URL
 */
export function bannerEditUrl(id: string): string {
  return `/banners/${id}/edit`;
}

/**
 * Build a testimonial edit URL
 */
export function testimonialEditUrl(id: string): string {
  return `/testimonials/${id}/edit`;
}

/**
 * Build a FAQ edit URL
 */
export function faqEditUrl(id: string): string {
  return `/faqs/${id}/edit`;
}

/**
 * Build a coupon edit URL
 */
export function couponEditUrl(id: string): string {
  return `/coupons/${id}/edit`;
}

/**
 * Build a user edit URL
 */
export function userEditUrl(id: string): string {
  return `/users/${id}/edit`;
}

/**
 * Build a review detail URL
 */
export function reviewDetailUrl(id: string): string {
  return `/reviews/${id}`;
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

// ============================================================
// Navigation Items (Sidebar)
// ============================================================

export interface NavItem {
  label: string;
  href: RoutePath | string;
  icon: React.ReactNode;
  children?: NavItem[];
  requiresAuth?: boolean;
  roles?: string[];
  badge?: number;
}

/**
 * Main admin navigation items for the sidebar
 */
export const adminNavItems = (iconMap: Record<string, React.ReactNode>): NavItem[] => [
  {
    label: 'Dashboard',
    href: ROUTES.DASHBOARD,
    icon: iconMap.dashboard,
  },
  {
    label: 'Products',
    href: ROUTES.PRODUCTS,
    icon: iconMap.products,
    children: [
      { label: 'All Products', href: ROUTES.PRODUCTS, icon: iconMap.list },
      { label: 'Add New', href: ROUTES.PRODUCT_CREATE, icon: iconMap.plus },
      { label: 'Categories', href: ROUTES.CATEGORIES, icon: iconMap.folder },
    ],
  },
  {
    label: 'Orders',
    href: ROUTES.ORDERS,
    icon: iconMap.orders,
  },
  {
    label: 'Customers',
    href: ROUTES.CUSTOMERS,
    icon: iconMap.customers,
  },
  {
    label: 'Users',
    href: ROUTES.USERS,
    icon: iconMap.users,
  },
  {
    label: 'Content',
    href: ROUTES.BLOGS,
    icon: iconMap.content,
    children: [
      { label: 'Blogs', href: ROUTES.BLOGS, icon: iconMap.fileText },
      { label: 'Gallery', href: ROUTES.GALLERY, icon: iconMap.image },
      { label: 'Videos', href: ROUTES.VIDEOS, icon: iconMap.video },
      { label: 'Banners', href: ROUTES.BANNERS, icon: iconMap.banner },
      { label: 'Testimonials', href: ROUTES.TESTIMONIALS, icon: iconMap.star },
      { label: 'FAQs', href: ROUTES.FAQS, icon: iconMap.helpCircle },
    ],
  },
  {
    label: 'Marketing',
    href: ROUTES.COUPONS,
    icon: iconMap.marketing,
    children: [
      { label: 'Coupons', href: ROUTES.COUPONS, icon: iconMap.ticket },
      { label: 'Reviews', href: ROUTES.REVIEWS, icon: iconMap.star },
    ],
  },
  {
    label: 'Analytics',
    href: ROUTES.ANALYTICS,
    icon: iconMap.analytics,
    children: [
      { label: 'Overview', href: ROUTES.ANALYTICS, icon: iconMap.barChart },
      { label: 'Sales', href: ROUTES.ANALYTICS_SALES, icon: iconMap.trendingUp },
      { label: 'Products', href: ROUTES.ANALYTICS_PRODUCTS, icon: iconMap.package },
      { label: 'Customers', href: ROUTES.ANALYTICS_CUSTOMERS, icon: iconMap.users },
    ],
  },
  {
    label: 'SEO',
    href: ROUTES.SEO,
    icon: iconMap.globe,
  },
  {
    label: 'Homepage',
    href: ROUTES.HOMEPAGE,
    icon: iconMap.home,
  },
  {
    label: 'Settings',
    href: ROUTES.SETTINGS,
    icon: iconMap.settings,
    children: [
      { label: 'General', href: ROUTES.SETTINGS_GENERAL, icon: iconMap.settings },
      { label: 'Payment', href: ROUTES.SETTINGS_PAYMENT, icon: iconMap.creditCard },
      { label: 'Shipping', href: ROUTES.SETTINGS_SHIPPING, icon: iconMap.truck },
      { label: 'Social', href: ROUTES.SETTINGS_SOCIAL, icon: iconMap.share2 },
      { label: 'Contact', href: ROUTES.SETTINGS_CONTACT, icon: iconMap.mail },
    ],
  },
  {
    label: 'Roles & Permissions',
    href: ROUTES.ROLES,
    icon: iconMap.shield,
  },
  {
    label: 'Media',
    href: ROUTES.MEDIA,
    icon: iconMap.image,
  },
  {
    label: 'Notifications',
    href: ROUTES.NOTIFICATIONS,
    icon: iconMap.bell,
  },
  {
    label: 'Profile',
    href: ROUTES.PROFILE,
    icon: iconMap.user,
  },
];

// ============================================================
// Route Groups
// ============================================================

/**
 * Routes that don't require authentication
 */
export const publicRoutes: RoutePath[] = [
  ROUTES.LOGIN,
];

/**
 * Routes that require admin or super-admin role
 */
export const adminOnlyRoutes: RoutePath[] = [
  ROUTES.DASHBOARD,
  ROUTES.PRODUCTS,
  ROUTES.PRODUCT_CREATE,
  ROUTES.PRODUCT_EDIT,
  ROUTES.PRODUCT_DETAIL,
  ROUTES.CATEGORIES,
  ROUTES.CATEGORY_CREATE,
  ROUTES.CATEGORY_EDIT,
  ROUTES.ORDERS,
  ROUTES.ORDER_DETAIL,
  ROUTES.CUSTOMERS,
  ROUTES.CUSTOMER_DETAIL,
  ROUTES.USERS,
  ROUTES.USER_EDIT,
  ROUTES.USER_ROLES,
  ROUTES.GALLERY,
  ROUTES.BANNERS,
  ROUTES.BANNER_CREATE,
  ROUTES.BANNER_EDIT,
  ROUTES.TESTIMONIALS,
  ROUTES.TESTIMONIAL_CREATE,
  ROUTES.TESTIMONIAL_EDIT,
  ROUTES.FAQS,
  ROUTES.FAQ_CREATE,
  ROUTES.FAQ_EDIT,
  ROUTES.BLOGS,
  ROUTES.BLOG_CREATE,
  ROUTES.BLOG_EDIT,
  ROUTES.VIDEOS,
  ROUTES.VIDEO_CREATE,
  ROUTES.VIDEO_EDIT,
  ROUTES.HOMEPAGE,
  ROUTES.HOMEPAGE_HERO,
  ROUTES.HOMEPAGE_FEATURED,
  ROUTES.SEO,
  ROUTES.SEO_PAGE,
  ROUTES.MEDIA,
  ROUTES.SETTINGS,
  ROUTES.SETTINGS_GENERAL,
  ROUTES.SETTINGS_PAYMENT,
  ROUTES.SETTINGS_SHIPPING,
  ROUTES.SETTINGS_SOCIAL,
  ROUTES.SETTINGS_CONTACT,
  ROUTES.PROFILE,
  ROUTES.NOTIFICATIONS,
  ROUTES.ROLES,
  ROUTES.PERMISSIONS,
  ROUTES.ANALYTICS,
  ROUTES.ANALYTICS_SALES,
  ROUTES.ANALYTICS_PRODUCTS,
  ROUTES.ANALYTICS_CUSTOMERS,
  ROUTES.COUPONS,
  ROUTES.COUPON_CREATE,
  ROUTES.COUPON_EDIT,
  ROUTES.REVIEWS,
  ROUTES.REVIEW_DETAIL,
];

/**
 * Routes that require super-admin role only
 */
export const superAdminOnlyRoutes: RoutePath[] = [
  ROUTES.ROLES,
  ROUTES.PERMISSIONS,
  ROUTES.USER_ROLES,
];

// ============================================================
// Breadcrumb Labels
// ============================================================

export const breadcrumbLabels: Record<string, string> = {
  [ROUTES.DASHBOARD]: 'Dashboard',
  [ROUTES.PRODUCTS]: 'Products',
  [ROUTES.PRODUCT_CREATE]: 'Create Product',
  [ROUTES.PRODUCT_EDIT]: 'Edit Product',
  [ROUTES.PRODUCT_DETAIL]: 'Product Details',
  [ROUTES.CATEGORIES]: 'Categories',
  [ROUTES.CATEGORY_CREATE]: 'Create Category',
  [ROUTES.CATEGORY_EDIT]: 'Edit Category',
  [ROUTES.ORDERS]: 'Orders',
  [ROUTES.ORDER_DETAIL]: 'Order Details',
  [ROUTES.CUSTOMERS]: 'Customers',
  [ROUTES.CUSTOMER_DETAIL]: 'Customer Details',
  [ROUTES.USERS]: 'Users',
  [ROUTES.USER_EDIT]: 'Edit User',
  [ROUTES.GALLERY]: 'Gallery',
  [ROUTES.BANNERS]: 'Banners',
  [ROUTES.BANNER_CREATE]: 'Create Banner',
  [ROUTES.BANNER_EDIT]: 'Edit Banner',
  [ROUTES.TESTIMONIALS]: 'Testimonials',
  [ROUTES.TESTIMONIAL_CREATE]: 'Create Testimonial',
  [ROUTES.TESTIMONIAL_EDIT]: 'Edit Testimonial',
  [ROUTES.FAQS]: 'FAQs',
  [ROUTES.FAQ_CREATE]: 'Create FAQ',
  [ROUTES.FAQ_EDIT]: 'Edit FAQ',
  [ROUTES.BLOGS]: 'Blogs',
  [ROUTES.BLOG_CREATE]: 'Create Blog',
  [ROUTES.BLOG_EDIT]: 'Edit Blog',
  [ROUTES.VIDEOS]: 'Videos',
  [ROUTES.VIDEO_CREATE]: 'Create Video',
  [ROUTES.VIDEO_EDIT]: 'Edit Video',
  [ROUTES.HOMEPAGE]: 'Homepage',
  [ROUTES.HOMEPAGE_HERO]: 'Hero Section',
  [ROUTES.HOMEPAGE_FEATURED]: 'Featured Sections',
  [ROUTES.SEO]: 'SEO Settings',
  [ROUTES.SEO_PAGE]: 'Page SEO',
  [ROUTES.MEDIA]: 'Media Library',
  [ROUTES.SETTINGS]: 'Settings',
  [ROUTES.SETTINGS_GENERAL]: 'General Settings',
  [ROUTES.SETTINGS_PAYMENT]: 'Payment Settings',
  [ROUTES.SETTINGS_SHIPPING]: 'Shipping Settings',
  [ROUTES.SETTINGS_SOCIAL]: 'Social Settings',
  [ROUTES.SETTINGS_CONTACT]: 'Contact Settings',
  [ROUTES.PROFILE]: 'Profile',
  [ROUTES.NOTIFICATIONS]: 'Notifications',
  [ROUTES.ROLES]: 'Roles & Permissions',
  [ROUTES.ANALYTICS]: 'Analytics',
  [ROUTES.ANALYTICS_SALES]: 'Sales Analytics',
  [ROUTES.ANALYTICS_PRODUCTS]: 'Product Analytics',
  [ROUTES.ANALYTICS_CUSTOMERS]: 'Customer Analytics',
  [ROUTES.COUPONS]: 'Coupons',
  [ROUTES.COUPON_CREATE]: 'Create Coupon',
  [ROUTES.COUPON_EDIT]: 'Edit Coupon',
  [ROUTES.REVIEWS]: 'Reviews',
  [ROUTES.REVIEW_DETAIL]: 'Review Details',
  [ROUTES.LOGIN]: 'Login',
};

// ============================================================
// Utility Functions
// ============================================================

/**
 * Check if a path is an admin-only route
 */
export function isAdminRoute(pathname: string): boolean {
  return adminOnlyRoutes.some((route) => {
    // Handle dynamic routes like /products/[id]/edit
    const pattern = route.replace(/\[.*\]/g, '[^/]+');
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(pathname);
  });
}

/**
 * Check if a path is a super-admin-only route
 */
export function isSuperAdminRoute(pathname: string): boolean {
  return superAdminOnlyRoutes.some((route) => {
    const pattern = route.replace(/\[.*\]/g, '[^/]+');
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(pathname);
  });
}

/**
 * Check if a path is a public route (login, etc.)
 */
export function isPublicRoute(pathname: string): boolean {
  return publicRoutes.includes(pathname as RoutePath);
}

/**
 * Get the breadcrumb label for a route
 */
export function getBreadcrumbLabel(pathname: string): string {
  // Try exact match first
  if (breadcrumbLabels[pathname]) {
    return breadcrumbLabels[pathname];
  }

  // Try dynamic route matching
  for (const [route, label] of Object.entries(breadcrumbLabels)) {
    const pattern = route.replace(/\[.*\]/g, '[^/]+');
    const regex = new RegExp(`^${pattern}$`);
    if (regex.test(pathname)) {
      return label;
    }
  }

  // Fallback: capitalize the last segment
  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1] || pathname;
  return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ');
}

/**
 * Get the active navigation item based on current path
 */
export function getActiveNavItems(
  navItems: NavItem[],
  pathname: string
): string[] {
  const activeItems: string[] = [];

  const checkItem = (items: NavItem[], parentPath?: string) => {
    for (const item of items) {
      if (item.href && pathname.startsWith(item.href)) {
        if (parentPath) activeItems.push(parentPath);
        activeItems.push(item.href);
      }
      if (item.children) {
        const childActive = item.children.some(
          (child) => child.href && pathname.startsWith(child.href)
        );
        if (childActive) {
          activeItems.push(item.href);
        }
        checkItem(item.children, item.href);
      }
    }
  };

  checkItem(navItems);
  return activeItems;
}

// ============================================================
// Default Export
// ============================================================

const routeConstants = {
  ROUTES,
  adminNavItems,
  publicRoutes,
  adminOnlyRoutes,
  superAdminOnlyRoutes,
  breadcrumbLabels,
  productEditUrl,
  productDetailUrl,
  categoryEditUrl,
  orderDetailUrl,
  customerDetailUrl,
  blogEditUrl,
  blogDetailUrl,
  videoEditUrl,
  bannerEditUrl,
  testimonialEditUrl,
  faqEditUrl,
  couponEditUrl,
  userEditUrl,
  reviewDetailUrl,
  buildUrl,
  isAdminRoute,
  isSuperAdminRoute,
  isPublicRoute,
  getBreadcrumbLabel,
  getActiveNavItems,
};

export default routeConstants;