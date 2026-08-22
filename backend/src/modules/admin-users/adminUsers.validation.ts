import { z } from 'zod';

export const userStatusSchema = z.object({ isActive: z.boolean() });
export const usersListQuerySchema = z.object({
  search: z.string().trim().min(1).max(100).optional(),
  verified: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
