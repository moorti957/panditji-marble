// backend/src/controllers/ProductController.ts

import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import mongoose from 'mongoose';
import { Product, IProduct } from '../models/Product';
import { Category } from '../models/Category';
import { Review } from '../models/Review';
import { ProductService } from '../services/ProductService';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary';

export class ProductController {
  /**
   * Get all products with filters, sorting, pagination
   */
  static async getAll(req: AuthRequest, res: Response): Promise<Response> {
    try {
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
      } = req.query;

      const query: any = { isActive: true };

      // Category filter
      if (category) {
        query.category = category;
      }
      if (subCategory) {
        query.subCategory = subCategory;
      }

      // Search
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [search] } },
        ];
      }

      // Price range
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }

      // Material filters
      if (material) query.material = material;
      if (marbleType) query.marbleType = marbleType;
      if (finish) query.finish = finish;

      // Colors
      if (colors) {
        const colorArray = (colors as string).split(',');
        query.colors = { $in: colorArray };
      }

      // Dimensions
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

      // Stock
      if (inStock !== undefined) {
        query.inStock = inStock === 'true';
        if (query.inStock) {
          query.stockQuantity = { $gt: 0 };
        }
      }

      // Featured / New
      if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
      if (isNew !== undefined) query.isNew = isNew === 'true';

      // Rating
      if (rating) {
        query.rating = { $gte: Number(rating) };
      }

      // Tags
      if (tags) {
        const tagArray = (tags as string).split(',');
        query.tags = { $in: tagArray };
      }

      // Sorting
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
      console.error('Get all products error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get product by slug
   */
  static async getBySlug(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { slug } = req.params;
      const product = await Product.findOne({ slug, isActive: true })
        .populate('category', 'name slug')
        .populate('subCategory', 'name slug');

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Increment view count (optional)
      await Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } });

      return res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error('Get product by slug error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get product by ID
   */
  static async getById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const product = await Product.findById(id)
        .populate('category', 'name slug')
        .populate('subCategory', 'name slug');

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      return res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error('Get product by ID error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Create a new product (admin)
   */
  static async create(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const productData = { ...req.body };
      if (productData.isNew !== undefined && productData.isNewProduct === undefined) {
        productData.isNewProduct = productData.isNew;
      }

      // Check if slug is provided, else generate from name
      if (!productData.slug) {
        productData.slug = productData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }

      // Check for duplicate slug
      const existingProduct = await Product.findOne({ slug: productData.slug });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'Product slug already exists',
        });
      }

      // Validate category
      if (productData.category) {
        const category = await Category.findById(productData.category);
        if (!category) {
          return res.status(400).json({
            success: false,
            message: 'Invalid category',
          });
        }
      }

      const product = new Product(productData);
      await product.save();

      return res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
      });
    } catch (error) {
      console.error('Create product error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Update a product (admin)
   */
  static async update(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const updates = { ...req.body };
      if (updates.isNew !== undefined && updates.isNewProduct === undefined) {
        updates.isNewProduct = updates.isNew;
      }

      // Check if product exists
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Check slug uniqueness if updating slug
      if (updates.slug && updates.slug !== product.slug) {
        const existingProduct = await Product.findOne({ slug: updates.slug });
        if (existingProduct) {
          return res.status(400).json({
            success: false,
            message: 'Product slug already exists',
          });
        }
      }

      // Validate category if updating
      if (updates.category) {
        const category = await Category.findById(updates.category);
        if (!category) {
          return res.status(400).json({
            success: false,
            message: 'Invalid category',
          });
        }
      }

      const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      });

      return res.json({
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct,
      });
    } catch (error) {
      console.error('Update product error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Delete a product (admin)
   */
  static async delete(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Soft delete or hard delete? We'll soft delete by setting isActive to false
      product.isActive = false;
      await product.save();

      return res.json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      console.error('Delete product error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get featured products
   */
  static async getFeatured(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 8;
      const products = await Product.find({ isFeatured: true, isActive: true })
        .limit(limit)
        .sort({ createdAt: -1 });
      return res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      console.error('Get featured products error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get new arrivals
   */
  static async getNewArrivals(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 8;
      const products = await Product.find({ isNew: true, isActive: true })
        .limit(limit)
        .sort({ createdAt: -1 });
      return res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      console.error('Get new arrivals error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get best sellers (by sales count)
   */
  static async getBestSellers(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 8;
      // This would typically be based on order data; for now, we'll just sort by view count or some rating
      const products = await Product.find({ isActive: true })
        .limit(limit)
        .sort({ salesCount: -1 }); // you'd need a salesCount field
      return res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      console.error('Get best sellers error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get trending products
   */
  static async getTrending(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 8;
      const products = await Product.find({ isActive: true })
        .limit(limit)
        .sort({ viewCount: -1 });
      return res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      console.error('Get trending products error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get related products
   */
  static async getRelated(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const limit = req.query.limit ? Number(req.query.limit) : 6;
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Find products with same category or tags
      const related = await Product.find({
        _id: { $ne: id },
        isActive: true,
        $or: [
          { category: product.category },
          { tags: { $in: product.tags || [] } },
        ],
      })
        .limit(limit)
        .sort({ createdAt: -1 });

      return res.json({
        success: true,
        data: related,
      });
    } catch (error) {
      console.error('Get related products error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get product categories with counts
   */
  static async getCategories(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const categories = await Product.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
        { $project: { _id: 0, id: '$_id', name: '$category.name', slug: '$category.slug', count: 1 } },
      ]);
      return res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      console.error('Get categories error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get filter options (materials, colors, price range)
   */
  static async getFilterOptions(req: AuthRequest, res: Response): Promise<Response> {
    try {
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

      return res.json({
        success: true,
        data: {
          materials: materials.filter(Boolean),
          colors: colors.filter(Boolean),
          priceRange: {
            min: priceRangeObj.minPrice || 0,
            max: priceRangeObj.maxPrice || 0,
          },
          heights: heights.filter(Boolean).sort((a, b) => a - b),
          weights: weights.filter(Boolean).sort((a, b) => a - b),
          tags: tags.filter(Boolean),
        },
      });
    } catch (error) {
      console.error('Get filter options error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Autocomplete search
   */
  static async autocomplete(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { q, limit = 5 } = req.query;
      if (!q || (q as string).length < 2) {
        return res.json({
          success: true,
          data: [],
        });
      }

      const products = await Product.find({
        isActive: true,
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { tags: { $in: [q] } },
        ],
      })
        .limit(Number(limit))
        .select('name slug images price material');

      return res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      console.error('Autocomplete error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Advanced search (similar to getAll but with different response)
   */
  static async search(req: AuthRequest, res: Response): Promise<Response> {
    // Reuse getAll logic but we'll just forward to getAll
    return ProductController.getAll(req, res);
  }

  /**
   * Compare multiple products
   */
  static async compare(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { ids } = req.query;
      if (!ids) {
        return res.status(400).json({
          success: false,
          message: 'Product IDs are required',
        });
      }

      const idArray = (ids as string).split(',');
      const products = await Product.find({
        _id: { $in: idArray },
        isActive: true,
      });

      // Return products for comparison (frontend will handle attribute comparison)
      return res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      console.error('Compare error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Check product availability
   */
  static async checkAvailability(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      const inStock = product.inStock && (product.stockQuantity || 0) > 0;
      return res.json({
        success: true,
        data: {
          inStock,
          stockQuantity: product.stockQuantity || 0,
          estimatedDelivery: inStock ? '3-5 business days' : 'Out of stock',
        },
      });
    } catch (error) {
      console.error('Check availability error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get product reviews
   */
  static async getReviews(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const reviews = await Review.find({ product: id, isActive: true })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

      const total = await Review.countDocuments({ product: id, isActive: true });
      const averageRating = await Review.aggregate([
        { $match: { product: new mongoose.Types.ObjectId(id) } },
        { $group: { _id: null, avg: { $avg: '$rating' } } },
      ]);

      return res.json({
        success: true,
        data: {
          reviews,
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
          averageRating: averageRating[0]?.avg || 0,
        },
      });
    } catch (error) {
      console.error('Get reviews error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Submit a review
   */
  static async submitReview(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { rating, comment, title, anonymous } = req.body;
      const userId = req.user?.id;

      // Check if product exists
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Check if user already reviewed this product
      const existingReview = await Review.findOne({ product: id, user: userId });
      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this product',
        });
      }

      const review = new Review({
        product: id,
        user: userId,
        rating,
        comment,
        title,
        isAnonymous: anonymous || false,
      });

      await review.save();

      // Update product rating (recalculate average)
      const stats = await Review.aggregate([
        { $match: { product: new mongoose.Types.ObjectId(id) } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]);

      if (stats.length > 0) {
        product.rating = stats[0].avg;
        product.reviewCount = stats[0].count;
        await product.save();
      }

      return res.status(201).json({
        success: true,
        message: 'Review submitted successfully',
        data: review,
      });
    } catch (error) {
      console.error('Submit review error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Custom murti request
   */
  static async customRequest(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { name, email, phone, description, budget, dimensions, referenceImages } = req.body;

      // Save to custom request collection (you'd have a model for this)
      // For now, just send email or store in database
      // You'd have a CustomRequest model
      // const customRequest = new CustomRequest({ ... });

      return res.status(201).json({
        success: true,
        message: 'Custom request submitted successfully. We will contact you soon.',
        data: {
          requestId: 'CR' + Date.now(),
          estimatedResponseTime: '24 hours',
        },
      });
    } catch (error) {
      console.error('Custom request error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Track product view
   */
  static async trackView(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      await Product.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
      return res.json({
        success: true,
      });
    } catch (error) {
      console.error('Track view error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get recently viewed products (requires session or user)
   */
  static async getRecentlyViewed(req: AuthRequest, res: Response): Promise<Response> {
    // This would typically use user session or a separate collection.
    // For simplicity, we'll return an empty array or you can implement with cookies.
    return res.json({
      success: true,
      data: [],
    });
  }

  /**
   * Upload product images (admin)
   */
  static async uploadImages(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No images uploaded',
        });
      }

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
      const imageUrls = results.map((r) => r.secure_url);

      return res.json({
        success: true,
        data: {
          images: imageUrls,
        },
      });
    } catch (error) {
      console.error('Upload images error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Bulk import products (admin)
   */
  static async bulkImport(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      // Parse CSV/JSON and import products
      // This is a placeholder; you'd implement parsing logic
      // const products = parseFile(file);
      // await Product.insertMany(products);

      return res.json({
        success: true,
        message: 'Products imported successfully',
        data: {
          imported: 0,
          failed: 0,
        },
      });
    } catch (error) {
      console.error('Bulk import error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Add variant to product
   */
  static async addVariant(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const variantData = req.body;

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Generate variant ID
      variantData.id = new mongoose.Types.ObjectId().toString();
      product.variants = [...(product.variants ?? []), variantData];
      await product.save();

      return res.status(201).json({
        success: true,
        message: 'Variant added successfully',
        data: product,
      });
    } catch (error) {
      console.error('Add variant error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Update variant
   */
  static async updateVariant(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id, variantId } = req.params;
      const updates = req.body;

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      const variant = (product.variants ?? []).find((v) => v.id === variantId);
      if (!variant) {
        return res.status(404).json({
          success: false,
          message: 'Variant not found',
        });
      }

      Object.assign(variant, updates);
      await product.save();

      return res.json({
        success: true,
        message: 'Variant updated successfully',
        data: product,
      });
    } catch (error) {
      console.error('Update variant error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Delete variant
   */
  static async deleteVariant(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id, variantId } = req.params;

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      product.variants = (product.variants ?? []).filter(
  (v) => v.id !== variantId
);
      await product.save();

      return res.json({
        success: true,
        message: 'Variant deleted successfully',
        data: product,
      });
    } catch (error) {
      console.error('Delete variant error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}