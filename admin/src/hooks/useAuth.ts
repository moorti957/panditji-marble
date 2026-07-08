"use client";

import { useEffect, useState } from "react";
import { authApi } from "@/services/adminApi";

export type AuthUser = {
  _id?: string;
  id?: string;
  name?: string;
  email: string;
  role: string;
};

type LoginResponse = {
  success: boolean;
  message?: string;
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const me = await authApi.getMe();
        setUser(me);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

 const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    await authApi.login(email, password);

    // Login के बाद current user फिर से fetch करो
    const me = await authApi.getMe();
    setUser(me);

    return {
      success: true,
    };
  } catch (err: any) {
    return {
      success: false,
      message:
        err?.response?.data?.message ||
        err?.message ||
        "Login failed",
    };
  }
};

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };
}

export default useAuth;