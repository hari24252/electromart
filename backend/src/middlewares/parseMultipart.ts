import type { RequestHandler } from 'express';
import { badRequest } from '../utils/apiError.js';

const jsonFields = ['subCategories', 'specifications', 'whatsInTheBox', 'warranty'] as const;

/** Multer yields text fields as strings. Decode only the known JSON fields before Zod validates them. */
export const parseProductMultipart: RequestHandler = (req, _res, next) => {
  try {
    for (const field of jsonFields) {
      const value = req.body[field];
      if (typeof value === 'string' && value.trim().startsWith('[') || typeof value === 'string' && value.trim().startsWith('{')) {
        req.body[field] = JSON.parse(value);
      }
    }
    return next();
  } catch {
    return next(badRequest('One of the product JSON fields is malformed', 'INVALID_MULTIPART_JSON'));
  }
};
