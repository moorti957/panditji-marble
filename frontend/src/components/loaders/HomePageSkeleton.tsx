// frontend/src/components/loaders/HomePageSkeleton.tsx

'use client';

import Container from '../ui/Container';
import { Skeleton } from '../ui/Skeleton';
import { cn } from '../../lib/utils';

// ============================================================
// HomePageSkeleton Component
// ============================================================
export default function HomePageSkeleton() {
  return (
    <div className="bg-ivory dark:bg-brown min-h-screen">
      {/* ============================================================
          HERO SKELETON
      ============================================================ */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-ivory via-sand/30 to-ivory dark:from-brown dark:via-brown/80 dark:to-brown">
        <Container className="py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="space-y-6">
              {/* Tag skeleton */}
              <Skeleton className="h-6 w-32 rounded-full" />
              
              {/* Title skeleton */}
              <div className="space-y-3">
                <Skeleton className="h-12 sm:h-14 md:h-16 w-full max-w-md" />
                <Skeleton className="h-12 sm:h-14 md:h-16 w-3/4 max-w-sm" />
              </div>
              
              {/* Subtitle skeleton */}
              <Skeleton className="h-5 w-full max-w-sm" />
              <Skeleton className="h-5 w-3/4 max-w-sm" />
              
              {/* Stats skeleton */}
              <div className="flex items-center gap-8 pt-2">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="w-px h-10 bg-gold/10" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="w-px h-10 bg-gold/10" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              
              {/* Buttons skeleton */}
              <div className="flex flex-wrap gap-4 pt-2">
                <Skeleton className="h-12 w-40 rounded-full" />
                <Skeleton className="h-12 w-32 rounded-full" />
              </div>
            </div>
            
            {/* Right image skeleton */}
            <div className="relative flex justify-center lg:justify-end">
              <Skeleton className="aspect-[3/4] w-full max-w-md lg:max-w-lg rounded-2xl" />
            </div>
          </div>
        </Container>
      </section>

      {/* ============================================================
          CATEGORIES SKELETON
      ============================================================ */}
      <section className="section-padding bg-ivory dark:bg-brown">
        <Container>
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="flex-1 max-w-12 h-px bg-gold/20" />
              <Skeleton className="h-4 w-4 rounded-full" />
              <div className="flex-1 max-w-12 h-px bg-gold/20" />
            </div>
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-72 mx-auto" />
          </div>
          
          {/* Categories grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-brown-dark rounded-2xl overflow-hidden shadow-sm border border-gold/5">
                <Skeleton className="aspect-square w-full" />
                <div className="p-4 text-center">
                  <Skeleton className="h-4 w-20 mx-auto" />
                  <Skeleton className="h-3 w-12 mx-auto mt-1" />
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ============================================================
          POPULAR PRODUCTS SKELETON
      ============================================================ */}
      <section className="section-padding bg-gradient-to-b from-sand/30 to-ivory dark:from-brown/20 dark:to-brown">
        <Container>
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="flex-1 max-w-12 h-px bg-gold/20" />
              <Skeleton className="h-4 w-4 rounded-full" />
              <div className="flex-1 max-w-12 h-px bg-gold/20" />
            </div>
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-72 mx-auto" />
          </div>
          
          {/* Products grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-brown-dark rounded-2xl overflow-hidden shadow-sm border border-gold/5">
                <Skeleton className="aspect-[3/4] w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ============================================================
          STATS SKELETON
      ============================================================ */}
      <section className="section-padding bg-sand/30 dark:bg-brown/20">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="flex-1 max-w-12 h-px bg-gold/20" />
              <Skeleton className="h-4 w-4 rounded-full" />
              <div className="flex-1 max-w-12 h-px bg-gold/20" />
            </div>
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-72 mx-auto" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                <Skeleton className="h-8 w-20 mx-auto" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ============================================================
          WORKSHOP SKELETON
      ============================================================ */}
      <section className="section-padding bg-gradient-to-b from-ivory to-sand/30 dark:from-brown dark:to-brown/80">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
            <div className="space-y-6">
              <Skeleton className="h-6 w-32 rounded-full" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-4 w-full max-w-lg" />
              <Skeleton className="h-4 w-2/3 max-w-lg" />
              <div className="space-y-4 mt-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ============================================================
          TESTIMONIALS SKELETON
      ============================================================ */}
      <section className="section-padding bg-sand/30 dark:bg-brown/20">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="flex-1 max-w-12 h-px bg-gold/20" />
              <Skeleton className="h-4 w-4 rounded-full" />
              <div className="flex-1 max-w-12 h-px bg-gold/20" />
            </div>
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-72 mx-auto" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-brown-dark rounded-2xl p-6 shadow-sm border border-gold/5">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-3 w-16 mt-1" />
                  </div>
                </div>
                <Skeleton className="h-4 w-24 mt-3" />
                <Skeleton className="h-12 w-full mt-2" />
                <Skeleton className="h-3 w-20 mt-2" />
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ============================================================
          NEWSLETTER SKELETON
      ============================================================ */}
      <section className="section-padding">
        <Container>
          <div className="bg-gradient-to-br from-gold/10 via-ivory to-gold/5 dark:from-gold/5 dark:via-brown-dark dark:to-gold/5 rounded-3xl p-8 md:p-12 border border-gold/10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="flex justify-center mb-4">
                <Skeleton className="h-16 w-16 rounded-full" />
              </div>
              <Skeleton className="h-8 w-48 mx-auto mb-2" />
              <Skeleton className="h-4 w-72 mx-auto mb-6" />
              <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                <Skeleton className="h-12 flex-1 rounded-full" />
                <Skeleton className="h-12 w-32 rounded-full" />
              </div>
              <Skeleton className="h-3 w-48 mx-auto mt-4" />
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}