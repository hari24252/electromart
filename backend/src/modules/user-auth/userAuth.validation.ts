import { z } from 'zod';

const contact = z.object({
  email: z.string().email().optional(),
  phone: z.string().min(7).max(20).optional(),
}).refine((value) => value.email || value.phone, { message: 'Provide an email or phone number' });

export const signupSchema = contact.extend({
  name: z.string().trim().min(2).max(100),
  password: z.string().min(10).max(128),
});

export const loginSchema = z.object({ identifier: z.string().trim().min(3).max(120), password: z.string().min(1).max(128) });
export const changePasswordSchema = z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(10).max(128) });
export const updateProfileSchema = z.object({ name: z.string().trim().min(2).max(100) });
