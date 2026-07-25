// backend/src/routes/user.routes.ts

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { UserController } from '../controllers/UserController';
import { validate } from '../middlewares/validate';
import { auth } from '../middlewares/auth';
// import { admin } from '../middlewares/auth'; // uncomment when role middleware is ready

const router = Router();

// Rate limiting for sensitive operations
const userUpdateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { message: 'Too many update attempts, please try again later.' },
});

const userDeleteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { message: 'Too many delete attempts, please try again later.' },
});

// ============================================================
// Validation Schemas
// ============================================================

const userIdParamValidation = [
  param('id').isMongoId().withMessage('Invalid user ID'),
];

const updateProfileValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 50 }),
  body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').optional().isMobilePhone('any').withMessage('Valid phone number is required'),
  body('avatar').optional().isURL().withMessage('Avatar must be a valid URL'),
  body('addresses').optional().isArray(),
  body('addresses.*.fullName').optional().trim(),
  body('addresses.*.addressLine1').optional().trim(),
  body('addresses.*.city').optional().trim(),
  body('addresses.*.state').optional().trim(),
  body('addresses.*.pincode').optional().trim(),
  body('addresses.*.country').optional().trim(),
  body('addresses.*.phone').optional().trim(),
  body('addresses.*.isDefault').optional().isBoolean(),
];

const updateUserRoleValidation = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('role').isIn(['user', 'admin', 'seller', 'super-admin']).withMessage('Invalid role'),
];

const updateUserStatusValidation = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('isActive').isBoolean().withMessage('isActive must be a boolean'),
];

const userQueryValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('role').optional().isIn(['user', 'admin', 'seller', 'super-admin']),
  query('search').optional().trim(),
  query('isActive').optional().isBoolean(),
  query('emailVerified').optional().isBoolean(),
  query('sortBy').optional().isIn(['name', 'email', 'createdAt', 'updatedAt']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
];

const addAddressValidation = [
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('addressLine1').notEmpty().withMessage('Address line 1 is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('state').notEmpty().withMessage('State is required'),
  body('pincode').notEmpty().withMessage('Pincode is required'),
  body('country').optional().default('India'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('isDefault').optional().isBoolean(),
  body('addressType').optional().isIn(['home', 'office', 'other']),
];

const updateAddressValidation = [
  param('addressId').isMongoId().withMessage('Invalid address ID'),
  body('fullName').optional().trim(),
  body('addressLine1').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('pincode').optional().trim(),
  body('country').optional().trim(),
  body('phone').optional().trim(),
  body('isDefault').optional().isBoolean(),
  body('addressType').optional().isIn(['home', 'office', 'other']),
];

// ============================================================
// Routes
// ============================================================

// -------------------- User Profile (Authenticated) --------------------

// Get current user profile
router.get(
  '/me',
  auth,
  UserController.getProfile
);

// Update current user profile
router.put(
  '/me',
  auth,
  userUpdateLimiter,
  updateProfileValidation,
  validate,
  UserController.updateProfile
);

// Delete current user account (soft delete)
router.delete(
  '/me',
  auth,
  userDeleteLimiter,
  UserController.deleteAccount
);

// ============================================================
// Address Management (Authenticated)
// ============================================================

// Get all addresses for the authenticated user
router.get(
  '/me/addresses',
  auth,
  UserController.getAddresses
);

// Add a new address
router.post(
  '/me/addresses',
  auth,
  addAddressValidation,
  validate,
  UserController.addAddress
);

// Update an address
router.put(
  '/me/addresses/:addressId',
  auth,
  updateAddressValidation,
  validate,
  UserController.updateAddress
);

// Delete an address
router.delete(
  '/me/addresses/:addressId',
  auth,
  param('addressId').isMongoId().withMessage('Invalid address ID'),
  validate,
  UserController.deleteAddress
);

// Set default address
router.patch(
  '/me/addresses/:addressId/default',
  auth,
  param('addressId').isMongoId().withMessage('Invalid address ID'),
  validate,
  UserController.setDefaultAddress
);

// ============================================================
// Admin Routes (require admin role)
// ============================================================

// Get all users (admin only)
router.get(
  '/',
  auth,
  // admin,
  userQueryValidation,
  validate,
  UserController.getAllUsers
);

// Get user statistics (admin only)
router.get(
  '/stats',
  auth,
  // admin,
  UserController.getUserStats
);

// Bulk delete users (admin only)
router.delete(
  '/bulk',
  auth,
  // admin,
  body('ids').isArray().withMessage('IDs array is required'),
  body('ids.*').isMongoId().withMessage('Invalid user ID'),
  validate,
  UserController.bulkDeleteUsers
);

// Get a specific user by ID (admin only)
router.get(
  '/:id',
  auth,
  // admin,
  userIdParamValidation,
  validate,
  UserController.getUserById
);

// Update user role (admin only)
router.patch(
  '/:id/role',
  auth,
  // admin,
  updateUserRoleValidation,
  validate,
  UserController.updateUserRole
);

// Update user status (admin only)
router.patch(
  '/:id/status',
  auth,
  // admin,
  updateUserStatusValidation,
  validate,
  UserController.updateUserStatus
);

// Delete user (admin only)
router.delete(
  '/:id',
  auth,
  // admin,
  userDeleteLimiter,
  userIdParamValidation,
  validate,
  UserController.deleteUser
);

// Bulk delete users (admin only)
router.delete(
  '/bulk',
  auth,
  // admin,
  body('ids').isArray().withMessage('IDs array is required'),
  body('ids.*').isMongoId().withMessage('Invalid user ID'),
  validate,
  UserController.bulkDeleteUsers
);

// ============================================================
// User Activity & Analytics (admin only)
// ============================================================

// Get user activity logs (admin only)
router.get(
  '/:id/activity',
  auth,
  // admin,
  userIdParamValidation,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  validate,
  UserController.getUserActivity
);

export default router;