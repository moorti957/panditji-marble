// backend/src/models/Banner.ts

import mongoose, { Schema, Document } from 'mongoose';

// ============================================================
// Types
// ============================================================

export interface IBanner extends Document {
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  buttonText?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// Banner Schema
// ============================================================

const BannerSchema = new Schema<IBanner>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      trim: true,
    },
    buttonText: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================================
// Indexes
// ============================================================

// For efficient querying of active banners sorted by order
BannerSchema.index({ isActive: 1, displayOrder: 1 });

// ============================================================
// Model
// ============================================================

export const Banner = mongoose.model<IBanner>('Banner', BannerSchema);

export default Banner;