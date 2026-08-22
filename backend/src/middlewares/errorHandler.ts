import type { ErrorRequestHandler } from 'express';
import multer from 'multer';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/apiError.js';
import { removeUploadedFiles } from './fileUpload.js';

export const errorHandler: ErrorRequestHandler = async (error: unknown, req, res, _next) => {
  let normalized: ApiError;
  if (error instanceof ApiError) normalized = error;
  else if (error instanceof multer.MulterError) normalized = new ApiError(422, error.message, 'UPLOAD_ERROR');
  else if (typeof error === 'object' && error !== null && 'name' in error && (error.name === 'CastError' || error.name === 'ValidationError')) {
    normalized = new ApiError(422, 'Database validation failed', 'DATABASE_VALIDATION_ERROR');
  } else if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
    normalized = new ApiError(409, 'A record with one of those unique values already exists', 'DUPLICATE_VALUE');
  } else normalized = new ApiError(500, 'An unexpected server error occurred', 'INTERNAL_ERROR');

  logger.error({ err: error, requestId: req.id, path: req.originalUrl, statusCode: normalized.statusCode }, 'Request failed');
  await removeUploadedFiles(req.files);
  res.status(normalized.statusCode).json({
    success: false,
    code: normalized.code,
    message: normalized.message,
    requestId: req.id,
    ...(normalized.details !== undefined ? { details: normalized.details } : {}),
    ...(env.NODE_ENV !== 'production' && normalized.statusCode === 500 && error instanceof Error ? { stack: error.stack } : {}),
  });
};
