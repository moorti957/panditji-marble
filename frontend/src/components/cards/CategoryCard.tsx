// frontend/src/components/cards/CategoryCard.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';

import { cn } from '@/lib/utils';

// ============================================================
// Types
// ============================================================
export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  icon?: string;
  description?: string;
  productCount?: number;
  isFeatured?: boolean;
}

interface CategoryCardProps {
  category: Category;
  variant?: 'default' | 'featured' | 'compact';
  className?: string;
  priority?: boolean;
}

// ============================================================
// CategoryCard Component
// ============================================================
export function CategoryCard({
  category,
  variant = 'default',
  className,
  priority = false,
}: CategoryCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const { name, slug, image, description, productCount, isFeatured } = category;

  // Card variants


  const fallbackImage = '/images/category-placeholder.svg';

  // Compact variant (smaller, used in sidebars or quick links)
  if (variant === 'compact') {
    return (
      <Link
        href={`/products?category=${slug}`}
        className={cn(
          'group flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 hover:bg-gold/5',
          className
        )}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 text-xs font-semibold text-gold-dark">
          {name.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm font-medium text-brown dark:text-ivory/80 group-hover:text-gold-dark dark:group-hover:text-gold transition-colors">
          {name}
        </span>
        {productCount !== undefined && (
          <span className="ml-auto text-xs text-brown-light dark:text-ivory/40">
            {productCount}
          </span>
        )}
      </Link>
    );
  }

  // Featured variant (larger, used for featured categories)
  if (variant === 'featured') {
    return (
      <motion.div
       
        initial={false}
  whileHover={{
    y: -8,
  }}
  transition={{
    duration: 0.3,
    ease: 'easeOut',
  }}
        className={cn(
          'group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300',
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href={`/products?category=${slug}`} className="block">
          <div className="relative aspect-[4/3] bg-sand dark:bg-brown overflow-hidden">
            {image ? (
              <Image
                src={image}
                alt={name}
                fill
                className={cn(
                  'object-cover transition-transform duration-700 group-hover:scale-105',
                  !imageLoaded && 'blur-sm scale-105'
                )}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                loading={priority ? 'eager' : 'lazy'}
                onLoad={() => setImageLoaded(true)}
              />
            ) : (
              <Image
                src={fallbackImage}
                alt={name}
                fill
                className="object-cover opacity-70"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-brown/80 via-brown/20 to-transparent" />

            {/* Featured badge */}
            {isFeatured && (
              <span className="absolute top-4 right-4 flex items-center gap-1.5 bg-gold text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                <Sparkles className="w-3 h-3" />
                Featured
              </span>
            )}

            {/* Content overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm font-semibold text-white backdrop-blur">
                  {name.charAt(0).toUpperCase()}
                </div>
                <h3 className="font-cinzel text-xl font-bold text-white group-hover:text-gold-light transition-colors">
                  {name}
                </h3>
              </div>
              {description && (
                <p className="text-white/70 text-sm line-clamp-2 max-w-md">
                  {description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-3">
                {productCount !== undefined && (
                  <span className="text-white/50 text-xs">
                    {productCount} {productCount === 1 ? 'murti' : 'murtis'}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-gold text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Default variant (standard category card)
  return (
    <motion.div
       initial={false}
  whileHover={{
    y: -8,
  }}
  transition={{
    duration: 0.3,
    ease: 'easeOut',
  }}
      className={cn(
        'group bg-white dark:bg-brown-dark rounded-2xl overflow-hidden shadow-sm border border-gold/5 dark:border-gold/10 hover:shadow-xl transition-all duration-300',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products?category=${slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-square bg-sand dark:bg-brown overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className={cn(
                'object-cover transition-transform duration-700 group-hover:scale-110',
                !imageLoaded && 'blur-sm scale-105'
              )}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
             loading={priority ? 'eager' : 'lazy'}
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <Image
              src={fallbackImage}
              alt={name}
              fill
              className="object-cover opacity-70 group-hover:scale-110 transition-transform duration-700"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}

          {/* Hover overlay */}
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-t from-brown/60 via-brown/20 to-transparent transition-opacity duration-300',
              isHovered ? 'opacity-100' : 'opacity-0'
            )}
          />

          {/* Overlay badge */}
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center transition-opacity duration-300',
              isHovered ? 'opacity-100' : 'opacity-0'
            )}
          >
            <div className="bg-white/90 dark:bg-brown-dark/90 backdrop-blur rounded-full p-4 shadow-xl text-2xl font-semibold text-brown dark:text-ivory">
              {name.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Product count badge */}
          {productCount !== undefined && (
            <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-brown-dark/90 backdrop-blur text-xs font-medium px-2.5 py-1 rounded-full shadow-sm dark:text-ivory/80">
              {productCount} {productCount === 1 ? 'murti' : 'murtis'}
            </div>
          )}

          {/* Featured badge */}
          {isFeatured && (
            <span className="absolute top-3 right-3 bg-gold text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
              Featured
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 text-sm font-semibold text-gold-dark">
              {name.charAt(0).toUpperCase()}
            </div>
            <h3 className="font-cinzel text-base font-semibold text-brown dark:text-ivory group-hover:text-gold-dark dark:group-hover:text-gold transition-colors">
              {name}
            </h3>
          </div>
          {description && (
            <p className="text-xs text-brown-light dark:text-ivory/50 mt-1 line-clamp-2">
              {description}
            </p>
          )}
          <div
            className={cn(
              'mt-3 text-gold-dark dark:text-gold text-sm font-medium inline-flex items-center gap-1 transition-all duration-300',
              isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
            )}
          >
            <span>Explore</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ============================================================
// CategoryCardGrid – For rendering multiple categories
// ============================================================
interface CategoryCardGridProps {
  categories: Category[];
  variant?: 'default' | 'featured' | 'compact';
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

export function CategoryCardGrid({
  categories,
  variant = 'default',
  columns = 4,
  className,
}: CategoryCardGridProps) {
  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  };

  return (
    <div className={cn('grid gap-4 md:gap-6', columnClasses[columns], className)}>
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} variant={variant} />
      ))}
    </div>
  );
}

// ============================================================
// CategoryCardSkeleton – Loading state
// ============================================================
export function CategoryCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-brown-dark rounded-2xl overflow-hidden shadow-sm border border-gold/5 dark:border-gold/10 animate-pulse"
        >
          <div className="aspect-square bg-sand dark:bg-brown/50" />
          <div className="p-4 text-center">
            <div className="h-4 w-24 bg-sand dark:bg-brown/50 rounded-full mx-auto" />
            <div className="h-3 w-16 bg-sand dark:bg-brown/50 rounded-full mx-auto mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Default export
// ============================================================
export default CategoryCard;