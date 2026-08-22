import { adminDashboardRepository } from './adminDashboard.repository.js';

export const adminDashboardService = {
  stats: () => adminDashboardRepository.stats(),
  revenueChart: (period: 'day' | 'week' | 'month', from?: Date, to?: Date) => adminDashboardRepository.revenueChart(period, from, to),
  topProducts: (limit: number) => adminDashboardRepository.topProducts(Math.min(50, Math.max(1, limit))),
  lowStock: (threshold: number) => adminDashboardRepository.lowStock(Math.max(0, threshold)),
  recentOrders: (limit: number) => adminDashboardRepository.recentOrders(Math.min(100, Math.max(1, limit))),
};
