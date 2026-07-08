// backend/src/services/AuthService.ts

import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User, IUser } from '../models/User';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';


export class AuthService {
  /**
   * Generate JWT Access Token
   */
  static generateAccessToken(user: IUser): string {
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
    };
   return jwt.sign(
  payload,
  process.env.JWT_SECRET as string,
  {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
  }
);
  }

  /**
   * Generate JWT Refresh Token
   */
  static generateRefreshToken(user: IUser): string {
    const payload = {
      id: user._id,
    };
    return jwt.sign(
  payload,
  process.env.JWT_REFRESH_SECRET as string,
  {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '30d') as any,
  }
);
  }

  /**
   * Verify Access Token
   */
  static verifyAccessToken(token: string): any {
    try {
      return jwt.verify(token, process.env.JWT_SECRET as string);
    } catch (error) {
      throw new AppError('Invalid or expired access token', 401);
    }
  }

  /**
   * Verify Refresh Token
   */
  static verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET as string);
    } catch (error) {
      throw new AppError('Invalid or expired refresh token', 401);
    }
  }

  /**
   * Hash a password
   */
  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  /**
   * Compare a plain password with a hashed password
   */
  static async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Register a new user
   */
  static async register(userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: string;
  }) {
    const { name, email, phone, password, role } = userData;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('User already exists with this email', 400);
    }

    // Hash password
    

    // Create user
    const user = new User({
      name,
      email,
      phone,
      password,
      role: role || 'user',
      isActive: true,
      emailVerified: false,
    });

    await user.save();

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    // In a real implementation, save token to user or separate collection
    // For now, we can store in user document or use a separate model
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Remove sensitive data from user object
   const userObj = user.toObject();

const {
  password: _password,
  verificationToken: _verificationToken,
  verificationTokenExpires: _verificationTokenExpires,
  resetPasswordToken: _resetPasswordToken,
  resetPasswordExpires: _resetPasswordExpires,
  ...safeUser
} = userObj;

return {
  user: safeUser,
  accessToken,
  refreshToken,
};
  }

  /**
   * Login user
   */
  /**
 * Login user
 */
static async login(credentials: { email: string; password: string }) {
  const { email, password } = credentials;

  console.log("========== LOGIN START ==========");
  console.log("Email:", email);

  // Find user including password
  const user = await User.findOne({
    email: email.toLowerCase().trim(),
  }).select("+password");

  console.log("User Found:", !!user);

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  console.log("DB Email:", user.email);
  console.log("Role:", user.role);
  console.log("Is Active:", user.isActive);
  console.log("Password Hash:", user.password);

  // Check if user is active
  if (!user.isActive) {
    throw new AppError(
      "Account is deactivated. Please contact support.",
      403
    );
  }

  // Compare password
  const isPasswordValid = await this.comparePassword(
    password,
    user.password
  );

  console.log("Password Match:", isPasswordValid);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate JWT Tokens
  const accessToken = this.generateAccessToken(user);
  const refreshToken = this.generateRefreshToken(user);

  // Remove sensitive fields
  const userObj = user.toObject();

  const {
    password: _password,
    verificationToken: _verificationToken,
    verificationTokenExpires: _verificationTokenExpires,
    resetPasswordToken: _resetPasswordToken,
    resetPasswordExpires: _resetPasswordExpires,
    ...safeUser
  } = userObj;

  console.log("========== LOGIN SUCCESS ==========");

  return {
    user: safeUser,
    accessToken,
    refreshToken,
  };
}

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = this.verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.id);
      if (!user) {
        throw new AppError('User not found', 404);
      }
      const newAccessToken = this.generateAccessToken(user);
      return { accessToken: newAccessToken };
    } catch (error) {
      throw new AppError('Invalid or expired refresh token', 401);
    }
  }

  /**
   * Forgot password – generate reset token
   */
  static async forgotPassword(email: string) {
   const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new AppError('User not found with this email', 404);
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(resetTokenExpiry);
    await user.save();

    // Send reset email (placeholder)
    // const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    // await sendPasswordResetEmail(email, resetLink);

    return { message: 'Password reset link sent to your email' };
  }

  /**
   * Reset password
   */
  static async resetPassword(token: string, newPassword: string) {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    const hashedPassword = await this.hashPassword(newPassword);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { message: 'Password reset successfully' };
  }

  /**
   * Verify email with token
   */
  static async verifyEmail(token: string) {
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return { message: 'Email verified successfully' };
  }

  /**
   * Resend verification email
   */
  static async resendVerification(email: string) {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.emailVerified) {
      throw new AppError('Email already verified', 400);
    }

    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    // Send verification email (placeholder)
    // await sendVerificationEmail(email, verificationToken);

    return { message: 'Verification email resent' };
  }

  /**
   * Change password (authenticated)
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isMatch = await this.comparePassword(currentPassword, user.password);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Hash new password
    const hashedPassword = await this.hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();

    return { message: 'Password changed successfully' };
  }

  /**
   * Logout (client-side removal, optional server-side blacklist)
   * We can implement token blacklisting if needed
   */
  static async logout(userId: string) {
    // In a real implementation, you might add the token to a blacklist
    // For now, just return success
    return { message: 'Logged out successfully' };
  }

  /**
   * Social login (Google, Facebook, etc.)
   */
  static async socialLogin(provider: string, profile: { email: string; name: string; avatar?: string }) {
    const { email, name, avatar } = profile;

    let user = await User.findOne({ email });
    if (!user) {
      // Create new user
      user = new User({
        name,
        email,
        phone: '',
        password: '', // No password for social login
        role: 'user',
        isActive: true,
        emailVerified: true,
        avatar,
      });
      await user.save();
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
const userObj = user.toObject();

const {
  password,
  verificationToken,
  verificationTokenExpires,
  resetPasswordToken,
  resetPasswordExpires,
  ...safeUser
} = userObj;

return {
  user: safeUser,
  accessToken,
  refreshToken,
};
  }
}