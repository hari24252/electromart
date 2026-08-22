import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Ticket, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Table, THead, TH, TBody, TR, TD } from '@/components/ui/Table';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Switch } from '@/components/ui/Switch';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';
import { api } from '@/api/services';
import { getApiErrorMessage } from '@/api/client';
import type { Coupon, CouponDraft } from '@/types';

export function AdminCouponsPage() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: '', type: 'percentage' as 'percentage' | 'flat', value: '', minCartValue: '',
    maxDiscount: '', startDate: '', endDate: '', usageLimit: '', isActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const resetForm = () => setForm({ code: '', type: 'percentage', value: '', minCartValue: '', maxDiscount: '', startDate: '', endDate: '', usageLimit: '', isActive: true });
  const loadCoupons = async () => {
    setLoading(true);
    try {
      setCoupons(await api.coupons.list());
    } catch (error) {
      toast('error', getApiErrorMessage(error), 'Could not load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCoupons();
  // The initial request must run once; retries occur through any mutation.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = coupons.filter((c) => c.code.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = async () => {
    if (!form.code.trim() || !form.value || !form.endDate) {
      toast('error', 'Code, value, and an expiry date are required.', 'Check coupon details');
      return;
    }
    const draft: CouponDraft = {
      code: form.code.trim(),
      type: form.type,
      value: Number(form.value),
      minCartValue: Number(form.minCartValue || 0),
      ...(form.maxDiscount ? { maxDiscount: Number(form.maxDiscount) } : {}),
      ...(form.usageLimit ? { usageLimit: Number(form.usageLimit) } : {}),
      ...(form.startDate ? { startsAt: new Date(form.startDate).toISOString() } : {}),
      expiresAt: new Date(form.endDate).toISOString(),
      isActive: form.isActive,
    };
    setSaving(true);
    try {
      if (editingId) await api.coupons.update(editingId, draft);
      else await api.coupons.create(draft);
      await loadCoupons();
      toast('success', editingId ? 'Coupon updated' : 'Coupon created');
      setShowForm(false);
      setEditingId(null);
      resetForm();
    } catch (error) {
      toast('error', getApiErrorMessage(error), editingId ? 'Could not update coupon' : 'Could not create coupon');
    } finally {
      setSaving(false);
    }
  };

  const editCoupon = (coupon: Coupon) => {
    setEditingId(coupon._id);
    setForm({
      code: coupon.code, type: coupon.type, value: String(coupon.value), minCartValue: String(coupon.minCartValue),
      maxDiscount: coupon.maxDiscount == null ? '' : String(coupon.maxDiscount),
      startDate: coupon.startDate ? coupon.startDate.slice(0, 10) : '', endDate: coupon.endDate.slice(0, 10),
      usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : '', isActive: coupon.isActive,
    });
    setShowForm(true);
  };

  const deactivateCoupon = async () => {
    if (!deleteId) return;
    try {
      await api.coupons.remove(deleteId);
      await loadCoupons();
      toast('success', 'Coupon deactivated');
      setDeleteId(null);
    } catch (error) {
      toast('error', getApiErrorMessage(error), 'Could not deactivate coupon');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tight">Coupons</h2>
          <p className="text-sm text-ink-500">{coupons.length} coupons</p>
        </div>
        <Button onClick={() => { setEditingId(null); resetForm(); setShowForm(true); }}>
          <Plus className="w-4 h-4" /> Add Coupon
        </Button>
      </div>

      {/* Search */}
      <div className="brutal-card bg-white p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            placeholder="Search coupon codes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full brutal-border bg-white pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:shadow-brutal"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? <div className="brutal-card bg-white p-12 text-center text-sm font-bold uppercase text-ink-500">Loading coupons…</div> : <Table>
        <THead>
          <TH>Code</TH>
          <TH>Type</TH>
          <TH>Value</TH>
          <TH>Min Cart</TH>
          <TH>Usage</TH>
          <TH>Valid Until</TH>
          <TH>Status</TH>
          <TH>Actions</TH>
        </THead>
        <TBody>
          {filtered.map((c) => (
            <TR key={c._id}>
              <TD><span className="font-bold font-mono text-sm">{c.code}</span></TD>
              <TD><span className="text-xs uppercase">{c.type}</span></TD>
              <TD><span className="font-bold">{c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`}</span></TD>
              <TD><span className="text-sm">₹{c.minCartValue}</span></TD>
              <TD>
                <div className="text-xs">
                  <span className="font-bold">{c.usedCount}</span> / {c.usageLimit}
                </div>
              </TD>
              <TD><span className="text-xs text-ink-500">{formatDate(c.endDate)}</span></TD>
              <TD>
                {c.isActive ? <Badge variant="success" size="sm">Active</Badge> : <Badge variant="danger" size="sm">Inactive</Badge>}
              </TD>
              <TD>
                <div className="flex gap-1">
                  <button onClick={() => editCoupon(c)} className="brutal-border bg-white p-1.5 hover:bg-primary-100">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteId(c._id)} className="brutal-border bg-white p-1.5 hover:bg-danger-500 hover:text-white">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>}

      {/* Form modal */}
      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditingId(null); resetForm(); }} title={editingId ? 'Edit Coupon' : 'Add Coupon'} size="md">
        <div className="p-6 space-y-4">
          <Input label="Coupon Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SUMMER25" required />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Discount Type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as 'percentage' | 'flat' })}
              options={[
                { value: 'percentage', label: 'Percentage' },
                { value: 'flat', label: 'Flat Amount' },
              ]}
            />
            <Input label={form.type === 'percentage' ? 'Percentage (%)' : 'Amount (₹)'} type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Min Cart Value (₹)" type="number" value={form.minCartValue} onChange={(e) => setForm({ ...form, minCartValue: e.target.value })} />
            <Input label="Max Discount (₹)" type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} hint="For percentage only" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Date" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            <Input label="End Date" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </div>
          <Input label="Usage Limit" type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} required />
          <Switch checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} label="Active" />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null); resetForm(); }}>Cancel</Button>
            <Button onClick={() => void handleSubmit()} loading={saving}>{editingId ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { void deactivateCoupon(); }}
        title="Deactivate Coupon?"
        message="This coupon will no longer be redeemable. Existing usage data will be preserved."
        confirmLabel="Deactivate"
      />
    </div>
  );
}
