import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { ProductCard } from '@/components/store/ProductCard';
import { Breadcrumbs, EmptyState } from '@/components/ui/Misc';
import { Button } from '@/components/ui/Button';
import { useWishlistStore } from '@/stores/wishlistStore';
import { api } from '@/api/services';
import type { Product } from '@/types';

export function WishlistPage() {
  const productIds = useWishlistStore((state) => state.productIds);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);

  useEffect(() => {
    void api.wishlist.list()
      .then(setWishlistProducts)
      .catch(() => setWishlistProducts([]));
  }, [productIds]);

  if (wishlistProducts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Wishlist' }]} />
        <EmptyState
          icon={<Heart className="w-16 h-16" />}
          title="Your wishlist is empty"
          description="Save products you love by tapping the heart icon"
          action={<Link to="/catalog"><Button size="lg"><ShoppingBag className="w-4 h-4" /> Browse Products</Button></Link>}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Wishlist' }]} />

      <div className="flex items-center justify-between mt-3 mb-6">
        <h1 className="text-2xl font-bold uppercase tracking-tight">My Wishlist</h1>
        <span className="text-sm text-ink-500">{wishlistProducts.length} items</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {wishlistProducts.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  );
}
