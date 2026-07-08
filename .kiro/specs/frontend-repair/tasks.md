# Implementation Plan

- [x] 1. Baseline capture and structural fixes
  - Run `npx tsc --noEmit`, `npx eslint .`, and `npm run build` in `frontend/` and record all current errors grouped by file/category.
  - Consolidate `next.config.js` and `next.config.ts` into a single valid Next 16 config file, preserving `images` and `reactStrictMode` settings; delete the redundant file.
  - Verify `tailwind.config.js`, `postcss.config.mjs`, and `tailwindcss-animate` plugin compatibility with Tailwind 4; fix any invalid config syntax.
  - _Requirements: 1.1, 4.1, 6.3, 7.3_

- [x] 2. Repair shared primitives (lib, types, constants, services, store, hooks)
  - Fix TypeScript/import errors in `src/lib/utils.ts`, `src/types/index.ts`, `src/constants/colors.ts`, `src/constants/routes.ts`.
  - Fix TypeScript/import errors in `src/services/apiClient.ts`, `src/services/product.service.ts`, `src/store/rootStore.ts`.
  - Fix TypeScript/import errors in `src/hooks/useMediaQuery.ts`, `src/hooks/useScroll.ts`.
  - Re-run `npx tsc --noEmit` scoped to these files and confirm no new errors introduced.
  - _Requirements: 1.1, 1.2, 1.3, 7.1_

- [x] 3. Repair UI primitives and animation components
  - Fix TypeScript/React 19/Framer Motion errors in `src/components/ui/*` (Button, Checkbox, Container, GlassCard, Input, SectionTitle, Select, Skeleton, Slider).
  - Fix TypeScript/React 19/Framer Motion errors in `src/components/animations/*` (MagneticButton, ParallaxImage, ScrollReveal), including the `as`-prop/ref-forwarding typing in `MagneticButton`.
  - Preserve all animation timing, easing, and visual/responsive Tailwind classes exactly.
  - Re-run `npx tsc --noEmit` and `npx eslint .` scoped to these directories.
  - _Requirements: 1.1, 1.2, 5.2, 6.1, 6.4, 9.1, 9.2_

- [x] 4. Repair composite components
  - Fix errors in `src/components/cards/*` (BlogCard, CategoryCard, ProductCard).
  - Fix errors in `src/components/hero/Hero.tsx`.
  - Fix errors in `src/components/layout/*` (Footer, MobileNavbar, Navbar, Sidebar).
  - Fix errors in `src/components/loaders/HomePageSkeleton.tsx`.
  - Fix errors in `src/components/modals/*` (CartDrawer, QuickViewModal).
  - Fix errors in `src/components/sections/*` (FAQAccordion, FeaturedCategories, FeaturedProducts, InstagramFeed, Newsletter, StatsSection, Testimonials, VideoSection, WorkshopSection), including any Swiper 11 usage/CSS import fixes.
  - Re-run `npx tsc --noEmit` and `npx eslint .` scoped to `src/components`.
  - _Requirements: 1.1, 1.2, 5.2, 6.4, 6.5, 7.1, 7.2, 9.1, 9.2_

- [x] 5. Repair feature modules
  - Fix errors in `src/features/auth/*` (authApi, useAuth, authStore).
  - Fix errors in `src/features/cart/*` (useCart, cartStore).
  - Fix errors in `src/features/categories/hooks/useCategories.tsx`.
  - Fix errors in `src/features/home/hooks/useHomeData.ts`.
  - Fix errors in `src/features/products/*` (productsApi, useProductDetail, useProducts, product.types).
  - Fix errors in `src/features/wishlist/store/wishlistStore.ts`.
  - Preserve all business logic behavior (cart totals, auth flows, wishlist toggling, product fetching) exactly.
  - Re-run `npx tsc --noEmit` scoped to `src/features`.
  - _Requirements: 1.1, 1.2, 9.4, 7.1_

- [ ] 6. Repair app routes and root layout
  - Fix errors in `src/app/layout.tsx`, `src/app/page.tsx`, `error.tsx`, `loading.tsx`, `not-found.tsx`.
  - Fix errors in each route folder: `(auth)/login`, `(auth)/register`, `about`, `blogs`, `blogs/[slug]`, `cart`, `categories`, `checkout`, `contact`, `faq`, `gallery`, `orders`, `privacy-policy`, `products`, `products/[slug]`, `profile`, `refund-policy`, `shipping-policy`, `terms`, `track-order`, `wishlist`.
  - For any dynamic route using `params`/`searchParams`, ensure Next 16 async API is correctly awaited.
  - Confirm metadata exports and SEO fields remain intact per route.
  - Record the full list of route folders before and after to confirm no route was removed.
  - _Requirements: 1.1, 1.2, 6.2, 7.2, 8.1, 8.2, 9.3_

- [~] 7. Full verification loop
  - Run `npx tsc --noEmit` across the whole `frontend` project; fix any remaining errors.
  - Run `npx eslint .` across the whole project; fix any remaining errors.
  - Run `npm run build`; fix any remaining build/prerender errors, repeating until it exits 0.
  - Start `npm run dev` in the background, confirm "Ready" and a successful response from `/`, then stop the process.
  - _Requirements: 1.1, 2.1, 3.1, 3.2, 4.1, 4.2, 10.1, 10.2, 10.3, 10.4_

- [~] 8. Final report
  - Compile the list of all modified files with a one-line summary of the fix per file/group.
  - State final verification results for `tsc`, `eslint`, `build`, and `dev`.
  - Confirm route inventory is unchanged versus the Phase 0 baseline.
  - _Requirements: 11.1, 11.2, 11.3_
