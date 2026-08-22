import { asyncHandler } from '../../utils/asyncHandler.js';
import { success } from '../../utils/apiResponse.js';
import { getAdminId } from '../shared/requireAuth.js';
import { adminSettingsService } from './adminSettings.service.js';

export const adminSettingsController = {
  read: asyncHandler(async (_req, res) => success(res, await adminSettingsService.read())),
  update: asyncHandler(async (req, res) => success(res, await adminSettingsService.update(req.body, getAdminId(req)), 'Store settings updated')),
};
