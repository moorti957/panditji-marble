// frontend/src/app/register/page.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { toast } from '@/lib/notifications';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Check,
  X,
  ShieldCheck,
  Gem,
  Hammer,
} from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';

import { useAuthStore } from '@/features/auth/store/authStore';
import { authApi } from '@/features/auth/api/authApi';

// ============================================================
// Form validation schema
// ============================================================
const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().regex(/^\d{10}$/, 'Please enter a valid 10-digit Indian phone number'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, 'You must agree to continue'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// ============================================================
// Feature highlights for the brand panel
// ============================================================
const features = [
  { icon: Hammer, label: 'Trusted Marble Artisans' },
  { icon: Gem, label: 'Premium Quality Marble' },
  { icon: ShieldCheck, label: 'Secure Registration' },
];

// ============================================================
// Register Page
// ============================================================
export default function RegisterPage() {
  const router = useRouter();
  const { register: registerAuth } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  });

  // Watch password for strength indicator
  const watchPassword = watch('password', '');

  // Password strength checks
  const hasMinLength = watchPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(watchPassword);
  const hasLowercase = /[a-z]/.test(watchPassword);
  const hasNumber = /[0-9]/.test(watchPassword);
  const strength = [hasMinLength, hasUppercase, hasLowercase, hasNumber].filter(Boolean).length;

  const getStrengthLabel = (): { label: string; color: string } => {
    if (watchPassword.length === 0) return { label: '', color: '' };
    if (strength <= 1) return { label: 'Weak', color: 'text-red-500' };
    if (strength === 2) return { label: 'Fair', color: 'text-orange-500' };
    if (strength === 3) return { label: 'Good', color: 'text-yellow-500' };
    return { label: 'Strong', color: 'text-green-600' };
  };

  const strengthInfo = getStrengthLabel();

  // Form submission
  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      const response = await authApi.register({
        name: data.name,
        email: data.email,
        phone: data.phone.replace(/\D/g, ''),
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      registerAuth(
        response.data.user,
        response.data.accessToken,
        response.data.refreshToken
      );

      toast.success('Account created successfully.', 'You are now signed in and ready to explore our collection.');
      router.push('/');
    } catch (error: any) {
      const status = error?.status;
      const code = error?.code;
      const backendMessage = error?.message || 'We couldn’t create your account right now.';

      if (status === 409 && code === 'DUPLICATE_EMAIL') {
        toast.error('This email is already registered.', 'Please use a different email address to continue.');
      } else if (status === 409 && code === 'DUPLICATE_PHONE') {
        toast.error('This phone number is already registered.', 'Please use a different phone number to continue.');
      } else if (status === 400) {
        toast.error('Please review the registration details.', backendMessage);
      } else if (code === 'ERR_NETWORK' || status === 0) {
        toast.error('Unable to connect right now.', 'Please check your internet connection and try again.');
      } else {
        toast.error('We couldn’t create your account.', backendMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onInvalid = (formErrors: typeof errors) => {
    console.warn('Register form validation failed:', formErrors);
  };

  // Social login handlers
  const handleGoogleRegister = () => {
    toast.loading('Redirecting to Google...');
    // Implement Google OAuth
  };

  const handleFacebookRegister = () => {
    toast.loading('Redirecting to Facebook...');
    // Implement Facebook OAuth
  };

  return (
    <div className="min-h-screen sm:h-screen w-full overflow-y-auto sm:overflow-hidden bg-ivory flex flex-col lg:flex-row">
      {/* ============================================================
          LEFT PANEL — Brand / Marble Workshop (desktop only)
      ============================================================ */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-brown">
        {/* Base gradient — deep marble tones */}
        <div className="absolute inset-0 bg-gradient-to-br from-brown via-[#2a1c12] to-black" />

        {/* Carved marble veining pattern */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.08]"
          viewBox="0 0 400 800"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            d="M0 120 C 80 180, 120 60, 220 140 S 340 260, 400 180"
            stroke="#D4AF37"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M-20 380 C 100 320, 160 460, 280 380 S 420 300, 460 420"
            stroke="#D4AF37"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M0 620 C 90 560, 180 700, 260 600 S 380 520, 420 640"
            stroke="#D4AF37"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>

        {/* Ambient gold glow */}
        <div className="absolute top-[-10%] right-[-15%] w-[420px] h-[420px] bg-gold/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-15%] w-[420px] h-[420px] bg-maroon/30 rounded-full blur-[120px]" />

        {/* Fine radial ring motif, echoing a temple mandala */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] border border-gold/10 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] border border-gold/10 rounded-full" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full w-full px-12 py-12">
          {/* Logo */}
          <Link href="/" className="inline-block w-fit">
            <div className="font-cinzel text-2xl font-bold text-ivory tracking-wide">
              Pandit Ji <span className="text-gold">Murti</span>
            </div>
          </Link>

          {/* Headline block */}
          <div>
            <span className="diamond text-gold text-xl">✦</span>
            <h1 className="font-cinzel text-4xl xl:text-5xl font-bold text-ivory leading-tight mt-4">
              Welcome to
              <br />
              <span className="text-gold">Pandit Ji Marble Murti Art</span>
            </h1>
            <p className="text-ivory/70 text-base leading-relaxed mt-5 max-w-sm">
              Premium handcrafted marble murtis made with devotion and traditional
              craftsmanship, carved for generations of faith.
            </p>

            {/* Feature cards */}
            <div className="mt-10 space-y-3 max-w-sm">
              {features.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md px-4 py-3.5"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gold/15 text-gold shrink-0">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-ivory/90 text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <p className="text-ivory/40 text-xs">
            &copy; {new Date().getFullYear()} Pandit Ji Marble Murti Art. All rights reserved.
          </p>
        </div>
      </div>

      {/* ============================================================
          RIGHT PANEL — Register area (two-column form, no card, no scroll)
      ============================================================ */}
      <div className="w-full lg:w-[55%] relative flex items-center justify-center px-5 sm:px-10 lg:px-12 py-6 lg:py-8">
        {/* Soft decorative glow, sits behind the content — not a card */}
        <div className="absolute top-[-10%] right-[-10%] w-72 h-72 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-72 h-72 bg-maroon/5 rounded-full blur-3xl pointer-events-none" />

        <Container className="relative z-10 w-full max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {/* Mobile-only logo */}
            <div className="text-center mb-5 lg:hidden">
              <Link href="/" className="inline-block">
                <div className="font-cinzel text-xl font-bold text-brown">
                  Pandit Ji <span className="text-gold-dark">Murti</span>
                </div>
              </Link>
            </div>

            {/* Heading, shown directly — no card wrapper */}
            <div className="mb-6 text-center lg:text-left">
              <span className="text-gold text-lg">✦</span>
              <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-brown mt-2">
                Create Account
              </h2>
              <p className="text-brown-light text-sm mt-2">
                Join our divine community and explore our collection.
              </p>
            </div>

            {/* Register Form — lives directly in the page, not inside a card */}
            <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="space-y-6">
              {/* ----------------------------------------------------
                  Two-column field grid on desktop, single column
                  on mobile/tablet. Pairs:
                  Full Name / Email — Phone / Password —
                  Confirm Password / Agree checkbox
              ---------------------------------------------------- */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-5">
                {/* Full Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-brown mb-1.5">
                    Full Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-light/70 transition-colors group-focus-within:text-gold-dark" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your full name"
                      {...register('name')}
                      className={`pl-10 pr-4 py-3 rounded-xl border-brown/15 transition-all focus:ring-2 focus:ring-gold/40 focus:border-gold-dark ${
                        errors.name ? 'border-red-400' : ''
                      }`}
                    />
                  </div>
                  {errors.name && <p className="text-xs text-red-500 mt-1.5">{errors.name.message}</p>}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-brown mb-1.5">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-light/70 transition-colors group-focus-within:text-gold-dark" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="devotee@example.com"
                      {...register('email')}
                      className={`pl-10 pr-4 py-3 rounded-xl border-brown/15 transition-all focus:ring-2 focus:ring-gold/40 focus:border-gold-dark ${
                        errors.email ? 'border-red-400' : ''
                      }`}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 mt-1.5">{errors.email.message}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-brown mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-light/70 transition-colors group-focus-within:text-gold-dark" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 72403 64772"
                      {...register('phone')}
                      className={`pl-10 pr-4 py-3 rounded-xl border-brown/15 transition-all focus:ring-2 focus:ring-gold/40 focus:border-gold-dark ${
                        errors.phone ? 'border-red-400' : ''
                      }`}
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-red-500 mt-1.5">{errors.phone.message}</p>}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-brown mb-1.5">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-light/70 transition-colors group-focus-within:text-gold-dark" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...register('password')}
                      className={`pl-10 pr-11 py-3 rounded-xl border-brown/15 transition-all focus:ring-2 focus:ring-gold/40 focus:border-gold-dark ${
                        errors.password ? 'border-red-400' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brown-light hover:text-gold-dark transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500 mt-1.5">{errors.password.message}</p>
                  )}

                  {/* Password strength indicator — unchanged logic */}
                  {watchPassword.length > 0 && (
                    <div className="mt-2.5 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 rounded-full ${
                              strength <= 1
                                ? 'w-1/4 bg-red-500'
                                : strength === 2
                                ? 'w-2/4 bg-orange-500'
                                : strength === 3
                                ? 'w-3/4 bg-yellow-500'
                                : 'w-full bg-green-500'
                            }`}
                          />
                        </div>
                        <span className={`text-xs font-medium ${strengthInfo.color}`}>
                          {strengthInfo.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div
                          className={`flex items-center gap-1 ${
                            hasMinLength ? 'text-green-600' : 'text-gray-400'
                          }`}
                        >
                          {hasMinLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          <span>8+ characters</span>
                        </div>
                        <div
                          className={`flex items-center gap-1 ${
                            hasUppercase ? 'text-green-600' : 'text-gray-400'
                          }`}
                        >
                          {hasUppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          <span>Uppercase</span>
                        </div>
                        <div
                          className={`flex items-center gap-1 ${
                            hasLowercase ? 'text-green-600' : 'text-gray-400'
                          }`}
                        >
                          {hasLowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          <span>Lowercase</span>
                        </div>
                        <div
                          className={`flex items-center gap-1 ${
                            hasNumber ? 'text-green-600' : 'text-gray-400'
                          }`}
                        >
                          {hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          <span>Number</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-brown mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-light/70 transition-colors group-focus-within:text-gold-dark" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      {...register('confirmPassword')}
                      className={`pl-10 pr-11 py-3 rounded-xl border-brown/15 transition-all focus:ring-2 focus:ring-gold/40 focus:border-gold-dark ${
                        errors.confirmPassword ? 'border-red-400' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brown-light hover:text-gold-dark transition-colors"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1.5">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Consent — single required checkbox, no links.
                    Paired in the grid alongside Confirm Password.
                    IMPORTANT: bound with Controller instead of {...register('terms')}
                    because the shared <Checkbox> component renders a
                    <button role="checkbox"> (shadcn/Radix pattern) and exposes
                    `checked` + `onCheckedChange`, not a native `onChange` event.
                    Controller keeps RHF state, zod validation, and submit in sync. */}
                <div className="flex flex-col justify-center">
                  <span className="hidden lg:block text-sm font-medium text-transparent mb-1.5 select-none" aria-hidden="true">
                    Consent
                  </span>
                  <div className="flex items-center gap-2.5">
                    <Controller
                      name="terms"
                      control={control}
                      render={({ field: { value, onChange, onBlur, ref, name } }) => (
                        <Checkbox
                          id="terms"
                          name={name}
                          ref={ref}
                          checked={value}
                          onCheckedChange={(checked: boolean) => onChange(checked === true)}
                          onBlur={onBlur}
                          className="accent-gold shrink-0"
                        />
                      )}
                    />
                    <label htmlFor="terms" className="text-sm text-brown-light select-none cursor-pointer">
                      I agree to continue.
                    </label>
                  </div>
                  {errors.terms && <p className="text-xs text-red-500 mt-1.5">{errors.terms.message}</p>}
                </div>
              </div>

              {/* Submit Button — full width, spans both columns */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="btn-gold w-full py-3.5 text-base rounded-xl shadow-lg shadow-gold/20 transition-transform active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gold/15" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-ivory px-4 text-brown-light/60">or continue with</span>
              </div>
            </div>

            {/* Social Registration */}
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto lg:mx-0">
              <button
                type="button"
                onClick={handleGoogleRegister}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-gold/20 rounded-xl hover:bg-gold/5 hover:border-gold/40 transition-colors"
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
                onClick={handleFacebookRegister}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-gold/20 rounded-xl hover:bg-gold/5 hover:border-gold/40 transition-colors"
              >
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="text-sm font-medium">Facebook</span>
              </button>
            </div>

            {/* Login link */}
            <p className="text-center lg:text-left text-sm text-brown-light mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-gold-dark hover:text-gold font-medium transition-colors">
                Login here
              </Link>
            </p>

            {/* Trust badge */}
            <div className="mt-5 pt-5 border-t border-gold/10 text-center lg:text-left">
              <p className="text-xs text-brown-light/50 inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Secure registration · Your data is protected
              </p>
            </div>
          </motion.div>
        </Container>
      </div>
    </div>
  );
}