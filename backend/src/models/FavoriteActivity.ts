import mongoose, { Schema, Document } from 'mongoose';

export interface IFavoriteActivity extends Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  action: 'added' | 'removed';
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FavoriteActivitySchema = new Schema<IFavoriteActivity>(
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
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

FavoriteActivitySchema.index({ user: 1, product: 1 });
FavoriteActivitySchema.index({ createdAt: -1 });

export const FavoriteActivity = mongoose.model<IFavoriteActivity>('FavoriteActivity', FavoriteActivitySchema);
export default FavoriteActivity;
