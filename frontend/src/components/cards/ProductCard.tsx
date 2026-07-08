// frontend/src/components/cards/ProductCard.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, type Variants } from 'framer-motion';
import { Heart, ShoppingBag, Eye, Star, StarHalf } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { useCartStore } from '@/features/cart/store/cartStore';
import { useWishlistStore } from '@/features/wishlist/store/wishlistStore';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

// ============================================================
// Types
// ============================================================
interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
  className?: string;
  priority?: boolean;
  onQuickView?: (product: Product) => void;
}

// ============================================================
// ProductCard Component
// ============================================================
export function ProductCard({
  product,
  viewMode = 'grid',
  className,
  priority = false,
  onQuickView,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const { addItem } = useCartStore();
 const toggleWishlist = useWishlistStore((state) => state.toggleItem);

const isInWishlist = useWishlistStore((state) => {
  console.log(
    "Card:",
    product.name,
    "Product ID:",
    product.id,
    "Wishlist IDs:",
    state.items.map((i) => i.id)
  );

  return state.items.some((item) => item.id === product.id);
});
  // Calculate average rating (mock)
  const avgRating = product.rating || 4.5;
  const reviewCount = product.reviewCount || 12;

  // Render stars
  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return (
      <>
        {Array.from({ length: full }).map((_, i) => (
          <Star key={`full-${i}`} className="w-3.5 h-3.5 fill-gold text-gold" />
        ))}
        {half && <StarHalf className="w-3.5 h-3.5 fill-gold text-gold" />}
        {Array.from({ length: empty }).map((_, i) => (
          <Star key={`empty-${i}`} className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
        ))}
      </>
    );
  };

  // Add to cart handler
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    toast.success(`${product.name} added to cart ✨`);
  };

  // Wishlist toggle handler
  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    toast.success(
      isInWishlist
        ? `${product.name} removed from wishlist`
        : `${product.name} added to wishlist ❤️`
    );
  };

  // Quick view handler
  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    } else {
      toast('Quick view coming soon!', { icon: '👀' });
    }
  };

  // Card variants
  const cardVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: {
      y: -8,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  // If list view
  if (viewMode === 'list') {
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
        <Link href={`/products/${product.slug}`} className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative sm:w-48 md:w-56 aspect-[4/3] sm:aspect-square bg-sand dark:bg-brown overflow-hidden shrink-0">
            <Image
              src={product.images[0] || '/placeholder.png'}
              alt={product.name}
              fill
              className={cn(
                'object-cover transition-transform duration-700 group-hover:scale-105',
                !imageLoaded && 'blur-sm scale-105'
              )}
              sizes="(max-width: 640px) 100vw, 224px"
              priority={priority}
              onLoad={() => setImageLoaded(true)}
            />
            {/* Badges */}
            {product.isNew && (
              <span className="absolute top-3 left-3 bg-gold text-white text-xs font-bold px-2.5 py-1 rounded-full">
                New
              </span>
            )}
            {product.discount && (
              <span className="absolute top-3 right-3 bg-maroon text-white text-xs font-bold px-2.5 py-1 rounded-full">
                -{product.discount}%
              </span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="font-cinzel text-lg font-semibold text-brown dark:text-ivory group-hover:text-gold-dark dark:group-hover:text-gold transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-brown-light dark:text-ivory/60 mt-0.5">
                    {product.material || 'Handcrafted'}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={handleWishlistToggle}
                    className="p-2 rounded-full hover:bg-gold/10 transition-colors"
                    aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart
                      className={cn(
                        'w-5 h-5 transition-colors',
                        isInWishlist ? 'fill-red-500 text-red-500' : 'text-brown-light'
                      )}
                    />
                  </button>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="flex items-center">{renderStars(avgRating)}</div>
                <span className="text-xs text-brown-light dark:text-ivory/50">
                  ({reviewCount})
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gold/10 dark:border-gold/5">
              <div>
                <span className="font-cinzel text-xl text-gold-dark dark:text-gold">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-brown-light line-through ml-2">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleQuickView}
                  className="p-2 rounded-full border border-gold/20 hover:bg-gold/10 transition-colors text-brown-light hover:text-gold-dark"
                  aria-label="Quick view"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={handleAddToCart}
                  className="p-2 rounded-full bg-gold text-white hover:bg-gold-dark transition-colors"
                  aria-label="Add to cart"
                >
                  <ShoppingBag className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Grid view (default)
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
      <Link href={`/products/${product.slug}`} className="block relative">
        {/* Image */}
        <div className="relative aspect-[3/4] bg-sand dark:bg-brown overflow-hidden">
          <Image
            src={product.images[0] || '/placeholder.png'}
            alt={product.name}
            fill
            className={cn(
              'object-cover transition-transform duration-700 group-hover:scale-105',
              !imageLoaded && 'blur-sm scale-105'
            )}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Badges */}
          {product.isNew && (
            <span className="absolute top-3 left-3 bg-gold text-white text-xs font-bold px-2.5 py-1 rounded-full">
              New
            </span>
          )}
          {product.discount && (
            <span className="absolute top-3 right-3 bg-maroon text-white text-xs font-bold px-2.5 py-1 rounded-full">
              -{product.discount}%
            </span>
          )}

          {/* Quick action buttons (appear on hover) */}
          <div
            className={cn(
              'absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center gap-3 transition-opacity duration-300',
              isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}
          >
            <button
              onClick={handleQuickView}
              className="p-3 rounded-full bg-white/90 hover:bg-white transition-colors shadow-lg text-brown"
              aria-label="Quick view"
            >
              <Eye className="w-5 h-5" />
            </button>
            <button
              onClick={handleAddToCart}
              className="p-3 rounded-full bg-gold hover:bg-gold-dark transition-colors shadow-lg text-white"
              aria-label="Add to cart"
            >
              <ShoppingBag className="w-5 h-5" />
            </button>
            <button
              onClick={handleWishlistToggle}
              className="p-3 rounded-full bg-white/90 hover:bg-white transition-colors shadow-lg text-brown"
              aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart
                className={cn(
                  'w-5 h-5 transition-colors',
                  isInWishlist ? 'fill-red-500 text-red-500' : 'text-brown'
                )}
              />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-cinzel text-base font-semibold text-brown dark:text-ivory group-hover:text-gold-dark dark:group-hover:text-gold transition-colors line-clamp-1">
                {product.name}
              </h3>
              <p className="text-xs text-brown-light dark:text-ivory/60 mt-0.5">
                {product.material || 'Handcrafted'}
              </p>
            </div>
            <button
              onClick={handleWishlistToggle}
              className="p-1.5 rounded-full hover:bg-gold/10 transition-colors shrink-0"
              aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart
                className={cn(
                  'w-4 h-4 transition-colors',
                  isInWishlist ? 'fill-red-500 text-red-500' : 'text-brown-light'
                )}
              />
            </button>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1">
            <div className="flex items-center">{renderStars(avgRating)}</div>
            <span className="text-[10px] text-brown-light dark:text-ivory/50">
              ({reviewCount})
            </span>
          </div>

          {/* Price & Add */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gold/10 dark:border-gold/5">
            <div>
              <span className="font-cinzel text-lg text-gold-dark dark:text-gold">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-brown-light line-through ml-1.5">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              className="p-2 rounded-full bg-gold text-white hover:bg-gold-dark transition-colors shadow-sm hover:shadow-md"
              aria-label="Add to cart"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ============================================================
// Default export for easier imports
// ============================================================
export default ProductCard;