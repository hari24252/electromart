import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import {
  ArrowRight, Flame, TrendingUp, Clock, Star, ShoppingBag, Zap,
  Headphones, Monitor, Gamepad2, Camera, Watch, Home as HomeIcon,
  Smartphone, Tv, Keyboard, Volume2, PackageOpen,
} from 'lucide-react';
import { HeroSection } from '@/components/store/HeroSection';
import { FeatureStrip } from '@/components/store/FeatureStrip';
import { CategoryCard } from '@/components/store/CategoryCard';
import { ProductCard } from '@/components/store/ProductCard';
import { BrandStrip } from '@/components/store/BrandStrip';
import { Carousel } from '@/components/store/Carousel';
import { ProductRowSkeleton } from '@/components/store/ProductCardSkeleton';
import { useDataStore } from '@/stores/dataStore';
import { RecentlyViewed } from '@/components/store/RecentlyViewed';

const QUICK_CATEGORIES = [
  { icon: Smartphone, label: 'Smartphones', slug: 'smartphones', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-100' },
  { icon: Monitor, label: 'Laptops', slug: 'laptops', bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-100' },
  { icon: Tv, label: 'TVs', slug: 'tvs', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
  { icon: Monitor, label: 'Monitors', slug: 'monitors', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100' },
  { icon: Headphones, label: 'Headphones', slug: 'headphones', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
  { icon: Gamepad2, label: 'Gaming', slug: 'gaming', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100' },
  { icon: Keyboard, label: 'PC Accessories', slug: 'accessories', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100' },
  { icon: Watch, label: 'Wearables', slug: 'wearables', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-100' },
  { icon: Volume2, label: 'Speakers', slug: 'speakers', bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-100' },
  { icon: Camera, label: 'Cameras', slug: 'cameras', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
  { icon: HomeIcon, label: 'Smart Home', slug: 'smart-home', bg: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-100' },
  { icon: Headphones, label: 'Audio', slug: 'audio', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-100' },
];

function SectionHeading({
  eyebrow,
  title,
  link,
  icon: Icon,
}: {
  eyebrow?: string;
  title: string;
  link?: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-5">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div>
          {eyebrow && (
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">{eyebrow}</p>
          )}
          <h2 className="mt-0.5 text-xl font-bold tracking-tight text-ink-900 sm:text-2xl">{title}</h2>
        </div>
      </div>
      {link && (
        <Link
          to={link}
          className="hidden shrink-0 items-center gap-1 rounded-lg border border-paper-300 bg-white px-4 py-2 text-xs font-semibold text-ink-700 hover:border-brand-300 hover:text-brand-600 sm:inline-flex transition-colors"
        >
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

function QuickCategoryTile({ item }: { item: (typeof QUICK_CATEGORIES)[number] }) {
  const Icon = item.icon;
  return (
    <Link
      to={`/catalog?category=${item.slug}`}
      className={`group flex flex-col items-center gap-2 rounded-xl border ${item.border} ${item.bg} p-3 text-center transition-all hover:-translate-y-0.5 hover:shadow-md`}
    >
      <div className={`grid h-11 w-11 place-items-center rounded-xl bg-white shadow-sm ${item.text} transition-transform group-hover:scale-110`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className={`text-xs font-semibold leading-tight ${item.text}`}>{item.label}</p>
    </Link>
  );
}

/** Renders a horizontal grid of product cards; shows skeleton while loading */
function ProductSection({
  products,
  isLoading,
  variant = 'compact',
  count = 6,
}: {
  products: any[];
  isLoading: boolean;
  variant?: 'default' | 'compact' | 'featured';
  count?: number;
}) {
  const cols =
    variant === 'featured'
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      : 'grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';

  if (isLoading) return <ProductRowSkeleton count={count} variant={variant} />;
  if (!products.length) return null;

  return (
    <div className={`grid ${cols} gap-3`}>
      {products.map((product) => (
        <ProductCard key={product._id} product={product} variant={variant} />
      ))}
    </div>
  );
}

/** Empty state shown when the store has zero products at all */
function EmptyStorefront() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <div className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-full bg-brand-50 text-brand-500">
        <PackageOpen className="h-12 w-12 stroke-[1.5]" />
      </div>
      <h2 className="text-2xl font-bold text-ink-900">Products coming soon</h2>
      <p className="mt-3 text-ink-500 leading-relaxed">
        Our store is being stocked right now. Check back shortly — or browse the catalog to see what's already available.
      </p>
      <Link
        to="/catalog"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-ink-900 px-7 py-3.5 text-sm font-semibold text-white hover:bg-ink-800 transition-colors"
      >
        Browse Catalog <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export function HomePage() {
  const getCategoryTree = useDataStore((state) => state.getCategoryTree);
  const getFeaturedProducts = useDataStore((state) => state.getFeaturedProducts);
  const products = useDataStore((state) => state.products);
  const isLoading = useDataStore((state) => state.isLoading);
  const loadProducts = useDataStore((state) => state.loadProducts);

  useEffect(() => {
    void loadProducts({ page: 1, limit: 48, sort: 'newest' });
  }, [loadProducts]);

  const categories = getCategoryTree();

  const activeProducts = products.filter((p) => p.status === 'active');

  // ── Section deduplication ──────────────────────────────────────────────────
  // Each section claims its own products. A product never appears in two rows.
  // Priority order: Featured → Today's Deals → Best Sellers → New Arrivals

  // 1. Featured — only admin-marked isFeatured products
  const featured = getFeaturedProducts(); // already returns isFeatured=true only
  const featuredIds = new Set(featured.map((p) => p._id));

  // 2. Today's Deals — highest discount %, excluding featured
  const discounted = activeProducts
    .filter((p) => !featuredIds.has(p._id) && p.discountPrice != null && p.discountPrice < p.price)
    .sort((a, b) => {
      const aPct = 1 - (a.discountPrice ?? a.price) / a.price;
      const bPct = 1 - (b.discountPrice ?? b.price) / b.price;
      return bPct - aPct;
    })
    .slice(0, 12);
  const discountedIds = new Set(discounted.map((p) => p._id));

  // 3. Best Sellers — top rated, excluding featured + discounted
  const topRated = activeProducts
    .filter((p) => !featuredIds.has(p._id) && !discountedIds.has(p._id) && (p.ratingsCount ?? 0) > 0)
    .sort((a, b) => (b.ratingsAvg ?? 0) - (a.ratingsAvg ?? 0))
    .slice(0, 12);
  const topRatedIds = new Set(topRated.map((p) => p._id));

  // 4. New Arrivals — most recently created, excluding all above
  const newest = activeProducts
    .filter((p) => !featuredIds.has(p._id) && !discountedIds.has(p._id) && !topRatedIds.has(p._id))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 12);

  // If not loading and no products at all → show empty storefront
  const hasProducts = isLoading || products.length > 0;

  return (
    <div className="bg-paper-50">
      <HeroSection />
      <FeatureStrip />

      {/* Quick category pills */}
      <section className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-6 lg:grid-cols-12">
          {QUICK_CATEGORIES.map((item) => (
            <QuickCategoryTile key={item.slug} item={item} />
          ))}
        </div>
      </section>

      {/* If store is empty → placeholder */}
      {!hasProducts && <EmptyStorefront />}

      {hasProducts && (
        <>
          {/* Today's Deals — only show if discounted products exist or loading */}
          {(isLoading || discounted.length > 0) && (
            <section className="border-y border-paper-300 bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50">
              <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
                <SectionHeading eyebrow="Limited Time" title="Today's Deals" link="/catalog?sort=discount" icon={Flame} />
                <ProductSection products={discounted} isLoading={isLoading} variant="compact" count={6} />
              </div>
            </section>
          )}

          {/* Featured Products — only if admin marked products as featured */}
          {(isLoading || featured.length > 0) && (
            <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
              <SectionHeading eyebrow="Handpicked" title="Featured Products" link="/catalog?sort=rating" icon={Star} />
              <ProductSection products={featured} isLoading={isLoading} variant="featured" count={8} />
            </section>
          )}

          {/* Trending / Best Sellers — only if rated products exist */}
          {(isLoading || topRated.length > 0) && (
            <section className="border-y border-paper-300 bg-white">
              <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
                <SectionHeading eyebrow="Best Sellers" title="What Everyone's Buying" link="/catalog?sort=popular" icon={TrendingUp} />
                <ProductSection products={topRated} isLoading={isLoading} variant="compact" count={6} />
              </div>
            </section>
          )}

          {/* New Arrivals carousel */}
          {(isLoading || newest.length > 0) && (
            <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
              <SectionHeading eyebrow="Fresh Stock" title="New Arrivals" link="/catalog?sort=newest" icon={Clock} />
              {isLoading ? (
                <div className="flex gap-3 overflow-hidden pb-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="shrink-0 w-[220px] animate-pulse rounded-xl border border-paper-200 bg-white overflow-hidden"
                    >
                      <div className="aspect-square bg-paper-200" />
                      <div className="p-3 space-y-2">
                        <div className="h-2.5 bg-paper-200 rounded w-1/3" />
                        <div className="h-3.5 bg-paper-100 rounded w-full" />
                        <div className="h-4 bg-paper-200 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Carousel>
                  {newest.map((product) => (
                    <div key={product._id} className="snap-start shrink-0 w-[200px] sm:w-[220px] md:w-[240px]">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </Carousel>
              )}
            </section>
          )}

          {/* Shop by Category — from real DB categories */}
          {(isLoading || categories.length > 0) && (
            <section className="border-t border-paper-300 bg-white">
              <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
                <SectionHeading eyebrow="Browse" title="Shop by Category" link="/catalog" icon={ShoppingBag} />
                {isLoading ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="animate-pulse rounded-xl border border-paper-200 bg-white overflow-hidden">
                        <div className="aspect-square bg-paper-200" />
                        <div className="p-3 space-y-1.5">
                          <div className="h-3.5 bg-paper-200 rounded w-2/3" />
                          <div className="h-2.5 bg-paper-100 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {categories.slice(0, 12).map((category) => (
                      <CategoryCard key={category._id} category={category} />
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Brand strip */}
          <BrandStrip />

          {/* All Products fallback — if no section has products but we're done loading */}
          {!isLoading &&
            discounted.length === 0 &&
            featured.length === 0 &&
            topRated.length === 0 &&
            newest.length === 0 && (
              <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
                <SectionHeading eyebrow="All Products" title="Browse Everything" link="/catalog" icon={ShoppingBag} />
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {activeProducts.slice(0, 12).map((product) => (
                    <ProductCard key={product._id} product={product} variant="compact" />
                  ))}
                </div>
              </section>
            )}
        </>
      )}

      {/* Sign-up CTA banner */}
      <section className="border-t border-paper-300 bg-gradient-to-br from-ink-900 via-ink-800 to-brand-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
          <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 border border-amber-400/30 px-3 py-1 mb-5">
                <Zap className="h-3.5 w-3.5 text-amber-300" />
                <span className="text-xs font-bold text-amber-200 uppercase tracking-wider">Members Only</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl leading-tight">
                Sign up for exclusive early access
              </h2>
              <p className="mt-3 text-base text-ink-300 max-w-lg">
                Be the first to shop new launches, limited editions, and member-only pricing before anyone else.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3.5 text-sm font-bold text-ink-900 hover:bg-amber-300 transition-colors"
                >
                  Create Free Account <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/catalog"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 backdrop-blur px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
                >
                  Browse as Guest
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { title: 'Early Access', sub: '24 hours before launch' },
                { title: 'Extra 10% Off', sub: 'On member deals' },
                { title: 'Free Returns', sub: 'No questions asked' },
                { title: 'Priority Ship', sub: 'Faster delivery' },
              ].map((b) => (
                <div key={b.title} className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-4">
                  <p className="text-sm font-bold text-white">{b.title}</p>
                  <p className="mt-1 text-xs text-ink-400">{b.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <RecentlyViewed products={products} />
    </div>
  );
}
