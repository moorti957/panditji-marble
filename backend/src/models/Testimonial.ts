// backend/src/models/Testimonial.ts

import mongoose, { Schema, Document } from 'mongoose';

// ============================================================
// Types
// ============================================================

export interface ITestimonial extends Document {
  user: mongoose.Types.ObjectId;
  rating: number;
  title?: string;
  comment: string;
  isAnonymous: boolean;
  isVerified: boolean;
  helpfulCount: number;
  images: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// Testimonial Schema
// ============================================================

const TestimonialSchema = new Schema<ITestimonial>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 500,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    helpfulCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    images: {
      type: [String],
      default: [],
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

// For efficient listing of active testimonials
TestimonialSchema.index({ isActive: 1, createdAt: -1 });
TestimonialSchema.index({ user: 1, createdAt: -1 });

// ============================================================
// Pre-save Hook
// ============================================================

TestimonialSchema.pre<ITestimonial>('save', function (next) {
  if (this.comment) {
    this.comment = this.comment.trim();
  }
  next();
});

// ============================================================
// Instance Methods
// ============================================================

/**
 * Increment helpful count
 */
TestimonialSchema.methods.incrementHelpful = async function (): Promise<void> {
  this.helpfulCount += 1;
  await this.save();
};

// ============================================================
// Static Methods
// ============================================================

/**
 * Get active testimonials with pagination
 */
TestimonialSchema.statics.getActive = async function (
  page: number = 1,
  limit: number = 10,
  sortBy: string = 'createdAt',
  sortOrder: 'asc' | 'desc' = 'desc'
) {
  const skip = (page - 1) * limit;
  const sort: any = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const [testimonials, total] = await Promise.all([
    this.find({ isActive: true })
      .populate('user', 'name avatar')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments({ isActive: true }),
  ]);

  return { testimonials, total, page, limit, totalPages: Math.ceil(total / limit) };
};

/**
 * Get average rating of all testimonials
 */
TestimonialSchema.statics.getAverageRating = async function (): Promise<number> {
  const result = await this.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: null, avgRating: { $avg: '$rating' } } },
  ]);
  return result.length ? Math.round(result[0].avgRating * 10) / 10 : 0;
};

// ============================================================
// Model
// ============================================================

export const Testimonial = mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);

export default Testimonial;