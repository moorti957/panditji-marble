// frontend/src/components/modals/QuickViewModal.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { X, Heart, ShoppingBag, Minus, Plus, Star, StarHalf, Share2, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { useCartStore } from '@/features/cart/store/cartStore';
import { useWishlistStore } from '@/features/wishlist/store/wishlistStore';
import { formatPrice, cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';

import type { Product } from '@/types';

// ============================================================
// Types
// ============================================================
interface QuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onViewDetails?: (product: Product) => void;
}

// ============================================================
// QuickViewModal Component
// ============================================================
export function QuickViewModal({
  isOpen,
  onClose,
  product,
  onViewDetails,
}: QuickViewModalProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const { addItem } = useCartStore();
  const { items: wishlistItems, toggleItem: toggleWishlist } = useWishlistStore();

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      setSelectedImage(0);
      setQuantity(1);
      setIsImageLoaded(false);
    }
  }, [product]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // If no product or modal closed, return null
  if (!isOpen || !product) return null;

  const isInWishlist = wishlistItems.some((item) => item.id === product.id);

  // Calculate rating
  const avgRating = product.rating || 4.5;
  const reviewCount = product.reviewCount || 12;

  // Render stars
  const renderStars = (rating: number) => {
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
  };

  // Handlers
  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`${quantity} × ${product.name} added to cart ✨`);
    onClose();
  };

  const handleWishlistToggle = () => {
    toggleWishlist(product);
    toast.success(
      isInWishlist
        ? `${product.name} removed from wishlist`
        : `${product.name} added to wishlist ❤️`
    );
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/products/${product.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out this beautiful ${product.name} from Pandit Ji Marble Murti Art Arts!`,
          url: url,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(product);
    } else {
      window.location.href = `/products/${product.slug}`;
    }
    onClose();
  };

  // Modal animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
  };

  return (
    <AnimatePresence>
      <motion.div
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          ref={modalRef}
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          <GlassCard
            variant="default"
            className="overflow-hidden"
            padding="none"
            shadow={false}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 dark:bg-brown-dark/80 backdrop-blur hover:bg-white dark:hover:bg-brown-dark transition-colors shadow-lg"
              aria-label="Close quick view"
            >
              <X className="w-5 h-5 text-brown dark:text-ivory" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Left: Image Gallery */}
              <div className="relative bg-sand dark:bg-brown/50 p-4 md:p-6">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-white dark:bg-brown-dark">
                  <Image
                    src={product.images[selectedImage] || product.images[0] || '/placeholder.png'}
                    alt={product.name}
                    fill
                    className={cn(
                      'object-cover transition-opacity duration-500',
                      isImageLoaded ? 'opacity-100' : 'opacity-0'
                    )}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                    onLoad={() => setIsImageLoaded(true)}
                  />
                  {!isImageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}

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

                {/* Thumbnails */}
                {product.images.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                    {product.images.map((img: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={cn(
                          'relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all',
                          selectedImage === idx
                            ? 'border-gold'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        )}
                      >
                        <Image
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Product Info */}
              <div className="p-5 md:p-6 flex flex-col">
                <div className="flex-1 space-y-4">
                  {/* Category */}
                  {product.category && (
                    <span className="inline-block text-xs font-medium text-gold-dark dark:text-gold bg-gold/10 dark:bg-gold/20 px-2.5 py-1 rounded-full">
                      {product.category}
                    </span>
                  )}

                  {/* Title */}
                  <h2 className="font-cinzel text-xl md:text-2xl font-bold text-brown dark:text-ivory">
                    {product.name}
                  </h2>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">{renderStars(avgRating)}</div>
                    <span className="text-sm text-brown-light dark:text-ivory/50">
                      ({reviewCount} reviews)
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-3">
                    <span className="font-cinzel text-2xl text-gold-dark dark:text-gold">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-brown-light line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                    {product.discount && (
                      <span className="text-xs bg-maroon/10 text-maroon dark:bg-maroon/20 dark:text-maroon-light px-2 py-0.5 rounded-full">
                        Save {product.discount}%
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {product.description && (
                    <p className="text-sm text-brown-light dark:text-ivory/60 leading-relaxed line-clamp-3">
                      {product.description}
                    </p>
                  )}

                  {/* Specifications (quick preview) */}
                  {product.material && (
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                      {product.material && (
                        <div>
                          <span className="text-brown-light dark:text-ivory/50">Material:</span>
                          <span className="text-brown dark:text-ivory font-medium ml-1">
                            {product.material}
                          </span>
                        </div>
                      )}
                      {product.height && (
                        <div>
                          <span className="text-brown-light dark:text-ivory/50">Height:</span>
                          <span className="text-brown dark:text-ivory font-medium ml-1">
                            {product.height} cm
                          </span>
                        </div>
                      )}
                      {product.weight && (
                        <div>
                          <span className="text-brown-light dark:text-ivory/50">Weight:</span>
                          <span className="text-brown dark:text-ivory font-medium ml-1">
                            {product.weight} kg
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Availability */}
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'inline-block w-2 h-2 rounded-full',
                        product.inStock ? 'bg-green-500' : 'bg-red-500'
                      )}
                    />
                    <span className="text-sm font-medium text-brown-light dark:text-ivory/60">
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 mt-4 border-t border-gold/10 dark:border-gold/5 space-y-4">
                  {/* Quantity and Add to Cart */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-gold/20 rounded-full overflow-hidden">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-2 hover:bg-gold/10 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4 text-brown dark:text-ivory" />
                      </button>
                      <span className="w-10 text-center text-sm font-medium text-brown dark:text-ivory">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-3 py-2 hover:bg-gold/10 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4 text-brown dark:text-ivory" />
                      </button>
                    </div>
                    <Button
                      onClick={handleAddToCart}
                      className="flex-1 btn-gold text-sm"
                      disabled={!product.inStock}
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </Button>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleWishlistToggle}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
                        isInWishlist
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30'
                          : 'border border-gold/20 text-brown-light dark:text-ivory/60 hover:bg-gold/10'
                      )}
                    >
                      <Heart
                        className={cn(
                          'w-4 h-4',
                          isInWishlist && 'fill-red-500 text-red-500'
                        )}
                      />
                      {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-2.5 rounded-full border border-gold/20 hover:bg-gold/10 transition-colors text-brown-light dark:text-ivory/60"
                      aria-label="Share"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* View full details */}
                  <button
                    onClick={handleViewDetails}
                    className="w-full flex items-center justify-center gap-2 text-sm text-gold-dark dark:text-gold hover:text-gold transition-colors font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    View Full Details
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================
// Default export
// ============================================================
export default QuickViewModal;