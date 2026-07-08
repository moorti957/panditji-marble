// admin/src/components/forms/CategoryForm.tsx

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';

// ============================================================
// Form Schema
// ============================================================
export const categoryFormSchema = z.object({
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

export type CategoryFormData = z.input<typeof categoryFormSchema>;

// ============================================================
// Types
// ============================================================
interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface CategoryFormProps {
  /** Initial data for editing (optional) */
  initialData?: Partial<CategoryFormData>;
  /** All categories for parent dropdown (used to exclude self) */
  allCategories?: Category[];
  /** Current category ID (to exclude from parent options) */
  currentCategoryId?: string | null;
  /** Submit handler */
  onSubmit: (data: CategoryFormData) => void | Promise<void>;
  /** Whether the form is submitting */
  isSubmitting?: boolean;
  /** Whether the form is in edit mode */
  isEdit?: boolean;
  /** Additional className */
  className?: string;
  /** Optional onCancel handler */
  onCancel?: () => void;
}

// ============================================================
// CategoryForm Component
// ============================================================
export function CategoryForm({
  initialData,
  allCategories = [],
  currentCategoryId = null,
  onSubmit,
  isSubmitting = false,
  isEdit = false,
  className,
  onCancel,
}: CategoryFormProps) {
  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
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

  // Populate form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        slug: initialData.slug || '',
        description: initialData.description || '',
        icon: initialData.icon || '',
        image: initialData.image || '',
        parentId: initialData.parentId || null,
        displayOrder: initialData.displayOrder || 0,
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        isFeatured: initialData.isFeatured || false,
      });
    }
  }, [initialData, reset]);

  // Watch values (for conditional rendering)
  const watchIsActive = watch('isActive');

  // Build parent options, excluding the current category (to prevent self-reference)
  const parentOptions = allCategories
    .filter((cat) => cat._id !== currentCategoryId)
    .map((cat) => ({
      value: cat._id,
      label: cat.name,
    }));

  // Handle form submission
  const handleFormSubmit = (data: CategoryFormData) => {
    // Ensure parentId is null if empty string
    const processedData = {
      ...data,
      parentId: data.parentId || null,
    };
    onSubmit(processedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={cn('space-y-4', className)}>
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-brown dark:text-ivory mb-1">
          Name *
        </label>
        <Input
          {...register('name')}
          placeholder="Category name"
          className={errors.name ? 'border-red-400' : ''}
        />
        {errors.name && (
          <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-brown dark:text-ivory mb-1">
          Slug
        </label>
        <Input {...register('slug')} placeholder="auto-generated if empty" />
        <p className="text-xs text-brown-light/60 mt-1">
          Leave blank to auto-generate from name
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-brown dark:text-ivory mb-1">
          Description
        </label>
        <Textarea {...register('description')} rows={3} placeholder="Category description..." />
      </div>

      {/* Icon & Image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-brown dark:text-ivory mb-1">
            Icon (emoji)
          </label>
          <Input {...register('icon')} placeholder="e.g., 🐘" />
        </div>
        <div>
          <label className="block text-sm font-medium text-brown dark:text-ivory mb-1">
            Image URL
          </label>
          <Input {...register('image')} placeholder="https://..." />
        </div>
      </div>

      {/* Parent Category */}
      <div>
        <label className="block text-sm font-medium text-brown dark:text-ivory mb-1">
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

      {/* Display Order */}
      <div>
        <label className="block text-sm font-medium text-brown dark:text-ivory mb-1">
          Display Order
        </label>
        <Input
          {...register('displayOrder', { valueAsNumber: true })}
          type="number"
          placeholder="0"
        />
        <p className="text-xs text-brown-light/60 mt-1">
          Lower numbers appear first
        </p>
      </div>

      {/* Flags */}
      <div className="flex items-center gap-6 pt-2">
        <Checkbox
          {...register('isActive')}
          label="Active"
          checked={watchIsActive}
        />
        <Checkbox
          {...register('isFeatured')}
          label="Featured"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gold/10 dark:border-gold/5">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-full border border-gold/20 text-brown-light hover:bg-gold/10 transition-colors"
          >
            Cancel
          </button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="btn-gold px-6 py-2 text-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Saving...
            </>
          ) : isEdit ? (
            'Update Category'
          ) : (
            'Create Category'
          )}
        </Button>
      </div>
    </form>
  );
}

export default CategoryForm;