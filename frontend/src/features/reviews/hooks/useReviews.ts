// frontend/src/features/reviews/hooks/useReviews.ts

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import productsApi from '@/features/products/api/productsApi';
import type { Review } from '@/features/reviews/types/review.types';
import type { ProductReview } from '@/features/products/types/product.types';

// ============================================================
// Helpers
// ============================================================

function toReview(r: ProductReview): Review {
  return {
    id: r.id,
    author: r.userName,
    avatar: r.userAvatar,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt,
    isVerified: r.isVerified,
  };
}

// ============================================================
// useReviews Hook
// ============================================================

/**
 * Fetch reviews for a given product ID.
 *
 * @param productId - Product ID (may be undefined while the parent product
 * is still loading; the query is disabled until an ID is available)
 *
 * @example
 * ```tsx
 * const { data: reviews } = useReviews(product?.id);
 * ```
 */
export function useReviews(productId: string | undefined): UseQueryResult<Review[], Error> {
  return useQuery<Review[], Error>({
    queryKey: ['products', 'reviews', productId || 'none'],
    queryFn: async () => {
      const { reviews } = await productsApi.getReviews(productId as string);
      return reviews.map(toReview);
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// ============================================================
// Default export
// ============================================================
export default useReviews;
