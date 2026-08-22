import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().min(1).default('mongodb://127.0.0.1:27017/electronics-commerce'),
  CLIENT_ORIGINS: z.string().default('http://localhost:5173,http://localhost:3000'),
  USER_JWT_SECRET: z.string().min(32).default('development-user-secret-must-be-at-least-32-chars'),
  ADMIN_JWT_SECRET: z.string().min(32).default('development-admin-secret-must-be-at-least-32-chars'),
  USER_REFRESH_JWT_SECRET: z.string().min(32).default('development-user-refresh-secret-min-32-chars'),
  ADMIN_REFRESH_JWT_SECRET: z.string().min(32).default('development-admin-refresh-secret-min-32-chars'),
  ACCESS_TOKEN_TTL: z.string().regex(/^\d+[smhd]$/, 'Use an integer JWT duration such as 15m or 30d').default('15m'),
  REFRESH_TOKEN_TTL: z.string().regex(/^\d+[smhd]$/, 'Use an integer JWT duration such as 15m or 30d').default('30d'),
  COOKIE_SECURE: z.enum(['true', 'false']).default('false').transform((value) => value === 'true'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default('ElectroMart <no-reply@example.com>'),
  CLOUDINARY_URL: z.string().url().optional(),
  REDIS_URL: z.string().url().optional(),
  CACHE_TTL_SECONDS: z.coerce.number().int().min(0).max(3600).default(60),
  INITIAL_ADMIN_NAME: z.string().min(2).default('Store Administrator'),
  INITIAL_ADMIN_EMAIL: z.string().email().default('hariharan64847@gmail.com'),
  INITIAL_ADMIN_PASSWORD: z.string().min(10).default('hariharan@28'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(`Invalid environment configuration: ${parsed.error.issues.map((issue) => issue.message).join(', ')}`);
}

const value = parsed.data;
const requiredProductionVariables = [
  'MONGODB_URI',
  'CLIENT_ORIGINS',
  'USER_JWT_SECRET',
  'ADMIN_JWT_SECRET',
  'USER_REFRESH_JWT_SECRET',
  'ADMIN_REFRESH_JWT_SECRET',
  'INITIAL_ADMIN_NAME',
  'INITIAL_ADMIN_EMAIL',
  'INITIAL_ADMIN_PASSWORD',
] as const;

if (value.NODE_ENV === 'production') {
  const missing = requiredProductionVariables.filter((name) => !process.env[name]?.trim());
  const placeholderSecrets = [
    value.USER_JWT_SECRET,
    value.ADMIN_JWT_SECRET,
    value.USER_REFRESH_JWT_SECRET,
    value.ADMIN_REFRESH_JWT_SECRET,
  ].some((secret) => /development-|replace-with-/i.test(secret));
  if (missing.length || placeholderSecrets || !value.COOKIE_SECURE) {
    throw new Error('Production requires explicit non-placeholder secrets, administrator credentials, CLIENT_ORIGINS, MONGODB_URI, and COOKIE_SECURE=true');
  }
}

export const env = {
  ...value,
  clientOrigins: value.CLIENT_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean),
} as const;
