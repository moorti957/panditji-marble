// backend/src/controllers/ShippingController.ts

import { Request, Response } from 'express';
import { ShippingService, IDeliveryAddress, IShippingItem } from '../services/ShippingService';

export class ShippingController {
  /**
   * Endpoint handler to calculate dynamic shipping charges
   * Route: POST /api/shipping/calculate
   */
  public static async calculateShipping(req: Request, res: Response): Promise<Response> {
    try {
      const { address, items, subtotal } = req.body;

      if (!address) {
        return res.status(400).json({
          success: false,
          message: 'Delivery address is required',
        });
      }

      const deliveryAddress: IDeliveryAddress = {
        fullName: address.fullName || '',
        addressLine1: address.addressLine1 || '',
        addressLine2: address.addressLine2 || '',
        city: address.city || '',
        state: address.state || '',
        pincode: address.pincode || '',
        country: address.country || 'India',
      };

      if (!deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.pincode) {
        return res.status(400).json({
          success: false,
          message: 'City, State, and Pincode are required to calculate shipping',
        });
      }

      const shippingItems: IShippingItem[] = Array.isArray(items) ? items : [];
      const orderSubtotal = typeof subtotal === 'number' ? Math.max(0, subtotal) : 0;

      // Calculate dynamic shipping parameters
      const result = await ShippingService.calculateShipping(
        deliveryAddress,
        shippingItems,
        orderSubtotal
      );

      return res.status(200).json({
        success: true,
        message: 'Shipping calculated successfully',
        data: result,
      });
    } catch (error: any) {
      console.error('Calculate shipping error:', error);

      return res.status(500).json({
        success: false,
        message: 'Unable to calculate shipping currently. Please try again.',
        error: error?.message || 'Calculation failed',
      });
    }
  }
}

export default ShippingController;
