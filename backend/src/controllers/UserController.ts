// backend/src/controllers/UserController.ts

import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Order } from '../models/Order';
import { ProductClick } from '../models/ProductClick';
import { SearchHistory } from '../models/SearchHistory';
import { FavoriteActivity } from '../models/FavoriteActivity';
import { CartActivity } from '../models/CartActivity';

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
      const userId = req.params.id;
      const user = await User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires');

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
    } catch (error: any) {
  console.error("========== FULL ERROR ==========");
  console.error(error);
  console.error(error.stack);
  console.error("NAME:", error.name);
  console.error("MESSAGE:", error.message);
  console.error("================================");

  return res.status(500).json({
    success: false,
    message: error.message,
  });
}
  }

  /**
   * Update user role (admin only)
   */
  static async updateUserRole(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.params.id;
      const { role } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      user.role = role;
      await user.save();

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
      const userId = req.params.id;
      const { isActive } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      user.isActive = isActive;
      await user.save();

      return res.json({
        success: true,
        message: 'User status updated successfully',
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
   * Delete user (admin only)
   */
  static async deleteUser(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.params.id;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

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
      await User.updateMany({ _id: { $in: ids } }, { isActive: false, deletedAt: new Date() });

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
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ isActive: true });
      const adminUsers = await User.countDocuments({ role: { $in: ['admin', 'super-admin'] } });

      return res.json({
        success: true,
        data: {
          totalUsers,
          activeUsers,
          adminUsers,
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
      const userId = req.params.id;
      const page = Number(req.query.page) || 1;
      const limit = Math.min(Number(req.query.limit) || 20, 50);

      const [orders, productClicks, searchHistory, favoriteActivities, cartActivities, totalOrders] =
        await Promise.all([
          Order.find({ user: userId })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit),
          ProductClick.find({ user: userId })
            .sort({ lastClickedAt: -1 })
            .limit(limit)
            .populate('product', 'name slug'),
          SearchHistory.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(limit),
          FavoriteActivity.find({ user: userId })
            .sort({ timestamp: -1 })
            .limit(limit)
            .populate('product', 'name slug'),
          CartActivity.find({ user: userId })
            .sort({ timestamp: -1 })
            .limit(limit)
            .populate('product', 'name slug'),
          Order.countDocuments({ user: userId }),
        ]);

      const totalClicks = await ProductClick.countDocuments({ user: userId });
      const totalSearches = await SearchHistory.countDocuments({ user: userId });
      const totalFavorites = await FavoriteActivity.countDocuments({ user: userId });
      const totalCartActions = await CartActivity.countDocuments({ user: userId });

      return res.json({
        success: true,
        data: {
          orders,
          productClicks,
          searchHistory,
          favoriteActivities,
          cartActivities,
          totals: {
            orders: totalOrders,
            productClicks: totalClicks,
            searchHistory: totalSearches,
            favoriteActivities: totalFavorites,
            cartActivities: totalCartActions,
          },
          page,
          limit,
          totalPages: Math.ceil(totalOrders / limit),
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
