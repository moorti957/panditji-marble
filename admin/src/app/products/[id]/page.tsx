// admin/src/app/products/[id]/page.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  X,
  Image as ImageIcon,
  Upload,
  Loader2,
  AlertCircle,
} from 'lucide-react';

import { adminApi } from '@/services/adminApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { GlassCard } from '@/components/ui/GlassCard';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

// ============================================================
// Form Validation Schema
// ============================================================
const productSchema = z.object({
  name: z.string().min(2, 'Product name is required').max(100),
  slug: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0, 'Price must be 0 or greater'),
  originalPrice: z.number().min(0).optional(),
  category: z.string().min(1, 'Category is required'),
  material: z.string().optional(),
  marbleType: z.string().optional(),
  finish: z.string().optional(),
  colors: z.array(z.string()).optional(),
  height: z.number().min(0).optional(),
  width: z.number().min(0).optional(),
  depth: z.number().min(0).optional(),
  weight: z.number().min(0).optional(),
  inStock: z.boolean().default(true),
  stockQuantity: z.number().min(0).optional(),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
 tags: z.array(z.string()).optional(),
  specifications: z.array(z.object({
    key: z.string().min(1),
    value: z.string().min(1),
    displayOrder: z.number().optional(),
  })).optional(),
  images: z.array(z.string()).optional(),
});

type ProductFormData = z.input<typeof productSchema>;

// ============================================================
// Product Edit Page
// ============================================================
export default function ProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string | undefined;
  const isCreateMode = !productId;
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch product data
  const { data: productData, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['admin', 'products', productId],
    queryFn: () => adminApi.getProduct(productId as string),
    enabled: !isCreateMode,
  });

  const product = productData;

  // Fetch categories for dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => adminApi.getCategories({ limit: 100 }),
  });

  const categories = categoriesData?.data || [];

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
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      originalPrice: 0,
      category: '',
      material: '',
      marbleType: '',
      finish: '',
      colors: [],
      height: 0,
      width: 0,
      depth: 0,
      weight: 0,
      inStock: true,
      stockQuantity: 0,
      isFeatured: false,
      isNew: false,
      tags: [],
      specifications: [],
      images: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'specifications',
  });

  // Watch values
  const watchImages = watch('images') || [];
  const watchInStock = watch('inStock');

  // Reset form when product loads
  useEffect(() => {
    if (product) {
      reset({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        price: product.price || 0,
        originalPrice: product.originalPrice || 0,
        category: product.category?._id || product.category || '',
        material: product.material || '',
        marbleType: product.marbleType || '',
        finish: product.finish || '',
        colors: Array.isArray(product.colors)
  ? product.colors.join(", ")
  : product.colors || "",
        height: product.height || 0,
        width: product.width || 0,
        depth: product.depth || 0,
        weight: product.weight || 0,
        inStock: product.inStock !== undefined ? product.inStock : true,
        stockQuantity: product.stockQuantity || 0,
        isFeatured: product.isFeatured || false,
        isNew: product.isNew || false,
       tags: Array.isArray(product.tags)
  ? product.tags.join(", ")
  : product.tags || "",
        specifications: product.specifications || [],
        images: product.images || [],
      });
    }
  }, [product, reset]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: ProductFormData) => adminApi.updateProduct(productId, data),
    onSuccess: () => {
      toast.success('Product updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'products', productId] });
      router.push('/products');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update product');
      setIsSubmitting(false);
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: ProductFormData) => adminApi.createProduct(data),
    onSuccess: () => {
      toast.success('Product created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      router.push('/products');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create product');
      setIsSubmitting(false);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => adminApi.deleteProduct(productId),
    onSuccess: () => {
      toast.success('Product deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      router.push('/products');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete product');
    },
  });

  // Submit handler
const onSubmit = (data: ProductFormData) => {
  const payload = {
    ...data,

    // Auto generate SEO slug
    slug: data.slug
      ? data.slug
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
      : data.name
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),

   
  };

  console.log("SUBMIT DATA:", payload);

  setIsSubmitting(true);

  if (isCreateMode) {
    createMutation.mutate(payload);
  } else {
    updateMutation.mutate(payload);
  }
};

const onError = (errors: any) => {
  console.log("FORM ERRORS:", errors);
};

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      // Upload to server (Cloudinary)
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]);
      }
      
      const imageUrls = await adminApi.uploadProductImages(formData);
      
      // Update form images
      const currentImages = getValues('images') || [];
      setValue('images', [...currentImages, ...imageUrls]);
      toast.success(`${imageUrls.length} image(s) uploaded`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to upload images');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const images = getValues('images') || [];
    const newImages = images.filter((_, i) => i !== index);
    setValue('images', newImages);
  };

  if (!isCreateMode && isLoadingProduct) {
    return <EditSkeleton />;
  }

  if (!isCreateMode && !product) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="font-cinzel text-xl text-brown dark:text-ivory">Product not found</h2>
        <Link href="/products" className="btn-gold inline-block mt-4">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
  <Link
    href="/products"
    className="p-2 rounded-lg hover:bg-gold/10 transition-colors text-black dark:text-black"
  >
    <ArrowLeft className="w-5 h-5" />
  </Link>

  <div>
    <h1 className="font-cinzel text-2xl font-bold text-black dark:text-black">
      {isCreateMode ? 'Create Product' : 'Edit Product'}
    </h1>

    <p className="text-sm text-black dark:text-black">
      {isCreateMode ? 'Add a new catalog item' : product.name}
    </p>
  </div>
</div>
        <div className="flex items-center gap-3">
          {!isCreateMode && (
            <button
              onClick={() => setIsDeleteDialogOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
          <button
            onClick={handleSubmit(onSubmit, onError)}
            disabled={isSubmitting}
            className="btn-gold inline-flex items-center gap-2 text-sm px-6 py-2.5"
          >
            {isSubmitting || createMutation.isPending || updateMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isCreateMode ? 'Create Product' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Form */}
      <form className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Main fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <GlassCard>
            <h3 className="font-cinzel text-lg font-semibold text-brown dark:text-ivory mb-4">
              Basic Information
            </h3>
            <div className="space-y-4">
              <div>
               <label className="block text-sm font-medium text-black dark:text-black mb-1">
  Product Name *
</label>
                <Input
                  {...register('name')}
                  placeholder="e.g., Ganesh Murti (Marble)"
                  className={errors.name ? 'border-red-400' : ''}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-black dark:text-black mb-1">
                  Slug
                </label>
                <Input
                  {...register('slug')}
                  placeholder="e.g., ganesh-murti-marble"
                />
                <p className="text-xs text-brown-light/60 mt-1">
                  Leave blank to auto-generate from name
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black dark:text-black mb-1">
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
                <label className="block text-sm font-medium text-black dark:text-black mb-1">
                  Price * ()
                </label>
                <Input
                  {...register('price', { valueAsNumber: true })}
                  type="number"
                  placeholder="0"
                  className={errors.price ? 'border-red-400' : ''}
                />
                {errors.price && (
                  <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-black dark:text-black mb-1">
                  Original Price ()
                </label>
                <Input
                  {...register('originalPrice', { valueAsNumber: true })}
                  type="number"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black dark:text-black mb-1">
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
                <label className="block text-sm font-medium text-black dark:text-black mb-1">
                  Category *
                </label>
                <Select
                  {...register('category')}
                  options={categories.map((c: any) => ({
                    value: c._id,
                    label: c.name,
                  }))}
                  placeholder="Select a category"
                  className={errors.category ? 'border-red-400' : ''}
                />
                {errors.category && (
                  <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black dark:text-black mb-1">
                    Material
                  </label>
                  <Input {...register('material')} placeholder="e.g. Marble" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-black mb-1">
                    Marble Type
                  </label>
                  <Input {...register('marbleType')} placeholder="e.g., Makrana, White" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-black mb-1">
                    Finish
                  </label>
                  <Input {...register('finish')} placeholder="e.g., Polished, Matte" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-black mb-1">
                    Colors (comma separated)
                  </label>
                  <Input
  {...register("colors", {
    setValueAs: (value) => {
      if (Array.isArray(value)) return value;

      if (typeof value === "string") {
        return value
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);
      }

      return [];
    },
  })}
  placeholder="e.g., Gold, Maroon"
/>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black dark:text-black mb-1">
                    Height (cm)
                  </label>
                  <Input {...register('height', { valueAsNumber: true })} type="number" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-black mb-1">
                    Width (cm)
                  </label>
                  <Input {...register('width', { valueAsNumber: true })} type="number" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-black mb-1">
                    Depth (cm)
                  </label>
                  <Input {...register('depth', { valueAsNumber: true })} type="number" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-black mb-1">
                    Weight (kg)
                  </label>
                  <Input {...register('weight', { valueAsNumber: true })} type="number" placeholder="0" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black dark:text-black mb-1">
                  Tags (comma separated)
                </label>
            <Input
  {...register("tags", {
    setValueAs: (value) => {
      if (Array.isArray(value)) return value;

      if (typeof value === "string") {
        return value
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);
      }

      return [];
    },
  })}
  placeholder="kali, mata, marble"
/>
              </div>
            </div>
          </GlassCard>

          {/* Flags */}
          <GlassCard>
            <h3 className="font-cinzel text-lg font-semibold text-black dark:text-black mb-4">
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
              <h3 className="font-cinzel text-lg font-semibold text-black dark:text-black">
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
                      placeholder="Value (e.g., Marble)"
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
        </div>

        {/* Right: Images */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard>
            <h3 className="font-cinzel text-lg font-semibold text-black dark:text-black mb-4">
              Product Images
            </h3>

            {/* Image upload */}
            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className={`flex items-center justify-center w-full border-2 border-dashed border-gold/30 rounded-xl p-6 cursor-pointer hover:border-gold transition-colors ${
                  uploadingImage ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <div className="text-center">
                  {uploadingImage ? (
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

            {/* Image list */}
            <div className="space-y-2">
              {watchImages.length === 0 ? (
                <p className="text-sm text-brown-light dark:text-ivory/40 text-center py-4">
                  No images uploaded
                </p>
              ) : (
                watchImages.map((url, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-sand/20 dark:bg-brown/20 rounded-lg">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-sand dark:bg-brown flex-shrink-0">
                      <img src={url} alt={`Product image ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                    <span className="flex-1 text-xs text-brown-light dark:text-ivory/60 truncate">
                      {url.split('/').pop()?.slice(0, 20)}...
                    </span>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </GlassCard>

          {/* Preview link */}
          {!isCreateMode && product.slug && (
            <GlassCard>
              <h4 className="font-medium text-sm text-brown dark:text-ivory mb-2">
                Preview on Frontend
              </h4>
              <a
                href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/products/${product.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-dark hover:text-gold text-sm flex items-center gap-1"
              >
                View Product →
              </a>
            </GlassCard>
          )}
        </div>
      </form>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Product"
        message={`Are you sure you want to delete "${product?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

// ============================================================
// Edit Skeleton
// ============================================================
function EditSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-sand/50 dark:bg-brown/50 rounded-lg animate-pulse" />
          <div>
            <div className="h-8 w-48 bg-sand/50 dark:bg-brown/50 rounded animate-pulse" />
            <div className="h-4 w-32 bg-sand/30 dark:bg-brown/30 rounded animate-pulse mt-1" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-24 bg-sand/50 dark:bg-brown/50 rounded-full animate-pulse" />
          <div className="h-10 w-32 bg-sand/50 dark:bg-brown/50 rounded-full animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-brown-dark rounded-2xl p-6 border border-gold/5">
              <div className="h-6 w-32 bg-sand/50 dark:bg-brown/50 rounded animate-pulse mb-4" />
              <div className="space-y-3">
                {Array.from({ length: i === 0 ? 3 : 2 }).map((_, j) => (
                  <div key={j} className="h-10 bg-sand/30 dark:bg-brown/30 rounded animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-6">
          <div className="bg-white dark:bg-brown-dark rounded-2xl p-6 border border-gold/5">
            <div className="h-6 w-32 bg-sand/50 dark:bg-brown/50 rounded animate-pulse mb-4" />
            <div className="h-32 bg-sand/30 dark:bg-brown/30 rounded animate-pulse" />
            <div className="h-16 bg-sand/30 dark:bg-brown/30 rounded animate-pulse mt-3" />
          </div>
        </div>
      </div>
    </div>
  );
}
