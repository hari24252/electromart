import type { AuthenticatedAdmin, AuthenticatedUser } from './auth.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      admin?: AuthenticatedAdmin;
      validatedQuery?: Record<string, unknown>;
    }
  }
}

export {};
