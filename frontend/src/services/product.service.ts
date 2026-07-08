// frontend/src/services/product.service.ts

import { get, post, put, del, uploadFile, handleApiError, type ApiError } from '@/services/apiClient';
import type { Product, ProductFilters, ProductListResponse, ProductReview } from '@/features/products/types/product.types';

// ============================================================
// Types
// ============================================================

export interface ProductServiceResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface ProductSearchResult {
  products: Product[];
  total: number;
  query: string;
}

// ============================================================
// Product Service Class
// ============================================================

class ProductService {
  private static instance: ProductService;
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): ProductService {
    if (!ProductService.instance) {
      ProductService.instance = new ProductService();
    }
    return ProductService.instance;
  }

  // ============================================================
  // Cache Helpers
  // ============================================================

  private getCacheKey(endpoint: string, params?: object): string {
    const sortedParams = params ? JSON.stringify(params, Object.keys(params).sort()) : '';
    return `${endpoint}${sortedParams}`;
  }

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data as T;
    }
    return null;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private invalidateCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // ============================================================
  // Product CRUD Operations
  // ============================================================

  /**
   * Get all products with optional filters, sorting, and pagination
   */
  async getProducts(filters: ProductFilters = {}): Promise<ProductServiceResponse<ProductListResponse>> {
    try {
      const cacheKey = this.getCacheKey('/products', filters);
      const cached = this.getCached<ProductListResponse>(cacheKey);
      if (cached) {
        return { data: cached, success: true };
      }

      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.subCategory) params.append('subCategory', filters.subCategory);
      if (filters.search) params.append('search', filters.search);
      if (filters.minPrice !== undefined) params.append('minPrice', String(filters.minPrice));
      if (filters.maxPrice !== undefined) params.append('maxPrice', String(filters.maxPrice));
      if (filters.material) params.append('material', filters.material);
      if (filters.colors && filters.colors.length > 0) {
        filters.colors.forEach((c) => params.append('colors', c));
      }
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.page) params.append('page', String(filters.page));
      if (filters.limit) params.append('limit', String(filters.limit));

      const queryString = params.toString();
      const url = queryString ? `/products?${queryString}` : '/products';
      
      const data = await get<ProductListResponse>(url);
      this.setCache(cacheKey, data);
      
      return { data, success: true };
    } catch (error) {
      return {
        data: { products: [], total: 0, page: 1, limit: 0, totalPages: 0 },
        success: false,
        error: handleApiError(error),
      };
    }
  }

  /**
   * Get a single product by slug
   */
  async getProductBySlug(slug: string): Promise<ProductServiceResponse<Product>> {
    try {
      const cacheKey = this.getCacheKey(`/products/${slug}`);
      const cached = this.getCached<Product>(cacheKey);
      if (cached) {
        return { data: cached, success: true };
      }

      const data = await get<Product>(`/products/${slug}`);
      this.setCache(cacheKey, data);
      return { data, success: true };
    } catch (error) {
      return {
        data: null as unknown as Product,
        success: false,
        error: handleApiError(error),
      };
    }
  }

  /**
   * Get a single product by ID
   */
  async getProductById(id: string): Promise<ProductServiceResponse<Product>> {
    try {
      const cacheKey = this.getCacheKey(`/products/id/${id}`);
      const cached = this.getCached<Product>(cacheKey);
      if (cached) {
        return { data: cached, success: true };
      }

      const data = await get<Product>(`/products/id/${id}`);
      this.setCache(cacheKey, data);
      return { data, success: true };
    } catch (error) {
      return {
        data: null as unknown as Product,
        success: false,
        error: handleApiError(error),
      };
    }
  }

  /**
   * Get related products
   */
  async getRelatedProducts(productId: string, limit: number = 6): Promise<ProductServiceResponse<Product[]>> {
    try {
      const cacheKey = this.getCacheKey(`/products/${productId}/related`, { limit });
      const cached = this.getCached<Product[]>(cacheKey);
      if (cached) {
        return { data: cached, success: true };
      }

      const data = await get<Product[]>(`/products/${productId}/related?limit=${limit}`);
      this.setCache(cacheKey, data);
      return { data, success: true };
    } catch (error) {
      return {
        data: [],
        success: false,
        error: handleApiError(error),
      };
    }
  }

  /**
   * Get product reviews
   */
  async getProductReviews(
    productId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ProductServiceResponse<{ reviews: ProductReview[]; total: number; averageRating: number }>> {
    try {
      const cacheKey = this.getCacheKey(`/products/${productId}/reviews`, { page, limit });
      const cached = this.getCached<{ reviews: ProductReview[]; total: number; averageRating: number }>(cacheKey);
      if (cached) {
        return { data: cached, success: true };
      }

      const data = await get<{ reviews: ProductReview[]; total: number; averageRating: number }>(
        `/products/${productId}/reviews?page=${page}&limit=${limit}`
      );
      this.setCache(cacheKey, data);
      return { data, success: true };
    } catch (error) {
      return {
        data: { reviews: [], total: 0, averageRating: 0 },
        success: false,
        error: handleApiError(error),
      };
    }
  }

  /**
   * Submit a product review
   */
  async submitReview(
    productId: string,
    reviewData: { rating: number; comment: string; title?: string; anonymous?: boolean }
  ): Promise<ProductServiceResponse<ProductReview>> {
    try {
      const data = await post<ProductReview>(`/products/${productId}/reviews`, reviewData);
      this.invalidateCache(`/products/${productId}/reviews`);
      this.invalidateCache(`/products/${productId}`);
      return { data, success: true };
    } catch (error) {
      return {
        data: null as unknown as ProductReview,
        success: false,
        error: handleApiError(error),
      };
    }
  }

  // ============================================================
  // Featured & Special Collections
  // ============================================================

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit: number = 8): Promise<ProductServiceResponse<Product[]>> {
    try {
      const cacheKey = this.getCacheKey('/products/featured', { limit });
      const cached = this.getCached<Product[]>(cacheKey);
      if (cached) {
        return { data: cached, success: true };
      }

      const data = await get<Product[]>(`/products/featured?limit=${limit}`);
      this.setCache(cacheKey, data);
      return { data, success: true };
    } catch (error) {
      return {
        data: [],
        success: false,
        error: handleApiError(error),
      };
    }
  }

  /**
   * Get new arrivals
   */
  async getNewArrivals(limit: number = 8): Promise<ProductServiceResponse<Product[]>> {
    try {
      const cacheKey = this.getCacheKey('/products/new', { limit });
      const cached = this.getCached<Product[]>(cacheKey);
      if (cached) {
        return { data: cached, success: true };
      }

      const data = await get<Product[]>(`/products/new?limit=${limit}`);
      this.setCache(cacheKey, data);
      return { data, success: true };
    } catch (error) {
      return {
        data: [],
        success: false,
        error: handleApiError(error),
      };
    }
  }

  /**
   * Get best sellers
   */
  async getBestSellers(limit: number = 8): Promise<ProductServiceResponse<Product[]>> {
    try {
      const cacheKey = this.getCacheKey('/products/best-sellers', { limit });
      const cached = this.getCached<Product[]>(cacheKey);
      if (cached) {
        return { data: cached, success: true };
      }

      const data = await get<Product[]>(`/products/best-sellers?limit=${limit}`);
      this.setCache(cacheKey, data);
      return { data, success: true };
    } catch (error) {
      return {
        data: [],
        success: false,
        error: handleApiError(error),
      };
    }
  }

  /**
   * Get trending products
   */
  async getTrendingProducts(limit: number = 8): Promise<ProductServiceResponse<Product[]>> {
    try {
      const cacheKey = this.getCacheKey('/products/trending', { limit });
      const cached = this.getCached<Product[]>(cacheKey);
      if (cached) {
        return { data: cached, success: true };
      }

      const data = await get<Product[]>(`/products/trending?limit=${limit}`);
      this.setCache(cacheKey, data);
      return { data, success: true };
    } catch (error) {
      return {
        data: [],
        success: false,
        error: handleApiError(error),
      };
    }
  }

  // ============================================================
  // Search & Filters
  // ============================================================

  /**
   * Autocomplete search for live search
   */
  async autocompleteSearch(query: string, limit: number = 5): Promise<ProductServiceResponse<Product[]>> {
    if (!query || query.length < 2) {
      return { data: [], success: true };
    }

    try {
      const cacheKey = this.getCacheKey('/products/search/autocomplete', { query, limit });
      const cached = this.getCached<Product[]>(cacheKey);
      if (cached) {
        return { data: cached, success: true };
      }

      const data = await get<Product[]>(`/products/search/autocomplete?q=${encodeURIComponent(query)}&limit=${limit}`);
      this.setCache(cacheKey, data);
      return { data, success: true };
    } catch (error) {
      return {
        data: [],
        success: false,
        error: handleApiError(error),
      };
    }
  }

  /**
   * Advanced search with filters
   */
  async searchProducts(query: string, filters?: ProductFilters): Promise<ProductServiceResponse<ProductSearchResult>> {
    try {
      const params = new URLSearchParams();
      params.append('q', query);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.minPrice !== undefined) params.append('minPrice', String(filters.minPrice));
      if (filters?.maxPrice !== undefined) params.append('maxPrice', String(filters.maxPrice));
      if (filters?.sort) params.append('sort', filters.sort);
      if (filters?.page) params.append('page', String(filters.page));
      if (filters?.limit) params.append('limit', String(filters.limit));

      const data = await get<{ products: Product[]; total: number }>(`/products/search?${params}`);
      return {
        data: { products: data.products, total: data.total, query },
        success: true,
      };
    } catch (error) {
      return {
        data: { products: [], total: 0, query },
        success: false,
        error: handleApiError(error),
      };
    }
  }

  /**
   * Get filter options (materials, colors, price range, etc.)
   */
  async getFilterOptions(): Promise<
    ProductServiceResponse<{
      materials: string[];
      colors: string[];
      priceRange: { min: number; max: number };
      heights: number[];
      weights: number[];
      tags: string[];
    }>
  > {
    try {
      const cacheKey = this.getCacheKey('/products/filters');
      const cached = this.getCached<{
        materials: string[];
        colors: string[];
        priceRange: { min: number; max: number };
        heights: number[];
        weights: number[];
        tags: string[];
      }>(cacheKey);
      if (cached) {
        return { data: cached, success: true };
      }

      const data = await get<{
        materials: string[];
        colors: string[];
        priceRange: { min: number; max: number };
        heights: number[];
        weights: number[];
        tags: string[];
      }>('/products/filters');
      this.setCache(cacheKey, data);
      return { data, success: true };
    } catch (error) {
      return {
        data: { materials: [], colors: [], priceRange: { min: 0, max: 0 }, heights: [], weights: [], tags: [] },
        success: false,
        error: handleApiError(error),
      };
    }
  }

  // ============================================================
  // Product Analytics & Tracking
  // ============================================================

  /**
   * Track product view
   */
  async trackProductView(productId: string): Promise<void> {
    try {
      await post(`/products/${productId}/view`, {});
    } catch {
      // Silently fail – tracking is not critical
    }
  }

  /**
   * Get recently viewed products
   */
  async getRecentlyViewed(): Promise<ProductServiceResponse<Product[]>> {
    try {
      const data = await get<Product[]>('/products/recently-viewed');
      return { data, success: true };
    } catch (error) {
      return {
        data: [],
        success: false,
        error: handleApiError(error),
      };
    }
  }

  // ============================================================
  // Product Comparison
  // ============================================================

  /**
   * Compare multiple products
   */
  async compareProducts(productIds: string[]): Promise<ProductServiceResponse<Product[]>> {
    try {
      const ids = productIds.join(',');
      const data = await get<Product[]>(`/products/compare?ids=${ids}`);
      return { data, success: true };
    } catch (error) {
      return {
        data: [],
        success: false,
        error: handleApiError(error),
      };
    }
  }

  // ============================================================
  // Custom Murti Request
  // ============================================================

  /**
   * Request a custom murti
   */
  async requestCustomMurti(data: {
    name: string;
    email: string;
    phone: string;
    description: string;
    budget?: number;
    dimensions?: string;
    referenceImages?: string[];
  }): Promise<ProductServiceResponse<{ requestId: string; message: string }>> {
    try {
      const response = await post<{ requestId: string; message: string }>('/products/custom-request', data);
      return { data: response, success: true };
    } catch (error) {
      return {
        data: { requestId: '', message: '' },
        success: false,
        error: handleApiError(error),
      };
    }
  }

  // ============================================================
  // Product Availability
  // ============================================================

  /**
   * Check product availability
   */
  async checkAvailability(productId: string): Promise<
    ProductServiceResponse<{ inStock: boolean; estimatedDelivery: string; stockQuantity?: number }>
  > {
    try {
      const data = await get<{ inStock: boolean; estimatedDelivery: string; stockQuantity?: number }>(
        `/products/${productId}/availability`
      );
      return { data, success: true };
    } catch (error) {
      return {
        data: { inStock: false, estimatedDelivery: 'Unknown' },
        success: false,
        error: handleApiError(error),
      };
    }
  }

  // ============================================================
  // Cache Management
  // ============================================================

  /**
   * Clear all cached product data
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clear cache for a specific product
   */
  clearProductCache(productId: string): void {
    this.invalidateCache(`/products/${productId}`);
    this.invalidateCache(`/products/id/${productId}`);
    this.invalidateCache(`/products/${productId}/reviews`);
  }

  // ============================================================
  // Data Transformations
  // ============================================================

  /**
   * Transform product data for display
   */
  transformProduct(product: Product): Product & {
    displayPrice: string;
    discountPercentage: number;
    isOnSale: boolean;
    imageUrls: string[];
  } {
    const discountPercentage = product.originalPrice
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

    return {
      ...product,
      displayPrice: product.price.toLocaleString('en-IN'),
      discountPercentage,
      isOnSale: !!product.originalPrice && product.originalPrice > product.price,
      imageUrls: product.images || [],
    };
  }

  /**
   * Transform multiple products
   */
  transformProducts(products: Product[]): (Product & {
    displayPrice: string;
    discountPercentage: number;
    isOnSale: boolean;
    imageUrls: string[];
  })[] {
    return products.map((p) => this.transformProduct(p));
  }

  /**
   * Extract price range from product list
   */
  getPriceRange(products: Product[]): { min: number; max: number } {
    if (!products || products.length === 0) {
      return { min: 0, max: 0 };
    }
    const prices = products.map((p) => p.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }

  /**
   * Extract unique materials from product list
   */
  getMaterials(products: Product[]): string[] {
    const materials = new Set<string>();
    products.forEach((p) => {
      if (p.material) materials.add(p.material);
    });
    return Array.from(materials);
  }

  /**
   * Extract unique tags from product list
   */
  getTags(products: Product[]): string[] {
    const tags = new Set<string>();
    products.forEach((p) => {
      if (p.tags) {
        p.tags.forEach((t) => tags.add(t));
      }
    });
    return Array.from(tags);
  }
}

// ============================================================
// Singleton export
// ============================================================

export const productService = ProductService.getInstance();

// ============================================================
// Default export for easier imports
// ============================================================

export default productService;