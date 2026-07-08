// backend/src/services/ProductService.ts

import mongoose from 'mongoose';
import { Product, IProduct } from '../models/Product';
import { Category } from '../models/Category';
import { Review } from '../models/Review';

import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

export class ProductService {
  /**
   * Get all products with filters, sorting, pagination
   */
  static async getAllProducts(filters: any = {}) {
    const {
      category,
      subCategory,
      search,
      minPrice,
      maxPrice,
      material,
      marbleType,
      finish,
      colors,
      minHeight,
      maxHeight,
      minWeight,
      maxWeight,
      inStock,
      isFeatured,
      isNew,
      rating,
      tags,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = filters;

    const query: any = { isActive: true };

    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [search] } },
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (material) query.material = material;
    if (marbleType) query.marbleType = marbleType;
    if (finish) query.finish = finish;

    if (colors) {
      const colorArray = (colors as string).split(',');
      query.colors = { $in: colorArray };
    }

    if (minHeight || maxHeight) {
      query.height = {};
      if (minHeight) query.height.$gte = Number(minHeight);
      if (maxHeight) query.height.$lte = Number(maxHeight);
    }
    if (minWeight || maxWeight) {
      query.weight = {};
      if (minWeight) query.weight.$gte = Number(minWeight);
      if (maxWeight) query.weight.$lte = Number(maxWeight);
    }

 if (inStock === 'true') {
  query.inStock = true;
  query.stockQuantity = { $gt: 0 };
} else if (inStock === 'false') {
  query.inStock = false;
}

    if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
    if (isNew !== undefined) query.isNew = isNew === 'true';

    if (rating) query.rating = { $gte: Number(rating) };

    if (tags) {
      const tagArray = (tags as string).split(',');
      query.tags = { $in: tagArray };
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
      case 'rating':
        sortOptions.rating = -1;
        break;
      case 'name-asc':
        sortOptions.name = 1;
        break;
      case 'name-desc':
        sortOptions.name = -1;
        break;
      default:
        sortOptions.createdAt = -1;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .populate('subCategory', 'name slug')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    return { products, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) };
  }

  /**
   * Get product by slug
   */
  static async getProductBySlug(slug: string) {
    const product = await Product.findOne({ slug, isActive: true })
      .populate('category', 'name slug')
      .populate('subCategory', 'name slug');

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Increment view count
    await Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } });

    return product;
  }

  /**
   * Get product by ID
   */
  static async getProductById(id: string) {
    const product = await Product.findById(id)
      .populate('category', 'name slug')
      .populate('subCategory', 'name slug');

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return product;
  }

  /**
   * Create a new product
   */
  static async createProduct(productData: any) {
    // Generate slug if not provided
    if (!productData.slug) {
      productData.slug = productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    // Check slug uniqueness
    const existing = await Product.findOne({ slug: productData.slug });
    if (existing) {
      throw new AppError('Product slug already exists', 400);
    }

    // Validate category if provided
    if (productData.category) {
      const category = await Category.findById(productData.category);
      if (!category) {
        throw new AppError('Invalid category', 400);
      }
    }

    const product = new Product(productData);
    await product.save();
    return product;
  }

  /**
   * Update a product
   */
  static async updateProduct(id: string, updates: any) {
    const product = await Product.findById(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Check slug uniqueness if updating slug
    if (updates.slug && updates.slug !== product.slug) {
      const existing = await Product.findOne({ slug: updates.slug });
      if (existing) {
        throw new AppError('Product slug already exists', 400);
      }
    }

    if (updates.category) {
      const category = await Category.findById(updates.category);
      if (!category) {
        throw new AppError('Invalid category', 400);
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    return updatedProduct;
  }

  /**
   * Delete a product (soft delete)
   */
  static async deleteProduct(id: string) {
    const product = await Product.findById(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    product.isActive = false;
    await product.save();
    return product;
  }

  /**
   * Get featured products
   */
  static async getFeatured(limit: number = 8) {
    return await Product.find({ isFeatured: true, isActive: true })
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  /**
   * Get new arrivals
   */
  static async getNewArrivals(limit: number = 8) {
    return await Product.find({ isNew: true, isActive: true })
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  /**
   * Get best sellers (by salesCount)
   */
  static async getBestSellers(limit: number = 8) {
    return await Product.find({ isActive: true })
      .limit(limit)
      .sort({ salesCount: -1 });
  }

  /**
   * Get trending products (by viewCount)
   */
  static async getTrending(limit: number = 8) {
    return await Product.find({ isActive: true })
      .limit(limit)
      .sort({ viewCount: -1 });
  }

  /**
   * Get related products
   */
  static async getRelated(productId: string, limit: number = 6) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return await Product.find({
      _id: { $ne: productId },
      isActive: true,
      $or: [
        { category: product.category },
        { tags: { $in: product.tags || [] } },
      ],
    })
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  /**
   * Get product categories with counts
   */
  static async getCategories() {
    return await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          id: '$_id',
          name: '$category.name',
          slug: '$category.slug',
          count: 1,
        },
      },
    ]);
  }

  /**
   * Get filter options (materials, colors, price range, etc.)
   */
  static async getFilterOptions() {
    const [materials, colors, priceRange, heights, weights, tags] = await Promise.all([
      Product.distinct('material', { isActive: true }),
      Product.distinct('colors', { isActive: true }),
      Product.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, minPrice: { $min: '$price' }, maxPrice: { $max: '$price' } } },
      ]),
      Product.distinct('height', { isActive: true }),
      Product.distinct('weight', { isActive: true }),
      Product.distinct('tags', { isActive: true }),
    ]);

    const priceRangeObj = priceRange[0] || { minPrice: 0, maxPrice: 0 };

    return {
      materials: materials.filter(Boolean),
      colors: colors.filter(Boolean),
      priceRange: {
        min: priceRangeObj.minPrice || 0,
        max: priceRangeObj.maxPrice || 0,
      },
      heights: heights.filter(Boolean).sort((a, b) => a - b),
      weights: weights.filter(Boolean).sort((a, b) => a - b),
      tags: tags.filter(Boolean),
    };
  }

  /**
   * Autocomplete search
   */
  static async autocomplete(query: string, limit: number = 5) {
    if (!query || query.length < 2) {
      return [];
    }
    return await Product.find({
      isActive: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { tags: { $in: [query] } },
      ],
    })
      .limit(limit)
      .select('name slug images price material');
  }

  /**
   * Advanced search (reuses getAllProducts but different format)
   */
  static async search(filters: any) {
    return await this.getAllProducts(filters);
  }

  /**
   * Compare multiple products
   */
  static async compare(productIds: string[]) {
    const ids = productIds.map(id => new mongoose.Types.ObjectId(id));
    const products = await Product.find({
      _id: { $in: ids },
      isActive: true,
    });
    if (products.length === 0) {
      throw new AppError('No valid products found for comparison', 404);
    }
    return products;
  }

  /**
   * Check product availability
   */
  static async checkAvailability(id: string) {
    const product = await Product.findById(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    const inStock = product.inStock && (product.stockQuantity || 0) > 0;
    return {
      inStock,
      stockQuantity: product.stockQuantity || 0,
      estimatedDelivery: inStock ? '3-5 business days' : 'Out of stock',
    };
  }

  /**
   * Get product reviews
   */
  static async getReviews(productId: string, page: number = 1, limit: number = 10) {
    const reviews = await Review.find({ product: productId, isActive: true })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Review.countDocuments({ product: productId, isActive: true });
    const averageRating = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]);

    return {
      reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      averageRating: averageRating[0]?.avg || 0,
    };
  }

  /**
   * Submit a review
   */
  static async submitReview(productId: string, userId: string, data: any) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Check if user already reviewed
    const existing = await Review.findOne({ product: productId, user: userId });
    if (existing) {
      throw new AppError('You have already reviewed this product', 400);
    }

    const review = new Review({
      product: productId,
      user: userId,
      rating: data.rating,
      comment: data.comment,
      title: data.title,
      isAnonymous: data.anonymous || false,
    });
    await review.save();

    // Update product rating
    const stats = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    if (stats.length > 0) {
      product.rating = stats[0].avg;
      product.reviewCount = stats[0].count;
      await product.save();
    }

    return review;
  }

  /**
   * Custom murti request
   */
  static async customRequest(data: any) {
    // In real implementation, save to CustomRequest model
    // For now, return a mock response
    const requestId = 'CR' + Date.now();
    return {
      requestId,
      message: 'Custom request submitted successfully. We will contact you soon.',
      estimatedResponseTime: '24 hours',
    };
  }

  /**
   * Track product view
   */
  static async trackView(productId: string) {
    await Product.findByIdAndUpdate(productId, { $inc: { viewCount: 1 } });
  }

  /**
   * Get recently viewed (placeholder)
   */
  static async getRecentlyViewed(userId: string) {
    // Implement using a separate collection or cache
    return [];
  }

  /**
   * Upload product images
   */
  static async uploadImages(files: Express.Multer.File[]) {
    const uploadPromises = files.map((file) =>
      uploadToCloudinary(file.buffer, {
        folder: 'products',
        tags: ['product'],
        quality: 'auto:good',
        format: 'webp',
        width: 800,
        crop: 'scale',
      })
    );
    const results = await Promise.all(uploadPromises);
    return results.map((r) => r.secure_url);
  }

  /**
   * Bulk import products
   */
  static async bulkImport(file: Express.Multer.File) {
    // In real implementation, parse file and insert products
    // For now, return mock
    return {
      imported: 0,
      failed: 0,
    };
  }

  /**
   * Add variant to product
   */
  static async addVariant(productId: string, variantData: any) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    variantData.id = new mongoose.Types.ObjectId().toString();
    product.variants ??= [];
product.variants.push(variantData);
    await product.save();
    return product;
  }

  /**
   * Update variant
   */
  static async updateVariant(productId: string, variantId: string, updates: any) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    const variant = product.variants?.find(
  (v: any) => v.id === variantId || v._id?.toString() === variantId
);

if (!variant) {
  throw new AppError('Variant not found', 404);
}
    Object.assign(variant, updates);
    await product.save();
    return product;
  }

  /**
   * Delete variant
   */
  static async deleteVariant(productId: string, variantId: string) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    product.variants = product.variants?.filter((v: any) => v.id !== variantId);
    await product.save();
    return product;
  }
}