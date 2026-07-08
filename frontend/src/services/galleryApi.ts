// frontend/src/services/galleryApi.ts

import { apiClient } from '@/services/apiClient';

// ============================================================
// Types
// ============================================================

/**
 * Gallery item entity
 */
export interface GalleryItem {
  id: string;
  image: string;
  title: string;
  category: 'murti' | 'temple' | 'workshop' | 'ceremony';
  description?: string;
}

// ============================================================
// Gallery API
// ============================================================

/**
 * Gallery API – fetches gallery images (murtis, temples, workshop, ceremonies).
 */
export const galleryApi = {
  /**
   * Get all gallery items
   */
  getAll: async (): Promise<GalleryItem[]> => {
    const response = await apiClient.get<GalleryItem[]>('/gallery');
    return response.data;
  },
};

// ============================================================
// Default export
// ============================================================
export default galleryApi;
