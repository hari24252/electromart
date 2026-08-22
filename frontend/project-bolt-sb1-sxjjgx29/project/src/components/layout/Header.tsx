import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Heart, ShoppingBag, Scale, Flame } from 'lucide-react';
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
      {/* Announcement Marquee Bar */}
      <div className="bg-gradient-to-r from-brand-900 via-slate-900 to-indigo-950 text-white py-1.5 border-b border-slate-800 overflow-hidden text-xs">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 px-4 font-mono font-medium tracking-wide text-slate-300">
              <span className="flex items-center gap-1.5 text-brand-400 font-semibold">
                <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> Free Express Shipping on orders over $150
              </span>
              <span>•</span>
              <span>Next-Day Tech Delivery Available</span>
              <span>•</span>
              <span className="text-amber-300 font-bold">Use code NEXTGEN10 for 10% Instant Discount</span>
              <span>•</span>
              <span>2-Year Full Hardware Warranty Included</span>
              <span>•</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Glass Header */}
      <header className="glass-header shadow-glass">
        <div className="max-w-7xl mx-auto px-4">
          {/* Top Row */}
          <div className="flex items-center gap-4 py-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Logo size="md" />

            <SearchBar className="hidden md:block flex-1 max-w-xl" />

            <div className="flex items-center gap-3 ml-auto">
              {/* Compare Button */}
              {compareCount > 0 && (
                <button
                  onClick={() => setShowCompareModal(true)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-600/20 text-brand-300 border border-brand-500/40 text-xs font-semibold hover:bg-brand-600/30 transition-all"
                >
                  <Scale className="w-4 h-4" />
                  <span>Compare ({compareCount})</span>
                </button>
              )}

              {/* Wishlist Icon */}
              <Link
                to="/wishlist"
                className="relative p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Button */}
              <button
                onClick={openCart}
                className="glass-button px-4 py-2 text-xs font-semibold tracking-wide gap-2 shadow-lg shadow-brand-600/20"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">CART</span>
                <span className="w-5 h-5 bg-white text-brand-700 rounded-full font-extrabold text-[11px] flex items-center justify-center">
                  {totalItems}
                </span>
              </button>

              <UserMenu />
            </div>
          </div>

          {/* Mobile Search Input */}
          <div className="md:hidden pb-3">
            <SearchBar />
          </div>

          {/* Desktop Category Navigation */}
          <div className="hidden lg:flex items-center border-t border-slate-800/80 -mx-4 px-4 bg-slate-950/40">
            <CategoryNav />
          </div>
        </div>
      </header>

      {/* Compare Modal */}
      <ProductCompareModal isOpen={showCompareModal} onClose={() => setShowCompareModal(false)} />

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-fade-in" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-slate-900 border-r border-slate-800 shadow-2xl animate-slide-in-left flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/80">
              <Logo size="sm" />
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <Link
                to="/catalog"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 font-semibold text-sm rounded-xl bg-brand-600 text-white shadow-md mb-3"
              >
                Explore All Products
              </Link>

              {tree.map((cat) => (
                <div key={cat._id} className="space-y-1">
                  <Link
                    to={`/catalog?category=${cat.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 font-bold text-xs uppercase tracking-wider text-brand-300"
                  >
                    {cat.name}
                  </Link>
                  {cat.children && cat.children.length > 0 && (
                    <div className="pl-3 space-y-1 border-l border-slate-800">
                      {cat.children.map((sub) => (
                        <Link
                          key={sub._id}
                          to={`/catalog?category=${cat.slug}&subCategory=${sub.slug}`}
                          onClick={() => setMobileOpen(false)}
                          className="block px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile Bottom Actions */}
            <div className="border-t border-slate-800 p-4 flex gap-2">
              <Link
                to="/wishlist"
                onClick={() => setMobileOpen(false)}
                className="flex-1 glass-button-secondary py-2.5 text-xs font-bold"
              >
                <Heart className="w-4 h-4 text-rose-400" />
                Wishlist ({wishlistCount})
              </Link>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  openCart();
                }}
                className="flex-1 glass-button py-2.5 text-xs font-bold"
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

