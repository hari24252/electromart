import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useDataStore } from '@/stores/dataStore';
import { ProductImagePlaceholder } from '@/components/common/ProductImagePlaceholder';

export function HeroSection() {
  const featured = useDataStore((state) => state.getFeaturedProducts());
  const heroProduct = featured[0];
  const category = !heroProduct
    ? 'electronics'
    : typeof heroProduct.category === 'string'
      ? heroProduct.category
      : heroProduct.category.name;

  return (
    <section className="border-b border-paper-300 bg-paper-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:py-20">
        <div className="max-w-xl">
          <p className="mb-4 text-sm font-semibold text-brand-600">A simpler way to shop technology</p>
          <h1 className="text-4xl font-bold tracking-[-0.04em] text-ink-900 sm:text-5xl lg:text-6xl">
            Everyday tech, chosen well.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-ink-600">
            Thoughtful products for work, play, and home — with straightforward prices, clear details, and support when you need it.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/" className="glass-button rounded-lg px-5 py-3 text-sm">
              Shop all products <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/?sort=popular" className="glass-button-secondary rounded-lg px-5 py-3 text-sm">
              See current offers
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-ink-600">
            <span className="flex items-center gap-2"><Truck className="h-4 w-4 text-teal-600" /> Free delivery over ₹999</span>
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-teal-600" /> Genuine product warranty</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md rounded-3xl border border-paper-300 bg-white p-4 shadow-glass">
          <div className="absolute right-5 top-5 rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold text-accent-800">
            Featured pick
          </div>
          <ProductImagePlaceholder
            src={heroProduct?.images?.[0] || heroProduct?.thumbnail}
            alt={heroProduct?.name || 'Featured ElectroMart product'}
            category={category}
            className="h-[330px] w-full rounded-2xl object-cover sm:h-[390px]"
          />
          {heroProduct && (
            <div className="px-2 pb-2 pt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">{heroProduct.brand}</p>
              <p className="mt-1 text-lg font-semibold text-ink-900">{heroProduct.name}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
