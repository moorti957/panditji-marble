// frontend/src/features/home/api/homeApi.ts

import { apiClient } from '@/services/apiClient';
import type {
  HomeData,
  HomeBanner,
  FeaturedCategory,
  FeaturedProduct,
  Testimonial,
  FAQ,
  HomeStats,
  InstagramPost,
  YouTubeVideo,
} from '@/features/home/types/home.types';

// ============================================================
// Home API
// ============================================================

/**
 * Home API – fetches aggregate and individual homepage data sections.
 */
export const homeApi = {
  /**
   * Get all homepage data in a single call
   */
  getHomeData: async (): Promise<HomeData> => {
    const response = await apiClient.get<HomeData>('/home');
    return response.data;
  },

  /**
   * Get homepage banners
   */
  getBanners: async (): Promise<HomeBanner[]> => {
    const response = await apiClient.get<HomeBanner[]>('/home/banners');
    return response.data;
  },

  /**
   * Get featured categories
   */
  getCategories: async (): Promise<FeaturedCategory[]> => {
    const response = await apiClient.get<FeaturedCategory[]>('/home/categories');
    return response.data;
  },

  /**
   * Get featured products
   */
  getFeaturedProducts: async (): Promise<FeaturedProduct[]> => {
    const response = await apiClient.get<FeaturedProduct[]>('/home/products');
    return response.data;
  },

  /**
   * Get testimonials
   */
  getTestimonials: async (): Promise<Testimonial[]> => {
    const response = await apiClient.get<Testimonial[]>('/home/testimonials');
    return response.data;
  },

  /**
   * Get FAQs
   */
  getFAQs: async (): Promise<FAQ[]> => {
    const response = await apiClient.get<FAQ[]>('/home/faqs');
    return response.data;
  },

  /**
   * Get homepage statistics
   */
  getStats: async (): Promise<HomeStats> => {
    const response = await apiClient.get<HomeStats>('/home/stats');
    return response.data;
  },

  /**
   * Get Instagram feed posts
   */
  getInstagramPosts: async (): Promise<InstagramPost[]> => {
    const response = await apiClient.get<InstagramPost[]>('/home/instagram');
    return response.data;
  },

  /**
   * Get YouTube videos
   */
  getYouTubeVideos: async (): Promise<YouTubeVideo[]> => {
    const response = await apiClient.get<YouTubeVideo[]>('/home/youtube');
    return response.data;
  },
};

// ============================================================
// Default export
// ============================================================
export default homeApi;
