import { z } from 'zod';

export const revenueChartQuerySchema = z.object({
  period: z.enum(['day', 'week', 'month']).default('day'),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
}).refine((query) => !query.from || !query.to || query.from <= query.to, { message: 'from cannot be after to', path: ['from'] });

export const dashboardLimitQuerySchema = z.object({ limit: z.coerce.number().int().min(1).max(100).default(10) });
export const lowStockQuerySchema = z.object({ threshold: z.coerce.number().int().min(0).max(100_000).default(5) });
