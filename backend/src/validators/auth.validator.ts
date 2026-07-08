// backend/src/validators/auth.validator.ts

import { body, ValidationChain, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middlewares/errorHandler';

// ============================================================
// Helper: Validation Error Handler
// ============================================================

/**
 * Middleware to check validation results and return formatted errors
 */
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => ({
      field: (err as any).path || (err as any).param || 'unknown',
      message: err.msg,
    }));
    throw new AppError(
      'Validation failed',
      400,
      'VALIDATION_ERROR',
      errorMessages
    );
  }
  next();
};

// ============================================================
// Reusable Validation Rules
// ============================================================

/**
 * Validate email field
 */
export const validateEmail = (field: string = 'email'): ValidationChain => {
  return body(field)
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .trim();
};

/**
 * Validate password field
 */
export const validatePassword = (
  field: string = 'password',
  minLength: number = 6
): ValidationChain => {
  return body(field)
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: minLength })
    .withMessage(`Password must be at least ${minLength} characters`)
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .optional()
    .trim();
};

/**
 * Validate confirm password (must match password)
 */
export const validateConfirmPassword = (
  passwordField: string = 'password',
  confirmField: string = 'confirmPassword'
): ValidationChain => {
  return body(confirmField)
    .notEmpty()
    .withMessage('Confirm password is required')
    .custom((value, { req }) => value === req.body[passwordField])
    .withMessage('Passwords do not match')
    .trim();
};

/**
 * Validate name field
 */
export const validateName = (field: string = 'name'): ValidationChain => {
  return body(field)
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .trim()
    .escape();
};

/**
 * Validate phone number
 */
export const validatePhone = (field: string = 'phone'): ValidationChain => {
  return body(field)
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number')
    .trim();
};

/**
 * Validate OTP
 */
export const validateOTP = (field: string = 'otp'): ValidationChain => {
  return body(field)
    .notEmpty()
    .withMessage('OTP is required')
    .isLength({ min: 4, max: 8 })
    .withMessage('OTP must be between 4 and 8 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers')
    .trim();
};

/**
 * Validate token
 */
export const validateToken = (field: string = 'token'): ValidationChain => {
  return body(field)
    .notEmpty()
    .withMessage('Token is required')
    .isString()
    .withMessage('Token must be a string')
    .trim();
};

// ============================================================
// Registration Validator
// ============================================================

export const registerValidator: ValidationChain[] = [
  validateName('name'),
  validateEmail('email'),
  validatePhone('phone'),
  validatePassword('password', 6),
  validateConfirmPassword('password', 'confirmPassword'),
  body('terms')
    .notEmpty()
    .withMessage('You must accept the terms and conditions')
    .isBoolean()
    .withMessage('Terms must be a boolean')
    .custom((value) => value === true)
    .withMessage('You must accept the terms and conditions'),
  body('role')
    .optional()
    .isIn(['user', 'seller'])
    .withMessage('Invalid role specified'),
];

// ============================================================
// Login Validator
// ============================================================

export const loginValidator: ValidationChain[] = [
  validateEmail('email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isString()
    .withMessage('Password must be a string')
    .trim(),
  body('rememberMe')
    .optional()
    .isBoolean()
    .withMessage('Remember me must be a boolean'),
];

// ============================================================
// Forgot Password Validator
// ============================================================

export const forgotPasswordValidator: ValidationChain[] = [
  validateEmail('email'),
];

// ============================================================
// Reset Password Validator
// ============================================================

export const resetPasswordValidator: ValidationChain[] = [
  validateToken('token'),
  validatePassword('newPassword', 6),
  validateConfirmPassword('newPassword', 'confirmPassword'),
];

// ============================================================
// Change Password Validator
// ============================================================

export const changePasswordValidator: ValidationChain[] = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required')
    .isString()
    .withMessage('Current password must be a string')
    .trim(),
  validatePassword('newPassword', 6),
  validateConfirmPassword('newPassword', 'confirmPassword'),
];

// ============================================================
// Verify Email Validator
// ============================================================

export const verifyEmailValidator: ValidationChain[] = [
  validateToken('token'),
];

// ============================================================
// Resend Verification Validator
// ============================================================

export const resendVerificationValidator: ValidationChain[] = [
  validateEmail('email'),
];

// ============================================================
// Social Login Validator
// ============================================================

export const socialLoginValidator: ValidationChain[] = [
  body('provider')
    .notEmpty()
    .withMessage('Provider is required')
    .isIn(['google', 'facebook', 'apple'])
    .withMessage('Invalid provider'),
  body('token')
    .notEmpty()
    .withMessage('Social token is required')
    .isString()
    .withMessage('Social token must be a string')
    .trim(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .trim(),
  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .trim(),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL')
    .trim(),
];

// ============================================================
// Refresh Token Validator
// ============================================================

export const refreshTokenValidator: ValidationChain[] = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
    .isString()
    .withMessage('Refresh token must be a string')
    .trim(),
];

// ============================================================
// Logout Validator (optional - might not need validation)
// ============================================================

export const logoutValidator: ValidationChain[] = [];

// ============================================================
// Update Profile Validator
// ============================================================

export const updateProfileValidator: ValidationChain[] = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .trim()
    .escape(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .trim(),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number')
    .trim(),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL')
    .trim(),
];

// ============================================================
// Export all validators as a group
// ============================================================

const authValidators = {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
  verifyEmailValidator,
  resendVerificationValidator,
  socialLoginValidator,
  refreshTokenValidator,
  logoutValidator,
  updateProfileValidator,
  validate,
  // Reusable rules
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateName,
  validatePhone,
  validateOTP,
  validateToken,
};

export default authValidators;