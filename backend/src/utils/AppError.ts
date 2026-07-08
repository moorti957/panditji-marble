// backend/src/utils/AppError.ts

/**
 * Custom error class for operational errors.
 * These are errors that are predictable and expected during normal operation
 * (e.g., validation failures, resource not found, authentication issues).
 *
 * Extends the built-in Error class with additional properties for
 * status code, error code, and optional details.
 *
 * @example
 * ```ts
 * throw new AppError('User not found', 404, 'USER_NOT_FOUND');
 * ```
 *
 * @example
 * ```ts
 * throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
 *   fields: ['email', 'password'],
 * });
 * ```
 */
export class AppError extends Error {
  /**
   * HTTP status code for the error (e.g., 400, 404, 500)
   */
  public statusCode: number;

  /**
   * Whether the error is operational (expected) or not.
   * Operational errors are caused by user input or application logic.
   * Programming errors are bugs in the code.
   */
  public isOperational: boolean;

  /**
   * Optional error code for categorizing errors (e.g., 'USER_NOT_FOUND', 'INVALID_TOKEN')
   */
  public code?: string;

  /**
   * Additional details about the error (e.g., validation errors, stack traces)
   */
  public details?: any;

  /**
   * Creates a new AppError instance.
   *
   * @param message - Human-readable error message
   * @param statusCode - HTTP status code (default: 500)
   * @param code - Optional error code for identification
   * @param details - Additional error details
   */
  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: any
  ) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    this.details = details;

    // Capture stack trace (excluding the constructor call)
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Type guard to check if an error is an instance of AppError.
 *
 * @param error - The error to check
 * @returns True if the error is an AppError
 */
export const isAppError = (error: any): error is AppError => {
  return error instanceof AppError;
};

export default AppError;