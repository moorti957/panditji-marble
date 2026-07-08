// backend/src/models/Review.ts

import mongoose, { Schema, Document } from 'mongoose';

// ============================================================
// Types
// ============================================================

export interface IReview extends Document {
  product: mongoose.Types.ObjectId;
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
// Review Schema
// ============================================================

const ReviewSchema = new Schema<IReview>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
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
      minlength: 10,
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

// Ensure one review per user per product
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

// For listing reviews
ReviewSchema.index({ product: 1, createdAt: -1 });
ReviewSchema.index({ product: 1, rating: -1 });
ReviewSchema.index({ user: 1, createdAt: -1 });

// For analytics
ReviewSchema.index({ createdAt: -1 });

// ============================================================
// Pre-save Hook
// ============================================================

ReviewSchema.pre<IReview>('save', function (next) {
  // Trim comment
  if (this.comment) {
    this.comment = this.comment.trim();
  }
  next();
});

// ============================================================
// Instance Methods
// ============================================================

/**
 * Check if the review is helpful (by a user)
 * This is a placeholder; you'd need a separate helpful votes model in production
 */
ReviewSchema.methods.isHelpfulByUser = function (userId: string): boolean {
  // In a real implementation, you'd check a separate collection for helpful votes
  return false;
};

/**
 * Increment helpful count
 */
ReviewSchema.methods.incrementHelpful = async function (): Promise<void> {
  this.helpfulCount += 1;
  await this.save();
};

/**
 * Decrement helpful count (optional)
 */
ReviewSchema.methods.decrementHelpful = async function (): Promise<void> {
  if (this.helpfulCount > 0) {
    this.helpfulCount -= 1;
    await this.save();
  }
};

// ============================================================
// Static Methods
// ============================================================

/**
 * Get reviews for a product with pagination and sorting
 */
ReviewSchema.statics.getProductReviews = async function (
  productId: string,
  page: number = 1,
  limit: number = 10,
  sort: 'recent' | 'highest' | 'lowest' | 'helpful' = 'recent'
) {
  const skip = (page - 1) * limit;

  let sortOption: any = {};
  switch (sort) {
    case 'recent':
      sortOption = { createdAt: -1 };
      break;
    case 'highest':
      sortOption = { rating: -1 };
      break;
    case 'lowest':
      sortOption = { rating: 1 };
      break;
    case 'helpful':
      sortOption = { helpfulCount: -1 };
      break;
    default:
      sortOption = { createdAt: -1 };
  }

  const query = { product: productId, isActive: true };

  const [reviews, total] = await Promise.all([
    this.find(query)
      .populate('user', 'name avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments(query),
  ]);

  return { reviews, total, page, limit, totalPages: Math.ceil(total / limit) };
};

/**
 * Get average rating for a product
 */
ReviewSchema.statics.getAverageRating = async function (productId: string): Promise<number> {
  const result = await this.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId), isActive: true } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  return result.length ? Math.round(result[0].avgRating * 10) / 10 : 0;
};

/**
 * Get rating distribution for a product
 */
ReviewSchema.statics.getRatingDistribution = async function (productId: string): Promise<Record<number, number>> {
  const distribution = await this.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId), isActive: true } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } },
  ]);

  const result: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  distribution.forEach((item) => {
    result[item._id] = item.count;
  });
  return result;
};

/**
 * Get total reviews for a product
 */
ReviewSchema.statics.getReviewCount = async function (productId: string): Promise<number> {
  return this.countDocuments({ product: productId, isActive: true });
};

// ============================================================
// Virtuals
// ============================================================

ReviewSchema.virtual('ratingText').get(function () {
  const map = ['', 'Poor', 'Fair', 'Average', 'Good', 'Excellent'];
  return map[this.rating] || '';
});

ReviewSchema.virtual('shortComment').get(function () {
  return this.comment.length > 100 ? this.comment.substring(0, 100) + '...' : this.comment;
});

// Ensure virtuals are included when converting to JSON
ReviewSchema.set('toJSON', { virtuals: true });
ReviewSchema.set('toObject', { virtuals: true });

// ============================================================
// Model
// ============================================================

export const Review = mongoose.model<IReview>('Review', ReviewSchema);

export default Review;