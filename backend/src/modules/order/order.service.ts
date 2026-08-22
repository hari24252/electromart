import crypto from 'node:crypto';
import { conflict, notFound } from '../../utils/apiError.js';
import { logger } from '../../config/logger.js';
import { ensureObjectId } from '../../utils/ids.js';
import { writeAdminAudit } from '../../services/audit.service.js';
import { invalidateCache } from '../../services/cache.service.js';
import { productRepository } from '../product/product.repository.js';
import { couponService, type CouponResolution } from '../coupon/coupon.service.js';
import { orderRepository } from './order.repository.js';

const currentPrice = (product: { price?: number; discountPrice?: number | null }): number => product.discountPrice ?? product.price ?? 0;
const createOrderNumber = (): string => `ORD-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

export const orderService = {
  async create(userId: string, addressId: string, couponCode?: string) {
    const cart = await orderRepository.findCart(userId);
    if (!cart || cart.items.length === 0) throw conflict('Cannot place an order with an empty cart', 'EMPTY_CART');
    const addressOwner = await orderRepository.findUserAddress(userId, ensureObjectId(addressId, 'address').toString());
    const address = addressOwner?.addresses[0];
    if (!address) throw notFound('Shipping address');

    const items = cart.items.map((cartItem) => {
      const product = cartItem.product as unknown as { _id?: { toString(): string }; id?: string; name?: string; slug?: string; sku?: string; thumbnail?: string; images?: string[]; price?: number; discountPrice?: number | null; stock?: number; status?: string } | null;
      if (!product || product.price === undefined || !product._id || product.status !== 'active') throw conflict('One or more cart products are no longer available', 'PRODUCT_UNAVAILABLE');
      if ((product.stock ?? 0) < cartItem.quantity) throw conflict(`Insufficient stock for ${product.name ?? 'a cart item'}`, 'INSUFFICIENT_STOCK');
      return { productId: product._id.toString(), name: product.name ?? '', slug: product.slug ?? '', sku: product.sku ?? '', image: product.thumbnail ?? product.images?.[0], price: currentPrice(product), quantity: cartItem.quantity };
    });
    const itemsTotal = Number(items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2));
    const coupon = couponCode ? await couponService.resolve(couponCode, itemsTotal) : undefined;
    const reserved: { productId: string; quantity: number; resultingStock: number }[] = [];
    let consumedCoupon: CouponResolution | undefined;
    let cartWasCleared = false;
    let order: Awaited<ReturnType<typeof orderRepository.create>> | undefined;
    try {
      for (const item of items) {
        const updated = await productRepository.reserveStock(item.productId, item.quantity);
        if (!updated) throw conflict(`Insufficient stock for ${item.name}`, 'INSUFFICIENT_STOCK');
        reserved.push({ productId: item.productId, quantity: item.quantity, resultingStock: updated.stock });
      }
      if (coupon) { await couponService.consume(coupon); consumedCoupon = coupon; }
      await orderRepository.clearCart(userId);
      cartWasCleared = true;
      const discountTotal = coupon?.discount ?? 0;
      order = await orderRepository.create({
        orderNumber: createOrderNumber(), user: userId, items: items.map((item) => ({ product: item.productId, name: item.name, slug: item.slug, sku: item.sku, ...(item.image ? { image: item.image } : {}), price: item.price, quantity: item.quantity })),
        shippingAddress: { recipientName: address.recipientName, phone: address.phone, line1: address.line1, ...(address.line2 ? { line2: address.line2 } : {}), city: address.city, state: address.state, postalCode: address.postalCode, country: address.country },
        status: 'placed', statusHistory: [{ status: 'placed', changedBy: 'user', changedAt: new Date(), note: 'Order placed' }], paymentMethod: 'COD',
        ...(coupon ? { coupon: { code: coupon.code, discount: coupon.discount } } : {}), itemsTotal, discountTotal, shippingTotal: 0, grandTotal: Number((itemsTotal - discountTotal).toFixed(2)),
      });
    } catch (error) {
      await Promise.all(reserved.map((entry) => productRepository.restoreStock(entry.productId, entry.quantity)));
      if (consumedCoupon) await couponService.release(consumedCoupon);
      if (cartWasCleared) await orderRepository.restoreCart(userId, cart.items);
      throw error;
    }

    try {
      await Promise.all(reserved.map((entry) => orderRepository.createInventoryLog({ product: entry.productId, change: -entry.quantity, previousStock: entry.resultingStock + entry.quantity, resultingStock: entry.resultingStock, reason: 'order', reference: order!.orderNumber })));
    } catch (error) {
      logger.error({ err: error, orderNumber: order.orderNumber }, 'Order was placed but inventory audit logging failed');
    }
    await invalidateCache('products:');
    return order;
  },

  async myOrders(userId: string, page: number, limit: number) {
    const [items, total] = await orderRepository.findByUser(userId, page, limit);
    return { items, total };
  },
  async myOrder(userId: string, id: string) { const order = await orderRepository.findForUser(ensureObjectId(id, 'order').toString(), userId); if (!order) throw notFound('Order'); return order; },

  async cancel(userId: string, id: string, note?: string) {
    const orderId = ensureObjectId(id, 'order').toString();
    const order = await orderRepository.cancelPlacedOrder(orderId, userId, note);
    if (!order) {
      const existing = await orderRepository.findForUser(orderId, userId);
      if (!existing) throw notFound('Order');
      throw conflict('Only newly placed orders can be cancelled', 'ORDER_CANNOT_CANCEL');
    }
    await Promise.all(order.items.map(async (item) => {
      const product = await productRepository.restoreStock(item.product.toString(), item.quantity);
      if (product) await orderRepository.createInventoryLog({ product: item.product, change: item.quantity, previousStock: product.stock - item.quantity, resultingStock: product.stock, reason: 'cancellation', reference: order.orderNumber });
    }));
    await invalidateCache('products:');
    return order;
  },

  async listAll(query: Record<string, unknown>) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const filter: Record<string, unknown> = {};
    if (typeof query.status === 'string') filter.status = query.status;
    const from = query.from instanceof Date ? query.from : typeof query.from === 'string' ? new Date(query.from) : undefined;
    const to = query.to instanceof Date ? query.to : typeof query.to === 'string' ? new Date(query.to) : undefined;
    if (from || to) filter.createdAt = { ...(from ? { $gte: from } : {}), ...(to ? { $lte: to } : {}) };
    const [items, total] = await orderRepository.findAll(filter, page, limit);
    return { items, total, page, limit };
  },
  async detail(id: string) { const order = await orderRepository.findById(ensureObjectId(id, 'order').toString()); if (!order) throw notFound('Order'); return order; },

  async updateStatus(id: string, status: 'processing' | 'shipped' | 'delivered', note: string | undefined, adminId: string) {
    const order = await orderRepository.findMutableById(ensureObjectId(id, 'order').toString());
    if (!order) throw notFound('Order');
    const allowed: Record<string, string> = { placed: 'processing', processing: 'shipped', shipped: 'delivered' };
    if (allowed[order.status] !== status) throw conflict(`Order status can only advance from ${order.status} to ${allowed[order.status] ?? 'no further state'}`, 'INVALID_STATUS_TRANSITION');
    const updated = await orderRepository.advanceStatus(order.id, order.status, status, note);
    if (!updated) throw conflict('This order was updated by another request; refresh and try again', 'ORDER_CONCURRENT_UPDATE');
    await writeAdminAudit(adminId, 'order.status', 'order', order.id, { status, note });
    return updated;
  },
  async hasDeliveredProduct(userId: string, productId: string) { return Boolean(await orderRepository.hasDeliveredProduct(userId, productId)); },
};
