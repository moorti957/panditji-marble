// frontend/src/components/sections/VideoSection.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, A11y } from 'swiper/modules';
import { Play, ChevronLeft, ChevronRight, Calendar, ArrowRight } from 'lucide-react';
import { FaYoutube } from 'react-icons/fa';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import Container from '../../components/ui/Container';
import { Skeleton } from '../ui/Skeleton';
import { cn } from '../../lib/utils';

// ============================================================
// Types
// ============================================================
export interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  channelName?: string;
  publishedAt?: string;
  duration?: string;
  views?: number;
}

interface VideoSectionProps {
  videos: VideoItem[];
  title?: string;
  subtitle?: string;
  displayMode?: 'grid' | 'slider';
  columns?: 2 | 3 | 4;
  slidesPerView?: number;
  className?: string;
  loading?: boolean;
  autoplayDelay?: number;
  showChannel?: boolean;
  showDate?: boolean;
}

// ============================================================
// VideoSection Component
// ============================================================
export default function VideoSection({
  videos,
  title = 'Watch Our Divine Creations',
  subtitle = 'Explore our YouTube channel for behind-the-scenes, rituals, and spiritual insights.',
  displayMode = 'grid',
  columns = 3,
  slidesPerView = 3,
  className,
  loading = false,
  autoplayDelay = 4000,
  showChannel = true,
  showDate = true,
}: VideoSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Column classes for grid mode
  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  // Swiper breakpoints
  const breakpoints = {
    320: { slidesPerView: 1.2, spaceBetween: 12 },
    480: { slidesPerView: 1.5, spaceBetween: 14 },
    640: { slidesPerView: 2, spaceBetween: 16 },
    768: { slidesPerView: 2.2, spaceBetween: 18 },
    1024: { slidesPerView: slidesPerView > 3 ? 3 : slidesPerView, spaceBetween: 20 },
    1280: { slidesPerView: slidesPerView > 3 ? 3 : slidesPerView, spaceBetween: 24 },
  };

  // Format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Format view count
  const formatViews = (views: number) => {
    if (!views) return '';
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M views';
    }
    if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K views';
    }
    return views + ' views';
  };

  // Video card component
  const VideoCard = ({ video, index }: { video: VideoItem; index?: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: (index || 0) * 0.05 }}
      className="group bg-white dark:bg-brown-dark rounded-2xl overflow-hidden shadow-sm border border-gold/5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <Link href={video.videoUrl} target="_blank" rel="noopener noreferrer">
        <div className="relative aspect-video bg-sand dark:bg-brown overflow-hidden">
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-16 h-16 rounded-full bg-gold text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
              <Play className="w-6 h-6 ml-1" />
            </div>
          </div>
          {/* Duration badge */}
          {video.duration && (
            <span className="absolute bottom-3 right-3 bg-black/70 text-white text-xs font-medium px-2 py-0.5 rounded">
              {video.duration}
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-cinzel text-base font-semibold text-brown dark:text-ivory line-clamp-2 group-hover:text-gold-dark dark:group-hover:text-gold transition-colors">
            {video.title}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-brown-light dark:text-ivory/50">
            {showChannel && video.channelName && (
              <span className="flex items-center gap-1">
                <FaYoutube className="w-3 h-3 text-gold" />
                {video.channelName}
              </span>
            )}
            {showDate && video.publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(video.publishedAt)}
              </span>
            )}
            {video.views && (
              <span>{formatViews(video.views)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );

  // Loading skeleton
  if (loading) {
    return (
      <section className={cn('py-12 md:py-16 bg-ivory dark:bg-brown', className)}>
        <Container>
          <div className="text-center mb-8">
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-brown-dark rounded-2xl overflow-hidden shadow-sm border border-gold/5">
                <Skeleton className="aspect-video w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    );
  }

  // Empty state
  if (!videos || videos.length === 0) {
    return (
      <section className={cn('py-12 md:py-16 bg-ivory dark:bg-brown', className)}>
        <Container>
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto bg-gold/10 rounded-full flex items-center justify-center mb-4">
              <FaYoutube className="w-10 h-10 text-gold" />
            </div>
            <h3 className="font-cinzel text-xl font-bold text-brown dark:text-ivory">
              {title}
            </h3>
            <p className="text-brown-light dark:text-ivory/60 text-sm mt-2">
              Subscribe to our YouTube channel for divine content.
            </p>
            <a
              href="https://www.youtube.com/@panditjimurtiart/featured"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold inline-block mt-4 text-sm"
            >
              <FaYoutube className="w-4 h-4 mr-2" />
              Subscribe Now
            </a>
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
            <a
              href="https://youtube.com/@panditjimurti"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-gold-dark dark:text-gold hover:text-gold transition-colors group"
            >
              <span className="text-xl">🎥</span>
              Visit Channel
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>

          {/* Grid */}
          <div className={cn('grid gap-4 md:gap-6', columnClasses[columns])}>
            {videos.slice(0, 12).map((video, index) => (
              <VideoCard key={video.id} video={video} index={index} />
            ))}
          </div>
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
          <a
            href="https://youtube.com/@panditjimurti"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-gold-dark dark:text-gold hover:text-gold transition-colors group"
          >
            <span className="text-xl">🎥</span>
            Visit Channel
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>

        {/* Swiper Slider */}
        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination, Autoplay, A11y]}
            spaceBetween={20}
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
            loop={videos.length > (slidesPerView || 3)}
            grabCursor
            className="!overflow-visible"
          >
            {videos.map((video, index) => (
              <SwiperSlide key={video.id}>
                <VideoCard video={video} index={index} />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Buttons */}
          {isMounted && videos.length > (slidesPerView || 3) && (
            <>
              <button
                className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-1/2 md:-translate-x-4 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white dark:bg-brown-dark shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-brown dark:text-ivory hover:text-gold-dark dark:hover:text-gold border border-gold/10"
                aria-label="Previous videos"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 z-10 translate-x-1/2 md:translate-x-4 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white dark:bg-brown-dark shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-brown dark:text-ivory hover:text-gold-dark dark:hover:text-gold border border-gold/10"
                aria-label="Next videos"
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