export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(statusCode: number, message: string, code = 'REQUEST_ERROR', details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (message: string, code?: string, details?: unknown): ApiError => new ApiError(400, message, code, details);
export const unauthorized = (message = 'Authentication is required'): ApiError => new ApiError(401, message, 'UNAUTHORIZED');
export const forbidden = (message = 'You do not have permission to perform this action'): ApiError => new ApiError(403, message, 'FORBIDDEN');
export const notFound = (resource = 'Resource'): ApiError => new ApiError(404, `${resource} was not found`, 'NOT_FOUND');
export const conflict = (message: string, code = 'CONFLICT'): ApiError => new ApiError(409, message, code);
