// frontend/src/features/auth/hooks/useAuth.ts

import { useQuery, useMutation, UseQueryOptions, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useCallback, useMemo, useEffect } from 'react';

import authApi, { authQueryKeys, getAuthErrorMessage, invalidateAuthQueries } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/features/auth/store/authStore';
import type {
  User,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  SocialAuthData,
  ResetPasswordData,
  ChangePasswordData,
  UpdateProfileData,
} from '@/features/auth/types/auth.types';

// ============================================================
// Types
// ============================================================

export interface UseAuthOptions {
  /**
   * Whether to redirect after successful auth actions
   * @default true
   */
  redirectOnSuccess?: boolean;
  /**
   * Redirect URL after login
   * @default '/'
   */
  redirectAfterLogin?: string;
  /**
   * Redirect URL after logout
   * @default '/login'
   */
  redirectAfterLogout?: string;
  /**
   * Enable automatic session refresh
   * @default true
   */
  autoRefreshSession?: boolean;
}

export interface UseAuthReturn {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  token: string | null;
  refreshToken: string | null;
  permissions: string[];
  
  // Getters
  getRole: () => string | undefined;
  hasRole: (role: string | string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  
  // Mutations
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  socialLogin: (data: SocialAuthData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  
  // Password
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  
  // Profile
  updateProfile: (data: UpdateProfileData) => Promise<User>;
  updateAvatar: (file: File) => Promise<string>;
  deleteAvatar: () => Promise<void>;
  
  // Session
  refreshSession: () => Promise<void>;
  getSession: () => Promise<User>;
  validateSession: () => Promise<boolean>;
  
  // Utilities
  isLoginLoading: boolean;
  isRegisterLoading: boolean;
  isLogoutLoading: boolean;
  isProfileLoading: boolean;
  isPasswordLoading: boolean;
  loginError: Error | null;
  registerError: Error | null;
  
  // Admin
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

// ============================================================
// useAuth Hook
// ============================================================

/**
 * A comprehensive authentication hook that manages user state,
 * auth operations, and session management.
 * 
 * @example
 * ```tsx
 * const { user, login, logout, isAuthenticated, isLoading } = useAuth();
 * 
 * // Login
 * const handleLogin = async (credentials) => {
 *   await login(credentials);
 * };
 * 
 * // Conditional rendering
 * if (isLoading) return <LoadingSpinner />;
 * if (isAuthenticated) return <Dashboard user={user} />;
 * return <LoginPage />;
 * ```
 */
export function useAuth(options: UseAuthOptions = {}): UseAuthReturn {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    redirectOnSuccess = true,
    redirectAfterLogin = '/',
    redirectAfterLogout = '/login',
    autoRefreshSession = true,
  } = options;

  // Auth store
  const {
    user,
    setUser,
    setTokens,
    clearAuth,
    isInitializing,
    setInitializing,
    getRole,
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    accessToken: token,
    refreshToken,
    permissions,
  } = useAuthStore();

  // ============================================================
  // Session Query
  // ============================================================

  const sessionQuery = useQuery({
    queryKey: authQueryKeys.session(),
    queryFn: async () => {
      try {
        const userData = await authApi.getSession();
        setUser(userData);
        return userData;
      } catch (error) {
        // If session is invalid, clear auth state
        if (error && typeof error === 'object' && 'response' in error) {
          const status = (error as any).response?.status;
          if (status === 401 || status === 403) {
            clearAuth();
          }
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: autoRefreshSession,
    refetchOnReconnect: autoRefreshSession,
    retry: 1,
    enabled: !!token,
  });

  // Set initializing state when session query is loading
  useEffect(() => {
    setInitializing(sessionQuery.isLoading);
  }, [sessionQuery.isLoading, setInitializing]);

  // ============================================================
  // Mutations
  // ============================================================

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data: AuthResponse) => {
      const authData = data.data;
      setUser(authData.user);
      setTokens(authData.accessToken, authData.refreshToken);
      invalidateAuthQueries(queryClient);
      toast.success(`Welcome back, ${authData.user.name || 'Devotee'}! 🙏`);
      if (redirectOnSuccess) {
        router.push(redirectAfterLogin);
      }
    },
    onError: (error: any) => {
      toast.error(getAuthErrorMessage(error) || 'Login failed. Please try again.');
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data: AuthResponse) => {
      const authData = data.data;
      setUser(authData.user);
      setTokens(authData.accessToken, authData.refreshToken);
      invalidateAuthQueries(queryClient);
      toast.success(`Welcome, ${authData.user.name || 'Devotee'}! 🙏 Please verify your email.`);
      if (redirectOnSuccess) {
        router.push(redirectAfterLogin);
      }
    },
    onError: (error: any) => {
      toast.error(getAuthErrorMessage(error) || 'Registration failed. Please try again.');
    },
  });

  // Social login mutation
  const socialLoginMutation = useMutation({
    mutationFn: authApi.socialLogin,
    onSuccess: (data: AuthResponse) => {
      const authData = data.data;
      setUser(authData.user);
      setTokens(authData.accessToken, authData.refreshToken);
      invalidateAuthQueries(queryClient);
      toast.success(`Welcome, ${authData.user.name || 'Devotee'}! 🙏`);
      if (redirectOnSuccess) {
        router.push(redirectAfterLogin);
      }
    },
    onError: (error: any) => {
      toast.error(getAuthErrorMessage(error) || 'Social login failed. Please try again.');
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        await authApi.logout();
      } catch (error) {
        // Even if logout API fails, we clear local state
        console.warn('Logout API failed, clearing local state anyway:', error);
      }
    },
    onSuccess: () => {
      clearAuth();
      invalidateAuthQueries(queryClient);
      queryClient.clear(); // Clear all cached data
      toast.success('Logged out successfully');
      if (redirectOnSuccess) {
        router.push(redirectAfterLogout);
      }
    },
    onError: (error: any) => {
      // Clear local state even if API fails
      clearAuth();
      queryClient.clear();
      toast.success('Logged out successfully');
      if (redirectOnSuccess) {
        router.push(redirectAfterLogout);
      }
    },
  });

  // Logout all devices mutation
  const logoutAllMutation = useMutation({
    mutationFn: authApi.logoutAll,
    onSuccess: () => {
      clearAuth();
      invalidateAuthQueries(queryClient);
      queryClient.clear();
      toast.success('Logged out from all devices');
      if (redirectOnSuccess) {
        router.push(redirectAfterLogout);
      }
    },
    onError: (error: any) => {
      toast.error(getAuthErrorMessage(error) || 'Failed to logout from all devices');
    },
  });

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: (_, variables) => {
      toast.success(`Password reset link sent to ${variables}`);
    },
    onError: (error: any) => {
      toast.error(getAuthErrorMessage(error) || 'Failed to send reset link. Please try again.');
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      toast.success('Password reset successfully! Please login with your new password.');
      if (redirectOnSuccess) {
        router.push('/login');
      }
    },
    onError: (error: any) => {
      toast.error(getAuthErrorMessage(error) || 'Failed to reset password. Please try again.');
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully!');
    },
    onError: (error: any) => {
      toast.error(getAuthErrorMessage(error) || 'Failed to change password. Please try again.');
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (updatedUser: User) => {
      setUser(updatedUser);
      invalidateAuthQueries(queryClient);
      toast.success('Profile updated successfully!');
    },
    onError: (error: any) => {
      toast.error(getAuthErrorMessage(error) || 'Failed to update profile. Please try again.');
    },
  });

  // Update avatar mutation
  const updateAvatarMutation = useMutation({
    mutationFn: authApi.updateAvatar,
    onSuccess: (data: { avatarUrl: string }) => {
      // Update user state with new avatar
      if (user) {
        setUser({ ...user, avatar: data.avatarUrl });
      }
      invalidateAuthQueries(queryClient);
      toast.success('Avatar updated successfully!');
    },
    onError: (error: any) => {
      toast.error(getAuthErrorMessage(error) || 'Failed to update avatar. Please try again.');
    },
  });

  // Delete avatar mutation
  const deleteAvatarMutation = useMutation({
    mutationFn: authApi.deleteAvatar,
    onSuccess: () => {
      if (user) {
        setUser({ ...user, avatar: undefined });
      }
      invalidateAuthQueries(queryClient);
      toast.success('Avatar removed successfully.');
    },
    onError: (error: any) => {
      toast.error(getAuthErrorMessage(error) || 'Failed to remove avatar. Please try again.');
    },
  });

  // ============================================================
  // Session refresh
  // ============================================================

  const refreshSession = useCallback(async (): Promise<void> => {
    if (!token) return;
    try {
      const userData = await authApi.getSession();
      setUser(userData);
    } catch (error) {
      clearAuth();
      throw error;
    }
  }, [token, setUser, clearAuth]);

  // ============================================================
  // Auth operations (wrapped with loading states)
  // ============================================================

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return await loginMutation.mutateAsync(credentials);
  }, [loginMutation]);

  const register = useCallback(async (data: RegisterData): Promise<AuthResponse> => {
    return await registerMutation.mutateAsync(data);
  }, [registerMutation]);

  const socialLogin = useCallback(async (data: SocialAuthData): Promise<AuthResponse> => {
    return await socialLoginMutation.mutateAsync(data);
  }, [socialLoginMutation]);

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const logoutAll = useCallback(async () => {
    await logoutAllMutation.mutateAsync();
  }, [logoutAllMutation]);

  const forgotPassword = useCallback(async (email: string) => {
    await forgotPasswordMutation.mutateAsync(email);
  }, [forgotPasswordMutation]);

  const resetPassword = useCallback(async (data: ResetPasswordData) => {
    await resetPasswordMutation.mutateAsync(data);
  }, [resetPasswordMutation]);

  const changePassword = useCallback(async (data: ChangePasswordData) => {
    await changePasswordMutation.mutateAsync(data);
  }, [changePasswordMutation]);

  const updateProfile = useCallback(async (data: UpdateProfileData): Promise<User> => {
    return await updateProfileMutation.mutateAsync(data);
  }, [updateProfileMutation]);

  const updateAvatar = useCallback(async (file: File): Promise<string> => {
    const result = await updateAvatarMutation.mutateAsync(file);
    return result.avatarUrl;
  }, [updateAvatarMutation]);

  const deleteAvatar = useCallback(async () => {
    await deleteAvatarMutation.mutateAsync();
  }, [deleteAvatarMutation]);

  // ============================================================
  // Computed state
  // ============================================================

  const isAuthenticated = useMemo(() => !!user && !!token, [user, token]);
  const isLoading = sessionQuery.isLoading || isInitializing;
  const isLoginLoading = loginMutation.isPending;
  const isRegisterLoading = registerMutation.isPending;
  const isLogoutLoading = logoutMutation.isPending || logoutAllMutation.isPending;
  const isProfileLoading = updateProfileMutation.isPending || updateAvatarMutation.isPending || deleteAvatarMutation.isPending;
  const isPasswordLoading = resetPasswordMutation.isPending || changePasswordMutation.isPending;

  const loginError = loginMutation.error as Error | null;
  const registerError = registerMutation.error as Error | null;

  const isAdmin = useMemo(() => {
    const role = user?.role;
    return role === 'admin' || role === 'super-admin';
  }, [user]);

  const isSuperAdmin = useMemo(() => user?.role === 'super-admin', [user]);

  // ============================================================
  // Return value
  // ============================================================

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    isInitializing,
    token,
    refreshToken,
    permissions: permissions || [],
    
    // Getters
    getRole: () => user?.role,
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Mutations
    login,
    register,
    socialLogin,
    logout,
    logoutAll,
    
    // Password
    forgotPassword,
    resetPassword,
    changePassword,
    
    // Profile
    updateProfile,
    updateAvatar,
    deleteAvatar,
    
    // Session
    refreshSession,
    getSession: async () => {
      const data = await authApi.getSession();
      setUser(data);
      return data;
    },
    validateSession: async () => {
      try {
        await authApi.validateSession();
        return true;
      } catch {
        clearAuth();
        return false;
      }
    },
    
    // Loading states
    isLoginLoading,
    isRegisterLoading,
    isLogoutLoading,
    isProfileLoading,
    isPasswordLoading,
    loginError,
    registerError,
    
    // Admin
    isAdmin,
    isSuperAdmin,
  };
}

// ============================================================
// useRequireAuth – Hook for protected routes
// ============================================================

export interface UseRequireAuthOptions {
  /**
   * Redirect URL if not authenticated
   * @default '/login'
   */
  redirectTo?: string;
  /**
   * Required roles for access
   */
  roles?: string[];
  /**
   * Required permissions for access
   */
  permissions?: string[];
}

/**
 * Hook for protecting routes. Redirects to login if not authenticated,
 * or shows access denied if roles/permissions are not met.
 * 
 * @example
 * ```tsx
 * const { isAuthorized, isLoading } = useRequireAuth({
 *   roles: ['admin'],
 *   permissions: ['manage_products'],
 * });
 * 
 * if (isLoading) return <LoadingSpinner />;
 * if (!isAuthorized) return <AccessDenied />;
 * return <ProtectedContent />;
 * ```
 */
export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const router = useRouter();
  const { 
    redirectTo = '/login', 
    roles = [], 
    permissions = [],
  } = options;

  const { user, isAuthenticated, isLoading, isInitializing, hasRole, hasAnyPermission, hasAllPermissions } = useAuth();

  const isAuthorized = useMemo(() => {
    if (!isAuthenticated) return false;
    
    // Check roles
    if (roles.length > 0) {
      const hasRequiredRole = roles.some((role) => hasRole(role));
      if (!hasRequiredRole) return false;
    }
    
    // Check permissions
    if (permissions.length > 0) {
      const hasRequiredPermissions = hasAllPermissions(permissions);
      if (!hasRequiredPermissions) return false;
    }
    
    return true;
  }, [isAuthenticated, roles, permissions, hasRole, hasAllPermissions]);

  useEffect(() => {
    if (isLoading || isInitializing) return;
    
    if (!isAuthenticated) {
      // Store the attempted URL for redirect after login
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('authRedirect', window.location.pathname);
      }
      router.push(redirectTo);
    } else if (!isAuthorized) {
      router.push('/unauthorized');
    }
  }, [isAuthenticated, isLoading, isInitializing, isAuthorized, router, redirectTo]);

  return {
    isAuthenticated,
    isLoading: isLoading || isInitializing,
    isAuthorized,
    user,
  };
}

// ============================================================
// useRedirectIfAuthenticated – Hook for auth pages
// ============================================================

/**
 * Hook for redirecting authenticated users away from auth pages
 * (login, register, forgot password, etc.)
 * 
 * @example
 * ```tsx
 * function LoginPage() {
 *   useRedirectIfAuthenticated({ redirectTo: '/' });
 *   return <LoginForm />;
 * }
 * ```
 */
export function useRedirectIfAuthenticated(options: {
  redirectTo?: string;
  loadingComponent?: React.ReactNode;
} = {}) {
  const { redirectTo = '/', loadingComponent = null } = options;
  const router = useRouter();
  const { isAuthenticated, isLoading, isInitializing } = useAuth();

  useEffect(() => {
    if (isLoading || isInitializing) return;
    if (isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, isInitializing, router, redirectTo]);

  const isChecking = isLoading || isInitializing;

  return {
    isChecking,
    isAuthenticated,
    shouldRender: !isChecking && !isAuthenticated,
  };
}

// ============================================================
// Default export
// ============================================================
export default useAuth;