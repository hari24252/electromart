import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { ApiError } from '../utils/apiError.js';

/** Parses request bodies before they reach controllers; all write routes use this guard. */
export const validateRequest = <T>(schema: ZodType<T>): RequestHandler => (req, _res, next) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return next(new ApiError(422, 'Request validation failed', 'VALIDATION_ERROR', parsed.error.flatten()));
  }
  req.body = parsed.data;
  return next();
};

/** Query strings are untrusted input too. Keep the parsed values separate because Express exposes req.query as a getter. */
export const validateQuery = <T extends Record<string, unknown>>(schema: ZodType<T>): RequestHandler => (req, _res, next) => {
  const parsed = schema.safeParse(req.query);
  if (!parsed.success) {
    return next(new ApiError(422, 'Query validation failed', 'QUERY_VALIDATION_ERROR', parsed.error.flatten()));
  }
  req.validatedQuery = parsed.data;
  return next();
};
