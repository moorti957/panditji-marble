// frontend/src/components/sections/Testimonials.tsx

'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, A11y } from 'swiper/modules';
import { ChevronLeft, ChevronRight, Star, StarHalf, Quote } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { Container } from '@/components/ui/Container';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

// ============================================================
// Shared star rendering helper
// ============================================================
function renderStars(rating: number) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`full-${i}`} className="w-4 h-4 fill-gold text-gold" />
      ))}
      {half && <StarHalf className="w-4 h-4 fill-gold text-gold" />}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300 dark:text-gray-600" />
      ))}
    </div>
  );
}

// ============================================================
// Types
// ============================================================
export interface Testimonial {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  comment: string;
  date?: string;
  location?: string;
  verified?: boolean;
}

interface TestimonialsProps {
  testimonials: Testimonial[];
  title?: string;
  subtitle?: string;
  displayMode?: 'slider' | 'grid';
  columns?: 2 | 3;
  slidesPerView?: number;
  className?: string;
  loading?: boolean;
  autoplayDelay?: number;
}

// ============================================================
// Testimonials Component
// ============================================================
export function Testimonials({
  testimonials,
  title = 'Devotee Reviews',
  subtitle = 'Hear from those who have brought divine energy into their homes.',
  displayMode = 'slider',
  columns = 3,
  slidesPerView = 3,
  className,
  loading = false,
  autoplayDelay = 5000,
}: TestimonialsProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Swiper breakpoints
  const breakpoints = {
    320: { slidesPerView: 1, spaceBetween: 16 },
    640: { slidesPerView: 1.2, spaceBetween: 20 },
    768: { slidesPerView: 2, spaceBetween: 24 },
    1024: { slidesPerView: slidesPerView > 3 ? 3 : slidesPerView, spaceBetween: 24 },
    1280: { slidesPerView: slidesPerView > 3 ? 3 : slidesPerView, spaceBetween: 32 },
  };

  // Loading skeleton
  if (loading) {
    return (
      <section className={cn('py-12 md:py-16 bg-sand/30 dark:bg-brown/20', className)}>
        <Container>
          <div className="text-center mb-10">
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-72 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-brown-dark rounded-2xl p-6 shadow-sm border border-gold/5">
                <Skeleton className="h-5 w-24 mb-3" />
                <Skeleton className="h-16 w-full mb-4" />
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16 mt-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    );
  }

  // Empty state
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  // Grid mode
  if (displayMode === 'grid') {
    const colClasses = {
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    };
    return (
      <section
        ref={sectionRef}
        className={cn('py-12 md:py-16 bg-sand/30 dark:bg-brown/20', className)}
      >
        <Container>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <div className="ornate-divider justify-center">
              <span className="diamond">✦</span>
            </div>
            <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-900">
              {title}
            </h2>
            {subtitle && (
              <p className="text-brown-light dark:text-ivory/60 text-sm mt-2">
                {subtitle}
              </p>
            )}
          </motion.div>

          {/* Grid */}
          <div className={cn('grid gap-6', colClasses[columns])}>
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-white dark:bg-brown-dark rounded-2xl p-6 shadow-sm border border-gold/5 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gold/10 flex-shrink-0">
                    {testimonial.avatar ? (
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl font-cinzel text-gold-dark">
                        {testimonial.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-cinzel font-semibold text-brown dark:text-ivory">
                          {testimonial.name}
                        </h4>
                        {testimonial.location && (
                          <p className="text-xs text-brown-light dark:text-ivory/50">
                            {testimonial.location}
                          </p>
                        )}
                      </div>
                      {testimonial.verified && (
                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  {renderStars(testimonial.rating)}
                </div>
                <blockquote className="mt-2 text-sm text-brown-light dark:text-ivory/70 leading-relaxed">
                  &ldquo;{testimonial.comment}&rdquo;
                </blockquote>
                {testimonial.date && (
                  <p className="mt-2 text-xs text-brown-light/50 dark:text-ivory/30">
                    {new Date(testimonial.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </Container>
      </section>
    );
  }

  // Slider mode (default)
  return (
    <section
      ref={sectionRef}
      className={cn('py-12 md:py-16 bg-sand/30 dark:bg-brown/20 overflow-hidden', className)}
    >
      <Container>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-10"
        >
          <div className="ornate-divider justify-center">
            <span className="diamond">✦</span>
          </div>
          <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-900">
            {title}
          </h2>
          {subtitle && (
            <p className="text-brown-light dark:text-ivory/60 text-sm mt-2">
              {subtitle}
            </p>
          )}
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
              delay: autoplayDelay,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop={testimonials.length > (slidesPerView || 3)}
            grabCursor
            className="!overflow-visible"
          >
            {testimonials.map((testimonial) => (
              <SwiperSlide key={testimonial.id}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.4 }}
                  className="h-full"
                >
                  <div className="bg-white dark:bg-brown-dark rounded-2xl p-6 shadow-sm border border-gold/5 hover:shadow-lg transition-shadow h-full flex flex-col">
                    {/* Quote icon */}
                    <Quote className="w-8 h-8 text-gold/20 mb-2" />

                    {/* Rating */}
                    <div className="mb-3">{renderStars(testimonial.rating)}</div>

                    {/* Comment */}
                    <blockquote className="flex-1 text-sm text-brown-light dark:text-ivory/70 leading-relaxed">
                      &ldquo;{testimonial.comment}&rdquo;
                    </blockquote>

                    {/* Author */}
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gold/10 dark:border-gold/5">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gold/10 flex-shrink-0">
                        {testimonial.avatar ? (
                          <Image
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg font-cinzel text-gold-dark">
                            {testimonial.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-cinzel font-semibold text-brown dark:text-ivory text-sm">
                          {testimonial.name}
                        </h4>
                        <div className="flex items-center gap-2">
                          {testimonial.location && (
                            <p className="text-xs text-brown-light dark:text-ivory/50">
                              {testimonial.location}
                            </p>
                          )}
                          {testimonial.verified && (
                            <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                        {testimonial.date && (
                          <p className="text-[10px] text-brown-light/50 dark:text-ivory/30 mt-0.5">
                            {new Date(testimonial.date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Buttons */}
          {isMounted && testimonials.length > (slidesPerView || 3) && (
            <>
              <button
                className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-1/2 md:-translate-x-4 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white dark:bg-brown-dark shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-brown dark:text-ivory hover:text-gold-dark dark:hover:text-gold border border-gold/10"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 z-10 translate-x-1/2 md:translate-x-4 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white dark:bg-brown-dark shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-brown dark:text-ivory hover:text-gold-dark dark:hover:text-gold border border-gold/10"
                aria-label="Next testimonial"
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
// Compact version for sidebars
// ============================================================
interface CompactTestimonialsProps {
  testimonials: Testimonial[];
  title?: string;
  className?: string;
  maxItems?: number;
}

export function CompactTestimonials({
  testimonials,
  title = 'What Devotees Say',
  className,
  maxItems = 3,
}: CompactTestimonialsProps) {
  const displayTestimonials = testimonials.slice(0, maxItems);

  return (
    <div className={cn('bg-white dark:bg-brown-dark rounded-2xl p-4 shadow-sm border border-gold/5', className)}>
      <h3 className="font-cinzel text-lg font-semibold text-brown dark:text-ivory mb-3">
        {title}
      </h3>
      <div className="space-y-4">
        {displayTestimonials.map((testimonial) => (
          <div key={testimonial.id} className="pb-4 border-b border-gold/10 dark:border-gold/5 last:border-0 last:pb-0">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gold/10 flex-shrink-0">
                {testimonial.avatar ? (
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-cinzel text-gold-dark">
                    {testimonial.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-brown dark:text-ivory">
                  {testimonial.name}
                </h4>
                <div className="flex items-center gap-1">
                  {renderStars(testimonial.rating)}
                </div>
              </div>
            </div>
            <p className="text-xs text-brown-light dark:text-ivory/60 mt-1 line-clamp-2">
              &ldquo;{testimonial.comment}&rdquo;
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Default export
// ============================================================
export default Testimonials;