// frontend/src/types/index.ts

// ============================================================
// Re-export Product Types
// ============================================================
export type {
  Product,
  ProductSpecification,
  ProductVariant,
  ProductSEO,
  ProductFilters,
  ProductSortOption,
  ProductListResponse,
  ProductFilterOptions,
  ProductReview,
  ProductReviewsResponse,
  ReviewSubmissionData,
  ProductAvailability,
  CustomMurtiRequest,
  CustomMurtiRequestResponse,
  ProductComparison,
  ProductViewData,
  ProductAnalytics,
  ProductCategory,
  ProductCollection,
  ProductFormData,
  ProductListQueryParams,
} from '@/features/products/types/product.types';

// ============================================================
// Re-export Auth Types
// ============================================================
export type {
  User,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  SocialAuthData,
  VerifyOTPData,
  ResetPasswordData,
  ChangePasswordData,
  UpdateProfileData,
  SessionData,
  AuthError,
} from '@/features/auth/types/auth.types';

// ============================================================
// Re-export Review Types
// ============================================================
export type { Review } from '@/features/reviews/types/review.types';

// ============================================================
// Re-export Home Types
// ============================================================
export type {
  HomeData,
  HomeBanner,
  FeaturedCategory,
  FeaturedProduct,
  Testimonial,
  FAQ,
  HomeStats,
  InstagramPost,
  YouTubeVideo,
} from '@/features/home/types/home.types';

// ============================================================
// Re-export Cart Types
// ============================================================
export type {
  CartItem,
  AppliedCoupon,
  CartState,
} from '@/features/cart/store/cartStore';

// ============================================================
// Re-export Wishlist Types
// ============================================================
export type {
  WishlistState,
  WishlistItem,
} from '@/features/wishlist/store/wishlistStore';

// ============================================================
// Shared API Types
// ============================================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: number;
  success: boolean;
  errors?: Record<string, string[]>;
}

/**
 * Pagination parameters for API requests
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * API error response
 */
export interface ApiErrorResponse {
  status: number;
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

// ============================================================
// Shared Utility Types
// ============================================================

/**
 * ID type (string or number)
 */
export type ID = string | number;

/**
 * Nullable type
 */
export type Nullable<T> = T | null;

/**
 * Optional type
 */
export type Optional<T> = T | undefined;

/**
 * Deep partial (all properties optional recursively)
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Deep required (all properties required recursively)
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Pick by type (pick keys where value matches type)
 */
export type PickByType<T, U> = {
  [P in keyof T as T[P] extends U ? P : never]: T[P];
};

/**
 * Omit by type (omit keys where value matches type)
 */
export type OmitByType<T, U> = {
  [P in keyof T as T[P] extends U ? never : P]: T[P];
};

/**
 * Extract keys where value is of a specific type
 */
export type KeysOfType<T, U> = {
  [P in keyof T]: T[P] extends U ? P : never;
}[keyof T];

/**
 * Value type of an array
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

/**
 * Promise resolve type
 */
export type ResolvePromise<T> = T extends Promise<infer U> ? U : T;

/**
 * Function with any arguments
 */
export type AnyFunction = (...args: any[]) => any;

/**
 * Object with string keys and any values
 */
export type AnyObject = Record<string, any>;

/**
 * Branded type for type safety (nominal typing)
 */
export type Brand<K, T> = K & { __brand: T };

// ============================================================
// Shared Context Types
// ============================================================

/**
 * Generic context type with provider value
 */
export interface ContextValue<T> {
  value: T;
  setValue: (value: T) => void;
}

/**
 * Theme context
 */
export interface ThemeContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  isDark: boolean;
  isLight: boolean;
}

/**
 * Modal context
 */
export interface ModalContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/**
 * Toast context
 */
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// ============================================================
// Component Prop Types
// ============================================================

/**
 * Base component props with children
 */
export interface BaseProps {
  className?: string;
  children?: React.ReactNode;
  id?: string;
}

/**
 * Component with loading state
 */
export interface LoadingProps extends BaseProps {
  isLoading?: boolean;
  loadingText?: string;
}

/**
 * Component with disabled state
 */
export interface DisabledProps extends BaseProps {
  disabled?: boolean;
}

/**
 * Component with size variant
 */
export interface SizeableProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Component with color variant
 */
export interface ColorableProps {
  color?: 'primary' | 'secondary' | 'gold' | 'maroon' | 'brown' | 'ivory' | 'sand';
}

/**
 * Component with alignment
 */
export interface AlignableProps {
  align?: 'left' | 'center' | 'right';
}

// ============================================================
// Form Types
// ============================================================

/**
 * Generic form field
 */
export interface FormField<T = unknown> {
  name: string;
  label: string;
  value: T;
  error?: string;
  touched?: boolean;
  required?: boolean;
  disabled?: boolean;
}

/**
 * Form submission state
 */
export interface FormSubmissionState {
  isSubmitting: boolean;
  isSubmitted: boolean;
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Form field option (for select, radio, checkbox)
 */
export interface FormOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

// ============================================================
// Route Types
// ============================================================

/**
 * Route with metadata
 */
export interface RouteMeta {
  title: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
}

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrent?: boolean;
  icon?: React.ReactNode;
}

// ============================================================
// SEO Types
// ============================================================

/**
 * SEO metadata
 */
export interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  twitterCard?: 'summary' | 'summary_large_image';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  structuredData?: Record<string, any>;
}

// ============================================================
// Notification Types
// ============================================================

/**
 * Notification
 */
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  read: boolean;
  createdAt: string;
  action?: {
    label: string;
    href: string;
  };
}

// ============================================================
// Analytics Types
// ============================================================

/**
 * Page view event
 */
export interface PageViewEvent {
  path: string;
  title: string;
  referrer?: string;
  userId?: string;
  sessionId?: string;
  timestamp?: string;
}

/**
 * Product view event
 */
export interface ProductViewEvent {
  productId: string;
  productName: string;
  category?: string;
  price?: number;
  userId?: string;
  sessionId?: string;
}

/**
 * Cart event
 */
export interface CartEvent {
  action: 'add' | 'remove' | 'update' | 'view' | 'checkout';
  productId?: string;
  productName?: string;
  quantity?: number;
  price?: number;
  total?: number;
  userId?: string;
  sessionId?: string;
}

// ============================================================
// Theme Types
// ============================================================

/**
 * Color scheme
 */
export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  muted: string;
  border: string;
}

// ============================================================
// User Experience Types
// ============================================================

/**
 * Viewport size
 */
export interface ViewportSize {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

/**
 * Breakpoint
 */
export interface Breakpoint {
  name: string;
  minWidth: number;
  maxWidth?: number;
}

// ============================================================
// Re-export React types
// ============================================================

export type {
  ReactNode,
  ReactElement,
  ReactPortal,
  CSSProperties,
  ComponentType,
  FC,
  PropsWithChildren,
  ComponentProps,
  ComponentPropsWithoutRef,
  ComponentPropsWithRef,
  ElementRef,
  ElementType,
  ForwardRefRenderFunction,
  ForwardRefExoticComponent,
  RefObject,
  MutableRefObject,
  Ref,
} from 'react';

// ============================================================
// Re-export Next.js types
// ============================================================

export type {
  NextPage,
  NextPageContext,
  GetServerSideProps,
  GetStaticProps,
  GetStaticPaths,
  GetServerSidePropsContext,
  GetStaticPropsContext,
  InferGetServerSidePropsType,
  InferGetStaticPropsType,
  NextComponentType,
} from 'next';

export type { AppContext, AppProps, AppInitialProps } from 'next/app';