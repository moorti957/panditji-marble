// frontend/src/features/products/api/productsApi.ts

import { apiClient } from '@/services/apiClient';
import type {
  Product,
  ProductFilters,
  ProductListResponse,
  ProductVariant,
  ProductSpecification,
  ProductReview,
} from '@/features/products/types/product.types';

// ============================================================
// Query Key Generation
// ============================================================
export const productQueryKeys = {
  all: ['products'] as const,
  lists: () => [...productQueryKeys.all, 'list'] as const,
  list: (filters: ProductFilters) => [...productQueryKeys.lists(), filters] as const,
  details: () => [...productQueryKeys.all, 'detail'] as const,
  detail: (slug: string) => [...productQueryKeys.details(), slug] as const,
  related: (productId: string) => [...productQueryKeys.all, 'related', productId] as const,
  categories: () => [...productQueryKeys.all, 'categories'] as const,
  filters: () => [...productQueryKeys.all, 'filters'] as const,
  reviews: (productId: string) => [...productQueryKeys.all, 'reviews', productId] as const,
};

// ============================================================
// API Functions
// ============================================================

/**
 * Get all products with optional filters, sorting, and pagination
 * 
 * @param filters - Filter, sort, and pagination parameters
 * @returns Promise with product list and metadata
 * 
 * @example
 * ```ts
 * const { data } = await productsApi.getAll({
 *   category: 'ganesh',
 *   minPrice: 1000,
 *   maxPrice: 5000,
 *   sort: 'price-asc',
 *   page: 1,
 *   limit: 12,
 * });
 * ```
 */
export const productsApi = {
  /**
   * Get all products with filtering, sorting, and pagination
   */
  getAll: async (filters: ProductFilters = {}): Promise<ProductListResponse> => {
    const params = new URLSearchParams();

    // Apply filters
    if (filters.category) params.append('category', filters.category);
    if (filters.subCategory) params.append('subCategory', filters.subCategory);
    if (filters.search) params.append('search', filters.search);
    if (filters.minPrice !== undefined) params.append('minPrice', String(filters.minPrice));
    if (filters.maxPrice !== undefined) params.append('maxPrice', String(filters.maxPrice));
    if (filters.material) params.append('material', filters.material);
    if (filters.colors && filters.colors.length > 0) {
      filters.colors.forEach((color) => params.append('colors', color));
    }
    if (filters.height !== undefined) params.append('height', String(filters.height));
    if (filters.weight !== undefined) params.append('weight', String(filters.weight));
    if (filters.inStock !== undefined) params.append('inStock', String(filters.inStock));
    if (filters.isFeatured !== undefined) params.append('isFeatured', String(filters.isFeatured));
    if (filters.isNew !== undefined) params.append('isNew', String(filters.isNew));
    if (filters.rating !== undefined) params.append('rating', String(filters.rating));
    if (filters.tags && filters.tags.length > 0) {
      filters.tags.forEach((tag) => params.append('tags', tag));
    }
    
    // Apply sort
    if (filters.sort) params.append('sort', filters.sort);
    
    // Apply pagination
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const queryString = params.toString();
    const url = queryString ? `/products?${queryString}` : '/products';
    const response = await apiClient.get(url);

const products = response.data.data.products.map((product: any) => ({
  ...product,
  id: product.id || product._id,
}));

return {
  ...response.data.data,
  products,
};
  },

  /**
   * Get a single product by slug
   * 
   * @param slug - Product slug
   * @returns Promise with product details
   */
  getBySlug: async (slug: string): Promise<Product> => {
    const response = await apiClient.get(`/products/${slug}`);
    return response.data.data;
  },

  /**
   * Get a single product by ID
   */
  getById: async (id: string): Promise<Product> => {
    const response = await apiClient.get(`/products/id/${id}`);
    return response.data.data;
  },

  /**
   * Get related products for a given product ID
   * 
   * @param productId - Product ID
   * @param limit - Number of related products to fetch
   * @returns Promise with array of related products
   */
  getRelated: async (productId: string, limit: number = 6): Promise<Product[]> => {
    const response = await apiClient.get(`/products/${productId}/related?limit=${limit}`);
    return response.data.data;
  },

  /**
   * Get product categories
   */
  getCategories: async (): Promise<Array<{ id: string; name: string; slug: string; count: number }>> => {
    const response = await apiClient.get('/products/categories');
    return response.data.data;
  },

  /**
   * Get available filter options (materials, colors, price range, etc.)
   */
  getFilterOptions: async (): Promise<{
    materials: string[];
    colors: string[];
    priceRange: { min: number; max: number };
    heights: number[];
    weights: number[];
    tags: string[];
  }> => {
    const response = await apiClient.get('/products/filters');
    return response.data.data;
  },

  /**
   * Get product reviews
   */
  getReviews: async (
    productId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    reviews: ProductReview[];
    total: number;
    averageRating: number;
  }> => {
    const response = await apiClient.get(`/products/${productId}/reviews?page=${page}&limit=${limit}`);
    return response.data.data;
  },

  /**
   * Submit a product review
   */
  submitReview: async (
    productId: string,
    reviewData: {
      rating: number;
      comment: string;
      title?: string;
      anonymous?: boolean;
    }
  ): Promise<ProductReview> => {
    const response = await apiClient.post(`/products/${productId}/reviews`, reviewData);
    return response.data.data;
  },

  /**
   * Get product variants (if any)
   */
  getVariants: async (productId: string): Promise<ProductVariant[]> => {
    const response = await apiClient.get(`/products/${productId}/variants`);
    return response.data.data;
  },

  /**
   * Get product specifications
   */
  getSpecifications: async (productId: string): Promise<ProductSpecification[]> => {
    const response = await apiClient.get(`/products/${productId}/specifications`);
    return response.data.data;
  },

  /**
   * Search products with autocomplete (for live search)
   */
  autocomplete: async (query: string, limit: number = 5): Promise<Product[]> => {
    const response = await apiClient.get(`/products/search/autocomplete?q=${encodeURIComponent(query)}&limit=${limit}`);
    return response.data.data;
  },

  /**
   * Get featured products
   */
  getFeatured: async (limit: number = 8): Promise<Product[]> => {
    const response = await apiClient.get(`/products/featured?limit=${limit}`);
    return response.data.data;
  },

  /**
   * Get new arrivals
   */
  getNewArrivals: async (limit: number = 8): Promise<Product[]> => {
    const response = await apiClient.get(`/products/new?limit=${limit}`);
    return response.data.data;
  },

  /**
   * Get best sellers
   */
  getBestSellers: async (limit: number = 8): Promise<Product[]> => {
    const response = await apiClient.get(`/products/best-sellers?limit=${limit}`);
    return response.data.data;
  },

  /**
   * Get trending products
   */
  getTrending: async (limit: number = 8): Promise<Product[]> => {
    const response = await apiClient.get(`/products/trending?limit=${limit}`);
    return response.data.data;
  },

  /**
   * Get recently viewed products (requires auth or session)
   */
  getRecentlyViewed: async (): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>('/products/recently-viewed');
    return response.data;
  },

  /**
   * Track product view (for analytics)
   */
  trackView: async (productId: string): Promise<void> => {
    await apiClient.post(`/products/${productId}/view`);
  },

  /**
   * Compare multiple products
   */
  compare: async (productIds: string[]): Promise<Product[]> => {
    const ids = productIds.join(',');
    const response = await apiClient.get<Product[]>(`/products/compare?ids=${ids}`);
    return response.data;
  },

  /**
   * Get product availability (for quick check)
   */
  checkAvailability: async (productId: string): Promise<{ inStock: boolean; estimatedDelivery: string }> => {
    const response = await apiClient.get(`/products/${productId}/availability`);
    return response.data;
  },

  /**
   * Request a custom murti (inquiry)
   */
  requestCustomMurti: async (data: {
    name: string;
    email: string;
    phone: string;
    description: string;
    budget?: number;
    dimensions?: string;
    referenceImages?: string[];
  }): Promise<{ requestId: string; message: string }> => {
    const response = await apiClient.post('/products/custom-request', data);
    return response.data;
  },

  /**
   * Get product by SKU (for admin/internal use)
   */
  getBySKU: async (sku: string): Promise<Product> => {
    const response = await apiClient.get<Product>(`/products/sku/${sku}`);
    return response.data;
  },

  /**
   * Bulk product import (admin only)
   */
  bulkImport: async (file: File): Promise<{ imported: number; failed: number; errors: string[] }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/products/bulk-import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// ============================================================
// Utility Functions
// ============================================================

/**
 * Build filter query string for use with fetch/axios
 */
export function buildProductFilterQuery(filters: ProductFilters): string {
  const params = new URLSearchParams();
  
  if (filters.category) params.append('category', filters.category);
  if (filters.subCategory) params.append('subCategory', filters.subCategory);
  if (filters.search) params.append('search', filters.search);
  if (filters.minPrice !== undefined) params.append('minPrice', String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.append('maxPrice', String(filters.maxPrice));
  if (filters.material) params.append('material', filters.material);
  if (filters.colors && filters.colors.length > 0) {
    filters.colors.forEach((color) => params.append('colors', color));
  }
  if (filters.sort) params.append('sort', filters.sort);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));
  
  return params.toString();
}

/**
 * Transform product data for display
 */
export function transformProduct(product: Product): Product & {
  displayPrice: string;
  discountPercentage: number;
  isOnSale: boolean;
} {
  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return {
    ...product,
    displayPrice: product.price.toLocaleString('en-IN'),
    discountPercentage,
    isOnSale: !!product.originalPrice && product.originalPrice > product.price,
  };
}

/**
 * Extract unique materials from product list
 */
export function extractMaterials(products: Product[]): string[] {
  const materials = new Set<string>();
  products.forEach((p) => {
    if (p.material) materials.add(p.material);
  });
  return Array.from(materials);
}

/**
 * Extract unique colors from product list
 */
export function extractColors(products: Product[]): string[] {
  const colors = new Set<string>();
  products.forEach((p) => {
    if (p.colors) {
      p.colors.forEach((c) => colors.add(c));
    }
  });
  return Array.from(colors);
}

/**
 * Get price range from product list
 */
export function getPriceRange(products: Product[]): { min: number; max: number } {
  if (products.length === 0) return { min: 0, max: 0 };
  const prices = products.map((p) => p.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

// ============================================================
// Default export
// ============================================================
export default productsApi;