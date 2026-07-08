// backend/src/models/Product.ts

import mongoose, { Schema, Document, Model } from 'mongoose';

// ============================================================
// Types
// ============================================================

export interface ISpecification {
  key: string;
  value: string;
  displayOrder?: number;
}

export interface IVariant {
  id: string;
  name: string;
  attributes: Record<string, string>;
  price: number;
  stock: number;
  sku?: string;
  isDefault?: boolean;
  images?: string[];
}

export interface IProductSEO {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  structuredData?: Record<string, any>;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  excerpt?: string;
  price: number;
  originalPrice?: number;
  images: string[];
  images360?: string[];
  videoUrl?: string;
  material?: string;
  marbleType?: string;
  finish?: string;
  colors?: string[];
  category: mongoose.Types.ObjectId;
  subCategory?: mongoose.Types.ObjectId;
  height?: number;
  width?: number;
  depth?: number;
  weight?: number;
  inStock: boolean;
  stockQuantity?: number;
  isActive: boolean;
  isFeatured?: boolean;
  isNewProduct?: boolean;
  isOnSale?: boolean;
  rating?: number;
  reviewCount?: number;
  viewCount?: number;
  salesCount?: number;
  tags?: string[];
  specifications?: ISpecification[];
  variants?: IVariant[];
  seo?: IProductSEO;
  createdAt: Date;
  updatedAt: Date;
  incrementViewCount(): Promise<IProduct>;
incrementSalesCount(quantity?: number): Promise<IProduct>;
getDiscountedPrice(): number;
getDiscountPercentage(): number;
}

// ============================================================
// Specification Sub-Schema
// ============================================================

const SpecificationSchema = new Schema<ISpecification>(
  {
    key: { type: String, required: true },
    value: { type: String, required: true },
    displayOrder: { type: Number, default: 0 },
  },
  { _id: false }
);

// ============================================================
// Variant Sub-Schema
// ============================================================

const VariantSchema = new Schema<IVariant>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    attributes: { type: Map, of: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    sku: { type: String, trim: true },
    isDefault: { type: Boolean, default: false },
    images: { type: [String], default: [] },
  },
  { _id: false }
);

// ============================================================
// SEO Sub-Schema
// ============================================================

const SEOSchema = new Schema<IProductSEO>(
  {
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    keywords: { type: [String], default: [] },
    canonicalUrl: { type: String, trim: true },
    ogImage: { type: String, trim: true },
    structuredData: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

// ============================================================
// Product Schema
// ============================================================

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    description: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    images: {
      type: [String],
      default: [],
    },
    images360: {
      type: [String],
      default: [],
    },
    videoUrl: {
      type: String,
      trim: true,
    },
    material: {
      type: String,
      trim: true,
    },
    marbleType: {
      type: String,
      trim: true,
    },
    finish: {
      type: String,
      trim: true,
    },
    colors: {
      type: [String],
      default: [],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    subCategory: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    height: {
      type: Number,
      min: 0,
    },
    width: {
      type: Number,
      min: 0,
    },
    depth: {
      type: Number,
      min: 0,
    },
    weight: {
      type: Number,
      min: 0,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    stockQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isNewProduct: {
  type: Boolean,
  default: false,
},
    isOnSale: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    salesCount: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    specifications: {
      type: [SpecificationSchema],
      default: [],
    },
    variants: {
      type: [VariantSchema],
      default: [],
    },
    seo: {
      type: SEOSchema,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================================
// Indexes
// ============================================================

ProductSchema.index({ slug: 1 });
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ rating: -1 });
ProductSchema.index({ viewCount: -1 });
ProductSchema.index({ tags: 1 });
ProductSchema.index({ isFeatured: 1, isActive: 1 });
ProductSchema.index({ isNew: 1, isActive: 1 });
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Compound indexes for common queries
ProductSchema.index({ category: 1, price: 1, isActive: 1 });
ProductSchema.index({ isActive: 1, inStock: 1 });

// ============================================================
// Pre-save Hook: Auto-generate slug if not provided
// ============================================================

ProductSchema.pre<IProduct>('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// ============================================================
// Pre-save Hook: Set isOnSale based on originalPrice
// ============================================================

ProductSchema.pre<IProduct>('save', function (next) {
  if (this.originalPrice && this.originalPrice > this.price) {
    this.isOnSale = true;
  } else {
    this.isOnSale = false;
  }
  next();
});

// ============================================================
// Static Methods
// ============================================================

ProductSchema.statics.findBySlug = function (slug: string) {
  return this.findOne({ slug, isActive: true });
};

ProductSchema.statics.findFeatured = function (limit: number = 8) {
  return this.find({ isFeatured: true, isActive: true })
    .limit(limit)
    .sort({ createdAt: -1 });
};

ProductSchema.statics.findNewArrivals = function (limit: number = 8) {
  return this.find({ isNew: true, isActive: true })
    .limit(limit)
    .sort({ createdAt: -1 });
};

// ============================================================
// Instance Methods
// ============================================================

ProductSchema.methods.incrementViewCount = async function () {
  this.viewCount = (this.viewCount || 0) + 1;
  return this.save();
};

ProductSchema.methods.incrementSalesCount = async function (quantity: number = 1) {
  this.salesCount = (this.salesCount || 0) + quantity;
  return this.save();
};

ProductSchema.methods.getDiscountedPrice = function (): number {
  if (this.originalPrice && this.originalPrice > this.price) {
    return this.originalPrice - this.price;
  }
  return 0;
};

ProductSchema.methods.getDiscountPercentage = function (): number {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
};

// ============================================================
// Virtuals
// ============================================================

ProductSchema.virtual('discountAmount').get(function () {
  return this.getDiscountedPrice();
});

ProductSchema.virtual('discountPercentage').get(function () {
  return this.getDiscountPercentage();
});

ProductSchema.virtual('isInStock').get(function () {
  return this.inStock && (this.stockQuantity || 0) > 0;
});

// Ensure virtuals are included when converting to JSON
ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

// ============================================================
// Model
// ============================================================

export const Product = mongoose.model<IProduct>('Product', ProductSchema);

export default Product;