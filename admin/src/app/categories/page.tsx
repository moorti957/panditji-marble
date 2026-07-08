// admin/src/app/categories/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  FolderTree,
  ImageIcon,
  Loader2,
  Check,
  ArrowUpDown,
} from 'lucide-react';

import { adminApi } from '@/services/adminApi';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { GlassCard } from '@/components/ui/GlassCard';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';

// ============================================================
// Form Schema
// ============================================================
const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  slug: z.string().optional(),
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
  image: z.string().optional(),
  parentId: z.string().nullable().optional(),
  displayOrder: z.number().min(0).default(0),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

type CategoryFormData = z.input<typeof categorySchema>;

// ============================================================
// Categories Page
// ============================================================
export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch categories
  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'categories', currentPage, limit, searchQuery],
    queryFn: () =>
      adminApi.getCategories({
        page: currentPage,
        limit,
        search: searchQuery || undefined,
      }),
  });

  // Fetch all categories for parent dropdown (including inactive for selection)
  const { data: allCategoriesData } = useQuery({
    queryKey: ['admin', 'categories', 'all'],
    queryFn: () => adminApi.getCategories({ limit: 999 }),
  });

  const categories = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 0;
  const allCategories = allCategoriesData?.data || [];

  // Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      icon: '',
      image: '',
      parentId: null,
      displayOrder: 0,
      isActive: true,
      isFeatured: false,
    },
  });

  // Reset form when modal opens for editing
  useEffect(() => {
    if (editingCategory) {
      reset({
        name: editingCategory.name || '',
        slug: editingCategory.slug || '',
        description: editingCategory.description || '',
        icon: editingCategory.icon || '',
        image: editingCategory.image || '',
        parentId: editingCategory.parentId || null,
        displayOrder: editingCategory.displayOrder || 0,
        isActive: editingCategory.isActive !== undefined ? editingCategory.isActive : true,
        isFeatured: editingCategory.isFeatured || false,
      });
    } else {
      reset({
        name: '',
        slug: '',
        description: '',
        icon: '',
        image: '',
        parentId: null,
        displayOrder: 0,
        isActive: true,
        isFeatured: false,
      });
    }
  }, [editingCategory, reset]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CategoryFormData) => adminApi.createCategory(data),
    onSuccess: () => {
      toast.success('Category created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create category');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryFormData }) =>
      adminApi.updateCategory(id, data),
    onSuccess: () => {
      toast.success('Category updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update category');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteCategory(id),
    onSuccess: () => {
      toast.success('Category deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete category');
    },
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    reset();
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category: any) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const onSubmit = (data: CategoryFormData) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (category: any) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      deleteMutation.mutate(categoryToDelete._id);
    }
  };

  // Build parent options (excluding self and children to prevent circular)
  const parentOptions = allCategories
    .filter((c: any) => c._id !== editingCategory?._id)
    .map((c: any) => ({
      value: c._id,
      label: c.name,
    }));

  // Loading skeleton
  if (isLoading && !data) {
    return <CategoriesSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-cinzel text-2xl md:text-3xl font-bold text-black dark:text-black">
            Categories
          </h1>
          <p className="text-gray-900 dark:text-gray-900 text-sm">
            Manage your product categories
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-gold inline-flex items-center gap-2 text-sm px-4 py-2.5"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-light/50" />
        <Input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="pl-9 pr-4 py-2.5 bg-white dark:bg-brown-dark border-gold/10 rounded-full"
        />
      </div>

      {/* Categories Table */}
      <GlassCard variant="default" padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold/10 dark:border-gold/5 bg-sand/30 dark:bg-brown/30">
                <th className="text-left py-3 px-4 font-medium text-brown-light dark:text-ivory/50 text-xs uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left py-3 px-4 font-medium text-brown-light dark:text-ivory/50 text-xs uppercase tracking-wider">
                  Slug
                </th>
                <th className="text-left py-3 px-4 font-medium text-brown-light dark:text-ivory/50 text-xs uppercase tracking-wider">
                  Parent
                </th>
                <th className="text-center py-3 px-4 font-medium text-brown-light dark:text-ivory/50 text-xs uppercase tracking-wider">
                  Featured
                </th>
                <th className="text-center py-3 px-4 font-medium text-brown-light dark:text-ivory/50 text-xs uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-brown-light dark:text-ivory/50 text-xs uppercase tracking-wider">
                  Created
                </th>
                <th className="text-right py-3 px-4 font-medium text-brown-light dark:text-ivory/50 text-xs uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-brown-light dark:text-ivory/40">
                    <FolderTree className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No categories found</p>
                    <button
                      onClick={openCreateModal}
                      className="text-gold-dark hover:text-gold text-sm mt-2 inline-block"
                    >
                      Create your first category
                    </button>
                  </td>
                </tr>
              ) : (
  categories.map((category: any) => {
    const parent = allCategories.find((c: any) => c._id === category.parentId);

    return (
      <tr
        key={category._id}
        className="border-b border-gold/5 dark:border-gold/5 hover:bg-gold/5 transition-colors"
      >
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            {category.icon && <span className="text-lg">{category.icon}</span>}
            <span className="font-medium text-black dark:text-black">
              {category.name}
            </span>
          </div>
        </td>

        <td className="py-3 px-4 text-black dark:text-black text-xs">
          {category.slug}
        </td>

        <td className="py-3 px-4 text-black dark:text-black">
          {parent?.name || '-'}
        </td>

        <td className="py-3 px-4 text-center">
          {category.isFeatured ? (
            <Check className="w-4 h-4 text-gold mx-auto" />
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </td>

        <td className="py-3 px-4 text-center">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
              category.isActive
                ? 'bg-green-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            {category.isActive ? 'Active' : 'Inactive'}
          </span>
        </td>

        <td className="py-3 px-4 text-xs text-black dark:text-black">
          {formatDate(category.createdAt)}
        </td>

        <td className="py-3 px-4 text-right">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => openEditModal(category)}
              className="p-1.5 rounded-lg hover:bg-gold/10 transition-colors text-black dark:text-black hover:text-gold-dark"
              aria-label="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleDelete(category)}
              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-black dark:text-black hover:text-red-500"
              aria-label="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  })
)}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gold/10 dark:border-gold/5">
            <p className="text-xs text-brown-light dark:text-ivory/50">
              Showing {(currentPage - 1) * limit + 1} to{' '}
              {Math.min(currentPage * limit, total)} of {total} categories
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

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-900 mb-1">
              Name *
            </label>
            <Input
              {...register('name')}
              placeholder="Category name"
              className={errors.name ? 'border-red-400' : ''}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-900 mb-1">
              Slug
            </label>
            <Input {...register('slug')} placeholder="auto-generated if empty" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-900 mb-1">
              Description
            </label>
            <Textarea {...register('description')} rows={3} placeholder="Category description..." />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-900 mb-1">
                Icon (emoji)
              </label>
              <Input {...register('icon')} placeholder="e.g., 🐘" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-900 mb-1">
                Image URL
              </label>
              <Input {...register('image')} placeholder="https://..." />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-900 mb-1">
              Parent Category
            </label>
            <Select
              {...register('parentId')}
              options={[
                { value: '', label: 'None (Root Category)' },
                ...parentOptions,
              ]}
              placeholder="Select parent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-900 mb-1">
                Display Order
              </label>
              <Input
                {...register('displayOrder', { valueAsNumber: true })}
                type="number"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-900 cursor-pointer">
              <input
                type="checkbox"
                {...register('isActive')}
                className="accent-gold w-4 h-4"
              />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-900 cursor-pointer">
              <input
                type="checkbox"
                {...register('isFeatured')}
                className="accent-gold w-4 h-4"
              />
              Featured
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gold/10 dark:border-gold/5">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 rounded-full border border-gold/20 text-brown-light hover:bg-gold/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
              className="btn-gold px-6 py-2 text-sm"
            >
              {isSubmitting || createMutation.isPending || updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : editingCategory ? (
                'Update Category'
              ) : (
                'Create Category'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setCategoryToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"? This will also remove all products under this category.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

// ============================================================
// Categories Skeleton
// ============================================================
function CategoriesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-40 bg-sand/50 dark:bg-brown/50 rounded animate-pulse" />
          <div className="h-4 w-48 bg-sand/30 dark:bg-brown/30 rounded animate-pulse mt-1" />
        </div>
        <div className="h-10 w-36 bg-sand/50 dark:bg-brown/50 rounded-lg animate-pulse" />
      </div>

      <div className="h-11 max-w-sm bg-sand/50 dark:bg-brown/50 rounded-full animate-pulse" />

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
                      <div className="h-4 w-4 bg-sand/50 dark:bg-brown/50 rounded animate-pulse" />
                      <div className="h-4 w-24 bg-sand/50 dark:bg-brown/50 rounded animate-pulse" />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-20 bg-sand/50 dark:bg-brown/50 rounded animate-pulse" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-16 bg-sand/50 dark:bg-brown/50 rounded animate-pulse" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="h-4 w-4 bg-sand/50 dark:bg-brown/50 rounded animate-pulse mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="h-6 w-16 bg-sand/50 dark:bg-brown/50 rounded-full animate-pulse mx-auto" />
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