import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Sparkles, Zap, Percent, ShieldCheck } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-ink-900 via-ink-800 to-brand-900">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px] items-center">

          {/* Left — main hero copy */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-ink-900 via-ink-800 to-brand-800 p-8 md:p-12 text-white border border-white/10">
            <div className="absolute right-0 top-0 h-full w-2/5 bg-gradient-to-l from-brand-700/20 to-transparent pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-brand-600/10 blur-3xl pointer-events-none" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 border border-amber-400/30 px-3 py-1 mb-5">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span className="text-xs font-bold text-amber-200 uppercase tracking-wider">Best Prices Guaranteed</span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl leading-[1.1] text-white">
                Upgrade<br />
                <span className="text-amber-300">Your Tech</span>
              </h1>
              <p className="mt-4 text-lg text-ink-200 max-w-xl">
                Discover the latest smartphones, laptops and gadgets — all in one place with the best deals.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/catalog"
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-7 py-3.5 text-sm font-bold text-ink-900 hover:bg-amber-300 transition-colors shadow-lg"
                >
                  Shop Now <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/catalog?sort=newest"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 backdrop-blur px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
                >
                  New Arrivals
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-6">
                <div className="flex items-center gap-2 text-sm text-ink-300">
                  <Percent className="h-4 w-4 text-amber-300 shrink-0" />
                  <span>Up to 70% off</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-ink-300">
                  <Truck className="h-4 w-4 text-teal-300 shrink-0" />
                  <span>Free delivery above ₹999</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-ink-300">
                  <ShieldCheck className="h-4 w-4 text-sky-300 shrink-0" />
                  <span>Genuine warranty</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right — category quick links */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Smartphones', slug: 'smartphones', emoji: '📱', color: 'from-sky-500/20 to-sky-600/10 border-sky-500/20 hover:border-sky-400/40', text: 'text-sky-200' },
              { label: 'Laptops', slug: 'laptops', emoji: '💻', color: 'from-violet-500/20 to-violet-600/10 border-violet-500/20 hover:border-violet-400/40', text: 'text-violet-200' },
              { label: 'Audio', slug: 'audio', emoji: '🎧', color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20 hover:border-emerald-400/40', text: 'text-emerald-200' },
              { label: 'Gaming', slug: 'gaming', emoji: '🎮', color: 'from-rose-500/20 to-rose-600/10 border-rose-500/20 hover:border-rose-400/40', text: 'text-rose-200' },
              { label: 'Wearables', slug: 'wearables', emoji: '⌚', color: 'from-teal-500/20 to-teal-600/10 border-teal-500/20 hover:border-teal-400/40', text: 'text-teal-200' },
              { label: 'Cameras', slug: 'cameras', emoji: '📷', color: 'from-amber-500/20 to-amber-600/10 border-amber-500/20 hover:border-amber-400/40', text: 'text-amber-200' },
            ].map((cat) => (
              <Link
                key={cat.slug}
                to={`/catalog?category=${cat.slug}`}
                className={`group relative overflow-hidden rounded-xl border bg-gradient-to-br ${cat.color} p-4 text-left transition-all hover:scale-[1.02] hover:shadow-lg`}
              >
                <span className="text-2xl block mb-1.5">{cat.emoji}</span>
                <p className={`text-sm font-bold ${cat.text}`}>{cat.label}</p>
                <ArrowRight className="absolute bottom-3 right-3 h-3.5 w-3.5 text-white/30 group-hover:text-white/70 transition-colors" />
              </Link>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
