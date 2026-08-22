import { useState } from 'react';
import { Tag, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';

interface CouponInputProps {
  onApply: (code: string) => void;
  appliedCode?: string;
  discount?: number;
  onRemove: () => void;
}

export function CouponInput({ onApply, appliedCode, discount, onRemove }: CouponInputProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleApply = () => {
    if (!code.trim()) {
      setError('Enter a coupon code');
      return;
    }
    setError('');
    onApply(code.toUpperCase().trim());
    setCode('');
  };

  if (appliedCode) {
    return (
      <div className="brutal-card bg-success-100 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="brutal-border bg-success-500 text-white p-1.5">
            <Check className="w-4 h-4" />
          </span>
          <div>
            <p className="font-bold text-sm">{appliedCode}</p>
            {discount && discount > 0 && (
              <p className="text-xs text-success-700">You saved {formatCurrency(discount)}</p>
            )}
          </div>
        </div>
        <button onClick={onRemove} className="brutal-border bg-white p-1.5 hover:bg-danger-500 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            placeholder="Enter coupon code"
            className="w-full brutal-border bg-white pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:shadow-brutal uppercase font-semibold"
          />
        </div>
        <Button size="md" onClick={handleApply}>Apply</Button>
      </div>
      {error && <p className="mt-1 text-xs text-danger-600 font-medium">{error}</p>}
      <div className="flex flex-wrap gap-1.5 mt-2">
        <Badge variant="outline" size="sm">WELCOME10</Badge>
        <Badge variant="outline" size="sm">FLAT500</Badge>
        <Badge variant="outline" size="sm">MONSOON25</Badge>
      </div>
    </div>
  );
}
