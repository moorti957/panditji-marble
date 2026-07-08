// frontend/src/app/blogs/page.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Search, Calendar, User, Tag, ChevronLeft, ChevronRight } from 'lucide-react';

// Components
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';

// Hooks
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useDebounce } from '@/hooks/useDebounce';

// Services
import { blogApi, type BlogPost } from '@/services/blogApi';

// ============================================================
// BLOGS PAGE
// ============================================================
export default function BlogsPage() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch all blog posts (you can add server-side pagination later)
  const { data: allPosts, isLoading, error } = useQuery<BlogPost[], Error>({
    queryKey: ['blogs'],
    queryFn: blogApi.getAll,
  });

  // Get unique categories from posts
  const categories = allPosts
    ? ['all', ...new Set(allPosts.map((post: BlogPost) => post.category))]
    : ['all'];

  // Filter posts based on search and category
  const filteredPosts = allPosts?.filter((post: BlogPost) => {
    const matchesSearch = post.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  // Reset page when filters change (derived from search/category, not an
  // external-system effect, so we track the previous values inline instead
  // of using useEffect to avoid a synchronous setState-in-effect render)
  const [prevFilterKey, setPrevFilterKey] = useState(`${debouncedSearch}|${selectedCategory}`);
  const filterKey = `${debouncedSearch}|${selectedCategory}`;
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    if (currentPage !== 1) setCurrentPage(1);
  }

  // Loading state
  if (isLoading) {
    return <BlogsSkeleton />;
  }

  // Error state
  if (error || !allPosts) {
    return (
      <Container className="py-20 text-center">
        <h2 className="font-cinzel text-2xl text-brown">Unable to load blog posts</h2>
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
  if (filteredPosts.length === 0) {
    return (
      <Container className="py-20 text-center">
        <h2 className="font-cinzel text-2xl text-brown">No blog posts found</h2>
        <p className="text-brown-light mt-2">Try adjusting your search or category filter.</p>
        <button
          onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
          className="btn-gold inline-block mt-6"
        >
          Clear Filters
        </button>
      </Container>
    );
  }

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
          Divine Insights
        </h1>
        <p className="text-brown-light mt-3 max-w-2xl mx-auto">
          Stories, wisdom, and behind-the-scenes from the world of handcrafted murtis.
        </p>
      </motion.div>

      {/* Search and filter bar */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-light" />
          <Input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2.5 bg-white border-gold/10 rounded-full focus:border-gold"
          />
        </div>
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-gold text-white shadow-gold'
                  : 'bg-white text-brown-light hover:bg-gold/10 border border-gold/10'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Blog grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {paginatedPosts.map((post: BlogPost, index: number) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            whileHover={{ y: -6 }}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gold/5 hover:shadow-xl transition-all duration-300 group"
          >
            <Link href={`/blogs/${post.slug}`} className="block">
              <div className="relative aspect-[16/9] bg-sand overflow-hidden">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-medium px-2.5 py-1 rounded-full">
                  {post.category}
                </div>
              </div>
              <div className="p-5">
                <h2 className="font-cinzel text-xl font-bold text-brown group-hover:text-gold-dark transition-colors line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-brown-light text-sm mt-2 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between mt-4 text-xs text-brown-light/70">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {post.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(post.publishedAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <span>{post.readTime} min read</span>
                </div>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-xs bg-sand/50 px-2 py-0.5 rounded-full text-brown-light">
                        #{tag}
                      </span>
                    ))}
                    {post.tags.length > 2 && (
                      <span className="text-xs text-brown-light/50">+{post.tags.length - 2}</span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          </motion.article>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg border border-gold/10 transition-colors ${
              currentPage === 1
                ? 'opacity-40 cursor-not-allowed'
                : 'hover:bg-gold/10'
            }`}
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                page === currentPage
                  ? 'bg-gold text-white'
                  : 'hover:bg-gold/10 text-brown'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg border border-gold/10 transition-colors ${
              currentPage === totalPages
                ? 'opacity-40 cursor-not-allowed'
                : 'hover:bg-gold/10'
            }`}
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </Container>
  );
}

// ============================================================
// SKELETON LOADER
// ============================================================
function BlogsSkeleton() {
  return (
    <Container className="py-12 md:py-20">
      <div className="text-center mb-12">
        <Skeleton className="h-12 w-64 mx-auto" />
        <Skeleton className="h-6 w-96 mx-auto mt-3" />
      </div>
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <Skeleton className="h-12 flex-1 rounded-full" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-20 rounded-full" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gold/5">
            <Skeleton className="aspect-[16/9] w-full" />
            <div className="p-5 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}