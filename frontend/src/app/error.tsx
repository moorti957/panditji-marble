// frontend/src/app/error.tsx

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await reset();
    } catch (e) {
      console.error('Reset failed:', e);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .shimmer {
          background: linear-gradient(90deg, #D4AF37 0%, #FFFCF7 50%, #D4AF37 100%);
          background-size: 200% 100%;
          animation: shimmer 2s ease-in-out infinite;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      <div className="min-h-screen flex flex-col items-center justify-center bg-ivory px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-md w-full text-center"
        >
          {/* Icon / Symbol */}
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full bg-gold/10 animate-float" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl">🕉️</span>
            </div>
          </div>

          {/* Error code */}
          <h1 className="font-cinzel text-2xl md:text-3xl font-bold text-brown">
            Something Went Wrong
          </h1>

          {/* Decorative line */}
          <div className="w-16 h-[2px] bg-gold/30 mx-auto my-4 rounded-full shimmer" />

          {/* Error message */}
          <p className="text-brown-light text-base leading-relaxed mt-2">
            We&apos;re unable to load this page at the moment. Our team has been notified.
          </p>

          {/* Optional: show error digest in development */}
          {process.env.NODE_ENV === 'development' && error.digest && (
            <p className="mt-4 text-xs text-brown-light/50 font-mono">
              Error ID: {error.digest}
            </p>
          )}

          {/* Action buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className={`btn-gold px-8 py-3 text-sm font-medium transition-all ${
                isRetrying ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {isRetrying ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Retrying...
                </>
              ) : (
                'Try Again'
              )}
            </button>

            <Link href="/" className="btn-maroon px-8 py-3 text-sm font-medium">
              Go Home
            </Link>
          </div>

          {/* Support message */}
          <p className="mt-10 text-xs text-brown-light/50">
            Need help? <a href="/contact" className="text-gold-dark hover:underline">Contact us</a>
          </p>
        </motion.div>

        {/* Decorative background elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-maroon/5 rounded-full blur-3xl" />
        </div>
      </div>
    </>
  );
}