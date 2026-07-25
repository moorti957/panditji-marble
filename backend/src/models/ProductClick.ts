import mongoose, { Schema, Document } from 'mongoose';

export interface IProductClick extends Document {
  user?: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  clickCount: number;
  lastClickedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProductClickSchema = new Schema<IProductClick>(
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
    clickCount: {
      type: Number,
      default: 1,
      min: 0,
    },
    lastClickedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

ProductClickSchema.index({ user: 1, product: 1 }, { unique: true });
ProductClickSchema.index({ createdAt: -1 });

export const ProductClick = mongoose.model<IProductClick>('ProductClick', ProductClickSchema);
export default ProductClick;
