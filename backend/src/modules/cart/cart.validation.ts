import { z } from 'zod';

const productId = z.string().regex(/^[a-f\d]{24}$/i);
export const addCartItemSchema = z.object({ productId, quantity: z.coerce.number().int().min(1).max(99).default(1) });
export const updateCartItemSchema = z.object({ productId, quantity: z.coerce.number().int().min(1).max(99) });
