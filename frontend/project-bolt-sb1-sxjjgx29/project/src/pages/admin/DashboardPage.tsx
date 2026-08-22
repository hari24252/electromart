import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign, ShoppingBag, Users, Package, Clock, TrendingUp, AlertTriangle,
  ArrowRight, ChevronRight, Sparkles
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { RevenueChart } from '@/components/admin/RevenueChart';
import { OrderStatusBadge } from '@/components/admin/StatusBadge';
import { Table, THead, TH, TBody, TR, TD } from '@/components/ui/Table';
import { ProductImagePlaceholder } from '@/components/common/ProductImagePlaceholder';
import { mockDashboardStats, mockTopProducts, mockLowStock, mockRecentOrders } from '@/lib/mockData';
import { formatCurrency, formatNumber, timeAgo } from '@/lib/utils';
import { api } from '@/api/services';
import type { DashboardStats, LowStockProduct, RecentOrder, TopProduct } from '@/types';

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(mockDashboardStats);
  const [topProducts, setTopProducts] = useState<TopProduct[]>(mockTopProducts);
  const [lowStock, setLowStock] = useState<LowStockProduct[]>(mockLowStock);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>(mockRecentOrders);

  useEffect(() => {
    void Promise.all([
      api.admin.dashboard.stats(),
      api.admin.dashboard.topProducts(),
      api.admin.dashboard.lowStock(),
      api.admin.dashboard.recentOrders(),
    ])
      .then(([nextStats, nextTopProducts, nextLowStock, nextRecentOrders]) => {
        if (nextStats) setStats(nextStats);
        if (nextTopProducts?.length) setTopProducts(nextTopProducts);
        if (nextLowStock?.length) setLowStock(nextLowStock);
        if (nextRecentOrders?.length) setRecentOrders(nextRecentOrders);
      })
      .catch(() => undefined);
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between glass-panel p-6">
        <div>
          <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
            Store Performance & Analytics <Sparkles className="w-5 h-5 text-amber-400" />
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">Real-time revenue monitoring and inventory status</p>
        </div>
        <Link
          to="/admin/products/new"
          className="glass-button px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
        >
          + Add Product
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon={<DollarSign className="w-5 h-5 text-emerald-400" />} change={{ value: '12.5%', positive: true }} color="success" />
        <StatCard label="Total Orders" value={formatNumber(stats.totalOrders)} icon={<ShoppingBag className="w-5 h-5 text-brand-400" />} change={{ value: '8.2%', positive: true }} color="primary" />
        <StatCard label="Total Users" value={formatNumber(stats.totalUsers)} icon={<Users className="w-5 h-5 text-indigo-400" />} change={{ value: '5.1%', positive: true }} color="accent" />
        <StatCard label="Total Products" value={formatNumber(stats.totalProducts)} icon={<Package className="w-5 h-5 text-amber-400" />} color="warning" />
      </div>

      {/* Pending orders alert */}
      {stats.pendingOrders > 0 && (
        <div className="glass-panel p-4 border border-amber-500/40 bg-amber-500/10 rounded-2xl flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <p className="text-xs font-mono text-amber-300 flex-1">
            <span className="font-bold text-white">{stats.pendingOrders} orders</span> are currently pending fulfillment.
          </p>
          <Link to="/admin/orders?status=placed" className="text-xs font-mono font-bold text-amber-400 hover:text-white flex items-center gap-1">
            Process Orders <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Revenue chart */}
      <div className="glass-panel p-6">
        <RevenueChart />
      </div>

      {/* Two column section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top products */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold font-display text-white">Top Performing Products</h3>
            <span className="text-[10px] font-mono text-slate-400 uppercase">Best sellers</span>
          </div>
          <div className="space-y-3">
            {topProducts.slice(0, 5).map((p, i) => (
              <div key={p.productId} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="w-6 h-6 rounded-lg bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center text-xs font-bold flex-shrink-0 font-mono">
                  {i + 1}
                </span>
                <ProductImagePlaceholder src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg border border-slate-800" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white line-clamp-1">{p.name}</p>
                  <p className="text-[11px] font-mono text-slate-400">{p.quantitySold} units sold · {formatCurrency(p.revenue)}</p>
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Low stock */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold font-display text-white flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Low Stock Alerts
            </h3>
            <span className="text-[10px] font-mono text-amber-400 uppercase">Restock required</span>
          </div>
          <div className="space-y-3">
            {lowStock.slice(0, 5).map((p) => (
              <div key={p._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <ProductImagePlaceholder src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg border border-slate-800" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white line-clamp-1">{p.name}</p>
                  <p className="text-[11px] font-mono text-slate-400">SKU: {p.sku}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold ${p.stock === 0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                    {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold font-display text-white">Recent Customer Orders</h3>
          <Link to="/admin/orders" className="text-xs font-mono text-brand-400 hover:text-white flex items-center gap-1">
            View All Orders <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <THead>
              <TH>Order #</TH>
              <TH>Customer</TH>
              <TH>Total</TH>
              <TH>Status</TH>
              <TH>Date</TH>
            </THead>
            <TBody>
              {recentOrders.map((o) => (
                <TR key={o._id}>
                  <TD><span className="font-mono text-xs font-bold text-white">{o.orderNumber}</span></TD>
                  <TD><span className="text-xs text-slate-300">{o.customerName}</span></TD>
                  <TD><span className="font-mono text-xs font-bold text-emerald-400">{formatCurrency(o.grandTotal)}</span></TD>
                  <TD><OrderStatusBadge status={o.status} /></TD>
                  <TD><span className="text-xs font-mono text-slate-400">{timeAgo(o.createdAt)}</span></TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

