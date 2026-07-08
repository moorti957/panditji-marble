// backend/src/models/Coupon.ts

import mongoose, { Schema, Document, Model } from 'mongoose';

// ============================================================
// Types
// ============================================================

export interface ICoupon extends Document {
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrderAmount?: number;
  maximumDiscount?: number; // only for percentage coupons
  startDate: Date;
  endDate: Date;
  usageLimit?: number;
  usedCount: number;
  perUserLimit?: number;
  isActive: boolean;
  applicableCategories?: mongoose.Types.ObjectId[];
  applicableProducts?: mongoose.Types.ObjectId[];
  excludedProducts?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  isValid(): boolean;
  isExpired(): boolean;
  isApplicable(subtotal: number): boolean;
  canBeUsedByUser(userId: string, userUsageCount: number): boolean;
  calculateDiscount(subtotal: number): number;
  incrementUsage(): Promise<void>;
  getUsageByUser(userId: string): Promise<number>;
}

// ============================================================
// Coupon Schema
// ============================================================

const CouponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      match: /^[A-Z0-9_-]{3,20}$/,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    minimumOrderAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    maximumDiscount: {
      type: Number,
      min: 0,
      validate: {
        validator: function (this: ICoupon, val: number) {
          if (this.discountType === 'percentage' && val !== undefined) {
            return val > 0;
          }
          return true;
        },
        message: 'Maximum discount is only applicable for percentage coupons',
      },
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (this: ICoupon, val: Date) {
          return val > this.startDate;
        },
        message: 'End date must be after start date',
      },
    },
    usageLimit: {
      type: Number,
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    perUserLimit: {
      type: Number,
      min: 1,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    applicableCategories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    applicableProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    excludedProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ============================================================
// Indexes
// ============================================================

CouponSchema.index({ code: 1 });
CouponSchema.index({ startDate: 1, endDate: 1 });
CouponSchema.index({ isActive: 1 });
CouponSchema.index({ endDate: 1 });

// Compound indexes for common queries
CouponSchema.index({ isActive: 1, endDate: 1 });
CouponSchema.index({ code: 1, isActive: 1 });

// ============================================================
// Pre-save Hook: Ensure consistent code format
// ============================================================

CouponSchema.pre<ICoupon>('save', function (next) {
  if (this.isModified('code')) {
    this.code = this.code.toUpperCase().trim();
  }
  next();
});

// ============================================================
// Instance Methods
// ============================================================

/**
 * Check if coupon is currently valid (active, not expired, within date range)
 */
CouponSchema.methods.isValid = function (): boolean {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.startDate &&
    now <= this.endDate &&
    (this.usageLimit === undefined || this.usedCount < this.usageLimit)
  );
};

/**
 * Check if coupon is expired
 */
CouponSchema.methods.isExpired = function (): boolean {
  return new Date() > this.endDate || !this.isActive;
};

/**
 * Check if coupon is applicable to a cart subtotal (minimum order amount)
 */
CouponSchema.methods.isApplicable = function (subtotal: number): boolean {
  return subtotal >= (this.minimumOrderAmount || 0);
};

/**
 * Check if coupon can be used by a user (based on per-user limit)
 */
CouponSchema.methods.canBeUsedByUser = function (
  userId: string,
  userUsageCount: number
): boolean {
  if (this.perUserLimit === undefined) return true;
  return userUsageCount < this.perUserLimit;
};

/**
 * Calculate discount amount for a given subtotal
 */
CouponSchema.methods.calculateDiscount = function (subtotal: number): number {
  if (!this.isApplicable(subtotal)) return 0;

  let discount = 0;
  if (this.discountType === 'percentage') {
    discount = (subtotal * this.discountValue) / 100;
    if (this.maximumDiscount && discount > this.maximumDiscount) {
      discount = this.maximumDiscount;
    }
  } else {
    discount = Math.min(this.discountValue, subtotal);
  }
  return Math.round(discount);
};

/**
 * Increment usage count of the coupon
 */
CouponSchema.methods.incrementUsage = async function (): Promise<void> {
  this.usedCount += 1;
  await this.save();
};

/**
 * Get usage count for a specific user (requires a separate model for tracking)
 * This would need a CouponUsage collection; for simplicity, we'll provide a placeholder.
 */
CouponSchema.methods.getUsageByUser = async function (
  userId: string
): Promise<number> {
  // In a real implementation, you'd have a CouponUsage model
  // For now, we'll return 0
  return 0;
};

// ============================================================
// Static Methods
// ============================================================

/**
 * Find a valid coupon by code (active, not expired, within usage limit)
 */
CouponSchema.statics.findValid = function (code: string) {
  const now = new Date();
  return this.findOne({
    code: code.toUpperCase().trim(),
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
    $expr: { $lt: ['$usedCount', '$usageLimit'] },
  });
};

/**
 * Get all active coupons
 */
CouponSchema.statics.findActive = function () {
  const now = new Date();
  return this.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).sort({ endDate: 1 });
};

/**
 * Get expired coupons (for cleanup or notification)
 */
CouponSchema.statics.findExpired = function () {
  const now = new Date();
  return this.find({
    $or: [{ endDate: { $lt: now } }, { isActive: false }],
  });
};

// ============================================================
// Virtuals
// ============================================================

CouponSchema.virtual('isExpiredVirtual').get(function () {
  return this.isExpired();
});

CouponSchema.virtual('isValidVirtual').get(function () {
  return this.isValid();
});

// Ensure virtuals are included when converting to JSON
CouponSchema.set('toJSON', { virtuals: true });
CouponSchema.set('toObject', { virtuals: true });

// ============================================================
// Model
// ============================================================

export const Coupon = mongoose.model<ICoupon>('Coupon', CouponSchema);

export default Coupon;