import mongoose, { Schema, Document } from 'mongoose';

export interface ICartActivity extends Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  action: 'added' | 'removed';
  quantity: number;
  addedAt?: Date;
  removedAt?: Date;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CartActivitySchema = new Schema<ICartActivity>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: ['added', 'removed'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 1,
    },
    addedAt: {
      type: Date,
    },
    removedAt: {
      type: Date,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

CartActivitySchema.index({ user: 1, product: 1, action: 1 });
CartActivitySchema.index({ createdAt: -1 });

export const CartActivity = mongoose.model<ICartActivity>('CartActivity', CartActivitySchema);
export default CartActivity;
