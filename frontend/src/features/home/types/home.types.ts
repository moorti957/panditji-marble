// frontend/src/features/home/types/home.types.ts

// ============================================================
// Homepage Data Types
// ============================================================

/**
 * Homepage hero/promo banner
 */
export interface HomeBanner {
  id: string;
  title?: string;
  subtitle?: string;
  imageUrl: string;
  ctaText?: string;
  ctaLink?: string;
  displayOrder?: number;
}

/**
 * Featured category shown on the homepage
 */
export interface FeaturedCategory {
  id: string;
  name: string;
  slug: string;
  image?: string;
  productCount?: number;
}

/**
 * Featured product shown on the homepage
 */
export interface FeaturedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  images: string[];
  rating?: number;
  isNew?: boolean;
  isFeatured?: boolean;
}

/**
 * Customer testimonial
 */
export interface Testimonial {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  comment: string;
  location?: string;
}

/**
 * Frequently asked question
 */
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

/**
 * Homepage statistics (e.g. years of experience, customers served)
 */
export interface HomeStats {
  totalCustomers?: number;
  totalProducts?: number;
  totalOrders?: number;
  yearsOfExperience?: number;
}

/**
 * Instagram feed post
 */
export interface InstagramPost {
  id: string;
  imageUrl: string;
  caption?: string;
  link?: string;
  likes?: number;
}

/**
 * YouTube video shown in the video section
 */
export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnailUrl?: string;
  videoId?: string;
  url?: string;
}

/**
 * Aggregate homepage data payload
 */
export interface HomeData {
  banners?: HomeBanner[];
  featuredProducts?: FeaturedProduct[];
  /** Trending products (e.g. most viewed/purchased this season) */
  trendingProducts?: FeaturedProduct[];
  /** Latest / newest arrivals */
  latestProducts?: FeaturedProduct[];
  categories?: FeaturedCategory[];
  testimonials?: Testimonial[];
  faqs?: FAQ[];
  stats?: HomeStats;
  instagramPosts?: InstagramPost[];
  youtubeVideos?: YouTubeVideo[];
}
