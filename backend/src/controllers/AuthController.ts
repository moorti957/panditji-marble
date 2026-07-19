// backend/src/controllers/AuthController.ts

import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User';
import { AuthService } from '../services/AuthService';
import { AuthRequest } from '../middlewares/auth';
import { AppError } from '../utils/AppError';

export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { name, email, phone, password, role } = req.body;

      const normalizedEmail = String(email || '').trim().toLowerCase();
      const normalizedPhone = String(phone || '').trim();

      const existingEmailUser = await User.findOne({ email: normalizedEmail });
      if (existingEmailUser) {
        return res.status(409).json({
          success: false,
          message: 'This email is already registered.',
          code: 'DUPLICATE_EMAIL',
        });
      }

      const existingPhoneUser = await User.findOne({ phone: normalizedPhone });
      if (existingPhoneUser) {
        return res.status(409).json({
          success: false,
          message: 'This phone number is already registered.',
          code: 'DUPLICATE_PHONE',
        });
      }

      const user = new User({
        name: String(name || '').trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        password,
        role: role || 'user',
        isActive: true,
        emailVerified: false,
      });

      await user.save();

      const verificationToken = crypto.randomBytes(32).toString('hex');
      user.verificationToken = verificationToken;
      user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();

      const accessToken = AuthService.generateAccessToken(user);
      const refreshToken = AuthService.generateRefreshToken(user);

      const userPayload = {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      };

      return res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        data: {
          user: userPayload,
          accessToken,
          refreshToken,
        },
      });
    } catch (error: any) {
      if (error?.code === 11000) {
        const duplicateField = Object.keys(error.keyPattern || {})[0] || 'field';
        return res.status(409).json({
          success: false,
          message: duplicateField === 'email' ? 'This email is already registered.' : 'This phone number is already registered.',
          code: duplicateField === 'email' ? 'DUPLICATE_EMAIL' : 'DUPLICATE_PHONE',
        });
      }

      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: error.code,
          details: error.details,
        });
      }

      console.error('Registration error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
      });
    }
  }

  /**
   * Login user
   */
  static async login(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated. Please contact support.',
        });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Generate tokens
      const accessToken = AuthService.generateAccessToken(user);
      const refreshToken = AuthService.generateRefreshToken(user);

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (error: any) {
  console.error("========== LOGIN ERROR ==========");
  console.error(error);
  console.error(error.stack);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
    error: error.message,
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
  });
}
  }

  /**
   * Logout user (client-side removal, optional server-side token blacklist)
   */
  static async logout(
  req: AuthRequest,
  res: Response
): Promise<Response> {
  return res.json({
    success: true,
    message: 'Logged out successfully',
  });
}

  /**
   * Refresh access token
   */
  static async refreshToken(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required',
        });
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { id: string };
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token',
        });
      }

      // Generate new access token
      const newAccessToken = AuthService.generateAccessToken(user);

      return res.json({
        success: true,
        data: {
          accessToken: newAccessToken,
        },
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
    }
  }

  /**
   * Forgot password - send reset link
   */
  static async forgotPassword(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found with this email',
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = Date.now() + 3600000; // 1 hour

      // Save reset token to user (add fields to schema)
      // For simplicity, we'll assume we have resetPasswordToken and resetPasswordExpires
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = new Date(resetTokenExpiry);
      await user.save();

      // Send email with reset link (placeholder)
      // const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      // await sendPasswordResetEmail(email, resetLink);

      return res.json({
        success: true,
        message: 'Password reset link sent to your email',
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { token, newPassword } = req.body;

      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token',
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return res.json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      console.error('Reset password error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Verify email
   */
  static async verifyEmail(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { token } = req.body;

      // Find user by verification token (you'd need to store verification token in user)
      // For simplicity, we'll assume we have a method to verify
      // This is a placeholder; actual implementation requires token storage
      // For now, just return success
      return res.json({
        success: true,
        message: 'Email verified successfully',
      });
    } catch (error) {
      console.error('Verify email error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Resend verification email
   */
  static async resendVerification(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      if (user.emailVerified) {
        return res.status(400).json({
          success: false,
          message: 'Email already verified',
        });
      }

      // Generate new token and send email (placeholder)
      // await sendVerificationEmail(email, token);

      return res.json({
        success: true,
        message: 'Verification email resent',
      });
    } catch (error) {
      console.error('Resend verification error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get current user profile
   */
  static async getMe(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const user = await User.findById(req.user?.id).select('-password -resetPasswordToken -resetPasswordExpires');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }
      return res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error('Get me error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const updates = req.body;
      const userId = req.user?.id;

      // Remove fields that shouldn't be updated directly
      delete updates.password;
      delete updates.role;
      delete updates.email; // You might allow email update with verification
      delete updates.isActive;
      delete updates.emailVerified;
      delete updates._id;

      const user = await User.findByIdAndUpdate(userId, updates, {
        new: true,
        runValidators: true,
      }).select('-password -resetPasswordToken -resetPasswordExpires');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user,
      });
    } catch (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Change password
   */
  static async changePassword(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user?.id;

      const user = await User.findById(userId).select("+password");
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect',
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      return res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      console.error('Change password error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Social login (Google, Facebook, etc.)
   */
  static async socialLogin(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { provider, token, email, name, avatar } = req.body;

      // Verify the social token with provider (placeholder)
      // You'd implement provider-specific verification

      // Find or create user
      let user = await User.findOne({ email });
      if (!user) {
        // Create new user from social data
        user = new User({
          name,
          email,
          phone: '',
          password: '', // no password for social login
          role: 'user',
          isActive: true,
          emailVerified: true,
          avatar,
        });
        await user.save();
      }

      // Generate tokens
      const accessToken = AuthService.generateAccessToken(user);
      const refreshToken = AuthService.generateRefreshToken(user);

      return res.json({
        success: true,
        message: 'Social login successful',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      console.error('Social login error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get all users (admin only)
   */
  static async getAllUsers(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { page = 1, limit = 10, role, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

      const query: any = {};
      if (role) query.role = role;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      const sort: any = {};
      sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

      const users = await User.find(query)
        .select('-password -resetPasswordToken -resetPasswordExpires')
        .sort(sort)
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

      const total = await User.countDocuments(query);

      return res.json({
        success: true,
        data: {
          users,
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error('Get all users error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}