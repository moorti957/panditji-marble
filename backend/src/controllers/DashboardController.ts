// backend/src/controllers/DashboardController.ts

import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import mongoose from 'mongoose';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { User } from '../models/User';
import { Category } from '../models/Category';

export class DashboardController {
  /**
   * Get main dashboard statistics (overview cards)
   */
  static async getStats(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { startDate, endDate } = req.query;

      const dateFilter: any = {};
      if (startDate) dateFilter.$gte = new Date(startDate as string);
      if (endDate) dateFilter.$lte = new Date(endDate as string);

      const match: any = {};
      if (startDate || endDate) {
        match.createdAt = dateFilter;
      }

      // Total orders, revenue, etc.
      const orderStats = await Order.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$grandTotal' },
            averageOrderValue: { $avg: '$grandTotal' },
            pendingOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
            },
            processingOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] },
            },
            shippedOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] },
            },
            deliveredOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] },
            },
            cancelledOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
            },
          },
        },
      ]);

      // Total products
      const totalProducts = await Product.countDocuments({ isActive: true });
      const outOfStock = await Product.countDocuments({
        isActive: true,
        inStock: false,
      });

      // Total users
      const totalUsers = await User.countDocuments({ isActive: true });
      const newUsers = await User.countDocuments({
        isActive: true,
        createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) },
      });

      const stats = orderStats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        pendingOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
      };

      return res.json({
        success: true,
        data: {
          orders: {
            total: stats.totalOrders,
            pending: stats.pendingOrders,
            processing: stats.processingOrders,
            shipped: stats.shippedOrders,
            delivered: stats.deliveredOrders,
            cancelled: stats.cancelledOrders,
          },
          revenue: {
            total: stats.totalRevenue,
            averageOrderValue: stats.averageOrderValue,
          },
          products: {
            total: totalProducts,
            outOfStock,
          },
          customers: {
            total: totalUsers,
            new: newUsers,
          },
        },
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get revenue analytics over time
   */
  static async getRevenue(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { period = 'month', startDate, endDate } = req.query;

      let dateFilter: any = {};
      if (startDate) dateFilter.$gte = new Date(startDate as string);
      if (endDate) dateFilter.$lte = new Date(endDate as string);

      // Group by period
      let groupBy: any;
      let dateFormat: string;
      switch (period) {
        case 'day':
          groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
          dateFormat = 'YYYY-MM-DD';
          break;
        case 'week':
          groupBy = { $week: '$createdAt' };
          dateFormat = 'Week';
          break;
        case 'month':
          groupBy = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
          dateFormat = 'YYYY-MM';
          break;
        case 'quarter':
          groupBy = {
            $concat: [
              { $toString: { $year: '$createdAt' } },
              '-Q',
              { $toString: { $ceil: { $divide: [{ $month: '$createdAt' }, 3] } } },
            ],
          };
          dateFormat = 'YYYY-Q';
          break;
        default:
          groupBy = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
          dateFormat = 'YYYY-MM';
      }

      const match: any = {};
      if (startDate || endDate) {
        match.createdAt = dateFilter;
      }

      const revenueData = await Order.aggregate([
        { $match: { ...match, status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: groupBy,
            revenue: { $sum: '$grandTotal' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      return res.json({
        success: true,
        data: revenueData,
      });
    } catch (error) {
      console.error('Get revenue analytics error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get order analytics (by status)
   */
  static async getOrderAnalytics(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { startDate, endDate } = req.query;

      const match: any = {};
      if (startDate) match.createdAt = { $gte: new Date(startDate as string) };
      if (endDate) match.createdAt = { ...match.createdAt, $lte: new Date(endDate as string) };

      const statusDistribution = await Order.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]);

      // Orders by day (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const dailyOrders = await Order.aggregate([
        {
          $match: {
            ...match,
            createdAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      return res.json({
        success: true,
        data: {
          statusDistribution,
          dailyOrders,
        },
      });
    } catch (error) {
      console.error('Get order analytics error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get product analytics (top products, low stock, etc.)
   */
  static async getProductAnalytics(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 10;

      // Top selling products (based on order items)
      const topProducts = await Order.aggregate([
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            totalSold: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product',
          },
        },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            productId: '$_id',
            name: '$product.name',
            images: '$product.images',
            totalSold: 1,
            totalRevenue: 1,
          },
        },
      ]);

      // Low stock products
      const lowStockThreshold = 5;
      const lowStockProducts = await Product.find({
        isActive: true,
        inStock: true,
        stockQuantity: { $lte: lowStockThreshold },
      })
        .select('name slug images stockQuantity price')
        .sort({ stockQuantity: 1 })
        .limit(20);

      // Most viewed products
      const mostViewed = await Product.find({ isActive: true })
        .sort({ viewCount: -1 })
        .limit(limit)
        .select('name slug images price viewCount');

      return res.json({
        success: true,
        data: {
          topProducts,
          lowStockProducts,
          mostViewed,
        },
      });
    } catch (error) {
      console.error('Get product analytics error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get customer analytics (new customers, top customers)
   */
  static async getCustomerAnalytics(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { startDate, endDate, page = 1, limit = 10 } = req.query;

      const match: any = {};
      if (startDate) match.createdAt = { $gte: new Date(startDate as string) };
      if (endDate) match.createdAt = { ...match.createdAt, $lte: new Date(endDate as string) };

      // New customers over time
      const newCustomers = await User.aggregate([
        { $match: { ...match, isActive: true } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Top customers by order value
      const topCustomers = await Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: '$user',
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: '$grandTotal' },
          },
        },
        { $sort: { totalSpent: -1 } },
        { $limit: Number(limit) },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            userId: '$_id',
            name: '$user.name',
            email: '$user.email',
            totalOrders: 1,
            totalSpent: 1,
          },
        },
      ]);

      // Total customers by role
      const roles = await User.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]);

      return res.json({
        success: true,
        data: {
          newCustomers,
          topCustomers,
          roles,
        },
      });
    } catch (error) {
      console.error('Get customer analytics error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get sales data over time (for charts)
   */
  static async getSalesData(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { interval = 'daily', startDate, endDate } = req.query;

      let dateFilter: any = {};
      if (startDate) dateFilter.$gte = new Date(startDate as string);
      if (endDate) dateFilter.$lte = new Date(endDate as string);

      let groupBy: any;
      switch (interval) {
        case 'hourly':
          groupBy = {
            $dateToString: { format: '%Y-%m-%d %H:00', date: '$createdAt' },
          };
          break;
        case 'daily':
          groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
          break;
        case 'weekly':
          groupBy = { $isoWeek: '$createdAt' };
          break;
        case 'monthly':
          groupBy = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
          break;
        default:
          groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
      }

      const salesData = await Order.aggregate([
        { $match: { ...dateFilter, status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: groupBy,
            revenue: { $sum: '$grandTotal' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      return res.json({
        success: true,
        data: salesData,
      });
    } catch (error) {
      console.error('Get sales data error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get recent orders for dashboard widget
   */
  static async getRecentOrders(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 10;

      const orders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('user', 'name email')
        .populate('items.product', 'name slug images');

      return res.json({
        success: true,
        data: orders,
      });
    } catch (error) {
      console.error('Get recent orders error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get top products for dashboard
   */
  static async getTopProducts(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { limit = 10, period = 'month' } = req.query;

      let dateFilter: any = {};
      if (period === 'today') {
        dateFilter.$gte = new Date();
        dateFilter.$gte.setHours(0, 0, 0, 0);
      } else if (period === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        dateFilter.$gte = weekAgo;
      } else if (period === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        dateFilter.$gte = monthAgo;
      }

      const topProducts = await Order.aggregate([
        { $match: { ...dateFilter, status: { $ne: 'cancelled' } } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            totalSold: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: Number(limit) },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product',
          },
        },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            productId: '$_id',
            name: '$product.name',
            slug: '$product.slug',
            images: '$product.images',
            price: '$product.price',
            totalSold: 1,
            totalRevenue: 1,
          },
        },
      ]);

      return res.json({
        success: true,
        data: topProducts,
      });
    } catch (error) {
      console.error('Get top products error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get inventory alerts (low stock products)
   */
  static async getInventoryAlerts(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { threshold = 5, limit = 20 } = req.query;

      const products = await Product.find({
        isActive: true,
        inStock: true,
        stockQuantity: { $lte: Number(threshold) },
      })
        .select('name slug images stockQuantity price')
        .sort({ stockQuantity: 1 })
        .limit(Number(limit));

      return res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      console.error('Get inventory alerts error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get customer acquisition data (new vs returning)
   */
  static async getCustomerAcquisition(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { startDate, endDate } = req.query;

      const dateFilter: any = {};
      if (startDate) dateFilter.$gte = new Date(startDate as string);
      if (endDate) dateFilter.$lte = new Date(endDate as string);

      // Get unique customers who placed orders in the period
      const customers = await Order.aggregate([
        { $match: { ...dateFilter, status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: '$user',
            firstOrder: { $min: '$createdAt' },
            lastOrder: { $max: '$createdAt' },
            orderCount: { $sum: 1 },
          },
        },
      ]);

      let newCustomers = 0;
      let returningCustomers = 0;

      customers.forEach((c) => {
        if (c.orderCount === 1) {
          newCustomers++;
        } else {
          returningCustomers++;
        }
      });

      return res.json({
        success: true,
        data: {
          newCustomers,
          returningCustomers,
          total: customers.length,
        },
      });
    } catch (error) {
      console.error('Get customer acquisition error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get order fulfillment metrics
   */
  static async getFulfillmentMetrics(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { startDate, endDate } = req.query;

      const dateFilter: any = {};
      if (startDate) dateFilter.$gte = new Date(startDate as string);
      if (endDate) dateFilter.$lte = new Date(endDate as string);

      const orders = await Order.find({
        ...dateFilter,
        status: 'delivered',
        deliveredAt: { $exists: true },
        createdAt: { $exists: true },
      }).select('createdAt deliveredAt');

      let totalFulfillmentTime = 0;
      let count = 0;

      orders.forEach((order) => {
        const created = order.createdAt.getTime();
        const delivered = order.deliveredAt?.getTime();
        if (delivered) {
          totalFulfillmentTime += (delivered - created) / (1000 * 60 * 60 * 24); // in days
          count++;
        }
      });

      const avgFulfillmentDays = count > 0 ? totalFulfillmentTime / count : 0;

      // Orders by status
      const statusCounts = await Order.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]);

      return res.json({
        success: true,
        data: {
          averageFulfillmentDays: avgFulfillmentDays,
          totalDelivered: count,
          statusCounts,
        },
      });
    } catch (error) {
      console.error('Get fulfillment metrics error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}