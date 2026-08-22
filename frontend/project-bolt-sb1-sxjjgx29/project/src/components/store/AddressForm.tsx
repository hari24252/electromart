import { useState } from 'react';
import type { Address } from '@/types';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';

interface AddressFormProps {
  initial?: Partial<Address>;
  onSubmit: (address: Omit<Address, '_id'>) => void;
  onCancel: () => void;
}

export function AddressForm({ initial, onSubmit, onCancel }: AddressFormProps) {
  const [form, setForm] = useState({
    label: initial?.label ?? '',
    fullName: initial?.fullName ?? '',
    phone: initial?.phone ?? '',
    line1: initial?.line1 ?? '',
    line2: initial?.line2 ?? '',
    city: initial?.city ?? '',
    state: initial?.state ?? '',
    pincode: initial?.pincode ?? '',
    isDefault: initial?.isDefault ?? false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Label"
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          placeholder="Select type"
          options={[
            { value: 'Home', label: 'Home' },
            { value: 'Work', label: 'Work' },
            { value: 'Other', label: 'Other' },
          ]}
          required
        />
        <Input label="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required placeholder="9876543210" />
        <Input label="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} required placeholder="560001" />
      </div>

      <Input label="Address Line 1" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} required placeholder="House no, Building" />
      <Input label="Address Line 2" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} placeholder="Area, Landmark (optional)" />

      <div className="grid grid-cols-2 gap-3">
        <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
        <Input label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required />
      </div>

      <Switch checked={form.isDefault} onChange={(v) => setForm({ ...form, isDefault: v })} label="Set as default address" />

      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Address</Button>
      </div>
    </form>
  );
}
