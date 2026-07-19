// backend/src/models/User.ts

import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// ============================================================
// Types
// ============================================================

export interface IAddress {
  _id?: mongoose.Types.ObjectId;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  phone: string;
  isDefault: boolean;
  addressType?: 'home' | 'office' | 'other';
}

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'user' | 'admin' | 'seller' | 'super-admin';
  isActive: boolean;
  emailVerified: boolean;
  avatar?: string;
  addresses: IAddress[];
  lastLogin?: Date;
  deletedAt?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// ============================================================
// Address Sub-Schema
// ============================================================

const AddressSchema = new Schema<IAddress>(
  {
    fullName: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' },
    phone: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
    addressType: { type: String, enum: ['home', 'office', 'other'], default: 'home' },
  },
  { _id: true }
);

// ============================================================
// User Schema
// ============================================================

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^\S+@\S+\.\S+$/,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      match: /^[0-9]{10}$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // exclude from queries by default
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'seller', 'super-admin'],
      default: 'user',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      trim: true,
    },
    addresses: [AddressSchema],
    lastLogin: {
      type: Date,
    },
    deletedAt: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    verificationToken: {
      type: String,
      select: false,
    },
    verificationTokenExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================================
// Indexes
// ============================================================

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ createdAt: -1 });

// ============================================================
// Pre-save Hook (hash password if modified)
// ============================================================

UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// ============================================================
// Instance Methods
// ============================================================

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// ============================================================
// Static Methods (optional)
// ============================================================

UserSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email });
};

// ============================================================
// Model
// ============================================================

export const User = mongoose.model<IUser>('User', UserSchema);

export default User;