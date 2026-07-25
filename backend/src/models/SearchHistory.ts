import mongoose, { Schema, Document } from 'mongoose';

export interface ISearchHistory extends Document {
  user?: mongoose.Types.ObjectId;
  keyword: string;
  resultCount: number;
  device?: string;
  ip?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SearchHistorySchema = new Schema<ISearchHistory>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    keyword: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    resultCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    device: {
      type: String,
      trim: true,
    },
    ip: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

SearchHistorySchema.index({ user: 1, createdAt: -1 });
SearchHistorySchema.index({ keyword: 1 });

export const SearchHistory = mongoose.model<ISearchHistory>('SearchHistory', SearchHistorySchema);
export default SearchHistory;
