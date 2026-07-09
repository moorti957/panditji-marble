// backend/src/middlewares/auth.ts

import {  Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { logger } from '../utils/logger';
import { Request } from 'express';

// ============================================================
// Types
// ============================================================

export type AuthRequest = Request & {
  user?: IUser;
  token?: string;
};

export interface DecodedToken {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// ============================================================
// Token Extraction Helpers
// ============================================================

/**
 * Extract token from Authorization header
 */
const extractTokenFromHeader = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  // Check if it's a Bearer token
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

/**
 * Extract token from cookies (optional)
 */
const extractTokenFromCookie = (req: Request): string | null => {
  if (req.cookies && req.cookies.accessToken) {
    return req.cookies.accessToken;
  }
  return null;
};

/**
 * Extract token from query parameter (for WebSocket or special cases)
 */
const extractTokenFromQuery = (req: Request): string | null => {
  const token = req.query.token as string;
  return token || null;
};

/**
 * Get token from any source (header > cookie > query)
 */
export const getToken = (req: Request): string | null => {
  return (
    extractTokenFromHeader(req) ||
    extractTokenFromCookie(req) ||
    extractTokenFromQuery(req)
  );
};

// ============================================================
// Main Auth Middleware
// ============================================================

/**
 * Authentication middleware - verifies JWT and attaches user to request
 * 
 * @example
 * ```ts
 * router.get('/profile', auth, (req, res) => {
 *   const user = req.user;
 *   res.json(user);
 * });
 * ```
 */
export const auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("\n========== AUTH MIDDLEWARE ==========");

    const token = getToken(req);

    console.log("Authorization Header:", req.headers.authorization);
    console.log("Extracted Token:", token);
    console.log("JWT_SECRET Exists:", !!process.env.JWT_SECRET);

    if (!token) {
      console.log("❌ No token received");

      res.status(401).json({
        success: false,
        message: "Authentication required. Please provide a valid token.",
      });
      return;
    }

    // Verify Token
    let decoded: DecodedToken;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as DecodedToken;

      console.log("✅ Decoded Token:", decoded);
    } catch (error: any) {
      console.log("❌ JWT VERIFY ERROR:", error.name);
      console.log("❌ JWT MESSAGE:", error.message);

      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          success: false,
          message: "Token has expired. Please login again.",
          code: "TOKEN_EXPIRED",
        });
        return;
      }

      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({
          success: false,
          message: "Invalid token. Please provide a valid token.",
          code: "INVALID_TOKEN",
        });
        return;
      }

      res.status(401).json({
        success: false,
        message: "Authentication failed. Please try again.",
      });
      return;
    }

    console.log("Searching User ID:", decoded.id);

    const user = await User.findById(decoded.id).select(
      "-password -resetPasswordToken -resetPasswordExpires -verificationToken -verificationTokenExpires"
    );

    if (!user) {
      console.log("❌ User Not Found");

      res.status(401).json({
        success: false,
        message: "User not found. Please login again.",
      });
      return;
    }

    console.log("✅ User Found:");
    console.log({
      id: user._id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    });

    if (!user.isActive) {
      console.log("❌ User Inactive");

      res.status(403).json({
        success: false,
        message: "Account is deactivated. Please contact support.",
      });
      return;
    }

    req.user = user;
    req.token = token;

    console.log("✅ Auth Success");
    console.log("=====================================\n");

    next();
  } catch (error) {
    console.error("❌ AUTH MIDDLEWARE ERROR");
    console.error(error);

    logger.error("Auth middleware error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error during authentication.",
    });
  }
};

// ============================================================
// Optional Auth Middleware
// ============================================================

/**
 * Optional authentication - doesn't block if no token
 * User will be attached if token is valid, otherwise request proceeds without user
 * 
 * @example
 * ```ts
 * router.get('/products', optionalAuth, (req, res) => {
 *   const user = req.user; // may be undefined
 *   // Return personalized products if user is logged in
 * });
 * ```
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = getToken(req);

    if (!token) {
      next();
      return;
    }

    let decoded: DecodedToken;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    } catch (error) {
      // Token invalid - just continue without authentication
      next();
      return;
    }

    const user = await User.findById(decoded.id)
      .select('-password -resetPasswordToken -resetPasswordExpires -verificationToken -verificationTokenExpires');

    if (user && user.isActive) {
      req.user = user;
      req.token = token;
    }

    next();
  } catch (error) {
    // On error, just continue without authentication
    next();
  }
};

// ============================================================
// Role-Based Authorization
// ============================================================

/**
 * Role-based authorization - restricts access to specific roles
 * Must be used after `auth` middleware
 * 
 * @param roles - Array of allowed roles
 * @returns Middleware function
 * 
 * @example
 * ```ts
 * router.get('/admin', auth, restrictTo(['admin', 'super-admin']), (req, res) => {
 *   res.json({ message: 'Admin only' });
 * });
 * ```
 */
export const restrictTo = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    if (!roles.includes(user.role)) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource.',
        requiredRoles: roles,
        userRole: user.role,
      });
      return;
    }

    next();
  };
};

// ============================================================
// Permission-Based Authorization
// ============================================================

/**
 * Permission-based authorization - restricts access based on permissions
 * Must be used after `auth` middleware
 * 
 * @param permissions - Array of required permissions
 * @returns Middleware function
 * 
 * @example
 * ```ts
 * router.get('/products/manage', auth, hasPermission(['manage_products']), (req, res) => {
 *   res.json({ message: 'You can manage products' });
 * });
 * ```
 */
export const hasPermission = (permissions: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    // For simplicity, admin and super-admin have all permissions
    if (user.role === 'admin' || user.role === 'super-admin') {
      next();
      return;
    }

    // Check user permissions (you may have a permissions field on user)
    // For now, we'll use role-based mapping
    const rolePermissions: Record<string, string[]> = {
      user: ['view_products', 'place_orders', 'view_orders'],
      seller: ['view_products', 'manage_products', 'view_orders'],
      admin: ['*'], // All permissions
      'super-admin': ['*'], // All permissions
    };

    const userPermissions = rolePermissions[user.role] || [];

    if (userPermissions.includes('*')) {
      next();
      return;
    }

    const hasAllPermissions = permissions.every((p) => userPermissions.includes(p));

    if (!hasAllPermissions) {
      res.status(403).json({
        success: false,
        message: 'You do not have the required permissions.',
        requiredPermissions: permissions,
      });
      return;
    }

    next();
  };
};

// ============================================================
// Shortcuts for Common Roles
// ============================================================

/**
 * Only allow admin and super-admin
 */
export const adminOnly = restrictTo(['admin', 'super-admin']);

/**
 * Only allow admin, super-admin, and seller
 */
export const staffOnly = restrictTo(['admin', 'super-admin', 'seller']);

/**
 * Only allow super-admin
 */
export const superAdminOnly = restrictTo(['super-admin']);

// ============================================================
// Device / Session Verification (Optional)
// ============================================================

/**
 * Verify that the request is from a trusted device (optional)
 * You can extend this to check device fingerprints or IP whitelisting
 */
export const verifyDevice = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const user = req.user;
  const userAgent = req.headers['user-agent'];
  const ip = req.ip || req.connection.remoteAddress;

  // In a real implementation, you might check against stored device fingerprints
  // For now, just pass through
  next();
};

// ============================================================
// Default Export
// ============================================================

export default {
  auth,
  optionalAuth,
  restrictTo,
  hasPermission,
  adminOnly,
  staffOnly,
  superAdminOnly,
  verifyDevice,
  getToken,
};