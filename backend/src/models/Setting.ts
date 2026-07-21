import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISetting extends Document {
  // Store Settings
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  storeDescription: string;
  currency: string;

  // Payment Settings
  taxRate: number;
  gstPercentage: number;
  codEnabled: boolean;
  codFee: number;
  upiEnabled: boolean;
  cardEnabled: boolean;
  walletEnabled: boolean;
  netBankingEnabled: boolean;
  paymentMethods: {
    cod: boolean;
    upi: boolean;
    card: boolean;
    wallet: boolean;
    netBanking: boolean;
  };

  // Shipping Settings
  freeShippingThreshold: number;
  standardShippingCost: number;
  expressShippingCost: number;
  shipping: {
    standard: number;
    express: number;
  };
  internationalShippingEnabled: boolean;

  // Social Media
  socialLinks: {
    facebook: string;
    instagram: string;
    youtube: string;
    twitter: string;
    whatsapp: string;
  };

  // SEO
  seo: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    googleAnalyticsId: string;
  };

  // Contact
  contact: {
    email: string;
    phone: string;
    address: string;
    whatsapp: string;
  };

  giftWrapCharge: number;
  advancePaymentPercent: number;
  advancePaymentPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    // Store
    storeName: { type: String, default: 'Pandit Ji Marble' },
    storeEmail: { type: String, default: 'support@panditjimarble.com' },
    storePhone: { type: String, default: '+91-9876543210' },
    storeAddress: { type: String, default: 'govindgarh, Rajasthan, India' },
    storeDescription: { type: String, default: '' },
    currency: { type: String, default: 'INR' },

    // Payment
    taxRate: { type: Number, default: 18 },
    gstPercentage: { type: Number, default: 18 },
    codEnabled: { type: Boolean, default: true },
    codFee: { type: Number, default: 0 },
    upiEnabled: { type: Boolean, default: true },
    cardEnabled: { type: Boolean, default: true },
    walletEnabled: { type: Boolean, default: true },
    netBankingEnabled: { type: Boolean, default: true },
    paymentMethods: {
      cod: { type: Boolean, default: true },
      upi: { type: Boolean, default: true },
      card: { type: Boolean, default: true },
      wallet: { type: Boolean, default: true },
      netBanking: { type: Boolean, default: true },
    },

    // Shipping
    freeShippingThreshold: { type: Number, default: 5000 },
    standardShippingCost: { type: Number, default: 500 },
    expressShippingCost: { type: Number, default: 1200 },
    shipping: {
      standard: { type: Number, default: 500 },
      express: { type: Number, default: 1200 },
    },
    internationalShippingEnabled: { type: Boolean, default: false },

    // Social
    socialLinks: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      youtube: { type: String, default: '' },
      twitter: { type: String, default: '' },
      whatsapp: { type: String, default: '' },
    },

    // SEO
    seo: {
      metaTitle: { type: String, default: '' },
      metaDescription: { type: String, default: '' },
      metaKeywords: { type: String, default: '' },
      googleAnalyticsId: { type: String, default: '' },
    },

    // Contact
    contact: {
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      address: { type: String, default: '' },
      whatsapp: { type: String, default: '' },
    },

    giftWrapCharge: { type: Number, default: 99 },
    advancePaymentPercent: { type: Number, default: 25 },
    advancePaymentPercentage: { type: Number, default: 25 },
  },
  { timestamps: true }
);


SettingSchema.index({ updatedAt: -1 });

export const Setting: Model<ISetting> = mongoose.model<ISetting>('Setting', SettingSchema);


