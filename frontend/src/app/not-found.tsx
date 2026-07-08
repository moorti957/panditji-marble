// frontend/src/app/not-found.tsx

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect } from 'react';

export default function NotFound() {
  useEffect(() => {
    // Log 404 to analytics (optional)
    console.warn('404 - Page not found');
  }, []);

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .shimmer-line {
          background: linear-gradient(90deg, #D4AF37 0%, #FFFCF7 50%, #D4AF37 100%);
          background-size: 200% 100%;
          animation: shimmer 2s ease-in-out infinite;
        }
        .divine-glow {
          box-shadow: 0 0 60px rgba(212, 175, 55, 0.15);
        }
      `}</style>

      <div className="min-h-screen flex flex-col items-center justify-center bg-ivory px-4 py-12 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-maroon/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-gold/5 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-gold/5 rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative z-10 max-w-2xl w-full text-center"
        >
          {/* Divine icon with floating animation */}
          <div className="relative w-28 h-28 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-gold/10 animate-float divine-glow" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl">🪷</span>
            </div>
          </div>

          {/* 404 number */}
          <h1 className="font-cinzel text-8xl md:text-9xl font-bold text-gold-dark/20 tracking-wider select-none">
            404
          </h1>

          {/* Main title */}
          <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-brown mt-2">
            Page Not Found
          </h2>

          {/* Decorative shimmer line */}
          <div className="w-20 h-[2px] shimmer-line mx-auto my-4 rounded-full" />

          {/* Description */}
          <p className="text-brown-light text-base md:text-lg leading-relaxed max-w-sm mx-auto">
            The divine path you&apos;re looking for seems to have wandered off. 
            Let&apos;s guide you back to the sacred collection.
          </p>

          {/* Action buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="btn-gold px-8 py-3 text-sm font-medium inline-flex items-center gap-2">
              <span>🏛️</span> Visit Home
            </Link>
            <Link href="/products" className="btn-maroon px-8 py-3 text-sm font-medium inline-flex items-center gap-2">
              <span>🕉️</span> Browse Murtis
            </Link>
          </div>

          {/* Quick links */}
          <div className="mt-6 flex flex-wrap gap-6 justify-center text-sm text-brown-light/70">
            <Link href="/about" className="hover:text-gold-dark transition-colors">
              About Us
            </Link>
            <span className="text-brown-light/20">|</span>
            <Link href="/gallery" className="hover:text-gold-dark transition-colors">
              Gallery
            </Link>
            <span className="text-brown-light/20">|</span>
            <Link href="/contact" className="hover:text-gold-dark transition-colors">
              Contact
            </Link>
          </div>

          {/* Footer note */}
          <p className="mt-12 text-xs text-brown-light/30">
            © Pandit Ji Marble Murti Arts · Divine craftsmanship since 1991
          </p>
        </motion.div>
      </div>
    </>
  );
}