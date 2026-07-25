// frontend/src/features/activity/api/activityApi.ts

import { apiClient } from '@/services/apiClient';

export interface LogCartParams {
  productId: string;
  action: 'added' | 'removed';
  quantity?: number;
}

export interface LogFavoriteParams {
  productId: string;
  action: 'added' | 'removed';
}

export interface LogSearchParams {
  keyword: string;
  resultCount?: number;
}

/**
 * Log cart activity (added / removed)
 */
export const logCart = async (
  productId: string,
  action: 'added' | 'removed',
  quantity?: number
): Promise<void> => {
  try {
    const payload: { productId: string; action: 'added' | 'removed'; quantity?: number } = {
      productId,
      action,
    };
    if (action === 'added' && quantity !== undefined) {
      payload.quantity = quantity;
    }
    await apiClient.post('/activity/cart', payload);
  } catch (error) {
    // Ignore activity API failures (never block UI)
  }
};

/**
 * Log favorite / wishlist activity (added / removed)
 */
export const logFavorite = async (
  productId: string,
  action: 'added' | 'removed'
): Promise<void> => {
  try {
    await apiClient
      .post('/activity/favorite', { productId, action })
      .catch(() => apiClient.post('/activity/favorites', { productId, action }));
  } catch (error) {
    // Ignore activity API failures (never block UI)
  }
};

/**
 * Log search query history
 */
export const logSearch = async (
  keyword: string,
  resultCount: number = 0
): Promise<void> => {
  try {
    if (!keyword || !keyword.trim()) return;
    await apiClient.post('/activity/search', {
      keyword: keyword.trim(),
      resultCount: Number(resultCount) || 0,
    });
  } catch (error) {
    // Ignore activity API failures (never block UI)
  }
};

/**
 * Log product card click activity
 */
export const logProductClick = async (productId: string): Promise<void> => {
  try {
    if (!productId) return;
    await apiClient
      .post(`/activity/click/${productId}`)
      .catch(() => apiClient.post(`/activity/products/${productId}/click`));
  } catch (error) {
    // Ignore activity API failures (never block UI)
  }
};

/**
 * Log product detail page view activity
 */
export const logProductView = async (productId: string): Promise<void> => {
  try {
    if (!productId) return;
    await apiClient
      .post(`/products/${productId}/view`)
      .catch(() => apiClient.post(`/activity/view/${productId}`));
  } catch (error) {
    // Ignore activity API failures (never block UI)
  }
};
