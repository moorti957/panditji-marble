// frontend/src/features/categories/hooks/useCategories.ts

import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { categoriesApi } from '@/features/categories/api/categoriesApi';
import type { Category, CategoryFilters, CategoryListResponse } from '@/features/categories/types/category.types';

// ============================================================
// Query Keys
// ============================================================
export const categoryQueryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryQueryKeys.all, 'list'] as const,
  list: (filters: CategoryFilters) => [...categoryQueryKeys.lists(), filters] as const,
  details: () => [...categoryQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryQueryKeys.details(), id] as const,
  detailBySlug: (slug: string) => [...categoryQueryKeys.all, 'slug', slug] as const,
  featured: () => [...categoryQueryKeys.all, 'featured'] as const,
  tree: () => [...categoryQueryKeys.all, 'tree'] as const,
};

// ============================================================
// useCategories Hook
// ============================================================
export interface UseCategoriesOptions {
  /**
   * Filter, sort, and pagination options
   */
  filters?: CategoryFilters;
  /**
   * Enable/disable the query
   * @default true
   */
  enabled?: boolean;
  /**
   * Stale time in milliseconds
   * @default 5 * 60 * 1000 (5 minutes)
   */
  staleTime?: number;
  /**
   * Cache time in milliseconds
   * @default 10 * 60 * 1000 (10 minutes)
   */
  gcTime?: number;
  /**
   * Whether to refetch on window focus
   * @default true
   */
  refetchOnWindowFocus?: boolean;
}

export type UseCategoriesReturn = UseQueryResult<CategoryListResponse, Error> & {
  /**
   * Categories from the response
   */
  categories: Category[];
  /**
   * Total number of categories
   */
  total: number;
  /**
   * Whether the data is loading
   */
  isLoadingCategories: boolean;
  /**
   * Whether the data is fetching
   */
  isFetchingCategories: boolean;
};

/**
 * Hook for fetching categories with optional filters
 * 
 * @example
 * ```tsx
 * const { categories, isLoadingCategories } = useCategories({
 *   filters: { parentId: '123' },
 *   staleTime: 10 * 60 * 1000,
 * });
 * ```
 */
export function useCategories(options: UseCategoriesOptions = {}): UseCategoriesReturn {
  const {
    filters = {},
    enabled = true,
    staleTime = 5 * 60 * 1000,
    gcTime = 10 * 60 * 1000,
    refetchOnWindowFocus = true,
  } = options;

  const query = useQuery<CategoryListResponse, Error>({
    queryKey: categoryQueryKeys.list(filters),
    queryFn: () => categoriesApi.getCategories(filters),
    enabled,
    staleTime,
    gcTime,
    refetchOnWindowFocus,
  });

  const { data, isLoading, isFetching } = query;

  return {
    ...query,
    categories: data?.categories || [],
    total: data?.total || 0,
    isLoadingCategories: isLoading,
    isFetchingCategories: isFetching,
  };
}

// ============================================================
// useCategory Hook
// ============================================================
export interface UseCategoryOptions extends Omit<UseQueryOptions<Category, Error>, 'queryKey' | 'queryFn'> {
  /**
   * Category ID or slug
   */
  id?: string;
  /**
   * Category slug (alternative to ID)
   */
  slug?: string;
  /**
   * Enable/disable the query
   * @default true
   */
  enabled?: boolean;
}

export type UseCategoryReturn = UseQueryResult<Category, Error> & {
  /**
   * The category data
   */
  category: Category | undefined;
  /**
   * Whether the category is loading
   */
  isLoadingCategory: boolean;
  /**
   * Whether the category is fetching
   */
  isFetchingCategory: boolean;
};

/**
 * Hook for fetching a single category by ID or slug
 * 
 * @example
 * ```tsx
 * const { category, isLoadingCategory } = useCategory({ slug: 'ganesh' });
 * ```
 */
export function useCategory(options: UseCategoryOptions = {}): UseCategoryReturn {
  const {
    id,
    slug,
    enabled = true,
    staleTime = 5 * 60 * 1000,
    gcTime = 10 * 60 * 1000,
    ...rest
  } = options;

  const isEnabled = enabled && !!(id || slug);

  let queryKey;
  let queryFn;

  if (slug) {
    queryKey = categoryQueryKeys.detailBySlug(slug);
    queryFn = () => categoriesApi.getCategoryBySlug(slug);
  } else if (id) {
    queryKey = categoryQueryKeys.detail(id);
    queryFn = () => categoriesApi.getCategoryById(id);
  } else {
    queryKey = ['categories', 'detail', 'invalid'] as const;
    queryFn = async () => { throw new Error('Either id or slug must be provided'); };
  }

  const query = useQuery<Category, Error>({
    queryKey,
    queryFn,
    enabled: isEnabled,
    staleTime,
    gcTime,
    retry: 2,
    ...rest,
  });

  const { data, isLoading, isFetching } = query;

  return {
    ...query,
    category: data,
    isLoadingCategory: isLoading,
    isFetchingCategory: isFetching,
  };
}

// ============================================================
// useFeaturedCategories Hook
// ============================================================
export interface UseFeaturedCategoriesOptions {
  /**
   * Number of featured categories to fetch
   * @default 6
   */
  limit?: number;
  /**
   * Enable/disable the query
   * @default true
   */
  enabled?: boolean;
  /**
   * Stale time in milliseconds
   * @default 10 * 60 * 1000 (10 minutes)
   */
  staleTime?: number;
}

export type UseFeaturedCategoriesReturn = UseQueryResult<Category[], Error> & {
  /**
   * Featured categories
   */
  featuredCategories: Category[];
  /**
   * Whether the data is loading
   */
  isLoadingFeatured: boolean;
};

/**
 * Hook for fetching featured categories
 * 
 * @example
 * ```tsx
 * const { featuredCategories, isLoadingFeatured } = useFeaturedCategories({ limit: 8 });
 * ```
 */
export function useFeaturedCategories(options: UseFeaturedCategoriesOptions = {}): UseFeaturedCategoriesReturn {
  const {
    limit = 6,
    enabled = true,
    staleTime = 10 * 60 * 1000,
  } = options;

  const query = useQuery<Category[], Error>({
    queryKey: categoryQueryKeys.featured(),
    queryFn: () => categoriesApi.getFeaturedCategories(limit),
    enabled,
    staleTime,
    gcTime: 15 * 60 * 1000,
  });

  const { data, isLoading, isFetching } = query;

  return {
    ...query,
    featuredCategories: data || [],
    isLoadingFeatured: isLoading || isFetching,
  };
}

// ============================================================
// useCategoryTree Hook
// ============================================================
export interface UseCategoryTreeOptions {
  /**
   * Enable/disable the query
   * @default true
   */
  enabled?: boolean;
  /**
   * Stale time in milliseconds
   * @default 10 * 60 * 1000 (10 minutes)
   */
  staleTime?: number;
}

export type UseCategoryTreeReturn = UseQueryResult<Category[], Error> & {
  /**
   * Category tree (hierarchical structure)
   */
  categoryTree: Category[];
  /**
   * Whether the data is loading
   */
  isLoadingTree: boolean;
};

/**
 * Hook for fetching the category tree (nested categories)
 * 
 * @example
 * ```tsx
 * const { categoryTree, isLoadingTree } = useCategoryTree();
 * ```
 */
export function useCategoryTree(options: UseCategoryTreeOptions = {}): UseCategoryTreeReturn {
  const {
    enabled = true,
    staleTime = 10 * 60 * 1000,
  } = options;

  const query = useQuery<Category[], Error>({
    queryKey: categoryQueryKeys.tree(),
    queryFn: () => categoriesApi.getCategoryTree(),
    enabled,
    staleTime,
    gcTime: 15 * 60 * 1000,
  });

  const { data, isLoading, isFetching } = query;

  return {
    ...query,
    categoryTree: data || [],
    isLoadingTree: isLoading || isFetching,
  };
}

// ============================================================
// useCategoryProducts – Fetch products in a category
// ============================================================
export interface UseCategoryProductsOptions {
  /**
   * Category ID or slug
   */
  id?: string;
  /**
   * Category slug (alternative to ID)
   */
  slug?: string;
  /**
   * Number of products to fetch
   * @default 12
   */
  limit?: number;
  /**
   * Page number
   * @default 1
   */
  page?: number;
  /**
   * Enable/disable the query
   * @default true
   */
  enabled?: boolean;
}

export interface UseCategoryProductsReturn {
  /**
   * Products in the category
   */
  products: any[];
  /**
   * Total number of products
   */
  total: number;
  /**
   * Whether the data is loading
   */
  isLoadingProducts: boolean;
  /**
   * Error object if any
   */
  error: Error | null;
  /**
   * Refetch function
   */
  refetch: () => void;
}

/**
 * Hook for fetching products in a specific category
 * 
 * @example
 * ```tsx
 * const { products, isLoadingProducts } = useCategoryProducts({ slug: 'ganesh' });
 * ```
 */
export function useCategoryProducts(options: UseCategoryProductsOptions = {}) {
  const {
    id,
    slug,
    limit = 12,
    page = 1,
    enabled = true,
  } = options;

  const isEnabled = enabled && !!(id || slug);

  const query = useQuery({
    queryKey: ['categories', 'products', id || slug, page, limit],
    queryFn: async () => {
      if (slug) {
        return categoriesApi.getCategoryProductsBySlug(slug, page, limit);
      }
      if (id) {
        return categoriesApi.getCategoryProductsById(id, page, limit);
      }
      throw new Error('Either id or slug must be provided');
    },
    enabled: isEnabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data, isLoading, isFetching, error, refetch } = query;

  return {
    products: data?.products || [],
    total: data?.total || 0,
    isLoadingProducts: isLoading || isFetching,
    error,
    refetch,
  };
}

// ============================================================
// Prefetch functions (for server-side rendering)
// ============================================================

/**
 * Prefetch categories for server-side rendering
 */
export async function prefetchCategories(
  queryClient: any,
  filters?: CategoryFilters
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: categoryQueryKeys.list(filters || {}),
    queryFn: () => categoriesApi.getCategories(filters || {}),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Prefetch a single category by slug for SSR
 */
export async function prefetchCategoryBySlug(
  queryClient: any,
  slug: string
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: categoryQueryKeys.detailBySlug(slug),
    queryFn: () => categoriesApi.getCategoryBySlug(slug),
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Find a category by ID in a category tree
 */
export function findCategoryById(categories: Category[], id: string): Category | null {
  for (const category of categories) {
    if (category.id === id) return category;
    if (category.children) {
      const found = findCategoryById(category.children, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Find a category by slug in a category tree
 */
export function findCategoryBySlug(categories: Category[], slug: string): Category | null {
  for (const category of categories) {
    if (category.slug === slug) return category;
    if (category.children) {
      const found = findCategoryBySlug(category.children, slug);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Get all category IDs from a category tree
 */
export function getAllCategoryIds(categories: Category[]): string[] {
  const ids: string[] = [];
  for (const category of categories) {
    ids.push(category.id);
    if (category.children) {
      ids.push(...getAllCategoryIds(category.children));
    }
  }
  return ids;
}

/**
 * Get all category slugs from a category tree
 */
export function getAllCategorySlugs(categories: Category[]): string[] {
  const slugs: string[] = [];
  for (const category of categories) {
    slugs.push(category.slug);
    if (category.children) {
      slugs.push(...getAllCategorySlugs(category.children));
    }
  }
  return slugs;
}

/**
 * Get parent category path (breadcrumb) for a category
 */
export function getCategoryPath(categories: Category[], targetId: string): Category[] {
  const path: Category[] = [];
  
  const findPath = (items: Category[], target: string): boolean => {
    for (const item of items) {
      path.push(item);
      if (item.id === target) return true;
      if (item.children && findPath(item.children, target)) return true;
      path.pop();
    }
    return false;
  };

  findPath(categories, targetId);
  return path;
}

/**
 * Get child categories by parent ID
 */
export function getChildCategories(categories: Category[], parentId: string): Category[] {
  const parent = findCategoryById(categories, parentId);
  return parent?.children || [];
}

/**
 * Check if a category has children
 */
export function hasChildren(category: Category): boolean {
  return !!(category.children && category.children.length > 0);
}

// ============================================================
// Default export
// ============================================================
export default useCategories;