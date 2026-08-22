import { Schema, model } from 'mongoose';

const otpSchema = new Schema({
  identifier: { type: String, required: true, trim: true, lowercase: true },
  purpose: { type: String, enum: ['signup', 'login', 'reset'], required: true },
  codeHash: { type: String, required: true, select: false },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
}, { timestamps: true, versionKey: false });

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ identifier: 1, purpose: 1 });

export const Otp = model('Otp', otpSchema);
