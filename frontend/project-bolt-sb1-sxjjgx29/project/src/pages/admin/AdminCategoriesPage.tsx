import { useState } from 'react';
import { Plus, Edit, Trash2, Folder, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useDataStore } from '@/stores/dataStore';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import { api } from '@/api/services';
import { getApiErrorMessage } from '@/api/client';
import { MediaImage } from '@/components/ui/MediaImage';

export function AdminCategoriesPage() {
  const categories = useDataStore((state) => state.categories);
  const loadCatalogue = useDataStore((state) => state.loadCatalogue);
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({ name: '', parentCategory: '', image: '' });
  const [saving, setSaving] = useState(false);

  const topCategories = categories.filter((c) => c.parentCategory === null);

  const toggleExpand = (id: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ name: '', parentCategory: '', image: '' });
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await api.admin.categories.update(editingId, { name: form.name.trim(), parentCategory: form.parentCategory || null, ...(form.image.trim() ? { image: form.image.trim() } : {}) });
      } else {
        await api.admin.categories.create({ name: form.name.trim(), ...(form.parentCategory ? { parentCategory: form.parentCategory } : {}), ...(form.image.trim() ? { image: form.image.trim() } : {}) });
      }
      await loadCatalogue();
      toast('success', editingId ? 'Category updated' : 'Category created');
      closeForm();
    } catch (error) {
      toast('error', getApiErrorMessage(error), editingId ? 'Could not update category' : 'Could not create category');
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async () => {
    if (!deleteId) return;
    try {
      await api.admin.categories.remove(deleteId);
      await loadCatalogue();
      toast('success', 'Category deleted');
      setDeleteId(null);
    } catch (error) {
      toast('error', getApiErrorMessage(error), 'Could not delete category');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tight">Categories</h2>
          <p className="text-sm text-ink-500">{categories.length} categories</p>
        </div>
        <Button onClick={() => { setEditingId(null); setForm({ name: '', parentCategory: '', image: '' }); setShowForm(true); }}>
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      {/* Tree */}
      <div className="brutal-card bg-white p-4">
        <div className="space-y-1">
          {topCategories.map((cat) => {
            const subs = categories.filter((c) => c.parentCategory === cat._id);
            const isExpanded = expandedCats.has(cat._id);
            return (
              <div key={cat._id}>
                <div className="flex items-center gap-2 p-2 brutal-border bg-paper-100">
                  {subs.length > 0 ? (
                    <button onClick={() => toggleExpand(cat._id)} className="brutal-border bg-white p-1">
                      <ChevronRight className={cn('w-3.5 h-3.5 transition-transform', isExpanded && 'rotate-90')} />
                    </button>
                  ) : (
                    <span className="w-7 h-7 flex items-center justify-center"><Folder className="w-4 h-4 text-ink-400" /></span>
                  )}
                  <MediaImage src={cat.image} alt={cat.name} fallbackLabel={cat.name} className="w-8 h-8 object-cover brutal-border" />
                  <span className="font-semibold text-sm flex-1">{cat.name}</span>
                  <span className="text-xs text-ink-500">{cat.productCount} products</span>
                  <button onClick={() => { setEditingId(cat._id); setForm({ name: cat.name, parentCategory: '', image: cat.image ?? '' }); setShowForm(true); }} className="brutal-border bg-white p-1.5 hover:bg-primary-100">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteId(cat._id)} className="brutal-border bg-white p-1.5 hover:bg-danger-500 hover:text-white">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {isExpanded && subs.map((sub) => (
                  <div key={sub._id} className="flex items-center gap-2 p-2 ml-8 brutal-border bg-white border-t-0">
                    <Folder className="w-4 h-4 text-ink-400" />
                    <span className="text-sm flex-1">{sub.name}</span>
                    <span className="text-xs text-ink-500">{sub.productCount} products</span>
                    <button onClick={() => { setEditingId(sub._id); setForm({ name: sub.name, parentCategory: cat._id, image: sub.image ?? '' }); setShowForm(true); }} className="brutal-border bg-white p-1.5 hover:bg-primary-100">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleteId(sub._id)} className="brutal-border bg-white p-1.5 hover:bg-danger-500 hover:text-white">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form modal */}
      <Modal isOpen={showForm} onClose={closeForm} title={editingId ? 'Edit Category' : 'Add Category'} size="sm">
        <div className="p-6 space-y-4">
          <Input label="Category Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Image URL (optional)" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://… or /uploads/categories/…" />
          <Select
            label="Parent Category (optional)"
            value={form.parentCategory}
            onChange={(e) => setForm({ ...form, parentCategory: e.target.value })}
            placeholder="Top-level category"
            options={topCategories.map((c) => ({ value: c._id, label: c.name }))}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={closeForm}>Cancel</Button>
            <Button onClick={() => void handleSubmit()} loading={saving}>{editingId ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { void deleteCategory(); }}
        title="Delete Category?"
        message="Categories with active products cannot be deleted. Sub-categories must be removed first."
        confirmLabel="Delete"
      />
    </div>
  );
}
