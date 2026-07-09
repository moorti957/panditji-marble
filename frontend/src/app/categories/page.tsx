// frontend/src/app/categories/page.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import type { Category } from '@/features/categories/types/category.types';
import { Container } from '@/components/ui/Container';
import { Skeleton } from '@/components/ui/Skeleton';
import { categoriesApi } from '@/features/categories/api/categoriesApi';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// ============================================================
// CATEGORIES PAGE
// ============================================================
export default function CategoriesPage() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Fetch categories
  const { data, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getCategories(),
  });

  const categories = data?.categories;

  // Loading state
  if (isLoading) {
    return (
      <Container className="py-12 md:py-20">
        <div className="text-center mb-12">
          <h1 className="font-cinzel text-4xl md:text-5xl font-bold text-brown">Browse by Deity</h1>
          <p className="text-brown-light mt-3 max-w-2xl mx-auto">
            Explore our collection of handcrafted murtis, each dedicated to a divine form.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl" />
          ))}
        </div>
      </Container>
    );
  }

  // Error state
  if (error || !categories) {
    return (
      <Container className="py-20 text-center">
        <h2 className="font-cinzel text-2xl text-brown">Unable to load categories</h2>
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

  // Group categories by first letter for optional alphabet navigation
  const groupedCategories = categories.reduce((acc: Record<string, Category[]>, cat: Category) => {
    const letter = cat.name.charAt(0).toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(cat);
    return acc;
  }, {});

  return (
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
          Browse by Deity
        </h1>
        <p className="text-brown-light mt-3 max-w-2xl mx-auto">
          Choose from our collection of divine forms, each crafted with precision and devotion.
        </p>
        <div className="mt-6 text-sm text-brown-light/60">
          {categories.length} categories available
        </div>
      </motion.div>

      {/* Category grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {categories.map((category: Category, index: number) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            whileHover={{ y: -8 }}
            className="group"
          >
            <Link
              href={`/products?category=${category.id}`}
              className="block bg-white rounded-2xl overflow-hidden shadow-sm border border-gold/5 hover:shadow-xl transition-all duration-300"
            >
              <div className="relative aspect-square bg-sand overflow-hidden">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gold/5">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/80 text-2xl font-semibold text-gold-dark shadow-sm">
                      {category.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {/* Product count badge */}
                {category.productCount !== undefined && (
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
                    {category.productCount} murtis
                  </div>
                )}
              </div>
              <div className="p-4 text-center">
                <h3 className="font-cinzel text-base md:text-lg font-semibold text-brown group-hover:text-gold-dark transition-colors">
                  {category.name}
                </h3>
                <p className="text-xs text-brown-light/60 mt-1">
                  {category.description || 'Divine collection'}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Empty state (just in case) */}
      {categories.length === 0 && (
        <div className="text-center py-16">
          <p className="text-brown-light">No categories available at the moment.</p>
        </div>
      )}

      {/* Optional: Alphabet navigation (if many categories) */}
      {Object.keys(groupedCategories).length > 1 && (
        <div className="mt-12 flex flex-wrap justify-center gap-2">
          {Object.keys(groupedCategories).sort().map((letter) => (
            <a
              key={letter}
              href={`#category-${letter}`}
              className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium text-brown-light hover:bg-gold hover:text-white transition-colors"
            >
              {letter}
            </a>
          ))}
        </div>
      )}

      {/* Alphabet sections */}
      {Object.entries(groupedCategories)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([letter, cats]) => (
          <section key={letter} id={`category-${letter}`} className="mt-16">
            <h2 className="font-cinzel text-2xl font-bold text-brown border-b border-gold/10 pb-3 mb-6">
              {letter}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {cats.map((category: Category) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3 }}
                  className="group"
                >
                  <Link
                    href={`/products?category=${category.id}`}
                    className="block bg-white rounded-2xl overflow-hidden shadow-sm border border-gold/5 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative aspect-square bg-sand overflow-hidden">
                      {category.image ? (
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gold/5">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/80 text-xl font-semibold text-gold-dark shadow-sm">
                            {category.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-3 text-center">
                      <h3 className="font-cinzel text-sm md:text-base font-semibold text-brown group-hover:text-gold-dark transition-colors">
                        {category.name}
                      </h3>
                      {category.productCount !== undefined && (
                        <p className="text-xs text-brown-light/60 mt-0.5">
                          {category.productCount} items
                        </p>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        ))}
    </Container>
  );
}