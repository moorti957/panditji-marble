// backend/src/services/ShippingService.ts

import { Product } from '../models/Product';

/**
 * Interface representing customer delivery address
 */
export interface IDeliveryAddress {
  fullName?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

/**
 * Item specification for weight calculation
 */
export interface IShippingItem {
  productId?: string;
  weight?: number;
  quantity: number;
}

/**
 * Result structure of shipping calculation
 */
export interface IShippingCalculationResult {
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

/**
 * Interface for cached distance entries
 */
interface ICacheEntry {
  distanceKm: number;
  timestamp: number;
}

// Origin business location: Pandit Ji Marble Murti Arts, Govindgarh, Alwar, Rajasthan
const ORIGIN_BUSINESS_NAME = 'Pandit Ji Marble Murti Arts';
const ORIGIN_ADDRESS_STRING = 'Govindgarh, Alwar, Rajasthan, India';
const ORIGIN_LAT = 27.4699;
const ORIGIN_LNG = 77.0195;

// Cache TTL: 24 Hours
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export class ShippingService {
  // In-memory cache for distance lookups
  private static distanceCache: Map<string, ICacheEntry> = new Map();

  /**
   * Main method to calculate shipping charges dynamically based on:
   * 1. Customer Delivery Address
   * 2. Shop Location (Fixed)
   * 3. Product Weight
   * 4. Order Value
   */
  public static async calculateShipping(
    address: IDeliveryAddress,
    items: IShippingItem[],
    subtotal: number = 0
  ): Promise<IShippingCalculationResult> {
    if (!address || !address.city || !address.state || !address.pincode) {
      throw new Error('Incomplete delivery address. City, State, and Pincode are required.');
    }

    // 1. Calculate Total Product Weight
    const totalWeightKg = await this.calculateTotalWeight(items);

    // 2. Geocode & Calculate Distance in KM with caching
    const { distanceKm, isCached } = await this.getDistanceInKm(address);

    // 3. Calculate Standard Shipping Cost using baseline formula
    const standardShippingCost = this.calculateStandardShippingCost(distanceKm, totalWeightKg);

    // 4. Calculate Express Shipping Cost (15% if order total >= 10000, 25% if order total < 10000)
    const expressShippingCost = this.calculateExpressShippingCost(standardShippingCost, subtotal);

    // 5. Estimate delivery windows
    const estimatedDeliveryStandard = '5-7 Business Days';
    const estimatedDeliveryExpress = '2-3 Business Days';

    // Formatted destination label
    const destination = `${address.city}, ${address.state} - ${address.pincode}, ${address.country || 'India'}`;

    return {
      origin: `${ORIGIN_BUSINESS_NAME}, Govindgarh, Alwar`,
      destination,
      distanceKm,
      totalWeightKg,
      standardShippingCost,
      expressShippingCost,
      estimatedDeliveryStandard,
      estimatedDeliveryExpress,
      isCached,
    };
  }

  /**
   * Calculate total weight of products in cart/order (in Kilograms)
   */
  public static async calculateTotalWeight(items: IShippingItem[]): Promise<number> {
    let totalWeight = 0;

    if (!items || items.length === 0) {
      return 1; // Default minimum weight: 1 KG
    }

    for (const item of items) {
      let weightPerUnit = item.weight;

      // If weight is not explicitly passed, query product from database
      if (weightPerUnit === undefined || weightPerUnit === null) {
        if (item.productId) {
          const product = await Product.findById(item.productId).select('weight').lean();
          weightPerUnit = product?.weight || 5; // Default fallback to 5 KG for marble items if unset
        } else {
          weightPerUnit = 5;
        }
      }

      const qty = Math.max(1, item.quantity || 1);
      totalWeight += Math.max(0.1, weightPerUnit) * qty;
    }

    // Round weight to 2 decimal places, minimum 1 KG
    return Math.max(1, Math.round(totalWeight * 100) / 100);
  }

  /**
   * Calculate Road Distance in KM between Govindgarh, Alwar and Customer Address.
   * Utilizes Google Maps Distance Matrix API (preferred) with fallback and caching.
   */
  public static async getDistanceInKm(
    address: IDeliveryAddress
  ): Promise<{ distanceKm: number; isCached: boolean }> {
    const cacheKey = this.generateCacheKey(address);

    // Check cache
    const cached = this.distanceCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return { distanceKm: cached.distanceKm, isCached: true };
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_API_KEY;
    const formattedDestination = `${address.addressLine1 || ''}, ${address.city}, ${address.state} ${address.pincode}, ${address.country || 'India'}`;

    let distanceKm: number | null = null;

    // 1. Try Google Maps Distance Matrix API if key exists
    if (apiKey) {
      try {
        distanceKm = await this.fetchGoogleDistanceMatrix(ORIGIN_ADDRESS_STRING, formattedDestination, apiKey);
      } catch (err: any) {
        console.warn('Google Maps Distance Matrix API error, using fallback:', err?.message || err);
      }
    }

    // 2. Fallback routing if Google API is not configured or failed
    if (distanceKm === null) {
      distanceKm = await this.fallbackDistanceCalculation(address);
    }

    // Clean up cache if too large (> 5000 entries)
    if (this.distanceCache.size > 5000) {
      this.distanceCache.clear();
    }

    // Store in cache
    this.distanceCache.set(cacheKey, {
      distanceKm,
      timestamp: Date.now(),
    });

    return { distanceKm, isCached: false };
  }

  /**
   * Call Google Maps Distance Matrix API
   */
  private static async fetchGoogleDistanceMatrix(
    origin: string,
    destination: string,
    apiKey: string
  ): Promise<number | null> {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
      origin
    )}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Distance Matrix API returned HTTP ${response.status}`);
    }

    const data: any = await response.json();
    if (data.status === 'OK' && data.rows?.[0]?.elements?.[0]?.status === 'OK') {
      const distanceMeters = data.rows[0].elements[0].distance.value;
      return Math.round(distanceMeters / 1000);
    }

    return null;
  }

  /**
   * Fallback Distance Calculation using Geocoding (Nominatim / OSRM or Haversine Road approximation)
   */
  private static async fallbackDistanceCalculation(address: IDeliveryAddress): Promise<number> {
    try {
      const query = `${address.city}, ${address.state}, ${address.pincode}, India`;
      const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
      
      const geoRes = await fetch(geocodeUrl, {
        headers: { 'User-Agent': 'PanditJiMarbleShippingService/1.0' },
      });

      if (geoRes.ok) {
        const geoData: any = await geoRes.json();
        if (geoData && geoData.length > 0) {
          const destLat = parseFloat(geoData[0].lat);
          const destLng = parseFloat(geoData[0].lon);

          // Try OSRM driving route distance
          try {
            const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${ORIGIN_LNG},${ORIGIN_LAT};${destLng},${destLat}?overview=false`;
            const osrmRes = await fetch(osrmUrl);
            if (osrmRes.ok) {
              const osrmData: any = await osrmRes.json();
              if (osrmData.routes && osrmData.routes.length > 0) {
                const distanceMeters = osrmData.routes[0].distance;
                return Math.max(10, Math.round(distanceMeters / 1000));
              }
            }
          } catch (osrmErr) {
            console.warn('OSRM routing failed, calculating via Haversine road formula:', osrmErr);
          }

          // Fallback to Haversine with road curvature factor (1.25)
          const straightKm = this.calculateHaversineDistance(ORIGIN_LAT, ORIGIN_LNG, destLat, destLng);
          return Math.max(10, Math.round(straightKm * 1.25));
        }
      }
    } catch (err) {
      console.warn('Geocoding fallback failed:', err);
    }

    // Secondary fallback based on pincode heuristic if geocoding times out
    return this.heuristicDistanceByStateOrPincode(address.pincode, address.state);
  }

  /**
   * Haversine formula for straight-line distance in KM
   */
  private static calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in KM
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Heuristic fallback distance based on State / Pincode prefix if external geocoders fail
   */
  private static heuristicDistanceByStateOrPincode(pincode: string, state: string): number {
    const stateLower = (state || '').toLowerCase();
    const pinPrefix = (pincode || '').slice(0, 2);

    if (stateLower.includes('rajasthan') || pinPrefix === '30' || pinPrefix === '31' || pinPrefix === '32' || pinPrefix === '33' || pinPrefix === '34') {
      return 150; // Average Rajasthan distance from Govindgarh, Alwar
    }
    if (stateLower.includes('delhi') || stateLower.includes('haryana') || pinPrefix === '11' || pinPrefix === '12' || pinPrefix === '13') {
      return 178; // Benchmark distance to Delhi NCR region!
    }
    if (stateLower.includes('punjab') || stateLower.includes('uttar pradesh') || pinPrefix === '14' || pinPrefix === '20' || pinPrefix === '22' || pinPrefix === '28') {
      return 350;
    }
    if (stateLower.includes('gujarat') || stateLower.includes('madhya pradesh') || pinPrefix === '36' || pinPrefix === '38' || pinPrefix === '45' || pinPrefix === '46') {
      return 550;
    }
    if (stateLower.includes('maharashtra') || pinPrefix === '40' || pinPrefix === '41' || pinPrefix === '42') {
      return 1150;
    }
    if (stateLower.includes('karnataka') || stateLower.includes('tamil nadu') || stateLower.includes('kerala') || pinPrefix === '56' || pinPrefix === '60') {
      return 2100;
    }

    return 600; // Default nationwide average distance
  }

  /**
   * Calculate Standard Shipping Cost using scalable distance & weight formula
   * Reference Benchmark: Distance 178 KM, Weight 25 KG => Shipping Cost ₹2000
   * Formula: Math.round(200 + (Distance * 4.0) + (Weight * 16.0) + (Distance * Weight * 0.1546))
   */
  public static calculateStandardShippingCost(distanceKm: number, totalWeightKg: number): number {
    const baseFee = 200;
    const distanceComponent = distanceKm * 4.0;
    const weightComponent = totalWeightKg * 16.0;
    const combinedComponent = distanceKm * totalWeightKg * 0.1546;

    const totalCost = baseFee + distanceComponent + weightComponent + combinedComponent;

    // Minimum standard shipping charge is ₹150, rounded to nearest integer
    return Math.max(150, Math.round(totalCost));
  }

  /**
   * Calculate Express Shipping Cost:
   * - Order Subtotal >= ₹10,000 => Standard Shipping + 15%
   * - Order Subtotal < ₹10,000 => Standard Shipping + 25%
   */
  public static calculateExpressShippingCost(standardCost: number, subtotal: number): number {
    const surchargeRate = subtotal >= 10000 ? 0.15 : 0.25;
    return Math.round(standardCost * (1 + surchargeRate));
  }

  /**
   * Helper to build normalized cache key from address
   */
  private static generateCacheKey(address: IDeliveryAddress): string {
    const cleanStr = (s?: string) => (s || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${cleanStr(address.pincode)}_${cleanStr(address.city)}_${cleanStr(address.state)}_${cleanStr(address.addressLine1)}`;
  }
}

export default ShippingService;
