// frontend/src/features/products/hooks/useProducts.ts

import { useQuery, useInfiniteQuery, UseQueryOptions, UseInfiniteQueryOptions, QueryKey, InfiniteData } from '@tanstack/react-query';
import { useMemo, useCallback, useState } from 'react';
import productsApi, { productQueryKeys } from '@/features/products/api/productsApi';
import type { Product, ProductFilters, ProductListResponse } from '@/features/products/types/product.types';

// ============================================================
// Types
// ============================================================
export interface UseProductsOptions {
  /**
   * Filter, sort, and pagination options
   */
  filters?: ProductFilters;
  /**
   * Enable/disable the query
   * @default true
   */
  enabled?: boolean;
  /**
   * Stale time in milliseconds
   * @default 5 * 60 * 1000 (5 minutes)
   */
  staleTime?: number;
  /**
   * Cache time in milliseconds
   * @default 10 * 60 * 1000 (10 minutes)
   */
  gcTime?: number;
  /**
   * Whether to refetch on window focus
   * @default true
   */
  refetchOnWindowFocus?: boolean;
  /**
   * Whether to refetch on reconnect
   * @default true
   */
  refetchOnReconnect?: boolean;
  /**
   * Number of items per page for infinite scroll
   * @default 12
   */
  itemsPerPage?: number;
}

export interface UseProductsReturn {
  /**
   * All products from all pages combined
   */
  products: Product[];
  /**
   * Total number of products available
   */
  totalCount: number;
  /**
   * Total number of pages
   */
  totalPages: number;
  /**
   * Fetch the next page
   */
  fetchNextPage: () => void;
  /**
   * Whether there is a next page
   */
  hasNextPage: boolean;
  /**
   * Whether the next page is being fetched
   */
  isFetchingNextPage: boolean;
  /**
   * Whether the initial data is loading
   */
  isLoading: boolean;
  /**
   * Whether the data is being refetched
   */
  isRefetching: boolean;
  /**
   * Error object if any
   */
  error: Error | null;
  /**
   * Refetch the products
   */
  refetch: () => void;
  /**
   * Reset the query
   */
  reset: () => void;
  /**
   * Filters applied
   */
  filters: ProductFilters;
  /**
   * Update filters (triggers refetch)
   */
  updateFilters: (newFilters: Partial<ProductFilters>) => void;
  /**
   * Clear all filters
   */
  clearFilters: () => void;
  /**
   * Check if any filters are active
   */
  hasActiveFilters: boolean;
  /**
   * Number of active filters
   */
  activeFilterCount: number;
}

// ============================================================
// useProducts Hook (with infinite scroll)
// ============================================================
/**
 * Custom hook for fetching products with infinite scroll and filtering.
 * 
 * @example
 * ```tsx
 * const { products, isLoading, hasNextPage, fetchNextPage } = useProducts({
 *   filters: { category: 'ganesh', sort: 'price-asc' },
 *   itemsPerPage: 12,
 * });
 * 
 * // In your component
 * <div>
 *   {products.map(product => <ProductCard key={product.id} product={product} />)}
 *   {hasNextPage && <button onClick={fetchNextPage}>Load More</button>}
 * </div>
 * ```
 */
export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const {
    filters = {},
    enabled = true,
    staleTime = 5 * 60 * 1000,
    gcTime = 10 * 60 * 1000,
    refetchOnWindowFocus = true,
    refetchOnReconnect = true,
    itemsPerPage = 12,
  } = options;

  // Build query key from filters
  const queryKey = useMemo(() => {
    return productQueryKeys.list(filters);
  }, [filters]);

  // Use infinite query for pagination
  const {
    data,
    isLoading,
    isFetchingNextPage,
    isRefetching,
    hasNextPage,
    fetchNextPage,
    error,
    refetch,
  } = useInfiniteQuery<ProductListResponse, Error, InfiniteData<ProductListResponse>, QueryKey, number>({
    queryKey,
    queryFn: ({ pageParam }) => {
      return productsApi.getAll({
        ...filters,
        page: pageParam,
        limit: itemsPerPage,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage;
      return page < totalPages ? page + 1 : undefined;
    },
    enabled,
    staleTime,
    gcTime,
    refetchOnWindowFocus,
    refetchOnReconnect,
  });

  // Extract products from all pages
  const products = useMemo(() => {
    return data?.pages.flatMap((page) => page.products) ?? [];
  }, [data]);

  // Get total count from first page
  const totalCount = data?.pages[0]?.total ?? 0;
  const totalPages = data?.pages[0]?.totalPages ?? 0;

  // Filter management
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some((value) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'boolean') return value === true;
      if (typeof value === 'number') return value > 0;
      return !!value;
    });
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    const filterKeys = Object.keys(filters) as (keyof ProductFilters)[];
    for (const key of filterKeys) {
      const value = filters[key];
      if (Array.isArray(value) && value.length > 0) count++;
      else if (value && !Array.isArray(value)) count++;
    }
    return count;
  }, [filters]);

  // Update filters function
  const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    // Create new filters object (immutable)
    const updatedFilters = { ...filters, ...newFilters };
    // Trigger refetch with new filters
    refetch();
    // Return updated filters for callers
  }, [filters, refetch]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    updateFilters({
      category: undefined,
      subCategory: undefined,
      search: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      material: undefined,
      colors: undefined,
      height: undefined,
      weight: undefined,
      inStock: undefined,
      isFeatured: undefined,
      isNew: undefined,
      rating: undefined,
      tags: undefined,
      sort: 'newest',
    });
  }, [updateFilters]);

  // Reset the query
  const reset = useCallback(() => {
    // This will reset the query state
    refetch();
  }, [refetch]);

  return {
    products,
    totalCount,
    totalPages,
    fetchNextPage,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    error,
    refetch,
    reset,
    filters,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,
  };
}

// ============================================================
// useProduct – Single product hook
// ============================================================
export interface UseProductOptions extends UseQueryOptions<Product, Error> {
  slug?: string;
  id?: string;
  enabled?: boolean;
}

/**
 * Hook for fetching a single product by slug or ID
 * 
 * @example
 * ```tsx
 * const { data: product, isLoading } = useProduct({ slug: 'ganesh-murti' });
 * ```
 */
export function useProduct({ 
  slug, 
  id, 
  enabled = true, 
  queryKey: _queryKey,
  ...options 
}: UseProductOptions) {
  const isEnabled = enabled && !!(slug || id);
  const queryKey = slug 
    ? productQueryKeys.detail(slug)
    : id 
    ? ['products', 'detail', id] as QueryKey
    : ['products', 'detail', 'invalid'] as QueryKey;

  const queryFn = async () => {
    if (slug) return productsApi.getBySlug(slug);
    if (id) return productsApi.getById(id);
    throw new Error('Either slug or id must be provided');
  };

  const query = useQuery<Product, Error>({
    queryKey,
    queryFn,
    enabled: isEnabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    ...options,
  });

  return query;
}

// ============================================================
// useFeaturedProducts – Featured products hook
// ============================================================
export interface UseFeaturedProductsOptions {
  limit?: number;
  enabled?: boolean;
  staleTime?: number;
}

export function useFeaturedProducts(options: UseFeaturedProductsOptions = {}) {
  const { limit = 8, enabled = true, staleTime = 5 * 60 * 1000 } = options;

  return useQuery({
    queryKey: ['products', 'featured', limit],
    queryFn: () => productsApi.getFeatured(limit),
    enabled,
    staleTime,
    gcTime: 10 * 60 * 1000,
  });
}

// ============================================================
// useNewArrivals – New arrivals hook
// ============================================================
export function useNewArrivals(options: UseFeaturedProductsOptions = {}) {
  const { limit = 8, enabled = true, staleTime = 5 * 60 * 1000 } = options;

  return useQuery({
    queryKey: ['products', 'new-arrivals', limit],
    queryFn: () => productsApi.getNewArrivals(limit),
    enabled,
    staleTime,
    gcTime: 10 * 60 * 1000,
  });
}

// ============================================================
// useBestSellers – Best sellers hook
// ============================================================
export function useBestSellers(options: UseFeaturedProductsOptions = {}) {
  const { limit = 8, enabled = true, staleTime = 5 * 60 * 1000 } = options;

  return useQuery({
    queryKey: ['products', 'best-sellers', limit],
    queryFn: () => productsApi.getBestSellers(limit),
    enabled,
    staleTime,
    gcTime: 10 * 60 * 1000,
  });
}

// ============================================================
// useTrending – Trending products hook
// ============================================================
export function useTrending(options: UseFeaturedProductsOptions = {}) {
  const { limit = 8, enabled = true, staleTime = 5 * 60 * 1000 } = options;

  return useQuery({
    queryKey: ['products', 'trending', limit],
    queryFn: () => productsApi.getTrending(limit),
    enabled,
    staleTime,
    gcTime: 10 * 60 * 1000,
  });
}

// ============================================================
// useRelatedProducts – Related products hook
// ============================================================
export interface UseRelatedProductsOptions {
  limit?: number;
  enabled?: boolean;
}

export function useRelatedProducts(
  productId: string,
  options: UseRelatedProductsOptions = {}
) {
  const { limit = 6, enabled = true } = options;

  return useQuery({
    queryKey: productQueryKeys.related(productId),
    queryFn: () => productsApi.getRelated(productId, limit),
    enabled: enabled && !!productId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// ============================================================
// useRecentlyViewed – Recently viewed products hook
// ============================================================
export function useRecentlyViewed(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: ['products', 'recently-viewed'],
    queryFn: () => productsApi.getRecentlyViewed(),
    enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

// ============================================================
// useProductSearch – Autocomplete search hook
// ============================================================
export interface UseProductSearchOptions {
  query: string;
  limit?: number;
  enabled?: boolean;
  debounce?: number;
}

export function useProductSearch(options: UseProductSearchOptions) {
  const { query, limit = 5, enabled = true, debounce = 300 } = options;

  const isEnabled = enabled && query.length >= 2;

  return useQuery({
    queryKey: ['products', 'search', 'autocomplete', query, limit],
    queryFn: () => productsApi.autocomplete(query, limit),
    enabled: isEnabled,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 2 * 60 * 1000,
    retry: 1,
  });
}

// ============================================================
// useProductFilters – Fetch filter options hook
// ============================================================
export function useProductFilters(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: productQueryKeys.filters(),
    queryFn: () => productsApi.getFilterOptions(),
    enabled,
    staleTime: 15 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });
}

// ============================================================
// useProductCategories – Fetch product categories hook
// ============================================================
export function useProductCategories(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: productQueryKeys.categories(),
    queryFn: () => productsApi.getCategories(),
    enabled,
    staleTime: 15 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });
}

// ============================================================
// useProductReviews – Product reviews hook
// ============================================================
export interface UseProductReviewsOptions {
  productId: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export function useProductReviews(options: UseProductReviewsOptions) {
  const { productId, page = 1, limit = 10, enabled = true } = options;

  return useQuery({
    queryKey: ['products', 'reviews', productId, page, limit],
    queryFn: () => productsApi.getReviews(productId, page, limit),
    enabled: enabled && !!productId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// ============================================================
// useProductAvailability – Check product availability
// ============================================================
export function useProductAvailability(productId: string, options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: ['products', 'availability', productId],
    queryFn: () => productsApi.checkAvailability(productId),
    enabled: enabled && !!productId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000, // Refetch every minute for real-time stock updates
  });
}

// ============================================================
// Utility hooks
// ============================================================

/**
 * Hook for managing product filters state
 */
export function useProductFiltersState(initialFilters: ProductFilters = {}) {
  const [filters, setFilters] = useState<ProductFilters>(initialFilters);

  const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);

  const hasFilters = useMemo(() => {
    return Object.values(filters).some((value) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'boolean') return value === true;
      if (typeof value === 'number') return value > 0;
      return !!value;
    });
  }, [filters]);

  return {
    filters,
    setFilters,
    updateFilters,
    resetFilters,
    hasFilters,
  };
}

// ============================================================
// Default export
// ============================================================
export default useProducts;