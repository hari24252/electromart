import type { Response } from 'express';

export function success<T>(res: Response, data: T, message = 'OK', statusCode = 200): Response {
  return res.status(statusCode).json({ success: true, message, data });
}

export function paginated<T>(res: Response, items: T[], page: number, limit: number, total: number): Response {
  return success(res, {
    items,
    pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
  });
}
