// frontend/src/app/products/[slug]/page.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Heart, 
  Share2, 
  ShoppingBag, 
  Check, 
  Minus, 
  Plus,
  Star,
  StarHalf,
  Truck,
  Shield,
  RotateCcw,
  MessageCircle,
  ZoomIn,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// Components
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/cards/ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';

// Hooks
import { useCart } from '@/features/cart/hooks/useCart';
import { useWishlist } from '@/features/wishlist/hooks/useWishlist';
import { useProduct } from '@/features/products/hooks/useProduct';
import { useRelatedProducts } from '@/features/products/hooks/useRelatedProducts';
import { useReviews } from '@/features/reviews/hooks/useReviews';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// Utils
import { formatPrice } from '@/lib/utils';
import { toast } from 'react-hot-toast';

// Types
import { Product, ProductSpecification, Review } from '@/types';
import { useCartStore } from '@/features/cart/store/cartStore';

// ============================================================
// PRODUCT DETAIL PAGE
// ============================================================
export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const imageRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);

  // Fetch product
  const { data: product, isLoading, error } = useProduct(slug);

  // Fetch related products
  const { data: relatedProducts } = useRelatedProducts(product?.id);

  // Fetch reviews
  const { data: reviews } = useReviews(product?.id);

  // Cart and wishlist
  const addItem = useCartStore((s)=>s.addItem);
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Query client for optimistic updates
  const queryClient = useQueryClient();

  // Handle sticky buy box
  useEffect(() => {
    const handleScroll = () => {
      if (!imageRef.current) return;
      const rect = imageRef.current.getBoundingClientRect();
      setIsSticky(rect.bottom < 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset quantity/selected image when the product identity changes.
  // Adjusted during render (not in an effect) per React's recommended
  // pattern for resetting state when a prop/derived value changes.
 const prevProductId = useRef<string | null>(null);

useEffect(() => {
  if (!product?.id) return;

  if (prevProductId.current !== product.id) {
    prevProductId.current = product.id;
    setQuantity(1);
    setSelectedImage(0);
  }
}, [product?.id]);

  // Loading state
  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  // Error state
  if (error || !product) {
    return (
      <Container className="py-20 text-center">
        <h2 className="font-cinzel text-2xl text-brown">Product not found</h2>
        <p className="text-brown-light mt-2">The murti you&apos;re looking for may have been moved or removed.</p>
        <Link href="/products" className="btn-gold inline-block mt-6">
          Browse Collection
        </Link>
      </Container>
    );
  }

  // Add to cart handler
  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`${quantity} × ${product.name} added to cart ✨`);
  };

  // Wishlist toggle
  const handleWishlistToggle = () => {
    toggleWishlist(product);
    toast.success(
      isInWishlist(product.id) 
        ? 'Removed from wishlist' 
        : 'Added to wishlist ❤️'
    );
  };

  // WhatsApp inquiry
  const handleWhatsAppInquiry = () => {
    const message = `Hello, I'm interested in ${product.name} (${product.slug}). Could you provide more details?`;
    window.open(`https://wa.me/917240364772?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Share product
  const handleShare = async () => {
    const url = window.location.href;
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

  // Image gallery navigation
  const nextImage = () => setSelectedImage((prev) => (prev + 1) % product.images.length);
  const prevImage = () => setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);

  // Calculate average rating
  const avgRating = reviews?.length
    ? reviews.reduce((acc: number, r: Review) => acc + r.rating, 0) / reviews.length
    : 0;

  // Render stars
  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return (
      <>
        {Array.from({ length: full }).map((_, i) => (
          <Star key={`full-${i}`} className="w-4 h-4 fill-gold text-gold" />
        ))}
        {half && <StarHalf className="w-4 h-4 fill-gold text-gold" />}
        {Array.from({ length: empty }).map((_, i) => (
          <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
        ))}
      </>
    );
  };

  return (
    <>
      {/* Main content */}
      <Container className="py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Image Gallery */}
          <div ref={imageRef}>
            <div className="relative aspect-square bg-sand rounded-2xl overflow-hidden group">
              <Image
                src={product.images[selectedImage] || '/placeholder.png'}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              {/* Zoom button */}
              <button
                onClick={() => setIsZoomOpen(true)}
                className="absolute bottom-4 right-4 bg-white/80 backdrop-blur p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                aria-label="Zoom image"
              >
                <ZoomIn className="w-5 h-5 text-brown" />
              </button>
              {/* Navigation arrows on desktop */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur p-2 rounded-full shadow-lg hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur p-2 rounded-full shadow-lg hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              {/* Badges */}
              {product.isNew && (
                <Badge className="absolute top-4 left-4 bg-gold text-white">New</Badge>
              )}
              {product.discount && (
                <Badge className="absolute top-4 right-4 bg-maroon text-white">
                  -{product.discount}%
                </Badge>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                      selectedImage === idx ? 'border-gold' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="text-sm text-brown-light">
              <Link href="/" className="hover:text-gold-dark">Home</Link>
              <span className="mx-2">/</span>
              <Link href="/products" className="hover:text-gold-dark">Products</Link>
              <span className="mx-2">/</span>
              <span className="text-brown">{product.name}</span>
            </nav>

            {/* Title & Rating */}
            <div>
              <h1 className="font-cinzel text-3xl md:text-4xl font-bold text-brown">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  {renderStars(avgRating)}
                </div>
                <span className="text-sm text-brown-light">
                  ({reviews?.length || 0} reviews)
                </span>
                {product.material && (
                  <span className="text-sm text-brown-light bg-sand px-3 py-1 rounded-full">
                    {product.material}
                  </span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="font-cinzel text-3xl text-gold-dark">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-brown-light line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {product.discount && (
                <Badge variant="secondary" className="bg-maroon/10 text-maroon">
                  Save {product.discount}%
                </Badge>
              )}
            </div>

            {/* Short description */}
            <p className="text-brown-light leading-relaxed">
              {product.description?.substring(0, 160)}...
            </p>

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center border border-gold/20 rounded-full overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gold/10 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 hover:bg-gold/10 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <Button
                onClick={handleAddToCart}
                className="btn-gold flex-1 min-w-[140px]"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <button
                onClick={handleWishlistToggle}
                className={`p-3 rounded-full border transition-all ${
                  isInWishlist(product.id)
                    ? 'bg-red-50 border-red-200 text-red-500'
                    : 'border-gold/20 hover:bg-gold/10'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-red-500' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-3 rounded-full border border-gold/20 hover:bg-gold/10 transition-colors"
                aria-label="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Availability & Shipping */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gold/10">
              <div className="flex items-center gap-2 text-sm">
                <Check className={`w-4 h-4 ${product.inStock ? 'text-green-500' : 'text-red-400'}`} />
                <span className={product.inStock ? 'text-green-600' : 'text-red-500'}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-brown-light">
                <Truck className="w-4 h-4" />
                <span>Shipping charges apply</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-brown-light">
                <Shield className="w-4 h-4" />
                <span>Authentic</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-brown-light">
                <RotateCcw className="w-4 h-4" />
                <span>7-day returns</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                onClick={handleWhatsAppInquiry}
                variant="outline"
                className="flex-1 border-green-500 text-green-600 hover:bg-green-50"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp Inquiry
              </Button>
              <Link href="/contact" className="flex-1">
                <Button variant="outline" className="w-full border-maroon/30 text-maroon hover:bg-maroon/5">
                  Request Custom Murti
                </Button>
              </Link>
            </div>

            {/* Tabs: Description, Specs, Reviews */}
            <Tabs defaultValue="description" className="pt-6" onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start border-b border-gold/10 bg-transparent p-0">
                <TabsTrigger value="description" className="data-[state=active]:border-gold">
                  Description
                </TabsTrigger>
                <TabsTrigger value="specifications" className="data-[state=active]:border-gold">
                  Specifications
                </TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:border-gold">
                  Reviews ({reviews?.length || 0})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="pt-4 text-brown-light leading-relaxed">
                <p>{product.description}</p>
              </TabsContent>
              <TabsContent value="specifications" className="pt-4">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {product.specifications?.map((spec: ProductSpecification) => (
                    <div key={spec.key} className="flex justify-between py-2 border-b border-gold/5">
                      <dt className="text-brown font-medium">{spec.key}</dt>
                      <dd className="text-brown-light">{spec.value}</dd>
                    </div>
                  ))}
                  {!product.specifications?.length && (
                    <p className="text-brown-light col-span-2">No specifications available.</p>
                  )}
                </dl>
              </TabsContent>
              <TabsContent value="reviews" className="pt-4">
                {reviews?.length ? (
                  <div className="space-y-6">
                    {reviews.map((review: Review) => (
                      <div key={review.id} className="border-b border-gold/10 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-sm font-medium">{review.author}</span>
                          <span className="text-xs text-brown-light">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-brown-light text-sm mt-1">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-brown-light">No reviews yet. Be the first to review this murti!</p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <section className="mt-16 pt-8 border-t border-gold/10">
            <h2 className="font-cinzel text-2xl font-bold text-brown mb-6">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </Container>

      {/* Sticky Buy Box (mobile/tablet) */}
      <AnimatePresence>
        {isSticky && isMobile && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: 'spring', damping: 30 }}
            className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl shadow-xl border-t border-gold/10 p-4 z-40"
          >
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                <p className="font-cinzel text-lg text-gold-dark">{formatPrice(product.price)}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gold/20 rounded-full">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 hover:bg-gold/10"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1.5 hover:bg-gold/10"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <Button onClick={handleAddToCart} className="btn-gold px-6 py-2.5 text-sm">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zoom Modal */}
      <AnimatePresence>
        {isZoomOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
              onClick={() => setIsZoomOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed inset-4 md:inset-10 z-50 bg-white rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsZoomOpen(false)}
                className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                aria-label="Close zoom"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="w-full h-full relative">
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              </div>
              {/* Thumbnails in zoom */}
              {product.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-white/80 backdrop-blur p-2 rounded-full shadow-lg">
                  {product.images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-12 h-12 rounded-md overflow-hidden border-2 transition-all ${
                        selectedImage === idx ? 'border-gold' : 'border-transparent opacity-60'
                      }`}
                    >
                      <Image src={img} alt={`Thumb ${idx}`} width={48} height={48} className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================
// SKELETON LOADER
// ============================================================
function ProductDetailSkeleton() {
  return (
    <Container className="py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="flex gap-3 mt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="w-20 h-20 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </Container>
  );
}