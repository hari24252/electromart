import { z } from 'zod';

export const createOrderSchema = z.object({
  addressId: z.string().regex(/^[a-f\d]{24}$/i),
  couponCode: z.string().trim().min(2).max(50).optional(),
});
export const updateOrderStatusSchema = z.object({ status: z.enum(['processing', 'shipped', 'delivered']), note: z.string().trim().max(500).optional() });
export const cancelOrderSchema = z.object({ note: z.string().trim().max(500).optional() });

const pagination = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
};
export const myOrdersQuerySchema = z.object(pagination);
export const adminOrdersQuerySchema = z.object({
  ...pagination,
  status: z.enum(['placed', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
}).refine((query) => !query.from || !query.to || query.from <= query.to, { message: 'from cannot be after to', path: ['from'] });
