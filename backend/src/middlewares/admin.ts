// backend/src/middlewares/admin.ts

import { Request, Response, NextFunction } from 'express';
import { auth, AuthRequest } from './auth';
import { logger } from '../utils/logger';

/**
 * Admin middleware – verifies user is authenticated and has admin role.
 * 
 * This middleware first runs the `auth` middleware to authenticate the user,
 * then checks if the authenticated user has the role of 'admin' or 'super-admin'.
 * 
 * @param req - Express request object (extended with user)
 * @param res - Express response object
 * @param next - Express next function
 * 
 * @example
 * ```ts
 * router.get('/admin/dashboard', admin, (req, res) => {
 *   res.json({ message: 'Admin dashboard' });
 * });
 * ```
 * 
 * @example
 * ```ts
 * // Combine with other middlewares
 * router.post('/admin/products', auth, admin, productController.create);
 * ```
 */
export const admin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // First, run the auth middleware to authenticate the user
  // We wrap auth in a promise to handle it properly
  try {
    await new Promise<void>((resolve, reject) => {
      auth(req, res, (err?: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  } catch (error) {
    // If auth middleware already sent a response, we should not continue
    // But we check if headers already sent
    if (res.headersSent) {
      return;
    }
    logger.error('Admin middleware - auth failed:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
    return;
  }

  // After auth, check if user exists and has admin role
  const user = req.user;
  if (!user) {
    if (!res.headersSent) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated.',
      });
    }
    return;
  }

  // Check role: allow 'admin' and 'super-admin'
  if (user.role !== 'admin' && user.role !== 'super-admin') {
    if (!res.headersSent) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
        userRole: user.role,
      });
    }
    return;
  }

  // Admin user, proceed to next middleware/route handler
  next();
};

// ============================================================
// Super Admin Middleware
// ============================================================

/**
 * Super admin middleware – only allows super-admin users.
 * 
 * @example
 * ```ts
 * router.get('/super-admin', superAdmin, (req, res) => {
 *   res.json({ message: 'Super admin only' });
 * });
 * ```
 */
export const superAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // First authenticate
  try {
    await new Promise<void>((resolve, reject) => {
      auth(req, res, (err?: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  } catch (error) {
    if (res.headersSent) {
      return;
    }
    logger.error('Super admin middleware - auth failed:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
    return;
  }

  const user = req.user;
  if (!user) {
    if (!res.headersSent) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated.',
      });
    }
    return;
  }

  if (user.role !== 'super-admin') {
    if (!res.headersSent) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Super admin privileges required.',
        userRole: user.role,
      });
    }
    return;
  }

  next();
};

// ============================================================
// Role-based Admin Middleware (generic)
// ============================================================

/**
 * Generic role middleware – checks if user has any of the allowed roles.
 * 
 * @param allowedRoles - Array of role strings (e.g., ['admin', 'super-admin'])
 * @returns Express middleware
 * 
 * @example
 * ```ts
 * router.get('/staff', requireRole(['admin', 'super-admin', 'staff']), (req, res) => {
 *   res.json({ message: 'Staff area' });
 * });
 * ```
 */
export const requireRole = (allowedRoles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    // First authenticate
    try {
      await new Promise<void>((resolve, reject) => {
        auth(req, res, (err?: any) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      if (res.headersSent) {
        return;
      }
      logger.error('Role middleware - auth failed:', error);
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    const user = req.user;
    if (!user) {
      if (!res.headersSent) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated.',
        });
      }
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      if (!res.headersSent) {
        res.status(403).json({
          success: false,
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
          userRole: user.role,
        });
      }
      return;
    }

    next();
  };
};

// ============================================================
// Default Export
// ============================================================

export default {
  admin,
  superAdmin,
  requireRole,
};