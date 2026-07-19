// backend/src/routes/auth.routes.ts

import { Router } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { AuthController } from '../controllers/AuthController';
import { validate } from '../middlewares/validate';
import { auth } from '../middlewares/auth';


const router = Router();

// Rate limiters for security
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: { message: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 registration attempts per hour
  message: { message: 'Too many registration attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schemas
const registerValidation = [
  body('name').notEmpty().withMessage('Name is required').trim().isLength({ min: 2, max: 50 }),
  body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
  body('phone').notEmpty().withMessage('Phone number is required').trim().matches(/^\d{10}$/).withMessage('Phone number must be a valid 10-digit Indian number'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters').matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter').matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter').matches(/[0-9]/).withMessage('Password must contain at least one number'),
  body('confirmPassword').custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
];

const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Passwords do not match'),
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Passwords do not match'),
];

const updateProfileValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 50 }),
  body('phone').optional().isMobilePhone('any'),
  body('avatar').optional().isURL().withMessage('Invalid avatar URL'),
];

const verifyEmailValidation = [
  body('token').notEmpty().withMessage('Verification token is required'),
];

const resendVerificationValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
];

// ============================================================
// Public Routes
// ============================================================

// Register
router.post(
  '/register',
  registerLimiter,
  registerValidation,
  validate,
  AuthController.register
);

// Login
router.post(
  '/login',
  loginLimiter,
  loginValidation,
  validate,
  AuthController.login
);

// Logout (requires authentication)
router.post('/logout', auth, AuthController.logout);

// Refresh Token
router.post('/refresh-token', AuthController.refreshToken);

// Forgot Password
router.post(
  '/forgot-password',
  forgotPasswordValidation,
  validate,
  AuthController.forgotPassword
);

// Reset Password
router.post(
  '/reset-password',
  resetPasswordValidation,
  validate,
  AuthController.resetPassword
);

// Verify Email
router.post(
  '/verify-email',
  verifyEmailValidation,
  validate,
  AuthController.verifyEmail
);

// Resend Verification
router.post(
  '/resend-verification',
  resendVerificationValidation,
  validate,
  AuthController.resendVerification
);

// ============================================================
// Protected Routes (require authentication)
// ============================================================

// Get current user
router.get('/me', auth, AuthController.getMe);

// Update profile
router.put(
  '/update-profile',
  auth,
  updateProfileValidation,
  validate,
  AuthController.updateProfile
);

// Change password
router.post(
  '/change-password',
  auth,
  changePasswordValidation,
  validate,
  AuthController.changePassword
);

// Social Login routes (if using OAuth)
router.post('/social-login', AuthController.socialLogin);

// ============================================================
// Admin only routes (optional)
// ============================================================

// Example: Get all users (admin only)
router.get(
  '/users',
  auth,
  // optionally add role middleware: hasRole(ROLES.ADMIN),
  AuthController.getAllUsers
);

export default router;