import { Order } from '../../models/order.model.js';
import { Product } from '../../models/product.model.js';
import { User } from '../../models/user.model.js';

export const adminDashboardRepository = {
  async stats() {
    const [revenue, totalOrders, totalUsers, totalProducts, pendingOrders] = await Promise.all([
      Order.aggregate<{ total: number }>([{ $match: { status: 'delivered' } }, { $group: { _id: null, total: { $sum: '$grandTotal' } } }]),
      Order.countDocuments(),
      User.countDocuments({ isActive: true }),
      Product.countDocuments({ deletedAt: null }),
      Order.countDocuments({ status: { $in: ['placed', 'processing'] } }),
    ]);
    return { totalRevenue: revenue[0]?.total ?? 0, totalOrders, totalUsers, totalProducts, pendingOrders };
  },
  revenueChart: (period: 'day' | 'week' | 'month', from?: Date, to?: Date) => {
    const format = period === 'month' ? '%Y-%m' : period === 'week' ? '%G-W%V' : '%Y-%m-%d';
    return Order.aggregate([
      { $match: { status: 'delivered', ...(from || to ? { createdAt: { ...(from ? { $gte: from } : {}), ...(to ? { $lte: to } : {}) } } : {}) } },
      { $group: { _id: { $dateToString: { format, date: '$createdAt' } }, total: { $sum: '$grandTotal' }, orders: { $sum: 1 } } },
      { $project: { _id: 0, date: '$_id', total: 1, orders: 1 } },
      { $sort: { date: 1 } },
    ]);
  },
  topProducts: (limit: number) => Order.aggregate([
    { $match: { status: { $in: ['processing', 'shipped', 'delivered'] } } },
    { $unwind: '$items' },
    { $group: { _id: '$items.product', name: { $first: '$items.name' }, sku: { $first: '$items.sku' }, quantitySold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } } } },
    { $sort: { quantitySold: -1 } }, { $limit: limit }, { $project: { _id: 0, productId: '$_id', name: 1, sku: 1, quantitySold: 1, revenue: 1 } },
  ]),
  lowStock: (threshold: number) => Product.find({ deletedAt: null, stock: { $lte: threshold } }).sort({ stock: 1, name: 1 }).select('name sku stock status thumbnail').lean(),
  recentOrders: (limit: number) => Order.find({}).sort({ createdAt: -1 }).limit(limit).populate('user', 'name email').lean(),
};
