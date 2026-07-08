// backend/src/models/FAQ.ts

import mongoose, { Schema, Document } from 'mongoose';

// ============================================================
// Types
// ============================================================

export interface IFAQ extends Document {
  question: string;
  answer: string;
  displayOrder: number;
  isActive: boolean;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// FAQ Schema
// ============================================================

const FAQSchema = new Schema<IFAQ>(
  {
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    category: {
      type: String,
      trim: true,
      enum: ['general', 'ordering', 'shipping', 'payment', 'returns', 'care', 'account'],
      default: 'general',
    },
  },
  {
    timestamps: true,
  }
);

// ============================================================
// Indexes
// ============================================================

FAQSchema.index({ isActive: 1, displayOrder: 1 });
FAQSchema.index({ category: 1, isActive: 1 });

// ============================================================
// Pre-save Hook
// ============================================================

FAQSchema.pre<IFAQ>('save', function (next) {
  if (this.question) {
    this.question = this.question.trim();
  }
  if (this.answer) {
    this.answer = this.answer.trim();
  }
  next();
});

// ============================================================
// Static Methods
// ============================================================

/**
 * Get active FAQs sorted by displayOrder
 */
FAQSchema.statics.getActive = async function (category?: string) {
  const query: any = { isActive: true };
  if (category) query.category = category;

  return this.find(query)
    .sort({ displayOrder: 1, createdAt: 1 })
    .lean();
};

/**
 * Get FAQs grouped by category
 */
FAQSchema.statics.getGroupedByCategory = async function () {
  const faqs = await this.find({ isActive: true })
    .sort({ displayOrder: 1, category: 1 })
    .lean();

  const grouped: Record<string, typeof faqs> = {};
faqs.forEach((faq: IFAQ) => {
  const cat = faq.category || 'general';

  if (!grouped[cat]) grouped[cat] = [];
  grouped[cat].push(faq);
});
  return grouped;
};

// ============================================================
// Model
// ============================================================

export const FAQ = mongoose.model<IFAQ>('FAQ', FAQSchema);

export default FAQ;