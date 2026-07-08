// admin/src/modules/product/productApi.ts

import { adminApi } from '@/services/adminApi';
import type { Product, ProductFormData } from '@/types/product';


// ============================================================
// Query Keys
// ============================================================
export const productQueryKeys = {
  all: ['admin', 'products'] as const,
  lists: () => [...productQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...productQueryKeys.lists(), params] as const,
  details: () => [...productQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...productQueryKeys.details(), id] as const,
};

// ============================================================
// Types
// ============================================================
export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  category?: string;
  inStock?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
}

export interface ProductListResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================
// Product API
// ============================================================
export const productApi = {
  /**
   * Get products with pagination and filters
   */
  getProducts: async (params: ProductFilters = {}): Promise<ProductListResponse> => {
    const response = await adminApi.get('/products', { params });
    // Transform response to expected format (extract data from wrapper)
    const data = response.data;
    return {
      data: data.data || [],
      total: data.total || 0,
      page: data.page || 1,
      limit: data.limit || 10,
      totalPages: data.totalPages || 0,
    };
  },

  /**
   * Get a single product by ID
   */
  getProduct: async (id: string): Promise<Product> => {
    const response = await adminApi.get(`/products/${id}`);
    return response.data.data || response.data;
  },

  /**
   * Create a new product
   */
  createProduct: async (data: ProductFormData): Promise<Product> => {
    const response = await adminApi.post('/products', data);
    return response.data.data || response.data;
  },

  /**
   * Update an existing product
   */
  updateProduct: async (id: string, data: ProductFormData): Promise<Product> => {
    const response = await adminApi.put(`/products/${id}`, data);
    return response.data.data || response.data;
  },

  /**
   * Delete a product
   */
  deleteProduct: async (id: string): Promise<void> => {
    await adminApi.delete(`/products/${id}`);
  },

  /**
   * Upload product images
   */
 uploadProductImages: async (formData: FormData): Promise<string[]> => {
  const response = await adminApi.post('/products/upload-images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data.images;
},

  /**
   * Bulk delete products
   */
  bulkDeleteProducts: async (ids: string[]): Promise<void> => {
    await adminApi.delete('/products/bulk', { data: { ids } });
  },

  /**
   * Update product stock
   */
  updateStock: async (id: string, stockQuantity: number): Promise<Product> => {
    const response = await adminApi.patch(`/products/${id}/stock`, { stockQuantity });
    return response.data.data || response.data;
  },

  /**
   * Toggle product featured status
   */
  toggleFeatured: async (id: string): Promise<Product> => {
    const response = await adminApi.patch(`/products/${id}/toggle-featured`);
    return response.data.data || response.data;
  },

  /**
   * Toggle product new status
   */
  toggleNew: async (id: string): Promise<Product> => {
    const response = await adminApi.patch(`/products/${id}/toggle-new`);
    return response.data.data || response.data;
  },
};

export default productApi;