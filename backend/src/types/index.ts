// backend/src/types/index.ts

import { Request } from 'express';
import { Document, Types } from 'mongoose';
import { IUser } from '../models/User';
import { IProduct } from '../models/Product';
import { ICategory } from '../models/Category';
import { IOrder } from '../models/Order';
import { ICart } from '../models/Cart';
import { ICoupon } from '../models/Coupon';

// ============================================================
// Core Entity Types
// ============================================================

export type User = IUser;
export type Product = IProduct;
export type Category = ICategory;
export type Order = IOrder;
export type Cart = ICart;
export type Coupon = ICoupon;

// ============================================================
// API Response Types
// ============================================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  code?: string;
  details?: any;
  stack?: string; // Only in development
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Pagination params
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================================
// Authentication Types
// ============================================================

/**
 * JWT Token payload
 */
export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Authentication request with user
 */
export interface AuthRequest extends Request {
  user?: User;
  token?: string;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Registration data
 */
export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
  role?: 'user' | 'seller';
}

/**
 * Social login data
 */
export interface SocialLoginData {
  provider: 'google' | 'facebook' | 'apple';
  token: string;
  email?: string;
  name?: string;
  avatar?: string;
}

/**
 * Auth response
 */
export interface AuthResponse {
  user: Omit<User, 'password' | 'resetPasswordToken' | 'resetPasswordExpires' | 'verificationToken' | 'verificationTokenExpires'>;
  accessToken: string;
  refreshToken: string;
}

// ============================================================
// Product Types
// ============================================================

/**
 * Product filters
 */
export interface ProductFilters {
  category?: string;
  subCategory?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  material?: string;
  marbleType?: string;
  finish?: string;
  colors?: string[];
  minHeight?: number;
  maxHeight?: number;
  minWeight?: number;
  maxWeight?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  rating?: number;
  tags?: string[];
  sort?: 'price-asc' | 'price-desc' | 'newest' | 'popular' | 'rating' | 'name-asc' | 'name-desc';
  page?: number;
  limit?: number;
}

/**
 * Product review data
 */
export interface ReviewData {
  rating: number;
  comment: string;
  title?: string;
  anonymous?: boolean;
}

/**
 * Custom murti request
 */
export interface CustomMurtiRequest {
  name: string;
  email: string;
  phone: string;
  description: string;
  budget?: number;
  dimensions?: string;
  referenceImages?: string[];
}

// ============================================================
// Order Types
// ============================================================

/**
 * Order item (for creating order)
 */
export interface OrderItemInput {
  productId: string;
  quantity: number;
  price?: number;
}

/**
 * Address input
 */
export interface AddressInput {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  phone: string;
  email?: string;
}

/**
 * Create order payload
 */
export interface CreateOrderPayload {
  items: OrderItemInput[];
  shippingAddress: AddressInput;
  billingAddress?: AddressInput;
  paymentMethod: 'cod' | 'card' | 'upi' | 'bank';
  couponCode?: string;
  giftWrap?: boolean;
  shippingMethod?: 'standard' | 'express';
  notes?: string;
}

/**
 * Order status update
 */
export interface OrderStatusUpdate {
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  notes?: string;
}

/**
 * Payment status update
 */
export interface PaymentStatusUpdate {
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
}

// ============================================================
// Category Types
// ============================================================

/**
 * Category filters
 */
export interface CategoryFilters {
  parentId?: string | null;
  isActive?: boolean;
  isFeatured?: boolean;
  search?: string;
  limit?: number;
  page?: number;
}

// ============================================================
// Cart Types
// ============================================================

/**
 * Cart item input
 */
export interface CartItemInput {
  productId: string;
  quantity: number;
  variant?: {
    id: string;
    name: string;
    attributes: Record<string, string>;
  };
}

// ============================================================
// Coupon Types
// ============================================================

/**
 * Coupon validation result
 */
export interface CouponValidationResult {
  valid: boolean;
  discount?: number;
  message?: string;
}

// ============================================================
// Upload Types
// ============================================================

/**
 * Uploaded file with custom properties
 */
export interface UploadedFile extends Express.Multer.File {
  generatedName?: string;
}

// ============================================================
// Notification Types
// ============================================================

/**
 * Notification payload
 */
export interface NotificationPayload {
  type: 'order' | 'payment' | 'shipping' | 'promotion' | 'system';
  title: string;
  message: string;
  userId: string;
  data?: Record<string, any>;
  read?: boolean;
}

// ============================================================
// Analytics Types
// ============================================================

/**
 * Sales analytics
 */
export interface SalesAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: {
    productId: string;
    name: string;
    totalSold: number;
    totalRevenue: number;
  }[];
  salesByDay: {
    date: string;
    count: number;
    revenue: number;
  }[];
  salesByStatus: {
    status: string;
    count: number;
  }[];
}

/**
 * Customer analytics
 */
export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  topCustomers: {
    userId: string;
    name: string;
    totalOrders: number;
    totalSpent: number;
  }[];
  customersByRole: {
    role: string;
    count: number;
  }[];
}

/**
 * Product analytics
 */
export interface ProductAnalytics {
  totalProducts: number;
  outOfStock: number;
  lowStock: number;
  topViewed: {
    productId: string;
    name: string;
    viewCount: number;
  }[];
  topSelling: {
    productId: string;
    name: string;
    totalSold: number;
  }[];
}

// ============================================================
// Utility Types
// ============================================================

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
 * Nullable type
 */
export type Nullable<T> = T | null;

/**
 * Optional type
 */
export type Optional<T> = T | undefined;

/**
 * ID type (string or ObjectId)
 */
export type ID = string | Types.ObjectId;

/**
 * Pick by type
 */
export type PickByType<T, U> = {
  [P in keyof T as T[P] extends U ? P : never]: T[P];
};

/**
 * Omit by type
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
 * Branded type for type safety
 */
export type Brand<K, T> = K & { __brand: T };

// ============================================================
// Request/Response Types
// ============================================================

/**
 * Generic list query params
 */
export interface ListQueryParams extends PaginationParams {
  search?: string;
  filters?: Record<string, any>;
}

/**
 * File upload response
 */
export interface FileUploadResponse {
  url: string;
  publicId: string;
  filename: string;
  size: number;
  mimetype: string;
}

// ============================================================
// Database Types
// ============================================================

/**
 * Mongoose document with timestamps
 */
export interface TimestampedDocument extends Document {
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// Environment Types
// ============================================================

/**
 * Environment variables
 */
export interface EnvConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  FRONTEND_URL: string;
  EMAIL_HOST: string;
  EMAIL_PORT: number;
  EMAIL_USER: string;
  EMAIL_PASS: string;
}

// ============================================================
// Default Export
// ============================================================

export default {
  // Re-export for convenience
  // (you can import directly from this file)
};