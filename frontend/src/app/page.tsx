// frontend/src/app/page.tsx

'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

// Sections
import Hero from '../components/hero/Hero';
import FeaturedCategories from '../components/sections/FeaturedCategories';
import FeaturedProducts from '../components/sections/FeaturedProducts';
import Testimonials from '../components/sections/Testimonials';
import Newsletter from '../components/sections/Newsletter';
import FAQAccordion from '../components/sections/FAQAccordion';
import StatsSection from '../components/sections/StatsSection';
import WorkshopSection from '../components/sections/WorkshopSection';
import InstagramFeed from '../components/sections/InstagramFeed';
import VideoSection from '../components/sections/VideoSection';

// Animation wrapper
import { ScrollReveal } from '../components/animations/ScrollReveal';

// Custom hook for homepage data
import { useHomeData } from '../features/home/hooks/useHomeData';
import type {
  FeaturedProduct as HomeFeaturedProduct,
  HomeStats,
  InstagramPost as HomeInstagramPost,
  YouTubeVideo as HomeYouTubeVideo,
} from '../features/home/types/home.types';

// Loading skeleton
import HomePageSkeleton from '../components/loaders/HomePageSkeleton';

// Types expected by section components (lighter home-page data shapes
// don't carry every field of the full domain types, so we adapt them
// here rather than changing the already-fixed component prop types)
import type { Product } from '../features/products/types/product.types';
import type { StatItem } from '../components/sections/StatsSection';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HomePage() {
  const { data, isLoading, error } = useHomeData();

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    // Connect GSAP ScrollTrigger to Lenis
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time: number) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  // Loading state
  if (isLoading) {
    return <HomePageSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-maroon text-xl">Failed to load homepage</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 btn-gold"
        >
          Retry
        </button>
      </div>
    );
  }

  // Destructure data from API
  const {
    categories = [],
    featuredProducts = [],
    trendingProducts = [],
    testimonials = [],
    faqs = [],
    stats,
    instagramPosts = [],
    youtubeVideos = [],
  } = data || {};

  // Adapt lightweight home-page product/stat shapes to the richer types
  // expected by the shared section components, without altering any
  // visual output (all fields read by those components are present here).
  const toDisplayProduct = (p: HomeFeaturedProduct): Product => ({
    ...p,
    description: '',
    category: '',
    inStock: true,
    createdAt: '',
    updatedAt: '',
  });
  const displayFeaturedProducts: Product[] = featuredProducts.map(toDisplayProduct);
  const displayTrendingProducts: Product[] = trendingProducts.map(toDisplayProduct);
  const displayStats: StatItem[] = stats
    ? [
        { id: 'customers', icon: '', value: stats.totalCustomers ?? 0, label: 'Happy Devotees' },
        { id: 'products', icon: '', value: stats.totalProducts ?? 0, label: 'Murtis Created' },
        { id: 'orders', icon: '', value: stats.totalOrders ?? 0, label: 'Orders Delivered' },
        { id: 'years', icon: '', value: stats.yearsOfExperience ?? 0, label: 'Years of Craftsmanship' },
      ]
    : [];
  const displayInstagramPosts = instagramPosts.map((post) => ({
    id: post.id,
    image: post.imageUrl,
    caption: post.caption,
    likes: post.likes,
    url: post.link || '#',
  }));
  const displayYoutubeVideos = youtubeVideos.map((video) => ({
    id: video.id,
    title: video.title,
    thumbnail: video.thumbnailUrl || '',
    videoUrl: video.url || '',
  }));

  return (
    <>
      {/* 1. Hero Section – no scroll reveal (full viewport) */}
      <Hero />

      {/* 2. Featured Categories */}
      
        <FeaturedCategories categories={categories} />
      

      {/* 3. Featured Products */}
      <ScrollReveal>
        <FeaturedProducts
          title="Popular Murtis"
          subtitle="Timeless sculptures that bring peace, prosperity, and devotion."
          products={displayFeaturedProducts}
        />
      </ScrollReveal>

      {/* 4. Stats Section */}
      <ScrollReveal>
        <StatsSection stats={displayStats} />
      </ScrollReveal>

      {/* 5. Workshop / Behind the Art */}
      <ScrollReveal>
        <WorkshopSection />
      </ScrollReveal>

      {/* 6. Trending Products (slider) */}
      <ScrollReveal>
        <FeaturedProducts
          title="Trending Now"
          subtitle="Most loved by our devotees this season."
          products={displayTrendingProducts}
          isSlider={true}
        />
      </ScrollReveal>

      {/* 7. Testimonials */}
      <ScrollReveal>
        <Testimonials testimonials={testimonials} />
      </ScrollReveal>

      {/* 8. Instagram Feed */}
      <ScrollReveal>
        <InstagramFeed posts={displayInstagramPosts} />
      </ScrollReveal>

      {/* 9. YouTube / Video Section */}
      <ScrollReveal>
        <VideoSection videos={displayYoutubeVideos} />
      </ScrollReveal>

      {/* 10. FAQ Accordion */}
      <ScrollReveal>
        <FAQAccordion faqs={faqs} />
      </ScrollReveal>

      {/* 11. Newsletter */}
      <ScrollReveal>
        <Newsletter />
      </ScrollReveal>
    </>
  );
}