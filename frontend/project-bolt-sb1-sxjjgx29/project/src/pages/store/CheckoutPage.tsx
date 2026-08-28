import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check, MapPin, ShoppingBag, CreditCard, Banknote,
  Smartphone, Building2, Tag, ChevronRight, Lock,
} from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { CheckoutSteps } from '@/components/store/CheckoutSteps';
import { AddressCard } from '@/components/store/AddressCard';
import { OrderSummaryCard } from '@/components/store/OrderSummaryCard';
import { CouponInput } from '@/components/store/CouponInput';
import { Button } from '@/components/ui/Button';
import { Breadcrumbs } from '@/components/ui/Misc';
import { Alert } from '@/components/ui/Alert';
import { formatCurrency } from '@/lib/utils';
import { api } from '@/api/services';
import { getApiErrorMessage } from '@/api/client';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

/* ─── Payment method types ─── */
type PaymentCategory = 'upi' | 'card' | 'netbanking' | 'cod';

interface UpiOption {
  id: string;
  label: string;
  logo: string; // emoji or letter abbr
  color: string;
}

const UPI_OPTIONS: UpiOption[] = [
  { id: 'gpay', label: 'Google Pay', logo: '🟦', color: 'border-blue-200 bg-blue-50 text-blue-800' },
  { id: 'phonepe', label: 'PhonePe', logo: '🟣', color: 'border-purple-200 bg-purple-50 text-purple-800' },
  { id: 'paytm', label: 'Paytm', logo: '🔵', color: 'border-sky-200 bg-sky-50 text-sky-800' },
  { id: 'bhim', label: 'BHIM UPI', logo: '🟠', color: 'border-orange-200 bg-orange-50 text-orange-800' },
  { id: 'other_upi', label: 'Other UPI', logo: '📲', color: 'border-paper-300 bg-paper-50 text-ink-700' },
];

const BANKS = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'Punjab National Bank', 'Bank of Baroda', 'Yes Bank'];

/* ─── Payment method selector ─── */
function PaymentMethodSelector({
  selected,
  onChange,
}: {
  selected: PaymentCategory;
  onChange: (m: PaymentCategory) => void;
}) {
  const categories: { id: PaymentCategory; icon: React.ReactNode; label: string; sub: string }[] = [
    { id: 'upi', icon: <Smartphone className="h-5 w-5" />, label: 'UPI', sub: 'GPay, PhonePe, Paytm & more' },
    { id: 'card', icon: <CreditCard className="h-5 w-5" />, label: 'Debit / Credit Card', sub: 'Visa, Mastercard, RuPay' },
    { id: 'netbanking', icon: <Building2 className="h-5 w-5" />, label: 'Net Banking', sub: 'All major banks' },
    { id: 'cod', icon: <Banknote className="h-5 w-5" />, label: 'Cash on Delivery', sub: 'Pay when delivered' },
  ];

  return (
    <div className="space-y-2">
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onChange(cat.id)}
          className={cn(
            'w-full flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all',
            selected === cat.id
              ? 'border-brand-500 bg-brand-50 shadow-sm'
              : 'border-paper-300 bg-white hover:border-paper-400 hover:bg-paper-50',
          )}
        >
          <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-lg', selected === cat.id ? 'bg-brand-100 text-brand-600' : 'bg-paper-100 text-ink-500')}>
            {cat.icon}
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-semibold text-ink-900">{cat.label}</span>
            <span className="block text-xs text-ink-500 mt-0.5">{cat.sub}</span>
          </span>
          <span className={cn('h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0', selected === cat.id ? 'border-brand-500 bg-brand-500' : 'border-paper-400')}>
            {selected === cat.id && <span className="block h-2 w-2 rounded-full bg-white" />}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ─── UPI sub-selection ─── */
function UpiPanel({ selected, onChange }: { selected: string; onChange: (id: string) => void }) {
  const [customUpi, setCustomUpi] = useState('');
  return (
    <div className="mt-4 rounded-xl border border-paper-300 bg-white p-4 space-y-4">
      <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Select UPI App</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {UPI_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-all',
              selected === opt.id ? opt.color + ' border-opacity-80 ring-2 ring-brand-400 ring-offset-1' : 'border-paper-300 bg-white text-ink-700 hover:bg-paper-50',
            )}
          >
            <span>{opt.logo}</span> {opt.label}
          </button>
        ))}
      </div>
      <div>
        <label className="block text-xs font-medium text-ink-600 mb-1">Or enter UPI ID</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="yourname@upi"
            value={customUpi}
            onChange={(e) => setCustomUpi(e.target.value)}
            className="glass-input flex-1 text-sm"
          />
          <Button size="sm" variant="outline" disabled={!customUpi.includes('@')}>Verify</Button>
        </div>
        <p className="text-xs text-ink-400 mt-1">e.g. mobileno@paytm, name@okaxis</p>
      </div>
      <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800 flex items-start gap-2">
        <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        UPI payment will be collected at checkout via your selected app. No payment info is stored here.
      </div>
    </div>
  );
}

/* ─── Card input panel ─── */
function CardPanel() {
  return (
    <div className="mt-4 rounded-xl border border-paper-300 bg-white p-4 space-y-3">
      <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Card Details</p>
      <div>
        <label className="brutal-label">Card Number</label>
        <input type="text" placeholder="1234 5678 9012 3456" maxLength={19} className="glass-input text-sm tracking-widest" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="brutal-label">Expiry</label>
          <input type="text" placeholder="MM / YY" maxLength={7} className="glass-input text-sm" />
        </div>
        <div>
          <label className="brutal-label">CVV</label>
          <input type="text" placeholder="•••" maxLength={4} className="glass-input text-sm" />
        </div>
      </div>
      <div>
        <label className="brutal-label">Name on Card</label>
        <input type="text" placeholder="As printed on card" className="glass-input text-sm" />
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        {['VISA', 'MC', 'RUPAY', 'AMEX'].map((n) => (
          <span key={n} className="rounded border border-paper-300 bg-paper-50 px-2 py-1 text-[11px] font-bold text-ink-500">{n}</span>
        ))}
      </div>
      <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800 flex items-start gap-2">
        <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        Card details are encrypted and secured with 3D Secure / OTP verification.
      </div>
    </div>
  );
}

/* ─── Netbanking panel ─── */
function NetbankingPanel({ selected, onChange }: { selected: string; onChange: (b: string) => void }) {
  return (
    <div className="mt-4 rounded-xl border border-paper-300 bg-white p-4 space-y-3">
      <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Select Your Bank</p>
      <div className="grid grid-cols-2 gap-2">
        {BANKS.map((bank) => (
          <button
            key={bank}
            type="button"
            onClick={() => onChange(bank)}
            className={cn(
              'rounded-lg border px-3 py-2.5 text-xs font-semibold text-left transition-all',
              selected === bank
                ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-300 ring-offset-1'
                : 'border-paper-300 bg-white text-ink-700 hover:bg-paper-50',
            )}
          >
            {bank}
          </button>
        ))}
      </div>
      <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800 flex items-start gap-2">
        <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        You'll be redirected to your bank's secure portal to complete the payment.
      </div>
    </div>
  );
}

/* ─── Main CheckoutPage ─── */
export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, replaceFromServer, couponCode, couponDiscount, setCoupon } = useCartStore();
  const { user, updateUser } = useAuthStore();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [selectedAddressId, setSelectedAddressId] = useState(
    user?.addresses.find((a) => a.isDefault)?._id ?? user?.addresses[0]?._id ?? '',
  );

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentCategory>('upi');
  const [selectedUpi, setSelectedUpi] = useState('gpay');
  const [selectedBank, setSelectedBank] = useState('');

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [orderId, setOrderId] = useState('');
  const [orderTotal, setOrderTotal] = useState<number | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    void api.addresses.list()
      .then((addresses) => updateUser({ addresses }))
      .catch((error) => toast('error', getApiErrorMessage(error), 'Could not load saved addresses'));
  }, [toast, updateUser]);

  useEffect(() => {
    if (!selectedAddressId && user?.addresses.length) {
      setSelectedAddressId(user.addresses.find((a) => a.isDefault)?._id ?? user.addresses[0]!._id);
    }
  }, [selectedAddressId, user?.addresses]);

  const handleApplyCoupon = async (code: string) => {
    try {
      const coupon = await api.coupons.apply(code);
      setCoupon(coupon.code, coupon.discount);
      toast('success', `${coupon.code} applied — you saved ${formatCurrency(coupon.discount)}!`);
    } catch (error) {
      setCoupon(undefined, 0);
      toast('error', getApiErrorMessage(error), 'Coupon could not be applied');
    }
  };

  const itemsTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const grandTotal = itemsTotal - couponDiscount;

  const paymentLabel =
    paymentMethod === 'cod' ? 'Cash on Delivery'
    : paymentMethod === 'upi' ? (UPI_OPTIONS.find((u) => u.id === selectedUpi)?.label ?? 'UPI')
    : paymentMethod === 'card' ? 'Debit / Credit Card'
    : selectedBank || 'Net Banking';

  const placeOrder = async () => {
    if (!selectedAddressId) return;
    setPlacingOrder(true);
    try {
      const order = await api.orders.create(selectedAddressId, couponCode);
      replaceFromServer([]);
      setCoupon(undefined, 0);
      setOrderNumber(order.orderNumber);
      setOrderId(order._id);
      setOrderTotal(order.grandTotal);
      setOrderPlaced(true);
      toast('success', 'Your order has been placed successfully!');
    } catch (error) {
      toast('error', getApiErrorMessage(error), 'Could not place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  /* ── Order placed confirmation ── */
  if (orderPlaced) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="rounded-2xl border border-paper-300 bg-white p-8 text-center shadow-glass">
          <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-success-100">
            <Check className="h-10 w-10 text-success-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900 mb-1">Order Placed!</h1>
          <p className="text-sm text-ink-500 mb-1">Order Number</p>
          <p className="text-xl font-bold text-brand-600 mb-2">{orderNumber}</p>
          <p className="text-sm text-ink-600 mb-1">Payment method: <span className="font-semibold">{paymentLabel}</span></p>
          <p className="text-sm text-ink-500 mb-6">
            Thank you for your purchase. Total: <span className="font-bold text-ink-900">{formatCurrency(orderTotal ?? 0)}</span>
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            <Button variant="outline" onClick={() => navigate('/catalog')}>Continue Shopping</Button>
            <Button onClick={() => navigate(`/orders/${orderId}`)}>View Order & Invoice</Button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Empty cart guard ── */
  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-ink-300 mb-4" />
        <h1 className="text-xl font-bold tracking-tight mb-2">Cart is empty</h1>
        <p className="text-sm text-ink-500 mb-4">Add products to checkout</p>
        <Button onClick={() => navigate('/catalog')}>Browse Products</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Cart', href: '/cart' }, { label: 'Checkout' }]} />
      <h1 className="text-2xl font-bold tracking-tight mt-3 mb-6">Checkout</h1>

      <div className="mb-8">
        <CheckoutSteps current={step} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Left: steps ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Step 1: Address */}
          {step === 1 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-brand-600" />
                <h2 className="font-bold text-lg tracking-tight">Delivery Address</h2>
              </div>

              {user?.addresses && user.addresses.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-3">
                  {user.addresses.map((addr) => (
                    <AddressCard
                      key={addr._id}
                      address={addr}
                      selectable
                      selected={selectedAddressId === addr._id}
                      onSelect={() => setSelectedAddressId(addr._id)}
                    />
                  ))}
                </div>
              ) : (
                <Alert variant="warning" title="No addresses saved">
                  Go to your profile to add a delivery address first.
                </Alert>
              )}

              <div className="mt-6 flex justify-end">
                <Button onClick={() => setStep(2)} disabled={!selectedAddressId}>
                  Continue to Payment <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div>
              <div className="flex items-center gap-2 mb-5">
                <CreditCard className="w-5 h-5 text-brand-600" />
                <h2 className="font-bold text-lg tracking-tight">Payment Method</h2>
              </div>

              <PaymentMethodSelector selected={paymentMethod} onChange={setPaymentMethod} />

              {/* Sub-panels */}
              {paymentMethod === 'upi' && (
                <UpiPanel selected={selectedUpi} onChange={setSelectedUpi} />
              )}
              {paymentMethod === 'card' && <CardPanel />}
              {paymentMethod === 'netbanking' && (
                <NetbankingPanel selected={selectedBank} onChange={setSelectedBank} />
              )}
              {paymentMethod === 'cod' && (
                <div className="mt-4 rounded-xl border border-paper-300 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-success-100 text-success-600">
                      <Banknote className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-ink-900">Cash on Delivery</p>
                      <p className="text-xs text-ink-500 mt-0.5">
                        Pay in cash when your order arrives at your door. Please keep exact change ready.
                      </p>
                      <p className="mt-2 text-xs font-semibold text-ink-700">
                        Amount due on delivery: {formatCurrency(grandTotal)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => setStep(3)}>
                  Review Order <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div>
              <div className="flex items-center gap-2 mb-5">
                <Check className="w-5 h-5 text-brand-600" />
                <h2 className="font-bold text-lg tracking-tight">Review & Confirm</h2>
              </div>

              <div className="space-y-3">
                {/* Delivery address */}
                <div className="rounded-xl border border-paper-300 bg-white p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-ink-500">Delivery Address</h3>
                    <button onClick={() => setStep(1)} className="text-xs font-semibold text-brand-600 hover:underline">Change</button>
                  </div>
                  {(() => {
                    const addr = user?.addresses.find((a) => a._id === selectedAddressId);
                    if (!addr) return <p className="text-sm text-ink-400">No address selected</p>;
                    return (
                      <div className="text-sm">
                        <p className="font-semibold text-ink-900">{addr.fullName}</p>
                        <p className="text-ink-600 mt-0.5">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                        <p className="text-ink-600">{addr.city}, {addr.state} — {addr.pincode}</p>
                        <p className="text-ink-600 mt-0.5">📞 {addr.phone}</p>
                      </div>
                    );
                  })()}
                </div>

                {/* Payment method */}
                <div className="rounded-xl border border-paper-300 bg-white p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-ink-500">Payment Method</h3>
                    <button onClick={() => setStep(2)} className="text-xs font-semibold text-brand-600 hover:underline">Change</button>
                  </div>
                  <p className="text-sm font-semibold text-ink-900">{paymentLabel}</p>
                </div>

                {/* Items */}
                <div className="rounded-xl border border-paper-300 bg-white p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-ink-500 mb-3">Order Items ({items.length})</h3>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.productId} className="flex gap-3 items-center">
                        <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-lg border border-paper-200 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold line-clamp-1 text-ink-900">{item.name}</p>
                          <p className="text-xs text-ink-500">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                        </div>
                        <p className="text-sm font-bold text-ink-900 shrink-0">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button
                  variant="success"
                  size="lg"
                  onClick={placeOrder}
                  loading={placingOrder}
                >
                  <Lock className="h-4 w-4" />
                  Place Order — {formatCurrency(grandTotal)}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: summary + coupon ── */}
        <div className="space-y-4">
          {/* Coupon */}
          <div className="rounded-xl border border-paper-300 bg-white p-4">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-ink-500" />
              <h3 className="font-bold text-sm tracking-wide text-ink-800">Have a Coupon?</h3>
            </div>
            <CouponInput
              onApply={handleApplyCoupon}
              appliedCode={couponCode}
              discount={couponDiscount}
              onRemove={() => setCoupon(undefined, 0)}
            />
          </div>

          {/* Order summary */}
          <OrderSummaryCard
            items={items}
            itemsTotal={itemsTotal}
            discountTotal={couponDiscount}
            grandTotal={grandTotal}
            couponCode={couponCode}
            showShipping={false}
          />

          {/* Security badge */}
          <div className="flex items-center justify-center gap-2 rounded-xl border border-paper-200 bg-paper-50 px-4 py-3 text-xs text-ink-500">
            <Lock className="h-3.5 w-3.5 shrink-0 text-success-600" />
            Secured with 256-bit SSL encryption
          </div>
        </div>

      </div>
    </div>
  );
}
