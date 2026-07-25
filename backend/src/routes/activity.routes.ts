import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middlewares/validate';
import { auth, optionalAuth } from '../middlewares/auth';
import { ActivityController } from '../controllers/ActivityController';

const router = Router();

const productIdParamValidation = [
  param('id').isMongoId().withMessage('Invalid product ID'),
];

const favoriteValidation = [
  body('productId').isMongoId().withMessage('Invalid product ID'),
  body('action').isIn(['added', 'removed']).withMessage('Action must be added or removed'),
];

const cartValidation = [
  body('productId').isMongoId().withMessage('Invalid product ID'),
  body('action').isIn(['added', 'removed']).withMessage('Action must be added or removed'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

const searchValidation = [
  body('keyword').notEmpty().withMessage('Search keyword is required').trim(),
  body('resultCount').optional().isInt({ min: 0 }).withMessage('Result count must be a number'),
  body('device').optional().trim(),
  body('ip').optional().trim(),
];

// Track product clicks
router.post(
  '/products/:id/click',
  optionalAuth,
  productIdParamValidation,
  validate,
  ActivityController.trackClick
);

// Log search history
router.post(
  '/search',
  optionalAuth,
  searchValidation,
  validate,
  ActivityController.logSearch
);

// Log favorite add/remove activity
router.post(
  '/favorites',
  auth,
  favoriteValidation,
  validate,
  ActivityController.logFavoriteActivity
);

// Log cart add/remove activity
router.post(
  '/cart',
  auth,
  cartValidation,
  validate,
  ActivityController.logCartActivity
);

export default router;
