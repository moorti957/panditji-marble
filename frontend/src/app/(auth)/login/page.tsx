// frontend/src/app/login/page.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { toast } from '@/lib/notifications';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { authApi } from "@/features/auth/api/authApi";
import { getUserFriendlyErrorDetails } from '@/lib/notifications';

import { useAuthStore } from '@/features/auth/store/authStore';

// ============================================================
// Form validation schema
// ============================================================
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().default(false),
});

type LoginFormInput = z.input<typeof loginSchema>;
type LoginFormData = z.output<typeof loginSchema>;

// ============================================================
// Login Page
// ============================================================
export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInput, unknown, LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // Form submission
 const onSubmit = async (data: LoginFormData) => {
  setIsSubmitting(true);

  try {
    const response = await authApi.login({
      email: data.email,
      password: data.password,
      rememberMe: data.rememberMe,
    });

   login(
    response.data.user,
    response.data.accessToken,
    response.data.refreshToken
);

    toast.success('Welcome back!', 'You have successfully signed in.');
    router.push("/");
  } catch (error: any) {
    toast.error(getUserFriendlyErrorDetails(error).title, getUserFriendlyErrorDetails(error).description);
  } finally {
    setIsSubmitting(false);
  }
};

  // Social login handlers
  const handleGoogleLogin = () => {
    toast.loading('Redirecting to Google...');
    // Implement Google OAuth
  };

  const handleFacebookLogin = () => {
    toast.loading('Redirecting to Facebook...');
    // Implement Facebook OAuth
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory py-12 px-4 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-10 w-72 h-72 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-maroon/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-gold/5 rounded-full" />
      </div>

      <Container className="relative z-10 max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl border border-gold/10 p-8 md:p-10"
        >
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <div className="font-cinzel text-2xl font-bold text-brown">
                Pandit Ji <span className="text-gold-dark">Murti</span>
              </div>
            </Link>
            <div className="ornate-divider my-4">
              <span className="diamond">✦</span>
            </div>
            <h1 className="font-cinzel text-2xl font-bold text-brown">Welcome Back</h1>
            <p className="text-brown-light text-sm mt-2">
              Login to access your account and manage your orders.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brown mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-light" />
                <Input
                  id="email"
                  type="email"
                  placeholder="devotee@example.com"
                  {...register('email')}
                  className={`pl-9 pr-4 py-2.5 ${errors.email ? 'border-red-400' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-brown mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-light" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  className={`pl-9 pr-10 py-2.5 ${errors.password ? 'border-red-400' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brown-light hover:text-brown transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-brown-light cursor-pointer">
                <Checkbox {...register('rememberMe')} className="accent-gold" />
                <span>Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-gold-dark hover:text-gold transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="btn-gold w-full py-3 text-base"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Logging in...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  Login
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gold/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-4 text-brown-light/60">or continue with</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gold/20 rounded-lg hover:bg-gold/5 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-sm font-medium">Google</span>
            </button>
            <button
              type="button"
              onClick={handleFacebookLogin}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gold/20 rounded-lg hover:bg-gold/5 transition-colors"
            >
              <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-sm font-medium">Facebook</span>
            </button>
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-brown-light mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-gold-dark hover:text-gold font-medium transition-colors">
              Create one now
            </Link>
          </p>

          {/* Trust badge */}
          <div className="mt-6 pt-6 border-t border-gold/10 text-center">
            <p className="text-xs text-brown-light/50">
              🔒 Secure login · Your data is protected
            </p>
          </div>
        </motion.div>
      </Container>
    </div>
  );
}