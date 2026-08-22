import { useEffect, useMemo, useState } from 'react';
import { History } from 'lucide-react';
import type { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { Carousel } from './Carousel';
import { SectionHeader } from '@/components/ui/Misc';
import { recentlyViewedProductIds, recentlyViewedUpdatedEvent } from '@/lib/recentlyViewed';

interface RecentlyViewedProps {
  products: Product[];
}

export function RecentlyViewed({ products }: RecentlyViewedProps) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    const refresh = () => setIds(recentlyViewedProductIds());
    refresh();
    window.addEventListener(recentlyViewedUpdatedEvent, refresh);
    return () => window.removeEventListener(recentlyViewedUpdatedEvent, refresh);
  }, []);

  const viewedProducts = useMemo(
    () => ids.map((id) => products.find((product) => product._id === id)).filter((product): product is Product => Boolean(product && product.status === 'active')),
    [ids, products],
  );

  if (viewedProducts.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <SectionHeader title="Recently Viewed" subtitle="Pick up where you left off" action={<History className="h-5 w-5 text-primary-600" />} />
      <div className="mt-4">
        <Carousel>
          {viewedProducts.map((product) => (
            <div key={product._id} className="w-[200px] flex-shrink-0 snap-start-item"><ProductCard product={product} /></div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
