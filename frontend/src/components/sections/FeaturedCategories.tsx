// frontend/src/components/sections/FeaturedCategories.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, A11y } from 'swiper/modules';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { Container } from '@/components/ui/Container';
import { CategoryCard } from '@/components/cards/CategoryCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

import type { Category } from '@/components/cards/CategoryCard';

// ============================================================
// Types
// ============================================================
interface FeaturedCategoriesProps {
  categories: Category[];
  title?: string;
  subtitle?: string;
  viewAllLink?: string;
  viewAllLabel?: string;
  displayMode?: 'grid' | 'slider' | 'featured';
  columns?: 2 | 3 | 4 | 5;
  slidesPerView?: number;
  className?: string;
  loading?: boolean;
}

// ============================================================
// FeaturedCategories Component
// ============================================================
export function FeaturedCategories({
  categories,
  title = 'Browse by Deity',
  subtitle = 'Choose from our collection of divine forms, each crafted with precision and love.',
  viewAllLink = '/categories',
  viewAllLabel = 'View All Categories',
  displayMode = 'grid',
  columns = 4,
  slidesPerView = 4,
  className,
  loading = false,
}: FeaturedCategoriesProps) {
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

  // Column classes for grid mode
  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
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
            <Skeleton className="h-10 w-32 rounded-full" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-2xl" />
            ))}
          </div>
        </Container>
      </section>
    );
  }

  // Empty state
  if (!categories || categories.length === 0) {
    return null;
  }

  // Featured mode - first category is large, rest in grid
  if (displayMode === 'featured') {
    const [featured, ...rest] = categories;
    return (
      <section
        className={cn('py-12 md:py-16 bg-ivory dark:bg-brown', className)}
      >
        <Container>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
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
          </div>

          {/* Featured grid: 1 large + rest in grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Featured category (large) */}
            <div className="lg:col-span-1">
              <CategoryCard category={featured} variant="featured" />
            </div>

            {/* Rest in grid */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                {rest.map((category) => (
                  <div key={category.id}>
                    <CategoryCard category={category} variant="default" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  // Slider mode
  if (displayMode === 'slider') {
    return (
      <section
        className={cn('py-12 md:py-16 bg-ivory dark:bg-brown overflow-hidden', className)}
      >
        <Container>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
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
          </div>

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
              loop={categories.length > (slidesPerView || 4)}
              grabCursor
              className="!overflow-visible"
            >
              {categories.map((category) => (
                <SwiperSlide key={category.id}>
                  <div className="h-full">
                    <CategoryCard category={category} variant="default" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Custom Navigation Buttons */}
            {isMounted && categories.length > (slidesPerView || 4) && (
              <>
                <button
                  className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-1/2 md:-translate-x-4 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white dark:bg-brown-dark shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-brown dark:text-ivory hover:text-gold-dark dark:hover:text-gold border border-gold/10"
                  aria-label="Previous categories"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 z-10 translate-x-1/2 md:translate-x-4 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white dark:bg-brown-dark shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-brown dark:text-ivory hover:text-gold-dark dark:hover:text-gold border border-gold/10"
                  aria-label="Next categories"
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

  // Default: Grid mode
  return (
    <section
      className={cn('py-12 md:py-16 bg-ivory dark:bg-brown', className)}
    >
      <Container>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
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
        </div>

        {/* Grid */}
        <div className={cn('grid gap-4 md:gap-6', columnClasses[columns])}>
          {categories.map((category) => (
            <div key={category.id}>
              <CategoryCard category={category} variant="default" />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ============================================================
// Compact version for sidebars or smaller sections
// ============================================================
interface CompactFeaturedCategoriesProps {
  categories: Category[];
  title?: string;
  className?: string;
  maxItems?: number;
}

export function CompactFeaturedCategories({
  categories,
  title = 'Categories',
  className,
  maxItems = 6,
}: CompactFeaturedCategoriesProps) {
  const displayCategories = categories.slice(0, maxItems);

  return (
    <div className={cn('bg-white dark:bg-brown-dark rounded-2xl p-4 shadow-sm border border-gold/5', className)}>
      <h3 className="font-cinzel text-lg font-semibold text-brown dark:text-ivory mb-3">
        {title}
      </h3>
      <div className="space-y-1">
        {displayCategories.map((category) => (
          <CategoryCard key={category.id} category={category} variant="compact" />
        ))}
        {categories.length > maxItems && (
          <Link
            href="/categories"
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gold-dark dark:text-gold hover:text-gold transition-colors"
          >
            View all ({categories.length})
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Default export
// ============================================================
export default FeaturedCategories;