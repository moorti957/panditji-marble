// backend/src/validators/product.validator.ts

import { body, param, query, ValidationChain, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middlewares/errorHandler';
import mongoose from 'mongoose';

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
 * Validate MongoDB ObjectId
 */
export const validateObjectId = (field: string, paramType: 'body' | 'param' | 'query' = 'param'): ValidationChain => {
  const validator = param(field);
  return validator
    .notEmpty()
    .withMessage(`${field} is required`)
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage(`Invalid ${field} format`);
};

/**
 * Validate product ID (param)
 */
export const validateProductId = (): ValidationChain => {
  return param('id')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID format');
};

/**
 * Validate product slug (param)
 */
export const validateProductSlug = (): ValidationChain => {
  return param('slug')
    .notEmpty()
    .withMessage('Product slug is required')
    .isSlug()
    .withMessage('Invalid slug format')
    .trim()
    .toLowerCase();
};

/**
 * Validate price
 */
export const validatePrice = (field: string = 'price', required: boolean = true): ValidationChain => {
  const validator = body(field);
  if (required) {
    validator.notEmpty().withMessage('Price is required');
  }
  return validator
    .optional({ checkFalsy: !required })
    .isNumeric()
    .withMessage('Price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Price must be greater than or equal to 0')
    .toFloat();
};

/**
 * Validate product name
 */
export const validateProductName = (field: string = 'name', required: boolean = true): ValidationChain => {
  const validator = body(field);
  if (required) {
    validator.notEmpty().withMessage('Product name is required');
  }
  return validator
    .optional({ checkFalsy: !required })
    .isString()
    .withMessage('Name must be a string')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .trim()
    .escape();
};

/**
 * Validate slug (optional)
 */
export const validateSlug = (field: string = 'slug', required: boolean = false): ValidationChain => {
  const validator = body(field);
  if (required) {
    validator.notEmpty().withMessage('Slug is required');
  }
  return validator
    .optional({ checkFalsy: !required })
    .isSlug()
    .withMessage('Slug must be URL-friendly (e.g., my-product-name)')
    .trim()
    .toLowerCase()
    .escape();
};

/**
 * Validate images array
 */
export const validateImages = (field: string = 'images', required: boolean = true): ValidationChain => {
  const validator = body(field);
  if (required) {
    validator.notEmpty().withMessage('At least one image is required');
  }
  return validator
    .optional({ checkFalsy: !required })
    .isArray({ min: 1 })
    .withMessage('Images must be an array with at least one URL')
    .custom((value) => value.every((url: any) => typeof url === 'string' && url.startsWith('http')))
    .withMessage('Each image must be a valid URL starting with http')
    .toArray();
};

/**
 * Validate specifications array
 */
export const validateSpecifications = (): ValidationChain => {
  return body('specifications')
    .optional()
    .isArray()
    .withMessage('Specifications must be an array')
    .custom((value) => {
      if (!value) return true;
      return value.every((spec: any) => 
        spec.key && typeof spec.key === 'string' &&
        spec.value && typeof spec.value === 'string'
      );
    })
    .withMessage('Each specification must have a key and value');
};

/**
 * Validate variants array
 */
export const validateVariants = (): ValidationChain => {
  return body('variants')
    .optional()
    .isArray()
    .withMessage('Variants must be an array')
    .custom((value) => {
      if (!value) return true;
      return value.every((variant: any) =>
        variant.name && typeof variant.name === 'string' &&
        variant.price !== undefined && typeof variant.price === 'number' &&
        variant.stock !== undefined && typeof variant.stock === 'number' &&
        variant.attributes && typeof variant.attributes === 'object'
      );
    })
    .withMessage('Each variant must have name, price, stock, and attributes');
};

/**
 * Validate tags array
 */
export const validateTags = (): ValidationChain => {
  return body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((value) => {
      if (!value) return true;
      return value.every((tag: any) => typeof tag === 'string' && tag.trim().length > 0);
    })
    .withMessage('Each tag must be a non-empty string');
};

/**
 * Validate colors array
 */
export const validateColors = (): ValidationChain => {
  return body('colors')
    .optional()
    .isArray()
    .withMessage('Colors must be an array')
    .custom((value) => {
      if (!value) return true;
      return value.every((color: any) => typeof color === 'string' && color.trim().length > 0);
    })
    .withMessage('Each color must be a non-empty string');
};

// ============================================================
// Create Product Validator
// ============================================================

export const createProductValidator: ValidationChain[] = [
  validateProductName('name', true),
  validateSlug('slug', false),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isString()
    .withMessage('Description must be a string')
    .trim()
    .escape(),
  validatePrice('price', true),
  body('originalPrice')
    .optional()
    .isNumeric()
    .withMessage('Original price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Original price must be greater than or equal to 0')
    .toFloat()
    .custom((value, { req }) => {
      if (value !== undefined && value < req.body.price) {
        throw new Error('Original price must be greater than sale price');
      }
      return true;
    }),
  validateImages('images', true),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isMongoId()
    .withMessage('Invalid category ID'),
  body('subCategory')
    .optional()
    .isMongoId()
    .withMessage('Invalid sub-category ID'),
  body('material')
    .optional()
    .isString()
    .withMessage('Material must be a string')
    .trim()
    .escape(),
  body('marbleType')
    .optional()
    .isString()
    .withMessage('Marble type must be a string')
    .trim()
    .escape(),
  body('finish')
    .optional()
    .isString()
    .withMessage('Finish must be a string')
    .trim()
    .escape(),
  validateColors(),
  body('height')
    .optional()
    .isNumeric()
    .withMessage('Height must be a number')
    .isFloat({ min: 0 })
    .withMessage('Height must be greater than or equal to 0')
    .toFloat(),
  body('width')
    .optional()
    .isNumeric()
    .withMessage('Width must be a number')
    .isFloat({ min: 0 })
    .withMessage('Width must be greater than or equal to 0')
    .toFloat(),
  body('depth')
    .optional()
    .isNumeric()
    .withMessage('Depth must be a number')
    .isFloat({ min: 0 })
    .withMessage('Depth must be greater than or equal to 0')
    .toFloat(),
  body('weight')
    .optional()
    .isNumeric()
    .withMessage('Weight must be a number')
    .isFloat({ min: 0 })
    .withMessage('Weight must be greater than or equal to 0')
    .toFloat(),
  body('inStock')
    .optional()
    .isBoolean()
    .withMessage('In stock must be a boolean')
    .toBoolean(),
  body('stockQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer')
    .toInt(),
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('Is featured must be a boolean')
    .toBoolean(),
  body('isNew')
    .optional()
    .isBoolean()
    .withMessage('Is new must be a boolean')
    .toBoolean(),
  validateTags(),
  validateSpecifications(),
  validateVariants(),
  body('seo')
    .optional()
    .isObject()
    .withMessage('SEO must be an object'),
];

// ============================================================
// Update Product Validator
// ============================================================

export const updateProductValidator: ValidationChain[] = [
  validateProductId(),
  validateProductName('name', false),
  validateSlug('slug', false),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .trim()
    .escape(),
  validatePrice('price', false),
  body('originalPrice')
    .optional()
    .isNumeric()
    .withMessage('Original price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Original price must be greater than or equal to 0')
    .toFloat()
    .custom((value, { req }) => {
      if (value !== undefined && req.body.price !== undefined && value < req.body.price) {
        throw new Error('Original price must be greater than sale price');
      }
      return true;
    }),
  validateImages('images', false),
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),
  body('subCategory')
    .optional()
    .isMongoId()
    .withMessage('Invalid sub-category ID'),
  body('material')
    .optional()
    .isString()
    .withMessage('Material must be a string')
    .trim()
    .escape(),
  body('marbleType')
    .optional()
    .isString()
    .withMessage('Marble type must be a string')
    .trim()
    .escape(),
  body('finish')
    .optional()
    .isString()
    .withMessage('Finish must be a string')
    .trim()
    .escape(),
  validateColors(),
  body('height')
    .optional()
    .isNumeric()
    .withMessage('Height must be a number')
    .isFloat({ min: 0 })
    .withMessage('Height must be greater than or equal to 0')
    .toFloat(),
  body('width')
    .optional()
    .isNumeric()
    .withMessage('Width must be a number')
    .isFloat({ min: 0 })
    .withMessage('Width must be greater than or equal to 0')
    .toFloat(),
  body('depth')
    .optional()
    .isNumeric()
    .withMessage('Depth must be a number')
    .isFloat({ min: 0 })
    .withMessage('Depth must be greater than or equal to 0')
    .toFloat(),
  body('weight')
    .optional()
    .isNumeric()
    .withMessage('Weight must be a number')
    .isFloat({ min: 0 })
    .withMessage('Weight must be greater than or equal to 0')
    .toFloat(),
  body('inStock')
    .optional()
    .isBoolean()
    .withMessage('In stock must be a boolean')
    .toBoolean(),
  body('stockQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer')
    .toInt(),
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('Is featured must be a boolean')
    .toBoolean(),
  body('isNew')
    .optional()
    .isBoolean()
    .withMessage('Is new must be a boolean')
    .toBoolean(),
  validateTags(),
  validateSpecifications(),
  validateVariants(),
  body('seo')
    .optional()
    .isObject()
    .withMessage('SEO must be an object'),
];

// ============================================================
// Product Filter Validator (query params)
// ============================================================

export const productFilterValidator: ValidationChain[] = [
  query('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),
  query('subCategory')
    .optional()
    .isMongoId()
    .withMessage('Invalid sub-category ID'),
  query('search')
    .optional()
    .isString()
    .withMessage('Search query must be a string')
    .trim()
    .escape(),
  query('minPrice')
    .optional()
    .isNumeric()
    .withMessage('Min price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Min price must be greater than or equal to 0')
    .toFloat(),
  query('maxPrice')
    .optional()
    .isNumeric()
    .withMessage('Max price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Max price must be greater than or equal to 0')
    .toFloat()
    .custom((value, { req }) => {
      const minPrice = req.query?.minPrice;

if (minPrice && value < Number(minPrice))  {
        throw new Error('Max price must be greater than min price');
      }
      return true;
    }),
  query('material')
    .optional()
    .isString()
    .withMessage('Material must be a string')
    .trim()
    .escape(),
  query('marbleType')
    .optional()
    .isString()
    .withMessage('Marble type must be a string')
    .trim()
    .escape(),
  query('finish')
    .optional()
    .isString()
    .withMessage('Finish must be a string')
    .trim()
    .escape(),
  query('colors')
    .optional()
    .isString()
    .withMessage('Colors must be a comma-separated string')
    .customSanitizer((value) => value ? value.split(',') : []),
  query('minHeight')
    .optional()
    .isNumeric()
    .withMessage('Min height must be a number')
    .toFloat(),
  query('maxHeight')
    .optional()
    .isNumeric()
    .withMessage('Max height must be a number')
    .toFloat(),
  query('minWeight')
    .optional()
    .isNumeric()
    .withMessage('Min weight must be a number')
    .toFloat(),
  query('maxWeight')
    .optional()
    .isNumeric()
    .withMessage('Max weight must be a number')
    .toFloat(),
  query('inStock')
    .optional()
    .isBoolean()
    .withMessage('In stock must be a boolean')
    .toBoolean(),
  query('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('Is featured must be a boolean')
    .toBoolean(),
  query('isNew')
    .optional()
    .isBoolean()
    .withMessage('Is new must be a boolean')
    .toBoolean(),
  query('rating')
    .optional()
    .isNumeric()
    .withMessage('Rating must be a number')
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5')
    .toFloat(),
  query('tags')
    .optional()
    .isString()
    .withMessage('Tags must be a comma-separated string')
    .customSanitizer((value) => value ? value.split(',') : []),
  query('sort')
    .optional()
    .isIn(['price-asc', 'price-desc', 'newest', 'popular', 'rating', 'name-asc', 'name-desc'])
    .withMessage('Invalid sort option'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
];

// ============================================================
// Product ID Param Validator
// ============================================================

export const productIdParamValidator: ValidationChain[] = [
  validateProductId(),
];

// ============================================================
// Product Slug Param Validator
// ============================================================

export const productSlugParamValidator: ValidationChain[] = [
  validateProductSlug(),
];

// ============================================================
// Review Validator
// ============================================================

export const reviewValidator: ValidationChain[] = [
  validateProductId(),
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5')
    .toInt(),
  body('comment')
    .notEmpty()
    .withMessage('Comment is required')
    .isString()
    .withMessage('Comment must be a string')
    .isLength({ min: 10, max: 500 })
    .withMessage('Comment must be between 10 and 500 characters')
    .trim()
    .escape(),
  body('title')
    .optional()
    .isString()
    .withMessage('Title must be a string')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters')
    .trim()
    .escape(),
  body('anonymous')
    .optional()
    .isBoolean()
    .withMessage('Anonymous must be a boolean')
    .toBoolean(),
];

// ============================================================
// Custom Request Validator
// ============================================================

export const customRequestValidator: ValidationChain[] = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .trim()
    .escape(),
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .trim(),
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number')
    .trim(),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isString()
    .withMessage('Description must be a string')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters')
    .trim()
    .escape(),
  body('budget')
    .optional()
    .isNumeric()
    .withMessage('Budget must be a number')
    .isFloat({ min: 0 })
    .withMessage('Budget must be greater than or equal to 0')
    .toFloat(),
  body('dimensions')
    .optional()
    .isString()
    .withMessage('Dimensions must be a string')
    .trim()
    .escape(),
  body('referenceImages')
    .optional()
    .isArray()
    .withMessage('Reference images must be an array')
    .custom((value) => {
      if (!value) return true;
      return value.every((url: any) => typeof url === 'string' && url.startsWith('http'));
    })
    .withMessage('Each reference image must be a valid URL'),
];

// ============================================================
// Variant Validators
// ============================================================

export const addVariantValidator: ValidationChain[] = [
  validateProductId(),
  body('name')
    .notEmpty()
    .withMessage('Variant name is required')
    .isString()
    .withMessage('Variant name must be a string')
    .trim()
    .escape(),
  body('price')
    .notEmpty()
    .withMessage('Variant price is required')
    .isNumeric()
    .withMessage('Variant price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Variant price must be greater than or equal to 0')
    .toFloat(),
  body('stock')
    .notEmpty()
    .withMessage('Variant stock is required')
    .isInt({ min: 0 })
    .withMessage('Variant stock must be a non-negative integer')
    .toInt(),
  body('attributes')
    .notEmpty()
    .withMessage('Variant attributes are required')
    .isObject()
    .withMessage('Variant attributes must be an object'),
  body('sku')
    .optional()
    .isString()
    .withMessage('SKU must be a string')
    .trim()
    .escape(),
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('Is default must be a boolean')
    .toBoolean(),
];

export const updateVariantValidator: ValidationChain[] = [
  validateProductId(),
  param('variantId')
    .notEmpty()
    .withMessage('Variant ID is required')
    .isMongoId()
    .withMessage('Invalid variant ID'),
  body('name')
    .optional()
    .isString()
    .withMessage('Variant name must be a string')
    .trim()
    .escape(),
  body('price')
    .optional()
    .isNumeric()
    .withMessage('Variant price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Variant price must be greater than or equal to 0')
    .toFloat(),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Variant stock must be a non-negative integer')
    .toInt(),
  body('attributes')
    .optional()
    .isObject()
    .withMessage('Variant attributes must be an object'),
  body('sku')
    .optional()
    .isString()
    .withMessage('SKU must be a string')
    .trim()
    .escape(),
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('Is default must be a boolean')
    .toBoolean(),
];

export const deleteVariantValidator: ValidationChain[] = [
  validateProductId(),
  param('variantId')
    .notEmpty()
    .withMessage('Variant ID is required')
    .isMongoId()
    .withMessage('Invalid variant ID'),
];

// ============================================================
// Export all validators
// ============================================================

const productValidators = {
  createProductValidator,
  updateProductValidator,
  productFilterValidator,
  productIdParamValidator,
  productSlugParamValidator,
  reviewValidator,
  customRequestValidator,
  addVariantValidator,
  updateVariantValidator,
  deleteVariantValidator,
  validate,
  // Reusable rules
  validateProductId,
  validateProductSlug,
  validatePrice,
  validateProductName,
  validateSlug,
  validateImages,
  validateSpecifications,
  validateVariants,
  validateTags,
  validateColors,
  validateObjectId,
};

export default productValidators;