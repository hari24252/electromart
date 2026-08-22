import { conflict, notFound } from '../../utils/apiError.js';
import { ensureObjectId } from '../../utils/ids.js';
import { writeAdminAudit } from '../../services/audit.service.js';
import { cartService } from '../cart/cart.service.js';
import { couponRepository } from './coupon.repository.js';

export interface CouponResolution { id: string; code: string; discount: number; }

export const couponService = {
  async resolve(codeInput: string, cartTotal: number): Promise<CouponResolution> {
    const coupon = await couponRepository.findByCode(codeInput);
    const now = new Date();
    if (!coupon || !coupon.isActive || coupon.startsAt > now || coupon.expiresAt <= now) throw conflict('Coupon is invalid or expired', 'INVALID_COUPON');
    if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) throw conflict('Coupon usage limit has been reached', 'COUPON_EXHAUSTED');
    if (cartTotal < coupon.minCartValue) throw conflict(`Coupon requires a cart total of at least ${coupon.minCartValue}`, 'COUPON_MIN_CART');
    const raw = coupon.type === 'percentage' ? cartTotal * (coupon.value / 100) : coupon.value;
    const discount = Math.min(raw, coupon.maxDiscount ?? Number.POSITIVE_INFINITY, cartTotal);
    return { id: coupon.id, code: coupon.code, discount: Number(discount.toFixed(2)) };
  },

  async apply(userId: string, code: string) {
    const cart = await cartService.read(userId);
    if (!cart.items.length) throw conflict('Your cart is empty', 'EMPTY_CART');
    if (cart.hasAvailabilityChanges) throw conflict('Resolve unavailable cart items before applying a coupon', 'CART_UNAVAILABLE');
    const coupon = await this.resolve(code, cart.itemsTotal);
    return { ...coupon, cartTotal: cart.itemsTotal, grandTotal: Number((cart.itemsTotal - coupon.discount).toFixed(2)) };
  },

  async consume(resolution: CouponResolution) {
    const coupon = await couponRepository.consume(resolution.id);
    if (!coupon) throw conflict('Coupon is no longer available', 'COUPON_EXHAUSTED');
  },
  async release(resolution: CouponResolution) { await couponRepository.release(resolution.id); },
  async list() { return couponRepository.findAll(); },
  async create(input: Record<string, unknown>, adminId: string) {
    if (await couponRepository.findByCode(String(input.code))) throw conflict('Coupon code already exists', 'COUPON_EXISTS');
    if (!(input.expiresAt instanceof Date) || input.expiresAt <= new Date()) throw conflict('Coupon expiry must be in the future', 'INVALID_COUPON_EXPIRY');
    const coupon = await couponRepository.create({ ...input, code: String(input.code).toUpperCase() });
    await writeAdminAudit(adminId, 'coupon.create', 'coupon', coupon.id, { code: coupon.code });
    return coupon;
  },
  async update(id: string, input: Record<string, unknown>, adminId: string) {
    const couponId = ensureObjectId(id, 'coupon').toString();
    const existing = await couponRepository.findById(couponId);
    if (!existing) throw notFound('Coupon');
    const candidate = { ...existing.toObject(), ...input } as { type: string; value: number; startsAt: Date; expiresAt: Date };
    if (candidate.type === 'percentage' && candidate.value > 100) throw conflict('Percentage coupon value must be at most 100', 'INVALID_COUPON');
    if (candidate.expiresAt <= candidate.startsAt) throw conflict('Expiry must be after start date', 'INVALID_COUPON_DATES');
    if (input.code && String(input.code).toUpperCase() !== existing.code && await couponRepository.findByCode(String(input.code))) throw conflict('Coupon code already exists', 'COUPON_EXISTS');
    const coupon = await couponRepository.update(couponId, { ...input, ...(input.code ? { code: String(input.code).toUpperCase() } : {}) });
    if (!coupon) throw notFound('Coupon');
    await writeAdminAudit(adminId, 'coupon.update', 'coupon', coupon.id, input);
    return coupon;
  },
  async deactivate(id: string, adminId: string) {
    const coupon = await couponRepository.deactivate(ensureObjectId(id, 'coupon').toString());
    if (!coupon) throw notFound('Coupon');
    await writeAdminAudit(adminId, 'coupon.deactivate', 'coupon', coupon.id);
  },
};
