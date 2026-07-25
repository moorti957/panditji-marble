// frontend/src/features/shipping/api/shippingApi.ts

import { post } from '@/services/apiClient';

// ============================================================
// Types
// ============================================================

export interface IShippingAddress {
  fullName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

export interface IShippingItem {
  productId?: string;
  weight?: number;
  quantity: number;
}

export interface IShippingCalculation {
  origin: string;
  destination: string;
  distanceKm: number;
  totalWeightKg: number;
  standardShippingCost: number;
  expressShippingCost: number;
  estimatedDeliveryStandard: string;
  estimatedDeliveryExpress: string;
  isCached: boolean;
}

export interface IShippingCalculationRequest {
  address: IShippingAddress;
  items: IShippingItem[];
  subtotal: number;
}

export interface IShippingCalculationResponse {
  success: boolean;
  message?: string;
  data?: IShippingCalculation;
}

// ============================================================
// API Function
// ============================================================

/**
 * Calculate dynamic shipping charges based on customer address, product weight and distance.
 * Calls POST /api/shipping/calculate on the backend.
 */
export const calculateShipping = async (
  request: IShippingCalculationRequest
): Promise<IShippingCalculation> => {

  const response = await post<IShippingCalculationResponse>(
    "/shipping/calculate",
    request
  );

  console.log("Shipping API Response:", response);

  if (!response.success || !response.data) {
    throw new Error(
      response.message || "Unable to calculate shipping currently."
    );
  }

  return response.data;
};
export default calculateShipping;
