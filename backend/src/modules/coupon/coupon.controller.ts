import { asyncHandler } from '../../utils/asyncHandler.js';
import { success } from '../../utils/apiResponse.js';
import { getAdminId, getUserId } from '../shared/requireAuth.js';
import { couponService } from './coupon.service.js';

export const couponController = {
  apply: asyncHandler(async (req, res) => success(res, await couponService.apply(getUserId(req), req.body.code))),
  list: asyncHandler(async (_req, res) => success(res, await couponService.list())),
  create: asyncHandler(async (req, res) => success(res, await couponService.create(req.body, getAdminId(req)), 'Coupon created', 201)),
  update: asyncHandler(async (req, res) => success(res, await couponService.update(req.params.id as string, req.body, getAdminId(req)), 'Coupon updated')),
  remove: asyncHandler(async (req, res) => { await couponService.deactivate(req.params.id as string, getAdminId(req)); return success(res, null, 'Coupon deactivated'); }),
};
