// frontend/src/features/products/hooks/useProductDetail.ts

import { useQuery, useQueries, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useMemo } from 'react';
import productsApi, { productQueryKeys } from '@/features/products/api/productsApi';
import type { Product, ProductReview } from '@/features/products/types/product.types';

// ============================================================
// Types
// ============================================================
export interface UseProductDetailOptions {
  /**
   * Product slug (preferred) or ID
   */
  slug?: string;
  /**
   * Product ID (alternative to slug)
   */
  id?: string;
  /**
   * Whether to automatically fetch related products
   * @default true
   */
  fetchRelated?: boolean;
  /**
   * Whether to automatically fetch reviews
   * @default true
   */
  fetchReviews?: boolean;
  /**
   * Whether to automatically fetch availability
   * @default true
   */
  fetchAvailability?: boolean;
  /**
   * Number of related products to fetch
   * @default 6
   */
  relatedLimit?: number;
  /**
   * Number of reviews to fetch per page
   * @default 10
   */
  reviewsLimit?: number;
  /**
   * Enable/disable the query
   * @default true
   */
  enabled?: boolean;
  /**
   * Stale time in milliseconds
   * @default 5 * 60 * 1000
   */
  staleTime?: number;
  /**
   * Cache time in milliseconds
   * @default 10 * 60 * 1000
   */
  gcTime?: number;
}

export interface UseProductDetailReturn {
  /**
   * The main product data
   */
  product: Product | undefined;
  /**
   * Whether the product is loading
   */
  isLoading: boolean;
  /**
   * Whether any data is being fetched
   */
  isFetching: boolean;
  /**
   * Error object if any
   */
  error: Error | null;
  /**
   * Related products
   */
  relatedProducts: Product[] | undefined;
  /**
   * Whether related products are loading
   */
  isLoadingRelated: boolean;
  /**
   * Reviews data
   */
  reviews: {
    reviews: ProductReview[];
    total: number;
    averageRating: number;
  } | undefined;
  /**
   * Whether reviews are loading
   */
  isLoadingReviews: boolean;
  /**
   * Availability data
   */
  availability: { inStock: boolean; estimatedDelivery: string } | undefined;
  /**
   * Whether availability is loading
   */
  isLoadingAvailability: boolean;
  /**
   * Refetch the main product
   */
  refetch: () => void;
  /**
   * Refetch all data
   */
  refetchAll: () => void;
}

// ============================================================
// useProductDetail – Combined hook
// ============================================================
/**
 * A comprehensive hook that fetches product details along with related products,
 * reviews, and availability in a single call.
 * 
 * @example
 * ```tsx
 * const { product, relatedProducts, reviews, isLoading } = useProductDetail({
 *   slug: 'ganesh-murti',
 *   fetchRelated: true,
 *   fetchReviews: true,
 * });
 * 
 * if (isLoading) return <ProductSkeleton />;
 * if (!product) return <NotFound />;
 * 
 * return (
 *   <div>
 *     <ProductDetail product={product} />
 *     <RelatedProducts products={relatedProducts} />
 *     <Reviews reviews={reviews?.reviews} />
 *   </div>
 * );
 * ```
 */
export function useProductDetail(options: UseProductDetailOptions = {}): UseProductDetailReturn {
  const {
    slug,
    id,
    fetchRelated = true,
    fetchReviews = true,
    fetchAvailability = true,
    relatedLimit = 6,
    reviewsLimit = 10,
    enabled = true,
    staleTime = 5 * 60 * 1000,
    gcTime = 10 * 60 * 1000,
  } = options;

  // Determine if we have an identifier
  const hasIdentifier = !!(slug || id);
  const isEnabled = enabled && hasIdentifier;

  // Product query key
  const productQueryKey = slug ? productQueryKeys.detail(slug) : id ? ['products', 'detail', id] : ['products', 'detail', 'invalid'];

  // 1. Main product query
  const productQuery = useQuery<Product, Error>({
    queryKey: productQueryKey,
    queryFn: async () => {
      if (slug) return productsApi.getBySlug(slug);
      if (id) return productsApi.getById(id);
      throw new Error('Either slug or id must be provided');
    },
    enabled: isEnabled,
    staleTime,
    gcTime,
    retry: 2,
  });

  const product = productQuery.data;
  const isLoading = productQuery.isLoading;
  const isFetching = productQuery.isFetching;
  const error = productQuery.error;

  // 2. Related products query (depends on product ID)
  const relatedQuery = useQuery({
    queryKey: ['products', 'related', product?.id || 'none', relatedLimit],
    queryFn: () => productsApi.getRelated(product!.id, relatedLimit),
    enabled: isEnabled && fetchRelated && !!product?.id,
    staleTime,
    gcTime,
  });

  // 3. Reviews query (depends on product ID)
  const reviewsQuery = useQuery({
    queryKey: ['products', 'reviews', product?.id || 'none', 1, reviewsLimit],
    queryFn: () => productsApi.getReviews(product!.id, 1, reviewsLimit),
    enabled: isEnabled && fetchReviews && !!product?.id,
    staleTime,
    gcTime,
  });

  // 4. Availability query (depends on product ID)
  const availabilityQuery = useQuery({
    queryKey: ['products', 'availability', product?.id || 'none'],
    queryFn: () => productsApi.checkAvailability(product!.id),
    enabled: isEnabled && fetchAvailability && !!product?.id,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000, // Refetch every minute for real-time stock
  });

  // Refetch all queries
  const refetchAll = () => {
    productQuery.refetch();
    if (fetchRelated) relatedQuery.refetch();
    if (fetchReviews) reviewsQuery.refetch();
    if (fetchAvailability) availabilityQuery.refetch();
  };

  return {
    // Main product
    product,
    isLoading,
    isFetching,
    error,
    // Related
    relatedProducts: relatedQuery.data,
    isLoadingRelated: relatedQuery.isLoading,
    // Reviews
    reviews: reviewsQuery.data,
    isLoadingReviews: reviewsQuery.isLoading,
    // Availability
    availability: availabilityQuery.data,
    isLoadingAvailability: availabilityQuery.isLoading,
    // Refetch
    refetch: productQuery.refetch,
    refetchAll,
  };
}

// ============================================================
// useProductDetailSimple – Simplified version for basic use
// ============================================================
/**
 * A simpler version that only fetches the main product.
 * 
 * @example
 * ```tsx
 * const { product, isLoading } = useProductDetailSimple({ slug: 'ganesh-murti' });
 * ```
 */
export function useProductDetailSimple(options: {
  slug?: string;
  id?: string;
  enabled?: boolean;
  staleTime?: number;
}): UseQueryResult<Product, Error> {
  const { slug, id, enabled = true, staleTime = 5 * 60 * 1000 } = options;
  const isEnabled = enabled && !!(slug || id);

  return useQuery({
    queryKey: slug ? productQueryKeys.detail(slug) : ['products', 'detail', id || 'invalid'],
    queryFn: async () => {
      if (slug) return productsApi.getBySlug(slug);
      if (id) return productsApi.getById(id);
      throw new Error('Either slug or id must be provided');
    },
    enabled: isEnabled,
    staleTime,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
}

// ============================================================
// useProductWithRelated – Product + related products only
// ============================================================
export interface UseProductWithRelatedOptions {
  slug?: string;
  id?: string;
  limit?: number;
  enabled?: boolean;
}

export function useProductWithRelated(options: UseProductWithRelatedOptions = {}) {
  const { slug, id, limit = 6, enabled = true } = options;
  const hasIdentifier = !!(slug || id);
  const isEnabled = enabled && hasIdentifier;

  const productQuery = useQuery({
    queryKey: slug ? productQueryKeys.detail(slug) : ['products', 'detail', id || 'invalid'],
    queryFn: async () => {
      if (slug) return productsApi.getBySlug(slug);
      if (id) return productsApi.getById(id);
      throw new Error('Either slug or id must be provided');
    },
    enabled: isEnabled,
    staleTime: 5 * 60 * 1000,
  });

  const relatedQuery = useQuery({
    queryKey: ['products', 'related', productQuery.data?.id || 'none', limit],
    queryFn: () => productsApi.getRelated(productQuery.data!.id, limit),
    enabled: isEnabled && !!productQuery.data?.id,
    staleTime: 5 * 60 * 1000,
  });

  return {
    product: productQuery.data,
    isLoading: productQuery.isLoading || relatedQuery.isLoading,
    error: productQuery.error || relatedQuery.error,
    relatedProducts: relatedQuery.data,
    refetch: () => {
      productQuery.refetch();
      relatedQuery.refetch();
    },
  };
}

// ============================================================
// useProductReviews – Standalone reviews hook (paginated)
// ============================================================
export interface UseProductReviewsOptions {
  productId: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export function useProductReviewsPaginated(options: UseProductReviewsOptions) {
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
// Prefetch functions for server-side rendering
// ============================================================
/**
 * Prefetch product details for SSR
 */
export async function prefetchProductDetail(
  queryClient: any,
  slug: string,
  options: { fetchRelated?: boolean; relatedLimit?: number } = {}
): Promise<void> {
  const { fetchRelated = true, relatedLimit = 6 } = options;

  // Prefetch main product
  await queryClient.prefetchQuery({
    queryKey: productQueryKeys.detail(slug),
    queryFn: () => productsApi.getBySlug(slug),
    staleTime: 5 * 60 * 1000,
  });

  // If we want related, we need the product id first – but we don't have it yet.
  // Better to prefetch related after product is fetched (in a server component)
  // but for simplicity, we can skip or fetch using a separate call.
  // This function can be extended to use getById after fetching the product.
}

/**
 * Prefetch product by ID for SSR
 */
export async function prefetchProductById(
  queryClient: any,
  id: string,
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: ['products', 'detail', id],
    queryFn: () => productsApi.getById(id),
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================
// Utility: Check if product data is stale
// ============================================================
export function isProductStale(product: Product, maxAgeMinutes: number = 5): boolean {
  const updated = new Date(product.updatedAt);
  const now = new Date();
  const diffMinutes = (now.getTime() - updated.getTime()) / (1000 * 60);
  return diffMinutes > maxAgeMinutes;
}

// ============================================================
// Default export
// ============================================================
export default useProductDetail;