import { z } from 'zod';

const phone = z.string().trim().regex(/^[0-9+\-() ]{7,20}$/);
export const addressSchema = z.object({
  label: z.string().trim().min(1).max(40).default('Home'),
  recipientName: z.string().trim().min(2).max(100),
  phone,
  line1: z.string().trim().min(2).max(150),
  line2: z.string().trim().max(150).optional(),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  postalCode: z.string().trim().min(3).max(20),
  country: z.string().trim().min(2).max(80).default('India'),
  isDefault: z.boolean().optional(),
});
export const updateAddressSchema = addressSchema.omit({ isDefault: true }).partial().refine((input) => Object.keys(input).length > 0, 'Provide at least one value to update');
