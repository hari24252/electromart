import { User } from '../../models/user.model.js';
import { Product } from '../../models/product.model.js';

export const wishlistRepository = {
  findUser: (id: string) => User.findById(id).populate({ path: 'wishlist', match: { deletedAt: null, status: 'active' } }),
  findUserRaw: (id: string) => User.findById(id),
  findProduct: (id: string) => Product.findOne({ _id: id, deletedAt: null, status: 'active' }),
  save: <T extends { save: () => Promise<unknown> }>(user: T) => user.save(),
};
