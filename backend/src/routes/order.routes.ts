// backend/src/routes/order.routes.ts

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { OrderController } from '../controllers/OrderController';
import { validate } from '../middlewares/validate';
import { auth } from '../middlewares/auth';
// import { admin } from '../middlewares/auth'; // uncomment when role middleware is ready

const router = Router();

// Rate limiting for order creation (public)
const orderCreateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { message: 'Too many orders placed, please try again later.' },
});

// ============================================================
// Validation Schemas
// ============================================================

const orderIdParamValidation = [
  param('id').isMongoId().withMessage('Invalid order ID'),
];

const createOrderValidation = [
  body('items').isArray({ min: 1 }).withMessage('Items array must contain at least one item'),
  body('items.*.productId').isMongoId().withMessage('Invalid product ID'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.price').isNumeric().withMessage('Price must be a number'),
  body('shippingAddress').isObject().withMessage('Shipping address is required'),
  body('shippingAddress.fullName').notEmpty().withMessage('Full name is required'),
  body('shippingAddress.addressLine1').notEmpty().withMessage('Address line 1 is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.state').notEmpty().withMessage('State is required'),
  body('shippingAddress.pincode').notEmpty().withMessage('Pincode is required'),
  body('shippingAddress.country').optional().default('India'),
  body('shippingAddress.phone').notEmpty().withMessage('Phone is required'),
  body('billingAddress').optional().isObject(),
  body('paymentMethod').isIn(['cod', 'card', 'upi', 'bank']).withMessage('Invalid payment method'),
  body('couponCode').optional().trim(),
  body('giftWrap').optional().isBoolean(),
  body('shippingMethod').optional().isIn(['standard', 'express']),
  body('notes').optional().trim(),
];

const updateOrderStatusValidation = [
  param('id').isMongoId().withMessage('Invalid order ID'),
  body('status').isIn(['pending', 'advance_paid', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
  body('notes').optional().trim(),
];

const updatePaymentStatusValidation = [
  param('id').isMongoId().withMessage('Invalid order ID'),
  body('paymentStatus').isIn(['pending', 'paid', 'failed', 'refunded']).withMessage('Invalid payment status'),
];

const orderQueryValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['pending', 'advance_paid', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled']),
  query('paymentStatus').optional().isIn(['pending', 'advance_paid', 'paid', 'failed', 'refunded']),
  query('startDate').optional().isISO8601().toDate(),
  query('endDate').optional().isISO8601().toDate(),
  query('search').optional().trim(),
];

const cancelOrderValidation = [
  param('id').isMongoId().withMessage('Invalid order ID'),
  body('reason').optional().trim(),
];

// ============================================================
// Routes
// ============================================================

// -------------------- Public (Authenticated) Routes --------------------

// Create an order (requires authentication)
router.post(
  '/',
  auth,
  orderCreateLimiter,
  createOrderValidation,
  validate,
  OrderController.createOrder
);

// Get all orders for the authenticated user
router.get(
  '/',
  auth,
  orderQueryValidation,
  validate,
  OrderController.getUserOrders
);

router.get(
  '/my',
  auth,
  orderQueryValidation,
  validate,
  OrderController.getUserOrders
);

// Get a single order by ID for the authenticated user
router.get(
  '/:id',
  auth,
  orderIdParamValidation,
  validate,
  OrderController.getOrderById
);

// Cancel an order (user)
router.patch(
  '/:id/cancel',
  auth,
  orderIdParamValidation,
  cancelOrderValidation,
  validate,
  OrderController.cancelOrder
);

// Track order by order ID (public, uses order ID and email/phone? We'll add later)
// For simplicity, we'll keep it authenticated

// -------------------- Admin Routes --------------------

// Get all orders (admin only)
router.get(
  '/admin/all',
  auth,
  // admin,
  orderQueryValidation,
  validate,
  OrderController.getAllOrders
);

router.get(
  '/admin/orders',
  auth,
  orderQueryValidation,
  validate,
  OrderController.getAllOrders
);

// Update order status (admin)
router.patch(
  '/:id/status',
  auth,
  // admin,
  updateOrderStatusValidation,
  validate,
  OrderController.updateOrderStatus
);

router.patch(
  '/:id',
  auth,
  updateOrderStatusValidation,
  validate,
  OrderController.updateOrderStatus
);

// Update payment status (admin)
router.patch(
  '/:id/payment-status',
  auth,
  // admin,
  updatePaymentStatusValidation,
  validate,
  OrderController.updatePaymentStatus
);

// Update shipping details (admin)
router.put(
  '/:id/shipping',
  auth,
  // admin,
  orderIdParamValidation,
  body('trackingNumber').optional().trim(),
  body('carrier').optional().trim(),
  body('shippedDate').optional().isISO8601().toDate(),
  body('estimatedDelivery').optional().isISO8601().toDate(),
  validate,
  OrderController.updateShippingDetails
);

// Delete an order (admin)
router.delete(
  '/:id',
  auth,
  // admin,
  orderIdParamValidation,
  validate,
  OrderController.deleteOrder
);

// Export route
export default router;