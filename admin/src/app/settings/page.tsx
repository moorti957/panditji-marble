// admin/src/app/settings/page.tsx

'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
  RefreshCw,
} from 'lucide-react';

import { adminApi } from '@/services/adminApi';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { GlassCard } from '@/components/ui/GlassCard';

// ============================================================
// Per-Tab Schemas
// ============================================================
const storeSchema = z.object({
  storeName: z.string().min(2, 'Store name is required'),
  storeEmail: z.string().email('Invalid email'),
  storePhone: z.string().min(10, 'Phone number is required'),
  storeAddress: z.string().optional(),
  storeDescription: z.string().optional(),
  currency: z.string().default('INR'),
});
type StoreFormData = z.input<typeof storeSchema>;

const paymentSchema = z.object({
  taxRate: z.number().min(0).max(100).default(18),
  codEnabled: z.boolean().default(true),
  codFee: z.number().min(0).default(0),
  upiEnabled: z.boolean().default(true),
  cardEnabled: z.boolean().default(true),
});
type PaymentFormData = z.input<typeof paymentSchema>;

const shippingSchema = z.object({
  freeShippingThreshold: z.number().min(0).default(5000),
  standardShippingCost: z.number().min(0).default(299),
  expressShippingCost: z.number().min(0).default(499),
  internationalShippingEnabled: z.boolean().default(false),
});
type ShippingFormData = z.input<typeof shippingSchema>;

const socialSchema = z.object({
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  youtube: z.string().optional(),
  twitter: z.string().optional(),
});
type SocialFormData = z.input<typeof socialSchema>;

const seoSchema = z.object({
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  googleAnalyticsId: z.string().optional(),
});
type SEOFormData = z.input<typeof seoSchema>;

const contactSchema = z.object({
  contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  contactAddress: z.string().optional(),
  whatsappNumber: z.string().optional(),
});
type ContactFormData = z.input<typeof contactSchema>;

// ============================================================
// Shared ref handle type
// ============================================================
export interface TabFormHandle {
  submit: () => void;
}

// ============================================================
// Settings Page
// ============================================================
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('store');
  const [pendingByTab, setPendingByTab] = useState<Record<string, boolean>>({
    store: false,
    payment: false,
    shipping: false,
    social: false,
    seo: false,
    contact: false,
  });

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

  const setTabPending = (tab: string, pending: boolean) => {
    setPendingByTab((prev) =>
      prev[tab] === pending ? prev : { ...prev, [tab]: pending }
    );
  };

  const tabs = [
    { id: 'store', label: 'Store', icon: Store },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'social', label: 'Social', icon: Share2 },
    { id: 'seo', label: 'SEO', icon: Globe },
    { id: 'contact', label: 'Contact', icon: Mail },
  ];

  const activeTabPending = pendingByTab[activeTab];

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
            type="submit"
            form={`${activeTab}-settings-form`}
            disabled={activeTabPending}
            className="btn-gold inline-flex items-center gap-2 text-sm px-6 py-2.5"
          >
            {activeTabPending ? (
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

      {/* Forms - only the active tab's form is rendered/mounted */}
      {activeTab === 'store' && (
        <StoreSettings settings={settings} onPendingChange={(p) => setTabPending('store', p)} />
      )}
      {activeTab === 'payment' && (
        <PaymentSettings settings={settings} onPendingChange={(p) => setTabPending('payment', p)} />
      )}
      {activeTab === 'shipping' && (
        <ShippingSettings settings={settings} onPendingChange={(p) => setTabPending('shipping', p)} />
      )}
      {activeTab === 'social' && (
        <SocialSettings settings={settings} onPendingChange={(p) => setTabPending('social', p)} />
      )}
      {activeTab === 'seo' && (
        <SEOSettings settings={settings} onPendingChange={(p) => setTabPending('seo', p)} />
      )}
      {activeTab === 'contact' && (
        <ContactSettings settings={settings} onPendingChange={(p) => setTabPending('contact', p)} />
      )}
    </div>
  );
}

// ============================================================
// Store Settings (own form, own schema, own submit)
// ============================================================
function StoreSettings({
  settings,
  onPendingChange,
}: {
  settings: any;
  onPendingChange: (pending: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      storeName: '',
      storeEmail: '',
      storePhone: '',
      storeAddress: '',
      storeDescription: '',
      currency: 'INR',
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        storeName: settings.storeName || '',
        storeEmail: settings.storeEmail || '',
        storePhone: settings.storePhone || '',
        storeAddress: settings.storeAddress || '',
        storeDescription: settings.storeDescription || '',
        currency: settings.currency || 'INR',
      });
    }
  }, [settings, reset]);

  const mutation = useMutation({
    mutationFn: (data: StoreFormData) => adminApi.updateStoreSettings(data),
    onSuccess: () => {
      toast.success('Store settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update store settings');
    },
  });

  useEffect(() => {
    onPendingChange(mutation.isPending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mutation.isPending]);

  const onSubmit = (data: StoreFormData) => mutation.mutate(data);

  return (
    <form id="store-settings-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
    </form>
  );
}

// ============================================================
// Payment Settings (own form, own schema, own submit)
// ============================================================
function PaymentSettings({
  settings,
  onPendingChange,
}: {
  settings: any;
  onPendingChange: (pending: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      taxRate: 18,
      codEnabled: true,
      codFee: 0,
      upiEnabled: true,
      cardEnabled: true,
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        taxRate: settings.taxRate || 18,
        codEnabled: settings.codEnabled !== undefined ? settings.codEnabled : true,
        codFee: settings.codFee || 0,
        upiEnabled: settings.upiEnabled !== undefined ? settings.upiEnabled : true,
        cardEnabled: settings.cardEnabled !== undefined ? settings.cardEnabled : true,
      });
    }
  }, [settings, reset]);

  const mutation = useMutation({
    mutationFn: (data: PaymentFormData) => adminApi.updatePaymentSettings(data),
    onSuccess: () => {
      toast.success('Payment settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update payment settings');
    },
  });

  useEffect(() => {
    onPendingChange(mutation.isPending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mutation.isPending]);

  const onSubmit = (data: PaymentFormData) => mutation.mutate(data);

  return (
    <form id="payment-settings-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              COD Fee (₹)
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
    </form>
  );
}

// ============================================================
// Shipping Settings (own form, own schema, own submit)
// ============================================================
function ShippingSettings({
  settings,
  onPendingChange,
}: {
  settings: any;
  onPendingChange: (pending: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      freeShippingThreshold: 5000,
      standardShippingCost: 299,
      expressShippingCost: 499,
      internationalShippingEnabled: false,
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        freeShippingThreshold: settings.freeShippingThreshold || 5000,
        standardShippingCost: settings.standardShippingCost || 299,
        expressShippingCost: settings.expressShippingCost || 499,
        internationalShippingEnabled: settings.internationalShippingEnabled || false,
      });
    }
  }, [settings, reset]);

  const mutation = useMutation({
    mutationFn: (data: ShippingFormData) => adminApi.updateShippingSettings(data),
    onSuccess: () => {
      toast.success('Shipping settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update shipping settings');
    },
  });

  useEffect(() => {
    onPendingChange(mutation.isPending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mutation.isPending]);

  const onSubmit = (data: ShippingFormData) => mutation.mutate(data);

  return (
    <form id="shipping-settings-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <GlassCard>
        <h3 className="font-cinzel text-lg font-semibold text-brown dark:text-ivory mb-4">
          Shipping Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-black dark:text-black mb-1">
              Free Shipping Threshold (₹)
            </label>
            <Input
              {...register('freeShippingThreshold', { valueAsNumber: true })}
              type="number"
              placeholder="5000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black dark:text-black mb-1">
              Standard Shipping (₹)
            </label>
            <Input
              {...register('standardShippingCost', { valueAsNumber: true })}
              type="number"
              placeholder="299"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black dark:text-black mb-1">
              Express Shipping (₹)
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
    </form>
  );
}

// ============================================================
// Social Settings (own form, own schema, own submit)
// ============================================================
function SocialSettings({
  settings,
  onPendingChange,
}: {
  settings: any;
  onPendingChange: (pending: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<SocialFormData>({
    resolver: zodResolver(socialSchema),
    defaultValues: {
      facebook: '',
      instagram: '',
      youtube: '',
      twitter: '',
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        facebook: settings.facebook || '',
        instagram: settings.instagram || '',
        youtube: settings.youtube || '',
        twitter: settings.twitter || '',
      });
    }
  }, [settings, reset]);

  const mutation = useMutation({
    mutationFn: (data: SocialFormData) => adminApi.updateSocialSettings(data),
    onSuccess: () => {
      toast.success('Social settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update social settings');
    },
  });

  useEffect(() => {
    onPendingChange(mutation.isPending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mutation.isPending]);

  const onSubmit = (data: SocialFormData) => mutation.mutate(data);

  return (
    <form id="social-settings-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
    </form>
  );
}

// ============================================================
// SEO Settings (own form, own schema, own submit)
// ============================================================
function SEOSettings({
  settings,
  onPendingChange,
}: {
  settings: any;
  onPendingChange: (pending: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<SEOFormData>({
    resolver: zodResolver(seoSchema),
    defaultValues: {
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      googleAnalyticsId: '',
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        metaTitle: settings.metaTitle || '',
        metaDescription: settings.metaDescription || '',
        metaKeywords: settings.metaKeywords || '',
        googleAnalyticsId: settings.googleAnalyticsId || '',
      });
    }
  }, [settings, reset]);

  const mutation = useMutation({
    mutationFn: (data: SEOFormData) => adminApi.updateSEOSettings(data),
    onSuccess: () => {
      toast.success('SEO settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update SEO settings');
    },
  });

  useEffect(() => {
    onPendingChange(mutation.isPending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mutation.isPending]);

  const onSubmit = (data: SEOFormData) => mutation.mutate(data);

  return (
    <form id="seo-settings-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
    </form>
  );
}

// ============================================================
// Contact Settings (own form, own schema, own submit)
// ============================================================
function ContactSettings({
  settings,
  onPendingChange,
}: {
  settings: any;
  onPendingChange: (pending: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      contactEmail: '',
      contactPhone: '',
      contactAddress: '',
      whatsappNumber: '',
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        contactEmail: settings.contactEmail || '',
        contactPhone: settings.contactPhone || '',
        contactAddress: settings.contactAddress || '',
        whatsappNumber: settings.whatsappNumber || '',
      });
    }
  }, [settings, reset]);

  const mutation = useMutation({
    mutationFn: (data: ContactFormData) => adminApi.updateContactSettings(data),
    onSuccess: () => {
      toast.success('Contact settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update contact settings');
    },
  });

  useEffect(() => {
    onPendingChange(mutation.isPending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mutation.isPending]);

  const onSubmit = (data: ContactFormData) => mutation.mutate(data);

  return (
    <form id="contact-settings-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
    </form>
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