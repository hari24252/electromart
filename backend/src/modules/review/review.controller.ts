import { asyncHandler } from '../../utils/asyncHandler.js';
import { success } from '../../utils/apiResponse.js';
import { getAdminId, getUserId } from '../shared/requireAuth.js';
import { reviewService } from './review.service.js';

export const reviewController = {
  list: asyncHandler(async (req, res) => success(res, await reviewService.list(req.params.productId as string))),
  create: asyncHandler(async (req, res) => success(res, await reviewService.create(getUserId(req), req.params.productId as string, req.body), 'Review created', 201)),
  update: asyncHandler(async (req, res) => success(res, await reviewService.update(getUserId(req), req.params.id as string, req.body), 'Review updated')),
  remove: asyncHandler(async (req, res) => { await reviewService.remove(req.params.id as string, req.user?.id, req.admin?.id); return success(res, null, 'Review deleted'); }),
  moderate: asyncHandler(async (req, res) => success(res, await reviewService.moderate(getAdminId(req), req.params.id as string, req.body.isApproved), 'Review moderation updated')),
};
