import mongoose from 'mongoose';
import { Review } from '../../models/review.model.js';

export const reviewRepository = {
  findByProduct: (productId: string) => Review.find({ product: productId, isApproved: true }).sort({ createdAt: -1 }).populate('user', 'name').lean(),
  findByProductAndUser: (productId: string, userId: string) => Review.findOne({ product: productId, user: userId }),
  findById: (id: string) => Review.findById(id),
  create: (data: Record<string, unknown>) => Review.create(data),
  update: (id: string, data: Record<string, unknown>) => Review.findByIdAndUpdate(id, data, { new: true, runValidators: true }),
  remove: (id: string) => Review.findByIdAndDelete(id),
  aggregateRatings: async (productId: string) => {
    const [result] = await Review.aggregate<{ average: number; count: number }>([
      { $match: { product: mongoose.Types.ObjectId.createFromHexString(productId), isApproved: true } },
      { $group: { _id: '$product', average: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    return result ?? { average: 0, count: 0 };
  },
};
