import { asyncHandler } from '../../utils/asyncHandler.js';
import { paginated, success } from '../../utils/apiResponse.js';
import { getAdminId, getUserId } from '../shared/requireAuth.js';
import { orderService } from './order.service.js';

export const orderController = {
  create: asyncHandler(async (req, res) => success(res, await orderService.create(getUserId(req), req.body.addressId, req.body.couponCode), 'Order placed', 201)),
  myOrders: asyncHandler(async (req, res) => { const query = req.validatedQuery ?? req.query; const page = Number(query.page); const limit = Number(query.limit); const result = await orderService.myOrders(getUserId(req), page, limit); return paginated(res, result.items, page, limit, result.total); }),
  myOrder: asyncHandler(async (req, res) => success(res, await orderService.myOrder(getUserId(req), req.params.id as string))),
  cancel: asyncHandler(async (req, res) => success(res, await orderService.cancel(getUserId(req), req.params.id as string, req.body.note), 'Order cancelled')),
  listAll: asyncHandler(async (req, res) => { const result = await orderService.listAll(req.validatedQuery ?? req.query); return paginated(res, result.items, result.page, result.limit, result.total); }),
  detail: asyncHandler(async (req, res) => success(res, await orderService.detail(req.params.id as string))),
  updateStatus: asyncHandler(async (req, res) => success(res, await orderService.updateStatus(req.params.id as string, req.body.status, req.body.note, getAdminId(req)), 'Order status updated')),
};
