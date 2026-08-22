import { z } from 'zod';

export const reviewSchema = z.object({ rating: z.coerce.number().int().min(1).max(5), title: z.string().trim().min(2).max(140).optional(), comment: z.string().trim().min(2).max(2000) });
export const reviewUpdateSchema = reviewSchema.partial().refine((input) => Object.keys(input).length > 0, 'Provide at least one value to update');
export const moderationSchema = z.object({ isApproved: z.boolean() });
