# Design Document

## Overview

This design describes how the `frontend` Next.js 16 / React 19 / TypeScript 5 / Tailwind 4 codebase will be scanned and repaired to satisfy the requirements in `requirements.md`. The approach is a category-first, directory-scoped repair loop: fix structural/config issues first, then work outward from shared primitives (lib/utils, ui components) to features and finally app routes, re-verifying with `tsc`, `eslint`, and `next build` after each batch.

## Current State Findings (from initial scan)

- Two Next config files exist: `next.config.js` (has `images.domains`, `reactStrictMode`) and `next.config.ts` (empty). Next 16 will pick one and this is ambiguous — needs consolidation into a single `next.config.ts` (TypeScript is preferred for this project) carrying over the settings from `next.config.js`. Note: `images.domains` is deprecated in favor of `images.remotePatterns` in recent Next versions — will migrate if a build/lint warning confirms it.
- `src/app/page.tsx` is a client component (`'use client'`) that also acts as the route's page — imports GSAP/Lenis directly and registers `ScrollTrigger` at module scope guarded by `typeof window`. This pattern is generally fine but needs verification under React 19 strict mode + Next 16 (double-invoke effects in dev).
- `MagneticButton.tsx` passes `ref={containerRef}` directly to a dynamic `Component = 'div'` prop typed as `React.ElementType`. Under React 19, `ref` is a normal prop for function components created without `forwardRef`, but for arbitrary `as` components this typing needs care (`React.ElementType` doesn't guarantee `ref` support) — likely source of a TS error to verify.
- Project uses Tailwind 4 (`@tailwindcss/postcss`, `tailwindcss ^4`) plus `tailwindcss-animate` (a v3-era plugin) — need to confirm plugin compatibility with Tailwind 4's CSS-first config, since Tailwind 4 no longer uses `tailwind.config.js` `plugins` array in the same way for all plugins.
- Full file inventory to audit (frontend/src):
  - `app/`: layout.tsx, page.tsx, error.tsx, loading.tsx, not-found.tsx, globals.css, and route folders: (auth)/login, (auth)/register, about, blogs, blogs/[slug], cart, categories, checkout, contact, faq, gallery, orders, privacy-policy, products, products/[slug], profile, refund-policy, shipping-policy, terms, track-order, wishlist.
  - `components/`: animations (MagneticButton, ParallaxImage, ScrollReveal), cards (BlogCard, CategoryCard, ProductCard), forms (empty), hero (Hero), layout (Footer, MobileNavbar, Navbar, Sidebar), loaders (HomePageSkeleton), modals (CartDrawer, QuickViewModal), sections (FAQAccordion, FeaturedCategories, FeaturedProducts, InstagramFeed, Newsletter, StatsSection, Testimonials, VideoSection, WorkshopSection), ui (Button, Checkbox, Container, GlassCard, Input, SectionTitle, Select, Skeleton, Slider).
  - `constants/`: colors.ts, routes.ts.
  - `features/`: auth (api/authApi, hooks/useAuth, store/authStore), cart (hooks/useCart, store/cartStore), categories (hooks/useCategories.tsx), home (hooks/useHomeData), products (api/productsApi, hooks/useProductDetail, hooks/useProducts, types/product.types), wishlist (store/wishlistStore).
  - `hooks/`: useMediaQuery, useScroll.
  - `lib/`: utils.ts.
  - `providers/`: ReactQueryProvider, ThemeProvider.
  - `services/`: apiClient, product.service.
  - `store/`: rootStore.
  - `styles/`: globals.css.
  - `types/`: index.ts.

## Architecture of the Repair Process

```
Phase 0: Baseline capture
  → run npx tsc --noEmit, eslint, next build; save raw error lists grouped by file.

Phase 1: Structural / config fixes
  → consolidate next.config, verify tsconfig/eslint config, verify tailwind config.

Phase 2: Shared primitives
  → lib/utils, types, constants, services, store, hooks (project-wide dependencies fixed first
    so downstream component fixes aren't built on broken foundations).

Phase 3: UI + animation primitives
  → components/ui/*, components/animations/*.

Phase 4: Composite components
  → components/cards, hero, layout, loaders, modals, sections.

Phase 5: Feature modules
  → features/auth, cart, categories, home, products, wishlist.

Phase 6: App routes
  → app/layout, page, error/loading/not-found, and each route folder.

Phase 7: Full verification loop
  → re-run tsc/eslint/build/dev until all green; fix any cross-cutting regressions found.

Phase 8: Reporting
  → compile list of modified files + summaries + final verification output.
```

Each phase's fixes are re-verified with `npx tsc --noEmit` before moving to the next phase, so type errors don't compound. `next build` is run after Phase 6 and again at Phase 7 for final confirmation. `npm run dev` is smoke-tested at the end (start, confirm "Ready", request `/`, then stop the process).

## Components and Interfaces

No new components/interfaces are introduced by this spec — it is a repair effort, not a feature addition. Where a fix requires an interface adjustment (e.g. a prop type), the design principle is:

- Prefer widening/correcting types over using `any`/`@ts-ignore`.
- Preserve component public prop names and defaults exactly, unless the prop itself is the bug.
- For the `as`-prop pattern (`MagneticButton`), if a typing conflict exists between `React.ElementType` and forwarding `ref`, resolve by typing the ref as `React.Ref<HTMLElement>` passed via a `React.RefCallback` or by using `React.ComponentPropsWithRef<T>` generics — whichever preserves current runtime behavior with zero `tsc` errors.
- For Next.js 16 route handlers/pages, ensure any dynamic API (`params`, `searchParams`, `cookies()`, `headers()`) that became `Promise`-based is awaited correctly.

## Data Models

Not applicable — no data model changes. `features/*/types` and `types/index.ts` will only be touched if they contain type errors, and any change must remain structurally compatible with existing consumers.

## Error Handling

- Errors are grouped by tool (`tsc`, `eslint`, `next build` runtime/prerender errors) and by file, then fixed in the phase order above.
- For each error, the fix must not:
  - Change an exported component's name or default/named export style (breaks imports elsewhere).
  - Remove a route (page.tsx/layout.tsx) or change its file-based route path.
  - Alter animation timing/easing/trigger values unless that value itself is the error (e.g. an invalid GSAP ease name).
  - Alter Tailwind visual classes beyond what's needed to make them valid Tailwind 4 syntax.
- If an error's root cause is a missing dependency or a version mismatch, the design defers to fixing the *usage* in source code first; a `package.json` dependency change is only made if no source-level fix exists, and any such change will be flagged explicitly since dependency changes are a higher-risk action.

## Testing Strategy

This is a repair spec without new features, so testing is verification-based rather than new-unit-test-based:

1. **Type-check gate**: `npx tsc --noEmit` must return 0 errors after Phase 7.
2. **Lint gate**: `npx eslint .` must return 0 errors after Phase 7.
3. **Build gate**: `npm run build` must exit 0, including static generation of all existing routes, after Phase 6/7.
4. **Dev smoke test**: `npm run dev` started in background, confirm "Ready" log line and a successful GET of `/`, then the process is stopped.
5. **Manual route inventory check**: confirm every route folder present before the repair is still present and maps to the same URL after the repair (diff of `app/` directory tree).
6. If existing test files are found during the scan (none currently detected under `frontend/src`), they will be run as an additional gate; if no test runner is configured, one will not be introduced as part of this repair spec (out of scope — repair only).

## Reporting Format

At completion, a summary will be produced containing:
- Table/list of modified files with a one-line description of the fix.
- Final `tsc`, `eslint`, and `build` output status.
- Confirmation that route inventory is unchanged.
