// frontend/src/features/categories/types/category.types.ts

// ============================================================
// Category Types
// ============================================================

/**
 * Product category (supports nested/hierarchical categories)
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parentId?: string;
  children?: Category[];
  productCount: number;
  displayOrder?: number;
  isActive?: boolean;
  isFeatured?: boolean;
}

/**
 * Filters for querying categories
 */
export interface CategoryFilters {
  parentId?: string;
  search?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Category list response with pagination metadata
 */
export interface CategoryListResponse {
  categories: Category[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}
