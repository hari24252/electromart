import type { RequestHandler } from 'express';
import { ApiError } from '../utils/apiError.js';

export const notFoundHandler: RequestHandler = (req, _res, next) => next(new ApiError(404, `Route ${req.method} ${req.originalUrl} was not found`, 'ROUTE_NOT_FOUND'));
