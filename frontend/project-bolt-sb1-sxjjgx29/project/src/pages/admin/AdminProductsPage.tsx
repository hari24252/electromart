import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, Package, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Table, THead, TH, TBody, TR, TD } from '@/components/ui/Table';
import { ProductStatusBadge } from '@/components/admin/StatusBadge';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { useDataStore } from '@/stores/dataStore';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency } from '@/lib/utils';
import { api } from '@/api/services';
import { getApiErrorMessage } from '@/api/client';
import type { Product } from '@/types';

export function AdminProductsPage() {
  const categories = useDataStore((s) => s.categories);
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [stockChange, setStockChange] = useState('');
  const [stockReason, setStockReason] = useState<'restock' | 'correction'>('restock');
  const [stockReference, setStockReference] = useState('');
  const [savingStock, setSavingStock] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshProducts = async () => {
    setLoading(true);
    try {
      const response = await api.admin.products.list({ page: 1, limit: 100 });
      setProducts(response.items);
    } catch (error) {
      toast('error', getApiErrorMessage(error), 'Could not load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshProducts();
  // Toast is stable; loading once keeps table interactions predictable.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.brand.toLowerCase().includes(search.toLowerCase()) && !p.sku.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter && p.status !== statusFilter) return false;
      const productCategoryId = typeof p.category === 'string' ? p.category : p.category._id;
      if (categoryFilter && productCategoryId !== categoryFilter) return false;
      return true;
    });
  }, [products, search, statusFilter, categoryFilter]);

  const limit = 10;
  const totalPages = Math.ceil(filtered.length / limit);
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  const archiveProduct = async () => {
    if (!deleteId) return;
    try {
      await api.admin.products.archive(deleteId);
      toast('success', 'Product archived', 'Done');
      setDeleteId(null);
      await refreshProducts();
    } catch (error) {
      toast('error', getApiErrorMessage(error), 'Could not archive product');
    }
  };

  const adjustInventory = async () => {
    if (!adjustingProduct || !Number.isInteger(Number(stockChange)) || Number(stockChange) === 0) return;
    setSavingStock(true);
    try {
      await api.admin.products.adjustStock(adjustingProduct._id, Number(stockChange), stockReason, stockReference || undefined);
      toast('success', 'Inventory updated');
      setAdjustingProduct(null);
      setStockChange('');
      setStockReference('');
      await refreshProducts();
    } catch (error) {
      toast('error', getApiErrorMessage(error), 'Could not update inventory');
    } finally {
      setSavingStock(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tight">Products</h2>
          <p className="text-sm text-ink-500">{filtered.length} products</p>
        </div>
        <Link to="/admin/products/new">
          <Button><Plus className="w-4 h-4" /> Add Product</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="brutal-card bg-white p-4">
        <div className="grid md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              placeholder="Search by name, brand, SKU..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full brutal-border bg-white pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:shadow-brutal"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            placeholder="All Status"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'draft', label: 'Draft' },
              { value: 'out-of-stock', label: 'Out of Stock' },
              { value: 'archived', label: 'Archived' },
            ]}
          />
          <Select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            placeholder="All Categories"
            options={categories.filter((c) => c.parentCategory === null).map((c) => ({ value: c._id, label: c.name }))}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="brutal-card bg-white p-12 text-center">
          <p className="text-sm font-bold uppercase text-ink-500">Loading products…</p>
        </div>
      ) : paginated.length === 0 ? (
        <div className="brutal-card bg-white p-12 text-center">
          <Package className="w-12 h-12 mx-auto text-ink-300 mb-3" />
          <p className="text-sm font-bold uppercase text-ink-500">No products found</p>
        </div>
      ) : (
        <Table>
          <THead>
            <TH>Product</TH>
            <TH>SKU</TH>
            <TH>Category</TH>
            <TH>Price</TH>
            <TH>Stock</TH>
            <TH>Status</TH>
            <TH>Actions</TH>
          </THead>
          <TBody>
            {paginated.map((p) => {
              const categoryId = typeof p.category === 'string' ? p.category : p.category._id;
              const cat = categories.find((c) => c._id === categoryId);
              return (
              <TR key={p._id}>
                <TD>
                  <div className="flex items-center gap-2">
                    <img src={p.thumbnail} alt={p.name} className="w-10 h-10 object-cover brutal-border" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold line-clamp-1">{p.name}</p>
                      <p className="text-xs text-ink-500">{p.brand}</p>
                    </div>
                  </div>
                </TD>
                <TD><span className="text-xs font-mono">{p.sku}</span></TD>
                <TD><span className="text-xs">{cat?.name ?? '—'}</span></TD>
                <TD>
                  <span className="font-bold text-sm">{formatCurrency(p.discountPrice ?? p.price)}</span>
                  {p.discountPrice && <span className="text-xs text-ink-400 line-through ml-1">{formatCurrency(p.price)}</span>}
                </TD>
                <TD>
                  <span className={`text-sm font-bold ${p.stock === 0 ? 'text-danger-600' : p.stock < 10 ? 'text-warning-600' : ''}`}>{p.stock}</span>
                </TD>
                <TD><ProductStatusBadge status={p.status} /></TD>
                <TD>
                  <div className="flex items-center gap-1">
                    <Link to={`/product/${p.slug}`} className="brutal-border bg-white p-1.5 hover:bg-paper-100" title="View">
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                    <Link to={`/admin/products/${p._id}/edit`} className="brutal-border bg-white p-1.5 hover:bg-primary-100" title="Edit">
                      <Edit className="w-3.5 h-3.5" />
                    </Link>
                    <button onClick={() => setAdjustingProduct(p)} className="brutal-border bg-white p-1.5 hover:bg-accent-300" title="Adjust inventory">
                      <Package className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleteId(p._id)} className="brutal-border bg-white p-1.5 hover:bg-danger-500 hover:text-white transition-colors" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </TD>
              </TR>
              );
            })}
          </TBody>
        </Table>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { void archiveProduct(); }}
        title="Archive Product?"
        message="This product will be archived. Historical orders will not be affected."
        confirmLabel="Archive"
      />

      <Modal isOpen={Boolean(adjustingProduct)} onClose={() => setAdjustingProduct(null)} title="Adjust Inventory" size="sm">
        <div className="p-6 space-y-4">
          <p className="text-sm text-ink-600">{adjustingProduct?.name} currently has <strong>{adjustingProduct?.stock ?? 0}</strong> units.</p>
          <Input label="Stock change" type="number" value={stockChange} onChange={(event) => setStockChange(event.target.value)} hint="Use a negative value to deduct stock." />
          <Select label="Reason" value={stockReason} onChange={(event) => setStockReason(event.target.value as 'restock' | 'correction')} options={[{ value: 'restock', label: 'Restock' }, { value: 'correction', label: 'Correction' }]} />
          <Input label="Reference (optional)" value={stockReference} onChange={(event) => setStockReference(event.target.value)} placeholder="PO number or adjustment note" />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAdjustingProduct(null)}>Cancel</Button>
            <Button onClick={adjustInventory} loading={savingStock}>Update stock</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
