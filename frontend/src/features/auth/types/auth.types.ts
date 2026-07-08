// frontend/src/features/auth/types/auth.types.ts

// ============================================================
// Core User Type
// ============================================================

/**
 * Authenticated user entity
 */
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  avatar?: string;
  permissions?: string[];
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================
// Auth Response Types
// ============================================================

/**
 * Response returned by login/register/social-login endpoints
 */
export interface AuthData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: AuthData;
}

// ============================================================
// Credential / Payload Types
// ============================================================

/**
 * Login credentials (email + password)
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Registration payload
 */
export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string;
}

/**
 * Social login payload (Google, Facebook, etc.)
 */
export interface SocialAuthData {
  provider: 'google' | 'facebook' | 'apple';
  token: string;
  email?: string;
  name?: string;
  avatar?: string;
}

/**
 * OTP verification payload
 */
export interface VerifyOTPData {
  email?: string;
  phone?: string;
  otp: string;
}

/**
 * Reset password payload
 */
export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword?: string;
}

/**
 * Change password payload (authenticated user)
 */
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

/**
 * Update profile payload
 */
export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

// ============================================================
// Session Types
// ============================================================

/**
 * Session validation response
 */
export interface SessionData {
  valid: boolean;
  user?: User;
  expiresAt?: string;
}

/**
 * Structured auth error
 */
export interface AuthError {
  status: number;
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}
