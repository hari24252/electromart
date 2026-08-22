import { Coupon } from '../../models/coupon.model.js';

export const couponRepository = {
  findByCode: (code: string) => Coupon.findOne({ code: code.toUpperCase() }),
  findById: (id: string) => Coupon.findById(id),
  findAll: () => Coupon.find({}).sort({ createdAt: -1 }).lean(),
  create: (data: Record<string, unknown>) => Coupon.create(data),
  update: (id: string, data: Record<string, unknown>) => Coupon.findByIdAndUpdate(id, data, { new: true, runValidators: true }),
  deactivate: (id: string) => Coupon.findByIdAndUpdate(id, { isActive: false }, { new: true }),
  consume: (id: string) => Coupon.findOneAndUpdate(
    { _id: id, isActive: true, startsAt: { $lte: new Date() }, expiresAt: { $gt: new Date() }, $expr: { $or: [{ $eq: ['$usageLimit', null] }, { $lt: ['$usedCount', '$usageLimit'] }] } },
    { $inc: { usedCount: 1 } },
    { new: true },
  ),
  release: (id: string) => Coupon.findOneAndUpdate({ _id: id, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } }),
};
