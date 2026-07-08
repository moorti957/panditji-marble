// backend/src/routes/dashboard.routes.ts

import { Router } from 'express';
import { query } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { DashboardController } from '../controllers/DashboardController';
import { validate } from '../middlewares/validate';
import { auth } from '../middlewares/auth';
// import { admin } from '../middlewares/auth'; // uncomment when role middleware is ready

const router = Router();

// Rate limiting for dashboard (admin)
const dashboardLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: { message: 'Too many dashboard requests, please try again later.' },
});

// ============================================================
// Validation Schemas
// ============================================================

const dateRangeValidation = [
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  query('period').optional().isIn(['today', 'week', 'month', 'quarter', 'year']).withMessage('Invalid period'),
];

const paginationValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

// ============================================================
// Routes
// ============================================================

// Get main dashboard statistics (overview cards)
router.get(
  '/stats',
  auth,
  // admin,
  dashboardLimiter,
  dateRangeValidation,
  validate,
  DashboardController.getStats
);

// Get revenue analytics
router.get(
  '/revenue',
  auth,
  // admin,
  dashboardLimiter,
  dateRangeValidation,
  validate,
  DashboardController.getRevenue
);

// Get order analytics (orders by status, etc.)
router.get(
  '/orders',
  auth,
  // admin,
  dashboardLimiter,
  dateRangeValidation,
  validate,
  DashboardController.getOrderAnalytics
);

// Get product analytics (top products, low stock, etc.)
router.get(
  '/products',
  auth,
  // admin,
  dashboardLimiter,
  query('limit').optional().isInt({ min: 1, max: 20 }),
  validate,
  DashboardController.getProductAnalytics
);

// Get customer analytics (new customers, top customers, etc.)
router.get(
  '/customers',
  auth,
  // admin,
  dashboardLimiter,
  dateRangeValidation,
  paginationValidation,
  validate,
  DashboardController.getCustomerAnalytics
);

// Get sales data over time (for charts)
router.get(
  '/sales',
  auth,
  // admin,
  dashboardLimiter,
  query('interval').optional().isIn(['hourly', 'daily', 'weekly', 'monthly']).withMessage('Invalid interval'),
  dateRangeValidation,
  validate,
  DashboardController.getSalesData
);

// Get recent orders (for dashboard widget)
router.get(
  '/recent-orders',
  auth,
  // admin,
  dashboardLimiter,
  query('limit').optional().isInt({ min: 1, max: 20 }),
  validate,
  DashboardController.getRecentOrders
);

// Get top products (for dashboard widget)
router.get(
  '/top-products',
  auth,
  // admin,
  dashboardLimiter,
  query('limit').optional().isInt({ min: 1, max: 20 }),
  query('period').optional().isIn(['today', 'week', 'month']),
  validate,
  DashboardController.getTopProducts
);

// Get inventory alerts (low stock products)
router.get(
  '/inventory-alerts',
  auth,
  // admin,
  dashboardLimiter,
  query('threshold').optional().isInt({ min: 0 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  validate,
  DashboardController.getInventoryAlerts
);

// Get customer acquisition data (new vs returning)
router.get(
  '/customer-acquisition',
  auth,
  // admin,
  dashboardLimiter,
  dateRangeValidation,
  validate,
  DashboardController.getCustomerAcquisition
);

// Get order fulfillment metrics (average fulfillment time, etc.)
router.get(
  '/fulfillment',
  auth,
  // admin,
  dashboardLimiter,
  dateRangeValidation,
  validate,
  DashboardController.getFulfillmentMetrics
);

export default router;