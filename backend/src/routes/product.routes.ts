// backend/src/routes/product.routes.ts

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { ProductController } from '../controllers/ProductController';
import { validate } from '../middlewares/validate';
import { auth,  } from '../middlewares/auth';

import { upload } from '../middlewares/upload';

const router = Router();

// Rate limiting for product creation/update (admin)
const productWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: { message: 'Too many product operations, please try again later.' },
});

// Rate limiting for custom requests (public)
const customRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { message: 'Too many custom requests, please try again later.' },
});

// ============================================================
// Validation Schemas
// ============================================================

const productIdParamValidation = [
  param('id').isMongoId().withMessage('Invalid product ID'),
];

const productSlugParamValidation = [
  param('slug').notEmpty().withMessage('Product slug is required'),
];

const createProductValidation = [
  body('name').notEmpty().withMessage('Product name is required').trim().isLength({ min: 2, max: 100 }),
  body('slug').optional().isSlug().withMessage('Slug must be URL-friendly'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isNumeric().withMessage('Price must be a number').isFloat({ min: 0 }),
  body('originalPrice').optional().isNumeric().withMessage('Original price must be a number').isFloat({ min: 0 }),
  body('images').isArray().withMessage('Images must be an array'),
  body('images.*').isURL().withMessage('Each image must be a valid URL'),
  body('category').notEmpty().withMessage('Category is required').isMongoId(),
  body('subCategory').optional().isMongoId(),
  body('material').optional().trim().isString(),
  body('marbleType').optional().trim().isString(),
  body('finish').optional().trim().isString(),
  body('colors').optional().isArray(),
  body('colors.*').isString(),
  body('height').optional().isNumeric(),
  body('width').optional().isNumeric(),
  body('depth').optional().isNumeric(),
  body('weight').optional().isNumeric(),
  body('inStock').optional().isBoolean(),
  body('stockQuantity').optional().isInt({ min: 0 }),
  body('isFeatured').optional().isBoolean(),
  body('isNew').optional().isBoolean(),
  body('tags').optional().isArray(),
  body('tags.*').isString(),
  body('specifications').optional().isArray(),
  body('specifications.*.key').notEmpty(),
  body('specifications.*.value').notEmpty(),
  body('variants').optional().isArray(),
  body('variants.*.name').notEmpty(),
  body('variants.*.price').isNumeric(),
  body('variants.*.stock').isInt({ min: 0 }),
];

const updateProductValidation = [
  param('id').isMongoId().withMessage('Invalid product ID'),
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('slug').optional().isSlug(),
  body('description').optional(),
  body('price').optional().isNumeric().isFloat({ min: 0 }),
  body('originalPrice').optional().isNumeric().isFloat({ min: 0 }),
  body('images').optional().isArray(),
  body('images.*').isURL(),
  body('category').optional().isMongoId(),
  body('subCategory').optional().isMongoId(),
  body('material').optional().trim(),
  body('marbleType').optional().trim(),
  body('finish').optional().trim(),
  body('colors').optional().isArray(),
  body('colors.*').isString(),
  body('height').optional().isNumeric(),
  body('width').optional().isNumeric(),
  body('depth').optional().isNumeric(),
  body('weight').optional().isNumeric(),
  body('inStock').optional().isBoolean(),
  body('stockQuantity').optional().isInt({ min: 0 }),
  body('isFeatured').optional().isBoolean(),
  body('isNew').optional().isBoolean(),
  body('tags').optional().isArray(),
  body('tags.*').isString(),
  body('specifications').optional().isArray(),
  body('specifications.*.key').notEmpty(),
  body('specifications.*.value').notEmpty(),
  body('variants').optional().isArray(),
];

const reviewValidation = [
  param('id').isMongoId().withMessage('Invalid product ID'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').notEmpty().withMessage('Comment is required').isLength({ min: 10 }),
  body('title').optional().trim(),
  body('anonymous').optional().isBoolean(),
];

const customRequestValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('budget').optional().isNumeric(),
  body('dimensions').optional().trim(),
  body('referenceImages').optional().isArray(),
];

const productFilterQueryValidation = [
  query('category').optional().isMongoId(),
  query('subCategory').optional().isMongoId(),
  query('search').optional().trim(),
  query('minPrice').optional().isNumeric(),
  query('maxPrice').optional().isNumeric(),
  query('material').optional().trim(),
  query('marbleType').optional().trim(),
  query('finish').optional().trim(),
  query('colors').optional().isString().customSanitizer(value => value.split(',')),
  query('minHeight').optional().isNumeric(),
  query('maxHeight').optional().isNumeric(),
  query('minWeight').optional().isNumeric(),
  query('maxWeight').optional().isNumeric(),
  query('inStock').optional().isBoolean(),
  query('isFeatured').optional().isBoolean(),
  query('isNew').optional().isBoolean(),
  query('rating').optional().isNumeric(),
  query('tags').optional().isString().customSanitizer(value => value.split(',')),
  query('sort').optional().isIn(['price-asc', 'price-desc', 'newest', 'popular', 'rating', 'name-asc', 'name-desc']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

// ============================================================
// Public Routes (no authentication required)
// ============================================================

// Get all products with filters, sorting, pagination
router.get(
  '/',
  productFilterQueryValidation,
  validate,
  ProductController.getAll
);

// Get product by slug
router.get(
  '/:slug',
  productSlugParamValidation,
  validate,
  ProductController.getBySlug
);

// Get product by ID
router.get(
  '/id/:id',
  productIdParamValidation,
  validate,
  ProductController.getById
);

// Get featured products
router.get(
  '/featured',
  query('limit').optional().isInt({ min: 1, max: 20 }),
  validate,
  ProductController.getFeatured
);

// Get new arrivals
router.get(
  '/new',
  query('limit').optional().isInt({ min: 1, max: 20 }),
  validate,
  ProductController.getNewArrivals
);

// Get best sellers
router.get(
  '/best-sellers',
  query('limit').optional().isInt({ min: 1, max: 20 }),
  validate,
  ProductController.getBestSellers
);

// Get trending products
router.get(
  '/trending',
  query('limit').optional().isInt({ min: 1, max: 20 }),
  validate,
  ProductController.getTrending
);

// Get related products
router.get(
  '/:id/related',
  productIdParamValidation,
  query('limit').optional().isInt({ min: 1, max: 10 }),
  validate,
  ProductController.getRelated
);

// Get product categories (list with counts)
router.get(
  '/categories',
  ProductController.getCategories
);

// Get filter options (materials, colors, price range, etc.)
router.get(
  '/filters',
  ProductController.getFilterOptions
);

// Autocomplete search
router.get(
  '/search/autocomplete',
  query('q').notEmpty().withMessage('Search query is required'),
  query('limit').optional().isInt({ min: 1, max: 20 }),
  validate,
  ProductController.autocomplete
);

// Product search (advanced)
router.get(
  '/search',
  productFilterQueryValidation,
  validate,
  ProductController.search
);

// Compare products
router.get(
  '/compare',
  query('ids').notEmpty().withMessage('Product IDs are required'),
  validate,
  ProductController.compare
);

// Check product availability
router.get(
  '/:id/availability',
  productIdParamValidation,
  validate,
  ProductController.checkAvailability
);

// Get product reviews
router.get(
  '/:id/reviews',
  productIdParamValidation,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  validate,
  ProductController.getReviews
);

// Submit a review (requires authentication)
router.post(
  '/:id/reviews',
  auth,
  reviewValidation,
  validate,
  ProductController.submitReview
);

// Custom murti request (public, with rate limit)
router.post(
  '/custom-request',
  customRequestLimiter,
  customRequestValidation,
  validate,
  ProductController.customRequest
);

// Track product view (public, no validation needed)
router.post(
  '/:id/view',
  productIdParamValidation,
  validate,
  ProductController.trackView
);

// Recently viewed products (requires authentication)
router.get(
  '/recently-viewed',
  auth,
  ProductController.getRecentlyViewed
);

// ============================================================
// Admin Routes (require authentication + admin role)
// ============================================================

// Create product
router.post(
  '/',
  auth,
  // admin, // uncomment when role middleware is available
  productWriteLimiter,
  createProductValidation,
  validate,
  ProductController.create
);

// Update product
router.put(
  '/:id',
  auth,
  // admin,
  productWriteLimiter,
  updateProductValidation,
  validate,
  ProductController.update
);

// Delete product
router.delete(
  '/:id',
  auth,
  // admin,
  productIdParamValidation,
  validate,
  ProductController.delete
);

// Bulk import products (admin only)
router.post(
  '/bulk-import',
  auth,
  // admin,
  upload.single('file'),
  ProductController.bulkImport
);

// Upload product images (admin only) - separate endpoint for image upload
router.post(
  '/upload-images',
  auth,
  // admin,
  upload.array('images', 10), // max 10 images
  ProductController.uploadImages
);

// ============================================================
// Product Variant Routes (admin only)
// ============================================================

// Add variant to product
router.post(
  '/:id/variants',
  auth,
  // admin,
  productIdParamValidation,
  body('name').notEmpty(),
  body('price').isNumeric(),
  body('stock').isInt({ min: 0 }),
  body('attributes').isObject(),
  validate,
  ProductController.addVariant
);

// Update variant
router.put(
  '/:id/variants/:variantId',
  auth,
  // admin,
  param('id').isMongoId(),
  param('variantId').isMongoId(),
  validate,
  ProductController.updateVariant
);

// Delete variant
router.delete(
  '/:id/variants/:variantId',
  auth,
  // admin,
  param('id').isMongoId(),
  param('variantId').isMongoId(),
  validate,
  ProductController.deleteVariant
);

export default router;