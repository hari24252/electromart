import { z } from 'zod';

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export function parsePagination(query: unknown): { page: number; limit: number; skip: number } {
  const { page, limit } = paginationQuery.parse(query);
  return { page, limit, skip: (page - 1) * limit };
}
