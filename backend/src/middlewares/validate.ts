// backend/src/middlewares/validate.ts

import { Request, Response, NextFunction } from 'express';
import { validationResult, Result, ValidationError } from 'express-validator';
import { AppError } from './errorHandler';

/**
 * Validation middleware – checks for validation errors from express-validator
 * and throws an AppError with a 400 status if any are found.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 *
 * @example
 * ```ts
 * import { validate } from '../middlewares/validate';
 * import { body } from 'express-validator';
 *
 * router.post(
 *   '/users',
 *   [
 *     body('email').isEmail(),
 *     body('password').isLength({ min: 6 }),
 *   ],
 *   validate,
 *   userController.create
 * );
 * ```
 */
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors: Result<ValidationError> = validationResult(req);

  if (!errors.isEmpty()) {
    // Format errors as an array of { field, message }
   const formattedErrors = errors.array().map((err: any) => ({
  field: err.path || err.param || 'unknown',
  message: err.msg,
}));

    // Throw an AppError with the validation details
    throw new AppError(
      'Validation failed',
      400,
      'VALIDATION_ERROR',
      formattedErrors
    );
  }

  next();
};

/**
 * Optional validation – logs validation errors but does not throw,
 * allowing the request to continue. Useful for optional fields validation.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const validateOptional = (req: Request, res: Response, next: NextFunction): void => {
  const errors: Result<ValidationError> = validationResult(req);

  if (!errors.isEmpty()) {
    // Just log errors but continue
    console.warn('Optional validation errors:', errors.array());
  }

  next();
};

/**
 * Middleware to handle validation errors and send a formatted response
 * without throwing. This is useful if you prefer to respond directly
 * rather than using a global error handler.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 *
 * @example
 * ```ts
 * router.post('/login', loginValidator, validateOrRespond, authController.login);
 * ```
 */
export const validateOrRespond = (req: Request, res: Response, next: NextFunction): void => {
  const errors: Result<ValidationError> = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: errors.array().map((err: any) => ({
        field: err.path || err.param || 'unknown',
        message: err.msg,
      })),
    });
    return;
  }

  next();
};

/**
 * Validate a single field (helper for custom validation).
 * This is not a middleware but a utility function.
 */
export const validateField = (value: any, validators: ((v: any) => boolean)[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  for (const validator of validators) {
    try {
      const result = validator(value);
      if (result !== true) {
        errors.push(typeof result === 'string' ? result : 'Validation failed');
      }
    } catch (err) {
      errors.push((err as Error).message);
    }
  }
  return { valid: errors.length === 0, errors };
};

/**
 * Default export – contains the main validate middleware
 */
export default validate;