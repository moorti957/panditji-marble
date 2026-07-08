// frontend/src/app/gallery/page.tsx

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { X, Filter, ChevronLeft, ChevronRight, Grid3x3, LayoutList } from 'lucide-react';

// Components
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

// Hooks
import { useMediaQuery } from '@/hooks/useMediaQuery';

// Services (mock or real)
import { galleryApi, type GalleryItem } from '@/services/galleryApi';

// ============================================================
// GALLERY PAGE
// ============================================================
export default function GalleryPage() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('masonry');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch gallery items
  const { data: galleryItems, isLoading, error } = useQuery<GalleryItem[], Error>({
    queryKey: ['gallery'],
    queryFn: galleryApi.getAll,
  });

  // Categories for filter
  const categories = [
    { id: 'all', label: 'All' },
    { id: 'murti', label: 'Divine Murtis' },
    { id: 'temple', label: 'Temple Projects' },
    { id: 'workshop', label: 'Craftsmanship' },
    { id: 'ceremony', label: 'Ceremonies' },
  ];

  // Filter items based on active category
  const filteredItems = galleryItems?.filter((item: GalleryItem) =>
    activeCategory === 'all' ? true : item.category === activeCategory
  ) || [];

  // Lightbox navigation
  const goToPrevious = () => {
    const newIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
    setCurrentIndex(newIndex);
    setSelectedItem(filteredItems[newIndex]);
  };

  const goToNext = () => {
    const newIndex = (currentIndex + 1) % filteredItems.length;
    setCurrentIndex(newIndex);
    setSelectedItem(filteredItems[newIndex]);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedItem) return;
      if (e.key === 'Escape') setSelectedItem(null);
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, currentIndex, filteredItems]);

  // Loading skeleton
  if (isLoading) {
    return (
      <Container className="py-12 md:py-20">
        <div className="text-center mb-12">
          <h1 className="font-cinzel text-4xl md:text-5xl font-bold text-brown">Divine Gallery</h1>
          <p className="text-brown-light mt-3 max-w-2xl mx-auto">
            Explore our collection of handcrafted murtis and temple installations.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-full" />
          ))}
        </div>
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-64 mb-4 rounded-2xl" />
          ))}
        </div>
      </Container>
    );
  }

  // Error state
  if (error || !galleryItems) {
    return (
      <Container className="py-20 text-center">
        <h2 className="font-cinzel text-2xl text-brown">Unable to load gallery</h2>
        <p className="text-brown-light mt-2">Please try again later.</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-gold inline-block mt-6"
        >
          Retry
        </button>
      </Container>
    );
  }

  // Empty state
  if (filteredItems.length === 0) {
    return (
      <Container className="py-20 text-center">
        <h2 className="font-cinzel text-2xl text-brown">No images found</h2>
        <p className="text-brown-light mt-2">Try selecting a different category.</p>
      </Container>
    );
  }

  return (
    <>
      <Container className="py-12 md:py-20">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="ornate-divider">
            <span className="diamond">✦</span>
          </div>
          <h1 className="font-cinzel text-4xl md:text-5xl font-bold text-brown">
            Divine Gallery
          </h1>
          <p className="text-brown-light mt-3 max-w-2xl mx-auto">
            Witness the artistry and devotion behind each handcrafted murti and temple installation.
          </p>
        </motion.div>

        {/* Filter and view controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-gold text-white shadow-gold'
                    : 'bg-white text-brown-light hover:bg-gold/10 border border-gold/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-brown-light/70 mr-1">
              {filteredItems.length} images
            </span>
            <button
              onClick={() => setViewMode('masonry')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'masonry' ? 'bg-gold text-white' : 'hover:bg-gold/10'
              }`}
              aria-label="Masonry view"
            >
              <Grid3x3 size={18} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-gold text-white' : 'hover:bg-gold/10'
              }`}
              aria-label="Grid view"
            >
              <LayoutList size={18} />
            </button>
          </div>
        </div>

        {/* Gallery grid */}
        {viewMode === 'masonry' ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {filteredItems.map((item: GalleryItem, index: number) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.03 }}
                whileHover={{ y: -4 }}
                className="break-inside-avoid cursor-pointer group relative"
                onClick={() => {
                  setSelectedItem(item);
                  setCurrentIndex(filteredItems.indexOf(item));
                }}
              >
                <div className="relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={600}
                    height={800}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div>
                      <h3 className="text-white font-cinzel text-sm font-semibold">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-white/80 text-xs mt-1">{item.description}</p>
                      )}
                    </div>
                  </div>
                  {/* Category badge */}
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
                    {categories.find(c => c.id === item.category)?.label || item.category}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          // Grid view (uniform rows)
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item: GalleryItem, index: number) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                whileHover={{ y: -4 }}
                className="cursor-pointer group"
                onClick={() => {
                  setSelectedItem(item);
                  setCurrentIndex(filteredItems.indexOf(item));
                }}
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 bg-sand">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <p className="text-white text-xs font-medium line-clamp-2">{item.title}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Container>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md"
              onClick={() => setSelectedItem(null)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 pointer-events-none"
              onClick={() => setSelectedItem(null)}
            >
              <div
                className="relative max-w-5xl w-full max-h-full bg-white rounded-2xl overflow-hidden shadow-2xl pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close button */}
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                  aria-label="Close lightbox"
                >
                  <X className="w-6 h-6 text-brown" />
                </button>

                {/* Navigation arrows */}
                {filteredItems.length > 1 && (
                  <>
                    <button
                      onClick={goToPrevious}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-6 h-6 text-brown" />
                    </button>
                    <button
                      onClick={goToNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-6 h-6 text-brown" />
                    </button>
                  </>
                )}

                {/* Image container */}
                <div className="relative w-full h-[80vh] md:h-[85vh]">
                  <Image
                    src={selectedItem.image}
                    alt={selectedItem.title}
                    fill
                    className="object-contain"
                    sizes="100vw"
                    priority
                  />
                </div>

                {/* Caption */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 pt-12">
                  <h3 className="text-white font-cinzel text-xl font-semibold">
                    {selectedItem.title}
                  </h3>
                  {selectedItem.description && (
                    <p className="text-white/80 text-sm mt-1">{selectedItem.description}</p>
                  )}
                  <p className="text-white/50 text-xs mt-2">
                    {categories.find(c => c.id === selectedItem.category)?.label || selectedItem.category}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-white/60 text-xs">
                      {currentIndex + 1} / {filteredItems.length}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}