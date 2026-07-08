// admin/src/app/products/page.tsx

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Package,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  Image as ImageIcon,
} from 'lucide-react';

import { adminApi } from '@/services/adminApi';
import { formatPrice, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GlassCard } from '@/components/ui/GlassCard';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

// ============================================================
// Types
// ============================================================
interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  category: { name: string; id: string };
  inStock: boolean;
  stockQuantity: number;
  createdAt: string;
  isFeatured: boolean;
  isNew: boolean;
}

// ============================================================
// Products Page
// ============================================================
export default function ProductsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterInStock, setFilterInStock] = useState<'all' | 'in-stock' | 'out-of-stock'>('all');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch products with filters
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'products', currentPage, limit, sortBy, sortOrder, searchQuery, filterInStock],
    queryFn: () =>
      adminApi.getProducts({
        page: currentPage,
        limit,
        sortBy,
        sortOrder,
        search: searchQuery || undefined,
        inStock: filterInStock === 'all' ? undefined : filterInStock === 'in-stock',
      }),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (productId: string) => adminApi.deleteProduct(productId),
    onSuccess: () => {
      toast.success('Product deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete product');
    },
  });

  const handleDelete = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete.id);
    }
  };

  // Handle sort change
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Status badge
 const StatusBadge = ({ inStock }: { inStock: boolean }) => {
  return inStock ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-600 text-white">
      <CheckCircle className="w-3 h-3 text-white" />
      In Stock
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-600 text-white">
      <XCircle className="w-3 h-3 text-white" />
      Out of Stock
    </span>
  );
};

  // Loading skeleton
  if (isLoading && !data) {
    return <ProductsSkeleton />;
  }

  const products = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-cinzel text-2xl md:text-3xl font-bold text-black dark:text-black">
            Products
          </h1>
          <p className="text-black dark:text-black text-sm">
            Manage your product catalog
          </p>
        </div>
        <Link href="/products/create" className="btn-gold inline-flex items-center gap-2 text-sm px-4 py-2.5">
          <Plus className="w-4 h-4" />
          Add New Product
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-light/50" />
          <Input
            type="text"
            placeholder="Search products by name, category..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 pr-4 py-2.5 bg-white dark:bg-brown-dark border-gold/10 rounded-full"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterInStock}
            onChange={(e) => {
              setFilterInStock(e.target.value as any);
              setCurrentPage(1);
            }}
            className="px-3 py-2.5 rounded-xl border border-gold/10 bg-white dark:bg-brown-dark text-black dark:text-black text-sm focus:outline-none focus:ring-2 focus:ring-gold/20"
          >
            <option value="all">All Stock</option>
            <option value="in-stock">In Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-xl border border-gold/10 hover:bg-gold/10 transition-colors"
          >
            <Filter className="w-4 h-4 text-brown-light dark:text-ivory/50" />
          </button>
        </div>
      </div>

      {/* Products Table */}
      <GlassCard variant="default" padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold/10 dark:border-gold/5 bg-sand/30 dark:bg-brown/30">
                <th className="text-left py-3 px-4 font-medium text-brown-light dark:text-ivory/50 text-xs uppercase tracking-wider">
                  Product
                </th>
                <th
                  className="text-left py-3 px-4 font-medium text-brown-light dark:text-ivory/50 text-xs uppercase tracking-wider cursor-pointer hover:text-gold-dark transition-colors"
                  onClick={() => handleSort('price')}
                >
                  Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="text-left py-3 px-4 font-medium text-brown-light dark:text-ivory/50 text-xs uppercase tracking-wider cursor-pointer hover:text-gold-dark transition-colors"
                  onClick={() => handleSort('stockQuantity')}
                >
                  Stock {sortBy === 'stockQuantity' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-left py-3 px-4 font-medium text-brown-light dark:text-ivory/50 text-xs uppercase tracking-wider">
                  Category
                </th>
                <th className="text-left py-3 px-4 font-medium text-brown-light dark:text-ivory/50 text-xs uppercase tracking-wider">
                  Status
                </th>
                <th
                  className="text-left py-3 px-4 font-medium text-brown-light dark:text-ivory/50 text-xs uppercase tracking-wider cursor-pointer hover:text-gold-dark transition-colors"
                  onClick={() => handleSort('createdAt')}
                >
                  Added {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-right py-3 px-4 font-medium text-brown-light dark:text-ivory/50 text-xs uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-brown-light dark:text-ivory/40">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No products found</p>
                    <Link href="/products/create" className="text-gold-dark hover:text-gold text-sm mt-2 inline-block">
                      Create your first product
                    </Link>
                  </td>
                </tr>
              ) : (
                products.map((product: Product) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-b border-gold/5 dark:border-gold/5 hover:bg-gold/5 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-sand dark:bg-brown overflow-hidden flex-shrink-0">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-brown-light/30">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/products/${product.id}`}
                           className="font-medium text-gray-900 dark:text-gray-900 hover:text-gold-dark transition-colors"
                          >
                            {product.name}
                          </Link>
                          {product.isFeatured && (
                            <span className="ml-2 text-[10px] font-medium text-gold-dark bg-gold/10 px-1.5 py-0.5 rounded">
                              Featured
                            </span>
                          )}
                          {product.isNew && (
                            <span className="ml-1 text-[10px] font-medium text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">
                              New
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-cinzel text-gold-dark dark:text-gold">
                      ₹{formatPrice(product.price)}
                    </td>
                    <td className="py-3 px-4 text-black dark:text-black">
                      {product.stockQuantity ?? 0}
                    </td>
                    <td className="py-3 px-4 text-black dark:text-black">
                      {product.category?.name || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge inStock={product.inStock} />
                    </td>
                    <td className="py-3 px-4 text-xs text-black dark:text-black">
                      {formatDate(product.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/products/${product.id}`}
                          className="p-1.5 rounded-lg hover:bg-gold/10 transition-colors text-brown-light hover:text-gold-dark"
                          aria-label="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-brown-light hover:text-red-500"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gold/10 dark:border-gold/5">
            <p className="text-xs text-brown-light dark:text-ivory/50">
              Showing {(currentPage - 1) * limit + 1} to{' '}
              {Math.min(currentPage * limit, total)} of {total} products
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gold/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-brown-light dark:text-ivory/50">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gold/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

// ============================================================
// Products Skeleton
// ============================================================
function ProductsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-40 bg-sand/50 dark:bg-brown/50 rounded animate-pulse" />
          <div className="h-4 w-48 bg-sand/30 dark:bg-brown/30 rounded animate-pulse mt-1" />
        </div>
        <div className="h-10 w-36 bg-sand/50 dark:bg-brown/50 rounded-lg animate-pulse" />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 h-11 bg-sand/50 dark:bg-brown/50 rounded-full animate-pulse" />
        <div className="h-11 w-32 bg-sand/50 dark:bg-brown/50 rounded-xl animate-pulse" />
      </div>

      <div className="bg-white dark:bg-brown-dark rounded-2xl border border-gold/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold/10 dark:border-gold/5">
                {Array.from({ length: 7 }).map((_, i) => (
                  <th key={i} className="py-3 px-4">
                    <div className="h-3 w-16 bg-sand/50 dark:bg-brown/50 rounded animate-pulse" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gold/5 dark:border-gold/5">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-sand/50 dark:bg-brown/50 rounded-lg animate-pulse" />
                      <div className="h-4 w-24 bg-sand/50 dark:bg-brown/50 rounded animate-pulse" />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-16 bg-sand/50 dark:bg-brown/50 rounded animate-pulse" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-12 bg-sand/50 dark:bg-brown/50 rounded animate-pulse" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-20 bg-sand/50 dark:bg-brown/50 rounded animate-pulse" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-6 w-20 bg-sand/50 dark:bg-brown/50 rounded-full animate-pulse" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-24 bg-sand/50 dark:bg-brown/50 rounded animate-pulse" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <div className="w-8 h-8 bg-sand/50 dark:bg-brown/50 rounded-lg animate-pulse" />
                      <div className="w-8 h-8 bg-sand/50 dark:bg-brown/50 rounded-lg animate-pulse" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
