// admin/src/app/login/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// ============================================================
// Form Validation Schema
// ============================================================
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ============================================================
// Admin Login Page
// ============================================================
export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
  if (
    isAuthenticated &&
    (user?.role === 'admin' || user?.role === 'super-admin')
  ) {
    router.replace('/dashboard');
  }
}, [isAuthenticated, user, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Handle login
  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const response = await login(data.email, data.password);
      if (response.success) {
        toast.success('Welcome back, Admin! 🙏');
        router.push('/dashboard');
      } else {
        toast.error(response.message || 'Invalid credentials');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory dark:bg-brown py-12 px-4 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-10 w-72 h-72 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-maroon/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-gold/5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-gold/5 rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-brown-dark rounded-2xl shadow-xl border border-gold/10 p-8 md:p-10"
        >
          {/* Logo / Brand */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-gold-dark dark:text-gold" />
              </div>
            </div>
            <h1 className="font-cinzel text-2xl font-bold text-brown dark:text-ivory">
              Admin Panel
            </h1>
            <p className="text-brown-light dark:text-ivory/60 text-sm mt-1">
              Pandit Ji Marble Murti Arts
            </p>
            <div className="ornate-divider my-4">
              <span className="diamond">✦</span>
            </div>
            <p className="text-brown-light dark:text-ivory/50 text-sm">
              Login to manage your store
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brown dark:text-ivory mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-light/50" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@panditjimurti.com"
                  {...register('email')}
                  className={`pl-9 pr-4 py-2.5 ${errors.email ? 'border-red-400' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-brown dark:text-ivory mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-light/50" />
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brown-light/50 hover:text-brown dark:hover:text-ivory transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="btn-gold w-full py-3 text-base"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
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

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gold/10 text-center">
            <p className="text-xs text-brown-light/50 dark:text-ivory/30">
              🔒 Secure admin access · Protected by JWT authentication
            </p>
            <p className="text-xs text-brown-light/40 dark:text-ivory/20 mt-2">
              © {new Date().getFullYear()} Pandit Ji Marble Murti Arts
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}