// frontend/src/app/wishlist/page.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Heart, ShoppingBag, Trash2, MoveRight } from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

import { useWishlist } from '@/features/wishlist/hooks/useWishlist';
import { useCart } from '@/features/cart/hooks/useCart';
import { formatPrice } from '@/lib/utils';

// ============================================================
// Wishlist Page
// ============================================================
export default function WishlistPage() {
  const { items, removeItem, isInWishlist } = useWishlist();
  const { addItem } = useCart();
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading (for hydration)
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // Add to cart handler
  const handleAddToCart = (product: any) => {
    addItem(product, 1);
    toast.success(`${product.name} added to cart ✨`);
  };

  // Remove from wishlist handler
  const handleRemove = (productId: string, productName: string) => {
    removeItem(productId);
    toast.success(`${productName} removed from wishlist`);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <Container className="py-12 md:py-20">
        <div className="flex items-center gap-3 mb-8">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl" />
          ))}
        </div>
      </Container>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <Container className="py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto"
        >
          <div className="w-24 h-24 mx-auto bg-gold/10 rounded-full flex items-center justify-center mb-6">
            <Heart className="w-12 h-12 text-gold" />
          </div>
          <h1 className="font-cinzel text-2xl md:text-3xl font-bold text-brown">
            Your Wishlist is Empty
          </h1>
          <p className="text-brown-light mt-2">
            Start saving your favorite divine murtis.
          </p>
          <Link href="/products" className="btn-gold inline-block mt-6">
            Browse Collection
          </Link>
        </motion.div>
      </Container>
    );
  }

  return (
    <Container className="py-8 md:py-12">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-3 mb-8"
      >
        <h1 className="font-cinzel text-2xl md:text-3xl font-bold text-brown">
          My Wishlist
        </h1>
        <span className="text-sm text-brown-light bg-sand/60 px-3 py-1 rounded-full">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        <AnimatePresence mode="popLayout">
          {items.map((item: any, index: number) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gold/5 hover:shadow-xl transition-all duration-300"
            >
              <Link href={`/products/${item.slug}`} className="block relative">
                <div className="relative aspect-square bg-sand overflow-hidden">
                  <Image
                    src={item.images[0] || '/placeholder.png'}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  {/* Remove button (appears on hover) */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemove(item.id, item.name);
                    }}
                    className="absolute top-3 right-3 bg-white/90 backdrop-blur p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-500"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {item.discount && (
                    <span className="absolute top-3 left-3 bg-maroon text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      -{item.discount}%
                    </span>
                  )}
                </div>
              </Link>

              <div className="p-4">
                <Link href={`/products/${item.slug}`}>
                  <h3 className="font-cinzel text-sm md:text-base font-semibold text-brown group-hover:text-gold-dark transition-colors line-clamp-1">
                    {item.name}
                  </h3>
                </Link>
                <p className="text-xs text-brown-light/70 mt-0.5">
                  {item.material || 'Handcrafted'}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <span className="font-cinzel text-base text-gold-dark">
                      {formatPrice(item.price)}
                    </span>
                    {item.originalPrice && (
                      <span className="text-xs text-brown-light line-through ml-1.5">
                        {formatPrice(item.originalPrice)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="p-2 rounded-full bg-gold text-white hover:bg-gold-dark transition-colors"
                    aria-label="Add to cart"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* View all products CTA */}
      <div className="text-center mt-12 pt-8 border-t border-gold/10">
        <Link href="/products" className="inline-flex items-center gap-2 text-brown-light hover:text-gold-dark transition-colors">
          <span>Discover more divine murtis</span>
          <MoveRight className="w-4 h-4" />
        </Link>
      </div>
    </Container>
  );
}