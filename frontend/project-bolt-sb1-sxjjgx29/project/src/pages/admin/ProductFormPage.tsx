import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, Plus, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { ImageUploadPreview } from '@/components/admin/ImageUploadPreview';
import { useDataStore } from '@/stores/dataStore';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/api/services';
import { getApiErrorMessage } from '@/api/client';
import type { Product, ProductDraft, ProductStatus, Specification } from '@/types';

type EditorForm = {
  name: string;
  brand: string;
  sku: string;
  category: string;
  price: string;
  discountPrice: string;
  stock: string;
  shortDescription: string;
  longDescription: string;
  status: Exclude<ProductStatus, 'archived'>;
  isFeatured: boolean;
  warrantyDuration: string;
  warrantyType: string;
};

const blankForm: EditorForm = {
  name: '', brand: '', sku: '', category: '', price: '', discountPrice: '', stock: '0',
  shortDescription: '', longDescription: '', status: 'draft', isFeatured: false,
  warrantyDuration: '1 Year', warrantyType: 'Manufacturer Warranty',
};

function formFromProduct(product: Product): EditorForm {
  return {
    name: product.name,
    brand: product.brand,
    sku: product.sku,
    category: typeof product.category === 'string' ? product.category : product.category._id,
    price: String(product.price),
    discountPrice: product.discountPrice == null ? '' : String(product.discountPrice),
    stock: String(product.stock),
    shortDescription: product.shortDescription,
    longDescription: product.longDescription,
    status: product.status === 'archived' ? 'draft' : product.status,
    isFeatured: product.isFeatured,
    warrantyDuration: product.warranty.duration,
    warrantyType: product.warranty.type,
  };
}

export function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const categories = useDataStore((state) => state.categories);
  const loadCatalogue = useDataStore((state) => state.loadCatalogue);
  const { toast } = useToast();
  const editing = Boolean(id && id !== 'new');

  const [form, setForm] = useState<EditorForm>(blankForm);
  const [product, setProduct] = useState<Product | null>(null);
  const [specs, setSpecs] = useState<Specification[]>([]);
  const [boxItems, setBoxItems] = useState<string[]>([]);
  const [newSpec, setNewSpec] = useState<Specification>({ group: '', key: '', value: '' });
  const [newBoxItem, setNewBoxItem] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing || !id) return;
    let mounted = true;
    setLoading(true);
    void api.admin.products.list({ page: 1, limit: 100 })
      .then(({ items }) => {
        const found = items.find((item) => item._id === id);
        if (!found) throw new Error('Product not found');
        if (!mounted) return;
        setProduct(found);
        setForm(formFromProduct(found));
        setSpecs(found.specifications);
        setBoxItems(found.whatsInTheBox);
      })
      .catch((error) => {
        if (mounted) {
          toast('error', getApiErrorMessage(error, 'The product could not be loaded.'), 'Unable to open product');
          navigate('/admin/products', { replace: true });
        }
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [editing, id, navigate, toast]);

  const topCategories = categories.filter((category) => category.parentCategory === null);

  const addSpec = () => {
    if (!newSpec.group.trim() || !newSpec.key.trim() || !newSpec.value.trim()) return;
    setSpecs((current) => [...current, { group: newSpec.group.trim(), key: newSpec.key.trim(), value: newSpec.value.trim() }]);
    setNewSpec({ group: '', key: '', value: '' });
  };

  const addBoxItem = () => {
    if (!newBoxItem.trim()) return;
    setBoxItems((current) => [...current, newBoxItem.trim()]);
    setNewBoxItem('');
  };

  const handleFiles = (selected: File[]) => {
    if (selected.some((file) => file.size > 5 * 1024 * 1024)) {
      toast('error', 'Each image must be 5 MB or smaller.', 'Image too large');
      return;
    }
    setFiles(selected);
  };

  const makeDraft = (): ProductDraft => ({
    name: form.name.trim(), brand: form.brand.trim(), sku: form.sku.trim(), category: form.category,
    subCategories: [], price: Number(form.price), ...(form.discountPrice ? { discountPrice: Number(form.discountPrice) } : {}),
    stock: Number(form.stock), shortDescription: form.shortDescription.trim(), longDescription: form.longDescription.trim(),
    specifications: specs, whatsInTheBox: boxItems,
    warranty: { duration: form.warrantyDuration.trim(), type: form.warrantyType.trim() },
    status: form.status, isFeatured: form.isFeatured,
  });

  const handleSave = async () => {
    const draft = makeDraft();
    if (!draft.name || !draft.brand || !draft.sku || !draft.category || !draft.shortDescription || !draft.longDescription || !Number.isFinite(draft.price) || draft.price < 0 || !Number.isInteger(draft.stock) || draft.stock < 0) {
      toast('error', 'Complete all required fields with valid pricing and stock.', 'Check product details');
      return;
    }
    if (draft.discountPrice !== undefined && draft.discountPrice > draft.price) {
      toast('error', 'The discount price cannot exceed the list price.', 'Check pricing');
      return;
    }

    setSaving(true);
    try {
      if (editing && id && product) {
        const { stock, status, ...editable } = draft;
        const updateDraft = { ...editable, discountPrice: form.discountPrice ? draft.discountPrice : null };
        const updated = await api.admin.products.update(id, updateDraft, files);
        const stockChange = stock - product.stock;
        if (stockChange !== 0) await api.admin.products.adjustStock(updated._id, stockChange, 'correction', 'Updated from product editor');
        if (status !== product.status) await api.admin.products.setStatus(updated._id, status);
        toast('success', 'Product changes are now live.', 'Product updated');
      } else {
        await api.admin.products.create(draft, files);
        toast('success', 'Product created and added to inventory.', 'Product created');
      }
      await loadCatalogue();
      navigate('/admin/products');
    } catch (error) {
      toast('error', getApiErrorMessage(error), editing ? 'Could not update product' : 'Could not create product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-sm font-bold uppercase text-ink-400">Loading product…</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/products')} className="brutal-border bg-white p-2 hover:bg-paper-100" aria-label="Back to products"><ArrowLeft className="w-5 h-5" /></button>
          <div><h2 className="text-xl font-bold uppercase tracking-tight">{editing ? 'Edit Product' : 'New Product'}</h2><p className="text-xs text-ink-500">Catalogue data is saved directly to the API.</p></div>
        </div>
        <Button onClick={() => void handleSave()} loading={saving}><Save className="w-4 h-4" /> Save Product</Button>
      </div>

      <section className="brutal-card bg-white p-6">
        <h3 className="font-bold text-sm uppercase tracking-wide mb-4 pb-3 border-b-2 border-ink-100">Basic information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Product Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          <Input label="Brand" value={form.brand} onChange={(event) => setForm({ ...form, brand: event.target.value })} required />
          <Input label="SKU" value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })} required />
          <Select label="Category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Select category" options={topCategories.map((category) => ({ value: category._id, label: category.name }))} />
        </div>
      </section>

      <section className="brutal-card bg-white p-6">
        <h3 className="font-bold text-sm uppercase tracking-wide mb-4 pb-3 border-b-2 border-ink-100">Pricing & inventory</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <Input label="Price (₹)" type="number" min="0" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required />
          <Input label="Discount Price (₹)" type="number" min="0" value={form.discountPrice} onChange={(event) => setForm({ ...form, discountPrice: event.target.value })} hint="Leave empty when there is no sale price." />
          <Input label="Stock" type="number" min="0" step="1" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} required />
        </div>
      </section>

      <section className="brutal-card bg-white p-6">
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b-2 border-ink-100">
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wide">Product images</h3>
            <p className="text-xs text-ink-500 mt-1">Upload clear product photos. Images are permanently stored and will load consistently across all devices.</p>
          </div>
          <ImageIcon className="w-5 h-5 text-primary-600" />
        </div>
        <ImageUploadPreview
          existingImages={product?.images ?? []}
          productName={form.name || 'Product'}
          maxImages={8}
          onFilesChange={handleFiles}
        />
      </section>

      <section className="brutal-card bg-white p-6 space-y-4"><h3 className="font-bold text-sm uppercase tracking-wide pb-3 border-b-2 border-ink-100">Descriptions</h3><Textarea label="Short Description" value={form.shortDescription} onChange={(event) => setForm({ ...form, shortDescription: event.target.value })} rows={2} placeholder="The clear, card-friendly product summary." /><Textarea label="Long Description (HTML supported)" value={form.longDescription} onChange={(event) => setForm({ ...form, longDescription: event.target.value })} rows={6} placeholder="Full product detail content." /></section>

      <section className="brutal-card bg-white p-6">
        <h3 className="font-bold text-sm uppercase tracking-wide mb-4 pb-3 border-b-2 border-ink-100">Specifications</h3>
        <div className="space-y-2 mb-4">{specs.map((spec, index) => <div key={`${spec.group}-${spec.key}-${index}`} className="flex items-center gap-2 brutal-border bg-paper-100 p-2"><span className="text-xs font-bold bg-ink-900 text-white px-2 py-0.5">{spec.group}</span><span className="text-sm font-semibold">{spec.key}:</span><span className="text-sm text-ink-600 flex-1">{spec.value}</span><button onClick={() => setSpecs((current) => current.filter((_, specIndex) => specIndex !== index))} className="brutal-border bg-white p-1 hover:bg-danger-500 hover:text-white" aria-label={`Remove ${spec.key}`}><X className="w-3 h-3" /></button></div>)}</div>
        <div className="grid md:grid-cols-3 gap-2"><input placeholder="Group (Display)" value={newSpec.group} onChange={(event) => setNewSpec({ ...newSpec, group: event.target.value })} className="brutal-input" /><input placeholder="Key (Screen size)" value={newSpec.key} onChange={(event) => setNewSpec({ ...newSpec, key: event.target.value })} className="brutal-input" /><div className="flex gap-1"><input placeholder="Value" value={newSpec.value} onChange={(event) => setNewSpec({ ...newSpec, value: event.target.value })} onKeyDown={(event) => { if (event.key === 'Enter') addSpec(); }} className="brutal-input" /><Button type="button" size="icon" onClick={addSpec} aria-label="Add specification"><Plus className="w-4 h-4" /></Button></div></div>
      </section>

      <section className="brutal-card bg-white p-6"><h3 className="font-bold text-sm uppercase tracking-wide mb-4 pb-3 border-b-2 border-ink-100">What’s in the box</h3><div className="space-y-2 mb-3">{boxItems.map((item, index) => <div key={`${item}-${index}`} className="flex items-center gap-2 brutal-border bg-paper-100 p-2"><span className="text-sm flex-1">{item}</span><button onClick={() => setBoxItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="brutal-border bg-white p-1 hover:bg-danger-500 hover:text-white" aria-label={`Remove ${item}`}><X className="w-3 h-3" /></button></div>)}</div><div className="flex gap-2"><input placeholder="Add an included item" value={newBoxItem} onChange={(event) => setNewBoxItem(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') addBoxItem(); }} className="brutal-input" /><Button type="button" size="sm" onClick={addBoxItem}><Plus className="w-4 h-4" /> Add</Button></div></section>

      <section className="brutal-card bg-white p-6"><h3 className="font-bold text-sm uppercase tracking-wide mb-4 pb-3 border-b-2 border-ink-100">Warranty & publication</h3><div className="grid md:grid-cols-2 gap-4"><Input label="Warranty Duration" value={form.warrantyDuration} onChange={(event) => setForm({ ...form, warrantyDuration: event.target.value })} /><Input label="Warranty Type" value={form.warrantyType} onChange={(event) => setForm({ ...form, warrantyType: event.target.value })} /></div><div className="grid md:grid-cols-2 gap-4 mt-4"><Select label="Status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as EditorForm['status'] })} options={[{ value: 'active', label: 'Active' }, { value: 'draft', label: 'Draft' }, { value: 'out-of-stock', label: 'Out of Stock' }]} /><div className="flex items-end pb-2"><Switch checked={form.isFeatured} onChange={(isFeatured) => setForm({ ...form, isFeatured })} label="Feature on homepage" /></div></div></section>

      <div className="flex justify-end gap-2 pb-4"><Button variant="outline" onClick={() => navigate('/admin/products')}>Cancel</Button><Button onClick={() => void handleSave()} loading={saving}><Save className="w-4 h-4" /> {editing ? 'Update Product' : 'Create Product'}</Button></div>
    </div>
  );
}
