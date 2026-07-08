// backend/src/services/CategoryService.ts

import mongoose from 'mongoose';
import { Category, ICategory } from '../models/Category';
import { Product } from '../models/Product';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

export class CategoryService {
  /**
   * Get all categories with optional filters
   */
  static async getAllCategories(filters: any = {}) {
    const {
      parentId,
      isActive,
      isFeatured,
      search,
      limit = 50,
      page = 1,
    } = filters;

    const query: any = {};

    if (parentId !== undefined) {
      query.parentId = parentId === 'null' ? null : parentId;
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === 'true';
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const categories = await Category.find(query)
      .populate('parentId', 'name slug')
      .sort({ displayOrder: 1, name: 1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Category.countDocuments(query);

    return {
      categories,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  /**
   * Get category tree (nested hierarchy)
   */
  static async getCategoryTree() {
    // Get all active categories sorted by displayOrder
    const categories = await Category.find({ isActive: true })
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    // Build tree structure
    const categoryMap: Record<string, any> = {};
    const roots: any[] = [];

    categories.forEach((cat) => {
      categoryMap[cat._id.toString()] = { ...cat, children: [] };
    });

    categories.forEach((cat) => {
      const parentId = cat.parentId ? cat.parentId.toString() : null;
      if (parentId && categoryMap[parentId]) {
        categoryMap[parentId].children.push(categoryMap[cat._id.toString()]);
      } else {
        roots.push(categoryMap[cat._id.toString()]);
      }
    });

    // Get product counts for each category
    const categoryIds = categories.map((c) => c._id);
    const productCounts = await Product.aggregate([
      { $match: { category: { $in: categoryIds }, isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const countMap: Record<string, number> = {};
    productCounts.forEach((item) => {
      countMap[item._id.toString()] = item.count;
    });

    // Recursively add product counts
    const addCounts = (node: any) => {
      let totalCount = countMap[node._id.toString()] || 0;
      if (node.children) {
        node.children.forEach((child: any) => {
          totalCount += addCounts(child);
        });
      }
      node.productCount = totalCount;
      return totalCount;
    };

    roots.forEach((root) => addCounts(root));

    return roots;
  }

  /**
   * Get featured categories
   */
  static async getFeaturedCategories(limit: number = 6) {
    return await Category.find({
      isFeatured: true,
      isActive: true,
    })
      .limit(limit)
      .sort({ displayOrder: 1, name: 1 });
  }

  /**
   * Get category by slug
   */
  static async getCategoryBySlug(slug: string) {
    const category = await Category.findOne({ slug, isActive: true })
      .populate('parentId', 'name slug');

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    return category;
  }

  /**
   * Get category by ID
   */
  static async getCategoryById(id: string) {
    const category = await Category.findById(id)
      .populate('parentId', 'name slug');

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    return category;
  }

  /**
   * Get products in a category
   */
  static async getCategoryProducts(slug: string, page: number = 1, limit: number = 12, sort: string = 'newest') {
    const category = await Category.findOne({ slug, isActive: true });
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    let sortOptions: any = {};
    switch (sort) {
      case 'price-asc':
        sortOptions.price = 1;
        break;
      case 'price-desc':
        sortOptions.price = -1;
        break;
      case 'newest':
        sortOptions.createdAt = -1;
        break;
      case 'popular':
        sortOptions.viewCount = -1;
        break;
      default:
        sortOptions.createdAt = -1;
    }

    const products = await Product.find({
      category: category._id,
      isActive: true,
    })
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Product.countDocuments({
      category: category._id,
      isActive: true,
    });

    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Create a new category
   */
  static async createCategory(categoryData: any) {
    // Generate slug if not provided
    if (!categoryData.slug) {
      categoryData.slug = categoryData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    // Check for duplicate slug
    const existing = await Category.findOne({ slug: categoryData.slug });
    if (existing) {
      throw new AppError('Category slug already exists', 400);
    }

    // Validate parent if provided
    if (categoryData.parentId) {
      const parent = await Category.findById(categoryData.parentId);
      if (!parent) {
        throw new AppError('Invalid parent category', 400);
      }
    }

    const category = new Category(categoryData);
    await category.save();
    return category;
  }

  /**
   * Update a category
   */
  static async updateCategory(id: string, updates: any) {
    const category = await Category.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    // Check slug uniqueness if updating slug
    if (updates.slug && updates.slug !== category.slug) {
      const existing = await Category.findOne({ slug: updates.slug });
      if (existing) {
        throw new AppError('Category slug already exists', 400);
      }
    }

    // Validate parent if updating (prevent circular reference)
    if (updates.parentId) {
      if (updates.parentId === id) {
        throw new AppError('Category cannot be its own parent', 400);
      }
      const parent = await Category.findById(updates.parentId);
      if (!parent) {
        throw new AppError('Invalid parent category', 400);
      }
    }

    const updated = await Category.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    return updated;
  }

  /**
   * Delete a category (soft delete)
   */
  static async deleteCategory(id: string) {
    const category = await Category.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    // Check if category has children
    const children = await Category.find({ parentId: id, isActive: true });
    if (children.length > 0) {
      throw new AppError('Cannot delete category with sub-categories. Move or delete them first.', 400);
    }

    // Check if category has products
    const productCount = await Product.countDocuments({
      category: id,
      isActive: true,
    });
    if (productCount > 0) {
      throw new AppError('Cannot delete category with associated products. Remove or reassign them first.', 400);
    }

    // Soft delete
    category.isActive = false;
    await category.save();

    return category;
  }

  /**
   * Toggle category featured status
   */
  static async toggleFeatured(id: string) {
    const category = await Category.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    category.isFeatured = !category.isFeatured;
    await category.save();

    return category;
  }

  /**
   * Reorder categories (bulk update displayOrder)
   */
  static async reorderCategories(categories: Array<{ id: string; displayOrder: number }>) {
    const bulkOps = categories.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { displayOrder: item.displayOrder },
      },
    }));

    await Category.bulkWrite(bulkOps);
    return { success: true };
  }

  /**
   * Bulk delete categories (soft delete)
   */
  static async bulkDeleteCategories(ids: string[]) {
    // Check if any have children or products
    const children = await Category.find({
      parentId: { $in: ids },
      isActive: true,
    });
    if (children.length > 0) {
      throw new AppError('Some categories have sub-categories. Cannot delete them.', 400);
    }

    const products = await Product.countDocuments({
      category: { $in: ids },
      isActive: true,
    });
    if (products > 0) {
      throw new AppError('Some categories have associated products. Cannot delete them.', 400);
    }

    await Category.updateMany(
      { _id: { $in: ids } },
      { isActive: false }
    );

    return { deleted: ids.length };
  }

  /**
   * Get category hierarchy (full path from root to category)
   */
  static async getCategoryHierarchy(categoryId: string) {
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    const hierarchy: ICategory[] = [];
    let current: ICategory | null = category;

    while (current) {
      hierarchy.unshift(current);
      if (current.parentId) {
        current = await Category.findById(current.parentId);
      } else {
        break;
      }
    }

    return hierarchy;
  }

  /**
   * Get all subcategories of a category (including nested)
   */
  static async getSubcategories(categoryId: string) {
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    // Get all subcategories using aggregation
    const subcategories = await Category.aggregate([
      {
        $match: {
          $or: [
            { parentId: new mongoose.Types.ObjectId(categoryId) },
            { 'ancestors': { $in: [new mongoose.Types.ObjectId(categoryId)] } },
          ],
          isActive: true,
        },
      },
      { $sort: { displayOrder: 1, name: 1 } },
    ]);

    return subcategories;
  }

  /**
   * Update category ancestors (for maintaining path)
   */
  static async updateAncestors(id: string) {
    const category = await Category.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    const ancestors: string[] = [];
    let current: ICategory | null = category;

    // Build ancestors path
    while (current && current.parentId) {
      const parent: any = await Category.findById(current.parentId);
      if (parent) {
        ancestors.unshift(parent._id.toString());
        current = parent;
      } else {
        break;
      }
    }

    // Update category ancestors
    category.ancestors = ancestors.map(id => new mongoose.Types.ObjectId(id));
    await category.save();

    // Recursively update children
    const children = await Category.find({ parentId: id, isActive: true });
    for (const child of children) {
      await this.updateAncestors(child._id.toString());
    }

    return category;
  }

  /**
   * Get category stats (counts)
   */
  static async getCategoryStats() {
    const total = await Category.countDocuments({ isActive: true });
    const featured = await Category.countDocuments({ isFeatured: true, isActive: true });
    const withProducts = await Category.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products',
        },
      },
      { $match: { 'products.0': { $exists: true } } },
      { $count: 'count' },
    ]);

    return {
      total,
      featured,
      withProducts: withProducts[0]?.count || 0,
      withoutProducts: total - (withProducts[0]?.count || 0),
    };
  }
}