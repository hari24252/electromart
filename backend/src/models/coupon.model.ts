import { Schema, model } from 'mongoose';

const couponSchema = new Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  type: { type: String, enum: ['percentage', 'flat'], required: true },
  value: { type: Number, required: true, min: 0 },
  minCartValue: { type: Number, default: 0, min: 0 },
  maxDiscount: { type: Number, min: 0 },
  usageLimit: { type: Number, min: 1 },
  usedCount: { type: Number, default: 0, min: 0 },
  startsAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true, versionKey: false });

export const Coupon = model('Coupon', couponSchema);
