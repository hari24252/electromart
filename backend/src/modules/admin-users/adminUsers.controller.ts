import { asyncHandler } from '../../utils/asyncHandler.js';
import { paginated, success } from '../../utils/apiResponse.js';
import { getAdminId } from '../shared/requireAuth.js';
import { adminUsersService } from './adminUsers.service.js';

export const adminUsersController = {
  list: asyncHandler(async (req, res) => { const result = await adminUsersService.list(req.validatedQuery ?? req.query); return paginated(res, result.items, result.page, result.limit, result.total); }),
  setStatus: asyncHandler(async (req, res) => success(res, await adminUsersService.setStatus(req.params.id as string, req.body.isActive, getAdminId(req)), 'User status updated')),
};
