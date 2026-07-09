// backend/src/routes/category.routes.ts

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { CategoryController } from '../controllers/CategoryController';
import { validate } from '../middlewares/validate';
import { auth, } from '../middlewares/auth';


const router = Router();

// Rate limiting for write operations
const categoryWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  message: { message: 'Too many category operations, please try again later.' },
});

// ============================================================
// Validation Schemas
// ============================================================

const categoryIdParamValidation = [
  param('id').isMongoId().withMessage('Invalid category ID'),
];

const categorySlugParamValidation = [
  param('slug').notEmpty().withMessage('Category slug is required'),
];

const createCategoryValidation = [
  body('name')
    .notEmpty()
    .withMessage('Category name is required')
    .trim()
    .isLength({ min: 2, max: 50 }),

  body('slug')
    .optional({ checkFalsy: true })
    .isSlug()
    .withMessage('Slug must be URL-friendly'),

  body('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 }),

  body('image')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Image must be a valid URL'),

  body('parentId')
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid parent ID'),

  body('displayOrder')
    .optional()
    .isInt({ min: 0 }),

  body('isActive')
    .optional()
    .isBoolean(),

  body('isFeatured')
    .optional()
    .isBoolean(),

  body('seo')
    .optional()
    .isObject(),

  body('seo.title')
    .optional({ checkFalsy: true })
    .trim(),

  body('seo.description')
    .optional({ checkFalsy: true })
    .trim(),
];

const updateCategoryValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid category ID'),

  body('name')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 50 }),

  body('slug')
    .optional({ checkFalsy: true })
    .isSlug()
    .withMessage('Slug must be URL-friendly'),

  body('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 }),

  body('image')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Image must be a valid URL'),

  body('parentId')
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid parent ID'),

  body('displayOrder')
    .optional()
    .isInt({ min: 0 }),

  body('isActive')
    .optional()
    .isBoolean(),

  body('isFeatured')
    .optional()
    .isBoolean(),

  body('seo')
    .optional()
    .isObject(),

  body('seo.title')
    .optional({ checkFalsy: true })
    .trim(),

  body('seo.description')
    .optional({ checkFalsy: true })
    .trim(),
];

const categoryProductQueryValidation = [
  param('slug')
    .notEmpty()
    .withMessage('Category slug is required'),

  query('page')
    .optional({ checkFalsy: true })
    .isInt({ min: 1 }),

  query('limit')
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 100 }),

  query('sort')
    .optional({ checkFalsy: true })
    .isIn(['price-asc', 'price-desc', 'newest', 'popular']),
];

// ============================================================
// Public Routes (no authentication)
// ============================================================

// Get all categories with optional filters
router.get(
  '/',
  query('parentId')
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid parent ID'),
 query('isActive')
  .optional({ checkFalsy: true })
  .isBoolean(),

query('isFeatured')
  .optional({ checkFalsy: true })
  .isBoolean(),

query('search')
  .optional({ checkFalsy: true })
  .trim(),

query('limit')
  .optional({ checkFalsy: true })
  .isInt({ min: 1, max: 999 }),

query('page')
  .optional({ checkFalsy: true })
  .isInt({ min: 1 }),
  validate,
  CategoryController.getAll
);

// Get category tree (nested hierarchy)
router.get(
  '/tree',
  CategoryController.getTree
);

// Get featured categories
router.get(
  '/featured',
  query('limit').optional().isInt({ min: 1, max: 20 }),
  validate,
  CategoryController.getFeatured
);

// Get category by slug
router.get(
  '/:slug',
  categorySlugParamValidation,
  validate,
  CategoryController.getBySlug
);

// Get category by ID
router.get(
  '/id/:id',
  categoryIdParamValidation,
  validate,
  CategoryController.getById
);

// Get products in a category (by slug)
router.get(
  '/:slug/products',
  categorySlugParamValidation,
  categoryProductQueryValidation,
  validate,
  CategoryController.getCategoryProducts
);

// ============================================================
// Admin Routes (require authentication + admin role)
// ============================================================

// Create a new category
router.post(
  '/',
  auth,
  // admin, // uncomment when role middleware is ready
  categoryWriteLimiter,
  createCategoryValidation,
  validate,
  CategoryController.create
);

// Update a category
router.put(
  '/:id',
  auth,
  // admin,
  categoryWriteLimiter,
  updateCategoryValidation,
  validate,
  CategoryController.update
);

// Delete a category (soft delete or hard delete?)
// We'll implement soft delete by setting isActive to false
router.delete(
  '/:id',
  auth,
  // admin,
  categoryIdParamValidation,
  validate,
  CategoryController.delete
);

// Toggle category featured status
router.patch(
  '/:id/toggle-featured',
  auth,
  // admin,
  categoryIdParamValidation,
  validate,
  CategoryController.toggleFeatured
);

// Reorder categories (bulk update displayOrder)
router.put(
  '/reorder',
  auth,
  // admin,
  body('categories').isArray().withMessage('Categories array is required'),
  body('categories.*.id').isMongoId().withMessage('Invalid category ID'),
  body('categories.*.displayOrder').isInt({ min: 0 }),
  validate,
  CategoryController.reorder
);

// Bulk delete categories
router.delete(
  '/bulk',
  auth,
  // admin,
  body('ids').isArray().withMessage('IDs array is required'),
  body('ids.*').isMongoId().withMessage('Invalid category ID'),
  validate,
  CategoryController.bulkDelete
);

export default router;