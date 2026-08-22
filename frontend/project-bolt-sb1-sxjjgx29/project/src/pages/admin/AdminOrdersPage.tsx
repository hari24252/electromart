import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Search, ShoppingBag } from 'lucide-react';
import { Select } from '@/components/ui/Input';
import { Table, THead, TH, TBody, TR, TD } from '@/components/ui/Table';
import { OrderStatusBadge } from '@/components/admin/StatusBadge';
import { Pagination } from '@/components/ui/Pagination';
import { formatCurrency, formatDate } from '@/lib/utils';
import { api } from '@/api/services';
import { getApiErrorMessage } from '@/api/client';
import { useToast } from '@/components/ui/Toast';
import type { Order, OrderStatus } from '@/types';

export function AdminOrdersPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    void api.orders.list({ page, limit: 20, status: statusFilter || undefined })
      .then((response) => {
        if (!mounted) return;
        setOrders(response.items);
        setTotal(response.total);
        setTotalPages(response.totalPages);
      })
      .catch((error) => mounted && toast('error', getApiErrorMessage(error), 'Could not load orders'))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [page, statusFilter, toast]);

  const visibleOrders = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return normalized ? orders.filter((order) => order.orderNumber.toLowerCase().includes(normalized)) : orders;
  }, [orders, search]);

  return (
    <div className="space-y-4">
      <div><h2 className="text-xl font-bold uppercase tracking-tight">Orders</h2><p className="text-sm text-ink-500">{total} orders</p></div>

      <div className="brutal-card bg-white p-4">
        <div className="grid md:grid-cols-3 gap-3">
          <div className="md:col-span-2 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" /><input type="search" placeholder="Filter loaded orders by order number…" value={search} onChange={(event) => setSearch(event.target.value)} className="w-full brutal-border bg-white pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:shadow-brutal" /></div>
          <Select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value as OrderStatus | ''); setPage(1); }} placeholder="All Status" options={[{ value: 'placed', label: 'Placed' }, { value: 'processing', label: 'Processing' }, { value: 'shipped', label: 'Shipped' }, { value: 'delivered', label: 'Delivered' }, { value: 'cancelled', label: 'Cancelled' }]} />
        </div>
      </div>

      {loading ? <div className="brutal-card bg-white p-12 text-center text-sm font-bold uppercase text-ink-500">Loading orders…</div> : visibleOrders.length === 0 ? (
        <div className="brutal-card bg-white p-12 text-center"><ShoppingBag className="w-12 h-12 mx-auto text-ink-300 mb-3" /><p className="text-sm font-bold uppercase text-ink-500">No orders found</p></div>
      ) : (
        <Table><THead><TH>Order #</TH><TH>Customer</TH><TH>Items</TH><TH>Total</TH><TH>Status</TH><TH>Date</TH><TH>Actions</TH></THead><TBody>{visibleOrders.map((order) => <TR key={order._id}><TD><Link to={`/admin/orders/${order._id}`} className="font-bold text-primary-600">{order.orderNumber}</Link></TD><TD>{order.address.fullName}</TD><TD><span className="text-xs">{order.items.length} item(s)</span></TD><TD><span className="font-bold">{formatCurrency(order.grandTotal)}</span></TD><TD><OrderStatusBadge status={order.status} /></TD><TD><span className="text-xs text-ink-500">{formatDate(order.createdAt)}</span></TD><TD><Link to={`/admin/orders/${order._id}`} className="brutal-border bg-white p-1.5 hover:bg-paper-100" title="View order"><Eye className="w-3.5 h-3.5" /></Link></TD></TR>)}</TBody></Table>
      )}

      {totalPages > 1 && <div className="flex justify-center"><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></div>}
    </div>
  );
}
