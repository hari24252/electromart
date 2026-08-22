import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { ArrowRight, TrendingUp, Zap, Flame, Sparkles, ShieldCheck } from 'lucide-react';
import { HeroSection } from '@/components/store/HeroSection';
import { FeatureStrip } from '@/components/store/FeatureStrip';
import { BrandStrip } from '@/components/store/BrandStrip';
import { CategoryCard } from '@/components/store/CategoryCard';
import { ProductCard } from '@/components/store/ProductCard';
import { Carousel } from '@/components/store/Carousel';
import { FlashDealTimer } from '@/components/store/FlashDealTimer';
import { useDataStore } from '@/stores/dataStore';
import { RecentlyViewed } from '@/components/store/RecentlyViewed';

export function HomePage() {
  const getCategoryTree = useDataStore((s) => s.getCategoryTree);
  const getFeaturedProducts = useDataStore((s) => s.getFeaturedProducts);
  const products = useDataStore((s) => s.products);
  const loadProducts = useDataStore((s) => s.loadProducts);

  useEffect(() => {
    void loadProducts({ page: 1, limit: 48, sort: 'newest' });
  }, [loadProducts]);

  const tree = getCategoryTree();
  const featured = getFeaturedProducts();
  const topDeals = [...products]
    .filter((p) => p.discountPrice && p.discountPrice < p.price && p.status === 'active')
    .sort((a, b) => {
      const discA = (a.price - (a.discountPrice ?? a.price)) / a.price;
      const discB = (b.price - (b.discountPrice ?? b.price)) / b.price;
      return discB - discA;
    })
    .slice(0, 10);

  const newArrivals = [...products]
    .filter((p) => p.status === 'active')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-12 pb-16">
      <HeroSection />
      <FeatureStrip />
      <RecentlyViewed products={products} />

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold font-display gradient-text flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-400" />
              Explore Hardware Categories
            </h2>
            <p className="text-xs text-slate-400">Curated next-generation tech for enthusiasts and pros</p>
          </div>
          <Link
            to="/catalog"
            className="flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
          >
            View Catalogue <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {tree.slice(0, 6).map((cat) => (
            <CategoryCard key={cat._id} category={cat} />
          ))}
        </div>
      </section>

      <BrandStrip />

      {/* Hot Deals & Countdown Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="glass-panel p-6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-white">Hot Flash Deals</h2>
              <p className="text-xs text-slate-400">Limited quantities remaining at promotional pricing</p>
            </div>
          </div>

          <FlashDealTimer />
        </div>

        <Carousel>
          {topDeals.map((p) => (
            <div key={p._id} className="flex-shrink-0 w-[240px] sm:w-[280px]">
              <ProductCard product={p} />
            </div>
          ))}
        </Carousel>
      </section>

      {/* Featured Products Showcase */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold font-display gradient-text">Featured Innovations</h2>
            <p className="text-xs text-slate-400">Hand-picked by our hardware engineers</p>
          </div>
          <Link
            to="/catalog?sort=rating"
            className="flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
          >
            See Top Rated <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featured.slice(0, 8).map((p) => (
            <ProductCard key={p._id} product={p} variant="featured" />
          ))}
        </div>
      </section>

      {/* Dynamic CTA Banner Banners */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative overflow-hidden glass-panel p-8 min-h-[220px] flex flex-col justify-center border-brand-500/40 group">
            <div className="absolute -right-16 -top-16 w-48 h-48 bg-brand-500/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
            <div className="relative space-y-3">
              <span className="px-3 py-1 bg-brand-500/20 text-brand-300 text-xs font-mono font-bold rounded-full border border-brand-500/30 inline-flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> PRO PERFORMANCE
              </span>
              <h3 className="text-2xl font-bold text-white font-display">Workstation & Creator Sale</h3>
              <p className="text-xs text-slate-300 max-w-sm">Save up to 35% on high-end laptops, ultra-wide monitors, and GPUs.</p>
              <Link
                to="/catalog?sort=discount"
                className="inline-flex items-center gap-2 glass-button text-xs font-semibold px-5 py-2.5 shadow-lg shadow-brand-600/25"
              >
                Claim Discounts <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden glass-panel p-8 min-h-[220px] flex flex-col justify-center border-purple-500/40 group">
            <div className="absolute -right-16 -top-16 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
            <div className="relative space-y-3">
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-mono font-bold rounded-full border border-purple-500/30 inline-flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> NEW DROPS
              </span>
              <h3 className="text-2xl font-bold text-white font-display">Next-Gen Audio & Gaming</h3>
              <p className="text-xs text-slate-300 max-w-sm">Immersive spatial audio headsets and precision optical mechanical keyboards.</p>
              <Link
                to="/catalog?sort=newest"
                className="inline-flex items-center gap-2 glass-button-secondary text-xs font-semibold px-5 py-2.5"
              >
                Explore Drops <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals Carousel */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold font-display gradient-text">New Arrivals</h2>
            <p className="text-xs text-slate-400">Fresh off the factory line</p>
          </div>
          <Link to="/catalog?sort=newest" className="text-xs font-semibold text-brand-400 hover:text-brand-300">
            View All Drops
          </Link>
        </div>

        <Carousel>
          {newArrivals.map((p) => (
            <div key={p._id} className="flex-shrink-0 w-[240px] sm:w-[280px]">
              <ProductCard product={p} />
            </div>
          ))}
        </Carousel>
      </section>
    </div>
  );
}

