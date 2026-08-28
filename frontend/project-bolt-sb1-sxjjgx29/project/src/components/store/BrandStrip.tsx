import { Link } from 'react-router-dom';
import { useDataStore } from '@/stores/dataStore';

export function BrandStrip() {
  const brands = useDataStore((s) => s.getBrands());
  const topBrands = brands.slice(0, 12);

  return (
    <div className="bg-white brutal-border-y border-y-2 border-ink-900 py-4 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <p className="text-center text-xs font-bold uppercase tracking-wider text-ink-500 mb-3">
          Trusted Brands We Carry
        </p>
        <div className="flex items-center justify-center gap-6 flex-wrap">
          {topBrands.map((brand) => (
            <Link
              key={brand}
              to={`/catalog?brand=${brand}`}
              className="text-lg font-bold tracking-tight text-ink-700 hover:text-primary-600 transition-colors"
            >
              {brand}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
