import mongoose from 'mongoose';
import { badRequest } from './apiError.js';

export function ensureObjectId(id: string, field = 'id'): mongoose.Types.ObjectId {
  if (!mongoose.isObjectIdOrHexString(id)) throw badRequest(`Invalid ${field}`, 'INVALID_ID');
  return new mongoose.Types.ObjectId(id);
}
