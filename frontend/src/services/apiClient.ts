// frontend/src/services/apiClient.ts

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { getAuthStore } from '@/store/rootStore'; // Or import from auth store directly

// ============================================================
// Types
// ============================================================

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: number;
  success: boolean;
}

/**
 * Shape of an error payload returned by the backend API
 */
export interface ApiErrorPayload {
  message?: string;
  code?: string;
  errors?: Record<string, string[]>;
}

// ============================================================
// Constants
// ============================================================

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'panditji-auth-storage';
const REFRESH_TOKEN_ENDPOINT = '/auth/refresh-token';

// ============================================================
// Token helpers
// ============================================================

const getTokensFromStore = () => {
  try {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        accessToken: parsed.state?.accessToken || null,
        refreshToken: parsed.state?.refreshToken || null,
      };
    }
  } catch {
    // ignore
  }
  return { accessToken: null, refreshToken: null };
};

const setTokensInStore = (accessToken: string, refreshToken: string) => {
  try {
    // We'll update the auth store directly; this is a fallback
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      parsed.state.accessToken = accessToken;
      parsed.state.refreshToken = refreshToken;
      localStorage.setItem(TOKEN_KEY, JSON.stringify(parsed));
    }
  } catch {
    // ignore
  }
};

const clearTokensFromStore = () => {
  try {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      parsed.state.accessToken = null;
      parsed.state.refreshToken = null;
      parsed.state.isAuthenticated = false;
      localStorage.setItem(TOKEN_KEY, JSON.stringify(parsed));
    }
  } catch {
    // ignore
  }
};

// ============================================================
// Create Axios instance
// ============================================================

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ============================================================
// Request Interceptor
// ============================================================

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const { accessToken } = getTokensFromStore();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ============================================================
// Response Interceptor with token refresh
// ============================================================

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (newToken: string) => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
};

const refreshAccessToken = async (): Promise<string> => {
  const { refreshToken } = getTokensFromStore();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await axios.post(
      `${BASE_URL}${REFRESH_TOKEN_ENDPOINT}`,
      { refreshToken }
    );
    const { accessToken, refreshToken: newRefreshToken } = response.data;
    // Update tokens in storage
    setTokensInStore(accessToken, newRefreshToken);
    return accessToken;
  } catch (error) {
    // Refresh token invalid – clear auth and reject
    clearTokensFromStore();
    // Dispatch logout event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth:logout'));
    }
    throw error;
  }
};

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return the data directly if it's an ApiResponse, else wrap it
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // If error is 401 and not a retry, attempt to refresh token
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes(REFRESH_TOKEN_ENDPOINT)
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Wait for token refresh to complete
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        // Update request headers
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        onTokenRefreshed(newToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed – reject the original error
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    const errorPayload = error.response?.data as ApiErrorPayload | undefined;
    const apiError: ApiError = {
      status: error.response?.status || 500,
      message: errorPayload?.message || error.message || 'An unexpected error occurred',
      code: errorPayload?.code,
      errors: errorPayload?.errors,
    };

    // Return a rejected promise with the structured error
    return Promise.reject(apiError);
  }
);

// ============================================================
// Helper functions for common request patterns
// ============================================================

/**
 * GET request with type inference
 */
export const get = <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return apiClient.get(url, config).then((res) => res.data);
};

/**
 * POST request
 */
export const post = <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
  return apiClient.post(url, data, config).then((res) => res.data);
};

/**
 * PUT request
 */
export const put = <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
  return apiClient.put(url, data, config).then((res) => res.data);
};

/**
 * PATCH request
 */
export const patch = <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
  return apiClient.patch(url, data, config).then((res) => res.data);
};

/**
 * DELETE request
 */
export const del = <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return apiClient.delete(url, config).then((res) => res.data);
};

// ============================================================
// Upload helper (multipart/form-data)
// ============================================================

export const uploadFile = <T>(
  url: string,
  file: File,
  fieldName: string = 'file',
  additionalData?: Record<string, unknown>
): Promise<T> => {
  const formData = new FormData();
  formData.append(fieldName, file);
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
  }
  return apiClient
    .post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((res) => res.data);
};

// ============================================================
// Error handler for components
// ============================================================

export const handleApiError = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return (error as { message: string }).message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred. Please try again.';
};

// ============================================================
// Type guard for API errors
// ============================================================

export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'message' in error
  );
};

// ============================================================
// Default export
// ============================================================

export default apiClient;