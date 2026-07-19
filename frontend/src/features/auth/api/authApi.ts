// frontend/src/features/auth/api/authApi.ts

import { apiClient } from '@/services/apiClient';
import type { ApiError } from '@/services/apiClient';
import { getUserFriendlyErrorDetails } from '@/lib/notifications';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  SocialAuthData,
  VerifyOTPData,
  ResetPasswordData,
  ChangePasswordData,
  UpdateProfileData,
  User,
  SessionData,
  AuthError,
} from '@/features/auth/types/auth.types';

// ============================================================
// Query Keys (for React Query)
// ============================================================
export const authQueryKeys = {
  all: ['auth'] as const,
  session: () => [...authQueryKeys.all, 'session'] as const,
  user: () => [...authQueryKeys.all, 'user'] as const,
  profile: () => [...authQueryKeys.all, 'profile'] as const,
  permissions: () => [...authQueryKeys.all, 'permissions'] as const,
};

// ============================================================
// Auth API
// ============================================================
export const authApi = {
  // ============================================================
  // Registration
  // ============================================================

  /**
   * Register a new user
   * 
   * @param data - Registration data
   * @returns AuthResponse with user and tokens
   * 
   * @example
   * ```ts
   * const response = await authApi.register({
   *   name: 'Devotee Sharma',
   *   email: 'devotee@example.com',
   *   phone: '+917240364772',
   *   password: 'SecurePassword123',
   *   confirmPassword: 'SecurePassword123',
   * });
   * ```
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      throw {
        status: apiError.status,
        message: apiError.message,
        code: apiError.code,
        errors: apiError.errors,
      };
    }
  },

  /**
   * Verify email with OTP
   */
  verifyEmail: async (email: string, otp: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/auth/verify-email', { email, otp });
    return response.data;
  },

  /**
   * Resend verification OTP
   */
  resendVerificationOTP: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/auth/resend-otp', { email });
    return response.data;
  },

  // ============================================================
  // Login & Authentication
  // ============================================================

  /**
   * Login with email and password
   * 
   * @param credentials - Email and password
   * @returns AuthResponse with user and tokens
   * 
   * @example
   * ```ts
   * const response = await authApi.login({
   *   email: 'devotee@example.com',
   *   password: 'SecurePassword123',
   * });
   * ```
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Login with phone number and OTP
   */
  loginWithPhone: async (phone: string, otp: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login/phone', { phone, otp });
    return response.data;
  },

  /**
   * Send OTP for phone login
   */
  sendPhoneOTP: async (phone: string): Promise<{ success: boolean; message: string; expiresIn: number }> => {
    const response = await apiClient.post('/auth/send-otp', { phone });
    return response.data;
  },

  /**
   * Social login with Google, Facebook, etc.
   */
  socialLogin: async (data: SocialAuthData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/social-login', data);
    return response.data;
  },

  /**
   * Get current session user
   */
 getSession: async (): Promise<User> => {
   const response = await apiClient.get("/auth/me");
   return response.data.data;
},

  /**
   * Validate session token
   */
  validateSession: async (): Promise<SessionData> => {
    const response = await apiClient.get<SessionData>('/auth/validate');
    return response.data;
  },

  // ============================================================
  // Token Management
  // ============================================================

  /**
   * Refresh access token using refresh token
   */
 refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    "/auth/refresh-token",
    { refreshToken }
  );

  return response.data;
},

  /**
   * Logout (invalidate refresh token)
   */
  logout: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  /**
   * Logout from all devices
   */
  logoutAll: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/auth/logout-all');
    return response.data;
  },

  // ============================================================
  // Password Management
  // ============================================================

  /**
   * Request password reset (send reset link to email)
   */
  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Reset password using token
   */
  resetPassword: async (data: ResetPasswordData): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data;
  },

  /**
   * Change password (requires authentication)
   */
  changePassword: async (data: ChangePasswordData): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/auth/change-password', data);
    return response.data;
  },

  // ============================================================
  // Profile Management
  // ============================================================

  /**
   * Get user profile
   */
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/profile');
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    const response = await apiClient.put<User>('/auth/profile', data);
    return response.data;
  },

  /**
   * Update profile picture (avatar)
   */
  updateAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await apiClient.put('/auth/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Delete profile picture
   */
  deleteAvatar: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete('/auth/profile/avatar');
    return response.data;
  },

  // ============================================================
  // User Management (authenticated users)
  // ============================================================

  /**
   * Get all users (admin only)
   */
  getUsers: async (params?: { page?: number; limit?: number; role?: string; search?: string }): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.role) queryParams.append('role', params.role);
    if (params?.search) queryParams.append('search', params.search);
    
    const url = queryParams.toString() ? `/users?${queryParams}` : '/users';
    const response = await apiClient.get(url);
    return response.data;
  },

  /**
   * Get user by ID (admin only)
   */
  getUserById: async (userId: string): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${userId}`);
    return response.data;
  },

  /**
   * Update user role (admin only)
   */
  updateUserRole: async (userId: string, role: string): Promise<User> => {
    const response = await apiClient.put<User>(`/users/${userId}/role`, { role });
    return response.data;
  },

  /**
   * Delete user (admin only)
   */
  deleteUser: async (userId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  },

  // ============================================================
  // Two-Factor Authentication
  // ============================================================

  /**
   * Enable 2FA for the current user
   */
  enable2FA: async (): Promise<{ qrCode: string; secret: string; backupCodes: string[] }> => {
    const response = await apiClient.post('/auth/2fa/enable');
    return response.data;
  },

  /**
   * Verify 2FA code
   */
  verify2FA: async (code: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/auth/2fa/verify', { code });
    return response.data;
  },

  /**
   * Disable 2FA
   */
  disable2FA: async (code: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/auth/2fa/disable', { code });
    return response.data;
  },

  // ============================================================
  // Email Management
  // ============================================================

  /**
   * Change email (requires authentication)
   */
  changeEmail: async (newEmail: string, password: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/auth/change-email', { newEmail, password });
    return response.data;
  },

  /**
   * Verify new email
   */
  verifyNewEmail: async (otp: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/auth/verify-new-email', { otp });
    return response.data;
  },

  // ============================================================
  // Device Management
  // ============================================================

  /**
   * Get all active sessions/devices
   */
  getActiveSessions: async (): Promise<Array<{
    deviceId: string;
    deviceName: string;
    browser: string;
    os: string;
    ip: string;
    lastActive: string;
    isCurrent: boolean;
  }>> => {
    const response = await apiClient.get('/auth/sessions');
    return response.data;
  },

  /**
   * Terminate a specific session
   */
  terminateSession: async (sessionId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/auth/sessions/${sessionId}`);
    return response.data;
  },

  /**
   * Terminate all sessions except current
   */
  terminateAllSessions: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete('/auth/sessions/all');
    return response.data;
  },

  // ============================================================
  // Admin/Dev Tools
  // ============================================================

  /**
   * Check if email is available (for registration)
   */
  checkEmailAvailability: async (email: string): Promise<{ available: boolean; message?: string }> => {
    const response = await apiClient.get(`/auth/check-email?email=${encodeURIComponent(email)}`);
    return response.data;
  },

  /**
   * Check if phone is available (for registration)
   */
  checkPhoneAvailability: async (phone: string): Promise<{ available: boolean; message?: string }> => {
    const response = await apiClient.get(`/auth/check-phone?phone=${encodeURIComponent(phone)}`);
    return response.data;
  },

  /**
   * Get user permissions (for RBAC)
   */
  getPermissions: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/auth/permissions');
    return response.data;
  },
};

// ============================================================
// Utility Functions
// ============================================================

/**
 * Extract error message from API error
 */
export function getAuthErrorMessage(error: unknown): string {
  const details = getUserFriendlyErrorDetails(error);
  return details.title;
}

/**
 * Check if a token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;
    if (!exp) return true;
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

/**
 * Decode JWT token
 */
export function decodeToken(token: string): any {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

/**
 * Get token expiration time in milliseconds
 */
export function getTokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

/**
 * Check if token is about to expire (within 5 minutes)
 */
export function isTokenExpiringSoon(token: string, thresholdMs: number = 5 * 60 * 1000): boolean {
  const expiry = getTokenExpiry(token);
  if (!expiry) return true;
  return Date.now() >= expiry - thresholdMs;
}

// ============================================================
// React Query Invalidation Helpers
// ============================================================

/**
 * Invalidate all auth queries
 */
export function invalidateAuthQueries(queryClient: any): void {
  queryClient.invalidateQueries({ queryKey: authQueryKeys.all });
}

/**
 * Invalidate session data
 */
export function invalidateSession(queryClient: any): void {
  queryClient.invalidateQueries({ queryKey: authQueryKeys.session() });
}

/**
 * Invalidate user profile
 */
export function invalidateProfile(queryClient: any): void {
  queryClient.invalidateQueries({ queryKey: authQueryKeys.profile() });
}

// ============================================================
// Default export
// ============================================================
export default authApi;