import type { RequestHandler } from 'express';
import { unauthorized } from '../utils/apiError.js';
import { verifyToken } from '../utils/tokens.js';

export const authenticateAdmin: RequestHandler = (req, _res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return next(unauthorized());
  try {
    const claims = verifyToken(token, 'admin', 'access');
    if (!claims.adminRole) return next(unauthorized('Invalid administrator token'));
    req.admin = { id: claims.sub, role: claims.adminRole, authVersion: claims.authVersion };
    return next();
  } catch (error) {
    return next(error);
  }
};
