// frontend/src/features/reviews/types/review.types.ts

// ============================================================
// Review Types
// ============================================================

/**
 * A single product review as displayed on the product detail page.
 */
export interface Review {
  id: string;
  productId?: string;
  author: string;
  avatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  isVerified?: boolean;
}
