import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Heart, ShoppingBag, Scale } from 'lucide-react';
import { Logo } from './Logo';
import { SearchBar } from './SearchBar';
import { CategoryNav } from './CategoryNav';
import { UserMenu } from './UserMenu';
import { useDataStore } from '@/stores/dataStore';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { ProductCompareModal } from '../store/ProductCompareModal';

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  
  const getCategoryTree = useDataStore((s) => s.getCategoryTree);
  const compareCount = useDataStore((s) => s.compareProducts.length);
  const tree = getCategoryTree();
  
  const totalItems = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const wishlistCount = useWishlistStore((s) => s.productIds.length);
  const openCart = useCartStore((s) => s.openCart);

  return (
    <>
      <div className="border-b border-paper-300 bg-paper-200 text-center text-xs font-medium text-ink-700">
        <div className="mx-auto max-w-7xl px-4 py-2">
          Free delivery on orders over ₹999 <span className="mx-2 text-paper-400">·</span> Easy returns within 7 days
        </div>
      </div>

      <header className="glass-header">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 py-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden rounded-lg border border-paper-400 p-2 text-ink-700 hover:bg-paper-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Logo size="md" />

            <SearchBar className="hidden md:block flex-1 max-w-xl" />

            <div className="flex items-center gap-3 ml-auto">
              {compareCount > 0 && (
                <button
                  onClick={() => setShowCompareModal(true)}
                  className="hidden sm:flex items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-100"
                >
                  <Scale className="w-4 h-4" />
                  <span>Compare ({compareCount})</span>
                </button>
              )}

              <Link
                to="/wishlist"
                className="relative rounded-lg border border-paper-400 p-2.5 text-ink-700 hover:border-brand-200 hover:text-brand-600"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <button
                onClick={openCart}
                className="glass-button rounded-lg px-4 py-2 text-xs tracking-wide"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">CART</span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-extrabold text-brand-700">
                  {totalItems}
                </span>
              </button>

              <UserMenu />
            </div>
          </div>

          <div className="md:hidden pb-3">
            <SearchBar />
          </div>

          <div className="hidden lg:flex items-center border-t border-paper-300 -mx-4 px-4">
            <CategoryNav />
          </div>
        </div>
      </header>

      <ProductCompareModal isOpen={showCompareModal} onClose={() => setShowCompareModal(false)} />

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-ink-900/20" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 left-0 bottom-0 flex w-80 max-w-[85vw] flex-col border-r border-paper-300 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-paper-300 p-4">
              <Logo size="sm" />
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-ink-500 hover:bg-paper-100 hover:text-ink-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              <Link
                to="/catalog"
                onClick={() => setMobileOpen(false)}
                className="mb-3 block rounded-lg bg-brand-500 px-4 py-3 text-sm font-semibold text-white"
              >
                Explore All Products
              </Link>

              {tree.map((cat) => (
                <div key={cat._id} className="space-y-1">
                  <Link
                    to={`/catalog?category=${cat.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 text-xs font-bold uppercase tracking-wider text-brand-600"
                  >
                    {cat.name}
                  </Link>
                  {cat.children && cat.children.length > 0 && (
                    <div className="space-y-1 border-l border-paper-300 pl-3">
                      {cat.children.map((sub) => (
                        <Link
                          key={sub._id}
                          to={`/catalog?category=${cat.slug}&subCategory=${sub.slug}`}
                          onClick={() => setMobileOpen(false)}
                          className="block rounded-lg px-3 py-1.5 text-xs text-ink-600 hover:bg-paper-100 hover:text-ink-900"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2 border-t border-paper-300 p-4">
              <Link
                to="/wishlist"
                onClick={() => setMobileOpen(false)}
                className="glass-button-secondary flex-1 py-2.5 text-xs"
              >
                <Heart className="w-4 h-4 text-rose-400" />
                Wishlist ({wishlistCount})
              </Link>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  openCart();
                }}
                className="glass-button flex-1 py-2.5 text-xs"
              >
                <ShoppingBag className="w-4 h-4" />
                Cart ({totalItems})
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
