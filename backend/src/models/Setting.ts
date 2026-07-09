import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISetting extends Document {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  currency: string;
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
  freeShippingThreshold: number;
  standardShippingCost: number;
  expressShippingCost: number;
  shipping: {
    standard: number;
    express: number;
  };
  giftWrapCharge: number;
  advancePaymentPercent: number;
  advancePaymentPercentage: number;
  internationalShippingEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    storeName: { type: String, default: 'Pandit Ji Marble' },
    storeEmail: { type: String, default: 'support@panditjimarble.com' },
    storePhone: { type: String, default: '+91-9876543210' },
    storeAddress: { type: String, default: 'govindgarh, Rajasthan, India' },
    currency: { type: String, default: 'INR' },
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
    freeShippingThreshold: { type: Number, default: 5000 },
    standardShippingCost: { type: Number, default: 500 },
    expressShippingCost: { type: Number, default: 1200 },
    shipping: {
      standard: { type: Number, default: 500 },
      express: { type: Number, default: 1200 },
    },
    giftWrapCharge: { type: Number, default: 99 },
    advancePaymentPercent: { type: Number, default: 25 },
    advancePaymentPercentage: { type: Number, default: 25 },
    internationalShippingEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

SettingSchema.index({ updatedAt: -1 });

export const Setting: Model<ISetting> = mongoose.model<ISetting>('Setting', SettingSchema);
