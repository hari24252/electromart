import { z } from 'zod';

export const adminLoginSchema = z.object({ email: z.string().email(), password: z.string().min(1).max(128) });
export const createSubAdminSchema = z.object({ name: z.string().trim().min(2).max(100), email: z.string().email(), password: z.string().min(10).max(128) });
export const adminChangePasswordSchema = z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(10).max(128) });
