import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Plus, Minus, X, Trash2, ArrowRight } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { formatCurrency } from '@/lib/utils';
import { MediaImage } from '@/components/ui/MediaImage';

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const itemsTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleCheckout = () => {
    closeCart();
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={closeCart} title={`Cart (${totalItems})`} width="md">
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="brutal-border bg-paper-100 p-6 mb-4">
            <ShoppingBag className="w-12 h-12 text-ink-300" />
          </div>
          <p className="text-lg font-bold uppercase tracking-tight mb-2">Cart is empty</p>
          <p className="text-sm text-ink-500 mb-6">Add some products to get started</p>
          <Button onClick={() => { closeCart(); navigate('/catalog'); }}>
            Browse Products
          </Button>
        </div>
      ) : (
        <>
          <div className="p-4 space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-3 brutal-border bg-white p-3">
                <Link to={`/product/${item.slug}`} onClick={closeCart} className="flex-shrink-0">
                  <MediaImage src={item.image} alt={item.name} fallbackLabel={item.name} className="w-20 h-20 object-cover brutal-border" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/product/${item.slug}`}
                    onClick={closeCart}
                    className="text-sm font-semibold hover:text-primary-600 transition-colors line-clamp-2"
                  >
                    {item.name}
                  </Link>
                  <p className="text-sm font-bold text-ink-900 mt-1">{formatCurrency(item.price)}</p>
                  {item.priceChanged && (
                    <p className="text-xs text-warning-700 font-medium mt-0.5">Price changed since adding</p>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center brutal-border">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1.5 hover:bg-paper-100 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-sm font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.maxStock}
                        className="p-1.5 hover:bg-paper-100 transition-colors disabled:opacity-40"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="p-1.5 hover:bg-danger-500 hover:text-white transition-colors brutal-border"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="w-full text-xs font-bold uppercase tracking-wide text-danger-600 hover:text-danger-700 py-2"
            >
              Clear Cart
            </button>
          </div>

          {/* Sticky footer */}
          <div className="border-t-2 border-ink-900 p-4 bg-paper-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold uppercase tracking-wide">Subtotal</span>
              <span className="text-lg font-bold">{formatCurrency(itemsTotal)}</span>
            </div>
            <p className="text-xs text-ink-500 mb-3">Shipping calculated at checkout. COD available.</p>
            <Button fullWidth size="lg" onClick={handleCheckout}>
              Checkout <ArrowRight className="w-4 h-4" />
            </Button>
            <button
              onClick={closeCart}
              className="w-full mt-2 text-xs font-bold uppercase tracking-wide text-ink-500 hover:text-ink-900 py-2"
            >
              Continue Shopping
            </button>
          </div>
        </>
      )}
    </Drawer>
  );
}
