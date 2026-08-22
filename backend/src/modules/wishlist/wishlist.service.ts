import { conflict, notFound } from '../../utils/apiError.js';
import { ensureObjectId } from '../../utils/ids.js';
import { wishlistRepository } from './wishlist.repository.js';

export const wishlistService = {
  async list(userId: string) { const user = await wishlistRepository.findUser(userId); if (!user) throw notFound('Account'); return user.wishlist; },
  async add(userId: string, productId: string) {
    const id = ensureObjectId(productId, 'product').toString();
    if (!await wishlistRepository.findProduct(id)) throw notFound('Product');
    const user = await wishlistRepository.findUserRaw(userId);
    if (!user) throw notFound('Account');
    if (user.wishlist.some((product) => product.toString() === id)) throw conflict('Product is already in your wishlist', 'WISHLIST_EXISTS');
    user.wishlist.push(ensureObjectId(id));
    await wishlistRepository.save(user);
    return this.list(userId);
  },
  async remove(userId: string, productId: string) {
    const user = await wishlistRepository.findUserRaw(userId);
    if (!user) throw notFound('Account');
    const id = ensureObjectId(productId, 'product').toString();
    const before = user.wishlist.length;
    user.wishlist = user.wishlist.filter((product) => product.toString() !== id);
    if (before === user.wishlist.length) throw notFound('Wishlist item');
    await wishlistRepository.save(user);
  },
};
