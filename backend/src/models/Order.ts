// backend/src/models/Order.ts

import mongoose, { Schema, Document, Model } from 'mongoose';

// ============================================================
// Types
// ============================================================

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  image?: string;
  quantity: number;
  price: number;
  total: number;
}

export interface IAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  phone: string;
  email?: string;
}

export interface ICouponApplied {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
}

export interface IPaymentHistoryItem {
  type: 'advance' | 'remaining';
  amount: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  reference?: string;
  createdAt: Date;
}

export interface IOrder extends Document {
  orderNumber: string;
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  giftWrapCost: number;
  grandTotal: number;
  advancePaid: number;
  remainingAmount: number;
  shippingAddress: IAddress;
  billingAddress: IAddress;
  paymentMethod: 'cod' | 'card' | 'upi' | 'bank';
  paymentStatus: 'pending' | 'advance_paid' | 'paid' | 'failed' | 'refunded';
  status: 'pending' | 'advance_paid' | 'processing' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded';
  shippingMethod: 'standard' | 'express';
  coupon?: ICouponApplied;
  trackingNumber?: string;
  carrier?: string;
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  paidAt?: Date;
  estimatedDelivery?: Date;
  statusNotes?: string;
  statusUpdatedAt?: Date;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  transactionId?: string;
  paymentHistory: IPaymentHistoryItem[];
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  updateStatus(newStatus: string, notes?: string): Promise<void>;
  isCancellable(): boolean;
  isRefundable(): boolean;
  getTotalItems(): number;
}

// ============================================================
// Order Item Sub-Schema
// ============================================================

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

// ============================================================
// Address Sub-Schema
// ============================================================

const AddressSchema = new Schema<IAddress>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    addressLine1: {
      type: String,
      required: true,
      trim: true,
    },
    addressLine2: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
      match: /^[0-9]{6}$/,
    },
    country: {
      type: String,
      required: true,
      default: 'India',
      trim: true,
    },
    phone: {
  type: String,
  required: true,
  trim: true,
  match: [/^(\+91)?[6-9]\d{9}$/, 'Invalid phone number'],
},
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
  },
  { _id: false }
);

// ============================================================
// Coupon Applied Sub-Schema
// ============================================================

const PaymentHistorySchema = new Schema<IPaymentHistoryItem>({
  type: { type: String, enum: ['advance', 'remaining'], required: true },
  amount: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  reference: { type: String },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const CouponAppliedSchema = new Schema<ICouponApplied>(
  {
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    discountAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

// ============================================================
// Order Schema
// ============================================================

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (items: IOrderItem[]) => items.length > 0,
        message: 'Order must have at least one item',
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingCost: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    tax: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    discount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    giftWrapCost: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    advancePaid: {
      type: Number,
      required: true,
      default: 0,
    },
    remainingAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    shippingAddress: {
      type: AddressSchema,
      required: true,
    },
    billingAddress: {
      type: AddressSchema,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'card', 'upi', 'bank'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'advance_paid', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    status: {
      type: String,
      enum: ['pending', 'advance_paid', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
    },
    shippingMethod: {
      type: String,
      enum: ['standard', 'express'],
      default: 'standard',
    },
    coupon: {
      type: CouponAppliedSchema,
    },
    trackingNumber: {
      type: String,
      trim: true,
    },
    carrier: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    cancelledAt: {
      type: Date,
    },
    shippedAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    paidAt: {
      type: Date,
    },
    estimatedDelivery: {
      type: Date,
    },
    statusNotes: {
      type: String,
      trim: true,
    },
    statusUpdatedAt: {
      type: Date,
    },
    razorpayPaymentId: {
      type: String,
      trim: true,
    },
    razorpayOrderId: {
      type: String,
      trim: true,
    },
    transactionId: {
      type: String,
      trim: true,
    },
    paymentHistory: {
      type: [PaymentHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// ============================================================
// Indexes
// ============================================================

OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ 'shippingAddress.phone': 1 });
OrderSchema.index({ 'shippingAddress.email': 1 });

// Compound indexes for common queries
OrderSchema.index({ user: 1, status: 1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ paymentStatus: 1, status: 1 });

// ============================================================
// Pre-save Hook: Generate order number if not provided
// ============================================================

OrderSchema.pre<IOrder>('save', function (next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.orderNumber = `PJM${timestamp}${random}`;
  }
  next();
});

// ============================================================
// Pre-save Hook: Update timestamps for status changes
// ============================================================

OrderSchema.pre<IOrder>('save', function (next) {
  if (this.isModified('status')) {
    this.statusUpdatedAt = new Date();

    // Update specific timestamps based on status
    if (this.status === 'shipped' && !this.shippedAt) {
      this.shippedAt = new Date();
    }
    if (this.status === 'delivered' && !this.deliveredAt) {
      this.deliveredAt = new Date();
    }
    if (this.status === 'cancelled' && !this.cancelledAt) {
      this.cancelledAt = new Date();
    }
    if (this.paymentStatus === 'paid' && !this.paidAt) {
      this.paidAt = new Date();
    }
  }
  next();
});

// ============================================================
// Pre-remove Hook: Log deletion (optional)
// ============================================================

OrderSchema.pre(
  'deleteOne',
  { document: true, query: false },
  async function (next) {
    // You can add logging or analytics here
    // console.log(`Order ${this.orderNumber} is being deleted`);

    next();
  }
);

// ============================================================
// Instance Methods
// ============================================================

/**
 * Update order status with validation
 */
OrderSchema.methods.updateStatus = async function (
  newStatus: string,
  notes?: string
): Promise<void> {
  const validTransitions: Record<string, string[]> = {
    pending: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered', 'cancelled'],
    delivered: ['refunded'],
    cancelled: [],
    refunded: [],
  };

  if (!validTransitions[this.status]?.includes(newStatus)) {
    throw new Error(`Invalid status transition from ${this.status} to ${newStatus}`);
  }

  this.status = newStatus;
  if (notes) {
    this.statusNotes = notes;
  }
  this.statusUpdatedAt = new Date();

  if (newStatus === 'shipped' && !this.shippedAt) {
    this.shippedAt = new Date();
  }
  if (newStatus === 'delivered' && !this.deliveredAt) {
    this.deliveredAt = new Date();
  }
  if (newStatus === 'cancelled' && !this.cancelledAt) {
    this.cancelledAt = new Date();
  }

  await this.save();
};

/**
 * Check if order can be cancelled
 */
OrderSchema.methods.isCancellable = function (): boolean {
  return ['pending', 'processing'].includes(this.status);
};

/**
 * Check if order can be refunded
 */
OrderSchema.methods.isRefundable = function (): boolean {
  return this.status === 'delivered' && this.paymentStatus === 'paid';
};

/**
 * Get total number of items in order
 */
OrderSchema.methods.getTotalItems = function (
  this: IOrder
): number {
  return this.items.reduce(
    (sum: number, item: IOrderItem) => sum + item.quantity,
    0
  );
};

/**
 * Get item count by product
 */
OrderSchema.methods.getProductQuantity = function (productId: string): number {
  const item = this.items.find(
    (i: any) => i.product.toString() === productId
  );
  return item?.quantity || 0;
};

/**
 * Check if order contains a specific product
 */
OrderSchema.methods.containsProduct = function (
  this: IOrder,
  productId: string
): boolean {
  return (this.items as IOrderItem[]).some(
    (item: IOrderItem) =>
      item.product.toString() === productId
  );
};

// ============================================================
// Static Methods
// ============================================================

/**
 * Find order by order number (case-insensitive)
 */
OrderSchema.statics.findByOrderNumber = function (orderNumber: string) {
  return this.findOne({ orderNumber: orderNumber.toUpperCase() });
};

/**
 * Get orders by user with pagination
 */
OrderSchema.statics.findByUser = function (
  userId: string,
  page: number = 1,
  limit: number = 10,
  status?: string
) {
  const query: any = { user: userId };
  if (status) query.status = status;

  return this.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

/**
 * Get orders by status with pagination (admin)
 */
OrderSchema.statics.findByStatus = function (
  status: string,
  page: number = 1,
  limit: number = 20,
  startDate?: Date,
  endDate?: Date
) {
  const query: any = { status };
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = startDate;
    if (endDate) query.createdAt.$lte = endDate;
  }

  return this.find(query)
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

/**
 * Get order statistics for dashboard
 */
OrderSchema.statics.getStats = async function (
  startDate?: Date,
  endDate?: Date
) {
  const match: any = {};
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = startDate;
    if (endDate) match.createdAt.$lte = endDate;
  }

  const stats = await this.aggregate([
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
        refundedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, 1, 0] },
        },
      },
    },
  ]);

  return stats[0] || {
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    refundedOrders: 0,
  };
};

/**
 * Get daily order count for last N days
 */
OrderSchema.statics.getDailyOrders = async function (days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
        revenue: { $sum: '$grandTotal' },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

/**
 * Get revenue by payment method
 */
OrderSchema.statics.getRevenueByPayment = async function (
  startDate?: Date,
  endDate?: Date
) {
  const match: any = {};
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = startDate;
    if (endDate) match.createdAt.$lte = endDate;
  }

  return await this.aggregate([
    { $match: { ...match, status: { $ne: 'cancelled' } } },
    {
      $group: {
        _id: '$paymentMethod',
        totalRevenue: { $sum: '$grandTotal' },
        count: { $sum: 1 },
      },
    },
  ]);
};

// ============================================================
// Virtuals
// ============================================================

OrderSchema.virtual('totalItems').get(function () {
  return this.getTotalItems();
});

OrderSchema.virtual('isPaid').get(function () {
  return this.paymentStatus === 'paid';
});

OrderSchema.virtual('isCompleted').get(function () {
  return this.status === 'delivered' || this.status === 'refunded';
});

OrderSchema.virtual('isActive').get(function () {
  return !['cancelled', 'refunded'].includes(this.status);
});

// Ensure virtuals are included when converting to JSON
OrderSchema.set('toJSON', { virtuals: true });
OrderSchema.set('toObject', { virtuals: true });

// ============================================================
// Model
// ============================================================

export const Order = mongoose.model<IOrder>('Order', OrderSchema);

export default Order;