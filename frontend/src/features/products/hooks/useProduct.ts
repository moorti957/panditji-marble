// frontend/src/features/products/hooks/useProduct.ts

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import productsApi, { productQueryKeys } from '@/features/products/api/productsApi';
import type { Product } from '@/features/products/types/product.types';

// ============================================================
// useProduct Hook
// ============================================================

/**
 * Fetch a single product by its slug.
 *
 * @param slug - Product slug
 *
 * @example
 * ```tsx
 * const { data: product, isLoading, error } = useProduct('ganesh-murti');
 * ```
 */
export function useProduct(slug: string | undefined): UseQueryResult<Product, Error> {
  return useQuery<Product, Error>({
    queryKey: productQueryKeys.detail(slug || 'invalid'),
    queryFn: () => productsApi.getBySlug(slug as string),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
}

// ============================================================
// Default export
// ============================================================
export default useProduct;
