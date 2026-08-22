import { useEffect, useState } from 'react';
import { Plus, MapPin } from 'lucide-react';
import { Breadcrumbs, EmptyState } from '@/components/ui/Misc';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { AddressCard } from '@/components/store/AddressCard';
import { AddressForm } from '@/components/store/AddressForm';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { Address } from '@/types';
import { api } from '@/api/services';
import { getApiErrorMessage } from '@/api/client';

export function AddressesPage() {
  const { user, addAddress, updateAddress, removeAddress, setDefaultAddress, updateUser } = useAuthStore();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const addresses = user?.addresses ?? [];

  useEffect(() => {
    void api.addresses.list()
      .then((remoteAddresses) => updateUser({ addresses: remoteAddresses }))
      .catch(() => undefined);
  }, [updateUser]);

  const handleSubmit = async (address: Omit<Address, '_id'>) => {
    try {
      if (editingId) {
        const savedAddress = await api.addresses.update(editingId, address);
        updateAddress(editingId, savedAddress);
        toast('success', 'Address updated', 'Done');
      } else {
        const savedAddress = await api.addresses.create(address);
        addAddress(savedAddress);
        toast('success', 'Address added', 'Done');
      }
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      toast('error', getApiErrorMessage(error), 'Could not save address');
    }
  };

  const setDefault = async (id: string) => {
    try {
      await api.addresses.setDefault(id);
      setDefaultAddress(id);
      toast('success', 'Default address updated');
    } catch (error) {
      toast('error', getApiErrorMessage(error), 'Could not update default address');
    }
  };

  const deleteAddress = async () => {
    if (!deleteId) return;
    try {
      await api.addresses.remove(deleteId);
      removeAddress(deleteId);
      toast('success', 'Address removed');
      setDeleteId(null);
    } catch (error) {
      toast('error', getApiErrorMessage(error), 'Could not remove address');
    }
  };

  if (addresses.length === 0 && !showForm) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Addresses' }]} />
        <EmptyState
          icon={<MapPin className="w-16 h-16" />}
          title="No saved addresses"
          description="Add a delivery address to speed up checkout"
          action={<Button size="lg" onClick={() => setShowForm(true)}><Plus className="w-4 h-4" /> Add Address</Button>}
        />
        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Address" size="md">
          <div className="p-6"><AddressForm onSubmit={handleSubmit} onCancel={() => setShowForm(false)} /></div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Addresses' }]} />

      <div className="flex items-center justify-between mt-3 mb-6">
        <h1 className="text-2xl font-bold uppercase tracking-tight">Saved Addresses</h1>
        <Button size="sm" onClick={() => { setEditingId(null); setShowForm(true); }}>
          <Plus className="w-4 h-4" /> Add New
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {addresses.map((addr) => (
          <AddressCard
            key={addr._id}
            address={addr}
            onEdit={() => { setEditingId(addr._id); setShowForm(true); }}
            onDelete={() => setDeleteId(addr._id)}
            onSetDefault={() => { void setDefault(addr._id); }}
          />
        ))}
      </div>

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditingId(null); }} title={editingId ? 'Edit Address' : 'Add Address'} size="md">
        <div className="p-6">
          <AddressForm
            initial={editingId ? addresses.find((a) => a._id === editingId) : undefined}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditingId(null); }}
          />
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { void deleteAddress(); }}
        title="Delete Address?"
        message="This address will be permanently removed."
        confirmLabel="Delete"
      />
    </div>
  );
}
