import { z } from 'zod';

export const applyCouponSchema = z.object({ code: z.string().trim().min(2).max(50) });
const couponBaseSchema = z.object({
  code: z.string().trim().min(2).max(50),
  type: z.enum(['percentage', 'flat']),
  value: z.coerce.number().positive(),
  minCartValue: z.coerce.number().min(0).default(0),
  maxDiscount: z.coerce.number().positive().optional(),
  usageLimit: z.coerce.number().int().positive().optional(),
  startsAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date(),
  isActive: z.boolean().optional(),
});
export const couponSchema = couponBaseSchema.refine((coupon) => coupon.type !== 'percentage' || coupon.value <= 100, { message: 'Percentage coupon value must be at most 100', path: ['value'] })
  .refine((coupon) => !coupon.startsAt || coupon.expiresAt > coupon.startsAt, { message: 'Expiry must be after start date', path: ['expiresAt'] });
export const couponUpdateSchema = couponBaseSchema.partial().refine((input) => Object.keys(input).length > 0, 'Provide at least one value to update');
