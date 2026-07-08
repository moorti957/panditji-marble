// frontend/src/components/sections/InstagramFeed.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, A11y } from 'swiper/modules';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { FaInstagram as Instagram } from 'react-icons/fa';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { Container } from '@/components/ui/Container';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

// ============================================================
// Types
// ============================================================
export interface InstagramPost {
  id: string;
  image: string;
  thumbnail?: string;
  caption?: string;
  likes?: number;
  comments?: number;
  url: string;
  timestamp?: string;
  isVideo?: boolean;
}

interface InstagramFeedProps {
  posts: InstagramPost[];
  title?: string;
  subtitle?: string;
  username?: string;
  displayMode?: 'grid' | 'slider';
  columns?: 3 | 4 | 5 | 6;
  slidesPerView?: number;
  className?: string;
  loading?: boolean;
  autoplayDelay?: number;
  showStats?: boolean;
  showCaption?: boolean;
}

// ============================================================
// InstagramFeed Component
// ============================================================
export function InstagramFeed({
  posts,
  title = 'Follow Us on Instagram',
  subtitle = 'Explore our divine creations and behind-the-scenes craftsmanship.',
  username = '@panditjimurti',
  displayMode = 'grid',
  columns = 4,
  slidesPerView = 4,
  className,
  loading = false,
  autoplayDelay = 4000,
  showStats = true,
  showCaption = false,
}: InstagramFeedProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Column classes for grid mode
  const columnClasses = {
    3: 'grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-6',
  };

  // Swiper breakpoints
  const breakpoints = {
    320: { slidesPerView: 2, spaceBetween: 8 },
    480: { slidesPerView: 2.2, spaceBetween: 10 },
    640: { slidesPerView: 3, spaceBetween: 12 },
    768: { slidesPerView: 3.5, spaceBetween: 16 },
    1024: { slidesPerView: slidesPerView > 4 ? 4 : slidesPerView, spaceBetween: 16 },
    1280: { slidesPerView: slidesPerView > 4 ? 4 : slidesPerView, spaceBetween: 20 },
  };

  // Format likes and comments
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Loading skeleton
  if (loading) {
    return (
      <section className={cn('py-12 md:py-16 bg-ivory dark:bg-brown', className)}>
        <Container>
          <div className="text-center mb-8">
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        </Container>
      </section>
    );
  }

  // Empty state
  if (!posts || posts.length === 0) {
    return (
      <section className={cn('py-12 md:py-16 bg-ivory dark:bg-brown', className)}>
        <Container>
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto bg-gold/10 rounded-full flex items-center justify-center mb-4">
              <Instagram className="w-10 h-10 text-gold" />
            </div>
            <h3 className="font-cinzel text-xl font-bold text-brown dark:text-ivory">
              {title}
            </h3>
            <p className="text-brown-light dark:text-ivory/60 text-sm mt-2">
              Follow us on Instagram for daily divine inspiration.
            </p>
            <Link
              href="https://www.instagram.com/panditjimarblemurtiart/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold inline-block mt-4 text-sm"
            >
              <Instagram className="w-4 h-4 mr-2" />
              Follow Us
            </Link>
          </div>
        </Container>
      </section>
    );
  }

  // Grid mode
  if (displayMode === 'grid') {
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
                <p className="text-brown-light dark:text-ivory/60 text-sm mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            <Link
              href="https://instagram.com/panditjimurti"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-gold-dark dark:text-gold hover:text-gold transition-colors group"
            >
              <span className="text-xl">📸</span>
              {username}
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>

          {/* Grid */}
          <div className={cn('grid gap-2 md:gap-3', columnClasses[columns])}>
            {posts.slice(0, 12).map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                className="group relative aspect-square rounded-xl overflow-hidden bg-sand dark:bg-brown cursor-pointer"
              >
                <Link href={post.url} target="_blank" rel="noopener noreferrer">
                  <Image
                    src={post.image}
                    alt={post.caption || 'Instagram post'}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                  />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brown/80 via-brown/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 p-4">
                    <div className="flex items-center gap-4 text-white">
                      {showStats && post.likes !== undefined && (
                        <span className="flex items-center gap-1.5 text-sm font-medium">
                          <Heart className="w-4 h-4 fill-white" />
                          {formatNumber(post.likes)}
                        </span>
                      )}
                      {showStats && post.comments !== undefined && (
                        <span className="flex items-center gap-1.5 text-sm font-medium">
                          <MessageCircle className="w-4 h-4" />
                          {formatNumber(post.comments)}
                        </span>
                      )}
                    </div>
                    {showCaption && post.caption && (
                      <p className="text-white/80 text-xs text-center line-clamp-2 max-w-xs">
                        {post.caption}
                      </p>
                    )}
                    {post.isVideo && (
                      <span className="absolute top-3 right-3 bg-black/50 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                        ▶ Video
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Footer CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mt-8"
          >
            <Link
              href="https://instagram.com/panditjimurti"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-lg transition-shadow"
            >
              <Instagram className="w-4 h-4" />
              Follow @panditjimurti
              <Sparkles className="w-4 h-4" />
            </Link>
          </motion.div>
        </Container>
      </section>
    );
  }

  // Slider mode
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
              <p className="text-brown-light dark:text-ivory/60 text-sm mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <Link
            href="https://instagram.com/panditjimurti"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-gold-dark dark:text-gold hover:text-gold transition-colors group"
          >
            <span className="text-xl">📸</span>
            {username}
            <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>

        {/* Swiper Slider */}
        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination, Autoplay, A11y]}
            spaceBetween={16}
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
            loop={posts.length > (slidesPerView || 4)}
            grabCursor
            className="!overflow-visible"
          >
            {posts.map((post) => (
              <SwiperSlide key={post.id}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.4 }}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-sand dark:bg-brown cursor-pointer"
                >
                  <Link href={post.url} target="_blank" rel="noopener noreferrer">
                    <Image
                      src={post.image}
                      alt={post.caption || 'Instagram post'}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                    />

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-brown/80 via-brown/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 p-4">
                      <div className="flex items-center gap-4 text-white">
                        {showStats && post.likes !== undefined && (
                          <span className="flex items-center gap-1.5 text-sm font-medium">
                            <Heart className="w-4 h-4 fill-white" />
                            {formatNumber(post.likes)}
                          </span>
                        )}
                        {showStats && post.comments !== undefined && (
                          <span className="flex items-center gap-1.5 text-sm font-medium">
                            <MessageCircle className="w-4 h-4" />
                            {formatNumber(post.comments)}
                          </span>
                        )}
                      </div>
                      {showCaption && post.caption && (
                        <p className="text-white/80 text-xs text-center line-clamp-2 max-w-xs">
                          {post.caption}
                        </p>
                      )}
                      {post.isVideo && (
                        <span className="absolute top-3 right-3 bg-black/50 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                          ▶ Video
                        </span>
                      )}
                    </div>
                  </Link>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Buttons */}
          {isMounted && posts.length > (slidesPerView || 4) && (
            <>
              <button
                className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-1/2 md:-translate-x-4 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white dark:bg-brown-dark shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-brown dark:text-ivory hover:text-gold-dark dark:hover:text-gold border border-gold/10"
                aria-label="Previous posts"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 z-10 translate-x-1/2 md:translate-x-4 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white dark:bg-brown-dark shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-brown dark:text-ivory hover:text-gold-dark dark:hover:text-gold border border-gold/10"
                aria-label="Next posts"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mt-8"
        >
          <Link
            href="https://instagram.com/panditjimurti"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-lg transition-shadow"
          >
            <Instagram className="w-4 h-4" />
            Follow @panditjimurti
            <Sparkles className="w-4 h-4" />
          </Link>
        </motion.div>
      </Container>

      {/* Custom styles for Swiper */}
      <style>{`
        .swiper-pagination {
          position: relative;
          margin-top: 20px;
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
interface CompactInstagramFeedProps {
  posts: InstagramPost[];
  className?: string;
  maxItems?: number;
}

export function CompactInstagramFeed({
  posts,
  className,
  maxItems = 4,
}: CompactInstagramFeedProps) {
  const displayPosts = posts.slice(0, maxItems);

  if (!displayPosts || displayPosts.length === 0) {
    return (
      <div className={cn('bg-white dark:bg-brown-dark rounded-2xl p-4 shadow-sm border border-gold/5', className)}>
        <div className="flex items-center gap-2 mb-3">
          <Instagram className="w-5 h-5 text-gold" />
          <h3 className="font-cinzel text-lg font-semibold text-brown dark:text-ivory">Instagram</h3>
        </div>
        <p className="text-xs text-brown-light dark:text-ivory/50">Follow us for daily inspiration.</p>
        <Link
          href="https://instagram.com/panditjimurti"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-xs text-gold-dark hover:text-gold"
        >
          @panditjimurti
        </Link>
      </div>
    );
  }

  return (
    <div className={cn('bg-white dark:bg-brown-dark rounded-2xl p-4 shadow-sm border border-gold/5', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Instagram className="w-5 h-5 text-gold" />
          <h3 className="font-cinzel text-lg font-semibold text-brown dark:text-ivory">Instagram</h3>
        </div>
        <Link
          href="https://instagram.com/panditjimurti"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gold-dark hover:text-gold transition-colors"
        >
          Follow
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {displayPosts.map((post) => (
          <Link
            key={post.id}
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="relative aspect-square rounded-lg overflow-hidden bg-sand dark:bg-brown group"
          >
            <Image
              src={post.image}
              alt="Instagram post"
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brown/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Default export
// ============================================================
export default InstagramFeed;