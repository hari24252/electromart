import { z } from 'zod';

const notificationsSchema = z.object({
  newOrders: z.boolean(),
  lowStock: z.boolean(),
  newUsers: z.boolean(),
  reviews: z.boolean(),
});

export const storeSettingsSchema = z.object({
  storeName: z.string().trim().min(2).max(100),
  supportEmail: z.string().trim().email(),
  supportPhone: z.string().trim().min(7).max(30),
  lowStockThreshold: z.coerce.number().int().min(0).max(10_000),
  freeShippingMin: z.coerce.number().min(0).max(1_000_000),
  notifications: notificationsSchema,
});
