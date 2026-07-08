// backend/src/controllers/OrderController.ts
import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import mongoose from 'mongoose';
import { Order, IOrder } from '../models/Order';
import { Product } from '../models/Product';
import { User } from '../models/User';
import { Coupon } from '../models/Coupon';
import { Setting } from '../models/Setting';


export class OrderController {
  /**
   * Create a new order
   */
  static async createOrder(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const {
        items,
        shippingAddress,
        billingAddress,
        paymentMethod,
        couponCode,
        giftWrap = false,
        shippingMethod = 'standard',
        notes,
      } = req.body;

      const settings = await Setting.findOne({}) || await Setting.create({});

      // Validate items and calculate totals
      let subtotal = 0;
      const orderItems = [];

      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product ${item.productId} not found`,
          });
        }

        // Check stock
       if ((product.stockQuantity ?? 0) < item.quantity) {
  return res.status(400).json({
    success: false,
    message: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity ?? 0}`,
  });
}

        const price = item.price || product.price;
        subtotal += price * item.quantity;

        orderItems.push({
          product: product._id,
          name: product.name,
          image: product.images?.[0] || '',
          quantity: item.quantity,
          price: price,
          total: price * item.quantity,
        });
      }

      // Calculate shipping cost from settings
      let shippingCost = 0;
      if (shippingMethod === 'standard') {
        shippingCost = settings.shipping?.standard ?? settings.standardShippingCost ?? 500;
      } else if (shippingMethod === 'express') {
        shippingCost = settings.shipping?.express ?? settings.expressShippingCost ?? 1200;
      }

      // Calculate tax from settings
      const gstPercentage = settings.gstPercentage ?? settings.taxRate ?? 18;
      const tax = Math.round(subtotal * (Number(gstPercentage) / 100));

      // Apply coupon if provided
      let discount = 0;
      let couponApplied = null;
      if (couponCode) {
        const coupon = await Coupon.findOne({
          code: couponCode.toUpperCase(),
          isActive: true,
          expiresAt: { $gt: new Date() },
        });
        if (coupon) {
          if (coupon.discountType === 'percentage') {
            discount = Math.round((subtotal * coupon.discountValue) / 100);
          } else {
            discount = Math.min(coupon.discountValue, subtotal);
          }
          couponApplied = {
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            discountAmount: discount,
          };
        }
      }

      // Gift wrap
      const giftWrapCost = giftWrap ? (settings.giftWrapCharge ?? 99) : 0;

      // Calculate grand total
      const grandTotal = subtotal + shippingCost + tax + giftWrapCost - discount;
      const advancePercent = settings.advancePaymentPercentage ?? settings.advancePaymentPercent ?? 25;
      const advancePaid = paymentMethod === 'cod' ? Math.round((grandTotal * advancePercent) / 100) : grandTotal;
      const remainingAmount = paymentMethod === 'cod' ? Math.max(grandTotal - advancePaid, 0) : 0;

      // Generate order number
      const orderNumber = 'PJM' + Date.now().toString().slice(-8);

      if (paymentMethod === 'cod' && advancePaid > 0) {
        const paymentStatus = 'advance_paid';
        const order = new Order({
          orderNumber,
          user: userId,
          items: orderItems,
          subtotal,
          shippingCost,
          tax,
          discount,
          giftWrapCost: giftWrapCost,
          grandTotal,
          advancePaid,
          remainingAmount,
          shippingAddress,
          billingAddress: billingAddress || shippingAddress,
          paymentMethod,
          shippingMethod,
          coupon: couponApplied,
          notes,
          status: paymentStatus === 'advance_paid' ? 'advance_paid' : 'pending',
          paymentStatus,
          paymentHistory: [{ type: 'advance', amount: advancePaid, paymentMethod: 'cod', paymentStatus: 'pending', createdAt: new Date() }],
        });

        await order.save();

        for (const item of items) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stockQuantity: -item.quantity },
          });
        }

        return res.status(201).json({ success: true, message: 'Order created successfully. Advance payment required.', data: order });
      }

      const order = new Order({
        orderNumber,
        user: userId,
        items: orderItems,
        subtotal,
        shippingCost,
        tax,
        discount,
        giftWrapCost: giftWrapCost,
        grandTotal,
        advancePaid: paymentMethod === 'cod' ? advancePaid : grandTotal,
        remainingAmount: paymentMethod === 'cod' ? remainingAmount : 0,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        paymentMethod,
        shippingMethod,
        coupon: couponApplied,
        notes,
        status: paymentMethod === 'cod' ? 'advance_paid' : 'pending',
        paymentStatus: paymentMethod === 'cod' ? 'advance_paid' : 'pending',
        paymentHistory: paymentMethod === 'cod' ? [{ type: 'advance', amount: advancePaid, paymentMethod: 'cod', paymentStatus: 'pending', createdAt: new Date() }] : [],
      });

      await order.save();

      for (const item of items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stockQuantity: -item.quantity },
        });
      }

      // Send order confirmation email
      // await sendOrderConfirmationEmail(order);

      return res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order,
      });
    } catch (error) {
      console.error('Create order error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get all orders for the authenticated user
   */
  static async getUserOrders(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const {
        page = 1,
        limit = 10,
        status,
        paymentStatus,
        startDate,
        endDate,
        search,
      } = req.query;

      const query: any = { user: userId };

      if (status) query.status = status;
      if (paymentStatus) query.paymentStatus = paymentStatus;
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate as string);
        if (endDate) query.createdAt.$lte = new Date(endDate as string);
      }
      if (search) {
        query.$or = [
          { orderNumber: { $regex: search, $options: 'i' } },
          { 'items.name': { $regex: search, $options: 'i' } },
        ];
      }

      const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .populate('user', 'name email');

      const total = await Order.countDocuments(query);

      return res.json({
        success: true,
        data: {
          orders,
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error('Get user orders error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get a single order by ID for authenticated user
   */
  static async getOrderById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const userRole = req.user?.role;

      const query: any = { _id: id };
      // If not admin, only allow user to see their own orders
      if (userRole !== 'admin' && userRole !== 'super-admin') {
        query.user = userId;
      }

      const order = await Order.findOne(query)
        .populate('user', 'name email phone')
        .populate('items.product', 'name slug images');

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      return res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      console.error('Get order by ID error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Cancel an order (user)
   */
  static async cancelOrder(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = req.user?.id;

      const order = await Order.findOne({ _id: id, user: userId });
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      // Only allow cancellation if status is pending or processing
      if (order.status !== 'pending' && order.status !== 'processing') {
        return res.status(400).json({
          success: false,
          message: `Order cannot be cancelled. Current status: ${order.status}`,
        });
      }

      // Restore product stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stockQuantity: item.quantity },
        });
      }

      order.status = 'cancelled';
      order.cancellationReason = reason || 'Cancelled by user';
      order.cancelledAt = new Date();
      await order.save();

      return res.json({
        success: true,
        message: 'Order cancelled successfully',
        data: order,
      });
    } catch (error) {
      console.error('Cancel order error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get all orders (admin only)
   */
  static async getAllOrders(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        paymentStatus,
        startDate,
        endDate,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const query: any = {};

      if (status) query.status = status;
      if (paymentStatus) query.paymentStatus = paymentStatus;
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate as string);
        if (endDate) query.createdAt.$lte = new Date(endDate as string);
      }
      if (search) {
        query.$or = [
          { orderNumber: { $regex: search, $options: 'i' } },
          { 'items.name': { $regex: search, $options: 'i' } },
          { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
        ];
      }

      const sort: any = {};
      sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

      const orders = await Order.find(query)
        .sort(sort)
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .populate('user', 'name email phone');

      const total = await Order.countDocuments(query);

      // Calculate summary stats
      const stats = await Order.aggregate([
        { $match: query },
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
          },
        },
      ]);

      return res.json({
        success: true,
        data: {
          orders,
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
          stats: stats[0] || {
            totalOrders: 0,
            totalRevenue: 0,
            averageOrderValue: 0,
            pendingOrders: 0,
            processingOrders: 0,
            shippedOrders: 0,
            deliveredOrders: 0,
          },
        },
      });
    } catch (error) {
      console.error('Get all orders error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Update order status (admin)
   */
  static async updateOrderStatus(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      // Validate status transition
      const validTransitions: Record<string, string[]> = {
        pending: ['advance_paid', 'cancelled'],
        advance_paid: ['processing', 'cancelled'],
        processing: ['packed', 'cancelled'],
        packed: ['shipped', 'cancelled'],
        shipped: ['out_for_delivery', 'cancelled'],
        out_for_delivery: ['delivered', 'cancelled'],
        delivered: [],
        cancelled: [],
      };

      if (!validTransitions[order.status]?.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status transition from ${order.status} to ${status}`,
        });
      }

      // If cancelling, restore stock
      if (status === 'cancelled' && order.status !== 'cancelled') {
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stockQuantity: item.quantity },
          });
        }
      }

      order.status = status;
      order.statusNotes = notes;
      order.statusUpdatedAt = new Date();

      if (status === 'shipped' && !order.shippedAt) {
        order.shippedAt = new Date();
      }
      if (status === 'delivered' && !order.deliveredAt) {
        order.deliveredAt = new Date();
      }
      if (status === 'advance_paid') {
        order.paymentStatus = 'advance_paid';
      }

      await order.save();

      // Send status update email
      // await sendOrderStatusUpdateEmail(order);

      return res.json({
        success: true,
        message: `Order status updated to ${status}`,
        data: order,
      });
    } catch (error) {
      console.error('Update order status error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Update payment status (admin)
   */
  static async updatePaymentStatus(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { paymentStatus } = req.body;

      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      order.paymentStatus = paymentStatus;
      if (paymentStatus === 'paid') {
        order.paidAt = new Date();
      }
      await order.save();

      return res.json({
        success: true,
        message: `Payment status updated to ${paymentStatus}`,
        data: order,
      });
    } catch (error) {
      console.error('Update payment status error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Update shipping details (admin)
   */
  static async updateShippingDetails(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { trackingNumber, carrier, shippedDate, estimatedDelivery } = req.body;

      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      order.trackingNumber = trackingNumber || order.trackingNumber;
      order.carrier = carrier || order.carrier;
      if (shippedDate) order.shippedAt = new Date(shippedDate);
      if (estimatedDelivery) order.estimatedDelivery = new Date(estimatedDelivery);

      // If tracking number is provided, update status to shipped if not already
      if (trackingNumber && order.status === 'processing') {
        order.status = 'shipped';
      }

      await order.save();

      return res.json({
        success: true,
        message: 'Shipping details updated successfully',
        data: order,
      });
    } catch (error) {
      console.error('Update shipping details error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Delete an order (admin)
   */
  static async deleteOrder(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      // Restore stock if order is not cancelled or delivered
      if (order.status !== 'cancelled' && order.status !== 'delivered') {
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stockQuantity: item.quantity },
          });
        }
      }

      await order.deleteOne();

      return res.json({
        success: true,
        message: 'Order deleted successfully',
      });
    } catch (error) {
      console.error('Delete order error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get order statistics (admin)
   */
  static async getOrderStats(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { period = 'month' } = req.query;

      const startDate = new Date();
      if (period === 'today') {
        startDate.setHours(0, 0, 0, 0);
      } else if (period === 'week') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (period === 'month') {
        startDate.setMonth(startDate.getMonth() - 1);
      } else if (period === 'quarter') {
        startDate.setMonth(startDate.getMonth() - 3);
      } else if (period === 'year') {
        startDate.setFullYear(startDate.getFullYear() - 1);
      }

      const stats = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
          },
        },
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

      return res.json({
        success: true,
        data: stats[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          pendingOrders: 0,
          processingOrders: 0,
          shippedOrders: 0,
          deliveredOrders: 0,
          cancelledOrders: 0,
        },
      });
    } catch (error) {
      console.error('Get order stats error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Generate order ID (order number prefix)
   */
  static generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `PJM${timestamp}${random}`;
  }
}