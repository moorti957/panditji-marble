import { Response } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { AuthRequest } from '../middlewares/auth';
import { Setting } from '../models/Setting';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { Coupon } from '../models/Coupon';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export class PaymentController {
  static async createOrder(req: AuthRequest, res: Response): Promise<Response> {
  try {
    console.log("======================================");
    console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID);
    console.log("RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET);
    console.log("======================================");

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Razorpay is not configured.",
      });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const {
      amount,
      currency = "INR",
      receipt,
      notes,
    } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount.",
      });
    }

    const options = {
      amount: Math.round(Number(amount) * 100), // paise
      currency,
      receipt: receipt || `order_${Date.now()}`,
      notes: notes || {},
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      message: "Razorpay order created successfully.",
      data: order,
    });
  } catch (error: any) {
    console.error("Create Razorpay Order Error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to create payment order.",
    });
  }
}

  static async verify(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, checkoutPayload } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Missing Razorpay verification data.' });
      }

      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
        .update(body)
        .digest('hex');

      const isAuthentic = expectedSignature === razorpay_signature;

      if (!isAuthentic) {
        return res.status(400).json({ success: false, message: 'Payment signature verification failed.' });
      }

      if (!checkoutPayload?.items?.length) {
        return res.status(400).json({ success: false, message: 'Checkout payload is required.' });
      }

      const settings = await Setting.findOne({}) || await Setting.create({});
      const userId = req.user?.id;
      const payload = checkoutPayload;
      const { items, shippingAddress, billingAddress, paymentMethod, couponCode, giftWrap = false, shippingMethod = 'standard', notes } = payload;


      // Normalize phone number (remove +91 prefix)
if (shippingAddress?.phone) {
  shippingAddress.phone = shippingAddress.phone
    .replace(/\s+/g, '')
    .replace(/^\+91/, '');
}

if (billingAddress?.phone) {
  billingAddress.phone = billingAddress.phone
    .replace(/\s+/g, '')
    .replace(/^\+91/, '');
}
      let subtotal = 0;
      const orderItems: any[] = [];

      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(404).json({ success: false, message: `Product ${item.productId} not found` });
        }

        const price = item.price || product.price;
        subtotal += price * item.quantity;
        orderItems.push({
          product: product._id,
          name: product.name,
          image: product.images?.[0] || '',
          quantity: item.quantity,
          price,
          total: price * item.quantity,
        });
      }

      let shippingCost = 0;
      if (shippingMethod === 'standard') shippingCost = settings.shipping?.standard ?? settings.standardShippingCost ?? 500;
      else if (shippingMethod === 'express') shippingCost = settings.shipping?.express ?? settings.expressShippingCost ?? 1200;

      const gstPercentage = settings.gstPercentage ?? settings.taxRate ?? 18;
      const tax = Math.round(subtotal * (Number(gstPercentage) / 100));
      let discount = 0;
      let couponApplied = null;
      if (couponCode) {
        const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true, expiresAt: { $gt: new Date() } });
        if (coupon) {
          discount = coupon.discountType === 'percentage' ? Math.round((subtotal * coupon.discountValue) / 100) : Math.min(coupon.discountValue, subtotal);
          couponApplied = { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue, discountAmount: discount };
        }
      }

      const giftWrapCost = giftWrap ? (settings.giftWrapCharge ?? 99) : 0;
      const grandTotal = subtotal + shippingCost + tax + giftWrapCost - discount;
      const advancePercent = settings.advancePaymentPercentage ?? settings.advancePaymentPercent ?? 25;
      const advancePaid = paymentMethod === 'cod' ? Math.round((grandTotal * advancePercent) / 100) : grandTotal;
      const remainingAmount = paymentMethod === 'cod' ? Math.max(grandTotal - advancePaid, 0) : 0;

      const order = await Order.create({
        orderNumber: `PJM${Date.now().toString().slice(-8)}`,
        user: userId,
        items: orderItems,
        subtotal,
        shippingCost,
        tax,
        discount,
        giftWrapCost,
        grandTotal,
        advancePaid,
        remainingAmount,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        paymentMethod,
        shippingMethod,
        coupon: couponApplied,
        notes,
        status: paymentMethod === 'cod' ? 'advance_paid' : 'processing',
        paymentStatus: paymentMethod === 'cod' ? 'advance_paid' : 'paid',
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        transactionId: razorpay_payment_id,
        paymentHistory: [{ type: 'advance', amount: advancePaid, paymentMethod, paymentStatus: 'paid', reference: razorpay_payment_id, createdAt: new Date() }],
      });

      for (const item of items) {
        await Product.findByIdAndUpdate(item.productId, { $inc: { stockQuantity: -item.quantity } });
      }

      return res.json({ success: true, message: 'Payment verified successfully.', data: order });
    } catch (error: any) {
      console.error('Verify Razorpay payment error:', error);
      return res.status(500).json({ success: false, message: error?.message || 'Payment verification failed' });
    }
  }
}
