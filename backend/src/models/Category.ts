// backend/src/models/Category.ts

import mongoose, { Schema, Document, Model } from 'mongoose';

// ============================================================
// Types
// ============================================================

export interface ICategorySEO {
  title?: string;
  description?: string;
  keywords?: string[];
}

export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId;

  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  parentId?: mongoose.Types.ObjectId | null;
  ancestors?: mongoose.Types.ObjectId[];
  displayOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  seo?: ICategorySEO;
  createdAt: Date;
  updatedAt: Date;

  // Virtuals
  children?: ICategory[];
  productCount?: number;
  fullPath?: string;

  // Methods
  getFullPath(): Promise<string>;
  getAncestors(): Promise<ICategory[]>;
  getDescendants(): Promise<ICategory[]>;
  getProductCount(): Promise<number>;
}

// ============================================================
// SEO Sub-Schema
// ============================================================

const SEOSchema = new Schema<ICategorySEO>(
  {
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    keywords: { type: [String], default: [] },
  },
  { _id: false }
);

// ============================================================
// Category Schema
// ============================================================

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
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
      trim: true,
      maxlength: 500,
    },
    icon: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    ancestors: {
      type: [Schema.Types.ObjectId],
      ref: 'Category',
      default: [],
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
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

CategorySchema.index({ slug: 1 });
CategorySchema.index({ parentId: 1 });
CategorySchema.index({ isActive: 1 });
CategorySchema.index({ isFeatured: 1 });
CategorySchema.index({ displayOrder: 1, name: 1 });
CategorySchema.index({ ancestors: 1 });
CategorySchema.index({ name: 'text' });

// Compound indexes for common queries
CategorySchema.index({ parentId: 1, isActive: 1, displayOrder: 1 });
CategorySchema.index({ isFeatured: 1, isActive: 1, displayOrder: 1 });

// ============================================================
// Pre-save Hook: Generate slug if not provided
// ============================================================

CategorySchema.pre<ICategory>('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// ============================================================
// Pre-save Hook: Update ancestors
// ============================================================

CategorySchema.pre<ICategory>('save', async function (next) {
  if (this.isModified('parentId')) {
    const ancestors: mongoose.Types.ObjectId[] = [];
    let currentParentId = this.parentId;

    while (currentParentId) {
      const parent = await mongoose.model('Category').findById(currentParentId);
      if (!parent) break;
      ancestors.unshift(parent._id);
      currentParentId = parent.parentId || null;
    }

    this.ancestors = ancestors;
  }
  next();
});

// ============================================================
// Pre-remove Hook: Prevent deletion if has children
// ============================================================

CategorySchema.pre(
  'deleteOne',
  { document: true, query: false },
  async function (next) {
    const children = await mongoose.model('Category').find({
      parentId: this._id,
      isActive: true,
    });

    if (children.length > 0) {
      return next(new Error('Cannot delete category with sub-categories'));
    }

    next();
  }
);
// ============================================================
// Instance Methods
// ============================================================

/**
 * Get full path of category from root to this category
 */
CategorySchema.methods.getFullPath = async function (
  this: ICategory
): Promise<string> {
  const pathParts: string[] = [];
  let current: ICategory | null = this;

  while (current) {
    pathParts.unshift(current.name);

    if (current.parentId) {
      current = await mongoose.model<ICategory>('Category').findById(current.parentId);
    } else {
      current = null;
    }
  }

  return pathParts.join(' › ');
};

/**
 * Get all ancestors of this category (root to immediate parent)
 */
CategorySchema.methods.getAncestors = async function (): Promise<ICategory[]> {
  if (!this.ancestors || this.ancestors.length === 0) {
    return [];
  }
  return await mongoose.model('Category').find({
    _id: { $in: this.ancestors },
    isActive: true,
  }).sort({ displayOrder: 1 });
};

/**
 * Get all descendants of this category (children, grandchildren, etc.)
 */
CategorySchema.methods.getDescendants = async function (): Promise<ICategory[]> {
  return await mongoose.model('Category').find({
    ancestors: { $in: [this._id] },
    isActive: true,
  }).sort({ displayOrder: 1, name: 1 });
};

/**
 * Get immediate children of this category
 */
CategorySchema.methods.getChildren = async function (): Promise<ICategory[]> {
  return await mongoose.model('Category').find({
    parentId: this._id,
    isActive: true,
  }).sort({ displayOrder: 1, name: 1 });
};

/**
 * Get product count for this category
 */
CategorySchema.methods.getProductCount = async function (): Promise<number> {
  const Product = mongoose.model('Product');
  return await Product.countDocuments({
    category: this._id,
    isActive: true,
  });
};

/**
 * Check if category has children
 */
CategorySchema.methods.hasChildren = async function (): Promise<boolean> {
  const count = await mongoose.model('Category').countDocuments({
    parentId: this._id,
    isActive: true,
  });
  return count > 0;
};

/**
 * Check if category has products
 */
CategorySchema.methods.hasProducts = async function (): Promise<boolean> {
  const Product = mongoose.model('Product');
  const count = await Product.countDocuments({
    category: this._id,
    isActive: true,
  });
  return count > 0;
};

// ============================================================
// Static Methods
// ============================================================

/**
 * Find category by slug (case-insensitive, only active)
 */
CategorySchema.statics.findBySlug = function (slug: string) {
  return this.findOne({ slug, isActive: true });
};

/**
 * Get root categories (no parent)
 */
CategorySchema.statics.findRoots = function () {
  return this.find({ parentId: null, isActive: true })
    .sort({ displayOrder: 1, name: 1 });
};

/**
 * Get featured categories
 */
CategorySchema.statics.findFeatured = function (limit: number = 6) {
  return this.find({ isFeatured: true, isActive: true })
    .limit(limit)
    .sort({ displayOrder: 1, name: 1 });
};

/**
 * Get category tree (all categories with children)
 */
CategorySchema.statics.getTree = async function (): Promise<ICategory[]> {
 const categories = (await this.find({ isActive: true })
  .sort({ displayOrder: 1, name: 1 })
  .lean()) as ICategory[];
  const categoryMap: Record<string, any> = {};
  const roots: any[] = [];

  categories.forEach((cat: ICategory) => {
    const id = (cat._id as mongoose.Types.ObjectId).toString();

    categoryMap[id] = {
      ...cat,
      children: [],
    };
  });

  categories.forEach((cat: ICategory) => {
    const id = (cat._id as mongoose.Types.ObjectId).toString();

    const parentId = cat.parentId
      ? (cat.parentId as mongoose.Types.ObjectId).toString()
      : null;

    if (parentId && categoryMap[parentId]) {
      categoryMap[parentId].children.push(categoryMap[id]);
    } else {
      roots.push(categoryMap[id]);
    }
  });

  return roots as ICategory[];
};

/**
 * Get all subcategory IDs for a given category (including nested)
 */
CategorySchema.statics.getAllSubcategoryIds = async function (categoryId: string): Promise<string[]> {
  const category = await this.findById(categoryId);
  if (!category) {
    return [];
  }

 const descendants = await this.find({
  ancestors: { $in: [categoryId] },
  isActive: true,
})
  .select('_id')
  .lean();

return (descendants as { _id: mongoose.Types.ObjectId }[]).map((c) =>
  c._id.toString()
);
};

// ============================================================
// Virtuals
// ============================================================

CategorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentId',
  options: { sort: { displayOrder: 1, name: 1 } },
});

CategorySchema.virtual('parent', {
  ref: 'Category',
  localField: 'parentId',
  foreignField: '_id',
  justOne: true,
});

CategorySchema.virtual('productCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
  count: true,
  match: { isActive: true },
});

// Ensure virtuals are included when converting to JSON
CategorySchema.set('toJSON', { virtuals: true });
CategorySchema.set('toObject', { virtuals: true });

// ============================================================
// Model
// ============================================================

export const Category = mongoose.model<ICategory>('Category', CategorySchema);

export default Category;