import { Home, Briefcase, MapPin, Star, Trash2, Edit2, Check } from 'lucide-react';
import type { Address } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface AddressCardProps {
  address: Address;
  onEdit?: () => void;
  onDelete?: () => void;
  onSetDefault?: () => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}

export function AddressCard({ address, onEdit, onDelete, onSetDefault, selectable, selected, onSelect }: AddressCardProps) {
  const labelIcon = address.label.toLowerCase().includes('home') ? Home : address.label.toLowerCase().includes('work') ? Briefcase : MapPin;

  const Icon = labelIcon;

  return (
    <div
      onClick={selectable ? onSelect : undefined}
      className={cn(
        'brutal-card bg-white p-4',
        selectable && 'cursor-pointer transition-all',
        selected ? 'ring-2 ring-primary-500 shadow-brutal' : '',
        selectable && !selected && 'hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px]',
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="brutal-border bg-paper-100 p-1.5">
            <Icon className="w-4 h-4" />
          </span>
          <span className="font-bold text-sm">{address.label}</span>
          {address.isDefault && (
            <Badge variant="accent" size="sm"><Star className="w-3 h-3" /> Default</Badge>
          )}
        </div>
        {selectable && selected && (
          <span className="brutal-border bg-primary-500 text-white p-1">
            <Check className="w-3.5 h-3.5" />
          </span>
        )}
      </div>

      <p className="text-sm font-semibold">{address.fullName}</p>
      <p className="text-sm text-ink-600">{address.line1}</p>
      {address.line2 && <p className="text-sm text-ink-600">{address.line2}</p>}
      <p className="text-sm text-ink-600">{address.city}, {address.state} - {address.pincode}</p>
      <p className="text-sm text-ink-600 mt-1">Phone: {address.phone}</p>

      {!selectable && (
        <div className="flex gap-2 mt-3 pt-3 border-t-2 border-ink-100">
          {onEdit && (
            <button onClick={onEdit} className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide hover:text-primary-600 transition-colors">
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
          )}
          {onSetDefault && !address.isDefault && (
            <button onClick={onSetDefault} className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide hover:text-accent-600 transition-colors">
              <Star className="w-3.5 h-3.5" /> Set Default
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide hover:text-danger-600 transition-colors ml-auto">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
