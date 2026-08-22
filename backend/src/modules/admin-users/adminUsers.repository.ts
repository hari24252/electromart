import { User } from '../../models/user.model.js';

export const adminUsersRepository = {
  list: (filter: Record<string, unknown>, page: number, limit: number) => Promise.all([
    User.find(filter).select('-passwordHash').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    User.countDocuments(filter),
  ]),
  updateStatus: (id: string, isActive: boolean) => User.findByIdAndUpdate(id, { isActive, $inc: { authVersion: 1 } }, { new: true }),
};
