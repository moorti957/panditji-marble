// frontend/src/features/categories/api/categoriesApi.ts

import { apiClient } from '@/services/apiClient';
import type {
  Category,
  CategoryFilters,
  CategoryListResponse,
} from '@/features/categories/types/category.types';
import type { Product } from '@/features/products/types/product.types';

// ============================================================
// API Response Wrapper
// ============================================================

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ============================================================
// Categories API
// ============================================================

export const categoriesApi = {
  /**
   * Get all categories
   */
  getCategories: async (
    filters: CategoryFilters = {}
  ): Promise<CategoryListResponse> => {
    const params = new URLSearchParams();

    if (filters.parentId) params.append('parentId', filters.parentId);
    if (filters.search) params.append('search', filters.search);
    if (filters.isFeatured !== undefined)
      params.append('isFeatured', String(filters.isFeatured));
    if (filters.isActive !== undefined)
      params.append('isActive', String(filters.isActive));
    if (filters.page)
      params.append('page', String(filters.page));
    if (filters.limit)
      params.append('limit', String(filters.limit));

    const queryString = params.toString();
    const url = queryString
      ? `/categories?${queryString}`
      : '/categories';

    const response =
      await apiClient.get<ApiResponse<CategoryListResponse>>(url);

    return response.data.data;
  },

  /**
   * Get category by ID
   */
  getCategoryById: async (id: string): Promise<Category> => {
    const response =
      await apiClient.get<ApiResponse<Category>>(
        `/categories/id/${id}`
      );

    return response.data.data;
  },

  /**
   * Get category by Slug
   */
  getCategoryBySlug: async (slug: string): Promise<Category> => {
    const response =
      await apiClient.get<ApiResponse<Category>>(
        `/categories/${slug}`
      );

    return response.data.data;
  },

  /**
   * Featured Categories
   */
  getFeaturedCategories: async (
    limit: number = 6
  ): Promise<Category[]> => {
    const response =
      await apiClient.get<ApiResponse<Category[]>>(
        `/categories/featured?limit=${limit}`
      );

    return response.data.data;
  },

  /**
   * Category Tree
   */
  getCategoryTree: async (): Promise<Category[]> => {
    const response =
      await apiClient.get<ApiResponse<Category[]>>(
        '/categories/tree'
      );

    return response.data.data;
  },

  /**
   * Products by Category ID
   */
  getCategoryProductsById: async (
    id: string,
    page: number = 1,
    limit: number = 12
  ): Promise<{ products: Product[]; total: number }> => {

    const response =
      await apiClient.get<
        ApiResponse<{
          products: Product[];
          total: number;
        }>
      >(
        `/categories/id/${id}/products?page=${page}&limit=${limit}`
      );

    return response.data.data;
  },

  /**
   * Products by Category Slug
   */
  getCategoryProductsBySlug: async (
    slug: string,
    page: number = 1,
    limit: number = 12
  ): Promise<{ products: Product[]; total: number }> => {

    const response =
      await apiClient.get<
        ApiResponse<{
          products: Product[];
          total: number;
        }>
      >(
        `/categories/${slug}/products?page=${page}&limit=${limit}`
      );

    return response.data.data;
  },
};

export default categoriesApi;