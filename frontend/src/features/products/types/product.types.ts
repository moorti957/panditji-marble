// frontend/src/features/products/types/product.types.ts

// ============================================================
// Core Product Types
// ============================================================

/**
 * Main Product interface representing a complete product entity
 */
export interface Product {
  /** Unique identifier for the product */
  id: string;
  
  /** Product name */
  name: string;
  
  /** URL-friendly slug for the product */
  slug: string;
  
  /** Detailed product description (HTML or markdown) */
  description: string;
  
  /** Short excerpt/summary of the product */
  excerpt?: string;
  
  /** Current selling price in INR */
  price: number;
  
  /** Original price before discount (if any) */
  originalPrice?: number;
  
  /** Discount percentage (derived from originalPrice/price, but some UIs read it directly) */
  discount?: number;
  
  /** Array of product image URLs */
  images: string[];
  
  /** Array of 360-degree view image URLs (optional) */
  images360?: string[];
  
  /** Product video URL (optional) */
  videoUrl?: string;
  
  /** Material used (e.g., 'Marble', 'Brass', 'Wood') */
  material?: string;
  
  /** Type of marble used (e.g., 'Makrana', 'White', 'Pink') */
  marbleType?: string;
  
  /** Finish type (e.g., 'Polished', 'Matte', 'Antique') */
  finish?: string;
  
  /** Available colors */
  colors?: string[];
  
  /** Product category ID */
  category: string;
  
  /** Product category name */
  categoryName?: string;
  
  /** Product sub-category ID */
  subCategory?: string;
  
  /** Product tags for filtering */
  tags?: string[];
  
  /** Height in centimeters */
  height?: number;
  
  /** Width in centimeters */
  width?: number;
  
  /** Depth in centimeters */
  depth?: number;
  
  /** Weight in kilograms */
  weight?: number;
  
  /** Whether the product is in stock */
  inStock: boolean;
  
  /** Current stock quantity */
  stockQuantity?: number;
  
  /** Whether the product is featured */
  isFeatured?: boolean;
  
  /** Whether the product is new */
  isNew?: boolean;
  
  /** Whether the product is on sale */
  isOnSale?: boolean;
  
  /** Average rating (1-5) */
  rating?: number;
  
  /** Number of reviews */
  reviewCount?: number;
  
  /** Estimated delivery time in days */
  estimatedDelivery?: string;
  
  /** SKU (Stock Keeping Unit) */
  sku?: string;
  
  /** GST rate applied to the product */
  gstRate?: number;
  
  /** Handcrafted details/notes */
  handcraftedDetails?: string;
  
  /** Product specifications */
  specifications?: ProductSpecification[];
  
  /** Product variants (if any) */
  variants?: ProductVariant[];
  
  /** Related product IDs */
  relatedProductIds?: string[];
  
  /** Creation timestamp */
  createdAt: string;
  
  /** Last update timestamp */
  updatedAt: string;
  
  /** Whether the product is active */
  isActive?: boolean;
  
  /** SEO metadata */
  seo?: ProductSEO;
}

/**
 * Product specifications (key-value pairs with display order)
 */
export interface ProductSpecification {
  /** Specification key (e.g., 'Material', 'Height') */
  key: string;
  
  /** Specification value (e.g., 'Marble', '12 cm') */
  value: string;
  
  /** Display order (ascending) */
  displayOrder?: number;
  
  /** Icon or label for the specification (optional) */
  icon?: string;
}

/**
 * Product variant (e.g., different sizes, colors, materials)
 */
export interface ProductVariant {
  /** Unique variant ID */
  id: string;
  
  /** Variant name (e.g., 'Small', 'Large', 'Gold Finish') */
  name: string;
  
  /** Variant attributes (e.g., { size: 'M', color: 'Gold' }) */
  attributes: Record<string, string>;
  
  /** Price for this variant */
  price: number;
  
  /** Stock quantity for this variant */
  stock: number;
  
  /** SKU for this variant */
  sku?: string;
  
  /** Whether this variant is the default */
  isDefault?: boolean;
  
  /** Images for this variant (overrides main product images) */
  images?: string[];
}

/**
 * Product SEO metadata
 */
export interface ProductSEO {
  /** SEO title (overrides default title) */
  title?: string;
  
  /** SEO description */
  description?: string;
  
  /** SEO keywords */
  keywords?: string[];
  
  /** Canonical URL */
  canonicalUrl?: string;
  
  /** Open Graph image URL */
  ogImage?: string;
  
  /** Structured data (JSON-LD) */
  structuredData?: Record<string, any>;
}

// ============================================================
// Filter & Query Types
// ============================================================

/**
 * Product filters for listing and search
 */
export interface ProductFilters {
  /** Filter by category ID */
  category?: string;
  
  /** Filter by sub-category ID */
  subCategory?: string;
  
  /** Search query (name, description, tags) */
  search?: string;
  
  /** Minimum price filter */
  minPrice?: number;
  
  /** Maximum price filter */
  maxPrice?: number;
  
  /** Filter by material */
  material?: string;
  
  /** Filter by marble type */
  marbleType?: string;
  
  /** Filter by finish */
  finish?: string;
  
  /** Filter by colors */
  colors?: string[];
  
  /** Filter by height (cm) */
  height?: number;
  
  /** Filter by weight (kg) */
  weight?: number;
  
  /** Filter by in-stock status */
  inStock?: boolean;
  
  /** Filter by featured status */
  isFeatured?: boolean;
  
  /** Filter by new status */
  isNew?: boolean;
  
  /** Filter by minimum rating */
  rating?: number;
  
  /** Filter by tags */
  tags?: string[];
  
  /** Filter by availability (delivery time in days) */
  maxDeliveryDays?: number;
  
  /** Sort order */
  sort?: ProductSortOption;
  
  /** Page number (1-indexed) */
  page?: number;
  
  /** Number of items per page */
  limit?: number;
}

/**
 * Product sort options
 */
export type ProductSortOption =
  | 'newest'
  | 'price-asc'
  | 'price-desc'
  | 'popular'
  | 'rating'
  | 'name-asc'
  | 'name-desc';

/**
 * Product list response with pagination metadata
 */
export interface ProductListResponse {
  /** Array of products for current page */
  products: Product[];
  
  /** Total number of products matching the query */
  total: number;
  
  /** Current page number */
  page: number;
  
  /** Number of items per page */
  limit: number;
  
  /** Total number of pages */
  totalPages: number;
  
  /** Available filter options (for UI) */
  filters?: ProductFilterOptions;
  
  /** Execution time in milliseconds */
  executionTime?: number;
}

/**
 * Available filter options (populates filter UI)
 */
export interface ProductFilterOptions {
  /** Available materials */
  materials: string[];
  
  /** Available marble types */
  marbleTypes: string[];
  
  /** Available finishes */
  finishes: string[];
  
  /** Available colors */
  colors: string[];
  
  /** Price range (min/max) */
  priceRange: {
    min: number;
    max: number;
  };
  
  /** Available heights */
  heights: number[];
  
  /** Available weights */
  weights: number[];
  
  /** Available tags */
  tags: string[];
  
  /** Available categories with counts */
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    count: number;
  }>;
}

// ============================================================
// Review Types
// ============================================================

/**
 * Product review
 */
export interface ProductReview {
  /** Unique review ID */
  id: string;
  
  /** User ID who submitted the review */
  userId: string;
  
  /** User name (for display) */
  userName: string;
  
  /** User avatar (optional) */
  userAvatar?: string;
  
  /** Rating (1-5) */
  rating: number;
  
  /** Review title */
  title?: string;
  
  /** Review comment */
  comment: string;
  
  /** Whether the review is verified (from verified purchase) */
  isVerified?: boolean;
  
  /** Whether the review is anonymous */
  isAnonymous?: boolean;
  
  /** Helpful votes count */
  helpfulCount: number;
  
  /** User has found this helpful (requires auth) */
  userHelpful?: boolean;
  
  /** Review images */
  images?: string[];
  
  /** Review creation timestamp */
  createdAt: string;
  
  /** Review update timestamp */
  updatedAt?: string;
  
  /** Admin response (if any) */
  response?: {
    text: string;
    createdAt: string;
  };
}

/**
 * Reviews response with metadata
 */
export interface ProductReviewsResponse {
  /** Array of reviews */
  reviews: ProductReview[];
  
  /** Total number of reviews */
  total: number;
  
  /** Average rating */
  averageRating: number;
  
  /** Rating distribution { '5': 10, '4': 5, ... } */
  ratingDistribution: Record<string, number>;
  
  /** Current page */
  page: number;
  
  /** Total pages */
  totalPages: number;
}

/**
 * Review submission data
 */
export interface ReviewSubmissionData {
  /** Rating (1-5) */
  rating: number;
  
  /** Review comment */
  comment: string;
  
  /** Review title (optional) */
  title?: string;
  
  /** Whether to be anonymous */
  anonymous?: boolean;
  
  /** Review images (optional) */
  images?: File[];
}

// ============================================================
// Product Availability Types
// ============================================================

/**
 * Product availability information
 */
export interface ProductAvailability {
  /** Whether the product is in stock */
  inStock: boolean;
  
  /** Current stock quantity */
  stockQuantity: number;
  
  /** Estimated delivery time in days */
  estimatedDelivery: string;
  
  /** Minimum delivery days */
  minDeliveryDays: number;
  
  /** Maximum delivery days */
  maxDeliveryDays: number;
  
  /** Pincode availability */
  pincodeAvailable?: boolean;
  
  /** Serviceable pincodes */
  serviceablePincodes?: number[];
}

// ============================================================
// Product Inquiry / Custom Request Types
// ============================================================

/**
 * Custom murti request data
 */
export interface CustomMurtiRequest {
  /** Requester name */
  name: string;
  
  /** Requester email */
  email: string;
  
  /** Requester phone */
  phone: string;
  
  /** Request description (details of the custom murti) */
  description: string;
  
  /** Budget range */
  budget?: number;
  
  /** Desired dimensions (e.g., '12x8x6 inches') */
  dimensions?: string;
  
  /** Desired material */
  material?: string;
  
  /** Reference image URLs */
  referenceImages?: string[];
  
  /** Preferred delivery date */
  preferredDeliveryDate?: string;
  
  /** Additional notes */
  notes?: string;
}

/**
 * Custom murti request response
 */
export interface CustomMurtiRequestResponse {
  /** Request ID for tracking */
  requestId: string;
  
  /** Confirmation message */
  message: string;
  
  /** Estimated response time */
  estimatedResponseTime?: string;
}

// ============================================================
// Product Comparison Types
// ============================================================

/**
 * Product comparison result
 */
export interface ProductComparison {
  /** Products being compared */
  products: Product[];
  
  /** Comparison attributes */
  attributes: {
    key: string;
    label: string;
    values: (string | number | null)[];
  }[];
}

// ============================================================
// Product Analytics Types
// ============================================================

/**
 * Product view tracking data
 */
export interface ProductViewData {
  /** Product ID */
  productId: string;
  
  /** Session ID */
  sessionId?: string;
  
  /** User ID (if authenticated) */
  userId?: string;
  
  /** Referrer URL */
  referrer?: string;
  
  /** Device type */
  device?: 'mobile' | 'tablet' | 'desktop';
  
  /** Timestamp */
  timestamp?: string;
}

/**
 * Product analytics summary
 */
export interface ProductAnalytics {
  /** Total views */
  views: number;
  
  /** Unique visitors */
  uniqueVisitors: number;
  
  /** Add to cart count */
  addToCartCount: number;
  
  /** Conversion rate (purchases / views) */
  conversionRate: number;
  
  /** Average time on page (seconds) */
  avgTimeOnPage: number;
  
  /** Bounce rate */
  bounceRate: number;
}

// ============================================================
// Category Types (for product categorization)
// ============================================================

/**
 * Product category
 */
export interface ProductCategory {
  /** Category ID */
  id: string;
  
  /** Category name */
  name: string;
  
  /** URL-friendly slug */
  slug: string;
  
  /** Category description */
  description?: string;
  
  /** Category icon (emoji or image URL) */
  icon?: string;
  
  /** Cover image URL */
  image?: string;
  
  /** Parent category ID (for nested categories) */
  parentId?: string;
  
  /** Child categories */
  children?: ProductCategory[];
  
  /** Product count in this category */
  productCount: number;
  
  /** Display order */
  displayOrder?: number;
  
  /** Whether the category is active */
  isActive?: boolean;
  
  /** SEO metadata */
  seo?: {
    title?: string;
    description?: string;
  };
}

// ============================================================
// Product Collection Types
// ============================================================

/**
 * Product collection (curated set of products)
 */
export interface ProductCollection {
  /** Collection ID */
  id: string;
  
  /** Collection name */
  name: string;
  
  /** Collection slug */
  slug: string;
  
  /** Collection description */
  description?: string;
  
  /** Cover image URL */
  image?: string;
  
  /** Product IDs in this collection */
  productIds: string[];
  
  /** Whether collection is featured */
  isFeatured?: boolean;
  
  /** Display order */
  displayOrder?: number;
  
  /** Creation timestamp */
  createdAt: string;
}

// ============================================================
// Utility Types
// ============================================================

/**
 * Product form data (for admin/cart)
 */
export interface ProductFormData {
  /** Product name */
  name: string;
  
  /** Product description */
  description: string;
  
  /** Price */
  price: number;
  
  /** Original price (for discount) */
  originalPrice?: number;
  
  /** Images (File objects for upload) */
  images?: File[];
  
  /** Category ID */
  category: string;
  
  /** Material */
  material?: string;
  
  /** Height in cm */
  height?: number;
  
  /** Weight in kg */
  weight?: number;
  
  /** In stock status */
  inStock: boolean;
  
  /** Stock quantity */
  stockQuantity?: number;
  
  /** Whether featured */
  isFeatured?: boolean;
  
  /** Whether new */
  isNew?: boolean;
  
  /** Tags */
  tags?: string[];
}

/**
 * Product list query parameters (used in API calls)
 */
export interface ProductListQueryParams extends ProductFilters {
  /** Search query override (alias for search) */
  q?: string;
  
  /** Fields to include/exclude */
  fields?: string[];
  
  /** Include related data */
  include?: ('category' | 'variants' | 'specifications' | 'reviews')[];
}

// ============================================================
// Default export
// ============================================================
export default Product;