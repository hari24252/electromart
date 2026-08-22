import type { RequestHandler } from 'express';
import { unauthorized } from '../utils/apiError.js';
import { verifyToken } from '../utils/tokens.js';

export const authenticateUser: RequestHandler = (req, _res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return next(unauthorized());
  try {
    const claims = verifyToken(token, 'user', 'access');
    req.user = { id: claims.sub, role: 'user', authVersion: claims.authVersion };
    return next();
  } catch (error) {
    return next(error);
  }
};
