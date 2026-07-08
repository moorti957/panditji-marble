// admin/src/modules/product/product.types.ts

// ============================================================
// Core Product Types
// ============================================================

/**
 * Product variant
 */
export interface ProductVariant {
  id: string;
  name: string;
  attributes: Record<string, string>;
  price: number;
  stock: number;
  sku?: string;
  isDefault?: boolean;
  images?: string[];
}

/**
 * Product specification
 */
export interface ProductSpecification {
  key: string;
  value: string;
  displayOrder?: number;
}

/**
 * Product SEO metadata
 */
export interface ProductSEO {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  structuredData?: Record<string, any>;
}

/**
 * Product category reference
 */
export interface ProductCategory {
  _id: string;
  name: string;
  slug: string;
}

/**
 * Main Product interface
 */
export interface Product {
  _id: string;
  id: string;
  name: string;
  slug: string;
  description: string;
  excerpt?: string;
  price: number;
  originalPrice?: number;
  images: string[];
  images360?: string[];
  videoUrl?: string;
  material?: string;
  marbleType?: string;
  finish?: string;
  colors?: string[];
  category: string | ProductCategory;
  subCategory?: string | ProductCategory;
  height?: number;
  width?: number;
  depth?: number;
  weight?: number;
  inStock: boolean;
  stockQuantity?: number;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isOnSale?: boolean;
  rating?: number;
  reviewCount?: number;
  viewCount?: number;
  salesCount?: number;
  tags?: string[];
  specifications?: ProductSpecification[];
  variants?: ProductVariant[];
  seo?: ProductSEO;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// ============================================================
// Form Data Types
// ============================================================

/**
 * Product form data for create/update
 */
export interface ProductFormData {
  name: string;
  slug?: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  subCategory?: string;
  material?: string;
  marbleType?: string;
  finish?: string;
  colors?: string[] | string;
  height?: number;
  width?: number;
  depth?: number;
  weight?: number;
  inStock: boolean;
  stockQuantity?: number;
  isFeatured: boolean;
  isNew: boolean;
  tags?: string[] | string;
  specifications?: ProductSpecification[];
  images?: string[];
  images360?: string[];
  videoUrl?: string;
  seo?: ProductSEO;
}

// ============================================================
// API Request/Response Types
// ============================================================

/**
 * Product filters for listing
 */
export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  category?: string;
  subCategory?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  material?: string;
  marbleType?: string;
  finish?: string;
  colors?: string[];
  tags?: string[];
  rating?: number;
}

/**
 * Product list response (paginated)
 */
export interface ProductListResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Product bulk action payload
 */
export interface ProductBulkAction {
  action: 'delete' | 'featured' | 'unfeatured' | 'new' | 'unnew' | 'stock';
  ids: string[];
  value?: any;
}

// ============================================================
// Product Analytics Types
// ============================================================

/**
 * Product analytics summary
 */
export interface ProductAnalytics {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  featuredProducts: number;
  outOfStock: number;
  lowStock: number;
  totalViews: number;
  totalSales: number;
  totalRevenue: number;
  averagePrice: number;
}

/**
 * Product performance data
 */
export interface ProductPerformance {
  productId: string;
  name: string;
  slug: string;
  views: number;
  sales: number;
  revenue: number;
  conversionRate: number;
  averageRating: number;
}

// ============================================================
// Product Category Types
// ============================================================

/**
 * Product category (extended for admin)
 */
export interface AdminCategory {
  _id: string;
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  parentId?: string | null;
  ancestors?: string[];
  displayOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
  children?: AdminCategory[];
}

/**
 * Category form data
 */
export interface CategoryFormData {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  image?: string;
  parentId?: string | null;
  displayOrder?: number;
  isActive?: boolean;
  isFeatured?: boolean;
}

/**
 * Category filters
 */
export interface CategoryFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  parentId?: string | null;
}

/**
 * Category list response
 */
export interface CategoryListResponse {
  data: AdminCategory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================
// Product Review Types
// ============================================================

/**
 * Product review
 */
export interface ProductReview {
  _id: string;
  id: string;
  product: string | Product;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  rating: number;
  title?: string;
  comment: string;
  isAnonymous: boolean;
  isVerified: boolean;
  helpfulCount: number;
  images?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Review filters
 */
export interface ReviewFilters {
  page?: number;
  limit?: number;
  productId?: string;
  userId?: string;
  rating?: number;
  isVerified?: boolean;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Review list response
 */
export interface ReviewListResponse {
  data: ProductReview[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  averageRating: number;
}

// ============================================================
// Product Stock Types
// ============================================================

/**
 * Stock update payload
 */
export interface StockUpdatePayload {
  productId: string;
  stockQuantity: number;
  adjustmentType?: 'set' | 'add' | 'subtract';
  reason?: string;
}

/**
 * Stock alert
 */
export interface StockAlert {
  productId: string;
  name: string;
  slug: string;
  stockQuantity: number;
  threshold: number;
  status: 'low' | 'critical' | 'out';
}

// ============================================================
// Product Export Types
// ============================================================

/**
 * Product export options
 */
export interface ProductExportOptions {
  format: 'csv' | 'excel' | 'json';
  fields?: string[];
  filters?: ProductFilters;
  includeVariants?: boolean;
  includeSpecifications?: boolean;
}

// ============================================================
// Utility Types
// ============================================================

/**
 * Product status options
 */
export type ProductStatus = 'active' | 'inactive' | 'out-of-stock' | 'low-stock';

/**
 * Product sort options
 */
export type ProductSortField = 'name' | 'price' | 'stockQuantity' | 'createdAt' | 'updatedAt' | 'rating' | 'salesCount';

/**
 * Product filter options (for UI dropdowns)
 */
export interface ProductFilterOptions {
  categories: Array<{ value: string; label: string }>;
  materials: string[];
  marbleTypes: string[];
  finishes: string[];
  colors: string[];
  tags: string[];
  priceRange: { min: number; max: number };
}

// ============================================================
// Default export
// ============================================================

export type {
  Product as ProductType,
  ProductFormData as ProductFormDataType,
  ProductFilters as ProductFiltersType,
  ProductListResponse as ProductListResponseType,
};

/**
 * Default export for convenient importing
 */
const productTypes = {
  // Export all types as a namespace for easier imports
};

export default productTypes;