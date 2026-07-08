// frontend/src/components/sections/Newsletter.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Send, Check, Mail, Sparkles, ArrowRight } from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

// ============================================================
// Types
// ============================================================
interface NewsletterProps {
  title?: string;
  subtitle?: string;
  placeholder?: string;
  buttonText?: string;
  successMessage?: string;
  className?: string;
  variant?: 'default' | 'compact' | 'full-width';
  onSubmit?: (email: string) => Promise<void>;
}

// ============================================================
// Newsletter Component
// ============================================================
export function Newsletter({
  title = 'Join Our Divine Community',
  subtitle = 'Subscribe to receive updates on new arrivals, exclusive collections, and spiritual insights.',
  placeholder = 'Enter your email address',
  buttonText = 'Subscribe',
  successMessage = 'Successfully subscribed! 🙏',
  className,
  variant = 'default',
  onSubmit,
}: NewsletterProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle subscription
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(email);
      } else {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
      setIsSuccess(true);
      toast.success(successMessage);
      setEmail('');
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Focus input on mount (for accessibility)
  useEffect(() => {
    if (inputRef.current && !isSuccess) {
      // Don't auto-focus on mobile to avoid keyboard popping up
      if (window.innerWidth > 768) {
        setTimeout(() => inputRef.current?.focus(), 300);
      }
    }
  }, [isSuccess]);

  // Compact variant (for sidebars or small sections)
  if (variant === 'compact') {
    return (
      <div className={cn('bg-white dark:bg-brown-dark rounded-2xl p-4 shadow-sm border border-gold/5', className)}>
        <h3 className="font-cinzel text-lg font-semibold text-brown dark:text-ivory mb-2">
          {title}
        </h3>
        <p className="text-xs text-brown-light dark:text-ivory/60 mb-3">
          {subtitle || 'Get updates on new arrivals and offers.'}
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            type="email"
            placeholder={placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting || isSuccess}
            className="flex-1 bg-sand/50 dark:bg-brown/50 border-gold/10 rounded-full text-sm px-3 py-1.5 focus:border-gold"
          />
          <Button
            type="submit"
            disabled={isSubmitting || isSuccess}
            className="bg-gold hover:bg-gold-dark text-white rounded-full px-3 py-1.5 shrink-0 transition-colors"
          >
            {isSubmitting ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isSuccess ? (
              <Check className="w-4 h-4" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    );
  }

  // Full width variant (full-width background)
  if (variant === 'full-width') {
    return (
      <section
        ref={sectionRef}
        className={cn('py-16 md:py-24 bg-gradient-to-r from-brown-dark via-brown to-brown-dark text-white', className)}
      >
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="flex justify-center mb-4">
              <span className="text-4xl">🕉️</span>
            </div>
            <h2 className="font-cinzel text-3xl md:text-4xl font-bold mb-3">
              {title}
            </h2>
            {subtitle && (
              <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto mb-8">
                {subtitle}
              </p>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                ref={inputRef}
                type="email"
                placeholder={placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting || isSuccess}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-full px-5 py-3 focus:border-gold focus:bg-white/20 transition-all"
              />
              <Button
                type="submit"
                disabled={isSubmitting || isSuccess}
                className="bg-gold hover:bg-gold-dark text-white rounded-full px-8 py-3 font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Subscribing...
                  </>
                ) : isSuccess ? (
                  <>
                    <Check className="w-5 h-5" />
                    Subscribed!
                  </>
                ) : (
                  <>
                    {buttonText}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
            <p className="text-white/30 text-xs mt-4">
              No spam, unsubscribe anytime. We respect your privacy.
            </p>
          </motion.div>
        </Container>
      </section>
    );
  }

  // Default variant (standard newsletter section)
  return (
    <section
      ref={sectionRef}
      className={cn('py-12 md:py-16', className)}
    >
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative bg-gradient-to-br from-gold/10 via-ivory to-gold/5 dark:from-gold/5 dark:via-brown-dark dark:to-gold/5 rounded-3xl p-8 md:p-12 overflow-hidden border border-gold/10"
        >
          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-maroon/5 rounded-full blur-3xl" />

          {/* Content */}
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center">
                <Mail className="w-8 h-8 text-gold-dark" />
              </div>
            </div>

            <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-900">
              {title}
            </h2>
            {subtitle && (
              <p className="text-brown-light dark:text-ivory/60 text-sm md:text-base max-w-2xl mx-auto mt-2 mb-6">
                {subtitle}
              </p>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <div className="relative flex-1">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                  isFocused ? 'text-gold-dark' : 'text-brown-light/50'
                }`} />
                <Input
                  ref={inputRef}
                  type="email"
                  placeholder={placeholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  disabled={isSubmitting || isSuccess}
                  className={cn(
                    'pl-11 pr-4 py-3 bg-white dark:bg-brown/50 border-gold/10 rounded-full text-sm transition-all focus:border-gold focus:ring-2 focus:ring-gold/20',
                    isSuccess && 'border-green-400 bg-green-50 dark:bg-green-900/20'
                  )}
                />
                {isSuccess && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Check className="w-5 h-5 text-green-500" />
                  </div>
                )}
              </div>
              <Button
                type="submit"
                disabled={isSubmitting || isSuccess}
                className="btn-gold rounded-full px-8 py-3 font-medium whitespace-nowrap flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Subscribing...
                  </>
                ) : isSuccess ? (
                  <>
                    <Check className="w-5 h-5" />
                    Subscribed!
                  </>
                ) : (
                  <>
                    {buttonText}
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Trust message */}
            <p className="text-xs text-brown-light/50 dark:text-ivory/30 mt-4 flex items-center justify-center gap-2">
              <span className="inline-block w-1 h-1 rounded-full bg-green-400" />
              No spam, unsubscribe anytime
            </p>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

// ============================================================
// Default export for easier imports
// ============================================================
export default Newsletter;