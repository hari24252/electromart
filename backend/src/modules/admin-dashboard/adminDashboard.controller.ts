import { asyncHandler } from '../../utils/asyncHandler.js';
import { success } from '../../utils/apiResponse.js';
import { adminDashboardService } from './adminDashboard.service.js';

export const adminDashboardController = {
  stats: asyncHandler(async (_req, res) => success(res, await adminDashboardService.stats())),
  revenueChart: asyncHandler(async (req, res) => { const query = req.validatedQuery as { period: 'day' | 'week' | 'month'; from?: Date; to?: Date }; return success(res, await adminDashboardService.revenueChart(query.period, query.from, query.to)); }),
  topProducts: asyncHandler(async (req, res) => success(res, await adminDashboardService.topProducts(Number(req.validatedQuery?.limit)))),
  lowStock: asyncHandler(async (req, res) => success(res, await adminDashboardService.lowStock(Number(req.validatedQuery?.threshold)))),
  recentOrders: asyncHandler(async (req, res) => success(res, await adminDashboardService.recentOrders(Number(req.validatedQuery?.limit)))),
};
