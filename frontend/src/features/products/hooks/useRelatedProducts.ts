// frontend/src/features/products/hooks/useRelatedProducts.ts

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import productsApi, { productQueryKeys } from '@/features/products/api/productsApi';
import type { Product } from '@/features/products/types/product.types';

// ============================================================
// useRelatedProducts Hook
// ============================================================

/**
 * Fetch related products for a given product ID.
 *
 * @param productId - Product ID (may be undefined while the parent product
 * is still loading; the query is disabled until an ID is available)
 * @param limit - Number of related products to fetch
 *
 * @example
 * ```tsx
 * const { data: relatedProducts } = useRelatedProducts(product?.id);
 * ```
 */
export function useRelatedProducts(
  productId: string | undefined,
  limit: number = 6
): UseQueryResult<Product[], Error> {
  return useQuery<Product[], Error>({
    queryKey: productQueryKeys.related(productId || 'none'),
    queryFn: () => productsApi.getRelated(productId as string, limit),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// ============================================================
// Default export
// ============================================================
export default useRelatedProducts;
