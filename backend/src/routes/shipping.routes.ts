// backend/src/routes/shipping.routes.ts

import { Router } from 'express';
import { ShippingController } from '../controllers/ShippingController';

const router = Router();

/**
 * @route   POST /api/shipping/calculate
 * @desc    Calculate dynamic shipping cost, distance, weight and estimated delivery
 * @access  Public (Guest & Registered users)
 */
router.post('/calculate', ShippingController.calculateShipping);

export default router;
