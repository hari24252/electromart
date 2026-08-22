import { Schema, model } from 'mongoose';

const reviewSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, trim: true, maxlength: 140 },
  comment: { type: String, required: true, trim: true, minlength: 2, maxlength: 2000 },
  isVerifiedPurchase: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: true },
}, { timestamps: true, versionKey: false });

reviewSchema.index({ product: 1, user: 1 }, { unique: true });
export const Review = model('Review', reviewSchema);
