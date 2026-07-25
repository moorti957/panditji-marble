import mongoose, { Schema, Document } from 'mongoose';

export interface IProductView extends Document {
  user?: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  productName: string;
  category?: string;
  device?: string;
  ip?: string;
  viewCount: number;
  lastViewedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProductViewSchema = new Schema<IProductView>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    device: {
      type: String,
      trim: true,
    },
    ip: {
      type: String,
      trim: true,
    },
    viewCount: {
      type: Number,
      default: 1,
      min: 0,
    },
    lastViewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

ProductViewSchema.index({ user: 1, product: 1 }, { unique: true });
ProductViewSchema.index({ createdAt: -1 });

export const ProductView = mongoose.model<IProductView>('ProductView', ProductViewSchema);
export default ProductView;
