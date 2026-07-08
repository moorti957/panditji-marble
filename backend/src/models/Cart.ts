// backend/src/models/Cart.ts

import mongoose, { Schema, Document, Model } from 'mongoose';

// ============================================================
// Types
// ============================================================

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  selectedVariant?: {
    id: string;
    name: string;
    attributes: Record<string, string>;
  };
  addedAt: Date;
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  subtotal: number;
  totalItems: number;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  addItem(productId: string, quantity?: number, variant?: any): Promise<void>;
  removeItem(productId: string, variantId?: string): Promise<void>;
  updateQuantity(productId: string, quantity: number, variantId?: string): Promise<void>;
  clearCart(): Promise<void>;
  getTotalItems(): number;
  getSubtotal(): number;
  isEmpty(): boolean;
  containsProduct(productId: string, variantId?: string): boolean;
  getItem(productId: string, variantId?: string): ICartItem | undefined;
  mergeWith(otherCart: ICart): Promise<void>;
}

// ============================================================
// Cart Item Sub-Schema
// ============================================================

const CartItemSchema = new Schema<ICartItem>(
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
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    selectedVariant: {
      id: { type: String, trim: true },
      name: { type: String, trim: true },
      attributes: { type: Map, of: String },
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

// ============================================================
// Cart Schema
// ============================================================

const CartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: {
      type: [CartItemSchema],
      default: [],
    },
    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalItems: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================================
// Indexes
// ============================================================

CartSchema.index({ user: 1 });
CartSchema.index({ 'items.product': 1 });
CartSchema.index({ 'items.selectedVariant.id': 1 });
CartSchema.index({ createdAt: -1 });

// Compound indexes for common queries
CartSchema.index({ user: 1, 'items.product': 1 });

// ============================================================
// Pre-save Hook: Calculate totals
// ============================================================

CartSchema.pre<ICart>('save', function (next) {
  this.subtotal = this.getSubtotal();
  this.totalItems = this.getTotalItems();
  next();
});

// ============================================================
// Instance Methods
// ============================================================

/**
 * Add an item to the cart
 */
CartSchema.methods.addItem = async function (
  productId: string,
  quantity: number = 1,
  variant?: any
): Promise<void> {
  if (quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }

  // Find the product
  const Product = mongoose.model('Product');
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  // Check stock
  if (!product.inStock || (product.stockQuantity || 0) < quantity) {
    throw new Error('Insufficient stock');
  }

  // Determine variant price
  let price = product.price;
  let variantInfo = undefined;

  if (variant) {
    const variantData = product.variants?.find(
      (v: any) => v.id === variant.id
    );
    if (variantData) {
      price = variantData.price;
      variantInfo = {
        id: variant.id,
        name: variant.name || variantData.name,
        attributes: variant.attributes || variantData.attributes,
      };
    } else {
      throw new Error('Variant not found');
    }
  }

  // Check if item already exists in cart
 const existingItem = this.items.find(
  (item: ICartItem) =>
    item.product.toString() === productId &&
    (!variantInfo || item.selectedVariant?.id === variantInfo.id)
);

  if (existingItem) {
    // Update quantity
    const newQuantity = existingItem.quantity + quantity;
    if (product.stockQuantity && newQuantity > product.stockQuantity) {
      throw new Error('Insufficient stock');
    }
    existingItem.quantity = newQuantity;
  } else {
    // Add new item
    this.items.push({
      product: product._id as mongoose.Types.ObjectId,
      name: product.name,
      image: product.images?.[0] || '',
      price,
      quantity,
      selectedVariant: variantInfo,
      addedAt: new Date(),
    });
  }

  // Recalculate totals
  this.subtotal = this.getSubtotal();
  this.totalItems = this.getTotalItems();

  await this.save();
};

/**
 * Remove an item from the cart
 */
CartSchema.methods.removeItem = async function (
  productId: string,
  variantId?: string
): Promise<void> {
  const index = this.items.findIndex(
    (item: ICartItem) =>
      item.product.toString() === productId &&
      (!variantId || item.selectedVariant?.id === variantId)
  );

  if (index === -1) {
    throw new Error('Item not found in cart');
  }

  this.items.splice(index, 1);

  // Recalculate totals
  this.subtotal = this.getSubtotal();
  this.totalItems = this.getTotalItems();

  await this.save();
};

/**
 * Update quantity of an item in the cart
 */
CartSchema.methods.updateQuantity = async function (
  productId: string,
  quantity: number,
  variantId?: string
): Promise<void> {
  if (quantity < 0) {
    throw new Error('Quantity must be at least 0');
  }

  if (quantity === 0) {
    await this.removeItem(productId, variantId);
    return;
  }

  const item = this.items.find(
    (item: ICartItem) =>
      item.product.toString() === productId &&
      (!variantId || item.selectedVariant?.id === variantId)
  );

  if (!item) {
    throw new Error('Item not found in cart');
  }

  // Check stock
  const Product = mongoose.model('Product');
  const product = await Product.findById(productId);
  if (product && product.stockQuantity && quantity > product.stockQuantity) {
    throw new Error('Insufficient stock');
  }

  item.quantity = quantity;

  // Recalculate totals
  this.subtotal = this.getSubtotal();
  this.totalItems = this.getTotalItems();

  await this.save();
};

/**
 * Clear all items from the cart
 */
CartSchema.methods.clearCart = async function (): Promise<void> {
  this.items = [];
  this.subtotal = 0;
  this.totalItems = 0;
  await this.save();
};

/**
 * Get total number of items in the cart
 */
CartSchema.methods.getTotalItems = function (): number {
  return this.items.reduce((sum: number, item: ICartItem) => sum + item.quantity, 0);
};

/**
 * Get subtotal of the cart
 */
CartSchema.methods.getSubtotal = function (): number {
  return this.items.reduce((sum: number, item: ICartItem ) => sum + item.price * item.quantity, 0);
};

/**
 * Check if the cart is empty
 */
CartSchema.methods.isEmpty = function (): boolean {
  return this.items.length === 0;
};

/**
 * Check if the cart contains a product
 */
CartSchema.methods.containsProduct = function (
  productId: string,
  variantId?: string
): boolean {
  return this.items.some(
    (item: ICartItem) =>
      item.product.toString() === productId &&
      (!variantId || item.selectedVariant?.id === variantId)
  );
};

/**
 * Get a specific item from the cart
 */
CartSchema.methods.getItem = function (
  productId: string,
  variantId?: string
): ICartItem | undefined {
  return this.items.find(
    (item: ICartItem) =>
      item.product.toString() === productId &&
      (!variantId || item.selectedVariant?.id === variantId)
  );
};

/**
 * Get item quantity for a product
 */
CartSchema.methods.getItemQuantity = function (
  productId: string,
  variantId?: string
): number {
  const item = this.getItem(productId, variantId);
  return item?.quantity || 0;
};

/**
 * Merge another cart into this cart (for guest login)
 */
CartSchema.methods.mergeWith = async function (otherCart: ICart): Promise<void> {
  if (!otherCart || otherCart.items.length === 0) {
    return;
  }

  for (const otherItem of otherCart.items) {
    const productId = otherItem.product.toString();
    const variantId = otherItem.selectedVariant?.id;

    try {
      // Add item, which will merge if it already exists
      await this.addItem(
        productId,
        otherItem.quantity,
        otherItem.selectedVariant
      );
    } catch (error) {
      // If item can't be added (e.g., out of stock), skip it
      // In production, you might want to track failures
      console.warn(
        `Could not merge item ${productId} from guest cart:`,
        error
      );
    }
  }

  await this.save();
};

/**
 * Validate all items in cart (check stock and availability)
 */
CartSchema.methods.validate = async function (): Promise<{
  valid: boolean;
  invalidItems: { productId: string; name: string; reason: string }[];
}> {
  const Product = mongoose.model('Product');
  const invalidItems: { productId: string; name: string; reason: string }[] = [];

  for (const item of this.items) {
    const product = await Product.findById(item.product);
    if (!product) {
      invalidItems.push({
        productId: item.product.toString(),
        name: item.name,
        reason: 'Product no longer exists',
      });
      continue;
    }

    if (!product.isActive) {
      invalidItems.push({
        productId: item.product.toString(),
        name: item.name,
        reason: 'Product is no longer available',
      });
      continue;
    }

    if (!product.inStock || (product.stockQuantity || 0) < item.quantity) {
      invalidItems.push({
        productId: item.product.toString(),
        name: item.name,
        reason: 'Insufficient stock',
      });
      continue;
    }

    // Check variant
    if (item.selectedVariant) {
      const variant = product.variants?.find(
        (v: any) => v.id === item.selectedVariant?.id
      );
      if (!variant) {
        invalidItems.push({
          productId: item.product.toString(),
          name: item.name,
          reason: 'Selected variant no longer available',
        });
      } else if (variant.stock < item.quantity) {
        invalidItems.push({
          productId: item.product.toString(),
          name: item.name,
          reason: 'Insufficient stock for selected variant',
        });
      }
    }
  }

  return {
    valid: invalidItems.length === 0,
    invalidItems,
  };
};

// ============================================================
// Static Methods
// ============================================================

/**
 * Find cart by user, or create one if it doesn't exist
 */
CartSchema.statics.findOrCreate = async function (userId: string): Promise<ICart> {
  let cart = await this.findOne({ user: userId });
  if (!cart) {
    cart = new this({ user: userId, items: [] });
    await cart.save();
  }
  return cart;
};

/**
 * Get cart by user with populated product details
 */
CartSchema.statics.findByUserPopulated = async function (userId: string) {
  return await this.findOne({ user: userId })
    .populate({
      path: 'items.product',
      select: 'name slug images price material inStock stockQuantity',
    })
    .populate({
      path: 'user',
      select: 'name email phone',
    });
};

/**
 * Get cart count for a user (total items)
 */
CartSchema.statics.getCartCount = async function (userId: string): Promise<number> {
  const cart = await this.findOne({ user: userId });
  return cart?.getTotalItems() || 0;
};

/**
 * Get all carts that have been inactive for more than N days
 */
CartSchema.statics.findInactive = async function (days: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  return await this.find({
    updatedAt: { $lt: cutoffDate },
    items: { $size: 0 },
  });
};

/**
 * Clear all carts older than N days
 */
CartSchema.statics.clearOldCarts = async function (days: number = 90): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const result = await this.deleteMany({
    updatedAt: { $lt: cutoffDate },
    items: { $size: 0 },
  });
  return result.deletedCount || 0;
};

// ============================================================
// Virtuals
// ============================================================

CartSchema.virtual('isValid').get(async function () {
  const validation = await (this as any).validate();
  return validation.valid;
});

CartSchema.virtual('itemCount').get(function () {
  return this.items.length;
});

// Ensure virtuals are included when converting to JSON
CartSchema.set('toJSON', { virtuals: true });
CartSchema.set('toObject', { virtuals: true });

// ============================================================
// Model
// ============================================================

export const Cart = mongoose.model<ICart>('Cart', CartSchema);

export default Cart;