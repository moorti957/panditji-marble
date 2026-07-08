// frontend/src/services/blogApi.ts

import { apiClient } from '@/services/apiClient';

// ============================================================
// Types
// ============================================================

/**
 * Blog post entity
 */
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  author: string;
  authorAvatar?: string;
  publishedAt: string;
  readTime: number;
  tags: string[];
  relatedPosts?: BlogPost[];
}

// ============================================================
// Blog API
// ============================================================

/**
 * Blog API – fetches blog posts (articles) for the divine insights section.
 */
export const blogApi = {
  /**
   * Get all blog posts
   */
  getAll: async (): Promise<BlogPost[]> => {
    const response = await apiClient.get<BlogPost[]>('/blogs');
    return response.data;
  },

  /**
   * Get a single blog post by slug
   */
  getBySlug: async (slug: string): Promise<BlogPost> => {
    const response = await apiClient.get<BlogPost>(`/blogs/${slug}`);
    return response.data;
  },
};

// ============================================================
// Default export
// ============================================================
export default blogApi;
