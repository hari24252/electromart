import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { HeroSection } from '@/components/store/HeroSection';
import { FeatureStrip } from '@/components/store/FeatureStrip';
import { CategoryCard } from '@/components/store/CategoryCard';
import { ProductCard } from '@/components/store/ProductCard';
import { useDataStore } from '@/stores/dataStore';
import { RecentlyViewed } from '@/components/store/RecentlyViewed';

function SectionHeading({ eyebrow, title, link }: { eyebrow?: string; title: string; link?: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">{eyebrow}</p>}
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">{title}</h2>
      </div>
      {link && (
        <Link to={link} className="hidden items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 sm:flex">
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

export function HomePage() {
  const getCategoryTree = useDataStore((state) => state.getCategoryTree);
  const getFeaturedProducts = useDataStore((state) => state.getFeaturedProducts);
  const products = useDataStore((state) => state.products);
  const loadProducts = useDataStore((state) => state.loadProducts);

  useEffect(() => {
    void loadProducts({ page: 1, limit: 24, sort: 'newest' });
  }, [loadProducts]);

  const categories = getCategoryTree().slice(0, 6);
  const featured = getFeaturedProducts().slice(0, 8);
  const newest = [...products]
    .filter((product) => product.status === 'active')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  return (
    <div className="pb-16">
      <HeroSection />
      <FeatureStrip />

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <SectionHeading eyebrow="Browse by need" title="Shop categories" link="/" />
        <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => <CategoryCard key={category._id} category={category} />)}
        </div>
      </section>

      <section className="border-y border-paper-300 bg-paper-100">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
          <SectionHeading eyebrow="Handpicked" title="Popular right now" link="/?sort=rating" />
          <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => <ProductCard key={product._id} product={product} variant="featured" />)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <SectionHeading eyebrow="Just arrived" title="New to the store" link="/?sort=newest" />
        <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {newest.map((product) => <ProductCard key={product._id} product={product} />)}
        </div>
      </section>

      <RecentlyViewed products={products} />
    </div>
  );
}
