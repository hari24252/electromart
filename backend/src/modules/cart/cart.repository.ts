import { Cart } from '../../models/cart.model.js';
import { Product } from '../../models/product.model.js';

export const cartRepository = {
  findByUser: (userId: string) => Cart.findOne({ user: userId }).populate({ path: 'items.product', match: { deletedAt: null } }),
  findRawByUser: (userId: string) => Cart.findOne({ user: userId }),
  create: (userId: string) => Cart.create({ user: userId, items: [] }),
  save: <T extends { save: () => Promise<unknown> }>(cart: T) => cart.save(),
  clear: (userId: string) => Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } }, { new: true }),
  findProduct: (productId: string) => Product.findOne({ _id: productId, deletedAt: null, status: 'active' }),
};
