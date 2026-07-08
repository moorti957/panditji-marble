// frontend/src/components/cards/BlogCard.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, type Variants } from 'framer-motion';
import { Calendar, User, Clock, ArrowRight, Tag, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

import { cn } from '@/lib/utils';

// ============================================================
// Types
// ============================================================
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  category: string;
  author: string;
  authorAvatar?: string;
  publishedAt: string;
  readTime: number;
  tags: string[];
  isFeatured?: boolean;
  isNew?: boolean;
}

interface BlogCardProps {
  post: BlogPost;
  variant?: 'default' | 'featured' | 'compact' | 'horizontal';
  className?: string;
  priority?: boolean;
  showExcerpt?: boolean;
  showTags?: boolean;
  showAuthor?: boolean;
}

// ============================================================
// BlogCard Component
// ============================================================
export function BlogCard({
  post,
  variant = 'default',
  className,
  priority = false,
  showExcerpt = true,
  showTags = true,
  showAuthor = true,
}: BlogCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const {
    title,
    slug,
    excerpt,
    coverImage,
    category,
    author,
    authorAvatar,
    publishedAt,
    readTime,
    tags,
    isFeatured,
    isNew,
  } = post;

  // Format date
  const formattedDate = format(new Date(publishedAt), 'MMM d, yyyy');

  // Card variants
  const cardVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: {
      y: -6,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  // Color mapping for categories
  const categoryColors: Record<string, string> = {
    'Spiritual': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'Craftsmanship': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'Festivals': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'Temple': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Murti': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'Culture': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    'Devotion': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    'default': 'bg-gold/10 text-gold-dark dark:bg-gold/20 dark:text-gold',
  };

  const categoryColor = categoryColors[category] || categoryColors.default;

  // Compact variant (small, used in sidebars)
  if (variant === 'compact') {
    return (
      <Link
        href={`/blogs/${slug}`}
        className={cn(
          'group flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 hover:bg-gold/5',
          className
        )}
      >
        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-sand dark:bg-brown flex-shrink-0">
          {coverImage && (
            <Image
              src={coverImage}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="48px"
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-brown dark:text-ivory/80 group-hover:text-gold-dark dark:group-hover:text-gold transition-colors line-clamp-1">
            {title}
          </h4>
          <p className="text-xs text-brown-light dark:text-ivory/40">
            {formattedDate} · {readTime} min read
          </p>
        </div>
      </Link>
    );
  }

  // Horizontal variant (image on left, content on right)
  if (variant === 'horizontal') {
    return (
      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        className={cn(
          'group bg-white dark:bg-brown-dark rounded-2xl overflow-hidden shadow-sm border border-gold/5 dark:border-gold/10 hover:shadow-xl transition-all duration-300',
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href={`/blogs/${slug}`} className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative sm:w-64 md:w-72 aspect-[16/9] sm:aspect-[4/3] bg-sand dark:bg-brown overflow-hidden shrink-0">
            <Image
              src={coverImage}
              alt={title}
              fill
              className={cn(
                'object-cover transition-transform duration-700 group-hover:scale-105',
                !imageLoaded && 'blur-sm scale-105'
              )}
              sizes="(max-width: 640px) 100vw, 288px"
              priority={priority}
              onLoad={() => setImageLoaded(true)}
            />
            {isNew && (
              <span className="absolute top-3 left-3 bg-gold text-white text-xs font-bold px-2.5 py-1 rounded-full">
                New
              </span>
            )}
            {isFeatured && (
              <span className="absolute top-3 right-3 bg-maroon text-white text-xs font-bold px-2.5 py-1 rounded-full">
                Featured
              </span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-4 md:p-6 flex flex-col justify-between">
            <div>
              {/* Category */}
              <span className={cn('inline-block text-xs font-medium px-2.5 py-1 rounded-full', categoryColor)}>
                {category}
              </span>

              {/* Title */}
              <h3 className="font-cinzel text-lg md:text-xl font-semibold text-brown dark:text-ivory group-hover:text-gold-dark dark:group-hover:text-gold transition-colors mt-2 line-clamp-2">
                {title}
              </h3>

              {/* Excerpt */}
              {showExcerpt && (
                <p className="text-sm text-brown-light dark:text-ivory/60 mt-2 line-clamp-2">
                  {excerpt}
                </p>
              )}

              {/* Tags */}
              {showTags && tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-sand/50 dark:bg-brown/50 text-brown-light dark:text-ivory/50 px-2 py-0.5 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                  {tags.length > 3 && (
                    <span className="text-xs text-brown-light/50 dark:text-ivory/30">
                      +{tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gold/10 dark:border-gold/5">
              <div className="flex items-center gap-4 text-xs text-brown-light dark:text-ivory/50">
                {showAuthor && (
                  <span className="flex items-center gap-1.5">
                    {authorAvatar ? (
                      <Image
                        src={authorAvatar}
                        alt={author}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                    ) : (
                      <User className="w-3.5 h-3.5" />
                    )}
                    {author}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {formattedDate}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {readTime} min
                </span>
              </div>
              <span className="text-gold-dark dark:text-gold opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Default variant (standard blog card)
  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      className={cn(
        'group bg-white dark:bg-brown-dark rounded-2xl overflow-hidden shadow-sm border border-gold/5 dark:border-gold/10 hover:shadow-xl transition-all duration-300',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/blogs/${slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-[16/9] bg-sand dark:bg-brown overflow-hidden">
          <Image
            src={coverImage}
            alt={title}
            fill
            className={cn(
              'object-cover transition-transform duration-700 group-hover:scale-105',
              !imageLoaded && 'blur-sm scale-105'
            )}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Category badge */}
          <span className={cn('absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full', categoryColor)}>
            {category}
          </span>

          {/* Featured/New badges */}
          {isNew && (
            <span className="absolute top-3 right-3 bg-gold text-white text-xs font-bold px-2.5 py-1 rounded-full">
              New
            </span>
          )}
          {isFeatured && !isNew && (
            <span className="absolute top-3 right-3 bg-maroon text-white text-xs font-bold px-2.5 py-1 rounded-full">
              Featured
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4 md:p-5">
          {/* Title */}
          <h3 className="font-cinzel text-lg font-semibold text-brown dark:text-ivory group-hover:text-gold-dark dark:group-hover:text-gold transition-colors line-clamp-2">
            {title}
          </h3>

          {/* Excerpt */}
          {showExcerpt && (
            <p className="text-sm text-brown-light dark:text-ivory/60 mt-2 line-clamp-3">
              {excerpt}
            </p>
          )}

          {/* Tags */}
          {showTags && tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-sand/50 dark:bg-brown/50 text-brown-light dark:text-ivory/50 px-2 py-0.5 rounded-full"
                >
                  #{tag}
                </span>
              ))}
              {tags.length > 2 && (
                <span className="text-xs text-brown-light/50 dark:text-ivory/30">
                  +{tags.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gold/10 dark:border-gold/5">
            <div className="flex items-center gap-3 text-xs text-brown-light dark:text-ivory/50">
              {showAuthor && (
                <span className="flex items-center gap-1.5">
                  {authorAvatar ? (
                    <Image
                      src={authorAvatar}
                      alt={author}
                      width={18}
                      height={18}
                      className="rounded-full"
                    />
                  ) : (
                    <User className="w-3 h-3" />
                  )}
                  {author}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3 h-3" />
                {readTime} min
              </span>
            </div>
            <span className="text-gold-dark dark:text-gold opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ============================================================
// BlogCardGrid – For rendering multiple blog cards
// ============================================================
interface BlogCardGridProps {
  posts: BlogPost[];
  variant?: 'default' | 'featured' | 'horizontal';
  columns?: 2 | 3 | 4;
  className?: string;
  showExcerpt?: boolean;
  showTags?: boolean;
  showAuthor?: boolean;
}

export function BlogCardGrid({
  posts,
  variant = 'default',
  columns = 3,
  className,
  showExcerpt = true,
  showTags = true,
  showAuthor = true,
}: BlogCardGridProps) {
  const columnClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  // Featured post (first one) - use featured variant
  if (variant === 'featured' && posts.length > 0) {
    const [featured, ...rest] = posts;
    return (
      <div className={cn('space-y-6', className)}>
        <BlogCard post={featured} variant="featured" />
        <div className={cn('grid gap-4 md:gap-6', columnClasses[columns])}>
          {rest.map((post) => (
            <BlogCard
              key={post.id}
              post={post}
              variant="default"
              showExcerpt={showExcerpt}
              showTags={showTags}
              showAuthor={showAuthor}
            />
          ))}
        </div>
      </div>
    );
  }

  // Horizontal variant - all cards in horizontal layout
  if (variant === 'horizontal') {
    return (
      <div className={cn('space-y-4', className)}>
        {posts.map((post) => (
          <BlogCard
            key={post.id}
            post={post}
            variant="horizontal"
            showExcerpt={showExcerpt}
            showTags={showTags}
            showAuthor={showAuthor}
          />
        ))}
      </div>
    );
  }

  // Default grid
  return (
    <div className={cn('grid gap-4 md:gap-6', columnClasses[columns], className)}>
      {posts.map((post) => (
        <BlogCard
          key={post.id}
          post={post}
          variant="default"
          showExcerpt={showExcerpt}
          showTags={showTags}
          showAuthor={showAuthor}
        />
      ))}
    </div>
  );
}

// ============================================================
// BlogCardSkeleton – Loading state
// ============================================================
export function BlogCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-brown-dark rounded-2xl overflow-hidden shadow-sm border border-gold/5 dark:border-gold/10 animate-pulse"
        >
          <div className="aspect-[16/9] bg-sand dark:bg-brown/50" />
          <div className="p-4 space-y-3">
            <div className="h-4 w-20 bg-sand dark:bg-brown/50 rounded-full" />
            <div className="h-6 w-3/4 bg-sand dark:bg-brown/50 rounded" />
            <div className="h-4 w-full bg-sand dark:bg-brown/50 rounded" />
            <div className="h-4 w-2/3 bg-sand dark:bg-brown/50 rounded" />
            <div className="flex items-center justify-between pt-3 border-t border-gold/10">
              <div className="flex items-center gap-3">
                <div className="h-4 w-16 bg-sand dark:bg-brown/50 rounded" />
                <div className="h-4 w-16 bg-sand dark:bg-brown/50 rounded" />
              </div>
              <div className="h-4 w-8 bg-sand dark:bg-brown/50 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Default export
// ============================================================
export default BlogCard;