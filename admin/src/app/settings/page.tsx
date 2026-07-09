// admin/src/app/settings/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  Save,
  Loader2,
  Store,
  CreditCard,
  Truck,
  Share2,
  Globe,
  Mail,
  Phone,
  MapPin,
  FileText,
  Settings as SettingsIcon,
  RefreshCw,
} from 'lucide-react';

import { adminApi } from '@/services/adminApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { GlassCard } from '@/components/ui/GlassCard';

// ============================================================
// Settings Schema
// ============================================================
const settingsSchema = z.object({
  // Store Settings
  storeName: z.string().min(2, 'Store name is required'),
  storeEmail: z.string().email('Invalid email'),
  storePhone: z.string().min(10, 'Phone number is required'),
  storeAddress: z.string().optional(),
  storeDescription: z.string().optional(),

  // Payment Settings
  currency: z.string().default('INR'),
  taxRate: z.number().min(0).max(100).default(18),
  codEnabled: z.boolean().default(true),
  codFee: z.number().min(0).default(0),
  upiEnabled: z.boolean().default(true),
  cardEnabled: z.boolean().default(true),

  // Shipping Settings
  freeShippingThreshold: z.number().min(0).default(5000),
  standardShippingCost: z.number().min(0).default(299),
  expressShippingCost: z.number().min(0).default(499),
  internationalShippingEnabled: z.boolean().default(false),

  // Social Media
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  youtube: z.string().optional(),
  twitter: z.string().optional(),

  // SEO
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  googleAnalyticsId: z.string().optional(),

  // Contact
  contactEmail: z.string().email('Invalid email').optional(),
  contactPhone: z.string().optional(),
  contactAddress: z.string().optional(),
  whatsappNumber: z.string().optional(),
});

type SettingsFormData = z.input<typeof settingsSchema>;

// ============================================================
// Settings Page
// ============================================================
export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('store');

  // Fetch settings
  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => adminApi.getSettings(),
  });

  const settings = data?.data;

  // Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      storeName: '',
      storeEmail: '',
      storePhone: '',
      storeAddress: '',
      storeDescription: '',
      currency: 'INR',
      taxRate: 18,
      codEnabled: true,
      codFee: 0,
      upiEnabled: true,
      cardEnabled: true,
      freeShippingThreshold: 5000,
      standardShippingCost: 299,
      expressShippingCost: 499,
      internationalShippingEnabled: false,
      facebook: '',
      instagram: '',
      youtube: '',
      twitter: '',
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      googleAnalyticsId: '',
      contactEmail: '',
      contactPhone: '',
      contactAddress: '',
      whatsappNumber: '',
    },
  });

  // Populate form when settings load
  useEffect(() => {
    if (settings) {
      reset({
        storeName: settings.storeName || '',
        storeEmail: settings.storeEmail || '',
        storePhone: settings.storePhone || '',
        storeAddress: settings.storeAddress || '',
        storeDescription: settings.storeDescription || '',
        currency: settings.currency || 'INR',
        taxRate: settings.taxRate || 18,
        codEnabled: settings.codEnabled !== undefined ? settings.codEnabled : true,
        codFee: settings.codFee || 0,
        upiEnabled: settings.upiEnabled !== undefined ? settings.upiEnabled : true,
        cardEnabled: settings.cardEnabled !== undefined ? settings.cardEnabled : true,
        freeShippingThreshold: settings.freeShippingThreshold || 5000,
        standardShippingCost: settings.standardShippingCost || 299,
        expressShippingCost: settings.expressShippingCost || 499,
        internationalShippingEnabled: settings.internationalShippingEnabled || false,
        facebook: settings.facebook || '',
        instagram: settings.instagram || '',
        youtube: settings.youtube || '',
        twitter: settings.twitter || '',
        metaTitle: settings.metaTitle || '',
        metaDescription: settings.metaDescription || '',
        metaKeywords: settings.metaKeywords || '',
        googleAnalyticsId: settings.googleAnalyticsId || '',
        contactEmail: settings.contactEmail || '',
        contactPhone: settings.contactPhone || '',
        contactAddress: settings.contactAddress || '',
        whatsappNumber: settings.whatsappNumber || '',
      });
    }
  }, [settings, reset]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: SettingsFormData) => adminApi.updateSettings(data),
    onSuccess: () => {
      toast.success('Settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update settings');
    },
  });

  const onSubmit = (data: SettingsFormData) => {
    updateMutation.mutate(data);
  };

  // Tabs configuration
  const tabs = [
    { id: 'store', label: 'Store', icon: Store },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'social', label: 'Social', icon: Share2 },
    { id: 'seo', label: 'SEO', icon: Globe },
    { id: 'contact', label: 'Contact', icon: Mail },
  ];

  // Loading skeleton
  if (isLoading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-cinzel text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-900">
            Settings
          </h1>
          <p className="text-black dark:text-black text-sm">
            Manage your store settings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-xl border border-gold/10 hover:bg-gold/10 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-brown-light dark:text-ivory/50" />
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting || updateMutation.isPending}
            className="btn-gold inline-flex items-center gap-2 text-sm px-6 py-2.5"
          >
            {isSubmitting || updateMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Settings
          </button>
        </div>
      </div>

      {/* Tabs */}
     <div className="flex flex-wrap gap-2 border-b border-gold/10 pb-3">
  {tabs.map((tab) => {
    const Icon = tab.icon;
    const isActive = activeTab === tab.id;

    return (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          isActive
            ? 'bg-gold text-white shadow-sm'
            : 'text-black dark:text-black hover:bg-gold/10 hover:text-gold-dark'
        }`}
      >
        <Icon className="w-4 h-4" />
        {tab.label}
      </button>
    );
  })}
</div>

      {/* Forms */}
      <form className="space-y-6">
        {/* Store Settings */}
        {activeTab === 'store' && (
          <StoreSettings register={register} errors={errors} />
        )}

        {/* Payment Settings */}
        {activeTab === 'payment' && (
          <PaymentSettings register={register} errors={errors} setValue={setValue} />
        )}

        {/* Shipping Settings */}
        {activeTab === 'shipping' && (
          <ShippingSettings register={register} errors={errors} setValue={setValue} />
        )}

        {/* Social Settings */}
        {activeTab === 'social' && (
          <SocialSettings register={register} errors={errors} />
        )}

        {/* SEO Settings */}
        {activeTab === 'seo' && (
          <SEOSettings register={register} errors={errors} />
        )}

        {/* Contact Settings */}
        {activeTab === 'contact' && (
          <ContactSettings register={register} errors={errors} />
        )}
      </form>
    </div>
  );
}

// ============================================================
// Store Settings Component
// ============================================================
function StoreSettings({ register, errors }: any) {
  return (
    <div className="space-y-4">
      <GlassCard>
        <h3 className="font-cinzel text-lg font-semibold text-brown dark:text-ivory mb-4">
          General Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black dark:text-black mb-1">
              Store Name *
            </label>
            <Input
              {...register('storeName')}
              placeholder="Pandit Ji Marble Murti Arts"
              className={errors.storeName ? 'border-red-400' : ''}
            />
            {errors.storeName && (
              <p className="text-xs text-red-500 mt-1">{errors.storeName.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-black dark:text-black mb-1">
              Store Email *
            </label>
            <Input
              {...register('storeEmail')}
              type="email"
              placeholder="info@panditjimurti.com"
              className={errors.storeEmail ? 'border-red-400' : ''}
            />
            {errors.storeEmail && (
              <p className="text-xs text-red-500 mt-1">{errors.storeEmail.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-black dark:text-black mb-1">
              Store Phone *
            </label>
            <Input
              {...register('storePhone')}
              placeholder="+91 72403 64772"
              className={errors.storePhone ? 'border-red-400' : ''}
            />
            {errors.storePhone && (
              <p className="text-xs text-red-500 mt-1">{errors.storePhone.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-black dark:text-black mb-1">
              Currency
            </label>
            <Input {...register('currency')} disabled className="bg-gray-100 dark:bg-brown/50 cursor-not-allowed" />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-black dark:text-black mb-1">
            Store Address
          </label>
          <Textarea
            {...register('storeAddress')}
            rows={3}
            placeholder="123, Murti Marg, govindgarh, Rajasthan 302001, India"
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-black dark:text-black mb-1">
            Store Description
          </label>
          <Textarea
            {...register('storeDescription')}
            rows={3}
            placeholder="Luxury marble and brass murtis handcrafted by master artisans in govindgarh."
          />
        </div>
      </GlassCard>
    </div>
  );
}

// ============================================================
// Payment Settings Component
// ============================================================
function PaymentSettings({ register, errors, setValue }: any) {
  return (
    <div className="space-y-4">
      <GlassCard>
        <h3 className="font-cinzel text-lg font-semibold text-brown dark:text-ivory mb-4">
          Payment Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black dark:text-black mb-1">
              Tax Rate (GST %)
            </label>
            <Input
              {...register('taxRate', { valueAsNumber: true })}
              type="number"
              placeholder="18"
              className={errors.taxRate ? 'border-red-400' : ''}
            />
            {errors.taxRate && (
              <p className="text-xs text-red-500 mt-1">{errors.taxRate.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-black dark:text-black mb-1">
              COD Fee ()
            </label>
            <Input
              {...register('codFee', { valueAsNumber: true })}
              type="number"
              placeholder="0"
            />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <label className="flex items-center gap-2 text-sm text-black dark:text-black cursor-pointer">
            <input
              type="checkbox"
              {...register('codEnabled')}
              className="accent-gold w-4 h-4"
            />
            Cash on Delivery
          </label>
          <label className="flex items-center gap-2 text-sm text-black dark:text-black cursor-pointer">
            <input
              type="checkbox"
              {...register('upiEnabled')}
              className="accent-gold w-4 h-4"
            />
            UPI Payments
          </label>
          <label className="flex items-center gap-2 text-sm text-black dark:text-black cursor-pointer">
            <input
              type="checkbox"
              {...register('cardEnabled')}
              className="accent-gold w-4 h-4"
            />
            Credit/Debit Cards
          </label>
        </div>
      </GlassCard>
    </div>
  );
}

// ============================================================
// Shipping Settings Component
// ============================================================
function ShippingSettings({ register, errors, setValue }: any) {
  return (
    <div className="space-y-4">
      <GlassCard>
        <h3 className="font-cinzel text-lg font-semibold text-brown dark:text-ivory mb-4">
          Shipping Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-black dark:text-black mb-1">
              Free Shipping Threshold ()
            </label>
            <Input
              {...register('freeShippingThreshold', { valueAsNumber: true })}
              type="number"
              placeholder="5000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black dark:text-black mb-1">
              Standard Shipping ()
            </label>
            <Input
              {...register('standardShippingCost', { valueAsNumber: true })}
              type="number"
              placeholder="299"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black dark:text-black mb-1">
              Express Shipping ()
            </label>
            <Input
              {...register('expressShippingCost', { valueAsNumber: true })}
              type="number"
              placeholder="499"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="flex items-center gap-2 text-sm text-black dark:text-black cursor-pointer">
            <input
              type="checkbox"
              {...register('internationalShippingEnabled')}
              className="accent-gold w-4 h-4"
            />
            Enable International Shipping
          </label>
        </div>
      </GlassCard>
    </div>
  );
}

// ============================================================
// Social Settings Component
// ============================================================
function SocialSettings({ register, errors }: any) {
  return (
    <div className="space-y-4">
      <GlassCard>
        <h3 className="font-cinzel text-lg font-semibold text-brown dark:text-ivory mb-4">
          Social Media Links
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black dark:text-black mb-1">
              Facebook URL
            </label>
            <Input {...register('facebook')} placeholder="https://facebook.com/..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-black dark:text-black mb-1">
              Instagram URL
            </label>
            <Input {...register('instagram')} placeholder="https://instagram.com/..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-black dark:text-black mb-1">
              YouTube URL
            </label>
            <Input {...register('youtube')} placeholder="https://youtube.com/..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-black dark:text-black mb-1">
              Twitter URL
            </label>
            <Input {...register('twitter')} placeholder="https://twitter.com/..." />
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

// ============================================================
// SEO Settings Component
// ============================================================
function SEOSettings({ register, errors }: any) {
  return (
    <div className="space-y-4">
      <GlassCard>
        <h3 className="font-cinzel text-lg font-semibold text-brown dark:text-ivory mb-4">
          SEO Settings
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black dark:text-black mb-1">
              Meta Title
            </label>
            <Input
              {...register('metaTitle')}
              placeholder="Default meta title for your store"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black dark:text-black mb-1">
              Meta Description
            </label>
            <Textarea
              {...register('metaDescription')}
              rows={3}
              placeholder="Default meta description for your store"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black dark:text-black mb-1">
              Meta Keywords (comma separated)
            </label>
            <Input
              {...register('metaKeywords')}
              placeholder="murti, marble, brass, handcrafted"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black dark:text-black mb-1">
              Google Analytics ID
            </label>
            <Input
              {...register('googleAnalyticsId')}
              placeholder="G-XXXXXXXXXX"
            />
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

// ============================================================
// Contact Settings Component
// ============================================================
function ContactSettings({ register, errors }: any) {
  return (
    <div className="space-y-4">
      <GlassCard>
        <h3 className="font-cinzel text-lg font-semibold text-brown dark:text-ivory mb-4">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black dark:text-black mb-1">
              Contact Email
            </label>
            <Input
              {...register('contactEmail')}
              type="email"
              placeholder="support@panditjimurti.com"
              className={errors.contactEmail ? 'border-red-400' : ''}
            />
            {errors.contactEmail && (
              <p className="text-xs text-red-500 mt-1">{errors.contactEmail.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-black dark:text-black mb-1">
              Contact Phone
            </label>
            <Input
              {...register('contactPhone')}
              placeholder="+91 72403 64772"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-black dark:text-black mb-1">
              Contact Address
            </label>
            <Textarea
              {...register('contactAddress')}
              rows={3}
              placeholder="123, Murti Marg, govindgarh, Rajasthan 302001, India"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black dark:text-black mb-1">
              WhatsApp Number
            </label>
            <Input
              {...register('whatsappNumber')}
              placeholder="+91 72403 64772"
            />
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

// ============================================================
// Settings Skeleton
// ============================================================
function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-40 bg-sand/50 dark:bg-brown/50 rounded animate-pulse" />
          <div className="h-4 w-48 bg-sand/30 dark:bg-brown/30 rounded animate-pulse mt-1" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-sand/50 dark:bg-brown/50 rounded-xl animate-pulse" />
          <div className="h-10 w-32 bg-sand/50 dark:bg-brown/50 rounded-full animate-pulse" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gold/10 pb-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-9 w-20 bg-sand/50 dark:bg-brown/50 rounded-lg animate-pulse" />
        ))}
      </div>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-brown-dark rounded-2xl p-6 border border-gold/5">
            <div className="h-6 w-32 bg-sand/50 dark:bg-brown/50 rounded animate-pulse mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="space-y-2">
                  <div className="h-4 w-20 bg-sand/50 dark:bg-brown/50 rounded animate-pulse" />
                  <div className="h-10 bg-sand/30 dark:bg-brown/30 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}