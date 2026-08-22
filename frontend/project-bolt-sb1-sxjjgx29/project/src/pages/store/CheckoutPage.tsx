import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Banknote, Check, MapPin, ShoppingBag, Truck } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { CheckoutSteps } from '@/components/store/CheckoutSteps';
import { AddressCard } from '@/components/store/AddressCard';
import { OrderSummaryCard } from '@/components/store/OrderSummaryCard';
import { Button } from '@/components/ui/Button';
import { Breadcrumbs } from '@/components/ui/Misc';
import { Alert } from '@/components/ui/Alert';
import { formatCurrency, generateOrderNumber } from '@/lib/utils';
import { api } from '@/api/services';
import { getApiErrorMessage } from '@/api/client';
import { useToast } from '@/components/ui/Toast';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, clearCart, couponCode, couponDiscount, setCoupon } = useCartStore();
  const { user, updateUser } = useAuthStore();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedAddressId, setSelectedAddressId] = useState(
    user?.addresses.find((a) => a.isDefault)?._id ?? user?.addresses[0]?._id ?? '',
  );
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    void api.addresses.list()
      .then((addresses) => updateUser({ addresses }))
      .catch(() => undefined);
  }, [updateUser]);

  useEffect(() => {
    if (!selectedAddressId && user?.addresses.length) {
      setSelectedAddressId(user.addresses.find((address) => address.isDefault)?._id ?? user.addresses[0]!._id);
    }
  }, [selectedAddressId, user?.addresses]);

  const itemsTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const grandTotal = itemsTotal - couponDiscount;

  const placeOrder = async () => {
    if (!selectedAddressId) return;
    setPlacingOrder(true);
    try {
      const order = await api.orders.create(selectedAddressId, couponCode);
      clearCart();
      setCoupon(undefined, 0);
      setOrderNumber(order.orderNumber);
      setOrderPlaced(true);
      toast('success', 'Your COD order has been placed.');
    } catch (error) {
      toast('error', getApiErrorMessage(error), 'Could not place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="brutal-card bg-white p-8 text-center animate-bounce-in">
          <div className="inline-flex brutal-border bg-success-500 text-white p-4 mb-4">
            <Check className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-tight mb-2">Order Placed!</h1>
          <p className="text-sm text-ink-500 mb-1">Order Number</p>
          <p className="text-xl font-bold text-primary-600 mb-6">{orderNumber || generateOrderNumber()}</p>
          <p className="text-sm text-ink-600 mb-6">
            Thank you for your purchase. Your order has been placed successfully.
            You'll pay {formatCurrency(grandTotal)} via Cash on Delivery.
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => navigate('/catalog')}>Continue Shopping</Button>
            <Button onClick={() => navigate('/orders')}>View Orders</Button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-ink-300 mb-4" />
        <h1 className="text-xl font-bold uppercase tracking-tight mb-2">Cart is empty</h1>
        <p className="text-sm text-ink-500 mb-4">Add products to checkout</p>
        <Button onClick={() => navigate('/catalog')}>Browse Products</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Cart', href: '/cart' }, { label: 'Checkout' }]} />

      <h1 className="text-2xl font-bold uppercase tracking-tight mt-3 mb-6">Checkout</h1>

      <div className="mb-8">
        <CheckoutSteps current={step} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Step 1: Address */}
          {step === 1 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5" />
                <h2 className="font-bold text-lg uppercase tracking-tight">Delivery Address</h2>
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
                  You need to add a delivery address. Go to your profile to add one.
                </Alert>
              )}

              <div className="mt-6 flex justify-end">
                <Button onClick={() => setStep(2)} disabled={!selectedAddressId}>
                  Continue to Payment
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Payment (COD only) */}
          {step === 2 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <Banknote className="w-5 h-5" />
                <h2 className="font-bold text-lg uppercase tracking-tight">Payment Method</h2>
              </div>

              <div className="brutal-card bg-white p-6">
                <div className="flex items-center gap-4">
                  <div className="brutal-border-3 bg-success-500 text-white p-4">
                    <Truck className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg">Cash on Delivery</p>
                    <p className="text-sm text-ink-500">Pay with cash when your order is delivered to your doorstep.</p>
                  </div>
                  <Check className="w-6 h-6 text-success-600" />
                </div>
                <div className="mt-4 p-3 bg-paper-100 brutal-border">
                  <p className="text-xs text-ink-600">
                    Note: This store supports COD only. No online payment required.
                    Make sure to have {formatCurrency(grandTotal)} ready at delivery.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => setStep(3)}>Review Order</Button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <Check className="w-5 h-5" />
                <h2 className="font-bold text-lg uppercase tracking-tight">Review & Confirm</h2>
              </div>

              <div className="space-y-3">
                {/* Delivery address */}
                <div className="brutal-card bg-white p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-ink-500 mb-2">Delivery Address</h3>
                  {(() => {
                    const addr = user?.addresses.find((a) => a._id === selectedAddressId);
                    if (!addr) return <p className="text-sm text-ink-400">No address selected</p>;
                    return (
                      <div>
                        <p className="font-semibold text-sm">{addr.fullName}</p>
                        <p className="text-sm text-ink-600">{addr.line1}, {addr.line2 && `${addr.line2}, `}{addr.city}, {addr.state} - {addr.pincode}</p>
                        <p className="text-sm text-ink-600">Phone: {addr.phone}</p>
                      </div>
                    );
                  })()}
                </div>

                {/* Items */}
                <div className="brutal-card bg-white p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-ink-500 mb-3">Order Items</h3>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.productId} className="flex gap-3 items-center">
                        <img src={item.image} alt={item.name} className="w-14 h-14 object-cover brutal-border" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold line-clamp-1">{item.name}</p>
                          <p className="text-xs text-ink-500">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                        </div>
                        <p className="text-sm font-bold">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment */}
                <div className="brutal-card bg-white p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-ink-500 mb-2">Payment</h3>
                  <p className="text-sm font-semibold">Cash on Delivery</p>
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
                  Place Order
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Summary sidebar */}
        <div>
          <OrderSummaryCard
            items={items}
            itemsTotal={itemsTotal}
            discountTotal={couponDiscount}
            grandTotal={grandTotal}
            couponCode={couponCode}
            showShipping={false}
          />
        </div>
      </div>
    </div>
  );
}
