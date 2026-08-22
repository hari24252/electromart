import { useEffect, useState } from 'react';
import { Search, Users, Ban, CheckCircle, Mail, Phone } from 'lucide-react';
import { Input, Select } from '@/components/ui/Input';
import { Table, THead, TH, TBody, TR, TD } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { formatDate, cn } from '@/lib/utils';
import { api } from '@/api/services';
import { getApiErrorMessage } from '@/api/client';
import type { AdminUser } from '@/types';

export function AdminCustomersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [page, setPage] = useState(1);
  const [toggleId, setToggleId] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const limit = 10;
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    void api.admin.users.list({ search: search || undefined, verified: verifiedFilter ? verifiedFilter === 'verified' : undefined, page, limit })
      .then((response) => {
        if (!mounted) return;
        setUsers(response.items);
        setTotal(response.total);
        setTotalPages(response.totalPages);
      })
      .catch((error) => mounted && toast('error', getApiErrorMessage(error), 'Could not load customers'))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [limit, page, search, toast, verifiedFilter]);

  const toggleUserStatus = async (id: string) => {
    const user = users.find((item) => item._id === id);
    if (!user) return;
    try {
      const updated = await api.admin.users.setStatus(id, !user.isActive);
      setUsers((current) => current.map((item) => item._id === updated._id ? { ...item, ...updated } : item));
      toast('success', `${updated.name} ${updated.isActive ? 'activated' : 'deactivated'}`);
      setToggleId(null);
    } catch (error) {
      toast('error', getApiErrorMessage(error), 'Could not update customer');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold uppercase tracking-tight">Customers</h2>
        <p className="text-sm text-ink-500">{total} customers</p>
      </div>

      {/* Filters */}
      <div className="brutal-card bg-white p-4">
        <div className="grid md:grid-cols-3 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full brutal-border bg-white pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:shadow-brutal"
            />
          </div>
          <Select
            value={verifiedFilter}
            onChange={(e) => { setVerifiedFilter(e.target.value); setPage(1); }}
            placeholder="All Users"
            options={[
              { value: 'verified', label: 'Verified' },
              { value: 'unverified', label: 'Unverified' },
            ]}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="brutal-card bg-white p-12 text-center"><p className="text-sm font-bold uppercase text-ink-500">Loading customers…</p></div>
      ) : users.length === 0 ? (
        <div className="brutal-card bg-white p-12 text-center">
          <Users className="w-12 h-12 mx-auto text-ink-300 mb-3" />
          <p className="text-sm font-bold uppercase text-ink-500">No customers found</p>
        </div>
      ) : (
        <Table>
          <THead>
            <TH>Customer</TH>
            <TH>Contact</TH>
            <TH>Verified</TH>
            <TH>Orders</TH>
            <TH>Joined</TH>
            <TH>Status</TH>
            <TH>Actions</TH>
          </THead>
          <TBody>
            {users.map((u) => (
              <TR key={u._id}>
                <TD>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 brutal-border bg-ink-900 text-white flex items-center justify-center text-xs font-bold">
                      {u.name.charAt(0)}
                    </div>
                    <span className="font-semibold text-sm">{u.name}</span>
                  </div>
                </TD>
                <TD>
                  <div className="text-xs space-y-0.5">
                    {u.email && <div className="flex items-center gap-1"><Mail className="w-3 h-3 text-ink-400" /> {u.email}</div>}
                    {u.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3 text-ink-400" /> {u.phone}</div>}
                  </div>
                </TD>
                <TD>
                  {u.isVerified ? <Badge variant="success" size="sm">Verified</Badge> : <Badge variant="warning" size="sm">Unverified</Badge>}
                </TD>
                <TD><span className="text-sm font-bold">{u.orderCount ?? 0}</span></TD>
                <TD><span className="text-xs text-ink-500">{formatDate(u.createdAt)}</span></TD>
                <TD>
                  {u.isActive ? <Badge variant="success" size="sm">Active</Badge> : <Badge variant="danger" size="sm">Disabled</Badge>}
                </TD>
                <TD>
                  <button
                    onClick={() => setToggleId(u._id)}
                    className={cn('brutal-border p-1.5 transition-colors', u.isActive ? 'bg-white hover:bg-danger-500 hover:text-white' : 'bg-white hover:bg-success-500 hover:text-white')}
                    title={u.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {u.isActive ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  </button>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <ConfirmDialog
        isOpen={!!toggleId}
        onClose={() => setToggleId(null)}
        onConfirm={() => { if (toggleId) void toggleUserStatus(toggleId); }}
        title="Toggle User Status?"
        message="This will activate/deactivate the customer and revoke/restore their sessions."
        confirmLabel="Confirm"
        variant="warning"
      />
    </div>
  );
}
