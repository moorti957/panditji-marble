// backend/src/controllers/UserController.ts

import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User';
import { Order } from '../models/Order';
import { Review } from '../models/Review';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary';

export class UserController {
  /**
   * Get current user profile (authenticated)
   */
  static async getProfile(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const user = await User.findById(userId)
        .select('-password -resetPasswordToken -resetPasswordExpires');

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
      console.error('Get profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Update current user profile
   */
  static async updateProfile(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const updates = req.body;

      // Remove fields that shouldn't be updated directly
      delete updates.password;
      delete updates.role;
      delete updates.isActive;
      delete updates.emailVerified;
      delete updates._id;
      delete updates.createdAt;
      delete updates.updatedAt;

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
   * Delete current user account (soft delete)
   */
  static async deleteAccount(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Soft delete
      user.isActive = false;
      user.deletedAt = new Date();
      await user.save();

      return res.json({
        success: true,
        message: 'Account deleted successfully',
      });
    } catch (error) {
      console.error('Delete account error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get all addresses for the authenticated user
   */
  static async getAddresses(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const user = await User.findById(userId).select('addresses');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      return res.json({
        success: true,
        data: user.addresses || [],
      });
    } catch (error) {
      console.error('Get addresses error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Add a new address
   */
  static async addAddress(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const addressData = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // If this is the first address or set as default, make it default
      if (addressData.isDefault || (user.addresses ?? []).length === 0) {
        // Remove default from other addresses
        (user.addresses ?? []).forEach((addr: any) => {
          addr.isDefault = false;
        });
        addressData.isDefault = true;
      }

      // Generate ID for address
      addressData.id = new mongoose.Types.ObjectId().toString();
      user.addresses = [...(user.addresses ?? []), addressData];
      await user.save();

      return res.status(201).json({
        success: true,
        message: 'Address added successfully',
        data: user.addresses,
      });
    } catch (error) {
      console.error('Add address error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Update an address
   */
  static async updateAddress(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { addressId } = req.params;
      const updates = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const address = (user.addresses ?? []).find((a: any) => a.id ===  addressId);
      if (!address) {
        return res.status(404).json({
          success: false,
          message: 'Address not found',
        });
      }

      // If setting as default, remove default from others
      if (updates.isDefault) {
        user.addresses.forEach((addr: any) => {
          addr.isDefault = false;
        });
      }

      Object.assign(address, updates);
      await user.save();

      return res.json({
        success: true,
        message: 'Address updated successfully',
        data: user.addresses,
      });
    } catch (error) {
      console.error('Update address error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Delete an address
   */
  static async deleteAddress(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { addressId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const address = (user.addresses ?? []).find((a: any) => a.id === addressId);
      if (!address) {
        return res.status(404).json({
          success: false,
          message: 'Address not found',
        });
      }

      // If deleting default address, set another as default if exists
      const wasDefault = address.isDefault;
      user.addresses = (user.addresses ?? []).filter((a: any) => a.id !== addressId);

      if (wasDefault && user.addresses.length > 0) {
        user.addresses[0].isDefault = true;
      }

      await user.save();

      return res.json({
        success: true,
        message: 'Address deleted successfully',
        data: user.addresses,
      });
    } catch (error) {
      console.error('Delete address error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Set default address
   */
  static async setDefaultAddress(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { addressId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const address = (user.addresses ?? []).find((a: any) => a.id === addressId);
      if (!address) {
        return res.status(404).json({
          success: false,
          message: 'Address not found',
        });
      }

      user.addresses.forEach((addr: any) => {
        addr.isDefault = false;
      });
      address.isDefault = true;
      await user.save();

      return res.json({
        success: true,
        message: 'Default address updated',
        data: user.addresses,
      });
    } catch (error) {
      console.error('Set default address error:', error);
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
      const {
        page = 1,
        limit = 10,
        role,
        search,
        isActive,
        emailVerified,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const query: any = {};

      if (role) query.role = role;
      if (isActive !== undefined) query.isActive = isActive === 'true';
      if (emailVerified !== undefined) query.emailVerified = emailVerified === 'true';

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
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

  /**
   * Get a specific user by ID (admin only)
   */
  static async getUserById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const user = await User.findById(id)
        .select('-password -resetPasswordToken -resetPasswordExpires')
        .populate('orders');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Get user stats
      const orderStats = await Order.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(id) } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: '$grandTotal' },
            averageOrderValue: { $avg: '$grandTotal' },
          },
        },
      ]);

      const reviewCount = await Review.countDocuments({ user: id });

      return res.json({
        success: true,
        data: {
          ...user.toObject(),
          stats: {
            totalOrders: orderStats[0]?.totalOrders || 0,
            totalSpent: orderStats[0]?.totalSpent || 0,
            averageOrderValue: orderStats[0]?.averageOrderValue || 0,
            reviewCount,
          },
        },
      });
    } catch (error) {
      console.error('Get user by ID error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Update user role (admin only)
   */
  static async updateUserRole(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { role } = req.body;

      // Prevent self-demotion (optional)
      if (id === req.user?.id) {
        return res.status(400).json({
          success: false,
          message: 'You cannot change your own role',
        });
      }

      const user = await User.findByIdAndUpdate(
        id,
        { role },
        { new: true, runValidators: true }
      ).select('-password -resetPasswordToken -resetPasswordExpires');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      return res.json({
        success: true,
        message: 'User role updated successfully',
        data: user,
      });
    } catch (error) {
      console.error('Update user role error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Update user status (admin only)
   */
  static async updateUserStatus(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      // Prevent self-deactivation
      if (id === req.user?.id && isActive === false) {
        return res.status(400).json({
          success: false,
          message: 'You cannot deactivate your own account',
        });
      }

      const user = await User.findByIdAndUpdate(
        id,
        { isActive },
        { new: true, runValidators: true }
      ).select('-password -resetPasswordToken -resetPasswordExpires');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      return res.json({
        success: true,
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: user,
      });
    } catch (error) {
      console.error('Update user status error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Delete a user (admin only)
   */
  static async deleteUser(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      // Prevent self-deletion
      if (id === req.user?.id) {
        return res.status(400).json({
          success: false,
          message: 'You cannot delete your own account',
        });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Soft delete
      user.isActive = false;
      user.deletedAt = new Date();
      await user.save();

      return res.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      console.error('Delete user error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Bulk delete users (admin only)
   */
  static async bulkDeleteUsers(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { ids } = req.body;

      // Prevent self-deletion
      if (ids.includes(req.user?.id)) {
        return res.status(400).json({
          success: false,
          message: 'You cannot delete your own account',
        });
      }

      await User.updateMany(
        { _id: { $in: ids } },
        { isActive: false, deletedAt: new Date() }
      );

      return res.json({
        success: true,
        message: 'Users deleted successfully',
      });
    } catch (error) {
      console.error('Bulk delete users error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get user statistics (admin only)
   */
  static async getUserStats(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const [
        totalUsers,
        activeUsers,
        newUsersThisMonth,
        usersByRole,
        emailVerified,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        User.countDocuments({
          createdAt: { $gte: new Date(new Date().setDate(1)) },
        }),
        User.aggregate([
          { $group: { _id: '$role', count: { $sum: 1 } } },
        ]),
        User.countDocuments({ emailVerified: true }),
      ]);

      return res.json({
        success: true,
        data: {
          totalUsers,
          activeUsers,
          inactiveUsers: totalUsers - activeUsers,
          newUsersThisMonth,
          emailVerified,
          emailUnverified: totalUsers - emailVerified,
          usersByRole: usersByRole.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
        },
      });
    } catch (error) {
      console.error('Get user stats error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get user activity logs (admin only)
   */
  static async getUserActivity(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;

      // In a real implementation, you'd have an ActivityLog model
      // For now, we'll return order activity
      const orders = await Order.find({ user: id })
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .select('orderNumber status grandTotal createdAt');

      const total = await Order.countDocuments({ user: id });

      return res.json({
        success: true,
        data: {
          activities: orders,
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error('Get user activity error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}