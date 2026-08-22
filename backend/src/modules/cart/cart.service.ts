import { conflict, notFound } from '../../utils/apiError.js';
import { ensureObjectId } from '../../utils/ids.js';
import { cartRepository } from './cart.repository.js';

const unitPrice = (product: { price?: number; discountPrice?: number | null }): number => product.discountPrice ?? product.price ?? 0;

export const cartService = {
  async read(userId: string) {
    const cart = await cartRepository.findByUser(userId);
    if (!cart) return { items: [], itemsTotal: 0, quantityTotal: 0, hasPriceChanges: false, hasAvailabilityChanges: false };
    let itemsTotal = 0;
    let quantityTotal = 0;
    let hasPriceChanges = false;
    let hasAvailabilityChanges = false;
    const items: Array<Record<string, unknown>> = [];
    for (const item of cart.items) {
      const product = item.product as unknown as { _id?: { toString(): string }; name?: string; images?: string[]; thumbnail?: string; stock?: number; price?: number; discountPrice?: number | null; status?: string } | null;
      if (!product || product.price === undefined) {
        hasAvailabilityChanges = true;
        items.push({ product: null, productId: item.product.toString(), quantity: item.quantity, priceAtAdd: item.priceAtAdd, currentPrice: null, lineTotal: 0, priceChanged: false, available: false, unavailableReason: 'Product is no longer available' });
        continue;
      }
      const currentPrice = unitPrice(product);
      const priceChanged = item.priceAtAdd !== currentPrice;
      const available = product.status === 'active' && (product.stock ?? 0) >= item.quantity;
      hasAvailabilityChanges ||= !available;
      itemsTotal += currentPrice * item.quantity;
      quantityTotal += item.quantity;
      hasPriceChanges ||= priceChanged;
      items.push({ product, quantity: item.quantity, priceAtAdd: item.priceAtAdd, currentPrice, lineTotal: currentPrice * item.quantity, priceChanged, available });
    }
    return { items, itemsTotal, quantityTotal, hasPriceChanges, hasAvailabilityChanges };
  },

  async add(userId: string, productId: string, quantity: number) {
    const product = await cartRepository.findProduct(ensureObjectId(productId, 'product').toString());
    if (!product) throw notFound('Product');
    let cart = await cartRepository.findRawByUser(userId);
    if (!cart) cart = await cartRepository.create(userId);
    const existing = cart.items.find((item) => item.product.toString() === product.id);
    const newQuantity = (existing?.quantity ?? 0) + quantity;
    if (newQuantity > product.stock) throw conflict('Requested quantity exceeds available stock', 'INSUFFICIENT_STOCK');
    if (existing) existing.quantity = newQuantity;
    else cart.items.push({ product: product._id, quantity, priceAtAdd: unitPrice(product) });
    await cartRepository.save(cart);
    return this.read(userId);
  },

  async update(userId: string, productId: string, quantity: number) {
    const product = await cartRepository.findProduct(ensureObjectId(productId, 'product').toString());
    if (!product) throw notFound('Product');
    if (quantity > product.stock) throw conflict('Requested quantity exceeds available stock', 'INSUFFICIENT_STOCK');
    const cart = await cartRepository.findRawByUser(userId);
    const item = cart?.items.find((entry) => entry.product.toString() === product.id);
    if (!item) throw notFound('Cart item');
    item.quantity = quantity;
    await cartRepository.save(cart!);
    return this.read(userId);
  },

  async remove(userId: string, productId: string) {
    const cart = await cartRepository.findRawByUser(userId);
    if (!cart) throw notFound('Cart');
    const before = cart.items.length;
    cart.items.splice(0, cart.items.length, ...cart.items.filter((item) => item.product.toString() !== ensureObjectId(productId, 'product').toString()));
    if (cart.items.length === before) throw notFound('Cart item');
    await cartRepository.save(cart);
    return this.read(userId);
  },

  async clear(userId: string) { await cartRepository.clear(userId); },
};
