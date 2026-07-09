// admin/src/components/forms/ProductForm.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import {
  Plus,
  X,
  Upload,
  Loader2,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import Image from 'next/image';

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
export const productFormSchema = z.object({
  name: z.string().min(2, 'Product name is required').max(100),
  slug: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0, 'Price must be 0 or greater'),
  originalPrice: z.number().min(0).optional(),
  category: z.string().min(1, 'Category is required'),
  material: z.string().optional(),
  marbleType: z.string().optional(),
  finish: z.string().optional(),
  colors: z.string().optional(), // comma separated
  height: z.number().min(0).optional(),
  width: z.number().min(0).optional(),
  depth: z.number().min(0).optional(),
  weight: z.number().min(0).optional(),
  inStock: z.boolean().default(true),
  stockQuantity: z.number().min(0).optional(),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  tags: z.string().optional(), // comma separated
  specifications: z
    .array(
      z.object({
        key: z.string().min(1, 'Key is required'),
        value: z.string().min(1, 'Value is required'),
        displayOrder: z.number().optional(),
      })
    )
    .optional(),
  images: z.array(z.string()).optional(),
});

export type ProductFormData = z.input<typeof productFormSchema>;

export type ProductFormSubmitData = Omit<
  ProductFormData,
  'colors' | 'tags' | 'specifications'
> & {
  colors: string[];
  tags: string[];
  specifications?: Array<{
    key: string;
    value: string;
    displayOrder?: number;
  }>;
};

// ============================================================
// Types
// ============================================================
interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface ProductFormProps {
  /** Initial data for editing (optional) */
  initialData?: Partial<ProductFormData & { images?: string[] }>;
  /** Categories for dropdown */
  categories: Category[];
  /** Submit handler */
  onSubmit: (data: ProductFormSubmitData) => void | Promise<void>;
  /** Whether the form is submitting */
  isSubmitting?: boolean;
  /** Whether the form is in edit mode */
  isEdit?: boolean;
  /** Additional className */
  className?: string;
  /** Upload handler for images */
  onUploadImages?: (files: File[]) => Promise<string[]>;
}

// ============================================================
// ProductForm Component
// ============================================================
export function ProductForm({
  initialData,
  categories,
  onSubmit,
  isSubmitting = false,
  isEdit = false,
  className,
  onUploadImages,
}: ProductFormProps) {
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form setup
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      originalPrice: 0,
      category: '',
      material: '',
      marbleType: '',
      finish: '',
      colors: '',
      height: 0,
      width: 0,
      depth: 0,
      weight: 0,
      inStock: true,
      stockQuantity: 0,
      isFeatured: false,
      isNew: false,
      tags: '',
      specifications: [{ key: '', value: '', displayOrder: 0 }],
      images: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'specifications',
  });

  // Watch values
  const watchImages = watch('images') || [];
  const watchColors = watch('colors') || '';
  const watchTags = watch('tags') || '';
  const watchInStock = watch('inStock');

  // Populate form on initialData change
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        slug: initialData.slug || '',
        description: initialData.description || '',
        price: initialData.price || 0,
        originalPrice: initialData.originalPrice || 0,
        category: initialData.category || '',
        material: initialData.material || '',
        marbleType: initialData.marbleType || '',
        finish: initialData.finish || '',
        colors: initialData.colors || '',
        height: initialData.height || 0,
        width: initialData.width || 0,
        depth: initialData.depth || 0,
        weight: initialData.weight || 0,
        inStock: initialData.inStock !== undefined ? initialData.inStock : true,
        stockQuantity: initialData.stockQuantity || 0,
        isFeatured: initialData.isFeatured || false,
        isNew: initialData.isNew || false,
        tags: initialData.tags || '',
        specifications: initialData.specifications || [{ key: '', value: '', displayOrder: 0 }],
        images: initialData.images || [],
      });
    }
  }, [initialData, reset]);

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const fileArray = Array.from(files);

      if (onUploadImages) {
        // Use custom upload handler (e.g., to Cloudinary)
        const urls = await onUploadImages(fileArray);
        const currentImages = getValues('images') || [];
        setValue('images', [...currentImages, ...urls]);
        toast.success(`${urls.length} image(s) uploaded`);
      } else {
        // Fallback: store as File objects (for local preview only)
        // In production, you'd use Cloudinary or similar
        setImageFiles((prev) => [...prev, ...fileArray]);
        const currentImages = getValues('images') || [];
        // Create object URLs for preview
        const newUrls = fileArray.map((f) => URL.createObjectURL(f));
        setValue('images', [...currentImages, ...newUrls]);
        toast.success(`${fileArray.length} image(s) added (preview only)`);
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to upload images');
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const images = getValues('images') || [];
    const newImages = images.filter((_, i) => i !== index);
    setValue('images', newImages);
    // Also remove from imageFiles if using local storage
    if (imageFiles.length > 0) {
      const newImageFiles = imageFiles.filter((_, i) => i !== index);
      setImageFiles(newImageFiles);
    }
  };

  // Transform form data before submit
  const handleFormSubmit = (data: ProductFormData) => {
    const processedData: ProductFormSubmitData = {
      ...data,
      colors: data.colors ? data.colors.split(',').map((c) => c.trim()).filter(Boolean) : [],
      tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      specifications: (data.specifications || []).filter(
        (spec) => spec.key.trim() && spec.value.trim()
      ),
    };
    onSubmit(processedData);
  };

  // Build category options
  const categoryOptions = categories.map((cat) => ({
    value: cat._id,
    label: cat.name,
  }));

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={cn('space-y-6', className)}>
      {/* Basic Information */}
      <GlassCard>
        <h3 className="font-cinzel text-lg font-semibold text-brown dark:text-ivory mb-4">
          Basic Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brown dark:text-ivory mb-1">
              Product Name *
            </label>
            <Input
              {...register('name')}
              placeholder="e.g., Ganesh Murti (Brass)"
              className={errors.name ? 'border-red-400' : ''}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-brown dark:text-ivory mb-1">
              Slug
            </label>
            <Input {...register('slug')} placeholder="e.g., ganesh-murti-brass" />
            <p className="text-xs text-brown-light/60 mt-1">
              Leave blank to auto-generate from name
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-brown dark:text-ivory mb-1">
              Description *
            </label>
            <Textarea
              {...register('description')}
              rows={6}
              placeholder="Detailed product description..."
              className={errors.description ? 'border-red-400' : ''}
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Pricing & Stock */}
      <GlassCard>
        <h3 className="font-cinzel text-lg font-semibold text-brown dark:text-ivory mb-4">
          Pricing & Stock
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brown dark:text-ivory mb-1">
              Price * ()
            </label>
            <Input
              {...register('price', { valueAsNumber: true })}
              type="number"
              step="0.01"
              placeholder="0"
              className={errors.price ? 'border-red-400' : ''}
            />
            {errors.price && (
              <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-brown dark:text-ivory mb-1">
              Original Price ()
            </label>
            <Input
              {...register('originalPrice', { valueAsNumber: true })}
              type="number"
              step="0.01"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brown dark:text-ivory mb-1">
              Stock Quantity
            </label>
            <Input
              {...register('stockQuantity', { valueAsNumber: true })}
              type="number"
              placeholder="0"
            />
          </div>
          <div className="flex items-center pt-6">
            <Checkbox
              {...register('inStock')}
              label="In Stock"
              checked={watchInStock}
            />
          </div>
        </div>
      </GlassCard>

      {/* Category & Attributes */}
      <GlassCard>
        <h3 className="font-cinzel text-lg font-semibold text-brown dark:text-ivory mb-4">
          Category & Attributes
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brown dark:text-ivory mb-1">
              Category *
            </label>
            <Select
              {...register('category')}
              options={categoryOptions}
              placeholder="Select a category"
              className={errors.category ? 'border-red-400' : ''}
            />
            {errors.category && (
              <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brown dark:text-ivory mb-1">
                Material
              </label>
              <Input {...register('material')} placeholder="e.g., Brass, Marble" />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown dark:text-ivory mb-1">
                Marble Type
              </label>
              <Input {...register('marbleType')} placeholder="e.g., Makrana, White" />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown dark:text-ivory mb-1">
                Finish
              </label>
              <Input {...register('finish')} placeholder="e.g., Polished, Matte" />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown dark:text-ivory mb-1">
                Colors (comma separated)
              </label>
              <Input
                {...register('colors')}
                placeholder="e.g., Gold, Maroon, White"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-brown dark:text-ivory mb-1">
                Height (cm)
              </label>
              <Input
                {...register('height', { valueAsNumber: true })}
                type="number"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown dark:text-ivory mb-1">
                Width (cm)
              </label>
              <Input
                {...register('width', { valueAsNumber: true })}
                type="number"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown dark:text-ivory mb-1">
                Depth (cm)
              </label>
              <Input
                {...register('depth', { valueAsNumber: true })}
                type="number"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown dark:text-ivory mb-1">
                Weight (kg)
              </label>
              <Input
                {...register('weight', { valueAsNumber: true })}
                type="number"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brown dark:text-ivory mb-1">
              Tags (comma separated)
            </label>
            <Input
              {...register('tags')}
              placeholder="e.g., ganesh, brass, murti, handcrafted"
            />
          </div>
        </div>
      </GlassCard>

      {/* Flags */}
      <GlassCard>
        <h3 className="font-cinzel text-lg font-semibold text-brown dark:text-ivory mb-4">
          Product Flags
        </h3>
        <div className="flex flex-wrap gap-6">
          <Checkbox
            {...register('isFeatured')}
            label="Featured Product"
          />
          <Checkbox
            {...register('isNew')}
            label="New Arrival"
          />
        </div>
      </GlassCard>

      {/* Specifications */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-cinzel text-lg font-semibold text-brown dark:text-ivory">
            Specifications
          </h3>
          <button
            type="button"
            onClick={() => append({ key: '', value: '', displayOrder: 0 })}
            className="inline-flex items-center gap-1.5 text-sm text-gold-dark hover:text-gold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Specification
          </button>
        </div>
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-3">
              <div className="flex-1">
                <Input
                  {...register(`specifications.${index}.key`)}
                  placeholder="Key (e.g., Material)"
                />
              </div>
              <div className="flex-1">
                <Input
                  {...register(`specifications.${index}.value`)}
                  placeholder="Value (e.g., Brass)"
                />
              </div>
              <button
                type="button"
                onClick={() => remove(index)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {fields.length === 0 && (
            <p className="text-sm text-brown-light dark:text-ivory/40 text-center py-2">
              No specifications added yet
            </p>
          )}
        </div>
      </GlassCard>

      {/* Images */}
      <GlassCard>
        <h3 className="font-cinzel text-lg font-semibold text-brown dark:text-ivory mb-4">
          Product Images
        </h3>

        <div className="mb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
            id="product-image-upload"
          />
          <label
            htmlFor="product-image-upload"
            className={`flex items-center justify-center w-full border-2 border-dashed border-gold/30 rounded-xl p-6 cursor-pointer hover:border-gold transition-colors ${
              uploadingImages ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            <div className="text-center">
              {uploadingImages ? (
                <Loader2 className="w-8 h-8 text-gold animate-spin mx-auto" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gold mx-auto mb-2" />
                  <p className="text-sm text-brown-light dark:text-ivory/60">
                    Click or drag images to upload
                  </p>
                </>
              )}
            </div>
          </label>
        </div>

        <div className="space-y-2">
          {watchImages.length === 0 ? (
            <p className="text-sm text-brown-light dark:text-ivory/40 text-center py-4">
              No images uploaded
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {watchImages.map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden bg-sand dark:bg-brown group"
                >
                  <img
                    src={url}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </GlassCard>

      {/* Submit Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gold/10 dark:border-gold/5">
        <button
          type="button"
          onClick={() => reset()}
          className="px-6 py-2.5 rounded-full border border-gold/20 text-brown-light hover:bg-gold/10 transition-colors"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={isSubmitting || uploadingImages}
          className="btn-gold px-8 py-2.5"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isEdit ? (
            'Update Product'
          ) : (
            'Create Product'
          )}
        </button>
      </div>
    </form>
  );
}

export default ProductForm;