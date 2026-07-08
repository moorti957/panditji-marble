// frontend/src/providers/ReactQueryProvider.tsx

'use client';

import { useState, ReactNode } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { toast } from 'react-hot-toast';

// ============================================================
// Types
// ============================================================

interface ReactQueryProviderProps {
  children: ReactNode;
}

// ============================================================
// Error handling helpers
// ============================================================

/**
 * Extract a user-friendly error message from an unknown error
 */
const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return (error as { message: string }).message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Determine if an error is a network error (should retry)
 */
const isNetworkError = (error: unknown): boolean => {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const err = error as { code?: string };
    return err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED';
  }
  return false;
};

/**
 * Determine if an error is a 401 Unauthorized (should not retry)
 */
const isUnauthorized = (error: unknown): boolean => {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const err = error as { status?: number };
    return err.status === 401;
  }
  return false;
};

// ============================================================
// ReactQueryProvider Component
// ============================================================

export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  // Create a new QueryClient instance per client to ensure isolation
  const [queryClient] = useState(
    () =>
      new QueryClient({
        // Default query options
        defaultOptions: {
          queries: {
            // Stale time: data is considered fresh for 5 minutes
            staleTime: 5 * 60 * 1000,
            // Garbage collection time: unused data is cleared after 10 minutes
            gcTime: 10 * 60 * 1000,
            // Retry failed queries up to 2 times
            retry: (failureCount, error) => {
              // Don't retry on 401 Unauthorized
              if (isUnauthorized(error)) {
                return false;
              }
              // Retry network errors up to 3 times
              if (isNetworkError(error)) {
                return failureCount < 3;
              }
              // For other errors, retry up to 2 times
              return failureCount < 2;
            },
            // Retry delay: exponential backoff starting at 1 second
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Refetch on window focus for fresh data (e.g., when user returns to tab)
            refetchOnWindowFocus: true,
            // Refetch on reconnect (network comes back)
            refetchOnReconnect: true,
            // Refetch on mount (when component mounts)
            refetchOnMount: true,
            // Note: `suspense` and `useErrorBoundary` were removed as default
            // query options in React Query v5 (suspense is opt-in per query via
            // `useSuspenseQuery`, and `useErrorBoundary` was replaced by
            // `throwOnError`). We don't use suspense or error boundaries here —
            // errors are surfaced via the QueryCache/MutationCache `onError`
            // toast handlers below, so no v5 equivalent option is needed.
          },
          mutations: {
            // Retry mutations up to 1 time (network errors only)
            retry: (failureCount, error) => {
              if (isNetworkError(error)) {
                return failureCount < 1;
              }
              return false;
            },
            // Retry delay for mutations
            retryDelay: 1000,
          },
        },
        // Global query cache configuration
        queryCache: new QueryCache({
          onError: (error, query) => {
            // Only show a toast for query errors that are not 401
            if (!isUnauthorized(error)) {
              const message = getErrorMessage(error);
              toast.error(`Failed to load data: ${message}`);
            }
            // 401 errors will be handled by the auth store interceptor
          },
        }),
        // Global mutation cache configuration
        mutationCache: new MutationCache({
          onError: (error, variables, context, mutation) => {
            // Show a toast for mutation errors (unless it's a 401)
            if (!isUnauthorized(error)) {
              const message = getErrorMessage(error);
              toast.error(`Operation failed: ${message}`);
            }
          },
          onSuccess: (data, variables, context, mutation) => {
            // Optional: you can show success toasts here for specific mutations
            // This is a catch-all; individual mutations can override
          },
        }),
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* React Query Devtools - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-left"
          position="right"
        />
      )}
    </QueryClientProvider>
  );
}

// ============================================================
// Export the query client factory for use in other files (prefetching)
// ============================================================

/**
 * Create a QueryClient instance for server-side prefetching.
 * This can be used in server components or getServerSideProps.
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 0, // Don't retry on the server
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
      },
    },
  });
}

// ============================================================
// Default export
// ============================================================

export default ReactQueryProvider;