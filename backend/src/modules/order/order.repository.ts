import { Order } from '../../models/order.model.js';
import { User } from '../../models/user.model.js';
import { Cart } from '../../models/cart.model.js';
import { InventoryLog } from '../../models/inventoryLog.model.js';

export const orderRepository = {
  findCart: (userId: string) => Cart.findOne({ user: userId }).populate({ path: 'items.product', match: { deletedAt: null } }),
  clearCart: (userId: string) => Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } }),
  restoreCart: (userId: string, items: unknown[]) => Cart.findOneAndUpdate({ user: userId }, { $set: { items } }),
  findUserAddress: (userId: string, addressId: string) => User.findOne({ _id: userId, 'addresses._id': addressId }, { 'addresses.$': 1 }),
  create: (data: Record<string, unknown>) => Order.create(data),
  findByUser: (userId: string, page: number, limit: number) => Promise.all([
    Order.find({ user: userId }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Order.countDocuments({ user: userId }),
  ]),
  findForUser: (id: string, userId: string) => Order.findOne({ _id: id, user: userId }).lean(),
  findById: (id: string) => Order.findById(id).populate('user', 'name email phone').lean(),
  findMutableById: (id: string) => Order.findById(id),
  cancelPlacedOrder: async (id: string, userId: string, note?: string): Promise<any> => Order.findOneAndUpdate(
    { _id: id, user: userId, status: 'placed' } as any,
    {
      $set: { status: 'cancelled', cancelledAt: new Date() },
      $push: { statusHistory: { status: 'cancelled', changedBy: 'user', changedAt: new Date(), ...(note ? { note } : {}) } },
    } as any,
    { new: true, includeResultMetadata: false } as any,
  ),
  advanceStatus: async (id: string, from: string, status: 'processing' | 'shipped' | 'delivered', note?: string): Promise<any> => Order.findOneAndUpdate(
    { _id: id, status: from } as any,
    {
      $set: { status },
      $push: { statusHistory: { status, changedBy: 'admin', changedAt: new Date(), ...(note ? { note } : {}) } },
    } as any,
    { new: true, includeResultMetadata: false } as any,
  ),
  findAll: (filter: Record<string, unknown>, page: number, limit: number) => Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('user', 'name email phone').lean(),
    Order.countDocuments(filter),
  ]),
  createInventoryLog: (data: Record<string, unknown>) => InventoryLog.create(data),
  hasDeliveredProduct: (userId: string, productId: string) => Order.exists({ user: userId, status: 'delivered', 'items.product': productId }),
};
