// frontend/src/components/sections/FeaturedProducts.tsx

'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, A11y } from 'swiper/modules';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { Container } from '@/components/ui/Container';
import { ProductCard } from '@/components/cards/ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

import type { Product } from '@/types';

// ============================================================
// Types
// ============================================================
interface FeaturedProductsProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  viewAllLink?: string;
  viewAllLabel?: string;
  isSlider?: boolean;
  slidesPerView?: number;
  className?: string;
  loading?: boolean;
}

// ============================================================
// FeaturedProducts Component
// ============================================================
export function FeaturedProducts({
  products,
  title = 'Featured Murtis',
  subtitle = 'Timeless sculptures that bring peace, prosperity, and devotion.',
  viewAllLink = '/products',
  viewAllLabel = 'View All',
  isSlider = true,
  slidesPerView = 4,
  className,
  loading = false,
}: FeaturedProductsProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Responsive breakpoints for Swiper
  const breakpoints = {
    320: { slidesPerView: 1.2, spaceBetween: 12 },
    480: { slidesPerView: 2, spaceBetween: 16 },
    768: { slidesPerView: 2.5, spaceBetween: 20 },
    1024: { slidesPerView: slidesPerView > 4 ? 4 : slidesPerView, spaceBetween: 24 },
    1280: { slidesPerView: slidesPerView > 4 ? 4 : slidesPerView, spaceBetween: 32 },
  };

  // Loading skeleton
  if (loading) {
    return (
      <section className={cn('py-12 md:py-16 bg-ivory dark:bg-brown', className)}>
        <Container>
          <div className="flex items-center justify-between mb-8">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-72" />
            </div>
            <Skeleton className="h-10 w-24 rounded-full" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
            ))}
          </div>
        </Container>
      </section>
    );
  }

  // Empty state
  if (!products || products.length === 0) {
    return null;
  }

  // Render as grid (not slider)
  if (!isSlider) {
    return (
      <section
        ref={sectionRef}
        className={cn('py-12 md:py-16 bg-ivory dark:bg-brown', className)}
      >
        <Container>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
          >
            <div>
              <div className="ornate-divider">
                <span className="diamond">✦</span>
              </div>
              <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-900">
                {title}
              </h2>
              {subtitle && (
                <p className="text-brown-light dark:text-ivory/60 text-sm mt-1 max-w-lg">
                  {subtitle}
                </p>
              )}
            </div>
            <Link
              href={viewAllLink}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gold-dark dark:text-gold hover:text-gold transition-colors group"
            >
              {viewAllLabel}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </Container>
      </section>
    );
  }

  // Render as slider
  return (
    <section
      ref={sectionRef}
      className={cn('py-12 md:py-16 bg-ivory dark:bg-brown overflow-hidden', className)}
    >
      <Container>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <div>
            <div className="ornate-divider">
              <span className="diamond">✦</span>
            </div>
            <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-900">
              {title}
            </h2>
            {subtitle && (
              <p className="text-brown-light dark:text-ivory/60 text-sm mt-1 max-w-lg">
                {subtitle}
              </p>
            )}
          </div>
          <Link
            href={viewAllLink}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gold-dark dark:text-gold hover:text-gold transition-colors group"
          >
            {viewAllLabel}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Swiper Slider */}
        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination, Autoplay, A11y]}
            spaceBetween={24}
            slidesPerView={slidesPerView}
            breakpoints={breakpoints}
            navigation={{
              nextEl: '.swiper-button-next-custom',
              prevEl: '.swiper-button-prev-custom',
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop={products.length > (slidesPerView || 4)}
            grabCursor
            className="!overflow-visible"
          >
            {products.map((product) => (
              <SwiperSlide key={product.id}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.4 }}
                  className="h-full"
                >
                  <ProductCard product={product} />
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Buttons */}
          {isMounted && products.length > (slidesPerView || 4) && (
            <>
              <button
                className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-1/2 md:-translate-x-4 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white dark:bg-brown-dark shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-brown dark:text-ivory hover:text-gold-dark dark:hover:text-gold border border-gold/10"
                aria-label="Previous products"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 z-10 translate-x-1/2 md:translate-x-4 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white dark:bg-brown-dark shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-brown dark:text-ivory hover:text-gold-dark dark:hover:text-gold border border-gold/10"
                aria-label="Next products"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </Container>

      {/* Custom styles for Swiper */}
      <style>{`
        .swiper-pagination {
          position: relative;
          margin-top: 24px;
        }
        .swiper-pagination-bullet {
          background: #D4AF37;
          opacity: 0.3;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          transition: all 0.3s;
        }
        .swiper-pagination-bullet-active {
          opacity: 1;
          width: 24px;
          border-radius: 4px;
          background: #D4AF37;
        }
        .swiper-button-prev-custom,
        .swiper-button-next-custom {
          display: none;
        }
        @media (min-width: 768px) {
          .swiper-button-prev-custom,
          .swiper-button-next-custom {
            display: flex;
          }
        }
        .swiper-button-prev-custom.swiper-button-disabled,
        .swiper-button-next-custom.swiper-button-disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
      `}</style>
    </section>
  );
}

// ============================================================
// Default export for easier imports
// ============================================================
export default FeaturedProducts;