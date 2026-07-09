// backend/src/controllers/CategoryController.ts

import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import mongoose from 'mongoose';
import { Category, ICategory } from '../models/Category';
import { Product } from '../models/Product';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary';

export class CategoryController {
  /**
   * Get all categories with optional filters and pagination
   */
  static async getAll(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const {
        parentId,
        isActive,
        isFeatured,
        search,
        limit = 50,
        page = 1,
      } = req.query;

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

      return res.json({
        success: true,
        data: {
          categories,
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error('Get all categories error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get category tree (nested hierarchy)
   */
  static async getTree(req: AuthRequest, res: Response): Promise<Response> {
    try {
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

      return res.json({
        success: true,
        data: roots,
      });
    } catch (error) {
      console.error('Get category tree error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get featured categories
   */
  static async getFeatured(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 6;
      const categories = await Category.find({
        isFeatured: true,
        isActive: true,
      })
        .limit(limit)
        .sort({ displayOrder: 1, name: 1 });

      return res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      console.error('Get featured categories error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get category by slug
   */
  static async getBySlug(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { slug } = req.params;
      const category = await Category.findOne({ slug, isActive: true })
        .populate('parentId', 'name slug');

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }

      return res.json({
        success: true,
        data: category,
      });
    } catch (error) {
      console.error('Get category by slug error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get category by ID
   */
  static async getById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const category = await Category.findById(id)
        .populate('parentId', 'name slug');

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }

      return res.json({
        success: true,
        data: category,
      });
    } catch (error) {
      console.error('Get category by ID error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get products in a category (by slug)
   */
  static async getCategoryProducts(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { slug } = req.params;
      const { page = 1, limit = 12, sort = 'newest' } = req.query;

      const category = await Category.findOne({ slug, isActive: true });
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
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
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

      const total = await Product.countDocuments({
        category: category._id,
        isActive: true,
      });

      return res.json({
        success: true,
        data: {
          products,
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error('Get category products error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Create a new category (admin)
   */
  static async create(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { icon, ...categoryData } = req.body;
      console.log('CATEGORY BODY =>', categoryData);
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
        return res.status(400).json({
          success: false,
          message: 'Category slug already exists',
        });
      }

      // Validate parent if provided
      if (categoryData.parentId) {
        const parent = await Category.findById(categoryData.parentId);
        if (!parent) {
          return res.status(400).json({
            success: false,
            message: 'Invalid parent category',
          });
        }
      }

      const category = new Category(categoryData);
      await category.save();

      return res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category,
      });
    } catch (error) {
      console.error('Create category error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Update a category (admin)
   */
  static async update(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { icon, ...updates } = req.body;

      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }

      // Check slug uniqueness if updating slug
      if (updates.slug && updates.slug !== category.slug) {
        const existing = await Category.findOne({ slug: updates.slug });
        if (existing) {
          return res.status(400).json({
            success: false,
            message: 'Category slug already exists',
          });
        }
      }

      // Validate parent if updating (prevent circular reference)
      if (updates.parentId) {
        if (updates.parentId === id) {
          return res.status(400).json({
            success: false,
            message: 'Category cannot be its own parent',
          });
        }
        const parent = await Category.findById(updates.parentId);
        if (!parent) {
          return res.status(400).json({
            success: false,
            message: 'Invalid parent category',
          });
        }
      }

      const updated = await Category.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      });

      return res.json({
        success: true,
        message: 'Category updated successfully',
        data: updated,
      });
    } catch (error) {
      console.error('Update category error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Delete a category (soft delete - set isActive to false)
   */
  static async delete(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }

      // Check if category has children
      const children = await Category.find({ parentId: id, isActive: true });
      if (children.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete category with sub-categories. Move or delete them first.',
        });
      }

      // Check if category has products
      const productCount = await Product.countDocuments({
        category: id,
        isActive: true,
      });
      if (productCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete category with associated products. Remove or reassign them first.',
        });
      }

      // Soft delete
      category.isActive = false;
      await category.save();

      return res.json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error) {
      console.error('Delete category error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Toggle category featured status
   */
  static async toggleFeatured(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }

      category.isFeatured = !category.isFeatured;
      await category.save();

      return res.json({
        success: true,
        message: `Category featured status toggled to ${category.isFeatured}`,
        data: category,
      });
    } catch (error) {
      console.error('Toggle featured error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Reorder categories (bulk update displayOrder)
   */
  static async reorder(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { categories } = req.body; // Array of { id, displayOrder }

      const bulkOps = categories.map((item: { id: string; displayOrder: number }) => ({
        updateOne: {
          filter: { _id: item.id },
          update: { displayOrder: item.displayOrder },
        },
      }));

      await Category.bulkWrite(bulkOps);

      return res.json({
        success: true,
        message: 'Categories reordered successfully',
      });
    } catch (error) {
      console.error('Reorder categories error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Bulk delete categories (soft delete)
   */
  static async bulkDelete(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { ids } = req.body;

      // Check if any have children or products
      const children = await Category.find({
        parentId: { $in: ids },
        isActive: true,
      });
      if (children.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Some categories have sub-categories. Cannot delete them.',
        });
      }

      const products = await Product.countDocuments({
        category: { $in: ids },
        isActive: true,
      });
      if (products > 0) {
        return res.status(400).json({
          success: false,
          message: 'Some categories have associated products. Cannot delete them.',
        });
      }

      await Category.updateMany(
        { _id: { $in: ids } },
        { isActive: false }
      );

      return res.json({
        success: true,
        message: 'Categories deleted successfully',
      });
    } catch (error) {
      console.error('Bulk delete categories error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}