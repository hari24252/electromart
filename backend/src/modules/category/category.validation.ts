import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  parentCategory: z.string().regex(/^[a-f\d]{24}$/i).nullable().optional(),
  image: z.string().url().or(z.string().startsWith('/uploads/')).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
});
export const updateCategorySchema = createCategorySchema.partial().refine((input) => Object.keys(input).length > 0, 'Provide at least one value to update');
