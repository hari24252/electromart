import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Truck, Shield, Tag, Sparkles } from 'lucide-react';
import { useDataStore } from '@/stores/dataStore';
import { ProductImagePlaceholder } from '@/components/common/ProductImagePlaceholder';

export function HeroSection() {
  const featured = useDataStore((s) => s.getFeaturedProducts());
  const heroProduct = featured[0];
  const categoryName = heroProduct ? (typeof heroProduct.category === 'string' ? heroProduct.category : heroProduct.category?.name) : 'laptops';

  return (
    <section className="relative pt-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Glass Hero */}
          <div className="lg:col-span-2 relative overflow-hidden glass-panel border-brand-500/30 p-8 md:p-12 min-h-[420px] flex items-center group">
            <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl group-hover:bg-brand-500/30 transition-all duration-700" />
            <div className="absolute top-1/2 right-4 -translate-y-1/2 w-72 md:w-80 hidden md:block opacity-90 group-hover:scale-105 transition-transform duration-500">
              <ProductImagePlaceholder
                src={heroProduct?.images?.[0] || heroProduct?.thumbnail}
                alt={heroProduct?.name || 'Flagship Hardware'}
                category={categoryName}
                className="w-full h-72 object-cover rounded-2xl border border-slate-700/80 shadow-2xl"
              />
            </div>

            <div className="relative z-10 max-w-lg space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/40 text-xs font-mono font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> NEXT-GEN TECH STOREFRONT
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-display leading-[1.1] text-white">
                Hardware That <br />
                <span className="gradient-brand-text">Defies Limits</span>
              </h1>

              <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-md">
                Experience ultra-fast computing, high-fidelity spatial audio, and cinema-grade displays.
                Factory direct prices with 2-year full warranty.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  to="/catalog"
                  className="glass-button text-sm font-semibold px-6 py-3 shadow-lg shadow-brand-600/25"
                >
                  Explore Catalogue <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/catalog?sort=discount"
                  className="glass-button-secondary text-sm font-semibold px-6 py-3"
                >
                  <Tag className="w-4 h-4 text-amber-400" /> Flash Discounts
                </Link>
              </div>
            </div>
          </div>

          {/* Side Banner Cards */}
          <div className="grid gap-6">
            <div className="relative overflow-hidden glass-panel p-6 border-cyan-500/30 flex flex-col justify-between group">
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
              <div className="relative space-y-2">
                <div className="p-3 w-fit rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white font-display">Express Worldwide Shipping</h3>
                <p className="text-xs text-slate-300">Free 2-day priority dispatch on orders over $150</p>
              </div>
              <Link to="/catalog" className="relative mt-4 flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300">
                Learn Shipping Guarantee <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="relative overflow-hidden glass-panel p-6 border-purple-500/30 flex flex-col justify-between group">
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
              <div className="relative space-y-2">
                <div className="p-3 w-fit rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white font-display">2-Year Full Protection</h3>
                <p className="text-xs text-slate-300">Comprehensive hardware repair and instant replacement guarantee</p>
              </div>
              <Link to="/catalog" className="relative mt-4 flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300">
                Explore Coverage <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

