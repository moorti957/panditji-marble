  // admin/src/services/adminApi.ts

  import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
  import { toast } from 'react-hot-toast';

  // ============================================================
  // Types
  // ============================================================
  export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data: T;
    errors?: any;
  }

  export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }

  // ============================================================
  // API Client Setup
  // ============================================================
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const TOKEN_KEY = 'panditji-admin-token';

  // Create axios instance
  const apiClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  // ============================================================
  // Token Management
  // ============================================================
  const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  };

  const setToken = (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
  };

  const removeToken = (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
  };

  // ============================================================
  // Request Interceptor
  // ============================================================
  apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // ============================================================
  // Response Interceptor
  // ============================================================
  apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
      // Return the data directly (API always returns { success, data, message })
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        // Token expired – logout and redirect to login
        removeToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
      return Promise.reject(error);
    }
  );

  // ============================================================
  // Helper to extract data from response
  // ============================================================
  const extractData = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
    return response.data.data;
  };

  const extractPaginated = <T>(response: AxiosResponse<ApiResponse<PaginatedResponse<T>>>): PaginatedResponse<T> => {
    return response.data.data;
  };

  const normalizeProduct = (product: any) => {
    if (!product) return product;

    const category = typeof product.category === 'string'
      ? { id: product.category }
      : product.category
        ? {
          ...(product.category || {}),
          id: product.category?._id || product.category?.id || product.category,
        }
        : undefined;

    return {
      ...product,
      id: product._id || product.id,
      _id: product._id || product.id,
      category,
      isNew: product.isNewProduct ?? product.isNew ?? false,
      isActive: product.isActive ?? true,
      inStock: product.inStock ?? (product.stockQuantity > 0),
    };
  };

  const normalizeProductList = (products: any[] = []) =>
    (products || []).map((product) => normalizeProduct(product));

  // ============================================================
  // Auth API
  // ============================================================
  export const authApi = {
    login: async (
      email: string,
      password: string
    ): Promise<{ user: any; accessToken: string }> => {
      console.log("========== LOGIN API ==========");

      const response = await apiClient.post<
        ApiResponse<{ user: any; accessToken: string }>
      >("/auth/login", {
        email,
        password,
      });

      console.log("Login Response:", response.data);

      const data = extractData(response);

      console.log("Access Token:", data.accessToken);
      console.log("User:", data.user);

      if (data.accessToken) {
        setToken(data.accessToken);
        console.log("✅ Token saved in LocalStorage");
      } else {
        console.log("❌ No access token received");
      }

      console.log("===============================");

      return data;
    },

    logout: async (): Promise<void> => {
      try {
        await apiClient.post("/auth/logout");
      } finally {
        removeToken();
        console.log("✅ Token removed");
      }
    },

    getMe: async (): Promise<any> => {
      console.count("GET ME API");

      const token = getToken();

      console.log("========== GET ME ==========");
      console.log("Stored Token:", token);

      const response = await apiClient.get<ApiResponse<any>>("/auth/me");

      console.log("GET ME Response:", response.data);
      console.log("============================");

      return extractData(response);
    },

    refreshToken: async (): Promise<string> => {
      console.log("========== REFRESH TOKEN ==========");

      const response = await apiClient.post<
        ApiResponse<{ accessToken: string }>
      >("/auth/refresh-token");

      const data = extractData(response);

      console.log("New Token:", data.accessToken);

      setToken(data.accessToken);

      console.log("===================================");

      return data.accessToken;
    },
  };

  // ============================================================
  // Dashboard API
  // ============================================================
  export const dashboardApi = {
    getStats: async (period?: string): Promise<any> => {
      const response = await apiClient.get<ApiResponse<any>>('/dashboard/stats', { params: { period } });
      const payload = extractData(response);

      return {
        totalRevenue: payload?.revenue?.total ?? 0,
        totalOrders: payload?.orders?.total ?? 0,
        totalProducts: payload?.products?.total ?? 0,
        totalCustomers: payload?.customers?.total ?? 0,
        revenueChange: 0,
        ordersChange: 0,
        productsChange: 0,
        customersChange: 0,
        raw: payload,
      };
    },

    getRevenueData: async (period?: string): Promise<any> => {
      const response = await apiClient.get<ApiResponse<any>>('/dashboard/revenue', { params: { period } });
      return extractData(response);
    },

    getRecentOrders: async (limit: number = 5): Promise<any[]> => {
      const response = await apiClient.get<ApiResponse<any[]>>('/dashboard/recent-orders', { params: { limit } });
      return extractData(response);
    },
  };

  // ============================================================
  // Products API
  // ============================================================
  export const productApi = {
    getProducts: async (params?: any): Promise<PaginatedResponse<any>> => {
      const response = await apiClient.get<ApiResponse<any>>('/products', { params });
      const payload = extractData(response);
      const products = normalizeProductList(payload?.products || payload?.data || []);

      return {
        data: products,
        total: payload?.total ?? products.length,
        page: payload?.page ?? 1,
        limit: payload?.limit ?? products.length,
        totalPages: payload?.totalPages ?? 1,
      };
    },

    getProduct: async (id: string): Promise<any> => {
      const response = await apiClient.get<ApiResponse<any>>(`/products/id/${id}`);
      return normalizeProduct(extractData(response));
    },

    createProduct: async (data: any): Promise<any> => {
      const payload = {
        ...data,
        isNewProduct: data?.isNewProduct ?? data?.isNew ?? false,
        isNew: undefined,
      };

      console.log("PAYLOAD =>", payload);

      try {
        const response = await apiClient.post<ApiResponse<any>>(
          "/products",
          payload
        );

        return normalizeProduct(extractData(response));
      } catch (error: any) {
        console.log("STATUS =>", error.response?.status);
        console.log("ERROR DATA =>", error.response?.data);
        console.log("ERRORS =>", error.response?.data?.errors);
        console.log("DETAILS =>", error.response?.data?.details);

        throw error;
      }
    },

    updateProduct: async (id: string, data: any): Promise<any> => {
      const payload = {
        ...data,
        isNewProduct: data?.isNewProduct ?? data?.isNew ?? false,
        isNew: undefined,
      };
      const response = await apiClient.put<ApiResponse<any>>(`/products/${id}`, payload);
      return normalizeProduct(extractData(response));
    },

    deleteProduct: async (id: string): Promise<void> => {
      await apiClient.delete(`/products/${id}`);
    },

    bulkDeleteProducts: async (ids: string[]): Promise<void> => {
      await apiClient.delete('/products/bulk', { data: { ids } });
    },

    updateStock: async (id: string, stockQuantity: number): Promise<any> => {
      const response = await apiClient.patch<ApiResponse<any>>(`/products/${id}/stock`, { stockQuantity });
      return extractData(response);
    },

    toggleFeatured: async (id: string): Promise<any> => {
      const response = await apiClient.patch<ApiResponse<any>>(`/products/${id}/toggle-featured`);
      return extractData(response);
    },

    toggleNew: async (id: string): Promise<any> => {
      const response = await apiClient.patch<ApiResponse<any>>(`/products/${id}/toggle-new`);
      return extractData(response);
    },

    uploadImages: async (formData: FormData): Promise<string[]> => {
      const response = await apiClient.post<ApiResponse<{ images: Array<{ url: string; publicId?: string }> }>>('/products/upload-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const payload = extractData(response);
      return (payload.images || []).map((item: any) => item.url || item);
    },
  };

  // ============================================================
  // Categories API
  // ============================================================
  export const categoryApi = {
    getCategories: async (params?: any): Promise<PaginatedResponse<any>> => {
      const response = await apiClient.get<ApiResponse<any>>('/categories', { params });
      const payload = extractData(response);
      const categories = payload?.categories || payload?.data || [];

      return {
        data: categories,
        total: payload?.total ?? categories.length,
        page: payload?.page ?? 1,
        limit: payload?.limit ?? categories.length,
        totalPages: payload?.totalPages ?? 1,
      };
    },

    uploadImage: async (formData: FormData): Promise<string[]> => {
      const response = await apiClient.post<
        ApiResponse<{ images: string[] }>
      >(
        "/products/upload-images",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const payload = extractData(response);

      return payload.images || [];
    },

    getCategoryTree: async (): Promise<any[]> => {
      const response = await apiClient.get<ApiResponse<any[]>>('/categories/tree');
      return extractData(response);
    },

    getCategory: async (id: string): Promise<any> => {
      const response = await apiClient.get<ApiResponse<any>>(`/categories/${id}`);
      return extractData(response);
    },

    createCategory: async (data: any): Promise<any> => {
      const response = await apiClient.post<ApiResponse<any>>('/categories', data);
      return extractData(response);
    },

    updateCategory: async (id: string, data: any): Promise<any> => {
      const response = await apiClient.put<ApiResponse<any>>(`/categories/${id}`, data);
      return extractData(response);
    },

    deleteCategory: async (id: string): Promise<void> => {
      await apiClient.delete(`/categories/${id}`);
    },

    toggleFeatured: async (id: string): Promise<any> => {
      const response = await apiClient.patch<ApiResponse<any>>(`/categories/${id}/toggle-featured`);
      return extractData(response);
    },

    reorder: async (categories: { id: string; displayOrder: number }[]): Promise<void> => {
      await apiClient.put('/categories/reorder', { categories });
    },

    bulkDelete: async (ids: string[]): Promise<void> => {
      await apiClient.delete('/categories/bulk', { data: { ids } });
    },
  };

  // ============================================================
  // Orders API
  // ============================================================
  export const orderApi = {
    getOrders: async (params?: any): Promise<PaginatedResponse<any>> => {
      const response = await apiClient.get<ApiResponse<any>>('/orders/admin/all', { params });
      const payload = extractData(response);
      const orders = payload?.orders || payload?.data || [];

      return {
        data: orders,
        total: payload?.total ?? orders.length,
        page: payload?.page ?? 1,
        limit: payload?.limit ?? orders.length,
        totalPages: payload?.totalPages ?? 1,
      };
    },

    getOrder: async (id: string): Promise<any> => {
      const response = await apiClient.get<ApiResponse<any>>(`/orders/${id}`);
      return extractData(response);
    },

    updateOrderStatus: async (id: string, status: string, notes?: string): Promise<any> => {
      const response = await apiClient.patch<ApiResponse<any>>(`/orders/${id}/status`, { status, notes });
      return extractData(response);
    },

    updatePaymentStatus: async (id: string, paymentStatus: string): Promise<any> => {
      const response = await apiClient.patch<ApiResponse<any>>(`/orders/${id}/payment-status`, { paymentStatus });
      return extractData(response);
    },

    updateShippingDetails: async (id: string, data: any): Promise<any> => {
      const response = await apiClient.put<ApiResponse<any>>(`/orders/${id}/shipping`, data);
      return extractData(response);
    },

    deleteOrder: async (id: string): Promise<void> => {
      await apiClient.delete(`/orders/${id}`);
    },
  };

  // ============================================================
  // Users API
  // ============================================================
  export const userApi = {
    getUsers: async (params?: any): Promise<PaginatedResponse<any>> => {
      const response = await apiClient.get<ApiResponse<any>>('/users', { params });
      const payload = extractData(response);
      const users = payload?.users || payload?.data || [];

      return {
        data: users,
        total: payload?.total ?? users.length,
        page: payload?.page ?? 1,
        limit: payload?.limit ?? users.length,
        totalPages: payload?.totalPages ?? 1,
      };
    },

    getUser: async (id: string): Promise<any> => {
      const response = await apiClient.get<ApiResponse<any>>(`/users/${id}`);
      return extractData(response);
    },

    updateUserRole: async (id: string, role: string): Promise<any> => {
      const response = await apiClient.patch<ApiResponse<any>>(`/users/${id}/role`, { role });
      return extractData(response);
    },

    updateUserStatus: async (id: string, isActive: boolean): Promise<any> => {
      const response = await apiClient.patch<ApiResponse<any>>(`/users/${id}/status`, { isActive });
      return extractData(response);
    },

    deleteUser: async (id: string): Promise<void> => {
      await apiClient.delete(`/users/${id}`);
    },

    bulkDeleteUsers: async (ids: string[]): Promise<void> => {
      await apiClient.delete('/users/bulk', { data: { ids } });
    },

    getUserStats: async (): Promise<any> => {
      const response = await apiClient.get<ApiResponse<any>>('/users/stats');
      return extractData(response);
    },
  };

  // ============================================================
  // Settings API
  // ============================================================
  export const settingsApi = {
    getSettings: async (): Promise<any> => {
      const response = await apiClient.get<ApiResponse<any>>("/settings");
      return extractData(response);
    },

    updateStoreSettings: async (data: any): Promise<any> => {
      const response = await apiClient.put<ApiResponse<any>>("/settings/store", data);
      return extractData(response);
    },

    updatePaymentSettings: async (data: any): Promise<any> => {
      const response = await apiClient.put<ApiResponse<any>>("/settings/payment", data);
      return extractData(response);
    },

    updateShippingSettings: async (data: any): Promise<any> => {
      const response = await apiClient.put<ApiResponse<any>>("/settings/shipping", data);
      return extractData(response);
    },

    updateSocialSettings: async (data: any): Promise<any> => {
      const response = await apiClient.put<ApiResponse<any>>("/settings/social", data);
      return extractData(response);
    },

    updateSEOSettings: async (data: any): Promise<any> => {
      const response = await apiClient.put<ApiResponse<any>>("/settings/seo", data);
      return extractData(response);
    },

    updateContactSettings: async (data: any): Promise<any> => {
      const response = await apiClient.put<ApiResponse<any>>("/settings/contact", data);
      return extractData(response);
    },
  };
  // ============================================================
  // Gallery API
  // ============================================================
  export const galleryApi = {
    getGallery: async (params?: any): Promise<PaginatedResponse<any>> => {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<any>>>('/gallery', { params });
      return extractPaginated(response);
    },

    uploadImages: async (formData: FormData): Promise<string[]> => {
      const response = await apiClient.post<ApiResponse<{ images: string[] }>>('/upload/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return extractData(response).images;
    },

    deleteImage: async (id: string): Promise<void> => {
      await apiClient.delete(`/gallery/${id}`);
    },

    bulkDelete: async (ids: string[]): Promise<void> => {
      await apiClient.delete('/gallery/bulk', { data: { ids } });
    },
  };

  // ============================================================
  // Banners API
  // ============================================================
  export const bannerApi = {
    getBanners: async (params?: any): Promise<any[]> => {
      const response = await apiClient.get<ApiResponse<any[]>>('/banners', { params });
      return extractData(response);
    },

    getBanner: async (id: string): Promise<any> => {
      const response = await apiClient.get<ApiResponse<any>>(`/banners/${id}`);
      return extractData(response);
    },

    createBanner: async (data: any): Promise<any> => {
      const response = await apiClient.post<ApiResponse<any>>('/banners', data);
      return extractData(response);
    },

    updateBanner: async (id: string, data: any): Promise<any> => {
      const response = await apiClient.put<ApiResponse<any>>(`/banners/${id}`, data);
      return extractData(response);
    },

    deleteBanner: async (id: string): Promise<void> => {
      await apiClient.delete(`/banners/${id}`);
    },
  };

  // ============================================================
  // Testimonials API
  // ============================================================
  export const testimonialApi = {
    getTestimonials: async (params?: any): Promise<PaginatedResponse<any>> => {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<any>>>('/testimonials', { params });
      return extractPaginated(response);
    },

    getTestimonial: async (id: string): Promise<any> => {
      const response = await apiClient.get<ApiResponse<any>>(`/testimonials/${id}`);
      return extractData(response);
    },

    createTestimonial: async (data: any): Promise<any> => {
      const response = await apiClient.post<ApiResponse<any>>('/testimonials', data);
      return extractData(response);
    },

    updateTestimonial: async (id: string, data: any): Promise<any> => {
      const response = await apiClient.put<ApiResponse<any>>(`/testimonials/${id}`, data);
      return extractData(response);
    },

    deleteTestimonial: async (id: string): Promise<void> => {
      await apiClient.delete(`/testimonials/${id}`);
    },

    toggleActive: async (id: string): Promise<any> => {
      const response = await apiClient.patch<ApiResponse<any>>(`/testimonials/${id}/toggle-active`);
      return extractData(response);
    },
  };

  // ============================================================
  // FAQs API
  // ============================================================
  export const faqApi = {
    getFAQs: async (params?: any): Promise<any[]> => {
      const response = await apiClient.get<ApiResponse<any[]>>('/faqs', { params });
      return extractData(response);
    },

    getFAQ: async (id: string): Promise<any> => {
      const response = await apiClient.get<ApiResponse<any>>(`/faqs/${id}`);
      return extractData(response);
    },

    createFAQ: async (data: any): Promise<any> => {
      const response = await apiClient.post<ApiResponse<any>>('/faqs', data);
      return extractData(response);
    },

    updateFAQ: async (id: string, data: any): Promise<any> => {
      const response = await apiClient.put<ApiResponse<any>>(`/faqs/${id}`, data);
      return extractData(response);
    },

    deleteFAQ: async (id: string): Promise<void> => {
      await apiClient.delete(`/faqs/${id}`);
    },

    reorder: async (faqs: { id: string; displayOrder: number }[]): Promise<void> => {
      await apiClient.put('/faqs/reorder', { faqs });
    },
  };

  // ============================================================
  // Blogs API
  // ============================================================
  export const blogApi = {
    getBlogs: async (params?: any): Promise<PaginatedResponse<any>> => {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<any>>>('/blogs', { params });
      return extractPaginated(response);
    },

    getBlog: async (id: string): Promise<any> => {
      const response = await apiClient.get<ApiResponse<any>>(`/blogs/${id}`);
      return extractData(response);
    },

    createBlog: async (data: any): Promise<any> => {
      const response = await apiClient.post<ApiResponse<any>>('/blogs', data);
      return extractData(response);
    },

    updateBlog: async (id: string, data: any): Promise<any> => {
      const response = await apiClient.put<ApiResponse<any>>(`/blogs/${id}`, data);
      return extractData(response);
    },

    deleteBlog: async (id: string): Promise<void> => {
      await apiClient.delete(`/blogs/${id}`);
    },

    uploadImages: async (formData: FormData): Promise<string[]> => {
      const response = await apiClient.post<ApiResponse<{ images: string[] }>>('/upload/blog', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return extractData(response).images;
    },
  };

  // ============================================================
  // Videos API
  // ============================================================
  export const videoApi = {
    getVideos: async (params?: any): Promise<any[]> => {
      const response = await apiClient.get<ApiResponse<any[]>>('/videos', { params });
      return extractData(response);
    },

    getVideo: async (id: string): Promise<any> => {
      const response = await apiClient.get<ApiResponse<any>>(`/videos/${id}`);
      return extractData(response);
    },

    createVideo: async (data: any): Promise<any> => {
      const response = await apiClient.post<ApiResponse<any>>('/videos', data);
      return extractData(response);
    },

    updateVideo: async (id: string, data: any): Promise<any> => {
      const response = await apiClient.put<ApiResponse<any>>(`/videos/${id}`, data);
      return extractData(response);
    },

    deleteVideo: async (id: string): Promise<void> => {
      await apiClient.delete(`/videos/${id}`);
    },
  };

  // ============================================================
  // Homepage Sections API
  // ============================================================
  export const homepageApi = {
    getSections: async (): Promise<any> => {
      const response = await apiClient.get<ApiResponse<any>>('/homepage');
      return extractData(response);
    },

    updateSections: async (data: any): Promise<any> => {
      const response = await apiClient.put<ApiResponse<any>>('/homepage', data);
      return extractData(response);
    },

    getHero: async (): Promise<any> => {
      const response = await apiClient.get<ApiResponse<any>>('/homepage/hero');
      return extractData(response);
    },

    updateHero: async (data: any): Promise<any> => {
      const response = await apiClient.put<ApiResponse<any>>('/homepage/hero', data);
      return extractData(response);
    },

    getFeaturedCategories: async (): Promise<any[]> => {
      const response = await apiClient.get<ApiResponse<any[]>>('/homepage/featured-categories');
      return extractData(response);
    },

    updateFeaturedCategories: async (data: any): Promise<any> => {
      const response = await apiClient.put<ApiResponse<any>>('/homepage/featured-categories', data);
      return extractData(response);
    },
  };

  // ============================================================
  // SEO API
  // ============================================================
  export const seoApi = {
    getSEO: async (): Promise<any> => {
      const response = await apiClient.get<ApiResponse<any>>('/seo');
      return extractData(response);
    },

    updateSEO: async (data: any): Promise<any> => {
      const response = await apiClient.put<ApiResponse<any>>('/seo', data);
      return extractData(response);
    },

    getPageSEO: async (path: string): Promise<any> => {
      const response = await apiClient.get<ApiResponse<any>>(`/seo/page`, { params: { path } });
      return extractData(response);
    },

    updatePageSEO: async (path: string, data: any): Promise<any> => {
      const response = await apiClient.put<ApiResponse<any>>(`/seo/page`, { path, ...data });
      return extractData(response);
    },
  };

  // ============================================================
  // Media API
  // ============================================================
  export const mediaApi = {
    uploadFile: async (file: File, folder?: string): Promise<{ url: string; publicId: string }> => {
      const formData = new FormData();
      formData.append('file', file);
      if (folder) formData.append('folder', folder);
      const response = await apiClient.post<ApiResponse<{ url: string; publicId: string }>>('/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return extractData(response);
    },

    uploadMultiple: async (files: File[], folder?: string): Promise<Array<{ url: string; publicId: string }>> => {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      if (folder) formData.append('folder', folder);
      const response = await apiClient.post<ApiResponse<Array<{ url: string; publicId: string }>>>('/upload/multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return extractData(response);
    },

    deleteFile: async (publicId: string): Promise<void> => {
      await apiClient.delete(`/upload/${publicId}`);
    },

    deleteMultiple: async (publicIds: string[]): Promise<void> => {
      await apiClient.delete('/upload/bulk', { data: { publicIds } });
    },

    getSignedUrl: async (type: string): Promise<{ url: string; fields: Record<string, string> }> => {
      const response = await apiClient.get<ApiResponse<{ url: string; fields: Record<string, string> }>>('/upload/signed-url', {
        params: { type },
      });
      return extractData(response);
    },
  };

  // ============================================================
  // Combined API object for easy import
  // ============================================================
  export const adminApi: any = {
    auth: authApi,
    dashboard: dashboardApi,
    products: productApi,
    categories: categoryApi,
    orders: orderApi,
    users: userApi,
    settings: settingsApi,
    gallery: galleryApi,
    banners: bannerApi,
    testimonials: testimonialApi,
    faqs: faqApi,
    blogs: blogApi,
    videos: videoApi,
    homepage: homepageApi,
    seo: seoApi,
    media: mediaApi,

    // Direct access to the underlying axios instance if needed
    client: apiClient,
  };

  // --- Flat convenience proxies for legacy callers ---
  // Categories
  (adminApi as any).uploadCategoryImage = (formData: FormData) =>
    (adminApi as any).categories.uploadImage(formData);
  (adminApi as any).getCategories = (params?: any) => (adminApi as any).categories.getCategories(params);
  (adminApi as any).getCategory = (id: string) => (adminApi as any).categories.getCategory(id);
  (adminApi as any).createCategory = (data: any) => (adminApi as any).categories.createCategory(data);
  (adminApi as any).updateCategory = (id: string, data: any) => (adminApi as any).categories.updateCategory(id, data);
  (adminApi as any).deleteCategory = (id: string) => (adminApi as any).categories.deleteCategory(id);

  // Products
  (adminApi as any).getProducts = (params?: any) => (adminApi as any).products.getProducts(params);
  (adminApi as any).getProduct = (id: string) => (adminApi as any).products.getProduct(id);
  (adminApi as any).createProduct = (data: any) => (adminApi as any).products.createProduct(data);
  (adminApi as any).updateProduct = (id: string, data: any) => (adminApi as any).products.updateProduct(id, data);
  (adminApi as any).deleteProduct = (id: string) => (adminApi as any).products.deleteProduct(id);
  (adminApi as any).uploadProductImages = (formData: FormData) => (adminApi as any).products.uploadImages(formData);

  // Orders
  (adminApi as any).getOrders = (params?: any) => (adminApi as any).orders.getOrders(params);
  (adminApi as any).updateOrderStatus = (id: string, status: string, notes?: string) => (adminApi as any).orders.updateOrderStatus(id, status, notes);

  // Users
  (adminApi as any).getUsers = (params?: any) => (adminApi as any).users.getUsers(params);
  (adminApi as any).updateUserRole = (id: string, role: string) => (adminApi as any).users.updateUserRole(id, role);
  (adminApi as any).updateUserStatus = (id: string, isActive: boolean) => (adminApi as any).users.updateUserStatus(id, isActive);
  (adminApi as any).deleteUser = (id: string) => (adminApi as any).users.deleteUser(id);

  // Settings
  (adminApi as any).getSettings = () => (adminApi as any).settings.getSettings();
  (adminApi as any).updateStoreSettings = (data: any) =>
    (adminApi as any).settings.updateStoreSettings(data);

  (adminApi as any).updatePaymentSettings = (data: any) =>
    (adminApi as any).settings.updatePaymentSettings(data);

  (adminApi as any).updateShippingSettings = (data: any) =>
    (adminApi as any).settings.updateShippingSettings(data);

  (adminApi as any).updateSocialSettings = (data: any) =>
    (adminApi as any).settings.updateSocialSettings(data);

  (adminApi as any).updateSEOSettings = (data: any) =>
    (adminApi as any).settings.updateSEOSettings(data);

  (adminApi as any).updateContactSettings = (data: any) =>
    (adminApi as any).settings.updateContactSettings(data);

  // Dashboard
  (adminApi as any).getDashboardStats = (period?: string) => (adminApi as any).dashboard.getStats(period);
  (adminApi as any).getRecentOrders = (limit?: number) => (adminApi as any).dashboard.getRecentOrders(limit);
  (adminApi as any).getRevenueData = (period?: string) => (adminApi as any).dashboard.getRevenueData(period);

  // ============================================================
  // Default export
  // ============================================================
  export default adminApi;
