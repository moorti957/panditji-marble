// backend/src/routes/upload.routes.ts

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { UploadController } from '../controllers/UploadController';
import { validate } from '../middlewares/validate';
import { auth } from '../middlewares/auth';

// import { admin } from '../middlewares/auth'; // uncomment when role middleware is ready

const router = Router();

// Rate limiting for upload operations
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  message: { message: 'Too many upload attempts, please try again later.' },
});

// ============================================================
// Validation Schemas
// ============================================================

const deleteFileValidation = [
  param('publicId').notEmpty().withMessage('Public ID is required'),
];

const uploadTypeValidation = [
  body('type').optional().isIn(['avatar', 'product', 'gallery', 'blog']),
];

// ============================================================
// Routes
// ============================================================

// Upload a single file
router.post(
  '/',
  auth,
  uploadLimiter,
  uploadTypeValidation,
  validate,
  UploadController.uploadSingle
);

// Upload multiple files
router.post(
  '/multiple',
  auth,
  uploadLimiter,
  uploadTypeValidation,
  validate,
  UploadController.uploadMultiple
);

// Upload product images (specific)
router.post(
  '/product',
  auth,
  // admin, // uncomment when role middleware is ready
  uploadLimiter,
  body('productId').isMongoId().withMessage('Invalid product ID'),
  validate,
  UploadController.uploadProductImages
);

// Upload avatar
router.post(
  '/avatar',
  auth,
  uploadLimiter,
  UploadController.uploadAvatar
);

// Upload gallery images
router.post(
  '/gallery',
  auth,
  // admin,
  uploadLimiter,
  body('galleryId').optional().isMongoId(),
  validate,
  UploadController.uploadGalleryImages
);

// Upload blog images
router.post(
  '/blog',
  auth,
  // admin,
  uploadLimiter,
  body('blogId').optional().isMongoId(),
  validate,
  UploadController.uploadBlogImages
);

// Delete a file from Cloudinary
router.delete(
  '/:publicId',
  auth,
  // admin,
  deleteFileValidation,
  validate,
  UploadController.deleteFile
);

// Delete multiple files
router.delete(
  '/bulk',
  auth,
  // admin,
  body('publicIds').isArray().withMessage('Public IDs array is required'),
  body('publicIds.*').notEmpty().withMessage('Each public ID must be non-empty'),
  validate,
  UploadController.deleteMultipleFiles
);

// Get signed upload URL (for client-side direct uploads)
router.get(
  '/signed-url',
  auth,
  query('type').optional().isIn(['avatar', 'product', 'gallery', 'blog']),
  query('folder').optional().trim(),
  validate,
  UploadController.getSignedUploadUrl
);

export default router;