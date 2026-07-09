// frontend/src/app/products/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// Components
import  Container  from '../../components/ui/Container';
import { ProductCard } from '../../components/cards/ProductCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import { Slider } from '../../components/ui/Slider';
import { Skeleton } from '../../components/ui/Skeleton';

// Icons
import { 
  Filter, 
  X, 
  Grid3x3, 
  LayoutList,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Search,
} from 'lucide-react';

// Hooks
import { useProducts } from '../../features/products/hooks/useProducts';
import { useCategories } from '../../features/categories/hooks/useCategories';
import { useDebounce } from '../../hooks/useDebounce';
import { useMediaQuery } from '../../hooks/useMediaQuery';

// Types
import { ProductFilters } from '../../types';

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filters state
 const inStockParam = searchParams.get('inStock');

const [filters, setFilters] = useState<ProductFilters>({
  category: searchParams.get('category') || '',
  search: searchParams.get('search') || '',
  minPrice: Number(searchParams.get('minPrice')) || 0,
  maxPrice: Number(searchParams.get('maxPrice')) || 100000,
  sort: (searchParams.get('sort') as ProductFilters['sort']) || 'newest',
  inStock: inStockParam ? inStockParam === 'true' : undefined,
  material: searchParams.get('material') || '',
});

  // Debounce search to avoid excessive API calls
  const debouncedSearch = useDebounce(filters.search, 300);

  // Fetch products with filters
  const {
    products: allProducts,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useProducts({
    filters: {
      ...filters,
      search: debouncedSearch,
    },
  });

  // Fetch categories for filter sidebar
  const { categories } = useCategories();

  // Infinite scroll trigger
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Load more when inView
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Update URL when filters change (for shareability)
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.search) params.set('search', filters.search);
    if ((filters.minPrice ?? 0) > 0) params.set('minPrice', String(filters.minPrice));
    if ((filters.maxPrice ?? 100000) < 100000) params.set('maxPrice', String(filters.maxPrice));
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.inStock) params.set('inStock', 'true');
    if (filters.material) params.set('material', filters.material);
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.replace(newUrl, { scroll: false });
  }, [filters, router]);

  // Update filter value
  const updateFilter = <K extends keyof ProductFilters>(
    key: K,
    value: ProductFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      category: '',
      search: '',
      minPrice: 0,
      maxPrice: 100000,
      sort: 'newest',
      inStock: undefined,
      material: '',
    });
  };

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(
    (v) => v && v !== '' && v !== 0 && v !== false
  ).length;

  // Sort options
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  // Material options (hardcoded or from API)
  const materialOptions = ['Marble',  'Stone'];

  // Price range (can be dynamic from API)
  const priceRange = { min: 0, max: 100000 };

  // Filter sidebar content
  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Category filter */}
      <div>
        <h4 className="font-cinzel text-sm font-semibold mb-3">Category</h4>
        <div className="space-y-2">
          {categories?.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="category"
                value={cat.id}
                checked={filters.category === cat.id}
                onChange={() => updateFilter('category', cat.id)}
                className="accent-gold"
              />
              <span className={filters.category === cat.id ? 'text-gold-dark font-medium' : ''}>
                {cat.name}
              </span>
            </label>
          ))}
          {filters.category && (
            <button
              onClick={() => updateFilter('category', '')}
              className="text-xs text-brown-light hover:text-maroon transition-colors"
            >
              Clear category
            </button>
          )}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h4 className="font-cinzel text-sm font-semibold mb-3">Price Range</h4>
        <div className="px-1">
          <Slider
            min={priceRange.min}
            max={priceRange.max}
            step={100}
            value={[filters.minPrice ?? priceRange.min, filters.maxPrice ?? priceRange.max]}
            onValueChange={([min, max]) => {
              updateFilter('minPrice', min);
              updateFilter('maxPrice', max);
            }}
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-brown-light">
            <span>{filters.minPrice}</span>
            <span>{filters.maxPrice}</span>
          </div>
        </div>
      </div>

      {/* Material */}
      <div>
        <h4 className="font-cinzel text-sm font-semibold mb-3">Material</h4>
        <div className="space-y-2">
          {materialOptions.map((mat) => (
            <label key={mat} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="material"
                value={mat}
                checked={filters.material === mat}
                onChange={() => updateFilter('material', mat)}
                className="accent-gold"
              />
              <span className={filters.material === mat ? 'text-gold-dark font-medium' : ''}>
                {mat}
              </span>
            </label>
          ))}
          {filters.material && (
            <button
              onClick={() => updateFilter('material', '')}
              className="text-xs text-brown-light hover:text-maroon transition-colors"
            >
              Clear material
            </button>
          )}
        </div>
      </div>

      {/* In stock */}
      <div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => updateFilter('inStock', e.target.checked)}
            className="accent-gold"
          />
          <span>In stock only</span>
        </label>
      </div>

      {/* Reset button */}
      {activeFilterCount > 0 && (
        <button
          onClick={resetFilters}
          className="text-sm text-maroon hover:text-maroon-dark transition-colors"
        >
          Reset all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-ivory min-h-screen">
      <Container className="py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-cinzel text-3xl md:text-4xl font-bold text-brown">
              Divine Collection
            </h1>
            <p className="text-brown-light text-sm mt-1">
              {allProducts.length} handcrafted murtis to choose from
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-light" />
              <Input
                type="text"
                placeholder="Search murtis..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border-gold/10 rounded-full focus:border-gold"
              />
            </div>

            {/* Sort */}
            <Select
              value={filters.sort}
              onValueChange={(val) => updateFilter('sort', val as ProductFilters['sort'])}
              options={sortOptions}
              className="min-w-[140px]"
            />

            {/* View toggle */}
            <div className="flex border border-gold/10 rounded-full overflow-hidden bg-white">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${
                  viewMode === 'grid' ? 'bg-gold text-white' : 'hover:bg-gold/10'
                }`}
                aria-label="Grid view"
              >
                <Grid3x3 size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${
                  viewMode === 'list' ? 'bg-gold text-white' : 'hover:bg-gold/10'
                }`}
                aria-label="List view"
              >
                <LayoutList size={18} />
              </button>
            </div>

            {/* Mobile filter toggle */}
            <Button
              variant="outline"
              onClick={() => setIsFilterOpen(true)}
              className="md:hidden relative"
            >
              <Filter size={18} />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-maroon text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop filter sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0 sticky top-24 self-start max-h-[calc(100vh-6rem)] overflow-y-auto pb-8">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gold/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-cinzel text-lg font-semibold">Filters</h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="text-xs text-maroon hover:text-maroon-dark transition-colors"
                  >
                    Reset all
                  </button>
                )}
              </div>
              <FilterSidebar />
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            {/* Loading skeleton */}
            {isLoading && (
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'} gap-4 md:gap-6`}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-80 rounded-2xl" />
                ))}
              </div>
            )}

            {/* Product cards */}
            {!isLoading && allProducts.length > 0 && (
              <>
                <div
                  className={`grid ${
                    viewMode === 'grid'
                      ? 'grid-cols-2 md:grid-cols-3'
                      : 'grid-cols-1'
                  } gap-4 md:gap-6`}
                >
                 {allProducts
  .filter(Boolean)
  .map((product, index) => (
    <motion.div
      key={product.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <ProductCard
        product={product}
        viewMode={viewMode}
      />
    </motion.div>
))}
                </div>

                {/* Infinite scroll trigger */}
                {hasNextPage && (
                  <div ref={ref} className="flex justify-center py-8">
                    {isFetchingNextPage ? (
                      <div className="flex items-center gap-2 text-brown-light">
                        <span className="inline-block w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                        Loading more...
                      </div>
                    ) : (
                      <button
                        onClick={() => fetchNextPage()}
                        className="btn-outline-gold px-6 py-2 text-sm"
                      >
                        Load more
                      </button>
                    )}
                  </div>
                )}

                {!hasNextPage && allProducts.length > 6 && (
                  <p className="text-center text-brown-light text-sm py-6">
                    You've reached the end of our collection 🙏
                  </p>
                )}
              </>
            )}

            {/* No products */}
            {!isLoading && allProducts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-brown-light text-lg">No murtis found matching your criteria.</p>
                <button
                  onClick={resetFilters}
                  className="btn-gold mt-4 inline-block"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </Container>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setIsFilterOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 h-full w-[85%] max-w-sm bg-ivory shadow-2xl z-50 p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-cinzel text-xl font-bold">Filters</h3>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 hover:bg-gold/10 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <FilterSidebar />
              <div className="mt-6 flex gap-3">
                <Button
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-1 btn-gold"
                >
                  Apply Filters
                </Button>
                {activeFilterCount > 0 && (
                  <Button
                    onClick={resetFilters}
                    variant="outline"
                    className="flex-1"
                  >
                    Reset
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}