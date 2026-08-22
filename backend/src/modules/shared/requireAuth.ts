import type { Request } from 'express';
import type { AuthenticatedAdmin } from '../../types/auth.js';
import { unauthorized } from '../../utils/apiError.js';

export function getUserId(req: Request): string {
  if (!req.user) throw unauthorized();
  return req.user.id;
}

export function getAdminId(req: Request): string {
  if (!req.admin) throw unauthorized('Administrator authentication is required');
  return req.admin.id;
}

export function getAdmin(req: Request): AuthenticatedAdmin {
  if (!req.admin) throw unauthorized('Administrator authentication is required');
  return req.admin;
}
