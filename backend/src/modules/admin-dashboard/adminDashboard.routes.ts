import { Router } from 'express';
import { authenticateAdmin } from '../../middlewares/authenticateAdmin.js';
import { validateQuery } from '../../middlewares/validateRequest.js';
import { adminDashboardController } from './adminDashboard.controller.js';
import { dashboardLimitQuerySchema, lowStockQuerySchema, revenueChartQuerySchema } from './adminDashboard.validation.js';

export const adminDashboardRouter = Router();
adminDashboardRouter.use(authenticateAdmin);
adminDashboardRouter.get('/stats', adminDashboardController.stats);
adminDashboardRouter.get('/revenue-chart', validateQuery(revenueChartQuerySchema), adminDashboardController.revenueChart);
adminDashboardRouter.get('/top-products', validateQuery(dashboardLimitQuerySchema), adminDashboardController.topProducts);
adminDashboardRouter.get('/low-stock', validateQuery(lowStockQuerySchema), adminDashboardController.lowStock);
adminDashboardRouter.get('/recent-orders', validateQuery(dashboardLimitQuerySchema), adminDashboardController.recentOrders);
