import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingBag, Users, Package, Clock, TrendingUp, AlertTriangle, ArrowRight, ChevronRight, Sparkles } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { RevenueChart } from '@/components/admin/RevenueChart';
import { OrderStatusBadge } from '@/components/admin/StatusBadge';
import { Table, THead, TH, TBody, TR, TD } from '@/components/ui/Table';
import { ProductImagePlaceholder } from '@/components/common/ProductImagePlaceholder';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatNumber, timeAgo } from '@/lib/utils';
import { api } from '@/api/services';
import { getApiErrorMessage } from '@/api/client';
import type { DashboardStats, LowStockProduct, RecentOrder, TopProduct } from '@/types';

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    void Promise.all([
      api.admin.dashboard.stats(),
      api.admin.dashboard.topProducts(),
      api.admin.dashboard.lowStock(),
      api.admin.dashboard.recentOrders(),
    ])
      .then(([nextStats, nextTopProducts, nextLowStock, nextRecentOrders]) => {
        if (!active) return;
        setStats(nextStats);
        setTopProducts(nextTopProducts);
        setLowStock(nextLowStock);
        setRecentOrders(nextRecentOrders);
      })
      .catch((requestError) => active && setError(getApiErrorMessage(requestError, 'Dashboard data could not be loaded.')))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [attempt]);

  const statsValue = (value: number | undefined, formatter: (number: number) => string) => value === undefined ? '—' : formatter(value);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between glass-panel p-6">
        <div><h2 className="text-xl font-bold font-display text-white flex items-center gap-2">Store Performance &amp; Analytics <Sparkles className="w-5 h-5 text-amber-400" /></h2><p className="text-xs font-mono text-slate-400 mt-1">Real-time revenue monitoring and inventory status</p></div>
        <Link to="/admin/products/new" className="glass-button px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">+ Add Product</Link>
      </div>

      {error && <Alert variant="error" title="Dashboard unavailable"><p>{error}</p><Button className="mt-3" size="sm" onClick={() => setAttempt((value) => value + 1)}>Try again</Button></Alert>}
      {loading && <p className="text-sm text-slate-400">Loading dashboard data…</p>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={statsValue(stats?.totalRevenue, formatCurrency)} icon={<DollarSign className="w-5 h-5 text-emerald-400" />} color="success" />
        <StatCard label="Total Orders" value={statsValue(stats?.totalOrders, formatNumber)} icon={<ShoppingBag className="w-5 h-5 text-brand-400" />} color="primary" />
        <StatCard label="Total Users" value={statsValue(stats?.totalUsers, formatNumber)} icon={<Users className="w-5 h-5 text-indigo-400" />} color="accent" />
        <StatCard label="Total Products" value={statsValue(stats?.totalProducts, formatNumber)} icon={<Package className="w-5 h-5 text-amber-400" />} color="warning" />
      </div>

      {(stats?.pendingOrders ?? 0) > 0 && <div className="glass-panel p-4 border border-amber-500/40 bg-amber-500/10 rounded-2xl flex items-center gap-3"><Clock className="w-5 h-5 text-amber-400 flex-shrink-0" /><p className="text-xs font-mono text-amber-300 flex-1"><span className="font-bold text-white">{stats!.pendingOrders} orders</span> are currently pending fulfillment.</p><Link to="/admin/orders?status=placed" className="text-xs font-mono font-bold text-amber-400 hover:text-white flex items-center gap-1">Process Orders <ArrowRight className="w-3.5 h-3.5" /></Link></div>}

      <div className="glass-panel p-6"><RevenueChart /></div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3"><h3 className="text-sm font-bold font-display text-white">Top Performing Products</h3><span className="text-[10px] font-mono text-slate-400 uppercase">Best sellers</span></div>
          {topProducts.length ? <div className="space-y-3">{topProducts.slice(0, 5).map((product, index) => <div key={product.productId} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800"><span className="w-6 h-6 rounded-lg bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center text-xs font-bold flex-shrink-0 font-mono">{index + 1}</span><ProductImagePlaceholder src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-lg border border-slate-800" /><div className="flex-1 min-w-0"><p className="text-xs font-bold text-white line-clamp-1">{product.name}</p><p className="text-[11px] font-mono text-slate-400">{product.quantitySold} units sold · {formatCurrency(product.revenue)}</p></div><TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0" /></div>)}</div> : !loading && !error && <p className="text-sm text-slate-400">No completed sales yet.</p>}
        </div>

        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3"><h3 className="text-sm font-bold font-display text-white flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-amber-400" /> Low Stock Alerts</h3><span className="text-[10px] font-mono text-amber-400 uppercase">Restock required</span></div>
          {lowStock.length ? <div className="space-y-3">{lowStock.slice(0, 5).map((product) => <div key={product._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800"><ProductImagePlaceholder src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-lg border border-slate-800" /><div className="flex-1 min-w-0"><p className="text-xs font-bold text-white line-clamp-1">{product.name}</p><p className="text-[11px] font-mono text-slate-400">SKU: {product.sku}</p></div><span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold ${product.stock === 0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>{product.stock === 0 ? 'Out of stock' : `${product.stock} left`}</span></div>)}</div> : !loading && !error && <p className="text-sm text-slate-400">No low-stock products.</p>}
        </div>
      </div>

      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3"><h3 className="text-sm font-bold font-display text-white">Recent Customer Orders</h3><Link to="/admin/orders" className="text-xs font-mono text-brand-400 hover:text-white flex items-center gap-1">View All Orders <ChevronRight className="w-3.5 h-3.5" /></Link></div>
        {recentOrders.length ? <div className="overflow-x-auto"><Table><THead><TH>Order #</TH><TH>Customer</TH><TH>Total</TH><TH>Status</TH><TH>Date</TH></THead><TBody>{recentOrders.map((order) => <TR key={order._id}><TD><span className="font-mono text-xs font-bold text-white">{order.orderNumber}</span></TD><TD><span className="text-xs text-slate-300">{order.customerName}</span></TD><TD><span className="font-mono text-xs font-bold text-emerald-400">{formatCurrency(order.grandTotal)}</span></TD><TD><OrderStatusBadge status={order.status} /></TD><TD><span className="text-xs font-mono text-slate-400">{timeAgo(order.createdAt)}</span></TD></TR>)}</TBody></Table></div> : !loading && !error && <p className="text-sm text-slate-400">No orders have been placed yet.</p>}
      </div>
    </div>
  );
}
